/**
 * Metric definitions with visualization config
 */
export const metrics = [
    {
        key: 'training_load',
        label: 'Training Load',
        unit: '',
        color: '#10b981', // green
        chartType: 'bar',
        description: 'Total training load per session'
    },
    {
        key: 'training_intensity',
        label: 'Training Intensity',
        unit: '',
        color: '#3b82f6', // blue
        chartType: 'line',
        description: 'Training intensity ratio'
    },
    {
        key: 'sdnn',
        label: 'SDNN',
        unit: 'ms',
        color: '#8b5cf6', // purple
        chartType: 'line',
        description: 'Standard deviation of NN intervals (HRV)'
    },
    {
        key: 'rmssd',
        label: 'RMSSD',
        unit: 'ms',
        color: '#a855f7', // purple-500
        chartType: 'line',
        description: 'Root mean square of successive differences (HRV)'
    },
    {
        key: 'pnn50',
        label: 'pNN50',
        unit: '%',
        color: '#9333ea', // purple-600
        chartType: 'line',
        description: 'Percentage of successive NN intervals > 50ms'
    },
    {
        key: 'epoc_total',
        label: 'EPOC Total',
        unit: 'kcal',
        color: '#f97316', // orange
        chartType: 'bar',
        description: 'Total excess post-exercise oxygen consumption'
    },
    {
        key: 'epoc_peak',
        label: 'EPOC Peak',
        unit: 'kcal/min',
        color: '#fb923c', // orange-400
        chartType: 'line',
        description: 'Peak EPOC value'
    },
    {
        key: 'ee_men',
        label: 'Energy Expenditure',
        unit: 'kcal',
        color: '#ea580c', // orange-600
        chartType: 'bar',
        description: 'Total energy expenditure'
    },
    {
        key: 'vo2',
        label: 'VO2',
        unit: 'ml/kg/min',
        color: '#06b6d4', // cyan
        chartType: 'line',
        description: 'Oxygen consumption'
    },
    {
        key: 'vo2_max',
        label: 'VO2 Max',
        unit: 'ml/kg/min',
        color: '#0891b2', // cyan-600
        chartType: 'line',
        description: 'Maximum oxygen uptake capacity'
    },
    {
        key: 'recovery_beats',
        label: 'Recovery Beats',
        unit: 'bpm',
        color: '#059669', // emerald
        chartType: 'line',
        description: 'Heart rate recovery metric'
    },
    {
        key: 'acwr',
        label: 'ACWR',
        unit: 'ratio',
        color: '#f59e0b', // amber
        chartType: 'line',
        description: 'Acute:Chronic Workload Ratio'
    }
];

/**
 * Get metric config by key
 */
export function getMetricConfig(metricKey) {
    return metrics.find(m => m.key === metricKey) || metrics[0];
}
