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
      // DESIGN.md warm-canvas editorial system. Six surface modes:
      //   cream canvas → cream card → dark product → cream → coral → dark footer
      //
      // All theme-aware tokens resolve via CSS vars defined in src/index.css so
      // every existing `surface-*` / `stroke-*` / `content-*` / `accent-*` /
      // `product-*` class resolves without touching its call site.
      colors: {
        // ── The cream ladder (lightest floor → deepest wash) ────────────────
        //   canvas  #faf9f5  warm cream page floor — never pure white
        //   base    #f5f0e8  surface-soft: sidebar + panel chrome
        //   raised  #ffffff  tab bars, popovers, modals
        //   overlay #efe9de  surface-card: inset wells, content cards
        //   hover   #eee8dc  hover + active wash
        //   strong  #e8e0d2  surface-cream-strong: badge / tag fill
        surface: {
          canvas: 'var(--surface-canvas)',
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          hover: 'var(--surface-hover)',
          strong: 'var(--surface-strong)',
        },

        // ── Dark product surfaces ──────────────────────────────────────────
        // DESIGN.md puts the product's own chrome — code editors, terminal
        // output, model panels — on a dark warm-navy. This is where the app
        // shows itself rather than describing itself, and it is the only mode
        // that gets depth from contrast instead of hairlines.
        product: {
          DEFAULT: 'var(--product)',
          elevated: 'var(--product-elevated)',
          soft: 'var(--product-soft)',
          border: 'var(--product-border)',
          'border-strong': 'var(--product-border-strong)',
          hover: 'var(--product-hover)',
          active: 'var(--product-active)',
        },

        // 3-tier hairline scale. DEFAULT sits mid so a bare `border` is the
        // canonical DESIGN.md hairline rather than the faintest divider.
        stroke: {
          soft: 'var(--stroke-soft)',
          subtle: 'var(--stroke-subtle)',
          DEFAULT: 'var(--stroke-subtle)',
          strong: 'var(--stroke-strong)',
          dark: 'var(--product-border)',
          'dark-strong': 'var(--product-border-strong)',
        },

        // 4-tier warm ink scale: ink → body → muted → muted-soft, plus the two
        // on-dark tints for the product surfaces.
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
          'on-dark': 'var(--text-on-dark)',
          'on-dark-soft': 'var(--text-on-dark-soft)',
        },

        // Warm coral #cc785c — scarce: primary CTAs, full-bleed callouts and
        // the wordmark accent. Never a surface for anything else.
        accent: {
          subtle: 'var(--accent-subtle)',
          muted: 'var(--accent-muted)',
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          fg: 'var(--accent-fg)',
          disabled: 'var(--accent-disabled)',
        },

        // Companion accents: used sparingly on product chrome only — terminal
        // status dots, "active connection" markers.
        teal: {
          DEFAULT: 'var(--accent-teal)',
          subtle: 'var(--accent-teal-subtle)',
        },
        amber: {
          DEFAULT: 'var(--accent-amber)',
          subtle: 'var(--accent-amber-subtle)',
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

        // DESIGN.md signature: AI-agent timeline stage colours.
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
        claude: {
          canvas: '#faf9f5',
          'surface-soft': '#f5f0e8',
          card: '#efe9de',
          'cream-strong': '#e8e0d2',
          ink: '#141413',
          'body-strong': '#252523',
          body: '#3d3d3a',
          muted: '#6c6a64',
          'muted-soft': '#8e8b82',
          hairline: '#e6dfd8',
          'hairline-soft': '#ebe6df',
          primary: '#cc785c',
          'primary-active': '#a9583e',
          'primary-disabled': '#e6dfd8',
          'on-primary': '#ffffff',
          dark: '#181715',
          'dark-elevated': '#252320',
          'dark-soft': '#1f1e1b',
          'on-dark': '#faf9f5',
          'on-dark-soft': '#a09d96',
          teal: '#5db8a6',
          amber: '#e8a55a',
          success: '#5db872',
          warning: '#d4a017',
          error: '#c64545',
        },

        // Retained as an alias of `claude.*` so any surviving `cursor-*`
        // utility from the previous system keeps resolving.
        cursor: {
          canvas: '#faf9f5',
          'canvas-soft': '#f5f0e8',
          card: '#efe9de',
          strong: '#e8e0d2',
          ink: '#141413',
          body: '#3d3d3a',
          muted: '#6c6a64',
          'muted-soft': '#8e8b82',
          hairline: '#e6dfd8',
          'hairline-soft': '#ebe6df',
          'hairline-strong': '#d6cdbd',
          primary: '#cc785c',
          'primary-active': '#a9583e',
          'on-primary': '#ffffff',
          'timeline-thinking': '#e8a55a',
          'timeline-grep': '#5db8a6',
          'timeline-read': '#a8a49b',
          'timeline-edit': '#cc785c',
          'timeline-done': '#5db872',
          success: '#5db872',
          error: '#c64545',
        },

        /*
         * Panel hierarchy for VS Code mode
         */
        vsc: {
          editor: 'var(--product)',
          sidebar: 'var(--surface-base)',
          tabbar: 'var(--surface-base)',
          panel: 'var(--product)',
          border: 'var(--stroke-subtle)',
          borderStrong: 'var(--stroke-strong)',
          text: 'var(--text-primary)',
          textMuted: 'var(--text-secondary)',
          indent: 'var(--stroke-subtle)',
        },

        // VS Code Theme Colors (theme-aware via vars)
        'vscode-editor': 'var(--product)',
        'vscode-sidebar': 'var(--surface-base)',
        'vscode-activitybar': 'var(--surface-base)',
        'vscode-panel': 'var(--product)',
        'vscode-border': 'var(--stroke-subtle)',
        'vscode-selection': 'var(--vscode-selection)',
        'vscode-statusbar': 'var(--product-soft)',
        'vscode-text': 'var(--text-primary)',
        'vscode-text-dim': 'var(--text-secondary)',
        'vscode-line-highlight': 'var(--vscode-line-highlight)',
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
      // DESIGN.md's split is editorial and unbreakable:
      //   serif  → every display headline (Copernicus / Tiempos Headline,
      //            with Cormorant Garamond as the open-source stand-in)
      //   sans   → body, navigation, buttons, labels (StyreneB, Inter)
      //   mono   → every code surface (JetBrains Mono)
      fontFamily: {
        // Display: Copernicus and Tiempos Headline are licensed, so the stack
        // leads with them and falls through to Cormorant Garamond, which
        // DESIGN.md names as the closest open-source approximation.
        serif: [
          "'Cormorant Garamond'",
          "'Copernicus'",
          "'Tiempos Headline'",
          "'EB Garamond'",
          'Garamond',
          '"Times New Roman"',
          'serif',
        ],
        sans: [
          'Inter',
          "'StyreneB'",
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

      // Dense, utilitarian developer-tool type scale, plus the DESIGN.md
      // display scale. Display sizes are paired with `font-serif` at weight
      // 500 — never bold, and never in sans.
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4', letterSpacing: '1.5px' }],
        xs: ['12px', { lineHeight: '1.4' }],
        'sm-sub': ['12.5px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.55' }],
        base: ['14px', { lineHeight: '1.55' }],
        md: ['15px', { lineHeight: '1.4' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.25' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        // DESIGN.md display scale — serif, negative tracking.
        'display-sm': ['28px', { lineHeight: '1.2', letterSpacing: '-0.3px' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.5px' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-1px' }],
        'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-1.5px' }],
        'display-mega': ['72px', { lineHeight: '1.1', letterSpacing: '-2.16px' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      // 4px base unit. `section` carries the 96px editorial band rhythm.
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        section: '96px',
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

      // Depth is colour-block first and shadow rare. DESIGN.md permits a single
      // 0 1px 3px shadow for hover-elevated states; note that index.css
      // suppresses shadows globally, so these tokens exist for call sites that
      // opt back in explicitly rather than as a default.
      boxShadow: {
        none: 'none',
        elevated: '0 1px 3px rgba(20, 20, 19, 0.08)',
        'elevated-lg': '0 1px 3px rgba(20, 20, 19, 0.08)',
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
