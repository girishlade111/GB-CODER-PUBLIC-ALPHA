export default {
  html: `
<div class="carbon-app" id="top">
  <!-- Nav -->
  <nav class="carbon-nav">
    <div class="nav-container">
      <div class="brand">
        <span class="brand-leaf">🌱</span>
        <span class="brand-title">TerraCarbon<span class="brand-sub">ESG</span></span>
      </div>

      <div class="nav-links">
        <a href="#calculator" class="nav-a">Emissions Calculator</a>
        <a href="#marketplace" class="nav-a">Carbon Offsets</a>
        <a href="#audit" class="nav-a">CSRD Compliance</a>
      </div>

      <button class="btn btn-primary" id="btn-export-audit">Generate CSRD Report</button>
    </div>
  </nav>

  <!-- Hero with Metrics -->
  <section class="hero-wrap">
    <div class="hero-content">
      <div class="pill-green">
        <span>GHG Protocol Corporate Standard Certified</span>
      </div>
      <h1 class="hero-h1">Automate Net-Zero with <span class="text-green">verifiable telemetry</span>.</h1>
      <p class="hero-p">
        Directly ingest utility bills, cloud compute telemetry (AWS/GCP/Azure), and logistics data into audit-ready Scope 1, 2, and 3 carbon ledgers.
      </p>
    </div>

    <!-- Emission KPI Banner -->
    <div class="kpi-banner">
      <div class="kpi-col">
        <span class="k-label">TOTAL EMISSIONS (YTD)</span>
        <div class="k-num" id="total-co2">4,820 <span class="unit">MT CO2e</span></div>
        <span class="k-sub text-green">↓ -18.4% YoY Reduction</span>
      </div>
      <div class="kpi-col">
        <span class="k-label">RENEWABLE CLOUD SHARE</span>
        <div class="k-num">92.4%</div>
        <span class="k-sub text-green">Target: 100% by Q4</span>
      </div>
      <div class="kpi-col">
        <span class="k-label">CARBON REMOVED</span>
        <div class="k-num" id="offset-co2">1,240 <span class="unit">MT CO2e</span></div>
        <span class="k-sub text-cyan">Verified via Puro.earth</span>
      </div>
    </div>
  </section>

  <!-- Interactive Scope 1, 2, 3 Calculator -->
  <section class="section-calc" id="calculator">
    <div class="panel-box">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Interactive Emissions Scope Modeler</h2>
          <p class="panel-desc">Simulate corporate footprint adjustments across the three GHG protocol scopes</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-reset-calc">Reset Baseline</button>
      </div>

      <div class="calc-sliders-grid">
        <div class="slider-card">
          <div class="sc-head">
            <span class="sc-title">SCOPE 1: DIRECT EMISSIONS</span>
            <span class="sc-val" id="val-scope1">640 MT</span>
          </div>
          <div class="sc-desc">Facilities natural gas, corporate vehicle fleets, generators</div>
          <input type="range" class="co2-slider" id="slider-scope1" min="100" max="2000" value="640" />
        </div>

        <div class="slider-card">
          <div class="sc-head">
            <span class="sc-title">SCOPE 2: PURCHASED ENERGY</span>
            <span class="sc-val" id="val-scope2">1,180 MT</span>
          </div>
          <div class="sc-desc">Cloud datacenter energy consumption, office power grid</div>
          <input type="range" class="co2-slider" id="slider-scope2" min="200" max="4000" value="1180" />
        </div>

        <div class="slider-card">
          <div class="sc-head">
            <span class="sc-title">SCOPE 3: VALUE CHAIN & VENDORS</span>
            <span class="sc-val" id="val-scope3">3,000 MT</span>
          </div>
          <div class="sc-desc">Business travel, hardware supply chain, logistics freight</div>
          <input type="range" class="co2-slider" id="slider-scope3" min="500" max="8000" value="3000" />
        </div>
      </div>
    </div>
  </section>

  <!-- Offset Marketplace -->
  <section class="section-market" id="marketplace">
    <div class="panel-box">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">High-Permanence Carbon Removal Marketplace</h2>
          <p class="panel-desc">Directly fund verified carbon dioxide removal credits to neutralize residual emissions</p>
        </div>
        <span class="badge-ver">ISO 14064-2 Compliant</span>
      </div>

      <div class="offsets-grid">
        <div class="offset-card">
          <div class="o-type">DIRECT AIR CAPTURE (DAC)</div>
          <h3 class="o-name">Climeworks Orca Plant</h3>
          <div class="o-dur">Permanence: 10,000+ Years (Basalt Mineralization)</div>
          <div class="o-price">$600 / ton</div>
          <button class="btn btn-primary btn-sm" onclick="retireOffset('Climeworks DAC', 10)">Retire 10 Tons</button>
        </div>

        <div class="offset-card">
          <div class="o-type">BIOCHAR CARBON REMOVAL</div>
          <h3 class="o-name">Nordic Pyrolysis Project</h3>
          <div class="o-dur">Permanence: 1,000+ Years (Soil Amendment)</div>
          <div class="o-price">$180 / ton</div>
          <button class="btn btn-primary btn-sm" onclick="retireOffset('Nordic Biochar', 25)">Retire 25 Tons</button>
        </div>

        <div class="offset-card">
          <div class="o-type">ENHANCED ROCK WEATHERING</div>
          <h3 class="o-name">Silicate Mineralization UK</h3>
          <div class="o-dur">Permanence: 100,000+ Years (Silicate Dissolution)</div>
          <div class="o-price">$240 / ton</div>
          <button class="btn btn-primary btn-sm" onclick="retireOffset('Rock Weathering', 20)">Retire 20 Tons</button>
        </div>
      </div>
    </div>
  </section>

  <div class="carbon-toast" id="carbon-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #080d0a;
  --bg-panel: rgba(14, 24, 18, 0.75);
  --border: rgba(255, 255, 255, 0.08);
  --green: #10b981;
  --cyan: #38bdf8;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
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

.carbon-app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Nav */
.carbon-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(8, 13, 10, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 40px;
}
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-leaf { font-size: 20px; }
.brand-title { font-size: 17px; font-weight: 800; color: #fff; }
.brand-sub { font-size: 10px; background: rgba(16,185,129,0.15); color: var(--green); padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
.nav-links { display: flex; gap: 24px; }
.nav-a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
.nav-a:hover { color: #fff; }

.btn { padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-sm { padding: 6px 12px; font-size: 11px; }
.btn-primary { background: var(--green); color: #000; font-weight: 800; }
.btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; }

/* Hero */
.hero-wrap { margin-bottom: 50px; }
.pill-green {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--green);
  margin-bottom: 20px;
}
.hero-h1 { font-size: 44px; font-weight: 900; line-height: 1.15; color: #fff; margin-bottom: 16px; }
.text-green { color: var(--green); }
.hero-p { font-size: 16px; color: var(--text-muted); max-width: 780px; margin-bottom: 32px; }

/* KPI Banner */
.kpi-banner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}
.kpi-col { border-right: 1px solid var(--border); padding-right: 20px; }
.kpi-col:last-child { border-right: none; }
.k-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); display: block; margin-bottom: 6px; }
.k-num { font-size: 32px; font-weight: 900; color: #fff; font-family: var(--font-mono); margin-bottom: 4px; }
.unit { font-size: 14px; color: var(--text-muted); font-weight: 600; }
.k-sub { font-size: 11px; font-weight: 700; }
.text-cyan { color: var(--cyan); }

/* Panel */
.panel-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 14px; padding: 24px; margin-bottom: 40px; }
.panel-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.panel-title { font-size: 18px; font-weight: 800; color: #fff; }
.panel-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.badge-ver { font-size: 10px; font-weight: 800; color: var(--green); background: rgba(16,185,129,0.1); padding: 4px 10px; border-radius: 4px; }

/* Sliders */
.calc-sliders-grid { display: flex; flex-direction: column; gap: 16px; }
.slider-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
.sc-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
.sc-title { font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
.sc-val { font-size: 14px; font-family: var(--font-mono); font-weight: 800; color: var(--green); }
.sc-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
.co2-slider { width: 100%; height: 6px; accent-color: var(--green); background: rgba(255,255,255,0.1); border-radius: 3px; }

/* Marketplace */
.offsets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.offset-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; }
.o-type { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--green); margin-bottom: 6px; }
.o-name { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 8px; }
.o-dur { font-size: 11px; color: var(--text-muted); margin-bottom: 16px; flex: 1; }
.o-price { font-size: 18px; font-weight: 900; color: #fff; font-family: var(--font-mono); margin-bottom: 16px; }

/* Toast */
.carbon-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #12281a;
  border: 1px solid var(--green);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .kpi-banner, .offsets-grid { grid-template-columns: 1fr; }
  .kpi-col { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 14px; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('carbon-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  const s1 = document.getElementById('slider-scope1');
  const s2 = document.getElementById('slider-scope2');
  const s3 = document.getElementById('slider-scope3');

  function updateTotals() {
    const v1 = parseInt(s1?.value || '640', 10);
    const v2 = parseInt(s2?.value || '1180', 10);
    const v3 = parseInt(s3?.value || '3000', 10);

    const val1 = document.getElementById('val-scope1');
    const val2 = document.getElementById('val-scope2');
    const val3 = document.getElementById('val-scope3');
    if (val1) val1.textContent = v1.toLocaleString() + ' MT';
    if (val2) val2.textContent = v2.toLocaleString() + ' MT';
    if (val3) val3.textContent = v3.toLocaleString() + ' MT';

    const total = v1 + v2 + v3;
    const totEl = document.getElementById('total-co2');
    if (totEl) {
      totEl.innerHTML = total.toLocaleString() + ' <span class="unit">MT CO2e</span>';
    }
  }

  [s1, s2, s3].forEach(sl => sl?.addEventListener('input', updateTotals));

  document.getElementById('btn-reset-calc')?.addEventListener('click', () => {
    if (s1) s1.value = '640';
    if (s2) s2.value = '1180';
    if (s3) s3.value = '3000';
    updateTotals();
    showToast('Reset emissions modeler to fiscal year 2026 baseline');
  });

  window.retireOffset = function(name, tons) {
    showToast('✓ Retired ' + tons + ' MT CO2e credits on ' + name + ' (Puro registry recorded)');
  };

  document.getElementById('btn-export-audit')?.addEventListener('click', () => {
    showToast('Exported verified CSRD & GHG Protocol carbon disclosure report');
  });
})();
`
};
