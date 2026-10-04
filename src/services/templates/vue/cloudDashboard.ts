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
      content: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-dark: #0a0e17;
  --bg-panel: #111827;
  --bg-panel-subtle: #1f2937;

  --border: rgba(255, 255, 255, 0.08);
  --border-active: rgba(16, 185, 129, 0.4);

  --text-main: #f9fafb;
  --text-muted: #9ca3af;

  --accent-green: #10b981;
  --accent-cyan: #06b6d4;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --accent-purple: #8b5cf6;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Pulse indicator animation */
@keyframes statusBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.15); }
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusBlink 2s infinite ease-in-out;
}
`,
    },
    {
      path: 'App.vue',
      content: `<template>
  <div class="devops-layout">
    <!-- Top Cluster Bar -->
    <header class="top-nav">
      <div class="brand">
        <div class="logo-box">⚡</div>
        <div>
          <div class="brand-title">CloudPulse</div>
          <div class="brand-sub">KUBERNETES & CLUSTER TELEMETRY</div>
        </div>
      </div>

      <div class="cluster-controls">
        <select v-model="selectedRegion" class="region-select" @change="handleRegionChange">
          <option value="us-east-1">AWS us-east-1 (N. Virginia)</option>
          <option value="eu-central-1">AWS eu-central-1 (Frankfurt)</option>
          <option value="ap-east-1">AWS ap-east-1 (Tokyo)</option>
        </select>

        <div class="uptime-badge">
          <span class="pulse-dot" style="background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green)"></span>
          <span>Cluster SLA: 99.992%</span>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="dashboard-body">
      <!-- Live Metric Gauges -->
      <section class="metrics-grid">
        <div v-for="(metric, idx) in metrics" :key="idx" class="metric-card">
          <div class="metric-header">
            <span class="metric-title">{{ metric.name }}</span>
            <span class="metric-tag" :style="{ color: metric.color }">{{ metric.status }}</span>
          </div>

          <div class="gauge-wrap">
            <svg viewBox="0 0 100 100" class="radial-svg">
              <circle cx="50" cy="50" r="40" class="radial-bg" />
              <circle
                cx="50"
                cy="50"
                r="40"
                class="radial-bar"
                :stroke="metric.color"
                :stroke-dasharray="251.2"
                :stroke-dashoffset="251.2 - (251.2 * metric.percent) / 100"
              />
            </svg>
            <div class="gauge-center">
              <span class="gauge-val">{{ metric.percent }}%</span>
              <span class="gauge-sub">{{ metric.detail }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Nodes Grid & Deployment Pipelines -->
      <div class="split-view">
        <!-- Worker Nodes Fleet -->
        <section class="panel-box">
          <div class="panel-header">
            <h3>Active Node Fleet (6 / 6)</h3>
            <button class="action-btn" @click="scaleCluster">+ Provision Node</button>
          </div>

          <div class="node-table">
            <div v-for="node in nodes" :key="node.id" class="node-row">
              <div class="node-identity">
                <span class="pulse-dot" :style="{ background: node.health === 'Healthy' ? 'var(--accent-green)' : 'var(--accent-amber)' }"></span>
                <span class="node-name">{{ node.name }}</span>
              </div>
              <span class="node-role">{{ node.role }}</span>
              <span class="node-pods">{{ node.pods }} Pods</span>
              <span class="node-cpu font-mono">{{ node.cpu }}</span>
              <button class="node-btn" @click="drainNode(node.name)">Drain</button>
            </div>
          </div>
        </section>

        <!-- CI/CD Deployment Pipeline -->
        <section class="panel-box">
          <div class="panel-header">
            <h3>Canary Release: v2.14.0</h3>
            <span class="status-pill">Deploying to Edge</span>
          </div>

          <div class="pipeline-track">
            <div v-for="(stage, sIdx) in stages" :key="sIdx" class="pipeline-step" :class="{ done: stage.done, active: stage.active }">
              <div class="step-circle">{{ stage.done ? '✓' : (sIdx + 1) }}</div>
              <div class="step-meta">
                <div class="step-name">{{ stage.name }}</div>
                <div class="step-time font-mono">{{ stage.time }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Live Terminal Log Stream -->
      <section class="panel-box log-panel">
        <div class="panel-header">
          <div class="log-title-wrap">
            <h3>Live Container Log Stream</h3>
            <span class="log-pill font-mono">14.8k lines/min</span>
          </div>
          <div class="log-actions">
            <button class="log-btn" @click="togglePause">{{ isPaused ? '▶ Resume' : '⏸ Pause' }}</button>
            <button class="log-btn" @click="logs = []">Clear</button>
          </div>
        </div>

        <div class="log-stream font-mono">
          <div v-for="(line, lIdx) in logs" :key="lIdx" class="log-line">
            <span class="log-time">{{ line.time }}</span>
            <span class="log-level" :class="line.level">{{ line.level }}</span>
            <span class="log-msg">{{ line.msg }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Notification Toast -->
    <div v-if="toast" class="toast-box">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const selectedRegion = ref('us-east-1');
const isPaused = ref(false);
const toast = ref(null);

const showToast = (msg) => {
  toast.value = msg;
  setTimeout(() => toast.value = null, 3000);
};

const metrics = ref([
  { name: 'Cluster CPU Usage', percent: 46, detail: '18.4 / 40 Cores', color: '#10b981', status: 'Optimal' },
  { name: 'Memory Allocation', percent: 68, detail: '54.4 / 80 GB', color: '#06b6d4', status: 'Healthy' },
  { name: 'Disk I/O Latency', percent: 28, detail: '1.2ms Avg Write', color: '#8b5cf6', status: 'Fast' },
  { name: 'Ingress Bandwidth', percent: 79, detail: '790 Mbps / 1G', color: '#f59e0b', status: 'High Traffic' },
]);

const nodes = ref([
  { id: 1, name: 'worker-us-east-1a', role: 'Compute Node', pods: '24/30', cpu: '48%', health: 'Healthy' },
  { id: 2, name: 'worker-us-east-1b', role: 'Compute Node', pods: '28/30', cpu: '62%', health: 'Healthy' },
  { id: 3, name: 'worker-us-east-1c', role: 'Compute Node', pods: '19/30', cpu: '39%', health: 'Healthy' },
  { id: 4, name: 'worker-gpu-ml-1', role: 'Nvidia A100', pods: '4/4', cpu: '92%', health: 'Warning' },
]);

const stages = ref([
  { name: 'Docker Build & Tag', time: '48s', done: true, active: false },
  { name: 'Trivy Security Scan', time: '14s', done: true, active: false },
  { name: 'End-to-End Smoke Tests', time: '1m 12s', done: true, active: false },
  { name: 'Canary Rollout (10%)', time: '2m elapsed', done: false, active: true },
  { name: 'Global DNS Cutover', time: 'Pending', done: false, active: false },
]);

const logs = ref([
  { time: '14:22:01.401', level: 'INFO', msg: 'ingress-controller: [200 OK] GET /api/v1/telemetry 4ms from 10.42.0.18' },
  { time: '14:22:02.118', level: 'INFO', msg: 'kubelet: Successfully pulled image "registry.enterprise.io/worker:v2.14.0"' },
  { time: '14:22:03.042', level: 'WARN', msg: 'scheduler: GPU temperature on worker-gpu-ml-1 reached 72°C. Fan throttling enabled.' },
  { time: '14:22:04.912', level: 'INFO', msg: 'cert-manager: Certificate for *.cloudpulse.internal renewed automatically.' },
]);

let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    if (isPaused.value) return;
    const now = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const msgs = [
      { level: 'INFO', msg: 'HPA: Scaled deployment/agent-runner from 12 to 14 replicas.' },
      { level: 'INFO', msg: 'postgres-pool: Executed vacuum analyze on tablespace "audit_logs" (48ms).' },
      { level: 'WARN', msg: 'dns-resolver: Upstream CoreDNS latency spike: 28ms.' },
      { level: 'INFO', msg: 'oauth-proxy: Token validated for service-account "cicd-runner-02".' },
    ];
    const pick = msgs[Math.floor(Math.random() * msgs.length)];
    logs.value.unshift({ time: now, level: pick.level, msg: pick.msg });
    if (logs.value.length > 20) logs.value.pop();
  }, 2400);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const handleRegionChange = () => {
  showToast(\`Switched monitoring context to region: \${selectedRegion.value}\`);
};

const scaleCluster = () => {
  showToast('Initiating terraform auto-provisioning for +1 node...');
};

const drainNode = (name) => {
  showToast(\`Cordoned & drained pods from \${name}\`);
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  showToast(isPaused.value ? 'Log stream paused' : 'Log stream resumed');
};
</script>

<style scoped>
.devops-layout {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 0%, #172554 0%, #0a0e17 60%);
  display: flex;
  flex-direction: column;
}

.top-nav {
  height: 64px;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, var(--accent-green), var(--accent-cyan));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
}

.brand-title {
  font-weight: 800;
  font-size: 16px;
  color: #fff;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 9px;
  color: var(--accent-cyan);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.cluster-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.region-select {
  background: var(--bg-panel-subtle);
  border: 1px solid var(--border);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.uptime-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent-green);
  font-weight: 600;
}

.dashboard-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.metric-tag {
  font-size: 11px;
  font-weight: 700;
}

.gauge-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto;
}

.radial-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.radial-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 8;
}

.radial-bar {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-val {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}

.gauge-sub {
  font-size: 9px;
  color: var(--text-muted);
}

.split-view {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

.panel-box {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.action-btn {
  background: var(--bg-panel-subtle);
  border: 1px solid var(--border);
  color: #fff;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 11px;
  cursor: pointer;
}

.node-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr auto;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 12px;
}

.node-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-name {
  font-weight: 600;
  color: #fff;
}

.node-role {
  color: var(--text-muted);
}

.node-pods {
  color: var(--accent-cyan);
}

.node-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--accent-red);
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.pipeline-track {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pipeline-step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-panel-subtle);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.pipeline-step.done .step-circle {
  background: var(--accent-green);
  color: #000;
  border-color: var(--accent-green);
}

.pipeline-step.active .step-circle {
  background: var(--accent-cyan);
  color: #000;
  box-shadow: 0 0 12px var(--accent-cyan);
}

.step-meta {
  display: flex;
  justify-content: space-between;
  flex: 1;
  font-size: 13px;
}

.step-name {
  color: #fff;
  font-weight: 600;
}

.step-time {
  color: var(--text-muted);
  font-size: 11px;
}

.log-panel {
  max-height: 280px;
}

.log-stream {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.4);
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.log-line {
  display: flex;
  gap: 12px;
}

.log-time {
  color: var(--text-muted);
}

.log-level {
  font-weight: 700;
  width: 44px;
}

.log-level.INFO { color: var(--accent-cyan); }
.log-level.WARN { color: var(--accent-amber); }
.log-level.ERROR { color: var(--accent-red); }

.log-msg {
  color: #e5e7eb;
}

.toast-box {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #111827;
  border: 1px solid var(--accent-green);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-weight: 600;
  font-size: 13px;
}
</style>
`,
    }
  ]
};
