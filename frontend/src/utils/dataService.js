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

// ── Refresh token interceptor ───────────────────────────────────────────────

let refreshPromise = null;

async function tryRefresh() {
    const refreshToken = localStorage.getItem("enhance_refresh_token");
    if (!refreshToken) return false;

    // Deduplicate: if a refresh is already in flight, await the same promise
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!res.ok) return false;
            const data = await res.json();
            localStorage.setItem("enhance_token", data.access_token);
            localStorage.setItem("enhance_refresh_token", data.refresh_token);
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

function hardLogout() {
    localStorage.removeItem("enhance_token");
    localStorage.removeItem("enhance_refresh_token");
    localStorage.removeItem("enhance_user");
    window.location.href = "/login";
}

const apiFetch = async (path) => {
    let res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
    if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
        }
        if (res.status === 401) { hardLogout(); return; }
    }
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
};

const apiMutate = async (path, method, body) => {
    const opts = {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    };
    let res = await fetch(`${API_URL}${path}`, opts);
    if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            res = await fetch(`${API_URL}${path}`, { ...opts, headers: authHeaders() });
        }
        if (res.status === 401) { hardLogout(); return; }
    }
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

/** Create a new user (admin only). */
export const createUser = (data) => apiMutate('/auth/users', 'POST', data);

/** Update a user's role or active status (admin only). */
export const updateUser = (userId, data) => apiMutate(`/auth/users/${userId}`, 'PATCH', data);

/** Delete a user (admin only). */
export const deleteUser = (userId) => apiMutate(`/auth/users/${userId}`, 'DELETE');

/** Reset a user's password (admin only). */
export const resetUserPassword = (userId, newPassword) =>
    apiMutate(`/auth/users/${userId}/password`, 'PATCH', { new_password: newPassword });

/** Get assigned athlete IDs for a user (admin only). */
export const getAssignedAthletes = (userId) => apiFetch(`/auth/users/${userId}/athletes`);

/** Set assigned athletes for a user (admin only). */
export const setAssignedAthletes = (userId, athleteIds) =>
    apiMutate(`/auth/users/${userId}/athletes`, 'PUT', { athlete_ids: athleteIds });
