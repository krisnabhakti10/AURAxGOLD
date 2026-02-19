import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        dark: {
          50:  "#f8f8f8",
          100: "#e8e8e8",
          200: "#c0c0c0",
          300: "#888888",
          400: "#555555",
          500: "#333333",
          600: "#222222",
          700: "#1a1a1a",
          800: "#111111",
          900: "#0a0a0a",
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)",
        "dark-gradient":
          "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at top, #1a1200 0%, #0a0a0a 60%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 20px rgba(245,158,11,0.3)",
        "gold-lg": "0 0 40px rgba(245,158,11,0.2)",
      },
      animation: {
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(245,158,11,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(245,158,11,0.6)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
