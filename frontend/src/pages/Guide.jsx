import { motion } from "framer-motion"
import { Users, FileText, BarChart3, LayoutDashboard, UserCircle, ShieldCheck, Info } from "lucide-react"
import analyticsIcon from "../assets/icons/analytics-icon.png"
import dashboardIcon from "../assets/icons/dashboard-icon.png"

const pages = [
    {
        title: "Profiles",
        icon: <Users className="h-6 w-6" />,
        description: "View and search all athletes in your roster. Filter by sport, sort by readiness or training load, and click any athlete to jump to their detailed analytics.",
        features: [
            "Search by name or athlete ID",
            "Filter by sport with multi-select",
            "Sortable columns (readiness, exertion, training load)",
            "Status badges showing athlete readiness at a glance",
        ],
    },
    {
        title: "Group Dashboard",
        iconImg: dashboardIcon,
        description: "Team-wide metrics overview. Compare training and readiness metrics across all athletes in card or table view.",
        features: [
            "Training tab: load, intensity, movement, VO2, energy, EPOC",
            "Readiness tab: ACWR, avg HR, RMSSD, recovery beats, resting HR",
            "Toggle between graph and table for each metric",
            "Zoom into any metric for detailed athlete breakdown",
        ],
    },
    {
        title: "Analytics",
        iconImg: analyticsIcon,
        description: "Deep-dive into individual athlete performance. Select an athlete and date range to explore their training, readiness, and compare across time periods.",
        features: [
            "Overview: summary stats and key charts",
            "Training: load trends, intensity, and session breakdown",
            "Readiness: recovery metrics and autonomic indicators",
            "Comparison: side-by-side athlete or time-period analysis",
        ],
    },
    {
        title: "Reports",
        icon: <FileText className="h-6 w-6" />,
        description: "View session history as a timeline. Generate and download PDF reports for any session, organized by date.",
        features: [
            "Select an athlete to see their session timeline",
            "Sessions grouped by date with type indicators",
            "Key metrics shown per session (HR, load, RMSSD, ACWR)",
            "View or download detailed PDF reports",
        ],
    },
    {
        title: "User Management",
        icon: <ShieldCheck className="h-6 w-6" />,
        description: "Admin-only panel for managing users. Create accounts, assign roles, and manage coach-athlete relationships.",
        features: [
            "Create new users (sends Auth0 verification email)",
            "Assign roles: admin, coach, or athlete",
            "Reset passwords via Auth0",
            "Assign athletes to coaches for filtered access",
        ],
        adminOnly: true,
    },
    {
        title: "Profile",
        icon: <UserCircle className="h-6 w-6" />,
        description: "Your personal settings. View your account details, assigned athletes, and login history.",
        features: [
            "View name, email, role, and join date",
            "See assigned athletes (for coaches)",
            "Login history with IP, browser, and timestamp",
        ],
    },
]

export default function Guide() {
    return (
        <div className="min-h-screen bg-background pt-24">
            {/* Header Banner */}
            <header className="bg-brand-500 h-48 md:h-64 flex items-center justify-center relative overflow-hidden">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white text-5xl md:text-7xl font-black tracking-[0.1em] z-10"
                >
                    App Guide
                </motion.h1>
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
            </header>

            <main className="container mx-auto py-16 px-4">
                <p className="text-center text-lg text-muted-foreground font-medium max-w-2xl mx-auto mb-16">
                    A quick overview of every section in Enhance and what you can do in each one.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {pages.map((page, i) => (
                        <motion.div
                            key={page.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                                    {page.icon ? page.icon : (
                                        <img src={page.iconImg} alt="" className="h-6 w-6 brand-orange-filter" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{page.title}</h2>
                                {page.adminOnly && (
                                    <span className="ml-auto text-xs font-bold bg-brand-500/10 text-brand-500 px-2 py-1 rounded-md">
                                        Admin only
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5">
                                {page.description}
                            </p>
                            <ul className="space-y-2">
                                {page.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-foreground/70 font-medium">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    )
}
