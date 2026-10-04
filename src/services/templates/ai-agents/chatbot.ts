export default {
  html: `
<a class="skip-link" href="#chat-main">Skip to the conversation</a>

<div class="app" id="app">

  <header class="topbar">
    <button type="button" class="icon-btn list-toggle" id="list-toggle" aria-expanded="false" aria-controls="threads-pane" aria-label="Show conversation list">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>

    <a class="brand" href="#chat-main" aria-label="Atlas, go to the conversation">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <path d="M16 3 4 8.5v7.7c0 7 5 12.1 12 13.8 7-1.7 12-6.8 12-13.8V8.5L16 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <circle cx="16" cy="15" r="4" stroke="currentColor" stroke-width="1.8"/>
          <path d="M16 3v5M8 24l2.5-4M24 24l-2.5-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-text">Atlas</span>
      <span class="brand-tag">Enterprise</span>
    </a>

    <div class="topbar-right">
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>All systems operational</span>
      <button type="button" class="icon-btn" id="theme-btn" aria-label="Theme: auto, click to change">
        <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/></svg>
        <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg>
        <svg class="i-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5"/><path d="M8 20.5h8"/></svg>
      </button>
      <div class="menu-wrap">
        <button type="button" class="avatar-btn" id="user-btn" aria-expanded="false" aria-controls="user-panel" aria-label="Account menu for Sanjay Iyer">
          <span class="avatar-chip" aria-hidden="true">SI</span>
        </button>
        <div class="dropdown user-panel" id="user-panel" hidden>
          <p class="dropdown-user"><strong>Sanjay Iyer</strong><span>Compliance Lead, Northbeam</span></p>
          <ul class="menu-list">
            <li><button type="button" class="menu-item">Knowledge sources</button></li>
            <li><button type="button" class="menu-item">Citation settings</button></li>
            <li><button type="button" class="menu-item">Retention policy</button></li>
          </ul>
        </div>
      </div>
    </div>
  </header>

  <div class="thread-scrim" id="thread-scrim"></div>

  <div class="workspace">
    <aside class="threads" id="threads-pane" aria-label="Conversation list">
      <div class="threads-head">
        <button type="button" class="btn-new" id="new-chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>
          New conversation
        </button>
        <label class="thread-search">
          <span class="sr-only">Search conversations</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></svg>
          <input type="search" id="thread-search" placeholder="Search conversations" autocomplete="off" />
        </label>
        <p class="threads-count"><span id="thread-count">7</span> conversations &middot; <span id="unread-count">3</span> unread</p>
      </div>
      <nav class="thread-list" id="thread-list" aria-label="Conversations"></nav>
      <div class="threads-foot">
        <p class="foot-note">Atlas answers only from indexed sources. Anything it cannot source, it says so and hands you the nearest three documents instead.</p>
      </div>
    </aside>

    <main class="chat" id="chat-main">
      <header class="chat-head">
        <div class="chat-title">
          <h1 id="thread-title">SOC 2 evidence for the Q1 audit</h1>
          <p class="chat-meta" id="chat-meta">2 messages</p>
        </div>
        <div class="chat-tools">
          <button type="button" class="chip-tool" id="depth-btn" aria-label="Change reasoning depth, currently medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2Z"/></svg>
            <span id="depth-label">Medium</span>
          </button>
          <button type="button" class="icon-btn" id="clear-btn" aria-label="Clear this conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6M10 21h.01M17 21h.01"/></svg>
          </button>
        </div>
      </header>

      <div class="stream" id="stream" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation"></div>

      <button type="button" class="to-bottom" id="to-bottom" aria-label="Scroll to the newest message" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>
      </button>

      <div class="composer-wrap">
        <div class="suggestions" id="suggestions" role="group" aria-label="Suggested questions">
          <button type="button" class="chip" data-q="Who owns single sign-on?">Who owns SSO?</button>
          <button type="button" class="chip" data-q="What is our data retention policy?">Retention policy</button>
          <button type="button" class="chip" data-q="Summarise the Kestrel incident review">Incident review</button>
          <button type="button" class="chip" data-q="What are the EU data residency options?">EU residency</button>
          <button type="button" class="chip" data-q="Write a SQL query for monthly failed payments">SQL example</button>
        </div>

        <form class="composer" id="composer">
          <div class="composer-inner">
            <label class="sr-only" for="composer-input">Message Atlas</label>
            <textarea id="composer-input" rows="1" maxlength="1200" placeholder="Ask Atlas anything in your indexed sources" aria-describedby="composer-count"></textarea>
            <div class="composer-actions">
              <span class="char-count" id="composer-count">0 / 1200</span>
              <button type="button" class="icon-btn sm" id="attach-btn" aria-label="Attach a source">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>
              </button>
              <button type="submit" class="btn-send" id="send-btn" aria-label="Send message" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
              </button>
            </div>
          </div>
          <p class="composer-hint">Enter sends &middot; Shift + Enter adds a line &middot; Atlas cites every claim</p>
        </form>
      </div>
    </main>
  </div>

  <section class="capabilities" id="capabilities" aria-labelledby="cap-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">Why teams pick Atlas</p>
        <h2 id="cap-title">It only answers from what you can prove</h2>
        <p class="section-sub">Six behaviours that decide whether an assistant is usable inside a regulated company.</p>
      </header>
      <ul class="cap-grid">
        <li class="cap" data-reveal style="--delay:0ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"/></svg></span>
          <h3>Every claim is clickable</h3>
          <p>Open any sentence to see the exact page, paragraph and author it came from, at the access level you are entitled to.</p>
        </li>
        <li class="cap" data-reveal style="--delay:60ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4"/></svg></span>
          <h3>Permission-aware retrieval</h3>
          <p>If you cannot open a document, Atlas will not quote it. Answers reflect your access, not the index owner access.</p>
        </li>
        <li class="cap" data-reveal style="--delay:120ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg></span>
          <h3>Refuses rather than guesses</h3>
          <p>No source, no answer. Atlas returns the three nearest documents with a note on why each was rejected.</p>
        </li>
        <li class="cap" data-reveal style="--delay:180ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg></span>
          <h3>Residency you choose</h3>
          <p>Run the whole index in Frankfurt, Dublin, Virginia or Singapore. Data never leaves the region you pick.</p>
        </li>
        <li class="cap" data-reveal style="--delay:240ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 6h5l3 6 3-6h5M4 18h5l3-6"/><path d="m17 3 3 3-3 3M17 15l3 3-3 3"/></svg></span>
          <h3>Connects to what you run</h3>
          <p>Confluence, SharePoint, Notion, Slack, Jira and a documented REST API. Incremental refresh inside fifteen minutes.</p>
        </li>
        <li class="cap" data-reveal style="--delay:300ms">
          <span class="cap-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M3 3v18h18M7 15v-4M12 15V8M17 15v-6"/></svg></span>
          <h3>Audited answers</h3>
          <p>Every conversation is logged with its citations and model version, exportable for your next SOC 2 or ISO review.</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="releases" aria-labelledby="rel-title">
    <div class="wrap rel-grid">
      <header class="section-head rel-head" data-reveal>
        <p class="kicker">Shipped</p>
        <h2 id="rel-title">Last three releases</h2>
        <p class="section-sub">Dated, versioned and unhidden. If a release made something worse, the notes say so.</p>
      </header>
      <ol class="rel-list">
        <li data-reveal style="--delay:0ms">
          <span class="rel-ver">v4.12</span>
          <time datetime="2026-04-02">2 April 2026</time>
          <h3>Permission filters applied before ranking</h3>
          <p>Documents you cannot open are removed before retrieval rather than after. Answers no longer leak titles you are not entitled to see.</p>
        </li>
        <li data-reveal style="--delay:80ms">
          <span class="rel-ver">v4.11</span>
          <time datetime="2026-03-19">19 March 2026</time>
          <h3>Citation pane split view</h3>
          <p>The cited paragraph opens beside the answer with the last edit date and author. Median time-to-verify fell from 41 seconds to 12.</p>
        </li>
        <li data-reveal style="--delay:160ms">
          <span class="rel-ver">v4.10</span>
          <time datetime="2026-03-05">5 March 2026</time>
          <h3>A regression we chose to disclose</h3>
          <p>Japanese and Dutch recall both dropped 3 points while we changed the chunker. Both are back above baseline in v4.11. The v4.10 numbers were wrong and we shipped them anyway.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="numbers" id="numbers" aria-labelledby="numbers-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">Outcomes</p>
        <h2 id="numbers-title">What changes in the first quarter</h2>
        <p class="section-sub">Aggregated across 312 production tenants, measured 90 days after go-live.</p>
      </header>

      <ul class="num-strip" data-reveal>
        <li><span class="num-val"><span class="counter" data-count="41" data-decimals="0">0</span> sec</span><span class="num-label">Median time to verify a cited answer, down from 41 minutes of manual searching</span></li>
        <li><span class="num-val"><span class="counter" data-count="0.4" data-decimals="1">0</span>%</span><span class="num-label">Unsupportable answers returned, down from 6.2% before the refusal path shipped</span></li>
        <li><span class="num-val"><span class="counter" data-count="312">0</span></span><span class="num-label">Production tenants across 11 regulated industries</span></li>
        <li><span class="num-val"><span class="counter" data-count="90" data-decimals="0">0</span>k</span><span class="num-label">Documents indexed per connector-hour on the standard plan</span></li>
      </ul>

      <ul class="quote-grid">
        <li data-reveal style="--delay:0ms">
          <blockquote><p>We turned off two of the four tools we bought to search. That is not a metric Atlas reports, it is just what happened in month two.</p></blockquote>
          <p class="quote-by"><strong>Ingrid Vasquez-Holt</strong><span>Group COO, Kestrel Bank</span></p>
        </li>
        <li data-reveal style="--delay:80ms">
          <blockquote><p>Security signed off in eleven days because the evidence was already sitting there with citations attached. We had budgeted a quarter.</p></blockquote>
          <p class="quote-by"><strong>Tobias Renner</strong><span>Head of Data Governance, Northbeam</span></p>
        </li>
        <li data-reveal style="--delay:160ms">
          <blockquote><p>The refusal path is the feature. An assistant that admits it does not know is worth ten that invent something plausible.</p></blockquote>
          <p class="quote-by"><strong>Priya Balakrishnan</strong><span>Chief Risk Officer, Altira Logistics</span></p>
        </li>
      </ul>
    </div>
  </section>

  <section class="trust" id="trust" aria-labelledby="trust-title">
    <div class="wrap">
      <div class="trust-strip" data-reveal>
        <span class="trust-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
        <h2 id="trust-title">Zero training on customer data. Contractually.</h2>
        <p>Clause 9.1 of the master agreement states that no content from your index is used to train any model, ours or a vendor one, and that no subprocessor may do so either. Two funding offers worth $180M were declined on that clause alone.</p>
        <ul class="trust-badges">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4"/></svg>SOC 2 Type II</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>GDPR &amp; UK GDPR</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg>ISO 27001</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>HIPAA BAA</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="faq-title">
    <div class="wrap faq-grid">
      <header class="section-head faq-head" data-reveal>
        <p class="kicker">Questions</p>
        <h2 id="faq-title">What buyers actually ask</h2>
        <p class="section-sub">Answered by the security team, who are the ones who get asked twice.</p>
      </header>
      <div class="accordion" id="accordion">
        <div class="acc" data-reveal style="--delay:0ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="af1" id="at1">How does Atlas avoid answering from documents I cannot access?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="af1" role="region" aria-labelledby="at1" hidden><p>Filters run before ranking, not after generation. Your permission set is evaluated against every candidate chunk at query time, so a document you cannot open never enters the context window and therefore cannot be paraphrased, quoted or summarised by accident.</p></div>
        </div>
        <div class="acc" data-reveal style="--delay:60ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="af2" id="at2">What happens when the honest answer is that it does not know?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="af2" role="region" aria-labelledby="at2" hidden><p>Atlas returns nothing rather than something vague, then lists the three documents closest to the question with a note on why each was rejected. In testing, forcing that refusal path cut hallucinated answers from 6.2% to 0.4%.</p></div>
        </div>
        <div class="acc" data-reveal style="--delay:120ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="af3" id="at3">Can we self-host it entirely?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="af3" role="region" aria-labelledby="at3" hidden><p>Yes, on the Enterprise plan. Atlas runs as three containers inside your own Kubernetes cluster with a bring-your-own-model option. Four customers run fully air-gapped; we publish images quarterly with a 90-day support window.</p></div>
        </div>
        <div class="acc" data-reveal style="--delay:180ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="af4" id="at4">How long does indexing take?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="af4" role="region" aria-labelledby="at4" hidden><p>About 90,000 documents per connector-hour. A typical 250,000-document SharePoint index completes in six hours, and incremental changes appear within fifteen minutes of the source being saved.</p></div>
        </div>
        <div class="acc" data-reveal style="--delay:240ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="af5" id="at5">What does it cost?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="af5" role="region" aria-labelledby="at5" hidden><p>$12 per seat per month, or a flat $2,400 per month for an organisation-wide licence up to 500 people. There is no per-question charge and no charge for unanswered queries, which is deliberate: we do not want an incentive to guess.</p></div>
        </div>
      </div>
    </div>
  </section>
</div>

<footer class="site-footer" id="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#chat-main" aria-label="Atlas, go to the conversation">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false">
            <path d="M16 3 4 8.5v7.7c0 7 5 12.1 12 13.8 7-1.7 12-6.8 12-13.8V8.5L16 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <circle cx="16" cy="15" r="4" stroke="currentColor" stroke-width="1.8"/>
            <path d="M16 3v5M8 24l2.5-4M24 24l-2.5-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-text">Atlas</span>
      </a>
      <p class="footer-blurb">The knowledge assistant that shows its sources. Built in Lisbon, running in whichever region you pick.</p>
      <ul class="socials">
        <li><a href="#footer" aria-label="Atlas on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
        <li><a href="#footer" aria-label="Atlas on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/></svg></a></li>
        <li><a href="#footer" aria-label="Atlas status page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="af-prod">
      <h2 id="af-prod">Product</h2>
      <ul>
        <li><a href="#capabilities">Capabilities</a></li>
        <li><a href="#chat-main">Live conversation</a></li>
        <li><a href="#trust">Trust centre</a></li>
        <li><a href="#footer">Pricing</a></li>
        <li><a href="#footer">Integrations</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="af-build">
      <h2 id="af-build">For builders</h2>
      <ul>
        <li><a href="#footer">REST API</a></li>
        <li><a href="#footer">Webhooks</a></li>
        <li><a href="#footer">Self-hosting guide</a></li>
        <li><a href="#footer">Bring your own model</a></li>
        <li><a href="#footer">Changelog</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="af-comp">
      <h2 id="af-comp">Company</h2>
      <ul>
        <li><a href="#footer">About Atlas</a></li>
        <li><a href="#footer">Security</a></li>
        <li><a href="#footer">Sub-processors</a></li>
        <li><a href="#footer">Careers</a></li>
        <li><a href="#footer">Contact sales</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <h2 id="af-news">Release digest</h2>
      <p>One email the morning after every release, with the diff and any regression we caused.</p>
      <form id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email for the release digest</label>
        <div class="news-row">
          <input type="email" id="footer-email" name="email" placeholder="you@company.com" aria-describedby="footer-status" required />
          <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscribe to the release digest">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
        <p class="news-status" id="footer-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Atlas Intelligence Unipessoal Lda &middot; Rua Garrett 42, Lisbon</p>
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
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Sora', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace;

  --bg: #070b14;
  --surface: #0e1626;
  --surface-2: #131d31;
  --surface-3: #1a2540;
  --surface-hi: #202d4d;
  --ink: #eaeffb;
  --body: #b2bed3;
  --muted: #8492ab;
  --line: rgba(150, 168, 205, 0.18);
  --line-soft: rgba(150, 168, 205, 0.09);

  --accent: #6f95ff;
  --accent-2: #a97bff;
  --accent-3: #37d6c4;
  --accent-ink: #a9bcff;
  --accent-soft: rgba(111, 149, 255, 0.13);

  --ok: #5ed39c;
  --ok-soft: rgba(94, 211, 156, 0.13);
  --bad: #f28b9b;
  --bad-soft: rgba(242, 139, 155, 0.13);
  --warn: #e2b263;

  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 22px; --s-6: 30px; --s-7: 46px; --s-8: 64px;
  --pad-section: clamp(56px, 7vw, 104px);

  --r-sm: 7px; --r-md: 11px; --r-lg: 16px; --r-xl: 22px; --r-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.45);
  --shadow-md: 0 14px 34px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 28px 66px rgba(0, 0, 0, 0.66);
  --shadow-accent: 0 14px 38px rgba(111, 149, 255, 0.3);

  --thread-w: 306px;
  --topbar-h: 64px;
  --wrap: 1280px;
  --ease: cubic-bezier(0.22, 0.72, 0.24, 1);
  --dur: 0.26s;
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #f4f6fb;
    --surface: #ffffff;
    --surface-2: #f8fafd;
    --surface-3: #eef2f9;
    --surface-hi: #e4ebf6;
    --ink: #0e182c;
    --body: #47566e;
    --muted: #768499;
    --line: #dfe6f1;
    --line-soft: #edf1f7;
    --accent: #2f5df0;
    --accent-2: #7a3ff2;
    --accent-3: #0aa596;
    --accent-ink: #2145c8;
    --accent-soft: rgba(47, 93, 240, 0.08);
    --ok: #0c7a4c;
    --ok-soft: rgba(12, 122, 76, 0.1);
    --bad: #b42636;
    --bad-soft: rgba(180, 38, 54, 0.09);
    --warn: #96620f;
    --shadow-xs: 0 1px 2px rgba(14, 24, 44, 0.05);
    --shadow-sm: 0 2px 8px rgba(14, 24, 44, 0.07);
    --shadow-md: 0 14px 32px rgba(14, 24, 44, 0.1);
    --shadow-lg: 0 26px 60px rgba(14, 24, 44, 0.15);
    --shadow-accent: 0 14px 36px rgba(47, 93, 240, 0.22);
  }
}

html[data-theme="dark"] {
  --bg: #070b14;
  --surface: #0e1626;
  --surface-2: #131d31;
  --surface-3: #1a2540;
  --surface-hi: #202d4d;
  --ink: #eaeffb;
  --body: #b2bed3;
  --muted: #8492ab;
  --line: rgba(150, 168, 205, 0.18);
  --line-soft: rgba(150, 168, 205, 0.09);
  --accent: #6f95ff;
  --accent-2: #a97bff;
  --accent-3: #37d6c4;
  --accent-ink: #a9bcff;
  --accent-soft: rgba(111, 149, 255, 0.13);
  --ok: #5ed39c;
  --ok-soft: rgba(94, 211, 156, 0.13);
  --bad: #f28b9b;
  --bad-soft: rgba(242, 139, 155, 0.13);
  --warn: #e2b263;
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.45);
  --shadow-md: 0 14px 34px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 28px 66px rgba(0, 0, 0, 0.66);
  --shadow-accent: 0 14px 38px rgba(111, 149, 255, 0.3);
}

html[data-theme="light"] {
  --bg: #f4f6fb;
  --surface: #ffffff;
  --surface-2: #f8fafd;
  --surface-3: #eef2f9;
  --surface-hi: #e4ebf6;
  --ink: #0e182c;
  --body: #47566e;
  --muted: #768499;
  --line: #dfe6f1;
  --line-soft: #edf1f7;
  --accent: #2f5df0;
  --accent-2: #7a3ff2;
  --accent-3: #0aa596;
  --accent-ink: #2145c8;
  --accent-soft: rgba(47, 93, 240, 0.08);
  --ok: #0c7a4c;
  --ok-soft: rgba(12, 122, 76, 0.1);
  --bad: #b42636;
  --bad-soft: rgba(180, 38, 54, 0.09);
  --warn: #96620f;
  --shadow-xs: 0 1px 2px rgba(14, 24, 44, 0.05);
  --shadow-sm: 0 2px 8px rgba(14, 24, 44, 0.07);
  --shadow-md: 0 14px 32px rgba(14, 24, 44, 0.1);
  --shadow-lg: 0 26px 60px rgba(14, 24, 44, 0.15);
  --shadow-accent: 0 14px 36px rgba(47, 93, 240, 0.22);
}

*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; padding: 0; font-family: var(--font-text); font-size: 15px; line-height: 1.6; color: var(--body); background: var(--bg); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
h1, h2, h3 { font-family: var(--font-display); color: var(--ink); line-height: 1.16; margin: 0; font-weight: 600; letter-spacing: -0.026em; }
h1 { font-size: clamp(1.1rem, 1.8vw, 1.35rem); }
h2 { font-size: clamp(1.75rem, 3.3vw, 2.6rem); }
h3 { font-size: clamp(1rem, 1.4vw, 1.18rem); }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
svg { display: block; max-width: 100%; }
a { color: var(--accent-ink); text-decoration: none; }
button, input, textarea { font: inherit; color: inherit; }
strong, b { color: var(--ink); font-weight: 600; }
code { font-family: var(--font-mono); font-size: 0.86em; padding: 1px 5px; border-radius: 5px; background: var(--surface-3); color: var(--accent-ink); }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(18px, 4vw, 40px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--r-sm); }
.skip-link { position: fixed; left: 50%; top: 0; transform: translate(-50%, -160%); z-index: 500; padding: 12px 22px; border-radius: 0 0 var(--r-md) var(--r-md); background: var(--accent); color: #05080f; font-weight: 600; font-size: 0.9rem; transition: transform var(--dur) var(--ease); }
.skip-link:focus { transform: translate(-50%, 0); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2); padding: 11px 20px; border: 1px solid transparent; border-radius: var(--r-md); font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { box-shadow: var(--shadow-accent); transform: translateY(-1px); }
.btn-sm { padding: 8px 13px; font-size: 0.82rem; }
.btn .icon { width: 17px; height: 17px; }
.icon-btn { display: inline-grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-2); color: var(--body); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.icon-btn svg { width: 20px; height: 20px; }
.icon-btn:hover { border-color: var(--accent); color: var(--accent-ink); background: var(--accent-soft); }
.icon-btn:active { transform: scale(0.94); }
.icon-btn.sm { width: 32px; height: 32px; }
.icon-btn.sm svg { width: 17px; height: 17px; }

.kicker { display: inline-block; margin-bottom: var(--s-3); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-ink); }
.section-title { margin-bottom: var(--s-4); max-width: 26ch; }
.section-sub { color: var(--muted); max-width: 60ch; }
.section-head { margin-bottom: clamp(26px, 3.6vw, 48px); max-width: 720px; }
[data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity 0.68s var(--ease) var(--delay, 0ms), transform 0.68s var(--ease) var(--delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- topbar ---------- */
.app { min-height: 100vh; display: flex; flex-direction: column; }
.topbar { position: sticky; top: 0; z-index: 80; display: flex; align-items: center; gap: var(--s-4); height: var(--topbar-h); padding-inline: clamp(14px, 2.4vw, 24px); border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 84%, transparent); backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); }
.list-toggle { display: none; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: var(--ink); }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(140deg, var(--accent), var(--accent-2)); color: #fff; transition: transform 0.55s var(--ease); }
.brand:hover .brand-mark { transform: rotate(-8deg) scale(1.05); }
.brand-mark svg { width: 21px; height: 21px; }
.brand-text { font-family: var(--font-display); font-size: 1.16rem; font-weight: 700; letter-spacing: -0.02em; }
.brand-tag { padding: 2px 9px; border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.topbar-right { display: flex; align-items: center; gap: var(--s-3); margin-left: auto; }
.status-pill { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 0.76rem; font-weight: 600; color: var(--body); white-space: nowrap; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); animation: pulseRing 2.6s ease-out infinite; }
.avatar-btn { border: 0; background: none; padding: 0; cursor: pointer; border-radius: 50%; }
.avatar-chip { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(140deg, var(--accent-2), var(--accent-3)); color: #05080f; font-size: 0.8rem; font-weight: 700; transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.avatar-btn:hover .avatar-chip { transform: scale(1.06); box-shadow: var(--shadow-accent); }
#theme-btn .i-sun, #theme-btn .i-moon { display: none; }
#theme-btn .i-auto { display: block; }
html[data-theme="light"] #theme-btn .i-auto { display: none; }
html[data-theme="light"] #theme-btn .i-moon { display: block; }
html[data-theme="dark"] #theme-btn .i-auto { display: none; }
html[data-theme="dark"] #theme-btn .i-sun { display: block; }
.menu-wrap { position: relative; }
.dropdown { position: absolute; top: calc(100% + 10px); right: 0; z-index: 60; width: 268px; border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-md); animation: dropIn 0.2s var(--ease) both; }
.dropdown[hidden] { display: none; }
.dropdown-user { padding: 13px 16px; border-bottom: 1px solid var(--line-soft); }
.dropdown-user strong { display: block; }
.dropdown-user span { font-size: 0.78rem; color: var(--muted); }
.menu-list { padding: 6px; display: grid; }
.menu-item { width: 100%; padding: 9px 12px; border: 0; border-radius: var(--r-sm); background: none; text-align: left; font-size: 0.86rem; color: var(--body); cursor: pointer; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.menu-item:hover { background: var(--accent-soft); color: var(--ink); }
.thread-scrim { display: none; position: fixed; inset: var(--topbar-h) 0 0; z-index: 65; background: rgba(4, 8, 16, 0.55); animation: fadeIn 0.2s var(--ease) both; }

/* ---------- workspace ---------- */
.workspace { flex: 1; display: grid; grid-template-columns: var(--thread-w) minmax(0, 1fr); min-height: 0; align-items: stretch; }

/* ---------- threads sidebar ---------- */
.threads { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--line); background: var(--surface); }
.threads-head { padding: var(--s-4); border-bottom: 1px solid var(--line-soft); }
.btn-new { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 16px; border: 1px solid var(--accent); border-radius: var(--r-md); background: var(--accent); color: #fff; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.btn-new svg { width: 18px; height: 18px; }
.btn-new:hover { box-shadow: var(--shadow-accent); transform: translateY(-1px); }
.thread-search { position: relative; display: flex; align-items: center; margin-top: var(--s-3); }
.thread-search svg { position: absolute; left: 11px; width: 17px; height: 17px; color: var(--muted); pointer-events: none; }
.thread-search input { width: 100%; padding: 9px 12px 9px 35px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-3); font-size: 0.84rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.thread-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
.thread-search input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.threads-count { margin-top: 9px; font-size: 0.74rem; color: var(--muted); }
.thread-list { flex: 1; overflow-y: auto; padding: var(--s-2); display: grid; gap: 2px; align-content: start; }
.thread-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px var(--s-2); width: 100%; padding: 11px 12px; border: 0; border-radius: var(--r-md); background: none; text-align: left; cursor: pointer; transition: background-color var(--dur) var(--ease); animation: bubbleIn 0.34s var(--ease) both; }
.thread-item:hover { background: var(--surface-3); }
.thread-item.is-active { background: var(--accent-soft); box-shadow: inset 2px 0 0 var(--accent); }
.thread-name { font-size: 0.86rem; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.thread-item.is-unread .thread-name::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: var(--accent); vertical-align: 2px; }
.thread-badge { grid-row: 1 / span 2; align-self: center; min-width: 20px; height: 20px; padding: 0 6px; display: grid; place-items: center; border-radius: var(--r-pill); background: var(--accent); color: #fff; font-size: 0.68rem; font-weight: 700; }
.thread-badge[hidden] { display: none; }
.thread-snip { font-size: 0.78rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.thread-time { grid-column: 2; grid-row: 2; align-self: end; font-size: 0.7rem; color: var(--muted); white-space: nowrap; }
.thread-empty { padding: var(--s-5); text-align: center; font-size: 0.84rem; color: var(--muted); }
.threads-foot { padding: var(--s-4); border-top: 1px solid var(--line-soft); }
.foot-note { font-size: 0.76rem; color: var(--muted); }

/* ---------- chat pane ---------- */
.chat { display: flex; flex-direction: column; min-height: 0; min-width: 0; position: relative; background: var(--bg); }
.chat-head { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: var(--s-4) clamp(14px, 2.6vw, 28px); border-bottom: 1px solid var(--line); }
.chat-meta { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
.chat-tools { display: flex; align-items: center; gap: var(--s-2); }
.chip-tool { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface-2); font-size: 0.82rem; font-weight: 600; color: var(--body); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.chip-tool svg { width: 17px; height: 17px; color: var(--accent); }
.chip-tool:hover { border-color: var(--accent); color: var(--ink); background: var(--accent-soft); }

.stream { flex: 1; overflow-y: auto; padding: clamp(18px, 2.6vw, 30px) clamp(14px, 2.6vw, 28px); display: flex; flex-direction: column; gap: var(--s-5); }
.stream > * { flex: none; }

.msg { display: flex; gap: var(--s-3); max-width: 100%; animation: bubbleIn 0.36s var(--ease) both; }
.msg.is-user { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; border-radius: 11px; flex: none; display: grid; place-items: center; overflow: hidden; }
.msg.is-bot .msg-avatar { background: linear-gradient(140deg, var(--accent), var(--accent-2)); color: #fff; box-shadow: var(--shadow-sm); }
.msg.is-bot .msg-avatar svg { width: 21px; height: 21px; animation: slowSpin 16s linear infinite; }
.msg.is-user .msg-avatar { background: var(--surface-hi); color: var(--ink); font-size: 0.74rem; font-weight: 700; }
.msg-col { min-width: 0; max-width: min(760px, 84%); }
.msg.is-user .msg-col { display: flex; flex-direction: column; align-items: flex-end; }
.msg-who { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
.bubble { padding: 13px 16px; border-radius: var(--r-lg); font-size: 0.92rem; line-height: 1.62; overflow-wrap: break-word; }
.msg.is-user .bubble { background: var(--accent); color: #fff; border-bottom-right-radius: 5px; }
.msg.is-user .bubble code { background: rgba(255, 255, 255, 0.2); color: #fff; }
.msg.is-bot .bubble { border: 1px solid var(--line); background: var(--surface); color: var(--body); border-bottom-left-radius: 5px; }
.bubble > * + * { margin-top: 10px; }
.bubble h4 { font-family: var(--font-display); font-size: 0.96rem; color: var(--ink); letter-spacing: -0.015em; }
.bubble ul { list-style: disc; padding-left: 19px; }
.bubble ol { list-style: decimal; padding-left: 19px; }
.bubble ul, .bubble ol { display: grid; gap: 6px; }
.bubble li::marker { color: var(--accent); }
.bubble a { text-decoration: underline; text-underline-offset: 2px; }
.bubble blockquote { border-left: 3px solid var(--accent); padding-left: 12px; }
.bubble table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.bubble th, .bubble td { padding: 7px 10px; border: 1px solid var(--line); text-align: left; }
.bubble th { background: var(--surface-3); color: var(--ink); font-weight: 600; }
.stream-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--accent); animation: caretBlink 0.9s steps(2, end) infinite; }

.code-block { border: 1px solid var(--line); border-radius: var(--r-md); overflow: hidden; background: var(--surface-2); }
.code-head { display: flex; align-items: center; justify-content: space-between; gap: var(--s-3); padding: 7px 10px 7px 13px; border-bottom: 1px solid var(--line-soft); background: var(--surface-3); }
.code-lang { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.code-copy { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface); font-size: 0.72rem; font-weight: 600; color: var(--body); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease); }
.code-copy svg { width: 13px; height: 13px; }
.code-copy:hover { border-color: var(--accent); color: var(--accent-ink); }
.code-block pre { margin: 0; padding: 13px; overflow-x: auto; }
.code-block code { padding: 0; background: none; color: var(--body); font-size: 0.83rem; line-height: 1.6; white-space: pre; }

.sources { display: grid; gap: 6px; }
.sources summary { cursor: pointer; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent-ink); list-style: none; display: inline-flex; align-items: center; gap: 7px; }
.sources summary::-webkit-details-marker { display: none; }
.sources summary::before { content: ""; width: 0; height: 0; border-left: 5px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; transition: transform var(--dur) var(--ease); }
.sources[open] summary::before { transform: rotate(90deg); }
.sources ol { padding-left: 19px; list-style: decimal; }
.sources li { font-size: 0.8rem; }
.source-meta { display: block; color: var(--muted); font-size: 0.74rem; }

.msg-actions { display: flex; align-items: center; gap: 3px; margin-top: 7px; opacity: 0; transition: opacity var(--dur) var(--ease); }
.msg:hover .msg-actions, .msg:focus-within .msg-actions { opacity: 1; }
.act { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border: 1px solid transparent; border-radius: var(--r-sm); background: none; font-size: 0.72rem; font-weight: 600; color: var(--muted); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.act svg { width: 15px; height: 15px; }
.act:hover { border-color: var(--line); background: var(--surface-3); color: var(--ink); }
.act.is-on { color: var(--ok); border-color: var(--ok); background: var(--ok-soft); }
.act.is-down.is-on { color: var(--bad); border-color: var(--bad); background: var(--bad-soft); }

.typing { display: flex; align-items: center; gap: 10px; }
.typing-dots { display: inline-flex; align-items: center; gap: 5px; padding: 3px 2px; }
.typing-dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: dotBounce 1.15s ease-in-out infinite; }
.typing-dots i:nth-child(2) { animation-delay: 0.16s; background: var(--accent-2); }
.typing-dots i:nth-child(3) { animation-delay: 0.32s; background: var(--accent-3); }
.typing-label { font-size: 0.76rem; color: var(--muted); }
.typing-bar { margin-top: 9px; height: 3px; border-radius: var(--r-pill); background: var(--surface-3); overflow: hidden; max-width: 260px; }
.typing-bar span { display: block; height: 100%; width: 34%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3)); animation: thinkSlide 1.35s var(--ease) infinite; }

.to-bottom { position: absolute; right: clamp(16px, 3vw, 32px); bottom: 148px; z-index: 20; display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--ink); box-shadow: var(--shadow-md); cursor: pointer; animation: bubbleIn 0.28s var(--ease) both; transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.to-bottom[hidden] { display: none; }
.to-bottom svg { width: 19px; height: 19px; }
.to-bottom:hover { background: var(--accent); color: #fff; transform: translateY(-3px); }

/* ---------- composer ---------- */
.composer-wrap { padding: 0 clamp(14px, 2.6vw, 28px) clamp(16px, 2vw, 22px); }
.suggestions { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: var(--s-3); }
.chip { padding: 6px 13px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface-2); font-size: 0.79rem; font-weight: 600; color: var(--body); cursor: pointer; transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.chip:hover { border-color: var(--accent); color: var(--ink); background: var(--accent-soft); transform: translateY(-2px); }
.composer { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--shadow-sm); transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.composer:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.composer-inner { display: flex; align-items: flex-end; gap: var(--s-3); padding: 10px 10px 10px 14px; }
.composer textarea { flex: 1; min-width: 0; max-height: 168px; padding: 6px 0; border: 0; background: none; resize: none; font-size: 0.92rem; line-height: 1.5; color: var(--ink); }
.composer textarea:focus { outline: none; }
.composer textarea::placeholder { color: var(--muted); }
.composer-actions { display: flex; align-items: center; gap: 6px; flex: none; }
.char-count { font-size: 0.72rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.char-count.is-near { color: var(--warn); }
.char-count.is-full { color: var(--bad); font-weight: 700; }
.btn-send { display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: var(--r-md); background: var(--accent); color: #fff; cursor: pointer; transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease), opacity var(--dur) var(--ease); }
.btn-send svg { width: 19px; height: 19px; }
.btn-send:hover:not(:disabled) { background: var(--accent-2); transform: translateY(-2px); }
.btn-send:disabled { opacity: 0.35; cursor: not-allowed; }
.composer-hint { padding: 0 16px 11px; font-size: 0.73rem; color: var(--muted); }

/* ---------- capabilities ---------- */
.capabilities { padding-block: var(--pad-section); border-top: 1px solid var(--line); background: var(--surface); }
.cap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: var(--s-4); }
.cap { padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface-2); position: relative; overflow: hidden; transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.cap::before { content: ""; position: absolute; inset: auto 0 0 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3)); transform: scaleX(0); transform-origin: left; transition: transform 0.4s var(--ease); }
.cap:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.cap:hover::before { transform: scaleX(1); }
.cap-ico { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: var(--s-4); border-radius: 13px; background: var(--accent-soft); color: var(--accent-ink); transition: transform var(--dur) var(--ease); }
.cap-ico svg { width: 23px; height: 23px; }
.cap:hover .cap-ico { transform: translateY(-3px) rotate(-5deg); }
.cap h3 { margin-bottom: var(--s-2); }
.cap p { font-size: 0.9rem; }

/* ---------- releases ---------- */
.releases { padding-block: var(--pad-section); }
.rel-grid { display: grid; grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr); gap: clamp(28px, 4vw, 62px); align-items: start; }
.rel-head { position: sticky; top: calc(var(--topbar-h) + 22px); }
.rel-list { display: grid; gap: var(--s-3); }
.rel-list > li { padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.rel-list > li:hover { transform: translateX(6px); border-color: var(--accent); box-shadow: var(--shadow-sm); }
.rel-ver { display: inline-block; margin-bottom: var(--s-2); padding: 2px 10px; border-radius: var(--r-pill); background: var(--accent-soft); color: var(--accent-ink); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; }
.rel-list time { display: block; font-size: 0.74rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
.rel-list h3 { margin-bottom: 5px; }
.rel-list p { font-size: 0.89rem; }

/* ---------- numbers + voices ---------- */
.numbers { padding-block: var(--pad-section); }
.num-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: var(--s-4); padding-bottom: var(--s-6); margin-bottom: var(--s-6); border-bottom: 1px solid var(--line); }
.num-val { display: block; font-family: var(--font-display); font-size: clamp(1.9rem, 3.2vw, 2.7rem); font-weight: 700; color: var(--accent-ink); letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums; }
.num-label { display: block; margin-top: 9px; font-size: 0.82rem; color: var(--muted); }
.quote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--s-4); }
.quote-grid > li { display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.quote-grid > li:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.quote-grid blockquote p { font-family: var(--font-display); font-size: 1.04rem; line-height: 1.45; color: var(--ink); }
.quote-by { margin-top: auto; font-size: 0.86rem; }
.quote-by strong { display: block; }
.quote-by span { display: block; font-size: 0.82rem; color: var(--muted); }

/* ---------- trust ---------- */
.trust { padding-block: 0 var(--pad-section); }
.trust-strip { display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: var(--s-4) var(--s-5); align-items: center; padding: clamp(24px, 3.4vw, 44px); border: 1px solid var(--accent); border-radius: var(--r-xl); background: var(--accent-soft); }
/* The icon is the only item in column 1. Without an explicit placement the
   paragraph falls into the next implicit column-1 cell, where the auto track
   sizes to its unwrapped max-content and squeezes column 2 to zero width. */
.trust-strip > p { grid-column: 2; }
.trust-ico { display: grid; place-items: center; width: 60px; height: 60px; border-radius: var(--r-lg); background: var(--accent); color: #fff; animation: floatY 7.5s ease-in-out infinite; }
.trust-ico svg { width: 31px; height: 31px; }
.trust-strip h2 { font-size: clamp(1.15rem, 1.9vw, 1.55rem); margin-bottom: 6px; }
.trust-strip p { font-size: 0.92rem; }
.trust-badges { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--s-3); padding-top: var(--s-4); border-top: 1px solid var(--line); }
.trust-badges li { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; }
.trust-badges svg { width: 18px; height: 18px; color: var(--accent); flex: none; }

/* ---------- faq ---------- */
.faq { padding-block: 0 var(--pad-section); }
.faq-grid { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(28px, 4vw, 60px); align-items: start; }
.faq-head { position: sticky; top: calc(var(--topbar-h) + 22px); }
.accordion { display: grid; gap: var(--s-2); }
.acc { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); overflow: hidden; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.acc:hover { border-color: var(--accent); }
.acc.is-open { border-color: var(--accent); background: var(--surface-2); }
.acc h3 { margin: 0; }
.acc-trigger { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); width: 100%; padding: var(--s-4) var(--s-5); border: 0; background: none; text-align: left; font-family: var(--font-display); font-size: clamp(0.95rem, 1.3vw, 1.06rem); font-weight: 600; color: var(--ink); cursor: pointer; transition: color var(--dur) var(--ease); }
.acc-trigger:hover { color: var(--accent-ink); }
.acc-caret { width: 20px; height: 20px; flex: none; color: var(--muted); transition: transform var(--dur) var(--ease), color var(--dur) var(--ease); }
.acc-trigger[aria-expanded="true"] .acc-caret { transform: rotate(180deg); color: var(--accent); }
.acc-panel { padding: 0 var(--s-5) var(--s-5); animation: accOpen 0.3s var(--ease) both; }
.acc-panel[hidden] { display: none; }
.acc-panel p { font-size: 0.92rem; }

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
@media (max-width: 1180px) {
  .footer-top { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .footer-brand { grid-column: 1 / -1; }
}
@media (max-width: 1024px) {
  .rel-grid, .faq-grid { grid-template-columns: minmax(0, 1fr); }
  .rel-head, .faq-head { position: static; }
}
@media (max-width: 860px) {
  .workspace { grid-template-columns: minmax(0, 1fr); }
  .list-toggle { display: inline-grid; }
  .threads { position: fixed; inset: var(--topbar-h) auto 0 0; z-index: 70; width: min(86vw, 320px); transform: translateX(-102%); transition: transform 0.3s var(--ease); box-shadow: var(--shadow-lg); }
  .app.is-list-open .threads { transform: none; }
  .app.is-list-open .thread-scrim { display: block; }
  .msg-col { max-width: 92%; }
}
@media (max-width: 620px) {
  .status-pill, .brand-tag { display: none; }
  .chat-head { flex-wrap: wrap; }
  .composer-actions .icon-btn { display: none; }
  .trust-strip { grid-template-columns: minmax(0, 1fr); }
  .trust-strip > p { grid-column: 1; }
  .footer-top { grid-template-columns: minmax(0, 1fr); }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .suggestions { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  .chip { white-space: nowrap; }
  .msg-col { max-width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  [data-reveal] { opacity: 1; transform: none; }
  .msg.is-bot .msg-avatar svg, .status-dot, .trust-ico, .typing-bar span, .typing-dots i, .stream-caret { animation: none !important; }
}

/* ---------- keyframes ---------- */
@keyframes bubbleIn { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
@keyframes dotBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.45; } 30% { transform: translateY(-6px); opacity: 1; } }
@keyframes thinkSlide { 0% { transform: translateX(-110%); } 100% { transform: translateX(330%); } }
@keyframes caretBlink { 50% { opacity: 0; } }
@keyframes slowSpin { to { transform: rotate(360deg); } }
@keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(94, 211, 156, 0.5); } 70% { box-shadow: 0 0 0 9px rgba(94, 211, 156, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 211, 156, 0); } }
@keyframes dropIn { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes accOpen { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
`,
  javascript: `
'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function make(tag, cls) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    return n;
  }

  /* ================= reveal ================= */
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

  /* ================= theme ================= */
  var THEMES = ['auto', 'light', 'dark'];
  var themeBtn = $('#theme-btn');
  var themeIndex = 0;
  function applyTheme() {
    var t = THEMES[themeIndex];
    if (t === 'auto') { document.documentElement.removeAttribute('data-theme'); }
    else { document.documentElement.setAttribute('data-theme', t); }
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Theme: ' + t + ', click to change');
      themeBtn.setAttribute('title', 'Theme: ' + t);
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      themeIndex = (themeIndex + 1) % THEMES.length;
      applyTheme();
    });
  }
  applyTheme();

  /* ================= account menu ================= */
  var userBtn = $('#user-btn');
  var userPanel = $('#user-panel');
  function setUserMenu(open) {
    if (!userBtn || !userPanel) { return; }
    userBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    userPanel.hidden = !open;
  }
  if (userBtn && userPanel) {
    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setUserMenu(userBtn.getAttribute('aria-expanded') !== 'true');
    });
    userPanel.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  document.addEventListener('click', function () { setUserMenu(false); });

  /* ================= mobile thread drawer ================= */
  var app = $('#app');
  var listToggle = $('#list-toggle');
  var listScrim = $('#thread-scrim');
  function setList(open) {
    if (!app || !listToggle) { return; }
    app.classList.toggle('is-list-open', open);
    listToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    listToggle.setAttribute('aria-label', open ? 'Hide conversation list' : 'Show conversation list');
  }
  if (listToggle) {
    listToggle.addEventListener('click', function () {
      setList(listToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (listScrim) { listScrim.addEventListener('click', function () { setList(false); }); }

  /* ================= markdown-ish renderer ================= */
  function inline(text) {
    return esc(text)
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\`(.+?)\`/g, '<code>$1</code>')
      .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function renderMarkdown(src, opts) {
    var withButtons = !!(opts && opts.buttons);
    var lines = String(src).split('\\n');
    var out = [];
    var i = 0;
    var listBuf = [];
    var listOrdered = false;

    function flush() {
      if (!listBuf.length) { return; }
      var tag = listOrdered ? 'ol' : 'ul';
      out.push('<' + tag + '>' + listBuf.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</' + tag + '>');
      listBuf = [];
    }

    while (i < lines.length) {
      var line = lines[i];

      if (line.indexOf('~~~') === 0) {
        flush();
        var lang = line.slice(3).trim() || 'text';
        var body = [];
        i += 1;
        while (i < lines.length && lines[i].indexOf('~~~') !== 0) { body.push(lines[i]); i += 1; }
        i += 1;
        var head = '<div class="code-head"><span class="code-lang">' + esc(lang) + '</span>';
        head += withButtons
          ? '<button type="button" class="code-copy" data-code-copy aria-label="Copy the ' + esc(lang) + ' code block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>Copy</button>'
          : '<span class="code-lang">streaming</span>';
        head += '</div>';
        out.push('<div class="code-block">' + head + '<pre><code>' + esc(body.join('\\n')) + '</code></pre></div>');
        continue;
      }

      if (/^#{2,4}\\s/.test(line)) {
        flush();
        out.push('<h4>' + inline(line.replace(/^#{2,4}\\s*/, '')) + '</h4>');
        i += 1;
        continue;
      }

      if (/^&gt;\\s?/.test(line)) {
        flush();
        out.push('<blockquote><p>' + inline(line.replace(/^&gt;\\s?/, '')) + '</p></blockquote>');
        i += 1;
        continue;
      }

      if (/^[-*]\\s/.test(line)) {
        if (listOrdered) { flush(); }
        listOrdered = false;
        listBuf.push(line.replace(/^[-*]\\s*/, ''));
        i += 1;
        continue;
      }

      if (/^\\d+\\.\\s/.test(line)) {
        if (!listOrdered) { flush(); }
        listOrdered = true;
        listBuf.push(line.replace(/^\\d+\\.\\s*/, ''));
        i += 1;
        continue;
      }

      if (line.indexOf('|') === 0 && lines[i + 1] && lines[i + 1].indexOf('|') === 0) {
        flush();
        var headRow = line;
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf('|') === 0) { rows.push(lines[i]); i += 1; }
        var thead = '<tr>' + headRow.split('|').slice(1, -1).map(function (c) {
          return '<th scope="col">' + inline(c.trim()) + '</th>';
        }).join('') + '</tr>';
        var tbody = rows.map(function (r) {
          return '<tr>' + r.split('|').slice(1, -1).map(function (c) {
            return '<td>' + inline(c.trim()) + '</td>';
          }).join('') + '</tr>';
        }).join('');
        out.push('<table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>');
        continue;
      }

      if (!line.trim()) { flush(); i += 1; continue; }
      flush();
      out.push('<p>' + inline(line) + '</p>');
      i += 1;
    }
    flush();
    return out.join('');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
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
    return ok;
  }

  function wireCodeCopy(scope) {
    $$('[data-code-copy]', scope).forEach(function (btn) {
      if (btn.getAttribute('data-wired')) { return; }
      btn.setAttribute('data-wired', '1');
      btn.addEventListener('click', function () {
        var block = btn.closest('.code-block');
        var code = block ? $('code', block) : null;
        if (!code) { return; }
        copyText(code.textContent).then(function () {
          btn.textContent = 'Copied';
        }).catch(function () {
          btn.textContent = 'Press Ctrl+C';
        });
        window.setTimeout(function () { btn.textContent = 'Copy'; }, 1900);
      });
    });
  }

  /* ================= scripted replies ================= */
  var SQL_REPLY = "This matches the finance glossary definition, which excludes refunds and chargebacks:\\n\\n~~~sql\\nSELECT\\n  date_trunc('month', settled_at)       AS month,\\n  count(*) FILTER (WHERE status = 'failed') AS failed_count,\\n  count(*)                                  AS total_count,\\n  round(\\n    100.0 * count(*) FILTER (WHERE status = 'failed')\\n    / nullif(count(*), 0),\\n    2\\n  )                                          AS failure_rate_pct\\nFROM payments_v2\\nWHERE settled_at >= now() - interval '12 months'\\n  AND channel <> 'refund'\\nGROUP BY 1\\nORDER BY 1;\\n~~~\\n\\nTwo caveats before finance trusts it. settled_at is settlement time, not authorisation time, so a payment authorised on 31 January and settled on 1 February lands in February. And the table is partitioned by month, so this touches at most twelve partitions.";

  var SCRIPTS = [
    { keys: ['sso', 'single sign', 'okta'], reply: '**Platform Engineering** owns single sign-on end to end.\\n\\n- Okta configuration and the app catalogue: Platform Engineering\\n- Joiner and leaver workflow: IT Operations\\n- Access review sign-off: line managers, quarterly\\n\\nThe access policy (IT-POL-004, revised 14 January 2026) names Platform Engineering as accountable. Requests go through the it-requests channel with a two business day SLA.\\n\\nWorth flagging: Atlas can answer *who approved this exception* but not *whether the exception should exist*. The second is a judgement call the policy refuses to make for you.' },
    { keys: ['retention', 'keep data', 'how long', 'gdpr', 'erase', 'purge'], reply: '### Atlas data retention, as indexed today\\n| Data class | Retention | Basis |\\n|---|---|---|\\n| Source documents | Until you delete them | Customer instruction |\\n| Cached chunks | 15 minutes after a source edit | Technical necessity |\\n| Conversation logs | 90 days, then hard delete | Contract clause 7.2 |\\n| Backups | 35 days, rolling | Disaster recovery |\\n| Abuse-monitoring samples | None retained | Company policy |\\n\\nThe number people argue about is backups. We hold 35 days because that is how long a rolling restore takes to cycle. If your regulator requires a faster purge, the self-hosted build lets you set it to zero and accept that restore time goes to roughly four hours.' },
    { keys: ['incident', 'outage', 'postmortem', 'kestrel', 'downtime', 'review'], reply: '### Kestrel settlement incident, 12 February 2026\\n**Duration:** 3 hours 12 minutes, 14:05 to 17:17 CET.\\n\\n**What happened**\\nA stale DNS record routed settlement traffic to the previous Frankfurt pool. Writes failed closed, so nothing was lost, but 41,000 transactions queued.\\n\\n**Root cause**\\nThe record was changed by an emergency manual edit during the October upgrade and never reconciled against the config repository. This was a process failure, not an infrastructure one.\\n\\n**Outcome**\\nAll queued transactions settled by 19:40. No customer funds were misapplied. The 34 page review closes with four actions, three complete. The fourth, automated DNS reconciliation, lands in v4.13.' },
    { keys: ['residen', 'region', 'frankfurt', 'virginia', 'singapore', 'where is'], reply: 'Four regions are available: **Frankfurt**, **Dublin**, **Virginia** and **Singapore**. Feature parity is identical across all four.\\n\\nThe differences that matter are not technical:\\n\\n- Support hours: 07:00 to 20:00 local in each region\\n- Subprocessors: EU regions use 6, all EU-hosted; the US uses 9, two of which run inference outside US territory\\n- Legal entity: Atlas Europe Unipessoal, or Atlas US Inc\\n\\nIf counsel treats subprocessor location as material, choose an EU region. Everything else in the contract is identical.' },
    { keys: ['sql', 'query', 'database', 'select ', 'join ', 'failed payments'], reply: SQL_REPLY },
    { keys: ['soc 2', 'audit', 'iso', 'complian', 'evidence', 'control'], reply: 'Atlas can evidence **four of the five controls in scope** from a typical index.\\n\\n### Ready now\\n- **CC6.1** Logical access: Okta export plus quarterly review minutes\\n- **CC7.2** Monitoring: alert rules and 90 days of incident history\\n- **CC8.1** Change management: pull requests with reviewer metadata\\n- **CC9.2** Vendor risk: signed DPAs for every subprocessor\\n\\n### The gap\\n**CC4.1** supplier monitoring is rarely evidenced, because the assessments live in a spreadsheet outside the indexed sources. Point Atlas at that spreadsheet and the gap closes without anyone drafting a paragraph.' },
    { keys: ['price', 'cost', 'licen', 'how much', 'billing'], reply: 'Three ways to buy, and the middle one is almost always right.\\n\\n- **Per seat:** $12 per user per month. You pay for people who ask questions, not for questions.\\n- **Organisation-wide:** $2,400 per month up to 500 people, then $3,600. Usually cheaper from about 220 seats.\\n- **Self-hosted:** Enterprise contract, minimum $90,000 per year, includes the air-gapped build.\\n\\nThere is no per-question charge and no charge for unanswered queries. That is deliberate: we do not want an incentive to guess.' },
    { keys: ['dpa', 'contract', 'legal', 'clause', 'subprocessor'], reply: 'The standard position on training data is not negotiable, and it is already favourable to you.\\n\\n> Clause 9.1 states that no content from your index is used to train any model, ours or a vendor one, and that no subprocessor may do so either. Where you want contractual assurance rather than a representation, the useful offer is a narrowly scoped audit right over model-training data flows. Offer that. Do not offer a compliance certificate, because we do not hold one.\\n\\nAtlas provides the sub-processor list under NDA. The current list has 9 entries, 6 of them EU-hosted.' },
    { keys: ['onboard', 'laptop', 'imaging', 'new joiner', 'new starter'], reply: 'Laptop imaging is **IT Operations**, run book IT-RUN-011.\\n\\n- Standard image: shipped within two business days of the start date\\n- Engineering image with the toolchain: five business days, because that build is not fully automated\\n- Exceptions: security review required, average turnaround four days\\n\\nAtlas can answer questions about the run book and the exception criteria. It cannot tell you whether a specific machine passed, because that lives in the imaging tool rather than in the indexed sources.' },
    { keys: ['hello', 'hi ', 'hey', 'good morning', 'good afternoon', 'help'], reply: 'Hello. Atlas answers only from your indexed sources and cites every claim, so it will sometimes say it does not know rather than guessing.\\n\\nUseful first questions:\\n- Who owns single sign-on?\\n- What is our data retention policy?\\n- Summarise the Kestrel incident review\\n\\nIf Atlas cannot find something, it returns the nearest documents instead, which is usually more useful than a confident paragraph.' },
    { keys: ['thanks', 'thank you', 'cheers', 'export', 'document', 'markdown'], reply: 'Any time. If you need the answer as a document rather than a chat, ask for an export and Atlas returns Markdown with the citations inline:\\n\\n~~~markdown\\n> **Claim.** The claim as stated.\\n>\\n> Source: IT-POL-004, section 3, revised 14 January 2026\\n~~~\\n\\nThat shape pastes into Confluence without losing the citations, which is the main reason it exists.' }
  ];

  var FALLBACK = 'I cannot source an answer to that from the indexed material, so I am not going to invent one.\\n\\nThe three documents nearest to your question are:\\n\\n1. **IT-POL-004 Access and Identity Policy** - revised 14 January 2026. Closest on ownership and accountability, but it does not cover your specific case.\\n2. **SEC-ENG-011 Settlement Resilience Standard** - revised 3 December 2025. Covers the control, not the exception path.\\n3. **FIN-POL-002 Finance Data Definitions** - revised 22 August 2025. Definitional only.\\n\\nTwo things would fix this: either index the source that actually answers it, or ask a narrower question that one of the three above does answer.';

  function pickScript(text) {
    var t = String(text).toLowerCase();
    for (var i = 0; i < SCRIPTS.length; i++) {
      for (var j = 0; j < SCRIPTS[i].keys.length; j++) {
        if (t.indexOf(SCRIPTS[i].keys[j]) !== -1) { return SCRIPTS[i].reply; }
      }
    }
    return FALLBACK;
  }

  /* ================= conversations ================= */
  var THREADS = [
    { id: 't1', title: 'SOC 2 evidence for the Q1 audit', snippet: 'Four controls evidenced, one gap.', time: '14:22', unread: 2, messages: [
      { role: 'user', text: 'We need the evidence pack for the Q1 SOC 2 audit. Which controls can Atlas already evidence for us?' },
      { role: 'bot', text: 'Atlas can evidence **four of the five controls in scope** from the index you hold today. Here is the honest position.\\n\\n### Ready now\\n- **CC6.1** Logical access: Okta export plus quarterly review minutes, 6 documents\\n- **CC7.2** Monitoring: alert rules and 90 days of incident history\\n- **CC8.1** Change management: 1,842 approved pull requests with reviewer metadata\\n- **CC9.2** Vendor risk: signed DPAs for all 31 subprocessors\\n\\n### The gap\\n**CC4.1** supplier monitoring is not evidenced. Your index has the 2024 assessment and nothing from 2025, so Atlas will not answer a question about current supplier review status without guessing.\\n\\nUpload the 2025 cycle when you have it and the gap closes without anyone writing a paragraph by hand. The run book is in [FIN-POL-002](/policies/fin-002).' }
    ] },
    { id: 't2', title: 'Which team owns single sign-on?', snippet: 'Platform Engineering, per the access policy.', time: '13:58', unread: 1, messages: [
      { role: 'user', text: 'Who owns single sign-on? I have been bounced between three teams this week.' },
      { role: 'bot', text: '**Platform Engineering** owns single sign-on end to end.\\n\\n- Okta configuration and the app catalogue: Platform Engineering\\n- Joiner and leaver workflow: IT Operations\\n- Access review sign-off: line managers, on a quarterly schedule\\n\\nThe access policy, IT-POL-004, revised 14 January 2026, names Platform Engineering as accountable. Requests go through the it-requests channel with a two business day SLA.\\n\\nOne caveat: Atlas can tell you who approved an exception, but not whether the exception should exist. That is a judgement the policy deliberately refuses to make for you.' }
    ] },
    { id: 't3', title: 'Summarise the Kestrel incident review', snippet: 'Root cause was a stale DNS record.', time: '12:41', unread: 0, messages: [
      { role: 'user', text: 'Give me the short version of the Kestrel settlement incident from February.' },
      { role: 'bot', text: '### Kestrel settlement incident, 12 February 2026\\n**Duration:** 3 hours 12 minutes, 14:05 to 17:17 CET.\\n\\n**What happened**\\nA stale DNS record routed settlement traffic to the previous Frankfurt pool. Writes failed closed, so nothing was lost, but 41,000 transactions queued.\\n\\n**Root cause**\\nThe record was changed by an emergency manual edit during the October upgrade and never reconciled against the config repository.\\n\\n**Outcome**\\nAll queued transactions settled by 19:40 the same evening. No customer funds were misapplied. The review is 34 pages and closes with four actions, three of which are complete.' }
    ] },
    { id: 't4', title: 'Draft a reply to Halcyon on clause 9', snippet: 'Draft saved, one sentence softened.', time: 'Yesterday', unread: 0, messages: [
      { role: 'user', text: 'Draft a reply to Halcyon pushing back on clause 9.1 of the DPA.' },
      { role: 'bot', text: 'Here is a draft you can edit. I softened one sentence, because your standard position is stronger than the one I inferred from the last three agreements.\\n\\n> We understand and accept the concern raised on clause 9.1. Our position has not changed, and we would rather lose the clause than pretend it is negotiable. To be concrete about what it means in practice: no content from your index is used to train any model, ours or a vendor one, and we do not permit any subprocessor to do so either. This is written into our master agreement with every vendor on our list, which we will share under NDA.\\n\\nIf Halcyon needs a contractual verification mechanism rather than a representation, the cleanest route is an audit right limited to model-training data flows. Offer that. Do not offer a compliance certificate, because we do not hold one.\\n\\nWant it as a Markdown file you can drop into the tracker?' }
    ] },
    { id: 't5', title: 'Compare EU and US data residency', snippet: 'Same features, different subprocessors.', time: 'Tuesday', unread: 0, messages: [
      { role: 'user', text: 'What is the real difference between the EU and US regions beyond the legal entity?' },
      { role: 'bot', text: 'Less than people expect, and more in one place than you would guess.\\n\\n| | EU region | US region |\\n|---|---|---|\\n| Entity | Atlas Europe Unipessoal | Atlas US Inc |\\n| Support hours | 07:00 to 20:00 CET | 07:00 to 20:00 PT |\\n| Data residency | Frankfurt and Dublin | Virginia |\\n| Subprocessors | 6, all EU-hosted | 9, two outside the US |\\n| Model hosting | In-region | In-region |\\n\\nThe one real difference is **subprocessors**: two of the nine US subprocessors run inference outside US territory. If your counsel treats that as material, take the EU region. Everything else is identical.' }
    ] },
    { id: 't6', title: 'Remove personal data from logs', snippet: '90 days, then a hard delete.', time: 'Monday', unread: 0, messages: [
      { role: 'user', text: 'How do we remove personal data from Atlas logs?' },
      { role: 'bot', text: 'Two routes, depending on whether the data is in the index or in the audit log.\\n\\n- **Index content:** redaction runs at ingest, so a deleted source document never appears in a future answer. Existing cached chunks expire within 15 minutes.\\n- **Audit logs:** conversation logs retain the question, the citations and the model version for 90 days, then hard delete. There is no soft-delete tombstone.\\n\\nTo trigger it now, open Settings, then Data, then Run erasure, and enter the subject reference. Atlas confirms in writing once the queue position is known.' }
    ] },
    { id: 't7', title: 'SQL for monthly failed payments', snippet: 'Uses the payments_v2 table.', time: '28 Mar', unread: 0, messages: [
      { role: 'user', text: 'Write me a SQL query for failed payments by month.' },
      { role: 'bot', text: SQL_REPLY }
    ] }
  ];

  var threadList = $('#thread-list');
  var threadSearch = $('#thread-search');
  var threadCount = $('#thread-count');
  var unreadCount = $('#unread-count');
  var activeId = 't1';

  function totalUnread() {
    return THREADS.reduce(function (sum, t) { return sum + (t.unread || 0); }, 0);
  }

  function renderThreads() {
    if (!threadList) { return; }
    var term = threadSearch ? threadSearch.value.trim().toLowerCase() : '';
    threadList.innerHTML = '';
    var shown = 0;

    THREADS.forEach(function (t) {
      var hay = (t.title + ' ' + t.snippet).toLowerCase();
      if (term && hay.indexOf(term) === -1) { return; }
      shown += 1;
      var btn = make('button', 'thread-item');
      btn.type = 'button';
      if (t.id === activeId) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      if (t.unread) { btn.classList.add('is-unread'); }
      btn.setAttribute('aria-label', t.title + ', ' + t.time + ', ' + t.messages.length + ' messages' + (t.unread ? ', ' + t.unread + ' unread' : ''));

      var name = make('span', 'thread-name');
      name.textContent = t.title;
      var snip = make('span', 'thread-snip');
      snip.textContent = t.snippet;
      var time = make('span', 'thread-time');
      time.textContent = t.time;
      var badge = make('span', 'thread-badge');
      badge.textContent = String(t.unread || 0);
      if (!t.unread) { badge.hidden = true; }

      btn.appendChild(name);
      btn.appendChild(badge);
      btn.appendChild(snip);
      btn.appendChild(time);
      btn.addEventListener('click', function () { openThread(t.id); });
      threadList.appendChild(btn);
    });

    if (!shown) {
      var empty = make('p', 'thread-empty');
      empty.textContent = 'No conversation matches that search.';
      threadList.appendChild(empty);
    }
    if (threadCount) { threadCount.textContent = String(THREADS.length); }
    if (unreadCount) { unreadCount.textContent = String(totalUnread()); }
  }

  if (threadSearch) { threadSearch.addEventListener('input', renderThreads); }

  /* ================= icons ================= */
  var BOT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 5 6v6c0 4.4 2.9 7.6 7 8.6 4.1-1 7-4.2 7-8.6V6l-7-3Z"/><circle cx="12" cy="11" r="2"/><path d="M12 3v3"/></svg>';
  var ACT_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
  var ACT_REGEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>';
  var ACT_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m7 11 5-5 5 5M12 6v13"/></svg>';
  var ACT_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m7 13 5 5 5-5M12 18V5"/></svg>';

  var SOURCE_LIST = [
    ['IT-POL-004 Access and Identity Policy', 'section 3, revised 14 January 2026, owner Platform Engineering'],
    ['SEC-ENG-011 Settlement Resilience Standard', 'section 7, revised 3 December 2025, owner Security Engineering'],
    ['FIN-POL-002 Finance Data Definitions', 'appendix B, revised 22 August 2025, owner Finance']
  ];

  /* ================= chat plumbing ================= */
  var stream = $('#stream');
  var toBottom = $('#to-bottom');
  var composer = $('#composer');
  var input = $('#composer-input');
  var countEl = $('#composer-count');
  var sendBtn = $('#send-btn');
  var threadTitle = $('#thread-title');
  var chatMeta = $('#chat-meta');
  var busy = false;
  var typingEl = null;

  var DEPTHS = ['Fast', 'Medium', 'Exhaustive'];
  var depthIndex = 1;

  function scrollToEnd() {
    if (!stream) { return; }
    stream.scrollTop = stream.scrollHeight;
    if (toBottom) { toBottom.hidden = true; }
  }

  function scrollFollow() {
    if (!stream) { return; }
    if (stream.scrollHeight - stream.scrollTop - stream.clientHeight < 150) { scrollToEnd(); }
  }

  function setBusy(state) {
    busy = state;
    if (sendBtn) { sendBtn.disabled = state || !input || !input.value.trim(); }
    if (input) { input.setAttribute('aria-busy', state ? 'true' : 'false'); }
    $$('.chip[data-q]').forEach(function (c) { c.disabled = state; });
  }

  function buildMessage(role, text) {
    var msg = make('div', 'msg is-' + (role === 'user' ? 'user' : 'bot'));
    var av = make('div', 'msg-avatar');
    if (role === 'user') {
      av.textContent = 'SI';
      av.setAttribute('aria-hidden', 'true');
    } else {
      av.innerHTML = BOT_SVG;
    }
    var col = make('div', 'msg-col');
    var who = make('p', 'msg-who');
    who.textContent = role === 'user' ? 'You' : 'Atlas';
    var bubble = make('div', 'bubble');
    bubble.textContent = text;
    col.appendChild(who);
    col.appendChild(bubble);
    msg.appendChild(av);
    msg.appendChild(col);
    return { root: msg, bubble: bubble, col: col, actions: null, prompt: '', raw: '' };
  }

  function appendSources(entry) {
    if (entry.hasSources) { return; }
    entry.hasSources = true;
    var details = make('details', 'sources');
    var summary = document.createElement('summary');
    summary.textContent = SOURCE_LIST.length + ' sources';
    details.appendChild(summary);
    var ol = document.createElement('ol');
    SOURCE_LIST.forEach(function (pair) {
      var li = document.createElement('li');
      li.textContent = pair[0];
      var meta = make('span', 'source-meta');
      meta.textContent = pair[1];
      li.appendChild(meta);
      ol.appendChild(li);
    });
    details.appendChild(ol);
    entry.col.insertBefore(details, entry.actions || null);
  }

  function attachActions(entry, role) {
    if (entry.actions) { return; }
    var row = make('div', 'msg-actions');

    var copy = make('button', 'act');
    copy.type = 'button';
    copy.innerHTML = ACT_COPY + '<span>Copy</span>';
    copy.setAttribute('aria-label', 'Copy this ' + (role === 'user' ? 'message' : 'answer'));
    copy.addEventListener('click', function () {
      var label = copy.querySelector('span');
      copyText(entry.bubble.textContent);
      if (label) { label.textContent = 'Copied'; }
      copy.classList.add('is-on');
      window.setTimeout(function () {
        if (label) { label.textContent = 'Copy'; }
        copy.classList.remove('is-on');
      }, 1800);
    });
    row.appendChild(copy);

    if (role === 'bot') {
      var regen = make('button', 'act');
      regen.type = 'button';
      regen.innerHTML = ACT_REGEN + '<span>Regenerate</span>';
      regen.setAttribute('aria-label', 'Regenerate this answer');
      regen.addEventListener('click', function () {
        if (busy || !entry.prompt) { return; }
        setBusy(true);
        regen.disabled = true;
        var label = regen.querySelector('span');
        if (label) { label.textContent = 'Regenerating'; }
        window.setTimeout(function () {
          streamInto(entry.prompt, entry);
        }, 380);
      });
      row.appendChild(regen);

      var up = make('button', 'act');
      up.type = 'button';
      up.innerHTML = ACT_UP + '<span>Helpful</span>';
      up.setAttribute('aria-label', 'Mark this answer as helpful');
      var down = make('button', 'act is-down');
      down.type = 'button';
      down.innerHTML = ACT_DOWN + '<span>Not right</span>';
      down.setAttribute('aria-label', 'Mark this answer as not right');
      up.addEventListener('click', function () {
        up.classList.toggle('is-on');
        if (up.classList.contains('is-on')) { down.classList.remove('is-on'); }
      });
      down.addEventListener('click', function () {
        down.classList.toggle('is-on');
        if (down.classList.contains('is-on')) { up.classList.remove('is-on'); }
      });
      row.appendChild(up);
      row.appendChild(down);
    }

    entry.col.appendChild(row);
    entry.actions = row;
  }

  /* ================= typing + streaming ================= */
  function showTyping() {
    if (!stream || typingEl) { return; }
    var msg = make('div', 'msg is-bot');
    var av = make('div', 'msg-avatar');
    av.innerHTML = BOT_SVG;
    var col = make('div', 'msg-col');
    var who = make('p', 'msg-who');
    who.textContent = 'Atlas';
    var bubble = make('div', 'bubble');
    bubble.innerHTML = '<div class="typing"><span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="typing-label">Atlas is thinking</span></div><div class="typing-bar" aria-hidden="true"><span></span></div>';
    col.appendChild(who);
    col.appendChild(bubble);
    msg.appendChild(av);
    msg.appendChild(col);
    stream.appendChild(msg);
    typingEl = msg;
    scrollFollow();
  }

  function hideTyping() {
    if (typingEl && typingEl.parentNode) { typingEl.parentNode.removeChild(typingEl); }
    typingEl = null;
  }

  function streamInto(prompt, entry) {
    var reply = pickScript(prompt);
    entry.prompt = prompt;
    entry.raw = reply;
    showTyping();

    window.setTimeout(function () {
      hideTyping();
      var tokens = reply.split(/(\\s+)/);
      var idx = 0;
      var perTick = reduce ? tokens.length : 3;

      function tick() {
        idx = Math.min(tokens.length, idx + perTick);
        entry.bubble.innerHTML = renderMarkdown(tokens.slice(0, idx).join(''), { buttons: false }) + '<span class="stream-caret" aria-hidden="true"></span>';
        scrollFollow();
        if (idx < tokens.length) {
          window.setTimeout(tick, 16);
        } else {
          finish();
        }
      }

      function finish() {
        entry.bubble.innerHTML = renderMarkdown(reply, { buttons: true });
        wireCodeCopy(entry.bubble);
        if (reply.indexOf('](') !== -1) { appendSources(entry); }
        attachActions(entry, 'bot');
        if (entry.regenBtn) { entry.regenBtn.disabled = false; var l = entry.regenBtn.querySelector('span'); if (l) { l.textContent = 'Regenerate'; } }
        scrollToEnd();
        setBusy(false);
        syncComposer();
      }

      tick();
    }, reduce ? 120 : 900);
  }

  /* ================= sending ================= */
  function syncComposer() {
    if (!input) { return; }
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 168) + 'px';
    var len = input.value.length;
    if (countEl) {
      countEl.textContent = len + ' / 1200';
      countEl.className = 'char-count';
      if (len >= 1200) { countEl.classList.add('is-full'); }
      else if (len > 1000) { countEl.classList.add('is-near'); }
    }
    if (sendBtn) { sendBtn.disabled = busy || !input.value.trim(); }
  }

  function send(text) {
    var thread = THREADS.filter(function (t) { return t.id === activeId; })[0];

    var userEntry = buildMessage('user', text);
    stream.appendChild(userEntry.root);
    attachActions(userEntry, 'user');

    var botEntry = buildMessage('bot', '');
    stream.appendChild(botEntry.root);

    scrollToEnd();
    setBusy(true);
    streamInto(text, botEntry);

    if (thread) {
      thread.messages.push({ role: 'user', text: text });
      thread.messages.push({ role: 'bot', text: pickScript(text) });
      thread.snippet = text;
      thread.time = 'Now';
    }
    if (chatMeta && thread) {
      chatMeta.textContent = thread.messages.length + ' messages \\u00b7 Atlas reasoning, ' + DEPTHS[depthIndex].toLowerCase();
    }
    renderThreads();
  }

  function doSend() {
    if (!input || busy) { return; }
    var text = input.value.trim();
    if (!text) { return; }
    input.value = '';
    syncComposer();
    send(text);
  }

  if (input) {
    input.addEventListener('input', syncComposer);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
  }
  if (composer) {
    composer.addEventListener('submit', function (e) { e.preventDefault(); doSend(); });
  }

  $$('.chip[data-q]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (busy || !input) { return; }
      input.value = chip.getAttribute('data-q');
      syncComposer();
      input.focus();
    });
  });

  var attachBtn = $('#attach-btn');
  if (attachBtn) {
    attachBtn.addEventListener('click', function () {
      attachBtn.setAttribute('aria-label', 'Attachments are not available in this demo');
      window.setTimeout(function () { attachBtn.setAttribute('aria-label', 'Attach a source'); }, 2400);
    });
  }

  /* ================= thread switching ================= */
  function paintMeta(thread) {
    if (!chatMeta || !thread) { return; }
    chatMeta.textContent = thread.messages.length + ' messages \\u00b7 Atlas reasoning, ' + DEPTHS[depthIndex].toLowerCase();
  }

  function openThread(id) {
    var thread = THREADS.filter(function (t) { return t.id === id; })[0];
    if (!thread || !stream) { return; }
    activeId = id;
    thread.unread = 0;
    if (threadTitle) { threadTitle.textContent = thread.title; }
    if (typingEl) { hideTyping(); }
    stream.innerHTML = '';

    thread.messages.forEach(function (m) {
      var entry = buildMessage(m.role, '');
      entry.prompt = m.role === 'user' ? m.text : '';
      entry.raw = m.text;
      stream.appendChild(entry.root);
      if (m.role === 'user') {
        entry.bubble.textContent = m.text;
        attachActions(entry, 'user');
      } else {
        entry.bubble.innerHTML = renderMarkdown(m.text, { buttons: true });
        wireCodeCopy(entry.bubble);
        if (m.text.indexOf('](') !== -1) { appendSources(entry); }
        attachActions(entry, 'bot');
      }
    });

    paintMeta(thread);
    renderThreads();
    setList(false);
    setBusy(false);
    scrollToEnd();
    if (input) { input.focus(); }
  }

  var newChat = $('#new-chat');
  if (newChat) {
    newChat.addEventListener('click', function () {
      var id = 't' + (Date.now() % 100000);
      THREADS.unshift({
        id: id,
        title: 'New conversation',
        snippet: 'No messages yet.',
        time: 'Now',
        unread: 0,
        messages: []
      });
      openThread(id);
      if (input) { input.focus(); }
    });
  }

  var depthBtn = $('#depth-btn');
  var depthLabel = $('#depth-label');
  if (depthBtn && depthLabel) {
    depthBtn.addEventListener('click', function () {
      depthIndex = (depthIndex + 1) % DEPTHS.length;
      depthLabel.textContent = DEPTHS[depthIndex];
      depthBtn.setAttribute('aria-label', 'Change reasoning depth, currently ' + DEPTHS[depthIndex].toLowerCase());
      var thread = THREADS.filter(function (t) { return t.id === activeId; })[0];
      paintMeta(thread);
    });
  }

  var clearBtn = $('#clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      var thread = THREADS.filter(function (t) { return t.id === activeId; })[0];
      if (!thread || !stream) { return; }
      thread.messages = [];
      thread.snippet = 'No messages yet.';
      stream.innerHTML = '';
      var hint = buildMessage('bot', 'Conversation cleared. Ask me something and I will cite the source.');
      hint.bubble.innerHTML = renderMarkdown(hint.bubble.textContent, { buttons: false });
      stream.appendChild(hint.root);
      paintMeta(thread);
      renderThreads();
      setBusy(false);
      scrollToEnd();
    });
  }

  /* ================= scroll FAB ================= */
  if (stream && toBottom) {
    stream.addEventListener('scroll', function () {
      var distance = stream.scrollHeight - stream.scrollTop - stream.clientHeight;
      toBottom.hidden = distance < 150;
    });
    toBottom.addEventListener('click', function () { scrollToEnd(); });
  }

  /* ================= animated counters ================= */
  function withCommas(n) {
    return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  }

  function paintCounter(el) {
    var target = parseFloat(el.getAttribute('data-count') || '0');
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var s = Number(target).toFixed(d);
    var parts = s.split('.');
    el.textContent = withCommas(parts[0]) + (parts[1] ? '.' + parts[1] : '');
  }

  var counters = $$('.counter');
  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(paintCounter);
  } else {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count') || '0');
        var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var t0 = null;
        var dur = 1400;
        function step(ts) {
          if (t0 === null) { t0 = ts; }
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var s = Number(target * eased).toFixed(d);
          var parts = s.split('.');
          el.textContent = withCommas(parts[0]) + (parts[1] ? '.' + parts[1] : '');
          if (p < 1) { window.requestAnimationFrame(step); }
          else { paintCounter(el); }
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ================= escape closes overlays ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    setUserMenu(false);
    setList(false);
    var open = null;
    accTriggers.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') { open = btn; }
    });
    if (open) { closeAcc(open); open.focus(); }
  });

  /* ================= faq accordion ================= */
  var accTriggers = $$('.acc-trigger');

  function closeAcc(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'false');
    if (panel) { panel.hidden = true; }
    var item = btn.closest ? btn.closest('.acc') : null;
    if (item) { item.classList.remove('is-open'); }
  }

  accTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      accTriggers.forEach(closeAcc);
      if (!wasOpen) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', 'true');
        if (panel) { panel.hidden = false; }
        var item = btn.closest ? btn.closest('.acc') : null;
        if (item) { item.classList.add('is-open'); }
      }
    });
  });

  /* ================= footer ================= */
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
      footerStatus.textContent = 'Subscribed. The next digest goes out on 3 April 2026.';
      footerStatus.className = 'news-status is-ok';
      footerForm.reset();
    });
  }

  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ================= boot ================= */
  renderThreads();
  openThread('t1');
  syncComposer();
}());
`,
};