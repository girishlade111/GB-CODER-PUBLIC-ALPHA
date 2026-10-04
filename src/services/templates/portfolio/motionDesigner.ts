export default {
  html: `
<div class="kroma-portfolio" id="top">
  <!-- Header -->
  <header class="kroma-nav">
    <div class="nav-container">
      <a href="#top" class="brand">
        <span class="brand-k">K</span>
        <span class="brand-name">KROMA STUDIO</span>
      </a>

      <div class="nav-links">
        <a href="#projects" class="nav-link">Motion & 3D</a>
        <a href="#tokens" class="nav-link">Color Tokens</a>
        <a href="#awards" class="nav-link">Accolades</a>
        <a href="#inquiry" class="nav-link">Commission</a>
      </div>

      <button class="btn btn-commission" id="btn-open-inquiry">Start a Project</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="kroma-hero">
    <div class="hero-tag">INDEPENDENT 3D ART & MOTION DIRECTION</div>
    <h1 class="hero-title">
      Crafting <span class="neon-text">sensory-rich</span> digital artifacts and cinematic motion systems.
    </h1>
    <p class="hero-subtitle">
      Collaborating with vanguard technology companies, luxury brands, and hardware pioneers worldwide. Tokyo • London • San Francisco.
    </p>

    <!-- Interactive Ambient Color Token Strip -->
    <div class="studio-glow-strip" id="tokens">
      <span class="strip-label">AMBIENT STUDIO PALETTE:</span>
      <div class="token-swatches">
        <button class="token-swatch active" data-color="#06b6d4" style="background:#06b6d4;" title="Electric Cyan"></button>
        <button class="token-swatch" data-color="#8b5cf6" style="background:#8b5cf6;" title="Hyper Violet"></button>
        <button class="token-swatch" data-color="#ec4899" style="background:#ec4899;" title="Cyber Pink"></button>
        <button class="token-swatch" data-color="#10b981" style="background:#10b981;" title="Emerald Matrix"></button>
        <button class="token-swatch" data-color="#f59e0b" style="background:#f59e0b;" title="Solar Amber"></button>
      </div>
      <span class="swatch-code" id="active-hex">#06b6d4 (Click swatch to adapt studio ambience)</span>
    </div>
  </section>

  <!-- Projects Gallery -->
  <section class="section-projects" id="projects">
    <div class="sec-head">
      <h2 class="sec-title">Selected Commissions</h2>
      <span class="sec-sub">2024 — 2026 Archive</span>
    </div>

    <div class="projects-matrix">
      <!-- Project 1 -->
      <article class="k-project-card" onclick="viewProject('synapse')">
        <div class="project-visual visual-1">
          <div class="card-overlay">
            <span class="pill-category">3D HARDWARE DIRECTION</span>
            <div class="overlay-play">▶</div>
          </div>
          <div class="visual-art">✦ ⬡ ✦</div>
        </div>
        <div class="project-info">
          <h3 class="p-title">Neural Transducer X-1</h3>
          <div class="p-client">Client: Synapse Audio Labs • Cinema4D / Octane / Houdini</div>
        </div>
      </article>

      <!-- Project 2 -->
      <article class="k-project-card" onclick="viewProject('chrono')">
        <div class="project-visual visual-2">
          <div class="card-overlay">
            <span class="pill-category">INTERACTIVE VISUAL IDENTITY</span>
            <div class="overlay-play">▶</div>
          </div>
          <div class="visual-art">◈ ⬢ ◈</div>
        </div>
        <div class="project-info">
          <h3 class="p-title">Chronos Spatial OS</h3>
          <div class="p-client">Client: Chronos Technologies • WebGL / GLSL Shaders / Three.js</div>
        </div>
      </article>

      <!-- Project 3 -->
      <article class="k-project-card" onclick="viewProject('quantum')">
        <div class="project-visual visual-3">
          <div class="card-overlay">
            <span class="pill-category">MOTION DESIGN SYSTEM</span>
            <div class="overlay-play">▶</div>
          </div>
          <div class="visual-art">▲ ✦ ▼</div>
        </div>
        <div class="project-info">
          <h3 class="p-title">Apex Kinetic Branding</h3>
          <div class="p-client">Client: Apex Supercompute • Lottie / After Effects / Rive</div>
        </div>
      </article>
    </div>
  </section>

  <!-- Accolades / Awards -->
  <section class="section-awards" id="awards">
    <div class="awards-box">
      <div class="award-item">
        <span class="a-year">2026</span>
        <div class="a-body">
          <strong>Awwwards Site of the Year</strong>
          <span>Nominee & Developer Award — Chronos Spatial OS</span>
        </div>
      </div>
      <div class="award-item">
        <span class="a-year">2025</span>
        <div class="a-body">
          <strong>FWA of the Month</strong>
          <span>Cutting-edge 3D Web Experience — Neural Transducer</span>
        </div>
      </div>
      <div class="award-item">
        <span class="a-year">2025</span>
        <div class="a-body">
          <strong>ADC Gold Cube</strong>
          <span>Motion Design & Brand Craft — Apex Supercompute</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Project Inquiry Modal -->
  <div class="inquiry-modal" id="inquiry-modal" style="display:none;">
    <div class="inquiry-box">
      <button class="btn-close" id="btn-close-inquiry">✕</button>
      <h3 class="inquiry-title">Commission Inquiry</h3>
      <p class="inquiry-desc">Tell us about your upcoming launch, brand initiative, or spatial experience.</p>

      <form id="inquiry-form" class="inquiry-form">
        <div class="form-field">
          <label>Your Name & Organization</label>
          <input type="text" id="inq-name" placeholder="Elena Rostova (Head of Design, Hyperion)" required />
        </div>
        <div class="form-field">
          <label>Work Email</label>
          <input type="email" id="inq-email" placeholder="elena@hyperion.co" required />
        </div>
        <div class="form-field">
          <label>Estimated Project Scope / Budget (USD)</label>
          <select id="inq-budget" class="form-select">
            <option>$25,000 — $50,000</option>
            <option selected>$50,000 — $100,000</option>
            <option>$100,000+</option>
          </select>
        </div>
        <button type="submit" class="btn btn-submit-inq">Submit Commission Brief →</button>
      </form>
      <div class="inquiry-feedback" id="inq-feedback"></div>
    </div>
  </div>

  <div class="kroma-toast" id="kroma-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #08090d;
  --bg-panel: rgba(18, 20, 28, 0.7);
  --border: rgba(255, 255, 255, 0.08);
  --accent-neon: #06b6d4;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-serif: 'Playfair Display', Georgia, serif;
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

.kroma-portfolio { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Nav */
.kroma-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(8, 9, 13, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 60px;
}
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #fff; }
.brand-k { font-weight: 900; font-size: 16px; background: #fff; color: #000; padding: 2px 6px; border-radius: 4px; }
.brand-name { font-size: 14px; font-weight: 800; letter-spacing: 2px; }

.nav-links { display: flex; gap: 24px; }
.nav-link { color: var(--text-muted); text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; transition: color 0.2s; }
.nav-link:hover { color: #fff; }

.btn-commission {
  background: #fff;
  color: #000;
  border: none;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-commission:hover { transform: scale(1.03); }

/* Hero */
.kroma-hero { margin-bottom: 80px; max-width: 900px; }
.hero-tag { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: var(--accent-neon); margin-bottom: 16px; font-family: var(--font-mono); }
.hero-title { font-size: 52px; font-weight: 900; line-height: 1.12; letter-spacing: -1.5px; color: #fff; margin-bottom: 24px; }
.neon-text {
  color: var(--accent-neon);
  text-shadow: 0 0 25px var(--accent-neon);
  font-style: italic;
}
.hero-subtitle { font-size: 18px; color: var(--text-muted); line-height: 1.6; margin-bottom: 36px; }

/* Swatch Strip */
.studio-glow-strip {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  padding: 8px 18px;
  border-radius: 999px;
}
.strip-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); }
.token-swatches { display: flex; gap: 8px; }
.token-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}
.token-swatch.active { border-color: #fff; transform: scale(1.2); }
.swatch-code { font-size: 11px; font-family: var(--font-mono); color: #cbd5e1; }

/* Projects Matrix */
.section-projects { margin-bottom: 80px; }
.sec-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
.sec-title { font-size: 24px; font-weight: 800; color: #fff; }
.sec-sub { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

.projects-matrix { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.k-project-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}
.k-project-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.25); }

.project-visual {
  height: 240px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  overflow: hidden;
}
.visual-1 { background: radial-gradient(circle, #0e3a47, #061118); }
.visual-2 { background: radial-gradient(circle, #2e1065, #0a0614); }
.visual-3 { background: radial-gradient(circle, #4c0519, #140206); }

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.k-project-card:hover .card-overlay { opacity: 1; }
.pill-category { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #fff; background: rgba(0,0,0,0.6); padding: 3px 8px; border-radius: 4px; }
.overlay-play { width: 32px; height: 32px; background: #fff; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }

.project-info { padding: 20px; }
.p-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.p-client { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

/* Awards */
.section-awards { margin-bottom: 60px; }
.awards-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 24px;
}
.award-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.award-item:last-child { border-bottom: none; }
.a-year { font-family: var(--font-mono); font-size: 13px; font-weight: 800; color: var(--accent-neon); }
.a-body strong { color: #fff; font-size: 14px; display: block; }
.a-body span { font-size: 12px; color: var(--text-muted); }

/* Modal */
.inquiry-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.inquiry-box {
  background: #0f121a;
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  padding: 36px;
  position: relative;
}
.btn-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
.inquiry-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.inquiry-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
.inquiry-form { display: flex; flex-direction: column; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.form-field input, .form-select {
  background: #08090e;
  border: 1px solid var(--border);
  padding: 10px 14px;
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
.btn-submit-inq {
  background: #fff;
  color: #000;
  border: none;
  font-size: 13px;
  font-weight: 800;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}
.inquiry-feedback { margin-top: 12px; font-size: 13px; font-weight: 700; color: #10b981; }

/* Toast */
.kroma-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #181d29;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .hero-title { font-size: 34px; }
  .projects-matrix { grid-template-columns: 1fr; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('kroma-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Token Swatches
  const swatches = document.querySelectorAll('.token-swatch');
  const activeHex = document.getElementById('active-hex');
  swatches.forEach(s => {
    s.addEventListener('click', () => {
      swatches.forEach(item => item.classList.remove('active'));
      s.classList.add('active');
      const color = s.getAttribute('data-color');
      document.documentElement.style.setProperty('--accent-neon', color);
      if (activeHex) activeHex.textContent = color + ' (Copied to clipboard)';
      navigator.clipboard?.writeText(color);
      showToast('Ambient lighting shifted to ' + color);
    });
  });

  window.viewProject = function(key) {
    showToast('Loading interactive 4K reel asset: ' + key);
  };

  // Inquiry Modal
  const modal = document.getElementById('inquiry-modal');
  document.getElementById('btn-open-inquiry')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
  });
  document.getElementById('btn-close-inquiry')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  const inqForm = document.getElementById('inquiry-form');
  const feedback = document.getElementById('inq-feedback');
  if (inqForm) {
    inqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inq-name').value;
      if (feedback) {
        feedback.textContent = '✓ Commission brief received! Kroma Studio will reply within 24 hours, ' + name + '.';
        inqForm.reset();
      }
      showToast('Commission brief transmitted successfully');
    });
  }
})();
`
};
