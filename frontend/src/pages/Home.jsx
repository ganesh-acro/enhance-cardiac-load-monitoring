import { useState } from "react"
import { Users, Activity, BarChart3, FileText, LayoutDashboard, UserCircle, Settings, HelpCircle, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { NavigationCard } from "../components/home/NavigationCard"
import { ThemeToggle } from "../components/common/ThemeToggle"
import Contact from "./Contact"
import { useTheme } from "../components/theme-provider"

// Custom Icons
import analyticsIcon from "../assets/icons/analytics-icon.png"
import dashboardIcon from "../assets/icons/dashboard-icon.png"

export default function Home() {
    const navigate = useNavigate()
    const { resolvedTheme } = useTheme()

    const navItems = [
        {
            title: "Profiles",
            icon: Users,
            route: "/profiles"
        },
        {
            title: "Group Dashboard",
            icon: dashboardIcon,
            route: "/sessions"
        },
        {
            title: "Analytics",
            icon: analyticsIcon,
            route: "/dashboard"
        },
        {
            title: "Reports",
            icon: FileText,
            route: "/reports"
        }
    ]

    return (
        <div className="relative min-h-screen bg-background transition-colors duration-300 selection:bg-brand-100 selection:text-brand-900 overflow-hidden">

            {/* Background Image with Overlay */}
            <div className="absolute top-0 left-0 w-full h-[120vh] z-0 select-none pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80"
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover opacity-100 dark:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 backdrop-blur-[1px]" />
            </div>


            {/* Main Content */}
            <div className="relative z-10 w-full">
                <main className="container mx-auto pt-32 pb-12 md:pt-40 md:pb-32 flex flex-col items-center">

                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center gap-8 mb-24 max-w-6xl 3xl:max-w-7xl">
                        <h1 className="text-5xl md:text-7xl 2xl:text-8xl 3xl:text-9xl font-extrabold tracking-tighter text-foreground leading-[1.05]">
                            Cardiac load <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 animate-gradient">
                                Performance analytics.
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl 2xl:text-3xl 3xl:text-4xl text-muted-foreground w-full max-w-4xl 3xl:max-w-5xl leading-relaxed font-medium">
                            Sports science simplified. Monitor athlete recovery, analyze sessions, and optimize performance.
                        </p>
                    </div>

                    {/* Navigation Grid (Simplified & Centered) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1400px]">
                        {navItems.map((item) => (
                            <NavigationCard
                                key={item.title}
                                title={item.title}
                                icon={item.icon}
                                onClick={() => navigate(item.route)}
                            />
                        ))}
                    </div>
                </main>

                <Contact />

                {/* Footer Section */}
                <footer className="relative z-10 w-full">
                    {/* IIT Madras Bar */}
                    <div className="bg-black text-white py-8">
                        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6">
                            <img
                                src="/iit-logo.png"
                                alt="IIT Madras"
                                className="h-20 w-20 object-contain rounded-full border border-white/10"
                            />
                            <span className="text-2xl md:text-3xl font-bold tracking-tight text-center">
                                Technology powered by IIT Madras
                            </span>
                        </div>
                    </div>

                    {/* Main Footer Content */}
                    <div className="bg-white dark:bg-card/50 backdrop-blur-xl border-t border-border py-16 px-10">
                        <div className="container mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">
                                {/* Left: Branding & Contact */}
                                <div className="flex flex-col items-center md:items-start gap-6">
                                    <img
                                        src={resolvedTheme === 'dark' ? '/logo dark.png' : '/logo bright.png'}
                                        alt="Enhance Health"
                                        className="h-14 w-auto object-contain"
                                    />
                                    <div className="space-y-2 text-sm font-medium text-foreground/70">
                                        <p>+91 98413 53952</p>
                                        <p>acroenhance@gmail.com</p>
                                    </div>
                                </div>

                                {/* Center: Address */}
                                <div className="flex flex-col items-center space-y-3">
                                    <h3 className="text-base font-bold text-foreground">Our Location</h3>
                                    <p className="text-sm text-foreground/60 text-center leading-relaxed font-medium">
                                        ESB 309, IIT Madras,<br />
                                        Chennai-600036, India.
                                    </p>
                                </div>

                                {/* Right: placeholder for future links */}
                                <div />
                            </div>

                            {/* Copyright */}
                            <div className="mt-12 pt-6 border-t border-border/50 text-center">
                                <p className="text-xs text-muted-foreground font-bold tracking-[0.2em]">
                                    &copy; 2026 Enhance
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}
