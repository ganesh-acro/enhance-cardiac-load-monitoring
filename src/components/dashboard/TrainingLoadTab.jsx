import {
    TrainingLoadTrendChart,
    OxygenDebtChart,
    EnergyChart,
    MovementTrendChart,
    OxygenConsumptionChart,
    WeeklyZoneStackChart,
    ACWRChartCombined
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
                        Training Load Trend
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

                {/* 2. Oxygen Debt */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        EPOC (Oxygen Debt)
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

                {/* 4. Energy Expenditure */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Energy Expenditure (kcal)
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

                {/* 5. Movement Trend */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Movement Load
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

                {/* 6. Oxygen Consumption */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        VO2 Max Estimate
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

                {/* 7. Weekly Zone Distribution */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-[#64748b] mb-4">
                        Zone Distribution
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
