import React from 'react';
import { Instagram, Linkedin, Github, Codepen, Mail, XCircle, AlertTriangle } from 'lucide-react';

interface FooterProps {
  focusMode?: boolean;
  errorCount?: number;
  warningCount?: number;
  onOpenValidator?: () => void;
}

/** footer-link per DESIGN.md: transparent, body colour, body-sm. */
const linkClass = 'text-content-secondary transition-colors hover:text-content-primary';
const socialClass = 'text-content-muted transition-colors hover:text-accent';

const Footer: React.FC<FooterProps> = ({ focusMode = false, errorCount = 0, warningCount = 0, onOpenValidator }) => {
  const handleNavigation = (view: string) => {
    window.dispatchEvent(new CustomEvent(`navigate-to-${view}`));
  };

  if (focusMode) {
    return null;
  }

  return (
    /* Sits on the cream canvas rather than a darker band — the hairline alone
       separates it from the workspace above. */
    <footer className="mt-auto border-t border-stroke-subtle bg-surface-canvas text-content-secondary">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left: Problems & Links */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Problem Indicator */}
            {(errorCount > 0 || warningCount > 0) && (
              <>
                <button
                  onClick={onOpenValidator}
                  className={`flex items-center gap-2 rounded-xs px-2 py-0.5 transition-colors hover:bg-surface-hover ${
                    errorCount > 0 ? 'text-danger' : 'text-content-secondary'
                  }`}
                  title="View Problems"
                >
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>{errorCount}</span>
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{warningCount}</span>
                  </span>
                </button>
                <span aria-hidden className="text-stroke-strong">|</span>
              </>
            )}

            <button onClick={() => handleNavigation('about')} className={linkClass}>About</button>
            <button onClick={() => handleNavigation('documentation')} className={linkClass}>Documentation</button>
            <button onClick={() => handleNavigation('contact')} className={linkClass}>Contact</button>
            <span aria-hidden className="text-stroke-strong">|</span>
            <button onClick={() => handleNavigation('privacy')} className={linkClass}>Privacy</button>
            <button onClick={() => handleNavigation('terms')} className={linkClass}>Terms</button>
            <button onClick={() => handleNavigation('cookies')} className={linkClass}>Cookies</button>
            <button onClick={() => handleNavigation('disclaimer')} className={linkClass}>Disclaimer</button>
          </div>

          {/* Center: Copyright */}
          <div className="hidden text-xs text-content-muted lg:block">
            © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer"
              className={socialClass}
              aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer"
              className={socialClass}
              aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer"
              className={socialClass}
              aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer"
              className={socialClass}
              aria-label="CodePen">
              <Codepen className="h-4 w-4" />
            </a>
            <a href="mailto:girishlade111@gmail.com"
              className={socialClass}
              aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="mt-2 text-center text-xs text-content-muted lg:hidden">
          © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;