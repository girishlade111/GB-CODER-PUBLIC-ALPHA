export default {
  html: `
<div class="agent-studio-app">
  <!-- Top Navigation -->
  <header class="studio-header">
    <div class="header-left">
      <div class="studio-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      <div>
        <h1 class="studio-title">Cognition Studio</h1>
        <div class="studio-sub">Autonomous Multi-Agent Orchestration Mesh</div>
      </div>
    </div>

    <div class="header-center">
      <div class="pipeline-pill">
        <span class="pill-dot active"></span>
        <span>Orchestration Cluster: Active</span>
        <span class="pill-divider">•</span>
        <span class="text-cyan">4 Autonomous Workers Online</span>
      </div>
    </div>

    <div class="header-right">
      <button class="btn btn-secondary" id="btn-export-graph">Export DAG</button>
      <button class="btn btn-primary" id="btn-deploy-pipeline">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Run Pipeline</span>
      </button>
    </div>
  </header>

  <!-- Studio Workspace Grid -->
  <div class="studio-workspace">
    <!-- Left Panel: Agent Fleet & Tool Runtimes -->
    <aside class="studio-left-panel">
      <div class="panel-section-title">ACTIVE AGENT FLEET</div>

      <div class="agent-cards-stack">
        <!-- Agent 1 -->
        <div class="agent-card active" data-agent="planner">
          <div class="agent-header">
            <span class="agent-avatar">🧠</span>
            <div class="agent-details">
              <div class="agent-name">Architect Agent</div>
              <div class="agent-model">Gemini 1.5 Pro • Reasoning</div>
            </div>
            <span class="agent-status-badge">LEADER</span>
          </div>
          <div class="agent-metrics">
            <span>Tasks: <strong>482</strong></span>
            <span>Success: <strong>99.4%</strong></span>
            <span>Latency: <strong>320ms</strong></span>
          </div>
        </div>

        <!-- Agent 2 -->
        <div class="agent-card" data-agent="researcher">
          <div class="agent-header">
            <span class="agent-avatar">🔍</span>
            <div class="agent-details">
              <div class="agent-name">Deep Research Agent</div>
              <div class="agent-model">Claude 3.7 Sonnet • Search</div>
            </div>
            <span class="agent-status-badge status-idle">STANDBY</span>
          </div>
          <div class="agent-metrics">
            <span>Queries: <strong>1.2k</strong></span>
            <span>Verified: <strong>98.1%</strong></span>
            <span>Tools: <strong>Web, Arxiv</strong></span>
          </div>
        </div>

        <!-- Agent 3 -->
        <div class="agent-card" data-agent="coder">
          <div class="agent-header">
            <span class="agent-avatar">⚡</span>
            <div class="agent-details">
              <div class="agent-name">Synthesis & Coding</div>
              <div class="agent-model">GPT-4o • Tool Call Specialist</div>
            </div>
            <span class="agent-status-badge status-idle">STANDBY</span>
          </div>
          <div class="agent-metrics">
            <span>Lines Gen: <strong>48.6k</strong></span>
            <span>Test Pass: <strong>99.8%</strong></span>
            <span>Sandbox: <strong>Isolated</strong></span>
          </div>
        </div>

        <!-- Agent 4 -->
        <div class="agent-card" data-agent="auditor">
          <div class="agent-header">
            <span class="agent-avatar">🛡️</span>
            <div class="agent-details">
              <div class="agent-name">Security & Alignment</div>
              <div class="agent-model">Llama 3.3 70B • Guardrails</div>
            </div>
            <span class="agent-status-badge status-idle">STANDBY</span>
          </div>
          <div class="agent-metrics">
            <span>Threats: <strong>0</strong></span>
            <span>mTLS: <strong>Enforced</strong></span>
            <span>Audit: <strong>Realtime</strong></span>
          </div>
        </div>
      </div>

      <!-- Execution Parameters -->
      <div class="panel-section-title" style="margin-top: 24px;">HYPERPARAMETERS</div>
      <div class="hyperparams-box">
        <div class="param-row">
          <div class="param-label">
            <span>Temperature</span>
            <span class="param-val" id="temp-val">0.2</span>
          </div>
          <input type="range" min="0" max="1" step="0.05" value="0.2" id="temp-slider" />
        </div>

        <div class="param-row">
          <div class="param-label">
            <span>Max Autonomous Loops</span>
            <span class="param-val" id="loop-val">8</span>
          </div>
          <input type="range" min="1" max="20" step="1" value="8" id="loop-slider" />
        </div>

        <div class="param-toggles">
          <label class="toggle-label">
            <input type="checkbox" checked id="chk-sandbox" />
            <span>Isolated Micro-VM Sandbox</span>
          </label>
          <label class="toggle-label">
            <input type="checkbox" checked id="chk-critique" />
            <span>Multi-Agent Self-Critique Loop</span>
          </label>
        </div>
      </div>
    </aside>

    <!-- Main Studio Canvas & Stream -->
    <main class="studio-center">
      <!-- Goal Input Bar -->
      <div class="prompt-workbench">
        <div class="preset-pills">
          <span class="preset-label">Quick Scenarios:</span>
          <button class="pill-btn active" data-prompt="Design an ultra-low latency distributed Redis caching tier in Go with Raft consensus.">Distributed Cache (Go)</button>
          <button class="pill-btn" data-prompt="Analyze SEC 10-K filings for cloud providers and synthesize Capex trends into structured JSON.">Financial SEC Synthesis</button>
          <button class="pill-btn" data-prompt="Audit Solidity smart contract for reentrancy vulnerabilities and generate fuzz test suite.">Smart Contract Security</button>
        </div>

        <div class="input-row">
          <textarea id="task-input" rows="2" placeholder="Describe the goal for your multi-agent cluster...">Design an ultra-low latency distributed Redis caching tier in Go with Raft consensus.</textarea>
          <button class="btn btn-primary btn-run" id="btn-run-goal">
            <span>Launch Execution</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- Pipeline Visualization Canvas -->
      <div class="dag-canvas-card">
        <div class="canvas-header">
          <span class="canvas-title">EXECUTION PIPELINE DAG</span>
          <div class="dag-legend">
            <span class="legend-dot status-done"></span> Complete
            <span class="legend-dot status-active"></span> Executing
            <span class="legend-dot status-pending"></span> Queued
          </div>
        </div>

        <div class="dag-nodes-container" id="dag-container">
          <div class="dag-node node-done" id="node-1">
            <div class="node-icon">🧠</div>
            <div class="node-title">1. Task Decomposition</div>
            <div class="node-status">Completed (120ms)</div>
          </div>
          <div class="dag-arrow">→</div>
          <div class="dag-node node-done" id="node-2">
            <div class="node-icon">🔍</div>
            <div class="node-title">2. Context & Code Retrieval</div>
            <div class="node-status">Completed (340ms)</div>
          </div>
          <div class="dag-arrow">→</div>
          <div class="dag-node node-active" id="node-3">
            <div class="node-icon">⚡</div>
            <div class="node-title">3. Synthesis & Verification</div>
            <div class="node-status">Streaming tokens...</div>
          </div>
          <div class="dag-arrow">→</div>
          <div class="dag-node node-pending" id="node-4">
            <div class="node-icon">🛡️</div>
            <div class="node-title">4. Security Attestation</div>
            <div class="node-status">Awaiting output</div>
          </div>
        </div>
      </div>

      <!-- Live Execution Output & Reasoning Stream -->
      <div class="stream-panel">
        <div class="stream-tabs">
          <button class="stream-tab active" data-view="reasoning">Agent Thoughts & Chain of Thought</button>
          <button class="stream-tab" data-view="artifact">Generated Artifact</button>
          <button class="stream-tab" data-view="tools">Tool Calls & Sandbox Output (4)</button>
        </div>

        <div class="stream-content" id="stream-content">
          <!-- Populated by JavaScript -->
        </div>
      </div>
    </main>
  </div>

  <div class="toast-popup" id="studio-toast"></div>
</div>
`,
  css: `
:root {
  --bg-studio: #0a0d14;
  --bg-panel: rgba(16, 22, 34, 0.75);
  --border: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(99, 102, 241, 0.4);
  --accent-primary: #6366f1;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-purple: #a855f7;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-studio);
  color: var(--text-main);
  font-family: var(--font);
  height: 100vh;
  overflow: hidden;
}

.agent-studio-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Header */
.studio-header {
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
.studio-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.studio-logo svg { width: 20px; height: 20px; }
.studio-title { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; color: #fff; }
.studio-sub { font-size: 11px; color: var(--text-muted); }

.pipeline-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.pill-dot { width: 8px; height: 8px; border-radius: 50%; }
.pill-dot.active { background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald); }
.pill-divider { color: var(--border); }
.text-cyan { color: var(--accent-cyan); font-weight: 700; }

.header-right { display: flex; gap: 10px; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), #4f46e5);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #fff;
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

/* Workspace Layout */
.studio-workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 310px 1fr;
  overflow: hidden;
}

/* Left Panel */
.studio-left-panel {
  background: rgba(10, 14, 23, 0.95);
  border-right: 1px solid var(--border);
  padding: 20px 16px;
  overflow-y: auto;
}
.panel-section-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #64748b;
  margin-bottom: 12px;
}

.agent-cards-stack { display: flex; flex-direction: column; gap: 10px; }
.agent-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.agent-card:hover { border-color: rgba(99, 102, 241, 0.3); }
.agent-card.active {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}
.agent-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.agent-avatar { font-size: 18px; }
.agent-details { flex: 1; }
.agent-name { font-size: 13px; font-weight: 700; color: #fff; }
.agent-model { font-size: 11px; color: var(--text-muted); }
.agent-status-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
}
.agent-status-badge.status-idle {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
}
.agent-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 8px;
}
.agent-metrics strong { color: #e2e8f0; }

/* Hyperparams */
.hyperparams-box {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.param-row { display: flex; flex-direction: column; gap: 6px; }
.param-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--text-muted); }
.param-val { color: var(--accent-cyan); font-weight: 800; }
.param-row input[type="range"] {
  width: 100%;
  accent-color: var(--accent-primary);
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}
.param-toggles { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px; }
.toggle-label { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #cbd5e1; cursor: pointer; }
.toggle-label input { accent-color: var(--accent-primary); }

/* Center Main Area */
.studio-center {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 18px 24px;
  gap: 16px;
}

/* Prompt Bar */
.prompt-workbench {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
}
.preset-pills { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.preset-label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.pill-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.pill-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.pill-btn.active { background: rgba(99, 102, 241, 0.2); border-color: var(--accent-primary); color: #fff; font-weight: 600; }

.input-row { display: flex; gap: 12px; align-items: flex-end; }
.input-row textarea {
  flex: 1;
  background: #090d15;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
}
.input-row textarea:focus { border-color: var(--accent-primary); }
.btn-run { height: 44px; padding: 0 20px; font-size: 13px; flex-shrink: 0; }

/* DAG Card */
.dag-canvas-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
}
.canvas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.canvas-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #64748b; }
.dag-legend { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); align-items: center; }
.legend-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px; }
.status-done { background: var(--accent-emerald); }
.status-active { background: var(--accent-primary); box-shadow: 0 0 6px var(--accent-primary); }
.status-pending { background: #64748b; }

.dag-nodes-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dag-node {
  flex: 1;
  background: #0d121e;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  text-align: center;
}
.dag-node.node-done { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05); }
.dag-node.node-active { border-color: var(--accent-primary); background: rgba(99, 102, 241, 0.1); box-shadow: 0 0 12px rgba(99, 102, 241, 0.2); }
.node-icon { font-size: 16px; margin-bottom: 2px; }
.node-title { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.node-status { font-size: 10px; color: var(--text-muted); }
.dag-arrow { color: #475569; font-weight: 800; font-size: 14px; }

/* Stream Output */
.stream-panel {
  flex: 1;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.stream-tabs {
  display: flex;
  background: rgba(10, 14, 23, 0.8);
  border-bottom: 1px solid var(--border);
  padding: 0 12px;
}
.stream-tab {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.stream-tab.active { color: #fff; border-bottom-color: var(--accent-primary); font-weight: 700; }

.stream-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.6;
}
.thought-block {
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid var(--accent-primary);
  padding: 8px 14px;
  margin-bottom: 12px;
  border-radius: 0 6px 6px 0;
  color: #cbd5e1;
}
.thought-agent { font-size: 11px; font-weight: 800; color: #a5b4fc; margin-bottom: 4px; }
.code-block-preview {
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  color: #38bdf8;
  white-space: pre-wrap;
}

/* Toast */
.toast-popup {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e1b4b;
  border: 1px solid var(--accent-primary);
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
    const toast = document.getElementById('studio-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // Slider bindings
  const tempSlider = document.getElementById('temp-slider');
  const tempVal = document.getElementById('temp-val');
  if (tempSlider && tempVal) {
    tempSlider.addEventListener('input', (e) => {
      tempVal.textContent = e.target.value;
    });
  }

  const loopSlider = document.getElementById('loop-slider');
  const loopVal = document.getElementById('loop-val');
  if (loopSlider && loopVal) {
    loopSlider.addEventListener('input', (e) => {
      loopVal.textContent = e.target.value;
    });
  }

  // Presets
  const presetPills = document.querySelectorAll('.pill-btn');
  const taskInput = document.getElementById('task-input');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const text = pill.getAttribute('data-prompt');
      if (taskInput && text) {
        taskInput.value = text;
      }
      showToast('Loaded preset: ' + pill.textContent);
    });
  });

  // Agent Cards selection
  const agentCards = document.querySelectorAll('.agent-card');
  agentCards.forEach(card => {
    card.addEventListener('click', () => {
      agentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const agentName = card.querySelector('.agent-name')?.textContent || '';
      showToast('Inspecting telemetry for: ' + agentName);
    });
  });

  // Stream Views
  const streamTabs = document.querySelectorAll('.stream-tab');
  const streamContent = document.getElementById('stream-content');

  const streamViews = {
    reasoning: \`
      <div class="thought-block">
        <div class="thought-agent">🧠 ARCHITECT AGENT (Gemini 1.5 Pro)</div>
        <div>Goal analyzed: Decomposing distributed Go caching tier into 3 decoupled tasks:
1. Core in-memory LRU storage engine with write-through cache semantics.
2. Raft consensus state machine for quorum replication across nodes.
3. gRPC high-concurrency transport with snappy wire compression.</div>
      </div>
      <div class="thought-block">
        <div class="thought-agent">🔍 RESEARCH AGENT (Claude 3.7 Sonnet)</div>
        <div>Synthesized Hashicorp Raft consensus patterns and bbolt persistent log storage. Zero data loss on node failure verified with fuzz testing.</div>
      </div>
      <div class="thought-block">
        <div class="thought-agent">⚡ SYNTHESIS & CODING (GPT-4o)</div>
        <div>Generating production \`cluster.go\` node coordinator and unit test harness. Verified 1.2M ops/sec with benchmark tests in isolated micro-VM.</div>
      </div>
      <div style="color:#10b981; font-weight:700; margin-top:14px;">
        ✓ Pipeline verification successful. All 4 autonomous agents converged on zero-defect consensus.
      </div>
    \`,
    artifact: \`
      <div class="code-block-preview">// cluster.go - High Throughput Distributed Raft Cache
package cluster

import (
    "context"
    "sync"
    "time"
)

type NodeConfig struct {
    ID           string
    BindAddr     string
    Peers        []string
    RaftHeartbeat time.Duration
}

type DistributedCache struct {
    mu       sync.RWMutex
    store    map[string][]byte
    config   NodeConfig
    leaderID string
}

func New(cfg NodeConfig) (*DistributedCache, error) {
    return &DistributedCache{
        store:  make(map[string][]byte),
        config: cfg,
    }, nil
}

func (c *DistributedCache) Set(ctx context.Context, key string, val []byte) error {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.store[key] = val
    return nil
}</div>
    \`,
    tools: \`
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:#090d15; border:1px solid rgba(255,255,255,0.06); padding:10px 14px; border-radius:6px;">
          <span style="color:#6366f1; font-weight:800;">TOOL CALL 1:</span> \`web_search("go raft consensus production benchmark 2026")\` → 8 relevant sources indexed.
        </div>
        <div style="background:#090d15; border:1px solid rgba(255,255,255,0.06); padding:10px 14px; border-radius:6px;">
          <span style="color:#6366f1; font-weight:800;">TOOL CALL 2:</span> \`sandbox_run_bash("go test -v -race -cover ./...")\` → <strong>PASS</strong> (Coverage: 98.4%).
        </div>
        <div style="background:#090d15; border:1px solid rgba(255,255,255,0.06); padding:10px 14px; border-radius:6px;">
          <span style="color:#6366f1; font-weight:800;">TOOL CALL 3:</span> \`security_audit_scanner("cluster.go")\` → 0 CVEs detected.
        </div>
      </div>
    \`
  };

  function renderStreamView(viewKey) {
    if (streamContent && streamViews[viewKey]) {
      streamContent.innerHTML = streamViews[viewKey];
    }
  }

  streamTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      streamTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStreamView(tab.getAttribute('data-view'));
    });
  });

  // Initial render
  renderStreamView('reasoning');

  // Launch Execution
  const btnRun = document.getElementById('btn-run-goal');
  const btnDeploy = document.getElementById('btn-deploy-pipeline');
  function triggerExecution() {
    showToast('🚀 Multi-Agent Cluster started! Decomposing task across 4 agents...');
    const node3 = document.getElementById('node-3');
    if (node3) {
      node3.className = 'dag-node node-active';
      const status = node3.querySelector('.node-status');
      if (status) status.textContent = 'Active (Consensus Loop)';
    }
  }

  if (btnRun) btnRun.addEventListener('click', triggerExecution);
  if (btnDeploy) btnDeploy.addEventListener('click', triggerExecution);

  const btnExport = document.getElementById('btn-export-graph');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      showToast('Exported pipeline DAG configuration as JSON');
    });
  }
})();
`
};
