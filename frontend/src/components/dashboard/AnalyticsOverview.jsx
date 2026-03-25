import React, { useEffect, useState } from 'react';
import { ChevronRight, AlertCircle, AlertTriangle, TrendingUp, CheckCircle2, Users, Heart, ShieldAlert, Activity, X } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTheme } from '../theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BRAND_ORANGE, SECONDARY_BLUE,
    getTooltipStyle, getAxisStyle, getLegendStyle, getGridStyle,
    getLineSeriesStyle, getBarItemStyle
} from '../../utils/chartStyles';

// Register ECharts themes directly
// (Themes removed - using chartStyles.js)

function useChartTheme() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return false;
    return resolvedTheme === 'dark';
}

// --- Specialized Chart Components ---

const HeartRateAnalyticsChart = ({ teamData, avgTeamHR }) => {
    const isDark = useChartTheme();

    const axisStyle = getAxisStyle(isDark);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
        },
        grid: getGridStyle({ right: '12%' }),
        xAxis: {
            type: 'category',
            data: teamData.map(a => a.name),
            axisLine: axisStyle.axisLine,
            splitLine: axisStyle.splitLine,
            axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: 35 },
        },
        yAxis: {
            type: 'value',
            name: 'BPM',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLine: axisStyle.axisLine,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Athlete HR',
                data: teamData.map(a => a.avg_hr),
                type: 'line',
                symbolSize: 8,
                ...getLineSeriesStyle(BRAND_ORANGE, true),
            },
            {
                name: 'Group Avg',
                data: teamData.map(() => avgTeamHR),
                type: 'line',
                lineStyle: { type: 'dashed', color: isDark ? '#ffffff' : '#555555', opacity: 0.8, width: 2 },
                symbol: 'none',
                endLabel: {
                    show: true,
                    formatter: 'Average\n{c}',
                    color: isDark ? '#ffffff' : '#555555',
                    fontWeight: 700,
                    fontSize: 11,
                    offset: [10, 0]
                }
            }
        ]
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
        />
    );
};

const ReadinessDonutChart = ({ readyAthletes, partiallyReady, notReady }) => {
    const isDark = useChartTheme();

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark, { trigger: 'item' }),
            formatter: '{b}: {c} athletes ({d}%)',
        },
        legend: {
            bottom: '0',
            left: 'center',
            icon: 'circle',
            ...getLegendStyle(isDark),
        },
        series: [{
            name: 'Readiness',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '42%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 12,
                borderColor: isDark ? '#0f172a' : '#fff',
                borderWidth: 4
            },
            label: { show: false },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: isDark ? '#f8fafc' : '#1e293b',
                    formatter: '{b}\n{d}%'
                }
            },
            data: [
                { value: readyAthletes, name: 'Ready', itemStyle: { color: '#10b981' } },
                { value: partiallyReady, name: 'Partially Ready', itemStyle: { color: '#f59e0b' } },
                { value: notReady, name: 'Not Ready', itemStyle: { color: '#ef4444' } }
            ]
        }]
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
        />
    );
};

const RestingHRChart = ({ teamData, avgRestHR }) => {
    const isDark = useChartTheme();

    const axisStyle = getAxisStyle(isDark);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' }
        },
        grid: getGridStyle({ right: '12%' }),
        xAxis: {
            type: 'category',
            data: teamData.map(a => a.name),
            axisLine: axisStyle.axisLine,
            splitLine: axisStyle.splitLine,
            axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: 35 },
        },
        yAxis: {
            type: 'value',
            axisLine: axisStyle.axisLine,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Resting HR',
                data: teamData.map(a => a.rest_hr),
                type: 'bar',
                itemStyle: getBarItemStyle(BRAND_ORANGE),
                barWidth: '35%',
                emphasis: {
                    itemStyle: { color: '#f5a623' }
                }
            },
            {
                name: 'Group Avg',
                type: 'line',
                data: teamData.map(() => avgRestHR),
                lineStyle: { color: isDark ? '#ffffff' : '#555555', width: 2, type: 'dashed' },
                symbol: 'none',
                endLabel: {
                    show: true,
                    formatter: 'Avg\n{c}',
                    color: isDark ? '#ffffff' : '#555555',
                    fontWeight: 700,
                    fontSize: 11,
                    offset: [10, 0]
                }
            }
        ]
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
        />
    );
};

// 3. StatCard Sub-component
const StatCard = ({ id, title, value, icon: Icon, color, onClick }) => (
    <div
        onClick={onClick}
        className="relative p-5 lg:p-6 rounded-xl bg-card border border-border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 group transition-colors duration-200 hover:border-brand-500/40 hover:shadow-lg cursor-pointer min-h-[140px]"
    >
        {/* Icon Container - Left */}
        <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-slate-500/5 dark:bg-white/5 border border-border shrink-0">
            {typeof Icon === 'string' ? (
                <img src={Icon} alt="" className="h-6 w-6 lg:h-8 lg:w-8 object-contain" />
            ) : (
                <Icon className={`h-6 w-6 lg:h-7 lg:w-7 ${color} opacity-90`} />
            )}
        </div>

        {/* Typography - Label Centered, Value Right */}
        <div className="flex-1 flex items-center justify-center text-center px-1">
            <span className="text-sm lg:text-base font-medium text-muted-foreground leading-tight group-hover:text-foreground transition-colors uppercase tracking-wide">
                {title}
            </span>
        </div>

        <div className="text-right shrink-0">
            <span className="text-4xl lg:text-5xl font-light text-foreground tracking-tighter leading-none block">
                {value}
            </span>
        </div>
    </div>
);

/**
 * High-End Analytics Overview Component
 * Features summary stats and 4 specialized visual widgets
 */
export const AnalyticsOverview = ({ teamData, teamStats = {}, onAthleteSelect }) => {
    const [selectedPopup, setSelectedPopup] = useState(null);

    // All aggregates come pre-computed from the backend via teamStats
    const totalAthletes = teamStats.totalAthletes ?? teamData.length;
    const readyAthletes = teamStats.readyAthletes ?? 0;
    const partiallyReady = teamStats.partiallyReady ?? 0;
    const notReady = teamStats.notReady ?? 0;
    const avgTeamHR = teamStats.avgTeamHR ?? 0;
    const avgRestHR = teamStats.avgRestHR ?? 0;
    const zoneAverages = teamStats.zoneAverages ?? {};

    // Helper to get athletes for popup
    const getPopupAthletes = () => {
        if (!selectedPopup) return [];
        switch (selectedPopup.id) {
            case 'total': return teamData;
            case 'ready': return teamData.filter(a => a.readiness_status === 'READY');
            case 'partially_ready': return teamData.filter(a => a.readiness_status === 'PARTIALLY READY');
            case 'not_ready': return teamData.filter(a => a.readiness_status === 'NOT READY');
            default: return [];
        }
    };

    return (
        <div className="relative">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                    <StatCard
                        id="total"
                        title="Total athletes"
                        value={totalAthletes}
                        icon="/assets/icons/total_athletes.png"
                        color="text-orange-400"
                        glowColor="from-orange-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'total', title: 'Total athletes', color: 'text-orange-400', glowColor: 'from-orange-500/90 to-transparent' })}
                    />
                    <StatCard
                        id="ready"
                        title="Ready"
                        value={readyAthletes}
                        icon="/assets/icons/ready_athletes.png"
                        color="text-emerald-400"
                        glowColor="from-emerald-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'ready', title: 'Ready', color: 'text-emerald-400', glowColor: 'from-emerald-500/90 to-transparent' })}
                    />
                    <StatCard
                        id="partially_ready"
                        title="Partially Ready"
                        value={partiallyReady}
                        icon="/assets/icons/undertraining.png"
                        color="text-amber-400"
                        glowColor="from-amber-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'partially_ready', title: 'Partially Ready', color: 'text-amber-400', glowColor: 'from-amber-500/90 to-transparent' })}
                    />
                    <StatCard
                        id="not_ready"
                        title="Not Ready"
                        value={notReady}
                        icon="/assets/icons/overtraining.png"
                        color="text-red-400"
                        glowColor="from-red-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'not_ready', title: 'Not Ready', color: 'text-red-400', glowColor: 'from-red-500/90 to-transparent' })}
                    />
                </div>

                {/* Visual Analytics Grid - Asymmetric Layout (12-column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* 1. Heart Rate Plot - Spans 8 columns */}
                    <div className="lg:col-span-8 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md flex flex-col min-h-[300px] lg:min-h-[450px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-normal text-foreground mb-1">
                                    Heart rate analytics
                                </h4>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <HeartRateAnalyticsChart teamData={teamData} avgTeamHR={avgTeamHR} />
                        </div>
                    </div>

                    {/* 2. Readiness Distribution Donut - Spans 4 columns */}
                    <div className="lg:col-span-4 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md flex flex-col min-h-[300px] lg:min-h-[450px]">
                        <h4 className="text-2xl font-normal text-foreground mb-4">
                            Readiness distribution
                        </h4>
                        <div className="flex-1 relative">
                            <ReadinessDonutChart readyAthletes={readyAthletes} partiallyReady={partiallyReady} notReady={notReady} />
                        </div>
                    </div>

                    {/* 3. Zone Distribution - Spans 5 columns */}
                    <div className="lg:col-span-5 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md flex flex-col min-h-[350px] lg:min-h-[500px]">
                        <h4 className="text-2xl font-normal text-foreground mb-8">
                            Zone intensity
                        </h4>
                        <div className="space-y-6 flex-1 flex flex-col justify-center px-4">
                            {[5, 4, 3, 2, 1, 0].map(z => {
                                const avgZone = zoneAverages[`z${z}`] ?? 0;
                                const colors = ['#d1d5db', '#9ca3af', '#3b82f6', '#22c55e', '#eab308', '#ef4444'].reverse();
                                const intensityNames = ['Recovery', 'Aerobic', 'Tempo', 'Lactate', 'Anaerobic', 'Maximum'].reverse();
                                return (
                                    <div key={z} className="group/zone">
                                        <div className="flex justify-between text-sm font-medium tracking-tight mb-2">
                                            <span className="text-foreground/70">Zone {z} — <span className="text-foreground/50 font-normal">{intensityNames[z]}</span></span>
                                            <span className="text-foreground font-semibold">{Math.round(avgZone)}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-500/5 dark:bg-white/5 rounded-full overflow-hidden p-[1px] border border-border/40">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${avgZone}%`,
                                                    backgroundColor: colors[z],
                                                    boxShadow: 'none'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Resting HR Variance - Spans 7 columns */}
                    <div className="lg:col-span-7 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md flex flex-col min-h-[350px] lg:min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-normal text-foreground mb-1">
                                    Resting HR
                                </h4>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <RestingHRChart teamData={teamData} avgRestHR={avgRestHR} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Athlete List Popup Overlay */}
            <AnimatePresence>
                {selectedPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPopup(null)}
                            className="absolute inset-0 bg-background/60"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="relative w-full max-w-md bg-card border border-border shadow-md rounded-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 pb-4 relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className={`text-2xl font-semibold text-foreground tracking-tight`}>
                                        {selectedPopup.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">
                                        Member List
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPopup(null)}
                                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Athlete List */}
                            <div className="p-4 pt-0 max-h-[400px] overflow-y-auto relative z-10 custom-scrollbar">
                                <div className="space-y-2">
                                    {getPopupAthletes().length > 0 ? (
                                        getPopupAthletes().map((athlete, idx) => (
                                            <motion.div
                                                key={athlete.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => {
                                                    onAthleteSelect(athlete);
                                                    setSelectedPopup(null);
                                                }}
                                                className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/30 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold">
                                                        {athlete.name.charAt(0)}
                                                    </div>
                                                    <span className="text-lg font-normal text-foreground">
                                                        {athlete.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-brand-500 transition-colors" />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground italic">
                                            No athletes found in this category.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer / Fade effect */}
                            <div className="h-8 bg-gradient-to-t from-card/90 to-transparent absolute bottom-0 left-0 right-0 z-20"></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
