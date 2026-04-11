/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1B3A6B",
        accent: "#2E7DD1",
        background: "#F5F7FA",
        surface: "#FFFFFF",
        error: "#B91C1C",
        warning: "#D4600A",
        success: "#1A7A4A",
        "text-primary": "#1A1A2E",
        "text-secondary": "#4A4A6A",
      },
    },
  },
  plugins: [],
};
