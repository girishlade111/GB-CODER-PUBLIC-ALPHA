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

// 1. Plain: Blog Layout
createFile(path.join(templatesDir, 'plain', 'blog.ts'), `
export default {
  html: \`<div class="blog-container">
  <header><h1>My Tech Blog</h1></header>
  <main>
    <article>
      <h2>First Post</h2>
      <p>This is the content of my first post.</p>
    </article>
  </main>
</div>\`,
  css: \`.blog-container { max-width: 800px; margin: 0 auto; font-family: sans-serif; } header { border-bottom: 1px solid #ccc; padding: 20px 0; }\`,
  javascript: \`console.log('Blog loaded');\`
};
`);

// 2. Plain: Animation Showcase
createFile(path.join(templatesDir, 'plain', 'animation.ts'), `
export default {
  html: \`<div class="box">Hover me</div>\`,
  css: \`.box { width: 100px; height: 100px; background: blue; transition: transform 0.3s; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; } .box:hover { transform: scale(1.5) rotate(45deg); }\`,
  javascript: \`// CSS handles the animation\`
};
`);

// 3. Plain: Login/Signup
createFile(path.join(templatesDir, 'plain', 'auth.ts'), `
export default {
  html: \`<div class="auth-card">
  <h2>Login</h2>
  <form><input type="email" placeholder="Email" /><input type="password" placeholder="Password" /><button type="submit">Log In</button></form>
</div>\`,
  css: \`.auth-card { padding: 20px; border: 1px solid #ddd; max-width: 300px; margin: 50px auto; border-radius: 8px; } input, button { display: block; width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }\`,
  javascript: \`document.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); alert('Login attempt!'); });\`
};
`);

// 4. React: Todo App
createFile(path.join(templatesDir, 'react', 'todo.ts'), `
export default {
  files: [
    {
      path: 'App.jsx',
      content: \`import { useState } from 'react';
export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>React Todo</h1>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => { setTodos([...todos, input]); setInput(''); }}>Add</button>
      <ul>{todos.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}\`
    },
    {
      path: 'main.jsx',
      content: \`import { createRoot } from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);\`
    }
  ]
};
`);

// 5. React: Weather Widget
createFile(path.join(templatesDir, 'react', 'weather.ts'), `
export default {
  files: [
    {
      path: 'App.jsx',
      content: \`export default function App() {
  return (
    <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8, width: 200, fontFamily: 'sans-serif' }}>
      <h3>☀️ Sunny</h3>
      <h2>72°F</h2>
      <p>San Francisco, CA</p>
    </div>
  );
}\`
    },
    {
      path: 'main.jsx',
      content: \`import { createRoot } from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);\`
    }
  ]
};
`);

// 6. React: Admin Dashboard
createFile(path.join(templatesDir, 'react', 'dashboard.ts'), `
export default {
  files: [
    {
      path: 'App.jsx',
      content: \`export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: 250, background: '#111', color: 'white', padding: 20 }}>
        <h2>Admin</h2>
        <ul><li>Users</li><li>Settings</li></ul>
      </nav>
      <main style={{ flex: 1, padding: 20, background: '#f5f5f5' }}>
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: 20, background: 'white', flex: 1, borderRadius: 8 }}>Stats 1</div>
          <div style={{ padding: 20, background: 'white', flex: 1, borderRadius: 8 }}>Stats 2</div>
        </div>
      </main>
    </div>
  );
}\`
    },
    {
      path: 'main.jsx',
      content: \`import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
createRoot(document.getElementById('root')).render(<App />);\`
    },
    {
      path: 'style.css',
      content: \`body { margin: 0; }\`
    }
  ]
};
`);

// 7. Vue: Task Manager
createFile(path.join(templatesDir, 'vue', 'tasks.ts'), `
export default {
  files: [
    {
      path: 'App.vue',
      content: \`<script setup>
import { ref } from 'vue';
const tasks = ref([{ text: 'Learn Vue', done: false }]);
</script>
<template>
  <div style="font-family: sans-serif; padding: 20px;">
    <h1>Vue Task Manager</h1>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">
        <input type="checkbox" v-model="task.done" /> {{ task.text }}
      </li>
    </ul>
  </div>
</template>\`
    },
    {
      path: 'main.js',
      content: \`import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');\`
    }
  ]
};
`);

// 8. Next.js: Blog Starter
createFile(path.join(templatesDir, 'nextjs', 'blog.ts'), `
export default {
  files: [
    {
      path: 'App.jsx',
      content: \`export default function NextAppMock() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <h1>Next.js Blog Starter</h1>
      <p>This is a simulated Next.js environment running in React client-side mode.</p>
      <div style={{ border: '1px solid #eaeaea', padding: 20, borderRadius: 10, marginTop: 20 }}>
        <h2>Hello World</h2>
        <p>Published on Jan 1, 2024</p>
      </div>
    </div>
  );
}\`
    },
    {
      path: 'main.jsx',
      content: \`import { createRoot } from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);\`
    }
  ]
};
`);

console.log('Templates created!');
