
export default {
  html: `
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
  `,
  javascript: `console.log('Corporate template loaded with animations!');`
};
