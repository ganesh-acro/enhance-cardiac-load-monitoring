import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    isLoading: true
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem("enhance_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email, password) => {
        // Official credentials
        if (email === "acroenhance@gmail.com" && password === "Acroenhance@123") {
            const userData = { email, name: "AcroEnhance Admin" };
            setUser(userData);
            localStorage.setItem("enhance_user", JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("enhance_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
