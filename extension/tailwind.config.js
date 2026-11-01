/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      colors: {
        carryon: {
          bg: "#050D19",
          card: "#0B1726",
          surface: "#0B1726",
          header: "#071220",
          nav: "#081524",
          border: "#1A2B42",
          accent: "#00D9F5",
          "accent-blue": "#078BFF",
          cyan: "#00D9F5",
          success: "#00DB85",
          highlight: "#FFD500",
          warning: "#F59E0B",
          error: "#EF4444",
          text: "#F4F8FF",
          "text-secondary": "#94A3B8",
          muted: "#64748B"
        }
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-2%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        wave: 'wave 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
