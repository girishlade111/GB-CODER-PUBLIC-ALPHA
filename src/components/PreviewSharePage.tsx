import React, { useEffect, useMemo } from 'react';
import { Code2 } from 'lucide-react';

interface PreviewSharePageProps {
  html: string;
  css: string;
  javascript: string;
}

const PreviewSharePage: React.FC<PreviewSharePageProps> = ({ html, css, javascript }) => {
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

  const srcDoc = useMemo(() => {
    const sanitizedHtml = sanitizeCode(html, 'html');
    const sanitizedCss = sanitizeCode(css, 'css');
    const compiledJavaScriptString = JSON.stringify(javascript);

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
        window.addEventListener('error', (e) => {
            console.error(e.message || 'Unknown preview error');
        });

        const waitForDocument = () => {
            return new Promise((resolve) => {
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    resolve();
                } else {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                }
            });
        };

        const executeUserCode = async () => {
            try {
                await waitForDocument();
                const sanitizedJs = ${compiledJavaScriptString};
                eval(sanitizedJs);
            } catch (error) {
                console.error(error && error.message ? error.message : 'Execution error');
            }
        };

        executeUserCode();
    </script>
</body>
</html>`;
  }, [html, css, javascript]);

  const encodedString = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('p') || '';
  }, []);

  const editorUrl = `https://code.ladestack.in/?fork=${encodeURIComponent(encodedString)}`;

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyMargin = document.body.style.margin;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.margin = previousBodyMargin;
    };
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-white">
      <iframe
        title="Live Preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        className="block h-screen w-screen border-0"
      />

      <div className="fixed bottom-3 right-3 z-[2147483647] flex items-center gap-2">
        <a
          href="https://code.ladestack.in"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white/90 no-underline shadow-lg backdrop-blur-md transition-opacity hover:opacity-90"
        >
          Built with LadeStack Coder
        </a>

        <a
          href={editorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1.5 text-[11px] font-medium text-white/90 no-underline shadow-lg backdrop-blur-md transition-opacity hover:opacity-90"
        >
          <Code2 className="h-3 w-3" />
          <span>Open in Editor</span>
        </a>
      </div>
    </div>
  );
};

export default PreviewSharePage;
