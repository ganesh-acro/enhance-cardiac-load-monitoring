import { useState, useEffect } from "react"
import { Search, Activity, ChevronRight, TrendingUp, AlertCircle, AlertTriangle, CheckCircle2, Heart } from "lucide-react"
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

    const getFlag = (acwr) => {
        const val = parseFloat(acwr)
        if (val > 1.3) return { label: 'Overtraining', color: 'bg-red-500/10 text-red-600', icon: AlertCircle }
        if (val < 0.8) return { label: 'Undertraining', color: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle }
        return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 }
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 rounded-3xl border border-border bg-card shadow-sm">
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
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
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
                            className="w-full px-4 py-2 bg-background border border-input rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
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
                        className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-sm tracking-widest py-2 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                </div>

                {/* Main Table Container */}
                <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/30 text-muted-foreground uppercase text-xs font-black tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-6">Athlete</th>
                                    <th className="px-6 py-6 font-mono">ID</th>
                                    <th className="px-6 py-6">Sport</th>
                                    <th className="px-6 py-6">Readiness</th>
                                    <th className="px-6 py-6">Load</th>
                                    <th className="px-6 py-6">ACWR</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((athlete) => {
                                        const flag = getFlag(athlete.acwr)
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
                                                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-lg font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                                                            {athlete.name?.charAt(0)}
                                                        </div>
                                                        <p className="font-black text-foreground group-hover:text-brand-500 transition-colors uppercase tracking-tight text-lg">{athlete.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    {athlete.id}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-secondary/50 text-muted-foreground">
                                                        {staticInfo?.sport || 'Athlete'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                                                                style={{ width: `${athlete.readiness}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-base font-black text-foreground">{athlete.readiness}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-base font-black text-foreground">{athlete.trainingLoad}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className={`h-4 w-4 ${parseFloat(athlete.acwr) > 1.3 ? 'text-red-500' : 'text-emerald-500'}`} />
                                                        <span className="text-base font-black text-foreground">{athlete.acwr.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${flag.color}`}>
                                                        <flag.icon className="h-3.5 w-3.5" />
                                                        {flag.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-all active:scale-90">
                                                        <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
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
        </div>
    )
}
