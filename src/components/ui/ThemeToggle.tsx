import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-md transition-all duration-200 hover:scale-105 ${isDark
          ? 'text-bright-white hover:bg-dark-gray'
          : 'text-content-secondary hover:bg-surface-hover'
        } ${className}`}
      title={`Switch to ${isDark ? 'light (cream)' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light (cream)' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;