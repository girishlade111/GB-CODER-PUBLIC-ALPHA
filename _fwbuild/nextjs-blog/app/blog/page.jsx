      import { useMemo } from 'react';
      import { Link } from '../../lib/router.jsx';
      import PostCard from '../../components/PostCard.jsx';
      import { SORTED_POSTS, TAGS } from '../../lib/posts.js';

      /**
       * `app/blog/page.jsx` — the `/blog` route.
       *
       * In a real App Router project, `searchParams` would arrive as a prop from the
       * framework, and filtering would happen on the server. Here the query string is
       * read from `path` and filtered in the browser - the component contract is the
       * same, only the boundary moved.
       */
      export default function BlogIndexPage({ query, tag, onNavigate }) {
        const results = useMemo(() => {
          const needle = query.trim().toLowerCase();
          return SORTED_POSTS.filter((post) => {
            if (tag && tag !== 'all' && !post.tags.includes(tag)) return false;
            if (!needle) return true;
            const haystack = (post.title + ' ' + post.excerpt + ' ' + post.tags.join(' ') + ' ' + post.body)
              .toLowerCase();
            return haystack.includes(needle);
          });
        }, [query, tag]);

        const filtered = Boolean(query.trim()) || (tag && tag !== 'all');

        const clearAll = () => onNavigate('/blog');

        return (
          <div className="page">
            <header className="page__head">
              <p className="page__eyebrow">Archive</p>
              <h1 className="page__title">All posts</h1>
              <p className="page__lede">
                {SORTED_POSTS.length} write-ups on performance, design systems, infrastructure and the
                occasional post-mortem. Filter by topic, or search the full text.
              </p>
            </header>

            <div className="archive">
              {/* -- Topic filter ------------------------------------ */}
              <aside className="archive__rail" aria-label="Filter by topic">
                <h2 className="archive__rail-title">Topics</h2>

                <ul className="archive__tags">
                  <li>
                    <button
                      type="button"
                      className={'archive__tag' + (!tag || tag === 'all' ? ' archive__tag--on' : '')}
                      aria-pressed={!tag || tag === 'all'}
                      onClick={() => onNavigate(query ? '/blog?q=' + encodeURIComponent(query) : '/blog')}
                    >
                      All topics
                      <span className="archive__tag-count">{SORTED_POSTS.length}</span>
                    </button>
                  </li>
                  {TAGS.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={'archive__tag' + (tag === entry.id ? ' archive__tag--on' : '')}
                        aria-pressed={tag === entry.id}
                        onClick={() =>
                          onNavigate(
                            '/blog?tag=' + entry.id + (query ? '&q=' + encodeURIComponent(query) : ''),
                          )
                        }
                      >
                        {entry.id}
                        <span className="archive__tag-count">{entry.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* -- Results ----------------------------------------- */}
              <section className="archive__results" aria-labelledby="results-heading">
                <div className="archive__toolbar">
                  <h2 className="archive__count" id="results-heading">
                    {results.length} post{results.length === 1 ? '' : 's'}
                    {tag && tag !== 'all' ? <span className="archive__count-tag"> tagged {tag}</span> : null}
                    {query.trim() ? <span className="archive__count-tag"> matching &ldquo;{query}&rdquo;</span> : null}
                  </h2>

                  {filtered ? (
                    <button type="button" className="link-button" onClick={clearAll}>
                      Clear filters
                    </button>
                  ) : null}
                </div>

                {results.length === 0 ? (
                  <div className="empty" role="status">
                    <span className="empty__glyph" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                      </svg>
                    </span>
                    <h3 className="empty__title">Nothing matches</h3>
                    <p className="empty__body">
                      No post matches {tag && tag !== 'all' ? <code>{tag}</code> : null}
                      {tag && tag !== 'all' && query.trim() ? ' and ' : null}
                      {query.trim() ? <code>{query}</code> : null}. Try a broader term.
                    </p>
                    <button type="button" className="button button--quiet" onClick={clearAll}>
                      Reset the archive
                    </button>
                  </div>
                ) : (
                  <div className="grid-cards grid-cards--archive">
                    {results.map((post) => (
                      <PostCard key={post.slug} post={post} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="subscribe-note">
              <h2 className="subscribe-note__title">Prefer email?</h2>
              <p className="subscribe-note__body">
                The archive grows by about two posts a month. Subscribers get each one the morning it
                goes up.
              </p>
              <Link to="/" onNavigate={onNavigate} className="link-button">
                Back to the front page
              </Link>
            </aside>
          </div>
        );
      }