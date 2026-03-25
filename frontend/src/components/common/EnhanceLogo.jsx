import { useTheme } from "../theme-provider";

const BRAND_TEAL = "#0d7377";
const BRAND_AMBER = "#b08347";

/**
 * SVG logo that adapts color to the current theme palette.
 * Props:
 *   - className: applied to the wrapper svg
 *   - height: svg height (default 48)
 *   - color: override brand color (for print/fixed contexts)
 *   - showTagline: show "Performance starts within" (default true)
 */
export function EnhanceLogo({ className = "", height = 48, color, showTagline = true }) {
    const { resolvedTheme } = useTheme();
    const brandColor = color || (resolvedTheme === "dark" ? BRAND_AMBER : BRAND_TEAL);
    const taglineColor = color
        ? `${color}cc`
        : resolvedTheme === "dark" ? "#b08347cc" : "#0d7377cc";

    // Content spans roughly 0–230px wide, 48px tall
    const vbWidth = showTagline ? 232 : 200;
    const scale = height / 48;
    const width = Math.round(vbWidth * scale);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${vbWidth} 48`}
            width={width}
            height={height}
            className={className}
            style={{ display: 'block' }}
            role="img"
            aria-label="Enhance — Performance starts within"
        >
            {/* Heart outline with pulse line */}
            <g transform="translate(2, 2)" fill="none" stroke={brandColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {/* Heart shape */}
                <path
                    d="M22 38 C22 38, 4 26, 4 15 C4 8, 9 3, 15 3 C18.5 3, 21 5, 22 8 C23 5, 25.5 3, 29 3 C35 3, 40 8, 40 15 C40 26, 22 38, 22 38Z"
                    strokeWidth="2.5"
                    opacity="0.35"
                />
                {/* Pulse/heartbeat line through the heart */}
                <polyline
                    points="6,22 14,22 17,14 20,28 23,18 26,24 30,22 38,22"
                    strokeWidth="2.5"
                    opacity="0.9"
                />
            </g>

            {/* "Enhance" text */}
            <text
                x="50"
                y="30"
                fontFamily="Inter, Outfit, sans-serif"
                fontWeight="800"
                fontSize="30"
                fill={brandColor}
                letterSpacing="-0.5"
            >
                Enhance
            </text>

            {/* Tagline */}
            {showTagline && (
                <text
                    x="50"
                    y="44"
                    fontFamily="Inter, Outfit, sans-serif"
                    fontWeight="700"
                    fontSize="9.5"
                    fill={taglineColor}
                    letterSpacing="0.5"
                >
                    Performance starts within
                </text>
            )}
        </svg>
    );
}
