/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f3',
          100: '#ffe4e0',
          200: '#fecdc6',
          300: '#fda69b',
          400: '#fb7a6b',
          500: '#f4584a',
          600: '#dc3f36',
          700: '#b62f29',
          800: '#8f2723',
          900: '#6b1c1a',
        },
        accent: {
          50: '#f3faf6',
          100: '#dcf2e4',
          200: '#bbe3c9',
          300: '#8acea4',
          400: '#5cb27e',
          500: '#3e9663',
        },
        sand: {
          50: '#fdfaf5',
          100: '#f9f1e6',
          200: '#efe0c8',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Pretendard Variable',
          'Pretendard',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        bloom: '0 20px 60px -25px rgba(244, 88, 74, 0.35)',
        petal: '0 10px 30px -15px rgba(244, 88, 74, 0.4)',
      },
      backgroundImage: {
        'bloom-radial':
          'radial-gradient(circle at 20% 0%, #ffe4e0 0%, transparent 45%), radial-gradient(circle at 90% 10%, #fff1c6 0%, transparent 40%), radial-gradient(circle at 50% 100%, #fde2d6 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
