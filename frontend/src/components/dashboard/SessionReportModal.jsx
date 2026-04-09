import React, { useEffect, useState } from 'react';
import { X, Activity, Heart, Zap, History, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { fetchAthleteReport } from '../../utils/dataService';

export const SessionReportModal = ({ isOpen, onClose, athleteId, athleteName }) => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (isOpen && athleteId) {
            const load = async () => {
                setLoading(true);
                try {
                    const data = await fetchAthleteReport(athleteId);
                    setReport(data);
                } catch (err) {
                    console.error("Failed to load report:", err);
                }
                setLoading(false);
            };
            load();
        }
    }, [isOpen, athleteId]);

    if (!isOpen) return null;

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (s?.includes('ready') && !s.includes('not')) return 'text-emerald-500';
        if (s?.includes('partial')) return 'text-amber-500';
        if (s?.includes('not ready')) return 'text-red-500';
        return 'text-brand-500';
    };

    const getStatusBg = (status) => {
        const s = status?.toLowerCase();
        if (s?.includes('ready') && !s.includes('not')) return 'bg-emerald-500/10';
        if (s?.includes('partial')) return 'bg-amber-500/10';
        if (s?.includes('not ready')) return 'bg-red-500/10';
        return 'bg-brand-500/10';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header Section */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0 bg-secondary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            <Activity className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">{athleteName}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Latest Session Report</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center h-96 gap-4 bg-background/50">
                        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Analyzing Session...</p>
                    </div>
                ) : report ? (
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

                        {/* 1. Today's Readiness Banner */}
                        <div className="p-8 rounded-3xl bg-secondary/10 border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                            {/* Decorative glow */}
                            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 -mr-32 -mt-32 transition-colors ${getStatusBg(report.readiness.status)}`} />

                            <div className="flex items-center gap-6 z-10">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getStatusColor(report.readiness.status)} border-current/20`}>
                                    <Heart className="h-8 w-8" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Today's Readiness</p>
                                    <h2 className={`text-3xl font-black tracking-tight ${getStatusColor(report.readiness.status)}`}>
                                        {report.readiness.status === 'READY' ? 'Good to train' : report.readiness.status}
                                    </h2>
                                    <p className="text-sm font-medium text-muted-foreground mt-1">
                                        {report.readiness.reasoning}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end z-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-foreground">{report.readiness.score}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Readiness Score</span>
                                </div>
                                <div className="flex gap-1 mt-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-8 rounded-full ${i <= (report.readiness.score / 16)
                                                ? (report.readiness.score > 70 ? 'bg-emerald-500' : 'bg-amber-500')
                                                : 'bg-muted'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Load and Exertion Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-secondary/5 border border-border flex items-center justify-between group hover:border-brand-500/30 transition-colors">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Training Load</p>
                                    <h4 className="text-2xl font-black text-foreground">{report.training.load}</h4>
                                    <div className="mt-3 flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1.5 w-6 rounded-full ${report.training.load === 'High' && i <= 3 ? 'bg-red-500' : report.training.load === 'Moderate' && i <= 2 ? 'bg-amber-500' : i === 1 ? 'bg-emerald-500' : 'bg-muted'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-brand-500" />
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-secondary/5 border border-border flex items-center justify-between group hover:border-brand-500/30 transition-colors">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Exertion Level</p>
                                    <h4 className="text-2xl font-black text-foreground">{report.training.exertion}</h4>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{report.training.exertion}</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Resting HR', value: report.metrics.rhr, unit: 'bpm', diff: report.metrics.rhr_diff, inverse: true, desc: 'vs baseline' },
                                { label: 'HRV (RMSSD)', value: report.metrics.rmssd, unit: 'ms', diff: report.metrics.rmssd_diff, inverse: false, desc: 'this week' },
                                { label: 'ACWR', value: report.metrics.acwr, unit: '', diff: null, desc: report.metrics.acwr > 1.3 ? 'Elevated' : 'Optimal zone' }
                            ].map((m, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-secondary/5 border border-border">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{m.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-foreground">{m.value}</span>
                                        <span className="text-xs font-bold text-muted-foreground">{m.unit}</span>
                                    </div>
                                    <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${m.diff === null
                                        ? (report.metrics.acwr > 1.3 ? 'text-amber-500' : 'text-emerald-500')
                                        : ((m.diff > 0 && !m.inverse) || (m.diff < 0 && m.inverse) ? 'text-emerald-500' : 'text-red-500')
                                        }`}>
                                        {m.diff !== null && (m.diff > 0 ? '↑' : '↓')}
                                        <span>{m.diff !== null ? `${Math.abs(m.diff)} ${m.unit}` : ''} {m.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 4. Last Session and ACWR Trend */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                            {/* Last Session */}
                            <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-secondary/10 border border-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <History className="h-24 w-24 text-foreground/10" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <History className="h-4 w-4 text-brand-500" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Session: {report.lastSession.type}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Duration</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-foreground">{report.lastSession.duration}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase">min</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">EPOC</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-foreground">{report.lastSession.epoc}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold">ml/kg</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">ACWR Delta</p>
                                            <span className={`text-2xl font-black ${report.lastSession.acwr_delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {report.lastSession.acwr_delta >= 0 ? '+' : ''}{report.lastSession.acwr_delta.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Finished on {report.lastSession.date}
                                    </div>
                                </div>
                            </div>

                            {/* 7-Day ACWR Trend */}
                            <div className="md:col-span-3 p-8 rounded-[2.5rem] bg-secondary/10 border border-border">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-brand-500" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">7-Day ACWR Trend</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-1 rounded-full bg-emerald-500/50" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Optimal</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-1 rounded-full bg-amber-500/50" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Caution</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between gap-2 h-32 px-2">
                                    {report.trend.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center group/trend">
                                            <div
                                                className={`w-full max-w-[40px] rounded-lg transition-all border ${d.status === 'Optimal' ? 'bg-emerald-500/20 border-emerald-500/30 group-hover/trend:bg-emerald-500' :
                                                        d.status === 'Danger' ? 'bg-red-500/30 border-red-500/40 group-hover/trend:bg-red-500' :
                                                            'bg-amber-500/30 border-amber-500/40 group-hover/trend:bg-amber-500'
                                                    }`}
                                                style={{ height: `${Math.min(Math.max((d.val || 0.1) * 50, 15), 100)}%` }}
                                            />
                                            <span className="text-[10px] font-black text-muted-foreground mt-4 uppercase tracking-tighter">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No report available for this period</p>
                    </div>
                )}

                {/* Footer Action */}
                <div className="px-8 py-6 border-t border-border bg-secondary/5 flex justify-end gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Close Report
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            window.location.href = `/dashboard?id=${athleteId}`;
                        }}
                        className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20"
                    >
                        View Full Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
