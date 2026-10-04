// Startup Landing Template — StartupX
export const html = `<!-- StartupX — Startup Landing Page -->
<a class="skip-link" href="#main">Skip to main content</a>

<header class="site-header" id="siteHeader">
  <div class="shell header-inner">
    <a class="brand" href="#top" aria-label="StartupX — back to top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="m13 2-8 11h6l-1 9 8-11h-6l1-9Z"></path>
        </svg>
      </span>
      <span class="brand-name">StartupX</span>
    </a>

    <nav class="primary-nav" aria-label="Primary">
      <ul class="nav-list">
        <li class="nav-item nav-item--menu">
          <button class="nav-link nav-trigger" type="button" id="navProductBtn" aria-expanded="false" aria-controls="navProductMenu">
            Product
            <svg class="icon icon--xs nav-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
          </button>
          <div class="dropdown" id="navProductMenu">
            <ul class="dropdown-list">
              <li>
                <a class="dropdown-link" href="#product">
                  <span class="dd-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"></path></svg></span>
                  <span class="dd-text"><strong>Release orchestration</strong><small>Ship on Friday without the drama</small></span>
                </a>
              </li>
              <li>
                <a class="dropdown-link" href="#metrics">
                  <span class="dd-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18M7 15v-4M12 15V8M17 15v-6"></path></svg></span>
                  <span class="dd-text"><strong>Revenue analytics</strong><small>Cohorts, MRR churn and burn</small></span>
                </a>
              </li>
              <li>
                <a class="dropdown-link" href="#features">
                  <span class="dd-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"></path></svg></span>
                  <span class="dd-text"><strong>Integrations</strong><small>180+ tools, wired in one click</small></span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link" href="#how">How it works</a></li>
        <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
        <li class="nav-item"><a class="nav-link" href="#faq">FAQ</a></li>
      </ul>
    </nav>

    <div class="header-actions">
      <a class="btn btn--ghost btn--sm" href="#pricing">Sign in</a>
      <a class="btn btn--primary btn--sm" href="#cta">Start free</a>
      <button class="icon-btn nav-toggle" type="button" id="navToggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileNav">
        <svg class="icon nav-toggle-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
        <svg class="icon nav-toggle-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"></path></svg>
      </button>
    </div>
  </div>

  <div class="mobile-nav" id="mobileNav">
    <ul class="mobile-nav-list">
      <li><a class="mobile-nav-link" href="#features">Features</a></li>
      <li><a class="mobile-nav-link" href="#how">How it works</a></li>
      <li><a class="mobile-nav-link" href="#product">Product tour</a></li>
      <li><a class="mobile-nav-link" href="#testimonials">Customers</a></li>
      <li><a class="mobile-nav-link" href="#pricing">Pricing</a></li>
      <li><a class="mobile-nav-link" href="#faq">FAQ</a></li>
    </ul>
    <div class="mobile-nav-cta">
      <a class="btn btn--ghost btn--block" href="#pricing">Sign in</a>
      <a class="btn btn--primary btn--block" href="#cta">Start free trial</a>
    </div>
  </div>

  <div class="scroll-progress" aria-hidden="true"><span id="scrollProgress"></span></div>
</header>

<main id="main">
  <section class="hero" id="top">
    <div class="hero-glow" aria-hidden="true"></div>
    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow" data-reveal>
          <span class="pulse-dot" aria-hidden="true"></span>
          Series B round closed — $46M led by Meridian Ventures
        </p>
        <h1 class="hero-title" data-reveal style="--delay:.06s">
          Ship the product,<br>
          <span class="kinetic">
            <span class="sr-only">not the process.</span>
            <span class="kinetic-swap" aria-hidden="true"><span class="kinetic-word" id="kineticWord">not the process</span><span class="kinetic-caret"></span></span>
          </span>
        </h1>
        <p class="hero-sub" data-reveal style="--delay:.12s">
          StartupX is the operating system for early-stage software companies. Releases,
          metrics, billing and support in one workspace — so your team spends its week
          building, not reconciling spreadsheets.
        </p>
        <div class="hero-actions" data-reveal style="--delay:.18s">
          <a class="btn btn--primary btn--lg" href="#cta">
            Start 14-day free trial
            <svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"></path></svg>
          </a>
          <a class="btn btn--outline btn--lg" href="#product">
            <svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7V5Z"></path></svg>
            Watch the 4-minute tour
          </a>
        </div>
        <ul class="hero-proof" data-reveal style="--delay:.24s">
          <li class="proof-item">
            <span class="proof-faces" aria-hidden="true">
              <span class="proof-face" style="--face-hue:224"></span>
              <span class="proof-face" style="--face-hue:262"></span>
              <span class="proof-face" style="--face-hue:198"></span>
              <span class="proof-face" style="--face-hue:286"></span>
            </span>
            <span><strong>10,412</strong> teams onboarded since 2021</span>
          </li>
          <li class="proof-item">
            <svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>
            <span>No credit card required</span>
          </li>
          <li class="proof-item">
            <svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"></path></svg>
            <span>4.9 average across 1,180 reviews</span>
          </li>
        </ul>
      </div>

      <div class="hero-visual" data-reveal style="--delay:.16s">
        <div class="app-window">
          <div class="app-chrome">
            <span class="chrome-dot" style="--dot:#f2685c"></span>
            <span class="chrome-dot" style="--dot:#f5bf4f"></span>
            <span class="chrome-dot" style="--dot:#43c07d"></span>
            <span class="chrome-url">app.startupx.io/overview</span>
          </div>
          <div class="app-body">
            <aside class="app-side" aria-hidden="true">
              <span class="side-item side-item--active"></span>
              <span class="side-item"></span>
              <span class="side-item"></span>
              <span class="side-item"></span>
              <span class="side-item"></span>
              <span class="side-item"></span>
            </aside>
            <div class="app-main">
              <div class="app-kpis">
                <div class="kpi"><span class="kpi-label">MRR</span><span class="kpi-value">$284,910</span><span class="kpi-delta">+18.4%</span></div>
                <div class="kpi"><span class="kpi-label">Active trials</span><span class="kpi-value">1,372</span><span class="kpi-delta">+6.1%</span></div>
                <div class="kpi"><span class="kpi-label">Churn</span><span class="kpi-value">1.8%</span><span class="kpi-delta">-0.4%</span></div>
              </div>
              <div class="app-chart" aria-hidden="true">
                <div class="chart-bars">
                  <span style="--h:34%"></span><span style="--h:52%"></span><span style="--h:41%"></span>
                  <span style="--h:63%"></span><span style="--h:58%"></span><span style="--h:77%"></span>
                  <span style="--h:69%"></span><span style="--h:84%"></span><span style="--h:72%"></span>
                  <span style="--h:95%"></span><span style="--h:88%"></span><span style="--h:100%"></span>
                </div>
                <svg class="chart-spark" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <polyline points="0,52 24,46 48,49 72,36 96,38 120,26 144,29 168,16 192,19 220,7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
                </svg>
              </div>
              <ul class="app-feed">
                <li><span class="feed-tag">release</span><span class="feed-text">v2.14.0 shipped to production</span><span class="feed-time">4m</span></li>
                <li><span class="feed-tag">billing</span><span class="feed-text">Invoice #INV-90412 settled</span><span class="feed-time">19m</span></li>
                <li><span class="feed-tag">alert</span><span class="feed-text">p95 latency above 400ms</span><span class="feed-time">52m</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="float-card float-card--a">
          <span class="float-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 17 6-6 4 4 8-8M21 7v5h-5"></path></svg></span>
          <span><strong>+18.4%</strong><small>MRR this quarter</small></span>
        </div>
        <div class="float-card float-card--b">
          <span class="float-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg></span>
          <span><strong>Deploy #482</strong><small>412 tests green</small></span>
        </div>
      </div>
    </div>
  </section>

  <section class="marquee-band" aria-label="Press mentions">
    <p class="marquee-caption">Backed and covered by</p>
    <div class="marquee" data-marquee>
      <ul class="marquee-track">
        <li class="marquee-item">Meridian Ventures</li>
        <li class="marquee-item">TechCrunch</li>
        <li class="marquee-item">Product Hunt</li>
        <li class="marquee-item">The Verge</li>
        <li class="marquee-item">Y Combinator</li>
        <li class="marquee-item">Fast Company</li>
        <li class="marquee-item">Sifted</li>
        <li class="marquee-item">Stripe Atlas</li>
      </ul>
      <ul class="marquee-track" aria-hidden="true">
        <li class="marquee-item">Meridian Ventures</li>
        <li class="marquee-item">TechCrunch</li>
        <li class="marquee-item">Product Hunt</li>
        <li class="marquee-item">The Verge</li>
        <li class="marquee-item">Y Combinator</li>
        <li class="marquee-item">Fast Company</li>
        <li class="marquee-item">Sifted</li>
        <li class="marquee-item">Stripe Atlas</li>
      </ul>
    </div>
  </section>

  <section class="metrics" id="metrics" aria-labelledby="metricsTitle">
    <div class="shell">
      <h2 class="sr-only" id="metricsTitle">StartupX by the numbers</h2>
      <ul class="metrics-grid">
        <li class="metric" data-reveal>
          <span class="metric-value"><span data-count="10412">0</span></span>
          <span class="metric-label">Teams building on StartupX</span>
        </li>
        <li class="metric" data-reveal style="--delay:.08s">
          <span class="metric-value"><span data-count="38">0</span>%</span>
          <span class="metric-label">Faster median time-to-launch</span>
        </li>
        <li class="metric" data-reveal style="--delay:.16s">
          <span class="metric-value"><span data-count="99.98">0</span>%</span>
          <span class="metric-label">Rolling 90-day uptime</span>
        </li>
        <li class="metric" data-reveal style="--delay:.24s">
          <span class="metric-value">$<span data-count="2.1" data-decimals="1">0</span>B</span>
          <span class="metric-label">Customer revenue tracked</span>
        </li>
      </ul>
    </div>
  </section>

  <section class="features" id="features" aria-labelledby="featuresTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <p class="section-tag">Platform</p>
        <h2 class="section-title" id="featuresTitle">Six systems that replace six tools</h2>
        <p class="section-lede">Everything below is included on every plan. No modules, no add-on
          invoices, no archaeology when you need to find last quarter's numbers.</p>
      </header>

      <ul class="feature-grid">
        <li class="feature-card" data-reveal>
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m13 2-8 11h6l-1 9 8-11h-6l1-9Z"></path></svg></span>
          <h3>Release orchestration</h3>
          <p>Branch previews, staged rollouts and one-click rollback. Every deploy is tied to a ticket, an owner and a green test run.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Preview environments per pull request</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Automated release notes from commit history</li>
          </ul>
        </li>
        <li class="feature-card" data-reveal style="--delay:.06s">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18M7 15v-4M12 15V8M17 15v-6"></path></svg></span>
          <h3>Revenue analytics</h3>
          <p>MRR, net revenue retention, cohort LTV and burn runway — recalculated every 15 minutes from your own database.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Cohort retention explorer</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>CSV and warehouse export</li>
          </ul>
        </li>
        <li class="feature-card" data-reveal style="--delay:.12s">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"></path></svg></span>
          <h3>Copilot for the boring work</h3>
          <p>StartupX reads your issues, drafts the changelog, and flags the three metrics that moved while nobody was looking.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Weekly digest written every Monday</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Answers grounded in your own data</li>
          </ul>
        </li>
        <li class="feature-card" data-reveal style="--delay:.18s">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 0 1 0-8 4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span>
          <h3>Team rituals built in</h3>
          <p>Async standups, decision logs and incident timelines. Onboarding a new engineer takes an afternoon, not a quarter.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Decision log with owners and dates</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Guest seats for contractors</li>
          </ul>
        </li>
        <li class="feature-card" data-reveal>
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"></path></svg></span>
          <h3>Billing that closes itself</h3>
          <p>Usage-based and seat pricing in one ledger. Dunning, proration and tax handled, with every cent traceable to an event.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Smart retries recover 61% of churn</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>PCI DSS Level 1 processor</li>
          </ul>
        </li>
        <li class="feature-card" data-reveal style="--delay:.06s">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"></path></svg></span>
          <h3>Security your buyers trust</h3>
          <p>SOC 2 Type II report refreshed annually, SSO on every plan above Growth, and regional data residency in the EU and US.</p>
          <ul class="feature-points">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Field-level encryption at rest</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Audit log exportable to your SIEM</li>
          </ul>
        </li>
      </ul>
    </div>
  </section>

  <section class="how" id="how" aria-labelledby="howTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <p class="section-tag">Onboarding</p>
        <h2 class="section-title" id="howTitle">Live in an afternoon, not a quarter</h2>
        <p class="section-lede">Most teams finish all three steps inside their first week. Our
          implementation engineer stays on the call until the numbers look right.</p>
      </header>

      <ol class="steps">
        <li class="step" data-reveal>
          <span class="step-index">01</span>
          <h3>Connect your stack</h3>
          <p>Authorise GitHub, Stripe and your warehouse from one screen. StartupX reads the last 18 months of history on day one, so your charts are never empty.</p>
          <ul class="step-meta">
            <li>GitHub, GitLab, Bitbucket</li>
            <li>Stripe, Paddle, Chargebee</li>
            <li>Postgres, Snowflake, BigQuery</li>
          </ul>
        </li>
        <li class="step" data-reveal style="--delay:.1s">
          <span class="step-index">02</span>
          <h3>Automate the busywork</h3>
          <p>Pick from 42 prebuilt playbooks — trial-to-paid nurture, churn save, incident timeline — or write your own in the workflow editor.</p>
          <ul class="step-meta">
            <li>42 ready-made playbooks</li>
            <li>Visual trigger and delay editor</li>
            <li>Full audit trail per run</li>
          </ul>
        </li>
        <li class="step" data-reveal style="--delay:.2s">
          <span class="step-index">03</span>
          <h3>Watch revenue compound</h3>
          <p>One dashboard your board, your investors and your engineers all read the same way. Export it, embed it, or subscribe to the weekly digest.</p>
          <ul class="step-meta">
            <li>Board-ready PDF export</li>
            <li>Slack and email digests</li>
            <li>Public share links with expiry</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>

  <section class="product" id="product" aria-labelledby="productTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <p class="section-tag">Product tour</p>
        <h2 class="section-title" id="productTitle">One workspace, three vantage points</h2>
      </header>

      <div class="tabs" data-reveal>
        <div class="tablist" role="tablist" aria-label="Product tour sections">
          <button class="tab is-active" type="button" role="tab" id="tab-overview" aria-selected="true" aria-controls="panel-overview" tabindex="0">Overview</button>
          <button class="tab" type="button" role="tab" id="tab-automations" aria-selected="false" aria-controls="panel-automations" tabindex="-1">Automations</button>
          <button class="tab" type="button" role="tab" id="tab-integrations" aria-selected="false" aria-controls="panel-integrations" tabindex="-1">Integrations</button>
        </div>

        <div class="tabpanel is-active" role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" tabindex="0">
          <div class="panel-copy">
            <h3>Everything on one screen</h3>
            <p>Revenue, product usage and team health share the same date range and the same definitions, so nobody argues about which number is correct.</p>
            <ul class="panel-list">
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>MRR, ARR, NRR and burn in a single header</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Drill from a revenue number to the underlying event</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Every metric carries its own definition and owner</li>
            </ul>
          </div>
          <div class="panel-art" aria-hidden="true">
            <div class="art-dashboard">
              <div class="art-head"><span></span><span></span><span></span></div>
              <div class="art-rows">
                <div class="art-row art-row--wide"><i style="--w:72%"></i></div>
                <div class="art-row"><i style="--w:44%"></i></div>
                <div class="art-row"><i style="--w:61%"></i></div>
                <div class="art-row"><i style="--w:33%"></i></div>
              </div>
              <div class="art-grid">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="tabpanel" role="tabpanel" id="panel-automations" aria-labelledby="tab-automations" tabindex="0" hidden>
          <div class="panel-copy">
            <h3>Playbooks you can read</h3>
            <p>Every automation is a short, readable recipe: trigger, conditions, delay, action. No YAML, no webhooks held together with hope.</p>
            <ul class="panel-list">
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Branch on product usage, plan or MRR change</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Replay any run with the inputs it actually used</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Pause, clone or A/B two variants safely</li>
            </ul>
          </div>
          <div class="panel-art" aria-hidden="true">
            <div class="art-flow">
              <span class="flow-node">Trial started</span>
              <span class="flow-link"></span>
              <span class="flow-node">Day 3 — no seat yet</span>
              <span class="flow-link"></span>
              <span class="flow-node flow-node--accent">Send 3-step nudge</span>
            </div>
          </div>
        </div>

        <div class="tabpanel" role="tabpanel" id="panel-integrations" aria-labelledby="tab-integrations" tabindex="0" hidden>
          <div class="panel-copy">
            <h3>180+ connections, zero glue code</h3>
            <p>Authorise once and every metric, event and action is available everywhere in the product. Disconnect any time — we delete the token.</p>
            <ul class="panel-list">
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Two-way sync with Stripe and Paddle</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Warehouse-native models, no extra ETL bill</li>
              <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Scoped tokens with per-integration permissions</li>
            </ul>
          </div>
          <div class="panel-art" aria-hidden="true">
            <ul class="art-chips">
              <li>GitHub</li><li>Stripe</li><li>Slack</li><li>Snowflake</li>
              <li>Vercel</li><li>Linear</li><li>Segment</li><li>Datadog</li>
              <li>Postgres</li><li>Sentry</li><li>Notion</li><li>Paddle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="testimonials" id="testimonials" aria-labelledby="testimonialsTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <p class="section-tag">Customers</p>
        <h2 class="section-title" id="testimonialsTitle">What operators tell us</h2>
      </header>

      <div class="slider" data-reveal data-slider>
        <div class="slider-viewport">
          <ul class="slider-track" id="sliderTrack">
            <li class="slide" role="group" aria-roledescription="slide" aria-label="1 of 4">
              <figure class="quote-card">
                <blockquote>
                  <p>We cancelled four subscriptions the week we moved. The board deck that used to
                    take a weekend now takes forty minutes, and it is finally the same number the
                    finance team sees.</p>
                </blockquote>
                <figcaption class="quote-by">
                  <span class="quote-face" style="--face-hue:224" aria-hidden="true"></span>
                  <span class="quote-meta">
                    <strong>Sarah Okonkwo</strong>
                    <small>COO, Kestrel Logistics — 74 employees</small>
                  </span>
                  <span class="quote-metric"><strong>11 hrs</strong><small>saved weekly</small></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="2 of 4">
              <figure class="quote-card">
                <blockquote>
                  <p>Our trial-to-paid rate went from 11% to 19% in six weeks. The playbooks were
                    written by people who have clearly run a SaaS company before.</p>
                </blockquote>
                <figcaption class="quote-by">
                  <span class="quote-face" style="--face-hue:286" aria-hidden="true"></span>
                  <span class="quote-meta">
                    <strong>Marcus Feld</strong>
                    <small>CEO, Fernwood Analytics — Series A</small>
                  </span>
                  <span class="quote-metric"><strong>+8 pts</strong><small>trial conversion</small></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="3 of 4">
              <figure class="quote-card">
                <blockquote>
                  <p>We passed our SOC 2 audit with StartupX evidence in the shared folder. That one
                    feature paid for the annual contract by itself.</p>
                </blockquote>
                <figcaption class="quote-by">
                  <span class="quote-face" style="--face-hue:198" aria-hidden="true"></span>
                  <span class="quote-meta">
                    <strong>Priya Raghunathan</strong>
                    <small>CTO, Vantage Bio — 40 employees</small>
                  </span>
                  <span class="quote-metric"><strong>6 wks</strong><small>audit saved</small></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="4 of 4">
              <figure class="quote-card">
                <blockquote>
                  <p>I onboarded two new engineers on a Thursday. By Monday they had shipped a
                    change without asking me where anything lived. That has never happened before.</p>
                </blockquote>
                <figcaption class="quote-by">
                  <span class="quote-face" style="--face-hue:262" aria-hidden="true"></span>
                  <span class="quote-meta">
                    <strong>Tobias Lindqvist</strong>
                    <small>VP Engineering, Halcyon Freight — 120 employees</small>
                  </span>
                  <span class="quote-metric"><strong>2 days</strong><small>to first ship</small></span>
                </figcaption>
              </figure>
            </li>
          </ul>
        </div>

        <div class="slider-controls">
          <button class="icon-btn slider-btn" type="button" id="sliderPrev" aria-label="Previous testimonial">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5m7 7-7-7 7-7"></path></svg>
          </button>
          <div class="slider-dots" id="sliderDots" role="tablist" aria-label="Choose testimonial"></div>
          <button class="icon-btn slider-btn" type="button" id="sliderNext" aria-label="Next testimonial">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section class="pricing" id="pricing" aria-labelledby="pricingTitle">
    <div class="shell">
      <header class="section-head" data-reveal>
        <p class="section-tag">Pricing</p>
        <h2 class="section-title" id="pricingTitle">Per seat. No platform fee.</h2>
        <p class="section-lede">Every plan includes the full platform. You pay for seats and for
          how long you keep your history.</p>
      </header>

      <div class="billing-toggle" data-reveal>
        <span class="billing-option is-active" id="billingMonthlyLabel">Monthly</span>
        <button class="switch" type="button" id="billingSwitch" role="switch" aria-checked="false" aria-labelledby="billingMonthlyLabel billingYearlyLabel">
          <span class="switch-thumb"></span>
        </button>
        <span class="billing-option" id="billingYearlyLabel">Yearly <span class="save-pill">save 20%</span></span>
      </div>

      <ul class="plan-grid">
        <li class="plan" data-reveal>
          <h3 class="plan-name">Starter</h3>
          <p class="plan-for">Solo founders and side projects.</p>
          <p class="plan-price"><span class="plan-currency">$</span><span class="plan-amount" data-monthly="19" data-yearly="15">19</span><span class="plan-period">/seat/mo</span></p>
          <p class="plan-bill" data-bill>Billed monthly</p>
          <a class="btn btn--outline btn--block" href="#cta">Start free trial</a>
          <ul class="plan-list">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>3 seats included</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>90 days of event history</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>12 playbooks</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Community support</li>
          </ul>
        </li>

        <li class="plan plan--featured" data-reveal style="--delay:.08s">
          <p class="plan-flag">Most popular</p>
          <h3 class="plan-name">Growth</h3>
          <p class="plan-for">Teams past first revenue.</p>
          <p class="plan-price"><span class="plan-currency">$</span><span class="plan-amount" data-monthly="59" data-yearly="47">59</span><span class="plan-period">/seat/mo</span></p>
          <p class="plan-bill" data-bill>Billed monthly</p>
          <a class="btn btn--primary btn--block" href="#cta">Start free trial</a>
          <ul class="plan-list">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>25 seats included</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>3 years of event history</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>All 42 playbooks + editor</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>SSO and audit log export</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Support reply within 4 hours</li>
          </ul>
        </li>

        <li class="plan" data-reveal style="--delay:.16s">
          <h3 class="plan-name">Scale</h3>
          <p class="plan-for">Funded companies with a compliance team.</p>
          <p class="plan-price"><span class="plan-currency">$</span><span class="plan-amount" data-monthly="149" data-yearly="119">149</span><span class="plan-period">/seat/mo</span></p>
          <p class="plan-bill" data-bill>Billed monthly</p>
          <a class="btn btn--outline btn--block" href="#cta">Talk to sales</a>
          <ul class="plan-list">
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Unlimited seats</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Unlimited history retention</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>EU or US data residency</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Named implementation engineer</li>
            <li><svg class="icon icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>99.9% uptime SLA</li>
          </ul>
        </li>
      </ul>
      <p class="pricing-foot" data-reveal>
        Prices in USD, excluding VAT. Annual plans are invoiced once. Startups under ten people
        apply for 50% off — the form takes about two minutes.
      </p>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="faqTitle">
    <div class="shell shell--narrow">
      <header class="section-head" data-reveal>
        <p class="section-tag">FAQ</p>
        <h2 class="section-title" id="faqTitle">Questions we get asked in the first call</h2>
      </header>

      <div class="faq-list" id="faqList">
        <div class="faq-item" data-reveal>
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-1" id="faq-q-1">
              <span>How long does implementation actually take?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-1" role="region" aria-labelledby="faq-q-1" hidden>
            <p>Most teams connect GitHub and Stripe in under forty minutes and see real numbers the
              same afternoon. A full historical backfill of 18 months of events typically completes
              within six hours. Nobody has ever needed a professional services engagement to get
              started, and we do not sell them.</p>
          </div>
        </div>
        <div class="faq-item" data-reveal style="--delay:.05s">
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-2" id="faq-q-2">
              <span>Do you train a model on our data?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-2" role="region" aria-labelledby="faq-q-2" hidden>
            <p>No. Your data is isolated per workspace, encrypted at rest with per-tenant keys, and is
              never used to train shared models. The copilot only retrieves from inside your own
              workspace. You can verify this — the retrieval layer is documented, and customers on
              Scale tier can run the same audit we do.</p>
          </div>
        </div>
        <div class="faq-item" data-reveal style="--delay:.1s">
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-3" id="faq-q-3">
              <span>What happens to my data if I cancel?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-3" role="region" aria-labelledby="faq-q-3" hidden>
            <p>You can export everything as CSV or Parquet at any time, including while your plan is
              still active. After cancellation the workspace goes read-only for thirty days, then the
              data is hard-deleted from primary storage and removed from backups within sixty days. We
              send one reminder before each of those steps.</p>
          </div>
        </div>
        <div class="faq-item" data-reveal style="--delay:.15s">
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-4" id="faq-q-4">
              <span>Is the free trial actually free?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-4" role="region" aria-labelledby="faq-q-4" hidden>
            <p>Fourteen days, every feature, up to ten seats, no card required. We do not ask for a
              credit card up front and we do not start a trial timer on a demo account that someone
              forgot to close. If you exceed ten seats on day nine we tell you rather than silently
              charging you.</p>
          </div>
        </div>
        <div class="faq-item" data-reveal style="--delay:.2s">
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-5" id="faq-q-5">
              <span>Which SOC 2 report can we share with our customers?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-5" role="region" aria-labelledby="faq-q-5" hidden>
            <p>The current Type II report and its management letter are available to any customer from
              the trust page in the workspace — no NDA required. Our most recent observation window ran
              1 March to 30 June 2026, and the next report lands in February 2027.</p>
          </div>
        </div>
        <div class="faq-item" data-reveal style="--delay:.25s">
          <h3>
            <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-6" id="faq-q-6">
              <span>Do you offer discounts for early-stage companies?</span>
              <svg class="icon icon--sm faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-6" role="region" aria-labelledby="faq-q-6" hidden>
            <p>Teams with fewer than ten employees and under $2M raised get 50% off any paid plan for
              twenty-four months. Accelerator programmes that list us as a benefit are honoured at the
              same rate. It is one short form, approved by a human, usually within a day.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta" id="cta" aria-labelledby="ctaTitle">
    <div class="shell cta-inner">
      <div class="cta-copy">
        <h2 class="section-title" id="ctaTitle">Your next deploy can be boring</h2>
        <p>Fourteen days, every feature, ten seats. Bring your real data and your real deadlines —
          we will show you the gap by Friday.</p>
        <ul class="cta-points">
          <li><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Onboarding call with an implementation engineer</li>
          <li><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"></path></svg>Migration help for your existing dashboards</li>
        </ul>
      </div>

      <form class="cta-form" id="ctaForm" novalidate>
        <div class="field">
          <label class="field-label" for="ctaEmail">Work email</label>
          <input class="field-input" type="email" id="ctaEmail" name="email" placeholder="you@company.com" autocomplete="email" required aria-describedby="ctaError ctaNote">
        </div>
        <button class="btn btn--primary btn--lg btn--block" type="submit">
          Create my workspace
        </button>
        <p class="field-error" id="ctaError" role="alert" hidden></p>
        <p class="field-note" id="ctaNote">No card required. We email once to set up your workspace.</p>
      </form>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="shell">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="brand" href="#top" aria-label="StartupX — back to top">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m13 2-8 11h6l-1 9 8-11h-6l1-9Z"></path></svg>
          </span>
          <span class="brand-name">StartupX</span>
        </a>
        <p>The operating system for early-stage software companies. Built in Lisbon and Toronto
          since 2021.</p>
        <ul class="social-list">
          <li><a class="icon-btn" href="#top" aria-label="StartupX on GitHub"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path></svg></a></li>
          <li><a class="icon-btn" href="#top" aria-label="StartupX on LinkedIn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg></a></li>
          <li><a class="icon-btn" href="#top" aria-label="StartupX on X"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4h3.6l4 5.4L16.2 4H20l-6.4 7.6L20.4 20h-3.6l-4.3-5.8L7.4 20H3.6l6.8-8.1Z"></path></svg></a></li>
          <li><a class="icon-btn" href="#top" aria-label="StartupX RSS feed"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1.4" fill="currentColor"></circle></svg></a></li>
        </ul>
      </div>

      <nav class="footer-cols" aria-label="Footer">
        <div class="footer-col">
          <h2 class="footer-col-title">Product</h2>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#product">Product tour</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#how">Implementation</a></li>
            <li><a href="#metrics">Changelog</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col-title">Resources</h2>
          <ul>
            <li><a href="#faq">Documentation</a></li>
            <li><a href="#testimonials">Customer stories</a></li>
            <li><a href="#how">Engineering blog</a></li>
            <li><a href="#faq">API reference</a></li>
            <li><a href="#faq">Status page</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col-title">Company</h2>
          <ul>
            <li><a href="#testimonials">About</a></li>
            <li><a href="#cta">Careers</a></li>
            <li><a href="#faq">Trust centre</a></li>
            <li><a href="#faq">Press kit</a></li>
            <li><a href="#cta">Contact sales</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col-title">Legal</h2>
          <ul>
            <li><a href="#faq">Privacy policy</a></li>
            <li><a href="#faq">Terms of service</a></li>
            <li><a href="#faq">Data processing</a></li>
            <li><a href="#faq">Sub-processors</a></li>
            <li><a href="#faq">Security</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <p>&copy; <span id="footerYear">2026</span> StartupX Unipessoal Lda. All rights reserved.</p>
      <p class="footer-note">SOC 2 Type II · GDPR compliant · EU and US data residency</p>
    </div>
  </div>
</footer>

<button class="to-top" type="button" id="toTop" aria-label="Back to top" hidden>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 7-7 7 7M12 5v14"></path></svg>
</button>

<div class="toast" id="toast" role="status" aria-live="polite"></div>`;

export const css = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-bg: #ffffff;
  --color-bg-soft: #f7f8fc;
  --color-bg-tint: #eef0fb;
  --color-surface: #ffffff;
  --color-surface-2: #f2f4f9;
  --color-surface-3: #e7eaf3;
  --color-text: #0c1020;
  --color-text-muted: #4b5468;
  --color-text-subtle: #6a7285;
  --color-border: #e2e6f0;
  --color-border-strong: #cbd2e2;
  --color-accent: #4a46e0;
  --color-accent-strong: #3a35c4;
  --color-accent-soft: #eceafd;
  --color-on-accent: #ffffff;
  --color-good: #0f7a4d;
  --color-bad: #b3251f;
  --color-dark-band: #0c1020;
  --color-dark-text: #e8eaf2;
  --color-dark-muted: #a2a9bd;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --section-pad: clamp(3.5rem, 8vw, 7rem);
  --shell-w: 1200px;
  --shell-narrow: 820px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 26px;
  --radius-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(12, 16, 32, 0.06);
  --shadow-sm: 0 2px 6px rgba(12, 16, 32, 0.05), 0 1px 2px rgba(12, 16, 32, 0.04);
  --shadow-md: 0 10px 26px rgba(12, 16, 32, 0.08), 0 2px 6px rgba(12, 16, 32, 0.04);
  --shadow-lg: 0 26px 60px rgba(12, 16, 32, 0.13), 0 6px 16px rgba(12, 16, 32, 0.06);

  --font-display: 'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --fs-h1: clamp(2.35rem, 5.2vw, 3.9rem);
  --fs-h2: clamp(1.85rem, 3.4vw, 2.7rem);
  --fs-h3: clamp(1.12rem, 1.6vw, 1.32rem);
  --fs-lede: clamp(1rem, 1.3vw, 1.12rem);
  --fs-sm: 0.875rem;
  --fs-xs: 0.78rem;

  --header-h: 70px;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur: 0.28s;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0b0e17;
    --color-bg-soft: #10141f;
    --color-bg-tint: #151a2b;
    --color-surface: #141926;
    --color-surface-2: #1b2131;
    --color-surface-3: #232b3d;
    --color-text: #eef0f7;
    --color-text-muted: #a8b0c4;
    --color-text-subtle: #8b93a8;
    --color-border: #242c3d;
    --color-border-strong: #333c52;
    --color-accent: #8f8bff;
    --color-accent-strong: #a6a2ff;
    --color-accent-soft: #1d2140;
    --color-on-accent: #0b0e17;
    --color-good: #4ad39a;
    --color-bad: #ff8b82;
    --color-dark-band: #070911;
    --color-dark-text: #eef0f7;
    --color-dark-muted: #98a0b6;
    --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 12px 28px rgba(0, 0, 0, 0.45);
    --shadow-lg: 0 28px 64px rgba(0, 0, 0, 0.55);
  }
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.15; margin: 0; letter-spacing: -0.02em; }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
img, svg { display: block; }
button { font: inherit; color: inherit; }
a { color: var(--color-accent); text-decoration: none; }

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: fixed;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 200;
  padding: 0.7rem 1.1rem;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-weight: 600;
  font-size: var(--fs-sm);
  transform: translateY(-200%);
  transition: transform var(--dur) var(--ease);
}
.skip-link:focus-visible { transform: translateY(0); }

.shell {
  width: 100%;
  max-width: var(--shell-w);
  margin-inline: auto;
  padding-inline: clamp(1.1rem, 4vw, 2rem);
}
.shell--narrow { max-width: var(--shell-narrow); }

.icon { width: 1.25em; height: 1.25em; flex: none; }
.icon--xs { width: 1em; height: 1em; }
.icon--sm { width: 1.1rem; height: 1.1rem; }

[data-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
  transition-delay: var(--delay, 0s);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- buttons ---------- */
.btn {
  --btn-bg: transparent;
  --btn-fg: var(--color-text);
  --btn-bd: var(--color-border-strong);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.72rem 1.15rem;
  border: 1px solid var(--btn-bd);
  border-radius: var(--radius-md);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-family: var(--font-body);
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  overflow: hidden;
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
              background-color var(--dur) var(--ease), border-color var(--dur) var(--ease),
              color var(--dur) var(--ease);
}
.btn::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.42) 50%, transparent 80%);
  pointer-events: none;
  transition: transform 0.62s var(--ease);
}
.btn:hover::after { transform: translateX(120%); }
.btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn:active { transform: translateY(0) scale(0.985); }

.btn--primary { --btn-bg: var(--color-accent); --btn-fg: var(--color-on-accent); --btn-bd: var(--color-accent); }
.btn--primary:hover { --btn-bg: var(--color-accent-strong); --btn-bd: var(--color-accent-strong); }
.btn--outline { --btn-fg: var(--color-accent); --btn-bd: var(--color-accent); }
.btn--outline:hover { --btn-bg: var(--color-accent-soft); }
.btn--ghost { --btn-bd: transparent; --btn-fg: var(--color-text-muted); }
.btn--ghost:hover { --btn-bg: var(--color-surface-2); --btn-fg: var(--color-text); box-shadow: none; }
.btn--sm { padding: 0.52rem 0.9rem; font-size: var(--fs-sm); border-radius: var(--radius-sm); }
.btn--lg { padding: 0.95rem 1.6rem; font-size: 1.02rem; }
.btn--block { width: 100%; }

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 40px; height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease),
              background-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.icon-btn:hover { color: var(--color-accent); border-color: var(--color-accent); transform: translateY(-1px); }
.icon-btn:active { transform: translateY(0) scale(0.95); }

/* ---------- header ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 90;
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.site-header.is-stuck { border-bottom-color: var(--color-border); box-shadow: var(--shadow-sm); }

.header-inner {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2rem);
  min-height: var(--header-h);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--color-text);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.12rem;
  letter-spacing: -0.02em;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-on-accent);
}
.brand-mark svg { width: 19px; height: 19px; }
.brand:hover .brand-mark { animation: mark-pop 0.5s var(--ease); }

.primary-nav { margin-inline-start: auto; }
.nav-list { display: flex; align-items: center; gap: 0.25rem; }
.nav-item { position: relative; }

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem 0.85rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  font-size: 0.94rem;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.nav-link:hover { color: var(--color-text); background: var(--color-surface-2); }
.nav-chev { transition: transform var(--dur) var(--ease); }
.nav-trigger[aria-expanded="true"] { color: var(--color-accent); background: var(--color-accent-soft); }
.nav-trigger[aria-expanded="true"] .nav-chev { transform: rotate(180deg); }

.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 320px;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease), visibility var(--dur);
}
.dropdown::before {
  content: "";
  position: absolute;
  top: -10px; left: 0; right: 0;
  height: 10px;
}
.dropdown.is-open { opacity: 1; visibility: visible; transform: none; }
.dropdown-list { display: grid; gap: 2px; }
.dropdown-link {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.65rem 0.7rem;
  border-radius: var(--radius-md);
  color: var(--color-text);
}
.dropdown-link:hover { background: var(--color-surface-2); }
.dd-icon {
  display: grid;
  place-items: center;
  width: 34px; height: 34px;
  flex: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.dd-text { display: grid; gap: 2px; }
.dd-text strong { font-size: 0.92rem; font-weight: 600; }
.dd-text small { color: var(--color-text-subtle); font-size: var(--fs-xs); }

.header-actions { display: flex; align-items: center; gap: 0.5rem; }
.nav-toggle { display: none; }
.nav-toggle-close { display: none; }
.nav-toggle[aria-expanded="true"] .nav-toggle-open { display: none; }
.nav-toggle[aria-expanded="true"] .nav-toggle-close { display: block; }

.mobile-nav {
  display: none;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  padding: var(--space-4) clamp(1.1rem, 4vw, 2rem) var(--space-5);
}
.mobile-nav.is-open { display: block; animation: drop-in 0.32s var(--ease); }
.mobile-nav-list { display: grid; gap: 2px; }
.mobile-nav-link {
  display: block;
  padding: 0.8rem 0.4rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-weight: 500;
}
.mobile-nav-link:hover { color: var(--color-accent); }
.mobile-nav-cta { display: grid; gap: 0.6rem; margin-top: var(--space-4); }

.scroll-progress {
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 2px;
  background: transparent;
}
.scroll-progress span {
  display: block;
  height: 100%;
  width: 0;
  background: var(--color-accent);
  transform-origin: left;
}

/* ---------- hero ---------- */
.hero {
  position: relative;
  padding: clamp(3rem, 7vw, 6rem) 0 var(--section-pad);
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  inset: -30% -10% auto -10%;
  height: 620px;
  background:
    radial-gradient(52% 60% at 22% 38%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 70%),
    radial-gradient(40% 50% at 78% 20%, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 72%);
  filter: blur(10px);
  pointer-events: none;
}
.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  font-weight: 500;
  box-shadow: var(--shadow-xs);
}
.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse-ring 2.4s var(--ease) infinite;
}

.hero-title { font-size: var(--fs-h1); margin: var(--space-5) 0 var(--space-4); }
.kinetic { display: inline-flex; align-items: center; }
.kinetic-swap {
  display: inline-flex;
  align-items: baseline;
  color: var(--color-accent);
}
.kinetic-word {
  display: inline-block;
  min-width: 8.6ch;
  animation: word-in 0.5s var(--ease);
}
.kinetic-caret {
  display: inline-block;
  width: 3px;
  height: 0.92em;
  margin-inline-start: 4px;
  background: var(--color-accent);
  animation: caret-blink 1.05s steps(2, end) infinite;
  transform: translateY(0.08em);
}

.hero-sub { max-width: 54ch; color: var(--color-text-muted); font-size: var(--fs-lede); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: var(--space-6) 0 var(--space-6); }

.hero-proof { display: grid; gap: 0.65rem; }
.proof-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
.proof-item .icon { color: var(--color-accent); }
.proof-item strong { color: var(--color-text); font-weight: 600; }
.proof-faces { display: flex; }
.proof-face, .quote-face {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid var(--color-bg);
  background: linear-gradient(150deg,
    hsl(var(--face-hue, 224) 70% 62%),
    hsl(calc(var(--face-hue, 224) + 26) 68% 44%));
}
.proof-face + .proof-face { margin-inline-start: -10px; }

/* product visual */
.hero-visual { position: relative; }
.app-window {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform: perspective(1400px) rotateY(-6deg) rotateX(2deg);
  transition: transform 0.6s var(--ease);
}
.hero-visual:hover .app-window { transform: perspective(1400px) rotateY(0deg) rotateX(0deg); }

.app-chrome {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}
.chrome-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--dot); }
.chrome-url {
  margin-inline-start: 0.6rem;
  padding: 0.2rem 0.7rem;
  border-radius: var(--radius-pill);
  background: var(--color-bg);
  color: var(--color-text-subtle);
  font-size: 0.7rem;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
}

.app-body { display: grid; grid-template-columns: 54px 1fr; min-height: 340px; }
.app-side {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  padding: 1rem 0.85rem;
  border-inline-end: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}
.side-item { height: 10px; border-radius: 4px; background: var(--color-surface-3); }
.side-item--active { background: var(--color-accent); }

.app-main { display: grid; gap: 0.9rem; padding: 1.1rem; align-content: start; }
.app-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.kpi {
  display: grid;
  gap: 2px;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-soft);
}
.kpi-label { color: var(--color-text-subtle); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.06em; }
.kpi-value { font-family: var(--font-display); font-size: 0.98rem; font-weight: 700; }
.kpi-delta { color: var(--color-good); font-size: 0.68rem; font-weight: 600; }

.app-chart { position: relative; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-soft); }
.chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 116px; }
.chart-bars span {
  flex: 1;
  height: var(--h);
  border-radius: 3px 3px 1px 1px;
  background: linear-gradient(180deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 32%, transparent));
  animation: bar-grow 1.1s var(--ease) both;
}
.chart-bars span:nth-child(1) { animation-delay: 0.02s; }
.chart-bars span:nth-child(2) { animation-delay: 0.06s; }
.chart-bars span:nth-child(3) { animation-delay: 0.1s; }
.chart-bars span:nth-child(4) { animation-delay: 0.14s; }
.chart-bars span:nth-child(5) { animation-delay: 0.18s; }
.chart-bars span:nth-child(6) { animation-delay: 0.22s; }
.chart-bars span:nth-child(7) { animation-delay: 0.26s; }
.chart-bars span:nth-child(8) { animation-delay: 0.3s; }
.chart-bars span:nth-child(9) { animation-delay: 0.34s; }
.chart-bars span:nth-child(10) { animation-delay: 0.38s; }
.chart-bars span:nth-child(11) { animation-delay: 0.42s; }
.chart-bars span:nth-child(12) { animation-delay: 0.46s; }
.chart-spark {
  position: absolute;
  inset: 0.8rem;
  width: calc(100% - 1.6rem);
  height: 116px;
  color: var(--color-good);
  opacity: 0.85;
  pointer-events: none;
}
.chart-spark polyline { stroke-dasharray: 320; stroke-dashoffset: 320; animation: draw-line 1.6s var(--ease) 0.35s forwards; }

.app-feed { display: grid; gap: 0.4rem; }
.app-feed li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg-soft);
  font-size: 0.74rem;
}
.feed-tag {
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.feed-text { color: var(--color-text-muted); }
.feed-time { color: var(--color-text-subtle); }

.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  animation: bob 6s var(--ease) infinite;
}
.float-card strong { display: block; font-family: var(--font-display); font-size: 0.98rem; }
.float-card small { color: var(--color-text-subtle); font-size: var(--fs-xs); }
.float-icon {
  display: grid;
  place-items: center;
  width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.float-card--a { top: 12%; inset-inline-end: -22px; animation-delay: -1s; }
.float-card--b { bottom: 8%; inset-inline-start: -30px; animation-delay: -4s; }

/* ---------- marquee ---------- */
.marquee-band {
  padding: var(--space-6) 0;
  border-block: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}
.marquee-caption {
  margin-bottom: var(--space-4);
  text-align: center;
  color: var(--color-text-subtle);
  font-size: var(--fs-xs);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.marquee { display: flex; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.marquee-track { display: flex; gap: 3.5rem; padding-inline-end: 3.5rem; animation: marquee 32s linear infinite; }
.marquee-item {
  flex: none;
  font-family: var(--font-display);
  font-size: 1.06rem;
  font-weight: 600;
  color: var(--color-text-subtle);
  white-space: nowrap;
  transition: color var(--dur) var(--ease);
}
.marquee-item:hover { color: var(--color-accent); }

/* ---------- metrics ---------- */
.metrics { padding: var(--space-8) 0; }
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-border);
  overflow: hidden;
}
.metric {
  display: grid;
  gap: 0.35rem;
  padding: clamp(1.25rem, 2.4vw, 1.9rem);
  background: var(--color-bg);
  text-align: center;
}
.metric-value {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.6vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
}
.metric-label { color: var(--color-text-muted); font-size: var(--fs-sm); }

/* ---------- sections ---------- */
.section-head { max-width: 62ch; margin-bottom: clamp(2rem, 4vw, 3rem); }
.section-tag {
  display: inline-block;
  margin-bottom: 0.7rem;
  padding: 0.25rem 0.7rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.section-title { font-size: var(--fs-h2); }
.section-lede { margin-top: 0.9rem; color: var(--color-text-muted); font-size: var(--fs-lede); }

.features { padding: var(--section-pad) 0; background: var(--color-bg-soft); }
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.1rem;
}
.feature-card {
  padding: clamp(1.4rem, 2.4vw, 1.9rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.feature-card:hover { transform: translateY(-5px); border-color: var(--color-border-strong); box-shadow: var(--shadow-md); }
.feature-icon {
  display: grid;
  place-items: center;
  width: 46px; height: 46px;
  margin-bottom: 1rem;
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.feature-icon .icon { width: 22px; height: 22px; }
.feature-card h3 { font-size: var(--fs-h3); margin-bottom: 0.5rem; }
.feature-card p { color: var(--color-text-muted); font-size: 0.95rem; }
.feature-points { display: grid; gap: 0.4rem; margin-top: 1rem; }
.feature-points li { display: flex; gap: 0.5rem; color: var(--color-text-muted); font-size: var(--fs-sm); }
.feature-points .icon { margin-top: 0.28rem; color: var(--color-accent); }

.how { padding: var(--section-pad) 0; }
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
  counter-reset: step;
}
.step {
  position: relative;
  padding: clamp(1.5rem, 2.4vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-soft);
}
.step-index {
  display: inline-block;
  margin-bottom: 0.9rem;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}
.step h3 { font-size: var(--fs-h3); margin-bottom: 0.5rem; }
.step p { color: var(--color-text-muted); font-size: 0.95rem; }
.step-meta { display: grid; gap: 0.35rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--color-border-strong); }
.step-meta li { color: var(--color-text-subtle); font-size: var(--fs-xs); font-weight: 500; }

/* ---------- tabs ---------- */
.product { padding: var(--section-pad) 0; background: var(--color-bg-soft); }
.tablist {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.28rem;
  margin-bottom: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  flex-wrap: wrap;
}
.tab {
  padding: 0.5rem 1.05rem;
  border: 0;
  border-radius: var(--radius-pill);
  background: none;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.tab:hover { color: var(--color-text); }
.tab.is-active { background: var(--color-accent); color: var(--color-on-accent); }

.tabpanel {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: clamp(1.5rem, 3vw, 3rem);
  align-items: center;
  padding: clamp(1.4rem, 3vw, 2.4rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}
.tabpanel[hidden] { display: none; }
.tabpanel.is-active { animation: fade-up 0.42s var(--ease); }
.panel-copy h3 { font-size: var(--fs-h3); margin-bottom: 0.6rem; }
.panel-copy p { color: var(--color-text-muted); font-size: 0.96rem; }
.panel-list { display: grid; gap: 0.55rem; margin-top: 1.1rem; }
.panel-list li { display: flex; gap: 0.55rem; font-size: var(--fs-sm); color: var(--color-text-muted); }
.panel-list .icon { margin-top: 0.28rem; color: var(--color-accent); }

.panel-art {
  display: grid;
  place-items: center;
  min-height: 260px;
  padding: clamp(1rem, 2vw, 1.6rem);
  border-radius: var(--radius-lg);
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border);
}
.art-dashboard {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.art-head { display: flex; gap: 5px; padding-bottom: 0.7rem; border-bottom: 1px solid var(--color-border); }
.art-head span { width: 8px; height: 8px; border-radius: 50%; background: var(--color-surface-3); }
.art-rows { display: grid; gap: 0.5rem; padding: 0.8rem 0; }
.art-row { height: 8px; border-radius: 4px; background: var(--color-surface-2); }
.art-row i { display: block; height: 100%; width: var(--w); border-radius: 4px; background: var(--color-accent); opacity: 0.75; }
.art-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.art-grid span { height: 40px; border-radius: var(--radius-sm); background: linear-gradient(160deg, var(--color-accent-soft), var(--color-surface-2)); }

.art-flow { display: grid; justify-items: center; gap: 0; width: 100%; }
.flow-node {
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--fs-sm);
  font-weight: 600;
}
.flow-node--accent { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-on-accent); }
.flow-link { width: 2px; height: 26px; background: var(--color-border-strong); }

.art-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.art-chips li {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  font-weight: 600;
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.art-chips li:hover { color: var(--color-accent); border-color: var(--color-accent); transform: translateY(-2px); }

/* ---------- slider ---------- */
.testimonials { padding: var(--section-pad) 0; }
.slider-viewport { overflow: hidden; border-radius: var(--radius-xl); }
.slider-track {
  display: flex;
  transition: transform 0.55s var(--ease);
}
.slide { flex: 0 0 100%; padding: 0.35rem; }
.quote-card {
  display: grid;
  gap: 1.4rem;
  margin: 0;
  padding: clamp(1.6rem, 3.4vw, 2.6rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.quote-card blockquote { margin: 0; }
.quote-card blockquote p {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.1vw, 1.5rem);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.02em;
}
.quote-card blockquote p::before { content: "\\201C"; color: var(--color-accent); }
.quote-card blockquote p::after { content: "\\201D"; color: var(--color-accent); }
.quote-by { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }
.quote-face { width: 46px; height: 46px; }
.quote-meta strong { display: block; font-size: 0.98rem; }
.quote-meta small { color: var(--color-text-subtle); font-size: var(--fs-xs); }
.quote-metric {
  margin-inline-start: auto;
  padding: 0.45rem 0.8rem;
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
  text-align: right;
}
.quote-metric strong { display: block; font-family: var(--font-display); color: var(--color-accent); }
.quote-metric small { color: var(--color-text-muted); font-size: var(--fs-xs); }

.slider-controls { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: var(--space-5); }
.slider-btn { border-radius: var(--radius-pill); }
.slider-dots { display: flex; gap: 0.4rem; }
.slider-dot {
  width: 9px; height: 9px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--color-border-strong);
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), width var(--dur) var(--ease);
}
.slider-dot[aria-selected="true"] { width: 26px; border-radius: var(--radius-pill); background: var(--color-accent); }

/* ---------- pricing ---------- */
.pricing { padding: var(--section-pad) 0; background: var(--color-bg-soft); }
.billing-toggle {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: var(--space-6);
}
.billing-option { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--color-text-subtle); font-size: var(--fs-sm); font-weight: 600; }
.billing-option.is-active { color: var(--color-text); }
.save-pill {
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.68rem;
  font-weight: 700;
}
.switch {
  position: relative;
  width: 52px; height: 28px;
  padding: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.switch-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  transition: transform var(--dur) var(--ease);
}
.switch[aria-checked="true"] { background: var(--color-accent); border-color: var(--color-accent); }
.switch[aria-checked="true"] .switch-thumb { transform: translateX(24px); background: var(--color-on-accent); }

.plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.1rem; align-items: start; }
.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: clamp(1.5rem, 2.4vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.plan:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.plan--featured { border-color: var(--color-accent); box-shadow: var(--shadow-md); }
.plan-flag {
  position: absolute;
  top: -11px;
  inset-inline-start: clamp(1.5rem, 2.4vw, 2rem);
  padding: 0.22rem 0.65rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.plan-name { font-size: 1.2rem; }
.plan-for { color: var(--color-text-muted); font-size: var(--fs-sm); }
.plan-price { display: flex; align-items: baseline; gap: 0.15rem; margin-top: 0.6rem; }
.plan-currency { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; }
.plan-amount {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.plan--featured .plan-amount { color: var(--color-accent); }
.plan-period { color: var(--color-text-subtle); font-size: var(--fs-sm); }
.plan-bill { min-height: 1.2rem; margin-bottom: 1rem; color: var(--color-text-subtle); font-size: var(--fs-xs); }
.plan-list { display: grid; gap: 0.5rem; margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px solid var(--color-border); }
.plan-list li { display: flex; gap: 0.5rem; color: var(--color-text-muted); font-size: var(--fs-sm); }
.plan-list .icon { margin-top: 0.28rem; color: var(--color-accent); }
.pricing-foot { margin-top: var(--space-6); color: var(--color-text-subtle); font-size: var(--fs-sm); text-align: center; max-width: 64ch; margin-inline: auto; }

/* ---------- faq ---------- */
.faq { padding: var(--section-pad) 0; }
.faq .section-head { margin-inline: auto; text-align: center; }
.faq-list { display: grid; gap: 0.6rem; }
.faq-item { border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; transition: border-color var(--dur) var(--ease); }
.faq-item.is-open { border-color: var(--color-accent); }
.faq-item h3 { margin: 0; font-size: 1rem; }
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.05rem 1.2rem;
  border: 0;
  background: none;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--dur) var(--ease);
}
.faq-q:hover { color: var(--color-accent); }
.faq-chev { flex: none; color: var(--color-text-subtle); transition: transform var(--dur) var(--ease); }
.faq-q[aria-expanded="true"] { color: var(--color-accent); }
.faq-q[aria-expanded="true"] .faq-chev { transform: rotate(180deg); }
.faq-a { padding: 0 1.2rem 1.2rem; }
.faq-a[hidden] { display: none; }
.faq-a p { color: var(--color-text-muted); font-size: 0.95rem; max-width: 70ch; }

/* ---------- cta ---------- */
.cta {
  padding: var(--section-pad) 0;
  background: var(--color-dark-band);
  color: var(--color-dark-text);
}
.cta-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(1.6rem, 4vw, 3.5rem);
  align-items: center;
}
.cta .section-title { color: var(--color-dark-text); }
.cta-copy > p { margin-top: 0.9rem; max-width: 52ch; color: var(--color-dark-muted); font-size: var(--fs-lede); }
.cta-points { display: grid; gap: 0.5rem; margin-top: 1.4rem; }
.cta-points li { display: flex; gap: 0.55rem; color: var(--color-dark-muted); font-size: var(--fs-sm); }
.cta-points .icon { margin-top: 0.24rem; color: var(--color-accent); }

.cta-form {
  display: grid;
  gap: 0.7rem;
  padding: clamp(1.2rem, 2.4vw, 1.7rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.04);
}
.field { display: grid; gap: 0.35rem; }
.field-label { color: var(--color-dark-muted); font-size: var(--fs-xs); font-weight: 600; letter-spacing: 0.05em; }
.field-input {
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-dark-text);
  font-family: var(--font-body);
  font-size: 0.95rem;
  transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.field-input::placeholder { color: rgba(255, 255, 255, 0.38); }
.field-input:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; border-color: transparent; }
.field-input.has-error { border-color: #ff8b82; }
.field-error { color: #ffb4ae; font-size: var(--fs-xs); font-weight: 500; }
.field-error[hidden] { display: none; }
.field-note { color: rgba(255, 255, 255, 0.45); font-size: var(--fs-xs); }

/* ---------- footer ---------- */
.site-footer {
  padding: var(--section-pad) 0 var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}
.footer-top {
  display: grid;
  grid-template-columns: minmax(240px, 1.1fr) minmax(0, 2fr);
  gap: clamp(1.8rem, 4vw, 3.5rem);
}
.footer-brand { max-width: 40ch; }
.footer-brand > p { margin-top: 1rem; color: var(--color-text-muted); font-size: var(--fs-sm); }
.social-list { display: flex; gap: 0.5rem; margin-top: 1.2rem; }
.footer-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}
.footer-col-title {
  margin-bottom: 0.9rem;
  font-family: var(--font-body);
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}
.footer-col ul { display: grid; gap: 0.5rem; }
.footer-col a {
  position: relative;
  display: inline-block;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
.footer-col a::after {
  content: "";
  position: absolute;
  left: 0; bottom: -2px;
  width: 100%; height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur) var(--ease);
}
.footer-col a:hover { color: var(--color-accent); }
.footer-col a:hover::after { transform: scaleX(1); }

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.5rem;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-subtle);
  font-size: var(--fs-xs);
}

/* ---------- to-top + toast ---------- */
.to-top {
  position: fixed;
  right: clamp(0.9rem, 3vw, 1.6rem);
  bottom: clamp(0.9rem, 3vw, 1.6rem);
  z-index: 80;
  display: grid;
  place-items: center;
  width: 44px; height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease), color var(--dur) var(--ease);
}
.to-top[hidden] { display: grid; visibility: hidden; }
.to-top.is-shown { opacity: 1; visibility: visible; transform: none; }
.to-top:hover { color: var(--color-accent); }

.toast {
  position: fixed;
  left: 50%;
  bottom: clamp(1rem, 4vh, 2.4rem);
  z-index: 95;
  max-width: min(92vw, 420px);
  padding: 0.75rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-dark-band);
  color: var(--color-dark-text);
  font-size: var(--fs-sm);
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translate(-50%, 20px);
  pointer-events: none;
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.toast.is-shown { opacity: 1; transform: translate(-50%, 0); }

/* ---------- keyframes ---------- */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes word-in {
  from { opacity: 0; transform: translateY(0.35em) rotateX(-40deg); }
  to { opacity: 1; transform: none; }
}
@keyframes caret-blink {
  0%, 45% { opacity: 1; }
  55%, 100% { opacity: 0; }
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 55%, transparent); }
  70% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--color-accent) 0%, transparent); }
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-11px); }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes bar-grow {
  from { transform: scaleY(0.02); transform-origin: bottom; }
  to { transform: scaleY(1); transform-origin: bottom; }
}
@keyframes draw-line { to { stroke-dashoffset: 0; } }
@keyframes drop-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: none; }
}
@keyframes mark-pop {
  0% { transform: scale(1) rotate(0deg); }
  45% { transform: scale(1.16) rotate(-8deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes flash-in {
  0% { transform: translateY(0.35em); opacity: 0; }
  100% { transform: none; opacity: 1; }
}

/* ---------- responsive ---------- */
@media (max-width: 1080px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-copy { text-align: center; }
  .hero-sub, .cta-copy > p { margin-inline: auto; }
  .hero-actions, .hero-proof { justify-content: center; }
  .eyebrow { margin-inline: auto; }
  .app-window { transform: none; }
  .float-card--a { inset-inline-end: -8px; }
  .float-card--b { inset-inline-start: -8px; }
  .tabpanel { grid-template-columns: 1fr; }
  .cta-inner { grid-template-columns: 1fr; }
  .footer-top { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .primary-nav { display: none; }
  .header-actions .btn--ghost { display: none; }
  .nav-toggle { display: inline-grid; }
}

@media (max-width: 620px) {
  .header-actions .btn--primary { display: none; }
  .hero-actions .btn { width: 100%; }
  .app-kpis { grid-template-columns: 1fr 1fr; }
  .app-kpis .kpi:last-child { grid-column: span 2; }
  .float-card--a { inset-inline-end: 0; top: -18px; }
  .float-card--b { inset-inline-start: 0; bottom: -18px; }
  .metrics-grid { grid-template-columns: 1fr 1fr; }
  .slide { padding: 0; }
  .quote-metric { margin-inline-start: 0; text-align: left; }
  .slider-controls { gap: 0.6rem; }
  .billing-toggle { flex-wrap: wrap; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .toast { left: 1rem; right: 1rem; transform: translateY(20px); max-width: none; }
  .toast.is-shown { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  [data-reveal] { opacity: 1; transform: none; }
  .marquee-track { animation: none; }
  .app-window { transform: none; }
}
`;