import type { Config } from "tailwindcss";

// Color tokens mirror docs/DESIGN_SYSTEM.md — evolved for the art-directed Ghanaian culinary brand.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Legacy Aliases (preserved for existing UI)
        bg: "#17110D",
        surface: "#241A13",
        surface2: "#2C2117",
        line: "#3A2C1F",
        gold: "#C9A24C",
        "gold-soft": "#E7CE96",
        "bg-light": "#F8F0DF",
        ok: "#7FAE78",
        warn: "#D08277",

        // Evolved Brand Palette Tokens
        brand: {
          espresso: "#17110D",
          "espresso-light": "#241A13",
          cream: "#F8F0DF",
          "cream-light": "#FAF5EB",
          "cream-dark": "#EDE2CB",
          red: "#A91D1D",
          "red-dark": "#881515",
          "red-light": "#C32B2B",
          gold: "#C9A24C",
          "gold-soft": "#E7CE96",
          yellow: "#F2B632",
          "yellow-dark": "#D6991D",
          "yellow-light": "#FCD975",
          orange: "#E87524",
        },
        ink: {
          dark: "#F6EFE4",
          light: "#17110D",
          dim: "#B7AA98",
          "dim-light": "#6E5D4F",
          "on-cream": "#231A12",
          DEFAULT: "#F6EFE4",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        pill: "9999px",
        "3xl": "28px",
      },
      boxShadow: {
        "gold-glow": "0 0 25px -4px rgba(201, 162, 76, 0.4)",
        "red-glow": "0 0 30px -5px rgba(169, 29, 29, 0.5)",
        "food-depth": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        "card-elevation": "0 10px 30px -8px rgba(23, 17, 13, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
