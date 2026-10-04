// E-commerce Store Template — Northport Supply Co.
// Plain payload: an HTML fragment plus stylesheet and script. The host owns
// <body>, so this file supplies a fragment that owns the whole page and
// resets body itself. All product data lives in the script; nothing is fetched.

export default {
  html: `
<a class="skip-link" href="#catalog">Skip to the catalogue</a>

<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
  <symbol id="i-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 13h9.2l.9-13"/></symbol>
  <symbol id="i-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></symbol>
  <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5m-7 7 7-7 7 7"/></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h11v9.5H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.4"/><circle cx="17.5" cy="18" r="1.4"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4.2V8h-3.8M20 12a8 8 0 0 1-13.7 5.7L4 16M4 19.8V16h3.8"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></symbol>
  <symbol id="i-headset" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-1.5a8 8 0 0 1 16 0V14M4 14h3v5.5H5.2A1.2 1.2 0 0 1 4 18.3zM20 14h-3v5.5h1.8a1.2 1.2 0 0 0 1.2-1.2z"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.4 12.4 3.5H20V11l-8.9 8.9z"/><circle cx="16.2" cy="7.6" r="1.3"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></symbol>
  <symbol id="i-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z"/><path d="m19 15 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></symbol>
  <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9.5 6 6 6-6"/></symbol>
  <symbol id="i-package" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3.5 7.3v9.4L12 21l8.5-4.3V7.3L12 3ZM3.5 7.3 12 11.6l8.5-4.3M12 11.6V21"/></symbol>
  <symbol id="i-card" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h19v12h-19zM2.5 10h19M6 14.5h3"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 3.5C10 3.5 3.8 8.8 3.8 16.2c0 1.6.5 3 .5 3s6.4-1.1 9.6-4.3c3.2-3.2 6.6-7.4 6.6-11.4Z"/><path d="M5.8 18.4C8 12.6 12.2 9.2 17.4 6.8"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.6 2.6 20.4h18.8L12 3.6Z"/><path d="M12 10v4.2M12 17.4h.01"/></symbol>
  <symbol id="i-sliders" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h9M18 8h2M4 16h4M13 16h7M15 5v6M8 13v6"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4a14 14 0 0 1 0 17.2 14 14 0 0 1 0-17.2Z"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1"/></symbol>
  <symbol id="i-linkedin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.6 10.2v6.6M7.6 7.2h.01M11.6 16.8v-3.6a2.2 2.2 0 0 1 4.4 0v3.6"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4zM4 7l8 6 8-6"/></symbol>
  <symbol id="i-cpu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11v11h-11zM9.6 9.6h4.8v4.8H9.6zM9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3"/></symbol>
  <symbol id="i-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.6 9 4.6-9 4.6-9-4.6 9-4.6ZM3 12l9 4.6 9-4.6M3 16.9l9 4.6 9-4.6"/></symbol>
  <symbol id="i-zap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 13.5h7L11 22l9-11.5h-7L13 2Z"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m8 5 11 7-11 7V5Z"/></symbol>
  <symbol id="i-droplet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c3.4 3.7 5.6 6.6 5.6 9.2A5.6 5.6 0 0 1 12 18a5.6 5.6 0 0 1-5.6-5.6c0-2.6 2.2-5.5 5.6-9.2Z"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h6a3 3 0 0 1 2 3 3 3 0 0 1 2-3h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4zM12 7.5v12"/></symbol>
  <symbol id="i-cup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h11v6.5A5.5 5.5 0 0 1 10.5 19h0A5.5 5.5 0 0 1 5 13.5zM16 9h2.5a2.5 2.5 0 0 1 0 5H16M4 21.5h13"/></symbol>
  <symbol id="i-shirt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 3 4 5.4 5.6 9 7.5 8.2V21h9V8.2l1.9.8L20 5.4 15.8 3a4.2 4.2 0 0 1-7.6 0Z"/></symbol>
</svg>

<div class="toasts" id="toasts" role="status" aria-live="polite"></div>

<div class="promo-strip">
  <p>Free carbon-neutral shipping over $120 &middot; 30-day returns, no questions &middot; Every parcel hand-checked in Portland</p>
</div>

<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#top" aria-label="Northport Supply, back to top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <rect x="3" y="3" width="26" height="26" rx="8" stroke="currentColor" stroke-width="1.7"/>
          <path d="M9 21V11m7 10V15m7 6v-8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-text">Northport<em>Supply</em></span>
    </a>

    <nav class="nav" aria-label="Primary">
      <a class="nav-link" href="#catalog" data-cat-jump="all">Shop all</a>
      <a class="nav-link" href="#catalog" data-cat-jump="lighting">Lighting</a>
      <a class="nav-link" href="#catalog" data-cat-jump="workspace">Workspace</a>
      <a class="nav-link" href="#catalog" data-cat-jump="travel">Travel</a>
      <a class="nav-link" href="#values">Why Northport</a>
    </nav>

    <form class="search" id="search-form" role="search" aria-label="Search the catalogue">
      <span class="search-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-search"></use></svg></span>
      <label class="sr-only" for="search">Search products</label>
      <input class="search-input" id="search" type="search" placeholder="Search 12 products" autocomplete="off" spellcheck="false">
      <button class="search-clear icon-btn" type="button" id="search-clear" aria-label="Clear search" hidden>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-x"></use></svg>
      </button>
    </form>

    <div class="header-actions">
      <button class="icon-btn count-btn" type="button" id="wish-btn" aria-label="Wishlist, 0 saved items">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-heart"></use></svg>
        <span class="count" id="wish-count" hidden>0</span>
      </button>
      <button class="btn btn-cart" type="button" id="cart-btn" aria-expanded="false" aria-controls="cart-drawer" aria-label="Open cart, 0 items">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-cart"></use></svg>
        <span class="btn-cart-label">Cart</span>
        <span class="count count-badge" id="cart-count" hidden>0</span>
      </button>
      <button class="icon-btn nav-toggle" type="button" id="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-menu"></use></svg>
      </button>
    </div>
  </div>

  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
    <a class="mobile-link" href="#catalog" data-cat-jump="all">Shop all</a>
    <a class="mobile-link" href="#catalog" data-cat-jump="lighting">Lighting</a>
    <a class="mobile-link" href="#catalog" data-cat-jump="workspace">Workspace</a>
    <a class="mobile-link" href="#catalog" data-cat-jump="travel">Travel</a>
    <a class="mobile-link" href="#values">Why Northport</a>
    <a class="mobile-link" href="#faq">Shipping &amp; returns</a>
  </nav>
</header>

<div class="scrim" id="scrim" hidden></div>

<main id="main">
  <span id="top"></span>

  <section class="hero" aria-labelledby="hero-title">
    <div class="wrap hero-inner">
      <div class="hero-copy" data-reveal>
        <p class="kicker"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-leaf"></use></svg> Autumn 2026 collection</p>
        <h1 id="hero-title">Twelve objects worth keeping.</h1>
        <p class="lede">Northport stocks a small, deliberate catalogue: audio, workspace, lighting, travel, kitchen and apparel from eleven workshops we have actually visited. Nothing seasonal, nothing disposable.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#catalog">Shop the catalogue</a>
          <a class="btn btn-ghost" href="#values">How we choose <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg></a>
        </div>
        <ul class="hero-stats" role="list">
          <li data-reveal style="--delay:60ms"><strong data-count="11">11</strong><span>workshops visited</span></li>
          <li data-reveal style="--delay:130ms"><strong data-count="4720">0</strong><span>orders shipped in 2026</span></li>
          <li data-reveal style="--delay:200ms"><strong data-count="4.6" data-count-dec="1">0</strong><span>average product rating</span></li>
          <li data-reveal style="--delay:270ms"><strong data-count="30">30</strong><span>day no-questions returns</span></li>
        </ul>
      </div>

      <aside class="hero-panel" data-reveal style="--delay:120ms" aria-label="This month's restock">
        <div class="panel-head">
          <p class="panel-title">Restocked this week</p>
          <span class="panel-chip">4 of 12</span>
        </div>
        <ul class="panel-list" role="list">
          <li>
            <span class="panel-thumb" style="--g1:#8a5a2b;--g2:#2a190b;--g3:#f0c99a" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-droplet"></use></svg></span>
            <span class="panel-text"><strong>Ember 750ml Flask</strong><small>41 in stock &middot; $42.00</small></span>
          </li>
          <li>
            <span class="panel-thumb" style="--g1:#2f6f8a;--g2:#0f2836;--g3:#a5daee" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-zap"></use></svg></span>
            <span class="panel-text"><strong>Driftway 20K Power Bank</strong><small>25 in stock &middot; $59.00</small></span>
          </li>
          <li>
            <span class="panel-thumb" style="--g1:#6b4a86;--g2:#221533;--g3:#d8c2ec" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-sparkles"></use></svg></span>
            <span class="panel-text"><strong>Kiln Pour-Over Set</strong><small>16 in stock &middot; $76.00</small></span>
          </li>
          <li>
            <span class="panel-thumb" style="--g1:#1f6f5c;--g2:#0d2a25;--g3:#8fd9c4" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-play"></use></svg></span>
            <span class="panel-text"><strong>Halo Mini Projector</strong><small>Sold out &middot; back 4 Oct</small></span>
          </li>
        </ul>
        <a class="panel-link" href="#catalog">See all twelve products <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg></a>
      </aside>
    </div>
  </section>

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="wrap crumb-list" role="list">
      <li><a href="#top">Northport</a></li>
      <li aria-hidden="true" class="crumb-sep">/</li>
      <li><a href="#catalog" data-cat-jump="all">Shop</a></li>
      <li aria-hidden="true" class="crumb-sep">/</li>
      <li><span id="crumb-current" aria-current="page">All products</span></li>
    </ol>
  </nav>

  <section class="section section-tight" id="categories" aria-labelledby="cat-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Browse</p>
          <h2 id="cat-title">Six shelves, twelve products</h2>
        </div>
        <p class="section-note">Pick a shelf to filter the grid. Category, search and sort all stack together.</p>
      </header>
      <div class="cat-grid" id="cat-grid" role="group" aria-label="Filter by category"></div>
    </div>
  </section>

  <section class="section" id="catalog" aria-labelledby="catalog-title">
    <div class="wrap">
      <header class="section-head section-head-row" data-reveal>
        <div>
          <p class="kicker">The catalogue</p>
          <h2 id="catalog-title">Every product, in full</h2>
        </div>
        <p class="section-note" id="result-count" role="status" aria-live="polite">Showing 12 of 12 products</p>
      </header>

      <div class="toolbar" data-reveal>
        <div class="chips" id="chips" role="group" aria-label="Active filters"></div>
        <div class="toolbar-right">
          <label class="field" for="sort-select">
            <span class="field-label">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-sliders"></use></svg>
              Sort
            </span>
            <select class="select" id="sort-select">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
          <button class="btn btn-quiet" type="button" id="reset-filters" hidden>Reset filters</button>
        </div>
      </div>

      <div class="grid" id="grid">
        <p class="grid-fallback">The catalogue renders with JavaScript enabled. All twelve products, prices and stock counts are defined inside this template&rsquo;s own data &mdash; nothing is fetched from anywhere.</p>
      </div>
    </div>
  </section>

  <section class="section section-band" id="values" aria-labelledby="values-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Why Northport</p>
          <h2 id="values-title">Six promises we can be held to</h2>
        </div>
        <p class="section-note">Printed on the packing slip, so you can quote us when something goes wrong.</p>
      </header>
      <div class="value-grid">
        <article class="value" data-reveal style="--delay:0ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-truck"></use></svg></span>
          <h3>Free shipping over $120</h3>
          <p>A flat $8.95 below that, carbon-neutral either way. Portland orders leave the same afternoon if you order before 2pm.</p>
        </article>
        <article class="value" data-reveal style="--delay:60ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-refresh"></use></svg></span>
          <h3>30-day returns, prepaid label</h3>
          <p>We email a label, you drop a box. Refunds land within two business days of the parcel being scanned back in.</p>
        </article>
        <article class="value" data-reveal style="--delay:120ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-shield"></use></svg></span>
          <h3>Two-year warranty</h3>
          <p>Audio, lighting and workspace electronics are covered for two years. Accidental damage is not, and we say so up front.</p>
        </article>
        <article class="value" data-reveal style="--delay:180ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-headset"></use></svg></span>
          <h3>A human on the phone</h3>
          <p>Marcus answers 9am&ndash;5pm Pacific, Monday to Friday. Average wait last quarter was four minutes.</p>
        </article>
        <article class="value" data-reveal style="--delay:240ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-leaf"></use></svg></span>
          <h3>Repairable, not replaceable</h3>
          <p>Spare parts for eight years and published diagrams for all of it. A nylon strap costs $4, not a whole lamp.</p>
        </article>
        <article class="value" data-reveal style="--delay:300ms">
          <span class="value-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-card"></use></svg></span>
          <h3>One card, no extras</h3>
          <p>Pay in full or in four interest-free instalments. We never store a full card number on our side.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section-tight" id="recent" aria-labelledby="recent-title" hidden>
    <div class="wrap">
      <header class="section-head section-head-row" data-reveal>
        <div>
          <p class="kicker">Your trail</p>
          <h2 id="recent-title">Recently viewed</h2>
        </div>
        <button class="btn btn-quiet" type="button" id="clear-recent">Clear</button>
      </header>
      <div class="rail" id="recent-rail"></div>
    </div>
  </section>

  <section class="section section-band" aria-labelledby="quotes-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Customers</p>
          <h2 id="quotes-title">Three people, unedited</h2>
        </div>
        <p class="section-note">A 4.6 average across 5,214 verified orders since January 2025.</p>
      </header>
      <div class="quote-grid">
        <figure class="quote" data-reveal style="--delay:0ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>The keyboard arrived in four days and I have not touched another since. The switch guide Marcus sent with it was genuinely useful &mdash; he talked me out of the loud springs.</p></blockquote>
          <figcaption>
            <strong>Priya Raghunathan</strong>
            <span>Cadence 65 Mechanical Keyboard &middot; verified 14 Jul 2026</span>
          </figcaption>
        </figure>
        <figure class="quote" data-reveal style="--delay:80ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>Ordered the flask on a Tuesday, lost the lid on a trail run by Thursday. A replacement was in my hand on Saturday and they did not ask for the broken part back.</p></blockquote>
          <figcaption>
            <strong>Daniel Okonkwo</strong>
            <span>Ember 750ml Flask &middot; verified 3 Aug 2026</span>
          </figcaption>
        </figure>
        <figure class="quote" data-reveal style="--delay:160ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>I run a two-desk studio and the Lumen camera replaced a $400 meeting rig. Support walked our IT lead through the firmware over email without being asked twice.</p></blockquote>
          <figcaption>
            <strong>Anneke Vermeer</strong>
            <span>Lumen Conference Camera 4K &middot; verified 21 Sep 2026</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="promo" aria-labelledby="promo-title">
    <div class="wrap promo-inner">
      <div class="promo-copy" data-reveal>
        <p class="kicker kicker-light">Codes worth knowing</p>
        <h2 id="promo-title">Four working promo codes</h2>
        <p>Try any of them in the cart. The discount line updates before you would type a card number, and the total reorders itself.</p>
        <ul class="code-list" role="list">
          <li><code>NORTH10</code><span>10% off anything</span></li>
          <li><code>WELCOME15</code><span>15% off orders over $150</span></li>
          <li><code>LIGHTNING20</code><span>20% off the lighting shelf</span></li>
          <li><code>FREESHIP</code><span>Shipping to zero, any size</span></li>
        </ul>
      </div>
      <div class="promo-card" data-reveal style="--delay:100ms">
        <p class="promo-card-title">Run a promo now</p>
        <form class="promo-form" id="promo-quick-form" novalidate>
          <label class="sr-only" for="promo-quick">Promo code</label>
          <input class="input" id="promo-quick" type="text" placeholder="Enter a code" autocomplete="off" spellcheck="false" aria-describedby="promo-quick-msg">
          <button class="btn btn-primary" type="submit">Apply</button>
        </form>
        <p class="form-msg" id="promo-quick-msg" role="status" aria-live="polite"></p>
      </div>
    </div>
  </section>

  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="wrap wrap-narrow">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Before you ask</p>
          <h2 id="faq-title">Shipping, returns and warranty</h2>
        </div>
        <p class="section-note">Still stuck? <a class="text-link" href="#footer-contact">Email us</a> and a person replies.</p>
      </header>
      <div class="acc" id="faq-acc">
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-1"><span>When does my order actually ship?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-1" hidden><p>Orders placed before 2pm Pacific on a working day leave Portland the same afternoon. Anything after that goes out the next working day. You get a tracking number by email the moment the label is printed, and a separate note when the parcel is handed to the carrier.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-2"><span>How do returns work if something arrives damaged?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-2" hidden><p>Photograph it, reply to your order email, and a prepaid label lands in your inbox within an hour. Send it back within 30 days of delivery and we refund the full amount including the original shipping. Replacements ship before the damaged unit is scanned, so you are not waiting twice.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-3"><span>Why is the Halo Mini Projector sold out?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-3" hidden><p>The DLP panel supplier put us on a four-week allocation in August. We could have swapped in a cheaper panel, but that would have cost you roughly 300 lumens and half the colour accuracy, so we took the delay instead. The next batch is confirmed for 4 October 2026 and the waitlist is notified first.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-4"><span>Can I stack a promo code with a sale price?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-4" hidden><p>Yes, and the sale prices you see are already discounted &mdash; the crossed-out figure is the honest original. Promo codes apply to the reduced price, so NORTH10 on the Aurora lamp takes it from $148.00 to $133.20. One code per order. FREESHIP combines with a percentage code; it only touches the shipping line.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-5"><span>Do you ship outside the United States?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-5" hidden><p>Canada and the UK, yes, at a flat $24 with tracking included. We do not ship lithium cells in the Driftway power bank outside the US, so that line is excluded either way. Duties and import VAT are calculated at checkout, so there is nothing to pay on delivery.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band" aria-labelledby="cta-title">
    <div class="wrap cta-inner" data-reveal>
      <div>
        <h2 id="cta-title">Six letters a year, nothing else.</h2>
        <p>Restock alerts, workshop notes and one honest sale. Unsubscribe in a click; we do not sell the list.</p>
      </div>
      <form class="cta-form" id="cta-form" novalidate>
        <label class="sr-only" for="cta-email">Email address</label>
        <input class="input" id="cta-email" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="cta-msg">
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
      <p class="form-msg" id="cta-msg" role="status" aria-live="polite"></p>
    </div>
  </section>
</main>

<footer class="site-footer" id="footer-contact">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#top" aria-label="Northport Supply, back to top">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false"><rect x="3" y="3" width="26" height="26" rx="8" stroke="currentColor" stroke-width="1.7"/><path d="M9 21V11m7 10V15m7 6v-8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>
        </span>
        <span class="brand-text">Northport<em>Supply</em></span>
      </a>
      <p>Eleven workshops, twelve products, one warehouse on SE Ankeny Street in Portland, Oregon.</p>
      <ul class="socials" role="list">
        <li><a class="icon-btn" href="#footer-contact" aria-label="Northport on Instagram"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-instagram"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Northport on X"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-x"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Northport on LinkedIn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-linkedin"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Email Northport"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-mail"></use></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="fc-shop">
      <h2 class="footer-h" id="fc-shop">Shop</h2>
      <ul role="list">
        <li><a href="#catalog" data-cat-jump="all">All twelve products</a></li>
        <li><a href="#catalog" data-cat-jump="audio">Audio</a></li>
        <li><a href="#catalog" data-cat-jump="workspace">Workspace</a></li>
        <li><a href="#catalog" data-cat-jump="lighting">Lighting</a></li>
        <li><a href="#catalog" data-cat-jump="travel">Travel</a></li>
        <li><a href="#catalog" data-cat-jump="kitchen">Kitchen</a></li>
        <li><a href="#catalog" data-cat-jump="apparel">Apparel</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-labelledby="fc-help">
      <h2 class="footer-h" id="fc-help">Help</h2>
      <ul role="list">
        <li><a href="#faq">Shipping times</a></li>
        <li><a href="#faq">Returns &amp; refunds</a></li>
        <li><a href="#faq">Two-year warranty</a></li>
        <li><a href="#faq">International orders</a></li>
        <li><a href="#promo-title">Promo codes</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-labelledby="fc-company">
      <h2 class="footer-h" id="fc-company">Company</h2>
      <ul role="list">
        <li><a href="#values">How we choose</a></li>
        <li><a href="#values">Spare parts</a></li>
        <li><a href="#values">Repair guides</a></li>
        <li><a href="#values">Wholesale</a></li>
        <li><a href="#footer-contact">Work with us</a></li>
      </ul>
    </nav>

    <div class="footer-col footer-contact">
      <h2 class="footer-h" id="fc-contact">Contact</h2>
      <ul role="list">
        <li><a href="#footer-contact">hello@northportsupply.com</a></li>
        <li><a href="#footer-contact">+1 503 555 0148</a></li>
        <li>1420 SE Ankeny St<br>Portland, OR 97214</li>
        <li>Mon&ndash;Fri, 9am&ndash;5pm PT</li>
      </ul>
      <form class="footer-signup" id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email address for the restock list</label>
        <input class="input input-sm" id="footer-email" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="footer-msg">
        <button class="btn btn-quiet btn-sm" type="submit">Join</button>
      </form>
      <p class="form-msg" id="footer-msg" role="status" aria-live="polite"></p>
    </div>
  </div>

  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Northport Supply Co. Prices in USD, tax calculated at checkout.</p>
    <ul class="legal" role="list">
      <li><a href="#footer-contact">Privacy</a></li>
      <li><a href="#footer-contact">Terms</a></li>
      <li><a href="#footer-contact">Accessibility</a></li>
      <li><a href="#footer-contact">Recycling</a></li>
    </ul>
  </div>
</footer>

<button class="to-top" type="button" id="to-top" hidden aria-label="Back to top">
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-arrow-up"></use></svg>
</button>

<div class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" hidden>
  <div class="drawer-head">
    <h2 class="drawer-title" id="cart-title">Your cart</h2>
    <button class="icon-btn" type="button" data-act="cart-close" aria-label="Close cart">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-x"></use></svg>
    </button>
  </div>

  <div class="ship-meter" id="ship-meter" hidden>
    <p class="ship-meter-text" id="ship-meter-text"></p>
    <div class="meter" role="presentation"><span class="meter-fill" id="meter-fill"></span></div>
  </div>

  <div class="drawer-body" id="cart-body"></div>

  <div class="drawer-foot" id="cart-foot" hidden>
    <form class="promo-inline" id="promo-form" novalidate>
      <label class="sr-only" for="promo-input">Promo code</label>
      <input class="input input-sm" id="promo-input" type="text" placeholder="Promo code" autocomplete="off" spellcheck="false" aria-describedby="promo-msg">
      <button class="btn btn-quiet btn-sm" type="submit">Apply</button>
      <button class="btn btn-quiet btn-sm" type="button" data-act="promo-remove" id="promo-remove" hidden>Remove</button>
    </form>
    <p class="form-msg" id="promo-msg" role="status" aria-live="polite"></p>

    <dl class="totals">
      <div><dt>Subtotal</dt><dd id="t-sub">$0.00</dd></div>
      <div class="totals-discount" id="t-discount-row" hidden><dt id="t-discount-label">Discount</dt><dd id="t-discount">-$0.00</dd></div>
      <div><dt>Shipping</dt><dd id="t-ship">$0.00</dd></div>
      <div><dt>Estimated tax</dt><dd id="t-tax">$0.00</dd></div>
      <div class="totals-grand"><dt>Total</dt><dd id="t-total">$0.00</dd></div>
    </dl>
    <button class="btn btn-primary btn-block" type="button" data-act="checkout">Checkout securely</button>
    <p class="drawer-note"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-shield"></use></svg> Demo checkout &mdash; nothing is sent anywhere.</p>
  </div>
</div>

<div class="modal" id="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal-panel" role="document">
    <button class="icon-btn modal-close" type="button" data-act="modal-close" aria-label="Close product details">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-x"></use></svg>
    </button>
    <div class="modal-body" id="modal-body"></div>
  </div>
</div>

<div class="fly-layer" id="fly-layer" aria-hidden="true"></div>
`,

  css: `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

/* Several components below set an explicit display, which would otherwise beat
   the user-agent rule for [hidden]. Restore it with priority. */
[hidden] { display: none !important; }

:root {
  --color-canvas: #f6f4ef;
  --color-surface: #ffffff;
  --color-surface-2: #fbfaf6;
  --color-ink: #16211d;
  --color-ink-soft: #3c4a45;
  --color-muted: #5b6b65;
  --color-line: #e3dfd5;
  --color-line-strong: #cdc7b9;
  --color-accent: #1f6f5c;
  --color-accent-strong: #145143;
  --color-accent-soft: #e7f1ed;
  --color-accent-ink: #0e3a31;
  --color-on-accent: #ffffff;
  --color-star: #9a6512;
  --color-sale: #99382b;
  --color-sale-soft: #f8eae7;
  --color-ok: #276a44;
  --color-warn: #85590e;
  --color-scrim: rgba(14, 26, 22, .48);

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.75rem;
  --space-8: 4rem;
  --space-9: 5.5rem;

  --radius-xs: .375rem;
  --radius-sm: .625rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-pill: 999px;

  --shadow-1: 0 1px 2px rgba(22,33,29,.06), 0 1px 3px rgba(22,33,29,.05);
  --shadow-2: 0 2px 4px rgba(22,33,29,.05), 0 8px 20px rgba(22,33,29,.07);
  --shadow-3: 0 4px 8px rgba(22,33,29,.06), 0 18px 44px rgba(22,33,29,.11);
  --shadow-4: 0 10px 24px rgba(22,33,29,.10), 0 36px 80px rgba(22,33,29,.18);

  --font-display: 'Fraunces', Georgia, 'Iowan Old Style', 'Times New Roman', serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --wrap: 1240px;
  --wrap-narrow: 780px;
  --dur-1: 150ms;
  --dur-2: 260ms;
  --dur-3: 460ms;
  --ease: cubic-bezier(.32, .72, .28, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-canvas: #0c1211;
    --color-surface: #131b18;
    --color-surface-2: #18211e;
    --color-ink: #e9efec;
    --color-ink-soft: #c6d2cd;
    --color-muted: #9daea7;
    --color-line: #26312d;
    --color-line-strong: #35423c;
    --color-accent: #55b598;
    --color-accent-strong: #74d0b1;
    --color-accent-soft: #122b25;
    --color-accent-ink: #d3ecdf;
    --color-on-accent: #06120f;
    --color-star: #dfa94c;
    --color-sale: #e59a89;
    --color-sale-soft: #2d1a17;
    --color-ok: #6ec596;
    --color-warn: #d6a952;
    --color-scrim: rgba(0, 0, 0, .62);
    --shadow-1: 0 1px 2px rgba(0,0,0,.5);
    --shadow-2: 0 2px 6px rgba(0,0,0,.45), 0 10px 24px rgba(0,0,0,.36);
    --shadow-3: 0 6px 14px rgba(0,0,0,.5), 0 22px 48px rgba(0,0,0,.44);
    --shadow-4: 0 12px 26px rgba(0,0,0,.55), 0 42px 90px rgba(0,0,0,.5);
  }
}

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  padding: 0;
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 600; line-height: 1.14; letter-spacing: -.015em; }
h1 { font-size: clamp(2.15rem, 5.4vw, 4rem); }
h2 { font-size: clamp(1.65rem, 3.1vw, 2.5rem); }
h3 { font-size: clamp(1.06rem, 1.5vw, 1.28rem); }
p { text-wrap: pretty; }
svg { display: block; }
a { color: inherit; }
ul, ol { list-style: none; }
.sprite { position: absolute; width: 0; height: 0; overflow: hidden; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

.skip-link {
  position: fixed; top: var(--space-3); left: var(--space-3); z-index: 2000;
  transform: translateY(-180%);
  background: var(--color-accent); color: var(--color-on-accent);
  padding: var(--space-3) var(--space-5); border-radius: var(--radius-sm);
  font-weight: 600; text-decoration: none; box-shadow: var(--shadow-3);
  transition: transform var(--dur-2) var(--ease);
}
.skip-link:focus { transform: translateY(0); }

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-xs);
}

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.wrap-narrow { max-width: var(--wrap-narrow); }

:where(section, main > span, footer, nav.breadcrumb)[id] { scroll-margin-top: 86px; }

.kicker {
  display: inline-flex; align-items: center; gap: var(--space-2);
  font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--color-accent); margin-bottom: var(--space-3);
}
.kicker .icon { width: 1em; height: 1em; }
.kicker-light { color: #9fd9c3; }
@media (prefers-color-scheme: dark) { .kicker-light { color: var(--color-accent); } }

.lede { font-size: clamp(1rem, 1.35vw, 1.125rem); color: var(--color-muted); max-width: 56ch; margin-top: var(--space-4); }

.section { padding-block: clamp(3rem, 7vw, 5.5rem); }
.section-tight { padding-block: clamp(2rem, 4.5vw, 3.25rem); }
.section-band { background: var(--color-surface); border-block: 1px solid var(--color-line); }

.section-head { margin-bottom: clamp(1.5rem, 3vw, 2.5rem); max-width: 68ch; }
.section-head-row { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: flex-end; justify-content: space-between; }
.section-note { color: var(--color-muted); font-size: .95rem; max-width: 44ch; }

.text-link { color: var(--color-accent); font-weight: 600; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.text-link:hover { color: var(--color-accent-strong); }

/* ------------------------------ buttons ------------------------------ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  padding: .78rem 1.35rem;
  border: 1px solid transparent; border-radius: var(--radius-sm);
  font: inherit; font-size: .94rem; font-weight: 600; letter-spacing: -.005em;
  text-decoration: none; cursor: pointer;
  transition: transform var(--dur-1) var(--ease), background var(--dur-2) var(--ease),
              border-color var(--dur-2) var(--ease), color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.btn .icon { width: 1.05em; height: 1.05em; }
.btn:active { transform: translateY(1px) scale(.985); }
.btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

.btn-primary { background: var(--color-accent); color: var(--color-on-accent); box-shadow: var(--shadow-1); }
.btn-primary:hover:not(:disabled) { background: var(--color-accent-strong); box-shadow: var(--shadow-2); transform: translateY(-1px); }

.btn-ghost { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-line-strong); }
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-surface-2); }
.btn-ghost.is-on { border-color: var(--color-sale); color: var(--color-sale); background: var(--color-sale-soft); }
.btn-ghost.is-on .icon { fill: currentColor; }

.btn-quiet { background: transparent; color: var(--color-muted); border-color: var(--color-line); }
.btn-quiet:hover { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-soft); }

.btn-sm { padding: .45rem .8rem; font-size: .84rem; }
.btn-block { width: 100%; }

.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; padding: 0;
  background: transparent; color: var(--color-ink-soft);
  border: 1px solid var(--color-line); border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease),
              border-color var(--dur-2) var(--ease), transform var(--dur-1) var(--ease);
}
.icon-btn .icon { width: 20px; height: 20px; }
.icon-btn:hover { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-soft); }
.icon-btn:active { transform: scale(.94); }

.input {
  width: 100%; min-width: 0;
  padding: .72rem .9rem;
  font: inherit; font-size: .94rem; color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-line-strong); border-radius: var(--radius-sm);
  transition: border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.input::placeholder { color: var(--color-muted); opacity: .8; }
.input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
.input-sm { padding: .5rem .7rem; font-size: .86rem; }
.input[aria-invalid='true'] { border-color: var(--color-sale); }

.form-msg { font-size: .82rem; color: var(--color-muted); min-height: 1.15rem; }
.form-msg.is-ok { color: var(--color-ok); }
.form-msg.is-bad { color: var(--color-sale); }

/* ---------------------------- promo strip ---------------------------- */
.promo-strip {
  background: var(--color-accent-ink);
  color: #cfe9dd;
  text-align: center;
  padding: .5rem 1rem;
  font-size: .8rem;
}
@media (prefers-color-scheme: dark) { .promo-strip { background: var(--color-accent-soft); color: var(--color-accent-ink); } }

/* ------------------------------ header ------------------------------ */
.site-header {
  position: sticky; top: 0; z-index: 900;
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  border-bottom: 1px solid var(--color-line);
  transition: box-shadow var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease);
}
.site-header.is-scrolled { box-shadow: var(--shadow-2); }

.header-inner {
  display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.75rem);
  min-height: 68px;
}

.brand { display: inline-flex; align-items: center; gap: .6rem; text-decoration: none; flex: none; }
.brand-mark { width: 32px; height: 32px; color: var(--color-accent); }
.brand-mark svg { width: 100%; height: 100%; }
.brand-text { font-family: var(--font-display); font-size: 1.16rem; font-weight: 600; letter-spacing: -.02em; }
.brand-text em { font-style: normal; color: var(--color-accent); }

.nav { display: none; gap: var(--space-1); }
.nav-link {
  position: relative; padding: .45rem .7rem; border-radius: var(--radius-xs);
  font-size: .9rem; font-weight: 500; color: var(--color-ink-soft); text-decoration: none;
  transition: color var(--dur-2) var(--ease);
}
.nav-link::after {
  content: ''; position: absolute; left: .7rem; right: .7rem; bottom: .28rem; height: 2px;
  background: var(--color-accent); border-radius: 2px;
  transform: scaleX(0); transform-origin: left; transition: transform var(--dur-2) var(--ease);
}
.nav-link:hover { color: var(--color-accent); }
.nav-link:hover::after, .nav-link:focus-visible::after { transform: scaleX(1); }

.search { position: relative; display: flex; align-items: center; flex: 1 1 220px; max-width: 340px; }
.search-icon { position: absolute; left: .7rem; color: var(--color-muted); pointer-events: none; }
.search-icon .icon { width: 17px; height: 17px; }
.search-input {
  width: 100%; padding: .55rem 2.2rem .55rem 2.35rem;
  font: inherit; font-size: .9rem; color: var(--color-ink);
  background: var(--color-surface-2);
  border: 1px solid var(--color-line); border-radius: var(--radius-pill);
  transition: border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.search-input::-webkit-search-cancel-button { display: none; }
.search-input:focus { outline: none; border-color: var(--color-accent); background: var(--color-surface); box-shadow: 0 0 0 3px var(--color-accent-soft); }
.search-clear { position: absolute; right: .25rem; width: 30px; height: 30px; border: 0; }
.search-clear .icon { width: 15px; height: 15px; }

.header-actions { display: flex; align-items: center; gap: var(--space-2); flex: none; margin-left: auto; }

.count-btn { position: relative; }
.count {
  position: absolute; top: -6px; right: -6px;
  min-width: 18px; height: 18px; padding: 0 4px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: .68rem; font-weight: 700; line-height: 1;
  color: var(--color-on-accent); background: var(--color-accent);
  border: 2px solid var(--color-surface); border-radius: var(--radius-pill);
}
.btn-cart { position: relative; gap: .5rem; padding-inline: .95rem; background: var(--color-surface); color: var(--color-ink); border-color: var(--color-line-strong); }
.btn-cart:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-soft); }
.btn-cart-label { display: none; }
.count-badge { top: -8px; right: -8px; background: var(--color-sale); }
.btn-cart.is-bumped .count-badge { animation: badgePop 460ms var(--ease); }

.nav-toggle { display: inline-flex; }

.mobile-nav {
  display: flex; flex-direction: column; gap: var(--space-1);
  padding: var(--space-3) clamp(1rem, 4vw, 2.5rem) var(--space-5);
  border-top: 1px solid var(--color-line);
  background: var(--color-surface);
  animation: slideDown var(--dur-2) var(--ease);
}
.mobile-link {
  padding: .7rem .5rem; border-bottom: 1px solid var(--color-line);
  font-size: .95rem; font-weight: 500; text-decoration: none; color: var(--color-ink-soft);
}
.mobile-link:hover { color: var(--color-accent); }

/* ------------------------------ hero -------------------------------- */
.hero {
  position: relative; overflow: hidden;
  padding-block: clamp(3rem, 7vw, 6rem);
  background:
    radial-gradient(90rem 40rem at 12% -12%, var(--color-accent-soft), transparent 62%),
    radial-gradient(60rem 32rem at 96% 8%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 60%);
}
.hero-inner { display: grid; gap: clamp(2rem, 4vw, 3.5rem); }
.hero-copy { max-width: 62ch; }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }
.hero-actions .btn { padding: .9rem 1.6rem; font-size: 1rem; }

.hero-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-4);
  margin-top: clamp(2rem, 4vw, 3rem); padding-top: var(--space-5);
  border-top: 1px solid var(--color-line);
}
.hero-stats li { display: flex; flex-direction: column; }
.hero-stats strong { font-family: var(--font-display); font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight: 600; letter-spacing: -.02em; color: var(--color-accent-ink); }
.hero-stats span { font-size: .82rem; color: var(--color-muted); }

.hero-panel {
  background: var(--color-surface); border: 1px solid var(--color-line);
  border-radius: var(--radius-lg); padding: var(--space-5); box-shadow: var(--shadow-3);
}
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); }
.panel-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; }
.panel-chip {
  font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  padding: .25rem .6rem; border-radius: var(--radius-pill);
  background: var(--color-accent-soft); color: var(--color-accent-ink);
}
.panel-list { display: flex; flex-direction: column; gap: var(--space-3); }
.panel-list li { display: flex; align-items: center; gap: var(--space-3); }
.panel-thumb {
  flex: none; width: 46px; height: 46px; display: grid; place-items: center;
  border-radius: var(--radius-sm); color: var(--g3);
  background: linear-gradient(150deg, var(--g1), var(--g2));
  box-shadow: var(--shadow-1);
}
.panel-thumb .icon { width: 22px; height: 22px; }
.panel-text { display: flex; flex-direction: column; min-width: 0; }
.panel-text strong { font-size: .9rem; font-weight: 600; }
.panel-text small { font-size: .78rem; color: var(--color-muted); }
.panel-link {
  display: inline-flex; align-items: center; gap: .4rem; margin-top: var(--space-5);
  font-size: .88rem; font-weight: 600; color: var(--color-accent); text-decoration: none;
}
.panel-link .icon { width: 16px; height: 16px; transition: transform var(--dur-2) var(--ease); }
.panel-link:hover .icon { transform: translateX(4px); }

/* --------------------------- breadcrumb ---------------------------- */
.breadcrumb { border-bottom: 1px solid var(--color-line); background: var(--color-surface); }
.crumb-list { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding-block: .7rem; font-size: .82rem; }
.crumb-list a { color: var(--color-muted); text-decoration: none; }
.crumb-list a:hover { color: var(--color-accent); text-decoration: underline; text-underline-offset: 3px; }
.crumb-sep { color: var(--color-line-strong); }
#crumb-current { color: var(--color-ink); font-weight: 500; }

/* ---------------------------- categories --------------------------- */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: var(--space-4); }
.cat {
  position: relative; overflow: hidden; text-align: left;
  display: flex; flex-direction: column; gap: var(--space-2);
  padding: var(--space-5); border-radius: var(--radius-md);
  border: 1px solid var(--color-line); background: var(--color-surface);
  cursor: pointer; font: inherit; color: inherit;
  transition: transform var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.cat::after {
  content: ''; position: absolute; inset: auto -30% -60% -30%; height: 120%;
  background: linear-gradient(160deg, color-mix(in srgb, var(--g1) 22%, transparent), transparent 70%);
  opacity: 0; transition: opacity var(--dur-3) var(--ease);
}
.cat:hover { transform: translateY(-4px); border-color: var(--color-accent); box-shadow: var(--shadow-2); }
.cat:hover::after { opacity: 1; }
.cat[aria-pressed='true'] { border-color: var(--color-accent); box-shadow: var(--shadow-2); }
.cat[aria-pressed='true'] .cat-count { background: var(--color-accent); color: var(--color-on-accent); }
.cat-art { position: relative; width: 44px; height: 44px; display: grid; place-items: center; border-radius: var(--radius-sm); color: var(--g3); background: linear-gradient(150deg, var(--g1), var(--g2)); }
.cat-art .icon { width: 22px; height: 22px; transition: transform var(--dur-2) var(--ease); }
.cat:hover .cat-art .icon { transform: scale(1.12) rotate(-4deg); }
.cat-name { font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; }
.cat-blurb { font-size: .82rem; color: var(--color-muted); }
.cat-count {
  align-self: flex-start; margin-top: var(--space-2);
  font-size: .72rem; font-weight: 700; padding: .18rem .55rem; border-radius: var(--radius-pill);
  background: var(--color-surface-2); color: var(--color-muted); border: 1px solid var(--color-line);
}

/* ----------------------------- toolbar ------------------------------ */
.toolbar {
  display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: center; justify-content: space-between;
  padding: var(--space-4); margin-bottom: var(--space-5);
  background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md);
}
.chips { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.chip {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .32rem .5rem .32rem .75rem; border-radius: var(--radius-pill);
  font-size: .82rem; font-weight: 600;
  background: var(--color-accent-soft); color: var(--color-accent-ink);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
}
.chip button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border: 0; border-radius: 50%; cursor: pointer;
  background: color-mix(in srgb, var(--color-accent) 22%, transparent); color: var(--color-accent-ink);
}
.chip button .icon { width: 11px; height: 11px; }
.chip button:hover { background: var(--color-accent); color: var(--color-on-accent); }
.chips-hint { font-size: .82rem; color: var(--color-muted); }
.toolbar-right { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); margin-left: auto; }
.field { display: inline-flex; align-items: center; gap: var(--space-2); }
.field-label { display: inline-flex; align-items: center; gap: .35rem; font-size: .82rem; font-weight: 600; color: var(--color-muted); }
.field-label .icon { width: 15px; height: 15px; }
.select {
  font: inherit; font-size: .88rem; font-weight: 500; color: var(--color-ink);
  padding: .5rem .7rem; border-radius: var(--radius-sm);
  border: 1px solid var(--color-line-strong); background: var(--color-surface); cursor: pointer;
  transition: border-color var(--dur-2) var(--ease);
}
.select:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }

/* ------------------------------ grid -------------------------------- */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: clamp(1rem, 2vw, 1.75rem); }
.grid-fallback {
  grid-column: 1 / -1; padding: var(--space-6); text-align: center;
  color: var(--color-muted); background: var(--color-surface);
  border: 1px dashed var(--color-line-strong); border-radius: var(--radius-md);
}

.card {
  display: flex; flex-direction: column;
  background: var(--color-surface); border: 1px solid var(--color-line);
  border-radius: var(--radius-md); overflow: hidden;
  transition: transform var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.card:hover { transform: translateY(-5px); border-color: var(--color-line-strong); box-shadow: var(--shadow-3); }

.card-art {
  position: relative; aspect-ratio: 4 / 3; display: grid; place-items: center;
  color: var(--g3);
  background:
    radial-gradient(120% 90% at 20% 12%, color-mix(in srgb, var(--g3) 32%, transparent), transparent 60%),
    repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 8px),
    linear-gradient(152deg, var(--g1), var(--g2));
  border-bottom: 1px solid var(--color-line);
}
.art-glyph { transition: transform var(--dur-3) var(--ease); }
.art-glyph .icon { width: 44px; height: 44px; filter: drop-shadow(0 4px 10px rgba(0,0,0,.28)); }
.card:hover .art-glyph { transform: translateY(-5px) scale(1.06); }

.badge {
  position: absolute; top: .7rem; left: .7rem;
  display: inline-flex; align-items: center; gap: .3rem;
  padding: .24rem .6rem; border-radius: var(--radius-pill);
  font-size: .68rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  background: var(--color-ink); color: var(--color-surface);
}
.badge-sale { background: var(--color-sale); color: #fff; }
.badge-new { background: var(--color-accent); color: var(--color-on-accent); }
.badge-best { background: var(--color-star); color: #fffaf0; }

.card-wish {
  position: absolute; top: .6rem; right: .6rem; width: 34px; height: 34px;
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  border-color: transparent; color: var(--color-ink-soft);
  backdrop-filter: blur(6px);
}
.card-wish:hover { background: var(--color-surface); }
.card-wish.is-on { color: var(--color-sale); border-color: var(--color-sale); }
.card-wish.is-on .icon { fill: currentColor; }
.card-wish.is-pop { animation: heartPop 420ms var(--ease); }

.card-quick {
  position: absolute; left: .6rem; right: .6rem; bottom: .6rem;
  display: flex; flex-direction: column; gap: .4rem;
  opacity: 0; transform: translateY(8px);
  transition: opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease);
}
.card:hover .card-quick, .card:focus-within .card-quick { opacity: 1; transform: translateY(0); }
.btn-quick {
  width: 100%; padding: .5rem .7rem; font-size: .82rem;
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  color: var(--color-ink); border: 1px solid var(--color-line); backdrop-filter: blur(6px);
}
.btn-quick:hover:not(:disabled) { background: var(--color-surface); border-color: var(--color-accent); color: var(--color-accent); }
.btn-quick-add { background: var(--color-accent); color: var(--color-on-accent); border-color: transparent; }
.btn-quick-add:hover:not(:disabled) { background: var(--color-accent-strong); color: var(--color-on-accent); }
@media (hover: none) { .card-quick { opacity: 1; transform: none; } }

.card-body { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-4); flex: 1; }
.card-cat { font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-muted); }
.card-title { font-family: var(--font-display); font-size: 1.06rem; font-weight: 600; letter-spacing: -.012em; }
.rate-row { display: flex; align-items: center; gap: .4rem; }
.stars { position: relative; display: inline-block; line-height: 0; }
.stars-base { display: flex; gap: 1px; color: var(--color-line-strong); }
.stars-fill { position: absolute; inset: 0; overflow: hidden; display: flex; gap: 1px; color: var(--color-star); }
.star { width: 13px; height: 13px; flex: none; }
.rate-num { font-size: .78rem; font-weight: 600; color: var(--color-ink-soft); }
.rate-count { font-size: .76rem; color: var(--color-muted); }
.price-row { display: flex; align-items: baseline; gap: .5rem; flex-wrap: wrap; margin-top: auto; padding-top: var(--space-2); }
.price-now { font-family: var(--font-display); font-size: 1.22rem; font-weight: 600; letter-spacing: -.02em; }
.price-was { font-size: .84rem; color: var(--color-muted); text-decoration: line-through; }
.stock { font-size: .76rem; font-weight: 600; }
.stock-ok { color: var(--color-ok); }
.stock-low { color: var(--color-warn); }
.stock-out { color: var(--color-sale); }
.card-add {
  width: 100%; margin-top: var(--space-2); padding: .58rem .8rem;
  font-size: .86rem; font-weight: 600; border-radius: var(--radius-sm);
  background: var(--color-surface); color: var(--color-ink); border: 1px solid var(--color-line-strong); cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease);
}
.card-add:hover:not(:disabled) { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-on-accent); }
.card-add:disabled { color: var(--color-muted); background: var(--color-surface-2); border-style: dashed; cursor: not-allowed; }

.empty-state {
  grid-column: 1 / -1; display: grid; place-items: center; gap: var(--space-3);
  padding: clamp(2.5rem, 6vw, 4.5rem) var(--space-4); text-align: center;
  background: var(--color-surface); border: 1px dashed var(--color-line-strong); border-radius: var(--radius-lg);
}
.empty-state .icon { width: 40px; height: 40px; color: var(--color-line-strong); }
.empty-state p { color: var(--color-muted); max-width: 42ch; font-size: .94rem; }

/* ---------------------------- values ------------------------------- */
.value-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-4); }
.value {
  padding: var(--space-5); border-radius: var(--radius-md);
  background: var(--color-surface-2); border: 1px solid var(--color-line);
  transition: transform var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.value:hover { transform: translateY(-3px); border-color: var(--color-accent); background: var(--color-surface); }
.value-icon {
  display: inline-grid; place-items: center; width: 42px; height: 42px; margin-bottom: var(--space-3);
  border-radius: var(--radius-sm); background: var(--color-accent-soft); color: var(--color-accent-ink);
}
.value-icon .icon { width: 21px; height: 21px; transition: transform var(--dur-2) var(--ease); }
.value:hover .value-icon .icon { transform: scale(1.1); }
.value h3 { margin-bottom: var(--space-2); }
.value p { font-size: .9rem; color: var(--color-muted); }

/* ----------------------------- rail -------------------------------- */
.rail {
  display: grid; grid-auto-flow: column; grid-auto-columns: minmax(158px, 1fr);
  gap: var(--space-3); overflow-x: auto; padding-bottom: var(--space-3); scrollbar-width: thin;
}
.rail-card {
  display: flex; flex-direction: column; gap: var(--space-2); padding: .7rem; text-align: left;
  background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-sm);
  cursor: pointer; font: inherit; color: inherit;
  transition: transform var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease);
}
.rail-card:hover { transform: translateY(-3px); border-color: var(--color-accent); }
.rail-art { aspect-ratio: 1 / 1; border-radius: var(--radius-xs); display: grid; place-items: center; color: var(--g3); background: linear-gradient(152deg, var(--g1), var(--g2)); }
.rail-art .icon { width: 26px; height: 26px; }
.rail-name { font-size: .84rem; font-weight: 600; line-height: 1.3; }
.rail-price { font-size: .8rem; color: var(--color-muted); }

/* --------------------------- testimonials -------------------------- */
.quote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: var(--space-4); }
.quote {
  position: relative; display: flex; flex-direction: column; gap: var(--space-4);
  padding: var(--space-6) var(--space-5) var(--space-5);
  background: var(--color-surface-2); border: 1px solid var(--color-line); border-radius: var(--radius-md);
}
.quote-mark { position: absolute; top: var(--space-4); right: var(--space-5); color: var(--color-accent); opacity: .32; }
.quote-mark .icon { width: 30px; height: 30px; }
.quote blockquote p { font-size: .98rem; color: var(--color-ink-soft); }
.quote figcaption { display: flex; flex-direction: column; margin-top: auto; padding-top: var(--space-4); border-top: 1px solid var(--color-line); }
.quote figcaption strong { font-size: .92rem; }
.quote figcaption span { font-size: .78rem; color: var(--color-muted); }

/* ----------------------------- promo ------------------------------- */
.promo { padding-block: clamp(2.5rem, 6vw, 4.5rem); background: var(--color-accent-ink); color: #d3ece1; }
@media (prefers-color-scheme: dark) { .promo { background: var(--color-surface); border-block: 1px solid var(--color-line); color: var(--color-ink); } }
.promo-inner { display: grid; gap: clamp(1.5rem, 3vw, 3rem); }
.promo-copy > p:not(.kicker) { color: inherit; opacity: .84; max-width: 52ch; margin-top: var(--space-3); }
.promo-card {
  align-self: center; padding: var(--space-5);
  background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md); box-shadow: var(--shadow-3);
}
.promo-card-title { font-family: var(--font-display); font-size: 1.08rem; font-weight: 600; color: var(--color-ink); margin-bottom: var(--space-3); }
.promo-form { display: flex; gap: var(--space-2); }
.promo-form .input { flex: 1; }
.code-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: var(--space-3); margin-top: var(--space-5); }
.code-list li { display: flex; align-items: center; gap: var(--space-3); padding: .6rem .8rem; border-radius: var(--radius-sm); background: rgba(255,255,255,.09); }
.code-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .82rem; font-weight: 700;
  padding: .2rem .5rem; border-radius: var(--radius-xs); background: rgba(255,255,255,.16);
}
.code-list span { font-size: .82rem; opacity: .9; }

/* ----------------------------- FAQ -------------------------------- */
.acc { border-top: 1px solid var(--color-line); }
.acc-item { border-bottom: 1px solid var(--color-line); }
.acc-item h3 { margin: 0; }
.acc-trigger {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-4) 0; background: transparent; border: 0; cursor: pointer;
  font-family: var(--font-display); font-size: clamp(1rem, 1.5vw, 1.14rem); font-weight: 600;
  color: var(--color-ink); text-align: left;
  transition: color var(--dur-2) var(--ease);
}
.acc-trigger:hover { color: var(--color-accent); }
.acc-chev { flex: none; width: 20px; height: 20px; color: var(--color-muted); transition: transform var(--dur-2) var(--ease); }
.acc-item.is-open .acc-chev { transform: rotate(180deg); color: var(--color-accent); }
.acc-panel { padding-bottom: var(--space-5); animation: fadeUp var(--dur-3) var(--ease) both; }
.acc-panel p { color: var(--color-muted); max-width: 68ch; }

/* --------------------------- CTA band ------------------------------ */
.cta-band { padding-block: clamp(2.5rem, 6vw, 4rem); background: var(--color-surface); border-top: 1px solid var(--color-line); }
.cta-inner { display: grid; gap: var(--space-4); }
.cta-inner h2 { margin-bottom: var(--space-2); }
.cta-inner > div > p { color: var(--color-muted); max-width: 52ch; }
.cta-form { display: flex; flex-wrap: wrap; gap: var(--space-2); max-width: 480px; }
.cta-form .input { flex: 1 1 240px; }

/* ---------------------------- footer ------------------------------- */
.site-footer { background: #0b2420; color: #cfe2dc; padding-top: clamp(2.5rem, 5vw, 4rem); }
@media (prefers-color-scheme: dark) { .site-footer { background: #070c0b; } }
.footer-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: var(--space-6); padding-bottom: var(--space-7); }
.footer-brand .brand-text { color: inherit; }
.footer-brand .brand-mark { color: #7fd0b8; }
.footer-brand p { margin-top: var(--space-3); font-size: .88rem; opacity: .74; max-width: 34ch; }
.socials { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.socials .icon-btn { color: inherit; border-color: rgba(255,255,255,.24); }
.socials .icon-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
.footer-h { font-family: var(--font-text); font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: var(--space-4); opacity: .82; }
.footer-col ul { display: flex; flex-direction: column; gap: .55rem; font-size: .88rem; }
.footer-col a { color: inherit; text-decoration: none; opacity: .8; transition: opacity var(--dur-2) var(--ease), color var(--dur-2) var(--ease); }
.footer-col a:hover { opacity: 1; color: #7fd0b8; }
.footer-contact li { opacity: .8; }
.footer-signup { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.footer-signup .input { flex: 1 1 auto; background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.28); color: inherit; }
.footer-signup .input::placeholder { color: rgba(255,255,255,.6); }
.footer-signup .input:focus { background: rgba(255,255,255,.12); border-color: #7fd0b8; box-shadow: 0 0 0 3px rgba(127,208,184,.22); }
.footer-signup .btn-quiet { color: #cfe2dc; border-color: rgba(255,255,255,.3); white-space: nowrap; }
.footer-signup .btn-quiet:hover { background: #7fd0b8; border-color: #7fd0b8; color: #08211d; }
.site-footer .form-msg { margin-top: .3rem; color: rgba(255,255,255,.66); }
.site-footer .form-msg.is-ok { color: #8fd9bd; }
.site-footer .form-msg.is-bad { color: #f0a99a; }
.footer-bottom {
  display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: space-between;
  padding-block: var(--space-4); border-top: 1px solid rgba(255,255,255,.16); font-size: .8rem;
}
.footer-bottom p { opacity: .72; }
.legal { display: flex; flex-wrap: wrap; gap: var(--space-4); }
.legal a { color: inherit; text-decoration: none; opacity: .8; }
.legal a:hover { opacity: 1; color: #7fd0b8; }

/* ---------------------------- to top ------------------------------- */
.to-top {
  position: fixed; right: clamp(1rem, 3vw, 2rem); bottom: clamp(1rem, 3vw, 2rem); z-index: 880;
  width: 46px; height: 46px; display: grid; place-items: center;
  border-radius: 50%; cursor: pointer;
  background: var(--color-accent); color: var(--color-on-accent); border: 0; box-shadow: var(--shadow-3);
  animation: popIn var(--dur-2) var(--ease) both;
}
.to-top:hover { background: var(--color-accent-strong); transform: translateY(-2px); }
.to-top .icon { width: 20px; height: 20px; }

/* ---------------------------- toasts ------------------------------- */
.toasts {
  position: fixed; left: 50%; bottom: clamp(1rem, 4vw, 2.5rem); z-index: 1300;
  transform: translateX(-50%);
  display: flex; flex-direction: column; gap: var(--space-2); align-items: center;
  pointer-events: none; width: min(92vw, 420px);
}
.toast {
  display: flex; align-items: center; gap: var(--space-2);
  padding: .65rem .95rem; border-radius: var(--radius-pill);
  font-size: .87rem; font-weight: 500;
  color: var(--color-ink); background: var(--color-surface);
  border: 1px solid var(--color-line); box-shadow: var(--shadow-3);
  animation: toastIn var(--dur-3) var(--ease) both;
}
.toast.is-out { animation: toastOut var(--dur-2) var(--ease) both; }
.toast .icon { width: 17px; height: 17px; flex: none; color: var(--color-ok); }
.toast.is-bad .icon { color: var(--color-sale); }

/* ----------------------------- scrim ------------------------------- */
.scrim {
  position: fixed; inset: 0; z-index: 960;
  background: var(--color-scrim);
  backdrop-filter: blur(2px);
  animation: fadeIn var(--dur-2) var(--ease) both;
}

/* --------------------------- cart drawer --------------------------- */
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 980;
  width: min(94vw, 428px);
  display: flex; flex-direction: column;
  background: var(--color-surface); border-left: 1px solid var(--color-line);
  box-shadow: var(--shadow-4);
  animation: drawerIn var(--dur-3) var(--ease) both;
}
.drawer-head {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-line);
}
.drawer-title { font-size: 1.2rem; }
.ship-meter { padding: var(--space-3) var(--space-4); background: var(--color-accent-soft); border-bottom: 1px solid var(--color-line); }
.ship-meter-text { font-size: .8rem; font-weight: 600; color: var(--color-accent-ink); margin-bottom: .4rem; }
.meter { height: 6px; border-radius: var(--radius-pill); background: color-mix(in srgb, var(--color-accent) 20%, transparent); overflow: hidden; }
.meter-fill { display: block; height: 100%; width: 0; border-radius: inherit; background: var(--color-accent); transition: width var(--dur-3) var(--ease); }

.drawer-body { flex: 1; overflow-y: auto; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }

.line {
  display: grid; grid-template-columns: 68px 1fr auto; gap: var(--space-3);
  padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-line);
  animation: fadeUp var(--dur-2) var(--ease) both;
}
.line:last-child { border-bottom: 0; padding-bottom: 0; }
.line-art { width: 68px; height: 68px; display: grid; place-items: center; border-radius: var(--radius-sm); color: var(--g3); background: linear-gradient(152deg, var(--g1), var(--g2)); }
.line-art .icon { width: 26px; height: 26px; }
.line-main { min-width: 0; display: flex; flex-direction: column; gap: .3rem; }
.line-name { font-size: .9rem; font-weight: 600; line-height: 1.3; }
.line-meta { font-size: .76rem; color: var(--color-muted); }
.line-controls { display: flex; align-items: center; gap: .35rem; margin-top: .25rem; }
.stepper { display: inline-flex; align-items: center; border: 1px solid var(--color-line-strong); border-radius: var(--radius-sm); overflow: hidden; }
.stepper button {
  width: 28px; height: 28px; display: grid; place-items: center; padding: 0;
  background: var(--color-surface); color: var(--color-ink-soft); border: 0; cursor: pointer;
  transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease);
}
.stepper button:hover:not(:disabled) { background: var(--color-accent); color: var(--color-on-accent); }
.stepper button:disabled { opacity: .4; cursor: not-allowed; }
.stepper .icon { width: 13px; height: 13px; }
.stepper output { min-width: 30px; text-align: center; font-size: .85rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.line-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: .3rem; }
.line-total { font-family: var(--font-display); font-size: 1rem; font-weight: 600; white-space: nowrap; }
.line-remove { width: 28px; height: 28px; border: 0; background: transparent; color: var(--color-muted); cursor: pointer; border-radius: var(--radius-xs); }
.line-remove:hover { color: var(--color-sale); background: var(--color-sale-soft); }
.line-remove .icon { width: 15px; height: 15px; }

.cart-empty { display: grid; place-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) var(--space-4); margin: auto 0; }
.cart-empty .icon { width: 44px; height: 44px; color: var(--color-line-strong); }
.cart-empty p { font-size: .88rem; color: var(--color-muted); max-width: 30ch; }

.drawer-foot { padding: var(--space-4); border-top: 1px solid var(--color-line); background: var(--color-surface-2); }
.promo-inline { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.promo-inline .input { flex: 1 1 130px; }
.drawer-foot .form-msg { margin-top: .3rem; }
.totals { display: flex; flex-direction: column; gap: .4rem; margin-block: var(--space-3); font-size: .88rem; }
.totals > div { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.totals dt { color: var(--color-muted); }
.totals dd { font-variant-numeric: tabular-nums; font-weight: 600; }
.totals-discount dt, .totals-discount dd { color: var(--color-ok); }
.totals-grand { padding-top: var(--space-3); border-top: 1px solid var(--color-line-strong); font-size: 1.05rem; }
.totals-grand dt { color: var(--color-ink); font-weight: 700; }
.totals-grand dd { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; color: var(--color-accent-ink); }
.drawer-note { display: flex; align-items: center; gap: .4rem; justify-content: center; margin-top: var(--space-3); font-size: .76rem; color: var(--color-muted); }
.drawer-note .icon { width: 14px; height: 14px; }

/* ---------------------------- modal -------------------------------- */
.modal {
  position: fixed; inset: 0; z-index: 1000;
  display: grid; place-items: center; padding: clamp(1rem, 4vw, 2.5rem);
  overflow-y: auto;
}
.modal-panel {
  position: relative; width: min(100%, 940px);
  background: var(--color-surface); border: 1px solid var(--color-line);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-4);
  animation: modalIn var(--dur-3) var(--ease) both;
  margin: auto;
}
.modal-close { position: absolute; top: .75rem; right: .75rem; z-index: 2; background: color-mix(in srgb, var(--color-surface) 88%, transparent); backdrop-filter: blur(6px); }
.modal-body { display: grid; }
.md-art {
  position: relative; min-height: 200px; display: grid; place-items: center;
  color: var(--g3);
  background:
    radial-gradient(110% 80% at 22% 14%, color-mix(in srgb, var(--g3) 28%, transparent), transparent 62%),
    repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 9px),
    linear-gradient(152deg, var(--g1), var(--g2));
}
.md-art .icon { width: 76px; height: 76px; filter: drop-shadow(0 8px 18px rgba(0,0,0,.3)); }
.md-info { padding: clamp(1.25rem, 3vw, 2rem); display: flex; flex-direction: column; gap: var(--space-3); }
.md-eyebrow { display: flex; align-items: center; gap: .5rem; font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-muted); }
.md-price { display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap; }
.md-price .price-now { font-size: 1.7rem; }
.md-blurb { color: var(--color-muted); font-size: .95rem; }
.md-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(148px, 1fr)); gap: var(--space-3); margin-top: var(--space-2); }
.md-spec { padding: .7rem .8rem; background: var(--color-surface-2); border: 1px solid var(--color-line); border-radius: var(--radius-sm); }
.md-spec dt { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--color-muted); }
.md-spec dd { font-size: .9rem; font-weight: 600; }
.md-bars { display: flex; flex-direction: column; gap: .35rem; margin-top: var(--space-2); }
.md-bar { display: grid; grid-template-columns: 44px 1fr 34px; gap: .5rem; align-items: center; font-size: .78rem; color: var(--color-muted); }
.md-bar span:nth-child(2) { height: 7px; border-radius: var(--radius-pill); background: var(--color-line); overflow: hidden; }
.md-bar i { display: block; height: 100%; border-radius: inherit; background: var(--color-star); }
.md-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); margin-top: var(--space-3); }
.md-actions .stepper { height: 44px; }
.md-actions .stepper button { width: 40px; height: 44px; }
.md-actions .stepper output { min-width: 40px; font-size: 1rem; }
.md-actions .btn-primary { padding-inline: 1.6rem; }
.md-note { font-size: .8rem; color: var(--color-muted); }

/* --------------------------- fly ghost ----------------------------- */
.fly-layer { position: fixed; inset: 0; z-index: 1250; pointer-events: none; }
.fly-ghost {
  position: fixed; width: 46px; height: 46px; border-radius: 50%;
  border: 2px solid var(--color-surface);
  box-shadow: var(--shadow-3);
  will-change: transform, opacity;
}

/* ---------------------------- reveal ------------------------------- */
[data-reveal] {
  opacity: 0; transform: translateY(18px);
  transition: opacity var(--dur-3) var(--ease), transform var(--dur-3) var(--ease);
  transition-delay: var(--delay, 0ms);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------------------------- keyframes --------------------------- */
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: scale(1); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes toastIn { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes toastOut { to { opacity: 0; transform: translateY(10px) scale(.97); } }
@keyframes drawerIn { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes modalIn { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes badgePop { 0% { transform: scale(1); } 40% { transform: scale(1.45); } 100% { transform: scale(1); } }
@keyframes heartPop { 0% { transform: scale(1); } 45% { transform: scale(1.32); } 100% { transform: scale(1); } }

/* --------------------------- responsive --------------------------- */
@media (min-width: 620px) { .btn-cart-label { display: inline; } }

@media (min-width: 900px) {
  .nav { display: flex; }
  .nav-toggle { display: none; }
  .hero-inner { grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr); align-items: center; }
  .promo-inner { grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); }
  .cta-inner { grid-template-columns: minmax(0, 1fr) minmax(300px, .8fr); align-items: center; }
  .cta-inner .form-msg { grid-column: 2; }
  .modal-body { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); }
}

@media (min-width: 1080px) {
  .footer-top { grid-template-columns: minmax(240px, 1.3fr) repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 899px) {
  .search { order: 5; flex-basis: 100%; max-width: none; }
  .header-inner { flex-wrap: wrap; padding-bottom: var(--space-3); row-gap: var(--space-3); }
}

@media (max-width: 560px) {
  body { font-size: 15.5px; }
  .hero-actions .btn { flex: 1 1 100%; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar-right { margin-left: 0; justify-content: space-between; }
  .cta-form .btn, .promo-form .btn { flex: 1 1 100%; }
  .line { grid-template-columns: 56px 1fr; }
  .line-right { grid-column: 2; flex-direction: row; align-items: center; justify-content: space-between; }
  .line-art { width: 56px; height: 56px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1; transform: none; }
}
`,

  javascript: `'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STORE_KEY = 'northport.cart.v1';
  var FREE_SHIP_AT = 120;
  var FLAT_SHIP = 8.95;
  var TAX_RATE = 0.0825;
  var BADGE_TEXT = { sale: 'Sale', new: 'New', best: 'Bestseller' };
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function money(n) {
    var v = round2(n);
    var whole = String(Math.floor(v));
    var cents = v - Math.floor(v);
    whole = whole.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    return '$' + whole + (cents > 0 ? cents.toFixed(2).slice(1) : '.00');
  }
  function setText(sel, value) { var el = $(sel); if (el) { el.textContent = value; } }
  function show(el, on) { if (el) { el.hidden = !on; } }
  function icon(id, size) {
    var s = size || 20;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-' + id + '"></use></svg>';
  }
  function starRow(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<svg class="star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-star"></use></svg>';
    }
    return out;
  }
  function stars(rating, reviews) {
    var pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    return '<span class="stars" role="img" aria-label="Rated ' + rating.toFixed(1) + ' out of 5 from ' +
      reviews.toLocaleString('en-US') + ' reviews"><span class="stars-base">' + starRow(5) +
      '</span><span class="stars-fill" style="width:' + pct.toFixed(2) + '%">' + starRow(5) + '</span></span>';
  }

  /* =============================== data =============================== */
  var CATEGORIES = [
    { id: 'audio', name: 'Audio', blurb: 'Earphones and call gear', icon: 'headset', g1: '#2a6b5f', g2: '#0d2a25', g3: '#8fd9c4' },
    { id: 'workspace', name: 'Workspace', blurb: 'Desk kit that outlasts', icon: 'cpu', g1: '#3b5a86', g2: '#111d33', g3: '#a9c8f0' },
    { id: 'lighting', name: 'Lighting', blurb: 'Warm, dimmable, repairable', icon: 'sparkles', g1: '#8a6420', g2: '#2c1f08', g3: '#f2d79b' },
    { id: 'travel', name: 'Travel', blurb: 'Carry-on friendly', icon: 'layers', g1: '#2f6f8a', g2: '#0f2836', g3: '#a5daee' },
    { id: 'kitchen', name: 'Kitchen', blurb: 'Pour-over and flask', icon: 'cup', g1: '#8a5a2b', g2: '#2a190b', g3: '#f0c99a' },
    { id: 'apparel', name: 'Apparel', blurb: 'Merino and outerwear', icon: 'shirt', g1: '#6b4a86', g2: '#221533', g3: '#d8c2ec' }
  ];

  var PRODUCTS = [
    { id: 'sable-earbuds', name: 'Sable Wireless Earbuds', cat: 'audio', price: 129, was: 159, rating: 4.4, reviews: 1304, stock: 23, added: '2026-03-11', badge: 'sale', icon: 'headset',
      blurb: 'Hybrid active noise cancelling, a 38-hour case and six silicone tips in the box. IPX5, so a Portland winter is fine.',
      g1: '#20655a', g2: '#0c2620', g3: '#8fd9c4', tags: 'earbuds anc bluetooth audio headset call',
      specs: { Driver: '11mm dual', Battery: '38h with case', Weight: '52g', Warranty: '2 years' } },
    { id: 'lumen-camera', name: 'Lumen Conference Camera 4K', cat: 'audio', price: 199, was: 0, rating: 4.8, reviews: 486, stock: 12, added: '2026-05-02', badge: '', icon: 'eye',
      blurb: 'Auto-frames one speaker at a time, lifts a dim room, and streams over USB-C without a dongle.',
      g1: '#2f6b52', g2: '#0d2419', g3: '#a8ddc0', tags: 'camera webcam 4k conference meeting streaming',
      specs: { Sensor: '4K CMOS', Mount: 'Laptop clip or tripod', Weight: '310g', Warranty: '2 years' } },
    { id: 'cadence-kb', name: 'Cadence 65 Mechanical Keyboard', cat: 'workspace', price: 219, was: 0, rating: 4.8, reviews: 642, stock: 7, added: '2026-01-19', badge: 'best', icon: 'cpu',
      blurb: 'Gasket-mounted 65% with hot-swap sockets and three layers of foam. Linear, tactile or silent.',
      g1: '#33547f', g2: '#101c30', g3: '#aac8f0', tags: 'keyboard mechanical typing desk switches office',
      specs: { Layout: '68 keys, 65%', Switches: 'Hot-swap, 5-pin', Weight: '840g', Warranty: '2 years' } },
    { id: 'field-notes', name: 'Field Notes A5 Hardcover', cat: 'workspace', price: 28, was: 36, rating: 4.2, reviews: 511, stock: 3, added: '2026-06-27', badge: '', icon: 'book',
      blurb: 'Thread-sewn so it opens flat, 160 pages of 100gsm cream paper that will not let a fountain pen bleed through.',
      g1: '#7a4a2c', g2: '#2a160c', g3: '#f2cdA6', tags: 'notebook journal paper writing hardcover a5',
      specs: { Size: 'A5, 148x210mm', Pages: '160, 100gsm', Binding: 'Thread-sewn', Warranty: 'Replace it' } },
    { id: 'aurora-lamp', name: 'Aurora Desk Lamp', cat: 'lighting', price: 148, was: 189, rating: 4.5, reviews: 732, stock: 14, added: '2026-02-08', badge: 'sale', icon: 'sparkles',
      blurb: '2700K to 5000K with no visible flicker, a counterweighted arm, and a published diagram for replacing the driver.',
      g1: '#8a6420', g2: '#2b1e08', g3: '#f4daa0', tags: 'lamp light desk dimmable warm led study',
      specs: { Colour: '2700K-5000K', Output: '620 lumens', Reach: '52cm arm', Warranty: '5 years' } },
    { id: 'halo-projector', name: 'Halo Mini Projector', cat: 'lighting', price: 329, was: 0, rating: 4.7, reviews: 256, stock: 0, added: '2026-08-14', badge: 'new', icon: 'play', restock: '4 Oct 2026',
      blurb: 'A 300-lumen DLP cube that fits in a jacket pocket, with HDMI and USB-C and a real tripod thread.',
      g1: '#7b3f5b', g2: '#2a1020', g3: '#f2bcd6', tags: 'projector dlp travel movie portable screen',
      specs: { Brightness: '300 ANSI lumens', Throw: '1.2:1 ratio', Weight: '480g', Warranty: '2 years' } },
    { id: 'traverse-pack', name: 'Traverse 22L Daypack', cat: 'travel', price: 98, was: 0, rating: 4.6, reviews: 387, stock: 19, added: '2026-04-21', badge: '', icon: 'layers',
      blurb: 'Carry-on compliant at 22 litres, with a clamshell opening and a laptop sleeve that actually floats.',
      g1: '#2f6f8a', g2: '#0f2836', g3: '#a5daee', tags: 'backpack bag travel day rucksack carry on',
      specs: { Volume: '22 litres', Weight: '780g', Fabric: 'Recycled 420D', Warranty: 'Lifetime' } },
    { id: 'driftway-bank', name: 'Driftway 20K Power Bank', cat: 'travel', price: 59, was: 74, rating: 4.5, reviews: 964, stock: 25, added: '2026-07-30', badge: 'sale', icon: 'zap',
      blurb: 'Three USB-C ports, 65W passthrough charging, and an honest 20,000mAh rating measured at the cells.',
      g1: '#7d6a1e', g2: '#2a2407', g3: '#f0e19a', tags: 'power bank battery charger usb travel electricity',
      specs: { Capacity: '20,000mAh', Ports: '3x USB-C, 1x USB-A', Weight: '430g', Warranty: '18 months' } },
    { id: 'ember-flask', name: 'Ember 750ml Insulated Flask', cat: 'kitchen', price: 42, was: 0, rating: 4.5, reviews: 869, stock: 41, added: '2026-01-08', badge: '', icon: 'droplet',
      blurb: 'Holds heat for 18 hours and cold for 32, with a lid that seals by quarter turn and comes apart for cleaning.',
      g1: '#8a5a2b', g2: '#2a190b', g3: '#f0c99a', tags: 'flask bottle water insulated thermos kitchen drink',
      specs: { Volume: '750ml', Hot: '18 hours', Cold: '32 hours', Warranty: 'Lifetime' } },
    { id: 'kiln-pourover', name: 'Kiln Ceramic Pour-Over Set', cat: 'kitchen', price: 76, was: 0, rating: 4.7, reviews: 152, stock: 16, added: '2026-09-01', badge: 'new', icon: 'cup',
      blurb: 'Stoneware dripper, 600ml server and a walnut collar, glazed in a speckled clay from a kiln outside Lisbon.',
      g1: '#8a3f3f', g2: '#2c1010', g3: '#f2c2bd', tags: 'coffee pour over ceramic dripper kitchen brewing',
      specs: { Dripper: 'Stoneware, 60 degree', Server: '600ml', Filter: '02 paper, 40 included', Warranty: '2 years' } },
    { id: 'ridge-overshirt', name: 'Ridge Wool Overshirt', cat: 'apparel', price: 164, was: 0, rating: 4.9, reviews: 233, stock: 11, added: '2026-05-26', badge: 'best', icon: 'shirt',
      blurb: 'A brushed lambswool overshirt cut long enough to be a light jacket. Horn buttons, corozo, no plastic.',
      g1: '#5c4a86', g2: '#1c1530', g3: '#d5c6ef', tags: 'overshirt wool jacket clothing merino coat',
      specs: { Fabric: '380g lambswool', Sizes: 'XS to XXL', Buttons: 'Horn, corozo', Care: 'Dry clean or cold wash' } },
    { id: 'summit-beanie', name: 'Summit Merino Beanie', cat: 'apparel', price: 36, was: 0, rating: 4.3, reviews: 742, stock: 28, added: '2026-08-02', badge: '', icon: 'tag',
      blurb: 'Extra-fine 19.5-micron merino that does not itch, knitted in a single piece with no seam to rub your forehead.',
      g1: '#6b4a5e', g2: '#241323', g3: '#e5c4d3', tags: 'beanie hat merino wool winter clothing knit',
      specs: { Yarn: '19.5 micron merino', 'One size': 'Fits 54-60cm', Weight: '58g', Care: 'Hand wash, dry flat' } }
  ];

  var PROMOS = {
    NORTH10: { code: 'NORTH10', kind: 'pct', value: 10, label: '10% off the whole order' },
    WELCOME15: { code: 'WELCOME15', kind: 'pct', value: 15, min: 150, label: '15% off orders over $150' },
    LIGHTNING20: { code: 'LIGHTNING20', kind: 'pct', value: 20, cat: 'lighting', label: '20% off the lighting shelf' },
    FREESHIP: { code: 'FREESHIP', kind: 'ship', label: 'free shipping on any order' }
  };

  /* ============================== state ============================== */
  var state = { cart: {}, wish: [], viewed: [], promo: null, cat: 'all', query: '', wishOnly: false, sort: 'featured' };

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) { return PRODUCTS[i]; } }
    return null;
  }
  function catName(id) {
    for (var i = 0; i < CATEGORIES.length; i++) { if (CATEGORIES[i].id === id) { return CATEGORIES[i].name; } }
    return 'All products';
  }
  function catCount(id) {
    var n = 0;
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].cat === id) { n++; } }
    return n;
  }
  function isWished(id) { return state.wish.indexOf(id) >= 0; }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        cart: state.cart, wish: state.wish, promo: state.promo, viewed: state.viewed
      }));
    } catch (err) { /* storage blocked — the cart simply will not persist */ }
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (err) { return; }
    if (!raw) { return; }
    var data;
    try { data = JSON.parse(raw); } catch (err) { return; }
    if (!data || typeof data !== 'object') { return; }
    var k;
    if (data.cart && typeof data.cart === 'object') {
      for (k in data.cart) {
        if (!Object.prototype.hasOwnProperty.call(data.cart, k)) { continue; }
        var p0 = findProduct(k);
        var q = parseInt(data.cart[k], 10);
        if (p0 && q > 0) {
          var capped = Math.min(p0.stock, q);
          if (capped > 0) { state.cart[k] = capped; }
        }
      }
    }
    if (Object.prototype.toString.call(data.wish) === '[object Array]') {
      state.wish = data.wish.filter(function (id) { return !!findProduct(id); }).slice(0, 24);
    }
    if (Object.prototype.toString.call(data.viewed) === '[object Array]') {
      state.viewed = data.viewed.filter(function (id) { return !!findProduct(id); }).slice(0, 8);
    }
    if (data.promo && PROMOS[data.promo]) { state.promo = data.promo; }
  }

  /* =============================== toast ============================= */
  function toast(message, kind) {
    var host = $('#toasts');
    if (!host) { return; }
    var el = document.createElement('div');
    el.className = 'toast' + (kind === 'bad' ? ' is-bad' : '');
    el.innerHTML = icon(kind === 'bad' ? 'alert' : 'check', 17) + '<span>' + esc(message) + '</span>';
    host.appendChild(el);
    setTimeout(function () {
      el.className += ' is-out';
      setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 300);
    }, 2800);
  }
  function setFormMsg(el, message, kind) {
    if (!el) { return; }
    el.textContent = message;
    el.className = 'form-msg' + (kind ? ' is-' + kind : '');
  }

  /* =============================== reveal ============================ */
  var revealObserver = null;
  function revealScan(root) {
    var items = $$('[data-reveal]', root || document);
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0.06 });
    }
    items.forEach(function (el) {
      if (!el.classList.contains('is-visible')) { revealObserver.observe(el); }
    });
  }

  function runCounters(root) {
    $$('[data-count]', root || document).forEach(function (el) {
      if (el.getAttribute('data-counted') === '1') { return; }
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) { return; }
      var dec = parseInt(el.getAttribute('data-count-dec') || '0', 10);
      el.setAttribute('data-counted', '1');
      if (reduce) { el.textContent = dec ? target.toFixed(dec) : target.toLocaleString('en-US'); return; }
      var started = null;
      function step(now) {
        if (started === null) { started = now; }
        var t = Math.min(1, (now - started) / 900);
        var eased = 1 - Math.pow(1 - t, 3);
        var v = target * eased;
        el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
        if (t < 1) { requestAnimationFrame(step); }
        else { el.textContent = dec ? target.toFixed(dec) : target.toLocaleString('en-US'); }
      }
      requestAnimationFrame(step);
    });
  }

  /* ============================ navigation =========================== */
  function smoothJump(target) {
    if (!target) { return; }
    try {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } catch (err) {
      target.scrollIntoView(true);
    }
    if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
    try { target.focus({ preventScroll: true }); } catch (err) { try { target.focus(); } catch (err2) { /* noop */ } }
  }

  var mobileNav = $('#mobile-nav');
  var navToggle = $('#nav-toggle');
  function closeMobileNav() {
    show(mobileNav, false);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      show(mobileNav, willOpen);
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
      if (willOpen) { var first = $('.mobile-link', mobileNav); if (first) { first.focus(); } }
    });
  }

  var header = $('#site-header');
  var toTop = $('#to-top');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (header) { header.classList.toggle('is-scrolled', y > 8); }
    show(toTop, y > 640);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toTop) {
    toTop.addEventListener('click', function () { smoothJump($('#top')); });
  }

  /* ============================ categories =========================== */
  function renderCategories() {
    var host = $('#cat-grid');
    if (!host) { return; }
    var html = '';
    html += catButton({ id: 'all', name: 'All products', blurb: 'The whole catalogue', icon: 'package', g1: '#2a6b5f', g2: '#0d2a25', g3: '#8fd9c4' }, PRODUCTS.length);
    CATEGORIES.forEach(function (c) { html += catButton(c, catCount(c.id)); });
    host.innerHTML = html;
  }
  function catButton(c, count) {
    var on = state.cat === c.id;
    return '<button type="button" class="cat" data-act="cat" data-id="' + c.id + '" aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' style="--g1:' + c.g1 + ';--g2:' + c.g2 + ';--g3:' + c.g3 + '">' +
      '<span class="cat-art" aria-hidden="true">' + icon(c.icon, 22) + '</span>' +
      '<span class="cat-name">' + esc(c.name) + '</span>' +
      '<span class="cat-blurb">' + esc(c.blurb) + '</span>' +
      '<span class="cat-count">' + count + ' product' + (count === 1 ? '' : 's') + '</span>' +
      '</button>';
  }
  function setCategory(id) {
    state.cat = CATEGORIES.some(function (c) { return c.id === id; }) || id === 'all' ? id : 'all';
    $$('#cat-grid .cat').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-id') === state.cat ? 'true' : 'false');
    });
    setText('#crumb-current', state.cat === 'all' ? 'All products' : catName(state.cat));
    renderChips();
    renderGrid();
  }

  /* ============================== grid ============================== */
  var SORTS = {
    'price-asc': function (a, b) { return a.price - b.price; },
    'price-desc': function (a, b) { return b.price - a.price; },
    'rating': function (a, b) { return (b.rating - a.rating) || (b.reviews - a.reviews); },
    'newest': function (a, b) { return a.added < b.added ? 1 : (a.added > b.added ? -1 : 0); }
  };

  function filtered() {
    var q = state.query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (state.cat !== 'all' && p.cat !== state.cat) { return false; }
      if (state.wishOnly && !isWished(p.id)) { return false; }
      if (!q) { return true; }
      var hay = (p.name + ' ' + catName(p.cat) + ' ' + p.blurb + ' ' + p.tags).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    if (SORTS[state.sort]) { list.sort(SORTS[state.sort]); }
    return list;
  }

  function stockLabel(p) {
    if (p.stock <= 0) { return 'Sold out — back ' + (p.restock || 'next batch'); }
    if (p.stock <= 5) { return 'Only ' + p.stock + ' left'; }
    return p.stock + ' in stock';
  }
  function stockClass(p) {
    if (p.stock <= 0) { return 'stock-out'; }
    if (p.stock <= 5) { return 'stock-low'; }
    return 'stock-ok';
  }
  function badgeHTML(p) {
    if (!p.badge) { return ''; }
    var cls = p.badge === 'sale' ? 'badge badge-sale' : (p.badge === 'new' ? 'badge badge-new' : 'badge badge-best');
    return '<span class="' + cls + '">' + BADGE_TEXT[p.badge] + '</span>';
  }

  function cardHTML(p, i) {
    var wished = isWished(p.id);
    var canBuy = p.stock > 0;
    var artStyle = '--g1:' + p.g1 + ';--g2:' + p.g2 + ';--g3:' + p.g3;
    return '<article class="card" data-id="' + p.id + '" data-reveal style="--delay:' + ((i % 4) * 70) + 'ms">' +
      '<div class="card-art" style="' + artStyle + '">' +
        badgeHTML(p) +
        '<span class="art-glyph" aria-hidden="true">' + icon(p.icon, 44) + '</span>' +
        '<button type="button" class="icon-btn card-wish' + (wished ? ' is-on' : '') + '" data-act="wish" data-id="' + p.id + '"' +
          ' aria-pressed="' + (wished ? 'true' : 'false') + '"' +
          ' aria-label="' + (wished ? 'Remove ' : 'Save ') + esc(p.name) + (wished ? ' from' : ' to') + ' your wishlist">' + icon('heart', 18) + '</button>' +
        '<div class="card-quick">' +
          '<button type="button" class="btn btn-quick" data-act="view" data-id="' + p.id + '">Quick view</button>' +
          '<button type="button" class="btn btn-quick btn-quick-add" data-act="add" data-id="' + p.id + '"' + (canBuy ? '' : ' disabled') + '>' +
            (canBuy ? 'Add to cart' : 'Sold out') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card-body">' +
        '<p class="card-cat">' + esc(catName(p.cat)) + '</p>' +
        '<h3 class="card-title">' + esc(p.name) + '</h3>' +
        '<div class="rate-row">' + stars(p.rating, p.reviews) +
          '<span class="rate-num">' + p.rating.toFixed(1) + '</span>' +
          '<span class="rate-count">(' + p.reviews.toLocaleString('en-US') + ')</span></div>' +
        '<p class="price-row"><span class="price-now">' + money(p.price) + '</span>' +
          (p.was ? '<s class="price-was">' + money(p.was) + '</s>' : '') + '</p>' +
        '<p class="stock ' + stockClass(p) + '">' + stockLabel(p) + '</p>' +
        '<button type="button" class="card-add" data-act="add" data-id="' + p.id + '"' + (canBuy ? '' : ' disabled') + '>' +
          (canBuy ? 'Add to cart' : 'Out of stock') + '</button>' +
      '</div>' +
    '</article>';
  }

  function emptyGridHTML() {
    if (state.wishOnly && !state.wish.length) {
      return '<div class="empty-state">' + icon('heart', 40) + '<h3>Your wishlist is empty</h3>' +
        '<p>Tap the heart on any product to keep it here. Saved items stay in this browser.</p>' +
        '<button type="button" class="btn btn-primary" data-act="reset">Browse the catalogue</button></div>';
    }
    return '<div class="empty-state">' + icon('search', 40) + '<h3>Nothing matches that combination</h3>' +
      '<p>Try a shorter search term, or clear the filters and start again from all twelve products.</p>' +
      '<button type="button" class="btn btn-primary" data-act="reset">Clear filters</button></div>';
  }

  function renderGrid() {
    var host = $('#grid');
    if (!host) { return; }
    var list = filtered();
    host.innerHTML = list.length ? list.map(cardHTML).join('') : emptyGridHTML();
    setText('#result-count', 'Showing ' + list.length + ' of ' + PRODUCTS.length + ' products');
    revealScan(host);
  }

  function renderChips() {
    var host = $('#chips');
    if (!host) { return; }
    var bits = [];
    if (state.cat !== 'all') {
      var cn = catName(state.cat);
      bits.push('<span class="chip">' + esc(cn) + '<button type="button" data-act="chip-cat" aria-label="Remove the ' + esc(cn) + ' filter">' + icon('x', 11) + '</button></span>');
    }
    if (state.query.trim()) {
      bits.push('<span class="chip">' + esc(state.query.trim()) + '<button type="button" data-act="chip-q" aria-label="Clear the search term">' + icon('x', 11) + '</button></span>');
    }
    if (state.wishOnly) {
      bits.push('<span class="chip">Wishlist only<button type="button" data-act="chip-wish" aria-label="Stop filtering by wishlist">' + icon('x', 11) + '</button></span>');
    }
    if (!bits.length) {
      bits.push('<span class="chips-hint">No filters applied &mdash; showing the whole catalogue.</span>');
    }
    host.innerHTML = bits.join('');
    show($('#reset-filters'), bits.length > 1 || state.cat !== 'all' || !!state.query.trim() || state.wishOnly);
  }

  /* =============================== cart ============================== */
  function cartCount() {
    var n = 0;
    for (var k in state.cart) {
      if (Object.prototype.hasOwnProperty.call(state.cart, k)) { n += state.cart[k]; }
    }
    return n;
  }
  function cartLines() {
    var out = [];
    for (var k in state.cart) {
      if (!Object.prototype.hasOwnProperty.call(state.cart, k)) { continue; }
      var p = findProduct(k);
      if (!p) { continue; }
      var q = state.cart[k];
      out.push({ p: p, qty: q, line: round2(p.price * q) });
    }
    return out;
  }
  function totals() {
    var lines = cartLines();
    var sub = 0;
    lines.forEach(function (l) { sub += l.line; });
    sub = round2(sub);
    var promo = state.promo ? PROMOS[state.promo] : null;
    var discount = 0;
    var label = 'Discount';
    if (promo && promo.kind === 'pct') {
      var base = sub;
      if (promo.cat) {
        base = 0;
        lines.forEach(function (l) { if (l.p.cat === promo.cat) { base += l.line; } });
      }
      if (base > 0) { discount = round2(base * promo.value / 100); }
      label = promo.cat === 'lighting' ? 'Lighting discount' : promo.code + ' discount';
    }
    var net = round2(Math.max(0, sub - discount));
    var ship = 0;
    if (net > 0) { ship = net >= FREE_SHIP_AT ? 0 : FLAT_SHIP; }
    if (promo && promo.kind === 'ship') { ship = 0; }
    var tax = round2(net * TAX_RATE);
    return {
      lines: lines, sub: sub, discount: discount, label: label, net: net,
      ship: ship, tax: tax, total: round2(net + ship + tax)
    };
  }

  function lineHTML(l) {
    var p = l.p;
    var canInc = l.qty < p.stock;
    return '<div class="line">' +
      '<span class="line-art" style="--g1:' + p.g1 + ';--g2:' + p.g2 + ';--g3:' + p.g3 + '" aria-hidden="true">' + icon(p.icon, 26) + '</span>' +
      '<div class="line-main">' +
        '<p class="line-name">' + esc(p.name) + '</p>' +
        '<p class="line-meta">' + money(p.price) + ' each &middot; ' + stockLabel(p) + '</p>' +
        '<div class="line-controls">' +
          '<div class="stepper">' +
            '<button type="button" data-act="line-qty" data-id="' + p.id + '" data-delta="-1" aria-label="One fewer ' + esc(p.name) + '">' + icon('minus', 13) + '</button>' +
            '<output aria-label="Quantity of ' + esc(p.name) + '">' + l.qty + '</output>' +
            '<button type="button" data-act="line-qty" data-id="' + p.id + '" data-delta="1"' + (canInc ? '' : ' disabled') + ' aria-label="One more ' + esc(p.name) + '">' + icon('plus', 13) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="line-right">' +
        '<span class="line-total">' + money(l.line) + '</span>' +
        '<button class="line-remove" type="button" data-act="line-remove" data-id="' + p.id + '" aria-label="Remove ' + esc(p.name) + ' from the cart">' + icon('trash', 15) + '</button>' +
      '</div>' +
    '</div>';
  }

  function renderCart() {
    var t = totals();
    var promo = state.promo ? PROMOS[state.promo] : null;
    if (promo && promo.min && t.sub < promo.min) {
      var droppedCode = promo.code;
      var droppedMin = promo.min;
      state.promo = null;
      promo = null;
      save();
      t = totals();
      toast(droppedCode + ' was dropped — the subtotal fell below ' + money(droppedMin), 'bad');
    }
    var body = $('#cart-body');
    if (body) {
      body.innerHTML = t.lines.length ? t.lines.map(lineHTML).join('') :
        '<div class="cart-empty">' + icon('package', 44) + '<h3>Your cart is empty</h3>' +
        '<p>Twelve products, one warehouse, free shipping over $120. Add something and the totals sort themselves out.</p>' +
        '<button type="button" class="btn btn-primary" data-act="browse">Browse the catalogue</button></div>';
    }
    show($('#cart-foot'), t.lines.length > 0);
    setText('#t-sub', money(t.sub));
    setText('#t-discount', '-' + money(t.discount));
    setText('#t-discount-label', t.label);
    show($('#t-discount-row'), t.discount > 0);
    setText('#t-ship', t.ship === 0 ? 'Free' : money(t.ship));
    setText('#t-tax', money(t.tax));
    setText('#t-total', money(t.total));

    var promoInput = $('#promo-input');
    if (promoInput && promoInput.value.toUpperCase().replace(/\\s+/g, '') !== (state.promo || '')) {
      promoInput.value = state.promo || '';
    }
    show($('#promo-remove'), !!state.promo);

    var meter = $('#ship-meter');
    if (meter) {
      var free = t.lines.length > 0 && t.ship === 0;
      meter.hidden = !t.lines.length || free;
      if (t.lines.length && !free) {
        setText('#ship-meter-text', 'Add ' + money(Math.max(0, FREE_SHIP_AT - t.net)) + ' more for free shipping');
        var fill = $('#meter-fill');
        if (fill) { fill.style.width = Math.min(100, (t.net / FREE_SHIP_AT) * 100).toFixed(1) + '%'; }
      }
    }
    updateBadges();
  }

  function updateBadges() {
    var n = cartCount();
    var cb = $('#cart-count');
    if (cb) { cb.textContent = String(n); cb.hidden = n === 0; }
    var cartBtn = $('#cart-btn');
    if (cartBtn) { cartBtn.setAttribute('aria-label', 'Open cart, ' + n + (n === 1 ? ' item' : ' items')); }
    var w = state.wish.length;
    var wb = $('#wish-count');
    if (wb) { wb.textContent = String(w); wb.hidden = w === 0; }
    var wb2 = $('#wish-btn');
    if (wb2) {
      wb2.setAttribute('aria-label', w + (w === 1 ? ' saved item, click to' : ' saved items, click to') + (state.wishOnly ? ' show all products' : ' filter to the wishlist'));
      wb2.setAttribute('aria-pressed', state.wishOnly ? 'true' : 'false');
    }
  }

  function bumpCart() {
    var cartBtn = $('#cart-btn');
    if (!cartBtn) { return; }
    cartBtn.classList.remove('is-bumped');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('is-bumped');
  }

  function flyToCart(sourceEl, p) {
    var cartBtn = $('#cart-btn');
    var layer = $('#fly-layer');
    if (!cartBtn || !layer) { bumpCart(); return; }
    if (reduce || !sourceEl || typeof sourceEl.animate !== 'function') { bumpCart(); return; }
    var from = sourceEl.getBoundingClientRect();
    var to = cartBtn.getBoundingClientRect();
    var fx = from.left + from.width / 2;
    var fy = from.top + from.height / 2;
    var dx = (to.left + to.width / 2) - fx;
    var dy = (to.top + to.height / 2) - fy;
    var ghost = document.createElement('span');
    ghost.className = 'fly-ghost';
    ghost.style.left = fx + 'px';
    ghost.style.top = fy + 'px';
    ghost.style.background = 'linear-gradient(152deg, ' + p.g1 + ', ' + p.g2 + ')';
    layer.appendChild(ghost);
    var anim;
    try {
      anim = ghost.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.95 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.3)', opacity: 0.35, offset: 0.82 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.08)', opacity: 0 }
      ], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
    } catch (err) {
      layer.removeChild(ghost);
      bumpCart();
      return;
    }
    var done = false;
    var finish = function () {
      if (done) { return; }
      done = true;
      if (ghost.parentNode) { ghost.parentNode.removeChild(ghost); }
      bumpCart();
    };
    if (anim && typeof anim.onfinish !== 'undefined') { anim.onfinish = finish; }
    setTimeout(finish, 900);
  }

  function flashAdded(btn) {
    if (!btn || btn.disabled) { return; }
    if (!btn.getAttribute('data-label')) { btn.setAttribute('data-label', btn.textContent); }
    btn.textContent = 'Added';
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = btn.getAttribute('data-label') || 'Add to cart';
      btn.disabled = false;
    }, 1400);
  }

  function addToCart(id, qty, sourceEl) {
    var p = findProduct(id);
    if (!p) { return false; }
    if (p.stock <= 0) {
      toast(p.name + ' is sold out until ' + (p.restock || 'the next batch'), 'bad');
      return false;
    }
    var have = state.cart[id] || 0;
    var next = Math.min(p.stock, have + (qty || 1));
    if (next === have) {
      toast('You already have every ' + p.name + ' we have in stock.', 'bad');
      return false;
    }
    state.cart[id] = next;
    save();
    renderCart();
    if (sourceEl) { flyToCart(sourceEl, p); } else { bumpCart(); }
    toast(p.name + ' added — ' + next + ' in your cart');
    return true;
  }

  function changeQty(id, delta) {
    var p = findProduct(id);
    if (!p) { return; }
    var have = state.cart[id] || 0;
    var next = have + delta;
    if (next <= 0) { removeLine(id); return; }
    if (next > p.stock) {
      toast('That is every ' + p.name + ' we have in stock.', 'bad');
      return;
    }
    state.cart[id] = next;
    save();
    renderCart();
    if (delta > 0) { bumpCart(); }
  }

  function removeLine(id) {
    var p = findProduct(id);
    if (!state.cart[id]) { return; }
    delete state.cart[id];
    save();
    renderCart();
    if (p) { toast(p.name + ' removed from your cart'); }
  }

  /* ============================ overlays ============================= */
  var drawer = $('#cart-drawer');
  var modal = $('#product-modal');
  var scrim = $('#scrim');
  var lastFocus = null;

  function trap(container, e) {
    var nodes = $$(FOCUSABLE, container).filter(function (el) {
      return el.getClientRects().length > 0;
    });
    if (!nodes.length) { return; }
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    renderCart();
    drawer.hidden = false;
    if (scrim) { scrim.hidden = false; }
    var btn = $('#cart-btn');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); }
    document.body.style.overflow = 'hidden';
    var close = $('[data-act="cart-close"]', drawer);
    if (close) { close.focus(); }
  }
  function closeDrawer(restoreFocus) {
    if (!drawer || drawer.hidden) { return; }
    drawer.hidden = true;
    var btn = $('#cart-btn');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); }
    if (modal && !modal.hidden) { return; }
    if (scrim) { scrim.hidden = true; }
    document.body.style.overflow = '';
    if (restoreFocus !== false && lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }
  function openModal(id) {
    var p = findProduct(id);
    if (!p || !modal) { return; }
    lastFocus = document.activeElement;
    closeDrawer(false);
    buildDetail(p);
    modal.hidden = false;
    if (scrim) { scrim.hidden = false; }
    document.body.style.overflow = 'hidden';
    var close = $('[data-act="modal-close"]', modal);
    if (close) { close.focus(); }
    pushViewed(id);
    renderRecent();
  }
  function closeModal(restoreFocus) {
    if (!modal || modal.hidden) { return; }
    modal.hidden = true;
    if (scrim) { scrim.hidden = true; }
    document.body.style.overflow = '';
    if (restoreFocus !== false && lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  if (scrim) {
    scrim.addEventListener('click', function () {
      if (modal && !modal.hidden) { closeModal(); }
      else { closeDrawer(); }
    });
  }
  var cartBtn = $('#cart-btn');
  if (cartBtn) { cartBtn.addEventListener('click', openDrawer); }

  /* ========================== product detail ======================== */
  var modalQty = 1;
  var modalProductId = null;

  function distribution(rating) {
    var five = Math.max(4, Math.min(94, Math.round((rating - 3.4) / 1.6 * 88) + 4));
    var four = Math.round((100 - five) * 0.68);
    var three = Math.round((100 - five - four) * 0.74);
    var one = 100 - five - four - three;
    var two = 0;
    if (one < 0) { one = 0; }
    if (one > 4) { one = 4; two = 100 - five - four - three - one; }
    if (two < 0) { two = 0; }
    return [five, four, three, two, one];
  }

  function buildDetail(p) {
    var host = $('#modal-body');
    if (!host) { return; }
    modalQty = 1;
    modalProductId = p.id;
    var specHtml = '';
    Object.keys(p.specs).forEach(function (key) {
      specHtml += '<div class="md-spec"><dt>' + esc(key) + '</dt><dd>' + esc(p.specs[key]) + '</dd></div>';
    });
    var bars = distribution(p.rating).map(function (share, i) {
      return '<div class="md-bar"><span>' + (5 - i) + ' star' + (i === 4 ? '' : 's') + '</span>' +
        '<span><i style="width:' + share + '%"></i></span><span>' + share + '%</span></div>';
    }).join('');
    var wished = isWished(p.id);
    host.innerHTML =
      '<div class="md-art" style="--g1:' + p.g1 + ';--g2:' + p.g2 + ';--g3:' + p.g3 + '" aria-hidden="true">' + icon(p.icon, 76) + '</div>' +
      '<div class="md-info">' +
        '<p class="md-eyebrow">' + esc(catName(p.cat)) + (p.badge ? ' &middot; ' + BADGE_TEXT[p.badge] : '') + ' &middot; added ' + monthYear(p.added) + '</p>' +
        '<h2 id="modal-title">' + esc(p.name) + '</h2>' +
        '<div class="rate-row">' + stars(p.rating, p.reviews) +
          '<span class="rate-num">' + p.rating.toFixed(1) + '</span>' +
          '<span class="rate-count">' + p.reviews.toLocaleString('en-US') + ' verified reviews</span></div>' +
        '<p class="md-price"><span class="price-now">' + money(p.price) + '</span>' +
          (p.was ? '<s class="price-was">' + money(p.was) + '</s>' : '') + '</p>' +
        '<p class="stock ' + stockClass(p) + '">' + stockLabel(p) + '</p>' +
        '<p class="md-blurb">' + esc(p.blurb) + '</p>' +
        '<dl class="md-specs">' + specHtml + '</dl>' +
        '<div class="md-bars" role="img" aria-label="Rating breakdown">' + bars + '</div>' +
        '<div class="md-actions">' +
          '<div class="stepper">' +
            '<button type="button" data-act="modal-qty" data-delta="-1" aria-label="One fewer ' + esc(p.name) + '">' + icon('minus', 14) + '</button>' +
            '<output id="modal-qty" aria-label="Quantity of ' + esc(p.name) + '">1</output>' +
            '<button type="button" data-act="modal-qty" data-delta="1"' + (p.stock > 1 ? '' : ' disabled') + ' aria-label="One more ' + esc(p.name) + '">' + icon('plus', 14) + '</button>' +
          '</div>' +
          '<button class="btn btn-primary" type="button" data-act="modal-add" data-id="' + p.id + '"' + (p.stock > 0 ? '' : ' disabled') + '>' +
            (p.stock > 0 ? 'Add to cart' : 'Sold out') + '</button>' +
          '<button class="btn btn-ghost' + (wished ? ' is-on' : '') + '" type="button" data-act="wish" data-id="' + p.id + '"' +
            ' aria-pressed="' + (wished ? 'true' : 'false') + '">' + icon('heart', 18) +
            '<span>' + (wished ? 'Saved' : 'Save') + '</span></button>' +
        '</div>' +
        '<p class="md-note">Totals, promo codes and free-shipping thresholds are all handled in the cart drawer.</p>' +
      '</div>';
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function monthYear(iso) {
    var parts = String(iso).split('-');
    var mi = parseInt(parts[1], 10) - 1;
    return (MONTHS[mi] || 'Jan') + ' ' + (parts[0] || '2026');
  }

  /* ============================ wishlist ============================ */
  function toggleWish(id) {
    var p = findProduct(id);
    if (!p) { return; }
    var i = state.wish.indexOf(id);
    if (i >= 0) {
      state.wish.splice(i, 1);
      toast(p.name + ' removed from your wishlist');
    } else {
      state.wish.unshift(id);
      toast(p.name + ' saved to your wishlist');
    }
    save();
    updateBadges();
    renderChips();
    renderWishButtons();
    renderRecent();
    if (state.wishOnly) { renderGrid(); }
  }

  function renderWishButtons() {
    $$('[data-act="wish"]').forEach(function (btn) {
      var id = btn.getAttribute('data-id');
      var p = id ? findProduct(id) : null;
      if (!p) { return; }
      var on = isWished(id);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = btn.querySelector('span');
      if (label) {
        label.textContent = on ? 'Saved' : 'Save';
        btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.name + (on ? ' from' : ' to') + ' your wishlist');
      } else {
        btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.name + (on ? ' from' : ' to') + ' your wishlist');
        if (on && !reduce) {
          btn.classList.remove('is-pop');
          void btn.offsetWidth;
          btn.classList.add('is-pop');
        }
      }
    });
  }

  var wishBtn = $('#wish-btn');
  if (wishBtn) {
    wishBtn.setAttribute('aria-pressed', 'false');
    wishBtn.addEventListener('click', function () {
      state.wishOnly = !state.wishOnly;
      renderChips();
      renderGrid();
      updateBadges();
      smoothJump($('#catalog'));
      if (state.wishOnly && !state.wish.length) {
        toast('Nothing saved yet — tap a heart to build a wishlist.', 'bad');
      }
    });
  }

  /* ======================= recently viewed ========================== */
  function pushViewed(id) {
    var i = state.viewed.indexOf(id);
    if (i >= 0) { state.viewed.splice(i, 1); }
    state.viewed.unshift(id);
    while (state.viewed.length > 8) { state.viewed.pop(); }
    save();
  }
  function renderRecent() {
    var sec = $('#recent');
    var rail = $('#recent-rail');
    if (!sec || !rail) { return; }
    if (!state.viewed.length) {
      sec.hidden = true;
      rail.innerHTML = '';
      return;
    }
    sec.hidden = false;
    var html = '';
    state.viewed.forEach(function (id) {
      var p = findProduct(id);
      if (!p) { return; }
      html += '<button type="button" class="rail-card" data-act="view" data-id="' + id + '" aria-label="Open details for ' + esc(p.name) + '">' +
        '<span class="rail-art" style="--g1:' + p.g1 + ';--g2:' + p.g2 + ';--g3:' + p.g3 + '" aria-hidden="true">' + icon(p.icon, 26) + '</span>' +
        '<span class="rail-name">' + esc(p.name) + '</span>' +
        '<span class="rail-price">' + money(p.price) + ' &middot; ' + stockLabel(p) + '</span>' +
      '</button>';
    });
    rail.innerHTML = html;
  }
  var clearRecent = $('#clear-recent');
  if (clearRecent) {
    clearRecent.addEventListener('click', function () {
      state.viewed = [];
      save();
      renderRecent();
      toast('Recently viewed cleared');
    });
  }

  /* ============================= promo ============================== */
  function applyPromo(raw, msgEl) {
    var code = String(raw || '').trim().toUpperCase().replace(/\\s+/g, '');
    var t = totals();
    if (!code) {
      setFormMsg(msgEl, 'Type a code first — NORTH10 works on anything.', 'bad');
      return;
    }
    if (!t.lines.length) {
      setFormMsg(msgEl, 'Add something to the cart first, then apply the code.', 'bad');
      return;
    }
    var p = PROMOS[code];
    if (!p) {
      setFormMsg(msgEl, 'Not one of ours. Try NORTH10, WELCOME15, LIGHTNING20 or FREESHIP.', 'bad');
      return;
    }
    if (p.min && t.sub < p.min) {
      setFormMsg(msgEl, p.code + ' needs a subtotal of at least ' + money(p.min) + '. Yours is ' + money(t.sub) + '.', 'bad');
      return;
    }
    if (p.cat) {
      var inCat = 0;
      t.lines.forEach(function (l) { if (l.p.cat === p.cat) { inCat += l.line; } });
      if (inCat <= 0) {
        setFormMsg(msgEl, p.code + ' only applies to the lighting shelf, and no lighting item is in the cart.', 'bad');
        return;
      }
    }
    state.promo = code;
    save();
    renderCart();
    toast(p.code + ' applied — ' + p.label);
    setFormMsg(msgEl, 'Applied ' + p.code + ': ' + p.label + '.', 'ok');
  }

  var drawerPromo = $('#promo-form');
  if (drawerPromo) {
    drawerPromo.addEventListener('submit', function (e) {
      e.preventDefault();
      applyPromo($('#promo-input') ? $('#promo-input').value : '', $('#promo-msg'));
    });
  }
  var quickPromo = $('#promo-quick-form');
  if (quickPromo) {
    quickPromo.addEventListener('submit', function (e) {
      e.preventDefault();
      applyPromo($('#promo-quick') ? $('#promo-quick').value : '', $('#promo-quick-msg'));
      quickPromo.reset();
    });
  }

  /* ========================== delegated clicks ====================== */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) { return; }

    var el = t.closest('[data-act]');
    if (el) {
      var act = el.getAttribute('data-act');
      var id = el.getAttribute('data-id') || '';
      var delta = parseInt(el.getAttribute('data-delta') || '0', 10);

      if (act === 'view') { openModal(id); return; }
      if (act === 'add') { if (addToCart(id, 1, el)) { flashAdded(el); } return; }
      if (act === 'wish') { toggleWish(id); return; }
      if (act === 'cat') { setCategory(id); smoothJump($('#catalog')); return; }
      if (act === 'chip-cat') { setCategory('all'); return; }
      if (act === 'chip-q') { clearSearch(); return; }
      if (act === 'chip-wish') { state.wishOnly = false; renderChips(); renderGrid(); updateBadges(); return; }
      if (act === 'reset') { resetFilters(); return; }
      if (act === 'cart-close') { closeDrawer(); return; }
      if (act === 'modal-close') { closeModal(); return; }
      if (act === 'line-qty') { changeQty(id, delta); return; }
      if (act === 'line-remove') { removeLine(id); return; }
      if (act === 'promo-remove') { state.promo = null; save(); renderCart(); setFormMsg($('#promo-msg'), 'Code removed.', ''); toast('Promo code removed'); return; }
      if (act === 'checkout') {
        var tc = totals();
        if (!tc.lines.length) { toast('Your cart is empty.', 'bad'); return; }
        toast('Demo checkout — ' + money(tc.total) + ' across ' + tc.lines.length + ' line' + (tc.lines.length === 1 ? '' : 's') + '. Nothing was sent anywhere.');
        return;
      }
      if (act === 'browse') { closeDrawer(); smoothJump($('#catalog')); return; }
      if (act === 'modal-qty') {
        var product = findProduct(modalProductId);
        var next = modalQty + (delta < 0 ? -1 : 1);
        if (product && next > product.stock) { next = product.stock; }
        modalQty = Math.max(1, next);
        var out = $('#modal-qty');
        if (out) { out.textContent = String(modalQty); }
        return;
      }
      if (act === 'modal-add') {
        var src = $('.md-art', modal);
        if (addToCart(id, modalQty, src)) { flashAdded(el); }
        return;
      }
      return;
    }

    var jump = t.closest('a[href^="#"]');
    if (jump) {
      var href = jump.getAttribute('href');
      if (!href || href === '#') { return; }
      var target = document.getElementById(href.slice(1));
      if (!target) { return; }
      e.preventDefault();
      smoothJump(target);
      closeMobileNav();
    }
  });

  function clearSearch() {
    state.query = '';
    var input = $('#search');
    if (input) { input.value = ''; }
    show($('#search-clear'), false);
    renderChips();
    renderGrid();
  }
  function resetFilters() {
    state.cat = 'all';
    state.query = '';
    state.wishOnly = false;
    var input = $('#search');
    if (input) { input.value = ''; }
    show($('#search-clear'), false);
    $$('#cat-grid .cat').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-id') === 'all' ? 'true' : 'false');
    });
    setText('#crumb-current', 'All products');
    renderChips();
    renderGrid();
  }

  var resetBtn = $('#reset-filters');
  if (resetBtn) { resetBtn.addEventListener('click', resetFilters); }

  /* ============================= search ============================= */
  var searchInput = $('#search');
  var searchClear = $('#search-clear');
  var searchForm = $('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
  }
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.query = searchInput.value;
      show(searchClear, !!searchInput.value);
      renderChips();
      renderGrid();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      clearSearch();
      if (searchInput) { searchInput.focus(); }
    });
  }
  $$('[data-cat-jump]').forEach(function (link) {
    link.addEventListener('click', function () {
      setCategory(link.getAttribute('data-cat-jump') || 'all');
    });
  });

  var sortSelect = $('#sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value;
      renderGrid();
    });
  }

  /* ============================== FAQ =============================== */
  var accItems = $$('.acc-item');
  function closeAcc(btn, panel, item) {
    if (!btn || !panel) { return; }
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    if (item) { item.classList.remove('is-open'); }
  }
  accItems.forEach(function (item) {
    var btn = $('.acc-trigger', item);
    var panel = $('.acc-panel', item);
    if (!btn || !panel) { return; }
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        closeAcc(btn, panel, item);
        return;
      }
      accItems.forEach(function (other) {
        if (other === item) { return; }
        closeAcc($('.acc-trigger', other), $('.acc-panel', other), other);
      });
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      item.classList.add('is-open');
    });
  });

  /* ============================ keyboard ============================ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' && modal && !modal.hidden) { trap(modal, e); return; }
    if (e.key === 'Tab' && drawer && !drawer.hidden) { trap(drawer, e); return; }
    if (e.key !== 'Escape') { return; }
    if (modal && !modal.hidden) { closeModal(); return; }
    if (drawer && !drawer.hidden) { closeDrawer(); return; }
    var openTrigger = $$('.acc-trigger[aria-expanded="true"]')[0];
    if (openTrigger) { closeAcc(openTrigger, document.getElementById(openTrigger.getAttribute('aria-controls')), openTrigger.closest('.acc-item')); openTrigger.focus(); return; }
    if (mobileNav && !mobileNav.hidden) { closeMobileNav(); if (navToggle) { navToggle.focus(); } }
  });

  /* ============================== forms ============================= */
  var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;
  function wireSignup(formSel, inputSel, msgSel) {
    var form = $(formSel);
    var input = $(inputSel);
    var msg = $(msgSel);
    if (!form || !input) { return; }
    input.addEventListener('input', function () { setFormMsg(msg, '', ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) {
        setFormMsg(msg, 'An email address is needed before we can add you.', 'bad');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      if (!EMAIL_RE.test(v)) {
        setFormMsg(msg, 'That does not look like a valid email address.', 'bad');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      setFormMsg(msg, 'Added. The next letter goes out on the first Tuesday of the month.', 'ok');
      form.reset();
    });
  }
  wireSignup('#cta-form', '#cta-email', '#cta-msg');
  wireSignup('#footer-form', '#footer-email', '#footer-msg');

  /* =============================== boot ============================= */
  load();
  renderCategories();
  renderChips();
  renderGrid();
  renderCart();
  renderRecent();
  renderWishButtons();
  revealScan();
  runCounters();
  onScroll();
  setText('#year', String(new Date().getFullYear()));
}());`,
};