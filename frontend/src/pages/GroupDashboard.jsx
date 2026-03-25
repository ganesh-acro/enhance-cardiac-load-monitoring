import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Activity,
    Zap,
    Flame,
    Scale,
    Wind,
    RotateCcw,
    Maximize2,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Heart,
    Footprints,
    Battery,
    X
} from "lucide-react"
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { useTheme } from "../components/theme-provider"
import {
    FONT_FAMILY,
    getTooltipStyle, getAxisStyle, getGridStyle
} from "../utils/chartStyles"
import { fetchGroupSummary } from "../utils/dataService"

const TRAINING_METRICS = [
    { key: 'training_load', label: 'Training Load', unit: '', icon: Zap, color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { key: 'training_intensity', label: 'Training Intensity', unit: '', icon: Flame, color: '#ef4444', gradient: ['#ef4444', '#f87171'] },
    { key: 'movement_load', label: 'Movement Load', unit: '', icon: Footprints, color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
    { key: 'vo2', label: 'VO2', unit: 'ml/kg/min', icon: Wind, color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'ee_men', label: 'Energy Expenditure', unit: 'kcal', icon: Flame, color: '#f97316', gradient: ['#f97316', '#fb923c'] },
    { key: 'epoc_total', label: 'EPOC', unit: 'kcal', icon: Battery, color: '#06b6d4', gradient: ['#06b6d4', '#22d3ee'] },
]

const READINESS_METRICS = [
    { key: 'acwr', label: 'ACWR', unit: '', icon: Scale, color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'avg_hr', label: 'Avg HR', unit: 'bpm', icon: Activity, color: '#f97316', gradient: ['#f97316', '#fb923c'] },
    { key: 'rmssd', label: 'RMSSD', unit: 'ms', icon: RotateCcw, color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { key: 'recovery_beats', label: 'Recovery Beats', unit: 'bpm', icon: Heart, color: '#ef4444', gradient: ['#ef4444', '#f87171'] },
    { key: 'rest_hr', label: 'Resting HR', unit: 'bpm', icon: Heart, color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
]

const GRAY_THEME = {
    color: '#8494aaff',
    gradient: ['#8494aaff', '#a1aebcff'],
    brandText: 'text-slate-600 dark:text-slate-400',
    brandBg: 'bg-slate-500/10 dark:bg-slate-400/10',
    brandBorder: 'border-slate-500/20 dark:border-slate-400/20'
}

export default function GroupDashboard() {
    const [activeTab, setActiveTab] = useState('training')
    const [trainingData, setTrainingData] = useState({ athletes: [], groupAverages: {} })
    const [readinessData, setReadinessData] = useState({ athletes: [], groupAverages: {} })
    const [loading, setLoading] = useState(true)
    const [zoomedMetric, setZoomedMetric] = useState(null)
    const [zoomedSelectedAthleteId, setZoomedSelectedAthleteId] = useState("all")
    const [sortConfigs, setSortConfigs] = useState({})

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true)
            try {
                const { training, readiness } = await fetchGroupSummary()
                setTrainingData(training)
                setReadinessData(readiness)
            } catch (err) {
                console.error("Error loading group dashboard data:", err)
            }
            setLoading(false)
        }
        loadAllData()
    }, [])

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

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                            Group <span className="text-brand-500">dashboard</span>
                        </h1>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-8 items-start">
                    {currentMetrics.map((metric) => (
                        <MetricCard
                            key={metric.key}
                            metric={metric}
                            theme={GRAY_THEME}
                            teamData={teamData}
                            groupAverage={groupAverages[metric.key]}
                            onZoom={() => setZoomedMetric({ ...metric, theme: GRAY_THEME })}
                            sortConfig={sortConfigs[metric.key]}
                            onSort={(field) => handleSort(metric.key, field)}
                            sortedData={getSortedData(metric.key, teamData)}
                            athletesList={teamData}
                        />
                    ))}
                </div>
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
                                <div className="flex items-center gap-6">
                                    <h3 className="text-3xl font-bold">{zoomedMetric.label}</h3>
                                    <div className="relative group w-64">
                                        <select
                                            value={zoomedSelectedAthleteId}
                                            onChange={(e) => setZoomedSelectedAthleteId(e.target.value)}
                                            className="appearance-none w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 pr-10 font-bold text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm"
                                        >
                                            <option value="all">Select athlete</option>
                                            {teamData.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setZoomedMetric(null)
                                        setZoomedSelectedAthleteId("all")
                                    }}
                                    className="p-4 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto">
                                <div className="h-[500px] mb-12">
                                    <MetricChart
                                        metric={zoomedMetric}
                                        theme={zoomedMetric.theme}
                                        data={teamData}
                                        groupAverage={groupAverages[zoomedMetric.key]}
                                        selectedAthleteId={zoomedSelectedAthleteId}
                                        isZoomed
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                    <div className="md:col-span-2">
                                        <MetricTable
                                            metric={zoomedMetric}
                                            theme={zoomedMetric.theme}
                                            groupAverage={groupAverages[zoomedMetric.key]}
                                            sortConfig={sortConfigs[zoomedMetric.key]}
                                            onSort={(field) => handleSort(zoomedMetric.key, field)}
                                            sortedData={getSortedData(zoomedMetric.key, teamData)}
                                            selectedAthleteId={zoomedSelectedAthleteId}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-xl bg-secondary/50 border border-border">
                                            <p className="text-xl font-normal tracking-tight text-muted-foreground mb-2">Group average</p>
                                            <h4 className="text-5xl font-bold">
                                                {groupAverages[zoomedMetric.key]} <span className="text-xl font-bold text-muted-foreground">{zoomedMetric.unit}</span>
                                            </h4>
                                        </div>
                                        <div className={`p-8 rounded-xl ${zoomedMetric.theme.brandBg} border ${zoomedMetric.theme.brandBorder}`}>
                                            <p className={`text-xs font-black tracking-widest ${zoomedMetric.theme.brandText} mb-2`}>Top performer</p>
                                            {(() => {
                                                const top = [...teamData].sort((a, b) => b[zoomedMetric.key] - a[zoomedMetric.key])[0]
                                                if (!top) return <p className="text-muted-foreground text-sm">No data</p>
                                                return (
                                                    <div className="flex items-center gap-4">
                                                        <img src={top.img} className="h-12 w-12 rounded-full border-2" style={{ borderColor: zoomedMetric.theme.color }} alt="" />
                                                        <div>
                                                            <p className="font-black text-lg">{top.name}</p>
                                                            <p className="font-bold" style={{ color: zoomedMetric.theme.color }}>{parseFloat(top[zoomedMetric.key]).toFixed(1)} {zoomedMetric.unit}</p>
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

function MetricCard({ metric, theme, teamData, groupAverage, onZoom, sortConfig, onSort, sortedData, athletesList }) {
    const [view, setView] = useState('graph')
    const [selectedAthleteId, setSelectedAthleteId] = useState("all")

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col group overflow-hidden"
        >
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-border/50 bg-secondary/10">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="font-bold tracking-tight text-2xl">{metric.label}</h3>
                        <p className="text-lg font-bold text-muted-foreground">{metric.unit || 'Score'}</p>
                    </div>
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
                <div className="relative group mb-8">
                    <select
                        value={selectedAthleteId}
                        onChange={(e) => setSelectedAthleteId(e.target.value)}
                        className="appearance-none w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 pr-10 font-bold text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                        <option value="all">Select athlete</option>
                        {athletesList.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-brand-500 transition-colors" />
                </div>

                <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-6xl font-bold">{groupAverage}</span>
                    <span className="text-muted-foreground font-normal text-xl">Average group result</span>
                </div>

                <div className="w-full h-[300px] mt-auto">
                    {view === 'graph' ? (
                        <MetricChart
                            metric={metric}
                            theme={theme}
                            data={teamData}
                            groupAverage={groupAverage}
                            selectedAthleteId={selectedAthleteId}
                        />
                    ) : (
                        <MetricTable
                            metric={metric}
                            theme={theme}
                            groupAverage={groupAverage}
                            sortConfig={sortConfig}
                            onSort={onSort}
                            sortedData={sortedData}
                            selectedAthleteId={selectedAthleteId}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function useChartTheme() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return false
    return resolvedTheme === 'dark'
}

function MetricChart({ metric, theme, data, groupAverage, selectedAthleteId, isZoomed = false }) {
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

    const barData = chartData.map(entry => {
        const isAboveAvg = entry.value > avg
        const isSelected = selectedAthleteId === "all" || selectedAthleteId === entry.id
        return {
            value: entry.value,
            itemStyle: {
                color: isSelected
                    ? (isAboveAvg
                        ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: isDark ? '#c49a5a' : '#0d7377' },
                            { offset: 1, color: isDark ? '#d4b47c' : '#33bdc1' },
                        ])
                        : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: theme.gradient[0] },
                            { offset: 1, color: theme.gradient[1] },
                        ]))
                    : (isDark ? '#334155' : '#e2e8f0'),
                opacity: isSelected ? 1 : 0.3,
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
                return `<div style="font-family:${FONT_FAMILY}">
                    <div style="font-weight:700;color:${theme.color};margin-bottom:4px">${entry.fullName}</div>
                    <div style="font-size:16px;font-weight:700">${entry.value.toFixed(1)} <span style="font-size:12px;opacity:0.6">${metric.unit}</span></div>
                    <div style="font-size:11px;opacity:0.5;margin-top:2px">Group Avg: ${avg.toFixed(1)}</div>
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
        <ReactECharts
            key={`${metric.key}-${isDark}`}
            option={option}
            notMerge={true}
            style={{ height: '100%', width: '100%' }}
        />
    )
}

function MetricTable({ metric, theme, groupAverage, sortConfig = { field: 'name', direction: 'asc' }, onSort, sortedData, selectedAthleteId }) {
    const filteredData = selectedAthleteId === "all"
        ? sortedData
        : sortedData.filter(athlete => athlete.id === selectedAthleteId);

    return (
        <div className="w-full overflow-hidden border border-border rounded-lg">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-normal tracking-widest border-b border-border">
                            <th className="px-4 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort('name')}>
                                <div className="flex items-center gap-2">
                                    Profile {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4">{metric.label} ({metric.unit || 'score'})</th>
                            <th className="px-4 py-4">Group Avg</th>
                            <th className="px-4 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort(metric.key)}>
                                <div className="flex items-center gap-2">
                                    Value {sortConfig.field === metric.key && (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-right">Last Test Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredData.map((athlete) => {
                            const val = parseFloat(athlete[metric.key]) || 0
                            const diff = groupAverage > 0 ? ((val - groupAverage) / groupAverage * 100).toFixed(0) : 0

                            return (
                                <tr key={athlete.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={athlete.img} className="h-8 w-8 rounded-full border border-border group-hover:border-brand-300 transition-colors" alt="" />
                                            <span className="font-normal whitespace-nowrap">{athlete.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-normal text-xs">{metric.label}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-normal">{metric.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono font-normal text-muted-foreground">{groupAverage}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold" style={{ color: theme.color }}>{val.toFixed(1)}</span>
                                            {diff !== "0" && (
                                                <span className={`text-[10px] font-bold ${parseFloat(diff) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {parseFloat(diff) > 0 ? '+' : ''}{diff}%
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
