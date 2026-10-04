/**
 * plain-animation — "Animation Showcase"
 * A labelled reference page: entrance reveals, hover micro-interactions,
 * an ambient loop, loading states, scroll meters, magnetic + ripple
 * interaction, and toasts. Every demo has a Replay control.
 */
export default {
  html: `
<a class="skip-link" href="#demos">Skip to the demos</a>
<div class="page-progress" role="presentation"><span class="page-progress__bar" id="pageBar"></span></div>

<header class="hdr" id="hdr">
  <div class="shell hdr__in">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m13 2-10 12h8l-1 8 10-12h-8l1-8Z"/></svg></span>
      <span class="brand__name">Motion<em>Lab</em></span>
    </a>
    <nav class="hdr__nav" id="hdrNav" aria-label="Demo sections">
      <a class="hdr__link" href="#entrance">Entrance</a>
      <a class="hdr__link" href="#hover">Hover</a>
      <a class="hdr__link" href="#ambient">Ambient</a>
      <a class="hdr__link" href="#loading">Loading</a>
      <a class="hdr__link" href="#meters">Meters</a>
      <a class="hdr__link" href="#magnetic">Magnetic</a>
      <a class="hdr__link" href="#toasts">Toasts</a>
    </nav>
    <div class="hdr__actions">
      <button class="ghost-btn hdr__reduce" type="button" id="reduceToggle" aria-pressed="false">
        <span class="ghost-btn__dot" aria-hidden="true"></span>Simulate reduced motion
      </button>
      <button class="replay hdr__replay" type="button" data-replay-all>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
        Replay all
      </button>
      <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="hdrNav" aria-label="Open section menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__open" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__close" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="top">
  <section class="hero" aria-labelledby="heroTitle">
    <div class="hero__grid" aria-hidden="true"></div>
    <div class="shell hero__in">
      <p class="tag">CSS + vanilla JS &middot; no dependencies</p>
      <h1 class="hero__title" id="heroTitle">Seven families of motion, one page, every control in your hands.</h1>
      <p class="hero__lede">A working reference for interface motion: entrance choreography, hover micro-interactions, ambient loops, loading states, scroll-linked meters, magnetic targets and notification toasts. Hit any Replay button to fire the animation again.</p>
      <div class="hero__actions">
        <a class="btn btn--accent" href="#entrance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7V5Z"/></svg>
          Start with entrance
        </a>
        <button class="btn btn--outline" type="button" data-replay-all>Fire everything</button>
      </div>
      <ul class="hero__stats">
        <li><span data-count="23" data-suffix="">0</span><em>keyframe rules</em></li>
        <li><span data-count="7" data-suffix="">0</span><em>motion families</em></li>
        <li><span data-count="11" data-suffix="">0</span><em>replay controls</em></li>
        <li><span data-count="0" data-suffix=" kb">0</span><em>library weight</em></li>
      </ul>
    </div>
  </section>

  <div id="demos">

    <!-- 01 ------------------------------------------------------- entrance -->
    <section class="demo" id="entrance" aria-labelledby="entranceTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>01</span> Entrance &amp; reveal</p>
            <h2 class="demo__title" id="entranceTitle">Choreography beats decoration</h2>
            <p class="demo__note">Elements arrive on a staggered delay rather than all at once. Each card uses a different travel distance so the eye reads depth, not a queue.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-entrance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Replay
          </button>
        </header>
        <div class="stage stage--entrance is-playing" id="stage-entrance">
          <div class="entrance">
            <article class="card rise" style="--d:0ms">
              <span class="card__no">A</span>
              <h3 class="card__title">Fade and lift</h3>
              <p class="card__copy">20px of travel, 620ms, cubic-bezier(.22,.68,0,1). The default for anything below the fold.</p>
            </article>
            <article class="card slide-left" style="--d:110ms">
              <span class="card__no">B</span>
              <h3 class="card__title">Slide from the edge</h3>
              <p class="card__copy">32px horizontal travel with a slight overshoot. Use it once per section, never twice in the same viewport.</p>
            </article>
            <article class="card scale-in" style="--d:220ms">
              <span class="card__no">C</span>
              <h3 class="card__title">Scale with fade</h3>
              <p class="card__copy">0.94 to 1.0 with opacity. Reads as &ldquo;this object was always here, now you can see it&rdquo;.</p>
            </article>
            <article class="card flip-in" style="--d:330ms">
              <span class="card__no">D</span>
              <h3 class="card__title">Rotate into place</h3>
              <p class="card__copy">Six degrees of rotation on the Y axis. Reserved for single, celebratory moments.</p>
            </article>
            <article class="card wipe-in" style="--d:440ms">
              <span class="card__no">E</span>
              <h3 class="card__title">Clip wipe</h3>
              <p class="card__copy">A clip-path wipe with no transform at all. Excellent for text blocks and images.</p>
            </article>
            <article class="card blur-in" style="--d:550ms">
              <span class="card__no">F</span>
              <h3 class="card__title">Blur to focus</h3>
              <p class="card__copy">6px to 0 blur over 700ms. Expensive on large areas, cheap on short labels.</p>
            </article>
          </div>
        </div>
        <ul class="spec">
          <li><b>Duration</b> 620&ndash;760ms</li>
          <li><b>Stagger</b> 110ms per child</li>
          <li><b>Trigger</b> class swap, not reflow</li>
        </ul>
      </div>
    </section>

    <!-- 02 ---------------------------------------------------------- hover -->
    <section class="demo demo--alt" id="hover" aria-labelledby="hoverTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>02</span> Hover &amp; micro-interactions</p>
            <h2 class="demo__title" id="hoverTitle">Six affordances, six sensations</h2>
            <p class="demo__note">Hover your pointer over a tile. The Replay control previews all six at once so you can see them without hunting.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-hover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Preview all
          </button>
        </header>
        <div class="stage stage--hover" id="stage-hover">
          <div class="hover-grid">
            <div class="hv hv--lift"><span class="hv__label">Lift</span><span class="hv__hint">translateY -6px + shadow</span></div>
            <div class="hv hv--sheen"><span class="hv__label">Sheen</span><span class="hv__hint">gradient sweep</span></div>
            <div class="hv hv--wipe"><span class="hv__label">Wipe</span><span class="hv__hint">underline from left</span></div>
            <div class="hv hv--nudge"><span class="hv__label">Nudge</span><svg class="hv__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg><span class="hv__hint">icon steps forward</span></div>
            <div class="hv hv--glow"><span class="hv__label">Glow</span><span class="hv__hint">ring bloom</span></div>
            <div class="hv hv--tilt"><span class="hv__label">Tilt</span><span class="hv__hint">3D perspective</span></div>
          </div>
        </div>
        <ul class="spec">
          <li><b>Trigger</b> :hover + :focus-visible</li>
          <li><b>Timing</b> 180&ndash;260ms</li>
          <li><b>Also</b> :active drops 2px</li>
        </ul>
      </div>
    </section>

    <!-- 03 -------------------------------------------------------- ambient -->
    <section class="demo" id="ambient" aria-labelledby="ambientTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>03</span> Ambient loop</p>
            <h2 class="demo__title" id="ambientTitle">Motion with no trigger</h2>
            <p class="demo__note">Slow orbital drift, a breathing glow and a moving mesh gradient. Ambient motion should be slow enough that you stop noticing it within ten seconds.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-ambient">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Restart loop
          </button>
        </header>
        <div class="stage stage--ambient is-playing" id="stage-ambient">
          <div class="ambient">
            <span class="orb orb--1" aria-hidden="true"></span>
            <span class="orb orb--2" aria-hidden="true"></span>
            <span class="orb orb--3" aria-hidden="true"></span>
            <span class="orb orb--4" aria-hidden="true"></span>
            <span class="ambient__glow" aria-hidden="true"></span>
            <div class="ambient__copy">
              <p class="ambient__label">Orbital drift</p>
              <p class="ambient__text">Four bodies, 18 to 34 second periods, ease-in-out, infinite. Repositioned with transform only so the compositor handles it.</p>
            </div>
            <div class="ambient__rings" aria-hidden="true">
              <span class="ring"></span><span class="ring"></span><span class="ring"></span>
            </div>
          </div>
        </div>
        <ul class="spec">
          <li><b>Duration</b> 18&ndash;34s infinite</li>
          <li><b>Property</b> transform / opacity only</li>
          <li><b>Care</b> never on text you must read</li>
        </ul>
      </div>
    </section>

    <!-- 04 -------------------------------------------------------- loading -->
    <section class="demo demo--alt" id="loading" aria-labelledby="loadingTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>04</span> Loading states</p>
            <h2 class="demo__title" id="loadingTitle">Skeletons beat spinners</h2>
            <p class="demo__note">A skeleton tells the shape of what is coming. Spinners tell the reader to wait. Use a skeleton for content and a spinner for actions.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Replay
          </button>
        </header>
        <div class="stage stage--loading is-loading" id="stage-loading">
          <div class="load-grid">
            <div class="skel-card">
              <div class="skel skel--media"></div>
              <div class="skel-card__body">
                <div class="skel skel--line" style="--w:82%"></div>
                <div class="skel skel--line" style="--w:96%"></div>
                <div class="skel skel--line" style="--w:58%"></div>
                <div class="skel-row"><div class="skel skel--avatar"></div><div class="skel skel--line" style="--w:40%"></div></div>
              </div>
            </div>
            <div class="skel-list">
              <div class="skel-item"><div class="skel skel--avatar"></div><div class="skel-item__body"><div class="skel skel--line" style="--w:64%"></div><div class="skel skel--line" style="--w:38%"></div></div></div>
              <div class="skel-item"><div class="skel skel--avatar"></div><div class="skel-item__body"><div class="skel skel--line" style="--w:48%"></div><div class="skel skel--line" style="--w:70%"></div></div></div>
              <div class="skel-item"><div class="skel skel--avatar"></div><div class="skel-item__body"><div class="skel skel--line" style="--w:72%"></div><div class="skel skel--line" style="--w:30%"></div></div></div>
              <div class="skel-item"><div class="skel skel--avatar"></div><div class="skel-item__body"><div class="skel skel--line" style="--w:56%"></div><div class="skel skel--line" style="--w:44%"></div></div></div>
            </div>
            <div class="spinner-set">
              <div class="sp"><span class="sp__ring"></span><em>Ring</em></div>
              <div class="sp"><span class="sp__dots"><i></i><i></i><i></i></span><em>Dots</em></div>
              <div class="sp"><span class="sp__bars"><i></i><i></i><i></i><i></i></span><em>Bars</em></div>
              <div class="sp"><span class="sp__arc"></span><em>Arc</em></div>
            </div>
          </div>
          <div class="load-caption">
            <span class="sp__ring sp__ring--sm" aria-hidden="true"></span>
            <p>Content region is loading&hellip;</p>
          </div>
        </div>
        <ul class="spec">
          <li><b>Shimmer</b> 1.4s linear infinite</li>
          <li><b>Spinners</b> 900ms&ndash;1.2s infinite</li>
          <li><b>Rule</b> never a full-page blocker over 400ms</li>
        </ul>
      </div>
    </section>

    <!-- 05 --------------------------------------------------------- meters -->
    <section class="demo" id="meters" aria-labelledby="metersTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>05</span> Scroll-linked meters</p>
            <h2 class="demo__title" id="metersTitle">Progress that means something</h2>
            <p class="demo__note">These fill when the section enters the viewport and refilling is instant on replay. Bars animate width; the ring animates stroke-dashoffset.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-meters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Refill
          </button>
        </header>
        <div class="stage stage--meters" id="stage-meters">
          <div class="meters">
            <div class="meter">
              <div class="meter__top"><span class="meter__name">Motion token coverage</span><span class="meter__val" data-count="86" data-suffix="%">0%</span></div>
              <div class="bar" data-bar data-value="86"><span class="bar__fill"></span></div>
            </div>
            <div class="meter">
              <div class="meter__top"><span class="meter__name">Reduced-motion guard coverage</span><span class="meter__val" data-count="100" data-suffix="%">0%</span></div>
              <div class="bar" data-bar data-value="100"><span class="bar__fill"></span></div>
            </div>
            <div class="meter">
              <div class="meter__top"><span class="meter__name">Compositor-only properties</span><span class="meter__val" data-count="74" data-suffix="%">0%</span></div>
              <div class="bar" data-bar data-value="74"><span class="bar__fill"></span></div>
            </div>
            <div class="meter">
              <div class="meter__top"><span class="meter__name">Frame budget, 60fps target</span><span class="meter__val" data-count="58" data-suffix="%">0%</span></div>
              <div class="bar" data-bar data-value="58"><span class="bar__fill"></span></div>
            </div>
          </div>
          <div class="ring-meter">
            <svg class="ring-meter__svg" viewBox="0 0 140 140" aria-hidden="true">
              <circle class="ring-meter__track" cx="70" cy="70" r="58" pathLength="100"></circle>
              <circle class="ring-meter__bar" cx="70" cy="70" r="58" pathLength="100" data-ring data-value="92"></circle>
            </svg>
            <div class="ring-meter__mid">
              <span class="ring-meter__num" data-count="92" data-suffix="">0</span>
              <span class="ring-meter__cap">GPU friendly</span>
            </div>
          </div>
        </div>
        <ul class="spec">
          <li><b>Trigger</b> IntersectionObserver at 35%</li>
          <li><b>Fill</b> 1100ms cubic-bezier(.22,.68,0,1)</li>
          <li><b>Ring</b> stroke-dashoffset 100 to 0</li>
        </ul>
      </div>
    </section>

    <!-- 06 ------------------------------------------------------- magnetic -->
    <section class="demo demo--alt" id="magnetic" aria-labelledby="magneticTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>06</span> Pointer-driven interaction</p>
            <h2 class="demo__title" id="magneticTitle">Magnetic target and ripple</h2>
            <p class="demo__note">The button is pulled toward your pointer with a spring-like ease and released on exit. The plate spawns a ripple from the exact click coordinates.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-magnetic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Clear
          </button>
        </header>
        <div class="stage stage--magnetic" id="stage-magnetic">
          <div class="mag-wrap">
            <span class="mag-field" aria-hidden="true"></span>
            <button class="magnet" id="magnet" type="button">
              <span class="magnet__core" id="magnetCore">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M12 2v6"/><path d="M12 16v6"/><path d="M5 6l4 4"/><path d="M15 14l4 4"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="m5 18 4-4"/><path d="m15 10 4-4"/></svg>
                <span class="magnet__label">Pull me</span>
              </span>
              <span class="magnet__ring" aria-hidden="true"></span>
            </button>
            <p class="mag-hint">Move your pointer inside the dashed field.</p>
          </div>
          <div class="ripple-zone" id="rippleZone" role="button" tabindex="0" aria-label="Ripple plate. Click anywhere to spawn a ripple.">
            <span class="ripple-zone__grid" aria-hidden="true"></span>
            <p class="ripple-zone__label">Click anywhere</p>
            <span class="ripple-zone__count" id="rippleCount" aria-hidden="true">0</span>
          </div>
        </div>
        <ul class="spec">
          <li><b>Radius</b> 150px attraction</li>
          <li><b>Strength</b> 0.32 of the offset</li>
          <li><b>Ripple</b> 620ms scale and fade</li>
        </ul>
      </div>
    </section>

    <!-- 07 --------------------------------------------------------- toasts -->
    <section class="demo" id="toasts" aria-labelledby="toastsTitle">
      <div class="shell">
        <header class="demo__head" data-reveal>
          <div class="demo__heading">
            <p class="demo__index"><span>07</span> Notifications</p>
            <h2 class="demo__title" id="toastsTitle">Toasts that stack and retire</h2>
            <p class="demo__note">Each toast slides in from the right, holds for four seconds, then collapses. The progress line is driven by a single CSS animation rather than a timer loop.</p>
          </div>
          <button class="replay" type="button" data-replay="#stage-toasts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/></svg>
            Fire all four
          </button>
        </header>
        <div class="stage stage--toasts" id="stage-toasts">
          <div class="toast-buttons">
            <button class="btn btn--outline" type="button" data-toast="success">Success</button>
            <button class="btn btn--outline" type="button" data-toast="info">Information</button>
            <button class="btn btn--outline" type="button" data-toast="warn">Warning</button>
            <button class="btn btn--outline" type="button" data-toast="error">Error</button>
          </div>
          <div class="toast-stack" id="toastStack" aria-live="polite" aria-label="Notification previews"></div>
          <p class="toast-note">Built in-page, no <code>alert()</code>, dismissible by click and by keyboard.</p>
        </div>
        <ul class="spec">
          <li><b>Enter</b> 380ms slide and fade</li>
          <li><b>Hold</b> 4000ms</li>
          <li><b>Exit</b> 280ms height collapse</li>
        </ul>
      </div>
    </section>

    <!-- reduced motion explainer ------------------------------------- -->
    <section class="motion-note" id="motion-note" aria-labelledby="motionNoteTitle">
      <div class="shell">
        <div class="motion-note__grid" data-reveal>
          <div class="motion-note__copy">
            <p class="demo__index"><span>08</span> Accessibility</p>
            <h2 class="demo__title" id="motionNoteTitle">How reduced motion is handled here</h2>
            <p>Every animation on this page is gated by one guard read from the operating system preference. When <code>prefers-reduced-motion: reduce</code> is set, transitions collapse to 0.001ms, infinite loops are cancelled, scroll-linked counters jump straight to their final value, and reveal content is made visible immediately instead of waiting for an intersection.</p>
            <p>Motion is a preference, not a right. Roughly one in twenty visitors will have this switch on, and vestibular disorders make large translate and scale effects genuinely unpleasant.</p>
            <div class="motion-note__actions">
              <button class="btn btn--accent" type="button" id="reduceToggle2" aria-pressed="false">Simulate reduced motion</button>
              <button class="btn btn--outline" type="button" id="reduceReset">Reset the page</button>
            </div>
            <p class="motion-note__readout">Your system preference right now: <strong id="motionReadout">checking&hellip;</strong></p>
          </div>
          <ul class="motion-note__list">
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Global media query collapses every transition</li>
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Infinite keyframes removed, not just slowed</li>
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Counters render their final value immediately</li>
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Smooth scroll falls back to instant jumps</li>
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Magnetic pull is disabled entirely, not weakened</li>
            <li><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span> Reveal observer short-circuits to the visible state</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</main>

<footer class="foot">
  <div class="shell">
    <div class="foot__grid">
      <div class="foot__brand">
        <a class="brand" href="#top">
          <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m13 2-10 12h8l-1 8 10-12h-8l1-8Z"/></svg></span>
          <span class="brand__name">Motion<em>Lab</em></span>
        </a>
        <p class="foot__blurb">A single-file interface motion reference. No build step, no framework, no external assets beyond one font request.</p>
        <ul class="foot__social">
          <li><a href="#top" aria-label="Motion Lab on GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6 0C6.7 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a></li>
          <li><a href="#top" aria-label="Motion Lab on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
          <li><a href="#top" aria-label="Motion Lab on Dribbble"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M5 8h9a4 4 0 0 1 4 4"/><path d="M8.5 3.5A14 14 0 0 0 3.5 9"/></svg></a></li>
        </ul>
      </div>
      <nav class="foot__col" aria-label="Demos">
        <h2 class="foot__title">Demos</h2>
        <ul><li><a href="#entrance">Entrance</a></li><li><a href="#hover">Hover</a></li><li><a href="#ambient">Ambient</a></li><li><a href="#loading">Loading</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Interaction">
        <h2 class="foot__title">Interaction</h2>
        <ul><li><a href="#meters">Meters</a></li><li><a href="#magnetic">Magnetic</a></li><li><a href="#toasts">Toasts</a></li><li><a href="#motion-note">Reduced motion</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Reference">
        <h2 class="foot__title">Reference</h2>
        <ul><li><a href="#top">Easing curves</a></li><li><a href="#top">Duration scale</a></li><li><a href="#top">Property budget</a></li><li><a href="#top">Changelog</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Elsewhere">
        <h2 class="foot__title">Elsewhere</h2>
        <ul><li><a href="#top">Case studies</a></li><li><a href="#top">Newsletter</a></li><li><a href="#top">Colophon</a></li><li><a href="#top">Contact</a></li></ul>
      </nav>
    </div>
    <div class="foot__legal">
      <p>&copy; 2026 Motion Lab. Independent reference, no affiliation with any browser vendor.</p>
      <p>Space Grotesk and Inter &middot; Built as one HTML fragment</p>
    </div>
  </div>
</footer>

<div class="toaster" id="toaster" aria-live="polite" aria-atomic="false" aria-label="Notifications"></div>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg: #08080c;
  --bg-2: #0e0e14;
  --panel: #13131b;
  --panel-2: #1a1a24;
  --line: #24242f;
  --line-2: #33333f;
  --ink: #f3f4f6;
  --ink-2: #b9bbc6;
  --muted: #83858f;
  --accent: #c8f73c;
  --accent-2: #a8d91f;
  --accent-dim: rgba(200, 247, 60, .13);
  --ok: #4ade80;
  --info: #60a5fa;
  --warn: #fbbf24;
  --bad: #fb7185;
  --radius-sm: 7px;
  --radius: 12px;
  --radius-lg: 18px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.5);
  --shadow: 0 14px 34px -18px rgba(0,0,0,.9), 0 2px 8px rgba(0,0,0,.4);
  --shadow-lg: 0 40px 80px -40px rgba(0,0,0,1), 0 10px 26px rgba(0,0,0,.5);
  --font-display: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ease: cubic-bezier(.22, .68, 0, 1);
  --ease-out: cubic-bezier(.16, 1, .3, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 86px; }
body {
  margin: 0; padding: 0;
  background: var(--bg); color: var(--ink);
  font-family: var(--font-body); font-size: 16px; line-height: 1.6;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-display); margin: 0; line-height: 1.08; letter-spacing: -.03em; font-weight: 700; }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .88em; background: var(--panel-2); padding: .12em .38em; border-radius: 5px; color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 5px; }
.shell { width: 100%; max-width: 1240px; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.1em; height: 1.1em; flex: none; }
.sr-only, [aria-hidden='true']:not(.sr-only) { }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 300; transform: translateY(-180%);
  background: var(--accent); color: var(--bg); padding: .6rem 1rem; font-weight: 700;
  border-radius: var(--radius-sm); transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }

.page-progress { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 95; background: var(--line); pointer-events: none; }
.page-progress__bar { display: block; height: 100%; width: 0%; background: var(--accent); box-shadow: 0 0 12px var(--accent-dim); transition: width .1s linear; }

/* ------------------------------------------------------------------ header */
.hdr {
  position: sticky; top: 0; z-index: 80;
  background: rgba(8, 8, 12, .78); backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), background .25s var(--ease), box-shadow .25s var(--ease);
}
.hdr.is-stuck { border-bottom-color: var(--line); box-shadow: var(--shadow); background: rgba(8, 8, 12, .93); }
.hdr__in { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.6rem); min-height: 68px; }
.brand { display: inline-flex; align-items: center; gap: .55rem; flex: none; }
.brand__mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--accent); color: var(--bg); }
.brand__mark .icon { width: 19px; height: 19px; }
.brand__name { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; letter-spacing: -.02em; }
.brand__name em { font-style: normal; color: var(--accent); }
.hdr__nav { display: flex; align-items: center; gap: clamp(.4rem, 1.4vw, 1.1rem); margin-left: auto; }
.hdr__link {
  position: relative; font-size: .8rem; font-weight: 500; color: var(--muted);
  padding: .35rem .15rem; transition: color .18s var(--ease);
}
.hdr__link::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .25s var(--ease); }
.hdr__link:hover, .hdr__link:focus-visible { color: var(--ink); }
.hdr__link:hover::after, .hdr__link:focus-visible::after { transform: scaleX(1); }
.hdr__actions { display: flex; align-items: center; gap: .5rem; margin-left: auto; }
.hdr__nav + .hdr__actions { margin-left: 0; }

.replay, .ghost-btn {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .5rem .85rem; font-size: .78rem; font-weight: 700; letter-spacing: .01em;
  background: var(--panel); border: 1px solid var(--line-2); border-radius: 999px; cursor: pointer;
  color: var(--ink);
  transition: background .2s var(--ease), border-color .2s var(--ease), transform .16s var(--ease), color .2s var(--ease);
}
.replay:hover, .ghost-btn:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
.replay:active, .ghost-btn:active { transform: translateY(0); }
.replay .icon { width: 15px; height: 15px; }
.replay:hover .icon { animation: spin-once .7s var(--ease); }
.ghost-btn__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--line-2); transition: background .2s var(--ease); }
.ghost-btn[aria-pressed='true'] { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.ghost-btn[aria-pressed='true'] .ghost-btn__dot { background: var(--accent); }

.burger { display: none; place-items: center; width: 40px; height: 40px; background: var(--panel); border: 1px solid var(--line-2); border-radius: 10px; cursor: pointer; }
.burger .icon { width: 19px; height: 19px; grid-area: 1 / 1; }
.burger__close { opacity: 0; transform: scale(.7); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.burger[aria-expanded='true'] .burger__open { opacity: 0; transform: scale(.7); }
.burger[aria-expanded='true'] .burger__close { opacity: 1; transform: scale(1); }

.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .78rem 1.3rem; font-size: .88rem; font-weight: 700;
  border: 1px solid transparent; border-radius: 10px; cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 25%, rgba(255,255,255,.3) 48%, transparent 72%); transform: translateX(-130%); transition: transform .6s var(--ease); }
.btn:hover::after { transform: translateX(130%); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--accent { background: var(--accent); color: var(--bg); }
.btn--accent:hover { background: var(--accent-2); box-shadow: 0 12px 30px -14px var(--accent); }
.btn--outline { background: transparent; border-color: var(--line-2); color: var(--ink); }
.btn--outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* -------------------------------------------------------------------- hero */
.hero { position: relative; padding-block: clamp(3rem, 9vw, 6.5rem) clamp(2.5rem, 6vw, 4rem); overflow: hidden; }
.hero__grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(80% 70% at 50% 20%, #000, transparent 78%);
  opacity: .55;
  animation: grid-drift 26s linear infinite;
}
.hero__in { position: relative; z-index: 1; }
.tag {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent);
  border: 1px solid var(--line-2); border-radius: 999px; padding: .35rem .8rem; background: var(--bg-2);
}
.hero__title {
  font-size: clamp(2.3rem, 6.4vw, 4.5rem); margin-block: 1.1rem .9rem; max-width: 19ch;
  background: linear-gradient(180deg, var(--ink) 0%, color-mix(in srgb, var(--ink) 55%, transparent) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.hero__lede { font-size: clamp(1rem, 1.3vw, 1.1rem); color: var(--ink-2); max-width: 60ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 1.75rem; }
.hero__stats {
  display: grid; gap: 1rem; margin-top: clamp(2rem, 5vw, 3.25rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  padding-top: 1.5rem; border-top: 1px solid var(--line);
}
.hero__stats li { display: grid; }
.hero__stats span { font-family: var(--font-display); font-size: clamp(1.6rem, 3.4vw, 2.2rem); font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; line-height: 1.1; }
.hero__stats em { font-style: normal; font-size: .76rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }

/* ------------------------------------------------------------------- demos */
.demo { padding-block: clamp(2.75rem, 6vw, 4.75rem); border-top: 1px solid var(--line); scroll-margin-top: 84px; }
.demo--alt { background: var(--bg-2); }
.demo__head { display: flex; flex-wrap: wrap; gap: 1rem 2rem; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; }
.demo__heading { max-width: 62ch; }
.demo__index { display: flex; align-items: center; gap: .55rem; font-size: .74rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.demo__index span {
  display: grid; place-items: center; width: 26px; height: 26px; border-radius: 7px;
  background: var(--accent); color: var(--bg); font-family: var(--font-display); font-size: .78rem; letter-spacing: 0;
}
.demo__title { font-size: clamp(1.5rem, 3.4vw, 2.35rem); margin-block: .6rem .5rem; }
.demo__note { font-size: .9rem; color: var(--muted); }

.stage { position: relative; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--panel); padding: clamp(1rem, 3vw, 1.75rem); overflow: hidden; }
.spec {
  display: flex; flex-wrap: wrap; gap: .4rem 1.75rem; margin-top: 1rem;
  font-size: .76rem; color: var(--muted);
}
.spec b { color: var(--ink-2); font-weight: 600; }

/* 01 entrance */
.entrance { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); }
.card {
  display: grid; gap: .4rem; align-content: start;
  padding: 1.1rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-2);
  will-change: transform, opacity;
}
.card__no { font-family: var(--font-display); font-size: .72rem; font-weight: 700; color: var(--accent); letter-spacing: .1em; }
.card__title { font-size: 1rem; }
.card__copy { font-size: .82rem; color: var(--muted); }
.stage--entrance.is-playing .rise { animation: rise-in .62s var(--ease-out) both; animation-delay: var(--d, 0ms); }
.stage--entrance.is-playing .slide-left { animation: slide-left-in .68s var(--ease-out) both; animation-delay: var(--d, 0ms); }
.stage--entrance.is-playing .scale-in { animation: scale-in .6s var(--ease-out) both; animation-delay: var(--d, 0ms); }
.stage--entrance.is-playing .flip-in { animation: flip-in .74s var(--ease-out) both; animation-delay: var(--d, 0ms); }
.stage--entrance.is-playing .wipe-in { animation: wipe-in .66s var(--ease-out) both; animation-delay: var(--d, 0ms); }
.stage--entrance.is-playing .blur-in { animation: blur-in .72s var(--ease-out) both; animation-delay: var(--d, 0ms); }

/* 02 hover */
.hover-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.hv {
  position: relative; display: grid; gap: .25rem; place-items: center; text-align: center;
  min-height: 124px; padding: 1rem; border-radius: var(--radius);
  border: 1px solid var(--line-2); background: var(--bg-2); cursor: pointer;
  transition: transform .24s var(--ease), box-shadow .24s var(--ease), border-color .24s var(--ease), background .24s var(--ease);
  overflow: hidden;
}
.hv__label { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; }
.hv__hint { font-size: .74rem; color: var(--muted); }
.hv__icon { width: 20px; height: 20px; color: var(--accent); transition: transform .24s var(--ease); }
.hv--lift:hover, .hv--lift.force-hover { transform: translateY(-6px); box-shadow: var(--shadow); border-color: var(--accent); }
.hv--sheen::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 45%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.14), transparent); transform: translateX(-150%); }
.hv--sheen:hover::after, .hv--sheen.force-hover::after { animation: sheen-sweep .8s var(--ease); }
.hv--wipe .hv__label { position: relative; }
.hv--wipe .hv__label::after { content: ''; position: absolute; left: 0; bottom: -3px; height: 2px; width: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .3s var(--ease); }
.hv--wipe:hover .hv__label::after, .hv--wipe.force-hover .hv__label::after { transform: scaleX(1); }
.hv--nudge:hover .hv__icon, .hv--nudge.force-hover .hv__icon { transform: translate(4px, -4px); }
.hv--glow:hover, .hv--glow.force-hover { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-dim), 0 0 30px -6px var(--accent); }
.hv--tilt { transform-style: preserve-3d; }
.hv--tilt:hover, .hv--tilt.force-hover { transform: perspective(520px) rotateX(12deg) rotateY(-12deg) translateZ(6px); border-color: var(--accent); }

/* 03 ambient */
.stage--ambient { background: radial-gradient(120% 120% at 50% 50%, #101018, var(--panel) 70%); }
.ambient { position: relative; min-height: clamp(240px, 42vw, 380px); display: grid; place-items: center; }
.orb { position: absolute; border-radius: 50%; filter: blur(2px); }
.orb--1 { width: 92px; height: 92px; left: 12%; top: 18%; background: radial-gradient(circle at 32% 28%, #d9ff7a, var(--accent-2)); box-shadow: 0 0 60px -8px var(--accent); }
.orb--2 { width: 62px; height: 62px; right: 16%; top: 26%; background: radial-gradient(circle at 34% 30%, #8fd0ff, #2563eb); box-shadow: 0 0 50px -10px #3b82f6; }
.orb--3 { width: 46px; height: 46px; right: 34%; bottom: 16%; background: radial-gradient(circle at 34% 30%, #ffb4c8, #be185d); box-shadow: 0 0 44px -12px #db2777; }
.orb--4 { width: 34px; height: 34px; left: 30%; bottom: 22%; background: radial-gradient(circle at 34% 30%, #c4b5fd, #6d28d9); box-shadow: 0 0 40px -12px #7c3aed; }
.stage--ambient.is-playing .orb--1 { animation: orbit-a 18s var(--ease) infinite; }
.stage--ambient.is-playing .orb--2 { animation: orbit-b 24s var(--ease) infinite; }
.stage--ambient.is-playing .orb--3 { animation: orbit-c 34s var(--ease) infinite; }
.stage--ambient.is-playing .orb--4 { animation: orbit-d 21s var(--ease) infinite; }
.ambient__glow {
  position: absolute; inset: 14%; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,247,60,.16), transparent 66%);
  animation: breathe 9s var(--ease) infinite;
}
.ambient__copy { position: relative; z-index: 2; text-align: center; max-width: 44ch; padding: 1rem; }
.ambient__label { font-family: var(--font-display); font-size: clamp(1.3rem, 3vw, 1.9rem); font-weight: 700; color: var(--accent); letter-spacing: -.02em; }
.ambient__text { font-size: .88rem; color: var(--ink-2); margin-top: .5rem; }
.ambient__rings { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.ring { position: absolute; border: 1px solid var(--line-2); border-radius: 50%; }
.ring:nth-child(1) { width: 30%; aspect-ratio: 1; }
.ring:nth-child(2) { width: 52%; aspect-ratio: 1; }
.ring:nth-child(3) { width: 76%; aspect-ratio: 1; }
.stage--ambient.is-playing .ring:nth-child(1) { animation: ring-ping 5s var(--ease) infinite; }
.stage--ambient.is-playing .ring:nth-child(2) { animation: ring-ping 5s var(--ease) 1.1s infinite; }
.stage--ambient.is-playing .ring:nth-child(3) { animation: ring-ping 5s var(--ease) 2.2s infinite; }

/* 04 loading */
.load-grid { display: grid; gap: clamp(1rem, 2.5vw, 1.5rem); grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); align-items: start; }
.skel {
  position: relative; overflow: hidden; border-radius: var(--radius-sm);
  background: var(--panel-2);
}
.skel::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.09) 45%, transparent 70%);
  transform: translateX(-100%);
}
.stage--loading.is-loading .skel::after { animation: shimmer 1.4s linear infinite; }
.skel--media { aspect-ratio: 16 / 9; border-radius: var(--radius); }
.skel--line { height: 11px; width: var(--w, 100%); }
.skel--avatar { width: 34px; height: 34px; border-radius: 50%; flex: none; }
.skel-card { display: grid; gap: .8rem; }
.skel-card__body { display: grid; gap: .55rem; }
.skel-row { display: flex; align-items: center; gap: .6rem; margin-top: .2rem; }
.skel-list { display: grid; gap: .9rem; }
.skel-item { display: flex; align-items: center; gap: .7rem; }
.skel-item__body { display: grid; gap: .45rem; flex: 1; }
.spinner-set { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; justify-items: center; align-content: center; padding: .5rem 0; }
.sp { display: grid; justify-items: center; gap: .5rem; }
.sp em { font-style: normal; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.sp__ring {
  width: 34px; height: 34px; border-radius: 50%;
  border: 3px solid var(--line-2); border-top-color: var(--accent);
}
.sp__ring--sm { width: 18px; height: 18px; border-width: 2px; }
.stage--loading.is-loading .sp__ring { animation: spin-slow 1s linear infinite; }
.sp__dots { display: inline-flex; gap: 5px; }
.sp__dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); }
.stage--loading.is-loading .sp__dots i { animation: dot-bounce 1s var(--ease) infinite; }
.stage--loading.is-loading .sp__dots i:nth-child(2) { animation-delay: .13s; }
.stage--loading.is-loading .sp__dots i:nth-child(3) { animation-delay: .26s; }
.sp__bars { display: inline-flex; align-items: flex-end; gap: 4px; height: 30px; }
.sp__bars i { width: 6px; border-radius: 3px; background: var(--accent); }
.sp__bars i:nth-child(1) { height: 40%; }
.sp__bars i:nth-child(2) { height: 70%; }
.sp__bars i:nth-child(3) { height: 100%; }
.sp__bars i:nth-child(4) { height: 60%; }
.stage--loading.is-loading .sp__bars i { animation: bar-stretch 1s var(--ease) infinite; }
.stage--loading.is-loading .sp__bars i:nth-child(2) { animation-delay: .1s; }
.stage--loading.is-loading .sp__bars i:nth-child(3) { animation-delay: .2s; }
.stage--loading.is-loading .sp__bars i:nth-child(4) { animation-delay: .3s; }
.sp__arc { width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent; border-top-color: var(--accent); border-right-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.stage--loading.is-loading .sp__arc { animation: spin-arc 1.4s cubic-bezier(.6,.05,.3,.95) infinite; }
.load-caption {
  display: flex; align-items: center; justify-content: center; gap: .6rem; margin-top: 1.25rem;
  padding-top: 1rem; border-top: 1px solid var(--line); font-size: .82rem; color: var(--muted);
}
.stage--loading.is-loading .sp__ring--sm { animation: spin-slow 1s linear infinite; }

/* 05 meters */
.stage--meters { display: grid; gap: clamp(1.25rem, 3vw, 2.25rem); grid-template-columns: minmax(0, 1fr) minmax(0, 220px); align-items: center; }
.meters { display: grid; gap: 1.1rem; }
.meter__top { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: .45rem; }
.meter__name { font-size: .84rem; color: var(--ink-2); font-weight: 500; }
.meter__val { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--accent); font-variant-numeric: tabular-nums; }
.bar { height: 9px; border-radius: 999px; background: var(--panel-2); overflow: hidden; border: 1px solid var(--line); }
.bar__fill {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--accent-2), var(--accent));
  border-radius: inherit;
  transition: width 1.1s var(--ease);
}
.bar.is-filling .bar__fill { box-shadow: 0 0 16px -2px var(--accent); }
.ring-meter { position: relative; display: grid; place-items: center; justify-self: center; }
.ring-meter__svg { width: 100%; max-width: 190px; transform: rotate(-90deg); }
.ring-meter__track { fill: none; stroke: var(--panel-2); stroke-width: 11; }
.ring-meter__bar {
  fill: none; stroke: var(--accent); stroke-width: 11; stroke-linecap: round;
  stroke-dasharray: 100; stroke-dashoffset: 100;
  transition: stroke-dashoffset 1.2s var(--ease);
}
.ring-meter__mid { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: .1rem; }
.ring-meter__num { font-family: var(--font-display); font-size: clamp(1.9rem, 4vw, 2.5rem); font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.ring-meter__cap { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

/* 06 magnetic */
.stage--magnetic { display: grid; gap: 1.25rem; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); align-items: stretch; }
.mag-wrap { position: relative; display: grid; place-items: center; gap: .9rem; padding: 1rem; border-radius: var(--radius); border: 1px dashed var(--line-2); }
.mag-field { position: absolute; inset: 0; background: radial-gradient(circle at 50% 45%, var(--accent-dim), transparent 62%); opacity: 0; transition: opacity .3s var(--ease); }
.mag-wrap.is-active .mag-field { opacity: 1; }
.magnet {
  position: relative; width: 150px; height: 150px; border-radius: 50%;
  background: transparent; border: 0; cursor: pointer; padding: 0;
  transition: transform .42s var(--ease);
  will-change: transform;
}
.magnet__core {
  position: absolute; inset: 16px; border-radius: 50%;
  display: grid; place-items: center; gap: .35rem; align-content: center;
  background: linear-gradient(160deg, var(--accent), var(--accent-2));
  color: var(--bg); box-shadow: 0 18px 40px -18px var(--accent), inset 0 1px 0 rgba(255,255,255,.4);
  transition: transform .18s var(--ease);
}
.magnet:hover .magnet__core { transform: scale(1.06); }
.magnet:active .magnet__core { transform: scale(.97); }
.magnet__core .icon { width: 28px; height: 28px; }
.magnet__label { font-family: var(--font-display); font-size: .95rem; font-weight: 700; }
.magnet__ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--line-2); opacity: 0; }
.mag-wrap.is-active .magnet__ring { opacity: 1; animation: ring-ping 2.6s var(--ease) infinite; }
.mag-hint { font-size: .76rem; color: var(--muted); text-align: center; }

.ripple-zone {
  position: relative; overflow: hidden; min-height: 100%;
  display: grid; place-items: center; gap: .4rem; align-content: center;
  border: 1px solid var(--line-2); border-radius: var(--radius);
  background: radial-gradient(120% 120% at 30% 20%, #16161f, #0b0b11);
  cursor: pointer; user-select: none;
  transition: border-color .22s var(--ease);
}
.ripple-zone:hover { border-color: var(--accent); }
.ripple-zone:active { border-color: var(--accent-2); }
.ripple-zone__grid { position: absolute; inset: 0; background-image: radial-gradient(var(--line-2) 1px, transparent 1px); background-size: 22px 22px; opacity: .5; }
.ripple-zone__label { position: relative; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--ink-2); }
.ripple-zone__count { position: relative; font-family: var(--font-display); font-size: 2.4rem; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; line-height: 1; }
.ripple {
  position: absolute; border-radius: 50%; transform: translate(-50%, -50%) scale(0);
  background: radial-gradient(circle, rgba(200,247,60,.55), rgba(200,247,60,0) 70%);
  pointer-events: none;
  animation: ripple-out .62s var(--ease-out) forwards;
}

/* 07 toasts */
.stage--toasts { display: grid; gap: 1.25rem; }
.toast-buttons { display: flex; flex-wrap: wrap; gap: .6rem; }
.toast-stack { display: grid; gap: .6rem; min-height: 96px; }
.toast-note { font-size: .78rem; color: var(--muted); }
.toaster { position: fixed; right: clamp(.75rem, 3vw, 1.5rem); bottom: clamp(.75rem, 3vw, 1.5rem); z-index: 120; display: grid; gap: .55rem; width: min(360px, calc(100vw - 1.5rem)); }
.tst {
  position: relative; overflow: hidden; display: grid;
  grid-template-columns: auto 1fr auto; gap: .7rem; align-items: start;
  padding: .85rem .9rem; border-radius: var(--radius);
  background: var(--panel-2); border: 1px solid var(--line-2);
  box-shadow: var(--shadow-lg);
  animation: toast-in .38s var(--ease-out) both;
}
.tst.is-leaving { animation: toast-out .28s var(--ease) forwards; }
.tst__icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; }
.tst__icon .icon { width: 15px; height: 15px; }
.tst__body { display: grid; gap: .12rem; }
.tst__title { font-size: .86rem; font-weight: 700; }
.tst__msg { font-size: .78rem; color: var(--muted); }
.tst__close { background: none; border: 0; color: var(--muted); cursor: pointer; padding: 0; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; transition: color .18s var(--ease), background .18s var(--ease); }
.tst__close:hover { color: var(--ink); background: var(--line); }
.tst__close .icon { width: 14px; height: 14px; }
.tst__bar { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: currentColor; transform-origin: left; animation: toast-bar 4s linear forwards; }
.tst--success { color: var(--ok); }
.tst--success .tst__icon { background: rgba(74,222,128,.14); color: var(--ok); }
.tst--info { color: var(--info); }
.tst--info .tst__icon { background: rgba(96,165,250,.14); color: var(--info); }
.tst--warn { color: var(--warn); }
.tst--warn .tst__icon { background: rgba(251,191,36,.14); color: var(--warn); }
.tst--error { color: var(--bad); }
.tst--error .tst__icon { background: rgba(251,113,133,.14); color: var(--bad); }

/* 08 note */
.motion-note { padding-block: clamp(2.75rem, 6vw, 4.5rem); border-top: 1px solid var(--line); background: var(--bg-2); }
.motion-note__grid { display: grid; gap: clamp(1.5rem, 4vw, 3rem); grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); align-items: start; }
.motion-note__copy { display: grid; gap: .85rem; }
.motion-note__copy p { font-size: .92rem; color: var(--muted); max-width: 62ch; }
.motion-note__actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .35rem; }
.motion-note__readout { font-size: .82rem; color: var(--muted); }
.motion-note__readout strong { color: var(--accent); }
.motion-note__list { display: grid; gap: .7rem; padding: 1.25rem; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--panel); }
.motion-note__list li { display: flex; gap: .6rem; align-items: flex-start; font-size: .86rem; color: var(--ink-2); }
.tick { display: grid; place-items: center; flex: none; width: 20px; height: 20px; margin-top: 1px; border-radius: 6px; background: var(--accent-dim); color: var(--accent); }
.tick .icon { width: 13px; height: 13px; }

/* ------------------------------------------------------------------ footer */
.foot { background: var(--bg-2); border-top: 1px solid var(--line); padding-top: clamp(2.5rem, 5vw, 3.5rem); }
.foot__grid { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1.4fr) repeat(4, minmax(0, 1fr)); }
.foot__brand { display: grid; gap: .8rem; align-content: start; }
.foot__blurb { font-size: .84rem; color: var(--muted); max-width: 36ch; }
.foot__social { display: flex; gap: .5rem; }
.foot__social a { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--line-2); border-radius: 9px; color: var(--muted); transition: color .18s var(--ease), border-color .18s var(--ease), transform .18s var(--ease); }
.foot__social a:hover { color: var(--bg); background: var(--accent); border-color: var(--accent); transform: translateY(-2px); }
.foot__title { font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-bottom: .75rem; }
.foot__col li + li { margin-top: .4rem; }
.foot__col a { font-size: .84rem; color: var(--muted); transition: color .18s var(--ease), padding-left .18s var(--ease); }
.foot__col a:hover { color: var(--ink); padding-left: 4px; }
.foot__legal { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; justify-content: space-between; margin-top: 2.25rem; padding-block: 1rem; border-top: 1px solid var(--line); font-size: .76rem; color: var(--muted); }

/* ----------------------------------------------------------------- reveal */
[data-reveal] { opacity: 0; transform: translateY(22px); }
[data-reveal].is-visible { opacity: 1; transform: none; transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--delay, 0s); }

/* --------------------------------------------------------------- keyframes */
@keyframes rise-in { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
@keyframes slide-left-in { from { opacity: 0; transform: translateX(-36px); } to { opacity: 1; transform: none; } }
@keyframes scale-in { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
@keyframes flip-in { from { opacity: 0; transform: perspective(700px) rotateY(-24deg) translateZ(-40px); } to { opacity: 1; transform: none; } }
@keyframes wipe-in { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
@keyframes blur-in { from { opacity: 0; filter: blur(7px); transform: translateY(10px); } to { opacity: 1; filter: blur(0); transform: none; } }
@keyframes sheen-sweep { 0% { transform: translateX(-150%); } 100% { transform: translateX(320%); } }
@keyframes spin-once { from { transform: rotate(0); } to { transform: rotate(-360deg); } }
@keyframes grid-drift { from { background-position: 0 0, 0 0; } to { background-position: 56px 56px, 56px 56px; } }
@keyframes orbit-a { 0%,100% { transform: translate(0,0) rotate(0); } 33% { transform: translate(38px,-26px) rotate(120deg); } 66% { transform: translate(-16px,32px) rotate(240deg); } }
@keyframes orbit-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-44px,30px) scale(1.14); } }
@keyframes orbit-c { 0%,100% { transform: translate(0,0); } 25% { transform: translate(28px,22px); } 50% { transform: translate(6px,-34px); } 75% { transform: translate(-30px,-8px); } }
@keyframes orbit-d { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-30px) scale(.82); } }
@keyframes breathe { 0%,100% { opacity: .5; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes ring-ping { 0% { transform: scale(.9); opacity: .8; } 70% { transform: scale(1.18); opacity: 0; } 100% { opacity: 0; } }
@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes spin-arc { 0% { transform: rotate(0); } 60% { transform: rotate(300deg); } 100% { transform: rotate(360deg); } }
@keyframes dot-bounce { 0%,100% { transform: translateY(0); opacity: .55; } 40% { transform: translateY(-8px); opacity: 1; } }
@keyframes bar-stretch { 0%,100% { transform: scaleY(.55); opacity: .6; } 50% { transform: scaleY(1.25); opacity: 1; } }
@keyframes ripple-out { from { transform: translate(-50%, -50%) scale(.05); opacity: .9; } to { transform: translate(-50%, -50%) scale(2.6); opacity: 0; } }
@keyframes toast-in { from { opacity: 0; transform: translateX(40px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes toast-out { from { opacity: 1; max-height: 120px; } to { opacity: 0; max-height: 0; padding-block: 0; margin-top: -.55rem; } }
@keyframes toast-bar { from { transform: scaleX(1); } to { transform: scaleX(0); } }

/* -------------------------------------------------------------- responsive */
@media (max-width: 1080px) {
  .hdr__reduce { display: none; }
  .foot__grid { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); }
  .stage--meters { grid-template-columns: minmax(0, 1fr); }
  .stage--magnetic { grid-template-columns: minmax(0, 1fr); }
  .motion-note__grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 860px) {
  .burger { display: grid; }
  .hdr__nav {
    position: absolute; top: calc(100% + 1px); left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 0;
    padding: .75rem clamp(1rem, 4vw, 2.5rem) 1.1rem;
    background: var(--bg); border-bottom: 1px solid var(--line); box-shadow: var(--shadow);
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .22s var(--ease), transform .22s var(--ease), visibility .22s;
  }
  .hdr__nav.is-open { opacity: 1; visibility: visible; transform: none; }
  .hdr__link { display: block; padding: .65rem 0; border-bottom: 1px solid var(--line); font-size: .95rem; }
  .hdr__actions { margin-left: auto; }
  .hdr__replay { display: none; }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .spinner-set { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .foot__grid { grid-template-columns: minmax(0, 1fr); }
  .foot__legal { flex-direction: column; }
}

/* ---------------------------------------------- simulated reduced motion */
html.sim-reduce *, html.sim-reduce *::before, html.sim-reduce *::after {
  animation-duration: .001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .001ms !important;
  scroll-behavior: auto !important;
}
html.sim-reduce .stage.is-playing .rise,
html.sim-reduce .stage.is-playing .slide-left,
html.sim-reduce .stage.is-playing .scale-in,
html.sim-reduce .stage.is-playing .flip-in,
html.sim-reduce .stage.is-playing .wipe-in,
html.sim-reduce .stage.is-playing .blur-in { opacity: 1 !important; transform: none !important; clip-path: none !important; filter: none !important; }
html.sim-reduce .orb { transform: none !important; }
html.sim-reduce .magnet { transform: none !important; }

/* ------------------------------------------------------- system preference */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .stage.is-playing .rise, .stage.is-playing .slide-left, .stage.is-playing .scale-in,
  .stage.is-playing .flip-in, .stage.is-playing .wipe-in, .stage.is-playing .blur-in {
    opacity: 1 !important; transform: none !important; clip-path: none !important; filter: none !important;
  }
  .bar__fill { transition: none; }
  .ring-meter__bar { transition: none; }
  .ripple { animation: none; }
  .magnet { transform: none !important; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var root = document.documentElement;
var MAGNET_RADIUS = 150;
var MAGNET_STRENGTH = 0.32;
var toastTimers = [];
var hoverPreviewTimers = [];

function $(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }
function isReduce() { return reduce || root.classList.contains('sim-reduce'); }

/* ------------------------------------------------------------- force reflow */
function restart(node, cls) {
  if (!node) return;
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

function replaySelector(sel, cls) {
  var nodes = qsa(sel);
  for (var i = 0; i < nodes.length; i++) restart(nodes[i], cls);
}

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  var items = qsa('[data-reveal]');
  if (!items.length) return;
  if (isReduce() || !('IntersectionObserver' in window)) {
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

/* ------------------------------------------------------------ page progress */
function initPageProgress() {
  var bar = $('pageBar');
  var hdr = $('hdr');
  var ticking = false;
  function frame() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('is-stuck', y > 6);
    if (bar) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      bar.style.width = Math.min(100, Math.max(0, (y / max) * 100)).toFixed(2) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }, { passive: true });
  frame();
}

/* ---------------------------------------------------------------- counters */
function countTo(node, value, decimals, suffix) {
  var start = performance.now();
  var dur = 1100;
  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    var eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (value * eased).toFixed(decimals) + suffix;
    if (t < 1) window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
}

function fillCounters(scope) {
  var nodes = (scope || document).querySelectorAll('[data-count]');
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var value = parseFloat(node.getAttribute('data-count')) || 0;
    var decimals = node.getAttribute('data-decimals') ? parseInt(node.getAttribute('data-decimals'), 10) : 0;
    var suffix = node.getAttribute('data-suffix') || '';
    if (isReduce()) { node.textContent = value.toFixed(decimals) + suffix; continue; }
    countTo(node, value, decimals, suffix);
  }
}

function initCounters() {
  var nodes = qsa('[data-count]');
  if (!nodes.length) return;
  if (isReduce() || !('IntersectionObserver' in window)) { fillCounters(document); return; }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (!entries[j].isIntersecting) continue;
      var node = entries[j].target;
      var value = parseFloat(node.getAttribute('data-count')) || 0;
      var decimals = node.getAttribute('data-decimals') ? parseInt(node.getAttribute('data-decimals'), 10) : 0;
      var suffix = node.getAttribute('data-suffix') || '';
      if (isReduce()) node.textContent = value.toFixed(decimals) + suffix;
      else countTo(node, value, decimals, suffix);
      io.unobserve(node);
    }
  }, { threshold: 0.4 });
  for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
}

/* --------------------------------------------------------------- sections */
function entranceSection() { restart($('stage-entrance'), 'is-playing'); }
function ambientSection() { restart($('stage-ambient'), 'is-playing'); }
function loadingSection() { restart($('stage-loading'), 'is-loading'); }

function hoverSection() {
  var stage = $('stage-hover');
  if (!stage) return;
  for (var t = 0; t < hoverPreviewTimers.length; t++) window.clearTimeout(hoverPreviewTimers[t]);
  hoverPreviewTimers = [];
  var tiles = qsa('#stage-hover .hv');
  if (isReduce()) {
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].classList.add('force-hover');
      (function (node) {
        hoverPreviewTimers.push(window.setTimeout(function () {
          node.classList.remove('force-hover');
        }, 1100));
      }(tiles[i]));
    }
    return;
  }
  for (var k = 0; k < tiles.length; k++) {
    (function (node, order) {
      hoverPreviewTimers.push(window.setTimeout(function () {
        node.classList.add('force-hover');
        hoverPreviewTimers.push(window.setTimeout(function () {
          node.classList.remove('force-hover');
        }, 900));
      }, order * 140));
    }(tiles[k], k));
  }
  if (stage) restart(stage, 'is-lit');
}

/* ----------------------------------------------------------------- meters */
function setBars(scope) {
  var bars = (scope || document).querySelectorAll('[data-bar]');
  for (var i = 0; i < bars.length; i++) {
    var bar = bars[i];
    var fill = bar.querySelector('.bar__fill');
    var value = parseFloat(bar.getAttribute('data-value')) || 0;
    if (!fill) continue;
    if (isReduce()) {
      fill.style.transition = 'none';
      fill.style.width = value + '%';
    } else {
      fill.style.transition = '';
      fill.style.width = value + '%';
    }
    restart(bar, 'is-filling');
  }
  var rings = (scope || document).querySelectorAll('[data-ring]');
  for (var j = 0; j < rings.length; j++) {
    var ring = rings[j];
    var ringValue = parseFloat(ring.getAttribute('data-value')) || 0;
    ring.style.transition = isReduce() ? 'none' : '';
    ring.style.strokeDashoffset = String(100 - ringValue);
  }
}

function metersSection() {
  var stage = $('stage-meters');
  if (!stage) return;
  var bars = stage.querySelectorAll('[data-bar]');
  var fills = stage.querySelectorAll('.bar__fill');
  var rings = stage.querySelectorAll('[data-ring]');
  for (var i = 0; i < fills.length; i++) fills[i].style.width = '0%';
  for (var j = 0; j < rings.length; j++) rings[j].style.strokeDashoffset = '100';
  for (var k = 0; k < bars.length; k++) bars[k].classList.remove('is-filling');
  for (var r = 0; r < rings.length; r++) rings[r].classList.remove('is-filling');
  window.setTimeout(function () {
    setBars(stage);
    fillCounters(stage);
  }, isReduce() ? 0 : 60);
}

function initMeters() {
  var stage = $('stage-meters');
  if (!stage) return;
  if (isReduce() || !('IntersectionObserver' in window)) { setBars(stage); fillCounters(stage); return; }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      setBars(stage);
      fillCounters(stage);
      io.disconnect();
    }
  }, { threshold: 0.35 });
  io.observe(stage);
}

/* --------------------------------------------------------------- magnetic */
function initMagnet() {
  var magnet = $('magnet');
  var core = $('magnetCore');
  var wrap = magnet ? magnet.closest('.mag-wrap') : null;
  if (!magnet || !core) return;

  function release() {
    magnet.style.transform = '';
    if (core) core.style.transform = '';
    if (wrap) wrap.classList.remove('is-active');
  }

  function pull(e) {
    if (isReduce()) return;
    var rect = magnet.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAGNET_RADIUS) { release(); return; }
    var force = 1 - dist / MAGNET_RADIUS;
    var ox = dx * MAGNET_STRENGTH * force;
    var oy = dy * MAGNET_STRENGTH * force;
    magnet.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';
    if (core) core.style.transform = 'translate3d(' + (ox * 0.35).toFixed(1) + 'px,' + (oy * 0.35).toFixed(1) + 'px,0)';
    if (wrap) wrap.classList.add('is-active');
  }

  magnet.addEventListener('mousemove', pull);
  magnet.addEventListener('mouseenter', function () { if (wrap) wrap.classList.add('is-active'); });
  magnet.addEventListener('mouseleave', release);
  magnet.addEventListener('blur', release);
  magnet.addEventListener('click', function () {
    pushToast('info', 'Magnetic target', 'Pull strength ' + MAGNET_STRENGTH + ' over a ' + MAGNET_RADIUS + 'px radius.');
  });
}

/* ----------------------------------------------------------------- ripple */
function initRipple() {
  var zone = $('rippleZone');
  var counter = $('rippleCount');
  if (!zone) return;
  var total = 0;

  function spawn(x, y) {
    var rect = zone.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.4;
    var node = document.createElement('span');
    node.className = 'ripple';
    node.style.width = size + 'px';
    node.style.height = size + 'px';
    node.style.left = (x - rect.left) + 'px';
    node.style.top = (y - rect.top) + 'px';
    zone.appendChild(node);
    total = total + 1;
    if (counter) counter.textContent = String(total);
    if (!isReduce()) {
      node.addEventListener('animationend', function () { if (node.parentNode) node.parentNode.removeChild(node); });
      window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 900);
    } else {
      window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 240);
    }
  }

  zone.addEventListener('click', function (e) { spawn(e.clientX, e.clientY); });
  zone.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    var rect = zone.getBoundingClientRect();
    spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
}

function rippleSection() {
  var zone = $('rippleZone');
  if (!zone) return;
  var ripples = zone.querySelectorAll('.ripple');
  for (var i = 0; i < ripples.length; i++) if (ripples[i].parentNode) ripples[i].parentNode.removeChild(ripples[i]);
  var counter = $('rippleCount');
  if (counter) counter.textContent = '0';
  var magnet = $('magnet');
  if (magnet) magnet.style.transform = '';
  var core = $('magnetCore');
  if (core) core.style.transform = '';
  var wrap = qs('.mag-wrap');
  if (wrap) wrap.classList.remove('is-active');
}

/* ----------------------------------------------------------------- toasts */
var TOASTS = {
  success: { title: 'Build finished', msg: 'Deployed to 4 regions in 38 seconds.' },
  info: { title: 'New version available', msg: 'Motion Lab 2.4.0 adds spring easing.' },
  warn: { title: 'Bundle over budget', msg: 'CSS payload is 14kb above your 60kb limit.' },
  error: { title: 'Deploy failed', msg: 'Exit code 1 from the prerender step.' }
};
var TOAST_ICON = {
  success: 'm20 6-11 11-5-5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16v-4M12 8h.01',
  warn: 'M12 4 2 20h20L12 4ZM12 10v4M12 17h.01',
  error: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6'
};

function buildToast(kind) {
  var data = TOASTS[kind] || TOASTS.info;
  var node = document.createElement('div');
  node.className = 'tst tst--' + kind;
  node.setAttribute('role', 'status');

  var iconWrap = document.createElement('span');
  iconWrap.className = 'tst__icon';
  iconWrap.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + TOAST_ICON[kind] + '"/></svg>';

  var body = document.createElement('div');
  body.className = 'tst__body';
  var title = document.createElement('span');
  title.className = 'tst__title';
  title.textContent = data.title;
  var msg = document.createElement('span');
  msg.className = 'tst__msg';
  msg.textContent = data.msg;
  body.appendChild(title);
  body.appendChild(msg);

  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'tst__close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  var bar = document.createElement('span');
  bar.className = 'tst__bar';

  node.appendChild(iconWrap);
  node.appendChild(body);
  node.appendChild(close);
  node.appendChild(bar);

  close.addEventListener('click', function () { retire(node); });
  return node;
}

function retire(node) {
  if (!node || node.classList.contains('is-leaving')) return;
  node.classList.add('is-leaving');
  window.setTimeout(function () {
    if (node.parentNode) node.parentNode.removeChild(node);
  }, isReduce() ? 10 : 300);
}

function pushToast(kind, titleOverride, msgOverride) {
  var host = $('toaster') || $('toastStack');
  if (!host) return;
  var node = buildToast(kind);
  if (titleOverride) {
    var t = node.querySelector('.tst__title');
    if (t) t.textContent = titleOverride;
  }
  if (msgOverride) {
    var m = node.querySelector('.tst__msg');
    if (m) m.textContent = msgOverride;
  }
  host.appendChild(node);
  var timer = window.setTimeout(function () { retire(node); }, 4000);
  toastTimers.push(timer);
  if (host.children.length > 4) retire(host.firstChild);
}

function toastsSection() {
  var stack = $('toastStack');
  if (stack) {
    while (stack.firstChild) stack.removeChild(stack.firstChild);
  }
  var host = $('toaster');
  if (host) {
    while (host.firstChild) host.removeChild(host.firstChild);
  }
  for (var t = 0; t < toastTimers.length; t++) window.clearTimeout(toastTimers[t]);
  toastTimers = [];
  var kinds = ['success', 'info', 'warn', 'error'];
  for (var i = 0; i < kinds.length; i++) {
    (function (kind, order) {
      window.setTimeout(function () {
        var node = buildToast(kind);
        if (stack) stack.appendChild(node);
        else pushToast(kind);
        var timer = window.setTimeout(function () { retire(node); }, 4000);
        toastTimers.push(timer);
      }, order * 220);
    }(kinds[i], i));
  }
}

function initToasts() {
  var buttons = qsa('[data-toast]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      pushToast(this.getAttribute('data-toast'));
    });
  }
}

/* --------------------------------------------------------------- replayers */
var SECTIONS = [
  { sel: '#stage-entrance', run: entranceSection },
  { sel: '#stage-hover', run: hoverSection },
  { sel: '#stage-ambient', run: ambientSection },
  { sel: '#stage-loading', run: loadingSection },
  { sel: '#stage-meters', run: metersSection },
  { sel: '#stage-magnetic', run: rippleSection },
  { sel: '#stage-toasts', run: toastsSection }
];

function replayAll() {
  for (var i = 0; i < SECTIONS.length; i++) SECTIONS[i].run();
  fillCounters(qs('.hero__stats'));
}

function initReplayers() {
  var singles = qsa('[data-replay]');
  for (var i = 0; i < singles.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-replay');
        for (var k = 0; k < SECTIONS.length; k++) {
          if (SECTIONS[k].sel === sel) { SECTIONS[k].run(); return; }
        }
      });
    }(singles[i]));
  }
  var all = qsa('[data-replay-all]');
  for (var j = 0; j < all.length; j++) all[j].addEventListener('click', replayAll);
}

/* ---------------------------------------------------------- reduced motion */
function setReduceToggle(on) {
  root.classList.toggle('sim-reduce', on);
  var a = $('reduceToggle');
  var b = $('reduceToggle2');
  if (a) a.setAttribute('aria-pressed', on ? 'true' : 'false');
  if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
}

function initReducedMotion() {
  var readout = $('motionReadout');
  if (readout) {
    readout.textContent = reduce ? 'reduced' : 'no preference';
  }
  var toggles = [$('reduceToggle'), $('reduceToggle2')];
  for (var i = 0; i < toggles.length; i++) {
    if (!toggles[i]) continue;
    toggles[i].addEventListener('click', function () {
      setReduceToggle(this.getAttribute('aria-pressed') !== 'true');
    });
  }
  var reset = $('reduceReset');
  if (reset) {
    reset.addEventListener('click', function () {
      setReduceToggle(false);
      replayAll();
    });
  }
}

/* ----------------------------------------------------------------- mobile */
function initNav() {
  var burger = $('burger');
  var nav = $('hdrNav');
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

/* ------------------------------------------------------------------- boot */
initReveal();
initPageProgress();
initCounters();
initNav();
initReplayers();
initReducedMotion();
initMagnet();
initRipple();
initMeters();
initToasts();

window.addEventListener('resize', function () {
  var meters = $('stage-meters');
  if (!meters) return;
  var rings = meters.querySelectorAll('[data-ring]');
  for (var i = 0; i < rings.length; i++) {
    var v = parseFloat(rings[i].getAttribute('data-value')) || 0;
    rings[i].style.strokeDashoffset = String(100 - v);
  }
});
`,
};