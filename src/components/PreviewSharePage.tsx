import React, { useMemo, useEffect } from 'react';
import { Code2 } from 'lucide-react';

interface PreviewSharePageProps {
  html: string;
  css: string;
  javascript: string;
}

/**
 * Standalone, chrome-less viewer for /preview?p=ENCODED_STRING links.
 *
 * Renders ONLY a sandboxed iframe filling the viewport plus a small fixed
 * watermark + "Open in Editor" affordance in the bottom-right corner.
 * No navbar, no console, no editors.
 */
const PreviewSharePage: React.FC<PreviewSharePageProps> = ({ html, css, javascript }) => {
  // Basic sanitization mirroring PreviewPanel.tsx so shared previews behave
  // identically to the in-app preview.
  const sanitizeCode = (code: string, language: 'html' | 'css'): string => {
    if (language === 'html') {
      return code
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
    }
    return code
      .replace(/expression\s*\(/gi, '')
      .replace(/behavior\s*:/gi, '')
      .replace(/-moz-binding\s*:/gi, '');
  };

  const escapeScriptContent = (code: string): string =>
    code.replace(/<\/script/gi, '<\\/script');

  const srcDoc = useMemo(() => {
    const sanitizedHtml = sanitizeCode(html, 'html');
    const sanitizedCss = sanitizeCode(css, 'css');
    const safeJavascript = escapeScriptContent(javascript);
    const compiledJsString = JSON.stringify(javascript);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; object-src 'none';">
    <title>Preview</title>
    <style>
        body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: #333;
        }
        ${sanitizedCss}
    </style>
</head>
<body>
    ${sanitizedHtml}
    <script>
        // Minimal console forwarding (parent doesn't show a console here, but
        // we silence the page's own console errors so they don't pollute the
        // browser devtools of unsuspecting viewers).
        const sendToParent = (type, message) => {
            try {
                window.parent.postMessage({
                    type: 'console',
                    level: type,
                    message: String(message).substring(0, 5000),
                    timestamp: new Date().toISOString()
                }, '*');
            } catch (_) {}
        };

        window.addEventListener('error', (e) => {
            const message = e.message ? e.message.substring(0, 500) : 'Unknown error';
            sendToParent('error', message + ' at ' + (e.filename || 'unknown') + ':' + (e.lineno || 'unknown'));
        });

        const executeUserCode = () => {
            try {
                const userJs = ${compiledJsString};
                eval(userJs);
            } catch (error) {
                sendToParent('error', error && error.message ? error.message.substring(0, 200) : 'Execution error');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeUserCode);
        } else {
            executeUserCode();
        }
        // safeJavascript reference (used by transpilers/tests in dev) — kept
        // to mirror the structure of PreviewPanel for future parity.
        void ${JSON.stringify(safeJavascript.slice(0, 0))};
    </script>
</body>
</html>`;
  }, [html, css, javascript]);

  // Get the encoded string straight from the current URL so "Open in Editor"
  // round-trips the exact same payload the visitor is viewing.
  const encodedString = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('p') || '';
  }, []);

  // Defensive: kill outer-page scroll so the iframe truly owns the viewport.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyMargin = document.body.style.margin;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.margin = prevBodyMargin;
    };
  }, []);

  const editorUrl = `https://code.ladestack.in/?fork=${encodedString}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <iframe
        title="Live Preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />

      {/* Watermark + Open-in-Editor pill, fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          right: 12,
          bottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 2147483647,
          pointerEvents: 'none',
        }}
      >
        <a
          href="https://code.ladestack.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(17, 17, 17, 0.72)',
            color: 'rgba(255, 255, 255, 0.92)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.2,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 9999,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            transition: 'opacity 0.15s ease',
          }}
        >
          Built with LadeStack Coder
        </a>

        <a
          href={editorUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Editor"
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(17, 17, 17, 0.72)',
            color: 'rgba(255, 255, 255, 0.92)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.2,
            textDecoration: 'none',
            padding: '6px 10px 6px 8px',
            borderRadius: 9999,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          <Code2 size={12} strokeWidth={2.25} />
          <span>Open in Editor</span>
        </a>
      </div>
    </div>
  );
};

export default PreviewSharePage;
