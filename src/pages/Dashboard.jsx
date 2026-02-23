import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { OverviewTab } from "../components/dashboard/OverviewTab"
import { TrainingLoadTab } from "../components/dashboard/TrainingLoadTab"
import { ReadinessTab } from "../components/dashboard/ReadinessTab"
import { AnalyticsOverview } from "../components/dashboard/AnalyticsOverview"
import { ComparisonTab } from "../components/dashboard/ComparisonTab"
import { athletes } from "../data/dashboardData"
import { filterByDateRange, getAthleteSummary } from "../utils/csvParser"
import {
    prepareHeartRateData,
    prepareTrainingData,
    prepareHRVData,
    prepareOxygenDebtData,
    prepareEnergyData,
    prepareMovementData,
    prepareOxygenConsumptionData,
    prepareZoneDistData,
    prepareRecoveryData,
    prepareACWRData,
    prepareTrainingTrendsData,
    prepareSummaryData,
    prepareMonthlyStats,
    prepareWeeklyStats
} from "../utils/chartDataPrep"
import { parseISO } from "date-fns"
import { fetchAthleteData, fetchTeamSummary } from "../utils/dataService"

export default function Dashboard() {
    const location = useLocation()
    const [selectedAthlete, setSelectedAthlete] = useState(null)
    const [teamSummaryData, setTeamSummaryData] = useState([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [csvData, setCsvData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch team summary data on mount
    useEffect(() => {
        const loadTeamData = async () => {
            setLoading(true);
            const data = await fetchTeamSummary();
            setTeamSummaryData(data);
            setLoading(false);
        };
        loadTeamData();
    }, []);

    // Reset athlete selection when navigating to base dashboard route
    useEffect(() => {
        if (location.pathname === "/dashboard") {
            // Check for athlete injection from Profiles page
            if (location.state?.selectedAthleteId) {
                const target = athletes.find(a => a.id === location.state.selectedAthleteId);
                if (target) {
                    setSelectedAthlete(target);
                    // Clear state to avoid persistent selection on reloads/back
                    window.history.replaceState({}, document.title);
                }
            } else {
                // Clicking "Performance Analytics" in sidebar or navigating to /dashboard directly
                // should always reset to the overview unless a specific athlete state is passed
                setSelectedAthlete(null);
                setActiveTab("overview");
            }
        }
    }, [location.key, location.pathname, location.state]);

    // Comparison State
    const [compareType, setCompareType] = useState("athlete");
    const [secondaryAthlete, setSecondaryAthlete] = useState(null);
    const [secondaryStartDate, setSecondaryStartDate] = useState("");
    const [secondaryEndDate, setSecondaryEndDate] = useState("");
    const [secondaryCsvData, setSecondaryCsvData] = useState([]);
    const [secondaryFilteredData, setSecondaryFilteredData] = useState([]);

    // Load CSV data when athlete changes
    useEffect(() => {
        if (!selectedAthlete) return;
        const loadAthleteData = async () => {
            setLoading(true);
            const data = await fetchAthleteData(selectedAthlete);
            setCsvData(data);
            setFilteredData(data);
            setLoading(false);
        };
        loadAthleteData();
    }, [selectedAthlete]);

    // Filter primary data
    useEffect(() => {
        if (!csvData.length) return;
        if (startDate && endDate) {
            setFilteredData(filterByDateRange(csvData, parseISO(startDate), parseISO(endDate)));
        } else {
            setFilteredData(csvData);
        }
    }, [startDate, endDate, csvData]);

    // Load Secondary Data
    useEffect(() => {
        if (!secondaryAthlete || compareType !== "athlete") {
            setSecondaryCsvData([]);
            setSecondaryFilteredData([]);
            return;
        }
        const loadSecondaryData = async () => {
            const data = await fetchAthleteData(secondaryAthlete);
            setSecondaryCsvData(data);
            setSecondaryFilteredData(data);
        };
        loadSecondaryData();
    }, [secondaryAthlete, compareType]);

    // Filter Secondary Data
    useEffect(() => {
        if (compareType === "athlete") {
            if (startDate && endDate && secondaryCsvData.length) {
                setSecondaryFilteredData(filterByDateRange(secondaryCsvData, parseISO(startDate), parseISO(endDate)));
            } else {
                setSecondaryFilteredData(secondaryCsvData);
            }
        } else if (compareType === "period") {
            if (secondaryStartDate && secondaryEndDate && csvData.length) {
                setSecondaryFilteredData(filterByDateRange(csvData, parseISO(secondaryStartDate), parseISO(secondaryEndDate)));
            } else {
                setSecondaryFilteredData([]);
            }
        }
    }, [startDate, endDate, secondaryStartDate, secondaryEndDate, secondaryCsvData, compareType, csvData]);

    // Prepare chart data helper
    const prepareData = (data) => ({
        hr: prepareHeartRateData(data),
        training: prepareTrainingData(data),
        hrv: prepareHRVData(data),
        oxygen_debt: prepareOxygenDebtData(data),
        energy: prepareEnergyData(data),
        movement: prepareMovementData(data),
        oxygen_consumption: prepareOxygenConsumptionData(data),
        zones: prepareZoneDistData(data),
        recovery: prepareRecoveryData(data),
        acwr: prepareACWRData(data),
        trainingTrends: prepareTrainingTrendsData(data),
        summary: prepareSummaryData(data),
        monthly: prepareMonthlyStats(data),
        weekly: prepareWeeklyStats(data)
    });

    const primaryChartData = prepareData(filteredData);
    const primarySummary = getAthleteSummary(filteredData, selectedAthlete);
    const secondaryChartData = secondaryFilteredData.length ? prepareData(secondaryFilteredData) : null;

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
            <main className="container mx-auto pt-32 pb-12">

                {/* Page Title & Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            Performance <span className="text-brand-500">analytics</span>
                        </h1>
                    </div>

                    {/* {selectedAthlete && (
                        // Comparison button moved to Comparison Tab
                    )} */}
                </div>

                {/* Dashboard Navigation & Filters */}
                <DashboardHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedAthlete={selectedAthlete}
                    athletes={athletes}
                    onAthleteChange={setSelectedAthlete}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                {/* Main Content Area */}
                <div className="mt-6 pt-10 px-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted-foreground font-black text-xs uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!selectedAthlete ? (
                                <AnalyticsOverview teamData={teamSummaryData} onAthleteSelect={(athlete) => setSelectedAthlete(athletes.find(a => a.id === athlete.id))} />
                            ) : (
                                <>
                                    {activeTab === "overview" && (
                                        <OverviewTab
                                            summaryData={primaryChartData.summary}
                                            athleteSummary={primarySummary}
                                            primaryChartData={primaryChartData}
                                            secondaryChartData={secondaryChartData}
                                            primaryLabel={selectedAthlete?.name}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                    )}
                                    {activeTab === "training" && (
                                        <TrainingLoadTab
                                            primaryChartData={primaryChartData}
                                            primaryLabel={selectedAthlete?.name}
                                        />
                                    )}
                                    {activeTab === "readiness" && (
                                        <ReadinessTab
                                            primaryChartData={primaryChartData}
                                            primaryLabel={selectedAthlete?.name}
                                        />
                                    )}
                                    {activeTab === "comparison" && (
                                        <ComparisonTab
                                            athletes={athletes}
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
                                                setSecondaryAthlete(null);
                                                setSecondaryStartDate("");
                                                setSecondaryEndDate("");
                                                setSecondaryCsvData([]);
                                                setSecondaryFilteredData([]);
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
}
