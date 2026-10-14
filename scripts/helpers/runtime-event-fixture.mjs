import assert from 'node:assert/strict';

// Unit-test runtime boundary. Every activation installs a fresh public-API
// instance; production listener registration and event handlers remain intact.
// Retained callbacks deliberately bypass unsubscribe to model an already queued
// delivery, so rejection must come from the production ownership guard.
export function activateRuntime(service, projectId) {
  service.attachProject(projectId);
  const callbacks = new Map();
  const files = new Map();
  const container = {
    destroyed: false,
    teardown() { this.destroyed = true; },
    on(event, callback) { callbacks.set(event, callback); return () => {}; },
    async mount(tree) { assert.equal(this.destroyed, false); files.set('mountedTree', tree); },
    fs: {
      async mkdir() { assert.equal(container.destroyed, false); },
      async writeFile(path, content) { assert.equal(container.destroyed, false); files.set(path, content); },
      async readFile(path) { assert.equal(container.destroyed, false); return files.get(path); },
      async readdir() { assert.equal(container.destroyed, false); return [...files.keys()]; },
      async rm(path) { assert.equal(container.destroyed, false); files.delete(path); },
    },
  };
  service.instance = container;
  service.setupServerListeners(container);
  return {
    container,
    ready(port, url) { callbacks.get('server-ready')(port, url); },
    port(port, kind, url = '') { callbacks.get('port')(port, kind, url); },
    error(error) { callbacks.get('error')(error); },
    assertRetired() {
      assert.equal(container.destroyed, true, 'project switch must call public teardown');
      assert.notEqual(service.instance, container, 'a new project must use a different runtime');
    },
  };
}
