import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Download, AlertCircle, Calendar, Activity, Heart, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fetchReportsSummary, fetchReportDetail } from '../utils/dataService';
import { ReportModal } from '../components/reports/ReportModal';

export default function Reports() {
    const [searchTerm, setSearchTerm] = useState('');
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [sessionsCache, setSessionsCache] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const summary = await fetchReportsSummary();
                setTeamData(summary);
            } catch (err) {
                console.error("Error loading reports data:", err);
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const filteredAthletes = useMemo(() =>
        teamData.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.id.toLowerCase().includes(searchTerm.toLowerCase())
        ), [teamData, searchTerm]);

    const handleSelectAthlete = async (athlete) => {
        setSelectedAthlete(athlete);

        if (sessionsCache[athlete.id]) {
            setSessions(sessionsCache[athlete.id]);
            return;
        }

        setLoadingSessions(true);
        setSessions([]);
        try {
            const data = await fetchReportDetail(athlete.id);
            setSessions(data);
            setSessionsCache(prev => ({ ...prev, [athlete.id]: data }));
        } catch (err) {
            console.error("Error loading sessions:", err);
        }
        setLoadingSessions(false);
    };

    const handleViewReport = (_athlete, sessionData, autoDownload = false) => {
        setModalData(sessionData);
        setShouldAutoDownload(autoDownload);
        setIsModalOpen(true);
    };

    // Group sessions by date (newest first)
    const groupedSessions = useMemo(() => {
        if (!sessions.length) return [];

        const reversed = [...sessions].reverse();
        const groups = {};
        for (const s of reversed) {
            const dateKey = s.date;
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(s);
        }
        return Object.entries(groups);
    }, [sessions]);

    const getSessionTypeStyle = (type) => {
        if (type?.toLowerCase().includes('training')) return { bg: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30', icon: Zap };
        if (type?.toLowerCase().includes('readiness')) return { bg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', icon: Heart };
        return { bg: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30', icon: Activity };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">Loading Reports...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 transition-colors duration-300">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                        Session <span className="text-brand-500">reports</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-bold">Select an athlete to view their session history and generate reports.</p>
                </div>

                {/* Split Panel Layout */}
                <div className="flex gap-6 items-start" style={{ minHeight: 'calc(100vh - 280px)' }}>

                    {/* Left Sidebar — Athlete List */}
                    <div className="w-80 shrink-0 bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        {/* Search */}
                        <div className="p-4 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search athletes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Athlete List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredAthletes.length > 0 ? filteredAthletes.map((athlete) => (
                                <button
                                    key={athlete.id}
                                    onClick={() => handleSelectAthlete(athlete)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 border-b border-border/30 hover:bg-brand-500/5 ${selectedAthlete?.id === athlete.id
                                        ? 'bg-brand-500/10 border-l-4 border-l-brand-500'
                                        : 'border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-colors duration-200 ${selectedAthlete?.id === athlete.id
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                                        }`}>
                                        {athlete.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-bold text-base truncate transition-colors tracking-tight ${selectedAthlete?.id === athlete.id ? 'text-brand-500' : 'text-foreground'}`}>
                                            {athlete.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-bold truncate">
                                            {athlete.sport || 'Athlete'} · <span className="font-mono uppercase tracking-widest">{athlete.id}</span>
                                        </p>
                                    </div>
                                </button>
                            )) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-black uppercase tracking-widest">No athletes found</p>
                                </div>
                            )}
                        </div>

                        {/* Count footer */}
                        <div className="px-4 py-3 border-t border-border bg-secondary/20">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Right Panel — Session Timeline */}
                    <div className="flex-1 min-w-0">
                        {!selectedAthlete ? (
                            /* Empty state */
                            <div className="h-full flex items-center justify-center bg-card border border-border rounded-xl shadow-md" style={{ minHeight: 'calc(100vh - 280px)' }}>
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                                        <Activity className="h-10 w-10 text-brand-500 opacity-60" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground mb-2">Select an athlete</h3>
                                    <p className="text-muted-foreground font-bold text-sm max-w-sm mx-auto">
                                        Choose an athlete from the sidebar to view their session timeline and generate reports.
                                    </p>
                                </div>
                            </div>
                        ) : loadingSessions ? (
                            /* Loading sessions */
                            <div className="h-full flex items-center justify-center bg-card border border-border rounded-xl shadow-md" style={{ minHeight: 'calc(100vh - 280px)' }}>
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 mx-auto border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">Loading sessions...</p>
                                </div>
                            </div>
                        ) : (
                            /* Session Timeline */
                            <div className="space-y-6">
                                {/* Athlete header bar */}
                                <div className="bg-card border border-border rounded-xl shadow-md p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xl font-black">
                                            {selectedAthlete.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight text-foreground">{selectedAthlete.name}</h2>
                                            <p className="text-sm text-muted-foreground font-bold">
                                                {selectedAthlete.sport || 'Athlete'} · <span className="font-mono uppercase tracking-widest">{selectedAthlete.id}</span> · {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleViewReport(selectedAthlete, sessions)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-black uppercase text-sm tracking-widest hover:bg-brand-700 transition-colors shadow-sm"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Full Report
                                        </button>
                                        <button
                                            onClick={() => handleViewReport(selectedAthlete, sessions, true)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-foreground font-black uppercase text-sm tracking-widest hover:bg-secondary/80 border border-border transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                                    {groupedSessions.length > 0 ? groupedSessions.map(([dateStr, daySessions]) => (
                                        <div key={dateStr}>
                                            {/* Date header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                                                    <Calendar className="h-3.5 w-3.5 text-brand-500" />
                                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                                                        {format(new Date(dateStr), 'EEE, MMM dd yyyy')}
                                                    </span>
                                                </div>
                                                <div className="flex-1 h-px bg-border"></div>
                                            </div>

                                            {/* Session cards for this date */}
                                            <div className="space-y-3 ml-2">
                                                {daySessions.map((session, idx) => {
                                                    const typeStyle = getSessionTypeStyle(session.session_type);
                                                    const TypeIcon = typeStyle.icon;
                                                    return (
                                                        <div
                                                            key={`${dateStr}-${idx}`}
                                                            className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                                                        >
                                                            <div className="p-5 flex items-center gap-5">
                                                                {/* Timeline dot */}
                                                                <div className="flex flex-col items-center self-stretch shrink-0">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${typeStyle.bg}`}>
                                                                        <TypeIcon className="h-5 w-5" />
                                                                    </div>
                                                                    {idx < daySessions.length - 1 && (
                                                                        <div className="w-px flex-1 bg-border/60 mt-2"></div>
                                                                    )}
                                                                </div>

                                                                {/* Session info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider border ${typeStyle.bg}`}>
                                                                            {session.session_type || 'Session'}
                                                                        </span>
                                                                        {session.session && (
                                                                            <span className="text-sm text-muted-foreground font-bold">
                                                                                {session.session}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-6 text-base">
                                                                        {session.avg_hr > 0 && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Heart className="h-4 w-4 text-red-400" />
                                                                                <span className="font-bold text-foreground">{session.avg_hr.toFixed(0)}</span>
                                                                                <span className="text-xs text-muted-foreground font-bold uppercase">bpm</span>
                                                                            </div>
                                                                        )}
                                                                        {session.training_load > 0 && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Zap className="h-4 w-4 text-amber-400" />
                                                                                <span className="font-bold text-foreground">{session.training_load.toFixed(0)}</span>
                                                                                <span className="text-xs text-muted-foreground font-bold uppercase">load</span>
                                                                            </div>
                                                                        )}
                                                                        {session.rmssd > 0 && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Activity className="h-4 w-4 text-emerald-400" />
                                                                                <span className="font-bold text-foreground">{session.rmssd.toFixed(1)}</span>
                                                                                <span className="text-xs text-muted-foreground font-bold uppercase">rmssd</span>
                                                                            </div>
                                                                        )}
                                                                        {session.acwr > 0 && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Clock className="h-4 w-4 text-blue-400" />
                                                                                <span className="font-bold text-foreground">{session.acwr.toFixed(2)}</span>
                                                                                <span className="text-xs text-muted-foreground font-bold uppercase">acwr</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleViewReport(selectedAthlete, sessions)}
                                                                        title="View Report"
                                                                        className="p-2.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleViewReport(selectedAthlete, sessions, true)}
                                                                        title="Download Report"
                                                                        className="p-2.5 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/20 transition-all"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-card border border-border rounded-xl shadow-md p-16 text-center">
                                            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                                            <p className="font-black uppercase tracking-widest text-xs text-muted-foreground">No sessions found for this athlete</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setShouldAutoDownload(false);
                }}
                athlete={selectedAthlete}
                reportData={modalData}
                autoDownload={shouldAutoDownload}
            />
        </div>
    );
}
