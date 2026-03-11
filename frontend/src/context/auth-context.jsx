import { createContext, useContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext({
    user: null,
    login: async () => false,
    register: async () => ({ ok: false }),
    logout: () => { },
    isLoading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Restore session from stored token on page load
        const token = localStorage.getItem("enhance_token");
        const savedUser = localStorage.getItem("enhance_user");
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return false;

        const { access_token } = await res.json();
        // Decode the JWT payload to extract user metadata (no signature check needed client-side)
        const payload = JSON.parse(atob(access_token.split(".")[1]));
        const userData = { email: payload.email, role: payload.role };

        localStorage.setItem("enhance_token", access_token);
        localStorage.setItem("enhance_user", JSON.stringify(userData));
        setUser(userData);
        return true;
    };

    const register = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) return { ok: true };
            const data = await res.json();
            return { ok: false, detail: data.detail || "Registration failed." };
        } catch {
            return { ok: false, detail: "Network error. Please try again." };
        }
    };

    const logout = () => {
        localStorage.removeItem("enhance_token");
        localStorage.removeItem("enhance_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
