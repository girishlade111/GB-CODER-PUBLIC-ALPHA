import React, { useEffect, useMemo } from 'react';
import { Code2 } from 'lucide-react';

interface PreviewSharePageProps {
  html: string;
  css: string;
  javascript: string;
  shortId?: string;
  isLoading?: boolean;
  error?: string | null;
}

const PreviewSharePage: React.FC<PreviewSharePageProps> = ({
  html,
  css,
  javascript,
  shortId = '',
  isLoading = false,
  error = null,
}) => {
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

  const editorUrl = `https://code.ladestack.in/?fork=${encodeURIComponent(shortId)}`;

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#1e1e1e] text-white">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl font-bold tracking-[0.14em]">LADE</span>
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="text-3xl font-bold tracking-[0.14em]">STACK</span>
        </div>
        <p className="mb-4 text-sm text-gray-400">Loading preview...</p>
        <div className="flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#1e1e1e] p-6 text-center text-gray-100">
        <div className="max-w-md">
          <h1 className="mb-3 text-[22px] font-semibold">Preview unavailable</h1>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <a
            href="https://code.ladestack.in"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-600"
          >
            Go to LadeStack Coder
          </a>
        </div>
      </div>
    );
  }

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
