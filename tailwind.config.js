/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep space / ops-center background layers
        void: {
          DEFAULT: '#080B12',
          panel: '#0F1420',
          raised: '#161C2C',
          border: '#232B3D',
        },
        // Signal orange — the "radar alert" accent
        signal: {
          DEFAULT: '#FF6B35',
          dim: '#B84A24',
          glow: '#FF8F5E',
        },
        // Terminal cyan — verified / success / online states
        terminal: {
          DEFAULT: '#00E5C7',
          dim: '#0A9A87',
        },
        // Rank gold — leaderboard #1
        rankgold: '#FFC857',
        slate: {
          text: '#8B95A7',
          bright: '#E8ECF3',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-texture':
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'radar-sweep':
          'conic-gradient(from 0deg, transparent 0%, rgba(255,107,53,0.55) 8%, transparent 12%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        blip: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        sweep: 'sweep 2.4s linear infinite',
        blip: 'blip 1.8s ease-in-out infinite',
        rise: 'rise 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
