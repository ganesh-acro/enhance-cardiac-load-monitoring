import { useState, useEffect, useRef } from 'react';
import { MoreVertical, RotateCcw } from 'lucide-react';

/**
 * Reusable 3-dot menu attached to a chart card. Provides a popover with
 * configurable "sections" rendered by the parent. Keeps the menu UI
 * concern separated from any chart-specific preference logic.
 *
 * Props
 * -----
 *   children    : render prop — receives `{ close }`. Return the menu body
 *                 (toggles, selects, etc.) here.
 *   onReset     : optional callback for the "Reset" action. Hidden if absent.
 *   align       : 'right' | 'left' — popover horizontal anchor (default 'right')
 */
export function ChartCustomizer({ children, onReset, align = 'right' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const close = () => setOpen(false);

    return (
        <span ref={ref} className="relative inline-flex items-center ml-2" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className={`p-1.5 rounded-md transition-colors ${open ? 'bg-muted text-brand-500' : 'text-muted-foreground/50 hover:text-brand-500 hover:bg-muted/50'}`}
                title="Customize chart"
                aria-label="Customize chart"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {open && (
                <div
                    className={`absolute top-9 ${align === 'right' ? 'right-0' : 'left-0'} z-50 w-72 bg-card border border-border rounded-xl shadow-xl p-4`}
                >
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">
                        Customize chart
                    </p>
                    <div className="space-y-3">
                        {typeof children === 'function' ? children({ close }) : children}
                    </div>

                    {onReset && (
                        <button
                            onClick={() => { onReset(); close(); }}
                            className="w-full mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-brand-500 transition-colors uppercase tracking-widest"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset to default
                        </button>
                    )}
                </div>
            )}
        </span>
    );
}

// -------------------------------------------------------------------------
// Small UI primitives for the menu body
// -------------------------------------------------------------------------

export function PrefLabel({ children }) {
    return (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
            {children}
        </p>
    );
}

export function PrefSegmented({ value, onChange, options }) {
    return (
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/40 border border-border/60">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${value === opt.value
                        ? 'bg-card text-brand-500 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export function PrefToggle({ checked, onChange, label, description }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`mt-0.5 relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-muted'}`}
            >
                <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
                />
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
        </label>
    );
}
