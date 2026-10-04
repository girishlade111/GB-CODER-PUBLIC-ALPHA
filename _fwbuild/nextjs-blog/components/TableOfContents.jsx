      import { useCallback, useEffect, useState } from 'react';
      import { Link } from '../lib/router.jsx';
      import { extractHeadings } from '../lib/markdown.js';

      /**
       * Table of contents with scroll-spy.
       *
       * The spy is a single scroll listener reading heading offsets, rather than an
       * `IntersectionObserver`. For a long article the observer's "which section am I
       * in" answer is fiddly at the boundaries, whereas "what is the last heading whose
       * top has passed 140px" is exact and cheap.
       *
       * Clicking an entry scrolls smoothly and suppresses the spy for a moment, so the
       * highlight does not race the animation.
       */
      export default function TableOfContents({ body, containerRef }) {
        const headings = extractHeadings(body);
        const [active, setActive] = useState(headings.length ? headings[0].id : '');
        const [locked, setLocked] = useState(false);

        const recompute = useCallback(() => {
          if (locked || headings.length === 0) return;

          const scrollY = window.scrollY;
          let current = headings[0].id;

          for (const heading of headings) {
            const node = containerRef.current ? containerRef.current.querySelector('#' + heading.id) : null;
            if (!node) continue;
            if (node.getBoundingClientRect().top + scrollY - 150 <= scrollY) current = heading.id;
          }

          setActive(current);
        }, [headings, locked, containerRef]);

        useEffect(() => {
          recompute();
          window.addEventListener('scroll', recompute, { passive: true });
          window.addEventListener('resize', recompute);
          return () => {
            window.removeEventListener('scroll', recompute);
            window.removeEventListener('resize', recompute);
          };
        }, [recompute]);

        if (headings.length === 0) return null;

        const jump = (id) => {
          const node = containerRef.current ? containerRef.current.querySelector('#' + id) : null;
          if (!node) return;

          // Hold the spy still while the smooth scroll is running.
          setLocked(true);
          window.setTimeout(() => setLocked(false), 620);

          const top = node.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top, behavior: 'smooth' });
          setActive(id);
        };

        return (
          <nav className="toc" aria-labelledby="toc-heading">
            <p className="toc__heading" id="toc-heading">
              On this page
            </p>

            <ol className="toc__list">
              {headings.map((heading) => (
                <li key={heading.id} className={'toc__item toc__item--h' + heading.level}>
                  <a
                    href={'#' + heading.id}
                    className={'toc__link' + (active === heading.id ? ' toc__link--on' : '')}
                    aria-current={active === heading.id ? 'location' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      jump(heading.id);
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>

            <Link to="/blog" className="toc__back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to all posts
            </Link>
          </nav>
        );
      }