      import { useRef } from 'react';
      import { Link } from '../../../lib/router.jsx';
      import MDXBlock from '../../../components/MDXBlock.jsx';
      import TableOfContents from '../../../components/TableOfContents.jsx';
      import PostCard from '../../../components/PostCard.jsx';
      import { authorOf, formatDate, relatedPosts } from '../../../lib/posts.js';
      import { wordCount as countWords } from '../../../lib/markdown.js';

      /**
       * `app/blog/[slug]/page.jsx` — the dynamic route.
       *
       * THE INTERESTING FILE. In a real Next.js App Router project:
       *
       *   - The square brackets in the folder name are how the framework knows this
       *     segment is dynamic. `[slug]` captures one path segment and exposes it as
       *     `params.slug`.
       *   - The component receives `params` as a prop, and `generateStaticParams`
       *     pre-renders every slug at build time.
       *   - Calling `notFound()` renders `app/not-found.jsx` and returns a 404 status.
       *   - It is a Server Component by default, so the whole page renders to HTML
       *     before any JavaScript runs.
       *
       * All four behaviours are reproduced here, driven by internal state rather than
       * by the filesystem:
       *
       *   - `App.jsx` holds a route table and matches the current path against it. The
       *     `[slug]` entry is matched by hand in `lib/router.jsx`, and the captured
       *     segment is passed down as `params` - the identical prop shape.
       *   - `generateStaticParams` is exported so the shape is visible, and `App.jsx`
       *     calls it to seed the slug list.
       *   - `notFound()` sets a flag in the store, which renders the not-found page.
       *   - This component is a Client Component, because scroll-spy and reading
       *     progress need the DOM. In a real project the article body would be a
       *     Server Component with the table of contents rendered separately.
       */
      export function generateStaticParams() {
        // A real implementation would return every slug from the CMS:
        //   return posts.map((post) => ({ slug: post.slug }))
        return [
          { slug: 'streaming-responses-without-sacrificing-seo' },
          { slug: 'design-tokens-that-survive-a-redesign' },
          { slug: 'cutting-our-build-from-nine-minutes-to-ninety-seconds' },
          { slug: 'the-case-for-boring-database-queries' },
          { slug: 'accessible-modals-without-a-library' },
          { slug: 'why-we-stopped-writing-our-own-auth' },
        ];
      }

      const Share = ({ label, path }) => (
        <a className="share-btn" href={'https://github.com/northgate/fieldnotes' + path} rel="noopener noreferrer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
          {label}
        </a>
      );

      export default function PostPage({ params, onNavigate }) {
        const bodyRef = useRef(null);

        const post = params.post;
        const author = authorOf(post.author);
        const related = relatedPosts(post.slug);
        const words = countWords(post.body);

        return (
          <article className="post">
            {/* -- Breadcrumb --------------------------------------- */}
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to="/" className="crumbs__link">Fieldnotes</Link>
                </li>
                <li>
                  <Link to="/blog" className="crumbs__link">All posts</Link>
                </li>
                <li aria-current="page" className="crumbs__current">{post.tags[0]}</li>
              </ol>
            </nav>

            {/* -- Header ------------------------------------------- */}
            <header className="post__head">
              <div className={'post__cover post__cover--' + post.cover} aria-hidden="true">
                <span className="post__cover-initials">{author.initials}</span>
              </div>

              <div className="post__headings">
                <div className="post__tags">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={'/blog?tag=' + tag} className="tag-pill">
                      {tag}
                    </Link>
                  ))}
                </div>

                <h1 className="post__title">{post.title}</h1>
                <p className="post__excerpt">{post.excerpt}</p>

                <div className="post__byline">
                  <span className="avatar avatar--lg" aria-hidden="true">{author.initials}</span>
                  <span className="post__byline-text">
                    <strong>{author.name}</strong>
                    <small>{author.role}</small>
                  </span>
                  <span className="post__facts">
                    <time dateTime={post.date} title={formatDate(post.date)}>
                      {formatDate(post.date)}
                    </time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.readingTime} min read</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{words.toLocaleString('en-GB')} words</span>
                  </span>
                </div>
              </div>
            </header>

            {/* -- Body, with a sticky table of contents alongside --- */}
            <div className="post__layout">
              <div className="post__body">
                <MDXBlock source={post.body} ref={bodyRef} />

                <footer className="post__footer">
                  <div className="post__share">
                    <span className="post__share-label">Share</span>
                    <Share label="Copy link" path="" />
                    <Share label="Discuss" path="/issues" />
                  </div>

                  <div className="post__author">
                    <span className="avatar avatar--lg" aria-hidden="true">{author.initials}</span>
                    <div>
                      <strong>{author.name}</strong>
                      <p>
                        {author.role} at Northgate Systems. Writes about {post.tags.slice(0, 2).join(' and ')}.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>

              <aside className="post__aside">
                <TableOfContents body={post.body} containerRef={bodyRef} />
              </aside>
            </div>

            {/* -- Related ------------------------------------------- */}
            {related.length ? (
              <section className="section" aria-labelledby="related-heading">
                <div className="section__head">
                  <h2 className="section__title" id="related-heading">
                    Related reading
                  </h2>
                </div>

                <div className="grid-cards">
                  {related.map((entry) => (
                    <PostCard key={entry.slug} post={entry} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        );
      }