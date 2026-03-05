/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // VS Code Dark Theme Colors
        'vscode-editor': '#1e1e1e',        // Main editor background
        'vscode-sidebar': '#252526',       // Sidebar background
        'vscode-activitybar': '#333333',   // Activity bar (far left)
        'vscode-panel': '#1e1e1e',         // Panel background (console, terminal)
        'vscode-border': '#2d2d30',        // Borders between panels
        'vscode-selection': '#264f78',     // Selection background
        'vscode-statusbar': '#007acc',     // Status bar blue
        'vscode-text': '#d4d4d4',          // Primary text
        'vscode-text-dim': '#969696',      // Secondary/dimmed text
        'vscode-line-highlight': '#2a2d2e', // Current line highlight
        'vscode-hover': '#2a2d2e',         // Hover background
        'vscode-active': '#37373d',        // Active/pressed background
        'vscode-focus-border': '#007fd4',  // Focus ring color
        'vscode-tab-inactive': '#2d2d2d',  // Inactive tab background
        // Keep legacy colors for compatibility
        'matte-black': '#1e1e1e',
        'bright-white': '#FFFFFF',
        'dark-gray': '#252526',
        'light-gray': '#E5E5E5',
      },
      boxShadow: {
        'vscode-widget': '0 2px 8px rgba(0, 0, 0, 0.36)',
        'vscode-modal': '0 5px 15px rgba(0, 0, 0, 0.5)',
        'vscode-toolbar': '0 1px 4px rgba(0, 0, 0, 0.4)',
        'inner-subtle': 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
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
          '0%': { opacity: '0', transform: 'scale(0.95)' },
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
