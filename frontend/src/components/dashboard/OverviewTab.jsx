import React, { useState } from 'react';
import { TrendingUp, Heart, Activity, Info, Users, Dumbbell, ClipboardCheck, X, Calendar, User } from 'lucide-react';
import { SummarySparkline, HoverTrendChart, MonthlyLoadCombinedChart, MonthlyZoneStackChart, MonthlyHRAvgRangeChart, MonthlyACWRChart, MonthlyMovementComboChart, SimpleGaugeChart } from './FeatureCharts';
import { format, parseISO } from 'date-fns';

export const OverviewTab = ({ summaryData, athleteSummary, primaryChartData, startDate, endDate }) => {
    if (!summaryData || !athleteSummary) return null;

    const [selectedCard, setSelectedCard] = useState(null);

    // Exertion & Training Load from summaryData
    const exertionLevel = summaryData.exertion_level || null;
    const trainingLoadFlag = summaryData.training_load_flag || null;

    const exertionColors = {
        "Minimal": { bg: "bg-gray-500/10 border-gray-500/40", circle: "bg-gray-500 text-white" },
        "Low": { bg: "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]", circle: "bg-emerald-500 text-white" },
        "Moderate": { bg: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]", circle: "bg-yellow-500 text-white" },
        "High": { bg: "bg-orange-500/10 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.2)]", circle: "bg-orange-500 text-white" },
        "Peak": { bg: "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]", circle: "bg-red-500 text-white" },
    };
    const exertionStyle = exertionColors[exertionLevel] || { bg: "bg-muted/20 border-border/60", circle: "bg-muted text-muted-foreground" };

    const tlColors = {
        "Low": { bg: "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]", circle: "bg-emerald-500 text-white" },
        "Moderate": { bg: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]", circle: "bg-yellow-500 text-white" },
        "High": { bg: "bg-orange-500/10 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.2)]", circle: "bg-orange-500 text-white" },
        "Very High": { bg: "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]", circle: "bg-red-500 text-white" },
    };
    const tlStyle = tlColors[trainingLoadFlag] || { bg: "bg-muted/20 border-border/60", circle: "bg-muted text-muted-foreground" };

    // Metric Cards (lower section)

    // Helper to format dates
    const formatDateStr = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return format(parseISO(dateStr), 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    // Get latest Average HR and RMSSD
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

                {/* LEFT COLUMN: SIDEBAR - Spans 4 cols (Wider for Load Chart) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:gap-6">
                    {/* 1. Athlete Profile Card */}
                    <div className="p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md relative overflow-hidden">

                        <div className="relative flex flex-col gap-8">
                            {/* Name & Identity */}
                            <div className="flex flex-col gap-6">
                                <div className="space-y-4 min-w-0">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-brand-500 tracking-[0.2em] mb-2 uppercase">Athlete profile</p>
                                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-foreground tracking-tight leading-[1.1] break-words">
                                            {athleteSummary.name}
                                        </h1>
                                        <div className="w-24 border-t-2 border-brand-500/30 mt-4 mb-2"></div>
                                    </div>
                                    <div className="inline-block px-4 py-1.5 bg-muted/50 rounded-full border border-border/40">
                                        <p className="text-sm lg:text-base font-black text-muted-foreground/80 tracking-widest">{athleteSummary.age} / {athleteSummary.gender}</p>
                                    </div>
                                </div>

                                {/* Metadata Info - Now below name for better fit */}
                                <div className="grid grid-cols-2 gap-4 p-4 lg:p-6 bg-muted/20 rounded-xl border border-border/40">
                                    <div className="flex flex-col gap-1 pr-4 border-r border-border/40">
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Height</p>
                                        <p className="text-xl lg:text-2xl font-black text-foreground tracking-tight">{athleteSummary.height}<span className="text-xs ml-0.5 font-bold text-muted-foreground uppercase">cm</span></p>
                                    </div>
                                    <div className="flex flex-col gap-1 pl-2">
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Weight</p>
                                        <p className="text-xl lg:text-2xl font-black text-foreground tracking-tight">{athleteSummary.weight}<span className="text-xs ml-0.5 font-bold text-muted-foreground uppercase">kg</span></p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-border/40 text-center">
                                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">{athleteSummary.sport}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Session Taken Stat */}
                            <div className="p-4 lg:p-6 bg-muted/30 rounded-2xl lg:rounded-xl border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground tracking-[0.2em] mb-2 uppercase">Total sessions</p>
                                <p className="text-3xl lg:text-5xl font-normal text-foreground">{athleteSummary.totalSessions}</p>
                            </div>

                            {/* Training & Readiness */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 bg-brand-500/[0.03] rounded-2xl border border-brand-500/10 group/stat">
                                    <div className="p-3 bg-brand-500/10 rounded-xl">
                                        <Dumbbell className="h-5 w-5 text-brand-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-brand-500 tracking-[0.2em] uppercase">Training</p>
                                        <p className="text-xl lg:text-2xl font-normal text-foreground">{athleteSummary.trainingSessions}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-emerald-500/[0.03] rounded-2xl border border-emerald-500/10 group/stat">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-500 tracking-[0.2em] uppercase">Readiness</p>
                                        <p className="text-xl lg:text-2xl font-normal text-foreground">{athleteSummary.readinessSessions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates Footer (Vertical) */}
                        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col gap-2 items-center text-center">
                            <span className="text-base font-black text-foreground tracking-wider">{athleteSummary.sessionStart || 'N/A'}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase">to</span>
                            <span className="text-base font-black text-foreground tracking-wider">{athleteSummary.sessionEnd || 'N/A'}</span>
                        </div>
                    </div>

                    {/* 2. Load & HRV Chart (Sidebar) */}
                    <div className="p-4 lg:p-6 rounded-xl lg:rounded-xl bg-card border border-border shadow-md flex-1">
                        <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                            Load & HRV
                        </h5>
                        <MonthlyLoadCombinedChart data={primaryChartData?.monthly} />
                    </div>
                </div>

                {/* RIGHT COLUMN: GRAPHS & FLAGS - Spans 8 cols */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-8">

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
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6">
                                Zone distribution
                            </h5>
                            <MonthlyZoneStackChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 2. HR Range (Compact) */}
                        <div className="lg:col-span-2 xl:col-span-1 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6">
                                Heart rate stats
                            </h5>
                            <MonthlyHRAvgRangeChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 3. ACWR Trend (Full Width) */}
                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6">
                                ACWR trend
                            </h5>
                            <MonthlyACWRChart data={primaryChartData?.monthly} />
                        </div>

                        {/* 4. Movement Data (Full Width) */}
                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl lg:rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6">
                                Movement intensity & load
                            </h5>
                            <MonthlyMovementComboChart data={primaryChartData?.monthly} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
