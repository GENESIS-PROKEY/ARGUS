import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        argus: {
          bg: { deep: '#0a0e1a', DEFAULT: '#0f1729', light: '#141b2d' },
          card: { DEFAULT: '#141b2d', hover: '#1a2234', border: '#1e293b' },
          accent: { cyan: '#00d4ff', teal: '#06b6d4', purple: '#7c3aed', violet: '#8b5cf6' },
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#f43f5e',
          text: { primary: '#ffffff', secondary: '#94a3b8', muted: '#64748b' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'scan-line': 'scanLine 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.1)' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
