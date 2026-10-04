// Atelier Forma Luxury Architecture & Interiors Business Template
// High-end architectural atelier, interactive Before/After renovation slider, and material sample palette

const html = `
<div class="arch-app">
  <!-- Nav -->
  <header class="arch-nav">
    <div class="arch-brand">
      <div class="arch-logo">A•F</div>
      <div>
        <div class="arch-name">ATELIER FORMA</div>
        <div class="arch-sub">Architecture & Interior Spatial Design • Zurich & Milan</div>
      </div>
    </div>

    <nav class="arch-links">
      <a href="#projects" class="a-link">Monographs</a>
      <a href="#comparison" class="a-link">Before / After</a>
      <a href="#materials" class="a-link">Materiality</a>
      <a href="#studio" class="a-link">Philosophy</a>
    </nav>

    <div class="arch-cta">
      <button class="arch-book-btn" id="bookConsultBtn">Request Private Consultation</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="arch-hero">
    <div class="hero-left">
      <span class="hero-edition">SELECTED MONOGRAPH NO. 14</span>
      <h1 class="hero-title">
        Spaces Sculpted by Light, Raw Stone & Timeless Monolithic Geometries.
      </h1>
      <p class="hero-p">
        Atelier Forma creates bespoke residential sanctuaries and cultural pavilions that harmonize brutalist structural honesty with warm tactile European minimalism.
      </p>

      <div class="hero-facts">
        <div class="fact-col">
          <div class="f-num">38</div>
          <div class="f-lbl">Built Residencies</div>
        </div>
        <div class="fact-col">
          <div class="f-num">RIBA</div>
          <div class="f-lbl">Gold Medal Honor</div>
        </div>
        <div class="fact-col">
          <div class="f-num">100%</div>
          <div class="f-lbl">Passive Solar Mass</div>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <div class="project-hero-card">
        <div class="project-render-visual">
          <div class="render-overlay">
            <span class="p-loc">Alpine Villa • St. Moritz</span>
            <span class="p-year">2026 Completed</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Before / After Renovation Comparison Slider -->
  <section class="arch-section" id="comparison">
    <div class="section-tag">SPATIAL TRANSFORMATION</div>
    <h2 class="section-heading">Before & After: 19th-Century Milanese Palazzo Restoration</h2>

    <div class="slider-comparison-card">
      <div class="comparison-container" id="compContainer">
        <!-- Before Layer -->
        <div class="comp-layer comp-before">
          <div class="layer-content before-bg">
            <span class="layer-badge">ORIGINAL 1894 DILAPIDATED CONDITION</span>
          </div>
        </div>

        <!-- After Layer -->
        <div class="comp-layer comp-after" id="afterLayer">
          <div class="layer-content after-bg">
            <span class="layer-badge badge-after">ATELIER FORMA CONTEMPORARY RESTORATION</span>
          </div>
        </div>

        <!-- Drag Divider Handle -->
        <div class="comp-handle" id="compHandle">
          <div class="handle-line"></div>
          <div class="handle-pill">⟷</div>
        </div>
      </div>
      <div class="comp-hint">Drag the slider horizontally to reveal the architectural transformation</div>
    </div>
  </section>

  <!-- Interactive Materiality Board -->
  <section class="arch-section" id="materials">
    <div class="section-tag">TACTILE CURATION</div>
    <h2 class="section-heading">Architectural Materiality & Textures</h2>

    <div class="materials-grid">
      <div class="mat-card">
        <div class="mat-swatch swatch-travertine"></div>
        <div class="mat-info">
          <div class="mat-name">Roman Vein-Cut Travertine</div>
          <div class="mat-origin">Tivoli Quarries, Italy • Fluted Hone</div>
          <div class="mat-desc">Porous thermal stone that absorbs gentle indirect daylight with creamy warm reflections.</div>
        </div>
      </div>

      <div class="mat-card">
        <div class="mat-swatch swatch-oak"></div>
        <div class="mat-info">
          <div class="mat-name">Smoked French White Oak</div>
          <div class="mat-origin">Burgundy, France • Fumed Natural Oil</div>
          <div class="mat-desc">Wide-plank hand-scraped timber aged 200 years for acoustic dampening and tactile softness.</div>
        </div>
      </div>

      <div class="mat-card">
        <div class="mat-swatch swatch-steel"></div>
        <div class="mat-info">
          <div class="mat-name">Blackened Patinated Bronze</div>
          <div class="mat-origin">Zurich Foundry • Hand-Burnished</div>
          <div class="mat-desc">Architectural millwork hardware and slim window mullions designed to oxidize gracefully.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Consultation Booking Modal -->
  <div class="arch-modal-overlay" id="consultModal">
    <div class="arch-modal">
      <div class="modal-top">
        <div class="modal-title">Private Architectural Consultation</div>
        <button class="modal-close" id="consultClose">✕</button>
      </div>
      <p class="modal-sub">Meet with Founding Partner Julien De Smet at our Zurich or Milan atelier.</p>
      
      <form class="modal-form" id="consultForm">
        <div class="f-group">
          <label>Full Name</label>
          <input type="text" placeholder="e.g. Marcella Rossi" required>
        </div>
        <div class="f-group">
          <label>Project Scope</label>
          <select class="f-select">
            <option>Ground-Up Luxury Residence (5,000+ sq ft)</option>
            <option>Heritage Estate Adaptive Reuse / Restoration</option>
            <option>Commercial Atelier / Boutique Hospitality</option>
          </select>
        </div>
        <div class="f-group">
          <label>Estimated Construction Budget</label>
          <select class="f-select">
            <option>€2.5M – €5.0M</option>
            <option>€5.0M – €10.0M</option>
            <option>€10.0M+ Super-Prime</option>
          </select>
        </div>
        <button type="submit" class="arch-book-btn" style="width: 100%; margin-top: 10px;">
          Submit Confidential Inquiry
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
  background-color: #0d0d0e;
  color: #e2e2e5;
  min-height: 100vh;
}

.arch-app {
  display: flex;
  flex-direction: column;
}

/* Nav */
.arch-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  background: #0d0d0e;
  border-bottom: 1px solid #1f1f23;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-wrap: wrap;
  gap: 16px;
}

.arch-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.arch-logo {
  font-family: serif;
  font-size: 20px;
  font-weight: 700;
  border: 1px solid #3f3f46;
  padding: 6px 12px;
  letter-spacing: 0.1em;
}

.arch-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #ffffff;
}

.arch-sub {
  font-size: 11px;
  color: #71717a;
  letter-spacing: 0.05em;
}

.arch-links {
  display: flex;
  gap: 32px;
}

@media (max-width: 860px) {
  .arch-links { display: none; }
}

.a-link {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.2s;
}

.a-link:hover {
  color: #ffffff;
}

.arch-book-btn {
  background: #ffffff;
  color: #000000;
  border: none;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px 20px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.arch-book-btn:hover {
  background: #d4d4d8;
}

/* Hero */
.arch-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  padding: 80px 48px 60px;
  max-width: 1240px;
  margin: 0 auto;
  gap: 60px;
  align-items: center;
}

@media (max-width: 900px) {
  .arch-hero { grid-template-columns: 1fr; padding: 40px 24px; }
}

.hero-edition {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #a1a1aa;
  display: block;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 40px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  color: #ffffff;
}

.hero-p {
  font-size: 16px;
  color: #a1a1aa;
  line-height: 1.7;
  margin-bottom: 40px;
}

.hero-facts {
  display: flex;
  gap: 40px;
}

.f-num {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
}

.f-lbl {
  font-size: 11px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.project-hero-card {
  border: 1px solid #27272a;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.project-render-visual {
  height: 380px;
  background: linear-gradient(135deg, #27272a, #18181b);
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.render-overlay {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: #ffffff;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 16px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
}

/* Before / After Slider */
.arch-section {
  padding: 60px 48px;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 640px) {
  .arch-section { padding: 40px 24px; }
}

.section-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #a1a1aa;
  margin-bottom: 8px;
}

.section-heading {
  font-size: 28px;
  font-weight: 400;
  margin-bottom: 32px;
  color: #ffffff;
}

.slider-comparison-card {
  border: 1px solid #27272a;
  border-radius: 6px;
  overflow: hidden;
  background: #18181b;
}

.comparison-container {
  position: relative;
  height: 420px;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
}

.comp-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.layer-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  padding: 24px;
}

.before-bg {
  background: linear-gradient(135deg, #3f3f46, #1c1917);
}

.after-bg {
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.comp-after {
  width: 50%;
  overflow: hidden;
  border-right: 2px solid #ffffff;
}

.layer-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: #d4d4d8;
  backdrop-filter: blur(6px);
}

.badge-after {
  background: rgba(255, 255, 255, 0.9);
  color: #000000;
}

.comp-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  pointer-events: none;
}

.handle-pill {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: #ffffff;
  color: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.comp-hint {
  font-size: 12px;
  color: #71717a;
  text-align: center;
  padding: 14px;
  background: #111113;
  border-top: 1px solid #1f1f23;
}

/* Materials Grid */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.mat-card {
  background: #141416;
  border: 1px solid #27272a;
  border-radius: 4px;
  overflow: hidden;
}

.mat-swatch {
  height: 160px;
}

.swatch-travertine { background: linear-gradient(135deg, #d6d3d1, #a8a29e); }
.swatch-oak { background: linear-gradient(135deg, #78716c, #44403c); }
.swatch-steel { background: linear-gradient(135deg, #27272a, #18181b); }

.mat-info {
  padding: 20px;
}

.mat-name {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.mat-origin {
  font-size: 11px;
  color: #a1a1aa;
  margin-bottom: 12px;
}

.mat-desc {
  font-size: 13px;
  color: #71717a;
  line-height: 1.6;
}

/* Modal */
.arch-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.arch-modal-overlay.open { display: flex; }

.arch-modal {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 4px;
  max-width: 460px;
  width: 100%;
  padding: 32px;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.modal-close {
  background: none;
  border: none;
  color: #71717a;
  font-size: 18px;
  cursor: pointer;
}

.modal-sub {
  font-size: 12px;
  color: #a1a1aa;
  margin-bottom: 24px;
  line-height: 1.5;
}

.f-group {
  margin-bottom: 16px;
}

.f-group label {
  font-size: 11px;
  color: #a1a1aa;
  display: block;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.f-group input, .f-select {
  width: 100%;
  background: #0d0d0e;
  border: 1px solid #27272a;
  border-radius: 2px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
}
`;

const javascript = `
(function() {
  // Before / After Slider Logic
  const container = document.getElementById('compContainer');
  const afterLayer = document.getElementById('afterLayer');
  const handle = document.getElementById('compHandle');

  let isDragging = false;

  function setSliderPos(x) {
    if (!container || !afterLayer || !handle) return;
    const rect = container.getBoundingClientRect();
    let pos = (x - rect.left) / rect.width;
    pos = Math.max(0.05, Math.min(0.95, pos));
    const percent = pos * 100;
    afterLayer.style.width = percent + '%';
    handle.style.left = percent + '%';
  }

  if (container) {
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches[0]) setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // Consultation modal
  const modal = document.getElementById('consultModal');
  const openBtn = document.getElementById('bookConsultBtn');
  const closeBtn = document.getElementById('consultClose');
  const form = document.getElementById('consultForm');

  if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.innerHTML = '<div style="color:#ffffff;font-size:13px;text-align:center;padding:24px 0;">✓ Thank you. Atelier Forma partner desk will contact you within 24 hours.</div>';
    });
  }
})();
`;

export default { html, css, javascript };
