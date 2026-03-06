// AI Chatbot Template
export const html = `<!-- AI Chatbot Interface -->
<div class="chatbot-container">
  <!-- Sidebar -->
  <aside class="chatbot-sidebar" id="sidebar">
    <div class="sidebar-header">
      <h2>🤖 AI Assistant</h2>
      <button class="new-chat-btn" id="newChatBtn">+ New Chat</button>
    </div>
    <div class="chat-history" id="chatHistory">
      <div class="chat-session active">
        <span>📝</span>
        <span>Business Plan Discussion</span>
      </div>
      <div class="chat-session">
        <span>📝</span>
        <span>Code Review Help</span>
      </div>
      <div class="chat-session">
        <span>📝</span>
        <span>Marketing Strategy</span>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">👤</div>
        <div class="user-details">
          <div class="user-name">John Doe</div>
          <div class="user-plan">Pro Plan</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main Chat Area -->
  <main class="chat-main">
    <!-- Chat Header -->
    <header class="chat-header">
      <button class="menu-toggle" id="menuToggle">☰</button>
      <div class="chat-info">
        <h3>AI Business Assistant</h3>
        <p class="status">● Online</p>
      </div>
      <div class="chat-actions">
        <button class="action-btn" title="Settings">⚙️</button>
        <button class="action-btn" title="Export">📤</button>
      </div>
    </header>

    <!-- Messages Area -->
    <div class="messages-container" id="messagesContainer">
      <div class="message user-message">
        <div class="message-avatar">👤</div>
        <div class="message-content">
          <p>Help me create a business plan for a SaaS startup</p>
        </div>
      </div>

      <div class="message ai-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <p>I'd be happy to help you create a business plan for your SaaS startup! Let me outline the key components:</p>
          <div class="message-block">
            <h4>1. Executive Summary</h4>
            <ul>
              <li>Company overview and mission</li>
              <li>Problem statement</li>
              <li>Your solution</li>
              <li>Target market</li>
            </ul>
          </div>
          <div class="message-block">
            <h4>2. Product Description</h4>
            <ul>
              <li>Features and benefits</li>
              <li>Technology stack</li>
              <li>Unique value proposition</li>
            </ul>
          </div>
          <div class="message-block">
            <h4>3. Market Analysis</h4>
            <ul>
              <li>Target audience</li>
              <li>Market size</li>
              <li>Competitive landscape</li>
            </ul>
          </div>
          <p>Would you like me to elaborate on any of these sections?</p>
        </div>
        <div class="message-actions">
          <button class="action-btn-small" title="Copy">📋</button>
          <button class="action-btn-small" title="Like">👍</button>
          <button class="action-btn-small" title="Dislike">👎</button>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-container">
        <textarea 
          id="messageInput" 
          placeholder="Ask anything about your business..."
          rows="1"
        ></textarea>
        <button class="send-btn" id="sendBtn">
          <span>➤</span>
        </button>
      </div>
      <p class="disclaimer">AI can make mistakes. Verify important information.</p>
    </div>
  </main>
</div>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #8b5cf6;
  --primary-dark: #7c3aed;
  --secondary: #64748b;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray: #e2e8f0;
  --sidebar-width: 280px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--dark);
  color: white;
  height: 100vh;
  overflow: hidden;
}

.chatbot-container {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.chatbot-sidebar {
  width: var(--sidebar-width);
  background: #1e293b;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #334155;
  transition: transform 0.3s;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.new-chat-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.new-chat-btn:hover {
  background: var(--primary-dark);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.chat-session {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 0.5rem;
}

.chat-session:hover {
  background: #334155;
}

.chat-session.active {
  background: var(--primary);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #334155;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-plan {
  font-size: 0.75rem;
  color: var(--primary);
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--dark);
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.chat-info h3 {
  font-size: 1.125rem;
}

.status {
  font-size: 0.875rem;
  color: #22c55e;
}

.chat-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #334155;
  border: none;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.125rem;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #475569;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message {
  display: flex;
  gap: 1rem;
  max-width: 800px;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: var(--primary);
}

.ai-message .message-avatar {
  background: #22c55e;
}

.message-content {
  background: #1e293b;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  max-width: 600px;
}

.user-message .message-content {
  background: var(--primary);
}

.message-content p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.message-content p:last-child {
  margin-bottom: 0;
}

.message-block {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.message-block h4 {
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.message-block ul {
  margin-left: 1.5rem;
  line-height: 1.8;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.action-btn-small {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-btn-small:hover {
  background: #334155;
  color: white;
}

/* Input Area */
.input-area {
  padding: 1.5rem;
  background: #1e293b;
  border-top: 1px solid #334155;
}

.input-container {
  display: flex;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto 0.75rem;
}

#messageInput {
  flex: 1;
  background: #334155;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  max-height: 200px;
}

#messageInput:focus {
  outline: none;
  background: #475569;
}

.send-btn {
  background: var(--primary);
  border: none;
  border-radius: 12px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.send-btn:hover {
  background: var(--primary-dark);
}

.send-btn span {
  font-size: 1.25rem;
}

.disclaimer {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .chatbot-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .chatbot-sidebar.open {
    transform: translateX(0);
  }

  .menu-toggle {
    display: block;
  }

  .messages-container {
    padding: 1rem;
  }

  .message-content {
    max-width: 90%;
  }
}`;

export const javascript = `// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// New chat button
const newChatBtn = document.getElementById('newChatBtn');
newChatBtn.addEventListener('click', () => {
  const confirmed = confirm('Start a new chat? Current conversation will be saved.');
  if (confirmed) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    console.log('New chat started');
  }
});

// Chat session selection
document.querySelectorAll('.chat-session').forEach(session => {
  session.addEventListener('click', () => {
    document.querySelectorAll('.chat-session').forEach(s => s.classList.remove('active'));
    session.classList.add('active');
    // In real app, load the selected chat
  });
});

// Auto-resize textarea
const messageInput = document.getElementById('messageInput');
messageInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// Send message
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Add user message
  const userMessage = document.createElement('div');
  userMessage.className = 'message user-message';
  userMessage.innerHTML = \`
    <div class="message-avatar">👤</div>
    <div class="message-content">
      <p>\${escapeHtml(message)}</p>
    </div>
  \`;
  messagesContainer.appendChild(userMessage);

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Simulate AI response (in real app, call API)
  setTimeout(() => {
    const aiMessage = document.createElement('div');
    aiMessage.className = 'message ai-message';
    aiMessage.innerHTML = \`
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>Thank you for your message! This is a demo template. In a real application, this would connect to an AI API like Gemini, GPT-4, or Claude to provide intelligent responses.</p>
        <p>Would you like to know more about integrating AI into your application?</p>
      </div>
      <div class="message-actions">
        <button class="action-btn-small" title="Copy">📋</button>
        <button class="action-btn-small" title="Like">👍</button>
        <button class="action-btn-small" title="Dislike">👎</button>
      </div>
    \`;
    messagesContainer.appendChild(aiMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1000);
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Action buttons
document.addEventListener('click', (e) => {
  if (e.target.closest('.action-btn-small')) {
    const btn = e.target.closest('.action-btn-small');
    const action = btn.title;
    
    if (action === 'Copy') {
      const message = btn.closest('.message').querySelector('.message-content').textContent;
      navigator.clipboard.writeText(message);
      alert('Copied to clipboard!');
    } else if (action === 'Like' || action === 'Dislike') {
      // In real app, send feedback to API
      console.log('Feedback:', action);
    }
  }
});

// Settings and export buttons
document.querySelectorAll('.chat-actions .action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.title;
    if (action === 'Settings') {
      alert('Settings would open here');
    } else if (action === 'Export') {
      alert('Export chat functionality would open here');
    }
  });
});

console.log('AI Chatbot Template loaded successfully!');
`;

export default { html, css, javascript };
