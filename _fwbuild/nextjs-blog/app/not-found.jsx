      import { Link } from '../lib/router.jsx';

      /**
       * `app/not-found.jsx` — the App Router's 404 boundary.
       *
       * In a real project this renders whenever a page calls `notFound()`, which is
       * what `app/blog/[slug]/page.jsx` does when `params.slug` matches nothing. It is
       * also what the framework serves for any unmatched URL automatically.
       *
       * Here `App.jsx` renders it directly for both cases: an unknown path, and a known
       * dynamic route whose slug is not in the dataset.
       */
      export default function NotFound() {
        return (
          <div className="page page--notfound">
            <div className="notfound">
              <p className="notfound__code">404</p>
              <h1 className="notfound__title">That page is not here</h1>
              <p className="notfound__body">
                The post you asked for does not exist, or the slug has changed. It happens - six posts
                is not a large archive.
              </p>

              <div className="notfound__actions">
                <Link to="/blog" className="button button--primary">
                  Browse the archive
                </Link>
                <Link to="/" className="button button--quiet">
                  Back to the front page
                </Link>
              </div>

              <p className="notfound__hint">
                <code>app/not-found.jsx</code> renders whenever a route calls <code>notFound()</code>.
              </p>
            </div>
          </div>
        );
      }