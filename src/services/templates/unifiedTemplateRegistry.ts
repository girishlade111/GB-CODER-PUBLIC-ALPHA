/**
 * Unified Project Template Registry
 *
 * Phase 1D: Framework Detection Engine & Unified Template Infrastructure.
 * Centralizes template discovery, metadata, validation, and safe file generation.
 *
 * Safety Invariants:
 * - Preserves existing ProjectType ('plain' | 'react' | 'vue') for database compatibility.
 * - Preserves existing editorStyle ('plain' | 'vscode').
 * - Validates all file paths against directory traversal and unsafe characters.
 * - Re-classifies existing Next.js templates honestly as 'client_simulated'.
 * - Declares planned starter slots for genuine Next.js (Phase 1E) and Astro/Angular (Phase 1F).
 */

import type { ProjectType } from '../../types/files';
import { enhancedTemplateService } from '../enhancedTemplateService';

export type TemplateFramework =
  | 'vanilla'
  | 'typescript'
  | 'react'
  | 'react-vite'
  | 'vue'
  | 'vue-vite'
  | 'nextjs'
  | 'astro'
  | 'angular'
  | 'svelte'
  | 'sveltekit'
  | 'express'
  | 'node-cli';

export type TemplateSupportStatus =
  | 'ready'
  | 'client_simulated'
  | 'planned_phase_1e'
  | 'planned_phase_1f'
  | 'deprecated';

export type TemplateRuntimeType =
  | 'webcontainer'
  | 'client-simulated'
  | 'planned';

export interface UnifiedTemplateDescriptor {
  id: string;
  title: string;
  description: string;
  framework: TemplateFramework;
  category: string;
  supportStatus: TemplateSupportStatus;
  runtimeType: TemplateRuntimeType;
  projectType: ProjectType; // Strictly 'plain' | 'react' | 'vue'
  recommendedEditor: 'plain' | 'vscode';
  packageManager: 'npm' | 'pnpm' | 'yarn';
  targetMilestone?: string;
  icon?: string;
  badge?: string;
  tags: string[];
  isOfficial: boolean;
  requiresBuildStep: boolean;
  runtimeNotes?: string;
}

/**
 * Validates a template relative file path.
 * Rejects path traversal (..), absolute paths, Windows drive paths, leading slashes, and null bytes.
 */
export function validateTemplatePath(path: string): { valid: boolean; reason?: string } {
  if (!path || typeof path !== 'string') {
    return { valid: false, reason: 'Path must be a non-empty string' };
  }
  if (path.includes('\0')) {
    return { valid: false, reason: 'Path contains forbidden null byte' };
  }
  if (/^[a-zA-Z]:/.test(path)) {
    return { valid: false, reason: 'Absolute Windows drive path is forbidden' };
  }
  if (path.startsWith('/') || path.startsWith('\\')) {
    return { valid: false, reason: 'Leading slashes not allowed in relative template paths' };
  }

  const normalized = path.replace(/\\/g, '/');
  const segments = normalized.split('/');
  for (const segment of segments) {
    if (segment === '..') {
      return { valid: false, reason: 'Path traversal (..) is strictly forbidden' };
    }
    if (segment === '.') {
      return { valid: false, reason: 'Current directory reference (.) in path segment is forbidden' };
    }
  }

  return { valid: true };
}

/**
 * Static files for built-in minimal templates.
 */
const BUILTIN_STATIC_TEMPLATES: Record<string, Record<string, string>> = {
  blank: {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Blank Project</h1>
  <p>Start editing to build something great.</p>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  padding: 2rem;
  background-color: #f8fafc;
  color: #0f172a;
}`,
    'script.js': `console.log("Blank project loaded");`,
  },
  'hello-world': {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>Hello World</h1>
    <p>Welcome to GB Coder IDE.</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  display: grid;
  place-content: center;
  min-height: 100vh;
  margin: 0;
  background: #0f172a;
  color: #f8fafc;
}

.card {
  padding: 2rem;
  border-radius: 12px;
  background: #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  text-align: center;
}`,
    'script.js': `console.log("Hello World initialized");`,
  },
  'node-cli-starter': {
    'package.json': JSON.stringify(
      {
        name: 'node-cli-starter',
        version: '1.0.0',
        description: 'Interactive Node.js CLI tool in WebContainer',
        main: 'bin/cli.js',
        bin: {
          'my-cli': './bin/cli.js',
        },
        scripts: {
          start: 'node bin/cli.js',
          test: 'node bin/cli.js --help',
        },
        keywords: ['cli', 'node', 'webcontainer'],
        author: 'GB Coder',
        license: 'MIT',
      },
      null,
      2
    ),
    'bin/cli.js': `#!/usr/bin/env node
console.log("=========================================");
console.log("  GB Coder Node CLI Starter");
console.log("=========================================");

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("\\nUsage: my-cli [options]");
  console.log("Options:");
  console.log("  --help, -h     Show help");
  console.log("  --version, -v  Show version");
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log("v1.0.0");
  process.exit(0);
}

console.log("Node runtime:", process.version);
console.log("Platform:", process.platform);
console.log("Command line args:", args);
`,
    'README.md': `# Node CLI Starter

Run via interactive terminal:
\`\`\`bash
node bin/cli.js
\`\`\`
`,
  },
  'nextjs-genuine-starter': {
    'package.json': JSON.stringify(
      {
        name: 'nextjs-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '14.2.24',
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          '@next/swc-wasm-nodejs': '14.2.24',
        },
        devDependencies: {
          '@types/node': '^20.11.0',
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          typescript: '^5.4.0',
        },
      },
      null,
      2
    ),
    'next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
`,
    'tsconfig.json': JSON.stringify(
      {
        compilerOptions: {
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [
            {
              name: 'next',
            },
          ],
          paths: {
            '@/*': ['./*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2
    ),
    'next-env.d.ts': `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`,
    'app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js App — GB Coder',
  description: 'Genuine Next.js SSR running inside WebContainer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
    'app/globals.css': `:root {
  --bg: #0f172a;
  --card: #1e293b;
  --border: #334155;
  --text: #f8fafc;
  --muted: #94a3b8;
  --accent: #38bdf8;
  --accent-hover: #0ea5e9;
  --success: #22c55e;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  width: 100%;
}

.header {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}

.badge {
  display: inline-block;
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--muted);
  font-size: 1.125rem;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.server-tag {
  font-size: 0.75rem;
  background: #4338ca;
  color: #e0e7ff;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.client-tag {
  font-size: 0.75rem;
  background: #047857;
  color: #d1fae5;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.code-box {
  background: #0b1120;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  color: #38bdf8;
}

.counter-btn {
  background: var(--accent);
  color: #0f172a;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.15s ease;
}

.counter-btn:hover {
  background: var(--accent-hover);
}
`,
    'app/components/Counter.tsx': `'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
      <button className="counter-btn" onClick={() => setCount((c) => c + 1)}>
        Clicks: {count}
      </button>
      <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
        Interactive React Client Component hydrated in browser
      </span>
    </div>
  );
}
`,
    'app/page.tsx': `import Counter from './components/Counter';

export default function HomePage() {
  const serverTime = new Date().toISOString();

  return (
    <main>
      <header className="header">
        <span className="badge">WebContainer Node.js SSR</span>
        <h1 className="title">Next.js App Router</h1>
        <p className="description">
          Genuine Next.js development server running inside GB Coder WebContainer runtime.
        </p>
      </header>

      <section className="card">
        <h2 className="card-title">
          <span>Server-Side Rendered (RSC)</span>
          <span className="server-tag">RSC</span>
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>
          This component rendered on the Next.js server instance:
        </p>
        <div className="code-box">Server Rendered at: {serverTime}</div>
      </section>

      <section className="card">
        <h2 className="card-title">
          <span>Client Component Hydration</span>
          <span className="client-tag">use client</span>
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>
          Fast Refresh and state hydration work seamlessly:
        </p>
        <Counter />
      </section>

      <section className="card">
        <h2 className="card-title">
          <span>API Route Handler</span>
          <span className="server-tag">Route Handler</span>
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>
          Test the WebContainer server endpoint at <code>/api/health</code>:
        </p>
        <div className="code-box">GET /api/health → 200 OK &#123; status: &quot;ok&quot; &#125;</div>
      </section>
    </main>
  );
}
`,
    'app/api/health/route.ts': `export async function GET() {
  return Response.json({
    status: 'ok',
    framework: 'Next.js',
    router: 'app-router',
    runtime: 'WebContainer Node.js',
    timestamp: new Date().toISOString(),
  });
}
`,
    'README.md': `# Next.js App Router Starter

Runs with genuine Next.js in WebContainers using Webpack and WASM SWC compiler bindings.

## Development
\`\`\`bash
npm run dev
\`\`\`

## Features
- Next.js 14 App Router
- React Server Components (RSC) & Client Hydration
- Route Handlers (\`app/api/health/route.ts\`)
- TypeScript & WebContainer Fast Refresh
`,
  },
};

/**
 * Registry of unified template descriptors.
 */
const UNIFIED_TEMPLATES: Record<string, UnifiedTemplateDescriptor> = {
  // --- Vanilla Starters ---
  blank: {
    id: 'blank',
    title: 'Blank Project',
    description: 'Empty HTML/CSS/JavaScript template to start from scratch',
    framework: 'vanilla',
    category: 'basic',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'plain',
    recommendedEditor: 'plain',
    packageManager: 'npm',
    icon: '📄',
    tags: ['vanilla', 'starter', 'blank'],
    isOfficial: true,
    requiresBuildStep: false,
    runtimeNotes: 'Runs directly in browser live preview without bundler overhead.',
  },
  'hello-world': {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Simple hello world starter template',
    framework: 'vanilla',
    category: 'basic',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'plain',
    recommendedEditor: 'plain',
    packageManager: 'npm',
    icon: '👋',
    tags: ['vanilla', 'starter', 'hello-world'],
    isOfficial: true,
    requiresBuildStep: false,
    runtimeNotes: 'Runs directly in browser live preview without bundler overhead.',
  },
  'plain-blog': {
    id: 'plain-blog',
    title: 'Editorial Blog',
    description: 'Clean typography blog with articles and reading mode',
    framework: 'vanilla',
    category: 'plain',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'plain',
    recommendedEditor: 'plain',
    packageManager: 'npm',
    icon: '📰',
    tags: ['plain', 'blog', 'editorial', 'vanilla'],
    isOfficial: true,
    requiresBuildStep: false,
    runtimeNotes: 'Pure HTML5 and CSS3 with responsive typography.',
  },

  // --- React + Vite Starters ---
  'react-todo': {
    id: 'react-todo',
    title: 'React Task Manager',
    description: 'Interactive React todo application with filtering and localStorage persistence',
    framework: 'react-vite',
    category: 'react',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '⚛️',
    tags: ['react', 'vite', 'tasks', 'todo'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Vite-ready component tree. Runs in WebContainer bundler.',
  },
  'react-weather': {
    id: 'react-weather',
    title: 'React Weather App',
    description: 'Live weather forecast dashboard with location search and animated weather icons',
    framework: 'react-vite',
    category: 'react',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '🌤️',
    tags: ['react', 'vite', 'weather', 'api'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'React client component structure with fast refresh.',
  },
  'react-dashboard': {
    id: 'react-dashboard',
    title: 'React Analytics Dashboard',
    description: 'Comprehensive admin dashboard with stats, charts, and activity feeds',
    framework: 'react-vite',
    category: 'react',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '📊',
    tags: ['react', 'vite', 'dashboard', 'charts'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Modern React dashboard with modular component architecture.',
  },
  'react-saas-platform': {
    id: 'react-saas-platform',
    title: 'React SaaS Platform',
    description: 'Full-featured SaaS platform UI with billing, user seats, and settings',
    framework: 'react-vite',
    category: 'react',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '🚀',
    tags: ['react', 'vite', 'saas', 'enterprise'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Enterprise-grade React application with component state isolation.',
  },

  // --- Vue + Vite Starters ---
  'vue-tasks': {
    id: 'vue-tasks',
    title: 'Vue Task Tracker',
    description: 'Reactive task tracking application built with Vue 3 Composition API',
    framework: 'vue-vite',
    category: 'vue',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'vue',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '💚',
    tags: ['vue', 'vite', 'tasks'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Vue 3 Single File Component setup with Vite.',
  },
  'vue-cloud-dashboard': {
    id: 'vue-cloud-dashboard',
    title: 'Vue Cloud Operations',
    description: 'Cloud infrastructure dashboard with real-time resource meters and alerts',
    framework: 'vue-vite',
    category: 'vue',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'vue',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '☁️',
    tags: ['vue', 'vite', 'cloud', 'dashboard'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Reactive Vue 3 Composition API state with Vite HMR.',
  },
  'vue-agency-portfolio': {
    id: 'vue-agency-portfolio',
    title: 'Vue Creative Agency',
    description: 'High-polish creative studio portfolio with smooth transitions and case studies',
    framework: 'vue-vite',
    category: 'vue',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'vue',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '🎨',
    tags: ['vue', 'vite', 'portfolio', 'agency'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Smooth-scrolling Vue components with animated transitions.',
  },

  // --- Node CLI Starter ---
  'node-cli-starter': {
    id: 'node-cli-starter',
    title: 'Node.js CLI Tool',
    description: 'Command line executable utility running directly in WebContainer terminal',
    framework: 'node-cli',
    category: 'utility',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'plain',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    icon: '💻',
    tags: ['node', 'cli', 'utility'],
    isOfficial: true,
    requiresBuildStep: false,
    runtimeNotes: 'Interactive Node CLI script executable in WebContainer terminal.',
  },

  // --- Next.js Client-Simulated Starters (Re-classified honestly) ---
  'nextjs-blog': {
    id: 'nextjs-blog',
    title: 'Next.js Modern Blog (Simulated)',
    description: 'Editorial blog simulating Next.js App Router patterns in the client',
    framework: 'nextjs',
    category: 'nextjs',
    supportStatus: 'client_simulated',
    runtimeType: 'client-simulated',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1D',
    icon: '▲',
    badge: 'Simulated Router',
    tags: ['nextjs', 'react', 'blog', 'simulated'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Client-side React App Router emulation. Real WebContainer Next.js SSR planned for Phase 1E.',
  },
  'nextjs-ai-startup': {
    id: 'nextjs-ai-startup',
    title: 'Next.js AI Startup (Simulated)',
    description: 'AI product landing and demo interface simulating Next.js architecture',
    framework: 'nextjs',
    category: 'nextjs',
    supportStatus: 'client_simulated',
    runtimeType: 'client-simulated',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1D',
    icon: '▲',
    badge: 'Simulated Router',
    tags: ['nextjs', 'react', 'ai', 'startup', 'simulated'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Client-side React App Router emulation. Real WebContainer Next.js SSR planned for Phase 1E.',
  },
  'nextjs-crm-platform': {
    id: 'nextjs-crm-platform',
    title: 'Next.js CRM Platform (Simulated)',
    description: 'Enterprise CRM dashboard simulating Next.js App Router data flows',
    framework: 'nextjs',
    category: 'nextjs',
    supportStatus: 'client_simulated',
    runtimeType: 'client-simulated',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1D',
    icon: '▲',
    badge: 'Simulated Router',
    tags: ['nextjs', 'react', 'crm', 'simulated'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Client-side React App Router emulation. Real WebContainer Next.js SSR planned for Phase 1E.',
  },

  // --- Genuine Next.js App Router Starter (Phase 1E Verified) ---
  'nextjs-genuine-starter': {
    id: 'nextjs-genuine-starter',
    title: 'Next.js App Router (Node SSR)',
    description: 'Genuine Next.js SSR, React Server & Client Components, and API Route Handlers running in WebContainer via Webpack & WASM SWC.',
    framework: 'nextjs',
    category: 'nextjs',
    supportStatus: 'ready',
    runtimeType: 'webcontainer',
    projectType: 'react',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1E',
    icon: '▲',
    badge: 'Genuine SSR',
    tags: ['nextjs', 'ssr', 'app-router', 'webcontainer', 'phase-1e'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Genuine Next.js Node.js server engine in WebContainer via Webpack & WASM SWC.',
  },

  // --- Planned Starter Slots (Phase 1F) ---
  'astro-starter': {
    id: 'astro-starter',
    title: 'Astro Content & Island Starter',
    description: 'Astro islands architecture with multi-framework components. Planned for Phase 1F.',
    framework: 'astro',
    category: 'framework',
    supportStatus: 'planned_phase_1f',
    runtimeType: 'planned',
    projectType: 'plain',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1F',
    icon: '🚀',
    badge: 'Planned Phase 1F',
    tags: ['astro', 'islands', 'ssr', 'phase-1f'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Genuine Astro compiler runtime planned for Phase 1F.',
  },
  'angular-starter': {
    id: 'angular-starter',
    title: 'Angular Standalone Starter',
    description: 'Angular standalone components with reactive signals. Planned for Phase 1F.',
    framework: 'angular',
    category: 'framework',
    supportStatus: 'planned_phase_1f',
    runtimeType: 'planned',
    projectType: 'plain',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1F',
    icon: '🅰️',
    badge: 'Planned Phase 1F',
    tags: ['angular', 'signals', 'typescript', 'phase-1f'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Genuine Angular CLI & runtime engine planned for Phase 1F.',
  },
  'sveltekit-starter': {
    id: 'sveltekit-starter',
    title: 'SvelteKit Full-Stack Starter',
    description: 'SvelteKit web application with file-based routing. Planned for Phase 1F.',
    framework: 'sveltekit',
    category: 'framework',
    supportStatus: 'planned_phase_1f',
    runtimeType: 'planned',
    projectType: 'plain',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1F',
    icon: '🔥',
    badge: 'Planned Phase 1F',
    tags: ['svelte', 'sveltekit', 'fullstack', 'phase-1f'],
    isOfficial: true,
    requiresBuildStep: true,
    runtimeNotes: 'Genuine SvelteKit full-stack runtime planned for Phase 1F.',
  },
  'express-starter': {
    id: 'express-starter',
    title: 'Express REST API',
    description: 'Modular Node.js REST API with routing and JSON serialization. Planned for Phase 1F.',
    framework: 'express',
    category: 'fullstack',
    supportStatus: 'planned_phase_1f',
    runtimeType: 'planned',
    projectType: 'plain',
    recommendedEditor: 'vscode',
    packageManager: 'npm',
    targetMilestone: 'Phase 1F',
    icon: '🚂',
    badge: 'Planned Phase 1F',
    tags: ['express', 'node', 'api', 'phase-1f'],
    isOfficial: true,
    requiresBuildStep: false,
    runtimeNotes: 'Express server runtime planned for Phase 1F.',
  },
};

/**
 * Retrieves a unified template descriptor by ID.
 */
export function getUnifiedTemplate(id: string): UnifiedTemplateDescriptor | undefined {
  return UNIFIED_TEMPLATES[id];
}

/**
 * Lists unified templates, optionally filtered by framework and support status.
 */
export function listUnifiedTemplates(filter?: {
  framework?: TemplateFramework;
  supportStatus?: TemplateSupportStatus;
}): UnifiedTemplateDescriptor[] {
  let list = Object.values(UNIFIED_TEMPLATES);
  if (filter?.framework) {
    list = list.filter((t) => t.framework === filter.framework);
  }
  if (filter?.supportStatus) {
    list = list.filter((t) => t.supportStatus === filter.supportStatus);
  }
  return list;
}

/**
 * Lists templates matching a specific framework.
 */
export function getTemplatesByFramework(framework: TemplateFramework): UnifiedTemplateDescriptor[] {
  return listUnifiedTemplates({ framework });
}

/**
 * Generates file dictionary for a template.
 * Validates each file path against path traversal and dangerous characters.
 * Rejects generation for planned/unimplemented milestone templates.
 */
export async function generateTemplateFiles(templateId: string): Promise<Record<string, string>> {
  const tpl = getUnifiedTemplate(templateId);
  if (!tpl) {
    throw new Error(`Template not found in registry: "${templateId}"`);
  }

  if (tpl.supportStatus === 'planned_phase_1e' || tpl.supportStatus === 'planned_phase_1f') {
    throw new Error(
      `Template "${templateId}" is scheduled for ${tpl.targetMilestone || 'a future milestone'} and cannot be generated yet.`
    );
  }

  // 1. Check built-in static templates
  if (BUILTIN_STATIC_TEMPLATES[templateId]) {
    const files = BUILTIN_STATIC_TEMPLATES[templateId];
    for (const filePath of Object.keys(files)) {
      const check = validateTemplatePath(filePath);
      if (!check.valid) {
        throw new Error(`Unsafe template path in template "${templateId}": "${filePath}" (${check.reason})`);
      }
    }
    return { ...files };
  }

  // 2. Load from enhancedTemplateService
  const payload = await enhancedTemplateService.getTemplateById(templateId);
  if (!payload) {
    throw new Error(`Failed to load template payload for: "${templateId}"`);
  }

  const result: Record<string, string> = {};

  if ('files' in payload && Array.isArray(payload.files)) {
    for (const f of payload.files) {
      const cleanPath = (f.path || '').replace(/^\/+/, '');
      const check = validateTemplatePath(cleanPath);
      if (!check.valid) {
        throw new Error(`Unsafe template path in template "${templateId}": "${cleanPath}" (${check.reason})`);
      }
      result[cleanPath] = f.content || '';
    }
  } else if ('html' in payload) {
    const p = payload as { html: string; css: string; javascript: string };
    result['index.html'] = p.html || '';
    result['style.css'] = p.css || '';
    result['script.js'] = p.javascript || '';
  }

  return result;
}
