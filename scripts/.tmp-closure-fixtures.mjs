import fs from 'node:fs';

function edit(file, change) {
  const source = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
  fs.writeFileSync(file, change(source));
}
function section(source, start, end, update) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Missing fixture boundary: ${start}`);
  return source.slice(0, a) + update(source.slice(a, b)) + source.slice(b);
}
function importFixture(s) { return "import { activateRuntime } from './helpers/runtime-event-fixture.mjs';\n" + s; }
function dropShared(s) {
  return s.replace(/    const mockContainer = \{[\s\S]*?^    \};\n/gm, '')
    .replace(/    webcontainerService.cleanupServerListeners\(\);\n    webcontainerService.setupServerListeners\(mockContainer\);\n/g, '');
}

// B21 retains every behavioral assertion; remove only the now-unused old fixture.
edit('scripts/test-phase2-2-stage-b21-hardened.mjs', (s) => section(s, "describe('CR01:", '/* ── CR02:', dropShared));

edit('scripts/test-phase2-2-stage-b22-deterministic.mjs', (s) => {
  s = importFixture(s);
  for (const n of [4, 5, 6, 12]) {
    const end = n === 12 ? '  cleanup();' : `  // Scenario ${n + 1}:`;
    s = section(s, `  // Scenario ${n}:`, end, (block) => {
      block = dropShared(block);
      if (n === 12) return block.replace("webcontainerService.attachProject('react-app');", "const current = activateRuntime(webcontainerService, 'react-app');\n    serverReadyCb = current.ready;");
      block = block.replace("webcontainerService.attachProject('project-a');", "const a = activateRuntime(webcontainerService, 'project-a');\n    serverReadyCb = a.ready;" + (n === 4 ? '' : '\n    portCb = a.port;'));
      block = block.replace("webcontainerService.attachProject('project-b');", "const b = activateRuntime(webcontainerService, 'project-b');\n    a.assertRetired();");
      if (n === 5) block = block.replace("serverReadyCb(3000, 'http://project-b.local:3000');", "b.ready(3000, 'http://project-b.local:3000');");
      if (n === 6) block = block.replace("serverReadyCb(5173, 'http://server.local:5173');\n\n    // 5.", "b.ready(5173, 'http://server.local:5173');\n\n    // 5.");
      return block;
    });
  }
  return s;
});

edit('scripts/test-phase2-2-stage-b23-fs-port.mjs', (s) => {
  s = importFixture(s).replaceAll('const mockContainer = {', 'const mockContainer = {\n      teardown() { this.destroyed = true; },')
    .replaceAll('webcontainerService.instance = {', 'webcontainerService.instance = {\n      teardown() { this.destroyed = true; },');
  s = section(s, '  let serverReadyCb = null;', '  cleanup();', () => `  const runtimes = [];
  let current;
  const activate = (id) => {
    const previous = current;
    current = activateRuntime(webcontainerService, id);
    if (previous) previous.assertRetired();
    runtimes.push(current);
    return current;
  };
  const check = (id, title, run) => {
    try { run(); record(id, title, 'PASS', 'Production handler assertions with distinct public-API runtimes'); }
    catch (error) { record(id, title, 'FAIL', error.message); }
  };
  check('PORT-B23-01', 'Project A starts on port 5173', () => {
    activate('project-a'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://localhost:5173');
  });
  check('PORT-B23-02', 'Project A is stopped and produces close event', () => {
    webcontainerService.stopDevServer();
    assert.equal(webcontainerService.getState().serverPort, null);
    current.port(5173, 'close');
    assert.equal(webcontainerService.getState().activeServers.length, 0);
  });
  check('PORT-B23-03', 'Project B legitimately starts on 5173 after confirmed A shutdown', () => {
    activate('project-b'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getActiveProjectId(), 'project-b');
  });
  check('PORT-B23-04', 'Missing old port-close does not block the next runtime', () => {
    activate('project-c'); webcontainerService.setShellPromptReady(false); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://localhost:5173');
  });
  const c = current;
  check('PORT-B23-05', 'Late old server-ready while next project starts is rejected', () => {
    activate('project-d'); webcontainerService.setDevServerStarting(true);
    for (const prompt of [false, true]) {
      webcontainerService.setShellPromptReady(prompt); c.ready(4000, 'http://late-c');
      assert.equal(webcontainerService.getState().serverPort, null);
      assert.equal(webcontainerService.getState().serverUrl, null);
    }
  });
  check('PORT-B23-06', 'Late old port-open while next project starts is rejected', () => {
    c.port(4000, 'open', 'http://late-c');
    assert.equal(webcontainerService.getState().activeServers.some((server) => server.port === 4000), false);
  });
  check('PORT-B23-07', 'Late retired close cannot clear a newly acquired port', () => {
    webcontainerService.setDevServerStarting(true); current.ready(3000, 'http://project-d.local:3000');
    c.port(3000, 'close');
    assert.equal(webcontainerService.getState().serverPort, 3000);
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-d.local:3000');
    assert.equal(webcontainerService.pendingDrainingCloses.get(3000) ?? 0, 0);
    current.port(3000, 'close');
    assert.equal(webcontainerService.getState().serverUrl, null, 'current runtime close must still work');
  });
  check('PORT-B23-08', 'Rapid transitions cannot activate obsolete Preview', () => {
    const a = activate('proj-trans-1'); activate('proj-trans-2'); activate('proj-trans-3');
    assert.equal(webcontainerService.getActiveProjectId(), 'proj-trans-3');
    a.ready(5173, 'http://trans-1.local');
    assert.equal(webcontainerService.getState().serverUrl, null);
  });
  check('PORT-B23-09', 'Legitimate current-project server-ready is accepted', () => {
    activate('current-valid'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://current-valid.local:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://current-valid.local:5173');
    assert.equal(webcontainerService.getState().startupStage, 'ready');
  });
  check('PORT-B23-10', 'Repeated cycles retire resources without draining-state growth', () => {
    for (let i = 0; i < 50; i++) {
      activate('cycle-' + i); webcontainerService.setDevServerStarting(true);
      current.ready(5173, 'http://cycle-' + i); webcontainerService.stopDevServer();
      assert.ok(webcontainerService.drainingPorts.size <= 1);
    }
    assert.ok(runtimes.slice(0, -1).every((runtime) => runtime.container.destroyed));
  });
  check('PORT-B23-11', 'Same-project attachment preserves runtime and active server', () => {
    activate('reconnect-proj'); webcontainerService.setDevServerStarting(true); current.ready(5173, 'http://reconnect');
    const epoch = webcontainerService.getSessionEpoch(); const instance = webcontainerService.instance;
    webcontainerService.attachProject('reconnect-proj');
    assert.equal(webcontainerService.isDevServerRunning(), true);
    assert.equal(webcontainerService.getSessionEpoch(), epoch);
    assert.equal(webcontainerService.instance, instance);
    assert.equal(instance.destroyed, false);
  });
  check('PORT-B23-12', 'React and Vue current runtime server binding', () => {
    for (const type of ['react', 'vue']) {
      activate(type + '-project'); webcontainerService.setDevServerStarting(true);
      current.ready(5173, 'http://' + type + '-project');
      const server = webcontainerService.getState().activeServers[0];
      assert.equal(server.projectId, type + '-project');
      assert.equal(server.url, 'http://' + type + '-project');
      assert.equal(webcontainerService.getState().startupStage, 'ready');
    }
  });

`);
  return s;
});

edit('scripts/test-phase2-2-stage-b24-adversarial.mjs', (s) => {
  s = importFixture(s).replaceAll('webcontainerService.instance = {', 'webcontainerService.instance = {\n      teardown() { this.destroyed = true; },');
  s = section(s, '  // C2-A.', "  console.log('\\n======================================================================');", () => `  // Preserve both delayed-event objectives, now with a retired event source.
  for (const [id, delay] of [['C2-A', 1100], ['C2-B', 10100]]) {
    try {
      const a = activateRuntime(webcontainerService, 'late-A-' + id);
      webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
      assert.equal(webcontainerService.getState().serverUrl, 'http://A');
      const b = activateRuntime(webcontainerService, 'late-B-' + id); a.assertRetired();
      await new Promise((resolve) => setTimeout(resolve, delay));
      webcontainerService.setDevServerStarting(true);
      for (const prompt of [false, true]) {
        webcontainerService.setShellPromptReady(prompt);
        a.ready(5173, 'http://late-A'); a.port(5173, 'open', 'http://late-A');
        assert.equal(webcontainerService.getState().serverUrl, null);
        assert.equal(webcontainerService.getState().activeServers.length, 0);
      }
      b.ready(5173, 'http://B'); assert.equal(webcontainerService.getState().serverUrl, 'http://B');
      record(id, 'Delayed retired callbacks cannot acquire the current runtime port', 'PASS', delay + 'ms late; prompt false/true; genuine current event accepted');
    } catch (error) { record(id, 'Delayed retired callbacks', 'FAIL', error.message); }
  }
  try {
    const a = activateRuntime(webcontainerService, 'close-A');
    webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
    const b = activateRuntime(webcontainerService, 'close-B'); a.assertRetired();
    webcontainerService.setDevServerStarting(true); b.ready(5173, 'http://project-b.local:5173');
    a.port(5173, 'close');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-b.local:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    b.port(5173, 'close');
    assert.equal(webcontainerService.getState().serverUrl, null);
    record('C3', 'Late Close After Reuse & Legitimate Close Handling', 'PASS', 'Retired close ignored; current close honored');
  } catch (error) { record('C3', 'Late Close After Reuse & Legitimate Close Handling', 'FAIL', error.message); }
  try {
    for (let cycle = 0; cycle < 5; cycle++) {
      const a = activateRuntime(webcontainerService, 'A-' + cycle);
      webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
      const b = activateRuntime(webcontainerService, 'B-' + cycle); a.assertRetired();
      webcontainerService.setDevServerStarting(true); b.ready(5173, 'http://B');
      a.ready(5173, 'http://late-A'); a.port(5173, 'close');
      assert.equal(webcontainerService.getState().serverUrl, 'http://B');
      assert.equal(webcontainerService.getState().serverPort, 5173);
      assert.equal(webcontainerService.drainingPorts.size, 0);
      assert.equal(webcontainerService.pendingDrainingCloses.size, 0);
    }
    record('C5', 'Repeated Reuse Cycles (5x)', 'PASS', 'Fresh runtime reuse; late callbacks rejected; zero counter growth');
  } catch (error) { record('C5', 'Repeated Reuse Cycles (5x)', 'FAIL', error.message); }

`);
  return s;
});

edit('scripts/test-phase2-2-stabilization-negative.mjs', (s) => {
  s = importFixture(s);
  s = section(s, '  // TEST 1:', '  // TEST 3:', (block) => {
    block = dropShared(block);
    block = block.replaceAll("webcontainerService.attachProject('project-a');", "const a = activateRuntime(webcontainerService, 'project-a');\n    serverReadyCb = a.ready;\n    portCb = a.port;");
    block = block.replaceAll("webcontainerService.attachProject('project-b');", "const b = activateRuntime(webcontainerService, 'project-b');\n    a.assertRetired();");
    block = block.replace("portCb(5173, 'open', 'http://project-b.local:5173');", "b.port(5173, 'open', 'http://project-b.local:5173');");
    block = block.replace("serverReadyCb(5173, 'http://project-b.local:5173');", "b.ready(5173, 'http://project-b.local:5173');");
    block = block.replace("portCb(5173, 'close', '');", "b.port(5173, 'close', '');");
    return block;
  });
  s = s.replace('    const mockContainer = {\n      mount:', '    const mockContainer = {\n      teardown() { this.destroyed = true; },\n      mount:');
  s = section(s, '  // TEST 8:', "  console.log('\\n======================================================================');", () => `  // TEST 8: More than ten unresolved ports cannot leak through runtime retirement.
  try {
    const a = activateRuntime(webcontainerService, 'many-ports');
    for (let port = 5170; port <= 5181; port++) {
      webcontainerService.setDevServerStarting(true); a.ready(port, 'http://server-' + port);
    }
    assert.equal(webcontainerService.getState().activeServers.length, 12);
    webcontainerService.stopDevServer();
    assert.equal(webcontainerService.drainingPorts.size, 12, 'unresolved same-runtime ports must not be evicted');
    const b = activateRuntime(webcontainerService, 'proj-active'); a.assertRetired();
    webcontainerService.setDevServerStarting(true); webcontainerService.setShellPromptReady(true);
    for (let port = 5170; port <= 5181; port++) {
      a.ready(port, 'http://stale-' + port); a.port(port, 'open', 'http://stale-' + port);
    }
    assert.equal(webcontainerService.getState().serverUrl, null);
    assert.equal(webcontainerService.getState().activeServers.length, 0);
    b.ready(5170, 'http://current-5170');
    assert.equal(webcontainerService.getState().serverUrl, 'http://current-5170');
    record('NEG-8', 'More than ten distinct unresolved draining ports', 'PASS', '12 unresolved ports retained until teardown; all retired callbacks rejected');
  } catch (error) { record('NEG-8', 'More than ten distinct unresolved draining ports', 'FAIL', error.message); }

`);
  return s;
});
