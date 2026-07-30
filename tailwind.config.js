/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ─── Color palette ────────────────────────────────────────────────────
      // Modern dev-tool dark theme: near-black canvas, layered surfaces that
      // step up as elements lift off the page, one accent, muted secondary
      // text, and low-contrast strokes instead of harsh borders.
      colors: {
        surface: {
          canvas: '#0a0a0a', // page background
          base: '#111111', // panel bodies
          raised: '#18181b', // cards, modals — visually lifts off the canvas
          overlay: '#1f1f23', // inputs, nested cards, hover surfaces
          hover: '#27272a', // pressed/active surfaces
        },
        stroke: {
          subtle: '#27272a', // default divider between cards/panels
          DEFAULT: '#27272a',
          strong: '#3f3f46', // emphasised borders (focus, selected)
        },
        content: {
          primary: '#fafafa', // headings, active text
          secondary: '#a1a1aa', // body/muted secondary text
          muted: '#71717a', // captions, disabled, placeholders
        },
        accent: {
          subtle: 'rgba(124, 58, 237, 0.12)',
          muted: '#6d28d9',
          DEFAULT: '#7c3aed',
          hover: '#8b5cf6',
          fg: '#ffffff',
        },

        // VS Code Dark Theme Colors (retained for compatibility)
        'vscode-editor': '#0a0a0a',
        'vscode-sidebar': '#18181b',
        'vscode-activitybar': '#111111',
        'vscode-panel': '#111111',
        'vscode-border': '#27272a',
        'vscode-selection': '#3f3f46',
        'vscode-statusbar': '#7c3aed',
        'vscode-text': '#fafafa',
        'vscode-text-dim': '#a1a1aa',
        'vscode-line-highlight': '#18181b',
        'vscode-hover': '#1f1f23',
        'vscode-active': '#27272a',
        'vscode-focus-border': '#7c3aed',
        'vscode-tab-inactive': '#111111',

        // Legacy aliases — repointed at the new palette so the existing
        // markup picks up the refreshed theme without renaming every class.
        'matte-black': '#0a0a0a',
        'bright-white': '#fafafa',
        'dark-gray': '#18181b',
        'light-gray': '#e4e4e7',
      },

      // ─── Typography ───────────────────────────────────────────────────────
      // Inter for UI chrome, JetBrains Mono for code (both loaded in index.css).
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },

      // 5-step scale. 1.5 line-height for body copy, 1.2 for headings.
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.2' }],
        xl: ['24px', { lineHeight: '1.2' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      // Tailwind's default scale is already a 4px base unit
      // (1=4 · 2=8 · 3=12 · 4=16 · 6=24 · 8=32). These named aliases make the
      // intended steps explicit so new markup reaches for the scale, not
      // arbitrary values.
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        'sidebar-collapsed': '52px',
        'sidebar-expanded': '208px',
      },

      // ─── Radius ───────────────────────────────────────────────────────────
      // 8px cards/modals · 6px buttons/inputs · 4px small tags/badges.
      // `xl`/`2xl` are retargeted to 8px so existing card and modal markup
      // lands on the new scale without a per-file rename.
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
      },

      borderColor: {
        // Elements using a bare `border` class default to the subtle stroke
        // instead of Tailwind's light gray-200.
        DEFAULT: '#27272a',
      },

      boxShadow: {
        // Card/modal elevation — lifts a surface off the canvas.
        elevated: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
        'vscode-widget': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'vscode-modal': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'vscode-toolbar': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'inner-subtle': 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
