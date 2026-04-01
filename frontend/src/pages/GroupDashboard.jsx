import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Zap,
    Flame,
    Wind,
    RotateCcw,
    Maximize2,
    ArrowUp,
    ArrowDown,
    Heart,
    Battery,
    X,
    CalendarDays,
    Activity,
} from "lucide-react"
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { useTheme } from "../components/theme-provider"
import {
    FONT_FAMILY,
    getTooltipStyle, getAxisStyle, getGridStyle
} from "../utils/chartStyles"
import { useLocation } from "react-router-dom"
import { fetchGroupSummary } from "../utils/dataService"

const TRAINING_METRICS = [
    { key: 'training_load', label: 'Training Load', unit: '', icon: Zap, color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { key: 'training_intensity', label: 'Training Intensity', unit: '', icon: Flame, color: '#ef4444', gradient: ['#ef4444', '#f87171'] },
    { key: 'acwr', label: 'ACWR', unit: '', icon: Activity, color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'vo2', label: 'VO2', unit: 'ml/kg/min', icon: Wind, color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'ee_men', label: 'Energy Expenditure', unit: 'kcal', icon: Flame, color: '#f97316', gradient: ['#f97316', '#fb923c'] },
    { key: 'epoc_total', label: 'EPOC', unit: 'kcal', icon: Battery, color: '#06b6d4', gradient: ['#06b6d4', '#22d3ee'] },
]

const READINESS_METRICS = [
    { key: 'avg_hr', label: 'Avg HR', unit: 'bpm', icon: Activity, color: '#f97316', gradient: ['#f97316', '#fb923c'] },
    { key: 'rmssd', label: 'HRV', unit: 'ms', icon: RotateCcw, color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { key: 'recovery_beats', label: 'Recovery Beats', unit: 'bpm', icon: Heart, color: '#ef4444', gradient: ['#ef4444', '#f87171'] },
    { key: 'rest_hr', label: 'Resting HR', unit: 'bpm', icon: Heart, color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
]

const ABOVE_COLOR = { light: '#0d7377', dark: '#c49a5a' }
const BELOW_COLOR = { light: '#8494aa', dark: '#8494aa' }

// ── Date Range Gate ────────────────────────────────────────────────────────────

function DateRangeGate({ onApply }) {
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const canApply = from && to && from <= to

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                        <CalendarDays className="h-10 w-10 text-brand-500" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-foreground mb-3">
                        Select a date range
                    </h1>
                    <p className="text-muted-foreground font-medium text-base leading-relaxed">
                        Choose a start and end date to compare team metrics across the same period.
                    </p>
                </div>

                {/* Inputs */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                From
                            </label>
                            <input
                                type="date"
                                value={from}
                                max={to || undefined}
                                onChange={e => setFrom(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 font-bold text-sm text-foreground focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                To
                            </label>
                            <input
                                type="date"
                                value={to}
                                min={from || undefined}
                                onChange={e => setTo(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 font-bold text-sm text-foreground focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {from && to && from > to && (
                        <p className="text-xs font-bold text-red-500 text-center">
                            End date must be after start date.
                        </p>
                    )}

                    <button
                        disabled={!canApply}
                        onClick={() => onApply(from, to)}
                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-colors text-base tracking-wide"
                    >
                        Load Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GroupDashboard() {
    const location = useLocation()
    const [dateRange, setDateRange] = useState(null)
    const [activeTab, setActiveTab] = useState('training')
    const [trainingData, setTrainingData] = useState({ athletes: [], groupAverages: {} })
    const [readinessData, setReadinessData] = useState({ athletes: [], groupAverages: {} })
    const [loading, setLoading] = useState(false)
    const [zoomedMetric, setZoomedMetric] = useState(null)
    const [sortConfigs, setSortConfigs] = useState({})

    // Reset to date range gate on every navigation to this page
    useEffect(() => {
        setDateRange(null)
        setTrainingData({ athletes: [], groupAverages: {} })
        setReadinessData({ athletes: [], groupAverages: {} })
        setActiveTab('training')
    }, [location.key])

    useEffect(() => {
        if (!dateRange) return
        const loadAllData = async () => {
            setLoading(true)
            try {
                const { training, readiness } = await fetchGroupSummary(dateRange.from, dateRange.to)
                setTrainingData(training)
                setReadinessData(readiness)
            } catch (err) {
                console.error("Error loading group dashboard data:", err)
            }
            setLoading(false)
        }
        loadAllData()
    }, [dateRange])

    const handleChangeDateRange = () => {
        setDateRange(null)
        setTrainingData({ athletes: [], groupAverages: {} })
        setReadinessData({ athletes: [], groupAverages: {} })
    }

    if (!dateRange) {
        return <DateRangeGate onApply={(from, to) => setDateRange({ from, to })} />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                    Aggregating Team Metrics...
                </p>
            </div>
        )
    }

    const currentData = activeTab === 'training' ? trainingData : readinessData
    const currentMetrics = activeTab === 'training' ? TRAINING_METRICS : READINESS_METRICS
    const teamData = currentData.athletes
    const groupAverages = currentData.groupAverages

    const handleSort = (metricKey, field) => {
        setSortConfigs(prev => {
            const current = prev[metricKey] || { field: 'name', direction: 'asc' }
            const newDirection = current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
            return { ...prev, [metricKey]: { field, direction: newDirection } }
        })
    }

    const getSortedData = (metricKey, data) => {
        const config = sortConfigs[metricKey] || { field: 'name', direction: 'asc' }
        return [...data].sort((a, b) => {
            let valA = a[config.field]
            let valB = b[config.field]
            if (typeof valA === 'string') {
                return config.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
            }
            return config.direction === 'asc' ? valA - valB : valB - valA
        })
    }

    const fmt = (s) => {
        if (!s) return ''
        const [y, m, d] = s.split('-')
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                            Group <span className="text-brand-500">dashboard</span>
                        </h1>
                        <button
                            onClick={handleChangeDateRange}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-brand-500 transition-colors mt-1"
                        >
                            <CalendarDays className="h-4 w-4" />
                            {fmt(dateRange.from)} — {fmt(dateRange.to)}
                            <span className="text-xs font-bold text-brand-500 underline underline-offset-2">Change</span>
                        </button>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-secondary/50 p-1.5 rounded-lg flex">
                            <button
                                onClick={() => setActiveTab('training')}
                                className={`px-6 py-2.5 rounded-lg text-base font-bold transition-all duration-200 ${activeTab === 'training'
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                Training
                            </button>
                            <button
                                onClick={() => setActiveTab('readiness')}
                                className={`px-6 py-2.5 rounded-lg text-base font-bold transition-all duration-200 ${activeTab === 'readiness'
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                Readiness
                            </button>
                        </div>
                    </div>
                </header>

                {teamData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                            <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-bold text-foreground mb-2">No data for this period</p>
                        <p className="text-sm text-muted-foreground font-medium max-w-xs">
                            No sessions were recorded in the selected date range. Try adjusting the dates.
                        </p>
                        <button
                            onClick={handleChangeDateRange}
                            className="mt-6 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                            Change date range
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-8 items-start">
                        {currentMetrics.map((metric) => (
                            <MetricCard
                                key={metric.key}
                                metric={metric}
                                teamData={teamData}
                                groupAverage={groupAverages[metric.key]}
                                onZoom={() => setZoomedMetric(metric)}
                                sortConfig={sortConfigs[metric.key]}
                                onSort={(field) => handleSort(metric.key, field)}
                                sortedData={getSortedData(metric.key, teamData)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Zoom Modal */}
            <AnimatePresence>
                {zoomedMetric && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setZoomedMetric(null)}
                            className="absolute inset-0 bg-background/60"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-6xl bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/30">
                                <h3 className="text-3xl font-bold">{zoomedMetric.label}</h3>
                                <button
                                    onClick={() => setZoomedMetric(null)}
                                    className="p-4 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto">
                                <div className="h-[500px] mb-12">
                                    <MetricChart
                                        metric={zoomedMetric}
                                        data={teamData}
                                        groupAverage={groupAverages[zoomedMetric.key]}
                                        isZoomed
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                    <div className="md:col-span-2">
                                        <MetricTable
                                            metric={zoomedMetric}
                                            groupAverage={groupAverages[zoomedMetric.key]}
                                            sortConfig={sortConfigs[zoomedMetric.key]}
                                            onSort={(field) => handleSort(zoomedMetric.key, field)}
                                            sortedData={getSortedData(zoomedMetric.key, teamData)}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-xl bg-secondary/50 border border-border">
                                            <p className="text-xl font-normal tracking-tight text-muted-foreground mb-2">Group average</p>
                                            <h4 className="text-5xl font-bold">
                                                {groupAverages[zoomedMetric.key]} <span className="text-xl font-bold text-muted-foreground">{zoomedMetric.unit}</span>
                                            </h4>
                                        </div>
                                        <div className="p-8 rounded-xl bg-brand-500/10 border border-brand-500/20">
                                            <p className="text-xs font-black tracking-widest text-brand-500 mb-2">Top performer</p>
                                            {(() => {
                                                const top = [...teamData].sort((a, b) => b[zoomedMetric.key] - a[zoomedMetric.key])[0]
                                                if (!top) return <p className="text-muted-foreground text-sm">No data</p>
                                                return (
                                                    <div className="flex items-center gap-4">
                                                        <InitialsAvatar name={top.name} size="md" />
                                                        <div>
                                                            <p className="font-black text-lg">{top.name}</p>
                                                            <p className="font-bold" style={{ color: zoomedMetric.color }}>{parseFloat(top[zoomedMetric.key]).toFixed(1)} {zoomedMetric.unit}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── Shared: Initials Avatar ───────────────────────────────────────────────────

function InitialsAvatar({ name, size = "sm" }) {
    const initial = name?.charAt(0)?.toUpperCase() || '?'
    const sizeClasses = size === "md" ? "w-12 h-12 text-lg" : "w-8 h-8 text-sm"
    return (
        <div className={`${sizeClasses} rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 font-black border border-brand-500/20 shrink-0`}>
            {initial}
        </div>
    )
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({ metric, teamData, groupAverage, onZoom, sortConfig, onSort, sortedData }) {
    const [view, setView] = useState('graph')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col group overflow-hidden"
        >
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-border/50 bg-secondary/10">
                <div>
                    <h3 className="font-bold tracking-tight text-2xl">{metric.label}</h3>
                    <p className="text-lg font-bold text-muted-foreground">{metric.unit || 'Score'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-secondary/50 p-1 rounded-lg flex">
                        <button
                            onClick={() => setView('graph')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${view === 'graph' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            Graph
                        </button>
                        <button
                            onClick={() => setView('table')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${view === 'table' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            Table
                        </button>
                    </div>
                    <button
                        onClick={onZoom}
                        className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-brand-500 transition-colors"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col pt-4">
                <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-6xl font-bold">{groupAverage}</span>
                    <span className="text-muted-foreground font-normal text-xl">Average group result</span>
                </div>

                <div className="w-full h-[300px] mt-auto">
                    {view === 'graph' ? (
                        <MetricChart
                            metric={metric}
                            data={teamData}
                            groupAverage={groupAverage}
                        />
                    ) : (
                        <MetricTable
                            metric={metric}
                            groupAverage={groupAverage}
                            sortConfig={sortConfig}
                            onSort={onSort}
                            sortedData={sortedData}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ── Chart Theme Hook ──────────────────────────────────────────────────────────

function useChartTheme() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return false
    return resolvedTheme === 'dark'
}

// ── Metric Chart ──────────────────────────────────────────────────────────────

function MetricChart({ metric, data, groupAverage, isZoomed = false }) {
    const isDark = useChartTheme()

    if (!metric || !data || data.length === 0) return (
        <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold tracking-widest">
            No data available
        </div>
    )

    const chartData = useMemo(() => {
        return data.map(athlete => ({
            name: athlete.name.split(' ')[0],
            fullName: athlete.name,
            value: parseFloat(athlete[metric.key]) || 0,
            id: athlete.id
        }))
    }, [data, metric.key])

    const avg = parseFloat(groupAverage)
    const axisStyle = getAxisStyle(isDark)

    const aboveColor = isDark ? ABOVE_COLOR.dark : ABOVE_COLOR.light
    const belowColor = isDark ? BELOW_COLOR.dark : BELOW_COLOR.light

    const barData = chartData.map(entry => {
        const isAboveAvg = entry.value >= avg
        return {
            value: entry.value,
            itemStyle: {
                color: isAboveAvg
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: aboveColor },
                        { offset: 1, color: aboveColor + 'cc' },
                    ])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: belowColor },
                        { offset: 1, color: belowColor + 'cc' },
                    ]),
                borderRadius: [8, 8, 2, 2],
            }
        }
    })

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            ...getTooltipStyle(isDark),
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const idx = params[0].dataIndex
                const entry = chartData[idx]
                const diff = (entry.value - avg).toFixed(1)
                const diffStr = diff > 0 ? `+${diff}` : `${diff}`
                return `<div style="font-family:${FONT_FAMILY}">
                    <div style="font-weight:700;color:${metric.color};margin-bottom:4px">${entry.fullName}</div>
                    <div style="font-size:16px;font-weight:700">${entry.value.toFixed(1)} <span style="font-size:12px;opacity:0.6">${metric.unit}</span></div>
                    <div style="font-size:11px;opacity:0.5;margin-top:2px">vs avg: ${diffStr}</div>
                </div>`
            }
        },
        grid: getGridStyle({ top: 20, bottom: isZoomed ? '15%' : '10%' }),
        xAxis: {
            type: 'category',
            data: chartData.map(d => d.name),
            ...axisStyle,
            axisLabel: {
                ...axisStyle.axisLabel,
                rotate: chartData.length > 6 ? 45 : 0,
            },
        },
        yAxis: {
            type: 'value',
            ...axisStyle,
        },
        series: [
            {
                type: 'bar',
                data: barData,
                barMaxWidth: isZoomed ? 40 : 25,
                animationDuration: 500,
                markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: {
                        color: isDark ? '#cbd5e1' : '#333333',
                        type: 'dashed',
                        width: 2,
                    },
                    label: {
                        position: 'end',
                        formatter: `Avg: ${avg.toFixed(1)}`,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: FONT_FAMILY,
                        color: isDark ? '#cbd5e1' : '#333333',
                    },
                    data: [{ yAxis: avg }],
                },
            },
        ],
    }

    return (
        <div className="h-full flex flex-col">
            <ReactECharts
                key={`${metric.key}-${isDark}`}
                option={option}
                notMerge={true}
                style={{ flex: 1, width: '100%', minHeight: 0 }}
            />
            {/* Legend */}
            <div className="flex items-center gap-4 justify-center pt-2 pb-1">
                <div className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ background: aboveColor }}
                    />
                    <span className="text-[11px] font-bold text-muted-foreground">Above average</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ background: belowColor }}
                    />
                    <span className="text-[11px] font-bold text-muted-foreground">Below average</span>
                </div>
            </div>
        </div>
    )
}

// ── Metric Table ──────────────────────────────────────────────────────────────

function MetricTable({ metric, groupAverage, sortConfig = { field: 'name', direction: 'asc' }, onSort, sortedData }) {
    return (
        <div className="w-full overflow-hidden border border-border rounded-lg">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-normal tracking-widest border-b border-border">
                            <th className="px-4 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort('name')}>
                                <div className="flex items-center gap-2">
                                    Athlete {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                </div>
                            </th>
                            <th
                                className="px-4 py-4 cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => onSort(metric.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {metric.label} {sortConfig.field === metric.key && (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-right">Last Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {sortedData.map((athlete) => {
                            const val = parseFloat(athlete[metric.key]) || 0
                            const avg = parseFloat(groupAverage) || 0
                            const diff = (val - avg).toFixed(1)
                            const isAbove = val >= avg

                            return (
                                <tr key={athlete.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <InitialsAvatar name={athlete.name} />
                                            <span className="font-bold whitespace-nowrap">{athlete.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-foreground">
                                                {val.toFixed(1)}
                                            </span>
                                            <span className="text-xs font-bold text-muted-foreground">{metric.unit}</span>
                                            {avg > 0 && diff !== "0.0" && (
                                                <span className={`text-[11px] font-black ${isAbove ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {isAbove ? '+' : ''}{diff}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-muted-foreground text-[10px] font-normal">
                                        {athlete.lastDate}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
