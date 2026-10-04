      import { Link } from '../lib/router.jsx';
      import PostCard from '../components/PostCard.jsx';
      import { SORTED_POSTS, TAGS, authorOf } from '../lib/posts.js';

      /**
       * `app/page.jsx` — the `/` route.
       *
       * A real Next.js App Router route. There is no exported `path`, because the
       * router never looks for one: the filesystem position *is* the route. Everything
       * below is ordinary React.
       */

      const Arrow = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      );

      const Proof = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

      export default function HomePage({ onNavigate }) {
        const [lead, ...rest] = SORTED_POSTS;
        const contributors = Array.from(new Set(SORTED_POSTS.map((post) => post.author))).map(authorOf);

        return (
          <>
            {/* -- Hero ----------------------------------------------- */}
            <section className="hero" aria-labelledby="hero-heading">
              <div className="hero__copy">
                <p className="hero__eyebrow">Northgate Systems engineering</p>
                <h1 className="hero__title" id="hero-heading">
                  Notes from the parts of the job that do not fit in a changelog
                </h1>
                <p className="hero__sub">
                  Six long-form write-ups on performance work, design systems and infrastructure -
                  including the mistakes, because those are the parts worth remembering.
                </p>

                <div className="hero__actions">
                  <Link to="/blog" onNavigate={onNavigate} className="button button--primary">
                    Read the latest
                    <Arrow />
                  </Link>
                  <Link to={'/blog/' + lead.slug} onNavigate={onNavigate} className="button button--quiet">
                    Start with &ldquo;{lead.title}&rdquo;
                  </Link>
                </div>

                <dl className="hero__proof">
                  <div>
                    <dt>Subscribers</dt>
                    <dd>4,180</dd>
                  </div>
                  <div>
                    <dt>Average read</dt>
                    <dd>8.4 min</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{SORTED_POSTS.length} posts</dd>
                  </div>
                </dl>
              </div>

              <div className="hero__visual" aria-hidden="true">
                <div className="hero__card hero__card--back" />
                <div className="hero__card hero__card--front">
                  <span className="hero__card-line" />
                  <span className="hero__card-line hero__card-line--short" />
                  <span className="hero__card-bar" />
                </div>
              </div>
            </section>

            {/* -- Featured post ------------------------------------- */}
            <section className="section" aria-labelledby="featured-heading">
              <div className="section__head">
                <h2 className="section__title" id="featured-heading">
                  Most read
                </h2>
                <Link to="/blog" onNavigate={onNavigate} className="section__link">
                  Every post
                  <Arrow />
                </Link>
              </div>

              <PostCard post={lead} onNavigate={onNavigate} featured />
            </section>

            {/* -- Recent posts -------------------------------------- */}
            <section className="section" aria-labelledby="recent-heading">
              <div className="section__head">
                <h2 className="section__title" id="recent-heading">
                  Recent writing
                </h2>
              </div>

              <div className="grid-cards">
                {rest.slice(0, 3).map((post) => (
                  <PostCard key={post.slug} post={post} onNavigate={onNavigate} />
                ))}
              </div>
            </section>

            {/* -- Topics -------------------------------------------- */}
            <section className="section" aria-labelledby="topics-heading">
              <div className="section__head">
                <h2 className="section__title" id="topics-heading">
                  What we write about
                </h2>
                <p className="section__note">Counted from the published posts.</p>
              </div>

              <ul className="topics">
                {TAGS.map((tag) => (
                  <li key={tag.id}>
                    <Link to={'/blog?tag=' + tag.id} onNavigate={onNavigate} className="topic">
                      <span className="topic__label">{tag.id}</span>
                      <span className="topic__count">{tag.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* -- Contributors -------------------------------------- */}
            <section className="section" aria-labelledby="contributors-heading">
              <div className="section__head">
                <h2 className="section__title" id="contributors-heading">
                  Who writes here
                </h2>
              </div>

              <ul className="contributors">
                {contributors.map((person) => (
                  <li key={person.name} className="contributor">
                    <span className="avatar avatar--lg" aria-hidden="true">{person.initials}</span>
                    <span className="contributor__text">
                      <strong>{person.name}</strong>
                      <small>{person.role}</small>
                    </span>
                    <Proof />
                  </li>
                ))}
              </ul>
            </section>

            {/* -- Closing CTA --------------------------------------- */}
            <section className="cta" aria-labelledby="cta-heading">
              <div className="cta__copy">
                <h2 className="cta__title" id="cta-heading">
                  One post a month, no newsletter theatre
                </h2>
                <p className="cta__body">
                  Every post is a real problem we hit and what we actually changed. If a post does not
                  help you decide something, we do not send it.
                </p>
                <Link to="/blog" onNavigate={onNavigate} className="button button--primary">
                  Browse the archive
                  <Arrow />
                </Link>
              </div>
            </section>
          </>
        );
      }