import { useState, useEffect, useCallback } from 'react';

/**
 * Per-chart user preferences persisted to localStorage.
 *
 * Usage:
 *   const [prefs, setPrefs] = useChartPrefs('trainingLoadTrend', {
 *     chartType: 'bar',
 *     showIntensity: true,
 *     showThresholds: false,
 *   });
 *
 *   setPrefs({ chartType: 'line' })              // partial update, merged with existing
 *   setPrefs(p => ({ ...p, showIntensity: false })) // functional update
 *
 * Key is namespaced under "chartPrefs:{id}" so chart IDs don't clash with
 * other localStorage keys.
 */
export function useChartPrefs(chartId, defaults = {}) {
    const storageKey = `chartPrefs:${chartId}`;

    const [prefs, setPrefs] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return defaults;
            const parsed = JSON.parse(raw);
            return { ...defaults, ...parsed };
        } catch {
            return defaults;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(prefs));
        } catch {
            /* quota / private mode — ignore */
        }
    }, [storageKey, prefs]);

    const update = useCallback((patch) => {
        setPrefs(prev => {
            const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
            return next;
        });
    }, []);

    const reset = useCallback(() => setPrefs(defaults), [defaults]);

    return [prefs, update, reset];
}
