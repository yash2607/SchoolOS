/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
