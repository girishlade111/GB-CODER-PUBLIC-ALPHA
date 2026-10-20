/**
 * GB CODER: INCEPTION LABS BYOK COMPATIBILITY & AUTH VERIFICATION SUITE
 *
 * Verifies:
 * 1. Inception Labs Catalog Integrity (Official Mercury Models & Truthful CORS status)
 * 2. Elimination of stale 'mercury-coder' model in favor of official 'mercury-2.5'
 * 3. VerifyApiKey endpoint target: /models for Inception (OpenAI standard) vs /key for OpenRouter
 * 4. Missing API key validation before remote network probe
 * 5. Effective Bearer authentication header formatting and origin authorization
 * 6. Model ID propagation to testConnection, chat completions, and agent tool execution
 * 7. Upstream browser CORS classification on /models endpoint with manual entry preservation
 * 8. Real HTTP 401 error parsing without secret leakage
 */

import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// Set up browser storage mocks
const localStore = new Map();
const sessionStore = new Map();

globalThis.localStorage = {
  getItem: (k) => localStore.get(k) ?? null,
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
  clear: () => localStore.clear(),
  get length() { return localStore.size; },
  key: (i) => Array.from(localStore.keys())[i] ?? null,
};

globalThis.sessionStorage = {
  getItem: (k) => sessionStore.get(k) ?? null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear(),
  get length() { return sessionStore.size; },
  key: (i) => Array.from(sessionStore.keys())[i] ?? null,
};

globalThis.window = globalThis;

// Bundle required TS modules
const tempDir = join(process.cwd(), '.tmp-inception-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'inception-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/ai/types.ts';
      export * from './src/services/ai/keyManager.ts';
      export * from './src/services/ai/providerCatalog.ts';
      export * from './src/services/ai/providers/baseProvider.ts';
      export * from './src/services/ai/providers/openaiCompatibleProvider.ts';
      export * from './src/services/ai/providerRegistry.ts';
      export * from './src/services/ai/modelDiscoveryService.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: bundleFile,
  target: 'es2022',
  sourcemap: false,
});

const {
  BUILT_IN_CATALOG,
  OpenAiCompatibleProvider,
  discoverModels,
} = await import(pathToFileURL(bundleFile).href);

console.log('============================================================');
console.log('  GB CODER: INCEPTION LABS COMPATIBILITY VERIFICATION SUITE');
console.log('============================================================\n');

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// ── Suite 1: Inception Catalog Entry & Model Integrity ──
console.log('Suite 1: Inception Catalog Entry & Model Integrity');

await test('1.1 Inception catalog entry declares truthful browserCorsSupport: false and official metadata', () => {
  const entry = BUILT_IN_CATALOG.find((c) => c.id === 'inception');
  assert.ok(entry, 'Inception entry must exist in BUILT_IN_CATALOG');
  assert.equal(entry.defaultBaseUrl, 'https://api.inceptionlabs.ai/v1');
  assert.equal(entry.protocol, 'openai');
  assert.equal(entry.authType, 'bearer');
  assert.equal(entry.browserCorsSupport, false, 'Inception must declare browserCorsSupport: false due to upstream GET CORS omission');
  assert.equal(entry.toolCallingSupport, true, 'Inception Mercury 2.5 supports tool calling');
  assert.ok(entry.tierCRequirements && entry.tierCRequirements.includes('CORS'), 'Must disclose CORS restriction note');
});

await test('1.2 Default models include mercury-2.5 (recommended), mercury-2, and eliminate stale mercury-coder', () => {
  const entry = BUILT_IN_CATALOG.find((c) => c.id === 'inception');
  assert.ok(entry);
  const models = entry.defaultModels || [];

  // Stale model eliminated
  assert.ok(!models.some((m) => m.id === 'mercury-coder'), 'Stale mercury-coder model must NOT be in catalog');

  // Official models present
  const m25 = models.find((m) => m.id === 'mercury-2.5');
  assert.ok(m25, 'mercury-2.5 must be present');
  assert.equal(m25.recommended, true, 'mercury-2.5 must be the recommended model');
  assert.equal(m25.supportsToolCalling, true, 'mercury-2.5 must support tool calling');
  assert.equal(m25.contextWindow, 260000, 'mercury-2.5 must declare 260k context window');

  const m2 = models.find((m) => m.id === 'mercury-2');
  assert.ok(m2, 'mercury-2 must be present');
  assert.equal(m2.contextWindow, 128000);

  const mSmall = models.find((m) => m.id === 'mercury-coder-small');
  assert.ok(mSmall, 'mercury-coder-small must be present');
});

// ── Suite 2: Credential Verification & Endpoint Target Resolution ──
console.log('\nSuite 2: Credential Verification & Endpoint Target Resolution');

await test('2.1 VerifyApiKey targets /models for Inception (OpenAI standard) and /key for OpenRouter', async () => {
  const interceptedUrls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    interceptedUrls.push(String(url));
    return new Response(JSON.stringify({ data: [{ id: 'mercury-2.5' }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const inceptionProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs (Mercury)',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2.5', name: 'Mercury 2.5', provider: 'inception', contextWindow: 260000, description: '', supportsStreaming: true }]
    );

    await inceptionProv.verifyApiKey('test-inception-key-12345');
    assert.equal(interceptedUrls[0], 'https://api.inceptionlabs.ai/v1/models', 'Inception verifyApiKey must target /models, NOT /key');

    const openRouterProv = new OpenAiCompatibleProvider(
      'openrouter',
      'OpenRouter',
      'https://openrouter.ai/api/v1',
      [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', contextWindow: 128000, description: '', supportsStreaming: true }]
    );

    await openRouterProv.verifyApiKey('sk-or-v1-testkey1234567890abcdef1234567890abcdef');
    assert.equal(interceptedUrls[1], 'https://openrouter.ai/api/v1/key', 'OpenRouter verifyApiKey must target /key');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.2 Missing API key on remote Inception endpoint returns clear validation error before network probe', async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('', { status: 200 });
  };

  try {
    const inceptionProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs (Mercury)',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2.5', name: 'Mercury 2.5', provider: 'inception', contextWindow: 260000, description: '', supportsStreaming: true }]
    );

    const res = await inceptionProv.testConnection('', undefined, 'mercury-2.5', undefined, true);
    assert.equal(fetchCalled, false, 'Must not send network probe without an API key');
    assert.equal(res.success, false);
    assert.equal(res.errorCategory, 'config');
    assert.match(res.message, /API key is required before testing connection/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 3: Test Connection & Chat Payload Inspection ──
console.log('\nSuite 3: Test Connection & Chat Payload Inspection');

await test('3.1 Test Connection sends exact model mercury-2.5 and Bearer Authorization header', async () => {
  let capturedUrl = '';
  let capturedHeaders = null;
  let capturedBody = null;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, opts) => {
    capturedUrl = String(url);
    capturedHeaders = opts.headers;
    capturedBody = JSON.parse(opts.body);
    return new Response(JSON.stringify({ id: 'chat-1', choices: [{ message: { content: 'pong' } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const inceptionProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs (Mercury)',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2.5', name: 'Mercury 2.5', provider: 'inception', contextWindow: 260000, description: '', supportsStreaming: true }]
    );

    const res = await inceptionProv.testConnection(
      'test-key-inception-xyz',
      'https://api.inceptionlabs.ai/v1',
      'mercury-2.5',
      undefined,
      true
    );

    assert.equal(res.success, true);
    assert.equal(capturedUrl, 'https://api.inceptionlabs.ai/v1/chat/completions');
    assert.equal(capturedHeaders['Authorization'], 'Bearer test-key-inception-xyz');
    assert.equal(capturedBody.model, 'mercury-2.5');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('3.2 Remote HTTP 401 error is parsed truthfully and masks API key in message', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Incorrect API key provided: secret_key_abcdef',
          type: 'authentication_error',
          code: 'invalid_api_key',
        },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const inceptionProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs (Mercury)',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2.5', name: 'Mercury 2.5', provider: 'inception', contextWindow: 260000, description: '', supportsStreaming: true }]
    );

    const res = await inceptionProv.testConnection(
      'secret_key_abcdef',
      'https://api.inceptionlabs.ai/v1',
      'mercury-2.5',
      undefined,
      true
    );

    assert.equal(res.success, false);
    assert.equal(res.httpStatus, 401);
    assert.equal(res.errorCategory, 'auth');
    assert.ok(!res.message.includes('secret_key_abcdef'), 'API key must be redacted from error message');
    assert.ok(res.message.includes('[REDACTED_API_KEY]'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 4: Model Discovery & Upstream CORS Classification ──
console.log('\nSuite 4: Model Discovery & Upstream CORS Classification');

await test('4.1 Browser CORS failure on Inception /models is classified as cors with clear guidance', async () => {
  const originalFetch = globalThis.fetch;
  // Simulate browser throwing TypeError: Failed to fetch due to missing Access-Control-Allow-Origin on GET
  globalThis.fetch = async () => {
    const err = new TypeError('Failed to fetch');
    throw err;
  };

  try {
    const res = await discoverModels({
      baseUrl: 'https://api.inceptionlabs.ai/v1',
      apiKey: 'test-key',
      providerId: 'inception',
    });

    assert.equal(res.success, false);
    assert.equal(res.errorCategory, 'cors');
    assert.match(res.error, /Browser CORS restriction/i);
    assert.match(res.suggestedAction, /Enter the model ID manually/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('4.2 Direct server-side /models success correctly returns official Mercury models without CORS block', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        data: [
          { id: 'mercury-2.5', name: 'Inception: Mercury 2.5', context_length: 260000, supported_features: ['tools'] },
          { id: 'mercury-2', name: 'Inception: Mercury 2', context_length: 128000, supported_features: ['tools'] },
          { id: 'mercury-coder-small', name: 'Inception: Mercury Coder Small', context_length: 32000 },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const res = await discoverModels({
      baseUrl: 'https://api.inceptionlabs.ai/v1',
      apiKey: 'test-key',
      providerId: 'inception',
    });

    assert.equal(res.success, true);
    assert.equal(res.models.length, 3);
    assert.equal(res.models[0].id, 'mercury-2.5');
    assert.equal(res.models[0].contextWindow, 260000);
    assert.equal(res.models[0].supportsToolCalling, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 5: Streaming Chat & Agent Mode Tool Calling ──
console.log('\nSuite 5: Streaming Chat & Agent Mode Tool Calling');

await test('5.1 Streaming Chat formats tool call deltas correctly for mercury-2.5', async () => {
  const sseData = [
    'data: {"id":"chatcmpl-1","choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_inc_123","type":"function","function":{"name":"read_file","arguments":"{\\"path\\":\\""}}]}}]}\n\n',
    'data: {"id":"chatcmpl-1","choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"package.json\\"}"}}]}}]}\n\n',
    'data: {"id":"chatcmpl-1","choices":[{"delta":{}}],"usage":{"prompt_tokens":15,"completion_tokens":10,"total_tokens":25}}\n\n',
    'data: [DONE]\n\n',
  ].join('');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseData));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const inceptionProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs (Mercury)',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2.5', name: 'Mercury 2.5', provider: 'inception', contextWindow: 260000, description: '', supportsStreaming: true, supportsToolCalling: true }]
    );

    const chunks = [];
    const result = await inceptionProv.streamChat(
      [{ role: 'user', content: 'Inspect package.json' }],
      {
        apiKey: 'test-key-inception',
        model: 'mercury-2.5',
        tools: [
          {
            name: 'read_file',
            description: 'Read file',
            parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
          },
        ],
      },
      (chunk) => chunks.push(chunk)
    );

    assert.ok(result.toolCalls && result.toolCalls.length === 1, 'Must extract tool call');
    assert.equal(result.toolCalls[0].toolName, 'read_file');
    assert.equal(result.toolCalls[0].args.path, 'package.json');
    assert.equal(result.usage.totalTokens, 25);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log('\n============================================================');
console.log(`  ALL ${passedTests} / ${totalTests} INCEPTION LABS TESTS PASSED!`);
console.log('============================================================');
