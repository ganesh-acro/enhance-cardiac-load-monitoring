import React, { useRef, useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import {
    BRAND_ORANGE, SECONDARY_BLUE, FONT_FAMILY,
    getTooltipStyle, getAxisStyle, getGridStyle, getLineSeriesStyle
} from '../../utils/chartStyles';

export const ReportModal = ({ isOpen, onClose, athlete, reportData, autoDownload = false }) => {
    const reportRef = useRef(null);
    const hasAutoDownloaded = useRef(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Capture logic
    const downloadPDF = async () => {
        if (!reportRef.current) return;

        const element = reportRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${athlete.name}_Weekly_Report.pdf`);
    };

    // Auto-download Effect
    useEffect(() => {
        if (!isOpen) {
            hasAutoDownloaded.current = false;
            setIsGenerating(false);
            return;
        }

        if (isOpen && autoDownload && !hasAutoDownloaded.current) {
            setIsGenerating(true);
            const timer = setTimeout(async () => {
                await downloadPDF();
                hasAutoDownloaded.current = true;
                onClose(); // Automatically close after download
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoDownload, onClose]);

    if (!athlete || !reportData || reportData.length === 0) return null;

    // Data Processing
    const last7Days = reportData.slice(-7);
    const latest = last7Days[last7Days.length - 1];
    const startDate = format(new Date(last7Days[0].date), 'dd/MM/yyyy');
    const endDate = format(new Date(last7Days[last7Days.length - 1].date), 'dd/MM/yyyy');

    const hrValues = last7Days.map(d => d.avg_hr || 0);
    const avgHR = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
    const minHR = Math.min(...hrValues);
    const maxHR = Math.max(...hrValues);

    const latestRestHR = latest.rest_hr || 0;
    const latestAvgHR = latest.avg_hr || 0;
    const latestRMSSD = latest.rmssd || 0;
    const latestACWR = latest.acwr || 0;

    // ACWR Logic
    const isOptimal = latestACWR >= 0.8 && latestACWR <= 1.3;
    const isOver = latestACWR > 1.3;
    const acwrStatus = isOptimal ? 'Optimal' : (isOver ? 'Overtraining' : 'Undertraining');
    const acwrColor = isOptimal ? '#10b981' : (isOver ? '#ef4444' : '#f59e0b');

    // Chart Options
    const hrTrendOption = {
        backgroundColor: 'transparent',
        grid: getGridStyle({ top: 40, bottom: 40, left: 40, right: 20 }),
        xAxis: {
            type: 'category',
            data: last7Days.map(d => format(new Date(d.date), 'MMM dd')),
            ...getAxisStyle(false),
            axisLabel: { ...getAxisStyle(false).axisLabel, fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            ...getAxisStyle(false),
            axisLabel: { ...getAxisStyle(false).axisLabel, fontSize: 10 }
        },
        series: [{
            data: hrValues,
            type: 'line',
            ...getLineSeriesStyle(BRAND_ORANGE, true),
            symbol: 'circle',
            symbolSize: 8,
            markLine: {
                silent: true,
                data: [{ type: 'average', name: 'Avg', lineStyle: { color: '#64748b', type: 'dashed' } }],
                label: { position: 'end', fontSize: 10, fontFamily: FONT_FAMILY }
            }
        }]
    };

    const hrvTrendOption = {
        backgroundColor: 'transparent',
        grid: getGridStyle({ top: 40, bottom: 40, left: 40, right: 20 }),
        xAxis: {
            type: 'category',
            data: last7Days.map(d => format(new Date(d.date), 'MMM dd')),
            ...getAxisStyle(false),
            axisLabel: { ...getAxisStyle(false).axisLabel, fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            ...getAxisStyle(false),
            axisLabel: { ...getAxisStyle(false).axisLabel, fontSize: 10 }
        },
        series: [{
            data: last7Days.map(d => d.rmssd || 0),
            type: 'line',
            ...getLineSeriesStyle('#8b5cf6', false),
            symbol: 'diamond',
            symbolSize: 8
        }]
    };

    const zones = ['zone_0_pct', 'zone_1_pct', 'zone_2_pct', 'zone_3_pct', 'zone_4_pct', 'zone_5_pct'];
    const zoneColors = ['#d1d5db', '#9ca3af', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];
    const intensityNames = ['Recovery', 'Aerobic', 'Tempo', 'Lactate', 'Anaerobic', 'Maximum'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto items-start py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        {/* Auto-download Overlay */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2">Preparing Report...</h2>
                                    <p className="text-slate-500 max-w-sm">Please wait while we capture the latest performance analytics for your download.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Control Header */}
                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            <button
                                onClick={downloadPDF}
                                className="p-3 bg-brand-500 text-white rounded-2xl hover:bg-brand-600 transition-all flex items-center justify-center font-bold shadow-lg shadow-brand-500/30"
                                title="Download PDF"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all shadow-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Report Content */}
                        <div ref={reportRef} className="p-12 pb-16 bg-white min-h-[1000px]">
                            {/* PDF Header */}
                            <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                                <div>
                                    <div className="mb-4">
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{athlete.name}</h1>
                                        <p className="text-slate-500 font-normal uppercase tracking-widest text-xs">Weekly Performance Report</p>
                                    </div>
                                    <div className="flex gap-6 mt-4">
                                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Period</span>
                                            <span className="text-sm font-bold text-slate-700">{startDate} - {endDate}</span>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Generation Date</span>
                                            <span className="text-sm font-bold text-slate-700">{format(new Date(), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                                <img src="/logo bright.png" alt="Enhance Health" className="h-28 w-auto object-contain" />
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-12 mb-16 px-4 text-slate-900">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-light tracking-tighter">
                                        {latestRestHR.toFixed(2)}<small className="text-lg font-normal ml-0.5">bpm</small>
                                    </span>
                                    <span className="text-[10px] uppercase font-normal tracking-[0.1em] mt-1">Resting Hr</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-light tracking-tighter">
                                        {latestAvgHR.toFixed(2)}<small className="text-lg font-normal ml-0.5">bpm</small>
                                    </span>
                                    <span className="text-[10px] uppercase font-normal tracking-[0.1em] mt-1">Avg Hr</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-light tracking-tighter">
                                        {latestRMSSD.toFixed(2)}<small className="text-lg font-normal ml-0.5">ms</small>
                                    </span>
                                    <span className="text-[10px] uppercase font-normal tracking-[0.1em] mt-1">RMSSD (HRV)</span>
                                </div>
                            </div>

                            {/* Main Analysis */}
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-12">
                                    <div>
                                        <h3 className="text-lg font-normal text-slate-900 uppercase tracking-tight mb-6">Heart Rate Analytics</h3>
                                        <div className="h-56 bg-white border border-slate-50 rounded-2xl">
                                            <ReactECharts option={hrTrendOption} style={{ height: '100%' }} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                            <div className="bg-slate-50 p-2 rounded-xl">
                                                <span className="block text-[8px] text-slate-400 uppercase font-black">Min</span>
                                                <span className="text-sm font-bold text-slate-700">{minHR}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                                                <span className="block text-[8px] text-slate-400 uppercase font-black">Avg</span>
                                                <span className="text-sm font-bold text-slate-900">{avgHR}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl">
                                                <span className="block text-[8px] text-slate-400 uppercase font-black">Max</span>
                                                <span className="text-sm font-bold text-slate-700">{maxHR}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-normal text-slate-900 uppercase tracking-tight mb-6">HRV Trend (RMSSD)</h3>
                                        <div className="h-56 bg-white border border-slate-50 rounded-2xl">
                                            <ReactECharts option={hrvTrendOption} style={{ height: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <div>
                                        <h3 className="text-lg font-normal text-slate-900 uppercase tracking-tight mb-6">Current ACWR</h3>
                                        <div className="h-56 flex flex-col items-center justify-center bg-slate-50/20 rounded-3xl border border-slate-50 p-8">
                                            <div className="text-4xl font-normal mb-2" style={{ color: acwrColor }}>{acwrStatus}</div>
                                            <div className="text-xl font-normal text-slate-900 tracking-tight">Ratio: {latestACWR.toFixed(2)}</div>
                                        </div>
                                        <p className="text-center text-[10px] text-slate-900 font-normal uppercase tracking-widest mt-4">Target Zone: 0.8 - 1.3</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-normal text-slate-900 uppercase tracking-tight mb-6">Zone Intensity Distribution</h3>
                                        <div className="space-y-4 px-4 py-6 bg-slate-50/30 rounded-3xl border border-slate-50">
                                            {[5, 4, 3, 2, 1, 0].map(z => {
                                                const avgZone = Math.round(last7Days.reduce((acc, curr) => acc + (curr[zones[z]] || 0), 0) / last7Days.length);
                                                return (
                                                    <div key={z}>
                                                        <div className="flex justify-between text-[10px] font-normal uppercase tracking-tight mb-1 text-slate-900">
                                                            <span>Zone {z} <span className="ml-1 opacity-60">({intensityNames[z]})</span></span>
                                                            <span>{avgZone}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${avgZone}%`, backgroundColor: zoneColors[z] }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
