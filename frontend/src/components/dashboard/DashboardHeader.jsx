import React, { useState } from 'react';
import { Calendar, Users, ChevronDown, AlertCircle } from 'lucide-react';

export const DashboardHeader = ({
    activeTab,
    onTabChange,
    selectedAthlete,
    athletes,
    onAthleteChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) => {
    const [hoveredDisabled, setHoveredDisabled] = useState(false);

    const handleTabClick = (tabKey) => {
        if (tabKey !== 'overview' && !selectedAthlete) return;
        onTabChange(tabKey);
    };

    return (
        <div className="relative z-10 mb-8">
            <div className="bg-card border border-border rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Tabs */}
                    <div className="flex flex-col gap-2">
                        <div className="flex p-1.5 bg-muted/50 rounded-lg w-fit">
                            {['Overview', 'Training', 'Readiness', 'Comparison'].map((tab) => {
                                const tabKey = tab.toLowerCase().replace(' ', '');
                                const needsAthlete = tabKey !== 'overview';
                                const isDisabled = needsAthlete && !selectedAthlete;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabClick(tabKey)}
                                        onMouseEnter={() => isDisabled && setHoveredDisabled(true)}
                                        onMouseLeave={() => setHoveredDisabled(false)}
                                        className={`px-3 py-2 md:px-6 md:py-2.5 rounded-lg text-sm md:text-base font-bold transition-all duration-200 ${activeTab === tabKey
                                            ? "bg-brand-500 text-white shadow-sm"
                                            : isDisabled
                                                ? "text-muted-foreground/40 cursor-not-allowed"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                        {hoveredDisabled && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                Select an athlete first
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Athlete Selector */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:border-brand-500/50 transition-colors cursor-pointer">
                                <Users className="h-4 w-4 text-brand-500" />
                                <select
                                    value={selectedAthlete?.id || ""}
                                    onChange={(e) => {
                                        const athlete = athletes.find(a => a.id === e.target.value);
                                        onAthleteChange(athlete || null);
                                    }}
                                    className="bg-background text-foreground border-none text-base font-bold focus:ring-0 outline-none appearance-none pr-6 cursor-pointer"
                                >
                                    <option value="">Select athlete</option>
                                    {athletes.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="h-3 w-3 absolute right-3 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Date Range Selector */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg">
                            <Calendar className="h-4 w-4 text-brand-500" />
                            <div className="flex items-center gap-1">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange(e.target.value)}
                                    className="bg-background text-foreground border-none text-sm font-bold focus:ring-0 outline-none w-32 placeholder:text-muted-foreground uppercase"
                                />
                                <span className="text-muted-foreground text-sm font-bold">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange(e.target.value)}
                                    className="bg-background text-foreground border-none text-sm font-bold focus:ring-0 outline-none w-32 placeholder:text-muted-foreground uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
