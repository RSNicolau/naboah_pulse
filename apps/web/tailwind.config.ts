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
            colors: {
                bg: {
                    0: "#05060A",
                    1: "#070B14",
                },
                surface: {
                    1: "#0B1220",
                    2: "#0E172A",
                },
                stroke: "#1C263A",
                text: {
                    1: "#E6EAF2",
                    2: "#AAB3C5",
                    3: "#7C879D",
                },
                primary: "#7B61FF",
                secondary: "#1E3A8A",
                ai: "#2DD4BF",
                critical: "#EF4444",
                success: "#22C55E",
                warning: "#F59E0B",
            },
            backgroundImage: {
                "jarvis-gradient": "linear-gradient(135deg, #7B61FF 0%, #1E3A8A 50%, #2DD4BF 100%)",
            },
        },
    },
    plugins: [
        animate,
    ],
    darkMode: "class",
};
export default config;
