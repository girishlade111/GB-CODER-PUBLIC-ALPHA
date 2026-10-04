// OmniDoc Enterprise Markdown Studio Template
// Split-pane live Markdown editor & HTML previewer with TOC generator, stats, and export

const html = `
<div class="md-app">
  <!-- Top Navigation -->
  <header class="md-header">
    <div class="md-brand">
      <div class="md-logo">M↓</div>
      <div>
        <div class="md-title">OmniDoc Markdown Studio</div>
        <div class="md-sub">Technical Documentation & Knowledge Base Authoring</div>
      </div>
    </div>

    <!-- Live Word & Reading Metrics -->
    <div class="md-stats">
      <div class="stat-pill"><span id="wordCount">342</span> words</div>
      <div class="stat-pill"><span id="charCount">2,180</span> chars</div>
      <div class="stat-pill"><span id="readTime">2</span> min read</div>
    </div>

    <!-- Actions -->
    <div class="md-actions">
      <button class="md-btn md-btn-outline" id="themeToggleBtn">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        Theme
      </button>
      <button class="md-btn md-btn-outline" id="copyHtmlBtn">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy HTML
      </button>
      <button class="md-btn md-btn-primary" id="downloadMdBtn">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export .md
      </button>
    </div>
  </header>

  <!-- Formatting Toolbar -->
  <div class="md-toolbar">
    <div class="tool-group">
      <button class="tool-btn" data-tool="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
      <button class="tool-btn" data-tool="italic" title="Italic (Ctrl+I)"><em>I</em></button>
      <button class="tool-btn" data-tool="strike" title="Strikethrough"><s>S</s></button>
    </div>
    <div class="tool-divider"></div>
    <div class="tool-group">
      <button class="tool-btn" data-tool="h1" title="Heading 1">H1</button>
      <button class="tool-btn" data-tool="h2" title="Heading 2">H2</button>
      <button class="tool-btn" data-tool="h3" title="Heading 3">H3</button>
    </div>
    <div class="tool-divider"></div>
    <div class="tool-group">
      <button class="tool-btn" data-tool="quote" title="Blockquote">“”</button>
      <button class="tool-btn" data-tool="code" title="Code Block">&lt;/&gt;</button>
      <button class="tool-btn" data-tool="link" title="Insert Link">🔗</button>
      <button class="tool-btn" data-tool="table" title="Insert Table">▦</button>
    </div>
  </div>

  <!-- Workspace: TOC + Editor + Preview -->
  <div class="md-workspace">
    <!-- Sidebar: Auto-Generated Table of Contents -->
    <aside class="md-toc-sidebar">
      <div class="toc-title">Table of Contents</div>
      <nav class="toc-nav" id="tocNav">
        <!-- Rendered by JS -->
      </nav>
    </aside>

    <!-- Center: Raw Editor -->
    <div class="md-pane md-editor-pane">
      <div class="pane-header">
        <span>MARKDOWN SOURCE</span>
        <span class="pane-hint">UTF-8 • GitHub Flavored</span>
      </div>
      <textarea id="mdInput" class="md-textarea" spellcheck="false"># Architecture & Distributed Consensus Guide

## 1. System Overview
OmniDoc utilizes a multi-leader Raft replication state machine designed for sub-10ms Byzantine fault-tolerant document synchronization across multi-region cloud edge nodes.

> **Important**: All mutations are serialized into a persistent write-ahead append-only log (WAL) prior to memory state application.

### Key Capabilities
- **Zero-Latency Read Replicas**: Reads are served locally from nearest geographic edge pop.
- **Optimistic Concurrency**: Vector clocks resolve concurrent paragraph-level merges.
- **Cryptographic Signatures**: Ed25519 signatures authenticate all state transitions.

## 2. API Schema Reference
Below is the standard JSON payload structure dispatched during webhook mutations:

\`\`\`json
{
  "event": "document.committed",
  "documentId": "doc_9941a82f",
  "revision": 412,
  "nodes": ["sfo-edge-01", "fra-edge-02", "nrt-edge-01"],
  "checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
\`\`\`

## 3. Performance Benchmarks
A comparison between OmniDoc Raft and traditional single-leader consensus:

| Cluster Region | Nodes | p50 Latency | p99 Latency | Quorum Health |
|---|---|---|---|---|
| North America (East) | 5 | 1.8 ms | 4.2 ms | 100% Stable |
| Western Europe | 7 | 2.1 ms | 5.8 ms | 100% Stable |
| Asia Pacific (Tokyo) | 5 | 3.4 ms | 7.9 ms | 100% Stable |

## 4. Disaster Recovery Protocol
In the event of a datacenter network partition, the remaining quorum elects a term leader within 150ms.
</textarea>
    </div>

    <!-- Right: HTML Preview -->
    <div class="md-pane md-preview-pane">
      <div class="pane-header">
        <span>LIVE DOCUMENT PREVIEW</span>
        <span class="pane-badge">Auto-rendered</span>
      </div>
      <div id="previewContent" class="markdown-body">
        <!-- Rendered preview HTML goes here -->
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
  background-color: #0d1117;
  color: #c9d1d9;
  min-height: 100vh;
}

.md-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.md-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  flex-shrink: 0;
}

.md-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.md-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 6px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.md-title {
  font-size: 15px;
  font-weight: 700;
  color: #f0f6fc;
}

.md-sub {
  font-size: 11px;
  color: #8b949e;
}

.md-stats {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .md-stats { display: none; }
}

.stat-pill {
  background: #21262d;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  color: #8b949e;
  border: 1px solid #30363d;
}

.stat-pill span {
  color: #58a6ff;
  font-weight: 700;
}

.md-actions {
  display: flex;
  gap: 10px;
}

.md-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.md-btn-outline {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.md-btn-outline:hover {
  background: #30363d;
  color: #f0f6fc;
}

.md-btn-primary {
  background: #238636;
  color: #ffffff;
  border: 1px solid rgba(240, 246, 252, 0.1);
}

.md-btn-primary:hover {
  background: #2ea043;
}

/* Toolbar */
.md-toolbar {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  background: #0d1117;
  border-bottom: 1px solid #30363d;
  gap: 6px;
  flex-shrink: 0;
}

.tool-group {
  display: flex;
  gap: 4px;
}

.tool-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  min-width: 28px;
}

.tool-btn:hover {
  background: #21262d;
  color: #58a6ff;
}

.tool-divider {
  width: 1px;
  height: 18px;
  background: #30363d;
  margin: 0 4px;
}

/* Workspace */
.md-workspace {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  flex: 1;
  overflow: hidden;
}

@media (max-width: 960px) {
  .md-workspace {
    grid-template-columns: 1fr 1fr;
  }
  .md-toc-sidebar {
    display: none;
  }
}

.md-toc-sidebar {
  background: #0d1117;
  border-right: 1px solid #30363d;
  padding: 16px;
  overflow-y: auto;
}

.toc-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8b949e;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.toc-link {
  display: block;
  font-size: 12px;
  color: #8b949e;
  text-decoration: none;
  padding: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s;
}

.toc-link:hover {
  color: #58a6ff;
}

.toc-link.h1-link { font-weight: 600; color: #c9d1d9; }
.toc-link.h2-link { padding-left: 10px; }
.toc-link.h3-link { padding-left: 20px; font-size: 11px; }

.md-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.md-editor-pane {
  border-right: 1px solid #30363d;
}

.pane-header {
  padding: 8px 16px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  font-size: 11px;
  font-weight: 700;
  color: #8b949e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pane-hint, .pane-badge {
  font-size: 10px;
  color: #58a6ff;
}

.md-textarea {
  flex: 1;
  background: #0d1117;
  color: #f0f6fc;
  border: none;
  outline: none;
  padding: 18px;
  font-family: 'SFMono-Regular', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}

.md-preview-pane {
  background: #0d1117;
}

.markdown-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  line-height: 1.6;
  color: #c9d1d9;
}

.markdown-body h1 {
  font-size: 24px;
  font-weight: 800;
  color: #f0f6fc;
  border-bottom: 1px solid #30363d;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.markdown-body h2 {
  font-size: 18px;
  font-weight: 700;
  color: #f0f6fc;
  margin-top: 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid #21262d;
  padding-bottom: 6px;
}

.markdown-body h3 {
  font-size: 15px;
  font-weight: 600;
  color: #58a6ff;
  margin-top: 18px;
  margin-bottom: 8px;
}

.markdown-body p {
  margin-bottom: 14px;
}

.markdown-body blockquote {
  border-left: 4px solid #58a6ff;
  padding: 8px 16px;
  background: rgba(56, 139, 253, 0.1);
  color: #8b949e;
  border-radius: 0 6px 6px 0;
  margin-bottom: 16px;
}

.markdown-body ul {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-body li {
  margin-bottom: 6px;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 13px;
}

.markdown-body th, .markdown-body td {
  border: 1px solid #30363d;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body th {
  background: #161b22;
  color: #f0f6fc;
  font-weight: 600;
}

.markdown-body pre {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 14px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, Monaco, monospace;
  font-size: 12px;
  margin-bottom: 16px;
  color: #e6edf3;
}

/* Light Theme */
.theme-light {
  background-color: #ffffff;
  color: #24292f;
}
.theme-light .md-header { background: #f6f8fa; border-color: #d0d7de; }
.theme-light .md-title { color: #24292f; }
.theme-light .md-toolbar { background: #ffffff; border-color: #d0d7de; }
.theme-light .md-workspace { background: #ffffff; }
.theme-light .md-toc-sidebar { background: #f6f8fa; border-color: #d0d7de; }
.theme-light .md-editor-pane { border-color: #d0d7de; }
.theme-light .pane-header { background: #f6f8fa; border-color: #d0d7de; color: #57606a; }
.theme-light .md-textarea { background: #ffffff; color: #24292f; }
.theme-light .markdown-body { color: #24292f; background: #ffffff; }
.theme-light .markdown-body h1, .theme-light .markdown-body h2 { color: #24292f; border-color: #d0d7de; }
.theme-light .markdown-body th { background: #f6f8fa; color: #24292f; }
.theme-light .markdown-body th, .theme-light .markdown-body td { border-color: #d0d7de; }
.theme-light .markdown-body pre { background: #f6f8fa; border-color: #d0d7de; color: #24292f; }
`;

const javascript = `
(function() {
  const textarea = document.getElementById('mdInput');
  const preview = document.getElementById('previewContent');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const readTime = document.getElementById('readTime');
  const tocNav = document.getElementById('tocNav');
  const copyBtn = document.getElementById('copyHtmlBtn');
  const downloadBtn = document.getElementById('downloadMdBtn');
  const themeBtn = document.getElementById('themeToggleBtn');

  // Simple Markdown parser
  function parseMarkdown(md) {
    let out = md;

    // Headers
    out = out.replace(/^# (.*$)/gim, '<h1 id="sec-$1">$1</h1>');
    out = out.replace(/^## (.*$)/gim, '<h2 id="sec-$1">$1</h2>');
    out = out.replace(/^### (.*$)/gim, '<h3 id="sec-$1">$1</h3>');

    // Blockquote
    out = out.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Code blocks
    out = out.replace(/\\\`\\\`\\\`([a-z]*)\\n([\\s\\S]*?)\\\`\\\`\\\`/gim, '<pre><code>$2</code></pre>');
    out = out.replace(/\\\`([^\\\`]+)\\\`/gim, '<code>$1</code>');

    // Bold & Italic
    out = out.replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>');
    out = out.replace(/\\*(.*?)\\*/gim, '<em>$1</em>');

    // Unordered lists
    out = out.replace(/^\\s*-\\s+(.*$)/gim, '<li>$1</li>');
    out = out.replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>');

    // Tables
    const lines = out.split('\\n');
    let inTable = false;
    let tableHtml = '';
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table>';
          const headers = line.split('|').filter(c => c.trim().length > 0);
          tableHtml += '<thead><tr>' + headers.map(h => '<th>' + h.trim() + '</th>').join('') + '</tr></thead><tbody>';
          i++; // skip separator line |---|---|
        } else {
          const cells = line.split('|').filter(c => c.trim().length > 0);
          tableHtml += '<tr>' + cells.map(c => '<td>' + c.trim() + '</td>').join('') + '</tr>';
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table>';
          newLines.push(tableHtml);
          inTable = false;
        }
        newLines.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table>';
      newLines.push(tableHtml);
    }
    out = newLines.join('\\n');

    // Paragraphs
    out = out.replace(/^([^<].+)$/gim, '<p>$1</p>');

    return out;
  }

  function render() {
    if (!textarea || !preview) return;
    const raw = textarea.value;
    const html = parseMarkdown(raw);
    preview.innerHTML = html;

    // Word stats
    const words = raw.trim().split(/\\s+/).filter(w => w.length > 0).length;
    const chars = raw.length;
    const minutes = Math.max(1, Math.round(words / 200));

    if (wordCount) wordCount.textContent = words.toLocaleString();
    if (charCount) charCount.textContent = chars.toLocaleString();
    if (readTime) readTime.textContent = minutes;

    // Build TOC
    if (tocNav) {
      tocNav.innerHTML = '';
      const headers = preview.querySelectorAll('h1, h2, h3');
      headers.forEach(h => {
        const link = document.createElement('a');
        link.className = 'toc-link ' + h.tagName.toLowerCase() + '-link';
        link.textContent = h.textContent;
        link.href = '#';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          h.scrollIntoView({ behavior: 'smooth' });
        });
        tocNav.appendChild(link);
      });
    }
  }

  if (textarea) {
    textarea.addEventListener('input', render);
    render();
  }

  // Formatting tools
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tool = this.getAttribute('data-tool');
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const selected = val.substring(start, end);

      let insert = '';
      if (tool === 'bold') insert = '**' + (selected || 'bold text') + '**';
      else if (tool === 'italic') insert = '*' + (selected || 'italic text') + '*';
      else if (tool === 'strike') insert = '~~' + (selected || 'strike text') + '~~';
      else if (tool === 'h1') insert = '\\n# ' + (selected || 'Heading 1') + '\\n';
      else if (tool === 'h2') insert = '\\n## ' + (selected || 'Heading 2') + '\\n';
      else if (tool === 'h3') insert = '\\n### ' + (selected || 'Heading 3') + '\\n';
      else if (tool === 'quote') insert = '\\n> ' + (selected || 'Quoted statement') + '\\n';
      else if (tool === 'code') insert = '\\n\`\`\`json\\n' + (selected || '{"key": "value"}') + '\\n\`\`\`\\n';
      else if (tool === 'link') insert = '[' + (selected || 'link title') + '](https://example.com)';
      else if (tool === 'table') insert = '\\n| Header 1 | Header 2 |\\n|---|---|\\n| Val 1 | Val 2 |\\n';

      textarea.value = val.substring(0, start) + insert + val.substring(end);
      textarea.focus();
      render();
    });
  });

  // Copy HTML
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!preview) return;
      navigator.clipboard.writeText(preview.innerHTML);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span style="color:#2ea043;font-weight:bold;">Copied HTML!</span>';
      setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
    });
  }

  // Download Markdown
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!textarea) return;
      const blob = new Blob([textarea.value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Theme Toggle
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-light');
    });
  }
})();
`;

export default { html, css, javascript };
