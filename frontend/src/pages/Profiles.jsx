import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Activity, ChevronRight, AlertCircle, ArrowUp, ArrowDown, Info, FileStack } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { fetchTeamSummary } from "../utils/dataService"
import { SessionReportModal } from "../components/dashboard/SessionReportModal"

// ... (COL_INFO and other helpers remain the same)

const COL_INFO = {
    recovery: {
        title: "Recovery",
        lines: [
            { label: "Ready", desc: "RMSSD > 50ms, quality ≥ 80%, resting HR normal. Athlete is well recovered." },
            { label: "Partial", desc: "RMSSD 20–50ms or mild HR elevation. Some fatigue present; monitor closely." },
            { label: "Not Ready", desc: "RMSSD < 20ms, quality < 60%, or large 7-day decline. High fatigue — reduce load." },
        ],

    },
    exertion: {
        title: "Exertion",
        lines: [
            { label: "Low (0–40%)", desc: "ACWR < 0.80, low zone 4+5 time. Recovery or aerobic base session." },
            { label: "Moderate (40–70%)", desc: "ACWR 0.80–1.30, balanced intensity. Typical training stimulus." },
            { label: "High (70–100%)", desc: "ACWR > 1.30, high zone 4+5 time or EPOC > 600 kJ. Peak effort — ensure adequate recovery." },
        ],

    },
    trainingLoad: {
        title: "Training Load",
        lines: [
            { label: "Low (< 84 AU)", desc: "Light session. Aerobic or recovery stimulus. Suitable for high-frequency training." },
            { label: "Moderate (84–128 AU)", desc: "Tempo or threshold work. Standard training dose." },
            { label: "High (> 128 AU)", desc: "Hard or peak effort. Requires 48–72h recovery before next hard session." },
        ],

    },
    recent: {
        title: "Recent Sessions",
        lines: [
            { barColor: "bg-brand-500", label: "Training", desc: "Strength, speed, or endurance work." },
            { barColor: "bg-violet-500", label: "Readiness", desc: "Morning HRV / recovery checks." },
        ],

    },
}

function InfoPopup({ colKey }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const info = COL_INFO[colKey]

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    return (
        <span ref={ref} className="relative inline-flex items-center ml-1" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="text-muted-foreground/50 hover:text-brand-500 transition-colors"
            >
                <Info className="h-3 w-3" />
            </button>
            {open && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-72 bg-card dark:bg-card border border-border dark:border-border rounded-xl shadow-lg dark:shadow-black/30 p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-3">{info.title}</p>
                    <div className="space-y-2.5">
                        {info.lines.map((l, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                {l.barColor ? (
                                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                        <span className={`inline-block w-2.5 h-5 rounded-sm ${l.barColor}`} />
                                    </div>
                                ) : null}
                                <div>
                                    <p className="text-xs font-black text-foreground dark:text-foreground">{l.label}</p>
                                    <p className="text-xs text-muted-foreground dark:text-muted-foreground font-medium leading-relaxed">{l.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {info.note && (
                        <p className="mt-3 pt-3 border-t border-border/50 dark:border-border/30 text-[11px] text-muted-foreground/70 dark:text-muted-foreground/60 italic leading-relaxed">{info.note}</p>
                    )}
                </div>
            )}
        </span>
    )
}

const FlagIcon = ({ fill }) => (
    <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M42 8 C42 8, 42 488, 42 504" stroke={fill} strokeWidth="48" strokeLinecap="round" />
        <path d="M66 40 C120 20, 200 0, 280 40 C360 80, 440 60, 480 40 L480 260 C440 280, 360 300, 280 260 C200 220, 120 240, 66 260 Z" fill={fill} />
    </svg>
)

const getRecoveryBadge = (status) => {
    if (status === "READY") return { label: "Ready", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30", flagColor: "#22c55e" }
    if (status === "PARTIALLY READY") return { label: "Partial", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30", flagColor: "#eab308" }
    if (status === "NOT READY") return { label: "Not Ready", color: "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30", flagColor: "#ef4444" }
    return { label: "N/A", color: "bg-muted text-muted-foreground border border-border", flagColor: "#94a3b8" }
}

const getTrainingLoadBadge = (flag) => {
    if (flag === "Low") return { label: "Low", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30", flagColor: "#22c55e" }
    if (flag === "Moderate") return { label: "Moderate", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30", flagColor: "#eab308" }
    if (flag === "High") return { label: "High", color: "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30", flagColor: "#ef4444" }
    return { label: "N/A", color: "bg-muted text-muted-foreground border border-border", flagColor: "#94a3b8" }
}

const getExertionBar = (level) => {
    if (level === "Low") return { pct: 28, label: "Low", color: "bg-emerald-500", trackColor: "bg-emerald-500/15" }
    if (level === "Moderate") return { pct: 62, label: "Moderate", color: "bg-amber-500", trackColor: "bg-amber-500/15" }
    if (level === "High") return { pct: 90, label: "High", color: "bg-red-500", trackColor: "bg-red-500/15" }
    return { pct: 0, label: null, color: "bg-muted", trackColor: "bg-muted/30" }
}

// Mini bar chart for last 5 sessions
const SessionMiniChart = ({ sessions }) => {
    if (!sessions || sessions.length === 0) {
        return <span className="text-xs text-muted-foreground">—</span>
    }

    const maxHr = Math.max(...sessions.map(s => s.avg_hr || 0), 1)

    return (
        <div className="flex items-end gap-1 h-9">
            {sessions.map((s, i) => {
                const height = s.avg_hr ? Math.max(Math.round((s.avg_hr / maxHr) * 100), 10) : 10
                const isReadiness = s.session_type?.toLowerCase().includes("readiness")
                return (
                    <div key={i} className="relative group/bar flex flex-col items-center justify-end h-full">
                        <div
                            className={`w-2 rounded-sm transition-opacity group-hover/bar:opacity-80 ${isReadiness ? "bg-violet-500" : "bg-brand-500"}`}
                            style={{ height: `${height}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-20 pointer-events-none">
                            <div className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap text-center leading-tight">
                                <div>{s.avg_hr ? `${s.avg_hr} bpm` : "N/A"}</div>
                                <div className="text-background/60 font-medium text-[11px]">{s.date}</div>
                            </div>
                            <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-[3px]" />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function Profiles() {
    const navigate = useNavigate()
    const [teamData, setTeamData] = useState([])
    const [athletesList, setAthletesList] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ id: "", sport: "", search: "" })
    const [activeFilters, setActiveFilters] = useState({ id: "", sport: "", search: "" })
    const [sortConfig, setSortConfig] = useState({ field: "name", direction: "asc" })

    // Report Modal State
    const [reportModal, setReportModal] = useState({ open: false, athleteId: null, athleteName: "" })

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const summaryData = await fetchTeamSummary()
                setTeamData(summaryData)
                setAthletesList(summaryData)
            } catch (error) {
                console.error("Error loading profiles data:", error)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const READINESS_ORDER = { "READY": 0, "PARTIALLY READY": 1, "NOT READY": 2 }
    const EXERTION_ORDER = { "Low": 0, "Moderate": 1, "High": 2 }
    const TRAINING_LOAD_ORDER = { "Low": 0, "Moderate": 1, "High": 2 }

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }))
    }

    const SortArrow = ({ field }) => {
        if (sortConfig.field !== field) return null
        return sortConfig.direction === "asc"
            ? <ArrowUp className="h-3 w-3 inline ml-1" />
            : <ArrowDown className="h-3 w-3 inline ml-1" />
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleSearch = () => setActiveFilters(filters)

    const filteredData = teamData.filter(athlete => {
        const staticInfo = athletesList.find(a => a.id === athlete.id) || athletesList.find(a => a.name === athlete.name)
        const matchesSearch = activeFilters.search ? athlete.name.toLowerCase().includes(activeFilters.search.toLowerCase()) : true
        const matchesID = activeFilters.id ? athlete.id.toLowerCase().includes(activeFilters.id.toLowerCase()) : true
        const matchesSport = activeFilters.sport ? (staticInfo?.sport?.toLowerCase().includes(activeFilters.sport.toLowerCase())) : true
        return matchesSearch && matchesID && matchesSport
    })

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const { field, direction } = sortConfig
            let valA, valB
            if (field === "readiness_status") {
                valA = READINESS_ORDER[a.readiness_status] ?? 99
                valB = READINESS_ORDER[b.readiness_status] ?? 99
            } else if (field === "exertion_level") {
                valA = EXERTION_ORDER[a.exertion_level] ?? 99
                valB = EXERTION_ORDER[b.exertion_level] ?? 99
            } else if (field === "training_load_flag") {
                valA = TRAINING_LOAD_ORDER[a.training_load_flag] ?? 99
                valB = TRAINING_LOAD_ORDER[b.training_load_flag] ?? 99
            } else {
                valA = a[field] ?? ""
                valB = b[field] ?? ""
            }
            if (typeof valA === "string" && typeof valB === "string") {
                return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
            }
            return direction === "asc" ? valA - valB : valB - valA
        })
    }, [filteredData, sortConfig])

    const sportOptions = Array.from(new Set(
        athletesList.flatMap(a => a.sport ? a.sport.split(",").map(s => s.trim()) : [])
    )).sort()

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">Syncing Profiles...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <main className="container mx-auto pt-32 pb-12">

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                        Athlete <span className="text-brand-500">profiles</span>
                    </h1>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-border bg-card shadow-sm">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-500" />
                        <input
                            type="text" name="search" placeholder="Search by name..."
                            value={filters.search} onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
                        />
                    </div>
                    <input
                        type="text" name="id" placeholder="Filter by ID..."
                        value={filters.id} onChange={handleFilterChange}
                        className="w-full px-4 py-2 bg-background border border-input rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
                    />
                    <div className="relative group">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-500" />
                        <select
                            name="sport" value={filters.sport} onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer font-bold"
                        >
                            <option value="">All Sports</option>
                            {sportOptions.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px] font-black">▼</span>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-sm tracking-widest py-2 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/30 text-muted-foreground uppercase text-xs font-black tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-5 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("name")}>
                                        Athlete <SortArrow field="name" />
                                    </th>
                                    <th className="px-6 py-5 font-mono cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("id")}>
                                        ID <SortArrow field="id" />
                                    </th>
                                    <th className="px-6 py-5">Sport</th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("readiness_status")}>
                                        <span className="inline-flex items-center gap-0.5">Recovery <SortArrow field="readiness_status" /><InfoPopup colKey="recovery" /></span>
                                    </th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("exertion_level")}>
                                        <span className="inline-flex items-center gap-0.5">Exertion <SortArrow field="exertion_level" /><InfoPopup colKey="exertion" /></span>
                                    </th>
                                    <th className="px-6 py-5 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("training_load_flag")}>
                                        <span className="inline-flex items-center gap-0.5">Training Load <SortArrow field="training_load_flag" /><InfoPopup colKey="trainingLoad" /></span>
                                    </th>
                                    <th className="px-6 py-5"><span className="inline-flex items-center gap-0.5">Recent<InfoPopup colKey="recent" /></span></th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {sortedData.length > 0 ? (
                                    sortedData.map((athlete) => {
                                        const recoveryBadge = getRecoveryBadge(athlete.readiness_status)
                                        const trainingLoadBadge = getTrainingLoadBadge(athlete.training_load_flag)
                                        const exertionBar = getExertionBar(athlete.exertion_level)
                                        const staticInfo = athletesList.find(a => a.id === athlete.id) || athletesList.find(a => a.name === athlete.name)

                                        return (
                                            <tr
                                                key={athlete.id}
                                                className="group hover:bg-secondary/20 transition-all cursor-pointer"
                                                onClick={() => navigate("/dashboard", { state: { selectedAthleteId: athlete.id } })}
                                            >
                                                {/* Athlete */}
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 text-base font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
                                                            {athlete.name?.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-foreground group-hover:text-brand-500 transition-colors tracking-tight">{athlete.name}</p>
                                                    </div>
                                                </td>

                                                {/* ID */}
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    {athlete.id}
                                                </td>

                                                {/* Sport */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-foreground">{staticInfo?.sport || "Athlete"}</span>
                                                </td>

                                                {/* Recovery */}
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${recoveryBadge.color}`}>
                                                            {recoveryBadge.label}
                                                        </span>
                                                        <FlagIcon fill={recoveryBadge.flagColor} />
                                                    </div>
                                                </td>

                                                {/* Exertion — progress bar */}
                                                <td className="px-6 py-4">
                                                    {athlete.exertion_level ? (
                                                        <div className="flex flex-col gap-1.5 w-28">
                                                            <span className="text-xs font-black uppercase tracking-wide" style={{
                                                                color: athlete.exertion_level === "Low" ? "#22c55e" : athlete.exertion_level === "High" ? "#ef4444" : "#eab308"
                                                            }}>
                                                                {athlete.exertion_level}
                                                            </span>
                                                            <div className={`h-1 w-full rounded-full ${exertionBar.trackColor}`}>
                                                                <div
                                                                    className={`h-1 rounded-full transition-all ${exertionBar.color}`}
                                                                    style={{ width: `${exertionBar.pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>

                                                {/* Training Load */}
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${trainingLoadBadge.color}`}>
                                                            {trainingLoadBadge.label}
                                                        </span>
                                                        <FlagIcon fill={trainingLoadBadge.flagColor} />
                                                    </div>
                                                </td>

                                                {/* Last 5 Sessions mini chart */}
                                                <td className="px-6 py-4">
                                                    <SessionMiniChart sessions={athlete.recent_sessions} />
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReportModal({ open: true, athleteId: athlete.id, athleteName: athlete.name });
                                                            }}
                                                            className="h-9 px-3 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-brand-500 hover:bg-brand-500/10 transition-all border border-transparent hover:border-brand-500/20"
                                                        >
                                                            <FileStack className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Report</span>
                                                        </button>
                                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground group-hover:text-brand-500 transition-colors">
                                                            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <AlertCircle className="h-10 w-10 opacity-20" />
                                                <p className="font-bold uppercase tracking-widest text-xs">No matching athletes found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>

            <SessionReportModal
                isOpen={reportModal.open}
                onClose={() => setReportModal({ ...reportModal, open: false })}
                athleteId={reportModal.athleteId}
                athleteName={reportModal.athleteName}
            />
        </div>
    )
}
