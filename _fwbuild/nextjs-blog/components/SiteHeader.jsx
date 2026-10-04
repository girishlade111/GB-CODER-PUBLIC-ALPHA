      import { useEffect, useState } from 'react';
      import { Link } from '../lib/router.jsx';
      import { TAGS } from '../lib/posts.js';

      const Mark = () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11l6.5 9-6.5 9H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" />
          <path d="M11 3v18M20 12h-3.5" />
        </svg>
      );

      const SearchGlyph = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
        </svg>
      );

      const MenuGlyph = ({ open }) => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" aria-hidden="true" focusable="false">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      );

      /**
       * Site header.
       *
       * Sticky, with a shadow that appears once the page has scrolled - the shadow is a
       * state change rather than a scroll listener driving inline styles, so it costs
       * one boolean and no layout thrash.
       */
      export default function SiteHeader({ path, onNavigate }) {
        const [stuck, setStuck] = useState(false);
        const [menuOpen, setMenuOpen] = useState(false);
        const [term, setTerm] = useState('');

        useEffect(() => {
          const onScroll = () => setStuck(window.scrollY > 8);
          onScroll();
          window.addEventListener('scroll', onScroll, { passive: true });
          return () => window.removeEventListener('scroll', onScroll);
        }, []);

        // Any navigation closes the mobile menu.
        useEffect(() => setMenuOpen(false), [path]);

        // Escape closes it too.
        useEffect(() => {
          if (!menuOpen) return undefined;
          const onKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
          };
          document.addEventListener('keydown', onKeyDown);
          return () => document.removeEventListener('keydown', onKeyDown);
        }, [menuOpen]);

        const submitSearch = (event) => {
          event.preventDefault();
          const q = term.trim();
          onNavigate(q ? '/blog?q=' + encodeURIComponent(q) : '/blog');
          setMenuOpen(false);
        };

        const links = [
          { to: '/', label: 'Home' },
          { to: '/blog', label: 'All posts' },
        ];

        const isCurrent = (to) => (to === '/' ? path === '/' : path.indexOf(to) === 0);

        return (
          <header className={'site-header' + (stuck ? ' site-header--stuck' : '')}>
            <div className="site-header__inner">
              <Link to="/" onNavigate={onNavigate} className="brand" aria-label="Fieldnotes, home">
                <span className="brand__mark" aria-hidden="true">
                  <Mark />
                </span>
                <span className="brand__text">
                  <strong>Fieldnotes</strong>
                  <small>Engineering, in detail</small>
                </span>
              </Link>

              <nav className={'site-nav' + (menuOpen ? ' site-nav--open' : '')} aria-label="Primary">
                <ul className="site-nav__list">
                  {links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onNavigate={onNavigate}
                        className={'site-nav__link' + (isCurrent(link.to) ? ' site-nav__link--on' : '')}
                        aria-current={isCurrent(link.to) ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {TAGS.slice(0, 3).map((tag) => (
                    <li key={tag.id} className="site-nav__tagitem">
                      <Link
                        to={'/blog?tag=' + tag.id}
                        onNavigate={onNavigate}
                        className={'site-nav__tag' + (path.indexOf('tag=' + tag.id) !== -1 ? ' site-nav__tag--on' : '')}
                      >
                        {tag.id}
                      </Link>
                    </li>
                  ))}
                </ul>

                <form className="site-search" onSubmit={submitSearch} role="search">
                  <label className="sr-only" htmlFor="site-search">
                    Search posts
                  </label>
                  <span className="site-search__icon" aria-hidden="true">
                    <SearchGlyph />
                  </span>
                  <input
                    id="site-search"
                    className="site-search__input"
                    type="search"
                    value={term}
                    placeholder="Search"
                    autoComplete="off"
                    onChange={(event) => setTerm(event.target.value)}
                  />
                </form>

                <Link to="/blog" onNavigate={onNavigate} className="button button--primary site-header__cta">
                  Subscribe
                </Link>
              </nav>

              <button
                type="button"
                className="site-header__burger"
                aria-expanded={menuOpen}
                aria-controls="site-nav"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <MenuGlyph open={menuOpen} />
              </button>
            </div>
          </header>
        );
      }