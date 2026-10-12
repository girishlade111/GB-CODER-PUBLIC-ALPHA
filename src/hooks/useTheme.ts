import { useState, useEffect } from 'react';

/**
 * LadeStack Theme Hook
 *
 * Supports LadeStack Dark Developer Theme (default) and Light Mode.
 * Seamlessly integrates with semantic CSS tokens and Monaco Editor themes.
 */
export type Theme = 'dark' | 'light';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem('gbcoder_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  const setTheme = (next?: Theme) => {
    const newTheme = next || (theme === 'dark' ? 'light' : 'dark');
    setThemeState(newTheme);
    try {
      localStorage.setItem('gbcoder_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => setTheme();

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
  };
};