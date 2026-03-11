import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, AlertCircle, AlertTriangle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { fetchReportsSummary, fetchReportDetail } from '../utils/dataService';
import { ReportModal } from '../components/reports/ReportModal';

export default function Reports() {
    const [searchTerm, setSearchTerm] = useState('');
    const [teamData, setTeamData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [athleteData, setAthleteData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
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

    const getFlag = (acwr) => {
        const val = parseFloat(acwr);
        if (val > 1.3) return { label: 'Overtraining', color: 'bg-red-500/10 text-red-600', icon: AlertCircle };
        if (val < 0.8) return { label: 'Undertraining', color: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle };
        return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 };
    };

    const filteredAthletes = teamData.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = async (athlete, autoDownload = false) => {
        setSelectedAthlete(athlete);
        let data = athleteData[athlete.id];

        if (!data) {
            setLoadingStates(prev => ({ ...prev, [athlete.id]: true }));
            data = await fetchReportDetail(athlete.id);
            setAthleteData(prev => ({ ...prev, [athlete.id]: data }));
            setLoadingStates(prev => ({ ...prev, [athlete.id]: false }));
        }

        setModalData(data);
        setShouldAutoDownload(autoDownload);
        setIsModalOpen(true);
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
        <div className="min-h-screen bg-background pt-32 pb-12 shadow-none transition-colors duration-300">
            <div className="container mx-auto">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            Performance <span className="text-brand-500">reports</span>
                        </h1>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or id..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-border rounded-xl py-2 pl-12 pr-6 w-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-foreground font-bold"
                        />
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/30 text-muted-foreground uppercase text-xs font-black tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-6">Athlete</th>
                                    <th className="px-6 py-6 font-mono">ID</th>
                                    <th className="px-6 py-6">Sport</th>
                                    <th className="px-6 py-6">Avg HR</th>
                                    <th className="px-6 py-6">RMSSD</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredAthletes.length > 0 ? (
                                    filteredAthletes.map((athlete) => {
                                        const flag = getFlag(athlete.acwr);


                                        return (
                                            <tr key={athlete.id} className="group hover:bg-secondary/20 transition-all">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-lg font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                                                            {athlete.name?.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-foreground transition-colors tracking-tight text-lg">{athlete.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                                    {athlete.id}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-base font-medium text-foreground">{athlete.sport || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-lg font-bold text-foreground">{(athlete.avg_hr || 0).toFixed(1)} <small className="text-xs text-muted-foreground opacity-60">BPM</small></span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-lg font-bold text-foreground">{(athlete.rmssd || 0).toFixed(1)} <small className="text-xs text-muted-foreground opacity-60">MS</small></span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${flag.color}`}>
                                                        <flag.icon className="h-4 w-4" />
                                                        {flag.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => handleAction(athlete)}
                                                            disabled={loadingStates[athlete.id]}
                                                            title="View Report"
                                                            className="p-3 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all disabled:opacity-50 active:scale-95"
                                                        >
                                                            {loadingStates[athlete.id] ? (
                                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(athlete, true)}
                                                            disabled={loadingStates[athlete.id]}
                                                            title="Download Report"
                                                            className="p-3 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/20 transition-all disabled:opacity-50 active:scale-95"
                                                        >
                                                            <Download className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <AlertCircle className="h-10 w-10 opacity-20" />
                                                <p className="font-bold uppercase tracking-widest text-xs">No matching reports found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
