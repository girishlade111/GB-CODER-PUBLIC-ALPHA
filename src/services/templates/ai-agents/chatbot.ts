
export default {
  html: `
<div class="app-container">
  <aside class="sidebar">
    <div class="logo">✨ AI Agent</div>
    <button class="new-chat"><i class="icon">+</i> New Chat</button>
    <div class="history">
      <div class="history-item active">Website Redesign Ideas</div>
      <div class="history-item">Python Script Debugging</div>
      <div class="history-item">Marketing Copy for SaaS</div>
    </div>
  </aside>
  <main class="chat-area">
    <header class="chat-header">
      <h2>Website Redesign Ideas</h2>
      <div class="model-selector">GPT-4 Turbo</div>
    </header>
    <div class="messages">
      <div class="message user animate-fade-in-up">
        <div class="avatar"><img src="https://i.pravatar.cc/150?img=11" alt="User" /></div>
        <div class="bubble">I need some fresh ideas for redesigning our corporate website to make it look highly modern.</div>
      </div>
      <div class="message ai animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="avatar"><img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop" alt="AI" /></div>
        <div class="bubble">
          <p>Here are some highly modern design trends you can incorporate:</p>
          <ul>
            <li><strong>Glassmorphism:</strong> Frosted glass effects using background-blur.</li>
            <li><strong>Bento Grids:</strong> Organized, asymmetrical grid layouts for features.</li>
            <li><strong>Dark Mode Default:</strong> Sleek dark themes with neon/gradient accents.</li>
            <li><strong>Micro-interactions:</strong> Subtle hover states and scroll-triggered animations.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="input-area">
      <div class="input-wrapper hover-lift">
        <input type="text" placeholder="Send a message to AI..." />
        <button class="send-btn">➔</button>
      </div>
      <p class="disclaimer">AI can make mistakes. Consider verifying important information.</p>
    </div>
  </main>
</div>
  `,
  css: `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --secondary: #ec4899;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-400: #94a3b8;
  --gray-800: #1e293b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--dark);
  background-color: var(--light);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.3s ease;
}

.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-image: linear-gradient(to right, var(--primary), var(--secondary));
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.app-container { display: flex; height: 100vh; background: var(--dark); color: white; overflow: hidden; }
.sidebar { width: 280px; background: #09090b; border-right: 1px solid #27272a; display: flex; flex-direction: column; padding: 1.5rem; }
.logo { font-size: 1.25rem; font-weight: 700; margin-bottom: 2rem; background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.new-chat { background: #27272a; color: white; border: 1px solid #3f3f46; padding: 0.75rem; border-radius: 8px; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
.new-chat:hover { background: #3f3f46; }
.history-item { padding: 0.75rem; border-radius: 8px; color: #a1a1aa; font-size: 0.9rem; cursor: pointer; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-item:hover { background: #27272a; color: white; }
.history-item.active { background: #27272a; color: white; font-weight: 500; }

.chat-area { flex: 1; display: flex; flex-direction: column; background: #18181b; }
.chat-header { padding: 1.5rem 2rem; border-bottom: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center; }
.chat-header h2 { font-size: 1.1rem; font-weight: 600; }
.model-selector { background: #27272a; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.8rem; color: #a1a1aa; }

.messages { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; scroll-behavior: smooth; }
.message { display: flex; gap: 1rem; max-width: 800px; margin: 0 auto; width: 100%; }
.avatar img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.bubble { flex: 1; line-height: 1.6; }
.message.user .bubble { font-size: 1.1rem; }
.message.ai .bubble { color: #d4d4d8; }
.message.ai ul { margin-top: 1rem; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }

.input-area { padding: 2rem; background: linear-gradient(transparent, #18181b 50%); }
.input-wrapper { max-width: 800px; margin: 0 auto; position: relative; background: #27272a; border-radius: 12px; border: 1px solid #3f3f46; display: flex; align-items: center; padding: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
.input-wrapper input { flex: 1; background: transparent; border: none; color: white; padding: 1rem; font-size: 1rem; outline: none; font-family: inherit; }
.send-btn { background: white; color: black; width: 40px; height: 40px; border-radius: 8px; font-weight: bold; font-size: 1.2rem; }
.send-btn:hover { background: #d4d4d8; }
.disclaimer { text-align: center; color: #71717a; font-size: 0.75rem; margin-top: 1rem; }
  `,
  javascript: `console.log('AI Chatbot template loaded');`
};
