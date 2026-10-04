export default {
  html: `
<div class="devpulse-app">
  <!-- Header -->
  <header class="devpulse-header">
    <div class="header-brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>
      <div>
        <h1 class="brand-title">DevPulse Studio</h1>
        <div class="brand-sub">Universal Developer Toolkit & Security Inspector</div>
      </div>
    </div>

    <div class="header-tools-nav" id="tools-nav">
      <button class="tool-tab active" data-tool="jwt">JWT Inspector</button>
      <button class="tool-tab" data-tool="regex">Regex Studio</button>
      <button class="tool-tab" data-tool="json">JSON / YAML</button>
      <button class="tool-tab" data-tool="uuid">UUID & Secret Gen</button>
      <button class="tool-tab" data-tool="base64">Base64 & URL</button>
    </div>

    <div class="header-actions">
      <span class="offline-badge">⚡ Client-Side Only (Zero Leak)</span>
    </div>
  </header>

  <!-- Main Active Tool Container -->
  <main class="devpulse-main" id="tool-container">
    <!-- Populated by JavaScript according to active tool -->
  </main>

  <div class="devpulse-toast" id="devpulse-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #0a0d14;
  --bg-panel: rgba(16, 22, 34, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-rose: #f43f5e;
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

.devpulse-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Header */
.devpulse-header {
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
.header-brand { display: flex; align-items: center; gap: 12px; }
.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.brand-icon svg { width: 18px; height: 18px; }
.brand-title { font-size: 16px; font-weight: 800; color: #fff; }
.brand-sub { font-size: 11px; color: var(--text-muted); }

.header-tools-nav { display: flex; gap: 6px; }
.tool-tab {
  background: none;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.tool-tab:hover { color: #fff; background: rgba(255, 255, 255, 0.04); }
.tool-tab.active {
  color: #fff;
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.3);
}

.offline-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-emerald);
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Main Area */
.devpulse-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.tool-view {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card panels */
.tool-card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(12px);
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.card-title { font-size: 14px; font-weight: 800; color: #fff; }

/* Form controls */
textarea.code-area {
  width: 100%;
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}
textarea.code-area:focus { border-color: var(--accent-cyan); }

input.text-input {
  width: 100%;
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
}
input.text-input:focus { border-color: var(--accent-cyan); }

.btn-action {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-action:hover { background: rgba(255, 255, 255, 0.12); }
.btn-primary-action {
  background: var(--accent-cyan);
  color: #000;
  font-weight: 800;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

/* JWT grid */
.jwt-output-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 16px;
}
.json-display {
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #38bdf8;
  white-space: pre-wrap;
  min-height: 140px;
}

/* Regex */
.regex-flags { display: flex; gap: 10px; align-items: center; font-size: 12px; color: var(--text-muted); }
.regex-matches-box {
  background: #080b11;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  min-height: 90px;
}
.match-highlight { background: rgba(6, 182, 212, 0.35); color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: 700; }

/* Toast */
.devpulse-toast {
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('devpulse-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  const container = document.getElementById('tool-container');

  // Tool 1: JWT Inspector
  function renderJwtTool() {
    if (!container) return;
    const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + 
      "eyJzdWIiOiJ1c3JfMGExMmY4OTQiLCJuYW1lIjoiQWxleCBDaGVuIiwiZW1haWwiOiJhbGV4QGFlcGV4LmlvIiwicm9sZSI6InBsYXRmb3JtX2xlYWQiLCJpYXQiOjE3Mzg2MjAwMDAsImV4cCI6MTc3MDE1NjAwMH0." + 
      "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

    container.innerHTML = 
      '<div class="tool-view">' +
        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">Paste Encoded JWT Token</span>' +
            '<button class="btn-action" id="btn-load-sample-jwt">Load Sample Token</button>' +
          '</div>' +
          '<textarea class="code-area" id="jwt-input" rows="4">' + sampleJwt + '</textarea>' +
        '</div>' +

        '<div class="jwt-output-grid">' +
          '<div class="tool-card">' +
            '<div class="card-title-row">' +
              '<span class="card-title">Decoded Header</span>' +
              '<button class="btn-action" onclick="copyTextById(\\'jwt-header-box\\')">Copy</button>' +
            '</div>' +
            '<div class="json-display" id="jwt-header-box"></div>' +
          '</div>' +

          '<div class="tool-card">' +
            '<div class="card-title-row">' +
              '<span class="card-title">Decoded Payload Claims</span>' +
              '<button class="btn-action" onclick="copyTextById(\\'jwt-payload-box\\')">Copy</button>' +
            '</div>' +
            '<div class="json-display" id="jwt-payload-box"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function parseJwt(token) {
      try {
        const parts = token.trim().split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format (expected 3 dot-separated parts)');
        }
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return { header, payload };
      } catch (e) {
        return null;
      }
    }

    function updateJwtDisplay() {
      const input = document.getElementById('jwt-input');
      const headerBox = document.getElementById('jwt-header-box');
      const payloadBox = document.getElementById('jwt-payload-box');
      if (!input || !headerBox || !payloadBox) return;

      const result = parseJwt(input.value);
      if (result) {
        headerBox.textContent = JSON.stringify(result.header, null, 2);
        payloadBox.textContent = JSON.stringify(result.payload, null, 2);
      } else {
        headerBox.textContent = '// Error decoding token';
        payloadBox.textContent = '// Invalid base64 or JSON payload structure';
      }
    }

    const input = document.getElementById('jwt-input');
    if (input) input.addEventListener('input', updateJwtDisplay);

    const btnSample = document.getElementById('btn-load-sample-jwt');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        if (input) input.value = sampleJwt;
        updateJwtDisplay();
        showToast('Loaded sample JWT');
      });
    }

    updateJwtDisplay();
  }

  // Tool 2: Regex Studio
  function renderRegexTool() {
    if (!container) return;
    container.innerHTML = 
      '<div class="tool-view">' +
        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">Regular Expression & Flags</span>' +
            '<div class="regex-flags">' +
              '<label><input type="checkbox" id="re-g" checked> global (g)</label>' +
              '<label><input type="checkbox" id="re-i" checked> ignore-case (i)</label>' +
              '<label><input type="checkbox" id="re-m"> multiline (m)</label>' +
            '</div>' +
          '</div>' +
          '<input type="text" class="text-input" id="regex-pattern" value="\\\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Z|a-z]{2,}\\\\b" placeholder="Enter regular expression pattern..." />' +
        '</div>' +

        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">Test Corpus String</span>' +
            '<span style="font-size:11px; color:#38bdf8;" id="regex-count">Matches: 0</span>' +
          '</div>' +
          '<textarea class="code-area" id="regex-corpus" rows="5">Send inquiries to engineering@apex-cloud.io or alex.chen@fintech.co for API credentials.</textarea>' +
        '</div>' +

        '<div class="tool-card">' +
          '<span class="card-title" style="display:block; margin-bottom:12px;">Live Highlighted Matches</span>' +
          '<div class="regex-matches-box" id="regex-highlight-box"></div>' +
        '</div>' +
      '</div>';

    function evaluateRegex() {
      const patternInput = document.getElementById('regex-pattern');
      const corpusInput = document.getElementById('regex-corpus');
      const box = document.getElementById('regex-highlight-box');
      const countEl = document.getElementById('regex-count');
      if (!patternInput || !corpusInput || !box) return;

      const g = document.getElementById('re-g')?.checked ? 'g' : '';
      const i = document.getElementById('re-i')?.checked ? 'i' : '';
      const m = document.getElementById('re-m')?.checked ? 'm' : '';
      const flags = g + i + m;

      try {
        const regex = new RegExp(patternInput.value, flags);
        const text = corpusInput.value;
        const matches = text.match(regex) || [];
        if (countEl) countEl.textContent = 'Matches: ' + matches.length;

        // Escape HTML
        const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeRegex = new RegExp(patternInput.value, flags);
        const highlighted = safeText.replace(safeRegex, (match) => {
          return '<span class="match-highlight">' + match + '</span>';
        });
        box.innerHTML = highlighted;
      } catch (err) {
        if (countEl) countEl.textContent = 'Syntax Error';
        box.textContent = 'Invalid Regular Expression: ' + err.message;
      }
    }

    ['regex-pattern', 'regex-corpus', 're-g', 're-i', 're-m'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', evaluateRegex);
      document.getElementById(id)?.addEventListener('change', evaluateRegex);
    });

    evaluateRegex();
  }

  // Tool 3: JSON Formatter
  function renderJsonTool() {
    if (!container) return;
    const sample = '{"service":"apex-auth","status":"healthy","metrics":{"p99_latency_ms":1.8,"replicas":32,"uptime_percent":99.999},"tags":["production","us-east-1"]}';
    container.innerHTML = 
      '<div class="tool-view">' +
        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">JSON Formatter & Minifier</span>' +
            '<div style="display:flex; gap:8px;">' +
              '<button class="btn-action" id="btn-format-json">Format (2 Spaces)</button>' +
              '<button class="btn-action" id="btn-minify-json">Minify</button>' +
              '<button class="btn-action" onclick="copyTextById(\\'json-area\\')">Copy</button>' +
            '</div>' +
          '</div>' +
          '<textarea class="code-area" id="json-area" rows="12">' + sample + '</textarea>' +
        '</div>' +
      '</div>';

    const area = document.getElementById('json-area');
    document.getElementById('btn-format-json')?.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(area.value);
        area.value = JSON.stringify(parsed, null, 2);
        showToast('JSON beautified with 2-space indentation');
      } catch (e) {
        showToast('Invalid JSON: ' + e.message);
      }
    });

    document.getElementById('btn-minify-json')?.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(area.value);
        area.value = JSON.stringify(parsed);
        showToast('JSON minified');
      } catch (e) {
        showToast('Invalid JSON: ' + e.message);
      }
    });
  }

  // Tool 4: UUID & Secret Gen
  function renderUuidTool() {
    if (!container) return;
    container.innerHTML = 
      '<div class="tool-view">' +
        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">Cryptographic Secret & UUID Generator</span>' +
            '<button class="btn-primary-action" id="btn-gen-all">Generate Fresh Batch</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:16px;">' +
            '<div>' +
              '<span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">UUID v4:</span>' +
              '<div style="display:flex; gap:8px;"><input type="text" class="text-input" id="out-uuid" readonly /><button class="btn-action" onclick="copyInput(\\'out-uuid\\')">Copy</button></div>' +
            '</div>' +
            '<div>' +
              '<span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">NanoID (URL-Friendly 21 chars):</span>' +
              '<div style="display:flex; gap:8px;"><input type="text" class="text-input" id="out-nano" readonly /><button class="btn-action" onclick="copyInput(\\'out-nano\\')">Copy</button></div>' +
            '</div>' +
            '<div>' +
              '<span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">256-bit HMAC / API Key (Hex):</span>' +
              '<div style="display:flex; gap:8px;"><input type="text" class="text-input" id="out-hex" readonly /><button class="btn-action" onclick="copyInput(\\'out-hex\\')">Copy</button></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function generate() {
      // UUID
      const u = crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      document.getElementById('out-uuid').value = u;

      // NanoID
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';
      let nano = '';
      const bytes = crypto.getRandomValues(new Uint8Array(21));
      for (let i = 0; i < 21; i++) {
        nano += chars[bytes[i] % chars.length];
      }
      document.getElementById('out-nano').value = nano;

      // Hex Secret
      const hexBytes = crypto.getRandomValues(new Uint8Array(32));
      let hex = '';
      for (let b of hexBytes) hex += b.toString(16).padStart(2, '0');
      document.getElementById('out-hex').value = hex;
    }

    document.getElementById('btn-gen-all')?.addEventListener('click', () => {
      generate();
      showToast('Generated fresh keys');
    });

    generate();
  }

  // Tool 5: Base64
  function renderBase64Tool() {
    if (!container) return;
    container.innerHTML = 
      '<div class="tool-view">' +
        '<div class="tool-card">' +
          '<div class="card-title-row">' +
            '<span class="card-title">Base64 & URL Encoder / Decoder</span>' +
            '<div style="display:flex; gap:8px;">' +
              '<button class="btn-action" id="btn-b64-encode">Base64 Encode</button>' +
              '<button class="btn-action" id="btn-b64-decode">Base64 Decode</button>' +
              '<button class="btn-action" id="btn-url-encode">URL Encode</button>' +
              '<button class="btn-action" id="btn-url-decode">URL Decode</button>' +
            '</div>' +
          '</div>' +
          '<textarea class="code-area" id="b64-area" rows="8">Hello World! Apex Cloud Infrastructure 2026</textarea>' +
        '</div>' +
      '</div>';

    const area = document.getElementById('b64-area');
    document.getElementById('btn-b64-encode')?.addEventListener('click', () => {
      try { area.value = btoa(area.value); showToast('Encoded to Base64'); } catch(e) { showToast(e.message); }
    });
    document.getElementById('btn-b64-decode')?.addEventListener('click', () => {
      try { area.value = atob(area.value); showToast('Decoded Base64'); } catch(e) { showToast('Invalid Base64'); }
    });
    document.getElementById('btn-url-encode')?.addEventListener('click', () => {
      area.value = encodeURIComponent(area.value); showToast('URL Encoded');
    });
    document.getElementById('btn-url-decode')?.addEventListener('click', () => {
      area.value = decodeURIComponent(area.value); showToast('URL Decoded');
    });
  }

  // Global helpers
  window.copyTextById = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard?.writeText(el.textContent || el.value);
    showToast('Copied to clipboard');
  };

  window.copyInput = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard?.writeText(el.value);
    showToast('Copied to clipboard: ' + el.value);
  };

  // Switcher
  const toolTabs = document.querySelectorAll('.tool-tab');
  const toolRenderers = {
    jwt: renderJwtTool,
    regex: renderRegexTool,
    json: renderJsonTool,
    uuid: renderUuidTool,
    base64: renderBase64Tool
  };

  toolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      toolTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const toolKey = tab.getAttribute('data-tool');
      if (toolRenderers[toolKey]) {
        toolRenderers[toolKey]();
      }
    });
  });

  // Default active
  renderJwtTool();
})();
`
};
