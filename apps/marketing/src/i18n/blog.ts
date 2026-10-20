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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'Browser IDE vs Desktop IDE: Which Should You Use?',
        description: 'A practical comparison of browser and desktop IDEs: setup, performance, extensions, debugging, Git, offline work, security, and when each one wins.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Browser IDE', 'Desktop IDE', 'Developer Tools', 'Web Development', 'Comparison'],
        intro: 'The desktop IDE has been the default for so long that many developers never question it. Install an editor, add extensions, configure a runtime, clone the repository, and only then write the first line. A browser IDE proposes a different order: open a tab, create a project, and start typing while the environment assembles itself. The trade-off is not a simple victory for either side. A browser IDE removes installation and makes the work portable, but it inherits the limits of the browser sandbox. A desktop IDE demands setup and disk space, but it can reach native toolchains, extensions, and local hardware. This comparison looks at the dimensions that actually change the decision, using GB Coder as the browser-side example because its two modes cover both ends of the spectrum.',
        sections: [
          {
            heading: '1. What Counts as a Browser IDE',
            body: 'A browser IDE is an editor that runs inside a web page and opens or stores a project without a desktop installation. The category includes two very different products. The first is a static workbench: HTML, CSS, and JavaScript panes with a live preview and no package manager. The second is a full runtime environment, where a WebAssembly-based system such as WebContainer executes Node.js, npm, and a development server inside the tab. GB Coder ships both: a Static Editor for dependency-free work and an Advanced IDE for React, Vue, and ordinary npm projects. That distinction matters in every comparison that follows. A static browser editor competes with a scratchpad; a full browser IDE competes with a lightweight desktop setup. Judging every browser editor by the static version is like judging desktop IDEs by a text editor with syntax highlighting.',
          },
          {
            heading: '2. Where Desktop IDEs Still Have the Advantage',
            body: 'Desktop IDEs remain the stronger choice for large, long-lived systems. They can run native compilers, mobile emulators, database clients, Docker, and language servers that inspect an entire monorepo. Extension marketplaces provide debuggers, framework tooling, linters, and integrations that have no browser equivalent. Local files are not subject to a storage quota, and a machine with enough RAM can keep a huge dependency tree and several services running at once. Offline work is normal rather than a special case, and remote development extensions let a thin laptop control a powerful server. None of this is obsolete. If your daily work involves a native SDK, a multi-service backend, or a repository with hundreds of packages, a desktop IDE is not a nostalgic habit; it is the tool that matches the job.',
          },
          {
            heading: '3. Setup Time and Time to First Preview',
            body: 'The clearest difference appears before any code exists. A desktop setup typically means installing the editor, a runtime, a package manager, extensions, and the project’s dependencies, then waiting for the first build. On a new machine, that can consume an afternoon. A browser IDE collapses the sequence: open the site, choose a template or a blank project, and the first preview appears immediately. GB Coder creates the workspace in IndexedDB, so there is no account, download, or server round trip. The caveat is that the app itself must load, and the advanced runtime needs a modern browser with SharedArrayBuffer and cross-origin isolation. For a classroom, a loaner laptop, a Chromebook, or a quick client demo, the difference is decisive. For a developer who already has a tuned workstation, setup cost is paid once and matters less.',
          },
          {
            heading: '4. Performance, Memory, and Runtime Limits',
            body: 'A desktop IDE uses the CPU and RAM directly. A browser IDE runs inside a tab, and the tab is a managed sandbox with its own memory ceiling. That ceiling is generous for a typical Vite application, but it is not infinite. Installing a very large dependency tree, running several watchers, or building an enormous monorepo can exhaust the tab or trigger a reload. WebContainer also cannot run native binaries, Docker images, or tools compiled for the host operating system. The honest comparison is therefore workload-specific. For a landing page, a dashboard, a component library, or a small full-stack prototype, a browser IDE feels indistinguishable from local development. For a project that needs a database engine, a Python service, or a native module, the desktop remains the practical environment. Battery life follows the same pattern: a browser tab is lighter than a full IDE plus a dozen background services, but a long WebContainer session still costs power.',
          },
          {
            heading: '5. Editor Intelligence and Extensions',
            body: 'Editor quality is no longer a browser weakness. GB Coder uses Monaco, the same open-source engine that powers VS Code, so completions, inline documentation, syntax validation, bracket matching, multi-cursor editing, and configurable keybindings are present. TypeScript, JavaScript, HTML, CSS, and JSON receive language services, and a diff viewer makes changes reviewable before they are applied. What a browser IDE lacks is the extension ecosystem. There is no marketplace for a specialized language plugin, a framework inspector, or a custom debugger. Some of that functionality is built in, and some is unnecessary for small projects, but a developer who depends on a particular extension will feel the gap. The trade-off is maintenance: a browser editor arrives already configured, while a desktop editor becomes powerful only after someone curates it.',
          },
          {
            heading: '6. Terminal, Packages, and Build Pipelines',
            body: 'The terminal is the feature that separates a real browser IDE from an online code playground. In GB Coder’s Advanced IDE, WebContainer provides a Node.js runtime, npm install resolves real packages, npx scripts execute, and a Vite server starts on a port forwarded to the preview. The terminal is an xterm.js shell with ANSI output and command history, not a simulated log pane. That covers the common front-end pipeline: install, dev, build, and test with ordinary JavaScript tooling. It does not cover native addons, Docker Compose, or a production database. A desktop IDE can run the whole stack, including the services the front end talks to. The practical rule is simple: if the project’s toolchain is JavaScript end to end, the browser can probably run it; if the toolchain crosses into native code or containers, the desktop is safer.',
          },
          {
            heading: '7. Debugging: Browser Context vs Native Tooling',
            body: 'Browser IDEs have an underrated debugging advantage: the code, the preview, and the browser devtools live in the same context. A CSS change is visible immediately, the virtual console captures logs next to the preview, and a QR code opens the page on a real phone to expose touch and viewport problems. GB Coder also offers viewport presets and a detachable preview for a second monitor. Desktop IDEs win on depth. They attach debuggers to Node processes, set breakpoints across services, profile memory and CPU, inspect native threads, and integrate with mobile emulators. For visual front-end work, the browser loop is shorter. For a subtle race condition in a server process, the desktop debugger is the better instrument. Most developers need both kinds of feedback, which is why the hybrid workflow later in this article matters.',
          },
          {
            heading: '8. Files, Version Control, and Backups',
            body: 'Storage is where browser and desktop models diverge most sharply. A desktop project lives in a folder that any tool can read. A browser project lives in IndexedDB, which is fast and private but tied to the browser profile and vulnerable to storage cleanup. GB Coder mitigates that with named snapshots, a diff viewer, ZIP export with an integrity hash, and import with a structural preview. GitHub sync uses a personal access token, assembles pushes as a single atomic commit, skips unchanged files, and reports a conflict when the remote branch has moved. Desktop Git remains more complete: hooks, submodules, rebase workflows, multiple remotes, and a CLI that every CI system understands. The browser workflow is sufficient for a small project and surprisingly capable for a solo developer, but it is not a replacement for a full Git client on a complex repository. Exporting to GitHub or a ZIP is the bridge between the two.',
          },
          {
            heading: '9. Security, Privacy, and Cost',
            body: 'A browser IDE concentrates risk and convenience in the same place. GB Coder is local-first: projects are stored in the browser, no account is required, and the product is free with no advertising. Data leaves the device only when a connected feature is used, such as an AI provider, GitHub sync, deployment, or a CDN referenced by the project. AI is bring-your-own-key, and prompts plus selected code are sent to the provider you configure. GitHub and Vercel or Netlify deployments use your tokens, and tokens are session-only unless you opt into encrypted storage. That model gives the developer control, but it also means browser storage is the only copy unless a backup exists. A desktop IDE keeps files on disk and typically inherits the operating system’s backup and permission model. Neither is automatically safer; the question is who holds the data and what happens when a device or profile disappears.',
          },
          {
            heading: '10. How to Choose, and How to Combine Them',
            body: 'Choose a browser IDE when the work is visual, short-lived, or needs to be portable: learning HTML and CSS, prototyping an interface, teaching a class, reviewing a design on a Chromebook, or building a small React or Vue app without installing a toolchain. Choose a desktop IDE when the work is long-lived and system-heavy: a monorepo, native SDKs, Docker, mobile builds, a large extension stack, or offline development on a locked-down network. The more interesting answer is to combine them. Start in the browser because the first preview is immediate. Validate the layout at phone width. Take a snapshot. Push to GitHub or export a ZIP. Open the same repository on the desktop when the project needs a native tool, a deeper debugger, or a full Git workflow. The files are standard, so the handoff is ordinary version control rather than a migration. GB Coder is designed for that first half of the cycle, and it does not trap the project in the browser. If you want to test the browser side of the decision, open the Projects Dashboard and create a blank workspace; the comparison becomes concrete in about a minute.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Read the full GB Coder documentation →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'GitHub Sync in a Browser IDE: A Practical Guide',
        description: 'How GitHub sync works in a browser IDE: tokens, atomic commits, pulls, conflicts, file limits, security, and when it beats the desktop terminal.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Version Control', 'Browser IDE', 'Git', 'Developer Workflow'],
        intro: 'Browser IDEs are good at removing setup. They are less obviously good at the part that comes next: giving the work a durable home outside the browser profile. That is usually where a terminal appears—git init, remote add, commit, push. GitHub sync in a browser IDE collapses that sequence into a panel, but it is not magic and it is not a full Git client. It is a focused bridge between a project living in browser storage and a repository living on GitHub. This guide explains how that bridge works in GB Coder, what it uploads, how it handles conflicts and tokens, and where a desktop Git workflow is still the better tool.',
        sections: [
          {
            heading: '1. Why a browser IDE needs GitHub',
            body: 'A browser project is convenient precisely because it needs no folder, no runtime, and no installation. The same property is its weakness. Projects live in the browser profile, which can be cleared by a cleanup tool, lost with a device, or left behind when someone switches computers. Exporting a ZIP creates a copy, but a ZIP is a snapshot without history or a shared remote. GitHub supplies the missing layer: an off-device repository, a commit history, a place to collaborate, and a natural source for CI or deployment. That changes the role of the browser IDE. It is no longer a disposable scratchpad; it can be the place where a small project is written, reviewed, and handed off. The workflow is especially useful on a Chromebook, a school lab machine, or a locked-down corporate laptop where installing Git is not an option. It is also useful for a quick prototype that may later move to a desktop repository. The browser handles the first draft; GitHub makes it durable.',
          },
          {
            heading: '2. What the sync actually does—and what it does not',
            body: 'GB Coder exposes three GitHub actions: Push, New repo, and Pull. Push writes the current project into an existing repository and branch. New repo creates a repository under the connected GitHub account and commits the project as its first content. Pull reads a branch and imports its text files into the editor. All requests go directly from the browser to api.github.com; no LadeStack server sits in the middle holding the token. That narrow scope is deliberate. The panel is not a replacement for the Git command line. It does not provide rebase, merge conflict resolution, submodules, Git LFS, signed commits, hooks, or multiple remotes. It does not show the full commit graph. Those limitations matter on a complex repository. For the common browser project—a static page, a React prototype, a teaching example, or a small utility—the three operations cover the part that actually needs to happen outside the tab.',
          },
          {
            heading: '3. Creating a token with the right scope',
            body: 'GitHub sync uses a personal access token, not a password and not a GB Coder account. A classic token needs the repo scope. A fine-grained token needs read and write access to Contents, and it can be limited to a single repository. The narrower option is the better default: if the token leaks, the damage is confined to the projects it can reach. The connect screen links to GitHub\'s token page and explains both choices. Paste the token, choose whether to remember it on the device, and press Connect. GB Coder verifies it by fetching the account and the repository list, then shows the signed-in login and the remaining API rate limit. Nothing is written to the repository until a push or a new-repo action is confirmed. Treat the token like a password: do not paste it into an issue, a chat, or a screenshot, and revoke it on GitHub when it is no longer needed. A token with an expiry date and access to one repository is a reasonable trade-off for this workflow.',
          },
          {
            heading: '4. Your first push: what actually gets uploaded',
            body: 'The Push tab asks for a repository, a branch, a commit message, and one optional choice: delete files that are missing from the project. Before anything leaves the browser, the panel shows the file count and total size. That preview is useful because the upload is not a raw dump of editor tabs. GB Coder uses the same archive builder as ZIP export and deployment. A plain HTML/CSS/JavaScript project becomes index.html, style.css, script.js, and a README. A React or Vue project becomes a Vite-shaped repository with index.html, package.json, vite.config.js, .gitignore, a README, and the source files under src/. Dependency folders and build output are not included. The commit message is editable and defaults to \'Update from GB Coder\'. The delete-missing option is off by default; turn it on only when the repository should mirror the current project exactly, because it removes remote files that no longer exist locally. For a first push, choose the repository\'s default branch unless you deliberately want a separate branch.',
          },
          {
            heading: '5. Atomic commits and skipped unchanged files',
            body: 'A naive browser sync commits one file at a time. That produces noisy history and leaves a repository half-updated if a request fails in the middle. GB Coder uses GitHub\'s Git Data API instead: it uploads blobs, builds a tree on top of the branch\'s current tree, creates one commit, and moves the branch reference. The result is a single atomic commit per push, including any deletions requested by the delete-missing option. The second optimization is quieter but just as important. Git identifies file content by a SHA-1 hash, and the browser can compute that hash locally with WebCrypto. GB Coder compares the local files with the target tree before uploading. Unchanged files cost no API calls, and a push where nothing changed returns \'already up to date\' instead of creating an empty commit. That keeps history readable and preserves the API budget for real changes. On a small project the difference is invisible; on a project with dozens of files it is the difference between a clean sync and a slow, noisy one.',
          },
          {
            heading: '6. Creating a repository without leaving the browser',
            body: 'The New repo tab creates a repository in the connected account. You provide a name and an optional description, choose public or private, and decide whether GitHub should initialize the repository with a README. Initialization is on by default because an empty repository has no branch head for the first push to build on. GB Coder uses that seed commit, replaces the README with the project\'s own files, and records the initial commit. With initialization turned off, it creates a root commit and the default branch reference itself. After creation, the new repository and default branch are selected for the next push, so there is no second round of setup. This is the shortest path from an idea to a private, versioned repository. It is useful for a classroom assignment, a client demo that should stay private, or a prototype that needs a URL for a CI service. The repository belongs to the GitHub account that owns the token, not to LadeStack, and it can be managed, transferred, or deleted from GitHub afterward.',
          },
          {
            heading: '7. Pulling a repository back into the editor',
            body: 'Pull is the return trip. Enter a repository URL or an owner/name pair, choose a branch, and GB Coder reads the branch tree. It imports text files that an editor can meaningfully open: source files, JSON, Markdown, configuration, and SVG, among others. It skips node_modules, dist, build, .git, .next, and coverage directories. It also caps a pull at 200 files and 512 KB per file; if the branch exceeds either limit, the panel says how many files were left out instead of silently dropping them. Line endings are normalized so a Windows-authored file does not appear to change every line. The imported files do not overwrite the project immediately. They pass through the same review-and-apply flow as a ZIP import, which means you can inspect the detected structure before committing to the change and can undo it afterward. Pull is therefore a good way to continue work on another device, inspect a repository before editing, or recover a project after browser storage was cleared. It is an import, not a merge; if the current project and the branch have diverged, review the result carefully.',
          },
          {
            heading: '8. Conflicts, rate limits, and honest failure modes',
            body: 'The most important safety property is what happens when the remote branch moves while you are editing. GB Coder updates the branch reference with force disabled. If someone else pushed in the meantime, GitHub rejects the update and the panel reports a conflict rather than silently discarding their work. The resolution is deliberately manual: pull the latest branch into a project, review the files, and push again—or move to a desktop Git client for a real merge. Other failures are separated so the message can be acted on. A dead token produces an authentication error and a request to reconnect. A rate limit shows when the GitHub quota resets; the API allows 5,000 requests per hour for authenticated users, and a pull spends one request per file. A missing repository or branch produces a not-found error. Requests time out after 60 seconds, and a long operation can be cancelled from the panel. These details are not glamorous, but they are the difference between a sync tool you can trust and one that fails in ambiguous ways.',
          },
          {
            heading: '9. Token security: session-only by default',
            body: 'Tokens are high-value credentials. A GitHub token with write access can change every repository it can reach. GB Coder keeps a pasted token in a module-scoped map by default, which means it disappears when the tab is closed and is never written to localStorage. The \'Remember on this device\' option is an explicit opt-in. When it is enabled and the page is a secure context, the token is sealed with AES-GCM under a random per-install key before being stored. That protects against a readable token in a browser-profile backup, a synced profile, a shared machine, a screenshot of developer tools, or a support bundle. It does not protect against a script that can run on the same origin, because such a script can call the same storage module. No browser-only design can fully solve that. The practical controls are therefore scope, expiry, and revocation: use a fine-grained token limited to the repository you need, set an expiry, and delete the token on GitHub when the work is done. GitHub traffic goes directly from the browser to api.github.com; LadeStack does not need to hold the credential. Browser storage is still not a backup, so a repository is also a sensible off-device copy.',
          },
          {
            heading: '10. When this workflow is enough—and when it is not',
            body: 'GitHub sync is enough for a large share of browser projects: a static site, a React or Vue prototype, a classroom exercise, a small internal tool, or a demo that needs a remote and a deployment source. It fits a solo developer who wants version control without installing Git, a teacher who needs a reproducible handoff, and anyone working on a machine where a terminal is unavailable. It is not enough for a monorepo with submodules, a repository that depends on Git LFS, a team that needs signed commits or a detailed review of commit history, or a release process built on hooks and multiple remotes. Those are desktop Git jobs, and pretending otherwise would make the browser workflow worse. The useful pattern is hybrid. Start in the browser because the first preview is immediate. Push when the project has a shape worth keeping. Open the same repository on the desktop when the work needs native tooling, a deeper debugger, or a full Git workflow. Pull changes back through GitHub when you return to the browser. The files are ordinary source files, so the handoff is version control rather than migration. To try the browser half, open the Projects Dashboard at /app/projects, create a project, open GitHub sync, and push a first commit. The full setup and feature reference is in the docs.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Read the full GB Coder documentation →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Deploy a Browser IDE Project to Vercel or Netlify',
        description: 'How one-click deployment from a browser IDE works: provider tokens, static uploads, Vercel builds, stable URLs, limits, security, redeploys, and failure modes.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Deployment', 'Vercel', 'Netlify', 'Browser IDE', 'Static Sites'],
        intro: 'Deployment is the moment a browser project stops being a preview. Until then, the code lives in a tab, the files belong to a browser profile, and the only person who can open the result is the person who built it. Vercel and Netlify solve the hosting problem, but their usual workflow assumes a Git repository, a terminal, or a drag-and-drop folder. GB Coder takes a shorter route: a Deploy button packages the current project, sends it through the provider\'s API with your account token, and returns a live HTTPS URL. This guide explains that route in detail: what is uploaded, how the deployment is monitored, why a second deploy can land on the same address, and where the limits are. It is not a general guide to Vercel or Netlify. It is a guide to what the browser panel actually does.',
        sections: [
          {
            heading: '1. Why deploy from the browser at all',
            body: 'The obvious case is a machine where installing a CLI is inconvenient or forbidden. A Chromebook, lab computer, or locked-down corporate desktop can open a browser tab but cannot always install Node.js, Git, and a provider CLI. A browser IDE removes those requirements for editing. Deployment is the last step that usually sends the developer back to a terminal, so keeping it in the same tab closes the loop: the project is edited, previewed, and published without a local toolchain. The second case is speed. A landing page, a prototype, or a client demo may need a URL before it needs a repository or a CI pipeline. The browser panel publishes the current snapshot and tells you where it is live. That convenience has a boundary. This is a direct upload, not a deployment pipeline. It does not watch a branch, run tests, or promote builds between environments; those jobs belong to Git integration or CI. The browser path is for the first URL, not the whole release process.',
          },
          {
            heading: '2. What one-click deployment actually does',
            body: 'The Deploy dialog is a thin control surface over two provider APIs. When you press Deploy now, GB Coder builds the same file bundle that Download ZIP produces. That detail matters: there is no second packaging path that could silently omit a stylesheet or forget an external library. A plain project becomes index.html, style.css, script.js, and a README. A React or Vue project becomes a Vite-shaped tree with index.html, package.json, vite.config.js, .gitignore, a README, and source files under src/. The bundle summary shows the exact file count and uncompressed size before anything leaves the tab. Vercel receives the files as inline JSON on its deployment endpoint. Netlify receives a ZIP as the raw request body. Vercel builds or serves the project; Netlify publishes the uploaded files as a manual deploy. No LadeStack server sits in the middle, and no CLI runs on your machine. One-click describes the interface, not the work: packaging, upload, remote processing, and TLS still happen in sequence.',
          },
          {
            heading: '3. Static sites and Vite apps take different paths',
            body: 'The bundle looks different because the two project types need different treatment. A plain HTML/CSS/JavaScript project has no package.json. Vercel is told to use no framework and serves the files as a static site. Netlify publishes the ZIP as-is, which is also correct for static files. There is nothing to install or compile, so the first deploy is usually quick. A React or Vue project includes a generated package.json, a Vite config, and source files. On Vercel, the provider detects Vite, installs dependencies, runs the production build, and publishes the output. That is a real cloud build, not a simulation in the browser, which is why it can take a minute or more. Vercel also uses the versions recorded in package.json, not whatever was loaded in the editor. Netlify\'s manual ZIP deploy does not run a build command, so the same Vite source tree is published as uploaded rather than compiled. For React or Vue on Netlify, use the provider\'s Git integration; the one-click Netlify path publishes static output only. External libraries and injection settings are already in the bundle. If a Vercel build depends on a private package, a native binary, or a service its build image cannot reach, the build will fail even though the preview works locally. The logs show which case you are in.',
          },
          {
            heading: '4. Getting a token with the right scope',
            body: 'Both providers authenticate with a personal access token. This is not your provider password, and it is not a GB Coder account. The dialog links to the token page for the selected provider and explains the scope in plain language. A Vercel token can publish to every project the account or team can reach; where team-scoped tokens exist, use one. A Netlify token acts on the sites the account can access, so treat it as account-wide unless a narrower option is available. Create the token for this purpose, give it the shortest useful life, and revoke it when the project no longer needs it. GB Coder checks that a token is present and that the bundle fits the local limits before enabling Deploy now. The token is held in memory for the tab by default. Remember on this device is an opt-in: on a secure origin, the token is sealed with AES-GCM before it is written to local storage; otherwise the dialog warns that remembering would store it in plain text. Scope and revocation are the controls that matter most.',
          },
          {
            heading: '5. Your first deployment, step by step',
            body: 'Open a project, then choose Deploy from the toolbar; on a narrow screen it lives in the overflow menu. Vercel is selected by default; Netlify is one click away. The project name is prefilled from the current project. GB Coder lowercases it, replaces invalid characters with hyphens, and shows the hostname it will request, such as your-project.vercel.app. Paste the token, decide whether to remember it, and check the bundle summary. If the file count or size is over the limit, the dialog explains the problem and keeps the deploy button disabled. Press Deploy now. The provider creates the project or site, receives the bundle, and starts processing the deployment. When the deployment is ready, the success screen shows the live URL, file count, upload size, elapsed time, and a QR code for opening the page on a phone. Copy URL and Visit site handle the handoff, and Build logs opens the provider\'s own log view. Netlify site names are global, so a requested name may already be taken. The provider then assigns another name, and GB Coder reports the address that is actually live rather than the one you typed.',
          },
          {
            heading: '6. What the progress screen is really showing',
            body: 'The progress bar moves through packaging, uploading, building, securing, and ready. On Netlify, the building label covers provider processing, not a build command. It reports the client\'s view, not the provider\'s prediction. The percentage advances through the first two stages and then parks below 100 while the provider finishes the remote work. That is deliberate: remote work can take an unpredictable amount of time, and a bar that races to 99 percent would be lying. GB Coder polls the provider every second and a half and updates the message when the state changes. An upload request has a two-minute timeout. The panel stops waiting after three minutes of deployment polling and points you to the dashboard, because the deployment may still finish even when the browser has stopped watching. Cancel, closing the dialog, or pressing Escape aborts the in-flight request and the polling loop. If the provider already accepted the deployment, the deployment can continue on its side; check the dashboard before assuming that cancel meant rollback. The provider\'s logs are the authoritative source when a deployment fails.',
          },
          {
            heading: '7. Redeploys, stable URLs, and provider state',
            body: 'Deploy again returns to the form; it does not immediately resend the last bundle. That is useful when the project changed, the name needs adjusting, or the token expired. Vercel and Netlify then take different routes to the same address. Vercel creates a deployment against the named project and targets production. Repeated deploys with the same project name update that project, and the production alias is preferred over the deployment-specific URL, so the address you share normally stays stable. Netlify needs a site id to update an existing site instead of creating a new one. GB Coder remembers the id in local storage, keyed by the sanitized site name. If you clear browser storage, switch browsers, change the name, or delete the site in Netlify, the next deploy cannot find the old site and creates a new one. Renaming a Netlify project can therefore leave the previous site behind. Both providers keep deployment history, custom domains, access controls, and rollback in their dashboards; the panel exposes only the upload and the live URL. Every deploy here is a production deploy; there is no branch preview or staged environment selector.',
          },
          {
            heading: '8. Limits and failures worth planning for',
            body: 'Two limits are enforced before the request leaves the tab: 900 files and 64 MB of uncompressed content. They sit below the providers\' own ceilings so a huge upload does not fail halfway through a browser session. A media-heavy site should keep large images and video on a CDN or in Git, not inside the project bundle. Errors are separated by cause. A 401 means the token was rejected; a 403 usually means it lacks permission for the account or team; a 413 or 429 means the payload is too large or the provider is rate-limiting; a 422 means the project was rejected as invalid; a 5xx is usually temporary. On Vercel, a framework build failure is different: the upload succeeded and the build failed, so read the build logs rather than pasting a new token. A Vercel build that needs environment variables is another boundary. The dialog has no editor for them. Set the values in Vercel\'s project settings and redeploy; the first build may fail before the project exists. Netlify\'s manual ZIP path has no build step, so this does not apply there. A three-minute polling limit is not a failed deployment, only a failed wait.',
          },
          {
            heading: '9. Security, ownership, and the data boundary',
            body: 'Deployment is direct: the browser calls api.vercel.com or api.netlify.com with your token. There is no proxy that stores the credential, and no LadeStack account is required to use the panel. Tokens are session-only by default and are sealed with AES-GCM only when you opt into remembering one on a secure origin. That protects against a readable token in a browser-profile backup or support bundle, but not against malicious code running on the same origin while the tab is open. Use the narrowest token available, set an expiry, and revoke it when the work is done. Ownership follows the token: the project or site is created in the provider account that owns it, under that provider\'s terms, quotas, logs, and billing. GB Coder remains local-first, but a deploy is an explicit export of the project to the provider. The provider receives the source for the site, and the result is a public HTTPS URL by default; password protection, SSO, and custom domains are provider features. Keep a ZIP or GitHub copy if the browser profile is the only other place the project exists.',
          },
          {
            heading: '10. When the browser deploy is the right tool',
            body: 'Use this path when the job is to get a small site online quickly: a landing page, a portfolio, a classroom demo, a prototype for a client review, or a static documentation page. It also fits when the project already lives in GB Coder and setting up a CLI elsewhere is the only alternative. It is a poor fit for a monorepo, a server-rendered application with a database, a build that needs private registry credentials, a team that releases through branch previews and approvals, or assets that exceed the upload limits. Those are jobs for the provider\'s Git integration, a CI pipeline, or a desktop environment. The two approaches can coexist: draft in the browser, push the source to GitHub when it deserves history, and let CI publish the production build. A practical routine: test the preview at phone width, check the bundle summary, deploy, open the live URL on a second device, and save the build log. To try it, open the Projects Dashboard at /app/projects, create or open a project, and choose Deploy. The setup reference is in the docs.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Read the full GB Coder documentation →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'API Keys and Environment Variables in a Browser IDE',
        description: 'Where API keys and environment variables belong in a browser IDE: client-side exposure, safe storage, token scoping, rotation, deployment, incident response.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Security', 'API Keys', 'Environment Variables', 'Browser IDE', 'Best Practices'],
        intro: 'Every browser IDE meets the same question sooner or later: where do the keys go? The project needs an API endpoint, the AI panel needs a provider key, and the deployment needs an account token. On a desktop machine those values can live in a shell profile or an untracked file. In a browser tab the boundary is different. Anything shipped with the page can be read by the page, and anything stored in the browser profile belongs to that profile. This guide sets out a practical model: which values are safe to publish, which must never reach the client, how GB Coder handles provider credentials, and what to do when a key leaks. It is for people who want the convenience of a browser IDE without pretending that a browser tab is a secret vault.',
        sections: [
          {
            heading: '1. A browser tab is a public build target',
            body: 'The first rule is uncomfortable but simple: a static web app cannot keep a secret. The browser downloads HTML, CSS, and JavaScript, then executes them on the user\'s machine. Anyone can open DevTools, read the network panel, search the bundle, or set a breakpoint and inspect a variable. Minifying the code, splitting it into chunks, or hiding a value in a configuration file changes the effort, not the outcome. A browser IDE adds a sandbox for running project code, but the IDE\'s own interface still runs on the same origin and must read whatever it needs to function. The sandbox is not a vault for values the interface itself has to use. The useful test is straightforward: if a value must be available to code running in the tab, assume the person using the tab can read it, and assume any script that runs on the same origin can read it too. That does not make browser development unsafe. It defines the boundary. Public identifiers can live there; server credentials cannot.',
          },
          {
            heading: '2. What an environment variable means in a static app',
            body: 'In a Node.js server, an environment variable is read at runtime from the process. In a Vite, Create React App, Next.js, or Astro build, public environment variables are different: the bundler replaces references with literal strings while it builds. Vite exposes variables prefixed with VITE_ through import.meta.env; Create React App uses REACT_APP_; Next.js uses NEXT_PUBLIC_; Astro uses PUBLIC_. The prefix is a naming convention, not a security control. Once a value is inlined, it is part of the JavaScript that every visitor downloads. A variable without a public prefix is normally unavailable to client code, which is why server-only values must be read by a server or a serverless function, not by a static page. A .env file is a development and build input, not a runtime secret store. It is useful for local configuration and for keeping values out of source control, but it does not make a value private after the build.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Which keys can live in the browser',
            body: 'Some keys are designed to be public. A Stripe publishable key identifies an account and creates payment tokens; the secret key actually moves money and must stay on a server. A Supabase anon key is safe only when row-level security policies are correct. A Firebase web configuration identifies a project but does not grant administrative access. Map and usage-reporting keys are often restricted by domain or API. These values can ship to the browser, but they still deserve limits: allowed origins, API restrictions, least-privilege roles, quotas, and alerts. The opposite category is easier to state. Service-role keys, database passwords, SMTP credentials, signing secrets, and private AI provider keys must never be in a static bundle. A provider key that belongs to the application is especially dangerous: anyone who finds it can spend the application\'s money. A key that belongs to the user is a different case. It is still a bearer credential, but it is the user\'s own, and the goal is to keep it in the user\'s browser rather than in the project or the repository.',
          },
          {
            heading: '4. How GB Coder handles provider credentials',
            body: 'GB Coder\'s AI panel is bring-your-own-key. The key manager keeps provider keys in memory by default. It does not write them to localStorage. A user can explicitly opt in to sessionStorage persistence, which scopes the value to the current tab and normally clears it when the tab closes. The key is removed from memory and session storage when the user clears it. The manager also binds each key to an authorized endpoint origin, and an outbound request gate checks that a credential is not sent to a destination it was not approved for. Provider errors pass through a redaction layer that strips key patterns and active keys before the message reaches the interface or a log. Custom provider metadata is stored in localStorage, but headers marked secret are scrubbed before persistence and must be entered again. Requests go directly from the browser to the provider endpoint; GB Coder does not proxy the key through a LadeStack server. These measures reduce accidental persistence and cross-origin leakage. They do not change the basic rule: any script that can run on the same origin can read what the page can read. Use a clean profile for sensitive work, and do not install untrusted extensions.',
          },
          {
            heading: '5. Project secrets, .env files, and build-time inlining',
            body: 'Keep secrets out of the project tree. Add .env and its local variants to .gitignore, and commit a .env.example with placeholder names instead. If a project uses Vite, remember that every VITE_ variable is inlined into the production bundle. A value that was convenient during local development becomes public the moment it is used in a production build. Before deploying, inspect the generated assets for key patterns, and treat a hit as an incident rather than a warning. GitHub secret scanning and push protection can catch some known token formats, but they are a backstop, not a substitute for keeping the values out of the repository. A browser IDE\'s ZIP export includes project files. If a .env file is inside the project, it travels with the backup. A backup is not an encrypted vault. Store exports somewhere private, and delete old copies when they are no longer needed. The same applies to screenshots, issue reports, and chat messages: a key pasted into any of them has left the browser.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. GitHub and deployment tokens',
            body: 'GitHub personal access tokens and deployment tokens are more powerful than they look. A classic token with repository and workflow scopes can read private code, change files, and trigger releases. Prefer fine-grained tokens with a single repository, an explicit permission list, and an expiration date. Give a token only the permissions the task needs: contents read and write for a sync, not administration or billing. Create separate tokens for separate devices or purposes, and revoke them when the work is done. Deployment tokens for Vercel or Netlify can publish, replace, or delete projects. If the provider supports project or team scoping, use it; if it supports expiration, set one. Paste the token into the deployment panel only when needed, and do not save it in a project file. In CI, use repository or organization secrets rather than a committed .env, and remember that pull requests from forks normally do not receive secrets. A token that has been screenshotted, shared in a chat, or committed to a public repository should be treated as compromised even if it was deleted a second later.',
          },
          {
            heading: '7. AI provider keys: BYOK without surprises',
            body: 'An AI provider key is a bearer credential with a bill attached. Anyone who has it can send requests, consume quota, and incur charges. Use a key that is scoped to a project, set a spending limit where the provider offers one, and use a separate key for experiments rather than the organization\'s master key. Check usage regularly, especially after sharing a device or installing a new extension. Local providers such as Ollama, LM Studio, and vLLM do not need a cloud key, but their endpoints are still services on the machine. Do not expose a local endpoint to the public internet just to make a demo work. If a custom provider points at a proxy, the proxy can see the key; use only a proxy you control and understand. Prompt injection is a related risk: a file, a web page, or a pasted error message can contain instructions aimed at the assistant. Keep secrets out of prompts and out of files that the assistant is allowed to read. If a key appears in a conversation, rotate it.',
          },
          {
            heading: '8. Shared computers, extensions, and XSS',
            body: 'A shared or lab computer deserves a different routine. Use a private browser profile, do not opt in to session persistence, and close the tab when you finish. If the browser offers to save the key, decline. Clear the site\'s storage if you suspect it was retained. Browser extensions are another part of the boundary: an extension with broad host permissions can often read page content or storage, and a malicious update can arrive after you install it. Use a minimal profile for work that involves credentials. Cross-site scripting is the classic web risk in this context. If an attacker can run a script on the IDE\'s origin, that script can read localStorage and sessionStorage and can make requests while the page is open. Keep dependencies current, avoid untrusted third-party scripts, and consider a content security policy on the deployed site. Clipboard managers and screen-sharing tools also see what you copy and display. Clear the clipboard after moving a key, and pause sharing before opening a provider settings panel.',
          },
          {
            heading: '9. Rotating a leaked key',
            body: 'Rotation is the only reliable response to a leaked key. Revoking first is important: if the old key remains valid while a replacement is prepared, the exposure continues. Create the new key with the narrowest scope that works, update the application or browser settings, redeploy if the value was part of a build, and verify that the old key is rejected. Then check the provider\'s usage and audit logs for activity you did not expect. If the key was committed to Git, deleting the file is not enough; the value remains in history. Rotate first, then rewrite history with a tool such as git filter-repo or BFG, force-push with the team\'s agreement, and ask collaborators to re-clone. Hosting platforms may cache old builds, so make sure the old value cannot be served from a stale bundle. If the key was pasted into an AI chat, a support ticket, or a screenshot, assume it was retained and rotate it. Finally, record what happened, add a check that would have caught it, and shorten the next key\'s lifetime.',
          },
          {
            heading: '10. A practical checklist',
            body: 'Use this sequence before a project leaves the browser. First, classify each value: a public identifier, a user credential, or a server secret. Second, keep server secrets out of the static bundle and put them behind a serverless function or API. Third, expose only values that need the public prefix, and inspect the built assets before deployment. Fourth, keep .env files out of Git, commit a .env.example, and enable secret scanning. Fifth, create scoped, expiring tokens for GitHub and hosting, one per purpose. Sixth, in GB Coder, leave keys in memory unless you are on a trusted device, and opt in to session persistence only when you understand the trade-off. Seventh, never paste a key into a prompt, an issue, a screenshot, or a project file. Eighth, rotate on any doubt, and revoke before you replace. Ninth, use a clean browser profile on shared machines. Tenth, write down the plan for a leak before you need it. A browser IDE can handle credentials responsibly when it treats the browser as a public client rather than a private vault.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'IDE de navegador vs IDE de escritorio: ¿cuál elegir?',
        description: 'Comparativa práctica entre IDE de navegador y de escritorio: instalación, rendimiento, extensiones, depuración, Git, seguridad y cuándo conviene cada uno.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['IDE de navegador', 'IDE de escritorio', 'Herramientas de desarrollo', 'Desarrollo web', 'Comparativa'],
        intro: 'El IDE de escritorio lleva tanto tiempo siendo la opción por defecto que muchos desarrolladores ni se plantean la alternativa. Instalar un editor, añadir extensiones, configurar un entorno de ejecución, clonar el repositorio y, solo entonces, escribir la primera línea. Un IDE de navegador propone otro orden: abrir una pestaña, crear un proyecto y empezar a escribir mientras el entorno se monta solo. El intercambio no es una victoria clara para ninguno de los dos. El IDE de navegador elimina la instalación y hace que el trabajo sea portátil, pero hereda los límites del sandbox del navegador. El IDE de escritorio exige instalación y espacio en disco, pero llega a toolchains nativos, extensiones y hardware local. Esta comparación analiza las dimensiones que de verdad cambian la decisión, con GB Coder como ejemplo del lado del navegador porque sus dos modos cubren ambos extremos.',
        sections: [
          {
            heading: '1. Qué cuenta como IDE de navegador',
            body: 'Un IDE de navegador es un editor que se ejecuta dentro de una página web y abre o guarda un proyecto sin instalación en el escritorio. Dentro de la categoría conviven dos productos muy distintos. El primero es un banco de trabajo estático: paneles de HTML, CSS y JavaScript con vista previa en vivo y sin gestor de paquetes. El segundo es un entorno de ejecución completo, donde un sistema basado en WebAssembly como WebContainer ejecuta Node.js, npm y un servidor de desarrollo dentro de la pestaña. GB Coder incluye ambos: un Editor Estático para trabajo sin dependencias y un IDE Avanzado para React, Vue y proyectos npm convencionales. Esa distinción importa en todas las comparaciones que siguen. Un editor estático compite con un bloc de notas; un IDE de navegador completo compite con una configuración de escritorio ligera. Juzgar a todos los IDE de navegador por la versión estática es como juzgar a los IDE de escritorio por un editor de texto con resaltado de sintaxis.',
          },
          {
            heading: '2. Dónde siguen ganando los IDE de escritorio',
            body: 'Los IDE de escritorio siguen siendo la mejor opción para sistemas grandes y de largo recorrido. Pueden ejecutar compiladores nativos, emuladores móviles, clientes de bases de datos, Docker y servidores de lenguaje que analizan un monorepo entero. Los mercados de extensiones ofrecen depuradores, herramientas de framework, linters e integraciones que no tienen equivalente en el navegador. Los archivos locales no dependen de una cuota de almacenamiento, y un equipo con suficiente RAM mantiene a la vez un árbol de dependencias enorme y varios servicios. El trabajo sin conexión es lo normal, no una excepción, y las extensiones de desarrollo remoto permiten que un portátil ligero controle un servidor potente. Nada de esto está obsoleto. Si tu día a día incluye un SDK nativo, un backend con varios servicios o un repositorio con cientos de paquetes, el IDE de escritorio no es una costumbre nostálgica: es la herramienta que encaja con el trabajo.',
          },
          {
            heading: '3. Tiempo de instalación y primera vista previa',
            body: 'La diferencia más clara aparece antes de que exista código. Una configuración de escritorio suele implicar instalar el editor, un runtime, un gestor de paquetes, extensiones y las dependencias del proyecto, y después esperar la primera compilación. En un equipo nuevo, eso puede llevar una tarde. Un IDE de navegador reduce la secuencia: abrir el sitio, elegir una plantilla o un proyecto en blanco y ver la primera vista previa al instante. GB Coder crea el espacio de trabajo en IndexedDB, así que no hay cuenta, descarga ni ida y vuelta al servidor. La advertencia es que la aplicación tiene que cargarse, y el entorno avanzado necesita un navegador moderno con SharedArrayBuffer y aislamiento entre orígenes. Para un aula, un portátil prestado, un Chromebook o una demo rápida para un cliente, la diferencia es decisiva. Para quien ya tiene una estación de trabajo ajustada, el coste de instalación se paga una vez y pesa menos.',
          },
          {
            heading: '4. Rendimiento, memoria y límites del runtime',
            body: 'Un IDE de escritorio usa la CPU y la RAM directamente. Un IDE de navegador vive dentro de una pestaña, y la pestaña es un sandbox gestionado con su propio techo de memoria. Ese techo es generoso para una aplicación Vite típica, pero no es infinito. Instalar un árbol de dependencias muy grande, ejecutar varios watchers o compilar un monorepo enorme puede agotar la pestaña o provocar una recarga. WebContainer tampoco puede ejecutar binarios nativos, imágenes Docker ni herramientas compiladas para el sistema operativo anfitrión. La comparación honesta depende, por tanto, de la carga de trabajo. Para una landing page, un panel, una biblioteca de componentes o un prototipo full-stack pequeño, el IDE de navegador se siente igual que el desarrollo local. Para un proyecto que necesita un motor de base de datos, un servicio Python o un módulo nativo, el escritorio sigue siendo el entorno práctico. La batería sigue el mismo patrón: una pestaña consume menos que un IDE completo con una docena de servicios en segundo plano, pero una sesión larga de WebContainer también gasta energía.',
          },
          {
            heading: '5. Inteligencia del editor y extensiones',
            body: 'La calidad del editor ya no es un punto débil del navegador. GB Coder usa Monaco, el mismo motor de código abierto que impulsa VS Code, así que tiene autocompletado, documentación en línea, validación de sintaxis, emparejamiento de corchetes, edición multicursor y atajos configurables. TypeScript, JavaScript, HTML, CSS y JSON reciben servicios de lenguaje, y un visor de diferencias permite revisar los cambios antes de aplicarlos. Lo que falta en un IDE de navegador es el ecosistema de extensiones. No hay un mercado para un plugin de lenguaje especializado, un inspector de framework o un depurador personalizado. Parte de esa funcionalidad viene integrada y parte no hace falta en proyectos pequeños, pero quien depende de una extensión concreta notará el hueco. El intercambio está en el mantenimiento: un editor de navegador llega ya configurado, mientras que un editor de escritorio solo se vuelve potente después de que alguien lo cura.',
          },
          {
            heading: '6. Terminal, paquetes y pipelines de compilación',
            body: 'La terminal es la función que separa un IDE de navegador real de un playground de código en línea. En el IDE Avanzado de GB Coder, WebContainer ofrece un runtime de Node.js, npm install resuelve paquetes reales, los scripts de npx se ejecutan y un servidor Vite arranca en un puerto reenviado a la vista previa. La terminal es un shell xterm.js con salida ANSI e historial de comandos, no un panel de logs simulado. Eso cubre el pipeline front-end habitual: instalar, desarrollar, compilar y probar con herramientas JavaScript normales. No cubre addons nativos, Docker Compose ni una base de datos de producción. Un IDE de escritorio puede ejecutar toda la pila, incluidos los servicios con los que habla el front-end. La regla práctica es sencilla: si la cadena de herramientas es JavaScript de principio a fin, el navegador probablemente pueda con ella; si cruza hacia código nativo o contenedores, el escritorio es más seguro.',
          },
          {
            heading: '7. Depuración: contexto del navegador frente a herramientas nativas',
            body: 'Los IDE de navegador tienen una ventaja de depuración poco valorada: el código, la vista previa y las herramientas del navegador viven en el mismo contexto. Un cambio de CSS se ve al instante, la consola virtual recoge los logs junto a la vista previa y un código QR abre la página en un teléfono real para revelar problemas táctiles y de viewport. GB Coder también ofrece presets de viewport y una vista previa desacoplable para un segundo monitor. Los IDE de escritorio ganan en profundidad. Se conectan a procesos Node, ponen breakpoints en varios servicios, perfilan memoria y CPU, inspeccionan hilos nativos y se integran con emuladores móviles. Para trabajo visual de front-end, el ciclo del navegador es más corto. Para una condición de carrera sutil en un proceso de servidor, el depurador de escritorio es mejor instrumento. Casi todos los desarrolladores necesitan ambos tipos de feedback, y por eso importa el flujo híbrido que veremos al final.',
          },
          {
            heading: '8. Archivos, control de versiones y copias de seguridad',
            body: 'El almacenamiento es donde los modelos de navegador y escritorio más se separan. Un proyecto de escritorio vive en una carpeta que cualquier herramienta puede leer. Un proyecto de navegador vive en IndexedDB, que es rápido y privado, pero está atado al perfil del navegador y expuesto a la limpieza de almacenamiento. GB Coder lo mitiga con instantáneas con nombre, visor de diferencias, exportación ZIP con hash de integridad e importación con vista previa estructural. La sincronización con GitHub usa un token de acceso personal, agrupa los envíos en un único commit atómico, omite archivos sin cambios y avisa de un conflicto cuando la rama remota se ha movido. Git de escritorio sigue siendo más completo: hooks, submódulos, flujos de rebase, varios remotos y una CLI que entiende cualquier sistema de CI. El flujo de navegador basta para un proyecto pequeño y sorprende para un desarrollador solo, pero no sustituye a un cliente Git completo en un repositorio complejo. Exportar a GitHub o a un ZIP es el puente entre ambos.',
          },
          {
            heading: '9. Seguridad, privacidad y coste',
            body: 'Un IDE de navegador concentra riesgo y comodidad en el mismo lugar. GB Coder es local-first: los proyectos se guardan en el navegador, no hace falta cuenta y el producto es gratuito y sin publicidad. Los datos solo salen del dispositivo cuando se usa una función conectada, como un proveedor de IA, la sincronización con GitHub, el despliegue o un CDN al que haga referencia el proyecto. La IA es bring-your-own-key, y los prompts junto con el código seleccionado se envían al proveedor que configures. GitHub y los despliegues en Vercel o Netlify usan tus tokens, y estos solo duran la sesión salvo que actives el almacenamiento cifrado. Ese modelo da control al desarrollador, pero también significa que el almacenamiento del navegador es la única copia si no hay un backup. Un IDE de escritorio mantiene los archivos en disco y suele heredar el modelo de copias y permisos del sistema operativo. Ninguno es automáticamente más seguro; la pregunta es quién tiene los datos y qué pasa cuando un dispositivo o un perfil desaparece.',
          },
          {
            heading: '10. Cómo elegir y cómo combinarlos',
            body: 'Elige un IDE de navegador cuando el trabajo sea visual, breve o necesite portabilidad: aprender HTML y CSS, prototipar una interfaz, dar clase, revisar un diseño en un Chromebook o crear una app pequeña de React o Vue sin instalar un toolchain. Elige un IDE de escritorio cuando el trabajo sea duradero y pesado: un monorepo, SDK nativos, Docker, compilaciones móviles, un gran stack de extensiones o desarrollo sin conexión en una red restringida. La respuesta más interesante es combinarlos. Empieza en el navegador porque la primera vista previa es inmediata. Valida el layout a ancho de teléfono. Toma una instantánea. Sube a GitHub o exporta un ZIP. Abre el mismo repositorio en el escritorio cuando el proyecto necesite una herramienta nativa, un depurador más profundo o un flujo Git completo. Los archivos son estándar, así que el traspaso es control de versiones normal, no una migración. GB Coder está pensado para esa primera mitad del ciclo y no atrapa el proyecto en el navegador. Si quieres probar el lado del navegador de la decisión, abre el Panel de Proyectos y crea un espacio en blanco; la comparación se vuelve concreta en un minuto.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Leer la documentación completa de GB Coder →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'Sincronización con GitHub en un IDE de navegador',
        description: 'Cómo funciona la sincronización con GitHub en un IDE de navegador: tokens, commits atómicos, pulls, conflictos, límites y seguridad.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Control de versiones', 'IDE de navegador', 'Git', 'Flujo de trabajo'],
        intro: 'Los IDE de navegador son buenos eliminando la configuración inicial. No lo son tanto en la parte que viene después: dar al trabajo un hogar duradero fuera del perfil del navegador. Ahí suele aparecer una terminal: git init, remote add, commit, push. La sincronización con GitHub en un IDE de navegador reduce esa secuencia a un panel, pero no es magia ni un cliente Git completo. Es un puente específico entre un proyecto que vive en el almacenamiento del navegador y un repositorio que vive en GitHub. Esta guía explica cómo funciona ese puente en GB Coder, qué sube, cómo maneja conflictos y tokens, y dónde un flujo de Git de escritorio sigue siendo mejor.',
        sections: [
          {
            heading: '1. Por qué un IDE de navegador necesita GitHub',
            body: 'Un proyecto en el navegador es cómodo precisamente porque no necesita carpeta, entorno de ejecución ni instalación. Esa misma propiedad es su debilidad. Los proyectos viven en el perfil del navegador, que puede borrar una herramienta de limpieza, perderse con un dispositivo o quedarse atrás cuando alguien cambia de computadora. Exportar un ZIP crea una copia, pero un ZIP es una instantánea sin historial ni remoto compartido. GitHub aporta la capa que falta: un repositorio fuera del dispositivo, un historial de commits, un lugar para colaborar y una fuente natural para CI o despliegue. Eso cambia el papel del IDE de navegador. Ya no es un bloc de notas desechable; puede ser el lugar donde un proyecto pequeño se escribe, se revisa y se entrega. El flujo resulta especialmente útil en un Chromebook, una máquina de laboratorio escolar o un portátil corporativo bloqueado donde instalar Git no es una opción. También sirve para un prototipo rápido que más adelante puede pasar a un repositorio de escritorio. El navegador se encarga del primer borrador; GitHub lo hace duradero.',
          },
          {
            heading: '2. Qué hace la sincronización y qué no',
            body: 'GB Coder ofrece tres acciones de GitHub: Push, New repo y Pull. Push escribe el proyecto actual en un repositorio y una rama existentes. New repo crea un repositorio en la cuenta de GitHub conectada y confirma el proyecto como su primer contenido. Pull lee una rama e importa sus archivos de texto al editor. Todas las solicitudes van directamente del navegador a api.github.com; ningún servidor de LadeStack se interpone para guardar el token. Ese alcance limitado es intencional. El panel no sustituye la línea de comandos de Git. No ofrece rebase, resolución de conflictos de merge, submódulos, Git LFS, commits firmados, hooks ni múltiples remotos. Tampoco muestra el grafo completo de commits. Esas limitaciones importan en un repositorio complejo. Para el proyecto habitual en el navegador —una página estática, un prototipo de React, un ejemplo didáctico o una utilidad pequeña—, las tres operaciones cubren la parte que realmente debe ocurrir fuera de la pestaña.',
          },
          {
            heading: '3. Crear un token con el alcance correcto',
            body: 'La sincronización con GitHub usa un token de acceso personal, no una contraseña ni una cuenta de GB Coder. Un token clásico necesita el alcance repo. Un token fine-grained necesita acceso de lectura y escritura a Contents, y puede limitarse a un solo repositorio. La opción más estrecha es el mejor valor predeterminado: si el token se filtra, el daño queda limitado a los proyectos que puede alcanzar. La pantalla de conexión enlaza a la página de tokens de GitHub y explica ambas opciones. Pega el token, elige si quieres recordarlo en el dispositivo y pulsa Connect. GB Coder lo verifica obteniendo la cuenta y la lista de repositorios, y luego muestra el usuario conectado y el límite de la API restante. No se escribe nada en el repositorio hasta que se confirma un push o la creación de un repositorio. Trata el token como una contraseña: no lo pegues en un issue, un chat o una captura de pantalla, y revócalo en GitHub cuando ya no lo necesites. Un token con fecha de caducidad y acceso a un solo repositorio es un equilibrio razonable para este flujo.',
          },
          {
            heading: '4. El primer push: qué se sube realmente',
            body: 'La pestaña Push pide un repositorio, una rama, un mensaje de commit y una opción: eliminar los archivos que faltan en el proyecto. Antes de que algo salga del navegador, el panel muestra la cantidad de archivos y el tamaño total. Esa vista previa es útil porque la carga no es un volcado directo de las pestañas del editor. GB Coder usa el mismo generador de archivos que la exportación ZIP y el despliegue. Un proyecto simple de HTML/CSS/JavaScript se convierte en index.html, style.css, script.js y un README. Un proyecto de React o Vue se convierte en un repositorio con estructura de Vite: index.html, package.json, vite.config.js, .gitignore, un README y los archivos fuente bajo src/. Las carpetas de dependencias y la salida de compilación no se incluyen. El mensaje de commit es editable y por defecto es \'Update from GB Coder\'. La opción de eliminar archivos ausentes está desactivada por defecto; actívala solo cuando el repositorio deba reflejar exactamente el proyecto actual, porque borra archivos remotos que ya no existen en local. Para el primer push, elige la rama predeterminada del repositorio salvo que quieras deliberadamente una rama separada.',
          },
          {
            heading: '5. Commits atómicos y archivos sin cambios omitidos',
            body: 'Una sincronización ingenua desde el navegador confirma un archivo a la vez. Eso produce un historial ruidoso y deja el repositorio a medio actualizar si una solicitud falla en el medio. GB Coder usa la API Git Data de GitHub: sube blobs, construye un árbol sobre el árbol actual de la rama, crea un commit y mueve la referencia de la rama. El resultado es un único commit atómico por push, incluidas las eliminaciones solicitadas por la opción correspondiente. La segunda optimización es más silenciosa pero igual de importante. Git identifica el contenido de un archivo mediante un hash SHA-1, y el navegador puede calcularlo localmente con WebCrypto. GB Coder compara los archivos locales con el árbol destino antes de subirlos. Los archivos sin cambios no gastan llamadas a la API, y un push sin cambios devuelve \'already up to date\' en lugar de crear un commit vacío. Eso mantiene el historial legible y reserva el presupuesto de la API para cambios reales. En un proyecto pequeño la diferencia es invisible; en uno con decenas de archivos es la diferencia entre una sincronización limpia y otra lenta y ruidosa.',
          },
          {
            heading: '6. Crear un repositorio sin salir del navegador',
            body: 'La pestaña New repo crea un repositorio en la cuenta conectada. Indicas un nombre y una descripción opcional, eliges público o privado y decides si GitHub debe inicializar el repositorio con un README. La inicialización está activada por defecto porque un repositorio vacío no tiene una cabeza de rama sobre la que construir el primer push. GB Coder usa ese commit inicial, reemplaza el README con los archivos del proyecto y registra el commit inicial. Con la inicialización desactivada, crea un commit raíz y la referencia de la rama predeterminada por su cuenta. Después de la creación, el nuevo repositorio y la rama predeterminada quedan seleccionados para el siguiente push, así que no hay una segunda ronda de configuración. Es el camino más corto de una idea a un repositorio privado y versionado. Resulta útil para una tarea de clase, una demo para un cliente que debe permanecer privada o un prototipo que necesita una URL para un servicio de CI. El repositorio pertenece a la cuenta de GitHub dueña del token, no a LadeStack, y puede gestionarse, transferirse o eliminarse desde GitHub después.',
          },
          {
            heading: '7. Traer un repositorio de vuelta al editor',
            body: 'Pull es el viaje de vuelta. Introduce la URL de un repositorio o un par propietario/nombre, elige una rama y GB Coder lee el árbol de la rama. Importa archivos de texto que un editor puede abrir de forma útil: código fuente, JSON, Markdown, configuración y SVG, entre otros. Omite los directorios node_modules, dist, build, .git, .next y coverage. También limita un pull a 200 archivos y 512 KB por archivo; si la rama supera cualquiera de los dos límites, el panel indica cuántos archivos quedaron fuera en lugar de descartarlos en silencio. Los finales de línea se normalizan para que un archivo creado en Windows no parezca cambiar en todas las líneas. Los archivos importados no sobrescriben el proyecto de inmediato. Pasan por el mismo flujo de revisión y aplicación que una importación ZIP, así que puedes inspeccionar la estructura detectada antes de confirmar el cambio y deshacerlo después. Pull es, por tanto, una buena forma de continuar el trabajo en otro dispositivo, inspeccionar un repositorio antes de editarlo o recuperar un proyecto después de que se borrara el almacenamiento del navegador. Es una importación, no un merge; si el proyecto actual y la rama han divergido, revisa el resultado con cuidado.',
          },
          {
            heading: '8. Conflictos, límites de la API y fallos honestos',
            body: 'La propiedad de seguridad más importante es qué ocurre cuando la rama remota avanza mientras editas. GB Coder actualiza la referencia de la rama con force desactivado. Si otra persona hizo push mientras tanto, GitHub rechaza la actualización y el panel informa un conflicto en lugar de descartar su trabajo en silencio. La resolución es deliberadamente manual: trae la última versión de la rama a un proyecto, revisa los archivos y vuelve a hacer push, o pasa a un cliente Git de escritorio para un merge real. Otros fallos se separan para que el mensaje permita actuar. Un token caducado produce un error de autenticación y una petición de reconexión. Un límite de velocidad muestra cuándo se restablece la cuota de GitHub; la API permite 5.000 solicitudes por hora para usuarios autenticados, y un pull gasta una solicitud por archivo. Un repositorio o una rama inexistentes producen un error de no encontrado. Las solicitudes tienen un tiempo de espera de 60 segundos y una operación larga puede cancelarse desde el panel. Estos detalles no son glamorosos, pero marcan la diferencia entre una herramienta de sincronización fiable y otra que falla de forma ambigua.',
          },
          {
            heading: '9. Seguridad del token: solo en la sesión por defecto',
            body: 'Los tokens son credenciales de alto valor. Un token de GitHub con acceso de escritura puede modificar todos los repositorios que alcance. GB Coder guarda un token pegado en un mapa dentro del ámbito del módulo por defecto, lo que significa que desaparece al cerrar la pestaña y nunca se escribe en localStorage. La opción \'Recordar en este dispositivo\' es un opt-in explícito. Cuando se activa y la página está en un contexto seguro, el token se sella con AES-GCM bajo una clave aleatoria por instalación antes de guardarse. Eso protege contra un token legible en una copia de seguridad del perfil del navegador, un perfil sincronizado, una máquina compartida, una captura de las herramientas de desarrollo o un paquete de soporte. No protege contra un script que pueda ejecutarse en el mismo origen, porque ese script puede llamar al mismo módulo de almacenamiento. Ningún diseño exclusivo del navegador puede resolverlo del todo. Los controles prácticos son, por tanto, alcance, caducidad y revocación: usa un token fine-grained limitado al repositorio que necesitas, establece una caducidad y elimina el token en GitHub cuando termines. El tráfico de GitHub va directamente del navegador a api.github.com; LadeStack no necesita custodiar la credencial. El almacenamiento del navegador sigue sin ser una copia de seguridad, así que un repositorio también es una copia sensata fuera del dispositivo.',
          },
          {
            heading: '10. Cuándo este flujo es suficiente y cuándo no',
            body: 'La sincronización con GitHub es suficiente para una gran parte de los proyectos de navegador: un sitio estático, un prototipo de React o Vue, un ejercicio de clase, una pequeña herramienta interna o una demo que necesita un remoto y una fuente de despliegue. Encaja con un desarrollador individual que quiere control de versiones sin instalar Git, con un profesor que necesita una entrega reproducible y con cualquiera que trabaje en una máquina sin terminal. No es suficiente para un monorepo con submódulos, un repositorio que depende de Git LFS, un equipo que necesita commits firmados o una revisión detallada del historial, ni un proceso de release basado en hooks y múltiples remotos. Esos son trabajos de Git de escritorio, y fingir lo contrario empeoraría el flujo del navegador. El patrón útil es híbrido. Empieza en el navegador porque la primera vista previa es inmediata. Haz push cuando el proyecto tenga una forma que merezca conservarse. Abre el mismo repositorio en el escritorio cuando el trabajo necesite herramientas nativas, un depurador más profundo o un flujo Git completo. Trae los cambios de vuelta por GitHub cuando regreses al navegador. Los archivos son archivos fuente normales, así que la transición es control de versiones, no migración. Para probar la mitad del navegador, abre el Projects Dashboard en /app/projects, crea un proyecto, abre GitHub sync y haz el primer commit. La configuración completa y la referencia de funciones están en la documentación.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Leer la documentación completa de GB Coder →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Despliegue en Vercel o Netlify desde un IDE de navegador',
        description: 'Cómo funciona el despliegue desde un IDE de navegador: tokens, cargas estáticas, builds de Vercel, URLs estables, límites, seguridad, redeploys y fallos.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Despliegue', 'Vercel', 'Netlify', 'IDE de navegador', 'Sitios estáticos'],
        intro: 'El despliegue es el momento en que un proyecto de navegador deja de ser una vista previa. Hasta entonces, el código vive en una pestaña, los archivos pertenecen a un perfil del navegador y la única persona que puede abrir el resultado es quien lo construyó. Vercel y Netlify resuelven el alojamiento, pero su flujo habitual presupone un repositorio Git, una terminal o una carpeta arrastrada. GB Coder toma un camino más corto: un botón Deploy empaqueta el proyecto actual, lo envía por la API del proveedor con el token de tu cuenta y devuelve una URL HTTPS pública. Esta guía explica ese camino en detalle: qué se sube, cómo se sigue el despliegue, por qué un segundo despliegue puede conservar la misma dirección y dónde están los límites. No es una guía general de Vercel o Netlify, sino de lo que hace realmente el panel del navegador.',
        sections: [
          {
            heading: '1. Por qué desplegar desde el navegador',
            body: 'El caso evidente es una máquina donde instalar una CLI resulta incómodo o está prohibido. Un Chromebook, un equipo de laboratorio o un escritorio corporativo bloqueado pueden abrir una pestaña, pero no siempre permiten instalar Node.js, Git y la CLI del proveedor. Un IDE de navegador ya elimina esos requisitos para editar. El despliegue suele ser el último paso que devuelve al desarrollador a una terminal; mantenerlo en la misma pestaña cierra el circuito: el proyecto se edita, se previsualiza y se publica sin toolchain local. El segundo caso es la velocidad. Una landing page, un prototipo o una demo para un cliente pueden necesitar una URL antes de necesitar un repositorio o un pipeline de CI. El panel del navegador publica la instantánea actual y dice dónde está viva. Esa comodidad tiene un límite. Esto es una carga directa, no un pipeline de despliegue. No vigila una rama, no ejecuta pruebas ni promueve compilaciones entre entornos; eso corresponde a la integración Git del proveedor o a CI. El camino del navegador sirve para la primera URL, no para todo el proceso de release.',
          },
          {
            heading: '2. Qué hace realmente el despliegue en un clic',
            body: 'El diálogo Deploy es una superficie de control fina sobre dos API de proveedor. Al pulsar Deploy now, GB Coder construye el mismo paquete de archivos que genera Download ZIP. Ese detalle importa: no hay una segunda ruta de empaquetado que pueda omitir una hoja de estilos o una biblioteca externa. Un proyecto simple se convierte en index.html, style.css, script.js y un README. Un proyecto React o Vue se convierte en un árbol con forma de Vite: index.html, package.json, vite.config.js, .gitignore, un README y archivos fuente bajo src/. El resumen del paquete muestra el número exacto de archivos y el tamaño sin comprimir antes de que algo salga de la pestaña. Vercel recibe los archivos como JSON en línea en su endpoint de despliegue. Netlify recibe un ZIP como cuerpo bruto de la petición. Vercel compila o sirve el proyecto; Netlify publica los archivos subidos como despliegue manual. Ningún servidor de LadeStack se interpone y no se ejecuta ninguna CLI en tu máquina. El navegador es el cliente, el proveedor es el host y el token es la única credencial. Un clic describe la interfaz, no el trabajo: empaquetado, carga, procesamiento remoto y TLS siguen ocurriendo en secuencia.',
          },
          {
            heading: '3. Sitios estáticos y apps Vite: caminos distintos',
            body: 'El paquete es distinto porque los dos tipos de proyecto necesitan trato distinto. Un proyecto HTML/CSS/JavaScript simple no tiene package.json. A Vercel se le indica que no use framework y sirve los archivos como sitio estático. Netlify publica el ZIP tal cual, lo que también es correcto para archivos estáticos. No hay nada que instalar ni compilar, así que el primer despliegue suele ser rápido. Un proyecto React o Vue incluye un package.json generado, una configuración de Vite y archivos fuente. En Vercel, el proveedor detecta Vite, instala dependencias, ejecuta la compilación de producción y publica la salida. Es una compilación real en la nube, no una simulación en el navegador, y por eso puede tardar un minuto o más. Vercel también usa las versiones registradas en package.json, no lo que estuviera cargado en el editor. El despliegue manual por ZIP de Netlify no ejecuta una orden de compilación, así que el mismo árbol de fuentes Vite se publica tal como se subió, sin compilar. Para React o Vue en Netlify, usa la integración Git del proveedor; la ruta de un clic de Netlify solo publica salida estática. Las bibliotecas externas y los ajustes de inyección ya están en el paquete. Si una compilación de Vercel depende de un paquete privado, un binario nativo o un servicio inalcanzable desde su imagen de compilación, la compilación fallará aunque la vista previa funcione. Los logs indican en cuál de esos casos estás.',
          },
          {
            heading: '4. Un token con el alcance correcto',
            body: 'Ambos proveedores se autentican con un token de acceso personal. No es la contraseña del proveedor ni una cuenta de GB Coder. El diálogo enlaza a la página de tokens del proveedor seleccionado y explica el alcance con claridad. Un token de Vercel puede publicar en todos los proyectos a los que llega la cuenta o el equipo; cuando existan tokens con alcance de equipo, úsalos. Un token de Netlify actúa sobre los sitios a los que accede la cuenta, así que trátalo como global salvo que haya una opción más estrecha. Crea el token para este propósito, dale la vida útil más corta posible y revócalo cuando el proyecto ya no lo necesite. GB Coder comprueba que hay un token y que el paquete cabe en los límites locales antes de habilitar Deploy now. El token se mantiene en memoria para la pestaña por defecto. Recordar en este dispositivo es un opt-in: en un origen seguro, el token se sella con AES-GCM antes de escribirse en localStorage; si no, el diálogo advierte de que recordarlo lo guardaría en texto plano. El alcance y la revocación son los controles que más importan.',
          },
          {
            heading: '5. El primer despliegue, paso a paso',
            body: 'Abre un proyecto y elige Deploy en la barra de herramientas; en pantallas estrechas está en el menú de desbordamiento. Vercel aparece seleccionado por defecto; Netlify está a un clic. El nombre del proyecto se rellena con el proyecto actual. GB Coder lo pasa a minúsculas, sustituye caracteres inválidos por guiones y muestra el hostname que solicitará, por ejemplo tu-proyecto.vercel.app. Pega el token, decide si quieres recordarlo y revisa el resumen del paquete. Si el número de archivos o el tamaño supera el límite, el diálogo explica el problema y mantiene el botón desactivado. Pulsa Deploy now. El proveedor crea el proyecto o sitio, recibe el paquete y empieza a procesar el despliegue. Cuando el despliegue está listo, la pantalla de éxito muestra la URL pública, el número de archivos, el tamaño subido, el tiempo transcurrido y un código QR para abrir la página en el móvil. Copy URL y Visit site sirven para el traspaso, y Build logs abre los logs del proveedor. Los nombres de sitio de Netlify son globales, así que uno solicitado puede estar ocupado. Entonces el proveedor asigna otro y GB Coder informa la dirección que está viva de verdad, no la que escribiste.',
          },
          {
            heading: '6. Qué muestra de verdad la barra de progreso',
            body: 'La barra de progreso pasa por empaquetado, carga, compilación, asegurado y listo. En Netlify, la etiqueta de compilación cubre el procesamiento del proveedor, no una orden de compilación. Es un informe del cliente, no una predicción del proveedor. El porcentaje avanza por las dos primeras fases y se queda por debajo de 100 mientras el proveedor termina el trabajo remoto. Es deliberado: el trabajo remoto puede tardar un tiempo imprevisible y una barra que llegara al 99 % estaría mintiendo. GB Coder consulta al proveedor cada segundo y medio y actualiza el mensaje cuando cambia el estado. Una petición de carga tiene un tiempo de espera de dos minutos. El panel deja de esperar tras tres minutos de sondeo del despliegue y te remite al panel del proveedor, porque el despliegue puede terminar aunque el navegador haya dejado de mirar. Cancelar, cerrar el diálogo o pulsar Escape aborta la petición en curso y el bucle de sondeo. Si el proveedor ya aceptó el despliegue, el despliegue puede continuar de su lado; revisa el panel antes de suponer que cancelar equivale a revertir. Los logs del proveedor son la fuente autoritativa cuando falla un despliegue.',
          },
          {
            heading: '7. Nuevos despliegues, URLs estables y estado del proveedor',
            body: 'Deploy again vuelve al formulario; no reenvía el último paquete de inmediato. Es útil cuando el proyecto cambió, el nombre necesita ajustes o el token caducó. Vercel y Netlify toman rutas distintas hacia la misma dirección. Vercel crea un despliegue contra el proyecto nombrado y apunta a producción. Los despliegues repetidos con el mismo nombre actualizan ese proyecto, y el alias de producción se prefiere sobre la URL específica del despliegue, así que la dirección que compartes suele mantenerse estable. Netlify necesita un id de sitio para actualizar uno existente en vez de crear otro. GB Coder recuerda el id en localStorage, asociado al nombre saneado. Si borras el almacenamiento del navegador, cambias de navegador, cambias el nombre o eliminas el sitio en Netlify, el siguiente despliegue no encuentra el anterior y crea uno nuevo. Por eso renombrar un proyecto de Netlify puede dejar el sitio viejo en la cuenta. Ambos proveedores guardan historial de despliegues, dominios personalizados, controles de acceso y rollback en sus paneles; el panel de GB Coder expone la carga y la URL pública, no esos controles. Cada despliegue desde aquí es de producción; no hay selector de previews por rama ni de entorno.',
          },
          {
            heading: '8. Límites y fallos que conviene prever',
            body: 'Hay dos límites que se aplican antes de que la petición salga de la pestaña: 900 archivos y 64 MB de contenido sin comprimir. Están por debajo de los techos de los proveedores para que una carga enorme no falle a mitad de una sesión de navegador. Un sitio con muchos medios debería mantener imágenes y vídeo grandes en un CDN o en Git, no dentro del paquete del proyecto. Los errores se separan por causa. Un 401 significa que el token fue rechazado; un 403 suele indicar falta de permiso para la cuenta o el equipo; un 413 o 429 significa que el payload es demasiado grande o que el proveedor limita la tasa; un 422 indica que el proyecto se rechazó como inválido; un 5xx suele ser temporal. En Vercel, un fallo de compilación es distinto: la carga funcionó y falló el build, así que lee los logs en vez de pegar otro token. Una compilación de Vercel que necesita variables de entorno es otra frontera. El diálogo no tiene editor para ellas. Configúralas en los ajustes del proyecto de Vercel y vuelve a desplegar; la primera compilación puede fallar antes de que exista el proyecto. La ruta ZIP manual de Netlify no tiene paso de compilación, así que esto no se aplica allí. Un límite de sondeo de tres minutos no es un despliegue fallido, solo una espera fallida.',
          },
          {
            heading: '9. Seguridad, propiedad y frontera de los datos',
            body: 'El despliegue es directo: el navegador llama a api.vercel.com o api.netlify.com con tu token. No hay un proxy que guarde la credencial y no hace falta una cuenta de LadeStack para usar el panel. Los tokens viven solo en la sesión por defecto y se sellan con AES-GCM únicamente si eliges recordarlos en un origen seguro. Eso protege frente a un token legible en una copia del perfil o en un paquete de soporte, pero no frente a código malicioso en el mismo origen mientras la pestaña está abierta. Usa el token más estrecho disponible, ponle caducidad y revócalo en el proveedor al terminar. La propiedad sigue al token: el proyecto o sitio se crea en la cuenta del proveedor que lo posee, bajo sus términos, cuotas, logs y facturación. GB Coder sigue siendo local-first, pero desplegar es una exportación explícita del proyecto al proveedor. El proveedor recibe el código del sitio y el resultado es una URL HTTPS pública por defecto; la protección con contraseña, el SSO y los dominios personalizados son funciones del proveedor. Guarda un ZIP o una copia en GitHub si el perfil del navegador es el único otro lugar donde existe el proyecto.',
          },
          {
            heading: '10. Cuándo conviene desplegar desde el navegador',
            body: 'Usa este camino para poner un sitio pequeño en línea rápido: una landing page, un portafolio, una demo de clase, un prototipo para revisión de cliente o una página de documentación estática. También encaja cuando el proyecto ya vive en GB Coder y la alternativa es exportar un ZIP, abrir una terminal y configurar una CLI en una máquina que no es tuya. No encaja para un monorepo, una aplicación renderizada en servidor con base de datos, una compilación que necesita credenciales de un registro privado, un equipo que publica con previews por rama y aprobaciones, o activos que superan los límites de carga. Esos son trabajos de la integración Git del proveedor, un pipeline de CI o un entorno de escritorio. Los dos enfoques pueden convivir: borra e itera en el navegador, sube el código a GitHub cuando merezca historial y deja que CI publique la compilación de producción. Una rutina práctica: prueba la vista previa a ancho de móvil, revisa el resumen del paquete, despliega, abre la URL en un segundo dispositivo y guarda el log. Para probarlo, abre el Panel de Proyectos en /app/projects, crea o abre un proyecto y elige Deploy. La referencia de configuración está en la documentación.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Leer la documentación completa de GB Coder →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'Claves de API y variables de entorno en un IDE de navegador',
        description: 'Dónde ubicar las claves de API y variables de entorno en un IDE de navegador: exposición, almacenamiento, alcance, rotación, despliegue y respuesta.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Seguridad', 'Claves de API', 'Variables de entorno', 'IDE de navegador', 'Buenas prácticas'],
        intro: 'Todo IDE de navegador acaba enfrentándose a la misma pregunta: ¿dónde van las claves? El proyecto necesita un endpoint de API, el panel de IA necesita una clave de proveedor y el despliegue necesita un token de cuenta. En un equipo de escritorio, esos valores pueden vivir en un perfil de shell o en un archivo no rastreado. En una pestaña del navegador el límite es distinto. Todo lo que se envía con la página puede leerlo la página, y todo lo que se guarda en el perfil del navegador pertenece a ese perfil. Esta guía propone un modelo práctico: qué valores se pueden publicar, cuáles nunca deben llegar al cliente, cómo gestiona GB Coder las credenciales de proveedores y qué hacer cuando se filtra una clave. Está pensada para quien quiere la comodidad de un IDE de navegador sin fingir que una pestaña es una caja fuerte.',
        sections: [
          {
            heading: '1. Una pestaña del navegador es un objetivo de compilación público',
            body: 'La primera regla es incómoda pero sencilla: una aplicación web estática no puede guardar un secreto. El navegador descarga HTML, CSS y JavaScript, y después los ejecuta en la máquina del usuario. Cualquiera puede abrir DevTools, revisar el panel de red, buscar en el bundle o poner un punto de interrupción e inspeccionar una variable. Minificar el código, dividirlo en fragmentos u ocultar un valor en un archivo de configuración cambia el esfuerzo, no el resultado. Un IDE de navegador añade un sandbox para ejecutar el código del proyecto, pero la interfaz del propio IDE sigue ejecutándose en el mismo origen y debe leer lo que necesita para funcionar. El sandbox no es una caja fuerte para los valores que la propia interfaz tiene que usar. La prueba útil es directa: si un valor debe estar disponible para el código que se ejecuta en la pestaña, asume que la persona que usa la pestaña puede leerlo, y que cualquier script que se ejecute en el mismo origen también puede leerlo. Eso no hace inseguro el desarrollo en el navegador. Define el límite. Los identificadores públicos pueden vivir ahí; las credenciales de servidor, no.',
          },
          {
            heading: '2. Qué significa una variable de entorno en una app estática',
            body: 'En un servidor Node.js, una variable de entorno se lee en tiempo de ejecución desde el proceso. En una compilación de Vite, Create React App, Next.js o Astro, las variables de entorno públicas funcionan de otra manera: el bundler sustituye las referencias por cadenas literales durante la compilación. Vite expone las variables con prefijo VITE_ mediante import.meta.env; Create React App usa REACT_APP_; Next.js usa NEXT_PUBLIC_; Astro usa PUBLIC_. El prefijo es una convención de nombres, no un control de seguridad. Una vez que un valor se inserta en el código, forma parte del JavaScript que descarga cada visitante. Una variable sin prefijo público normalmente no está disponible para el código del cliente, y por eso los valores exclusivos del servidor deben leerlos un servidor o una función serverless, no una página estática. Un archivo .env es una entrada de desarrollo y compilación, no un almacén de secretos en tiempo de ejecución. Sirve para la configuración local y para mantener valores fuera del control de versiones, pero no vuelve privado un valor después de la compilación.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Qué claves pueden vivir en el navegador',
            body: 'Algunas claves están diseñadas para ser públicas. Una clave publicable de Stripe identifica una cuenta y crea tokens de pago; la clave secreta es la que mueve dinero y debe quedarse en un servidor. Una clave anónima de Supabase solo es segura cuando las políticas de seguridad a nivel de fila son correctas. La configuración web de Firebase identifica un proyecto, pero no concede acceso administrativo. Las claves de mapas y analítica suelen restringirse por dominio o por API. Estos valores pueden llegar al navegador, pero aun así merecen límites: orígenes permitidos, restricciones de API, roles con privilegios mínimos, cuotas y alertas. La categoría opuesta es más fácil de enunciar. Las claves con rol de servicio, las contraseñas de bases de datos, las credenciales SMTP, los secretos de firma y las claves privadas de proveedores de IA nunca deben estar en un bundle estático. Una clave de proveedor que pertenece a la aplicación es especialmente peligrosa: cualquiera que la encuentre puede gastar el dinero de la aplicación. Una clave que pertenece al usuario es otro caso. Sigue siendo una credencial de portador, pero es suya, y el objetivo es mantenerla en su navegador y no en el proyecto ni en el repositorio.',
          },
          {
            heading: '4. Cómo gestiona GB Coder las credenciales de proveedores',
            body: 'El panel de IA de GB Coder funciona con tu propia clave (BYOK). El gestor de claves mantiene las claves de proveedor en memoria por defecto. No las escribe en localStorage. El usuario puede optar explícitamente por persistirlas en sessionStorage, lo que limita el valor a la pestaña actual y normalmente lo borra al cerrarla. La clave se elimina de la memoria y del almacenamiento de sesión cuando el usuario la borra. El gestor también vincula cada clave a un origen de endpoint autorizado, y una puerta de salida comprueba que una credencial no se envíe a un destino para el que no fue aprobada. Los errores de los proveedores pasan por una capa de redacción que elimina patrones de claves y claves activas antes de que el mensaje llegue a la interfaz o a un log. Los metadatos de proveedores personalizados se guardan en localStorage, pero las cabeceras marcadas como secretas se limpian antes de persistir y deben volver a introducirse. Las peticiones van directamente del navegador al endpoint del proveedor; GB Coder no actúa como proxy de la clave a través de un servidor de LadeStack. Estas medidas reducen la persistencia accidental y las fugas entre orígenes. No cambian la regla básica: cualquier script que pueda ejecutarse en el mismo origen puede leer lo que puede leer la página. Usa un perfil limpio para trabajo sensible y no instales extensiones que no confíes.',
          },
          {
            heading: '5. Secretos del proyecto, archivos .env y sustitución en la compilación',
            body: 'Mantén los secretos fuera del árbol del proyecto. Añade .env y sus variantes locales a .gitignore, y confirma un .env.example con nombres de marcador de posición. Si un proyecto usa Vite, recuerda que cada variable VITE_ se inserta en el bundle de producción. Un valor que era cómodo durante el desarrollo local se vuelve público en el momento en que se usa en una compilación de producción. Antes de desplegar, inspecciona los recursos generados en busca de patrones de claves y trata cualquier hallazgo como un incidente, no como una advertencia. El escaneo de secretos y la protección de push de GitHub pueden detectar algunos formatos de token conocidos, pero son una red de seguridad, no un sustituto de mantener los valores fuera del repositorio. La exportación ZIP de un IDE de navegador incluye los archivos del proyecto. Si hay un archivo .env dentro del proyecto, viaja con la copia de seguridad. Una copia de seguridad no es una caja fuerte cifrada. Guarda las exportaciones en un lugar privado y elimina las copias antiguas cuando ya no las necesites. Lo mismo se aplica a capturas de pantalla, informes de incidencias y mensajes de chat: una clave pegada en cualquiera de ellos ya salió del navegador.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. Tokens de GitHub y de despliegue',
            body: 'Los tokens de acceso personal de GitHub y los tokens de despliegue son más poderosos de lo que parecen. Un token clásico con permisos de repositorio y flujo de trabajo puede leer código privado, cambiar archivos y activar releases. Prefiere tokens de grano fino con un solo repositorio, una lista explícita de permisos y una fecha de caducidad. Da a un token solo los permisos que necesita la tarea: lectura y escritura de contenidos para una sincronización, no administración ni facturación. Crea tokens separados para dispositivos o propósitos separados y revócalos cuando termines. Los tokens de despliegue de Vercel o Netlify pueden publicar, reemplazar o eliminar proyectos. Si el proveedor admite alcance por proyecto o equipo, úsalo; si admite caducidad, configúrala. Pega el token en el panel de despliegue solo cuando sea necesario y no lo guardes en un archivo del proyecto. En CI, usa secretos del repositorio u organización en lugar de un .env confirmado, y recuerda que las pull requests de forks normalmente no reciben secretos. Un token que se ha capturado en pantalla, compartido en un chat o confirmado en un repositorio público debe tratarse como comprometido aunque se haya borrado un segundo después.',
          },
          {
            heading: '7. Claves de proveedores de IA: BYOK sin sorpresas',
            body: 'Una clave de proveedor de IA es una credencial de portador con una factura adjunta. Cualquiera que la tenga puede enviar peticiones, consumir cuota y generar cargos. Usa una clave limitada a un proyecto, configura un límite de gasto si el proveedor lo ofrece y usa una clave separada para experimentos en lugar de la clave maestra de la organización. Revisa el uso con regularidad, sobre todo después de compartir un dispositivo o instalar una extensión nueva. Los proveedores locales como Ollama, LM Studio y vLLM no necesitan una clave en la nube, pero sus endpoints siguen siendo servicios de la máquina. No expongas un endpoint local a internet solo para que funcione una demo. Si un proveedor personalizado apunta a un proxy, el proxy puede ver la clave; usa solo un proxy que controles y entiendas. La inyección de prompts es un riesgo relacionado: un archivo, una página web o un mensaje de error pegado pueden contener instrucciones dirigidas al asistente. Mantén los secretos fuera de los prompts y de los archivos que el asistente tiene permitido leer. Si una clave aparece en una conversación, rótala.',
          },
          {
            heading: '8. Equipos compartidos, extensiones y XSS',
            body: 'Un equipo compartido o de laboratorio merece una rutina distinta. Usa un perfil de navegador privado, no optes por la persistencia de sesión y cierra la pestaña al terminar. Si el navegador ofrece guardar la clave, rechaza. Borra el almacenamiento del sitio si sospechas que se conservó. Las extensiones del navegador son otra parte del límite: una extensión con permisos amplios de host a menudo puede leer el contenido o el almacenamiento de la página, y una actualización maliciosa puede llegar después de instalarla. Usa un perfil mínimo para el trabajo con credenciales. El cross-site scripting es el riesgo web clásico en este contexto. Si un atacante puede ejecutar un script en el origen del IDE, ese script puede leer localStorage y sessionStorage y hacer peticiones mientras la página está abierta. Mantén las dependencias actualizadas, evita scripts de terceros que no confíes y considera una política de seguridad de contenido en el sitio desplegado. Los gestores de portapapeles y las herramientas para compartir pantalla también ven lo que copias y muestras. Limpia el portapapeles después de mover una clave y pausa la compartición antes de abrir un panel de configuración del proveedor.',
          },
          {
            heading: '9. Rotar una clave filtrada',
            body: 'La rotación es la única respuesta fiable a una clave filtrada. Revocar primero es importante: si la clave antigua sigue siendo válida mientras se prepara la nueva, la exposición continúa. Crea la nueva clave con el alcance más estrecho que funcione, actualiza la aplicación o la configuración del navegador, vuelve a desplegar si el valor formaba parte de una compilación y verifica que la clave antigua es rechazada. Después revisa el uso y los registros de auditoría del proveedor en busca de actividad que no esperabas. Si la clave se confirmó en Git, borrar el archivo no basta; el valor permanece en el historial. Rota primero, luego reescribe el historial con una herramienta como git filter-repo o BFG, haz force-push con el acuerdo del equipo y pide a los colaboradores que vuelvan a clonar. Las plataformas de hosting pueden cachear compilaciones antiguas, así que asegúrate de que el valor antiguo no pueda servirse desde un bundle obsoleto. Si la clave se pegó en un chat de IA, un tíquet de soporte o una captura, asume que se conservó y rótala. Por último, registra lo ocurrido, añade una comprobación que lo habría detectado y acorta la vida de la siguiente clave.',
          },
          {
            heading: '10. Una lista de comprobación práctica',
            body: 'Usa esta secuencia antes de que un proyecto salga del navegador. Primero, clasifica cada valor: identificador público, credencial de usuario o secreto de servidor. Segundo, mantén los secretos de servidor fuera del bundle estático y colócalos detrás de una función serverless o una API. Tercero, expón solo los valores que necesitan el prefijo público e inspecciona los recursos compilados antes de desplegar. Cuarto, mantén los archivos .env fuera de Git, confirma un .env.example y activa el escaneo de secretos. Quinto, crea tokens con alcance y caducidad para GitHub y hosting, uno por propósito. Sexto, en GB Coder, deja las claves en memoria salvo que estés en un dispositivo de confianza, y opta por la persistencia de sesión solo cuando entiendas la contrapartida. Séptimo, nunca pegues una clave en un prompt, una incidencia, una captura o un archivo del proyecto. Octavo, rota ante cualquier duda y revoca antes de reemplazar. Noveno, usa un perfil de navegador limpio en máquinas compartidas. Décimo, escribe el plan para una filtración antes de necesitarlo. Un IDE de navegador puede gestionar credenciales de forma responsable si trata el navegador como un cliente público y no como una caja fuerte privada.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'Browser-IDE vs desktop-IDE: welke moet je kiezen?',
        description: 'Een praktische vergelijking van browser- en desktop-IDE\'s: installatie, prestaties, extensies, debuggen, Git, offline werken, beveiliging en wanneer elk wint.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Browser-IDE', 'Desktop-IDE', 'Ontwikkelaarstools', 'Webontwikkeling', 'Vergelijking'],
        intro: 'De desktop-IDE is zo lang de standaard geweest dat veel ontwikkelaars de vraag niet meer stellen. Editor installeren, extensies toevoegen, runtime configureren, repository klonen en pas dan de eerste regel schrijven. Een browser-IDE draait die volgorde om: tab openen, project aanmaken en beginnen typen terwijl de omgeving zichzelf opbouwt. De afweging is geen duidelijke overwinning voor één kant. Een browser-IDE schrapt de installatie en maakt het werk draagbaar, maar erft de grenzen van de browsersandbox. Een desktop-IDE vraagt installatie en schijfruimte, maar bereikt native toolchains, extensies en lokale hardware. Deze vergelijking bekijkt de dimensies die de beslissing echt veranderen, met GB Coder als voorbeeld aan de browserkant omdat de twee modi beide uitersten dekken.',
        sections: [
          {
            heading: '1. Wat telt als een browser-IDE',
            body: 'Een browser-IDE is een editor die in een webpagina draait en een project opent of opslaat zonder installatie op de desktop. De categorie bevat twee heel verschillende producten. Het eerste is een statische werkbank: HTML-, CSS- en JavaScript-panelen met live preview en zonder pakketbeheer. Het tweede is een volledige runtime, waarin een op WebAssembly gebaseerd systeem zoals WebContainer Node.js, npm en een dev-server in de tab uitvoert. GB Coder levert beide: een Statische Editor voor werk zonder dependencies en een Geavanceerde IDE voor React, Vue en gewone npm-projecten. Dat onderscheid is belangrijk in elke vergelijking hierna. Een statische browsereditor concurreert met een scratchpad; een volledige browser-IDE concurreert met een lichte desktopopstelling. Alle browsereditors beoordelen op de statische versie is als desktop-IDE\'s beoordelen op een tekstverwerker met syntaxmarkering.',
          },
          {
            heading: '2. Waar desktop-IDE\'s nog steeds winnen',
            body: 'Desktop-IDE\'s blijven de sterkere keuze voor grote, langdurige systemen. Ze draaien native compilers, mobiele emulators, databaseclients, Docker en language servers die een heel monorepo analyseren. Extensiemarkten bieden debuggers, frameworktools, linters en integraties zonder browser-equivalent. Lokale bestanden vallen niet onder een opslagquotum, en een machine met genoeg RAM houdt een enorme dependency tree en meerdere services tegelijk draaiend. Offline werken is normaal in plaats van een uitzondering, en remote development-extensies laten een dunne laptop een krachtige server besturen. Niets hiervan is achterhaald. Als je dagelijks werk een native SDK, een backend met meerdere services of een repository met honderden pakketten omvat, is een desktop-IDE geen nostalgische gewoonte maar het gereedschap dat bij de klus past.',
          },
          {
            heading: '3. Installatietijd en de eerste preview',
            body: 'Het duidelijkste verschil verschijnt voordat er code bestaat. Een desktopopstelling betekent meestal de editor, een runtime, een pakketbeheerder, extensies en de dependencies van het project installeren en dan wachten op de eerste build. Op een nieuwe machine kan dat een middag kosten. Een browser-IDE kort de reeks in: site openen, een template of leeg project kiezen en de eerste preview verschijnt meteen. GB Coder maakt de werkruimte in IndexedDB aan, dus geen account, download of server-roundtrip. De keerzijde is dat de app zelf moet laden, en de geavanceerde runtime een moderne browser met SharedArrayBuffer en cross-origin isolation vereist. Voor een klaslokaal, een geleende laptop, een Chromebook of een snelle klantdemo is het verschil beslissend. Voor een ontwikkelaar met een al afgestelde werkplek is de installatie eenmalig en weegt die minder.',
          },
          {
            heading: '4. Prestaties, geheugen en runtimegrenzen',
            body: 'Een desktop-IDE gebruikt CPU en RAM rechtstreeks. Een browser-IDE draait in een tab, en die tab is een beheerde sandbox met een eigen geheugenplafond. Dat plafond is ruim voor een typische Vite-app, maar niet oneindig. Een zeer grote dependency tree installeren, meerdere watchers draaien of een enorm monorepo bouwen kan de tab uitputten of een herlaad afdwingen. WebContainer kan ook geen native binaries, Docker-images of voor het hostbesturingssysteem gecompileerde tools uitvoeren. De eerlijke vergelijking hangt dus af van de werkbelasting. Voor een landingspagina, dashboard, componentbibliotheek of klein full-stack prototype voelt een browser-IDE niet anders dan lokaal ontwikkelen. Voor een project dat een database-engine, een Python-service of een native module nodig heeft, blijft de desktop de praktische omgeving. De accu volgt hetzelfde patroon: een tab is lichter dan een volledige IDE plus een dozijn achtergrondservices, maar een lange WebContainer-sessie kost nog steeds stroom.',
          },
          {
            heading: '5. Editorintelligentie en extensies',
            body: 'Editorkwaliteit is geen browserzwakte meer. GB Coder gebruikt Monaco, dezelfde opensource-engine achter VS Code, dus aanvullingen, inline documentatie, syntaxvalidatie, haakjesmatching, multicursor-editing en configureerbare sneltoetsen zijn aanwezig. TypeScript, JavaScript, HTML, CSS en JSON krijgen taalservices, en een diff-viewer maakt wijzigingen beoordeelbaar voordat ze worden toegepast. Wat een browser-IDE mist, is het ecosysteem van extensies. Er is geen marktplaats voor een gespecialiseerde taalplugin, een frameworkinspector of een aangepaste debugger. Een deel daarvan is ingebouwd en een deel is voor kleine projecten overbodig, maar wie van een specifieke extensie afhankelijk is, voelt de leemte. De afweging zit in onderhoud: een browsereditor komt al geconfigureerd, terwijl een desktopeditor pas krachtig wordt nadat iemand hem heeft samengesteld.',
          },
          {
            heading: '6. Terminal, pakketten en buildpipelines',
            body: 'De terminal is het kenmerk dat een echte browser-IDE scheidt van een online code-playground. In de Geavanceerde IDE van GB Coder levert WebContainer een Node.js-runtime, lost npm install echte pakketten op, voeren npx-scripts uit en start een Vite-server op een poort die naar de preview wordt doorgestuurd. De terminal is een xterm.js-shell met ANSI-uitvoer en commandogeschiedenis, geen gesimuleerd logpaneel. Dat dekt de gangbare front-endpipeline: installeren, ontwikkelen, bouwen en testen met gewone JavaScript-tools. Het dekt geen native addons, Docker Compose of een productiedatabase. Een desktop-IDE kan de hele stack draaien, inclusief de services waarmee de front-end praat. De praktische regel is simpel: als de toolchain van begin tot eind JavaScript is, kan de browser het waarschijnlijk aan; zodra native code of containers in het spel zijn, is de desktop veiliger.',
          },
          {
            heading: '7. Debuggen: browsercontext versus native tools',
            body: 'Browser-IDE\'s hebben een onderschat debugvoordeel: de code, de preview en de browser-devtools leven in dezelfde context. Een CSS-wijziging is direct zichtbaar, de virtuele console vangt logs naast de preview op, en een QR-code opent de pagina op een echte telefoon om touch- en viewportproblemen bloot te leggen. GB Coder biedt ook viewport-presets en een losmaakbare preview voor een tweede monitor. Desktop-IDE\'s winnen op diepte. Ze koppelen debuggers aan Node-processen, zetten breakpoints over services heen, profileren geheugen en CPU, inspecteren native threads en integreren met mobiele emulators. Voor visueel front-endwerk is de browserlus korter. Voor een subtiele race condition in een serverproces is de desktopdebugger het betere instrument. De meeste ontwikkelaars hebben beide soorten feedback nodig, en daarom is de hybride workflow verderop belangrijk.',
          },
          {
            heading: '8. Bestanden, versiebeheer en back-ups',
            body: 'Opslag is waar browser- en desktopmodellen het sterkst uiteenlopen. Een desktopproject staat in een map die elk hulpmiddel kan lezen. Een browserproject staat in IndexedDB: snel en privé, maar gebonden aan het browserprofiel en kwetsbaar voor opslagopschoning. GB Coder ondervangt dat met benoemde snapshots, een diff-viewer, ZIP-export met integriteitshash en import met een structurele preview. GitHub-sync gebruikt een personal access token, bundelt pushes in één atomaire commit, slaat ongewijzigde bestanden over en meldt een conflict wanneer de remote branch is verschoven. Desktop-Git blijft completer: hooks, submodules, rebase-workflows, meerdere remotes en een CLI die elk CI-systeem begrijpt. De browserworkflow volstaat voor een klein project en verrast voor een solo-ontwikkelaar, maar vervangt geen volledige Git-client op een complexe repository. Exporteren naar GitHub of een ZIP is de brug tussen beide.',
          },
          {
            heading: '9. Beveiliging, privacy en kosten',
            body: 'Een browser-IDE bundelt risico en gemak op dezelfde plek. GB Coder is local-first: projecten staan in de browser, er is geen account nodig en het product is gratis zonder advertenties. Gegevens verlaten het apparaat alleen wanneer je een verbonden functie gebruikt, zoals een AI-provider, GitHub-sync, deployment of een CDN waarnaar het project verwijst. AI werkt met bring-your-own-key, en prompts plus geselecteerde code gaan naar de provider die je instelt. GitHub en deployments naar Vercel of Netlify gebruiken jouw tokens, en die blijven alleen in de sessie tenzij je versleutelde opslag inschakelt. Dat model geeft de ontwikkelaar controle, maar betekent ook dat browseropslag de enige kopie is zonder back-up. Een desktop-IDE houdt bestanden op schijf en erft meestal het back-up- en rechtenmodel van het besturingssysteem. Geen van beide is automatisch veiliger; de vraag is wie de gegevens heeft en wat er gebeurt als een apparaat of profiel verdwijnt.',
          },
          {
            heading: '10. Hoe je kiest en hoe je ze combineert',
            body: 'Kies een browser-IDE wanneer het werk visueel, kortdurend of draagbaar moet zijn: HTML en CSS leren, een interface prototypen, lesgeven, een ontwerp beoordelen op een Chromebook of een kleine React- of Vue-app bouwen zonder toolchain te installeren. Kies een desktop-IDE wanneer het werk langdurig en systeemzwaar is: een monorepo, native SDK\'s, Docker, mobiele builds, een grote extensiestack of offline ontwikkeling op een afgesloten netwerk. Het interessantere antwoord is ze combineren. Begin in de browser omdat de eerste preview direct is. Controleer de layout op telefoonbreedte. Maak een snapshot. Push naar GitHub of exporteer een ZIP. Open dezelfde repository op de desktop wanneer het project een native tool, een diepere debugger of een volledige Git-workflow nodig heeft. De bestanden zijn standaard, dus de overdracht is gewone versiebeheer en geen migratie. GB Coder is ontworpen voor die eerste helft van de cyclus en sluit het project niet op in de browser. Wil je de browserkant van de beslissing testen, open dan het Projectdashboard en maak een lege werkruimte aan; de vergelijking wordt binnen een minuut concreet.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lees de volledige GB Coder-documentatie →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'GitHub-synchronisatie in een browser-IDE: praktische gids',
        description: 'Hoe GitHub-synchronisatie in een browser-IDE werkt: tokens, atomaire commits, pulls, conflicten, bestandslimieten en beveiliging.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Versiebeheer', 'Browser-IDE', 'Git', 'Ontwikkelaarsworkflow'],
        intro: 'Browser-IDE\'s zijn goed in het wegnemen van installatie. Dat geldt minder voor de stap daarna: het werk een duurzame plek geven buiten het browserprofiel. Daar verschijnt meestal een terminal: git init, remote add, commit, push. GitHub-synchronisatie in een browser-IDE perst die reeks in een paneel, maar het is geen magie en geen volledige Git-client. Het is een gerichte brug tussen een project in browseropslag en een repository op GitHub. Deze gids legt uit hoe die brug in GB Coder werkt, wat er wordt geüpload, hoe conflicten en tokens worden afgehandeld, en waar een desktop-Git-workflow nog steeds beter is.',
        sections: [
          {
            heading: '1. Waarom een browser-IDE GitHub nodig heeft',
            body: 'Een browserproject is juist handig omdat het geen map, runtime of installatie nodig heeft. Diezelfde eigenschap is de zwakte. Projecten leven in het browserprofiel, dat door een opruimtool kan worden gewist, met een apparaat verloren kan gaan of achterblijft wanneer iemand van computer wisselt. Een ZIP exporteren maakt een kopie, maar een ZIP is een momentopname zonder geschiedenis of gedeelde remote. GitHub levert de ontbrekende laag: een repository buiten het apparaat, een commitgeschiedenis, een plek om samen te werken en een natuurlijke bron voor CI of deployment. Daardoor verandert de rol van de browser-IDE. Het is geen wegwerpschrijfblok meer; het kan de plek zijn waar een klein project wordt geschreven, beoordeeld en overgedragen. De workflow is vooral nuttig op een Chromebook, een schoolcomputer of een vergrendelde zakelijke laptop waarop Git installeren geen optie is. Ook voor een snel prototype dat later naar een desktop-repository verhuist, werkt het goed. De browser doet de eerste versie; GitHub maakt die duurzaam.',
          },
          {
            heading: '2. Wat de synchronisatie wel en niet doet',
            body: 'GB Coder biedt drie GitHub-acties: Push, New repo en Pull. Push schrijft het huidige project naar een bestaande repository en branch. New repo maakt een repository aan onder het verbonden GitHub-account en legt het project vast als de eerste inhoud. Pull leest een branch en importeert de tekstbestanden in de editor. Alle verzoeken gaan rechtstreeks van de browser naar api.github.com; geen LadeStack-server zit ertussen om het token vast te houden. Die beperkte scope is bewust. Het paneel vervangt de Git-opdrachtregel niet. Het biedt geen rebase, merge-conflictoplossing, submodules, Git LFS, ondertekende commits, hooks of meerdere remotes. Het toont ook niet de volledige commitgraaf. Die beperkingen doen ertoe bij een complexe repository. Voor het gangbare browserproject — een statische pagina, een React-prototype, een lesvoorbeeld of een kleine utility — dekken de drie acties precies het deel dat buiten het tabblad moet gebeuren.',
          },
          {
            heading: '3. Een token met de juiste scope aanmaken',
            body: 'GitHub-synchronisatie gebruikt een personal access token, geen wachtwoord en geen GB Coder-account. Een klassiek token heeft de repo-scope nodig. Een fine-grained token heeft lees- en schrijftoegang tot Contents nodig en kan tot één repository worden beperkt. De smalste optie is de betere standaard: als het token uitlekt, blijft de schade beperkt tot de projecten die het kan bereiken. Het verbindingsscherm linkt naar de tokenpagina van GitHub en legt beide keuzes uit. Plak het token, kies of je het op het apparaat wilt onthouden en klik op Connect. GB Coder controleert het door het account en de repositorylijst op te halen en toont daarna de ingelogde gebruiker en het resterende API-limiet. Er wordt niets naar de repository geschreven tot een push of het aanmaken van een repository is bevestigd. Behandel het token als een wachtwoord: plak het niet in een issue, chat of screenshot, en trek het op GitHub in wanneer je het niet meer nodig hebt. Een token met een vervaldatum en toegang tot één repository is een redelijke afweging voor deze workflow.',
          },
          {
            heading: '4. Je eerste push: wat er werkelijk wordt geüpload',
            body: 'Het tabblad Push vraagt om een repository, branch, commitbericht en één optie: bestanden verwijderen die in het project ontbreken. Voordat er iets de browser verlaat, toont het paneel het aantal bestanden en de totale grootte. Die preview is nuttig omdat de upload geen ruwe dump van editortabbladen is. GB Coder gebruikt dezelfde archiefopbouw als ZIP-export en deployment. Een eenvoudig HTML/CSS/JavaScript-project wordt index.html, style.css, script.js en een README. Een React- of Vue-project wordt een repository met Vite-structuur: index.html, package.json, vite.config.js, .gitignore, een README en de bronbestanden onder src/. Afhankelijkheidsmappen en buildoutput worden niet meegenomen. Het commitbericht is bewerkbaar en staat standaard op \'Update from GB Coder\'. De optie om ontbrekende bestanden te verwijderen staat standaard uit; zet hem alleen aan als de repository exact het huidige project moet spiegelen, want hij verwijdert remote bestanden die lokaal niet meer bestaan. Kies voor een eerste push de standaardbranch van de repository, tenzij je bewust een aparte branch wilt.',
          },
          {
            heading: '5. Atomaire commits en overgeslagen ongewijzigde bestanden',
            body: 'Een naïeve browsersynchronisatie commit één bestand per keer. Dat levert een rommelige geschiedenis op en laat een repository half bijgewerkt achter als een verzoek halverwege mislukt. GB Coder gebruikt daarom de Git Data API van GitHub: het uploadt blobs, bouwt een tree boven op de huidige tree van de branch, maakt één commit en verplaatst de branchreferentie. Het resultaat is één atomaire commit per push, inclusief eventuele verwijderingen via de bijbehorende optie. De tweede optimalisatie is stiller maar net zo belangrijk. Git identificeert bestandsinhoud met een SHA-1-hash, en de browser kan die lokaal berekenen met WebCrypto. GB Coder vergelijkt de lokale bestanden met de doel-tree voordat er iets wordt geüpload. Ongewijzigde bestanden kosten geen API-aanroepen, en een push zonder wijzigingen geeft \'already up to date\' terug in plaats van een lege commit te maken. Dat houdt de geschiedenis leesbaar en houdt het API-budget vrij voor echte wijzigingen. Bij een klein project is het verschil onzichtbaar; bij een project met tientallen bestanden is het het verschil tussen een schone synchronisatie en een trage, lawaaierige.',
          },
          {
            heading: '6. Een repository aanmaken zonder de browser te verlaten',
            body: 'Het tabblad New repo maakt een repository aan in het verbonden account. Je geeft een naam en optionele beschrijving op, kiest openbaar of privé en beslist of GitHub de repository met een README moet initialiseren. Initialisatie staat standaard aan omdat een lege repository geen branchhoofd heeft waarop de eerste push kan voortbouwen. GB Coder gebruikt die basiscommit, vervangt de README door de bestanden van het project en legt de eerste commit vast. Met initialisatie uit maakt het zelf een rootcommit en de standaardbranchreferentie aan. Na het aanmaken zijn de nieuwe repository en standaardbranch geselecteerd voor de volgende push, dus er is geen tweede configuratieronde. Dit is de kortste weg van een idee naar een privé, geversioneerde repository. Het is nuttig voor een schoolopdracht, een klantdemo die privé moet blijven of een prototype dat een URL nodig heeft voor een CI-service. De repository hoort bij het GitHub-account dat het token bezit, niet bij LadeStack, en kan daarna op GitHub worden beheerd, overgedragen of verwijderd.',
          },
          {
            heading: '7. Een repository terug naar de editor halen',
            body: 'Pull is de terugreis. Voer een repository-URL of een eigenaar/naam-paar in, kies een branch en GB Coder leest de branch-tree. Het importeert tekstbestanden die een editor zinvol kan openen: broncode, JSON, Markdown, configuratie en SVG, onder andere. Het slaat de mappen node_modules, dist, build, .git, .next en coverage over. Een pull is ook beperkt tot 200 bestanden en 512 KB per bestand; als de branch een van beide limieten overschrijdt, meldt het paneel hoeveel bestanden zijn weggelaten in plaats van ze stil te laten vallen. Regeleinden worden genormaliseerd, zodat een bestand dat op Windows is gemaakt niet op elke regel lijkt te veranderen. De geïmporteerde bestanden overschrijven het project niet meteen. Ze gaan door dezelfde beoordelings- en toepassingsflow als een ZIP-import, dus je kunt de gedetecteerde structuur bekijken voordat je de wijziging doorvoert en die daarna ongedaan maken. Pull is daarom handig om op een ander apparaat verder te werken, een repository te bekijken voordat je gaat bewerken, of een project te herstellen nadat browseropslag is gewist. Het is een import, geen merge; als het huidige project en de branch uit elkaar zijn gelopen, controleer het resultaat dan zorgvuldig.',
          },
          {
            heading: '8. Conflicten, rate limits en eerlijke foutmeldingen',
            body: 'De belangrijkste veiligheidseigenschap is wat er gebeurt wanneer de remote branch verandert terwijl je aan het bewerken bent. GB Coder werkt de branchreferentie bij met force uitgeschakeld. Als iemand anders intussen heeft gepusht, weigert GitHub de update en meldt het paneel een conflict in plaats van diens werk stil te overschrijven. De oplossing is bewust handmatig: haal de nieuwste branch in een project, controleer de bestanden en push opnieuw — of stap over op een desktop-Git-client voor een echte merge. Andere fouten worden apart gemeld zodat het bericht bruikbaar is. Een verlopen token geeft een authenticatiefout en een verzoek om opnieuw te verbinden. Een rate limit toont wanneer het GitHub-quotum reset; de API staat 5.000 verzoeken per uur toe voor geauthenticeerde gebruikers, en een pull verbruikt één verzoek per bestand. Een ontbrekende repository of branch geeft een not-found-fout. Verzoeken verlopen na 60 seconden en een langdurige bewerking kan vanuit het paneel worden geannuleerd. Die details zijn niet glamoureus, maar ze maken het verschil tussen een synchronisatietool die je kunt vertrouwen en een die op onduidelijke manieren faalt.',
          },
          {
            heading: '9. Tokenbeveiliging: standaard alleen in de sessie',
            body: 'Tokens zijn waardevolle inloggegevens. Een GitHub-token met schrijftoegang kan elke repository wijzigen die het kan bereiken. GB Coder bewaart een geplakt token standaard in een map binnen de modulescope, wat betekent dat het verdwijnt wanneer het tabblad sluit en nooit naar localStorage wordt geschreven. De optie \'Remember on this device\' is een expliciete opt-in. Wanneer die aan staat en de pagina een secure context is, wordt het token met AES-GCM verzegeld onder een willekeurige sleutel per installatie voordat het wordt opgeslagen. Dat beschermt tegen een leesbaar token in een back-up van het browserprofiel, een gesynchroniseerd profiel, een gedeelde machine, een screenshot van ontwikkelaarstools of een supportbundel. Het beschermt niet tegen een script dat op dezelfde origin kan draaien, want zo\'n script kan dezelfde opslagmodule aanroepen. Geen enkele browser-only oplossing lost dat volledig op. De praktische maatregelen zijn daarom scope, vervaldatum en intrekking: gebruik een fine-grained token dat beperkt is tot de repository die je nodig hebt, stel een vervaldatum in en verwijder het token op GitHub wanneer het werk klaar is. GitHub-verkeer gaat rechtstreeks van de browser naar api.github.com; LadeStack hoeft de inloggegevens niet te bewaren. Browseropslag is nog steeds geen back-up, dus een repository is ook een verstandige kopie buiten het apparaat.',
          },
          {
            heading: '10. Wanneer deze workflow volstaat en wanneer niet',
            body: 'GitHub-synchronisatie is voldoende voor een groot deel van de browserprojecten: een statische site, een React- of Vue-prototype, een klasoefening, een kleine interne tool of een demo die een remote en een deploymentbron nodig heeft. Het past bij een solo-ontwikkelaar die versiebeheer wil zonder Git te installeren, bij een docent die een reproduceerbare overdracht nodig heeft en bij iedereen die op een machine zonder terminal werkt. Het is niet voldoende voor een monorepo met submodules, een repository die van Git LFS afhankelijk is, een team dat ondertekende commits of een gedetailleerde beoordeling van de commitgeschiedenis nodig heeft, of een releaseproces met hooks en meerdere remotes. Dat zijn desktop-Git-taken, en doen alsof dat niet zo is, zou de browserworkflow slechter maken. Het nuttige patroon is hybride. Begin in de browser omdat de eerste preview direct is. Push wanneer het project een vorm heeft die het waard is om te bewaren. Open dezelfde repository op de desktop wanneer het werk native tooling, een diepere debugger of een volledige Git-workflow nodig heeft. Haal wijzigingen via GitHub terug wanneer je naar de browser terugkeert. De bestanden zijn gewone bronbestanden, dus de overdracht is versiebeheer en geen migratie. Om de browserhelft uit te proberen, open je het Projects Dashboard op /app/projects, maak je een project aan, open je GitHub sync en push je een eerste commit. De volledige installatie en functiereferentie staan in de documentatie.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lees de volledige GB Coder-documentatie →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Een browser-IDE-project deployen naar Vercel of Netlify',
        description: 'Hoe deployment vanuit een browser-IDE werkt: providertokens, statische uploads, Vercel-builds, stabiele URL\'s, limieten, beveiliging, redeploys en fouten.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Deployment', 'Vercel', 'Netlify', 'Browser-IDE', 'Statische sites'],
        intro: 'Deployment is het moment waarop een browserproject ophoudt een preview te zijn. Tot dan leeft de code in een tabblad, horen de bestanden bij een browserprofiel en is de enige persoon die het resultaat kan openen degene die het heeft gebouwd. Vercel en Netlify lossen het hosten op, maar hun gebruikelijke workflow veronderstelt een Git-repository, een terminal of een gesleepte map. GB Coder neemt een kortere route: een Deploy-knop verpakt het huidige project, stuurt het via de API van de provider met het token van je account en geeft een live HTTPS-URL terug. Deze gids legt die route in detail uit: wat er wordt geüpload, hoe de deployment wordt gevolgd, waarom een tweede deployment op hetzelfde adres kan landen en waar de grenzen liggen. Het is geen algemene gids over Vercel of Netlify, maar over wat het browserpaneel werkelijk doet.',
        sections: [
          {
            heading: '1. Waarom je überhaupt vanuit de browser zou deployen',
            body: 'Het duidelijkste geval is een machine waarop een CLI installeren lastig of verboden is. Een Chromebook, een labcomputer of een vergrendelde zakelijke desktop kan een browsertab openen, maar niet altijd Node.js, Git en een provider-CLI installeren. Een browser-IDE haalt die eisen al weg voor het bewerken. Deployment is meestal de laatste stap die de ontwikkelaar terug naar een terminal stuurt; die in hetzelfde tabblad houden sluit de cirkel: het project wordt bewerkt, bekeken en gepubliceerd zonder lokale toolchain. Het tweede geval is snelheid. Een landingspagina, prototype of klantdemo heeft soms een URL nodig voordat er een repository of CI-pipeline is. Het browserpaneel publiceert de huidige snapshot en vertelt waar die live staat. Dat gemak heeft een grens. Dit is een directe upload, geen deploymentpipeline. Het volgt geen branch, draait geen tests en promoot geen builds tussen omgevingen; dat hoort bij Git-integratie of CI. De browserroute is voor de eerste URL, niet voor het hele releaseproces.',
          },
          {
            heading: '2. Wat one-click deployment werkelijk doet',
            body: 'De Deploy-dialoog is een dunne bedieningslaag boven twee provider-API\'s. Zodra je op Deploy now drukt, bouwt GB Coder dezelfde bestandsbundel als Download ZIP. Dat detail is belangrijk: er is geen tweede verpakkingsroute die stiekem een stylesheet kan weglaten of een externe bibliotheek kan vergeten. Een eenvoudig project wordt index.html, style.css, script.js en een README. Een React- of Vue-project wordt een Vite-structuur met index.html, package.json, vite.config.js, .gitignore, een README en bronbestanden onder src/. De samenvatting toont het exacte aantal bestanden en de ongecomprimeerde grootte voordat er iets het tabblad verlaat. Vercel ontvangt de bestanden als inline JSON op zijn deployment-endpoint. Netlify ontvangt een ZIP als raw request body. Vercel bouwt of serveert het project; Netlify publiceert de geüploade bestanden als handmatige deployment. Er zit geen LadeStack-server tussen en er draait geen CLI op je machine. De browser is de client, de provider de host en het token de enige credential. One-click beschrijft de interface, niet het werk: verpakken, uploaden, remote verwerking en TLS gebeuren nog steeds na elkaar.',
          },
          {
            heading: '3. Statische sites en Vite-apps nemen verschillende routes',
            body: 'De bundel verschilt omdat de twee projecttypen anders behandeld moeten worden. Een gewoon HTML/CSS/JavaScript-project heeft geen package.json. Vercel krijgt de opdracht geen framework te gebruiken en serveert de bestanden statisch. Netlify publiceert de ZIP ongewijzigd, wat voor statische bestanden ook klopt. Er valt niets te installeren of compileren, dus de eerste deployment is meestal snel. Een React- of Vue-project bevat een gegenereerde package.json, een Vite-config en bronbestanden. Op Vercel herkent de provider Vite, installeert de dependencies, draait de productiebuild en publiceert de output. Dat is een echte cloudbuild, geen simulatie in de browser, en daarom kan het een minuut of langer duren. Vercel gebruikt ook de versies uit package.json, niet wat toevallig in de editor geladen was. De handmatige ZIP-deployment van Netlify voert geen build-commando uit, dus dezelfde Vite-bronboom wordt geüpload en ongecompileerd gepubliceerd. Gebruik voor React of Vue op Netlify de Git-integratie van de provider; de one-clickoptie van Netlify publiceert alleen statische output. Externe bibliotheken en injectie-instellingen zitten al in de bundel. Als een Vercel-build afhankelijk is van een privépakket, een native binary of een dienst die de build-image niet kan bereiken, mislukt de build terwijl de preview lokaal werkt. De logs laten zien welk geval je hebt.',
          },
          {
            heading: '4. Een token met de juiste scope',
            body: 'Beide providers authenticeren met een personal access token. Dat is niet je providerwachtwoord en geen GB Coder-account. De dialoog linkt naar de tokenpagina van de gekozen provider en legt de scope in gewone taal uit. Een Vercel-token kan publiceren naar elk project dat het account of team kan bereiken; gebruik waar mogelijk een team-scoped token. Een Netlify-token werkt op de sites waartoe het account toegang heeft, dus behandel het als accountbreed tenzij er een nauwere optie is. Maak het token voor dit doel, geef het de kortst nuttige levensduur en trek het in wanneer het project het niet meer nodig heeft. GB Coder controleert of er een token is en of de bundel binnen de lokale limieten past voordat Deploy now actief wordt. Het token staat standaard alleen in het geheugen van het tabblad. Remember on this device is een opt-in: op een secure origin wordt het token met AES-GCM verzegeld voordat het naar localStorage gaat; anders waarschuwt de dialoog dat onthouden het als platte tekst opslaat. Scope en intrekken zijn de belangrijkste controles.',
          },
          {
            heading: '5. Je eerste deployment, stap voor stap',
            body: 'Open een project en kies Deploy in de werkbalk; op een smal scherm zit het in het overflowmenu. Vercel is standaard geselecteerd; Netlify is één klik weg. De projectnaam wordt vooraf ingevuld. GB Coder zet die om naar kleine letters, vervangt ongeldige tekens door koppeltekens en toont de hostname die het gaat aanvragen, bijvoorbeeld jouw-project.vercel.app. Plak het token, beslis of je het wilt onthouden en controleer de bundelsamenvatting. Als het aantal bestanden of de grootte boven de limiet zit, legt de dialoog het probleem uit en blijft de knop uitgeschakeld. Druk op Deploy now. De provider maakt het project of de site aan, ontvangt de bundel en begint de deployment te verwerken. Als de deployment klaar is, toont het succescherm de live-URL, het aantal bestanden, de uploadgrootte, de verstreken tijd en een QR-code om de pagina op een telefoon te openen. Copy URL en Visit site helpen bij de overdracht, en Build logs opent de logweergave van de provider. Netlify-sitenamen zijn wereldwijd uniek, dus een gevraagde naam kan al bezet zijn. De provider wijst dan een andere naam toe en GB Coder meldt het adres dat echt live staat, niet wat je typte.',
          },
          {
            heading: '6. Wat het voortgangsscherm werkelijk toont',
            body: 'De voortgangsbalk gaat door verpakken, uploaden, bouwen, beveiligen en klaar. Bij Netlify staat het bouwlabel voor verwerking door de provider, niet voor een build-commando. Het is een rapport van de client, geen voorspelling van de provider. Het percentage loopt snel door de eerste twee fasen en blijft onder 100 staan terwijl de provider het werk op afstand afrondt. Dat is bewust: werk op afstand kan onvoorspelbaar lang duren en een balk die naar 99 procent racet, zou liegen. GB Coder pollt de provider elke anderhalve seconde en werkt het bericht bij wanneer de status verandert. Een uploadrequest heeft een timeout van twee minuten. Het paneel stopt na drie minuten deployment-polling met wachten en verwijst naar het dashboard, omdat de deployment kan afronden terwijl de browser niet meer kijkt. Annuleren, de dialoog sluiten of Escape indrukken breekt het lopende request en de pollinglus af. Als de provider de deployment al heeft geaccepteerd, kan de deployment aan zijn kant doorgaan; controleer het dashboard voordat je aanneemt dat annuleren een rollback was. De logs van de provider zijn de autoritatieve bron wanneer een deployment mislukt.',
          },
          {
            heading: '7. Opnieuw deployen, stabiele URL\'s en providerstatus',
            body: 'Deploy again gaat terug naar het formulier; het verstuurt de laatste bundel niet meteen opnieuw. Dat is handig wanneer het project is veranderd, de naam aangepast moet worden of het token is verlopen. Vercel en Netlify nemen daarna verschillende routes naar hetzelfde adres. Vercel maakt een deployment voor het genoemde project en richt zich op productie. Herhaalde deployments met dezelfde projectnaam werken dat project bij, en de productie-alias gaat voor op de deployment-specifieke URL, zodat het adres dat je deelt meestal stabiel blijft. Netlify heeft een site-id nodig om een bestaande site bij te werken in plaats van een nieuwe te maken. GB Coder bewaart die id in localStorage, gekoppeld aan de opgeschoonde sitenaam. Als je browseropslag wist, van browser wisselt, de naam wijzigt of de site in Netlify verwijdert, vindt de volgende deployment de oude site niet en maakt een nieuwe aan. Daarom kan het hernoemen van een Netlify-project de vorige site achterlaten. Beide providers bewaren deploymentgeschiedenis, custom domains, toegangscontrole en rollback in hun dashboards; het GB Coder-paneel toont alleen de upload en de live-URL. Elke deployment hier is een productiedeployment; er is geen branchpreview of omgevingskeuze.',
          },
          {
            heading: '8. Limieten en fouten om op te plannen',
            body: 'Er gelden twee limieten voordat het request het tabblad verlaat: 900 bestanden en 64 MB ongecomprimeerde inhoud. Ze liggen onder de plafonds van de providers, zodat een enorme upload niet halverwege een browsersessie mislukt. Een mediarijke site kan grote afbeeldingen en video beter op een CDN of in Git houden dan in de projectbundel. Fouten zijn per oorzaak gescheiden. Een 401 betekent dat het token is geweigerd; een 403 wijst meestal op ontbrekende rechten voor het account of team; een 413 of 429 betekent dat de payload te groot is of dat de provider de snelheid beperkt; een 422 betekent dat het project als ongeldig is afgewezen; een 5xx is meestal tijdelijk. Op Vercel is een mislukte frameworkbuild anders: de upload slaagde en de build faalde, dus lees de logs in plaats van een nieuw token te plakken. Een Vercel-build die omgevingsvariabelen nodig heeft, is een andere grens. De dialoog heeft geen editor daarvoor. Stel de waarden in de projectinstellingen van Vercel in en deploy opnieuw; de eerste build kan mislukken voordat het project bestaat. De handmatige ZIP-route van Netlify heeft geen buildstap, dus daar geldt dit niet. Een poll-limiet van drie minuten is geen mislukte deployment, alleen een mislukte wachttijd.',
          },
          {
            heading: '9. Beveiliging, eigendom en de datagrens',
            body: 'De deploymentroute is direct: de browser roept api.vercel.com of api.netlify.com aan met je token. Er is geen proxy die de credential opslaat en er is geen LadeStack-account nodig voor het paneel. Tokens zijn standaard sessiegebonden en worden alleen met AES-GCM verzegeld als je ervoor kiest er een te onthouden op een secure origin. Dat beschermt tegen een leesbaar token in een browserprofielback-up of supportbundel, maar niet tegen kwaadaardige code op dezelfde origin terwijl het tabblad open is. Gebruik het nauwste token dat beschikbaar is, stel een vervaldatum in en trek het bij de provider in als het werk klaar is. Eigendom volgt het token: het project of de site wordt aangemaakt in het provideraccount dat eigenaar is, onder de voorwaarden, quota, logs en facturering van die provider. GB Coder blijft local-first, maar deployen is een expliciete export van het project naar de provider. De provider ontvangt de bron van de site, en het resultaat is standaard een openbare HTTPS-URL; wachtwoordbeveiliging, SSO en custom domains zijn providerfuncties. Bewaar een ZIP of GitHub-kopie als het browserprofiel de enige andere plek is waar het project bestaat.',
          },
          {
            heading: '10. Wanneer browserdeployment het juiste gereedschap is',
            body: 'Gebruik deze route om een kleine site snel online te zetten: een landingspagina, portfolio, klassendemo, prototype voor klantreview of statische documentatiepagina. Het past ook wanneer het project al in GB Coder staat en het alternatief een ZIP exporteren, een terminal openen en een CLI configureren op een machine die niet van jou is. Het past slecht bij een monorepo, een server-rendered applicatie met database, een build met private registry-referenties, een team dat releases via branchpreviews en approvals doet, of assets boven de uploadlimieten. Dat zijn taken voor Git-integratie, een CI-pipeline of een desktopomgeving. De twee benaderingen kunnen samenwerken: ontwerp en itereer in de browser, push de bron naar GitHub wanneer het historie verdient en laat CI de productiebuild publiceren. Een praktische routine: test de preview op telefoonbreedte, controleer de bundelsamenvatting, deploy, open de live-URL op een tweede apparaat en bewaar de buildlog. Om het te proberen open je het Projectendashboard op /app/projects, maak of open je een project en kies Deploy. De configuratiereferentie staat in de documentatie.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lees de volledige GB Coder-documentatie →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'API-sleutels en omgevingsvariabelen in een browser-IDE',
        description: 'Waar API-sleutels en omgevingsvariabelen horen in een browser-IDE: blootstelling aan de client, veilige opslag, scoping, rotatie, deployment en respons.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Beveiliging', 'API-sleutels', 'Omgevingsvariabelen', 'Browser-IDE', 'Best practices'],
        intro: 'Elke browser-IDE krijgt vroeg of laat dezelfde vraag: waar blijven de sleutels? Het project heeft een API-endpoint nodig, het AI-paneel een providersleutel en de deployment een accounttoken. Op een desktopmachine kunnen die waarden in een shellprofiel of een niet-gevolgd bestand staan. In een browsertab is de grens anders. Alles wat met de pagina wordt meegestuurd, kan door de pagina worden gelezen, en alles wat in het browserprofiel wordt opgeslagen, hoort bij dat profiel. Deze gids geeft een praktisch model: welke waarden je mag publiceren, welke nooit de client mogen bereiken, hoe GB Coder providerreferenties behandelt en wat je moet doen als een sleutel uitlekt. Hij is bedoeld voor mensen die het gemak van een browser-IDE willen zonder te doen alsof een tab een kluis is.',
        sections: [
          {
            heading: '1. Een browsertab is een openbaar builddoel',
            body: 'De eerste regel is ongemakkelijk maar simpel: een statische webapp kan geen geheim bewaren. De browser downloadt HTML, CSS en JavaScript en voert die uit op de machine van de gebruiker. Iedereen kan DevTools openen, het netwerkpaneel lezen, de bundel doorzoeken of een breakpoint zetten en een variabele inspecteren. Minificeren, opsplitsen in chunks of een waarde in een configuratiebestand verstoppen verandert de inspanning, niet de uitkomst. Een browser-IDE voegt een sandbox toe voor het uitvoeren van projectcode, maar de interface van de IDE draait nog steeds op dezelfde origin en moet lezen wat hij nodig heeft. De sandbox is geen kluis voor waarden die de interface zelf gebruikt. De bruikbare test is eenvoudig: als een waarde beschikbaar moet zijn voor code in de tab, ga er dan van uit dat de gebruiker hem kan lezen, en dat elk script op dezelfde origin hem ook kan lezen. Dat maakt browserontwikkeling niet onveilig. Het definieert de grens. Publieke identificatoren kunnen erin; serverreferenties niet.',
          },
          {
            heading: '2. Wat een omgevingsvariabele betekent in een statische app',
            body: 'Op een Node.js-server wordt een omgevingsvariabele tijdens runtime uit het proces gelezen. In een build met Vite, Create React App, Next.js of Astro werken publieke omgevingsvariabelen anders: de bundler vervangt verwijzingen tijdens de build door letterlijke strings. Vite stelt variabelen met het voorvoegsel VITE_ beschikbaar via import.meta.env; Create React App gebruikt REACT_APP_; Next.js gebruikt NEXT_PUBLIC_; Astro gebruikt PUBLIC_. Het voorvoegsel is een naamgevingsconventie, geen beveiligingsmaatregel. Zodra een waarde is ingevoegd, maakt hij deel uit van de JavaScript die elke bezoeker downloadt. Een variabele zonder publiek voorvoegsel is normaal gesproken niet beschikbaar voor clientcode; daarom moeten waarden die alleen voor de server bedoeld zijn, door een server of serverless functie worden gelezen, niet door een statische pagina. Een .env-bestand is invoer voor ontwikkeling en build, geen runtime-geheimenopslag. Het is handig voor lokale configuratie en om waarden buiten versiebeheer te houden, maar het maakt een waarde na de build niet privé.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Welke sleutels in de browser mogen leven',
            body: 'Sommige sleutels zijn ontworpen om openbaar te zijn. Een publiceerbare Stripe-sleutel identificeert een account en maakt betaaltokens; de geheime sleutel verplaatst daadwerkelijk geld en moet op een server blijven. Een Supabase anon-sleutel is alleen veilig als de row-level security policies kloppen. Een Firebase-webconfiguratie identificeert een project, maar geeft geen beheertoegang. Sleutels voor kaarten en gebruiksmeting zijn vaak beperkt per domein of API. Deze waarden mogen naar de browser, maar verdienen nog steeds grenzen: toegestane origins, API-beperkingen, rollen met minimale rechten, quota en waarschuwingen. De tegenovergestelde categorie is makkelijker te benoemen. Service-role-sleutels, databasewachtwoorden, SMTP-referenties, ondertekeningsgeheimen en privésleutels van AI-providers horen nooit in een statische bundel. Een providersleutel die bij de applicatie hoort, is extra gevaarlijk: iedereen die hem vindt, kan het geld van de applicatie uitgeven. Een sleutel die bij de gebruiker hoort, is een ander geval. Het blijft een bearer-referentie, maar het is de zijne, en het doel is hem in de browser van de gebruiker te houden in plaats van in het project of de repository.',
          },
          {
            heading: '4. Hoe GB Coder providerreferenties behandelt',
            body: 'Het AI-paneel van GB Coder werkt volgens bring-your-own-key. De sleutelbeheerder houdt providersleutels standaard in het geheugen. Hij schrijft ze niet naar localStorage. De gebruiker kan expliciet kiezen voor opslag in sessionStorage; daarmee is de waarde beperkt tot het huidige tabblad en wordt hij normaal gewist wanneer het tabblad sluit. De sleutel wordt uit het geheugen en de sessieopslag verwijderd wanneer de gebruiker hem wist. De beheerder koppelt elke sleutel ook aan een toegestane endpoint-origin, en een uitgaande poort controleert dat een referentie niet naar een bestemming wordt gestuurd waarvoor hij niet is goedgekeurd. Fouten van providers gaan door een redactielaag die sleutelpatronen en actieve sleutels verwijdert voordat het bericht de interface of een log bereikt. Metadata van aangepaste providers wordt in localStorage opgeslagen, maar headers die als geheim zijn gemarkeerd, worden vóór opslag gewist en moeten opnieuw worden ingevoerd. Verzoeken gaan rechtstreeks van de browser naar het endpoint van de provider; GB Coder stuurt de sleutel niet via een LadeStack-server. Deze maatregelen beperken onbedoelde opslag en lekken tussen origins. Ze veranderen de basisregel niet: elk script dat op dezelfde origin kan draaien, kan lezen wat de pagina kan lezen. Gebruik een schoon profiel voor gevoelig werk en installeer geen extensies die je niet vertrouwt.',
          },
          {
            heading: '5. Projectgeheimen, .env-bestanden en invoeging tijdens de build',
            body: 'Houd geheimen buiten de projectmap. Zet .env en de lokale varianten in .gitignore en commit een .env.example met placeholders. Als een project Vite gebruikt, onthoud dan dat elke VITE_-variabele in de productiebundel wordt ingevoegd. Een waarde die tijdens lokale ontwikkeling handig was, wordt openbaar zodra hij in een productiebuild wordt gebruikt. Inspecteer vóór de deployment de gegenereerde assets op sleutelpatronen en behandel een treffer als een incident, niet als een waarschuwing. GitHub secret scanning en push protection kunnen sommige bekende tokenformaten vinden, maar het is een vangnet, geen vervanging voor het buiten de repository houden van waarden. De ZIP-export van een browser-IDE bevat projectbestanden. Als er een .env-bestand in het project staat, reist het mee met de back-up. Een back-up is geen versleutelde kluis. Bewaar exports op een privéplek en verwijder oude kopieën wanneer je ze niet meer nodig hebt. Hetzelfde geldt voor screenshots, issue-rapporten en chatberichten: een sleutel die in een daarvan is geplakt, heeft de browser al verlaten.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. GitHub- en deploymenttokens',
            body: 'GitHub personal access tokens en deploymenttokens zijn krachtiger dan ze lijken. Een klassiek token met repository- en workflowrechten kan privécode lezen, bestanden wijzigen en releases starten. Geef de voorkeur aan fine-grained tokens met één repository, een expliciete rechtenlijst en een vervaldatum. Geef een token alleen de rechten die de taak nodig heeft: contents lezen en schrijven voor een sync, niet administration of billing. Maak aparte tokens voor aparte apparaten of doelen en trek ze in wanneer het werk klaar is. Deploymenttokens voor Vercel of Netlify kunnen projecten publiceren, vervangen of verwijderen. Als de provider scoping per project of team ondersteunt, gebruik die; als hij vervaldatums ondersteunt, stel er een in. Plak het token alleen in het deploymentpaneel wanneer dat nodig is en sla het niet op in een projectbestand. Gebruik in CI repository- of organisatiegeheimen in plaats van een gecommitte .env, en onthoud dat pull requests van forks normaal gesproken geen geheimen ontvangen. Een token dat is gefotografeerd, in een chat is gedeeld of in een openbare repository is gecommit, moet als gecompromitteerd worden beschouwd, ook als het een seconde later is verwijderd.',
          },
          {
            heading: '7. AI-providersleutels: BYOK zonder verrassingen',
            body: 'Een AI-providersleutel is een bearer-referentie met een rekening eraan vast. Iedereen die hem heeft, kan verzoeken sturen, quota verbruiken en kosten maken. Gebruik een sleutel die aan een project is gekoppeld, stel een uitgavelimiet in als de provider dat biedt, en gebruik een aparte sleutel voor experimenten in plaats van de hoofdsleutel van de organisatie. Controleer het gebruik regelmatig, zeker na het delen van een apparaat of het installeren van een nieuwe extensie. Lokale providers zoals Ollama, LM Studio en vLLM hebben geen cloudsleutel nodig, maar hun endpoints zijn nog steeds diensten op de machine. Stel een lokaal endpoint niet bloot aan het openbare internet alleen om een demo te laten werken. Als een aangepaste provider naar een proxy wijst, kan de proxy de sleutel zien; gebruik alleen een proxy die je beheert en begrijpt. Prompt-injectie is een verwant risico: een bestand, een webpagina of een geplakt foutbericht kan instructies bevatten die op de assistent zijn gericht. Houd geheimen buiten prompts en buiten bestanden die de assistent mag lezen. Als een sleutel in een gesprek verschijnt, roteer hem dan.',
          },
          {
            heading: '8. Gedeelde computers, extensies en XSS',
            body: 'Een gedeelde computer of labcomputer vraagt om een andere routine. Gebruik een privé-browserprofiel, kies niet voor sessiepersistentie en sluit het tabblad als je klaar bent. Als de browser aanbiedt de sleutel op te slaan, weiger dat. Wis de opslag van de site als je vermoedt dat die bewaard is gebleven. Browserextensies zijn een ander deel van de grens: een extensie met brede hostrechten kan vaak paginacontent of opslag lezen, en een kwaadaardige update kan binnenkomen nadat je hem hebt geïnstalleerd. Gebruik een minimaal profiel voor werk met referenties. Cross-site scripting is in deze context het klassieke webrisico. Als een aanvaller een script op de origin van de IDE kan uitvoeren, kan dat script localStorage en sessionStorage lezen en verzoeken doen zolang de pagina open is. Houd dependencies actueel, vermijd niet-vertrouwde scripts van derden en overweeg een content security policy op de gedeployde site. Klembordbeheerders en schermdeeltools zien ook wat je kopieert en toont. Wis het klembord nadat je een sleutel hebt verplaatst en pauzeer het delen voordat je een providerinstellingenpaneel opent.',
          },
          {
            heading: '9. Een uitgelekte sleutel roteren',
            body: 'Rotatie is de enige betrouwbare reactie op een uitgelekte sleutel. Eerst intrekken is belangrijk: als de oude sleutel geldig blijft terwijl een vervanger wordt voorbereid, gaat de blootstelling door. Maak de nieuwe sleutel met de smalst mogelijke scope, werk de applicatie of browserinstellingen bij, deploy opnieuw als de waarde deel uitmaakte van een build, en controleer dat de oude sleutel wordt geweigerd. Bekijk daarna het gebruik en de auditlogs van de provider op activiteit die je niet verwachtte. Als de sleutel in Git is gecommit, is het bestand verwijderen niet genoeg; de waarde blijft in de geschiedenis staan. Roteer eerst en herschrijf daarna de geschiedenis met een tool zoals git filter-repo of BFG, force-push in overleg met het team en vraag medewerkers opnieuw te clonen. Hostingplatforms kunnen oude builds cachen, dus zorg dat de oude waarde niet uit een verouderde bundel kan worden geserveerd. Als de sleutel in een AI-chat, een supportticket of een screenshot is geplakt, ga er dan van uit dat hij is bewaard en roteer hem. Leg ten slotte vast wat er is gebeurd, voeg een controle toe die het had kunnen vangen en verkort de levensduur van de volgende sleutel.',
          },
          {
            heading: '10. Een praktische checklist',
            body: 'Gebruik deze volgorde voordat een project de browser verlaat. Ten eerste, classificeer elke waarde: publieke identificator, gebruikersreferentie of servergeheim. Ten tweede, houd servergeheimen buiten de statische bundel en zet ze achter een serverless functie of API. Ten derde, stel alleen waarden bloot die het publieke voorvoegsel nodig hebben, en inspecteer de gebouwde assets vóór de deployment. Ten vierde, houd .env-bestanden buiten Git, commit een .env.example en schakel secret scanning in. Ten vijfde, maak tokens met scope en vervaldatum voor GitHub en hosting, één per doel. Ten zesde, laat sleutels in GB Coder in het geheugen tenzij je op een vertrouwd apparaat zit, en kies alleen voor sessiepersistentie als je de afweging begrijpt. Ten zevende, plak een sleutel nooit in een prompt, een issue, een screenshot of een projectbestand. Ten achtste, roteer bij twijfel en trek in voordat je vervangt. Ten negende, gebruik een schoon browserprofiel op gedeelde machines. Ten tiende, schrijf het plan voor een lek op voordat je het nodig hebt. Een browser-IDE kan verantwoord met referenties omgaan als hij de browser als een publieke client behandelt en niet als een privékluis.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'IDE navigateur vs IDE de bureau : lequel choisir ?',
        description: 'Comparatif pratique entre IDE navigateur et IDE de bureau : installation, performances, extensions, débogage, Git, hors ligne, sécurité et cas d’usage.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['IDE navigateur', 'IDE de bureau', 'Outils de développement', 'Développement web', 'Comparatif'],
        intro: 'L’IDE de bureau est devenu si naturel que beaucoup de développeurs ne se posent même plus la question. Installer un éditeur, ajouter des extensions, configurer un runtime, cloner le dépôt, puis seulement écrire la première ligne. Un IDE navigateur propose un autre ordre : ouvrir un onglet, créer un projet et commencer à taper pendant que l’environnement se met en place. Le compromis n’est une victoire nette pour aucun des deux. L’IDE navigateur supprime l’installation et rend le travail portable, mais il hérite des limites du bac à sable du navigateur. L’IDE de bureau exige une installation et de l’espace disque, mais il accède aux toolchains natifs, aux extensions et au matériel local. Ce comparatif examine les dimensions qui changent réellement la décision, avec GB Coder comme exemple côté navigateur parce que ses deux modes couvrent les deux extrémités du spectre.',
        sections: [
          {
            heading: '1. Ce qu’est réellement un IDE navigateur',
            body: 'Un IDE navigateur est un éditeur qui s’exécute dans une page web et ouvre ou stocke un projet sans installation de bureau. La catégorie réunit deux produits très différents. Le premier est un atelier statique : des panneaux HTML, CSS et JavaScript avec aperçu en direct et sans gestionnaire de paquets. Le second est un environnement d’exécution complet, où un système fondé sur WebAssembly comme WebContainer exécute Node.js, npm et un serveur de développement dans l’onglet. GB Coder propose les deux : un éditeur statique pour le travail sans dépendances et un IDE avancé pour React, Vue et les projets npm ordinaires. Cette distinction compte dans toutes les comparaisons qui suivent. Un éditeur statique se compare à un bloc-notes ; un IDE navigateur complet se compare à une installation de bureau légère. Juger tous les IDE navigateur sur la version statique revient à juger les IDE de bureau sur un éditeur de texte avec coloration syntaxique.',
          },
          {
            heading: '2. Les avantages que garde l’IDE de bureau',
            body: 'Les IDE de bureau restent le meilleur choix pour les systèmes vastes et durables. Ils exécutent des compilateurs natifs, des émulateurs mobiles, des clients de bases de données, Docker et des serveurs de langage qui analysent un monorepo entier. Les places de marché d’extensions fournissent des débogueurs, des outils de framework, des linters et des intégrations sans équivalent dans le navigateur. Les fichiers locaux ne dépendent pas d’un quota de stockage, et une machine dotée de suffisamment de RAM garde à la fois une arborescence de dépendances imposante et plusieurs services. Le travail hors ligne est la norme plutôt qu’une exception, et les extensions de développement distant permettent à un ordinateur portable léger de piloter un serveur puissant. Rien de tout cela n’est obsolète. Si votre quotidien implique un SDK natif, un backend composé de plusieurs services ou un dépôt avec des centaines de paquets, l’IDE de bureau n’est pas une habitude nostalgique : c’est l’outil adapté.',
          },
          {
            heading: '3. Temps d’installation et premier aperçu',
            body: 'La différence la plus visible apparaît avant même la première ligne de code. Une installation de bureau suppose généralement l’éditeur, un runtime, un gestionnaire de paquets, des extensions et les dépendances du projet, puis l’attente de la première compilation. Sur une machine neuve, cela peut prendre une après-midi. Un IDE navigateur réduit la séquence : ouvrir le site, choisir un modèle ou un projet vide, et le premier aperçu apparaît immédiatement. GB Coder crée l’espace de travail dans IndexedDB, donc pas de compte, de téléchargement ni d’aller-retour serveur. La réserve est que l’application elle-même doit se charger, et que le mode avancé exige un navigateur moderne avec SharedArrayBuffer et isolation cross-origin. Pour une salle de classe, un ordinateur prêté, un Chromebook ou une démonstration client rapide, la différence est décisive. Pour un développeur déjà équipé d’une station de travail réglée, le coût d’installation se paie une fois et pèse moins.',
          },
          {
            heading: '4. Performances, mémoire et limites du runtime',
            body: 'Un IDE de bureau utilise directement le processeur et la mémoire. Un IDE navigateur vit dans un onglet, et cet onglet est un bac à sable géré avec son propre plafond de mémoire. Ce plafond est confortable pour une application Vite classique, mais il n’est pas infini. Installer une arborescence de dépendances très lourde, lancer plusieurs watchers ou compiler un monorepo énorme peut saturer l’onglet ou provoquer un rechargement. WebContainer ne peut pas non plus exécuter de binaires natifs, d’images Docker ni d’outils compilés pour le système hôte. La comparaison honnête dépend donc de la charge de travail. Pour une page d’atterrissage, un tableau de bord, une bibliothèque de composants ou un petit prototype full-stack, l’IDE navigateur se comporte comme un environnement local. Pour un projet qui a besoin d’un moteur de base de données, d’un service Python ou d’un module natif, le bureau reste l’environnement pratique. L’autonomie suit la même logique : un onglet consomme moins qu’un IDE complet et une douzaine de services en arrière-plan, mais une longue session WebContainer coûte quand même de l’énergie.',
          },
          {
            heading: '5. Intelligence de l’éditeur et extensions',
            body: 'La qualité de l’éditeur n’est plus un point faible du navigateur. GB Coder utilise Monaco, le même moteur open source que VS Code : complétions, documentation en ligne, validation syntaxique, appariement des parenthèses, édition multi-curseurs et raccourcis configurables sont présents. TypeScript, JavaScript, HTML, CSS et JSON bénéficient de services de langage, et un visualiseur de différences permet de relire les changements avant de les appliquer. Ce qui manque à un IDE navigateur, c’est l’écosystème d’extensions. Il n’existe pas de place de marché pour un plugin de langage spécialisé, un inspecteur de framework ou un débogueur sur mesure. Une partie de ces fonctions est intégrée, une autre est superflue sur un petit projet, mais un développeur dépendant d’une extension précise ressentira le manque. Le compromis tient à l’entretien : un éditeur navigateur arrive déjà configuré, tandis qu’un éditeur de bureau ne devient puissant qu’après avoir été soigneusement réglé.',
          },
          {
            heading: '6. Terminal, paquets et pipelines de build',
            body: 'Le terminal est ce qui distingue un véritable IDE navigateur d’un bac à sable de code en ligne. Dans l’IDE avancé de GB Coder, WebContainer fournit un runtime Node.js, npm install résout de vrais paquets, les scripts npx s’exécutent et un serveur Vite démarre sur un port redirigé vers l’aperçu. Le terminal est un shell xterm.js avec sortie ANSI et historique des commandes, pas un panneau de journaux simulé. Cela couvre le pipeline front-end courant : installer, développer, compiler et tester avec des outils JavaScript ordinaires. Cela ne couvre pas les addons natifs, Docker Compose ou une base de données de production. Un IDE de bureau peut faire tourner toute la pile, y compris les services avec lesquels le front-end communique. La règle pratique est simple : si la chaîne d’outils est JavaScript de bout en bout, le navigateur peut probablement la supporter ; si elle touche au code natif ou aux conteneurs, le bureau est plus sûr.',
          },
          {
            heading: '7. Débogage : contexte navigateur ou outils natifs',
            body: 'Les IDE navigateur ont un avantage de débogage sous-estimé : le code, l’aperçu et les outils du navigateur partagent le même contexte. Un changement CSS est visible immédiatement, la console virtuelle recueille les journaux à côté de l’aperçu, et un QR code ouvre la page sur un vrai téléphone pour révéler les problèmes tactiles et de viewport. GB Coder propose aussi des préréglages de viewport et un aperçu détachable pour un second écran. Les IDE de bureau gagnent en profondeur. Ils attachent des débogueurs aux processus Node, posent des points d’arrêt entre services, profilent mémoire et processeur, inspectent les threads natifs et s’intègrent aux émulateurs mobiles. Pour le travail visuel front-end, la boucle du navigateur est plus courte. Pour une condition de course subtile dans un processus serveur, le débogueur de bureau est un meilleur instrument. La plupart des développeurs ont besoin des deux retours, d’où l’intérêt du flux hybride présenté plus loin.',
          },
          {
            heading: '8. Fichiers, contrôle de version et sauvegardes',
            body: 'Le stockage est le point où les modèles navigateur et bureau divergent le plus. Un projet de bureau vit dans un dossier que tout outil peut lire. Un projet de navigateur vit dans IndexedDB, rapide et privé, mais lié au profil du navigateur et exposé au nettoyage du stockage. GB Coder atténue cela avec des instantanés nommés, un visualiseur de différences, une exportation ZIP avec hash d’intégrité et une importation avec aperçu structurel. La synchronisation GitHub utilise un jeton d’accès personnel, regroupe les envois en un commit atomique, ignore les fichiers inchangés et signale un conflit lorsque la branche distante a bougé. Git de bureau reste plus complet : hooks, sous-modules, rebase, dépôts distants multiples et CLI comprise par tous les systèmes de CI. Le flux navigateur suffit pour un petit projet et surprend pour un développeur solo, mais il ne remplace pas un client Git complet sur un dépôt complexe. L’export vers GitHub ou un ZIP fait le lien entre les deux.',
          },
          {
            heading: '9. Sécurité, confidentialité et coût',
            body: 'Un IDE navigateur concentre risque et commodité au même endroit. GB Coder privilégie le stockage local : les projets restent dans le navigateur, aucun compte n’est requis, et le produit est gratuit sans publicité. Les données ne quittent l’appareil que lorsqu’une fonction connectée est utilisée, comme un fournisseur d’IA, la synchronisation GitHub, un déploiement ou un CDN référencé par le projet. L’IA fonctionne avec votre propre clé, et les prompts ainsi que le code sélectionné sont envoyés au fournisseur configuré. GitHub et les déploiements Vercel ou Netlify utilisent vos jetons, qui restent limités à la session sauf si vous activez le stockage chiffré. Ce modèle donne le contrôle au développeur, mais il signifie aussi que le stockage du navigateur est la seule copie en l’absence de sauvegarde. Un IDE de bureau conserve les fichiers sur disque et hérite généralement du modèle de sauvegarde et de permissions du système. Aucun n’est automatiquement plus sûr : la vraie question est qui détient les données et ce qui arrive lorsqu’un appareil ou un profil disparaît.',
          },
          {
            heading: '10. Comment choisir et comment les combiner',
            body: 'Choisissez un IDE navigateur quand le travail est visuel, court ou doit rester portable : apprendre HTML et CSS, prototyper une interface, enseigner, relire un design sur un Chromebook ou créer une petite application React ou Vue sans installer de chaîne d’outils. Choisissez un IDE de bureau quand le travail est durable et lourd : un monorepo, des SDK natifs, Docker, des builds mobiles, une grande pile d’extensions ou du développement hors ligne sur un réseau verrouillé. La réponse la plus intéressante est de les combiner. Commencez dans le navigateur, car le premier aperçu est immédiat. Vérifiez la mise en page à largeur de téléphone. Prenez un instantané. Poussez vers GitHub ou exportez un ZIP. Ouvrez le même dépôt sur le bureau lorsque le projet réclame un outil natif, un débogueur plus profond ou un flux Git complet. Les fichiers sont standard : le passage relève du contrôle de version ordinaire, pas d’une migration. GB Coder est conçu pour cette première moitié du cycle et n’enferme pas le projet dans le navigateur. Pour tester le versant navigateur de la décision, ouvrez le tableau de bord des projets et créez un espace vide ; la comparaison devient concrète en une minute.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lire la documentation complète de GB Coder →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'Guide de synchronisation GitHub dans un IDE de navigateur',
        description: 'Comment fonctionne la synchronisation GitHub dans un IDE navigateur : jetons, commits atomiques, pulls, conflits, limites et sécurité.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Gestion de versions', 'IDE navigateur', 'Git', 'Flux de développement'],
        intro: 'Les IDE navigateur excellent à supprimer l\'installation. Ils le sont moins pour l\'étape suivante : donner au travail un foyer durable en dehors du profil du navigateur. C\'est généralement là qu\'un terminal apparaît : git init, remote add, commit, push. La synchronisation GitHub dans un IDE navigateur réduit cette séquence à un panneau, mais ce n\'est ni magique ni un client Git complet. C\'est un pont ciblé entre un projet qui vit dans le stockage du navigateur et un dépôt qui vit sur GitHub. Ce guide explique comment ce pont fonctionne dans GB Coder, ce qu\'il envoie, comment il gère les conflits et les jetons, et où un workflow Git de bureau reste préférable.',
        sections: [
          {
            heading: '1. Pourquoi un IDE navigateur a besoin de GitHub',
            body: 'Un projet dans le navigateur est pratique précisément parce qu\'il n\'a besoin ni de dossier, ni de runtime, ni d\'installation. Cette même propriété est sa faiblesse. Les projets vivent dans le profil du navigateur, qui peut être effacé par un outil de nettoyage, perdu avec un appareil ou laissé derrière soi lorsqu\'on change d\'ordinateur. Exporter un ZIP crée une copie, mais un ZIP est un instantané sans historique ni remote partagé. GitHub apporte la couche manquante : un dépôt hors appareil, un historique de commits, un espace de collaboration et une source naturelle pour la CI ou le déploiement. Cela change le rôle de l\'IDE navigateur. Ce n\'est plus un brouillon jetable ; il peut être l\'endroit où un petit projet est écrit, relu et transmis. Le workflow est particulièrement utile sur un Chromebook, une machine de salle de classe ou un ordinateur portable d\'entreprise verrouillé où installer Git n\'est pas possible. Il convient aussi à un prototype rapide qui pourra ensuite rejoindre un dépôt de bureau. Le navigateur prend en charge la première version ; GitHub la rend durable.',
          },
          {
            heading: '2. Ce que fait la synchronisation, et ce qu\'elle ne fait pas',
            body: 'GB Coder expose trois actions GitHub : Push, New repo et Pull. Push écrit le projet courant dans un dépôt et une branche existants. New repo crée un dépôt sous le compte GitHub connecté et y enregistre le projet comme premier contenu. Pull lit une branche et importe ses fichiers texte dans l\'éditeur. Toutes les requêtes vont directement du navigateur à api.github.com ; aucun serveur LadeStack ne s\'interpose pour conserver le jeton. Ce périmètre étroit est volontaire. Le panneau ne remplace pas la ligne de commande Git. Il ne propose ni rebase, ni résolution de conflit de merge, ni sous-modules, ni Git LFS, ni commits signés, ni hooks, ni remotes multiples. Il n\'affiche pas non plus le graphe complet des commits. Ces limites comptent sur un dépôt complexe. Pour le projet courant dans le navigateur — une page statique, un prototype React, un exemple pédagogique ou un petit utilitaire —, les trois opérations couvrent la partie qui doit réellement se passer hors de l\'onglet.',
          },
          {
            heading: '3. Créer un jeton avec la bonne portée',
            body: 'La synchronisation GitHub utilise un jeton d\'accès personnel, pas un mot de passe ni un compte GB Coder. Un jeton classique a besoin de la portée repo. Un jeton fine-grained a besoin d\'un accès en lecture et écriture à Contents, et peut être limité à un seul dépôt. L\'option la plus étroite est le meilleur choix par défaut : si le jeton fuit, les dégâts restent limités aux projets qu\'il peut atteindre. L\'écran de connexion renvoie à la page de jetons de GitHub et explique les deux choix. Collez le jeton, choisissez de le mémoriser ou non sur l\'appareil, puis cliquez sur Connect. GB Coder le vérifie en récupérant le compte et la liste des dépôts, puis affiche l\'identifiant connecté et la limite d\'API restante. Rien n\'est écrit dans le dépôt tant qu\'un push ou la création d\'un dépôt n\'est pas confirmé. Traitez le jeton comme un mot de passe : ne le collez pas dans une issue, un chat ou une capture d\'écran, et révoquez-le sur GitHub lorsqu\'il n\'est plus utile. Un jeton avec une date d\'expiration et un accès à un seul dépôt est un compromis raisonnable pour ce workflow.',
          },
          {
            heading: '4. Votre premier push : ce qui est réellement envoyé',
            body: 'L\'onglet Push demande un dépôt, une branche, un message de commit et une option : supprimer les fichiers absents du projet. Avant que quoi que ce soit ne quitte le navigateur, le panneau affiche le nombre de fichiers et la taille totale. Cet aperçu est utile car l\'envoi n\'est pas un simple vidage des onglets de l\'éditeur. GB Coder utilise le même constructeur d\'archive que l\'export ZIP et le déploiement. Un projet HTML/CSS/JavaScript simple devient index.html, style.css, script.js et un README. Un projet React ou Vue devient un dépôt de structure Vite avec index.html, package.json, vite.config.js, .gitignore, un README et les fichiers source sous src/. Les dossiers de dépendances et la sortie de build ne sont pas inclus. Le message de commit est modifiable et vaut par défaut \'Update from GB Coder\'. L\'option de suppression des fichiers absents est désactivée par défaut ; activez-la uniquement lorsque le dépôt doit refléter exactement le projet courant, car elle supprime les fichiers distants qui n\'existent plus en local. Pour un premier push, choisissez la branche par défaut du dépôt, sauf si vous voulez délibérément une branche séparée.',
          },
          {
            heading: '5. Commits atomiques et fichiers inchangés ignorés',
            body: 'Une synchronisation naïve depuis le navigateur valide un fichier à la fois. Cela produit un historique bruyant et laisse un dépôt à moitié mis à jour si une requête échoue en cours de route. GB Coder utilise plutôt l\'API Git Data de GitHub : elle envoie des blobs, construit un tree au-dessus du tree courant de la branche, crée un commit et déplace la référence de branche. Le résultat est un seul commit atomique par push, y compris les suppressions demandées par l\'option correspondante. La seconde optimisation est plus discrète mais tout aussi importante. Git identifie le contenu d\'un fichier par un hash SHA-1, et le navigateur peut calculer ce hash localement avec WebCrypto. GB Coder compare les fichiers locaux au tree cible avant l\'envoi. Les fichiers inchangés ne coûtent aucun appel d\'API, et un push sans changement renvoie \'already up to date\' au lieu de créer un commit vide. Cela garde l\'historique lisible et réserve le budget d\'API aux vrais changements. Sur un petit projet, la différence est invisible ; sur un projet de plusieurs dizaines de fichiers, c\'est la différence entre une synchronisation propre et une synchronisation lente et bruyante.',
          },
          {
            heading: '6. Créer un dépôt sans quitter le navigateur',
            body: 'L\'onglet New repo crée un dépôt dans le compte connecté. Vous indiquez un nom et une description facultative, choisissez public ou privé, et décidez si GitHub doit initialiser le dépôt avec un README. L\'initialisation est active par défaut car un dépôt vide n\'a pas de tête de branche sur laquelle construire le premier push. GB Coder utilise ce commit initial, remplace le README par les fichiers du projet et enregistre le commit initial. Si l\'initialisation est désactivée, il crée lui-même un commit racine et la référence de branche par défaut. Après la création, le nouveau dépôt et la branche par défaut sont sélectionnés pour le push suivant, donc il n\'y a pas de seconde configuration. C\'est le chemin le plus court d\'une idée à un dépôt privé et versionné. C\'est utile pour un devoir de classe, une démo client qui doit rester privée ou un prototype qui a besoin d\'une URL pour un service de CI. Le dépôt appartient au compte GitHub propriétaire du jeton, pas à LadeStack, et peut ensuite être géré, transféré ou supprimé depuis GitHub.',
          },
          {
            heading: '7. Récupérer un dépôt dans l\'éditeur',
            body: 'Pull est le trajet retour. Saisissez l\'URL d\'un dépôt ou un couple propriétaire/nom, choisissez une branche, et GB Coder lit le tree de la branche. Il importe les fichiers texte qu\'un éditeur peut ouvrir utilement : code source, JSON, Markdown, configuration et SVG, entre autres. Il ignore les dossiers node_modules, dist, build, .git, .next et coverage. Il limite aussi un pull à 200 fichiers et 512 Ko par fichier ; si la branche dépasse l\'une de ces limites, le panneau indique combien de fichiers ont été écartés au lieu de les abandonner silencieusement. Les fins de ligne sont normalisées pour qu\'un fichier créé sous Windows ne semble pas changer à chaque ligne. Les fichiers importés n\'écrasent pas immédiatement le projet. Ils passent par le même flux de revue et d\'application qu\'un import ZIP, ce qui permet d\'inspecter la structure détectée avant de valider la modification et de l\'annuler ensuite. Pull est donc un bon moyen de continuer le travail sur un autre appareil, d\'inspecter un dépôt avant de l\'éditer ou de récupérer un projet après l\'effacement du stockage du navigateur. C\'est un import, pas un merge ; si le projet courant et la branche ont divergé, examinez le résultat avec attention.',
          },
          {
            heading: '8. Conflits, limites d\'API et échecs explicites',
            body: 'La propriété de sécurité la plus importante est ce qui se passe lorsque la branche distante avance pendant que vous éditez. GB Coder met à jour la référence de branche avec force désactivé. Si quelqu\'un d\'autre a poussé entre-temps, GitHub rejette la mise à jour et le panneau signale un conflit au lieu d\'écraser silencieusement son travail. La résolution est volontairement manuelle : tirez la dernière version de la branche dans un projet, vérifiez les fichiers et poussez à nouveau — ou passez à un client Git de bureau pour un vrai merge. Les autres échecs sont distingués pour que le message soit exploitable. Un jeton expiré produit une erreur d\'authentification et une demande de reconnexion. Une limite de débit indique quand le quota GitHub se réinitialise ; l\'API autorise 5 000 requêtes par heure pour les utilisateurs authentifiés, et un pull consomme une requête par fichier. Un dépôt ou une branche absent produit une erreur introuvable. Les requêtes expirent après 60 secondes, et une opération longue peut être annulée depuis le panneau. Ces détails ne sont pas spectaculaires, mais ils font la différence entre un outil de synchronisation fiable et un outil qui échoue de manière ambiguë.',
          },
          {
            heading: '9. Sécurité des jetons : en session uniquement par défaut',
            body: 'Les jetons sont des identifiants de grande valeur. Un jeton GitHub avec accès en écriture peut modifier chaque dépôt qu\'il peut atteindre. GB Coder conserve un jeton collé dans une map de portée module par défaut, ce qui signifie qu\'il disparaît à la fermeture de l\'onglet et n\'est jamais écrit dans localStorage. L\'option \'Remember on this device\' est un opt-in explicite. Lorsqu\'elle est activée et que la page est en contexte sécurisé, le jeton est scellé avec AES-GCM sous une clé aléatoire par installation avant d\'être stocké. Cela protège contre un jeton lisible dans une sauvegarde de profil navigateur, un profil synchronisé, une machine partagée, une capture d\'écran des outils de développement ou un bundle de support. Cela ne protège pas contre un script capable de s\'exécuter sur la même origine, car un tel script peut appeler le même module de stockage. Aucune conception purement navigateur ne peut résoudre complètement ce problème. Les contrôles pratiques sont donc la portée, l\'expiration et la révocation : utilisez un jeton fine-grained limité au dépôt nécessaire, fixez une expiration et supprimez le jeton sur GitHub lorsque le travail est terminé. Le trafic GitHub va directement du navigateur à api.github.com ; LadeStack n\'a pas besoin de conserver l\'identifiant. Le stockage du navigateur n\'est toujours pas une sauvegarde, donc un dépôt constitue aussi une copie raisonnable hors appareil.',
          },
          {
            heading: '10. Quand ce workflow suffit, et quand il ne suffit pas',
            body: 'La synchronisation GitHub suffit à une grande partie des projets navigateur : un site statique, un prototype React ou Vue, un exercice de classe, un petit outil interne ou une démo qui a besoin d\'un remote et d\'une source de déploiement. Elle convient à un développeur solo qui veut du contrôle de version sans installer Git, à un enseignant qui a besoin d\'une transmission reproductible et à toute personne travaillant sur une machine sans terminal. Elle ne suffit pas pour un monorepo avec sous-modules, un dépôt qui dépend de Git LFS, une équipe qui exige des commits signés ou une revue détaillée de l\'historique, ni un processus de release fondé sur des hooks et plusieurs remotes. Ce sont des tâches Git de bureau, et prétendre le contraire dégraderait le workflow navigateur. Le modèle utile est hybride. Commencez dans le navigateur car le premier aperçu est immédiat. Poussez lorsque le projet a une forme qui mérite d\'être conservée. Ouvrez le même dépôt sur le bureau lorsque le travail exige des outils natifs, un débogueur plus profond ou un workflow Git complet. Récupérez les changements via GitHub lorsque vous revenez au navigateur. Les fichiers sont des fichiers source ordinaires : la transition relève du contrôle de version, pas d\'une migration. Pour essayer la moitié navigateur, ouvrez le Projects Dashboard sur /app/projects, créez un projet, ouvrez GitHub sync et poussez un premier commit. La configuration complète et la référence des fonctionnalités se trouvent dans la documentation.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lire la documentation complète de GB Coder →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Déployer un projet de navigateur sur Vercel ou Netlify',
        description: 'Comment fonctionne le déploiement depuis un IDE de navigateur : jetons, uploads statiques, builds Vercel, URL stables, limites, sécurité, redeploys et échecs.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Déploiement', 'Vercel', 'Netlify', 'IDE de navigateur', 'Sites statiques'],
        intro: 'Le déploiement est le moment où un projet de navigateur cesse d’être une simple prévisualisation. Jusque-là, le code vit dans un onglet, les fichiers appartiennent à un profil de navigateur et la seule personne capable d’ouvrir le résultat est celle qui l’a construit. Vercel et Netlify résolvent l’hébergement, mais leur workflow habituel suppose un dépôt Git, un terminal ou un dossier glissé-déposé. GB Coder emprunte un chemin plus court : un bouton Deploy empaquette le projet courant, l’envoie via l’API du fournisseur avec le jeton de votre compte et renvoie une URL HTTPS publique. Ce guide détaille ce chemin : ce qui est envoyé, comment le déploiement est suivi, pourquoi un second déploiement peut conserver la même adresse et où se situent les limites. Ce n’est pas un guide général sur Vercel ou Netlify, mais une explication de ce que fait réellement le panneau du navigateur.',
        sections: [
          {
            heading: '1. Pourquoi déployer depuis le navigateur',
            body: 'Le cas évident est une machine où installer une CLI est peu pratique ou interdit. Un Chromebook, un ordinateur de salle de classe ou un poste d’entreprise verrouillé peuvent ouvrir un onglet, mais pas toujours installer Node.js, Git et la CLI du fournisseur. Un IDE de navigateur supprime déjà ces contraintes pour l’édition. Le déploiement est souvent la dernière étape qui renvoie le développeur vers un terminal ; le garder dans le même onglet ferme la boucle : le projet est édité, prévisualisé et publié sans toolchain local. Le second cas est la vitesse. Une landing page, un prototype ou une démo client peut avoir besoin d’une URL avant d’avoir besoin d’un dépôt ou d’un pipeline CI. Le panneau publie l’instantané courant et indique où il est en ligne. Cette commodité a une limite. Il s’agit d’un envoi direct, pas d’un pipeline de déploiement. Il ne surveille pas une branche, n’exécute pas de tests et ne promeut pas de builds entre environnements ; ces tâches relèvent de l’intégration Git ou de la CI. Le chemin navigateur sert à la première URL, pas à tout le processus de release.',
          },
          {
            heading: '2. Ce que fait réellement un déploiement en un clic',
            body: 'La boîte de dialogue Deploy est une fine couche de contrôle au-dessus de deux API. Quand vous cliquez sur Deploy now, GB Coder construit le même paquet de fichiers que Download ZIP. Ce détail compte : il n’existe pas de second chemin d’empaquetage qui pourrait omettre une feuille de style ou oublier une bibliothèque externe. Un projet simple devient index.html, style.css, script.js et un README. Un projet React ou Vue devient une arborescence Vite avec index.html, package.json, vite.config.js, .gitignore, un README et les sources sous src/. Le résumé affiche le nombre exact de fichiers et la taille non compressée avant que quoi que ce soit ne quitte l’onglet. Vercel reçoit les fichiers en JSON inline sur son endpoint de déploiement. Netlify reçoit un ZIP comme corps brut de la requête. Vercel construit ou sert le projet ; Netlify publie les fichiers envoyés comme déploiement manuel. Aucun serveur LadeStack ne s’intercale et aucune CLI ne tourne sur votre machine. Le navigateur est le client, le fournisseur est l’hôte et le jeton est le seul identifiant. Un clic décrit l’interface, pas le travail : empaquetage, envoi, traitement distant et TLS se succèdent toujours.',
          },
          {
            heading: '3. Sites statiques et applications Vite : des chemins différents',
            body: 'Le paquet diffère parce que les deux types de projet demandent un traitement différent. Un projet HTML/CSS/JavaScript simple n’a pas de package.json. Vercel reçoit l’instruction de n’utiliser aucun framework et sert les fichiers en statique. Netlify publie le ZIP tel quel, ce qui convient aussi aux fichiers statiques. Il n’y a rien à installer ni à compiler, donc le premier déploiement est généralement rapide. Un projet React ou Vue contient un package.json généré, une configuration Vite et des sources. Sur Vercel, le fournisseur détecte Vite, installe les dépendances, lance le build de production et publie la sortie. C’est un vrai build cloud, pas une simulation dans le navigateur, et c’est pourquoi il peut prendre une minute ou plus. Vercel utilise aussi les versions enregistrées dans package.json, pas ce qui se trouvait dans l’éditeur. Le déploiement ZIP manuel de Netlify n’exécute pas de commande de build : la même arborescence source Vite est publiée telle qu’elle a été envoyée, sans compilation. Pour React ou Vue sur Netlify, utilisez l’intégration Git du fournisseur ; le parcours en un clic de Netlify ne publie que des fichiers statiques. Les bibliothèques externes et les réglages d’injection sont déjà dans le paquet. Si un build Vercel dépend d’un paquet privé, d’un binaire natif ou d’un service inaccessible depuis son image de build, le build échouera même si la prévisualisation fonctionne. Les logs indiquent dans quel cas vous êtes.',
          },
          {
            heading: '4. Obtenir un jeton avec la bonne portée',
            body: 'Les deux fournisseurs s’authentifient avec un jeton d’accès personnel. Ce n’est ni votre mot de passe de fournisseur ni un compte GB Coder. La boîte de dialogue renvoie vers la page de jetons du fournisseur choisi et explique la portée en termes simples. Un jeton Vercel peut publier sur tous les projets accessibles au compte ou à l’équipe ; lorsqu’un jeton limité à l’équipe existe, utilisez-le. Un jeton Netlify agit sur les sites accessibles au compte ; traitez-le donc comme global, sauf option plus restrictive. Créez le jeton pour cet usage, donnez-lui la durée de vie la plus courte possible et révoquez-le lorsque le projet n’en a plus besoin. GB Coder vérifie qu’un jeton est présent et que le paquet respecte les limites locales avant d’activer Deploy now. Le jeton reste en mémoire pour l’onglet par défaut. Remember on this device est une option : sur une origine sécurisée, le jeton est scellé avec AES-GCM avant d’être écrit dans localStorage ; sinon, la boîte de dialogue avertit qu’il serait stocké en clair. La portée et la révocation sont les contrôles les plus importants.',
          },
          {
            heading: '5. Votre premier déploiement, étape par étape',
            body: 'Ouvrez un projet, puis choisissez Deploy dans la barre d’outils ; sur un écran étroit, il se trouve dans le menu de débordement. Vercel est sélectionné par défaut, Netlify est à un clic. Le nom du projet est prérempli. GB Coder le passe en minuscules, remplace les caractères invalides par des tirets et affiche le nom d’hôte demandé, par exemple votre-projet.vercel.app. Collez le jeton, choisissez de le mémoriser ou non et vérifiez le résumé du paquet. Si le nombre de fichiers ou la taille dépasse la limite, la boîte de dialogue explique le problème et laisse le bouton désactivé. Cliquez sur Deploy now. Le fournisseur crée le projet ou le site, reçoit le paquet et commence à traiter le déploiement. Une fois le déploiement prêt, l’écran de succès affiche l’URL publique, le nombre de fichiers, la taille envoyée, le temps écoulé et un QR code pour ouvrir la page sur téléphone. Copy URL et Visit site servent au transfert, et Build logs ouvre les logs du fournisseur. Les noms de site Netlify sont globaux : un nom demandé peut donc être pris. Le fournisseur en attribue un autre et GB Coder indique l’adresse réellement en ligne, pas celle que vous avez saisie.',
          },
          {
            heading: '6. Ce que montre vraiment l’écran de progression',
            body: 'La barre de progression traverse l’empaquetage, l’envoi, le build, la sécurisation et l’état prêt. Sur Netlify, le libellé de build correspond au traitement du fournisseur, pas à une commande de build. C’est un rapport du client, pas une prédiction du fournisseur. Le pourcentage progresse pendant les deux premières phases puis reste sous 100 pendant que le fournisseur termine le travail distant. C’est volontaire : le travail distant peut prendre un temps imprévisible, et une barre qui filerait à 99 % mentirait. GB Coder interroge le fournisseur toutes les secondes et demie et met le message à jour lorsque l’état change. Une requête d’envoi a un délai limite de deux minutes. Le panneau cesse d’attendre après trois minutes de suivi du déploiement et renvoie vers le tableau de bord, car le déploiement peut encore se terminer alors que le navigateur ne regarde plus. Annuler, fermer la boîte de dialogue ou appuyer sur Échap interrompt la requête en cours et la boucle de suivi. Si le fournisseur a déjà accepté le déploiement, le déploiement peut continuer de son côté ; vérifiez le tableau de bord avant de supposer qu’annuler équivaut à un rollback. Les logs du fournisseur sont la source fiable lorsqu’un déploiement échoue.',
          },
          {
            heading: '7. Redéploiements, URL stables et état du fournisseur',
            body: 'Deploy again revient au formulaire ; il ne renvoie pas immédiatement le dernier paquet. C’est utile lorsque le projet a changé, que le nom doit être ajusté ou que le jeton a expiré. Vercel et Netlify empruntent ensuite des routes différentes vers la même adresse. Vercel crée un déploiement pour le projet nommé et cible la production. Les déploiements répétés avec le même nom mettent ce projet à jour, et l’alias de production est préféré à l’URL spécifique du déploiement, de sorte que l’adresse partagée reste normalement stable. Netlify a besoin d’un identifiant de site pour mettre à jour un site existant au lieu d’en créer un autre. GB Coder mémorise cet identifiant dans localStorage, associé au nom nettoyé. Si vous effacez le stockage du navigateur, changez de navigateur, modifiez le nom ou supprimez le site dans Netlify, le déploiement suivant ne retrouve pas l’ancien site et en crée un nouveau. C’est pourquoi renommer un projet Netlify peut laisser l’ancien site dans le compte. Les deux fournisseurs conservent l’historique, les domaines personnalisés, les contrôles d’accès et le rollback dans leurs tableaux de bord ; le panneau GB Coder n’expose que l’envoi et l’URL publique. Chaque déploiement ici est un déploiement de production ; il n’y a ni preview de branche ni sélecteur d’environnement.',
          },
          {
            heading: '8. Limites et échecs à anticiper',
            body: 'Deux limites s’appliquent avant que la requête ne quitte l’onglet : 900 fichiers et 64 Mo de contenu non compressé. Elles restent sous les plafonds des fournisseurs pour qu’un envoi volumineux n’échoue pas au milieu d’une session de navigateur. Un site riche en médias devrait garder les grandes images et vidéos sur un CDN ou dans Git, pas dans le paquet du projet. Les erreurs sont séparées par cause. Un 401 signifie que le jeton a été refusé ; un 403 indique généralement un manque de droits sur le compte ou l’équipe ; un 413 ou 429 signifie que la charge est trop lourde ou que le fournisseur limite le débit ; un 422 signifie que le projet a été rejeté comme invalide ; un 5xx est généralement temporaire. Sur Vercel, un échec de build de framework est différent : l’envoi a réussi et le build a échoué, donc lisez les logs au lieu de coller un nouveau jeton. Un build Vercel qui a besoin de variables d’environnement est une autre frontière. La boîte de dialogue n’a pas d’éditeur pour cela. Définissez-les dans les paramètres du projet Vercel et redéployez ; le premier build peut échouer avant que le projet n’existe. Le déploiement ZIP manuel de Netlify n’a pas d’étape de build, donc cela ne s’y applique pas. Une limite de suivi de trois minutes n’est pas un déploiement échoué, seulement une attente interrompue.',
          },
          {
            heading: '9. Sécurité, propriété et frontière des données',
            body: 'Le déploiement est direct : le navigateur appelle api.vercel.com ou api.netlify.com avec votre jeton. Aucun proxy ne stocke l’identifiant et aucun compte LadeStack n’est requis pour utiliser le panneau. Les jetons sont limités à la session par défaut et ne sont scellés avec AES-GCM que si vous choisissez d’en mémoriser un sur une origine sécurisée. Cela protège contre un jeton lisible dans une sauvegarde de profil ou un bundle de support, mais pas contre du code malveillant sur la même origine tant que l’onglet est ouvert. Utilisez le jeton le plus restreint disponible, fixez une expiration et révoquez-le chez le fournisseur lorsque le travail est terminé. La propriété suit le jeton : le projet ou le site est créé dans le compte fournisseur qui le possède, selon ses conditions, quotas, logs et facturation. GB Coder reste local-first, mais déployer est une exportation explicite du projet vers le fournisseur. Le fournisseur reçoit la source du site et le résultat est une URL HTTPS publique par défaut ; protection par mot de passe, SSO et domaines personnalisés sont des fonctions du fournisseur. Conservez un ZIP ou une copie GitHub si le profil du navigateur est le seul autre endroit où le projet existe.',
          },
          {
            heading: '10. Quand le déploiement depuis le navigateur est le bon outil',
            body: 'Utilisez ce chemin pour mettre rapidement en ligne un petit site : landing page, portfolio, démo de cours, prototype pour une revue client ou page de documentation statique. Il convient aussi lorsque le projet vit déjà dans GB Coder et que l’alternative consiste à exporter un ZIP, ouvrir un terminal et configurer une CLI sur une machine qui n’est pas la vôtre. Il convient mal à un monorepo, une application rendue côté serveur avec base de données, un build nécessitant des identifiants de registre privé, une équipe qui publie via des previews de branche et des approbations, ou des assets dépassant les limites d’envoi. Ces tâches relèvent de l’intégration Git du fournisseur, d’un pipeline CI ou d’un environnement de bureau. Les deux approches peuvent coexister : concevoir et itérer dans le navigateur, pousser la source vers GitHub lorsqu’elle mérite un historique, et laisser la CI publier le build de production. Une routine pratique : tester la prévisualisation en largeur téléphone, vérifier le résumé du paquet, déployer, ouvrir l’URL sur un second appareil et conserver le log. Pour essayer, ouvrez le tableau de bord des projets sur /app/projects, créez ou ouvrez un projet et choisissez Deploy. La référence de configuration se trouve dans la documentation.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Lire la documentation complète de GB Coder →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'Clés API et variables d\'environnement dans un IDE web',
        description: 'Où placer les clés API et les variables d\'environnement dans un IDE web : exposition, stockage, portée, gestion de la rotation, déploiement et réponse.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Sécurité', 'Clés API', 'Variables d\'environnement', 'IDE web', 'Bonnes pratiques'],
        intro: 'Tout IDE web finit par poser la même question : où vont les clés ? Le projet a besoin d\'un point de terminaison API, le panneau IA d\'une clé de fournisseur et le déploiement d\'un jeton de compte. Sur une machine de bureau, ces valeurs peuvent vivre dans un profil shell ou dans un fichier non suivi. Dans un onglet de navigateur, la frontière est différente. Tout ce qui est envoyé avec la page peut être lu par la page, et tout ce qui est stocké dans le profil du navigateur appartient à ce profil. Ce guide propose un modèle pratique : quelles valeurs peuvent être publiées, lesquelles ne doivent jamais atteindre le client, comment GB Coder gère les identifiants des fournisseurs et quoi faire lorsqu\'une clé fuite. Il s\'adresse à ceux qui veulent le confort d\'un IDE web sans prétendre qu\'un onglet est un coffre-fort.',
        sections: [
          {
            heading: '1. Un onglet de navigateur est une cible de compilation publique',
            body: 'La première règle est inconfortable mais simple : une application web statique ne peut pas garder un secret. Le navigateur télécharge HTML, CSS et JavaScript, puis les exécute sur la machine de l\'utilisateur. N\'importe qui peut ouvrir les DevTools, lire le panneau réseau, fouiller le bundle ou poser un point d\'arrêt et inspecter une variable. Minifier le code, le découper en morceaux ou cacher une valeur dans un fichier de configuration change l\'effort, pas le résultat. Un IDE web ajoute un sandbox pour exécuter le code du projet, mais l\'interface de l\'IDE s\'exécute toujours sur la même origine et doit lire ce dont elle a besoin pour fonctionner. Le sandbox n\'est pas un coffre pour les valeurs que l\'interface elle-même doit utiliser. Le test utile est direct : si une valeur doit être disponible pour le code exécuté dans l\'onglet, partez du principe que la personne qui utilise l\'onglet peut la lire, et que tout script exécuté sur la même origine peut aussi la lire. Cela ne rend pas le développement dans le navigateur dangereux. Cela définit la frontière. Les identifiants publics peuvent y vivre ; les identifiants serveur non.',
          },
          {
            heading: '2. Ce que signifie une variable d\'environnement dans une application statique',
            body: 'Sur un serveur Node.js, une variable d\'environnement est lue à l\'exécution depuis le processus. Dans une compilation Vite, Create React App, Next.js ou Astro, les variables d\'environnement publiques fonctionnent différemment : le bundler remplace les références par des chaînes littérales pendant la compilation. Vite expose les variables préfixées par VITE_ via import.meta.env ; Create React App utilise REACT_APP_ ; Next.js utilise NEXT_PUBLIC_ ; Astro utilise PUBLIC_. Le préfixe est une convention de nommage, pas un contrôle de sécurité. Une fois la valeur intégrée, elle fait partie du JavaScript que chaque visiteur télécharge. Une variable sans préfixe public n\'est normalement pas accessible au code client, ce qui explique pourquoi les valeurs réservées au serveur doivent être lues par un serveur ou une fonction serverless, et non par une page statique. Un fichier .env est une entrée de développement et de compilation, pas un coffre de secrets à l\'exécution. Il est utile pour la configuration locale et pour garder des valeurs hors du contrôle de version, mais il ne rend pas une valeur privée après la compilation.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Quelles clés peuvent vivre dans le navigateur',
            body: 'Certaines clés sont conçues pour être publiques. Une clé publiable Stripe identifie un compte et crée des jetons de paiement ; la clé secrète déplace réellement de l\'argent et doit rester sur un serveur. Une clé anon Supabase n\'est sûre que si les politiques de sécurité au niveau des lignes sont correctes. Une configuration web Firebase identifie un projet, mais ne donne pas d\'accès administratif. Les clés de cartes et de mesure d\'usage sont souvent limitées par domaine ou par API. Ces valeurs peuvent être envoyées au navigateur, mais elles méritent quand même des limites : origines autorisées, restrictions d\'API, rôles à privilèges minimaux, quotas et alertes. La catégorie opposée est plus facile à énoncer. Les clés de rôle de service, les mots de passe de bases de données, les identifiants SMTP, les secrets de signature et les clés privées de fournisseurs d\'IA ne doivent jamais figurer dans un bundle statique. Une clé de fournisseur qui appartient à l\'application est particulièrement dangereuse : quiconque la trouve peut dépenser l\'argent de l\'application. Une clé qui appartient à l\'utilisateur est un autre cas. Elle reste un identifiant bearer, mais c\'est le sien, et l\'objectif est de la garder dans son navigateur plutôt que dans le projet ou le dépôt.',
          },
          {
            heading: '4. Comment GB Coder gère les identifiants des fournisseurs',
            body: 'Le panneau IA de GB Coder fonctionne en bring-your-own-key. Le gestionnaire de clés conserve les clés de fournisseur en mémoire par défaut. Il ne les écrit pas dans localStorage. L\'utilisateur peut choisir explicitement une persistance dans sessionStorage, ce qui limite la valeur à l\'onglet courant et l\'efface normalement à la fermeture de l\'onglet. La clé est retirée de la mémoire et du stockage de session lorsque l\'utilisateur l\'efface. Le gestionnaire lie aussi chaque clé à une origine de point de terminaison autorisée, et une porte de sortie vérifie qu\'un identifiant n\'est pas envoyé vers une destination non approuvée. Les erreurs des fournisseurs passent par une couche de rédaction qui supprime les motifs de clés et les clés actives avant que le message n\'atteigne l\'interface ou un journal. Les métadonnées des fournisseurs personnalisés sont stockées dans localStorage, mais les en-têtes marqués comme secrets sont effacés avant la persistance et doivent être saisis à nouveau. Les requêtes vont directement du navigateur au point de terminaison du fournisseur ; GB Coder ne fait pas transiter la clé par un serveur LadeStack. Ces mesures réduisent la persistance accidentelle et les fuites entre origines. Elles ne changent pas la règle de base : tout script capable de s\'exécuter sur la même origine peut lire ce que la page peut lire. Utilisez un profil propre pour les travaux sensibles et n\'installez pas d\'extensions non fiables.',
          },
          {
            heading: '5. Secrets du projet, fichiers .env et intégration à la compilation',
            body: 'Gardez les secrets hors de l\'arborescence du projet. Ajoutez .env et ses variantes locales à .gitignore, et validez un .env.example avec des noms de remplacement. Si un projet utilise Vite, rappelez-vous que chaque variable VITE_ est intégrée au bundle de production. Une valeur pratique en développement local devient publique dès qu\'elle est utilisée dans une compilation de production. Avant de déployer, inspectez les ressources générées à la recherche de motifs de clés et traitez toute correspondance comme un incident, pas comme un avertissement. La détection de secrets et la protection push de GitHub peuvent repérer certains formats de jetons connus, mais elles constituent un filet de sécurité, pas un substitut au fait de garder les valeurs hors du dépôt. L\'export ZIP d\'un IDE web inclut les fichiers du projet. Si un fichier .env se trouve dans le projet, il voyage avec la sauvegarde. Une sauvegarde n\'est pas un coffre chiffré. Stockez les exports dans un endroit privé et supprimez les anciennes copies lorsqu\'elles ne sont plus utiles. Il en va de même pour les captures d\'écran, les rapports de bogues et les messages de chat : une clé collée dans l\'un d\'eux a déjà quitté le navigateur.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. Jetons GitHub et jetons de déploiement',
            body: 'Les jetons d\'accès personnels GitHub et les jetons de déploiement sont plus puissants qu\'ils n\'en ont l\'air. Un jeton classique avec les portées repository et workflow peut lire du code privé, modifier des fichiers et déclencher des releases. Préférez les jetons fine-grained limités à un seul dépôt, avec une liste explicite de permissions et une date d\'expiration. N\'accordez à un jeton que les permissions nécessaires à la tâche : lecture et écriture des contenus pour une synchronisation, pas administration ni facturation. Créez des jetons distincts pour des appareils ou des usages distincts et révoquez-les une fois le travail terminé. Les jetons de déploiement Vercel ou Netlify peuvent publier, remplacer ou supprimer des projets. Si le fournisseur permet une portée par projet ou par équipe, utilisez-la ; s\'il permet une expiration, définissez-la. Ne collez le jeton dans le panneau de déploiement que lorsque c\'est nécessaire et ne l\'enregistrez pas dans un fichier du projet. En CI, utilisez les secrets du dépôt ou de l\'organisation plutôt qu\'un .env validé, et rappelez-vous que les pull requests issues de forks ne reçoivent normalement pas de secrets. Un jeton photographié, partagé dans un chat ou validé dans un dépôt public doit être considéré comme compromis, même s\'il a été supprimé une seconde plus tard.',
          },
          {
            heading: '7. Clés de fournisseurs d\'IA : BYOK sans surprises',
            body: 'Une clé de fournisseur d\'IA est un identifiant bearer avec une facture attachée. Quiconque la possède peut envoyer des requêtes, consommer du quota et générer des frais. Utilisez une clé limitée à un projet, fixez une limite de dépenses si le fournisseur le permet, et utilisez une clé distincte pour les expérimentations plutôt que la clé maîtresse de l\'organisation. Surveillez l\'usage régulièrement, surtout après avoir partagé un appareil ou installé une nouvelle extension. Les fournisseurs locaux comme Ollama, LM Studio et vLLM n\'ont pas besoin de clé cloud, mais leurs points de terminaison restent des services sur la machine. N\'exposez pas un point de terminaison local à l\'internet public juste pour faire fonctionner une démo. Si un fournisseur personnalisé pointe vers un proxy, le proxy peut voir la clé ; n\'utilisez qu\'un proxy que vous contrôlez et comprenez. L\'injection de prompts est un risque connexe : un fichier, une page web ou un message d\'erreur collé peut contenir des instructions destinées à l\'assistant. Gardez les secrets hors des prompts et hors des fichiers que l\'assistant est autorisé à lire. Si une clé apparaît dans une conversation, faites-la tourner.',
          },
          {
            heading: '8. Ordinateurs partagés, extensions et XSS',
            body: 'Un ordinateur partagé ou de laboratoire mérite une routine différente. Utilisez un profil de navigateur privé, ne choisissez pas la persistance de session et fermez l\'onglet lorsque vous avez terminé. Si le navigateur propose d\'enregistrer la clé, refusez. Effacez le stockage du site si vous pensez qu\'il a été conservé. Les extensions de navigateur font partie de la frontière : une extension dotée de larges permissions d\'hôte peut souvent lire le contenu ou le stockage de la page, et une mise à jour malveillante peut arriver après l\'installation. Utilisez un profil minimal pour les travaux impliquant des identifiants. Le cross-site scripting est le risque web classique dans ce contexte. Si un attaquant peut exécuter un script sur l\'origine de l\'IDE, ce script peut lire localStorage et sessionStorage et envoyer des requêtes tant que la page est ouverte. Gardez les dépendances à jour, évitez les scripts tiers non fiables et envisagez une politique de sécurité du contenu sur le site déployé. Les gestionnaires de presse-papiers et les outils de partage d\'écran voient aussi ce que vous copiez et affichez. Videz le presse-papiers après avoir déplacé une clé et suspendez le partage avant d\'ouvrir un panneau de configuration de fournisseur.',
          },
          {
            heading: '9. Faire tourner une clé compromise',
            body: 'La rotation est la seule réponse fiable à une clé compromise. Révoquer d\'abord est important : si l\'ancienne clé reste valide pendant que la nouvelle est préparée, l\'exposition continue. Créez la nouvelle clé avec la portée la plus étroite possible, mettez à jour l\'application ou les réglages du navigateur, redéployez si la valeur faisait partie d\'une compilation, puis vérifiez que l\'ancienne clé est rejetée. Consultez ensuite l\'usage et les journaux d\'audit du fournisseur pour repérer une activité inattendue. Si la clé a été validée dans Git, supprimer le fichier ne suffit pas ; la valeur reste dans l\'historique. Faites d\'abord tourner la clé, puis réécrivez l\'historique avec un outil comme git filter-repo ou BFG, forcez le push avec l\'accord de l\'équipe et demandez aux collaborateurs de recloner. Les plateformes d\'hébergement peuvent mettre en cache d\'anciens builds ; assurez-vous que l\'ancienne valeur ne peut pas être servie depuis un bundle obsolète. Si la clé a été collée dans un chat IA, un ticket de support ou une capture d\'écran, supposez qu\'elle a été conservée et faites-la tourner. Enfin, consignez ce qui s\'est passé, ajoutez un contrôle qui l\'aurait détecté et raccourcissez la durée de vie de la clé suivante.',
          },
          {
            heading: '10. Une liste de vérification pratique',
            body: 'Utilisez cette séquence avant qu\'un projet ne quitte le navigateur. Premièrement, classez chaque valeur : identifiant public, identifiant utilisateur ou secret serveur. Deuxièmement, gardez les secrets serveur hors du bundle statique et placez-les derrière une fonction serverless ou une API. Troisièmement, n\'exposez que les valeurs qui ont besoin du préfixe public et inspectez les ressources compilées avant le déploiement. Quatrièmement, gardez les fichiers .env hors de Git, validez un .env.example et activez la détection de secrets. Cinquièmement, créez des jetons à portée limitée et expirants pour GitHub et l\'hébergement, un par usage. Sixièmement, dans GB Coder, laissez les clés en mémoire sauf si vous êtes sur un appareil de confiance, et n\'activez la persistance de session que si vous comprenez le compromis. Septièmement, ne collez jamais une clé dans un prompt, un ticket, une capture d\'écran ou un fichier du projet. Huitièmement, faites tourner la clé au moindre doute et révoquez avant de remplacer. Neuvièmement, utilisez un profil de navigateur propre sur les machines partagées. Dixièmement, écrivez le plan de fuite avant d\'en avoir besoin. Un IDE web peut gérer des identifiants de manière responsable s\'il traite le navigateur comme un client public et non comme un coffre privé.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'ブラウザIDEとデスクトップIDE、どちらを選ぶ？',
        description: 'ブラウザIDEとデスクトップIDEを、セットアップ、性能、拡張機能、デバッグ、Git、オフライン、セキュリティ、コストの観点で実用比較。選び方と併用方法も解説します。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['ブラウザIDE', 'デスクトップIDE', '開発ツール', 'Web開発', '比較'],
        intro: 'デスクトップIDEはあまりに長く標準だったため、多くの開発者がそもそも疑問に思わなくなっています。エディタを入れ、拡張機能を追加し、ランタイムを設定し、リポジトリをクローンして、ようやく最初の一行を書く。ブラウザIDEはこの順番を変えます。タブを開き、プロジェクトを作り、環境が整うのを待たずに書き始められます。どちらか一方が完全に勝つわけではありません。ブラウザIDEはインストールを不要にし、作業をどこへでも持ち運べるようにしますが、ブラウザのサンドボックスの制約を引き継ぎます。デスクトップIDEはセットアップとディスク容量を要求しますが、ネイティブのツールチェーン、拡張機能、ローカルハードウェアに到達できます。この記事では、判断を実際に左右する軸に沿って比較します。ブラウザ側の例としてGB Coderを使うのは、その2つのモードが両極端をカバーしているからです。',
        sections: [
          {
            heading: '1. ブラウザIDEとは何か',
            body: 'ブラウザIDEとは、Webページ内で動作し、デスクトップへのインストールなしでプロジェクトを開いたり保存したりするエディタです。このカテゴリには大きく異なる2種類があります。1つは静的ワークベンチで、HTML・CSS・JavaScriptのペインとライブプレビューを備え、パッケージマネージャーはありません。もう1つは完全な実行環境で、WebContainerのようなWebAssemblyベースの仕組みがNode.js、npm、開発サーバーをタブ内で実行します。GB Coderは両方を提供します。依存関係のない作業向けのStatic Editorと、React、Vue、一般的なnpmプロジェクト向けのAdvanced IDEです。この区別は、以下のすべての比較で重要になります。静的エディタはメモ帳との比較対象であり、完全なブラウザIDEは軽量なデスクトップ環境との比較対象です。すべてのブラウザIDEを静的版で判断するのは、デスクトップIDEをシンタックスハイライト付きのテキストエディタで判断するようなものです。',
          },
          {
            heading: '2. デスクトップIDEが依然として強い領域',
            body: '大規模で長期間運用するシステムでは、デスクトップIDEが依然として有力です。ネイティブコンパイラ、モバイルエミュレーター、データベースクライアント、Docker、モノレポ全体を解析する言語サーバーを動かせます。拡張機能マーケットプレイスには、ブラウザに同等のものがないデバッガー、フレームワークツール、リンター、連携機能がそろっています。ローカルファイルはストレージ割り当ての影響を受けず、十分なRAMがあれば巨大な依存ツリーと複数のサービスを同時に動かせます。オフライン作業は例外ではなく日常であり、リモート開発拡張を使えば軽量ノートPCから強力なサーバーを操作できます。こうした利点は古くなっていません。日常業務にネイティブSDK、複数サービスからなるバックエンド、数百パッケージのリポジトリが含まれるなら、デスクトップIDEは懐古趣味ではなく、仕事に合った道具です。',
          },
          {
            heading: '3. セットアップ時間と最初のプレビューまで',
            body: '最も明確な差は、コードが存在する前に現れます。デスクトップ環境では通常、エディタ、ランタイム、パッケージマネージャー、拡張機能、プロジェクトの依存関係をインストールし、最初のビルドを待ちます。新しいマシンでは半日かかることもあります。ブラウザIDEはこの手順を圧縮します。サイトを開き、テンプレートか空のプロジェクトを選ぶと、最初のプレビューがすぐに表示されます。GB CoderはワークスペースをIndexedDBに作成するため、アカウント、ダウンロード、サーバーとの往復はありません。ただし、アプリ自体の読み込みは必要で、高度なランタイムにはSharedArrayBufferとクロスオリジン分離を備えた最新ブラウザが求められます。教室、借りたノートPC、Chromebook、急ぎの顧客デモでは、この差は決定的です。すでに調整済みのワークステーションを持つ開発者にとって、セットアップ費用は一度きりで、重みは小さくなります。',
          },
          {
            heading: '4. 性能、メモリ、ランタイムの限界',
            body: 'デスクトップIDEはCPUとRAMを直接使います。ブラウザIDEはタブの中で動き、そのタブは独自のメモリ上限を持つ管理されたサンドボックスです。上限は一般的なViteアプリには十分ですが、無限ではありません。非常に大きな依存ツリーのインストール、複数のウォッチャーの実行、巨大なモノレポのビルドは、タブを疲弊させたり再読み込みを引き起こしたりします。WebContainerはネイティブバイナリ、Dockerイメージ、ホストOS向けにコンパイルされたツールも実行できません。したがって正直な比較は作業内容によって変わります。ランディングページ、ダッシュボード、コンポーネントライブラリ、小規模なフルスタック試作なら、ブラウザIDEはローカル開発と変わらない感覚です。データベースエンジン、Pythonサービス、ネイティブモジュールが必要なプロジェクトでは、デスクトップが実用的な環境であり続けます。バッテリーも同じ傾向です。タブは完全なIDEと十数のバックグラウンドサービスより軽いものの、長時間のWebContainerセッションは電力を消費します。',
          },
          {
            heading: '5. エディタの知能と拡張機能',
            body: 'エディタの品質は、もはやブラウザの弱点ではありません。GB CoderはVS Codeを支えるオープンソースエンジンと同じMonacoを使っているため、補完、インラインのドキュメント表示、構文検証、括弧の対応、マルチカーソル編集、設定可能なキーバインドを備えています。TypeScript、JavaScript、HTML、CSS、JSONには言語サービスが働き、差分ビューアで変更を適用前に確認できます。ブラウザIDEに欠けているのは拡張機能のエコシステムです。専門的な言語プラグイン、フレームワークインスペクター、独自デバッガーのマーケットプレイスはありません。一部は組み込みで、一部は小規模プロジェクトには不要ですが、特定の拡張機能に依存する開発者なら不足を感じます。代わりに得られるのは維持の手間の少なさです。ブラウザエディタは設定済みで届き、デスクトップエディタは誰かが育てて初めて強くなります。',
          },
          {
            heading: '6. ターミナル、パッケージ、ビルドパイプライン',
            body: 'ターミナルは、本物のブラウザIDEとオンラインのコード遊び場を分ける機能です。GB CoderのAdvanced IDEでは、WebContainerがNode.jsランタイムを提供し、npm installが実際のパッケージを解決し、npxスクリプトが実行され、Viteサーバーがプレビューへ転送されるポートで起動します。ターミナルはANSI出力とコマンド履歴を備えたxterm.jsのシェルで、ログのふりをするペインではありません。これで一般的なフロントエンドの流れ、つまりインストール、開発、ビルド、テストを通常のJavaScriptツールでこなせます。ネイティブアドオン、Docker Compose、本番データベースまではカバーしません。デスクトップIDEはフロントエンドが通信するサービスを含むスタック全体を動かせます。実用的な判断基準は単純です。ツールチェーンが最後までJavaScriptならブラウザでもおそらく動き、ネイティブコードやコンテナに踏み込むならデスクトップの方が安全です。',
          },
          {
            heading: '7. デバッグ：ブラウザの文脈とネイティブツール',
            body: 'ブラウザIDEには過小評価されがちなデバッグ上の利点があります。コード、プレビュー、ブラウザの開発者ツールが同じ文脈にあることです。CSSの変更はすぐに見え、仮想コンソールはプレビューの隣でログを拾い、QRコードで実機のスマートフォンにページを開けばタッチやビューポートの問題が露呈します。GB Coderにはビューポートのプリセットと、セカンドモニター向けの切り離し可能なプレビューもあります。デスクトップIDEは深さで勝ります。Nodeプロセスにデバッガーを接続し、サービスをまたいでブレークポイントを置き、メモリとCPUをプロファイルし、ネイティブスレッドを検査し、モバイルエミュレーターと連携します。視覚的なフロントエンド作業ではブラウザのループが短く、サーバープロセス内の微妙な競合状態ではデスクトップデバッガーの方が適しています。ほとんどの開発者には両方のフィードバックが必要で、だからこそ後半のハイブリッドワークフローが重要になります。',
          },
          {
            heading: '8. ファイル、バージョン管理、バックアップ',
            body: '保存の仕組みは、ブラウザとデスクトップのモデルが最も大きく分かれる点です。デスクトップのプロジェクトは、あらゆるツールが読めるフォルダーにあります。ブラウザのプロジェクトはIndexedDBにあり、高速でプライベートですが、ブラウザプロファイルに縛られ、ストレージのクリーンアップに弱い存在です。GB Coderは名前付きスナップショット、差分ビューア、整合性ハッシュ付きZIP書き出し、構造プレビュー付きインポートでこれを補います。GitHub同期は個人アクセストークンを使い、プッシュを1つのアトミックなコミットにまとめ、変更のないファイルを飛ばし、リモートブランチが動いていれば競合として報告します。デスクトップのGitはより完全です。フック、サブモジュール、リベース、複数のリモート、すべてのCIが理解するCLIがあります。ブラウザの流れは小規模プロジェクトには十分で、個人開発者には驚くほど強力ですが、複雑なリポジトリで完全なGitクライアントの代わりにはなりません。GitHubやZIPへの書き出しが両者の橋渡しになります。',
          },
          {
            heading: '9. セキュリティ、プライバシー、コスト',
            body: 'ブラウザIDEはリスクと便利さを同じ場所に集めます。GB Coderはローカルファーストです。プロジェクトはブラウザに保存され、アカウントは不要で、製品は無料、広告もありません。データが端末を離れるのは、AIプロバイダー、GitHub同期、デプロイ、プロジェクトが参照するCDNなど、接続された機能を使ったときだけです。AIはbring-your-own-key方式で、プロンプトと選択したコードは設定したプロバイダーに送られます。GitHubとVercelまたはNetlifyへのデプロイはあなたのトークンを使い、暗号化保存を選ばない限りトークンはセッション限りです。このモデルは開発者に制御を与えますが、バックアップがなければブラウザストレージが唯一のコピーになることも意味します。デスクトップIDEはファイルをディスクに置き、通常はOSのバックアップと権限の仕組みを引き継ぎます。どちらが自動的に安全ということはなく、誰がデータを持ち、端末やプロファイルが消えたときに何が起きるかが問題です。',
          },
          {
            heading: '10. 選び方と組み合わせ方',
            body: 'ブラウザIDEは、作業が視覚的で短時間で、持ち運びが必要なときに選びます。HTMLとCSSの学習、インターフェースの試作、授業、Chromebookでのデザインレビュー、ツールチェーンを入れずに小さなReactやVueアプリを作る場合です。デスクトップIDEは、作業が長期間にわたりシステムが重いときに選びます。モノレポ、ネイティブSDK、Docker、モバイルビルド、大きな拡張機能スタック、閉鎖されたネットワークでのオフライン開発です。より面白い答えは、両方を組み合わせることです。最初のプレビューがすぐ出るのでブラウザで始めます。スマートフォン幅でレイアウトを確認します。スナップショットを取ります。GitHubへプッシュするかZIPを書き出します。ネイティブツール、より深いデバッガー、完全なGitワークフローが必要になったら、同じリポジトリをデスクトップで開きます。ファイルは標準的なので、受け渡しは移行ではなく通常のバージョン管理です。GB Coderはサイクルの前半のために設計されており、プロジェクトをブラウザに閉じ込めません。判断のブラウザ側を試したいなら、プロジェクトダッシュボードを開いて空のワークスペースを作ってください。1分ほどで比較が具体的になります。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coderの完全なドキュメントを読む →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'ブラウザIDEでGitHub同期を実践する方法',
        description: 'ブラウザIDEのGitHub同期を解説。トークン、アトミックコミット、プル、競合、ファイル制限、セキュリティ、向き不向きまで整理します。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'バージョン管理', 'ブラウザIDE', 'Git', '開発ワークフロー'],
        intro: 'ブラウザIDEはセットアップをなくすのが得意です。しかし、その次の段階、つまり作業をブラウザプロファイルの外に永続的な場所へ置くことになると、話は別です。そこで通常はターミナルが登場します。git init、remote add、commit、push。ブラウザIDEのGitHub同期はこの流れをパネル一つにまとめますが、魔法でも完全なGitクライアントでもありません。ブラウザストレージにあるプロジェクトとGitHubにあるリポジトリをつなぐ、焦点を絞った橋です。この記事では、GB Coderでその橋がどう動くか、何がアップロードされるか、競合やトークンをどう扱うか、そしてデスクトップのGitワークフローが今も適している場面を説明します。',
        sections: [
          {
            heading: '1. ブラウザIDEにGitHubが必要な理由',
            body: 'ブラウザ上のプロジェクトが便利なのは、フォルダもランタイムもインストールも不要だからです。その同じ性質が弱点になります。プロジェクトはブラウザプロファイルの中にあり、クリーンアップツールで消えたり、端末の紛失とともに失われたり、別のコンピュータに移ったときに置き去りにされたりします。ZIPを書き出せばコピーは作れますが、ZIPは履歴も共有リモートもないスナップショットです。GitHubは不足している層を提供します。端末の外にあるリポジトリ、コミット履歴、共同作業の場、そしてCIやデプロイの自然な供給元です。これによりブラウザIDEの役割が変わります。使い捨てのメモ帳ではなく、小さなプロジェクトを書き、見直し、引き渡す場所になります。この流れは、Chromebook、学校の実習室、Gitをインストールできないロックダウンされた社用ノートPCで特に役立ちます。後からデスクトップのリポジトリへ移す可能性がある簡単なプロトタイプにも向いています。最初の草稿はブラウザが担い、GitHubがそれを永続化します。',
          },
          {
            heading: '2. 同期ができること、できないこと',
            body: 'GB CoderにはGitHubの操作が3つあります。Push、New repo、Pullです。Pushは現在のプロジェクトを既存のリポジトリとブランチへ書き込みます。New repoは接続中のGitHubアカウントにリポジトリを作成し、プロジェクトを最初の内容としてコミットします。Pullはブランチを読み、テキストファイルをエディタへインポートします。すべてのリクエストはブラウザからapi.github.comへ直接送られ、LadeStackのサーバーが間に立ってトークンを保持することはありません。この狭い範囲は意図的です。このパネルはGitコマンドラインの代替ではありません。rebase、マージコンフリクトの解決、サブモジュール、Git LFS、署名付きコミット、フック、複数のリモートは提供しません。コミットグラフ全体も表示しません。複雑なリポジトリではこれらの制限が重要になります。静的なページ、Reactのプロトタイプ、教材、小さなユーティリティといった一般的なブラウザプロジェクトでは、3つの操作がタブの外で本当に必要な部分をカバーします。',
          },
          {
            heading: '3. 適切なスコープのトークンを作成する',
            body: 'GitHub同期はパスワードでもGB Coderのアカウントでもなく、パーソナルアクセストークンを使います。クラシックトークンにはrepoスコープが必要です。fine-grainedトークンにはContentsの読み取りと書き込み権限が必要で、単一のリポジトリに限定できます。狭いほうが安全な既定値です。トークンが漏れても、被害は到達できるプロジェクトに限定されます。接続画面はGitHubのトークンページへのリンクを示し、両方の選択肢を説明します。トークンを貼り付け、端末に記憶するかどうかを選び、Connectを押します。GB Coderはアカウントとリポジトリ一覧を取得して検証し、サインイン中のログイン名と残りのAPIレート制限を表示します。Pushまたはリポジトリ作成を確定するまで、リポジトリには何も書き込まれません。トークンはパスワードのように扱ってください。issue、チャット、スクリーンショットに貼り付けず、不要になったらGitHubで失効させます。有効期限があり、1つのリポジトリだけにアクセスできるトークンは、この流れに妥当な妥協点です。',
          },
          {
            heading: '4. 最初のPushで実際に送られるもの',
            body: 'Pushタブでは、リポジトリ、ブランチ、コミットメッセージ、そしてプロジェクトに存在しないファイルを削除するかどうかのオプションを指定します。何かがブラウザを出る前に、パネルはファイル数と合計サイズを表示します。アップロードはエディタのタブをそのまま吐き出すわけではないので、このプレビューは役に立ちます。GB CoderはZIP書き出しやデプロイと同じアーカイブビルダーを使います。シンプルなHTML/CSS/JavaScriptプロジェクトはindex.html、style.css、script.js、READMEになります。ReactまたはVueプロジェクトは、index.html、package.json、vite.config.js、.gitignore、README、src/以下のソースファイルというVite形式のリポジトリになります。依存関係のフォルダやビルド出力は含まれません。コミットメッセージは編集でき、既定値は「Update from GB Coder」です。存在しないファイルを削除するオプションは既定でオフです。リポジトリを現在のプロジェクトと完全に一致させたい場合だけオンにしてください。ローカルに存在しないリモートファイルが削除されるためです。最初のPushでは、意図的に別ブランチを作りたい場合を除き、リポジトリの既定ブランチを選びます。',
          },
          {
            heading: '5. アトミックコミットと変更なしファイルのスキップ',
            body: '素朴なブラウザ同期は1ファイルずつコミットします。すると履歴が煩雑になり、途中でリクエストが失敗するとリポジトリが半端に更新されたままになります。GB Coderは代わりにGitHubのGit Data APIを使います。blobをアップロードし、ブランチの現在のツリーの上にツリーを構築し、1つのコミットを作成してブランチ参照を移動します。その結果、Pushごとに1つのアトミックなコミットができ、削除オプションによる削除も含まれます。2つ目の最適化は地味ですが同じくらい重要です。Gitはファイル内容をSHA-1ハッシュで識別し、ブラウザはWebCryptoでそのハッシュをローカル計算できます。GB Coderはアップロード前にローカルファイルと対象ツリーを比較します。変更のないファイルはAPI呼び出しを消費せず、何も変わっていないPushは空のコミットを作らず「already up to date」を返します。これにより履歴が読みやすく保たれ、APIの予算を本当の変更のために残せます。小さなプロジェクトでは差は見えませんが、数十ファイルのプロジェクトでは、きれいな同期と遅くて騒がしい同期の差になります。',
          },
          {
            heading: '6. ブラウザを離れずにリポジトリを作成する',
            body: 'New repoタブは接続中のアカウントにリポジトリを作成します。名前と任意の説明を入力し、公開か非公開を選び、GitHubがREADMEでリポジトリを初期化するかどうかを決めます。空のリポジトリには最初のPushの土台となるブランチの先端がないため、初期化は既定でオンです。GB Coderはそのシードコミットを使い、READMEをプロジェクト自身のファイルで置き換え、最初のコミットを記録します。初期化をオフにすると、ルートコミットと既定ブランチの参照を自分で作成します。作成後は新しいリポジトリと既定ブランチが次のPush用に選択されるので、二度目の設定は不要です。アイデアから非公開でバージョン管理されたリポジトリへの最短経路です。授業の課題、非公開にしたいクライアント向けデモ、CIサービスのURLが必要なプロトタイプに向いています。リポジトリはトークンを所有するGitHubアカウントに属し、LadeStackのものではありません。作成後はGitHubで管理、移管、削除できます。',
          },
          {
            heading: '7. リポジトリをエディタへ戻す',
            body: 'Pullは帰りの旅です。リポジトリのURLまたはowner/nameの組を入力し、ブランチを選ぶと、GB Coderがブランチツリーを読みます。エディタで意味のある形で開けるテキストファイル、つまりソースコード、JSON、Markdown、設定、SVGなどをインポートします。node_modules、dist、build、.git、.next、coverageディレクトリはスキップします。Pullは200ファイル、1ファイル512KBまでに制限されています。どちらかの上限を超えると、パネルは黙って捨てずに、何ファイルが除外されたかを表示します。改行コードは正規化されるので、Windowsで作成したファイルが全行変更されたように見えることはありません。インポートしたファイルがすぐにプロジェクトを上書きすることはありません。ZIPインポートと同じレビューと適用の流れを通るため、変更を確定する前に検出された構造を確認でき、後から元に戻せます。したがってPullは、別の端末で作業を続ける、編集前にリポジトリを確認する、ブラウザストレージが消えた後にプロジェクトを復元するといった用途に向いています。これはインポートでありマージではありません。現在のプロジェクトとブランチが分岐している場合は、結果を慎重に確認してください。',
          },
          {
            heading: '8. 競合、レート制限、正直な失敗モード',
            body: '最も重要な安全特性は、編集中にリモートブランチが進んだときに何が起こるかです。GB Coderはブランチ参照をforce無効で更新します。その間に誰かがPushしていた場合、GitHubは更新を拒否し、パネルはその人の作業を黙って破棄せず競合を報告します。解決はあえて手動です。最新のブランチをプロジェクトにPullし、ファイルを確認してから再度Pushするか、本格的なマージのためにデスクトップのGitクライアントへ移ります。その他の失敗は、メッセージに基づいて行動できるよう分類されます。期限切れのトークンは認証エラーとなり、再接続を求めます。レート制限ではGitHubのクォータがいつリセットされるかを表示します。APIは認証済みユーザーに1時間5,000リクエストを許可し、Pullはファイルごとに1リクエストを消費します。存在しないリポジトリやブランチはnot-foundエラーになります。リクエストは60秒でタイムアウトし、長い操作はパネルからキャンセルできます。これらの細部は華やかではありませんが、信頼できる同期ツールと、曖昧な失敗をするツールの差になります。',
          },
          {
            heading: '9. トークンの安全性：既定ではセッションのみ',
            body: 'トークンは価値の高い認証情報です。書き込み権限を持つGitHubトークンは、到達できるすべてのリポジトリを変更できます。GB Coderは貼り付けたトークンを既定でモジュールスコープのマップに保持します。つまりタブを閉じると消え、localStorageには書き込まれません。「Remember on this device」オプションは明示的なオプトインです。有効にし、ページがセキュアコンテキストであれば、トークンは保存前にインストールごとのランダムな鍵でAES-GCMにより封印されます。これにより、ブラウザプロファイルのバックアップ、同期されたプロファイル、共有マシン、開発者ツールのスクリーンショット、サポートバンドル内でトークンが読める状態になることを防ぎます。同じオリジンで実行できるスクリプトには防御できません。そのスクリプトは同じストレージモジュールを呼べるからです。ブラウザだけで完結する設計では完全には解決できません。したがって実務上の制御はスコープ、有効期限、失効です。必要なリポジトリに限定したfine-grainedトークンを使い、有効期限を設定し、作業が終わったらGitHubでトークンを削除します。GitHubの通信はブラウザからapi.github.comへ直接送られ、LadeStackが認証情報を保持する必要はありません。ブラウザストレージは依然としてバックアップではないので、リポジトリは端末外のコピーとしても合理的です。',
          },
          {
            heading: '10. このワークフローが十分な場合とそうでない場合',
            body: 'GitHub同期は、ブラウザプロジェクトの大部分には十分です。静的サイト、ReactやVueのプロトタイプ、授業の演習、小さな社内ツール、リモートとデプロイ元が必要なデモなどです。Gitをインストールせずにバージョン管理をしたい個人開発者、再現可能な引き渡しが必要な教師、ターミナルがないマシンで作業する人に向いています。サブモジュールを含むモノレポ、Git LFSに依存するリポジトリ、署名付きコミットや詳細なコミット履歴のレビューが必要なチーム、フックと複数のリモートに基づくリリース流程には十分ではありません。それらはデスクトップGitの仕事であり、そうでないふりをするとブラウザの流れが悪くなります。有用なのはハイブリッドなパターンです。最初のプレビューがすぐ得られるのでブラウザで始めます。残す価値のある形になったらPushします。ネイティブツール、より深いデバッガ、完全なGitワークフローが必要になったら、同じリポジトリをデスクトップで開きます。ブラウザに戻るときはGitHub経由で変更をPullします。ファイルは通常のソースファイルなので、引き渡しは移行ではなくバージョン管理です。ブラウザ側を試すには、/app/projectsのProjects Dashboardを開き、プロジェクトを作成し、GitHub syncを開いて最初のコミットをPushしてください。完全なセットアップと機能リファレンスはドキュメントにあります。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coderの完全なドキュメントを読む →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'ブラウザIDEからVercel・Netlifyへデプロイする',
        description: 'ブラウザIDEからのデプロイの仕組みを解説します。プロバイダーのトークン、静的サイトのアップロード、Vercelでのビルド、安定したURL、上限、安全性、再デプロイ、失敗時の対処までを扱います。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['デプロイ', 'Vercel', 'Netlify', 'ブラウザIDE', '静的サイト'],
        intro: 'デプロイは、ブラウザ上のプロジェクトがプレビューの域を出る瞬間です。それまではコードはタブの中にあり、ファイルはブラウザプロファイルに属し、結果を開けるのは作った本人だけです。Vercel と Netlify はホスティングの問題を解決しますが、通常のワークフローは Git リポジトリ、ターミナル、フォルダのドラッグ＆ドロップを前提にしています。GB Coder はもっと短い経路を取ります。Deploy ボタンが現在のプロジェクトをパッケージし、アカウントのトークンを使ってプロバイダーの API に送り、公開 HTTPS URL を返します。この記事では、何がアップロードされるのか、デプロイがどう監視されるのか、2 回目のデプロイが同じアドレスに置かれる理由、そして限界がどこにあるのかを説明します。Vercel や Netlify の一般論ではなく、ブラウザのパネルが実際に何をするのかの解説です。',
        sections: [
          {
            heading: '1. なぜブラウザからデプロイするのか',
            body: '明らかなのは、CLI のインストールが面倒、または禁止されているマシンです。Chromebook、学校のラボ PC、ロックダウンされた社用デスクトップでは、ブラウザのタブは開けても Node.js、Git、プロバイダーの CLI をいつも入れられるわけではありません。ブラウザ IDE は編集の時点でその要件をすでに外しています。デプロイはたいてい、開発者をターミナルへ戻す最後の工程です。同じタブに置けばループが閉じます。ローカルツールチェーンなしで編集、プレビュー、公開まで完結します。2 つめは速度です。ランディングページ、プロトタイプ、クライアント向けデモは、リポジトリや CI パイプラインより先に URL が必要なことがあります。ブラウザのパネルは現在のスナップショットを公開し、公開先を表示します。ただし便利さには境界があります。これは直接アップロードであり、デプロイパイプラインではありません。ブランチを監視せず、テストを実行せず、環境間でビルドを昇格させません。それはプロバイダーの Git 連携か CI の仕事です。ブラウザの経路は最初の URL のためであり、リリース工程全体のためではありません。',
          },
          {
            heading: '2. ワンクリックデプロイが実際にしていること',
            body: 'Deploy ダイアログは 2 つのプロバイダー API の上に載る薄い操作面です。Deploy now を押すと、GB Coder は Download ZIP と同じファイルバンドルを作ります。ここが重要です。スタイルシートを落としたり外部ライブラリを忘れたりする別のパッケージ経路はありません。プレーンなプロジェクトは index.html、style.css、script.js、README になります。React または Vue のプロジェクトは、index.html、package.json、vite.config.js、.gitignore、README、src/ 以下のソースを持つ Vite 形式のツリーになります。ダイアログのバンドル概要には、タブの外へ出る前の正確なファイル数と非圧縮サイズが表示されます。Vercel はデプロイ用エンドポイントにインライン JSON としてファイルを受け取ります。Netlify は ZIP をリクエストの生ボディとして受け取ります。Vercel はビルドまたは配信し、Netlify はアップロードされたファイルを手動デプロイとして公開します。LadeStack のサーバーは間に入らず、あなたのマシンで CLI も動きません。ブラウザがクライアント、プロバイダーがホスト、トークンが唯一の認証情報です。「ワンクリック」はインターフェースの説明であり、作業量の説明ではありません。パッケージ、アップロード、リモート処理、TLS は順番に起こります。',
          },
          {
            heading: '3. 静的サイトとViteアプリは別の経路を通る',
            body: 'バンドルが異なるのは、2 種類のプロジェクトで扱いが違うからです。プレーンな HTML/CSS/JavaScript プロジェクトには package.json がありません。Vercel にはフレームワークを使わないよう指示し、ファイルを静的サイトとして配信します。Netlify は ZIP をそのまま公開しますが、これも静的ファイルには適しています。インストールもコンパイルもないため、最初のデプロイは通常すぐ終わります。React や Vue のプロジェクトには生成された package.json、Vite 設定、ソースファイルが含まれます。Vercel では、プロバイダーが Vite を検出し、依存関係をインストールし、本番ビルドを実行して出力を公開します。これはブラウザ内のシミュレーションではなく実際のクラウドビルドなので、1 分以上かかることがあります。Vercel が使うのは package.json に記録されたバージョンで、たまたまエディタに読み込まれていたものではありません。Netlify の手動 ZIP デプロイはビルドコマンドを実行しないため、同じ Vite ソースツリーはアップロードされたまま、コンパイルされずに公開されます。Netlify で React や Vue を使う場合は、プロバイダーの Git 連携を使ってください。Netlify のワンクリック経路は静的出力のみを公開します。外部ライブラリと注入設定はすでにバンドルに反映されています。Vercel のビルドがプライベートパッケージ、ネイティブバイナリ、ビルドイメージから届かないサービスに依存していると、ローカルのプレビューが動いてもビルドは失敗します。どのケースかはログで確認できます。',
          },
          {
            heading: '4. 適切なスコープのトークンを用意する',
            body: 'どちらのプロバイダーも個人アクセストークンで認証します。プロバイダーのパスワードでも GB Coder のアカウントでもありません。ダイアログは選択したプロバイダーのトークンページへリンクし、スコープを平易に説明します。Vercel のトークンは、アカウントまたはチームが到達できるすべてのプロジェクトに公開できます。チームスコープのトークンがある場合はそれを使ってください。Netlify のトークンはアカウントがアクセスできるサイト全体に作用するため、より狭い選択肢がなければアカウント全体として扱います。この用途のためにトークンを作り、必要最小限の有効期限を設定し、不要になったらプロバイダーで失効させます。GB Coder は、Deploy now を有効にする前にトークンの有無とバンドルがローカル上限内かを確認します。トークンは既定ではタブのメモリ内だけに保持されます。Remember on this device はオプトインです。安全なオリジンでは localStorage に書き込む前に AES-GCM で封印し、そうでない場合は平文で保存されることをダイアログが警告します。もっとも重要な管理はスコープと失効です。',
          },
          {
            heading: '5. 最初のデプロイを順番に進める',
            body: 'プロジェクトを開き、ツールバーの Deploy を選びます。狭い画面ではオーバーフローメニューにあります。既定では Vercel が選択され、Netlify は 1 クリック先です。プロジェクト名は現在のプロジェクトから自動入力されます。GB Coder は小文字にし、無効な文字をハイフンに置き換え、要求するホスト名（例: your-project.vercel.app）を表示します。トークンを貼り付け、記憶するかどうかを選び、バンドル概要を確認します。ファイル数またはサイズが上限を超えている場合、ダイアログは理由を示し、ボタンを無効のままにします。Deploy now を押すと、プロバイダーがプロジェクトまたはサイトを作成し、バンドルを受け取り、デプロイの処理を開始します。デプロイの準備ができると、成功画面に公開 URL、ファイル数、アップロードサイズ、経過時間、スマートフォンで開くための QR コードが表示されます。Copy URL と Visit site は受け渡し用で、Build logs はプロバイダー自身のログ画面を開きます。Netlify のサイト名は世界共通なので、希望した名前が使われていることがあります。その場合は別の名前が割り当てられ、GB Coder は入力した名前ではなく実際に公開されているアドレスを報告します。',
          },
          {
            heading: '6. 進行画面が実際に示しているもの',
            body: '進行バーは、パッケージ、アップロード、ビルド、保護、完了の順に進みます。Netlify では、ビルドという表示はプロバイダー側の処理を指し、ビルドコマンドを意味しません。これはクライアントからの報告であり、プロバイダーの予測ではありません。割合は最初の 2 段階で進み、プロバイダーがリモート処理を終える間は 100 未満で止まります。これは意図的です。リモート処理の時間は予測できず、99% まで一気に進むバーは嘘をつくことになります。GB Coder は 1.5 秒ごとにプロバイダーをポーリングし、状態が変わるとメッセージを更新します。アップロードリクエストには 2 分のタイムアウトがあります。パネルはデプロイのポーリングを 3 分で打ち切り、ダッシュボードへ案内します。ブラウザが見るのをやめてもデプロイが完了することがあるからです。キャンセル、ダイアログを閉じる、Escape を押すと、進行中のリクエストとポーリングループが中断されます。プロバイダーがすでにデプロイを受け付けていれば、向こう側でデプロイが続くことがあります。キャンセルがロールバックを意味すると決めつけず、ダッシュボードを確認してください。デプロイが失敗したときは、プロバイダーのログが信頼できる情報源です。',
          },
          {
            heading: '7. 再デプロイ、安定したURL、プロバイダー側の状態',
            body: 'Deploy again はフォームに戻るだけで、最後のバンドルをすぐ再送信しません。プロジェクトが変わった、名前を調整したい、トークンが切れた、といった場合に便利です。そこから Vercel と Netlify は同じアドレスへ別の経路を取ります。Vercel は指定したプロジェクトに対してデプロイを作成し、本番を対象にします。同じプロジェクト名での繰り返しデプロイはそのプロジェクトを更新し、デプロイ固有の URL より本番エイリアスが優先されるため、共有するアドレスは通常安定します。Netlify は新しいサイトを作らず既存サイトを更新するためにサイト ID が必要です。GB Coder はサニタイズされたサイト名をキーに、その ID を localStorage に記憶します。ブラウザストレージを消去した、ブラウザを変えた、名前を変えた、Netlify でサイトを削除した場合、次のデプロイは古いサイトを見つけられず新規作成します。そのため Netlify プロジェクトの名前変更は、以前のサイトをアカウントに残すことがあります。両プロバイダーともデプロイ履歴、カスタムドメイン、アクセス制御、ロールバックをダッシュボードで管理します。GB Coder のパネルが扱うのはアップロードと公開 URL だけです。ここからのデプロイはすべて本番デプロイで、ブランチプレビューや環境選択はありません。',
          },
          {
            heading: '8. 計画しておきたい上限と失敗',
            body: 'タブの外へリクエストが出る前に 2 つの上限が適用されます。900 ファイルと、非圧縮で 64 MB です。プロバイダー自身の上限より低く設定し、巨大なアップロードがブラウザセッションの途中で失敗しないようにしています。メディアの多いサイトは、大きな画像や動画をプロジェクトバンドルではなく CDN や Git に置くべきです。エラーは原因別に分かれます。401 はトークン拒否、403 は通常アカウントまたはチームへの権限不足、413 または 429 はペイロード過大かレート制限、422 はプロジェクトが無効として拒否されたこと、5xx は通常一時的です。Vercel では、フレームワークのビルド失敗は別です。アップロードは成功し、ビルドが失敗しているので、新しいトークンを貼るのではなくログを読んでください。Vercel のビルドで環境変数が必要な場合も別の境界です。デプロイダイアログに環境変数のエディタはありません。Vercel のプロジェクト設定で値を設定し、再度デプロイします。最初のビルドは、設定先のプロジェクトができる前に失敗することがあります。Netlify の手動 ZIP 経路にはビルド手順がないため、これは当てはまりません。3 分のポーリング上限はデプロイの失敗ではなく、待機の失敗です。',
          },
          {
            heading: '9. 安全性、所有権、データの境界',
            body: 'デプロイ経路は直接です。ブラウザがトークンを使って api.vercel.com または api.netlify.com を呼びます。認証情報を保存するプロキシはなく、パネルの利用に LadeStack アカウントも不要です。トークンは既定でセッションのみで、安全なオリジンで記憶を選んだ場合に限り AES-GCM で封印されます。これはブラウザプロファイルのバックアップやサポートバンドル内で読めるトークンを防ぎますが、タブが開いている間に同じオリジンで動く悪意あるコードは防げません。利用可能な中で最も狭いトークンを使い、有効期限を設定し、作業が終わったらプロバイダーで失効させてください。所有権はトークンに従います。プロジェクトまたはサイトは、それを所有するプロバイダーアカウント内に、その規約、割り当て、ログ、請求のもとで作成されます。GB Coder は local-first のままですが、デプロイはプロジェクトをプロバイダーへ明示的にエクスポートする行為です。プロバイダーはサイトのソースを受け取り、結果は既定で公開 HTTPS URL になります。パスワード保護、SSO、カスタムドメインはプロバイダーの機能です。ブラウザプロファイルがプロジェクトの唯一の保管場所にならないよう、ZIP か GitHub のコピーを残してください。',
          },
          {
            heading: '10. ブラウザからのデプロイが適する場面',
            body: '小さなサイトをすぐ公開したいときにこの経路を使います。ランディングページ、ポートフォリオ、授業のデモ、クライアントレビュー用プロトタイプ、静的なドキュメントページなどです。プロジェクトがすでに GB Coder にあり、代わりに ZIP を書き出してターミナルを開き、自分のものではないマシンで CLI を設定するしかない場合にも向いています。モノレポ、データベース付きのサーバーレンダリングアプリ、プライベートレジストリの認証情報が必要なビルド、ブランチプレビューと承認でリリースするチーム、アップロード上限を超えるアセットには向きません。それらはプロバイダーの Git 連携、CI パイプライン、デスクトップ環境の仕事です。2 つの方法は共存できます。ブラウザで下書きと反復を行い、履歴に値する段階でソースを GitHub に push し、本番ビルドは CI に公開させます。実用的な手順は短いものです。スマートフォン幅でプレビューを確認し、バンドル概要を見て、デプロイし、別の端末で公開 URL を開き、ビルドログを保存します。試すには /app/projects のプロジェクトダッシュボードを開き、プロジェクトを作成または開いて Deploy を選んでください。設定のリファレンスはドキュメントにあります。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coder のドキュメントを読む →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'ブラウザIDEのAPIキーと環境変数を安全に扱う',
        description: 'ブラウザIDEでAPIキーと環境変数を扱う方法。クライアント側への露出、安全な保管、権限の絞り込み、ローテーション、デプロイ、漏えい時の対応を解説します。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['セキュリティ', 'APIキー', '環境変数', 'ブラウザIDE', 'ベストプラクティス'],
        intro: 'どのブラウザIDEも、遅かれ早かれ同じ問いに直面します。キーはどこに置くのか。プロジェクトにはAPIエンドポイントが必要で、AIパネルにはプロバイダーのキーが必要で、デプロイにはアカウントのトークンが必要です。デスクトップ環境なら、これらの値はシェルのプロファイルや追跡されていないファイルに置けます。ブラウザのタブでは境界が異なります。ページと一緒に配信されるものはページから読めますし、ブラウザプロファイルに保存されたものはそのプロファイルに属します。このガイドでは実用的なモデルを整理します。公開してよい値、クライアントに決して届けてはいけない値、GB Coderがプロバイダーの資格情報をどう扱うか、そしてキーが漏えいしたときの対処です。ブラウザのタブを秘密の金庫だと思い込まず、ブラウザIDEの利便性を享受したい人に向けています。',
        sections: [
          {
            heading: '1. ブラウザのタブは公開されたビルド対象',
            body: '最初のルールは不愉快ですが単純です。静的Webアプリは秘密を保持できません。ブラウザはHTML、CSS、JavaScriptをダウンロードし、ユーザーのマシンで実行します。誰でもDevToolsを開き、ネットワークパネルを読み、バンドルを検索し、ブレークポイントを設定して変数を検査できます。コードを難読化したり、チャンクに分割したり、設定ファイルに値を隠したりしても、変わるのは手間だけで結果は変わりません。ブラウザIDEはプロジェクトコードを実行するサンドボックスを追加しますが、IDE自体のUIは同じオリジンで動き、必要な値を読まなければなりません。サンドボックスは、UIが使う値の金庫ではありません。有用な判定は単純です。タブで動くコードから参照できる値は、タブを使う人にも読めると考えてください。同じオリジンで動くスクリプトにも読めると考えてください。これはブラウザ開発を危険にする話ではありません。境界を定義する話です。公開識別子は置けますが、サーバーの資格情報は置けません。',
          },
          {
            heading: '2. 静的アプリにおける環境変数の意味',
            body: 'Node.jsサーバーでは、環境変数は実行時にプロセスから読み取ります。Vite、Create React App、Next.js、Astroのビルドでは、公開環境変数の扱いが異なります。バンドラーがビルド時に参照をリテラル文字列へ置き換えるのです。ViteはVITE_接頭辞の変数をimport.meta.env経由で公開し、Create React AppはREACT_APP_、Next.jsはNEXT_PUBLIC_、AstroはPUBLIC_を使います。接頭辞は命名規則であり、セキュリティ制御ではありません。値がインライン化された時点で、それはすべての訪問者がダウンロードするJavaScriptの一部になります。公開接頭辞のない変数は通常クライアントコードから利用できないため、サーバー専用の値は静的ページではなく、サーバーまたはサーバーレス関数で読む必要があります。.envファイルは開発とビルドの入力であり、実行時の秘密保管庫ではありません。ローカル設定やバージョン管理外での値の維持には役立ちますが、ビルド後に値を非公開にはしません。',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. ブラウザに置いてよいキー',
            body: '公開されることを前提としたキーもあります。Stripeの公開可能キーはアカウントを識別し、支払いトークンを作成します。秘密キーは実際に資金を動かすため、サーバーに置かなければなりません。Supabaseのanonキーは、行レベルセキュリティのポリシーが正しい場合にのみ安全です。FirebaseのWeb設定はプロジェクトを識別しますが、管理者アクセスを付与するものではありません。地図や分析のキーは、多くの場合ドメインやAPIで制限されます。これらの値はブラウザに配信できますが、許可オリジン、API制限、最小権限のロール、クォータ、アラートといった制限は必要です。反対のカテゴリはもっと簡単です。サービスロールキー、データベースのパスワード、SMTP資格情報、署名秘密、AIプロバイダーの秘密キーは、静的バンドルに入れてはいけません。アプリケーション自身のプロバイダーキーは特に危険です。見つけた人がアプリケーションの資金を使えます。ユーザー自身のキーは別の話です。Bearer資格情報であることに変わりはありませんが、持ち主はユーザーであり、目的はプロジェクトやリポジトリではなく、そのユーザーのブラウザに置くことです。',
          },
          {
            heading: '4. GB Coderがプロバイダー資格情報を扱う方法',
            body: 'GB CoderのAIパネルはbring-your-own-key方式です。キーマネージャーは既定でプロバイダーキーをメモリに保持します。localStorageには書き込みません。ユーザーが明示的に選んだ場合だけsessionStorageに保存し、その場合は現在のタブに限定され、通常はタブを閉じると消えます。ユーザーがキーを消去すると、メモリとセッションストレージから削除されます。マネージャーは各キーを許可されたエンドポイントのオリジンに結び付け、送信ゲートが、承認されていない宛先に資格情報が送られないか確認します。プロバイダーのエラーは秘匿化レイヤーを通り、メッセージがUIやログに届く前にキーのパターンと有効なキーを除去します。カスタムプロバイダーのメタデータはlocalStorageに保存されますが、秘密としてマークされたヘッダーは保存前に消去され、再入力が必要です。リクエストはブラウザからプロバイダーのエンドポイントへ直接送られ、GB CoderがLadeStackのサーバー経由でキーを中継することはありません。これらの対策は、偶発的な保存とオリジン間の漏えいを減らします。ただし基本ルールは変わりません。同じオリジンで動けるスクリプトは、ページが読めるものを読めます。機密作業にはクリーンなプロファイルを使い、信頼できない拡張機能を入れないでください。',
          },
          {
            heading: '5. プロジェクトの秘密、.envファイル、ビルド時のインライン化',
            body: '秘密はプロジェクトツリーの外に置きます。.envとそのローカル変種を.gitignoreに追加し、プレースホルダー名だけの.env.exampleをコミットします。Viteを使うプロジェクトでは、VITE_変数がすべて本番バンドルにインライン化されることを忘れないでください。ローカル開発で便利だった値も、本番ビルドで使われた瞬間に公開されます。デプロイ前に生成されたアセットをキーのパターンで検査し、見つかったら警告ではなくインシデントとして扱います。GitHubのシークレットスキャンとプッシュ保護は既知のトークン形式をいくつか検出できますが、あくまで最後の網であり、値をリポジトリの外に保つ代わりにはなりません。ブラウザIDEのZIPエクスポートにはプロジェクトファイルが含まれます。.envがプロジェクト内にあれば、バックアップと一緒に移動します。バックアップは暗号化された金庫ではありません。エクスポートは非公開の場所に保存し、不要になった古いコピーは削除してください。スクリーンショット、Issue、チャットメッセージも同じです。そこに貼られたキーは、すでにブラウザの外に出ています。',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. GitHubトークンとデプロイトークン',
            body: 'GitHubの個人アクセストークンとデプロイトークンは、見た目より強力です。repositoryとworkflowのスコープを持つクラシックトークンは、非公開コードを読み、ファイルを変更し、リリースを起動できます。単一リポジトリ、明示的な権限リスト、有効期限を持つfine-grainedトークンを優先してください。トークンにはタスクに必要な権限だけを与えます。同期ならcontentsの読み書きだけで、administrationやbillingは不要です。デバイスや用途ごとに別のトークンを作り、作業が終わったら失効させます。VercelやNetlifyのデプロイトークンは、プロジェクトの公開、置換、削除ができます。プロバイダーがプロジェクト単位やチーム単位のスコープに対応しているなら使い、有効期限に対応しているなら設定してください。トークンは必要なときだけデプロイパネルに貼り、プロジェクトファイルには保存しないでください。CIではコミットされた.envではなく、リポジトリや組織のシークレットを使います。フォークからのpull requestには通常シークレットが渡らないことも覚えておきましょう。スクリーンショットに写した、チャットで共有した、公開リポジトリにコミットしたトークンは、1秒後に削除したとしても侵害されたものとして扱います。',
          },
          {
            heading: '7. AIプロバイダーキー：BYOKを予想外の事態なく使う',
            body: 'AIプロバイダーのキーは、請求書が付いたBearer資格情報です。持っている人は誰でもリクエストを送り、クォータを消費し、料金を発生させられます。プロジェクト単位に制限されたキーを使い、プロバイダーが提供するなら支出上限を設定し、組織のマスターキーではなく実験用の別キーを使ってください。特にデバイスを共有した後や新しい拡張機能を入れた後は、使用量を定期的に確認します。Ollama、LM Studio、vLLMなどのローカルプロバイダーはクラウドキーを必要としませんが、エンドポイントはマシン上のサービスです。デモを動かすためだけにローカルエンドポイントをインターネットへ公開しないでください。カスタムプロバイダーがプロキシを指す場合、プロキシはキーを見られます。自分が管理し、理解しているプロキシだけを使ってください。プロンプトインジェクションも関連するリスクです。ファイル、Webページ、貼り付けたエラーメッセージには、アシスタントに向けた指示が含まれている可能性があります。秘密はプロンプトの外に置き、アシスタントに読ませるファイルにも入れないでください。会話にキーが現れたら、ローテーションしてください。',
          },
          {
            heading: '8. 共有コンピューター、拡張機能、XSS',
            body: '共有されたコンピューターやラボのマシンには、別の手順が必要です。プライベートなブラウザプロファイルを使い、セッションへの保存を選ばず、終わったらタブを閉じます。ブラウザがキーの保存を提案したら断ります。残っている疑いがあれば、サイトのストレージを消去します。ブラウザ拡張機能も境界の一部です。広いホスト権限を持つ拡張機能は、ページの内容やストレージを読めることが多く、インストール後に悪意ある更新が届く可能性もあります。資格情報を扱う作業には最小限のプロファイルを使ってください。この文脈での典型的なWebリスクはクロスサイトスクリプティングです。攻撃者がIDEのオリジンでスクリプトを実行できれば、そのスクリプトはlocalStorageとsessionStorageを読み、ページが開いている間にリクエストを送れます。依存関係を最新に保ち、信頼できない第三者スクリプトを避け、デプロイしたサイトでContent Security Policyの導入を検討してください。クリップボードマネージャーや画面共有ツールも、コピーして表示するものを見ています。キーを移動した後にクリップボードを消去し、プロバイダー設定パネルを開く前に共有を一時停止してください。',
          },
          {
            heading: '9. 漏えいしたキーのローテーション',
            body: '漏えいしたキーへの信頼できる対応はローテーションだけです。先に失効させることが重要です。新しいキーを準備している間も古いキーが有効なら、露出は続きます。新しいキーは必要最小限のスコープで作り、アプリケーションやブラウザの設定を更新し、値がビルドに含まれていたなら再デプロイし、古いキーが拒否されることを確認します。次に、プロバイダーの使用量と監査ログで、予期しない活動がないか確認します。Gitにコミットしたキーは、ファイルを削除するだけでは不十分です。値は履歴に残ります。先にローテーションし、git filter-repoやBFGなどのツールで履歴を書き換え、チームの合意を得てforce-pushし、共同作業者に再クローンを依頼します。ホスティングプラットフォームは古いビルドをキャッシュすることがあるため、古い値が古いバンドルから配信されないようにしてください。AIチャット、サポートチケット、スクリーンショットにキーを貼った場合は、保持されたものとしてローテーションします。最後に、何が起きたかを記録し、それを検出できたはずのチェックを追加し、次のキーの寿命を短くします。',
          },
          {
            heading: '10. 実践的なチェックリスト',
            body: 'プロジェクトがブラウザを離れる前に、この順序を使ってください。第一に、各値を分類します。公開識別子、ユーザー資格情報、サーバー秘密のどれかです。第二に、サーバー秘密を静的バンドルの外に置き、サーバーレス関数やAPIの背後に移します。第三に、公開接頭辞が必要な値だけを公開し、デプロイ前にビルド済みアセットを検査します。第四に、.envファイルをGitの外に置き、.env.exampleをコミットし、シークレットスキャンを有効にします。第五に、GitHubとホスティング用に、用途ごとのスコープ付きで有効期限のあるトークンを作ります。第六に、GB Coderでは信頼できるデバイスでない限りキーをメモリに置き、トレードオフを理解したときだけセッションへの保存を選びます。第七に、キーをプロンプト、Issue、スクリーンショット、プロジェクトファイルに決して貼らないでください。第八に、少しでも疑わしければローテーションし、交換前に失効させます。第九に、共有マシンではクリーンなブラウザプロファイルを使います。第十に、必要になる前に漏えい時の計画を書いておきます。ブラウザを私的な金庫ではなく公開クライアントとして扱えば、ブラウザIDEでも資格情報を責任を持って管理できます。',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: '브라우저 IDE vs 데스크톱 IDE, 무엇을 선택할까?',
        description: '브라우저 IDE와 데스크톱 IDE를 설치, 성능, 확장 기능, 디버깅, Git, 오프라인, 보안, 비용 측면에서 실무적으로 비교하고, 상황별 선택 기준과 병행 방법을 정리합니다.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['브라우저 IDE', '데스크톱 IDE', '개발 도구', '웹 개발', '비교'],
        intro: '데스크톱 IDE는 너무 오랫동안 기본값이어서 많은 개발자가 의문조차 품지 않습니다. 에디터를 설치하고, 확장을 추가하고, 런타임을 설정하고, 저장소를 복제한 뒤에야 첫 줄을 씁니다. 브라우저 IDE는 순서를 바꿉니다. 탭을 열고 프로젝트를 만든 뒤 환경이 갖춰지기를 기다리지 않고 바로 입력을 시작합니다. 어느 한쪽이 완전히 이기는 구도는 아닙니다. 브라우저 IDE는 설치를 없애고 작업을 어디로든 옮길 수 있게 하지만 브라우저 샌드박스의 한계를 물려받습니다. 데스크톱 IDE는 설치와 디스크 공간을 요구하지만 네이티브 툴체인, 확장 기능, 로컬 하드웨어에 접근할 수 있습니다. 이 글은 실제로 선택을 바꾸는 기준을 비교하며, 브라우저 쪽 예시로 GB Coder를 사용합니다. 두 모드가 양극단을 모두 다루기 때문입니다.',
        sections: [
          {
            heading: '1. 브라우저 IDE란 무엇인가',
            body: '브라우저 IDE는 웹 페이지 안에서 실행되며 데스크톱 설치 없이 프로젝트를 열거나 저장하는 에디터입니다. 이 범주에는 성격이 다른 두 제품이 있습니다. 첫째는 정적 작업대입니다. HTML, CSS, JavaScript 패널과 라이브 미리보기가 있고 패키지 관리자는 없습니다. 둘째는 완전한 실행 환경입니다. WebContainer 같은 WebAssembly 기반 시스템이 Node.js, npm, 개발 서버를 탭 안에서 실행합니다. GB Coder는 둘 다 제공합니다. 의존성이 없는 작업을 위한 Static Editor와 React, Vue, 일반 npm 프로젝트를 위한 Advanced IDE입니다. 이 구분은 이어지는 모든 비교에서 중요합니다. 정적 에디터는 메모장과 비교 대상이고, 완전한 브라우저 IDE는 가벼운 데스크톱 환경과 비교 대상입니다. 모든 브라우저 IDE를 정적 버전으로 평가하는 것은 데스크톱 IDE를 구문 강조가 있는 텍스트 편집기로 평가하는 것과 같습니다.',
          },
          {
            heading: '2. 데스크톱 IDE가 여전히 강한 영역',
            body: '크고 오래 유지되는 시스템에서는 데스크톱 IDE가 여전히 더 강합니다. 네이티브 컴파일러, 모바일 에뮬레이터, 데이터베이스 클라이언트, Docker, 모노레포 전체를 분석하는 언어 서버를 실행할 수 있습니다. 확장 마켓플레이스에는 브라우저에 대응물이 없는 디버거, 프레임워크 도구, 린터, 통합 기능이 있습니다. 로컬 파일은 저장소 할당량의 영향을 받지 않고, RAM이 충분한 기기는 거대한 의존성 트리와 여러 서비스를 동시에 유지합니다. 오프라인 작업은 예외가 아니라 일상이며, 원격 개발 확장을 쓰면 가벼운 노트북으로 강력한 서버를 제어할 수 있습니다. 이 중 어느 것도 구식이 아닙니다. 일상 업무에 네이티브 SDK, 여러 서비스로 구성된 백엔드, 수백 개 패키지의 저장소가 포함된다면 데스크톱 IDE는 향수적 습관이 아니라 업무에 맞는 도구입니다.',
          },
          {
            heading: '3. 설치 시간과 첫 미리보기까지',
            body: '가장 분명한 차이는 코드가 생기기 전에 나타납니다. 데스크톱 환경은 보통 에디터, 런타임, 패키지 관리자, 확장, 프로젝트 의존성을 설치한 뒤 첫 빌드를 기다립니다. 새 기기에서는 반나절이 걸릴 수 있습니다. 브라우저 IDE는 이 순서를 압축합니다. 사이트를 열고 템플릿이나 빈 프로젝트를 고르면 첫 미리보기가 즉시 나타납니다. GB Coder는 작업 공간을 IndexedDB에 만들기 때문에 계정, 다운로드, 서버 왕복이 없습니다. 다만 앱 자체는 로드되어야 하고, 고급 런타임은 SharedArrayBuffer와 교차 출처 격리를 지원하는 최신 브라우저가 필요합니다. 교실, 빌린 노트북, 크롬북, 빠른 고객 데모에서는 이 차이가 결정적입니다. 이미 잘 세팅된 워크스테이션을 가진 개발자에게는 설치 비용이 한 번만 치러지므로 부담이 덜합니다.',
          },
          {
            heading: '4. 성능, 메모리, 런타임 한계',
            body: '데스크톱 IDE는 CPU와 RAM을 직접 사용합니다. 브라우저 IDE는 탭 안에서 실행되고, 그 탭은 자체 메모리 상한을 가진 관리형 샌드박스입니다. 상한은 일반적인 Vite 앱에는 넉넉하지만 무한하지 않습니다. 아주 큰 의존성 트리를 설치하거나 여러 워처를 돌리거나 거대한 모노레포를 빌드하면 탭이 고갈되거나 새로고침이 발생할 수 있습니다. WebContainer는 네이티브 바이너리, Docker 이미지, 호스트 OS용으로 컴파일된 도구도 실행할 수 없습니다. 따라서 정직한 비교는 작업량에 따라 달라집니다. 랜딩 페이지, 대시보드, 컴포넌트 라이브러리, 작은 풀스택 프로토타입이라면 브라우저 IDE는 로컬 개발과 구분이 안 될 정도입니다. 데이터베이스 엔진, Python 서비스, 네이티브 모듈이 필요한 프로젝트에서는 데스크톱이 여전히 실용적인 환경입니다. 배터리도 같은 패턴입니다. 탭은 완전한 IDE와 열몇 개의 백그라운드 서비스보다 가볍지만, 긴 WebContainer 세션은 여전히 전력을 씁니다.',
          },
          {
            heading: '5. 에디터 지능과 확장 기능',
            body: '에디터 품질은 더 이상 브라우저의 약점이 아닙니다. GB Coder는 VS Code를 구동하는 오픈소스 엔진과 같은 Monaco를 사용하므로 자동 완성, 인라인 문서, 구문 검증, 괄호 매칭, 다중 커서 편집, 설정 가능한 키 바인딩을 갖추고 있습니다. TypeScript, JavaScript, HTML, CSS, JSON에는 언어 서비스가 적용되고, diff 뷰어로 변경 사항을 적용 전에 검토할 수 있습니다. 브라우저 IDE에 없는 것은 확장 생태계입니다. 특수 언어 플러그인, 프레임워크 인스펙터, 맞춤 디버거를 위한 마켓플레이스가 없습니다. 일부는 기본 제공되고 일부는 작은 프로젝트에 불필요하지만, 특정 확장에 의존하는 개발자는 빈틈을 느낍니다. 대신 유지보수 부담이 적습니다. 브라우저 에디터는 이미 설정된 상태로 도착하고, 데스크톱 에디터는 누군가 잘 가꿔야 강해집니다.',
          },
          {
            heading: '6. 터미널, 패키지, 빌드 파이프라인',
            body: '터미널은 진짜 브라우저 IDE와 온라인 코드 놀이터를 가르는 기능입니다. GB Coder의 Advanced IDE에서 WebContainer는 Node.js 런타임을 제공하고, npm install은 실제 패키지를 해석하며, npx 스크립트가 실행되고, Vite 서버가 미리보기로 전달되는 포트에서 시작됩니다. 터미널은 ANSI 출력과 명령 기록을 갖춘 xterm.js 셸이지 로그를 흉내 내는 패널이 아닙니다. 이것으로 일반적인 프런트엔드 파이프라인인 설치, 개발, 빌드, 테스트를 평범한 JavaScript 도구로 처리할 수 있습니다. 네이티브 애드온, Docker Compose, 운영 데이터베이스는 다루지 않습니다. 데스크톱 IDE는 프런트엔드가 통신하는 서비스를 포함해 스택 전체를 실행할 수 있습니다. 실용적인 규칙은 간단합니다. 툴체인이 처음부터 끝까지 JavaScript라면 브라우저에서도 대체로 돌아가고, 네이티브 코드나 컨테이너로 넘어가면 데스크톱이 더 안전합니다.',
          },
          {
            heading: '7. 디버깅: 브라우저 맥락과 네이티브 도구',
            body: '브라우저 IDE에는 저평가된 디버깅 장점이 있습니다. 코드, 미리보기, 브라우저 개발자 도구가 같은 맥락에 있다는 점입니다. CSS 변경은 즉시 보이고, 가상 콘솔은 미리보기 옆에서 로그를 모으며, QR 코드로 실제 휴대폰에서 페이지를 열면 터치와 뷰포트 문제가 드러납니다. GB Coder는 뷰포트 프리셋과 보조 모니터용 분리 미리보기도 제공합니다. 데스크톱 IDE는 깊이에서 이깁니다. Node 프로세스에 디버거를 붙이고, 서비스 전반에 중단점을 설정하고, 메모리와 CPU를 프로파일링하고, 네이티브 스레드를 검사하고, 모바일 에뮬레이터와 연동합니다. 시각적 프런트엔드 작업에서는 브라우저 루프가 짧고, 서버 프로세스의 미묘한 경쟁 조건에서는 데스크톱 디버거가 더 나은 도구입니다. 대부분의 개발자는 두 가지 피드백이 모두 필요하며, 그래서 뒤에 나오는 하이브리드 워크플로가 중요합니다.',
          },
          {
            heading: '8. 파일, 버전 관리, 백업',
            body: '저장 방식은 브라우저와 데스크톱 모델이 가장 크게 갈리는 지점입니다. 데스크톱 프로젝트는 어떤 도구든 읽을 수 있는 폴더에 있습니다. 브라우저 프로젝트는 IndexedDB에 있으며 빠르고 사적이지만 브라우저 프로필에 묶이고 저장소 정리에 취약합니다. GB Coder는 이름 있는 스냅샷, diff 뷰어, 무결성 해시가 포함된 ZIP 내보내기, 구조 미리보기가 있는 가져오기로 이를 보완합니다. GitHub 동기화는 개인 액세스 토큰을 사용하고, 푸시를 하나의 원자적 커밋으로 묶고, 변경되지 않은 파일을 건너뛰며, 원격 브랜치가 움직였으면 충돌로 보고합니다. 데스크톱 Git은 더 완전합니다. 훅, 서브모듈, 리베이스 워크플로, 여러 원격, 모든 CI가 이해하는 CLI가 있습니다. 브라우저 워크플로는 작은 프로젝트에 충분하고 1인 개발자에게는 놀랍도록 강력하지만, 복잡한 저장소에서 완전한 Git 클라이언트를 대체하지는 못합니다. GitHub나 ZIP으로 내보내는 것이 둘 사이의 다리입니다.',
          },
          {
            heading: '9. 보안, 개인정보, 비용',
            body: '브라우저 IDE는 위험과 편의를 같은 곳에 모읍니다. GB Coder는 로컬 우선입니다. 프로젝트는 브라우저에 저장되고 계정이 필요 없으며, 제품은 무료이고 광고도 없습니다. 데이터는 AI 공급자, GitHub 동기화, 배포, 프로젝트가 참조하는 CDN처럼 연결된 기능을 사용할 때만 기기를 떠납니다. AI는 bring-your-own-key 방식이며, 프롬프트와 선택한 코드는 설정한 공급자에게 전송됩니다. GitHub와 Vercel 또는 Netlify 배포는 사용자의 토큰을 쓰고, 암호화 저장을 선택하지 않는 한 토큰은 세션 동안만 유지됩니다. 이 모델은 개발자에게 통제권을 주지만, 백업이 없으면 브라우저 저장소가 유일한 사본이 된다는 뜻이기도 합니다. 데스크톱 IDE는 파일을 디스크에 두고 보통 운영체제의 백업과 권한 모델을 따릅니다. 어느 쪽이 자동으로 더 안전한 것은 아니며, 누가 데이터를 보유하고 기기나 프로필이 사라질 때 무슨 일이 생기는지가 문제입니다.',
          },
          {
            heading: '10. 선택 기준과 결합 방법',
            body: '브라우저 IDE는 작업이 시각적이고 짧으며 이동이 필요할 때 선택합니다. HTML과 CSS 학습, 인터페이스 프로토타이핑, 수업, 크롬북에서 디자인 리뷰, 툴체인 설치 없이 작은 React나 Vue 앱 만들기입니다. 데스크톱 IDE는 작업이 오래가고 시스템이 무거울 때 선택합니다. 모노레포, 네이티브 SDK, Docker, 모바일 빌드, 큰 확장 스택, 폐쇄망에서의 오프라인 개발입니다. 더 흥미로운 답은 둘을 결합하는 것입니다. 첫 미리보기가 즉시 나오므로 브라우저에서 시작합니다. 휴대폰 너비에서 레이아웃을 확인합니다. 스냅샷을 찍습니다. GitHub에 푸시하거나 ZIP으로 내보냅니다. 네이티브 도구, 더 깊은 디버거, 완전한 Git 워크플로가 필요해지면 같은 저장소를 데스크톱에서 엽니다. 파일이 표준이므로 인계는 마이그레이션이 아니라 평범한 버전 관리입니다. GB Coder는 주기의 전반부를 위해 설계되었고 프로젝트를 브라우저에 가두지 않습니다. 결정의 브라우저 쪽을 시험하려면 프로젝트 대시보드를 열고 빈 작업 공간을 만들어 보세요. 1분이면 비교가 구체적으로 느껴집니다.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coder 전체 문서 읽기 →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: '브라우저 IDE에서 GitHub 동기화 활용하기',
        description: '브라우저 IDE의 GitHub 동기화 방법. 토큰, 원자적 커밋, 풀, 충돌, 파일 제한, 보안, 적합한 사용 사례를 정리합니다.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', '버전 관리', '브라우저 IDE', 'Git', '개발 워크플로'],
        intro: '브라우저 IDE는 설치를 없애는 데 능숙합니다. 하지만 그다음 단계, 즉 작업을 브라우저 프로필 밖의 영속적인 공간에 두는 일에는 그만큼 능숙하지 않습니다. 보통 여기서 터미널이 등장합니다. git init, remote add, commit, push. 브라우저 IDE의 GitHub 동기화는 이 순서를 하나의 패널로 압축하지만, 마법도 아니고 완전한 Git 클라이언트도 아닙니다. 브라우저 저장소에 있는 프로젝트와 GitHub에 있는 저장소를 잇는 집중형 다리입니다. 이 글에서는 GB Coder에서 그 다리가 어떻게 작동하는지, 무엇을 업로드하는지, 충돌과 토큰을 어떻게 처리하는지, 그리고 데스크톱 Git 워크플로가 여전히 더 나은 경우를 설명합니다.',
        sections: [
          {
            heading: '1. 브라우저 IDE에 GitHub가 필요한 이유',
            body: '브라우저 프로젝트가 편리한 이유는 폴더도 런타임도 설치도 필요 없기 때문입니다. 바로 그 성질이 약점이 됩니다. 프로젝트는 브라우저 프로필에 살고, 정리 도구에 의해 지워지거나 기기와 함께 사라지거나 다른 컴퓨터로 옮길 때 남겨질 수 있습니다. ZIP으로 내보내면 사본은 생기지만, ZIP은 이력도 공유 리모트도 없는 스냅샷입니다. GitHub는 빠진 계층을 제공합니다. 기기 밖 저장소, 커밋 이력, 협업 공간, 그리고 CI나 배포의 자연스러운 소스입니다. 이로써 브라우저 IDE의 역할이 바뀝니다. 일회용 메모장이 아니라 작은 프로젝트를 작성하고 검토하고 인계하는 장소가 될 수 있습니다. 이 흐름은 Chromebook, 학교 실습실, Git 설치가 불가능한 잠긴 회사 노트북에서 특히 유용합니다. 나중에 데스크톱 저장소로 옮길 빠른 프로토타입에도 잘 맞습니다. 첫 초안은 브라우저가 맡고, GitHub가 지속성을 부여합니다.',
          },
          {
            heading: '2. 동기화가 하는 일과 하지 않는 일',
            body: 'GB Coder는 Push, New repo, Pull 세 가지 GitHub 작업을 제공합니다. Push는 현재 프로젝트를 기존 저장소와 브랜치에 씁니다. New repo는 연결된 GitHub 계정에 저장소를 만들고 프로젝트를 첫 내용으로 커밋합니다. Pull은 브랜치를 읽어 텍스트 파일을 편집기로 가져옵니다. 모든 요청은 브라우저에서 api.github.com으로 직접 전송되며, LadeStack 서버가 중간에서 토큰을 보관하지 않습니다. 이 좁은 범위는 의도적입니다. 이 패널은 Git 명령줄을 대체하지 않습니다. rebase, 병합 충돌 해결, 서브모듈, Git LFS, 서명된 커밋, 훅, 여러 리모트를 제공하지 않습니다. 전체 커밋 그래프도 보여주지 않습니다. 복잡한 저장소에서는 이런 제한이 중요합니다. 정적 페이지, React 프로토타입, 수업 예제, 작은 유틸리티 같은 일반적인 브라우저 프로젝트에서는 세 작업이 탭 밖에서 실제로 필요한 부분을 다룹니다.',
          },
          {
            heading: '3. 올바른 범위의 토큰 만들기',
            body: 'GitHub 동기화는 비밀번호나 GB Coder 계정이 아니라 개인 액세스 토큰을 사용합니다. 클래식 토큰에는 repo 스코프가 필요합니다. fine-grained 토큰에는 Contents 읽기 및 쓰기 권한이 필요하며, 단일 저장소로 제한할 수 있습니다. 더 좁은 옵션이 더 나은 기본값입니다. 토큰이 유출되어도 피해가 접근 가능한 프로젝트로 제한되기 때문입니다. 연결 화면은 GitHub 토큰 페이지로 연결하고 두 선택지를 설명합니다. 토큰을 붙여 넣고 기기에 기억할지 선택한 뒤 Connect를 누릅니다. GB Coder는 계정과 저장소 목록을 가져와 검증하고, 로그인한 사용자와 남은 API 레이트 리밋을 표시합니다. Push나 저장소 생성을 확인하기 전까지 저장소에는 아무것도 기록되지 않습니다. 토큰은 비밀번호처럼 다루십시오. 이슈, 채팅, 스크린샷에 붙여 넣지 말고, 필요 없어지면 GitHub에서 폐기하십시오. 만료일이 있고 하나의 저장소에만 접근하는 토큰은 이 흐름에 합리적인 절충입니다.',
          },
          {
            heading: '4. 첫 Push에서 실제로 전송되는 것',
            body: 'Push 탭은 저장소, 브랜치, 커밋 메시지, 그리고 프로젝트에 없는 파일을 삭제할지 여부를 묻습니다. 무언가 브라우저를 떠나기 전에 패널은 파일 수와 전체 크기를 보여줍니다. 업로드가 편집기 탭을 그대로 덤프하는 것이 아니므로 이 미리보기가 유용합니다. GB Coder는 ZIP 내보내기와 배포에 쓰는 것과 같은 아카이브 빌더를 사용합니다. 단순한 HTML/CSS/JavaScript 프로젝트는 index.html, style.css, script.js, README가 됩니다. React 또는 Vue 프로젝트는 index.html, package.json, vite.config.js, .gitignore, README, src/ 아래의 소스 파일로 구성된 Vite 형태 저장소가 됩니다. 의존성 폴더와 빌드 출력은 포함되지 않습니다. 커밋 메시지는 편집할 수 있고 기본값은 \'Update from GB Coder\'입니다. 없는 파일 삭제 옵션은 기본적으로 꺼져 있습니다. 저장소가 현재 프로젝트와 정확히 일치해야 할 때만 켜십시오. 로컬에 더 이상 없는 원격 파일을 삭제하기 때문입니다. 첫 Push에서는 의도적으로 별도 브랜치를 원하지 않는 한 저장소의 기본 브랜치를 선택하십시오.',
          },
          {
            heading: '5. 원자적 커밋과 변경 없는 파일 건너뛰기',
            body: '순진한 브라우저 동기화는 파일을 하나씩 커밋합니다. 그러면 이력이 지저분해지고, 중간에 요청이 실패하면 저장소가 절반만 업데이트된 상태로 남습니다. GB Coder는 대신 GitHub의 Git Data API를 사용합니다. blob을 업로드하고, 브랜치의 현재 트리 위에 트리를 만들고, 하나의 커밋을 생성한 뒤 브랜치 참조를 이동합니다. 그 결과 Push마다 하나의 원자적 커밋이 생기며, 삭제 옵션으로 요청한 삭제도 포함됩니다. 두 번째 최적화는 더 조용하지만 똑같이 중요합니다. Git은 파일 내용을 SHA-1 해시로 식별하고, 브라우저는 WebCrypto로 그 해시를 로컬에서 계산할 수 있습니다. GB Coder는 업로드 전에 로컬 파일과 대상 트리를 비교합니다. 변경되지 않은 파일은 API 호출을 소비하지 않고, 아무것도 바뀌지 않은 Push는 빈 커밋을 만들지 않고 \'already up to date\'를 반환합니다. 이렇게 하면 이력이 읽기 쉬워지고 API 예산을 실제 변경에 쓸 수 있습니다. 작은 프로젝트에서는 차이가 보이지 않지만, 수십 개 파일이 있는 프로젝트에서는 깔끔한 동기화와 느리고 시끄러운 동기화의 차이가 됩니다.',
          },
          {
            heading: '6. 브라우저를 떠나지 않고 저장소 만들기',
            body: 'New repo 탭은 연결된 계정에 저장소를 만듭니다. 이름과 선택적 설명을 입력하고 공개 또는 비공개를 고르며, GitHub가 README로 저장소를 초기화할지 결정합니다. 빈 저장소에는 첫 Push가 기반으로 삼을 브랜치 헤드가 없기 때문에 초기화는 기본적으로 켜져 있습니다. GB Coder는 그 시드 커밋을 사용해 README를 프로젝트 파일로 바꾸고 첫 커밋을 기록합니다. 초기화를 끄면 루트 커밋과 기본 브랜치 참조를 직접 만듭니다. 생성 후 새 저장소와 기본 브랜치가 다음 Push를 위해 선택되므로 두 번째 설정 단계가 없습니다. 아이디어에서 비공개 버전 관리 저장소로 가는 가장 짧은 경로입니다. 수업 과제, 비공개로 유지해야 하는 고객 데모, CI 서비스용 URL이 필요한 프로토타입에 유용합니다. 저장소는 토큰을 소유한 GitHub 계정에 속하며 LadeStack의 것이 아닙니다. 이후 GitHub에서 관리, 이전, 삭제할 수 있습니다.',
          },
          {
            heading: '7. 저장소를 편집기로 다시 가져오기',
            body: 'Pull은 돌아오는 여정입니다. 저장소 URL 또는 owner/name 쌍을 입력하고 브랜치를 선택하면 GB Coder가 브랜치 트리를 읽습니다. 편집기에서 의미 있게 열 수 있는 텍스트 파일, 즉 소스 코드, JSON, Markdown, 설정, SVG 등을 가져옵니다. node_modules, dist, build, .git, .next, coverage 디렉터리는 건너뜁니다. 또한 Pull은 200개 파일, 파일당 512KB로 제한됩니다. 브랜치가 둘 중 하나를 넘으면 패널은 조용히 버리지 않고 몇 개 파일이 제외되었는지 알려줍니다. 줄바꿈은 정규화되어 Windows에서 만든 파일이 모든 줄이 바뀐 것처럼 보이지 않습니다. 가져온 파일이 프로젝트를 즉시 덮어쓰지는 않습니다. ZIP 가져오기와 같은 검토 및 적용 흐름을 거치므로 변경을 확정하기 전에 감지된 구조를 확인하고 나중에 되돌릴 수 있습니다. 따라서 Pull은 다른 기기에서 작업을 이어가거나, 편집 전에 저장소를 살펴보거나, 브라우저 저장소가 지워진 뒤 프로젝트를 복구하는 데 좋습니다. 이는 가져오기이지 병합이 아닙니다. 현재 프로젝트와 브랜치가 갈라졌다면 결과를 신중히 검토하십시오.',
          },
          {
            heading: '8. 충돌, 레이트 리밋, 솔직한 실패 방식',
            body: '가장 중요한 안전 속성은 편집 중에 원격 브랜치가 움직일 때 일어나는 일입니다. GB Coder는 브랜치 참조를 force 비활성화 상태로 업데이트합니다. 그 사이 다른 사람이 Push했다면 GitHub는 업데이트를 거부하고, 패널은 그 작업을 조용히 버리지 않고 충돌을 보고합니다. 해결은 의도적으로 수동입니다. 최신 브랜치를 프로젝트로 Pull해 파일을 검토한 뒤 다시 Push하거나, 실제 병합을 위해 데스크톱 Git 클라이언트로 이동합니다. 다른 실패는 메시지에 따라 행동할 수 있도록 분리됩니다. 만료된 토큰은 인증 오류와 재연결 요청을 냅니다. 레이트 리밋은 GitHub 할당량이 언제 초기화되는지 보여줍니다. API는 인증된 사용자에게 시간당 5,000회 요청을 허용하며, Pull은 파일당 한 번의 요청을 사용합니다. 없는 저장소나 브랜치는 not-found 오류가 됩니다. 요청은 60초 후 타임아웃되고 긴 작업은 패널에서 취소할 수 있습니다. 이런 세부 사항은 화려하지 않지만, 신뢰할 수 있는 동기화 도구와 모호하게 실패하는 도구의 차이입니다.',
          },
          {
            heading: '9. 토큰 보안: 기본은 세션에만 보관',
            body: '토큰은 가치가 높은 자격 증명입니다. 쓰기 권한이 있는 GitHub 토큰은 접근 가능한 모든 저장소를 변경할 수 있습니다. GB Coder는 붙여 넣은 토큰을 기본적으로 모듈 스코프 맵에 보관합니다. 즉 탭을 닫으면 사라지고 localStorage에 기록되지 않습니다. \'Remember on this device\' 옵션은 명시적 옵트인입니다. 이를 켜고 페이지가 보안 컨텍스트이면 토큰은 저장 전에 설치별 무작위 키로 AES-GCM 봉인됩니다. 이는 브라우저 프로필 백업, 동기화된 프로필, 공유 기기, 개발자 도구 스크린샷, 지원 번들에서 토큰이 읽히는 것을 막습니다. 같은 오리진에서 실행되는 스크립트는 막지 못합니다. 그 스크립트가 같은 저장 모듈을 호출할 수 있기 때문입니다. 브라우저 전용 설계로는 완전히 해결할 수 없습니다. 따라서 실질적인 통제는 범위, 만료, 폐기입니다. 필요한 저장소로 제한된 fine-grained 토큰을 사용하고 만료일을 설정하며, 작업이 끝나면 GitHub에서 토큰을 삭제하십시오. GitHub 트래픽은 브라우저에서 api.github.com으로 직접 가며 LadeStack이 자격 증명을 보관할 필요가 없습니다. 브라우저 저장소는 여전히 백업이 아니므로 저장소는 기기 밖 사본으로도 합리적입니다.',
          },
          {
            heading: '10. 이 워크플로가 충분할 때와 그렇지 않을 때',
            body: 'GitHub 동기화는 브라우저 프로젝트의 상당 부분에 충분합니다. 정적 사이트, React 또는 Vue 프로토타입, 수업 연습, 작은 내부 도구, 리모트와 배포 소스가 필요한 데모 등입니다. Git을 설치하지 않고 버전 관리를 원하는 1인 개발자, 재현 가능한 인계가 필요한 교사, 터미널이 없는 기기에서 작업하는 사람에게 맞습니다. 서브모듈이 있는 모노레포, Git LFS에 의존하는 저장소, 서명된 커밋이나 상세한 커밋 이력 검토가 필요한 팀, 훅과 여러 리모트에 기반한 릴리스 프로세스에는 충분하지 않습니다. 그것들은 데스크톱 Git 작업이며, 그렇지 않은 척하면 브라우저 흐름이 더 나빠집니다. 유용한 패턴은 하이브리드입니다. 첫 미리보기가 즉시 나오므로 브라우저에서 시작합니다. 유지할 가치가 있는 형태가 되면 Push합니다. 네이티브 도구, 더 깊은 디버거, 전체 Git 워크플로가 필요하면 같은 저장소를 데스크톱에서 엽니다. 브라우저로 돌아올 때 GitHub를 통해 변경 사항을 Pull합니다. 파일은 일반 소스 파일이므로 인계는 마이그레이션이 아니라 버전 관리입니다. 브라우저 쪽을 시험하려면 /app/projects의 Projects Dashboard를 열고 프로젝트를 만든 뒤 GitHub sync를 열어 첫 커밋을 Push하십시오. 전체 설정과 기능 참조는 문서에 있습니다.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coder 전체 문서 읽기 →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: '브라우저 IDE에서 Vercel 또는 Netlify로 배포하기',
        description: '브라우저 IDE 배포 방식: 프로바이더 토큰, 정적 업로드, Vercel 빌드, 안정적인 URL, 제한, 보안, 재배포와 실패 대응을 설명합니다.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['배포', 'Vercel', 'Netlify', '브라우저 IDE', '정적 사이트'],
        intro: '배포는 브라우저 프로젝트가 미리보기를 넘어서는 순간입니다. 그 전까지 코드는 탭 안에 있고, 파일은 브라우저 프로필에 속하며, 결과를 열 수 있는 사람은 만든 사람뿐입니다. Vercel과 Netlify는 호스팅 문제를 해결하지만 일반적인 워크플로는 Git 저장소, 터미널, 폴더 끌어다 놓기를 전제로 합니다. GB Coder는 더 짧은 경로를 택합니다. Deploy 버튼이 현재 프로젝트를 패키징하고, 계정 토큰으로 프로바이더 API에 보낸 뒤, 공개 HTTPS URL을 돌려줍니다. 이 글은 그 경로를 자세히 설명합니다. 무엇이 업로드되는지, 배포를 어떻게 추적하는지, 두 번째 배포가 같은 주소에 머무는 이유, 그리고 한계가 어디인지 다룹니다. Vercel이나 Netlify의 일반 가이드가 아니라 브라우저 패널이 실제로 하는 일에 대한 설명입니다.',
        sections: [
          {
            heading: '1. 브라우저에서 배포하는 이유',
            body: '가장 분명한 사례는 CLI 설치가 번거롭거나 금지된 기기입니다. Chromebook, 학교 실습실 PC, 잠긴 회사 데스크톱은 브라우저 탭은 열 수 있지만 Node.js, Git, 프로바이더 CLI를 항상 설치할 수는 없습니다. 브라우저 IDE는 편집 단계에서 이미 그 요구를 없앱니다. 배포는 보통 개발자를 터미널로 되돌리는 마지막 단계입니다. 같은 탭에 두면 순환이 닫힙니다. 로컬 툴체인 없이 편집, 미리보기, 게시가 끝납니다. 두 번째는 속도입니다. 랜딩 페이지, 프로토타입, 고객 데모는 저장소나 CI 파이프라인보다 URL이 먼저 필요할 수 있습니다. 브라우저 패널은 현재 스냅샷을 게시하고 어디에 공개됐는지 알려줍니다. 편의에는 경계가 있습니다. 이것은 직접 업로드이지 배포 파이프라인이 아닙니다. 브랜치를 감시하지 않고, 테스트를 실행하지 않으며, 환경 사이에서 빌드를 승격하지 않습니다. 그 일은 프로바이더의 Git 연동이나 CI의 몫입니다. 브라우저 경로는 첫 URL을 위한 것이지 전체 릴리스 과정을 위한 것이 아닙니다.',
          },
          {
            heading: '2. 원클릭 배포가 실제로 하는 일',
            body: 'Deploy 대화상자는 두 프로바이더 API 위의 얇은 제어면입니다. Deploy now를 누르면 GB Coder는 Download ZIP과 동일한 파일 번들을 만듭니다. 이 점이 중요합니다. 스타일시트를 빠뜨리거나 외부 라이브러리를 잊을 수 있는 두 번째 패키징 경로는 없습니다. 일반 프로젝트는 index.html, style.css, script.js, README가 됩니다. React 또는 Vue 프로젝트는 index.html, package.json, vite.config.js, .gitignore, README, src/ 아래 소스로 구성된 Vite 형태 트리가 됩니다. 대화상자의 번들 요약은 탭을 떠나기 전 정확한 파일 수와 비압축 크기를 보여줍니다. Vercel은 배포 엔드포인트로 파일을 인라인 JSON으로 받습니다. Netlify는 ZIP을 요청 본문 그대로 받습니다. Vercel은 프로젝트를 빌드하거나 제공하고, Netlify는 업로드된 파일을 수동 배포로 게시합니다. LadeStack 서버가 중간에 없고, 사용자 기기에서 CLI도 실행되지 않습니다. 브라우저가 클라이언트, 프로바이더가 호스트, 토큰이 유일한 자격 증명입니다. 원클릭은 인터페이스를 뜻하며 작업량을 뜻하지 않습니다. 패키징, 업로드, 원격 처리, TLS는 여전히 순서대로 일어납니다.',
          },
          {
            heading: '3. 정적 사이트와 Vite 앱은 경로가 다르다',
            body: '번들이 다른 이유는 두 프로젝트 유형의 처리가 다르기 때문입니다. 일반 HTML/CSS/JavaScript 프로젝트에는 package.json이 없습니다. Vercel에는 프레임워크를 쓰지 말라고 지정하고 파일을 정적 사이트로 제공합니다. Netlify는 ZIP을 그대로 게시하며, 이는 정적 파일에도 올바릅니다. 설치할 것도 컴파일할 것도 없어 첫 배포는 보통 빠릅니다. React 또는 Vue 프로젝트에는 생성된 package.json, Vite 설정, 소스 파일이 포함됩니다. Vercel에서는 프로바이더가 Vite를 감지하고 의존성을 설치한 뒤 프로덕션 빌드를 실행해 출력을 게시합니다. 브라우저 안의 시뮬레이션이 아니라 실제 클라우드 빌드이므로 1분 이상 걸릴 수 있습니다. Vercel은 편집기에 우연히 로드된 버전이 아니라 package.json에 기록된 버전을 사용합니다. Netlify의 수동 ZIP 배포는 빌드 명령을 실행하지 않으므로 같은 Vite 소스 트리가 업로드된 그대로, 컴파일되지 않은 채 게시됩니다. Netlify에서 React 또는 Vue를 쓰려면 프로바이더의 Git 통합을 사용하세요. Netlify 원클릭 경로는 정적 출력만 게시합니다. 외부 라이브러리와 주입 설정은 이미 번들에 반영되어 있습니다. Vercel 빌드가 비공개 패키지, 네이티브 바이너리, 빌드 이미지에서 닿을 수 없는 서비스에 의존하면 로컬 미리보기가 작동해도 빌드는 실패합니다. 어느 경우인지는 로그로 확인할 수 있습니다.',
          },
          {
            heading: '4. 올바른 범위의 토큰 준비',
            body: '두 프로바이더 모두 개인 액세스 토큰으로 인증합니다. 프로바이더 비밀번호도, GB Coder 계정도 아닙니다. 대화상자는 선택한 프로바이더의 토큰 페이지로 연결하고 범위를 쉬운 말로 설명합니다. Vercel 토큰은 계정이나 팀이 닿을 수 있는 모든 프로젝트에 게시할 수 있습니다. 팀 범위 토큰이 있으면 그것을 사용하세요. Netlify 토큰은 계정이 접근할 수 있는 사이트 전체에 작용하므로 더 좁은 옵션이 없다면 계정 전체로 취급하세요. 이 용도로 토큰을 만들고, 필요한 만큼만 짧게 유지하고, 프로젝트가 더 이상 필요로 하지 않을 때 프로바이더에서 폐기하세요. GB Coder는 Deploy now를 활성화하기 전에 토큰이 있는지, 번들이 로컬 제한 안에 드는지 확인합니다. 토큰은 기본적으로 탭 메모리에만 보관됩니다. Remember on this device는 선택 사항입니다. 보안 컨텍스트에서는 localStorage에 쓰기 전에 AES-GCM으로 봉인하고, 그렇지 않으면 기억할 경우 평문으로 저장된다고 대화상자가 경고합니다. 범위와 폐기가 가장 중요한 통제입니다.',
          },
          {
            heading: '5. 첫 배포를 순서대로 진행하기',
            body: '프로젝트를 열고 툴바에서 Deploy를 선택하세요. 좁은 화면에서는 오버플로 메뉴에 있습니다. 기본값은 Vercel이고 Netlify는 한 번 더 클릭하면 됩니다. 프로젝트 이름은 현재 프로젝트에서 미리 채워집니다. GB Coder는 이름을 소문자로 바꾸고 잘못된 문자를 하이픈으로 바꾸며 요청할 호스트 이름(예: your-project.vercel.app)을 보여줍니다. 토큰을 붙여 넣고 기억할지 정한 뒤 번들 요약을 확인하세요. 파일 수나 크기가 제한을 넘으면 대화상자가 이유를 설명하고 버튼을 비활성 상태로 둡니다. Deploy now를 누르세요. 프로바이더가 프로젝트나 사이트를 만들고 번들을 받아 배포 처리를 시작합니다. 배포가 준비되면 성공 화면에 공개 URL, 파일 수, 업로드 크기, 경과 시간, 휴대폰에서 열 수 있는 QR 코드가 표시됩니다. Copy URL과 Visit site는 전달용이고 Build logs는 프로바이더의 로그 화면을 엽니다. Netlify 사이트 이름은 전 세계 공용이므로 원하는 이름이 이미 사용 중일 수 있습니다. 그러면 다른 이름이 배정되고, GB Coder는 입력한 주소가 아니라 실제로 공개된 주소를 알려줍니다.',
          },
          {
            heading: '6. 진행 화면이 실제로 보여주는 것',
            body: '진행 표시줄은 패키징, 업로드, 빌드, 보안 설정, 완료 순으로 이동합니다. Netlify에서 빌드 표시는 프로바이더의 처리 과정을 뜻하며 빌드 명령을 의미하지 않습니다. 클라이언트의 보고일 뿐, 프로바이더의 예측이 아닙니다. 비율은 처음 두 단계에서 빠르게 오르고 프로바이더가 원격 작업을 끝내는 동안 100 아래에 머뭅니다. 의도된 동작입니다. 원격 작업 시간은 예측할 수 없고, 99%까지 질주하는 막대는 거짓말이 되기 때문입니다. GB Coder는 1.5초마다 프로바이더를 폴링하고 상태가 바뀌면 메시지를 갱신합니다. 업로드 요청에는 2분 제한 시간이 있습니다. 패널은 배포 폴링을 3분 후 중단하고 대시보드로 안내합니다. 브라우저가 보기를 멈춰도 배포는 끝날 수 있기 때문입니다. 취소, 대화상자 닫기, Escape 키는 진행 중인 요청과 폴링 루프를 중단합니다. 프로바이더가 이미 배포를 받아들였다면 그쪽에서 배포가 계속될 수 있습니다. 취소가 롤백을 뜻한다고 가정하지 말고 대시보드를 확인하세요. 배포가 실패하면 프로바이더의 로그가 신뢰할 수 있는 출처입니다.',
          },
          {
            heading: '7. 재배포, 안정적인 URL, 프로바이더 상태',
            body: 'Deploy again은 폼으로 돌아갈 뿐 마지막 번들을 즉시 다시 보내지 않습니다. 프로젝트가 바뀌었거나 이름을 조정해야 하거나 토큰이 만료됐을 때 유용합니다. 그다음 Vercel과 Netlify는 같은 주소로 다른 경로를 갑니다. Vercel은 지정된 프로젝트에 배포를 만들고 프로덕션을 대상으로 합니다. 같은 프로젝트 이름으로 반복 배포하면 그 프로젝트가 갱신되며, 배포별 URL보다 프로덕션 별칭이 우선하므로 공유하는 주소는 보통 안정적으로 유지됩니다. Netlify는 새 사이트를 만들지 않고 기존 사이트를 갱신하려면 사이트 ID가 필요합니다. GB Coder는 정리된 사이트 이름을 키로 그 ID를 localStorage에 기억합니다. 브라우저 저장소를 지우거나, 브라우저를 바꾸거나, 이름을 바꾸거나, Netlify에서 사이트를 삭제하면 다음 배포는 이전 사이트를 찾지 못하고 새로 만듭니다. 그래서 Netlify 프로젝트 이름을 바꾸면 이전 사이트가 계정에 남을 수 있습니다. 두 프로바이더 모두 배포 기록, 사용자 지정 도메인, 액세스 제어, 롤백을 대시보드에서 관리합니다. GB Coder 패널은 업로드와 공개 URL만 다룹니다. 여기서 하는 모든 배포는 프로덕션 배포이며 브랜치 미리보기나 환경 선택기는 없습니다.',
          },
          {
            heading: '8. 미리 계획할 제한과 실패',
            body: '요청이 탭을 떠나기 전에 두 가지 제한이 적용됩니다. 900개 파일과 비압축 64MB입니다. 프로바이더 자체 한도보다 낮게 두어 거대한 업로드가 브라우저 세션 중간에 실패하지 않게 합니다. 미디어가 많은 사이트는 큰 이미지와 동영상을 프로젝트 번들이 아니라 CDN이나 Git에 두는 편이 좋습니다. 오류는 원인별로 구분됩니다. 401은 토큰 거부, 403은 보통 계정이나 팀 권한 부족, 413 또는 429는 페이로드 과대나 프로바이더 속도 제한, 422는 프로젝트가 유효하지 않다고 거부된 경우, 5xx는 보통 일시적입니다. Vercel에서는 프레임워크 빌드 실패가 다릅니다. 업로드는 성공했고 빌드가 실패한 것이므로 새 토큰을 붙이지 말고 로그를 읽으세요. Vercel 빌드에 환경 변수가 필요하면 또 다른 경계입니다. 배포 대화상자에는 환경 변수 편집기가 없습니다. Vercel 프로젝트 설정에서 값을 지정하고 다시 배포하세요. 첫 빌드는 값을 설정할 프로젝트가 생기기 전에 실패할 수 있습니다. Netlify의 수동 ZIP 경로에는 빌드 단계가 없으므로 여기에는 해당하지 않습니다. 3분 폴링 제한은 배포 실패가 아니라 기다리기의 실패입니다.',
          },
          {
            heading: '9. 보안, 소유권, 데이터 경계',
            body: '배포 경로는 직접적입니다. 브라우저가 토큰을 사용해 api.vercel.com 또는 api.netlify.com을 호출합니다. 자격 증명을 저장하는 프록시가 없고 패널을 쓰는 데 LadeStack 계정도 필요 없습니다. 토큰은 기본적으로 세션에만 있고, 보안 컨텍스트에서 기억을 선택한 경우에만 AES-GCM으로 봉인됩니다. 이는 브라우저 프로필 백업이나 지원 번들에서 읽히는 토큰을 막지만, 탭이 열려 있는 동안 같은 출처에서 실행되는 악성 코드는 막지 못합니다. 가능한 가장 좁은 토큰을 사용하고 만료를 설정하고 작업이 끝나면 프로바이더에서 폐기하세요. 소유권은 토큰을 따릅니다. 프로젝트나 사이트는 그것을 소유한 프로바이더 계정에, 해당 약관, 할당량, 로그, 청구 아래 생성됩니다. GB Coder는 local-first를 유지하지만 배포는 프로젝트를 프로바이더로 명시적으로 내보내는 일입니다. 프로바이더는 사이트 소스를 받고 결과는 기본적으로 공개 HTTPS URL입니다. 비밀번호 보호, SSO, 사용자 지정 도메인은 프로바이더 기능입니다. 브라우저 프로필이 프로젝트의 유일한 다른 보관 장소가 되지 않도록 ZIP이나 GitHub 사본을 남기세요.',
          },
          {
            heading: '10. 브라우저 배포가 맞는 경우',
            body: '작은 사이트를 빠르게 공개할 때 이 경로를 쓰세요. 랜딩 페이지, 포트폴리오, 수업 데모, 고객 리뷰용 프로토타입, 정적 문서 페이지 등입니다. 프로젝트가 이미 GB Coder에 있고 대안이 ZIP을 내보내 터미널을 열고 내 것이 아닌 기기에서 CLI를 설정하는 일뿐일 때도 맞습니다. 모노레포, 데이터베이스가 있는 서버 렌더링 앱, 비공개 레지스트리 자격 증명이 필요한 빌드, 브랜치 미리보기와 승인으로 릴리스하는 팀, 업로드 제한을 넘는 자산에는 맞지 않습니다. 그 일은 프로바이더의 Git 연동, CI 파이프라인, 데스크톱 환경의 몫입니다. 두 접근은 공존할 수 있습니다. 브라우저에서 초안을 쓰고 반복하며, 이력이 필요해지면 소스를 GitHub에 push하고, 프로덕션 빌드는 CI가 게시하게 하세요. 실용적인 순서는 짧습니다. 휴대폰 너비에서 미리보기를 확인하고, 번들 요약을 보고, 배포하고, 다른 기기에서 공개 URL을 열고, 빌드 로그를 저장하세요. 시험하려면 /app/projects의 프로젝트 대시보드를 열고 프로젝트를 만들거나 연 뒤 Deploy를 선택하세요. 설정 참고 자료는 문서에 있습니다.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'GB Coder 전체 문서 보기 →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: '브라우저 IDE에서 API 키와 환경 변수를 안전하게 다루기',
        description: '브라우저 IDE에서 API 키와 환경 변수를 다루는 방법: 클라이언트 노출, 안전한 보관, 권한 범위, 로테이션, 배포, 유출 대응을 설명합니다.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['보안', 'API 키', '환경 변수', '브라우저 IDE', '모범 사례'],
        intro: '모든 브라우저 IDE는 결국 같은 질문에 도달합니다. 키를 어디에 둘 것인가? 프로젝트에는 API 엔드포인트가 필요하고, AI 패널에는 공급자 키가 필요하며, 배포에는 계정 토큰이 필요합니다. 데스크톱에서는 이런 값을 셸 프로필이나 추적되지 않는 파일에 둘 수 있습니다. 브라우저 탭에서는 경계가 다릅니다. 페이지와 함께 전송되는 것은 페이지가 읽을 수 있고, 브라우저 프로필에 저장된 것은 그 프로필에 속합니다. 이 가이드는 실용적인 모델을 정리합니다. 공개해도 되는 값, 클라이언트에 절대 도달해서는 안 되는 값, GB Coder가 공급자 자격 증명을 처리하는 방식, 키가 유출되었을 때의 대응입니다. 브라우저 탭을 비밀 금고라고 가정하지 않으면서 브라우저 IDE의 편리함을 원하는 사람을 위한 글입니다.',
        sections: [
          {
            heading: '1. 브라우저 탭은 공개된 빌드 대상',
            body: '첫 번째 규칙은 불편하지만 단순합니다. 정적 웹 앱은 비밀을 보관할 수 없습니다. 브라우저는 HTML, CSS, JavaScript를 내려받아 사용자의 기기에서 실행합니다. 누구나 DevTools를 열고 네트워크 패널을 읽고 번들을 검색하고 중단점을 설정해 변수를 검사할 수 있습니다. 코드를 축소하거나 청크로 나누거나 설정 파일에 값을 숨겨도 달라지는 것은 노력이지 결과가 아닙니다. 브라우저 IDE는 프로젝트 코드를 실행하는 샌드박스를 추가하지만, IDE 자체의 UI는 여전히 같은 오리진에서 실행되며 필요한 값을 읽어야 합니다. 샌드박스는 UI가 사용해야 하는 값의 금고가 아닙니다. 유용한 판단 기준은 간단합니다. 탭에서 실행되는 코드가 값을 사용할 수 있어야 한다면, 탭을 사용하는 사람도 그 값을 읽을 수 있다고 가정하세요. 같은 오리진에서 실행되는 스크립트도 읽을 수 있다고 가정하세요. 이것은 브라우저 개발을 위험하게 만드는 이야기가 아닙니다. 경계를 정의하는 이야기입니다. 공개 식별자는 둘 수 있지만 서버 자격 증명은 둘 수 없습니다.',
          },
          {
            heading: '2. 정적 앱에서 환경 변수가 의미하는 것',
            body: 'Node.js 서버에서는 환경 변수를 런타임에 프로세스에서 읽습니다. Vite, Create React App, Next.js, Astro 빌드에서는 공개 환경 변수의 동작이 다릅니다. 번들러가 빌드 중에 참조를 리터럴 문자열로 바꿉니다. Vite는 VITE_ 접두사 변수를 import.meta.env를 통해 노출하고, Create React App은 REACT_APP_, Next.js는 NEXT_PUBLIC_, Astro는 PUBLIC_을 사용합니다. 접두사는 명명 규칙이지 보안 제어가 아닙니다. 값이 인라인되는 순간 그 값은 모든 방문자가 내려받는 JavaScript의 일부가 됩니다. 공개 접두사가 없는 변수는 일반적으로 클라이언트 코드에서 사용할 수 없으므로, 서버 전용 값은 정적 페이지가 아니라 서버나 서버리스 함수에서 읽어야 합니다. .env 파일은 개발과 빌드 입력이지 런타임 비밀 저장소가 아닙니다. 로컬 구성과 버전 관리 밖에 값을 두는 데는 유용하지만, 빌드 후에 값을 비공개로 만들어 주지는 않습니다.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. 브라우저에 둘 수 있는 키',
            body: '일부 키는 공개되도록 설계되었습니다. Stripe 공개 키는 계정을 식별하고 결제 토큰을 만듭니다. 비밀 키는 실제로 돈을 움직이므로 서버에 있어야 합니다. Supabase anon 키는 행 수준 보안 정책이 올바를 때만 안전합니다. Firebase 웹 구성은 프로젝트를 식별하지만 관리자 액세스를 부여하지는 않습니다. 지도와 분석 키는 흔히 도메인이나 API로 제한됩니다. 이런 값은 브라우저로 보낼 수 있지만, 허용 오리진, API 제한, 최소 권한 역할, 할당량, 경고 같은 제한이 여전히 필요합니다. 반대 범주는 말하기 더 쉽습니다. 서비스 역할 키, 데이터베이스 비밀번호, SMTP 자격 증명, 서명 비밀, AI 공급자의 비밀 키는 정적 번들에 절대 들어가면 안 됩니다. 애플리케이션 소유의 공급자 키는 특히 위험합니다. 발견한 사람이 애플리케이션의 돈을 쓸 수 있기 때문입니다. 사용자 소유 키는 다른 경우입니다. 여전히 베어러 자격 증명이지만 사용자의 것이며, 목표는 프로젝트나 저장소가 아니라 사용자의 브라우저에 두는 것입니다.',
          },
          {
            heading: '4. GB Coder가 공급자 자격 증명을 처리하는 방식',
            body: 'GB Coder의 AI 패널은 bring-your-own-key 방식입니다. 키 관리자는 기본적으로 공급자 키를 메모리에 보관합니다. localStorage에는 쓰지 않습니다. 사용자가 명시적으로 선택한 경우에만 sessionStorage에 저장하며, 이때 값은 현재 탭으로 제한되고 일반적으로 탭을 닫으면 지워집니다. 사용자가 키를 지우면 메모리와 세션 저장소에서 제거됩니다. 관리자는 각 키를 승인된 엔드포인트 오리진에 묶고, 아웃바운드 게이트가 자격 증명이 승인되지 않은 대상으로 전송되지 않는지 확인합니다. 공급자 오류는 가림 처리 계층을 거치며, 메시지가 UI나 로그에 도달하기 전에 키 패턴과 활성 키를 제거합니다. 사용자 지정 공급자 메타데이터는 localStorage에 저장되지만, 비밀로 표시된 헤더는 저장 전에 지워지며 다시 입력해야 합니다. 요청은 브라우저에서 공급자 엔드포인트로 직접 전송되며, GB Coder가 LadeStack 서버를 통해 키를 프록시하지 않습니다. 이런 조치는 우발적 저장과 오리진 간 유출을 줄입니다. 하지만 기본 규칙은 바뀌지 않습니다. 같은 오리진에서 실행될 수 있는 스크립트는 페이지가 읽을 수 있는 것을 읽을 수 있습니다. 민감한 작업에는 깨끗한 프로필을 사용하고 신뢰할 수 없는 확장 프로그램을 설치하지 마세요.',
          },
          {
            heading: '5. 프로젝트 비밀, .env 파일, 빌드 시 인라인 처리',
            body: '비밀은 프로젝트 트리 밖에 두세요. .env와 로컬 변형을 .gitignore에 추가하고, 자리 표시자 이름만 담은 .env.example을 커밋하세요. Vite를 쓰는 프로젝트라면 모든 VITE_ 변수가 프로덕션 번들에 인라인된다는 점을 기억하세요. 로컬 개발에서 편리했던 값도 프로덕션 빌드에 사용되는 순간 공개됩니다. 배포 전에 생성된 자산에서 키 패턴을 검사하고, 발견되면 경고가 아니라 사고로 취급하세요. GitHub 비밀 스캔과 푸시 보호는 알려진 토큰 형식 일부를 잡을 수 있지만, 안전망일 뿐 저장소 밖에 값을 두는 일을 대신하지는 않습니다. 브라우저 IDE의 ZIP 내보내기에는 프로젝트 파일이 포함됩니다. .env 파일이 프로젝트 안에 있으면 백업과 함께 이동합니다. 백업은 암호화된 금고가 아닙니다. 내보내기는 비공개 장소에 보관하고 더 이상 필요 없는 오래된 사본은 삭제하세요. 스크린샷, 이슈 보고서, 채팅 메시지도 마찬가지입니다. 그중 하나에 붙여넣은 키는 이미 브라우저를 떠난 것입니다.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. GitHub 토큰과 배포 토큰',
            body: 'GitHub 개인 액세스 토큰과 배포 토큰은 보기보다 강력합니다. repository와 workflow 범위를 가진 클래식 토큰은 비공개 코드를 읽고 파일을 변경하고 릴리스를 시작할 수 있습니다. 단일 저장소, 명시적 권한 목록, 만료일이 있는 fine-grained 토큰을 선호하세요. 토큰에는 작업에 필요한 권한만 부여하세요. 동기화에는 contents 읽기와 쓰기만 있으면 되고 administration이나 billing은 필요 없습니다. 기기나 용도별로 별도 토큰을 만들고 작업이 끝나면 폐기하세요. Vercel이나 Netlify의 배포 토큰은 프로젝트를 게시, 교체, 삭제할 수 있습니다. 공급자가 프로젝트나 팀 범위를 지원하면 사용하고, 만료를 지원하면 설정하세요. 토큰은 필요할 때만 배포 패널에 붙여넣고 프로젝트 파일에 저장하지 마세요. CI에서는 커밋된 .env 대신 저장소나 조직 비밀을 사용하고, 포크에서 온 pull request에는 일반적으로 비밀이 전달되지 않는다는 점을 기억하세요. 스크린샷에 찍혔거나 채팅에서 공유되었거나 공개 저장소에 커밋된 토큰은 1초 뒤에 삭제했더라도 침해된 것으로 취급해야 합니다.',
          },
          {
            heading: '7. AI 공급자 키: 놀라움 없는 BYOK',
            body: 'AI 공급자 키는 청구서가 붙은 베어러 자격 증명입니다. 가진 사람은 누구나 요청을 보내고 할당량을 소비하며 비용을 발생시킬 수 있습니다. 프로젝트 범위로 제한된 키를 사용하고, 공급자가 제공하면 지출 한도를 설정하고, 조직의 마스터 키 대신 실험용 별도 키를 사용하세요. 특히 기기를 공유하거나 새 확장 프로그램을 설치한 뒤에는 사용량을 정기적으로 확인하세요. Ollama, LM Studio, vLLM 같은 로컬 공급자는 클라우드 키가 필요 없지만, 엔드포인트는 여전히 기기 위의 서비스입니다. 데모를 돌리기 위해 로컬 엔드포인트를 공용 인터넷에 노출하지 마세요. 사용자 지정 공급자가 프록시를 가리키면 프록시가 키를 볼 수 있습니다. 자신이 관리하고 이해하는 프록시만 사용하세요. 프롬프트 인젝션도 관련 위험입니다. 파일, 웹 페이지, 붙여넣은 오류 메시지에는 어시스턴트를 겨냥한 지시가 들어 있을 수 있습니다. 비밀은 프롬프트 밖에 두고, 어시스턴트가 읽도록 허용한 파일에도 넣지 마세요. 대화에 키가 나타나면 로테이션하세요.',
          },
          {
            heading: '8. 공유 컴퓨터, 확장 프로그램, XSS',
            body: '공유 컴퓨터나 실습실 기기에는 다른 절차가 필요합니다. 비공개 브라우저 프로필을 사용하고, 세션 저장을 선택하지 말고, 끝나면 탭을 닫으세요. 브라우저가 키 저장을 제안하면 거절하세요. 남아 있다고 의심되면 사이트 저장소를 지우세요. 브라우저 확장 프로그램도 경계의 일부입니다. 넓은 호스트 권한을 가진 확장 프로그램은 흔히 페이지 내용이나 저장소를 읽을 수 있고, 설치 후에 악성 업데이트가 도착할 수도 있습니다. 자격 증명을 다루는 작업에는 최소한의 프로필을 사용하세요. 이 맥락에서 전형적인 웹 위험은 크로스 사이트 스크립팅입니다. 공격자가 IDE 오리진에서 스크립트를 실행할 수 있으면, 그 스크립트는 localStorage와 sessionStorage를 읽고 페이지가 열려 있는 동안 요청을 보낼 수 있습니다. 의존성을 최신으로 유지하고 신뢰할 수 없는 타사 스크립트를 피하며, 배포된 사이트에 콘텐츠 보안 정책을 고려하세요. 클립보드 관리자와 화면 공유 도구도 복사하고 표시하는 것을 봅니다. 키를 옮긴 뒤 클립보드를 지우고, 공급자 설정 패널을 열기 전에 공유를 일시 중지하세요.',
          },
          {
            heading: '9. 유출된 키 로테이션',
            body: '유출된 키에 대한 신뢰할 수 있는 대응은 로테이션뿐입니다. 먼저 폐기하는 것이 중요합니다. 새 키를 준비하는 동안 이전 키가 유효하면 노출은 계속됩니다. 새 키는 필요한 최소 범위로 만들고, 애플리케이션이나 브라우저 설정을 업데이트하고, 값이 빌드에 포함되어 있었다면 다시 배포한 뒤 이전 키가 거부되는지 확인하세요. 그다음 공급자의 사용량과 감사 로그에서 예상하지 못한 활동을 확인하세요. 키가 Git에 커밋되었다면 파일을 삭제하는 것만으로는 부족합니다. 값은 기록에 남습니다. 먼저 로테이션한 뒤 git filter-repo나 BFG 같은 도구로 기록을 다시 쓰고, 팀의 동의를 얻어 force-push하고, 협업자에게 다시 클론하도록 요청하세요. 호스팅 플랫폼은 오래된 빌드를 캐시할 수 있으므로 이전 값이 오래된 번들에서 제공되지 않도록 하세요. 키를 AI 채팅, 지원 티켓, 스크린샷에 붙여넣었다면 보관된 것으로 가정하고 로테이션하세요. 마지막으로 무슨 일이 있었는지 기록하고, 문제를 잡았을 수 있는 검사를 추가하고, 다음 키의 수명을 줄이세요.',
          },
          {
            heading: '10. 실용적인 체크리스트',
            body: '프로젝트가 브라우저를 떠나기 전에 이 순서를 사용하세요. 첫째, 각 값을 분류합니다. 공개 식별자, 사용자 자격 증명, 서버 비밀 중 하나입니다. 둘째, 서버 비밀을 정적 번들 밖에 두고 서버리스 함수나 API 뒤로 옮깁니다. 셋째, 공개 접두사가 필요한 값만 노출하고 배포 전에 빌드된 자산을 검사합니다. 넷째, .env 파일을 Git 밖에 두고 .env.example을 커밋하며 비밀 스캔을 활성화합니다. 다섯째, GitHub와 호스팅용으로 범위가 제한되고 만료되는 토큰을 용도별로 하나씩 만듭니다. 여섯째, GB Coder에서는 신뢰할 수 있는 기기가 아니라면 키를 메모리에 두고, 트레이드오프를 이해할 때만 세션 저장을 선택합니다. 일곱째, 키를 프롬프트, 이슈, 스크린샷, 프로젝트 파일에 절대 붙여넣지 않습니다. 여덟째, 조금이라도 의심되면 로테이션하고 교체 전에 폐기합니다. 아홉째, 공유 기기에서는 깨끗한 브라우저 프로필을 사용합니다. 열째, 필요해지기 전에 유출 대응 계획을 적어 둡니다. 브라우저를 사적인 금고가 아니라 공개 클라이언트로 취급하면 브라우저 IDE에서도 자격 증명을 책임 있게 관리할 수 있습니다.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: '浏览器 IDE 与桌面 IDE：该如何选择？',
        description: '从安装、性能、扩展生态、调试、Git、离线、安全与成本等维度，实用对比浏览器 IDE 与桌面 IDE，并给出不同场景下的选择与组合建议，帮助你在轻量原型与重型项目之间做出判断。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['浏览器 IDE', '桌面 IDE', '开发工具', 'Web 开发', '对比'],
        intro: '桌面 IDE 作为默认选择实在太久，许多开发者已经不再追问为什么。安装编辑器、添加扩展、配置运行时、克隆仓库，然后才写下第一行代码。浏览器 IDE 提出了另一种顺序：打开标签页，创建项目，在环境自行就绪的同时开始输入。这不是谁一边倒胜出的取舍。浏览器 IDE 省去安装，让工作可以随身携带，但它继承了浏览器沙箱的限制。桌面 IDE 需要安装和磁盘空间，却能触达原生工具链、扩展和本地硬件。本文按真正会改变决定的维度进行比较，并以 GB Coder 作为浏览器一侧的例子，因为它的两种模式覆盖了光谱的两端。',
        sections: [
          {
            heading: '1. 什么才算浏览器 IDE',
            body: '浏览器 IDE 是在网页中运行、无需桌面安装即可打开或保存项目的编辑器。这个类别包含两种差异很大的产品。第一种是静态工作台：HTML、CSS、JavaScript 面板加实时预览，没有包管理器。第二种是完整运行时：WebContainer 这类基于 WebAssembly 的系统在标签页内执行 Node.js、npm 和开发服务器。GB Coder 两者都提供：面向无依赖工作的 Static Editor，以及面向 React、Vue 和普通 npm 项目的 Advanced IDE。这个区分在后续所有比较中都很重要。静态浏览器编辑器对标的是草稿本，完整的浏览器 IDE 对标的是轻量桌面环境。用静态版本评判所有浏览器 IDE，就像用带语法高亮的文本编辑器评判桌面 IDE。',
          },
          {
            heading: '2. 桌面 IDE 仍然占优的地方',
            body: '对于大型、长期维护的系统，桌面 IDE 仍是更强的选择。它们可以运行原生编译器、移动模拟器、数据库客户端、Docker，以及能分析整个 monorepo 的语言服务器。扩展市场提供调试器、框架工具、linter 和集成，这些在浏览器中没有对应物。本地文件不受存储配额限制，内存足够的机器可以同时维持庞大的依赖树和多个服务。离线工作是常态而非例外，远程开发扩展让轻薄笔记本也能控制强大的服务器。这些都没有过时。如果你的日常工作涉及原生 SDK、多服务后端或包含数百个包的仓库，桌面 IDE 不是怀旧习惯，而是与工作匹配的工具。',
          },
          {
            heading: '3. 安装时间与首次预览',
            body: '最明显的差异出现在代码存在之前。桌面环境通常要安装编辑器、运行时、包管理器、扩展和项目依赖，然后等待第一次构建。在新机器上，这可能耗掉一个下午。浏览器 IDE 压缩了这个序列：打开网站，选择模板或空白项目，首次预览立即出现。GB Coder 在 IndexedDB 中创建工作区，因此没有账号、下载或服务器往返。需要注意的是，应用本身必须加载，高级运行时需要支持 SharedArrayBuffer 和跨源隔离的现代浏览器。对于课堂、借用笔记本、Chromebook 或快速客户演示，这个差异是决定性的。对于已有调校好工作站的开发者，安装成本只付一次，影响较小。',
          },
          {
            heading: '4. 性能、内存与运行时限制',
            body: '桌面 IDE 直接使用 CPU 和内存。浏览器 IDE 在标签页中运行，而标签页是受管理的沙箱，有自己的内存上限。对于典型 Vite 应用，这个上限很宽裕，但并非无限。安装超大依赖树、运行多个 watcher 或构建巨型 monorepo，可能耗尽标签页或触发重新加载。WebContainer 也无法运行原生二进制、Docker 镜像或为主机操作系统编译的工具。因此，诚实的比较取决于工作负载。对于落地页、仪表盘、组件库或小型全栈原型，浏览器 IDE 与本地开发几乎没有区别。对于需要数据库引擎、Python 服务或原生模块的项目，桌面仍是实用环境。电池表现也遵循同样规律：标签页比完整 IDE 加十几个后台服务更轻，但长时间的 WebContainer 会话仍然耗电。',
          },
          {
            heading: '5. 编辑器智能与扩展',
            body: '编辑器质量不再是浏览器的弱项。GB Coder 使用 Monaco，也就是驱动 VS Code 的开源引擎，因此补全、行内文档、语法校验、括号匹配、多光标编辑和可配置快捷键都具备。TypeScript、JavaScript、HTML、CSS 和 JSON 都有语言服务，diff 查看器让变更在应用前可审查。浏览器 IDE 缺少的是扩展生态。这里没有面向专用语言插件、框架检查器或自定义调试器的市场。部分功能已内置，部分对小项目并不必要，但依赖某个特定扩展的开发者会感到缺口。代价与收益在于维护：浏览器编辑器到手即配置完成，桌面编辑器则需要有人精心打理才会强大。',
          },
          {
            heading: '6. 终端、包与构建流水线',
            body: '终端是真正浏览器 IDE 与在线代码游乐场之间的分界线。在 GB Coder 的 Advanced IDE 中，WebContainer 提供 Node.js 运行时，npm install 解析真实包，npx 脚本可以执行，Vite 服务器在转发到预览的端口上启动。终端是带 ANSI 输出和命令历史的 xterm.js shell，不是模拟的日志面板。这覆盖了常见前端流水线：安装、开发、构建和测试，使用普通 JavaScript 工具。它不覆盖原生插件、Docker Compose 或生产数据库。桌面 IDE 可以运行整个栈，包括前端通信的服务。实用规则很简单：如果工具链从头到尾都是 JavaScript，浏览器大概率能跑；如果跨入原生代码或容器，桌面更稳妥。',
          },
          {
            heading: '7. 调试：浏览器上下文与原生工具',
            body: '浏览器 IDE 有一个被低估的调试优势：代码、预览和浏览器开发者工具处在同一上下文中。CSS 改动立即可见，虚拟控制台在预览旁收集日志，二维码在真实手机上打开页面，暴露触摸和视口问题。GB Coder 还提供视口预设和可分离的第二屏预览。桌面 IDE 胜在深度。它们可以把调试器附加到 Node 进程，跨服务设置断点，分析内存和 CPU，检查原生线程，并与移动模拟器集成。对于视觉化前端工作，浏览器循环更短。对于服务器进程里微妙的竞态条件，桌面调试器更合适。大多数开发者两种反馈都需要，所以后文的混合工作流很重要。',
          },
          {
            heading: '8. 文件、版本控制与备份',
            body: '存储是浏览器与桌面模型分歧最大的地方。桌面项目位于任何工具都能读取的文件夹中。浏览器项目位于 IndexedDB，速度快且私密，但绑定浏览器配置文件，容易受到存储清理影响。GB Coder 用命名快照、diff 查看器、带完整性哈希的 ZIP 导出，以及带结构预览的导入来缓解。GitHub 同步使用个人访问令牌，把推送组装成单个原子提交，跳过未变更文件，并在远程分支已移动时报告冲突。桌面 Git 仍然更完整：钩子、子模块、rebase 工作流、多个远程，以及所有 CI 都理解的 CLI。浏览器工作流对小项目足够，对独立开发者意外地强大，但在复杂仓库中不能替代完整 Git 客户端。导出到 GitHub 或 ZIP 是两者之间的桥梁。',
          },
          {
            heading: '9. 安全、隐私与成本',
            body: '浏览器 IDE 把风险与便利集中在同一处。GB Coder 是本地优先的：项目存储在浏览器中，不需要账号，产品免费且无广告。只有使用联网功能时数据才会离开设备，例如 AI 提供商、GitHub 同步、部署，或项目引用的 CDN。AI 采用自带密钥方式，提示词和选中代码会发送到你配置的提供商。GitHub 以及 Vercel 或 Netlify 部署使用你的令牌，除非选择加密存储，令牌仅限当前会话。这个模型把控制权交给开发者，但也意味着如果没有备份，浏览器存储就是唯一副本。桌面 IDE 把文件放在磁盘上，通常继承操作系统的备份与权限模型。两者都不会自动更安全；关键在于谁持有数据，以及设备或配置文件消失时会发生什么。',
          },
          {
            heading: '10. 如何选择，以及如何组合',
            body: '当工作偏视觉、周期短或需要便携时，选择浏览器 IDE：学习 HTML 和 CSS、做界面原型、授课、在 Chromebook 上审阅设计，或在不安装工具链的情况下构建小型 React 或 Vue 应用。当工作长期且系统繁重时，选择桌面 IDE：monorepo、原生 SDK、Docker、移动构建、大型扩展栈，或在封闭网络中离线开发。更有意思的答案是组合使用。先在浏览器开始，因为首次预览即时出现。在手机宽度验证布局。创建快照。推送到 GitHub 或导出 ZIP。当项目需要原生工具、更深的调试器或完整 Git 工作流时，在桌面打开同一仓库。文件是标准的，所以交接只是普通版本控制，而不是迁移。GB Coder 为周期的前半段而设计，不会把项目困在浏览器里。想验证这个决定的浏览器一侧，打开项目仪表盘并创建一个空白工作区；大约一分钟，比较就会变得具体。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: '阅读完整的 GB Coder 文档 →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: '在浏览器 IDE 中同步 GitHub：实用指南',
        description: '浏览器 IDE 的 GitHub 同步如何工作：令牌、原子提交、拉取、冲突、文件限制、安全性，以及何时仍应使用桌面终端。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', '版本控制', '浏览器 IDE', 'Git', '开发工作流'],
        intro: '浏览器 IDE 擅长省去安装配置，却不太擅长处理下一步：让工作在浏览器配置文件之外拥有一个持久的位置。通常，这里就会出现终端：git init、remote add、commit、push。浏览器 IDE 的 GitHub 同步把这套流程压缩到一个面板里，但它既不是魔法，也不是完整的 Git 客户端。它是一座有针对性的桥，连接浏览器存储中的项目和 GitHub 上的仓库。本文介绍这座桥在 GB Coder 中如何工作、会上传什么、如何处理冲突和令牌，以及在哪些场景下桌面 Git 工作流仍然更合适。',
        sections: [
          {
            heading: '1. 为什么浏览器 IDE 需要 GitHub',
            body: '浏览器项目之所以方便，正是因为它不需要文件夹、运行时或安装。同样的特性也是它的弱点。项目存放在浏览器配置文件中，可能被清理工具删除、随设备丢失，或在换电脑时被遗留。导出 ZIP 能创建副本，但 ZIP 是没有历史、没有共享远端的快照。GitHub 补上了缺失的一层：设备之外的仓库、提交历史、协作场所，以及 CI 或部署的自然来源。这改变了浏览器 IDE 的角色。它不再是一次性草稿本，而可以成为编写、审查和交接小型项目的地方。这套流程在 Chromebook、学校机房，或无法安装 Git 的公司锁定笔记本上尤其有用。对于之后可能迁移到桌面仓库的快速原型，它同样适用。浏览器负责第一稿，GitHub 让它持久。',
          },
          {
            heading: '2. 同步能做什么，不能做什么',
            body: 'GB Coder 提供三个 GitHub 操作：Push、New repo 和 Pull。Push 把当前项目写入现有仓库和分支。New repo 在已连接的 GitHub 账户下创建仓库，并把项目作为初始内容提交。Pull 读取分支，把文本文件导入编辑器。所有请求都从浏览器直接发往 api.github.com；LadeStack 服务器不会在中间持有令牌。这种有限的范围是有意为之。这个面板不能替代 Git 命令行。它不提供 rebase、合并冲突解决、子模块、Git LFS、签名提交、钩子或多远端。它也不显示完整的提交图。在复杂仓库中，这些限制很重要。对于常见的浏览器项目——静态页面、React 原型、教学示例或小型工具——这三个操作正好覆盖了标签页之外真正需要完成的部分。',
          },
          {
            heading: '3. 创建范围合适的令牌',
            body: 'GitHub 同步使用个人访问令牌，而不是密码，也不是 GB Coder 账户。经典令牌需要 repo 范围。细粒度令牌需要 Contents 的读写权限，并且可以限制到单个仓库。更窄的选项是更好的默认值：如果令牌泄露，损害会被限制在它能访问的项目内。连接界面会链接到 GitHub 的令牌页面，并解释这两种选择。粘贴令牌，选择是否在此设备上记住它，然后点击 Connect。GB Coder 会通过获取账户和仓库列表来验证令牌，然后显示登录名和剩余 API 速率限制。在确认 Push 或创建仓库之前，不会向仓库写入任何内容。请像对待密码一样对待令牌：不要粘贴到 issue、聊天或截图中，不再需要时在 GitHub 上撤销。设置过期时间并只访问一个仓库的令牌，是这套流程中合理的折中。',
          },
          {
            heading: '4. 第一次 Push：实际会上传什么',
            body: 'Push 标签页会要求选择仓库、分支、提交信息，以及一个可选项：删除项目中不存在的文件。在任何内容离开浏览器之前，面板会显示文件数量和总大小。这个预览很有用，因为上传并不是把编辑器标签页原样倒出去。GB Coder 使用与 ZIP 导出和部署相同的归档构建器。简单的 HTML/CSS/JavaScript 项目会变成 index.html、style.css、script.js 和 README。React 或 Vue 项目会变成 Vite 结构的仓库，包含 index.html、package.json、vite.config.js、.gitignore、README，以及 src/ 下的源文件。依赖目录和构建输出不会包含在内。提交信息可以编辑，默认是“Update from GB Coder”。删除缺失文件的选项默认关闭；只有当仓库应精确镜像当前项目时才打开，因为它会删除本地已不存在的远端文件。首次 Push 时，除非你刻意想要单独的分支，否则选择仓库的默认分支。',
          },
          {
            heading: '5. 原子提交与跳过未更改文件',
            body: '朴素的浏览器同步会一次提交一个文件。这会产生嘈杂的历史，而且如果请求中途失败，仓库会停留在只更新了一半的状态。GB Coder 改用 GitHub 的 Git Data API：上传 blob，在分支当前树之上构建树，创建一个提交，然后移动分支引用。结果是每次 Push 只有一个原子提交，包括删除选项请求的删除。第二个优化更安静，但同样重要。Git 用 SHA-1 哈希标识文件内容，浏览器可以用 WebCrypto 在本地计算该哈希。GB Coder 在上传前把本地文件与目标树进行比较。未更改的文件不消耗 API 调用，没有任何变化的 Push 会返回“already up to date”，而不是创建空提交。这让历史保持可读，并把 API 预算留给真正的更改。在小项目中差别看不出来；在拥有几十个文件的项目中，这就是干净同步与缓慢嘈杂同步的区别。',
          },
          {
            heading: '6. 不离开浏览器创建仓库',
            body: 'New repo 标签页会在已连接的账户中创建仓库。你提供名称和可选描述，选择公开或私有，并决定 GitHub 是否用 README 初始化仓库。初始化默认开启，因为空仓库没有可供首次 Push 构建的分支头。GB Coder 使用这个种子提交，用项目自己的文件替换 README，并记录初始提交。关闭初始化时，它会自行创建根提交和默认分支引用。创建后，新仓库和默认分支会被选中用于下一次 Push，因此没有第二轮设置。这是从想法到私有、受版本控制的仓库的最短路径。它适用于课堂作业、需要保持私密的客户演示，或需要为 CI 服务提供 URL 的原型。仓库属于持有令牌的 GitHub 账户，而不是 LadeStack，之后可以在 GitHub 上管理、转移或删除。',
          },
          {
            heading: '7. 把仓库拉回编辑器',
            body: 'Pull 是返程。输入仓库 URL 或 owner/name 组合，选择分支，GB Coder 会读取分支树。它会导入编辑器能够有意义地打开的文本文件：源代码、JSON、Markdown、配置和 SVG 等。它会跳过 node_modules、dist、build、.git、.next 和 coverage 目录。Pull 还限制为 200 个文件、每个文件 512 KB；如果分支超过任一限制，面板会说明有多少文件被排除，而不是悄悄丢弃。行尾会被规范化，因此 Windows 创建的文件不会看起来每一行都变了。导入的文件不会立即覆盖项目。它们会经过与 ZIP 导入相同的审查和应用流程，因此你可以在确认更改前检查检测到的结构，并在之后撤销。因此，Pull 适合在另一台设备上继续工作、在编辑前检查仓库，或在浏览器存储被清除后恢复项目。它是导入，不是合并；如果当前项目和分支已经分叉，请仔细检查结果。',
          },
          {
            heading: '8. 冲突、速率限制与明确的失败方式',
            body: '最重要的安全特性是：当你在编辑时远端分支发生移动，会发生什么。GB Coder 更新分支引用时禁用了 force。如果期间有人 Push，GitHub 会拒绝更新，面板会报告冲突，而不是悄悄丢弃对方的工作。解决方式刻意保持手动：把最新分支 Pull 到项目中，检查文件后再次 Push，或者转到桌面 Git 客户端进行真正的合并。其他失败会被区分，以便根据消息采取行动。失效令牌会产生认证错误并提示重新连接。速率限制会显示 GitHub 配额何时重置；API 对已认证用户允许每小时 5,000 次请求，而一次 Pull 每个文件消耗一次请求。仓库或分支不存在会产生 not-found 错误。请求在 60 秒后超时，长时间操作可以从面板取消。这些细节并不华丽，但它们决定了同步工具是值得信任，还是以模糊的方式失败。',
          },
          {
            heading: '9. 令牌安全：默认仅限当前会话',
            body: '令牌是高价值凭据。拥有写权限的 GitHub 令牌可以更改它能访问的每个仓库。默认情况下，GB Coder 把粘贴的令牌保存在模块作用域的 Map 中，这意味着关闭标签页后它就会消失，而且永远不会写入 localStorage。“Remember on this device”选项是明确的 opt-in。启用后，如果页面处于安全上下文，令牌在存储前会用 AES-GCM 和每次安装随机生成的密钥密封。这可以防止令牌以可读形式出现在浏览器配置文件备份、同步配置文件、共享机器、开发者工具截图或支持包中。它无法防止能在同一源上运行的脚本，因为这样的脚本可以调用同一个存储模块。任何纯浏览器设计都无法完全解决这一点。因此实际控制手段是范围、过期和撤销：使用限制在所需仓库的细粒度令牌，设置过期时间，并在工作完成后在 GitHub 上删除令牌。GitHub 流量从浏览器直接发往 api.github.com；LadeStack 不需要持有凭据。浏览器存储仍然不是备份，因此仓库也是合理的设备外副本。',
          },
          {
            heading: '10. 这套流程何时够用，何时不够',
            body: 'GitHub 同步足以覆盖很大一部分浏览器项目：静态站点、React 或 Vue 原型、课堂练习、小型内部工具，或需要远端和部署来源的演示。它适合想在不安装 Git 的情况下进行版本管理的独立开发者、需要可复现交接的教师，以及在任何没有终端的机器上工作的人。它不足以应对包含子模块的 monorepo、依赖 Git LFS 的仓库、需要签名提交或详细审查提交历史的团队，或基于钩子和多远端的发布流程。那些是桌面 Git 的工作，假装不是只会让浏览器工作流更糟。有用的模式是混合式。先在浏览器中开始，因为首次预览是即时的。当项目形成值得保留的形态时 Push。当工作需要原生工具、更深入的调试器或完整 Git 工作流时，在桌面打开同一个仓库。回到浏览器时，通过 GitHub Pull 更改。文件是普通源文件，所以交接是版本控制，而不是迁移。要尝试浏览器这一半，打开 /app/projects 的 Projects Dashboard，创建项目，打开 GitHub sync，并 Push 第一次提交。完整设置和功能参考见文档。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: '阅读完整的 GB Coder 文档 →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: '从浏览器 IDE 部署到 Vercel 或 Netlify',
        description: '浏览器 IDE 部署全解析：提供商令牌、静态上传、Vercel 构建、稳定网址、限制、安全、重新部署和故障处理。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['部署', 'Vercel', 'Netlify', '浏览器 IDE', '静态站点'],
        intro: '部署是浏览器项目从预览走向公开的瞬间。在此之前，代码住在标签页里，文件属于某个浏览器配置文件，能打开结果的只有构建它的人。Vercel 和 Netlify 解决了托管问题，但它们惯常的工作流假设你有 Git 仓库、终端，或者会拖放文件夹。GB Coder 走了一条更短的路：Deploy 按钮打包当前项目，用你的账户令牌通过提供商 API 发送，然后返回一个可访问的 HTTPS 网址。本文详细解释这条路径：上传了什么、如何跟踪部署、第二次部署为什么能落在同一地址，以及边界在哪里。这不是 Vercel 或 Netlify 的通用指南，而是浏览器面板实际行为的说明。',
        sections: [
          {
            heading: '1. 为什么要在浏览器里部署',
            body: '最明显的情况是机器不方便或禁止安装 CLI。Chromebook、学校机房电脑或受管控的公司桌面可以打开浏览器标签页，却不一定能装 Node.js、Git 和提供商 CLI。浏览器 IDE 已经在编辑环节去掉了这些要求。部署通常是最后一步，会把开发者送回终端；把它留在同一个标签页里，闭环就形成了：编辑、预览、发布都不需要本地工具链。第二种情况是速度。落地页、原型或客户演示可能先需要网址，再需要仓库或 CI 流水线。浏览器面板发布当前快照并告诉你它在哪上线。便利有边界。这是直接上传，不是部署流水线。它不监听分支、不运行测试，也不在环境之间提升构建；那些工作属于提供商的 Git 集成或 CI。浏览器路径服务于第一个网址，而不是整个发布流程。',
          },
          {
            heading: '2. 一键部署实际做了什么',
            body: 'Deploy 对话框是覆盖在两个提供商 API 之上的轻量控制层。点击 Deploy now 时，GB Coder 生成与 Download ZIP 相同的文件包。这个细节很重要：不存在另一条可能漏掉样式表或忘记外部库的打包路径。普通项目会变成 index.html、style.css、script.js 和 README。React 或 Vue 项目会变成 Vite 结构的文件树，包含 index.html、package.json、vite.config.js、.gitignore、README 以及 src/ 下的源码。对话框的包摘要会在任何内容离开标签页之前显示准确的文件数和未压缩大小。Vercel 在其部署端点以行内 JSON 接收文件。Netlify 以原始请求体接收 ZIP。Vercel 会构建或提供项目；Netlify 会把上传的文件作为手动部署发布。中间没有 LadeStack 服务器，你的机器上也不会运行 CLI。浏览器是客户端，提供商是主机，令牌是唯一凭证。一键描述的是界面，不是工作量：打包、上传、远程处理和 TLS 仍然按顺序发生。',
          },
          {
            heading: '3. 静态站点与 Vite 应用走不同的路',
            body: '文件包不同，是因为两类项目需要不同处理。普通 HTML/CSS/JavaScript 项目没有 package.json。Vercel 被指示不使用框架，并把文件作为静态站点提供。Netlify 会按原样发布 ZIP，这对静态文件同样适用。没有东西需要安装或编译，所以首次部署通常很快。React 或 Vue 项目包含生成的 package.json、Vite 配置和源码。在 Vercel 上，提供商会识别 Vite、安装依赖、运行生产构建并发布输出。这是真实的云端构建，不是浏览器里的模拟，所以可能需要一分钟以上。Vercel 使用的也是 package.json 中记录的版本，而不是编辑器里碰巧加载的版本。Netlify 的手动 ZIP 部署不会运行构建命令，因此同一个 Vite 源码树会按上传原样发布，而不会被编译。在 Netlify 上使用 React 或 Vue 时，请使用提供商的 Git 集成；Netlify 的一键路径只发布静态输出。外部库和注入设置已经反映在文件包中。如果 Vercel 构建依赖私有包、原生二进制或构建镜像无法访问的服务，即使本地预览正常，构建也会失败。日志会告诉你属于哪种情况。',
          },
          {
            heading: '4. 准备权限范围正确的令牌',
            body: '两个提供商都使用个人访问令牌认证。这不是提供商密码，也不是 GB Coder 账户。对话框会链接到所选提供商的令牌页面，并用通俗语言说明权限范围。Vercel 令牌可以向账户或团队能访问的所有项目发布；如果有团队范围的令牌，就用它。Netlify 令牌作用于账户能访问的站点，因此除非有更窄的选项，否则应把它视为账户级。为此用途创建令牌，设置尽可能短的有效期，并在项目不再需要时从提供商处撤销。GB Coder 在启用 Deploy now 前会检查令牌是否存在、文件包是否在本地限制内。令牌默认只保存在标签页内存中。Remember on this device 是可选操作：在安全上下文中，令牌会先用 AES-GCM 封装再写入 localStorage；否则对话框会警告，记住它将以明文存储。权限范围和撤销才是最重要的控制。',
          },
          {
            heading: '5. 第一次部署，按步骤来',
            body: '打开项目，然后从工具栏选择 Deploy；窄屏上它在溢出菜单里。默认选中 Vercel，Netlify 只差一次点击。项目名称会从当前项目预填。GB Coder 会把它转成小写，把无效字符换成连字符，并显示将要请求的主机名，例如 your-project.vercel.app。粘贴令牌，决定是否记住，然后检查文件包摘要。如果文件数或大小超限，对话框会说明问题并保持按钮不可用。点击 Deploy now。提供商会创建项目或站点，接收文件包并开始处理部署。部署就绪后，成功界面会显示公开网址、文件数量、上传大小、耗时，以及用手机打开页面的二维码。Copy URL 和 Visit site 用于交付，Build logs 打开提供商自己的日志视图。Netlify 站点名是全球唯一的，所以请求的名字可能已被占用。此时提供商会分配另一个名字，GB Coder 报告实际在线的地址，而不是你输入的那个。',
          },
          {
            heading: '6. 进度界面到底在显示什么',
            body: '进度条会经过打包、上传、构建、安全配置和就绪几个阶段。在 Netlify 上，“构建”标签表示提供商正在处理，并不代表运行构建命令。这是客户端报告，不是提供商的预测。百分比在前两个阶段快速上升，然后在提供商完成远程工作期间停在 100 以下。这是有意为之：远程工作时间无法预测，一个冲到 99% 的进度条只会撒谎。GB Coder 每 1.5 秒轮询提供商，并在状态变化时更新消息。上传请求有两分钟超时。面板在部署轮询三分钟后停止等待，并指向仪表板，因为即使浏览器不再盯着，部署也可能完成。取消、关闭对话框或按 Escape 会中断进行中的请求和轮询循环。如果提供商已经接受部署，部署可能在它那边继续；不要把取消当成回滚，先去仪表板确认。部署失败时，提供商的日志才是权威来源。',
          },
          {
            heading: '7. 重新部署、稳定网址与提供商状态',
            body: 'Deploy again 会回到表单，不会立刻重发上一个文件包。这很有用，因为项目可能已经改变、名称需要调整，或者令牌过期了。随后 Vercel 和 Netlify 会沿不同路径抵达同一地址。Vercel 针对命名项目创建部署，并以生产为目标。用相同项目名重复部署会更新该项目，而且生产别名优先于部署专属网址，所以你分享的地址通常保持稳定。Netlify 需要站点 ID 才能更新现有站点，而不是新建一个。GB Coder 会把该 ID 以清理后的站点名为键存进 localStorage。如果你清除了浏览器存储、换了浏览器、改了名字或在 Netlify 删除了站点，下一次部署就找不到旧站点，只能新建。因此重命名 Netlify 项目可能会把旧站点留在账户里。两家提供商都在仪表板中保留部署历史、自定义域名、访问控制和回滚；GB Coder 面板只暴露上传和公开网址。这里的每次部署都是生产部署，没有分支预览或环境选择器。',
          },
          {
            heading: '8. 值得提前考虑的限制与失败',
            body: '请求离开标签页前会执行两个限制：900 个文件和 64 MB 未压缩内容。它们低于提供商自身的上限，以免巨大上传在浏览器会话中途失败。媒体较多的站点应把大图和视频放在 CDN 或 Git 里，而不是项目文件包中。错误按原因区分。401 表示令牌被拒绝；403 通常表示缺少账户或团队权限；413 或 429 表示负载过大或提供商限流；422 表示项目被判为无效；5xx 通常是临时问题。在 Vercel 上，框架构建失败不一样：上传成功了，构建失败了，所以应该读日志，而不是粘贴新令牌。Vercel 构建如果需要环境变量，是另一道边界。部署对话框没有环境变量编辑器。请在 Vercel 的项目设置中配置值，然后再次部署；首次构建可能在项目创建之前就失败。Netlify 的手动 ZIP 路径没有构建步骤，因此这不适用。三分钟轮询上限不是部署失败，只是等待失败。',
          },
          {
            heading: '9. 安全、所有权与数据边界',
            body: '部署路径是直接的：浏览器用你的令牌调用 api.vercel.com 或 api.netlify.com。没有代理保存凭证，使用这个面板也不需要 LadeStack 账户。令牌默认仅限会话，只有在安全来源中选择记住时才用 AES-GCM 封装。这能防止令牌在浏览器配置文件备份或支持包中以可读形式出现，但不能防止标签页打开期间同源运行的恶意代码。使用可用的最窄令牌，设置过期时间，并在工作完成后从提供商处撤销。所有权跟随令牌：项目或站点创建在拥有它的提供商账户中，受该提供商条款、配额、日志和计费约束。GB Coder 仍然本地优先，但部署是把项目显式导出给提供商。提供商接收站点的源码，结果默认是公开 HTTPS 网址；密码保护、SSO 和自定义域名属于提供商功能。如果浏览器配置文件是项目唯一存放处，请保留 ZIP 或 GitHub 副本。',
          },
          {
            heading: '10. 什么时候适合从浏览器部署',
            body: '当任务是把小站点快速上线时，用这条路径：落地页、作品集、课堂演示、供客户评审的原型或静态文档页。项目已经在 GB Coder 里，而替代方案是导出 ZIP、打开终端、在别人的机器上配置 CLI 时，它也很合适。它不适合单体仓库、带数据库的服务端渲染应用、需要私有仓库凭证的构建、通过分支预览和审批发布的团队，或超出上传限制的资源。那些属于提供商的 Git 集成、CI 流水线或桌面环境。两种方式可以共存：在浏览器里起草和迭代，当项目值得保留历史时把源码推送到 GitHub，让 CI 发布生产构建。实用流程很短：在手机宽度检查预览，查看文件包摘要，部署，在第二台设备上打开公开网址，保存构建日志。想尝试的话，打开 /app/projects 的项目仪表板，创建或打开项目，然后选择 Deploy。设置参考在文档中。',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: '阅读 GB Coder 完整文档 →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: '浏览器 IDE 中的 API 密钥与环境变量安全指南',
        description: '浏览器 IDE 中 API 密钥与环境变量的处理指南：客户端暴露、安全存储、权限范围、轮换、部署与泄露响应。',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['安全', 'API 密钥', '环境变量', '浏览器 IDE', '最佳实践'],
        intro: '每个浏览器 IDE 最终都会面对同一个问题：密钥放在哪里？项目需要 API 端点，AI 面板需要提供商密钥，部署需要账户令牌。在桌面环境中，这些值可以放在 shell 配置文件或未被跟踪的文件里。在浏览器标签页中，边界不同。随页面一起发送的内容可以被页面读取，保存在浏览器配置文件中的内容属于该配置文件。本指南给出一个实用模型：哪些值可以公开，哪些绝不能到达客户端，GB Coder 如何处理提供商凭据，以及密钥泄露后该怎么办。它面向希望享受浏览器 IDE 便利、又不把标签页当成秘密保险箱的人。',
        sections: [
          {
            heading: '1. 浏览器标签页是公开的构建目标',
            body: '第一条规则令人不适但很简单：静态 Web 应用无法保存秘密。浏览器下载 HTML、CSS 和 JavaScript，然后在用户的机器上执行。任何人都可以打开 DevTools、查看网络面板、搜索打包文件，或者设置断点检查变量。压缩代码、拆分成块、把值藏进配置文件，改变的只是难度，不是结果。浏览器 IDE 为运行项目代码增加了沙箱，但 IDE 自身的界面仍运行在同一源上，必须读取它运行所需的内容。沙箱不是界面自身所用值的保险箱。有用的判断标准很直接：如果标签页中运行的代码必须能访问某个值，就假定使用标签页的人也能读取它，并假定同一源上运行的任何脚本也能读取它。这并不意味着浏览器开发不安全，而是在定义边界。公开标识符可以放在那里，服务器凭据不行。',
          },
          {
            heading: '2. 静态应用中的环境变量意味着什么',
            body: '在 Node.js 服务器中，环境变量在运行时从进程中读取。在 Vite、Create React App、Next.js 或 Astro 的构建中，公开环境变量的工作方式不同：打包器在构建时把引用替换为字面量字符串。Vite 通过 import.meta.env 暴露带 VITE_ 前缀的变量；Create React App 使用 REACT_APP_；Next.js 使用 NEXT_PUBLIC_；Astro 使用 PUBLIC_。前缀是命名约定，不是安全控制。值一旦被内联，就会成为每位访客下载的 JavaScript 的一部分。没有公开前缀的变量通常无法被客户端代码使用，因此仅限服务器的值必须由服务器或无服务器函数读取，而不是由静态页面读取。.env 文件是开发和构建的输入，不是运行时秘密存储。它适合本地配置和让值远离版本控制，但不会在构建后让值变为私有。',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. 哪些密钥可以放在浏览器中',
            body: '有些密钥本来就是公开的。Stripe 可发布密钥用于标识账户并创建支付令牌；秘密密钥真正移动资金，必须留在服务器上。Supabase anon 密钥只有在行级安全策略正确时才安全。Firebase Web 配置标识项目，但不授予管理访问权限。地图和分析密钥通常按域名或 API 限制。这些值可以发送到浏览器，但仍需要限制：允许的来源、API 限制、最小权限角色、配额和告警。相反的类别更容易说明。服务角色密钥、数据库密码、SMTP 凭据、签名密钥和 AI 提供商的私钥绝不能出现在静态打包文件中。属于应用本身的提供商密钥尤其危险：任何找到它的人都能花应用的钱。属于用户的密钥是另一种情况。它仍是 bearer 凭据，但归用户所有，目标是把它留在用户的浏览器中，而不是项目或仓库里。',
          },
          {
            heading: '4. GB Coder 如何处理提供商凭据',
            body: 'GB Coder 的 AI 面板采用 bring-your-own-key 模式。密钥管理器默认将提供商密钥保存在内存中，不写入 localStorage。用户可以明确选择持久化到 sessionStorage，这会把值限制在当前标签页，通常会在标签页关闭时清除。用户清除密钥时，它会从内存和会话存储中移除。管理器还会把每个密钥绑定到已授权的端点源，出站网关会检查凭据不会被发送到未获批准的目标。提供商错误会经过脱敏层，在消息到达界面或日志之前移除密钥模式和活动密钥。自定义提供商元数据保存在 localStorage 中，但标记为秘密的请求头会在持久化前被清除，必须重新输入。请求直接从浏览器发往提供商的端点；GB Coder 不会通过 LadeStack 服务器代理密钥。这些措施减少了意外持久化和跨源泄露，但不会改变基本规则：任何能在同一源上运行的脚本，都能读取页面能读取的内容。处理敏感工作时使用干净的配置文件，不要安装不受信任的扩展程序。',
          },
          {
            heading: '5. 项目秘密、.env 文件与构建时内联',
            body: '把秘密留在项目目录之外。将 .env 及其本地变体加入 .gitignore，并提交只含占位符名称的 .env.example。如果项目使用 Vite，请记住每个 VITE_ 变量都会被内联到生产打包文件中。本地开发时方便的值，一旦用于生产构建就会公开。部署前检查生成的资源中是否有密钥模式，发现后要当作事件处理，而不是警告。GitHub 的秘密扫描和推送保护可以捕获一些已知令牌格式，但它们只是兜底，不能替代把值留在仓库之外。浏览器 IDE 的 ZIP 导出包含项目文件。如果项目中有 .env 文件，它会随备份一起移动。备份不是加密保险箱。把导出文件存放在私密位置，并在不再需要时删除旧副本。截图、问题报告和聊天消息也是如此：粘贴到其中任何一个地方的密钥都已经离开了浏览器。',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. GitHub 令牌与部署令牌',
            body: 'GitHub 个人访问令牌和部署令牌比看起来更强大。带有 repository 和 workflow 范围的经典令牌可以读取私有代码、修改文件并触发发布。优先使用细粒度令牌，限定单个仓库、明确的权限列表和到期日期。只给令牌分配任务所需的权限：同步只需要 contents 读写，不需要 administration 或 billing。为不同设备或用途创建不同令牌，完成后撤销。Vercel 或 Netlify 的部署令牌可以发布、替换或删除项目。如果提供商支持项目或团队范围，就使用它；如果支持过期时间，就设置一个。只在需要时把令牌粘贴到部署面板，不要把它保存在项目文件中。在 CI 中，使用仓库或组织秘密，而不是提交 .env，并记住来自 fork 的 pull request 通常不会获得秘密。被截图、在聊天中分享或提交到公开仓库的令牌，即使在下一秒删除，也应视为已泄露。',
          },
          {
            heading: '7. AI 提供商密钥：没有意外的 BYOK',
            body: 'AI 提供商密钥是附带账单的 bearer 凭据。任何持有它的人都可以发送请求、消耗配额并产生费用。使用限定到项目的密钥，在提供商支持时设置支出上限，并使用单独的实验密钥而不是组织的主密钥。定期检查用量，尤其是在共享设备或安装新扩展程序之后。Ollama、LM Studio 和 vLLM 等本地提供商不需要云密钥，但它们的端点仍是机器上的服务。不要为了让演示运行就把本地端点暴露到公网。如果自定义提供商指向代理，代理可以看到密钥；只使用你控制并理解的代理。提示注入是相关风险：文件、网页或粘贴的错误消息可能包含针对助手的指令。把秘密留在提示之外，也不要放进允许助手读取的文件中。如果密钥出现在对话中，请轮换它。',
          },
          {
            heading: '8. 共享电脑、扩展程序与 XSS',
            body: '共享或实验室电脑需要不同的流程。使用私密浏览器配置文件，不要选择会话持久化，完成后关闭标签页。如果浏览器提出保存密钥，请拒绝。如果怀疑密钥被保留，清除站点存储。浏览器扩展也是边界的一部分：拥有广泛主机权限的扩展通常可以读取页面内容或存储，恶意更新也可能在安装后到来。处理凭据时使用最小化配置文件。在这种场景下，跨站脚本是典型的 Web 风险。如果攻击者能在 IDE 的源上运行脚本，该脚本就能读取 localStorage 和 sessionStorage，并在页面打开期间发送请求。保持依赖更新，避免不受信任的第三方脚本，并考虑在部署站点上使用内容安全策略。剪贴板管理器和屏幕共享工具也会看到你复制和显示的内容。移动密钥后清除剪贴板，在打开提供商设置面板前暂停共享。',
          },
          {
            heading: '9. 轮换泄露的密钥',
            body: '轮换是应对密钥泄露的唯一可靠方法。先撤销很重要：如果在准备新密钥时旧密钥仍然有效，暴露就会继续。用最窄的可用范围创建新密钥，更新应用或浏览器设置，如果该值是构建的一部分就重新部署，并验证旧密钥已被拒绝。然后检查提供商的使用量和审计日志，寻找意外活动。如果密钥已提交到 Git，仅仅删除文件是不够的，值仍留在历史中。先轮换，再用 git filter-repo 或 BFG 等工具重写历史，与团队达成一致后强制推送，并请协作者重新克隆。托管平台可能缓存旧构建，因此要确保旧值无法从过时的打包文件中提供。如果密钥被粘贴到 AI 聊天、支持工单或截图中，假定它已被保留并轮换。最后，记录发生了什么，添加本可以捕获它的检查，并缩短下一个密钥的有效期。',
          },
          {
            heading: '10. 实用检查清单',
            body: '在项目离开浏览器之前，按这个顺序检查。第一，对每个值分类：公开标识符、用户凭据或服务器秘密。第二，把服务器秘密留在静态打包文件之外，放到无服务器函数或 API 后面。第三，只暴露需要公开前缀的值，并在部署前检查构建产物。第四，让 .env 文件远离 Git，提交 .env.example，并启用秘密扫描。第五，为 GitHub 和托管创建有范围、会过期的令牌，每个用途一个。第六，在 GB Coder 中，除非在可信设备上，否则让密钥留在内存中；只有理解权衡时才选择会话持久化。第七，绝不把密钥粘贴到提示、问题、截图或项目文件中。第八，有任何疑问就轮换，并在替换前撤销。第九，在共享机器上使用干净的浏览器配置文件。第十，在需要之前写下泄露应对计划。只要把浏览器当作公开客户端而不是私人保险箱，浏览器 IDE 就能负责任地处理凭据。',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'Браузерная IDE или десктопная: что выбрать?',
        description: 'Практическое сравнение браузерной и десктопной IDE: установка, производительность, расширения, отладка, Git, офлайн-работа, безопасность и выбор.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Браузерная IDE', 'Десктопная IDE', 'Инструменты разработчика', 'Веб-разработка', 'Сравнение'],
        intro: 'Десктопная IDE так долго была вариантом по умолчанию, что многие разработчики перестали задавать вопрос. Поставить редактор, добавить расширения, настроить среду выполнения, склонировать репозиторий и только потом написать первую строку. Браузерная IDE предлагает другой порядок: открыть вкладку, создать проект и начать печатать, пока окружение собирается само. Это не ситуация, где одна сторона побеждает полностью. Браузерная IDE убирает установку и делает работу переносимой, но наследует ограничения браузерной песочницы. Десктопной нужны установка и место на диске, зато она добирается до нативных инструментов, расширений и локального железа. В этом сравнении рассматриваются параметры, которые действительно меняют решение, а GB Coder служит примером браузерной стороны, потому что два его режима покрывают оба конца спектра.',
        sections: [
          {
            heading: '1. Что считать браузерной IDE',
            body: 'Браузерная IDE — это редактор, который работает внутри веб-страницы и открывает или хранит проект без установки на компьютер. В категории сосуществуют два очень разных продукта. Первый — статическая мастерская: панели HTML, CSS и JavaScript с живым предпросмотром и без менеджера пакетов. Второй — полноценная среда выполнения, где система на базе WebAssembly вроде WebContainer запускает Node.js, npm и сервер разработки прямо во вкладке. GB Coder предлагает оба: Static Editor для работы без зависимостей и Advanced IDE для React, Vue и обычных npm-проектов. Это различие важно для всех дальнейших сравнений. Статический редактор конкурирует с черновиком, полноценная браузерная IDE — с лёгкой десктопной настройкой. Судить все браузерные IDE по статической версии — то же самое, что судить десктопные по текстовому редактору с подсветкой синтаксиса.',
          },
          {
            heading: '2. Где десктопная IDE по-прежнему сильнее',
            body: 'Для больших и долгоживущих систем десктопная IDE остаётся более сильным выбором. Она запускает нативные компиляторы, мобильные эмуляторы, клиенты баз данных, Docker и языковые серверы, которые анализируют весь монорепозиторий. Магазины расширений дают отладчики, инструменты фреймворков, линтеры и интеграции, у которых нет браузерных аналогов. Локальные файлы не подчиняются квоте хранилища, а машина с достаточным объёмом RAM держит огромное дерево зависимостей и несколько сервисов одновременно. Офлайн-работа здесь норма, а не исключение, а расширения удалённой разработки позволяют тонкому ноутбуку управлять мощным сервером. Ничего из этого не устарело. Если ежедневная работа включает нативный SDK, бэкенд из нескольких сервисов или репозиторий с сотнями пакетов, десктопная IDE — не ностальгическая привычка, а инструмент под задачу.',
          },
          {
            heading: '3. Установка и время до первого предпросмотра',
            body: 'Самая заметная разница проявляется до того, как появился код. Десктопная настройка обычно означает установку редактора, среды выполнения, менеджера пакетов, расширений и зависимостей проекта, а затем ожидание первой сборки. На новой машине это может занять полдня. Браузерная IDE сокращает последовательность: открыть сайт, выбрать шаблон или пустой проект, и первый предпросмотр появляется сразу. GB Coder создаёт рабочее пространство в IndexedDB, поэтому нет ни аккаунта, ни загрузки, ни обращения к серверу. Оговорка в том, что само приложение должно загрузиться, а продвинутый режим требует современного браузера с SharedArrayBuffer и изоляцией источников. Для класса, одолженного ноутбука, Chromebook или быстрой демонстрации клиенту разница решающая. Для разработчика с уже настроенной рабочей станцией затраты на установку одноразовые и весят меньше.',
          },
          {
            heading: '4. Производительность, память и пределы среды',
            body: 'Десктопная IDE использует процессор и память напрямую. Браузерная работает внутри вкладки, а вкладка — это управляемая песочница со своим потолком памяти. Для типичного приложения на Vite этого потолка хватает с запасом, но он не бесконечен. Установка очень большого дерева зависимостей, несколько вотчеров или сборка огромного монорепозитория могут исчерпать вкладку или вызвать перезагрузку. WebContainer также не запускает нативные бинарники, образы Docker и инструменты, скомпилированные под хост-систему. Поэтому честное сравнение зависит от нагрузки. Для лендинга, панели управления, библиотеки компонентов или небольшого full-stack прототипа браузерная IDE неотличима от локальной разработки. Для проекта с движком базы данных, Python-сервисом или нативным модулем десктоп остаётся практичной средой. Батарея подчиняется той же логике: вкладка легче полной IDE с десятком фоновых сервисов, но долгая сессия WebContainer всё равно расходует энергию.',
          },
          {
            heading: '5. Интеллект редактора и расширения',
            body: 'Качество редактора больше не слабое место браузера. GB Coder использует Monaco — тот же открытый движок, на котором работает VS Code, поэтому доступны автодополнение, встроенная документация, проверка синтаксиса, сопоставление скобок, мультикурсорное редактирование и настраиваемые сочетания клавиш. TypeScript, JavaScript, HTML, CSS и JSON получают языковые сервисы, а просмотрщик различий позволяет проверить изменения до применения. Чего браузерной IDE не хватает, так это экосистемы расширений. Здесь нет магазина для специализированного языкового плагина, инспектора фреймворка или собственного отладчика. Часть функций встроена, часть не нужна небольшим проектам, но разработчик, зависящий от конкретного расширения, почувствует пробел. Взамен меньше обслуживания: браузерный редактор приходит уже настроенным, а десктопный становится мощным только после того, как его привели в порядок.',
          },
          {
            heading: '6. Терминал, пакеты и конвейер сборки',
            body: 'Терминал — это функция, которая отличает настоящую браузерную IDE от онлайн-площадки для кода. В Advanced IDE GB Coder среда WebContainer предоставляет runtime Node.js, npm install разрешает реальные пакеты, скрипты npx выполняются, а сервер Vite стартует на порту, который перенаправляется в предпросмотр. Терминал здесь — оболочка xterm.js с выводом ANSI и историей команд, а не имитация панели логов. Этого достаточно для обычного фронтенд-конвейера: установка, разработка, сборка и тесты на стандартных JavaScript-инструментах. Этого не хватает для нативных аддонов, Docker Compose или production-базы данных. Десктопная IDE запускает весь стек, включая сервисы, с которыми общается фронтенд. Практическое правило простое: если цепочка инструментов полностью на JavaScript, браузер, вероятно, справится; если она уходит в нативный код или контейнеры, десктоп надёжнее.',
          },
          {
            heading: '7. Отладка: контекст браузера против нативных инструментов',
            body: 'У браузерных IDE есть недооценённое преимущество в отладке: код, предпросмотр и инструменты разработчика находятся в одном контексте. Изменение CSS видно сразу, виртуальная консоль собирает логи рядом с предпросмотром, а QR-код открывает страницу на настоящем телефоне и выявляет проблемы касания и вьюпорта. GB Coder также предлагает пресеты вьюпорта и открепляемый предпросмотр для второго монитора. Десктопные IDE выигрывают в глубине. Они подключают отладчики к процессам Node, ставят точки останова между сервисами, профилируют память и процессор, исследуют нативные потоки и интегрируются с мобильными эмуляторами. Для визуальной фронтенд-работы браузерный цикл короче. Для тонкой гонки в серверном процессе десктопный отладчик — лучший инструмент. Большинству разработчиков нужны оба вида обратной связи, поэтому гибридный процесс в конце статьи имеет значение.',
          },
          {
            heading: '8. Файлы, контроль версий и резервные копии',
            body: 'Хранение — точка, где браузерная и десктопная модели расходятся сильнее всего. Десктопный проект лежит в папке, которую может прочитать любой инструмент. Браузерный живёт в IndexedDB: быстро и приватно, но привязано к профилю браузера и уязвимо к очистке хранилища. GB Coder смягчает это именованными снимками, просмотрщиком различий, экспортом ZIP с хешем целостности и импортом со структурным предпросмотром. Синхронизация с GitHub использует личный токен доступа, собирает отправку в один атомарный коммит, пропускает неизменённые файлы и сообщает о конфликте, если удалённая ветка ушла вперёд. Десктопный Git остаётся полнее: хуки, субмодули, rebase, несколько удалённых репозиториев и CLI, который понимает любая CI-система. Браузерного процесса достаточно для небольшого проекта, и он удивляет возможностями solo-разработчика, но не заменяет полноценный Git-клиент в сложном репозитории. Экспорт в GitHub или ZIP — мост между двумя мирами.',
          },
          {
            heading: '9. Безопасность, приватность и стоимость',
            body: 'Браузерная IDE соединяет риск и удобство в одном месте. GB Coder придерживается локального подхода: проекты хранятся в браузере, аккаунт не нужен, продукт бесплатный и без рекламы. Данные покидают устройство только при использовании подключённой функции — провайдера ИИ, синхронизации с GitHub, деплоя или CDN, на который ссылается проект. ИИ работает по модели bring-your-own-key: запросы и выбранный код отправляются настроенному вами провайдеру. GitHub и деплой на Vercel или Netlify используют ваши токены, и они действуют только в рамках сессии, если не включить зашифрованное хранение. Такая модель даёт разработчику контроль, но также означает, что без резервной копии браузерное хранилище — единственный экземпляр. Десктопная IDE держит файлы на диске и обычно наследует систему резервного копирования и разрешений ОС. Ни один вариант не безопаснее автоматически; вопрос в том, у кого данные и что случится, если устройство или профиль исчезнут.',
          },
          {
            heading: '10. Как выбрать и как совместить',
            body: 'Выбирайте браузерную IDE, когда работа визуальная, короткая или должна быть переносимой: изучение HTML и CSS, прототипирование интерфейса, преподавание, просмотр дизайна на Chromebook или небольшое приложение React либо Vue без установки инструментов. Выбирайте десктопную IDE, когда работа долгая и тяжёлая: монорепозиторий, нативные SDK, Docker, мобильные сборки, большой набор расширений или офлайн-разработка в закрытой сети. Самый интересный ответ — совмещать. Начните в браузере, потому что первый предпросмотр появляется сразу. Проверьте макет на ширине телефона. Сделайте снимок. Отправьте в GitHub или экспортируйте ZIP. Откройте тот же репозиторий на десктопе, когда понадобится нативный инструмент, более глубокий отладчик или полный Git-процесс. Файлы стандартные, поэтому переход — это обычный контроль версий, а не миграция. GB Coder рассчитан на первую половину цикла и не запирает проект в браузере. Чтобы проверить браузерную сторону решения, откройте панель проектов и создайте пустое рабочее пространство; сравнение станет конкретным примерно за минуту.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Читать полную документацию GB Coder →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'Синхронизация с GitHub в браузерной IDE: практический гайд',
        description: 'Как работает синхронизация с GitHub в браузерной IDE: токены, атомарные коммиты, пулы, конфликты, лимиты файлов и безопасность.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Контроль версий', 'Браузерная IDE', 'Git', 'Рабочий процесс'],
        intro: 'Браузерные IDE хорошо убирают настройку. Но они не так хороши в следующем шаге: дать работе постоянное место за пределами профиля браузера. Обычно именно здесь появляется терминал: git init, remote add, commit, push. Синхронизация с GitHub в браузерной IDE сжимает эту последовательность до одной панели, но это не магия и не полноценный Git-клиент. Это точечный мост между проектом в хранилище браузера и репозиторием на GitHub. В этом руководстве объясняется, как мост работает в GB Coder, что именно загружается, как обрабатываются конфликты и токены, и где рабочий процесс с Git на десктопе по-прежнему лучше.',
        sections: [
          {
            heading: '1. Зачем браузерной IDE нужен GitHub',
            body: 'Браузерный проект удобен именно тем, что ему не нужны папка, среда выполнения и установка. Это же свойство является его слабостью. Проекты живут в профиле браузера, который может очистить утилита, который теряется вместе с устройством или остаётся позади при смене компьютера. Экспорт в ZIP создаёт копию, но ZIP — это снимок без истории и общего remote. GitHub даёт недостающий слой: репозиторий вне устройства, историю коммитов, место для совместной работы и естественный источник для CI или развёртывания. Это меняет роль браузерной IDE. Она перестаёт быть одноразовым блокнотом и может стать местом, где небольшой проект пишется, проверяется и передаётся. Процесс особенно полезен на Chromebook, школьной машине или заблокированном корпоративном ноутбуке, где установить Git невозможно. Он также подходит для быстрого прототипа, который позже может переехать в десктопный репозиторий. Браузер делает первый черновик, GitHub делает его долговечным.',
          },
          {
            heading: '2. Что синхронизация делает, а что нет',
            body: 'GB Coder предлагает три действия GitHub: Push, New repo и Pull. Push записывает текущий проект в существующий репозиторий и ветку. New repo создаёт репозиторий в подключённой учётной записи GitHub и фиксирует проект как его начальное содержимое. Pull читает ветку и импортирует текстовые файлы в редактор. Все запросы идут напрямую из браузера на api.github.com; сервер LadeStack не стоит посередине и не хранит токен. Узкий охват выбран намеренно. Панель не заменяет командную строку Git. Она не предоставляет rebase, разрешение конфликтов слияния, сабмодули, Git LFS, подписанные коммиты, хуки или несколько remote. Она также не показывает полный граф коммитов. Эти ограничения важны для сложного репозитория. Для обычного браузерного проекта — статической страницы, прототипа на React, учебного примера или небольшой утилиты — три операции покрывают то, что действительно должно происходить за пределами вкладки.',
          },
          {
            heading: '3. Создание токена с правильной областью доступа',
            body: 'Синхронизация с GitHub использует токен личного доступа, а не пароль и не учётную запись GB Coder. Классическому токену нужна область repo. Fine-grained токену нужен доступ на чтение и запись к Contents, и его можно ограничить одним репозиторием. Более узкий вариант — лучший выбор по умолчанию: если токен утечёт, ущерб ограничится проектами, к которым он имеет доступ. Экран подключения ведёт на страницу токенов GitHub и объясняет оба варианта. Вставьте токен, решите, запоминать ли его на устройстве, и нажмите Connect. GB Coder проверяет его, получая учётную запись и список репозиториев, затем показывает логин и оставшийся лимит API. Ничего не записывается в репозиторий до подтверждения Push или создания репозитория. Относитесь к токену как к паролю: не вставляйте его в issue, чат или скриншот и отзывайте на GitHub, когда он больше не нужен. Токен со сроком действия и доступом к одному репозиторию — разумный компромисс для этого процесса.',
          },
          {
            heading: '4. Первый Push: что именно загружается',
            body: 'Вкладка Push запрашивает репозиторий, ветку, сообщение коммита и один необязательный параметр: удалять файлы, которых нет в проекте. Прежде чем что-либо покинет браузер, панель показывает количество файлов и общий размер. Этот предпросмотр полезен, потому что загрузка — не сырой дамп вкладок редактора. GB Coder использует тот же сборщик архива, что и экспорт ZIP и развёртывание. Простой проект HTML/CSS/JavaScript превращается в index.html, style.css, script.js и README. Проект React или Vue становится репозиторием со структурой Vite: index.html, package.json, vite.config.js, .gitignore, README и исходные файлы в src/. Папки зависимостей и результаты сборки не включаются. Сообщение коммита можно редактировать, по умолчанию оно равно «Update from GB Coder». Опция удаления отсутствующих файлов по умолчанию выключена; включайте её только если репозиторий должен точно отражать текущий проект, потому что она удаляет удалённые файлы, которых больше нет локально. Для первого Push выберите ветку по умолчанию, если только вам намеренно не нужна отдельная ветка.',
          },
          {
            heading: '5. Атомарные коммиты и пропуск неизменённых файлов',
            body: 'Наивная браузерная синхронизация коммитит по одному файлу. Это создаёт шумную историю и оставляет репозиторий наполовину обновлённым, если запрос срывается в середине. GB Coder вместо этого использует GitHub Git Data API: загружает blob-объекты, строит дерево поверх текущего дерева ветки, создаёт один коммит и перемещает ссылку ветки. Результат — один атомарный коммит на каждый Push, включая удаления, запрошенные соответствующей опцией. Вторая оптимизация тише, но не менее важна. Git идентифицирует содержимое файла по хешу SHA-1, и браузер может вычислить этот хеш локально с помощью WebCrypto. GB Coder сравнивает локальные файлы с целевым деревом перед загрузкой. Неизменённые файлы не тратят вызовы API, а Push без изменений возвращает «already up to date» вместо создания пустого коммита. Это сохраняет историю читаемой и оставляет бюджет API для реальных изменений. В небольшом проекте разница незаметна; в проекте с десятками файлов это разница между чистой синхронизацией и медленной, шумной.',
          },
          {
            heading: '6. Создание репозитория без выхода из браузера',
            body: 'Вкладка New repo создаёт репозиторий в подключённой учётной записи. Вы указываете имя и необязательное описание, выбираете публичный или приватный доступ и решаете, должен ли GitHub инициализировать репозиторий с помощью README. Инициализация включена по умолчанию, потому что у пустого репозитория нет головы ветки, на которой можно построить первый Push. GB Coder использует этот начальный коммит, заменяет README файлами проекта и записывает начальный коммит. Если инициализация выключена, он сам создаёт корневой коммит и ссылку на ветку по умолчанию. После создания новый репозиторий и ветка по умолчанию выбираются для следующего Push, поэтому второго этапа настройки нет. Это самый короткий путь от идеи к приватному репозиторию под версионным контролем. Он подходит для школьного задания, клиентской демонстрации, которая должна оставаться приватной, или прототипа, которому нужен URL для CI-сервиса. Репозиторий принадлежит учётной записи GitHub, владеющей токеном, а не LadeStack, и в дальнейшем им можно управлять, передавать или удалять на GitHub.',
          },
          {
            heading: '7. Возврат репозитория в редактор',
            body: 'Pull — это обратный путь. Введите URL репозитория или пару owner/name, выберите ветку, и GB Coder прочитает дерево ветки. Он импортирует текстовые файлы, которые редактор может осмысленно открыть: исходный код, JSON, Markdown, конфигурацию и SVG, среди прочего. Он пропускает каталоги node_modules, dist, build, .git, .next и coverage. Кроме того, Pull ограничен 200 файлами и 512 КБ на файл; если ветка превышает любой из лимитов, панель сообщает, сколько файлов было исключено, вместо того чтобы молча их отбросить. Переводы строк нормализуются, чтобы созданный в Windows файл не выглядел изменённым в каждой строке. Импортированные файлы не перезаписывают проект сразу. Они проходят тот же процесс проверки и применения, что и импорт ZIP, поэтому можно изучить обнаруженную структуру до подтверждения изменения и отменить его позже. Поэтому Pull — хороший способ продолжить работу на другом устройстве, изучить репозиторий перед редактированием или восстановить проект после очистки хранилища браузера. Это импорт, а не слияние; если текущий проект и ветка разошлись, внимательно проверьте результат.',
          },
          {
            heading: '8. Конфликты, лимиты API и честные сценарии отказа',
            body: 'Самое важное свойство безопасности — то, что происходит, когда удалённая ветка меняется во время редактирования. GB Coder обновляет ссылку ветки с отключённым force. Если кто-то другой успел сделать Push, GitHub отклоняет обновление, и панель сообщает о конфликте, а не молча отбрасывает чужую работу. Решение намеренно ручное: получите последнюю ветку в проект, проверьте файлы и отправьте снова — или перейдите в десктопный Git-клиент для настоящего слияния. Остальные ошибки разделены, чтобы сообщению можно было доверять и действовать по нему. Просроченный токен даёт ошибку аутентификации и запрос на повторное подключение. Ограничение скорости показывает, когда сбросится квота GitHub; API разрешает 5 000 запросов в час для аутентифицированных пользователей, а Pull тратит один запрос на файл. Отсутствующий репозиторий или ветка дают ошибку not-found. Запросы завершаются по тайм-ауту через 60 секунд, а долгую операцию можно отменить из панели. Эти детали не бросаются в глаза, но именно они отличают инструмент синхронизации, которому можно доверять, от инструмента, который отказывает неоднозначно.',
          },
          {
            heading: '9. Безопасность токена: по умолчанию только в сессии',
            body: 'Токены — ценные учётные данные. Токен GitHub с доступом на запись может изменить каждый доступный ему репозиторий. По умолчанию GB Coder хранит вставленный токен в map в области модуля, поэтому он исчезает при закрытии вкладки и никогда не записывается в localStorage. Опция «Remember on this device» — явное согласие. Если она включена и страница находится в безопасном контексте, токен перед сохранением запечатывается AES-GCM под случайным ключом каждой установки. Это защищает от читаемого токена в резервной копии профиля браузера, синхронизированном профиле, на общей машине, на скриншоте инструментов разработчика или в пакете поддержки. Это не защищает от скрипта, который может выполняться на том же origin, потому что такой скрипт может вызвать тот же модуль хранилища. Никакая браузерная схема не решает это полностью. Поэтому практические меры — область, срок действия и отзыв: используйте fine-grained токен, ограниченный нужным репозиторием, задайте срок действия и удалите токен на GitHub, когда работа закончена. Трафик GitHub идёт напрямую из браузера на api.github.com; LadeStack не нужно хранить учётные данные. Хранилище браузера по-прежнему не является резервной копией, поэтому репозиторий — разумная копия вне устройства.',
          },
          {
            heading: '10. Когда этого процесса достаточно, а когда нет',
            body: 'Синхронизации с GitHub достаточно для большой доли браузерных проектов: статического сайта, прототипа на React или Vue, учебного упражнения, небольшого внутреннего инструмента или демо, которому нужны remote и источник развёртывания. Она подходит независимому разработчику, который хочет контроль версий без установки Git, преподавателю, которому нужна воспроизводимая передача, и всем, кто работает на машине без терминала. Её недостаточно для монорепозитория с сабмодулями, репозитория, зависящего от Git LFS, команды, которой нужны подписанные коммиты или подробный обзор истории, а также процесса релиза на хуках и нескольких remote. Это задачи десктопного Git, и притворяться иначе означало бы ухудшить браузерный процесс. Полезный паттерн — гибридный. Начинайте в браузере, потому что первый предпросмотр доступен сразу. Делайте Push, когда проект приобрёл форму, которую стоит сохранить. Открывайте тот же репозиторий на десктопе, когда работе нужны нативные инструменты, более глубокий отладчик или полный Git-процесс. Возвращаясь в браузер, получайте изменения через GitHub с помощью Pull. Файлы — обычные исходники, поэтому передача является контролем версий, а не миграцией. Чтобы попробовать браузерную половину, откройте Projects Dashboard по адресу /app/projects, создайте проект, откройте GitHub sync и сделайте первый Push. Полная настройка и справочник функций — в документации.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Читать полную документацию GB Coder →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Деплой из браузерной IDE в Vercel или Netlify',
        description: 'Как работает деплой из браузерной IDE: токены провайдеров, статические загрузки, сборки Vercel, стабильные URL, лимиты, безопасность и повторные деплои.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Деплой', 'Vercel', 'Netlify', 'Браузерная IDE', 'Статические сайты'],
        intro: 'Деплой — момент, когда проект в браузере перестаёт быть превью. До этого код живёт во вкладке, файлы принадлежат профилю браузера, а открыть результат может только тот, кто его собрал. Vercel и Netlify решают задачу хостинга, но их обычный сценарий предполагает Git-репозиторий, терминал или перетаскивание папки. GB Coder идёт коротким путём: кнопка Deploy упаковывает текущий проект, отправляет его через API провайдера с токеном вашей учётной записи и возвращает публичный HTTPS-адрес. В этой статье подробно разбирается этот путь: что именно загружается, как отслеживается деплой, почему повторный деплой может остаться на том же адресе и где проходят границы. Это не общее руководство по Vercel или Netlify, а описание того, что действительно делает браузерная панель.',
        sections: [
          {
            heading: '1. Зачем деплоить из браузера',
            body: 'Самый очевидный случай — машина, где установить CLI неудобно или запрещено. Chromebook, учебный компьютер или заблокированный корпоративный рабочий стол открывают вкладку браузера, но не всегда позволяют поставить Node.js, Git и CLI провайдера. Браузерная IDE уже снимает эти требования на этапе редактирования. Деплой обычно становится последним шагом, который возвращает разработчика в терминал; если оставить его в той же вкладке, цикл замыкается: проект редактируется, просматривается и публикуется без локального тулчейна. Второй случай — скорость. Лендингу, прототипу или демо для клиента адрес может понадобиться раньше, чем репозиторий или CI-пайплайн. Браузерная панель публикует текущий снимок и сообщает, где он доступен. У этого удобства есть граница. Это прямая загрузка, а не пайплайн деплоя. Она не следит за веткой, не запускает тесты и не продвигает сборки между окружениями; это задачи Git-интеграции провайдера или CI. Браузерный путь нужен для первого URL, а не для всего процесса релиза.',
          },
          {
            heading: '2. Что на самом деле делает деплой в один клик',
            body: 'Диалог Deploy — тонкая панель управления поверх двух API провайдеров. Когда вы нажимаете Deploy now, GB Coder собирает тот же пакет файлов, что и Download ZIP. Это важно: второй путь упаковки, который мог бы потерять таблицу стилей или забыть внешнюю библиотеку, отсутствует. Обычный проект превращается в index.html, style.css, script.js и README. Проект React или Vue становится деревом в формате Vite: index.html, package.json, vite.config.js, .gitignore, README и исходники в src/. Сводка пакета показывает точное число файлов и размер без сжатия до того, как что-либо покинет вкладку. Vercel получает файлы как inline JSON на endpoint деплоя. Netlify получает ZIP как сырое тело запроса. Vercel собирает или отдаёт проект, а Netlify публикует загруженные файлы как ручной деплой. Сервер LadeStack в середине не участвует, и CLI на вашей машине не запускается. Браузер — клиент, провайдер — хост, токен — единственные учётные данные. «Один клик» описывает интерфейс, а не объём работы: упаковка, загрузка, удалённая обработка и TLS всё равно идут по очереди.',
          },
          {
            heading: '3. Статические сайты и Vite-приложения идут разными путями',
            body: 'Пакет отличается, потому что два типа проектов требуют разного обращения. В обычном HTML/CSS/JavaScript-проекте нет package.json. Vercel получает указание не использовать фреймворк и отдаёт файлы как статический сайт. Netlify публикует ZIP как есть, и для статических файлов это тоже правильно. Устанавливать и компилировать нечего, поэтому первый деплой обычно быстрый. Проект React или Vue содержит сгенерированный package.json, конфигурацию Vite и исходники. В Vercel провайдер распознаёт Vite, устанавливает зависимости, запускает production-сборку и публикует результат. Это настоящая облачная сборка, а не симуляция в браузере, поэтому она может занять минуту и больше. Vercel использует версии из package.json, а не то, что случайно было загружено в редактор. Ручной ZIP-деплой Netlify не запускает команду сборки, поэтому то же дерево исходников Vite публикуется как загружено, без компиляции. Для React или Vue в Netlify используйте Git-интеграцию провайдера; путь в один клик от Netlify публикует только статический результат. Внешние библиотеки и настройки инъекций уже в пакете. Если сборка Vercel зависит от приватного пакета, нативного бинарника или сервиса, недоступного из её образа сборки, сборка упадёт, даже если превью работает локально. Логи покажут, какой это случай.',
          },
          {
            heading: '4. Токен с правильной областью действия',
            body: 'Оба провайдера аутентифицируются по personal access token. Это не пароль провайдера и не учётная запись GB Coder. Диалог ссылается на страницу токенов выбранного провайдера и объясняет область действия простыми словами. Токен Vercel может публиковать во все проекты, доступные учётной записи или команде; если есть токен с областью команды, используйте его. Токен Netlify действует на сайты, доступные учётной записи, поэтому считайте его общим для аккаунта, если нет более узкого варианта. Создайте токен именно для этой задачи, задайте минимально полезный срок и отзовите его, когда проект перестанет в нём нуждаться. GB Coder проверяет наличие токена и соответствие пакета локальным лимитам перед включением Deploy now. По умолчанию токен хранится только в памяти вкладки. Remember on this device — это опция: в безопасном контексте токен запечатывается AES-GCM перед записью в localStorage; иначе диалог предупреждает, что запоминание сохранит его открытым текстом. Область действия и отзыв — самые важные меры контроля.',
          },
          {
            heading: '5. Первый деплой по шагам',
            body: 'Откройте проект и выберите Deploy на панели инструментов; на узком экране он находится в меню переполнения. По умолчанию выбран Vercel, Netlify — в одном клике. Имя проекта подставляется из текущего проекта. GB Coder переводит его в нижний регистр, заменяет недопустимые символы дефисами и показывает запрашиваемое имя хоста, например your-project.vercel.app. Вставьте токен, решите, запоминать ли его, и проверьте сводку пакета. Если число файлов или размер превышают лимит, диалог объясняет проблему и оставляет кнопку неактивной. Нажмите Deploy now. Провайдер создаёт проект или сайт, получает пакет и начинает обработку деплоя. Когда деплой готов, экран успеха показывает публичный URL, число файлов, размер загрузки, затраченное время и QR-код для открытия страницы на телефоне. Copy URL и Visit site нужны для передачи, а Build logs открывает собственное представление логов провайдера. Имена сайтов Netlify глобальны, поэтому запрошенное имя может быть занято. Тогда провайдер назначает другое, и GB Coder сообщает адрес, который действительно работает, а не тот, что вы ввели.',
          },
          {
            heading: '6. Что на самом деле показывает прогресс',
            body: 'Индикатор проходит этапы упаковки, загрузки, сборки, защиты и готовности. В Netlify метка «сборка» означает обработку на стороне провайдера, а не команду сборки. Это отчёт клиента, а не предсказание провайдера. Процент растёт на первых двух этапах, а затем останавливается ниже 100, пока провайдер завершает удалённую обработку. Это сделано намеренно: удалённая обработка может длиться непредсказуемо, и полоса, которая мчится к 99%, просто врёт. GB Coder опрашивает провайдера каждые полторы секунды и обновляет сообщение при изменении состояния. У запроса загрузки есть таймаут две минуты. Панель перестаёт ждать после трёх минут опроса деплоя и отправляет вас в dashboard, потому что деплой может завершиться, даже когда браузер уже не смотрит. Отмена, закрытие диалога или Escape прерывают текущий запрос и цикл опроса. Если провайдер уже принял деплой, деплой может продолжиться на его стороне; проверьте dashboard, прежде чем считать отмену откатом. Логи провайдера — авторитетный источник при неудачном деплое.',
          },
          {
            heading: '7. Повторный деплой, стабильные URL и состояние провайдера',
            body: 'Deploy again возвращает к форме; он не отправляет последний пакет немедленно. Это полезно, когда проект изменился, имя нужно поправить или токен истёк. Дальше Vercel и Netlify идут разными путями к одному адресу. Vercel создаёт деплой для названного проекта и нацеливает его на production. Повторные деплои с тем же именем проекта обновляют этот проект, а production alias предпочтительнее URL конкретного деплоя, поэтому адрес, которым вы делитесь, обычно остаётся стабильным. Netlify нужен site id, чтобы обновить существующий сайт, а не создавать новый. GB Coder хранит этот id в localStorage, привязывая его к очищенному имени сайта. Если очистить хранилище браузера, сменить браузер, изменить имя или удалить сайт в Netlify, следующий деплой не найдёт старый сайт и создаст новый. Поэтому переименование проекта Netlify может оставить прежний сайт в аккаунте. Оба провайдера хранят историю деплоев, пользовательские домены, управление доступом и откат в своих dashboard; панель GB Coder показывает только загрузку и публичный URL. Каждый деплой здесь — production-деплой; выбора branch preview или окружения нет.',
          },
          {
            heading: '8. Лимиты и ошибки, которые стоит предусмотреть',
            body: 'Два лимита применяются до того, как запрос покинет вкладку: 900 файлов и 64 МБ несжатого содержимого. Они ниже потолков провайдеров, чтобы огромная загрузка не срывалась на середине сессии браузера. Сайту с большим количеством медиа лучше держать крупные изображения и видео в CDN или Git, а не в пакете проекта. Ошибки разделены по причине. 401 означает, что токен отклонён; 403 обычно указывает на нехватку прав для аккаунта или команды; 413 или 429 — payload слишком велик или провайдер ограничивает частоту; 422 — проект отклонён как невалидный; 5xx обычно временная ошибка. В Vercel неудачная сборка фреймворка — другое: загрузка прошла, а build упал, поэтому читайте логи, а не вставляйте новый токен. Сборка Vercel, которой нужны переменные окружения, — ещё одна граница. В диалоге нет редактора переменных. Задайте значения в настройках проекта Vercel и задеплойте снова; первая сборка может упасть до того, как появится проект, где их можно задать. У ручного ZIP-деплоя Netlify нет шага сборки, поэтому это к нему не относится. Трёхминутный лимит опроса — не неудачный деплой, а всего лишь неудачное ожидание.',
          },
          {
            heading: '9. Безопасность, владение и граница данных',
            body: 'Путь деплоя прямой: браузер вызывает api.vercel.com или api.netlify.com с вашим токеном. Прокси, который хранит учётные данные, нет, и аккаунт LadeStack для панели не требуется. По умолчанию токены живут только в сессии и запечатываются AES-GCM лишь тогда, когда вы выбираете запомнить их в безопасном контексте. Это защищает от читаемого токена в резервной копии профиля браузера или support-бандле, но не от вредоносного кода на том же origin, пока вкладка открыта. Используйте самый узкий доступный токен, задайте срок действия и отзовите его у провайдера, когда работа закончена. Владение следует за токеном: проект или сайт создаётся в аккаунте провайдера, которому принадлежит, по его условиям, квотам, логам и биллингу. GB Coder остаётся local-first, но деплой — это явный экспорт проекта провайдеру. Провайдер получает исходники сайта, а результат по умолчанию доступен по публичному HTTPS URL; защита паролем, SSO и пользовательские домены — функции провайдера. Сохраните ZIP или копию в GitHub, если профиль браузера — единственное другое место, где существует проект.',
          },
          {
            heading: '10. Когда деплой из браузера уместен',
            body: 'Используйте этот путь, когда небольшой сайт нужно быстро опубликовать: лендинг, портфолио, демо для занятия, прототип для клиентского ревью или статическая страница документации. Он подходит и тогда, когда проект уже живёт в GB Coder, а альтернатива — экспортировать ZIP, открыть терминал и настраивать CLI на чужой машине. Он плохо подходит для монорепозитория, серверного приложения с базой данных, сборки с учётными данными приватного реестра, команды, которая выпускает релизы через branch preview и согласования, или ассетов сверх лимитов загрузки. Это задачи Git-интеграции провайдера, CI-пайплайна или настольного окружения. Два подхода могут сосуществовать: черновик и итерации в браузере, исходники в GitHub, когда им нужна история, а production-сборку публикует CI. Практический порядок короткий: проверьте превью на ширине телефона, посмотрите сводку пакета, задеплойте, откройте публичный URL на втором устройстве и сохраните build log. Чтобы попробовать, откройте панель проектов на /app/projects, создайте или откройте проект и выберите Deploy. Справочник по настройке — в документации.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Читать полную документацию GB Coder →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'Ключи API и переменные окружения в браузерной IDE',
        description: 'Где место ключам API и переменным окружения в браузерной IDE: клиентская экспозиция, безопасное хранение, ограничение прав, ротация, деплой и реакция на утечку.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Безопасность', 'Ключи API', 'Переменные окружения', 'Браузерная IDE', 'Лучшие практики'],
        intro: 'Рано или поздно любой браузерной IDE задают один и тот же вопрос: где хранить ключи? Проекту нужен endpoint API, панели ИИ — ключ провайдера, а деплою — токен аккаунта. На десктопе эти значения можно держать в профиле оболочки или в неотслеживаемом файле. В браузерной вкладке граница другая. Всё, что отправляется вместе со страницей, может быть прочитано страницей, а всё, что хранится в профиле браузера, принадлежит этому профилю. Это руководство предлагает практическую модель: какие значения можно публиковать, какие никогда не должны попадать к клиенту, как GB Coder обращается с учётными данными провайдеров и что делать при утечке ключа. Оно для тех, кто хочет удобство браузерной IDE, не делая вид, что вкладка — это секретный сейф.',
        sections: [
          {
            heading: '1. Браузерная вкладка — публичная цель сборки',
            body: 'Первое правило неудобно, но просто: статическое веб-приложение не может хранить секрет. Браузер скачивает HTML, CSS и JavaScript, а затем выполняет их на машине пользователя. Любой может открыть DevTools, посмотреть сетевую панель, поискать по бандлу или поставить точку останова и проверить переменную. Минификация, разбиение на чанки или сокрытие значения в конфигурационном файле меняют затраты, но не результат. Браузерная IDE добавляет песочницу для выполнения кода проекта, но интерфейс самой IDE по-прежнему работает на том же origin и должен читать то, что ему нужно для работы. Песочница не является сейфом для значений, которые использует сам интерфейс. Полезный тест прост: если значение должно быть доступно коду во вкладке, считайте, что человек, использующий вкладку, тоже может его прочитать, как и любой скрипт на том же origin. Это не делает браузерную разработку небезопасной. Это определяет границу. Публичные идентификаторы там жить могут; серверные учётные данные — нет.',
          },
          {
            heading: '2. Что означает переменная окружения в статическом приложении',
            body: 'На сервере Node.js переменная окружения читается во время выполнения из процесса. В сборке Vite, Create React App, Next.js или Astro публичные переменные окружения работают иначе: сборщик заменяет ссылки на литеральные строки во время сборки. Vite предоставляет переменные с префиксом VITE_ через import.meta.env; Create React App использует REACT_APP_; Next.js — NEXT_PUBLIC_; Astro — PUBLIC_. Префикс — это соглашение об именовании, а не средство защиты. Как только значение встроено, оно становится частью JavaScript, который скачивает каждый посетитель. Переменная без публичного префикса обычно недоступна клиентскому коду, поэтому серверные значения должны читать сервер или serverless-функция, а не статическая страница. Файл .env — это входные данные для разработки и сборки, а не хранилище секретов во время выполнения. Он полезен для локальной конфигурации и для того, чтобы держать значения вне системы контроля версий, но не делает значение приватным после сборки.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Какие ключи могут жить в браузере',
            body: 'Некоторые ключи созданы публичными. Публикуемый ключ Stripe идентифицирует аккаунт и создаёт платёжные токены; секретный ключ реально двигает деньги и должен оставаться на сервере. Anon-ключ Supabase безопасен только при корректных политиках row-level security. Веб-конфигурация Firebase идентифицирует проект, но не даёт административного доступа. Ключи карт и аналитики часто ограничиваются доменом или API. Эти значения можно отправлять в браузер, но им всё равно нужны ограничения: разрешённые origin, ограничения API, роли с минимальными правами, квоты и оповещения. Противоположную категорию перечислить проще. Ключи service role, пароли баз данных, учётные данные SMTP, секреты подписи и приватные ключи AI-провайдеров никогда не должны попадать в статический бандл. Ключ провайдера, принадлежащий приложению, особенно опасен: любой, кто его найдёт, сможет тратить деньги приложения. Ключ, принадлежащий пользователю, — другой случай. Это по-прежнему bearer-учётные данные, но они принадлежат пользователю, и цель — держать их в его браузере, а не в проекте или репозитории.',
          },
          {
            heading: '4. Как GB Coder обращается с учётными данными провайдеров',
            body: 'Панель ИИ в GB Coder работает по модели bring-your-own-key. Менеджер ключей по умолчанию хранит ключи провайдеров в памяти. Он не записывает их в localStorage. Пользователь может явно включить сохранение в sessionStorage; тогда значение ограничено текущей вкладкой и обычно очищается при её закрытии. Ключ удаляется из памяти и сессионного хранилища, когда пользователь его очищает. Менеджер также привязывает каждый ключ к разрешённому origin endpoint, а исходящий шлюз проверяет, что учётные данные не отправляются на неутверждённый адрес. Ошибки провайдеров проходят через слой редактирования, который удаляет шаблоны ключей и активные ключи до того, как сообщение попадёт в интерфейс или лог. Метаданные пользовательских провайдеров хранятся в localStorage, но заголовки, помеченные как секретные, очищаются перед сохранением и должны быть введены заново. Запросы идут напрямую из браузера в endpoint провайдера; GB Coder не проксирует ключ через сервер LadeStack. Эти меры уменьшают случайное сохранение и утечки между origin. Но они не меняют базовое правило: любой скрипт, который может выполняться на том же origin, может прочитать то, что читает страница. Используйте чистый профиль для чувствительной работы и не устанавливайте недоверенные расширения.',
          },
          {
            heading: '5. Секреты проекта, файлы .env и встраивание при сборке',
            body: 'Держите секреты вне дерева проекта. Добавьте .env и его локальные варианты в .gitignore, а в репозиторий коммитьте .env.example с именами-заполнителями. Если проект использует Vite, помните, что каждая переменная VITE_ встраивается в production-бандл. Значение, удобное при локальной разработке, становится публичным в момент, когда его используют в production-сборке. Перед деплоем проверьте сгенерированные ассеты на шаблоны ключей и рассматривайте находку как инцидент, а не предупреждение. Сканирование секретов и push protection в GitHub могут поймать некоторые известные форматы токенов, но это страховка, а не замена хранению значений вне репозитория. ZIP-экспорт браузерной IDE включает файлы проекта. Если файл .env находится в проекте, он уезжает вместе с резервной копией. Резервная копия — не зашифрованный сейф. Храните экспорты в приватном месте и удаляйте старые копии, когда они больше не нужны. То же относится к скриншотам, отчётам об ошибках и сообщениям в чате: ключ, вставленный в любое из этого, уже покинул браузер.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. Токены GitHub и деплоя',
            body: 'Личные токены доступа GitHub и токены деплоя мощнее, чем кажутся. Классический токен с областями repository и workflow может читать приватный код, менять файлы и запускать релизы. Предпочитайте fine-grained токены с одним репозиторием, явным списком разрешений и сроком действия. Давайте токену только те права, которые нужны задаче: для синхронизации достаточно чтения и записи contents, без administration и billing. Создавайте отдельные токены для разных устройств или целей и отзывайте их по завершении работы. Токены деплоя Vercel или Netlify могут публиковать, заменять или удалять проекты. Если провайдер поддерживает ограничение по проекту или команде, используйте его; если поддерживает срок действия, задайте его. Вставляйте токен в панель деплоя только при необходимости и не сохраняйте его в файле проекта. В CI используйте секреты репозитория или организации, а не закоммиченный .env, и помните, что pull request из форков обычно не получают секретов. Токен, который попал на скриншот, был отправлен в чат или закоммичен в публичный репозиторий, следует считать скомпрометированным, даже если его удалили через секунду.',
          },
          {
            heading: '7. Ключи AI-провайдеров: BYOK без сюрпризов',
            body: 'Ключ AI-провайдера — это bearer-учётные данные с прикреплённым счётом. Любой, у кого он есть, может отправлять запросы, расходовать квоту и создавать затраты. Используйте ключ, ограниченный проектом, задайте лимит расходов, если провайдер это позволяет, и используйте отдельный ключ для экспериментов вместо мастер-ключа организации. Регулярно проверяйте использование, особенно после того, как поделились устройством или установили новое расширение. Локальные провайдеры вроде Ollama, LM Studio и vLLM не требуют облачного ключа, но их endpoint — всё равно сервис на машине. Не выставляйте локальный endpoint в публичный интернет только ради работающей демонстрации. Если пользовательский провайдер указывает на прокси, прокси видит ключ; используйте только тот прокси, который вы контролируете и понимаете. Prompt injection — связанный риск: файл, веб-страница или вставленное сообщение об ошибке могут содержать инструкции для ассистента. Держите секреты вне промптов и вне файлов, которые ассистенту разрешено читать. Если ключ появился в разговоре, ротируйте его.',
          },
          {
            heading: '8. Общие компьютеры, расширения и XSS',
            body: 'Общий или лабораторный компьютер требует другой процедуры. Используйте приватный профиль браузера, не включайте сохранение сессии и закрывайте вкладку по завершении. Если браузер предлагает сохранить ключ, откажитесь. Очистите хранилище сайта, если подозреваете, что оно сохранилось. Расширения браузера — тоже часть границы: расширение с широкими правами хоста часто может читать содержимое страницы или хранилище, а вредоносное обновление может прийти уже после установки. Используйте минимальный профиль для работы с учётными данными. Классический веб-риск в этом контексте — cross-site scripting. Если атакующий может выполнить скрипт на origin IDE, этот скрипт сможет читать localStorage и sessionStorage и отправлять запросы, пока страница открыта. Обновляйте зависимости, избегайте недоверенных сторонних скриптов и рассмотрите content security policy на задеплоенном сайте. Менеджеры буфера обмена и инструменты демонстрации экрана тоже видят, что вы копируете и показываете. Очищайте буфер обмена после переноса ключа и приостанавливайте демонстрацию перед открытием панели настроек провайдера.',
          },
          {
            heading: '9. Ротация утёкшего ключа',
            body: 'Ротация — единственный надёжный ответ на утёкший ключ. Сначала отозвать — важно: если старый ключ остаётся действительным, пока готовится замена, экспозиция продолжается. Создайте новый ключ с минимально необходимой областью, обновите приложение или настройки браузера, задеплойте заново, если значение входило в сборку, и проверьте, что старый ключ отклоняется. Затем изучите использование и журналы аудита провайдера на предмет неожиданной активности. Если ключ был закоммичен в Git, удалить файл недостаточно: значение остаётся в истории. Сначала ротируйте, затем перепишите историю инструментом вроде git filter-repo или BFG, сделайте force-push по согласованию с командой и попросите коллег клонировать репозиторий заново. Платформы хостинга могут кешировать старые сборки, поэтому убедитесь, что старое значение нельзя отдать из устаревшего бандла. Если ключ вставляли в чат с ИИ, тикет поддержки или скриншот, считайте, что он сохранён, и ротируйте его. Наконец, зафиксируйте, что произошло, добавьте проверку, которая могла бы это поймать, и сократите срок жизни следующего ключа.',
          },
          {
            heading: '10. Практический чек-лист',
            body: 'Используйте эту последовательность, прежде чем проект покинет браузер. Во-первых, классифицируйте каждое значение: публичный идентификатор, учётные данные пользователя или серверный секрет. Во-вторых, держите серверные секреты вне статического бандла и помещайте их за serverless-функцию или API. В-третьих, раскрывайте только значения, которым нужен публичный префикс, и проверяйте собранные ассеты перед деплоем. В-четвёртых, держите файлы .env вне Git, коммитьте .env.example и включите сканирование секретов. В-пятых, создавайте токены с ограниченной областью и сроком действия для GitHub и хостинга, по одному на задачу. В-шестых, в GB Coder оставляйте ключи в памяти, если вы не на доверенном устройстве, и включайте сохранение сессии только когда понимаете компромисс. В-седьмых, никогда не вставляйте ключ в промпт, тикет, скриншот или файл проекта. В-восьмых, ротируйте при любом сомнении и отзывайте до замены. В-девятых, используйте чистый профиль браузера на общих машинах. В-десятых, запишите план действий при утечке заранее. Браузерная IDE может ответственно обращаться с учётными данными, если относиться к браузеру как к публичному клиенту, а не как к приватному сейфу.',
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
      'browser-ide-vs-desktop-ide': {
        slug: 'browser-ide-vs-desktop-ide',
        title: 'IDE no navegador vs IDE desktop: qual escolher?',
        description: 'Comparativo prático entre IDE de navegador e IDE desktop: instalação, desempenho, extensões, depuração, Git, uso offline, segurança e quando cada um vence.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['IDE de navegador', 'IDE desktop', 'Ferramentas de desenvolvimento', 'Desenvolvimento web', 'Comparativo'],
        intro: 'O IDE desktop foi o padrão por tanto tempo que muitos desenvolvedores pararam de questionar. Instalar o editor, adicionar extensões, configurar o runtime, clonar o repositório e só então escrever a primeira linha. Um IDE de navegador propõe outra ordem: abrir uma aba, criar um projeto e começar a digitar enquanto o ambiente se monta sozinho. A troca não é uma vitória clara de nenhum dos lados. O IDE de navegador elimina a instalação e torna o trabalho portátil, mas herda os limites do sandbox do navegador. O IDE desktop exige instalação e espaço em disco, mas alcança toolchains nativos, extensões e hardware local. Esta comparação examina as dimensões que realmente mudam a decisão, usando o GB Coder como exemplo do lado do navegador porque seus dois modos cobrem os dois extremos do espectro.',
        sections: [
          {
            heading: '1. O que conta como IDE de navegador',
            body: 'Um IDE de navegador é um editor que roda dentro de uma página web e abre ou armazena um projeto sem instalação no desktop. A categoria reúne dois produtos muito diferentes. O primeiro é uma bancada estática: painéis de HTML, CSS e JavaScript com pré-visualização ao vivo e sem gerenciador de pacotes. O segundo é um ambiente de execução completo, em que um sistema baseado em WebAssembly como o WebContainer executa Node.js, npm e um servidor de desenvolvimento dentro da aba. O GB Coder entrega os dois: um Editor Estático para trabalho sem dependências e um IDE Avançado para React, Vue e projetos npm comuns. Essa distinção importa em todas as comparações seguintes. Um editor estático concorre com um bloco de notas; um IDE de navegador completo concorre com uma configuração desktop leve. Julgar todos os IDEs de navegador pela versão estática é como julgar IDEs desktop por um editor de texto com realce de sintaxe.',
          },
          {
            heading: '2. Onde o IDE desktop ainda leva vantagem',
            body: 'IDEs desktop continuam sendo a escolha mais forte para sistemas grandes e duradouros. Eles executam compiladores nativos, emuladores móveis, clientes de banco de dados, Docker e servidores de linguagem que analisam um monorepo inteiro. As lojas de extensões oferecem depuradores, ferramentas de framework, linters e integrações sem equivalente no navegador. Arquivos locais não estão sujeitos a cota de armazenamento, e uma máquina com RAM suficiente mantém uma árvore de dependências enorme e vários serviços ao mesmo tempo. Trabalhar offline é normal, não exceção, e extensões de desenvolvimento remoto permitem que um notebook fino controle um servidor potente. Nada disso está obsoleto. Se o dia a dia envolve um SDK nativo, um backend com vários serviços ou um repositório com centenas de pacotes, o IDE desktop não é hábito nostálgico: é a ferramenta que combina com o trabalho.',
          },
          {
            heading: '3. Tempo de instalação e primeira pré-visualização',
            body: 'A diferença mais clara aparece antes de existir código. Uma configuração desktop normalmente significa instalar o editor, um runtime, um gerenciador de pacotes, extensões e as dependências do projeto, e então esperar a primeira build. Em uma máquina nova, isso pode consumir uma tarde. Um IDE de navegador encurta a sequência: abrir o site, escolher um modelo ou projeto em branco, e a primeira pré-visualização aparece na hora. O GB Coder cria o espaço de trabalho no IndexedDB, então não há conta, download nem ida ao servidor. A ressalva é que o aplicativo precisa carregar, e o modo avançado exige um navegador moderno com SharedArrayBuffer e isolamento de origem. Para uma sala de aula, um notebook emprestado, um Chromebook ou uma demo rápida para cliente, a diferença é decisiva. Para quem já tem uma estação de trabalho ajustada, o custo de instalação é pago uma vez e pesa menos.',
          },
          {
            heading: '4. Desempenho, memória e limites do runtime',
            body: 'Um IDE desktop usa CPU e RAM diretamente. Um IDE de navegador roda dentro de uma aba, e a aba é um sandbox gerenciado com teto de memória próprio. Esse teto é generoso para uma aplicação Vite típica, mas não é infinito. Instalar uma árvore de dependências muito grande, rodar vários watchers ou compilar um monorepo enorme pode esgotar a aba ou provocar recarregamento. O WebContainer também não executa binários nativos, imagens Docker ou ferramentas compiladas para o sistema operacional hospedeiro. A comparação honesta depende, portanto, da carga de trabalho. Para uma landing page, um painel, uma biblioteca de componentes ou um protótipo full-stack pequeno, o IDE de navegador parece igual ao desenvolvimento local. Para um projeto que precisa de um mecanismo de banco de dados, um serviço Python ou um módulo nativo, o desktop continua sendo o ambiente prático. A bateria segue o mesmo padrão: uma aba é mais leve que um IDE completo com uma dúzia de serviços em segundo plano, mas uma sessão longa de WebContainer ainda consome energia.',
          },
          {
            heading: '5. Inteligência do editor e extensões',
            body: 'A qualidade do editor não é mais um ponto fraco do navegador. O GB Coder usa o Monaco, o mesmo motor open source por trás do VS Code, então há autocompletar, documentação inline, validação de sintaxe, correspondência de colchetes, edição multicursor e atalhos configuráveis. TypeScript, JavaScript, HTML, CSS e JSON recebem serviços de linguagem, e um visualizador de diferenças permite revisar mudanças antes de aplicá-las. O que falta a um IDE de navegador é o ecossistema de extensões. Não existe uma loja para um plugin de linguagem especializado, um inspetor de framework ou um depurador personalizado. Parte disso é nativa e parte é desnecessária em projetos pequenos, mas quem depende de uma extensão específica sentirá a lacuna. A troca está na manutenção: um editor de navegador chega configurado, enquanto um editor desktop só fica poderoso depois que alguém o organiza.',
          },
          {
            heading: '6. Terminal, pacotes e pipelines de build',
            body: 'O terminal é o recurso que separa um IDE de navegador de verdade de um playground de código online. No IDE Avançado do GB Coder, o WebContainer fornece um runtime Node.js, o npm install resolve pacotes reais, scripts npx são executados e um servidor Vite inicia em uma porta encaminhada para a pré-visualização. O terminal é um shell xterm.js com saída ANSI e histórico de comandos, não um painel de logs simulado. Isso cobre o pipeline front-end comum: instalar, desenvolver, compilar e testar com ferramentas JavaScript comuns. Não cobre addons nativos, Docker Compose ou um banco de dados de produção. Um IDE desktop executa a pilha inteira, incluindo os serviços com que o front-end conversa. A regra prática é simples: se a toolchain é JavaScript de ponta a ponta, o navegador provavelmente dá conta; se cruza para código nativo ou contêineres, o desktop é mais seguro.',
          },
          {
            heading: '7. Depuração: contexto do navegador vs ferramentas nativas',
            body: 'IDEs de navegador têm uma vantagem de depuração subestimada: o código, a pré-visualização e as ferramentas do navegador vivem no mesmo contexto. Uma mudança de CSS aparece na hora, o console virtual captura logs ao lado da pré-visualização, e um QR code abre a página em um celular real para revelar problemas de toque e viewport. O GB Coder também oferece presets de viewport e uma pré-visualização destacável para um segundo monitor. IDEs desktop vencem em profundidade. Eles conectam depuradores a processos Node, definem breakpoints entre serviços, fazem profiling de memória e CPU, inspecionam threads nativas e se integram a emuladores móveis. Para trabalho visual de front-end, o ciclo do navegador é mais curto. Para uma condição de corrida sutil em um processo de servidor, o depurador desktop é o instrumento melhor. A maioria dos desenvolvedores precisa dos dois tipos de feedback, e por isso o fluxo híbrido no fim do artigo importa.',
          },
          {
            heading: '8. Arquivos, controle de versão e backups',
            body: 'O armazenamento é onde os modelos de navegador e desktop mais se separam. Um projeto desktop fica em uma pasta que qualquer ferramenta pode ler. Um projeto de navegador fica no IndexedDB: rápido e privado, mas preso ao perfil do navegador e vulnerável à limpeza de armazenamento. O GB Coder ameniza isso com snapshots nomeados, visualizador de diferenças, exportação ZIP com hash de integridade e importação com pré-visualização estrutural. A sincronização com GitHub usa um token de acesso pessoal, monta os envios em um único commit atômico, ignora arquivos inalterados e relata conflito quando a branch remota avançou. O Git desktop continua mais completo: hooks, submódulos, fluxos de rebase, vários remotos e uma CLI que qualquer CI entende. O fluxo de navegador basta para um projeto pequeno e surpreende para um desenvolvedor solo, mas não substitui um cliente Git completo em um repositório complexo. Exportar para GitHub ou ZIP é a ponte entre os dois.',
          },
          {
            heading: '9. Segurança, privacidade e custo',
            body: 'Um IDE de navegador concentra risco e conveniência no mesmo lugar. O GB Coder é local-first: projetos ficam no navegador, não é preciso conta e o produto é gratuito, sem anúncios. Os dados só saem do dispositivo quando um recurso conectado é usado, como um provedor de IA, a sincronização com GitHub, o deploy ou um CDN referenciado pelo projeto. A IA é bring-your-own-key, e prompts mais o código selecionado são enviados ao provedor que você configurar. GitHub e deploys na Vercel ou Netlify usam seus tokens, e eles duram só a sessão a menos que você ative o armazenamento criptografado. Esse modelo dá controle ao desenvolvedor, mas também significa que o armazenamento do navegador é a única cópia se não houver backup. Um IDE desktop mantém os arquivos no disco e normalmente herda o modelo de backup e permissões do sistema operacional. Nenhum é automaticamente mais seguro; a pergunta é quem detém os dados e o que acontece quando um dispositivo ou perfil desaparece.',
          },
          {
            heading: '10. Como escolher e como combinar',
            body: 'Escolha um IDE de navegador quando o trabalho for visual, curto ou precisar ser portátil: aprender HTML e CSS, prototipar uma interface, dar aula, revisar um design em um Chromebook ou criar um pequeno app React ou Vue sem instalar uma toolchain. Escolha um IDE desktop quando o trabalho for duradouro e pesado: um monorepo, SDKs nativos, Docker, builds móveis, uma pilha grande de extensões ou desenvolvimento offline em uma rede restrita. A resposta mais interessante é combinar os dois. Comece no navegador porque a primeira pré-visualização é imediata. Valide o layout na largura de celular. Tire um snapshot. Envie para o GitHub ou exporte um ZIP. Abra o mesmo repositório no desktop quando o projeto precisar de uma ferramenta nativa, um depurador mais profundo ou um fluxo Git completo. Os arquivos são padrão, então a passagem é controle de versão comum, não migração. O GB Coder foi desenhado para essa primeira metade do ciclo e não prende o projeto no navegador. Para testar o lado do navegador da decisão, abra o Painel de Projetos e crie um espaço em branco; a comparação fica concreta em cerca de um minuto.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Ler a documentação completa do GB Coder →',
      },
      'browser-ide-github-sync': {
        slug: 'browser-ide-github-sync',
        title: 'Sincronização com GitHub em uma IDE de navegador',
        description: 'Como funciona a sincronização com GitHub em uma IDE de navegador: tokens, commits atômicos, pulls, conflitos, limites e segurança.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['GitHub', 'Controle de versão', 'IDE de navegador', 'Git', 'Fluxo de desenvolvimento'],
        intro: 'IDEs de navegador são boas em eliminar a configuração. Não são tão boas na etapa seguinte: dar ao trabalho um lar durável fora do perfil do navegador. É aí que normalmente aparece um terminal: git init, remote add, commit, push. A sincronização com GitHub em uma IDE de navegador reduz essa sequência a um painel, mas não é mágica nem um cliente Git completo. É uma ponte focada entre um projeto que vive no armazenamento do navegador e um repositório que vive no GitHub. Este guia explica como essa ponte funciona no GB Coder, o que ela envia, como lida com conflitos e tokens, e onde um fluxo de Git no desktop ainda é melhor.',
        sections: [
          {
            heading: '1. Por que uma IDE de navegador precisa do GitHub',
            body: 'Um projeto no navegador é conveniente justamente porque não precisa de pasta, runtime nem instalação. Essa mesma propriedade é a fraqueza. Os projetos vivem no perfil do navegador, que pode ser apagado por uma ferramenta de limpeza, perdido com um dispositivo ou deixado para trás quando alguém troca de computador. Exportar um ZIP cria uma cópia, mas um ZIP é um instantâneo sem histórico nem remote compartilhado. O GitHub fornece a camada que falta: um repositório fora do dispositivo, um histórico de commits, um lugar para colaborar e uma fonte natural para CI ou deploy. Isso muda o papel da IDE de navegador. Ela deixa de ser um rascunho descartável; pode ser o lugar onde um projeto pequeno é escrito, revisado e entregue. O fluxo é especialmente útil em um Chromebook, uma máquina de laboratório escolar ou um notebook corporativo bloqueado onde instalar Git não é uma opção. Também serve para um protótipo rápido que mais tarde pode migrar para um repositório no desktop. O navegador cuida do primeiro rascunho; o GitHub o torna durável.',
          },
          {
            heading: '2. O que a sincronização faz e o que não faz',
            body: 'O GB Coder expõe três ações do GitHub: Push, New repo e Pull. Push grava o projeto atual em um repositório e branch existentes. New repo cria um repositório na conta GitHub conectada e confirma o projeto como primeiro conteúdo. Pull lê um branch e importa seus arquivos de texto para o editor. Todas as requisições vão diretamente do navegador para api.github.com; nenhum servidor da LadeStack fica no meio segurando o token. Esse escopo estreito é intencional. O painel não substitui a linha de comando do Git. Ele não oferece rebase, resolução de conflito de merge, submódulos, Git LFS, commits assinados, hooks ou múltiplos remotes. Também não mostra o grafo completo de commits. Essas limitações importam em um repositório complexo. Para o projeto comum no navegador — uma página estática, um protótipo React, um exemplo didático ou um utilitário pequeno —, as três operações cobrem a parte que realmente precisa acontecer fora da aba.',
          },
          {
            heading: '3. Criar um token com o escopo certo',
            body: 'A sincronização com GitHub usa um token de acesso pessoal, não uma senha nem uma conta do GB Coder. Um token clássico precisa do escopo repo. Um token fine-grained precisa de acesso de leitura e escrita a Contents, e pode ser limitado a um único repositório. A opção mais estreita é o melhor padrão: se o token vazar, o dano fica restrito aos projetos que ele alcança. A tela de conexão leva à página de tokens do GitHub e explica as duas escolhas. Cole o token, escolha se quer lembrá-lo no dispositivo e clique em Connect. O GB Coder o verifica buscando a conta e a lista de repositórios, então mostra o login conectado e o limite restante da API. Nada é gravado no repositório até que um Push ou a criação de um repositório seja confirmada. Trate o token como uma senha: não cole em uma issue, chat ou captura de tela, e revogue-o no GitHub quando não precisar mais. Um token com data de validade e acesso a um repositório é um equilíbrio razoável para este fluxo.',
          },
          {
            heading: '4. O primeiro Push: o que realmente é enviado',
            body: 'A aba Push pede repositório, branch, mensagem de commit e uma opção: excluir arquivos que estão faltando no projeto. Antes de qualquer coisa sair do navegador, o painel mostra a contagem de arquivos e o tamanho total. Essa prévia é útil porque o envio não é um despejo bruto das abas do editor. O GB Coder usa o mesmo construtor de arquivo que a exportação ZIP e o deploy. Um projeto simples de HTML/CSS/JavaScript vira index.html, style.css, script.js e um README. Um projeto React ou Vue vira um repositório com estrutura Vite: index.html, package.json, vite.config.js, .gitignore, um README e os arquivos-fonte em src/. Pastas de dependências e saída de build não são incluídas. A mensagem de commit é editável e o padrão é \'Update from GB Coder\'. A opção de excluir arquivos ausentes fica desligada por padrão; ligue só quando o repositório deve espelhar exatamente o projeto atual, porque ela remove arquivos remotos que não existem mais localmente. No primeiro Push, escolha o branch padrão do repositório, a menos que você queira deliberadamente um branch separado.',
          },
          {
            heading: '5. Commits atômicos e arquivos inalterados ignorados',
            body: 'Uma sincronização ingênua no navegador faz commit de um arquivo por vez. Isso produz um histórico barulhento e deixa o repositório meio atualizado se uma requisição falhar no meio. O GB Coder usa a API Git Data do GitHub: envia blobs, constrói uma tree sobre a tree atual do branch, cria um commit e move a referência do branch. O resultado é um único commit atômico por Push, incluindo as exclusões solicitadas pela opção correspondente. A segunda otimização é mais silenciosa, mas igualmente importante. O Git identifica o conteúdo de um arquivo por um hash SHA-1, e o navegador pode calcular esse hash localmente com WebCrypto. O GB Coder compara os arquivos locais com a tree de destino antes de enviar. Arquivos sem alteração não gastam chamadas de API, e um Push sem mudanças retorna \'already up to date\' em vez de criar um commit vazio. Isso mantém o histórico legível e reserva o orçamento da API para mudanças reais. Em um projeto pequeno a diferença é invisível; em um projeto com dezenas de arquivos, é a diferença entre uma sincronização limpa e uma lenta e barulhenta.',
          },
          {
            heading: '6. Criar um repositório sem sair do navegador',
            body: 'A aba New repo cria um repositório na conta conectada. Você informa um nome e uma descrição opcional, escolhe público ou privado e decide se o GitHub deve inicializar o repositório com um README. A inicialização fica ligada por padrão porque um repositório vazio não tem cabeça de branch para o primeiro Push construir em cima. O GB Coder usa esse commit inicial, substitui o README pelos arquivos do projeto e registra o commit inicial. Com a inicialização desligada, ele mesmo cria um commit raiz e a referência do branch padrão. Depois da criação, o novo repositório e o branch padrão ficam selecionados para o próximo Push, então não há uma segunda rodada de configuração. É o caminho mais curto de uma ideia a um repositório privado e versionado. Serve para uma tarefa de aula, uma demo de cliente que deve permanecer privada ou um protótipo que precisa de uma URL para um serviço de CI. O repositório pertence à conta GitHub dona do token, não à LadeStack, e pode ser gerenciado, transferido ou excluído no GitHub depois.',
          },
          {
            heading: '7. Trazer um repositório de volta ao editor',
            body: 'Pull é a viagem de volta. Informe a URL de um repositório ou um par owner/name, escolha um branch, e o GB Coder lê a tree do branch. Ele importa arquivos de texto que um editor consegue abrir de forma útil: código-fonte, JSON, Markdown, configuração e SVG, entre outros. Ele ignora os diretórios node_modules, dist, build, .git, .next e coverage. Também limita um Pull a 200 arquivos e 512 KB por arquivo; se o branch ultrapassar qualquer um dos limites, o painel informa quantos arquivos ficaram de fora em vez de descartá-los silenciosamente. As quebras de linha são normalizadas para que um arquivo criado no Windows não pareça mudar em todas as linhas. Os arquivos importados não sobrescrevem o projeto imediatamente. Eles passam pelo mesmo fluxo de revisão e aplicação de uma importação ZIP, então você pode inspecionar a estrutura detectada antes de confirmar a mudança e desfazê-la depois. Pull é, portanto, uma boa forma de continuar o trabalho em outro dispositivo, inspecionar um repositório antes de editar ou recuperar um projeto depois que o armazenamento do navegador foi apagado. É uma importação, não um merge; se o projeto atual e o branch divergiram, revise o resultado com cuidado.',
          },
          {
            heading: '8. Conflitos, limites de API e falhas transparentes',
            body: 'A propriedade de segurança mais importante é o que acontece quando o branch remoto avança enquanto você edita. O GB Coder atualiza a referência do branch com force desativado. Se outra pessoa fez Push nesse meio-tempo, o GitHub rejeita a atualização e o painel reporta um conflito em vez de descartar silenciosamente o trabalho dela. A resolução é deliberadamente manual: traga o branch mais recente para um projeto, revise os arquivos e faça Push novamente — ou passe para um cliente Git no desktop para um merge de verdade. Outras falhas são separadas para que a mensagem permita agir. Um token expirado produz erro de autenticação e um pedido para reconectar. Um limite de taxa mostra quando a cota do GitHub reinicia; a API permite 5.000 requisições por hora para usuários autenticados, e um Pull gasta uma requisição por arquivo. Um repositório ou branch ausente produz um erro not-found. As requisições expiram após 60 segundos, e uma operação longa pode ser cancelada no painel. Esses detalhes não são glamourosos, mas são a diferença entre uma ferramenta de sincronização confiável e uma que falha de forma ambígua.',
          },
          {
            heading: '9. Segurança do token: apenas na sessão por padrão',
            body: 'Tokens são credenciais de alto valor. Um token do GitHub com acesso de escrita pode alterar todos os repositórios que alcança. O GB Coder mantém um token colado em um map no escopo do módulo por padrão, o que significa que ele desaparece quando a aba é fechada e nunca é gravado no localStorage. A opção \'Remember on this device\' é um opt-in explícito. Quando ativada e a página está em um contexto seguro, o token é selado com AES-GCM sob uma chave aleatória por instalação antes de ser armazenado. Isso protege contra um token legível em um backup do perfil do navegador, um perfil sincronizado, uma máquina compartilhada, uma captura das ferramentas de desenvolvedor ou um pacote de suporte. Não protege contra um script que possa rodar na mesma origem, porque esse script pode chamar o mesmo módulo de armazenamento. Nenhum design somente de navegador resolve isso por completo. Os controles práticos são, portanto, escopo, validade e revogação: use um token fine-grained limitado ao repositório necessário, defina uma validade e exclua o token no GitHub quando o trabalho terminar. O tráfego do GitHub vai diretamente do navegador para api.github.com; a LadeStack não precisa guardar a credencial. O armazenamento do navegador ainda não é backup, então um repositório também é uma cópia sensata fora do dispositivo.',
          },
          {
            heading: '10. Quando este fluxo basta e quando não basta',
            body: 'A sincronização com GitHub é suficiente para boa parte dos projetos no navegador: um site estático, um protótipo React ou Vue, um exercício de aula, uma pequena ferramenta interna ou uma demo que precisa de um remote e de uma fonte de deploy. Ela serve para um desenvolvedor solo que quer controle de versão sem instalar Git, um professor que precisa de uma entrega reproduzível e qualquer pessoa trabalhando em uma máquina sem terminal. Não é suficiente para um monorepo com submódulos, um repositório que depende de Git LFS, uma equipe que exige commits assinados ou uma revisão detalhada do histórico, nem um processo de release baseado em hooks e múltiplos remotes. Esses são trabalhos de Git no desktop, e fingir o contrário tornaria o fluxo no navegador pior. O padrão útil é híbrido. Comece no navegador porque a primeira prévia é imediata. Faça Push quando o projeto tiver uma forma que vale a pena manter. Abra o mesmo repositório no desktop quando o trabalho precisar de ferramentas nativas, um depurador mais profundo ou um fluxo Git completo. Traga as mudanças de volta pelo GitHub quando retornar ao navegador. Os arquivos são arquivos-fonte comuns, então a entrega é controle de versão, não migração. Para experimentar a metade do navegador, abra o Projects Dashboard em /app/projects, crie um projeto, abra o GitHub sync e faça o primeiro commit. A configuração completa e a referência de recursos estão na documentação.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Ler a documentação completa do GB Coder →',
      },
      'browser-ide-deploy-vercel-netlify': {
        slug: 'browser-ide-deploy-vercel-netlify',
        title: 'Deploy de projeto de IDE de navegador na Vercel ou Netlify',
        description: 'Como funciona o deploy de um IDE de navegador: tokens de provedor, uploads estáticos, builds da Vercel, URLs estáveis, limites, segurança, redeploys e falhas.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Deploy', 'Vercel', 'Netlify', 'IDE de navegador', 'Sites estáticos'],
        intro: 'O deploy é o momento em que um projeto de navegador deixa de ser uma prévia. Até então, o código vive em uma aba, os arquivos pertencem a um perfil do navegador e a única pessoa que consegue abrir o resultado é quem o construiu. Vercel e Netlify resolvem a hospedagem, mas o fluxo habitual deles pressupõe um repositório Git, um terminal ou uma pasta arrastada. O GB Coder segue um caminho mais curto: um botão Deploy empacota o projeto atual, envia pela API do provedor com o token da sua conta e devolve uma URL HTTPS pública. Este guia explica esse caminho em detalhes: o que é enviado, como o deploy é acompanhado, por que um segundo deploy pode manter o mesmo endereço e onde ficam os limites. Não é um guia geral de Vercel ou Netlify, mas uma explicação do que o painel do navegador realmente faz.',
        sections: [
          {
            heading: '1. Por que fazer deploy pelo navegador',
            body: 'O caso óbvio é uma máquina em que instalar uma CLI é inconveniente ou proibido. Um Chromebook, um computador de laboratório ou um desktop corporativo bloqueado abrem uma aba, mas nem sempre permitem instalar Node.js, Git e a CLI do provedor. Um IDE de navegador já remove esses requisitos para editar. O deploy costuma ser o último passo que devolve o desenvolvedor ao terminal; mantê-lo na mesma aba fecha o ciclo: o projeto é editado, visualizado e publicado sem toolchain local. O segundo caso é velocidade. Uma landing page, um protótipo ou uma demonstração para cliente podem precisar de URL antes de precisarem de repositório ou pipeline de CI. O painel do navegador publica o snapshot atual e informa onde ele está no ar. Essa conveniência tem um limite. Isto é um upload direto, não um pipeline de deploy. Ele não observa branch, não roda testes nem promove builds entre ambientes; isso pertence à integração Git do provedor ou ao CI. O caminho do navegador serve para a primeira URL, não para todo o processo de release.',
          },
          {
            heading: '2. O que o deploy em um clique realmente faz',
            body: 'O diálogo Deploy é uma camada fina de controle sobre duas APIs de provedor. Ao clicar em Deploy now, o GB Coder monta o mesmo pacote de arquivos do Download ZIP. Esse detalhe importa: não existe um segundo caminho de empacotamento que possa omitir uma folha de estilo ou esquecer uma biblioteca externa. Um projeto simples vira index.html, style.css, script.js e um README. Um projeto React ou Vue vira uma árvore no formato Vite, com index.html, package.json, vite.config.js, .gitignore, um README e fontes em src/. O resumo do pacote mostra o número exato de arquivos e o tamanho descompactado antes de qualquer coisa sair da aba. A Vercel recebe os arquivos como JSON inline no endpoint de deploy. A Netlify recebe um ZIP como corpo bruto da requisição. A Vercel cria ou serve o projeto; a Netlify publica os arquivos enviados como um deploy manual. Nenhum servidor da LadeStack fica no meio, e nenhuma CLI roda na sua máquina. O navegador é o cliente, o provedor é o host e o token é a única credencial. Um clique descreve a interface, não o trabalho: empacotamento, upload, processamento remoto e TLS ainda acontecem em sequência.',
          },
          {
            heading: '3. Sites estáticos e apps Vite seguem caminhos diferentes',
            body: 'O pacote é diferente porque os dois tipos de projeto precisam de tratamento distinto. Um projeto HTML/CSS/JavaScript simples não tem package.json. A Vercel recebe a instrução de não usar framework e serve os arquivos como site estático. A Netlify publica o ZIP como está, o que também é correto para arquivos estáticos. Não há nada para instalar ou compilar, então o primeiro deploy costuma ser rápido. Um projeto React ou Vue inclui package.json gerado, configuração do Vite e fontes. Na Vercel, o provedor detecta o Vite, instala dependências, roda o build de produção e publica a saída. Esse é um build real na nuvem, não uma simulação no navegador, e por isso pode levar um minuto ou mais. A Vercel também usa as versões registradas no package.json, não o que estava carregado no editor. O deploy manual por ZIP da Netlify não executa um comando de build, então a mesma árvore de fontes Vite é publicada como foi enviada, sem compilação. Para React ou Vue na Netlify, use a integração Git do provedor; o caminho de um clique da Netlify publica apenas saída estática. Bibliotecas externas e configurações de injeção já estão no pacote. Se um build da Vercel depende de um pacote privado, um binário nativo ou um serviço que a imagem de build não alcança, o build falha mesmo que a prévia funcione localmente. Os logs mostram em qual caso você está.',
          },
          {
            heading: '4. Um token com o escopo certo',
            body: 'Os dois provedores autenticam com um token de acesso pessoal. Não é a senha do provedor nem uma conta do GB Coder. O diálogo leva à página de tokens do provedor escolhido e explica o escopo em linguagem simples. Um token da Vercel pode publicar em todos os projetos que a conta ou o time alcançam; quando existir um token com escopo de time, use esse. Um token da Netlify age nos sites que a conta acessa, então trate-o como global, a menos que exista uma opção mais restrita. Crie o token para esse fim, dê a ele a menor vida útil possível e revogue-o quando o projeto não precisar mais. O GB Coder verifica se há um token e se o pacote cabe nos limites locais antes de habilitar Deploy now. O token fica na memória da aba por padrão. Remember on this device é opcional: em uma origem segura, o token é selado com AES-GCM antes de ser gravado no localStorage; caso contrário, o diálogo avisa que lembrar o armazenaria em texto puro. Escopo e revogação são os controles que mais importam.',
          },
          {
            heading: '5. O primeiro deploy, passo a passo',
            body: 'Abra um projeto e escolha Deploy na barra de ferramentas; em telas estreitas, ele fica no menu de overflow. A Vercel vem selecionada por padrão; a Netlify está a um clique. O nome do projeto é preenchido a partir do projeto atual. O GB Coder passa para minúsculas, troca caracteres inválidos por hífens e mostra o hostname que vai solicitar, como seu-projeto.vercel.app. Cole o token, decida se quer lembrar e confira o resumo do pacote. Se o número de arquivos ou o tamanho passar do limite, o diálogo explica o problema e mantém o botão desativado. Clique em Deploy now. O provedor cria o projeto ou site, recebe o pacote e começa a processar o deploy. Quando o deploy fica pronto, a tela de sucesso mostra a URL pública, o número de arquivos, o tamanho enviado, o tempo decorrido e um QR code para abrir a página no celular. Copy URL e Visit site servem para a entrega, e Build logs abre a visualização de logs do próprio provedor. Nomes de site da Netlify são globais, então um nome pedido pode já estar em uso. O provedor então atribui outro, e o GB Coder informa o endereço que está realmente no ar, não o que você digitou.',
          },
          {
            heading: '6. O que a tela de progresso realmente mostra',
            body: 'A barra de progresso passa por empacotamento, upload, build, proteção e pronto. Na Netlify, o rótulo de build representa o processamento do provedor, não um comando de build. É um relatório do cliente, não uma previsão do provedor. A porcentagem avança nas duas primeiras etapas e fica abaixo de 100 enquanto o provedor conclui o trabalho remoto. Isso é intencional: o trabalho remoto pode levar um tempo imprevisível, e uma barra que disparasse para 99% estaria mentindo. O GB Coder consulta o provedor a cada segundo e meio e atualiza a mensagem quando o estado muda. Uma requisição de upload tem timeout de dois minutos. O painel para de esperar após três minutos de polling do deploy e aponta para o dashboard, porque o deploy pode terminar mesmo quando o navegador já parou de olhar. Cancelar, fechar o diálogo ou pressionar Escape aborta a requisição em andamento e o loop de polling. Se o provedor já aceitou o deploy, o deploy pode continuar do lado dele; confira o dashboard antes de assumir que cancelar equivale a rollback. Os logs do provedor são a fonte autoritativa quando um deploy falha.',
          },
          {
            heading: '7. Novos deploys, URLs estáveis e estado do provedor',
            body: 'Deploy again volta ao formulário; não reenvia o último pacote imediatamente. Isso é útil quando o projeto mudou, o nome precisa de ajuste ou o token expirou. A partir daí, Vercel e Netlify seguem rotas diferentes para o mesmo endereço. A Vercel cria um deploy para o projeto nomeado e aponta para produção. Deploys repetidos com o mesmo nome atualizam esse projeto, e o alias de produção é preferido em relação à URL específica do deploy, então o endereço compartilhado costuma continuar estável. A Netlify precisa de um site id para atualizar um site existente em vez de criar outro. O GB Coder guarda esse id no localStorage, vinculado ao nome sanitizado do site. Se você limpar o armazenamento do navegador, trocar de navegador, mudar o nome ou excluir o site na Netlify, o próximo deploy não encontra o site antigo e cria um novo. Por isso, renomear um projeto na Netlify pode deixar o site anterior na conta. Os dois provedores mantêm histórico de deploys, domínios personalizados, controles de acesso e rollback nos próprios dashboards; o painel do GB Coder expõe apenas o upload e a URL pública. Todo deploy aqui é de produção; não há branch preview nem seletor de ambiente.',
          },
          {
            heading: '8. Limites e falhas que vale prever',
            body: 'Dois limites são aplicados antes de a requisição sair da aba: 900 arquivos e 64 MB de conteúdo descompactado. Eles ficam abaixo dos tetos dos provedores para que um upload enorme não falhe no meio de uma sessão de navegador. Um site com muita mídia deve manter imagens e vídeos grandes em um CDN ou no Git, não dentro do pacote do projeto. Os erros são separados por causa. Um 401 significa token recusado; um 403 geralmente indica falta de permissão na conta ou no time; um 413 ou 429 significa payload grande demais ou limite de taxa do provedor; um 422 indica projeto rejeitado como inválido; um 5xx costuma ser temporário. Na Vercel, uma falha de build de framework é diferente: o upload funcionou e o build falhou, então leia os logs em vez de colar um token novo. Um build da Vercel que precisa de variáveis de ambiente é outra fronteira. O diálogo não tem editor de variáveis. Defina os valores nas configurações do projeto da Vercel e faça o deploy de novo; o primeiro build pode falhar antes de o projeto existir. O caminho ZIP manual da Netlify não tem etapa de build, então isso não se aplica ali. Um limite de polling de três minutos não é um deploy falho, apenas uma espera que falhou.',
          },
          {
            heading: '9. Segurança, propriedade e a fronteira dos dados',
            body: 'O caminho do deploy é direto: o navegador chama api.vercel.com ou api.netlify.com com o seu token. Não há proxy que armazene a credencial, e nenhuma conta LadeStack é necessária para usar o painel. Tokens ficam só na sessão por padrão e são selados com AES-GCM apenas quando você opta por lembrar um em uma origem segura. Isso protege contra um token legível em backup de perfil ou pacote de suporte, mas não contra código malicioso na mesma origem enquanto a aba está aberta. Use o token mais restrito disponível, defina expiração e revogue-o no provedor quando o trabalho terminar. A propriedade segue o token: o projeto ou site é criado na conta do provedor que o possui, sob os termos, cotas, logs e cobrança desse provedor. O GB Coder continua local-first, mas o deploy é uma exportação explícita do projeto para o provedor. O provedor recebe o código do site, e o resultado é uma URL HTTPS pública por padrão; proteção por senha, SSO e domínios personalizados são recursos do provedor. Guarde um ZIP ou uma cópia no GitHub se o perfil do navegador for o único outro lugar onde o projeto existe.',
          },
          {
            heading: '10. Quando o deploy pelo navegador é a ferramenta certa',
            body: 'Use este caminho quando a tarefa é colocar um site pequeno no ar rápido: landing page, portfólio, demonstração de aula, protótipo para revisão de cliente ou página de documentação estática. Também serve quando o projeto já vive no GB Coder e a alternativa é exportar um ZIP, abrir um terminal e configurar uma CLI em uma máquina que não é sua. Ele não serve para monorepo, aplicação renderizada no servidor com banco de dados, build que exige credenciais de registro privado, time que lança por branch previews e aprovações, ou ativos acima dos limites de upload. Esses são trabalhos da integração Git do provedor, de um pipeline de CI ou de um ambiente desktop. As duas abordagens podem conviver: rascunhe e itere no navegador, envie o código ao GitHub quando ele merecer histórico e deixe o CI publicar o build de produção. Uma rotina prática: teste a prévia na largura de celular, confira o resumo do pacote, faça o deploy, abra a URL em um segundo dispositivo e guarde o log do build. Para experimentar, abra o painel de projetos em /app/projects, crie ou abra um projeto e escolha Deploy. A referência de configuração está na documentação.',
          },
        ],
        relatedDocsLink: '/docs#getting-started',
        relatedDocsLabel: 'Ler a documentação completa do GB Coder →',
      },
      'browser-ide-api-keys-environment-variables': {
        slug: 'browser-ide-api-keys-environment-variables',
        title: 'Chaves de API e variáveis de ambiente em um IDE de navegador',
        description: 'Onde ficam as chaves de API e as variáveis de ambiente em um IDE de navegador: exposição no cliente, armazenamento, escopo, rotação, deploy e resposta.',
        date: '2026-10-20',
        author: 'Girish Lade',
        tags: ['Segurança', 'Chaves de API', 'Variáveis de ambiente', 'IDE de navegador', 'Boas práticas'],
        intro: 'Todo IDE de navegador chega, cedo ou tarde, à mesma pergunta: onde ficam as chaves? O projeto precisa de um endpoint de API, o painel de IA precisa de uma chave de provedor e o deploy precisa de um token de conta. Em uma máquina desktop, esses valores podem ficar em um perfil de shell ou em um arquivo não rastreado. Em uma aba do navegador, a fronteira é diferente. Tudo o que é enviado com a página pode ser lido pela página, e tudo o que é armazenado no perfil do navegador pertence a esse perfil. Este guia propõe um modelo prático: quais valores podem ser publicados, quais nunca devem chegar ao cliente, como o GB Coder lida com credenciais de provedores e o que fazer quando uma chave vaza. Ele é para quem quer a conveniência de um IDE de navegador sem fingir que uma aba é um cofre.',
        sections: [
          {
            heading: '1. Uma aba do navegador é um alvo de build público',
            body: 'A primeira regra é desconfortável, mas simples: um aplicativo web estático não consegue guardar um segredo. O navegador baixa HTML, CSS e JavaScript e os executa na máquina do usuário. Qualquer pessoa pode abrir o DevTools, ler o painel de rede, pesquisar o bundle ou definir um breakpoint e inspecionar uma variável. Minificar o código, dividi-lo em chunks ou esconder um valor em um arquivo de configuração muda o esforço, não o resultado. Um IDE de navegador adiciona um sandbox para executar o código do projeto, mas a interface do próprio IDE continua rodando na mesma origem e precisa ler o que for necessário para funcionar. O sandbox não é um cofre para valores que a própria interface precisa usar. O teste útil é direto: se um valor precisa estar disponível para o código que roda na aba, presuma que a pessoa que usa a aba pode lê-lo, e que qualquer script na mesma origem também pode. Isso não torna o desenvolvimento no navegador inseguro. Define a fronteira. Identificadores públicos podem ficar ali; credenciais de servidor não.',
          },
          {
            heading: '2. O que uma variável de ambiente significa em um app estático',
            body: 'Em um servidor Node.js, uma variável de ambiente é lida em tempo de execução a partir do processo. Em um build de Vite, Create React App, Next.js ou Astro, as variáveis de ambiente públicas funcionam de outra forma: o bundler substitui as referências por strings literais durante o build. O Vite expõe variáveis com o prefixo VITE_ por meio de import.meta.env; o Create React App usa REACT_APP_; o Next.js usa NEXT_PUBLIC_; o Astro usa PUBLIC_. O prefixo é uma convenção de nomes, não um controle de segurança. Depois que um valor é embutido, ele faz parte do JavaScript que cada visitante baixa. Uma variável sem prefixo público normalmente não fica disponível para o código do cliente, e é por isso que valores exclusivos do servidor precisam ser lidos por um servidor ou uma função serverless, não por uma página estática. Um arquivo .env é uma entrada de desenvolvimento e build, não um cofre de segredos em tempo de execução. Ele é útil para configuração local e para manter valores fora do controle de versão, mas não torna um valor privado depois do build.',
            codeSnippet: `# Safe to expose: a public endpoint
VITE_API_URL=https://api.example.com

# Never expose: keep this on a server
STRIPE_SECRET_KEY=REPLACE_WITH_SERVER_SECRET`,
            codeLang: 'bash',
          },
          {
            heading: '3. Quais chaves podem ficar no navegador',
            body: 'Algumas chaves são feitas para serem públicas. Uma chave publicável do Stripe identifica uma conta e cria tokens de pagamento; a chave secreta realmente movimenta dinheiro e precisa ficar em um servidor. Uma chave anon do Supabase só é segura quando as políticas de row-level security estão corretas. Uma configuração web do Firebase identifica um projeto, mas não concede acesso administrativo. Chaves de mapas e de medição de uso costumam ser restritas por domínio ou API. Esses valores podem ir para o navegador, mas ainda merecem limites: origens permitidas, restrições de API, papéis com privilégios mínimos, cotas e alertas. A categoria oposta é mais fácil de enumerar. Chaves de service role, senhas de banco de dados, credenciais SMTP, segredos de assinatura e chaves privadas de provedores de IA nunca devem estar em um bundle estático. Uma chave de provedor que pertence à aplicação é especialmente perigosa: quem a encontrar pode gastar o dinheiro da aplicação. Uma chave que pertence ao usuário é outro caso. Continua sendo uma credencial bearer, mas é dele, e o objetivo é mantê-la no navegador do usuário, não no projeto ou no repositório.',
          },
          {
            heading: '4. Como o GB Coder lida com credenciais de provedores',
            body: 'O painel de IA do GB Coder funciona no modelo bring-your-own-key. O gerenciador de chaves mantém as chaves de provedor na memória por padrão. Ele não as grava no localStorage. O usuário pode optar explicitamente por persistir no sessionStorage, o que limita o valor à aba atual e normalmente o apaga quando a aba fecha. A chave é removida da memória e do armazenamento de sessão quando o usuário a apaga. O gerenciador também vincula cada chave a uma origem de endpoint autorizada, e um gateway de saída verifica se a credencial não está sendo enviada a um destino não aprovado. Erros de provedores passam por uma camada de redação que remove padrões de chave e chaves ativas antes que a mensagem chegue à interface ou a um log. Metadados de provedores personalizados são armazenados no localStorage, mas cabeçalhos marcados como secretos são apagados antes da persistência e precisam ser digitados novamente. As requisições vão diretamente do navegador para o endpoint do provedor; o GB Coder não faz proxy da chave por um servidor da LadeStack. Essas medidas reduzem a persistência acidental e vazamentos entre origens. Não mudam a regra básica: qualquer script que consiga rodar na mesma origem pode ler o que a página lê. Use um perfil limpo para trabalho sensível e não instale extensões não confiáveis.',
          },
          {
            heading: '5. Segredos do projeto, arquivos .env e embutimento no build',
            body: 'Mantenha segredos fora da árvore do projeto. Adicione .env e suas variantes locais ao .gitignore e faça commit de um .env.example com nomes de espaço reservado. Se o projeto usa Vite, lembre-se de que toda variável VITE_ é embutida no bundle de produção. Um valor conveniente durante o desenvolvimento local se torna público no momento em que é usado em um build de produção. Antes do deploy, inspecione os assets gerados em busca de padrões de chave e trate qualquer ocorrência como incidente, não como aviso. A verificação de segredos e a proteção de push do GitHub podem detectar alguns formatos de token conhecidos, mas são uma rede de segurança, não um substituto para manter os valores fora do repositório. A exportação ZIP de um IDE de navegador inclui os arquivos do projeto. Se houver um arquivo .env dentro do projeto, ele viaja com o backup. Um backup não é um cofre criptografado. Guarde as exportações em um local privado e exclua cópias antigas quando não forem mais necessárias. O mesmo vale para capturas de tela, relatos de problemas e mensagens de chat: uma chave colada em qualquer um deles já saiu do navegador.',
            codeSnippet: `# .gitignore
.env
.env.local
.env.*.local`,
            codeLang: 'bash',
          },
          {
            heading: '6. Tokens do GitHub e de deploy',
            body: 'Tokens de acesso pessoal do GitHub e tokens de deploy são mais poderosos do que parecem. Um token clássico com escopos repository e workflow pode ler código privado, alterar arquivos e disparar releases. Prefira tokens fine-grained com um único repositório, uma lista explícita de permissões e uma data de expiração. Dê ao token apenas as permissões de que a tarefa precisa: leitura e escrita de contents para uma sincronização, sem administration ou billing. Crie tokens separados para dispositivos ou finalidades diferentes e revogue-os quando o trabalho terminar. Tokens de deploy da Vercel ou da Netlify podem publicar, substituir ou excluir projetos. Se o provedor oferece escopo por projeto ou equipe, use; se oferece expiração, defina uma. Cole o token no painel de deploy apenas quando necessário e não o salve em um arquivo do projeto. Em CI, use segredos do repositório ou da organização em vez de um .env commitado, e lembre-se de que pull requests de forks normalmente não recebem segredos. Um token que foi capturado em screenshot, compartilhado em um chat ou commitado em um repositório público deve ser tratado como comprometido, mesmo que tenha sido excluído um segundo depois.',
          },
          {
            heading: '7. Chaves de provedores de IA: BYOK sem surpresas',
            body: 'Uma chave de provedor de IA é uma credencial bearer com uma fatura anexada. Quem a tiver pode enviar requisições, consumir cota e gerar cobranças. Use uma chave limitada a um projeto, defina um limite de gastos quando o provedor oferecer e use uma chave separada para experimentos em vez da chave mestra da organização. Verifique o uso regularmente, especialmente depois de compartilhar um dispositivo ou instalar uma nova extensão. Provedores locais como Ollama, LM Studio e vLLM não precisam de chave na nuvem, mas seus endpoints continuam sendo serviços na máquina. Não exponha um endpoint local à internet pública só para fazer uma demonstração funcionar. Se um provedor personalizado aponta para um proxy, o proxy pode ver a chave; use apenas um proxy que você controla e entende. Prompt injection é um risco relacionado: um arquivo, uma página web ou uma mensagem de erro colada pode conter instruções voltadas ao assistente. Mantenha segredos fora dos prompts e dos arquivos que o assistente tem permissão para ler. Se uma chave aparecer em uma conversa, rotacione-a.',
          },
          {
            heading: '8. Computadores compartilhados, extensões e XSS',
            body: 'Um computador compartilhado ou de laboratório exige uma rotina diferente. Use um perfil de navegador privado, não opte pela persistência de sessão e feche a aba ao terminar. Se o navegador oferecer para salvar a chave, recuse. Limpe o armazenamento do site se suspeitar que ele foi mantido. Extensões de navegador também fazem parte da fronteira: uma extensão com permissões amplas de host muitas vezes pode ler o conteúdo ou o armazenamento da página, e uma atualização maliciosa pode chegar depois da instalação. Use um perfil mínimo para trabalhos que envolvem credenciais. Cross-site scripting é o risco web clássico nesse contexto. Se um atacante conseguir executar um script na origem do IDE, esse script pode ler localStorage e sessionStorage e fazer requisições enquanto a página estiver aberta. Mantenha as dependências atualizadas, evite scripts de terceiros não confiáveis e considere uma content security policy no site implantado. Gerenciadores de área de transferência e ferramentas de compartilhamento de tela também veem o que você copia e exibe. Limpe a área de transferência depois de mover uma chave e pause o compartilhamento antes de abrir um painel de configurações do provedor.',
          },
          {
            heading: '9. Rotacionando uma chave vazada',
            body: 'Rotação é a única resposta confiável para uma chave vazada. Revogar primeiro é importante: se a chave antiga continuar válida enquanto a substituição é preparada, a exposição continua. Crie a nova chave com o escopo mais estreito que funcione, atualize a aplicação ou as configurações do navegador, refaça o deploy se o valor fazia parte de um build e verifique se a chave antiga é rejeitada. Depois, confira o uso e os logs de auditoria do provedor em busca de atividade inesperada. Se a chave foi commitada no Git, apagar o arquivo não basta; o valor permanece no histórico. Rotacione primeiro, depois reescreva o histórico com uma ferramenta como git filter-repo ou BFG, faça force-push com o acordo da equipe e peça aos colaboradores que clonem novamente. Plataformas de hospedagem podem armazenar builds antigos em cache, então garanta que o valor antigo não possa ser servido a partir de um bundle desatualizado. Se a chave foi colada em um chat de IA, um ticket de suporte ou uma captura de tela, presuma que foi retida e rotacione. Por fim, registre o que aconteceu, adicione uma verificação que teria detectado o problema e encurte a vida útil da próxima chave.',
          },
          {
            heading: '10. Uma checklist prática',
            body: 'Use esta sequência antes que um projeto saia do navegador. Primeiro, classifique cada valor: identificador público, credencial de usuário ou segredo de servidor. Segundo, mantenha segredos de servidor fora do bundle estático e coloque-os atrás de uma função serverless ou API. Terceiro, exponha apenas valores que precisam do prefixo público e inspecione os assets compilados antes do deploy. Quarto, mantenha arquivos .env fora do Git, faça commit de um .env.example e ative a verificação de segredos. Quinto, crie tokens com escopo e expiração para GitHub e hospedagem, um por finalidade. Sexto, no GB Coder, deixe as chaves na memória a menos que esteja em um dispositivo confiável, e opte pela persistência de sessão apenas quando entender o trade-off. Sétimo, nunca cole uma chave em um prompt, uma issue, uma captura de tela ou um arquivo do projeto. Oitavo, rotacione em qualquer dúvida e revogue antes de substituir. Nono, use um perfil de navegador limpo em máquinas compartilhadas. Décimo, escreva o plano para um vazamento antes de precisar dele. Um IDE de navegador pode lidar com credenciais de forma responsável quando trata o navegador como um cliente público, não como um cofre privado.',
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
    'browser-ide-vs-desktop-ide',
    'browser-ide-github-sync',
    'browser-ide-deploy-vercel-netlify',
    'browser-ide-api-keys-environment-variables',
  ];
}
