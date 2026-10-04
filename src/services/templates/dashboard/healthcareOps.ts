// Healthcare ICU & Patient Telemetry Command Center Template
// Live Canvas ECG waveform, ICU bed acuity matrix, ED triage queue, and vital signs monitor

const html = `
<div class="hosp-container">
  <!-- Top Navigation Bar -->
  <header class="hosp-header">
    <div class="hosp-brand">
      <div class="hosp-cross">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
        </svg>
      </div>
      <div>
        <div class="hosp-title">Vitalis Health Central Command</div>
        <div class="hosp-sub">St. Jude Medical Center • Level 1 Trauma ICU Telemetry</div>
      </div>
    </div>

    <!-- Center Stats -->
    <div class="hosp-metrics">
      <div class="hosp-metric">
        <div class="m-val text-red">4</div>
        <div class="m-label">Critical (Acuity 1)</div>
      </div>
      <div class="hosp-metric">
        <div class="m-val text-amber">18</div>
        <div class="m-label">ICU Occupied</div>
      </div>
      <div class="hosp-metric">
        <div class="m-val text-emerald">6</div>
        <div class="m-label">ICU Beds Open</div>
      </div>
      <div class="hosp-metric">
        <div class="m-val text-blue">98.4%</div>
        <div class="m-label">Telemetry Uptime</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="hosp-user-actions">
      <button class="hosp-btn hosp-btn-alert" id="codeBlueSimBtn">
        <span class="pulsing-beacon"></span>
        Simulate Code Blue Alert
      </button>
      <div class="hosp-clock" id="liveClock">14:45:00 UTC</div>
    </div>
  </header>

  <!-- Emergency Banner (Hidden by default) -->
  <div class="hosp-alert-banner" id="alertBanner" style="display: none;">
    <div class="alert-content">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
      <span id="alertBannerText">CODE BLUE: Bed ICU-04 (Room 412) - Ventricular Fibrillation Alert - Crash Team Dispatched</span>
    </div>
    <button class="alert-dismiss-btn" id="dismissAlertBtn">Acknowledge</button>
  </div>

  <!-- Main Grid -->
  <main class="hosp-grid">
    <!-- Left Column: Live Patient Telemetry & ECG -->
    <section class="hosp-card telemetry-card">
      <div class="card-head">
        <div>
          <span class="badge-acuity badge-red">ACUITY LEVEL 1</span>
          <h2 class="card-title" id="selectedPatientName">Bed 04: Jonathan Davis (M, 64)</h2>
          <div class="card-subtitle">Dx: Acute Myocardial Infarction • Attending: Dr. E. Sterling</div>
        </div>
        <div class="vital-status-pill text-emerald">
          <span class="dot-live"></span> Continuous Lead II Telemetry
        </div>
      </div>

      <!-- Real-time Canvas ECG Waveform -->
      <div class="ecg-screen">
        <div class="ecg-header-strip">
          <span>LEAD II • 25mm/s • 10mm/mV • FILTER: DIAGNOSTIC</span>
          <span class="ecg-gain">HR: <strong id="leadHr">78</strong> BPM</span>
        </div>
        <canvas id="ecgCanvas" width="700" height="180"></canvas>
      </div>

      <!-- Vital Signs Cards -->
      <div class="vitals-row">
        <div class="vital-tile vital-hr">
          <div class="v-label">HEART RATE</div>
          <div class="v-reading">
            <span class="v-num" id="vitalHr">78</span>
            <span class="v-unit">BPM</span>
          </div>
          <div class="v-range">Normal: 60-100</div>
        </div>

        <div class="vital-tile vital-spo2">
          <div class="v-label">SpO2 (OXYGEN)</div>
          <div class="v-reading">
            <span class="v-num" id="vitalSpo2">98</span>
            <span class="v-unit">%</span>
          </div>
          <div class="v-range">Target: 95-100%</div>
        </div>

        <div class="vital-tile vital-bp">
          <div class="v-label">NIBP (BLOOD PRES.)</div>
          <div class="v-reading">
            <span class="v-num" id="vitalBp">124/82</span>
            <span class="v-unit">mmHg</span>
          </div>
          <div class="v-range">MAP: 96 mmHg</div>
        </div>

        <div class="vital-tile vital-resp">
          <div class="v-label">RESPIRATION</div>
          <div class="v-reading">
            <span class="v-num" id="vitalResp">16</span>
            <span class="v-unit">rpm</span>
          </div>
          <div class="v-range">Normal: 12-20</div>
        </div>

        <div class="vital-tile vital-temp">
          <div class="v-label">TEMPERATURE</div>
          <div class="v-reading">
            <span class="v-num" id="vitalTemp">37.1</span>
            <span class="v-unit">°C</span>
          </div>
          <div class="v-range">Afebrile (98.8°F)</div>
        </div>
      </div>
    </section>

    <!-- Right Column: Bed Acuity Matrix -->
    <section class="hosp-card">
      <div class="card-head">
        <div>
          <h2 class="card-title">ICU Bed Matrix (Unit 4B)</h2>
          <div class="card-subtitle">Click any bed to switch telemetry view</div>
        </div>
        <div class="bed-filters">
          <button class="bed-filter-btn active" data-filter="all">All (24)</button>
          <button class="bed-filter-btn" data-filter="crit">Critical</button>
        </div>
      </div>

      <div class="bed-grid" id="bedGrid">
        <!-- Bed items dynamically generated -->
      </div>
    </section>

    <!-- Bottom Left: Emergency Triage Queue -->
    <section class="hosp-card">
      <div class="card-head">
        <div>
          <h2 class="card-title">Emergency Department Triage</h2>
          <div class="card-subtitle">Active inbound arrivals & waiting list</div>
        </div>
        <span class="badge-acuity badge-blue">7 Patients Waiting</span>
      </div>

      <div class="triage-list">
        <div class="triage-row crit-high">
          <div class="triage-badge">ESI 1</div>
          <div class="triage-info">
            <div class="triage-name">Sarah M. (Age 31) - Anaphylaxis / Stridor</div>
            <div class="triage-meta">Inbound EMS-4 • ETA 3 min • Trauma Bay 1</div>
          </div>
          <div class="triage-time">Immediate</div>
        </div>

        <div class="triage-row crit-med">
          <div class="triage-badge">ESI 2</div>
          <div class="triage-info">
            <div class="triage-name">Carlos R. (Age 52) - Unstable Angina</div>
            <div class="triage-meta">Troponin: 0.14 ng/mL • Assigned Dr. Chen</div>
          </div>
          <div class="triage-time">Wait: 4m</div>
        </div>

        <div class="triage-row crit-normal">
          <div class="triage-badge">ESI 3</div>
          <div class="triage-info">
            <div class="triage-name">Emma W. (Age 22) - Closed Tibia Fracture</div>
            <div class="triage-meta">X-Ray Completed • Cast Pending</div>
          </div>
          <div class="triage-time">Wait: 22m</div>
        </div>
      </div>
    </section>

    <!-- Bottom Right: On-Call Clinical Staff -->
    <section class="hosp-card">
      <div class="card-head">
        <div>
          <h2 class="card-title">ICU Medical On-Call Roster</h2>
          <div class="card-subtitle">Shift A: 07:00 - 19:00</div>
        </div>
      </div>

      <div class="staff-list">
        <div class="staff-row">
          <div class="staff-avatar">ES</div>
          <div class="staff-info">
            <div class="staff-name">Dr. Eleanor Sterling, MD</div>
            <div class="staff-role">Intensivist / Critical Care Fellow</div>
          </div>
          <button class="page-btn" data-pager="Dr. Sterling">Page Pager</button>
        </div>

        <div class="staff-row">
          <div class="staff-avatar">MK</div>
          <div class="staff-info">
            <div class="staff-name">Dr. Marcus Kim, MD</div>
            <div class="staff-role">Cardiothoracic Surgery Lead</div>
          </div>
          <button class="page-btn" data-pager="Dr. Kim">Page Pager</button>
        </div>

        <div class="staff-row">
          <div class="staff-avatar">AL</div>
          <div class="staff-info">
            <div class="staff-name">Alicia Lowe, RN, BSN</div>
            <div class="staff-role">Charge Nurse - ICU Floor 4</div>
          </div>
          <button class="page-btn" data-pager="Alicia Lowe">Page Pager</button>
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
  background-color: #030712;
  color: #f3f4f6;
  min-height: 100vh;
}

.hosp-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hosp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  padding: 14px 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.hosp-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hosp-cross {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #dc2626;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(220, 38, 38, 0.4);
}

.hosp-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.hosp-sub {
  font-size: 11px;
  color: #94a3b8;
}

.hosp-metrics {
  display: flex;
  gap: 24px;
}

.hosp-metric {
  text-align: center;
}

.m-val {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.m-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.text-red { color: #ef4444; }
.text-amber { color: #f59e0b; }
.text-emerald { color: #10b981; }
.text-blue { color: #38bdf8; }

.hosp-user-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hosp-btn-alert {
  background: rgba(220, 38, 38, 0.15);
  color: #f87171;
  border: 1px solid #dc2626;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.hosp-btn-alert:hover {
  background: #dc2626;
  color: #ffffff;
}

.pulsing-beacon {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-beacon 1.2s infinite;
}

@keyframes pulse-beacon {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.hosp-clock {
  font-family: monospace;
  font-size: 14px;
  color: #38bdf8;
  background: #020617;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #1e293b;
}

.hosp-alert-banner {
  background: linear-gradient(90deg, #b91c1c, #991b1b);
  color: #ffffff;
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slide-down 0.3s ease;
}

@keyframes slide-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 13px;
}

.alert-dismiss-btn {
  background: #ffffff;
  color: #991b1b;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.hosp-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  padding: 20px;
  gap: 20px;
  flex: 1;
}

@media (max-width: 1024px) {
  .hosp-grid {
    grid-template-columns: 1fr;
  }
}

.hosp-card {
  background: #0b1120;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
}

.card-subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.badge-acuity {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-bottom: 6px;
}

.badge-red { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-blue { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }

.vital-status-pill {
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.ecg-screen {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.ecg-header-strip {
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 10px;
  color: #059669;
  margin-bottom: 6px;
}

.ecg-gain {
  color: #10b981;
  font-size: 12px;
}

#ecgCanvas {
  width: 100%;
  height: 140px;
  display: block;
}

.vitals-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
}

.vital-tile {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px;
}

.vital-tile.vital-hr { border-top: 3px solid #10b981; }
.vital-tile.vital-spo2 { border-top: 3px solid #38bdf8; }
.vital-tile.vital-bp { border-top: 3px solid #a855f7; }
.vital-tile.vital-resp { border-top: 3px solid #f59e0b; }
.vital-tile.vital-temp { border-top: 3px solid #ec4899; }

.v-label {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.v-reading {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.v-num {
  font-size: 24px;
  font-weight: 800;
  font-family: monospace;
  color: #ffffff;
}

.v-unit {
  font-size: 11px;
  color: #94a3b8;
}

.v-range {
  font-size: 9px;
  color: #475569;
  margin-top: 4px;
}

/* Bed Grid */
.bed-filters {
  display: flex;
  gap: 8px;
}

.bed-filter-btn {
  background: #1e293b;
  border: none;
  color: #94a3b8;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.bed-filter-btn.active {
  background: #3b82f6;
  color: #ffffff;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  overflow-y: auto;
  max-height: 380px;
}

.bed-card {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.bed-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.bed-card.selected {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4);
}

.bed-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
}

.bed-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot-red { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.dot-amber { background: #f59e0b; }
.dot-green { background: #10b981; }

.bed-hr-val {
  font-size: 14px;
  font-weight: 700;
  font-family: monospace;
  margin-top: 6px;
  color: #ffffff;
}

.bed-patient {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Triage & Staff */
.triage-list, .staff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.triage-row, .staff-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 10px 14px;
}

.triage-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 12px;
}

.crit-high .triage-badge { background: #ef4444; color: #fff; }
.crit-med .triage-badge { background: #f59e0b; color: #000; }
.crit-normal .triage-badge { background: #3b82f6; color: #fff; }

.triage-info, .staff-info {
  flex: 1;
}

.triage-name, .staff-name {
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
}

.triage-meta, .staff-role {
  font-size: 10px;
  color: #64748b;
}

.triage-time {
  font-size: 11px;
  font-weight: 700;
  color: #f87171;
}

.staff-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1e293b;
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  margin-right: 12px;
}

.page-btn {
  background: #1e293b;
  border: 1px solid #334155;
  color: #38bdf8;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #38bdf8;
  color: #020617;
}
`;

const javascript = `
(function() {
  // Clock ticker
  const clockEl = document.getElementById('liveClock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ECG Waveform Canvas Simulation
  const canvas = document.getElementById('ecgCanvas');
  let ctx = null;
  if (canvas) {
    ctx = canvas.getContext('2d');
  }

  let x = 0;
  let prevY = 70;
  let ecgSpeed = 2.5;
  let isArrythmia = false;

  // ECG points template
  function getEcgY(t) {
    const cycle = t % 100;
    const base = 70;
    if (isArrythmia) {
      // Chaotic ventricular rhythm
      return base + Math.sin(t * 0.4) * 35 + (Math.random() * 20 - 10);
    }
    // Normal sinus P-Q-R-S-T wave
    if (cycle > 10 && cycle < 18) {
      return base - Math.sin((cycle - 10) / 8 * Math.PI) * 10; // P wave
    } else if (cycle >= 28 && cycle < 31) {
      return base + 8; // Q wave
    } else if (cycle >= 31 && cycle < 36) {
      return base - 55; // R spike
    } else if (cycle >= 36 && cycle < 40) {
      return base + 18; // S wave
    } else if (cycle > 50 && cycle < 66) {
      return base - Math.sin((cycle - 50) / 16 * Math.PI) * 16; // T wave
    }
    return base + (Math.random() * 2 - 1); // Isoelectric line noise
  }

  let step = 0;
  function renderEcg() {
    if (!ctx || !canvas) return;

    // Erase a moving window ahead of current draw position
    ctx.fillStyle = '#020617';
    ctx.fillRect(x, 0, 16, canvas.height);

    // Draw grid lines faintly
    ctx.strokeStyle = 'rgba(5, 150, 105, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();

    const y = getEcgY(step);

    ctx.strokeStyle = isArrythmia ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = isArrythmia ? 8 : 4;
    ctx.shadowColor = isArrythmia ? '#ef4444' : '#10b981';

    ctx.beginPath();
    ctx.moveTo(x - ecgSpeed, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();

    prevY = y;
    x += ecgSpeed;
    step += 1;

    if (x >= canvas.width) {
      x = 0;
    }

    requestAnimationFrame(renderEcg);
  }

  if (canvas) {
    requestAnimationFrame(renderEcg);
  }

  // Bed matrix sample data
  const beds = [
    { id: '01', patient: 'Robert Hayes', hr: 72, spo2: 99, status: 'green' },
    { id: '02', patient: 'Maria Santos', hr: 84, spo2: 97, status: 'green' },
    { id: '03', patient: 'David Miller', hr: 91, spo2: 95, status: 'amber' },
    { id: '04', patient: 'Jonathan Davis', hr: 78, spo2: 98, status: 'red', selected: true },
    { id: '05', patient: 'Emily Taylor', hr: 68, spo2: 99, status: 'green' },
    { id: '06', patient: 'Anthony Lee', hr: 112, spo2: 92, status: 'red' },
    { id: '07', patient: 'Grace Kim', hr: 76, spo2: 98, status: 'green' },
    { id: '08', patient: 'William Clark', hr: 80, spo2: 97, status: 'green' },
    { id: '09', patient: 'Linda Brown', hr: 65, spo2: 98, status: 'green' },
    { id: '10', patient: 'James Wilson', hr: 98, spo2: 94, status: 'amber' },
    { id: '11', patient: 'Patricia Moore', hr: 74, spo2: 99, status: 'green' },
    { id: '12', patient: 'Thomas Jackson', hr: 88, spo2: 96, status: 'green' }
  ];

  const bedGrid = document.getElementById('bedGrid');
  function renderBeds(filter) {
    if (!bedGrid) return;
    bedGrid.innerHTML = '';
    beds.forEach(bed => {
      if (filter === 'crit' && bed.status === 'green') return;
      const card = document.createElement('div');
      card.className = 'bed-card' + (bed.selected ? ' selected' : '');
      card.innerHTML = 
        '<div class="bed-top">' +
          '<span>BED ' + bed.id + '</span>' +
          '<span class="bed-dot dot-' + bed.status + '"></span>' +
        '</div>' +
        '<div class="bed-hr-val">' + bed.hr + ' <small style="font-size:9px;color:#94a3b8">BPM</small></div>' +
        '<div class="bed-patient">' + bed.patient + '</div>';
      
      card.addEventListener('click', () => {
        beds.forEach(b => b.selected = false);
        bed.selected = true;
        renderBeds(filter);
        document.getElementById('selectedPatientName').textContent = 'Bed ' + bed.id + ': ' + bed.patient;
        document.getElementById('vitalHr').textContent = bed.hr;
        document.getElementById('vitalSpo2').textContent = bed.spo2;
        document.getElementById('leadHr').textContent = bed.hr;
      });

      bedGrid.appendChild(card);
    });
  }

  renderBeds('all');

  // Bed filter buttons
  document.querySelectorAll('.bed-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.bed-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderBeds(this.getAttribute('data-filter'));
    });
  });

  // Code Blue alert simulation
  const codeBlueBtn = document.getElementById('codeBlueSimBtn');
  const alertBanner = document.getElementById('alertBanner');
  const dismissBtn = document.getElementById('dismissAlertBtn');

  if (codeBlueBtn && alertBanner) {
    codeBlueBtn.addEventListener('click', () => {
      isArrythmia = true;
      alertBanner.style.display = 'flex';
      document.getElementById('vitalHr').textContent = '172';
      document.getElementById('vitalHr').style.color = '#ef4444';
      document.getElementById('vitalSpo2').textContent = '86';
      document.getElementById('vitalSpo2').style.color = '#ef4444';
      document.getElementById('vitalBp').textContent = '65/40';
      document.getElementById('leadHr').textContent = 'V-FIB 172';
    });
  }

  if (dismissBtn && alertBanner) {
    dismissBtn.addEventListener('click', () => {
      isArrythmia = false;
      alertBanner.style.display = 'none';
      document.getElementById('vitalHr').textContent = '78';
      document.getElementById('vitalHr').style.color = '#ffffff';
      document.getElementById('vitalSpo2').textContent = '98';
      document.getElementById('vitalSpo2').style.color = '#ffffff';
      document.getElementById('vitalBp').textContent = '124/82';
      document.getElementById('leadHr').textContent = '78';
    });
  }

  // Pager buttons
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const recipient = this.getAttribute('data-pager');
      const origText = this.textContent;
      this.textContent = 'Paged ✓';
      this.style.background = '#10b981';
      this.style.color = '#020617';
      setTimeout(() => {
        this.textContent = origText;
        this.style.background = '#1e293b';
        this.style.color = '#38bdf8';
      }, 2000);
    });
  });
})();
`;

export default { html, css, javascript };
