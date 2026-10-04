export default {
  html: `
<div class="dashboard-layout" id="dash-app">
  <!-- Sidebar Navigation -->
  <aside class="dash-sidebar">
    <div class="sidebar-brand">
      <div class="brand-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
      </div>
      <div class="brand-text">
        <span class="brand-title">Apex Console</span>
        <span class="brand-env">US-EAST-1 PROD</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">CORE PLATFORM</div>
      <button class="nav-link active" data-view="overview">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Overview</span>
      </button>
      <button class="nav-link" data-view="traffic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Live Telemetry</span>
        <span class="nav-pill pulse">LIVE</span>
      </button>
      <button class="nav-link" data-view="incidents">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>Incidents</span>
        <span class="nav-pill counter" id="incident-badge">0</span>
      </button>
      <button class="nav-link" data-view="nodes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        <span>Mesh Clusters</span>
      </button>

      <div class="nav-section-title" style="margin-top: 24px;">ORGANIZATION</div>
      <button class="nav-link" data-view="billing">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>
        <span>Usage & Billing</span>
      </button>
      <button class="nav-link" data-view="audit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <span>Security Audit</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">DR</div>
        <div class="user-info">
          <div class="user-name">Dr. Elena Ross</div>
          <div class="user-role">Platform Lead</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="dash-main">
    <!-- Top Bar -->
    <header class="dash-topbar">
      <div class="topbar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="filter-input" placeholder="Search clusters, services, trace IDs (Cmd+K)..." />
      </div>

      <div class="topbar-actions">
        <div class="time-range-picker">
          <button class="range-btn active" data-range="1h">1H</button>
          <button class="range-btn" data-range="24h">24H</button>
          <button class="range-btn" data-range="7d">7D</button>
          <button class="range-btn" data-range="30d">30D</button>
        </div>

        <button class="btn-icon" id="btn-export" title="Export Telemetry CSV">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>

        <button class="btn-primary" id="btn-simulate-event">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Trigger Audit Scan</span>
        </button>
      </div>
    </header>

    <!-- Scrollable Body -->
    <div class="dash-body">
      <!-- KPI Stats -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-head">
            <span class="kpi-title">GLOBAL THROUGHPUT</span>
            <span class="kpi-indicator dot-emerald"></span>
          </div>
          <div class="kpi-val" id="stat-req">142,890</div>
          <div class="kpi-foot">
            <span class="delta delta-up">↑ +14.2%</span>
            <span class="kpi-sub">vs previous window</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-head">
            <span class="kpi-title">P99 LATENCY</span>
            <span class="kpi-indicator dot-cyan"></span>
          </div>
          <div class="kpi-val" id="stat-latency">1.84 ms</div>
          <div class="kpi-foot">
            <span class="delta delta-up">↓ -0.42 ms</span>
            <span class="kpi-sub">accelerated cache</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-head">
            <span class="kpi-title">ERROR RATE</span>
            <span class="kpi-indicator dot-emerald"></span>
          </div>
          <div class="kpi-val" id="stat-error">0.0012%</div>
          <div class="kpi-foot">
            <span class="delta delta-up">↓ -0.008%</span>
            <span class="kpi-sub">within 5-nines SLA</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-head">
            <span class="kpi-title">HEALTHY NODES</span>
            <span class="kpi-indicator dot-emerald"></span>
          </div>
          <div class="kpi-val" id="stat-nodes">128 / 128</div>
          <div class="kpi-foot">
            <span class="delta delta-up">100% Online</span>
            <span class="kpi-sub">12 zones connected</span>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="dash-grid-2">
        <!-- SVG Time Series Chart -->
        <div class="panel-box">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Throughput & Ingress Volume</h3>
              <p class="panel-subtitle">Real-time edge transactions per second across global clusters</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color" style="background:#3b82f6;"></span> Edge Requests</span>
              <span class="legend-item"><span class="legend-color" style="background:#10b981;"></span> Cache Hits</span>
            </div>
          </div>

          <div class="chart-canvas-wrap">
            <svg class="timeseries-chart" viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Grid Lines -->
              <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
              <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>

              <!-- Blue Fill Area -->
              <polygon points="0,180 0,130 60,110 120,125 180,95 240,110 300,70 360,85 420,50 480,75 540,40 600,60 600,180" fill="url(#blueGrad)" />
              <!-- Blue Line -->
              <polyline points="0,130 60,110 120,125 180,95 240,110 300,70 360,85 420,50 480,75 540,40 600,60" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" />

              <!-- Emerald Line (Cache) -->
              <polyline points="0,150 60,135 120,140 180,115 240,130 300,90 360,105 420,70 480,90 540,55 600,75" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3" />
            </svg>
          </div>
          <div class="chart-x-axis">
            <span>14:00</span>
            <span>14:15</span>
            <span>14:30</span>
            <span>14:45</span>
            <span>15:00</span>
            <span>15:15 (NOW)</span>
          </div>
        </div>

        <!-- Regional Status Grid -->
        <div class="panel-box">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Regional Edge Mesh Status</h3>
              <p class="panel-subtitle">Latency distribution across primary cloud zones</p>
            </div>
            <button class="btn-xs" id="btn-refresh-mesh">Sync Now</button>
          </div>

          <div class="mesh-regions-list">
            <div class="mesh-row">
              <div class="mesh-info">
                <span class="region-badge">US-EAST</span>
                <span class="mesh-name">N. Virginia (us-east-1)</span>
              </div>
              <div class="mesh-stats">
                <span class="mesh-ping text-emerald">0.9 ms</span>
                <div class="meter-bar"><div class="meter-fill" style="width: 25%; background:#10b981;"></div></div>
                <span class="status-tag status-ok">HEALTHY</span>
              </div>
            </div>

            <div class="mesh-row">
              <div class="mesh-info">
                <span class="region-badge">EU-CENTRAL</span>
                <span class="mesh-name">Frankfurt (eu-central-1)</span>
              </div>
              <div class="mesh-stats">
                <span class="mesh-ping text-emerald">1.4 ms</span>
                <div class="meter-bar"><div class="meter-fill" style="width: 35%; background:#10b981;"></div></div>
                <span class="status-tag status-ok">HEALTHY</span>
              </div>
            </div>

            <div class="mesh-row">
              <div class="mesh-info">
                <span class="region-badge">AP-SOUTH</span>
                <span class="mesh-name">Tokyo (ap-northeast-1)</span>
              </div>
              <div class="mesh-stats">
                <span class="mesh-ping text-emerald">2.1 ms</span>
                <div class="meter-bar"><div class="meter-fill" style="width: 45%; background:#10b981;"></div></div>
                <span class="status-tag status-ok">HEALTHY</span>
              </div>
            </div>

            <div class="mesh-row">
              <div class="mesh-info">
                <span class="region-badge">SA-EAST</span>
                <span class="mesh-name">São Paulo (sa-east-1)</span>
              </div>
              <div class="mesh-stats">
                <span class="mesh-ping text-amber">3.8 ms</span>
                <div class="meter-bar"><div class="meter-fill" style="width: 70%; background:#f59e0b;"></div></div>
                <span class="status-tag status-warn">OPTIMIZING</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Real-Time Event Stream & Service Table -->
      <section class="dash-grid-2" style="margin-top:24px;">
        <!-- Services Table -->
        <div class="panel-box">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Active Services Fleet</h3>
              <p class="panel-subtitle">Containerized microservices running on distributed mesh</p>
            </div>
            <span class="table-count" id="services-count">4 Services</span>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SERVICE</th>
                  <th>REPLICAS</th>
                  <th>CPU / MEM</th>
                  <th>AVG LATENCY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody id="services-tbody">
                <tr>
                  <td>
                    <div class="service-cell">
                      <div class="service-icon">⚡</div>
                      <div>
                        <div class="service-name">auth-gateway-edge</div>
                        <div class="service-desc">v4.1.2 • Rust Wasm</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-bold">32 / 32</span></td>
                  <td>14% / 412MB</td>
                  <td><span class="badge-latency">0.8 ms</span></td>
                  <td><button class="btn-table-action" onclick="restartService('auth-gateway-edge')">Restart</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="service-cell">
                      <div class="service-icon">◈</div>
                      <div>
                        <div class="service-name">billing-dispatcher</div>
                        <div class="service-desc">v2.9.0 • Go 1.22</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-bold">16 / 16</span></td>
                  <td>28% / 880MB</td>
                  <td><span class="badge-latency">1.9 ms</span></td>
                  <td><button class="btn-table-action" onclick="restartService('billing-dispatcher')">Restart</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="service-cell">
                      <div class="service-icon">▲</div>
                      <div>
                        <div class="service-name">vector-index-router</div>
                        <div class="service-desc">v1.8.4 • C++20</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-bold">48 / 48</span></td>
                  <td>45% / 2.4GB</td>
                  <td><span class="badge-latency">3.2 ms</span></td>
                  <td><button class="btn-table-action" onclick="restartService('vector-index-router')">Restart</button></td>
                </tr>
                <tr>
                  <td>
                    <div class="service-cell">
                      <div class="service-icon">✦</div>
                      <div>
                        <div class="service-name">telemetry-aggregator</div>
                        <div class="service-desc">v3.0.1 • Elixir OTP</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-bold">32 / 32</span></td>
                  <td>19% / 640MB</td>
                  <td><span class="badge-latency">1.1 ms</span></td>
                  <td><button class="btn-table-action" onclick="restartService('telemetry-aggregator')">Restart</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Real-Time Event Log Stream -->
        <div class="panel-box">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Live Audit Stream</h3>
              <p class="panel-subtitle">Real-time edge consensus events and security validations</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn-xs" id="btn-pause-stream">Pause Stream</button>
              <button class="btn-xs" id="btn-clear-stream">Clear</button>
            </div>
          </div>

          <div class="log-stream-container" id="log-stream">
            <!-- Populated via JavaScript dynamically -->
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Toast Element -->
  <div class="dash-toast" id="dash-toast"></div>
</div>
`,
  css: `
:root {
  --bg-main: #0c1017;
  --bg-sidebar: #080b11;
  --bg-panel: rgba(16, 22, 34, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.04);
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-purple: #8b5cf6;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-main);
  color: var(--text-main);
  font-family: var(--font-sans);
  height: 100vh;
  overflow: hidden;
}

.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

/* Sidebar */
.dash-sidebar {
  width: 250px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-brand {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}
.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-badge svg { width: 18px; height: 18px; }
.brand-title { font-size: 15px; font-weight: 800; display: block; letter-spacing: -0.3px; }
.brand-env { font-size: 10px; font-weight: 700; color: var(--accent-cyan); letter-spacing: 0.5px; }

.sidebar-nav { flex: 1; padding: 18px 12px; overflow-y: auto; }
.nav-section-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #475569;
  padding: 0 10px;
  margin-bottom: 8px;
}
.nav-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  margin-bottom: 2px;
}
.nav-link svg { width: 16px; height: 16px; }
.nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.04); }
.nav-link.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.nav-pill {
  margin-left: auto;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.nav-pill.pulse { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.nav-pill.counter { background: rgba(244, 63, 94, 0.2); color: var(--accent-rose); }

.sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
.user-card { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #1e293b;
  color: #38bdf8;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-name { font-size: 12px; font-weight: 700; color: #fff; }
.user-role { font-size: 11px; color: var(--text-muted); }

/* Main Area */
.dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Topbar */
.dash-topbar {
  height: 60px;
  background: rgba(12, 16, 23, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.topbar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 14px;
  width: 380px;
}
.topbar-search svg { width: 14px; height: 14px; color: var(--text-muted); }
.topbar-search input {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 12px;
  width: 100%;
}
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.time-range-picker {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  padding: 2px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.range-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.range-btn.active { background: var(--accent-blue); color: #fff; }

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-icon:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
.btn-icon svg { width: 15px; height: 15px; }

.btn-primary {
  background: var(--accent-blue);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-primary svg { width: 14px; height: 14px; }
.btn-primary:hover { background: #2563eb; }

/* Dashboard Body */
.dash-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  backdrop-filter: blur(12px);
  transition: transform 0.2s;
}
.kpi-card:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.3); }
.kpi-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.kpi-title { font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; }
.kpi-indicator { width: 8px; height: 8px; border-radius: 50%; }
.dot-emerald { background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald); }
.dot-cyan { background: var(--accent-cyan); box-shadow: 0 0 8px var(--accent-cyan); }
.kpi-val { font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
.kpi-foot { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.delta { font-weight: 800; }
.delta-up { color: var(--accent-emerald); }
.kpi-sub { color: var(--text-muted); }

/* Grid 2 */
.dash-grid-2 {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
}

.panel-box {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.panel-title { font-size: 15px; font-weight: 800; color: #fff; }
.panel-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.chart-legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); font-weight: 600; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-color { width: 8px; height: 8px; border-radius: 2px; }

/* Chart SVG */
.chart-canvas-wrap { height: 160px; width: 100%; position: relative; }
.timeseries-chart { width: 100%; height: 100%; }
.chart-x-axis {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
  margin-top: 8px;
}

/* Regional Mesh Rows */
.mesh-regions-list { display: flex; flex-direction: column; gap: 10px; }
.mesh-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 10px 14px;
}
.region-badge {
  font-size: 10px;
  font-weight: 800;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}
.mesh-name { font-size: 12px; font-weight: 700; color: #e2e8f0; }
.mesh-stats { display: flex; align-items: center; gap: 12px; }
.mesh-ping { font-size: 12px; font-weight: 800; font-family: var(--font-mono); }
.text-emerald { color: var(--accent-emerald); }
.text-amber { color: var(--accent-amber); }
.meter-bar { width: 60px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.meter-fill { height: 100%; border-radius: 2px; }
.status-tag { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
.status-ok { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.status-warn { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }

/* Table */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
.data-table th { padding: 10px; color: var(--text-muted); font-size: 10px; font-weight: 800; border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 10px; border-bottom: 1px solid var(--border-subtle); color: #cbd5e1; vertical-align: middle; }
.service-cell { display: flex; align-items: center; gap: 10px; }
.service-icon { font-size: 16px; }
.service-name { font-size: 13px; font-weight: 700; color: #fff; }
.service-desc { font-size: 11px; color: var(--text-muted); }
.text-bold { font-weight: 700; color: #fff; }
.badge-latency {
  background: rgba(6, 182, 212, 0.12);
  color: var(--accent-cyan);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-weight: 700;
}
.btn-table-action {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}
.btn-table-action:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }

/* Log Stream */
.log-stream-container {
  height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  background: #090d15;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}
.log-entry {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.02);
}
.log-time { color: #64748b; flex-shrink: 0; }
.log-level { font-weight: 800; flex-shrink: 0; }
.level-info { color: #60a5fa; }
.level-success { color: #34d399; }
.level-warn { color: #fbbf24; }
.log-msg { color: #e2e8f0; }

.btn-xs {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.btn-xs:hover { color: #fff; }

/* Toast */
.dash-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-blue);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-grid-2 { grid-template-columns: 1fr; }
  .dash-sidebar { display: none; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('dash-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  window.restartService = function(name) {
    showToast('Gracefully rolling restart triggered for: ' + name);
  };

  // Nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showToast('Switched view to ' + (link.getAttribute('data-view') || ''));
    });
  });

  // Range buttons
  const rangeBtns = document.querySelectorAll('.range-btn');
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast('Updated metrics window to: ' + btn.textContent);
    });
  });

  // Export CSV
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      showToast('Generated & downloaded apex-telemetry-dump.csv (1.4MB)');
    });
  }

  // Trigger Audit Scan
  const btnSimulate = document.getElementById('btn-simulate-event');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      showToast('Distributed cryptographic security audit initiated. Scanning 128 nodes...');
      addLog('INFO', 'mTLS cert validation completed across 12 zones: 100% compliant');
    });
  }

  // Live Audit Stream simulation
  const logContainer = document.getElementById('log-stream');
  let isStreamPaused = false;

  const sampleMessages = [
    { level: 'INFO', msg: 'edge-pop-02: TLS handshake session resumed (0.4ms)' },
    { level: 'SUCCESS', msg: 'consensus-mesh: Node-78 synchronized block #491028' },
    { level: 'INFO', msg: 'rate-limiter: Token bucket refreshed for tenant tier-enterprise' },
    { level: 'WARN', msg: 'cache-worker: Regional miss on /v2/ledger, routed to persistent store' },
    { level: 'SUCCESS', msg: 'wireguard: Re-keyed secure tunnel session 0xae41' },
    { level: 'INFO', msg: 'auto-scaler: Node load balanced at 18.4% mean compute' }
  ];

  function addLog(level, msg) {
    if (!logContainer || isStreamPaused) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const lvlClass = level === 'SUCCESS' ? 'level-success' : level === 'WARN' ? 'level-warn' : 'level-info';
    entry.innerHTML = '<span class="log-time">' + timeStr + '</span>' +
                      '<span class="log-level ' + lvlClass + '">[' + level + ']</span>' +
                      '<span class="log-msg">' + msg + '</span>';
    logContainer.prepend(entry);
    if (logContainer.children.length > 25) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  // Seed initial logs
  sampleMessages.forEach(item => addLog(item.level, item.msg));

  // Ticker
  const intervalId = setInterval(() => {
    const randomItem = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    addLog(randomItem.level, randomItem.msg);
  }, 3500);

  const btnPause = document.getElementById('btn-pause-stream');
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      isStreamPaused = !isStreamPaused;
      btnPause.textContent = isStreamPaused ? 'Resume Stream' : 'Pause Stream';
      showToast(isStreamPaused ? 'Log stream paused' : 'Log stream resumed');
    });
  }

  const btnClear = document.getElementById('btn-clear-stream');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (logContainer) logContainer.innerHTML = '';
      showToast('Audit stream cleared');
    });
  }

  // Search filter
  const filterInput = document.getElementById('filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#services-tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
})();
`
};
