      import { Link } from '../lib/router.jsx';
      import { SORTED_POSTS } from '../lib/posts.js';

      const columns = [
        {
          title: 'Writing',
          links: [
            { label: 'All posts', to: '/blog' },
            { label: 'Performance', to: '/blog?tag=performance' },
            { label: 'Accessibility', to: '/blog?tag=accessibility' },
            { label: 'Design systems', to: '/blog?tag=design-systems' },
          ],
        },
        {
          title: 'Engineering',
          links: [
            { label: 'Next.js', to: '/blog?tag=nextjs' },
            { label: 'Postgres', to: '/blog?tag=postgres' },
            { label: 'CI and CD', to: '/blog?tag=ci' },
            { label: 'Infrastructure', to: '/blog?tag=infrastructure' },
          ],
        },
        {
          title: 'Practice',
          links: [
            { label: 'Post-mortems', to: '/blog?tag=postmortem' },
            { label: 'Security', to: '/blog?tag=security' },
            { label: 'CSS', to: '/blog?tag=css' },
            { label: 'JavaScript', to: '/blog?tag=javascript' },
          ],
        },
      ];

      const Social = ({ name, path }) => (
        <a className="social" href={'https://github.com/' + path} rel="noopener noreferrer" aria-label={'Fieldnotes on ' + name}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </a>
      );

      /** Site footer: four link columns, a newsletter form and a legal row. */
      export default function SiteFooter({ onNavigate }) {
        return (
          <footer className="site-footer">
            <div className="site-footer__inner">
              <div className="site-footer__top">
                <div className="site-footer__brand">
                  <h2 className="site-footer__title">Fieldnotes</h2>
                  <p className="site-footer__blurb">
                    Six posts on the parts of building software that do not fit in a changelog. Published
                    when there is something worth saying, roughly twice a month.
                  </p>

                  <form className="subscribe" onSubmit={(event) => event.preventDefault()}>
                    <label className="subscribe__label" htmlFor="subscribe-email">
                      Get the next one by email
                    </label>
                    <div className="subscribe__row">
                      <input
                        id="subscribe-email"
                        className="subscribe__input"
                        type="email"
                        required
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                      <button type="submit" className="button button--primary">
                        Subscribe
                      </button>
                    </div>
                    <p className="subscribe__note">No tracking pixels. Unsubscribe in one click.</p>
                  </form>
                </div>

                <nav className="site-footer__nav" aria-label="Footer">
                  {columns.map((column) => (
                    <div className="footer-col" key={column.title}>
                      <h3 className="footer-col__title">{column.title}</h3>
                      <ul>
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <Link to={link.to} onNavigate={onNavigate} className="footer-link">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="site-footer__bottom">
                <p className="site-footer__legal">
                  2026 Northgate Systems Ltd. Registered in England, 11840277. All rights reserved.
                </p>
                <div className="site-footer__social">
                  <Social name="Mastodon" path="northgate" />
                  <Social name="GitHub" path="northgate" />
                  <Social name="LinkedIn" path="company/northgate" />
                </div>
                <p className="site-footer__count">{SORTED_POSTS.length} posts and counting.</p>
              </div>
            </div>
          </footer>
        );
      }

