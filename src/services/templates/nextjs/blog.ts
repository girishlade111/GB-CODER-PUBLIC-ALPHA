
export default {
  files: [
    {
      path: 'App.jsx',
      content: `export default function NextAppMock() {
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
