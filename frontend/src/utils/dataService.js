/**
 * dataService.js — All API calls to the FastAPI backend.
 * This replaces all direct CSV fetching and all JS data transformations.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiFetch = async (path) => {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
};

// ── Athletes registry ────────────────────────────────────────────────────────

/** Returns full athlete list [{id, name, age, height, weight, sport, img, file}] */
export const fetchAthletes = () => apiFetch('/athletes');

// ── Dashboard page ───────────────────────────────────────────────────────────

/**
 * Team overview for AnalyticsOverview (no athlete selected).
 * Returns [{id, name, img, acwr, avg_hr, rest_hr, rmssd, zones}]
 */
export const fetchDashboardOverview = () => apiFetch('/dashboard/overview');

/**
 * Full chart data for a single athlete (all tabs).
 * Returns { athlete, summary, athleteSummary, charts }
 */
export const fetchAthleteData = async (athlete, startDate = null, endDate = null) => {
    if (!athlete || !athlete.id) return null;
    let path = `/dashboard/${athlete.id}`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) path += `?${params.join('&')}`;
    return apiFetch(path);
};

/**
 * Comparison tab — secondary athlete or period.
 * Returns { athlete, athleteSummary, charts }
 */
export const fetchComparison = async (athleteId, { targetId, startDate, endDate, secondaryStart, secondaryEnd } = {}) => {
    const params = [];
    if (targetId) params.push(`target_id=${targetId}`);
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (secondaryStart) params.push(`secondary_start=${secondaryStart}`);
    if (secondaryEnd) params.push(`secondary_end=${secondaryEnd}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return apiFetch(`/dashboard/${athleteId}/comparison${qs}`);
};

// ── Group dashboard ──────────────────────────────────────────────────────────

/** All athletes' latest metrics for Group Dashboard. */
export const fetchGroupSummary = () => apiFetch('/group/summary');

// ── Profiles page ────────────────────────────────────────────────────────────

/** Latest snapshot per athlete for the Profiles listing. */
export const fetchTeamSummary = () => apiFetch('/profiles/summary');

// ── Reports page ─────────────────────────────────────────────────────────────

/** Summary table for Reports page. */
export const fetchReportsSummary = () => apiFetch('/reports/summary');

/** Full session list for a single athlete (for PDF generation). */
export const fetchReportDetail = (athleteId) => apiFetch(`/reports/${athleteId}`);
