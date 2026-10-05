// Dumps the real console-bridge script so the e2e test can inject it exactly
// as PreviewPanel does, instead of approximating it.
const esbuild = require('esbuild');
const { writeFileSync } = require('fs');

esbuild
  .build({
    entryPoints: ['src/services/consoleBridge.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  })
  .then((result) => {
    const code = result.outputFiles[0].text;
    writeFileSync('bridge.local.mjs', code);
    console.log('wrote bridge.local.mjs', code.length, 'bytes');
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
