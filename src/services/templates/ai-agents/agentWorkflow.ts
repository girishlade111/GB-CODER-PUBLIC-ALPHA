// Autonomous Workflow Orchestrator Template
// Multi-agent graph pipeline with live step execution simulator, node inspector, and token meters

const html = `
<div class="wf-container">
  <!-- Top Bar -->
  <header class="wf-header">
    <div class="wf-brand">
      <div class="wf-logo">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
      </div>
      <div>
        <div class="wf-title">Synapse Workflow Orchestrator <span class="wf-badge">v3.4 Production</span></div>
        <div class="wf-sub">Autonomous Multi-Agent DAG Execution Engine</div>
      </div>
    </div>

    <div class="wf-actions">
      <div class="wf-stat">
        <span class="wf-stat-label">Total Execution Cost:</span>
        <span class="wf-stat-val" id="totalCost">$0.0412</span>
      </div>
      <div class="wf-stat">
        <span class="wf-stat-label">Tokens Used:</span>
        <span class="wf-stat-val" id="tokenCount">18,420</span>
      </div>
      <button class="wf-btn wf-btn-primary" id="runPipelineBtn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Execute Pipeline
      </button>
      <button class="wf-btn wf-btn-outline" id="resetPipelineBtn">Reset</button>
    </div>
  </header>

  <!-- Main Grid -->
  <div class="wf-layout">
    <!-- DAG Visual Canvas -->
    <div class="wf-canvas-card">
      <div class="wf-card-header">
        <div class="wf-card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Active Pipeline Graph: <code>Customer-Refund-Triage-v4</code>
        </div>
        <div class="wf-status-pill" id="pipelineStatus">Status: Ready</div>
      </div>

      <div class="wf-graph-viewport">
        <!-- Connecting Line SVGs -->
        <svg class="wf-connections-svg" id="connectionsSvg">
          <line class="wf-wire" id="wire1" x1="160" y1="110" x2="310" y2="110"/>
          <line class="wf-wire" id="wire2" x1="470" y1="110" x2="620" y2="110"/>
          <line class="wf-wire" id="wire3" x1="620" y1="130" x2="470" y2="280"/>
          <line class="wf-wire" id="wire4" x1="470" y1="300" x2="780" y2="300"/>
        </svg>

        <!-- Pipeline Nodes -->
        <div class="wf-node" id="node1" data-node="ingest" style="left: 40px; top: 60px;">
          <div class="node-icon bg-indigo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="node-content">
            <div class="node-header">
              <span class="node-role">Trigger</span>
              <span class="node-tag">Webhook</span>
            </div>
            <div class="node-name">1. Support Ingest</div>
            <div class="node-meta">Zendesk P1 Ticket Event</div>
            <div class="node-state-pill" id="state-node1">Idle</div>
          </div>
        </div>

        <div class="wf-node" id="node2" data-node="classifier" style="left: 310px; top: 60px;">
          <div class="node-icon bg-purple">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="node-content">
            <div class="node-header">
              <span class="node-role">LLM Agent</span>
              <span class="node-tag">Claude 3.5</span>
            </div>
            <div class="node-name">2. Intent & Sentiment</div>
            <div class="node-meta">Classify refund & risk score</div>
            <div class="node-state-pill" id="state-node2">Idle</div>
          </div>
        </div>

        <div class="wf-node" id="node3" data-node="rag" style="left: 620px; top: 60px;">
          <div class="node-icon bg-cyan">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div class="node-content">
            <div class="node-header">
              <span class="node-role">RAG Vector</span>
              <span class="node-tag">Pinecone</span>
            </div>
            <div class="node-name">3. Policy Search</div>
            <div class="node-meta">Retrieve terms & return window</div>
            <div class="node-state-pill" id="state-node3">Idle</div>
          </div>
        </div>

        <div class="wf-node" id="node4" data-node="tool" style="left: 310px; top: 250px;">
          <div class="node-icon bg-amber">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div class="node-content">
            <div class="node-header">
              <span class="node-role">Function Call</span>
              <span class="node-tag">Stripe API</span>
            </div>
            <div class="node-name">4. Refund Verification</div>
            <div class="node-meta">Check transaction auth token</div>
            <div class="node-state-pill" id="state-node4">Idle</div>
          </div>
        </div>

        <div class="wf-node" id="node5" data-node="action" style="left: 620px; top: 250px;">
          <div class="node-icon bg-emerald">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="node-content">
            <div class="node-header">
              <span class="node-role">Execution</span>
              <span class="node-tag">Auto Resolve</span>
            </div>
            <div class="node-name">5. Refund & Notification</div>
            <div class="node-meta">Issue $240 credit & notify user</div>
            <div class="node-state-pill" id="state-node5">Idle</div>
          </div>
        </div>
      </div>

      <!-- Execution Progress Bar -->
      <div class="wf-progress-container">
        <div class="wf-progress-label">
          <span>Overall Workflow Completion</span>
          <span id="progressPercent">0%</span>
        </div>
        <div class="wf-progress-track">
          <div class="wf-progress-bar" id="progressBar" style="width: 0%;"></div>
        </div>
      </div>
    </div>

    <!-- Inspector & Live Logs -->
    <div class="wf-sidebar">
      <!-- Node Inspector -->
      <div class="wf-panel">
        <div class="wf-panel-title">
          <span>Node Inspector</span>
          <span class="wf-panel-badge" id="inspectorNodeId">node2</span>
        </div>
        <div class="wf-inspector-body" id="inspectorBody">
          <div class="wf-field">
            <label>Agent Role:</label>
            <div class="wf-val">Intent & Sentiment Classifier</div>
          </div>
          <div class="wf-field">
            <label>LLM Model:</label>
            <div class="wf-val">anthropic/claude-3-5-sonnet</div>
          </div>
          <div class="wf-field">
            <label>Temperature:</label>
            <div class="wf-val">0.1 (Deterministic)</div>
          </div>
          <div class="wf-field">
            <label>System Instructions:</label>
            <div class="wf-code-box">You are an elite fraud & sentiment triage agent. Parse ticket context and calculate refund entitlement score between 0.0 and 1.0.</div>
          </div>
        </div>
      </div>

      <!-- Live Agent Stream Console -->
      <div class="wf-panel wf-logs-panel">
        <div class="wf-panel-title">
          <span>Realtime Stream & Logs</span>
          <span class="wf-dot-pulse"></span>
        </div>
        <div class="wf-logs-stream" id="logsStream">
          <div class="log-entry log-sys">[00:00.00] Synapse engine initialized. Graph validated.</div>
          <div class="log-entry log-sys">[00:00.01] 5 Nodes, 4 Edges active. Ready for trigger.</div>
        </div>
      </div>
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
  background-color: #0b0f19;
  color: #e2e8f0;
  overflow-x: hidden;
}

.wf-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.wf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
  flex-wrap: wrap;
  gap: 16px;
}

.wf-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.wf-logo {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.wf-title {
  font-size: 16px;
  font-weight: 700;
  color: #f9fafb;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-badge {
  font-size: 11px;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.wf-sub {
  font-size: 12px;
  color: #9ca3af;
}

.wf-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wf-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.wf-stat-label {
  font-size: 11px;
  color: #6b7280;
}

.wf-stat-val {
  font-size: 14px;
  font-weight: 700;
  color: #34d399;
}

.wf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wf-btn-primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.wf-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45);
}

.wf-btn-outline {
  background: #1f2937;
  color: #d1d5db;
  border: 1px solid #374151;
}

.wf-btn-outline:hover {
  background: #374151;
  color: #fff;
}

.wf-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  flex: 1;
  gap: 1px;
  background: #1f2937;
}

@media (max-width: 1080px) {
  .wf-layout {
    grid-template-columns: 1fr;
  }
}

.wf-canvas-card {
  background: #0b0f19;
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.wf-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.wf-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-card-title code {
  background: #1e293b;
  color: #38bdf8;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.wf-status-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  background: #1f2937;
  color: #9ca3af;
  border: 1px solid #374151;
}

.wf-status-pill.running {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border-color: #6366f1;
}

.wf-status-pill.success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: #10b981;
}

.wf-graph-viewport {
  position: relative;
  height: 480px;
  background: radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 1px, transparent 1px);
  background-size: 24px 24px;
  border: 1px solid #1f2937;
  border-radius: 12px;
  margin-bottom: 20px;
}

.wf-connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wf-wire {
  stroke: #374151;
  stroke-width: 2;
  stroke-dasharray: 4;
  transition: all 0.3s ease;
}

.wf-wire.active {
  stroke: #6366f1;
  stroke-dasharray: none;
  stroke-width: 3;
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.6));
}

.wf-node {
  position: absolute;
  width: 240px;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.wf-node:hover {
  border-color: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.wf-node.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3), 0 8px 24px rgba(99, 102, 241, 0.2);
}

.wf-node.active-step {
  border-color: #a855f7;
  animation: pulse-glow 1.5s infinite;
}

.wf-node.completed-step {
  border-color: #10b981;
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
.bg-purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.bg-cyan { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }
.bg-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.bg-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.node-content {
  flex: 1;
  min-width: 0;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.node-role {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 600;
}

.node-tag {
  font-size: 9px;
  background: #1f2937;
  color: #d1d5db;
  padding: 1px 5px;
  border-radius: 4px;
}

.node-name {
  font-size: 13px;
  font-weight: 600;
  color: #f3f4f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-meta {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.node-state-pill {
  display: inline-block;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 6px;
  background: #1f2937;
  color: #9ca3af;
}

.node-state-pill.running {
  background: rgba(99, 102, 241, 0.3);
  color: #818cf8;
}

.node-state-pill.done {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.wf-progress-container {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 14px 18px;
}

.wf-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.wf-progress-track {
  height: 8px;
  background: #1f2937;
  border-radius: 9999px;
  overflow: hidden;
}

.wf-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #10b981);
  transition: width 0.4s ease;
}

.wf-sidebar {
  background: #0b0f19;
  display: flex;
  flex-direction: column;
}

.wf-panel {
  padding: 18px;
  border-bottom: 1px solid #1f2937;
}

.wf-panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #f3f4f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 14px;
}

.wf-panel-badge {
  font-size: 11px;
  background: #1e293b;
  color: #818cf8;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: none;
}

.wf-field {
  margin-bottom: 12px;
}

.wf-field label {
  font-size: 11px;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
}

.wf-val {
  font-size: 12px;
  color: #e5e7eb;
  font-weight: 500;
}

.wf-code-box {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 6px;
  padding: 10px;
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
  line-height: 1.5;
}

.wf-logs-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wf-dot-pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.wf-logs-stream {
  flex: 1;
  background: #06090e;
  border: 1px solid #1f2937;
  border-radius: 8px;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 11px;
  overflow-y: auto;
  height: 240px;
}

.log-entry {
  margin-bottom: 6px;
  line-height: 1.4;
}

.log-sys { color: #6b7280; }
.log-info { color: #38bdf8; }
.log-success { color: #34d399; }
.log-exec { color: #c084fc; }
`;

const javascript = `
(function() {
  const runBtn = document.getElementById('runPipelineBtn');
  const resetBtn = document.getElementById('resetPipelineBtn');
  const pipelineStatus = document.getElementById('pipelineStatus');
  const progressPercent = document.getElementById('progressPercent');
  const progressBar = document.getElementById('progressBar');
  const totalCost = document.getElementById('totalCost');
  const tokenCount = document.getElementById('tokenCount');
  const logsStream = document.getElementById('logsStream');
  const nodes = document.querySelectorAll('.wf-node');
  const wires = document.querySelectorAll('.wf-wire');
  
  let isRunning = false;
  let currentCost = 0.0412;
  let currentTokens = 18420;

  function appendLog(text, type) {
    if (!logsStream) return;
    const now = new Date();
    const timeStr = '[' + now.getMinutes().toString().padStart(2, '0') + ':' +
      now.getSeconds().toString().padStart(2, '0') + '.' +
      Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0') + '] ';
    const div = document.createElement('div');
    div.className = 'log-entry ' + (type || 'log-info');
    div.textContent = timeStr + text;
    logsStream.appendChild(div);
    logsStream.scrollTop = logsStream.scrollHeight;
  }

  // Node selection inspector
  const nodeDetails = {
    ingest: {
      id: 'node1',
      role: 'Support Ingest & Webhook Collector',
      model: 'Custom Golang Ingest Daemon',
      temp: 'N/A',
      prompt: 'Listens to Zendesk customer webhook topics. Validates HMAC signature and enqueues payload into Redis Stream with high priority tag.'
    },
    classifier: {
      id: 'node2',
      role: 'Intent & Sentiment Classifier',
      model: 'anthropic/claude-3-5-sonnet',
      temp: '0.1 (Deterministic)',
      prompt: 'You are an elite fraud & sentiment triage agent. Parse ticket context and calculate refund entitlement score between 0.0 and 1.0.'
    },
    rag: {
      id: 'node3',
      role: 'Vector Knowledge Policy Retrieval',
      model: 'text-embedding-3-large (1536 dim)',
      temp: '0.0',
      prompt: 'Perform hybrid dense+sparse cosine retrieval against Merchant Terms & Conditions vector store for Section 14.B Refund Eligibility.'
    },
    tool: {
      id: 'node4',
      role: 'Stripe API Function Calling Tool',
      model: 'openai/gpt-4o-function-calling',
      temp: '0.0',
      prompt: 'Execute charges.retrieve and customers.verify. Validate purchase date was within 30 days and charge status is "succeeded".'
    },
    action: {
      id: 'node5',
      role: 'Autonomous Action & Resolution Dispatcher',
      model: 'Synapse Core Event Bus',
      temp: 'N/A',
      prompt: 'Issue refund credit of $240.00 via Stripe API, append resolution audit trail to Zendesk ticket, and trigger customer satisfaction SMS.'
    }
  };

  nodes.forEach(node => {
    node.addEventListener('click', function() {
      nodes.forEach(n => n.classList.remove('selected'));
      this.classList.add('selected');
      const key = this.getAttribute('data-node');
      const detail = nodeDetails[key];
      if (detail) {
        document.getElementById('inspectorNodeId').textContent = detail.id;
        document.getElementById('inspectorBody').innerHTML = 
          '<div class="wf-field"><label>Agent Role:</label><div class="wf-val">' + detail.role + '</div></div>' +
          '<div class="wf-field"><label>LLM Model / Engine:</label><div class="wf-val">' + detail.model + '</div></div>' +
          '<div class="wf-field"><label>Temperature:</label><div class="wf-val">' + detail.temp + '</div></div>' +
          '<div class="wf-field"><label>System Prompt / Logic:</label><div class="wf-code-box">' + detail.prompt + '</div></div>';
      }
    });
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function executePipeline() {
    if (isRunning) return;
    isRunning = true;
    runBtn.disabled = true;
    runBtn.style.opacity = '0.6';
    pipelineStatus.className = 'wf-status-pill running';
    pipelineStatus.textContent = 'Status: Executing...';

    // Step 1: Ingest
    appendLog('Step 1: Ingesting ticket #94821 (Priority: Urgent, Customer: Tier 1 Enterprise)', 'log-info');
    setNodeState('node1', 'running', 'Consuming');
    progressBar.style.width = '20%';
    progressPercent.textContent = '20%';
    await sleep(900);
    setNodeState('node1', 'done', 'Done (12ms)');
    document.getElementById('wire1').classList.add('active');

    // Step 2: Classifier
    appendLog('Step 2: Invoking Claude 3.5 Sonnet intent analysis...', 'log-exec');
    setNodeState('node2', 'running', 'Reasoning');
    progressBar.style.width = '40%';
    progressPercent.textContent = '40%';
    currentTokens += 2140;
    currentCost += 0.0094;
    tokenCount.textContent = currentTokens.toLocaleString();
    totalCost.textContent = '$' + currentCost.toFixed(4);
    await sleep(1200);
    appendLog('Sentiment: Frustrated (0.88), Refund Intent: 0.96. Entitlement Score: Passed.', 'log-success');
    setNodeState('node2', 'done', 'Done (240ms)');
    document.getElementById('wire2').classList.add('active');

    // Step 3: RAG
    appendLog('Step 3: Querying Pinecone vector store for refund policies...', 'log-info');
    setNodeState('node3', 'running', 'Searching');
    progressBar.style.width = '60%';
    progressPercent.textContent = '60%';
    currentTokens += 850;
    currentCost += 0.0021;
    tokenCount.textContent = currentTokens.toLocaleString();
    totalCost.textContent = '$' + currentCost.toFixed(4);
    await sleep(1000);
    appendLog('Pinecone matched policy 14.B (Score 0.942): Eligible for full refund within 30 days.', 'log-success');
    setNodeState('node3', 'done', 'Done (84ms)');
    document.getElementById('wire3').classList.add('active');

    // Step 4: Stripe Tool
    appendLog('Step 4: Executing Stripe API call charges.retrieve("ch_3M4o9kL...")', 'log-exec');
    setNodeState('node4', 'running', 'Calling API');
    progressBar.style.width = '80%';
    progressPercent.textContent = '80%';
    await sleep(1100);
    appendLog('Stripe confirmed transaction: $240.00 USD, original date 8 days ago. Verified valid.', 'log-success');
    setNodeState('node4', 'done', 'Done (140ms)');
    document.getElementById('wire4').classList.add('active');

    // Step 5: Action
    appendLog('Step 5: Executing refund payment and sending confirmation notification...', 'log-exec');
    setNodeState('node5', 'running', 'Refunding');
    progressBar.style.width = '100%';
    progressPercent.textContent = '100%';
    await sleep(900);
    appendLog('SUCCESS: Refund #re_88294 issued for $240.00. Customer notification dispatched.', 'log-success');
    setNodeState('node5', 'done', 'Completed');

    pipelineStatus.className = 'wf-status-pill success';
    pipelineStatus.textContent = 'Status: Success (All Nodes Resolved)';
    runBtn.disabled = false;
    runBtn.style.opacity = '1';
    isRunning = false;
  }

  function setNodeState(id, state, text) {
    const el = document.getElementById(id);
    const pill = document.getElementById('state-' + id);
    if (!el || !pill) return;
    el.classList.remove('active-step', 'completed-step');
    pill.classList.remove('running', 'done');
    if (state === 'running') {
      el.classList.add('active-step');
      pill.classList.add('running');
      pill.textContent = text;
    } else if (state === 'done') {
      el.classList.add('completed-step');
      pill.classList.add('done');
      pill.textContent = text;
    } else {
      pill.textContent = 'Idle';
    }
  }

  function resetPipeline() {
    if (isRunning) return;
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    pipelineStatus.className = 'wf-status-pill';
    pipelineStatus.textContent = 'Status: Ready';
    wires.forEach(w => w.classList.remove('active'));
    nodes.forEach(n => {
      n.classList.remove('active-step', 'completed-step');
      const id = n.id;
      const pill = document.getElementById('state-' + id);
      if (pill) {
        pill.className = 'node-state-pill';
        pill.textContent = 'Idle';
      }
    });
    appendLog('Pipeline reset. State cleared.', 'log-sys');
  }

  if (runBtn) runBtn.addEventListener('click', executePipeline);
  if (resetBtn) resetBtn.addEventListener('click', resetPipeline);
})();
`;

export default { html, css, javascript };
