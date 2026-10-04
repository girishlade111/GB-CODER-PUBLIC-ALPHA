// HyperEdge Serverless Cloud Platform Landing Template
// Global edge latency ping benchmark, interactive CLI terminal, syntax-highlighted code tabs, and pricing calculator

const html = `
<div class="edge-container">
  <!-- Nav -->
  <nav class="edge-nav">
    <div class="edge-brand">
      <div class="edge-logo">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <polygon points="12 2 2 22 22 22"/>
        </svg>
      </div>
      <span class="edge-logo-text">HyperEdge<span class="text-gradient">.cloud</span></span>
    </div>

    <div class="edge-nav-links">
      <a href="#features" class="nav-link">Architecture</a>
      <a href="#benchmark" class="nav-link">Edge Ping Test</a>
      <a href="#pricing" class="nav-link">Bandwidth Calculator</a>
      <a href="#cli" class="nav-link">CLI Quickstart</a>
    </div>

    <div class="edge-nav-cta">
      <button class="btn btn-ghost">Log In</button>
      <button class="btn btn-primary">Deploy Free</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="edge-hero">
    <div class="hero-badge">
      <span class="badge-dot"></span>
      HyperEdge v4.2 Runtime: 320+ Global PoPs Active
    </div>

    <h1 class="hero-title">
      Zero-Cold-Start Serverless.<br>
      <span class="text-gradient">3ms Global Edge Execution.</span>
    </h1>

    <p class="hero-desc">
      Deploy full-stack TypeScript, Rust, and Python functions instantly to hundreds of points of presence worldwide with integrated distributed key-value storage and sub-millisecond DNS routing.
    </p>

    <div class="hero-cta-group">
      <div class="install-pill">
        <code>npx hyperedge deploy --prod</code>
        <button class="copy-btn" id="copyCmdBtn" title="Copy Command">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </div>
      <button class="btn btn-outline" id="scrollToBenchBtn">Run Live Edge Ping Test ↓</button>
    </div>

    <!-- Live Edge Latency Benchmark Interactive Widget -->
    <div class="benchmark-card" id="benchmark">
      <div class="bench-head">
        <div>
          <div class="bench-title">Live Global Edge Network Ping</div>
          <div class="bench-sub">Measure round-trip time from edge clusters to local point-of-presence</div>
        </div>
        <button class="btn btn-sm btn-primary" id="runPingBtn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Re-test All Nodes
        </button>
      </div>

      <div class="bench-grid" id="benchGrid">
        <div class="node-cell" data-city="Tokyo, Japan (NRT)">
          <div class="node-city">Tokyo, JP (NRT)</div>
          <div class="node-ping text-emerald" id="ping-tokyo">4.2 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 15%;"></div></div>
        </div>
        <div class="node-cell" data-city="Frankfurt, Germany (FRA)">
          <div class="node-city">Frankfurt, DE (FRA)</div>
          <div class="node-ping text-emerald" id="ping-frankfurt">6.1 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 22%;"></div></div>
        </div>
        <div class="node-cell" data-city="San Francisco, USA (SFO)">
          <div class="node-city">San Francisco, US (SFO)</div>
          <div class="node-ping text-emerald" id="ping-sfo">2.8 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 10%;"></div></div>
        </div>
        <div class="node-cell" data-city="London, UK (LHR)">
          <div class="node-city">London, UK (LHR)</div>
          <div class="node-ping text-emerald" id="ping-london">5.4 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 18%;"></div></div>
        </div>
        <div class="node-cell" data-city="Singapore (SIN)">
          <div class="node-city">Singapore (SIN)</div>
          <div class="node-ping text-emerald" id="ping-singapore">8.3 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 30%;"></div></div>
        </div>
        <div class="node-cell" data-city="Sydney, Australia (SYD)">
          <div class="node-city">Sydney, AU (SYD)</div>
          <div class="node-ping text-emerald" id="ping-sydney">11.7 ms</div>
          <div class="node-bar"><div class="node-fill" style="width: 40%;"></div></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Terminal Simulator -->
  <section class="edge-section" id="cli">
    <div class="section-badge">INTERACTIVE CLI</div>
    <h2 class="section-title">One command from Git commit to global rollout</h2>

    <div class="terminal-container">
      <div class="terminal-bar">
        <div class="term-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="term-title">bash — hyperedge deploy --prod</div>
      </div>
      <div class="terminal-body" id="termOutput">
        <div class="term-line"><span class="term-cyan">$</span> hyperedge deploy --env production</div>
        <div class="term-line text-dim">✦ Inspecting project package.json [TypeScript 5.6]...</div>
        <div class="term-line text-dim">✦ Bundling WASM edge isolates with esbuild (18.2ms)...</div>
        <div class="term-line text-emerald">✔ Artifacts compiled: dist/worker.wasm (41.2 kB gzipped)</div>
        <div class="term-line text-dim">✦ Distributing to 320 Edge PoPs simultaneously...</div>
        <div class="term-line text-emerald">✔ Tokyo (NRT), Frankfurt (FRA), SFO (SJC), London (LHR) synchronized.</div>
        <div class="term-line"><span class="term-purple">🚀 Deployment Live:</span> <span class="term-link">https://my-app.hyperedge.app</span></div>
      </div>
      <div class="terminal-input-bar">
        <button class="btn btn-sm btn-outline" id="reDeployCliBtn">Re-run Deployment Simulation</button>
      </div>
    </div>
  </section>

  <!-- Bandwidth & Execution Calculator -->
  <section class="edge-section" id="pricing">
    <div class="section-badge">TRANSPARENT FINOPs</div>
    <h2 class="section-title">Calculate your savings vs Traditional Cloud</h2>

    <div class="calc-card">
      <div class="calc-inputs">
        <div class="calc-field">
          <label>Monthly Function Invocations:</label>
          <div class="slider-val"><span id="invocationsVal">50,000,000</span> requests</div>
          <input type="range" id="invocationsSlider" min="1000000" max="250000000" step="1000000" value="50000000" class="edge-slider">
        </div>

        <div class="calc-field">
          <label>Global Bandwidth Egress:</label>
          <div class="slider-val"><span id="egressVal">5,000</span> GB</div>
          <input type="range" id="egressSlider" min="100" max="50000" step="100" value="5000" class="edge-slider">
        </div>
      </div>

      <div class="calc-results">
        <div class="res-box">
          <div class="res-label">HyperEdge Cost</div>
          <div class="res-price text-emerald" id="hyperPrice">$45.00<small>/mo</small></div>
          <div class="res-desc">Zero egress markup • Sub-millisecond billing</div>
        </div>

        <div class="res-box vs-aws">
          <div class="res-label">AWS Lambda + CloudFront</div>
          <div class="res-price text-dim" id="awsPrice">$485.00<small>/mo</small></div>
          <div class="res-savings">You Save: <strong id="savingsPercent">91%</strong></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="edge-footer">
    <div class="footer-copy">© 2026 HyperEdge Systems, Inc. Enterprise Serverless Infrastructure.</div>
    <div class="footer-links">
      <span>Status: 99.999% Normal</span>
      <span>Privacy Policy</span>
      <span>Security Compliance (SOC2 Type II)</span>
    </div>
  </footer>
</div>
`;

const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #030712;
  color: #f3f4f6;
  min-height: 100vh;
  line-height: 1.6;
}

.edge-container {
  display: flex;
  flex-direction: column;
}

/* Nav */
.edge-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 36px;
  background: rgba(3, 7, 18, 0.85);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.edge-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edge-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
}

.edge-logo-text {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.text-gradient {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.edge-nav-links {
  display: flex;
  gap: 28px;
}

@media (max-width: 840px) {
  .edge-nav-links { display: none; }
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #ffffff;
}

.edge-nav-cta {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
}

.btn-ghost {
  background: transparent;
  color: #cbd5e1;
}

.btn-ghost:hover {
  color: #ffffff;
}

.btn-outline {
  background: #111827;
  color: #e2e8f0;
  border: 1px solid #374151;
}

.btn-outline:hover {
  background: #1f2937;
  border-color: #4b5563;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Hero */
.edge-hero {
  padding: 80px 24px 60px;
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .hero-title { font-size: 32px; }
}

.hero-desc {
  font-size: 17px;
  color: #94a3b8;
  max-width: 680px;
  margin: 0 auto 36px;
}

.hero-cta-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 54px;
}

.install-pill {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 4px 6px 4px 14px;
}

.install-pill code {
  font-family: monospace;
  font-size: 13px;
  color: #38bdf8;
}

.copy-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 6px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.copy-btn:hover {
  color: #ffffff;
  background: #1e293b;
}

/* Benchmark Widget */
.benchmark-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 24px;
  text-align: left;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.bench-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.bench-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.bench-sub {
  font-size: 12px;
  color: #64748b;
}

.bench-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
}

.node-cell {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 14px;
}

.node-city {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.node-ping {
  font-size: 20px;
  font-weight: 800;
  font-family: monospace;
  margin-bottom: 8px;
}

.node-bar {
  height: 4px;
  background: #1e293b;
  border-radius: 9999px;
  overflow: hidden;
}

.node-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.4s ease;
}

.text-emerald { color: #10b981; }
.text-dim { color: #64748b; }

/* Terminal */
.edge-section {
  padding: 60px 24px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.section-badge {
  font-size: 11px;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 36px;
}

.terminal-container {
  background: #06090e;
  border: 1px solid #1f2937;
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  box-shadow: 0 12px 36px rgba(0,0,0,0.6);
}

.terminal-bar {
  background: #0f172a;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #1e293b;
}

.term-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.term-title {
  font-family: monospace;
  font-size: 11px;
  color: #94a3b8;
  margin-left: 14px;
}

.terminal-body {
  padding: 20px;
  font-family: 'SFMono-Regular', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
  min-height: 180px;
}

.term-cyan { color: #38bdf8; font-weight: bold; }
.term-purple { color: #a855f7; font-weight: bold; }
.term-link { color: #38bdf8; text-decoration: underline; }

.terminal-input-bar {
  padding: 10px 20px;
  background: #0b1120;
  border-top: 1px solid #1e293b;
}

/* Calculator */
.calc-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  text-align: left;
}

@media (max-width: 768px) {
  .calc-card { grid-template-columns: 1fr; }
}

.calc-field {
  margin-bottom: 24px;
}

.calc-field label {
  font-size: 13px;
  color: #94a3b8;
  display: block;
  margin-bottom: 8px;
}

.slider-val {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.edge-slider {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.calc-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.res-box {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 18px;
}

.res-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.res-price {
  font-size: 32px;
  font-weight: 800;
  font-family: monospace;
}

.res-price small {
  font-size: 14px;
  color: #64748b;
}

.res-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.vs-aws {
  opacity: 0.85;
}

.res-savings {
  margin-top: 8px;
  font-size: 13px;
  color: #34d399;
}

/* Footer */
.edge-footer {
  margin-top: 60px;
  border-top: 1px solid #1e293b;
  padding: 28px 36px;
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 12px;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-links {
  display: flex;
  gap: 20px;
}
`;

const javascript = `
(function() {
  // Edge ping benchmark simulator
  const runPingBtn = document.getElementById('runPingBtn');
  const scrollToBenchBtn = document.getElementById('scrollToBenchBtn');
  const copyBtn = document.getElementById('copyCmdBtn');

  if (scrollToBenchBtn) {
    scrollToBenchBtn.addEventListener('click', () => {
      document.getElementById('benchmark').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('npx hyperedge deploy --prod');
      copyBtn.innerHTML = '<span style="color:#10b981;font-size:11px;font-weight:bold;">Copied!</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 2000);
    });
  }

  function simulatePing() {
    const nodes = [
      { id: 'ping-tokyo', base: 4.2 },
      { id: 'ping-frankfurt', base: 6.1 },
      { id: 'ping-sfo', base: 2.8 },
      { id: 'ping-london', base: 5.4 },
      { id: 'ping-singapore', base: 8.3 },
      { id: 'ping-sydney', base: 11.7 }
    ];

    nodes.forEach(node => {
      const el = document.getElementById(node.id);
      if (!el) return;
      el.textContent = '...';
      el.style.opacity = '0.5';

      setTimeout(() => {
        const jitter = (Math.random() * 0.8 - 0.4);
        const val = Math.max(1.8, node.base + jitter).toFixed(1);
        el.textContent = val + ' ms';
        el.style.opacity = '1';
      }, 300 + Math.random() * 600);
    });
  }

  if (runPingBtn) {
    runPingBtn.addEventListener('click', simulatePing);
  }

  // CLI simulator
  const reDeployBtn = document.getElementById('reDeployCliBtn');
  const termBody = document.getElementById('termOutput');

  function runCliDeploy() {
    if (!termBody) return;
    termBody.innerHTML = '<div class="term-line"><span class="term-cyan">$</span> hyperedge deploy --env production</div>';

    const steps = [
      { text: '✦ Inspecting project package.json [TypeScript 5.6]...', delay: 300, cls: 'text-dim' },
      { text: '✦ Bundling WASM edge isolates with esbuild (17.4ms)...', delay: 700, cls: 'text-dim' },
      { text: '✔ Artifacts compiled: dist/worker.wasm (41.2 kB gzipped)', delay: 1100, cls: 'text-emerald' },
      { text: '✦ Synchronizing cold-start isolates across 320 Edge PoPs...', delay: 1500, cls: 'text-dim' },
      { text: '✔ All edge nodes live in 240ms.', delay: 1900, cls: 'text-emerald' },
      { text: '<span class="term-purple">🚀 Deployment Live:</span> <span class="term-link">https://my-app.hyperedge.app</span>', delay: 2200, cls: '' }
    ];

    steps.forEach(s => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'term-line ' + (s.cls || '');
        div.innerHTML = s.text;
        termBody.appendChild(div);
      }, s.delay);
    });
  }

  if (reDeployBtn) {
    reDeployBtn.addEventListener('click', runCliDeploy);
  }

  // Calculator
  const invSlider = document.getElementById('invocationsSlider');
  const egrSlider = document.getElementById('egressSlider');
  const invVal = document.getElementById('invocationsVal');
  const egrVal = document.getElementById('egressVal');
  const hyperPrice = document.getElementById('hyperPrice');
  const awsPrice = document.getElementById('awsPrice');
  const savingsPercent = document.getElementById('savingsPercent');

  function updatePricing() {
    if (!invSlider || !egrSlider) return;
    const reqs = parseInt(invSlider.value, 10);
    const egress = parseInt(egrSlider.value, 10);

    invVal.textContent = reqs.toLocaleString();
    egrVal.textContent = egress.toLocaleString();

    // Hyperedge: $0.15 per million + $0.02 per GB
    const hyperCost = Math.max(10, (reqs / 1000000) * 0.20 + egress * 0.025);
    
    // AWS: $0.20 per million + $0.09 per GB egress
    const awsCost = (reqs / 1000000) * 0.20 + egress * 0.085;

    hyperPrice.innerHTML = '$' + Math.round(hyperCost).toLocaleString() + '<small>/mo</small>';
    awsPrice.innerHTML = '$' + Math.round(awsCost).toLocaleString() + '<small>/mo</small>';

    const savings = Math.max(10, Math.round(((awsCost - hyperCost) / awsCost) * 100));
    savingsPercent.textContent = savings + '%';
  }

  if (invSlider && egrSlider) {
    invSlider.addEventListener('input', updatePricing);
    egrSlider.addEventListener('input', updatePricing);
    updatePricing();
  }
})();
`;

export default { html, css, javascript };
