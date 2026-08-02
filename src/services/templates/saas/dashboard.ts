
export default {
  html: `
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
  `,
  javascript: `console.log('Dashboard initialized');`
};
