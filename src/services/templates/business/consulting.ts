
export default {
  html: `
<div class="page">
  <div class="sidebar">
    <h2>Apex Financial</h2>
    <ul><li>Home</li><li>Services</li><li>Case Studies</li><li>Contact</li></ul>
  </div>
  <div class="content">
    <div class="hero-banner hover-lift">
      <div class="banner-text">
        <h1>Secure Your Financial Future</h1>
        <p>Expert consulting for enterprise wealth management.</p>
        <button class="btn-solid">Free Consultation</button>
      </div>
      <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop" />
    </div>
    <div class="services">
      <div class="service-card animate-fade-in-up"><h3>Wealth Planning</h3><p>Comprehensive strategies for growth.</p></div>
      <div class="service-card animate-fade-in-up" style="animation-delay:0.1s"><h3>Tax Strategy</h3><p>Minimize liability legally and effectively.</p></div>
      <div class="service-card animate-fade-in-up" style="animation-delay:0.2s"><h3>Risk Management</h3><p>Protecting your assets in volatile markets.</p></div>
    </div>
  </div>
</div>
  `,
  css: `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

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

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: var(--dark); background-color: var(--light); line-height: 1.6; -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; transition: all 0.3s ease; }
button { cursor: pointer; border: none; font-family: inherit; transition: all 0.3s ease; }

.gradient-text { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, var(--primary), var(--secondary)); }
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
.hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.hover-lift:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); }

.page { display: flex; min-height: 100vh; background: #fff; }
.sidebar { width: 250px; background: #0f172a; color: white; padding: 2rem; }
.sidebar h2 { font-size: 1.5rem; margin-bottom: 3rem; color: #38bdf8; }
.sidebar ul { list-style: none; display: flex; flex-direction: column; gap: 1.5rem; }
.sidebar li { color: #94a3b8; font-weight: 500; cursor: pointer; transition: color 0.3s; }
.sidebar li:hover { color: white; }
.content { flex: 1; padding: 3rem; background: #f8fafc; }
.hero-banner { background: white; border-radius: 24px; padding: 3rem; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-lg); margin-bottom: 3rem; }
.banner-text { max-width: 400px; }
.banner-text h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 800; color: #0f172a; }
.banner-text p { color: #64748b; margin-bottom: 2rem; font-size: 1.1rem; }
.btn-solid { background: #38bdf8; color: #0f172a; padding: 1rem 2rem; border-radius: 50px; font-weight: 700; font-size: 1rem; }
.hero-banner img { width: 350px; height: 250px; border-radius: 16px; object-fit: cover; box-shadow: var(--shadow-md); }
.services { display: flex; gap: 2rem; }
.service-card { flex: 1; background: white; padding: 2rem; border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0; }
.service-card h3 { color: #0f172a; margin-bottom: 0.5rem; }
.service-card p { color: #64748b; font-size: 0.9rem; }
  `,
  javascript: `console.log('Consulting loaded');`
};
