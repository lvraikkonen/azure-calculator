/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 使用class策略实现深色模式
  theme: {
    extend: {
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-out': 'fadeInOut 3s ease-in-out',
        'highlight': 'highlight 2s ease-in-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
        fadeInOut: {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        highlight: {
          '0%': { backgroundColor: 'rgb(219 234 254)' }, // bg-blue-100
          '100%': { backgroundColor: 'transparent' },
        }
      },
    },
  },
  plugins: [],
}