// The home page's proof-of-work surface: an interactive code-to-preview stage.
//
// The tab row is the Aceternity UI composition adapted to React Aria semantics
// (`ui/studio-tabs.tsx`), the code pane is the Kibo UI code block
// (`ui/code-sample.tsx`) and the copy control is the shadcn/ui button
// (`ui/button.tsx`). All three read the same marketing tokens, so the island
// matches the surrounding pages exactly.
import { useMemo, useState } from "react";
import type { StudioContent } from "../i18n/studio";
import { StudioTabs, type StudioTabItem } from "./ui/studio-tabs";
import { CodeSample } from "./ui/code-sample";
import { Icon } from "./ui/icon";

interface Props {
  labels: StudioContent;
  /** Localized label for the link that opens the real workspace. */
  launchLabel: string;
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

function buildItems(labels: StudioContent, launchLabel: string): StudioTabItem[] {
  const htmlCode = `<main class="idea">
  <div class="badge">${labels.sampleBadge}</div>
  <h1>${labels.sampleTitle}</h1>
  <p>${labels.sampleText}</p>
  <a href="/app/projects">${labels.sampleLink}</a>
</main>

<style>
  .idea {
    background: #edf3ef;
    color: #122820;
    padding: 36px;
    border-radius: 12px;
  }
  .badge {
    color: #136240;
    font-size: 11px;
    font-weight: 700;
  }
</style>`;

  const reactCode = `import { useState } from 'react';

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
}`;

  const vueCode = `<script setup>
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
</template>`;

  return [
    {
      id: "html",
      title: "HTML + CSS",
      panel: (
        <div className="studio-stage">
          <CodeSample
            code={htmlCode}
            filename="index.html"
            copyLabel={labels.copy}
            copiedLabel={labels.copied}
            errorLabel={labels.error}
            icon={<Icon name="file" size={13} />}
          />
          <div className="sample-output">
            <OutputToolbar previewLabel={labels.preview} />
            <div className="output-canvas">
              <div className="idea-art">
                <span className="idea-orbit" aria-hidden="true">
                  <span />
                </span>
                <h2>{labels.sampleTitle}</h2>
                <p>{labels.sampleText}</p>
                <a href="/app/projects" className="sample-launch">
                  {labels.sampleLink}
                  <Icon name="arrow-right" size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "react",
      title: "React",
      panel: (
        <div className="studio-stage">
          <CodeSample
            code={reactCode}
            filename="App.jsx"
            copyLabel={labels.copy}
            copiedLabel={labels.copied}
            errorLabel={labels.error}
            icon={<Icon name="code" size={13} />}
          />
          <div className="sample-output">
            <OutputToolbar previewLabel={labels.preview} />
            <div className="output-canvas">
              <FrameworkExample
                framework="React 18"
                title={labels.frameworkTitle}
                countLabel={labels.countLabel}
                resetLabel={labels.resetLabel}
                openLabel={launchLabel}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "vue",
      title: "Vue",
      panel: (
        <div className="studio-stage">
          <CodeSample
            code={vueCode}
            filename="App.vue"
            copyLabel={labels.copy}
            copiedLabel={labels.copied}
            errorLabel={labels.error}
            icon={<Icon name="code" size={13} />}
          />
          <div className="sample-output">
            <OutputToolbar previewLabel={labels.preview} />
            <div className="output-canvas">
              <FrameworkExample
                framework="Vue 3"
                title={labels.frameworkTitle}
                countLabel={labels.countLabel}
                resetLabel={labels.resetLabel}
                openLabel={launchLabel}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];
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

export default function StudioDemo({ labels, launchLabel }: Props) {
  const items = useMemo(() => buildItems(labels, launchLabel), [labels, launchLabel]);

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
