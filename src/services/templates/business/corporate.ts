
export default {
  html: `
<a class="skip-link" href="#main">Skip to main content</a>

<header class="site-header" id="site-header">
  <div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
  <div class="wrap header-inner">
    <a class="brand" href="#top" aria-label="Meridian Group, return to top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <path d="M16 2 4 8v9c0 7 5 11.5 12 13 7-1.5 12-6 12-13V8L16 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M11 22V10m10 12V10M11 16h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-text">Meridian<em>Group</em></span>
    </a>

    <nav class="primary-nav" id="primary-nav" aria-label="Primary">
      <ul class="nav-list">
        <li class="nav-item">
          <button type="button" class="nav-link nav-trigger" data-dropdown="dd-services" aria-expanded="false" aria-controls="dd-services">
            Services
            <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="dropdown" id="dd-services" hidden>
            <p class="dropdown-label">Capabilities</p>
            <ul>
              <li><a href="#capabilities">Digital Transformation</a></li>
              <li><a href="#capabilities">Cloud &amp; Platform Engineering</a></li>
              <li><a href="#capabilities">Data &amp; Applied AI</a></li>
              <li><a href="#capabilities">Cyber Resilience</a></li>
              <li><a href="#capabilities">Payments Systems</a></li>
              <li><a href="#capabilities">Managed Services</a></li>
            </ul>
          </div>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link nav-trigger" data-dropdown="dd-industries" aria-expanded="false" aria-controls="dd-industries">
            Industries
            <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="dropdown" id="dd-industries" hidden>
            <p class="dropdown-label">Sectors</p>
            <ul>
              <li><a href="#results">Financial Services</a></li>
              <li><a href="#results">Logistics &amp; Supply Chain</a></li>
              <li><a href="#results">Healthcare &amp; Life Sciences</a></li>
              <li><a href="#results">Energy &amp; Utilities</a></li>
              <li><a href="#results">Public Sector</a></li>
            </ul>
          </div>
        </li>
        <li class="nav-item"><a class="nav-link" href="#approach" data-spy="approach">Approach</a></li>
        <li class="nav-item"><a class="nav-link" href="#results" data-spy="results">Results</a></li>
        <li class="nav-item"><a class="nav-link" href="#leadership" data-spy="leadership">People</a></li>
        <li class="nav-item"><a class="nav-link" href="#insights" data-spy="insights">Insights</a></li>
      </ul>
      <div class="nav-mobile-extra">
        <a class="btn btn-ghost" href="#events">Events</a>
        <a class="btn btn-primary" href="#contact">Book a consultation</a>
      </div>
    </nav>

    <div class="header-actions">
      <a class="btn btn-primary btn-sm desktop-cta" href="#contact">Book a consultation</a>
      <button type="button" class="icon-btn nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="main">
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="hero-grid-lines" aria-hidden="true"></div>
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> Independent advisory since 2008</p>
        <h1 id="hero-title" class="hero-title">
          <span class="line"><span class="word">We</span> <span class="word">rebuild</span></span>
          <span class="line"><span class="word">the</span> <span class="word">systems</span> <span class="word">your</span></span>
          <span class="line"><span class="word word-accent">business</span> <span class="word">runs</span> <span class="word">on.</span></span>
        </h1>
        <p class="lede">Meridian Group designs, migrates and operates the technology estates behind 180 institutions. Fixed scope, senior teams, and outcomes priced against numbers we publish.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#contact">
            Start a conversation
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
          <a class="btn btn-outline" href="#results">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7V5Z"/></svg>
            See client results
          </a>
        </div>
        <dl class="hero-stats">
          <div><dt>Engagements delivered</dt><dd><span class="counter" data-count="1240" data-decimals="0">0</span></dd></div>
          <div><dt>Countries covered</dt><dd><span class="counter" data-count="38">0</span></dd></div>
          <div><dt>Client retention</dt><dd><span class="counter" data-count="96" data-suffix="%">0</span></dd></div>
          <div><dt>Value unlocked</dt><dd>$<span class="counter" data-count="4.2" data-decimals="1">0</span>B</dd></div>
        </dl>
      </div>

      <aside class="hero-panel" aria-labelledby="panel-title">
        <div class="panel-head">
          <h2 id="panel-title">Delivery snapshot</h2>
          <span class="panel-tag">Q1 2026</span>
        </div>
        <ul class="panel-list">
          <li>
            <span class="panel-k">Live programmes</span>
            <span class="panel-v">23</span>
          </li>
          <li>
            <span class="panel-k">Median time to first value</span>
            <span class="panel-v">9 weeks</span>
          </li>
          <li>
            <span class="panel-k">Specialists on the bench</span>
            <span class="panel-v">412</span>
          </li>
          <li>
            <span class="panel-k">Escalations this quarter</span>
            <span class="panel-v panel-ok">3</span>
          </li>
        </ul>
        <div class="panel-bar" aria-hidden="true"><span></span></div>
        <p class="panel-note">Audited figures, Meridian Group internal reporting, 31 March 2026.</p>
      </aside>
    </div>
  </section>

  <section class="marquee-band" aria-label="Selected clients">
    <div class="wrap">
      <p class="marquee-title">Trusted by institutions across finance, logistics, energy and health</p>
    </div>
    <div class="marquee" data-marquee>
      <div class="marquee-track">
        <ul class="logo-row">
          <li>NORTHWIND</li><li>KESTREL BANK</li><li>ALTIRA</li><li>VELOCITY AIR</li>
          <li>HOLLOWAY &amp; CO</li><li>PACIFICA ENERGY</li><li>ORBIT LABS</li><li>FENWICK HEALTH</li>
        </ul>
        <ul class="logo-row" aria-hidden="true">
          <li>NORTHWIND</li><li>KESTREL BANK</li><li>ALTIRA</li><li>VELOCITY AIR</li>
          <li>HOLLOWAY &amp; CO</li><li>PACIFICA ENERGY</li><li>ORBIT LABS</li><li>FENWICK HEALTH</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="about" id="about" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <div class="about-copy" data-reveal>
        <p class="eyebrow">Who we are</p>
        <h2 id="about-title" class="section-title">A partner accountable for the outcome, not the hours</h2>
        <p>We were founded by four infrastructure engineers who spent a decade watching large programmes run over budget with nobody senior enough to admit it. Meridian was built the other way around: every engagement carries a named partner, a written outcome metric, and a clause that ends the contract the moment we miss it.</p>
        <p>We are deliberately mid-sized. Big enough to run a nine-country migration, small enough that the person who sold the work is in the standup.</p>
        <ul class="about-points">
          <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span> Partner-led, average 18 years experience</li>
          <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span> Independent, no vendor resale commissions</li>
          <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span> Published outcome metrics on every contract</li>
        </ul>
        <a class="link-underline" href="#leadership">Meet the leadership team<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
      </div>

      <div class="about-figures" data-reveal>
        <div class="figure-card">
          <span class="figure-value"><span class="counter" data-count="420">0</span></span>
          <span class="figure-label">Engineers, architects and delivery leads</span>
        </div>
        <div class="figure-card figure-card-accent">
          <span class="figure-value"><span class="counter" data-count="18">0</span> yrs</span>
          <span class="figure-label">Average partner tenure in the industry</span>
        </div>
        <figure class="figure-quote">
          <blockquote>
            <p>&ldquo;They are the only firm we have worked with that voluntarily showed us the numbers that made them look bad.&rdquo;</p>
          </blockquote>
          <figcaption>Ingrid Vasquez-Holt, Group COO, Kestrel Bank</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="services" id="capabilities" aria-labelledby="services-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="eyebrow">Capabilities</p>
        <h2 id="services-title" class="section-title">Six practices, one accountable team</h2>
        <p class="section-sub">Each practice runs its own delivery methodology and certification track, and they interoperate without a handoff gap.</p>
      </header>
      <ul class="card-grid">
        <li class="card" data-reveal style="--delay:0ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 6h5l3 6 3-6h5M4 18h5l3-6"/><path d="m17 3 3 3-3 3M17 15l3 3-3 3"/></svg></span>
          <h3>Digital Transformation</h3>
          <p>Legacy estate decomposition, domain redesign and a migration plan sequenced so revenue never waits on the programme.</p>
          <ul class="card-meta"><li>Estate assessment in 3 weeks</li><li>Outcome pricing</li></ul>
        </li>
        <li class="card" data-reveal style="--delay:60ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg></span>
          <h3>Cloud &amp; Platform Engineering</h3>
          <p>Kubernetes, Terraform and observability built as product teams with on-call rotas, not as a migration once-off.</p>
          <ul class="card-meta"><li>Landing zones in 4 weeks</li><li>FinOps baseline included</li></ul>
        </li>
        <li class="card" data-reveal style="--delay:120ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg></span>
          <h3>Data &amp; Applied AI</h3>
          <p>Governed pipelines, a shared metric layer, and models put into production with monitoring rather than pilots that die.</p>
          <ul class="card-meta"><li>Model risk sign-off</li><li>EU AI Act readiness</li></ul>
        </li>
        <li class="card" data-reveal style="--delay:180ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg></span>
          <h3>Cyber Resilience</h3>
          <p>Threat modelling, incident rehearsal and a 24/7 security operations centre built to your existing tooling, not ours.</p>
          <ul class="card-meta"><li>SOC 2 and ISO 27001</li><li>90-day detection target</li></ul>
        </li>
        <li class="card" data-reveal style="--delay:240ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/></svg></span>
          <h3>Payments Systems</h3>
          <p>Core banking, card issuing and real-time rails, delivered with scheme certification and regulator liaison handled.</p>
          <ul class="card-meta"><li>PCI DSS v4 scope</li><li>Scheme accreditation</li></ul>
        </li>
        <li class="card" data-reveal style="--delay:300ms">
          <span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="5" height="7" rx="2"/><rect x="17" y="13" width="5" height="7" rx="2"/></svg></span>
          <h3>Managed Services</h3>
          <p>Run operations, service desk and continuous improvement on a monthly retainer with published availability targets.</p>
          <ul class="card-meta"><li>99.95% availability SLA</li><li>Named service manager</li></ul>
        </li>
      </ul>
    </div>
  </section>

  <section class="approach" id="approach" aria-labelledby="approach-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="eyebrow">How we work</p>
        <h2 id="approach-title" class="section-title">Four commitments we put in writing</h2>
      </header>
      <ol class="differentiators">
        <li data-reveal style="--delay:0ms">
          <span class="diff-num" aria-hidden="true">01</span>
          <h3>Senior-only delivery teams</h3>
          <p>No pyramid staffing. The people in the proposal are the people on the programme, and we name them in the contract annexe.</p>
        </li>
        <li data-reveal style="--delay:70ms">
          <span class="diff-num" aria-hidden="true">02</span>
          <h3>Fixed scope, fixed price</h3>
          <p>We quote the whole outcome for a fixed fee. Change requests are quoted separately and never absorbed silently into the original.</p>
        </li>
        <li data-reveal style="--delay:140ms">
          <span class="diff-num" aria-hidden="true">03</span>
          <h3>Nine weeks to first value</h3>
          <p>Every plan front-loads a measurable release in week nine. If it slips, we credit the delay back to you automatically.</p>
        </li>
        <li data-reveal style="--delay:210ms">
          <span class="diff-num" aria-hidden="true">04</span>
          <h3>You own everything</h3>
          <p>Code, infrastructure definitions and documentation transfer to you on day one of acceptance, including our internal accelerators.</p>
        </li>
      </ol>

      <div class="process" data-reveal>
        <h3 class="process-title">A 24-week reference programme</h3>
        <ol class="process-steps">
          <li><span class="step-badge">Weeks 1&ndash;3</span><strong>Diagnose</strong><p>Estate scan, constraint interviews, a written findings report you own.</p></li>
          <li><span class="step-badge">Weeks 4&ndash;9</span><strong>Prove</strong><p>One production slice shipped and measured against the agreed baseline.</p></li>
          <li><span class="step-badge">Weeks 10&ndash;18</span><strong>Scale</strong><p>Pattern applied across the remaining estate with a weekly release cadence.</p></li>
          <li><span class="step-badge">Weeks 19&ndash;24</span><strong>Transfer</strong><p>Runbooks, training, and a support model signed off by your operations lead.</p></li>
        </ol>
      </div>
    </div>
  </section>

  <section class="results" id="results" aria-labelledby="results-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="eyebrow">Client results</p>
        <h2 id="results-title" class="section-title">Numbers our clients agreed to publish</h2>
      </header>
      <ul class="result-grid">
        <li class="result-card" data-reveal style="--delay:0ms">
          <p class="result-client">Kestrel Bank &middot; Financial Services</p>
          <h3>Payments platform rebuilt without a single outage window</h3>
          <p>Forty-two legacy services decommissioned and 60 million transactions a day moved onto a horizontally scaled ledger.</p>
          <dl class="result-metrics">
            <div><dt>Settlement time</dt><dd>&minus;63%</dd></div>
            <div><dt>Annual savings</dt><dd>$18M</dd></div>
          </dl>
        </li>
        <li class="result-card" data-reveal style="--delay:80ms">
          <p class="result-client">Altira Logistics &middot; Transport</p>
          <h3>One planning engine across eleven European depots</h3>
          <p>Eleven regional planning tools replaced with a single forecasting service and a driver-facing mobile view.</p>
          <dl class="result-metrics">
            <div><dt>On-time delivery</dt><dd>+31%</dd></div>
            <div><dt>Tool count</dt><dd>11 &rarr; 1</dd></div>
          </dl>
        </li>
        <li class="result-card" data-reveal style="--delay:160ms">
          <p class="result-client">Holloway &amp; Co &middot; Wealth</p>
          <h3>Client reporting that used to take four days now takes four minutes</h3>
          <p>A governed metric layer replaced 60 spreadsheet models across advisory, performance and risk reporting.</p>
          <dl class="result-metrics">
            <div><dt>Reporting cycle</dt><dd>4d &rarr; 4m</dd></div>
            <div><dt>Assets onboarded</dt><dd>2.4&times;</dd></div>
          </dl>
        </li>
      </ul>
    </div>
  </section>

  <section class="leadership" id="leadership" aria-labelledby="leadership-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="eyebrow">Leadership</p>
        <h2 id="leadership-title" class="section-title">The partners who sign the contract</h2>
      </header>
      <ul class="team-grid">
        <li class="team-card" data-reveal style="--delay:0ms">
          <svg class="avatar" viewBox="0 0 160 160" role="img" aria-label="Illustrated portrait of Amara Okonkwo" focusable="false">
            <defs><linearGradient id="av-okonkwo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3a63"/><stop offset="1" stop-color="#0b1b33"/></linearGradient></defs>
            <rect width="160" height="160" fill="url(#av-okonkwo)"/>
            <path d="M28 160c0-32 23-52 52-52s52 20 52 52Z" fill="#c8a45c" fill-opacity=".28"/>
            <circle cx="80" cy="66" r="27" fill="#e8cfa4"/>
            <path d="M53 62c0-19 12-30 28-30 15 0 27 10 27 27-9-2-16-7-20-13-6 9-19 15-35 16Z" fill="#1b2436"/>
            <circle cx="71" cy="66" r="2.4" fill="#1b2436"/><circle cx="90" cy="66" r="2.4" fill="#1b2436"/>
            <path d="M72 79c5 4 11 4 16 0" stroke="#b08b58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          </svg>
          <h3>Amara Okonkwo</h3>
          <p class="team-role">Group Chief Executive</p>
          <p class="team-bio">Founded Meridian in 2008 after eleven years running infrastructure programmes for two of Europe's largest retail banks.</p>
          <a class="link-underline small" href="#contact">Connect via the partnerships team</a>
        </li>
        <li class="team-card" data-reveal style="--delay:70ms">
          <svg class="avatar" viewBox="0 0 160 160" role="img" aria-label="Illustrated portrait of Daniel Reinhardt" focusable="false">
            <defs><linearGradient id="av-reinhardt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#204268"/><stop offset="1" stop-color="#0b1b33"/></linearGradient></defs>
            <rect width="160" height="160" fill="url(#av-reinhardt)"/>
            <path d="M24 160c0-33 25-53 56-53s56 20 56 53Z" fill="#c8a45c" fill-opacity=".2"/>
            <circle cx="80" cy="65" r="27" fill="#eecda6"/>
            <path d="M52 58c2-18 13-27 29-27 17 0 27 9 28 24-10 3-19 1-25-5-8 5-19 8-32 8Z" fill="#4a3620"/>
            <rect x="63" y="61" width="14" height="10" rx="4" fill="none" stroke="#1b2436" stroke-width="2.2"/>
            <rect x="84" y="61" width="14" height="10" rx="4" fill="none" stroke="#1b2436" stroke-width="2.2"/>
            <path d="M77 66h7" stroke="#1b2436" stroke-width="2.2"/>
            <path d="M72 80c5 3 11 3 16 0" stroke="#b08b58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          </svg>
          <h3>Daniel Reinhardt</h3>
          <p class="team-role">Chief Technology Officer</p>
          <p class="team-bio">Leads the cloud and platform practice. Previously principal engineer on the Kestrel settlement rewrite.</p>
          <a class="link-underline small" href="#contact">Request an architecture review</a>
        </li>
        <li class="team-card" data-reveal style="--delay:140ms">
          <svg class="avatar" viewBox="0 0 160 160" role="img" aria-label="Illustrated portrait of Priya Raghunathan" focusable="false">
            <defs><linearGradient id="av-raghunathan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3f5c"/><stop offset="1" stop-color="#0b1b33"/></linearGradient></defs>
            <rect width="160" height="160" fill="url(#av-raghunathan)"/>
            <path d="M30 160c0-31 22-50 50-50s50 19 50 50Z" fill="#c8a45c" fill-opacity=".26"/>
            <circle cx="80" cy="67" r="26" fill="#d9a877"/>
            <path d="M52 72c-2-24 12-38 29-38 18 0 30 13 28 38-4-12-8-20-14-25-8 12-24 20-43 25Z" fill="#141d2e"/>
            <circle cx="71" cy="68" r="2.4" fill="#141d2e"/><circle cx="89" cy="68" r="2.4" fill="#141d2e"/>
            <path d="M73 80c4 4 10 4 14 0" stroke="#9d6f47" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <circle cx="66" cy="75" r="2" fill="#c05a3e" fill-opacity=".5"/><circle cx="94" cy="75" r="2" fill="#c05a3e" fill-opacity=".5"/>
          </svg>
          <h3>Priya Raghunathan</h3>
          <p class="team-role">Chief Financial Officer</p>
          <p class="team-bio">Owns commercial terms and the outcome-pricing model. Twenty years in financial services transformation.</p>
          <a class="link-underline small" href="#contact">Discuss commercial terms</a>
        </li>
        <li class="team-card" data-reveal style="--delay:210ms">
          <svg class="avatar" viewBox="0 0 160 160" role="img" aria-label="Illustrated portrait of Marcus Lindqvist" focusable="false">
            <defs><linearGradient id="av-lindqvist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173a52"/><stop offset="1" stop-color="#0b1b33"/></linearGradient></defs>
            <rect width="160" height="160" fill="url(#av-lindqvist)"/>
            <path d="M26 160c0-32 24-52 54-52s54 20 54 52Z" fill="#c8a45c" fill-opacity=".22"/>
            <circle cx="80" cy="65" r="27" fill="#f0d9bb"/>
            <path d="M53 60c1-19 12-29 28-29 15 0 26 9 27 26-7-6-16-9-27-9-12 0-21 4-28 12Z" fill="#8b6b3f"/>
            <path d="M55 72c8 14 18 21 25 21s17-7 25-21c-2 20-12 30-25 30s-23-10-25-30Z" fill="#6d7f8f" fill-opacity=".55"/>
            <circle cx="71" cy="64" r="2.4" fill="#1b2436"/><circle cx="90" cy="64" r="2.4" fill="#1b2436"/>
            <path d="M72 78c5 4 11 4 16 0" stroke="#b08b58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          </svg>
          <h3>Marcus Lindqvist</h3>
          <p class="team-role">Chief People Officer</p>
          <p class="team-bio">Built the senior-only staffing model and the Meridian engineering academy in Rotterdam.</p>
          <a class="link-underline small" href="#footer">Explore engineering careers</a>
        </li>
      </ul>
    </div>
  </section>

  <section class="insights" id="insights" aria-labelledby="insights-title">
    <div class="wrap insights-grid">
      <header class="insights-head" data-reveal>
        <p class="eyebrow">Newsroom</p>
        <h2 id="insights-title" class="section-title">Latest from Meridian</h2>
        <p class="section-sub">Announcements and point-of-view from the practice leads. We publish our own figures, including the unflattering ones.</p>
        <a class="link-underline" href="#insights">View the full archive<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
      </header>
      <ol class="news-list">
        <li data-reveal style="--delay:0ms">
          <a href="#insights">
            <time datetime="2026-03-06">6 March 2026</time>
            <span class="news-tag">Partnership</span>
            <h3>Meridian and Orilla Systems partner to accelerate industrial AI</h3>
            <p>The joint practice will co-develop predictive maintenance models for heavy manufacturing, with the first three deployments scheduled for Q3 2026.</p>
          </a>
        </li>
        <li data-reveal style="--delay:70ms">
          <a href="#insights">
            <time datetime="2026-02-21">21 February 2026</time>
            <span class="news-tag">Award</span>
            <h3>Named to the Global Tech 100 for a fourth consecutive year</h3>
            <p>Judges cited our published post-project audits as the clearest differentiator in the enterprise services category this year.</p>
          </a>
        </li>
        <li data-reveal style="--delay:140ms">
          <a href="#insights">
            <time datetime="2026-02-03">3 February 2026</time>
            <span class="news-tag">Results</span>
            <h3>Q4 and full-year 2025: revenue up 22%, consulting margin 31%</h3>
            <p>Managed services revenue grew 34% as four retained clients moved from project to run model. Headcount reached 412.</p>
          </a>
        </li>
        <li data-reveal style="--delay:210ms">
          <a href="#insights">
            <time datetime="2026-01-14">14 January 2026</time>
            <span class="news-tag">Expansion</span>
            <h3>Frankfurt sovereign cloud practice opens with 60 specialists</h3>
            <p>Built to serve regulated European clients requiring data residency and public-sector accreditation without leaving the region.</p>
          </a>
        </li>
      </ol>

      <ul class="quote-row" data-reveal>
        <li>
          <blockquote>
            <p>&ldquo;They shipped the first production slice in week eight, against a plan that said week nine. That is the whole relationship in one number.&rdquo;</p>
          </blockquote>
          <p class="quote-by"><strong>Tomás Beck</strong><span>Chief Operating Officer, Altira Logistics</span></p>
        </li>
        <li>
          <blockquote>
            <p>&ldquo;Our board pack went from four analysts and a week to two people and a morning. The post-project audit is what convinced finance to fund phase two.&rdquo;</p>
          </blockquote>
          <p class="quote-by"><strong>Hana Nakashima</strong><span>Group Finance Director, Holloway &amp; Co</span></p>
        </li>
        <li>
          <blockquote>
            <p>&ldquo;Two years in, they still publish the metrics that make them look bad. We have never had a supplier do that and we have had eleven.&rdquo;</p>
          </blockquote>
          <p class="quote-by"><strong>Ingrid Vasquez-Holt</strong><span>Group COO, Kestrel Bank</span></p>
        </li>
      </ul>
    </div>
  </section>

  <section class="events" id="events" aria-labelledby="events-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="eyebrow">Events</p>
        <h2 id="events-title" class="section-title">Where to meet us this year</h2>
        <p class="section-sub">We run small rooms. Sessions cap at 40 people and every agenda is published four weeks ahead.</p>
      </header>
      <ul class="event-grid">
        <li class="event-card" data-reveal style="--delay:0ms">
          <p class="event-date"><span class="event-day">22</span><span class="event-mon">Apr</span></p>
          <div>
            <h3>Enterprise Architecture Summit 2026</h3>
            <p class="event-meta"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg> Amsterdam, Netherlands &middot; 23&ndash;24 April</p>
            <p>Two days on estate decomposition patterns across nine regulated industries. Capacity 40.</p>
          </div>
          <a class="btn btn-outline btn-sm" href="#contact">Request an invite</a>
        </li>
        <li class="event-card" data-reveal style="--delay:80ms">
          <p class="event-date"><span class="event-day">09</span><span class="event-mon">May</span></p>
          <div>
            <h3>Meridian Fintech Forum</h3>
            <p class="event-meta"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg> Marina Bay Sands, Singapore &middot; 9 May</p>
            <p>Real-time rails, scheme certification and the 2026 regulatory calendar for APAC payment institutions.</p>
          </div>
          <a class="btn btn-outline btn-sm" href="#contact">Request an invite</a>
        </li>
        <li class="event-card" data-reveal style="--delay:160ms">
          <p class="event-date"><span class="event-day">18</span><span class="event-mon">Jun</span></p>
          <div>
            <h3>Cloud Cost Clinic with Kestrel Bank</h3>
            <p class="event-meta"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg> Virtual &middot; 18 June, 14:00 CET</p>
            <p>A live ninety-minute teardown of Kestrel's cloud bill, run by the engineers who reduced it by 34%.</p>
          </div>
          <a class="btn btn-outline btn-sm" href="#contact">Register free</a>
        </li>
      </ul>
    </div>
  </section>

  <section class="contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap contact-grid">
      <div class="contact-copy" data-reveal>
        <p class="eyebrow">Get in touch</p>
        <h2 id="contact-title" class="section-title">Tell us what is broken. We will tell you what it costs to fix.</h2>
        <p>Every enquiry is read by a partner, not a bot. You will get a named contact and a written point of view within two working days.</p>
        <ul class="contact-list">
          <li>
            <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg></span>
            <span><strong>Call the partner desk</strong><a href="tel:+31208041190">+31 20 804 1190</a><span class="muted">Mon&ndash;Fri, 08:00&ndash;18:00 CET</span></span>
          </li>
          <li>
            <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="true"><path d="M4 5h16v14H4zM4 7l8 6 8-6"/></svg></span>
            <span><strong>New business</strong><a href="mailto:engage@meridiangroup.example">engage@meridiangroup.example</a><span class="muted">Response within one working day</span></span>
          </li>
          <li>
            <span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
            <span><strong>Amsterdam office</strong><span class="muted">Wibautstraat 131-D, 1091 GL Amsterdam</span></span>
          </li>
        </ul>
      </div>

      <form class="contact-form" id="contact-form" novalidate data-reveal>
        <h3 class="form-title">Project enquiry</h3>
        <div class="field">
          <label for="cf-name">Full name <span class="req" aria-hidden="true">*</span></label>
          <input type="text" id="cf-name" name="name" autocomplete="name" required aria-describedby="err-name" />
          <p class="error" id="err-name" role="alert"></p>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="cf-email">Work email <span class="req" aria-hidden="true">*</span></label>
            <input type="email" id="cf-email" name="email" autocomplete="email" required aria-describedby="err-email" />
            <p class="error" id="err-email" role="alert"></p>
          </div>
          <div class="field">
            <label for="cf-company">Organisation <span class="req" aria-hidden="true">*</span></label>
            <input type="text" id="cf-company" name="company" autocomplete="organization" required aria-describedby="err-company" />
            <p class="error" id="err-company" role="alert"></p>
          </div>
        </div>
        <div class="field">
          <label for="cf-interest">Primary interest</label>
          <select id="cf-interest" name="interest">
            <option value="">Select a practice</option>
            <option>Digital Transformation</option>
            <option>Cloud &amp; Platform Engineering</option>
            <option>Data &amp; Applied AI</option>
            <option>Cyber Resilience</option>
            <option>Payments Systems</option>
            <option>Managed Services</option>
            <option>Not sure yet</option>
          </select>
        </div>
        <div class="field">
          <label for="cf-budget">Indicative programme budget</label>
          <select id="cf-budget" name="budget">
            <option value="">Prefer not to say</option>
            <option>Under $250,000</option>
            <option>$250,000 &ndash; $1M</option>
            <option>$1M &ndash; $5M</option>
            <option>Above $5M</option>
          </select>
        </div>
        <div class="field">
          <label for="cf-message">What is the problem? <span class="req" aria-hidden="true">*</span></label>
          <textarea id="cf-message" name="message" rows="4" required minlength="20" aria-describedby="err-message msg-count"></textarea>
          <p class="hint"><span id="msg-count">0</span> / 600 characters &middot; minimum 20</p>
          <p class="error" id="err-message" role="alert"></p>
        </div>
        <div class="field field-check">
          <input type="checkbox" id="cf-consent" name="consent" required aria-describedby="err-consent" />
          <label for="cf-consent">I agree that Meridian Group may store this enquiry to respond to it. <span class="req" aria-hidden="true">*</span></label>
        </div>
        <p class="error" id="err-consent" role="alert"></p>

        <button type="submit" class="btn btn-primary btn-block" id="cf-submit">
          <span class="btn-label">Send enquiry</span>
          <span class="spinner" aria-hidden="true"></span>
        </button>
        <p class="form-status" id="cf-status" role="status" aria-live="polite"></p>

        <div class="form-success" id="cf-success" hidden>
          <span class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span>
          <h4>Enquiry received</h4>
          <p id="cf-success-text">Thank you. A partner will respond within two working days.</p>
          <button type="button" class="btn btn-outline btn-sm" id="cf-reset">Send another enquiry</button>
        </div>
      </form>
    </div>
  </section>
</main>

<footer class="site-footer" id="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#top" aria-label="Meridian Group, return to top">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false">
            <path d="M16 2 4 8v9c0 7 5 11.5 12 13 7-1.5 12-6 12-13V8L16 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <path d="M11 22V10m10 12V10M11 16h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-text">Meridian<em>Group</em></span>
      </a>
      <p class="footer-blurb">Independent enterprise technology advisory and delivery. Partner-led since 2008.</p>
      <ul class="socials">
        <li><a href="#footer" aria-label="Meridian Group on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/></svg></a></li>
        <li><a href="#footer" aria-label="Meridian Group on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
        <li><a href="#footer" aria-label="Meridian Group on YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="f-services">
      <h2 id="f-services">Services</h2>
      <ul>
        <li><a href="#capabilities">Digital Transformation</a></li>
        <li><a href="#capabilities">Cloud &amp; Platform</a></li>
        <li><a href="#capabilities">Data &amp; Applied AI</a></li>
        <li><a href="#capabilities">Cyber Resilience</a></li>
        <li><a href="#capabilities">Payments Systems</a></li>
        <li><a href="#capabilities">Managed Services</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="f-company">
      <h2 id="f-company">Company</h2>
      <ul>
        <li><a href="#about">About Meridian</a></li>
        <li><a href="#leadership">Leadership</a></li>
        <li><a href="#approach">How we work</a></li>
        <li><a href="#footer">Careers</a></li>
        <li><a href="#insights">Newsroom</a></li>
        <li><a href="#events">Events</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="f-sectors">
      <h2 id="f-sectors">Sectors</h2>
      <ul>
        <li><a href="#results">Financial Services</a></li>
        <li><a href="#results">Transport &amp; Logistics</a></li>
        <li><a href="#results">Healthcare</a></li>
        <li><a href="#results">Energy &amp; Utilities</a></li>
        <li><a href="#results">Public Sector</a></li>
      </ul>
    </nav>
    <div class="footer-col footer-news">
      <h2 id="f-news">Field notes</h2>
      <p>One delivery lesson, every second Tuesday. No product news.</p>
      <form id="news-form" novalidate>
        <label class="sr-only" for="news-email">Work email for the newsletter</label>
        <div class="news-row">
          <input type="email" id="news-email" name="email" placeholder="you@company.com" aria-describedby="news-status" required />
          <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscribe to Field notes">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
        <p class="news-status" id="news-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>

  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Meridian Group B.V. &middot; Wibautstraat 131-D, Amsterdam &middot; CoC 34218577</p>
    <ul class="legal">
      <li><a href="#footer">Privacy notice</a></li>
      <li><a href="#footer">Cookie policy</a></li>
      <li><a href="#footer">Terms of engagement</a></li>
      <li><a href="#footer">Accessibility</a></li>
      <li><a href="#footer">Modern slavery statement</a></li>
    </ul>
  </div>
</footer>

<button type="button" class="to-top" id="to-top" aria-label="Back to top" hidden>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
</button>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Fraunces', 'Iowan Old Style', Georgia, serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --navy-900: #060d1a;
  --navy-800: #0b1b33;
  --navy-700: #12294a;
  --navy-600: #1b3a63;

  --ink: #0b1b33;
  --body: #3d4c63;
  --muted: #64748b;
  --line: #dfe4ec;
  --line-soft: #eaeef4;

  --bg: #ffffff;
  --bg-alt: #f5f7fa;
  --bg-deep: #060d1a;
  --surface: #ffffff;
  --surface-alt: #f5f7fa;
  --on-deep: #eef2f8;
  --on-deep-muted: #9fb0c8;

  --accent: #c8a45c;
  --accent-strong: #a8842f;
  --accent-ink: #7a5c14;
  --accent-soft: rgba(200, 164, 92, 0.14);
  --accent-ring: rgba(200, 164, 92, 0.55);

  --ok: #14663f;
  --ok-soft: rgba(20, 102, 63, 0.1);
  --danger: #a02334;
  --danger-soft: rgba(160, 35, 52, 0.09);

  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 48px;
  --s-8: 64px;
  --s-9: 96px;
  --pad-section: clamp(56px, 7vw, 104px);

  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 16px;
  --r-xl: 24px;
  --r-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(11, 27, 51, 0.06);
  --shadow-sm: 0 2px 8px rgba(11, 27, 51, 0.07), 0 1px 2px rgba(11, 27, 51, 0.05);
  --shadow-md: 0 10px 26px rgba(11, 27, 51, 0.10), 0 3px 8px rgba(11, 27, 51, 0.05);
  --shadow-lg: 0 24px 60px rgba(6, 13, 26, 0.16), 0 8px 20px rgba(6, 13, 26, 0.07);
  --shadow-accent: 0 14px 34px rgba(168, 132, 47, 0.22);

  --wrap: 1240px;
  --ease: cubic-bezier(0.22, 0.72, 0.24, 1);
  --dur: 0.28s;
  --header-h: 76px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #eaf0f8;
    --body: #b9c6d8;
    --muted: #93a3b9;
    --line: rgba(159, 176, 200, 0.22);
    --line-soft: rgba(159, 176, 200, 0.13);
    --bg: #081120;
    --bg-alt: #0d1a2e;
    --bg-deep: #050b16;
    --surface: #0d1a2e;
    --surface-alt: #112340;
    --on-deep: #e7eefa;
    --on-deep-muted: #9db0ca;
    --accent-ink: #e2c37e;
    --accent-strong: #d9b767;
    --ok: #6ed3a3;
    --ok-soft: rgba(110, 211, 163, 0.12);
    --danger: #f19aa5;
    --danger-soft: rgba(241, 154, 165, 0.12);
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.45);
    --shadow-md: 0 12px 30px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 28px 64px rgba(0, 0, 0, 0.6);
  }
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.65;
  color: var(--body);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3, h4 { font-family: var(--font-display); color: var(--ink); line-height: 1.14; margin: 0; font-weight: 600; letter-spacing: -0.015em; }
h1 { font-size: clamp(2.4rem, 5.4vw, 4.15rem); }
h2 { font-size: clamp(1.9rem, 3.4vw, 2.85rem); }
h3 { font-size: clamp(1.12rem, 1.5vw, 1.35rem); }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
img, svg { display: block; max-width: 100%; }
a { color: var(--accent-ink); text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
strong { color: var(--ink); font-weight: 600; }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(18px, 4vw, 40px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.muted { color: var(--muted); }

:focus-visible { outline: 2px solid var(--accent-strong); outline-offset: 3px; border-radius: var(--r-sm); }
.on-dark :focus-visible { outline-color: var(--accent); }

.skip-link {
  position: absolute; left: 50%; top: 0; transform: translate(-50%, -140%);
  z-index: 300; padding: 12px 22px; border-radius: 0 0 var(--r-md) var(--r-md);
  background: var(--navy-800); color: #fff; font-weight: 600; font-size: 0.9rem;
  transition: transform var(--dur) var(--ease);
}
.skip-link:focus { transform: translate(-50%, 0); }

/* ---------- buttons ---------- */
.btn {
  --btn-bg: var(--accent);
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  padding: 13px 24px; border: 1px solid transparent; border-radius: var(--r-pill);
  background: var(--btn-bg); color: var(--navy-900);
  font-size: 0.94rem; font-weight: 600; letter-spacing: 0.005em;
  cursor: pointer; position: relative; overflow: hidden; isolation: isolate;
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.btn::after {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(105deg, transparent 32%, rgba(255, 255, 255, 0.55) 50%, transparent 68%);
  transform: translateX(-130%); transition: transform 0.62s var(--ease);
}
.btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-accent); }
.btn:hover::after { transform: translateX(130%); }
.btn:active { transform: translateY(0); }
.btn .icon { width: 18px; height: 18px; transition: transform var(--dur) var(--ease); }
.btn:hover .icon { transform: translateX(3px); }

.btn-primary { background: var(--accent); color: var(--navy-900); }
.btn-primary:hover { background: var(--accent-strong); }
.btn-outline { background: transparent; border-color: var(--line); color: var(--ink); }
.btn-outline:hover { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); box-shadow: var(--shadow-sm); }
.btn-ghost { background: var(--surface-alt); color: var(--ink); border-color: var(--line-soft); }
.btn-sm { padding: 9px 17px; font-size: 0.85rem; }
.btn-block { width: 100%; }

.icon-btn {
  display: inline-grid; place-items: center; width: 42px; height: 42px;
  border: 1px solid var(--line); border-radius: var(--r-md);
  background: var(--surface); color: var(--ink); cursor: pointer;
  transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.icon-btn svg { width: 22px; height: 22px; }
.icon-btn:hover { border-color: var(--accent); background: var(--accent-soft); }
.icon-btn:active { transform: scale(0.94); }

.link-underline {
  display: inline-flex; align-items: center; gap: var(--s-2);
  font-weight: 600; font-size: 0.93rem; color: var(--ink);
  padding-bottom: 3px; background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 0% 2px; background-position: 0 100%; background-repeat: no-repeat;
  transition: background-size var(--dur) var(--ease), color var(--dur) var(--ease);
}
.link-underline:hover { background-size: 100% 2px; color: var(--accent-ink); }
.link-underline .icon { width: 17px; height: 17px; }
.link-underline:hover .icon { transform: translateX(4px); }
.link-underline.small { font-size: 0.85rem; }

.eyebrow {
  display: inline-flex; align-items: center; gap: var(--s-2);
  font-size: 0.74rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--accent-ink); margin-bottom: var(--s-3);
}
.eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }

.section-title { margin-bottom: var(--s-4); max-width: 22ch; }
.section-sub { color: var(--muted); max-width: 60ch; font-size: 1.02rem; }
.section-head { margin-bottom: clamp(30px, 4vw, 54px); max-width: 720px; }

[data-reveal] {
  opacity: 0; transform: translateY(26px);
  transition: opacity 0.72s var(--ease) var(--delay, 0ms), transform 0.72s var(--ease) var(--delay, 0ms);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- header ---------- */
.site-header {
  position: sticky; top: 0; z-index: 120;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: saturate(150%) blur(14px);
  -webkit-backdrop-filter: saturate(150%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.site-header.is-scrolled { border-bottom-color: var(--line); box-shadow: var(--shadow-sm); }

.progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: transparent; }
.progress span { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-strong)); transition: width 0.12s linear; }

.header-inner { display: flex; align-items: center; gap: var(--s-5); min-height: var(--header-h); }

.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); flex: none; }
.brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: var(--navy-800); color: var(--accent); transition: transform 0.5s var(--ease); }
.brand:hover .brand-mark { transform: rotate(-8deg) scale(1.05); }
.brand-mark svg { width: 24px; height: 24px; }
.brand-text { font-family: var(--font-display); font-size: 1.24rem; font-weight: 700; letter-spacing: -0.02em; }
.brand-text em { font-style: normal; color: var(--accent-ink); }

.primary-nav { margin-left: auto; display: flex; align-items: center; }
.nav-list { display: flex; align-items: center; gap: 2px; }
.nav-item { position: relative; }
.nav-link {
  display: inline-flex; align-items: center; gap: 5px; padding: 10px 14px;
  border: 0; background: transparent; border-radius: var(--r-md);
  font-size: 0.93rem; font-weight: 500; color: var(--body); cursor: pointer;
  position: relative; transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.nav-link::after {
  content: ""; position: absolute; left: 14px; right: 14px; bottom: 4px; height: 2px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform var(--dur) var(--ease);
}
.nav-link:hover { color: var(--ink); background: var(--accent-soft); }
.nav-link:hover::after { transform: scaleX(1); }
.nav-link.is-active { color: var(--ink); font-weight: 600; }
.nav-link.is-active::after { transform: scaleX(1); }
.nav-link .caret { width: 14px; height: 14px; transition: transform var(--dur) var(--ease); }
.nav-trigger[aria-expanded="true"] .caret { transform: rotate(180deg); }

.dropdown {
  position: absolute; top: calc(100% + 10px); left: 0; min-width: 268px;
  padding: var(--s-4); border: 1px solid var(--line); border-radius: var(--r-lg);
  background: var(--surface); box-shadow: var(--shadow-lg);
  animation: dropIn 0.22s var(--ease) both;
}
.dropdown[hidden] { display: none; }
.dropdown::before { content: ""; position: absolute; top: -6px; left: 30px; width: 11px; height: 11px; background: var(--surface); border-left: 1px solid var(--line); border-top: 1px solid var(--line); transform: rotate(45deg); }
.dropdown-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: var(--s-3); }
.dropdown ul { display: grid; gap: 2px; }
.dropdown a { display: block; padding: 8px 10px; border-radius: var(--r-sm); font-size: 0.89rem; color: var(--body); transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), padding-left var(--dur) var(--ease); }
.dropdown a:hover { background: var(--accent-soft); color: var(--ink); padding-left: 15px; }

.nav-mobile-extra { display: none; }
.header-actions { display: flex; align-items: center; gap: var(--s-3); flex: none; }
.nav-toggle { display: none; }

/* ---------- hero ---------- */
.hero { position: relative; background: var(--navy-900); color: var(--on-deep); overflow: hidden; padding-block: clamp(56px, 7vw, 100px); }
.hero-grid-lines {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: linear-gradient(rgba(159, 176, 200, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(159, 176, 200, 0.09) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(ellipse 90% 70% at 70% 20%, #000 20%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 90% 70% at 70% 20%, #000 20%, transparent 78%);
  animation: gridDrift 26s linear infinite;
}
.hero::after {
  content: ""; position: absolute; width: 620px; height: 620px; right: -180px; top: -220px; pointer-events: none;
  background: radial-gradient(circle, rgba(200, 164, 92, 0.2), transparent 62%);
  animation: glowPulse 11s ease-in-out infinite;
}
.hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.85fr); gap: clamp(28px, 4vw, 60px); align-items: start; }
.hero .eyebrow { color: var(--accent); }
.hero .eyebrow .dot { background: var(--accent); box-shadow: 0 0 0 4px rgba(200, 164, 92, 0.2); }
.hero-title { color: #fff; margin-bottom: var(--s-5); }
.hero-title .line { display: block; }
.hero-title .word { display: inline-block; opacity: 0; transform: translateY(0.5em) rotateX(40deg); animation: wordUp 0.78s var(--ease) forwards; }
.word-accent { color: var(--accent); font-style: italic; }
.lede { color: var(--on-deep-muted); font-size: clamp(1rem, 1.35vw, 1.14rem); max-width: 56ch; margin-bottom: var(--s-6); }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--s-3); margin-bottom: var(--s-7); }
.hero .btn-outline { color: #fff; border-color: rgba(255, 255, 255, 0.3); }
.hero .btn-outline:hover { background: rgba(255, 255, 255, 0.08); border-color: var(--accent); color: #fff; }

.hero-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s-4); margin: 0; padding-top: var(--s-5); border-top: 1px solid rgba(159, 176, 200, 0.2); }
.hero-stats dt { font-size: 0.74rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--on-deep-muted); margin-bottom: 6px; }
.hero-stats dd { margin: 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 2.1rem); font-weight: 700; color: var(--accent); letter-spacing: -0.02em; }

.hero-panel {
  padding: var(--s-5); border: 1px solid rgba(159, 176, 200, 0.2); border-radius: var(--r-lg);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(6px); box-shadow: var(--shadow-lg);
  animation: floatY 9s ease-in-out infinite;
}
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding-bottom: var(--s-3); border-bottom: 1px solid rgba(159, 176, 200, 0.18); }
.panel-head h2 { font-size: 1.05rem; color: #fff; }
.panel-tag { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--navy-900); background: var(--accent); padding: 3px 9px; border-radius: var(--r-pill); }
.panel-list { display: grid; gap: 2px; margin: var(--s-4) 0; }
.panel-list li { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-3); padding: 10px 0; border-bottom: 1px dashed rgba(159, 176, 200, 0.16); }
.panel-list li:last-child { border-bottom: 0; }
.panel-k { font-size: 0.86rem; color: var(--on-deep-muted); }
.panel-v { font-family: var(--font-display); font-size: 1.16rem; font-weight: 700; color: #fff; }
.panel-ok { color: var(--accent); }
.panel-bar { height: 4px; border-radius: var(--r-pill); background: rgba(159, 176, 200, 0.2); overflow: hidden; }
.panel-bar span { display: block; height: 100%; width: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), #f0d9a8); transform-origin: left; animation: barGrow 1.6s 0.35s var(--ease) both; }
.panel-note { margin-top: var(--s-3); font-size: 0.76rem; color: var(--on-deep-muted); }

/* ---------- marquee ---------- */
.marquee-band { background: var(--bg-alt); border-block: 1px solid var(--line-soft); padding-block: var(--s-6); }
.marquee-title { text-align: center; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: var(--s-5); }
.marquee { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.marquee-track { display: flex; width: max-content; animation: marquee 34s linear infinite; }
.marquee:hover .marquee-track { animation-duration: 70s; }
.logo-row { display: flex; align-items: center; gap: clamp(28px, 4vw, 64px); padding-right: clamp(28px, 4vw, 64px); }
.logo-row li { font-family: var(--font-display); font-size: clamp(0.98rem, 1.6vw, 1.28rem); font-weight: 700; letter-spacing: 0.06em; color: var(--muted); white-space: nowrap; transition: color var(--dur) var(--ease); }
.logo-row li:hover { color: var(--accent-ink); }

/* ---------- about ---------- */
.about { padding-block: var(--pad-section); }
.about-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: clamp(32px, 5vw, 76px); align-items: start; }
.about-copy > p + p { margin-top: var(--s-4); }
.about-points { display: grid; gap: var(--s-3); margin-block: var(--s-5); }
.about-points li { display: flex; align-items: flex-start; gap: var(--s-3); font-size: 0.95rem; }
.tick { display: grid; place-items: center; width: 22px; height: 22px; flex: none; border-radius: 50%; background: var(--accent-soft); color: var(--accent-ink); margin-top: 2px; }
.tick svg { width: 13px; height: 13px; }

.about-figures { display: grid; gap: var(--s-4); }
.figure-card { padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-xs); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.figure-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.figure-card-accent { background: var(--navy-800); border-color: transparent; }
.figure-value { display: block; font-family: var(--font-display); font-size: clamp(2.2rem, 4vw, 3.1rem); font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -0.03em; }
.figure-card-accent .figure-value { color: var(--accent); }
.figure-label { display: block; margin-top: var(--s-2); font-size: 0.86rem; color: var(--muted); }
.figure-card-accent .figure-label { color: var(--on-deep-muted); }
.figure-quote { margin: 0; padding: var(--s-5); border-left: 3px solid var(--accent); border-radius: 0 var(--r-md) var(--r-md) 0; background: var(--surface-alt); }
.figure-quote p { font-family: var(--font-display); font-size: 1.06rem; color: var(--ink); line-height: 1.5; }
.figure-quote figcaption { margin-top: var(--s-3); font-size: 0.82rem; color: var(--muted); }

/* ---------- services ---------- */
.services { padding-block: var(--pad-section); background: var(--bg-alt); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--s-4); }
.card {
  padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg);
  background: var(--surface); box-shadow: var(--shadow-xs); position: relative; overflow: hidden;
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.card::before { content: ""; position: absolute; inset: auto 0 0 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--accent-strong)); transform: scaleX(0); transform-origin: left; transition: transform 0.4s var(--ease); }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.card:hover::before { transform: scaleX(1); }
.card-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: var(--r-md); background: var(--accent-soft); color: var(--accent-ink); margin-bottom: var(--s-4); transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.card-icon svg { width: 23px; height: 23px; }
.card:hover .card-icon { background: var(--accent); color: var(--navy-900); transform: translateY(-2px) rotate(-4deg); }
.card h3 { margin-bottom: var(--s-2); }
.card p { font-size: 0.93rem; }
.card-meta { margin-top: var(--s-4); padding-top: var(--s-3); border-top: 1px solid var(--line-soft); display: grid; gap: 5px; }
.card-meta li { position: relative; padding-left: 16px; font-size: 0.8rem; font-weight: 600; color: var(--muted); }
.card-meta li::before { content: ""; position: absolute; left: 0; top: 8px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

/* ---------- approach ---------- */
.approach { padding-block: var(--pad-section); }
.differentiators { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: var(--s-4); counter-reset: diff; }
.differentiators li { position: relative; padding: var(--s-5); padding-top: var(--s-6); border-top: 2px solid var(--line); transition: border-color var(--dur) var(--ease); }
.differentiators li:hover { border-top-color: var(--accent); }
.diff-num { position: absolute; top: var(--s-4); right: var(--s-5); font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--accent-soft); transition: color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.differentiators li:hover .diff-num { color: var(--accent); transform: translateY(-3px); }
.differentiators h3 { margin-bottom: var(--s-2); }
.differentiators p { font-size: 0.92rem; }

.process { margin-top: clamp(36px, 5vw, 64px); padding: clamp(24px, 3.4vw, 44px); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface-alt); }
.process-title { margin-bottom: var(--s-5); font-size: clamp(1.2rem, 1.9vw, 1.55rem); }
.process-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: var(--s-4); }
.process-steps li { position: relative; padding-left: var(--s-4); border-left: 2px solid var(--line); }
.process-steps li:hover { border-left-color: var(--accent); }
.step-badge { display: inline-block; margin-bottom: var(--s-2); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-ink); }
.process-steps strong { display: block; font-family: var(--font-display); font-size: 1.08rem; margin-bottom: 5px; }
.process-steps p { font-size: 0.88rem; }

/* ---------- results ---------- */
.results { padding-block: var(--pad-section); background: var(--navy-900); color: var(--on-deep); }
.results .section-title { color: #fff; }
.results .eyebrow { color: var(--accent); }
.result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: var(--s-4); }
.result-card { padding: var(--s-5); border: 1px solid rgba(159, 176, 200, 0.2); border-radius: var(--r-lg); background: rgba(255, 255, 255, 0.035); transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.result-card:hover { transform: translateY(-6px); border-color: var(--accent); background: rgba(255, 255, 255, 0.06); }
.result-client { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: var(--s-3); }
.result-card h3 { color: #fff; font-size: 1.2rem; margin-bottom: var(--s-3); }
.result-card > p { font-size: 0.9rem; color: var(--on-deep-muted); }
.result-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); margin: var(--s-5) 0 0; padding-top: var(--s-4); border-top: 1px solid rgba(159, 176, 200, 0.18); }
.result-metrics dt { font-size: 0.74rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--on-deep-muted); }
.result-metrics dd { margin: 4px 0 0; font-family: var(--font-display); font-size: clamp(1.4rem, 2.4vw, 1.9rem); font-weight: 700; color: var(--accent); letter-spacing: -0.02em; }
.quote-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: var(--s-4); margin-top: var(--s-6); }
.quote-row > li { display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-5); border: 1px solid rgba(159, 176, 200, 0.2); border-radius: var(--r-lg); background: rgba(255, 255, 255, 0.03); transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.quote-row > li:hover { border-color: var(--accent); transform: translateY(-4px); }
.quote-row blockquote p { font-family: var(--font-display); font-size: 1rem; line-height: 1.5; color: #fff; }
.quote-by { margin-top: auto; font-size: 0.85rem; }
.quote-by strong { display: block; color: var(--accent); }
.quote-by span { display: block; font-size: 0.79rem; color: var(--on-deep-muted); }

/* ---------- leadership ---------- */
.leadership { padding-block: var(--pad-section); }
.team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--s-4); }
.team-card { padding: var(--s-5) var(--s-4); text-align: center; border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.team-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.avatar { width: 108px; height: 108px; margin: 0 auto var(--s-4); border-radius: 50%; border: 2px solid var(--accent); transition: transform 0.6s var(--ease); }
.team-card:hover .avatar { transform: scale(1.05) rotate(-2deg); }
.team-card h3 { font-size: 1.1rem; }
.team-role { margin-top: 4px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent-ink); }
.team-bio { margin-block: var(--s-3); font-size: 0.87rem; }
.team-card .link-underline { justify-content: center; }

/* ---------- insights ---------- */
.insights { padding-block: var(--pad-section); background: var(--bg-alt); border-block: 1px solid var(--line-soft); }
.insights-grid { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(30px, 4.5vw, 68px); align-items: start; }
.insights-head { position: sticky; top: calc(var(--header-h) + 24px); }
.insights-head .section-sub { margin-bottom: var(--s-5); }
.news-list { display: grid; gap: var(--s-2); }
.news-list a { display: block; padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); color: var(--body); transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.news-list a:hover { transform: translateX(6px); border-color: var(--accent); box-shadow: var(--shadow-sm); }
.news-list a > time { font-size: 0.76rem; font-weight: 600; color: var(--muted); letter-spacing: 0.05em; }
.news-tag { display: inline-block; margin-left: var(--s-2); padding: 2px 9px; border-radius: var(--r-pill); background: var(--accent-soft); color: var(--accent-ink); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; vertical-align: 2px; }
.news-list h3 { margin-block: var(--s-2) 6px; font-size: 1.08rem; }
.news-list p { font-size: 0.89rem; }

/* ---------- events ---------- */
.events { padding-block: var(--pad-section); }
.event-grid { display: grid; gap: var(--s-3); }
.event-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--s-5); align-items: center; padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.event-card:hover { border-color: var(--accent); box-shadow: var(--shadow-md); transform: translateY(-3px); }
.event-date { display: grid; place-items: center; width: 74px; padding: 10px 0; border-radius: var(--r-md); background: var(--navy-800); color: #fff; }
.event-day { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; line-height: 1; }
.event-mon { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
.event-card h3 { margin-bottom: 5px; }
.event-meta { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--accent-ink); margin-bottom: 6px; }
.event-meta .icon { width: 15px; height: 15px; }
.event-card div > p:last-child { font-size: 0.89rem; }

/* ---------- contact ---------- */
.contact { padding-block: var(--pad-section); background: var(--bg-alt); border-top: 1px solid var(--line-soft); }
.contact-grid { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: clamp(32px, 5vw, 70px); align-items: start; }
.contact-copy > p { max-width: 52ch; }
.contact-list { display: grid; gap: var(--s-4); margin-top: var(--s-6); }
.contact-list li { display: flex; gap: var(--s-3); }
.contact-icon { display: grid; place-items: center; width: 42px; height: 42px; flex: none; border-radius: var(--r-md); background: var(--navy-800); color: var(--accent); }
.contact-icon svg { width: 20px; height: 20px; }
.contact-list strong { display: block; font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); margin-bottom: 3px; }
.contact-list a { font-weight: 600; }
.contact-list a:hover { text-decoration: underline; }
.contact-list span span { display: block; font-size: 0.85rem; }

.contact-form { position: relative; padding: clamp(22px, 3vw, 38px); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--shadow-md); }
.form-title { margin-bottom: var(--s-5); font-size: 1.35rem; }
.field { margin-bottom: var(--s-4); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); }
.field label { display: block; margin-bottom: 6px; font-size: 0.82rem; font-weight: 600; color: var(--ink); }
.req { color: var(--danger); }
.field input[type="text"], .field input[type="email"], .field select, .field textarea, .news-row input {
  width: 100%; padding: 11px 13px; border: 1px solid var(--line); border-radius: var(--r-md);
  background: var(--bg); font-size: 0.94rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.field textarea { resize: vertical; min-height: 110px; }
.field input:hover, .field select:hover, .field textarea:hover, .news-row input:hover { border-color: var(--muted); }
.field input:focus, .field select:focus, .field textarea:focus, .news-row input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
.field [aria-invalid="true"] { border-color: var(--danger); background: var(--danger-soft); }
.hint { margin-top: 5px; font-size: 0.77rem; color: var(--muted); }
.error { min-height: 0; margin-top: 5px; font-size: 0.79rem; font-weight: 600; color: var(--danger); }
.error:empty { display: none; }
.field-check { display: flex; align-items: flex-start; gap: var(--s-3); }
.field-check input { width: 18px; height: 18px; margin-top: 3px; accent-color: var(--accent); flex: none; }
.field-check label { margin: 0; font-weight: 400; font-size: 0.86rem; }
.form-status { margin-top: var(--s-3); font-size: 0.85rem; font-weight: 600; min-height: 1.2em; }
.form-status.is-ok { color: var(--ok); }
.form-status.is-bad { color: var(--danger); }
.spinner { display: none; width: 15px; height: 15px; border: 2px solid rgba(6, 13, 26, 0.3); border-top-color: var(--navy-900); border-radius: 50%; animation: spin 0.7s linear infinite; }
.is-loading .btn-label { opacity: 0.55; }
.is-loading .spinner { display: block; }
.form-success { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: var(--s-3); padding: var(--s-6); text-align: center; border-radius: var(--r-xl); background: var(--surface); animation: fadeUp 0.45s var(--ease) both; }
.form-success[hidden] { display: none; }
.success-icon { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: var(--ok-soft); color: var(--ok); animation: popIn 0.5s var(--ease) both; }
.success-icon svg { width: 27px; height: 27px; }
.form-success h4 { font-size: 1.4rem; }
.form-success p { max-width: 40ch; font-size: 0.92rem; }

/* ---------- footer ---------- */
.site-footer { background: var(--navy-900); color: var(--on-deep-muted); padding-top: var(--pad-section); }
.footer-top { display: grid; grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 0.85fr)) minmax(0, 1.25fr); gap: clamp(24px, 3vw, 44px); padding-bottom: var(--s-8); }
.site-footer .brand { color: #fff; }
.site-footer .brand-text em { color: var(--accent); }
.site-footer .brand-mark { background: rgba(255, 255, 255, 0.07); }
.footer-blurb { margin-block: var(--s-4); max-width: 34ch; font-size: 0.89rem; }
.socials { display: flex; gap: var(--s-2); }
.socials a { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid rgba(159, 176, 200, 0.24); border-radius: var(--r-md); color: var(--on-deep-muted); transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.socials svg { width: 18px; height: 18px; }
.socials a:hover { color: var(--navy-900); background: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.footer-col h2 { font-family: var(--font-text); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; margin-bottom: var(--s-4); }
.footer-col ul { display: grid; gap: 9px; }
.footer-col a { font-size: 0.89rem; transition: color var(--dur) var(--ease), padding-left var(--dur) var(--ease); }
.footer-col a:hover { color: var(--accent); padding-left: 5px; }
.footer-news p { font-size: 0.87rem; margin-bottom: var(--s-3); }
.news-row { display: flex; gap: var(--s-2); }
.news-row input { background: rgba(255, 255, 255, 0.05); border-color: rgba(159, 176, 200, 0.28); color: var(--on-deep); }
.news-row input::placeholder { color: rgba(159, 176, 200, 0.6); }
.news-row input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200, 164, 92, 0.3); }
.news-row .btn { flex: none; padding-inline: 15px; }
.news-status { margin-top: 8px; font-size: 0.8rem; font-weight: 600; min-height: 1.2em; }
.news-status.is-ok { color: var(--accent); }
.news-status.is-bad { color: #f19aa5; }
.footer-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-4); padding-block: var(--s-5); border-top: 1px solid rgba(159, 176, 200, 0.16); font-size: 0.82rem; }
.legal { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.legal a:hover { color: var(--accent); }

/* ---------- back to top ---------- */
.to-top { position: fixed; right: clamp(14px, 3vw, 30px); bottom: clamp(14px, 3vw, 30px); z-index: 110; display: grid; place-items: center; width: 46px; height: 46px; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--ink); box-shadow: var(--shadow-md); cursor: pointer; transition: transform var(--dur) var(--ease), background-color var(--dur) var(--ease), color var(--dur) var(--ease), opacity var(--dur) var(--ease); animation: popIn 0.32s var(--ease) both; }
.to-top[hidden] { display: none; }
.to-top svg { width: 20px; height: 20px; }
.to-top:hover { background: var(--navy-800); color: var(--accent); transform: translateY(-3px); }

/* ---------- responsive ---------- */
@media (max-width: 1080px) {
  .footer-top { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 960px) {
  :root { --header-h: 66px; }
  .desktop-cta { display: none; }
  .nav-toggle { display: inline-grid; }
  .primary-nav {
    position: fixed; inset: var(--header-h) 0 auto; z-index: 119;
    display: block; max-height: 0; overflow: hidden;
    padding-inline: clamp(18px, 4vw, 40px);
    background: var(--bg); border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow-md);
    transition: max-height 0.34s var(--ease), padding-block 0.34s var(--ease);
  }
  .primary-nav.is-open { max-height: min(78vh, 620px); overflow-y: auto; padding-block: var(--s-4) var(--s-5); }
  .nav-list { flex-direction: column; align-items: stretch; gap: 2px; }
  .nav-link { width: 100%; justify-content: space-between; padding: 13px 12px; font-size: 1rem; }
  .nav-link::after { left: 12px; right: 12px; }
  .dropdown { position: static; min-width: 0; box-shadow: none; border: 0; border-left: 2px solid var(--accent); border-radius: 0; margin: 2px 0 var(--s-2) var(--s-3); padding: 0 0 0 var(--s-3); animation: none; }
  .dropdown::before { display: none; }
  .dropdown[hidden] { display: none; }
  .nav-mobile-extra { display: grid; gap: var(--s-2); margin-top: var(--s-4); padding-top: var(--s-4); border-top: 1px solid var(--line-soft); }
  .hero-inner { grid-template-columns: 1fr; }
  .hero-panel { animation: none; }
  .about-grid, .insights-grid, .contact-grid { grid-template-columns: 1fr; }
  .insights-head { position: static; }
  .event-card { grid-template-columns: auto minmax(0, 1fr); }
  .event-card .btn { grid-column: 1 / -1; justify-self: start; }
}

@media (max-width: 640px) {
  .hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .field-row { grid-template-columns: 1fr; gap: 0; }
  .footer-top { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .result-metrics { grid-template-columns: 1fr; }
  .brand-text { font-size: 1.1rem; }
  .section-title { max-width: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  [data-reveal] { opacity: 1; transform: none; }
  .hero-title .word { opacity: 1; transform: none; }
  .marquee-track { animation: none; transform: none; }
  .hero-panel, .hero-grid-lines, .hero::after { animation: none; }
}

/* ---------- keyframes ---------- */
@keyframes wordUp { to { opacity: 1; transform: none; } }
@keyframes dropIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes gridDrift { from { background-position: 0 0, 0 0; } to { background-position: 68px 68px, 68px 68px; } }
@keyframes glowPulse { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.09); } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-11px); } }
@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
`,
  javascript: `
'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- reveal on scroll ---------------- */
  var revealTargets = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- header: scroll state + progress ---------------- */
  var header = $('#site-header');
  var progressBar = $('#progress-bar');
  var toTop = $('#to-top');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) { header.classList.toggle('is-scrolled', y > 8); }
    if (toTop) { toTop.hidden = y < 620; }
    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
  }

  var scrollTick = false;
  window.addEventListener('scroll', function () {
    if (scrollTick) { return; }
    scrollTick = true;
    window.requestAnimationFrame(function () { onScroll(); scrollTick = false; });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- mobile navigation ---------------- */
  var navToggle = $('#nav-toggle');
  var primaryNav = $('#primary-nav');

  function setNav(open) {
    if (!navToggle || !primaryNav) { return; }
    primaryNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (!open) { closeAllDropdowns(); }
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  /* ---------------- dropdowns ---------------- */
  var triggers = $$('.nav-trigger');

  function closeAllDropdowns(except) {
    triggers.forEach(function (btn) {
      if (btn === except) { return; }
      var panel = document.getElementById(btn.getAttribute('data-dropdown'));
      btn.setAttribute('aria-expanded', 'false');
      if (panel) { panel.hidden = true; }
    });
  }

  function toggleDropdown(btn) {
    var panel = document.getElementById(btn.getAttribute('data-dropdown'));
    if (!panel) { return; }
    var open = btn.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns(btn);
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.hidden = open;
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(btn);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.nav-item')) { closeAllDropdowns(); }
  });

  /* ---------------- escape closes overlays ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    closeAllDropdowns();
    setNav(false);
  });

  /* ---------------- smooth anchor links ---------------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) { return; }
      var target = document.getElementById(id.slice(1));
      if (!target) { return; }
      e.preventDefault();
      closeAllDropdowns();
      setNav(false);
      var offset = (header ? header.offsetHeight : 0) + 12;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) { history.replaceState(null, '', id); }
    });
  });

  /* ---------------- scroll spy ---------------- */
  var spyLinks = $$('[data-spy]');
  var spySections = spyLinks
    .map(function (link) { return document.getElementById(link.getAttribute('data-spy')); })
    .filter(Boolean);

  if (spySections.length && 'IntersectionObserver' in window) {
    var spyVisible = {};
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        spyVisible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var bestId = null;
      var bestRatio = 0;
      spySections.forEach(function (section) {
        var r = spyVisible[section.id] || 0;
        if (r > bestRatio) { bestRatio = r; bestId = section.id; }
      });
      spyLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('data-spy') === bestId);
      });
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
    spySections.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ---------------- hero headline reveal ---------------- */
  var words = $$('.hero-title .word');
  words.forEach(function (word, i) {
    word.style.animationDelay = (0.09 * i + 0.12).toFixed(2) + 's';
  });

  /* ---------------- animated counters ---------------- */
  function formatNumber(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    }
    return Math.round(value).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count') || '0');
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start = null;

    function frame(ts) {
      if (start === null) { start = ts; }
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(target * eased, decimals) + suffix;
      if (p < 1) { window.requestAnimationFrame(frame); }
      else { el.textContent = formatNumber(target, decimals) + suffix; }
    }
    window.requestAnimationFrame(frame);
  }

  var counters = $$('.counter');
  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      el.textContent = formatNumber(parseFloat(el.getAttribute('data-count') || '0'), dec) + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------------- marquee: duplicate for seamless loop ---------------- */
  $$('[data-marquee]').forEach(function (m) {
    var track = $('.marquee-track', m);
    var row = $('.logo-row', m);
    if (track && row) {
      row.style.animationDelay = '0s';
      track.setAttribute('data-doubled', 'true');
    }
  });

  /* ---------------- contact form ---------------- */
  var form = $('#contact-form');
  var statusEl = $('#cf-status');
  var successEl = $('#cf-success');
  var successText = $('#cf-success-text');
  var submitBtn = $('#cf-submit');
  var resetBtn = $('#cf-reset');
  var messageField = $('#cf-message');
  var msgCount = $('#msg-count');

  var RULES = {
    'cf-name': function (v) {
      if (!v) { return 'Please tell us your name.'; }
      if (v.length < 2) { return 'That looks too short to be a name.'; }
      return '';
    },
    'cf-email': function (v) {
      if (!v) { return 'We need an email address to reply to.'; }
      if (!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(v)) { return 'That email address is not valid.'; }
      if (/(^|\\.)(gmail|yahoo|hotmail|outlook|proton(mail)?)\\./i.test(v)) {
        return 'Please use your work email address.';
      }
      return '';
    },
    'cf-company': function (v) {
      if (!v) { return 'Which organisation are you with?'; }
      if (v.length < 2) { return 'Please enter the full organisation name.'; }
      return '';
    },
    'cf-message': function (v) {
      if (!v) { return 'A sentence or two is plenty.'; }
      if (v.length < 20) { return 'Please add a little more detail (20 characters minimum).'; }
      if (v.length > 600) { return 'Please keep this under 600 characters.'; }
      return '';
    }
  };

  function fieldOf(id) { return document.getElementById(id); }

  function setFieldState(id, message) {
    var input = fieldOf(id);
    var err = fieldOf('err-' + id.replace('cf-', ''));
    if (!input) { return; }
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = message; }
    } else {
      input.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; }
    }
  }

  function validateField(id) {
    var rule = RULES[id];
    if (!rule) { return true; }
    var input = fieldOf(id);
    if (!input) { return true; }
    var message = rule(input.value.trim());
    setFieldState(id, message);
    return !message;
  }

  Object.keys(RULES).forEach(function (id) {
    var input = fieldOf(id);
    if (!input) { return; }
    input.addEventListener('blur', function () { validateField(id); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') { validateField(id); }
    });
  });

  if (messageField && msgCount) {
    messageField.addEventListener('input', function () {
      msgCount.textContent = String(messageField.value.length);
    });
  }

  var consent = $('#cf-consent');
  if (consent) {
    consent.addEventListener('change', function () {
      setFieldState('cf-consent', consent.checked ? '' : 'Please confirm before sending.');
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }

      var ok = true;
      var firstBad = null;
      Object.keys(RULES).forEach(function (id) {
        if (!validateField(id)) {
          ok = false;
          if (!firstBad) { firstBad = id; }
        }
      });
      if (consent && !consent.checked) {
        setFieldState('cf-consent', 'Please confirm before sending.');
        ok = false;
        if (!firstBad) { firstBad = 'cf-consent'; }
      }
      if (!ok) {
        if (statusEl) { statusEl.textContent = 'Please fix the highlighted fields and try again.'; statusEl.className = 'form-status is-bad'; }
        if (firstBad) {
          var bad = fieldOf(firstBad);
          if (bad) { bad.focus(); }
        }
        return;
      }

      if (submitBtn) { submitBtn.classList.add('is-loading'); submitBtn.disabled = true; }
      if (statusEl) { statusEl.textContent = 'Sending your enquiry to the partner desk'; statusEl.className = 'form-status'; }

      window.setTimeout(function () {
        if (submitBtn) { submitBtn.classList.remove('is-loading'); submitBtn.disabled = false; }
        var name = (fieldOf('cf-name') ? fieldOf('cf-name').value.trim() : '').split(' ')[0];
        if (successText) {
          successText.textContent = 'Thank you, ' + name + '. Your enquiry is with the partner desk and you will hear from a named partner within two working days.';
        }
        if (form) { form.reset(); }
        if (msgCount) { msgCount.textContent = '0'; }
        if (successEl) { successEl.hidden = false; successEl.focus && successEl.focus(); }
      }, 1100);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (successEl) { successEl.hidden = true; }
      var first = fieldOf('cf-name');
      if (first) { first.focus(); }
    });
  }

  /* ---------------- newsletter ---------------- */
  var newsForm = $('#news-form');
  var newsEmail = $('#news-email');
  var newsStatus = $('#news-status');

  if (newsForm && newsEmail && newsStatus) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = newsEmail.value.trim();
      if (!value) {
        newsStatus.textContent = 'Enter an email address to subscribe.';
        newsStatus.className = 'news-status is-bad';
        newsEmail.setAttribute('aria-invalid', 'true');
        return;
      }
      if (!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(value)) {
        newsStatus.textContent = 'That email address is not valid.';
        newsStatus.className = 'news-status is-bad';
        newsEmail.setAttribute('aria-invalid', 'true');
        return;
      }
      newsEmail.removeAttribute('aria-invalid');
      newsStatus.textContent = 'Subscribed. The next Field note goes out on 14 April 2026.';
      newsStatus.className = 'news-status is-ok';
      newsForm.reset();
    });
    newsEmail.addEventListener('input', function () {
      if (newsStatus.className.indexOf('is-bad') !== -1) {
        newsStatus.textContent = '';
        newsStatus.className = 'news-status';
        newsEmail.removeAttribute('aria-invalid');
      }
    });
  }

  /* ---------------- footer year ---------------- */
  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
}());
`,
};