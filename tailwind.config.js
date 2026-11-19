/** @type {import('tailwindcss').Config} */

/**
 * Theming is driven by CSS variables (see src/index.css).
 * Every colour below resolves from a variable that flips with `.dark`
 * on <html>, so a single class works in BOTH modes — no duplicated
 * `dark:` / `light:` overrides anywhere in the component tree.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Variable"', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['"JetBrains Mono Variable"', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        inset: 'rgb(var(--c-inset) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--c-line-strong) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        subtle: 'rgb(var(--c-subtle) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--c-accent-strong) / <alpha-value>)',
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem', '3xl': '1.25rem' },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        pop: 'var(--shadow-pop)',
        hair: 'inset 0 0 0 1px rgb(var(--c-line) / 1)',
      },
      animation: {
        'fade-up': 'fadeUp .45s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fadeIn .22s ease both',
        pop: 'pop .22s cubic-bezier(.22,1,.36,1) both',
        'slide-in': 'slideIn .28s cubic-bezier(.22,1,.36,1) both',
        'toast-in': 'toastIn .28s cubic-bezier(.22,1,.36,1) both',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        scan: 'scan 4.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        pop: { from: { opacity: '0', transform: 'scale(.985) translateY(3px)' }, to: { opacity: '1', transform: 'none' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'none' } },
        toastIn: { from: { opacity: '0', transform: 'translateY(8px) scale(.985)' }, to: { opacity: '1', transform: 'none' } },
        pulseRing: {
          '0%': { transform: 'scale(.85)', opacity: '.6' },
          '70%': { transform: 'scale(2.3)', opacity: '0' },
          '100%': { transform: 'scale(2.3)', opacity: '0' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-8%)', opacity: '0' },
          '12%, 88%': { opacity: '1' },
          '50%': { transform: 'translateY(104%)' },
        },
      },
    },
  },
  plugins: [],
}
