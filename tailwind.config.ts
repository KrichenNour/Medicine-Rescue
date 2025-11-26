import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#008080", 
        "primary-dark": "#006666",
        "accent": "#4A90E2",
        "background-light": "#F5F7FA",
        "background-dark": "#102222",
        "surface-light": "#ffffff",
        "surface-dark": "#1A2E2E",
        "text-light": "#111818",
        "text-dark": "#E0E0E0",
        "text-muted": "#618989",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
      }
    },
  },
  plugins: [],
}
export default config