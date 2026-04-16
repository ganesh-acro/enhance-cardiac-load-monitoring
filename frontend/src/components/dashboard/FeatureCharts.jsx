import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTheme } from '../theme-provider';
import { format, parseISO, subMonths } from 'date-fns';
import { ZoomIn } from 'lucide-react';
import {
    BRAND_ORANGE, SECONDARY_BLUE, FONT_FAMILY, getBrandColor,
    getTooltipStyle, getAxisStyle, getLegendStyle, getGridStyle,
    getLineSeriesStyle, getBarItemStyle, getResponsiveXAxis,
} from '../../utils/chartStyles';

// Register ECharts themes directly
// (Themes removed - using chartStyles.js)

// (Themes removed - using chartStyles.js)

// Calculate the zoom start percentage to show the last 2 months of data.
// `data` can be an array of date strings OR an array of objects with fullDate/date fields.
export function getDefaultZoomStart(data) {
    if (!data || data.length <= 1) return 0;

    // Extract ISO dates: prefer fullDate field, fall back to weekKey/rawDate, then the string itself
    const isoDates = data.map(d => {
        if (typeof d === 'string') return d;
        return d.fullDate || d.weekKey || d.rawDate || d.date || '';
    });

    // Find the last valid ISO-style date (YYYY-MM-DD or YYYY-MM)
    let lastIso = '';
    for (let i = isoDates.length - 1; i >= 0; i--) {
        if (/^\d{4}-\d{2}/.test(isoDates[i])) { lastIso = isoDates[i]; break; }
    }
    if (!lastIso) return 0; // can't determine dates, show all

    const cutoff = subMonths(new Date(lastIso), 2).toISOString().split('T')[0];
    let startIdx = isoDates.findIndex(d => /^\d{4}-\d{2}/.test(d) && d >= cutoff);
    if (startIdx < 0) startIdx = 0;
    return Math.floor((startIdx / data.length) * 100);
}

// Format minutes to "Xh Ym" display
function fmtMins(m) {
    if (!m || m <= 0) return '';
    const h = Math.floor(m / 60);
    const mins = Math.round(m % 60);
    if (h > 0 && mins > 0) return `${h}h ${mins}m`;
    if (h > 0) return `${h}h`;
    return `${mins}m`;
}

// Common Chart Options
export const getCommonOptions = (title, isDark, data) => {
    const zoomStart = data ? getDefaultZoomStart(data) : 0;
    return {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            padding: [10, 15],
        },
        grid: getGridStyle({ top: 30 }),
        dataZoom: [
            {
                type: 'slider',
                bottom: '2%',
                height: 20,
                start: zoomStart,
                end: 100,
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
                restore: { title: 'Reset' },
                saveAsImage: { title: 'Save' },
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

// Wrapper: adds a scroll-zoom toggle button to any chart.
// Scroll zoom is OFF by default — click the button to activate, click again to deactivate.
export const ZoomableChart = ({ option, style, ...props }) => {
    const [zoomActive, setZoomActive] = useState(false);

    const enhancedOption = useMemo(() => {
        if (!zoomActive) return option;
        return {
            ...option,
            dataZoom: [
                ...(option.dataZoom || []),
                { type: 'inside', zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: false },
            ],
        };
    }, [option, zoomActive]);

    return (
        <div className="relative">
            <button
                onClick={() => setZoomActive(prev => !prev)}
                title={zoomActive ? 'Disable scroll zoom' : 'Enable scroll zoom'}
                className={`absolute top-0 right-0 z-10 p-1.5 rounded-lg border transition-all ${
                    zoomActive
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/30'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                }`}
            >
                <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <ReactECharts option={enhancedOption} style={style} {...props} />
        </div>
    );
};

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
        ...getCommonOptions('Heart rate', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'line' }
        },
        legend: {
            top: 30,
            ...getLegendStyle(isDark),
        },
        grid: getGridStyle({ top: 80, bottom: 60, left: 50, right: 20 }),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            max: (v) => Math.ceil(v.max + 5),
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Heart Rate Variance</h5>
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 2. Training Load Trend (Bar/Line/Area + optional Intensity overlay + threshold bands)
export const TrainingLoadTrendChart = ({ data, preferences }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const {
        chartType = 'bar',          // 'bar' | 'line' | 'area'
        showIntensity = true,
        showThresholds = false,
    } = preferences || {};

    const loadColor = '#10b981';
    let loadSeries;
    if (chartType === 'line' || chartType === 'area') {
        loadSeries = {
            name: 'Training load',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data.map(d => d.training_load),
            itemStyle: { color: loadColor },
            lineStyle: { width: 3, color: loadColor },
            ...(chartType === 'area' ? {
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16,185,129,0.35)' },
                            { offset: 1, color: 'rgba(16,185,129,0.02)' },
                        ],
                    },
                },
            } : {}),
        };
    } else {
        loadSeries = {
            name: 'Training load',
            type: 'bar',
            data: data.map(d => d.training_load),
            itemStyle: getBarItemStyle(loadColor),
        };
    }

    // Threshold bands (Low < 84 / Moderate 84-128 / High > 128)
    if (showThresholds) {
        loadSeries.markArea = {
            silent: true,
            itemStyle: { opacity: 0.08 },
            data: [
                [{ yAxis: 0, itemStyle: { color: '#10b981' } }, { yAxis: 84 }],
                [{ yAxis: 84, itemStyle: { color: '#eab308' } }, { yAxis: 128 }],
                [{ yAxis: 128, itemStyle: { color: '#ef4444' } }, { yAxis: 'max' }],
            ],
        };
    }

    const series = [loadSeries];
    if (showIntensity) {
        series.push({
            name: 'Training intensity',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: data.map(d => d.training_intensity),
            itemStyle: { color: '#f97316' },
            lineStyle: { width: 3 },
        });
    }

    const yAxis = [
        {
            type: 'value',
            name: 'Load',
            splitLine: { show: false },
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitNumber: 5,
        },
    ];
    if (showIntensity) {
        yAxis.push({
            type: 'value',
            name: 'Intensity',
            position: 'right',
            splitLine: { show: false },
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitNumber: 5,
        });
    }

    const option = {
        ...getCommonOptions('Training load trend', isDark, data),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis,
        series,
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Training Load Trend</h5>
            <ZoomableChart option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 3. HRV Trend
export const HRVMultiLineChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('HRV trend', isDark, data),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 4. Oxygen Debt (EPOC) — Scatter bubble + connecting line
export const OxygenDebtChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);
    const brandColor = getBrandColor(isDark);

    const totals = data.map(d => d.epoc_total || 0);
    const peaks = data.map(d => d.epoc_peak || 0);

    const option = {
        ...getCommonOptions('Oxygen Debt (EPOC)', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'cross' },
        },
        legend: {
            top: 5,
            ...getLegendStyle(isDark),
        },
        grid: getGridStyle({ top: 50, bottom: 60, left: 50, right: 20 }),
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: {
            type: 'value',
            name: 'EPOC',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series: [
            // Total EPOC — area line
            {
                name: 'Total EPOC',
                type: 'line',
                data: totals,
                ...getLineSeriesStyle(brandColor, true),
                symbol: 'circle',
                symbolSize: 5,
                z: 2,
            },
            // Peak EPOC — thinner line, no fill
            {
                name: 'Peak EPOC',
                type: 'line',
                data: peaks,
                ...getLineSeriesStyle(SECONDARY_BLUE, false),
                lineStyle: { width: 2, color: SECONDARY_BLUE, type: 'solid' },
                symbol: 'circle',
                symbolSize: 4,
                z: 3,
            },
        ],
    };
    return (
        <div className="w-full h-full">
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 5. Energy Expenditure
export const EnergyChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Energy expenditure', isDark, data),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: {
            type: 'value',
            name: 'kcal',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series: [{
            name: 'Energy',
            type: 'line',
            data: data.map(d => d.ee_men),
            ...getLineSeriesStyle('#f43f5e', true),
            showSymbol: false,
        }]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Energy Expenditure</h5>
            <ZoomableChart option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 6. Movement Trend (Bar + Line)
export const MovementTrendChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Movement trend', isDark, data),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: [
            {
                type: 'value',
                name: 'Movement load',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
                splitNumber: 5,
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
                splitNumber: 5,
            }
        ],
        series: [
            {
                name: 'Movement load',
                type: 'bar',
                data: data.map(d => d.movement_load),
                itemStyle: getBarItemStyle('#06b6d4'),
            },
            {
                name: 'Movement intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.movement_load_intensity),
                itemStyle: { color: '#1f77b4' },
                lineStyle: { width: 3 }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Movement Trend</h5>
            <ZoomableChart option={option} style={{ height: '400px' }} />
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
        ...getCommonOptions('Oxygen consumption (VO2)', isDark, data),
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
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'ml/kg/min',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Measured VO2',
                type: 'bar',
                data: data.map(d => d.vo2 || 0),
                itemStyle: getBarItemStyle('#f59e0b'),
                barMaxWidth: 30
            },
            {
                name: 'VO2 Max',
                type: 'line',
                data: data.map(d => d.vo2_max || 0),
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#1f77b4' },
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
            <ZoomableChart option={option} style={{ height: '400px' }} />
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
        ...getCommonOptions('Heart rate zone distribution', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' }
        },
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            name: '%',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Heart Rate Zone Distribution</h5>
            <ZoomableChart option={option} style={{ height: '400px' }} />
        </div>
    );
};

// 9a. Recovery Beats — Color-encoded dot strip + sparkline
export const RecoveryBeatsChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const values = data.map(d => d.recovery_beats || 0);
    const validValues = values.filter(v => v > 0);
    const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
    const maxVal = validValues.length > 0 ? Math.max(...validValues) : 100;
    const latest = values[values.length - 1];
    const avg = validValues.length > 0
        ? Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length)
        : 0;

    // Color mapping: red(low) → amber(mid) → green(high)
    const getColor = (v) => {
        if (v <= 0) return isDark ? '#334155' : '#e2e8f0';
        const ratio = (v - minVal) / ((maxVal - minVal) || 1);
        if (ratio < 0.33) return '#ef4444';
        if (ratio < 0.66) return '#f59e0b';
        return '#10b981';
    };

    const option = {
        ...getCommonOptions('Recovery beats', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const i = params[0]?.dataIndex;
                if (i == null) return '';
                const d = data[i];
                const v = values[i];
                const color = getColor(v);
                return `<div style="font-weight:600; margin-bottom:6px; font-family: Inter, sans-serif;">${d.date}</div>
                    <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>Recovery: <strong>${v} beats</strong></div>`;
            }
        },
        grid: getGridStyle({ top: 50, bottom: '15%' }),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: [
            // Dot strip (fixed single row)
            {
                type: 'value',
                min: 0,
                max: 1,
                show: false,
            },
            // Sparkline axis
            {
                type: 'value',
                name: 'Beats',
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
                splitLine: { ...getAxisStyle(isDark).splitLine, show: true },
                splitNumber: 4,
                position: 'right',
            }
        ],
        series: [
            // Dot strip — single row of colored circles
            {
                name: 'Recovery',
                type: 'scatter',
                yAxisIndex: 0,
                data: values.map(v => ({
                    value: 0.5,
                    itemStyle: {
                        color: getColor(v),
                        borderColor: isDark ? '#1e293b' : '#fff',
                        borderWidth: 1.5,
                    }
                })),
                symbolSize: (val, params) => {
                    const v = values[params.dataIndex];
                    return v <= 0 ? 6 : 12 + ((v - minVal) / ((maxVal - minVal) || 1)) * 8;
                },
                z: 3,
            },
            // Sparkline trend overlay
            {
                name: 'Trend',
                type: 'line',
                yAxisIndex: 1,
                data: values,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 1.5, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                        { offset: 1, color: 'transparent' },
                    ]),
                },
                z: 1,
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Recovery Beats</h5>
            <div className="flex justify-center gap-6 mb-4">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">{latest}</p>
                    <p className="text-xs text-muted-foreground">Latest</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-semibold text-muted-foreground">{avg}</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>Low
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>Mid
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>High
                </div>
            </div>
            <ZoomableChart option={option} style={{ height: '300px' }} />
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
        ...getCommonOptions('RMSSD', isDark, data),
        tooltip: getTooltipStyle(isDark),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '400px' }} />
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
        ...getCommonOptions('Workload Ratio (ACWR)', isDark, data),
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
        xAxis: { ...getResponsiveXAxis(isDark, dates), axisLine: { show: false }, axisTick: { show: false },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: 'Ratio',
            min: 0,
            max: yLimit,
            splitLine: axisStyle.splitLine,
            axisLabel: axisStyle.axisLabel,
            nameTextStyle: axisStyle.nameTextStyle,
            splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '400px' }} />
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
        xAxis: getResponsiveXAxis(isDark, dates, { axisPointer: { type: 'shadow' } }),
        yAxis: [
            {
                type: 'value',
                name: 'Training Load',
                nameTextStyle: axisStyle.nameTextStyle,
                min: 0,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine,
                splitLine: { show: false },
                splitNumber: 5,
            },
            {
                type: 'value',
                name: 'HRV (ms)',
                nameTextStyle: axisStyle.nameTextStyle,
                min: 0,
                axisLabel: { ...axisStyle.axisLabel, formatter: '{value} ms' },
                axisLine: axisStyle.axisLine,
                splitLine: axisStyle.splitLine,
                splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '450px', width: '100%' }} />
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
            formatter: (params) => fmtMins(params.value),
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
        ...getCommonOptions('HR Zone Split', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                let tooltip = `<div class="font-bold mb-1" style="font-family: Inter, sans-serif;">${params[0].name}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${fmtMins(p.value)}</span>
                        </div>
                    `;
                });
                return tooltip;
            }
        },
        legend: {
            top: 40,
            left: 'left',
            data: zones.map(z => `Zone ${z}`),
            ...legendStyle,
            padding: [0, 50, 0, 0]
        },
        grid: getGridStyle({ top: 120, right: 20, bottom: 60, left: 50 }),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'Time',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: { ...axisStyle.axisLabel, formatter: (v) => fmtMins(v) || '0' },
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>HR Zone Split</h5>
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
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
        ...getCommonOptions('Monthly Zone Split', isDark),
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
                            <span class="font-mono font-bold">${fmtMins(p.value)}</span>
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
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'Time',
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: { ...axisStyle.axisLabel, formatter: (v) => fmtMins(v) || '0' },
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
        },
        series
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Zone Split</h5>
            <ZoomableChart option={option} style={{ height: '350px', width: '100%' }} />
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
            top: 30,
            ...getLegendStyle(isDark),
        },
        grid: getGridStyle({ top: 80, bottom: 60, left: 50, right: 20 }),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '380px', width: '100%' }} />
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
        xAxis: getResponsiveXAxis(isDark, dates, { axisLine: { show: false }, axisTick: { show: false } }),
        yAxis: {
            type: 'value',
            min: 0,
            max: yLimit,
            splitLine: axisStyle.splitLine,
            axisLabel: axisStyle.axisLabel,
            splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '300px', width: '100%' }} />
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
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: [
            {
                type: 'value',
                name: 'Load',
                splitLine: { show: false },
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine,
                splitNumber: 5,
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine,
                splitNumber: 5,
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
            <ZoomableChart option={option} style={{ height: '350px', width: '100%' }} />
        </div>
    );
};

// 20. Training Effect Chart — Horizontal Dumbbell / Lollipop
export const TrainingEffectChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const brandColor = getBrandColor(isDark);
    const dates = data.map(d => d.date);
    const aerobic = data.map(d => d.aerobic_te_value || 0);
    const anaerobic = data.map(d => d.anaerobic_te_value || 0);

    const option = {
        ...getCommonOptions('Training Effect', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const idx = params[0]?.dataIndex;
                if (idx == null || !data[idx]) return '';
                const d = data[idx];
                let tip = `<div style="font-weight:600; margin-bottom:6px; font-family: Inter, sans-serif;">${d.date}</div>`;
                tip += `<div style="margin-bottom:3px;">${params[0]?.marker || ''} Aerobic: <strong>${d.aerobic_te_value}</strong> — ${d.aerobic_te_comment || 'N/A'}</div>`;
                tip += `<div>${params[1]?.marker || ''} Anaerobic: <strong>${d.anaerobic_te_value}</strong> — ${d.anaerobic_te_comment || 'N/A'}</div>`;
                return tip;
            }
        },
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: {
            type: 'value',
            name: 'TE Value',
            min: 0,
            max: 5,
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Aerobic',
                type: 'line',
                data: aerobic,
                ...getLineSeriesStyle(brandColor, true),
                symbol: 'circle',
                symbolSize: 5,
            },
            {
                name: 'Anaerobic',
                type: 'line',
                data: anaerobic,
                ...getLineSeriesStyle(SECONDARY_BLUE, false),
                lineStyle: { width: 2, color: SECONDARY_BLUE, type: 'solid' },
                symbol: 'circle',
                symbolSize: 4,
            },
        ],
    };

    return (
        <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
    );
};

// 21. Exercise Duration Chart — Step-area with rolling average
export const ExerciseDurationChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);
    const brandColor = getBrandColor(isDark);

    const durations = data.map(d => d.exercise_duration || 0);

    // 7-session rolling average
    const windowSize = 7;
    const rollingAvg = durations.map((_, i) => {
        const start = Math.max(0, i - windowSize + 1);
        const window = durations.slice(start, i + 1);
        return Math.round(window.reduce((a, b) => a + b, 0) / window.length);
    });

    const rgb = isDark ? '176,131,71' : '13,115,119';

    const option = {
        ...getCommonOptions('Exercise duration', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                let tip = `<div style="font-weight:600; margin-bottom:4px; font-family: Inter, sans-serif;">${params[0].name}</div>`;
                params.forEach(p => {
                    tip += `<div style="margin-bottom:2px;">${p.marker} ${p.seriesName}: <strong>${p.value} min</strong></div>`;
                });
                return tip;
            }
        },
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: getAxisStyle(isDark).axisLabel,
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Duration',
                type: 'line',
                step: 'middle',
                data: durations,
                itemStyle: { color: brandColor },
                lineStyle: { width: 1.5, color: brandColor },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: `rgba(${rgb}, 0.25)` },
                        { offset: 1, color: `rgba(${rgb}, 0.03)` },
                    ]),
                },
                showSymbol: false,
                z: 1,
            },
            {
                name: '7-session avg',
                type: 'line',
                data: rollingAvg,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2.5, color: '#8b5cf6', type: 'solid' },
                itemStyle: { color: '#8b5cf6' },
                z: 2,
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Exercise Duration</h5>
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 22. Resting HR & HR Std Chart (Readiness)
export const RestingHRChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Resting HR', isDark, data),
        tooltip: { ...getTooltipStyle(isDark) },
        xAxis: getResponsiveXAxis(isDark, dates, { boundaryGap: false }),
        yAxis: [
            {
                type: 'value',
                name: 'BPM',
                min: (v) => Math.floor(v.min - 5),
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
                splitLine: getAxisStyle(isDark).splitLine,
                splitNumber: 5,
            },
            {
                type: 'value',
                name: 'HR Std',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: getAxisStyle(isDark).nameTextStyle,
                axisLabel: getAxisStyle(isDark).axisLabel,
                splitNumber: 5,
            }
        ],
        series: [
            {
                name: 'Resting HR',
                type: 'line',
                data: data.map(d => d.rest_hr || 0),
                ...getLineSeriesStyle('#ef4444', true),
                symbol: 'circle',
                symbolSize: 6,
                smooth: true,
            },
            {
                name: 'HR Std',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(d => d.hr_std || 0),
                itemStyle: { color: '#8b5cf6' },
                symbol: 'circle',
                symbolSize: 5,
                smooth: true,
                lineStyle: { width: 2, type: 'dashed' }
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Resting Heart Rate</h5>
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 23. HR Recovery 60s Chart — Waterfall deviation from personal baseline
export const HRRecoveryChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const values = data.map(d => d.hr_recovery_60s || 0);
    const validValues = values.filter(v => v > 0);
    const baseline = validValues.length > 0
        ? Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length)
        : 0;

    // Deviation from baseline
    const deviations = values.map(v => Math.round(v - baseline));

    const goodColor = '#10b981';
    const poorColor = '#ef4444';

    const option = {
        ...getCommonOptions('HR Recovery (60s)', isDark, data),
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const i = params[0]?.dataIndex;
                if (i == null) return '';
                const d = data[i];
                const dev = deviations[i];
                const devLabel = dev >= 0 ? `+${dev}` : `${dev}`;
                const devColor = dev >= 0 ? goodColor : poorColor;
                return `<div style="font-weight:600; margin-bottom:6px; font-family: Inter, sans-serif;">${d.date}</div>
                    <div style="margin-bottom:3px;">Recovery: <strong>${d.hr_recovery_60s} BPM</strong></div>
                    <div style="margin-bottom:3px;">Baseline avg: <strong>${baseline} BPM</strong></div>
                    <div style="color:${devColor}; font-weight:600;">Deviation: ${devLabel} BPM</div>`;
            }
        },
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: 'vs Baseline (BPM)',
            nameTextStyle: getAxisStyle(isDark).nameTextStyle,
            axisLabel: {
                ...getAxisStyle(isDark).axisLabel,
                formatter: (v) => v >= 0 ? `+${v}` : v
            },
            splitLine: getAxisStyle(isDark).splitLine,
            splitNumber: 5,
        },
        series: [
            {
                name: 'Recovery vs baseline',
                type: 'bar',
                data: deviations.map(d => ({
                    value: d,
                    itemStyle: {
                        color: d >= 0
                            ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: goodColor },
                                { offset: 1, color: goodColor + '44' },
                            ])
                            : new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                                { offset: 0, color: poorColor },
                                { offset: 1, color: poorColor + '44' },
                            ]),
                        borderRadius: d >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
                    }
                })),
                barMaxWidth: 24,
            },
            // Zero baseline reference
            {
                name: 'Baseline',
                type: 'line',
                data: deviations.map(() => 0),
                symbol: 'none',
                lineStyle: { width: 1.5, color: isDark ? '#475569' : '#94a3b8', type: 'dashed' },
                silent: true,
            }
        ]
    };
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>HR Recovery (60s)</h5>
            <p className="text-xs text-center text-muted-foreground mb-4" style={{ fontFamily: FONT_FAMILY }}>
                Deviation from personal average ({baseline} BPM) — green = better than usual
            </p>
            <ZoomableChart option={option} style={{ height: '400px', width: '100%' }} />
        </div>
    );
};

// 24. Simple Gauge Chart (No Needle)
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
