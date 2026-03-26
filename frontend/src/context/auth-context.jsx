import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { setAuth0TokenGetter } from "../utils/dataService";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Auth0 config from environment
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || "";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || "";
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || "";

const isAuth0Configured = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID && AUTH0_AUDIENCE);

const AuthContext = createContext({
    user: null,
    login: async () => false,
    loginWithAuth0: () => { },
    logout: () => { },
    isLoading: true,
    authProvider: "local",
    isAuth0Available: false,
});

// ── Auth0-enabled inner provider (always calls useAuth0) ────────────────────

function Auth0AuthProviderInner({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authProvider, setAuthProvider] = useState("local");

    const {
        isAuthenticated,
        isLoading: auth0Loading,
        user: auth0User,
        getAccessTokenSilently,
        loginWithRedirect,
        logout: auth0Logout,
    } = useAuth0();

    // Register Auth0 token getter with dataService
    useEffect(() => {
        if (getAccessTokenSilently && authProvider === "auth0") {
            setAuth0TokenGetter(getAccessTokenSilently);
        } else {
            setAuth0TokenGetter(null);
        }
    }, [getAccessTokenSilently, authProvider]);

    // Initialize from Auth0 or localStorage
    useEffect(() => {
        if (auth0Loading) return;

        const init = async () => {
            // Check Auth0 first
            if (isAuthenticated && auth0User) {
                try {
                    const token = await getAccessTokenSilently();
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        setUser({
                            email: profile.email,
                            role: profile.role,
                            name: profile.name,
                        });
                        setAuthProvider("auth0");
                        setIsLoading(false);
                        return;
                    }
                } catch {
                    // Auth0 token didn't work with backend — fall through
                }
            }

            // Fall back to localStorage (legacy auth)
            await initFromLocalStorage(setUser, setAuthProvider);
            setIsLoading(false);
        };

        init();
    }, [isAuthenticated, auth0Loading]);

    const login = useCallback(async (email, password) => {
        return await legacyLogin(email, password, setUser, setAuthProvider);
    }, []);

    const loginWithAuth0 = useCallback(() => {
        loginWithRedirect({
            appState: { returnTo: window.location.pathname },
        });
    }, [loginWithRedirect]);

    const logout = useCallback(async () => {
        if (authProvider === "auth0") {
            auth0Logout({
                logoutParams: { returnTo: window.location.origin + "/login" },
            });
        }
        await legacyLogout();
        clearLocalAuth();
        setUser(null);
        setAuthProvider("local");
    }, [authProvider, auth0Logout]);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithAuth0,
            logout,
            isLoading: isLoading || auth0Loading,
            authProvider,
            isAuth0Available: true,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Legacy-only inner provider (no Auth0 hooks) ─────────────────────────────

function LegacyAuthProviderInner({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authProvider, setAuthProvider] = useState("local");

    useEffect(() => {
        const init = async () => {
            await initFromLocalStorage(setUser, setAuthProvider);
            setIsLoading(false);
        };
        init();
    }, []);

    const login = useCallback(async (email, password) => {
        return await legacyLogin(email, password, setUser, setAuthProvider);
    }, []);

    const logout = useCallback(async () => {
        await legacyLogout();
        clearLocalAuth();
        setUser(null);
        setAuthProvider("local");
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithAuth0: () => { },
            logout,
            isLoading,
            authProvider,
            isAuth0Available: false,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Outer wrapper: conditionally adds Auth0Provider ─────────────────────────

// Auth0 requires a secure origin (HTTPS or localhost).
// If accessed via IP or non-secure origin, skip Auth0 entirely.
const isSecureOrigin = typeof window !== "undefined" && (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]"
);

export function AuthProvider({ children }) {
    if (isAuth0Configured && isSecureOrigin) {
        return (
            <Auth0Provider
                domain={AUTH0_DOMAIN}
                clientId={AUTH0_CLIENT_ID}
                authorizationParams={{
                    redirect_uri: window.location.origin,
                    audience: AUTH0_AUDIENCE,
                }}
                cacheLocation="localstorage"
            >
                <Auth0AuthProviderInner>{children}</Auth0AuthProviderInner>
            </Auth0Provider>
        );
    }

    return <LegacyAuthProviderInner>{children}</LegacyAuthProviderInner>;
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function clearLocalAuth() {
    localStorage.removeItem("enhance_token");
    localStorage.removeItem("enhance_refresh_token");
    localStorage.removeItem("enhance_user");
}

async function initFromLocalStorage(setUser, setAuthProvider) {
    const token = localStorage.getItem("enhance_token");
    const savedUser = localStorage.getItem("enhance_user");
    const refreshToken = localStorage.getItem("enhance_refresh_token");

    if (token && savedUser) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                if (refreshToken) {
                    const refreshed = await silentRefresh(refreshToken);
                    if (refreshed) {
                        setUser(JSON.parse(savedUser));
                        setAuthProvider("local");
                    } else {
                        clearLocalAuth();
                    }
                } else {
                    clearLocalAuth();
                }
            } else {
                setUser(JSON.parse(savedUser));
                setAuthProvider("local");
            }
        } catch {
            clearLocalAuth();
        }
    }
}

async function legacyLogin(email, password, setUser, setAuthProvider) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const { access_token, refresh_token } = await res.json();
    const payload = JSON.parse(atob(access_token.split(".")[1]));
    const userData = { email: payload.email, role: payload.role };

    localStorage.setItem("enhance_token", access_token);
    localStorage.setItem("enhance_refresh_token", refresh_token);
    localStorage.setItem("enhance_user", JSON.stringify(userData));
    setUser(userData);
    setAuthProvider("local");
    return true;
}

async function legacyLogout() {
    const token = localStorage.getItem("enhance_token");
    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { /* ignore */ }
    }
}

async function silentRefresh(refreshToken) {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        localStorage.setItem("enhance_token", data.access_token);
        localStorage.setItem("enhance_refresh_token", data.refresh_token);
        return true;
    } catch {
        return false;
    }
}

export const useAuth = () => useContext(AuthContext);
