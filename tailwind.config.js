/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#9929EA',
          'purple-hover': '#821ecc',
          'purple-glow': 'rgba(153, 41, 234, 0.15)',
          'purple-soft': 'rgba(153, 41, 234, 0.08)',
          green: '#08CB00',
          'green-glow': 'rgba(8, 203, 0, 0.15)',
          'green-soft': 'rgba(8, 203, 0, 0.08)',
          red: '#EF4444',
          'red-glow': 'rgba(239, 68, 68, 0.15)',
          'red-soft': 'rgba(239, 68, 68, 0.08)',
          amber: '#F59E0B',
          'amber-glow': 'rgba(245, 158, 11, 0.15)',
          'amber-soft': 'rgba(245, 158, 11, 0.08)',
          bg: '#000000',
          'bg-secondary': '#080808',
          'card': '#0D0D0D',
          'card-hover': '#111111',
          'elevated': '#121212',
          'border': '#242424',
          'border-light': '#2F2F2F',
          'text-primary': '#FFFFFF',
          'text-secondary': '#A1A1AA',
          'text-muted': '#66666F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(153, 41, 234, 0.25)',
        'glow-green': '0 0 25px -5px rgba(8, 203, 0, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
      }
    },
  },
  plugins: [],
}


