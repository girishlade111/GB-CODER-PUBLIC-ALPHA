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
      // DESIGN.md (Cursor editorial light) is the default theme; dark quiet
      // mode lives under `.dark`. All theme-aware tokens resolve via CSS vars
      // defined in src/index.css so the existing `surface-*` / `stroke-*` /
      // `content-*` / `accent-*` classes auto-switch with the toggle.
      // Light: canvas #f7f7f4, card #ffffff, ink #26251e, accent #f54e00.
      // Dark:  canvas #0d0d0d, panel #161616, text #e8e8e8, accent #e07856.
      colors: {
        // ── DESIGN.md surface ladder (lightest floor → deepest wash) ──────────
        //   canvas  #f7f7f4  warm cream page floor (never pure white)
        //   base    #ffffff  card surface, floats on cream via hairline
        //   raised  #ffffff  header/tab bars sitting on a card
        //   overlay #fafaf7  IDE pane / inset wells
        //   hover   #efeee8  hover + active wash, replaces white/NN overlays
        surface: {
          canvas: 'var(--surface-canvas)',
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          hover: 'var(--surface-hover)',
          strong: 'var(--surface-strong)',
        },
        // 3-tier hairline scale. DEFAULT sits mid so a bare `border` is the
        // canonical DESIGN.md hairline rather than the faintest divider.
        stroke: {
          soft: 'var(--stroke-soft)',
          subtle: 'var(--stroke-subtle)',
          DEFAULT: 'var(--stroke-subtle)',
          strong: 'var(--stroke-strong)',
        },
        // 4-tier warm ink scale: ink → body → muted → muted-soft.
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        // Cursor Orange #f54e00 — scarce: primary CTAs + wordmark only.
        accent: {
          subtle: 'var(--accent-subtle)',
          muted: 'var(--accent-muted)',
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          fg: 'var(--accent-fg)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle: 'var(--danger-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
        },

        // DESIGN.md signature: AI-agent timeline stage pastels.
        // Scoped to in-product agent timeline visualizations only — never
        // reuse these as system action colors.
        timeline: {
          thinking: 'var(--timeline-thinking)',
          grep: 'var(--timeline-grep)',
          read: 'var(--timeline-read)',
          edit: 'var(--timeline-edit)',
          done: 'var(--timeline-done)',
        },

        // Raw DESIGN.md palette — reference values for one-off needs where a
        // semantic token above doesn't fit. Prefer the semantic tokens.
        cursor: {
          canvas: '#f7f7f4',
          'canvas-soft': '#fafaf7',
          card: '#ffffff',
          strong: '#e6e5e0',
          ink: '#26251e',
          body: '#5a5852',
          muted: '#807d72',
          'muted-soft': '#a09c92',
          hairline: '#e6e5e0',
          'hairline-soft': '#efeee8',
          'hairline-strong': '#cfcdc4',
          primary: '#f54e00',
          'primary-active': '#d04200',
          'on-primary': '#ffffff',
          'timeline-thinking': '#dfa88f',
          'timeline-grep': '#9fc9a2',
          'timeline-read': '#9fbbe0',
          'timeline-edit': '#c0a8dd',
          'timeline-done': '#c08532',
          success: '#1f8a65',
          error: '#cf2d56',
        },

        /*
         * Panel hierarchy for VS Code mode
         */
        vsc: {
          editor: 'var(--surface-canvas)',
          sidebar: 'var(--surface-base)',
          tabbar: 'var(--surface-base)',
          panel: 'var(--surface-base)',
          border: 'var(--stroke-subtle)',
          borderStrong: 'var(--stroke-strong)',
          text: 'var(--text-primary)',
          textMuted: 'var(--text-secondary)',
          indent: 'var(--stroke-subtle)',
        },

        // VS Code Theme Colors (theme-aware via vars)
        'vscode-editor': 'var(--surface-canvas)',
        'vscode-sidebar': 'var(--surface-base)',
        'vscode-activitybar': 'var(--surface-base)',
        'vscode-panel': 'var(--surface-base)',
        'vscode-border': 'var(--stroke-subtle)',
        'vscode-selection': 'var(--vscode-selection)',
        'vscode-statusbar': 'var(--surface-base)',
        'vscode-text': 'var(--text-primary)',
        'vscode-text-dim': 'var(--text-secondary)',
        'vscode-line-highlight': 'var(--surface-overlay)',
        'vscode-hover': 'var(--surface-overlay)',
        'vscode-active': 'var(--surface-hover)',
        'vscode-focus-border': 'var(--accent)',
        'vscode-tab-inactive': 'var(--surface-base)',

        // Legacy aliases (theme-aware)
        'matte-black': 'var(--surface-canvas)',
        'bright-white': 'var(--text-primary)',
        'dark-gray': 'var(--surface-base)',
        'light-gray': 'var(--surface-hover)',
      },

      // ─── Typography ───────────────────────────────────────────────────────
      // DESIGN.md: CursorGothic (licensed) → Inter substitute for display/body,
      // JetBrains Mono on every code surface.
      fontFamily: {
        sans: [
          'Inter',
          "'CursorGothic'",
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          "'JetBrains Mono'",
          "'Fira Code'",
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

      // Dense, utilitarian developer-tool type scale + DESIGN.md display scale
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.88px' }],
        xs: ['12px', { lineHeight: '1.4' }],
        'sm-sub': ['12.5px', { lineHeight: '1.4' }],
        sm: ['13.5px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.4' }],
        lg: ['18px', { lineHeight: '1.3' }],
        xl: ['20px', { lineHeight: '1.25' }],
        '2xl': ['22px', { lineHeight: '1.2', letterSpacing: '-0.11px' }],
        'display-sm': ['22px', { lineHeight: '1.3', letterSpacing: '-0.11px' }],
        'display-md': ['26px', { lineHeight: '1.25', letterSpacing: '-0.325px' }],
        'display-lg': ['36px', { lineHeight: '1.2', letterSpacing: '-0.72px' }],
        'display-mega': ['72px', { lineHeight: '1.1', letterSpacing: '-2.16px' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      // 4px base unit. `section` carries the 80px editorial band rhythm.
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        section: '80px',
        'sidebar-collapsed': '52px',
        'sidebar-expanded': '260px',
      },

      // ─── Radius ───────────────────────────────────────────────────────────
      // DESIGN.md: 4px inline tags · 6px compact rows · 8px CTAs & inputs ·
      // 12px cards & IDE panes · 16px large · pill for timeline pills/badges.
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '16px',
        pill: '9999px',
      },

      borderColor: {
        DEFAULT: 'var(--stroke-subtle)',
      },

      // No elevation shadows — depth comes from 1px warm hairline + white-on-
      // cream contrast only (DESIGN.md "hairline-only depth").
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
