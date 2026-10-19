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
      export * from './src/services/ai/modelDiscoveryService.ts';
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
  constructModelsUrl,
  discoverModels,
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

// ── Suite 7: Authenticated Model Discovery (discoverModels & constructModelsUrl) ──
console.log('\nSuite 7: Authenticated Model Discovery (discoverModels & constructModelsUrl)');

await test('7.1 constructModelsUrl enforces HTTPS, allows loopback HTTP, strips duplicate endpoints, and rejects 0.0.0.0', () => {
  // Standard base URL
  const r1 = constructModelsUrl('https://api.mistral.ai/v1');
  assert.equal(r1.valid, true);
  assert.equal(r1.url, 'https://api.mistral.ai/v1/models');

  // Trailing slash
  const r2 = constructModelsUrl('https://api.mistral.ai/v1/');
  assert.equal(r2.valid, true);
  assert.equal(r2.url, 'https://api.mistral.ai/v1/models');

  // Already includes /models
  const r3 = constructModelsUrl('https://api.mistral.ai/v1/models');
  assert.equal(r3.valid, true);
  assert.equal(r3.url, 'https://api.mistral.ai/v1/models');

  // Includes /chat/completions
  const r4 = constructModelsUrl('https://api.mistral.ai/v1/chat/completions');
  assert.equal(r4.valid, true);
  assert.equal(r4.url, 'https://api.mistral.ai/v1/models');

  // Loopback HTTP allowed
  const r5 = constructModelsUrl('http://localhost:11434/v1');
  assert.equal(r5.valid, true);
  assert.equal(r5.url, 'http://localhost:11434/v1/models');

  const r6 = constructModelsUrl('http://127.0.0.1:8000/v1');
  assert.equal(r6.valid, true);
  assert.equal(r6.url, 'http://127.0.0.1:8000/v1/models');

  // Insecure remote HTTP rejected
  const r7 = constructModelsUrl('http://insecure-api.com/v1');
  assert.equal(r7.valid, false);
  assert.match(r7.error, /HTTPS is required/i);

  // 0.0.0.0 rejected
  const r8 = constructModelsUrl('http://0.0.0.0:8000/v1');
  assert.equal(r8.valid, false);
  assert.match(r8.error, /0\.0\.0\.0/);
});

await test('7.2 discoverModels sends GET to {baseUrl}/models with Bearer auth, custom headers, and zero inference probe', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';
  let interceptedMethod = '';
  let interceptedHeaders = {};
  let interceptedBody = undefined;

  globalThis.fetch = async (url, options) => {
    interceptedUrl = String(url);
    interceptedMethod = options.method;
    interceptedHeaders = options.headers;
    interceptedBody = options.body;

    return new Response(
      JSON.stringify({
        object: 'list',
        data: [
          { id: 'mistral-small-latest', name: 'Mistral Small Latest' },
          { id: 'codestral-latest', name: 'Codestral Latest' },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await discoverModels({
      baseUrl: 'https://api.mistral.ai/v1',
      apiKey: 'test-mistral-api-key-xyz',
      customHeaders: {
        'X-Custom-Project': 'alpha-ide',
      },
    });

    assert.equal(result.success, true);
    assert.equal(interceptedUrl, 'https://api.mistral.ai/v1/models');
    assert.equal(interceptedMethod, 'GET');
    assert.equal(interceptedBody, undefined); // Zero request body / probe
    assert.equal(interceptedHeaders['Authorization'], 'Bearer test-mistral-api-key-xyz');
    assert.equal(interceptedHeaders['X-Custom-Project'], 'alpha-ide');
    assert.equal(result.models.length, 2);
    assert.equal(result.models[0].id, 'mistral-small-latest');
    assert.equal(result.models[1].id, 'codestral-latest');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.3 discoverModels parses standard OpenAI/Mistral format, shorthand format, and direct array format', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Shorthand { data: [{ id, ... }] }
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          data: [
            { id: 'model-a', display_name: 'Model Alpha', context_length: 64000, owned_by: 'org-a' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const res1 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(res1.success, true);
    assert.equal(res1.models.length, 1);
    assert.equal(res1.models[0].id, 'model-a');
    assert.equal(res1.models[0].name, 'Model Alpha');
    assert.equal(res1.models[0].contextWindow, 64000);
    assert.equal(res1.models[0].ownedBy, 'org-a');

    // 2. Direct array [{ id, ... }]
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify([
          { id: 'model-b', max_context_tokens: 128000 },
          'model-c',
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const res2 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(res2.success, true);
    assert.equal(res2.models.length, 2);
    assert.equal(res2.models[0].id, 'model-b');
    assert.equal(res2.models[0].contextWindow, 128000);
    assert.equal(res2.models[1].id, 'model-c');
    assert.equal(res2.models[1].name, 'model-c');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.4 discoverModels gracefully handles empty list, malformed items, and deduplicates identical IDs', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Empty list
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    };
    const resEmpty = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(resEmpty.success, false);
    assert.equal(resEmpty.errorCategory, 'empty');

    // 2. Deduplication and malformed items (null, missing id, duplicates)
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          data: [
            null,
            { foo: 'no-id' },
            { id: 'duplicate-model', name: 'First Instance' },
            { id: 'duplicate-model', name: 'Second Instance' },
            { id: 'unique-model', name: 'Unique' },
          ],
        }),
        { status: 200 }
      );
    };
    const resDedup = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(resDedup.success, true);
    assert.equal(resDedup.models.length, 2);
    assert.equal(resDedup.models[0].id, 'duplicate-model');
    assert.equal(resDedup.models[0].name, 'First Instance');
    assert.equal(resDedup.models[1].id, 'unique-model');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.5 discoverModels correctly maps HTTP status codes: 401/403, 404, 405, 429, 500+, and redirects', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 401 Auth
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'Bad API Key' } }), { status: 401 });
    const r401 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1', apiKey: 'sk-invalid' });
    assert.equal(r401.success, false);
    assert.equal(r401.httpStatus, 401);
    assert.equal(r401.errorCategory, 'auth');

    // 403 Forbidden
    globalThis.fetch = async () => new Response('Forbidden', { status: 403 });
    const r403 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1', apiKey: 'sk-perm-denied' });
    assert.equal(r403.success, false);
    assert.equal(r403.httpStatus, 403);
    assert.equal(r403.errorCategory, 'auth');

    // 404 Not Found
    globalThis.fetch = async () => new Response('Not Found', { status: 404 });
    const r404 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(r404.success, false);
    assert.equal(r404.httpStatus, 404);
    assert.equal(r404.errorCategory, 'not_found');
    assert.match(r404.suggestedAction, /\+ Add Model/);

    // 405 Method Not Allowed
    globalThis.fetch = async () => new Response('Method Not Allowed', { status: 405 });
    const r405 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(r405.success, false);
    assert.equal(r405.httpStatus, 405);
    assert.equal(r405.errorCategory, 'unsupported');

    // 429 Rate Limit
    globalThis.fetch = async () => new Response('Rate limited', { status: 429 });
    const r429 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(r429.success, false);
    assert.equal(r429.httpStatus, 429);
    assert.equal(r429.errorCategory, 'rate_limit');

    // 500 Server Error
    globalThis.fetch = async () => new Response('Internal Server Error', { status: 500 });
    const r500 = await discoverModels({ baseUrl: 'https://api.custom.ai/v1' });
    assert.equal(r500.success, false);
    assert.equal(r500.httpStatus, 500);
    assert.equal(r500.errorCategory, 'server');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.6 discoverModels detects browser CORS/Network failure and categorizes as cors', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  try {
    const res = await discoverModels({ baseUrl: 'https://api.mistral.ai/v1', apiKey: 'test-key' });
    assert.equal(res.success, false);
    assert.equal(res.errorCategory, 'cors');
    assert.match(res.error, /Browser CORS restriction/);
    assert.match(res.suggestedAction, /\+ Add Model/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.7 discoverModels respects AbortSignal and timeout, returning timeout errorCategory', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    return new Promise((resolve, reject) => {
      options.signal?.addEventListener('abort', () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });
  };

  try {
    const ac = new AbortController();
    const promise = discoverModels({
      baseUrl: 'https://api.custom.ai/v1',
      signal: ac.signal,
    });
    ac.abort();

    const res = await promise;
    assert.equal(res.success, false);
    assert.equal(res.errorCategory, 'timeout');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 8: Model Propagation & Custom Model Routing Invariants ──
console.log('\nSuite 8: Model Propagation & Custom Model Routing Invariants');

await test('8.1 Test Connection sends exact model ID mistral-small-4 and never custom-model or gpt-4o-mini', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedBody = null;

  globalThis.fetch = async (url, options) => {
    interceptedBody = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        id: 'chatcmpl-test-id',
        choices: [{ message: { role: 'assistant', content: 'hello' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const provider = new OpenAiCompatibleProvider(
      'mistral',
      'mistral',
      'https://api.mistral.ai/v1',
      [{ id: 'mistral-small-4', name: 'Mistral Small 4', provider: 'mistral', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    const result = await provider.testConnection(
      'secret-key-12345',
      'https://api.mistral.ai/v1',
      'mistral-small-4',
      undefined,
      true
    );

    assert.equal(result.success, true);
    assert.notEqual(interceptedBody.model, 'custom-model');
    assert.notEqual(interceptedBody.model, 'gpt-4o-mini');
    assert.equal(interceptedBody.model, 'mistral-small-4');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('8.2 Test Connection with empty or whitespace model ID returns validation error before network call', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('{}', { status: 200 });
  };

  try {
    const provider = new OpenAiCompatibleProvider(
      'mistral',
      'mistral',
      'https://api.mistral.ai/v1',
      []
    );

    const result = await provider.testConnection(
      'secret-key-12345',
      'https://api.mistral.ai/v1',
      '   ', // whitespace only
      undefined,
      true
    );

    assert.equal(result.success, false);
    assert.equal(result.errorCategory, 'config');
    assert.match(result.message, /No model selected/i);
    assert.equal(fetchCalled, false); // No network probe was performed!
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('8.3 streamChat uses exact model ID in request body.model', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedBody = null;

  globalThis.fetch = async (url, options) => {
    interceptedBody = JSON.parse(options.body);
    const sse = 'data: {"id":"1","choices":[{"delta":{"content":"Hi"}}]}\n\ndata: [DONE]\n\n';
    return new Response(sse, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    const provider = new OpenAiCompatibleProvider(
      'mistral',
      'mistral',
      'https://api.mistral.ai/v1',
      [{ id: 'mistral-small-4', name: 'Mistral Small 4', provider: 'mistral', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    let output = '';
    await provider.streamChat(
      [{ role: 'user', content: 'test message' }],
      {
        apiKey: 'test-key',
        model: 'mistral-small-4',
      },
      (chunk) => {
        if (chunk.contentDelta) output += chunk.contentDelta;
      }
    );

    assert.equal(output, 'Hi');
    assert.equal(interceptedBody.model, 'mistral-small-4');
    assert.notEqual(interceptedBody.model, 'custom-model');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('8.4 assistAgentService autonomous execution propagates exact model ID', async () => {
  // Register custom provider in registry
  providerRegistry.registerCustomProvider({
    id: 'mistral-work',
    name: 'Mistral Work',
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-small-4', name: 'Mistral Small 4' },
      { id: 'codestral-2501', name: 'Codestral 2501' },
    ],
  });
  keyManager.setApiKey('mistral-work', 'sk-test-mistral-work');

  // Select provider and specific model
  assistAgentService.setProvider('mistral-work', 'codestral-2501');

  const state = assistAgentService.getState();
  assert.equal(state.selectedProvider, 'mistral-work');
  assert.equal(state.selectedModel, 'codestral-2501');
  assert.equal(providerRegistry.getActiveModel('mistral-work'), 'codestral-2501');

  // Intercept fetch during streamChat
  const originalFetch = globalThis.fetch;
  let interceptedBody = null;

  globalThis.fetch = async (url, options) => {
    interceptedBody = JSON.parse(options.body);
    const sse = 'data: {"id":"1","choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n';
    return new Response(sse, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    const activeProv = providerRegistry.getActiveProvider();
    await activeProv.streamChat(
      [{ role: 'user', content: 'test' }],
      {
        apiKey: keyManager.getApiKey('mistral-work'),
        model: state.selectedModel,
      },
      () => {}
    );

    assert.equal(interceptedBody.model, 'codestral-2501');
    assert.notEqual(interceptedBody.model, 'custom-model');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('8.5 Discovered models can be selected, saved and immediately propagate to active configuration', async () => {
  // Simulate discovered models returned by provider
  const discoveredModels = [
    { id: 'mistral-large-2407', name: 'Mistral Large 2407' },
    { id: 'pixtral-12b-2409', name: 'Pixtral 12B' },
  ];

  // User selects mistral-large-2407 and saves provider
  const def = {
    id: 'discovered-mistral',
    name: 'Discovered Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    models: discoveredModels,
  };

  const saveRes = providerRegistry.registerCustomProvider(def);
  assert.equal(saveRes.success, true);

  // Set active model to mistral-large-2407
  providerRegistry.setActiveModel('discovered-mistral', 'mistral-large-2407');
  assistAgentService.setProvider('discovered-mistral', 'mistral-large-2407');

  assert.equal(providerRegistry.getActiveModel('discovered-mistral'), 'mistral-large-2407');
  assert.equal(assistAgentService.getState().selectedModel, 'mistral-large-2407');
});

// ============================================================================
// 9. OPENROUTER KEY REPLACEMENT, PROVIDER SWITCHING & AUTH REGRESSION TESTS
// ============================================================================

await test('9.1 Replacing an old key with a new one updates KeyManager and retains origin binding', () => {
  // Set initial key for openrouter
  keyManager.setApiKey('openrouter', 'sk-or-v1-old-11111111111111111111111111111111', false);
  assert.equal(keyManager.hasApiKey('openrouter'), true);
  assert.equal(keyManager.getApiKey('openrouter'), 'sk-or-v1-old-11111111111111111111111111111111');
  assert.equal(keyManager.isKeyOrProviderAuthorized('openrouter', 'sk-or-v1-old-11111111111111111111111111111111', 'https://openrouter.ai/api/v1'), true);

  // Replace with new key
  keyManager.setApiKey('openrouter', 'sk-or-v1-new-22222222222222222222222222222222', false);
  assert.equal(keyManager.getApiKey('openrouter'), 'sk-or-v1-new-22222222222222222222222222222222');
  assert.equal(keyManager.isKeyOrProviderAuthorized('openrouter', 'sk-or-v1-new-22222222222222222222222222222222', 'https://openrouter.ai/api/v1'), true);

  // Clear key cleanly
  keyManager.clearApiKey('openrouter');
  assert.equal(keyManager.hasApiKey('openrouter'), false);
  assert.equal(keyManager.getApiKey('openrouter'), '');
});

await test('9.2 Switching from custom provider to OpenRouter retains model selection and built-in isolation', () => {
  // 1. Set up custom provider
  providerRegistry.registerCustomProvider({
    id: 'custom-ollama',
    name: 'Custom Ollama',
    baseUrl: 'http://localhost:11434/v1',
    models: [{ id: 'llama3:latest', name: 'Llama 3' }],
    customHeaders: [{ key: 'X-Custom-Env', value: 'testing' }],
  });
  keyManager.setApiKey('custom-ollama', 'ollama-secret');
  assistAgentService.setProvider('custom-ollama', 'llama3:latest');

  assert.equal(assistAgentService.getState().selectedProvider, 'custom-ollama');
  assert.equal(assistAgentService.getState().selectedModel, 'llama3:latest');

  // 2. Switch to OpenRouter with specific model minimax/minimax-m3.1-flash:free
  providerRegistry.setActiveModel('openrouter', 'minimax/minimax-m3.1-flash:free');
  assistAgentService.setProvider('openrouter', 'minimax/minimax-m3.1-flash:free');

  const state = assistAgentService.getState();
  assert.equal(state.selectedProvider, 'openrouter');
  assert.equal(state.selectedModel, 'minimax/minimax-m3.1-flash:free');

  const activeProvider = providerRegistry.getActiveProvider();
  assert.equal(activeProvider.id, 'openrouter');
  assert.equal(activeProvider.getBaseUrl(), 'https://openrouter.ai/api/v1');
});

await test('9.3 OpenRouter Chat targets https://openrouter.ai/api/v1/chat/completions with effective Authorization header and exact model ID', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = null;
  let interceptedHeaders = null;
  let interceptedBody = null;

  globalThis.fetch = async (url, options) => {
    interceptedUrl = url;
    interceptedHeaders = options.headers;
    interceptedBody = JSON.parse(options.body);
    const sse = 'data: {"id":"1","choices":[{"delta":{"content":"Hello from OpenRouter"}}]}\n\ndata: [DONE]\n\n';
    return new Response(sse, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    keyManager.setApiKey('openrouter', 'sk-or-v1-mock-test-key-999');
    const openrouterProv = providerRegistry.getProvider('openrouter');
    assert.ok(openrouterProv, 'OpenRouter provider must exist in registry');

    let contentReceived = '';
    // Call streamChat without inline options.apiKey to ensure effectiveApiKey from keyManager is resolved
    await openrouterProv.streamChat(
      [{ role: 'user', content: 'hello' }],
      {
        model: 'minimax/minimax-m3.1-flash:free',
      },
      (chunk) => {
        if (chunk.contentDelta) contentReceived += chunk.contentDelta;
      }
    );

    assert.equal(contentReceived, 'Hello from OpenRouter');
    assert.equal(interceptedUrl, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(interceptedBody.model, 'minimax/minimax-m3.1-flash:free');
    assert.equal(interceptedHeaders['Authorization'], 'Bearer sk-or-v1-mock-test-key-999');
    assert.equal(interceptedHeaders['HTTP-Referer'], 'https://code.ladestack.in');
    assert.equal(interceptedHeaders['X-Title'], 'GB Coder (LadeStack)');
  } finally {
    globalThis.fetch = originalFetch;
    keyManager.clearApiKey('openrouter');
  }
});

await test('9.4 Real HTTP 401 Authentication Failure is surfaced accurately without fabricating success', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Invalid API key for OpenRouter (BYOK)',
          code: 401,
        },
      }),
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };

  try {
    keyManager.setApiKey('openrouter', 'sk-or-v1-invalid-or-revoked-key');
    const openrouterProv = providerRegistry.getProvider('openrouter');

    // 1. streamChat must throw accurate 401 without swallowing or fabricating success
    await assert.rejects(
      async () => {
        await openrouterProv.streamChat(
          [{ role: 'user', content: 'test 401 surfacing' }],
          {
            model: 'minimax/minimax-m3.1-flash:free',
          },
          () => {}
        );
      },
      (err) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /Authentication Failed \(401\)/);
        assert.match(err.message, /Invalid API key for OpenRouter/);
        // Ensure the secret key value is never leaked into the thrown error
        assert.equal(err.message.includes('sk-or-v1-invalid-or-revoked-key'), false);
        return true;
      }
    );

    // 2. testConnection must return structured auth failure
    const testResult = await openrouterProv.testConnection(
      'sk-or-v1-invalid-or-revoked-key',
      'https://openrouter.ai/api/v1',
      'minimax/minimax-m3.1-flash:free',
      undefined,
      true
    );

    assert.equal(testResult.success, false);
    assert.equal(testResult.errorCategory, 'auth');
    assert.equal(testResult.httpStatus, 401);
    assert.match(testResult.message, /Authentication failed \(401\)|Invalid API key for OpenRouter/);
    assert.equal(testResult.message.includes('sk-or-v1-invalid-or-revoked-key'), false);
  } finally {
    globalThis.fetch = originalFetch;
    keyManager.clearApiKey('openrouter');
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

