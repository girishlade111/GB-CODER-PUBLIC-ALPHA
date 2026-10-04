export default {
  html: `
<div class="rag-app" id="top">
  <!-- Header -->
  <header class="rag-header">
    <div class="h-brand">
      <div class="rag-icon">◈</div>
      <div>
        <h1 class="rag-title">VectorMind RAG</h1>
        <div class="rag-sub">Hybrid Semantic Vector Retrieval & Knowledge Engine</div>
      </div>
    </div>

    <div class="index-status-pill">
      <span class="status-dot"></span>
      <span>Index: <strong>enterprise_v4</strong> (482,910 Vector Embeddings)</span>
    </div>

    <button class="btn btn-primary" id="btn-ingest">Ingest Knowledge Source</button>
  </header>

  <!-- Main Grid -->
  <div class="rag-workspace">
    <!-- Left: Knowledge Collections & Configuration -->
    <aside class="rag-sidebar">
      <div class="side-sec-title">CONNECTED CORPORA</div>
      <div class="corpora-list">
        <div class="corpus-card active" data-corpus="engineering">
          <div class="c-icon">📁</div>
          <div class="c-info">
            <div class="c-name">Engineering Architecture Docs</div>
            <div class="c-meta">142 PDFs • 84k Chunks • text-embedding-3-large</div>
          </div>
        </div>

        <div class="corpus-card" data-corpus="compliance">
          <div class="c-icon">⚖️</div>
          <div class="c-info">
            <div class="c-name">SOC2 & Compliance Policies</div>
            <div class="c-meta">38 Docs • 19k Chunks • Voyage-3</div>
          </div>
        </div>

        <div class="corpus-card" data-corpus="support">
          <div class="c-icon">💬</div>
          <div class="c-info">
            <div class="c-name">Customer Support Knowledgebase</div>
            <div class="c-meta">1,400 Articles • 112k Chunks • Cohere v3</div>
          </div>
        </div>
      </div>

      <div class="side-sec-title" style="margin-top:24px;">RETRIEVAL PARAMETERS</div>
      <div class="param-box">
        <div class="param-label">
          <span>Cosine Similarity Threshold:</span>
          <strong id="thresh-val">0.75</strong>
        </div>
        <input type="range" id="thresh-slider" min="0.5" max="0.95" step="0.05" value="0.75" />

        <div class="param-label" style="margin-top:14px;">
          <span>Top-K Semantic Chunks:</span>
          <strong id="topk-val">4</strong>
        </div>
        <input type="range" id="topk-slider" min="1" max="10" step="1" value="4" />

        <div class="toggle-row" style="margin-top:14px;">
          <label><input type="checkbox" checked id="chk-rerank"> Cross-Encoder Re-Ranking</label>
        </div>
      </div>
    </aside>

    <!-- Main Retrieval Playground -->
    <main class="rag-main">
      <!-- Query Box -->
      <div class="query-box">
        <div class="preset-row">
          <span class="preset-lbl">Sample Questions:</span>
          <button class="q-btn active" data-q="What is the automated failover procedure for EU-West Redis replicas?">EU Redis Failover</button>
          <button class="q-btn" data-q="How are mTLS certificates rotated across Kubernetes ingress workers?">mTLS Rotation</button>
          <button class="q-btn" data-q="What is our financial SLA penalty for p99 latency above 500ms?">SLA Latencies</button>
        </div>

        <div class="search-input-row">
          <input type="text" id="query-input" value="What is the automated failover procedure for EU-West Redis replicas?" placeholder="Ask any technical or architectural question across your enterprise corpus..." />
          <button class="btn btn-primary" id="btn-search">Query Knowledge</button>
        </div>
      </div>

      <!-- Synthesized Answer -->
      <div class="answer-card">
        <div class="answer-head">
          <div class="badge-answer">SYNTHESIZED RAG ANSWER</div>
          <span class="answer-model">Grounded in 3 retrieved chunks • Zero hallucinations</span>
        </div>
        <div class="answer-body" id="answer-body">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Retrieved Chunks with Similarity Scores -->
      <div class="chunks-section">
        <div class="chunks-head">
          <span class="chunks-title">RETRIEVED VECTOR CHUNKS</span>
          <span class="chunks-count" id="chunks-count">3 Sources Ranked by Cosine Similarity</span>
        </div>

        <div class="chunks-list" id="chunks-list">
          <!-- Injected via JS -->
        </div>
      </div>
    </main>
  </div>

  <div class="rag-toast" id="rag-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #090c14;
  --bg-panel: rgba(16, 22, 34, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  height: 100vh;
  overflow: hidden;
}

.rag-app { display: flex; flex-direction: column; height: 100vh; }

/* Header */
.rag-header {
  height: 64px;
  background: rgba(12, 16, 26, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.h-brand { display: flex; align-items: center; gap: 12px; }
.rag-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
}
.rag-title { font-size: 16px; font-weight: 800; color: #fff; }
.rag-sub { font-size: 11px; color: var(--text-muted); }

.index-status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
}
.status-dot { width: 6px; height: 6px; background: var(--accent-emerald); border-radius: 50%; box-shadow: 0 0 6px var(--accent-emerald); }

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.btn-primary { background: var(--accent-blue); color: #fff; }
.btn-primary:hover { background: #2563eb; }

/* Workspace */
.rag-workspace { flex: 1; display: grid; grid-template-columns: 320px 1fr; overflow: hidden; }

/* Sidebar */
.rag-sidebar { background: #0a0e17; border-right: 1px solid var(--border); padding: 20px; overflow-y: auto; }
.side-sec-title { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; color: #64748b; margin-bottom: 12px; }
.corpora-list { display: flex; flex-direction: column; gap: 10px; }
.corpus-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.corpus-card.active { border-color: var(--accent-cyan); background: rgba(6, 182, 212, 0.08); }
.c-icon { font-size: 20px; }
.c-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.c-meta { font-size: 10px; color: var(--text-muted); }

.param-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-size: 12px; }
.param-label { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--text-muted); }
.param-box input[type="range"] { width: 100%; accent-color: var(--accent-cyan); }
.toggle-row { color: #cbd5e1; font-size: 11px; }

/* Main */
.rag-main { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

/* Query Box */
.query-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
.preset-row { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.preset-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.q-btn { background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; }
.q-btn.active { background: rgba(6, 182, 212, 0.15); border-color: var(--accent-cyan); color: #fff; font-weight: 600; }
.search-input-row { display: flex; gap: 10px; }
.search-input-row input {
  flex: 1;
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
.search-input-row input:focus { border-color: var(--accent-cyan); }

/* Answer */
.answer-card { background: linear-gradient(180deg, rgba(16, 24, 38, 0.9), rgba(12, 18, 28, 0.9)); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.answer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.badge-answer { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
.answer-model { font-size: 11px; color: var(--text-muted); }
.answer-body { font-size: 14px; color: #e2e8f0; line-height: 1.6; }
.citation-badge { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; cursor: pointer; }

/* Chunks */
.chunks-section { display: flex; flex-direction: column; gap: 12px; }
.chunks-head { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 1px; }
.chunks-list { display: flex; flex-direction: column; gap: 12px; }
.chunk-item { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.chunk-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
.chunk-doc { font-size: 12px; font-weight: 700; color: #fff; }
.similarity-pill { font-size: 11px; font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald); background: rgba(16,185,129,0.1); padding: 2px 8px; border-radius: 4px; }
.chunk-text { font-size: 12px; color: var(--text-muted); line-height: 1.6; font-family: var(--font-mono); background: #07090f; padding: 10px 12px; border-radius: 6px; }

/* Toast */
.rag-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-cyan);
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
    const toast = document.getElementById('rag-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Range listeners
  const threshSlider = document.getElementById('thresh-slider');
  const threshVal = document.getElementById('thresh-val');
  if (threshSlider && threshVal) {
    threshSlider.addEventListener('input', (e) => {
      threshVal.textContent = e.target.value;
    });
  }

  const topkSlider = document.getElementById('topk-slider');
  const topkVal = document.getElementById('topk-val');
  if (topkSlider && topkVal) {
    topkSlider.addEventListener('input', (e) => {
      topkVal.textContent = e.target.value;
    });
  }

  // Ingest button
  document.getElementById('btn-ingest')?.addEventListener('click', () => {
    showToast('Document ingestion pipeline initiated. Chunking & embedding 14 new files...');
  });

  // Queries Database
  const queries = {
    'failover': {
      answer: 'When EU-West Redis replicas fail their Sentinel heartbeats for more than <strong>3 consecutive ticks (300ms)</strong>, the cluster enters autonomous split-brain guard. The standby replica in Frankfurt (eu-central-1) is promoted to master within <strong>1.2 seconds</strong>, and all edge Envoy proxies automatically rewrite upstream routing headers via eBPF without connection termination.',
      chunks: [
        { doc: 'docs/infra/redis-failover-protocol.md #chunk-4', sim: '0.942', text: 'Sentinel quorum requires 2-of-3 node agreement before triggering leader promotion. Ingress proxies cache active masters using a 100ms TTL DNS record.' },
        { doc: 'runbooks/incident-response/eu-database-degradation.md #chunk-11', sim: '0.887', text: 'Section 4.2: Automated replication lag recovery will pause secondary writes if replication offset exceeds 40MB.' },
        { doc: 'architecture/storage-mesh-topology.md #chunk-29', sim: '0.812', text: 'Edge Envoy gateways maintain active health probes against all promoted master endpoints.' }
      ]
    },
    'mtls': {
      answer: 'Ingress mTLS certificates are managed by an automated Vault PKI authority. Ephemeral certificates have a <strong>24-hour lifetime</strong> and are rotated gracefully every 12 hours. Zero downtime is achieved through dual-certificate trust validation windows during rotation.',
      chunks: [
        { doc: 'security/zero-trust-mtls-spec.md #chunk-2', sim: '0.961', text: 'Vault issues X.509 certs with SHA-256 signatures and strict SAN IP validation.' },
        { doc: 'devops/k8s-cert-manager-config.md #chunk-8', sim: '0.915', text: 'Certs are injected as memory-backed tmpfs secrets into worker pods.' }
      ]
    },
    'sla': {
      answer: 'Per Section 9 of our Enterprise Service Level Agreement, if p99 latency exceeds <strong>500ms for more than 15 cumulative minutes</strong> within a billing cycle, the customer qualifies for an immediate <strong>15% credit refund</strong> on monthly infrastructure fees.',
      chunks: [
        { doc: 'legal/enterprise-sla-terms-2026.md #chunk-14', sim: '0.938', text: 'SLA Tier 1: p99 latency measured across Anycast POPs. Credit requests are processed within 10 business days.' },
        { doc: 'billing/credit-memo-automation.md #chunk-5', sim: '0.842', text: 'Automated credit memos are calculated by comparing Prometheus p99 vectors against contractual thresholds.' }
      ]
    }
  };

  const answerBody = document.getElementById('answer-body');
  const chunksList = document.getElementById('chunks-list');

  function renderQuery(key) {
    const data = queries[key];
    if (!data) return;
    if (answerBody) answerBody.innerHTML = data.answer;
    if (chunksList) {
      chunksList.innerHTML = data.chunks.map(c => 
        '<div class="chunk-item">' +
          '<div class="chunk-top">' +
            '<span class="chunk-doc">' + c.doc + '</span>' +
            '<span class="similarity-pill">Sim: ' + c.sim + '</span>' +
          '</div>' +
          '<div class="chunk-text">' + c.text + '</div>' +
        '</div>'
      ).join('');
    }
  }

  // Presets
  const qBtns = document.querySelectorAll('.q-btn');
  const queryInput = document.getElementById('query-input');

  qBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      qBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const text = btn.getAttribute('data-q');
      if (queryInput && text) queryInput.value = text;
      const keys = ['failover', 'mtls', 'sla'];
      renderQuery(keys[idx]);
      showToast('Executing vector hybrid search: ' + btn.textContent);
    });
  });

  document.getElementById('btn-search')?.addEventListener('click', () => {
    showToast('Neural search completed in 24ms across 482k vectors.');
  });

  renderQuery('failover');
})();
`
};
