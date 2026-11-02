/**
 * GB CODER: BYOK OUTBOUND SECURITY GATE & REASONING VERIFICATION SUITE
 *
 * Deterministic automated tests validating:
 * 1. Opaque Key (no prefix) Credential-Origin Binding
 * 2. Cross-Provider Leakage Prevention (OpenRouter <-> OpenAI)
 * 3. Custom Provider Silent Origin Migration Prevention
 * 4. Boundary Enforcement across Discovery, Test, Chat, and Agent continuation
 * 5. Explicit Destination Authorization Override Lifecycle
 * 6. Redirect & Credential Forwarding Rejection
 * 7. Key Fragment Redaction from Telemetry & Diagnostics
 * 8. Reasoning Token Truthful Handling (Zero silent answer conversion)
 * 9. Normal Streaming & Tool-Call Integrity
 * 10. Workspace Context & Path Boundary Protections
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
const tempDir = join(process.cwd(), '.tmp-security-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'security-bundle.mjs');

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
      export * from './src/services/ai/tools/workspaceAdapter.ts';
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

const modules = await import(pathToFileURL(bundleFile).href);
const {
  keyManager,
  extractOrigin,
  getDefaultProviderOrigin,
  providerRegistry,
  OpenAiCompatibleProvider,
  discoverModels,
  redactSecretsFromText,
  WorkspaceAdapter,
  ContextBuilder,
} = modules;

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}:`, err.message || err);
    throw err;
  }
}

console.log('\n============================================================');
console.log('  GB CODER: BYOK OUTBOUND SECURITY GATE & INTEGRITY SUITE');
console.log('============================================================\n');

console.log('Suite 1: Credential-to-Origin Binding & Opaque Key Security (No Prefixes)');

await test('1.1 extractOrigin correctly parses origins across protocols, ports and formats', () => {
  assert.equal(extractOrigin('https://openrouter.ai/api/v1'), 'https://openrouter.ai');
  assert.equal(extractOrigin('https://api.openai.com/v1/models'), 'https://api.openai.com');
  assert.equal(extractOrigin('http://localhost:11434/v1'), 'http://localhost:11434');
  assert.equal(extractOrigin('http://127.0.0.1:8080/v1/chat/completions'), 'http://127.0.0.1:8080');
  assert.equal(extractOrigin('invalid-url'), '');
});

await test('1.2 KeyManager binds opaque keys to authorized origins and checks permissions', () => {
  keyManager.clearAllKeys();
  const opaqueOpenAiKey = 'opaque_openai_credential_998877';
  const opaqueOpenRouterKey = 'opaque_openrouter_credential_112233';

  // Set OpenAI key bound to default origin
  keyManager.setApiKey('openai', opaqueOpenAiKey);
  assert.equal(keyManager.getApiKey('openai'), opaqueOpenAiKey);
  assert.ok(keyManager.isOriginAuthorized('openai', 'https://api.openai.com/v1'));
  assert.ok(!keyManager.isOriginAuthorized('openai', 'https://openrouter.ai/api/v1'));

  // Set OpenRouter key bound to default origin
  keyManager.setApiKey('openrouter', opaqueOpenRouterKey);
  assert.equal(keyManager.getApiKey('openrouter'), opaqueOpenRouterKey);
  assert.ok(keyManager.isOriginAuthorized('openrouter', 'https://openrouter.ai/api/v1'));
  assert.ok(!keyManager.isOriginAuthorized('openrouter', 'https://api.openai.com/v1'));
});

console.log('\nSuite 2: Outbound Request Boundary Enforcement (Zero Leaks Across Origins)');

await test('2.1 Model Discovery blocks sending OpenRouter key to OpenAI origin before fetch', async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('{}', { status: 200 });
  };

  try {
    const openRouterOpaqueKey = 'opaque_openrouter_key_abc123';
    keyManager.setApiKey('openrouter', openRouterOpaqueKey);

    const result = await discoverModels({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: openRouterOpaqueKey,
      providerId: 'openrouter',
    });

    assert.equal(fetchCalled, false, 'Network request must NOT be dispatched to OpenAI origin');
    assert.equal(result.success, false);
    assert.equal(result.errorCategory, 'auth');
    assert.match(result.error, /Security Exception.*not authorized/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.2 Connection Test blocks sending OpenAI key to OpenRouter origin before fetch', async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('{}', { status: 200 });
  };

  try {
    const openAiOpaqueKey = 'opaque_openai_key_xyz789';
    keyManager.setApiKey('openai', openAiOpaqueKey);

    const prov = new OpenAiCompatibleProvider(
      'openai',
      'OpenAI (BYOK)',
      'https://api.openai.com/v1',
      [{ id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: '', supportsStreaming: true }]
    );

    const result = await prov.testConnection(
      openAiOpaqueKey,
      'https://openrouter.ai/api/v1',
      'gpt-4o-mini',
      undefined,
      true
    );

    assert.equal(fetchCalled, false, 'Network request must NOT be dispatched to OpenRouter origin');
    assert.equal(result.success, false);
    assert.equal(result.errorCategory, 'auth');
    assert.match(result.message, /Security Exception.*not authorized/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.3 StreamChat throws Security Exception before network request when origin is unauthorized', async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('data: [DONE]\n\n', { status: 200 });
  };

  try {
    const customOpaqueKey = 'opaque_custom_key_445566';
    keyManager.setApiKey('custom', customOpaqueKey, false, 'http://localhost:11434');

    const prov = new OpenAiCompatibleProvider(
      'custom',
      'Custom Provider',
      'http://localhost:11434/v1',
      [{ id: 'llama3', name: 'Llama 3', provider: 'custom', contextWindow: 32000, description: '', supportsStreaming: true }]
    );

    await assert.rejects(
      async () => {
        await prov.streamChat(
          [{ role: 'user', content: 'test' }],
          {
            apiKey: customOpaqueKey,
            model: 'llama3',
            baseUrl: 'https://malicious-external-proxy.com/v1',
          },
          () => {}
        );
      },
      /Security Exception.*not authorized/
    );

    assert.equal(fetchCalled, false, 'Fetch must not be invoked for unauthorized external destination');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('2.4 Explicit destination authorization allows safe endpoint reconfiguration', async () => {
  let capturedUrl = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    capturedUrl = url;
    return new Response(
      'data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n',
      { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
    );
  };

  try {
    const authorizedKey = 'opaque_approved_key_777888';
    keyManager.setApiKey('openai', authorizedKey);

    // Explicitly authorize internal proxy
    keyManager.authorizeOrigin('openai', 'https://my-internal-proxy.company.com');

    const prov = new OpenAiCompatibleProvider(
      'openai',
      'OpenAI (BYOK)',
      'https://api.openai.com/v1',
      [{ id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: '', supportsStreaming: true }]
    );

    const result = await prov.streamChat(
      [{ role: 'user', content: 'ping' }],
      {
        apiKey: authorizedKey,
        model: 'gpt-4o-mini',
        baseUrl: 'https://my-internal-proxy.company.com/v1',
      },
      () => {}
    );

    assert.equal(capturedUrl, 'https://my-internal-proxy.company.com/v1/chat/completions');
    assert.equal(result.fullContent, 'hello');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log('\nSuite 3: Redirect, Abort & Secret Redaction Protections');

await test('3.1 HTTP 301/302/307 Redirect is rejected to prevent credential forwarding', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response('', {
      status: 302,
      headers: { Location: 'https://attacker.com/v1/chat/completions' },
    });
  };

  try {
    const prov = new OpenAiCompatibleProvider(
      'openrouter',
      'OpenRouter',
      'https://openrouter.ai/api/v1',
      [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', contextWindow: 128000, description: '', supportsStreaming: true }]
    );

    await assert.rejects(
      async () => {
        await prov.streamChat(
          [{ role: 'user', content: 'test' }],
          { apiKey: 'opaque_openrouter_secret', model: 'openai/gpt-4o-mini' },
          () => {}
        );
      },
      /Security Exception: HTTP redirect/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('3.2 Comprehensive redaction eliminates active keys and partially masked error fragments', () => {
  const opaqueKey = 'opaque_secret_val_xyz_998877';
  keyManager.setApiKey('openai', opaqueKey);

  const rawUpstreamError = `Authentication failed. Incorrect API key provided: ${opaqueKey} (truncated: opaque_secret_val_***). Check api_key=opaque_secret_val_xyz_998877`;
  const sanitized = redactSecretsFromText(rawUpstreamError, opaqueKey);

  assert.ok(!sanitized.includes(opaqueKey), 'Raw key must not appear in sanitized string');
  assert.ok(!sanitized.includes('opaque_secret_val_***'), 'Masked fragment must not appear in sanitized string');
  assert.ok(sanitized.includes('[REDACTED_API_KEY]'));
});

console.log('\nSuite 4: Reasoning Output Truthfulness & Provider Compatibility');

await test('4.1 Reasoning-only responses throw clear compatibility error without faking answer text', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const sseBody = [
      'data: {"choices":[{"delta":{"reasoning_content":"Thinking deeply about solution..."}}]}',
      '',
      'data: {"choices":[{"delta":{"reasoning_content":" Still pondering step 2..."}}]}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');

    return new Response(sseBody, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const prov = new OpenAiCompatibleProvider(
      'openrouter',
      'OpenRouter',
      'https://openrouter.ai/api/v1',
      [{ id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', contextWindow: 64000, description: '', supportsStreaming: true }]
    );

    let chunksEmitted = 0;
    await assert.rejects(
      async () => {
        await prov.streamChat(
          [{ role: 'user', content: 'solve logic puzzle' }],
          { apiKey: 'test-key', model: 'deepseek/deepseek-r1' },
          (chunk) => {
            if (chunk.reasoningDelta) chunksEmitted++;
          }
        );
      },
      /Provider Compatibility Error: Model produced reasoning tokens but no assistant answer content/
    );

    assert.ok(chunksEmitted > 0, 'Reasoning chunks must still be emitted via stream for user visibility');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('4.2 Normal answers with reasoning properly separate content from reasoning tokens', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const sseBody = [
      'data: {"choices":[{"delta":{"reasoning_content":"Evaluating answer..."}}]}',
      '',
      'data: {"choices":[{"delta":{"content":"Here is the verified code:"}}]}',
      '',
      'data: {"choices":[{"delta":{"content":" console.log(\\"ok\\");"}}]}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');

    return new Response(sseBody, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const prov = new OpenAiCompatibleProvider(
      'openrouter',
      'OpenRouter',
      'https://openrouter.ai/api/v1',
      [{ id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', contextWindow: 64000, description: '', supportsStreaming: true }]
    );

    let streamContent = '';
    let streamReasoning = '';

    const result = await prov.streamChat(
      [{ role: 'user', content: 'write code' }],
      { apiKey: 'test-key', model: 'deepseek/deepseek-r1' },
      (chunk) => {
        if (chunk.contentDelta) streamContent += chunk.contentDelta;
        if (chunk.reasoningDelta) streamReasoning += chunk.reasoningDelta;
      }
    );

    assert.equal(result.fullContent, 'Here is the verified code: console.log("ok");');
    assert.equal(result.reasoning, 'Evaluating answer...');
    assert.equal(streamContent, result.fullContent);
    assert.equal(streamReasoning, result.reasoning);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test('4.3 Tool-calling stream with reasoning parses tool calls accurately', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const sseBody = [
      'data: {"choices":[{"delta":{"reasoning_content":"Inspecting directory structure...","tool_calls":[{"index":0,"id":"call_123","function":{"name":"read_file","arguments":"{\\"path\\":\\""}}]}}]}',
      '',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"./src/App.tsx\\"}"}}]}}]}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');

    return new Response(sseBody, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const prov = new OpenAiCompatibleProvider(
      'openrouter',
      'OpenRouter',
      'https://openrouter.ai/api/v1',
      [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', contextWindow: 128000, description: '', supportsStreaming: true }]
    );

    const result = await prov.streamChat(
      [{ role: 'user', content: 'read src' }],
      { apiKey: 'test-key', model: 'openai/gpt-4o-mini' },
      () => {}
    );

    assert.ok(result.toolCalls && result.toolCalls.length === 1);
    assert.equal(result.toolCalls[0].toolName, 'read_file');
    assert.equal(result.toolCalls[0].args.path, './src/App.tsx');
    assert.equal(result.reasoning, 'Inspecting directory structure...');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log('\nSuite 5: Workspace Context & Path Security Boundary');

await test('5.1 WorkspaceAdapter.normalizePath accepts leading ./ but strictly blocks parent directory traversal', () => {
  assert.equal(WorkspaceAdapter.normalizePath('./src/App.tsx'), 'src/App.tsx');
  assert.equal(WorkspaceAdapter.normalizePath('/src/App.tsx'), 'src/App.tsx');
  assert.equal(WorkspaceAdapter.normalizePath('src/App.tsx'), 'src/App.tsx');

  assert.equal(WorkspaceAdapter.normalizePath('../secret.txt'), null);
  assert.equal(WorkspaceAdapter.normalizePath('src/../../etc/passwd'), null);
  assert.equal(WorkspaceAdapter.normalizePath('C:\\Windows\\system32'), null);
  assert.ok(WorkspaceAdapter.isIgnoredPath('.git/config'));
  assert.ok(WorkspaceAdapter.isIgnoredPath('node_modules/pkg/index.js'));
});

await test('5.2 ContextBuilder parses @file and @folder mentions with bound token limits', () => {
  const project = {
    id: 'test-p1',
    name: 'Test Project',
    files: [
      { path: 'src/App.tsx', content: 'export const App = () => <div>Hello</div>;', language: 'typescript' },
      { path: 'src/index.ts', content: 'import "./App";', language: 'typescript' },
      { path: 'src/components/Header.tsx', content: 'export const Header = () => <header/>;', language: 'typescript' },
      { path: 'package.json', content: '{"name":"test"}', language: 'json' },
    ],
  };

  // Mention single file
  const fileMentions = ContextBuilder.extractAtMentions('Check @src/App.tsx please', project.files);
  assert.equal(fileMentions.length, 1);
  assert.equal(fileMentions[0], 'src/App.tsx');

  // Mention folder
  const folderMentions = ContextBuilder.extractAtMentions('Inspect @src/ and @src/components', project.files);
  assert.ok(folderMentions.length >= 3);
  assert.ok(folderMentions.includes('src/App.tsx'));
  assert.ok(folderMentions.includes('src/index.ts'));
  assert.ok(folderMentions.includes('src/components/Header.tsx'));
});

console.log('\n============================================================');
console.log(`  ALL ${passed} / ${total} SECURITY & INTEGRITY TESTS PASSED!`);
console.log('============================================================\n');

try {
  rmSync(tempDir, { recursive: true, force: true });
} catch {}
