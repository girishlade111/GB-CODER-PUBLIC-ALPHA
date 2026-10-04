      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // Styles are imported here so the bundler collects them from the module graph.
      // The playground injects #root; guard so a missing host is a no-op.
      import './styles.css';

      const host = document.getElementById('root');

      if (host) {
        createRoot(host).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
      }