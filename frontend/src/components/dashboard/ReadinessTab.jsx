import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import {
    HeartRateChart, HRVMultiLineChart, RecoveryBeatsChart, RestingHRChart
} from './FeatureCharts';

const CHART_INFO = {
    restingHR: {
        title: "Resting Heart Rate",
        desc: "Morning resting HR from Readiness sessions. An elevation of 5–7 bpm above personal baseline may indicate fatigue, incomplete recovery, or early illness."
    },
    heartRate: {
        title: "Heart Rate",
        desc: "Average HR per session across all session types. Tracks cardiovascular response to training load — rising avg HR at the same effort level may signal accumulated fatigue."
    },
    hrv: {
        title: "HRV Trends",
        desc: "RMSSD (ms) over time — a higher value indicates better autonomic recovery. A sustained downward trend suggests fatigue is accumulating and load should be reduced."
    },
    recovery: {
        title: "Recovery Beats",
        desc: "Heart rate drop in the first minute after exercise ends. > 25 bpm indicates good cardiovascular fitness; < 12 bpm may signal poor recovery or overreaching."
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

export const ReadinessTab = ({ primaryChartData }) => {

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pt-6 pb-12">
            <div className="grid grid-cols-1 gap-12">
                {/* 1. Resting HR */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Resting heart rate<ChartInfoPopup chartKey="restingHR" />
                    </h5>
                    {primaryChartData.resting_hr && primaryChartData.resting_hr.length > 0 ? (
                        <RestingHRChart data={primaryChartData.resting_hr} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No resting HR data found for this period.
                        </div>
                    )}
                </div>

                {/* 2. Heart Rate */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Heart rate<ChartInfoPopup chartKey="heartRate" />
                    </h5>
                    <HeartRateChart data={primaryChartData.hr} />
                </div>

                {/* 3. HRV Trends */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        HRV trends<ChartInfoPopup chartKey="hrv" />
                    </h5>
                    <HRVMultiLineChart data={primaryChartData.hrv} />
                </div>

                {/* 4. Recovery Beats */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px]">
                    <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 inline-flex items-center">
                        Recovery beats<ChartInfoPopup chartKey="recovery" />
                    </h5>
                    <RecoveryBeatsChart data={primaryChartData.recovery} />
                </div>
            </div>
        </div>
    );
};
