import React from 'react';
import { Instagram, Linkedin, Github, Codepen, Mail, XCircle, AlertTriangle } from 'lucide-react';

interface FooterProps {
  focusMode?: boolean;
  errorCount?: number;
  warningCount?: number;
  onOpenValidator?: () => void;
}

const Footer: React.FC<FooterProps> = ({ focusMode = false, errorCount = 0, warningCount = 0, onOpenValidator }) => {
  const handleNavigation = (view: string) => {
    window.dispatchEvent(new CustomEvent(`navigate-to-${view}`));
  };

  if (focusMode) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-[#2a2a2a] bg-[#161616] text-[#8a8a8a]">
      {/* Compact Single-Line Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left: Problems & Links */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Problem Indicator */}
            {(errorCount > 0 || warningCount > 0) && (
              <>
                <button
                  onClick={onOpenValidator}
                  className={`flex items-center gap-2 px-2 py-0.5 rounded-sm transition-colors hover:bg-[#1c1c1c] ${errorCount > 0 ? 'text-[#e5484d]' : 'text-[#8a8a8a]'}`}
                  title="View Problems"
                >
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>{errorCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{warningCount}</span>
                  </div>
                </button>
                <span className="text-[#3a3a3a]">|</span>
              </>
            )}

            <button onClick={() => handleNavigation('about')} className="hover:text-[#e8e8e8] transition-colors">About</button>
            <button onClick={() => handleNavigation('documentation')} className="hover:text-[#e8e8e8] transition-colors">Documentation</button>
            <button onClick={() => handleNavigation('contact')} className="hover:text-[#e8e8e8] transition-colors">Contact</button>
            <span className="text-[#3a3a3a]">|</span>
            <button onClick={() => handleNavigation('privacy')} className="hover:text-[#e8e8e8] transition-colors">Privacy</button>
            <button onClick={() => handleNavigation('terms')} className="hover:text-[#e8e8e8] transition-colors">Terms</button>
            <button onClick={() => handleNavigation('cookies')} className="hover:text-[#e8e8e8] transition-colors">Cookies</button>
            <button onClick={() => handleNavigation('disclaimer')} className="hover:text-[#e8e8e8] transition-colors">Disclaimer</button>
          </div>

          {/* Center: Copyright */}
          <div className="text-xs text-[#5c5c5c] hidden lg:block">
            © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8] hover:scale-110"
              aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8] hover:scale-110"
              aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8] hover:scale-110"
              aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8] hover:scale-110"
              aria-label="CodePen">
              <Codepen className="w-4 h-4" />
            </a>
            <a href="mailto:girishlade111@gmail.com"
              className="transition-colors hover:text-[#e8e8e8] hover:scale-110"
              aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="text-xs text-[#5c5c5c] text-center mt-2 lg:hidden">
          © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
