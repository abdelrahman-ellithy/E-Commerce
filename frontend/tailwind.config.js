/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe8ff',
          200: '#bfd6ff',
          300: '#93bbff',
          400: '#6096ff',
          500: '#3b76f6',
          600: '#2458eb',
          700: '#1d46d8',
          800: '#1e3caf',
          900: '#1e388a',
          950: '#172554',
        },
        ink: '#0b1220',
        cream: '#f7f3eb',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -32px rgba(15, 23, 42, 0.35)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 16px 40px -28px rgba(15, 23, 42, 0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
