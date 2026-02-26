import { User, Calendar, Activity, Zap, Heart, BrainCircuit } from "lucide-react"

export function AthleteInfoCard({ athleteData, isSecondary }) {
    if (!athleteData) return null;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl border ${isSecondary ? 'border-blue-500/30 bg-blue-50/10 dark:bg-blue-900/10' : 'border-border bg-card'} shadow-sm transition-all duration-300`}>
            {/* Athlete Name & Quick Stats */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] tracking-widest font-black">
                    <User className={`h-3.5 w-3.5 ${isSecondary ? 'text-blue-500' : 'text-brand-500'}`} />
                    <span>{isSecondary ? 'Comparison target' : 'Athlete profile'}</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{athleteData.name}</h2>
                    <p className="text-xs font-bold text-muted-foreground">
                        {athleteData.age} {athleteData.age !== 'N/A' && 'YRS'} / {athleteData.gender}
                    </p>
                </div>

                {/* Metric Boxes */}
                <div className="flex gap-2 pt-1">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span className="text-[9px] font-black text-muted-foreground">Avg HR</span>
                        </div>
                        <p className="text-sm font-black text-foreground">{athleteData.avgHR} <span className="text-[10px] text-muted-foreground">BPM</span></p>
                    </div>
                    <div className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <BrainCircuit className="h-3 w-3 text-purple-500" />
                            <span className="text-[9px] font-black text-muted-foreground">RMSSD</span>
                        </div>
                        <p className="text-sm font-black text-foreground">{athleteData.avgRMSSD} <span className="text-[10px] text-muted-foreground">MS</span></p>
                    </div>
                </div>
            </div>

            {/* Session Period */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] tracking-widest font-black">
                    <Calendar className={`h-3.5 w-3.5 ${isSecondary ? 'text-blue-500' : 'text-brand-500'}`} />
                    <span>Session lifecycle</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <span className="text-xs font-black text-muted-foreground w-8">From</span>
                        <p className="text-lg font-black text-foreground leading-none">{athleteData.sessionStart}</p>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-xs font-black text-muted-foreground w-8">To</span>
                        <p className="text-lg font-black text-foreground leading-none">{athleteData.sessionEnd}</p>
                    </div>
                </div>
            </div>

            {/* Session Volume & Subdivision */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] tracking-widest font-black">
                    <Activity className={`h-3.5 w-3.5 ${isSecondary ? 'text-blue-500' : 'text-brand-500'}`} />
                    <span>Session volume</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className={`text-5xl font-black tracking-tighter ${isSecondary ? 'text-blue-500' : 'text-brand-500'}`}>{athleteData.totalSessions}</p>
                    <span className="text-xs font-black text-muted-foreground">Total sessions</span>
                </div>

                {/* Subdivision */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground">Training</span>
                        <p className="text-sm font-black text-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            {athleteData.trainingSessions}
                        </p>
                    </div>
                    <div className="flex flex-col border-l border-border pl-3">
                        <span className="text-[9px] font-black text-muted-foreground">Readiness</span>
                        <p className="text-sm font-black text-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3 text-emerald-500" />
                            {athleteData.readinessSessions}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
