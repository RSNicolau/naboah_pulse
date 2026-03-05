/** Shared recharts theme for dark premium dashboards */

export const CHART_COLORS = {
    primary: "#7B61FF",
    secondary: "#4F46E5",
    ai: "#2DD4BF",
    aiAccent: "#818CF8",
    info: "#38BDF8",
    success: "#22C55E",
    warning: "#F59E0B",
    critical: "#EF4444",
    muted: "#6B7894",
} as const;

export const CHART_PALETTE = [
    CHART_COLORS.primary,
    CHART_COLORS.ai,
    CHART_COLORS.aiAccent,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.critical,
];

export const axisStyle = {
    tick: { fill: "#6B7894", fontSize: 11 },
    axisLine: { stroke: "#1A2336" },
    tickLine: false as const,
};

export const gridStyle = {
    stroke: "#1A2336",
    strokeDasharray: "3 3",
};

export const tooltipStyle = {
    contentStyle: {
        background: "#0E1422",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        padding: "8px 12px",
        fontSize: 12,
    },
    labelStyle: { color: "#A8B2C6", fontWeight: 500, marginBottom: 4 },
    itemStyle: { color: "#E8ECF4", fontSize: 12 },
    cursor: { stroke: "rgba(123,97,255,0.3)" },
};

export const areaGradient = (id: string, color: string) => ({
    id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
    stops: [
        { offset: "0%", color, opacity: 0.3 },
        { offset: "100%", color, opacity: 0.02 },
    ],
});
