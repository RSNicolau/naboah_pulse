import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
            },
            colors: {
                bg: {
                    0: "#070A10",
                    1: "#0A0E18",
                },
                surface: {
                    1: "#0E1422",
                    2: "#121929",
                    3: "#161D30",
                },
                stroke:    "#1A2336",
                text: {
                    1: "#E8ECF4",
                    2: "#A8B2C6",
                    3: "#6B7894",
                },
                primary:   "#7B61FF",
                secondary: "#1E3A8A",
                ai:        "#2DD4BF",
                "ai-accent": "#818CF8",
                "ai-glow":   "#6366F1",
                info:      "#38BDF8",
                critical:  "#EF4444",
                success:   "#22C55E",
                warning:   "#F59E0B",
            },
            backgroundImage: {
                "jarvis-gradient": "linear-gradient(135deg, #7B61FF 0%, #4F46E5 55%, #2DD4BF 100%)",
                "page-gradient": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(123,97,255,0.15) 0%, rgba(79,70,229,0.08) 40%, transparent 70%)",
                "sidebar-gradient": "linear-gradient(180deg, rgba(123,97,255,0.03) 0%, transparent 40%)",
                "kpi-shimmer": "linear-gradient(135deg, rgba(123,97,255,0.08) 0%, rgba(45,212,191,0.05) 100%)",
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
                "card-hover": "0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
                "card-premium": "0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px -4px rgba(0,0,0,0.3)",
                "glow-primary": "0 0 24px rgba(123,97,255,0.2)",
                "glow-ai": "0 0 20px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.05)",
                "glow-success": "0 0 16px rgba(34,197,94,0.15)",
                "glow-critical": "0 0 16px rgba(239,68,68,0.15)",
                "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.04)",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "slide-in-right": {
                    "0%": { opacity: "0", transform: "translateX(16px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                "shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 16px rgba(123,97,255,0.1)" },
                    "50%": { boxShadow: "0 0 32px rgba(123,97,255,0.25)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out",
                "slide-in-right": "slide-in-right 0.3s ease-out",
                "scale-in": "scale-in 0.2s ease-out",
                "shimmer": "shimmer 2s linear infinite",
                "pulse-glow": "pulse-glow 3s ease-in-out infinite",
            },
        },
    },
    plugins: [animate],
    darkMode: "class",
};
export default config;
