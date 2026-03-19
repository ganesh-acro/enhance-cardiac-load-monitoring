import { useState, useEffect } from "react"
import { User, Clock, Users, Bell, Monitor, Globe, ChevronRight, Ruler, Weight, Calendar, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { fetchMyProfile, fetchMyLoginHistory, clearMyLoginHistory } from "../utils/dataService"

const TABS = [
    { key: "profile", label: "Profile", icon: User },
    { key: "athletes", label: "Athletes", icon: Users },
    { key: "login-history", label: "Login History", icon: Clock },
    { key: "notifications", label: "Notifications", icon: Bell },
]

// Parse user-agent string into a readable browser/OS label
function parseBrowser(ua) {
    if (!ua || ua === "unknown") return "Unknown browser"
    let browser = "Browser"
    let os = ""
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome"
    else if (ua.includes("Edg")) browser = "Edge"
    else if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"
    if (ua.includes("Windows")) os = "Windows"
    else if (ua.includes("Mac")) os = "macOS"
    else if (ua.includes("Linux")) os = "Linux"
    else if (ua.includes("Android")) os = "Android"
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"
    return os ? `${browser} (${os})` : browser
}

// Group login entries by date
function groupByDate(entries) {
    const groups = {}
    for (const entry of entries) {
        const dt = new Date(entry.logged_in_at)
        const dateKey = dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(entry)
    }
    return groups
}

export default function UserProfile() {
    const [activeTab, setActiveTab] = useState("profile")
    const [profile, setProfile] = useState(null)
    const [loginHistory, setLoginHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [profileData, historyData] = await Promise.all([
                    fetchMyProfile(),
                    fetchMyLoginHistory(),
                ])
                setProfile(profileData)
                setLoginHistory(historyData)
            } catch (err) {
                console.error("Failed to load profile:", err)
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">Loading profile...</p>
            </div>
        )
    }

    const initials = profile?.name
        ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?"

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <main className="container mx-auto pt-32 pb-12 max-w-3xl">

                {/* Avatar + Name */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center text-brand-500 text-2xl font-black mb-4">
                        {initials}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{profile?.name}</h1>
                    <p className="text-muted-foreground text-sm">{profile?.email}</p>
                </div>

                {/* Tab Bar */}
                <div className="flex justify-center gap-2 mb-8 border-b border-border">
                    {TABS.map(tab => {
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                                    activeTab === tab.key
                                        ? "text-brand-500 border-brand-500"
                                        : "text-muted-foreground border-transparent hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-300">

                    {/* ── Profile Tab ── */}
                    {activeTab === "profile" && (
                        <div className="space-y-6 max-w-md mx-auto">
                            <ProfileField label="First name" value={profile?.name?.split(" ")[0] || ""} />
                            <ProfileField label="Last name" value={profile?.name?.split(" ").slice(1).join(" ") || ""} />
                            <ProfileField label="Email" value={profile?.email || ""} />
                            <ProfileField label="Role" value={profile?.role || ""} />
                            <ProfileField
                                label="Joined"
                                value={profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                    : "N/A"
                                }
                            />
                        </div>
                    )}

                    {/* ── Login History Tab ── */}
                    {activeTab === "login-history" && (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            {loginHistory.length > 0 && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            try {
                                                await clearMyLoginHistory()
                                                setLoginHistory([])
                                            } catch (err) {
                                                console.error("Failed to clear history:", err)
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all active:scale-95"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear history
                                    </button>
                                </div>
                            )}
                            {loginHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <Clock className="h-10 w-10 opacity-20 mb-3" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No login history yet</p>
                                </div>
                            ) : (
                                Object.entries(groupByDate(loginHistory)).map(([dateLabel, entries]) => (
                                    <div key={dateLabel}>
                                        <p className="text-sm font-bold text-foreground mb-3">{dateLabel}</p>
                                        <div className="space-y-3">
                                            {entries.map(entry => {
                                                const dt = new Date(entry.logged_in_at)
                                                const time = dt.toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
                                                return (
                                                    <div
                                                        key={entry.id}
                                                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {entry.ip_address}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <Monitor className="h-3 w-3 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {parseBrowser(entry.user_agent)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{time} ({tz})</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Athletes Tab ── */}
                    {activeTab === "athletes" && (
                        <div className="max-w-2xl mx-auto">
                            {(!profile?.assigned_athletes || profile.assigned_athletes.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <Users className="h-10 w-10 opacity-20 mb-3" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No athletes assigned</p>
                                </div>
                            ) : profile?.role === "admin" ? (
                                /* Admin view: simple name list */
                                <div className="space-y-2">
                                    {profile.assigned_athletes.map(athlete => (
                                        <div
                                            key={athlete.id}
                                            onClick={() => navigate("/dashboard", { state: { selectedAthleteId: athlete.id } })}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm group hover:bg-secondary/20 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-sm font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                                                    {athlete.name?.charAt(0)}
                                                </div>
                                                <p className="font-bold text-foreground group-hover:text-brand-500 transition-colors">{athlete.name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">{athlete.id}</span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Coach view: detailed cards with metadata */
                                <div className="space-y-3">
                                    {profile.assigned_athletes.map(athlete => (
                                        <div
                                            key={athlete.id}
                                            onClick={() => navigate("/dashboard", { state: { selectedAthleteId: athlete.id } })}
                                            className="p-5 rounded-2xl bg-card border border-border shadow-sm group hover:bg-secondary/20 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-lg font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                                                        {athlete.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground group-hover:text-brand-500 transition-colors">{athlete.name}</p>
                                                        <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">{athlete.id}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
                                                <DetailChip icon={Users} label="Sport" value={athlete.sport || "N/A"} />
                                                <DetailChip icon={Calendar} label="Age" value={athlete.age ? `${athlete.age} yrs` : "N/A"} />
                                                <DetailChip icon={Ruler} label="Height" value={athlete.height ? `${athlete.height} cm` : "N/A"} />
                                                <DetailChip icon={Weight} label="Weight" value={athlete.weight ? `${athlete.weight} kg` : "N/A"} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Notifications Tab ── */}
                    {activeTab === "notifications" && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Bell className="h-12 w-12 opacity-20 mb-4" />
                            <p className="text-sm text-center max-w-xs">
                                If you subscribe or are added to dashboard subscriptions or alerts you'll be able to manage those here.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function ProfileField({ label, value }) {
    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
            <div className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground font-medium capitalize">
                {value || "—"}
            </div>
        </div>
    )
}

function DetailChip({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-bold text-foreground">{value}</span>
        </div>
    )
}
