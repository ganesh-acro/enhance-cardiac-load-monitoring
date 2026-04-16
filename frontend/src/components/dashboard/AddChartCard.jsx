import { Plus } from 'lucide-react';

/**
 * Dashed "+ Add chart" tile shown at the end of each customisable tab.
 * Clicking it opens the AddChartModal managed by the parent.
 */
export function AddChartCard({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full min-h-[450px] rounded-xl border-2 border-dashed border-border bg-card/30 hover:border-brand-500/60 hover:bg-brand-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
        >
            <div className="w-14 h-14 rounded-full bg-muted/50 group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                <Plus className="h-7 w-7 text-muted-foreground/70 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground group-hover:text-brand-500 transition-colors">
                Add chart
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-[220px] text-center">
                Pick a metric and chart type to add a custom view.
            </p>
        </button>
    );
}
