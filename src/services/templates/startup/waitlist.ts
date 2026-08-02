
export default {
  html: `
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
  `,
  javascript: ``
};
