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

const ReadinessDonutChart = ({ readyAthletes, yellowFlags, redFlags }) => {
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
            name: 'ACWR Status',
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
                { value: readyAthletes, name: 'Optimal', itemStyle: { color: '#10b981' } },
                { value: yellowFlags, name: 'Caution', itemStyle: { color: '#f59e0b' } },
                { value: redFlags, name: 'Risk', itemStyle: { color: '#ef4444' } }
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
                    itemStyle: { color: '#cc6200' }
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
const StatCard = ({ id, title, value, icon: Icon, color, glowColor, onClick }) => (
    <div
        onClick={onClick}
        className={`relative p-5 lg:p-6 rounded-[32px] bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all duration-700 hover:border-brand-500/60 hover:-translate-y-1 cursor-pointer overflow-hidden min-h-[140px]`}
    >
        {/* Massive Glow Effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none bg-gradient-to-br ${glowColor} blur-[100px] -m-20 scale-[2.5]`}></div>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-50 transition-all duration-700 pointer-events-none bg-gradient-to-tr ${glowColor} blur-[60px] -m-10 scale-150`}></div>

        {/* Icon Container - Left */}
        <div className="relative z-10 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-border shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 backdrop-blur-xl">
            {typeof Icon === 'string' ? (
                <img src={Icon} alt="" className="h-6 w-6 lg:h-8 lg:w-8 object-contain" />
            ) : (
                <Icon className={`h-6 w-6 lg:h-7 lg:w-7 ${color} opacity-90`} />
            )}
        </div>

        {/* Typography - Label Centered, Value Right */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center px-1">
            <span className="text-sm lg:text-base font-medium text-muted-foreground leading-tight group-hover:text-foreground transition-colors duration-500 uppercase tracking-wide">
                {title}
            </span>
        </div>

        <div className="relative z-10 text-right shrink-0">
            <span className="text-4xl lg:text-5xl font-light text-foreground tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 block">
                {value}
            </span>
        </div>

        {/* Top Shine Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent opacity-30"></div>
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
    const redFlags = teamStats.redFlags ?? 0;
    const yellowFlags = teamStats.yellowFlags ?? 0;
    const readyAthletes = teamStats.readyAthletes ?? 0;
    const avgTeamHR = teamStats.avgTeamHR ?? 0;
    const avgRestHR = teamStats.avgRestHR ?? 0;
    const zoneAverages = teamStats.zoneAverages ?? {};

    // Helper to get athletes for popup
    const getPopupAthletes = () => {
        if (!selectedPopup) return [];
        switch (selectedPopup.id) {
            case 'total': return teamData;
            case 'ready': return teamData.filter(a => parseFloat(a.acwr) >= 0.8 && parseFloat(a.acwr) <= 1.3);
            case 'overtraining': return teamData.filter(a => parseFloat(a.acwr) > 1.3);
            case 'undertraining': return teamData.filter(a => parseFloat(a.acwr) < 0.8);
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
                        title="No. of athletes ready"
                        value={readyAthletes}
                        icon="/assets/icons/ready_athletes.png"
                        color="text-emerald-400"
                        glowColor="from-emerald-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'ready', title: 'No. of athletes ready', color: 'text-emerald-400', glowColor: 'from-emerald-500/90 to-transparent' })}
                    />
                    <StatCard
                        id="overtraining"
                        title="Overtraining athletes"
                        value={redFlags}
                        icon="/assets/icons/overtraining.png"
                        color="text-red-400"
                        glowColor="from-red-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'overtraining', title: 'Overtraining athletes', color: 'text-red-400', glowColor: 'from-red-500/90 to-transparent' })}
                    />
                    <StatCard
                        id="undertraining"
                        title="Undertraining athletes"
                        value={yellowFlags}
                        icon="/assets/icons/undertraining.png"
                        color="text-amber-400"
                        glowColor="from-amber-500/90 to-transparent"
                        onClick={() => setSelectedPopup({ id: 'undertraining', title: 'Undertraining athletes', color: 'text-amber-400', glowColor: 'from-amber-500/90 to-transparent' })}
                    />
                </div>

                {/* Visual Analytics Grid - Asymmetric Layout (12-column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* 1. Heart Rate Plot - Spans 8 columns */}
                    <div className="lg:col-span-8 p-5 lg:p-8 rounded-3xl lg:rounded-[44px] bg-card border border-border/60 shadow-sm flex flex-col min-h-[300px] lg:min-h-[450px]">
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
                    <div className="lg:col-span-4 p-5 lg:p-8 rounded-3xl lg:rounded-[44px] bg-card border border-border/60 shadow-sm flex flex-col min-h-[300px] lg:min-h-[450px]">
                        <h4 className="text-2xl font-normal text-foreground mb-4">
                            Readiness distribution
                        </h4>
                        <div className="flex-1 relative">
                            <ReadinessDonutChart readyAthletes={readyAthletes} yellowFlags={yellowFlags} redFlags={redFlags} />
                        </div>
                    </div>

                    {/* 3. Zone Distribution - Spans 5 columns */}
                    <div className="lg:col-span-5 p-5 lg:p-8 rounded-3xl lg:rounded-[44px] bg-card border border-border/60 shadow-sm flex flex-col min-h-[350px] lg:min-h-[500px]">
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
                                        <div className="flex justify-between text-sm font-medium tracking-tight mb-2 group-hover/zone:translate-x-1 transition-transform">
                                            <span className="text-foreground/70">Zone {z} — <span className="text-foreground/50 font-normal">{intensityNames[z]}</span></span>
                                            <span className="text-foreground font-semibold">{Math.round(avgZone)}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-500/5 dark:bg-white/5 rounded-full overflow-hidden p-[1px] border border-border/40">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${avgZone}%`,
                                                    backgroundColor: colors[z],
                                                    boxShadow: `0 0 15px ${colors[z]}30`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Resting HR Variance - Spans 7 columns */}
                    <div className="lg:col-span-7 p-5 lg:p-8 rounded-3xl lg:rounded-[44px] bg-card border border-border/60 shadow-sm flex flex-col min-h-[350px] lg:min-h-[500px]">
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
                            className="absolute inset-0 bg-background/40 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="relative w-full max-w-md bg-card/80 dark:bg-card/90 border border-border/50 shadow-2xl rounded-[40px] overflow-hidden backdrop-blur-2xl"
                        >
                            {/* Decorative Glow within Modal */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b ${selectedPopup.glowColor} opacity-20 blur-3xl rounded-full -mt-32`}></div>

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
                                    className="p-3 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
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
                                                className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted/60 border border-transparent hover:border-border/30 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold">
                                                        {athlete.name.charAt(0)}
                                                    </div>
                                                    <span className="text-lg font-normal text-foreground group-hover:translate-x-1 transition-transform">
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
