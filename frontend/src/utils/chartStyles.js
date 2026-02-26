import * as echarts from 'echarts';

// ─── Brand Palette ───────────────────────────────────────────────────────────
export const BRAND_ORANGE = '#ff7a00';
export const SECONDARY_BLUE = '#1f77b4';

// ─── Typography ──────────────────────────────────────────────────────────────
export const FONT_FAMILY = 'Inter, Outfit, sans-serif';

// ─── Tooltip ─────────────────────────────────────────────────────────────────
/**
 * Returns a standardised tooltip config.
 * Always white background in light mode; dark card in dark mode.
 */
export const getTooltipStyle = (isDark, extra = {}) => ({
    trigger: 'axis',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e0e0e0',
    borderWidth: 1,
    textStyle: {
        color: isDark ? '#f1f5f9' : '#111111',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
    },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    ...extra,
});

// ─── Axis ────────────────────────────────────────────────────────────────────
export const getAxisStyle = (isDark) => ({
    axisLine: {
        lineStyle: { color: isDark ? '#475569' : '#888888' },
    },
    splitLine: {
        lineStyle: { color: isDark ? '#1e293b' : '#e5e5e5' },
    },
    axisLabel: {
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? '#cbd5e1' : '#333333',
        fontFamily: FONT_FAMILY,
    },
    nameTextStyle: {
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? '#cbd5e1' : '#333333',
        fontFamily: FONT_FAMILY,
    },
});

// ─── Legend ──────────────────────────────────────────────────────────────────
export const getLegendStyle = (isDark, extra = {}) => ({
    textStyle: {
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? '#cbd5e1' : '#333333',
        fontFamily: FONT_FAMILY,
    },
    ...extra,
});

// ─── Grid ────────────────────────────────────────────────────────────────────
export const getGridStyle = (overrides = {}) => ({
    left: '5%',
    right: '5%',
    bottom: '8%',
    top: '12%',
    containLabel: true,
    ...overrides,
});

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
    if (!result) return '255,122,0';
    return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
