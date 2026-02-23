import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => null,
})

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "enhance-theme",
    ...props
}) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme
    )
    const [resolvedTheme, setResolvedTheme] = useState("light")

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        const updateResolvedTheme = () => {
            if (theme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? "dark"
                    : "light"
                root.classList.add(systemTheme)
                setResolvedTheme(systemTheme)
            } else {
                root.classList.add(theme)
                setResolvedTheme(theme)
            }
        }

        updateResolvedTheme()

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
            const listener = () => updateResolvedTheme()
            mediaQuery.addEventListener("change", listener)
            return () => mediaQuery.removeEventListener("change", listener)
        }
    }, [theme])

    const value = {
        theme,
        resolvedTheme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
