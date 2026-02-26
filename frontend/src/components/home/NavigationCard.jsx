import { ArrowRight } from "lucide-react"

export function NavigationCard({ title, description, icon: Icon, onClick }) {
    const isImage = typeof Icon === 'string';

    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.05] hover:shadow-2xl hover:shadow-brand-500/20 hover:border-brand-500/40 dark:hover:border-brand-400/40"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-inner overflow-hidden">
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
