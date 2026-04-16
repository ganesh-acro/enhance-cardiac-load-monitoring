import { useMemo, useState, useEffect } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { useTheme } from '../theme-provider';
import {
    FONT_FAMILY,
    getAxisStyle,
    getGridStyle,
    getResponsiveXAxis,
    getTooltipStyle,
} from '../../utils/chartStyles';
import { ZoomableChart, getCommonOptions } from './FeatureCharts';
import { getMetric, getMetricRows } from '../../utils/metricRegistry';
import { getChartType } from '../../utils/chartRegistry';

/**
 * Generic, registry-driven chart used for user-added widgets.
 *
 * Widget shape:  { id, title, series: [{ metric, chartType }, ...] }
 *
 * Behaviour:
 *   - Multi-series: renders one ECharts series per entry in `widget.series`.
 *   - X axis: union of dates across all series, sorted by ISO `fullDate` so
 *     chronology is correct regardless of the display `date` field.
 *   - Missing points: each series gets `null` where its source doesn't have
 *     a row for that date (ECharts renders these as gaps).
 *   - Default styling, zoom slider, scroll-zoom toggle, toolbox (reset /
 *     save) and last-2-months pre-zoom are inherited from the same
 *     `getCommonOptions` + `ZoomableChart` used by the built-in charts.
 *   - Unknown-metric and empty-data states are handled without crashing.
 *
 * Props:
 *   widget     { id, title, series }
 *   data       primaryChartData (looked up by each metric.dataKey)
 *   onDelete   optional — shows trash icon on hover
 *   onEdit     optional — shows pencil icon on hover
 */
export function CustomChart({ widget, data, onDelete, onEdit }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const isDark = mounted && resolvedTheme === 'dark';

    // Resolve each series against the registry. Silently drop any entries
    // whose metric id is no longer registered — the card can still render
    // as long as at least one series survives.
    const resolvedSeries = useMemo(() => (
        (widget.series || [])
            .map(s => {
                const metric = getMetric(s.metric);
                if (!metric) return null;
                return { metric, chartType: getChartType(s.chartType) };
            })
            .filter(Boolean)
    ), [widget.series]);

    // Gather rows per series and build a common X axis (union, ordered by ISO
    // date if available, otherwise by display string).
    const { xLabels, axisData, seriesValues, hasAnyData } = useMemo(() => {
        if (!resolvedSeries.length) {
            return { xLabels: [], axisData: [], seriesValues: [], hasAnyData: false };
        }

        const unionMap = new Map(); // iso -> label
        const seriesRows = resolvedSeries.map(({ metric }) => {
            const rows = getMetricRows(metric, data);
            rows.forEach(r => {
                const iso = r.fullDate || r[metric.xField];
                const label = r[metric.xField] ?? iso;
                if (iso && !unionMap.has(iso)) unionMap.set(iso, label);
            });
            return { metric, rows };
        });

        const ordered = [...unionMap.entries()].sort(([a], [b]) => {
            // ISO (YYYY-MM-DD) sorts lexicographically.
            return a < b ? -1 : a > b ? 1 : 0;
        });
        const axis = ordered.map(([iso]) => iso);
        const labels = ordered.map(([, label]) => label);

        const values = seriesRows.map(({ metric, rows }) => {
            const byIso = new Map();
            rows.forEach(r => {
                const iso = r.fullDate || r[metric.xField];
                const v = r[metric.yField];
                byIso.set(iso, v === null || v === undefined ? null : v);
            });
            return axis.map(iso => (byIso.has(iso) ? byIso.get(iso) : null));
        });

        return {
            xLabels: labels,
            axisData: axis,
            seriesValues: values,
            hasAnyData: values.some(arr => arr.some(v => v !== null && v !== undefined)),
        };
    }, [resolvedSeries, data]);

    const title = widget.title?.trim() || resolvedSeries.map(s => s.metric.label).join(' · ') || 'Custom chart';
    const subtitle = resolvedSeries.map(s => s.metric.label).join(' · ');

    // Empty states ---------------------------------------------------------
    if (!widget.series || widget.series.length === 0) {
        return (
            <WidgetShell title="Empty widget" onDelete={onDelete} onEdit={onEdit}>
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    This widget has no series. Edit it to pick metrics.
                </div>
            </WidgetShell>
        );
    }
    if (!resolvedSeries.length) {
        return (
            <WidgetShell title="Unknown metrics" onDelete={onDelete} onEdit={onEdit}>
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    None of this widget's metrics are available. Edit or delete it.
                </div>
            </WidgetShell>
        );
    }
    if (!hasAnyData) {
        return (
            <WidgetShell title={title} subtitle={subtitle} onDelete={onDelete} onEdit={onEdit}>
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    No data found for the selected metrics in this period.
                </div>
            </WidgetShell>
        );
    }

    // Build ECharts option -------------------------------------------------
    // Memoised so parent re-renders (hover, unrelated state) don't force
    // ECharts to do a full setOption cycle when nothing has actually changed.
    const option = useMemo(() => {
        const axisStyle = getAxisStyle(isDark);

        // Palette: rotate through distinct colours when metric doesn't
        // define one, so a line over a bar doesn't vanish into the same hue.
        const FALLBACK_PALETTE = ['#0d7377', '#1f77b4', '#f59e0b', '#f43f5e', '#22c55e', '#a855f7'];
        const colourFor = (m, idx) => m.color || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];

        // Each series built via its chart-type renderer, then we drop
        // `connectNulls: false` so null gaps survive.
        const echartsSeries = resolvedSeries.map(({ metric, chartType }, i) => {
            const built = chartType.buildSeries(metric, seriesValues[i], {
                isDark,
                color: colourFor(metric, i),
            })[0];
            return { ...built, connectNulls: false };
        });

        const units = new Set(resolvedSeries.map(r => r.metric.unit).filter(Boolean));
        const commonUnit = units.size === 1 ? [...units][0] : '';
        const hasBar = echartsSeries.some(s => s.type === 'bar');

        return {
            ...getCommonOptions('', isDark, axisData),
            tooltip: {
                ...getTooltipStyle(isDark),
                trigger: 'axis',
                valueFormatter: (v) => {
                    if (v === null || v === undefined || v === '') return '–';
                    return commonUnit ? `${v} ${commonUnit}` : String(v);
                },
            },
            grid: getGridStyle({ top: 30, bottom: 70, left: 50, right: 20 }),
            xAxis: getResponsiveXAxis(isDark, xLabels, { boundaryGap: hasBar }),
            yAxis: {
                type: 'value',
                name: commonUnit,
                nameTextStyle: axisStyle.nameTextStyle,
                axisLabel: axisStyle.axisLabel,
                splitLine: axisStyle.splitLine,
                splitNumber: 5,
            },
            series: echartsSeries,
        };
    }, [resolvedSeries, seriesValues, xLabels, axisData, isDark]);

    return (
        <WidgetShell title={title} subtitle={subtitle !== title ? subtitle : null} onDelete={onDelete} onEdit={onEdit}>
            {/*
             * notMerge + lazyUpdate fix two edit-mode bugs:
             *   - Without notMerge, new series merge on top of stale ones and
             *     the toolbox "Reset" reverts to that merged snapshot instead
             *     of the user's current configuration.
             *   - lazyUpdate defers setOption to the next animation frame so
             *     React can finish committing before ECharts rebuilds.
             */}
            <ZoomableChart
                option={option}
                style={{ height: '400px', width: '100%' }}
                notMerge
                lazyUpdate
            />
        </WidgetShell>
    );
}

/**
 * Card shell shared by CustomChart and its loading/empty states. Keeps
 * the edit/delete affordances consistent for every user-added widget.
 */
function WidgetShell({ title, subtitle, onDelete, onEdit, children }) {
    return (
        <div className="group p-6 rounded-xl border border-border bg-card shadow-sm min-h-[450px] relative">
            <div className="flex items-start justify-between mb-4">
                <div className="min-w-0">
                    <h5
                        className="text-2xl font-normal text-foreground dark:text-white truncate"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        {title}
                    </h5>
                    {subtitle && subtitle !== title && (
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 mt-1 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-md text-muted-foreground/70 hover:text-brand-500 hover:bg-muted/50 transition-colors"
                            title="Edit widget"
                            aria-label="Edit widget"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-md text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete widget"
                            aria-label="Delete widget"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}
