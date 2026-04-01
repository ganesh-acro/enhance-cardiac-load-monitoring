import { Users, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { NavigationCard } from "../components/home/NavigationCard"
import { EnhanceLogo } from "../components/common/EnhanceLogo"

// Custom Icons
import analyticsIcon from "../assets/icons/analytics-icon.png"
import dashboardIcon from "../assets/icons/dashboard-icon.png"

export default function Home() {
    const navigate = useNavigate()


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
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            </div>


            {/* Main Content */}
            <div className="relative z-10 w-full">
                <main className="container mx-auto pt-32 pb-12 md:pt-40 md:pb-32 flex flex-col items-center">

                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center gap-8 mb-24 max-w-6xl 3xl:max-w-7xl">
                        <h1 className="text-5xl md:text-7xl 2xl:text-8xl 3xl:text-9xl font-extrabold tracking-tighter text-foreground leading-[1.05]">
                            Cardiac load <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">
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

                {/* Footer */}
                <footer className="relative z-10 w-full">
                    <div className="bg-black text-white py-6">
                        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/iit-logo.png"
                                    alt="IIT Madras"
                                    className="h-14 w-14 object-contain rounded-full border border-white/10"
                                />
                                <span className="text-lg md:text-xl font-bold tracking-tight">
                                    Technology powered by IIT Madras
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-white/70 font-medium">
                                <span>acroenhance@gmail.com</span>
                                <span>+91 98413 53952</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card border-t border-border py-4">
                        <p className="text-center text-xs text-muted-foreground font-bold tracking-[0.2em]">
                            &copy; 2026 Enhance
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
