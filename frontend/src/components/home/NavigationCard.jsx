import { ArrowRight } from "lucide-react"

export function NavigationCard({ title, description, icon: Icon, onClick }) {
    const isImage = typeof Icon === 'string';

    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-colors duration-200 hover:shadow-md hover:border-brand-500/30"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200 overflow-hidden">
                {isImage ? (
                    <img
                        src={Icon}
                        alt={title}
                        className="h-full w-full object-contain p-2 brand-orange-filter group-hover:brightness-0 group-hover:invert group-hover:!filter-none transition-all duration-300"
                    />
                ) : (
                    <Icon className="h-8 w-8" />
                )}
            </div>

            <div className="space-y-1">
                <h3 className="font-bold text-2xl tracking-tight text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {title}
                </h3>
            </div>

        </button>
    )
}
