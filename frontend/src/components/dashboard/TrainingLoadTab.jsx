import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import {
    TrainingLoadTrendChart,
    OxygenDebtChart,
    EnergyChart,
    ACWRChartCombined,
    OxygenConsumptionChart,
    WeeklyZoneStackChart,
    TrainingEffectChart,
    ExerciseDurationChart
} from './FeatureCharts';
import { ChartCustomizer, PrefLabel, PrefSegmented, PrefToggle } from './ChartCustomizer';
import { useChartPrefs } from '../../hooks/useChartPrefs';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { CustomChart } from './CustomChart';
import { AddChartCard } from './AddChartCard';
import { AddChartModal } from './AddChartModal';

const CHART_INFO = {
    trainingLoad: {
        title: "Training Load Trend",
        desc: "Training load (AU) per session over time. Low < 84 AU, Moderate 84–128 AU, High > 128 AU. High sessions require 48–72h recovery before the next hard effort."
    },
    trainingEffect: {
        title: "Training Effect",
        desc: "Aerobic (1–5) and Anaerobic (1–5) benefit scores per session. Values ≥ 3 indicate a meaningful stimulus; ≥ 4 indicates significant improvement for that system."
    },
    duration: {
        title: "Exercise Duration",
        desc: "Session duration in minutes. Longer low-intensity sessions build aerobic base; shorter high-intensity sessions drive peak adaptations."
    },
    epoc: {
        title: "EPOC (Oxygen Debt)",
        desc: "Excess post-exercise oxygen consumption in kJ — a proxy for session intensity and recovery demand. Values > 600 kJ signal a peak effort requiring extended recovery."
    },
    energy: {
        title: "Energy Expenditure",
        desc: "Total kilocalories burned per session. Reflects the overall metabolic cost of training and helps track energy balance over the period."
    },
    acwr: {
        title: "Acute:Chronic Workload Ratio",
        desc: "Ratio of 7-day acute load to 28-day chronic load. Optimal range: 0.8–1.3. Below 0.8 = underloaded; above 1.3 = elevated injury risk from a load spike."
    },
    vo2: {
        title: "VO2 Max Estimate",
        desc: "Estimated maximal oxygen uptake (ml/kg/min). Higher values reflect better aerobic capacity. Recreational: 35–45, Trained: 50–60, Elite: > 65."
    },
    zones: {
        title: "Zone Distribution",
        desc: "Weekly time in each HR zone (Z0–Z5). A polarised approach targets ~80% in Z1–Z2 and ~20% in Z4–Z5. High Z5 volume without adequate Z1–Z2 base increases injury risk."
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

export const TrainingLoadTab = ({ primaryChartData }) => {

    // Per-user preferences for the Training Load Trend chart
    const [loadPrefs, setLoadPrefs, resetLoadPrefs] = useChartPrefs('trainingLoadTrend', {
        chartType: 'bar',       // 'bar' | 'line' | 'area'
        showIntensity: true,
        showThresholds: false,
    });

    // Per-user customisable widgets for this tab (persisted in localStorage,
    // keyed by auth email). Only user-added widgets live here; the default
    // charts above stay as-is.
    const { items: customWidgets, addItem, removeItem, updateItem } = useDashboardLayout('training');
    const [modalState, setModalState] = useState({ open: false, editingId: null });

    const openAddModal = () => setModalState({ open: true, editingId: null });
    const openEditModal = (id) => setModalState({ open: true, editingId: id });
    const closeModal = () => setModalState({ open: false, editingId: null });

    const editingWidget = customWidgets.find(w => w.id === modalState.editingId);

    const handleSubmit = ({ title, series }) => {
        if (modalState.editingId) {
            updateItem(modalState.editingId, { title, series });
        } else {
            addItem({ title, series });
        }
    };

    if (!primaryChartData) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No training data available.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pt-6 pb-12">
            <div className="grid grid-cols-1 gap-12">
                {/* 1. Training Load Trend */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <div className="flex items-start justify-between mb-4">
                        <h5 className="text-2xl font-normal text-foreground dark:text-white inline-flex items-center">
                            Training load trend<ChartInfoPopup chartKey="trainingLoad" />
                        </h5>
                        <ChartCustomizer onReset={resetLoadPrefs}>
                            {() => (
                                <>
                                    <div>
                                        <PrefLabel>Chart type</PrefLabel>
                                        <PrefSegmented
                                            value={loadPrefs.chartType}
                                            onChange={v => setLoadPrefs({ chartType: v })}
                                            options={[
                                                { value: 'bar', label: 'Bar' },
                                                { value: 'line', label: 'Line' },
                                                { value: 'area', label: 'Area' },
                                            ]}
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-border/50">
                                        <PrefToggle
                                            checked={loadPrefs.showIntensity}
                                            onChange={v => setLoadPrefs({ showIntensity: v })}
                                            label="Intensity overlay"
                                            description="Show the orange intensity line on the right axis."
                                        />
                                    </div>
                                    <div>
                                        <PrefToggle
                                            checked={loadPrefs.showThresholds}
                                            onChange={v => setLoadPrefs({ showThresholds: v })}
                                            label="Threshold bands"
                                            description="Shade Low / Moderate / High AU reference zones."
                                        />
                                    </div>
                                </>
                            )}
                        </ChartCustomizer>
                    </div>
                    {primaryChartData.training && primaryChartData.training.length > 0 ? (
                        <TrainingLoadTrendChart data={primaryChartData.training} preferences={loadPrefs} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No training load data found for this period.
                        </div>
                    )}
                </div>

                {/* 2. Training Effect */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Training effect<ChartInfoPopup chartKey="trainingEffect" />
                    </h5>
                    {primaryChartData.training_effect && primaryChartData.training_effect.length > 0 ? (
                        <TrainingEffectChart data={primaryChartData.training_effect} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No training effect data found for this period.
                        </div>
                    )}
                </div>

                {/* 3. Exercise Duration */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Exercise duration<ChartInfoPopup chartKey="duration" />
                    </h5>
                    {primaryChartData.exercise_duration && primaryChartData.exercise_duration.length > 0 ? (
                        <ExerciseDurationChart data={primaryChartData.exercise_duration} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No exercise duration data found for this period.
                        </div>
                    )}
                </div>

                {/* 4. EPOC */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        EPOC (Oxygen debt)<ChartInfoPopup chartKey="epoc" />
                    </h5>
                    {primaryChartData.oxygen_debt && primaryChartData.oxygen_debt.length > 0 ? (
                        <OxygenDebtChart data={primaryChartData.oxygen_debt} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No EPOC data found for this period.
                        </div>
                    )}
                </div>

                {/* 5. Energy Expenditure */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Energy expenditure (kcal)<ChartInfoPopup chartKey="energy" />
                    </h5>
                    {primaryChartData.energy && primaryChartData.energy.length > 0 ? (
                        <EnergyChart data={primaryChartData.energy} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No energy expenditure data found for this period.
                        </div>
                    )}
                </div>

                {/* 6. ACWR (moved from Readiness) */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Acute:chronic workload ratio<ChartInfoPopup chartKey="acwr" />
                    </h5>
                    {primaryChartData.acwr && primaryChartData.acwr.length > 0 ? (
                        <ACWRChartCombined data={primaryChartData.acwr} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No workload data (ACWR) found for this period.
                        </div>
                    )}
                </div>

                {/* 7. VO2 Max */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        VO2 max estimate<ChartInfoPopup chartKey="vo2" />
                    </h5>
                    {primaryChartData.oxygen_consumption && primaryChartData.oxygen_consumption.length > 0 ? (
                        <OxygenConsumptionChart data={primaryChartData.oxygen_consumption} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No VO2 data found for this period.
                        </div>
                    )}
                </div>

                {/* 8. Zone Distribution */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Zone distribution<ChartInfoPopup chartKey="zones" />
                    </h5>
                    {primaryChartData.weekly && primaryChartData.weekly.length > 0 ? (
                        <WeeklyZoneStackChart data={primaryChartData.weekly} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No weekly zone distribution data found for this period.
                        </div>
                    )}
                </div>

                {/* User-added custom charts (persisted per user) */}
                {customWidgets.map(w => (
                    <CustomChart
                        key={w.id}
                        widget={w}
                        data={primaryChartData}
                        onDelete={() => {
                            if (window.confirm('Delete this custom chart?')) {
                                removeItem(w.id);
                            }
                        }}
                        onEdit={() => openEditModal(w.id)}
                    />
                ))}

                {/* Add-chart tile — always last */}
                <AddChartCard onClick={openAddModal} />
            </div>

            <AddChartModal
                open={modalState.open}
                onClose={closeModal}
                onSubmit={handleSubmit}
                tab="training"
                initial={editingWidget
                    ? { title: editingWidget.title, series: editingWidget.series }
                    : null}
            />
        </div>
    );
};
