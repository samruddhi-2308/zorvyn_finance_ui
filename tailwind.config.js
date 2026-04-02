/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        card: 'var(--radius-card)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      colors: {
        brand: 'var(--color-primary)',
        surface: 'var(--color-surface)',
        background: 'var(--color-background)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
      },
    },
  },
  plugins: [],
}
