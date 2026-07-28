/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  theme: {
    extend: {
      colors: {
        charcoal: '#2D5016',
        gold: '#8B6914',
        'gold-light': '#A87A20',
        cream: '#F7F4EF',
        'cream-dark': '#EEE9E1',
        slate: '#2C2C2A',
        'slate-light': '#6B6560',
        'muted-green': '#2D5016',
        'muted-green-bg': '#EEF4E8',
        error: '#9B2335',
        border: '#D4CCC0',
      },

      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        display: ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h1: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        h2: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h3: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        body: ['1rem', { lineHeight: '1.7' }],
        small: ['0.875rem', { lineHeight: '1.6' }],
      },

      spacing: {
        section: '80px',
      },

      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        // Deliberately no pill/full — see design rationale
      },

      boxShadow: {
        card: '0 2px 8px rgba(28, 28, 30, 0.08), 0 1px 3px rgba(28, 28, 30, 0.06)',
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
};
