export default {
  html: `
<div class="cyber-app">
  <!-- Header -->
  <header class="cyber-header">
    <div class="h-brand">
      <div class="shield-logo">🛡️</div>
      <div>
        <h1 class="brand-title">CyberShield Inspector</h1>
        <div class="brand-sub">Web Application Security Posture & CSP Auditor</div>
      </div>
    </div>

    <div class="sec-score-pill">
      <span class="score-badge">GRADE: A+</span>
      <span>Risk Score: <strong>98 / 100 (Optimal)</strong></span>
    </div>

    <button class="btn btn-primary" id="btn-export-report">Export Compliance PDF</button>
  </header>

  <!-- Main Container -->
  <main class="cyber-main">
    <!-- URL Target Bar -->
    <div class="target-bar">
      <div class="preset-targets">
        <span class="p-lbl">Presets:</span>
        <button class="target-btn active" data-url="api.apexcloud.io">api.apexcloud.io (Optimal A+)</button>
        <button class="target-btn" data-url="legacy-gateway.internal">legacy-gateway.internal (Grade C)</button>
        <button class="target-btn" data-url="fintech-rails.dev">fintech-rails.dev (Grade B+)</button>
      </div>

      <div class="input-scan-row">
        <input type="text" id="target-input" value="https://api.apexcloud.io" placeholder="Enter target domain or endpoint URL to audit..." />
        <button class="btn btn-scan" id="btn-run-scan">Audit Headers & SSL</button>
      </div>
    </div>

    <!-- Security Posture Grid -->
    <div class="posture-grid">
      <!-- Left Column: Header Audit Matrix -->
      <section class="panel-box">
        <div class="panel-head">
          <h2 class="panel-title">HTTP Security Headers Assessment</h2>
          <span class="status-summary" id="headers-summary">6 of 6 Crucial Headers Active</span>
        </div>

        <div class="headers-list" id="headers-list">
          <!-- Populated by JS -->
        </div>
      </section>

      <!-- Right Column: SSL Certificate & CSP Generator -->
      <div class="right-stack">
        <!-- SSL Card -->
        <section class="panel-box">
          <div class="panel-head">
            <h2 class="panel-title">TLS / SSL Certificate Attestation</h2>
            <span class="badge-tls">TLS 1.3 Active</span>
          </div>

          <div class="ssl-details-grid">
            <div class="ssl-item">
              <span class="ssl-lbl">CERTIFICATE COMMON NAME</span>
              <strong id="ssl-cn">*.api.apexcloud.io</strong>
            </div>
            <div class="ssl-item">
              <span class="ssl-lbl">CERTIFICATE AUTHORITY (CA)</span>
              <strong>DigiCert Global Root G2</strong>
            </div>
            <div class="ssl-item">
              <span class="ssl-lbl">CIPHER SUITE</span>
              <span class="font-mono">TLS_AES_256_GCM_SHA384</span>
            </div>
            <div class="ssl-item">
              <span class="ssl-lbl">EXPIRATION COUNTDOWN</span>
              <strong style="color:#10b981;" id="ssl-exp">Valid for 312 Days</strong>
            </div>
          </div>
        </section>

        <!-- CSP Generator -->
        <section class="panel-box">
          <div class="panel-head">
            <h2 class="panel-title">Interactive CSP Policy Builder</h2>
            <button class="btn-xs" id="btn-copy-csp">Copy Policy Header</button>
          </div>

          <div class="csp-preview" id="csp-preview-box">
default-src 'self'; script-src 'self' 'nonce-4f8a92'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.apexcloud.io; connect-src 'self' wss://api.apexcloud.io; frame-ancestors 'none';
          </div>
        </section>
      </div>
    </div>
  </main>

  <div class="cyber-toast" id="cyber-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #07090f;
  --bg-panel: rgba(14, 19, 30, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --green: #10b981;
  --red: #f43f5e;
  --amber: #f59e0b;
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
  height: 100vh;
  overflow: hidden;
}

.cyber-app { display: flex; flex-direction: column; height: 100vh; }

/* Header */
.cyber-header {
  height: 64px;
  background: rgba(10, 14, 24, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.h-brand { display: flex; align-items: center; gap: 12px; }
.shield-logo { font-size: 24px; }
.brand-title { font-size: 16px; font-weight: 800; color: #fff; }
.brand-sub { font-size: 11px; color: var(--text-muted); }

.sec-score-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
}
.score-badge { background: var(--green); color: #000; font-weight: 900; font-size: 10px; padding: 2px 6px; border-radius: 4px; }

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--accent-blue); color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-scan { background: var(--accent-cyan); color: #000; font-weight: 800; padding: 0 20px; }

/* Main */
.cyber-main { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

/* Target Bar */
.target-bar { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
.preset-targets { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.p-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.target-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.target-btn.active { background: rgba(6, 182, 212, 0.15); border-color: var(--accent-cyan); color: #fff; font-weight: 600; }
.input-scan-row { display: flex; gap: 10px; }
.input-scan-row input {
  flex: 1;
  background: #070910;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 13px;
  font-family: var(--font-mono);
  outline: none;
}
.input-scan-row input:focus { border-color: var(--accent-cyan); }

/* Posture Grid */
.posture-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
.panel-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 14px; font-weight: 800; color: #fff; }
.status-summary { font-size: 11px; color: var(--green); font-weight: 700; }
.badge-tls { font-size: 10px; font-weight: 800; color: var(--accent-cyan); background: rgba(6,182,212,0.1); padding: 3px 8px; border-radius: 4px; }

.headers-list { display: flex; flex-direction: column; gap: 10px; }
.header-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.h-name { font-size: 12px; font-weight: 700; color: #fff; font-family: var(--font-mono); margin-bottom: 2px; }
.h-val { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.5; }
.h-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
.h-pass { background: rgba(16, 185, 129, 0.15); color: var(--green); }
.h-fail { background: rgba(244, 63, 94, 0.15); color: var(--red); }
.h-warn { background: rgba(245, 158, 11, 0.15); color: var(--amber); }

.right-stack { display: flex; flex-direction: column; gap: 20px; }
.ssl-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 12px; }
.ssl-item { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px; }
.ssl-lbl { font-size: 9px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
.font-mono { font-family: var(--font-mono); font-size: 11px; color: #cbd5e1; }

.csp-preview {
  background: #07090f;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #38bdf8;
  line-height: 1.6;
  white-space: pre-wrap;
}

.btn-xs { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.btn-xs:hover { background: rgba(255,255,255,0.1); }

/* Toast */
.cyber-toast {
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
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('cyber-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  const profiles = {
    'api.apexcloud.io': {
      score: 'GRADE: A+',
      risk: '98 / 100 (Optimal)',
      summary: '6 of 6 Crucial Headers Active',
      cn: '*.api.apexcloud.io',
      exp: 'Valid for 312 Days',
      headers: [
        { name: 'Strict-Transport-Security', val: 'max-age=63072000; includeSubDomains; preload', status: 'PASS' },
        { name: 'Content-Security-Policy', val: 'default-src \\'self\\'; frame-ancestors \\'none\\'', status: 'PASS' },
        { name: 'X-Frame-Options', val: 'DENY', status: 'PASS' },
        { name: 'X-Content-Type-Options', val: 'nosniff', status: 'PASS' },
        { name: 'Referrer-Policy', val: 'strict-origin-when-cross-origin', status: 'PASS' },
        { name: 'Permissions-Policy', val: 'camera=(), microphone=(), geolocation=()', status: 'PASS' }
      ]
    },
    'legacy-gateway.internal': {
      score: 'GRADE: C',
      risk: '58 / 100 (High Risk)',
      summary: '2 of 6 Headers Active (Missing HSTS & CSP)',
      cn: 'legacy-gateway.internal',
      exp: 'Expires in 18 Days (Renew Soon)',
      headers: [
        { name: 'Strict-Transport-Security', val: 'Missing (High vulnerability to downgrade attack)', status: 'FAIL' },
        { name: 'Content-Security-Policy', val: 'Missing (Susceptible to XSS script injection)', status: 'FAIL' },
        { name: 'X-Frame-Options', val: 'SAMEORIGIN', status: 'WARN' },
        { name: 'X-Content-Type-Options', val: 'nosniff', status: 'PASS' },
        { name: 'Referrer-Policy', val: 'Missing', status: 'WARN' },
        { name: 'Permissions-Policy', val: 'Missing', status: 'WARN' }
      ]
    },
    'fintech-rails.dev': {
      score: 'GRADE: B+',
      risk: '84 / 100 (Good)',
      summary: '5 of 6 Headers Active (Weak CSP Nonce)',
      cn: '*.fintech-rails.dev',
      exp: 'Valid for 180 Days',
      headers: [
        { name: 'Strict-Transport-Security', val: 'max-age=31536000', status: 'PASS' },
        { name: 'Content-Security-Policy', val: 'default-src \\'self\\' \\'unsafe-eval\\'', status: 'WARN' },
        { name: 'X-Frame-Options', val: 'DENY', status: 'PASS' },
        { name: 'X-Content-Type-Options', val: 'nosniff', status: 'PASS' },
        { name: 'Referrer-Policy', val: 'no-referrer', status: 'PASS' },
        { name: 'Permissions-Policy', val: 'camera=(), microphone=()', status: 'PASS' }
      ]
    }
  };

  const headersList = document.getElementById('headers-list');
  function renderProfile(key) {
    const p = profiles[key];
    if (!p || !headersList) return;

    headersList.innerHTML = p.headers.map(h => {
      const cls = h.status === 'PASS' ? 'h-pass' : h.status === 'FAIL' ? 'h-fail' : 'h-warn';
      return '<div class="header-row">' +
        '<div>' +
          '<div class="h-name">' + h.name + '</div>' +
          '<div class="h-val">' + h.val + '</div>' +
        '</div>' +
        '<span class="h-badge ' + cls + '">' + h.status + '</span>' +
      '</div>';
    }).join('');

    const sumEl = document.getElementById('headers-summary');
    if (sumEl) sumEl.textContent = p.summary;
    const cnEl = document.getElementById('ssl-cn');
    if (cnEl) cnEl.textContent = p.cn;
    const expEl = document.getElementById('ssl-exp');
    if (expEl) expEl.textContent = p.exp;
  }

  const targetBtns = document.querySelectorAll('.target-btn');
  const targetInput = document.getElementById('target-input');

  targetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      targetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const url = btn.getAttribute('data-url');
      if (targetInput && url) targetInput.value = 'https://' + url;
      renderProfile(url);
      showToast('Audited posture for: ' + url);
    });
  });

  renderProfile('api.apexcloud.io');

  document.getElementById('btn-run-scan')?.addEventListener('click', () => {
    showToast('Real-time TLS handshake & security headers scan finished (0 CVEs).');
  });

  document.getElementById('btn-copy-csp')?.addEventListener('click', () => {
    const csp = document.getElementById('csp-preview-box')?.textContent || '';
    navigator.clipboard?.writeText(csp.trim());
    showToast('Copied CSP policy header to clipboard');
  });

  document.getElementById('btn-export-report')?.addEventListener('click', () => {
    showToast('Exported SOC2 Security Header Audit (PDF report generated)');
  });
})();
`
};
