import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { setAuth0TokenGetter } from "../utils/dataService";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || "";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || "";
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || "";

const AuthContext = createContext({
    user: null,
    loginWithAuth0: () => { },
    logout: () => { },
    isLoading: true,
});

function AuthProviderInner({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const {
        isAuthenticated,
        isLoading: auth0Loading,
        user: auth0User,
        getAccessTokenSilently,
        loginWithRedirect,
        logout: auth0Logout,
    } = useAuth0();

    useEffect(() => {
        setAuth0TokenGetter(getAccessTokenSilently || null);
    }, [getAccessTokenSilently]);

    useEffect(() => {
        if (auth0Loading) return;

        const init = async () => {
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
                    }
                } catch {
                    // Token didn't work with backend
                }
            }
            setIsLoading(false);
        };

        init();
    }, [isAuthenticated, auth0Loading]);

    const loginWithAuth0 = useCallback(() => {
        loginWithRedirect({
            appState: { returnTo: window.location.pathname },
        });
    }, [loginWithRedirect]);

    const logout = useCallback(() => {
        auth0Logout({
            logoutParams: { returnTo: window.location.origin + "/login" },
        });
        setUser(null);
    }, [auth0Logout]);

    return (
        <AuthContext.Provider value={{
            user,
            loginWithAuth0,
            logout,
            isLoading: isLoading || auth0Loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }) {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_AUDIENCE) {
        throw new Error("Auth0 environment variables (VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE) are required.");
    }

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
            <AuthProviderInner>{children}</AuthProviderInner>
        </Auth0Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
