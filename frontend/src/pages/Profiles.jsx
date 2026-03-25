import { useState, useEffect, useMemo } from "react"
import { Search, Activity, ChevronRight, AlertCircle, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { fetchTeamSummary } from "../utils/dataService"

export default function Profiles() {
    const navigate = useNavigate()
    const [teamData, setTeamData] = useState([])
    const [athletesList, setAthletesList] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        id: "",
        sport: "",
        search: ""
    })
    const [activeFilters, setActiveFilters] = useState({
        id: "",
        sport: "",
        search: ""
    })

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const summaryData = await fetchTeamSummary();
                setTeamData(summaryData)
                setAthletesList(summaryData)   // same list used for sport/id filter dropdowns
            } catch (error) {
                console.error("Error loading profiles data:", error);
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const FlagIcon = ({ fill }) => (
        <svg width="20" height="20" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M42 8 C42 8, 42 488, 42 504" stroke={fill} strokeWidth="48" strokeLinecap="round" />
            <path d="M66 40 C120 20, 200 0, 280 40 C360 80, 440 60, 480 40 L480 260 C440 280, 360 300, 280 260 C200 220, 120 240, 66 260 Z" fill={fill} />
        </svg>
    )

    const getReadinessBadge = (status) => {
        if (status === "READY") return { label: "Ready", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40", icon: CheckCircle2, flagColor: "#22c55e" }
        if (status === "PARTIALLY READY") return { label: "Partial", color: "bg-amber-500/30 text-amber-700 dark:text-amber-400 border border-amber-500/40", icon: AlertTriangle, flagColor: "#eab308" }
        if (status === "NOT READY") return { label: "Not Ready", color: "bg-red-500/30 text-red-700 dark:text-red-400 border border-red-500/40", icon: AlertCircle, flagColor: "#ef4444" }
        return { label: "N/A", color: "bg-muted text-muted-foreground border border-border", icon: Activity, flagColor: "#94a3b8" }
    }

    const getTrainingLoadBadge = (flag) => {
        if (flag === "Low") return { label: "Low", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40", flagColor: "#22c55e" }
        if (flag === "Moderate") return { label: "Moderate", color: "bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40", flagColor: "#eab308" }
        if (flag === "High") return { label: "High", color: "bg-orange-500/30 text-orange-700 dark:text-orange-400 border border-orange-500/40", flagColor: "#ef4444" }
        if (flag === "Very High") return { label: "Very High", color: "bg-red-500/30 text-red-700 dark:text-red-400 border border-red-500/40", flagColor: "#ef4444" }
        return { label: "N/A", color: "bg-muted text-muted-foreground border border-border", flagColor: "#94a3b8" }
    }

    const getExertionBadge = (level) => {
        const map = {
            "Minimal": { color: "bg-slate-500/30 text-slate-700 dark:text-slate-400 border border-slate-500/40", flagColor: "#22c55e" },
            "Low": { color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40", flagColor: "#22c55e" },
            "Moderate": { color: "bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40", flagColor: "#eab308" },
            "High": { color: "bg-orange-500/30 text-orange-700 dark:text-orange-400 border border-orange-500/40", flagColor: "#ef4444" },
            "Peak": { color: "bg-red-500/30 text-red-700 dark:text-red-400 border border-red-500/40", flagColor: "#ef4444" },
        }
        const entry = map[level] || { color: "bg-muted text-muted-foreground border border-border", flagColor: "#94a3b8" }
        return { label: level || "N/A", ...entry }
    }

    const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' })

    const READINESS_ORDER = { "READY": 0, "PARTIALLY READY": 1, "NOT READY": 2 }
    const EXERTION_ORDER = { "Minimal": 0, "Low": 1, "Moderate": 2, "High": 3, "Peak": 4 }
    const TRAINING_LOAD_ORDER = { "Low": 0, "Moderate": 1, "High": 2, "Very High": 3 }

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const SortArrow = ({ field }) => {
        if (sortConfig.field !== field) return null
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-3 w-3 inline ml-1" />
            : <ArrowDown className="h-3 w-3 inline ml-1" />
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleSearch = () => {
        setActiveFilters(filters)
    }

    const filteredData = teamData.filter(athlete => {
        // Find matching athlete static info to get sport
        const staticInfo = athletesList.find(a => a.id === athlete.id) ||
            athletesList.find(a => a.name === athlete.name);

        const matchesSearch = activeFilters.search ? athlete.name.toLowerCase().includes(activeFilters.search.toLowerCase()) : true
        const matchesID = activeFilters.id ? athlete.id.toLowerCase().includes(activeFilters.id.toLowerCase()) : true

        // Multi-event support: check if the selected sport is any part of the athlete's sport string
        const matchesSport = activeFilters.sport
            ? (staticInfo?.sport?.toLowerCase().includes(activeFilters.sport.toLowerCase()))
            : true

        return matchesSearch && matchesID && matchesSport
    })

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const { field, direction } = sortConfig
            let valA, valB

            if (field === 'readiness_status') {
                valA = READINESS_ORDER[a.readiness_status] ?? 99
                valB = READINESS_ORDER[b.readiness_status] ?? 99
            } else if (field === 'exertion_level') {
                valA = EXERTION_ORDER[a.exertion_level] ?? 99
                valB = EXERTION_ORDER[b.exertion_level] ?? 99
            } else if (field === 'training_load_flag') {
                valA = TRAINING_LOAD_ORDER[a.training_load_flag] ?? 99
                valB = TRAINING_LOAD_ORDER[b.training_load_flag] ?? 99
            } else {
                valA = a[field] ?? ''
                valB = b[field] ?? ''
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
            }
            return direction === 'asc' ? valA - valB : valB - valA
        })
    }, [filteredData, sortConfig])

    // Dynamically extract unique sports/events from the athletes data
    const sportOptions = Array.from(new Set(
        athletesList.flatMap(a => a.sport ? a.sport.split(',').map(s => s.trim()) : [])
    )).sort()

    const handleAthleteSelect = (athlete) => {
        // Navigate to dashboard with athlete ID as state or query param
        navigate("/dashboard", { state: { selectedAthleteId: athlete.id } })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">Syncing Profiles...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <main className="container mx-auto pt-32 pb-12 shadow-none">

                {/* Header Container */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                        Athlete <span className="text-brand-500">profiles</span>
                    </h1>

                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-border bg-card shadow-sm">
                    {/* Name/General Search */}
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
                        />
                    </div>

                    {/* ID Filter */}
                    <div className="relative group">
                        <input
                            type="text"
                            name="id"
                            placeholder="Filter by ID..."
                            value={filters.id}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
                        />
                    </div>

                    {/* Sport Filter */}
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500">
                            <Activity className="h-4 w-4" />
                        </div>
                        <select
                            name="sport"
                            value={filters.sport}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer font-bold"
                        >
                            <option value="">All Sports</option>
                            {sportOptions.map(sport => (
                                <option key={sport} value={sport}>{sport}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px] font-black">
                            ▼
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-sm tracking-widest py-2 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                </div>

                {/* Main Table Container */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/30 text-muted-foreground uppercase text-xs font-black tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort('name')}>
                                        Athlete <SortArrow field="name" />
                                    </th>
                                    <th className="px-6 py-6 font-mono cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort('id')}>
                                        ID <SortArrow field="id" />
                                    </th>
                                    <th className="px-6 py-6">Sport</th>
                                    <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort('readiness_status')}>
                                        Readiness <SortArrow field="readiness_status" />
                                    </th>
                                    <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort('exertion_level')}>
                                        Exertion <SortArrow field="exertion_level" />
                                    </th>
                                    <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort('training_load_flag')}>
                                        Training Load <SortArrow field="training_load_flag" />
                                    </th>
                                    <th className="px-8 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {sortedData.length > 0 ? (
                                    sortedData.map((athlete) => {
                                        const readinessBadge = getReadinessBadge(athlete.readiness_status)
                                        const trainingLoadBadge = getTrainingLoadBadge(athlete.training_load_flag)
                                        const exertionBadge = getExertionBadge(athlete.exertion_level)
                                        const staticInfo = athletesList.find(a => a.id === athlete.id) ||
                                            athletesList.find(a => a.name === athlete.name);

                                        return (
                                            <tr
                                                key={athlete.id}
                                                className="group hover:bg-secondary/20 transition-all cursor-pointer"
                                                onClick={() => handleAthleteSelect(athlete)}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 text-lg font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
                                                            {athlete.name?.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-foreground group-hover:text-brand-500 transition-colors tracking-tight text-lg">{athlete.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                                    {athlete.id}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-base font-medium text-foreground">
                                                        {staticInfo?.sport || 'Athlete'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider ${readinessBadge.color}`}>
                                                            {readinessBadge.label}
                                                        </span>
                                                        <FlagIcon fill={readinessBadge.flagColor} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider ${exertionBadge.color}`}>
                                                            {exertionBadge.label}
                                                        </span>
                                                        <FlagIcon fill={exertionBadge.flagColor} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider ${trainingLoadBadge.color}`}>
                                                            {trainingLoadBadge.label}
                                                        </span>
                                                        <FlagIcon fill={trainingLoadBadge.flagColor} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-colors">
                                                        <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
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
        </div>
    )
}
