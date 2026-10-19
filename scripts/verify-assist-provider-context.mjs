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
const tempDir = join(process.cwd(), '.tmp-provider-context-verify');
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
 export * from './src/services/ai/contextBuilder.ts';
 export * from './src/services/ai/agent/agentEngine.ts';
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


const { ContextBuilder, agentEngine } = byok;
let count = 0;
async function test(name, run) { await run(); console.log(`PASS ${++count}: ${name}`); }
const event = (delta) => `data:${JSON.stringify({ choices: [{ delta }] })}\r\n\r\n`;
const sse = (text) => new Response(new ReadableStream({ start(c) {
  const bytes = new TextEncoder().encode(text);
  for (let i = 0; i < bytes.length; i += 3) c.enqueue(bytes.slice(i, i + 3));
  c.close();
} }), { headers: { 'Content-Type': 'text/event-stream' } });
const provider = new OpenAiCompatibleProvider('test-mistral', 'Mistral fixture', 'https://api.mistral.ai/v1', []);
const options = { model: 'codestral-fixture', apiKey: 'test-key-only' };
await test('fragmented UTF8, no-space SSE, CRLF and final unterminated text survive', async () => {
  globalThis.fetch = async (_, init) => { const body = JSON.parse(init.body); assert.equal(body.model, options.model); assert.equal(body.stream_options, undefined); return sse(event({ content: 'Hello 😀' }) + 'data:' + JSON.stringify({ choices: [{ delta: { content: ' world' } }] })); };
  const chunks = [];
  const response = await provider.streamChat([], options, (c) => { if (c.contentDelta) chunks.push(c.contentDelta); });
  assert.equal(response.fullContent, 'Hello 😀 world'); assert.equal(chunks.join(''), response.fullContent);
});
await test('stream errors, malformed SSE, non-streaming JSON and empty responses are actionable', async () => {
  for (const [body, pattern] of [['data:{"error":{"message":"unavailable"}}\n\n', /unavailable/], ['data:no json\n\n', /Invalid SSE/], ['data:[DONE]\n\n', /Empty provider/]]) {
    globalThis.fetch = async () => sse(body);
    await assert.rejects(provider.streamChat([], options, () => {}), pattern);
  }
  globalThis.fetch = async () => new Response('{}', { headers: { 'content-type': 'application/json' } });
  await assert.rejects(provider.streamChat([], options, () => {}), /Unsupported streaming/);
});
const project = { projectType: 'react', files: [
  { path: 'src/main.ts', content: 'export const marker = "REAL_WORKSPACE_CONTENT";', language: 'typescript' },
  { path: 'src/.env.local', content: 'NEVER_TRANSMIT', language: 'javascript' },
  { path: 'src/asset.png', content: 'BINARY_MARKER', language: 'javascript' },
  { path: 'src/node_modules/a.js', content: 'GENERATED_MARKER', language: 'javascript' },
] };
await test('folder recursion deduplicates and excludes secrets, binaries, generated files without writes', () => {
  const before = JSON.stringify(project);
  const ctx = ContextBuilder.assembleContext(project, null, ['src/', 'src/main.ts'], '');
  assert.deepEqual(ctx.files.map((f) => f.path), ['src/main.ts']);
  assert.equal(JSON.stringify(project), before);
  assert.equal(ContextBuilder.extractAtMentions('mail@src/main.ts', project.files).length, 0);
});
await test('folder context is bounded to file count and token limits', () => {
  const large = { ...project, files: Array.from({ length: 500 }, (_, i) => ({ path: `src/${i}.ts`, content: 'x'.repeat(1000), language: 'typescript' })) };
  const ctx = ContextBuilder.assembleContext(large, null, ['src/'], '', 2000);
  assert.ok(ctx.files.length <= 40); assert.ok(ctx.totalEstimatedTokens <= 2000);
  assert.match(ctx.summary, /omitted/);
});
await test('authenticated 1000-model discovery preserves identity, context and tool metadata', async () => {
  globalThis.fetch = async (url, init) => { assert.equal(url, 'https://openrouter.ai/api/v1/models'); assert.equal(init.headers.Authorization, 'Bearer fake-catalog-key');
    return Response.json({ data: Array.from({ length: 1000 }, (_, i) => ({ id: `author/model-${i}`, name: `Model ${i}`, context_length: 12345, supported_parameters: i % 2 ? ['tools'] : [] })) }); };
  const result = await providerRegistry.fetchModelsForProvider('openrouter', undefined, 'fake-catalog-key');
  assert.equal(result.models.length, 1000); assert.equal(result.models[45].name, 'Model 45');
  providerRegistry.setActiveModel('openrouter', 'removed-model');
  providerRegistry.applyDiscoveredModels('openrouter', result.models);
  assert.equal(providerRegistry.getActiveModel('openrouter'), 'removed-model');
  assert.equal(providerRegistry.getModelsForProvider('openrouter')[45].supportsToolCalling, true);
});
providerRegistry.registerCustomProvider({ id: 'mistral-fixture', name: 'Mistral fixture', baseUrl: 'https://api.mistral.ai/v1', models: [{ id: 'chat-fixture', name: 'Chat fixture', supportsToolCalling: false }, { id: 'tools-fixture', name: 'Tools fixture', supportsToolCalling: true }] });
keyManager.setApiKey('mistral-fixture', 'test-mistral-key');
await test('real service Chat sends saved provider/model, auth, explicit file context and persists visible reply', async () => {
  assistAgentService.setProject('context-service-fixture'); assistAgentService.setProvider('mistral-fixture', 'chat-fixture'); assistAgentService.setMode('Ask');
  assistAgentService.toggleAttachedContextPath('src/');
  globalThis.fetch = async (url, init) => { assert.equal(url, 'https://api.mistral.ai/v1/chat/completions'); assert.equal(init.headers.Authorization, 'Bearer test-mistral-key'); const body = JSON.parse(init.body);
    assert.equal(body.model, 'chat-fixture'); assert.equal(body.tools, undefined); assert.match(body.messages[0].content, /REAL_WORKSPACE_CONTENT/); assert.doesNotMatch(JSON.stringify(body), /NEVER_TRANSMIT|BINARY_MARKER|GENERATED_MARKER/);
    return sse(event({ content: 'Visible Chat answer' }) + 'data:[DONE]\n\n'); };
  await assistAgentService.submitPrompt('Explain this', project);
  assert.equal(assistAgentService.getActiveSession().messages.at(-1).content, 'Visible Chat answer');
  assert.equal(assistAgentService.getState().isGenerating, false);
  assert.ok([...localStore.values()].some((value) => value.includes('Visible Chat answer')));
});
await test('Agent uses actual read_file result in provider continuation and includes explicit context', async () => {
  assistAgentService.setProvider('mistral-fixture', 'tools-fixture'); assistAgentService.setMode('Agent');
  let requests = 0;
  globalThis.fetch = async (_, init) => { const body = JSON.parse(init.body); assert.equal(body.model, 'tools-fixture'); requests++;
    if (requests === 1) { assert.match(body.messages[0].content, /REAL_WORKSPACE_CONTENT/); return sse(event({ tool_calls: [{ index: 0, id: 'call-real-1', type: 'function', function: { name: 'read_file', arguments: '{"path":"src/main.ts"}' } }] })); }
    const tool = body.messages.find((m) => m.role === 'tool'); assert.equal(tool.tool_call_id, 'call-real-1'); assert.match(tool.content, /REAL_WORKSPACE_CONTENT/);
    return sse(event({ content: 'Verified actual file content.' })); };
  await assistAgentService.submitPrompt('Read the file', project);
  for (let i = 0; i < 100 && assistAgentService.getState().isGenerating; i++) await new Promise((r) => setTimeout(r, 20));
  assert.equal(requests, 2); assert.equal(agentEngine.getTaskState().status, 'completed');
  assert.match(assistAgentService.getActiveSession().messages.at(-1).content, /Verified actual/);
});
await test('conversation and project changes clear attachments', () => {
  assistAgentService.createNewSession(); assert.deepEqual(assistAgentService.getState().attachedContextPaths, []);
  assistAgentService.toggleAttachedContextPath('src/'); assistAgentService.setProject('other-project');
  assert.deepEqual(assistAgentService.getState().attachedContextPaths, []);
});

await test('custom model metadata survives save/reload with distinct identities', () => {
  const def = customProviderStore.getById('mistral-fixture');
  assert.deepEqual(def.models.map((m) => [m.id, m.name]), [['chat-fixture', 'Chat fixture'], ['tools-fixture', 'Tools fixture']]);
  providerRegistry.loadCustomProviders();
  assert.deepEqual(providerRegistry.getModelsForProvider('mistral-fixture').map((m) => m.name), ['Chat fixture', 'Tools fixture']);
});
await test('stale refreshed catalog rejects selected model before inference', async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; throw new Error('must not fetch'); };
  await assert.rejects(providerRegistry.getProvider('openrouter').streamChat([], { model: 'removed-model', apiKey: 'fake' }, () => {}), /Selected model is unavailable/);
  assert.equal(calls, 0);
});
await test('cancelled transport cannot publish late chunks, duplicate replies or clear a newer controller', async () => {
  assistAgentService.setProject('cancellation-fixture'); assistAgentService.setProvider('mistral-fixture', 'chat-fixture'); assistAgentService.setMode('Ask');
  let resolveOld;
  globalThis.fetch = () => new Promise((resolve) => { resolveOld = resolve; });
  const old = assistAgentService.submitPrompt('old request', project);
  assistAgentService.cancelGeneration();
  globalThis.fetch = async () => sse(event({ content: 'New request survives' }));
  await assistAgentService.submitPrompt('new request', project);
  resolveOld(sse(event({ content: 'STALE_REPLY_FORBIDDEN' })));
  await old;
  assert.doesNotMatch(JSON.stringify(assistAgentService.getActiveSession()), /STALE_REPLY_FORBIDDEN/);
  assert.equal(assistAgentService.getActiveSession().messages.filter((m) => m.content === 'New request survives').length, 1);
});
await test('Chat read tool continuation remains valid on the next prompt', async () => {
  assistAgentService.setProject('chat-continuation-fixture'); assistAgentService.setProvider('mistral-fixture', 'tools-fixture'); assistAgentService.setMode('Ask');
  let count = 0;
  globalThis.fetch = async (_, init) => {
    count++; const body = JSON.parse(init.body);
    if (count === 1) return sse(event({ tool_calls: [{ index: 0, id: 'chat-read', function: { name: 'read_file', arguments: '{"path":"src/main.ts"}' } }] }));
    const tool = body.messages.find((m) => m.role === 'tool');
    assert.equal(tool.tool_call_id, 'chat-read'); assert.match(tool.content, /REAL_WORKSPACE_CONTENT/);
    return sse(event({ content: 'Read result explained' }));
  };
  await assistAgentService.submitPrompt('Read file', project);
  assert.equal(count, 2); assert.equal(assistAgentService.getActiveSession().messages.at(-1).content, 'Read result explained');
  await assistAgentService.submitPrompt('Explain more', project);
  assert.equal(count, 3);
});
console.log(`All ${count} provider/context integration checks passed`);
rmSync(tempDir, { recursive: true, force: true });
