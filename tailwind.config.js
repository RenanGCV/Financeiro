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
        dark: {
          primary: '#0D0D0D',
          secondary: '#1A1A1A',
          card: '#262626',
          cardHover: '#333333',
          border: '#404040',
        },
        accent: {
          gold: '#FFD580',
          orange: '#FF8C42',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E0E0E0',
          muted: '#A0A0A0',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 213, 128, 0.1)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow-lg': '0 8px 25px rgba(255, 213, 128, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}
