      /**
       * The App Router tree.
       *
       * ============================================================================
       *  HOW THIS DIFFERS FROM A REAL NEXT.JS APP ROUTER
       * ============================================================================
       *
       * In a real project there is no file like this. `app/layout.jsx` wraps every
       * route because Next.js renders it as a persistent layout, and a page is
       * reachable purely because of where its file sits:
       *
       *   app/layout.jsx               -> wraps everything, renders <html> and <body>
       *   app/page.jsx                 -> /
       *   app/blog/page.jsx            -> /blog
       *   app/blog/[slug]/page.jsx     -> /blog/<anything>, with params.slug
       *   app/not-found.jsx            -> rendered by notFound() and by 404s
       *
       * Those pages are Server Components. They render on the server to HTML, the
       * framework pre-renders `generateStaticParams`, and navigation is intercepted
       * `<Link>` that swaps the server payload.
       *
       * A playground has no server, and the filesystem is a flat JSON payload, so the
       * three server-side mechanisms are reproduced client-side:
       *
       *   1. ROUTING. `ROUTES` below is the explicit table Next.js derives from the
       *      directory structure. `matchRoute` in `lib/router.jsx` matches the current
       *      path against it and captures the `[slug]` segment into `params`, giving
       *      the page component the identical prop shape it would receive on a server.
       *
       *   2. LAYOUT NESTING. `RootLayout` is rendered once, around whichever page
       *      matched - exactly what the framework does. The header and footer
       *      therefore survive navigation instead of remounting.
       *
       *   3. `notFound()`. A post page calls `notFound()` when its slug is unknown,
       *      which swaps in `app/not-found.jsx`. Unmatched paths do the same.
       *
       * Everything below `RootLayout` is ordinary React and would work unchanged in a
       * real App Router project.
       */

      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

      import RootLayout from './app/layout.jsx';
      import HomePage from './app/page.jsx';
      import BlogIndexPage from './app/blog/page.jsx';
      import PostPage from './app/blog/[slug]/page.jsx';
      import NotFound from './app/not-found.jsx';

      import { matchRoute, useRouter } from './lib/router.jsx';
      import { postBySlug } from './lib/posts.js';

      /**
       * The route table, mirroring the `app/` directory structure.
       *
       * `path` uses the same `[slug]` syntax as the folder name so the correspondence
       * between this file and a real App Router project stays obvious.
       */
      const ROUTES = [
        { path: '/', Component: HomePage },
        { path: '/blog', Component: BlogIndexPage },
        { path: '/blog/[slug]', Component: PostPage },
      ];

      /** Splits `?tag=nextjs&q=token` into an object. */
      function readQuery(path) {
        const index = String(path || '').indexOf('?');
        if (index === -1) return { tag: null, q: '' };

        const params = new URLSearchParams(String(path).slice(index + 1));
        return { tag: params.get('tag') || null, q: params.get('q') || '' };
      }

      /**
       * Reading progress, as a percentage of the scrollable height.
       *
       * `scrollHeight - innerHeight` is the true scroll range, so this is correct even
       * on a short page that cannot scroll at all (where it is 0 rather than NaN).
       *
       * `resetKey` restarts the bar whenever the route changes, so navigating from a
       * long post to a short one does not leave the bar stuck at 100%. The setter is
       * private to this hook, which is why the reset lives here rather than in the
       * caller.
       */
      function useReadingProgress(resetKey) {
        const [progress, setProgress] = useState(0);

        useEffect(() => {
          const compute = () => {
            const range = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(range <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / range) * 100)));
          };

          compute();
          window.addEventListener('scroll', compute, { passive: true });
          window.addEventListener('resize', compute);
          return () => {
            window.removeEventListener('scroll', compute);
            window.removeEventListener('resize', compute);
          };
        }, []);

        // Clear the sticky-header state when the route changes.
        useEffect(() => setProgress(0), [resetKey]);

        return progress;
      }

      export default function App() {
        const { path, navigate } = useRouter();
        const progress = useReadingProgress(path);
        const scrollRef = useRef(null);

        const { tag, q } = readQuery(path);

        const navigateHandler = useCallback((to) => navigate(to), [navigate]);

        const page = useMemo(() => {
          const match = matchRoute(path, ROUTES);

          // No route matched: the App Router equivalent of a 404.
          if (!match) return { notFound: true };

          // `notFound()` inside the dynamic route, exactly as Next.js behaves.
          if (match.route.path === '/blog/[slug]' && !postBySlug(match.params.slug)) {
            return { notFound: true };
          }

          return { match, notFound: false };
        }, [path]);

        const renderPage = () => {
          if (page.notFound) return <NotFound />;

          const { Component, route } = page.match;
          const params = { ...page.match.params };

          // The slug segment resolves to a real post object before it reaches the page,
          // so the page never has to deal with a missing record.
          if (route.path === '/blog/[slug]') params.post = postBySlug(params.slug);

          return <Component params={params} query={q} tag={tag} onNavigate={navigateHandler} />;
        };

        return (
          <RootLayout path={path} onNavigate={navigateHandler} progress={progress} scrollRef={scrollRef}>
            {renderPage()}
          </RootLayout>
        );
      }