import { useEffect, useState } from 'react';
import { X, Activity, Heart, Zap, TrendingUp, AlertCircle, Dumbbell, ClipboardCheck, Calendar, ChevronDown, Clock } from 'lucide-react';
import { fetchAthleteReport } from '../../utils/dataService';

const fmtNum = (v, decimals = 1) => {
    if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return '—';
    const n = Number(v);
    return n % 1 === 0 ? n.toString() : n.toFixed(decimals);
};

const fmtDateLong = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('ready') && !s.includes('not')) return 'text-emerald-500';
    if (s?.includes('partial')) return 'text-amber-500';
    if (s?.includes('not ready')) return 'text-red-500';
    return 'text-brand-500';
};

const getStatusBg = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('ready') && !s.includes('not')) return 'bg-emerald-500';
    if (s?.includes('partial')) return 'bg-amber-500';
    if (s?.includes('not ready')) return 'bg-red-500';
    return 'bg-brand-500';
};

const levelBadge = (level) => {
    const l = level?.toLowerCase();
    if (l === 'low') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    if (l === 'moderate') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    if (l === 'high') return 'bg-red-500/15 text-red-600 dark:text-red-400';
    return 'bg-muted/30 text-muted-foreground';
};

// -------------------------------------------------------------------------
// Date picker (restricted to available dates)
// -------------------------------------------------------------------------

function DatePicker({ availableDates, selectedDate, onChange }) {
    const [open, setOpen] = useState(false);
    const current = selectedDate || availableDates?.[0];
    if (!availableDates?.length) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/40 border border-border hover:border-brand-500/40 transition-colors"
            >
                <Calendar className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold text-foreground">{fmtDateLong(current)}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-card border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
                        {availableDates.map(d => (
                            <button
                                key={d}
                                onClick={() => { onChange(d); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors ${d === current ? 'bg-brand-500/10 text-brand-500' : 'text-foreground'
                                    }`}
                            >
                                {fmtDateLong(d)}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// -------------------------------------------------------------------------
// Main modal
// -------------------------------------------------------------------------

export const SessionReportModal = ({ isOpen, onClose, athleteId, athleteName }) => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (!isOpen || !athleteId) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchAthleteReport(athleteId, selectedDate);
                setReport(data);
                if (!selectedDate && data?.selectedDate) setSelectedDate(data.selectedDate);
            } catch (err) {
                console.error('Failed to load report:', err);
            }
            setLoading(false);
        };
        load();
    }, [isOpen, athleteId, selectedDate]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedDate(null);
            setReport(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const athlete = report?.athlete;
    const readiness = report?.readiness;
    const training = report?.training;
    const metrics = report?.metrics;
    const trend = report?.trend ?? [];
    const zones = report?.zones;
    const daySessions = report?.daySessions ?? [];

    const initials = (athleteName || athlete?.name || '')
        .split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-6xl bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="px-8 py-5 border-b border-border flex items-center justify-between shrink-0 bg-secondary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            <Activity className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-foreground tracking-tight">{athleteName || athlete?.name || 'Athlete'}</h3>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Day Report</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DatePicker
                            availableDates={report?.availableDates || []}
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center h-96 gap-4 bg-background/50">
                        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Loading day report...</p>
                    </div>
                ) : report && Object.keys(report).length ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">

                            {/* ── LEFT: Athlete Metadata + Day Sessions ───────── */}
                            <aside className="lg:col-span-4 p-6 rounded-2xl bg-secondary/10 border border-border flex flex-col gap-6 h-fit">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">Athlete Profile</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                            <span className="text-lg font-semibold text-brand-500">{initials || 'A'}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-foreground leading-tight">{athlete?.name || athleteName}</h2>
                                            <p className="text-sm font-medium text-muted-foreground mt-0.5">
                                                {athlete?.age ? `${athlete.age}` : ''}
                                                {athlete?.gender ? ` · ${athlete.gender}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">Height</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{fmtNum(athlete?.height)}<span className="text-sm font-medium text-muted-foreground ml-1">cm</span></p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">Weight</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{fmtNum(athlete?.weight)}<span className="text-sm font-medium text-muted-foreground ml-1">kg</span></p>
                                    </div>
                                </div>

                                {/* Sessions on this day */}
                                <div className="pt-4 border-t border-border/40">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-3">Sessions on this day</p>
                                    {daySessions.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">No sessions recorded.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {daySessions.map((s, i) => {
                                                const isTraining = s.type === 'Training';
                                                const Icon = isTraining ? Dumbbell : ClipboardCheck;
                                                const iconColor = isTraining ? 'text-brand-500' : 'text-violet-500';
                                                const bgColor = isTraining ? 'bg-brand-500/10' : 'bg-violet-500/10';
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60">
                                                        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
                                                            <Icon className={`h-4 w-4 ${iconColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base font-semibold text-foreground">{s.type || 'Session'}</p>
                                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                                                <Clock className="h-3 w-3" />
                                                                {s.duration ? `${s.duration} min` : '—'}
                                                                {s.hour != null ? ` · ${s.hour}:00` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </aside>

                            {/* ── RIGHT: Day Report ──────────────────────────── */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Readiness Banner */}
                                <div className="p-6 rounded-2xl bg-secondary/10 border border-border flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 -mr-32 -mt-32 ${getStatusBg(readiness?.status)}`} />
                                    <div className="flex items-center gap-5 z-10">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${getStatusColor(readiness?.status)} border-current/20`}>
                                            <Heart className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Readiness — {fmtDateLong(selectedDate)}</p>
                                            <h2 className={`text-3xl font-semibold tracking-tight ${getStatusColor(readiness?.status)}`}>
                                                {readiness?.status === 'READY' ? 'Good to train' : (readiness?.status || 'N/A')}
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">{readiness?.reasoning}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end z-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-semibold text-foreground">{readiness?.score ?? '—'}</span>
                                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Score</span>
                                        </div>
                                        <div className="flex gap-1 mt-2">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i}
                                                    className={`h-1.5 w-7 rounded-full ${i <= (readiness?.score / 16)
                                                        ? (readiness?.score > 70 ? 'bg-emerald-500' : 'bg-amber-500')
                                                        : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Training Load + Exertion */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Training Load</p>
                                            <h4 className="text-2xl font-semibold text-foreground">{training?.load || 'N/A'}</h4>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-2 text-xs font-semibold uppercase tracking-widest ${levelBadge(training?.load)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {training?.load || '—'}
                                            </span>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                            <Zap className="h-5 w-5 text-brand-500" />
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Exertion Level</p>
                                            <h4 className="text-xl font-semibold text-foreground">{training?.exertion || 'N/A'}</h4>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-2 text-xs font-semibold uppercase tracking-widest ${levelBadge(training?.exertion)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {training?.exertion || '—'}
                                                {training?.sub_type ? ` · ${training.sub_type}` : ''}
                                            </span>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Headline metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Resting HR</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-semibold text-foreground">{fmtNum(metrics?.rhr)}</span>
                                            <span className="text-sm font-semibold text-muted-foreground">bpm</span>
                                        </div>
                                        <div className={`mt-2 text-sm font-semibold ${metrics?.rhr_diff <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {metrics?.rhr_diff > 0 ? '↑' : '↓'} {Math.abs(metrics?.rhr_diff || 0)} bpm vs baseline
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">HRV (RMSSD)</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-semibold text-foreground">{fmtNum(metrics?.rmssd)}</span>
                                            <span className="text-sm font-semibold text-muted-foreground">ms</span>
                                        </div>
                                        <div className={`mt-2 text-sm font-semibold ${metrics?.rmssd_diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {metrics?.rmssd_diff > 0 ? '↑' : '↓'} {Math.abs(metrics?.rmssd_diff || 0)} ms this week
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">ACWR</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-semibold text-foreground">{fmtNum(metrics?.acwr, 2)}</span>
                                        </div>
                                        <div className={`mt-2 text-sm font-semibold ${metrics?.acwr > 1.3 || metrics?.acwr < 0.8 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {metrics?.acwr > 1.3 ? 'Elevated' : metrics?.acwr < 0.8 ? 'Below zone' : 'Optimal zone'}
                                        </div>
                                    </div>
                                </div>

                                {/* Zone Distribution */}
                                {zones && (
                                    <div className="p-5 rounded-2xl bg-secondary/5 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">Zone Distribution</p>
                                        <div className="flex gap-0.5 h-9 rounded-md overflow-hidden mb-4">
                                            {[
                                                { key: 'z0', color: 'bg-slate-400' },
                                                { key: 'z1', color: 'bg-slate-500' },
                                                { key: 'z2', color: 'bg-blue-500' },
                                                { key: 'z3', color: 'bg-emerald-500' },
                                                { key: 'z4', color: 'bg-amber-500' },
                                                { key: 'z5', color: 'bg-red-500' },
                                            ].map(z => {
                                                const pct = zones?.[z.key]?.pct || 0;
                                                return pct > 0 ? (
                                                    <div key={z.key} className={`${z.color} flex items-center justify-center`} style={{ flex: pct }}>
                                                        {pct >= 8 && <span className="text-sm text-white font-semibold">{pct.toFixed(0)}%</span>}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {['z0', 'z1', 'z2', 'z3', 'z4', 'z5'].map((k, i) => (
                                                <div key={k} className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Z{i}</span>
                                                    <span className="text-base font-semibold text-foreground">{fmtNum(zones?.[k]?.min)} <span className="text-xs font-medium text-muted-foreground">min</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 7-Day ACWR Trend */}
                                <div className="p-5 rounded-2xl bg-secondary/5 border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">7-Day ACWR Trend</p>
                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500/70" /><span className="text-[11px] font-semibold text-muted-foreground uppercase">Optimal</span></div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500/70" /><span className="text-[11px] font-semibold text-muted-foreground uppercase">Caution</span></div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500/70" /><span className="text-[11px] font-semibold text-muted-foreground uppercase">Danger</span></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 h-44 mt-4 px-2">
                                        {/* Y-Axis Labels */}
                                        <div className="flex flex-col justify-between py-6 text-[9px] font-bold text-muted-foreground/40 w-6 select-none border-r border-border/10">
                                            <span>1.5</span>
                                            <span>1.0</span>
                                            <span>0.5</span>
                                            <span>0.0</span>
                                        </div>

                                        {/* Plot Area */}
                                        <div className="flex-1 relative py-6">
                                            {/* Baseline (Subtle) */}
                                            <div
                                                className="absolute left-0 right-0 border-t border-border/10 z-0"
                                                style={{ bottom: `${(1.0 / 1.5) * 100}%` }}
                                            />

                                            {/* Bars */}
                                            <div className="absolute inset-0 left-2 right-2 flex items-end justify-between gap-1.5 h-full pb-6">
                                                {trend.map((d, i) => (
                                                    <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group/trend relative">
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/trend:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                                            <div className="bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-3 min-w-[100px] text-center scale-90 group-hover/trend:scale-100 transition-all">
                                                                <p className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">{d.day}</p>
                                                                <p className="text-xl font-black text-foreground leading-none">{d.val?.toFixed(2)}</p>
                                                                <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase inline-block ${d.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-500' :
                                                                        d.status === 'Danger' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                                                                    }`}>
                                                                    {d.status === 'Low' ? 'CAUTION' : d.status}
                                                                </div>
                                                            </div>
                                                            <div className="w-2.5 h-2.5 bg-popover border-r border-b border-border rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                                        </div>

                                                        {/* Bar Track */}
                                                        <div className="w-full flex-1 flex flex-col items-center justify-end relative">
                                                            <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-2 rounded-full bg-secondary/10" />
                                                            <div
                                                                className={`w-2.5 rounded-full transition-all duration-700 relative z-10 ${d.status === 'Optimal' ? 'bg-emerald-500' :
                                                                        d.status === 'Danger' ? 'bg-red-500' :
                                                                            'bg-amber-500'
                                                                    }`}
                                                                style={{ height: `${Math.min((d.val / 1.5) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="absolute top-full mt-2 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{d.day}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-base font-semibold text-muted-foreground uppercase tracking-widest">No data for this day</p>
                    </div>
                )}

                {/* Footer */}
                <div className="px-8 py-4 border-t border-border bg-secondary/5 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold uppercase tracking-widest transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            window.location.href = `/dashboard?id=${athleteId}`;
                        }}
                        className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20"
                    >
                        View Full Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
