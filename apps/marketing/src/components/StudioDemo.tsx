// The home page's proof-of-work surface: an interactive code-to-preview stage.
//
// The tab row is the Aceternity UI composition adapted to React Aria semantics
// (`ui/studio-tabs.tsx`), the code pane is the Kibo UI code block
// (`ui/code-sample.tsx`) and the copy control is the shadcn/ui button
// (`ui/button.tsx`). All three read the same marketing tokens, so the island
// matches the surrounding pages exactly.
import { useId, useMemo, useState, type ReactNode } from "react";
import type { StudioContent } from "../i18n/studio";
import { StudioTabs, type StudioTabItem } from "./ui/studio-tabs";
import { CodeSample } from "./ui/code-sample";
import { FileTree, type FileNode, type SampleFile } from "./ui/file-tree";
import { Icon } from "./ui/icon";

interface Props {
  labels: StudioContent;
  /** Localized label for the link that opens the real workspace. */
  launchLabel: string;
  explorerLabel: string;
}

function WorkspaceExample({
  files,
  initialFile,
  labels,
  explorerLabel,
  children,
}: {
  files: FileNode[];
  initialFile: SampleFile;
  labels: StudioContent;
  explorerLabel: string;
  children: ReactNode;
}) {
  const [file, setFile] = useState(initialFile);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const explorerId = useId();

  return (
    <div className="studio-stage">
      <aside className="studio-explorer" aria-label={explorerLabel}>
        <div className="studio-explorer__heading">{explorerLabel}</div>
        <button
          className="studio-explorer__toggle"
          type="button"
          aria-expanded={explorerOpen}
          aria-controls={explorerId}
          onClick={() => setExplorerOpen((open) => !open)}
        >
          <Icon name="folder" size={16} />
          <span>{explorerLabel}</span>
          <Icon name="chevron-down" size={14} className="studio-tree__chevron" />
        </button>
        <div id={explorerId} className="studio-explorer__files" data-open={explorerOpen}>
          <FileTree nodes={files} selectedFile={file} onSelect={setFile} />
        </div>
      </aside>
      <CodeSample
        key={file.name}
        code={file.code}
        filename={file.name}
        copyLabel={labels.copy}
        copiedLabel={labels.copied}
        errorLabel={labels.error}
        icon={<Icon name={file.icon} size={13} />}
      />
      <div className="sample-output">
        <OutputToolbar previewLabel={labels.preview} />
        <div className="output-canvas">{children}</div>
      </div>
    </div>
  );
}

function FrameworkExample({
  framework,
  title,
  countLabel,
  resetLabel,
  openLabel,
}: {
  framework: string;
  title: string;
  countLabel: string;
  resetLabel: string;
  openLabel: string;
}) {
  const [count, setCount] = useState(0);
  return (
    <div className="counter-example">
      <span className="counter-framework-pill">{framework}</span>
      <h2>{title}</h2>
      <div className="counter-controls">
        <button
          type="button"
          className="counter-button"
          onClick={() => setCount((value) => value + 1)}
        >
          {countLabel}: <span>{count}</span>
        </button>
        <button
          type="button"
          className="counter-reset-button"
          onClick={() => setCount(0)}
        >
          {resetLabel}
        </button>
      </div>
      <a href="/app/projects" className="counter-launch-link">
        {openLabel}
        <Icon name="arrow-right" size={12} />
      </a>
    </div>
  );
}

function buildItems(labels: StudioContent, launchLabel: string, explorerLabel: string): StudioTabItem[] {
  const html: SampleFile = {
    name: "index.html",
    icon: "code",
    code: `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GB Coder</title>
<link rel="stylesheet" href="./styles/idea.css">

<main class="idea">
  <div class="badge">${labels.sampleBadge}</div>
  <h1>${labels.sampleTitle}</h1>
  <p>${labels.sampleText}</p>
  <a href="/app/projects">${labels.sampleLink}</a>
</main>`,
  };

  const reactApp: SampleFile = {
    name: "App.jsx",
    icon: "code",
    code: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="card">
      <span className="pill">React 18</span>
      <h1>${labels.frameworkTitle}</h1>
      <div className="row">
        <button onClick={() => setCount(c => c + 1)}>
          ${labels.countLabel}: {count}
        </button>
        <button onClick={() => setCount(0)}>${labels.resetLabel}</button>
      </div>
    </main>
  );
}`,
  };

  const vueApp: SampleFile = {
    name: "App.vue",
    icon: "code",
    code: `<script setup>
import { ref } from 'vue';
const count = ref(0);
const reset = () => count.value = 0;
</script>

<template>
  <main class="card">
    <span class="pill">Vue 3</span>
    <h1>${labels.frameworkTitle}</h1>
    <div class="row">
      <button @click="count++">${labels.countLabel}: {{ count }}</button>
      <button @click="reset">${labels.resetLabel}</button>
    </div>
  </main>
</template>`,
  };

  const counterStyles: SampleFile = {
    name: "styles.css",
    icon: "file",
    code: `.card {
  max-width: 28rem;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 12px;
  background: #edf3ef;
}
.pill { color: #136240; font-weight: 700; }
.row { display: flex; flex-wrap: wrap; gap: 0.75rem; }`,
  };

  const reactFiles: FileNode[] = [
    {
      name: "src",
      children: [
        reactApp,
        {
          name: "main.jsx",
          icon: "code",
          code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);`,
        },
        counterStyles,
      ],
    },
    frameworkIndex("main.jsx"),
    packageFile({ react: "^18.3.1", "react-dom": "^18.3.1" }),
  ];

  const vueFiles: FileNode[] = [
    {
      name: "src",
      children: [
        vueApp,
        {
          name: "main.js",
          icon: "code",
          code: `import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

createApp(App).mount('#root');`,
        },
        counterStyles,
      ],
    },
    frameworkIndex("main.js"),
    packageFile({ vue: "^3.5.0" }, { "@vitejs/plugin-vue": "^5.1.4" }),
    {
      name: "vite.config.js",
      icon: "code",
      code: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({ plugins: [vue()] });`,
    },
  ];

  return [
    {
      id: "html",
      title: "HTML + CSS",
      panel: (
        <WorkspaceExample
          labels={labels}
          explorerLabel={explorerLabel}
          initialFile={html}
          files={[
            {
              name: "styles",
              children: [
                {
                  name: "idea.css",
                  icon: "file",
                  code: `.idea {
  background: #edf3ef;
  color: #122820;
  padding: 36px;
  border-radius: 12px;
}
.badge {
  color: #136240;
  font-size: 11px;
  font-weight: 700;
}`,
                },
              ],
            },
            html,
          ]}
        >
          <div className="idea-art">
            <span className="idea-orbit" aria-hidden="true"><span /></span>
            <h2>{labels.sampleTitle}</h2>
            <p>{labels.sampleText}</p>
            <a href="/app/projects" className="sample-launch">
              {labels.sampleLink}
              <Icon name="arrow-right" size={12} />
            </a>
          </div>
        </WorkspaceExample>
      ),
    },
    ...[
      { id: "react", title: "React", framework: "React 18", files: reactFiles, app: reactApp },
      { id: "vue", title: "Vue", framework: "Vue 3", files: vueFiles, app: vueApp },
    ].map(({ id, title, framework, files, app }) => ({
      id,
      title,
      panel: (
        <WorkspaceExample labels={labels} explorerLabel={explorerLabel} files={files} initialFile={app}>
          <FrameworkExample
            framework={framework}
            title={labels.frameworkTitle}
            countLabel={labels.countLabel}
            resetLabel={labels.resetLabel}
            openLabel={launchLabel}
          />
        </WorkspaceExample>
      ),
    })),
  ];
}

function frameworkIndex(entry: string): SampleFile {
  return {
    name: "index.html",
    icon: "code",
    code: `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GB Coder</title>
<div id="root"></div>
<script type="module" src="/src/${entry}"></script>`,
  };
}

function packageFile(dependencies: Record<string, string>, plugins?: Record<string, string>): SampleFile {
  return {
    name: "package.json",
    icon: "package",
    code: JSON.stringify({
      private: true,
      type: "module",
      scripts: { dev: "vite" },
      dependencies,
      devDependencies: { vite: "^5.4.0", ...plugins },
    }, null, 2),
  };
}

function OutputToolbar({ previewLabel }: { previewLabel: string }) {
  return (
    <div className="output-toolbar">
      <div className="browser-chrome">
        <div className="output-address-bar">
          <Icon name="lock" size={11} className="lock-icon" />
          <span>http://localhost:5173</span>
        </div>
      </div>
      <div className="preview-status">
        <span className="preview-dot" aria-hidden="true" />
        <span>{previewLabel}</span>
      </div>
    </div>
  );
}

export default function StudioDemo({ labels, launchLabel, explorerLabel }: Props) {
  const items = useMemo(() => buildItems(labels, launchLabel, explorerLabel), [labels, launchLabel, explorerLabel]);

  return (
    <StudioTabs
      className="studio-demo"
      items={items}
      label={labels.tabs}
      leading={
        <>
          <div className="window-dots" aria-hidden="true">
            <span className="window-dot dot-red" />
            <span className="window-dot dot-yellow" />
            <span className="window-dot dot-green" />
          </div>
          <span className="studio-project">workspace /</span>
        </>
      }
      trailing={
        <div className="studio-demo-label">
          <span className="preview-dot" aria-hidden="true" />
          <span>{labels.demo}</span>
        </div>
      }
      footer={
        <div className="studio-status">
          <div className="studio-status-tags">
            <span className="status-item">
              <Icon name="code" size={12} />
              Monaco Editor v0.52
            </span>
            <span className="status-item">
              <Icon name="zap" size={12} />
              Vite v5.4
            </span>
            <span className="status-item">
              <Icon name="monitor" size={12} />
              WebContainer API
            </span>
          </div>
          <span className="studio-runtime">{labels.runtimeLabel}</span>
        </div>
      }
    />
  );
}
