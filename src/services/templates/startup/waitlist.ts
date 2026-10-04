
export default {
  html: `
<a class="skip-link" href="#main">Skip to main content</a>

<div class="ambient" aria-hidden="true">
  <span class="orb orb-a"></span>
  <span class="orb orb-b"></span>
  <span class="orb orb-c"></span>
  <span class="orb orb-d"></span>
  <span class="grain"></span>
  <span class="mesh"></span>
</div>

<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#top" aria-label="Lumen, return to top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.7"/>
          <circle cx="16" cy="16" r="5.5" stroke="currentColor" stroke-width="1.7"/>
          <path d="M16 3v5M16 24v5M3 16h5M24 16h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-text">Lumen</span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a class="nav-link" href="#benefits">Why Lumen</a>
      <a class="nav-link" href="#roadmap">Roadmap</a>
      <a class="nav-link" href="#launch">Launch</a>
      <a class="nav-link" href="#faq">FAQ</a>
    </nav>
    <div class="header-actions">
      <span class="live-pill" aria-label="Waitlist is open">
        <span class="live-dot" aria-hidden="true"></span> Beta list open
      </span>
      <a class="btn btn-primary btn-sm" href="#join">Get on the list</a>
      <button type="button" class="icon-btn nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
    <a class="nav-link" href="#benefits">Why Lumen</a>
    <a class="nav-link" href="#roadmap">Roadmap</a>
    <a class="nav-link" href="#launch">Launch</a>
    <a class="nav-link" href="#faq">FAQ</a>
    <a class="btn btn-primary" href="#join">Get on the list</a>
  </nav>
</header>

<main id="main">
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="badge" data-reveal>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></svg>
          Private beta opens 12 May 2026
        </p>
        <h1 id="hero-title" class="kinetic">
          <span class="kw" style="--i:0">Your</span>
          <span class="kw" style="--i:1">team's</span>
          <span class="kw" style="--i:2">worst</span>
          <span class="kw" style="--i:3">habit,</span>
          <span class="kw kw-accent" style="--i:4">unlearned.</span>
        </h1>
        <p class="lede">Lumen turns forty-message threads into three written decisions, with the source message linked to every claim. It reads your existing workspace and writes nothing back without asking.</p>

        <div class="join-card glass" id="join" data-reveal style="--delay:120ms">
          <form class="join-form" id="join-form" novalidate>
            <label class="field-label" for="join-email">Work email</label>
            <div class="join-row">
              <div class="input-shell">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4zM4 7l8 6 8-6"/></svg>
                <input type="email" id="join-email" name="email" placeholder="you@company.com" autocomplete="email" required aria-describedby="join-error join-hint" />
              </div>
              <button type="submit" class="btn btn-primary" id="join-submit">
                <span class="btn-text">Join the waitlist</span>
                <span class="spinner" aria-hidden="true"></span>
              </button>
            </div>
            <p class="hint" id="join-hint">No credit card, no sales sequence. One email when your invite is ready.</p>
            <p class="field-error" id="join-error" role="alert"></p>
          </form>

          <div class="join-done" id="join-done" hidden>
            <span class="done-tick" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m20 6-11 11-5-5"/></svg>
            </span>
            <h2>You're in.</h2>
            <p class="done-line">We saved your spot. Invite codes go out on a rolling basis from 12 May 2026.</p>
            <div class="position-chip">
              <span class="position-num" id="position-num">12,848</span>
              <span class="position-label">your place in the queue</span>
            </div>
            <div class="referral">
              <p class="referral-label">Move up the queue</p>
              <p class="referral-note">Each friend who joins with your code takes you up 25 places.</p>
              <div class="referral-row">
                <code id="referral-code">LUMEN-0000-0000</code>
                <button type="button" class="btn btn-outline btn-sm" id="copy-code" aria-label="Copy referral code">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>
                  <span id="copy-label">Copy code</span>
                </button>
              </div>
              <p class="copy-status" id="copy-status" role="status" aria-live="polite"></p>
              <ul class="share-row">
                <li><button type="button" class="chip" data-share="Email">Email</button></li>
                <li><button type="button" class="chip" data-share="Slack">Slack</button></li>
                <li><button type="button" class="chip" data-share="X">X</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="social-proof" data-reveal style="--delay:200ms">
          <div class="avatar-stack" id="avatar-stack" aria-hidden="true"></div>
          <p class="proof-text">
            <strong id="proof-count">12,847</strong> people already waiting.
            <span class="ticker"><span id="ticker-name">Priya N.</span> joined 4 minutes ago.</span>
          </p>
        </div>
      </div>

      <aside class="hero-side glass" aria-labelledby="signal-title">
        <h2 id="signal-title" class="side-title">The signal Lumen extracts</h2>
        <ol class="thread-demo">
          <li class="thread-msg is-noise">
            <span class="msg-who">Tomás Beck</span>
            <span class="msg-what">has entered the channel</span>
          </li>
          <li class="thread-msg is-noise">
            <span class="msg-who">Ana Ruiz</span>
            <span class="msg-what">sent a 9-file bundle</span>
          </li>
          <li class="thread-msg is-decision">
            <span class="msg-badge">Decision</span>
            <span class="msg-what">Ship the read-only view on 4 June. Billing waits for the audit.</span>
            <span class="msg-src">from #product, 14:22</span>
          </li>
          <li class="thread-msg is-decision">
            <span class="msg-badge">Owner</span>
            <span class="msg-what">Ana Ruiz owns the audit sign-off, due 30 May.</span>
            <span class="msg-src">from #product, 14:31</span>
          </li>
          <li class="thread-msg is-open">
            <span class="msg-badge is-open-badge">Open question</span>
            <span class="msg-what">Which region hosts the audit log? Unanswered after 3 days.</span>
          </li>
        </ol>
        <p class="side-foot">40 messages in, 2 decisions and 1 gap out. Every line links back to its source.</p>
      </aside>
    </div>
  </section>

  <section class="benefits" id="benefits" aria-labelledby="benefits-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">What you get</p>
        <h2 id="benefits-title" class="section-title">Six things Lumen does that a summary tool cannot</h2>
      </header>
      <ul class="benefit-grid">
        <li class="benefit glass" data-reveal style="--delay:0ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/></svg></span>
          <h3>Captures without a ritual</h3>
          <p>Lumen watches the channels you already use. There is nothing to launch, tag, or remember to paste.</p>
        </li>
        <li class="benefit glass" data-reveal style="--delay:70ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></svg></span>
          <h3>Decisions, not summaries</h3>
          <p>A summary describes what happened. Lumen extracts who decided what, when, and who still owes an answer.</p>
        </li>
        <li class="benefit glass" data-reveal style="--delay:140ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg></span>
          <h3>Redaction before upload</h3>
          <p>Card numbers, addresses and customer names are masked on your machine. The raw text never leaves the device.</p>
        </li>
        <li class="benefit glass" data-reveal style="--delay:210ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></svg></span>
          <h3>Every claim is cited</h3>
          <p>Hover any sentence to see the exact message it came from. If Lumen cannot cite it, it will not say it.</p>
        </li>
        <li class="benefit glass" data-reveal style="--delay:280ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg></span>
          <h3>Works in five languages</h3>
          <p>English, German, Portuguese, Japanese and Dutch at launch, with the same citation behaviour in each.</p>
        </li>
        <li class="benefit glass" data-reveal style="--delay:350ms">
          <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg></span>
          <h3>Your archive stays yours</h3>
          <p>Export every extracted decision as Markdown or CSV at any time, with no export fee and no retention clause.</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="roadmap" id="roadmap" aria-labelledby="roadmap-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">Roadmap</p>
        <h2 id="roadmap-title" class="section-title">What happens between now and launch</h2>
        <p class="section-sub">We ship in the open. Every date below is a commitment we have already put in a contract.</p>
      </header>
      <ol class="track">
        <li data-reveal style="--delay:0ms">
          <span class="track-dot is-done" aria-hidden="true"></span>
          <time datetime="2025-11-18">18 Nov 2025</time>
          <h3>Private alpha, 40 teams</h3>
          <p>Custody, engineering and support teams. Median active use after week three: 4.1 days.</p>
        </li>
        <li data-reveal style="--delay:80ms">
          <span class="track-dot is-done" aria-hidden="true"></span>
          <time datetime="2026-02-02">2 Feb 2026</time>
          <h3>Citation layer shipped</h3>
          <p>Every extracted claim now links to its source message. Unsourced output was the single biggest complaint in alpha.</p>
        </li>
        <li data-reveal style="--delay:160ms">
          <span class="track-dot is-live" aria-hidden="true"></span>
          <time datetime="2026-03-30">30 Mar 2026</time>
          <h3>Waitlist opens</h3>
          <p>Invites go out in weekly batches, weighted by how early you joined. This is where you are now.</p>
        </li>
        <li data-reveal style="--delay:240ms">
          <span class="track-dot" aria-hidden="true"></span>
          <time datetime="2026-05-12">12 May 2026</time>
          <h3>Public beta</h3>
          <p>Self-serve signup, 30-day Pro trial, no card required. Pricing is announced 14 April.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="launch" id="launch" aria-labelledby="launch-title">
    <div class="wrap">
      <div class="launch-panel glass" data-reveal>
        <div class="launch-copy">
          <p class="kicker">Counting down</p>
          <h2 id="launch-title" class="section-title">Public beta opens in</h2>
          <p class="launch-note">12 May 2026, 09:00 UTC. Invite codes are sent at the top of each hour until the list is exhausted.</p>
        </div>
        <div class="countdown" id="countdown" role="timer" aria-live="off">
          <div class="cd-unit"><span class="cd-num" id="cd-days">00</span><span class="cd-label">days</span></div>
          <span class="cd-sep" aria-hidden="true">:</span>
          <div class="cd-unit"><span class="cd-num" id="cd-hours">00</span><span class="cd-label">hours</span></div>
          <span class="cd-sep" aria-hidden="true">:</span>
          <div class="cd-unit"><span class="cd-num" id="cd-mins">00</span><span class="cd-label">minutes</span></div>
          <span class="cd-sep" aria-hidden="true">:</span>
          <div class="cd-unit"><span class="cd-num" id="cd-secs">00</span><span class="cd-label">seconds</span></div>
        </div>
        <p class="sr-only" id="cd-sr" role="status" aria-live="polite"></p>
      </div>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="faq-title">
    <div class="wrap faq-grid">
      <header class="section-head faq-head" data-reveal>
        <p class="kicker">Questions</p>
        <h2 id="faq-title" class="section-title">The five things everyone asks</h2>
        <p class="section-sub">Still stuck? Mail <a href="mailto:hello@lumenapp.example">hello@lumenapp.example</a> and a human answers within a day.</p>
      </header>
      <div class="accordion" id="faq-accordion">
        <div class="acc-item" data-reveal style="--delay:0ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="faq-p1" id="faq-t1">What will it cost after the beta?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="faq-p1" role="region" aria-labelledby="faq-t1" hidden>
            <p>$9 per user per month for Pro, $4 for Team, free for anyone under five people. Annual billing takes 20% off. Pricing is locked for beta members: whatever we announce on 14 April, you keep for two years.</p>
          </div>
        </div>
        <div class="acc-item" data-reveal style="--delay:60ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="faq-p2" id="faq-t2">Is anything used to train a model?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="faq-p2" role="region" aria-labelledby="faq-t2" hidden>
            <p>No. Your content is used to answer your own queries and nothing else. We run inference against models we license per-request, we do not train on customer data, and the contract says so in clause 11.3. We have turned down two funding offers that required the opposite.</p>
          </div>
        </div>
        <div class="acc-item" data-reveal style="--delay:120ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="faq-p3" id="faq-t3">Which platforms work at launch?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="faq-p3" role="region" aria-labelledby="faq-t3" hidden>
            <p>Slack, Microsoft Teams, Discord and plain email threads on day one. Notion, Linear and Confluence land in July. We deliberately shipped fewer integrations first: every connector we add is one more place we could leak something.</p>
          </div>
        </div>
        <div class="acc-item" data-reveal style="--delay:180ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="faq-p4" id="faq-t4">Do I need a card to join the beta?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="faq-p4" role="region" aria-labelledby="faq-t4" hidden>
            <p>No card at any point during the beta. When Pro billing switches on you will get a reminder seven days beforehand and a button to stay on the free tier. We will not auto-charge anyone who joined before launch.</p>
          </div>
        </div>
        <div class="acc-item" data-reveal style="--delay:240ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="faq-p5" id="faq-t5">How do I leave if I dislike it?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="faq-p5" role="region" aria-labelledby="faq-t5" hidden>
            <p>One click in settings revokes every connector and schedules hard deletion after 30 days, which is the maximum we can hold ourselves to for backups. Your exported Markdown stays on your disk whether you stay or go.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta" aria-labelledby="cta-title">
    <div class="wrap cta-inner glass" data-reveal>
      <h2 id="cta-title" class="section-title">Two thousand places left before we close the list</h2>
      <p class="section-sub">When the beta list closes we stop taking new names and start inviting from it. That is the only fair way to run a queue.</p>
      <ul class="stat-strip">
        <li><span class="stat-num"><span class="counter" data-count="12847">0</span></span><span class="stat-label">People waiting on the list</span></li>
        <li><span class="stat-num"><span class="counter" data-count="41">0</span> days</span><span class="stat-label">Since the list opened on 30 March</span></li>
        <li><span class="stat-num"><span class="counter" data-count="4.1">0</span>/5</span><span class="stat-label">Average alpha rating from 40 teams</span></li>
        <li><span class="stat-num"><span class="counter" data-count="12">0</span> ms</span><span class="stat-label">Median citation lookup, on-device</span></li>
      </ul>
      <a class="btn btn-primary" href="#join">Claim your place<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
    </div>
  </section>
</main>

<footer class="site-footer" id="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#top" aria-label="Lumen, return to top">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false">
            <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.7"/>
            <circle cx="16" cy="16" r="5.5" stroke="currentColor" stroke-width="1.7"/>
            <path d="M16 3v5M16 24v5M3 16h5M24 16h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-text">Lumen</span>
      </a>
      <p class="footer-blurb">A quiet workspace layer for teams who are done re-reading the same thread. Built in Lisbon and Rotterdam.</p>
      <ul class="socials">
        <li><a href="#footer" aria-label="Lumen on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
        <li><a href="#footer" aria-label="Lumen on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/></svg></a></li>
        <li><a href="#footer" aria-label="Lumen RSS feed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15"/></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="lf-product">
      <h2 id="lf-product">Product</h2>
      <ul>
        <li><a href="#benefits">Why Lumen</a></li>
        <li><a href="#roadmap">Roadmap</a></li>
        <li><a href="#launch">Launch date</a></li>
        <li><a href="#join">Join the waitlist</a></li>
        <li><a href="#faq">Pricing questions</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="lf-company">
      <h2 id="lf-company">Company</h2>
      <ul>
        <li><a href="#footer">About the team</a></li>
        <li><a href="#footer">Careers</a></li>
        <li><a href="#footer">Press kit</a></li>
        <li><a href="#footer">Security overview</a></li>
        <li><a href="#footer">Status page</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <h2 id="lf-news">Beta notes</h2>
      <p>One short email every other Tuesday while we build. Unsubscribe in a click.</p>
      <form id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email for beta notes</label>
        <div class="news-row">
          <input type="email" id="footer-email" name="email" placeholder="you@company.com" aria-describedby="footer-status" required />
          <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscribe to beta notes">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
        <p class="news-status" id="footer-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Lumen Labs Unipessoal Lda &middot; Rua da Prata 80, Lisbon</p>
    <ul class="legal">
      <li><a href="#footer">Privacy</a></li>
      <li><a href="#footer">Terms</a></li>
      <li><a href="#footer">Data processing</a></li>
      <li><a href="#footer">Accessibility</a></li>
    </ul>
  </div>
</footer>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display: 'Space Grotesk', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --bg-0: #05060f;
  --bg-1: #0a0d1c;
  --bg-2: #11162c;
  --ink: #f2f5ff;
  --text: #c3cbe4;
  --muted: #8b96b8;
  --line: rgba(160, 178, 224, 0.16);
  --line-soft: rgba(160, 178, 224, 0.09);

  --glass: rgba(255, 255, 255, 0.045);
  --glass-strong: rgba(255, 255, 255, 0.075);
  --glass-edge: rgba(255, 255, 255, 0.12);

  --accent: #8b7cf6;
  --accent-2: #d78cf0;
  --accent-3: #4fd6c8;
  --accent-ink: #b9aefc;

  --ok: #62dfae;
  --danger: #ff8fa3;

  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;
  --pad-section: clamp(56px, 7vw, 104px);

  --r-sm: 8px; --r-md: 12px; --r-lg: 18px; --r-xl: 26px; --r-pill: 999px;

  --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 14px 40px rgba(0, 0, 0, 0.45);
  --shadow-glow: 0 18px 46px rgba(139, 124, 246, 0.28);

  --wrap: 1200px;
  --ease: cubic-bezier(0.22, 0.72, 0.24, 1);
  --dur: 0.28s;
  --header-h: 70px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-0: #03040a;
    --bg-1: #070a15;
    --bg-2: #0d1123;
    --text: #d6ddf2;
    --muted: #97a2c2;
    --glass: rgba(255, 255, 255, 0.05);
    --glass-strong: rgba(255, 255, 255, 0.085);
    --accent-ink: #c6bbfd;
    --shadow-md: 0 14px 44px rgba(0, 0, 0, 0.6);
  }
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.62;
  color: var(--text);
  background: var(--bg-0);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3 { font-family: var(--font-display); color: var(--ink); line-height: 1.08; margin: 0; font-weight: 600; letter-spacing: -0.028em; }
h1 { font-size: clamp(2.5rem, 6.2vw, 4.4rem); }
h2 { font-size: clamp(1.85rem, 3.6vw, 2.8rem); }
h3 { font-size: clamp(1.06rem, 1.5vw, 1.28rem); }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
svg { display: block; max-width: 100%; }
a { color: var(--accent-ink); text-decoration: none; }
button, input, textarea, select { font: inherit; color: inherit; }
strong { color: var(--ink); font-weight: 600; }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(18px, 4vw, 40px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; border-radius: var(--r-sm); }

.skip-link {
  position: absolute; left: 50%; top: 0; transform: translate(-50%, -160%); z-index: 400;
  padding: 12px 22px; border-radius: 0 0 var(--r-md) var(--r-md);
  background: var(--accent); color: #0b0d1c; font-weight: 600; font-size: 0.9rem;
  transition: transform var(--dur) var(--ease);
}
.skip-link:focus { transform: translate(-50%, 0); }

/* ---------- ambient background ---------- */
.ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5; }
.orb-a { width: 460px; height: 460px; top: -140px; left: -120px; background: var(--accent); animation: driftA 18s ease-in-out infinite; }
.orb-b { width: 380px; height: 380px; top: 24%; right: -130px; background: var(--accent-2); animation: driftB 22s ease-in-out infinite; }
.orb-c { width: 320px; height: 320px; bottom: 6%; left: 12%; background: var(--accent-3); opacity: 0.34; animation: driftC 26s ease-in-out infinite; }
.orb-d { width: 240px; height: 240px; bottom: -80px; right: 22%; background: #ff7ad1; opacity: 0.26; animation: driftB 20s ease-in-out infinite reverse; }
.mesh {
  position: absolute; inset: -20%;
  background: conic-gradient(from 0deg at 50% 50%, rgba(139, 124, 246, 0.16), rgba(79, 214, 200, 0.1), rgba(215, 140, 240, 0.14), rgba(139, 124, 246, 0.16));
  filter: blur(28px);
  animation: spinMesh 48s linear infinite;
  opacity: 0.7;
}
.grain {
  position: absolute; inset: 0;
  opacity: 0.32;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}

/* ---------- header ---------- */
.site-header {
  position: sticky; top: 0; z-index: 130;
  background: color-mix(in srgb, var(--bg-0) 72%, transparent);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.site-header.is-scrolled { border-bottom-color: var(--line); }
.header-inner { display: flex; align-items: center; gap: var(--s-5); min-height: var(--header-h); }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); flex: none; }
.brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(140deg, var(--accent), var(--accent-2)); color: #0b0d1c; transition: transform 0.55s var(--ease); }
.brand:hover .brand-mark { transform: rotate(90deg); }
.brand-mark svg { width: 22px; height: 22px; }
.brand-text { font-family: var(--font-display); font-size: 1.24rem; font-weight: 700; letter-spacing: -0.02em; }
.nav { display: flex; gap: var(--s-1); margin-left: auto; }
.nav-link { padding: 9px 14px; border-radius: var(--r-pill); font-size: 0.92rem; font-weight: 500; color: var(--text); position: relative; background-image: linear-gradient(var(--accent), var(--accent)); background-size: 0% 1.5px; background-position: 12px 100%; background-repeat: no-repeat; transition: color var(--dur) var(--ease), background-size var(--dur) var(--ease); }
.nav-link:hover { color: var(--ink); background-size: calc(100% - 24px) 1.5px; }
.header-actions { display: flex; align-items: center; gap: var(--s-3); flex: none; }
.live-pill { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border: 1px solid var(--glass-edge); border-radius: var(--r-pill); font-size: 0.76rem; font-weight: 600; color: var(--text); }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); box-shadow: 0 0 0 0 rgba(98, 223, 174, 0.6); animation: pulseRing 2.2s ease-out infinite; }
.nav-toggle { display: none; }
.mobile-nav { display: none; }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  padding: 13px 26px; border: 1px solid transparent; border-radius: var(--r-pill);
  font-size: 0.94rem; font-weight: 600; cursor: pointer; position: relative; overflow: hidden; isolation: isolate;
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), filter var(--dur) var(--ease);
}
.btn::after {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(105deg, transparent 34%, rgba(255, 255, 255, 0.42) 50%, transparent 66%);
  transform: translateX(-140%); transition: transform 0.6s var(--ease);
}
.btn:hover { transform: translateY(-2px); }
.btn:hover::after { transform: translateX(140%); }
.btn:active { transform: translateY(0); }
.btn .icon { width: 18px; height: 18px; transition: transform var(--dur) var(--ease); }
.btn:hover .icon { transform: translateX(3px); }
.btn-primary { background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #0b0d1c; }
.btn-primary:hover { box-shadow: var(--shadow-glow); filter: brightness(1.06); }
.btn-outline { background: var(--glass); border-color: var(--glass-edge); color: var(--ink); }
.btn-outline:hover { border-color: var(--accent); background: var(--glass-strong); }
.btn-sm { padding: 9px 18px; font-size: 0.85rem; }
.icon-btn { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--glass-edge); border-radius: var(--r-md); background: var(--glass); color: var(--ink); cursor: pointer; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.icon-btn svg { width: 21px; height: 21px; }
.icon-btn:hover { border-color: var(--accent); background: var(--glass-strong); }
.icon-btn:active { transform: scale(0.94); }

/* ---------- glass ---------- */
.glass { background: var(--glass); border: 1px solid var(--glass-edge); border-radius: var(--r-xl); backdrop-filter: blur(22px) saturate(150%); -webkit-backdrop-filter: blur(22px) saturate(150%); box-shadow: var(--shadow-md); }

/* ---------- typography bits ---------- */
.kicker { display: inline-block; margin-bottom: var(--s-3); font-family: var(--font-text); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-ink); }
.section-title { margin-bottom: var(--s-4); max-width: 24ch; }
.section-sub { color: var(--muted); max-width: 58ch; }
.section-head { margin-bottom: clamp(28px, 4vw, 52px); max-width: 720px; }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 15px; margin-bottom: var(--s-5); border: 1px solid var(--glass-edge); border-radius: var(--r-pill); background: var(--glass); font-size: 0.78rem; font-weight: 600; color: var(--accent-ink); }
.badge svg { width: 15px; height: 15px; }

[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease) var(--delay, 0ms), transform 0.7s var(--ease) var(--delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- hero ---------- */
.hero { position: relative; z-index: 1; padding-block: clamp(44px, 6vw, 86px) clamp(52px, 7vw, 100px); }
.hero-inner { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); gap: clamp(28px, 4vw, 58px); align-items: start; }
.kinetic { margin-bottom: var(--s-5); }
.kw { display: inline-block; opacity: 0; transform: translateY(0.42em) rotateX(55deg); transform-origin: bottom; animation: kineticIn 0.82s var(--ease) forwards; animation-delay: calc(var(--i) * 0.09s + 0.1s); }
.kw-accent { background: linear-gradient(100deg, var(--accent-2), var(--accent-3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { color: var(--text); font-size: clamp(1rem, 1.4vw, 1.15rem); max-width: 55ch; margin-bottom: var(--s-6); }

.join-card { padding: clamp(20px, 2.6vw, 30px); transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.join-card:hover { border-color: rgba(139, 124, 246, 0.45); }
.field-label { display: block; margin-bottom: var(--s-2); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.join-row { display: flex; gap: var(--s-3); }
.input-shell { position: relative; flex: 1; min-width: 0; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 19px; height: 19px; color: var(--muted); pointer-events: none; transition: color var(--dur) var(--ease); }
.input-shell input { width: 100%; padding: 14px 16px 14px 44px; border: 1px solid var(--glass-edge); border-radius: var(--r-pill); background: rgba(5, 6, 15, 0.5); font-size: 0.96rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.input-shell input::placeholder { color: var(--muted); }
.input-shell input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(139, 124, 246, 0.22); }
.input-shell:focus-within .input-icon { color: var(--accent-ink); }
.input-shell input[aria-invalid="true"] { border-color: var(--danger); box-shadow: 0 0 0 4px rgba(255, 143, 163, 0.16); }
.hint { margin-top: var(--s-3); font-size: 0.8rem; color: var(--muted); }
.field-error { min-height: 0; margin-top: var(--s-2); font-size: 0.83rem; font-weight: 600; color: var(--danger); }
.field-error:empty { display: none; }
.spinner { display: none; width: 15px; height: 15px; border: 2px solid rgba(11, 13, 28, 0.28); border-top-color: #0b0d1c; border-radius: 50%; animation: spin 0.7s linear infinite; }
.is-loading .btn-text { opacity: 0.5; }
.is-loading .spinner { display: block; }

.join-done { animation: popIn 0.45s var(--ease) both; }
.join-done[hidden] { display: none; }
.done-tick { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: rgba(98, 223, 174, 0.14); color: var(--ok); margin-bottom: var(--s-4); }
.done-tick svg { width: 24px; height: 24px; }
.join-done h2 { font-size: 1.7rem; margin-bottom: var(--s-2); }
.done-line { font-size: 0.94rem; margin-bottom: var(--s-5); }
.position-chip { display: flex; align-items: baseline; gap: var(--s-3); padding: var(--s-4); margin-bottom: var(--s-5); border: 1px solid var(--glass-edge); border-radius: var(--r-lg); background: var(--glass-strong); }
.position-num { font-family: var(--font-display); font-size: clamp(1.9rem, 3.6vw, 2.6rem); font-weight: 700; color: var(--accent-ink); letter-spacing: -0.03em; }
.position-label { font-size: 0.85rem; color: var(--muted); }
.referral { padding-top: var(--s-4); border-top: 1px solid var(--line-soft); }
.referral-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.referral-note { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }
.referral-row { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-top: var(--s-3); align-items: center; }
.referral-row code { flex: 1; min-width: 190px; padding: 11px 15px; border: 1px dashed var(--accent); border-radius: var(--r-md); background: rgba(139, 124, 246, 0.08); color: var(--ink); font-family: ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.06em; }
.copy-status { margin-top: 8px; min-height: 1.2em; font-size: 0.8rem; font-weight: 600; color: var(--ok); }
.share-row { display: flex; gap: var(--s-2); margin-top: var(--s-4); flex-wrap: wrap; }
.chip { padding: 7px 15px; border: 1px solid var(--glass-edge); border-radius: var(--r-pill); background: var(--glass); color: var(--text); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.chip:hover { border-color: var(--accent); color: var(--ink); transform: translateY(-2px); }

.social-proof { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); margin-top: var(--s-6); }
.avatar-stack { display: flex; }
.avatar-stack .av { width: 38px; height: 38px; border-radius: 50%; margin-left: -12px; border: 2px solid var(--bg-1); opacity: 0; animation: avIn 0.5s var(--ease) forwards; box-shadow: var(--shadow-sm); }
.avatar-stack .av:first-child { margin-left: 0; }
.avatar-stack .av-more { display: grid; place-items: center; background: var(--accent) !important; color: #0b0d1c; font-size: 0.7rem; font-weight: 700; border-color: var(--bg-1) !important; }
.proof-text { font-size: 0.9rem; color: var(--muted); }
.ticker { display: block; font-size: 0.84rem; }
.ticker #ticker-name { color: var(--accent-ink); font-weight: 600; transition: opacity 0.3s var(--ease); }
.ticker #ticker-name.is-swapping { opacity: 0; }

/* ---------- side panel ---------- */
.hero-side { padding: clamp(20px, 2.4vw, 28px); animation: floatY 10s ease-in-out infinite; }
.side-title { font-size: 1.05rem; margin-bottom: var(--s-4); }
.thread-demo { display: grid; gap: var(--s-2); }
.thread-msg { padding: 12px 14px; border: 1px solid var(--line-soft); border-radius: var(--r-md); background: rgba(255, 255, 255, 0.02); font-size: 0.85rem; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.thread-msg:hover { border-color: var(--glass-edge); background: var(--glass); }
.thread-msg.is-noise { opacity: 0.55; border-style: dashed; }
.msg-who { color: var(--muted); }
.msg-what { color: var(--text); }
.msg-badge { display: inline-block; margin-right: 7px; padding: 2px 8px; border-radius: var(--r-sm); background: rgba(139, 124, 246, 0.18); color: var(--accent-ink); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; vertical-align: 2px; }
.is-open-badge { background: rgba(255, 143, 163, 0.16); color: var(--danger); }
.msg-src { display: block; margin-top: 6px; font-size: 0.76rem; color: var(--muted); }
.side-foot { margin-top: var(--s-4); padding-top: var(--s-4); border-top: 1px solid var(--line-soft); font-size: 0.83rem; color: var(--muted); }

/* ---------- benefits ---------- */
.benefits { position: relative; z-index: 1; padding-block: var(--pad-section); }
.benefit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: var(--s-4); }
.benefit { padding: var(--s-5); border-radius: var(--r-lg); transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.benefit:hover { transform: translateY(-6px); border-color: rgba(139, 124, 246, 0.45); box-shadow: var(--shadow-glow); }
.b-icon { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: var(--s-4); border-radius: 13px; background: linear-gradient(140deg, rgba(139, 124, 246, 0.24), rgba(79, 214, 200, 0.16)); color: var(--ink); transition: transform var(--dur) var(--ease); }
.b-icon svg { width: 23px; height: 23px; }
.benefit:hover .b-icon { transform: translateY(-3px) rotate(-5deg); }
.benefit h3 { margin-bottom: var(--s-2); }
.benefit p { font-size: 0.92rem; }

/* ---------- roadmap ---------- */
.roadmap { position: relative; z-index: 1; padding-block: var(--pad-section); }
.track { position: relative; display: grid; gap: var(--s-5); padding-left: 26px; }
.track::before { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, var(--accent), rgba(139, 124, 246, 0.1)); }
.track li { position: relative; }
.track-dot { position: absolute; left: -26px; top: 7px; width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--muted); background: var(--bg-0); }
.track-dot.is-done { border-color: var(--accent-3); background: var(--accent-3); }
.track-dot.is-live { border-color: var(--accent); background: var(--accent); box-shadow: 0 0 0 5px rgba(139, 124, 246, 0.18); animation: pulseRing 2.4s ease-out infinite; }
.track time { display: block; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-ink); margin-bottom: 5px; }
.track h3 { margin-bottom: 5px; }
.track p { font-size: 0.92rem; max-width: 62ch; }

/* ---------- launch ---------- */
.launch { position: relative; z-index: 1; padding-block: 0 var(--pad-section); }
.launch-panel { padding: clamp(24px, 4vw, 48px); display: grid; gap: var(--s-6); text-align: center; justify-items: center; }
.countdown { display: flex; align-items: flex-start; gap: clamp(6px, 1.4vw, 16px); }
.cd-unit { display: grid; gap: 4px; min-width: clamp(62px, 9vw, 96px); padding: var(--s-4) var(--s-3); border: 1px solid var(--glass-edge); border-radius: var(--r-lg); background: var(--glass-strong); }
.cd-num { font-family: var(--font-display); font-size: clamp(1.7rem, 4.4vw, 3rem); font-weight: 700; color: var(--ink); line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; }
.cd-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.cd-sep { font-family: var(--font-display); font-size: clamp(1.5rem, 3.6vw, 2.4rem); font-weight: 700; color: var(--accent); line-height: 1.9; animation: blink 1s steps(2, end) infinite; }
.launch-note { font-size: 0.9rem; color: var(--muted); max-width: 56ch; }

/* ---------- faq ---------- */
.faq { position: relative; z-index: 1; padding-block: var(--pad-section); }
.faq-grid { display: grid; grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr); gap: clamp(28px, 4vw, 60px); align-items: start; }
.faq-head { position: sticky; top: calc(var(--header-h) + 22px); }
.faq-head a { text-decoration: underline; }
.accordion { display: grid; gap: var(--s-2); }
.acc-item { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--glass); overflow: hidden; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.acc-item:hover { border-color: var(--glass-edge); }
.acc-item.is-open { border-color: rgba(139, 124, 246, 0.45); background: var(--glass-strong); }
.acc-item h3 { margin: 0; }
.acc-trigger { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); width: 100%; padding: var(--s-4) var(--s-5); border: 0; background: transparent; text-align: left; font-family: var(--font-display); font-size: clamp(0.98rem, 1.35vw, 1.1rem); font-weight: 600; color: var(--ink); cursor: pointer; transition: color var(--dur) var(--ease); }
.acc-trigger:hover { color: var(--accent-ink); }
.acc-caret { width: 20px; height: 20px; flex: none; color: var(--muted); transition: transform var(--dur) var(--ease), color var(--dur) var(--ease); }
.acc-trigger[aria-expanded="true"] .acc-caret { transform: rotate(180deg); color: var(--accent); }
.acc-panel { padding: 0 var(--s-5) var(--s-5); animation: accOpen 0.32s var(--ease) both; }
.acc-panel[hidden] { display: none; }
.acc-panel p { font-size: 0.93rem; }

/* ---------- cta ---------- */
.cta { position: relative; z-index: 1; padding-block: 0 var(--pad-section); }
.cta-inner { padding: clamp(28px, 5vw, 62px); text-align: center; display: grid; justify-items: center; gap: var(--s-4); }
.cta-inner .section-title { max-width: 30ch; }
.stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: var(--s-4); width: 100%; margin-block: var(--s-2); padding-block: var(--s-5); border-block: 1px solid var(--glass-edge); }
.stat-strip li { text-align: center; }
.stat-num { display: block; font-family: var(--font-display); font-size: clamp(1.4rem, 2.6vw, 2rem); font-weight: 700; color: var(--accent-ink); letter-spacing: -0.03em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.stat-label { display: block; margin-top: 6px; font-size: 0.78rem; color: var(--muted); }

/* ---------- footer ---------- */
.site-footer { position: relative; z-index: 1; background: rgba(3, 4, 10, 0.62); border-top: 1px solid var(--line); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.footer-top { display: grid; grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 0.8fr)) minmax(0, 1.2fr); gap: clamp(22px, 3vw, 44px); padding-block: var(--s-8); }
.footer-blurb { margin-block: var(--s-4); max-width: 34ch; font-size: 0.88rem; color: var(--muted); }
.socials { display: flex; gap: var(--s-2); }
.socials a { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--glass-edge); border-radius: var(--r-md); color: var(--text); transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.socials svg { width: 18px; height: 18px; }
.socials a:hover { color: #0b0d1c; background: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.footer-col h2 { font-family: var(--font-text); font-size: 0.76rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink); margin-bottom: var(--s-4); }
.footer-col ul { display: grid; gap: 9px; }
.footer-col a { font-size: 0.88rem; color: var(--text); transition: color var(--dur) var(--ease), padding-left var(--dur) var(--ease); }
.footer-col a:hover { color: var(--accent-ink); padding-left: 5px; }
.footer-col p { font-size: 0.87rem; margin-bottom: var(--s-3); color: var(--muted); }
.news-row { display: flex; gap: var(--s-2); }
.news-row input { flex: 1; min-width: 0; padding: 11px 15px; border: 1px solid var(--glass-edge); border-radius: var(--r-pill); background: rgba(5, 6, 15, 0.5); font-size: 0.9rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.news-row input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(139, 124, 246, 0.2); }
.news-row .btn { flex: none; padding-inline: 15px; }
.news-status { margin-top: 8px; min-height: 1.2em; font-size: 0.8rem; font-weight: 600; color: var(--muted); }
.news-status.is-ok { color: var(--ok); }
.news-status.is-bad { color: var(--danger); }
.footer-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-4); padding-block: var(--s-5); border-top: 1px solid var(--line-soft); font-size: 0.82rem; color: var(--muted); }
.legal { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.legal a { color: var(--muted); }
.legal a:hover { color: var(--accent-ink); }

/* ---------- responsive ---------- */
@media (max-width: 1040px) {
  .footer-top { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 920px) {
  :root { --header-h: 64px; }
  .nav { display: none; }
  .header-actions .live-pill { display: none; }
  .nav-toggle { display: inline-grid; }
  .mobile-nav { display: grid; gap: 4px; padding: var(--s-4) clamp(18px, 4vw, 40px) var(--s-5); background: rgba(5, 6, 15, 0.96); border-bottom: 1px solid var(--line); backdrop-filter: blur(18px); }
  .mobile-nav[hidden] { display: none; }
  .mobile-nav .nav-link { padding: 12px 14px; font-size: 1rem; background-size: 0 1.5px; }
  .mobile-nav .btn { margin-top: var(--s-3); }
  .hero-inner { grid-template-columns: 1fr; }
  .hero-side { animation: none; }
  .faq-grid { grid-template-columns: 1fr; }
  .faq-head { position: static; }
}

@media (max-width: 620px) {
  .join-row { flex-direction: column; }
  .join-row .btn { width: 100%; }
  .header-actions .btn { display: none; }
  .countdown { flex-wrap: wrap; justify-content: center; }
  .cd-sep { display: none; }
  .footer-top { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .section-title { max-width: none; }
  .cd-unit { min-width: 40%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  [data-reveal] { opacity: 1; transform: none; }
  .kw { opacity: 1; transform: none; }
  .orb, .mesh, .cd-sep, .live-dot, .track-dot.is-live { animation: none !important; }
  .avatar-stack .av { opacity: 1; }
}

/* ---------- keyframes ---------- */
@keyframes kineticIn { from { opacity: 0; transform: translateY(0.42em) rotateX(55deg); } to { opacity: 1; transform: none; } }
@keyframes driftA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(70px, 46px) scale(1.14); } }
@keyframes driftB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-64px, 58px) scale(1.1); } }
@keyframes driftC { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(52px, -48px); } }
@keyframes spinMesh { to { transform: rotate(360deg); } }
@keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(139, 124, 246, 0.45); } 70% { box-shadow: 0 0 0 12px rgba(139, 124, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(139, 124, 246, 0); } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes avIn { from { opacity: 0; transform: translateX(-12px) scale(0.8); } to { opacity: 1; transform: none; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes accOpen { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes blink { 50% { opacity: 0.25; } }
@keyframes spin { to { transform: rotate(360deg); } }
`,
  javascript: `
'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function withCommas(n) { return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }

  /* ---------------- reveal ---------------- */
  var reveal = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); ro.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
    reveal.forEach(function (el) { ro.observe(el); });
  }

  /* ---------------- header scroll state ---------------- */
  var header = $('#site-header');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) { header.classList.toggle('is-scrolled', y > 6); }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------------- mobile nav ---------------- */
  var navToggle = $('#nav-toggle');
  var mobileNav = $('#mobile-nav');
  function setNav(open) {
    if (!navToggle || !mobileNav) { return; }
    mobileNav.hidden = !open;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setNav(false); }
  });

  /* ---------------- smooth anchors ---------------- */
  var headerH = function () { return header ? header.offsetHeight : 0; };
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.length < 2) { return; }
      var target = document.getElementById(href.slice(1));
      if (!target) { return; }
      e.preventDefault();
      setNav(false);
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH() - 10;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- avatar stack ---------------- */
  var AVATARS = [
    { i: 'PR', a: '#8b7cf6', b: '#4fd6c8' },
    { i: 'TB', a: '#d78cf0', b: '#8b7cf6' },
    { i: 'AR', a: '#4fd6c8', b: '#8b7cf6' },
    { i: 'JM', a: '#f6a06b', b: '#d78cf0' },
    { i: 'SK', a: '#6ba8f6', b: '#4fd6c8' },
    { i: 'HN', a: '#f6d76b', b: '#f6a06b' }
  ];
  var stack = $('#avatar-stack');
  if (stack) {
    AVATARS.forEach(function (p, i) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 40 40');
      svg.setAttribute('class', 'av');
      svg.setAttribute('focusable', 'false');
      svg.style.animationDelay = (0.12 * i + 0.2).toFixed(2) + 's';
      svg.style.background = 'linear-gradient(140deg,' + p.a + ',' + p.b + ')';
      var gid = 'av-g-' + i;
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      var lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      lg.setAttribute('id', gid); lg.setAttribute('x1', '0'); lg.setAttribute('y1', '0'); lg.setAttribute('x2', '1'); lg.setAttribute('y2', '1');
      var s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s1.setAttribute('offset', '0'); s1.setAttribute('stop-color', p.a);
      var s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s2.setAttribute('offset', '1'); s2.setAttribute('stop-color', p.b);
      lg.appendChild(s1); lg.appendChild(s2); defs.appendChild(lg); svg.appendChild(defs);
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '40'); rect.setAttribute('height', '40');
      rect.setAttribute('rx', '20'); rect.setAttribute('fill', 'url(#' + gid + ')');
      svg.appendChild(rect);
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '20'); text.setAttribute('y', '25');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '13'); text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      text.setAttribute('fill', '#0b0d1c');
      text.textContent = p.i;
      svg.appendChild(text);
      stack.appendChild(svg);
    });
    var more = document.createElement('span');
    more.className = 'av av-more';
    more.style.animationDelay = '0.95s';
    more.textContent = '+12k';
    stack.appendChild(more);
  }

  /* ---------------- live signup ticker ---------------- */
  var NAMES = ['Mira K.', 'Tomás B.', 'Sanne V.', 'Hana N.', 'Diego R.', 'Aiko M.', 'Rowan P.', 'Leila F.', 'Oskar J.', 'Nadia D.'];
  var tickerName = $('#ticker-name');
  var counterBase = 12847;

  if (reduce) {
    var pc = $('#proof-count');
    if (pc) { pc.textContent = withCommas(counterBase); }
  } else {
    var ni = Math.floor(Math.random() * NAMES.length);
    window.setInterval(function () {
      if (!tickerName) { return; }
      ni = (ni + 1) % NAMES.length;
      tickerName.classList.add('is-swapping');
      window.setTimeout(function () {
        tickerName.textContent = NAMES[ni];
        tickerName.classList.remove('is-swapping');
      }, 280);
      counterBase += Math.floor(Math.random() * 3) + 1;
      var pc = $('#proof-count');
      if (pc) { pc.textContent = withCommas(counterBase); }
    }, 5200);
  }

  /* ---------------- countdown ---------------- */
  var cdDays = $('#cd-days'), cdHours = $('#cd-hours'), cdMins = $('#cd-mins'), cdSecs = $('#cd-secs'), cdSr = $('#cd-sr');
  var target = new Date('2026-05-12T09:00:00Z').getTime();
  if (!target || isNaN(target)) { target = new Date().getTime() + 86400000; }
  while (target <= Date.now()) { target += 31536000000; }
  var lastAnnounced = -1;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var diff = target - Date.now();
    if (diff < 0) { diff = 0; }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (cdDays) { cdDays.textContent = pad(d); }
    if (cdHours) { cdHours.textContent = pad(h); }
    if (cdMins) { cdMins.textContent = pad(m); }
    if (cdSecs) { cdSecs.textContent = pad(sec); }
    var bucket = d;
    if (cdSr && bucket !== lastAnnounced) {
      lastAnnounced = bucket;
      cdSr.textContent = d + ' days until public beta.';
    }
  }
  tick();
  window.setInterval(tick, 1000);

  /* ---------------- accordion ---------------- */
  var triggers = $$('.acc-trigger');
  function closePanel(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'false');
    if (panel) { panel.hidden = true; }
    var item = btn.closest ? btn.closest('.acc-item') : null;
    if (item) { item.classList.remove('is-open'); }
  }
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      triggers.forEach(closePanel);
      if (!open) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', 'true');
        if (panel) { panel.hidden = false; }
        var item = btn.closest ? btn.closest('.acc-item') : null;
        if (item) { item.classList.add('is-open'); }
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    triggers.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') { closePanel(btn); btn.focus(); }
    });
  });

  /* ---------------- waitlist form ---------------- */
  var REGISTERED = [
    'ada@lovelace.dev', 'mira@northbank.co', 'tomas@vertexlabs.io',
    'sanne@brightharbour.nl', 'hana@ninefold.co', 'diego@cobalto.mx',
    'aiko@sakuramono.jp', 'rowan@ferrousworks.com', 'leila@ostendport.be',
    'oskar@kestrelbank.example', 'nadia@pacificarisk.com', 'samir@gulfcoast.ae'
  ];
  var FREE_MAIL = /(^|\\.)(gmail|yahoo|hotmail|outlook|proton(mail)?|icloud)\\./i;

  var form = $('#join-form');
  var done = $('#join-done');
  var emailInput = $('#join-email');
  var errEl = $('#join-error');
  var submitBtn = $('#join-submit');
  var positionNum = $('#position-num');
  var codeEl = $('#referral-code');
  var copyBtn = $('#copy-code');
  var copyLabel = $('#copy-label');
  var copyStatus = $('#copy-status');
  var proofCount = $('#proof-count');

  function showError(msg) {
    if (!errEl) { return; }
    errEl.textContent = msg;
    if (emailInput) {
      if (msg) { emailInput.setAttribute('aria-invalid', 'true'); }
      else { emailInput.removeAttribute('aria-invalid'); }
    }
  }

  function makeCode(address) {
    var h = 2166136261;
    var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < address.length; i++) {
      h ^= address.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    var out = '';
    for (var j = 0; j < 8; j++) {
      out += letters.charAt(h % letters.length);
      h = Math.floor(h / letters.length) + (h * 31);
    }
    return 'LUMEN-' + out.slice(0, 4) + '-' + out.slice(4, 8);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error('copy-unavailable')); }
    });
  }

  if (copyBtn && codeEl) {
    copyBtn.addEventListener('click', function () {
      var text = codeEl.textContent;
      copyText(text).then(function () {
        if (copyLabel) { copyLabel.textContent = 'Copied'; }
        if (copyStatus) { copyStatus.textContent = 'Code copied. Share it to move up 25 places per signup.'; }
      }).catch(function () {
        if (copyLabel) { copyLabel.textContent = 'Press Ctrl+C'; }
        if (copyStatus) { copyStatus.textContent = 'Copy blocked by the browser. Select the code and copy it manually.'; }
      });
      window.setTimeout(function () {
        if (copyLabel) { copyLabel.textContent = 'Copy code'; }
      }, 2600);
    });
  }

  $$('[data-share]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!copyStatus) { return; }
      copyStatus.textContent = 'Opening ' + chip.getAttribute('data-share') + ' with your referral code attached.';
    });
  });

  if (form && emailInput) {
    emailInput.addEventListener('input', function () {
      if (errEl && errEl.textContent) { showError(''); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = emailInput.value.trim().toLowerCase();

      if (!value) { showError('Enter an email address so we can hold your place.'); emailInput.focus(); return; }
      if (!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(value)) { showError('That does not look like a valid email address.'); emailInput.focus(); return; }
      if (FREE_MAIL.test(value)) { showError('Use your work email so we can invite your whole team later.'); emailInput.focus(); return; }
      if (REGISTERED.indexOf(value) !== -1) { showError('That address is already on the list. Check your inbox for the invite.'); emailInput.focus(); return; }

      showError('');
      if (submitBtn) { submitBtn.classList.add('is-loading'); submitBtn.disabled = true; }

      window.setTimeout(function () {
        if (submitBtn) { submitBtn.classList.remove('is-loading'); submitBtn.disabled = false; }

        var code = makeCode(value);
        counterBase += 1;
        var position = counterBase + 1;

        if (codeEl) { codeEl.textContent = code; }
        if (positionNum) { positionNum.textContent = withCommas(position); }
        if (proofCount) { proofCount.textContent = withCommas(counterBase); }

        var local = value.split('@')[0].split(/[._-]/);
        var first = (local[0] || 'there').charAt(0).toUpperCase() + (local[0] || 'there').slice(1);
        var nameLine = $('.done-line');
        if (nameLine) { nameLine.textContent = first + ', you are number ' + withCommas(position) + ' on the list. Invite codes go out from 12 May 2026, top of each hour.'; }

        form.hidden = true;
        if (done) {
          done.hidden = false;
          var heading = $('h2', done);
          if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
        }
      }, 1250);
    });
  }

  /* ---------------- footer notes form ---------------- */
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
      footerStatus.textContent = 'Subscribed. Next note goes out on 7 April 2026.';
      footerStatus.className = 'news-status is-ok';
      footerForm.reset();
    });
  }

  /* ---------------- footer year ---------------- */
  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
}());
`,
};
