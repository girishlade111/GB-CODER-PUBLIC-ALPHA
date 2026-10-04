/**
 * business-agency — "Digital Agency"
 * Near-black creative studio: kinetic hero over an animated gradient mesh,
 * client marquee, six services, a filterable work grid with CSS-art
 * thumbnails, counters, process timeline, testimonial slider, team and contact.
 */
export default {
  html: `
<a class="skip-link" href="#work">Skip to the work</a>
<div class="scrollbar" role="presentation"><span class="scrollbar__fill" id="scrollFill"></span></div>

<header class="hdr" id="hdr">
  <div class="shell hdr__in">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
      <span class="brand__name">Nocturne<em>Studio</em></span>
    </a>
    <nav class="nav" id="primaryNav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="nav__link" href="#services" data-spy="services">Services</a></li>
        <li><a class="nav__link" href="#work" data-spy="work">Work</a></li>
        <li><a class="nav__link" href="#numbers" data-spy="numbers">Numbers</a></li>
        <li><a class="nav__link" href="#process" data-spy="process">Process</a></li>
        <li><a class="nav__link" href="#voices" data-spy="voices">Voices</a></li>
        <li><a class="nav__link" href="#team" data-spy="team">Team</a></li>
      </ul>
    </nav>
    <div class="hdr__actions">
      <a class="btn btn--accent btn--sm hdr__cta" href="#contact">Start a project</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__open" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__close" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero" aria-labelledby="heroTitle">
    <div class="mesh" aria-hidden="true">
      <span class="mesh__b mesh__b--1"></span>
      <span class="mesh__b mesh__b--2"></span>
      <span class="mesh__b mesh__b--3"></span>
      <span class="mesh__b mesh__b--4"></span>
      <span class="mesh__grid"></span>
    </div>
    <div class="shell hero__in">
      <p class="kicker"><span class="kicker__pulse" aria-hidden="true"></span>Independent studio &middot; Lisbon &amp; Toronto</p>
      <h1 class="hero__title" id="heroTitle">
        <span class="word"><span class="word__i" style="--i:0">We</span></span>
        <span class="word"><span class="word__i" style="--i:1">design</span></span>
        <span class="word"><span class="word__i accent" style="--i:2">software</span></span>
        <span class="word"><span class="word__i" style="--i:3">that</span></span>
        <span class="word"><span class="word__i" style="--i:4">refuses</span></span>
        <span class="word"><span class="word__i" style="--i:5">to</span></span>
        <span class="word"><span class="word__i" style="--i:6">blend</span></span>
        <span class="word"><span class="word__i" style="--i:7">in.</span></span>
      </h1>
      <p class="hero__lede">Nocturne is a 34-person product studio. We take on six engagements a year, work directly with the founders who fund them, and ship design systems, web platforms and brand systems that are still in production a decade later.</p>
      <div class="hero__actions">
        <a class="btn btn--accent" href="#work">See the work
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </a>
        <a class="btn btn--ghost" href="#contact">Book a 30-minute call</a>
      </div>
      <dl class="hero__row">
        <div><dt>Engagements per year</dt><dd>6</dd></div>
        <div><dt>Average tenure</dt><dd>4.2 yrs</dd></div>
        <div><dt>Studio since</dt><dd>2016</dd></div>
        <div><dt>Client NPS</dt><dd>71</dd></div>
      </dl>
    </div>
    <a class="scroll-cue" href="#services">
      <span class="scroll-cue__track" aria-hidden="true"><span class="scroll-cue__dot"></span></span>
      Scroll
    </a>
  </section>

  <div class="marquee" aria-label="Selected clients">
    <div class="marquee__row">
      <div class="marquee__half">
        <span>Halvorsen Rail</span><i aria-hidden="true"></i>
        <span>Cobalt Health</span><i aria-hidden="true"></i>
        <span>Vantage Freight</span><i aria-hidden="true"></i>
        <span>Meridian Pay</span><i aria-hidden="true"></i>
        <span>Northfold Studio</span><i aria-hidden="true"></i>
        <span>Arclight Media</span>
      </div>
      <div class="marquee__half" aria-hidden="true">
        <span>Halvorsen Rail</span><i></i>
        <span>Cobalt Health</span><i></i>
        <span>Vantage Freight</span><i></i>
        <span>Meridian Pay</span><i></i>
        <span>Northfold Studio</span><i></i>
        <span>Arclight Media</span>
      </div>
    </div>
  </div>

  <section class="section" id="services" aria-labelledby="servicesTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__n">01</span> What we do</p>
          <h2 class="head__title" id="servicesTitle">Six disciplines, one team, no handovers</h2>
        </div>
        <p class="head__note">Every engagement is staffed with a designer, an engineer and a strategist from the first week. We do not sell a design phase and then a build phase &mdash; the same three people carry the work to launch.</p>
      </header>
      <ul class="services">
        <li class="svc" data-reveal>
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
          <h3 class="svc__title">Product design</h3>
          <p class="svc__copy">Research, flows, interface and a tokenised design system your engineers can actually implement. Median engagement: 14 weeks.</p>
          <span class="svc__tag">Figma &middot; Zeroheight</span>
        </li>
        <li class="svc" data-reveal style="--delay:.06s">
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m13 2-10 12h8l-1 8 10-12h-8l1-8Z"/></svg></span>
          <h3 class="svc__title">Web engineering</h3>
          <p class="svc__copy">TypeScript front ends, edge rendering, and the boring reliability work that keeps a launch from becoming an incident.</p>
          <span class="svc__tag">TypeScript &middot; Rust</span>
        </li>
        <li class="svc" data-reveal style="--delay:.12s">
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/><path d="M3 12h18"/></svg></span>
          <h3 class="svc__title">Brand &amp; identity</h3>
          <p class="svc__copy">Naming, wordmark, type system and motion language, delivered as tokens and guidelines engineers can follow without a lawyer.</p>
          <span class="svc__tag">Glyphs &middot; Naming</span>
        </li>
        <li class="svc" data-reveal style="--delay:.18s">
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M4 3v18h18"/><path d="m7 14 3-4 3 3 5-7"/></svg></span>
          <h3 class="svc__title">Growth &amp; experimentation</h3>
          <p class="svc__copy">A permanent squad that ships landing systems, runs the tests, and reports what actually moved revenue rather than impressions.</p>
          <span class="svc__tag">Analytics &middot; CRO</span>
        </li>
        <li class="svc" data-reveal style="--delay:.24s">
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
          <h3 class="svc__title">Design systems</h3>
          <p class="svc__copy">Component libraries, documentation and adoption tooling, with a governance model your team can run after we leave.</p>
          <span class="svc__tag">Tokens &middot; Storybook</span>
        </li>
        <li class="svc" data-reveal style="--delay:.3s">
          <span class="svc__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M6 6h12v12H6z"/><path d="M9 9h6v6H9M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg></span>
          <h3 class="svc__title">Platform &amp; infra</h3>
          <p class="svc__copy">Edge deployments, observability, CI and the runbooks that let a two-person team operate it at 3am without us.</p>
          <span class="svc__tag">Cloudflare &middot; Fly</span>
        </li>
      </ul>
    </div>
  </section>

  <section class="section section--alt" id="work" aria-labelledby="workTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__n">02</span> Selected work</p>
          <h2 class="head__title" id="workTitle">Six projects, six different problems</h2>
        </div>
        <p class="head__note">Hover any tile to reveal the stack. We are deliberately vague about revenue figures on client work, but happy to walk you through the architecture.</p>
      </header>

      <div class="filters" data-reveal style="--delay:.06s">
        <div class="chips" id="workChips" role="group" aria-label="Filter work by discipline">
          <button class="chip is-on" type="button" data-cat="all" aria-pressed="true">Everything</button>
          <button class="chip" type="button" data-cat="product" aria-pressed="false">Product</button>
          <button class="chip" type="button" data-cat="brand" aria-pressed="false">Brand</button>
          <button class="chip" type="button" data-cat="platform" aria-pressed="false">Platform</button>
          <button class="chip" type="button" data-cat="growth" aria-pressed="false">Growth</button>
        </div>
        <p class="filters__status" id="workStatus" role="status" aria-live="polite"></p>
      </div>

      <ul class="work">
        <li class="proj" data-reveal data-cat="platform">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--1" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>TypeScript</em><em>Rust</em><em>Cloudflare</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Vantage Freight</span>
              <span class="proj__title">Dispatch platform rebuild</span>
              <span class="proj__year">2025 &middot; 9 months</span>
            </span>
          </a>
        </li>
        <li class="proj" data-reveal style="--delay:.06s" data-cat="brand">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--2" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>Naming</em><em>Wordmark</em><em>Motion</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Cobalt Health</span>
              <span class="proj__title">Identity for a clinical network</span>
              <span class="proj__year">2024 &middot; 5 months</span>
            </span>
          </a>
        </li>
        <li class="proj" data-reveal style="--delay:.12s" data-cat="product">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--3" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>Design system</em><em>Tokens</em><em>A11y</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Meridian Pay</span>
              <span class="proj__title">A design system for 40 engineers</span>
              <span class="proj__year">2024 &middot; 11 months</span>
            </span>
          </a>
        </li>
        <li class="proj" data-reveal style="--delay:.18s" data-cat="growth">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--4" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>CRO</em><em>Experiments</em><em>Analytics</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Northfold Studio</span>
              <span class="proj__title">Checkout rebuild, 214 tests</span>
              <span class="proj__year">2023 &middot; 7 months</span>
            </span>
          </a>
        </li>
        <li class="proj" data-reveal style="--delay:.24s" data-cat="product">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--5" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>Research</em><em>Prototyping</em><em>Testing</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Halvorsen Rail</span>
              <span class="proj__title">Ticketing flow, rebuilt from the platform up</span>
              <span class="proj__year">2023 &middot; 6 months</span>
            </span>
          </a>
        </li>
        <li class="proj" data-reveal style="--delay:.3s" data-cat="brand platform">
          <a class="proj__link" href="#contact">
            <span class="proj__art art--6" aria-hidden="true"></span>
            <span class="proj__overlay">
              <span class="proj__tags"><em>Identity</em><em>Edge</em><em>Docs</em></span>
              <span class="proj__cta">View case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
            </span>
            <span class="proj__meta">
              <span class="proj__client">Arclight Media</span>
              <span class="proj__title">A newsroom that loads in 400ms</span>
              <span class="proj__year">2022 &middot; 8 months</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>

  <section class="numbers" id="numbers" aria-labelledby="numbersTitle" data-spy-section>
    <div class="shell">
      <h2 class="sr-only" id="numbersTitle">Studio numbers</h2>
      <ul class="numbers__grid">
        <li class="num" data-reveal>
          <span class="num__v" data-count="118" data-suffix="">0</span>
          <span class="num__l">Products shipped</span>
          <span class="num__n">since 2016</span>
        </li>
        <li class="num" data-reveal style="--delay:.08s">
          <span class="num__v" data-count="96" data-suffix="%">0</span>
          <span class="num__l">Clients who re-engage</span>
          <span class="num__n">within 24 months</span>
        </li>
        <li class="num" data-reveal style="--delay:.16s">
          <span class="num__v" data-count="9" data-suffix="">0</span>
          <span class="num__l">Average tenure in years</span>
          <span class="num__n">across all clients</span>
        </li>
        <li class="num" data-reveal style="--delay:.24s">
          <span class="num__v" data-count="34" data-suffix="">0</span>
          <span class="num__l">People in the studio</span>
          <span class="num__n">across two cities</span>
        </li>
      </ul>
    </div>
  </section>

  <section class="section" id="process" aria-labelledby="processTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__n">03</span> How we work</p>
          <h2 class="head__title" id="processTitle">Five phases, no surprises</h2>
        </div>
        <p class="head__note">Every phase ends with something you can click. If a phase produces nothing usable, we have failed at it and we will say so.</p>
      </header>
      <ol class="timeline">
        <li class="tl" data-reveal>
          <span class="tl__dot" aria-hidden="true"></span>
          <span class="tl__week">Week 1&ndash;2</span>
          <h3 class="tl__title">Diagnosis</h3>
          <p class="tl__copy">Interviews with your team and your customers, an audit of the current stack, and a written problem statement you will keep whether or not you hire us.</p>
          <span class="tl__out">Output &middot; problem statement</span>
        </li>
        <li class="tl" data-reveal style="--delay:.08s">
          <span class="tl__dot" aria-hidden="true"></span>
          <span class="tl__week">Week 3&ndash;5</span>
          <h3 class="tl__title">Direction</h3>
          <p class="tl__copy">Three distinct directions, each clickable in the browser within a week. You pick one, we throw out the other two in the same meeting.</p>
          <span class="tl__out">Output &middot; three prototypes</span>
        </li>
        <li class="tl" data-reveal style="--delay:.16s">
          <span class="tl__dot" aria-hidden="true"></span>
          <span class="tl__week">Week 6&ndash;16</span>
          <h3 class="tl__title">Build</h3>
          <p class="tl__copy">Design and engineering run in parallel on the same board. You get a staging URL every Thursday and a written changelog every Friday.</p>
          <span class="tl__out">Output &middot; staging build</span>
        </li>
        <li class="tl" data-reveal style="--delay:.24s">
          <span class="tl__dot" aria-hidden="true"></span>
          <span class="tl__week">Week 17&ndash;18</span>
          <h3 class="tl__title">Harden</h3>
          <p class="tl__copy">Accessibility audit to WCAG 2.2 AA, load testing to three times expected peak, a runbook, and a handover session with whoever will own it.</p>
          <span class="tl__out">Output &middot; audit and runbook</span>
        </li>
        <li class="tl" data-reveal style="--delay:.32s">
          <span class="tl__dot" aria-hidden="true"></span>
          <span class="tl__week">Week 19 onward</span>
          <h3 class="tl__title">Stay or go</h3>
          <p class="tl__copy">Most clients keep us on a light retainer. If you would rather take it in-house, we help you hire and we leave the repository tidy.</p>
          <span class="tl__out">Output &middot; your team</span>
        </li>
      </ol>
    </div>
  </section>

  <section class="section section--alt" id="voices" aria-labelledby="voicesTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__n">04</span> In their words</p>
          <h2 class="head__title" id="voicesTitle">What clients say when we are not in the room</h2>
        </div>
      </header>
      <div class="slider" id="slider" data-reveal style="--delay:.06s" role="group" aria-roledescription="carousel" aria-label="Client testimonials" tabindex="0">
        <div class="slider__viewport">
          <ul class="slider__track" id="sliderTrack">
            <li class="slide" role="group" aria-roledescription="slide" aria-label="1 of 4">
              <figure class="quote">
                <div class="quote__stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>We had been quoted eleven months by an agency and still had nothing clickable. Nocturne had three prototypes in week four, and the one we picked shipped in March. The dispatch rebuild cut our late-delivery rate from 19% to 3%.</blockquote>
                <figcaption class="quote__by">
                  <span class="avatar av--1" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
                  <span><strong>Ingrid Halvorsen</strong><span class="quote__role">COO, Vantage Freight</span></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="2 of 4">
              <figure class="quote">
                <div class="quote__stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>The design system is the part that keeps paying. Eighteen months on, our four product teams ship without asking us anything, and new screens take a day instead of a sprint. That is the whole return on investment.</blockquote>
                <figcaption class="quote__by">
                  <span class="avatar av--2" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
                  <span><strong>Daniel Osei</strong><span class="quote__role">VP Engineering, Meridian Pay</span></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="3 of 4">
              <figure class="quote">
                <div class="quote__stars" aria-label="Rated 5 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>What surprised me was how much they pushed back. They killed two of our favourite features before writing any code and were right about both. We shipped 14% lighter as a result.</blockquote>
                <figcaption class="quote__by">
                  <span class="avatar av--3" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
                  <span><strong>Dr Amara Lindqvist</strong><span class="quote__role">Clinical Director, Cobalt Health</span></span>
                </figcaption>
              </figure>
            </li>
            <li class="slide" role="group" aria-roledescription="slide" aria-label="4 of 4">
              <figure class="quote">
                <div class="quote__stars" aria-label="Rated 4 out of 5">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>
                </div>
                <blockquote>They are not cheap and they are not pretending to be. Six engagements a year means they turn work down, which is why ours got attention. The only friction was getting a slot.</blockquote>
                <figcaption class="quote__by">
                  <span class="avatar av--4" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
                  <span><strong>Marcus Bell</strong><span class="quote__role">Founder, Northfold Studio</span></span>
                </figcaption>
              </figure>
            </li>
          </ul>
        </div>
        <div class="slider__controls">
          <button class="snav" id="slidePrev" type="button" aria-label="Previous testimonial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          </button>
          <ul class="slider__dots" id="slideDots"></ul>
          <button class="snav" id="slideNext" type="button" aria-label="Next testimonial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
          <button class="snav snav--auto" id="slideAuto" type="button" aria-pressed="true" aria-label="Pause automatic advance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon--pause" aria-hidden="true" focusable="false"><path d="M9 5v14M15 5v14"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon--play" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7V5Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="team" aria-labelledby="teamTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__n">05</span> The studio</p>
          <h2 class="head__title" id="teamTitle">Twelve of the thirty-four</h2>
        </div>
        <p class="head__note">No account managers. The people below are the people on your project, and they will be in your Slack from week one.</p>
      </header>
      <ul class="team">
        <li class="person" data-reveal>
          <span class="avatar avatar--lg av--1" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
          <h3 class="person__name">Mara Teixeira</h3>
          <p class="person__role">Founder &amp; Design Director</p>
          <p class="person__note">Previously design systems lead at a bank with 4,000 internal users.</p>
        </li>
        <li class="person" data-reveal style="--delay:.06s">
          <span class="avatar avatar--lg av--2" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
          <h3 class="person__name">Kofi Mensah</h3>
          <p class="person__role">Principal Engineer</p>
          <p class="person__note">Writes the runbooks. Refuses to deploy anything he cannot page himself about.</p>
        </li>
        <li class="person" data-reveal style="--delay:.12s">
          <span class="avatar avatar--lg av--3" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
          <h3 class="person__name">Sofia Brandt</h3>
          <p class="person__role">Research Lead</p>
          <p class="person__note">Has interviewed 2,100 users. Believes every brief is a hypothesis until proven otherwise.</p>
        </li>
        <li class="person" data-reveal style="--delay:.18s">
          <span class="avatar avatar--lg av--4" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
          <h3 class="person__name">Ren Takahashi</h3>
          <p class="person__role">Motion &amp; Brand Designer</p>
          <p class="person__note">Owns the studio's easing curves and the argument against them.</p>
        </li>
        <li class="person" data-reveal style="--delay:.24s">
          <span class="avatar avatar--lg av--5" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="24" cy="18" r="9"/><path d="M6 46a18 18 0 0 1 36 0Z"/></svg></span>
          <h3 class="person__name">Elena Duarte</h3>
          <p class="person__role">Delivery Partner</p>
          <p class="person__note">Keeps six engagements from colliding and every deadline honest.</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="section section--alt" id="contact" aria-labelledby="contactTitle" data-spy-section>
    <div class="shell contact">
      <div class="contact__pitch" data-reveal>
        <p class="eyebrow"><span class="eyebrow__n">06</span> Start something</p>
        <h2 class="head__title" id="contactTitle">Tell us what is not working</h2>
        <p class="contact__copy">We take on six engagements a year and are currently booking from March. Every enquiry gets a real reply from a real person within two working days, including the ones we decline.</p>
        <ul class="contact__facts">
          <li><span class="fact__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg></span><span><strong>studio@nocturne.example</strong><span class="fact__sm">Replies within two working days</span></span></li>
          <li><span class="fact__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg></span><span><strong>+351 21 040 8812</strong><span class="fact__sm">Weekdays, 09:00&ndash;18:00 WET</span></span></li>
          <li><span class="fact__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span><strong>Rua da Prata 112, Lisbon</strong><span class="fact__sm">Studio visits by appointment</span></span></li>
        </ul>
      </div>

      <form class="contact__form" id="contactForm" novalidate data-reveal style="--delay:.08s">
        <div class="field">
          <label class="field__label" for="cName">Your name</label>
          <input class="input" id="cName" name="name" type="text" autocomplete="name" placeholder="Marta Ribeiro" aria-describedby="cNameMsg" />
          <p class="field__msg" id="cNameMsg" role="alert"></p>
        </div>
        <div class="field">
          <label class="field__label" for="cEmail">Work email</label>
          <input class="input" id="cEmail" name="email" type="email" autocomplete="email" placeholder="you@company.com" aria-describedby="cEmailMsg" />
          <p class="field__msg" id="cEmailMsg" role="alert"></p>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field__label" for="cCompany">Company</label>
            <input class="input" id="cCompany" name="company" type="text" autocomplete="organization" placeholder="Northfold Studio" aria-describedby="cCompanyMsg" />
            <p class="field__msg" id="cCompanyMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="cBudget">Budget band</label>
            <select class="input input--select" id="cBudget" name="budget" aria-describedby="cBudgetMsg">
              <option value="">Choose one</option>
              <option value="under-50">Under 50k</option>
              <option value="50-120">50k &ndash; 120k</option>
              <option value="120-250">120k &ndash; 250k</option>
              <option value="over-250">Over 250k</option>
              <option value="unsure">Not sure yet</option>
            </select>
            <p class="field__msg" id="cBudgetMsg" role="alert"></p>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="cBrief">What is not working?</label>
          <textarea class="input input--area" id="cBrief" name="brief" rows="5" placeholder="We rebuilt checkout twice and conversion has not moved since 2023. We suspect the problem is upstream of the page." aria-describedby="cBriefMsg cCount"></textarea>
          <p class="field__foot"><span class="field__msg" id="cBriefMsg" role="alert"></span><span class="field__count" id="cCount">0 / 600</span></p>
        </div>
        <label class="check">
          <input type="checkbox" id="cConsent" />
          <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span>
          <span class="check__text">Send me the studio notes, roughly once a month.</span>
        </label>
        <p class="field__msg" id="cConsentMsg" role="alert"></p>

        <button class="btn btn--accent btn--block" type="submit">
          Send the enquiry
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </button>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <div class="sent" id="sentState" hidden>
          <span class="sent__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/></svg></span>
          <div><p class="sent__t">Enquiry received</p><p class="sent__m" id="sentMsg">Mara reads every one of these personally.</p></div>
        </div>
      </form>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="shell">
    <div class="foot__grid">
      <div class="foot__brand">
        <a class="brand" href="#top">
          <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg></span>
          <span class="brand__name">Nocturne<em>Studio</em></span>
        </a>
        <p class="foot__blurb">An independent product studio working with founders on design, engineering and brand. Booking from March.</p>
        <ul class="socials" aria-label="Social links">
          <li><a href="#top" aria-label="Nocturne on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
          <li><a href="#top" aria-label="Nocturne on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M6.5 9.5V20M6.5 5v.01M10.5 20v-5.5a3 3 0 0 1 6 0V20"/></svg></a></li>
          <li><a href="#top" aria-label="Nocturne on Dribbble"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/><path d="M3 12h18"/></svg></a></li>
          <li><a href="#top" aria-label="Nocturne on GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6 0C6.7 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a></li>
        </ul>
      </div>
      <nav class="foot__col" aria-label="Services">
        <h2 class="foot__title">Services</h2>
        <ul>
          <li><a href="#services">Product design</a></li>
          <li><a href="#services">Web engineering</a></li>
          <li><a href="#services">Brand &amp; identity</a></li>
          <li><a href="#services">Design systems</a></li>
          <li><a href="#services">Growth</a></li>
          <li><a href="#services">Platform &amp; infra</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Studio">
        <h2 class="foot__title">Studio</h2>
        <ul>
          <li><a href="#team">People</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#voices">Voices</a></li>
          <li><a href="#work">Case notes</a></li>
          <li><a href="#numbers">Numbers</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Careers">
        <h2 class="foot__title">Careers</h2>
        <ul>
          <li><a href="#contact">Open roles</a></li>
          <li><a href="#contact">Freelance network</a></li>
          <li><a href="#contact">Internships</a></li>
          <li><a href="#contact">How we interview</a></li>
          <li><a href="#contact">Salary bands</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Legal">
        <h2 class="foot__title">Legal</h2>
        <ul>
          <li><a href="#contact">Privacy</a></li>
          <li><a href="#contact">Terms</a></li>
          <li><a href="#contact">Cookies</a></li>
          <li><a href="#contact">Accessibility</a></li>
          <li><a href="#contact">Colophon</a></li>
        </ul>
      </nav>
    </div>
    <div class="foot__legal">
      <p>&copy; 2026 Nocturne Studio Unipessoal Lda. All rights reserved.</p>
      <p>Lisbon &amp; Toronto &middot; NIF 517 402 881</p>
    </div>
  </div>
</footer>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg: #07060b;
  --bg-2: #0c0b13;
  --card: #12111c;
  --card-2: #171625;
  --line: #211f30;
  --line-2: #2f2c42;
  --ink: #f5f3ff;
  --ink-2: #c6c2dd;
  --muted: #8d88a6;
  --accent: #8b5cf6;
  --accent-hi: #b794ff;
  --accent-dim: rgba(139, 92, 246, .14);
  --radius-sm: 7px;
  --radius: 12px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.55);
  --shadow: 0 16px 38px -20px rgba(0,0,0,.95), 0 2px 8px rgba(0,0,0,.5);
  --shadow-lg: 0 44px 88px -44px rgba(0,0,0,1), 0 12px 28px rgba(0,0,0,.55);
  --font-display: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ease: cubic-bezier(.22, .68, 0, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: 84px; }
body {
  margin: 0; padding: 0;
  background: var(--bg); color: var(--ink);
  font-family: var(--font-body); font-size: 16px; line-height: 1.62;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-display); margin: 0; line-height: 1.04; letter-spacing: -.035em; font-weight: 800; }
p { margin: 0; }
ul, ol, dl { margin: 0; padding: 0; list-style: none; }
dd, dt { margin: 0; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
textarea { font: inherit; resize: vertical; }
:focus-visible { outline: 2px solid var(--accent-hi); outline-offset: 3px; border-radius: 5px; }
.shell { width: 100%; max-width: 1260px; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.1em; height: 1.1em; flex: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 300; transform: translateY(-180%);
  background: var(--accent); color: #fff; padding: .6rem 1rem; font-weight: 700;
  border-radius: var(--radius-sm); transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }
.scrollbar { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 95; background: var(--line); pointer-events: none; }
.scrollbar__fill { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-hi)); transition: width .1s linear; }

/* ------------------------------------------------------------------ header */
.hdr {
  position: sticky; top: 0; z-index: 80;
  background: rgba(7,6,11,.8); backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), background .25s var(--ease), box-shadow .25s var(--ease);
}
.hdr.is-stuck { border-bottom-color: var(--line); background: rgba(7,6,11,.95); box-shadow: var(--shadow); }
.hdr__in { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.6rem); min-height: 70px; }
.brand { display: inline-flex; align-items: center; gap: .55rem; flex: none; }
.brand__mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--accent); color: #fff; }
.brand__mark .icon { width: 19px; height: 19px; }
.brand__name { font-family: var(--font-display); font-size: 1.05rem; font-weight: 800; letter-spacing: -.03em; }
.brand__name em { font-style: normal; color: var(--accent-hi); }
.nav { margin-left: auto; }
.nav__list { display: flex; align-items: center; gap: clamp(.5rem, 1.6vw, 1.4rem); }
.nav__link {
  position: relative; display: inline-block; font-size: .84rem; font-weight: 500; color: var(--muted);
  padding: .35rem 0; transition: color .2s var(--ease);
}
.nav__link::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease); }
.nav__link:hover, .nav__link:focus-visible { color: var(--ink); }
.nav__link:hover::after, .nav__link:focus-visible::after { transform: scaleX(1); }
.nav__link.is-current { color: var(--ink); }
.nav__link.is-current::after { transform: scaleX(1); background: var(--accent-hi); }
.hdr__actions { display: flex; align-items: center; gap: .5rem; }

.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .8rem 1.35rem; font-size: .88rem; font-weight: 700;
  border: 1px solid transparent; border-radius: 999px; cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 25%, rgba(255,255,255,.26) 48%, transparent 72%); transform: translateX(-130%); transition: transform .6s var(--ease); }
.btn:hover::after { transform: translateX(130%); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--sm { padding: .55rem 1rem; font-size: .8rem; }
.btn--block { width: 100%; }
.btn--accent { background: var(--accent); color: #fff; }
.btn--accent:hover { background: var(--accent-hi); box-shadow: 0 14px 34px -14px var(--accent); }
.btn--ghost { background: transparent; border-color: var(--line-2); color: var(--ink); }
.btn--ghost:hover { border-color: var(--accent-hi); color: var(--accent-hi); background: var(--accent-dim); }

.burger { display: none; place-items: center; width: 40px; height: 40px; background: var(--card); border: 1px solid var(--line-2); border-radius: 10px; cursor: pointer; }
.burger .icon { width: 19px; height: 19px; grid-area: 1 / 1; }
.burger__close { opacity: 0; transform: scale(.7); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.burger[aria-expanded='true'] .burger__open { opacity: 0; transform: scale(.7); }
.burger[aria-expanded='true'] .burger__close { opacity: 1; transform: scale(1); }

/* -------------------------------------------------------------------- hero */
.hero { position: relative; padding-block: clamp(3.5rem, 11vw, 8rem) clamp(3rem, 7vw, 5rem); overflow: hidden; }
.mesh { position: absolute; inset: -22%; filter: blur(64px); opacity: .72; }
.mesh__b { position: absolute; border-radius: 50%; }
.mesh__b--1 { width: 44%; height: 44%; left: 6%; top: 4%; background: radial-gradient(circle, #7c3aed, transparent 66%); animation: blob-a 24s var(--ease) infinite; }
.mesh__b--2 { width: 38%; height: 38%; right: 8%; top: 20%; background: radial-gradient(circle, #c026d3, transparent 66%); animation: blob-b 30s var(--ease) infinite; }
.mesh__b--3 { width: 34%; height: 34%; left: 30%; bottom: 2%; background: radial-gradient(circle, #4f46e5, transparent 68%); animation: blob-c 36s var(--ease) infinite; }
.mesh__b--4 { width: 22%; height: 22%; right: 32%; bottom: 14%; background: radial-gradient(circle, #a78bfa, transparent 70%); animation: blob-b 20s var(--ease) infinite reverse; }
.mesh__grid {
  position: absolute; inset: -22%; filter: none; opacity: .5;
  background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 62px 62px;
  mask-image: radial-gradient(75% 65% at 50% 30%, #000, transparent 76%);
  animation: grid-slide 30s linear infinite;
}
.hero__in { position: relative; z-index: 1; }
.kicker {
  display: inline-flex; align-items: center; gap: .55rem;
  font-size: .74rem; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; color: var(--accent-hi);
}
.kicker__pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-hi); animation: pulse 2.6s var(--ease) infinite; }
.hero__title {
  font-size: clamp(2.5rem, 8.4vw, 6rem); margin-block: 1.1rem 1rem; max-width: 15ch;
  display: flex; flex-wrap: wrap; gap: 0 .28em;
}
.word { display: inline-block; overflow: hidden; padding-bottom: .06em; }
.word__i { display: inline-block; animation: word-rise .82s var(--ease) both; animation-delay: calc(var(--i, 0) * 70ms); }
.word__i.accent { color: var(--accent-hi); }
.hero__lede { font-size: clamp(1rem, 1.3vw, 1.1rem); color: var(--ink-2); max-width: 62ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 1.85rem; }
.hero__row {
  display: grid; gap: 1.25rem; margin-top: clamp(2rem, 5vw, 3.25rem); padding-top: 1.6rem;
  border-top: 1px solid var(--line);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
}
.hero__row dt { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.hero__row dd { font-family: var(--font-display); font-size: clamp(1.5rem, 3.4vw, 2.1rem); font-weight: 800; color: var(--accent-hi); margin-top: .15rem; }
.scroll-cue {
  position: relative; z-index: 1;
  display: inline-flex; align-items: center; gap: .6rem; margin: clamp(2rem, 5vw, 3rem) auto 0;
  font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted);
  width: 100%; justify-content: center;
  transition: color .2s var(--ease);
}
.scroll-cue:hover { color: var(--accent-hi); }
.scroll-cue__track { position: relative; width: 20px; height: 32px; border: 1px solid var(--line-2); border-radius: 999px; }
.scroll-cue__dot { position: absolute; left: 50%; top: 6px; width: 3px; height: 7px; margin-left: -1.5px; border-radius: 2px; background: var(--accent-hi); animation: cue-drop 2s var(--ease) infinite; }

/* ----------------------------------------------------------------- marquee */
.marquee { overflow: hidden; border-block: 1px solid var(--line); background: var(--bg-2); padding-block: 1.1rem; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.marquee__row { display: flex; width: max-content; animation: slide-loop 30s linear infinite; }
.marquee__half { display: flex; align-items: center; gap: clamp(1.25rem, 4vw, 3rem); padding-right: clamp(1.25rem, 4vw, 3rem); }
.marquee__half span { font-family: var(--font-display); font-size: clamp(1rem, 2.2vw, 1.4rem); font-weight: 600; letter-spacing: -.02em; color: var(--ink-2); white-space: nowrap; transition: color .2s var(--ease); }
.marquee__half span:hover { color: var(--accent-hi); }
.marquee__half i { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex: none; }

/* ---------------------------------------------------------------- sections */
.section { padding-block: clamp(3rem, 7vw, 5.5rem); }
.section--alt { background: var(--bg-2); border-block: 1px solid var(--line); scroll-margin-top: 84px; }
.head { display: flex; flex-wrap: wrap; gap: 1.25rem 2.75rem; align-items: flex-end; justify-content: space-between; margin-bottom: 2.25rem; }
.eyebrow { display: inline-flex; align-items: center; gap: .6rem; font-size: .74rem; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
.eyebrow__n {
  display: grid; place-items: center; width: 26px; height: 26px; border-radius: 7px;
  background: var(--accent-dim); color: var(--accent-hi); font-family: var(--font-display); font-size: .76rem; letter-spacing: 0;
}
.head__title { font-size: clamp(1.75rem, 4.4vw, 3rem); margin-top: .75rem; max-width: 20ch; }
.head__note { font-size: .9rem; color: var(--muted); max-width: 44ch; }

/* services */
.services { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 265px), 1fr)); }
.svc {
  display: grid; gap: .6rem; align-content: start;
  padding: 1.5rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card);
  position: relative; overflow: hidden;
  transition: transform .3s var(--ease), border-color .3s var(--ease), background .3s var(--ease), box-shadow .3s var(--ease);
}
.svc::before {
  content: ''; position: absolute; inset: auto -40% -60% -40%; height: 120px;
  background: radial-gradient(closest-side, var(--accent-dim), transparent);
  opacity: 0; transition: opacity .35s var(--ease);
}
.svc:hover { transform: translateY(-6px); border-color: var(--accent); background: var(--card-2); box-shadow: var(--shadow); }
.svc:hover::before { opacity: 1; }
.svc__icon {
  display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: .35rem;
  border-radius: 12px; background: var(--accent-dim); color: var(--accent-hi);
  transition: transform .3s var(--ease), background .3s var(--ease);
}
.svc:hover .svc__icon { transform: translateY(-2px) rotate(-6deg); background: var(--accent); color: #fff; }
.svc__icon .icon { width: 21px; height: 21px; }
.svc__title { font-size: 1.12rem; }
.svc__copy { font-size: .86rem; color: var(--muted); }
.svc__tag { justify-self: start; margin-top: .4rem; padding: .22rem .6rem; border-radius: 999px; background: var(--bg); border: 1px solid var(--line-2); font-size: .7rem; letter-spacing: .05em; color: var(--accent-hi); }

/* work */
.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 1.75rem; }
.chips { display: flex; flex-wrap: wrap; gap: .45rem; }
.chip {
  padding: .45rem .9rem; font-size: .8rem; font-weight: 600;
  background: var(--card); border: 1px solid var(--line-2); border-radius: 999px; cursor: pointer;
  color: var(--muted);
  transition: color .2s var(--ease), border-color .2s var(--ease), background .2s var(--ease), transform .18s var(--ease);
}
.chip:hover { color: var(--ink); border-color: var(--accent); transform: translateY(-1px); }
.chip.is-on { background: var(--accent); border-color: var(--accent); color: #fff; }
.filters__status { font-size: .78rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.work { display: grid; gap: 1.15rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.proj__link {
  position: relative; display: grid; gap: .85rem; overflow: hidden;
  padding-bottom: 1rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card);
  transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.proj__link:hover { transform: translateY(-6px); border-color: var(--accent); box-shadow: var(--shadow-lg); }
.proj__art { display: block; aspect-ratio: 4 / 3; background-color: var(--bg-2); position: relative; overflow: hidden; }
.proj__art::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(52deg, rgba(255,255,255,.05) 0 1px, transparent 1px 11px);
  mix-blend-mode: overlay;
  transition: opacity .35s var(--ease);
}
.proj__link:hover .proj__art::after { opacity: .3; }
.art--1 { background-image: radial-gradient(80% 90% at 18% 12%, #a78bfa, transparent 58%), linear-gradient(150deg, #5b21b6, #1e1b4b); }
.art--2 { background-image: conic-gradient(from 210deg at 62% 34%, #d8b4fe, #7c3aed, #312e81, #d8b4fe); }
.art--3 { background-image: linear-gradient(40deg, #2e1065, #7e22ce 46%, #c026d3); }
.art--4 { background-image: radial-gradient(60% 70% at 76% 22%, #f0abfc, transparent 60%), linear-gradient(200deg, #4c1d95, #170a2e); }
.art--5 { background-image: repeating-linear-gradient(135deg, #4c1d95 0 16px, #6d28d9 16px 32px, #2e1065 32px 48px); }
.art--6 { background-image: radial-gradient(70% 60% at 30% 70%, #818cf8, transparent 62%), linear-gradient(120deg, #312e81, #0b0a1f); }
.proj__overlay {
  position: absolute; inset: 0 0 auto 0; aspect-ratio: 4 / 3;
  display: grid; align-content: center; justify-items: center; gap: .8rem;
  background: linear-gradient(180deg, rgba(12,8,26,.6), rgba(12,8,26,.92));
  opacity: 0; transition: opacity .3s var(--ease);
}
.proj__link:hover .proj__overlay, .proj__link:focus-visible .proj__overlay { opacity: 1; }
.proj__tags { display: flex; flex-wrap: wrap; gap: .35rem; justify-content: center; padding-inline: 1rem; }
.proj__tags em {
  font-style: normal; font-size: .7rem; font-weight: 600; letter-spacing: .05em;
  padding: .25rem .6rem; border-radius: 999px; background: rgba(255,255,255,.1); color: #fff;
  border: 1px solid rgba(255,255,255,.22);
}
.proj__cta { display: inline-flex; align-items: center; gap: .35rem; font-size: .8rem; font-weight: 700; color: var(--accent-hi); }
.proj__cta .icon { width: 15px; height: 15px; transition: transform .25s var(--ease); }
.proj__link:hover .proj__cta .icon { transform: translate(3px, -3px); }
.proj__meta { display: grid; gap: .2rem; padding-inline: 1.15rem; }
.proj__client { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-hi); font-weight: 600; }
.proj__title { font-family: var(--font-display); font-size: 1.08rem; font-weight: 600; letter-spacing: -.02em; }
.proj__year { font-size: .76rem; color: var(--muted); }

/* numbers */
.numbers { padding-block: clamp(2.5rem, 6vw, 4rem); background: var(--card); border-block: 1px solid var(--line); }
.numbers__grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); }
.num { display: grid; gap: .2rem; }
.num__v { font-family: var(--font-display); font-size: clamp(2.2rem, 5.4vw, 3.4rem); font-weight: 800; line-height: 1; letter-spacing: -.05em; color: var(--accent-hi); font-variant-numeric: tabular-nums; }
.num__l { font-size: .88rem; color: var(--ink-2); margin-top: .4rem; }
.num__n { font-size: .74rem; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); }

/* timeline */
.timeline { position: relative; display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); }
.timeline::before {
  content: ''; position: absolute; left: 0; right: 0; top: 34px; height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-hi) 45%, transparent);
  transform-origin: left; animation: grow-line 1.6s var(--ease) both;
}
.tl { position: relative; display: grid; gap: .4rem; align-content: start; padding-top: 3rem; }
.tl__dot {
  position: absolute; top: 26px; left: 0; width: 16px; height: 16px; border-radius: 50%;
  background: var(--bg); border: 3px solid var(--accent);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent);
}
.tl:hover .tl__dot { animation: dot-burst 1.1s var(--ease); }
.tl__week { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-hi); font-weight: 600; }
.tl__title { font-size: 1.15rem; }
.tl__copy { font-size: .85rem; color: var(--muted); }
.tl__out { justify-self: start; margin-top: .5rem; padding: .22rem .6rem; border-radius: 999px; background: var(--accent-dim); color: var(--accent-hi); font-size: .7rem; font-weight: 600; }

/* slider */
.slider { border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card); overflow: hidden; }
.slider:focus-visible { outline: 2px solid var(--accent-hi); outline-offset: 3px; }
.slider__viewport { overflow: hidden; }
.slider__track { display: flex; transition: transform .55s var(--ease); }
.slide { flex: 0 0 100%; min-width: 0; }
.quote { margin: 0; padding: clamp(1.5rem, 4vw, 2.75rem); display: grid; gap: 1.1rem; justify-items: start; }
.quote__stars { display: flex; gap: .18rem; color: var(--accent-hi); }
.quote__stars .icon { width: 17px; height: 17px; }
.quote blockquote { margin: 0; font-family: var(--font-display); font-size: clamp(1.15rem, 2.5vw, 1.7rem); font-weight: 400; line-height: 1.34; letter-spacing: -.02em; color: var(--ink); max-width: 46ch; }
.quote__by { display: flex; align-items: center; gap: .7rem; }
.quote__by strong { display: block; font-size: .88rem; }
.quote__role { display: block; font-size: .78rem; color: var(--muted); }
.avatar { display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 50%; color: #fff; overflow: hidden; }
.avatar--lg { width: 62px; height: 62px; }
.avatar svg { width: 100%; height: 100%; }
.av--1 { background: linear-gradient(150deg, #8b5cf6, #4c1d95); }
.av--2 { background: linear-gradient(150deg, #a855f7, #6b21a8); }
.av--3 { background: linear-gradient(150deg, #6366f1, #312e81); }
.av--4 { background: linear-gradient(150deg, #c026d3, #701a75); }
.av--5 { background: linear-gradient(150deg, #7c3aed, #2e1065); }
.slider__controls { display: flex; align-items: center; gap: .75rem; padding: .9rem clamp(1.5rem, 4vw, 2.75rem); border-top: 1px solid var(--line); }
.snav {
  display: grid; place-items: center; width: 38px; height: 38px; flex: none;
  background: var(--card-2); border: 1px solid var(--line-2); border-radius: 50%; cursor: pointer; color: var(--ink-2);
  transition: color .2s var(--ease), border-color .2s var(--ease), transform .18s var(--ease);
}
.snav:hover { color: var(--ink); border-color: var(--accent); transform: translateY(-2px); }
.snav--auto { margin-left: auto; }
.snav--auto .icon--play { display: none; }
.snav--auto[aria-pressed='false'] .icon--pause { display: none; }
.snav--auto[aria-pressed='false'] .icon--play { display: block; }
.slider__dots { display: flex; gap: .4rem; }
.sdot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: var(--line-2); cursor: pointer; transition: width .3s var(--ease), background .3s var(--ease); }
.sdot.is-on { width: 26px; background: var(--accent); }

/* team */
.team { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); }
.person {
  display: grid; gap: .35rem; justify-items: start; align-content: start;
  padding: 1.35rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card);
  transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.person:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: var(--shadow); }
.person:hover .avatar { transform: scale(1.05) rotate(-3deg); }
.avatar { transition: transform .3s var(--ease); }
.person__name { font-size: 1.05rem; margin-top: .45rem; }
.person__role { font-size: .72rem; letter-spacing: .09em; text-transform: uppercase; color: var(--accent-hi); font-weight: 600; }
.person__note { font-size: .82rem; color: var(--muted); }

/* contact */
.contact { display: grid; gap: clamp(1.75rem, 4vw, 3.5rem); grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: start; }
.contact__copy { font-size: .95rem; color: var(--muted); margin-top: 1rem; max-width: 46ch; }
.contact__facts { display: grid; gap: 1rem; margin-top: 2rem; }
.contact__facts li { display: flex; gap: .75rem; align-items: flex-start; }
.fact__ic { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 10px; background: var(--accent-dim); color: var(--accent-hi); }
.fact__ic .icon { width: 17px; height: 17px; }
.contact__facts strong { display: block; font-size: .9rem; }
.fact__sm { display: block; font-size: .78rem; color: var(--muted); }
.contact__form { display: grid; gap: 1rem; padding: clamp(1.25rem, 3vw, 1.85rem); border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card); }
.field { display: grid; gap: .35rem; }
.field-row { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); }
.field__label { font-size: .78rem; font-weight: 600; color: var(--ink-2); }
.input {
  width: 100%; padding: .75rem .9rem; font: inherit; font-size: .92rem; color: var(--ink);
  background: var(--bg); border: 1px solid var(--line-2); border-radius: 10px;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
.input::placeholder { color: color-mix(in srgb, var(--muted) 72%, transparent); }
.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.input--area { min-height: 132px; line-height: 1.55; }
.input--select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 2.4rem; }
.field.is-bad .input { border-color: #e5484d; background: rgba(229,72,77,.07); }
.field__msg { font-size: .76rem; min-height: 1em; color: #ff7b7f; font-weight: 500; }
.field__foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.field__count { font-size: .72rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.check { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .83rem; color: var(--ink-2); }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.check__box { display: grid; place-items: center; flex: none; width: 20px; height: 20px; margin-top: 1px; border: 1px solid var(--line-2); border-radius: 6px; background: var(--bg); transition: background .18s var(--ease), border-color .18s var(--ease); }
.check__box .icon { width: 13px; height: 13px; color: #fff; opacity: 0; transform: scale(.6); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.check input:checked + .check__box { background: var(--accent); border-color: var(--accent); }
.check input:checked + .check__box .icon { opacity: 1; transform: scale(1); }
.check input:focus-visible + .check__box { outline: 2px solid var(--accent-hi); outline-offset: 2px; }
.form-status { font-size: .82rem; min-height: 1.15em; font-weight: 600; color: var(--muted); }
.form-status.is-bad { color: #ff7b7f; }
.sent { display: flex; gap: .8rem; align-items: flex-start; padding: .9rem 1rem; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-dim); animation: sent-in .5s var(--ease) both; }
.sent[hidden] { display: none; }
.sent__ic { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: #fff; }
.sent__ic .icon { width: 18px; height: 18px; }
.sent__t { font-size: .9rem; font-weight: 700; }
.sent__m { font-size: .82rem; color: var(--ink-2); }

/* ------------------------------------------------------------------ footer */
.foot { background: var(--bg-2); border-top: 1px solid var(--line); padding-top: clamp(2.5rem, 6vw, 4rem); }
.foot__grid { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1.35fr) repeat(4, minmax(0, 1fr)); }
.foot__brand { display: grid; gap: .85rem; align-content: start; }
.foot__blurb { font-size: .85rem; color: var(--muted); max-width: 36ch; }
.socials { display: flex; gap: .5rem; }
.socials a { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--line-2); border-radius: 10px; color: var(--muted); transition: color .2s var(--ease), background .2s var(--ease), border-color .2s var(--ease), transform .2s var(--ease); }
.socials a:hover { color: #fff; background: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.foot__title { font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent-hi); margin-bottom: .8rem; }
.foot__col li + li { margin-top: .42rem; }
.foot__col a { font-size: .85rem; color: var(--muted); transition: color .18s var(--ease), padding-left .18s var(--ease); }
.foot__col a:hover { color: var(--ink); padding-left: 4px; }
.foot__legal { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; justify-content: space-between; margin-top: 2.5rem; padding-block: 1.1rem; border-top: 1px solid var(--line); font-size: .76rem; color: var(--muted); }

/* ----------------------------------------------------------------- reveal */
[data-reveal] { opacity: 0; transform: translateY(24px); }
[data-reveal].is-visible { opacity: 1; transform: none; transition: opacity .72s var(--ease), transform .72s var(--ease); transition-delay: var(--delay, 0s); }

/* --------------------------------------------------------------- keyframes */
@keyframes blob-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 33% { transform: translate3d(9%, -8%, 0) scale(1.16); } 66% { transform: translate3d(-6%, 7%, 0) scale(.9); } }
@keyframes blob-b { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-11%, 9%, 0) scale(1.2); } }
@keyframes blob-c { 0%,100% { transform: translate3d(0,0,0) scale(1); } 40% { transform: translate3d(7%, 6%, 0) scale(.86); } 75% { transform: translate3d(-8%, -4%, 0) scale(1.12); } }
@keyframes grid-slide { from { background-position: 0 0, 0 0; } to { background-position: 62px 62px, 62px 62px; } }
@keyframes word-rise { from { opacity: 0; transform: translateY(105%) rotate(3deg); } to { opacity: 1; transform: none; } }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(183,148,255,.5); } 70% { box-shadow: 0 0 0 9px rgba(183,148,255,0); } 100% { box-shadow: 0 0 0 0 rgba(183,148,255,0); } }
@keyframes cue-drop { 0% { transform: translateY(0); opacity: 0; } 25% { opacity: 1; } 70% { transform: translateY(12px); opacity: 0; } 100% { opacity: 0; } }
@keyframes slide-loop { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes grow-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes dot-burst { 0% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent); } 45% { box-shadow: 0 0 0 14px color-mix(in srgb, var(--accent) 0%, transparent); } 100% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent); } }
@keyframes sent-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* -------------------------------------------------------------- responsive */
@media (max-width: 1100px) {
  .foot__grid { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); }
  .contact { grid-template-columns: minmax(0, 1fr); }
  .timeline::before { display: none; }
}
@media (max-width: 900px) {
  .burger { display: grid; }
  .hdr__cta { display: none; }
  .nav {
    position: absolute; top: calc(100% + 1px); left: 0; right: 0;
    background: var(--bg); border-bottom: 1px solid var(--line); box-shadow: var(--shadow);
    padding: .75rem clamp(1rem, 4vw, 2.5rem) 1.15rem;
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .22s var(--ease), transform .22s var(--ease), visibility .22s;
  }
  .nav.is-open { opacity: 1; visibility: visible; transform: none; }
  .nav__list { flex-direction: column; align-items: stretch; gap: 0; }
  .nav__link { display: block; padding: .65rem 0; border-bottom: 1px solid var(--line); font-size: 1rem; }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .foot__grid { grid-template-columns: minmax(0, 1fr); }
  .foot__legal { flex-direction: column; }
  .slider__controls { flex-wrap: wrap; }
}

/* ------------------------------------------------------- reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .word__i { opacity: 1 !important; transform: none !important; }
  .marquee__row { animation: none; transform: none; }
  .mesh__grid { animation: none; }
  .timeline::before { transform: scaleX(1) !important; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;

function $(id) { return document.getElementById(id); }
function qsa(sel) { return document.querySelectorAll(sel); }
function qs(sel) { return document.querySelector(sel); }

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  var items = qsa('[data-reveal]');
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
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
}

/* --------------------------------------------------------- scroll + spy */
function initScroll() {
  var hdr = $('hdr');
  var fill = $('scrollFill');
  var links = qsa('[data-spy]');
  var sections = qsa('[data-spy-section]');
  var ticking = false;

  function frame() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('is-stuck', y > 6);
    if (fill) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      fill.style.width = Math.min(100, Math.max(0, (y / max) * 100)).toFixed(2) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }, { passive: true });
  frame();

  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
  var spy = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      var id = entries[i].target.getAttribute('id');
      for (var j = 0; j < links.length; j++) {
        var on = links[j].getAttribute('data-spy') === id;
        links[j].classList.toggle('is-current', on);
        if (on) links[j].setAttribute('aria-current', 'true');
        else links[j].removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  for (var k = 0; k < sections.length; k++) spy.observe(sections[k]);
}

/* --------------------------------------------------------------- counters */
function runCount(node) {
  var target = parseFloat(node.getAttribute('data-count')) || 0;
  var suffix = node.getAttribute('data-suffix') || '';
  var decimals = node.getAttribute('data-decimals') ? parseInt(node.getAttribute('data-decimals'), 10) : 0;
  if (reduce) { node.textContent = target.toFixed(decimals) + suffix; return; }
  var start = performance.now();
  var dur = 1400;
  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    var eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
}

function initCounters() {
  var nodes = qsa('[data-count]');
  if (!nodes.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < nodes.length; i++) runCount(nodes[i]);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (!entries[j].isIntersecting) continue;
      runCount(entries[j].target);
      io.unobserve(entries[j].target);
    }
  }, { threshold: 0.4 });
  for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
}

/* ------------------------------------------------------------ work filter */
function initWorkFilter() {
  var chips = qsa('#workChips .chip');
  var status = $('workStatus');
  var items = qsa('.work .proj');
  if (!chips.length || !items.length) return;
  var active = 'all';

  function apply() {
    var shown = 0;
    for (var i = 0; i < items.length; i++) {
      var cats = (items[i].getAttribute('data-cat') || '').split(' ');
      var visible = active === 'all' || cats.indexOf(active) !== -1;
      items[i].style.display = visible ? '' : 'none';
      if (visible) shown++;
    }
    if (status) {
      status.textContent = shown + (shown === 1 ? ' project' : ' projects') + ' shown';
    }
  }

  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () {
      active = this.getAttribute('data-cat') || 'all';
      for (var j = 0; j < chips.length; j++) {
        var on = chips[j] === this;
        chips[j].classList.toggle('is-on', on);
        chips[j].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      apply();
    });
  }
  apply();
}

/* ---------------------------------------------------------------- slider */
function initSlider() {
  var slider = $('slider');
  var track = $('sliderTrack');
  var prev = $('slidePrev');
  var next = $('slideNext');
  var dotsHost = $('slideDots');
  var autoBtn = $('slideAuto');
  if (!slider || !track) return;
  var slides = track.querySelectorAll('.slide');
  if (!slides.length) return;

  var index = 0;
  var auto = true;
  var timer = null;
  var DELAY = 6500;

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (index * -100) + '%)';
    for (var i = 0; i < dots.length; i++) {
      var on = i === index;
      dots[i].classList.toggle('is-on', on);
      if (on) dots[i].setAttribute('aria-current', 'true');
      else dots[i].removeAttribute('aria-current');
    }
    for (var s = 0; s < slides.length; s++) {
      slides[s].setAttribute('aria-hidden', s === index ? 'false' : 'true');
    }
  }

  var dots = [];
  if (dotsHost) {
    for (var d = 0; d < slides.length; d++) {
      (function (order) {
        var dot = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sdot';
        btn.setAttribute('aria-label', 'Testimonial ' + (order + 1) + ' of ' + slides.length);
        btn.addEventListener('click', function () { goTo(order); restart(); });
        dot.appendChild(btn);
        dotsHost.appendChild(dot);
        dots.push(btn);
      }(d));
    }
  }

  function start() {
    stop();
    if (!auto || reduce) return;
    timer = window.setInterval(function () { goTo(index + 1); }, DELAY);
  }
  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  if (prev) prev.addEventListener('click', function () { goTo(index - 1); restart(); });
  if (next) next.addEventListener('click', function () { goTo(index + 1); restart(); });
  if (autoBtn) {
    autoBtn.addEventListener('click', function () {
      auto = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', auto ? 'true' : 'false');
      this.setAttribute('aria-label', auto ? 'Pause automatic advance' : 'Resume automatic advance');
      restart();
    });
  }
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); restart(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); restart(); }
  });

  goTo(0);
  start();
}

/* ---------------------------------------------------------------- mobile */
function initNav() {
  var burger = $('burger');
  var nav = $('primaryNav');
  if (!burger || !nav) return;
  function close() {
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', open ? 'false' : 'true');
    nav.classList.toggle('is-open', !open);
  });
  var links = nav.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) links[i].addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); burger.focus(); }
  });
}

/* -------------------------------------------------------- contact form */
function setBad(input, msgNode, message) {
  var field = input ? input.closest('.field') : null;
  if (field) field.classList.toggle('is-bad', !!message);
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (msgNode) msgNode.textContent = message || '';
}

function initContact() {
  var form = $('contactForm');
  if (!form) return;
  var name = $('cName');
  var email = $('cEmail');
  var company = $('cCompany');
  var budget = $('cBudget');
  var brief = $('cBrief');
  var consent = $('cConsent');
  var counter = $('cCount');
  var status = $('formStatus');
  var sent = $('sentState');

  if (brief && counter) {
    brief.addEventListener('input', function () {
      if (brief.value.length > 600) brief.value = brief.value.slice(0, 600);
      counter.textContent = brief.value.length + ' / 600';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    var nm = name ? name.value.trim() : '';
    var em = email ? email.value.trim() : '';
    var cp = company ? company.value.trim() : '';
    var bd = budget ? budget.value : '';
    var br = brief ? brief.value.trim() : '';

    if (!nm) { setBad(name, $('cNameMsg'), 'Tell us who you are.'); bad = true; }
    else if (nm.length < 2) { setBad(name, $('cNameMsg'), 'That name looks too short.'); bad = true; }
    else { setBad(name, $('cNameMsg'), ''); }

    if (!em) { setBad(email, $('cEmailMsg'), 'An email address is required.'); bad = true; }
    else if (!EMAIL_RE.test(em)) { setBad(email, $('cEmailMsg'), 'Use the format name@company.com'); bad = true; }
    else { setBad(email, $('cEmailMsg'), ''); }

    if (!cp) { setBad(company, $('cCompanyMsg'), 'Which company is this for?'); bad = true; }
    else { setBad(company, $('cCompanyMsg'), ''); }

    if (!bd) { setBad(budget, $('cBudgetMsg'), 'Pick a band, even a rough one.'); bad = true; }
    else { setBad(budget, $('cBudgetMsg'), ''); }

    if (br.length < 20) { setBad(brief, $('cBriefMsg'), 'A couple of sentences helps us route this.'); bad = true; }
    else if (br.length < 40) { setBad(brief, $('cBriefMsg'), 'A little more detail, please.'); bad = true; }
    else { setBad(brief, $('cBriefMsg'), ''); }

    var consentMsg = $('cConsentMsg');
    if (!consent || !consent.checked) {
      if (consentMsg) consentMsg.textContent = consent ? '' : 'Tick the box so we know it is you.';
      if (consent) consent.setAttribute('aria-invalid', 'true');
      bad = true;
    } else if (consentMsg) { consentMsg.textContent = ''; consent.removeAttribute('aria-invalid'); }

    if (bad) {
      if (status) { status.className = 'form-status is-bad'; status.textContent = 'A few fields still need attention.'; }
      if (sent) sent.hidden = true;
      return;
    }

    if (status) { status.className = 'form-status'; status.textContent = 'Sending...'; }
    var msg = $('sentMsg');
    if (msg) msg.textContent = 'Thanks ' + nm.split(' ')[0] + '. Mara reads every one of these personally and will reply to ' + em + ' within two working days.';
    window.setTimeout(function () {
      if (status) status.textContent = '';
      if (sent) sent.hidden = false;
      form.reset();
      if (counter) counter.textContent = '0 / 600';
    }, reduce ? 0 : 450);
  });

  var live = [name, email, company];
  for (var i = 0; i < live.length; i++) {
    live[i].addEventListener('blur', function () {
      if (!this.value.trim()) return;
      setBad(this, this.parentNode.querySelector('.field__msg'), '');
    });
  }
  if (brief) {
    brief.addEventListener('blur', function () {
      if (this.value.trim().length >= 20) setBad(this, $('cBriefMsg'), '');
    });
  }
}

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
initScroll();
initCounters();
initWorkFilter();
initSlider();
initNav();
initContact();
`,
};