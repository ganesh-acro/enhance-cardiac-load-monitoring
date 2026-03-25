import { useState, useRef, useEffect } from "react"
import { UserCircle, LogOut, ChevronDown, Info, Phone, Sun, Moon, Settings, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth-context"
import { useTheme } from "../theme-provider"
import { EnhanceLogo } from "./EnhanceLogo"

export function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { resolvedTheme, setTheme } = useTheme()
    const theme = resolvedTheme

    const moreRef = useRef(null)
    const profileRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreRef.current && !moreRef.current.contains(event.target)) {
                setIsMoreOpen(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsProfileOpen(false);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <header className="absolute top-0 left-0 z-50 w-full pt-6 pb-4 px-6 md:px-10 flex items-center justify-between font-sans pointer-events-none">
            {/* Left: Branding */}
            <div
                className="flex items-center pointer-events-auto cursor-pointer ml-12"
                onClick={() => navigate("/")}
            >
                <EnhanceLogo height={64} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary transition-colors shadow-sm group"
                    title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                    {theme === 'light' ? (
                        <Moon className="h-5 w-5 text-foreground/70 group-hover:text-brand-600 transition-colors" />
                    ) : (
                        <Sun className="h-5 w-5 text-foreground/70 group-hover:text-brand-400 transition-colors" />
                    )}
                </button>

                {/* More Dropdown */}
                <div className="relative" ref={moreRef}>
                    <button
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        className="flex items-center gap-2 px-4 py-2 h-11 text-sm font-semibold text-foreground/80 rounded-lg border border-border bg-card hover:bg-secondary transition-colors shadow-sm"
                    >
                        <span>More</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMoreOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in zoom-in duration-200 z-50">
                            <button
                                onClick={() => { navigate("/about"); setIsMoreOpen(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                            >
                                <Info className="h-4 w-4" />
                                About Us
                            </button>
                            <button
                                onClick={() => {
                                    if (window.location.pathname === '/') {
                                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        navigate("/");
                                        setTimeout(() => {
                                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }
                                    setIsMoreOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                            >
                                <Phone className="h-4 w-4" />
                                Contact Us
                            </button>
                        </div>
                    )}
                </div>

                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition-colors shadow-sm group overflow-hidden"
                        >
                            <UserCircle className="h-7 w-7 text-brand-600" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in zoom-in duration-200 z-50">
                                <button
                                    onClick={() => { navigate("/profile"); setIsProfileOpen(false); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => { setIsProfileOpen(false); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </button>
                                <div className="my-1 border-t border-border" />
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity shadow-lg shadow-black/10"
                    >
                        Log in
                    </button>
                )}
            </div>
        </header>
    )
}
