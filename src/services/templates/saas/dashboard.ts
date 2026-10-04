
export default {
  html: `
<a class="skip-link" href="#dash-main">Skip to dashboard content</a>

<div class="app" id="app">

  <header class="topbar">
    <button type="button" class="icon-btn nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="sidebar" aria-label="Open navigation">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>

    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></svg>
      <input type="search" id="global-search" placeholder="Search accounts, invoices, events" aria-label="Search the dashboard" autocomplete="off" />
      <kbd class="kbd" aria-hidden="true">/</kbd>
      <div class="search-results" id="search-results" hidden role="listbox" aria-label="Search results"></div>
    </div>

    <div class="topbar-right">
      <span class="env-pill"><span class="env-dot" aria-hidden="true"></span>Production</span>

      <div class="menu-wrap">
        <button type="button" class="icon-btn" id="notif-btn" aria-expanded="false" aria-controls="notif-panel" aria-label="Notifications, 3 unread">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span class="badge-count" id="notif-count">3</span>
        </button>
        <div class="dropdown notif-panel" id="notif-panel" hidden>
          <p class="dropdown-head">Notifications <span class="dropdown-count">3 unread</span></p>
          <ul>
            <li><span class="dot-sev is-high" aria-hidden="true"></span><span><strong>Payment run failed</strong> Batch 4,182 for Kestrel Bank was declined twice.<time datetime="2026-04-08T09:12:00Z">18 minutes ago</time></span></li>
            <li><span class="dot-sev is-mid" aria-hidden="true"></span><span><strong>Latency above target</strong> EU-West p95 reached 412 ms for 11 minutes.<time datetime="2026-04-08T08:40:00Z">50 minutes ago</time></span></li>
            <li><span class="dot-sev is-low" aria-hidden="true"></span><span><strong>Weekly digest ready</strong> Revenue is up 8.1% on the trailing 30 days.<time datetime="2026-04-08T07:05:00Z">2 hours ago</time></span></li>
          </ul>
          <button type="button" class="dropdown-foot" id="notif-clear">Mark all as read</button>
        </div>
      </div>

      <div class="menu-wrap">
        <button type="button" class="avatar-btn" id="avatar-btn" aria-expanded="false" aria-controls="avatar-panel" aria-label="Account menu for Nadia Fontaine">
          <span class="avatar-chip" aria-hidden="true">NF</span>
        </button>
        <div class="dropdown avatar-panel" id="avatar-panel" hidden>
          <p class="dropdown-user"><strong>Nadia Fontaine</strong><span>Head of Payments, Kestrel Bank</span></p>
          <ul class="menu-list">
            <li><button type="button" class="menu-item">Profile and preferences</button></li>
            <li><button type="button" class="menu-item">Notification schedule</button></li>
            <li><button type="button" class="menu-item">API keys</button></li>
            <li><button type="button" class="menu-item">Switch workspace</button></li>
          </ul>
          <button type="button" class="dropdown-foot" id="sign-out">Sign out</button>
        </div>
      </div>
    </div>
  </header>

  <div class="scrim" id="scrim" hidden></div>

  <aside class="sidebar" id="sidebar" aria-label="Dashboard navigation">
    <a class="brand" href="#dash-main" aria-label="Ledgerline, return to overview">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <rect x="3" y="3" width="26" height="26" rx="8" stroke="currentColor" stroke-width="1.8"/>
          <path d="M9 20l4.5-6 4 4L23 10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="brand-text">Ledgerline</span>
    </a>

    <nav class="side-nav" aria-label="Sections">
      <div class="nav-group">
        <button type="button" class="group-toggle" aria-expanded="true" aria-controls="g-overview">
          <span>Overview</span>
          <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <ul id="g-overview">
          <li><a class="side-link is-active" href="#dash-main" aria-current="page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18M7 15v-4M12 15V8M17 15v-6"/></svg>
            <span>Dashboard</span></a></li>
          <li><a class="side-link" href="#kpi-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg>
            <span>Metrics</span></a></li>
        </ul>
      </div>

      <div class="nav-group">
        <button type="button" class="group-toggle" aria-expanded="true" aria-controls="g-analytics">
          <span>Analytics</span>
          <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <ul id="g-analytics">
          <li><a class="side-link" href="#revenue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5"/></svg>
            <span>Revenue</span></a></li>
          <li><a class="side-link" href="#mix">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/></svg>
            <span>Channel mix</span></a></li>
          <li><a class="side-link" href="#accounts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
            <span>Accounts</span></a></li>
        </ul>
      </div>

      <div class="nav-group">
        <button type="button" class="group-toggle" aria-expanded="false" aria-controls="g-ops">
          <span>Operations</span>
          <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <ul id="g-ops" hidden>
          <li><a class="side-link" href="#activity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2"/></svg>
            <span>Activity log</span></a></li>
          <li><a class="side-link" href="#activity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg>
            <span>Incidents</span></a></li>
        </ul>
      </div>

      <div class="nav-group">
        <button type="button" class="group-toggle" aria-expanded="false" aria-controls="g-billing">
          <span>Billing</span>
          <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <ul id="g-billing" hidden>
          <li><a class="side-link" href="#accounts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>
            <span>Invoices</span></a></li>
          <li><a class="side-link" href="#accounts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/></svg>
            <span>Plans</span></a></li>
        </ul>
      </div>
    </nav>

    <div class="side-foot">
      <button type="button" class="rail-btn" id="rail-toggle" aria-expanded="true" aria-controls="sidebar" aria-label="Collapse sidebar to icons only">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14 6-6 6 6 6"/></svg>
        <span>Collapse</span>
      </button>
    </div>
  </aside>

  <main class="content" id="dash-main">
    <div class="page-head">
      <div>
        <p class="crumb">Production / Payments</p>
        <h1>Payments overview</h1>
        <p class="page-sub">Live figures for 8 April 2026, refreshed every 60 seconds. Times shown in CET.</p>
      </div>
      <div class="range-picker" role="group" aria-label="Select a date range">
        <span class="range-label" id="range-label">Date range</span>
        <div class="range-seg" id="range-seg">
          <button type="button" class="seg is-on" data-range="7d" aria-pressed="true">7D</button>
          <button type="button" class="seg" data-range="30d" aria-pressed="false">30D</button>
          <button type="button" class="seg" data-range="90d" aria-pressed="false">90D</button>
          <button type="button" class="seg" data-range="12m" aria-pressed="false">12M</button>
        </div>
      </div>
    </div>

    <section class="kpi-section" id="kpi-row" aria-labelledby="kpi-title">
      <h2 class="sr-only" id="kpi-title">Key performance indicators</h2>
      <ul class="kpi-grid" id="kpi-grid">
        <li class="kpi" data-kpi="0" data-reveal style="--delay:0ms">
          <p class="kpi-label">Revenue processed</p>
          <p class="kpi-value" data-kpi-value>0</p>
          <p class="kpi-trend" data-kpi-trend><span class="trend-arrow" aria-hidden="true"></span><span class="trend-text">0%</span><span class="trend-vs">vs previous period</span></p>
          <svg class="spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-spark-area fill="currentColor" opacity="0.12"></path><path data-spark-line fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </li>
        <li class="kpi" data-kpi="1" data-reveal style="--delay:60ms">
          <p class="kpi-label">Active accounts</p>
          <p class="kpi-value" data-kpi-value>0</p>
          <p class="kpi-trend" data-kpi-trend><span class="trend-arrow" aria-hidden="true"></span><span class="trend-text">0%</span><span class="trend-vs">vs previous period</span></p>
          <svg class="spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-spark-area fill="currentColor" opacity="0.12"></path><path data-spark-line fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </li>
        <li class="kpi" data-kpi="2" data-reveal style="--delay:120ms">
          <p class="kpi-label">Failed payments</p>
          <p class="kpi-value" data-kpi-value>0</p>
          <p class="kpi-trend" data-kpi-trend><span class="trend-arrow" aria-hidden="true"></span><span class="trend-text">0%</span><span class="trend-vs">vs previous period</span></p>
          <svg class="spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-spark-area fill="currentColor" opacity="0.12"></path><path data-spark-line fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </li>
        <li class="kpi" data-kpi="3" data-reveal style="--delay:180ms">
          <p class="kpi-label">Median API response</p>
          <p class="kpi-value" data-kpi-value>0</p>
          <p class="kpi-trend" data-kpi-trend><span class="trend-arrow" aria-hidden="true"></span><span class="trend-text">0%</span><span class="trend-vs">vs previous period</span></p>
          <svg class="spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-spark-area fill="currentColor" opacity="0.12"></path><path data-spark-line fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </li>
      </ul>
    </section>

    <section class="card revenue-card" id="revenue" aria-labelledby="revenue-title">
      <header class="card-head">
        <div>
          <h2 id="revenue-title">Processed volume</h2>
          <p class="card-sub" id="revenue-sub">Last 7 days, in thousands of requests</p>
        </div>
        <ul class="legend">
          <li><span class="legend-key is-primary" aria-hidden="true"></span>Requests</li>
          <li><span class="legend-key is-quiet" aria-hidden="true"></span>Previous period</li>
        </ul>
      </header>
      <div class="chart-wrap" id="area-wrap">
        <svg class="area-chart" id="area-chart" viewBox="0 0 820 268" role="img" aria-labelledby="revenue-title revenue-desc" preserveAspectRatio="xMidYMid meet">
          <desc id="revenue-desc">Area chart of processed payment requests over the selected period, with a comparison line for the previous period.</desc>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.34"></stop>
              <stop offset="1" stop-color="currentColor" stop-opacity="0.02"></stop>
            </linearGradient>
          </defs>
          <g id="area-grid"></g>
          <path id="area-prev" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.34"></path>
          <path id="area-shape" fill="url(#areaFill)"></path>
          <path id="area-line" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
          <g id="area-xlabels"></g>
          <g id="area-marker" opacity="0">
            <line id="area-guide" y1="14" y2="238" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity="0.4"></line>
            <circle id="area-dot" r="5.5" fill="var(--surface)" stroke="currentColor" stroke-width="2.6"></circle>
          </g>
          <rect id="area-hit" x="0" y="0" width="820" height="268" fill="transparent"></rect>
        </svg>
        <div class="chart-tip" id="area-tip" hidden>
          <p class="tip-label" id="tip-label">—</p>
          <p class="tip-row"><span class="tip-key" aria-hidden="true"></span><span id="tip-value">—</span></p>
          <p class="tip-row is-prev"><span class="tip-key" aria-hidden="true"></span><span id="tip-prev">—</span></p>
        </div>
        <p class="sr-only" id="area-readout" role="status" aria-live="polite"></p>
      </div>
    </section>

    <div class="split">
      <section class="card" id="mix" aria-labelledby="mix-title">
        <header class="card-head">
          <div>
            <h2 id="mix-title">Channel mix</h2>
            <p class="card-sub" id="mix-sub">Share of processed volume</p>
          </div>
        </header>
        <div class="mix-body">
          <div class="donut-wrap">
            <svg class="donut" id="donut" viewBox="0 0 180 180" role="img" aria-labelledby="mix-title" aria-describedby="mix-readout">
              <g id="donut-arcs"></g>
            </svg>
            <div class="donut-center" id="donut-center">
              <p class="donut-big" id="donut-total">—</p>
              <p class="donut-small" id="donut-caption">total volume</p>
            </div>
          </div>
          <ul class="mix-legend" id="mix-legend"></ul>
        </div>
        <p class="sr-only" id="mix-readout" role="status" aria-live="polite"></p>
      </section>

      <section class="card" aria-labelledby="ops-title">
        <header class="card-head">
          <div>
            <h2 id="ops-title">Operations by category</h2>
            <p class="card-sub" id="ops-sub">Requests handled, thousands</p>
          </div>
        </header>
        <div class="bars" id="bars"></div>
      </section>
    </div>

    <div class="split">
      <section class="card" id="activity" aria-labelledby="activity-title">
        <header class="card-head">
          <div>
            <h2 id="activity-title">Activity</h2>
            <p class="card-sub">Last events across all environments</p>
          </div>
        </header>
        <div class="feed-filters" role="group" aria-label="Filter activity by type">
          <button type="button" class="pill is-on" data-filter="all">All</button>
          <button type="button" class="pill" data-filter="deploy">Deploys</button>
          <button type="button" class="pill" data-filter="alert">Alerts</button>
          <button type="button" class="pill" data-filter="billing">Billing</button>
        </div>
        <ol class="feed" id="feed">
          <li data-kind="deploy">
            <span class="feed-ico is-deploy" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg></span>
            <p class="feed-body"><strong>api-gateway v4.18.2</strong> deployed to production<span class="feed-meta">Rolled out to 12 regions by Emil Sørensen &middot; 18 minutes ago</span></p>
          </li>
          <li data-kind="alert">
            <span class="feed-ico is-alert" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 3 2 20h20L12 3ZM12 10v4M12 17v.01"/></svg></span>
            <p class="feed-body"><strong>p95 latency breach</strong> on eu-west-1<span class="feed-meta">412 ms against a 300 ms target &middot; 50 minutes ago</span></p>
          </li>
          <li data-kind="billing">
            <span class="feed-ico is-billing" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg></span>
            <p class="feed-body">Payout batch <strong>4,178</strong> settled for Northbeam<span class="feed-meta">$2.41M across 6,204 transactions &middot; 2 hours ago</span></p>
          </li>
          <li data-kind="deploy">
            <span class="feed-ico is-deploy" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg></span>
            <p class="feed-body"><strong>settlement-worker</strong> rolled back to v2.9.0<span class="feed-meta">Automatic rollback, error rate 4.1% &middot; 3 hours ago</span></p>
          </li>
          <li data-kind="billing">
            <span class="feed-ico is-billing" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg></span>
            <p class="feed-body">Invoice <strong>INV-2026-0442</strong> issued to Holloway Group<span class="feed-meta">$18,400 &middot; due 22 April 2026 &middot; 5 hours ago</span></p>
          </li>
          <li data-kind="alert">
            <span class="feed-ico is-alert" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 3 2 20h20L12 3ZM12 10v4M12 17v.01"/></svg></span>
            <p class="feed-body">Certificate for <strong>api.ledgerline.example</strong> expires in 14 days<span class="feed-meta">Renewal scheduled automatically &middot; 7 hours ago</span></p>
          </li>
          <li data-kind="deploy">
            <span class="feed-ico is-deploy" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg></span>
            <p class="feed-body"><strong>fraud-rules v1.4.0</strong> enabled for Altira Logistics<span class="feed-meta">38 new rules, 0 disabled &middot; yesterday at 16:40</span></p>
          </li>
        </ol>
      </section>

      <section class="card" id="accounts" aria-labelledby="accounts-title">
        <header class="card-head">
          <div>
            <h2 id="accounts-title">Top accounts</h2>
            <p class="card-sub" id="accounts-sub">By volume, selected period</p>
          </div>
          <label class="table-search">
            <span class="sr-only">Filter accounts</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></svg>
            <input type="search" id="table-filter" placeholder="Filter accounts" autocomplete="off" />
          </label>
        </header>
        <div class="table-scroll">
          <table class="data-table" id="data-table">
            <caption class="sr-only">Top accounts by processed volume with sortable columns and status</caption>
            <thead>
              <tr>
                <th scope="col"><button type="button" class="sort-btn" data-sort="name" aria-sort="none">Account<svg class="sort-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg></button></th>
                <th scope="col" class="num"><button type="button" class="sort-btn" data-sort="volume" aria-sort="none">Volume<svg class="sort-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg></button></th>
                <th scope="col" class="num"><button type="button" class="sort-btn" data-sort="success" aria-sort="none">Success<svg class="sort-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg></button></th>
                <th scope="col"><button type="button" class="sort-btn" data-sort="status" aria-sort="none">Status<svg class="sort-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg></button></th>
              </tr>
            </thead>
            <tbody id="table-body"></tbody>
          </table>
          <p class="table-empty" id="table-empty" hidden>No account matches that filter.</p>
        </div>
      </section>
    </div>
  </main>
</div>

<footer class="site-footer" id="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#dash-main" aria-label="Ledgerline, return to overview">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false">
            <rect x="3" y="3" width="26" height="26" rx="8" stroke="currentColor" stroke-width="1.8"/>
            <path d="M9 20l4.5-6 4 4L23 10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="brand-text">Ledgerline</span>
      </a>
      <p class="footer-blurb">Payments infrastructure for regulated institutions. Figures on this page are illustrative demo data.</p>
      <ul class="socials">
        <li><a href="#footer" aria-label="Ledgerline on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
        <li><a href="#footer" aria-label="Ledgerline on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/></svg></a></li>
        <li><a href="#footer" aria-label="Ledgerline status page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="df-product">
      <h2 id="df-product">Product</h2>
      <ul>
        <li><a href="#revenue">Volume reporting</a></li>
        <li><a href="#mix">Channel analytics</a></li>
        <li><a href="#accounts">Account directory</a></li>
        <li><a href="#activity">Audit log</a></li>
        <li><a href="#footer">Webhooks</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="df-developers">
      <h2 id="df-developers">Developers</h2>
      <ul>
        <li><a href="#footer">API reference</a></li>
        <li><a href="#footer">SDKs and clients</a></li>
        <li><a href="#footer">Sandbox keys</a></li>
        <li><a href="#footer">Changelog</a></li>
        <li><a href="#footer">Status page</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="df-company">
      <h2 id="df-company">Company</h2>
      <ul>
        <li><a href="#footer">About Ledgerline</a></li>
        <li><a href="#footer">Security</a></li>
        <li><a href="#footer">Trust centre</a></li>
        <li><a href="#footer">Careers</a></li>
        <li><a href="#footer">Contact</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <h2 id="df-alerts">Incident alerts</h2>
      <p>Real-time pages for degraded payment routing, sent to a shared channel.</p>
      <form id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email for incident alerts</label>
        <div class="news-row">
          <input type="email" id="footer-email" name="email" placeholder="you@company.com" aria-describedby="footer-status" required />
          <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscribe to incident alerts">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
        <p class="news-status" id="footer-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Ledgerline Systems Ltd &middot; 5 Finsbury Court, London EC2A 4AA</p>
    <ul class="legal">
      <li><a href="#footer">Privacy</a></li>
      <li><a href="#footer">Terms</a></li>
      <li><a href="#footer">Acceptable use</a></li>
      <li><a href="#footer">Accessibility</a></li>
    </ul>
  </div>
</footer>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display: 'Sora', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --bg: #eef1f7;
  --surface: #ffffff;
  --surface-2: #f8fafd;
  --surface-3: #f1f4fa;
  --ink: #101a2e;
  --body: #4d5a70;
  --muted: #7c8aa1;
  --line: #e2e8f2;
  --line-soft: #eef2f8;

  --accent: #2f6bf6;
  --accent-deep: #1c4fd6;
  --accent-3: #00b8a9;
  --accent-ink: #2151c8;
  --accent-soft: rgba(47, 107, 246, 0.09);

  --ok: #0d7a4c;
  --ok-soft: rgba(13, 122, 76, 0.11);
  --warn: #9a6410;
  --warn-soft: rgba(154, 100, 16, 0.12);
  --bad: #b42636;
  --bad-soft: rgba(180, 38, 54, 0.11);

  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 22px; --s-6: 30px; --s-7: 44px; --s-8: 60px;
  --gap: var(--s-4);

  --r-sm: 7px; --r-md: 11px; --r-lg: 16px; --r-xl: 22px; --r-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(16, 26, 46, 0.05);
  --shadow-sm: 0 2px 8px rgba(16, 26, 46, 0.07), 0 1px 2px rgba(16, 26, 46, 0.04);
  --shadow-md: 0 12px 30px rgba(16, 26, 46, 0.10), 0 3px 8px rgba(16, 26, 46, 0.05);
  --shadow-lg: 0 26px 60px rgba(16, 26, 46, 0.16);
  --shadow-accent: 0 12px 32px rgba(47, 107, 246, 0.26);

  --rail: 264px;
  --topbar-h: 66px;
  --wrap: 1400px;
  --ease: cubic-bezier(0.22, 0.72, 0.24, 1);
  --dur: 0.26s;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #070b14;
    --surface: #101827;
    --surface-2: #0d1420;
    --surface-3: #162032;
    --ink: #eaeffb;
    --body: #aeb9cf;
    --muted: #8592ab;
    --line: rgba(150, 166, 200, 0.18);
    --line-soft: rgba(150, 166, 200, 0.09);
    --accent: #6f95ff;
    --accent-deep: #86a6ff;
    --accent-ink: #92adff;
    --accent-soft: rgba(111, 149, 255, 0.12);
    --ok: #5ed39c;
    --ok-soft: rgba(94, 211, 156, 0.12);
    --warn: #e2b263;
    --warn-soft: rgba(226, 178, 99, 0.13);
    --bad: #f28b9b;
    --bad-soft: rgba(242, 139, 155, 0.13);
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
    --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.5);
    --shadow-md: 0 14px 34px rgba(0, 0, 0, 0.55);
    --shadow-lg: 0 28px 64px rgba(0, 0, 0, 0.65);
    --shadow-accent: 0 12px 34px rgba(111, 149, 255, 0.25);
  }
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-text);
  font-size: 15px;
  line-height: 1.6;
  color: var(--body);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { font-family: var(--font-display); color: var(--ink); line-height: 1.16; margin: 0; font-weight: 600; letter-spacing: -0.026em; }
h1 { font-size: clamp(1.55rem, 2.6vw, 2.05rem); }
h2 { font-size: clamp(1.02rem, 1.5vw, 1.22rem); }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
svg { display: block; }
a { color: var(--accent-ink); text-decoration: none; }
button, input, select { font: inherit; color: inherit; }
strong { color: var(--ink); font-weight: 600; }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(16px, 3vw, 34px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--r-sm); }

.skip-link { position: fixed; left: 50%; top: 0; transform: translate(-50%, -160%); z-index: 400; padding: 12px 22px; border-radius: 0 0 var(--r-md) var(--r-md); background: var(--accent); color: #fff; font-weight: 600; font-size: 0.9rem; transition: transform var(--dur) var(--ease); }
.skip-link:focus { transform: translate(-50%, 0); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2); padding: 11px 20px; border: 1px solid transparent; border-radius: var(--r-md); font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-deep); box-shadow: var(--shadow-accent); transform: translateY(-1px); }
.btn-sm { padding: 8px 13px; font-size: 0.82rem; }
.btn .icon { width: 17px; height: 17px; }
.icon-btn { display: inline-grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); color: var(--body); cursor: pointer; position: relative; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.icon-btn svg { width: 20px; height: 20px; }
.icon-btn:hover { border-color: var(--accent); color: var(--accent-ink); background: var(--accent-soft); }
.icon-btn:active { transform: scale(0.94); }

[data-reveal] { opacity: 0; transform: translateY(18px); transition: opacity 0.62s var(--ease) var(--delay, 0ms), transform 0.62s var(--ease) var(--delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- app shell ---------- */
.app { display: grid; grid-template-columns: var(--rail) minmax(0, 1fr); min-height: 100vh; align-items: start; }
.app.is-rail { --rail: 76px; }

/* ---------- topbar ---------- */
.topbar { grid-column: 1 / -1; position: sticky; top: 0; z-index: 90; display: flex; align-items: center; gap: var(--s-4); height: var(--topbar-h); padding-inline: clamp(14px, 2.4vw, 26px); border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 88%, transparent); backdrop-filter: saturate(150%) blur(14px); -webkit-backdrop-filter: saturate(150%) blur(14px); }
.nav-toggle { display: none; }
.search-wrap { position: relative; flex: 1; max-width: 520px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; width: 18px; height: 18px; color: var(--muted); pointer-events: none; }
.search-wrap input { width: 100%; padding: 9px 44px 9px 38px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface-3); font-size: 0.88rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.search-wrap input::-webkit-search-cancel-button { -webkit-appearance: none; }
.search-wrap input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.kbd { position: absolute; right: 11px; padding: 1px 7px; border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 5px; background: var(--surface); font-size: 0.72rem; font-family: ui-monospace, Consolas, monospace; color: var(--muted); }
.search-wrap input:focus ~ .kbd { display: none; }
.search-results { position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 30; max-height: 320px; overflow-y: auto; padding: 6px; border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-md); }
.search-results[hidden] { display: none; }
.search-results li { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding: 9px 12px; border-radius: var(--r-sm); font-size: 0.86rem; cursor: pointer; transition: background-color var(--dur) var(--ease); }
.search-results li:hover, .search-results li.is-cursor { background: var(--accent-soft); }
.search-results .sr-cat { font-size: 0.72rem; color: var(--muted); }
.search-results .sr-empty { color: var(--muted); cursor: default; }
.search-results .sr-empty:hover { background: none; }

.topbar-right { display: flex; align-items: center; gap: var(--s-3); margin-left: auto; }
.env-pill { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 0.76rem; font-weight: 600; color: var(--body); white-space: nowrap; }
.env-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); animation: pulseRing 2.6s ease-out infinite; }
.badge-count { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; display: grid; place-items: center; border-radius: var(--r-pill); background: var(--bad); color: #fff; font-size: 0.66rem; font-weight: 700; border: 2px solid var(--surface); }
.badge-count[hidden] { display: none; }
.avatar-btn { border: 0; background: none; padding: 0; cursor: pointer; border-radius: 50%; }
.avatar-chip { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(140deg, var(--accent), #7b4df6); color: #fff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.02em; transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.avatar-btn:hover .avatar-chip { transform: scale(1.06); box-shadow: var(--shadow-accent); }

/* ---------- dropdowns ---------- */
.menu-wrap { position: relative; }
.dropdown { position: absolute; top: calc(100% + 10px); right: 0; z-index: 40; width: 316px; border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-md); animation: dropIn 0.2s var(--ease) both; }
.dropdown[hidden] { display: none; }
.dropdown-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--line-soft); font-size: 0.82rem; font-weight: 700; color: var(--ink); }
.dropdown-count { font-size: 0.72rem; font-weight: 600; color: var(--bad); }
.notif-panel ul { display: grid; }
.notif-panel li { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line-soft); font-size: 0.84rem; cursor: pointer; transition: background-color var(--dur) var(--ease); }
.notif-panel li:hover { background: var(--surface-3); }
.notif-panel strong { display: block; }
.notif-panel time { display: block; font-size: 0.74rem; color: var(--muted); }
.dot-sev { width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; flex: none; }
.dot-sev.is-high { background: var(--bad); }
.dot-sev.is-mid { background: var(--warn); }
.dot-sev.is-low { background: var(--accent); }
.dropdown-foot { width: 100%; padding: 11px; border: 0; border-top: 1px solid var(--line-soft); background: none; color: var(--accent-ink); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background-color var(--dur) var(--ease); }
.dropdown-foot:hover { background: var(--accent-soft); }
.dropdown-user { padding: 14px 16px; border-bottom: 1px solid var(--line-soft); }
.dropdown-user strong { display: block; }
.dropdown-user span { font-size: 0.78rem; color: var(--muted); }
.menu-list { padding: 6px; display: grid; }
.menu-item { width: 100%; padding: 9px 12px; border: 0; border-radius: var(--r-sm); background: none; text-align: left; font-size: 0.86rem; color: var(--body); cursor: pointer; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.menu-item:hover { background: var(--accent-soft); color: var(--ink); }

/* ---------- sidebar ---------- */
.sidebar { position: sticky; top: var(--topbar-h); height: calc(100vh - var(--topbar-h)); display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-5) var(--s-3); border-right: 1px solid var(--line); background: var(--surface); overflow: hidden; }
.brand { display: inline-flex; align-items: center; gap: 10px; padding-inline: 6px; color: var(--ink); flex: none; }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(140deg, var(--accent), #7b4df6); color: #fff; flex: none; transition: transform 0.5s var(--ease); }
.brand:hover .brand-mark { transform: rotate(-8deg); }
.brand-mark svg { width: 21px; height: 21px; }
.brand-text { font-family: var(--font-display); font-size: 1.14rem; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.side-nav { display: grid; gap: var(--s-2); overflow-y: auto; flex: 1; margin-inline: -4px; padding-inline: 4px; }
.nav-group + .nav-group { margin-top: var(--s-2); }
.group-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 7px 10px; border: 0; border-radius: var(--r-sm); background: none; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); cursor: pointer; white-space: nowrap; transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.group-toggle:hover { color: var(--ink); background: var(--surface-3); }
.caret { width: 15px; height: 15px; flex: none; transition: transform var(--dur) var(--ease); }
.group-toggle[aria-expanded="true"] .caret { transform: rotate(180deg); }
.nav-group ul { display: grid; gap: 2px; margin-top: 3px; }
.nav-group ul[hidden] { display: none; }
.side-link { display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--r-sm); font-size: 0.88rem; font-weight: 500; color: var(--body); white-space: nowrap; position: relative; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.side-link svg { width: 19px; height: 19px; flex: none; color: var(--muted); transition: color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.side-link:hover { background: var(--surface-3); color: var(--ink); }
.side-link:hover svg { color: var(--accent); transform: scale(1.08); }
.side-link.is-active { background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; }
.side-link.is-active svg { color: var(--accent); }
.side-link.is-active::before { content: ""; position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; border-radius: 0 3px 3px 0; background: var(--accent); }
.side-foot { border-top: 1px solid var(--line-soft); padding-top: var(--s-3); flex: none; }
.rail-btn { display: flex; align-items: center; gap: 11px; width: 100%; padding: 9px 11px; border: 0; border-radius: var(--r-sm); background: none; font-size: 0.84rem; font-weight: 600; color: var(--muted); cursor: pointer; white-space: nowrap; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.rail-btn svg { width: 18px; height: 18px; flex: none; transition: transform var(--dur) var(--ease); }
.rail-btn:hover { background: var(--surface-3); color: var(--ink); }

.app.is-rail .brand-text,
.app.is-rail .group-toggle span,
.app.is-rail .side-link span,
.app.is-rail .rail-btn span { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); }
.app.is-rail .side-link { justify-content: center; padding-inline: 0; }
.app.is-rail .group-toggle { justify-content: center; }
.app.is-rail .group-toggle .caret { display: none; }
.app.is-rail .rail-btn { justify-content: center; }
.app.is-rail .rail-btn svg { transform: rotate(180deg); }
.app.is-rail .nav-group ul { display: none !important; }
.app.is-rail .side-link.is-active::before { left: -3px; }

.scrim { position: fixed; inset: var(--topbar-h) 0 0; z-index: 70; background: rgba(8, 14, 26, 0.5); animation: fadeIn 0.22s var(--ease) both; }
.scrim[hidden] { display: none; }

/* ---------- content ---------- */
.content { grid-column: 2; padding: clamp(18px, 2.6vw, 32px); display: grid; gap: var(--gap); align-content: start; }
.app.is-rail .content { grid-column: 2; }
.page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--s-4); }
.crumb { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
.page-sub { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }
.range-picker { display: flex; align-items: center; gap: var(--s-3); }
.range-label { font-size: 0.78rem; font-weight: 600; color: var(--muted); }
.range-seg { display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
.seg { padding: 7px 14px; border: 0; border-radius: var(--r-sm); background: none; font-size: 0.82rem; font-weight: 600; color: var(--muted); cursor: pointer; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.seg:hover { color: var(--ink); }
.seg.is-on { background: var(--accent); color: #fff; box-shadow: var(--shadow-sm); }

/* ---------- kpi ---------- */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--gap); }
.kpi { position: relative; overflow: hidden; padding: var(--s-4); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-xs); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.kpi::after { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 0.4s var(--ease); }
.kpi:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.kpi:hover::after { transform: scaleX(1); }
.kpi-label { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); }
.kpi-value { font-family: var(--font-display); font-size: clamp(1.4rem, 2.2vw, 1.85rem); font-weight: 700; color: var(--ink); letter-spacing: -0.03em; line-height: 1.1; margin-block: 7px 5px; font-variant-numeric: tabular-nums; }
.kpi-trend { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; flex-wrap: wrap; }
.trend-arrow { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; font-size: 0.6rem; }
.trend-arrow::before { content: "\\2191"; font-weight: 700; line-height: 1; }
.kpi-trend.is-up .trend-arrow { background: var(--ok-soft); color: var(--ok); }
.kpi-trend.is-down .trend-arrow { background: var(--bad-soft); color: var(--bad); }
.kpi-trend.is-down .trend-arrow::before { content: "\\2193"; }
.kpi-trend.is-flat .trend-arrow { background: var(--warn-soft); color: var(--warn); }
.kpi-trend.is-flat .trend-arrow::before { content: "\\2192"; }
.trend-text { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.kpi-trend.is-up .trend-text { color: var(--ok); }
.kpi-trend.is-down .trend-text { color: var(--bad); }
.kpi-trend.is-flat .trend-text { color: var(--warn); }
.trend-vs { color: var(--muted); font-size: 0.76rem; }
.spark { width: 100%; height: 40px; margin-top: 10px; color: var(--accent); }

/* ---------- cards ---------- */
.card { padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-xs); min-width: 0; }
.card-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: var(--s-3); margin-bottom: var(--s-5); }
.card-sub { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }
.legend { display: flex; gap: var(--s-4); }
.legend li { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; color: var(--muted); }
.legend-key { width: 16px; height: 3px; border-radius: 2px; background: var(--accent); }
.legend-key.is-quiet { background: var(--muted); opacity: 0.5; }
.split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--gap); }

/* ---------- area chart ---------- */
.chart-wrap { position: relative; }
.area-chart { width: 100%; height: 268px; color: var(--accent); overflow: visible; }
.chart-tip { position: absolute; z-index: 5; min-width: 148px; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); box-shadow: var(--shadow-md); pointer-events: none; transform: translate(-50%, -118%); animation: popIn 0.16s var(--ease) both; }
.chart-tip[hidden] { display: none; }
.tip-label { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
.tip-row { display: flex; align-items: center; gap: 8px; font-size: 0.86rem; font-weight: 600; color: var(--ink); }
.tip-key { width: 12px; height: 3px; border-radius: 2px; background: var(--accent); }
.tip-row.is-prev { color: var(--muted); font-weight: 500; font-size: 0.8rem; margin-top: 2px; }
.tip-row.is-prev .tip-key { background: var(--muted); opacity: 0.6; }

/* ---------- donut ---------- */
.mix-body { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s-5); align-items: center; }
.donut-wrap { position: relative; width: 168px; height: 168px; flex: none; }
.donut { width: 168px; height: 168px; transform: rotate(-90deg); }
.donut circle { fill: none; stroke-width: 22; cursor: pointer; transition: stroke-width 0.2s var(--ease), opacity 0.2s var(--ease); }
.donut circle.is-dim { opacity: 0.28; }
.donut circle.is-on { stroke-width: 27; }
.donut-center { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; pointer-events: none; }
.donut-big { font-family: var(--font-display); font-size: 1.24rem; font-weight: 700; color: var(--ink); line-height: 1.1; letter-spacing: -0.02em; }
.donut-small { font-size: 0.72rem; color: var(--muted); }
.mix-legend { display: grid; gap: 8px; }
.mix-legend li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 6px 8px; border-radius: var(--r-sm); font-size: 0.84rem; cursor: pointer; transition: background-color var(--dur) var(--ease); }
.mix-legend li:hover, .mix-legend li.is-on { background: var(--accent-soft); }
.mix-key { width: 11px; height: 11px; border-radius: 3px; flex: none; }
.mix-name { color: var(--body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mix-pct { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }

/* ---------- bars ---------- */
.bars { display: grid; gap: var(--s-4); }
.bar-row { display: grid; gap: 6px; }
.bar-top { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-3); font-size: 0.84rem; }
.bar-name { color: var(--body); }
.bar-val { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.bar-track { height: 10px; border-radius: var(--r-pill); background: var(--surface-3); overflow: hidden; }
.bar-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), #7b4df6); width: 0; transform-origin: left; transition: width 0.7s var(--ease); }

/* ---------- feed ---------- */
.feed-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: var(--s-4); }
.pill { padding: 5px 13px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface); font-size: 0.8rem; font-weight: 600; color: var(--muted); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.pill:hover { color: var(--ink); border-color: var(--accent); }
.pill.is-on { background: var(--accent); border-color: var(--accent); color: #fff; }
.feed { display: grid; gap: 2px; }
.feed li { display: flex; gap: var(--s-3); padding: 11px 10px; border-radius: var(--r-md); transition: background-color var(--dur) var(--ease), opacity var(--dur) var(--ease); animation: feedIn 0.4s var(--ease) both; }
.feed li:hover { background: var(--surface-3); }
.feed li[hidden] { display: none; }
.feed-ico { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; flex: none; }
.feed-ico svg { width: 17px; height: 17px; }
.feed-ico.is-deploy { background: var(--accent-soft); color: var(--accent); }
.feed-ico.is-alert { background: var(--bad-soft); color: var(--bad); }
.feed-ico.is-billing { background: var(--ok-soft); color: var(--ok); }
.feed-body { font-size: 0.87rem; line-height: 1.45; }
.feed-meta { display: block; font-size: 0.76rem; color: var(--muted); margin-top: 2px; }

/* ---------- table ---------- */
.table-search { position: relative; display: flex; align-items: center; }
.table-search svg { position: absolute; left: 10px; width: 16px; height: 16px; color: var(--muted); pointer-events: none; }
.table-search input { padding: 7px 12px 7px 32px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface-3); font-size: 0.82rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.table-search input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.table-scroll { overflow-x: auto; margin-inline: calc(var(--s-5) * -1); padding-inline: var(--s-5); }
.data-table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 0.86rem; }
.data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--line-soft); white-space: nowrap; }
.data-table thead th { padding: 0 12px 8px; border-bottom: 1px solid var(--line); }
.data-table .num { text-align: right; }
.sort-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); cursor: pointer; transition: color var(--dur) var(--ease); }
.sort-btn:hover { color: var(--ink); }
.data-table th.num .sort-btn { flex-direction: row-reverse; }
.sort-ico { width: 14px; height: 14px; opacity: 0.35; transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease); }
.sort-btn:hover .sort-ico { opacity: 0.7; }
.sort-btn[aria-sort="ascending"] .sort-ico { opacity: 1; color: var(--accent); }
.sort-btn[aria-sort="descending"] .sort-ico { opacity: 1; color: var(--accent); transform: rotate(180deg); }
.data-table tbody tr { transition: background-color var(--dur) var(--ease); cursor: pointer; }
.data-table tbody tr:hover { background: var(--surface-3); }
.data-table tbody tr:last-child td { border-bottom: 0; }
.cell-name { display: flex; align-items: center; gap: 9px; }
.cell-avatar { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 7px; background: var(--surface-3); color: var(--accent-ink); font-size: 0.68rem; font-weight: 700; flex: none; }
.status { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: var(--r-pill); font-size: 0.76rem; font-weight: 600; }
.status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status.is-healthy { background: var(--ok-soft); color: var(--ok); }
.status.is-review { background: var(--warn-soft); color: var(--warn); }
.status.is-risk { background: var(--bad-soft); color: var(--bad); }
.table-empty { padding: var(--s-5); text-align: center; font-size: 0.86rem; color: var(--muted); }
.table-empty[hidden] { display: none; }

/* ---------- footer ---------- */
.site-footer { border-top: 1px solid var(--line); background: var(--surface); }
.footer-top { display: grid; grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 0.8fr)) minmax(0, 1.15fr); gap: clamp(20px, 2.6vw, 40px); padding-block: var(--s-7); }
.footer-blurb { margin-block: var(--s-3); max-width: 34ch; font-size: 0.85rem; color: var(--muted); }
.socials { display: flex; gap: var(--s-2); }
.socials a { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--line); border-radius: var(--r-md); color: var(--body); transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease), border-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.socials svg { width: 17px; height: 17px; }
.socials a:hover { color: #fff; background: var(--accent); border-color: var(--accent); transform: translateY(-2px); }
.footer-col h2 { font-family: var(--font-text); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink); margin-bottom: var(--s-3); }
.footer-col ul { display: grid; gap: 8px; }
.footer-col a { font-size: 0.85rem; color: var(--body); transition: color var(--dur) var(--ease), padding-left var(--dur) var(--ease); }
.footer-col a:hover { color: var(--accent-ink); padding-left: 4px; }
.footer-col p { font-size: 0.84rem; color: var(--muted); margin-bottom: var(--s-3); }
.news-row { display: flex; gap: var(--s-2); }
.news-row input { flex: 1; min-width: 0; padding: 9px 13px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-3); font-size: 0.84rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.news-row input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.news-row .btn { flex: none; padding-inline: 13px; }
.news-status { margin-top: 7px; min-height: 1.2em; font-size: 0.79rem; font-weight: 600; color: var(--muted); }
.news-status.is-ok { color: var(--ok); }
.news-status.is-bad { color: var(--bad); }
.footer-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-4); padding-block: var(--s-4); border-top: 1px solid var(--line-soft); font-size: 0.8rem; color: var(--muted); }
.legal { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.legal a { color: var(--muted); }
.legal a:hover { color: var(--accent-ink); }

/* ---------- responsive ---------- */
@media (max-width: 1240px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-top { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 1024px) {
  .app { grid-template-columns: minmax(0, 1fr); }
  .nav-toggle { display: inline-grid; }
  .sidebar { position: fixed; top: var(--topbar-h); left: 0; z-index: 80; width: min(84vw, 290px); transform: translateX(-102%); transition: transform 0.3s var(--ease); box-shadow: var(--shadow-lg); }
  .app.is-nav-open .sidebar { transform: none; }
  .app.is-rail .brand-text, .app.is-rail .group-toggle span, .app.is-rail .side-link span, .app.is-rail .rail-btn span { position: static; width: auto; height: auto; margin: 0; overflow: visible; clip: auto; }
  .app.is-rail .side-link { justify-content: flex-start; padding-inline: 11px; }
  .app.is-rail .group-toggle { justify-content: space-between; }
  .app.is-rail .group-toggle .caret { display: block; }
  .app.is-rail .nav-group ul { display: grid !important; }
  .rail-btn { display: none; }
  .content { grid-column: 1; }
  .split { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 760px) {
  .page-head { align-items: flex-start; }
  .env-pill { display: none; }
  .kbd { display: none; }
  .mix-body { grid-template-columns: minmax(0, 1fr); justify-items: center; }
  .mix-legend { width: 100%; }
  .table-scroll { margin-inline: calc(var(--s-5) * -1); }
}

@media (max-width: 560px) {
  .kpi-grid { grid-template-columns: minmax(0, 1fr); }
  .range-picker { flex-direction: column; align-items: flex-start; gap: var(--s-2); }
  .range-seg { width: 100%; }
  .seg { flex: 1; }
  .footer-top { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .dropdown { width: min(88vw, 316px); }
  .search-wrap input { padding-right: 14px; }
  .area-chart { height: 220px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  [data-reveal] { opacity: 1; transform: none; }
  .env-dot, .feed li { animation: none !important; }
}

/* ---------- keyframes ---------- */
@keyframes dropIn { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: translate(-50%, -108%) scale(0.94); } to { opacity: 1; transform: translate(-50%, -118%) scale(1); } }
@keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(13, 122, 76, 0.5); } 70% { box-shadow: 0 0 0 9px rgba(13, 122, 76, 0); } 100% { box-shadow: 0 0 0 0 rgba(13, 122, 76, 0); } }
@keyframes feedIn { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
@keyframes kpiFlash { 0% { box-shadow: var(--shadow-sm); } 45% { box-shadow: var(--shadow-accent); } 100% { box-shadow: var(--shadow-xs); } }
`,
  javascript: `
'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function withCommas(n) { return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
    return node;
  }
  function svg(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
    return node;
  }

  /* ---------------- deterministic series ---------------- */
  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) { s += 2147483646; }
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function series(n, seed, base, drift, variance) {
    var rnd = seeded(seed);
    var out = [];
    for (var i = 0; i < n; i++) {
      var wave = Math.sin((i / Math.max(1, n - 1)) * Math.PI * 2.3) * base * 0.14;
      var noise = (rnd() - 0.5) * base * variance;
      out.push(Math.max(2, Math.round(base + drift * i + wave + noise)));
    }
    return out;
  }

  function previousOf(n, seed, base, drift, variance) {
    return series(n, seed + 977, base * 0.94, drift * 0.82, variance * 1.15);
  }

  var MONTHS = ['Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
  var DAYS = ['Mon 6', 'Tue 7', 'Wed 8', 'Thu 9', 'Fri 10', 'Sat 11', 'Sun 12'];

  var RANGES = {
    '7d': {
      label: 'Last 7 days',
      unit: 'thousands of requests',
      points: 7,
      labels: DAYS,
      seed: 21, base: 412, drift: 14, variance: 0.3,
      kpis: [
        { value: '$284,900', delta: 12.4, goodDown: false },
        { value: '18,412', delta: 4.2, goodDown: false },
        { value: '214', delta: -18.3, goodDown: true },
        { value: '128 ms', delta: -9.5, goodDown: true }
      ],
      bars: { names: ['Payments', 'Payouts', 'Refunds', 'Disputes', 'Transfers', 'Subscriptions'], values: [1284, 962, 418, 186, 741, 604] },
      donut: [['Card presentment', 42], ['Bank transfer', 24], ['Mobile wallet', 13], ['Direct debit', 12], ['Marketplace', 9]],
      total: '4.2M'
    },
    '30d': {
      label: 'Last 30 days',
      unit: 'thousands of requests',
      points: 15,
      labels: null,
      seed: 57, base: 1180, drift: 11, variance: 0.26,
      kpis: [
        { value: '$1,214,600', delta: 8.1, goodDown: false },
        { value: '18,104', delta: 6.9, goodDown: false },
        { value: '902', delta: -6.5, goodDown: true },
        { value: '141 ms', delta: -3.1, goodDown: true }
      ],
      bars: { names: ['Payments', 'Payouts', 'Refunds', 'Disputes', 'Transfers', 'Subscriptions'], values: [4840, 3512, 1608, 742, 2961, 2380] },
      donut: [['Card presentment', 39], ['Bank transfer', 23], ['Mobile wallet', 16], ['Direct debit', 13], ['Marketplace', 9]],
      total: '16.0M'
    },
    '90d': {
      label: 'Last 90 days',
      unit: 'thousands of requests',
      points: 18,
      labels: null,
      seed: 99, base: 1260, drift: 8, variance: 0.22,
      kpis: [
        { value: '$3,587,200', delta: -2.7, goodDown: false },
        { value: '17,880', delta: -1.1, goodDown: false },
        { value: '2,884', delta: 3.4, goodDown: true },
        { value: '152 ms', delta: 1.9, goodDown: true }
      ],
      bars: { names: ['Payments', 'Payouts', 'Refunds', 'Disputes', 'Transfers', 'Subscriptions'], values: [14210, 10640, 4880, 2140, 8810, 7020] },
      donut: [['Card presentment', 37], ['Bank transfer', 21], ['Mobile wallet', 17], ['Direct debit', 15], ['Marketplace', 10]],
      total: '47.7M'
    },
    '12m': {
      label: 'Last 12 months',
      unit: 'thousands of requests',
      points: 12,
      labels: MONTHS,
      seed: 133, base: 3240, drift: 62, variance: 0.2,
      kpis: [
        { value: '$13,940,000', delta: 19.6, goodDown: false },
        { value: '17,205', delta: 22.4, goodDown: false },
        { value: '11,002', delta: -12.8, goodDown: true },
        { value: '149 ms', delta: -15.2, goodDown: true }
      ],
      bars: { names: ['Payments', 'Payouts', 'Refunds', 'Disputes', 'Transfers', 'Subscriptions'], values: [16420, 12980, 5920, 2610, 10440, 8310] },
      donut: [['Card presentment', 40], ['Bank transfer', 22], ['Mobile wallet', 15], ['Direct debit', 14], ['Marketplace', 9]],
      total: '56.7M'
    }
  };

  var current = '7d';
  var data = null;
  var chart = null;

  /* ---------------- reveal ---------------- */
  var reveal = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach(function (n) { n.classList.add('is-visible'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
    reveal.forEach(function (n) { ro.observe(n); });
  }

  /* ---------------- sidebar: rail + mobile drawer ---------------- */
  var app = $('#app');
  var railBtn = $('#rail-toggle');
  var navToggle = $('#nav-toggle');
  var scrim = $('#scrim');

  function isMobileNav() { return window.matchMedia('(max-width: 1024px)').matches; }

  function syncNavUi() {
    if (!app) { return; }
    var mobile = isMobileNav();
    var open = mobile ? app.classList.contains('is-nav-open') : !app.classList.contains('is-rail');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
    if (railBtn) {
      railBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      railBtn.setAttribute('aria-label', open ? 'Collapse sidebar to icons only' : 'Expand sidebar');
    }
    if (scrim) { scrim.hidden = !(mobile && open); }
  }

  function toggleNav() {
    if (!app) { return; }
    if (isMobileNav()) { app.classList.toggle('is-nav-open'); }
    else { app.classList.toggle('is-rail'); }
    syncNavUi();
  }

  if (navToggle) { navToggle.addEventListener('click', toggleNav); }
  if (railBtn) { railBtn.addEventListener('click', toggleNav); }
  if (scrim) { scrim.addEventListener('click', function () { if (app) { app.classList.remove('is-nav-open'); } syncNavUi(); }); }
  window.addEventListener('resize', function () {
    if (!app) { return; }
    if (!isMobileNav()) { app.classList.remove('is-nav-open'); }
    syncNavUi();
  });
  if (app && isMobileNav()) { app.classList.add('is-rail'); }
  syncNavUi();

  /* ---------------- sidebar groups ---------------- */
  $$('.group-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var list = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (list) { list.hidden = open; }
    });
  });

  $$('.side-link').forEach(function (link) {
    link.addEventListener('click', function () {
      $$('.side-link').forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
      if (app && isMobileNav()) { app.classList.remove('is-nav-open'); syncNavUi(); }
    });
  });

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.length < 2) { return; }
      var target = document.getElementById(href.slice(1));
      if (!target) { return; }
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 82;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- topbar dropdowns ---------------- */
  var DROPDOWNS = [
    { btn: $('#notif-btn'), panel: $('#notif-panel') },
    { btn: $('#avatar-btn'), panel: $('#avatar-panel') }
  ];

  function closeAllDropdowns(except) {
    DROPDOWNS.forEach(function (d) {
      if (!d.btn || !d.panel || d.btn === except) { return; }
      d.btn.setAttribute('aria-expanded', 'false');
      d.panel.hidden = true;
    });
  }

  DROPDOWNS.forEach(function (d) {
    if (!d.btn || !d.panel) { return; }
    d.btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = d.btn.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns(d.btn);
      d.btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      d.panel.hidden = open;
    });
    d.panel.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  document.addEventListener('click', function () { closeAllDropdowns(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    closeAllDropdowns();
    if (app && app.classList.contains('is-nav-open')) { app.classList.remove('is-nav-open'); syncNavUi(); }
  });

  var notifCount = $('#notif-count');
  var notifClear = $('#notif-clear');
  if (notifClear && notifCount) {
    notifClear.addEventListener('click', function (e) {
      e.stopPropagation();
      notifCount.hidden = true;
      notifCount.textContent = '0';
      var head = $('.dropdown-count', notifClear.parentNode);
      if (head) { head.textContent = 'all read'; }
      var notifBtn = $('#notif-btn');
      if (notifBtn) { notifBtn.setAttribute('aria-label', 'Notifications, none unread'); }
    });
  }

  var signOut = $('#sign-out');
  if (signOut) {
    signOut.addEventListener('click', function (e) {
      e.stopPropagation();
      signOut.textContent = 'Signing out';
      window.setTimeout(function () { signOut.textContent = 'Sign out'; }, 1600);
    });
  }

  /* ---------------- global search ---------------- */
  var INDEX = [
    { label: 'Kestrel Bank', cat: 'Account', key: 'kestrel' },
    { label: 'Northbeam', cat: 'Account', key: 'northbeam' },
    { label: 'Holloway Group', cat: 'Account', key: 'holloway' },
    { label: 'Altira Logistics', cat: 'Account', key: 'altira' },
    { label: 'Fenwick Health', cat: 'Account', key: 'fenwick' },
    { label: 'Invoice INV-2026-0442', cat: 'Billing', key: 'inv 2026' },
    { label: 'Payout batch 4,178', cat: 'Billing', key: 'payout 4178' },
    { label: 'Payout batch 4,182', cat: 'Billing', key: 'payout 4182' },
    { label: 'api-gateway v4.18.2', cat: 'Deploy', key: 'api gateway' },
    { label: 'eu-west-1 latency', cat: 'Alert', key: 'eu west latency' },
    { label: 'Sandbox keys', cat: 'Developer', key: 'sandbox key' }
  ];
  var searchInput = $('#global-search');
  var searchResults = $('#search-results');
  var cursor = -1;

  function renderSearch(q) {
    if (!searchResults) { return; }
    searchResults.innerHTML = '';
    var term = q.trim().toLowerCase();
    if (term.length < 2) { searchResults.hidden = true; cursor = -1; return; }
    var hits = INDEX.filter(function (item) {
      return item.key.indexOf(term) !== -1 || item.label.toLowerCase().indexOf(term) !== -1 || item.cat.toLowerCase().indexOf(term) !== -1;
    });
    if (!hits.length) {
      var empty = el('li', { class: 'sr-empty' });
      empty.textContent = 'Nothing matches that search.';
      searchResults.appendChild(empty);
      searchResults.hidden = false;
      return;
    }
    hits.slice(0, 8).forEach(function (item) {
      var li = el('li', { role: 'option' });
      var name = el('span');
      name.textContent = item.label;
      var cat = el('span', { class: 'sr-cat' });
      cat.textContent = item.cat;
      li.appendChild(name);
      li.appendChild(cat);
      li.addEventListener('click', function () {
        if (searchInput) { searchInput.value = ''; }
        searchResults.hidden = true;
      });
      searchResults.appendChild(li);
    });
    searchResults.hidden = false;
    cursor = -1;
  }

  function moveCursor(step) {
    if (!searchResults || searchResults.hidden) { return; }
    var items = $$('li', searchResults);
    if (!items.length) { return; }
    cursor = (cursor + step + items.length) % items.length;
    items.forEach(function (n, i) { n.classList.toggle('is-cursor', i === cursor); });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () { renderSearch(searchInput.value); });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(-1); }
      else if (e.key === 'Enter') {
        var items = $$('li', searchResults);
        if (!searchResults.hidden && items[cursor]) { e.preventDefault(); items[cursor].click(); }
      } else if (e.key === 'Escape') { searchResults.hidden = true; }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.search-wrap')) { searchResults.hidden = true; }
    });
  }

  /* ---------------- area chart ---------------- */
  var areaSvg = $('#area-chart');
  var areaGrid = $('#area-grid');
  var areaShape = $('#area-shape');
  var areaLine = $('#area-line');
  var areaPrev = $('#area-prev');
  var areaXLabels = $('#area-xlabels');
  var areaMarker = $('#area-marker');
  var areaGuide = $('#area-guide');
  var areaDot = $('#area-dot');
  var areaHit = $('#area-hit');
  var areaTip = $('#area-tip');
  var tipLabel = $('#tip-label');
  var tipValue = $('#tip-value');
  var tipPrev = $('#tip-prev');
  var areaReadout = $('#area-readout');
  var chart = null;
  var geom = { w: 820, h: 268, left: 46, right: 806, top: 14, bottom: 236 };

  function measureChart() {
    var wrap = $('#area-wrap');
    var w = wrap ? Math.round(wrap.clientWidth) : 820;
    var h = wrap ? Math.round(wrap.clientHeight) : 268;
    if (!w || w < 10) { w = 820; }
    if (!h || h < 10) { h = 268; }
    geom = {
      w: w,
      h: h,
      left: 46,
      right: Math.max(120, w - 14),
      top: 14,
      bottom: Math.max(90, h - 32)
    };
    if (areaSvg) { areaSvg.setAttribute('viewBox', '0 0 ' + geom.w + ' ' + geom.h); }
    if (areaHit) { areaHit.setAttribute('width', String(geom.w)); areaHit.setAttribute('height', String(geom.h)); }
    if (areaGuide) { areaGuide.setAttribute('y1', String(geom.top)); areaGuide.setAttribute('y2', String(geom.bottom)); }
  }

  function buildPath(values, min, max) {
    var n = values.length;
    var w = geom.right - geom.left;
    var h = geom.bottom - geom.top;
    var step = n > 1 ? w / (n - 1) : 0;
    var d = '';
    for (var i = 0; i < n; i++) {
      var x = geom.left + step * i;
      var ratio = max === min ? 0.5 : (values[i] - min) / (max - min);
      var y = geom.bottom - ratio * h;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    return d;
  }

  function drawGrid(min, max) {
    if (!areaGrid) { return; }
    areaGrid.innerHTML = '';
    var h = geom.bottom - geom.top;
    for (var g = 0; g <= 4; g++) {
      var y = geom.top + (h / 4) * g;
      areaGrid.appendChild(svg('line', { x1: geom.left, y1: y, x2: geom.right, y2: y, stroke: 'currentColor', 'stroke-width': '1', opacity: '0.12' }));
      var val = max - ((max - min) / 4) * g;
      var label = svg('text', { x: geom.left - 9, y: y + 4, 'text-anchor': 'end', 'font-size': '10', fill: 'currentColor', opacity: '0.5' });
      label.textContent = Math.round(val) + 'k';
      areaGrid.appendChild(label);
    }
  }

  function drawXLabels(labels, count) {
    if (!areaXLabels) { return; }
    areaXLabels.innerHTML = '';
    var w = geom.right - geom.left;
    var step = count > 1 ? w / (count - 1) : 0;
    var every = count > 12 ? 3 : 1;
    for (var i = 0; i < count; i++) {
      if (i % every !== 0 && i !== count - 1) { continue; }
      var text = svg('text', { x: geom.left + step * i, y: geom.bottom + 18, 'text-anchor': 'middle', 'font-size': '10.5', fill: 'currentColor', opacity: '0.55' });
      text.textContent = labels ? labels[i] : ('D' + (i + 1));
      areaXLabels.appendChild(text);
    }
  }

  function drawArea() {
    if (!data || !areaLine) { return; }
    measureChart();
    var values = data.series;
    var prev = data.prev;
    var all = values.concat(prev);
    var min = Math.min.apply(null, all);
    var max = Math.max.apply(null, all);
    var pad = (max - min) * 0.18 || 12;
    min = Math.max(0, min - pad);
    max = max + pad;

    chart = { values: values, prev: prev, min: min, max: max };

    drawGrid(min, max);
    var line = buildPath(values, min, max);
    if (areaLine) { areaLine.setAttribute('d', line); }
    if (areaPrev) { areaPrev.setAttribute('d', buildPath(prev, min, max)); }
    if (areaShape) { areaShape.setAttribute('d', line + 'L' + geom.right + ' ' + geom.bottom + ' L' + geom.left + ' ' + geom.bottom + ' Z'); }
    drawXLabels(data.labels, values.length);
    hideTip();

    var sub = $('#revenue-sub');
    if (sub) { sub.textContent = data.label + ', ' + data.unit; }
  }

  function hideTip() {
    if (areaMarker) { areaMarker.setAttribute('opacity', '0'); }
    if (areaTip) { areaTip.hidden = true; }
  }

  function showTipAt(index) {
    if (!chart || !areaSvg || !areaTip) { return; }
    var values = chart.values;
    if (index < 0 || index >= values.length) { return; }
    var w = geom.right - geom.left;
    var step = values.length > 1 ? w / (values.length - 1) : w;
    var h = geom.bottom - geom.top;
    var ratio = chart.max === chart.min ? 0.5 : (values[index] - chart.min) / (chart.max - chart.min);
    var x = geom.left + step * index;
    var y = geom.bottom - ratio * h;

    if (areaGuide) { areaGuide.setAttribute('x1', x); areaGuide.setAttribute('x2', x); }
    if (areaDot) { areaDot.setAttribute('cx', x); areaDot.setAttribute('cy', y); }
    if (areaMarker) { areaMarker.setAttribute('opacity', '1'); }

    var label = data.labels ? data.labels[index] : ('Day ' + (index + 1));
    if (tipLabel) { tipLabel.textContent = label; }
    if (tipValue) { tipValue.textContent = withCommas(values[index]) + 'k requests'; }
    if (tipPrev) { tipPrev.textContent = withCommas(chart.prev[index]) + 'k previous period'; }

    var box = areaSvg.getBoundingClientRect();
    var scaleX = geom.w ? box.width / geom.w : 1;
    var scaleY = geom.h ? box.height / geom.h : 1;
    areaTip.hidden = false;
    areaTip.style.left = Math.min(Math.max(x * scaleX, 84), Math.max(box.width - 84, 84)) + 'px';
    areaTip.style.top = Math.max(y * scaleY, 48) + 'px';

    if (areaReadout) {
      areaReadout.textContent = label + ': ' + withCommas(values[index]) + ' thousand requests, previous period ' + withCommas(chart.prev[index]) + ' thousand.';
    }
  }

  if (areaHit) {
    areaHit.addEventListener('pointermove', function (e) {
      if (!chart || !areaSvg) { return; }
      var box = areaSvg.getBoundingClientRect();
      var vx = ((e.clientX - box.left) / (box.width || 1)) * geom.w;
      var w = geom.right - geom.left;
      var step = chart.values.length > 1 ? w / (chart.values.length - 1) : w;
      var index = Math.round((vx - geom.left) / step);
      showTipAt(Math.min(Math.max(index, 0), chart.values.length - 1));
    });
    areaHit.addEventListener('pointerleave', hideTip);
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) { window.clearTimeout(resizeTimer); }
    resizeTimer = window.setTimeout(function () {
      if (data) { drawArea(); }
    }, 160);
  });

  /* ---------------- sparklines ---------------- */
  function drawSparklines(values) {
    var cards = $$('.kpi');
    cards.forEach(function (card, i) {
      var sample = values;
      if (sample.length > 12) {
        var stride = Math.ceil(sample.length / 12);
        var reduced = [];
        for (var j = 0; j < sample.length; j += stride) { reduced.push(sample[j]); }
        sample = reduced;
      }
      var min = Math.min.apply(null, sample);
      var max = Math.max.apply(null, sample);
      var span = max - min || 1;
      var d = '';
      for (var k = 0; k < sample.length; k++) {
        var x = (120 / (sample.length - 1)) * k;
        var y = 32 - ((sample[k] - min) / span) * 26;
        d += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      var lineEl = $('[data-spark-line]', card);
      var areaEl = $('[data-spark-area]', card);
      if (lineEl) { lineEl.setAttribute('d', d); }
      if (areaEl) { areaEl.setAttribute('d', d + 'L120 36 L0 36 Z'); }
    });
  }

  /* ---------------- kpis ---------------- */
  function paintKpis(kpis, animate) {
    var cards = $$('.kpi');
    cards.forEach(function (card, i) {
      var spec = kpis[i];
      if (!spec) { return; }
      var valueEl = $('[data-kpi-value]', card);
      var trendEl = $('[data-kpi-trend]', card);
      var trendText = $('.trend-text', card);
      if (valueEl) { valueEl.textContent = spec.value; }
      if (trendEl && trendText) {
        var positive = spec.delta >= 0;
        var good = spec.goodDown ? !positive : positive;
        trendEl.classList.remove('is-up', 'is-down', 'is-flat');
        trendEl.classList.add(good ? 'is-up' : 'is-down');
        trendText.textContent = (positive ? '+' : '') + spec.delta.toFixed(1) + '%';
      }
      if (animate && !reduce) {
        card.style.animation = 'none';
        window.requestAnimationFrame(function () {
          card.style.animation = 'kpiFlash 0.5s var(--ease)';
        });
      }
    });
  }

  /* ---------------- bars ---------------- */
  var barsHost = $('#bars');
  function paintBars(spec) {
    if (!barsHost) { return; }
    barsHost.innerHTML = '';
    var max = Math.max.apply(null, spec.values);
    spec.names.forEach(function (name, i) {
      var row = el('div', { class: 'bar-row' });
      var top = el('div', { class: 'bar-top' });
      var label = el('span', { class: 'bar-name' });
      label.textContent = name;
      var val = el('span', { class: 'bar-val' });
      val.textContent = withCommas(spec.values[i]) + 'k';
      top.appendChild(label);
      top.appendChild(val);
      var track = el('div', { class: 'bar-track' });
      var fill = el('span', { class: 'bar-fill' });
      track.appendChild(fill);
      row.appendChild(top);
      row.appendChild(track);
      barsHost.appendChild(row);
      var pct = (spec.values[i] / max) * 100;
      window.setTimeout(function () { fill.style.width = pct.toFixed(1) + '%'; }, reduce ? 0 : 60 * i);
    });
    var sub = $('#ops-sub');
    if (sub) { sub.textContent = data.label + ', requests handled in thousands'; }
  }

  /* ---------------- donut (hand maths) ---------------- */
  var R = 66;
  var CIRC = 2 * Math.PI * R;
  var donutArcs = $('#donut-arcs');
  var donutTotal = $('#donut-total');
  var donutCaption = $('#donut-caption');
  var mixLegend = $('#mix-legend');
  var mixReadout = $('#mix-readout');
  var DONUT_COLORS = ['var(--accent)', '#7b4df6', 'var(--accent-3, #00b8a9)', 'var(--warn)', 'var(--muted)'];

  function paintDonut(spec) {
    if (!donutArcs) { return; }
    donutArcs.innerHTML = '';
    if (mixLegend) { mixLegend.innerHTML = ''; }

    var offset = 0;
    var painted = [];
    spec.forEach(function (row, i) {
      var pct = row[1];
      var len = (pct / 100) * CIRC;
      var circle = svg('circle', {
        cx: '90', cy: '90', r: String(R),
        stroke: DONUT_COLORS[i % DONUT_COLORS.length],
        'stroke-dasharray': len.toFixed(2) + ' ' + (CIRC - len).toFixed(2),
        'stroke-dashoffset': (-offset).toFixed(2),
        opacity: '0.92'
      });
      donutArcs.appendChild(circle);
      painted.push(circle);

      var li = el('li');
      li.setAttribute('tabindex', '0');
      var key = el('span', { class: 'mix-key' });
      key.style.background = DONUT_COLORS[i % DONUT_COLORS.length];
      var nm = el('span', { class: 'mix-name' });
      nm.textContent = row[0];
      var pc = el('span', { class: 'mix-pct' });
      pc.textContent = pct + '%';
      li.appendChild(key);
      li.appendChild(nm);
      li.appendChild(pc);

      function focusOn() {
        painted.forEach(function (c, ci) { c.classList.toggle('is-dim', ci !== i); c.classList.toggle('is-on', ci === i); });
        li.classList.add('is-on');
        if (donutCaption) { donutCaption.textContent = row[0]; }
        if (mixReadout) { mixReadout.textContent = row[0] + ' accounts for ' + pct + ' percent of processed volume.'; }
      }
      function focusOff() {
        painted.forEach(function (c) { c.classList.remove('is-dim', 'is-on'); });
        li.classList.remove('is-on');
        if (donutCaption) { donutCaption.textContent = 'total volume'; }
      }
      li.addEventListener('pointerenter', focusOn);
      li.addEventListener('pointerleave', focusOff);
      li.addEventListener('focus', focusOn);
      li.addEventListener('blur', focusOff);
      circle.addEventListener('pointerenter', focusOn);
      circle.addEventListener('pointerleave', focusOff);
      if (mixLegend) { mixLegend.appendChild(li); }

      offset += len;
    });

    if (donutTotal) { donutTotal.textContent = spec.length ? data.total : '—'; }
  }

  /* ---------------- table ---------------- */
  var ROWS = [
    { name: 'Kestrel Bank', volume: 4820, success: 99.4, status: 'healthy' },
    { name: 'Northbeam', volume: 4160, success: 99.1, status: 'healthy' },
    { name: 'Holloway Group', volume: 3510, success: 98.7, status: 'healthy' },
    { name: 'Altira Logistics', volume: 3080, success: 97.9, status: 'review' },
    { name: 'Fenwick Health', volume: 2640, success: 99.6, status: 'healthy' },
    { name: 'Pacifica Energy', volume: 2110, success: 96.4, status: 'review' },
    { name: 'Vertex Labs', volume: 1780, success: 98.9, status: 'healthy' },
    { name: 'Brightco', volume: 1290, success: 91.2, status: 'risk' },
    { name: 'Orbit Labs', volume: 940, success: 99.2, status: 'healthy' }
  ];
  var STATUS_TEXT = { healthy: 'Healthy', review: 'In review', risk: 'At risk' };
  var sortKey = 'volume';
  var sortDir = 'desc';
  var tableBody = $('#table-body');
  var tableEmpty = $('#table-empty');
  var tableFilter = $('#table-filter');

  function filteredRows() {
    var term = tableFilter ? tableFilter.value.trim().toLowerCase() : '';
    if (!term) { return ROWS.slice(); }
    return ROWS.filter(function (r) { return r.name.toLowerCase().indexOf(term) !== -1; });
  }

  function paintTable() {
    if (!tableBody) { return; }
    var rows = filteredRows();
    rows.sort(function (a, b) {
      var av = a[sortKey];
      var bv = b[sortKey];
      if (typeof av === 'string') { return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    tableBody.innerHTML = '';
    rows.forEach(function (r) {
      var tr = el('tr');
      var tdName = el('td');
      var wrap = el('div', { class: 'cell-name' });
      var av = el('span', { class: 'cell-avatar', 'aria-hidden': 'true' });
      av.textContent = r.name.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2);
      var nm = el('span');
      nm.textContent = r.name;
      wrap.appendChild(av);
      wrap.appendChild(nm);
      tdName.appendChild(wrap);

      var tdVol = el('td', { class: 'num' });
      tdVol.textContent = withCommas(r.volume) + 'k';

      var tdOk = el('td', { class: 'num' });
      tdOk.textContent = r.success.toFixed(1) + '%';

      var tdStatus = el('td');
      var badge = el('span', { class: 'status is-' + r.status });
      badge.textContent = STATUS_TEXT[r.status];
      tdStatus.appendChild(badge);

      tr.appendChild(tdName);
      tr.appendChild(tdVol);
      tr.appendChild(tdOk);
      tr.appendChild(tdStatus);
      tableBody.appendChild(tr);
    });

    if (tableEmpty) { tableEmpty.hidden = rows.length > 0; }
    var sub = $('#accounts-sub');
    if (sub) { sub.textContent = 'By volume, ' + data.label.toLowerCase() + ' \\u2014 ' + rows.length + ' of ' + ROWS.length + ' accounts'; }
  }

  $$('.sort-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-sort');
      if (key === sortKey) { sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }
      else { sortKey = key; sortDir = key === 'name' || key === 'status' ? 'asc' : 'desc'; }
      $$('.sort-btn').forEach(function (b) { b.setAttribute('aria-sort', 'none'); });
      btn.setAttribute('aria-sort', sortDir === 'asc' ? 'ascending' : 'descending');
      paintTable();
    });
  });
  if (tableFilter) { tableFilter.addEventListener('input', paintTable); }

  /* ---------------- activity filter ---------------- */
  $$('.feed-filters .pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      $$('.feed-filters .pill').forEach(function (p) { p.classList.remove('is-on'); });
      pill.classList.add('is-on');
      var kind = pill.getAttribute('data-filter');
      var shown = 0;
      $$('#feed > li').forEach(function (li) {
        var match = kind === 'all' || li.getAttribute('data-kind') === kind;
        li.hidden = !match;
        if (match) { shown += 1; }
      });
      var card = $('#activity .card-sub');
      if (card) { card.textContent = shown + ' of 7 events shown'; }
    });
  });

  /* ---------------- range switching ---------------- */
  function loadRange(key) {
    var spec = RANGES[key];
    if (!spec) { return; }
    current = key;
    data = {
      label: spec.label,
      labels: spec.labels,
      series: series(spec.points, spec.seed, spec.base, spec.drift, spec.variance),
      prev: previousOf(spec.points, spec.seed, spec.base, spec.drift, spec.variance),
      total: spec.total
    };

    paintKpis(spec.kpis, current !== '7d');
    drawSparklines(data.series);
    drawArea();
    paintBars(spec.bars);
    paintDonut(spec.donut);
    paintTable();

    var mixSub = $('#mix-sub');
    if (mixSub) { mixSub.textContent = 'Share of processed volume, ' + spec.label.toLowerCase(); }
  }

  $$('#range-seg .seg').forEach(function (seg) {
    seg.addEventListener('click', function () {
      $$('#range-seg .seg').forEach(function (s) { s.classList.remove('is-on'); s.setAttribute('aria-pressed', 'false'); });
      seg.classList.add('is-on');
      seg.setAttribute('aria-pressed', 'true');
      loadRange(seg.getAttribute('data-range'));
    });
  });

  var firstSort = $('.sort-btn[data-sort="volume"]');
  if (firstSort) { firstSort.setAttribute('aria-sort', 'descending'); }
  loadRange('7d');

  /* ---------------- footer ---------------- */
  var footerForm = $('#footer-form');
  var footerEmail = $('#footer-email');
  var footerStatus = $('#footer-status');
  if (footerForm && footerEmail && footerStatus) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = footerEmail.value.trim();
      if (!v || !/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(v)) {
        footerStatus.textContent = 'That email address is not valid.';
        footerStatus.className = 'news-status is-bad';
        return;
      }
      footerStatus.textContent = 'Subscribed. You will get a page for every sev-1 routing incident.';
      footerStatus.className = 'news-status is-ok';
      footerForm.reset();
    });
  }

  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
}());
`,
};
