// SaaS Dashboard Template
export const html = `<!-- SaaS Dashboard -->
<div class="dashboard-container">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span>📊</span>
        <span>SaaSify</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">
        <span>🏠</span>
        <span>Dashboard</span>
      </a>
      <a href="#" class="nav-item">
        <span>📈</span>
        <span>Analytics</span>
      </a>
      <a href="#" class="nav-item">
        <span>👥</span>
        <span>Customers</span>
      </a>
      <a href="#" class="nav-item">
        <span>💳</span>
        <span>Billing</span>
      </a>
      <a href="#" class="nav-item">
        <span>⚙️</span>
        <span>Settings</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="upgrade-card">
        <h4>Upgrade to Pro</h4>
        <p>Get more features</p>
        <button class="btn-upgrade">Upgrade Now</button>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="search-bar">
        <span>🔍</span>
        <input type="text" placeholder="Search...">
      </div>
      <div class="top-actions">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">❓</button>
        <div class="user-menu">
          <div class="user-avatar">👤</div>
          <span>John Doe</span>
        </div>
      </div>
    </header>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <div class="page-header">
        <h1>Dashboard Overview</h1>
        <button class="btn-primary">+ New Report</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">💰</span>
            <span class="stat-change positive">+12.5%</span>
          </div>
          <div class="stat-value">$45,231</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">👥</span>
            <span class="stat-change positive">+8.2%</span>
          </div>
          <div class="stat-value">2,350</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">📦</span>
            <span class="stat-change negative">-3.1%</span>
          </div>
          <div class="stat-value">1,247</div>
          <div class="stat-label">Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">📊</span>
            <span class="stat-change positive">+24.3%</span>
          </div>
          <div class="stat-value">98.5%</div>
          <div class="stat-label">Uptime</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Revenue Overview</h3>
            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div class="chart-placeholder">
            <div class="bar-chart">
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 80%"></div>
              <div class="bar" style="height: 45%"></div>
              <div class="bar" style="height: 90%"></div>
              <div class="bar" style="height: 70%"></div>
              <div class="bar" style="height: 85%"></div>
              <div class="bar" style="height: 65%"></div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <h3>User Activity</h3>
            <select>
              <option>This week</option>
              <option>Last week</option>
            </select>
          </div>
          <div class="chart-placeholder">
            <div class="line-chart">
              <svg viewBox="0 0 400 150">
                <polyline points="0,120 50,100 100,110 150,80 200,90 250,60 300,70 350,40 400,50" 
                  fill="none" stroke="#6366f1" stroke-width="3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">💳</div>
            <div class="activity-content">
              <strong>New subscription</strong>
              <p>Pro Plan - $79/month</p>
            </div>
            <div class="activity-time">2 min ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">👤</div>
            <div class="activity-content">
              <strong>New user registered</strong>
              <p>sarah@example.com</p>
            </div>
            <div class="activity-time">15 min ago</div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">📧</div>
            <div class="activity-content">
              <strong>Email campaign sent</strong>
              <p>Weekly newsletter</p>
            </div>
            <div class="activity-time">1 hour ago</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --sidebar-width: 260px;
  --top-bar-height: 70px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f1f5f9;
}

.dashboard-container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background: #334155;
  color: white;
}

.nav-item span:first-child {
  font-size: 1.25rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #334155;
}

.upgrade-card {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.upgrade-card h4 {
  margin-bottom: 0.5rem;
}

.upgrade-card p {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.btn-upgrade {
  background: white;
  color: var(--primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

/* Main Content */
.main-content {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

/* Top Bar */
.top-bar {
  height: var(--top-bar-height);
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  width: 300px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background 0.3s;
}

.icon-btn:hover {
  background: #e2e8f0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dashboard Content */
.dashboard-content {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #0f172a;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.stat-change.positive {
  background: #dcfce7;
  color: #16a34a;
}

.stat-change.negative {
  background: #fee2e2;
  color: #dc2626;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.chart-header h3 {
  color: #0f172a;
}

.chart-header select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.chart-placeholder {
  padding: 1.5rem;
  height: 250px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  gap: 0.5rem;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary), #8b5cf6);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: height 0.3s;
}

.bar:hover {
  opacity: 0.8;
}

.line-chart {
  height: 100%;
}

.line-chart svg {
  width: 100%;
  height: 100%;
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.activity-section h3 {
  margin-bottom: 1.5rem;
  color: #0f172a;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.activity-content {
  flex: 1;
}

.activity-content strong {
  display: block;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.activity-content p {
  color: #64748b;
  font-size: 0.875rem;
}

.activity-time {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Buttons */
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: 80px 1fr;
  }
  
  .sidebar {
    width: 80px;
  }
  
  .sidebar-header span:last-child,
  .nav-item span:last-child,
  .upgrade-card h4,
  .upgrade-card p {
    display: none;
  }
  
  .main-content {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .stats-grid,
  .charts-section {
    grid-template-columns: 1fr;
  }
}`;

export const javascript = `// Sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
  console.log('Searching for:', e.target.value);
});

// Notification button
document.querySelector('.icon-btn').addEventListener('click', () => {
  alert('You have 3 new notifications');
});

// Upgrade button
document.querySelector('.btn-upgrade').addEventListener('click', () => {
  alert('Redirecting to upgrade page...');
});

// New Report button
document.querySelector('.page-header .btn-primary').addEventListener('click', () => {
  alert('Creating new report...');
});

// Animate stats on load
window.addEventListener('load', () => {
  document.querySelectorAll('.stat-value').forEach(stat => {
    const target = stat.textContent;
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      stat.style.transition = 'all 0.6s ease';
      stat.style.opacity = '1';
      stat.style.transform = 'translateY(0)';
    }, 200);
  });
});

// Chart hover effects
document.querySelectorAll('.bar').forEach((bar, index) => {
  bar.addEventListener('mouseenter', () => {
    const value = [60, 80, 45, 90, 70, 85, 65][index];
    bar.title = \`Day \${index + 1}: \${value}%\`;
  });
});

console.log('SaaS Dashboard Template loaded successfully!');
`;

export default { html, css, javascript };
