import React from 'react';
import { Calendar, Users, ChevronDown } from 'lucide-react';

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
    return (
        <div className="relative z-10 mb-8">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-4 md:p-6 backdrop-blur-md bg-opacity-90">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-muted/50 rounded-xl w-fit">
                        {['Overview', 'Training', 'Readiness', 'Comparison'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab.toLowerCase().replace(' ', ''))}
                                className={`px-6 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${activeTab === tab.toLowerCase().replace(' ', '')
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Athlete Selector */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:border-brand-500/50 transition-all cursor-pointer">
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl">
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
