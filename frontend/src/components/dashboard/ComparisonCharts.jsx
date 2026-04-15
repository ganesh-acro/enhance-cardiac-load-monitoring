import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../theme-provider';
import {
    BRAND_ORANGE,
    SECONDARY_BLUE,
    FONT_FAMILY,
    getTooltipStyle,
    getAxisStyle,
    getLegendStyle,
    getGridStyle,
    getLineSeriesStyle,
    getBarItemStyle,
    getResponsiveXAxis,
} from '../../utils/chartStyles';

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
    const axisStyle = getAxisStyle(isDark);
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
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px; font-family: Inter, sans-serif;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    html += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value.toFixed(1)} ${unit}</span>
                        </div>
                    `;
                });
                if (params.length === 2) {
                    const diff = params[1].value - params[0].value;
                    html += `<div style="margin-top:8px; padding-top:8px; border-top:1px solid ${isDark ? '#334155' : '#e5e7eb'}; opacity: 0.8; font-size: 11px;">`;
                    html += `Difference: <b style="color:${diff > 0 ? '#22c55e' : '#ef4444'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${unit}</b>`;
                    html += `</div>`;
                }
                return html;
            }
        },
        legend: {
            ...getLegendStyle(isDark),
            top: 50,
        },
        grid: getGridStyle({ left: '10%', right: '10%', top: '25%', bottom: '15%' }),
        xAxis: getResponsiveXAxis(isDark, months),
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series: [
            {
                name: primaryName || 'Athlete 1',
                type: 'bar',
                data: values1,
                itemStyle: getBarItemStyle(BRAND_ORANGE),
                barMaxWidth: 40
            },
            {
                name: secondaryName || 'Athlete 2',
                type: 'bar',
                data: values2,
                itemStyle: getBarItemStyle(SECONDARY_BLUE),
                barMaxWidth: 40
            }
        ]
    };
};

// Helper to create period overlay line chart (Then vs Now)
const createPeriodOverlay = (title, unit, data1, data2, primaryName, secondaryName, isDark) => {
    const axisStyle = getAxisStyle(isDark);
    // data1 and data2 are raw arrays of daily data points
    // We plot them as Day 1, Day 2... on the X axis
    const maxLen = Math.max(data1.length, data2.length);
    const dayLabels = Array.from({ length: maxLen }, (_, i) => `Day ${i + 1}`);

    return {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px; font-family: Inter, sans-serif;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    html += `
                        <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                            <span class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                ${p.seriesName}
                            </span>
                            <span class="font-mono font-bold">${p.value !== undefined ? p.value.toFixed(1) : 'No Data'} ${unit}</span>
                        </div>
                    `;
                });
                return html;
            }
        },
        legend: {
            ...getLegendStyle(isDark),
            top: 55,
        },
        grid: getGridStyle({ left: '8%', right: '8%', top: '25%', bottom: '15%' }),
        xAxis: getResponsiveXAxis(isDark, dayLabels),
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series: [
            {
                name: primaryName || 'Current Period',
                type: 'line',
                data: data1.map(d => d.value),
                ...getLineSeriesStyle(BRAND_ORANGE, true),
                symbol: 'none'
            },
            {
                name: secondaryName || 'Previous Period',
                type: 'line',
                data: data2.map(d => d.value),
                ...getLineSeriesStyle(SECONDARY_BLUE, false),
                lineStyle: { width: 3, type: 'dashed' },
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Heart Rate: Period Overlay</h5>
                <ReactECharts key={`hr-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'avg_hr');
    const data2 = aggregateByMonth(secondaryData, 'avg_hr');
    const option = createMonthlyComparison('Monthly Average Heart Rate', 'bpm', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average Heart Rate</h5>
            <ReactECharts key={`hr-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Training Load: Period Overlay</h5>
                <ReactECharts key={`tl-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'training_load');
    const data2 = aggregateByMonth(secondaryData, 'training_load');
    const option = createMonthlyComparison('Monthly Average Training Load', 'AU', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average Training Load</h5>
            <ReactECharts key={`tl-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>HRV: Period Overlay</h5>
                <ReactECharts key={`hrv-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'rmssd');
    const data2 = aggregateByMonth(secondaryData, 'rmssd');
    const option = createMonthlyComparison('Monthly Average HRV (RMSSD)', 'ms', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average HRV (RMSSD)</h5>
            <ReactECharts key={`hrv-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Oxygen Debt: Period Overlay</h5>
                <ReactECharts key={`od-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'epoc_total');
    const data2 = aggregateByMonth(secondaryData, 'epoc_total');
    const option = createMonthlyComparison('Monthly Average Oxygen Debt (EPOC)', 'ml/kg', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average Oxygen Debt (EPOC)</h5>
            <ReactECharts key={`od-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Energy Expenditure: Period Overlay</h5>
                <ReactECharts key={`ee-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'ee_men');
    const data2 = aggregateByMonth(secondaryData, 'ee_men');
    const option = createMonthlyComparison('Monthly Average Energy Expenditure', 'kcal', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average Energy Expenditure</h5>
            <ReactECharts key={`ee-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Movement Load: Period Overlay</h5>
                <ReactECharts key={`mv-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'movement_load');
    const data2 = aggregateByMonth(secondaryData, 'movement_load');
    const option = createMonthlyComparison('Monthly Average Movement Load', 'AU', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average Movement Load</h5>
            <ReactECharts key={`mv-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>VO2 Max: Period Overlay</h5>
                <ReactECharts key={`vo2-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'vo2_max');
    const data2 = aggregateByMonth(secondaryData, 'vo2_max');
    const option = createMonthlyComparison('Monthly Peak VO2 Max', 'ml/kg/min', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Peak VO2 Max</h5>
            <ReactECharts key={`vo2-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
        </div>
    );
};

// --- 8. Zone Distribution: Combined Comparison ---
export const ZoneComparisonChart = ({ primaryData, secondaryData, primaryName, secondaryName, compareType }) => {
    const isDark = useChartTheme();
    if (!primaryData) return null;

    const colors = ['#d1d5db', '#9ca3af', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];
    const axisStyle = getAxisStyle(isDark);

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
            tooltip: {
                ...getTooltipStyle(isDark),
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                ...getLegendStyle(isDark),
                top: 45
            },
            grid: getGridStyle({ left: '8%', right: '8%', top: '25%', bottom: '15%' }),
            xAxis: {
                type: 'category',
                data: ['Zone 0', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
                axisLabel: axisStyle.axisLabel,
                axisLine: axisStyle.axisLine
            },
            yAxis: {
                type: 'value',
                name: '%',
                max: 100,
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                splitLine: axisStyle.splitLine
            },
            series: [
                {
                    name: primaryName || 'Current',
                    type: 'bar',
                    data: z1,
                    itemStyle: getBarItemStyle(BRAND_ORANGE),
                    barMaxWidth: 40
                },
                {
                    name: secondaryName || 'Previous',
                    type: 'bar',
                    data: z2,
                    itemStyle: getBarItemStyle(SECONDARY_BLUE),
                    barMaxWidth: 40
                }
            ]
        };
        return (
            <div className="w-full h-full">
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Intensity Shift: Period Comparison</h5>
                <ReactECharts key={`zone-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    // Monthly View
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
    const allMonths = [...new Set([...data1.months, ...data2.months])].sort();
    const series = [];

    for (let z = 0; z < 6; z++) {
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
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                let html = `<div style="font-weight:bold; margin-bottom:8px; font-family: Inter, sans-serif;">${params[0].axisValue}</div>`;
                const athlete1Data = params.filter(p => p.seriesName.includes(primaryName || 'Athlete 1'));
                const athlete2Data = params.filter(p => p.seriesName.includes(secondaryName || 'Athlete 2'));

                if (athlete1Data.length > 0) {
                    html += `<div style="margin-top:8px; font-weight:600; font-size: 12px; margin-bottom: 4px; opacity: 0.9;">${primaryName || 'Athlete 1'}</div>`;
                    athlete1Data.forEach(p => {
                        const zoneName = p.seriesName.split(' - ')[1];
                        html += `
                            <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                    ${zoneName}
                                </span>
                                <span class="font-mono font-bold">${p.value.toFixed(1)}%</span>
                            </div>
                        `;
                    });
                }

                if (athlete2Data.length > 0) {
                    html += `<div style="margin-top:12px; font-weight:600; font-size: 12px; margin-bottom: 4px; opacity: 0.9;">${secondaryName || 'Athlete 2'}</div>`;
                    athlete2Data.forEach(p => {
                        const zoneName = p.seriesName.split(' - ')[1];
                        html += `
                            <div class="flex items-center justify-between gap-4" style="margin-bottom: 2px;">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; display: inline-block; width: 8px; height: 8px; border-radius: 50%;"></span>
                                    ${zoneName}
                                </span>
                                <span class="font-mono font-bold">${p.value.toFixed(1)}%</span>
                            </div>
                        `;
                    });
                }
                return html;
            }
        },
        legend: {
            ...getLegendStyle(isDark),
            top: 45,
            data: ['Zone 0', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
            formatter: (name) => name
        },
        grid: getGridStyle({ left: '8%', right: '8%', top: '25%', bottom: '15%' }),
        xAxis: getResponsiveXAxis(isDark, allMonths),
        yAxis: {
            type: 'value',
            name: '%',
            max: 100,
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine
        },
        series
    };

    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Zone Distribution Comparison</h5>
            <ReactECharts key={`zone-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>RMSSD: Period Overlay</h5>
                <ReactECharts key={`rm-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'rmssd');
    const data2 = aggregateByMonth(secondaryData, 'rmssd');
    const option = createMonthlyComparison('Monthly Average RMSSD', 'ms', data1, data2, primaryName, secondaryName, isDark);
    return (
        <div className="w-full h-full">
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average RMSSD</h5>
            <ReactECharts key={`rm-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
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
                <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>ACWR: Period Overlay</h5>
                <ReactECharts key={`acwr-p-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
            </div>
        );
    }

    const data1 = aggregateByMonth(primaryData, 'acwr');
    const data2 = aggregateByMonth(secondaryData, 'acwr');
    const option = createMonthlyComparison('Monthly Average ACWR', 'ratio', data1, data2, primaryName, secondaryName, isDark);

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
            <h5 className="text-xl font-semibold text-foreground mb-6 text-center" style={{ fontFamily: FONT_FAMILY }}>Monthly Average ACWR</h5>
            <ReactECharts key={`acwr-m-${isDark}`} option={option} notMerge={true} style={{ height: '500px' }} />
        </div>
    );
};

// --- Pairwise Comparison Components (Shared date sessions) ---

export const PairwiseGapChart = ({ data, metricKey, label, unit, primaryName, secondaryName }) => {
    const isDark = useChartTheme();
    if (!data || !data.length) return <div className="h-64 flex items-center justify-center text-muted-foreground uppercase text-xs font-bold tracking-widest">No matching dates for {label} comparison</div>;

    const dates = data.map(d => {
        const dt = new Date(d.date);
        if (isNaN(dt)) return d.date;
        return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(' ', '-');
    });
    const gaps = data.map(d => d[`${metricKey}_gap`]);
    const axisStyle = getAxisStyle(isDark);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            formatter: (params) => {
                const p = params[0];
                const raw = data[p.dataIndex];
                const valA = raw[`${metricKey}_a`];
                const valB = raw[`${metricKey}_b`];
                return `
                    <div style="font-weight:bold; margin-bottom:8px; font-family: Inter, sans-serif;">${p.axisValue}</div>
                    <div class="flex flex-col gap-1 text-xs">
                        <div class="flex justify-between gap-4"><span>${primaryName}:</span> <span class="font-bold">${valA?.toFixed(1) || 'N/A'} ${unit}</span></div>
                        <div class="flex justify-between gap-4"><span>${secondaryName}:</span> <span class="font-bold">${valB?.toFixed(1) || 'N/A'} ${unit}</span></div>
                        <div class="mt-2 pt-2 border-t border-border/20 flex justify-between gap-4">
                            <span>Gap (A-B):</span> 
                            <span class="font-bold ${p.value >= 0 ? 'text-emerald-500' : 'text-red-500'}">${p.value >= 0 ? '+' : ''}${p.value.toFixed(1)} ${unit}</span>
                        </div>
                    </div>
                `;
            }
        },
        grid: getGridStyle({ left: '8%', right: '8%', top: '15%', bottom: '20%' }),
        xAxis: getResponsiveXAxis(isDark, dates),
        yAxis: {
            type: 'value',
            name: `Δ ${unit}`,
            nameTextStyle: axisStyle.nameTextStyle,
            axisLabel: axisStyle.axisLabel,
            splitLine: axisStyle.splitLine,
            zero: true
        },
        series: [{
            name: `${label} Gap`,
            type: 'bar',
            data: gaps,
            itemStyle: {
                color: (params) => params.value >= 0 ? '#10b981' : '#ef4444',
                borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 30
        }]
    };

    return (
        <div className="w-full h-full">
            <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 text-center">{label} Gap: {primaryName} vs {secondaryName}</h5>
            <ReactECharts key={`gap-${metricKey}-${isDark}`} option={option} notMerge={true} style={{ height: '350px' }} />
        </div>
    );
};

export const PairwiseZoneComparison = ({ sessionA, sessionB, primaryName, secondaryName }) => {
    const isDark = useChartTheme();
    if (!sessionA || !sessionB) return null;

    const colors = ['#d1d5db', '#9ca3af', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];
    // Short labels for legend to prevent overlap on smaller screens
    const zoneLabelsShort = ['Z0', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
    // Full labels for tooltips
    const zoneNamesFull = ['Z0 · Recovery', 'Z1 · Easy', 'Z2 · Aerobic', 'Z3 · Threshold', 'Z4 · VO2', 'Z5 · Anaerobic'];
    const axisStyle = getAxisStyle(isDark);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const header = `<div style="font-weight:bold; margin-bottom:6px; font-family: Inter, sans-serif;">${params[0].axisValue}</div>`;
                const rows = params
                    .filter(p => p.value > 0)
                    .map(p => {
                        const idx = zoneLabelsShort.indexOf(p.seriesName);
                        const fullName = idx >= 0 ? zoneNamesFull[idx] : p.seriesName;
                        return `
                        <div style="display:flex; justify-content:space-between; gap:16px; font-size:12px;">
                            <span>${p.marker} ${fullName}</span>
                            <span style="font-weight:bold;">${p.value.toFixed(1)}%</span>
                        </div>`;
                    }).join('');
                return header + rows;
            }
        },
        legend: {
            ...getLegendStyle(isDark, { textStyle: { ...getLegendStyle(isDark).textStyle, fontSize: 11 } }),
            top: 0,
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 6,
        },
        grid: getGridStyle({ left: '12%', right: '8%', top: '20%', bottom: '10%' }),
        xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { ...axisStyle.axisLabel, formatter: '{value}%' },
            splitLine: axisStyle.splitLine
        },
        yAxis: {
            type: 'category',
            data: [secondaryName, primaryName],
            axisLabel: { ...axisStyle.axisLabel, fontWeight: 'bold' },
            axisLine: axisStyle.axisLine
        },
        series: [0, 1, 2, 3, 4, 5].map(z => ({
            name: zoneLabelsShort[z],
            type: 'bar',
            stack: 'total',
            data: [sessionB[`z${z}`], sessionA[`z${z}`]],
            itemStyle: { color: colors[z] },
            barMaxWidth: 50,
            label: {
                show: true,
                position: 'inside',
                // Only show label for segments >= 15% (tooltip shows exact value for all)
                formatter: (p) => p.value >= 15 ? `${p.value.toFixed(0)}%` : '',
                fontSize: 10,
                fontWeight: 'bold',
                color: '#ffffff',
                textShadowColor: 'rgba(0,0,0,0.35)',
                textShadowBlur: 2,
                // Prevent labels overflowing their segment boundary
                overflow: 'truncate',
            }
        }))
    };

    return (
        <div className="w-full h-full">
            <ReactECharts key={`pairwise-zones-${isDark}`} option={option} notMerge={true} style={{ height: '260px' }} />
        </div>
    );
};
