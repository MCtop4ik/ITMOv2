/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        porcelain: '#F7FAFB',
        indigo: '#1A2E66',
        butter: '#FFD86A',
        copper: '#B86B4B',
        sage: '#7FA39C',
        charcoal: '#2E2E2E',
        flour: '#F3E9DC',
        dough: '#EAD7C2',
        crust: '#CFA178',
      },
      fontFamily: {
        bricolage: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        spectral: ['Spectral', 'Georgia', 'serif'],
      },
      maxWidth: {
        prose: '72ch',
        wide: '1200px',
      },
      keyframes: {
        steam: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '20%': { opacity: '0.25' },
          '60%': { opacity: '0.15' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        flourSpeck: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.06' },
          '50%': { opacity: '0.1' },
          '100%': { transform: 'translateY(-4px) scale(1.03)', opacity: '0.06' },
        },
      },
      animation: {
        steam: 'steam 6s ease-out forwards',
        none: 'none',
        flourSpeck: 'flourSpeck 8s ease-in-out infinite',
      },
    },
  },
}
