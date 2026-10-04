      import { Link } from '../lib/router.jsx';
      import { authorOf, formatDate, timeSince } from '../lib/posts.js';

      /**
       * `components/PostCard.jsx`
       *
       * The card used by both the home page and the archive. It takes the post, the
       * navigate function and an optional `featured` flag, which is why the home page
       * can pull one out of the archive list without duplicating the markup.
       *
       * The cover is a gradient rather than an image: there are no binary assets in
       * this template, and a gradient keyed off the post's `cover` field gives every
       * card a distinct first impression at zero cost.
       */
      export default function PostCard({ post, onNavigate, featured }) {
        const author = authorOf(post.author);

        return (
          <article className={'post-card' + (featured ? ' post-card--featured' : '')}>
            <div className={'post-card__gradient post-card__gradient--' + post.cover} aria-hidden="true">
              <span className="post-card__initials">{author.initials}</span>
              <span className="post-card__tape" />
            </div>

            <div className="post-card__body">
              <div className="post-card__tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link key={tag} to={'/blog?tag=' + tag} onNavigate={onNavigate} className="tag-pill">
                    {tag}
                  </Link>
                ))}
              </div>

              <h3 className="post-card__heading">
                <Link to={'/blog/' + post.slug} onNavigate={onNavigate}>
                  {post.title}
                </Link>
              </h3>

              <p className="post-card__excerpt">{post.excerpt}</p>

              <footer className="post-card__meta">
                <span className="avatar" aria-hidden="true">{author.initials}</span>
                <span className="post-card__byline">
                  {author.name}
                  <time className="post-card__date" dateTime={post.date} title={formatDate(post.date)}>
                    {timeSince(post.date)}
                  </time>
                </span>
                <span className="post-card__read">{post.readingTime} min read</span>
              </footer>
            </div>
          </article>
        );
      }