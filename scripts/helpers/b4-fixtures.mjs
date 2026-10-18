export async function seedProjects(page, specs) {
  await page.evaluate((list) => {
    const openDb = () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id' }).createIndex(
              'lastOpenedAt',
              'lastOpenedAt',
            );
          }
          if (!db.objectStoreNames.contains('projectFiles')) {
            db.createObjectStore('projectFiles', {
              keyPath: ['projectId', 'path'],
            }).createIndex('projectId', 'projectId');
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    return openDb().then((db) => {
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      for (const s of list) {
        tx.objectStore('projects').put({
          id: s.id,
          name: s.name,
          createdAt: now - 60000,
          lastOpenedAt: now,
          editorStyle: s.editorStyle || 'vscode',
          projectType: s.projectType || 'react',
          fileCount: s.files.length,
        });
        for (const f of s.files) {
          tx.objectStore('projectFiles').put({
            projectId: s.id,
            path: f.path,
            content: f.content,
          });
        }
      }
      return new Promise((res) => {
        tx.oncomplete = res;
      });
    });
  }, specs);
}

export const REACT_PKG =
  '{"name":"wc-react","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-react":"^4.3.0"}}';
export const REACT_VITE_CONFIG =
  "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n";
export const REACT_INDEX =
  '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>';
export const reactMain = (marker) =>
  `import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('root')).render(<h1 id="marker">${marker}</h1>);\n`;

export const VUE_PKG =
  '{"name":"wc-vue","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"vue":"^3.5.13"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-vue":"^5.2.1"}}';
export const VUE_VITE_CONFIG =
  "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n";
export const VUE_INDEX =
  '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>';
export const VUE_MAIN =
  "import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n";
export const vueApp = (marker) =>
  `<script setup>\n</script>\n\n<template>\n  <div><h1 id="marker">${marker}</h1></div>\n</template>\n`;
