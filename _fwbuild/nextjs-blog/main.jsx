      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // The playground supplies #root. The routes underneath are emulated in
      // `App.jsx`; see the comment block at the top of that file for what a real
      // Next.js App Router does instead.
      import './styles.css';

      const host = document.getElementById('root');

      if (host) {
        createRoot(host).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
      }