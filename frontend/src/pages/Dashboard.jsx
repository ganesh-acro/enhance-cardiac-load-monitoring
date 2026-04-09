import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { OverviewTab } from "../components/dashboard/OverviewTab"
import { TrainingLoadTab } from "../components/dashboard/TrainingLoadTab"
import { ReadinessTab } from "../components/dashboard/ReadinessTab"
import { AnalyticsOverview } from "../components/dashboard/AnalyticsOverview"
import { ComparisonTab } from "../components/dashboard/ComparisonTab"
import {
    fetchAthletes, fetchDashboardOverview,
    fetchAthleteData, fetchComparison
} from "../utils/dataService"

export default function Dashboard() {
    const location = useLocation()
    const [selectedAthlete, setSelectedAthlete] = useState(null)
    const [teamSummaryData, setTeamSummaryData] = useState([])
    const [teamStats, setTeamStats] = useState({})
    const [athletesList, setAthletesList] = useState([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [appliedStartDate, setAppliedStartDate] = useState("")
    const [appliedEndDate, setAppliedEndDate] = useState("")
    const [athletePayload, setAthletePayload] = useState(null)  // { athlete, summary, athleteSummary, charts }
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

    // ---------- Initial load: team overview + athlete registry ----------
    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [overview, list] = await Promise.all([
                    fetchDashboardOverview(),
                    fetchAthletes(),
                ])
                const { athletes, teamStats } = overview
                setTeamSummaryData(athletes)
                setTeamStats(teamStats)
                setAthletesList(list)
            } catch (err) {
                console.error("Dashboard initial load error:", err)
            }
            setLoading(false)
        }
        load()
    }, [])

    // ---------- Navigate to athlete from Profiles page ----------
    useEffect(() => {
        if (location.pathname === "/dashboard") {
            if (location.state?.selectedAthleteId) {
                const target = athletesList.find(a => a.id === location.state.selectedAthleteId)
                if (target) {
                    setSelectedAthlete(target)
                    window.history.replaceState({}, document.title)
                }
            } else {
                setSelectedAthlete(null)
                setActiveTab("overview")
            }
        }
    }, [location.key, location.pathname, location.state, athletesList])

    // ---------- Load athlete chart data when athlete or applied dates change ----------
    useEffect(() => {
        if (!selectedAthlete) return
        const load = async () => {
            setLoading(true)
            try {
                const data = await fetchAthleteData(selectedAthlete, appliedStartDate || null, appliedEndDate || null)
                setAthletePayload(data)
            } catch (err) {
                console.error("Athlete data load error:", err)
            }
            setLoading(false)
        }
        load()
    }, [selectedAthlete, appliedStartDate, appliedEndDate])

    // ---------- Comparison state ----------
    const [compareType, setCompareType] = useState("athlete")
    const [secondaryAthlete, setSecondaryAthlete] = useState(null)
    const [secondaryStartDate, setSecondaryStartDate] = useState("")
    const [secondaryEndDate, setSecondaryEndDate] = useState("")
    const [secondaryPayload, setSecondaryPayload] = useState(null)

    // Load comparison data when secondary athlete or period changes
    useEffect(() => {
        if (!selectedAthlete) return
        if (compareType === "athlete" && !secondaryAthlete) {
            setSecondaryPayload(null)
            return
        }
        if (compareType === "period" && (!secondaryStartDate || !secondaryEndDate)) {
            setSecondaryPayload(null)
            return
        }
        const load = async () => {
            try {
                const opts = compareType === "athlete"
                    ? { targetId: secondaryAthlete.id, startDate: appliedStartDate || null, endDate: appliedEndDate || null }
                    : { secondaryStart: secondaryStartDate, secondaryEnd: secondaryEndDate }
                const data = await fetchComparison(selectedAthlete.id, opts)
                setSecondaryPayload(data)
            } catch (err) {
                console.error("Comparison load error:", err)
                setSecondaryPayload(null)
            }
        }
        load()
    }, [selectedAthlete, compareType, secondaryAthlete, secondaryStartDate, secondaryEndDate, appliedStartDate, appliedEndDate])

    // ---------- Derived ----------
    const primaryChartData = athletePayload?.charts ?? null
    const primarySummary = athletePayload?.summary ?? null
    const athleteSummary = athletePayload?.athleteSummary ?? null
    const secondaryChartData = secondaryPayload ?? null

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
            <main className="container mx-auto pt-32 pb-12">

                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            Performance <span className="text-brand-500">analytics</span>
                        </h1>
                    </div>
                </div>

                <DashboardHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedAthlete={selectedAthlete}
                    athletes={athletesList}
                    onAthleteChange={setSelectedAthlete}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onApplyDates={() => {
                        setAppliedStartDate(startDate)
                        setAppliedEndDate(endDate)
                    }}
                    onResetDates={() => {
                        setStartDate("")
                        setEndDate("")
                        setAppliedStartDate("")
                        setAppliedEndDate("")
                    }}
                />

                <div className="mt-6 pt-10 px-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted-foreground font-black text-xs uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!selectedAthlete ? (
                                <AnalyticsOverview
                                    teamData={teamSummaryData}
                                    teamStats={teamStats}
                                    onAthleteSelect={(a) => setSelectedAthlete(athletesList.find(x => x.id === a.id))}
                                />
                            ) : (
                                <>
                                    {activeTab === "overview" && primaryChartData && (
                                        <OverviewTab
                                            summaryData={primarySummary}
                                            athleteSummary={athleteSummary}
                                            primaryChartData={primaryChartData}
                                            monthlyFlags={athletePayload?.monthlyFlags ?? []}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                    )}
                                    {activeTab === "training" && primaryChartData && (
                                        <TrainingLoadTab
                                            primaryChartData={primaryChartData}
                                            primaryLabel={selectedAthlete?.name}
                                        />
                                    )}
                                    {activeTab === "readiness" && primaryChartData && (
                                        <ReadinessTab
                                            primaryChartData={primaryChartData}
                                            primaryLabel={selectedAthlete?.name}
                                        />
                                    )}
                                    {activeTab === "comparison" && (
                                        <ComparisonTab
                                            athletes={athletesList}
                                            selectedAthlete={selectedAthlete}
                                            compareType={compareType}
                                            setCompareType={setCompareType}
                                            secondaryAthlete={secondaryAthlete}
                                            setSecondaryAthlete={setSecondaryAthlete}
                                            secondaryStartDate={secondaryStartDate}
                                            setSecondaryStartDate={setSecondaryStartDate}
                                            secondaryEndDate={secondaryEndDate}
                                            setSecondaryEndDate={setSecondaryEndDate}
                                            primaryChartData={primaryChartData}
                                            secondaryChartData={secondaryChartData}
                                            resetComparison={() => {
                                                setSecondaryAthlete(null)
                                                setSecondaryStartDate("")
                                                setSecondaryEndDate("")
                                                setSecondaryPayload(null)
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
