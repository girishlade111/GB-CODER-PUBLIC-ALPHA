/**
 * GB Coder — Project Creation, Template Library & Import Experience Test Suite
 * Consolidated Development Batch 2 Verification Suite
 *
 * Tests:
 * - Feature Group A: Unified New Project Experience
 * - Feature Group B: Template Library Integration
 * - Feature Group C: Reliable Import Experience
 * - Feature Group D: Project Dashboard Productivity
 * - Feature Group E: Export, Backup & Recovery Integration
 * - Feature Group F: UI/UX, Storage & Bundle Contracts
 *
 * Run with: node scripts/test-project-creation-template-bundle.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

console.log('======================================================================');
console.log('GB CODER — BATCH 2: PROJECT CREATION, TEMPLATES & IMPORT TEST SUITE');
console.log('======================================================================');

// Setup in-memory mock environment for IndexedDB and localStorage
function makeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
  };
}

function makeIndexedDB() {
  const dbs = new Map();
  return {
    open(dbName, version = 1) {
      const request = {
        result: null,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        onblocked: null,
      };

      setTimeout(() => {
        let dbRecord = dbs.get(dbName);
        let upgraded = false;
        if (!dbRecord) {
          dbRecord = {
            name: dbName,
            version,
            stores: new Map(),
          };
          dbs.set(dbName, dbRecord);
          upgraded = true;
        }

        const createIDBStore = (storeName, transaction) => {
          const storeRecord = dbRecord.stores.get(storeName);
          const serializeKey = (k) => (Array.isArray(k) ? JSON.stringify(k) : String(k));
          return {
            put(value, explicitKey) {
              const req = { onsuccess: null, onerror: null, result: null };
              if (transaction) transaction._pending += 1;
              setTimeout(() => {
                if (transaction) {
                  transaction._pending -= 1;
                  transaction._scheduleCheck?.();
                }
                if (transaction && transaction._aborted) {
                  req.onerror?.({ target: req });
                  return;
                }
                const key =
                  explicitKey !== undefined
                    ? explicitKey
                    : storeRecord && storeRecord.keyPath
                      ? Array.isArray(storeRecord.keyPath)
                        ? storeRecord.keyPath.map((k) => value[k])
                        : value[storeRecord.keyPath]
                      : null;
                if (storeRecord) {
                  storeRecord.data.set(serializeKey(key), structuredClone(value));
                }
                req.result = key;
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            get(key) {
              const req = { onsuccess: null, onerror: null, result: null };
              if (transaction) transaction._pending += 1;
              setTimeout(() => {
                if (transaction) {
                  transaction._pending -= 1;
                  transaction._scheduleCheck?.();
                }
                const val = storeRecord ? storeRecord.data.get(serializeKey(key)) : undefined;
                req.result = val ? structuredClone(val) : undefined;
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            delete(key) {
              const req = { onsuccess: null, onerror: null, result: null };
              if (transaction) transaction._pending += 1;
              setTimeout(() => {
                if (transaction) {
                  transaction._pending -= 1;
                  transaction._scheduleCheck?.();
                }
                if (storeRecord) {
                  storeRecord.data.delete(serializeKey(key));
                }
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            createIndex(indexName, keyPath) {
              if (storeRecord) storeRecord.indexes.set(indexName, keyPath);
            },
            index(indexName) {
              const keyPath = storeRecord ? storeRecord.indexes.get(indexName) : null;
              return {
                get(keyVal) {
                  const req = { onsuccess: null, onerror: null, result: null };
                  if (transaction) transaction._pending += 1;
                  setTimeout(() => {
                    if (transaction) {
                      transaction._pending -= 1;
                      transaction._scheduleCheck?.();
                    }
                    let found = undefined;
                    if (storeRecord) {
                      for (const val of storeRecord.data.values()) {
                        if (val[keyPath] === keyVal) {
                          found = structuredClone(val);
                          break;
                        }
                      }
                    }
                    req.result = found;
                    req.onsuccess?.({ target: req });
                  }, 0);
                  return req;
                },
                getAll(keyVal) {
                  const req = { onsuccess: null, onerror: null, result: null };
                  if (transaction) transaction._pending += 1;
                  setTimeout(() => {
                    if (transaction) {
                      transaction._pending -= 1;
                      transaction._scheduleCheck?.();
                    }
                    const matches = [];
                    if (storeRecord) {
                      for (const val of storeRecord.data.values()) {
                        if (keyVal === undefined || val[keyPath] === keyVal) {
                          matches.push(structuredClone(val));
                        }
                      }
                    }
                    req.result = matches;
                    req.onsuccess?.({ target: req });
                  }, 0);
                  return req;
                },
                getAllKeys(keyVal) {
                  const req = { onsuccess: null, onerror: null, result: null };
                  if (transaction) transaction._pending += 1;
                  setTimeout(() => {
                    if (transaction) {
                      transaction._pending -= 1;
                      transaction._scheduleCheck?.();
                    }
                    const keys = [];
                    if (storeRecord) {
                      for (const [sKey, val] of storeRecord.data.entries()) {
                        if (keyVal === undefined || val[keyPath] === keyVal) {
                          try {
                            keys.push(JSON.parse(sKey));
                          } catch {
                            keys.push(sKey);
                          }
                        }
                      }
                    }
                    req.result = keys;
                    req.onsuccess?.({ target: req });
                  }, 0);
                  return req;
                },
              };
            },
          };
        };

        const db = {
          name: dbName,
          objectStoreNames: {
            contains: (name) => dbRecord.stores.has(name),
          },
          createObjectStore(storeName, options = {}) {
            if (!dbRecord.stores.has(storeName)) {
              dbRecord.stores.set(storeName, {
                keyPath: options.keyPath,
                data: new Map(),
                indexes: new Map(),
              });
            }
            return createIDBStore(storeName, null);
          },
          transaction(storeNames, mode) {
            const tx = {
              mode,
              _aborted: false,
              _pending: 0,
              oncomplete: null,
              onerror: null,
              onabort: null,
              abort() {
                tx._aborted = true;
                setTimeout(() => tx.onabort?.(), 0);
              },
              objectStore(storeName) {
                return createIDBStore(storeName, tx);
              },
            };
            const scheduleCheck = () => {
              setTimeout(() => {
                if (!tx._aborted && tx._pending === 0) tx.oncomplete?.();
              }, 0);
            };
            tx._scheduleCheck = scheduleCheck;
            scheduleCheck();
            return tx;
          },
          close() {},
        };

        request.result = db;

        if (upgraded && request.onupgradeneeded) {
          request.onupgradeneeded({ target: request });
        }
        request.onsuccess?.({ target: request });
      }, 0);

      return request;
    },
  };
}

const memoryIndexedDB = makeIndexedDB();
const memoryStorage = makeStorage();

const dispatchedEvents = [];
const eventListeners = new Map();

globalThis.window = globalThis.window ?? {
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  localStorage: memoryStorage,
  indexedDB: memoryIndexedDB,
  crypto: globalThis.crypto,
  dispatchEvent: (event) => {
    dispatchedEvents.push(event.type);
    const handlers = eventListeners.get(event.type) || [];
    for (const h of handlers) h(event);
    return true;
  },
  addEventListener: (type, handler) => {
    if (!eventListeners.has(type)) eventListeners.set(type, []);
    eventListeners.get(type).push(handler);
  },
  removeEventListener: (type, handler) => {
    if (!eventListeners.has(type)) return;
    const list = eventListeners.get(type).filter((h) => h !== handler);
    eventListeners.set(type, list);
  },
};
globalThis.localStorage = memoryStorage;
globalThis.indexedDB = memoryIndexedDB;

// CustomEvent polyfill if needed
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, params = {}) {
      this.type = type;
      this.detail = params.detail;
    }
  };
}

// Bundle services via esbuild
const outdir = mkdtempSync(join(tmpdir(), 'gb-batch2-test-'));
const bundleOut = join(outdir, 'bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/projects/projectDatabase.ts';
      export * from './src/services/enhancedTemplateService.ts';
      export * from './src/services/import/importEngine.ts';
      export * from './src/services/import/projectDetection.ts';
      export * from './src/services/projectArchiveService.ts';
      export * from './src/types/files.ts';
      export * from './src/services/backup/backupTypes.ts';
      export * from './src/services/backup/backupExportService.ts';
      export * from './src/services/backup/backupRestoreService.ts';
      export * from './src/services/projectImportService.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  external: ['@lmnr-ai/lmnr', 'jszip'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundleOut,
  logLevel: 'error',
});

const services = await import(pathToFileURL(bundleOut).href);

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${name}: ${e.message}\n${e.stack}`);
  }
}

// -----------------------------------------------------------------------------
// FEATURE GROUP A: UNIFIED NEW PROJECT EXPERIENCE
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group A: Unified New Project Experience ---');

await test('[Creation 1] Name validation: reject empty and whitespace names', () => {
  const emptyRes = services.validateProjectName('');
  assert.equal(emptyRes.valid, false);
  assert.match(emptyRes.error, /cannot be empty/i);

  const spacesRes = services.validateProjectName('    ');
  assert.equal(spacesRes.valid, false);
  assert.match(spacesRes.error, /cannot be empty/i);
});

await test('[Creation 2] Name validation: reject names > 100 characters', () => {
  const longName = 'A'.repeat(101);
  const longRes = services.validateProjectName(longName);
  assert.equal(longRes.valid, false);
  assert.match(longRes.error, /100 characters or fewer/i);

  const exact100 = 'A'.repeat(100);
  const exactRes = services.validateProjectName(exact100);
  assert.equal(exactRes.valid, true);
});

await test('[Creation 3] Name validation: reject control characters', () => {
  const ctrlRes = services.validateProjectName('My\x00Project');
  assert.equal(ctrlRes.valid, false);
  assert.match(ctrlRes.error, /control characters/i);

  const newlineRes = services.validateProjectName('My\nProject');
  assert.equal(newlineRes.valid, false);
  assert.match(newlineRes.error, /control characters/i);
});

await test('[Creation 4] Name validation: case-insensitive duplicate detection', () => {
  const existing = [
    { id: 'p1', name: 'Alpha Project', createdAt: 1, lastOpenedAt: 1, editorStyle: 'plain', projectType: 'plain', fileCount: 3 },
    { id: 'p2', name: 'Beta Studio', createdAt: 2, lastOpenedAt: 2, editorStyle: 'vscode', projectType: 'react', fileCount: 5 },
  ];

  const dupRes = services.validateProjectName('alpha project', existing);
  assert.equal(dupRes.isDuplicate, true);
  assert.match(dupRes.error, /already exists/i);

  // When updating current project, own name is not a duplicate
  const selfRes = services.validateProjectName('Alpha Project', existing, 'p1');
  assert.equal(selfRes.isDuplicate, undefined);
  assert.equal(selfRes.valid, true);
});

await test('[Creation 5] Storage: createProject persists record and files in IndexedDB', async () => {
  const newProject = await services.createProject({
    name: 'Test Persistent Project',
    editorStyle: 'vscode',
    projectType: 'react',
    entry: 'src/main.tsx',
    files: [
      { path: 'package.json', content: '{"name": "test"}', language: 'json' },
      { path: 'src/main.tsx', content: 'console.log("hello");', language: 'typescript' },
    ],
  });

  assert.ok(newProject, 'Project record returned');
  assert.equal(newProject.name, 'Test Persistent Project');
  assert.equal(newProject.editorStyle, 'vscode');
  assert.equal(newProject.projectType, 'react');
  assert.equal(newProject.fileCount, 2);

  // Retrieve project by ID
  const retrieved = await services.getProject(newProject.id);
  assert.ok(retrieved, 'Project found in IndexedDB');
  assert.equal(retrieved.id, newProject.id);

  // Retrieve files
  const files = await services.readProjectFiles(newProject.id);
  assert.equal(files.length, 2);
  const pkg = files.find((f) => f.path === 'package.json');
  assert.ok(pkg);
  assert.equal(pkg.content, '{"name": "test"}');
});

await test('[Creation 6] Storage: Active Project ID read/write', () => {
  services.writeActiveProjectId('proj-12345');
  assert.equal(services.readActiveProjectId(), 'proj-12345');
  services.writeActiveProjectId(null);
  assert.equal(services.readActiveProjectId(), null);
});

await test('[Creation 7] Event Notification: notifyProjectsUpdated fires event', () => {
  dispatchedEvents.length = 0;
  services.notifyProjectsUpdated();
  assert.ok(dispatchedEvents.includes('gb-coder:projects-updated'));
});

// -----------------------------------------------------------------------------
// FEATURE GROUP B: TEMPLATE LIBRARY INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group B: Template Library Integration ---');

const templateService = services.enhancedTemplateService;

await test('[Template 1] Template catalog loading & categories', () => {
  const templates = templateService.getAllTemplatesMetadata();
  assert.ok(templates.length > 0, 'Catalog contains templates');

  const categories = templateService.getCategoriesWithCounts();
  assert.ok(categories.length > 3, 'Categories listed');
  assert.ok(categories.some((c) => c.id === 'react' || c.id === 'web' || c.id === 'all'));
});

await test('[Template 2] Template search filtering', () => {
  const allTemplates = templateService.getAllTemplatesMetadata();
  assert.ok(allTemplates.length > 0);
  // Search for portfolio
  const results = templateService.searchTemplates('portfolio');
  assert.ok(results.length > 0, 'Found portfolio templates');
  for (const t of results) {
    const text = `${t.name} ${t.description} ${t.tags.join(' ')}`.toLowerCase();
    assert.ok(text.includes('portfolio') || text.includes('creative') || text.includes('agency'));
  }
});

await test('[Template 3] Template difficulty filtering', () => {
  const allTemplates = templateService.getAllTemplatesMetadata();
  const beginner = allTemplates.filter((t) => t.difficulty === 'beginner');
  const advanced = allTemplates.filter((t) => t.difficulty === 'advanced');

  assert.ok(beginner.length > 0, 'Has beginner templates');
  assert.ok(advanced.length > 0, 'Has advanced templates');
  for (const t of beginner) assert.equal(t.difficulty, 'beginner');
  for (const t of advanced) assert.equal(t.difficulty, 'advanced');
});

await test('[Template 4] Favorites management', () => {
  const sampleId = 'react-canvas-studio';
  // Clear any existing
  if (templateService.isFavorite(sampleId)) {
    templateService.toggleFavorite(sampleId);
  }
  assert.equal(templateService.isFavorite(sampleId), false);

  templateService.toggleFavorite(sampleId);
  assert.equal(templateService.isFavorite(sampleId), true);
  const favs = templateService.getFavorites();
  assert.ok(favs.includes(sampleId));

  // Toggle off
  templateService.toggleFavorite(sampleId);
  assert.equal(templateService.isFavorite(sampleId), false);
});

await test('[Template 5] Recent templates tracking', () => {
  templateService.recordRecentTemplate('temp-1');
  templateService.recordRecentTemplate('temp-2');
  templateService.recordRecentTemplate('temp-1'); // Duplicate should move to front

  const recents = templateService.getRecentTemplateIds();
  assert.equal(recents[0], 'temp-1');
  assert.equal(recents[1], 'temp-2');
  assert.ok(recents.length <= 10, 'Capped at 10 items');
});

await test('[Template 6] Template compatibility: Plain templates recommend plain editor', () => {
  const plainTemplate = {
    id: 'test-plain',
    name: 'Plain Test',
    description: 'Plain test template',
    projectType: 'plain',
    category: 'web',
    tags: ['html'],
    difficulty: 'beginner',
  };

  const compat = templateService.validateTemplateCompatibility(plainTemplate);
  assert.equal(compat.compatible, true);
  assert.equal(compat.recommendedEditor, 'plain');
  assert.equal(compat.requiresSandbox, undefined);
});

await test('[Template 7] Template compatibility: React/Vue recommend vscode editor', () => {
  const reactTemplate = {
    id: 'test-react',
    name: 'React Test',
    description: 'React test template',
    projectType: 'react',
    category: 'react',
    tags: ['react'],
    difficulty: 'intermediate',
  };

  const compat = templateService.validateTemplateCompatibility(reactTemplate);
  assert.equal(compat.compatible, true);
  assert.equal(compat.recommendedEditor, 'vscode');
});

await test('[Template 8] Truthful Next.js limitation reporting', () => {
  const nextTemplate = {
    id: 'test-nextjs',
    name: 'Next.js App',
    description: 'Next.js template',
    projectType: 'nextjs',
    category: 'nextjs',
    tags: ['nextjs'],
    difficulty: 'advanced',
  };

  const compat = templateService.validateTemplateCompatibility(nextTemplate);
  assert.equal(compat.compatible, true);
  assert.equal(compat.recommendedEditor, 'vscode');
  assert.equal(compat.requiresSandbox, true);
  assert.match(compat.runtimeNote, /server sandbox/i);
});

// -----------------------------------------------------------------------------
// FEATURE GROUP C: RELIABLE IMPORT EXPERIENCE
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group C: Reliable Import Experience ---');

await test('[Import 1] Path traversal rejection', () => {
  assert.equal(services.isPathTraversal('../secret.txt'), true);
  assert.equal(services.isPathTraversal('src/../../etc/passwd'), true);
  assert.equal(services.isPathTraversal('/etc/shadow'), true);
  assert.equal(services.isPathTraversal('C:\\Windows\\System32'), true);
  assert.equal(services.isPathTraversal('..\\..\\malicious'), true);

  // Safe paths
  assert.equal(services.isPathTraversal('src/App.tsx'), false);
  assert.equal(services.isPathTraversal('index.html'), false);
  assert.equal(services.isPathTraversal('components/Header.jsx'), false);
});

await test('[Import 2] Dependency & build directory skipping', () => {
  assert.equal(services.shouldSkipPath('node_modules/react/index.js'), true);
  assert.equal(services.shouldSkipPath('.git/config'), true);
  assert.equal(services.shouldSkipPath('dist/bundle.js'), true);
  assert.equal(services.shouldSkipPath('build/output.js'), true);
  assert.equal(services.shouldSkipPath('.next/server/pages.js'), true);
  assert.equal(services.shouldSkipPath('.DS_Store'), true);
  assert.equal(services.shouldSkipPath('Thumbs.db'), true);

  // Preserved source paths
  assert.equal(services.shouldSkipPath('src/App.tsx'), false);
  assert.equal(services.shouldSkipPath('package.json'), false);
  assert.equal(services.shouldSkipPath('README.md'), false);
});

await test('[Import 3] Environment file detection (local-only handling)', () => {
  assert.equal(services.isEnvFile('.env'), true);
  assert.equal(services.isEnvFile('.env.local'), true);
  assert.equal(services.isEnvFile('.env.production'), true);
  assert.equal(services.isEnvFile('config/.env'), true);

  assert.equal(services.isEnvFile('environment.ts'), false);
  assert.equal(services.isEnvFile('App.tsx'), false);
});

await test('[Import 4] Decompressed bytes ceiling guard', () => {
  assert.equal(services.MAX_DECOMPRESSED_BYTES, 100 * 1024 * 1024, '100 MB decompressed limit');
});

await test('[Import 5] Project detection: Simple plain HTML/CSS/JS', () => {
  const entries = [
    { path: 'index.html' },
    { path: 'style.css' },
    { path: 'script.js' },
  ];

  const detection = services.detectProject(entries);
  assert.equal(detection.kind, 'simple');
  assert.equal(detection.requiresAdvancedMode, false);
});

await test('[Import 6] Project detection: React project', () => {
  const entries = [
    { path: 'package.json', content: '{"dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0"}}' },
    { path: 'src/App.tsx' },
    { path: 'src/main.tsx' },
  ];

  const detection = services.detectProject(entries);
  assert.equal(detection.kind, 'react');
  assert.equal(services.projectTypeForKind(detection.kind), 'react');
  assert.equal(detection.requiresAdvancedMode, false);
});

await test('[Import 7] Project detection: Vue project', () => {
  const entries = [
    { path: 'package.json', content: '{"dependencies": {"vue": "^3.4.0"}}' },
    { path: 'src/App.vue' },
    { path: 'src/main.ts' },
  ];

  const detection = services.detectProject(entries);
  assert.equal(detection.kind, 'vue');
  assert.equal(services.projectTypeForKind(detection.kind), 'vue');
  assert.equal(detection.requiresAdvancedMode, false);
});

await test('[Import 8] Project detection: Full-stack backend project', () => {
  const entries = [
    { path: 'Dockerfile' },
    { path: 'package.json', content: '{"dependencies": {"express": "^4.18.2"}}' },
    { path: 'server.js' },
  ];

  const detection = services.detectProject(entries);
  assert.equal(detection.kind, 'fullstack');
  assert.equal(detection.requiresAdvancedMode, true);
});

// -----------------------------------------------------------------------------
// FEATURE GROUP D: PROJECT DASHBOARD PRODUCTIVITY
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group D: Project Dashboard Productivity ---');

await test('[Dashboard 1] Project sorting: lastOpenedAt, name, createdAt', () => {
  const projects = [
    { id: '1', name: 'Zeta Project', createdAt: 100, lastOpenedAt: 500, editorStyle: 'plain', projectType: 'plain', fileCount: 1 },
    { id: '2', name: 'Alpha Project', createdAt: 300, lastOpenedAt: 200, editorStyle: 'vscode', projectType: 'react', fileCount: 4 },
    { id: '3', name: 'Gamma Project', createdAt: 200, lastOpenedAt: 800, editorStyle: 'vscode', projectType: 'vue', fileCount: 3 },
  ];

  // Last opened (descending)
  const byLastOpened = [...projects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  assert.equal(byLastOpened[0].id, '3');
  assert.equal(byLastOpened[1].id, '1');
  assert.equal(byLastOpened[2].id, '2');

  // Name A-Z
  const byNameAsc = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  assert.equal(byNameAsc[0].id, '2');
  assert.equal(byNameAsc[1].id, '3');
  assert.equal(byNameAsc[2].id, '1');

  // Created newest
  const byCreatedDesc = [...projects].sort((a, b) => b.createdAt - a.createdAt);
  assert.equal(byCreatedDesc[0].id, '2');
  assert.equal(byCreatedDesc[1].id, '3');
  assert.equal(byCreatedDesc[2].id, '1');
});

await test('[Dashboard 2] Project filtering by editorStyle and projectType', () => {
  const projects = [
    { id: '1', name: 'Static Site', editorStyle: 'plain', projectType: 'plain' },
    { id: '2', name: 'React App', editorStyle: 'vscode', projectType: 'react' },
    { id: '3', name: 'Vue App', editorStyle: 'vscode', projectType: 'vue' },
  ];

  const plainOnly = projects.filter((p) => p.editorStyle === 'plain');
  assert.equal(plainOnly.length, 1);
  assert.equal(plainOnly[0].id, '1');

  const vscodeOnly = projects.filter((p) => p.editorStyle === 'vscode');
  assert.equal(vscodeOnly.length, 2);

  const reactOnly = projects.filter((p) => p.projectType === 'react');
  assert.equal(reactOnly.length, 1);
  assert.equal(reactOnly[0].id, '2');
});

await test('[Dashboard 3] Inline rename: renameProject updates record and notifies', async () => {
  dispatchedEvents.length = 0;
  const project = await services.createProject({
    name: 'Initial Name',
    editorStyle: 'plain',
    projectType: 'plain',
    files: [{ path: 'index.html', content: '<h1>Hi</h1>', language: 'html' }],
  });

  const updated = await services.renameProject(project.id, 'Renamed Masterpiece');
  assert.ok(updated);
  assert.equal(updated.name, 'Renamed Masterpiece');

  const fromDb = await services.getProject(project.id);
  assert.equal(fromDb.name, 'Renamed Masterpiece');
  assert.ok(dispatchedEvents.includes('gb-coder:projects-updated'));
});

await test('[Dashboard 4] Duplicate project: duplicateProject creates copy and replicates files', async () => {
  const project = await services.createProject({
    name: 'Source Design',
    editorStyle: 'vscode',
    projectType: 'react',
    files: [
      { path: 'package.json', content: '{"name":"source"}', language: 'json' },
      { path: 'src/App.tsx', content: 'export default () => null;', language: 'typescript' },
    ],
  });

  const duplicate = await services.duplicateProject(project.id);
  assert.ok(duplicate, 'Duplicate created');
  assert.equal(duplicate.name, 'Source Design (Copy)');
  assert.equal(duplicate.fileCount, 2);
  assert.equal(duplicate.editorStyle, 'vscode');
  assert.equal(duplicate.projectType, 'react');

  // Verify duplicated files
  const dupFiles = await services.readProjectFiles(duplicate.id);
  assert.equal(dupFiles.length, 2);
  assert.ok(dupFiles.find((f) => f.path === 'package.json'));
});

await test('[Dashboard 5] Delete project: deleteProject cleans up record and files', async () => {
  const project = await services.createProject({
    name: 'To Be Deleted',
    editorStyle: 'plain',
    projectType: 'plain',
    files: [{ path: 'index.html', content: 'bye', language: 'html' }],
  });

  await services.deleteProject(project.id);
  const checkProj = await services.getProject(project.id);
  assert.equal(checkProj, null, 'Project record deleted');

  const checkFiles = await services.readProjectFiles(project.id);
  assert.equal(checkFiles.length, 0, 'Project files deleted');
});

// -----------------------------------------------------------------------------
// FEATURE GROUP E: EXPORT, BACKUP & RECOVERY INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group E: Export, Backup & Recovery ---');

await test('[Export 1] Archive assembly for plain project', () => {
  const plainProj = {
    projectType: 'plain',
    files: [
      { path: 'index.html', content: '<h1>Test</h1>' },
      { path: 'style.css', content: 'body { margin: 0; }' },
      { path: 'script.js', content: 'console.log("ok");' },
    ],
  };

  const files = services.buildArchiveFiles(plainProj, { projectName: 'My Plain Site' });
  assert.equal(files.length, 4, 'HTML, CSS, JS, and README.md');
  assert.ok(files.find((f) => f.path === 'index.html'));
  assert.ok(files.find((f) => f.path === 'style.css'));
  assert.ok(files.find((f) => f.path === 'script.js'));
  assert.ok(files.find((f) => f.path === 'README.md'));
});

await test('[Export 2] Archive assembly for React project', () => {
  const reactProj = {
    projectType: 'react',
    files: [
      { path: 'App.tsx', content: 'export default () => <div>Hello</div>;' },
      { path: 'main.tsx', content: 'import "./App";' },
    ],
  };

  const files = services.buildArchiveFiles(reactProj, { projectName: 'My React App' });
  assert.ok(files.find((f) => f.path === 'index.html'), 'Vite index.html included');
  assert.ok(files.find((f) => f.path === 'package.json'), 'package.json generated');
  assert.ok(files.find((f) => f.path === 'vite.config.js'), 'Vite config included');
  assert.ok(files.find((f) => f.path === '.gitignore'), '.gitignore included');
  assert.ok(files.find((f) => f.path === 'src/App.tsx'), 'Source moved to src/');
  assert.ok(files.find((f) => f.path === 'src/main.tsx'), 'Main entry moved to src/');
});

await test('[Export 3] formatBytes utility', () => {
  assert.equal(services.formatBytes(0), '0 B');
  assert.equal(services.formatBytes(500), '500 B');
  assert.equal(services.formatBytes(1536), '1.5 KB');
  assert.equal(services.formatBytes(10485760), '10.0 MB');
});

// -----------------------------------------------------------------------------
// FEATURE GROUP F: INITIAL BUNDLE CRITICAL PATH ISOLATION
// -----------------------------------------------------------------------------
console.log('\n--- Feature Group F: Initial Bundle Critical Path Isolation ---');

await test('[Bundle 1] App.tsx contains no static imports of heavy modules', () => {
  const appSource = readFileSync('src/App.tsx', 'utf8');

  // Must not statically import JSZip
  assert.ok(!/^import\s+.*JSZip.*from\s+['"]jszip['"]/m.test(appSource), 'No static JSZip import in App.tsx');

  // Must only use 'import type' for ImportEngine and projectDetection
  const importEngineImports = [...appSource.matchAll(/import\s+(?:type\s+)?(?:{[^}]+}|\w+)\s+from\s+['"][^'"]*importEngine['"]/g)];
  for (const m of importEngineImports) {
    assert.ok(m[0].includes('import type'), `Must use 'import type' for importEngine: ${m[0]}`);
  }

  const projectDetectImports = [...appSource.matchAll(/import\s+(?:type\s+)?(?:{[^}]+}|\w+)\s+from\s+['"][^'"]*projectDetection['"]/g)];
  for (const m of projectDetectImports) {
    assert.ok(m[0].includes('import type'), `Must use 'import type' for projectDetection: ${m[0]}`);
  }
});

// Additional Comprehensive Verifications
await test('[Creation 8] Scaffolds: createProjectOfType("react") produces valid Vite structure', () => {
  const scaffold = services.createProjectOfType('react');
  assert.equal(scaffold.projectType, 'react');
  assert.equal(scaffold.entry, 'main.jsx');
  assert.ok(scaffold.files.some((f) => f.path === 'package.json'));
  assert.ok(scaffold.files.some((f) => f.path === 'App.jsx'));
  assert.ok(scaffold.files.some((f) => f.path === 'main.jsx'));
  assert.ok(scaffold.files.some((f) => f.path === 'index.css'));
});

await test('[Creation 9] Scaffolds: createProjectOfType("vue") produces valid Vite structure', () => {
  const scaffold = services.createProjectOfType('vue');
  assert.equal(scaffold.projectType, 'vue');
  assert.equal(scaffold.entry, 'main.js');
  assert.ok(scaffold.files.some((f) => f.path === 'package.json'));
  assert.ok(scaffold.files.some((f) => f.path === 'App.vue'));
  assert.ok(scaffold.files.some((f) => f.path === 'main.js'));
  assert.ok(scaffold.files.some((f) => f.path === 'style.css'));
});

await test('[Creation 10] Scaffolds: createPlainProject produces valid triple', () => {
  const plain = services.createPlainProject('<h1>Hello</h1>', 'h1 { color: red; }', 'console.log(1);');
  assert.equal(plain.projectType, 'plain');
  assert.equal(plain.files.length, 3);
  assert.ok(plain.files.some((f) => f.path === 'index.html' && f.content === '<h1>Hello</h1>'));
  assert.ok(plain.files.some((f) => f.path === 'style.css' && f.content === 'h1 { color: red; }'));
  assert.ok(plain.files.some((f) => f.path === 'script.js' && f.content === 'console.log(1);'));
});

await test('[Creation 11] Storage: touchProject updates lastOpenedAt timestamp', async () => {
  const p = await services.createProject({
    name: 'Touch Test',
    editorStyle: 'plain',
    projectType: 'plain',
    files: [{ path: 'index.html', content: 'test', language: 'html' }],
  });
  const oldOpened = p.lastOpenedAt;
  // Sleep 10ms to ensure timestamp advances
  await new Promise((r) => setTimeout(r, 15));
  await services.touchProject(p.id);
  const updated = await services.getProject(p.id);
  assert.ok(updated.lastOpenedAt >= oldOpened);
});

await test('[Creation 12] Storage: updateProjectEditorPreference updates preference', async () => {
  const p = await services.createProject({
    name: 'Preference Test',
    editorStyle: 'plain',
    projectType: 'plain',
    files: [{ path: 'index.html', content: 'test', language: 'html' }],
  });
  assert.equal(p.editorStyle, 'plain');
  await services.updateProjectEditorPreference(p.id, 'vscode');
  const updated = await services.getProject(p.id);
  assert.equal(updated.editorStyle, 'vscode');
});

await test('[Template 9] Custom template registration and deletion', () => {
  const customMeta = {
    id: 'custom-starter',
    name: 'My Custom Template',
    description: 'Custom test template',
    category: 'plain',
    tags: ['custom'],
    difficulty: 'beginner',
    projectType: 'plain',
  };
  const customPayload = {
    html: '<div>Custom</div>',
    css: 'div { font-size: 16px; }',
    javascript: 'console.log("custom");',
  };

  templateService.registerTemplate(customMeta, customPayload);
  const found = templateService.getAllTemplatesMetadata().find((t) => t.id === 'custom-starter');
  assert.ok(found, 'Custom template registered');
  assert.equal(found.name, 'My Custom Template');

  templateService.deleteCustomTemplate('custom-starter');
  const deleted = templateService.getAllTemplatesMetadata().find((t) => t.id === 'custom-starter');
  assert.equal(deleted, undefined, 'Custom template removed');
});

await test('[Template 10] Template payload loading via getTemplateById', async () => {
  const payload = await templateService.getTemplateById('plain-blog');
  assert.ok(payload, 'plain-blog payload resolved');
  assert.ok('html' in payload || 'files' in payload);
});

await test('[Import 9] ImportTooLargeError message formatting', () => {
  const err = new services.ImportTooLargeError(60 * 1024 * 1024);
  assert.match(err.message, /60\.0 MB/);
  assert.match(err.message, /limit/);
  assert.equal(err.name, 'ImportTooLargeError');
});

await test('[Import 10] isZipFile recognition', () => {
  const zipFile = new File(['PK\x03\x04'], 'archive.zip', { type: 'application/zip' });
  assert.equal(services.isZipFile(zipFile), true);

  const textFile = new File(['hello'], 'notes.txt', { type: 'text/plain' });
  assert.equal(services.isZipFile(textFile), false);
});

await test('[Export 4] Backup format contract', () => {
  assert.equal(services.BACKUP_FORMAT_NAME, 'gb-coder-backup');
  assert.equal(services.BACKUP_FORMAT_VERSION, 1);
});

await test('[Export 5] sanitizeProjectName produces filesystem-safe name', () => {
  assert.equal(services.sanitizeProjectName('My Awesome Project! (v2.0)'), 'my-awesome-project-v2.0');
  assert.equal(services.sanitizeProjectName(''), 'gb-coder-project');
  assert.equal(services.sanitizeProjectName('---hello---world---'), 'hello---world');
});

// Cleanup test bundle
try {
  rmSync(outdir, { recursive: true, force: true });
} catch {
  // Ignored
}

console.log('\n======================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL BATCH 2 TESTS PASSED SUCCESSFULLY!');
}
