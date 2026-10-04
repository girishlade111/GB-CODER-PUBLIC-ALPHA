/**
 * plain-blog — "Vanilla Blog Layout"
 * Editorial blog: sticky glass header, reading progress, featured hero,
 * filterable post grid, editor's picks sidebar, stats band, newsletter CTA,
 * writers strip and a full multi-column footer.
 */
export default {
  html: `
<a class="skip-link" href="#main">Skip to content</a>
<div class="read-progress" role="presentation"><span class="read-progress__bar" id="readBar"></span></div>

<header class="site-header" id="siteHeader">
  <div class="shell site-header__inner">
    <a class="brand" href="#featured">
      <span class="brand__mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h7M8 11h5"/></svg></span>
      <span class="brand__name">Meridian<em>Journal</em></span>
    </a>

    <div class="site-header__panel" id="siteNav">
      <nav class="site-nav" aria-label="Primary">
        <ul class="site-nav__list">
          <li><a class="site-nav__link" href="#featured">Featured</a></li>
          <li><a class="site-nav__link" href="#latest">Latest</a></li>
          <li><a class="site-nav__link" href="#topics">Topics</a></li>
          <li><a class="site-nav__link" href="#authors">Writers</a></li>
          <li><a class="site-nav__link" href="#newsletter">Newsletter</a></li>
        </ul>
      </nav>
      <form class="nav-search" id="navSearch" role="search" novalidate>
        <svg class="icon nav-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/></svg>
        <label class="sr-only" for="q">Search articles</label>
        <input class="nav-search__input" id="q" name="q" type="search" placeholder="Search articles" autocomplete="off" spellcheck="false" />
      </form>
      <a class="btn btn--primary btn--sm site-header__cta" href="#newsletter">Subscribe</a>
    </div>

    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="siteNav">
      <span class="sr-only">Toggle navigation</span>
      <svg class="icon nav-toggle__open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      <svg class="icon nav-toggle__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </div>
</header>

<main id="main">
  <section class="hero" id="featured" aria-labelledby="heroTitle">
    <div class="shell hero__inner">
      <div class="hero__body" data-reveal>
        <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Cover story &middot; Issue 42</p>
        <h1 class="hero__title" id="heroTitle">The quiet craft of shipping software that outlives its authors</h1>
        <p class="hero__lede">Six maintainers, four decades of combined practice, and one shared opinion: the best systems are the ones nobody has to think about. A field guide to building software with a twenty-year horizon.</p>
        <div class="hero__meta">
          <span class="avatar avatar--clay" aria-hidden="true">AO</span>
          <span class="hero__byline"><strong>Adaeze Okonkwo</strong> &middot; 14 min read &middot; <time datetime="2026-03-18">18 March 2026</time></span>
        </div>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#latest">Read the feature <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
          <a class="btn btn--ghost" href="#topics">Browse topics</a>
        </div>
      </div>
      <figure class="hero__figure" data-reveal style="--delay:.12s">
        <div class="cover cover--feature" role="img" aria-label="Abstract amber and clay gradient artwork evoking layered archive boxes"></div>
        <figcaption>Plate I &mdash; Depreciation curves of a decade-old service, redrawn by hand.</figcaption>
      </figure>
    </div>
  </section>

  <div class="ticker" aria-hidden="true">
    <div class="ticker__track" id="tickerTrack">
      <span>Issue 42</span><span>Distributed systems</span><span>Field notes</span><span>Type design</span><span>Maintenance culture</span><span>Issue 42</span><span>Distributed systems</span><span>Field notes</span><span>Type design</span><span>Maintenance culture</span>
    </div>
  </div>

  <section class="section" id="latest" aria-labelledby="latestTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>The archive</p>
          <h2 class="section-title" id="latestTitle">Latest dispatches</h2>
        </div>
        <p class="section-note">Six pieces published this quarter, edited by the Meridian desk. Filter by desk or search the full index.</p>
      </header>

      <div class="filters" id="topics" data-reveal style="--delay:.06s">
        <div class="chip-row" id="chipRow" role="group" aria-label="Filter articles by desk">
          <button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All desks</button>
          <button class="chip" type="button" data-filter="craft" aria-pressed="false">Craft</button>
          <button class="chip" type="button" data-filter="process" aria-pressed="false">Process</button>
          <button class="chip" type="button" data-filter="infrastructure" aria-pressed="false">Infrastructure</button>
          <button class="chip" type="button" data-filter="design" aria-pressed="false">Design</button>
          <button class="chip" type="button" data-filter="business" aria-pressed="false">Business</button>
        </div>
        <p class="filter-status" id="filterStatus" role="status" aria-live="polite"></p>
      </div>

      <div class="layout">
        <div class="posts" id="postGrid">
          <article class="post-card" data-reveal data-cat="craft" data-haystack="the type of comment you leave behind craft review pull requests">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--1"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Craft</a><span class="pill pill--muted">9 min</span></div>
              <h3 class="post-card__title"><a href="#latest">The type of comment you leave behind</a></h3>
              <p class="post-card__excerpt">Code review is the only place most engineers ever write prose for each other. A short taxonomy of comments worth leaving, and the ones to delete.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--sand" aria-hidden="true">RM</span>
                <span class="post-card__byline"><strong>Rosa Mendel</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-03-12">12 Mar 2026</time></span>
              </footer>
            </div>
          </article>

          <article class="post-card" data-reveal style="--delay:.06s" data-cat="infrastructure" data-haystack="postgres connection pooling backpressure tailscale private link infrastructure">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--2"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Infrastructure</a><span class="pill pill--muted">16 min</span></div>
              <h3 class="post-card__title"><a href="#latest">Your database is not slow, your pool is</a></h3>
              <p class="post-card__excerpt">Three weeks of traces from a service that fell over at 400 requests per second, and the one configuration change that bought it four years of headroom.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--ink" aria-hidden="true">TN</span>
                <span class="post-card__byline"><strong>Tobias Nkemdirim</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-03-05">5 Mar 2026</time></span>
              </footer>
            </div>
          </article>

          <article class="post-card" data-reveal style="--delay:.12s" data-cat="process" data-haystack="onboarding remote teams written agreements process">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--3"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Process</a><span class="pill pill--muted">11 min</span></div>
              <h3 class="post-card__title"><a href="#latest">Onboarding is a document, not a meeting</a></h3>
              <p class="post-card__excerpt">We replaced the buddy system with a 42-page onboarding packet and watched the median time-to-first-commit fall from 19 days to 4.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--clay" aria-hidden="true">HK</span>
                <span class="post-card__byline"><strong>Hana Kowalski</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-02-27">27 Feb 2026</time></span>
              </footer>
            </div>
          </article>

          <article class="post-card" data-reveal data-cat="design" data-haystack="typography reading measure contrast accessibility design">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--4"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Design</a><span class="pill pill--muted">7 min</span></div>
              <h3 class="post-card__title"><a href="#latest">A measure of 66 characters and the case for boring type</a></h3>
              <p class="post-card__excerpt">We tested six variable fonts at three sizes on three devices. The winner was the one nobody wrote a blog post about.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--sand" aria-hidden="true">EV</span>
                <span class="post-card__byline"><strong>Elio Vargas</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-02-19">19 Feb 2026</time></span>
              </footer>
            </div>
          </article>

          <article class="post-card" data-reveal style="--delay:.06s" data-cat="business" data-haystack="pricing consulting retainers sustainable business revenue">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--5"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Business</a><span class="pill pill--muted">13 min</span></div>
              <h3 class="post-card__title"><a href="#latest">Pricing the work you actually want to do</a></h3>
              <p class="post-card__excerpt">Moving a 40-person studio off hourly billing cost us two clients and returned eleven months of margin. Here is the arithmetic.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--ink" aria-hidden="true">JS</span>
                <span class="post-card__byline"><strong>Julien Sauvage</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-02-08">8 Feb 2026</time></span>
              </footer>
            </div>
          </article>

          <article class="post-card" data-reveal style="--delay:.12s" data-cat="craft" data-haystack="testing property based generators craft">
            <a class="post-card__media" href="#latest" tabindex="-1" aria-hidden="true"><div class="cover cover--6"></div></a>
            <div class="post-card__body">
              <div class="post-card__tags"><a class="pill" href="#topics">Craft</a><span class="pill pill--muted">10 min</span></div>
              <h3 class="post-card__title"><a href="#latest">Property-based testing for people who hate property-based testing</a></h3>
              <p class="post-card__excerpt">You do not need a maths degree. You need one generator, one invariant, and a tolerance for finding the bug on a Tuesday.</p>
              <footer class="post-card__foot">
                <span class="avatar avatar--clay" aria-hidden="true">AO</span>
                <span class="post-card__byline"><strong>Adaeze Okonkwo</strong><span class="dot" aria-hidden="true"></span><time datetime="2026-01-29">29 Jan 2026</time></span>
              </footer>
            </div>
          </article>
        </div>

        <aside class="sidebar" aria-label="Editor's picks and index">
          <section class="panel panel--picks" aria-labelledby="picksTitle" data-reveal>
            <h3 class="panel__title" id="picksTitle">Editor's picks</h3>
            <ol class="picks">
              <li class="pick">
                <span class="pick__no" aria-hidden="true">01</span>
                <div>
                  <a class="pick__title" href="#latest">The maintenance manifesto</a>
                  <span class="pick__meta">Essay &middot; 6 min</span>
                </div>
              </li>
              <li class="pick">
                <span class="pick__no" aria-hidden="true">02</span>
                <div>
                  <a class="pick__title" href="#latest">What forty deploys a week actually cost</a>
                  <span class="pick__meta">Report &middot; 21 min</span>
                </div>
              </li>
              <li class="pick">
                <span class="pick__no" aria-hidden="true">03</span>
                <div>
                  <a class="pick__title" href="#latest">A design system with no components</a>
                  <span class="pick__meta">Interview &middot; 12 min</span>
                </div>
              </li>
            </ol>
          </section>

          <section class="panel" aria-labelledby="tagTitle" data-reveal style="--delay:.06s">
            <h3 class="panel__title" id="tagTitle">Index by tag</h3>
            <ul class="tag-cloud">
              <li><a class="tag" href="#topics">postgres <span>18</span></a></li>
              <li><a class="tag" href="#topics">review <span>24</span></a></li>
              <li><a class="tag" href="#topics">typescript <span>31</span></a></li>
              <li><a class="tag" href="#topics">hiring <span>9</span></a></li>
              <li><a class="tag" href="#topics">typography <span>14</span></a></li>
              <li><a class="tag" href="#topics">reliability <span>27</span></a></li>
              <li><a class="tag" href="#topics">pricing <span>7</span></a></li>
              <li><a class="tag" href="#topics">accessibility <span>22</span></a></li>
              <li><a class="tag" href="#topics">careers <span>16</span></a></li>
              <li><a class="tag" href="#topics">open source <span>29</span></a></li>
            </ul>
          </section>

          <section class="panel panel--accent" aria-labelledby="miniTitle" data-reveal style="--delay:.12s">
            <h3 class="panel__title" id="miniTitle">The Tuesday Letter</h3>
            <p class="panel__copy">One considered piece, every Tuesday at 07:00 GMT. No tracking pixels.</p>
            <form class="mini-form" id="miniForm" novalidate>
              <label class="sr-only" for="miniEmail">Email address</label>
              <input class="field__input" id="miniEmail" name="email" type="email" placeholder="you@studio.com" autocomplete="email" />
              <button class="btn btn--primary btn--block" type="submit">Join free</button>
              <p class="field__msg" id="miniMsg" role="status" aria-live="polite"></p>
            </form>
          </section>
        </aside>
      </div>
    </div>
  </section>

  <section class="stats" aria-labelledby="statsTitle" data-reveal>
    <div class="shell">
      <h2 class="sr-only" id="statsTitle">Journal at a glance</h2>
      <ul class="stats__grid">
        <li class="stat"><span class="stat__num" data-count="128" data-suffix="">0</span><span class="stat__label">Essays published</span></li>
        <li class="stat"><span class="stat__num" data-count="34" data-suffix="k">0</span><span class="stat__label">Monthly readers</span></li>
        <li class="stat"><span class="stat__num" data-count="19" data-suffix="">0</span><span class="stat__label">Contributing writers</span></li>
        <li class="stat"><span class="stat__num" data-count="6" data-suffix=" yrs">0</span><span class="stat__label">Published continuously</span></li>
      </ul>
    </div>
  </section>

  <section class="newsletter" id="newsletter" aria-labelledby="nlTitle" data-reveal>
    <div class="shell newsletter__inner">
      <div class="newsletter__body">
        <p class="eyebrow eyebrow--light"><span class="eyebrow__dot" aria-hidden="true"></span>Free, weekly, no noise</p>
        <h2 class="newsletter__title" id="nlTitle">Read one good essay before your first meeting.</h2>
        <p class="newsletter__lede">The Tuesday Letter goes out at 07:00 GMT. 41,200 engineers and designers read it; the archive is public and always will be.</p>
        <ul class="trust-row">
          <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> No advertising</li>
          <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Unsubscribe in one click</li>
          <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Full archive included</li>
        </ul>
      </div>
      <form class="newsletter__form" id="nlForm" novalidate>
        <div class="field">
          <label class="field__label" for="nlName">Name</label>
          <input class="field__input" id="nlName" name="name" type="text" autocomplete="name" placeholder="Ada Lovelace" />
          <p class="field__msg" id="nlNameMsg" role="alert"></p>
        </div>
        <div class="field">
          <label class="field__label" for="nlEmail">Work email</label>
          <input class="field__input" id="nlEmail" name="email" type="email" autocomplete="email" placeholder="you@studio.com" />
          <p class="field__msg" id="nlEmailMsg" role="alert"></p>
        </div>
        <div class="field field--row">
          <label class="check">
            <input type="checkbox" id="nlWeekly" checked />
            <span class="check__box" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span>
            <span class="check__text">Also send the fortnightly reading list</span>
          </label>
        </div>
        <button class="btn btn--accent btn--block" type="submit">Subscribe to the letter</button>
        <p class="form-status" id="nlStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>

  <section class="section" id="authors" aria-labelledby="authorsTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>The desk</p>
          <h2 class="section-title" id="authorsTitle">Writers we publish</h2>
        </div>
        <p class="section-note">Nineteen contributors across eleven cities. These three edit the quarterly issue end to end.</p>
      </header>
      <div class="authors">
        <article class="author" data-reveal>
          <span class="avatar avatar--lg avatar--clay" aria-hidden="true">AO</span>
          <h3 class="author__name">Adaeze Okonkwo</h3>
          <p class="author__role">Editor in chief &middot; Lagos</p>
          <p class="author__bio">Twelve years running payment infrastructure. Writes about correctness, money, and the paperwork nobody enjoys.</p>
          <a class="link-underline" href="#latest">12 essays</a>
        </article>
        <article class="author" data-reveal style="--delay:.08s">
          <span class="avatar avatar--lg avatar--sand" aria-hidden="true">RM</span>
          <h3 class="author__name">Rosa Mendel</h3>
          <p class="author__role">Senior editor &middot; Berlin</p>
          <p class="author__bio">Type designer by training. Argues that most code review advice is typography advice wearing a lanyard.</p>
          <a class="link-underline" href="#latest">9 essays</a>
        </article>
        <article class="author" data-reveal style="--delay:.16s">
          <span class="avatar avatar--lg avatar--ink" aria-hidden="true">TN</span>
          <h3 class="author__name">Tobias Nkemdirim</h3>
          <p class="author__role">Contributing editor &middot; Toronto</p>
          <p class="author__bio">SRE turned writer. Keeps a private database of every outage he has ever been paged for, and mines it quarterly.</p>
          <a class="link-underline" href="#latest">7 essays</a>
        </article>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="shell">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <span class="brand__mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 1-2-1.5Z"/><path d="M8 7h7M8 11h5"/></svg></span>
        <p class="site-footer__name">Meridian Journal</p>
        <p class="site-footer__blurb">An independent publication about building software that lasts. Edited in Lisbon and Lagos, funded entirely by readers.</p>
        <ul class="social" aria-label="Social links">
          <li><a class="social__link" href="#featured" aria-label="Meridian Journal on X"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
          <li><a class="social__link" href="#featured" aria-label="Meridian Journal on LinkedIn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.5 9.5V20M6.5 5v.01M10.5 20v-5.5a3 3 0 0 1 6 0V20"/></svg></a></li>
          <li><a class="social__link" href="#featured" aria-label="Meridian Journal on Instagram"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/></svg></a></li>
          <li><a class="social__link" href="#featured" aria-label="Meridian Journal RSS feed"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14"/></svg></a></li>
        </ul>
      </div>
      <nav class="site-footer__cols" aria-label="Footer">
        <div class="footer-col">
          <h3 class="footer-col__title">Read</h3>
          <ul><li><a href="#featured">Cover stories</a></li><li><a href="#latest">Longform</a></li><li><a href="#latest">Interviews</a></li><li><a href="#latest">Field notes</a></li><li><a href="#latest">The archive</a></li></ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-col__title">Topics</h3>
          <ul><li><a href="#topics">Craft</a></li><li><a href="#topics">Infrastructure</a></li><li><a href="#topics">Process</a></li><li><a href="#topics">Design systems</a></li><li><a href="#topics">Sustainable business</a></li></ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-col__title">Community</h3>
          <ul><li><a href="#newsletter">The Tuesday Letter</a></li><li><a href="#authors">Contributors</a></li><li><a href="#authors">Write for us</a></li><li><a href="#latest">Reader meetups</a></li><li><a href="#latest">Editorial policy</a></li></ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-col__title">Company</h3>
          <ul><li><a href="#featured">About</a></li><li><a href="#featured">Masthead</a></li><li><a href="#featured">Careers</a></li><li><a href="#featured">Press kit</a></li><li><a href="#featured">Contact</a></li></ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-col__title">Legal</h3>
          <ul><li><a href="#featured">Privacy</a></li><li><a href="#featured">Terms</a></li><li><a href="#featured">Cookie policy</a></li><li><a href="#featured">Accessibility</a></li><li><a href="#featured">Licences</a></li></ul>
        </div>
      </nav>
    </div>
    <div class="site-footer__legal">
      <p>&copy; 2026 Meridian Journal Cooperative. Set in Fraunces and Inter.</p>
      <p>ISSN 2754-0192 &middot; Printed in Lisbon and Porto-Novo</p>
    </div>
  </div>
</footer>

<button class="to-top" id="toTop" type="button" aria-label="Back to top of page">
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
</button>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --paper: #fbf7f0;
  --paper-2: #ffffff;
  --paper-3: #f4ece0;
  --ink: #1b1815;
  --ink-2: #423d38;
  --muted: #7b736b;
  --line: #e8ded0;
  --line-2: #d6c6b2;
  --accent: #b4530a;
  --accent-2: #8f3f07;
  --accent-soft: #f7e8d8;
  --on-accent: #fffaf3;
  --radius-sm: 6px;
  --radius: 12px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 2px rgba(43, 30, 18, .06), 0 1px 1px rgba(43, 30, 18, .04);
  --shadow: 0 6px 18px -8px rgba(43, 30, 18, .22), 0 2px 5px rgba(43, 30, 18, .06);
  --shadow-lg: 0 24px 48px -22px rgba(43, 30, 18, .35), 0 6px 14px rgba(43, 30, 18, .08);
  --font-display: 'Fraunces', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --shell: 1200px;
  --ease: cubic-bezier(.22, .68, 0, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: 92px; }
body {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.14; letter-spacing: -.015em; margin: 0; }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 200;
  transform: translateY(-160%);
  background: var(--ink); color: var(--paper);
  padding: .6rem 1rem; border-radius: var(--radius-sm); font-weight: 600;
  transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }
.shell { width: 100%; max-width: var(--shell); margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.15em; height: 1.15em; flex: none; }

/* ---------- reading progress ---------- */
.read-progress {
  position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 90;
  background: var(--line); pointer-events: none;
}
.read-progress__bar {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--accent-2), var(--accent));
  transition: width .1s linear;
}

/* ---------- header ---------- */
.site-header {
  position: sticky; top: 0; z-index: 80;
  background: color-mix(in srgb, var(--paper) 82%, transparent);
  backdrop-filter: blur(14px) saturate(1.3);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
}
.site-header.is-stuck {
  border-bottom-color: var(--line);
  box-shadow: 0 10px 30px -22px rgba(43, 30, 18, .5);
  background: color-mix(in srgb, var(--paper) 93%, transparent);
}
.site-header__inner {
  display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.75rem);
  min-height: 72px;
}
.brand { display: inline-flex; align-items: center; gap: .6rem; flex: none; }
.brand__mark {
  display: grid; place-items: center; width: 38px; height: 38px;
  border-radius: 10px; background: var(--ink); color: var(--paper);
}
.brand__mark .icon { width: 20px; height: 20px; }
.brand__name { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: -.02em; }
.brand__name em { font-style: italic; color: var(--accent); }

.site-header__panel { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.5rem); margin-left: auto; }
.site-nav__list { display: flex; align-items: center; gap: clamp(.5rem, 1.6vw, 1.35rem); }
.site-nav__link {
  position: relative; font-size: .875rem; font-weight: 500; color: var(--ink-2);
  padding: .4rem 0; transition: color .18s var(--ease);
}
.site-nav__link::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .25s var(--ease);
}
.site-nav__link:hover { color: var(--ink); }
.site-nav__link:hover::after, .site-nav__link:focus-visible::after { transform: scaleX(1); }

.nav-search { position: relative; display: flex; align-items: center; }
.nav-search__icon {
  position: absolute; left: .65rem; width: 15px; height: 15px;
  color: var(--muted); pointer-events: none;
}
.nav-search__input {
  width: clamp(9rem, 17vw, 14rem);
  padding: .5rem .75rem .5rem 2.1rem;
  font: inherit; font-size: .84rem;
  color: var(--ink);
  background: var(--paper-2);
  border: 1px solid var(--line); border-radius: 999px;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease), width .25s var(--ease);
}
.nav-search__input::placeholder { color: var(--muted); }
.nav-search__input:focus {
  width: clamp(11rem, 22vw, 17rem);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  outline: none;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .72rem 1.15rem;
  font-size: .875rem; font-weight: 600; letter-spacing: -.01em;
  border: 1px solid transparent; border-radius: 999px;
  cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease),
              border-color .2s var(--ease), color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--sm { padding: .5rem .95rem; font-size: .82rem; }
.btn--block { width: 100%; }
.btn--primary { background: var(--ink); color: var(--paper); box-shadow: var(--shadow-sm); }
.btn--primary:hover { background: var(--accent); box-shadow: var(--shadow); }
.btn--accent { background: var(--accent); color: var(--on-accent); box-shadow: 0 10px 22px -12px color-mix(in srgb, var(--accent) 70%, transparent); }
.btn--accent:hover { background: var(--accent-2); }
.btn--ghost { background: transparent; border-color: var(--line-2); color: var(--ink); }
.btn--ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

.nav-toggle {
  display: none; margin-left: auto;
  width: 42px; height: 42px; place-items: center;
  background: var(--paper-2); border: 1px solid var(--line); border-radius: 10px; cursor: pointer;
  transition: border-color .18s var(--ease), background .18s var(--ease);
}
.nav-toggle:hover { border-color: var(--accent); }
.nav-toggle .icon { width: 20px; height: 20px; grid-area: 1 / 1; }
.nav-toggle__close { opacity: 0; transform: scale(.7); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.nav-toggle[aria-expanded='true'] .nav-toggle__open { opacity: 0; transform: scale(.7); }
.nav-toggle[aria-expanded='true'] .nav-toggle__close { opacity: 1; transform: scale(1); }

/* ---------- hero ---------- */
.hero { padding-block: clamp(2.5rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 3rem); }
.hero__inner {
  display: grid; gap: clamp(1.75rem, 5vw, 4rem);
  grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
  align-items: center;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .74rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
  color: var(--accent-2);
}
.eyebrow__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse-dot 2.6s var(--ease) infinite; }
.eyebrow--light { color: color-mix(in srgb, var(--on-accent) 78%, transparent); }
.eyebrow--light .eyebrow__dot { background: var(--on-accent); }

.hero__title { font-size: clamp(2.15rem, 5.6vw, 3.85rem); margin-block: .85rem 1rem; }
.hero__title::first-letter { font-size: 1.05em; }
.hero__lede { font-size: clamp(1rem, 1.35vw, 1.12rem); color: var(--ink-2); max-width: 56ch; }
.hero__meta { display: flex; align-items: center; gap: .75rem; margin-top: 1.5rem; }
.hero__byline { font-size: .875rem; color: var(--muted); }
.hero__byline strong { color: var(--ink); font-weight: 600; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.75rem; }

.avatar {
  display: grid; place-items: center; flex: none;
  width: 38px; height: 38px; border-radius: 50%;
  font-size: .78rem; font-weight: 700; letter-spacing: .04em;
  color: var(--on-accent);
}
.avatar--lg { width: 62px; height: 62px; font-size: 1.1rem; }
.avatar--clay { background: linear-gradient(140deg, var(--accent), var(--accent-2)); }
.avatar--sand { background: linear-gradient(140deg, var(--line-2), var(--muted)); }
.avatar--ink { background: linear-gradient(140deg, var(--ink-2), var(--ink)); }

.hero__figure { margin: 0; }
.hero__figure figcaption {
  margin-top: .7rem; font-size: .78rem; color: var(--muted);
  border-left: 2px solid var(--accent); padding-left: .7rem;
}
.cover {
  aspect-ratio: 4 / 3; border-radius: var(--radius-lg);
  background-color: var(--accent-soft);
  box-shadow: var(--shadow-lg);
  overflow: hidden; position: relative;
}
.cover::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,.55), transparent 58%),
    repeating-linear-gradient(115deg, rgba(255,255,255,.16) 0 2px, transparent 2px 9px);
  mix-blend-mode: soft-light;
}
.cover--feature { aspect-ratio: 5 / 4; }
.cover--feature { background-image: radial-gradient(90% 120% at 8% 4%, #f6c88c, transparent 55%), linear-gradient(150deg, var(--accent) 0%, #6d2f05 100%); }
.cover--1 { background-image: linear-gradient(140deg, #e7a765, #8f3f07); }
.cover--2 { background-image: linear-gradient(140deg, #f3d6a8, #a8551a); }
.cover--3 { background-image: linear-gradient(140deg, #d98b52, #4a2408); }
.cover--4 { background-image: linear-gradient(140deg, #f0b98a, #b4530a); }
.cover--5 { background-image: linear-gradient(140deg, #c9713a, #33170a); }
.cover--6 { background-image: linear-gradient(140deg, #fadfbb, #7c3d06); }

/* ---------- ticker ---------- */
.ticker {
  overflow: hidden; border-block: 1px solid var(--line);
  background: var(--paper-3); padding-block: .65rem;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.ticker__track {
  display: flex; gap: 2.75rem; width: max-content;
  animation: marquee 34s linear infinite;
}
.ticker__track span {
  font-size: .78rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  color: var(--ink-2); white-space: nowrap;
}

/* ---------- sections ---------- */
.section { padding-block: clamp(3rem, 7vw, 5.5rem); }
.section-head {
  display: flex; flex-wrap: wrap; gap: 1rem 2.5rem;
  align-items: end; justify-content: space-between;
  padding-bottom: 1.5rem; margin-bottom: 1.75rem;
  border-bottom: 1px solid var(--line);
}
.section-title { font-size: clamp(1.6rem, 3.4vw, 2.4rem); margin-top: .5rem; }
.section-note { font-size: .9rem; color: var(--muted); max-width: 44ch; }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.chip-row { display: flex; flex-wrap: wrap; gap: .5rem; }
.chip {
  padding: .45rem .9rem; font-size: .82rem; font-weight: 600;
  background: var(--paper-2); border: 1px solid var(--line);
  border-radius: 999px; cursor: pointer;
  transition: background .18s var(--ease), color .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease);
}
.chip:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
.chip.is-active { background: var(--ink); border-color: var(--ink); color: var(--paper); }
.filter-status { font-size: .82rem; color: var(--muted); font-variant-numeric: tabular-nums; }

.layout { display: grid; gap: clamp(1.5rem, 3vw, 2.5rem); grid-template-columns: minmax(0, 1fr) minmax(0, 320px); align-items: start; }
.posts { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }

.post-card {
  display: flex; flex-direction: column;
  background: var(--paper-2); border: 1px solid var(--line); border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease);
}
.post-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--line-2); }
.post-card__media { display: block; }
.post-card__media .cover { border-radius: 0; box-shadow: none; aspect-ratio: 16 / 9; transition: transform .5s var(--ease); }
.post-card:hover .post-card__media .cover { transform: scale(1.045); }
.post-card__body { display: flex; flex-direction: column; gap: .7rem; padding: 1.15rem 1.25rem 1.25rem; flex: 1; }
.post-card__tags { display: flex; flex-wrap: wrap; gap: .4rem; }
.pill {
  display: inline-flex; align-items: center;
  padding: .22rem .6rem; border-radius: 999px;
  font-size: .7rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  background: var(--accent-soft); color: var(--accent-2);
  transition: background .18s var(--ease), color .18s var(--ease);
}
a.pill:hover { background: var(--accent); color: var(--on-accent); }
.pill--muted { background: var(--paper-3); color: var(--muted); }
.post-card__title { font-size: 1.16rem; line-height: 1.28; }
.post-card__title a { position: relative; }
.post-card__title a::after {
  content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .3s var(--ease);
}
.post-card__title a:hover::after { transform: scaleX(1); }
.post-card__excerpt { font-size: .89rem; color: var(--muted); flex: 1; }
.post-card__foot { display: flex; align-items: center; gap: .6rem; padding-top: .85rem; border-top: 1px solid var(--line); }
.post-card__byline { display: flex; flex-wrap: wrap; align-items: center; gap: .45rem; font-size: .78rem; color: var(--muted); }
.post-card__byline strong { color: var(--ink); font-weight: 600; }
.dot { width: 3px; height: 3px; border-radius: 50%; background: var(--line-2); }

.sidebar { display: grid; gap: 1.25rem; position: sticky; top: 96px; }
.panel {
  background: var(--paper-2); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 1.25rem;
}
.panel__title { font-size: 1.05rem; margin-bottom: .9rem; }
.panel__copy { font-size: .85rem; color: var(--muted); margin-bottom: .85rem; }
.panel--picks { background: var(--ink); border-color: var(--ink); color: var(--paper); }
.panel--picks .panel__title { color: var(--paper); }
.picks { display: grid; gap: 1rem; }
.pick { display: flex; gap: .85rem; align-items: start; }
.pick__no { font-family: var(--font-display); font-size: 1.5rem; line-height: 1; color: var(--accent); opacity: .85; }
.pick__title { display: block; font-size: .92rem; font-weight: 600; line-height: 1.35; }
.pick__title:hover { color: color-mix(in srgb, var(--accent) 70%, var(--paper)); }
.pick__meta { display: block; font-size: .74rem; color: color-mix(in srgb, var(--paper) 62%, transparent); margin-top: .2rem; }
.panel--accent { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 25%, var(--line)); }

.tag-cloud { display: flex; flex-wrap: wrap; gap: .4rem; }
.tag {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .3rem .65rem; font-size: .8rem;
  background: var(--paper-3); border: 1px solid transparent; border-radius: 999px;
  color: var(--ink-2);
  transition: background .18s var(--ease), color .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease);
}
.tag span { font-size: .68rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.tag:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); transform: translateY(-1px); }
.tag:hover span { color: color-mix(in srgb, var(--on-accent) 75%, transparent); }

.mini-form { display: grid; gap: .6rem; }

/* ---------- forms ---------- */
.field { display: grid; gap: .35rem; }
.field__label { font-size: .78rem; font-weight: 600; color: var(--ink-2); letter-spacing: .01em; }
.field__input {
  width: 100%; padding: .68rem .85rem;
  font: inherit; font-size: .9rem; color: var(--ink);
  background: var(--paper-2);
  border: 1px solid var(--line-2); border-radius: 10px;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
.field__input::placeholder { color: color-mix(in srgb, var(--muted) 78%, transparent); }
.field__input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.field__input.is-invalid { border-color: #b4232a; box-shadow: 0 0 0 3px rgba(180, 35, 42, .13); }
.field__msg { font-size: .76rem; min-height: 1em; color: #b4232a; }
.field__msg.is-ok { color: #2f6f4f; }
.check { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .84rem; color: var(--ink-2); }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.check__box {
  display: grid; place-items: center; flex: none;
  width: 20px; height: 20px; margin-top: 1px;
  border: 1px solid var(--line-2); border-radius: 6px; background: var(--paper-2);
  transition: background .18s var(--ease), border-color .18s var(--ease);
}
.check__box .icon { width: 13px; height: 13px; color: var(--on-accent); opacity: 0; transform: scale(.6); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.check input:checked + .check__box { background: var(--accent); border-color: var(--accent); }
.check input:checked + .check__box .icon { opacity: 1; transform: scale(1); }
.check input:focus-visible + .check__box { outline: 2px solid var(--accent); outline-offset: 2px; }
.form-status { font-size: .8rem; min-height: 1.2em; color: color-mix(in srgb, var(--on-accent) 82%, transparent); }

/* ---------- stats ---------- */
.stats { padding-block: clamp(2.25rem, 5vw, 3.5rem); background: var(--paper-3); border-block: 1px solid var(--line); }
.stats__grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); text-align: center; }
.stat { display: grid; gap: .25rem; }
.stat__num {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(2rem, 4.4vw, 2.9rem); line-height: 1; font-variant-numeric: tabular-nums;
  color: var(--accent-2);
}
.stat__label { font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }

/* ---------- newsletter ---------- */
.newsletter {
  padding-block: clamp(3rem, 7vw, 5rem);
  background:
    radial-gradient(90% 140% at 8% 0%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 55%),
    var(--ink);
  color: var(--paper);
}
.newsletter__inner { display: grid; gap: clamp(1.75rem, 4vw, 3.5rem); grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: center; }
.newsletter__title { font-size: clamp(1.7rem, 3.6vw, 2.5rem); margin-block: .7rem .9rem; }
.newsletter__lede { color: color-mix(in srgb, var(--paper) 76%, transparent); max-width: 52ch; }
.trust-row { display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 1.5rem; }
.trust-row li { display: flex; align-items: center; gap: .45rem; font-size: .84rem; color: color-mix(in srgb, var(--paper) 84%, transparent); }
.trust-row .icon { color: var(--accent); }
.newsletter__form { display: grid; gap: 1rem; padding: 1.5rem; background: color-mix(in srgb, var(--paper) 7%, transparent); border: 1px solid color-mix(in srgb, var(--paper) 16%, transparent); border-radius: var(--radius-lg); }
.newsletter__form .field__label { color: color-mix(in srgb, var(--paper) 82%, transparent); }
.newsletter__form .check__text { color: color-mix(in srgb, var(--paper) 80%, transparent); }
.newsletter__form .check__box { background: transparent; border-color: color-mix(in srgb, var(--paper) 34%, transparent); }

/* ---------- authors ---------- */
.authors { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)); }
.author {
  display: grid; gap: .55rem; justify-items: start;
  padding: 1.5rem; background: var(--paper-2);
  border: 1px solid var(--line); border-radius: var(--radius-lg);
  transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s var(--ease);
}
.author:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--line-2); }
.author__name { font-size: 1.1rem; }
.author__role { font-size: .76rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-2); font-weight: 600; }
.author__bio { font-size: .87rem; color: var(--muted); }
.link-underline { position: relative; font-size: .84rem; font-weight: 600; color: var(--accent); }
.link-underline::after {
  content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease);
}
.link-underline:hover::after { transform: scaleX(1); }

/* ---------- footer ---------- */
.site-footer { background: var(--ink); color: color-mix(in srgb, var(--paper) 78%, transparent); padding-top: clamp(2.5rem, 6vw, 4rem); }
.site-footer__top { display: grid; gap: clamp(2rem, 4vw, 3.5rem); grid-template-columns: minmax(0, 300px) minmax(0, 1fr); padding-bottom: 2.5rem; }
.site-footer__brand { display: grid; gap: .75rem; justify-items: start; }
.site-footer__brand .brand__mark { background: var(--accent); color: var(--on-accent); }
.site-footer__name { font-family: var(--font-display); font-size: 1.2rem; color: var(--paper); }
.site-footer__blurb { font-size: .86rem; }
.site-footer__cols { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
.footer-col__title { font-family: var(--font-body); font-size: .74rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-bottom: .8rem; }
.footer-col li + li { margin-top: .45rem; }
.footer-col a { font-size: .87rem; transition: color .18s var(--ease), padding-left .18s var(--ease); }
.footer-col a:hover { color: var(--paper); padding-left: 4px; }
.social { display: flex; gap: .5rem; }
.social__link {
  display: grid; place-items: center; width: 36px; height: 36px;
  border: 1px solid color-mix(in srgb, var(--paper) 20%, transparent); border-radius: 9px;
  transition: background .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease);
}
.social__link .icon { width: 17px; height: 17px; }
.social__link:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); transform: translateY(-2px); }
.site-footer__legal {
  display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; justify-content: space-between;
  padding-block: 1.1rem; border-top: 1px solid color-mix(in srgb, var(--paper) 14%, transparent);
  font-size: .78rem;
}

/* ---------- back to top ---------- */
.to-top {
  position: fixed; right: clamp(.9rem, 3vw, 1.75rem); bottom: clamp(.9rem, 3vw, 1.75rem); z-index: 70;
  display: grid; place-items: center; width: 46px; height: 46px;
  background: var(--ink); color: var(--paper);
  border: 1px solid var(--ink); border-radius: 50%; cursor: pointer;
  box-shadow: var(--shadow);
  opacity: 0; transform: translateY(14px) scale(.85); pointer-events: none;
  transition: opacity .28s var(--ease), transform .28s var(--ease), background .2s var(--ease);
}
.to-top.is-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.to-top:hover { background: var(--accent); }
.to-top .icon { width: 19px; height: 19px; }
.to-top.is-visible .icon { animation: nudge-up 1.8s var(--ease) infinite; }

/* ---------- reveal ---------- */
[data-reveal] { opacity: 0; transform: translateY(20px); }
[data-reveal].is-visible {
  opacity: 1; transform: none;
  transition: opacity .7s var(--ease), transform .7s var(--ease);
  transition-delay: var(--delay, 0s);
}

/* ---------- keyframes ---------- */
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pulse-dot { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent); } 50% { box-shadow: 0 0 0 6px transparent; } }
@keyframes nudge-up { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes drift { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(0, -8px, 0) rotate(1.2deg); } }

/* ---------- responsive ---------- */
@media (max-width: 1040px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .sidebar { position: static; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
  .site-footer__top { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 900px) {
  .nav-toggle { display: grid; }
  .site-header__panel {
    position: absolute; top: calc(100% + 1px); left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 1rem;
    padding: 1.1rem clamp(1rem, 4vw, 2.5rem) 1.4rem;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow);
    display: grid;
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .22s var(--ease), transform .22s var(--ease), visibility .22s;
  }
  .site-header__panel.is-open { opacity: 1; visibility: visible; transform: none; }
  .site-nav__list { flex-direction: column; align-items: stretch; gap: 0; }
  .site-nav__link { display: block; padding: .6rem 0; border-bottom: 1px solid var(--line); font-size: 1rem; }
  .nav-search__input, .nav-search__input:focus { width: 100%; }
  .site-header__cta { width: 100%; }
  .hero__inner { grid-template-columns: minmax(0, 1fr); }
  .newsletter__inner { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .stats__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .posts { grid-template-columns: minmax(0, 1fr); }
  .site-footer__legal { flex-direction: column; }
}

/* ---------- dark mode ---------- */
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #14110e;
    --paper-2: #1c1815;
    --paper-3: #241d18;
    --ink: #f4ece2;
    --ink-2: #ddd2c5;
    --muted: #a2968a;
    --line: #332a23;
    --line-2: #4a3d33;
    --accent: #e08a3c;
    --accent-2: #f0a962;
    --accent-soft: #2b2018;
    --on-accent: #1b1815;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, .5);
    --shadow: 0 6px 18px -8px rgba(0, 0, 0, .7), 0 2px 5px rgba(0, 0, 0, .4);
    --shadow-lg: 0 24px 48px -22px rgba(0, 0, 0, .85), 0 6px 14px rgba(0, 0, 0, .5);
  }
  .brand__mark { background: var(--accent); color: var(--on-accent); }
  .btn--primary { background: var(--accent); color: var(--on-accent); }
  .btn--primary:hover { background: var(--accent-2); }
  .chip.is-active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
  .panel--picks { background: var(--paper-3); border-color: var(--line-2); color: var(--ink-2); }
  .panel--picks .panel__title { color: var(--ink); }
  .newsletter, .site-footer { background: var(--paper-3); }
  .newsletter { background-image: radial-gradient(90% 140% at 8% 0%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 55%); }
  .newsletter__title, .site-footer__name { color: var(--ink); }
  .to-top { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
  .field__input.is-invalid { border-color: #ff6b6b; }
  .field__msg.is-ok { color: #6fd39a; }
}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .ticker__track { animation: none; transform: none; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- reveal */
function initReveal() {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('is-visible');
        io.unobserve(entries[j].target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
}

/* ------------------------------------------------- sticky header + progress */
function initHeader() {
  var header = document.getElementById('siteHeader');
  var bar = document.getElementById('readBar');
  var toTop = document.getElementById('toTop');
  var ticking = false;

  function frame() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 520);
    if (bar) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      var pct = Math.min(100, Math.max(0, (y / max) * 100));
      bar.style.width = pct.toFixed(2) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }, { passive: true });
  frame();
}

/* ------------------------------------------------------------ mobile nav */
function initNav() {
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('siteNav');
  if (!toggle || !panel) return;

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
  }

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.classList.toggle('is-open', !open);
  });

  var links = panel.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) links[i].addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
}

/* ------------------------------------------------- chips + search filtering */
function initFilters() {
  var chips = document.querySelectorAll('#chipRow .chip');
  var grid = document.getElementById('postGrid');
  var status = document.getElementById('filterStatus');
  var input = document.getElementById('q');
  if (!grid) return;

  var cards = grid.querySelectorAll('.post-card');
  var activeCat = 'all';

  function apply() {
    var q = input ? input.value.trim().toLowerCase() : '';
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var cat = card.getAttribute('data-cat') || '';
      var hay = (card.getAttribute('data-haystack') || '') + ' ' +
                (card.textContent || '').toLowerCase();
      var catOk = activeCat === 'all' || cat === activeCat;
      var qOk = q === '' || hay.indexOf(q) !== -1;
      var visible = catOk && qOk;
      card.style.display = visible ? '' : 'none';
      if (visible) shown++;
    }
    if (status) {
      status.textContent = shown === 1
        ? 'Showing 1 article'
        : 'Showing ' + shown + ' of ' + cards.length + ' articles';
    }
  }

  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () {
      activeCat = this.getAttribute('data-filter') || 'all';
      for (var j = 0; j < chips.length; j++) {
        var on = chips[j] === this;
        chips[j].classList.toggle('is-active', on);
        chips[j].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      apply();
    });
  }
  if (input) input.addEventListener('input', apply);
  apply();
}

/* ------------------------------------------------------------- counters */
function initCounters() {
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < nums.length; i++) {
      nums[i].textContent = nums[i].getAttribute('data-count') +
        (nums[i].getAttribute('data-suffix') || '');
    }
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (!entries[j].isIntersecting) continue;
      var node = entries[j].target;
      io.unobserve(node);
      countTo(node);
    }
  }, { threshold: 0.4 });

  function countTo(node) {
    var target = parseInt(node.getAttribute('data-count'), 10) || 0;
    var suffix = node.getAttribute('data-suffix') || '';
    var start = performance.now();
    var dur = 1200;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  for (var k = 0; k < nums.length; k++) io.observe(nums[k]);
}

/* -------------------------------------------------------- form validation */
var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;

function fieldError(input, msgNode, message) {
  if (input) input.classList.toggle('is-invalid', !!message);
  if (msgNode) {
    msgNode.textContent = message || '';
    msgNode.classList.toggle('is-ok', !message);
  }
}

function initNewsletter() {
  var form = document.getElementById('nlForm');
  if (form) {
    var name = document.getElementById('nlName');
    var email = document.getElementById('nlEmail');
    var nameMsg = document.getElementById('nlNameMsg');
    var emailMsg = document.getElementById('nlEmailMsg');
    var status = document.getElementById('nlStatus');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = name ? name.value.trim() : '';
      var em = email ? email.value.trim() : '';
      var bad = false;

      if (!n) { fieldError(name, nameMsg, 'Tell us what to call you.'); bad = true; }
      else if (n.length < 2) { fieldError(name, nameMsg, 'That name looks too short.'); bad = true; }
      else { fieldError(name, nameMsg, ''); }

      if (!em) { fieldError(email, emailMsg, 'An email address is required.'); bad = true; }
      else if (!EMAIL_RE.test(em)) { fieldError(email, emailMsg, 'Check the format: name@domain.com'); bad = true; }
      else { fieldError(email, emailMsg, ''); }

      if (bad) {
        if (status) status.textContent = 'We could not subscribe you just yet.';
        return;
      }
      if (status) status.textContent = 'Subscribed. Look for a confirmation note from us shortly.';
      form.reset();
    });

    var live = [name, email];
    for (var i = 0; i < live.length; i++) {
      live[i].addEventListener('blur', function () {
        var val = this.value.trim();
        var msg = this.id === 'nlEmail'
          ? (EMAIL_RE.test(val) ? '' : 'Check the format: name@domain.com')
          : (val.length >= 2 ? '' : 'Tell us what to call you.');
        fieldError(this, this.id === 'nlEmail' ? emailMsg : nameMsg, val ? msg : '');
      });
    }
  }

  var mini = document.getElementById('miniForm');
  if (mini) {
    var miniEmail = document.getElementById('miniEmail');
    var miniMsg = document.getElementById('miniMsg');
    mini.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = miniEmail ? miniEmail.value.trim() : '';
      if (!v) { fieldError(miniEmail, miniMsg, 'Email is required.'); return; }
      if (!EMAIL_RE.test(v)) { fieldError(miniEmail, miniMsg, 'That address looks incomplete.'); return; }
      fieldError(miniEmail, miniMsg, 'Done — issue 43 lands Tuesday.');
      mini.reset();
    });
  }
}

/* ------------------------------------------------------------ back to top */
function initToTop() {
  var btn = document.getElementById('toTop');
  if (!btn) return;
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}

/* ----------------------------------------------------------- smooth anchors */
function initAnchors() {
  if (reduce) return;
  var links = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      var href = this.getAttribute('href') || '';
      if (href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', href);
      }
    });
  }
}

initAnchors();
initReveal();
initHeader();
initNav();
initFilters();
initCounters();
initNewsletter();
initToTop();
`,
};