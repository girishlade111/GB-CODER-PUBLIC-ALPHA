export default {
  html: `
<div class="fintech-app" id="top">
  <!-- Nav -->
  <nav class="fintech-nav">
    <div class="nav-container">
      <div class="brand">
        <div class="brand-glyph">✦</div>
        <span class="brand-text">Starlight<span class="brand-dot">Pay</span></span>
      </div>

      <div class="nav-links">
        <a href="#card-studio" class="nav-a">Virtual Cards</a>
        <a href="#calculator" class="nav-a">ROI Calculator</a>
        <a href="#api-runner" class="nav-a">Developer API</a>
        <a href="#ledger" class="nav-a">Global Rails</a>
      </div>

      <div class="nav-right">
        <button class="btn btn-outline" id="btn-login">Sign In</button>
        <button class="btn btn-gradient" id="btn-get-keys">Get API Keys</button>
      </div>
    </div>
  </nav>

  <!-- Hero Section with Interactive Card -->
  <section class="hero-section">
    <div class="hero-left">
      <div class="badge-fintech">
        <span class="badge-dot"></span>
        Next-Gen Global Payment Rails
      </div>
      <h1 class="hero-h1">Programmable money for <span class="gradient-text">hyper-growth companies</span>.</h1>
      <p class="hero-p">
        Issue virtual and physical corporate charge cards, execute instant cross-border treasury settlements, and automate reconciliations with a unified REST & GraphQL API.
      </p>

      <div class="hero-stats">
        <div class="stat-col">
          <div class="stat-big">180+</div>
          <div class="stat-desc">Countries Supported</div>
        </div>
        <div class="stat-col">
          <div class="stat-big">0.15%</div>
          <div class="stat-desc">Flat Global FX Rate</div>
        </div>
        <div class="stat-col">
          <div class="stat-big">T+0</div>
          <div class="stat-desc">Instant Settlement</div>
        </div>
      </div>
    </div>

    <!-- Interactive Virtual Card Visualizer -->
    <div class="hero-right" id="card-studio">
      <div class="card-visualizer-box">
        <div class="card-theme-selector">
          <span class="selector-label">Choose Card Aesthetic:</span>
          <button class="theme-btn active" data-theme="obsidian">Obsidian Matte</button>
          <button class="theme-btn" data-theme="titanium">Titanium White</button>
          <button class="theme-btn" data-theme="cyber">Cyber Cyan</button>
        </div>

        <div class="fintech-card theme-obsidian" id="virtual-card">
          <div class="card-top">
            <span class="card-chip"></span>
            <span class="card-network">VISA Infinite</span>
          </div>
          <div class="card-number" id="card-num-display">•••• •••• •••• 9412</div>
          <div class="card-bottom">
            <div>
              <div class="card-lbl">CARDHOLDER</div>
              <div class="card-val">ELENA ROSTOVA</div>
            </div>
            <div>
              <div class="card-lbl">EXP</div>
              <div class="card-val">10/29</div>
            </div>
            <div class="card-status-pill">ACTIVE</div>
          </div>
        </div>

        <div class="card-controls">
          <button class="btn btn-outline btn-sm" id="btn-reveal-card">👁️ Reveal Details</button>
          <button class="btn btn-outline btn-sm" id="btn-freeze-card">❄️ Freeze Card</button>
          <button class="btn btn-outline btn-sm" id="btn-new-card">✨ Issue New Card</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive ROI & Savings Calculator -->
  <section class="section-calc" id="calculator">
    <div class="calc-panel">
      <div class="calc-header">
        <span class="calc-sub">SAVINGS & MARGIN CALCULATOR</span>
        <h2 class="calc-title">How much does Starlight save your engineering team?</h2>
      </div>

      <div class="calc-body">
        <div class="slider-side">
          <div class="slider-meta">
            <span class="slider-label">Annual Payment Processing Volume:</span>
            <span class="slider-val" id="volume-val">$10,000,000</span>
          </div>
          <input type="range" id="volume-slider" min="1000000" max="50000000" step="1000000" value="10000000" />
          <div class="slider-ticks">
            <span>$1M</span>
            <span>$10M</span>
            <span>$25M</span>
            <span>$50M+</span>
          </div>
        </div>

        <div class="results-side">
          <div class="result-tile">
            <span class="result-lbl">Estimated Annual Interchange Savings:</span>
            <span class="result-num" id="savings-val">$145,000</span>
          </div>
          <div class="result-tile">
            <span class="result-lbl">DevOps & Reconciliation Hours Saved:</span>
            <span class="result-num" id="hours-val">1,200 hrs / yr</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Developer API Runner -->
  <section class="section-api" id="api-runner">
    <div class="api-panel">
      <div class="api-nav">
        <div class="api-tabs">
          <button class="api-tab active" data-lang="curl">cURL</button>
          <button class="api-tab" data-lang="node">Node.js</button>
          <button class="api-tab" data-lang="python">Python</button>
        </div>
        <button class="btn btn-gradient btn-sm" id="btn-run-api">Send Sandbox Request 🚀</button>
      </div>

      <div class="api-body-grid">
        <div class="code-column">
          <pre class="code-pre" id="api-code-view"></pre>
        </div>
        <div class="response-column">
          <div class="response-header">
            <span class="res-status" id="res-status">STATUS: 200 OK (38ms)</span>
            <span class="res-auth">idempotency-key: ak_9f1a28</span>
          </div>
          <pre class="response-pre" id="api-res-view"></pre>
        </div>
      </div>
    </div>
  </section>

  <div class="fintech-toast" id="fintech-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #080a11;
  --bg-panel: rgba(14, 18, 28, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #06b6d4;
  --accent-purple: #8b5cf6;
  --accent-emerald: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.fintech-app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Nav */
.fintech-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(8, 10, 17, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 40px;
}
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-glyph { font-size: 20px; color: var(--accent-cyan); }
.brand-text { font-size: 17px; font-weight: 800; color: #fff; }
.brand-dot { color: var(--accent-cyan); }
.nav-links { display: flex; gap: 24px; }
.nav-a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
.nav-a:hover { color: #fff; }
.nav-right { display: flex; gap: 10px; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.btn-sm { padding: 6px 12px; font-size: 11px; }
.btn-outline { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; }
.btn-outline:hover { background: rgba(255, 255, 255, 0.1); }
.btn-gradient {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
  color: #fff;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
}
.btn-gradient:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5); }

/* Hero */
.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 70px;
}
.badge-fintech {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 20px;
}
.badge-dot { width: 6px; height: 6px; background: var(--accent-cyan); border-radius: 50%; }
.hero-h1 { font-size: 46px; font-weight: 900; line-height: 1.15; letter-spacing: -1px; color: #fff; margin-bottom: 20px; }
.gradient-text {
  background: linear-gradient(135deg, #38bdf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-p { font-size: 16px; color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; }
.hero-stats { display: flex; gap: 32px; border-top: 1px solid var(--border); padding-top: 24px; }
.stat-big { font-size: 28px; font-weight: 900; color: #fff; }
.stat-desc { font-size: 12px; color: var(--text-muted); }

/* Card Studio */
.card-visualizer-box {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
.card-theme-selector { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.selector-label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.theme-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.theme-btn.active { background: #fff; color: #000; font-weight: 700; }

.fintech-card {
  width: 100%;
  height: 200px;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 14px 30px rgba(0,0,0,0.5);
}
.theme-obsidian { background: linear-gradient(135deg, #181b24, #0b0d14); border: 1px solid rgba(255,255,255,0.15); color: #fff; }
.theme-titanium { background: linear-gradient(135deg, #f8fafc, #cbd5e1); border: 1px solid #fff; color: #0f172a; }
.theme-cyber { background: linear-gradient(135deg, #083344, #1e1b4b); border: 1px solid var(--accent-cyan); color: #fff; }

.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-chip { width: 34px; height: 26px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 4px; }
.card-network { font-size: 14px; font-weight: 800; font-style: italic; }
.card-number { font-size: 18px; font-family: var(--font-mono); letter-spacing: 2px; font-weight: 700; }
.card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
.card-lbl { font-size: 9px; opacity: 0.7; }
.card-val { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
.card-status-pill { background: rgba(16,185,129,0.2); color: #10b981; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; }

.card-controls { display: flex; gap: 8px; justify-content: center; }

/* Calculator */
.section-calc { margin-bottom: 70px; }
.calc-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px;
}
.calc-sub { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-cyan); display: block; margin-bottom: 6px; }
.calc-title { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 28px; }
.calc-body { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; align-items: center; }
.slider-meta { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; font-weight: 700; }
.slider-val { font-size: 22px; color: var(--accent-cyan); }
#volume-slider { width: 100%; height: 6px; accent-color: var(--accent-cyan); background: rgba(255,255,255,0.1); border-radius: 3px; }
.slider-ticks { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 8px; }
.results-side { display: flex; flex-direction: column; gap: 16px; }
.result-tile { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.result-lbl { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 6px; }
.result-num { font-size: 28px; font-weight: 900; color: #10b981; }

/* API */
.section-api { margin-bottom: 40px; }
.api-panel { background: #0c1018; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.api-nav { background: #131824; border-bottom: 1px solid var(--border); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; }
.api-tabs { display: flex; gap: 6px; }
.api-tab { background: none; border: none; color: var(--text-muted); font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
.api-tab.active { background: rgba(255,255,255,0.1); color: #fff; font-weight: 700; }
.api-body-grid { display: grid; grid-template-columns: 1.1fr 1fr; }
.code-column { padding: 18px; border-right: 1px solid var(--border); }
.code-pre { font-family: var(--font-mono); font-size: 12px; color: #38bdf8; white-space: pre-wrap; line-height: 1.6; }
.response-column { padding: 18px; background: #07090f; }
.response-header { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 12px; font-family: var(--font-mono); }
.res-status { color: #10b981; font-weight: 700; }
.res-auth { color: var(--text-muted); }
.response-pre { font-family: var(--font-mono); font-size: 12px; color: #cbd5e1; white-space: pre-wrap; line-height: 1.6; }

/* Toast */
.fintech-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-cyan);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .hero-section, .calc-body, .api-body-grid { grid-template-columns: 1fr; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('fintech-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // Theme selector
  const themeBtns = document.querySelectorAll('.theme-btn');
  const card = document.getElementById('virtual-card');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      if (card) {
        card.className = 'fintech-card theme-' + theme;
      }
      showToast('Card skin updated: ' + btn.textContent);
    });
  });

  // Card Controls
  let revealed = false;
  document.getElementById('btn-reveal-card')?.addEventListener('click', () => {
    revealed = !revealed;
    const num = document.getElementById('card-num-display');
    if (num) {
      num.textContent = revealed ? '4242 • 8819 • 0412 • 9412' : '•••• •••• •••• 9412';
    }
    showToast(revealed ? 'Sensitive card numbers decrypted' : 'Card numbers masked');
  });

  let frozen = false;
  document.getElementById('btn-freeze-card')?.addEventListener('click', () => {
    frozen = !frozen;
    const pill = document.querySelector('.card-status-pill');
    if (pill) {
      pill.textContent = frozen ? 'FROZEN' : 'ACTIVE';
      pill.style.background = frozen ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)';
      pill.style.color = frozen ? '#f43f5e' : '#10b981';
    }
    showToast(frozen ? '❄️ Card frozen via Visa Direct API' : 'Card thawed & active');
  });

  document.getElementById('btn-new-card')?.addEventListener('click', () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const num = document.getElementById('card-num-display');
    if (num) num.textContent = '•••• •••• •••• ' + randomSuffix;
    showToast('✨ Issued new virtual card ending in ' + randomSuffix);
  });

  // Calculator
  const slider = document.getElementById('volume-slider');
  const volVal = document.getElementById('volume-val');
  const savVal = document.getElementById('savings-val');
  const hrsVal = document.getElementById('hours-val');

  if (slider) {
    slider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10);
      if (volVal) volVal.textContent = '$' + vol.toLocaleString();
      const savings = Math.floor(vol * 0.0145);
      if (savVal) savVal.textContent = '$' + savings.toLocaleString();
      const hours = Math.floor((vol / 1000000) * 120);
      if (hrsVal) hrsVal.textContent = hours.toLocaleString() + ' hrs / yr';
    });
  }

  // API Views
  const apiSnippets = {
    curl: "curl -X POST https://api.starlightpay.com/v1/transfers \\\\\\n  -H \\"Authorization: Bearer sk_live_9f81a\\" \\\\\\n  -H \\"Idempotency-Key: ak_9f1a28\\" \\\\\\n  -d '{\\\\n    \\"amount\\": 2500000,\\\\n    \\"currency\\": \\"USD\\",\\\\n    \\"destination_rail\\": \\"fednow\\",\\\\n    \\"recipient\\": \\"acct_84210\\"\\\\n  }'",
    node: "import { Starlight } from '@starlight/sdk';\\\\n\\\\nconst starlight = new Starlight(process.env.STARLIGHT_SECRET);\\\\n\\\\nconst transfer = await starlight.transfers.create({\\\\n  amount: 2500000,\\\\n  currency: 'USD',\\\\n  destinationRail: 'fednow',\\\\n  recipient: 'acct_84210'\\\\n});",
    python: "import starlight\\\\n\\\\nstarlight.api_key = os.environ[\\"STARLIGHT_SECRET\\"]\\\\n\\\\ntransfer = starlight.Transfer.create(\\\\n    amount=2500000,\\\\n    currency=\\"USD\\",\\\\n    destination_rail=\\"fednow\\",\\\\n    recipient=\\"acct_84210\\"\\\\n)"
  };

  const codeView = document.getElementById('api-code-view');
  const resView = document.getElementById('api-res-view');

  function updateApiLang(lang) {
    if (codeView && apiSnippets[lang]) {
      codeView.textContent = apiSnippets[lang];
    }
  }

  const apiTabs = document.querySelectorAll('.api-tab');
  apiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      apiTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateApiLang(tab.getAttribute('data-lang'));
    });
  });

  updateApiLang('curl');

  const sampleRes = '{\\n  "id": "tx_01jb9412a",\\n  "status": "settled",\\n  "amount": 2500000,\\n  "currency": "USD",\\n  "clearing_network": "FEDNOW_INSTANT",\\n  "fee": 12.50,\\n  "created_at": "2026-10-04T15:21:04Z"\\n}';
  if (resView) resView.textContent = sampleRes;

  document.getElementById('btn-run-api')?.addEventListener('click', () => {
    showToast('Sandbox request dispatched! Settled in 38ms.');
  });
})();
`
};
