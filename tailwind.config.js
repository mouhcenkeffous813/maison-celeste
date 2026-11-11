/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        store: {
          primary: 'var(--color-primary, #D48C98)',
          'primary-hover': 'var(--color-primary-hover, #C37985)',
          'primary-light': 'var(--color-primary-light, #FDF4F5)',
          'primary-dark': 'var(--color-primary-dark, #A25B67)',
          secondary: 'var(--color-secondary, #F9F1F0)',
          base: 'var(--color-bg-base, #FFFDFB)',
          surface: '#FFFFFF',
          text: 'var(--color-text-main, #2B2B2B)',
          muted: '#737373',
          border: '#F0E6E5',
          accent: 'var(--color-accent, #E05A6D)',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 25px -4px rgba(212, 140, 152, 0.12)',
        'luxury': '0 10px 40px -10px rgba(43, 43, 43, 0.08), 0 2px 10px -2px rgba(212, 140, 152, 0.1)',
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(212, 140, 152, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.96' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

