// HelixBio AI Precision Therapeutics Startup Template
// Animated Canvas DNA double-helix, clinical trial pipeline roadmap, and biomarker target selector

const html = `
<div class="bio-container">
  <!-- Nav -->
  <header class="bio-nav">
    <div class="bio-brand">
      <div class="bio-logo">🧬</div>
      <div>
        <div class="bio-name">HelixBio <span class="badge-series">SERIES B • $64M</span></div>
        <div class="bio-sub">AI-Guided Molecular Design & Oncology Therapeutics</div>
      </div>
    </div>

    <nav class="bio-links">
      <a href="#pipeline" class="b-link">Drug Pipeline</a>
      <a href="#canvas-section" class="b-link">Molecular Platform</a>
      <a href="#biomarkers" class="b-link">Biomarker Targets</a>
      <a href="#team" class="b-link">Scientific Board</a>
    </nav>

    <div class="bio-cta">
      <button class="btn btn-outline" id="dataRoomBtn">Request Data Room</button>
      <button class="btn btn-primary" id="partnerBtn">Partner With Us</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="bio-hero" id="canvas-section">
    <div class="hero-left">
      <div class="bio-pill">
        <span class="bio-dot"></span> Nature Biotechnology Published Research
      </div>
      <h1 class="hero-headline">
        Programmable Small Molecules for <span class="text-gradient">Previously Undruggable</span> KRAS Oncology Targets.
      </h1>
      <p class="hero-desc">
        HelixBio combines multi-modal structural biology foundation models with cryo-EM physics engines to compress clinical lead discovery from 4.5 years down to 42 days.
      </p>

      <div class="hero-stats">
        <div class="stat-col">
          <div class="s-val text-cyan">42 Days</div>
          <div class="s-lbl">Hit-to-Lead Speed</div>
        </div>
        <div class="stat-col">
          <div class="s-val text-purple">1.2B+</div>
          <div class="s-lbl">Conformations Screened</div>
        </div>
        <div class="stat-col">
          <div class="s-val text-emerald">3 IND</div>
          <div class="s-lbl">FDA Phase Approvals</div>
        </div>
      </div>
    </div>

    <!-- Canvas Interactive DNA / Molecular Visualizer -->
    <div class="hero-right">
      <div class="canvas-card">
        <div class="canvas-header-bar">
          <span class="bar-title">Cryo-EM Conformation: <code>KRAS-G12D-Allosteric</code></span>
          <span class="bar-tag">60 FPS Realtime</span>
        </div>
        <canvas id="helixCanvas" width="460" height="340"></canvas>
        <div class="canvas-controls">
          <button class="c-btn active" data-helix="fast">Turbo Rotation</button>
          <button class="c-btn" data-helix="slow">High Precision</button>
          <button class="c-btn" id="dockLigandBtn">Simulate Ligand Docking</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Clinical Pipeline Roadmap -->
  <section class="bio-section" id="pipeline">
    <div class="section-tag">THERAPEUTIC ROADMAP</div>
    <h2 class="section-title">Wholly-Owned Oncology & Rare Disease Pipeline</h2>

    <div class="pipeline-table-card">
      <div class="pipe-header-row">
        <div class="pipe-col col-name">Program & Target</div>
        <div class="pipe-col col-ind">Indication</div>
        <div class="pipe-col col-phase">Discovery</div>
        <div class="pipe-col col-phase">Preclinical</div>
        <div class="pipe-col col-phase">Phase I</div>
        <div class="pipe-col col-phase">Phase II</div>
        <div class="pipe-col col-phase">Phase III</div>
      </div>

      <!-- Pipeline Row 1 -->
      <div class="pipe-item-row">
        <div class="pipe-col col-name">
          <span class="drug-id">HLX-401</span>
          <span class="drug-target">KRAS G12D</span>
        </div>
        <div class="pipe-col col-ind">Colorectal & Pancreatic Ductal Carcinoma</div>
        <div class="pipe-track">
          <div class="pipe-progress p-phase2" style="width: 76%;">
            <span class="progress-tooltip">Active Phase II Cohort (N=142)</span>
          </div>
        </div>
      </div>

      <!-- Pipeline Row 2 -->
      <div class="pipe-item-row">
        <div class="pipe-col col-name">
          <span class="drug-id">HLX-709</span>
          <span class="drug-target">EGFR Exon 20</span>
        </div>
        <div class="pipe-col col-ind">Non-Small Cell Lung Cancer (NSCLC)</div>
        <div class="pipe-track">
          <div class="pipe-progress p-phase1" style="width: 54%;">
            <span class="progress-tooltip">Phase I Dose Escalation</span>
          </div>
        </div>
      </div>

      <!-- Pipeline Row 3 -->
      <div class="pipe-item-row">
        <div class="pipe-col col-name">
          <span class="drug-id">HLX-902</span>
          <span class="drug-target">HER2 Bispecific</span>
        </div>
        <div class="pipe-col col-ind">Metastatic HER2-Low Breast Cancer</div>
        <div class="pipe-track">
          <div class="pipe-progress p-preclin" style="width: 32%;">
            <span class="progress-tooltip">GLP Tox & IND Enabling</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Biomarker Target Filter -->
  <section class="bio-section" id="biomarkers">
    <div class="section-tag">AI MOLECULAR SEARCH</div>
    <h2 class="section-title">Explore Genomic Binding Affinities</h2>

    <div class="biomarker-widget">
      <div class="bm-filters">
        <button class="bm-btn active" data-filter="all">All Targets</button>
        <button class="bm-btn" data-filter="lung">Lung / Thoracic</button>
        <button class="bm-btn" data-filter="gi">Gastrointestinal</button>
        <button class="bm-btn" data-filter="cns">CNS / Brain Penetrant</button>
      </div>

      <div class="bm-cards-grid" id="bmGrid">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>

  <!-- Data Room Modal -->
  <div class="bio-modal-overlay" id="modalOverlay">
    <div class="bio-modal">
      <div class="modal-head">
        <div class="modal-title">Institutional Investor Data Room Access</div>
        <button class="modal-close" id="modalClose">✕</button>
      </div>
      <p class="modal-sub">Accredited institutional investors may access IND chemistry, manufacturing, and preclinical toxicity packages.</p>
      
      <form class="modal-form" id="dataRoomForm">
        <div class="form-group">
          <label>Institutional Fund / Firm Name</label>
          <input type="text" placeholder="e.g. Flagship Pioneering / ARCH Venture" required>
        </div>
        <div class="form-group">
          <label>Work Email (@fund.com)</label>
          <input type="email" placeholder="partner@fund.com" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
          Request Confidential Access Key
        </button>
      </form>
    </div>
  </div>
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
  background-color: #040810;
  color: #e2e8f0;
  min-height: 100vh;
}

.bio-container {
  display: flex;
  flex-direction: column;
}

/* Nav */
.bio-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 36px;
  background: rgba(4, 8, 16, 0.85);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #0f1c34;
}

.bio-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bio-logo {
  font-size: 26px;
}

.bio-name {
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-series {
  font-size: 10px;
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
}

.bio-sub {
  font-size: 11px;
  color: #64748b;
}

.bio-links {
  display: flex;
  gap: 28px;
}

@media (max-width: 860px) {
  .bio-links { display: none; }
}

.b-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.15s;
}

.b-link:hover {
  color: #22d3ee;
}

.bio-cta {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
}

.btn-outline {
  background: #0b1528;
  color: #cbd5e1;
  border: 1px solid #1e293b;
}

.btn-outline:hover {
  background: #152238;
}

/* Hero */
.bio-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  padding: 60px 36px 40px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 40px;
  align-items: center;
}

@media (max-width: 900px) {
  .bio-hero { grid-template-columns: 1fr; }
}

.bio-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  color: #22d3ee;
  margin-bottom: 20px;
}

.bio-dot {
  width: 6px;
  height: 6px;
  background: #22d3ee;
  border-radius: 50%;
  box-shadow: 0 0 8px #22d3ee;
}

.hero-headline {
  font-size: 38px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 18px;
  letter-spacing: -0.02em;
}

.text-gradient {
  background: linear-gradient(135deg, #22d3ee, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-stats {
  display: flex;
  gap: 32px;
}

.s-val {
  font-size: 24px;
  font-weight: 800;
  font-family: monospace;
}

.s-lbl {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 4px;
}

.text-cyan { color: #22d3ee; }
.text-purple { color: #c084fc; }
.text-emerald { color: #34d399; }

/* Canvas Card */
.canvas-card {
  background: #09101f;
  border: 1px solid #132240;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.canvas-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}

.bar-title code {
  color: #22d3ee;
  background: #0f1c34;
  padding: 2px 6px;
  border-radius: 4px;
}

.bar-tag {
  color: #34d399;
  font-size: 11px;
}

#helixCanvas {
  width: 100%;
  height: 280px;
  background: #040810;
  border-radius: 8px;
  border: 1px solid #0f1c34;
  display: block;
}

.canvas-controls {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.c-btn {
  background: #0f1c34;
  color: #94a3b8;
  border: 1px solid #1e3a6a;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.c-btn.active, .c-btn:hover {
  background: #22d3ee;
  color: #040810;
  border-color: #22d3ee;
}

/* Pipeline */
.bio-section {
  padding: 60px 36px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-tag {
  font-size: 11px;
  font-weight: 800;
  color: #22d3ee;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 32px;
}

.pipeline-table-card {
  background: #09101f;
  border: 1px solid #132240;
  border-radius: 12px;
  overflow: hidden;
}

.pipe-header-row {
  display: grid;
  grid-template-columns: 200px 240px repeat(5, 1fr);
  padding: 14px 20px;
  background: #0d172e;
  border-bottom: 1px solid #132240;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .pipe-header-row { display: none; }
}

.pipe-item-row {
  display: grid;
  grid-template-columns: 200px 240px 1fr;
  padding: 18px 20px;
  border-bottom: 1px solid #101c34;
  align-items: center;
  gap: 16px;
}

@media (max-width: 900px) {
  .pipe-item-row { grid-template-columns: 1fr; gap: 8px; }
}

.col-name {
  display: flex;
  flex-direction: column;
}

.drug-id {
  font-weight: 800;
  color: #ffffff;
  font-size: 14px;
}

.drug-target {
  font-size: 12px;
  color: #22d3ee;
}

.col-ind {
  font-size: 12px;
  color: #94a3b8;
}

.pipe-track {
  height: 24px;
  background: #040810;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid #0f1c34;
  position: relative;
}

.pipe-progress {
  height: 100%;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  transition: width 0.6s ease;
}

.p-phase2 { background: linear-gradient(90deg, #06b6d4, #3b82f6); }
.p-phase1 { background: linear-gradient(90deg, #8b5cf6, #06b6d4); }
.p-preclin { background: linear-gradient(90deg, #10b981, #06b6d4); }

/* Biomarker Grid */
.bm-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.bm-btn {
  background: #09101f;
  color: #94a3b8;
  border: 1px solid #132240;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.bm-btn.active, .bm-btn:hover {
  background: #06b6d4;
  color: #040810;
  font-weight: 700;
}

.bm-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.bm-card {
  background: #09101f;
  border: 1px solid #132240;
  border-radius: 10px;
  padding: 16px;
}

.bm-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bm-symbol {
  font-size: 15px;
  font-weight: 800;
  color: #22d3ee;
}

.bm-kd {
  font-family: monospace;
  font-size: 11px;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 2px 6px;
  border-radius: 4px;
}

.bm-desc {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
  margin-bottom: 12px;
}

.bm-select-btn {
  width: 100%;
  background: #0f1c34;
  border: 1px solid #1e3a6a;
  color: #22d3ee;
  font-size: 11px;
  font-weight: 600;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
}

/* Modal */
.bio-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.bio-modal-overlay.open { display: flex; }

.bio-modal {
  background: #09101f;
  border: 1px solid #132240;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  padding: 24px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 16px;
  font-weight: 800;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

.modal-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  font-size: 11px;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  background: #040810;
  border: 1px solid #132240;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
}
`;

const javascript = `
(function() {
  // DNA Double-Helix Canvas Animation
  const canvas = document.getElementById('helixCanvas');
  let ctx = null;
  if (canvas) ctx = canvas.getContext('2d');

  let angle = 0;
  let rotationSpeed = 0.03;
  let isDocking = false;
  let dockingGlow = 0;

  function renderHelix() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const points = 24;
    const spacing = 18;
    const startY = centerY - (points * spacing) / 2;
    const radius = 80;

    for (let i = 0; i < points; i++) {
      const y = startY + i * spacing;
      const currentAngle = angle + i * 0.35;

      const x1 = centerX + Math.cos(currentAngle) * radius;
      const z1 = Math.sin(currentAngle);

      const x2 = centerX + Math.cos(currentAngle + Math.PI) * radius;
      const z2 = Math.sin(currentAngle + Math.PI);

      // Connecting nucleotide base pair bridge
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Strand 1 node
      const r1 = 4 + z1 * 2;
      ctx.fillStyle = z1 > 0 ? '#22d3ee' : '#0891b2';
      ctx.beginPath();
      ctx.arc(x1, y, Math.max(2, r1), 0, Math.PI * 2);
      ctx.fill();

      // Strand 2 node
      const r2 = 4 + z2 * 2;
      ctx.fillStyle = z2 > 0 ? '#c084fc' : '#7e22ce';
      ctx.beginPath();
      ctx.arc(x2, y, Math.max(2, r2), 0, Math.PI * 2);
      ctx.fill();

      // Docking Ligand effect in the middle
      if (isDocking && i === 12) {
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, y, 9 + Math.sin(dockingGlow) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        dockingGlow += 0.1;
      }
    }

    angle += rotationSpeed;
    requestAnimationFrame(renderHelix);
  }

  if (canvas) {
    requestAnimationFrame(renderHelix);
  }

  // Helix control buttons
  document.querySelectorAll('.c-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.getAttribute('data-helix');
      if (type === 'fast') {
        rotationSpeed = 0.05;
        document.querySelectorAll('.c-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      } else if (type === 'slow') {
        rotationSpeed = 0.012;
        document.querySelectorAll('.c-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  const dockBtn = document.getElementById('dockLigandBtn');
  if (dockBtn) {
    dockBtn.addEventListener('click', () => {
      isDocking = !isDocking;
      dockBtn.textContent = isDocking ? 'Release Ligand' : 'Simulate Ligand Docking';
    });
  }

  // Biomarkers data
  const biomarkers = [
    { symbol: 'KRAS-G12D', kd: 'Kd: 0.18 nM', cat: 'gi', desc: 'Allosteric pocket binder targeting pancreatic ductal adenocarcinoma mutations.' },
    { symbol: 'EGFR-Ex20', kd: 'Kd: 0.42 nM', cat: 'lung', desc: 'Conformation-selective insertion inhibitor with minimal wild-type toxicity.' },
    { symbol: 'BRAF-V600E', kd: 'Kd: 0.28 nM', cat: 'cns', desc: 'Blood-brain barrier penetrant dimer breaker for metastatic melanoma.' },
    { symbol: 'PIK3CA-H1047R', kd: 'Kd: 0.65 nM', cat: 'gi', desc: 'Kinase domain mutant-selective allosteric degrader.' }
  ];

  const bmGrid = document.getElementById('bmGrid');
  function renderBiomarkers(filter) {
    if (!bmGrid) return;
    bmGrid.innerHTML = '';
    biomarkers.forEach(bm => {
      if (filter && filter !== 'all' && bm.cat !== filter) return;
      const card = document.createElement('div');
      card.className = 'bm-card';
      card.innerHTML = 
        '<div class="bm-head">' +
          '<span class="bm-symbol">' + bm.symbol + '</span>' +
          '<span class="bm-kd">' + bm.kd + '</span>' +
        '</div>' +
        '<div class="bm-desc">' + bm.desc + '</div>' +
        '<button class="bm-select-btn" data-symbol="' + bm.symbol + '">Inspect Binding Pocket</button>';
      bmGrid.appendChild(card);
    });

    document.querySelectorAll('.bm-select-btn').forEach(b => {
      b.addEventListener('click', function() {
        const sym = this.getAttribute('data-symbol');
        document.querySelector('.bar-title code').textContent = sym + '-Allosteric';
        isDocking = true;
        if (dockBtn) dockBtn.textContent = 'Release Ligand';
      });
    });
  }

  renderBiomarkers('all');

  document.querySelectorAll('.bm-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderBiomarkers(this.getAttribute('data-filter'));
    });
  });

  // Modal logic
  const modal = document.getElementById('modalOverlay');
  const openBtn = document.getElementById('dataRoomBtn');
  const closeBtn = document.getElementById('modalClose');
  const form = document.getElementById('dataRoomForm');

  if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.innerHTML = '<div style="color:#34d399;font-weight:700;padding:20px 0;text-align:center;">✓ NDA & Confidential Data Room link dispatched to your work email.</div>';
    });
  }
})();
`;

export default { html, css, javascript };
