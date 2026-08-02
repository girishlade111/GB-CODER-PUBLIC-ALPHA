
export default {
  html: `<div class="auth-card">
  <h2>Login</h2>
  <form><input type="email" placeholder="Email" /><input type="password" placeholder="Password" /><button type="submit">Log In</button></form>
</div>`,
  css: `.auth-card { padding: 20px; border: 1px solid #ddd; max-width: 300px; margin: 50px auto; border-radius: 8px; } input, button { display: block; width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }`,
  javascript: `document.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); alert('Login attempt!'); });`
};
