/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ─── Responsive breakpoints ───────────────────────────────────────────
      // Added alongside (not replacing) Tailwind's defaults, so every existing
      // `sm:`/`md:`/`lg:`/`xl:` class in the codebase keeps its current
      // meaning and the desktop rendering is unaffected.
      //
      //   mobile  ≤ 640px
      //   tablet  641px – 1024px
      //   compact ≤ 1024px   (mobile + tablet — the single-column range)
      //   desktop ≥ 1025px   (today's layout, must stay pixel-identical)
      //
      // `compact` and `desktop` are exact complements, so a rule written for
      // one can never bleed into the other.
      screens: {
        mobile: { max: '640px' },
        tablet: { min: '641px', max: '1024px' },
        compact: { max: '1024px' },
        desktop: { min: '1025px' },
      },

      // ─── Color palette ────────────────────────────────────────────────────
      // Quiet dark mode: near-black #0d0d0d canvas, #161616 panel/card surface,
      // #1c1c1c secondary surface, #2a2a2a hairline borders, off-white #e8e8e8 text,
      // muted secondary #8a8a8a, faint #5c5c5c, warm terracotta #e07856 accent,
      // muted green #3ecf5e success, muted red #e5484d danger. Zero neon, zero pure white.
      colors: {
        surface: {
          canvas: '#0d0d0d', // base background (near-black)
          base: '#161616', // panel/card background
          raised: '#161616', // panel/card background
          overlay: '#1c1c1c', // secondary surface / inputs / buttons / hover
          hover: '#242424', // panel hover / active surfaces
        },
        stroke: {
          subtle: '#2a2a2a', // hairline divider / border
          DEFAULT: '#2a2a2a',
          strong: '#3a3a3a', // subtle emphasis border
        },
        content: {
          primary: '#e8e8e8', // primary text (off-white, never pure #fff)
          secondary: '#8a8a8a', // secondary text / sublabels / category headers
          muted: '#5c5c5c', // faint / disabled text / placeholders
        },
        accent: {
          subtle: 'rgba(224, 120, 86, 0.12)',
          muted: '#c86343',
          DEFAULT: '#e07856', // warm burnt-orange / terracotta
          hover: '#e88a6d',
          fg: '#e8e8e8',
        },
        success: {
          DEFAULT: '#3ecf5e', // muted green
          subtle: 'rgba(62, 207, 94, 0.12)',
        },
        danger: {
          DEFAULT: '#e5484d', // muted red
          subtle: 'rgba(229, 72, 77, 0.12)',
        },

        /*
         * Panel hierarchy for VS Code mode
         */
        vsc: {
          editor: '#0d0d0d',
          sidebar: '#161616',
          tabbar: '#161616',
          panel: '#161616',
          border: '#2a2a2a',
          borderStrong: '#3a3a3a',
          text: '#e8e8e8',
          textMuted: '#8a8a8a',
          indent: '#2a2a2a',
        },

        // VS Code Dark Theme Colors
        'vscode-editor': '#0d0d0d',
        'vscode-sidebar': '#161616',
        'vscode-activitybar': '#161616',
        'vscode-panel': '#161616',
        'vscode-border': '#2a2a2a',
        'vscode-selection': '#2a2a2a',
        'vscode-statusbar': '#161616',
        'vscode-text': '#e8e8e8',
        'vscode-text-dim': '#8a8a8a',
        'vscode-line-highlight': '#1c1c1c',
        'vscode-hover': '#1c1c1c',
        'vscode-active': '#242424',
        'vscode-focus-border': '#e07856',
        'vscode-tab-inactive': '#161616',

        // Legacy aliases
        'matte-black': '#0d0d0d',
        'bright-white': '#e8e8e8',
        'dark-gray': '#161616',
        'light-gray': '#242424',
      },

      // ─── Typography ───────────────────────────────────────────────────────
      // Pure system-ui stack — no custom webfont, no serif, no display font.
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },

      // Dense, utilitarian developer-tool type scale
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs: ['12px', { lineHeight: '1.4' }],
        'sm-sub': ['12.5px', { lineHeight: '1.4' }],
        sm: ['13.5px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.4' }],
        lg: ['18px', { lineHeight: '1.3' }],
        xl: ['20px', { lineHeight: '1.25' }],
        '2xl': ['22px', { lineHeight: '1.2' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        'sidebar-collapsed': '52px',
        'sidebar-expanded': '260px',
      },

      // ─── Radius ───────────────────────────────────────────────────────────
      // 8px cards · 6px buttons/inputs · 4px small badges/tags.
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
      },

      borderColor: {
        DEFAULT: '#2a2a2a',
      },

      // No elevation shadows — depth comes from 1px #2a2a2a border and background contrast only
      boxShadow: {
        none: 'none',
        elevated: 'none',
        'elevated-lg': 'none',
        'vscode-widget': 'none',
        'vscode-modal': 'none',
        'vscode-toolbar': 'none',
        'inner-subtle': 'none',
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
        // Voice command overlay: waveform bars and the pulsing mic halo.
        'voice-wave': {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'voice-ring': {
          '0%': { opacity: '0.5', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.9)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'voice-wave': 'voice-wave 900ms ease-in-out infinite',
        'voice-ring': 'voice-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
