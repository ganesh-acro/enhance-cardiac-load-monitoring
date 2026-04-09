import React, { useState, useEffect } from 'react';
import { Users, Calendar, ArrowRight, X, Heart, Zap, MessageSquare, TrendingUp } from 'lucide-react';
import {
    HeartRateComparisonChart,
    TrainingLoadComparisonChart,
    HRVComparisonChart,
    OxygenDebtComparisonChart,
    EnergyComparisonChart,
    MovementComparisonChart,
    OxygenConsumptionComparisonChart,
    ZoneComparisonChart,
    ACWRComparisonChart,
    PairwiseGapChart,
    PairwiseZoneComparison
} from './ComparisonCharts';

export const ComparisonTab = ({
    athletes,
    selectedAthlete,
    compareType,
    setCompareType,
    secondaryAthlete,
    setSecondaryAthlete,
    secondaryStartDate,
    setSecondaryStartDate,
    secondaryEndDate,
    setSecondaryEndDate,
    primaryChartData,
    secondaryChartData,
    resetComparison
}) => {
    const [activeSubTab, setActiveSubTab] = useState('readiness');
    const [selectedMetric, setSelectedMetric] = useState('hr');

    const getInitialValue = () => {
        if (compareType === 'athlete' && secondaryAthlete) return `athlete-${secondaryAthlete.id}`;
        if (compareType === 'period') return 'period';
        return 'none';
    };

    const metrics = [
        { id: 'hr', name: 'Heart Rate', component: HeartRateComparisonChart, dataKey: 'hr' },
        { id: 'training', name: 'Training Load', component: TrainingLoadComparisonChart, dataKey: 'training' },
        { id: 'hrv', name: 'HRV', component: HRVComparisonChart, dataKey: 'hrv' },
        { id: 'oxygen_debt', name: 'Oxygen Debt', component: OxygenDebtComparisonChart, dataKey: 'oxygen_debt' },
        { id: 'energy', name: 'Energy Expenditure', component: EnergyComparisonChart, dataKey: 'energy' },
        { id: 'movement', name: 'Movement Load', component: MovementComparisonChart, dataKey: 'movement' },
        { id: 'oxygen_consumption', name: 'Oxygen Consumption', component: OxygenConsumptionComparisonChart, dataKey: 'oxygen_consumption' },
        { id: 'zones', name: 'Zone Distribution', component: ZoneComparisonChart, dataKey: 'zones' },
        { id: 'acwr', name: 'ACWR', component: ACWRComparisonChart, dataKey: 'acwr' }
    ];

    const handleCompareChange = (value) => {
        if (value === 'none') {
            resetComparison();
        } else if (value.startsWith('athlete-')) {
            const athleteId = value.replace('athlete-', '');
            setCompareType('athlete');
            setSecondaryAthlete(athletes.find(a => a.id === athleteId));
        }
    };

    if (!primaryChartData) return null;

    const primaryName = selectedAthlete?.name || "Athlete";
    let secondaryName = "Comparison";
    if (compareType === 'athlete' && secondaryAthlete) {
        secondaryName = secondaryAthlete.name;
    }

    const pairwiseData = secondaryChartData?.pairwise;
    const secondaryCharts = secondaryChartData?.charts;
    const selectedMetricObj = metrics.find(m => m.id === selectedMetric) || metrics[0];
    const ActiveChartComponent = selectedMetricObj.component;

    const subTabs = [
        { id: 'readiness', name: 'Readiness Comparison', icon: Heart },
        { id: 'training', name: 'Training Comparison', icon: Zap }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Control Panel */}
            <div className="p-5 lg:p-8 rounded-xl border border-border bg-card shadow-sm sticky top-24 z-30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-8">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="p-4 rounded-xl bg-brand-500/10 text-brand-500">
                            <Users className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                Comparison <span className="text-brand-500">engine</span>
                            </h2>
                            <p className="text-sm tracking-widest text-muted-foreground font-semibold uppercase">
                                {primaryName} <span className="text-muted-foreground/30 mx-2">vs</span> {secondaryName}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 w-full md:max-w-3xl flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 w-full relative group">
                            <label className="text-xs font-bold text-muted-foreground tracking-widest absolute -top-2.5 left-3 bg-card px-2 z-10 transition-colors group-hover:text-brand-500 uppercase">Compare with</label>
                            <select
                                value={getInitialValue()}
                                onChange={(e) => handleCompareChange(e.target.value)}
                                className="w-full px-5 py-4 bg-background border border-border rounded-xl text-lg font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none transition-all hover:border-brand-500/50 cursor-pointer"
                            >
                                <option value="none">-- Select Comparison Source --</option>
                                <optgroup label="Other Athletes">
                                    {athletes.filter(a => a.id !== selectedAthlete?.id).map(a => (
                                        <option key={a.id} value={`athlete-${a.id}`}>{a.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {secondaryAthlete && (
                            <button
                                onClick={resetComparison}
                                className="p-4 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                                title="Reset Comparison"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-tabs when comparing */}
                {secondaryAthlete && (
                    <div className="flex border-t border-border mt-6 pt-6 gap-2">
                        {subTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition-all uppercase tracking-widest text-xs border ${activeSubTab === tab.id
                                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {secondaryChartData && secondaryAthlete ? (
                <div className="animate-in zoom-in-95 fade-in duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Analysis Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="p-8 lg:p-10 rounded-2xl border border-border bg-card shadow-sm overflow-hidden relative group">
                                <div className="min-h-[450px] w-full">
                                    {activeSubTab === 'readiness' ? (
                                        <PairwiseGapChart
                                            data={pairwiseData?.readiness}
                                            metricKey="rmssd"
                                            label="RMSSD"
                                            unit="ms"
                                            primaryName={primaryName}
                                            secondaryName={secondaryName}
                                        />
                                    ) : (
                                        <PairwiseGapChart
                                            data={pairwiseData?.training}
                                            metricKey="acwr"
                                            label="ACWR"
                                            unit=""
                                            primaryName={primaryName}
                                            secondaryName={secondaryName}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Optional: Individual Metric fallback */}
                            <div className="p-8 lg:p-10 rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Detailed Trend Comparison
                                    </h3>
                                    <select
                                        value={selectedMetric}
                                        onChange={(e) => setSelectedMetric(e.target.value)}
                                        className="bg-transparent border-none text-brand-500 font-bold outline-none cursor-pointer text-sm uppercase tracking-widest"
                                    >
                                        {metrics.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="h-[400px]">
                                    <ActiveChartComponent
                                        primaryData={primaryChartData[selectedMetricObj.dataKey]}
                                        secondaryData={secondaryCharts ? secondaryCharts[selectedMetricObj.dataKey] : null}
                                        primaryName={primaryName}
                                        secondaryName={secondaryName}
                                        compareType={compareType}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Insights Sidebar */}
                        <div className="space-y-8">
                            <div className="p-8 rounded-2xl border border-border bg-card shadow-sm h-full flex flex-col">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Performance Insights
                                </h3>

                                <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                                    {(activeSubTab === 'readiness' ? pairwiseData?.readiness : pairwiseData?.training)?.map((day, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                            <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2 opacity-70">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                                {day.feedback}
                                            </p>

                                            {activeSubTab === 'training' && day.zones_a && (
                                                <div className="mt-4 pt-4 border-t border-border/20">
                                                    <PairwiseZoneComparison
                                                        sessionA={day.zones_a}
                                                        sessionB={day.zones_b}
                                                        primaryName={primaryName}
                                                        secondaryName={secondaryName}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )).reverse()}

                                    {(!(activeSubTab === 'readiness' ? pairwiseData?.readiness : pairwiseData?.training)?.length) && (
                                        <div className="h-40 flex flex-col items-center justify-center text-center opacity-50">
                                            <Users className="h-8 w-8 mb-4" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No shared sessions found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-muted/5 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Ready to compare</h3>
                    <p className="text-muted-foreground font-semibold text-sm tracking-widest max-w-sm text-center">
                        Select a teammate from the control bar above to generate the advanced comparison analysis.
                    </p>
                </div>
            )}
        </div>
    );
};
