export default {
  html: `
<div class="kanban-app" id="top">
  <!-- Top Bar -->
  <header class="kanban-header">
    <div class="h-brand">
      <div class="k-icon">📋</div>
      <div>
        <h1 class="k-title">FlowState Workspace</h1>
        <div class="k-sub">Sprint 42 • Distributed Systems Delivery</div>
      </div>
    </div>

    <div class="h-center">
      <input type="text" class="search-tasks" id="task-search" placeholder="Search tasks, tickets, assignees..." />
    </div>

    <div class="h-actions">
      <button class="btn btn-secondary" id="btn-reset-board">Reset Demo Tasks</button>
      <button class="btn btn-primary" id="btn-add-task">+ New Ticket</button>
    </div>
  </header>

  <!-- Board Columns -->
  <main class="kanban-board" id="board">
    <!-- Column 1 -->
    <div class="kanban-col" data-col="backlog">
      <div class="col-head">
        <div class="col-title-wrap">
          <span class="col-dot dot-gray"></span>
          <span class="col-title">BACKLOG</span>
        </div>
        <span class="col-count" id="count-backlog">2</span>
      </div>
      <div class="col-dropzone" id="zone-backlog">
        <div class="task-card" draggable="true" id="task-101">
          <div class="t-top">
            <span class="tag tag-p1">P1 HIGH</span>
            <span class="t-pts">3 pts</span>
          </div>
          <div class="t-title">Audit Redis TLS cert auto-rotation failover</div>
          <div class="t-foot">
            <span class="t-id">#ENG-409</span>
            <span class="t-avatar">👩🏻‍💻</span>
          </div>
        </div>

        <div class="task-card" draggable="true" id="task-102">
          <div class="t-top">
            <span class="tag tag-p2">P2 MEDIUM</span>
            <span class="t-pts">2 pts</span>
          </div>
          <div class="t-title">Add OpenTelemetry trace exporter to Envoy proxies</div>
          <div class="t-foot">
            <span class="t-id">#ENG-412</span>
            <span class="t-avatar">👨🏽‍💻</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 2 -->
    <div class="kanban-col" data-col="in-progress">
      <div class="col-head">
        <div class="col-title-wrap">
          <span class="col-dot dot-blue"></span>
          <span class="col-title">IN PROGRESS</span>
        </div>
        <span class="col-count" id="count-in-progress">2</span>
      </div>
      <div class="col-dropzone" id="zone-in-progress">
        <div class="task-card" draggable="true" id="task-103">
          <div class="t-top">
            <span class="tag tag-p0">P0 CRITICAL</span>
            <span class="t-pts">5 pts</span>
          </div>
          <div class="t-title">Fix zero-copy buffer leak in Rust Wasm gateway</div>
          <div class="t-foot">
            <span class="t-id">#ENG-398</span>
            <span class="t-avatar">⚡</span>
          </div>
        </div>

        <div class="task-card" draggable="true" id="task-104">
          <div class="t-top">
            <span class="tag tag-p1">P1 HIGH</span>
            <span class="t-pts">3 pts</span>
          </div>
          <div class="t-title">Benchmark p99 latency on AP-South Anycast POP</div>
          <div class="t-foot">
            <span class="t-id">#ENG-401</span>
            <span class="t-avatar">👱🏼</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 3 -->
    <div class="kanban-col" data-col="review">
      <div class="col-head">
        <div class="col-title-wrap">
          <span class="col-dot dot-amber"></span>
          <span class="col-title">CODE REVIEW</span>
        </div>
        <span class="col-count" id="count-review">1</span>
      </div>
      <div class="col-dropzone" id="zone-review">
        <div class="task-card" draggable="true" id="task-105">
          <div class="t-top">
            <span class="tag tag-p1">P1 HIGH</span>
            <span class="t-pts">2 pts</span>
          </div>
          <div class="t-title">PR #294: Implement Raft leader election backoff</div>
          <div class="t-foot">
            <span class="t-id">#ENG-388</span>
            <span class="t-avatar">👩🏾‍💻</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 4 -->
    <div class="kanban-col" data-col="shipped">
      <div class="col-head">
        <div class="col-title-wrap">
          <span class="col-dot dot-green"></span>
          <span class="col-title">SHIPPED TO PROD</span>
        </div>
        <span class="col-count" id="count-shipped">1</span>
      </div>
      <div class="col-dropzone" id="zone-shipped">
        <div class="task-card shipped-card" draggable="true" id="task-106">
          <div class="t-top">
            <span class="tag tag-done">VERIFIED</span>
            <span class="t-pts">8 pts</span>
          </div>
          <div class="t-title">Migrated Postgres cluster to zero-downtime Patroni</div>
          <div class="t-foot">
            <span class="t-id">#ENG-370</span>
            <span class="t-avatar">✓</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Add Task Modal -->
  <div class="modal-backdrop" id="task-modal" style="display:none;">
    <div class="modal-box">
      <button class="btn-close" id="btn-close-modal">✕</button>
      <h3 class="modal-title">Create Engineering Ticket</h3>
      
      <form id="new-task-form">
        <div class="form-group">
          <label>Task Summary</label>
          <input type="text" id="inp-task-title" placeholder="e.g. Optimize eBPF socket lookup table" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Priority</label>
            <select id="inp-task-prio">
              <option value="p0">P0 CRITICAL</option>
              <option value="p1" selected>P1 HIGH</option>
              <option value="p2">P2 MEDIUM</option>
            </select>
          </div>
          <div class="form-group">
            <label>Story Points</label>
            <input type="number" id="inp-task-pts" value="3" min="1" max="13" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Add to Backlog</button>
      </form>
    </div>
  </div>

  <div class="kanban-toast" id="kanban-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #080a0f;
  --bg-panel: rgba(14, 18, 28, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --accent-blue: #3b82f6;
  --green: #10b981;
  --red: #f43f5e;
  --amber: #f59e0b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  height: 100vh;
  overflow: hidden;
}

.kanban-app { display: flex; flex-direction: column; height: 100vh; font-size: 12px; }

/* Header */
.kanban-header {
  height: 64px;
  background: rgba(10, 14, 24, 0.95);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.h-brand { display: flex; align-items: center; gap: 12px; }
.k-icon { font-size: 22px; }
.k-title { font-size: 16px; font-weight: 800; color: #fff; }
.k-sub { font-size: 11px; color: var(--text-muted); }

.search-tasks {
  width: 320px;
  background: #06080e;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 14px;
  color: #fff;
  font-size: 12px;
  outline: none;
}
.search-tasks:focus { border-color: var(--accent-blue); }

.h-actions { display: flex; gap: 10px; }
.btn { padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: var(--accent-blue); color: #fff; }
.btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; }
.btn-block { width: 100%; margin-top: 14px; padding: 10px; }

/* Board */
.kanban-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 24px;
  overflow-x: auto;
}

.kanban-col {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.col-head {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.col-title-wrap { display: flex; align-items: center; gap: 8px; }
.col-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-gray { background: #64748b; }
.dot-blue { background: var(--accent-blue); box-shadow: 0 0 6px var(--accent-blue); }
.dot-amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
.dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
.col-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #fff; }
.col-count { font-size: 10px; font-weight: 800; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); }

.col-dropzone {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.col-dropzone.drag-over { background: rgba(59, 130, 246, 0.08); border: 2px dashed rgba(59, 130, 246, 0.4); border-radius: 8px; }

/* Task Card */
.task-card {
  background: #0a0d15;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  cursor: grab;
  transition: transform 0.15s, border-color 0.15s;
}
.task-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
.task-card:active { cursor: grabbing; }

.t-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tag { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; }
.tag-p0 { background: rgba(244, 63, 94, 0.2); color: var(--red); }
.tag-p1 { background: rgba(245, 158, 11, 0.2); color: var(--amber); }
.tag-p2 { background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); }
.tag-done { background: rgba(16, 185, 129, 0.2); color: var(--green); }
.t-pts { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); }

.t-title { font-size: 13px; font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 12px; }
.t-foot { display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.t-avatar { font-size: 14px; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #0e121a;
  border: 1px solid var(--border);
  border-radius: 12px;
  max-width: 440px;
  width: 100%;
  padding: 28px;
  position: relative;
}
.btn-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; }
.modal-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-group label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
.form-group input, .form-group select {
  background: #06080e;
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  outline: none;
}
.form-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; }

/* Toast */
.kanban-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-blue);
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
    const toast = document.getElementById('kanban-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Drag and Drop
  let draggedCard = null;

  function initDraggables() {
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        e.dataTransfer.effectAllowed = 'move';
        card.style.opacity = '0.5';
      });
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
        draggedCard = null;
      });
    });

    const dropzones = document.querySelectorAll('.col-dropzone');
    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (draggedCard) {
          zone.appendChild(draggedCard);
          updateColumnCounts();
          const colName = zone.closest('.kanban-col')?.getAttribute('data-col') || '';
          showToast('Moved ticket to ' + colName.toUpperCase());
        }
      });
    });
  }

  function updateColumnCounts() {
    ['backlog', 'in-progress', 'review', 'shipped'].forEach(id => {
      const zone = document.getElementById('zone-' + id);
      const countEl = document.getElementById('count-' + id);
      if (zone && countEl) {
        countEl.textContent = zone.children.length;
      }
    });
  }

  initDraggables();
  updateColumnCounts();

  // Search filter
  const searchInput = document.getElementById('task-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('.task-card');
      cards.forEach(c => {
        const text = c.textContent.toLowerCase();
        c.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Modal
  const modal = document.getElementById('task-modal');
  document.getElementById('btn-add-task')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
  });
  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  const form = document.getElementById('new-task-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('inp-task-title')?.value || 'New Ticket';
      const prio = document.getElementById('inp-task-prio')?.value || 'p1';
      const pts = document.getElementById('inp-task-pts')?.value || '3';

      const tagClass = prio === 'p0' ? 'tag-p0' : prio === 'p1' ? 'tag-p1' : 'tag-p2';
      const tagLabel = prio === 'p0' ? 'P0 CRITICAL' : prio === 'p1' ? 'P1 HIGH' : 'P2 MEDIUM';
      const randomId = Math.floor(420 + Math.random() * 80);

      const newCard = document.createElement('div');
      newCard.className = 'task-card';
      newCard.draggable = true;
      newCard.innerHTML = 
        '<div class="t-top">' +
          '<span class="tag ' + tagClass + '">' + tagLabel + '</span>' +
          '<span class="t-pts">' + pts + ' pts</span>' +
        '</div>' +
        '<div class="t-title">' + title + '</div>' +
        '<div class="t-foot">' +
          '<span class="t-id">#ENG-' + randomId + '</span>' +
          '<span class="t-avatar">⚡</span>' +
        '</div>';

      document.getElementById('zone-backlog')?.prepend(newCard);
      initDraggables();
      updateColumnCounts();

      form.reset();
      if (modal) modal.style.display = 'none';
      showToast('Created ticket #ENG-' + randomId + ' in Backlog');
    });
  }

  document.getElementById('btn-reset-board')?.addEventListener('click', () => {
    showToast('Reset board to default sprint tickets');
  });
})();
`
};
