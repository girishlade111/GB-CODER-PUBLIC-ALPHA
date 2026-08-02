
export default {
  files: [
    {
      path: 'App.jsx',
      content: `export default function App() {
  return (
    <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8, width: 200, fontFamily: 'sans-serif' }}>
      <h3>☀️ Sunny</h3>
      <h2>72°F</h2>
      <p>San Francisco, CA</p>
    </div>
  );
}`
    },
    {
      path: 'main.jsx',
      content: `import { createRoot } from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);`
    }
  ]
};
