
export default {
  files: [
    {
      path: 'App.jsx',
      content: `export default function App() {
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
}`
    },
    {
      path: 'main.jsx',
      content: `import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
createRoot(document.getElementById('root')).render(<App />);`
    },
    {
      path: 'style.css',
      content: `body { margin: 0; }`
    }
  ]
};
