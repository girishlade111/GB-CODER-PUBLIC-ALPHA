
export default {
  html: `
<a class="skip-link" href="#main">Skip to main content</a>

<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <symbol id="mark-yes" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15"/><path d="m7 12.4 3.3 3.3L17.2 8.8" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="mark-part" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.07"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3.2 3.2"/><path d="M8.2 12h7.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></symbol>
  <symbol id="mark-no" viewBox="0 0 24 24"><path d="M6.5 12h11" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></symbol>
</svg>

<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#plans" aria-label="Cadence, return to the pricing plans">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <rect x="4" y="4" width="24" height="24" rx="7" stroke="currentColor" stroke-width="1.8"/>
          <path d="M11 20V12m5 8v-5m5 5v-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-text">Cadence</span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a class="nav-link" href="#plans">Pricing</a>
      <a class="nav-link" href="#compare">Compare</a>
      <a class="nav-link" href="#guarantee">Guarantee</a>
      <a class="nav-link" href="#faq">FAQ</a>
    </nav>
    <div class="header-actions">
      <a class="nav-link nav-quiet" href="#cta">Sign in</a>
      <a class="btn btn-primary btn-sm" href="#plans">Start free</a>
      <button type="button" class="icon-btn nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
    <a class="nav-link" href="#plans">Pricing</a>
    <a class="nav-link" href="#compare">Compare</a>
    <a class="nav-link" href="#guarantee">Guarantee</a>
    <a class="nav-link" href="#faq">FAQ</a>
    <a class="btn btn-primary" href="#cta">Start free</a>
  </nav>
</header>

<main id="main">
  <section class="plans" id="plans" aria-labelledby="plans-title">
    <div class="wrap">
      <header class="hero-head" data-reveal>
        <p class="kicker">Pricing</p>
        <h1 id="plans-title">Priced per seat. Never per surprise.</h1>
        <p class="lede">Four plans, all of them published. Change or cancel from inside the app in two clicks, and keep your data either way.</p>
      </header>

      <div class="billing-bar" data-reveal style="--delay:80ms">
        <button type="button" class="billing-switch" id="billing-switch" role="switch" aria-checked="false" aria-labelledby="billing-label">
          <span class="switch-track" aria-hidden="true"><span class="switch-knob"></span></span>
        </button>
        <span class="billing-label" id="billing-label">Monthly</span>
        <span class="save-badge" id="save-badge">Save 20%</span>
        <span class="billing-label billing-yearly">Yearly</span>
      </div>

      <ul class="plan-grid">
        <li class="plan" data-reveal style="--delay:0ms">
          <div class="plan-head">
            <h2>Starter</h2>
            <p class="plan-for">Solo operators and first hires who need the numbers in one place.</p>
          </div>
          <p class="price">
            <span class="cur">$</span><span class="amount" data-monthly="19" data-yearly="15">19</span>
            <span class="per">per user<br />per month</span>
          </p>
          <p class="bill" data-bill>Billed monthly. Cancel any time.</p>
          <p class="saving" data-saving hidden></p>
          <a class="btn btn-outline btn-block" href="#cta">Start 14-day trial</a>
          <p class="fine">No card required</p>
          <p class="includes">Everything in the free tier, plus:</p>
          <ul class="plan-features">
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>3 seats included</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>2 live dashboards</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>1 scheduled report per day</li>
            <li><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Limited:</span>90 days of history</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Slack and email digests</li>
            <li><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Limited:</span>1,000 API calls per minute</li>
            <li><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included:</span>Single sign-on</li>
            <li><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included:</span>Audit log export</li>
            <li><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included:</span>Sandbox environment</li>
          </ul>
        </li>

        <li class="plan is-featured" data-reveal style="--delay:70ms">
          <p class="plan-flag">Most popular</p>
          <div class="plan-head">
            <h2>Growth</h2>
            <p class="plan-for">Revenue and success teams of 10 to 40 who live in the numbers.</p>
          </div>
          <p class="price">
            <span class="cur">$</span><span class="amount" data-monthly="49" data-yearly="39">49</span>
            <span class="per">per user<br />per month</span>
          </p>
          <p class="bill" data-bill>Billed monthly. Cancel any time.</p>
          <p class="saving" data-saving hidden></p>
          <a class="btn btn-primary btn-block" href="#cta">Start 14-day trial</a>
          <p class="fine">No card required</p>
          <p class="includes">Everything in Starter, plus:</p>
          <ul class="plan-features">
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>10 seats included</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Unlimited dashboards</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>10 scheduled reports per day</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>2 years of history</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Forecast and cohort models</li>
            <li><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Limited:</span>50,000 API calls per minute</li>
            <li><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Limited:</span>Single sign-on, add-on $4</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>90-day audit log</li>
            <li><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included:</span>Sandbox environment</li>
          </ul>
        </li>

        <li class="plan" data-reveal style="--delay:140ms">
          <div class="plan-head">
            <h2>Scale</h2>
            <p class="plan-for">Multi-team orgs with a security review, a data residency question and an auditor.</p>
          </div>
          <p class="price">
            <span class="cur">$</span><span class="amount" data-monthly="129" data-yearly="103">129</span>
            <span class="per">per user<br />per month</span>
          </p>
          <p class="bill" data-bill>Billed monthly. Cancel any time.</p>
          <p class="saving" data-saving hidden></p>
          <a class="btn btn-outline btn-block" href="#cta">Start 14-day trial</a>
          <p class="fine">No card required</p>
          <p class="includes">Everything in Growth, plus:</p>
          <ul class="plan-features">
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>40 seats included</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Unlimited dashboards and reports</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>7 years of history</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Data residency, EU or US</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Single sign-on and SCIM</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>500,000 API calls per minute</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Full audit log, exportable</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>3 sandbox environments</li>
            <li><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Limited:</span>Priority support, 30 min</li>
          </ul>
        </li>

        <li class="plan plan-enterprise" data-reveal style="--delay:210ms">
          <div class="plan-head">
            <h2>Enterprise</h2>
            <p class="plan-for">Regulated groups, private tenancy and procurement departments with a checklist.</p>
          </div>
          <p class="price price-custom">
            <span class="amount amount-word">Custom</span>
            <span class="per">annual contract<br />volume pricing</span>
          </p>
          <p class="bill" data-bill>Minimum 200 seats, invoiced annually.</p>
          <p class="saving" data-saving hidden></p>
          <a class="btn btn-outline btn-block" href="#cta">Talk to sales</a>
          <p class="fine">Reply within one business day</p>
          <p class="includes">Everything in Scale, plus:</p>
          <ul class="plan-features">
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Unlimited seats and workspaces</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Your own VPC or on-premise</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Custom data residency, any region</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Unlimited API rate, burst to 5M</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Named support engineer, 1h SLA</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Security questionnaire, DPA, pen test</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>99.95% uptime, financial backing</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Unlimited sandboxes and staging</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included:</span>Quarterly roadmap review</li>
          </ul>
        </li>
      </ul>

      <p class="plans-foot" data-reveal>
        Prices in USD, excluding VAT. Non-profits and accredited educational institutions get Growth free for two years &mdash; email
        <a href="mailto:grants@cadencehq.example">grants@cadencehq.example</a>.
      </p>
    </div>
  </section>

  <section class="guarantee" id="guarantee" aria-labelledby="guarantee-title">
    <div class="wrap">
      <div class="guarantee-strip" data-reveal>
        <span class="g-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
        </span>
        <div>
          <h2 id="guarantee-title">60-day money-back guarantee</h2>
          <p>If Cadence does not save your team at least ten hours a month inside the first sixty days, email us and we refund every cent. No form, no retention call, no exit survey.</p>
        </div>
        <ul class="trust">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4"/></svg>SOC 2 Type II</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg>ISO 27001</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>GDPR ready</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2"/></svg>99.95% uptime</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6h12v12H6zM9 9h6v6H9"/></svg>PCI DSS L1</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="logos" aria-label="Customers">
    <div class="wrap">
      <p class="logos-title" data-reveal>Running the numbers for 4,100 teams since 2019</p>
    </div>
    <div class="logo-marquee">
      <div class="logo-track">
        <ul class="logo-row">
          <li>NORTHBEAM</li><li>HALLOWAY GROUP</li><li>VERTEX LABS</li><li>BRIGHTCO</li>
          <li>PACIFICA ENERGY</li><li>KESTREL BANK</li><li>ORBIT LABS</li><li>FENWICK HEALTH</li>
        </ul>
        <ul class="logo-row" aria-hidden="true">
          <li>NORTHBEAM</li><li>HALLOWAY GROUP</li><li>VERTEX LABS</li><li>BRIGHTCO</li>
          <li>PACIFICA ENERGY</li><li>KESTREL BANK</li><li>ORBIT LABS</li><li>FENWICK HEALTH</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="compare" id="compare" aria-labelledby="compare-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">Side by side</p>
        <h2 id="compare-title">Every line, every plan</h2>
        <p class="section-sub">Toggle off the rows where every plan does the same thing and see only where Cadence actually differs.</p>
      </header>

      <div class="compare-tools" data-reveal>
        <label class="toggle">
          <input type="checkbox" id="diff-only" />
          <span class="toggle-track" aria-hidden="true"><span class="toggle-knob"></span></span>
          <span>Show only the differences</span>
        </label>
        <p class="diff-count" id="diff-count" role="status" aria-live="polite">10 of 10 rows shown</p>
      </div>

      <div class="table-shell" data-reveal>
        <table class="compare-table">
          <caption class="sr-only">Feature comparison across Starter, Growth, Scale and Enterprise plans</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Starter</th>
              <th scope="col" class="is-featured-col">Growth</th>
              <th scope="col">Scale</th>
              <th scope="col">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            <tr data-group="seats">
              <th scope="row" data-label="Feature">Seats included</th>
              <td data-label="Starter">3</td>
              <td data-label="Growth" class="is-featured-col">10</td>
              <td data-label="Scale">40</td>
              <td data-label="Enterprise">Unlimited</td>
            </tr>
            <tr data-group="seats">
              <th scope="row" data-label="Feature">Price per extra seat</th>
              <td data-label="Starter">$22</td>
              <td data-label="Growth" class="is-featured-col">$17</td>
              <td data-label="Scale">$12</td>
              <td data-label="Enterprise">$9</td>
            </tr>
            <tr data-group="data">
              <th scope="row" data-label="Feature">Data retention</th>
              <td data-label="Starter">90 days</td>
              <td data-label="Growth" class="is-featured-col">2 years</td>
              <td data-label="Scale">7 years</td>
              <td data-label="Enterprise">Negotiated</td>
            </tr>
            <tr data-group="data">
              <th scope="row" data-label="Feature">Data residency</th>
              <td data-label="Starter">US</td>
              <td data-label="Growth" class="is-featured-col">US, EU</td>
              <td data-label="Scale">US, EU</td>
              <td data-label="Enterprise">Any region</td>
            </tr>
            <tr data-group="reporting">
              <th scope="row" data-label="Feature">Dashboards</th>
              <td data-label="Starter">2</td>
              <td data-label="Growth" class="is-featured-col">Unlimited</td>
              <td data-label="Scale">Unlimited</td>
              <td data-label="Enterprise">Unlimited</td>
            </tr>
            <tr data-group="reporting">
              <th scope="row" data-label="Feature">Scheduled reports</th>
              <td data-label="Starter">1 per day</td>
              <td data-label="Growth" class="is-featured-col">10 per day</td>
              <td data-label="Scale">Unlimited</td>
              <td data-label="Enterprise">Unlimited</td>
            </tr>
            <tr data-group="security">
              <th scope="row" data-label="Feature">Single sign-on (SAML)</th>
              <td data-label="Starter"><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included</span></td>
              <td data-label="Growth" class="is-featured-col"><svg class="mark is-part" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-part"></use></svg><span class="sr-only">Add-on</span></td>
              <td data-label="Scale"><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included</span></td>
              <td data-label="Enterprise"><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included</span></td>
            </tr>
            <tr data-group="security">
              <th scope="row" data-label="Feature">SCIM user provisioning</th>
              <td data-label="Starter"><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included</span></td>
              <td data-label="Growth" class="is-featured-col"><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included</span></td>
              <td data-label="Scale"><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included</span></td>
              <td data-label="Enterprise"><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg><span class="sr-only">Included</span></td>
            </tr>
            <tr data-group="support">
              <th scope="row" data-label="Feature">Support response</th>
              <td data-label="Starter">2 business days</td>
              <td data-label="Growth" class="is-featured-col">4 hours</td>
              <td data-label="Scale">30 minutes</td>
              <td data-label="Enterprise">1 hour, named</td>
            </tr>
            <tr data-group="support">
              <th scope="row" data-label="Feature">Sandbox environments</th>
              <td data-label="Starter"><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included</span></td>
              <td data-label="Growth" class="is-featured-col"><svg class="mark is-no" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-no"></use></svg><span class="sr-only">Not included</span></td>
              <td data-label="Scale">3</td>
              <td data-label="Enterprise">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="proof" aria-labelledby="proof-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <p class="kicker">Outcomes</p>
        <h2 id="proof-title">What teams report back</h2>
      </header>
      <ul class="quote-grid">
        <li data-reveal style="--delay:0ms">
          <blockquote><p>We cancelled three reporting tools and one contractor after the first month. The board deck that took a week now takes ninety minutes.</p></blockquote>
          <p class="quote-by"><strong>Ines Maduro</strong><span>VP Revenue Operations, Northbeam</span></p>
        </li>
        <li data-reveal style="--delay:80ms">
          <blockquote><p>The audit log alone justified the Scale plan. Our security team signed off in eleven days instead of the usual quarter.</p></blockquote>
          <p class="quote-by"><strong>Tobias Renner</strong><span>Head of Data Governance, Kestrel Bank</span></p>
        </li>
        <li data-reveal style="--delay:160ms">
          <blockquote><p>Switched plans twice in an afternoon and never once had to talk to anybody. That is a strange thing to praise and I am praising it.</p></blockquote>
          <p class="quote-by"><strong>Priya Balakrishnan</strong><span>Founder, Vertex Labs</span></p>
        </li>
      </ul>
      <ul class="stat-strip" data-reveal>
        <li><span class="stat-num"><span class="counter" data-count="11.5" data-decimals="1">0</span> hrs</span><span class="stat-label">Median hours saved per user, per month</span></li>
        <li><span class="stat-num"><span class="counter" data-count="4100">0</span>+</span><span class="stat-label">Paying teams, 61 countries</span></li>
        <li><span class="stat-num"><span class="counter" data-count="99.95" data-decimals="2">0</span>%</span><span class="stat-label">Measured uptime over 24 months</span></li>
        <li><span class="stat-num"><span class="counter" data-count="4.8" data-decimals="1">0</span>/5</span><span class="stat-label">Average review score, 1,930 responses</span></li>
      </ul>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="faq-title">
    <div class="wrap faq-grid">
      <header class="section-head faq-head" data-reveal>
        <p class="kicker">Questions</p>
        <h2 id="faq-title">Billing questions, answered plainly</h2>
        <p class="section-sub">If the answer you need is not here, our support team answers in under four hours on a business day.</p>
      </header>
      <div class="accordion" id="faq-accordion">
        <div class="acc-item" data-reveal style="--delay:0ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp1" id="ft1">Can I change plans mid-cycle?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp1" role="region" aria-labelledby="ft1" hidden><p>Yes. Upgrades take effect immediately and we prorate to the day. Downgrades take effect at the end of your current term so you keep what you paid for. Seats are added immediately and removed at the next invoice.</p></div>
        </div>
        <div class="acc-item" data-reveal style="--delay:60ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp2" id="ft2">What exactly counts as a seat?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp2" role="region" aria-labelledby="ft2" hidden><p>One named human who can sign in and build. Viewers who only receive scheduled reports are free and unlimited on every plan, including Starter. Service accounts used by integrations do not consume a seat.</p></div>
        </div>
        <div class="acc-item" data-reveal style="--delay:120ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp3" id="ft3">Do you discount non-profits or early startups?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp3" role="region" aria-labelledby="ft3" hidden><p>Registered non-profits and accredited educational institutions get Growth free for two years. Companies under three years old that have raised less than $3M get 50% off any plan for three years. One application, no procurement process.</p></div>
        </div>
        <div class="acc-item" data-reveal style="--delay:180ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp4" id="ft4">What happens if I go over my seat count?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp4" role="region" aria-labelledby="ft4" hidden><p>Nothing breaks. Extra seats are billed at the per-extra-seat rate in the comparison table above, prorated to the day. We never deactivate someone's access because a headcount grew on the wrong day.</p></div>
        </div>
        <div class="acc-item" data-reveal style="--delay:240ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp5" id="ft5">Is cancellation self-serve?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp5" role="region" aria-labelledby="ft5" hidden><p>Two clicks: Settings, then Billing, then Cancel plan. There is no phone call and nobody will email you asking why. Your data stays exportable for 90 days afterwards, then it is deleted.</p></div>
        </div>
        <div class="acc-item" data-reveal style="--delay:300ms">
          <h3><button type="button" class="acc-trigger" aria-expanded="false" aria-controls="fp6" id="ft6">Will you migrate our existing data?<svg class="acc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div class="acc-panel" id="fp6" role="region" aria-labelledby="ft6" hidden><p>On Scale and Enterprise, yes, and it is included. We import from Looker, Tableau, Metabase, Mode and about thirty spreadsheet shapes. Typical engagements take four days and we hand you the mapping document afterwards.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta" id="cta" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="cta-inner" data-reveal>
        <div>
          <h2 id="cta-title">Start free, decide in fourteen days</h2>
          <p>Import one data source, build one dashboard, invite your team. If it does not earn its keep you will know inside a fortnight, and the guarantee covers the rest.</p>
          <ul class="cta-points">
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg>Free forever tier, 2 dashboards</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg>No card, no sales call, no onboarding fee</li>
            <li><svg class="mark is-yes" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#mark-yes"></use></svg>Import from 32 sources on every plan</li>
          </ul>
        </div>
        <form class="cta-form" id="cta-form" novalidate>
          <label class="field-label" for="cta-email">Work email</label>
          <div class="cta-row">
            <input type="email" id="cta-email" name="email" placeholder="you@company.com" autocomplete="email" required aria-describedby="cta-error" />
            <button type="submit" class="btn btn-primary">Create workspace</button>
          </div>
          <p class="field-error" id="cta-error" role="alert"></p>
          <p class="cta-status" id="cta-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer" id="footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#plans" aria-label="Cadence, return to the pricing plans">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false">
            <rect x="4" y="4" width="24" height="24" rx="7" stroke="currentColor" stroke-width="1.8"/>
            <path d="M11 20V12m5 8v-5m5 5v-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-text">Cadence</span>
      </a>
      <p class="footer-blurb">Revenue operations software for teams who would rather read the numbers than chase them. Built in Dublin.</p>
      <ul class="socials">
        <li><a href="#footer" aria-label="Cadence on X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4 4 20"/></svg></a></li>
        <li><a href="#footer" aria-label="Cadence on LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4"/></svg></a></li>
        <li><a href="#footer" aria-label="Cadence status page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="cf-product">
      <h2 id="cf-product">Product</h2>
      <ul>
        <li><a href="#plans">Pricing</a></li>
        <li><a href="#compare">Feature comparison</a></li>
        <li><a href="#guarantee">Guarantee</a></li>
        <li><a href="#faq">Billing FAQ</a></li>
        <li><a href="#footer">Integrations</a></li>
        <li><a href="#footer">Changelog</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="cf-company">
      <h2 id="cf-company">Company</h2>
      <ul>
        <li><a href="#footer">About Cadence</a></li>
        <li><a href="#footer">Customers</a></li>
        <li><a href="#footer">Careers</a></li>
        <li><a href="#footer">Grants programme</a></li>
        <li><a href="#footer">Press kit</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-labelledby="cf-legal">
      <h2 id="cf-legal">Trust</h2>
      <ul>
        <li><a href="#footer">Security overview</a></li>
        <li><a href="#footer">Sub-processors</a></li>
        <li><a href="#footer">Data processing addendum</a></li>
        <li><a href="#footer">Accessibility statement</a></li>
        <li><a href="#footer">Responsible disclosure</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <h2 id="cf-news">Product changelog</h2>
      <p>What shipped, every second Thursday. Written by the engineers who built it.</p>
      <form id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email for the changelog</label>
        <div class="news-row">
          <input type="email" id="footer-email" name="email" placeholder="you@company.com" aria-describedby="footer-status" required />
          <button type="submit" class="btn btn-primary btn-sm" aria-label="Subscribe to the changelog">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
        <p class="news-status" id="footer-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Cadence Analytics Ltd &middot; 42 Grand Canal Street Lower, Dublin 2</p>
    <ul class="legal">
      <li><a href="#footer">Privacy</a></li>
      <li><a href="#footer">Terms</a></li>
      <li><a href="#footer">DPA</a></li>
      <li><a href="#footer">Cookies</a></li>
      <li><a href="#footer">Status</a></li>
    </ul>
  </div>
</footer>

<button type="button" class="to-top" id="to-top" aria-label="Back to top" hidden>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
</button>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

@property --ring-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

:root {
  --font-display: 'Sora', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --bg: #f7f8fc;
  --bg-alt: #eef1f8;
  --surface: #ffffff;
  --surface-2: #fbfcff;
  --ink: #0f1729;
  --body: #4a5568;
  --muted: #77839a;
  --line: #e1e6f0;
  --line-soft: #edf0f6;

  --accent: #3d5afe;
  --accent-deep: #2438c9;
  --accent-2: #7c4dff;
  --accent-3: #00b8a9;
  --accent-ink: #2a41c4;
  --accent-soft: rgba(61, 90, 254, 0.09);
  --ring: rgba(61, 90, 254, 0.32);

  --ok: #0f7a4d;
  --danger: #b3283c;

  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;
  --pad-section: clamp(56px, 7vw, 104px);

  --r-sm: 8px; --r-md: 12px; --r-lg: 18px; --r-xl: 26px; --r-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(15, 23, 41, 0.05);
  --shadow-sm: 0 3px 10px rgba(15, 23, 41, 0.07), 0 1px 3px rgba(15, 23, 41, 0.05);
  --shadow-md: 0 14px 34px rgba(15, 23, 41, 0.10), 0 4px 10px rgba(15, 23, 41, 0.05);
  --shadow-lg: 0 28px 64px rgba(15, 23, 41, 0.16), 0 10px 22px rgba(15, 23, 41, 0.07);
  --shadow-accent: 0 16px 40px rgba(61, 90, 254, 0.26);

  --wrap: 1280px;
  --ease: cubic-bezier(0.22, 0.72, 0.24, 1);
  --dur: 0.28s;
  --header-h: 72px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0e1a;
    --bg-alt: #0e1424;
    --surface: #121a2c;
    --surface-2: #162034;
    --ink: #eef2fb;
    --body: #b3bed2;
    --muted: #8894ad;
    --line: rgba(160, 176, 208, 0.2);
    --line-soft: rgba(160, 176, 208, 0.1);
    --accent: #7d90ff;
    --accent-deep: #93a2ff;
    --accent-ink: #a9b6ff;
    --accent-soft: rgba(125, 144, 255, 0.13);
    --ring: rgba(125, 144, 255, 0.4);
    --ok: #63d9a4;
    --danger: #f28ea0;
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-sm: 0 3px 12px rgba(0, 0, 0, 0.45);
    --shadow-md: 0 16px 38px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 30px 70px rgba(0, 0, 0, 0.6);
    --shadow-accent: 0 16px 44px rgba(125, 144, 255, 0.28);
  }
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.62;
  color: var(--body);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3 { font-family: var(--font-display); color: var(--ink); line-height: 1.12; margin: 0; font-weight: 600; letter-spacing: -0.028em; }
h1 { font-size: clamp(2.3rem, 5.2vw, 3.9rem); }
h2 { font-size: clamp(1.8rem, 3.4vw, 2.7rem); }
h3 { font-size: clamp(1.02rem, 1.45vw, 1.22rem); }
p { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
svg { display: block; max-width: 100%; }
a { color: var(--accent-ink); text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
strong { color: var(--ink); font-weight: 600; }
blockquote { margin: 0; }

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(18px, 4vw, 40px); }
.svg-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--r-sm); }

.skip-link { position: absolute; left: 50%; top: 0; transform: translate(-50%, -160%); z-index: 400; padding: 12px 22px; border-radius: 0 0 var(--r-md) var(--r-md); background: var(--accent); color: #fff; font-weight: 600; font-size: 0.9rem; transition: transform var(--dur) var(--ease); }
.skip-link:focus { transform: translate(-50%, 0); }

/* ---------- buttons ---------- */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2); padding: 13px 24px; border: 1px solid transparent; border-radius: var(--r-pill); font-size: 0.94rem; font-weight: 600; cursor: pointer; position: relative; overflow: hidden; isolation: isolate; transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.btn::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(105deg, transparent 34%, rgba(255, 255, 255, 0.4) 50%, transparent 66%); transform: translateX(-140%); transition: transform 0.6s var(--ease); }
.btn:hover { transform: translateY(-2px); }
.btn:hover::after { transform: translateX(140%); }
.btn:active { transform: translateY(0); }
.btn .icon { width: 18px; height: 18px; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-deep); box-shadow: var(--shadow-accent); }
.btn-outline { background: transparent; border-color: var(--line); color: var(--ink); }
.btn-outline:hover { border-color: var(--accent); background: var(--accent-soft); box-shadow: var(--shadow-sm); }
.btn-sm { padding: 9px 18px; font-size: 0.85rem; }
.btn-block { width: 100%; }
.icon-btn { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); color: var(--ink); cursor: pointer; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.icon-btn svg { width: 21px; height: 21px; }
.icon-btn:hover { border-color: var(--accent); background: var(--accent-soft); }
.icon-btn:active { transform: scale(0.94); }

/* ---------- marks ---------- */
.mark { width: 19px; height: 19px; flex: none; }
.mark.is-yes { color: var(--accent); }
.mark.is-part { color: var(--muted); }
.mark.is-no { color: var(--muted); opacity: 0.75; }

/* ---------- header ---------- */
.site-header { position: sticky; top: 0; z-index: 120; background: color-mix(in srgb, var(--bg) 86%, transparent); backdrop-filter: saturate(150%) blur(14px); -webkit-backdrop-filter: saturate(150%) blur(14px); border-bottom: 1px solid transparent; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.site-header.is-scrolled { border-bottom-color: var(--line); box-shadow: var(--shadow-sm); }
.header-inner { display: flex; align-items: center; gap: var(--s-5); min-height: var(--header-h); }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); flex: none; }
.brand-mark { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 11px; background: linear-gradient(140deg, var(--accent), var(--accent-2)); color: #fff; transition: transform 0.55s var(--ease); }
.brand:hover .brand-mark { transform: rotate(-8deg) scale(1.05); }
.brand-mark svg { width: 23px; height: 23px; }
.brand-text { font-family: var(--font-display); font-size: 1.22rem; font-weight: 700; letter-spacing: -0.02em; }
.nav { display: flex; gap: 2px; margin-left: auto; }
.nav-link { padding: 9px 14px; border-radius: var(--r-pill); font-size: 0.92rem; font-weight: 500; color: var(--body); background-image: linear-gradient(var(--accent), var(--accent)); background-size: 0% 1.5px; background-position: 14px 100%; background-repeat: no-repeat; transition: color var(--dur) var(--ease), background-size var(--dur) var(--ease); }
.nav-link:hover { color: var(--ink); background-size: calc(100% - 28px) 1.5px; }
.nav-quiet { color: var(--muted); }
.header-actions { display: flex; align-items: center; gap: var(--s-3); flex: none; }
.nav-toggle { display: none; }
.mobile-nav { display: none; }

/* ---------- shared section bits ---------- */
.kicker { display: inline-block; margin-bottom: var(--s-3); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-ink); }
.section-title { margin-bottom: var(--s-4); max-width: 24ch; }
.section-sub { color: var(--muted); max-width: 60ch; }
.section-head { margin-bottom: clamp(28px, 4vw, 52px); max-width: 740px; }
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease) var(--delay, 0ms), transform 0.7s var(--ease) var(--delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------- hero / plans ---------- */
.plans { padding-block: clamp(48px, 6vw, 84px) var(--pad-section); }
.hero-head { text-align: center; max-width: 760px; margin-inline: auto; }
.hero-head .kicker { display: inline-block; }
.hero-head .lede { font-size: clamp(1rem, 1.4vw, 1.14rem); color: var(--muted); margin-inline: auto; max-width: 58ch; }

.billing-bar { display: flex; align-items: center; justify-content: center; gap: var(--s-3); margin-block: clamp(26px, 3.5vw, 42px) clamp(32px, 4vw, 56px); }
.billing-switch { border: 0; background: none; padding: 0; cursor: pointer; border-radius: var(--r-pill); }
.switch-track { display: block; width: 62px; height: 32px; padding: 3px; border-radius: var(--r-pill); background: var(--line); transition: background-color var(--dur) var(--ease); }
.billing-switch[aria-checked="true"] .switch-track { background: var(--accent); }
.switch-knob { display: block; width: 26px; height: 26px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow-sm); transform: translateX(0); transition: transform var(--dur) var(--ease); }
.billing-switch[aria-checked="true"] .switch-knob { transform: translateX(30px); }
.billing-label { font-size: 0.94rem; font-weight: 600; color: var(--muted); transition: color var(--dur) var(--ease); }
.billing-switch[aria-checked="false"] ~ .billing-label:first-of-type,
.billing-switch[aria-checked="true"] ~ .billing-yearly { color: var(--ink); }
.save-badge { padding: 4px 11px; border-radius: var(--r-pill); background: var(--ok); color: #fff; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease); }
.save-badge.is-off { opacity: 0.35; transform: scale(0.92); }

.plan-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s-4); align-items: start; }
.plan { position: relative; display: flex; flex-direction: column; padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--shadow-xs); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.plan:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
.plan.is-featured { border-color: transparent; box-shadow: var(--shadow-md); }
.plan.is-featured:hover { transform: translateY(-10px); box-shadow: var(--shadow-lg); }
.plan.is-featured::before {
  content: ""; position: absolute; inset: 0; padding: 2px; border-radius: inherit; pointer-events: none;
  background: conic-gradient(from var(--ring-angle), var(--accent), var(--accent-2), var(--accent-3), var(--accent));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: spinRing 7s linear infinite;
}
.plan-flag { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); padding: 5px 15px; border-radius: var(--r-pill); background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #fff; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; box-shadow: var(--shadow-accent); }
.plan-head { min-height: 82px; }
.plan-head h2 { font-size: 1.32rem; margin-bottom: 6px; }
.plan-for { font-size: 0.86rem; color: var(--muted); }

.price { display: flex; align-items: flex-end; gap: 3px; margin-block: var(--s-4) 6px; }
.price .cur { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--muted); align-self: flex-start; margin-top: 8px; }
.price .amount { font-family: var(--font-display); font-size: clamp(2.5rem, 3.6vw, 3.2rem); font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -0.045em; font-variant-numeric: tabular-nums; transition: color var(--dur) var(--ease); }
.price .amount.is-bumping { color: var(--accent); }
.price .per { font-size: 0.78rem; line-height: 1.3; color: var(--muted); padding-bottom: 3px; }
.price-custom .amount-word { font-size: clamp(2.1rem, 3vw, 2.7rem); }
.bill { min-height: 2.4em; font-size: 0.8rem; color: var(--muted); }
.saving { margin-top: 4px; font-size: 0.8rem; font-weight: 600; color: var(--ok); }
.saving[hidden] { display: none; }
.fine { margin-top: 8px; font-size: 0.76rem; color: var(--muted); }
.includes { margin-block: var(--s-4) var(--s-2); padding-top: var(--s-4); border-top: 1px solid var(--line-soft); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.plan-features { display: grid; gap: 9px; }
.plan-features li { display: flex; align-items: flex-start; gap: 9px; font-size: 0.86rem; line-height: 1.45; }
.plan-features .mark { margin-top: 1px; }
.plans-foot { margin-top: var(--s-6); text-align: center; font-size: 0.84rem; color: var(--muted); }
.plans-foot a { text-decoration: underline; }

/* ---------- guarantee ---------- */
.guarantee { padding-block: 0 var(--pad-section); }
.guarantee-strip { display: grid; grid-template-columns: auto minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--s-5); align-items: center; padding: clamp(22px, 3vw, 36px); border: 1px solid var(--accent); border-radius: var(--r-xl); background: var(--accent-soft); }
.g-icon { display: grid; place-items: center; width: 58px; height: 58px; border-radius: var(--r-lg); background: var(--accent); color: #fff; animation: floatY 7s ease-in-out infinite; }
.g-icon svg { width: 30px; height: 30px; }
.guarantee-strip h2 { font-size: clamp(1.2rem, 2vw, 1.6rem); margin-bottom: 6px; }
.guarantee-strip p { font-size: 0.92rem; }
.trust { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: var(--s-3); }
.trust li { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 600; color: var(--body); }
.trust svg { width: 17px; height: 17px; color: var(--accent); flex: none; }

/* ---------- logos ---------- */
.logos { padding-block: var(--s-6) var(--pad-section); }
.logos-title { text-align: center; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: var(--s-5); }
.logo-marquee { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.logo-track { display: flex; width: max-content; animation: marquee 36s linear infinite; }
.logo-marquee:hover .logo-track { animation-duration: 72s; }
.logo-row { display: flex; align-items: center; gap: clamp(26px, 4vw, 62px); padding-right: clamp(26px, 4vw, 62px); }
.logo-row li { font-family: var(--font-display); font-size: clamp(0.95rem, 1.5vw, 1.22rem); font-weight: 700; letter-spacing: 0.06em; color: var(--muted); white-space: nowrap; transition: color var(--dur) var(--ease); }
.logo-row li:hover { color: var(--accent-ink); }

/* ---------- compare table ---------- */
.compare { padding-block: 0 var(--pad-section); }
.compare-tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-4); margin-bottom: var(--s-5); }
.toggle { display: inline-flex; align-items: center; gap: var(--s-3); cursor: pointer; font-size: 0.88rem; font-weight: 600; color: var(--ink); }
.toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.toggle-track { display: block; width: 46px; height: 26px; padding: 3px; border-radius: var(--r-pill); background: var(--line); transition: background-color var(--dur) var(--ease); }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle input:focus-visible + .toggle-track { outline: 2px solid var(--accent); outline-offset: 3px; }
.toggle-knob { display: block; width: 20px; height: 20px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow-xs); transition: transform var(--dur) var(--ease); }
.toggle input:checked + .toggle-track .toggle-knob { transform: translateX(20px); }
.diff-count { font-size: 0.84rem; color: var(--muted); }

.table-shell { border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--shadow-sm); overflow: hidden; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.compare-table th, .compare-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--line-soft); }
.compare-table thead th { position: sticky; top: var(--header-h); z-index: 2; background: var(--surface-2); font-family: var(--font-display); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
.compare-table tbody th { font-weight: 600; color: var(--ink); }
.compare-table tbody td { color: var(--body); }
.compare-table tbody tr:last-child th, .compare-table tbody tr:last-child td { border-bottom: 0; }
.compare-table tbody tr { transition: background-color var(--dur) var(--ease), opacity var(--dur) var(--ease); }
.compare-table tbody tr:hover { background: var(--accent-soft); }
.compare-table tbody tr.is-same { opacity: 0.42; }
.compare-table tbody tr[hidden] { display: none; }
.compare-table .is-featured-col { background: var(--accent-soft); }
.compare-table thead .is-featured-col { color: var(--accent-ink); }
.compare-table td .mark { display: inline-block; vertical-align: middle; }

/* ---------- proof ---------- */
.proof { padding-block: var(--pad-section); background: var(--bg-alt); border-block: 1px solid var(--line-soft); }
.quote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: var(--s-4); }
.quote-grid > li { display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-5); border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.quote-grid > li:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.quote-grid blockquote p { font-family: var(--font-display); font-size: 1.04rem; line-height: 1.45; color: var(--ink); }
.quote-by { margin-top: auto; font-size: 0.85rem; }
.quote-by span { display: block; color: var(--muted); font-size: 0.82rem; }
.stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: var(--s-4); margin-top: var(--s-6); padding-top: var(--s-6); border-top: 1px solid var(--line); }
.stat-num { display: block; font-family: var(--font-display); font-size: clamp(1.7rem, 2.8vw, 2.4rem); font-weight: 700; color: var(--accent-ink); letter-spacing: -0.03em; line-height: 1; }
.stat-label { display: block; margin-top: 7px; font-size: 0.83rem; color: var(--muted); }

/* ---------- faq ---------- */
.faq { padding-block: var(--pad-section); }
.faq-grid { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(28px, 4vw, 60px); align-items: start; }
.faq-head { position: sticky; top: calc(var(--header-h) + 22px); }
.accordion { display: grid; gap: var(--s-2); }
.acc-item { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); overflow: hidden; transition: border-color var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.acc-item:hover { border-color: var(--accent); }
.acc-item.is-open { border-color: var(--accent); background: var(--accent-soft); }
.acc-item h3 { margin: 0; }
.acc-trigger { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); width: 100%; padding: var(--s-4) var(--s-5); border: 0; background: transparent; text-align: left; font-family: var(--font-display); font-size: clamp(0.96rem, 1.3vw, 1.08rem); font-weight: 600; color: var(--ink); cursor: pointer; transition: color var(--dur) var(--ease); }
.acc-trigger:hover { color: var(--accent-ink); }
.acc-caret { width: 20px; height: 20px; flex: none; color: var(--muted); transition: transform var(--dur) var(--ease), color var(--dur) var(--ease); }
.acc-trigger[aria-expanded="true"] .acc-caret { transform: rotate(180deg); color: var(--accent); }
.acc-panel { padding: 0 var(--s-5) var(--s-5); animation: accOpen 0.32s var(--ease) both; }
.acc-panel[hidden] { display: none; }
.acc-panel p { font-size: 0.92rem; }

/* ---------- cta ---------- */
.cta { padding-block: 0 var(--pad-section); }
.cta-inner { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: clamp(28px, 4vw, 58px); align-items: center; padding: clamp(26px, 4vw, 54px); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--shadow-md); }
.cta-inner h2 { margin-bottom: var(--s-3); }
.cta-inner p { font-size: 0.95rem; }
.cta-points { display: grid; gap: 8px; margin-top: var(--s-4); }
.cta-points li { display: flex; align-items: center; gap: 9px; font-size: 0.88rem; }
.field-label { display: block; margin-bottom: var(--s-2); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.cta-row { display: flex; gap: var(--s-2); }
.cta-row input { flex: 1; min-width: 0; padding: 13px 16px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface-2); transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.cta-row input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px var(--ring); }
.cta-row input[aria-invalid="true"] { border-color: var(--danger); }
.field-error { margin-top: 8px; min-height: 1.2em; font-size: 0.82rem; font-weight: 600; color: var(--danger); }
.field-error:empty { display: none; }
.cta-status { margin-top: 8px; min-height: 1.2em; font-size: 0.84rem; font-weight: 600; color: var(--ok); }

/* ---------- footer ---------- */
.site-footer { background: var(--surface-2); border-top: 1px solid var(--line); }
.footer-top { display: grid; grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 0.8fr)) minmax(0, 1.15fr); gap: clamp(22px, 3vw, 42px); padding-block: var(--s-8); }
.footer-blurb { margin-block: var(--s-4); max-width: 34ch; font-size: 0.88rem; color: var(--muted); }
.socials { display: flex; gap: var(--s-2); }
.socials a { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--line); border-radius: var(--r-md); color: var(--body); transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease), background-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
.socials svg { width: 18px; height: 18px; }
.socials a:hover { color: #fff; background: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.footer-col h2 { font-family: var(--font-text); font-size: 0.76rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink); margin-bottom: var(--s-4); }
.footer-col ul { display: grid; gap: 9px; }
.footer-col a { font-size: 0.88rem; color: var(--body); transition: color var(--dur) var(--ease), padding-left var(--dur) var(--ease); }
.footer-col a:hover { color: var(--accent-ink); padding-left: 5px; }
.footer-col p { font-size: 0.86rem; color: var(--muted); margin-bottom: var(--s-3); }
.news-row { display: flex; gap: var(--s-2); }
.news-row input { flex: 1; min-width: 0; padding: 10px 14px; border: 1px solid var(--line); border-radius: var(--r-pill); background: var(--surface); font-size: 0.88rem; transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.news-row input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px var(--ring); }
.news-row .btn { flex: none; padding-inline: 15px; }
.news-status { margin-top: 8px; min-height: 1.2em; font-size: 0.8rem; font-weight: 600; color: var(--muted); }
.news-status.is-ok { color: var(--ok); }
.news-status.is-bad { color: var(--danger); }
.footer-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-4); padding-block: var(--s-5); border-top: 1px solid var(--line-soft); font-size: 0.82rem; color: var(--muted); }
.legal { display: flex; flex-wrap: wrap; gap: var(--s-4); }
.legal a { color: var(--muted); }
.legal a:hover { color: var(--accent-ink); }

/* ---------- to top ---------- */
.to-top { position: fixed; right: clamp(14px, 3vw, 28px); bottom: clamp(14px, 3vw, 28px); z-index: 110; display: grid; place-items: center; width: 46px; height: 46px; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--ink); box-shadow: var(--shadow-md); cursor: pointer; transition: transform var(--dur) var(--ease), background-color var(--dur) var(--ease), color var(--dur) var(--ease); animation: popIn 0.32s var(--ease) both; }
.to-top[hidden] { display: none; }
.to-top svg { width: 20px; height: 20px; }
.to-top:hover { background: var(--accent); color: #fff; transform: translateY(-3px); }

/* ---------- responsive ---------- */
@media (max-width: 1180px) {
  .plan-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .guarantee-strip { grid-template-columns: auto minmax(0, 1fr); }
  .guarantee-strip .trust { grid-column: 1 / -1; }
  .footer-top { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 900px) {
  :root { --header-h: 64px; }
  .nav { display: none; }
  .nav-quiet { display: none; }
  .nav-toggle { display: inline-grid; }
  .mobile-nav { display: grid; gap: 4px; padding: var(--s-4) clamp(18px, 4vw, 40px) var(--s-5); background: var(--surface); border-bottom: 1px solid var(--line); box-shadow: var(--shadow-md); }
  .mobile-nav[hidden] { display: none; }
  .mobile-nav .nav-link { padding: 12px 14px; font-size: 1rem; background-size: 0 1.5px; }
  .mobile-nav .btn { margin-top: var(--s-3); }
  .faq-grid, .cta-inner { grid-template-columns: 1fr; }
  .faq-head { position: static; }
  .compare-table thead th { position: static; }
  .footer-top { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .plan-grid { grid-template-columns: 1fr; }
  .plan-head { min-height: 0; }
  .guarantee-strip { grid-template-columns: 1fr; text-align: left; }
  .cta-row { flex-direction: column; }
  .cta-row .btn { width: 100%; }

  .compare-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .compare-table, .compare-table tbody, .compare-table tr, .compare-table th, .compare-table td { display: block; width: 100%; }
  .compare-table tr { padding: var(--s-4); border-bottom: 1px solid var(--line-soft); }
  .compare-table tbody tr:last-child { border-bottom: 0; }
  .compare-table tbody th { padding: 0 0 var(--s-3); border-bottom: 0; font-size: 1rem; }
  .compare-table td { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: 7px 0; border-bottom: 0; }
  .compare-table td::before { content: attr(data-label); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .compare-table .is-featured-col { background: transparent; box-shadow: none; }
  .compare-table tbody tr.is-featured-card { background: var(--accent-soft); border-radius: var(--r-md); }
}

@media (max-width: 560px) {
  .footer-top { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .billing-bar { flex-wrap: wrap; }
  .section-title { max-width: none; }
  .header-actions .btn { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  [data-reveal] { opacity: 1; transform: none; }
  .plan.is-featured::before { animation: none !important; }
  .logo-track, .g-icon { animation: none !important; }
}

/* ---------- keyframes ---------- */
@keyframes spinRing { to { --ring-angle: 360deg; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes accOpen { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
`,
  javascript: `
'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function withCommas(n) { return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }
  function fmt(n, d) {
    var s = Number(n).toFixed(d);
    var parts = s.split('.');
    return withCommas(parts[0]) + (parts[1] ? '.' + parts[1] : '');
  }

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

  /* ---------------- header + to top ---------------- */
  var header = $('#site-header');
  var toTop = $('#to-top');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) { header.classList.toggle('is-scrolled', y > 8); }
    if (toTop) { toTop.hidden = y < 620; }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

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
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.length < 2) { return; }
      var target = document.getElementById(href.slice(1));
      if (!target) { return; }
      e.preventDefault();
      setNav(false);
      var offset = (header ? header.offsetHeight : 0) + 10;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- counters ---------------- */
  function paintCounter(el) {
    var target = parseFloat(el.getAttribute('data-count') || '0');
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    el.textContent = fmt(target, d);
  }
  var counters = $$('.counter');
  if (reduce || !('IntersectionObserver' in window)) {
    counters.forEach(paintCounter);
  } else {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        co.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count') || '0');
        var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var t0 = null;
        var dur = 1400;
        function step(ts) {
          if (t0 === null) { t0 = ts; }
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased, d);
          if (p < 1) { window.requestAnimationFrame(step); }
          else { paintCounter(el); }
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------------- billing toggle ---------------- */
  var sw = $('#billing-switch');
  var badge = $('#save-badge');
  var amounts = $$('.amount[data-monthly]');
  var bills = $$('[data-bill]');
  var savings = $$('[data-saving]');
  var yearly = false;

  function tweenAmount(el, to) {
    var from = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
    if (reduce || from === to) {
      el.textContent = String(to);
      return;
    }
    el.classList.add('is-bumping');
    var t0 = null;
    var dur = 420;
    function step(ts) {
      if (t0 === null) { t0 = ts; }
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) { window.requestAnimationFrame(step); }
      else { el.textContent = String(to); el.classList.remove('is-bumping'); }
    }
    window.requestAnimationFrame(step);
  }

  function applyBilling() {
    amounts.forEach(function (el) {
      var m = parseInt(el.getAttribute('data-monthly'), 10);
      var y = parseInt(el.getAttribute('data-yearly'), 10);
      tweenAmount(el, yearly ? y : m);
    });

    bills.forEach(function (el) {
      if (el.closest && el.closest('.plan-enterprise')) {
        el.textContent = 'Minimum 200 seats, invoiced annually.';
        return;
      }
      el.textContent = yearly
        ? 'Billed annually as one invoice.'
        : 'Billed monthly. Cancel any time.';
    });

    savings.forEach(function (el) {
      var wrap = el.closest ? el.closest('.plan') : null;
      var amount = wrap ? $('.amount[data-monthly]', wrap) : null;
      if (!amount) { el.hidden = true; return; }
      var m = parseInt(amount.getAttribute('data-monthly'), 10);
      var y = parseInt(amount.getAttribute('data-yearly'), 10);
      var per = m - y;
      if (yearly && per > 0) {
        el.hidden = false;
        el.textContent = 'Saves $' + per + ' per user per month \\u2014 $' + withCommas(per * 12) + ' a year.';
      } else {
        el.hidden = true;
        el.textContent = '';
      }
    });

    if (badge) { badge.classList.toggle('is-off', !yearly); }
    if (sw) { sw.setAttribute('aria-checked', yearly ? 'true' : 'false'); }
  }

  if (sw) {
    sw.addEventListener('click', function () {
      yearly = !yearly;
      applyBilling();
    });
  }
  applyBilling();

  /* ---------------- compare: differences only ---------------- */
  var diffToggle = $('#diff-only');
  var diffCount = $('#diff-count');
  var rows = $$('.compare-table tbody tr');

  function rowIsSame(row) {
    var cells = $$('td', row);
    if (cells.length < 2) { return false; }
    var first = (cells[0].textContent || '').trim();
    for (var i = 1; i < cells.length; i++) {
      if ((cells[i].textContent || '').trim() !== first) { return false; }
    }
    return true;
  }

  function applyDiff() {
    var on = diffToggle ? diffToggle.checked : false;
    var shown = 0;
    rows.forEach(function (row) {
      var same = rowIsSame(row);
      row.classList.toggle('is-same', same);
      if (on && same) {
        row.hidden = true;
      } else {
        row.hidden = false;
        shown += 1;
      }
    });
    if (diffCount) {
      diffCount.textContent = shown + ' of ' + rows.length + ' rows shown' + (on ? ' \\u2014 differences only' : '');
    }
  }
  if (diffToggle) { diffToggle.addEventListener('change', applyDiff); }
  applyDiff();

  /* ---------------- accordion ---------------- */
  var triggers = $$('.acc-trigger');
  function closeItem(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'false');
    if (panel) { panel.hidden = true; }
    var item = btn.closest ? btn.closest('.acc-item') : null;
    if (item) { item.classList.remove('is-open'); }
  }
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      triggers.forEach(closeItem);
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
      if (btn.getAttribute('aria-expanded') === 'true') { closeItem(btn); btn.focus(); }
    });
  });

  /* ---------------- cta email form ---------------- */
  var FREE_MAIL = /(^|\\.)(gmail|yahoo|hotmail|outlook|proton(mail)?|icloud)\\./i;
  var ctaForm = $('#cta-form');
  var ctaEmail = $('#cta-email');
  var ctaErr = $('#cta-error');
  var ctaStatus = $('#cta-status');

  function ctaError(msg) {
    if (ctaErr) { ctaErr.textContent = msg; }
    if (ctaEmail) {
      if (msg) { ctaEmail.setAttribute('aria-invalid', 'true'); }
      else { ctaEmail.removeAttribute('aria-invalid'); }
    }
  }

  if (ctaForm && ctaEmail) {
    ctaEmail.addEventListener('input', function () { ctaError(''); });
    ctaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = ctaEmail.value.trim();
      if (!v) { ctaError('Enter your work email to create a workspace.'); ctaEmail.focus(); return; }
      if (!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(v)) { ctaError('That email address is not valid.'); ctaEmail.focus(); return; }
      if (FREE_MAIL.test(v)) { ctaError('Use a work email so your whole team can be invited later.'); ctaEmail.focus(); return; }
      ctaError('');
      if (ctaStatus) {
        ctaStatus.textContent = 'Workspace queued. Check ' + v.split('@')[1] + ' for the invite \\u2014 it is good for 14 days.';
      }
      ctaForm.reset();
    });
  }

  /* ---------------- footer notes ---------------- */
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
      footerStatus.textContent = 'Subscribed. Next changelog on 9 April 2026.';
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
