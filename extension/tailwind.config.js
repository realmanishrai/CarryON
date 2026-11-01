/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        carryon: {
          bg: "#0B0D12",
          surface: "#121620",
          elevated: "#191F2B",
          border: "#293244",
          accent: "#8B7CFF",
          cyan: "#36CFC9",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        }
      }
    },
  },
  plugins: [],
}
