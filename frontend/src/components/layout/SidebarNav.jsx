import { useNavigate, useLocation } from "react-router-dom"
import { Users, Activity, BarChart3, FileText, Home, ShieldCheck } from "lucide-react"
import { useAuth } from "../../context/auth-context"

// Custom Icons
import analyticsIcon from "../../assets/icons/analytics-icon.png"
import dashboardIcon from "../../assets/icons/dashboard-icon.png"

export function SidebarNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    const navItems = [
        { icon: Home, route: "/", label: "Home" },
        { icon: Users, route: "/profiles", label: "Profiles" },
        { icon: dashboardIcon, route: "/sessions", label: "Group dashboard" },
        { icon: analyticsIcon, route: "/dashboard", label: "Performance analytics" },
        { icon: FileText, route: "/reports", label: "Reports" },
        ...(user?.role === "admin" ? [{ icon: ShieldCheck, route: "/users", label: "User Management" }] : []),
    ]

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] flex items-center h-[400px]">
            {/* Sidebar Content */}
            <div className="flex flex-col gap-4 p-2 rounded-lg border border-border bg-card shadow-md transition-colors">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.route
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.route)}
                            className={`p-3 rounded-lg transition-colors group relative overflow-hidden ${isActive
                                ? "bg-brand-500 text-white shadow-sm"
                                : "hover:bg-secondary text-foreground/70 hover:text-brand-600"
                                }`}
                            title={item.label}
                        >
                            {typeof item.icon === 'string' ? (
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    className={`h-6 w-6 object-contain transition-all duration-300 ${isActive
                                        ? "brightness-0 invert h-6 w-6"
                                        : "opacity-70 group-hover:opacity-100 group-hover:brand-orange-filter dark:brightness-0 dark:invert"
                                        }`}
                                />
                            ) : (
                                <item.icon className="h-6 w-6" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                {item.label}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
