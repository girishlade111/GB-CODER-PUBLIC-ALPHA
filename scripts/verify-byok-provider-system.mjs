/**
 * GB CODER: BYOK PROVIDER MANAGEMENT & CONNECTION TEST VERIFICATION SUITE
 *
 * Deterministic automated tests validating:
 * 1. Root Cause Reproducer & Elimination of "result.split is not a function"
 * 2. Custom Provider Store, Validation, Non-Destructive Migration & Security
 * 3. Searchable Provider Catalog & Capabilities
 * 4. Custom Model Registration & Exact Model ID Transmission
 * 5. Custom HTTP Headers Validation, CRLF Injection Prevention & Secret Masking
 * 6. Standards-Aware Connection Diagnostics with Consent-Gated Inference Probe
 * 7. GB Assist Chat & Agent Mode Integration with Custom Providers
 */

import { build } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// Set up browser storage mocks before importing bundled services
const localStore = new Map();
const sessionStore = new Map();

globalThis.localStorage = {
  getItem: (k) => localStore.get(k) ?? null,
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
  clear: () => localStore.clear(),
  get length() {
    return localStore.size;
  },
  key: (i) => Array.from(localStore.keys())[i] ?? null,
};

globalThis.sessionStorage = {
  getItem: (k) => sessionStore.get(k) ?? null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear(),
  get length() {
    return sessionStore.size;
  },
  key: (i) => Array.from(sessionStore.keys())[i] ?? null,
};

globalThis.window = globalThis;

// Bundle required TS modules
const tempDir = join(process.cwd(), '.tmp-byok-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'byok-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/ai/types.ts';
      export * from './src/services/ai/keyManager.ts';
      export * from './src/services/ai/customProviderStore.ts';
      export * from './src/services/ai/providerCatalog.ts';
      export * from './src/services/ai/providers/baseProvider.ts';
      export * from './src/services/ai/providers/openaiCompatibleProvider.ts';
      export * from './src/services/ai/providers/geminiProvider.ts';
      export * from './src/services/ai/providers/mockProvider.ts';
      export * from './src/services/ai/providerRegistry.ts';
      export * from './src/services/ai/assistAgentService.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  external: ['@google/generative-ai', 'diff', '@webcontainer/api'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundleFile,
  logLevel: 'error',
});

const byok = await import(pathToFileURL(bundleFile).href);
const {
  keyManager,
  customProviderStore,
  providerRegistry,
  BUILT_IN_CATALOG,
  redactSecretsFromText,
  validateEndpointUrl,
  normalizeBaseUrl,
  validateCustomHeaders,
  OpenAiCompatibleProvider,
  assistAgentService,
} = byok;

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}:`, err);
    throw err;
  }
}

console.log('\n============================================================');
console.log('  GB CODER: BYOK PROVIDER MANAGEMENT VERIFICATION SUITE');
console.log('============================================================\n');

// ── Suite 1: Root Cause Reproducer & Elimination of result.split ──
console.log('Suite 1: Root Cause Reproducer & Elimination of result.split');

await test('1.1 redactSecretsFromText handles non-string inputs safely without throwing TypeError', () => {
  // Reproducing inputs that previously crashed with "result.split is not a function":
  const objectInput = { detail: 'Model custom-model not found on inceptionlabs' };
  const arrayInput = ['error 1', 'error 2'];
  const errorInput = new Error('Connection refused');
  const numberInput = 404;
  const nullInput = null;
  const undefinedInput = undefined;

  // None of these should throw TypeError: result.split is not a function
  const res1 = redactSecretsFromText(objectInput, 'secret-key-12345');
  assert.match(res1, /custom-model/);

  const res2 = redactSecretsFromText(arrayInput, 'secret-key-12345');
  assert.match(res2, /error 1/);

  const res3 = redactSecretsFromText(errorInput, 'secret-key-12345');
  assert.equal(res3, 'Connection refused');

  const res4 = redactSecretsFromText(numberInput, 'secret-key-12345');
  assert.equal(res4, '404');

  const res5 = redactSecretsFromText(nullInput, 'secret-key-12345');
  assert.equal(res5, '');

  const res6 = redactSecretsFromText(undefinedInput, 'secret-key-12345');
  assert.equal(res6, '');
});

await test('1.2 redactSecretsFromText successfully masks API keys, bearer tokens, and query params', () => {
  const secretKey = 'sk-proj-1234567890abcdef1234567890';
  const rawText = `Request failed: Unauthorized with ${secretKey} at https://api.example.com/v1?key=AIzaSySecretKey09876543210987654321`;

  const redacted = redactSecretsFromText(rawText, secretKey);
  assert.ok(!redacted.includes('sk-proj-1234567890abcdef'));
  assert.ok(!redacted.includes('AIzaSySecretKey'));
  assert.ok(redacted.includes('[REDACTED_API_KEY]'));
});

// ── Suite 2: Custom Provider Store, Validation & Persistence ──
console.log('\nSuite 2: Custom Provider Store, Validation & Safe Non-Secret Persistence');

await test('2.1 Provider ID validation enforces naming conventions and prevents reserved ID collisions', () => {
  // Empty ID
  const v1 = customProviderStore.validate({ id: '', name: 'Test', baseUrl: 'https://api.test.com/v1', models: [{ id: 'm1', name: 'M1' }] }, true);
  assert.equal(v1.valid, false);
  assert.ok(v1.errors.id);

  // Capital letters or spaces
  const v2 = customProviderStore.validate({ id: 'My Provider!', name: 'Test', baseUrl: 'https://api.test.com/v1', models: [{ id: 'm1', name: 'M1' }] }, true);
  assert.equal(v2.valid, false);
  assert.ok(v2.errors.id);

  // Reserved ID collision
  const v3 = customProviderStore.validate({ id: 'gemini', name: 'Fake Gemini', baseUrl: 'https://api.test.com/v1', models: [{ id: 'm1', name: 'M1' }] }, true);
  assert.equal(v3.valid, false);
  assert.match(v3.errors.id, /reserved/);

  // Valid ID
  const v4 = customProviderStore.validate({ id: 'inception-labs_v1', name: 'Inception Labs', baseUrl: 'https://api.inceptionlabs.ai/v1', models: [{ id: 'mercury-2', name: 'Mercury 2' }] }, true);
  assert.equal(v4.valid, true);
});

await test('2.2 Base URL security validation enforces HTTPS for remote hosts and allows loopback HTTP', () => {
  // Remote plain HTTP blocked
  const r1 = validateEndpointUrl('http://api.inceptionlabs.ai/v1');
  assert.equal(r1.valid, false);
  assert.match(r1.error, /Insecure HTTP endpoint/);

  // 0.0.0.0 blocked
  const r2 = validateEndpointUrl('http://0.0.0.0:11434/v1');
  assert.equal(r2.valid, false);
  assert.match(r2.error, /Insecure destination/);

  // Localhost allowed
  const r3 = validateEndpointUrl('http://localhost:11434/v1');
  assert.equal(r3.valid, true);

  // 127.0.0.1 allowed
  const r4 = validateEndpointUrl('http://127.0.0.1:8000/v1');
  assert.equal(r4.valid, true);

  // Remote HTTPS allowed
  const r5 = validateEndpointUrl('https://api.inceptionlabs.ai/v1');
  assert.equal(r5.valid, true);
});

await test('2.3 normalizeBaseUrl strips duplicate /chat/completions and trailing slashes cleanly', () => {
  assert.equal(
    normalizeBaseUrl('https://api.example.com/v1/chat/completions/'),
    'https://api.example.com/v1'
  );
  assert.equal(
    normalizeBaseUrl('https://api.example.com/v1///'),
    'https://api.example.com/v1'
  );
  assert.equal(
    normalizeBaseUrl('http://localhost:11434/v1'),
    'http://localhost:11434/v1'
  );
});

await test('2.4 Custom models require at least one non-empty model and reject duplicate IDs', () => {
  // Empty models list
  const v1 = customProviderStore.validate({
    id: 'test-prov',
    name: 'Test',
    baseUrl: 'https://api.test.com/v1',
    models: [],
  });
  assert.equal(v1.valid, false);
  assert.ok(v1.errors.models);

  // Duplicate model IDs
  const v2 = customProviderStore.validate({
    id: 'test-prov',
    name: 'Test',
    baseUrl: 'https://api.test.com/v1',
    models: [
      { id: 'llama-3', name: 'Llama 3' },
      { id: 'llama-3', name: 'Llama 3 Duplicate' },
    ],
  });
  assert.equal(v2.valid, false);
  assert.match(v2.errors.model_1, /Duplicate/);
});

await test('2.5 Safe non-secret persistence never writes plaintext API keys to localStorage', () => {
  localStore.clear();

  const customDef = {
    id: 'safe-provider',
    name: 'Safe Provider',
    baseUrl: 'https://api.safe.com/v1',
    models: [{ id: 'safe-m1', name: 'Safe M1' }],
    headers: [
      { id: 'h1', name: 'X-Normal', value: 'normal-value', isSecret: false },
      { id: 'h2', name: 'X-Secret', value: 'super-secret-token', isSecret: true },
    ],
  };

  const saveRes = customProviderStore.save(customDef);
  assert.equal(saveRes.success, true);

  const rawStorage = localStore.get('gbcoder_custom_providers_v1');
  assert.ok(rawStorage);
  assert.ok(!rawStorage.includes('super-secret-token'));
  assert.ok(rawStorage.includes('normal-value'));
});

// ── Suite 3: Custom Headers Validation & Injection Rejection ──
console.log('\nSuite 3: Custom Headers Validation & Injection Rejection');

await test('3.1 Custom headers reject CRLF injection and invalid header name characters', () => {
  const badHeaders = [
    { name: 'X-Injected\r\nSet-Cookie: evil', value: 'value' },
  ];
  const res1 = validateCustomHeaders(badHeaders);
  assert.equal(res1.valid, false);
  assert.match(res1.error, /invalid|control|prohibited/i);

  const badVal = [
    { name: 'X-Auth', value: 'token\r\nInjected-Header: yes' },
  ];
  const res2 = validateCustomHeaders(badVal);
  assert.equal(res2.valid, false);
  assert.match(res2.error, /prohibited control characters or newlines/i);

  const forbiddenHost = [
    { name: 'Host', value: 'evil.com' },
  ];
  const res3 = validateCustomHeaders(forbiddenHost);
  assert.equal(res3.valid, false);
  assert.match(res3.error, /cannot be overridden/i);

  const validHeaders = [
    { name: 'X-Organization-Id', value: 'org_12345' },
    { name: 'User-Agent', value: 'GBCoder/1.0' },
  ];
  const res4 = validateCustomHeaders(validHeaders);
  assert.equal(res4.valid, true);
  assert.equal(res4.sanitized['X-Organization-Id'], 'org_12345');
});

// ── Suite 4: Provider Registry & Catalog ──
console.log('\nSuite 4: Provider Registry, Multiple Providers & Model Limits');

await test('4.1 Catalog contains both Popular and Other categories with truthful capabilities', () => {
  const catalog = providerRegistry.getProviderCatalog();
  const popular = catalog.filter((c) => c.category === 'popular');
  const other = catalog.filter((c) => c.category === 'other');

  assert.ok(popular.some((c) => c.id === 'gemini'));
  assert.ok(popular.some((c) => c.id === 'openrouter'));
  assert.ok(popular.some((c) => c.id === 'openai'));
  assert.ok(popular.some((c) => c.id === 'custom'));
  assert.ok(popular.some((c) => c.id === 'mock'));

  // OpenRouter is marked CORS ready, OpenAI is marked false
  const openRouter = catalog.find((c) => c.id === 'openrouter');
  const openAi = catalog.find((c) => c.id === 'openai');
  assert.equal(openRouter.browserCorsSupport, true);
  assert.equal(openAi.browserCorsSupport, false);

  assert.ok(other.some((c) => c.id === 'groq'));
  assert.ok(other.some((c) => c.id === 'together'));
});

await test('4.2 Multiple custom providers can be registered, edited, and deleted dynamically', () => {
  const provA = {
    id: 'prov-a',
    name: 'Provider Alpha',
    baseUrl: 'https://api.alpha.ai/v1',
    models: [{ id: 'alpha-1', name: 'Alpha 1', contextWindow: 64000 }],
  };
  const provB = {
    id: 'prov-b',
    name: 'Provider Beta',
    baseUrl: 'https://api.beta.ai/v1',
    models: [{ id: 'beta-fast', name: 'Beta Fast', contextWindow: 16000 }],
  };

  providerRegistry.registerCustomProvider(provA);
  providerRegistry.registerCustomProvider(provB);

  assert.equal(providerRegistry.isCustomProvider('prov-a'), true);
  assert.equal(providerRegistry.isCustomProvider('prov-b'), true);

  const modelsA = providerRegistry.getModelsForProvider('prov-a');
  assert.equal(modelsA[0].id, 'alpha-1');
  assert.equal(providerRegistry.getModelContextLimit('prov-a'), 64000);

  const modelsB = providerRegistry.getModelsForProvider('prov-b');
  assert.equal(modelsB[0].id, 'beta-fast');
  assert.equal(providerRegistry.getModelContextLimit('prov-b'), 16000);

  // Delete prov-b
  const deleted = providerRegistry.removeCustomProvider('prov-b');
  assert.equal(deleted, true);
  assert.equal(providerRegistry.isCustomProvider('prov-b'), false);
});

// ── Suite 5: Connection Diagnostics & Mocked Tests ──
console.log('\nSuite 5: Connection Diagnostics, Actual Model ID & Consent Gate');

await test('5.1 Connection test without consent does not perform network probe', async () => {
  const prov = new OpenAiCompatibleProvider(
    'test-consent',
    'Consent Provider',
    'https://api.example.com/v1',
    [{ id: 'm1', name: 'M1', provider: 'test-consent', contextWindow: 32000, description: '', supportsStreaming: true }]
  );

  const res = await prov.testConnection('fake-key', undefined, 'm1', undefined, false);
  assert.equal(res.success, true);
  assert.equal(res.latencyMs, 0);
  assert.match(res.message, /requires explicit consent/i);
});

await test('5.2 Connection test sends configured target model ID (not custom-model) and handles 404 cleanly', async () => {
  let capturedBody = null;
  const originalFetch = globalThis.fetch;

  // Intercept fetch
  globalThis.fetch = async (url, options) => {
    capturedBody = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        error: {
          message: `The model '${capturedBody.model}' does not exist on Inception Labs`,
          type: 'invalid_request_error',
        },
      }),
      { status: 404, statusText: 'Not Found', headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const customProv = new OpenAiCompatibleProvider(
      'inception',
      'Inception Labs',
      'https://api.inceptionlabs.ai/v1',
      [{ id: 'mercury-2', name: 'Mercury 2', provider: 'inception', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    const result = await customProv.testConnection(
      'test-api-key-12345',
      'https://api.inceptionlabs.ai/v1',
      'mercury-2',
      undefined,
      true
    );

    assert.equal(capturedBody.model, 'mercury-2');
    assert.equal(result.success, false);
    assert.equal(result.httpStatus, 404);
    assert.equal(result.errorCategory, 'not_found');
    assert.match(result.message, /mercury-2/);
    assert.ok(!result.message.includes('result.split'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('5.3 Connection test parses structured non-string errorJson without throwing result.split', async () => {
  const originalFetch = globalThis.fetch;

  // FastAPI / Pydantic style structured error object: error.message is an object
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        error: {
          message: {
            code: 'invalid_model_parameters',
            details: [{ loc: ['body', 'temperature'], msg: 'out of range' }],
          },
        },
      }),
      { status: 400, statusText: 'Bad Request', headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const customProv = new OpenAiCompatibleProvider(
      'structured-err-prov',
      'Structured Error Provider',
      'https://api.structured.com/v1',
      [{ id: 'm1', name: 'M1', provider: 'structured-err-prov', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    const result = await customProv.testConnection(
      'key-12345678',
      'https://api.structured.com/v1',
      'm1',
      undefined,
      true
    );

    assert.equal(result.success, false);
    assert.equal(result.httpStatus, 400);
    assert.equal(result.errorCategory, 'config');
    assert.ok(!result.message.includes('result.split'));
    assert.match(result.message, /invalid_model_parameters/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('5.4 Successful connection probe returns latency and model confirmation', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        id: 'chatcmpl-test',
        choices: [{ message: { role: 'assistant', content: 'pong' } }],
      }),
      { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const customProv = new OpenAiCompatibleProvider(
      'valid-prov',
      'Valid Provider',
      'https://api.valid.com/v1',
      [{ id: 'fast-model', name: 'Fast Model', provider: 'valid-prov', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    const result = await customProv.testConnection(
      'key-12345678',
      'https://api.valid.com/v1',
      'fast-model',
      undefined,
      true
    );

    assert.equal(result.success, true);
    assert.equal(result.httpStatus, 200);
    assert.match(result.message, /Connected successfully/);
    assert.match(result.message, /fast-model/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 6: GB Assist Chat & Agent Mode Integration ──
console.log('\nSuite 6: GB Assist Chat & Agent Mode Integration with Custom Providers');

await test('6.1 Setting active custom provider updates assistAgentService and sends exact model ID', async () => {
  const customDef = {
    id: 'my-custom-llm',
    name: 'My Custom LLM',
    baseUrl: 'https://api.customllm.ai/v1',
    models: [
      { id: 'mercury-2-code', name: 'Mercury 2 Code' },
      { id: 'mercury-2-chat', name: 'Mercury 2 Chat' },
    ],
  };

  providerRegistry.registerCustomProvider(customDef);
  keyManager.setApiKey('my-custom-llm', 'sk-test-custom-key-9999');

  // Switch assistAgentService to this provider and model
  assistAgentService.setProvider('my-custom-llm', 'mercury-2-code');

  const state = assistAgentService.getState();
  assert.equal(state.selectedProvider, 'my-custom-llm');
  assert.equal(state.selectedModel, 'mercury-2-code');

  // Verify that providerRegistry active provider matches
  const activeProv = providerRegistry.getActiveProvider();
  assert.equal(activeProv.id, 'my-custom-llm');
  assert.equal(providerRegistry.getActiveModel('my-custom-llm'), 'mercury-2-code');

  // Verify streamChat receives exact model ID
  const originalFetch = globalThis.fetch;
  let receivedPayload = null;

  globalThis.fetch = async (url, options) => {
    receivedPayload = JSON.parse(options.body);
    const sseBody = 'data: {"id":"1","choices":[{"delta":{"content":"Hello from Mercury 2"}}]}\n\ndata: [DONE]\n\n';
    return new Response(sseBody, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    let streamedContent = '';
    await activeProv.streamChat(
      [{ role: 'user', content: 'hello' }],
      {
        apiKey: keyManager.getApiKey('my-custom-llm'),
        model: state.selectedModel,
      },
      (chunk) => {
        if (chunk.contentDelta) streamedContent += chunk.contentDelta;
      }
    );

    assert.equal(receivedPayload.model, 'mercury-2-code');
    assert.equal(streamedContent, 'Hello from Mercury 2');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log('\n============================================================');
console.log(`  ALL ${passed} / ${total} TESTS PASSED!`);
console.log('============================================================\n');

try {
  rmSync(tempDir, { recursive: true, force: true });
} catch {
  // Ignore cleanup error if already removed
}

