      import SiteHeader from '../components/SiteHeader.jsx';
      import SiteFooter from '../components/SiteFooter.jsx';

      /**
       * `app/layout.jsx` — the root layout.
       *
       * In a real Next.js App Router project this file is a Server Component. It wraps
       * every route, it must render `<html>` and `<body>`, and it is the right place
       * for shared chrome and global metadata. Exactly the same nesting happens here:
       * `App.jsx` renders this once, around whichever page the router matched, so the
       * header and footer persist across navigations just as they would.
       *
       * The one difference is the document element. In a real app React renders into
       * `<body>` on the server and Next.js owns `<html>` and `<head>`. The playground
       * already provides a `<body>` and owns `<head>`, so this layout renders a
       * `<div>` with the equivalent role and applies the body-level styling through a
       * class. The structure and the intent are identical.
       *
       * `metadata` would normally be exported from here for `generateMetadata`. This
       * template reads the document title itself because there is no server to do it.
       */
      export const metadata = {
        title: 'Fieldnotes',
        description: 'Engineering, in detail.',
      };

      export default function RootLayout({ children, path, onNavigate, progress }) {
        return (
          <div className="shell">
            {/*
              Reading progress. A fixed element whose width is driven by
              `stroke-dashoffset` on an SVG rect, so the fill needs no inline style.
            */}
            <div className="progress" role="presentation" aria-hidden="true">
              <svg className="progress__svg" viewBox="0 0 100 4" preserveAspectRatio="none" focusable="false">
                <rect className="progress__track" x="0" y="0" width="100" height="4" />
                <rect
                  className="progress__value"
                  x="0"
                  y="0"
                  width="100"
                  height="4"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={String(100 - progress)}
                />
              </svg>
            </div>

            <SiteHeader path={path} onNavigate={onNavigate} />

            {/* `children` is the matched page - the equivalent of Next.js's children prop. */}
            <main className="shell__main" id="main">
              {children}
            </main>

            <SiteFooter onNavigate={onNavigate} />
          </div>
        );
      }