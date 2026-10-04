export default {
  html: `
<div class="telemetry-app">
  <!-- Top Bar -->
  <header class="telemetry-header">
    <div class="header-left">
      <div class="logo-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <div>
        <h1 class="logo-text">PulseGuard APM</h1>
        <div class="logo-sub">Multi-Cloud Infrastructure Telemetry</div>
      </div>
    </div>

    <div class="cluster-summary">
      <div class="sum-pill"><span class="sum-dot green"></span> Clusters: <strong>12 Active</strong></div>
      <div class="sum-pill"><span class="sum-dot green"></span> Nodes: <strong id="sum-healthy-nodes">24 / 24 Healthy</strong></div>
      <div class="sum-pill"><span class="sum-dot green"></span> Error Budget: <strong>94.2% Remaining</strong></div>
    </div>

    <div class="header-right">
      <button class="btn btn-warn" id="btn-simulate-outage">Simulate P1 Spike</button>
      <button class="btn btn-primary" id="btn-auto-remediate">Auto-Remediate</button>
    </div>
  </header>

  <!-- Workspace Grid -->
  <div class="telemetry-workspace">
    <!-- Main Content -->
    <main class="telemetry-content">
      <!-- Query Bar -->
      <div class="query-panel">
        <div class="query-prefix">PromQL:</div>
        <input type="text" class="query-input" id="promql-input" value="sum by (service) (rate(http_requests_total{status=~'5..'}[5m]))" />
        <button class="btn btn-primary" id="btn-run-query">Execute Query</button>
      </div>

      <!-- Node Heat Grid -->
      <div class="panel-card">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Kubernetes Cluster Node Heatmap (us-east-1)</h2>
            <p class="panel-sub">Real-time CPU and memory allocation across 24 dedicated worker pods</p>
          </div>
          <div class="heat-legend">
            <span class="legend-chip"><span class="chip-color green"></span> &lt; 50% Nominal</span>
            <span class="legend-chip"><span class="chip-color amber"></span> 50-85% High</span>
            <span class="legend-chip"><span class="chip-color red"></span> &gt; 85% Critical</span>
          </div>
        </div>

        <div class="node-grid" id="node-grid">
          <!-- 24 nodes generated via JS -->
        </div>
      </div>

      <!-- Two Column Metrics -->
      <div class="metrics-split-grid">
        <div class="panel-card">
          <div class="panel-head">
            <h3 class="panel-title">p95 & p99 Distributed Latency</h3>
            <span class="badge-accent">Mean: 1.2ms</span>
          </div>
          <div class="chart-box">
            <svg viewBox="0 0 500 120" class="mini-chart">
              <polyline points="0,90 50,85 100,70 150,80 200,60 250,75 300,50 350,65 400,45 450,55 500,40" fill="none" stroke="#38bdf8" stroke-width="2.5" />
              <polyline points="0,110 50,105 100,95 150,100 200,85 250,95 300,75 350,85 400,65 450,75 500,60" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3" />
            </svg>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-head">
            <h3 class="panel-title">Active Incident Pager & Triage</h3>
            <span class="status-indicator-badge" id="pager-badge">0 Active P1 Incidents</span>
          </div>
          <div class="incident-feed" id="incident-feed">
            <div class="incident-item empty" id="no-incidents-msg">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>All 24 nodes nominal. Zero active SLA alerts or customer-impacting degradation.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <div class="telemetry-toast" id="telemetry-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #080b12;
  --bg-panel: rgba(15, 21, 34, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #38bdf8;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
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

.telemetry-app { display: flex; flex-direction: column; height: 100vh; }

/* Header */
.telemetry-header {
  height: 64px;
  background: rgba(12, 16, 26, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-rose), #9333ea);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.logo-box svg { width: 18px; height: 18px; }
.logo-text { font-size: 16px; font-weight: 800; color: #fff; }
.logo-sub { font-size: 11px; color: var(--text-muted); }

.cluster-summary { display: flex; gap: 14px; }
.sum-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
}
.sum-dot { width: 6px; height: 6px; border-radius: 50%; }
.sum-dot.green { background: var(--accent-emerald); box-shadow: 0 0 6px var(--accent-emerald); }
.sum-dot.red { background: var(--accent-rose); box-shadow: 0 0 6px var(--accent-rose); }

.header-right { display: flex; gap: 10px; }
.btn {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--accent-blue); color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-warn { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--accent-rose); }
.btn-warn:hover { background: rgba(244, 63, 94, 0.25); }

/* Main Area */
.telemetry-content { flex: 1; padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

/* Query Panel */
.query-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
}
.query-prefix { font-family: var(--font-mono); font-size: 12px; font-weight: 800; color: var(--accent-cyan); }
.query-input {
  flex: 1;
  background: #060910;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
}
.query-input:focus { border-color: var(--accent-cyan); }

/* Panel Card */
.panel-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.panel-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.panel-title { font-size: 14px; font-weight: 800; color: #fff; }
.panel-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

/* Heat Legend */
.heat-legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); }
.legend-chip { display: flex; align-items: center; gap: 6px; }
.chip-color { width: 8px; height: 8px; border-radius: 2px; }
.chip-color.green { background: #10b981; }
.chip-color.amber { background: #f59e0b; }
.chip-color.red { background: #f43f5e; }

/* Node Grid */
.node-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}
.node-box {
  background: #0a0e17;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}
.node-box:hover { transform: translateY(-2px); border-color: rgba(56, 189, 248, 0.4); }
.node-name { font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.node-cpu { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); margin-bottom: 6px; }
.node-status-bar { height: 4px; border-radius: 2px; background: #10b981; width: 100%; }

.node-box.degraded .node-status-bar { background: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
.node-box.degraded { border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.05); }

/* Split */
.metrics-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-box { height: 120px; width: 100%; }
.mini-chart { width: 100%; height: 100%; }
.badge-accent { font-size: 11px; color: var(--accent-cyan); font-weight: 700; background: rgba(56, 189, 248, 0.1); padding: 4px 8px; border-radius: 4px; }
.status-indicator-badge { font-size: 11px; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px; }
.status-indicator-badge.critical { color: var(--accent-rose); background: rgba(244, 63, 94, 0.15); }

.incident-feed { min-height: 90px; display: flex; align-items: center; justify-content: center; }
.incident-item.empty { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-muted); text-align: left; }
.incident-item.active-alert {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 12px 16px;
  border-radius: 8px;
  width: 100%;
  font-size: 12px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Toast */
.telemetry-toast {
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
    const toast = document.getElementById('telemetry-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // Populate 24 nodes
  const nodeGrid = document.getElementById('node-grid');
  if (nodeGrid) {
    let html = '';
    for (let i = 1; i <= 24; i++) {
      const pad = String(i).padStart(2, '0');
      const cpu = Math.floor(Math.random() * 25) + 15;
      html += 
        '<div class="node-box" id="node-' + pad + '">' +
          '<div class="node-name">node-' + pad + '</div>' +
          '<div class="node-cpu">CPU ' + cpu + '%</div>' +
          '<div class="node-status-bar"></div>' +
        '</div>';
    }
    nodeGrid.innerHTML = html;
  }

  // Simulate Outage
  const btnSimulate = document.getElementById('btn-simulate-outage');
  const btnRemediate = document.getElementById('btn-auto-remediate');
  const incidentFeed = document.getElementById('incident-feed');
  const pagerBadge = document.getElementById('pager-badge');
  const sumNodes = document.getElementById('sum-healthy-nodes');

  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      // Degrade 3 nodes
      ['node-04', 'node-09', 'node-17'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.className = 'node-box degraded';
          const cpuEl = el.querySelector('.node-cpu');
          if (cpuEl) cpuEl.textContent = 'CPU 98%';
        }
      });

      if (pagerBadge) {
        pagerBadge.className = 'status-indicator-badge critical';
        pagerBadge.textContent = '🚨 1 Active P1: Latency Spike in node-04/09/17';
      }
      if (sumNodes) {
        sumNodes.textContent = '21 / 24 Healthy (3 Degraded)';
      }
      if (incidentFeed) {
        incidentFeed.innerHTML = 
          '<div class="incident-item active-alert">' +
            '<div>' +
              '<strong style="color:#f43f5e;">P1 Incident #4092:</strong> Memory saturation in ingress-worker pool.' +
              '<div style="font-size:11px; color:#cbd5e1; margin-top:2px;">Triggered at 15:18 UTC • On-call team paged via PagerDuty</div>' +
            '</div>' +
            '<button class="btn btn-primary" onclick="window.remediateNow()">Auto-Drain</button>' +
          '</div>';
      }
      showToast('⚠️ P1 Incident simulated! 3 nodes degraded. Alert paged to on-call.');
    });
  }

  window.remediateNow = function() {
    ['node-04', 'node-09', 'node-17'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.className = 'node-box';
        const cpuEl = el.querySelector('.node-cpu');
        if (cpuEl) cpuEl.textContent = 'CPU 22%';
      }
    });

    if (pagerBadge) {
      pagerBadge.className = 'status-indicator-badge';
      pagerBadge.textContent = '0 Active P1 Incidents';
    }
    if (sumNodes) {
      sumNodes.textContent = '24 / 24 Healthy';
    }
    if (incidentFeed) {
      incidentFeed.innerHTML = 
        '<div class="incident-item empty">' +
          '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<span>Nodes cordoned, drained, and redeployed. All 24 nodes restored to nominal health.</span>' +
        '</div>';
    }
    showToast('✓ Auto-remediation complete: 3 nodes cordoned & replaced.');
  };

  if (btnRemediate) {
    btnRemediate.addEventListener('click', window.remediateNow);
  }

  const btnQuery = document.getElementById('btn-run-query');
  if (btnQuery) {
    btnQuery.addEventListener('click', () => {
      showToast('Query executed against Prometheus in 18ms (142 metric vectors returned)');
    });
  }
})();
`
};
