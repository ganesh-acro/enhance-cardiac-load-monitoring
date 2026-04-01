import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Activity, Dumbbell, ClipboardCheck, Calendar, Info } from 'lucide-react';
import { MonthlyLoadCombinedChart, MonthlyZoneStackChart, MonthlyHRAvgRangeChart, MonthlyACWRChart, MonthlyMovementComboChart } from './FeatureCharts';

const CHART_INFO = {
    loadHrv: {
        title: "Load & HRV",
        desc: "Monthly training load (bars) overlaid with HRV (RMSSD) trend (line). Rising load alongside stable or improving HRV indicates good adaptation."
    },
    zones: {
        title: "Zone Distribution",
        desc: "Stacked monthly breakdown of time spent in each heart rate zone (Z0–Z5). Reflects training intensity balance across the period."
    },
    heartRate: {
        title: "Heart Rate Stats",
        desc: "Monthly average, minimum, and maximum heart rate. Useful for spotting cardiovascular drift or recovery trends over time."
    },
    acwr: {
        title: "ACWR Trend",
        desc: "Acute:Chronic Workload Ratio over time. Values 0.8–1.3 are optimal; above 1.3 signals elevated injury risk from spike in acute load."
    },
    movement: {
        title: "Movement Intensity & Load",
        desc: "Combined view of movement-based load and intensity metrics per month. Tracks physical output beyond heart rate alone."
    },
};

function ChartInfoPopup({ chartKey }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const info = CHART_INFO[chartKey];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <span ref={ref} className="relative inline-flex items-center ml-1.5" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="text-muted-foreground/40 hover:text-brand-500 transition-colors"
            >
                <Info className="h-3.5 w-3.5" />
            </button>
            {open && (
                <div className="absolute top-6 left-0 z-50 w-72 bg-card border border-border rounded-xl shadow-lg p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-2">{info.title}</p>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{info.desc}</p>
                </div>
            )}
        </span>
    );
}

export const OverviewTab = ({ summaryData, athleteSummary, primaryChartData }) => {
    if (!summaryData || !athleteSummary) return null;

    // Exertion & Training Load from summaryData
    const exertionLevel = summaryData.exertion_level || null;
    const trainingLoadFlag = summaryData.training_load_flag || null;

    const exertionColors = {
        "Low": { bg: "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]", circle: "bg-emerald-500 text-white" },
        "Moderate": { bg: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]", circle: "bg-yellow-500 text-white" },
        "High": { bg: "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]", circle: "bg-red-500 text-white" },
    };
    const exertionStyle = exertionColors[exertionLevel] || { bg: "bg-muted/20 border-border/60", circle: "bg-muted text-muted-foreground" };

    const tlColors = {
        "Low": { bg: "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]", circle: "bg-emerald-500 text-white" },
        "Moderate": { bg: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]", circle: "bg-yellow-500 text-white" },
        "High": { bg: "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]", circle: "bg-red-500 text-white" },
    };
    const tlStyle = tlColors[trainingLoadFlag] || { bg: "bg-muted/20 border-border/60", circle: "bg-muted text-muted-foreground" };

    // Metric Cards (lower section)

    // Get latest Average HR and RMSSD
    const latestAvgHr = primaryChartData?.hr?.length > 0
        ? primaryChartData.hr[primaryChartData.hr.length - 1].avg_hr
        : 0;

    const latestRmssd = primaryChartData?.hrv?.length > 0
        ? primaryChartData.hrv[primaryChartData.hrv.length - 1].rmssd
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 mt-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* LEFT COLUMN: SIDEBAR */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                    {/* 1. Athlete Profile Card — Compact */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-md">

                        {/* Label */}
                        <p className="text-xs font-semibold text-brand-500 tracking-[0.2em] mb-3 uppercase">Athlete profile</p>

                        {/* Name (left) + Height / Weight / Sport (right, with border separator) */}
                        <div className="flex items-start">
                            <div className="flex-1 min-w-0 pr-6">
                                <h1 className="text-3xl lg:text-4xl font-medium text-foreground tracking-tight leading-tight">
                                    {athleteSummary.name}
                                </h1>
                                <div className="mt-2 inline-flex items-center px-3 py-1 bg-muted/50 rounded-full border border-border/40">
                                    <p className="text-sm font-bold text-muted-foreground/80 tracking-widest">{athleteSummary.age}{athleteSummary.gender ? ` / ${athleteSummary.gender}` : ''}</p>
                                </div>
                            </div>

                            <div className="shrink-0 pl-6 border-l border-border/40 flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Height</p>
                                        <p className="text-lg font-black text-foreground">{athleteSummary.height}<span className="text-xs ml-0.5 font-bold text-muted-foreground">cm</span></p>
                                    </div>
                                    <div className="w-px h-8 bg-border/50" />
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Weight</p>
                                        <p className="text-lg font-black text-foreground">{athleteSummary.weight}<span className="text-xs ml-0.5 font-bold text-muted-foreground">kg</span></p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">{athleteSummary.sport}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border/30 my-4" />

                        {/* Sessions: Total (left) | Training + Readiness (right) */}
                        <div className="flex items-stretch divide-x divide-border/40 gap-0">
                            <div className="flex-1 pr-4">
                                <p className="text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase mb-1">Total sessions</p>
                                <p className="text-4xl font-normal text-foreground">{athleteSummary.totalSessions}</p>
                            </div>
                            <div className="flex-1 pl-4 flex flex-col justify-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Dumbbell className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-brand-500 tracking-[0.15em] uppercase">Training</p>
                                        <p className="text-xl font-normal text-foreground">{athleteSummary.trainingSessions}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-500 tracking-[0.15em] uppercase">Readiness</p>
                                        <p className="text-xl font-normal text-foreground">{athleteSummary.readinessSessions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date range — compact inline */}
                        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            <span className="text-sm font-bold text-foreground tracking-wide">{athleteSummary.sessionStart || 'N/A'}</span>
                            <span className="text-muted-foreground font-medium text-sm">→</span>
                            <span className="text-sm font-bold text-foreground tracking-wide">{athleteSummary.sessionEnd || 'N/A'}</span>
                        </div>
                    </div>

                    {/* 2. Load & HRV Chart (Sidebar) */}
                    <div className="p-4 lg:p-6 rounded-xl lg:rounded-xl bg-card border border-border shadow-md flex-1">
                        <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                            Load & HRV<ChartInfoPopup chartKey="loadHrv" />
                        </h5>
                        <MonthlyLoadCombinedChart data={primaryChartData?.monthly} />
                    </div>
                </div>

                {/* RIGHT COLUMN: GRAPHS & FLAGS */}
                <div className="lg:col-span-8 space-y-6 lg:space-y-8">

                    {/* Top Row: Flags & Vitals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Card 1: Exertion Level */}
                        <div className={`p-4 lg:p-5 xl:p-8 rounded-2xl lg:rounded-xl border transition-all duration-700 flex items-center justify-between relative overflow-hidden ${exertionStyle.bg}`}>
                            <div className="relative z-10 min-w-0">
                                <p className="text-[10px] lg:text-xs font-normal tracking-widest uppercase mb-1 opacity-70 dark:text-white">Exertion</p>
                                <p className="text-xl lg:text-2xl xl:text-4xl font-normal text-foreground tracking-tight leading-none truncate">
                                    {exertionLevel || 'N/A'}
                                </p>
                            </div>
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center shrink-0 relative z-10 ${exertionStyle.circle}`}>
                                <Activity className="h-5 w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8" />
                            </div>
                        </div>

                        {/* Card 2: Training Load Tier */}
                        <div className={`p-4 lg:p-5 xl:p-8 rounded-2xl lg:rounded-xl border transition-all duration-700 flex items-center justify-between relative overflow-hidden ${tlStyle.bg}`}>
                            <div className="relative z-10 min-w-0">
                                <p className="text-[10px] lg:text-xs font-normal tracking-widest uppercase mb-1 opacity-70 dark:text-white">Training Load</p>
                                <p className="text-xl lg:text-2xl xl:text-4xl font-normal text-foreground tracking-tight leading-none truncate">
                                    {trainingLoadFlag || 'N/A'}
                                </p>
                            </div>
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center shrink-0 relative z-10 ${tlStyle.circle}`}>
                                <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                            </div>
                        </div>

                        {/* Card 3: Latest Vitals (New Location) */}
                        <div className="sm:col-span-2 lg:col-span-1 p-5 lg:p-8 rounded-2xl lg:rounded-xl bg-card border border-border shadow-md flex flex-col justify-center">
                            <div className="flex items-center justify-around gap-4 h-full">
                                {/* Avg HR */}
                                <div className="text-center">
                                    <p className="text-2xl lg:text-4xl font-normal text-foreground tracking-tighter">{latestAvgHr}</p>
                                    <p className="text-xs font-normal text-muted-foreground dark:text-white uppercase tracking-wider mt-1">Average HR</p>
                                </div>
                                <div className="w-px h-12 bg-border/60"></div>
                                {/* RMSSD */}
                                <div className="text-center">
                                    <p className="text-2xl lg:text-4xl font-normal text-foreground tracking-tighter">{latestRmssd}</p>
                                    <p className="text-xs font-normal text-muted-foreground dark:text-white uppercase tracking-wider mt-1">RMSSD (HRV)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Monthly Charts Grid (Mixed) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {/* 1. Zone Split (Wide) */}
                        <div className="lg:col-span-2 xl:col-span-2 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Zone distribution<ChartInfoPopup chartKey="zones" />
                            </h5>
                            <MonthlyZoneStackChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 2. HR Range (Compact) */}
                        <div className="lg:col-span-2 xl:col-span-1 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Heart rate stats<ChartInfoPopup chartKey="heartRate" />
                            </h5>
                            <MonthlyHRAvgRangeChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 3. ACWR Trend (Full Width) */}
                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                ACWR trend<ChartInfoPopup chartKey="acwr" />
                            </h5>
                            <MonthlyACWRChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 4. Movement Data (Full Width) */}
                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Movement intensity & load<ChartInfoPopup chartKey="movement" />
                            </h5>
                            <MonthlyMovementComboChart data={primaryChartData?.monthly} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
