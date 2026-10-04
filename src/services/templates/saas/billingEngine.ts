export default {
  html: `
<div class="billing-app">
  <!-- Top Bar -->
  <header class="billing-header">
    <div class="h-left">
      <div class="billing-logo">💳</div>
      <div>
        <h1 class="billing-title">StripeScale RevOps</h1>
        <div class="billing-sub">Enterprise Subscription Billing & Churn Automation</div>
      </div>
    </div>

    <div class="h-metrics">
      <div class="m-chip"><span class="chip-dot"></span> MRR: <strong>$184,250</strong> (+12.4%)</div>
      <div class="m-chip"><span class="chip-dot"></span> Net Revenue Retention: <strong>118.2%</strong></div>
      <div class="m-chip"><span class="chip-dot"></span> Logo Churn: <strong>0.82%</strong></div>
    </div>

    <button class="btn btn-primary" id="btn-export-mrr">Export RevRec CSV</button>
  </header>

  <!-- Main Grid -->
  <main class="billing-main">
    <!-- Top Action Banner -->
    <div class="action-banner">
      <div>
        <strong style="color:#fff;">Smart Dunning & Card Recovery Engine: Active</strong>
        <p style="color:var(--text-muted); font-size:12px; margin-top:2px;">Recovered $14,820 in involuntary churn this billing cycle using machine learning retry cadences.</p>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-warn" id="btn-simulate-failed-charge">Simulate Failed Charge</button>
        <button class="btn btn-secondary" id="btn-run-dunning">Run Smart Dunning</button>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="billing-grid">
      <!-- Left: Subscription Tiers & Entitlements -->
      <section class="panel-box">
        <div class="panel-head">
          <h2 class="panel-title">Active Pricing Plans & Entitlements</h2>
          <span class="subhead-meta">3 Live Public Tiers</span>
        </div>

        <div class="plans-list">
          <div class="plan-row">
            <div>
              <div class="plan-name">Starter Squad</div>
              <div class="plan-specs">Up to 5 seats • 100k API calls / mo</div>
            </div>
            <div class="plan-pricing">
              <span class="price-big">$49</span>
              <span class="price-sub">/ mo</span>
            </div>
            <span class="subs-count">482 Active Subs</span>
          </div>

          <div class="plan-row active-tier">
            <div>
              <div class="plan-name">Scale Enterprise</div>
              <div class="plan-specs">Unlimited seats • 5M API calls • Dedicated VPC</div>
            </div>
            <div class="plan-pricing">
              <span class="price-big" style="color:var(--accent-cyan);">$299</span>
              <span class="price-sub">/ mo</span>
            </div>
            <span class="subs-count">148 Active Subs</span>
          </div>

          <div class="plan-row">
            <div>
              <div class="plan-name">Global Dedicated</div>
              <div class="plan-specs">Custom throughput • 99.999% SLA • SAML / SSO</div>
            </div>
            <div class="plan-pricing">
              <span class="price-big">$899</span>
              <span class="price-sub">/ mo</span>
            </div>
            <span class="subs-count">24 Active Subs</span>
          </div>
        </div>
      </section>

      <!-- Right: Subscriptions Customer Directory -->
      <section class="panel-box">
        <div class="panel-head">
          <h2 class="panel-title">Live Customer Subscriptions</h2>
          <input type="text" class="search-mini" id="customer-search" placeholder="Filter company..." />
        </div>

        <div class="customers-table-wrap">
          <table class="cust-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>PLAN</th>
                <th>MRR</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody id="cust-tbody">
              <tr>
                <td>
                  <div class="c-name">Hyperion Systems</div>
                  <div class="c-id">sub_01jb9a42</div>
                </td>
                <td>Scale Enterprise</td>
                <td><strong>$299.00</strong></td>
                <td><span class="badge-status status-active">ACTIVE</span></td>
                <td><button class="btn-xs" onclick="manageSub('Hyperion')">Portal</button></td>
              </tr>
              <tr id="row-kestrel">
                <td>
                  <div class="c-name">Kestrel Data</div>
                  <div class="c-id">sub_02kc4819</div>
                </td>
                <td>Global Dedicated</td>
                <td><strong>$899.00</strong></td>
                <td><span class="badge-status status-active" id="badge-kestrel">ACTIVE</span></td>
                <td><button class="btn-xs" onclick="manageSub('Kestrel')">Portal</button></td>
              </tr>
              <tr>
                <td>
                  <div class="c-name">Nexus Intelligence</div>
                  <div class="c-id">sub_03df1290</div>
                </td>
                <td>Scale Enterprise</td>
                <td><strong>$299.00</strong></td>
                <td><span class="badge-status status-active">ACTIVE</span></td>
                <td><button class="btn-xs" onclick="manageSub('Nexus')">Portal</button></td>
              </tr>
              <tr>
                <td>
                  <div class="c-name">Vanguard Robotics</div>
                  <div class="c-id">sub_04fe8812</div>
                </td>
                <td>Starter Squad</td>
                <td><strong>$49.00</strong></td>
                <td><span class="badge-status status-active">ACTIVE</span></td>
                <td><button class="btn-xs" onclick="manageSub('Vanguard')">Portal</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <div class="billing-toast" id="billing-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #07090e;
  --bg-panel: rgba(14, 19, 30, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #38bdf8;
  --accent-blue: #3b82f6;
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

.billing-app { display: flex; flex-direction: column; height: 100vh; font-size: 12px; }

/* Header */
.billing-header {
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
.h-left { display: flex; align-items: center; gap: 12px; }
.billing-logo { font-size: 24px; }
.billing-title { font-size: 16px; font-weight: 800; color: #fff; }
.billing-sub { font-size: 11px; color: var(--text-muted); }

.h-metrics { display: flex; gap: 12px; }
.m-chip { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); padding: 5px 12px; border-radius: 999px; font-size: 11px; display: flex; align-items: center; gap: 6px; }
.chip-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; }

.btn { padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: var(--accent-blue); color: #fff; }
.btn-warn { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--red); }
.btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; }

/* Main */
.billing-main { flex: 1; padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

.action-banner {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.6));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.billing-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 20px; }
.panel-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 14px; font-weight: 800; color: #fff; }
.subhead-meta { font-size: 11px; color: var(--text-muted); }
.search-mini { background: #07090f; border: 1px solid var(--border); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px; outline: none; }

/* Plans */
.plans-list { display: flex; flex-direction: column; gap: 12px; }
.plan-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.plan-row.active-tier { border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.05); }
.plan-name { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 2px; }
.plan-specs { font-size: 11px; color: var(--text-muted); }
.price-big { font-size: 20px; font-weight: 900; color: #fff; }
.price-sub { font-size: 10px; color: var(--text-muted); }
.subs-count { font-size: 10px; font-weight: 700; color: var(--green); background: rgba(16,185,129,0.1); padding: 3px 8px; border-radius: 4px; }

/* Table */
.customers-table-wrap { overflow-x: auto; }
.cust-table { width: 100%; border-collapse: collapse; text-align: left; }
.cust-table th { padding: 8px 10px; color: var(--text-muted); font-size: 10px; border-bottom: 1px solid var(--border); }
.cust-table td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.c-name { font-size: 12px; font-weight: 700; color: #fff; }
.c-id { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.badge-status { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
.status-active { background: rgba(16, 185, 129, 0.15); color: var(--green); }
.status-failed { background: rgba(244, 63, 94, 0.15); color: var(--red); }
.btn-xs { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; }

/* Toast */
.billing-toast {
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
    const toast = document.getElementById('billing-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  window.manageSub = function(name) {
    showToast('Opening Stripe Customer Portal session for: ' + name);
  };

  // Simulate Failed Charge
  document.getElementById('btn-simulate-failed-charge')?.addEventListener('click', () => {
    const badge = document.getElementById('badge-kestrel');
    if (badge) {
      badge.className = 'badge-status status-failed';
      badge.textContent = 'PAST DUE (RETRY 1/3)';
    }
    showToast('⚠️ Simulated failed card on Kestrel Data ($899.00). Dunning sequence initiated.');
  });

  // Run Smart Dunning
  document.getElementById('btn-run-dunning')?.addEventListener('click', () => {
    const badge = document.getElementById('badge-kestrel');
    if (badge) {
      badge.className = 'badge-status status-active';
      badge.textContent = 'ACTIVE (RECOVERED)';
    }
    showToast('✓ Smart dunning recovery complete! Backup card charged $899.00.');
  });

  document.getElementById('btn-export-mrr')?.addEventListener('click', () => {
    showToast('Exported RevRec SaaS metrics CSV (MRR, Churn, Cohorts)');
  });
})();
`
};
