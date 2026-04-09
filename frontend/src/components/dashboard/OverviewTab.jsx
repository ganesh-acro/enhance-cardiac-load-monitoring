import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Dumbbell, ClipboardCheck, Calendar, Info, Heart, BarChart2, Shield, Zap, X, ChevronRight } from 'lucide-react';
import { MonthlyLoadCombinedChart, MonthlyZoneStackChart, MonthlyHRAvgRangeChart, MonthlyACWRChart, MonthlyMovementComboChart } from './FeatureCharts';

const CHART_INFO = {
    loadHrv: {
        title: "Load & HRV",
        desc: "Monthly training load (bars) overlaid with HRV (RMSSD) trend (line). Rising load alongside stable or improving HRV indicates good adaptation."
    },
    zones: {
        title: "Zone Distribution",
        desc: "Stacked monthly breakdown of time spent in each heart rate zone (Z0-Z5). Reflects training intensity balance across the period."
    },
    heartRate: {
        title: "Heart Rate Stats",
        desc: "Monthly average, minimum, and maximum heart rate. Useful for spotting cardiovascular drift or recovery trends over time."
    },
    acwr: {
        title: "ACWR Trend",
        desc: "Acute:Chronic Workload Ratio over time. Values 0.8-1.3 are optimal; above 1.3 signals elevated injury risk from spike in acute load."
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

// ---------------------------------------------------------------------------
// Flag style helpers
// ---------------------------------------------------------------------------

const getStatusStyle = (status) => {
    if (!status) return { bg: "bg-muted/20 border-border/60", text: "text-muted-foreground", circle: "bg-muted text-muted-foreground", badge: "bg-muted/30 text-muted-foreground" };
    const s = status.toLowerCase();
    if (s.includes("stable") || s.includes("optimal") || s.includes("excellent") || s.includes("polarized"))
        return { bg: "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.12)]", text: "text-emerald-600 dark:text-emerald-400", circle: "bg-emerald-500 text-white", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
    if (s.includes("fatigue") || s.includes("cautious") || s.includes("minor") || s.includes("recovery") || s.includes("aerobic") || s.includes("high-intensity") || s.includes("mixed"))
        return { bg: "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_24px_rgba(234,179,8,0.12)]", text: "text-yellow-600 dark:text-yellow-400", circle: "bg-yellow-500 text-white", badge: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" };
    if (s.includes("overreach") || s.includes("dangerous") || s.includes("detraining") || s.includes("poor") || s.includes("grey"))
        return { bg: "bg-red-500/10 border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.12)]", text: "text-red-600 dark:text-red-400", circle: "bg-red-500 text-white", badge: "bg-red-500/15 text-red-600 dark:text-red-400" };
    return { bg: "bg-muted/20 border-border/60", text: "text-muted-foreground", circle: "bg-muted text-muted-foreground", badge: "bg-muted/30 text-muted-foreground" };
};

const fmtVal = (v, suffix = "", decimals = 1) => {
    if (v === null || v === undefined) return "---";
    return `${Number(v).toFixed(decimals)}${suffix}`;
};

// ---------------------------------------------------------------------------
// Flag Detail Modal (multi-month history)
// ---------------------------------------------------------------------------

const FLAG_META = {
    f1: { key: "f1_readiness_trend", title: "Readiness Trend", subtitle: "Month-over-month RMSSD comparison (SD-adaptive)", icon: Heart },
    f2: { key: "f2_load_progression", title: "Load Progression", subtitle: "Month-over-month AU change", icon: TrendingUp },
    f3: { key: "f3_intensity_shape", title: "Intensity Shape", subtitle: "Exertion distribution", icon: BarChart2 },
    f4: { key: "f4_training_balance", title: "Training Balance", subtitle: "Session modality mix", icon: Zap },
    f5: { key: "f5_compliance", title: "Readiness Compliance", subtitle: "High exertion on NOT READY days", icon: Shield },
};

function FlagDetailModal({ flagId, months, onClose }) {
    const meta = FLAG_META[flagId];
    if (!meta) return null;
    const Icon = meta.icon;
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div ref={ref} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border/50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                            <Icon className="h-4.5 w-4.5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{meta.title}</h3>
                            <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Month cards */}
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {months.map((m) => {
                        const f = m[meta.key];
                        return (
                            <DetailMonthCard key={m.rawMonth} flagId={flagId} month={m.month} data={f} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function DetailMonthCard({ flagId, month, data }) {
    const style = getStatusStyle(data.status || data.shape || data.tag);

    if (flagId === "f1") {
        return (
            <div className={`p-4 rounded-xl border ${style.bg} transition-all`}>
                <p className="text-lg font-bold text-foreground">{fmtVal(data.curr_rmssd, " ms")}</p>
                {data.drop_ms != null && (
                    <p className={`text-xs font-semibold ${data.drop_ms > 0 ? "text-red-500" : "text-emerald-500"}`}>
                        {data.drop_ms > 0 ? "-" : "+"}{Math.abs(data.drop_ms).toFixed(1)} ms
                    </p>
                )}
                {data.sd_fatigue_threshold != null && (
                    <p className="text-[10px] text-muted-foreground mt-1">Fatigue &gt;{data.sd_fatigue_threshold.toFixed(1)} ms / Overreach &gt;{data.sd_overreach_threshold?.toFixed(1)} ms</p>
                )}
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>{data.status}</span>
                <p className="text-[10px] text-muted-foreground mt-1.5">{month}</p>
            </div>
        );
    }

    if (flagId === "f2") {
        return (
            <div className={`p-4 rounded-xl border ${style.bg} transition-all`}>
                <p className="text-lg font-bold text-foreground">{fmtVal(data.curr_load, "")}</p>
                <p className="text-[10px] text-muted-foreground">AU avg</p>
                {data.change_pct != null && (
                    <p className={`text-xs font-semibold mt-0.5 ${data.change_pct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {data.change_pct >= 0 ? "+" : ""}{data.change_pct}%
                    </p>
                )}
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>{data.status}</span>
                {(data.acwr_optimal > 0 || data.acwr_low > 0 || data.acwr_very_low > 0 || data.acwr_danger > 0) && (
                    <div className="mt-2 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                        {data.acwr_optimal > 0 && <div className="bg-emerald-500" style={{ flex: data.acwr_optimal }} />}
                        {data.acwr_low > 0 && <div className="bg-yellow-500" style={{ flex: data.acwr_low }} />}
                        {data.acwr_very_low > 0 && <div className="bg-red-500" style={{ flex: data.acwr_very_low }} />}
                        {data.acwr_danger > 0 && <div className="bg-red-700" style={{ flex: data.acwr_danger }} />}
                    </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{month}</p>
            </div>
        );
    }

    if (flagId === "f3") {
        const shapeStyle = getStatusStyle(data.shape);
        return (
            <div className={`p-4 rounded-xl border ${shapeStyle.bg} transition-all`}>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${shapeStyle.badge}`}>{data.shape}</span>
                {data.low_pct != null && (
                    <>
                        <div className="flex gap-0.5 h-4 rounded overflow-hidden mt-2">
                            {data.high_pct > 0 && <div className="bg-red-500 flex items-center justify-center" style={{ flex: data.high_pct }}>{data.high_pct >= 20 && <span className="text-[8px] text-white font-bold">{data.high_pct}%</span>}</div>}
                            {data.mod_pct > 0 && <div className="bg-yellow-500 flex items-center justify-center" style={{ flex: data.mod_pct }}>{data.mod_pct >= 20 && <span className="text-[8px] text-white font-bold">{data.mod_pct}%</span>}</div>}
                            {data.low_pct > 0 && <div className="bg-emerald-500 flex items-center justify-center" style={{ flex: data.low_pct }}>{data.low_pct >= 20 && <span className="text-[8px] text-white font-bold">{data.low_pct}%</span>}</div>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Low {data.low_pct}% / Mod {data.mod_pct}% / High {data.high_pct}%</p>
                    </>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{month}</p>
            </div>
        );
    }

    if (flagId === "f4") {
        return (
            <div className="p-4 rounded-xl border border-border/60 bg-muted/5 transition-all">
                <p className="text-lg font-bold text-foreground">{data.total_sessions}</p>
                <p className="text-[10px] text-muted-foreground">{data.endurance_count} endurance / {data.sprint_count} sprint</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>{data.tag}</span>
                <p className="text-[10px] text-muted-foreground mt-1.5">{month}</p>
            </div>
        );
    }

    if (flagId === "f5") {
        return (
            <div className={`p-4 rounded-xl border ${style.bg} transition-all`}>
                <p className={`text-xl font-bold ${style.text}`}>{data.violation_count}</p>
                <p className="text-[10px] text-muted-foreground">{data.violation_count === 1 ? "violation" : "violations"}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>{data.status}</span>
                {data.violations?.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                        {data.violations.map((v, i) => (
                            <p key={i} className="text-[9px] text-red-500 truncate">{v.date} / {v.session}</p>
                        ))}
                    </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{month}</p>
            </div>
        );
    }

    return null;
}


// ---------------------------------------------------------------------------
// Main OverviewTab
// ---------------------------------------------------------------------------

export const OverviewTab = ({ summaryData, athleteSummary, primaryChartData, monthlyFlags = [] }) => {
    const [expandedFlag, setExpandedFlag] = useState(null);

    if (!summaryData || !athleteSummary) return null;

    const latestAvgHr = primaryChartData?.hr?.length > 0
        ? primaryChartData.hr[primaryChartData.hr.length - 1].avg_hr
        : 0;

    const latestRmssd = primaryChartData?.hrv?.length > 0
        ? primaryChartData.hrv[primaryChartData.hrv.length - 1].rmssd
        : 0;

    // Latest month data for the 5 compact cards
    const latest = monthlyFlags.length > 0 ? monthlyFlags[monthlyFlags.length - 1] : null;

    const flagCards = latest ? [
        {
            id: "f1",
            label: "Readiness Trend",
            value: latest.f1_readiness_trend.status,
            detail: fmtVal(latest.f1_readiness_trend.curr_rmssd, " ms"),
            icon: Heart,
        },
        {
            id: "f2",
            label: "Load Progression",
            value: latest.f2_load_progression.status,
            detail: latest.f2_load_progression.change_pct != null
                ? `${latest.f2_load_progression.change_pct >= 0 ? "+" : ""}${latest.f2_load_progression.change_pct}%`
                : fmtVal(latest.f2_load_progression.curr_load, " AU"),
            icon: TrendingUp,
        },
        {
            id: "f3",
            label: "Intensity Shape",
            value: latest.f3_intensity_shape.shape,
            detail: latest.f3_intensity_shape.low_pct != null
                ? `L${latest.f3_intensity_shape.low_pct} / M${latest.f3_intensity_shape.mod_pct} / H${latest.f3_intensity_shape.high_pct}`
                : null,
            icon: BarChart2,
        },
        {
            id: "f4",
            label: "Training Balance",
            value: latest.f4_training_balance.tag,
            detail: `${latest.f4_training_balance.endurance_count}E / ${latest.f4_training_balance.sprint_count}S`,
            icon: Zap,
        },
        {
            id: "f5",
            label: "Compliance",
            value: latest.f5_compliance.status,
            detail: `${latest.f5_compliance.violation_count} violation${latest.f5_compliance.violation_count !== 1 ? "s" : ""}`,
            icon: Shield,
        },
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 mt-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* LEFT COLUMN: SIDEBAR */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                    {/* Athlete Profile Card */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-md">
                        <p className="text-xs font-semibold text-brand-500 tracking-[0.2em] mb-3 uppercase">Athlete profile</p>

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

                        <div className="border-t border-border/30 my-4" />

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

                        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            <span className="text-sm font-bold text-foreground tracking-wide">{athleteSummary.sessionStart || 'N/A'}</span>
                            <span className="text-muted-foreground font-medium text-sm">-</span>
                            <span className="text-sm font-bold text-foreground tracking-wide">{athleteSummary.sessionEnd || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Load & HRV Chart */}
                    <div className="p-4 lg:p-6 rounded-xl bg-card border border-border shadow-md flex-1">
                        <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                            Load & HRV<ChartInfoPopup chartKey="loadHrv" />
                        </h5>
                        <MonthlyLoadCombinedChart data={primaryChartData?.monthly} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 space-y-6 lg:space-y-8">

                    {/* Vitals Card */}
                    <div className="p-5 lg:p-8 rounded-2xl lg:rounded-xl bg-card border border-border shadow-md flex flex-col justify-center">
                        <div className="flex items-center justify-around gap-4 h-full">
                            <div className="text-center">
                                <p className="text-2xl lg:text-4xl font-normal text-foreground tracking-tighter">{latestAvgHr}</p>
                                <p className="text-xs font-normal text-muted-foreground dark:text-white uppercase tracking-wider mt-1">Average HR</p>
                            </div>
                            <div className="w-px h-12 bg-border/60"></div>
                            <div className="text-center">
                                <p className="text-2xl lg:text-4xl font-normal text-foreground tracking-tighter">{latestRmssd}</p>
                                <p className="text-xs font-normal text-muted-foreground dark:text-white uppercase tracking-wider mt-1">RMSSD (HRV)</p>
                            </div>
                        </div>
                    </div>

                    {/* 5 Monthly Flag Cards — latest month only, click to expand */}
                    {flagCards.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {flagCards.map((card) => {
                                    const style = getStatusStyle(card.value);
                                    const Icon = card.icon;
                                    return (
                                        <button
                                            key={card.id}
                                            onClick={() => setExpandedFlag(card.id)}
                                            className={`p-4 lg:p-5 rounded-2xl lg:rounded-xl border transition-all duration-300 flex items-center justify-between relative overflow-hidden text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${style.bg}`}
                                        >
                                            <div className="relative z-10 min-w-0 flex-1">
                                                <p className="text-[10px] lg:text-xs font-normal tracking-widest uppercase mb-1 opacity-70 dark:text-white">{card.label}</p>
                                                <p className={`text-lg lg:text-xl font-semibold tracking-tight leading-tight ${style.text}`}>
                                                    {card.value || "N/A"}
                                                </p>
                                                {card.detail && (
                                                    <p className="text-xs text-muted-foreground mt-1">{card.detail}</p>
                                                )}
                                            </div>
                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shrink-0 relative z-10 ml-3 ${style.circle}`}>
                                                <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Subtle hint */}
                            <p className="text-[10px] text-muted-foreground/50 text-right -mt-3 pr-1 flex items-center justify-end gap-1">
                                Click a flag for monthly history <ChevronRight className="h-3 w-3" />
                            </p>
                        </>
                    )}

                    {/* Monthly Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        <div className="lg:col-span-2 xl:col-span-2 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Zone distribution<ChartInfoPopup chartKey="zones" />
                            </h5>
                            <MonthlyZoneStackChart data={primaryChartData?.monthly} />
                        </div>

                        <div className="lg:col-span-2 xl:col-span-1 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Heart rate stats<ChartInfoPopup chartKey="heartRate" />
                            </h5>
                            <MonthlyHRAvgRangeChart data={primaryChartData?.monthly} />
                        </div>

                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                ACWR trend<ChartInfoPopup chartKey="acwr" />
                            </h5>
                            <MonthlyACWRChart data={primaryChartData?.monthly} />
                        </div>

                        <div className="lg:col-span-2 xl:col-span-3 p-5 lg:p-8 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all">
                            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-6 inline-flex items-center">
                                Movement intensity & load<ChartInfoPopup chartKey="movement" />
                            </h5>
                            <MonthlyMovementComboChart data={primaryChartData?.monthly} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {expandedFlag && (
                <FlagDetailModal
                    flagId={expandedFlag}
                    months={monthlyFlags}
                    onClose={() => setExpandedFlag(null)}
                />
            )}
        </div>
    );
};
