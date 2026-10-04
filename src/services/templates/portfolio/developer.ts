export default {
  html: `
<a class="skip-link" href="#main">Skip to main content</a>

<header class="site-header" id="siteHeader">
  <div class="wrap header__inner">
    <a class="brand" href="#top" aria-label="Ada Okonkwo, home">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>
      </span>
      <span class="brand__text">ada<span class="brand__dot">.</span>okonkwo</span>
    </a>
    <nav class="nav" id="primaryNav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="nav__link" href="#about">About</a></li>
        <li><a class="nav__link" href="#skills">Skills</a></li>
        <li><a class="nav__link" href="#work">Work</a></li>
        <li><a class="nav__link" href="#experience">Experience</a></li>
        <li><a class="nav__link" href="#activity">Activity</a></li>
        <li><a class="nav__link" href="#notes">Notes</a></li>
      </ul>
    </nav>
    <div class="header__actions">
      <button type="button" class="icon-btn" id="themeToggle" aria-label="Switch to light theme" aria-pressed="false">
        <svg class="icon icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="icon icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </button>
      <a class="btn btn--primary btn--sm" href="#contact">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>
        Get in touch
      </a>
      <button type="button" class="icon-btn nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Open navigation menu">
        <svg class="icon icon--menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="icon icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
  <div class="scroll-progress" aria-hidden="true"><span id="progressBar"></span></div>
</header>

<main id="main">

<section class="hero" id="top" aria-labelledby="hero-h">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="hero__grid" aria-hidden="true"></div>
  <div class="wrap hero__inner">
    <div class="hero__copy">
      <p class="status-badge" data-reveal>
        <span class="status-badge__dot" aria-hidden="true"></span>
        Currently building <strong>VectorDB&nbsp;v3</strong> — open to consulting
      </p>
      <h1 class="hero__title" id="hero-h" data-reveal>
        I build <span class="grad">reliable</span> software
        <span class="hero__caret" aria-hidden="true"></span>
      </h1>
      <div class="terminal" data-reveal aria-label="Introduction typed in a terminal">
        <div class="terminal__bar">
          <span class="terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="terminal__path">ada@portfolio:~</span>
        </div>
        <p class="terminal__line">
          <span class="terminal__prompt" aria-hidden="true">$</span>
          <span class="terminal__typed" id="typedText" aria-live="polite"></span><span class="terminal__caret" aria-hidden="true"></span>
        </p>
      </div>
      <p class="hero__lede" data-reveal>
        Staff-level front-end and platform engineer with eleven years shipping
        production systems. I specialise in design systems, rendering
        performance and the unglamorous plumbing that keeps teams shipping.
      </p>
      <div class="hero__cta" data-reveal>
        <a class="btn btn--primary" href="#work">
          View selected work
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </a>
        <a class="btn btn--ghost" href="#contact">Start a conversation</a>
      </div>
      <dl class="hero__stats" data-reveal>
        <div class="hero__stat"><dt>Years shipping</dt><dd><span class="count" data-count-to="11">0</span></dd></div>
        <div class="hero__stat"><dt>Production apps</dt><dd><span class="count" data-count-to="37">0</span></dd></div>
        <div class="hero__stat"><dt>Lighthouse p95</dt><dd><span class="count" data-count-to="99">0</span></dd></div>
        <div class="hero__stat"><dt>Stars given</dt><dd><span class="count" data-count-to="8400">0</span>+</dd></div>
      </dl>
    </div>

    <aside class="hero__card" data-reveal aria-label="Profile summary">
      <div class="profile-card">
        <div class="profile-card__top">
          <svg class="profile-card__avatar" viewBox="0 0 120 120" role="img" aria-label="Illustrated portrait of Ada Okonkwo">
            <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></linearGradient></defs>
            <rect width="120" height="120" rx="20" fill="url(#pg)" opacity=".16"/>
            <circle cx="60" cy="46" r="19" fill="url(#pg)"/>
            <path d="M22 104c0-20 17-32 38-32s38 12 38 32" fill="url(#pg)"/>
          </svg>
          <div>
            <p class="profile-card__name">Ada Okonkwo</p>
            <p class="profile-card__role">Staff Engineer · Lagos / Remote</p>
            <p class="profile-card__meta">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              Available for Q3
            </p>
          </div>
        </div>
        <dl class="profile-card__facts">
          <div><dt>Focus</dt><dd>Design systems, DX, performance</dd></div>
          <div><dt>Stack</dt><dd>TypeScript, React, Node, Rust</dd></div>
          <div><dt>Speaking</dt><dd>React Summit, JSConf EU</dd></div>
          <div><dt>Writing</dt><dd>14 essays on rendering</dd></div>
        </dl>
        <ul class="profile-card__links">
          <li><a href="#contact" aria-label="Email Ada"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>Email</a></li>
          <li><a href="#notes" aria-label="GitHub profile"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.7s-1.2-.4-4 1.5a13.4 13.4 0 0 0-7 0c-2.8-1.9-4-1.5-4-1.5A4.9 4.9 0 0 0 4.1 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22"/></svg>GitHub</a></li>
          <li><a href="#notes" aria-label="LinkedIn profile"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>LinkedIn</a></li>
        </ul>
      </div>
    </aside>
  </div>
</section>

<section class="marquee-band" aria-label="Teams I have worked with">
  <div class="marquee">
    <div class="marquee__track">
      <span>Vercel</span><span>Shopify</span><span>Stripe</span><span>Linear</span><span>Cloudflare</span><span>Figma</span><span>Datadog</span><span>Notion</span>
      <span>Vercel</span><span>Shopify</span><span>Stripe</span><span>Linear</span><span>Cloudflare</span><span>Figma</span><span>Datadog</span><span>Notion</span>
    </div>
  </div>
</section>

<section class="section" id="about" aria-labelledby="about-h">
  <div class="wrap about">
    <div class="about__copy">
      <p class="eyebrow" data-reveal>01 — About</p>
      <h2 class="section__title" id="about-h" data-reveal>Engineering that holds up in production</h2>
      <p data-reveal>I started out writing PHP form handlers in 2014 and never lost the instinct to ask <em>what happens when this fails</em>. That question shapes everything I build: budgets for the bundle, fallbacks for the network, and error states a support team can actually read.</p>
      <p data-reveal>These days I lead platform work — design systems, build pipelines and performance budgets — while staying close enough to the code to prototype. I mentor six engineers and maintain two small open-source libraries used in production by around four thousand teams.</p>
      <ul class="about__facts" data-reveal>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>Lagos, Nigeria — GMT+1</li>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Eleven years, four continents</li>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg>Open to advisory work</li>
      </ul>
    </div>
    <div class="about__panel" data-reveal>
      <h3 class="panel__title">Principles I work by</h3>
      <ol class="principles">
        <li><span class="principles__num">01</span><div><h4>Measure before you optimise</h4><p>Every performance claim ships with a trace attached. Guessing costs more than profiling.</p></div></li>
        <li><span class="principles__num">02</span><div><h4>Boring beats novel</h4><p>The database is not going away. Choose what the next hire can debug at 3am.</p></div></li>
        <li><span class="principles__num">03</span><div><h4>Design for the error path</h4><p>Happy paths are demos. Empty, loading, partial and offline states are the product.</p></div></li>
        <li><span class="principles__num">04</span><div><h4>Leave the campsite cleaner</h4><p>Every change leaves the codebase more legible than you found it.</p></div></li>
      </ol>
    </div>
  </div>
</section>

<section class="section section--soft" id="skills" aria-labelledby="skills-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>02 — Capabilities</p>
    <h2 class="section__title" id="skills-h" data-reveal>What I reach for</h2>
    <p class="section__lede" data-reveal>Self-assessed depth, calibrated against what I would happily be on call for.</p>
    <div class="filter-row" role="group" aria-label="Filter skills by discipline" data-reveal>
      <button type="button" class="chip is-active" data-skill-filter="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-skill-filter="frontend" aria-pressed="false">Front-end</button>
      <button type="button" class="chip" data-skill-filter="platform" aria-pressed="false">Platform</button>
      <button type="button" class="chip" data-skill-filter="backend" aria-pressed="false">Back-end</button>
      <button type="button" class="chip" data-skill-filter="practice" aria-pressed="false">Practice</button>
    </div>
    <div class="skills-grid" id="skillsGrid">
      <article class="skill" data-reveal data-category="frontend">
        <div class="skill__head"><h3>TypeScript</h3><span class="skill__pct">96%</span></div>
        <div class="meter" role="img" aria-label="TypeScript proficiency 96 percent"><span class="meter__fill" data-level="96"></span></div>
        <p>Strict-mode codebases, type-level state machines, no <code>any</code> in sight.</p>
      </article>
      <article class="skill" data-reveal data-category="frontend">
        <div class="skill__head"><h3>React &amp; rendering</h3><span class="skill__pct">94%</span></div>
        <div class="meter" role="img" aria-label="React and rendering proficiency 94 percent"><span class="meter__fill" data-level="94"></span></div>
        <p>Concurrent rendering, transitions, Suspense boundaries and hydration debugging.</p>
      </article>
      <article class="skill" data-reveal data-category="frontend">
        <div class="skill__head"><h3>CSS architecture</h3><span class="skill__pct">92%</span></div>
        <div class="meter" role="img" aria-label="CSS architecture proficiency 92 percent"><span class="meter__fill" data-level="92"></span></div>
        <p>Token layers, cascade layers, container queries and accessible motion.</p>
      </article>
      <article class="skill" data-reveal data-category="frontend">
        <div class="skill__head"><h3>Accessibility</h3><span class="skill__pct">90%</span></div>
        <div class="meter" role="img" aria-label="Accessibility proficiency 90 percent"><span class="meter__fill" data-level="90"></span></div>
        <p>WCAG 2.2 audits, screen-reader testing, focus management and reduced-motion paths.</p>
      </article>
      <article class="skill" data-reveal data-category="platform">
        <div class="skill__head"><h3>Build tooling</h3><span class="skill__pct">89%</span></div>
        <div class="meter" role="img" aria-label="Build tooling proficiency 89 percent"><span class="meter__fill" data-level="89"></span></div>
        <p>Vite and esbuild internals, monorepo graphs, cache strategy and CI wall time.</p>
      </article>
      <article class="skill" data-reveal data-category="platform">
        <div class="skill__head"><h3>Performance</h3><span class="skill__pct">93%</span></div>
        <div class="meter" role="img" aria-label="Performance proficiency 93 percent"><span class="meter__fill" data-level="93"></span></div>
        <p>Core Web Vitals, INP attribution, bundle budgets enforced in CI.</p>
      </article>
      <article class="skill" data-reveal data-category="platform">
        <div class="skill__head"><h3>Observability</h3><span class="skill__pct">85%</span></div>
        <div class="meter" role="img" aria-label="Observability proficiency 85 percent"><span class="meter__fill" data-level="85"></span></div>
        <p>OpenTelemetry, RUM, SLOs and dashboards people read during an incident.</p>
      </article>
      <article class="skill" data-reveal data-category="backend">
        <div class="skill__head"><h3>Node &amp; APIs</h3><span class="skill__pct">82%</span></div>
        <div class="meter" role="img" aria-label="Node and APIs proficiency 82 percent"><span class="meter__fill" data-level="82"></span></div>
        <p>Fastify, schema-first contracts, idempotent jobs and sane retry semantics.</p>
      </article>
      <article class="skill" data-reveal data-category="backend">
        <div class="skill__head"><h3>Rust</h3><span class="skill__pct">74%</span></div>
        <div class="meter" role="img" aria-label="Rust proficiency 74 percent"><span class="meter__fill" data-level="74"></span></div>
        <p>CLI tooling and hot-path services. Slow to write, very fast to run.</p>
      </article>
      <article class="skill" data-reveal data-category="practice">
        <div class="skill__head"><h3>Technical leadership</h3><span class="skill__pct">88%</span></div>
        <div class="meter" role="img" aria-label="Technical leadership proficiency 88 percent"><span class="meter__fill" data-level="88"></span></div>
        <p>RFC process, incident command, and decisions that survive the author leaving.</p>
      </article>
      <article class="skill" data-reveal data-category="practice">
        <div class="skill__head"><h3>Mentoring</h3><span class="skill__pct">91%</span></div>
        <div class="meter" role="img" aria-label="Mentoring proficiency 91 percent"><span class="meter__fill" data-level="91"></span></div>
        <p>Six engineers levelled up; two now lead their own teams.</p>
      </article>
      <article class="skill" data-reveal data-category="practice">
        <div class="skill__head"><h3>Writing</h3><span class="skill__pct">86%</span></div>
        <div class="meter" role="img" aria-label="Writing proficiency 86 percent"><span class="meter__fill" data-level="86"></span></div>
        <p>Design docs and essays. The best one changed a whole team's defaults.</p>
      </article>
    </div>
  </div>
</section>

<section class="section" id="work" aria-labelledby="work-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>03 — Selected work</p>
    <h2 class="section__title" id="work-h" data-reveal>Six things I am proud of</h2>
    <p class="section__lede" data-reveal>Case studies with the numbers that mattered, not the launch announcement.</p>
    <div class="work-grid" id="workGrid">
      <article class="work-card" data-reveal data-project="lattice">
        <div class="work-card__thumb thumb--lattice" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg></span></div>
        <div class="work-card__body">
          <h3>Lattice Design System</h3>
          <p>Token-driven component library adopted by nine product teams.</p>
          <ul class="tag-row"><li>React</li><li>Tokens</li><li>a11y</li></ul>
          <button type="button" class="link-btn" data-open-project="lattice">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
      <article class="work-card" data-reveal data-project="meridian">
        <div class="work-card__thumb thumb--meridian" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18M7 15v-4M12 15V8M17 15v-6"/></svg></span></div>
        <div class="work-card__body">
          <h3>Meridian Analytics</h3>
          <p>Realtime dashboard handling 40k events per second client-side.</p>
          <ul class="tag-row"><li>Canvas</li><li>WebSocket</li><li>D3</li></ul>
          <button type="button" class="link-btn" data-open-project="meridian">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
      <article class="work-card" data-reveal data-project="quill">
        <div class="work-card__thumb thumb--quill" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/></svg></span></div>
        <div class="work-card__body">
          <h3>Quill Editor</h3>
          <p>Collaborative rich-text editor with offline-first sync.</p>
          <ul class="tag-row"><li>CRDT</li><li>IndexedDB</li><li>Rust/WASM</li></ul>
          <button type="button" class="link-btn" data-open-project="quill">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
      <article class="work-card" data-reveal data-project="harbor">
        <div class="work-card__thumb thumb--harbor" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg></span></div>
        <div class="work-card__body">
          <h3>Harbor Auth</h3>
          <p>Passkey-first authentication used as an internal platform service.</p>
          <ul class="tag-row"><li>WebAuthn</li><li>Go</li><li>Security</li></ul>
          <button type="button" class="link-btn" data-open-project="harbor">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
      <article class="work-card" data-reveal data-project="relay">
        <div class="work-card__thumb thumb--relay" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m13 2-3 8h8l-7 12 2-9H5l8-11Z"/></svg></span></div>
        <div class="work-card__body">
          <h3>Relay CI</h3>
          <p>Monorepo build cache that cut pipeline time by two thirds.</p>
          <ul class="tag-row"><li>Bazel</li><li>Nx</li><li>Remote cache</li></ul>
          <button type="button" class="link-btn" data-open-project="relay">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
      <article class="work-card" data-reveal data-project="atlas">
        <div class="work-card__thumb thumb--atlas" aria-hidden="true"><span class="work-card__glyph"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/></svg></span></div>
        <div class="work-card__body">
          <h3>Atlas Docs</h3>
          <p>Documentation platform serving 300+ pages at 98/100 Lighthouse.</p>
          <ul class="tag-row"><li>MDX</li><li>SSG</li><li>Search</li></ul>
          <button type="button" class="link-btn" data-open-project="atlas">Read case study<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="section section--soft" id="experience" aria-labelledby="exp-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>04 — Experience</p>
    <h2 class="section__title" id="exp-h" data-reveal>Where I have worked</h2>
    <p class="section__lede" data-reveal>Select any role to expand what actually changed.</p>
    <ol class="timeline">
      <li class="timeline__item" data-reveal>
        <button type="button" class="timeline__head" aria-expanded="false" aria-controls="exp-1">
          <span class="timeline__rail" aria-hidden="true"><span class="timeline__dot"></span></span>
          <span class="timeline__meta"><span class="timeline__role">Staff Front-end Engineer</span><span class="timeline__org"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>Vercel</span></span>
          <span class="timeline__dates">2022 — Present</span>
          <svg class="icon timeline__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="timeline__panel" id="exp-1" hidden>
          <ul class="bullets">
            <li>Led the design-system rewrite that replaced four divergent component libraries with one.</li>
            <li>Cut median page weight from 1.9&nbsp;MB to 340&nbsp;KB by moving analytics off the main thread.</li>
            <li>Introduced enforced bundle budgets; regressions now fail CI rather than ship.</li>
            <li>Mentor four engineers; two promoted within eighteen months.</li>
          </ul>
          <p class="stack-row"><span>TypeScript</span><span>React</span><span>Vite</span><span>OpenTelemetry</span></p>
        </div>
      </li>
      <li class="timeline__item" data-reveal>
        <button type="button" class="timeline__head" aria-expanded="false" aria-controls="exp-2">
          <span class="timeline__rail" aria-hidden="true"><span class="timeline__dot"></span></span>
          <span class="timeline__meta"><span class="timeline__role">Senior Engineer, Platform</span><span class="timeline__org"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>Shopify</span></span>
          <span class="timeline__dates">2019 — 2022</span>
          <svg class="icon timeline__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="timeline__panel" id="exp-2" hidden>
          <ul class="bullets">
            <li>Owned the storefront rendering path serving 4.1&nbsp;M requests per day.</li>
            <li>Shipped an edge caching layer that removed origin load during seasonal peaks.</li>
            <li>Wrote the RFC that became the company-wide rendering budget policy.</li>
          </ul>
          <p class="stack-row"><span>React</span><span>Edge</span><span>Redis</span><span>GraphQL</span></p>
        </div>
      </li>
      <li class="timeline__item" data-reveal>
        <button type="button" class="timeline__head" aria-expanded="false" aria-controls="exp-3">
          <span class="timeline__rail" aria-hidden="true"><span class="timeline__dot"></span></span>
          <span class="timeline__meta"><span class="timeline__role">Front-end Engineer</span><span class="timeline__org"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>Stripe</span></span>
          <span class="timeline__dates">2017 — 2019</span>
          <svg class="icon timeline__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="timeline__panel" id="exp-3" hidden>
          <ul class="bullets">
            <li>Rebuilt the dashboard charting layer with virtualised tables holding 100k rows.</li>
            <li>Reduced time-to-interactive on the dashboard from 6.2&nbsp;s to 1.4&nbsp;s.</li>
            <li>Established the accessibility review checklist still used by the team.</li>
          </ul>
          <p class="stack-row"><span>JavaScript</span><span>D3</span><span>Jest</span><span>Axe</span></p>
        </div>
      </li>
      <li class="timeline__item" data-reveal>
        <button type="button" class="timeline__head" aria-expanded="false" aria-controls="exp-4">
          <span class="timeline__rail" aria-hidden="true"><span class="timeline__dot"></span></span>
          <span class="timeline__meta"><span class="timeline__role">Web Developer</span><span class="timeline__org"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>Freelance &amp; agency</span></span>
          <span class="timeline__dates">2014 — 2017</span>
          <svg class="icon timeline__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="timeline__panel" id="exp-4" hidden>
          <ul class="bullets">
            <li>Delivered 20+ client sites and internal tools across education, retail and logistics.</li>
            <li>Learned to estimate properly after a six-week project overran by four.</li>
            <li>Wrote the first version of the CSS reset I still use today.</li>
          </ul>
          <p class="stack-row"><span>PHP</span><span>jQuery</span><span>MySQL</span><span>WordPress</span></p>
        </div>
      </li>
    </ol>
  </div>
</section>

<section class="section" id="activity" aria-labelledby="act-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>05 — Open source</p>
    <h2 class="section__title" id="act-h" data-reveal>A year of small commits</h2>
    <p class="section__lede" data-reveal>Most of it documentation, tests and the unglamorous bug fixes nobody tweets about.</p>
    <div class="activity" data-reveal>
      <div class="activity__panel">
        <div class="activity__stats">
          <div><span class="activity__num" id="statTotal">0</span><span class="activity__label">contributions</span></div>
          <div><span class="activity__num" id="statStreak">0</span><span class="activity__label">day streak</span></div>
          <div><span class="activity__num" id="statRepos">0</span><span class="activity__label">repositories</span></div>
          <div><span class="activity__num" id="statStars">0</span><span class="activity__label">stars given</span></div>
        </div>
        <div class="heatmap-scroll"><div class="heatmap" id="heatmap" role="img" aria-label="Contribution heatmap for the last 53 weeks"></div></div>
        <div class="heatmap-legend">
          <span>Less</span>
          <i class="lv0" aria-hidden="true"></i><i class="lv1" aria-hidden="true"></i><i class="lv2" aria-hidden="true"></i><i class="lv3" aria-hidden="true"></i><i class="lv4" aria-hidden="true"></i>
          <span>More</span>
        </div>
      </div>
      <aside class="activity__side">
        <h3>Maintained libraries</h3>
        <ul class="repo-list">
          <li><span class="repo-list__name">use-intersection</span><span class="repo-list__desc">Tiny visibility hook, 2.1k stars</span></li>
          <li><span class="repo-list__name">token-lint</span><span class="repo-list__desc">Fails CI on raw hex values</span></li>
          <li><span class="repo-list__name">focus-trap-lite</span><span class="repo-list__desc">Accessible modal focus, 1.4k stars</span></li>
        </ul>
        <a class="btn btn--ghost btn--block" href="#contact">Sponsor the work<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></a>
      </aside>
    </div>
  </div>
</section>

<section class="section section--soft" id="testimonials" aria-labelledby="test-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>06 — References</p>
    <h2 class="section__title" id="test-h" data-reveal>What colleagues say</h2>
    <div class="quotes" data-reveal>
      <figure class="quote is-active" data-quote>
        <svg class="quote__mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3"/></svg>
        <blockquote><p>Ada is the rare engineer who will argue for a simpler design and then prove it with a trace. Our dashboard went from a weekly fire drill to a non-event.</p></blockquote>
        <figcaption>
          <svg class="quote__avatar" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="20" fill="var(--accent)" opacity=".2"/><circle cx="20" cy="16" r="7" fill="var(--accent)"/><path d="M6 38c0-8 6-13 14-13s14 5 14 13" fill="var(--accent)"/></svg>
          <span><strong>Priya Raman</strong>VP Engineering, Vercel</span>
        </figcaption>
      </figure>
      <figure class="quote" data-quote>
        <svg class="quote__mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3"/></svg>
        <blockquote><p>She rewrote our performance RFC from scratch and, unusually, the team actually followed it. Twelve months on, we are still hitting the targets she set.</p></blockquote>
        <figcaption>
          <svg class="quote__avatar" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="20" fill="var(--accent-2)" opacity=".2"/><circle cx="20" cy="16" r="7" fill="var(--accent-2)"/><path d="M6 38c0-8 6-13 14-13s14 5 14 13" fill="var(--accent-2)"/></svg>
          <span><strong>Marco Silva</strong>Director of Platform, Shopify</span>
        </figcaption>
      </figure>
      <figure class="quote" data-quote>
        <svg class="quote__mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3"/></svg>
        <blockquote><p>Ada took a prototype I had abandoned as "too ambitious" and shipped it in a quarter. Two of my engineers have since moved into platform work because of it.</p></blockquote>
        <figcaption>
          <svg class="quote__avatar" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="20" fill="var(--teal)" opacity=".24"/><circle cx="20" cy="16" r="7" fill="var(--teal)"/><path d="M6 38c0-8 6-13 14-13s14 5 14 13" fill="var(--teal)"/></svg>
          <span><strong>Dr. Hannah Weiss</strong>CTO, Northwind Labs</span>
        </figcaption>
      </figure>
    </div>
    <div class="quotes__nav" data-reveal>
      <button type="button" class="icon-btn" id="quotePrev" aria-label="Previous testimonial">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
      </button>
      <div class="quotes__dots" role="tablist" aria-label="Choose testimonial">
        <button type="button" class="quotes__dot is-active" role="tab" aria-selected="true" aria-label="Testimonial 1"></button>
        <button type="button" class="quotes__dot" role="tab" aria-selected="false" aria-label="Testimonial 2"></button>
        <button type="button" class="quotes__dot" role="tab" aria-selected="false" aria-label="Testimonial 3"></button>
      </div>
      <button type="button" class="icon-btn" id="quoteNext" aria-label="Next testimonial">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</section>

<section class="section" id="notes" aria-labelledby="notes-h">
  <div class="wrap">
    <p class="eyebrow" data-reveal>07 — Writing</p>
    <h2 class="section__title" id="notes-h" data-reveal>Notes from the workbench</h2>
    <p class="section__lede" data-reveal>Essays and post-mortems. No newsletter signup, no growth funnel.</p>
    <div class="notes-list">
      <a class="note" href="#notes" data-reveal>
        <span class="note__date">14 Mar 2026</span>
        <span class="note__body"><span class="note__title">Your INP budget is a lie until you test on mid-range hardware</span><span class="note__excerpt">Lab numbers on a workstation hide the main-thread work that hurts real users. Here is the harness I use before every release.</span></span>
        <span class="note__meta">9 min read</span>
        <svg class="icon note__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
      <a class="note" href="#notes" data-reveal>
        <span class="note__date">02 Feb 2026</span>
        <span class="note__body"><span class="note__title">We deleted 40% of our component library and shipped faster</span><span class="note__excerpt">A design system is not an asset, it is a maintenance surface. The math on when to stop adding.</span></span>
        <span class="note__meta">6 min read</span>
        <svg class="icon note__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
      <a class="note" href="#notes" data-reveal>
        <span class="note__date">19 Nov 2025</span>
        <span class="note__body"><span class="note__title">Accessibility checklists do not survive contact with a deadline</span><span class="note__excerpt">What actually worked: baking the checks into CI so arguing about them stops being a meeting.</span></span>
        <span class="note__meta">11 min read</span>
        <svg class="icon note__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
      <a class="note" href="#notes" data-reveal>
        <span class="note__date">07 Sep 2025</span>
        <span class="note__body"><span class="note__title">The hydration mismatch you cannot reproduce is probably stale</span><span class="note__excerpt">Four months of intermittent client errors, one missing cache header on an edge function.</span></span>
        <span class="note__meta">7 min read</span>
        <svg class="icon note__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
      <a class="note" href="#notes" data-reveal>
        <span class="note__date">23 May 2025</span>
        <span class="note__body"><span class="note__title">Mentoring is mostly editing documents badly written by smart people</span><span class="note__excerpt">Six years of running one-to-ones, and the highest-leverage thing I do is read drafts out loud.</span></span>
        <span class="note__meta">5 min read</span>
        <svg class="icon note__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
    </div>
  </div>
</section>

<section class="section section--soft" id="contact" aria-labelledby="contact-h">
  <div class="wrap contact">
    <div class="contact__intro">
      <p class="eyebrow" data-reveal>08 — Contact</p>
      <h2 class="section__title" id="contact-h" data-reveal>Let us talk about your project</h2>
      <p data-reveal>I take on two or three engagements a year — usually platform, design system or performance work. Tell me what is slow or stuck and I will reply within two working days.</p>
      <ul class="contact__channels" data-reveal>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg><span><strong>Email</strong>ada@okonkwo.dev</span></li>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg><span><strong>Typical reply</strong>Under 48 hours</span></li>
        <li><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span><strong>Next availability</strong>Q3 2026</span></li>
      </ul>
    </div>
    <form class="contact__form" id="contactForm" novalidate data-reveal>
      <div class="field">
        <label for="cfName">Name</label>
        <input type="text" id="cfName" name="name" autocomplete="name" placeholder="Priya Raman" aria-describedby="cfNameErr" required>
        <p class="field__error" id="cfNameErr" role="alert" hidden>Please tell me your name.</p>
      </div>
      <div class="field">
        <label for="cfEmail">Email</label>
        <input type="email" id="cfEmail" name="email" autocomplete="email" placeholder="you@company.com" aria-describedby="cfEmailErr" required>
        <p class="field__error" id="cfEmailErr" role="alert" hidden>That does not look like a valid email address.</p>
      </div>
      <div class="field">
        <label for="cfTopic">What is this about?</label>
        <select id="cfTopic" name="topic">
          <option value="platform">Platform &amp; infrastructure</option>
          <option value="design-system">Design system</option>
          <option value="performance">Performance audit</option>
          <option value="advisory">Advisory / mentoring</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div class="field">
        <label for="cfMsg">Project details</label>
        <textarea id="cfMsg" name="message" rows="5" placeholder="What are you working on, and what would make this a success?" aria-describedby="cfMsgErr cfMsgCount" required></textarea>
        <div class="field__foot">
          <p class="field__error" id="cfMsgErr" role="alert" hidden>A little more detail helps — at least 20 characters.</p>
          <span class="field__count" id="cfMsgCount">0 / 600</span>
        </div>
      </div>
      <button type="submit" class="btn btn--primary btn--block" id="cfSubmit">
        <span class="btn__label">Send message</span>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
      </button>
      <p class="contact__note">This demo validates locally and never sends anything anywhere.</p>
    </form>
  </div>
</section>

</main>

<footer class="site-footer">
  <div class="wrap footer__inner">
    <div class="footer__brand">
      <a class="brand" href="#top">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>
        </span>
        <span class="brand__text">ada<span class="brand__dot">.</span>okonkwo</span>
      </a>
      <p>Staff engineer working on design systems, rendering performance and the plumbing in between.</p>
      <ul class="footer__social">
        <li><a href="#top" aria-label="GitHub"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.7s-1.2-.4-4 1.5a13.4 13.4 0 0 0-7 0c-2.8-1.9-4-1.5-4-1.5A4.9 4.9 0 0 0 4.1 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22"/></svg></a></li>
        <li><a href="#top" aria-label="LinkedIn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg></a></li>
        <li><a href="#top" aria-label="Mastodon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-3.6 19.3c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5A3.9 3.9 0 0 1 6.7 8c-.1-.2-.4-1.2.1-2.4 0 0 .8-.3 2.6 1a9 9 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.4a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.8-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg></a></li>
        <li><a href="#top" aria-label="RSS feed"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/></svg></a></li>
      </ul>
    </div>
    <nav class="footer__cols" aria-label="Footer">
      <div>
        <h3>Work</h3>
        <ul><li><a href="#work">Lattice</a></li><li><a href="#work">Meridian</a></li><li><a href="#work">Quill</a></li><li><a href="#work">Harbor</a></li><li><a href="#work">Relay CI</a></li></ul>
      </div>
      <div>
        <h3>Writing</h3>
        <ul><li><a href="#notes">Essays</a></li><li><a href="#notes">Post-mortems</a></li><li><a href="#notes">Speaking</a></li><li><a href="#notes">Newsletter</a></li></ul>
      </div>
      <div>
        <h3>Open source</h3>
        <ul><li><a href="#activity">use-intersection</a></li><li><a href="#activity">token-lint</a></li><li><a href="#activity">focus-trap-lite</a></li></ul>
      </div>
      <div>
        <h3>Elsewhere</h3>
        <ul><li><a href="#about">About</a></li><li><a href="#experience">Experience</a></li><li><a href="#contact">Contact</a></li></ul>
      </div>
    </nav>
  </div>
  <div class="wrap footer__legal">
    <p>&copy; 2026 Ada Okonkwo. Built by hand, no template.</p>
    <p>Set in Inter and Space Grotesk.</p>
  </div>
</footer>

<div class="modal" id="projectModal" hidden>
  <div class="modal__scrim" data-close-modal></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="pmTitle" id="pmPanel" tabindex="-1">
    <div class="modal__head">
      <div>
        <p class="modal__eyebrow" id="pmEyebrow">Case study</p>
        <h2 class="modal__title" id="pmTitle">Project</h2>
      </div>
      <button type="button" class="icon-btn" data-close-modal aria-label="Close case study">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="modal__body" id="pmBody"></div>
  </div>
</div>

<button type="button" class="to-top" id="toTop" aria-label="Back to top" hidden>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 15 6-6 6 6"/></svg>
</button>

<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --bg: #08090d;
  --bg-soft: #0d0f16;
  --bg-elev: #12151f;
  --bg-elev-2: #171b27;
  --border: #232838;
  --border-strong: #333a4f;
  --text: #eef1f8;
  --text-muted: #9aa3b8;
  --text-dim: #6b7488;
  --accent: #6d8cff;
  --accent-2: #b07cff;
  --teal: #3fd8c4;
  --ring: rgba(109, 140, 255, .55);
  --grad: linear-gradient(120deg, var(--accent), var(--accent-2));
  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 20px;
  --radius-full: 999px;
  --shadow-1: 0 1px 2px rgba(0, 0, 0, .4);
  --shadow-2: 0 8px 24px rgba(0, 0, 0, .38);
  --shadow-3: 0 24px 60px rgba(0, 0, 0, .5);
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --wrap: 1180px;
  --ease: cubic-bezier(.22, 1, .36, 1);
  --header-h: 68px;
}

html[data-theme='light'] {
  --bg: #f7f8fb;
  --bg-soft: #ffffff;
  --bg-elev: #ffffff;
  --bg-elev-2: #f2f4f9;
  --border: #e3e7f0;
  --border-strong: #cbd2e1;
  --text: #131722;
  --text-muted: #5a6377;
  --text-dim: #858da0;
  --accent: #3a5bd9;
  --accent-2: #7c3aed;
  --teal: #0d9488;
  --ring: rgba(58, 91, 217, .45);
  --shadow-1: 0 1px 2px rgba(16, 24, 40, .06);
  --shadow-2: 0 8px 24px rgba(16, 24, 40, .08);
  --shadow-3: 0 24px 60px rgba(16, 24, 40, .14);
}

@media (prefers-color-scheme: light) {
  html:not([data-theme='dark']) {
    --bg: #f7f8fb;
    --bg-soft: #ffffff;
    --bg-elev: #ffffff;
    --bg-elev-2: #f2f4f9;
    --border: #e3e7f0;
    --border-strong: #cbd2e1;
    --text: #131722;
    --text-muted: #5a6377;
    --text-dim: #858da0;
    --accent: #3a5bd9;
    --accent-2: #7c3aed;
    --teal: #0d9488;
    --ring: rgba(58, 91, 217, .45);
    --shadow-1: 0 1px 2px rgba(16, 24, 40, .06);
    --shadow-2: 0 8px 24px rgba(16, 24, 40, .08);
    --shadow-3: 0 24px 60px rgba(16, 24, 40, .14);
  }
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.15; margin: 0; letter-spacing: -.02em; }
p { margin: 0; }
ul, ol, dl, dd { margin: 0; padding: 0; }
li { list-style: none; }
svg { display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
code { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: .9em; background: var(--bg-elev-2); border: 1px solid var(--border); border-radius: 5px; padding: .1em .35em; }
em { color: var(--text); font-style: italic; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: 1.5rem; }

.skip-link {
  position: absolute; left: 1rem; top: -100px; z-index: 200;
  padding: .75rem 1rem; background: var(--accent); color: #fff;
  border-radius: var(--radius-sm); font-weight: 600; transition: top .18s var(--ease);
}
.skip-link:focus { top: 1rem; }

.icon { width: 1.125em; height: 1.125em; flex: none; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .8rem 1.35rem; border-radius: var(--radius-full); font-weight: 600;
  font-size: .95rem; line-height: 1; position: relative; overflow: hidden;
  transition: transform .18s var(--ease), box-shadow .18s var(--ease), background .18s var(--ease), border-color .18s var(--ease);
}
.btn--sm { padding: .6rem 1.05rem; font-size: .875rem; }
.btn--block { width: 100%; }
.btn--primary { background: var(--grad); color: #fff; box-shadow: var(--shadow-2); }
.btn--primary::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, .28) 50%, transparent 80%);
  transform: translateX(-120%); transition: transform .6s var(--ease);
}
.btn--primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-3); }
.btn--primary:hover::after { transform: translateX(120%); }
.btn--primary:active { transform: translateY(0); }
.btn--ghost { border: 1px solid var(--border-strong); color: var(--text); background: transparent; }
.btn--ghost:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
.btn.is-busy { pointer-events: none; opacity: .7; }
.btn.is-busy .icon { animation: spin-slow .9s linear infinite; }

.icon-btn {
  display: inline-grid; place-items: center; width: 40px; height: 40px;
  border-radius: var(--radius-sm); border: 1px solid var(--border); color: var(--text-muted);
  transition: color .18s var(--ease), border-color .18s var(--ease), background .18s var(--ease);
}
.icon-btn:hover { color: var(--text); border-color: var(--border-strong); background: var(--bg-elev-2); }

/* Reveal */
[data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }

/* Header */
.site-header {
  position: sticky; top: 0; z-index: 100;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), background .25s var(--ease), box-shadow .25s var(--ease);
}
.site-header.is-stuck { border-bottom-color: var(--border); box-shadow: var(--shadow-1); }
.header__inner { min-height: var(--header-h); display: flex; align-items: center; gap: 1.5rem; }

.brand { display: inline-flex; align-items: center; gap: .5rem; font-family: var(--font-display); font-weight: 700; letter-spacing: -.02em; }
.brand__mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: var(--grad); color: #fff; transition: transform .3s var(--ease); }
.brand:hover .brand__mark { transform: rotate(-8deg) scale(1.06); }
.brand__text { font-size: 1.02rem; }
.brand__dot { color: var(--accent); }

.nav { margin-inline-start: auto; }
.nav__list { display: flex; align-items: center; gap: .25rem; }
.nav__link { position: relative; display: block; padding: .5rem .75rem; font-size: .92rem; color: var(--text-muted); border-radius: var(--radius-sm); transition: color .18s var(--ease); }
.nav__link::after { content: ''; position: absolute; left: .75rem; right: .75rem; bottom: .3rem; height: 1.5px; background: var(--grad); transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease); }
.nav__link:hover { color: var(--text); }
.nav__link:hover::after { transform: scaleX(1); }
.nav__link.is-active { color: var(--text); }
.nav__link.is-active::after { transform: scaleX(1); }

.header__actions { display: flex; align-items: center; gap: .5rem; }
.icon--moon { display: none; }
html[data-theme='light'] .icon--sun { display: none; }
html[data-theme='light'] .icon--moon { display: block; }
@media (prefers-color-scheme: light) {
  html:not([data-theme='dark']) .icon--sun { display: none; }
  html:not([data-theme='dark']) .icon--moon { display: block; }
}
.nav-toggle { display: none; }
.nav-toggle .icon--close { display: none; }
.nav-toggle[aria-expanded='true'] .icon--close { display: block; }
.nav-toggle[aria-expanded='true'] .icon--menu { display: none; }
.scroll-progress { height: 2px; }
.scroll-progress span { display: block; height: 100%; width: 0; background: var(--grad); transition: width .1s linear; }

/* Hero */
.hero { position: relative; overflow: hidden; padding: 7rem 0 4.5rem; }
.hero__glow {
  position: absolute; inset: -40% -20% auto -20%; height: 620px;
  background: radial-gradient(46% 52% at 22% 38%, color-mix(in srgb, var(--accent) 34%, transparent), transparent 70%),
              radial-gradient(40% 46% at 78% 26%, color-mix(in srgb, var(--accent-2) 30%, transparent), transparent 72%);
  filter: blur(28px); animation: drift 22s var(--ease) infinite alternate; pointer-events: none;
}
.hero__grid {
  position: absolute; inset: 0; opacity: .5; pointer-events: none;
  background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(70% 60% at 50% 30%, #000, transparent 78%);
}
.hero__inner { position: relative; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, .85fr); gap: 3rem; align-items: start; }

.status-badge { display: inline-flex; align-items: center; gap: .5rem; padding: .45rem .9rem; border: 1px solid var(--border); border-radius: var(--radius-full); background: var(--bg-elev); font-size: .82rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.status-badge strong { color: var(--text); font-weight: 600; }
.status-badge__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse-ring 2.4s ease-out infinite; }

.hero__title { font-size: clamp(2.4rem, 6.2vw, 4.2rem); font-weight: 700; margin-bottom: 1.5rem; }
.grad { background: var(--grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero__caret { display: inline-block; width: .09em; height: .82em; margin-inline-start: .1em; background: var(--accent); vertical-align: -.06em; animation: blink 1.05s steps(2, start) infinite; }

.terminal { border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); box-shadow: var(--shadow-2); overflow: hidden; margin-bottom: 1.5rem; max-width: 46rem; }
.terminal__bar { display: flex; align-items: center; gap: .75rem; padding: .6rem .9rem; border-bottom: 1px solid var(--border); background: var(--bg-elev-2); }
.terminal__dots { display: flex; gap: 6px; }
.terminal__dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--border-strong); }
.terminal__dots i:nth-child(1) { background: #ff5f57; }
.terminal__dots i:nth-child(2) { background: #febc2e; }
.terminal__dots i:nth-child(3) { background: #28c840; }
.terminal__path { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .78rem; color: var(--text-dim); }
.terminal__line { display: flex; align-items: baseline; gap: .6rem; padding: .9rem; min-height: 3.2rem; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .9rem; flex-wrap: wrap; }
.terminal__prompt { color: var(--teal); font-weight: 700; }
.terminal__typed { color: var(--text); }
.terminal__caret { display: inline-block; width: 8px; height: 1.05em; background: var(--accent); animation: blink 1.05s steps(2, start) infinite; align-self: center; }

.hero__lede { font-size: 1.06rem; color: var(--text-muted); max-width: 40rem; margin-bottom: 2rem; }
.hero__cta { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 3rem; }
.hero__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.hero__stat dt { font-size: .78rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .08em; }
.hero__stat dd { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; }

.profile-card { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); box-shadow: var(--shadow-2); padding: 1.5rem; }
.profile-card__top { display: flex; gap: 1rem; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
.profile-card__avatar { width: 72px; height: 72px; border-radius: var(--radius); flex: none; }
.profile-card__name { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; }
.profile-card__role { font-size: .86rem; color: var(--text-muted); }
.profile-card__meta { display: flex; align-items: center; gap: .35rem; font-size: .8rem; color: var(--teal); margin-top: .3rem; }
.profile-card__facts { display: grid; gap: .75rem; padding-block: 1rem; }
.profile-card__facts > div { display: flex; justify-content: space-between; gap: .75rem; font-size: .85rem; }
.profile-card__facts dt { color: var(--text-dim); }
.profile-card__facts dd { text-align: right; color: var(--text); }
.profile-card__links { display: flex; gap: .5rem; flex-wrap: wrap; }
.profile-card__links a { display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .8rem; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: .82rem; color: var(--text-muted); transition: color .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease); }
.profile-card__links a:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-2px); }

/* Marquee */
.marquee-band { border-block: 1px solid var(--border); background: var(--bg-soft); padding-block: 1.5rem; overflow: hidden; }
.marquee { display: flex; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.marquee__track { display: flex; align-items: center; gap: 3rem; padding-inline-end: 3rem; flex: none; animation: marquee 34s linear infinite; }
.marquee-band:hover .marquee__track { animation-play-state: paused; }
.marquee__track span { font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; color: var(--text-dim); white-space: nowrap; transition: color .2s var(--ease); }
.marquee__track span:hover { color: var(--text); }

/* Sections */
.section { padding-block: 7rem; }
.section--soft { background: var(--bg-soft); border-block: 1px solid var(--border); }
.eyebrow { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-bottom: .75rem; }
.section__title { font-size: clamp(1.8rem, 4vw, 2.7rem); margin-bottom: .75rem; max-width: 22ch; }
.section__lede { color: var(--text-muted); max-width: 56ch; margin-bottom: 3rem; }

/* About */
.about { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .85fr); gap: 3rem; align-items: start; }
.about__copy p { color: var(--text-muted); margin-bottom: 1rem; max-width: 58ch; }
.about__facts { display: grid; gap: .5rem; margin-top: 1.5rem; }
.about__facts li { display: flex; align-items: center; gap: .5rem; font-size: .9rem; color: var(--text-muted); }
.about__facts .icon { color: var(--accent); }
.about__panel { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); padding: 1.5rem; }
.panel__title { font-size: 1.05rem; margin-bottom: 1rem; }
.principles { display: grid; gap: 1rem; }
.principles li { display: flex; gap: 1rem; }
.principles__num { font-family: var(--font-display); font-size: .82rem; font-weight: 700; color: var(--accent); padding-top: .15rem; flex: none; }
.principles h4 { font-size: .95rem; margin-bottom: .2rem; }
.principles p { font-size: .88rem; color: var(--text-muted); }

/* Skills */
.filter-row { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 2rem; }
.chip { padding: .5rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: .85rem; color: var(--text-muted); transition: color .18s var(--ease), border-color .18s var(--ease), background .18s var(--ease); }
.chip:hover { color: var(--text); border-color: var(--border-strong); }
.chip.is-active { background: var(--grad); border-color: transparent; color: #fff; }
.skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.skill { border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); padding: 1.5rem; transition: transform .22s var(--ease), border-color .22s var(--ease), box-shadow .22s var(--ease); }
.skill:hover { transform: translateY(-4px); border-color: var(--border-strong); box-shadow: var(--shadow-2); }
.skill.is-hidden { display: none; }
.skill__head { display: flex; align-items: baseline; justify-content: space-between; gap: .75rem; margin-bottom: .75rem; }
.skill__head h3 { font-size: 1rem; }
.skill__pct { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; color: var(--accent); }
.skill p { font-size: .86rem; color: var(--text-muted); margin-top: .75rem; }
.meter { height: 6px; border-radius: var(--radius-full); background: var(--bg-elev-2); overflow: hidden; }
.meter__fill { display: block; height: 100%; width: 0; background: var(--grad); border-radius: inherit; transition: width 1.1s var(--ease); }

/* Work */
.work-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.work-card { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); overflow: hidden; transition: transform .25s var(--ease), border-color .25s var(--ease), box-shadow .25s var(--ease); }
.work-card:hover { transform: translateY(-6px); border-color: var(--border-strong); box-shadow: var(--shadow-3); }
.work-card__thumb { position: relative; aspect-ratio: 16 / 10; display: grid; place-items: center; overflow: hidden; }
.work-card__thumb::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--bg) 82%, transparent)); opacity: .9; }
.work-card__glyph { position: relative; z-index: 1; display: grid; place-items: center; width: 62px; height: 62px; border-radius: var(--radius); background: color-mix(in srgb, var(--bg) 55%, transparent); border: 1px solid rgba(255, 255, 255, .18); color: #fff; backdrop-filter: blur(6px); transition: transform .3s var(--ease); }
.work-card__glyph .icon { width: 26px; height: 26px; }
.work-card:hover .work-card__glyph { transform: scale(1.12) rotate(-6deg); }
.thumb--lattice { background: linear-gradient(135deg, #3b4cca, #7c3aed 55%, #b07cff); }
.thumb--meridian { background: linear-gradient(135deg, #0d9488, #3fd8c4 60%, #0ea5e9); }
.thumb--quill { background: linear-gradient(135deg, #b45309, #f5b544 55%, #fbbf24); }
.thumb--harbor { background: linear-gradient(135deg, #065f46, #10b981 55%, #34d399); }
.thumb--relay { background: linear-gradient(135deg, #be123c, #f43f5e 55%, #fb7185); }
.thumb--atlas { background: linear-gradient(135deg, #1e40af, #3b82f6 55%, #60a5fa); }
.work-card__body { display: flex; flex-direction: column; gap: .5rem; padding: 1.5rem; flex: 1; }
.work-card__body h3 { font-size: 1.1rem; }
.work-card__body p { font-size: .88rem; color: var(--text-muted); }
.tag-row { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: auto; padding-top: .75rem; }
.tag-row li { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .72rem; padding: .22rem .55rem; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-dim); }
.link-btn { display: inline-flex; align-items: center; gap: .4rem; align-self: flex-start; margin-top: .5rem; font-size: .88rem; font-weight: 600; color: var(--accent); }
.link-btn .icon { transition: transform .2s var(--ease); }
.link-btn:hover .icon { transform: translateX(4px); }

/* Timeline */
.timeline { display: grid; gap: .75rem; }
.timeline__item { border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); overflow: hidden; transition: border-color .2s var(--ease); }
.timeline__item:hover { border-color: var(--border-strong); }
.timeline__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1.5rem; text-align: left; }
.timeline__rail { display: grid; place-items: center; width: 14px; height: 14px; }
.timeline__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--border-strong); transition: background .2s var(--ease), box-shadow .2s var(--ease); }
.timeline__item.is-open .timeline__dot { background: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent); }
.timeline__meta { display: grid; gap: .1rem; min-width: 0; }
.timeline__role { font-family: var(--font-display); font-weight: 600; font-size: 1rem; }
.timeline__org { display: inline-flex; align-items: center; gap: .35rem; font-size: .85rem; color: var(--text-muted); }
.timeline__org .icon { width: .95em; height: .95em; }
.timeline__dates { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; color: var(--text-dim); white-space: nowrap; }
.timeline__chev { color: var(--text-dim); transition: transform .25s var(--ease); }
.timeline__item.is-open .timeline__chev { transform: rotate(180deg); }
.timeline__panel { padding: 0 1.5rem 1.5rem calc(1.5rem + 30px); }
.bullets { display: grid; gap: .5rem; }
.bullets li { position: relative; padding-inline-start: 1rem; font-size: .88rem; color: var(--text-muted); }
.bullets li::before { content: ''; position: absolute; left: 0; top: .62em; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.stack-row { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.stack-row span { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .72rem; padding: .22rem .55rem; border-radius: var(--radius-sm); background: var(--bg-elev-2); color: var(--text-dim); }

/* Activity */
.activity { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .6fr); gap: 1.5rem; align-items: start; }
.activity__panel { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); padding: 1.5rem; }
.activity__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 1rem; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
.activity__stats > div { display: grid; gap: .1rem; }
.activity__num { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; }
.activity__label { font-size: .78rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .07em; }
.heatmap-scroll { overflow-x: auto; padding-bottom: .5rem; }
.heatmap { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr); gap: 3px; min-width: max-content; }
.heatmap i { width: 11px; height: 11px; border-radius: 3px; background: var(--bg-elev-2); transition: transform .12s var(--ease); }
.heatmap i:hover { transform: scale(1.35); outline: 1px solid var(--text-muted); }
.heatmap .lv1 { background: color-mix(in srgb, var(--accent) 28%, var(--bg-elev-2)); }
.heatmap .lv2 { background: color-mix(in srgb, var(--accent) 52%, var(--bg-elev-2)); }
.heatmap .lv3 { background: color-mix(in srgb, var(--accent) 76%, var(--bg-elev-2)); }
.heatmap .lv4 { background: var(--accent); }
.heatmap-legend { display: flex; align-items: center; gap: 5px; margin-top: .75rem; font-size: .76rem; color: var(--text-dim); }
.heatmap-legend i { width: 11px; height: 11px; border-radius: 3px; background: var(--bg-elev-2); }
.heatmap-legend .lv1 { background: color-mix(in srgb, var(--accent) 28%, var(--bg-elev-2)); }
.heatmap-legend .lv2 { background: color-mix(in srgb, var(--accent) 52%, var(--bg-elev-2)); }
.heatmap-legend .lv3 { background: color-mix(in srgb, var(--accent) 76%, var(--bg-elev-2)); }
.heatmap-legend .lv4 { background: var(--accent); }
.activity__side { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); padding: 1.5rem; }
.activity__side h3 { font-size: 1rem; margin-bottom: 1rem; }
.repo-list { display: grid; gap: .75rem; margin-bottom: 1.5rem; }
.repo-list li { display: grid; gap: .1rem; padding-bottom: .75rem; border-bottom: 1px solid var(--border); }
.repo-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.repo-list__name { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .85rem; color: var(--accent); }
.repo-list__desc { font-size: .82rem; color: var(--text-muted); }

/* Quotes */
.quotes { position: relative; min-height: 260px; }
.quote { display: none; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); padding: 2rem; animation: fade-in .45s var(--ease); }
.quote.is-active { display: block; }
.quote__mark { width: 34px; height: 34px; color: var(--accent); opacity: .5; margin-bottom: 1rem; }
.quote blockquote p { font-family: var(--font-display); font-size: clamp(1.1rem, 2.4vw, 1.5rem); line-height: 1.45; letter-spacing: -.015em; }
.quote figcaption { display: flex; align-items: center; gap: .75rem; margin-top: 1.5rem; }
.quote__avatar { width: 40px; height: 40px; flex: none; }
.quote figcaption span { display: grid; font-size: .85rem; color: var(--text-muted); }
.quote figcaption strong { color: var(--text); font-size: .95rem; }
.quotes__nav { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
.quotes__dots { display: flex; gap: .5rem; }
.quotes__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); transition: width .22s var(--ease), background .22s var(--ease); }
.quotes__dot.is-active { width: 26px; border-radius: var(--radius-full); background: var(--grad); }

/* Notes */
.notes-list { display: grid; gap: .5rem; }
.note { display: grid; grid-template-columns: 130px minmax(0, 1fr) auto auto; align-items: center; gap: 1rem; padding: 1rem 1.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); transition: transform .2s var(--ease), border-color .2s var(--ease), background .2s var(--ease); }
.note:hover { transform: translateX(5px); border-color: var(--accent); background: var(--bg-elev-2); }
.note__date { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .78rem; color: var(--text-dim); white-space: nowrap; }
.note__body { display: grid; gap: .2rem; min-width: 0; }
.note__title { font-family: var(--font-display); font-weight: 600; font-size: 1rem; }
.note__excerpt { font-size: .85rem; color: var(--text-muted); }
.note__meta { font-size: .78rem; color: var(--text-dim); white-space: nowrap; }
.note__arrow { color: var(--text-dim); transition: transform .2s var(--ease), color .2s var(--ease); }
.note:hover .note__arrow { transform: translate(3px, -3px); color: var(--accent); }

/* Contact */
.contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .95fr); gap: 3rem; align-items: start; }
.contact__intro p { color: var(--text-muted); max-width: 46ch; }
.contact__channels { display: grid; gap: .75rem; margin-top: 2rem; }
.contact__channels li { display: flex; align-items: center; gap: .75rem; }
.contact__channels .icon { color: var(--accent); }
.contact__channels span { display: grid; font-size: .86rem; color: var(--text-muted); }
.contact__channels strong { color: var(--text); font-size: .92rem; }
.contact__form { border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); padding: 2rem; display: grid; gap: 1rem; }
.field { display: grid; gap: .5rem; }
.field label { font-size: .85rem; font-weight: 600; }
.field input, .field select, .field textarea { width: 100%; padding: .75rem .9rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; font-size: .92rem; transition: border-color .18s var(--ease), box-shadow .18s var(--ease); }
.field textarea { resize: vertical; min-height: 120px; }
.field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
.field input.is-invalid, .field textarea.is-invalid { border-color: #e5484d; }
.field__error { font-size: .8rem; color: #ff6b6f; }
.field__foot { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.field__count { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .75rem; color: var(--text-dim); margin-inline-start: auto; }
.field__count.is-over { color: #ff6b6f; }
.contact__note { font-size: .78rem; color: var(--text-dim); text-align: center; }

/* Footer */
.site-footer { border-top: 1px solid var(--border); background: var(--bg-soft); padding-top: 4.5rem; }
.footer__inner { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.6fr); gap: 3rem; padding-bottom: 3rem; }
.footer__brand p { font-size: .88rem; color: var(--text-muted); margin-block: 1rem; max-width: 34ch; }
.footer__social { display: flex; gap: .5rem; }
.footer__social a { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); transition: color .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease); }
.footer__social a:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.footer__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.5rem; }
.footer__cols h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-dim); margin-bottom: .75rem; }
.footer__cols ul { display: grid; gap: .5rem; }
.footer__cols a { font-size: .88rem; color: var(--text-muted); transition: color .18s var(--ease), padding-inline-start .18s var(--ease); }
.footer__cols a:hover { color: var(--accent); padding-inline-start: 4px; }
.footer__legal { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; padding-block: 1rem; border-top: 1px solid var(--border); font-size: .8rem; color: var(--text-dim); }

/* Overlays */
.modal { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 1.5rem; }
.modal[hidden] { display: none; }
.modal__scrim { position: absolute; inset: 0; background: rgba(3, 4, 8, .72); backdrop-filter: blur(6px); animation: fade-in .25s var(--ease); }
.modal__panel { position: relative; width: min(640px, 100%); max-height: 84vh; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elev); box-shadow: var(--shadow-3); padding: 2rem; animation: pop-in .32s var(--ease); }
.modal__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.modal__eyebrow { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .74rem; text-transform: uppercase; letter-spacing: .1em; color: var(--accent); margin-bottom: .25rem; }
.modal__title { font-size: clamp(1.3rem, 3vw, 1.8rem); }
.modal__body { display: grid; gap: 1rem; font-size: .92rem; color: var(--text-muted); }
.modal__body h3 { font-size: 1rem; color: var(--text); margin-top: .5rem; }
.modal__body ul { display: grid; gap: .5rem; }
.modal__body ul li { position: relative; padding-inline-start: 1rem; }
.modal__body ul li::before { content: ''; position: absolute; left: 0; top: .6em; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.modal__metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .75rem; }
.modal__metric { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: .75rem; background: var(--bg-elev-2); }
.modal__metric dt { font-size: .72rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .06em; }
.modal__metric dd { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--text); }

.to-top { position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 90; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-elev); color: var(--text-muted); box-shadow: var(--shadow-2); transition: transform .22s var(--ease), color .22s var(--ease), border-color .22s var(--ease); }
.to-top[hidden] { display: none; }
.to-top:hover { transform: translateY(-4px); color: var(--accent); border-color: var(--accent); }
.toast { position: fixed; left: 50%; bottom: 2rem; z-index: 400; transform: translateX(-50%); padding: .85rem 1.25rem; border: 1px solid var(--border); border-radius: var(--radius-full); background: var(--bg-elev-2); box-shadow: var(--shadow-3); font-size: .9rem; animation: toast-in .32s var(--ease); }
.toast[hidden] { display: none; }

/* Keyframes */
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes pop-in { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes toast-in { from { opacity: 0; transform: translate(-50%, 16px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes drift { from { transform: translate3d(-3%, -2%, 0) scale(1); } to { transform: translate3d(4%, 3%, 0) scale(1.09); } }
@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--teal) 55%, transparent); } 70% { box-shadow: 0 0 0 9px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 1024px) {
  /* minmax(0,...) rather than a bare 1fr: a bare 1fr track is minmax(auto,1fr),
     so the 742px-wide heatmap would blow the track out past the viewport. */
  .hero__inner, .about, .activity, .contact, .footer__inner { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 860px) {
  .nav { position: fixed; inset: var(--header-h) 0 auto; margin: 0; padding: 1.5rem; background: var(--bg-elev); border-bottom: 1px solid var(--border); box-shadow: var(--shadow-2); display: none; }
  .nav.is-open { display: block; animation: fade-up .28s var(--ease); }
  .nav__list { flex-direction: column; align-items: stretch; gap: 0; }
  .nav__link { padding: .8rem .5rem; font-size: 1rem; }
  .nav__link::after { display: none; }
  .nav__link.is-active { background: var(--bg-elev-2); color: var(--accent); }
  .nav-toggle { display: inline-grid; }
  .header__actions .btn { display: none; }
  .note { grid-template-columns: 1fr auto; }
  .note__date { grid-column: 1 / -1; }
  .note__meta { grid-column: 2; grid-row: 2; }
  .note__arrow { grid-column: 1; grid-row: 2; justify-self: end; }
}
@media (max-width: 640px) {
  .wrap { padding-inline: 1rem; }
  .section { padding-block: 4.5rem; }
  .hero { padding-block: 4.5rem 3rem; }
  .hero__stats { grid-template-columns: repeat(2, 1fr); }
  .timeline__head { grid-template-columns: auto minmax(0, 1fr) auto; row-gap: .5rem; }
  .timeline__dates { grid-column: 2; }
  .timeline__chev { grid-column: 3; grid-row: 1; }
  .timeline__panel { padding-inline: 1rem; }
  .footer__legal { flex-direction: column; }
  .modal__panel { padding: 1.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  [data-reveal] { opacity: 1; transform: none; }
  .hero__glow { animation: none; }
  .marquee__track { animation: none; }
}
`,
  javascript: `
'use strict';

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ============ Scroll reveal ============ */
  var revealables = $$('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      // Stagger siblings so a grid cascades instead of popping as one block.
      revealables.forEach(function (el) {
        var group = el.parentElement;
        if (!group) { return; }
        var idx = Array.prototype.indexOf.call(group.children, el);
        if (idx > -1) { el.style.setProperty('--delay', Math.min(idx, 6) * 70 + 'ms'); }
      });
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealables.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ============ Header state, progress, back-to-top ============ */
  var header = $('#siteHeader');
  var progressBar = $('#progressBar');
  var toTop = $('#toTop');
  var scrollQueued = false;

  function syncScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) { header.classList.toggle('is-stuck', y > 8); }
    if (toTop) { toTop.hidden = y < 600; }
    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    scrollQueued = false;
  }

  window.addEventListener('scroll', function () {
    if (scrollQueued) { return; }
    scrollQueued = true;
    window.requestAnimationFrame(syncScroll);
  }, { passive: true });
  syncScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============ Mobile navigation ============ */
  var navToggle = $('#navToggle');
  var primaryNav = $('#primaryNav');

  function setNav(open) {
    if (!navToggle || !primaryNav) { return; }
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    primaryNav.classList.toggle('is-open', open);
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('.nav__link', primaryNav).forEach(function (link) {
      link.addEventListener('click', function () { setNav(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) { setNav(false); }
    });
  }

  /* ============ Theme ============ */
  var themeToggle = $('#themeToggle');
  var THEME_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (!themeToggle) { return; }
    var light = theme === 'light';
    themeToggle.setAttribute('aria-pressed', light ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }

  var storedTheme = null;
  try { storedTheme = window.localStorage.getItem(THEME_KEY); } catch (e) { storedTheme = null; }
  applyTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ============ Terminal typing ============ */
  var typedEl = $('#typedText');
  var PHRASES = [
    'ada.okonkwo — staff engineer',
    'building design systems that scale',
    'cutting bundle size since 2014',
    'currently: VectorDB v3',
    'open to consulting work'
  ];

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = PHRASES[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;
      var typeLoop = function () {
        var current = PHRASES[phraseIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = current.slice(0, charIndex);
        var delay = deleting ? 32 : 58;
        if (!deleting && charIndex === current.length) { deleting = true; delay = 1700; }
        else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % PHRASES.length;
          delay = 420;
        }
        window.setTimeout(typeLoop, delay);
      };
      typeLoop();
    }
  }

  /* ============ Animated counters ============ */
  function formatNumber(n) { return n.toLocaleString('en-US'); }

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    if (isNaN(target)) { return; }
    if (reduceMotion) { el.textContent = formatNumber(target); return; }
    var duration = 1400;
    var start = null;
    var step = function (timestamp) {
      if (start === null) { start = timestamp; }
      var progress = Math.min(1, (timestamp - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(Math.round(target * eased));
      if (progress < 1) { window.requestAnimationFrame(step); }
    };
    window.requestAnimationFrame(step);
  }

  var counters = $$('.count');
  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); countObserver.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ============ Scroll-spy ============ */
  var navLinks = $$('.nav__link');
  var spyTargets = navLinks.map(function (link) {
    var id = (link.getAttribute('href') || '').replace('#', '');
    return id ? document.getElementById(id) : null;
  }).filter(Boolean);

  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ============ Smooth anchors ============
     CSS scroll-behavior is stripped by the app's sanitiser, so this is JS. */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') { return; }
      var target = document.getElementById(hash.slice(1));
      if (!target) { return; }
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hash);
      }
    });
  });

  /* ============ Skills filter + meters ============ */
  var skillCards = $$('.skill');
  var filterChips = $$('[data-skill-filter]');

  function fillMeter(card) {
    var fill = $('.meter__fill', card);
    if (!fill) { return; }
    var level = fill.getAttribute('data-level') || '0';
    window.requestAnimationFrame(function () {
      window.setTimeout(function () { fill.style.width = level + '%'; }, reduceMotion ? 0 : 120);
    });
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-skill-filter');
      filterChips.forEach(function (other) {
        var on = other === chip;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      skillCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
        if (match) { fillMeter(card); }
      });
    });
  });

  if (skillCards.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      skillCards.forEach(fillMeter);
    } else {
      var meterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { fillMeter(entry.target); meterObserver.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      skillCards.forEach(function (card) { meterObserver.observe(card); });
    }
  }

  /* ============ Experience timeline ============ */
  $$('.timeline__item').forEach(function (item) {
    var head = $('.timeline__head', item);
    var panel = $('.timeline__panel', item);
    if (!head || !panel) { return; }
    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
      item.classList.toggle('is-open', !open);
    });
  });

  /* ============ Contribution heatmap ============
     Seeded PRNG so the grid is identical on every reload without a network call. */
  var heatmap = $('#heatmap');
  if (heatmap) {
    function mulberry32(seed) {
      return function () {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }

    var rand = mulberry32(20260314);
    var WEEKS = 53;
    var DAYS = 7;
    var total = 0;
    var streak = 0;
    var best = 0;
    var cells = [];

    for (var w = 0; w < WEEKS; w++) {
      var weekCount = 0;
      for (var d = 0; d < DAYS; d++) {
        // Weekends are quieter; a slow drift keeps long gaps from forming.
        var weekend = d === 0 || d === 6;
        var chance = (weekend ? 0.22 : 0.68) * (0.75 + rand() * 0.5);
        var level = 0;
        var roll = rand();
        if (roll < chance) {
          level = 1 + Math.floor(rand() * 4);
          if (level > 4) { level = 4; }
        }
        weekCount += level;
        cells.push({ level: level, week: w, day: d });
      }
      total += weekCount;
      if (weekCount > 0) { streak++; if (streak > best) { best = streak; } } else { streak = 0; }
    }

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var now = new Date();
    var frag = document.createDocumentFragment();

    cells.forEach(function (cell, i) {
      var square = document.createElement('i');
      if (cell.level > 0) { square.className = 'lv' + cell.level; }
      var date = new Date(now.getTime());
      date.setDate(now.getDate() - (WEEKS * DAYS - 1 - i));
      square.title = cell.level + ' contributions on ' + date.toDateString();
      frag.appendChild(square);
    });
    heatmap.appendChild(frag);

    var setStat = function (id, value) {
      var el = document.getElementById(id);
      if (el) { el.textContent = value.toLocaleString('en-US'); }
    };
    setStat('statTotal', total);
    setStat('statStreak', best);
    setStat('statRepos', 14);
    setStat('statStars', 328);
    void MONTHS;
  }

  /* ============ Testimonials ============ */
  var quotes = $$('[data-quote]');
  var dots = $$('.quotes__dot');
  var quoteIndex = 0;
  var quoteTimer = null;

  function showQuote(index) {
    if (!quotes.length) { return; }
    quoteIndex = (index + quotes.length) % quotes.length;
    quotes.forEach(function (q, i) { q.classList.toggle('is-active', i === quoteIndex); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === quoteIndex);
      d.setAttribute('aria-selected', i === quoteIndex ? 'true' : 'false');
    });
  }

  function restartQuoteTimer() {
    if (quoteTimer) { window.clearInterval(quoteTimer); }
    if (reduceMotion || quotes.length < 2) { return; }
    quoteTimer = window.setInterval(function () { showQuote(quoteIndex + 1); }, 7000);
  }

  var quotePrev = $('#quotePrev');
  var quoteNext = $('#quoteNext');
  if (quotePrev) { quotePrev.addEventListener('click', function () { showQuote(quoteIndex - 1); restartQuoteTimer(); }); }
  if (quoteNext) { quoteNext.addEventListener('click', function () { showQuote(quoteIndex + 1); restartQuoteTimer(); }); }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { showQuote(i); restartQuoteTimer(); });
  });
  var quotesWrap = $('.quotes');
  if (quotesWrap) {
    quotesWrap.addEventListener('mouseenter', function () { if (quoteTimer) { window.clearInterval(quoteTimer); } });
    quotesWrap.addEventListener('mouseleave', restartQuoteTimer);
  }
  restartQuoteTimer();

  /* ============ Project modal with focus trap ============ */
  var PROJECTS = {
    lattice: {
      eyebrow: 'Design systems · 2022—2024',
      title: 'Lattice Design System',
      summary: 'Four divergent component libraries became one. Nine teams, four quarters, no big-bang migration.',
      highlights: [
        'Defined a three-tier token model (primitive, semantic, component) so themes ship without touching components.',
        'Shipped codemods that migrated 78% of call sites automatically; the rest were fixed by hand over two sprints.',
        'Made the a11y suite a required CI gate, which cut post-release accessibility defects by two thirds.'
      ],
      metrics: [['Teams migrated', '9'], ['Components', '64'], ['Defects cut', '67%']]
    },
    meridian: {
      eyebrow: 'Realtime · 2022—2023',
      title: 'Meridian Analytics',
      summary: 'A realtime dashboard that stays smooth at 40k events per second on a four-year-old laptop.',
      highlights: [
        'Moved rendering to a canvas layer so the DOM only carries chrome, not data.',
        'Batched incoming WebSocket frames into a single animation frame, cutting re-renders by 94%.',
        'Added a ring buffer with backpressure so a slow consumer degrades instead of freezing.'
      ],
      metrics: [['Events/sec', '40k'], ['Re-renders cut', '94%'], ['p95 frame', '11ms']]
    },
    quill: {
      eyebrow: 'Editor · 2021—2022',
      title: 'Quill Editor',
      summary: 'An offline-first collaborative rich-text editor. CRDT sync, WASM text engine, no server round-trip for keystrokes.',
      highlights: [
        'Ported the diff engine to Rust and compiled it to WASM, cutting bundle cost while speeding up merges.',
        'Used IndexedDB as the primary store with a CRDT log, so a dropped connection loses nothing.',
        'Designed a plain-text fallback that keeps documents fully editable in a plain textarea.'
      ],
      metrics: [['Sync latency', '<50ms'], ['Bundle', '−38%'], ['Docs in prod', '2M']]
    },
    harbor: {
      eyebrow: 'Security · 2020—2021',
      title: 'Harbor Auth',
      summary: 'Passkey-first authentication adopted as an internal platform service across eleven product surfaces.',
      highlights: [
        'Made passkeys the default path and kept every password flow working as a fallback.',
        'Ran a published security review and a bug-bounty programme for the first six months.',
        'Shipped session management UI so users can see and revoke their own devices.'
      ],
      metrics: [['Services', '11'], ['Phishing resistance', 'High'], ['Uptime', '99.99%']]
    },
    relay: {
      eyebrow: 'Developer experience · 2023—2024',
      title: 'Relay CI',
      summary: 'A remote build cache for a 1,400-package monorepo. Pipeline time dropped from 41 minutes to 13.',
      highlights: [
        'Content-addressed cache keys so a cache hit is always correct, never merely likely.',
        'Distributed the cache across runners with a deterministic eviction policy.',
        'Added a dashboard showing which packages dominate wall time, which changed prioritisation.'
      ],
      metrics: [['Pipeline', '13m'], ['Before', '41m'], ['Cache hit', '78%']]
    },
    atlas: {
      eyebrow: 'Platform · 2024—now',
      title: 'Atlas Docs',
      summary: 'Documentation for 300+ pages that a search-driven audience actually uses.',
      highlights: [
        'Static generation with incremental rebuilds, so publishing one page does not rebuild the site.',
        'Client-side search over a prebuilt index; no search service to operate.',
        'Held 98/100 Lighthouse across every template, enforced as a build gate.'
      ],
      metrics: [['Pages', '312'], ['Lighthouse', '98'], ['Search latency', '12ms']]
    }
  };

  var modal = $('#projectModal');
  var pmTitle = $('#pmTitle');
  var pmEyebrow = $('#pmEyebrow');
  var pmBody = $('#pmBody');
  var pmPanel = $('#pmPanel');
  var lastFocused = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderProject(key) {
    if (!pmTitle || !pmEyebrow || !pmBody) { return; }
    var project = PROJECTS[key];
    if (!project) { return; }

    pmEyebrow.textContent = project.eyebrow;
    pmTitle.textContent = project.title;

    var html = '<p>' + escapeHtml(project.summary) + '</p>';
    html += '<h3>What actually changed</h3><ul>';
    project.highlights.forEach(function (item) {
      html += '<li>' + escapeHtml(item) + '</li>';
    });
    html += '</ul>';
    html += '<h3>By the numbers</h3><dl class="modal__metrics">';
    project.metrics.forEach(function (metric) {
      html += '<div class="modal__metric"><dt>' + escapeHtml(metric[0]) + '</dt><dd>' + escapeHtml(metric[1]) + '</dd></div>';
    });
    html += '</dl>';
    pmBody.innerHTML = html;
  }

  function openModal(key) {
    if (!modal) { return; }
    renderProject(key);
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (pmPanel) { pmPanel.focus(); }
  }

  function closeModal() {
    if (!modal || modal.hidden) { return; }
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
  }

  $$('[data-open-project]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-open-project'));
    });
  });
  $$('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (!modal || modal.hidden) { return; }
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab' || !pmPanel) { return; }
    // Focus trap: keep Tab inside the dialog.
    var focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', pmPanel)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) { return; }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ============ Toast ============ */
  var toastEl = $('#toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.hidden = false;
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () { toastEl.hidden = true; }, 4000);
  }

  /* ============ Contact form ============ */
  var form = $('#contactForm');
  if (form) {
    var nameInput = $('#cfName');
    var emailInput = $('#cfEmail');
    var msgInput = $('#cfMsg');
    var msgCount = $('#cfMsgCount');
    var submitBtn = $('#cfSubmit');
    var MAX = 600;

    function showError(input, errorId, message) {
      var err = document.getElementById(errorId);
      if (input) { input.classList.add('is-invalid'); }
      if (err) { err.textContent = message; err.hidden = false; }
    }
    function clearError(input, errorId) {
      var err = document.getElementById(errorId);
      if (input) { input.classList.remove('is-invalid'); }
      if (err) { err.hidden = true; }
    }
    function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value); }

    if (msgInput && msgCount) {
      msgInput.addEventListener('input', function () {
        var len = msgInput.value.length;
        msgCount.textContent = len + ' / ' + MAX;
        msgCount.classList.toggle('is-over', len > MAX);
        if (len <= MAX) { clearError(msgInput, 'cfMsgErr'); }
      });
    }
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (nameInput.value.trim().length >= 2) { clearError(nameInput, 'cfNameErr'); }
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (validEmail(emailInput.value.trim())) { clearError(emailInput, 'cfEmailErr'); }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var message = msgInput ? msgInput.value.trim() : '';
      var firstInvalid = null;

      if (name.length < 2) {
        showError(nameInput, 'cfNameErr', 'Please tell me your name.');
        if (!firstInvalid) { firstInvalid = nameInput; }
      } else { clearError(nameInput, 'cfNameErr'); }

      if (!validEmail(email)) {
        showError(emailInput, 'cfEmailErr', 'That does not look like a valid email address.');
        if (!firstInvalid) { firstInvalid = emailInput; }
      } else { clearError(emailInput, 'cfEmailErr'); }

      if (message.length < 20) {
        showError(msgInput, 'cfMsgErr', 'A little more detail helps — at least 20 characters.');
        if (!firstInvalid) { firstInvalid = msgInput; }
      } else { clearError(msgInput, 'cfMsgErr'); }

      if (message.length > MAX) {
        showError(msgInput, 'cfMsgErr', 'Please keep it under ' + MAX + ' characters.');
        if (!firstInvalid) { firstInvalid = msgInput; }
      }

      if (firstInvalid) {
        if (firstInvalid.focus) { firstInvalid.focus(); }
        showToast('Check the highlighted fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('is-busy');
        submitBtn.disabled = true;
      }

      // No network call: this template is a self-contained demo.
      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove('is-busy');
          submitBtn.disabled = false;
        }
        form.reset();
        if (msgCount) { msgCount.textContent = '0 / ' + MAX; msgCount.classList.remove('is-over'); }
        showToast('Thanks ' + name.split(' ')[0] + ' — this demo stops here, no message was sent.');
      }, 900);
    });
  }
})();
`
};