import { useEffect, useState, useRef } from 'react';
import { ChevronRight, X, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getTooltipStyle, getAxisStyle, getLegendStyle, getGridStyle
} from '../../utils/chartStyles';

const CHART_INFO = {
    acwr: {
        title: "ACWR",
        lines: [
            { label: "< 0.8 — Underloaded", desc: "Low training stimulus. Risk of deconditioning if sustained." },
            { label: "0.8–1.3 — Optimal", desc: "Balanced acute-to-chronic ratio. Ideal performance and adaptation zone." },
            { label: "> 1.3 — High Risk", desc: "Excessive acute load relative to chronic base. Elevated injury risk." },
        ],
        note: "Based on Gabbett (2016). Acute = 7-day rolling load; Chronic = 28-day rolling average."
    },
    readiness: {
        title: "Readiness Distribution",
        lines: [
            { label: "Ready", desc: "RMSSD > 50ms, session quality ≥ 80%, resting HR within normal range." },
            { label: "Needs Attention", desc: "RMSSD 20–50ms or mild HR elevation. Monitor workload closely." },
            { label: "Unavailable", desc: "RMSSD < 20ms, quality < 60%, or significant 7-day HRV decline." },
        ],
        note: "Assessed from the most recent morning Readiness session per athlete."
    },
    zones: {
        title: "Zone Intensity",
        lines: [
            { label: "Zone 0 — Rest", desc: "< 50% max HR. Minimal cardiovascular demand." },
            { label: "Zone 1 — Recovery", desc: "50–60% max HR. Active recovery, easy aerobic." },
            { label: "Zone 2 — Tempo", desc: "60–70% max HR. Aerobic base building." },
            { label: "Zone 3 — Aerobic", desc: "70–80% max HR. Lactate threshold training." },
            { label: "Zone 4 — Anaerobic", desc: "80–90% max HR. High-intensity interval work." },
            { label: "Zone 5 — Maximum", desc: "> 90% max HR. Peak sprint / max effort." },
        ],
        note: "Team averages from the most recent Training session per athlete."
    },
    restingHR: {
        title: "Resting HR",
        lines: [
            { label: "< 50 bpm", desc: "Athletic / highly trained. Strong cardiac efficiency." },
            { label: "50–60 bpm", desc: "Normal athletic range. Well-conditioned." },
            { label: "60–75 bpm", desc: "Typical healthy resting range." },
            { label: "> 75 bpm", desc: "Slightly elevated. May indicate fatigue or incomplete recovery." },
        ],
        note: "Sourced from the most recent Readiness session. Dashed line = team average."
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
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-72 bg-card border border-border rounded-xl shadow-lg dark:shadow-black/30 p-4 text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-3">{info.title}</p>
                    <div className="space-y-2.5">
                        {info.lines.map((l, i) => (
                            <div key={i}>
                                <p className="text-sm font-black text-foreground">{l.label}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{l.desc}</p>
                            </div>
                        ))}
                    </div>
                    {info.note && (
                        <p className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground/70 italic leading-relaxed">{info.note}</p>
                    )}
                </div>
            )}
        </span>
    );
}

function useChartTheme() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return false;
    return resolvedTheme === 'dark';
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon: Icon, iconColor, onClick }) => (
    <div
        onClick={onClick}
        className={`px-6 py-6 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between gap-6 transition-all duration-200 hover:shadow-md hover:border-brand-500/30 ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Left: icon + label */}
        <div className="flex items-center gap-3 min-w-0">
            {Icon && <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />}
            <span className="text-sm font-semibold text-muted-foreground leading-snug">{title}</span>
        </div>
        {/* Right: value */}
        <div className="flex items-baseline gap-1.5 shrink-0">
            <span className="text-6xl font-light tracking-tight text-foreground leading-none">{value}</span>
            {sub && <span className="text-base font-normal text-muted-foreground">{sub}</span>}
        </div>
    </div>
);

// ── ACWR Risk Strip ───────────────────────────────────────────────────────────

const ACWRRiskChart = ({ teamData }) => {
    const isDark = useChartTheme();

    const sorted = [...teamData]
        .filter(a => a.acwr > 0)
        .sort((a, b) => b.acwr - a.acwr);

    if (sorted.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold tracking-widest">
                No ACWR data available
            </div>
        );
    }

    const getACWRColor = (v) => {
        if (v > 1.3) return '#ef4444';
        if (v >= 0.8) return '#10b981';
        return '#f59e0b';
    };

    return (
        <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {sorted.map((athlete) => {
                const pct = Math.min((athlete.acwr / 2.0) * 100, 100);
                const color = getACWRColor(athlete.acwr);
                const zone = athlete.acwr > 1.3 ? 'High risk' : athlete.acwr >= 0.8 ? 'Optimal' : 'Underloaded';
                return (
                    <div key={athlete.id}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">{athlete.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold" style={{ color }}>{zone}</span>
                                <span className="text-sm font-black text-foreground">{athlete.acwr.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                            {/* Zone bands */}
                            <div className="absolute inset-0 flex">
                                <div className="h-full opacity-20" style={{ width: '40%', background: '#f59e0b' }} />
                                <div className="h-full opacity-20" style={{ width: '25%', background: '#10b981' }} />
                                <div className="h-full opacity-20" style={{ width: '35%', background: '#ef4444' }} />
                            </div>
                            {/* Value bar */}
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color }}
                            />
                        </div>
                    </div>
                );
            })}
            {/* Legend */}
            <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-amber-400" />
                    <span className="text-[11px] font-bold text-muted-foreground">&lt; 0.8 Underloaded</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-500" />
                    <span className="text-[11px] font-bold text-muted-foreground">0.8–1.3 Optimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-500" />
                    <span className="text-[11px] font-bold text-muted-foreground">&gt; 1.3 High risk</span>
                </div>
            </div>
        </div>
    );
};

// ── Readiness Donut ───────────────────────────────────────────────────────────

const ReadinessDonutChart = ({ readyAthletes, partiallyReady, notReady }) => {
    const isDark = useChartTheme();
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark, { trigger: 'item' }),
            formatter: '{b}: {c} ({d}%)',
        },
        legend: { bottom: '0', left: 'center', icon: 'circle', ...getLegendStyle(isDark) },
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
                    show: true, fontSize: 14, fontWeight: 'bold',
                    color: isDark ? '#f8fafc' : '#1e293b',
                    formatter: '{b}\n{d}%'
                }
            },
            data: [
                { value: readyAthletes, name: 'Ready', itemStyle: { color: '#10b981' } },
                { value: partiallyReady, name: 'Needs Attention', itemStyle: { color: '#f59e0b' } },
                { value: notReady, name: 'Unavailable', itemStyle: { color: '#ef4444' } },
            ]
        }]
    };
    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

// ── Zone Intensity Bars ───────────────────────────────────────────────────────

const ZoneIntensityBars = ({ zoneAverages }) => {
    const ZONES = [
        { key: 'z5', label: 'Zone 5', sub: 'Maximum',   color: '#ef4444' },
        { key: 'z4', label: 'Zone 4', sub: 'Anaerobic',  color: '#eab308' },
        { key: 'z3', label: 'Zone 3', sub: 'Aerobic',    color: '#22c55e' },
        { key: 'z2', label: 'Zone 2', sub: 'Tempo',      color: '#3b82f6' },
        { key: 'z1', label: 'Zone 1', sub: 'Recovery',   color: '#9ca3af' },
        { key: 'z0', label: 'Zone 0', sub: 'Rest',       color: '#d1d5db' },
    ];
    return (
        <div className="space-y-5">
            {ZONES.map(({ key, label, sub, color }) => {
                const val = zoneAverages[key] ?? 0;
                return (
                    <div key={key}>
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                            <span className="text-foreground/80 font-semibold">{label} <span className="text-foreground/40 font-normal text-xs">— {sub}</span></span>
                            <span className="font-normal text-foreground">{val.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${val}%`, backgroundColor: color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Resting HR Chart ──────────────────────────────────────────────────────────

const RestingHRChart = ({ teamData, avgRestHR }) => {
    const isDark = useChartTheme();
    const axisStyle = getAxisStyle(isDark);
    const sorted = [...teamData].sort((a, b) => b.rest_hr - a.rest_hr);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const v = params[0].value;
                const diff = (v - avgRestHR).toFixed(1);
                return `<div style="font-weight:700">${params[0].name}</div>
                        <div>${v} bpm</div>
                        <div style="font-size:11px;opacity:0.6">vs avg: ${diff > 0 ? '+' : ''}${diff}</div>`;
            }
        },
        grid: getGridStyle({ right: '12%', top: 16 }),
        xAxis: {
            type: 'category',
            data: sorted.map(a => a.name.split(' ')[0]),
            ...axisStyle,
            axisLabel: { ...axisStyle.axisLabel, interval: 0, rotate: sorted.length > 6 ? 35 : 0 },
        },
        yAxis: { type: 'value', ...axisStyle },
        series: [
            {
                type: 'bar',
                data: sorted.map(a => ({
                    value: a.rest_hr,
                    itemStyle: {
                        color: a.rest_hr > avgRestHR ? (isDark ? '#c49a5a' : '#0d7377') : (isDark ? '#8494aa' : '#8494aa'),
                        borderRadius: [6, 6, 2, 2],
                    }
                })),
                barMaxWidth: 28,
            },
            {
                type: 'line',
                data: sorted.map(() => avgRestHR),
                lineStyle: { color: isDark ? '#fff' : '#333', width: 2, type: 'dashed' },
                symbol: 'none',
                endLabel: {
                    show: true,
                    formatter: `Avg\n${avgRestHR}`,
                    color: isDark ? '#fff' : '#333',
                    fontWeight: 700,
                    fontSize: 11,
                    offset: [10, 0]
                }
            }
        ]
    };
    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

// ── Needs Attention Panel ─────────────────────────────────────────────────────
// ── Main Component ────────────────────────────────────────────────────────────

export const AnalyticsOverview = ({ teamData, teamStats = {}, onAthleteSelect }) => {
    const [selectedPopup, setSelectedPopup] = useState(null);

    const readyAthletes = teamStats.readyAthletes ?? 0;
    const partiallyReady = teamStats.partiallyReady ?? 0;
    const notReady = teamStats.notReady ?? 0;
    const avgRestHR = teamStats.avgRestHR ?? 0;
    const avgRmssd = teamStats.avgRmssd ?? 0;
    const avgTrainingLoad = teamStats.avgTrainingLoad ?? 0;
    const zoneAverages = teamStats.zoneAverages ?? {};

    const getPopupAthletes = () => {
        if (!selectedPopup) return [];
        switch (selectedPopup.id) {
            case 'ready': return teamData.filter(a => a.readiness_status === 'READY');
            case 'partially_ready': return teamData.filter(a => a.readiness_status === 'PARTIALLY READY');
            case 'not_ready': return teamData.filter(a => a.readiness_status === 'NOT READY');
            default: return [];
        }
    };

    return (
        <>
            <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* ── All Stat Cards in one row ── */}
                <div className="grid grid-cols-5 gap-3">
                    <StatCard
                        title="Available"
                        value={readyAthletes}
                        icon={CheckCircle2}
                        iconColor="text-emerald-500"
                        onClick={() => setSelectedPopup({ id: 'ready', title: 'Ready' })}
                    />
                    <StatCard
                        title="Needs Attention"
                        value={partiallyReady}
                        icon={AlertTriangle}
                        iconColor="text-amber-500"
                        onClick={() => setSelectedPopup({ id: 'partially_ready', title: 'Needs Attention' })}
                    />
                    <StatCard
                        title="Unavailable"
                        value={notReady}
                        icon={AlertCircle}
                        iconColor="text-red-500"
                        onClick={() => setSelectedPopup({ id: 'not_ready', title: 'Unavailable' })}
                    />
                    <StatCard title="Avg HRV" value={avgRmssd} sub="ms" />
                    <StatCard title="Avg Training Load" value={avgTrainingLoad} />
                </div>

                {/* ── ACWR chart (wide) + Readiness Donut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-h-[380px]">
                        <div className="mb-4">
                            <h4 className="text-2xl font-normal text-foreground inline-flex items-center">ACWR<ChartInfoPopup chartKey="acwr" /></h4>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ACWRRiskChart teamData={teamData} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-h-[380px]">
                        <h4 className="text-2xl font-normal text-foreground mb-4 inline-flex items-center">Readiness distribution<ChartInfoPopup chartKey="readiness" /></h4>
                        <div className="flex-1">
                            <ReadinessDonutChart readyAthletes={readyAthletes} partiallyReady={partiallyReady} notReady={notReady} />
                        </div>
                    </div>
                </div>

                {/* ── Zone Intensity + Resting HR ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h4 className="text-2xl font-normal text-foreground mb-6 inline-flex items-center">Zone intensity<ChartInfoPopup chartKey="zones" /></h4>
                        <ZoneIntensityBars zoneAverages={zoneAverages} />
                    </div>

                    <div className="lg:col-span-7 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-h-[360px]">
                        <h4 className="text-2xl font-normal text-foreground mb-4 inline-flex items-center">Resting HR<ChartInfoPopup chartKey="restingHR" /></h4>
                        <div className="flex-1">
                            <RestingHRChart teamData={teamData} avgRestHR={avgRestHR} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Athlete List Popup ── */}
            <AnimatePresence>
                {selectedPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPopup(null)}
                            className="absolute inset-0 bg-background/60"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="relative w-full max-w-md bg-card border border-border shadow-md rounded-xl overflow-hidden"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-border">
                                <div>
                                    <h3 className="text-2xl font-normal text-foreground">{selectedPopup.title}</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                                        {getPopupAthletes().length} athletes
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPopup(null)}
                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4 max-h-[420px] overflow-y-auto">
                                {getPopupAthletes().length > 0 ? (
                                    <div className="space-y-2">
                                        {getPopupAthletes().map((athlete, idx) => (
                                            <motion.div
                                                key={athlete.id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                onClick={() => { onAthleteSelect(athlete); setSelectedPopup(null); }}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/30 cursor-pointer group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 font-black text-sm border border-brand-500/20">
                                                        {athlete.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-foreground group-hover:text-brand-500 transition-colors">{athlete.name}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand-500 transition-colors" />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-muted-foreground text-sm font-medium">
                                        No athletes in this category.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
