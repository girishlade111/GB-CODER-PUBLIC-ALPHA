/**
 * Test harness for the deploy, GitHub and credential services.
 *
 * The repo has no test runner, so this uses `node --test` and drives the real
 * modules through a stubbed `fetch`. The services are the layer where the
 * interesting logic lives — request shapes, polling, error classification, the
 * git-blob diff — and all of it is reachable without a network by controlling what
 * `fetch` returns.
 *
 * Run with:  node scripts/audit-run-tests.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/* ── Bundle the real modules ────────────────────────────────────────────────
 * esbuild resolves the project's extensionless bundler-style imports and strips
 * TypeScript. Testing a hand-copied version of the logic would prove nothing.
 */
const outdir = mkdtempSync(join(tmpdir(), 'gb-audit-'));

await build({
  stdin: {
    contents: `
      export * from './src/services/deployService.ts';
      export * from './src/services/githubSyncService.ts';
      export * from './src/services/credentialStore.ts';
      export * from './src/utils/terminalSafety.ts';
      export * from './src/utils/safeMarkup.ts';
      export * from './src/services/localShell.ts';
      export * from './src/services/webcontainer/webcontainerService.ts';
      export * from './src/services/webcontainer/webcontainerSupport.ts';
      export * from './src/services/preview/previewReloadService.ts';
      export * from './src/services/laminarService.ts';
      export * from './src/services/vscodeWorkspaceStore.ts';
      export * from './src/services/projects/projectDatabase.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  external: ['@lmnr-ai/lmnr'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: join(outdir, 'bundle.mjs'),
  logLevel: 'error',
});

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
              setTimeout(() => {
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
              setTimeout(() => {
                const val = storeRecord ? storeRecord.data.get(serializeKey(key)) : undefined;
                req.result = val ? structuredClone(val) : undefined;
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            delete(key) {
              const req = { onsuccess: null, onerror: null, result: null };
              setTimeout(() => {
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
                  setTimeout(() => {
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
                  setTimeout(() => {
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
                  setTimeout(() => {
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
            setTimeout(() => {
              if (!tx._aborted) tx.oncomplete?.();
            }, 10);
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

globalThis.window = globalThis.window ?? {
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  localStorage: memoryStorage,
  indexedDB: memoryIndexedDB,
  crypto: globalThis.crypto,
  dispatchEvent: () => true,
};
globalThis.localStorage = memoryStorage;
globalThis.indexedDB = memoryIndexedDB;

// On Windows a bare absolute path is not a valid ESM specifier, so it has to be
// converted to a file:// URL before dynamic import.
export const services = await import(pathToFileURL(join(outdir, 'bundle.mjs')).href);
export const cleanup = () => rmSync(outdir, { recursive: true, force: true });
