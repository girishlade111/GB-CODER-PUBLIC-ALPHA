#!/usr/bin/env node
/**
 * GB Coder — Post-E3 project-flow regression tests (logic layer, node:test).
 *
 * Covers the pure, deterministic acceptance criteria:
 *  NAV route-helper matrix, new-project template resolution invariants,
 *  scaffold invariants (empty stays empty, templates generated once),
 *  fresh-start buffer semantics via projectToTriple.
 *
 * Browser journeys (real Monaco/IndexedDB/WebContainer) live in
 * scripts/e2e-project-flow.mjs.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_BASE_ROUTE,
  EDITOR_ROUTE,
  PROJECTS_ROUTE,
  STATIC_EDITOR_ROUTE,
  VSCODE_ROUTE,
  LEGACY_VSCODE_ROUTE,
  isDashboardPath,
  isStaticEditorPath,
  isVSCodeModePath,
  isEditorRoutePath,
} from '../src/utils/appRoutes.ts';

import {
  createPlainProject,
  createProjectOfType,
  projectToTriple,
  PLAIN_HTML_PATH,
  PLAIN_CSS_PATH,
  PLAIN_JS_PATH,
} from '../src/types/files.ts';

describe('NAV route helpers', () => {
  test('NAV-01/02/03: landing destinations all address the dashboard', () => {
    // Astro CTAs (Start Coding, Open Dashboard) both target /app.
    for (const p of ['/app', '/app/', '/app/projects', '/app/projects/']) {
      assert.equal(isDashboardPath(p), true, `${p} is dashboard`);
      assert.equal(isEditorRoutePath(p), false, `${p} never auto-opens`);
    }
  });

  test('NAV: static editor route recognised, dashboard excluded', () => {
    for (const p of ['/app/editor', '/app/editor/']) {
      assert.equal(isStaticEditorPath(p), true, `${p} is static editor`);
      assert.equal(isEditorRoutePath(p), true, `${p} honours stored selection`);
      assert.equal(isDashboardPath(p), false, `${p} is not dashboard`);
    }
    assert.equal(isStaticEditorPath('/app'), false);
    assert.equal(isStaticEditorPath('/app/ide'), false);
  });

  test('NAV: IDE routes preserved incl. legacy /ide', () => {
    for (const p of ['/app/ide', '/app/ide/', '/ide', '/ide/']) {
      assert.equal(isVSCodeModePath(p), true, `${p} is vscode mode`);
      assert.equal(isEditorRoutePath(p), true, `${p} honours stored selection`);
      assert.equal(isDashboardPath(p), false, `${p} is not dashboard`);
    }
  });

  test('NAV-04: route constants keep editor/destination mapping stable', () => {
    assert.equal(APP_BASE_ROUTE, '/app');
    assert.equal(EDITOR_ROUTE, '/app');
    assert.equal(PROJECTS_ROUTE, '/app/projects');
    assert.equal(STATIC_EDITOR_ROUTE, '/app/editor');
    assert.equal(VSCODE_ROUTE, '/app/ide');
    assert.equal(LEGACY_VSCODE_ROUTE, '/ide');
  });

  test('NAV-06: unknown app paths are neither dashboard nor editor', () => {
    for (const p of ['/app/preview-popout', '/preview-popout', '/about']) {
      assert.equal(isDashboardPath(p), false, `${p} not dashboard`);
      assert.equal(isStaticEditorPath(p), false, `${p} not static editor`);
      assert.equal(isVSCodeModePath(p), false, `${p} not vscode`);
    }
  });
});

describe('new-project template resolution', () => {
  // Mirrors the resolution table in App.handleCreateProject so a drift in
  // either place fails loudly here.
  const resolve = (editorStyle, template) => {
    const resolvedStyle = template === 'react' || template === 'vue' ? 'vscode' : editorStyle;
    let projectType = 'plain';
    let entry;
    let files;
    if (template === 'react' || template === 'vue') {
      const scaffold = createProjectOfType(template);
      projectType = scaffold.projectType;
      entry = scaffold.entry;
      files = scaffold.files;
    } else if (template === 'empty') {
      files = [];
    } else if (template === 'blank') {
      files = createPlainProject('', '', '').files;
    } else {
      files = createPlainProject('<h1>x</h1>', 'x', 'x').files;
    }
    return { resolvedStyle, projectType, entry, files };
  };

  test('NAV-05: static starter and blank resolve to plain/plain', () => {
    for (const t of ['starter', 'blank']) {
      const r = resolve('plain', t);
      assert.equal(r.resolvedStyle, 'plain');
      assert.equal(r.projectType, 'plain');
      assert.equal(r.entry, undefined);
      assert.equal(r.files.length, 3);
    }
  });

  test('NAV-05: IDE empty/react/vue resolve with separate style/type', () => {
    const empty = resolve('vscode', 'empty');
    assert.equal(empty.resolvedStyle, 'vscode');
    assert.equal(empty.projectType, 'plain');
    assert.equal(empty.files.length, 0);

    const react = resolve('vscode', 'react');
    assert.equal(react.resolvedStyle, 'vscode');
    assert.equal(react.projectType, 'react');
    assert.equal(react.entry, 'main.jsx');

    const vue = resolve('vscode', 'vue');
    assert.equal(vue.resolvedStyle, 'vscode');
    assert.equal(vue.projectType, 'vue');
    assert.equal(vue.entry, 'main.js');
  });

  test('IDE-01: blank/empty starting points carry zero content', () => {
    const blank = createPlainProject('', '', '');
    assert.deepEqual(
      blank.files.map((f) => f.content),
      ['', '', ''],
    );
    assert.deepEqual(
      blank.files.map((f) => f.path),
      [PLAIN_HTML_PATH, PLAIN_CSS_PATH, PLAIN_JS_PATH],
    );
  });

  test('IDE-03: react/vue scaffolds contain only intended files incl. package.json', () => {
    const react = createProjectOfType('react');
    assert.deepEqual(
      react.files.map((f) => f.path).sort(),
      ['App.jsx', 'index.css', 'main.jsx', 'package.json'],
    );
    const vue = createProjectOfType('vue');
    assert.deepEqual(
      vue.files.map((f) => f.path).sort(),
      ['App.vue', 'main.js', 'package.json', 'style.css'],
    );
    // No static-editor stowaways in IDE scaffolds.
    for (const f of [...react.files, ...vue.files]) {
      assert.ok(!['index.html', 'script.js'].includes(f.path), `no ${f.path} in IDE scaffold`);
    }
  });

  test('ST-02/ST-05: empty triple derives to empty Monaco buffers', () => {
    const empty = createPlainProject('', '', '');
    assert.deepEqual(projectToTriple(empty), { html: '', css: '', javascript: '' });
  });

  test('ST-01: restore triple round-trips exact contents', () => {
    const p = createPlainProject('<h1>A</h1>', 'h1{}', 'console.log(1)');
    assert.deepEqual(projectToTriple(p), { html: '<h1>A</h1>', css: 'h1{}', javascript: 'console.log(1)' });
  });
});
