export const observeRuntime = () => {
  if (location.origin !== 'http://127.0.0.1:42996') return;
  localStorage.setItem('gbcoder_onboarded', 'true');
  const d = { events: [], processes: [], output: [], outputBytes: 0 };
  globalThis.__runtimeDiagnostic = d;
  const event = (type, details = {}) =>
    d.events.push({
      type,
      at: Date.now(),
      navigationMs: performance.now(),
      ...details,
    });
  const instrumented = new WeakSet();
  let instance, bootPromise;
  Object.defineProperty(globalThis, '__GBCODER_WEBCONTAINER_BOOT_PROMISE__', {
    configurable: true,
    get: () => bootPromise,
    set: (p) => {
      bootPromise = p;
      if (p) {
        event('boot_promise_assigned');
        p.then(
          () => event('boot_completed'),
          (e) => event('boot_failed', { error: String(e) }),
        );
      }
    },
  });
  function instrument(c) {
    if (!c || instrumented.has(c)) return;
    instrumented.add(c);
    event('runtime_instance_assigned');
    try {
      c.on('server-ready', (port, url) => event('server_ready', { port, url }));
      const mount = c.mount.bind(c);
      c.mount = async (...args) => {
        event('mount_invoked', { topLevelNames: Object.keys(args[0] || {}) });
        try {
          const r = await mount(...args);
          event('mount_completed');
          return r;
        } catch (e) {
          event('mount_failed', { error: String(e) });
          throw e;
        }
      };
      const spawn = c.spawn.bind(c);
      c.spawn = async (...args) => {
        const index = d.processes.length;
        const p = {
          index,
          command: args[0],
          args: Array.isArray(args[1]) ? args[1] : null,
          invokedAt: Date.now(),
          state: 'spawning',
        };
        d.processes.push(p);
        event('process_spawn_invoked', {
          index,
          command: p.command,
          args: p.args,
        });
        try {
          const process = await spawn(...args);
          p.state = 'running';
          p.spawnedAt = Date.now();
          event('process_spawned', { index, command: p.command });
          process.exit.then(
            (code) => {
              p.state = 'exited';
              p.exitCode = code;
              p.exitedAt = Date.now();
              event('process_exit', { index, code });
            },
            (e) => event('process_exit_error', { index, error: String(e) }),
          );
          const [applicationOutput, diagnosticOutput] = process.output.tee();
          void (async () => {
            const reader = diagnosticOutput.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text =
                typeof value === 'string'
                  ? value
                  : new TextDecoder().decode(value);
              if (d.outputBytes < 262144) {
                d.output.push({ at: Date.now(), index, text });
                d.outputBytes += text.length;
              }
            }
          })().catch((e) =>
            event('output_capture_error', { index, error: String(e) }),
          );
          const input = new Proxy(process.input, {
            get(target, key) {
              if (key === 'getWriter')
                return (...a) => {
                  const writer = target.getWriter(...a);
                  return new Proxy(writer, {
                    get(w, k) {
                      if (k === 'write')
                        return (chunk) => {
                          event('shell_input', {
                            index,
                            text: String(chunk).slice(0, 4096),
                          });
                          return w.write(chunk);
                        };
                      const v = Reflect.get(w, k, w);
                      return typeof v === 'function' ? v.bind(w) : v;
                    },
                  });
                };
              const v = Reflect.get(target, key, target);
              return typeof v === 'function' ? v.bind(target) : v;
            },
          });
          return new Proxy(process, {
            get(target, key) {
              if (key === 'output') return applicationOutput;
              if (key === 'input') return input;
              const v = Reflect.get(target, key, target);
              return typeof v === 'function' ? v.bind(target) : v;
            },
          });
        } catch (e) {
          p.state = 'spawn_failed';
          p.error = String(e);
          event('process_spawn_failed', { index, error: String(e) });
          throw e;
        }
      };
    } catch (e) {
      event('instrumentation_error', { error: String(e) });
    }
  }
  Object.defineProperty(globalThis, '__GBCODER_WEBCONTAINER_INSTANCE__', {
    configurable: true,
    get: () => instance,
    set: (c) => {
      instance = c;
      instrument(c);
    },
  });
  addEventListener('DOMContentLoaded', () => event('document_loaded'));
};
