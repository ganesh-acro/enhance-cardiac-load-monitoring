import { createContext, useContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext({
    user: null,
    login: async () => false,
    logout: () => { },
    isLoading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("enhance_token");
            const savedUser = localStorage.getItem("enhance_user");
            const refreshToken = localStorage.getItem("enhance_refresh_token");

            if (token && savedUser) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    if (payload.exp && payload.exp * 1000 < Date.now()) {
                        // Access token expired — try silent refresh
                        if (refreshToken) {
                            const refreshed = await silentRefresh(refreshToken);
                            if (refreshed) {
                                setUser(JSON.parse(savedUser));
                            } else {
                                clearAuth();
                            }
                        } else {
                            clearAuth();
                        }
                    } else {
                        setUser(JSON.parse(savedUser));
                    }
                } catch {
                    clearAuth();
                }
            }
            setIsLoading(false);
        };
        init();
    }, []);

    const login = async (email, password) => {
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
        return true;
    };

    const logout = async () => {
        // Best-effort server-side logout (revoke refresh tokens)
        const token = localStorage.getItem("enhance_token");
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { /* ignore */ }
        clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

function clearAuth() {
    localStorage.removeItem("enhance_token");
    localStorage.removeItem("enhance_refresh_token");
    localStorage.removeItem("enhance_user");
}

async function silentRefresh(refreshToken) {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
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
