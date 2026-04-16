import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { getMetricsForTab, getMetric } from '../../utils/metricRegistry';
import { getCompatibleChartTypes } from '../../utils/chartRegistry';

/**
 * Modal used to create or edit a custom multi-series widget.
 *
 * A widget is a list of "series", each of which picks one metric and one
 * chart type. At least one series is required to save.
 *
 * Props:
 *   open       boolean
 *   onClose    () => void
 *   onSubmit   ({ title, series: [{metric, chartType}] }) => void
 *   tab        string — which tab's metrics to show (e.g. "training")
 *   initial    { title, series } — for edit mode, pre-fills the editor
 *
 * Rendered via portal so it escapes any parent stacking context.
 */
export function AddChartModal({ open, onClose, onSubmit, tab, initial }) {
    const metrics = useMemo(() => getMetricsForTab(tab), [tab]);

    // Default: one empty series row when adding, or the editing widget's series.
    const [title, setTitle] = useState('');
    const [series, setSeries] = useState([{ metric: '', chartType: '' }]);

    // Re-seed state every time the modal is opened (for edit vs add flows).
    useEffect(() => {
        if (!open) return;
        setTitle(initial?.title || '');
        if (initial?.series?.length) {
            setSeries(initial.series.map(s => ({ metric: s.metric, chartType: s.chartType })));
        } else {
            setSeries([{ metric: '', chartType: '' }]);
        }
    }, [open, initial]);

    // Lock body scroll while open.
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const updateRow = (idx, patch) => {
        setSeries(prev => prev.map((row, i) => {
            if (i !== idx) return row;
            const next = { ...row, ...patch };

            // When the metric changes, reset chart type if it becomes
            // incompatible, or pre-select the metric's default.
            if ('metric' in patch) {
                const m = getMetric(patch.metric);
                if (!m) {
                    next.chartType = '';
                } else {
                    const compatible = getCompatibleChartTypes(m);
                    const keep = compatible.find(c => c.id === row.chartType);
                    next.chartType = keep ? row.chartType : (m.defaultChartType || compatible[0]?.id || '');
                }
            }
            return next;
        }));
    };

    const addRow = () => setSeries(prev => [...prev, { metric: '', chartType: '' }]);
    const removeRow = (idx) => setSeries(prev => prev.filter((_, i) => i !== idx));

    const canSubmit = series.length > 0 && series.every(s => s.metric && s.chartType);

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            title: title.trim(),
            series: series.map(s => ({ metric: s.metric, chartType: s.chartType })),
        });
        onClose();
    };

    const isEdit = !!initial;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* dialog */}
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col">
                {/* header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">
                            {isEdit ? 'Edit chart' : 'Add chart'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Combine one or more metrics into a single chart. Each series picks its own chart type.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* title */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Title <span className="normal-case text-muted-foreground/60 font-normal tracking-normal">(optional)</span>
                        </p>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Load vs Intensity"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* series list */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Series
                        </p>
                        <div className="space-y-3">
                            {series.map((row, idx) => (
                                <SeriesRow
                                    key={idx}
                                    index={idx}
                                    row={row}
                                    metrics={metrics}
                                    canRemove={series.length > 1}
                                    onChange={patch => updateRow(idx, patch)}
                                    onRemove={() => removeRow(idx)}
                                />
                            ))}
                        </div>
                        <button
                            onClick={addRow}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-brand-500 hover:border-brand-500/60 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add series
                        </button>
                    </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/20 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            canSubmit
                                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                                : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                        }`}
                    >
                        {isEdit ? 'Save changes' : 'Add chart'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/**
 * One editable series row: metric dropdown + chart-type pills + remove button.
 */
function SeriesRow({ index, row, metrics, canRemove, onChange, onRemove }) {
    const metric = getMetric(row.metric);
    const compatible = metric ? getCompatibleChartTypes(metric) : [];

    return (
        <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">
                    Series {index + 1}
                </span>
                <div className="flex-1" />
                {canRemove && (
                    <button
                        onClick={onRemove}
                        className="p-1.5 rounded-md text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove series"
                        aria-label="Remove series"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* metric select */}
            <div className="mb-3">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                    Metric
                </label>
                <select
                    value={row.metric}
                    onChange={e => onChange({ metric: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                >
                    <option value="">— Choose a metric —</option>
                    {metrics.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.label} ({m.unit})
                        </option>
                    ))}
                </select>
                {metric && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
                        {metric.description}
                    </p>
                )}
            </div>

            {/* chart type pills */}
            <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                    Chart type
                </label>
                {!metric ? (
                    <p className="text-xs text-muted-foreground/70 italic">
                        Pick a metric first to see compatible chart types.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {compatible.map(c => {
                            const active = c.id === row.chartType;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => onChange({ chartType: c.id })}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                                        active
                                            ? 'border-brand-500 bg-brand-500 text-white'
                                            : 'border-border bg-card text-muted-foreground hover:border-brand-500/40 hover:text-foreground'
                                    }`}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
