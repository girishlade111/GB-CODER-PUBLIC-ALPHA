export default {
  files: [
    {
      path: 'main.js',
      content: `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

const host = document.getElementById('app');

if (host) {
  createApp(App).mount(host);
}
`,
    },
    {
      path: 'style.css',
      content: `@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');

:root {
  --font-serif: 'Italiana', Georgia, serif;
  --font-display: 'Syne', -apple-system, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;

  --bg-deep: #0b0c10;
  --bg-surface: #14161f;
  --border-hairline: rgba(255, 255, 255, 0.09);

  --text-pure: #ffffff;
  --text-muted: #9ca3af;
  --text-subtle: #6b7280;

  --accent-gold: #d4af37;
  --accent-amber: #f59e0b;
  --accent-coral: #ff6b6b;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-deep);
  color: var(--text-pure);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.font-serif {
  font-family: var(--font-serif);
}

.font-display {
  font-family: var(--font-display);
}

/* Marquee continuous scroll */
@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marqueeScroll 24s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
`,
    },
    {
      path: 'App.vue',
      content: `<template>
  <div class="agency-page">
    <!-- Header -->
    <header class="agency-header">
      <div class="brand">
        <span class="brand-v font-serif">V</span>
        <span class="brand-text">VANGUARD STUDIOS</span>
      </div>

      <nav class="nav-links">
        <a href="#work" class="nav-link">Selected Work</a>
        <a href="#services" class="nav-link">Capabilities</a>
        <a href="#calculator" class="nav-link">Scope Estimator</a>
      </nav>

      <button class="cta-btn" @click="openModal = true">Initiate Project</button>
    </header>

    <main>
      <!-- Hero -->
      <section class="hero-section">
        <div class="badge-pill">
          <span>✦</span> INDEPENDENT DIGITAL DESIGN ARCHITECTS
        </div>
        <h1 class="hero-title font-display">
          Crafting Radical <br />
          <span class="highlight-serif font-serif">Digital Platforms</span> & AI Systems
        </h1>
        <p class="hero-desc">
          We engineer category-defining brand identities, interactive 3D WebGL experiences, and high-frequency digital platforms for global pioneers.
        </p>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-number font-serif">14</span>
            <span class="stat-label">Awwwards & FWAs</span>
          </div>
          <div class="stat-item">
            <span class="stat-number font-serif">$2.4B+</span>
            <span class="stat-label">Client Valuation Created</span>
          </div>
          <div class="stat-item">
            <span class="stat-number font-serif">99.8%</span>
            <span class="stat-label">On-Time Delivery</span>
          </div>
        </div>
      </section>

      <!-- Client Marquee -->
      <section class="marquee-section">
        <div class="marquee-track">
          <span v-for="client in clients" :key="client" class="client-name font-display">{{ client }} &bull;</span>
          <span v-for="client in clients" :key="client + '-dup'" class="client-name font-display">{{ client }} &bull;</span>
        </div>
      </section>

      <!-- Selected Work Grid -->
      <section id="work" class="work-section">
        <div class="section-head">
          <h2 class="section-title font-display">Selected Commissions</h2>
          <div class="filter-tabs">
            <button
              v-for="cat in categories"
              :key="cat"
              class="filter-tab"
              :class="{ active: activeCategory === cat }"
              @click="activeCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="work-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            @click="triggerToast('Viewing ' + project.title)"
          >
            <div class="project-visual" :style="{ background: project.gradient }">
              <span class="project-icon">{{ project.icon }}</span>
              <span class="project-tag">{{ project.tag }}</span>
            </div>
            <div class="project-info">
              <div class="project-meta">
                <h3 class="project-title">{{ project.title }}</h3>
                <span class="project-year">{{ project.year }}</span>
              </div>
              <p class="project-desc">{{ project.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive Budget Calculator -->
      <section id="calculator" class="calculator-section">
        <div class="calc-card">
          <div class="calc-info">
            <div class="badge-pill">INSTANT SCOPE ESTIMATOR</div>
            <h2 class="calc-title font-display">Estimate Your Engagement</h2>
            <p class="calc-desc">Select requirements below for an instant budget and timeline projection.</p>

            <div class="calc-total">
              <div class="total-label">Estimated Budget</div>
              <div class="total-value font-serif">\${{ calculatedBudget.toLocaleString() }}</div>
              <div class="timeline-label">Estimated Horizon: <strong>{{ calculatedWeeks }} Weeks</strong></div>
            </div>

            <button class="cta-btn calc-cta" @click="openModal = true">Lock in Consultation</button>
          </div>

          <div class="calc-controls">
            <!-- Project Type -->
            <div class="calc-group">
              <label class="group-label">Platform Archetype</label>
              <div class="chip-grid">
                <button
                  v-for="t in projectTypes"
                  :key="t.name"
                  class="choice-chip"
                  :class="{ selected: selectedType === t.name }"
                  @click="selectedType = t.name"
                >
                  {{ t.name }}
                </button>
              </div>
            </div>

            <!-- Features -->
            <div class="calc-group">
              <label class="group-label">Architectural Capabilities</label>
              <div class="chip-grid">
                <button
                  v-for="f in availableFeatures"
                  :key="f.id"
                  class="choice-chip"
                  :class="{ selected: selectedFeatures.includes(f.id) }"
                  @click="toggleFeature(f.id)"
                >
                  {{ f.name }} (+ \${{ f.cost / 1000 }}k)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Project Inquiry Modal -->
    <div v-if="openModal" class="modal-overlay" @click.self="openModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="openModal = false">✕</button>
        <h3 class="modal-title font-display">Commence an Engagement</h3>
        <p class="modal-sub">We review bespoke proposals and schedule kickoff calls within 24 hours.</p>

        <form @submit.prevent="submitInquiry" class="inquiry-form">
          <input v-model="form.name" placeholder="Full Name or Organization" required class="input-field" />
          <input v-model="form.email" type="email" placeholder="corporate@email.com" required class="input-field" />
          <textarea v-model="form.details" rows="4" placeholder="Brief project goals, target launch window, and vision..." class="input-field"></textarea>

          <button type="submit" class="cta-btn submit-btn">Transmit Brief & Booking</button>
        </form>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="toast" class="toast-popup">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeCategory = ref('All');
const categories = ['All', 'Web Platforms', 'AI & Data', 'Brand Systems', '3D / Motion'];

const clients = [
  'SONY ENTERTAINMENT', 'VERCEL', 'SUPABASE', 'LINEAR', 'CHRONO AUDIO', 'QUANTUM HEALTH', 'SYNAPSE LABS'
];

const projects = [
  { id: 1, title: 'Spatial OS & 3D Interface', category: '3D / Motion', year: '2024', tag: 'WebGL / Spatial', desc: 'Zero-latency spatial window compositor for mixed-reality headset operating systems.', gradient: 'radial-gradient(circle at top left, #3b82f6, #1d4ed8)', icon: '🪐' },
  { id: 2, title: 'Apex Autonomous Fleet UI', category: 'Web Platforms', year: '2024', tag: 'Mission Control', desc: 'Real-time telemetry and LiDAR visualization console controlling 1,400 robotaxis.', gradient: 'radial-gradient(circle at top left, #10b981, #065f46)', icon: '⚡' },
  { id: 3, title: 'Kroma Generative Sound Engine', category: 'AI & Data', year: '2023', tag: 'Audio Intelligence', desc: 'Neural synthesis desktop workstation generating bespoke adaptive game soundtracks.', gradient: 'radial-gradient(circle at top left, #8b5cf6, #5b21b6)', icon: '🎼' },
  { id: 4, title: 'Monolith High-Frequency Trading', category: 'Web Platforms', year: '2024', tag: 'Fintech Terminal', desc: 'Microsecond order book rendering with custom Canvas charts and WebSockets.', gradient: 'radial-gradient(circle at top left, #f59e0b, #b45309)', icon: '📈' },
  { id: 5, title: 'Vesper Luxury Chronometer', category: 'Brand Systems', year: '2023', tag: 'Haute Horlogerie', desc: 'Global digital flagship featuring exploded 3D CAD escapement mechanics.', gradient: 'radial-gradient(circle at top left, #d4af37, #785a12)', icon: '⏱️' },
  { id: 6, title: 'Neuromancer Neural Vector DB', category: 'AI & Data', year: '2024', tag: 'AI Infrastructure', desc: 'High-density vector clustering platform with live 3D embedding t-SNE scatterplots.', gradient: 'radial-gradient(circle at top left, #ec4899, #9d174d)', icon: '🧠' },
];

const filteredProjects = computed(() => {
  if (activeCategory.value === 'All') return projects;
  return projects.filter(p => p.category === activeCategory.value);
});

// Calculator State
const selectedType = ref('Enterprise Web Platform');
const projectTypes = [
  { name: 'Enterprise Web Platform', base: 24000, weeks: 8 },
  { name: 'Category Brand System', base: 16000, weeks: 6 },
  { name: 'AI / 3D Experience', base: 32000, weeks: 10 },
];

const selectedFeatures = ref(['design-system', 'webgl']);
const availableFeatures = [
  { id: 'design-system', name: 'Comprehensive Design Tokens', cost: 6000, weeks: 2 },
  { id: 'webgl', name: 'Interactive 3D / WebGL Scenes', cost: 12000, weeks: 3 },
  { id: 'ai-ingestion', name: 'RAG / AI Pipeline Ingestion', cost: 10000, weeks: 2 },
  { id: 'audit', name: 'Security & SOC2 Performance Audit', cost: 4000, weeks: 1 },
];

const toggleFeature = (id) => {
  if (selectedFeatures.value.includes(id)) {
    selectedFeatures.value = selectedFeatures.value.filter(f => f !== id);
  } else {
    selectedFeatures.value.push(id);
  }
};

const calculatedBudget = computed(() => {
  const baseObj = projectTypes.find(t => t.name === selectedType.value) || projectTypes[0];
  const featCost = selectedFeatures.value.reduce((sum, fId) => {
    const feat = availableFeatures.find(f => f.id === fId);
    return sum + (feat ? feat.cost : 0);
  }, 0);
  return baseObj.base + featCost;
});

const calculatedWeeks = computed(() => {
  const baseObj = projectTypes.find(t => t.name === selectedType.value) || projectTypes[0];
  const featWeeks = selectedFeatures.value.reduce((sum, fId) => {
    const feat = availableFeatures.find(f => f.id === fId);
    return sum + (feat ? feat.weeks : 0);
  }, 0);
  return baseObj.weeks + Math.floor(featWeeks * 0.6);
});

// Modal & Toast
const openModal = ref(false);
const toast = ref(null);
const form = ref({ name: '', email: '', details: '' });

const triggerToast = (msg) => {
  toast.value = msg;
  setTimeout(() => toast.value = null, 3000);
};

const submitInquiry = () => {
  triggerToast('Consultation brief received! Marcus will contact you shortly.');
  openModal.value = false;
  form.value = { name: '', email: '', details: '' };
};
</script>

<style scoped>
.agency-page {
  min-height: 100vh;
  background-color: var(--bg-deep);
  color: var(--text-pure);
}

.agency-header {
  height: 80px;
  border-bottom: 1px solid var(--border-hairline);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: rgba(11, 12, 16, 0.8);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-v {
  font-size: 28px;
  color: var(--accent-gold);
}

.brand-text {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.18em;
}

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #fff;
}

.cta-btn {
  background: var(--text-pure);
  color: #000;
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.cta-btn:hover {
  background: var(--accent-gold);
}

.hero-section {
  padding: 100px 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-gold);
  letter-spacing: 0.1em;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin: 0 0 24px;
}

.highlight-serif {
  font-style: italic;
  font-weight: 400;
  color: var(--accent-gold);
}

.hero-desc {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 640px;
  margin: 0 auto 48px;
  line-height: 1.6;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 60px;
  border-top: 1px solid var(--border-hairline);
  padding-top: 36px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 40px;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.marquee-section {
  border-top: 1px solid var(--border-hairline);
  border-bottom: 1px solid var(--border-hairline);
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.client-name {
  font-size: 20px;
  color: var(--text-subtle);
  margin-right: 32px;
  letter-spacing: 0.12em;
}

.work-section {
  padding: 100px 40px;
  max-width: 1300px;
  margin: 0 auto;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.section-title {
  font-size: 36px;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tab {
  background: transparent;
  border: 1px solid var(--border-hairline);
  color: var(--text-muted);
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: #fff;
  color: #000;
  border-color: #fff;
  font-weight: 600;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.project-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-hairline);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.project-card:hover {
  transform: translateY(-6px);
}

.project-visual {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.project-icon {
  font-size: 72px;
}

.project-tag {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.project-info {
  padding: 24px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.project-year {
  color: var(--text-subtle);
  font-size: 13px;
}

.project-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.calculator-section {
  padding: 0 40px 100px;
  max-width: 1200px;
  margin: 0 auto;
}

.calc-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-hairline);
  border-radius: 24px;
  padding: 48px;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 48px;
}

.calc-title {
  font-size: 32px;
  margin: 0 0 12px;
}

.calc-desc {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 32px;
}

.calc-total {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-hairline);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.total-label {
  font-size: 12px;
  color: var(--text-subtle);
  text-transform: uppercase;
}

.total-value {
  font-size: 42px;
  color: var(--accent-gold);
  margin: 4px 0 8px;
}

.timeline-label {
  font-size: 13px;
  color: var(--text-muted);
}

.calc-controls {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.group-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
  display: block;
  margin-bottom: 12px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.choice-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-hairline);
  color: var(--text-muted);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.choice-chip.selected {
  background: rgba(212, 175, 55, 0.15);
  border-color: var(--accent-gold);
  color: #fff;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: #151821;
  border: 1px solid var(--border-hairline);
  border-radius: 20px;
  padding: 36px;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 24px;
}

.modal-sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 24px;
}

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-field {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-hairline);
  border-radius: 8px;
  padding: 12px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}

.toast-popup {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1c1f2b;
  border: 1px solid var(--accent-gold);
  color: #fff;
  padding: 14px 22px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-size: 13px;
  font-weight: 600;
}
</style>
`,
    }
  ]
};
