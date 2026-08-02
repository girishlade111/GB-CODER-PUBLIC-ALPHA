
export default {
  files: [
    {
      path: 'App.jsx',
      content: `import { useState } from 'react';
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
