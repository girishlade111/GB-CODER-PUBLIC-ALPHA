export default {
  html: `
<div class="legal-app" id="top">
  <!-- Top Bar -->
  <div class="legal-topbar">
    <span>NEW YORK • LONDON • SINGAPORE • ZURICH • TOKYO • SAN FRANCISCO</span>
    <span class="top-phone">Direct Advisory: +1 (212) 890-4200</span>
  </div>

  <!-- Navigation -->
  <nav class="legal-nav">
    <div class="nav-container">
      <div class="brand">
        <span class="brand-crest">⚖️</span>
        <div>
          <span class="brand-name">Vanguard & Sterling</span>
          <span class="brand-tag">GLOBAL COUNSEL LLP</span>
        </div>
      </div>

      <div class="nav-links">
        <a href="#practices" class="nav-a">Practices</a>
        <a href="#attorneys" class="nav-a">Partners</a>
        <a href="#calculator" class="nav-a">Fee Estimator</a>
        <a href="#inquiry" class="nav-a">Consultation</a>
      </div>

      <button class="btn btn-gold" id="btn-request-consult">Confidential Intake</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-content">
      <span class="sub-label">TRANSACTIONAL EXCELLENCE & DEFENSE</span>
      <h1 class="hero-h1">Strategic legal counsel for landmark transactions and critical disputes.</h1>
      <p class="hero-p">
        Guiding sovereign funds, Fortune 100 enterprises, and premier technology founders through multi-jurisdictional M&A, venture formation, and regulatory defense.
      </p>

      <div class="stats-row">
        <div class="s-col">
          <div class="s-num">$84B+</div>
          <div class="s-lbl">Closed Cross-Border Deals</div>
        </div>
        <div class="s-col">
          <div class="s-num">140+</div>
          <div class="s-lbl">Global Partners Across 6 Continents</div>
        </div>
        <div class="s-col">
          <div class="s-num">Top Tier</div>
          <div class="s-lbl">Chambers & Partners Band 1</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Practice Areas -->
  <section class="section-practices" id="practices">
    <div class="sec-head">
      <span class="sec-sub">CORE CAPABILITIES</span>
      <h2 class="sec-title">Disciplines & Sector Expertise</h2>
    </div>

    <div class="practices-grid">
      <div class="practice-card">
        <div class="p-num">01</div>
        <h3 class="p-name">Cross-Border Mergers & Acquisitions</h3>
        <p class="p-text">Structuring multi-billion dollar public takeovers, private equity carve-outs, and cross-border joint ventures.</p>
        <span class="p-tag">Strategic Transactions</span>
      </div>

      <div class="practice-card">
        <div class="p-num">02</div>
        <h3 class="p-name">Venture Financing & Founder Equity</h3>
        <p class="p-text">Representation from Series Seed through IPO governance, dual-class voting structures, and liquidity events.</p>
        <span class="p-tag">Emerging Growth</span>
      </div>

      <div class="practice-card">
        <div class="p-num">03</div>
        <h3 class="p-name">IP Strategy & Patent Litigation</h3>
        <p class="p-text">Global patent prosecution, trade secret defense, and complex technology transfer licensing agreements.</p>
        <span class="p-tag">Intellectual Property</span>
      </div>

      <div class="practice-card">
        <div class="p-num">04</div>
        <h3 class="p-name">SEC & Antitrust Enforcement Defense</h3>
        <p class="p-text">Internal investigations, DOJ/SEC white-collar defense, and international regulatory compliance audits.</p>
        <span class="p-tag">Regulatory & Defense</span>
      </div>
    </div>
  </section>

  <!-- Interactive Advisory Fee Estimator -->
  <section class="section-calc" id="calculator">
    <div class="calc-panel">
      <div class="calc-head">
        <div>
          <span class="sec-sub">TRANSACTION BUDGETING</span>
          <h2 class="sec-title" style="margin-bottom:0;">Estimated Advisory Horizon & Retainer</h2>
        </div>
        <span class="confidential-pill">🔒 Attorney-Client Privileged Estimate</span>
      </div>

      <div class="calc-grid">
        <div class="calc-inputs">
          <div class="field-wrap">
            <label>Transaction Classification:</label>
            <select id="deal-type" class="legal-select">
              <option value="venture">Series A / B Venture Financing</option>
              <option value="ma" selected>Cross-Border Corporate M&A ($20M — $100M)</option>
              <option value="ip">Global Patent Portfolio Prosecution</option>
              <option value="audit">Internal Regulatory & SEC Compliance Audit</option>
            </select>
          </div>

          <div class="field-wrap">
            <label>Anticipated Deal Horizon:</label>
            <select id="deal-horizon" class="legal-select">
              <option value="fast">Accelerated (30 Days)</option>
              <option value="standard" selected>Standard Due Diligence (60 — 90 Days)</option>
              <option value="extended">Comprehensive Cross-Border (6+ Months)</option>
            </select>
          </div>
        </div>

        <div class="calc-results">
          <div class="res-box">
            <span class="res-lbl">Estimated Advisory Retainer Bracket:</span>
            <div class="res-val" id="fee-bracket">$65,000 — $95,000</div>
            <p class="res-desc" id="fee-desc">Includes full due diligence data room audit, definitive merger agreement drafting, and regulatory filing filings.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="legal-toast" id="legal-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #0a0c12;
  --bg-panel: rgba(16, 20, 30, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --gold: #d4af37;
  --gold-light: #fef3c7;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.legal-app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Topbar */
.legal-topbar {
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 1px;
}
.top-phone { color: var(--gold); font-weight: 700; }

/* Nav */
.legal-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 12, 18, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 50px;
}
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand-crest { font-size: 24px; }
.brand-name { font-size: 18px; font-weight: 800; font-family: var(--font-serif); color: #fff; display: block; }
.brand-tag { font-size: 9px; letter-spacing: 2px; color: var(--gold); font-weight: 700; }

.nav-links { display: flex; gap: 24px; }
.nav-a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 600; transition: color 0.2s; }
.nav-a:hover { color: #fff; }

.btn { padding: 9px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; letter-spacing: 0.5px; }
.btn-gold { background: var(--gold); color: #000; font-weight: 800; }
.btn-gold:hover { background: #e5c158; }

/* Hero */
.hero-section { margin-bottom: 70px; max-width: 900px; }
.sub-label { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: var(--gold); display: block; margin-bottom: 14px; font-family: var(--font-mono); }
.hero-h1 { font-size: 46px; font-weight: 800; font-family: var(--font-serif); line-height: 1.2; color: #fff; margin-bottom: 24px; }
.hero-p { font-size: 17px; color: var(--text-muted); line-height: 1.7; margin-bottom: 36px; }

.stats-row { display: flex; gap: 48px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 24px 0; }
.s-num { font-size: 32px; font-weight: 800; font-family: var(--font-serif); color: #fff; margin-bottom: 4px; }
.s-lbl { font-size: 11px; color: var(--text-muted); letter-spacing: 0.5px; }

/* Practices */
.section-practices { margin-bottom: 80px; }
.sec-head { margin-bottom: 32px; }
.sec-sub { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--gold); display: block; margin-bottom: 8px; font-family: var(--font-mono); }
.sec-title { font-size: 28px; font-weight: 800; font-family: var(--font-serif); color: #fff; }

.practices-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.practice-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 32px;
  transition: transform 0.2s, border-color 0.2s;
}
.practice-card:hover { transform: translateY(-3px); border-color: rgba(212, 175, 55, 0.4); }
.p-num { font-size: 12px; font-family: var(--font-mono); color: var(--gold); font-weight: 800; margin-bottom: 10px; }
.p-name { font-size: 20px; font-weight: 800; font-family: var(--font-serif); color: #fff; margin-bottom: 10px; }
.p-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
.p-tag { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #cbd5e1; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }

/* Calculator */
.calc-panel { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 36px; }
.calc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.confidential-pill { font-size: 11px; color: var(--gold); background: rgba(212, 175, 55, 0.1); padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.2); }
.calc-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 36px; align-items: center; }
.field-wrap { margin-bottom: 16px; }
.field-wrap label { font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px; }
.legal-select {
  width: 100%;
  background: #090b10;
  border: 1px solid var(--border);
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}
.res-box { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 24px; }
.res-lbl { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 8px; }
.res-val { font-size: 28px; font-weight: 800; font-family: var(--font-serif); color: var(--gold); margin-bottom: 10px; }
.res-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

/* Toast */
.legal-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1a1810;
  border: 1px solid var(--gold);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .hero-h1 { font-size: 32px; }
  .stats-row, .practices-grid, .calc-grid { grid-template-columns: 1fr; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('legal-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  const feeData = {
    venture: { bracket: '$35,000 — $50,000', desc: 'Standard Series A/B founder financing package: NVCA-compliant documentation, investor rights agreements, and closing opinion letters.' },
    ma: { bracket: '$65,000 — $95,000', desc: 'Includes full due diligence data room audit, definitive merger agreement drafting, and regulatory filings.' },
    ip: { bracket: '$40,000 — $60,000', desc: 'Global multi-jurisdictional patent prosecution strategy, prior art landscape mapping, and USPTO/EPO submissions.' },
    audit: { bracket: '$50,000 — $80,000', desc: 'Confidential internal compliance investigation, SEC disclosure review, and executive officer indemnification assessment.' }
  };

  const dealType = document.getElementById('deal-type');
  const feeBracket = document.getElementById('fee-bracket');
  const feeDesc = document.getElementById('fee-desc');

  if (dealType) {
    dealType.addEventListener('change', () => {
      const val = dealType.value;
      const data = feeData[val];
      if (data && feeBracket && feeDesc) {
        feeBracket.textContent = data.bracket;
        feeDesc.textContent = data.desc;
        showToast('Updated retainer estimation bracket');
      }
    });
  }

  document.getElementById('btn-request-consult')?.addEventListener('click', () => {
    showToast('Privileged consultation intake request initiated. Partner callback scheduled within 2 hours.');
  });
})();
`
};
