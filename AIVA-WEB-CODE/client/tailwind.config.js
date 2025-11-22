/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slower': 'spin 20s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
        'border-flow': 'border-flow 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.5'
          },
          '50%': { 
            transform: 'translate(2%, -2%) scale(1.05)',
            opacity: '0.3'
          }
        },
        'border-flow': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        }
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 