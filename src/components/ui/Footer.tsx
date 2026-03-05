import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Instagram, Linkedin, Github, Codepen, Mail } from 'lucide-react';

interface FooterProps {
  focusMode?: boolean;
}

const Footer: React.FC<FooterProps> = ({ focusMode = false }) => {
  const { isDark } = useTheme();

  const handleNavigation = (view: string) => {
    window.dispatchEvent(new CustomEvent(`navigate-to-${view}`));
  };

  if (focusMode) {
    return null;
  }

  return (
    <footer className={`mt-auto border-t transition-colors ${isDark
      ? 'bg-matte-black border-gray-700 text-bright-white'
      : 'bg-bright-white border-gray-200 text-gray-600'
      }`}>
      {/* Compact Single-Line Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 shadow-inner-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left: Links */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleNavigation('about')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('documentation')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Documentation
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Contact
            </button>
            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
            <button
              onClick={() => handleNavigation('privacy')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Privacy
            </button>
            <button
              onClick={() => handleNavigation('terms')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Terms
            </button>
            <button
              onClick={() => handleNavigation('cookies')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Cookies
            </button>
            <button
              onClick={() => handleNavigation('disclaimer')}
              className={`hover:text-vscode-statusbar transition-colors ${isDark ? '' : 'hover:text-gray-900'}`}
            >
              Disclaimer
            </button>
          </div>

          {/* Center: Copyright */}
          <div className="text-xs hidden lg:block">
            © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer"
              className={`transition-colors hover:scale-110 ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer"
              className={`transition-colors hover:scale-110 ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer"
              className={`transition-colors hover:scale-110 ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer"
              className={`transition-colors hover:scale-110 ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="CodePen">
              <Codepen className="w-4 h-4" />
            </a>
            <a href="mailto:girishlade111@gmail.com"
              className={`transition-colors hover:scale-110 ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="text-xs text-center mt-2 lg:hidden">
          © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
