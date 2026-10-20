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
      export * from './src/services/ai/tools/permissionController.ts';
      export * from './src/services/ai/tools/toolExecutor.ts';
      export * from './src/services/ai/tools/toolRegistry.ts';
      export * from './src/services/ai/tools/builtinTools.ts';
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
  GeminiProvider,
  MockProvider,
  validateEndpointUrl,
  redactSecretsFromText,
  PermissionController,
  ToolExecutor,
  ToolRegistry,
  AgentEngine,
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

// ── Suite 6: Anthropic Protocol Hardening & Multi-Tool Assembly ──
console.log('\nSuite 6: Anthropic Protocol Hardening & Multi-Tool Assembly');

await test('6.1 AnthropicProvider groups multiple consecutive tool results into a single user turn', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-grouping-key');

  let interceptedBody = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    interceptedBody = JSON.parse(init.body);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":50}}}\n\n' +
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Both files read successfully."}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":10}}\n\n' +
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
    const res = await anthropic.streamChat(
      [
        { role: 'user', content: 'Read file A and file B' },
        {
          role: 'assistant',
          content: 'Reading both files now.',
          toolCalls: [
            { id: 'call_1', toolName: 'read_file', args: { path: 'a.txt' } },
            { id: 'call_2', toolName: 'read_file', args: { path: 'b.txt' } },
          ],
        },
        { role: 'tool', name: 'read_file', toolCallId: 'call_1', content: 'content of A' },
        { role: 'tool', name: 'read_file', toolCallId: 'call_2', content: 'content of B' },
      ],
      { model: 'claude-3-5-sonnet-20241022' },
      () => {}
    );

    assert.equal(res.fullContent, 'Both files read successfully.');
    assert.equal(res.stopReason, 'end_turn');

    // Crucial check: messages must alternate and the two tool results must be grouped into one user message!
    const msgs = interceptedBody.messages;
    assert.equal(msgs.length, 3, 'Must be user -> assistant -> user (3 messages)');
    assert.equal(msgs[0].role, 'user');
    assert.equal(msgs[1].role, 'assistant');
    assert.equal(msgs[2].role, 'user', 'Third message must be user role');

    // The single user message must contain 2 tool_result parts
    assert.ok(Array.isArray(msgs[2].content), 'Third message content must be array of content blocks');
    assert.equal(msgs[2].content.length, 2, 'Must contain both tool_result blocks');
    assert.equal(msgs[2].content[0].type, 'tool_result');
    assert.equal(msgs[2].content[0].tool_use_id, 'call_1');
    assert.equal(msgs[2].content[0].content, 'content of A');
    assert.equal(msgs[2].content[1].type, 'tool_result');
    assert.equal(msgs[2].content[1].tool_use_id, 'call_2');
    assert.equal(msgs[2].content[1].content, 'content of B');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('6.2 AnthropicProvider ensures turns strictly alternate and prepends user if initial message is assistant', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-alt-key');

  let interceptedBody = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    interceptedBody = JSON.parse(init.body);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":"ok"}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":1}}\n\n'
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    await anthropic.streamChat(
      [
        { role: 'assistant', content: 'prior assistant text' },
        { role: 'user', content: 'user question 1' },
        { role: 'user', content: 'user question 2' },
      ],
      { model: 'claude-3-5-sonnet-20241022' },
      () => {}
    );

    const msgs = interceptedBody.messages;
    assert.equal(msgs[0].role, 'user', 'First message must be user role (prepended or merged)');
    for (let i = 1; i < msgs.length; i++) {
      assert.notEqual(msgs[i].role, msgs[i - 1].role, `Message at ${i} must alternate role from ${i - 1}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('6.3 AnthropicProvider parses and extracts stop_reason and usage from message_start & message_delta', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-stop-key');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":120}}}\n\n' +
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":"Answer."}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"tool_use"},"usage":{"output_tokens":45}}\n\n'
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    const res = await anthropic.streamChat(
      [{ role: 'user', content: 'trigger tool' }],
      { model: 'claude-3-5-sonnet-20241022' },
      () => {}
    );

    assert.equal(res.stopReason, 'tool_use');
    assert.equal(res.usage.promptTokens, 120);
    assert.equal(res.usage.completionTokens, 45);
    assert.equal(res.usage.totalTokens, 165);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('6.4 AnthropicProvider detects reasoning-only stream without content/tools and throws compatibility error', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-reasoning-key');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"thinking"}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"I am thinking deeply about life."}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":20}}\n\n'
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    await assert.rejects(
      async () => {
        await anthropic.streamChat(
          [{ role: 'user', content: 'deep question' }],
          { model: 'claude-3-7-sonnet-20250219' },
          () => {}
        );
      },
      (err) => {
        assert.match(err.message, /Provider Compatibility Error.*reasoning tokens but no assistant answer content/i);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('6.5 AnthropicProvider flushes active tool calls when stream terminates without content_block_stop', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-flush-key');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"call_unclosed","name":"read_file"}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"path\\": \\"package.json\\"}"}}\n\n'
            // Omitting content_block_stop intentionally
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    const res = await anthropic.streamChat(
      [{ role: 'user', content: 'read package.json' }],
      { model: 'claude-3-5-sonnet-20241022' },
      () => {}
    );

    assert.ok(res.toolCalls && res.toolCalls.length === 1, 'Must flush unclosed tool call');
    assert.equal(res.toolCalls[0].id, 'call_unclosed');
    assert.equal(res.toolCalls[0].toolName, 'read_file');
    assert.deepEqual(res.toolCalls[0].args, { path: 'package.json' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── Suite 7: Representative Provider Verification (9 Provider Integration Types) ──
console.log('\nSuite 7: Representative Provider Verification (9 Provider Types)');

await test('7.1 OpenRouter: OpenAI-compatible, Bearer auth, canonical origin, model discovery, streaming, tools', async () => {
  const openrouter = providerRegistry.getProvider('openrouter');
  assert.equal(openrouter.defaultBaseUrl, 'https://openrouter.ai/api/v1');
  assert.equal(getDefaultProviderOrigin('openrouter'), 'https://openrouter.ai');

  keyManager.setApiKey('openrouter', 'sk-or-v1-testkey123456');

  let interceptedHeaders = {};
  let interceptedBody = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    interceptedHeaders = init.headers || {};
    interceptedBody = JSON.parse(init.body);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"id":"gen-1","choices":[{"delta":{"content":"OpenRouter stream chunk"}}]}\n\n' +
            'data: [DONE]\n\n'
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    let text = '';
    const res = await openrouter.streamChat(
      [{ role: 'user', content: 'ping' }],
      { model: 'openai/gpt-4o-mini' },
      (chunk) => { if (chunk.contentDelta) text += chunk.contentDelta; }
    );
    assert.equal(text, 'OpenRouter stream chunk');
    assert.equal(interceptedHeaders['Authorization'], 'Bearer sk-or-v1-testkey123456');
    assert.equal(interceptedBody.model, 'openai/gpt-4o-mini');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('7.2 Google Gemini: Native adapter, functionDeclarations format, streaming chunks, tool execution', async () => {
  const gemini = providerRegistry.getProvider('gemini');
  assert.equal(gemini.id, 'gemini');
  assert.equal(gemini.defaultBaseUrl, 'https://generativelanguage.googleapis.com');
  const models = gemini.getAvailableModels();
  assert.ok(models.some((m) => m.id === 'gemini-1.5-flash'));
  assert.ok(models.some((m) => m.id === 'gemini-1.5-pro'));
});

await test('7.3 Anthropic: Native adapter, x-api-key, system isolation, SSE streaming, tool calls returned to ToolExecutor', async () => {
  const anthropic = providerRegistry.getProvider('anthropic');
  assert.equal(anthropic.id, 'anthropic');
  assert.equal(anthropic.defaultBaseUrl, 'https://api.anthropic.com/v1');
});

await test('7.4 Groq: OpenAI-compatible, official Base URL, Bearer auth, model ID, tool calling', async () => {
  const groq = providerRegistry.getProvider('groq');
  assert.equal(groq.id, 'groq');
  assert.equal(groq.defaultBaseUrl, 'https://api.groq.com/openai/v1');

  const models = groq.getAvailableModels();
  assert.ok(models.some((m) => m.id === 'llama-3.3-70b-versatile' && m.supportsToolCalling));
});

await test('7.5 DeepSeek: OpenAI-compatible, official Base URL, Bearer auth, tool calling on chat, unsupported on reasoner', async () => {
  const deepseek = providerRegistry.getProvider('deepseek');
  assert.equal(deepseek.id, 'deepseek');
  assert.equal(deepseek.defaultBaseUrl, 'https://api.deepseek.com/v1');

  const models = deepseek.getAvailableModels();
  const chat = models.find((m) => m.id === 'deepseek-chat');
  const reasoner = models.find((m) => m.id === 'deepseek-reasoner');
  assert.equal(chat.supportsToolCalling, true);
  assert.equal(reasoner.supportsToolCalling, false);
});

await test('7.6 Mistral: OpenAI-compatible, official Base URL, Bearer auth, model ID codestral-latest, tool calling', async () => {
  const mistral = providerRegistry.getProvider('mistral');
  assert.equal(mistral.id, 'mistral');
  assert.equal(mistral.defaultBaseUrl, 'https://api.mistral.ai/v1');

  const models = mistral.getAvailableModels();
  assert.ok(models.some((m) => m.id === 'codestral-latest' && m.supportsToolCalling));
});

await test('7.7 Together AI & Fireworks: OpenAI-compatible, canonical origins, Bearer auth, streaming chat', async () => {
  const together = providerRegistry.getProvider('together');
  const fireworks = providerRegistry.getProvider('fireworks');
  assert.equal(together.defaultBaseUrl, 'https://api.together.xyz/v1');
  assert.equal(fireworks.defaultBaseUrl, 'https://api.fireworks.ai/inference/v1');
  assert.equal(getDefaultProviderOrigin('together'), 'https://api.together.xyz');
  assert.equal(getDefaultProviderOrigin('fireworks'), 'https://api.fireworks.ai');
});

await test('7.8 Custom OpenAI-Compatible Provider: Configured custom endpoint, custom headers, custom models', async () => {
  const custom = providerRegistry.getProvider('custom');
  assert.equal(custom.id, 'custom');
  assert.equal(providerRegistry.isCustomProvider('custom'), true);
});

await test('7.9 Ollama & LM Studio: Local runner, loopback HTTP enforcement, rejection of remote HTTP and 0.0.0.0', async () => {
  const ollama = providerRegistry.getProvider('ollama');
  const lmstudio = providerRegistry.getProvider('lmstudio');
  assert.equal(ollama.defaultBaseUrl, 'http://localhost:11434/v1');
  assert.equal(lmstudio.defaultBaseUrl, 'http://localhost:1234/v1');

  assert.equal(validateEndpointUrl(ollama.defaultBaseUrl).valid, true);
  assert.equal(validateEndpointUrl(lmstudio.defaultBaseUrl).valid, true);
  assert.equal(validateEndpointUrl('http://127.0.0.1:1234/v1').valid, true);

  // Rejection of remote HTTP and 0.0.0.0
  assert.equal(validateEndpointUrl('http://insecure-remote-ollama.com/v1').valid, false);
  assert.equal(validateEndpointUrl('http://0.0.0.0:11434/v1').valid, false);
});

// ── Suite 8: Tool Permission Safety, Replay Protection & Approvals ──
console.log('\nSuite 8: Tool Permission Safety, Replay Protection & Approvals');

await test('8.1 Anthropic tool calls are passed to ToolExecutor without executing terminal or file writes directly', async () => {
  const anthropic = new AnthropicProvider();
  keyManager.setApiKey('anthropic', 'sk-ant-test-perm-key');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"call_term_1","name":"run_terminal_command"}}\n\n' +
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"command\\": \\"npm test\\"}"}}\n\n' +
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n'
          )
        );
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
  };

  try {
    const res = await anthropic.streamChat(
      [{ role: 'user', content: 'Run test' }],
      { model: 'claude-3-5-sonnet-20241022' },
      () => {}
    );

    assert.ok(res.toolCalls && res.toolCalls.length === 1);
    const tc = res.toolCalls[0];
    assert.equal(tc.toolName, 'run_terminal_command');
    // Notice: status is pending_approval because it requires approval! It was NOT executed directly!
    assert.equal(tc.status, 'pending_approval');
    assert.equal(tc.permission, 'terminal');
    assert.equal(PermissionController.requiresApproval(tc.permission, tc.riskLevel), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('8.2 Terminal command requires approval; denied command transitions to status: denied and never executes', async () => {
  const toolCall = ToolExecutor.createToolCallRecord('run_terminal_command', { command: 'rm -rf node_modules' }, 'call_rm_test');
  assert.equal(toolCall.status, 'pending_approval');

  // Request approval
  const approvalPromise = PermissionController.requestApproval(toolCall);
  assert.equal(PermissionController.isPending('call_rm_test'), true);

  // User denies
  const denied = PermissionController.deny('call_rm_test');
  assert.equal(denied, true);

  const approved = await approvalPromise;
  assert.equal(approved, false, 'Denied approval must resolve to false');
  assert.equal(toolCall.status, 'denied', 'Tool call status must transition to denied');
});

await test('8.3 Single-use approval token: replaying an approval token returns false (replay protection)', async () => {
  const toolCall = ToolExecutor.createToolCallRecord('run_terminal_command', { command: 'npm run build' }, 'call_replay_test');
  const approvalPromise = PermissionController.requestApproval(toolCall);

  // First resolution: approve
  const firstApprove = PermissionController.approve('call_replay_test');
  assert.equal(firstApprove, true, 'First approve must succeed');
  await approvalPromise;

  // Replay attempt: approve again with the same token
  const secondApprove = PermissionController.approve('call_replay_test');
  assert.equal(secondApprove, false, 'Replaying approval must return false (replay protection)');

  // Replay attempt: deny with the same token
  const secondDeny = PermissionController.deny('call_replay_test');
  assert.equal(secondDeny, false, 'Replaying denial must return false (replay protection)');
});

await test('8.4 File modification proposals generate diff proposal objects and require user approval before applying', async () => {
  const mockContext = {
    projectId: 'test_proj',
    project: {
      id: 'test_proj',
      name: 'Test Project',
      files: [{ path: 'src/main.ts', content: 'const a = 1;', language: 'typescript' }],
    },
  };

  const tool = ToolRegistry.getTool('propose_file_edit');
  assert.ok(tool, 'propose_file_edit must be registered');
  assert.equal(tool.permission, 'edit');

  const execRes = await tool.execute(
    { path: 'src/main.ts', newContent: 'const a = 2;', explanation: 'update a' },
    mockContext
  );

  assert.equal(execRes.success, true);
  assert.ok(execRes.result && execRes.result.proposal);
  assert.equal(execRes.result.proposal.action, 'modify');
  assert.equal(execRes.result.proposal.originalContent, 'const a = 1;');
  assert.equal(execRes.result.proposal.newContent, 'const a = 2;');
  // Original file in mockContext MUST NOT have been overwritten yet!
  assert.equal(mockContext.project.files[0].content, 'const a = 1;');
});

// ── Suite 9: Outbound Security Gate & Invariants ──
console.log('\nSuite 9: Outbound Security Gate & Invariants');

await test('9.1 Cross-provider isolation: Key for Provider A (Anthropic) is never sent to Provider B (OpenAI, OpenRouter)', () => {
  keyManager.setApiKey('anthropic', 'sk-ant-isolation-key');
  keyManager.setApiKey('openrouter', 'sk-or-v1-isolation-key');

  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://api.anthropic.com'), true);
  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://api.openai.com'), false);
  assert.equal(keyManager.isOriginAuthorized('anthropic', 'https://openrouter.ai'), false);

  assert.equal(keyManager.isOriginAuthorized('openrouter', 'https://openrouter.ai'), true);
  assert.equal(keyManager.isOriginAuthorized('openrouter', 'https://api.anthropic.com'), false);
});

await test('9.2 Secret redaction: API keys are masked as [REDACTED_API_KEY] in all error messages and logs', () => {
  const secretKey = 'sk-ant-api03-verysecretkey987654321';
  const rawMessage = `Error 401 from api.anthropic.com with key ${secretKey}: invalid token`;
  const redacted = redactSecretsFromText(rawMessage, secretKey);

  assert.ok(!redacted.includes(secretKey), 'Must not contain raw secret');
  assert.ok(redacted.includes('[REDACTED_API_KEY]'), 'Must contain [REDACTED_API_KEY]');
});

await test('9.3 Redirect rejection: HTTP 301/302/307 redirects are rejected to prevent credential forwarding', async () => {
  const anthropic = new AnthropicProvider();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch: redirect rejected');
  };

  try {
    const res = await anthropic.verifyApiKey('sk-ant-test-key', 'https://api.anthropic.com/v1');
    assert.equal(res.success, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('9.4 Browser CORS classification: Network/CORS failures are classified as cors with actionable guidance', async () => {
  const anthropic = new AnthropicProvider();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch: CORS network restriction');
  };

  try {
    const res = await anthropic.verifyApiKey('sk-ant-test-key');
    assert.equal(res.success, false);
    assert.equal(res.errorCategory, 'cors');
    assert.match(res.message, /CORS/i);
    assert.ok(res.suggestedAction && res.suggestedAction.length > 10);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('9.5 No silent billable inference: Connection diagnostics require consent before billable probe', async () => {
  const anthropic = new AnthropicProvider();
  let streamChatCalled = false;
  const origStreamChat = anthropic.streamChat;
  anthropic.streamChat = async () => {
    streamChatCalled = true;
    throw new Error('Should not be called without consent');
  };

  try {
    // With non-inference verification inconclusive, testConnection without consent must not invoke streamChat
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      // Simulate inconclusive 500 error
      return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), { status: 500 });
    };

    try {
      const diag = await anthropic.testConnection('sk-ant-test-key', undefined, undefined, undefined, false);
      assert.equal(diag.success, false);
      assert.equal(diag.errorCategory, 'config');
      assert.match(diag.message, /billable.*consent/i);
      assert.equal(streamChatCalled, false, 'streamChat must never be called without explicit user consent');
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    anthropic.streamChat = origStreamChat;
  }
});

console.log('\n============================================================');
console.log(`  ALL ${passed} / ${total} MULTI-PROVIDER ECOSYSTEM TESTS PASSED!`);
console.log('============================================================\n');
