import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../theme-provider';
import * as echarts from 'echarts';

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

function useChartTheme() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return false;
    return resolvedTheme === 'dark';
}

// --- Shared Utilities ---
const PRIMARY_COLOR = '#3b82f6'; // Blue
const SECONDARY_COLOR = '#f97316'; // Orange

// Helper to aggregate data by month
const aggregateByMonth = (data, valueKey) => {
    if (!data || !data.length) return { months: [], values: [] };

    const monthlyData = {};
    data.forEach(d => {
        const rawDate = d.fullDate || d.date;
        if (!rawDate || !d[valueKey]) return;
        const date = new Date(rawDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { sum: 0, count: 0 };
        }
        monthlyData[monthKey].sum += d[valueKey] || 0;
        monthlyData[monthKey].count += 1;
    });

    const months = Object.keys(monthlyData).sort();
    const values = months.map(m => monthlyData[m].sum / monthlyData[m].count);

    // Format months as "Jan 2024"
    const formattedMonths = months.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return { months: formattedMonths, values };
};

// Helper to create monthly comparison bar chart
const createMonthlyComparison = (title, unit, data1, data2, primaryName, secondaryName, isDark) => {
    // Ensure both datasets have the same months
    const allMonths = new Set([...data1.months, ...data2.months]);
    const months = Array.from(allMonths).sort();

    // Align data to common months
    const alignData = (monthData) => {
        return months.map(month => {
            const idx = monthData.months.indexOf(month);
            return idx >= 0 ? monthData.values[idx] : 0;
        });
    };

    const values1 = alignData(data1);
    const values2 = alignData(data2);

    return {
        backgroundColor: 'transparent',
        // Title removed - handled externally
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? '#334155' : '#eee',
            textStyle: { color: isDark ? '#f8fafc' : '#333' },
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    html += `${p.marker} ${p.seriesName}: <b>${p.value.toFixed(1)} ${unit}</b><br/>`;
                });
                if (params.length === 2) {
                    const diff = params[1].value - params[0].value;
                    html += `<div style="margin-top:8px; padding-top:8px; border-top:1px solid ${isDark ? '#475569' : '#e5e7eb'}">`;
                    html += `Δ: <b style="color:${diff > 0 ? '#22c55e' : '#ef4444'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${unit}</b>`;
                    html += `</div>`;
                }
                return html;
            }
        },
        legend: {
            top: 50,
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            }
        },
        grid: { left: '10%', right: '10%', top: '25%', bottom: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif',
                rotate: months.length > 6 ? 45 : 0
            },
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                fontSize: 13
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400
            },
            splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0', type: 'dashed' } }
        },
        series: [
            {
                name: primaryName || 'Athlete 1',
                type: 'bar',
                data: values1,
                itemStyle: { color: PRIMARY_COLOR, borderRadius: [4, 4, 0, 0] },
                barMaxWidth: 40
            },
            {
                name: secondaryName || 'Athlete 2',
                type: 'bar',
                data: values2,
                itemStyle: { color: SECONDARY_COLOR, borderRadius: [4, 4, 0, 0] },
                barMaxWidth: 40
            }
        ]
    };
};

// Helper to create period overlay line chart (Then vs Now)
const createPeriodOverlay = (title, unit, data1, data2, primaryName, secondaryName, isDark) => {
    // data1 and data2 are raw arrays of daily data points
    // We plot them as Day 1, Day 2... on the X axis
    const maxLen = Math.max(data1.length, data2.length);
    const dayLabels = Array.from({ length: maxLen }, (_, i) => `Day ${i + 1}`);

    return {
        backgroundColor: 'transparent',
        // Title removed - handled externally
        tooltip: {
            trigger: 'axis',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? '#334155' : '#eee',
            textStyle: { color: isDark ? '#f8fafc' : '#333' },
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    html += `${p.marker} ${p.seriesName}: <b>${p.value !== undefined ? p.value.toFixed(1) : 'No Data'} ${unit}</b><br/>`;
                });
                return html;
            }
        },
        legend: {
            top: 55,
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            }
        },
        grid: { left: '8%', right: '8%', top: '25%', bottom: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: dayLabels,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            },
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontWeight: 400,
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif'
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            },
            splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0', type: 'dashed' } }
        },
        series: [
            {
                name: primaryName || 'Current Period',
                type: 'line',
                data: data1.map(d => d.value),
                itemStyle: { color: PRIMARY_COLOR },
                lineStyle: { width: 4 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0)' }
                    ])
                },
                smooth: true,
                symbol: 'none'
            },
            {
                name: secondaryName || 'Previous Period',
                type: 'line',
                data: data2.map(d => d.value),
                itemStyle: { color: SECONDARY_COLOR },
                lineStyle: { width: 3, type: 'dashed' },
                smooth: true,
                symbol: 'none'
            }
        ]
    };
};

// --- 1. Heart Rate: Combined Comparison ---
export const HeartRateComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.avg_hr }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.avg_hr })) : [];
        const option = createPeriodOverlay('Heart Rate: Period Overlay', 'bpm', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Heart Rate: Period Overlay</h5>
                <ReactECharts key={`hr-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'avg_hr');
    const data2 = aggregateByMonth(secondaryData, 'avg_hr');
    const option = createMonthlyComparison('Monthly Average Heart Rate', 'bpm', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average Heart Rate</h5>
            <ReactECharts key={`hr-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 2. Training Load: Combined Comparison ---
export const TrainingLoadComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.training_load }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.training_load })) : [];
        const option = createPeriodOverlay('Training Load: Period Overlay', 'AU', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Training Load: Period Overlay</h5>
                <ReactECharts key={`tl-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'training_load');
    const data2 = aggregateByMonth(secondaryData, 'training_load');
    const option = createMonthlyComparison('Monthly Average Training Load', 'AU', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average Training Load</h5>
            <ReactECharts key={`tl-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 3. HRV: Combined Comparison ---
export const HRVComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.rmssd }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.rmssd })) : [];
        const option = createPeriodOverlay('HRV: Period Overlay', 'ms', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">HRV: Period Overlay</h5>
                <ReactECharts key={`hrv-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'rmssd');
    const data2 = aggregateByMonth(secondaryData, 'rmssd');
    const option = createMonthlyComparison('Monthly Average HRV (RMSSD)', 'ms', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average HRV (RMSSD)</h5>
            <ReactECharts key={`hrv-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 4. Oxygen Debt (EPOC): Combined Comparison ---
export const OxygenDebtComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.epoc_total }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.epoc_total })) : [];
        const option = createPeriodOverlay('Oxygen Debt: Period Overlay', 'ml/kg', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Oxygen Debt: Period Overlay</h5>
                <ReactECharts key={`od-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'epoc_total');
    const data2 = aggregateByMonth(secondaryData, 'epoc_total');
    const option = createMonthlyComparison('Monthly Average Oxygen Debt (EPOC)', 'ml/kg', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average Oxygen Debt (EPOC)</h5>
            <ReactECharts key={`od-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 5. Energy Expenditure: Combined Comparison ---
export const EnergyComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.ee_men }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.ee_men })) : [];
        const option = createPeriodOverlay('Energy Expenditure: Period Overlay', 'kcal', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Energy Expenditure: Period Overlay</h5>
                <ReactECharts key={`ee-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'ee_men');
    const data2 = aggregateByMonth(secondaryData, 'ee_men');
    const option = createMonthlyComparison('Monthly Average Energy Expenditure', 'kcal', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average Energy Expenditure</h5>
            <ReactECharts key={`ee-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 6. Movement: Combined Comparison ---
export const MovementComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.movement_load }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.movement_load })) : [];
        const option = createPeriodOverlay('Movement Load: Period Overlay', 'AU', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Movement Load: Period Overlay</h5>
                <ReactECharts key={`mv-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'movement_load');
    const data2 = aggregateByMonth(secondaryData, 'movement_load');
    const option = createMonthlyComparison('Monthly Average Movement Load', 'AU', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average Movement Load</h5>
            <ReactECharts key={`mv-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 7. Oxygen Consumption (VO2): Combined Comparison ---
export const OxygenConsumptionComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.vo2_max }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.vo2_max })) : [];
        const option = createPeriodOverlay('VO2 Max: Period Overlay', 'ml/kg/min', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">VO2 Max: Period Overlay</h5>
                <ReactECharts key={`vo2-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'vo2_max');
    const data2 = aggregateByMonth(secondaryData, 'vo2_max');
    const option = createMonthlyComparison('Monthly Peak VO2 Max', 'ml/kg/min', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Peak VO2 Max</h5>
            <ReactECharts key={`vo2-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 8. Zone Distribution: Combined Comparison ---
export const ZoneComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    // Updated zone colors to match specification
    const colors = ['#d1d5db', '#9ca3af', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];

    if (compareType === 'period') {
        const calculateTotalZones = (data) => {
            const totals = [0, 0, 0, 0, 0, 0];
            data.forEach(d => {
                for (let i = 0; i < 6; i++) totals[i] += d[`zone_${i}_pct`] || 0;
            });
            const sum = totals.reduce((a, b) => a + b, 0);
            return totals.map(t => (sum > 0 ? (t / sum) * 100 : 0));
        };

        const z1 = calculateTotalZones(primaryData);
        const z2 = secondaryData ? calculateTotalZones(secondaryData) : [0, 0, 0, 0, 0, 0];

        const option = {
            backgroundColor: 'transparent',
            // Title removed - handled externally
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { top: 45, textStyle: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 } },
            grid: { left: '8%', right: '8%', top: '25%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: ['Zone 0', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
                axisLabel: { color: isDark ? '#94a3b8' : '#64748b' }
            },
            yAxis: { type: 'value', name: '%', max: 100, splitLine: { lineStyle: { type: 'dashed' } } },
            series: [
                {
                    name: primaryName || 'Current',
                    type: 'bar',
                    data: z1,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: PRIMARY_COLOR },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.6)' }
                        ]),
                        borderRadius: [6, 6, 0, 0]
                    }
                },
                {
                    name: secondaryName || 'Previous',
                    type: 'bar',
                    data: z2,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: SECONDARY_COLOR },
                            { offset: 1, color: 'rgba(249, 115, 22, 0.6)' }
                        ]),
                        borderRadius: [6, 6, 0, 0]
                    }
                }
            ]
        };
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Intensity Shift: Period Comparison</h5>
                <ReactECharts key={`zone-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }


    // Aggregate zones by month for both athletes
    const aggregateZonesByMonth = (data) => {
        if (!data || !data.length) return { months: [], zones: [[], [], [], [], [], []] };

        const monthlyData = {};
        data.forEach(d => {
            const rawDate = d.fullDate || d.date;
            if (!rawDate) return;
            const date = new Date(rawDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { zones: [0, 0, 0, 0, 0, 0], count: 0 };
            }
            for (let i = 0; i < 6; i++) {
                monthlyData[monthKey].zones[i] += d[`zone_${i}_pct`] || 0;
            }
            monthlyData[monthKey].count += 1;
        });

        const months = Object.keys(monthlyData).sort();
        const formattedMonths = months.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const zones = [[], [], [], [], [], []];
        months.forEach(m => {
            const avgZones = monthlyData[m].zones.map(z => z / monthlyData[m].count);
            const total = avgZones.reduce((a, b) => a + b, 0);
            avgZones.forEach((z, i) => {
                zones[i].push(total > 0 ? (z / total) * 100 : 0);
            });
        });

        return { months: formattedMonths, zones };
    };

    const data1 = aggregateZonesByMonth(primaryData);
    const data2 = secondaryData ? aggregateZonesByMonth(secondaryData) : { months: [], zones: [[], [], [], [], [], []] };

    // Merge months from both datasets
    const allMonths = [...new Set([...data1.months, ...data2.months])].sort();

    // Create series for each zone, with two bars per month (one for each athlete)
    const series = [];

    // For each zone, create two series (one for each athlete)
    for (let z = 0; z < 6; z++) {
        // Primary athlete series
        series.push({
            name: `${primaryName || 'Athlete 1'} - Zone ${z}`,
            type: 'bar',
            stack: primaryName || 'Athlete 1',
            data: allMonths.map(month => {
                const idx = data1.months.indexOf(month);
                return idx >= 0 ? data1.zones[z][idx] : 0;
            }),
            itemStyle: { color: colors[z] },
            barMaxWidth: 40,
            barGap: '10%'
        });

        // Secondary athlete series
        if (secondaryData) {
            series.push({
                name: `${secondaryName || 'Athlete 2'} - Zone ${z}`,
                type: 'bar',
                stack: secondaryName || 'Athlete 2',
                data: allMonths.map(month => {
                    const idx = data2.months.indexOf(month);
                    return idx >= 0 ? data2.zones[z][idx] : 0;
                }),
                itemStyle: { color: colors[z] },
                barMaxWidth: 40,
                barGap: '10%'
            });
        }
    }

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? '#334155' : '#eee',
            textStyle: { color: isDark ? '#f8fafc' : '#333' },
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px">${params[0].axisValue}</div>`;

                // Group by athlete
                const athlete1Data = params.filter(p => p.seriesName.includes(primaryName || 'Athlete 1'));
                const athlete2Data = params.filter(p => p.seriesName.includes(secondaryName || 'Athlete 2'));

                if (athlete1Data.length > 0) {
                    html += `<div style="margin-top:8px; font-weight:600">${primaryName || 'Athlete 1'}</div>`;
                    athlete1Data.forEach(p => {
                        const zoneName = p.seriesName.split(' - ')[1];
                        html += `${p.marker} ${zoneName}: <b>${p.value.toFixed(1)}%</b><br/>`;
                    });
                }

                if (athlete2Data.length > 0) {
                    html += `<div style="margin-top:8px; font-weight:600">${secondaryName || 'Athlete 2'}</div>`;
                    athlete2Data.forEach(p => {
                        const zoneName = p.seriesName.split(' - ')[1];
                        html += `${p.marker} ${zoneName}: <b>${p.value.toFixed(1)}%</b><br/>`;
                    });
                }

                return html;
            }
        },
        legend: {
            top: 45,
            data: ['Zone 0', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
            textStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 13,
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            },
            formatter: (name) => name // Show only zone names in legend
        },
        grid: { left: '8%', right: '8%', top: '25%', bottom: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: allMonths,
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif',
                rotate: allMonths.length > 6 ? 45 : 0
            },
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } }
        },
        yAxis: {
            type: 'value',
            name: '%',
            max: 100,
            nameTextStyle: {
                color: isDark ? '#ffffff' : '#64748b',
                fontWeight: 400,
                fontFamily: 'Outfit, sans-serif'
            },
            axisLabel: {
                color: isDark ? '#ffffff' : '#64748b',
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif'
            },
            splitLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0', type: 'dashed' } }
        },
        series
    };

    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Zone Distribution Comparison</h5>
            <ReactECharts key={`zone-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 9. RMSSD: Combined Comparison ---
export const RMSSDComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.rmssd }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.rmssd })) : [];
        const option = createPeriodOverlay('RMSSD: Period Overlay', 'ms', d1, d2, primaryName, secondaryName, isDark);
        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">RMSSD: Period Overlay</h5>
                <ReactECharts key={`rm-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'rmssd');
    const data2 = aggregateByMonth(secondaryData, 'rmssd');
    const option = createMonthlyComparison('Monthly Average RMSSD', 'ms', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">Monthly Average RMSSD</h5>
            <ReactECharts key={`rm-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};

// --- 10. ACWR: Combined Comparison ---
export const ACWRComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    if (compareType === 'period') {
        const d1 = primaryData.map(d => ({ value: d.acwr }));
        const d2 = secondaryData ? secondaryData.map(d => ({ value: d.acwr })) : [];
        const option = createPeriodOverlay('ACWR: Period Overlay', 'ratio', d1, d2, primaryName, secondaryName, isDark);

        // Add optimal zone as a markLine to the first series
        if (option.series && option.series.length > 0) {
            option.series[0].markLine = {
                silent: true,
                symbol: 'none',
                data: [{ yAxis: 1.0 }],
                lineStyle: { color: isDark ? '#ffffff' : '#000000', type: 'dotted', width: 2 },
                label: { show: false }
            };
        }

        return (
            <div className="w-full h-full">
                <h5 className="text-2xl font-normal text-foreground dark:text-white mb-4 text-center">ACWR: Period Overlay</h5>
                <ReactECharts key={`acwr-p-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'acwr');
    const data2 = aggregateByMonth(secondaryData, 'acwr');
    const option = createMonthlyComparison('Monthly Average ACWR', 'ratio', data1, data2, primaryName, secondaryName, isDark);

    // Add optimal zone as a markLine to the first series
    if (option.series && option.series.length > 0) {
        option.series[0].markLine = {
            silent: true,
            symbol: 'none',
            data: [{ yAxis: 1.0 }],
            lineStyle: { color: isDark ? '#ffffff' : '#000000', type: 'dashed', width: 2 },
            label: { show: false }
        };
    }

    return (
        <div className="w-full h-full">
            <h5 className="text-2xl font-normal text-foreground dark:text-[#64748b] mb-4 text-center">Monthly Average ACWR</h5>
            <ReactECharts key={`acwr-m-${isDark}`} option={option} notMerge={true} theme={isDark ? 'dark' : 'macarons'} style={{ height: '500px' }} />
        </div>
    );
};
