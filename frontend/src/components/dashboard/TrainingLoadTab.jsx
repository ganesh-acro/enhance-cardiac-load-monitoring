import {
    TrainingLoadTrendChart,
    OxygenDebtChart,
    EnergyChart,
    MovementTrendChart,
    OxygenConsumptionChart,
    WeeklyZoneStackChart,
    TrainingEffectChart,
    ExerciseDurationChart
} from './FeatureCharts';

export const TrainingLoadTab = ({ primaryChartData, primaryLabel }) => {

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
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Training load trend
                    </h5>
                    {primaryChartData.training && primaryChartData.training.length > 0 ? (
                        <TrainingLoadTrendChart
                            data={primaryChartData.training}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No training load data found for this period.
                        </div>
                    )}
                </div>

                {/* 2. Training Effect (Aerobic & Anaerobic) */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Training effect
                    </h5>
                    {primaryChartData.training_effect && primaryChartData.training_effect.length > 0 ? (
                        <TrainingEffectChart
                            data={primaryChartData.training_effect}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No training effect data found for this period.
                        </div>
                    )}
                </div>

                {/* 3. Exercise Duration */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Exercise duration
                    </h5>
                    {primaryChartData.exercise_duration && primaryChartData.exercise_duration.length > 0 ? (
                        <ExerciseDurationChart
                            data={primaryChartData.exercise_duration}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No exercise duration data found for this period.
                        </div>
                    )}
                </div>

                {/* 4. Oxygen Debt */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        EPOC (Oxygen debt)
                    </h5>
                    {primaryChartData.oxygen_debt && primaryChartData.oxygen_debt.length > 0 ? (
                        <OxygenDebtChart
                            data={primaryChartData.oxygen_debt}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No EPOC data found for this period.
                        </div>
                    )}
                </div>

                {/* 5. Energy Expenditure */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Energy expenditure (kcal)
                    </h5>
                    {primaryChartData.energy && primaryChartData.energy.length > 0 ? (
                        <EnergyChart
                            data={primaryChartData.energy}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No energy expenditure data found for this period.
                        </div>
                    )}
                </div>

                {/* 6. Movement Trend */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Movement load
                    </h5>
                    {primaryChartData.movement && primaryChartData.movement.length > 0 ? (
                        <MovementTrendChart
                            data={primaryChartData.movement}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No movement load data found for this period.
                        </div>
                    )}
                </div>

                {/* 7. Oxygen Consumption */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        VO2 max estimate
                    </h5>
                    {primaryChartData.oxygen_consumption && primaryChartData.oxygen_consumption.length > 0 ? (
                        <OxygenConsumptionChart
                            data={primaryChartData.oxygen_consumption}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No VO2 data found for this period.
                        </div>
                    )}
                </div>

                {/* 8. Weekly Zone Distribution */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Zone distribution
                    </h5>
                    {primaryChartData.weekly && primaryChartData.weekly.length > 0 ? (
                        <WeeklyZoneStackChart
                            data={primaryChartData.weekly}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No weekly zone distribution data found for this period.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
