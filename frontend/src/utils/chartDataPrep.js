import { format, startOfWeek, endOfWeek } from 'date-fns';

// 15. Weekly Aggregated Stats for Zone Distribution
export function prepareWeeklyStats(data) {
    if (!data || data.length === 0) return [];

    const weeklyMap = new Map();

    data.forEach(row => {
        if (!row.date) return;
        const dateObj = row.date instanceof Date ? row.date : new Date(row.date);
        if (isNaN(dateObj)) return;

        // Use start of week as key
        const start = startOfWeek(dateObj, { weekStartsOn: 1 });
        const end = endOfWeek(dateObj, { weekStartsOn: 1 });
        const weekKey = format(start, 'yyyy-MM-dd');
        const weekLabel = `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;

        if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, {
                weekKey,
                weekLabel,
                startDate: start,
                endDate: end,
                count: 0,
                z0: 0, z1: 0, z2: 0, z3: 0, z4: 0, z5: 0
            });
        }

        const entry = weeklyMap.get(weekKey);
        entry.count++;
        entry.z0 += (parseFloat(row.zone_0_d) || 0);
        entry.z1 += (parseFloat(row.zone_1_d) || 0);
        entry.z2 += (parseFloat(row.zone_2_d) || 0);
        entry.z3 += (parseFloat(row.zone_3_d) || 0);
        entry.z4 += (parseFloat(row.zone_4_d) || 0);
        entry.z5 += (parseFloat(row.zone_5_d) || 0);
    });

    const result = Array.from(weeklyMap.values()).map(item => {
        const msToMin = (ms) => Math.round(ms / 60000);
        return {
            date: item.weekLabel,
            rawDate: item.weekKey,
            sessionCount: item.count,
            zones: {
                z0: msToMin(item.z0),
                z1: msToMin(item.z1),
                z2: msToMin(item.z2),
                z3: msToMin(item.z3),
                z4: msToMin(item.z4),
                z5: msToMin(item.z5)
            }
        };
    });

    result.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
    return result;
}

// 1. Heart Rate (Avg, Min, Max)
export function prepareHeartRateData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        avg_hr: parseFloat(row.avg_hr) || 0,
        min_hr: parseFloat(row.min_hr) || 0,
        max_hr: parseFloat(row.max_hr) || 0
    }));
}

// 2. Training (Load vs Intensity)
export function prepareTrainingData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        training_load: parseFloat(row.training_load) || 0,
        training_intensity: parseFloat(row.training_intensity) || 0
    }));
}

// 3. HRV (SDNN, RMSSD, pNN50)
export function prepareHRVData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        sdnn: parseFloat(row.sdnn) || 0,
        rmssd: parseFloat(row.rmssd) || 0,
        pnn50: parseFloat(row.pnn50) || 0
    }));
}

// 4. Oxygen Debt (EPOC Total vs Peak)
export function prepareOxygenDebtData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        epoc_total: parseFloat(row.epoc_total) || 0,
        epoc_peak: parseFloat(row.epoc_peak) || 0
    }));
}

// 5. Energy Expenditure
export function prepareEnergyData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        ee_men: parseFloat(row.ee_men) || 0
    }));
}

// 6. Movement (Load vs Intensity)
export function prepareMovementData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        movement_load: parseFloat(row.movement_load) || 0,
        movement_load_intensity: parseFloat(row.movement_load_intensity) || 0
    }));
}

// 7. Oxygen Consumption (VO2 vs VO2 Max)
export function prepareOxygenConsumptionData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        vo2: parseFloat(row.vo2) || 0,
        vo2_max: parseFloat(row.vo2_max) || 0
    }));
}

// 8. Zone Distribution (Percentages)
export function prepareZoneDistData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        zone_0_pct: parseFloat(row.zone_0_pct) || 0,
        zone_1_pct: parseFloat(row.zone_1_pct) || 0,
        zone_2_pct: parseFloat(row.zone_2_pct) || 0,
        zone_3_pct: parseFloat(row.zone_3_pct) || 0,
        zone_4_pct: parseFloat(row.zone_4_pct) || 0,
        zone_5_pct: parseFloat(row.zone_5_pct) || 0
    }));
}

// 9. Recovery (Recovery Beats)
export function prepareRecoveryData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        recovery_beats: parseFloat(row.recovery_beats) || 0
    }));
}

// 10. ACWR (Acute, Chronic, Ratio)
export function prepareACWRData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        fullDate: row.date,
        acute_load: parseFloat(row.acute_load) || 0,
        chronic_load: parseFloat(row.chronic_load) || 0,
        acwr: parseFloat(row.acwr) || 0
    }));
}

// 12. Training Trends (Combined)
export function prepareTrainingTrendsData(data) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : (row.session || 'N/A'),
        load: parseFloat(row.training_load) || 0,
        acwr: parseFloat(row.acwr) || 0,
        monotony: parseFloat(row.training_intensity) * 1.5, // Derived proxy
        strain: parseFloat(row.training_load) * 1.2 // Derived proxy
    }));
}

// 13. Summary Data for Overview Tab
export function prepareSummaryData(data) {
    if (!data.length) return null;

    const latest = data[data.length - 1];
    const acwrValue = parseFloat(latest.acwr) || 0;
    const hr = parseFloat(latest.avg_hr) || 0;
    const rmssd = parseFloat(latest.rmssd) || 0;
    const sdnn = parseFloat(latest.sdnn) || 0;

    // Latest Flag Logic: Red if ACWR > 1, Yellow if ACWR < 1
    const redFlags = acwrValue > 1.0 ? 1 : 0;
    const yellowFlags = (acwrValue < 1.0 && acwrValue > 0) ? 1 : 0;

    // Calculate dynamic readiness score (1-100)
    const targetRmssd = 60;
    const targetSdnn = 140;
    const rmssdScore = Math.min(100, (rmssd / targetRmssd) * 100);
    const sdnnScore = Math.min(100, (sdnn / targetSdnn) * 100);
    const hrvScore = (rmssdScore * 0.4) + (sdnnScore * 0.3);

    const loadBalance = Math.max(0, 100 - Math.abs(1.0 - acwrValue) * 100);
    const readinessScore = Math.round((hrvScore * 0.7) + (loadBalance * 0.3));

    return {
        redFlags,
        yellowFlags,
        latestWellness: readinessScore,
        avgRPE: 7,
        loadStatus: acwrValue > 1.15 ? 'High' : acwrValue < 0.85 ? 'Low' : 'Optimal',
        acwr: acwrValue.toFixed(2),
        latestHR: hr,
        latestRMSSD: rmssd,
        latestDate: latest.date
    };
}

// 14. Monthly Aggregated Stats (Load, HRV, Zones, HR, ACWR, Movement)
export function prepareMonthlyStats(data) {
    if (!data || data.length === 0) return [];

    const monthlyMap = new Map();

    data.forEach(row => {
        if (!row.date) return;
        const dateObj = row.date instanceof Date ? row.date : new Date(row.date);
        if (isNaN(dateObj)) return;

        const monthKey = format(dateObj, 'yyyy-MM');
        const monthLabel = format(dateObj, 'MMM yyyy');

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
                monthKey,
                monthLabel,
                count: 0,

                // Metrics
                totalLoad: 0,
                hrvSum: 0, hrvCount: 0,

                // Zones (Duration in ms)
                z0: 0, z1: 0, z2: 0, z3: 0, z4: 0, z5: 0,

                // HR
                minHrSum: 0, maxHrSum: 0, avgHrSum: 0,

                // ACWR
                acwrSum: 0,

                // Movement
                movLoad: 0, movIntSum: 0,

                timestamp: dateObj.getTime()
            });
        }

        const entry = monthlyMap.get(monthKey);
        entry.count++;

        // 1. Load & HRV
        entry.totalLoad += (parseFloat(row.training_load) || 0);

        const hrv = parseFloat(row.rmssd);
        if (!isNaN(hrv) && hrv > 0) {
            entry.hrvSum += hrv;
            entry.hrvCount++;
        }

        // 2. Zones (Summing durations)
        entry.z0 += (parseFloat(row.zone_0_d) || 0);
        entry.z1 += (parseFloat(row.zone_1_d) || 0);
        entry.z2 += (parseFloat(row.zone_2_d) || 0);
        entry.z3 += (parseFloat(row.zone_3_d) || 0);
        entry.z4 += (parseFloat(row.zone_4_d) || 0);
        entry.z5 += (parseFloat(row.zone_5_d) || 0);

        // 3. HR (Averaging daily min/max/avg)
        entry.minHrSum += (parseFloat(row.min_hr) || 0);
        entry.maxHrSum += (parseFloat(row.max_hr) || 0);
        entry.avgHrSum += (parseFloat(row.avg_hr) || 0);

        // 4. ACWR
        entry.acwrSum += (parseFloat(row.acwr) || 0);

        // 5. Movement
        entry.movLoad += (parseFloat(row.movement_load) || 0);
        entry.movIntSum += (parseFloat(row.movement_load_intensity) || 0);
    });

    const result = Array.from(monthlyMap.values()).map(item => {
        const c = item.count || 1;
        // Convert zone ms to minutes
        const msToMin = (ms) => Math.round(ms / 60000);

        return {
            date: item.monthLabel,
            rawDate: item.monthKey,
            sessionCount: item.count, // Added for tooltip

            // Charts Data
            load: Math.round(item.totalLoad),
            hrv: item.hrvCount > 0 ? parseFloat((item.hrvSum / item.hrvCount).toFixed(1)) : 0,

            zones: {
                z0: msToMin(item.z0),
                z1: msToMin(item.z1),
                z2: msToMin(item.z2),
                z3: msToMin(item.z3),
                z4: msToMin(item.z4),
                z5: msToMin(item.z5)
            },

            hr: {
                min: parseFloat((item.minHrSum / c).toFixed(1)),
                max: parseFloat((item.maxHrSum / c).toFixed(1)),
                avg: parseFloat((item.avgHrSum / c).toFixed(1))
            },

            acwr: parseFloat((item.acwrSum / c).toFixed(2)),

            movement: {
                load: Math.round(item.movLoad),
                intensity: parseFloat((item.movIntSum / c).toFixed(1))
            }
        };
    });

    // Sort by month
    result.sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    return result;
}
