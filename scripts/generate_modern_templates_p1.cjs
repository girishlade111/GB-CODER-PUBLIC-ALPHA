const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'services', 'templates');

function createFile(filepath, content) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content);
}

// Reusable Modern CSS Reset and Variables
const baseCSS = `
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
`;

// ==========================================
// 1. UPDATING EXISTING TEMPLATES (Modernized)
// ==========================================

// Business Corporate (Modern)
createFile(path.join(templatesDir, 'business', 'corporate.ts'), `
export default {
  html: \`
<nav class="navbar">
  <div class="logo">Nexus<span>Corp</span></div>
  <div class="links">
    <a href="#">Services</a>
    <a href="#">About</a>
    <a href="#" class="btn-outline">Contact Us</a>
  </div>
</nav>
<header class="hero">
  <div class="hero-content animate-fade-in-up">
    <h1>Innovating the <span class="gradient-text">Future of Business</span></h1>
    <p>We provide enterprise-grade solutions for scaling companies worldwide.</p>
    <div class="hero-buttons">
      <button class="btn-primary">Get Started</button>
      <button class="btn-secondary">Our Portfolio</button>
    </div>
  </div>
  <div class="hero-image animate-fade-in-up" style="animation-delay: 0.2s">
    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop" alt="Corporate Office" />
  </div>
</header>
<section class="features">
  <div class="feature-card hover-lift">
    <div class="icon">📈</div>
    <h3>Growth Strategy</h3>
    <p>Data-driven insights to scale your operations rapidly.</p>
  </div>
  <div class="feature-card hover-lift">
    <div class="icon">🔒</div>
    <h3>Enterprise Security</h3>
    <p>Bank-grade protection for your sensitive data.</p>
  </div>
  <div class="feature-card hover-lift">
    <div class="icon">⚡</div>
    <h3>Agile Workflows</h3>
    <p>Streamline your processes for maximum efficiency.</p>
  </div>
</section>
  \`,
  css: \`
${baseCSS}
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; background: white; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 100; }
.logo { font-size: 1.5rem; font-weight: 700; color: var(--dark); }
.logo span { color: var(--primary); }
.links { display: flex; gap: 2rem; align-items: center; font-weight: 500; }
.links a:hover { color: var(--primary); }
.btn-outline { border: 2px solid var(--primary); padding: 0.5rem 1.5rem; border-radius: 50px; color: var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }

.hero { display: flex; align-items: center; justify-content: space-between; padding: 6rem 5%; gap: 4rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 80vh; overflow: hidden; }
.hero-content { flex: 1; max-width: 600px; }
.hero h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800; letter-spacing: -1px; }
.hero p { font-size: 1.25rem; color: var(--gray-400); margin-bottom: 2rem; }
.hero-buttons { display: flex; gap: 1rem; }
.btn-primary { background: var(--primary); color: white; padding: 1rem 2.5rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; box-shadow: var(--shadow-md); }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.btn-secondary { background: white; color: var(--dark); padding: 1rem 2.5rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; box-shadow: var(--shadow-sm); }
.btn-secondary:hover { box-shadow: var(--shadow-md); }

.hero-image { flex: 1; position: relative; }
.hero-image img { width: 100%; border-radius: 20px; box-shadow: var(--shadow-xl); transform: perspective(1000px) rotateY(-5deg); transition: transform 0.5s ease; }
.hero-image img:hover { transform: perspective(1000px) rotateY(0deg); }

.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; padding: 5rem 5%; background: white; }
.feature-card { padding: 2.5rem; background: var(--light); border-radius: 16px; text-align: left; border: 1px solid var(--gray-200); }
.feature-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
.feature-card h3 { font-size: 1.5rem; margin-bottom: 1rem; font-weight: 700; }
.feature-card p { color: var(--gray-400); line-height: 1.7; }
  \`,
  javascript: \`console.log('Corporate template loaded with animations!');\`
};
`);

// 2. AI Chatbot (Modern)
createFile(path.join(templatesDir, 'ai-agents', 'chatbot.ts'), `
export default {
  html: \`
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
  \`,
  css: \`
${baseCSS}
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
  \`,
  javascript: \`console.log('AI Chatbot template loaded');\`
};
`);

// 3. SaaS Dashboard (Modern)
createFile(path.join(templatesDir, 'saas', 'dashboard.ts'), `
export default {
  html: \`
<div class="dashboard">
  <aside class="sidebar">
    <div class="logo">SaaS<span class="gradient-text">Flow</span></div>
    <nav class="nav-menu">
      <a href="#" class="active">📊 Overview</a>
      <a href="#">👥 Customers</a>
      <a href="#">💳 Billing</a>
      <a href="#">⚙️ Settings</a>
    </nav>
  </aside>
  <main class="main-content">
    <header class="topbar">
      <h2>Welcome back, Alex!</h2>
      <div class="profile">
        <img src="https://i.pravatar.cc/150?img=33" alt="Profile" />
      </div>
    </header>
    <div class="stats-grid">
      <div class="stat-card hover-lift animate-fade-in-up">
        <div class="stat-title">Total Revenue</div>
        <div class="stat-value">$124,500</div>
        <div class="stat-trend positive">↑ +14.5%</div>
      </div>
      <div class="stat-card hover-lift animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="stat-title">Active Users</div>
        <div class="stat-value">1,432</div>
        <div class="stat-trend positive">↑ +5.2%</div>
      </div>
      <div class="stat-card hover-lift animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="stat-title">Churn Rate</div>
        <div class="stat-value">2.4%</div>
        <div class="stat-trend negative">↓ -0.8%</div>
      </div>
    </div>
    <div class="charts-section animate-fade-in-up" style="animation-delay: 0.3s">
      <div class="chart-card">
        <h3>Revenue Growth</h3>
        <div class="mock-chart">
           <div class="bar" style="height: 40%"></div>
           <div class="bar" style="height: 60%"></div>
           <div class="bar" style="height: 50%"></div>
           <div class="bar" style="height: 80%"></div>
           <div class="bar" style="height: 70%"></div>
           <div class="bar" style="height: 100%"></div>
        </div>
      </div>
      <div class="recent-activity">
        <h3>Recent Signups</h3>
        <ul class="activity-list">
          <li><img src="https://i.pravatar.cc/150?img=1" /> <div><b>Jane Doe</b> subscribed to Pro</div></li>
          <li><img src="https://i.pravatar.cc/150?img=2" /> <div><b>John Smith</b> subscribed to Basic</div></li>
          <li><img src="https://i.pravatar.cc/150?img=3" /> <div><b>Acme Corp</b> upgraded to Enterprise</div></li>
        </ul>
      </div>
    </div>
  </main>
</div>
  \`,
  css: \`
${baseCSS}
body { background: #f1f5f9; }
.dashboard { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 260px; background: white; border-right: 1px solid var(--gray-200); padding: 2rem 1.5rem; display: flex; flex-direction: column; }
.logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 3rem; }
.nav-menu { display: flex; flex-direction: column; gap: 0.5rem; }
.nav-menu a { padding: 0.75rem 1rem; border-radius: 8px; color: var(--gray-400); font-weight: 500; display: flex; align-items: center; gap: 0.75rem; }
.nav-menu a:hover { background: var(--gray-100); color: var(--dark); }
.nav-menu a.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }

.main-content { flex: 1; padding: 2rem 3rem; overflow-y: auto; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.topbar h2 { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.5px; }
.profile img { width: 48px; height: 48px; border-radius: 50%; box-shadow: var(--shadow-md); border: 2px solid white; cursor: pointer; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(0,0,0,0.05); }
.stat-title { color: var(--gray-400); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }
.stat-value { font-size: 2.2rem; font-weight: 700; color: var(--dark); margin-bottom: 0.5rem; }
.stat-trend { font-size: 0.9rem; font-weight: 600; }
.stat-trend.positive { color: #10b981; }
.stat-trend.negative { color: #ef4444; }

.charts-section { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
.chart-card, .recent-activity { background: white; padding: 2rem; border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(0,0,0,0.05); }
h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 1.5rem; }

.mock-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 250px; padding-top: 2rem; gap: 10px; }
.mock-chart .bar { flex: 1; background: linear-gradient(to top, var(--primary), #818cf8); border-radius: 6px 6px 0 0; transition: height 1s ease; cursor: pointer; }
.mock-chart .bar:hover { filter: brightness(1.1); }

.activity-list { list-style: none; display: flex; flex-direction: column; gap: 1.5rem; }
.activity-list li { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; }
.activity-list img { width: 40px; height: 40px; border-radius: 50%; }
.activity-list b { color: var(--dark); }
  \`,
  javascript: \`console.log('Dashboard initialized');\`
};
`);

console.log('Phase 1 core templates overhauled!');
