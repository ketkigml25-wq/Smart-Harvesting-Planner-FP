/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gov-green': '#14532D',
        'gov-green-dark': '#0B331B',
        'gov-green-light': '#1E6E3D',
        'gov-navy': '#0F2A44',
        'gov-navy-dark': '#081726',
        'gov-navy-light': '#193F63',
        'gov-gold': '#B8892B',
        'gov-gold-light': '#D4A347',
        'gov-cream': '#F6F4EC',
        'gov-saffron': '#FF9933',
        'gov-white': '#FFFFFF',
        'gov-tri-green': '#138808',
        'signal-green': '#16A34A',
        'signal-green-bg': '#DCFCE7',
        'signal-green-border': '#86EFAC',
        'signal-amber': '#D97706',
        'signal-amber-bg': '#FEF3C7',
        'signal-amber-border': '#FCD34D',
        'signal-red': '#DC2626',
        'signal-red-bg': '#FEE2E2',
        'signal-red-border': '#FCA5A5',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', '"Noto Serif Devanagari"', 'serif'],
        sans: ['Poppins', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(15, 42, 68, 0.08), 0 1px 4px -1px rgba(15, 42, 68, 0.04)',
        'card-hover': '0 8px 20px -2px rgba(15, 42, 68, 0.12), 0 3px 6px -2px rgba(15, 42, 68, 0.06)',
      },
      borderRadius: {
        'card': '10px',
      }
    },
  },
  plugins: [],
}
