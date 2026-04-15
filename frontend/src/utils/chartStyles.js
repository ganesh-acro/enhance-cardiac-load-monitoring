import * as echarts from 'echarts';

// ─── Brand Palette ───────────────────────────────────────────────────────────
export const BRAND_TEAL = '#0d7377';
export const BRAND_AMBER = '#b08347';
export const BRAND_ORANGE = '#0d7377'; // default; use getBrandColor(isDark) for mode-aware
export const getBrandColor = (isDark) => isDark ? BRAND_AMBER : BRAND_TEAL;
export const SECONDARY_BLUE = '#1f77b4';

// ─── Typography ──────────────────────────────────────────────────────────────
export const FONT_FAMILY = 'Inter, Outfit, sans-serif';

// ─── Responsive breakpoints ─────────────────────────────────────────────────
// Call getResponsiveSizes(containerWidth) to get scaled font/spacing values.
// If no width is provided, falls back to window.innerWidth.
export const getResponsiveSizes = (w) => {
    const width = w || (typeof window !== 'undefined' ? window.innerWidth : 1440);
    if (width < 640) {
        return { fontSize: 10, legendFontSize: 9, titleFontSize: 12, tooltipFontSize: 12, itemGap: 4, itemWidth: 8, itemHeight: 8 };
    }
    if (width < 1024) {
        return { fontSize: 11, legendFontSize: 10, titleFontSize: 13, tooltipFontSize: 12, itemGap: 6, itemWidth: 10, itemHeight: 10 };
    }
    if (width < 1440) {
        return { fontSize: 12, legendFontSize: 11, titleFontSize: 14, tooltipFontSize: 13, itemGap: 8, itemWidth: 10, itemHeight: 10 };
    }
    return { fontSize: 13, legendFontSize: 12, titleFontSize: 14, tooltipFontSize: 14, itemGap: 10, itemWidth: 12, itemHeight: 10 };
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export const getTooltipStyle = (isDark, extra = {}) => {
    const s = getResponsiveSizes();
    return {
        trigger: 'axis',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e0e0e0',
        borderWidth: 1,
        textStyle: {
            color: isDark ? '#f1f5f9' : '#111111',
            fontSize: s.tooltipFontSize,
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
        ...extra,
    };
};

// ─── Axis ────────────────────────────────────────────────────────────────────
export const getAxisStyle = (isDark) => {
    const s = getResponsiveSizes();
    return {
        axisLine: {
            lineStyle: { color: isDark ? 'rgba(71,85,105,0.4)' : 'rgba(0,0,0,0.1)' },
        },
        splitLine: {
            lineStyle: {
                color: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(0,0,0,0.07)',
                type: 'dashed',
            },
        },
        splitNumber: 5,
        axisLabel: {
            fontSize: s.fontSize,
            fontWeight: 500,
            color: isDark ? '#cbd5e1' : '#333333',
            fontFamily: FONT_FAMILY,
        },
        nameTextStyle: {
            fontSize: s.fontSize,
            fontWeight: 500,
            color: isDark ? '#cbd5e1' : '#333333',
            fontFamily: FONT_FAMILY,
        },
    };
};

// ─── Legend ──────────────────────────────────────────────────────────────────
export const getLegendStyle = (isDark, extra = {}) => {
    const s = getResponsiveSizes();
    return {
        textStyle: {
            fontSize: s.legendFontSize,
            fontWeight: 500,
            color: isDark ? '#cbd5e1' : '#333333',
            fontFamily: FONT_FAMILY,
        },
        itemGap: s.itemGap,
        itemWidth: s.itemWidth,
        itemHeight: s.itemHeight,
        ...extra,
    };
};

// ─── Grid ────────────────────────────────────────────────────────────────────
export const getGridStyle = (overrides = {}) => ({
    left: '5%',
    right: '5%',
    bottom: '8%',
    top: '12%',
    containLabel: true,
    ...overrides,
});

// ─── Responsive x-axis helper ───────────────────────────────────────────────
// Builds a category x-axis config that auto-rotates labels when there are many.
export const getResponsiveXAxis = (isDark, labels, overrides = {}) => {
    const count = labels?.length ?? 0;
    const s = getResponsiveSizes();
    const base = getAxisStyle(isDark);
    return {
        type: 'category',
        data: labels,
        axisLine: base.axisLine,
        axisLabel: {
            ...base.axisLabel,
            fontSize: count > 20 ? Math.max(s.fontSize - 2, 9) : s.fontSize,
            rotate: count > 15 ? 45 : 0,
            overflow: 'truncate',
            width: count > 20 ? 50 : 70,
        },
        ...overrides,
    };
};

// ─── Line Series ─────────────────────────────────────────────────────────────
/**
 * Returns visual style overrides for a primary line series.
 * Includes gradient area style by default.
 */
export const getLineSeriesStyle = (color = BRAND_ORANGE, withArea = true) => {
    const rgb = hexToRgb(color);
    const base = {
        itemStyle: { color },
        lineStyle: {
            width: 3,
            color,
            shadowColor: `rgba(${rgb},0.4)`,
            shadowBlur: 8,
        },
        smooth: true,
    };
    if (withArea) {
        base.areaStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `rgba(${rgb},0.35)` },
                { offset: 1, color: `rgba(${rgb},0.05)` },
            ]),
        };
    }
    return base;
};

// ─── Bar Series ──────────────────────────────────────────────────────────────
export const getBarItemStyle = (color = BRAND_ORANGE) => ({
    color,
    borderRadius: [4, 4, 0, 0],
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Convert #rrggbb to "r,g,b" string for use in rgba() */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '13,115,119';
    return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
