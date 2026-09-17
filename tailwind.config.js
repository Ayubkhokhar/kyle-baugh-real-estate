/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-linen": "#F4F3EF",
        "surface-alabaster": "#FBFBF9",
        "canvas-white": "#FFFFFF",
        "primary": "#16181B",
        "secondary": "#BFA181",
        "tertiary": "#8C7355",
        "border-brass": "#D8C7B5",
        "border-subtle": "#E7E5DF",
        "charcoal-body": "#35383E",
        "charcoal-muted": "#6E727A",
        "status-active": "#2D5A43",
        "status-pending": "#8C7355",
        "status-sold": "#16181B",
        "primary-container": "#1a1c1f",
        "on-primary-container": "#838487",
        "tertiary-container": "#281803",
        "surface-container": "#eeeeec",
        "surface-container-low": "#f4f4f2",
        "surface-container-high": "#e8e8e6",
        "surface-container-highest": "#e2e3e1",
      },
      fontFamily: {
        "display": ["var(--font-headline, 'Playfair Display')", "'Plus Jakarta Sans'", "serif"],
        "headline": ["var(--font-headline, 'Playfair Display')", "'Plus Jakarta Sans'", "serif"],
        "sans": ["'Plus Jakarta Sans'", "sans-serif"],
        "serif": ["var(--font-headline, 'Playfair Display')", "Georgia", "serif"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.375rem",
        "xl": "0.5rem",
        "2xl": "0.75rem",
      },
      spacing: {
        "gutter": "1.5rem",
        "gutter-desktop": "2.5rem",
        "margin-desktop": "4rem",
      }
    },
  },
  plugins: [],
}
