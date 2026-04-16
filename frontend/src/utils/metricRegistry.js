/**
 * Metric Registry — authoritative list of data series that can be
 * plotted inside the customisable dashboard.
 *
 * Each metric describes:
 *   id                     unique string key (stored in layout JSON)
 *   label                  display name in pickers / chart headers
 *   tab                    which dashboard tab exposes it
 *   dataKey                key in `primaryChartData` holding the array
 *   xField                 field on each row used for the X axis (category)
 *   yField                 numeric field used for the Y axis
 *   unit                   short unit string shown on axis + tooltip
 *   description            one-liner for the picker
 *   defaultChartType       what to pre-select in the Add modal
 *   compatibleChartTypes   (optional) restrict to a subset of chart-type ids;
 *                          omit to allow every registered chart type
 *   color                  optional default series color (hex)
 *
 * To add a metric: append a row. To add a tab: set a new `tab` value and
 * pass it to `getMetricsForTab`.
 */

export const METRICS = [
    // ── Training tab ────────────────────────────────────────────────────────
    {
        id: 'training_load',
        label: 'Training load',
        tab: 'training',
        dataKey: 'training',
        xField: 'date',
        yField: 'training_load',
        unit: 'AU',
        description: 'Session training load in arbitrary units (AU).',
        defaultChartType: 'bar',
        color: '#10b981',
    },
    {
        id: 'training_intensity',
        label: 'Training intensity',
        tab: 'training',
        dataKey: 'training',
        xField: 'date',
        yField: 'training_intensity',
        unit: 'score',
        description: 'Session intensity score.',
        defaultChartType: 'line',
        color: '#f97316',
    },
    {
        id: 'epoc_total',
        label: 'EPOC total',
        tab: 'training',
        dataKey: 'oxygen_debt',
        xField: 'date',
        yField: 'epoc_total',
        unit: 'kJ',
        description: 'Total post-exercise oxygen consumption per session.',
        defaultChartType: 'area',
        color: '#0d7377',
    },
    {
        id: 'epoc_peak',
        label: 'EPOC peak',
        tab: 'training',
        dataKey: 'oxygen_debt',
        xField: 'date',
        yField: 'epoc_peak',
        unit: 'kJ',
        description: 'Peak EPOC reached during the session.',
        defaultChartType: 'line',
        color: '#1f77b4',
    },
    {
        id: 'energy',
        label: 'Energy expenditure',
        tab: 'training',
        dataKey: 'energy',
        xField: 'date',
        yField: 'ee_men',
        unit: 'kcal',
        description: 'Total kilocalories burned per session.',
        defaultChartType: 'area',
        color: '#f43f5e',
    },
    {
        id: 'acwr',
        label: 'Acute:Chronic workload ratio',
        tab: 'training',
        dataKey: 'acwr',
        xField: 'date',
        yField: 'acwr',
        unit: 'ratio',
        description: '7-day acute vs 28-day chronic load ratio.',
        defaultChartType: 'line',
        color: '#1f77b4',
    },
    {
        id: 'acute_load',
        label: 'Acute load (7d)',
        tab: 'training',
        dataKey: 'acwr',
        xField: 'date',
        yField: 'acute_load',
        unit: 'AU',
        description: '7-day rolling average of training load.',
        defaultChartType: 'line',
        color: '#22c55e',
    },
    {
        id: 'chronic_load',
        label: 'Chronic load (28d)',
        tab: 'training',
        dataKey: 'acwr',
        xField: 'date',
        yField: 'chronic_load',
        unit: 'AU',
        description: '28-day rolling average of training load.',
        defaultChartType: 'line',
        color: '#6366f1',
    },
    {
        id: 'vo2',
        label: 'VO2 (measured)',
        tab: 'training',
        dataKey: 'oxygen_consumption',
        xField: 'date',
        yField: 'vo2',
        unit: 'ml/kg/min',
        description: 'Measured oxygen consumption per session.',
        defaultChartType: 'bar',
        color: '#f59e0b',
    },
    {
        id: 'vo2_max',
        label: 'VO2 max (estimate)',
        tab: 'training',
        dataKey: 'oxygen_consumption',
        xField: 'date',
        yField: 'vo2_max',
        unit: 'ml/kg/min',
        description: 'Estimated maximal oxygen uptake.',
        defaultChartType: 'line',
        color: '#1f77b4',
    },
    {
        id: 'aerobic_te',
        label: 'Aerobic training effect',
        tab: 'training',
        dataKey: 'training_effect',
        xField: 'date',
        yField: 'aerobic_te_value',
        unit: 'TE (1–5)',
        description: 'Aerobic benefit score per session.',
        defaultChartType: 'line',
        color: '#0d7377',
    },
    {
        id: 'anaerobic_te',
        label: 'Anaerobic training effect',
        tab: 'training',
        dataKey: 'training_effect',
        xField: 'date',
        yField: 'anaerobic_te_value',
        unit: 'TE (1–5)',
        description: 'Anaerobic benefit score per session.',
        defaultChartType: 'line',
        color: '#1f77b4',
    },
    {
        id: 'exercise_duration',
        label: 'Exercise duration',
        tab: 'training',
        dataKey: 'exercise_duration',
        xField: 'date',
        yField: 'exercise_duration',
        unit: 'min',
        description: 'Session duration in minutes.',
        defaultChartType: 'bar',
        color: '#b08347',
    },
];

/** Return all metrics defined for a given tab. */
export function getMetricsForTab(tab) {
    return METRICS.filter(m => m.tab === tab);
}

/** Look up a metric by id. Returns undefined if missing. */
export function getMetric(id) {
    return METRICS.find(m => m.id === id);
}

/**
 * Given a metric and the flat `primaryChartData` object, extract the
 * array of rows for that metric. Returns [] if the key is missing or
 * the value isn't an array.
 */
export function getMetricRows(metric, primaryChartData) {
    if (!metric || !primaryChartData) return [];
    const rows = primaryChartData[metric.dataKey];
    return Array.isArray(rows) ? rows : [];
}
