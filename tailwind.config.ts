import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Legacy Aliases (preserved for existing store components)
        bg: "#18110E",
        surface: "#251C18",
        surface2: "#2E231E",
        line: "#3D302A",
        gold: "#F5A623",
        "gold-soft": "#F2CE8A",
        "bg-light": "#FAF5EE",
        ok: "#6B8E67",
        warn: "#C46558",

        // Art-Directed Visual Brand System (Inspired by Reference Images)
        brand: {
          // Deep red / burgundy for Hero and primary feature blocks
          red: "#9E1B15",
          "red-dark": "#7C130E",
          "red-light": "#B8251E",
          "red-accent": "#D32F2F",

          // Warm cream / off-white for main content areas
          cream: "#FAF5EE",
          "cream-light": "#FFFDF9",
          "cream-dark": "#EFE6D8",

          // Vibrant golden yellow for CTAs, prices, and highlight blocks
          yellow: "#F5A623",
          "yellow-dark": "#D98E16",
          "yellow-light": "#F8C158",
          gold: "#F5A623",

          // Deep charcoal / near-black for dark sections and high contrast
          dark: "#18110E",
          charcoal: "#1F1512",
          espresso: "#18110E",
          "dark-surface": "#241A16",

          // Pure white for cards and floating containers
          white: "#FFFFFF",

          // Restrained earth / terracotta tones
          terracotta: "#A8362B",
          sand: "#EFE5D5",
          muted: "#6E6259",
        },
        ink: {
          dark: "#FFFFFF",
          light: "#18110E",
          dim: "#A39587",
          "dim-light": "#6E6259",
          "on-cream": "#18110E",
          DEFAULT: "#FFFFFF",
        },
      },
      fontFamily: {
        display: ["Syne", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        "card-depth": "0 12px 32px -4px rgba(24, 17, 14, 0.08), 0 4px 12px -2px rgba(24, 17, 14, 0.04)",
        "food-depth": "0 28px 56px -12px rgba(0, 0, 0, 0.45)",
        "button-yellow": "0 6px 20px -2px rgba(245, 166, 35, 0.4)",
        "button-red": "0 6px 20px -2px rgba(158, 27, 21, 0.35)",
        "warm-sm": "0 2px 8px -2px rgba(24, 17, 14, 0.06)",
        "warm-md": "0 8px 24px -4px rgba(24, 17, 14, 0.10)",
        "warm-lg": "0 16px 40px -8px rgba(24, 17, 14, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
