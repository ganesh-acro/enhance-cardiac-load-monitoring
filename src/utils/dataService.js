import { parseCSV } from './csvParser';
import { athletes } from '../data/dashboardData';
import { format } from 'date-fns';

const DATA_FOLDER = '/sample%20data';

/**
 * Encodes filename for URL usage
 */
const getEncodedUrl = (filename) => `${DATA_FOLDER}/${encodeURIComponent(filename)}`;

/**
 * Fetches and parses a single athlete's CSV data
 */
export const fetchAthleteData = async (athlete) => {
    if (!athlete || !athlete.file) return [];
    try {
        const url = `${getEncodedUrl(athlete.file)}?t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch ${athlete.file}: ${res.statusText}`);
        const csvText = await res.text();
        return parseCSV(csvText);
    } catch (err) {
        console.error(`Error loading data for ${athlete.name}:`, err);
        return [];
    }
};

/**
 * Fetches latest metrics for the entire team overview
 */
export const fetchTeamSummary = async () => {
    const summaryPromises = athletes.map(async (athlete) => {
        const data = await fetchAthleteData(athlete);
        if (data && data.length > 0) {
            const latest = data[data.length - 1];
            return {
                id: athlete.id,
                name: athlete.name,
                sessionDate: latest.date ? format(latest.date, 'MMM dd, yyyy') : 'N/A',
                trainingLoad: parseFloat(latest.training_load) || 0,
                weeklyLoad: parseFloat(latest.acute_load) || 0,
                acwr: parseFloat(latest.acwr) || 0,
                readiness: 85,
                avgHR: parseFloat(latest.avg_hr) || 0,
                restHR: parseFloat(latest.rest_hr) || 0,
                rmssd: parseFloat(latest.rmssd) || 0,
                zones: {
                    z0: parseFloat(latest.zone_0_pct) || 0,
                    z1: parseFloat(latest.zone_1_pct) || 0,
                    z2: parseFloat(latest.zone_2_pct) || 0,
                    z3: parseFloat(latest.zone_3_pct) || 0,
                    z4: parseFloat(latest.zone_4_pct) || 0,
                    z5: parseFloat(latest.zone_5_pct) || 0,
                }
            };
        }
        return null;
    });

    const results = await Promise.all(summaryPromises);
    return results.filter(athlete => athlete !== null);
};

/**
 * Helper to find an athlete in the registry by ID
 */
export const getAthleteById = (id) => athletes.find(a => a.id === id);
