export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f8efe4',
        parchment: '#fbf2e6',
        lake: '#355d85',
        rust: '#c75b3d',
        moss: '#6b8b7f',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(23, 23, 23, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        parchment: 'radial-gradient(circle at top left, rgba(255,255,255,0.9), rgba(248,239,228,0.95) 48%, rgba(245,232,211,0.95))',
      },
    },
  },
  plugins: [],
};
