
export default {
  html: `
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

.nav { display: flex; justify-content: space-between; align-items: center; padding: 2rem 5%; }
.logo { font-size: 1.5rem; font-weight: 800; }
.menu { display: flex; gap: 2rem; align-items: center; font-weight: 500; }
.btn { background: var(--dark); color: white; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; }
.btn:hover { background: var(--primary); }
.hero { padding: 5rem 5%; text-align: center; }
.hero h1 { font-size: 4.5rem; font-weight: 800; max-width: 900px; margin: 0 auto 4rem auto; line-height: 1.1; letter-spacing: -2px; }
.showcase { display: flex; gap: 2rem; justify-content: center; }
.showcase img { width: 45%; border-radius: 20px; box-shadow: var(--shadow-xl); height: 400px; object-fit: cover; }
  `,
  javascript: `console.log('Agency loaded');`
};
