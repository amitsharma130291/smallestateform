/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  theme: {
    extend: {
      colors: {
        charcoal: '#1C1C1E',
        gold: '#B8860B',
        'gold-light': '#D4A017',
        cream: '#FAF8F5',
        'cream-dark': '#F0EDE8',
        slate: '#3D3D3D',
        'slate-light': '#6B6B6B',
        'muted-green': '#4A7C59',
        'muted-green-bg': '#EFF7F2',
        error: '#9B2335',
        border: '#E5E0D8',
      },

      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
