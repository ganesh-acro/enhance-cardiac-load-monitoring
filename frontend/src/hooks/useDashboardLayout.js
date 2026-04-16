import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/auth-context';

/**
 * Per-user, per-tab custom dashboard layout persisted to localStorage.
 *
 * Stores ONLY user-added charts. Default charts stay rendered by the tab
 * itself; this hook is additive. That avoids having to migrate every
 * existing hard-coded chart into the registry in v1.
 *
 * Widget shape (multi-series):
 *   { id, title, series: [ { metric, chartType }, ... ] }
 *
 * Storage envelope (versioned so future schema changes don't brick users):
 *   { version: 1, items: [ widget, ... ] }
 *
 * Key format:  dashboardLayout:v1:{userKey}:{tabId}
 *
 * userKey is the authenticated email. Falls back to "anonymous" so local
 * dev still works when auth isn't ready.
 *
 * Returns:
 *   items        widget array
 *   addItem      ({ title, series }) -> void — appends a new widget
 *   removeItem   (id) -> void
 *   updateItem   (id, patch) -> void — merges patch into the matching widget
 *   resetItems   () -> void — clears all user-added widgets on this tab
 */

const SCHEMA_VERSION = 1;

function storageKey(userKey, tabId) {
    return `dashboardLayout:v${SCHEMA_VERSION}:${userKey}:${tabId}`;
}

/**
 * Normalise a stored widget into the current multi-series shape.
 * Older single-metric widgets `{ id, metric, chartType, title }` written by
 * the v1-initial release get lifted into `{ id, title, series: [...] }`.
 * Invalid records are dropped.
 */
function migrateItem(raw) {
    if (!raw || typeof raw !== 'object' || !raw.id) return null;

    // Already new shape
    if (Array.isArray(raw.series) && raw.series.length > 0) {
        return {
            id: raw.id,
            title: raw.title || '',
            series: raw.series
                .filter(s => s && s.metric && s.chartType)
                .map(s => ({ metric: s.metric, chartType: s.chartType })),
        };
    }

    // Legacy single-series shape
    if (raw.metric && raw.chartType) {
        return {
            id: raw.id,
            title: raw.title || '',
            series: [{ metric: raw.metric, chartType: raw.chartType }],
        };
    }

    return null;
}

function readFromStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.items)) {
            return [];
        }
        return parsed.items.map(migrateItem).filter(Boolean);
    } catch {
        return [];
    }
}

function writeToStorage(key, items) {
    try {
        localStorage.setItem(key, JSON.stringify({ version: SCHEMA_VERSION, items }));
    } catch {
        /* quota / private mode — ignore */
    }
}

function makeId() {
    return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useDashboardLayout(tabId) {
    const { user } = useAuth();
    const userKey = user?.email || 'anonymous';
    const key = useMemo(() => storageKey(userKey, tabId), [userKey, tabId]);

    const [items, setItems] = useState(() => readFromStorage(key));

    // If the user logs in/out or the tab changes, reload from the
    // appropriate storage bucket.
    useEffect(() => {
        setItems(readFromStorage(key));
    }, [key]);

    useEffect(() => {
        writeToStorage(key, items);
    }, [key, items]);

    const addItem = useCallback(({ title, series }) => {
        if (!Array.isArray(series) || series.length === 0) return;
        setItems(prev => [
            ...prev,
            {
                id: makeId(),
                title: title || '',
                series: series.map(s => ({ metric: s.metric, chartType: s.chartType })),
            },
        ]);
    }, []);

    const removeItem = useCallback((id) => {
        setItems(prev => prev.filter(w => w.id !== id));
    }, []);

    const updateItem = useCallback((id, patch) => {
        setItems(prev => prev.map(w => {
            if (w.id !== id) return w;
            const next = { ...w, ...patch };
            if (patch.series) {
                next.series = patch.series.map(s => ({ metric: s.metric, chartType: s.chartType }));
            }
            return next;
        }));
    }, []);

    const resetItems = useCallback(() => {
        setItems([]);
    }, []);

    return { items, addItem, removeItem, updateItem, resetItems };
}
