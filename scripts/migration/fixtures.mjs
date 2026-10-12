import crypto from 'node:crypto';

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateSyntheticFixtures() {
  const now = Date.now();

  // Project A: Static HTML/CSS/JS
  const projectA = {
    metadata: {
      id: 'proj-synthetic-a',
      name: 'Project Alpha Static',
      createdAt: now - 3600000,
      lastOpenedAt: now - 3500000,
      editorStyle: 'plain',
      projectType: 'plain',
      fileCount: 3,
    },
    files: [
      { path: 'index.html', content: '<!DOCTYPE html><html><head><title>Alpha</title><link rel="stylesheet" href="style.css"></head><body><h1>Project Alpha</h1><script src="script.js"></script></body></html>' },
      { path: 'style.css', content: 'body { font-family: sans-serif; background: #fafafa; color: #111; } h1 { color: #0066cc; }' },
      { path: 'script.js', content: 'console.log("Alpha static runtime initialized"); document.body.classList.add("loaded");' },
    ],
  };

  // Project B: React Project
  const projectB = {
    metadata: {
      id: 'proj-synthetic-b',
      name: 'Project Beta React',
      createdAt: now - 3000000,
      lastOpenedAt: now - 2900000,
      editorStyle: 'plain',
      projectType: 'react',
      entry: 'src/main.jsx',
      fileCount: 4,
    },
    files: [
      { path: 'package.json', content: JSON.stringify({ name: 'beta-react', version: '1.0.0', dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' } }, null, 2) },
      { path: 'src/main.jsx', content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);" },
      { path: 'src/App.jsx', content: "import React from 'react';\nexport default function App() { return <div><h1>Beta React App</h1></div>; }" },
      { path: 'index.html', content: '<!DOCTYPE html><html><head><title>Beta</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>' },
    ],
  };

  // Project C: Advanced IDE project
  const projectC = {
    metadata: {
      id: 'proj-synthetic-c',
      name: 'Project Gamma IDE',
      createdAt: now - 2000000,
      lastOpenedAt: now - 1800000,
      editorStyle: 'vscode',
      projectType: 'plain',
      fileCount: 3,
    },
    files: [
      { path: 'index.html', content: '<!DOCTYPE html><html><body><h1>Gamma IDE Workspace</h1></body></html>' },
      { path: 'main.ts', content: 'interface User { id: string; name: string; }\nconst u: User = { id: "1", name: "Gamma" };\nconsole.log(u);' },
      { path: 'theme.json', content: '{\n  "mode": "dark",\n  "editor": "vscode"\n}' },
    ],
  };

  // Project D: 112-File Deterministic Nested Project
  const filesD = [];

  // 1. Root configuration files (8 files)
  filesD.push({ path: 'package.json', content: JSON.stringify({ name: 'project-delta-112', version: '2.5.0', type: 'module' }, null, 2) });
  filesD.push({ path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', strict: true } }, null, 2) });
  filesD.push({ path: 'vite.config.ts', content: "import { defineConfig } from 'vite';\nexport default defineConfig({ base: './' });" });
  filesD.push({ path: 'README.md', content: '# Project Delta 112-File Integrity Test\nVerified byte-for-byte in browser migration.' });
  filesD.push({ path: '.gitignore', content: 'node_modules\ndist\n.DS_Store' });
  filesD.push({ path: 'index.html', content: '<!DOCTYPE html><html><head><title>Delta 112</title></head><body><div id="app"></div><script type="module" src="/src/index.ts"></script></body></html>' });
  filesD.push({ path: 'LICENSE', content: 'MIT License - GB Coder Synthetic Test' });
  filesD.push({ path: '.env.example', content: 'VITE_API_ENDPOINT=https://api.example.com\nVITE_ENV=staging' });

  // 2. Unicode and Special Filenames (8 files)
  filesD.push({ path: 'src/utils/ñandú.ts', content: 'export const ñandúRunner = () => "Pampa runner bird";\nexport const speed = 60;' });
  filesD.push({ path: 'docs/日本語.md', content: '# GB Coder 移行テストドキュメント\nこのファイルはUTF-8エンコードを検証します。' });
  filesD.push({ path: 'assets/🎨-palette.json', content: JSON.stringify({ primary: '#ff6600', secondary: '#00cc88', accents: ['#333', '#eee'] }, null, 2) });
  filesD.push({ path: 'locales/fr/données-modèle.json', content: JSON.stringify({ titre: 'Données en français', statut: 'succès' }, null, 2) });
  filesD.push({ path: 'locales/de/Überblick.json', content: JSON.stringify({ begriff: 'Systemarchitektur', version: '1.3.1' }, null, 2) });
  filesD.push({ path: 'src/symbols/∑-math.ts', content: 'export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);' });
  filesD.push({ path: 'src/symbols/λ-calculus.ts', content: 'export const identity = <T>(x: T): T => x;' });
  filesD.push({ path: 'docs/caffè-notes.txt', content: 'Testing accented characters: à, è, é, ì, ò, ù.' });

  // 3. Components (24 files in nested folders)
  for (let i = 1; i <= 24; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `src/components/ui/button/Button_${pad}.tsx`,
      content: `import React from 'react';\nexport const Button_${pad} = () => <button className="btn-${pad}">Button ${pad}</button>;\nexport default Button_${pad};`,
    });
  }

  // 4. Modals (16 files in nested folders)
  for (let i = 1; i <= 16; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `src/components/modals/dialogs/Modal_${pad}.tsx`,
      content: `import React from 'react';\nexport const Modal_${pad} = ({ isOpen }: { isOpen: boolean }) => isOpen ? <div className="modal-${pad}">Modal ${pad}</div> : null;`,
    });
  }

  // 5. Hooks (16 files)
  for (let i = 1; i <= 16; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `src/hooks/data/useDataStream_${pad}.ts`,
      content: `export function useDataStream_${pad}() {\n  return { streamId: "${pad}", active: true, timestamp: ${now} };\n}`,
    });
  }

  // 6. Services & Utilities (20 files)
  for (let i = 1; i <= 20; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `src/services/api/client_${pad}.ts`,
      content: `export class Client_${pad} {\n  endpoint = "/api/v2/resource_${pad}";\n  fetch() { return Promise.resolve({ ok: true, id: "${pad}" }); }\n}`,
    });
  }

  // 7. Stylesheets (10 files)
  for (let i = 1; i <= 10; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `src/styles/themes/theme_${pad}.css`,
      content: `/* Theme ${pad} stylesheet */\n:root {\n  --primary-color-${pad}: hsl(${i * 35}, 70%, 50%);\n  --font-size-${pad}: ${12 + i}px;\n}`,
    });
  }

  // 8. Test Suites (10 files)
  for (let i = 1; i <= 10; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    filesD.push({
      path: `tests/integration/suite_${pad}.test.ts`,
      content: `describe('Integration Suite ${pad}', () => {\n  it('validates scenario ${pad}', () => {\n    expect(true).toBe(true);\n  });\n});`,
    });
  }

  // Total count check: 8 + 8 + 24 + 16 + 16 + 20 + 10 + 10 = 112 files exactly
  if (filesD.length !== 112) {
    throw new Error(`Expected exactly 112 files, but generated ${filesD.length}`);
  }

  // Compute file hashes and master fingerprint
  const fileHashMap = {};
  filesD.sort((a, b) => a.path.localeCompare(b.path));
  for (const f of filesD) {
    f.sha256 = sha256(f.content);
    fileHashMap[f.path] = f.sha256;
  }

  const masterFingerprint = sha256(
    filesD.map((f) => `${f.path}:${f.sha256}`).join('\n')
  );

  const projectD = {
    metadata: {
      id: 'proj-synthetic-d-112',
      name: 'Project Delta 112-File Nested',
      createdAt: now - 1000000,
      lastOpenedAt: now - 500000,
      editorStyle: 'vscode',
      projectType: 'plain',
      fileCount: 112,
      masterFingerprint,
    },
    files: filesD,
    fileHashMap,
    masterFingerprint,
  };

  return {
    projectA,
    projectB,
    projectC,
    projectD,
    // The authentic active project key and target project ID
    activeProjectKey: 'gb-coder-active-project-id',
    activeProjectId: 'proj-synthetic-d-112',
  };
}
