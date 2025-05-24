/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'draft-bg': '#0a0e1a',
        'draft-card': '#1a1f2e',
        'draft-border': '#2a3441',
        'draft-cell': '#141922',
        'position-qb': '#fb923c',
        'position-rb': '#34d399',
        'position-wr': '#60a5fa',
        'position-te': '#f472b6',
        'draft-yellow': '#fbbf24',
      }
    },
  },
  plugins: [],
}