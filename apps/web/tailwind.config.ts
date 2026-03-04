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
                critical:  "#EF4444",
                success:   "#22C55E",
                warning:   "#F59E0B",
            },
            backgroundImage: {
                "jarvis-gradient": "linear-gradient(135deg, #7B61FF 0%, #4F46E5 55%, #2DD4BF 100%)",
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
                "card-hover": "0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
                "glow-primary": "0 0 24px rgba(123,97,255,0.2)",
            },
        },
    },
    plugins: [animate],
    darkMode: "class",
};
export default config;
