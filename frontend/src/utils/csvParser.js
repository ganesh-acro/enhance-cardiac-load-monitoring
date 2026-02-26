import Papa from 'papaparse';
import { parseISO, isWithinInterval, format } from 'date-fns';

/**
 * Parse session date from filename format: YYYYMMDD_HHMMSS
 * Example: 20251016_035641 -> 2025-10-16
 */
export function parseSessionDate(sessionString) {
    if (!sessionString) return null;
    const dateStr = sessionString.split('_')[0];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return parseISO(`${year}-${month}-${day}`);
}

/**
 * Load and parse CSV file
 * @param {string} csvText - Raw CSV content
 * @returns {Array} Parsed data rows
 */
export function parseCSV(csvText) {
    const result = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
    });

    // Add parsed date to each row
    return result.data.map(row => ({
        ...row,
        date: parseSessionDate(row.session)
    })).filter(row => row.date !== null);
}

/**
 * Filter data by date range
 * @param {Array} data - Parsed CSV data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered data
 */
export function filterByDateRange(data, startDate, endDate) {
    if (!startDate || !endDate) return data;

    return data.filter(row => {
        if (!row.date) return false;
        return isWithinInterval(row.date, { start: startDate, end: endDate });
    });
}

/**
 * Calculate summary statistics for a metric
 * @param {Array} data - Filtered data
 * @param {string} metricKey - Metric column name
 * @returns {Object} { avg, min, max, latest, trend }
 */
export function calculateMetricStats(data, metricKey) {
    if (!data || data.length === 0) {
        return { avg: 0, min: 0, max: 0, latest: 0, trend: 0 };
    }

    const values = data.map(row => row[metricKey]).filter(v => v != null && !isNaN(v));

    if (values.length === 0) {
        return { avg: 0, min: 0, max: 0, latest: 0, trend: 0 };
    }

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];

    // Simple trend: compare latest vs average
    const trend = latest > avg ? 'up' : latest < avg ? 'down' : 'stable';

    return {
        avg: parseFloat(avg.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        latest: parseFloat(latest.toFixed(2)),
        trend
    };
}

/**
 * Get athlete info summary
 * @param {Array} data - Filtered data
 * @param {Object} athleteMetadata - Athlete metadata (name, age, height, weight, sport, etc.)
 * @returns {Object} Athlete summary
 */
export function getAthleteSummary(data, athleteMetadata) {
    const defaultBio = {
        name: athleteMetadata?.name || 'N/A',
        age: athleteMetadata?.age || '25',
        height: athleteMetadata?.height || '185',
        weight: athleteMetadata?.weight || '78',
        sport: athleteMetadata?.sport || '400m',
        gender: athleteMetadata?.gender || 'M'
    };

    if (!data || data.length === 0) {
        return {
            ...defaultBio,
            sessionStart: null,
            sessionEnd: null,
            totalSessions: 0,
            trainingSessions: 0,
            readinessSessions: 0,
            avgHR: 0,
            avgRMSSD: 0
        };
    }

    const dates = data.map(row => row.date).filter(d => d);
    const sessionStart = dates.length > 0 ? dates[0] : null;
    const sessionEnd = dates.length > 0 ? dates[dates.length - 1] : null;

    const hrStats = calculateMetricStats(data, 'avg_hr');
    const rmssdStats = calculateMetricStats(data, 'rmssd');

    // Count session types
    let trainingSessions = 0;
    let readinessSessions = 0;

    data.forEach(row => {
        if (row.session_type) {
            if (row.session_type === 'Training') trainingSessions++;
            else if (row.session_type === 'Readiness') readinessSessions++;
            return;
        }

        if (!row.session) return;
        const timePart = row.session.split('_')[1];
        if (timePart) {
            const hour = parseInt(timePart.substring(0, 2));
            if (hour < 10) {
                readinessSessions++;
            } else {
                trainingSessions++;
            }
        }
    });

    return {
        ...defaultBio,
        sessionStart: sessionStart ? format(sessionStart, 'MMM dd, yyyy') : 'N/A',
        sessionEnd: sessionEnd ? format(sessionEnd, 'MMM dd, yyyy') : 'N/A',
        totalSessions: data.length,
        trainingSessions,
        readinessSessions,
        avgHR: hrStats.avg,
        avgRMSSD: rmssdStats.avg
    };
}

/**
 * Prepare chart data for a specific metric
 * @param {Array} data - Filtered data
 * @param {string} metricKey - Metric to visualize
 * @returns {Array} Chart-ready data
 */
export function prepareChartData(data, metricKey) {
    return data.map(row => ({
        date: row.date ? format(row.date, 'MMM dd') : 'N/A',
        fullDate: row.date,
        value: row[metricKey] || 0,
        session: row.session
    }));
}
