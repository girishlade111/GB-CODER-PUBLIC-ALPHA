export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  intro: string;
  sections: {
    heading: string;
    body: string;
    codeSnippet?: string;
    codeLang?: string;
  }[];
  relatedDocsLink: string;
  relatedDocsLabel: string;
}

export interface BlogTranslations {
  metaTitle: string;
  metaDescription: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  readArticleLabel: string;
  publishedOnLabel: string;
  byAuthorLabel: string;
  relatedArticlesTitle: string;
  backToBlogLabel: string;
  articles: Record<string, BlogArticle>;
}

export const BLOG_TRANSLATIONS: Record<string, BlogTranslations> = {
  en: {
    metaTitle: 'Blog & Engineering Guides — GB Coder by LadeStack',
    metaDescription: 'Practical engineering guides for browser-based development: live preview workflows, React and Vue browser IDE architectures, and IndexedDB backup systems.',
    heroTag: 'Engineering & Tutorials',
    heroTitle: 'GB Coder Engineering Guides & Tutorials',
    heroDescription: 'In-depth, practical guides for modern web development directly in your browser. Real workflows, verified code patterns, and architectural insights.',
    readArticleLabel: 'Read Full Guide',
    publishedOnLabel: 'Published on',
    byAuthorLabel: 'By',
    relatedArticlesTitle: 'Related Technical Guides',
    backToBlogLabel: '← Back to Blog',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Building an HTML/CSS/JavaScript Project with Instant Live Preview',
        description: 'Learn how to construct a complete, responsive front-end component using GB Coder’s Static Editor, instant DOM synchronization, and integrated virtual console.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Prototyping'],
        intro: 'Prototyping modern web interfaces often requires navigating slow local development servers, bundler configurations, and complex dependencies. GB Coder provides a zero-setup, in-browser front-end development environment that synchronizes your markup, styles, and logic directly into a sandboxed iframe with debounced real-time evaluation.',
        sections: [
          {
            heading: '1. Structuring Semantic HTML in the Canvas',
            body: 'Begin by crafting clean, accessible semantic HTML in the HTML pane. The Static Editor automatically wraps your markup in a standards-compliant HTML5 document shell, so you can focus directly on the interactive elements without writing boilerplate <!doctype html> tags.',
            codeSnippet: `<div class="interactive-card">
  <header class="card-header">
    <span class="badge">Live Prototyping</span>
    <h2>Interactive Task Tracker</h2>
  </header>
  <div class="card-body">
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Add a new engineering task..." />
      <button id="addBtn" class="btn-primary">Add Task</button>
    </div>
    <ul id="taskList" class="task-list"></ul>
  </div>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Applying Scoped CSS Styles with Instant Feedback',
            body: 'Switch to the CSS pane to style the component using modern CSS variables, Flexbox, and CSS Grid. The live preview updates smoothly as you type, preserving input focus and scroll coordinates so you never lose context during visual polish.',
            codeSnippet: `:root {
  --surface-bg: #ffffff;
  --accent-color: #cc785c;
  --text-dark: #141413;
  --border-line: #e6dfd8;
}

.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  background: var(--surface-bg);
  border: 1px solid var(--border-line);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-line);
  border-radius: 4px;
}

.btn-primary {
  background: var(--accent-color);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Adding Modern ES2024 Logic and Logging',
            body: 'In the JavaScript pane, write standard ECMAScript code. All console.log, console.warn, and console.error messages are mirrored to both the browser DevTools and GB Coder’s virtual runtime console below the editor.',
            codeSnippet: `const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

function addTask(title) {
  if (!title.trim()) return;
  const li = document.createElement('li');
  li.textContent = title;
  li.onclick = () => li.classList.toggle('done');
  list.appendChild(li);
  input.value = '';
  console.log('[Task Added]:', title);
}

addBtn.addEventListener('click', () => addTask(input.value));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask(input.value);
});`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Testing on Real Devices with Popout & QR Codes',
            body: 'To verify responsive behavior on physical smartphones or dual-monitor setups, click "Popout Preview" in the toolbar to detach the rendering iframe into a clean external window, or generate a mobile preview QR code to test immediately on your phone.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Read the Static Editor Documentation →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Starting React and Vue Projects Directly in Your Browser',
        description: 'Discover how to develop modern component-based applications with React 18 and Vue 3 inside GB Coder without local Node.js or npm installation.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Frontend'],
        intro: 'Modern frontend development traditionally requires installing Node.js, managing npm packages, and configuring complex bundlers like Vite or Webpack locally. With GB Coder’s Advanced WebContainer IDE, you can run genuine Node.js processes and Vite dev servers directly inside your browser tab.',
        sections: [
          {
            heading: '1. React 18 Starter Architecture in the Browser',
            body: 'When you initialize a React 18 project from the Template Gallery, GB Coder populates a standard project directory containing package.json, vite.config.ts, and standard src/App.tsx source files. You can immediately edit TSX files with complete Monaco IntelliSense support.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';

export function App() {
  const [metrics, setMetrics] = useState({ requests: 120, latency: 42 });

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900">Application Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Processed Requests</p>
          <p className="text-3xl font-semibold text-indigo-600">{metrics.requests}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Average Latency (ms)</p>
          <p className="text-3xl font-semibold text-emerald-600">{metrics.latency}ms</p>
        </div>
      </div>
    </main>
  );
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Vue 3 Single File Component (SFC) Compilation',
            body: 'Vue 3 starters compile .vue files directly in browser memory using the official @vue/compiler-sfc engine. You can leverage the Composition API with <script setup>, scoped CSS styles, and reactive state without configuring external loaders.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div class="vue-container">
    <h2>{{ title }}</h2>
    <p>Current count: <strong>{{ count }}</strong></p>
    <button @click="increment" class="btn">Add Click</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const title = ref('Vue 3 in GB Coder');
const count = ref(0);
const increment = () => count.value++;
</script>

<style scoped>
.vue-container {
  padding: 1.5rem;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
  background: #ffffff;
}
.btn {
  background: #cc785c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
</style>`,
            codeLang: 'html',
          },
          {
            heading: '3. Executing Commands in the xterm.js Shell',
            body: 'Open the integrated terminal in the Advanced IDE by pressing Ctrl+`. You can run npm install to pull new utility packages from the public npm registry, run custom scripts, or rebuild your Vite production bundles seamlessly inside the WebContainer micro-OS.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Read the Framework Documentation →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Importing, Exporting, and Backing Up Browser-Based Coding Projects',
        description: 'Understand GB Coder’s local-first IndexedDB persistence model, SHA-256 archive verification, and how to safely back up projects to your local filesystem.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Security', 'Data Portability', 'Backups'],
        intro: 'One of the primary concerns with in-browser IDEs is data durability: what happens if the browser cache is cleared or you switch machines? GB Coder addresses this with a local-first architecture powered by IndexedDB combined with tamper-proof ZIP archive export and restore workflows.',
        sections: [
          {
            heading: '1. How Local-First IndexedDB Storage Works',
            body: 'Unlike cloud coding environments that require user accounts and store your source code on remote servers, GB Coder persists your entire workspace tree locally in your browser’s IndexedDB database named gb-coder-projects-db. This ensures zero latency on load and complete code privacy.',
          },
          {
            heading: '2. Exporting ZIP Archives with SHA-256 Hashes',
            body: 'When you click Export Project, GB Coder packages all files, folders, and metadata into a standard ZIP archive. As part of this process, the engine calculates a SHA-256 integrity hash across all file contents and embeds the verification manifest directly inside the archive.',
            codeSnippet: `// Example backup-manifest.json embedded in exports
{
  "projectId": "proj-98214",
  "name": "Dashboard-Component",
  "exportedAt": "2026-10-15T12:00:00.000Z",
  "filesCount": 14,
  "integrityAlgorithm": "SHA-256",
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`,
            codeLang: 'json',
          },
          {
            heading: '3. Restoring and Verifying Projects Safely',
            body: 'To restore a project, simply drag your ZIP archive into the Projects Dashboard. The import pipeline validates the archive structure, inspects file paths to prevent directory traversal vulnerabilities (such as ../), verifies checksums, and restores the full file tree into a fresh workspace.',
          },
          {
            heading: '4. Best Practices for Long-Term Project Archiving',
            body: 'Because browser storage quotas can be affected by browser profile resets or operating system storage cleanup, we recommend exporting a ZIP backup after concluding major feature milestones. Since exports use standard ZIP formats, you can also extract them directly into VS Code on your desktop.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Read the Backup & Restore Documentation →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'How GB Coder Works: A Complete Browser IDE Guide',
        description: 'A complete tour of GB Coder: instant HTML/CSS/JS preview, a Monaco editor, in-browser Node.js, optional AI tools, GitHub sync, backups, and deploys.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'Browser IDE', 'Web Development', 'Developer Tools', 'Product Guide'],
        intro: 'Most web ideas stall before the first line of code. You need a runtime, a package manager, a bundler, an editor setup, and a folder structure before a single button appears on screen. GB Coder, built by LadeStack, removes that runway. It opens as a complete development environment inside a browser tab, keeps projects on your own device, and scales from a three-panel HTML experiment to a Node.js application with a terminal. This guide explains how the product works, what its two editing modes are for, and how the individual features fit together. Where a capability depends on a browser API or an external account, that dependency is stated plainly.',
        sections: [
          {
            heading: '1. Two Engines Behind One Workspace',
            body: 'GB Coder is best understood as two environments sharing a shell. The Static Editor is a focused HTML, CSS, and JavaScript workbench: you type, the preview renders, and no build step sits in between. The Advanced IDE runs a real Node.js toolchain through WebContainer, a WebAssembly-based runtime that executes inside the browser tab. Both modes use the same project dashboard, Monaco editor, file explorer, preview panel, and local storage layer, so moving between them feels like changing tools rather than changing products. Choose the static mode for a landing page, a CSS experiment, a teaching demo, or a small script. Choose the advanced mode when you need npm packages, a Vite development server, JSX compilation, or a terminal. The advanced runtime requires a modern browser with SharedArrayBuffer and cross-origin isolation; current Chromium-based browsers and Firefox are the practical choices. Nothing runs on a remote virtual machine.',
          },
          {
            heading: '2. Starting a Project in Under a Minute',
            body: 'The entry point is the Projects Dashboard. Selecting New Project offers a blank static sandbox, a React 18 starter, a Vue 3 starter, or a WebContainer Node.js environment. The template gallery adds landing pages, dashboards, utility apps, and component prototypes, each with a sensible file structure already in place. A new workspace is created immediately in IndexedDB, the browser’s transactional storage layer, so the first preview is available without a download, an account, or a server round trip. Project names and folders are yours to organize, and each workspace is isolated from the others. Existing work can come in through a ZIP archive or a GitHub repository, both of which pass through a review step before files are applied. If you have never used the product, this is the whole onboarding: open the dashboard, pick a starting point, and begin editing.',
          },
          {
            heading: '3. The Static Editor and the Instant Feedback Loop',
            body: 'The Static Editor divides the workspace into HTML, CSS, and JavaScript panes. GB Coder wraps the markup in a standards-compliant document shell, so a fragment is enough to get started; there is no boilerplate doctype to maintain. Changes are evaluated in a debounced sandboxed iframe, which keeps a fast typing rhythm from flooding the renderer while still feeling immediate. A virtual console captures log, warn, error, and info output next to the preview, which makes it practical to debug a small script without opening developer tools. External libraries can be added from a CDN or through the External Libraries Manager, covering familiar options such as Tailwind, Bootstrap, and icon sets. Static projects can also grow into multiple files and directories with native ES module imports. The trade-off is deliberate: this mode has no package installation or bundling, so it is ideal for learning, visual experiments, and dependency-free demos, not for a large framework application.',
          },
          {
            heading: '4. Monaco, Language Intelligence, and Editing Utilities',
            body: 'Under the interface sits Monaco, the open-source editor engine behind VS Code. That inheritance shows up in the details: IntelliSense completions, inline type documentation, syntax validation, bracket matching, multi-cursor editing, and configurable keybindings. TypeScript, JavaScript, HTML, CSS, and JSON receive language services, so mistakes are marked while you type rather than after a build. The editor also supports a split view and a diff viewer, which are useful when comparing a revision or reviewing an AI proposal. Around the editor, GB Coder adds the utilities that usually require separate tools: project-wide search and replace with regular expressions and case sensitivity, Prettier-based formatting for the main web languages, a command palette, and a searchable keyboard shortcut reference. Autosave runs continuously, with a status indicator so you know the state of the current file. Individually these are small conveniences. Together they remove the context switching that makes browser editors feel limited.',
          },
          {
            heading: '5. The Advanced IDE: Real Node.js in the Browser',
            body: 'The Advanced IDE is the part that surprises people. WebContainer provides a small operating system compiled to WebAssembly, and it runs genuine Node.js binaries inside the page. That means npm install resolves real packages, npx scripts execute, and a Vite development server starts on a local port that is forwarded to the integrated preview. The terminal is a full xterm.js shell with ANSI styling and command history, not a simulated output pane. Because the runtime is local to the tab, package installation and file operations do not consume a remote container. The constraints are equally real: the feature depends on SharedArrayBuffer and cross-origin isolation, memory is bounded by the browser, and native binaries or Docker images are outside its scope. For a React or Vue application with ordinary npm dependencies, however, the workflow is the same one you would follow on a laptop. The difference is that the environment arrives with the project instead of being rebuilt on every machine.',
            codeSnippet: `npm install
npm run dev
# Vite prints a local URL; GB Coder forwards that port to the preview`,
            codeLang: 'bash',
          },
          {
            heading: '6. Preview, Mobile Testing, and Lightweight Sharing',
            body: 'Every project has a preview, and the preview is more than a static thumbnail. It runs in a sandboxed iframe, can be detached into its own window for a dual-monitor setup, and offers viewport presets for phone, tablet, and desktop widths. A QR code opens the preview on a real phone, which catches the layout problems that desktop resizing misses. For quick feedback, GB Coder can encode a plain single-file project into a share URL using the URL hash. The hash never reaches a server, so the link is self-contained; the trade-off is a practical size limit, and multi-file projects are refused rather than truncated. Those projects can be shared as a ZIP archive or through the sandbox workflow instead. The distinction matters: a share link is a convenience for a small demo, while an archive or repository is the durable handoff for real work.',
          },
          {
            heading: '7. GB Assist, Build with AI, and Voice Control',
            body: 'AI in GB Coder is optional and deliberately reviewable. GB Assist is a chat panel for questions, error explanations, and planned changes; it can propose file edits, but those edits are shown as a diff before anything is applied. The assistant requires you to connect a provider and model, and prompts plus selected code are sent to that provider when you use it. Build with AI takes the opposite direction: you describe an interface in plain language and receive a structured HTML, CSS, and JavaScript project, validated before it replaces the editor contents. Screenshot to Code accepts an image, including one pasted from a snipping tool, and generates a first pass at the markup and styles. Voice control uses the browser’s speech recognition to run commands such as run, format, explain, fix, build, export, open a panel, or switch files; Chrome and Edge currently provide the best support, and a typed command box remains available. Across all four features, the pattern is the same: generation is fast, but acceptance is yours.',
          },
          {
            heading: '8. Snapshots, Backups, and GitHub Sync',
            body: 'Projects autosave to IndexedDB, but autosave is not a version history. Snapshots create named checkpoints of the current project state, and the diff viewer shows what changed before you restore one. For work that needs to leave the browser, ZIP export packages the full directory tree and records an integrity hash; import accepts a dropped archive and shows a structural preview before writing files. GitHub sync closes the loop with a two-way path: connect with a personal access token, choose an existing repository or create one, then push or pull. Pushes are assembled as a single atomic commit, unchanged files are skipped, and a branch that moved underneath you produces a conflict instead of silently overwriting someone else’s work. Pulled files pass through the same review-and-apply flow as an archive. Tokens are session-only by default; remembering one on the device is an opt-in that stores it encrypted, and GitHub traffic goes directly from the browser to api.github.com. LadeStack does not need to hold the credential.',
          },
          {
            heading: '9. Deployment and the Last Mile',
            body: 'A project is not finished until someone can open it. GB Coder supports one-click deployment to Vercel and Netlify using your own account token. The service detects whether the project is a static site or a Vite application, sends the appropriate files, and returns a live URL. Because the token belongs to you, the deployment lands in your account and can be managed there afterward. Static projects can also be exported as a ZIP and uploaded to any host, while GitHub sync connects the workspace to a repository that can drive a CI pipeline. None of these paths locks the project into GB Coder: the files remain standard HTML, CSS, JavaScript, and configuration. That portability is the point. The browser is where the work happens, not where it is trapped.',
          },
          {
            heading: '10. Privacy, Cost, and Who It Is For',
            body: 'GB Coder is free to use, requires no login or registration, and carries no advertising. Its default posture is local-first: projects live in browser storage, and the application does not need a LadeStack account to open them. Data leaves the device only when you choose a connected capability, such as an AI provider, GitHub sync, deployment, or a third-party CDN in your own code. That nuance is worth stating because local-first does not mean offline-only. The product suits learners who want to see HTML and CSS respond immediately, teachers who need a zero-install classroom, developers prototyping an interface before committing to a repository, and anyone who needs a small utility or demo hosted quickly. It is less suitable for enormous monorepos, native toolchains, Docker-based services, or organizations that forbid browser storage. AI usage may incur charges from your chosen provider, and deployment is subject to your Vercel or Netlify plan. The application itself stays free; the external services remain yours to choose.',
          },
          {
            heading: '11. A Workflow You Can Repeat',
            body: 'A reliable routine looks like this. Open the Projects Dashboard and create a workspace in the mode that matches the job. Build the smallest visible version first, then use the console and preview to correct it. Bring in packages only when the static editor genuinely cannot do the job. Test at phone width or scan the QR code before polishing desktop details. Take a snapshot at each meaningful milestone. Push to GitHub or export a ZIP when the work needs a durable home. Deploy when there is something worth showing. None of these steps requires a local installation, and each one can be repeated on another machine with the same browser storage or a fresh clone. If you are new to the product, start with a blank static project and a single heading; the first preview will be on screen before the setup you used to need would have finished. The Projects Dashboard is at /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Read the full GB Coder documentation →',
      },
    },
  },
  es: {
    metaTitle: 'Blog y Guías Técnicas — GB Coder por LadeStack',
    metaDescription: 'Guías de ingeniería para desarrollo en el navegador: flujos de vista previa en vivo, arquitecturas React y Vue en navegador y copias de seguridad en IndexedDB.',
    heroTag: 'Ingeniería y Tutoriales',
    heroTitle: 'Guías de Ingeniería y Tutoriales de GB Coder',
    heroDescription: 'Guías prácticas y detalladas para el desarrollo web moderno directamente en tu navegador. Flujos de trabajo reales y código verificado.',
    readArticleLabel: 'Leer Guía Completa',
    publishedOnLabel: 'Publicado el',
    byAuthorLabel: 'Por',
    relatedArticlesTitle: 'Guías Técnicas Relacionadas',
    backToBlogLabel: '← Volver al Blog',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Creación de Proyectos HTML/CSS/JavaScript con Vista Previa en Vivo',
        description: 'Aprende a construir componentes web con el editor estático de GB Coder, sincronización en tiempo real y consola virtual integrada.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Prototipado'],
        intro: 'Prototipar interfaces web suele requerir configurar servidores locales y empaquetadores lentos. GB Coder ofrece un entorno en el navegador sin configuraciones previas que sincroniza HTML, CSS y JavaScript al instante en un iframe aislado con control de frecuencia.',
        sections: [
          {
            heading: '1. Estructura HTML Semántica en el Lienzo',
            body: 'Comienza escribiendo marcado limpio y accesible en el panel de HTML. El editor estático envuelve automáticamente tu código en una estructura HTML5 válida para que puedas centrarte en la interfaz.',
            codeSnippet: `<div class="interactive-card">
  <header class="card-header">
    <span class="badge">Prototipado en Vivo</span>
    <h2>Gestor de Tareas</h2>
  </header>
  <div class="card-body">
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Añade una tarea técnica..." />
      <button id="addBtn" class="btn-primary">Añadir</button>
    </div>
    <ul id="taskList" class="task-list"></ul>
  </div>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Aplicación de Estilos CSS con Respuesta Inmediata',
            body: 'Pasa al panel de CSS para estilizar el componente con variables modernas, Flexbox y Grid. La vista previa se actualiza mientras escribes, preservando el foco y la posición del cursor.',
            codeSnippet: `:root {
  --surface-bg: #ffffff;
  --accent-color: #cc785c;
  --text-dark: #141413;
  --border-line: #e6dfd8;
}

.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  background: var(--surface-bg);
  border: 1px solid var(--border-line);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Incorporación de Lógica ES2024 y Consola',
            body: 'Escribe código JavaScript estándar. Todas las llamadas a console.log, console.warn y console.error se muestran tanto en las herramientas del navegador como en la consola virtual integrada.',
            codeSnippet: `const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

function addTask(title) {
  if (!title.trim()) return;
  const li = document.createElement('li');
  li.textContent = title;
  list.appendChild(li);
  input.value = '';
  console.log('[Tarea creada]:', title);
}

addBtn.addEventListener('click', () => addTask(input.value));`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Pruebas Móviles y Ventana Desacoplada',
            body: 'Haz clic en "Separar Vista Previa" en la barra de herramientas para abrir la interfaz en una ventana externa independiente, o escanea el código QR con tu móvil para probar en dispositivos reales.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Ver documentación del Editor Estático →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Inicio de Proyectos React y Vue Directamente en el Navegador',
        description: 'Desarrolla aplicaciones modernas basadas en componentes con React 18 y Vue 3 dentro de GB Coder sin instalar Node.js ni npm en tu equipo.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Frontend'],
        intro: 'El desarrollo frontend moderno suele exigir la instalación local de Node.js y la gestión de dependencias complejas. Con la IDE avanzada WebContainer de GB Coder puedes ejecutar procesos genuinos de Node.js y servidores de desarrollo Vite dentro de una pestaña del navegador.',
        sections: [
          {
            heading: '1. Arquitectura de Plantillas React 18',
            body: 'Al iniciar un proyecto React 18 desde la galería de plantillas, GB Coder genera una estructura limpia con package.json, vite.config.ts y App.tsx con soporte completo para autocompletado en Monaco.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';

export function App() {
  const [metricas, setMetricas] = useState({ peticiones: 120, latencia: 42 });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Panel de Control</h1>
      <p>Peticiones procesadas: {metricas.peticiones}</p>
    </main>
  );
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Compilación de Componentes Vue 3 (.vue)',
            body: 'Las plantillas de Vue 3 compilan archivos .vue en la memoria del navegador usando @vue/compiler-sfc. Puedes utilizar la Composition API con <script setup> y estilos encapsulados.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div class="vue-card">
    <h2>{{ mensaje }}</h2>
    <button @click="contador++">Contador: {{ contador }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const mensaje = ref('Vue 3 en GB Coder');
const contador = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. Ejecución de Comandos en la Terminal xterm.js',
            body: 'Abre la terminal integrada presionando Ctrl+` para ejecutar npm install, correr scripts de prueba o compilar versiones de producción directamente en el micro-SO WebContainer.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Ver documentación de Frameworks →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Importación, Exportación y Copias de Seguridad de Proyectos Web',
        description: 'Conoce el modelo de persistencia local-first en IndexedDB de GB Coder, la verificación de integridad por SHA-256 y cómo respaldar tu código.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Seguridad', 'Portabilidad', 'Backups'],
        intro: 'Una duda recurrente en los editores web es la durabilidad del código al limpiar la caché del navegador. GB Coder resuelve esto combinando almacenamiento local en IndexedDB con un sistema de exportación y restauración en archivos ZIP con verificación de integridad.',
        sections: [
          {
            heading: '1. Funcionamiento del Almacenamiento Local-First',
            body: 'A diferencia de plataformas en la nube que guardan tu código en servidores de terceros, GB Coder almacena todos los archivos localmente en la base de datos IndexedDB gb-coder-projects-db de tu navegador, garantizando privacidad total.',
          },
          {
            heading: '2. Exportación a Archivos ZIP con Hash SHA-256',
            body: 'Al exportar un proyecto, el sistema genera un archivo ZIP estándar calculando una suma de comprobación SHA-256 para garantizar que los archivos no se corrompan.',
            codeSnippet: `// Manifest de verificación en el ZIP
{
  "projectId": "proj-98214",
  "name": "Dashboard-Component",
  "exportedAt": "2026-10-15T12:00:00.000Z",
  "integrityAlgorithm": "SHA-256"
}`,
            codeLang: 'json',
          },
          {
            heading: '3. Restauración Segura de Proyectos',
            body: 'Para restaurar un proyecto arrastra el archivo ZIP al panel de control. El motor valida las rutas para evitar vulnerabilidades de escape de directorio y restaura el espacio de trabajo en IndexedDB.',
          },
          {
            heading: '4. Recomendaciones para el Respaldo a Largo Plazo',
            body: 'Recomendamos exportar copias ZIP tras finalizar cambios importantes. Los archivos exportados son estándar y pueden abrirse directamente en VS Code de escritorio.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Ver documentación de Copias de Seguridad →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'Cómo funciona GB Coder: guía completa del IDE web',
        description: 'Un recorrido completo por GB Coder: vista previa HTML/CSS/JS, editor Monaco, Node.js en el navegador, IA opcional, GitHub, copias y despliegue.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'IDE en el navegador', 'Desarrollo web', 'Herramientas', 'Guía de producto'],
        intro: 'La mayoría de las ideas web se quedan atascadas antes de la primera línea de código. Hace falta un entorno de ejecución, un gestor de paquetes, un empaquetador, un editor configurado y una estructura de carpetas antes de que aparezca un solo botón en pantalla. GB Coder, creado por LadeStack, elimina ese recorrido previo. Se abre como un entorno de desarrollo completo dentro de una pestaña del navegador, guarda los proyectos en tu propio dispositivo y escala desde un experimento HTML de tres paneles hasta una aplicación Node.js con terminal. Esta guía explica cómo funciona el producto, para qué sirven sus dos modos de edición y cómo encajan las distintas funciones. Cuando una capacidad depende de una API del navegador o de una cuenta externa, esa dependencia se indica con claridad.',
        sections: [
          {
            heading: '1. Dos motores bajo un mismo espacio de trabajo',
            body: 'La mejor forma de entender GB Coder es imaginarlo como dos entornos que comparten una misma interfaz. El Editor Estático es un banco de trabajo centrado en HTML, CSS y JavaScript: escribes, la vista previa se actualiza y no hay ningún paso de compilación en medio. El IDE Avanzado ejecuta una cadena de herramientas real de Node.js mediante WebContainer, un entorno basado en WebAssembly que se ejecuta dentro de la pestaña. Ambos modos utilizan el mismo panel de proyectos, editor Monaco, explorador de archivos, panel de vista previa y almacenamiento local, así que pasar de uno a otro se siente como cambiar de herramienta, no de producto. Elige el modo estático para una página de inicio, un experimento de CSS, una demostración didáctica o un script pequeño. Elige el modo avanzado cuando necesites paquetes de npm, un servidor de desarrollo Vite, compilación de JSX o una terminal. El entorno avanzado requiere un navegador moderno con SharedArrayBuffer y aislamiento entre orígenes; los navegadores actuales basados en Chromium y Firefox son las opciones prácticas. Nada se ejecuta en una máquina virtual remota.',
          },
          {
            heading: '2. Crear un proyecto en menos de un minuto',
            body: 'El punto de entrada es el Panel de Proyectos. Al seleccionar Nuevo Proyecto puedes elegir un espacio estático en blanco, una plantilla React 18, una plantilla Vue 3 o un entorno Node.js con WebContainer. La galería de plantillas añade páginas de inicio, paneles, aplicaciones de utilidades y prototipos de componentes, cada uno con una estructura de archivos coherente ya preparada. El nuevo espacio se crea de inmediato en IndexedDB, la capa de almacenamiento transaccional del navegador, de modo que la primera vista previa está disponible sin descargas, sin cuenta y sin una ida y vuelta al servidor. Los nombres de proyectos y las carpetas son tuyos para organizarlos, y cada espacio está aislado de los demás. El trabajo existente puede entrar mediante un archivo ZIP o un repositorio de GitHub, y ambos pasan por una revisión antes de aplicar los archivos. Si nunca has usado el producto, esto es todo el proceso de inicio: abrir el panel, elegir un punto de partida y empezar a editar.',
          },
          {
            heading: '3. El editor estático y el ciclo de respuesta inmediata',
            body: 'El Editor Estático divide el espacio de trabajo en paneles de HTML, CSS y JavaScript. GB Coder envuelve el marcado en un documento compatible con los estándares, así que basta con un fragmento para empezar; no hay que mantener un doctype de plantilla. Los cambios se evalúan en un iframe aislado con una pequeña espera, lo que evita que un ritmo de escritura rápido sature el renderizador sin perder la sensación de inmediatez. Una consola virtual recoge la salida de log, warn, error e info junto a la vista previa, lo que permite depurar un script pequeño sin abrir las herramientas del desarrollador. Las bibliotecas externas pueden añadirse desde una CDN o mediante el Gestor de Bibliotecas Externas, con opciones conocidas como Tailwind, Bootstrap y conjuntos de iconos. Los proyectos estáticos también pueden crecer a varios archivos y carpetas con importaciones nativas de módulos ES. El compromiso es deliberado: este modo no instala paquetes ni empaqueta código, por lo que es ideal para aprender, experimentar visualmente y crear demostraciones sin dependencias, no para una aplicación grande con framework.',
          },
          {
            heading: '4. Monaco, inteligencia de lenguaje y utilidades de edición',
            body: 'Bajo la interfaz está Monaco, el motor de edición de código abierto que impulsa VS Code. Esa herencia se nota en los detalles: autocompletado con IntelliSense, documentación de tipos en línea, validación de sintaxis, emparejamiento de corchetes, edición con varios cursores y atajos configurables. TypeScript, JavaScript, HTML, CSS y JSON reciben servicios de lenguaje, así que los errores se marcan mientras escribes y no después de una compilación. El editor también admite vista dividida y visor de diferencias, útiles al comparar una revisión o revisar una propuesta de la IA. Alrededor del editor, GB Coder añade las utilidades que normalmente exigen herramientas separadas: búsqueda y reemplazo en todo el proyecto con expresiones regulares y distinción de mayúsculas, formato basado en Prettier para los principales lenguajes web, una paleta de comandos y una referencia de atajos con buscador. El guardado automático funciona de forma continua, con un indicador de estado para saber cómo está el archivo actual. Por separado son pequeñas comodidades. En conjunto eliminan el cambio de contexto que hace que los editores de navegador se sientan limitados.',
          },
          {
            heading: '5. El IDE avanzado: Node.js real en el navegador',
            body: 'El IDE Avanzado es la parte que sorprende. WebContainer proporciona un pequeño sistema operativo compilado a WebAssembly y ejecuta binarios reales de Node.js dentro de la página. Eso significa que npm install resuelve paquetes auténticos, los scripts de npx se ejecutan y un servidor de desarrollo Vite arranca en un puerto local que se redirige a la vista previa integrada. La terminal es un shell completo de xterm.js con estilos ANSI e historial de comandos, no un panel de salida simulado. Como el entorno es local a la pestaña, la instalación de paquetes y las operaciones con archivos no consumen un contenedor remoto. Las limitaciones son igual de reales: la función depende de SharedArrayBuffer y del aislamiento entre orígenes, la memoria está acotada por el navegador y los binarios nativos o las imágenes de Docker quedan fuera de su alcance. Para una aplicación React o Vue con dependencias normales de npm, sin embargo, el flujo de trabajo es el mismo que seguirías en un portátil. La diferencia es que el entorno llega con el proyecto en lugar de reconstruirse en cada máquina.',
            codeSnippet: `npm install
npm run dev
# Vite imprime una URL local; GB Coder redirige ese puerto a la vista previa`,
            codeLang: 'bash',
          },
          {
            heading: '6. Vista previa, pruebas móviles y enlaces para compartir',
            body: 'Todos los proyectos tienen vista previa, y esa vista previa es más que una miniatura estática. Se ejecuta en un iframe aislado, puede separarse en su propia ventana para una configuración de dos monitores y ofrece tamaños predefinidos para móvil, tableta y escritorio. Un código QR abre la vista previa en un teléfono real, lo que revela problemas de diseño que cambiar el tamaño de la ventana en el escritorio no muestra. Para recibir opiniones rápidas, GB Coder puede codificar un proyecto simple de un solo archivo en una URL para compartir usando el fragmento de la URL. Ese fragmento nunca llega a un servidor, así que el enlace es autónomo; la contrapartida es un límite de tamaño práctico, y los proyectos con varios archivos se rechazan en lugar de truncarse. Esos proyectos pueden compartirse como archivo ZIP o mediante el flujo del entorno de ejecución. La distinción importa: un enlace para compartir es una comodidad para una demostración pequeña, mientras que un archivo o un repositorio es la entrega duradera para trabajo real.',
          },
          {
            heading: '7. GB Assist, Build with AI y control por voz',
            body: 'La IA en GB Coder es opcional y está diseñada para revisarse. GB Assist es un panel de chat para preguntas, explicaciones de errores y cambios planificados; puede proponer ediciones de archivos, pero esas ediciones se muestran como un diff antes de aplicarse. El asistente requiere que conectes un proveedor y un modelo, y los mensajes junto con el código seleccionado se envían a ese proveedor cuando lo usas. Build with AI va en la dirección contraria: describes una interfaz en lenguaje natural y recibes un proyecto estructurado de HTML, CSS y JavaScript, validado antes de reemplazar el contenido del editor. Screenshot to Code acepta una imagen, incluida una pegada desde una herramienta de captura, y genera una primera versión del marcado y los estilos. El control por voz utiliza el reconocimiento de voz del navegador para ejecutar comandos como ejecutar, formatear, explicar, corregir, construir, exportar, abrir un panel o cambiar de archivo; Chrome y Edge ofrecen actualmente el mejor soporte, y siempre queda disponible un cuadro de comandos escritos. En las cuatro funciones el patrón es el mismo: la generación es rápida, pero la aceptación es tuya.',
          },
          {
            heading: '8. Instantáneas, copias de seguridad y sincronización con GitHub',
            body: 'Los proyectos se guardan automáticamente en IndexedDB, pero el guardado automático no es un historial de versiones. Las instantáneas crean puntos de control con nombre del estado actual del proyecto, y el visor de diferencias muestra qué cambió antes de restaurar uno. Para el trabajo que debe salir del navegador, la exportación ZIP empaqueta todo el árbol de directorios y registra un hash de integridad; la importación acepta un archivo arrastrado y muestra una vista previa estructural antes de escribir los archivos. La sincronización con GitHub cierra el círculo con un camino de ida y vuelta: conecta con un token de acceso personal, elige un repositorio existente o crea uno y luego envía o trae cambios. Los envíos se agrupan en un único commit atómico, los archivos sin cambios se omiten y una rama que se movió por debajo genera un conflicto en lugar de sobrescribir en silencio el trabajo de otra persona. Los archivos traídos pasan por el mismo flujo de revisión y aplicación que un archivo comprimido. Los tokens son solo de sesión por defecto; recordarlos en el dispositivo es una opción que los guarda cifrados, y el tráfico de GitHub va directamente del navegador a api.github.com. LadeStack no necesita custodiar la credencial.',
          },
          {
            heading: '9. Despliegue y el último tramo',
            body: 'Un proyecto no está terminado hasta que alguien puede abrirlo. GB Coder permite desplegar con un clic en Vercel y Netlify usando el token de tu propia cuenta. El servicio detecta si el proyecto es un sitio estático o una aplicación Vite, envía los archivos correspondientes y devuelve una URL pública. Como el token es tuyo, el despliegue queda en tu cuenta y puedes gestionarlo allí después. Los proyectos estáticos también pueden exportarse como ZIP y subirse a cualquier alojamiento, mientras que la sincronización con GitHub conecta el espacio de trabajo con un repositorio que puede alimentar una canalización de CI. Ninguno de estos caminos encierra el proyecto en GB Coder: los archivos siguen siendo HTML, CSS, JavaScript y configuración estándar. Esa portabilidad es el objetivo. El navegador es donde ocurre el trabajo, no donde queda atrapado.',
          },
          {
            heading: '10. Privacidad, coste y para quién es',
            body: 'GB Coder es gratuito, no exige iniciar sesión ni registrarse y no incluye publicidad. Su postura por defecto es local-first: los proyectos viven en el almacenamiento del navegador y la aplicación no necesita una cuenta de LadeStack para abrirlos. Los datos salen del dispositivo solo cuando eliges una capacidad conectada, como un proveedor de IA, la sincronización con GitHub, un despliegue o una CDN de terceros incluida en tu propio código. Esa matización importa porque local-first no significa solo sin conexión. El producto encaja con quienes aprenden y quieren ver HTML y CSS responder al instante, con docentes que necesitan un aula sin instalaciones, con desarrolladores que prototipan una interfaz antes de comprometerla a un repositorio y con cualquiera que necesite publicar rápido una utilidad o una demostración. Encaja menos con monorepos enormes, cadenas de herramientas nativas, servicios basados en Docker u organizaciones que prohíben el almacenamiento del navegador. El uso de IA puede generar cargos del proveedor que elijas, y el despliegue depende de tu plan de Vercel o Netlify. La aplicación sigue siendo gratuita; los servicios externos son tuyos para elegir.',
          },
          {
            heading: '11. Un flujo de trabajo repetible',
            body: 'Una rutina fiable es esta. Abre el Panel de Proyectos y crea un espacio en el modo que corresponda al trabajo. Construye primero la versión visible más pequeña y luego usa la consola y la vista previa para corregirla. Incorpora paquetes solo cuando el editor estático no pueda resolver el problema. Prueba con el ancho de un teléfono o escanea el código QR antes de pulir los detalles de escritorio. Toma una instantánea en cada hito relevante. Envía a GitHub o exporta un ZIP cuando el trabajo necesite un hogar duradero. Despliega cuando haya algo que merezca mostrarse. Ninguno de estos pasos requiere una instalación local, y cada uno puede repetirse en otra máquina con el mismo almacenamiento del navegador o con un clon nuevo. Si eres nuevo en el producto, empieza con un proyecto estático en blanco y un solo encabezado; la primera vista previa aparecerá antes de que hubiera terminado la configuración que antes necesitabas. El Panel de Proyectos está en /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Leer la documentación completa de GB Coder →',
      },
    },
  },
  nl: {
    metaTitle: 'Blog & Technische Gidsen — GB Coder door LadeStack',
    metaDescription: 'Praktische handleidingen voor browser-gebaseerd ontwikkelen: live preview-workflows, React en Vue in de browser en veilige IndexedDB-back-ups.',
    heroTag: 'Artikelen & Handleidingen',
    heroTitle: 'GB Coder Technische Handleidingen',
    heroDescription: 'Diepgaande en praktische artikelen over moderne webontwikkeling in je browser. Werkende voorbeelden en geverifieerde code.',
    readArticleLabel: 'Lees Volledige Gids',
    publishedOnLabel: 'Gepubliceerd op',
    byAuthorLabel: 'Door',
    relatedArticlesTitle: 'Gerelateerde Gidsen',
    backToBlogLabel: '← Terug naar Blog',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Een HTML/CSS/JavaScript Project Bouwen met Directe Live Weergave',
        description: 'Leer hoe je een interactief webcomponent bouwt in de statische editor van GB Coder met synchrone preview en virtuele console.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Prototyping'],
        intro: 'Het ontwikkelen van webinterfaces vereist vaak omslachtige lokale servers en trage compilatietools. GB Coder biedt een directe, installatievrije omgeving waarin HTML, CSS en JavaScript synchroon worden weergegeven in een afgeschermd iframe.',
        sections: [
          {
            heading: '1. Semantische HTML Schrijven',
            body: 'Begin met gestructureerde HTML in het linkerpaneel. De statische editor verpakt je invoer automatisch in een moderne HTML5-structuur.',
            codeSnippet: `<div class="interactive-card">
  <h2>Takenlijst</h2>
  <input type="text" id="taskInput" placeholder="Nieuwe taak..." />
  <button id="addBtn">Toevoegen</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Stijlen met CSS en Direct Resultaat',
            body: 'Gebruik het CSS-paneel om je component vorm te geven. De weergave wordt soepel bijgewerkt terwijl je typt.',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Functionaliteit Toevoegen met JavaScript',
            body: 'Schrijf moderne JavaScript-logica. Consoleberichten worden getoond in zowel de browserontwikkelaarstools als de ingebouwde virtuele console.',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Mobiel Testen met QR-Code',
            body: 'Koppel het weergavevenster los voor gebruik op meerdere schermen of scan de QR-code om je ontwerp direct op een smartphone te bekijken.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Lees de Statische Editor Documentatie →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Starten met React en Vue Projecten Direct in je Browser',
        description: 'Ontdek hoe je componentgedreven applicaties ontwikkelt met React 18 en Vue 3 in GB Coder zonder lokale Node.js-installatie.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Frontend'],
        intro: 'Moderne webframeworks vereisen gewoonlijk een lokale Node.js-omgeving en pakketbeheer. Dankzij de WebContainer-technologie in GB Coder draaien Vite en Node.js direct in je browsertabblad.',
        sections: [
          {
            heading: '1. React 18 Starter Projecten',
            body: 'Kies een React 18 starter uit de galerij om direct te werken met TSX-bestanden en volledige IntelliSense in Monaco.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Vue 3 Single-File Components',
            body: 'Schrijf .vue-bestanden met <script setup> en stijlen die direct in het browsergeheugen worden gecompileerd door de officiële Vue-compiler.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>Vue 3 in GB Coder</h2>
    <button @click="val++">Teller: {{ val }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const val = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. Terminalcommando’s Uitvoeren',
            body: 'Gebruik de ingebouwde xterm.js-terminal om npm-pakketten te installeren en ontwikkelservers te starten.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Lees de Framework Documentatie →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Projecten Importeren, Exporteren en Back-uppen in de Browser',
        description: 'Lees alles over het lokale IndexedDB-opslagmodel van GB Coder, SHA-256 archiefvalidatie en gegevensbescherming.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Beveiliging', 'Backups'],
        intro: 'Gegevensbescherming is essentieel bij browserapplicaties. GB Coder combineert veilige lokale opslag in IndexedDB met betrouwbare ZIP-export met controlegetallen.',
        sections: [
          {
            heading: '1. Local-First Opslag via IndexedDB',
            body: 'Al je code blijft veilig op je eigen computer opgeslagen in IndexedDB onder gb-coder-projects-db.',
          },
          {
            heading: '2. ZIP-Archieven met SHA-256 Validatie',
            body: 'Exporteer complete projecten naar ZIP-bestanden inclusief een SHA-256 verificatiehash.',
          },
          {
            heading: '3. Veilig Herstellen van Back-ups',
            body: 'Sleep een ZIP-bestand naar het dashboard om een project direct en veilig te herstellen.',
          },
          {
            heading: '4. Tips voor Duurzaam Bewaren',
            body: 'Maak regelmatig een export van belangrijke projecten zodat je ze altijd kunt openen in desktopprogramma’s zoals VS Code.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Lees de Back-up Documentatie →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'Hoe GB Coder werkt: complete gids voor de browser-IDE',
        description: 'Een complete rondleiding door GB Coder: directe HTML/CSS/JS-preview, Monaco, Node.js in de browser, optionele AI, GitHub-sync, back-ups en deploys.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'Browser-IDE', 'Webontwikkeling', 'Ontwikkelaarstools', 'Productgids'],
        intro: 'De meeste webideeën stranden voordat de eerste regel code is geschreven. Je hebt een runtime, een pakketbeheerder, een bundler, een ingerichte editor en een mappenstructuur nodig voordat er één knop op het scherm staat. GB Coder, gemaakt door LadeStack, haalt die aanloop weg. Het opent als een complete ontwikkelomgeving in een browsertab, bewaart projecten op je eigen apparaat en groeit mee van een HTML-experiment met drie panelen tot een Node.js-applicatie met terminal. Deze gids legt uit hoe het product werkt, waar de twee editormodi voor dienen en hoe de afzonderlijke functies samenhangen. Waar een mogelijkheid afhankelijk is van een browser-API of een extern account, staat die afhankelijkheid duidelijk vermeld.',
        sections: [
          {
            heading: '1. Twee motoren in één werkruimte',
            body: 'GB Coder kun je het beste zien als twee omgevingen die één schil delen. De Statische Editor is een gerichte werkbank voor HTML, CSS en JavaScript: je typt, de preview wordt bijgewerkt en er zit geen buildstap tussen. De Geavanceerde IDE draait een echte Node.js-toolchain via WebContainer, een op WebAssembly gebaseerde runtime die binnen de browsertab draait. Beide modi gebruiken hetzelfde projectdashboard, dezelfde Monaco-editor, bestandsverkenner, previewpaneel en lokale opslaglaag, zodat wisselen aanvoelt als een andere tool kiezen en niet als een ander product. Kies de statische modus voor een landingspagina, een CSS-experiment, een lesdemo of een klein script. Kies de geavanceerde modus wanneer je npm-pakketten, een Vite-ontwikkelserver, JSX-compilatie of een terminal nodig hebt. De geavanceerde runtime vereist een moderne browser met SharedArrayBuffer en cross-origin isolation; de huidige Chromium-browsers en Firefox zijn de praktische keuzes. Er draait niets op een externe virtuele machine.',
          },
          {
            heading: '2. Een project starten in minder dan een minuut',
            body: 'Het startpunt is het Projectdashboard. Bij Nieuw Project kies je een leeg statisch sandbox-project, een React 18-starter, een Vue 3-starter of een Node.js-omgeving met WebContainer. De sjablonengalerij voegt landingspagina’s, dashboards, hulpprogramma’s en componentprototypes toe, elk met een verstandige bestandsstructuur die al klaarstaat. Een nieuwe werkruimte wordt onmiddellijk aangemaakt in IndexedDB, de transactionele opslaglaag van de browser, zodat de eerste preview beschikbaar is zonder download, account of rondreis naar een server. Projectnamen en mappen beheer je zelf, en elke werkruimte staat los van de andere. Bestaand werk komt binnen via een ZIP-archief of een GitHub-repository; beide gaan door een controle voordat bestanden worden toegepast. Heb je het product nog nooit gebruikt, dan is dit de hele onboarding: dashboard openen, startpunt kiezen en beginnen met bewerken.',
          },
          {
            heading: '3. De statische editor en de directe feedbacklus',
            body: 'De Statische Editor verdeelt de werkruimte in panelen voor HTML, CSS en JavaScript. GB Coder wikkelt de opmaak in een document dat aan de standaarden voldoet, dus een fragment is genoeg om te beginnen; je hoeft geen doctype-sjabloon te onderhouden. Wijzigingen worden geëvalueerd in een afgeschermde iframe met een korte wachttijd, zodat een snel typtempo de renderer niet overspoelt en het toch direct aanvoelt. Een virtuele console vangt log-, warn-, error- en info-uitvoer op naast de preview, waardoor je een klein script kunt debuggen zonder de ontwikkelaarstools te openen. Externe bibliotheken voeg je toe via een CDN of via de Externe Bibliotheken-beheerder, met bekende opties zoals Tailwind, Bootstrap en iconensets. Statische projecten kunnen ook uitgroeien tot meerdere bestanden en mappen met native ES-module-imports. De afweging is bewust: deze modus installeert geen pakketten en bundelt niets, dus hij is ideaal voor leren, visuele experimenten en demo’s zonder dependencies, niet voor een grote framework-applicatie.',
          },
          {
            heading: '4. Monaco, taalintelligentie en dagelijkse hulpmiddelen',
            body: 'Onder de interface zit Monaco, de opensource-editor-engine achter VS Code. Die afkomst zie je terug in de details: IntelliSense-aanvullingen, inline typedocumentatie, syntaxvalidatie, haakjesmatchen, bewerken met meerdere cursors en configureerbare sneltoetsen. TypeScript, JavaScript, HTML, CSS en JSON krijgen taaldiensten, zodat fouten worden gemarkeerd terwijl je typt en niet pas na een build. De editor ondersteunt ook een gesplitste weergave en een diff-viewer, handig bij het vergelijken van een revisie of het beoordelen van een AI-voorstel. Rond de editor voegt GB Coder de hulpmiddelen toe die normaal aparte tools vereisen: zoeken en vervangen in het hele project met reguliere expressies en hoofdlettergevoeligheid, opmaak op basis van Prettier voor de belangrijkste webtalen, een commandopalet en een doorzoekbare sneltoetsenlijst. Automatisch opslaan loopt continu, met een statusindicator zodat je weet hoe het huidige bestand ervoor staat. Los zijn het kleine gemakken. Samen nemen ze het wisselen van context weg waardoor browsereditors beperkt aanvoelen.',
          },
          {
            heading: '5. De geavanceerde IDE: echte Node.js in de browser',
            body: 'De Geavanceerde IDE is het onderdeel dat mensen verrast. WebContainer levert een klein besturingssysteem dat naar WebAssembly is gecompileerd en draait echte Node.js-binary’s in de pagina. Dat betekent dat npm install echte pakketten resolveert, npx-scripts worden uitgevoerd en een Vite-ontwikkelserver start op een lokale poort die naar de ingebouwde preview wordt doorgestuurd. De terminal is een volledige xterm.js-shell met ANSI-opmaak en opdrachtgeschiedenis, geen gesimuleerd uitvoervenster. Omdat de runtime lokaal in de tab draait, verbruiken pakketinstallaties en bestandsbewerkingen geen externe container. De beperkingen zijn net zo echt: de functie leunt op SharedArrayBuffer en cross-origin isolation, het geheugen wordt door de browser begrensd en native binary’s of Docker-images vallen buiten de scope. Voor een React- of Vue-applicatie met gewone npm-dependencies is de werkwijze echter dezelfde als op een laptop. Het verschil is dat de omgeving met het project meekomt in plaats van op elke machine opnieuw te worden opgebouwd.',
            codeSnippet: `npm install
npm run dev
# Vite print een lokale URL; GB Coder stuurt die poort door naar de preview`,
            codeLang: 'bash',
          },
          {
            heading: '6. Preview, mobiel testen en delen',
            body: 'Elk project heeft een preview, en die preview is meer dan een statische miniatuur. Hij draait in een afgeschermde iframe, kan in een eigen venster worden losgekoppeld voor een opstelling met twee monitoren en biedt viewportformaten voor telefoon, tablet en desktop. Een QR-code opent de preview op een echte telefoon, wat layoutproblemen aan het licht brengt die het aanpassen van een desktopvenster mist. Voor snelle feedback kan GB Coder een eenvoudig project met één bestand in een deel-URL coderen via het URL-fragment. Dat fragment bereikt nooit een server, dus de link is zelfstandig; de keerzijde is een praktische groottelimiet, en projecten met meerdere bestanden worden geweigerd in plaats van afgekapt. Die projecten deel je als ZIP-archief of via de sandbox-workflow. Het onderscheid is belangrijk: een deel-link is een gemak voor een kleine demo, terwijl een archief of repository de duurzame overdracht voor echt werk is.',
          },
          {
            heading: '7. GB Assist, Build with AI en spraakbesturing',
            body: 'AI in GB Coder is optioneel en bewust beoordeelbaar. GB Assist is een chatpaneel voor vragen, uitleg bij fouten en geplande wijzigingen; het kan bestandsbewerkingen voorstellen, maar die worden als diff getoond voordat er iets wordt toegepast. De assistent vereist dat je een provider en model verbindt, en prompts plus geselecteerde code worden naar die provider gestuurd wanneer je hem gebruikt. Build with AI gaat de andere kant op: je beschrijft een interface in gewone taal en krijgt een gestructureerd HTML-, CSS- en JavaScript-project terug, gevalideerd voordat het de inhoud van de editor vervangt. Screenshot to Code accepteert een afbeelding, ook een die je vanuit een knipselprogramma plakt, en genereert een eerste versie van de opmaak en stijlen. Spraakbesturing gebruikt de spraakherkenning van de browser voor opdrachten zoals uitvoeren, formatteren, uitleggen, repareren, bouwen, exporteren, een paneel openen of van bestand wisselen; Chrome en Edge bieden momenteel de beste ondersteuning, en een tekstvak voor getypte opdrachten blijft beschikbaar. Bij alle vier functies geldt hetzelfde patroon: genereren gaat snel, maar accepteren is aan jou.',
          },
          {
            heading: '8. Snapshots, back-ups en GitHub-synchronisatie',
            body: 'Projecten worden automatisch opgeslagen in IndexedDB, maar automatisch opslaan is geen versiegeschiedenis. Snapshots maken benoemde controlepunten van de huidige projectstatus, en de diff-viewer laat zien wat er is veranderd voordat je er een herstelt. Voor werk dat de browser moet verlaten, verpakt ZIP-export de volledige mappenstructuur en registreert een integriteitshash; import accepteert een gesleept archief en toont een structurele preview voordat bestanden worden geschreven. GitHub-synchronisatie sluit de cirkel met een tweerichtingsroute: verbind met een persoonlijke toegangstoken, kies een bestaande repository of maak er een en push of pull vervolgens. Pushes worden als één atomische commit opgebouwd, ongewijzigde bestanden worden overgeslagen en een branch die ondertussen is verschoven levert een conflict op in plaats van stil andermans werk te overschrijven. Opgehaalde bestanden gaan door dezelfde controle-en-toepassen-stroom als een archief. Tokens leven standaard alleen in de sessie; ze op het apparaat onthouden is een opt-in die ze versleuteld opslaat, en GitHub-verkeer gaat rechtstreeks van de browser naar api.github.com. LadeStack hoeft de credential niet te bewaren.',
          },
          {
            heading: '9. Deployment en de laatste stap',
            body: 'Een project is pas af wanneer iemand het kan openen. GB Coder ondersteunt deployment met één klik naar Vercel en Netlify met het token van je eigen account. De dienst herkent of het project een statische site of een Vite-applicatie is, stuurt de juiste bestanden en geeft een live URL terug. Omdat het token van jou is, komt de deployment in jouw account terecht en beheer je hem daar verder. Statische projecten kun je ook als ZIP exporteren en naar elke host uploaden, terwijl GitHub-synchronisatie de werkruimte verbindt met een repository die een CI-pijplijn kan aansturen. Geen van deze routes sluit het project op in GB Coder: de bestanden blijven standaard HTML, CSS, JavaScript en configuratie. Die overdraagbaarheid is het punt. De browser is waar het werk gebeurt, niet waar het gevangen zit.',
          },
          {
            heading: '10. Privacy, kosten en voor wie het bedoeld is',
            body: 'GB Coder is gratis, vereist geen login of registratie en bevat geen advertenties. De standaardhouding is local-first: projecten staan in de browseropslag en de applicatie heeft geen LadeStack-account nodig om ze te openen. Gegevens verlaten het apparaat alleen wanneer je een verbonden mogelijkheid kiest, zoals een AI-provider, GitHub-synchronisatie, deployment of een externe CDN in je eigen code. Die nuance is belangrijk, want local-first betekent niet alleen offline. Het product past bij lerenden die HTML en CSS meteen willen zien reageren, docenten die een klaslokaal zonder installatie nodig hebben, ontwikkelaars die een interface prototypen voordat ze die aan een repository toevertrouwen, en iedereen die snel een klein hulpprogramma of demo online wil zetten. Het is minder geschikt voor enorme monorepo’s, native toolchains, Docker-services of organisaties die browseropslag verbieden. AI-gebruik kan kosten van je gekozen provider met zich meebrengen, en deployment valt onder je Vercel- of Netlify-abonnement. De applicatie zelf blijft gratis; de externe diensten kies je zelf.',
          },
          {
            heading: '11. Een werkwijze die je kunt herhalen',
            body: 'Een betrouwbare routine ziet er zo uit. Open het Projectdashboard en maak een werkruimte in de modus die bij de taak past. Bouw eerst de kleinste zichtbare versie en gebruik daarna de console en preview om die te corrigeren. Voeg pas pakketten toe wanneer de statische editor het echt niet kan oplossen. Test op telefoonbreedte of scan de QR-code voordat je desktopdetails gaat verfijnen. Maak bij elke betekenisvolle mijlpaal een snapshot. Push naar GitHub of exporteer een ZIP wanneer het werk een duurzame plek nodig heeft. Deploy wanneer er iets is dat het tonen waard is. Geen van deze stappen vereist een lokale installatie, en elke stap is op een andere machine te herhalen met dezelfde browseropslag of een nieuwe clone. Ben je nieuw met het product, begin dan met een leeg statisch project en één kop. De eerste preview staat op het scherm voordat de installatie die je vroeger nodig had klaar zou zijn. Het Projectdashboard vind je op /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lees de volledige GB Coder-documentatie →',
      },
    },
  },
  fr: {
    metaTitle: 'Blog & Guides Techniques — GB Coder par LadeStack',
    metaDescription: 'Guides pratiques pour le développement web dans le navigateur : workflows d’aperçu en direct, architectures React et Vue, et sauvegardes IndexedDB sécurisées.',
    heroTag: 'Ingénierie & Tutoriels',
    heroTitle: 'Guides Techniques et Tutoriels GB Coder',
    heroDescription: 'Des tutoriels complets et pratiques pour concevoir des applications web directement dans votre navigateur. Exemples vérifiés et astuces d’architecture.',
    readArticleLabel: 'Lire le Guide Complet',
    publishedOnLabel: 'Publié le',
    byAuthorLabel: 'Par',
    relatedArticlesTitle: 'Guides Techniques Recommandés',
    backToBlogLabel: '← Retour au Blog',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Créer un Projet HTML/CSS/JavaScript avec Aperçu en Temps Réel',
        description: 'Apprenez à développer un composant web interactif avec l’éditeur statique de GB Coder, la synchronisation DOM instantanée et la console virtuelle.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Prototypage'],
        intro: 'Le prototypage web moderne est souvent freiné par la lenteur de configuration des serveurs locaux et des bundlers. GB Coder élimine ces contraintes grâce à un environnement sans installation qui synchronise votre code dans un iframe sécurisé.',
        sections: [
          {
            heading: '1. Structurer un HTML Sémantique',
            body: 'Rédigez un code accessible dans le volet HTML. L’éditeur intègre automatiquement votre balisage dans un document HTML5 conforme.',
            codeSnippet: `<div class="interactive-card">
  <h2>Gestionnaire de Tâches</h2>
  <input type="text" id="taskInput" placeholder="Nouvelle tâche..." />
  <button id="addBtn">Ajouter</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Styliser en CSS avec Rendu Instantané',
            body: 'Appliquez vos styles CSS dans le volet dédié. L’aperçu se met à jour immédiatement tout en préservant le défilement.',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Ajouter la Logique JavaScript ES2024',
            body: 'Programmez votre logique en JavaScript. Les messages console sont capturés dans la console virtuelle intégrée.',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Test sur Mobile et Fenêtre Détachable',
            body: 'Détachez la prévisualisation dans une fenêtre séparée pour un poste multi-écrans ou scannez le QR code pour tester sur smartphone.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Consulter la documentation de l’Éditeur Statique →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Démarrer des Projets React et Vue Directement dans le Navigateur',
        description: 'Découvrez comment créer des applications modulaires avec React 18 et Vue 3 dans GB Coder sans installer Node.js sur votre machine.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Frontend'],
        intro: 'Développer avec des frameworks modernes nécessite d’ordinaire une installation lourde de Node.js et de nombreux paquets npm. Avec l’IDE avancé WebContainer de GB Coder, Node.js et Vite s’exécutent directement dans votre onglet.',
        sections: [
          {
            heading: '1. Architecture React 18 dans le Navigateur',
            body: 'Créez un projet React 18 depuis la galerie pour bénéficier d’une arborescence complète avec TSX et autocomplétion Monaco.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [val, setVal] = useState(0);
  return <button onClick={() => setVal(val + 1)}>Compteur : {val}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Compilation des Composants Vue 3 (.vue)',
            body: 'Les modèles Vue 3 compilent les fichiers .vue directement dans le navigateur avec la Composition API et le scoped CSS.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>Vue 3 dans GB Coder</h2>
    <button @click="c++">Clics : {{ c }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const c = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. Commandes Terminal avec xterm.js',
            body: 'Ouvrez le terminal avec Ctrl+` pour installer des dépendances npm ou lancer vos scripts de test.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Consulter la documentation des Frameworks →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Importer, Exporter et Sauvegarder vos Projets Web en Toute Sécurité',
        description: 'Comprendre l’architecture de stockage local IndexedDB de GB Coder, la vérification d’intégrité SHA-256 et la sauvegarde des données.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Sécurité', 'Sauvegardes'],
        intro: 'La sécurité des données est au cœur de GB Coder. Nous combinons la persistance locale dans IndexedDB avec un système d’exportation ZIP certifié par empreinte SHA-256.',
        sections: [
          {
            heading: '1. Fonctionnement du Stockage Local-First',
            body: 'Vos projets sont conservés sur votre propre ordinateur dans IndexedDB, garantissant une confidentialité totale.',
          },
          {
            heading: '2. Exportation ZIP avec Empreinte SHA-256',
            body: 'Téléchargez vos projets sous forme d’archives ZIP vérifiables contenant un manifeste d’intégrité.',
          },
          {
            heading: '3. Restauration Simplifiée',
            body: 'Glissez-déposez une archive ZIP sur le tableau de bord pour restaurer instantanément votre espace de travail.',
          },
          {
            heading: '4. Bonnes Pratiques d’Archivage',
            body: 'Exportez régulièrement vos projets importants pour pouvoir les exploiter plus tard dans VS Code de bureau ou Git.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Consulter la documentation des Sauvegardes →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'Comment fonctionne GB Coder : guide complet de l’IDE web',
        description: 'Un tour complet de GB Coder : aperçu HTML/CSS/JS instantané, Monaco, Node.js dans le navigateur, IA optionnelle, GitHub, sauvegardes et déploiement.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'IDE navigateur', 'Développement web', 'Outils', 'Guide produit'],
        intro: 'La plupart des idées web s’arrêtent avant la première ligne de code. Il faut un environnement d’exécution, un gestionnaire de paquets, un bundler, un éditeur configuré et une arborescence de dossiers avant qu’un seul bouton n’apparaisse à l’écran. GB Coder, créé par LadeStack, supprime ce préambule. Il s’ouvre comme un environnement de développement complet dans un onglet du navigateur, conserve les projets sur votre propre appareil et passe d’une expérience HTML à trois panneaux à une application Node.js avec terminal. Ce guide explique le fonctionnement du produit, l’usage de ses deux modes d’édition et la manière dont les fonctionnalités s’articulent. Lorsqu’une capacité dépend d’une API du navigateur ou d’un compte externe, cette dépendance est clairement indiquée.',
        sections: [
          {
            heading: '1. Deux moteurs dans un même espace de travail',
            body: 'Le plus simple est de voir GB Coder comme deux environnements qui partagent une même interface. L’Éditeur Statique est un atelier consacré au HTML, au CSS et au JavaScript : vous tapez, l’aperçu se met à jour et aucune étape de compilation ne s’intercale. L’IDE Avancé exécute une véritable chaîne d’outils Node.js grâce à WebContainer, un environnement basé sur WebAssembly qui tourne dans l’onglet. Les deux modes utilisent le même tableau de bord de projets, le même éditeur Monaco, l’explorateur de fichiers, le panneau d’aperçu et la couche de stockage local ; passer de l’un à l’autre revient donc à changer d’outil, pas de produit. Choisissez le mode statique pour une page d’accueil, une expérience CSS, une démonstration pédagogique ou un petit script. Choisissez le mode avancé lorsque vous avez besoin de paquets npm, d’un serveur de développement Vite, de la compilation JSX ou d’un terminal. L’environnement avancé exige un navigateur moderne compatible avec SharedArrayBuffer et l’isolation cross-origin ; les navigateurs Chromium actuels et Firefox constituent les choix pratiques. Rien ne s’exécute sur une machine virtuelle distante.',
          },
          {
            heading: '2. Créer un projet en moins d’une minute',
            body: 'Le point d’entrée est le Tableau de bord des projets. En choisissant Nouveau projet, vous obtenez un bac à sable statique vide, un modèle React 18, un modèle Vue 3 ou un environnement Node.js avec WebContainer. La galerie de modèles ajoute des pages d’accueil, des tableaux de bord, des applications utilitaires et des prototypes de composants, chacun avec une structure de fichiers cohérente déjà en place. Le nouvel espace est créé immédiatement dans IndexedDB, la couche de stockage transactionnel du navigateur : le premier aperçu est donc disponible sans téléchargement, sans compte et sans aller-retour vers un serveur. Les noms de projets et les dossiers vous appartiennent, et chaque espace est isolé des autres. Un travail existant peut entrer par une archive ZIP ou un dépôt GitHub, tous deux passant par une étape de vérification avant l’application des fichiers. Si vous découvrez le produit, voilà toute l’intégration : ouvrir le tableau de bord, choisir un point de départ et commencer à modifier.',
          },
          {
            heading: '3. L’éditeur statique et la boucle de retour immédiat',
            body: 'L’Éditeur Statique divise l’espace de travail en panneaux HTML, CSS et JavaScript. GB Coder enveloppe le balisage dans un document conforme aux standards, si bien qu’un fragment suffit pour commencer ; aucun doctype de modèle n’est à maintenir. Les modifications sont évaluées dans une iframe isolée avec un léger délai, ce qui évite de saturer le moteur de rendu pendant une frappe rapide tout en conservant une impression d’immédiateté. Une console virtuelle recueille les sorties log, warn, error et info à côté de l’aperçu, ce qui permet de déboguer un petit script sans ouvrir les outils de développement. Les bibliothèques externes s’ajoutent depuis un CDN ou via le Gestionnaire de bibliothèques externes, avec des options connues comme Tailwind, Bootstrap et des jeux d’icônes. Les projets statiques peuvent aussi s’étendre à plusieurs fichiers et dossiers avec les imports natifs de modules ES. Le compromis est assumé : ce mode n’installe aucun paquet et ne regroupe rien, il convient donc à l’apprentissage, aux expérimentations visuelles et aux démonstrations sans dépendances, pas à une grande application framework.',
          },
          {
            heading: '4. Monaco, intelligence du langage et outils d’édition',
            body: 'Sous l’interface se trouve Monaco, le moteur d’édition open source qui fait fonctionner VS Code. Cet héritage se voit dans les détails : complétions IntelliSense, documentation de types en ligne, validation syntaxique, correspondance des parenthèses, édition multiligne et raccourcis configurables. TypeScript, JavaScript, HTML, CSS et JSON bénéficient de services de langage, si bien que les erreurs sont signalées pendant la frappe plutôt qu’après une compilation. L’éditeur prend aussi en charge la vue fractionnée et le comparateur de différences, utiles pour examiner une révision ou une proposition de l’IA. Autour de l’éditeur, GB Coder ajoute les outils qui exigent habituellement des applications séparées : recherche et remplacement dans tout le projet avec expressions régulières et sensibilité à la casse, formatage basé sur Prettier pour les principaux langages web, palette de commandes et référence de raccourcis avec recherche. L’enregistrement automatique fonctionne en continu, avec un indicateur d’état pour connaître la situation du fichier courant. Séparément, ce sont de petits conforts. Ensemble, ils suppriment les changements de contexte qui donnent aux éditeurs de navigateur une impression de limitation.',
          },
          {
            heading: '5. L’IDE avancé : du vrai Node.js dans le navigateur',
            body: 'L’IDE Avancé est la partie qui surprend. WebContainer fournit un petit système d’exploitation compilé en WebAssembly et exécute de véritables binaires Node.js dans la page. Ainsi, npm install résout de vrais paquets, les scripts npx s’exécutent et un serveur de développement Vite démarre sur un port local redirigé vers l’aperçu intégré. Le terminal est un véritable shell xterm.js avec styles ANSI et historique des commandes, pas un panneau de sortie simulé. Comme l’environnement est local à l’onglet, l’installation des paquets et les opérations sur les fichiers ne consomment pas de conteneur distant. Les contraintes sont tout aussi réelles : la fonction dépend de SharedArrayBuffer et de l’isolation cross-origin, la mémoire est limitée par le navigateur et les binaires natifs ou images Docker sortent de son périmètre. Pour une application React ou Vue avec des dépendances npm ordinaires, le flux de travail reste cependant celui d’un ordinateur portable. La différence, c’est que l’environnement arrive avec le projet au lieu d’être reconstruit sur chaque machine.',
            codeSnippet: `npm install
npm run dev
# Vite affiche une URL locale ; GB Coder redirige ce port vers l’aperçu`,
            codeLang: 'bash',
          },
          {
            heading: '6. Aperçu, tests mobiles et partage léger',
            body: 'Chaque projet dispose d’un aperçu, et cet aperçu est bien plus qu’une miniature statique. Il s’exécute dans une iframe isolée, peut être détaché dans sa propre fenêtre pour une configuration à deux écrans et propose des formats d’affichage pour téléphone, tablette et bureau. Un QR code ouvre l’aperçu sur un vrai téléphone, ce qui révèle les problèmes de mise en page que le redimensionnement d’une fenêtre de bureau ne montre pas. Pour obtenir un retour rapide, GB Coder peut encoder un projet simple à fichier unique dans une URL de partage via le fragment d’URL. Ce fragment n’atteint jamais un serveur : le lien est autonome. La contrepartie est une limite de taille pratique, et les projets multifiches sont refusés plutôt que tronqués. Ces projets se partagent sous forme d’archive ZIP ou via le flux du bac à sable. La distinction compte : un lien de partage est une commodité pour une petite démonstration, tandis qu’une archive ou un dépôt constitue la transmission durable d’un vrai travail.',
          },
          {
            heading: '7. GB Assist, Build with AI et commandes vocales',
            body: 'L’IA de GB Coder est optionnelle et conçue pour être relue. GB Assist est un panneau de discussion pour les questions, l’explication d’erreurs et les modifications envisagées ; il peut proposer des éditions de fichiers, mais celles-ci apparaissent sous forme de diff avant toute application. L’assistant exige de connecter un fournisseur et un modèle, et les messages ainsi que le code sélectionné sont envoyés à ce fournisseur lorsque vous l’utilisez. Build with AI va dans l’autre sens : vous décrivez une interface en langage courant et recevez un projet structuré HTML, CSS et JavaScript, validé avant de remplacer le contenu de l’éditeur. Screenshot to Code accepte une image, y compris collée depuis un outil de capture, et génère une première version du balisage et des styles. Les commandes vocales utilisent la reconnaissance vocale du navigateur pour lancer des actions comme exécuter, formater, expliquer, corriger, construire, exporter, ouvrir un panneau ou changer de fichier ; Chrome et Edge offrent actuellement le meilleur support, et un champ de commande écrite reste disponible. Pour ces quatre fonctions, le schéma est identique : la génération est rapide, mais l’acceptation vous revient.',
          },
          {
            heading: '8. Instantanés, sauvegardes et synchronisation GitHub',
            body: 'Les projets sont enregistrés automatiquement dans IndexedDB, mais l’enregistrement automatique ne constitue pas un historique de versions. Les instantanés créent des points de contrôle nommés de l’état courant, et le comparateur affiche les changements avant une restauration. Pour le travail qui doit quitter le navigateur, l’export ZIP emballe toute l’arborescence et enregistre un hash d’intégrité ; l’import accepte une archive déposée et montre un aperçu structurel avant d’écrire les fichiers. La synchronisation GitHub boucle le parcours avec un chemin bidirectionnel : connectez un jeton d’accès personnel, choisissez un dépôt existant ou créez-en un, puis poussez ou tirez. Les envois sont assemblés en un commit atomique unique, les fichiers inchangés sont ignorés et une branche déplacée entre-temps produit un conflit au lieu d’écraser silencieusement le travail d’autrui. Les fichiers récupérés passent par le même flux de vérification et d’application qu’une archive. Les jetons restent limités à la session par défaut ; leur mémorisation sur l’appareil est une option qui les stocke chiffrés, et le trafic GitHub va directement du navigateur à api.github.com. LadeStack n’a pas besoin de conserver l’identifiant.',
          },
          {
            heading: '9. Déploiement et dernière étape',
            body: 'Un projet n’est pas terminé tant que quelqu’un ne peut pas l’ouvrir. GB Coder permet un déploiement en un clic vers Vercel et Netlify avec le jeton de votre propre compte. Le service détecte s’il s’agit d’un site statique ou d’une application Vite, envoie les fichiers appropriés et renvoie une URL publique. Comme le jeton vous appartient, le déploiement atterrit dans votre compte et peut y être géré ensuite. Les projets statiques peuvent aussi être exportés en ZIP et envoyés vers n’importe quel hébergeur, tandis que la synchronisation GitHub relie l’espace de travail à un dépôt capable d’alimenter une chaîne d’intégration continue. Aucune de ces routes n’enferme le projet dans GB Coder : les fichiers restent du HTML, du CSS, du JavaScript et de la configuration standards. Cette portabilité est l’objectif. Le navigateur est le lieu du travail, pas sa prison.',
          },
          {
            heading: '10. Confidentialité, coût et public visé',
            body: 'GB Coder est gratuit, ne demande ni connexion ni inscription et ne contient aucune publicité. Sa posture par défaut est local-first : les projets vivent dans le stockage du navigateur et l’application n’a pas besoin d’un compte LadeStack pour les ouvrir. Les données ne quittent l’appareil que lorsque vous choisissez une capacité connectée, comme un fournisseur d’IA, la synchronisation GitHub, un déploiement ou un CDN tiers présent dans votre propre code. Cette nuance mérite d’être précisée, car local-first ne signifie pas uniquement hors ligne. Le produit convient aux apprenants qui veulent voir HTML et CSS réagir immédiatement, aux enseignants qui ont besoin d’une salle de classe sans installation, aux développeurs qui prototypent une interface avant de la confier à un dépôt, et à toute personne qui doit publier rapidement un petit utilitaire ou une démonstration. Il convient moins aux monorepos gigantesques, aux chaînes d’outils natives, aux services fondés sur Docker ou aux organisations qui interdisent le stockage du navigateur. L’usage de l’IA peut entraîner des frais chez le fournisseur choisi, et le déploiement dépend de votre offre Vercel ou Netlify. L’application reste gratuite ; les services externes restent votre choix.',
          },
          {
            heading: '11. Un flux de travail reproductible',
            body: 'Une routine fiable ressemble à ceci. Ouvrez le Tableau de bord des projets et créez un espace dans le mode adapté à la tâche. Construisez d’abord la plus petite version visible, puis utilisez la console et l’aperçu pour la corriger. N’ajoutez des paquets que lorsque l’éditeur statique ne peut réellement pas faire le travail. Testez à la largeur d’un téléphone ou scannez le QR code avant de peaufiner les détails bureau. Prenez un instantané à chaque jalon important. Poussez vers GitHub ou exportez un ZIP lorsque le travail a besoin d’un emplacement durable. Déployez lorsqu’il y a quelque chose qui mérite d’être montré. Aucune de ces étapes n’exige une installation locale, et chacune peut être répétée sur une autre machine avec le même stockage de navigateur ou un nouveau clone. Si vous découvrez le produit, commencez par un projet statique vide et un seul titre ; le premier aperçu apparaîtra avant même que l’installation autrefois nécessaire n’ait eu le temps de se terminer. Le Tableau de bord des projets se trouve à l’adresse /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lire la documentation complète de GB Coder →',
      },
    },
  },
  ja: {
    metaTitle: 'ブログ＆技術ガイド — GB Coder by LadeStack',
    metaDescription: 'ブラウザ完結型開発の実践ガイド：ライブプレビュー、React/VueブラウザIDEアーキテクチャ、IndexedDBによる安全なローカルバックアップ。',
    heroTag: 'エンジニアリング＆チュートリアル',
    heroTitle: 'GB Coder 技術ガイド＆チュートリアル',
    heroDescription: 'ブラウザ上での最新Web開発を深掘りする実践的な技術記事。検証済みのコード例とアーキテクチャの解説をお届けします。',
    readArticleLabel: '記事を読む',
    publishedOnLabel: '公開日:',
    byAuthorLabel: '著者:',
    relatedArticlesTitle: 'おすすめの技術ガイド',
    backToBlogLabel: '← ブログ一覧に戻る',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: '即時同期プレビューで構築するHTML/CSS/JavaScriptプロジェクト',
        description: 'GB Coderのスタティックエディター、リアルタイムDOM同期、仮想コンソールを活用したWebコンポーネント開発の基本を学びます。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'プロトタイピング'],
        intro: 'Web開発のプロトタイプ検証では、ローカルサーバーの起動やバンドル設定に時間が取られがちです。GB Coderは環境構築不要で、HTML、CSS、JavaScriptを安全なiframe内に瞬時に同期・実行する環境を提供します。',
        sections: [
          {
            heading: '1. セマンティックHTMLの記述',
            body: 'HTMLペインに記述したコードは自動的に適切なHTML5文書構造内に配置されるため、必要なマークアップに集中して作業できます。',
            codeSnippet: `<div class="interactive-card">
  <h2>タスク管理</h2>
  <input type="text" id="taskInput" placeholder="新しいタスクを入力..." />
  <button id="addBtn">追加</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. CSSによる即時スタイリング',
            body: 'CSSペインに入力したスタイルはタイピングと同時にプレビューへ反映され、スクロール位置や入力フォーカスも保持されます。',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. JavaScriptによる動的処理とコンソール確認',
            body: 'ES2024仕様のJavaScriptを記述可能。console.logなどの出力は、エディター下部の仮想コンソールにリアルタイムで表示されます。',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. 別ウィンドウ表示とQRコードでの実機テスト',
            body: 'ツールバーの「ポップアウト」をクリックして別ウィンドウに表示したり、QRコードをスマートフォンで読み取って実機確認が可能です。',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'スタティックエディターのドキュメントを読む →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'ブラウザ上で直接始めるReact＆Vueプロジェクト開発',
        description: 'PCへのNode.jsインストール不要で、React 18およびVue 3コンポーネントをGB Coder上で開発する方法を解説します。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'フロントエンド'],
        intro: '従来フロントエンド開発にはNode.jsのセットアップやnpmパッケージの管理が必須でした。GB CoderのWebContainer IDEなら、ブラウザの1タブ内で本格的なNode.jsとVite開発サーバーが稼働します。',
        sections: [
          {
            heading: '1. React 18 スターターの構造',
            body: 'テンプレートギャラリーからReact 18プロジェクトを選択すると、TSXサポートやMonacoのコード補完を備えた標準構成が瞬時に用意されます。',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [val, setVal] = useState(0);
  return <button onClick={() => setVal(val + 1)}>クリック数: {val}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Vue 3 単一ファイルコンポーネントの高速コンパイル',
            body: 'Vue 3テンプレートでは、@vue/compiler-sfcにより.vueファイルがブラウザメモリ内で直接コンパイルされます。',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>GB Coder上のVue 3</h2>
    <button @click="count++">カウント: {{ count }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. xterm.jsターミナルでのコマンド実行',
            body: 'Ctrl+`キーでターミナルを開き、npm installでのライブラリ追加やビルドスクリプトの実行を自由に行えます。',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'フレームワークのドキュメントを読む →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'ブラウザ内プロジェクトのインポート・エクスポートと安全なバックアップ',
        description: 'GB CoderのローカルファーストIndexedDB保存モデル、SHA-256整合性検証、安全なZIPバックアップ手順を詳しく解説。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'セキュリティ', 'データ保護', 'バックアップ'],
        intro: 'ブラウザ型エディターで最も重視されるデータの持続性について。GB Coderは端末内のIndexedDBとSHA-256ハッシュ検証付きZIPエクスポートを組み合わせ、強固なデータ安全性を実現しています。',
        sections: [
          {
            heading: '1. ローカルファーストIndexedDBの仕組み',
            body: '作成した全ファイルはお使いの端末のIndexedDBデータベースに保存され、外部サーバーへ勝手に送信されることはありません。',
          },
          {
            heading: '2. SHA-256ハッシュ付きZIPエクスポート',
            body: 'エクスポート時にはプロジェクト構造全体が標準ZIP形式にまとめられ、改ざんや破損を防ぐハッシュ情報が記録されます。',
          },
          {
            heading: '3. ドラッグ＆ドロップによる安全な復元',
            body: 'ZIPファイルをプロジェクトダッシュボードへドラッグ＆ドロップするだけで、ディレクトリ安全検証を経て素早く復元できます。',
          },
          {
            heading: '4. 長期保存のための推奨プラクティス',
            body: '大きな実装完了時にはZIPエクスポートを行い、ローカルストレージやデスクトップのVS Code環境と併用することをおすすめします。',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'バックアップのドキュメントを読む →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'GB Coderの仕組み：ブラウザIDE完全ガイド',
        description: 'GB Coderの全体像を解説。HTML/CSS/JSの即時プレビュー、Monaco、ブラウザー内Node.js、任意のAI、GitHub同期、バックアップ、デプロイまでを紹介します。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'ブラウザIDE', 'Web開発', '開発ツール', '製品ガイド'],
        intro: '多くのWebアイデアは、最初の1行を書く前に止まってしまいます。画面にボタンを1つ表示するまでに、ランタイム、パッケージマネージャー、バンドラー、エディターの設定、フォルダー構成が必要です。LadeStackが開発したGB Coderは、その助走を取り除きます。ブラウザーのタブの中で完全な開発環境として開き、プロジェクトを自分のデバイスに保存し、3ペインのHTML実験からターミナル付きのNode.jsアプリケーションまで対応します。このガイドでは、製品の仕組み、2つの編集モードの使い分け、各機能のつながりを説明します。ブラウザーAPIや外部アカウントに依存する機能については、その前提を明記します。',
        sections: [
          {
            heading: '1. 1つのワークスペースに2つのエンジン',
            body: 'GB Coderは、1つのシェルを共有する2つの環境と考えるとわかりやすいでしょう。静的エディターはHTML、CSS、JavaScriptに集中した作業台です。入力するとプレビューが更新され、その間にビルド処理はありません。高度なIDEは、WebContainerを通じて本物のNode.jsツールチェーンを実行します。WebContainerはWebAssemblyで動くランタイムで、ブラウザーのタブ内で動作します。どちらのモードも同じプロジェクトダッシュボード、Monacoエディター、ファイルエクスプローラー、プレビューパネル、ローカルストレージを共有するため、切り替えは製品を変えるというより道具を変える感覚に近いものです。ランディングページ、CSSの実験、授業用デモ、小さなスクリプトには静的モードを選びます。npmパッケージ、Vite開発サーバー、JSXのコンパイル、ターミナルが必要なら高度なモードを選びます。高度なランタイムにはSharedArrayBufferとクロスオリジン分離に対応した最新ブラウザーが必要で、現在のChromium系ブラウザーとFirefoxが現実的な選択肢です。処理はリモートの仮想マシンでは動きません。',
          },
          {
            heading: '2. 1分以内にプロジェクトを開始',
            body: '入口はプロジェクトダッシュボードです。新規プロジェクトを選ぶと、空の静的サンドボックス、React 18スターター、Vue 3スターター、WebContainerのNode.js環境から選べます。テンプレートギャラリーにはランディングページ、ダッシュボード、ユーティリティアプリ、コンポーネントのプロトタイプが用意され、どれも扱いやすいファイル構成があらかじめ整っています。新しいワークスペースはブラウザーのトランザクションストレージであるIndexedDBにすぐ作成されるため、ダウンロードもアカウントもサーバーとの往復もなしに最初のプレビューが始まります。プロジェクト名とフォルダーは自由に整理でき、各ワークスペースは互いに分離されています。既存の作業はZIPアーカイブまたはGitHubリポジトリから取り込め、どちらもファイルを適用する前に確認のステップを通ります。初めて使う場合のオンボーディングはこれだけです。ダッシュボードを開き、出発点を選び、編集を始めましょう。',
          },
          {
            heading: '3. 静的エディターと即時フィードバック',
            body: '静的エディターはワークスペースをHTML、CSS、JavaScriptのペインに分けます。GB Coderがマークアップを標準準拠のドキュメントシェルで包むため、断片だけで始められます。定型のdoctypeを管理する必要はありません。変更は短い待ち時間を挟んだサンドボックス化されたiframeで評価されるので、速いタイピングでレンダラーが飽和せず、それでいて即座に感じられます。仮想コンソールはlog、warn、error、infoの出力をプレビューの隣に集めるため、開発者ツールを開かずに小さなスクリプトをデバッグできます。外部ライブラリはCDNまたは外部ライブラリマネージャーから追加でき、Tailwind、Bootstrap、アイコンセットといった定番を利用できます。静的プロジェクトはネイティブのESモジュールインポートを使って複数ファイルやディレクトリに育てることもできます。このモードにはパッケージのインストールもバンドルもないという割り切りがあります。学習、視覚的な実験、依存関係のないデモには最適ですが、大規模なフレームワークアプリには向きません。',
          },
          {
            heading: '4. Monaco、言語インテリジェンス、編集ユーティリティ',
            body: 'インターフェースの下には、VS Codeを支えるオープンソースのエディターエンジンMonacoがあります。その系譜は細部に表れます。IntelliSenseによる補完、インラインの型ドキュメント、構文検証、括弧の対応、マルチカーソル編集、設定可能なキーバインドです。TypeScript、JavaScript、HTML、CSS、JSONには言語サービスが提供されるため、ミスはビルド後ではなく入力中に示されます。分割ビューと差分ビューアーも備わり、リビジョンの比較やAIの提案の確認に役立ちます。エディターの周囲には、通常は別のツールが必要になる機能も追加されています。正規表現と大文字小文字の区別に対応したプロジェクト全体の検索と置換、主要なWeb言語のPrettierベースの整形、コマンドパレット、検索できるキーボードショートカット一覧です。自動保存は常時動作し、状態インジケーターで現在のファイルの状況を確認できます。一つひとつは小さな便利機能ですが、組み合わさることでブラウザーエディターにありがちな制約感を取り除きます。',
          },
          {
            heading: '5. 高度なIDE：ブラウザー内で動く本物のNode.js',
            body: '高度なIDEは人を驚かせる部分です。WebContainerはWebAssemblyにコンパイルされた小さなオペレーティングシステムを提供し、ページ内で本物のNode.jsバイナリを実行します。つまりnpm installは実際のパッケージを解決し、npxスクリプトが動き、Vite開発サーバーがローカルポートで起動して統合プレビューに転送されます。ターミナルはANSIスタイルとコマンド履歴を備えた完全なxterm.jsシェルであり、出力を模したパネルではありません。ランタイムがタブ内にあるため、パッケージのインストールやファイル操作でリモートコンテナを消費しません。制約も現実的です。この機能はSharedArrayBufferとクロスオリジン分離に依存し、メモリはブラウザーによって制限され、ネイティブバイナリやDockerイメージは対象外です。しかし通常のnpm依存関係を持つReactやVueアプリなら、作業手順はノートPCで行う場合と同じです。違いは、環境がマシンごとに再構築されるのではなく、プロジェクトと一緒に届くことです。',
            codeSnippet: `npm install
npm run dev
# ViteがローカルURLを表示し、GB Coderがそのポートをプレビューに転送します`,
            codeLang: 'bash',
          },
          {
            heading: '6. プレビュー、モバイルテスト、軽量な共有',
            body: 'すべてのプロジェクトにプレビューがあり、それは静的なサムネイルではありません。サンドボックス化されたiframeで動作し、デュアルモニター用に独立したウィンドウへ切り離せ、スマートフォン、タブレット、デスクトップの表示幅を選べます。QRコードを使うと実際のスマートフォンでプレビューを開けるため、デスクトップのウィンドウを縮めるだけでは見落とすレイアウトの問題を発見できます。素早いフィードバックのために、GB Coderは単一ファイルのプロジェクトをURLハッシュで共有URLにエンコードできます。ハッシュはサーバーに送信されないためリンクは自己完結しますが、実用上のサイズ上限があり、複数ファイルのプロジェクトは切り詰めずに拒否されます。そのようなプロジェクトはZIPアーカイブまたはサンドボックスのワークフローで共有します。この区別は重要です。共有リンクは小さなデモのための便利機能であり、アーカイブやリポジトリは実際の仕事を確実に引き継ぐ手段です。',
          },
          {
            heading: '7. GB Assist、Build with AI、音声操作',
            body: 'GB CoderのAIは任意機能であり、確認できるように設計されています。GB Assistは質問、エラーの説明、変更計画のためのチャットパネルです。ファイル編集を提案できますが、適用前に差分として表示されます。アシスタントを使うにはプロバイダーとモデルを接続する必要があり、利用時にはプロンプトと選択したコードがそのプロバイダーに送信されます。Build with AIは逆方向の機能です。インターフェースを日常言語で説明すると、構造化されたHTML、CSS、JavaScriptのプロジェクトが返り、エディターの内容を置き換える前に検証されます。Screenshot to Codeは画像を受け取り、キャプチャツールから貼り付けたものでも、マークアップとスタイルの初稿を生成します。音声操作はブラウザーの音声認識を使い、実行、整形、説明、修正、ビルド、エクスポート、パネルを開く、ファイルを切り替えるといったコマンドを実行します。現在はChromeとEdgeが最もよく対応しており、入力式のコマンドボックスも常に利用できます。4つの機能に共通するのは、生成は速いが、採用するかどうかは自分で決めるという点です。',
          },
          {
            heading: '8. スナップショット、バックアップ、GitHub同期',
            body: 'プロジェクトはIndexedDBに自動保存されますが、自動保存はバージョン履歴ではありません。スナップショットは現在のプロジェクト状態に名前付きのチェックポイントを作り、差分ビューアーで復元前の変更を確認できます。ブラウザーの外へ出す必要がある作業には、ZIPエクスポートがディレクトリツリー全体をまとめ、整合性ハッシュを記録します。インポートはドロップされたアーカイブを受け取り、ファイルを書き込む前に構造のプレビューを表示します。GitHub同期は双方向の経路で輪を閉じます。個人アクセストークンで接続し、既存リポジトリを選ぶか新規作成して、プッシュまたはプルします。プッシュは1つのアトミックなコミットとしてまとめられ、変更のないファイルは省略され、途中で動いたブランチは他人の作業を黙って上書きせず競合として報告されます。プルしたファイルはアーカイブと同じ確認・適用フローを通ります。トークンは既定ではセッション限りで、デバイスに記憶するのは暗号化して保存するオプトインです。GitHubとの通信はブラウザーからapi.github.comへ直接行われ、LadeStackが認証情報を保持する必要はありません。',
          },
          {
            heading: '9. デプロイと最後の仕上げ',
            body: '誰かが開けるようになるまで、プロジェクトは完成しません。GB Coderは自分のアカウントのトークンを使ってVercelとNetlifyへワンクリックでデプロイできます。サービスはプロジェクトが静的サイトかViteアプリケーションかを検出し、適切なファイルを送信して公開URLを返します。トークンは自分のものなので、デプロイは自分のアカウントに作成され、その後もそこで管理できます。静的プロジェクトはZIPとして書き出して任意のホストへアップロードでき、GitHub同期を使えばCIパイプラインを動かすリポジトリにワークスペースをつなげられます。どの経路もプロジェクトをGB Coderに囲い込みません。ファイルは標準のHTML、CSS、JavaScript、設定のままです。この移植性こそが要点です。ブラウザーは作業が起きる場所であり、閉じ込められる場所ではありません。',
          },
          {
            heading: '10. プライバシー、コスト、対象ユーザー',
            body: 'GB Coderは無料で、ログインも登録も不要、広告もありません。既定の姿勢はローカルファーストです。プロジェクトはブラウザーのストレージに置かれ、開くのにLadeStackのアカウントは必要ありません。データがデバイスの外に出るのは、AIプロバイダー、GitHub同期、デプロイ、自分のコードに含めたサードパーティCDNなど、接続機能を選んだときだけです。ローカルファーストはオフライン専用ではないため、この違いは明確にしておく価値があります。HTMLとCSSの反応をすぐに見たい学習者、インストール不要の教室を必要とする教師、リポジトリに預ける前にインターフェースを試作する開発者、小さなユーティリティやデモをすぐ公開したい人に向いています。巨大なモノレポ、ネイティブツールチェーン、Dockerベースのサービス、ブラウザーストレージを禁止する組織にはあまり向きません。AIの利用には選択したプロバイダーの料金がかかる場合があり、デプロイはVercelまたはNetlifyのプランに従います。アプリケーション自体は無料のままで、外部サービスは自分で選べます。',
          },
          {
            heading: '11. 繰り返せるワークフロー',
            body: '信頼できる手順はこうです。プロジェクトダッシュボードを開き、作業に合ったモードでワークスペースを作ります。まず最小限の見える形を作り、コンソールとプレビューで修正します。静的エディターで本当に解決できない場合にだけパッケージを追加します。デスクトップの細部を磨く前に、スマートフォン幅で試すかQRコードを読み取ります。意味のある節目ごとにスナップショットを取ります。作業に永続的な置き場所が必要になったらGitHubへプッシュするかZIPを書き出します。見せる価値が生まれたらデプロイします。どの手順もローカルインストールを必要とせず、同じブラウザーストレージまたは新しいクローンがあれば別のマシンでも繰り返せます。初めてなら、空の静的プロジェクトと見出し1つから始めてください。以前必要だったセットアップが終わるより早く、最初のプレビューが画面に現れます。プロジェクトダッシュボードは/app/projectsにあります。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coderの完全なドキュメントを読む →',
      },
    },
  },
  ko: {
    metaTitle: '블로그 및 기술 가이드 — GB Coder by LadeStack',
    metaDescription: '브라우저 기반 개발을 위한 실전 엔지니어링 가이드: 실시간 미리보기, React 및 Vue 브라우저 아키텍처, IndexedDB 백업 시스템.',
    heroTag: '엔지니어링 & 튜토리얼',
    heroTitle: 'GB Coder 기술 가이드 및 튜토리얼',
    heroDescription: '브라우저에서 직접 수행하는 모던 웹 개발을 위한 심도 있는 기술 문서입니다. 검증된 코드 패턴과 아키텍처를 확인하세요.',
    readArticleLabel: '전체 가이드 읽기',
    publishedOnLabel: '게시일:',
    byAuthorLabel: '작성자:',
    relatedArticlesTitle: '관련 기술 가이드',
    backToBlogLabel: '← 블로그 목록으로 돌아가기',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: '실시간 즉각 미리보기를 활용한 HTML/CSS/JavaScript 개발',
        description: 'GB Coder의 정적 에디터, 실시간 DOM 동기화, 가상 콘솔을 활용하여 반응형 웹 컴포넌트를 제작하는 방법을 안내합니다.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', '프로토타이핑'],
        intro: '웹 인터페이스 프로토타이핑은 로컬 개발 서버와 번들러 설정으로 인해 시간이 지체되기 쉽습니다. GB Coder는 설치 없이 브라우저 탭 안에서 마크업, 스타일, 로직을 안전한 iframe에 실시간 렌더링합니다.',
        sections: [
          {
            heading: '1. 시맨틱 HTML 작성하기',
            body: 'HTML 창에 입력한 코드는 표준 HTML5 문서 템플릿에 자동 반영되어 핵심 인터페이스 구현에만 집중할 수 있습니다.',
            codeSnippet: `<div class="interactive-card">
  <h2>작업 관리자</h2>
  <input type="text" id="taskInput" placeholder="새 작업 입력..." />
  <button id="addBtn">추가</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. 반응형 CSS 스타일 즉각 반영',
            body: 'CSS 창에서 스타일을 작성하면 입력과 동시에 미리보기가 부드럽게 갱신되며 스크롤과 포커스가 유지됩니다.',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. 모던 자바스크립트 로직과 가상 콘솔',
            body: 'ES2024 자바스크립트 문법을 자유롭게 사용할 수 있으며, console 호출은 에디터 하단 가상 콘솔에 실시간 출력됩니다.',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. 독립 팝아웃 창 및 모바일 QR 코드 테스트',
            body: '팝아웃 버튼을 눌러 미리보기를 별도 창으로 분리하거나 모바일 QR 코드를 스마트폰으로 스캔하여 실기기에서 반응형을 검증하세요.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: '정적 에디터 문서 살펴보기 →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: '브라우저에서 직접 시작하는 React 및 Vue 프로젝트',
        description: '로컬 환경 설치 없이 브라우저 안에서 React 18과 Vue 3 컴포넌트를 구축하는 최신 프론트엔드 워크플로우를 소개합니다.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', '프론트엔드'],
        intro: '모던 프론트엔드 개발은 통상 Node.js 설치와 복잡한 npm 관리가 필요합니다. GB Coder의 고급 WebContainer IDE를 사용하면 브라우저 탭 내에서 순수 Node.js와 Vite 개발 서버를 즉시 구동할 수 있습니다.',
        sections: [
          {
            heading: '1. React 18 스타터 아키텍처',
            body: '템플릿 갤러리에서 React 18을 선택하면 TSX 지원과 Monaco 지능형 자동완성이 포함된 표준 프로젝트가 즉시 준비됩니다.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [clicks, setClicks] = useState(0);
  return <button onClick={() => setClicks(clicks + 1)}>클릭 수: {clicks}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Vue 3 Single-File Components (.vue) 컴파일',
            body: 'Vue 3 스타터는 브라우저 메모리에서 @vue/compiler-sfc를 통해 .vue 파일을 즉각 컴파일하여 반응형 상태를 지원합니다.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>GB Coder 속 Vue 3</h2>
    <button @click="n++">숫자: {{ n }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const n = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. xterm.js 터미널 쉘 활용',
            body: 'Ctrl+` 단축키로 터미널을 열고 npm install 명령을 실행하거나 빌드 스크립트를 제어할 수 있습니다.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: '프레임워크 문서 살펴보기 →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: '브라우저 기반 코딩 프로젝트 가져오기, 내보내기 및 백업 가이드',
        description: 'GB Coder의 로컬 우선 IndexedDB 영구 저장 방식, SHA-256 무결성 검증, 안전한 프로젝트 보존 전략을 알아봅니다.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', '보안', '데이터 보존', '백업'],
        intro: '웹 기반 IDE 사용 시 가장 중요한 것은 데이터의 영속성입니다. GB Coder는 IndexedDB 기반의 로컬 퍼스트 구조와 SHA-256 무결성 검증 ZIP 내보내기 기능을 제공합니다.',
        sections: [
          {
            heading: '1. 로컬 우선 IndexedDB 저장 원리',
            body: '모든 프로젝트 파일은 사용자 기기의 IndexedDB 데이터베이스에 안전하게 보관되며 외부 서버로 전송되지 않습니다.',
          },
          {
            heading: '2. SHA-256 검증 포함 ZIP 내보내기',
            body: '프로젝트 내보내기 시 파일 전체를 표준 ZIP 아카이브로 묶고 해시값을 계산하여 데이터 훼손을 방지합니다.',
          },
          {
            heading: '3. 드래그 앤 드롭을 통한 안전한 복원',
            body: 'ZIP 파일을 대시보드로 끌어다 놓으면 경로 보안 검사를 거쳐 작업 공간으로 온전히 복원됩니다.',
          },
          {
            heading: '4. 장기 보관을 위한 실무 팁',
            body: '주요 마일스톤 완료 시 정기적으로 ZIP 백업을 다운로드하여 데스크톱 VS Code나 Git과 연계해 관리하세요.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: '백업 문서 살펴보기 →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'GB Coder 작동 방식: 브라우저 IDE 완전 가이드',
        description: 'GB Coder의 전체 구조를 살펴봅니다. HTML/CSS/JS 즉시 미리보기, Monaco, 브라우저 속 Node.js, 선택형 AI, GitHub 동기화, 백업과 배포까지 정리합니다.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', '브라우저 IDE', '웹 개발', '개발 도구', '제품 가이드'],
        intro: '대부분의 웹 아이디어는 첫 줄을 쓰기도 전에 멈춥니다. 화면에 버튼 하나를 띄우려면 런타임, 패키지 관리자, 번들러, 편집기 설정, 폴더 구조가 필요합니다. LadeStack이 만든 GB Coder는 그 준비 과정을 없앱니다. 브라우저 탭 안에서 완전한 개발 환경으로 열리고, 프로젝트를 사용자의 기기에 보관하며, 세 패널짜리 HTML 실험부터 터미널이 있는 Node.js 애플리케이션까지 확장합니다. 이 가이드는 제품의 작동 방식, 두 가지 편집 모드의 용도, 각 기능이 어떻게 연결되는지 설명합니다. 브라우저 API나 외부 계정에 의존하는 기능은 그 전제를 분명히 밝힙니다.',
        sections: [
          {
            heading: '1. 하나의 작업 공간, 두 개의 엔진',
            body: 'GB Coder는 하나의 껍데기를 공유하는 두 환경으로 이해하면 쉽습니다. 정적 편집기는 HTML, CSS, JavaScript에 집중한 작업대입니다. 입력하면 미리보기가 갱신되고 그 사이에 빌드 단계가 없습니다. 고급 IDE는 WebContainer를 통해 실제 Node.js 도구 체인을 실행합니다. WebContainer는 브라우저 탭 안에서 동작하는 WebAssembly 기반 런타임입니다. 두 모드는 같은 프로젝트 대시보드, Monaco 편집기, 파일 탐색기, 미리보기 패널, 로컬 저장소 계층을 사용하므로 모드를 바꾸는 일은 제품을 바꾸는 것이 아니라 도구를 바꾸는 느낌에 가깝습니다. 랜딩 페이지, CSS 실험, 수업용 데모, 작은 스크립트에는 정적 모드를 선택하세요. npm 패키지, Vite 개발 서버, JSX 컴파일, 터미널이 필요하면 고급 모드를 선택합니다. 고급 런타임에는 SharedArrayBuffer와 교차 출처 격리를 지원하는 최신 브라우저가 필요하며, 현재 Chromium 계열 브라우저와 Firefox가 현실적인 선택입니다. 어떤 작업도 원격 가상 머신에서 실행되지 않습니다.',
          },
          {
            heading: '2. 1분 이내에 프로젝트 시작하기',
            body: '시작점은 프로젝트 대시보드입니다. 새 프로젝트를 선택하면 빈 정적 샌드박스, React 18 스타터, Vue 3 스타터, WebContainer Node.js 환경 중에서 고를 수 있습니다. 템플릿 갤러리에는 랜딩 페이지, 대시보드, 유틸리티 앱, 컴포넌트 프로토타입이 준비되어 있고 각각 합리적인 파일 구조가 이미 갖춰져 있습니다. 새 작업 공간은 브라우저의 트랜잭션 저장소인 IndexedDB에 즉시 생성되므로 다운로드, 계정, 서버 왕복 없이 첫 미리보기를 볼 수 있습니다. 프로젝트 이름과 폴더는 직접 정리할 수 있고 각 작업 공간은 서로 분리되어 있습니다. 기존 작업은 ZIP 아카이브나 GitHub 저장소로 가져올 수 있으며, 두 경로 모두 파일을 적용하기 전에 검토 단계를 거칩니다. 제품을 처음 쓴다면 온보딩은 이것으로 충분합니다. 대시보드를 열고 출발점을 고른 뒤 편집을 시작하세요.',
          },
          {
            heading: '3. 정적 편집기와 즉각적인 피드백 루프',
            body: '정적 편집기는 작업 공간을 HTML, CSS, JavaScript 패널로 나눕니다. GB Coder가 마크업을 표준을 준수하는 문서 셸로 감싸므로 조각만으로 시작할 수 있고, 상용구 doctype을 관리할 필요가 없습니다. 변경 사항은 짧은 지연을 둔 샌드박스 iframe에서 평가됩니다. 빠른 타이핑이 렌더러를 과부하시키지 않으면서도 즉시 반응하는 느낌을 유지합니다. 가상 콘솔은 log, warn, error, info 출력을 미리보기 옆에 모아 주므로 개발자 도구를 열지 않고도 작은 스크립트를 디버깅할 수 있습니다. 외부 라이브러리는 CDN이나 외부 라이브러리 관리자로 추가할 수 있으며 Tailwind, Bootstrap, 아이콘 세트 같은 익숙한 옵션을 지원합니다. 정적 프로젝트는 네이티브 ES 모듈 가져오기를 사용해 여러 파일과 디렉터리로 확장할 수도 있습니다. 이 모드에는 패키지 설치와 번들링이 없다는 분명한 한계가 있습니다. 학습, 시각적 실험, 의존성이 없는 데모에는 알맞지만 대규모 프레임워크 애플리케이션에는 적합하지 않습니다.',
          },
          {
            heading: '4. Monaco, 언어 인텔리전스, 편집 도구',
            body: '인터페이스 아래에는 VS Code를 구동하는 오픈소스 편집 엔진 Monaco가 있습니다. 그 혈통은 세부 기능에 드러납니다. IntelliSense 자동 완성, 인라인 타입 문서, 구문 검증, 괄호 매칭, 다중 커서 편집, 설정 가능한 키 바인딩입니다. TypeScript, JavaScript, HTML, CSS, JSON에는 언어 서비스가 제공되므로 실수는 빌드 후가 아니라 입력하는 동안 표시됩니다. 편집기는 분할 보기와 차이 비교 뷰어도 지원해 리비전을 비교하거나 AI 제안을 검토할 때 유용합니다. 편집기 주변에는 보통 별도 도구가 필요한 기능도 갖춰져 있습니다. 정규식과 대소문자 구분을 지원하는 프로젝트 전체 검색 및 바꾸기, 주요 웹 언어용 Prettier 기반 서식, 명령 팔레트, 검색 가능한 키보드 단축키 목록입니다. 자동 저장은 계속 실행되며 상태 표시기로 현재 파일의 상황을 알 수 있습니다. 하나씩 보면 작은 편의 기능이지만, 합쳐지면 브라우저 편집기가 제한적으로 느껴지게 만드는 잦은 도구 전환을 없애 줍니다.',
          },
          {
            heading: '5. 고급 IDE: 브라우저에서 실행되는 진짜 Node.js',
            body: '고급 IDE는 사람들을 놀라게 하는 부분입니다. WebContainer는 WebAssembly로 컴파일된 작은 운영 체제를 제공하고 페이지 안에서 실제 Node.js 바이너리를 실행합니다. 따라서 npm install은 진짜 패키지를 해석하고, npx 스크립트가 실행되며, Vite 개발 서버가 로컬 포트에서 시작되어 통합 미리보기로 전달됩니다. 터미널은 ANSI 스타일과 명령 기록을 갖춘 완전한 xterm.js 셸이며, 출력을 흉내 낸 패널이 아닙니다. 런타임이 탭 안에 있으므로 패키지 설치와 파일 작업이 원격 컨테이너를 소비하지 않습니다. 제약도 현실적입니다. 이 기능은 SharedArrayBuffer와 교차 출처 격리에 의존하고, 메모리는 브라우저가 제한하며, 네이티브 바이너리나 Docker 이미지는 범위 밖입니다. 그러나 일반적인 npm 의존성이 있는 React 또는 Vue 애플리케이션이라면 작업 흐름은 노트북에서 하는 것과 같습니다. 차이는 환경이 기기마다 다시 구축되는 대신 프로젝트와 함께 제공된다는 점입니다.',
            codeSnippet: `npm install
npm run dev
# Vite가 로컬 URL을 출력하면 GB Coder가 해당 포트를 미리보기로 전달합니다`,
            codeLang: 'bash',
          },
          {
            heading: '6. 미리보기, 모바일 테스트, 가벼운 공유',
            body: '모든 프로젝트에는 미리보기가 있고, 그 미리보기는 정적인 썸네일이 아닙니다. 샌드박스 iframe에서 실행되며, 듀얼 모니터 환경을 위해 별도 창으로 분리할 수 있고, 휴대폰, 태블릿, 데스크톱 너비의 뷰포트 프리셋을 제공합니다. QR 코드를 사용하면 실제 휴대폰에서 미리보기를 열 수 있어 데스크톱 창 크기만 바꿔서는 놓치는 레이아웃 문제를 발견할 수 있습니다. 빠른 피드백을 위해 GB Coder는 단일 파일 프로젝트를 URL 해시를 이용해 공유 URL로 인코딩할 수 있습니다. 해시는 서버에 전송되지 않으므로 링크는 자체 완결적입니다. 대신 실용적인 크기 제한이 있고, 여러 파일로 된 프로젝트는 잘라서 보내지 않고 거부합니다. 그런 프로젝트는 ZIP 아카이브나 샌드박스 워크플로로 공유합니다. 이 구분은 중요합니다. 공유 링크는 작은 데모를 위한 편의 기능이고, 아카이브나 저장소는 실제 작업을 확실하게 넘기는 수단입니다.',
          },
          {
            heading: '7. GB Assist, Build with AI, 음성 제어',
            body: 'GB Coder의 AI는 선택 사항이며 검토할 수 있도록 설계되었습니다. GB Assist는 질문, 오류 설명, 변경 계획을 위한 채팅 패널입니다. 파일 편집을 제안할 수 있지만 적용 전에 차이 형태로 보여 줍니다. 어시스턴트를 사용하려면 공급자와 모델을 연결해야 하며, 사용할 때 프롬프트와 선택한 코드가 해당 공급자에게 전송됩니다. Build with AI는 반대 방향입니다. 인터페이스를 일상 언어로 설명하면 구조화된 HTML, CSS, JavaScript 프로젝트를 받고, 편집기 내용을 교체하기 전에 검증합니다. Screenshot to Code는 캡처 도구에서 붙여 넣은 이미지를 포함해 이미지를 받아 마크업과 스타일의 초안을 생성합니다. 음성 제어는 브라우저의 음성 인식을 사용해 실행, 서식, 설명, 수정, 빌드, 내보내기, 패널 열기, 파일 전환 같은 명령을 수행합니다. 현재 Chrome과 Edge가 가장 잘 지원하며 입력식 명령 상자도 항상 사용할 수 있습니다. 네 기능의 공통점은 분명합니다. 생성은 빠르지만 받아들일지는 사용자가 결정합니다.',
          },
          {
            heading: '8. 스냅샷, 백업, GitHub 동기화',
            body: '프로젝트는 IndexedDB에 자동 저장되지만 자동 저장은 버전 기록이 아닙니다. 스냅샷은 현재 프로젝트 상태에 이름이 붙은 체크포인트를 만들고, 차이 비교 뷰어는 복원하기 전에 무엇이 바뀌었는지 보여 줍니다. 브라우저 밖으로 나가야 하는 작업에는 ZIP 내보내기가 전체 디렉터리 트리를 묶고 무결성 해시를 기록합니다. 가져오기는 끌어다 놓은 아카이브를 받아 파일을 쓰기 전에 구조 미리보기를 보여 줍니다. GitHub 동기화는 양방향 경로로 순환을 완성합니다. 개인 액세스 토큰으로 연결하고 기존 저장소를 고르거나 새로 만든 뒤 푸시하거나 풀합니다. 푸시는 하나의 원자적 커밋으로 구성되고, 변경되지 않은 파일은 건너뛰며, 작업 중에 움직인 브랜치는 다른 사람의 작업을 조용히 덮어쓰지 않고 충돌로 보고됩니다. 풀한 파일은 아카이브와 같은 검토 및 적용 흐름을 거칩니다. 토큰은 기본적으로 세션에만 유지되며, 기기에 기억하는 것은 암호화해 저장하는 선택 기능입니다. GitHub 통신은 브라우저에서 api.github.com으로 직접 이루어지므로 LadeStack이 자격 증명을 보관할 필요가 없습니다.',
          },
          {
            heading: '9. 배포와 마지막 단계',
            body: '누군가 열 수 있을 때까지 프로젝트는 끝난 것이 아닙니다. GB Coder는 자신의 계정 토큰으로 Vercel과 Netlify에 원클릭 배포를 지원합니다. 서비스는 프로젝트가 정적 사이트인지 Vite 애플리케이션인지 감지해 알맞은 파일을 보내고 공개 URL을 반환합니다. 토큰이 사용자 소유이므로 배포는 사용자의 계정에 생성되고 이후에도 그곳에서 관리할 수 있습니다. 정적 프로젝트는 ZIP으로 내보내 어떤 호스트에든 업로드할 수 있고, GitHub 동기화는 CI 파이프라인을 구동할 수 있는 저장소에 작업 공간을 연결합니다. 어느 경로도 프로젝트를 GB Coder에 가두지 않습니다. 파일은 표준 HTML, CSS, JavaScript, 설정으로 남습니다. 이 이식성이 핵심입니다. 브라우저는 작업이 일어나는 곳이지 작업이 갇히는 곳이 아닙니다.',
          },
          {
            heading: '10. 개인정보, 비용, 대상 사용자',
            body: 'GB Coder는 무료이며 로그인이나 가입이 필요 없고 광고도 없습니다. 기본 자세는 로컬 우선입니다. 프로젝트는 브라우저 저장소에 있고 애플리케이션은 이를 열기 위해 LadeStack 계정을 요구하지 않습니다. 데이터는 AI 공급자, GitHub 동기화, 배포, 자신의 코드에 포함한 타사 CDN처럼 연결 기능을 선택할 때만 기기를 떠납니다. 로컬 우선이 오프라인 전용을 뜻하지는 않으므로 이 차이는 짚고 넘어갈 가치가 있습니다. HTML과 CSS가 즉시 반응하는 모습을 보고 싶은 학습자, 설치 없는 교실이 필요한 교사, 저장소에 맡기기 전에 인터페이스를 시제품으로 만들어 보는 개발자, 작은 유틸리티나 데모를 빠르게 공개하려는 사람에게 알맞습니다. 거대한 모노레포, 네이티브 도구 체인, Docker 기반 서비스, 브라우저 저장소를 금지하는 조직에는 덜 적합합니다. AI 사용에는 선택한 공급자의 요금이 발생할 수 있고 배포는 Vercel 또는 Netlify 요금제를 따릅니다. 애플리케이션 자체는 무료로 남고 외부 서비스는 사용자가 고릅니다.',
          },
          {
            heading: '11. 반복 가능한 워크플로',
            body: '신뢰할 수 있는 절차는 이렇습니다. 프로젝트 대시보드를 열고 작업에 맞는 모드로 작업 공간을 만듭니다. 가장 작은 눈에 보이는 버전을 먼저 만들고 콘솔과 미리보기로 수정합니다. 정적 편집기로 정말 해결할 수 없을 때만 패키지를 추가합니다. 데스크톱 세부 사항을 다듬기 전에 휴대폰 너비로 테스트하거나 QR 코드를 스캔합니다. 의미 있는 이정표마다 스냅샷을 만듭니다. 작업에 영구적인 보관 장소가 필요해지면 GitHub에 푸시하거나 ZIP을 내보냅니다. 보여 줄 가치가 생기면 배포합니다. 어느 단계도 로컬 설치를 요구하지 않으며, 같은 브라우저 저장소나 새 클론이 있으면 다른 기기에서도 반복할 수 있습니다. 제품이 처음이라면 빈 정적 프로젝트와 제목 하나로 시작하세요. 예전에 필요했던 설정이 끝나기도 전에 첫 미리보기가 화면에 나타납니다. 프로젝트 대시보드는 /app/projects에 있습니다.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coder 전체 문서 읽기 →',
      },
    },
  },
  zh: {
    metaTitle: '技术博客与工程指南 — GB Coder by LadeStack',
    metaDescription: '纯浏览器原生开发实战技术指南：毫秒级实时预览工作流、React 与 Vue 在线 IDE 架构剖析，以及基于 IndexedDB 的本地防篡改备份系统。',
    heroTag: '技术工程与实战指南',
    heroTitle: 'GB Coder 开发者技术博客与指南',
    heroDescription: '深入探索纯浏览器环境下的现代 Web 开发实践。提供经过生产验证的真实代码模版、架构设计与开发技巧。',
    readArticleLabel: '阅读完整指南',
    publishedOnLabel: '发布日期：',
    byAuthorLabel: '作者：',
    relatedArticlesTitle: '推荐关联技术指南',
    backToBlogLabel: '← 返回技术博客列表',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: '基于毫秒级实时动态预览构建 HTML/CSS/JavaScript 工程',
        description: '深入了解如何使用 GB Coder 静态原型编辑器、双向 DOM 同步引擎以及内置虚拟终端控制台构建高响应度前端组件。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', '原型设计'],
        intro: '传统前端原型开发往往受限于繁琐的本地开发服务器配置、打包工具链调度与冗长的依赖安装过程。GB Coder 提供了免安装的浏览器端开发空间，将您的页面标记、样式渲染与脚本逻辑即时注入沙箱 iframe 中，带来毫无延迟的所见即所得体验。',
        sections: [
          {
            heading: '1. 在编辑区构建语义化 HTML5 骨架',
            body: '在 HTML 面板中编写标准、高可访问性的语义标签。静态编辑器会自动将其封装于标准 HTML5 环境中，使您免于编写多余的骨架模版。',
            codeSnippet: `<div class="interactive-card">
  <header class="card-header">
    <span class="badge">实时原型验证</span>
    <h2>工程任务面板</h2>
  </header>
  <div class="card-body">
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="输入新的研发任务..." />
      <button id="addBtn" class="btn-primary">添加任务</button>
    </div>
    <ul id="taskList" class="task-list"></ul>
  </div>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. 编写现代 CSS 样式并享受毫秒级渲染',
            body: '切换至 CSS 面板，运用现代 CSS 变量、Flexbox 与 Grid 布局进行视觉美化。预览视窗随输入实时更新，并智能保持当前的滚动高度与焦点位置。',
            codeSnippet: `:root {
  --surface-bg: #ffffff;
  --accent-color: #cc785c;
  --text-dark: #141413;
  --border-line: #e6dfd8;
}

.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  background: var(--surface-bg);
  border: 1px solid var(--border-line);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}`,
            codeLang: 'css',
          },
          {
            heading: '3. 注入 ES2024 交互逻辑与虚拟控制台捕获',
            body: '在 JS 面板中编写标准 ECMAScript 交互代码。所有的 console.log、console.warn 以及 console.error 信息均会被双向捕获，实时展示在下方内置的控制台中。',
            codeSnippet: `const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

function addTask(title) {
  if (!title.trim()) return;
  const li = document.createElement('li');
  li.textContent = title;
  list.appendChild(li);
  input.value = '';
  console.log('[新任务添加成功]:', title);
}

addBtn.addEventListener('click', () => addTask(input.value));`,
            codeLang: 'javascript',
          },
          {
            heading: '4. 独立弹窗调试与移动端扫码测试',
            body: '通过点击顶部工具栏的“独立弹窗预览”，即可将画面分离至独立窗口以进行双屏对比；您还可以生成专属移动端调试二维码，在手机设备上实时验证适配表现。',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: '阅读静态编辑器技术文档 →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: '无需配置环境，在浏览器内直接开启 React 与 Vue 框架开发',
        description: '探索如何在免安装 Node.js 与 npm 环境的前提下，依托 GB Coder 高级 WebContainer 运行时开展 React 18 与 Vue 3 单文件组件工程化开发。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', '前端工程化'],
        intro: '现代前端工程化通常依赖繁重的本地 Node.js 运行时与包管理工具。借助 GB Coder 深度集成的 WebContainer 核心技术，您可以在单个浏览器标签页内直接调度真实的 Node.js 微系统与 Vite 开发服务器。',
        sections: [
          {
            heading: '1. React 18 现代化工程模版架构',
            body: '在模版中心新建 React 18 工程时，系统会自动就绪 package.json、vite.config.ts 及 App.tsx，支持完整的 Monaco 智能类型提示与 JSX 编译。',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">在线监控仪表盘</h1>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded"
      >
        累计点击：{count}
      </button>
    </main>
  );
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Vue 3 单文件组件 (.vue) 浏览器端编译',
            body: 'Vue 3 模版依托浏览器端 @vue/compiler-sfc 编译器，直接解析包含 <template>、<script setup> 与 scoped 样式的单文件组件，实现响应式状态无缝联动。',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div class="vue-box">
    <h2>{{ greeting }}</h2>
    <button @click="num++">计数：{{ num }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const greeting = ref('GB Coder 浏览器端 Vue 3');
const num = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. 在 xterm.js 终端中自由执行命令',
            body: '使用快捷键 Ctrl+` 随时呼出集成终端，支持执行 npm install 安装流行三方库，启动 Vite 热更新服务，或运行自定义 npm 脚本。',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: '阅读框架开发技术文档 →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: '浏览器在线工程的导入、导出与安全备份系统指南',
        description: '深度剖析 GB Coder 本地优先（Local-First）存储架构、SHA-256 压缩包完整性指纹校验机制，以及可靠的数据归档策略。',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', '安全架构', '数据自主权', '备份恢复'],
        intro: '对于纯浏览器端 IDE，数据的安全可靠与持久性是重中之重。GB Coder 通过结合浏览器同源 IndexedDB 事务存储与带 SHA-256 哈希校验的通用 ZIP 归档机制，彻底杜绝数据意外丢失。',
        sections: [
          {
            heading: '1. 本地优先（Local-First）存储实现原理',
            body: '与将用户代码上传至云端主机的平台截然不同，GB Coder 将完整目录树保存在本地 IndexedDB 数据库 gb-coder-projects-db 中，代码绝对不会静默传输至外网。',
          },
          {
            heading: '2. 携带 SHA-256 哈希校验的 ZIP 导出',
            body: '点击导出时，系统自动打包所有源码文件并实时生成 SHA-256 完整性指纹写入归档清单中，确保在备份转移过程中不受任何损坏或篡改。',
            codeSnippet: `// 备份压缩包内嵌 manifest
{
  "projectId": "proj-98214",
  "name": "Dashboard-Component",
  "exportedAt": "2026-10-15T12:00:00.000Z",
  "integrityAlgorithm": "SHA-256"
}`,
            codeLang: 'json',
          },
          {
            heading: '3. 项目安全导入与防穿透防御',
            body: '导入工程时只需将 ZIP 文件拖入项目看板，导入引擎会自动执行安全扫描，防范非法相对路径（如 ../）越权，并安全重构本地数据库记录。',
          },
          {
            heading: '4. 长期工程归档最佳实践',
            body: '建议在关键版本节点定期导出标准 ZIP 包。导出的压缩包完全符合行业标准，可随时无缝解压至桌面版 VS Code 或提交至 Git 仓库。',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: '阅读备份与恢复技术文档 →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'GB Coder 全解析：浏览器 IDE 完整指南',
        description: '全面了解 GB Coder：HTML/CSS/JS 即时预览、Monaco 编辑器、浏览器内 Node.js、可选 AI、GitHub 同步、备份与一键部署，一文读懂完整工作流。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', '浏览器 IDE', 'Web 开发', '开发工具', '产品指南'],
        intro: '很多 Web 想法在写下第一行代码之前就停住了。要让屏幕上出现一个按钮，你得先准备运行时、包管理器、打包工具、编辑器配置和目录结构。由 LadeStack 打造的 GB Coder 省去了这段助跑。它在浏览器标签页中以完整开发环境打开，把项目保存在你自己的设备上，并能从三栏式 HTML 实验扩展到带终端的 Node.js 应用。本文解释产品的运行方式、两种编辑模式各自的用途，以及各项功能如何衔接。凡是依赖浏览器 API 或外部账户的能力，文中都会明确说明前提。',
        sections: [
          {
            heading: '1. 一个工作区，两套引擎',
            body: '理解 GB Coder 的最好方式，是把它看成共享同一层外壳的两套环境。静态编辑器是专注 HTML、CSS 和 JavaScript 的工作台：输入代码，预览立即更新，中间没有构建步骤。高级 IDE 则通过 WebContainer 运行真正的 Node.js 工具链。WebContainer 是一个基于 WebAssembly 的运行时，直接在浏览器标签页内执行。两种模式共用项目面板、Monaco 编辑器、文件浏览器、预览面板和本地存储层，因此切换模式更像是换工具，而不是换产品。落地页、CSS 实验、教学演示或小脚本适合静态模式；需要 npm 包、Vite 开发服务器、JSX 编译或终端时，选择高级模式。高级运行时要求浏览器支持 SharedArrayBuffer 和跨源隔离，目前 Chromium 内核浏览器和 Firefox 是务实的选择。所有计算都在本地标签页中完成，不依赖远程虚拟机。',
          },
          {
            heading: '2. 一分钟内创建项目',
            body: '入口是项目面板。选择“新建项目”后，可以选择空白静态沙箱、React 18 模板、Vue 3 模板或 WebContainer Node.js 环境。模板库还提供落地页、仪表盘、实用工具和组件原型，每个模板都已经准备好合理的文件结构。新工作区会立即创建在 IndexedDB 这个浏览器事务型存储层中，因此第一次预览不需要下载、不需要账户，也不需要等待服务器往返。项目名称和文件夹由你自由组织，每个工作区彼此隔离。已有工作可以通过 ZIP 压缩包或 GitHub 仓库导入，两者都会先经过检查步骤，再写入文件。如果你是第一次使用，整个上手流程就是：打开项目面板，选一个起点，然后开始编辑。',
          },
          {
            heading: '3. 静态编辑器与即时反馈循环',
            body: '静态编辑器把工作区分为 HTML、CSS 和 JavaScript 三个面板。GB Coder 会把标记包裹进符合标准的文档外壳，因此只写一个片段就能开始，不必维护样板 doctype。改动会在带短暂防抖的沙箱 iframe 中求值，既能避免快速输入压垮渲染器，又保留了即时感。虚拟控制台会在预览旁收集 log、warn、error 和 info 输出，让你不打开开发者工具也能调试小脚本。外部库可以从 CDN 或“外部库管理器”添加，涵盖 Tailwind、Bootstrap 和图标集等常见选项。静态项目还可以借助原生 ES 模块导入，扩展成多文件和目录结构。这种模式的取舍很明确：它不安装包，也不打包，因此适合学习、视觉实验和无依赖演示，而不适合大型框架应用。',
          },
          {
            heading: '4. Monaco、语言智能与编辑工具',
            body: '界面之下是 Monaco，也就是驱动 VS Code 的开源编辑器引擎。这种血统体现在细节里：IntelliSense 补全、行内类型文档、语法校验、括号匹配、多光标编辑和可配置快捷键。TypeScript、JavaScript、HTML、CSS 和 JSON 都有语言服务，错误会在输入时标出，而不是等到构建之后。编辑器还支持拆分视图和差异查看器，适合比较修订版本或审阅 AI 建议。在编辑器周围，GB Coder 补上了通常需要单独工具的能力：支持正则表达式和大小写匹配的全项目搜索替换、面向主要 Web 语言的 Prettier 格式化、命令面板，以及可搜索的快捷键说明。自动保存持续运行，并用状态指示器显示当前文件的情况。单独看都是小便利，合在一起则消除了让浏览器编辑器显得局促的上下文切换。',
          },
          {
            heading: '5. 高级 IDE：浏览器里的真正 Node.js',
            body: '高级 IDE 是最令人意外的部分。WebContainer 提供一个编译为 WebAssembly 的小型操作系统，在页面内运行真正的 Node.js 二进制文件。也就是说，npm install 会解析真实的包，npx 脚本可以执行，Vite 开发服务器会在本地端口启动，并转发到集成预览。终端是完整的 xterm.js shell，支持 ANSI 样式和命令历史，而不是模拟的输出面板。由于运行时就在标签页内，安装包和文件操作不会消耗远程容器。限制同样真实：该功能依赖 SharedArrayBuffer 和跨源隔离，内存受浏览器约束，原生二进制或 Docker 镜像不在支持范围内。但对于使用普通 npm 依赖的 React 或 Vue 应用，工作流程和笔记本电脑上完全一致。区别在于，环境随项目一起到达，而不必在每台机器上重新搭建。',
            codeSnippet: `npm install
npm run dev
# Vite 会输出本地地址，GB Coder 将该端口转发到预览`,
            codeLang: 'bash',
          },
          {
            heading: '6. 预览、移动端测试与轻量分享',
            body: '每个项目都有预览，而且它不只是一张静态缩略图。预览运行在沙箱 iframe 中，可以分离到独立窗口用于双屏工作，还提供手机、平板和桌面宽度的视口预设。扫描二维码即可在真实手机上打开预览，从而发现仅靠调整桌面窗口大小容易漏掉的布局问题。为了快速收集反馈，GB Coder 可以把单文件项目编码进 URL 哈希，生成分享链接。哈希不会发送到服务器，所以链接是自包含的；代价是存在实际的大小限制，多文件项目会被拒绝，而不是被截断。这类项目可以改用 ZIP 压缩包或沙箱工作流分享。这个区别很重要：分享链接是小演示的便利手段，而压缩包或仓库才是真实工作的可靠交付方式。',
          },
          {
            heading: '7. GB Assist、Build with AI 与语音控制',
            body: 'GB Coder 中的 AI 是可选项，而且被设计成可审阅的。GB Assist 是一个聊天面板，用来提问、解释错误和规划改动；它可以提出文件编辑建议，但任何内容应用之前都会以差异形式展示。使用助手需要连接服务商和模型，使用时提示词和选中的代码会发送给该服务商。Build with AI 则反过来：用自然语言描述界面，得到结构化的 HTML、CSS 和 JavaScript 项目，并在替换编辑器内容之前完成校验。Screenshot to Code 接受图片，包括从截图工具粘贴的图片，并生成标记和样式的初稿。语音控制使用浏览器的语音识别执行运行、格式化、解释、修复、构建、导出、打开面板或切换文件等命令；目前 Chrome 和 Edge 支持最好，同时始终可以使用手动输入的命令框。四项功能的共同点是：生成很快，但是否采纳由你决定。',
          },
          {
            heading: '8. 快照、备份与 GitHub 同步',
            body: '项目会自动保存到 IndexedDB，但自动保存不等于版本历史。快照会为当前项目状态创建具名检查点，差异查看器会在恢复之前显示改动。需要离开浏览器的工作，可以用 ZIP 导出打包完整目录树并记录完整性哈希；导入时接受拖入的压缩包，并在写入文件前展示结构预览。GitHub 同步用双向路径闭环：用个人访问令牌连接，选择已有仓库或新建仓库，然后推送或拉取。推送会组装成单个原子提交，未变化的文件会被跳过，期间发生移动的分支会报告冲突，而不是悄悄覆盖他人的工作。拉取的文件会经过与压缩包相同的检查和写入流程。令牌默认只在当前会话中保留；要在设备上记住它，需要主动开启加密存储。GitHub 流量从浏览器直接发往 api.github.com，LadeStack 无需保管凭据。',
          },
          {
            heading: '9. 部署与最后一步',
            body: '项目只有别人能打开时才算完成。GB Coder 支持使用你自己的账户令牌，一键部署到 Vercel 和 Netlify。服务会识别项目是静态站点还是 Vite 应用，发送相应文件并返回线上地址。由于令牌属于你，部署会落在你的账户中，之后也可以在那里管理。静态项目还可以导出为 ZIP 上传到任意主机，而 GitHub 同步能把工作区连接到可驱动 CI 流水线的仓库。这些路径都不会把项目锁在 GB Coder 里：文件仍然是标准的 HTML、CSS、JavaScript 和配置。可移植性正是重点。浏览器是工作发生的地方，而不是工作被困住的地方。',
          },
          {
            heading: '10. 隐私、成本与适用人群',
            body: 'GB Coder 免费使用，不需要登录或注册，也没有广告。它的默认姿态是本地优先：项目存放在浏览器存储中，打开项目不需要 LadeStack 账户。只有当你主动选择联网能力时，数据才会离开设备，例如 AI 服务商、GitHub 同步、部署，或你自己代码中引入的第三方 CDN。这个区别值得说明，因为本地优先并不等于只能离线。它适合想立刻看到 HTML 和 CSS 反应的学习者、需要免安装课堂的教师、在提交到仓库前先做界面原型的开发者，以及需要快速上线小工具或演示的任何人。它不太适合超大型 monorepo、原生工具链、基于 Docker 的服务，或禁止浏览器存储的组织。使用 AI 可能产生所选服务商的费用，部署则受你的 Vercel 或 Netlify 套餐约束。应用本身保持免费，外部服务由你选择。',
          },
          {
            heading: '11. 可重复的工作流',
            body: '可靠的日常流程是这样的：打开项目面板，用与任务匹配的模式创建工作区。先做出最小的可见版本，再用控制台和预览修正。只有静态编辑器确实无法完成时，才引入包。在打磨桌面细节之前，用手机宽度测试或扫描二维码。每到有意义的节点就创建一个快照。工作需要有持久的家时，推送到 GitHub 或导出 ZIP。有值得展示的内容时再部署。这些步骤都不需要本地安装，只要拥有相同的浏览器存储或新的克隆，就能在另一台机器上重复。如果你刚接触这个产品，从一个空白静态项目和一个标题开始；过去那套环境还没装完，第一次预览就已经出现在屏幕上了。项目面板位于 /app/projects。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: '阅读完整的 GB Coder 文档 →',
      },
    },
  },
  ru: {
    metaTitle: 'Блог и Технические Руководства — GB Coder от LadeStack',
    metaDescription: 'Практические руководства по веб-разработке в браузере: живой предпросмотр, архитектуры React и Vue в браузере и надежные бэкапы IndexedDB.',
    heroTag: 'Инженерия и Обучение',
    heroTitle: 'Технические Руководства GB Coder',
    heroDescription: 'Глубокие практические материалы по разработке веб-приложений прямо в браузере. Проверенный код, архитектурные решения и инструкции.',
    readArticleLabel: 'Читать Полное Руководство',
    publishedOnLabel: 'Опубликовано:',
    byAuthorLabel: 'Автор:',
    relatedArticlesTitle: 'Рекомендуемые Руководства',
    backToBlogLabel: '← Вернуться в Блог',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Создание Проектов на HTML/CSS/JavaScript с Мгновенным Предпросмотром',
        description: 'Как создавать адаптивные веб-компоненты с помощью статического редактора GB Coder, синхронизации DOM и виртуальной консоли.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Прототипирование'],
        intro: 'Быстрое прототипирование интерфейсов часто замедляется настройкой сборщиков и локальных серверов. GB Coder решает эту задачу, предоставляя браузерную среду с синхронным отображением кода в изолированном фрейме.',
        sections: [
          {
            heading: '1. Написание Семантического HTML',
            body: 'Пишите чистый HTML5 в левой панели. Редактор автоматически обрамляет разметку в корректный каркас документа.',
            codeSnippet: `<div class="interactive-card">
  <h2>Менеджер Задач</h2>
  <input type="text" id="taskInput" placeholder="Новая задача..." />
  <button id="addBtn">Добавить</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Стилизация на CSS с Мгновенным Откликом',
            body: 'Используйте CSS-панель для стилизации. Изменения отображаются прямо во время ввода с сохранением фокуса и прокрутки.',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Добавление Логики на JavaScript',
            body: 'Пишите современный JS-код. Вызовы console выводятся как в инструменты разработчика, так и во встроенную консоль.',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Проверка на Смартфонах через QR-Код',
            body: 'Отделите предпросмотр в новое окно или отсканируйте QR-код для мгновенной проверки верстки на реальном телефоне.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Документация по Статическому Редактору →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Запуск Проектов на React и Vue Прямо в Браузере',
        description: 'Разрабатывайте компонентные веб-приложения на React 18 и Vue 3 внутри GB Coder без установки Node.js на ваш компьютер.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Фронтенд'],
        intro: 'Современная разработка обычно требует установки Node.js и управления пакетами npm. Благодаря среде WebContainer в GB Coder настоящие процессы Node.js и серверы Vite работают прямо во вкладке браузера.',
        sections: [
          {
            heading: '1. Архитектура Шаблонов React 18',
            body: 'Выберите шаблон React 18, чтобы получить готовую структуру с TSX и автодополнением Monaco IntelliSense.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [c, setC] = useState(0);
  return <button onClick={() => setC(c + 1)}>Кликов: {c}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Компиляция Однофайловых Компонентов Vue 3',
            body: 'Шаблоны Vue компилируют файлы .vue в оперативной памяти браузера с полной поддержкой <script setup> и scoped CSS.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>Vue 3 в GB Coder</h2>
    <button @click="val++">Счетчик: {{ val }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const val = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. Работа в Терминале xterm.js',
            body: 'Нажмите Ctrl+` для открытия терминала и установки зависимостей npm install прямо в среде WebContainer.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Документация по Фреймворкам →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Импорт, Экспорт и Резервное Копирование Проектов в Браузере',
        description: 'Принципы локального хранилища IndexedDB в GB Coder, проверка целостности архивов по SHA-256 и безопасное сохранение данных.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Безопасность', 'Резервное Копирование'],
        intro: 'Сохранность кода — ключевой фактор при работе в браузере. GB Coder объединяет локальное хранилище IndexedDB с экспортом в ZIP-архивы с контролем контрольной суммы SHA-256.',
        sections: [
          {
            heading: '1. Принцип Работы Local-First IndexedDB',
            body: 'Код проектов сохраняется в локальной базе данных gb-coder-projects-db на вашем компьютере и не передается на сторонние серверы.',
          },
          {
            heading: '2. Экспорт ZIP с Хэшем SHA-256',
            body: 'При экспорте проект упаковывается в стандартный ZIP-архив с автоматическим расчетом хэша целостности.',
          },
          {
            heading: '3. Безопасное Восстановление Проектов',
            body: 'Перетащите ZIP-архив на панель управления для быстрой проверки и восстановления файловой структуры.',
          },
          {
            heading: '4. Рекомендации по Архивации',
            body: 'Регулярно скачивайте ZIP-бэкапы после завершения ключевых этапов работы для использования в десктопном VS Code или Git.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Документация по Резервному Копированию →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'Как работает GB Coder: полный гид по браузерной IDE',
        description: 'Полный обзор GB Coder: мгновенный предпросмотр HTML/CSS/JS, Monaco, Node.js в браузере, опциональный ИИ, синхронизация с GitHub, бэкапы и деплой.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'Браузерная IDE', 'Веб-разработка', 'Инструменты', 'Гид по продукту'],
        intro: 'Большинство веб-идей останавливаются ещё до первой строки кода. Чтобы на экране появилась одна кнопка, нужны среда выполнения, менеджер пакетов, сборщик, настроенный редактор и структура папок. GB Coder от LadeStack убирает этот разбег. Он открывается как полноценная среда разработки во вкладке браузера, хранит проекты на вашем устройстве и масштабируется от HTML-эксперимента с тремя панелями до приложения Node.js с терминалом. В этом руководстве объясняется, как устроен продукт, зачем нужны два режима редактирования и как связаны между собой отдельные функции. Там, где возможность зависит от браузерного API или внешнего аккаунта, эта зависимость указана прямо.',
        sections: [
          {
            heading: '1. Два движка в одном рабочем пространстве',
            body: 'GB Coder проще всего представить как две среды, которые делят одну оболочку. Статический редактор — это сосредоточенный верстак для HTML, CSS и JavaScript: вы печатаете, предпросмотр обновляется, и между ними нет шага сборки. Продвинутая IDE запускает настоящую цепочку инструментов Node.js через WebContainer — среду выполнения на основе WebAssembly, которая работает внутри вкладки браузера. Оба режима используют одну панель проектов, редактор Monaco, проводник файлов, панель предпросмотра и локальное хранилище, поэтому переключение ощущается как смена инструмента, а не продукта. Статический режим выбирают для лендинга, эксперимента с CSS, учебной демонстрации или небольшого скрипта. Продвинутый режим нужен, когда требуются npm-пакеты, сервер разработки Vite, компиляция JSX или терминал. Для продвинутой среды нужен современный браузер с поддержкой SharedArrayBuffer и изоляции между источниками; практичный выбор — актуальные браузеры на Chromium и Firefox. Ничего не выполняется на удалённой виртуальной машине.',
          },
          {
            heading: '2. Проект за минуту',
            body: 'Точка входа — панель проектов. При создании нового проекта можно выбрать пустую статическую песочницу, стартер React 18, стартер Vue 3 или среду Node.js с WebContainer. Галерея шаблонов добавляет лендинги, дашборды, утилиты и прототипы компонентов, и у каждого уже есть разумная структура файлов. Новое рабочее пространство сразу создаётся в IndexedDB — транзакционном хранилище браузера, поэтому первый предпросмотр доступен без загрузки, аккаунта и обращения к серверу. Названия проектов и папки вы организуете сами, а каждое рабочее пространство изолировано от остальных. Существующую работу можно импортировать из ZIP-архива или репозитория GitHub; оба пути проходят проверку перед применением файлов. Если вы впервые открыли продукт, на этом знакомство заканчивается: откройте панель, выберите отправную точку и начинайте редактировать.',
          },
          {
            heading: '3. Статический редактор и мгновенная обратная связь',
            body: 'Статический редактор делит рабочее пространство на панели HTML, CSS и JavaScript. GB Coder оборачивает разметку в соответствующий стандартам документ, поэтому для старта достаточно фрагмента: шаблонный doctype поддерживать не нужно. Изменения вычисляются в изолированном iframe с небольшой задержкой — это не даёт быстрому набору перегружать рендерер, сохраняя ощущение мгновенности. Виртуальная консоль собирает вывод log, warn, error и info рядом с предпросмотром, поэтому небольшой скрипт можно отлаживать без инструментов разработчика. Внешние библиотеки добавляются через CDN или менеджер внешних библиотек: доступны Tailwind, Bootstrap, наборы иконок и другие привычные варианты. Статические проекты могут разрастаться до нескольких файлов и каталогов с нативными импортами ES-модулей. Компромисс осознанный: в этом режиме нет установки пакетов и сборки, поэтому он подходит для обучения, визуальных экспериментов и демо без зависимостей, но не для крупного приложения на фреймворке.',
          },
          {
            heading: '4. Monaco, языковой интеллект и инструменты редактирования',
            body: 'В основе интерфейса лежит Monaco — открытый редакторный движок, который приводит в действие VS Code. Это наследие видно в деталях: дополнения IntelliSense, встроенная документация типов, проверка синтаксиса, сопоставление скобок, редактирование несколькими курсорами и настраиваемые сочетания клавиш. Для TypeScript, JavaScript, HTML, CSS и JSON доступны языковые службы, поэтому ошибки отмечаются во время набора, а не после сборки. Редактор также поддерживает разделённый вид и просмотр различий — полезно при сравнении ревизии или проверке предложения ИИ. Вокруг редактора GB Coder добавляет то, для чего обычно нужны отдельные инструменты: поиск и замена по всему проекту с регулярными выражениями и учётом регистра, форматирование на основе Prettier для основных веб-языков, палитру команд и список горячих клавиш с поиском. Автосохранение работает постоянно, а индикатор состояния показывает, что происходит с текущим файлом. По отдельности это мелочи. Вместе они убирают переключение контекста, из-за которого браузерные редакторы кажутся ограниченными.',
          },
          {
            heading: '5. Продвинутая IDE: настоящий Node.js в браузере',
            body: 'Продвинутая IDE — та часть, которая удивляет. WebContainer предоставляет небольшую операционную систему, скомпилированную в WebAssembly, и запускает настоящие бинарники Node.js прямо на странице. Поэтому npm install разрешает реальные пакеты, скрипты npx выполняются, а сервер разработки Vite стартует на локальном порту, который перенаправляется во встроенный предпросмотр. Терминал — полноценная оболочка xterm.js со стилями ANSI и историей команд, а не имитация панели вывода. Поскольку среда работает внутри вкладки, установка пакетов и файловые операции не расходуют удалённый контейнер. Ограничения столь же реальны: функция зависит от SharedArrayBuffer и изоляции между источниками, память ограничена браузером, а нативные бинарники и образы Docker остаются вне её возможностей. Но для приложения React или Vue с обычными npm-зависимостями рабочий процесс такой же, как на ноутбуке. Разница в том, что среда приходит вместе с проектом, а не собирается заново на каждой машине.',
            codeSnippet: `npm install
npm run dev
# Vite выводит локальный адрес; GB Coder перенаправляет этот порт в предпросмотр`,
            codeLang: 'bash',
          },
          {
            heading: '6. Предпросмотр, мобильное тестирование и обмен',
            body: 'У каждого проекта есть предпросмотр, и это не статичная миниатюра. Он работает в изолированном iframe, может быть вынесен в отдельное окно для двух мониторов и предлагает размеры экрана для телефона, планшета и десктопа. QR-код открывает предпросмотр на настоящем телефоне и выявляет проблемы вёрстки, которые не заметны при изменении размера окна на десктопе. Для быстрой обратной связи GB Coder умеет кодировать простой однофайловый проект в ссылку с помощью хеша URL. Хеш не отправляется на сервер, поэтому ссылка самодостаточна; обратная сторона — практическое ограничение размера, а многофайловые проекты отклоняются, а не обрезаются. Такие проекты передают ZIP-архивом или через рабочий процесс песочницы. Различие важно: ссылка — удобство для небольшого демо, а архив или репозиторий — надёжная передача реальной работы.',
          },
          {
            heading: '7. GB Assist, Build with AI и голосовое управление',
            body: 'ИИ в GB Coder опционален и намеренно сделан проверяемым. GB Assist — панель чата для вопросов, объяснения ошибок и планирования изменений; она может предлагать правки файлов, но перед применением они показываются как diff. Для работы ассистента нужно подключить провайдера и модель, и при использовании запросы вместе с выделенным кодом отправляются этому провайдеру. Build with AI действует в обратную сторону: вы описываете интерфейс обычным языком и получаете структурированный проект HTML, CSS и JavaScript, проверенный перед заменой содержимого редактора. Screenshot to Code принимает изображение, в том числе вставленное из инструмента снимков экрана, и создаёт первую версию разметки и стилей. Голосовое управление использует распознавание речи браузера для команд запуска, форматирования, объяснения, исправления, сборки, экспорта, открытия панели или переключения файла; сейчас лучше всего поддерживаются Chrome и Edge, а поле для ввода команд остаётся доступным. У всех четырёх функций один принцип: генерация быстрая, но решение о принятии за вами.',
          },
          {
            heading: '8. Снимки, резервные копии и синхронизация с GitHub',
            body: 'Проекты автоматически сохраняются в IndexedDB, но автосохранение не заменяет историю версий. Снимки создают именованные контрольные точки текущего состояния, а просмотр различий показывает изменения перед восстановлением. Для работы, которой нужно покинуть браузер, экспорт ZIP упаковывает всё дерево каталогов и записывает хеш целостности; импорт принимает перетащенный архив и показывает структуру до записи файлов. Синхронизация с GitHub замыкает круг двусторонним путём: подключитесь с личным токеном доступа, выберите существующий репозиторий или создайте новый, затем отправьте или получите изменения. Отправка собирается в один атомарный коммит, неизменённые файлы пропускаются, а ветка, сдвинувшаяся за это время, даёт конфликт вместо тихого перезаписывания чужой работы. Полученные файлы проходят тот же поток проверки и применения, что и архив. Токены по умолчанию живут только в сессии; запоминание на устройстве — это опция с шифрованным хранением, а трафик GitHub идёт напрямую из браузера на api.github.com. LadeStack не нужно хранить учётные данные.',
          },
          {
            heading: '9. Деплой и последняя миля',
            body: 'Проект не завершён, пока кто-то не может его открыть. GB Coder поддерживает деплой в Vercel и Netlify одним щелчком с токеном вашего собственного аккаунта. Сервис определяет, статический это сайт или приложение Vite, отправляет нужные файлы и возвращает публичный URL. Поскольку токен принадлежит вам, развёртывание появляется в вашем аккаунте и дальше управляется там. Статические проекты можно также экспортировать в ZIP и загрузить на любой хостинг, а синхронизация с GitHub связывает рабочее пространство с репозиторием, который может запускать CI-конвейер. Ни один из этих путей не запирает проект в GB Coder: файлы остаются стандартными HTML, CSS, JavaScript и конфигурацией. Переносимость и есть цель. Браузер — место, где идёт работа, а не место, где она заперта.',
          },
          {
            heading: '10. Приватность, стоимость и аудитория',
            body: 'GB Coder бесплатен, не требует входа или регистрации и не содержит рекламы. Его исходная позиция — локальность: проекты живут в хранилище браузера, и для их открытия не нужен аккаунт LadeStack. Данные покидают устройство только тогда, когда вы выбираете подключённую возможность: провайдера ИИ, синхронизацию с GitHub, деплой или сторонний CDN в собственном коде. Эта оговорка важна, потому что локальность не означает работу только офлайн. Продукт подходит учащимся, которым нужно сразу видеть реакцию HTML и CSS; преподавателям, которым нужен класс без установки; разработчикам, прототипирующим интерфейс до передачи в репозиторий; и всем, кому нужно быстро опубликовать небольшую утилиту или демо. Он меньше подходит для огромных монорепозиториев, нативных цепочек инструментов, сервисов на Docker и организаций, запрещающих хранилище браузера. Использование ИИ может повлечь расходы у выбранного провайдера, а деплой зависит от вашего тарифа Vercel или Netlify. Само приложение остаётся бесплатным; внешние сервисы вы выбираете сами.',
          },
          {
            heading: '11. Повторяемый рабочий процесс',
            body: 'Надёжная последовательность действий выглядит так. Откройте панель проектов и создайте рабочее пространство в режиме, подходящем задаче. Сначала соберите минимальную видимую версию, затем исправьте её с помощью консоли и предпросмотра. Добавляйте пакеты только тогда, когда статический редактор действительно не справляется. Проверьте на ширине телефона или отсканируйте QR-код, прежде чем полировать десктопные детали. Делайте снимок на каждом значимом этапе. Отправляйте в GitHub или экспортируйте ZIP, когда работе нужно долговременное место. Разворачивайте, когда есть что показать. Ни один из этих шагов не требует локальной установки, и каждый можно повторить на другой машине с тем же хранилищем браузера или свежим клоном. Если вы новичок, начните с пустого статического проекта и одного заголовка: первый предпросмотр появится раньше, чем завершилась бы установка, которая раньше была нужна. Панель проектов находится по адресу /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Читать полную документацию GB Coder →',
      },
    },
  },
  pt: {
    metaTitle: 'Blog e Guias Técnicos — GB Coder por LadeStack',
    metaDescription: 'Guias práticos para desenvolvimento no navegador: fluxos de pré-visualização ao vivo, arquiteturas React e Vue no navegador e backups seguros no IndexedDB.',
    heroTag: 'Engenharia & Tutoriais',
    heroTitle: 'Guias Técnicos e Tutoriais do GB Coder',
    heroDescription: 'Artigos práticos e aprofundados sobre desenvolvimento web moderno diretamente no seu navegador. Códigos verificados e padrões arquiteturais.',
    readArticleLabel: 'Ler Guia Completo',
    publishedOnLabel: 'Publicado em:',
    byAuthorLabel: 'Por:',
    relatedArticlesTitle: 'Guias Técnicos Relacionados',
    backToBlogLabel: '← Voltar ao Blog',
    articles: {
      'html-css-javascript-live-preview': {
        slug: 'html-css-javascript-live-preview',
        title: 'Criando Projetos em HTML/CSS/JavaScript com Pré-Visualização Instantânea',
        description: 'Aprenda a construir componentes web responsivos usando o editor estático do GB Coder, sincronização DOM em tempo real e console virtual.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Prototipagem'],
        intro: 'A prototipagem de interfaces web costuma ser atrasada por ferramentas lentas e configurações de servidores locais. O GB Coder oferece um estúdio ágil no navegador que renderiza seu código em um iframe isolado com sincronização contínua.',
        sections: [
          {
            heading: '1. Estruturação Semântica em HTML5',
            body: 'Escreva código acessível e limpo no painel HTML. O editor organiza automaticamente sua marcação em um documento HTML5 padrão.',
            codeSnippet: `<div class="interactive-card">
  <h2>Controle de Tarefas</h2>
  <input type="text" id="taskInput" placeholder="Nova tarefa..." />
  <button id="addBtn">Adicionar</button>
  <ul id="taskList"></ul>
</div>`,
            codeLang: 'html',
          },
          {
            heading: '2. Aplicação de Estilos CSS com Feedback Imediato',
            body: 'Estilize seu componente no painel CSS. A pré-visualização atualiza conforme você digita, preservando o foco e a rolagem da página.',
            codeSnippet: `.interactive-card {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 8px;
}`,
            codeLang: 'css',
          },
          {
            heading: '3. Inclusão de Lógica com JavaScript Moderno',
            body: 'Programe em ECMAScript moderno. Mensagens de console são capturadas no console virtual integrado para testes imediatos.',
            codeSnippet: `document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('taskInput');
  if (!input.value) return;
  const li = document.createElement('li');
  li.textContent = input.value;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
};`,
            codeLang: 'javascript',
          },
          {
            heading: '4. Testes em Dispositivos Móveis com QR Code',
            body: 'Destaque a janela de pré-visualização para um monitor secundário ou leia o QR code no seu smartphone para testar em um aparelho real.',
          },
        ],
        relatedDocsLink: '/docs#static-workflow',
        relatedDocsLabel: 'Ler documentação do Editor Estático →',
      },
      'react-vue-browser-ide': {
        slug: 'react-vue-browser-ide',
        title: 'Iniciando Projetos React e Vue Diretamente no Navegador',
        description: 'Descubra como criar aplicações baseadas em componentes com React 18 e Vue 3 no GB Coder sem instalar Node.js no seu computador.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['React', 'Vue', 'WebContainer', 'Frontend'],
        intro: 'O desenvolvimento frontend moderno normalmente exige a instalação de Node.js e gerenciadores de pacotes no seu sistema. Com a IDE WebContainer do GB Coder, você roda processos de Node.js e servidores Vite diretamente na aba do navegador.',
        sections: [
          {
            heading: '1. Modelos React 18 no Navegador',
            body: 'Inicie um projeto React 18 pela galeria para obter uma estrutura completa com TSX e autocompletar profissional no Monaco.',
            codeSnippet: `// src/App.tsx
import React, { useState } from 'react';
export function App() {
  const [cliques, setCliques] = useState(0);
  return <button onClick={() => setCliques(cliques + 1)}>Cliques: {cliques}</button>;
}`,
            codeLang: 'tsx',
          },
          {
            heading: '2. Compilação de Componentes Vue 3 (.vue)',
            body: 'Projetos Vue 3 compilam arquivos .vue diretamente na memória do navegador com a Composition API e estilos encapsulados.',
            codeSnippet: `<!-- src/App.vue -->
<template>
  <div>
    <h2>Vue 3 no GB Coder</h2>
    <button @click="val++">Contador: {{ val }}</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const val = ref(0);
</script>`,
            codeLang: 'html',
          },
          {
            heading: '3. Execução de Comandos no Terminal xterm.js',
            body: 'Abra o terminal com Ctrl+` para executar npm install ou rodar scripts de compilação diretamente no micro-SO WebContainer.',
          },
        ],
        relatedDocsLink: '/docs#react-vue',
        relatedDocsLabel: 'Ler documentação dos Frameworks →',
      },
      'browser-project-backup-restore': {
        slug: 'browser-project-backup-restore',
        title: 'Importação, Exportação e Backup Seguro de Projetos no Navegador',
        description: 'Entenda o modelo de armazenamento Local-First no IndexedDB do GB Coder, a validação de integridade SHA-256 e como proteger seu código.',
        date: '2026-10-15',
        author: 'Girish Lade',
        tags: ['IndexedDB', 'Segurança', 'Backups'],
        intro: 'A durabilidade dos dados é essencial ao programar no navegador. O GB Coder alia a persistência local no IndexedDB com exportação em arquivos ZIP protegidos por hash de integridade SHA-256.',
        sections: [
          {
            heading: '1. Como Funciona a Persistência Local-First',
            body: 'Seus arquivos permanecem salvos no IndexedDB da sua máquina em gb-coder-projects-db, garantindo privacidade absoluta.',
          },
          {
            heading: '2. Exportação em ZIP com Hash SHA-256',
            body: 'Ao exportar, o projeto é empacotado em um arquivo ZIP com cálculo automático de hash para certificar sua integridade.',
          },
          {
            heading: '3. Restauração Segura de Projetos',
            body: 'Arraste o arquivo ZIP para o painel de projetos para validar a segurança das pastas e restaurar seu ambiente.',
          },
          {
            heading: '4. Boas Práticas de Arquivamento',
            body: 'Exporte backups ZIP periodicamente após concluir implementações importantes para guardar seus códigos ou abri-los no VS Code de desktop.',
          },
        ],
        relatedDocsLink: '/docs#backup-restore',
        relatedDocsLabel: 'Ler documentação de Backups →',
      },
      'how-gb-coder-works': {
        slug: 'how-gb-coder-works',
        title: 'Como funciona o GB Coder: guia completo do IDE web',
        description: 'Um percurso completo pelo GB Coder: pré-visualização HTML/CSS/JS imediata, Monaco, Node.js no navegador, IA opcional, GitHub, cópias e implementação.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GB Coder', 'IDE no navegador', 'Desenvolvimento web', 'Ferramentas', 'Guia do produto'],
        intro: 'A maioria das ideias web trava antes da primeira linha de código. É preciso um runtime, um gestor de pacotes, um bundler, um editor configurado e uma estrutura de pastas antes de aparecer um único botão no ecrã. O GB Coder, criado pela LadeStack, elimina essa preparação. Abre como um ambiente de desenvolvimento completo dentro de um separador do navegador, guarda os projetos no teu dispositivo e cresce de uma experiência HTML com três painéis até uma aplicação Node.js com terminal. Este guia explica como o produto funciona, para que servem os dois modos de edição e como as funcionalidades se ligam entre si. Quando uma capacidade depende de uma API do navegador ou de uma conta externa, essa dependência é indicada com clareza.',
        sections: [
          {
            heading: '1. Dois motores num só espaço de trabalho',
            body: 'A melhor forma de entender o GB Coder é vê-lo como dois ambientes que partilham a mesma interface. O Editor Estático é uma bancada dedicada a HTML, CSS e JavaScript: escreves, a pré-visualização atualiza-se e não existe qualquer passo de compilação pelo meio. O IDE Avançado executa uma verdadeira cadeia de ferramentas Node.js através do WebContainer, um runtime baseado em WebAssembly que corre dentro do separador. Ambos os modos usam o mesmo painel de projetos, editor Monaco, explorador de ficheiros, painel de pré-visualização e camada de armazenamento local, pelo que mudar de modo parece uma troca de ferramenta e não de produto. Escolhe o modo estático para uma página inicial, uma experiência de CSS, uma demonstração de aula ou um pequeno script. Escolhe o modo avançado quando precisares de pacotes npm, de um servidor de desenvolvimento Vite, de compilação JSX ou de um terminal. O runtime avançado exige um navegador moderno com SharedArrayBuffer e isolamento entre origens; os navegadores atuais baseados em Chromium e o Firefox são as escolhas práticas. Nada é executado numa máquina virtual remota.',
          },
          {
            heading: '2. Criar um projeto em menos de um minuto',
            body: 'O ponto de entrada é o Painel de Projetos. Ao escolher Novo Projeto, tens um sandbox estático vazio, um modelo React 18, um modelo Vue 3 ou um ambiente Node.js com WebContainer. A galeria de modelos acrescenta páginas iniciais, painéis, aplicações utilitárias e protótipos de componentes, cada um com uma estrutura de ficheiros sensata já preparada. O novo espaço é criado imediatamente no IndexedDB, a camada de armazenamento transacional do navegador, pelo que a primeira pré-visualização fica disponível sem transferência, conta ou ida ao servidor. Os nomes dos projetos e as pastas são teus para organizar, e cada espaço está isolado dos restantes. Trabalho existente pode entrar através de um arquivo ZIP ou de um repositório GitHub, e ambos passam por uma revisão antes de os ficheiros serem aplicados. Se nunca usaste o produto, esta é toda a introdução: abrir o painel, escolher um ponto de partida e começar a editar.',
          },
          {
            heading: '3. O editor estático e o ciclo de resposta imediata',
            body: 'O Editor Estático divide o espaço de trabalho em painéis de HTML, CSS e JavaScript. O GB Coder envolve a marcação num documento conforme às normas, pelo que basta um fragmento para começar; não há um doctype de modelo para manter. As alterações são avaliadas num iframe isolado com um pequeno atraso, o que impede que um ritmo rápido de escrita sobrecarregue o renderizador sem perder a sensação de imediatez. Uma consola virtual recolhe a saída log, warn, error e info junto à pré-visualização, o que permite depurar um script pequeno sem abrir as ferramentas de programador. As bibliotecas externas podem ser adicionadas a partir de um CDN ou através do Gestor de Bibliotecas Externas, com opções conhecidas como Tailwind, Bootstrap e conjuntos de ícones. Os projetos estáticos também podem crescer para vários ficheiros e pastas com importações nativas de módulos ES. O compromisso é deliberado: este modo não instala pacotes nem agrupa código, por isso é ideal para aprender, experimentar visualmente e criar demonstrações sem dependências, não para uma aplicação grande com framework.',
          },
          {
            heading: '4. Monaco, inteligência de linguagem e ferramentas de edição',
            body: 'Por baixo da interface está o Monaco, o motor de edição de código aberto que alimenta o VS Code. Essa herança nota-se nos detalhes: sugestões IntelliSense, documentação de tipos em linha, validação de sintaxe, correspondência de parênteses, edição com vários cursores e atalhos configuráveis. TypeScript, JavaScript, HTML, CSS e JSON recebem serviços de linguagem, pelo que os erros são assinalados enquanto escreves e não depois de uma compilação. O editor também suporta vista dividida e um visualizador de diferenças, úteis ao comparar uma revisão ou ao analisar uma proposta da IA. À volta do editor, o GB Coder acrescenta as ferramentas que normalmente exigem aplicações separadas: pesquisa e substituição em todo o projeto com expressões regulares e distinção de maiúsculas, formatação baseada em Prettier para as principais linguagens web, uma paleta de comandos e uma lista de atalhos com pesquisa. A gravação automática funciona em contínuo, com um indicador de estado para saberes como está o ficheiro atual. Isoladamente são pequenas comodidades. Em conjunto, eliminam a troca constante de contexto que faz os editores de navegador parecerem limitados.',
          },
          {
            heading: '5. O IDE avançado: Node.js a sério no navegador',
            body: 'O IDE Avançado é a parte que surpreende. O WebContainer fornece um pequeno sistema operativo compilado para WebAssembly e executa binários genuínos de Node.js dentro da página. Isso significa que o npm install resolve pacotes reais, os scripts npx são executados e um servidor de desenvolvimento Vite arranca numa porta local que é encaminhada para a pré-visualização integrada. O terminal é uma shell completa xterm.js com estilos ANSI e histórico de comandos, não um painel de saída simulado. Como o runtime é local ao separador, a instalação de pacotes e as operações de ficheiros não consomem um contentor remoto. As limitações são igualmente reais: a funcionalidade depende do SharedArrayBuffer e do isolamento entre origens, a memória é limitada pelo navegador e binários nativos ou imagens Docker ficam fora do seu alcance. Para uma aplicação React ou Vue com dependências npm normais, porém, o fluxo de trabalho é o mesmo que seguirias num portátil. A diferença é que o ambiente chega com o projeto em vez de ser reconstruído em cada máquina.',
            codeSnippet: `npm install
npm run dev
# O Vite imprime um URL local; o GB Coder encaminha essa porta para a pré-visualização`,
            codeLang: 'bash',
          },
          {
            heading: '6. Pré-visualização, testes móveis e partilha leve',
            body: 'Todos os projetos têm pré-visualização, e essa pré-visualização é mais do que uma miniatura estática. Corre num iframe isolado, pode ser destacada para a sua própria janela num cenário de dois monitores e oferece tamanhos predefinidos para telemóvel, tablet e ambiente de trabalho. Um código QR abre a pré-visualização num telemóvel real, o que revela problemas de esquema que redimensionar uma janela de ambiente de trabalho não mostra. Para obter feedback rápido, o GB Coder pode codificar um projeto simples de ficheiro único num URL de partilha através do fragmento do URL. Esse fragmento nunca chega a um servidor, pelo que a ligação é autónoma; a contrapartida é um limite prático de tamanho, e os projetos com vários ficheiros são recusados em vez de truncados. Esses projetos podem ser partilhados como arquivo ZIP ou através do fluxo do sandbox. A distinção importa: uma ligação de partilha é uma comodidade para uma demonstração pequena, enquanto um arquivo ou repositório é a entrega duradoura para trabalho a sério.',
          },
          {
            heading: '7. GB Assist, Build with AI e controlo por voz',
            body: 'A IA no GB Coder é opcional e foi concebida para ser revista. O GB Assist é um painel de conversa para perguntas, explicações de erros e alterações planeadas; pode propor edições de ficheiros, mas essas edições aparecem como diff antes de serem aplicadas. O assistente exige que ligues um fornecedor e um modelo, e os pedidos juntamente com o código selecionado são enviados para esse fornecedor quando o usas. O Build with AI segue a direção oposta: descreves uma interface em linguagem comum e recebes um projeto estruturado de HTML, CSS e JavaScript, validado antes de substituir o conteúdo do editor. O Screenshot to Code aceita uma imagem, incluindo uma colada de uma ferramenta de captura de ecrã, e gera uma primeira versão da marcação e dos estilos. O controlo por voz usa o reconhecimento de voz do navegador para executar comandos como executar, formatar, explicar, corrigir, construir, exportar, abrir um painel ou mudar de ficheiro; o Chrome e o Edge oferecem atualmente o melhor suporte, e uma caixa de comandos escritos continua sempre disponível. Nas quatro funcionalidades o padrão é o mesmo: a geração é rápida, mas a aceitação é tua.',
          },
          {
            heading: '8. Instantâneos, cópias de segurança e sincronização com o GitHub',
            body: 'Os projetos são gravados automaticamente no IndexedDB, mas a gravação automática não é um histórico de versões. Os instantâneos criam pontos de controlo com nome do estado atual do projeto, e o visualizador de diferenças mostra o que mudou antes de restaurares um. Para trabalho que precisa de sair do navegador, a exportação ZIP empacota toda a árvore de diretórios e registra um hash de integridade; a importação aceita um arquivo arrastado e mostra uma pré-visualização estrutural antes de escrever os ficheiros. A sincronização com o GitHub fecha o ciclo com um caminho de ida e volta: liga com um token de acesso pessoal, escolhe um repositório existente ou cria um e depois envia ou recebe alterações. Os envios são reunidos num único commit atómico, os ficheiros sem alterações são ignorados e um ramo que se moveu entretanto produz um conflito em vez de sobrescrever silenciosamente o trabalho de outra pessoa. Os ficheiros recebidos passam pelo mesmo fluxo de revisão e aplicação que um arquivo. Os tokens são apenas de sessão por defeito; recordá-los no dispositivo é uma opção que os guarda cifrados, e o tráfego do GitHub vai diretamente do navegador para api.github.com. A LadeStack não precisa de guardar a credencial.',
          },
          {
            heading: '9. Implementação e o último passo',
            body: 'Um projeto só está terminado quando alguém o consegue abrir. O GB Coder permite implementar com um clique no Vercel e no Netlify usando o token da tua própria conta. O serviço deteta se o projeto é um site estático ou uma aplicação Vite, envia os ficheiros adequados e devolve um URL público. Como o token é teu, a implementação fica na tua conta e podes geri-la aí depois. Os projetos estáticos também podem ser exportados como ZIP e enviados para qualquer alojamento, enquanto a sincronização com o GitHub liga o espaço de trabalho a um repositório que pode alimentar uma pipeline de CI. Nenhum destes caminhos prende o projeto ao GB Coder: os ficheiros continuam a ser HTML, CSS, JavaScript e configuração padrão. Essa portabilidade é o objetivo. O navegador é onde o trabalho acontece, não onde fica preso.',
          },
          {
            heading: '10. Privacidade, custo e para quem é',
            body: 'O GB Coder é gratuito, não exige início de sessão nem registo e não tem publicidade. A sua postura predefinida é local-first: os projetos vivem no armazenamento do navegador e a aplicação não precisa de uma conta LadeStack para os abrir. Os dados só saem do dispositivo quando escolhes uma capacidade ligada, como um fornecedor de IA, a sincronização com o GitHub, uma implementação ou um CDN de terceiros incluído no teu próprio código. Esta nuance importa, porque local-first não significa apenas offline. O produto serve quem está a aprender e quer ver HTML e CSS a responder de imediato, professores que precisam de uma aula sem instalações, programadores que fazem o protótipo de uma interface antes de a confiar a um repositório e qualquer pessoa que precise de publicar rapidamente um pequeno utilitário ou demonstração. Serve menos para monorepos enormes, cadeias de ferramentas nativas, serviços baseados em Docker ou organizações que proíbem o armazenamento do navegador. O uso de IA pode gerar custos no fornecedor escolhido, e a implementação depende do teu plano Vercel ou Netlify. A aplicação continua gratuita; os serviços externos são escolha tua.',
          },
          {
            heading: '11. Um fluxo de trabalho repetível',
            body: 'Uma rotina fiável é esta. Abre o Painel de Projetos e cria um espaço no modo que corresponde à tarefa. Constrói primeiro a versão visível mais pequena e depois corrige-a com a consola e a pré-visualização. Adiciona pacotes apenas quando o editor estático não conseguir mesmo resolver o problema. Testa na largura de um telemóvel ou lê o código QR antes de aperfeiçoar os detalhes de ambiente de trabalho. Cria um instantâneo em cada marco relevante. Envia para o GitHub ou exporta um ZIP quando o trabalho precisar de um lugar duradouro. Implementa quando houver algo que valha a pena mostrar. Nenhum destes passos exige uma instalação local, e cada um pode ser repetido noutra máquina com o mesmo armazenamento do navegador ou um clone novo. Se és novo no produto, começa com um projeto estático vazio e um único título; a primeira pré-visualização aparece antes de terminar a configuração que antes era necessária. O Painel de Projetos está em /app/projects.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Ler a documentação completa do GB Coder →',
      },
    },
  },
};

export function getBlogContent(lang: string): BlogTranslations {
  return BLOG_TRANSLATIONS[lang] || BLOG_TRANSLATIONS.en;
}

export function getAllArticleSlugs(): string[] {
  return [
    'html-css-javascript-live-preview',
    'react-vue-browser-ide',
    'browser-project-backup-restore',
    'how-gb-coder-works',
  ];
}
