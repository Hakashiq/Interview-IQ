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
        ghost: {
          void: "#00050a",
          ice: "#d6eaff",
          paper: "#f5f5f5",
          blue: {
            DEFAULT: "#007dff",
            hover: "#005bbb",
          },
          heat: "#ff5517",
          alert: "#9f0712",
        },
        porcelain: {
          50: '#f5f5f5',
          100: '#ececed',
          200: '#e5e7eb',
          300: '#d1d5db',
        },
        primary: {
          50: '#eef7ff',
          100: '#d6eaff',
          200: '#b4daff',
          300: '#7ec0ff',
          400: '#3c9eff',
          500: '#007dff',
          600: '#0062d6',
          700: '#004eb0',
          800: '#044291',
          900: '#093976',
          950: '#00050a',
        },
        surface: {
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#ebeef3',
          300: '#dbe2ec',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#1e293b',
          800: '#0c1524',
          900: '#00050a',
          950: '#000307',
        },
      },
      fontFamily: {
        display: ['var(--font-archivo)', 'Archivo', 'sans-serif'],
        ui: ['var(--font-archivo-narrow)', 'Archivo Narrow', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-archivo-narrow)', 'Archivo Narrow', 'sans-serif'],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.04), 0 1px 4px -2px rgba(0, 0, 0, 0.04)',
        'ghost-glow': '0 0 35px -5px rgba(0, 125, 255, 0.25)',
        'ghost-ice': '0 0 25px -5px rgba(214, 234, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulse 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
