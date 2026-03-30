/**
 * dataService.js — All API calls to the FastAPI backend (Auth0 only).
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ── Auth0 token getter (set by auth-context) ────────────────────────────────

let _auth0TokenGetter = null;

export function setAuth0TokenGetter(getter) {
    _auth0TokenGetter = getter;
}

const authHeaders = async () => {
    const headers = { "Content-Type": "application/json" };

    if (_auth0TokenGetter) {
        try {
            const token = await _auth0TokenGetter();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        } catch {
            // Token acquisition failed
        }
    }

    return headers;
};

// ── Core fetch helpers ──────────────────────────────────────────────────────

const apiFetch = async (path) => {
    const headers = await authHeaders();
    const res = await fetch(`${API_URL}${path}`, { headers });
    if (res.status === 401) {
        window.location.href = "/login";
        return;
    }
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
};

const apiMutate = async (path, method, body) => {
    const headers = await authHeaders();
    const opts = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };
    const res = await fetch(`${API_URL}${path}`, opts);
    if (res.status === 401) {
        window.location.href = "/login";
        return;
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
};

// ── Athletes registry ────────────────────────────────────────────────────────

export const fetchAthletes = () => apiFetch('/athletes');

// ── Dashboard page ───────────────────────────────────────────────────────────

export const fetchDashboardOverview = () => apiFetch('/dashboard/overview');

export const fetchAthleteData = async (athlete, startDate = null, endDate = null) => {
    if (!athlete || !athlete.id) return null;
    let path = `/dashboard/${athlete.id}`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) path += `?${params.join('&')}`;
    return apiFetch(path);
};

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

export const fetchGroupSummary = () => apiFetch('/group/summary');

// ── Profiles page ────────────────────────────────────────────────────────────

export const fetchTeamSummary = () => apiFetch('/profiles/summary');

// ── Reports page ─────────────────────────────────────────────────────────────

export const fetchReportsSummary = () => apiFetch('/reports/summary');

export const fetchReportDetail = (athleteId) => apiFetch(`/reports/${athleteId}`);

// ── User profile ────────────────────────────────────────────────────────────

export const fetchMyProfile = () => apiFetch('/auth/me');

export const fetchMyLoginHistory = () => apiFetch('/auth/me/login-history');

export const clearMyLoginHistory = () => apiMutate('/auth/me/login-history', 'DELETE');

export const changeMyPassword = (newPassword) =>
    apiMutate('/auth/me/password', 'PATCH', { new_password: newPassword });

// ── Admin — User management ─────────────────────────────────────────────────

export const fetchUsers = () => apiFetch('/auth/users');

export const createUser = (data) => apiMutate('/auth/users', 'POST', data);

export const updateUser = (userId, data) => apiMutate(`/auth/users/${userId}`, 'PATCH', data);

export const deleteUser = (userId) => apiMutate(`/auth/users/${userId}`, 'DELETE');

export const resetUserPassword = (userId, newPassword) =>
    apiMutate(`/auth/users/${userId}/password`, 'PATCH', { new_password: newPassword });

export const getAssignedAthletes = (userId) => apiFetch(`/auth/users/${userId}/athletes`);

export const setAssignedAthletes = (userId, athleteIds) =>
    apiMutate(`/auth/users/${userId}/athletes`, 'PUT', { athlete_ids: athleteIds });
