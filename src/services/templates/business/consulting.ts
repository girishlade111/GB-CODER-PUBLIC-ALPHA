/**
 * business-consulting — "Financial Consulting"
 * Enterprise advisory firm: deep navy with a single gold accent.
 * Ticker-strip hero, six services, four-step process, case-study counters,
 * team, insights index with filters, FAQ, CTA band and a validated contact form.
 */
export default {
  html: `
<a class="skip-link" href="#main">Skip to content</a>
<div class="readbar" role="presentation"><span class="readbar__fill" id="readFill"></span></div>

<header class="hdr" id="hdr">
  <div class="shell hdr__in">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V9M12 21V4M19 21v-8"/></svg></span>
      <span class="brand__name">Haldane<em>&amp; Vale</em></span>
    </a>
    <nav class="nav" id="primaryNav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="nav__link" href="#services" data-spy="services">Advisory</a></li>
        <li><a class="nav__link" href="#process" data-spy="process">Approach</a></li>
        <li><a class="nav__link" href="#cases" data-spy="cases">Results</a></li>
        <li><a class="nav__link" href="#team" data-spy="team">Partners</a></li>
        <li><a class="nav__link" href="#insights" data-spy="insights">Insights</a></li>
        <li><a class="nav__link" href="#faq" data-spy="faq">FAQ</a></li>
      </ul>
    </nav>
    <div class="hdr__actions">
      <a class="btn btn--gold btn--sm hdr__cta" href="#contact">Book a consultation</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__open" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon burger__close" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="main">
  <section class="hero" id="top" aria-labelledby="heroTitle">
    <div class="shell hero__in">
      <div class="hero__copy" data-reveal>
        <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>Chartered advisory since 1998</p>
        <h1 class="hero__title" id="heroTitle">Capital discipline for companies that intend to last.</h1>
        <p class="hero__lede">Haldane &amp; Vale advises boards on treasury, tax structuring and capital allocation. We do not manage your money and we do not sell products. We are paid to be right, which is a different business entirely.</p>
        <div class="hero__actions">
          <a class="btn btn--gold" href="#contact">
            Request a consultation
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
          <a class="btn btn--outline" href="#cases">Read the case studies</a>
        </div>
        <ul class="creds" data-reveal style="--delay:.1s">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg> FCA authorised &amp; regulated</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18"/></svg> 27 years in practice</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> 340+ engagements</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg> Partner-led, always</li>
        </ul>
      </div>

      <aside class="desk" data-reveal style="--delay:.12s" aria-labelledby="deskTitle">
        <div class="desk__head">
          <div>
            <p class="desk__label">Desk snapshot</p>
            <p class="desk__id" id="deskTitle">Model portfolio HV-Reference</p>
          </div>
          <span class="live"><span class="live__dot" aria-hidden="true"></span>Live</span>
        </div>
        <ul class="quotes">
          <li class="quote-row">
            <div class="quote-row__l"><strong>HV Treasury Core</strong><span>GBP &middot; daily liquidity</span></div>
            <svg class="spark" viewBox="0 0 90 30" aria-hidden="true" preserveAspectRatio="none"><polyline points="0,22 10,20 20,24 30,16 40,18 50,11 60,14 70,7 80,10 90,4"/></svg>
            <div class="quote-row__r"><strong>101.84</strong><span class="up">+1.42%</span></div>
          </li>
          <li class="quote-row">
            <div class="quote-row__l"><strong>EUR Hedged Credit</strong><span>EUR &middot; 3&ndash;7yr</span></div>
            <svg class="spark" viewBox="0 0 90 30" aria-hidden="true" preserveAspectRatio="none"><polyline points="0,14 10,16 20,12 30,19 40,17 50,20 60,15 70,18 80,12 90,9"/></svg>
            <div class="quote-row__r"><strong>98.17</strong><span class="up">+0.86%</span></div>
          </li>
          <li class="quote-row">
            <div class="quote-row__l"><strong>Real Assets Basket</strong><span>USD &middot; infra &amp; energy</span></div>
            <svg class="spark" viewBox="0 0 90 30" aria-hidden="true" preserveAspectRatio="none"><polyline points="0,20 10,17 20,19 30,13 40,15 50,10 60,12 70,6 80,9 90,7"/></svg>
            <div class="quote-row__r"><strong>104.02</strong><span class="up">+0.61%</span></div>
          </li>
          <li class="quote-row">
            <div class="quote-row__l"><strong>Short Duration GBP</strong><span>GBP &middot; up to 12m</span></div>
            <svg class="spark spark--down" viewBox="0 0 90 30" aria-hidden="true" preserveAspectRatio="none"><polyline points="0,8 10,11 20,9 30,15 40,13 50,18 60,16 70,21 80,19 90,24"/></svg>
            <div class="quote-row__r"><strong>97.35</strong><span class="down">-0.18%</span></div>
          </li>
        </ul>
        <p class="desk__foot">Indicative reference allocations used in client modelling. Not an offer, and not investment advice.</p>
      </aside>
    </div>
  </section>

  <div class="ticker" aria-label="Market indicators, illustrative">
    <div class="ticker__row">
      <div class="ticker__half">
        <span class="tk"><b>GBP/USD</b><i>1.2841</i><em class="up">+0.18%</em></span>
        <span class="tk"><b>EUR/GBP</b><i>0.8612</i><em class="up">+0.07%</em></span>
        <span class="tk"><b>UK 10yr</b><i>3.914%</i><em class="down">-4bp</em></span>
        <span class="tk"><b>SONIA</b><i>4.186%</i><em class="down">-2bp</em></span>
        <span class="tk"><b>Brent</b><i>78.42</i><em class="up">+1.12%</em></span>
        <span class="tk"><b>S&amp;P 500</b><i>5,842.6</i><em class="up">+0.44%</em></span>
        <span class="tk"><b>FTSE 100</b><i>8,196.3</i><em class="down">-0.11%</em></span>
        <span class="tk"><b>Inflation</b><i>2.6%</i><em class="down">-0.2pp</em></span>
      </div>
      <div class="ticker__half" aria-hidden="true">
        <span class="tk"><b>GBP/USD</b><i>1.2841</i><em class="up">+0.18%</em></span>
        <span class="tk"><b>EUR/GBP</b><i>0.8612</i><em class="up">+0.07%</em></span>
        <span class="tk"><b>UK 10yr</b><i>3.914%</i><em class="down">-4bp</em></span>
        <span class="tk"><b>SONIA</b><i>4.186%</i><em class="down">-2bp</em></span>
        <span class="tk"><b>Brent</b><i>78.42</i><em class="up">+1.12%</em></span>
        <span class="tk"><b>S&amp;P 500</b><i>5,842.6</i><em class="up">+0.44%</em></span>
        <span class="tk"><b>FTSE 100</b><i>8,196.3</i><em class="down">-0.11%</em></span>
        <span class="tk"><b>Inflation</b><i>2.6%</i><em class="down">-0.2pp</em></span>
      </div>
    </div>
  </div>

  <section class="section" id="services" aria-labelledby="servicesTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>Advisory lines</p>
          <h2 class="head__title" id="servicesTitle">Six mandates, one partner each</h2>
        </div>
        <p class="head__note">Every mandate is led by a named partner who stays on the file from the first diagnostic call to the final board paper. We do not staff engagements with analysts we have not met.</p>
      </header>
      <ul class="services">
        <li class="svc" data-reveal>
          <span class="svc__no">01</span>
          <h3 class="svc__title">Treasury &amp; liquidity</h3>
          <p class="svc__copy">Cash visibility across every entity and currency, a 13-week forecast that survives contact with reality, and a banking panel renegotiated on your behalf.</p>
          <ul class="svc__pts"><li>13-week cash model</li><li>Banking panel review</li><li>Hedging policy</li></ul>
        </li>
        <li class="svc" data-reveal style="--delay:.06s">
          <span class="svc__no">02</span>
          <h3 class="svc__title">Tax structuring</h3>
          <p class="svc__copy">Group structure, transfer pricing and R&amp;D claims, drafted with your tax team rather than around them. Nothing leaves without a plain-English summary.</p>
          <ul class="svc__pts"><li>Group reorganisation</li><li>Transfer pricing</li><li>R&amp;D relief claims</li></ul>
        </li>
        <li class="svc" data-reveal style="--delay:.12s">
          <span class="svc__no">03</span>
          <h3 class="svc__title">Capital allocation</h3>
          <p class="svc__copy">A single investment policy, hurdle rates that match your cost of capital, and a board pack that answers the question before it is asked.</p>
          <ul class="svc__pts"><li>Investment policy</li><li>Capital budgeting</li><li>Board reporting</li></ul>
        </li>
        <li class="svc" data-reveal style="--delay:.18s">
          <span class="svc__no">04</span>
          <h3 class="svc__title">Financing &amp; debt</h3>
          <p class="svc__copy">Lender negotiation, covenant design, and the unglamorous work of making sure a refinancing does not arrive as a surprise in your fourth quarter.</p>
          <ul class="svc__pts"><li>Debt stack design</li><li>Covenant testing</li><li>Refinancing</li></ul>
        </li>
        <li class="svc" data-reveal style="--delay:.24s">
          <span class="svc__no">05</span>
          <h3 class="svc__title">Risk &amp; controls</h3>
          <p class="svc__copy">Scenario modelling across rate, FX and volume shocks, plus the control framework that lets your board sign anything with a number attached.</p>
          <ul class="svc__pts"><li>Scenario modelling</li><li>Control frameworks</li><li>Insurance review</li></ul>
        </li>
        <li class="svc" data-reveal style="--delay:.3s">
          <span class="svc__no">06</span>
          <h3 class="svc__title">Transactions &amp; exits</h3>
          <p class="svc__copy">Due diligence support on the buy side and sell side, quality of earnings defence, and a clean handover to whoever comes next.</p>
          <ul class="svc__pts"><li>Financial diligence</li><li>QoE defence</li><li>Exit readiness</li></ul>
        </li>
      </ul>
    </div>
  </section>

  <section class="section section--tint" id="process" aria-labelledby="processTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>How we work</p>
          <h2 class="head__title" id="processTitle">Four steps, no discovery phase</h2>
        </div>
        <p class="head__note">Diagnostic, design, implementation, handover. The first three run in parallel wherever the data allows, and step one is free.</p>
      </header>
      <div class="process" id="processLine">
        <span class="process__line" aria-hidden="true"></span>
        <ol class="process__list">
        <li class="step" data-reveal>
          <span class="step__mark" aria-hidden="true"><span class="step__dot"></span></span>
          <span class="step__no">Step 01 &middot; Weeks 1&ndash;2</span>
          <h3 class="step__title">Diagnostic</h3>
          <p class="step__copy">Two weeks inside your data. We reconcile management accounts to the ledger, stress the last three years, and hand you a written list of the eight things costing you the most.</p>
        </li>
        <li class="step" data-reveal style="--delay:.08s">
          <span class="step__mark" aria-hidden="true"><span class="step__dot"></span></span>
          <span class="step__no">Step 02 &middot; Weeks 3&ndash;5</span>
          <h3 class="step__title">Design</h3>
          <p class="step__copy">Options with numbers attached, ranked by effort against return. You get a recommendation, not a menu, and the reasoning behind it in writing.</p>
        </li>
        <li class="step" data-reveal style="--delay:.16s">
          <span class="step__mark" aria-hidden="true"><span class="step__dot"></span></span>
          <span class="step__no">Step 03 &middot; Weeks 6&ndash;16</span>
          <h3 class="step__title">Implementation</h3>
          <p class="step__copy">We sit with your team rather than sending a report. Treasury policy gets rewritten, covenant packages get negotiated, and the board pack gets rebuilt around it.</p>
        </li>
        <li class="step" data-reveal style="--delay:.24s">
          <span class="step__mark" aria-hidden="true"><span class="step__dot"></span></span>
          <span class="step__no">Step 04 &middot; Week 17 onward</span>
          <h3 class="step__title">Handover</h3>
          <p class="step__copy">Templates, models and a quarterly health check for two years. Roughly a third of clients keep us on a light retainer; the rest take it in-house successfully.</p>
        </li>
        </ol>
      </div>
    </div>
  </section>

  <section class="section" id="cases" aria-labelledby="casesTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>Selected results</p>
          <h2 class="head__title" id="casesTitle">Three files we can talk about</h2>
        </div>
        <p class="head__note">Names are changed at client request. The numbers are not, because they are the whole point of the exercise.</p>
      </header>

      <ul class="cases">
        <li class="case" data-reveal>
          <div class="case__top">
            <p class="case__sector">Industrial &middot; 9 sites &middot; Manchester</p>
            <h3 class="case__title">A manufacturer stopped funding itself with overdrafts</h3>
          </div>
          <p class="case__copy">Eleven bank accounts across three currencies, no consolidated cash view, and a finance director spending Sundays reconciling spreadsheets. We rebuilt the treasury model in six weeks and consolidated the banking panel from nine providers to four.</p>
          <ul class="case__stats">
            <li><span class="case__v" data-count="11" data-prefix="&pound;" data-suffix="k">0</span><span class="case__l">Cash released</span></li>
            <li><span class="case__v" data-count="5" data-suffix="">0</span><span class="case__l">Bank accounts closed</span></li>
            <li><span class="case__v" data-count="41" data-prefix="" data-suffix="%">0</span><span class="case__l">Forecast accuracy</span></li>
          </ul>
          <p class="case__scope"><span>Scope</span> Treasury &middot; 14 weeks</p>
        </li>
        <li class="case" data-reveal style="--delay:.08s">
          <div class="case__top">
            <p class="case__sector">Software &middot; Series B &middot; Dublin</p>
            <h3 class="case__title">A scale-up found 3.1 million pounds of R&amp;D relief</h3>
          </div>
          <p class="case__copy">Four years of claims never filed, a share option scheme that had drifted out of compliance, and an EU entity structure that cost more than it saved. We worked alongside their tax team for seven months and cleaned all three up.</p>
          <ul class="case__stats">
            <li><span class="case__v" data-count="3.1" data-decimals="1" data-prefix="&pound;" data-suffix="m">0</span><span class="case__l">Relief recovered</span></li>
            <li><span class="case__v" data-count="4" data-suffix="">0</span><span class="case__l">Years assessed</span></li>
            <li><span class="case__v" data-count="0" data-suffix="">0</span><span class="case__l">Enquiries received</span></li>
          </ul>
          <p class="case__scope"><span>Scope</span> Tax structuring &middot; 7 months</p>
        </li>
        <li class="case" data-reveal style="--delay:.16s">
          <div class="case__top">
            <p class="case__sector">Logistics &middot; Private &middot; Rotterdam</p>
            <h3 class="case__title">A family-owned group bought itself time</h3>
          </div>
          <p class="case__copy">Refinancing due inside nine months with the market closed. We built an eighteen-month runway on cost reduction alone, then negotiated a covenant reset once conditions improved. The sale completed on the original timetable.</p>
          <ul class="case__stats">
            <li><span class="case__v" data-count="18" data-suffix="">0</span><span class="case__l">Months of runway added</span></li>
            <li><span class="case__v" data-count="9.4" data-decimals="1" data-prefix="&pound;" data-suffix="m">0</span><span class="case__l">Debt restructured</span></li>
            <li><span class="case__v" data-count="100" data-suffix="%">0</span><span class="case__l">On original timetable</span></li>
          </ul>
          <p class="case__scope"><span>Scope</span> Financing &middot; 11 months</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="section section--tint" id="team" aria-labelledby="teamTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>The partners</p>
          <h2 class="head__title" id="teamTitle">Who actually does the work</h2>
        </div>
        <p class="head__note">Four partners, forty-one staff, one office in the City. The partner on your first call is the partner on your last board paper.</p>
      </header>
      <ul class="team">
        <li class="person" data-reveal>
          <span class="face face--1" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><circle cx="32" cy="25" r="11" fill="currentColor" opacity=".9"/><path d="M10 60a22 22 0 0 1 44 0Z" fill="currentColor" opacity=".55"/><path d="M20 21c4-6 20-6 24 0-3-5-8-7-12-7s-9 2-12 7Z" fill="currentColor" opacity=".3"/></svg>
          </span>
          <h3 class="person__name">Adrian Haldane</h3>
          <p class="person__role">Founding partner &middot; Treasury</p>
          <p class="person__bio">Twenty-nine years in corporate treasury, previously group treasurer at a FTSE 250 logistics group. Writes the cash flow models himself.</p>
          <ul class="person__certs"><li>FRIC</li><li>CIMA</li></ul>
        </li>
        <li class="person" data-reveal style="--delay:.07s">
          <span class="face face--2" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><circle cx="32" cy="26" r="10" fill="currentColor" opacity=".9"/><path d="M12 60a20 20 0 0 1 40 0Z" fill="currentColor" opacity=".55"/><path d="M14 44c6-3 30-3 36 0v16H14Z" fill="currentColor" opacity=".28"/></svg>
          </span>
          <h3 class="person__name">Priya Raghunathan</h3>
          <p class="person__role">Partner &middot; Tax</p>
          <p class="person__bio">Qualified chartered accountant and former Big Four transfer pricing lead. Has argued more than forty R&amp;D claims, nineteen successfully.</p>
          <ul class="person__certs"><li>ACA</li><li>CTA</li></ul>
        </li>
        <li class="person" data-reveal style="--delay:.14s">
          <span class="face face--3" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><circle cx="32" cy="24" r="11" fill="currentColor" opacity=".9"/><path d="M8 60a24 24 0 0 1 48 0Z" fill="currentColor" opacity=".55"/><path d="M22 22h20v3H22z" fill="currentColor" opacity=".35"/><path d="M26 14c3-4 9-4 12 0-4-2-8-2-12 0Z" fill="currentColor" opacity=".35"/></svg>
          </span>
          <h3 class="person__name">Marcus Bell</h3>
          <p class="person__role">Partner &middot; Financing</p>
          <p class="person__bio">Spent fifteen years on the lending side before switching to the borrower. Has negotiated eleven covenant resets and none of his clients defaulted.</p>
          <ul class="person__certs"><li>FCA</li><li>M&A</li></ul>
        </li>
        <li class="person" data-reveal style="--delay:.21s">
          <span class="face face--4" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><circle cx="32" cy="26" r="10" fill="currentColor" opacity=".9"/><path d="M13 60a19 19 0 0 1 38 0Z" fill="currentColor" opacity=".55"/><path d="M20 44c4-4 20-4 24 0" stroke="currentColor" stroke-width="2" opacity=".4" fill="none"/></svg>
          </span>
          <h3 class="person__name">Elena Vasquez</h3>
          <p class="person__role">Partner &middot; Risk &amp; controls</p>
          <p class="person__bio">Built the scenario models used in three national planning appeals. Believes a risk register nobody reads is worse than no risk register.</p>
          <ul class="person__certs"><li>CIA</li><li>FRM</li></ul>
        </li>
      </ul>
    </div>
  </section>

  <section class="section" id="insights" aria-labelledby="insightsTitle" data-spy-section>
    <div class="shell">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>Insights</p>
          <h2 class="head__title" id="insightsTitle">Notes from the desk</h2>
        </div>
        <p class="head__note">Written for directors rather than analysts. No gated PDFs, no email capture, no forecasts we would not put our own name to.</p>
      </header>

      <div class="filters" data-reveal style="--delay:.06s">
        <div class="chips" id="insightChips" role="group" aria-label="Filter notes by desk">
          <button class="chip is-on" type="button" data-cat="all" aria-pressed="true">All desks</button>
          <button class="chip" type="button" data-cat="treasury" aria-pressed="false">Treasury</button>
          <button class="chip" type="button" data-cat="tax" aria-pressed="false">Tax</button>
          <button class="chip" type="button" data-cat="debt" aria-pressed="false">Debt</button>
          <button class="chip" type="button" data-cat="risk" aria-pressed="false">Risk</button>
        </div>
        <p class="filters__status" id="insightStatus" role="status" aria-live="polite"></p>
      </div>

      <ul class="insights" id="insightList">
        <li class="note" data-reveal data-cat="treasury">
          <div class="note__meta"><span class="note__desk">Treasury</span><time datetime="2026-03-11">11 Mar 2026</time><span class="note__read">9 min</span></div>
          <h3 class="note__title"><a href="#insights">Why your 13-week forecast keeps missing, and the one column that causes it</a></h3>
          <p class="note__excerpt">Nine out of ten forecasts we inherit fail in the same place: a single unmodelled receipt. Fixing it takes an afternoon and changes everything downstream.</p>
          <span class="note__by">Adrian Haldane</span>
        </li>
        <li class="note" data-reveal style="--delay:.05s" data-cat="tax">
          <div class="note__meta"><span class="note__desk">Tax</span><time datetime="2026-02-24">24 Feb 2026</time><span class="note__read">12 min</span></div>
          <h3 class="note__title"><a href="#insights">R&amp;D relief in 2026: three changes that will cost you money if you wait</a></h3>
          <p class="note__excerpt">The merged scheme has settled, but the indirect expenditure cap has not. Here is what a software company with 70% qualifying spend should claim this year.</p>
          <span class="note__by">Priya Raghunathan</span>
        </li>
        <li class="note" data-reveal style="--delay:.1s" data-cat="debt">
          <div class="note__meta"><span class="note__desk">Debt</span><time datetime="2026-02-02">2 Feb 2026</time><span class="note__read">7 min</span></div>
          <h3 class="note__title"><a href="#insights">Covenant headroom is a management report, not a legal term</a></h3>
          <p class="note__excerpt">Most finance directors find out how much headroom they have in the same week their lender does. A monthly model costs nothing and changes the conversation entirely.</p>
          <span class="note__by">Marcus Bell</span>
        </li>
        <li class="note" data-reveal style="--delay:.15s" data-cat="risk">
          <div class="note__meta"><span class="note__desk">Risk</span><time datetime="2026-01-15">15 Jan 2026</time><span class="note__read">11 min</span></div>
          <h3 class="note__title"><a href="#insights">A rate shock model that does not require a data scientist</a></h3>
          <p class="note__excerpt">Three scenarios, four variables, one spreadsheet. We have used this exact model in 180 engagements and it still surprises us when it gets used properly.</p>
          <span class="note__by">Elena Vasquez</span>
        </li>
        <li class="note" data-reveal style="--delay:.2s" data-cat="treasury">
          <div class="note__meta"><span class="note__desk">Treasury</span><time datetime="2025-12-04">4 Dec 2025</time><span class="note__read">6 min</span></div>
          <h3 class="note__title"><a href="#insights">The banking panel review we run every eighteen months, line by line</a></h3>
          <p class="note__excerpt">Nine providers became four and saved a mid-market manufacturer 340 basis points. Here is the fee schedule template we use, free to copy.</p>
          <span class="note__by">Adrian Haldane</span>
        </li>
      </ul>
      <p class="insights__empty" id="insightsEmpty" hidden>No notes filed under that desk yet. Try the archive instead.</p>
    </div>
  </section>

  <section class="section section--tint" id="faq" aria-labelledby="faqTitle" data-spy-section>
    <div class="shell faq__in">
      <header class="head" data-reveal>
        <div>
          <p class="eyebrow"><span class="eyebrow__rule" aria-hidden="true"></span>Before you enquire</p>
          <h2 class="head__title" id="faqTitle">The five questions we always get</h2>
        </div>
        <p class="head__note">If yours is not here, the contact form reaches a partner directly rather than a shared inbox.</p>
      </header>
      <div class="acc" id="acc">
        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq1" id="faqB1">How are you paid, and do you take commissions?<svg class="acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc__panel" id="faq1" role="region" aria-labelledby="faqB1"><div class="acc__in"><p>Flat fees agreed before we start, invoiced monthly. We accept no product commission, no placement fees and no retro trails of any kind. If we ever did, the engagement would be uncompensable advice and we would not take it.</p></div></div>
        </div>
        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq2" id="faqB2">Do you manage investments?<svg class="acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc__panel" id="faq2" role="region" aria-labelledby="faqB2"><div class="acc__in"><p>No. We advise on policy and help you appoint managers, then have no involvement in the selection outcome. Clients who want us to also hold the assets reasonably tend to stop listening to us within a year, which defeats the purpose.</p></div></div>
        </div>
        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq3" id="faqB3">What size of company do you work with?<svg class="acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc__panel" id="faq3" role="region" aria-labelledby="faqB3"><div class="acc__in"><p>Revenue between 8 million and 600 million. Below that, a good regional firm will serve you better for less. Above it, you need a practice with international tax capability we do not have and will not pretend to.</p></div></div>
        </div>
        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq4" id="faqB4">Is the first conversation really free?<svg class="acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc__panel" id="faq4" role="region" aria-labelledby="faqB4"><div class="acc__in"><p>Yes: ninety minutes with a partner, at no charge, with no obligation and no follow-up sequence designed to wear you down. Roughly a third of those conversations end with us recommending someone else, and we have been thanked for it.</p></div></div>
        </div>
        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq5" id="faqB5">What happens if the engagement does not work?<svg class="acc__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc__panel" id="faq5" role="region" aria-labelledby="faqB5"><div class="acc__in"><p>Monthly terms with thirty days notice, and everything we have produced is yours to keep. Two clients have terminated inside the first quarter; both told us why in writing and both told us what would have fixed it, which is how we work now.</p></div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta" aria-labelledby="ctaTitle">
    <div class="shell cta__in" data-reveal>
      <div class="cta__copy">
        <p class="eyebrow eyebrow--light"><span class="eyebrow__rule" aria-hidden="true"></span>Next step</p>
        <h2 class="cta__title" id="ctaTitle">Ninety minutes with a partner, at no charge.</h2>
        <p class="cta__lede">Bring your last management accounts and one problem you cannot solve. You will leave the room with a written view on whether we are the right firm for it &mdash; and who is, if we are not.</p>
      </div>
      <ul class="cta__pts">
        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Reply from a partner within one working day</li>
        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> Written scope and fixed fee before any work begins</li>
        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg> No sales sequence, no follow-up calls</li>
      </ul>
    </div>
  </section>

  <section class="section" id="contact" aria-labelledby="contactTitle" data-spy-section>
    <div class="shell contact">
      <div class="contact__aside" data-reveal>
        <h2 class="head__title" id="contactTitle">Speak to us</h2>
        <p class="contact__copy">Fields marked as required must be completed so we can route the enquiry to the right partner. Nothing here is stored on a marketing platform.</p>
        <dl class="contact__facts">
          <div><dt>Office</dt><dd>41 Coleman Street, London EC2R 5BJ</dd></div>
          <div><dt>Telephone</dt><dd>+44 20 7946 0818</dd></div>
          <div><dt>Email</dt><dd>partners@haldanevale.example</dd></div>
          <div><dt>Hours</dt><dd>Monday to Friday, 08:30&ndash;18:00 GMT</dd></div>
          <div><dt>Regulator</dt><dd>FCA reference 214 806 &middot; ICAEW member</dd></div>
        </dl>
      </div>

      <form class="contact__form" id="contactForm" novalidate data-reveal style="--delay:.08s">
        <div class="field-row">
          <div class="field">
            <label class="field__label" for="fName">Full name <span class="req">*</span></label>
            <input class="input" id="fName" name="name" type="text" autocomplete="name" placeholder="Helen Rowntree" aria-describedby="fNameMsg" />
            <p class="field__msg" id="fNameMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="fCompany">Company <span class="req">*</span></label>
            <input class="input" id="fCompany" name="company" type="text" autocomplete="organization" placeholder="Rowntree Components" aria-describedby="fCompanyMsg" />
            <p class="field__msg" id="fCompanyMsg" role="alert"></p>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="fEmail">Email <span class="req">*</span></label>
          <input class="input" id="fEmail" name="email" type="email" autocomplete="email" placeholder="helen@rowntree.example" aria-describedby="fEmailMsg" />
          <p class="field__msg" id="fEmailMsg" role="alert"></p>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field__label" for="fRevenue">Annual revenue <span class="req">*</span></label>
            <select class="input input--select" id="fRevenue" name="revenue" aria-describedby="fRevenueMsg">
              <option value="">Select a band</option>
              <option value="8-25">GBP 8m &ndash; 25m</option>
              <option value="25-100">GBP 25m &ndash; 100m</option>
              <option value="100-300">GBP 100m &ndash; 300m</option>
              <option value="300-600">GBP 300m &ndash; 600m</option>
              <option value="outside">Outside that range</option>
            </select>
            <p class="field__msg" id="fRevenueMsg" role="alert"></p>
          </div>
          <div class="field">
            <label class="field__label" for="fDesk">Advisory line</label>
            <select class="input input--select" id="fDesk" name="desk">
              <option value="">No preference</option>
              <option value="treasury">Treasury &amp; liquidity</option>
              <option value="tax">Tax structuring</option>
              <option value="capital">Capital allocation</option>
              <option value="debt">Financing &amp; debt</option>
              <option value="risk">Risk &amp; controls</option>
              <option value="transactions">Transactions &amp; exits</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="fMessage">The problem you cannot solve <span class="req">*</span></label>
          <textarea class="input input--area" id="fMessage" name="message" rows="5" placeholder="Our covenant package assumes linear growth and we have flatlined since March. Nobody internally can tell me whether we are still compliant." aria-describedby="fMessageMsg fCount"></textarea>
          <p class="field__foot"><span class="field__msg" id="fMessageMsg" role="alert"></span><span class="field__count" id="fCount">0 / 800</span></p>
        </div>
        <label class="check">
          <input type="checkbox" id="fConsent" checked />
          <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="m20 6-11 11-5-5"/></svg></span>
          <span class="check__text">You may send me the quarterly desk note. Nothing else.</span>
        </label>
        <button class="btn btn--gold btn--block" type="submit">
          Send the enquiry
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </button>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <div class="sent" id="sent" hidden>
          <span class="sent__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/></svg></span>
          <div>
            <p class="sent__t">Enquiry received</p>
            <p class="sent__m" id="sentMsg">A partner will reply within one working day.</p>
          </div>
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
          <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V9M12 21V4M19 21v-8"/></svg></span>
          <span class="brand__name">Haldane<em>&amp; Vale</em></span>
        </a>
        <p class="foot__blurb">Independent corporate advisory. Treasury, tax and capital allocation for mid-market and larger private companies. Regulated by the Financial Conduct Authority.</p>
        <ul class="socials" aria-label="Regulatory and social links">
          <li><a href="#top" aria-label="Haldane and Vale on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M6.5 9.5V20M6.5 5v.01M10.5 20v-5.5a3 3 0 0 1 6 0V20"/></svg></a></li>
          <li><a href="#top" aria-label="Haldane and Vale on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
          <li><a href="#top" aria-label="Haldane and Vale disclosures"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg></a></li>
        </ul>
      </div>
      <nav class="foot__col" aria-label="Advisory">
        <h2 class="foot__title">Advisory</h2>
        <ul>
          <li><a href="#services">Treasury &amp; liquidity</a></li>
          <li><a href="#services">Tax structuring</a></li>
          <li><a href="#services">Capital allocation</a></li>
          <li><a href="#services">Financing &amp; debt</a></li>
          <li><a href="#services">Risk &amp; controls</a></li>
          <li><a href="#services">Transactions</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Evidence">
        <h2 class="foot__title">Evidence</h2>
        <ul>
          <li><a href="#cases">Case studies</a></li>
          <li><a href="#insights">Desk notes</a></li>
          <li><a href="#team">The partners</a></li>
          <li><a href="#process">Our approach</a></li>
          <li><a href="#faq">Common questions</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Firm">
        <h2 class="foot__title">The firm</h2>
        <ul>
          <li><a href="#contact">About us</a></li>
          <li><a href="#contact">Careers</a></li>
          <li><a href="#contact">Offices</a></li>
          <li><a href="#contact">Press</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <nav class="foot__col" aria-label="Legal">
        <h2 class="foot__title">Legal</h2>
        <ul>
          <li><a href="#contact">Regulatory status</a></li>
          <li><a href="#contact">Terms of engagement</a></li>
          <li><a href="#contact">Privacy notice</a></li>
          <li><a href="#contact">Complaints</a></li>
          <li><a href="#contact">Accessibility</a></li>
        </ul>
      </nav>
    </div>
    <div class="foot__legal">
      <p>&copy; 2026 Haldane &amp; Vale Advisory LLP. Registered in England, number OC 312 884.</p>
      <p>Haldane &amp; Vale is authorised and regulated by the Financial Conduct Authority.</p>
    </div>
    <p class="foot__risk">Risk warning: past performance is not a reliable indicator of future results. The desk snapshot above is illustrative and does not constitute investment advice, an offer, or a recommendation to buy or sell any instrument.</p>
  </div>
</footer>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --navy: #0a1a30;
  --navy-2: #0f2742;
  --navy-3: #16385a;
  --ink: #0b1a2c;
  --ink-2: #35485c;
  --muted: #6b7d8f;
  --bg: #f3f5f8;
  --surface: #ffffff;
  --line: #dde3ea;
  --line-2: #c6cfda;
  --gold: #a8802c;
  --gold-hi: #c9a227;
  --gold-soft: #f5eddc;
  --on-gold: #1a1305;
  --pos: #1c6b4a;
  --neg: #a5333a;
  --pos-hi: #58c79b;
  --neg-hi: #e88a90;
  --radius-sm: 7px;
  --radius: 12px;
  --radius-lg: 18px;
  --shadow-sm: 0 1px 2px rgba(10,26,48,.07), 0 1px 1px rgba(10,26,48,.04);
  --shadow: 0 10px 26px -14px rgba(10,26,48,.3), 0 2px 6px rgba(10,26,48,.06);
  --shadow-lg: 0 34px 64px -32px rgba(10,26,48,.4), 0 10px 22px rgba(10,26,48,.08);
  --font-display: 'Libre Baskerville', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ease: cubic-bezier(.22, .68, 0, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 86px; }
body {
  margin: 0; padding: 0;
  background: var(--bg); color: var(--ink);
  font-family: var(--font-body); font-size: 16px; line-height: 1.65;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-display); margin: 0; line-height: 1.18; letter-spacing: -.015em; font-weight: 700; }
p { margin: 0; }
ul, ol, dl, dd { margin: 0; padding: 0; list-style: none; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
textarea { font: inherit; resize: vertical; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 4px; }
.shell { width: 100%; max-width: 1240px; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.12em; height: 1.12em; flex: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 300; transform: translateY(-180%);
  background: var(--gold); color: var(--on-gold); padding: .6rem 1rem; font-weight: 700;
  border-radius: var(--radius-sm); transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }
.readbar { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 95; background: var(--line); pointer-events: none; }
.readbar__fill { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--gold), var(--gold-hi)); transition: width .1s linear; }

/* ------------------------------------------------------------------ header */
.hdr {
  position: sticky; top: 0; z-index: 80;
  background: rgba(10,26,48,.94); backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease);
}
.hdr.is-stuck { border-bottom-color: var(--navy-3); box-shadow: 0 14px 34px -22px rgba(0,0,0,.8); background: rgba(10,26,48,.98); }
.hdr__in { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.6rem); min-height: 72px; }
.brand { display: inline-flex; align-items: center; gap: .6rem; flex: none; }
.brand__mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 9px; background: var(--gold); color: var(--on-gold); }
.brand__mark .icon { width: 20px; height: 20px; }
.brand__name { font-family: var(--font-display); font-size: 1.08rem; font-weight: 700; letter-spacing: -.01em; }
.brand__name em { font-style: italic; color: var(--gold-hi); }
.nav { margin-left: auto; }
.nav__list { display: flex; align-items: center; gap: clamp(.5rem, 1.6vw, 1.35rem); }
.nav__link {
  position: relative; display: inline-block; padding: .35rem 0;
  font-size: .82rem; font-weight: 500; color: color-mix(in srgb, var(--surface) 72%, transparent);
  transition: color .2s var(--ease);
}
.nav__link::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--gold-hi); transform: scaleX(0); transform-origin: left; transition: transform .28s var(--ease); }
.nav__link:hover, .nav__link:focus-visible { color: var(--surface); }
.nav__link:hover::after, .nav__link:focus-visible::after { transform: scaleX(1); }
.nav__link.is-current { color: var(--surface); }
.nav__link.is-current::after { transform: scaleX(1); }
.hdr__actions { display: flex; align-items: center; gap: .5rem; }

.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .8rem 1.35rem; font-size: .88rem; font-weight: 600;
  border: 1px solid transparent; border-radius: 999px; cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 26%, rgba(255,255,255,.3) 48%, transparent 72%); transform: translateX(-130%); transition: transform .6s var(--ease); }
.btn:hover::after { transform: translateX(130%); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--sm { padding: .55rem 1rem; font-size: .8rem; }
.btn--block { width: 100%; }
.btn--gold { background: linear-gradient(135deg, var(--gold-hi), var(--gold)); color: var(--on-gold); }
.btn--gold:hover { box-shadow: 0 14px 30px -14px color-mix(in srgb, var(--gold) 70%, transparent); }
.btn--outline { background: transparent; border-color: var(--line-2); color: var(--ink); }
.btn--outline:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-soft); }

.burger { display: none; place-items: center; width: 40px; height: 40px; background: transparent; border: 1px solid var(--navy-3); border-radius: 9px; cursor: pointer; color: var(--surface); }
.burger .icon { width: 19px; height: 19px; grid-area: 1 / 1; }
.burger__close { opacity: 0; transform: scale(.7); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.burger[aria-expanded='true'] .burger__open { opacity: 0; transform: scale(.7); }
.burger[aria-expanded='true'] .burger__close { opacity: 1; transform: scale(1); }

/* -------------------------------------------------------------------- hero */
.hero { position: relative; padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(2.5rem, 6vw, 4rem); background: var(--navy); color: var(--surface); overflow: hidden; }
.hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(70% 90% at 12% 0%, color-mix(in srgb, var(--navy-3) 85%, transparent), transparent 60%),
    radial-gradient(60% 70% at 92% 100%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 62%);
}
.hero__in { position: relative; z-index: 1; display: grid; gap: clamp(1.75rem, 4vw, 3.25rem); grid-template-columns: minmax(0, 1.12fr) minmax(0, .88fr); align-items: center; }
.eyebrow { display: inline-flex; align-items: center; gap: .65rem; font-size: .73rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--gold-hi); }
.eyebrow__rule { width: 26px; height: 2px; background: currentColor; border-radius: 2px; }
.eyebrow--light { color: color-mix(in srgb, var(--gold-hi) 92%, var(--surface)); }
.hero__title { font-size: clamp(2rem, 4.6vw, 3.3rem); margin-block: 1rem .9rem; max-width: 20ch; }
.hero__lede { font-size: clamp(.98rem, 1.25vw, 1.08rem); color: color-mix(in srgb, var(--surface) 78%, transparent); max-width: 56ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 1.75rem; }
.hero .btn--outline { border-color: color-mix(in srgb, var(--surface) 34%, transparent); color: var(--surface); }
.hero .btn--outline:hover { border-color: var(--gold-hi); color: var(--gold-hi); background: color-mix(in srgb, var(--gold-hi) 14%, transparent); }
.creds { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin-top: 2rem; }
.creds li { display: flex; align-items: center; gap: .45rem; font-size: .8rem; color: color-mix(in srgb, var(--surface) 76%, transparent); }
.creds .icon { width: 15px; height: 15px; color: var(--gold-hi); }

.desk { background: rgba(255,255,255,.05); border: 1px solid var(--navy-3); border-radius: var(--radius-lg); padding: 1.25rem; backdrop-filter: blur(6px); }
.desk__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding-bottom: .9rem; border-bottom: 1px solid var(--navy-3); }
.desk__label { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: color-mix(in srgb, var(--surface) 52%, transparent); }
.desk__id { font-family: var(--font-display); font-size: .95rem; color: var(--surface); }
.live { display: inline-flex; align-items: center; gap: .35rem; padding: .2rem .55rem; border: 1px solid var(--navy-3); border-radius: 999px; font-size: .68rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--gold-hi); }
.live__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-hi); animation: blip 2.4s var(--ease) infinite; }
.quotes { display: grid; gap: .1rem; }
.quote-row { display: grid; grid-template-columns: minmax(0, 1fr) 76px auto; gap: .85rem; align-items: center; padding: .8rem 0; border-bottom: 1px solid color-mix(in srgb, var(--navy-3) 70%, transparent); }
.quote-row:last-child { border-bottom: 0; }
.quote-row__l strong { display: block; font-size: .84rem; color: var(--surface); font-weight: 600; }
.quote-row__l span { font-size: .72rem; color: color-mix(in srgb, var(--surface) 48%, transparent); }
.quote-row__r { text-align: right; }
.quote-row__r strong { display: block; font-family: var(--font-display); font-size: 1rem; font-variant-numeric: tabular-nums; }
.quote-row__r span { font-size: .74rem; font-variant-numeric: tabular-nums; }
.up { color: var(--pos-hi); }
.down { color: var(--neg-hi); }
.spark { width: 76px; height: 30px; }
.spark polyline { fill: none; stroke: var(--gold-hi); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.spark--down polyline { stroke: var(--neg-hi); }
.desk__foot { font-size: .7rem; color: color-mix(in srgb, var(--surface) 44%, transparent); padding-top: .9rem; border-top: 1px solid var(--navy-3); }

/* ----------------------------------------------------------------- ticker */
.ticker { overflow: hidden; background: var(--navy-2); border-bottom: 1px solid var(--navy-3); padding-block: .65rem; }
.ticker__row { display: flex; width: max-content; animation: ticker-run 40s linear infinite; }
.ticker__half { display: flex; align-items: center; gap: clamp(1.25rem, 3vw, 2.5rem); padding-right: clamp(1.25rem, 3vw, 2.5rem); }
.tk { display: inline-flex; align-items: baseline; gap: .5rem; font-size: .8rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tk b { font-weight: 600; color: color-mix(in srgb, var(--surface) 84%, transparent); }
.tk i { font-style: normal; color: var(--surface); }
.tk em { font-style: normal; font-weight: 600; }

/* ---------------------------------------------------------------- sections */
.section { padding-block: clamp(2.75rem, 6vw, 4.75rem); scroll-margin-top: 88px; }
.section--tint { background: var(--surface); border-block: 1px solid var(--line); }
.head { display: flex; flex-wrap: wrap; gap: 1.25rem 2.75rem; align-items: flex-end; justify-content: space-between; margin-bottom: 2.25rem; }
.head__title { font-size: clamp(1.6rem, 3.6vw, 2.5rem); margin-top: .7rem; max-width: 22ch; }
.head__note { font-size: .89rem; color: var(--muted); max-width: 46ch; }

/* services */
.services { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)); }
.svc {
  position: relative; display: grid; gap: .5rem; align-content: start;
  padding: 1.5rem; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius-lg);
  transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.svc::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(135deg, transparent 55%, color-mix(in srgb, var(--gold) 8%, transparent));
  opacity: 0; transition: opacity .35s var(--ease);
}
.svc:hover { transform: translateY(-5px); border-color: var(--gold); box-shadow: var(--shadow); }
.svc:hover::after { opacity: 1; }
.svc__no { font-family: var(--font-display); font-size: .8rem; font-weight: 700; color: var(--gold); letter-spacing: .1em; }
.svc__title { font-size: 1.14rem; }
.svc__copy { font-size: .86rem; color: var(--muted); }
.svc__pts { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .5rem; }
.svc__pts li { padding: .22rem .55rem; border-radius: 999px; background: var(--gold-soft); color: var(--gold); font-size: .71rem; font-weight: 600; }

/* process */
.process { position: relative; }
.process::before {
  content: ''; position: absolute; left: 6%; right: 6%; top: 11px; height: 3px;
  background: var(--line); border-radius: 3px;
}
.process__line {
  position: absolute; left: 6%; top: 11px; height: 3px; width: 0;
  background: linear-gradient(90deg, var(--gold), var(--gold-hi));
  border-radius: 3px;
  transition: width 1.6s var(--ease), height 1.6s var(--ease);
}
.process.is-drawn .process__line { width: 88%; }
.process__list { position: relative; display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); }
.step { position: relative; display: grid; gap: .45rem; align-content: start; padding-top: 2.6rem; }
.step__mark { position: absolute; top: 0; left: 0; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: var(--surface); border: 2px solid var(--line); }
.step__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line-2); transition: background .4s var(--ease), box-shadow .4s var(--ease); }
.process.is-drawn .step__mark { border-color: var(--gold); }
.process.is-drawn .step__dot { background: var(--gold); box-shadow: 0 0 0 4px var(--gold-soft); }
.step__no { font-size: .71rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); }
.step__title { font-size: 1.2rem; }
.step__copy { font-size: .86rem; color: var(--muted); }

/* cases */
.cases { display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); }
.case {
  display: grid; gap: .7rem; align-content: start;
  padding: 1.5rem; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius-lg);
  transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.case:hover { transform: translateY(-5px); border-color: var(--gold); box-shadow: var(--shadow-lg); }
.case__sector { font-size: .71rem; font-weight: 600; letter-spacing: .11em; text-transform: uppercase; color: var(--gold); }
.case__title { font-size: 1.2rem; margin-top: .35rem; }
.case__copy { font-size: .87rem; color: var(--muted); }
.case__stats { display: grid; gap: .75rem; grid-template-columns: repeat(3, minmax(0, 1fr)); padding-top: .9rem; border-top: 1px solid var(--line); }
.case__v { display: block; font-family: var(--font-display); font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 700; color: var(--navy); font-variant-numeric: tabular-nums; line-height: 1.1; }
.case__l { display: block; font-size: .71rem; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); margin-top: .2rem; }
.case__scope { display: flex; flex-wrap: wrap; gap: .4rem; font-size: .76rem; color: var(--muted); }
.case__scope span { padding: .2rem .55rem; border-radius: 999px; background: var(--navy); color: var(--surface); font-weight: 600; }

/* team */
.team { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 235px), 1fr)); }
.person { display: grid; gap: .4rem; align-content: start; padding: 1.5rem; background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-lg); transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease); }
.person:hover { transform: translateY(-5px); border-color: var(--gold); box-shadow: var(--shadow); }
.face { display: block; width: 68px; height: 68px; border-radius: 14px; overflow: hidden; background: var(--navy); color: var(--gold-hi); margin-bottom: .6rem; transition: transform .3s var(--ease); }
.face svg { width: 100%; height: 100%; display: block; }
.person:hover .face { transform: rotate(-4deg) scale(1.04); }
.face--2 { background: var(--navy-2); color: #8fb4d9; }
.face--3 { background: var(--navy-3); color: var(--gold-hi); }
.face--4 { background: var(--ink); color: #d5b978; }
.person__name { font-size: 1.1rem; }
.person__role { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
.person__bio { font-size: .84rem; color: var(--muted); }
.person__certs { display: flex; gap: .35rem; margin-top: .45rem; }
.person__certs li { padding: .2rem .5rem; border: 1px solid var(--line-2); border-radius: 999px; font-size: .7rem; font-weight: 600; color: var(--ink-2); }

/* insights */
.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 1.6rem; }
.chips { display: flex; flex-wrap: wrap; gap: .45rem; }
.chip { padding: .45rem .9rem; font-size: .81rem; font-weight: 600; background: var(--surface); border: 1px solid var(--line-2); border-radius: 999px; cursor: pointer; color: var(--muted); transition: color .2s var(--ease), border-color .2s var(--ease), background .2s var(--ease), transform .18s var(--ease); }
.chip:hover { color: var(--ink); border-color: var(--gold); transform: translateY(-1px); }
.chip.is-on { background: var(--navy); border-color: var(--navy); color: var(--surface); }
.filters__status { font-size: .79rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.insights { display: grid; gap: .1rem; }
.note {
  display: grid; gap: .4rem;
  padding: 1.35rem .25rem; border-bottom: 1px solid var(--line);
  transition: background .25s var(--ease), padding-left .25s var(--ease);
}
.note:hover { background: var(--surface); padding-left: .85rem; }
.note__meta { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; font-size: .73rem; color: var(--muted); }
.note__desk { padding: .18rem .55rem; border-radius: 999px; background: var(--gold-soft); color: var(--gold); font-weight: 600; letter-spacing: .04em; }
.note__title { font-size: clamp(1.05rem, 2vw, 1.3rem); max-width: 48ch; }
.note__title a { position: relative; }
.note__title a::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%; background: var(--gold); transform: scaleX(0); transform-origin: left; transition: transform .3s var(--ease); }
.note__title a:hover::after { transform: scaleX(1); }
.note__excerpt { font-size: .86rem; color: var(--muted); max-width: 76ch; }
.note__by { font-size: .76rem; color: var(--ink-2); font-weight: 600; }
.insights__empty { padding: 1.5rem 0; font-size: .88rem; color: var(--muted); }
.insights__empty[hidden] { display: none; }

/* faq */
.faq__in { max-width: 920px; }
.acc { display: grid; gap: .6rem; }
.acc__item { background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius); transition: border-color .25s var(--ease), background .25s var(--ease); }
.acc__item.is-open { border-color: var(--gold); background: var(--surface); box-shadow: var(--shadow-sm); }
.acc__item h3 { font-size: .99rem; }
.acc__btn { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 1.05rem 1.2rem; text-align: left; background: none; border: 0; border-radius: var(--radius); cursor: pointer; font-family: var(--font-display); font-size: .99rem; font-weight: 700; color: var(--ink); transition: color .2s var(--ease); }
.acc__btn:hover { color: var(--gold); }
.acc__chev { width: 18px; height: 18px; flex: none; color: var(--muted); transition: transform .3s var(--ease), color .2s var(--ease); }
.acc__btn[aria-expanded='true'] .acc__chev { transform: rotate(180deg); color: var(--gold); }
.acc__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .34s var(--ease); }
.acc__item.is-open .acc__panel { grid-template-rows: 1fr; }
.acc__in { overflow: hidden; }
.acc__in p { padding: 0 1.2rem 1.15rem; font-size: .89rem; color: var(--muted); }

/* cta */
.cta { padding-block: clamp(2.5rem, 5vw, 3.75rem); background: var(--navy); color: var(--surface); position: relative; overflow: hidden; }
.cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 120% at 88% 20%, color-mix(in srgb, var(--gold) 26%, transparent), transparent 62%); }
.cta__in { position: relative; z-index: 1; display: grid; gap: clamp(1.25rem, 3vw, 2.75rem); grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); align-items: center; }
.cta__title { font-size: clamp(1.5rem, 3.4vw, 2.35rem); margin-block: .7rem .8rem; max-width: 22ch; }
.cta__lede { color: color-mix(in srgb, var(--surface) 78%, transparent); max-width: 54ch; }
.cta__pts { display: grid; gap: .7rem; }
.cta__pts li { display: flex; align-items: flex-start; gap: .55rem; font-size: .85rem; color: color-mix(in srgb, var(--surface) 86%, transparent); }
.cta__pts .icon { width: 16px; height: 16px; margin-top: 2px; color: var(--gold-hi); }

/* contact */
.contact { display: grid; gap: clamp(1.75rem, 4vw, 3.25rem); grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: start; }
.contact__copy { font-size: .92rem; color: var(--muted); margin-top: 1rem; max-width: 44ch; }
.contact__facts { display: grid; gap: .75rem; margin-top: 1.75rem; }
.contact__facts > div { display: grid; gap: .1rem; padding-bottom: .75rem; border-bottom: 1px solid var(--line); }
.contact__facts dt { font-size: .69rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.contact__facts dd { font-size: .9rem; color: var(--ink); }
.contact__form { display: grid; gap: 1rem; padding: clamp(1.25rem, 3vw, 1.85rem); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.field { display: grid; gap: .35rem; }
.field-row { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); }
.field__label { font-size: .78rem; font-weight: 600; color: var(--ink-2); }
.req { color: var(--gold); }
.input { width: 100%; padding: .75rem .9rem; font: inherit; font-size: .92rem; color: var(--ink); background: var(--bg); border: 1px solid var(--line-2); border-radius: 10px; transition: border-color .18s var(--ease), box-shadow .18s var(--ease), background .18s var(--ease); }
.input::placeholder { color: color-mix(in srgb, var(--muted) 72%, transparent); }
.input:focus { outline: none; border-color: var(--gold); background: var(--surface); box-shadow: 0 0 0 3px var(--gold-soft); }
.input--area { min-height: 132px; line-height: 1.55; }
.input--select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 2.4rem; }
.field.is-bad .input { border-color: var(--neg); background: color-mix(in srgb, var(--neg) 6%, transparent); }
.field__msg { font-size: .76rem; min-height: 1em; color: var(--neg); font-weight: 500; }
.field__foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.field__count { font-size: .72rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.check { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .83rem; color: var(--ink-2); }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.check__box { display: grid; place-items: center; flex: none; width: 20px; height: 20px; margin-top: 1px; border: 1px solid var(--line-2); border-radius: 6px; background: var(--bg); transition: background .18s var(--ease), border-color .18s var(--ease); }
.check__box .icon { width: 13px; height: 13px; color: var(--surface); opacity: 0; transform: scale(.6); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.check input:checked + .check__box { background: var(--gold); border-color: var(--gold); }
.check input:checked + .check__box .icon { opacity: 1; transform: scale(1); }
.check input:focus-visible + .check__box { outline: 2px solid var(--gold); outline-offset: 2px; }
.form-status { font-size: .82rem; min-height: 1.15em; font-weight: 600; color: var(--muted); }
.form-status.is-bad { color: var(--neg); }
.sent { display: flex; gap: .8rem; align-items: flex-start; padding: .9rem 1rem; border: 1px solid var(--gold); border-radius: var(--radius); background: var(--gold-soft); animation: rise-in .5s var(--ease) both; }
.sent[hidden] { display: none; }
.sent__ic { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: var(--on-gold); }
.sent__ic .icon { width: 18px; height: 18px; }
.sent__t { font-size: .9rem; font-weight: 700; }
.sent__m { font-size: .82rem; color: var(--ink-2); }

/* ------------------------------------------------------------------ footer */
.foot { background: var(--navy); color: color-mix(in srgb, var(--surface) 74%, transparent); padding-top: clamp(2.5rem, 5vw, 3.5rem); }
.foot__grid { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1.35fr) repeat(4, minmax(0, 1fr)); }
.foot__brand { display: grid; gap: .85rem; align-content: start; }
.foot__blurb { font-size: .84rem; max-width: 38ch; }
.foot__brand .brand__name { color: var(--surface); }
.socials { display: flex; gap: .5rem; }
.socials a { display: grid; place-items: center; width: 37px; height: 37px; border: 1px solid var(--navy-3); border-radius: 10px; color: color-mix(in srgb, var(--surface) 78%, transparent); transition: color .2s var(--ease), background .2s var(--ease), border-color .2s var(--ease), transform .2s var(--ease); }
.socials a:hover { color: var(--on-gold); background: var(--gold); border-color: var(--gold); transform: translateY(-3px); }
.foot__title { font-family: var(--font-body); font-size: .71rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-hi); margin-bottom: .8rem; }
.foot__col li + li { margin-top: .42rem; }
.foot__col a { font-size: .85rem; transition: color .18s var(--ease), padding-left .18s var(--ease); }
.foot__col a:hover { color: var(--surface); padding-left: 4px; }
.foot__legal { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; justify-content: space-between; margin-top: 2.5rem; padding-block: 1.1rem; border-top: 1px solid var(--navy-3); font-size: .76rem; }
.foot__risk { padding-block: 1rem 1.5rem; border-top: 1px solid var(--navy-3); font-size: .7rem; color: color-mix(in srgb, var(--surface) 52%, transparent); max-width: 100ch; }

/* ------------------------------------------------------------------ reveal */
[data-reveal] { opacity: 0; transform: translateY(22px); }
[data-reveal].is-visible { opacity: 1; transform: none; transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--delay, 0s); }

/* --------------------------------------------------------------- keyframes */
@keyframes rise-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes ticker-run { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes blip { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.82); } }
@keyframes draw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes gold-sweep { 0% { transform: translateX(-130%); } 100% { transform: translateX(130%); } }
@keyframes count-pop { 0% { transform: scale(.96); opacity: .4; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }
@keyframes sheen-slide { from { background-position: -160% 0; } to { background-position: 260% 0; } }

/* -------------------------------------------------------------- responsive */
@media (max-width: 1100px) {
  .foot__grid { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); }
  .contact { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 960px) {
  .burger { display: grid; }
  .hdr__cta { display: none; }
  .hero__in { grid-template-columns: minmax(0, 1fr); }
  .cta__in { grid-template-columns: minmax(0, 1fr); }
  .nav {
    position: absolute; top: calc(100% + 1px); left: 0; right: 0;
    background: var(--navy-2); border-bottom: 1px solid var(--navy-3); box-shadow: var(--shadow);
    padding: .75rem clamp(1rem, 4vw, 2.5rem) 1.15rem;
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .22s var(--ease), transform .22s var(--ease), visibility .22s;
  }
  .nav.is-open { opacity: 1; visibility: visible; transform: none; }
  .nav__list { flex-direction: column; align-items: stretch; gap: 0; }
  .nav__link { display: block; padding: .65rem 0; border-bottom: 1px solid var(--navy-3); font-size: 1rem; }
  .process::before { left: 12px; right: auto; top: 0; bottom: 0; width: 3px; height: auto; }
  .process__line { left: 12px; top: 0; height: 0; width: 3px; }
  .process.is-drawn .process__line { height: 92%; }
  .step { padding-top: 0; padding-left: 2.6rem; }
  .step__mark { left: 0; }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .foot__grid { grid-template-columns: minmax(0, 1fr); }
  .foot__legal { flex-direction: column; }
  .case__stats { grid-template-columns: minmax(0, 1fr); }
}

/* ------------------------------------------------------- reduced motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .ticker__row { animation: none; transform: none; }
  .process.is-drawn .process__line { width: 88%; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;

function $(id) { return document.getElementById(id); }
function qsa(sel) { return document.querySelectorAll(sel); }

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

/* ------------------------------------------------------------- scroll bar */
function initScroll() {
  var hdr = $('hdr');
  var fill = $('readFill');
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
  var prefix = node.getAttribute('data-prefix') || '';
  var suffix = node.getAttribute('data-suffix') || '';
  var decimals = node.getAttribute('data-decimals') ? parseInt(node.getAttribute('data-decimals'), 10) : 0;
  if (reduce) { node.textContent = prefix + target.toFixed(decimals) + suffix; return; }
  var start = performance.now();
  var dur = 1500;
  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    var eased = 1 - Math.pow(1 - t, 3);
    node.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
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
  }, { threshold: 0.35 });
  for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
}

/* ----------------------------------------------------------- process line */
function initProcess() {
  var line = $('processLine');
  if (!line) return;
  if (reduce || !('IntersectionObserver' in window)) { line.classList.add('is-drawn'); return; }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      line.classList.add('is-drawn');
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(line);
}

/* -------------------------------------------------------- insight filters */
function initInsights() {
  var chips = qsa('#insightChips .chip');
  var status = $('insightStatus');
  var empty = $('insightsEmpty');
  var notes = qsa('#insightList .note');
  if (!chips.length || !notes.length) return;
  var active = 'all';

  function apply() {
    var shown = 0;
    for (var i = 0; i < notes.length; i++) {
      var cat = notes[i].getAttribute('data-cat') || '';
      var visible = active === 'all' || cat === active;
      notes[i].style.display = visible ? '' : 'none';
      if (visible) shown++;
    }
    if (status) status.textContent = shown + (shown === 1 ? ' note' : ' notes') + ' shown';
    if (empty) empty.hidden = shown !== 0;
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

/* ---------------------------------------------------------------- accordion */
function initAccordion() {
  var buttons = qsa('.acc__btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      var item = this.closest ? this.closest('.acc__item') : null;
      if (!item) return;
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
      item.classList.toggle('is-open', !open);
    });
  }
}

/* ------------------------------------------------------------------ mobile */
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

/* ----------------------------------------------------------- contact form */
function setBad(input, msgNode, message) {
  var field = input ? input.closest('.field') : null;
  if (field) field.classList.toggle('is-bad', !!message);
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (msgNode) msgNode.textContent = message || '';
}

function initContact() {
  var form = $('contactForm');
  if (!form) return;
  var name = $('fName');
  var company = $('fCompany');
  var email = $('fEmail');
  var revenue = $('fRevenue');
  var message = $('fMessage');
  var counter = $('fCount');
  var status = $('formStatus');
  var sent = $('sent');

  if (message && counter) {
    message.addEventListener('input', function () {
      if (message.value.length > 800) message.value = message.value.slice(0, 800);
      counter.textContent = message.value.length + ' / 800';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    var nm = name ? name.value.trim() : '';
    var cp = company ? company.value.trim() : '';
    var em = email ? email.value.trim() : '';
    var rev = revenue ? revenue.value : '';
    var msg = message ? message.value.trim() : '';

    if (!nm) { setBad(name, $('fNameMsg'), 'We need a name for the file.'); bad = true; }
    else if (nm.length < 2) { setBad(name, $('fNameMsg'), 'That name looks too short.'); bad = true; }
    else if (!/[A-Za-zÀ-ſ]/.test(nm)) { setBad(name, $('fNameMsg'), 'Names need at least one letter.'); bad = true; }
    else { setBad(name, $('fNameMsg'), ''); }

    if (!cp) { setBad(company, $('fCompanyMsg'), 'Tell us which company this is about.'); bad = true; }
    else if (cp.length < 2) { setBad(company, $('fCompanyMsg'), 'That company name looks too short.'); bad = true; }
    else { setBad(company, $('fCompanyMsg'), ''); }

    if (!em) { setBad(email, $('fEmailMsg'), 'An email address is required.'); bad = true; }
    else if (!EMAIL_RE.test(em)) { setBad(email, $('fEmailMsg'), 'Use the format name@company.com'); bad = true; }
    else if (/(^|@)[^.]*\\.(test|example|invalid)$/i.test(em)) { setBad(email, $('fEmailMsg'), 'Please use a real deliverable address.'); bad = true; }
    else { setBad(email, $('fEmailMsg'), ''); }

    if (!rev) { setBad(revenue, $('fRevenueMsg'), 'Select a band, even a rough one.'); bad = true; }
    else { setBad(revenue, $('fRevenueMsg'), ''); }

    if (!msg) { setBad(message, $('fMessageMsg'), 'Tell us the problem, in your own words.'); bad = true; }
    else if (msg.length < 30) { setBad(message, $('fMessageMsg'), 'A bit more detail will get you a better answer.'); bad = true; }
    else if (msg.length < 60) { setBad(message, $('fMessageMsg'), 'Still short, almost there.'); bad = true; }
    else { setBad(message, $('fMessageMsg'), ''); }

    if (bad) {
      if (status) { status.className = 'form-status is-bad'; status.textContent = 'Some required fields still need attention.'; }
      if (sent) sent.hidden = true;
      return;
    }

    if (status) { status.className = 'form-status'; status.textContent = 'Filing your enquiry...'; }
    var sentMsg = $('sentMsg');
    if (sentMsg) sentMsg.textContent = 'Thank you, ' + nm.split(' ')[0] + '. Your enquiry is with the ' + cp + ' file and a partner will reply to ' + em + ' within one working day.';
    window.setTimeout(function () {
      if (status) status.textContent = '';
      if (sent) sent.hidden = false;
      form.reset();
      if (counter) counter.textContent = '0 / 800';
    }, reduce ? 0 : 450);
  });

  var live = [name, company, email];
  for (var i = 0; i < live.length; i++) {
    live[i].addEventListener('blur', function () {
      if (!this.value.trim()) return;
      setBad(this, this.parentNode.querySelector('.field__msg'), '');
    });
  }
  if (message) {
    message.addEventListener('blur', function () {
      if (message.value.trim().length >= 30) setBad(message, $('fMessageMsg'), '');
    });
  }
}

initReveal();
initScroll();
initCounters();
initProcess();
initInsights();
initAccordion();
initNav();
initContact();
`,
};