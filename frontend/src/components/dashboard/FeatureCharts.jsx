import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTheme } from '../theme-provider';
import { format, parseISO } from 'date-fns';
import {
    BRAND_ORANGE, SECONDARY_BLUE, FONT_FAMILY,
    getTooltipStyle, getAxisStyle, getLegendStyle, getGridStyle,
    getLineSeriesStyle, getBarItemStyle
} from '../../utils/chartStyles';

// Register ECharts themes directly
// (Themes removed - using chartStyles.js)

// (Themes removed - using chartStyles.js)

// Common Chart Options
const getCommonOptions = (title, isDark) => {
    return {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            padding: [10, 15],
        },
        grid: getGridStyle({ top: 30 }),
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            {
                type: 'slider',
                bottom: '2%',
                height: 20,
                borderColor: 'transparent',
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                fillerColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,122,0,0.1)',
                handleStyle: { color: BRAND_ORANGE },
                textStyle: { color: 'transparent' }
            },
        ],
        legend: {
            bottom: 0,
            left: 'center',
            itemGap: 20,
            ...getLegendStyle(isDark),
            type: 'scroll',
            pageIconColor: isDark ? '#f8fafc' : '#111827',
            pageTextStyle: { color: isDark ? '#f8fafc' : '#111827' }
        },
        toolbox: {
            feature: {
                saveAsImage: { title: 'Save' },
                restore: { title: 'Reset' }
            },
            right: 10,
            top: 0
        }
    };
};

function useChartTheme() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return false;
    return resolvedTheme === 'dark';
}

// 1. Heart Rate (Avg, Min, Max Lines)
export const HeartRateChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const series = [
        {
            name: 'Max HR',
            type: 'line',
            data: data.map(d => d.max_hr || 0),
            itemStyle: { color: '#ef4444' }, // Red
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
        },
        {
            name: 'Avg HR',
            type: 'line',
            data: data.map(d => d.avg_hr || 0),
            itemStyle: { color: '#3b82f6' }, // Blue
            symbol: 'circle',
            symbolSize: 8,
            smooth: true,
            lineStyle: { width: 3 }
        },
        {
            name: 'Min HR',
            type: 'line',
            data: data.map(d => d.min_hr || 0),
            itemStyle: { color: '#22c55e' }, // Green
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
        }
    ];

    const option = {
        ...getCommonOptions('Heart rate', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'line' }
        },
        legend: {
            top: 30,
            ...getLegendStyle(isDark),
        },
        grid: getGridStyle({ top: 80, bottom: 60, left: 50, right: 20 }),
        xAxis: {
            type: 'category',
            data: dates,
            ...getAxisStyle(isDark),
        },
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            max: (v) => Math.ceil(v.max + 5),
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Heart Rate Variance</h5>
            <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 2. Training Load Trend (Bar + Line)
export const TrainingLoadTrendChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Training load trend', isDark),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: {
            type: 'category',
            data: dates,
            ...getAxisStyle(isDark),
        },
        yAxis: [
            {
                type: 'value',
                name: 'Load',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
            }
        ],
        series: [
            {
                name: 'Training load',
                type: 'bar',
                data: data.map(d => d.training_load),
                itemStyle: getBarItemStyle(BRAND_ORANGE),
            },
            {
                name: 'Training intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.training_intensity),
                itemStyle: { color: SECONDARY_BLUE },
                lineStyle: { width: 3 }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Training Load Trend</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 3. HRV Trend
export const HRVMultiLineChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('HRV trend', isDark),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            ...getAxisStyle(isDark),
        },
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
        },
        series: [
            { name: 'SDNN', type: 'line', smooth: true, data: data.map(d => d.sdnn), itemStyle: { color: '#8b5cf6' } },
            { name: 'RMSSD', type: 'line', smooth: true, data: data.map(d => d.rmssd), ...getLineSeriesStyle(BRAND_ORANGE, false) },
            { name: 'pNN50', type: 'line', smooth: true, data: data.map(d => d.pnn50), itemStyle: { color: '#10b981' } }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>HRV Trend</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 4. Oxygen Debt (EPOC)
export const OxygenDebtChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Oxygen Debt (EPOC)', isDark),
        tooltip: { ...getTooltipStyle(isDark), axisPointer: { type: 'cross' } },
        xAxis: {
            type: 'category',
            data: dates,
            ...getAxisStyle(isDark),
        },
        yAxis: {
            type: 'value',
            name: 'EPOC',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
        },
        series: [
            {
                name: 'Total EPOC',
                type: 'bar',
                data: data.map(d => d.epoc_total || 0),
                itemStyle: getBarItemStyle(BRAND_ORANGE),
                barMaxWidth: 30
            },
            {
                name: 'Peak EPOC',
                type: 'line',
                data: data.map(d => d.epoc_peak || 0),
                itemStyle: { color: '#ef4444' },
                symbol: 'circle',
                symbolSize: 8,
                smooth: true,
                lineStyle: { width: 3 }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Oxygen Debt (EPOC)</h5>
            <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 5. Energy Expenditure
export const EnergyChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Energy expenditure', isDark),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            ...getAxisStyle(isDark),
        },
        yAxis: {
            type: 'value',
            name: 'kcal',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
        },
        series: [{
            name: 'Energy',
            type: 'line',
            data: data.map(d => d.ee_men),
            ...getLineSeriesStyle(BRAND_ORANGE, true),
            showSymbol: false,
        }]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Energy Expenditure</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 6. Movement Trend (Bar + Line)
export const MovementTrendChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Movement trend', isDark),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: {
            type: 'category',
            data: dates,
            ...getAxisStyle(isDark),
        },
        yAxis: [
            {
                type: 'value',
                name: 'Movement load',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
            }
        ],
        series: [
            {
                name: 'Movement load',
                type: 'bar',
                data: data.map(d => d.movement_load),
                itemStyle: getBarItemStyle(BRAND_ORANGE),
            },
            {
                name: 'Movement intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.movement_load_intensity),
                itemStyle: { color: SECONDARY_BLUE },
                lineStyle: { width: 3 }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Movement Trend</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 7. Oxygen Consumption (VO2)
export const OxygenConsumptionChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    // Calculate Dataset Average
    const vo2Values = data.map(d => parseFloat(d.vo2 || 0));
    const vo2Avg = (vo2Values.reduce((a, b) => a + b, 0) / vo2Values.length).toFixed(1);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Oxygen consumption (VO2)', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'cross' }
        },
        grid: getGridStyle({ top: 60, right: 15, bottom: 60, left: 15 }),
        legend: {
            data: ['Measured VO2', 'VO2 Max', 'Avg VO2'],
            bottom: 0,
            ...getLegendStyle(isDark),
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine,
        },
        yAxis: {
            type: 'value',
            name: 'ml/kg/min',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
        },
        series: [
            {
                name: 'Measured VO2',
                type: 'bar',
                data: data.map(d => d.vo2 || 0),
                itemStyle: getBarItemStyle(BRAND_ORANGE),
                barMaxWidth: 30
            },
            {
                name: 'VO2 Max',
                type: 'line',
                data: data.map(d => d.vo2_max || 0),
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: SECONDARY_BLUE },
                lineStyle: { width: 3, type: 'solid' }
            },
            {
                name: 'Avg VO2',
                type: 'line',
                data: new Array(data.length).fill(vo2Avg),
                symbol: 'none',
                lineStyle: {
                    color: isDark ? '#fff' : '#555',
                    type: 'dashed',
                    width: 2
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    label: {
                        position: 'middle',
                        formatter: `Avg VO2: {c}`,
                        color: isDark ? '#fff' : '#333',
                        fontWeight: 600,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                        padding: [4, 8],
                        borderRadius: 4
                    },
                    data: [
                        { yAxis: parseFloat(vo2Avg), lineStyle: { type: 'dashed', opacity: 0.8 } }
                    ]
                }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Oxygen Consumption (VO2)</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 8. Zone Distribution
export const ZoneDistributionChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const colors = ['#94a3b8', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7'];
    const dates = data.map(d => d.date);

    const series = [0, 1, 2, 3, 4, 5].map(idx => ({
        name: `Zone ${idx}`,
        type: 'bar',
        stack: 'total',
        data: data.map(d => d[`zone_${idx}_pct`]),
        itemStyle: { color: colors[idx] }
    }));

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Heart rate zone distribution', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine,
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            name: '%',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Heart Rate Zone Distribution</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 9a. Recovery Beats
export const RecoveryBeatsChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Recovery beats', isDark),
        tooltip: getTooltipStyle(isDark),
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine,
        },
        yAxis: {
            type: 'value',
            name: 'Beats',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
        },
        series: [{
            name: 'Recovery',
            type: 'line',
            data: data.map(d => d.recovery_beats),
            ...getLineSeriesStyle(BRAND_ORANGE, true),
            showSymbol: false,
            markLine: {
                silent: true,
                data: [{ yAxis: 50, lineStyle: { color: isDark ? '#4b5563' : '#94a3b8', type: 'dashed' } }]
            }
        }]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Recovery Beats</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 9b. RMSSD
export const RMSSDChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('RMSSD', isDark),
        tooltip: getTooltipStyle(isDark),
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine,
        },
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
        },
        series: [{
            name: 'RMSSD',
            type: 'line',
            data: data.map(d => d.rmssd),
            ...getLineSeriesStyle(BRAND_ORANGE, true),
            showSymbol: false,
            markLine: {
                silent: true,
                data: [{ yAxis: 50, lineStyle: { color: isDark ? '#4b5563' : '#94a3b8', type: 'dashed' } }]
            }
        }]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>RMSSD Trend</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 10. Workload Ratio (ACWR)
export const ACWRChartCombined = ({ data }) => {
    const isDark = useChartTheme(); // Returns boolean
    if (!data) return null;
    const dates = data.map(d => d.date);

    // Define theme colors based on isDark
    const chartTheme = {
        tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: isDark ? '#334155' : '#eee',
        text: isDark ? '#ffffff' : '#333',
        subtext: isDark ? '#ffffff' : '#6b7280',
        grid: isDark ? '#334155' : '#e5e7eb'
    };

    const axisStyle = getAxisStyle(isDark);
    // Dynamic Y-Axis Limit
    const maxVal = Math.max(...data.map(d => parseFloat(d.acwr || 0)));
    const yLimit = Math.max(2.0, Math.ceil((maxVal + 0.2) * 10) / 10); // Min 2.0, or max + padding

    const option = {
        ...getCommonOptions('Workload Ratio (ACWR)', isDark),
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            formatter: (params) => {
                const date = params[0].axisValue;
                const val = params[0].value;
                let status = '';
                if (val > 1.3) status = 'High Risk';
                else if (val < 0.8) status = 'Undertraining';
                else status = 'Optimal';

                return `
                    <div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${date}</div>
                    <div class="flex items-center gap-2" style="margin-bottom: 4px;">
                        <span class="w-2 h-2 rounded-full" style="background-color: ${SECONDARY_BLUE}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                        <span class="text-sm">Ratio: <strong>${parseFloat(val).toFixed(2)}</strong></span>
                    </div>
                    <div class="text-xs opacity-70 mt-1">Status: ${status}</div>
                `;
            }
        },
        grid: getGridStyle({ top: 60, right: 20, bottom: 20, left: 40 }),
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: axisStyle.axisLabel,
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: 'Ratio',
            min: 0,
            max: yLimit,
            splitLine: axisStyle.splitLine,
            axisLabel: axisStyle.axisLabel,
            nameTextStyle: axisStyle.nameTextStyle
        },
        series: [
            {
                name: 'ACWR',
                type: 'line',
                data: data.map(d => d.acwr || 0),
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: SECONDARY_BLUE },
                lineStyle: { width: 3 },
                markArea: {
                    silent: true,
                    itemStyle: { opacity: isDark ? 0.1 : 0.08 },
                    data: [
                        // Yellow Zone: 0 - 0.8 (Undertraining)
                        [
                            { yAxis: 0, itemStyle: { color: '#eab308' } },
                            { yAxis: 0.8 }
                        ],
                        // Green Zone: 0.8 - 1.3 (Optimal)
                        [
                            { yAxis: 0.8, itemStyle: { color: '#22c55e' } },
                            { yAxis: 1.3 }
                        ],
                        // Red Zone: 1.3 - Max (Dynamic)
                        [
                            { yAxis: 1.3, itemStyle: { color: '#ef4444' } },
                            { yAxis: yLimit }
                        ]
                    ]
                }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Workload Ratio (ACWR)</h5>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </div>
    );
};

// Summary Sparkline
export const SummarySparkline = ({ data, color }) => {
    const option = {
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [{
            type: 'line', data, showSymbol: false, smooth: true,
            lineStyle: { color, width: 2 },
            areaStyle: { color, opacity: 0.1 }
        }]
    };
    return <ReactECharts option={option} style={{ height: '30px', width: '80px' }} />;
};

// Hover Trend Chart for Tooltips/Overview
export const HoverTrendChart = ({ data, color, name }) => {
    const isDark = useChartTheme();
    const option = {
        grid: { left: 5, right: 5, top: 5, bottom: 5 },
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: `{b}: {c}`
        },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [{
            name, type: 'line', smooth: true, data,
            lineStyle: { color, width: 3 },
            itemStyle: { color },
            areaStyle: { color, opacity: 0.2 }
        }]
    };
    return <ReactECharts option={option} style={{ height: '100px', width: '100%' }} />;
};

// 15. Monthly Aggregated Load vs HRV Chart
export const MonthlyLoadCombinedChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Monthly Training Load vs HRV Trend', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 opacity-70">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value}</span>
                        </div>
                    `;
                });
                return tooltip;
            }
        },
        legend: {
            data: ['Training Load', 'HRV (RMSSD)'],
            bottom: 0,
            ...getLegendStyle(isDark)
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine,
            axisPointer: { type: 'shadow' }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Training Load',
                nameTextStyle: axisStyle.nameTextStyle,
                min: 0,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine,
                splitLine: { show: false }
            },
            {
                type: 'value',
                name: 'HRV (ms)',
                nameTextStyle: axisStyle.nameTextStyle,
                min: 0,
                axisLabel: { ...axisStyle.axisLabel, formatter: '{value} ms' },
                axisLine: axisStyle.axisLine,
                splitLine: axisStyle.splitLine
            }
        ],
        series: [
            {
                name: 'Training Load',
                type: 'bar',
                data: data.map(d => d.load || 0),
                itemStyle: getBarItemStyle(BRAND_ORANGE),
                barMaxWidth: 40
            },
            {
                name: 'HRV (RMSSD)',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(d => d.hrv || 0),
                ...getLineSeriesStyle(SECONDARY_BLUE, false),
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: SECONDARY_BLUE,
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#fff'
                }
            }
        ]
    };

    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Training Load vs HRV Trend</h5>
            <ReactECharts option={option} style={{ height: '450px', width: '100%' }} />
        </div>
    );
};

// 16b. Weekly Zone Split Chart (Grouped Bars)
export const WeeklyZoneStackChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    // Focus on all 6 zones (0-5)
    const zones = [0, 1, 2, 3, 4, 5];
    const zoneColors = {
        0: '#d1d5db', // Light Grey (gray-300)
        1: '#9ca3af', // Grey (gray-400)
        2: '#3b82f6', // Blue
        3: '#22c55e', // Green
        4: '#eab308', // Yellow
        5: '#ef4444'  // Red
    };

    const axisStyle = getAxisStyle(isDark);
    const legendStyle = getLegendStyle(isDark);

    const series = zones.map(idx => ({
        name: `Zone ${idx}`,
        type: 'bar',
        data: data.map(d => d.zones?.[`z${idx}`] || 0),
        itemStyle: { color: zoneColors[idx], borderRadius: [2, 2, 0, 0] },
        label: {
            show: true,
            position: 'top',
            formatter: (params) => params.value > 0 ? params.value : '',
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? '#ffffff' : '#333',
            fontFamily: FONT_FAMILY,
            rotate: 0,
            distance: 5
        },
        emphasis: { focus: 'series' },
        barGap: '5%',
        barCategoryGap: '20%'
    }));

    const option = {
        ...getCommonOptions('HR Zone Split (mins)', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' }
        },
        legend: {
            top: 40,
            left: 'left',
            data: zones.map(z => `Zone ${z}`),
            ...legendStyle,
            padding: [0, 50, 0, 0]
        },
        grid: getGridStyle({ top: 120, right: 20, bottom: 60, left: 50 }),
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine
        },
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>HR Zone Split (mins)</h5>
            <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 16. Monthly Zone Stack Chart (All Zones 0-5)
export const MonthlyZoneStackChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    // All Zones 0-5
    const zones = [0, 1, 2, 3, 4, 5];
    const zoneColors = {
        0: '#d1d5db', // Light Grey (gray-300)
        1: '#9ca3af', // Grey (gray-400)
        2: '#3b82f6', // Blue
        3: '#22c55e', // Green
        4: '#eab308', // Yellow
        5: '#ef4444'  // Red
    };

    const series = zones.map(idx => ({
        name: `Zone ${idx}`,
        type: 'bar',
        // Grouped bars
        data: data.map(d => d.zones?.[`z${idx}`] || 0),
        itemStyle: { color: zoneColors[idx], borderRadius: [4, 4, 0, 0] },
        emphasis: { focus: 'series' }
    }));

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Monthly Zone Split (mins)', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 opacity-70">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value}</span>
                        </div>
                    `;
                });
                return tooltip;
            }
        },
        legend: {
            bottom: 0,
            ...getLegendStyle(isDark)
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine
        },
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Zone Split (mins)</h5>
            <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
        </div>
    );
};

// 17. Monthly Min/Max HR Chart
export const MonthlyHRAvgRangeChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Monthly HR Range (Avg)', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 opacity-70">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value}</span>
                        </div>
                    `;
                });
                return tooltip;
            }
        },
        legend: {
            bottom: 0,
            ...getLegendStyle(isDark)
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine
        },
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series: [
            {
                name: 'Min HR',
                type: 'bar',
                data: data.map(d => d.hr?.min || 0),
                itemStyle: getBarItemStyle('#22c55e'),
                barGap: '10%'
            },
            {
                name: 'Max HR',
                type: 'bar',
                data: data.map(d => d.hr?.max || 0),
                itemStyle: getBarItemStyle(SECONDARY_BLUE)
            },
            {
                name: 'Avg HR',
                type: 'line',
                data: data.map(d => d.hr?.avg || 0),
                ...getLineSeriesStyle(BRAND_ORANGE, false),
                symbol: 'none'
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly HR Range (Avg)</h5>
            <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
        </div>
    );
};

// 18. Monthly ACWR Trend
// 18. Monthly ACWR Trend
export const MonthlyACWRChart = ({ data }) => {
    const isDark = useChartTheme(); // Returns boolean

    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>;

    const dates = data.map(d => d.date);
    const acwrValues = data.map(d => parseFloat(d.acwr).toFixed(2));

    // Define theme colors based on isDark
    const chartTheme = {
        tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: isDark ? '#334155' : '#eee',
        text: isDark ? '#ffffff' : '#333',
        subtext: isDark ? '#ffffff' : '#6b7280',
        grid: isDark ? '#334155' : '#e5e7eb'
    };

    // Dynamic Y-Axis Limit
    const axisStyle = getAxisStyle(isDark);
    // Dynamic Y-Axis Limit
    const maxVal = Math.max(...data.map(d => parseFloat(d.acwr || 0)));
    const yLimit = Math.max(2.0, Math.ceil((maxVal + 0.2) * 10) / 10); // Min 2.0, or max + padding

    const option = {
        ...getCommonOptions('Monthly ACWR Trend', isDark),
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            formatter: (params) => {
                const date = params[0].axisValue;
                const val = params[0].value;
                let status = '';
                if (val > 1.3) status = 'High Risk';
                else if (val < 0.8) status = 'Undertraining';
                else status = 'Optimal';

                return `
                    <div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${date}</div>
                    <div class="flex items-center gap-2" style="margin-bottom: 4px;">
                        <span class="w-2 h-2 rounded-full" style="background-color: ${SECONDARY_BLUE}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                        <span class="text-sm">ACWR: <strong>${val}</strong></span>
                    </div>
                    <div class="text-xs opacity-70 mt-1">Status: ${status}</div>
                `;
            }
        },
        grid: getGridStyle({ top: 40, right: 20, bottom: 20, left: 40 }),
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: axisStyle.axisLabel
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: yLimit,
            splitLine: axisStyle.splitLine,
            axisLabel: axisStyle.axisLabel
        },
        series: [
            {
                name: 'ACWR',
                type: 'line',
                data: acwrValues,
                ...getLineSeriesStyle(SECONDARY_BLUE, true),
                symbol: 'circle',
                symbolSize: 6,
                markArea: {
                    silent: true,
                    itemStyle: { opacity: isDark ? 0.1 : 0.08 },
                    data: [
                        // Yellow Zone: 0 - 0.8 (Undertraining)
                        [
                            { yAxis: 0, itemStyle: { color: '#eab308' } },
                            { yAxis: 0.8 }
                        ],
                        // Green Zone: 0.8 - 1.3 (Optimal)
                        [
                            { yAxis: 0.8, itemStyle: { color: '#22c55e' } },
                            { yAxis: 1.3 }
                        ],
                        // Red Zone: 1.3 - Max (Dynamic)
                        [
                            { yAxis: 1.3, itemStyle: { color: '#ef4444' } },
                            { yAxis: yLimit }
                        ]
                    ]
                }
            }
        ]
    };

    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly ACWR Trend</h5>
            <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
        </div>
    );
};

// 19. Monthly Movement Trend
export const MonthlyMovementComboChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const axisStyle = getAxisStyle(isDark);
    const option = {
        ...getCommonOptions('Monthly Movement Intensity & Load', isDark),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 opacity-70">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value}</span>
                        </div>
                    `;
                });
                return tooltip;
            }
        },
        legend: {
            bottom: 0,
            ...getLegendStyle(isDark)
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: axisStyle.axisLabel,
            axisLine: axisStyle.axisLine
        },
        yAxis: [
            {
                type: 'value',
                name: 'Load',
                splitLine: { show: false },
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine
            }
        ],
        series: [
            {
                name: 'Movement Load',
                type: 'bar',
                data: data.map(d => d.movement?.load || 0),
                itemStyle: getBarItemStyle('#22c55e')
            },
            {
                name: 'Movement Intensity',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(d => d.movement?.intensity || 0),
                ...getLineSeriesStyle(SECONDARY_BLUE, true),
                itemStyle: { color: SECONDARY_BLUE }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Movement Intensity & Load</h5>
            <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
        </div>
    );
};

// 20. Simple Gauge Chart (No Needle)
export const SimpleGaugeChart = ({ value, min, max, label, color, unit }) => {
    const isDark = useChartTheme();

    // Calculate percentage for progress
    const range = max - min;
    const progress = Math.min(Math.max((value - min) / range, 0), 1);

    const option = {
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                radius: '75%',
                pointer: { show: false },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        color: color
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 8,
                        color: [[1, isDark ? '#1e293b' : '#e2e8f0']]
                    }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                detail: {
                    valueAnimation: true,
                    fontSize: 20,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 500,
                    color: isDark ? '#ffffff' : '#111827',
                    formatter: (val) => `{a|${val}}\n{b|${unit}}`,
                    rich: {
                        a: {
                            fontSize: 24,
                            fontWeight: 700,
                            color: isDark ? '#ffffff' : '#111827',
                            fontFamily: FONT_FAMILY,
                            padding: [0, 0, 5, 0]
                        },
                        b: {
                            fontSize: 11,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontFamily: FONT_FAMILY,
                            fontWeight: 600
                        }
                    },
                    offsetCenter: [0, '0%']
                },
                data: [{ value: value }]
            }
        ]
    };

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <ReactECharts option={option} style={{ height: '140px', width: '100%' }} />
            <p className="text-xs font-normal text-muted-foreground mt-1 text-center">{label}</p>
        </div>
    );
};
