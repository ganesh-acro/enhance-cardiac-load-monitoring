import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTheme } from '../theme-provider';
import { format, parseISO } from 'date-fns';

// Register ECharts themes directly
echarts.registerTheme('dark', {
    darkMode: true,
    color: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'],
    backgroundColor: '#100C2A',
    textStyle: { color: '#B9B8CE' },
    title: {
        textStyle: { color: '#EEF1FA' },
        subtextStyle: { color: '#B9B8CE' }
    },
    line: { symbol: 'circle' },
    radar: { symbol: 'circle' },
    bar: { itemStyle: { borderRadius: 0 } },
    pie: { itemStyle: { borderRadius: 0 } },
    scatter: { symbol: 'circle' },
    boxplot: { itemStyle: { borderRadius: 0 } },
    parallel: {},
    sankey: {},
    funnel: { itemStyle: { borderRadius: 0 } },
    gauge: {
        title: { color: '#B9B8CE' },
        axisLine: { lineStyle: { color: [[1, '#B9B8CE']] } }
    },
    candlestick: {
        itemStyle: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B'
        }
    },
    graph: { color: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'] },
    map: {},
    geo: {},
    categoryAxis: {
        axisLine: { lineStyle: { color: '#B9B8CE' } },
        splitLine: { lineStyle: { color: '#484753' } },
        splitArea: { show: false }
    },
    valueAxis: {
        axisLine: { lineStyle: { color: '#B9B8CE' } },
        splitLine: { lineStyle: { color: '#484753' } },
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] } }
    },
    logAxis: {
        axisLine: { lineStyle: { color: '#B9B8CE' } },
        splitLine: { lineStyle: { color: '#484753' } }
    },
    timeAxis: {
        axisLine: { lineStyle: { color: '#B9B8CE' } },
        splitLine: { lineStyle: { color: '#484753' } }
    },
    toolbox: { iconStyle: { borderColor: '#B9B8CE' } },
    legend: { textStyle: { color: '#B9B8CE' } },
    tooltip: {
        axisPointer: {
            lineStyle: { color: '#817f91' },
            crossStyle: { color: '#817f91' }
        }
    },
    timeline: {
        lineStyle: { color: '#B9B8CE' },
        itemStyle: { color: '#4992ff' },
        controlStyle: { color: '#B9B8CE', borderColor: '#B9B8CE' },
        checkpointStyle: { color: '#4992ff' },
        label: { color: '#B9B8CE' }
    },
    visualMap: { textStyle: { color: '#B9B8CE' } },
    dataZoom: {
        borderColor: '#71708A',
        textStyle: { color: '#B9B8CE' },
        brushStyle: { color: 'rgba(135,163,206,0.3)' },
        handleStyle: { color: '#353450', borderColor: '#C5CBE3' },
        moveHandleStyle: { color: '#B0B6C3', opacity: 0.3 },
        fillerColor: 'rgba(135,163,206,0.2)',
        emphasis: {
            handleStyle: { borderColor: '#91B7F2', color: '#4D587D' },
            moveHandleStyle: { color: '#636D9A', opacity: 0.7 }
        },
        dataBackground: {
            lineStyle: { color: '#71708A', width: 1 },
            areaStyle: { color: '#71708A' }
        },
        selectedDataBackground: {
            lineStyle: { color: '#87A3CE' },
            areaStyle: { color: '#87A3CE' }
        }
    },
    markPoint: { label: { color: '#eee' } }
});

echarts.registerTheme('macarons', {
    color: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa'],
    backgroundColor: 'rgba(0,0,0,0)',
    textStyle: {},
    title: {
        textStyle: { color: '#008acd' },
        subtextStyle: { color: '#333' }
    },
    line: {
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 3
    },
    radar: { symbol: 'emptyCircle', symbolSize: 3 },
    bar: { itemStyle: { borderRadius: 0 } },
    pie: { itemStyle: { borderRadius: 0 } },
    scatter: { symbol: 'circle', symbolSize: 4 },
    boxplot: { itemStyle: { borderRadius: 0 } },
    parallel: {},
    sankey: {},
    funnel: { itemStyle: { borderRadius: 0 } },
    gauge: {
        axisLine: {
            lineStyle: {
                color: [[0.2, '#2ec7c9'], [0.8, '#5ab1ef'], [1, '#d87a80']],
                width: 10
            }
        },
        axisTick: { splitNumber: 10, length: 15, lineStyle: { color: 'auto' } },
        splitLine: { length: 22, lineStyle: { color: 'auto' } },
        pointer: { width: 5 }
    },
    candlestick: {
        itemStyle: { color: '#d87a80', color0: '#2ec7c9' },
        lineStyle: { width: 1, color: '#d87a80', color0: '#2ec7c9' },
        areaStyle: { color: '#2ec7c9', color0: '#b6a2de' }
    },
    graph: { color: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80'] },
    map: {
        itemStyle: { color: '#ddd' },
        areaStyle: { color: '#fe994e' },
        label: { color: '#d87a80' }
    },
    geo: {
        itemStyle: { color: '#ddd' },
        areaStyle: { color: '#fe994e' },
        label: { color: '#d87a80' }
    },
    categoryAxis: {
        axisLine: { lineStyle: { color: '#008acd' } },
        splitLine: { lineStyle: { color: ['#eee'] } }
    },
    valueAxis: {
        axisLine: { lineStyle: { color: '#008acd' } },
        splitArea: {
            show: true,
            areaStyle: { color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)'] }
        },
        splitLine: { lineStyle: { color: ['#eee'] } }
    },
    logAxis: {
        axisLine: { lineStyle: { color: '#008acd' } },
        splitLine: { lineStyle: { color: ['#eee'] } }
    },
    timeAxis: {
        axisLine: { lineStyle: { color: '#008acd' } },
        splitLine: { lineStyle: { color: ['#eee'] } }
    },
    toolbox: { iconStyle: { borderColor: '#2ec7c9' } },
    legend: { textStyle: { color: '#333' } },
    tooltip: {
        borderWidth: 0,
        backgroundColor: 'rgba(50,50,50,0.5)',
        textStyle: { color: '#FFF' },
        axisPointer: {
            type: 'line',
            lineStyle: { color: '#008acd' },
            crossStyle: { color: '#008acd' },
            shadowStyle: { color: 'rgba(200,200,200,0.2)' }
        }
    },
    timeline: {
        lineStyle: { color: '#008acd' },
        itemStyle: { color: '#008acd' },
        controlStyle: { color: '#008acd', borderColor: '#008acd' },
        checkpointStyle: { color: '#2ec7c9' },
        label: { color: '#008acd' },
        symbol: 'emptyCircle',
        symbolSize: 3
    },
    visualMap: {
        itemWidth: 15,
        color: ['#5ab1ef', '#e0ffff'],
        textStyle: { color: '#333' }
    },
    dataZoom: {
        dataBackgroundColor: '#efefff',
        fillerColor: 'rgba(182,162,222,0.2)',
        handleColor: '#008acd',
        textStyle: { color: '#333' }
    },
    markPoint: { label: { color: '#eee' } }
});

// Common Chart Options
const getCommonOptions = (title, isDark) => ({
    backgroundColor: 'transparent',
    // Title removed - handled externally
    tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#334155' : '#eee',
        textStyle: { color: isDark ? '#f8fafc' : '#333' },
        padding: [10, 15],
        extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); border-radius: 8px; z-index: 100;',
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: 30,
        containLabel: true,
    },
    dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
            type: 'slider',
            bottom: '10%',
            height: 20,
            borderColor: 'transparent',
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            fillerColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.1)',
            handleStyle: { color: '#3b82f6' },
            textStyle: { color: 'transparent' }
        },
    ],
    legend: {
        bottom: 0,
        left: 'center',
        itemGap: 20,
        textStyle: {
            color: isDark ? '#ffffff' : '#64748b',
            fontSize: 14,
            fontWeight: 400,
            fontFamily: 'Outfit, sans-serif'
        },
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
});

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
            trigger: 'axis',
            axisPointer: { type: 'line' }
        },
        legend: {
            top: 30,
            textStyle: { color: isDark ? '#f8fafc' : '#4b5563', fontWeight: 400 }
        },
        grid: {
            top: 80,
            bottom: 60,
            left: 50,
            right: 20,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            max: (v) => Math.ceil(v.max + 5),
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            splitLine: { lineStyle: { type: 'dashed', opacity: 0.2 } }
        },
        series
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px', width: '100%' }} />;
};

// 2. Training Load Trend (Bar + Line)
export const TrainingLoadTrendChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Training load trend', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Load',
                splitLine: { show: false },
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            }
        ],
        series: [
            {
                name: 'Training load',
                type: 'bar',
                data: data.map(d => d.training_load),
                itemStyle: { color: '#10b981', opacity: 0.8 }
            },
            {
                name: 'Training intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.training_intensity),
                itemStyle: { color: '#3b82f6' },
                lineStyle: { width: 3 }
            }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 3. HRV Trend
export const HRVMultiLineChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('HRV trend', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [
            { name: `SDNN`, type: 'line', smooth: true, data: data.map(d => d.sdnn), itemStyle: { color: '#8b5cf6' } },
            { name: `RMSSD`, type: 'line', smooth: true, data: data.map(d => d.rmssd), itemStyle: { color: '#3b82f6' } },
            { name: `pNN50`, type: 'line', smooth: true, data: data.map(d => d.pnn50), itemStyle: { color: '#10b981' } }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 4. Oxygen Debt (EPOC)
export const OxygenDebtChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Oxygen Debt (EPOC)', isDark),
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'EPOC',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [
            {
                name: 'Total EPOC',
                type: 'bar',
                data: data.map(d => d.epoc_total || 0),
                itemStyle: {
                    color: '#f59e0b', // Amber 500
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 30
            },
            {
                name: 'Peak EPOC',
                type: 'line',
                data: data.map(d => d.epoc_peak || 0),
                itemStyle: { color: '#ef4444' }, // Red for Peak
                symbol: 'circle',
                symbolSize: 8,
                smooth: true,
                lineStyle: { width: 3 }
            }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px', width: '100%' }} />;
};

// 5. Energy Expenditure
export const EnergyChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Energy expenditure', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'kcal',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [{
            name: 'Energy',
            type: 'line',
            smooth: true,
            showSymbol: false,
            areaStyle: { opacity: 0.3, color: '#eab308' },
            itemStyle: { color: '#eab308' },
            data: data.map(d => d.ee_men)
        }]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 6. Movement Trend (Bar + Line)
export const MovementTrendChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Movement trend', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Movement load',
                splitLine: { show: false },
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                splitLine: { show: false },
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            }
        ],
        series: [
            {
                name: 'Movement load',
                type: 'bar',
                data: data.map(d => d.movement_load),
                itemStyle: { color: '#8b5cf6', opacity: 0.8 }
            },
            {
                name: 'Movement intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.movement_load_intensity),
                itemStyle: { color: '#10b981' },
                lineStyle: { width: 3 }
            }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 7. Oxygen Consumption (VO2)
export const OxygenConsumptionChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    // Calculate Dataset Average
    const vo2Values = data.map(d => parseFloat(d.vo2 || 0));
    const vo2Avg = (vo2Values.reduce((a, b) => a + b, 0) / vo2Values.length).toFixed(1);

    const option = {
        ...getCommonOptions('Oxygen consumption (VO2)', isDark),
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        grid: {
            top: 60,
            right: 15,
            bottom: 60, // Increased to show X-axis labels properly
            left: 15,
            containLabel: true
        },
        legend: {
            data: ['Measured VO2', 'VO2 Max', 'Avg VO2'],
            bottom: 0,
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                fontWeight: 400
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'ml/kg/min',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [
            {
                name: 'Measured VO2',
                type: 'bar',
                data: data.map(d => d.vo2 || 0),
                itemStyle: {
                    color: '#3b82f6',
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 30
            },
            {
                name: 'VO2 Max',
                type: 'line',
                data: data.map(d => d.vo2_max || 0),
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#eab308' }, // Yellow line for VO2 Max
                lineStyle: { width: 3, type: 'solid' }
            },
            {
                name: 'Avg VO2',
                type: 'line',
                data: new Array(data.length).fill(vo2Avg),
                symbol: 'none',
                lineStyle: {
                    color: isDark ? '#fff' : '#000', // Black line (white in dark mode for visibility)
                    type: 'dashed',
                    width: 2
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    label: {
                        position: 'middle',
                        formatter: `Avg VO2: {c}`,
                        color: isDark ? '#fff' : '#000',
                        fontWeight: 400,
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
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
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

    const option = {
        ...getCommonOptions('Heart rate zone distribution', isDark),
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            name: '%',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 9a. Recovery Beats
export const RecoveryBeatsChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Recovery beats', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'Beats',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [{
            name: 'Recovery',
            type: 'line',
            smooth: true,
            data: data.map(d => d.recovery_beats),
            itemStyle: { color: '#10b981' },
            markLine: {
                silent: true,
                data: [{ yAxis: 50, lineStyle: { color: '#94a3b8', type: 'dashed' } }]
            }
        }]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
};

// 9b. RMSSD
export const RMSSDChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('RMSSD', isDark),
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [{
            name: 'RMSSD',
            type: 'line',
            smooth: true,
            data: data.map(d => d.rmssd),
            itemStyle: { color: '#10b981' },
            markLine: {
                silent: true,
                data: [{ yAxis: 50, lineStyle: { color: '#94a3b8', type: 'dashed' } }]
            }
        }]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
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

    // Dynamic Y-Axis Limit
    const maxVal = Math.max(...data.map(d => parseFloat(d.acwr || 0)));
    const yLimit = Math.max(2.0, Math.ceil((maxVal + 0.2) * 10) / 10); // Min 2.0, or max + padding

    const option = {
        ...getCommonOptions('Workload Ratio (ACWR)', isDark), // Restore common options for Title
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.border,
            textStyle: { color: chartTheme.text },
            formatter: (params) => {
                const date = params[0].axisValue; // Use axisValue for Category axis
                const val = params[0].value;
                let status = '';
                if (val > 1.3) status = 'High Risk';
                else if (val < 0.8) status = 'Undertraining';
                else status = 'Optimal';

                return `
                    <div class="font-bold mb-1">${date}</div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span class="text-sm">Ratio: <strong>${parseFloat(val).toFixed(2)}</strong></span>
                    </div>
                    <div class="text-xs opacity-70 mt-1">Status: ${status}</div>
                `;
            }
        },
        grid: {
            top: 60, // Increased top padding for Title
            right: 20,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: chartTheme.subtext,
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif'
            },
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: 'Ratio', // Explicit name
            min: 0,
            max: yLimit,
            splitLine: {
                lineStyle: { color: chartTheme.grid, type: 'dashed' }
            },
            axisLabel: {
                color: chartTheme.subtext,
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif'
            },
            nameTextStyle: {
                color: chartTheme.subtext,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [
            {
                name: 'ACWR',
                type: 'line',
                data: data.map(d => d.acwr || 0),
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#3b82f6' }, // Blue Line
                lineStyle: { width: 3 },
                markArea: {
                    silent: true,
                    itemStyle: { opacity: 0.15 },
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
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px' }} />;
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
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '30px', width: '80px' }} />;
};

// Hover Trend Chart for Tooltips/Overview
export const HoverTrendChart = ({ data, color, name }) => {
    const isDark = useChartTheme();
    const option = {
        grid: { left: 5, right: 5, top: 5, bottom: 5 },
        tooltip: { trigger: 'axis', formatter: `{b}: {c}` },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [{
            name, type: 'line', smooth: true, data,
            lineStyle: { color, width: 3 },
            itemStyle: { color },
            areaStyle: { color, opacity: 0.2 }
        }]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '100px', width: '100%' }} />;
};

// 15. Monthly Aggregated Load vs HRV Chart
export const MonthlyLoadCombinedChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Monthly Training Load vs HRV Trend', isDark),
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 text-muted-foreground">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
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
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisPointer: {
                type: 'shadow'
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Training Load',
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                min: 0,
                axisLabel: {
                    formatter: '{value}',
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                splitLine: { show: false }
            },
            {
                type: 'value',
                name: 'HRV (ms)',
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                min: 0,
                axisLabel: {
                    formatter: '{value} ms',
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                splitLine: {
                    show: true,
                    lineStyle: { color: isDark ? '#334155' : '#e2e8f0', type: 'dashed' }
                }
            }
        ],
        series: [
            {
                name: 'Training Load',
                type: 'bar',
                data: data.map(d => d.load || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#f59e0b' }, // Amber 500
                        { offset: 1, color: '#d97706' }  // Amber 600
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 40
            },
            {
                name: 'HRV (RMSSD)',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(d => d.hrv || 0),
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#8b5cf6', // Violet 500
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#fff'
                },
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(139, 92, 246, 0.3)',
                    shadowBlur: 10
                }
            }
        ]
    };

    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '450px', width: '100%' }} />;
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

    const series = zones.map(idx => ({
        name: `Zone ${idx}`,
        type: 'bar',
        data: data.map(d => d.zones?.[`z${idx}`] || 0),
        itemStyle: { color: zoneColors[idx], borderRadius: [2, 2, 0, 0] },
        label: {
            show: true,
            position: 'top',
            formatter: (params) => params.value > 0 ? params.value : '',
            fontSize: 9,
            color: isDark ? '#ffffff' : '#64748b',
            fontFamily: 'Outfit, sans-serif',
            rotate: 0,
            distance: 5
        },
        emphasis: { focus: 'series' },
        barGap: '5%',
        barCategoryGap: '20%'
    }));

    const option = {
        ...getCommonOptions('HR Zone Split (mins)', isDark),
        title: {
            ...getCommonOptions('HR Zone Split (mins)', isDark).title,
            left: 'left',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            top: 40,
            left: 'left',
            data: zones.map(z => `Zone ${z}`),
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                fontSize: 12
            },
            padding: [0, 50, 0, 0]
        },
        grid: {
            top: 120, // Increased to accommodate more legend rows
            right: 20,
            bottom: 60,
            left: 50,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                fontSize: 12,
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif'
            }
        },
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            splitLine: { lineStyle: { type: 'dashed', opacity: 0.2 } }
        },
        series
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '400px', width: '100%' }} />;
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

    const option = {
        ...getCommonOptions('Monthly Zone Split (mins)', isDark),
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 text-muted-foreground">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
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
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '350px', width: '100%' }} />;
};

// 17. Monthly Min/Max HR Chart
export const MonthlyHRAvgRangeChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Monthly HR Range (Avg)', isDark),
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 text-muted-foreground">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
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
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'BPM',
            min: (v) => Math.floor(v.min - 5),
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        series: [
            {
                name: 'Min HR',
                type: 'bar',
                data: data.map(d => d.hr?.min || 0),
                itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
                barGap: '10%'
            },
            {
                name: 'Max HR',
                type: 'bar',
                data: data.map(d => d.hr?.max || 0),
                itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'Avg HR',
                type: 'line',
                data: data.map(d => d.hr?.avg || 0),
                itemStyle: { color: '#f97316' },
                lineStyle: { type: 'dashed' },
                symbol: 'none'
            }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '350px', width: '100%' }} />;
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
    const maxVal = Math.max(...data.map(d => parseFloat(d.acwr || 0)));
    const yLimit = Math.max(2.0, Math.ceil((maxVal + 0.2) * 10) / 10); // Min 2.0, or max + padding

    const option = {
        backgroundColor: 'transparent', // Ensure chart bg is transparent to show container
        tooltip: {
            trigger: 'axis',
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.border,
            textStyle: { color: chartTheme.text },
            formatter: (params) => {
                const date = params[0].axisValue;
                const val = params[0].value;
                let status = '';
                if (val > 1.3) status = 'High Risk';
                else if (val < 0.8) status = 'Undertraining';
                else status = 'Optimal';

                return `
                    <div class="font-bold mb-1">${date}</div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span class="text-sm">ACWR: <strong>${val}</strong></span>
                    </div>
                    <div class="text-xs opacity-70 mt-1">Status: ${status}</div>
                `;
            }
        },
        grid: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: chartTheme.subtext,
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif'
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: yLimit,
            splitLine: {
                lineStyle: { color: chartTheme.grid, type: 'dashed' }
            },
            axisLabel: {
                color: chartTheme.subtext,
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif'
            }
        },
        series: [
            {
                name: 'ACWR',
                type: 'line',
                data: acwrValues,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#3b82f6' }, // Blue Line
                lineStyle: { width: 3 },
                markArea: {
                    silent: true,
                    itemStyle: { opacity: 0.15 },
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

    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '300px', width: '100%' }} />;
};

// 19. Monthly Movement Trend
export const MonthlyMovementComboChart = ({ data }) => {
    const isDark = useChartTheme();
    if (!data || data.length === 0) return null;
    const dates = data.map(d => d.date);

    const option = {
        ...getCommonOptions('Monthly Movement Intensity & Load', isDark),
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const dateIndex = params[0].dataIndex;
                const sessions = data[dateIndex].sessionCount;
                let tooltip = `<div class="font-bold mb-1">${params[0].name}</div>`;
                tooltip += `<div class="text-xs mb-2 text-muted-foreground">Sessions: ${sessions}</div>`;
                params.forEach(p => {
                    tooltip += `
                        <div class="flex items-center justify-between gap-4">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
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
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Load',
                splitLine: { show: false },
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            },
            {
                type: 'value',
                name: 'Intensity',
                position: 'right',
                nameTextStyle: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                },
                axisLabel: {
                    color: isDark ? '#ffffff' : '#64748b',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12
                }
            }
        ],
        series: [
            {
                name: 'Movement Load',
                type: 'bar',
                data: data.map(d => d.movement?.load || 0),
                itemStyle: { color: '#22c55e' }
            },
            {
                name: 'Movement Intensity',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: data.map(d => d.movement?.intensity || 0),
                itemStyle: { color: '#1d4ed8' }, // Dark Blue
                lineStyle: { width: 3 }
            }
        ]
    };
    return <ReactECharts option={option} theme={isDark ? 'dark' : 'macarons'} style={{ height: '350px', width: '100%' }} />;
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
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 400,
                    color: isDark ? '#ffffff' : '#111827',
                    formatter: (val) => `{a|${val}}\n{b|${unit}}`,
                    rich: {
                        a: {
                            fontSize: 24,
                            fontWeight: 800,
                            color: isDark ? '#ffffff' : '#111827',
                            fontFamily: 'Outfit, sans-serif',
                            padding: [0, 0, 5, 0]
                        },
                        b: {
                            fontSize: 11,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontFamily: 'Outfit, sans-serif',
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
