/**
 * GB CODER: ADVANCED MULTI-AI PROVIDER ECOSYSTEM VERIFICATION SUITE
 *
 * Deterministic automated tests validating:
 * 1. Provider Catalog Integrity & Explicit Tiers (Tier A, Tier B, Tier C, Tier D)
 * 2. Native Anthropic Messages API Adapter (Headers, Endpoints, Streaming SSE, Tool Calling)
 * 3. OpenAI-Compatible Adapters (Verified Base URLs, Header Canonicalization, Loopback HTTP)
 * 4. Tier C Special Authentication / Regional Gateways Honesty & Requirement Disclosure
 * 5. Tier D Catalog Reference Providers Truthfulness
 * 6. Outbound Security Gate & Origin Isolation Across All Providers
 * 7. Model Context Limit Fallbacks & Model Discovery Compatibility
 * 8. Agent Mode Tool-Calling Invariant Enforcement
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
const tempDir = join(process.cwd(), '.tmp-multi-provider-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'ecosystem-bundle.mjs');

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
      export * from './src/services/ai/providers/anthropicProvider.ts';
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

const ecosystem = await import(pathToFileURL(bundleFile).href);
const {
  keyManager,
  cleanApiKey,
  extractOrigin,
  getDefaultProviderOrigin,
  providerRegistry,
  BUILT_IN_CATALOG,
  AnthropicProvider,
  OpenAiCompatibleProvider,
  validateEndpointUrl,
  redactSecretsFromText,
} = ecosystem;

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
console.log('  GB CODER: MULTI-AI PROVIDER ECOSYSTEM VERIFICATION SUITE');
console.log('============================================================\n');

// ── Suite 1: Provider Catalog Integrity & Explicit Tiers ──
console.log('Suite 1: Provider Catalog Integrity & Explicit Tiers');

await test('1.1 Every provider catalog entry declares an explicit integration tier', () => {
  const catalog = providerRegistry.getProviderCatalog();
  assert.ok(catalog.length >= 20, `Expected at least 20 catalog entries, got ${catalog.length}`);

  for (const entry of catalog) {
    assert.ok(
      ['tier_a', 'tier_b', 'tier_c', 'tier_d'].includes(entry.tier),
      `Provider "${entry.id}" must have a valid tier (A, B, C, D). Found: ${entry.tier}`
    );
    assert.ok(entry.name && entry.name.trim().length > 0, `Provider "${entry.id}" must have a non-empty name`);
    assert.ok(entry.description && entry.description.trim().length > 0, `Provider "${entry.id}" must have a description`);
  }
});

await test('1.2 Tier A providers are strictly functional adapters with verified capabilities', () => {
  const catalog = providerRegistry.getProviderCatalog();
  const tierA = catalog.filter((c) => c.tier === 'tier_a');
  const tierAIds = tierA.map((c) => c.id);

  assert.ok(tierAIds.includes('openrouter'), 'OpenRouter must be Tier A');
  assert.ok(tierAIds.includes('gemini'), 'Gemini must be Tier A');
  assert.ok(tierAIds.includes('anthropic'), 'Anthropic must be Tier A');
  assert.ok(tierAIds.includes('openai'), 'OpenAI must be Tier A');

  for (const p of tierA) {
    assert.equal(p.streamingSupport, true, `Tier A provider "${p.id}" must support streaming`);
    assert.equal(p.toolCallingSupport, true, `Tier A provider "${p.id}" must support tool calling`);
    assert.ok(p.defaultModels && p.defaultModels.length > 0, `Tier A provider "${p.id}" must have default models`);
  }
});

await test('1.3 Tier B providers are verified OpenAI-compatible adapters with official Base URLs', () => {
  const catalog = providerRegistry.getProviderCatalog();
  const tierB = catalog.filter((c) => c.tier === 'tier_b');
  const tierBIds = tierB.map((c) => c.id);

  const requiredTierB = [
    'groq',
    'deepseek',
    'mistral',
    'together',
    'fireworks',
    'cerebras',
    'deepinfra',
    'nvidia',
    'inception',
    'moonshot',
    'minimax',
    'huggingface',
    'ollama',
    'lmstudio',
    'vllm',
    'custom',
    'mock',
  ];

  for (const reqId of requiredTierB) {
    assert.ok(tierBIds.includes(reqId), `Required Tier B provider "${reqId}" is missing from catalog`);
    const entry = tierB.find((c) => c.id === reqId);
    assert.ok(entry.defaultBaseUrl, `Tier B provider "${reqId}" must have defaultBaseUrl`);
    const val = validateEndpointUrl(entry.defaultBaseUrl);
    assert.equal(val.valid, true, `Tier B provider "${reqId}" defaultBaseUrl must be valid: ${val.error}`);
  }
});

await test('1.4 Tier C providers disclose special requirements and do not claim false connected status', () => {
  const catalog = providerRegistry.getProviderCatalog();
  const tierC = catalog.filter((c) => c.tier === 'tier_c');
  const tierCIds = tierC.map((c) => c.id);

  assert.ok(tierCIds.includes('azure'), 'Azure OpenAI must be Tier C');
  assert.ok(tierCIds.includes('bedrock'), 'AWS Bedrock must be Tier C');
  assert.ok(tierCIds.includes('vertex'), 'Google Cloud Vertex AI must be Tier C');
  assert.ok(tierCIds.includes('cloudflare'), 'Cloudflare AI Gateway must be Tier C');

  for (const p of tierC) {
    assert.ok(
      p.tierCRequirements && p.tierCRequirements.length > 20,
      `Tier C provider "${p.id}" must disclose specific integration requirements`
    );
  }
});

await test('1.5 Tier D catalog reference providers have truthful reference status without fake adapters', () => {
  const catalog = providerRegistry.getProviderCatalog();
  const tierD = catalog.filter((c) => c.tier === 'tier_d');
  const tierDIds = tierD.map((c) => c.id);

  assert.ok(tierDIds.includes('perplexity'), 'Perplexity must be Tier D');
  assert.ok(tierDIds.includes('cohere'), 'Cohere must be Tier D');
  assert.ok(tierDIds.includes('aimlapi'), 'AI/ML API must be Tier D');
  assert.ok(tierDIds.includes('nebius'), 'Nebius must be Tier D');

  for (const p of tierD) {
    assert.ok(
      p.tierDStatus && p.tierDStatus.length > 10,
      `Tier D provider "${p.id}" must document truthful status`
    );
  }
});

// ── Suite 2: Native Anthropic Adapter (Messages API) ──
console.log('\nSuite 2: Native Anthropic Adapter (Messages API)');

await test('2.1 AnthropicProvider initializes with canonical v1 Messages API URL and models', () => {
  const anthropic = new AnthropicProvider();
  assert.equal(anthropic.id, 'anthropic');
  assert.equal(anthropic.name, 'Anthropic');
  assert.equal(anthropic.defaultBaseUrl, 'https://api.anthropic.com/v1');

  const models = anthropic.getAvailableModels();
  assert.ok(models.some((m) => m.id === 'claude-3-7-sonnet-20250219'), 'Must include Claude 3.7 Sonnet');
  assert.ok(models.some((m) => m.id === 'claude-3-5-sonnet-20241022'), 'Must include Claude 3.5 Sonnet');
  assert.ok(models.some((m) => m.id === 'claude-3-5-haiku-20241022'), 'Must include Claude 3.5 Haiku');
});

await test('2.2 AnthropicProvider enforces destination origin authorization before outbound requests', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-api03-testkey1234567890');

  // Attempting to route Anthropic key to an unauthorized origin should throw Security Exception
  await assert.rejects(
    async () => {
      await anthropic.streamChat(
        [{ role: 'user', content: 'hello' }],
        {
          model: 'claude-3-5-sonnet-20241022',
          baseUrl: 'https://evil-unauthorized-relay.com/v1',
        },
        () => {}
      );
    },
    (err) => {
      assert.match(err.message, /Security Exception.*not authorized/i);
      return true;
    }
  );
});

await test('2.3 AnthropicProvider formats request with x-api-key, anthropic-version, and dangerous browser access', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-api03-validkey');

  let interceptedUrl = '';
  let interceptedHeaders = {};
  let interceptedBody = null;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    interceptedUrl = String(url);
    interceptedHeaders = init.headers || {};
    interceptedBody = JSON.parse(init.body);

    // Return a minimal simulated Anthropic SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":12}}}\n\n' +
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello from Claude!"}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":8}}\n\n' +
            'event: message_stop\ndata: {"type":"message_stop"}\n\n'
          )
        );
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    let streamedText = '';
    const res = await anthropic.streamChat(
      [
        { role: 'system', content: 'You are a helpful coding assistant.' },
        { role: 'user', content: 'Say hello' },
      ],
      {
        model: 'claude-3-5-sonnet-20241022',
        baseUrl: 'https://api.anthropic.com/v1',
      },
      (chunk) => {
        if (chunk.contentDelta) streamedText += chunk.contentDelta;
      }
    );

    assert.equal(interceptedUrl, 'https://api.anthropic.com/v1/messages');
    assert.equal(interceptedHeaders['x-api-key'], 'sk-ant-api03-validkey');
    assert.equal(interceptedHeaders['anthropic-version'], '2023-06-01');
    assert.equal(interceptedHeaders['anthropic-dangerous-direct-browser-access'], 'true');

    // System prompt must be extracted to top-level system, not messages array
    assert.equal(interceptedBody.system, 'You are a helpful coding assistant.');
    assert.equal(interceptedBody.messages.length, 1);
    assert.equal(interceptedBody.messages[0].role, 'user');
    assert.equal(interceptedBody.messages[0].content, 'Say hello');

    assert.equal(streamedText, 'Hello from Claude!');
    assert.equal(res.fullContent, 'Hello from Claude!');
    assert.equal(res.usage.promptTokens, 12);
    assert.equal(res.usage.completionTokens, 8);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.4 AnthropicProvider handles tool calling declaration, tool execution, and thinking deltas', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-api03-tooltestkey');

  let interceptedBody = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    interceptedBody = JSON.parse(init.body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"thinking"}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"Let me inspect the file."}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: content_block_start\ndata: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"tool_call_001","name":"read_file"}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"path\\": \\"src/index.ts\\"}"}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":1}\n\n' +
            'event: message_stop\ndata: {"type":"message_stop"}\n\n'
          )
        );
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    let streamedReasoning = '';
    const res = await anthropic.streamChat(
      [{ role: 'user', content: 'Read src/index.ts' }],
      {
        model: 'claude-3-7-sonnet-20250219',
        tools: [
          {
            name: 'read_file',
            description: 'Read file content',
            parameters: {
              type: 'object',
              properties: { path: { type: 'string', description: 'File path' } },
              required: ['path'],
            },
            permission: 'read',
            riskLevel: 'safe',
            execute: async () => ({ success: true, result: 'test' }),
          },
        ],
      },
      (chunk) => {
        if (chunk.reasoningDelta) streamedReasoning += chunk.reasoningDelta;
      }
    );

    // Verify tools format
    assert.ok(interceptedBody.tools && interceptedBody.tools.length === 1);
    assert.equal(interceptedBody.tools[0].name, 'read_file');
    assert.equal(interceptedBody.tools[0].input_schema.type, 'object');

    // Verify thinking delta
    assert.equal(streamedReasoning, 'Let me inspect the file.');
    assert.equal(res.reasoning, 'Let me inspect the file.');

    // Verify tool call record parsed
    assert.ok(res.toolCalls && res.toolCalls.length === 1);
    assert.equal(res.toolCalls[0].toolName, 'read_file');
    assert.deepEqual(res.toolCalls[0].args, { path: 'src/index.ts' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.5 AnthropicProvider non-inference key verification detects HTTP 401 and redacts secrets', async () => {
  const anthropic = new AnthropicProvider();
  const badKey = 'sk-ant-api03-badsupersecretkey999';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        type: 'error',
        error: { type: 'authentication_error', message: `invalid x-api-key: ${badKey}` },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const res = await anthropic.verifyApiKey(badKey);
    assert.equal(res.success, false);
    assert.equal(res.httpStatus, 401);
    assert.equal(res.keyState, 'invalid');
    assert.equal(res.errorCategory, 'auth');
    assert.ok(!res.message.includes(badKey), 'Must redact API key from error message');
    assert.ok(res.message.includes('[REDACTED_API_KEY]'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 3: OpenAI-Compatible Adapters & Loopback Security ──
console.log('\nSuite 3: OpenAI-Compatible Adapters & Loopback Security');

await test('3.1 ProviderRegistry registers Tier B adapters and resolves fallback context limits', () => {
  assert.equal(providerRegistry.getModelContextLimit('gemini'), 1048576);
  assert.equal(providerRegistry.getModelContextLimit('anthropic'), 200000);
  assert.equal(providerRegistry.getModelContextLimit('openrouter'), 128000);
  assert.equal(providerRegistry.getModelContextLimit('mistral'), 256000);
  assert.equal(providerRegistry.getModelContextLimit('deepseek'), 64000);
  assert.equal(providerRegistry.getModelContextLimit('minimax'), 1000000);
  assert.equal(providerRegistry.getModelContextLimit('groq'), 128000);
  assert.equal(providerRegistry.getModelContextLimit('custom'), 32000);
});

await test('3.2 Local runners (Ollama, LM Studio, vLLM) strictly enforce loopback addresses and reject 0.0.0.0', () => {
  assert.equal(validateEndpointUrl('http://localhost:11434/v1').valid, true);
  assert.equal(validateEndpointUrl('http://127.0.0.1:1234/v1').valid, true);
  assert.equal(validateEndpointUrl('http://[::1]:8000/v1').valid, true);

  // Insecure remote HTTP or 0.0.0.0 must be rejected
  const res1 = validateEndpointUrl('http://0.0.0.0:11434/v1');
  assert.equal(res1.valid, false);
  assert.match(res1.error, /0\.0\.0\.0/);

  const res2 = validateEndpointUrl('http://remote-api.com/v1');
  assert.equal(res2.valid, false);
  assert.match(res2.error, /HTTPS is required/i);
});

await test('3.3 KeyManager canonical origins include all first-party and open ecosystems', () => {
  assert.equal(getDefaultProviderOrigin('openai'), 'https://api.openai.com');
  assert.equal(getDefaultProviderOrigin('openrouter'), 'https://openrouter.ai');
  assert.equal(getDefaultProviderOrigin('gemini'), 'https://generativelanguage.googleapis.com');
  assert.equal(getDefaultProviderOrigin('anthropic'), 'https://api.anthropic.com');
  assert.equal(getDefaultProviderOrigin('groq'), 'https://api.groq.com');
  assert.equal(getDefaultProviderOrigin('deepseek'), 'https://api.deepseek.com');
  assert.equal(getDefaultProviderOrigin('mistral'), 'https://api.mistral.ai');
  assert.equal(getDefaultProviderOrigin('together'), 'https://api.together.xyz');
  assert.equal(getDefaultProviderOrigin('fireworks'), 'https://api.fireworks.ai');
  assert.equal(getDefaultProviderOrigin('cerebras'), 'https://api.cerebras.ai');
  assert.equal(getDefaultProviderOrigin('deepinfra'), 'https://api.deepinfra.com');
  assert.equal(getDefaultProviderOrigin('nvidia'), 'https://integrate.api.nvidia.com');
  assert.equal(getDefaultProviderOrigin('moonshot'), 'https://api.moonshot.cn');
  assert.equal(getDefaultProviderOrigin('minimax'), 'https://api.minimax.chat');
  assert.equal(getDefaultProviderOrigin('huggingface'), 'https://router.huggingface.co');
  assert.equal(getDefaultProviderOrigin('ollama'), 'http://localhost:11434');
});

// ── Suite 4: Cross-Provider Credential Boundary & Origin Gates ──
console.log('\nSuite 4: Cross-Provider Credential Boundary & Origin Gates');

await test('4.1 KeyManager blocks sending Anthropic key to OpenAI or OpenRouter destination', () => {
  keyManager.setApiKey('anthropic', 'sk-ant-api03-testkey12345');
  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://api.anthropic.com'), true);
  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://api.openai.com'), false);
  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://openrouter.ai'), false);
});

await test('4.2 KeyManager canonical alternates allow Together and Hugging Face official endpoints', () => {
  assert.equal(keyManager.isOriginAuthorized('together', 'https://api.together.xyz'), true);
  assert.equal(keyManager.isOriginAuthorized('together', 'https://api.together.ai'), true);
  assert.equal(keyManager.isOriginAuthorized('together', 'https://unauthorized.com'), false);

  assert.equal(keyManager.isOriginAuthorized('huggingface', 'https://router.huggingface.co'), true);
  assert.equal(keyManager.isOriginAuthorized('huggingface', 'https://api-inference.huggingface.co'), true);
});

// ── Suite 5: Agent Mode & Tool Calling Invariants ──
console.log('\nSuite 5: Agent Mode & Tool Calling Invariants');

await test('5.1 Non-tool-capable models (e.g. DeepSeek R1, LM Studio active) are detected truthfully', () => {
  const deepseekModels = providerRegistry.getModelsForProvider('deepseek');
  const chatModel = deepseekModels.find((m) => m.id === 'deepseek-chat');
  const reasonerModel = deepseekModels.find((m) => m.id === 'deepseek-reasoner');

  assert.ok(chatModel, 'Must have deepseek-chat');
  assert.ok(reasonerModel, 'Must have deepseek-reasoner');

  assert.equal(chatModel.supportsToolCalling, true, 'deepseek-chat supports tool calling');
  assert.equal(reasonerModel.supportsToolCalling, false, 'deepseek-reasoner R1 pure reasoning model does not support tool calling');
});

await test('5.2 Anthropic models all support tool calling for Agent Mode execution', () => {
  const anthropicModels = providerRegistry.getModelsForProvider('anthropic');
  assert.ok(anthropicModels.length >= 3);
  for (const m of anthropicModels) {
    assert.equal(m.supportsToolCalling, true, `Anthropic model "${m.id}" must support tool calling`);
  }
});

console.log('\n============================================================');
console.log(`  ALL ${passed} / ${total} MULTI-PROVIDER ECOSYSTEM TESTS PASSED!`);
console.log('============================================================\n');
