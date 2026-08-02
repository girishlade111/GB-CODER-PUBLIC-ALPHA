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
`;

// ==========================================
// BUSINESS
// ==========================================
// 1. Digital Agency
createFile(path.join(templatesDir, 'business', 'agency.ts'), `
export default {
  html: \`
<nav class="nav">
  <div class="logo">Digital<span class="gradient-text">Flow</span></div>
  <div class="menu">
    <a href="#">Work</a>
    <a href="#">Services</a>
    <a href="#">Culture</a>
    <button class="btn">Start a Project</button>
  </div>
</nav>
<header class="hero">
  <h1 class="animate-fade-in-up">We build digital experiences that <span class="gradient-text">matter</span></h1>
  <div class="showcase">
    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop" class="hover-lift animate-fade-in-up" style="animation-delay: 0.1s" />
    <img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop" class="hover-lift animate-fade-in-up" style="animation-delay: 0.2s" />
  </div>
</header>
  \`,
  css: \`
${baseCSS}
.nav { display: flex; justify-content: space-between; align-items: center; padding: 2rem 5%; }
.logo { font-size: 1.5rem; font-weight: 800; }
.menu { display: flex; gap: 2rem; align-items: center; font-weight: 500; }
.btn { background: var(--dark); color: white; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; }
.btn:hover { background: var(--primary); }
.hero { padding: 5rem 5%; text-align: center; }
.hero h1 { font-size: 4.5rem; font-weight: 800; max-width: 900px; margin: 0 auto 4rem auto; line-height: 1.1; letter-spacing: -2px; }
.showcase { display: flex; gap: 2rem; justify-content: center; }
.showcase img { width: 45%; border-radius: 20px; box-shadow: var(--shadow-xl); height: 400px; object-fit: cover; }
  \`,
  javascript: \`console.log('Agency loaded');\`
};
`);

// 2. Financial Consulting
createFile(path.join(templatesDir, 'business', 'consulting.ts'), `
export default {
  html: \`
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
  \`,
  css: \`
${baseCSS}
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
  \`,
  javascript: \`console.log('Consulting loaded');\`
};
`);

// 3. Local Cafe
createFile(path.join(templatesDir, 'business', 'local.ts'), `
export default {
  html: \`
<div class="cafe-wrap">
  <nav class="cafe-nav">
    <div class="logo">Brew<span>&</span>Bite</div>
    <div><a href="#">Menu</a> <a href="#">Location</a></div>
  </nav>
  <header class="cafe-hero">
    <div class="hero-box animate-fade-in-up">
      <h1>Artisan Coffee <br/>& Fresh Pastries</h1>
      <button class="order-btn">Order Ahead</button>
    </div>
  </header>
  <div class="grid-gallery">
    <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop" class="hover-lift" />
    <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop" class="hover-lift" />
    <img src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=500&auto=format&fit=crop" class="hover-lift" />
  </div>
</div>
  \`,
  css: \`
${baseCSS}
.cafe-wrap { background: #faf9f6; min-height: 100vh; }
.cafe-nav { display: flex; justify-content: space-between; padding: 2rem 5%; align-items: center; }
.cafe-nav .logo { font-size: 1.8rem; font-weight: 800; color: #431407; font-family: serif; }
.cafe-nav .logo span { color: #d97706; }
.cafe-nav a { margin-left: 2rem; color: #78350f; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
.cafe-hero { height: 60vh; background: url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&auto=format&fit=crop') center/cover; position: relative; display: flex; align-items: center; justify-content: center; }
.cafe-hero::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
.hero-box { position: relative; z-index: 1; text-align: center; color: white; }
.hero-box h1 { font-family: serif; font-size: 4rem; line-height: 1.2; margin-bottom: 2rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.order-btn { background: #d97706; color: white; padding: 1rem 3rem; font-size: 1.1rem; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); }
.order-btn:hover { background: #b45309; transform: translateY(-3px); }
.grid-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 4rem 5%; }
.grid-gallery img { width: 100%; height: 300px; object-fit: cover; border-radius: 12px; }
  \`,
  javascript: \`\`
};
`);

// ==========================================
// SAAS / STARTUP
// ==========================================
// 4. Waitlist
createFile(path.join(templatesDir, 'startup', 'waitlist.ts'), `
export default {
  html: \`
<div class="waitlist-page">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="glass-container animate-fade-in-up">
    <div class="badge">Coming Soon</div>
    <h1>The next generation of <span class="gradient-text">productivity</span></h1>
    <p>Join 10,000+ others who are ready to revolutionize their workflow.</p>
    <div class="input-group hover-lift">
      <input type="email" placeholder="Enter your email address" />
      <button>Join Waitlist</button>
    </div>
    <div class="avatars">
      <img src="https://i.pravatar.cc/100?img=1" /><img src="https://i.pravatar.cc/100?img=2" /><img src="https://i.pravatar.cc/100?img=3" />
      <span>Join the club</span>
    </div>
  </div>
</div>
  \`,
  css: \`
${baseCSS}
.waitlist-page { min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.blob { position: absolute; filter: blur(80px); opacity: 0.5; border-radius: 50%; animation: float 10s infinite alternate; }
.blob-1 { width: 400px; height: 400px; background: #4F46E5; top: -100px; left: -100px; }
.blob-2 { width: 300px; height: 300px; background: #ec4899; bottom: -50px; right: -50px; animation-delay: -5s; }
@keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }

.glass-container { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 4rem; border-radius: 24px; text-align: center; max-width: 600px; z-index: 10; position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.badge { display: inline-block; padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); color: white; border-radius: 50px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2); }
h1 { color: white; font-size: 3.5rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800; letter-spacing: -1px; }
p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2.5rem; }
.input-group { display: flex; background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); }
.input-group input { flex: 1; background: transparent; border: none; color: white; padding: 0 1.5rem; outline: none; font-size: 1rem; }
.input-group button { background: white; color: black; padding: 1rem 2rem; border-radius: 50px; font-weight: 700; font-size: 1rem; }
.input-group button:hover { background: #e2e8f0; }

.avatars { display: flex; align-items: center; justify-content: center; margin-top: 2rem; gap: 0.5rem; }
.avatars img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0f172a; margin-left: -10px; }
.avatars img:first-child { margin-left: 0; }
.avatars span { color: #64748b; font-size: 0.9rem; margin-left: 0.5rem; }
  \`,
  javascript: \`\`
};
`);

// 5. SaaS Pricing
createFile(path.join(templatesDir, 'saas', 'pricing.ts'), `
export default {
  html: \`
<div class="pricing-page">
  <div class="header animate-fade-in-up">
    <h1>Simple, transparent pricing</h1>
    <p>No hidden fees. No surprise charges.</p>
  </div>
  <div class="pricing-grid">
    <div class="plan hover-lift animate-fade-in-up" style="animation-delay: 0.1s">
      <h3>Hobby</h3>
      <div class="price"><span>$</span>0<span>/mo</span></div>
      <ul>
        <li>✓ 1 Project</li>
        <li>✓ Community Support</li>
        <li>✓ 100 API Requests</li>
      </ul>
      <button class="btn-outline">Start Free</button>
    </div>
    <div class="plan pro hover-lift animate-fade-in-up" style="animation-delay: 0.2s">
      <div class="popular">Most Popular</div>
      <h3>Pro</h3>
      <div class="price"><span>$</span>29<span>/mo</span></div>
      <ul>
        <li>✓ Unlimited Projects</li>
        <li>✓ Priority Support</li>
        <li>✓ 10,000 API Requests</li>
        <li>✓ Custom Domains</li>
      </ul>
      <button class="btn-solid">Get Started</button>
    </div>
    <div class="plan hover-lift animate-fade-in-up" style="animation-delay: 0.3s">
      <h3>Enterprise</h3>
      <div class="price"><span>$</span>99<span>/mo</span></div>
      <ul>
        <li>✓ Everything in Pro</li>
        <li>✓ 24/7 Phone Support</li>
        <li>✓ Unlimited API Requests</li>
        <li>✓ SLA Agreement</li>
      </ul>
      <button class="btn-outline">Contact Sales</button>
    </div>
  </div>
</div>
  \`,
  css: \`
${baseCSS}
.pricing-page { padding: 5rem 5%; background: #f8fafc; min-height: 100vh; }
.header { text-align: center; margin-bottom: 4rem; }
.header h1 { font-size: 3rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; letter-spacing: -1px; }
.header p { font-size: 1.25rem; color: #64748b; }

.pricing-grid { display: flex; justify-content: center; gap: 2rem; max-width: 1200px; margin: 0 auto; align-items: center; }
.plan { background: white; padding: 3rem; border-radius: 24px; box-shadow: var(--shadow-md); border: 1px solid #e2e8f0; flex: 1; text-align: center; position: relative; }
.plan.pro { transform: scale(1.05); box-shadow: var(--shadow-xl); border: 2px solid var(--primary); }
.plan.pro:hover { transform: scale(1.05) translateY(-5px); }

.popular { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 0.5rem 1.5rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
h3 { font-size: 1.5rem; color: #0f172a; margin-bottom: 1rem; }
.price { font-size: 4rem; font-weight: 800; color: #0f172a; margin-bottom: 2rem; display: flex; justify-content: center; align-items: baseline; }
.price span { font-size: 1.25rem; color: #64748b; font-weight: 600; margin: 0 0.2rem; }

ul { list-style: none; text-align: left; margin-bottom: 3rem; display: flex; flex-direction: column; gap: 1rem; }
li { color: #475569; font-weight: 500; display: flex; gap: 0.5rem; }

.btn-outline { width: 100%; padding: 1rem; background: transparent; border: 2px solid #e2e8f0; border-radius: 12px; font-weight: 700; color: #0f172a; font-size: 1rem; }
.btn-outline:hover { border-color: #0f172a; }
.btn-solid { width: 100%; padding: 1rem; background: var(--primary); border: 2px solid var(--primary); border-radius: 12px; font-weight: 700; color: white; font-size: 1rem; }
.btn-solid:hover { background: var(--primary-hover); }
  \`,
  javascript: \`\`
};
`);

console.log('Phase 2 templates generated!');
