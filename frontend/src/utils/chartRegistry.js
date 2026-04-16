/**
 * Chart Registry — the set of chart renderers available to user-added
 * dashboard widgets. Each entry defines how to turn (metric + rows)
 * into an ECharts `series` config.
 *
 * A registry entry exposes:
 *   id              unique chart type key stored in layout JSON
 *   label           display name in the picker
 *   buildSeries     (metric, values, { isDark, color }) -> ECharts series config
 *                   `values` is the numeric Y array already aligned to the
 *                   chart's common X axis
 *
 * The overall ECharts `option` (tooltip, axes, grid, legend, zoom, toolbox)
 * is built by <CustomChart/>; these entries only describe the series shape.
 *
 * Every chart type is compatible with every (numeric time-series) metric.
 * If that stops being true later, gate it with `compatibleChartTypes` on
 * the metric and have `getCompatibleChartTypes` intersect.
 */

import {
    getLineSeriesStyle,
    getBarItemStyle,
} from './chartStyles';

export const CHART_TYPES = [
    {
        id: 'line',
        label: 'Line',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'line',
            data: values,
            ...getLineSeriesStyle(color, false),
            symbol: 'circle',
            symbolSize: 5,
        }]),
    },
    {
        id: 'area',
        label: 'Area',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'line',
            data: values,
            ...getLineSeriesStyle(color, true),
            symbol: 'circle',
            symbolSize: 5,
            smooth: true,
        }]),
    },
    {
        id: 'bar',
        label: 'Bar',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'bar',
            data: values,
            itemStyle: getBarItemStyle(color),
            barMaxWidth: 30,
        }]),
    },
    {
        id: 'stackedBar',
        label: 'Stacked bar',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'bar',
            data: values,
            itemStyle: getBarItemStyle(color),
            // Every stackedBar series shares the same stack id so ECharts stacks them.
            stack: 'custom-stack',
            barMaxWidth: 40,
        }]),
    },
    {
        id: 'stepLine',
        label: 'Step',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'line',
            data: values,
            step: 'end',
            itemStyle: { color },
            lineStyle: { width: 2.5, color },
            symbol: 'circle',
            symbolSize: 4,
        }]),
    },
    {
        id: 'scatter',
        label: 'Scatter',
        buildSeries: (metric, values, { color }) => ([{
            name: metric.label,
            type: 'scatter',
            data: values,
            itemStyle: { color },
            symbolSize: 10,
        }]),
    },
];

/** Get a chart-type entry by id; falls back to line if unknown. */
export function getChartType(id) {
    return CHART_TYPES.find(c => c.id === id) || CHART_TYPES[0];
}

/**
 * Filter the global chart-type list by the metric's declared compatibility,
 * if any. If `compatibleChartTypes` is omitted on the metric, every chart
 * type is considered valid.
 */
export function getCompatibleChartTypes(metric) {
    if (!metric || !Array.isArray(metric.compatibleChartTypes)) return CHART_TYPES;
    const allowed = new Set(metric.compatibleChartTypes);
    return CHART_TYPES.filter(c => allowed.has(c.id));
}
