// CloudPrism Multi-Cloud FinOps Hub Template
// Multi-cloud spend breakdown, zombie resource detector, anomaly spike alerts, and reservation right-sizing

const html = `
<div class="fin-container">
  <!-- Header Bar -->
  <header class="fin-header">
    <div class="fin-brand">
      <div class="fin-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <div class="fin-title">CloudPrism FinOps Intelligence</div>
        <div class="fin-sub">Multi-Cloud Spend Observability & Automated Cost Pruning</div>
      </div>
    </div>

    <!-- Center Cloud Connectors -->
    <div class="cloud-pills">
      <span class="c-pill active-pill">AWS (us-east-1, eu-west-1)</span>
      <span class="c-pill active-pill">GCP (us-central1)</span>
      <span class="c-pill active-pill">Azure Kubernetes Service</span>
    </div>

    <!-- Actions -->
    <div class="fin-actions">
      <button class="fin-btn fin-btn-outline" id="exportReportBtn">Export FinOps PDF</button>
      <button class="fin-btn fin-btn-primary" id="pruneZombieBtn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Prune 6 Idle Zombies (-$3,420/mo)
      </button>
    </div>
  </header>

  <!-- Top Metrics Overview -->
  <section class="fin-metrics-strip">
    <div class="m-card">
      <div class="m-title">Total Projected Spend (Current Month)</div>
      <div class="m-number text-white">$48,240<small>.00</small></div>
      <div class="m-trend trend-down">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
        14.2% lower than prior month (Post Right-Sizing)
      </div>
    </div>

    <div class="m-card">
      <div class="m-title">Identified Waste & Idle Resources</div>
      <div class="m-number text-amber" id="wasteAmt">$5,820<small>/mo</small></div>
      <div class="m-trend text-dim">6 unattached EBS, 2 idle GPU pods</div>
    </div>

    <div class="m-card">
      <div class="m-title">Committed Use / Reserved Coverage</div>
      <div class="m-number text-emerald">88.4%</div>
      <div class="m-trend text-emerald">Optimal 3-year RI blend</div>
    </div>

    <div class="m-card">
      <div class="m-title">Active Anomaly Spikes Detected</div>
      <div class="m-number text-red" id="anomalyCount">1 Spike</div>
      <div class="m-trend text-red">OpenAI API token ingestion spike</div>
    </div>
  </section>

  <!-- Main Grid -->
  <main class="fin-grid">
    <!-- Spend Breakdown Donut Chart -->
    <section class="fin-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Cloud Spend by Infrastructure Provider</h2>
          <div class="panel-sub">Aggregated cost allocation across linked accounts</div>
        </div>
      </div>

      <div class="donut-wrap">
        <svg class="donut-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#1e293b" stroke-width="24"/>
          <!-- AWS slice (54%) -->
          <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" stroke-width="24" stroke-dasharray="237 440" stroke-dashoffset="0"/>
          <!-- GCP slice (28%) -->
          <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" stroke-width="24" stroke-dasharray="123 440" stroke-dashoffset="-237"/>
          <!-- Azure slice (18%) -->
          <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" stroke-width="24" stroke-dasharray="80 440" stroke-dashoffset="-360"/>
        </svg>
        <div class="donut-center">
          <div class="dc-label">Total Spend</div>
          <div class="dc-val">$48.2k</div>
        </div>
      </div>

      <div class="provider-legend">
        <div class="legend-row">
          <div class="l-left"><span class="dot-color bg-amber"></span> Amazon Web Services (AWS)</div>
          <div class="l-right">$26,050 (54%)</div>
        </div>
        <div class="legend-row">
          <div class="l-left"><span class="dot-color bg-blue"></span> Google Cloud Platform (GCP)</div>
          <div class="l-right">$13,500 (28%)</div>
        </div>
        <div class="legend-row">
          <div class="l-left"><span class="dot-color bg-emerald"></span> Microsoft Azure AKS</div>
          <div class="l-right">$8,690 (18%)</div>
        </div>
      </div>
    </section>

    <!-- Waste & Zombie Resource Table -->
    <section class="fin-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Zombie Cloud Resources Detector</h2>
          <div class="panel-sub">Unattached volumes, 0% CPU pods, and abandoned load balancers</div>
        </div>
        <span class="badge-waste">Waste Detected</span>
      </div>

      <div class="zombie-list" id="zombieList">
        <div class="zombie-item" id="z1">
          <div class="z-info">
            <div class="z-name">AWS gp3 EBS: vol-09f4b182a (3,000 GB)</div>
            <div class="z-meta">Unattached for 42 days • us-east-1</div>
          </div>
          <div class="z-cost">+$480/mo</div>
          <button class="z-prune-btn" data-target="z1" data-val="480">Terminate</button>
        </div>

        <div class="zombie-item" id="z2">
          <div class="z-info">
            <div class="z-name">GCP A100 GPU Instance: ml-training-worker-04</div>
            <div class="z-meta">0.2% CPU last 7 days • us-central1-a</div>
          </div>
          <div class="z-cost">+$2,140/mo</div>
          <button class="z-prune-btn" data-target="z2" data-val="2140">Terminate</button>
        </div>

        <div class="zombie-item" id="z3">
          <div class="z-info">
            <div class="z-name">Azure ALB: prod-legacy-alb-internal</div>
            <div class="z-meta">Zero active HTTP targets • West US 2</div>
          </div>
          <div class="z-cost">+$320/mo</div>
          <button class="z-prune-btn" data-target="z3" data-val="320">Terminate</button>
        </div>

        <div class="zombie-item" id="z4">
          <div class="z-info">
            <div class="z-name">AWS NAT Gateway: nat-04ab82e</div>
            <div class="z-meta">0 bytes egress in 14 days • us-east-1b</div>
          </div>
          <div class="z-cost">+$480/mo</div>
          <button class="z-prune-btn" data-target="z4" data-val="480">Terminate</button>
        </div>
      </div>
    </section>
  </main>
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
  background-color: #0b0f19;
  color: #e2e8f0;
  min-height: 100vh;
}

.fin-container {
  display: flex;
  flex-direction: column;
}

.fin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
  flex-wrap: wrap;
  gap: 16px;
}

.fin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fin-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
}

.fin-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.fin-sub {
  font-size: 11px;
  color: #94a3b8;
}

.cloud-pills {
  display: flex;
  gap: 8px;
}

@media (max-width: 900px) {
  .cloud-pills { display: none; }
}

.c-pill {
  font-size: 11px;
  background: #1f2937;
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #374151;
}

.fin-actions {
  display: flex;
  gap: 12px;
}

.fin-btn {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.fin-btn-primary {
  background: #dc2626;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.fin-btn-primary:hover {
  background: #b91c1c;
}

.fin-btn-outline {
  background: #1f2937;
  color: #cbd5e1;
  border: 1px solid #374151;
}

.fin-btn-outline:hover {
  background: #374151;
}

/* Metric Strip */
.fin-metrics-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 24px 28px 0;
}

.m-card {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 18px;
}

.m-title {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.m-number {
  font-size: 26px;
  font-weight: 800;
  font-family: monospace;
  margin-bottom: 6px;
}

.m-number small {
  font-size: 14px;
  color: #6b7280;
}

.m-trend {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-down { color: #10b981; }
.text-white { color: #ffffff; }
.text-amber { color: #f59e0b; }
.text-emerald { color: #10b981; }
.text-red { color: #ef4444; }
.text-dim { color: #64748b; }

/* Main Grid */
.fin-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 20px;
  padding: 20px 28px;
}

@media (max-width: 960px) {
  .fin-grid { grid-template-columns: 1fr; }
}

.fin-panel {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #f3f4f6;
}

.panel-sub {
  font-size: 11px;
  color: #6b7280;
}

.badge-waste {
  font-size: 10px;
  font-weight: 800;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Donut Chart */
.donut-wrap {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 20px;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dc-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
}

.dc-val {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}

.provider-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 8px 12px;
  background: #0b0f19;
  border-radius: 6px;
  border: 1px solid #1f2937;
}

.l-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bg-amber { background: #f59e0b; }
.bg-blue { background: #3b82f6; }
.bg-emerald { background: #10b981; }

.l-right {
  font-family: monospace;
  font-weight: 700;
  color: #f1f5f9;
}

/* Zombie List */
.zombie-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zombie-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0b0f19;
  border: 1px solid #1f2937;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.zombie-item.pruned {
  opacity: 0.3;
  text-decoration: line-through;
  pointer-events: none;
}

.z-info {
  flex: 1;
}

.z-name {
  font-size: 12px;
  font-weight: 700;
  color: #f3f4f6;
}

.z-meta {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.z-cost {
  font-size: 14px;
  font-weight: 800;
  font-family: monospace;
  color: #ef4444;
  margin-right: 14px;
}

.z-prune-btn {
  background: #1f2937;
  border: 1px solid #374151;
  color: #f87171;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.z-prune-btn:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}
`;

const javascript = `
(function() {
  let totalWaste = 5820;
  const wasteAmt = document.getElementById('wasteAmt');
  const pruneAllBtn = document.getElementById('pruneZombieBtn');
  const exportBtn = document.getElementById('exportReportBtn');

  // Prune single items
  document.querySelectorAll('.z-prune-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const val = parseInt(this.getAttribute('data-val'), 10);
      const row = document.getElementById(targetId);
      if (row) {
        row.classList.add('pruned');
        this.textContent = 'Terminated';
        totalWaste = Math.max(0, totalWaste - val);
        if (wasteAmt) wasteAmt.innerHTML = '$' + totalWaste.toLocaleString() + '<small>/mo</small>';
      }
    });
  });

  // Prune all zombies button
  if (pruneAllBtn) {
    pruneAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.zombie-item').forEach(item => {
        item.classList.add('pruned');
      });
      document.querySelectorAll('.z-prune-btn').forEach(b => {
        b.textContent = 'Terminated';
      });
      totalWaste = 0;
      if (wasteAmt) wasteAmt.innerHTML = '$0<small>/mo</small>';
      pruneAllBtn.textContent = 'All Zombies Pruned ✓';
      pruneAllBtn.style.background = '#10b981';
    });
  }

  // Export report
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportBtn.textContent = 'Generating PDF...';
      setTimeout(() => {
        exportBtn.textContent = 'PDF Downloaded ✓';
        setTimeout(() => {
          exportBtn.textContent = 'Export FinOps PDF';
        }, 2000);
      }, 1000);
    });
  }
})();
`;

export default { html, css, javascript };
