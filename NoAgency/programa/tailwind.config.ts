import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#FFFFFF",
        "ink-2": "#F5F4F2",
        "ink-3": "#EEEBE8",
        "ink-4": "#E2DED9",
        cream: "#1A1918",
        "cream-2": "#3A3836",
        stone: "#7A7773",
        "stone-2": "#5A5755",
        signal: "#D64045",
        "signal-dark": "#B8353A",
        green: "#10B981",
        "green-dark": "#059669",
        amber: "#F59E0B",
        blue: "#6366F1",
        border: "rgba(0,0,0,0.07)",
        "border-light": "#E2DED9",
        "ink-border": "#D5D2CE",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12)",
        modal: "0 20px 60px rgba(0,0,0,0.18)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
