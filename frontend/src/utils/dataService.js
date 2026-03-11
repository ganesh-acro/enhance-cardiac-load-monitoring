/**
 * dataService.js — All API calls to the FastAPI backend.
 * This replaces all direct CSV fetching and all JS data transformations.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

const authHeaders = () => {
    const token = localStorage.getItem("enhance_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
};

const handleAuth401 = (res) => {
    if (res.status === 401) {
        localStorage.removeItem("enhance_token");
        localStorage.removeItem("enhance_user");
        window.location.href = "/login";
        return true;
    }
    return false;
};

const apiFetch = async (path) => {
    const res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
    if (handleAuth401(res)) return;
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
};

const apiMutate = async (path, method, body) => {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });
    if (handleAuth401(res)) return;
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `API error ${res.status}`);
    }
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

// ── Admin — User management ─────────────────────────────────────────────────

/** List all users (admin only). */
export const fetchUsers = () => apiFetch('/auth/users');

/** Update a user's role or active status (admin only). */
export const updateUser = (userId, data) => apiMutate(`/auth/users/${userId}`, 'PATCH', data);

/** Delete a user (admin only). */
export const deleteUser = (userId) => apiMutate(`/auth/users/${userId}`, 'DELETE');

/** Get assigned athlete IDs for a user (admin only). */
export const getAssignedAthletes = (userId) => apiFetch(`/auth/users/${userId}/athletes`);

/** Set assigned athletes for a user (admin only). */
export const setAssignedAthletes = (userId, athleteIds) =>
    apiMutate(`/auth/users/${userId}/athletes`, 'PUT', { athlete_ids: athleteIds });
