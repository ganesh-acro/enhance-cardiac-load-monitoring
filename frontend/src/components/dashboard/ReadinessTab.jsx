import React from 'react';
import { HeartRateChart, HRVMultiLineChart, RecoveryBeatsChart, ACWRChartCombined } from './FeatureCharts';
import { Heart, Activity, RefreshCw } from 'lucide-react';

export const ReadinessTab = ({ primaryChartData }) => {

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pt-6 pb-12">
            <div className="grid grid-cols-1 gap-12">
                {/* 1. ACWR Combined */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Acute:chronic workload ratio
                    </h5>
                    {primaryChartData.acwr && primaryChartData.acwr.length > 0 ? (
                        <ACWRChartCombined
                            data={primaryChartData.acwr}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No workload data (ACWR) found for this period.
                        </div>
                    )}
                </div>

                {/* 2. Heart Rate */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Heart rate
                    </h5>
                    <HeartRateChart
                        data={primaryChartData.hr}
                    />
                </div>

                {/* 2. HRV Trend */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        HRV trends
                    </h5>
                    <HRVMultiLineChart
                        data={primaryChartData.hrv}
                    />
                </div>

                {/* 3. Recovery Beats */}
                <div className="p-6 rounded-[40px] border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4">
                        Recovery beats
                    </h5>
                    <RecoveryBeatsChart
                        data={primaryChartData.recovery}
                    />
                </div>
            </div>
        </div>
    );
};
