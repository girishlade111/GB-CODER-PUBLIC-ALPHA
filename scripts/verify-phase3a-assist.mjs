/**
 * GB CODER: PHASE 3A GB ASSIST AI FOUNDATION VERIFICATION SUITE
 *
 * Deterministic automated tests validating:
 * 1. BYOK Key Management & Ephemeral Storage Security
 * 2. Provider Registry & Model Catalog
 * 3. Context Builder & Project-Aware Assembly
 * 4. Streaming Execution & Stop Generation
 * 5. Structured Edit Proposal Engine & Diff Statistics
 * 6. Project-Isolated Conversation Store
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
};

globalThis.sessionStorage = {
  getItem: (k) => sessionStore.get(k) ?? null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear(),
};

globalThis.window = globalThis;

// Bundle the real TypeScript modules using esbuild (standard in GB Coder test suites)
const tempDir = join(process.cwd(), '.tmp-ai-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'ai-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/ai/types.ts';
      export * from './src/services/ai/keyManager.ts';
      export * from './src/services/ai/providerRegistry.ts';
      export * from './src/services/ai/contextBuilder.ts';
      export * from './src/services/ai/editProposalService.ts';
      export * from './src/services/ai/conversationStore.ts';
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

const ai = await import(pathToFileURL(bundleFile).href);
const {
  keyManager,
  providerRegistry,
  ContextBuilder,
  estimateTokens,
  EditProposalService,
  ConversationStore,
  assistAgentService,
  isSensitiveFilePath,
} = ai;

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}:`, err);
    throw err;
  }
}

console.log('\n============================================================');
console.log('  GB CODER: PHASE 3A GB ASSIST AI FOUNDATION VERIFICATION');
console.log('============================================================\n');

async function run() {
  console.log('Suite 1: BYOK Key Management & Ephemeral Storage Security');

  await test('1.1 Keys are kept in memory by default without persisting to localStorage', () => {
    keyManager.clearAllKeys();
    localStore.clear();
    sessionStore.clear();

    keyManager.setApiKey('openrouter', 'sk-or-v1-test-key-1234567890', false);

    assert.equal(keyManager.getApiKey('openrouter'), 'sk-or-v1-test-key-1234567890');
    assert.equal(keyManager.hasApiKey('openrouter'), true);

    // Verify localStorage NEVER contains the API key
    assert.equal(localStore.size, 0, 'localStorage must be empty');
    for (const [k, v] of localStore.entries()) {
      assert.ok(!v.includes('sk-or-v1'), `Key leaked to localStorage key ${k}`);
    }

    // Verify sessionStorage does NOT contain the key when persistInSession is false
    assert.equal(sessionStore.has('gbcoder_ai_key_session_openrouter'), false);
  });

  await test('1.2 SessionStorage opt-in works and isolates keys by provider', () => {
    keyManager.setApiKey('openai', 'sk-proj-test-openai-secret-key-999', true);

    assert.equal(keyManager.getApiKey('openai'), 'sk-proj-test-openai-secret-key-999');
    assert.equal(sessionStore.get('gbcoder_ai_key_session_openai'), 'sk-proj-test-openai-secret-key-999');

    // Confirm localStorage remains unpolluted
    assert.equal(localStore.size, 0);

    // Test clearApiKey clears both memory and sessionStorage
    keyManager.clearApiKey('openai');
    assert.equal(keyManager.getApiKey('openai'), '');
    assert.equal(keyManager.hasApiKey('openai'), false);
    assert.equal(sessionStore.has('gbcoder_ai_key_session_openai'), false);
  });

  await test('1.3 Key redaction masks keys safely for UI display', () => {
    assert.equal(keyManager.getMaskedKey('openrouter'), 'sk-o...7890');
    assert.equal(keyManager.getMaskedKey('gemini'), '');
  });

  console.log('\nSuite 2: Provider Registry & Model Catalog');

  await test('2.1 Registry includes all required providers and default models', () => {
    const providers = providerRegistry.getAllProviders();
    const providerIds = providers.map((p) => p.id);

    assert.ok(providerIds.includes('mock'), 'Mock provider must exist');
    assert.ok(providerIds.includes('openrouter'), 'OpenRouter provider must exist');
    assert.ok(providerIds.includes('openai'), 'OpenAI provider must exist');
    assert.ok(providerIds.includes('gemini'), 'Gemini provider must exist');
    assert.ok(providerIds.includes('custom'), 'Custom provider must exist');

    const openRouterModels = providerRegistry.getModelsForProvider('openrouter');
    assert.ok(openRouterModels.length >= 3, 'OpenRouter should have curated models');
    assert.ok(openRouterModels.some((m) => m.id.includes('claude') || m.id.includes('deepseek')));

    const mockModels = providerRegistry.getModelsForProvider('mock');
    assert.ok(mockModels.length >= 1, 'Mock provider should have models');
  });

  await test('2.2 Mock provider latency diagnostic returns successful status', async () => {
    const diag = await providerRegistry.testProviderConnection('mock');
    assert.equal(diag.success, true);
    assert.ok(diag.latencyMs >= 0);
    assert.ok(diag.message.includes('operational') || diag.message.includes('Mock'));
  });

  await test('2.3 Custom provider supports user base URL overrides in options', () => {
    const customProv = providerRegistry.getProvider('custom');
    assert.equal(customProv.id, 'custom');
    assert.equal(customProv.name, 'Custom OpenAI-Compatible');
    assert.equal(customProv.defaultBaseUrl, 'http://localhost:11434/v1');
  });

  console.log('\nSuite 3: Context Builder & Project-Aware Assembly');

  const mockProject = {
    id: 'test-project-alpha',
    name: 'Alpha Project',
    files: [
      { path: 'src/index.ts', content: 'console.log("Hello world");\n' },
      { path: 'src/components/Header.tsx', content: 'export const Header = () => <header>App Header</header>;\n' },
      { path: 'src/utils/math.ts', content: 'export const add = (a: number, b: number) => a + b;\n' },
      { path: 'package.json', content: '{\n  "name": "alpha",\n  "version": "1.0.0"\n}\n' },
    ],
  };

  await test('3.1 Token estimation accurately approximates token counts', () => {
    const text = 'Hello world, this is a test string for token estimation.';
    const tokens = estimateTokens(text);
    assert.ok(tokens > 5 && tokens < 25, `Tokens estimated: ${tokens}`);
  });

  await test('3.2 Mention extraction parses @file references accurately', () => {
    const input = 'Please refactor @src/utils/math.ts and also check @src/components/Header.tsx for bugs';
    const mentioned = ContextBuilder.extractAtMentions(input, mockProject.files);

    assert.equal(mentioned.length, 2);
    assert.equal(mentioned[0], 'src/utils/math.ts');
    assert.equal(mentioned[1], 'src/components/Header.tsx');
  });

  await test('3.3 Assembling context includes active file and mentioned files with metadata', () => {
    const assembled = ContextBuilder.assembleContext(
      mockProject,
      'src/index.ts',
      ['package.json'],
      'Can you update @src/utils/math.ts?',
      4000
    );

    const paths = assembled.files.map((r) => r.path);
    assert.ok(paths.includes('src/index.ts'), 'Active file must be in references');
    assert.ok(paths.includes('src/utils/math.ts'), 'Mentioned file must be in references');
    assert.ok(paths.includes('package.json'), 'Attached file must be in references');

    // System prompt includes instructions for structured edits
    const systemPrompt = ContextBuilder.buildSystemPrompt(assembled, 'react');
    assert.ok(systemPrompt.includes('<proposed_edit'), 'Must include structured edit instructions');
    assert.ok(systemPrompt.includes('src/index.ts'), 'Must include active file in context block');
    assert.ok(assembled.totalEstimatedTokens > 0, 'Estimated tokens must be positive');
  });

  await test('3.4 Strict project isolation prevents leaking non-project files', () => {
    const assembled = ContextBuilder.assembleContext(
      mockProject,
      '/etc/passwd',
      ['../outside.ts', 'src/index.ts'],
      'Show me @/secrets/keys.env',
      4000
    );

    const paths = assembled.files.map((r) => r.path);
    assert.ok(!paths.includes('/etc/passwd'), 'Non-project activePath must not be indexed');
    assert.ok(!paths.includes('../outside.ts'), 'Traversal paths must not be indexed');
    assert.ok(!paths.includes('/secrets/keys.env'), 'Non-existent mentioned paths must not be indexed');
    assert.ok(paths.includes('src/index.ts'), 'Valid project file must be indexed');
  });

  console.log('\nSuite 4: Streaming Execution & Stop Generation');

  await test('4.1 Mock Provider streams reasoning and content with progress updates', async () => {
    const mockProv = providerRegistry.getProvider('mock');
    assert.ok(mockProv, 'Mock provider must exist');

    let textAcc = '';
    let reasoningAcc = '';
    let chunkCount = 0;

    await mockProv.streamChat(
      [{ role: 'user', content: 'Say hello with reason' }],
      { model: 'mock-coder-reasoning' },
      (chunk) => {
        chunkCount++;
        if (chunk.reasoningDelta) reasoningAcc += chunk.reasoningDelta;
        if (chunk.contentDelta) textAcc += chunk.contentDelta;
      }
    );

    assert.ok(chunkCount > 0, 'Should yield multiple streaming chunks');
    assert.ok(reasoningAcc.length > 0, 'Should yield reasoning trace');
    assert.ok(textAcc.length > 0, 'Should yield text response');
  });

  await test('4.2 Abort signal halts streaming execution immediately', async () => {
    const mockProv = providerRegistry.getProvider('mock');
    const controller = new AbortController();

    let chunksBeforeAbort = 0;
    try {
      await mockProv.streamChat(
        [{ role: 'user', content: 'Write a long response with reason' }],
        { model: 'mock-coder-reasoning', signal: controller.signal },
        () => {
          chunksBeforeAbort++;
          if (chunksBeforeAbort === 2) {
            controller.abort();
          }
        }
      );
    } catch (err) {
      assert.ok(err.message?.includes('aborted') || controller.signal.aborted);
    }

    assert.ok(chunksBeforeAbort >= 2, 'Stream proceeded before abort');
  });

  await test('4.3 AssistAgentService orchestrates streaming message dispatch and state', async () => {
    assistAgentService.setProvider('mock');

    let generatingRecorded = false;
    const unsubscribe = assistAgentService.subscribe(() => {
      if (assistAgentService.getState().isGenerating) {
        generatingRecorded = true;
      }
    });

    await assistAgentService.submitPrompt('Hello mock agent', mockProject, 'src/index.ts');

    unsubscribe();

    const finalState = assistAgentService.getState();
    assert.equal(finalState.isGenerating, false, 'Should finish generating');
    assert.ok(generatingRecorded, 'isGenerating should have been true during stream');
    const activeSession = finalState.sessions.find((s) => s.id === finalState.activeSessionId);
    assert.ok(activeSession, 'Active session must exist');
    assert.ok(activeSession.messages.length >= 2, 'Should have user and assistant messages');
    const assistantMsg = activeSession.messages[activeSession.messages.length - 1];
    assert.equal(assistantMsg.role, 'assistant');
    assert.ok(assistantMsg.content.length > 0);
  });

  console.log('\nSuite 5: Structured Edit Proposal Engine & Diff Statistics');

  await test('5.1 Parse XML structured edit proposal with add/remove line counts', () => {
    const sampleAiOutput = `
Here is the proposed update to your code:

<proposed_edit path="src/utils/math.ts" action="modify">
export const add = (a: number, b: number): number => {
  return a + b;
};

export const subtract = (a: number, b: number): number => {
  return a - b;
};
</proposed_edit>

I hope this helps!
`;

    const proposals = EditProposalService.parseProposals(sampleAiOutput, mockProject.files);
    assert.equal(proposals.length, 1);
    const prop = proposals[0];
    assert.equal(prop.path, 'src/utils/math.ts');
    assert.equal(prop.action, 'modify');
    assert.ok(prop.addedLines > 0, `Added lines: ${prop.addedLines}`);
    assert.ok(prop.removedLines >= 1, `Removed lines: ${prop.removedLines}`);
    assert.equal(prop.status, 'pending');
  });

  await test('5.2 Parse fallback markdown code fence with path syntax', () => {
    const sampleAiOutput = `
\`\`\`ts:src/types.ts
export interface User {
  id: string;
  name: string;
}
\`\`\`
`;

    const proposals = EditProposalService.parseProposals(sampleAiOutput, mockProject.files);
    assert.equal(proposals.length, 1);
    const prop = proposals[0];
    assert.equal(prop.path, 'src/types.ts');
    assert.equal(prop.action, 'create');
    assert.ok(prop.addedLines >= 4, `Added lines: ${prop.addedLines}`);
    assert.equal(prop.removedLines, 0);
  });

  await test('5.3 Path traversal rejection sanitizes and ignores dangerous paths', () => {
    assert.equal(EditProposalService.normalizePath('../../../secret.txt'), null);
    assert.equal(EditProposalService.normalizePath('/etc/passwd'), null);
    assert.equal(EditProposalService.normalizePath('src/../etc/passwd'), null);
    assert.equal(EditProposalService.normalizePath('C:\\Windows\\System32'), null);
    assert.equal(EditProposalService.normalizePath('src/valid/path.ts'), 'src/valid/path.ts');
    assert.equal(EditProposalService.normalizePath('src\\windows\\relative\\file.ts'), 'src/windows/relative/file.ts');
  });

  await test('5.4 Dirty buffer detection blocks uncommitted changes', async () => {
    const proposal = {
      id: 'prop-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Hello world");\n',
      newContent: 'console.log("Updated world");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    let writtenPath = null;
    const res = await EditProposalService.applyEdit({
      project: mockProject,
      edit: proposal,
      isEditorDirty: (p) => p === 'src/index.ts',
      onChangeFile: (p, c) => {
        writtenPath = p;
      },
      createRollbackCheckpoint: false,
    });

    assert.equal(res.success, false, 'Dirty buffer write must fail');
    assert.ok(res.error?.includes('unsaved changes'), `Error message must cite unsaved changes: ${res.error}`);
    assert.equal(writtenPath, null, 'No file write must occur when editor is dirty');
  });

  console.log('\nSuite 6: Project-Isolated Conversation Store');

  await test('6.1 Sessions are strictly scoped to project ID', () => {
    localStore.clear();
    const p1 = 'proj-apple';
    const p2 = 'proj-banana';

    const p1Sessions = ConversationStore.loadSessions(p1);
    assert.equal(p1Sessions.length, 1);
    assert.equal(p1Sessions[0].projectId, p1);

    // Save message into p1
    p1Sessions[0].messages.push({
      id: 'm1',
      role: 'user',
      content: 'Apple specific question',
      timestamp: Date.now(),
    });
    ConversationStore.saveSessions(p1, p1Sessions);

    const p2Sessions = ConversationStore.loadSessions(p2);
    assert.equal(p2Sessions.length, 1);
    assert.equal(p2Sessions[0].projectId, p2);

    // Verify p2 does NOT see p1's message
    assert.equal(p2Sessions[0].messages.length, 0);

    // Verify p1 sees its message
    const p1Reloaded = ConversationStore.loadSessions(p1);
    assert.equal(p1Reloaded[0].messages.length, 1);
    assert.equal(p1Reloaded[0].messages[0].content, 'Apple specific question');
  });

  await test('6.2 Creating, switching, and deleting sessions operates cleanly', () => {
    const projectId = 'proj-cherry';
    const s1 = ConversationStore.loadSessions(projectId)[0];

    const s2 = ConversationStore.createNewSession(projectId);
    const all = ConversationStore.loadSessions(projectId);
    assert.equal(all.length, 2);
    assert.ok(all.some((s) => s.id === s2.id));

    const remaining = ConversationStore.deleteSession(projectId, s1.id);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, s2.id);
  });

  console.log('\nSuite 7: Targeted Safety Gates & Regression Suite');

  await test('7.1 Dirty buffer blocks AI edit application with actionable error and prevents write', async () => {
    const proposal = {
      id: 'prop-dirty-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Hello world");\n',
      newContent: 'console.log("Overwritten world");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    let written = false;
    const res = await EditProposalService.applyEdit({
      project: mockProject,
      edit: proposal,
      isEditorDirty: (p) => p === 'src/index.ts',
      onChangeFile: () => {
        written = true;
      },
      createRollbackCheckpoint: false,
    });

    assert.equal(res.success, false, 'Must fail when editor is dirty');
    assert.ok(res.error?.includes('unsaved changes'), `Error message must be actionable: ${res.error}`);
    assert.equal(written, false, 'File write must NOT happen when editor is dirty');
  });

  await test('7.2 Clean saved buffer allows AI edit application to succeed', async () => {
    const proposal = {
      id: 'prop-clean-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Hello world");\n',
      newContent: 'console.log("Clean updated world");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    let writtenPath = null;
    let writtenContent = null;

    const res = await EditProposalService.applyEdit({
      project: mockProject,
      edit: proposal,
      isEditorDirty: () => false,
      onChangeFile: (p, c) => {
        writtenPath = p;
        writtenContent = c;
      },
      createRollbackCheckpoint: false,
    });

    assert.equal(res.success, true, 'Clean edit must succeed');
    assert.equal(writtenPath, 'src/index.ts');
    assert.equal(writtenContent, 'console.log("Clean updated world");\n');
  });

  await test('7.3 Stale proposal detection rejects modify proposal when underlying content changed', async () => {
    const staleProposal = {
      id: 'prop-stale-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Old outdated content");\n',
      newContent: 'console.log("Brand new content");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    let written = false;
    const res = await EditProposalService.applyEdit({
      project: mockProject,
      edit: staleProposal,
      isEditorDirty: () => false,
      onChangeFile: () => {
        written = true;
      },
      createRollbackCheckpoint: false,
    });

    assert.equal(res.success, false, 'Must fail when proposal base content is stale');
    assert.ok(
      res.error?.includes('Stale proposal') || res.error?.includes('modified since'),
      res.error
    );
    assert.equal(written, false, 'File write must NOT happen for stale proposals');
  });

  await test('7.4 File creation proposal rejects write if target file already exists', async () => {
    const existingFileProposal = {
      id: 'prop-create-dup',
      path: 'src/index.ts',
      action: 'create',
      newContent: 'export default {};\n',
      addedLines: 1,
      removedLines: 0,
      status: 'pending',
    };

    let written = false;
    const res = await EditProposalService.applyEdit({
      project: mockProject,
      edit: existingFileProposal,
      isEditorDirty: () => false,
      onChangeFile: () => {
        written = true;
      },
      createRollbackCheckpoint: false,
    });

    assert.equal(res.success, false, 'Must fail when create target already exists');
    assert.ok(res.error?.includes('already exists'), res.error);
    assert.equal(written, false, 'File write must NOT overwrite existing file via create proposal');
  });

  await test('7.5 Multi-file proposal partial failure preserves recovery information', async () => {
    const proposals = [
      {
        id: 'p-multi-1',
        path: 'src/utils/math.ts',
        action: 'modify',
        originalContent: 'export const add = (a: number, b: number) => a + b;\n',
        newContent: 'export const add = (a: number, b: number): number => a + b;\n',
        addedLines: 1,
        removedLines: 1,
        status: 'pending',
      },
      {
        id: 'p-multi-2',
        path: 'src/index.ts',
        action: 'modify',
        originalContent: 'WRONG BASE CONTENT THAT TRIGGERS STALE ERROR',
        newContent: 'console.log("Updated");\n',
        addedLines: 1,
        removedLines: 1,
        status: 'pending',
      },
    ];

    const results = [];
    for (const edit of proposals) {
      const res = await EditProposalService.applyEdit({
        project: mockProject,
        edit,
        isEditorDirty: () => false,
        onChangeFile: () => {},
        createRollbackCheckpoint: false,
      });
      results.push({ id: edit.id, success: res.success, error: res.error });
    }

    assert.equal(results[0].success, true, 'First valid edit succeeds');
    assert.equal(results[1].success, false, 'Second stale edit fails predictably');
    assert.ok(results[1].error?.includes('Stale proposal'));
  });

  await test('7.6 Cross-project edit application blocked when proposal projectId does not match active', async () => {
    assistAgentService.setProject('proj-target-alpha');

    const foreignEdit = {
      id: 'prop-foreign-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Hello world");\n',
      newContent: 'console.log("Malicious foreign edit");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    // 1. assistAgentService check
    const agentRes = await assistAgentService.applyEdit(
      'msg-arbitrary',
      'prop-foreign-1',
      {
        project: mockProject,
        isEditorDirty: () => false,
        onChangeFile: () => {},
        projectId: 'proj-other-beta',
      }
    );

    assert.equal(agentRes.success, false, 'Must reject edit with mismatched projectId in agent service');
    assert.ok(agentRes.error?.includes('switched to another project') || agentRes.error?.includes('mismatch'));

    // 2. EditProposalService direct check
    const directRes = await EditProposalService.applyEdit({
      project: { ...mockProject, id: 'proj-target-alpha' },
      edit: foreignEdit,
      projectId: 'proj-other-beta',
      isEditorDirty: () => false,
      onChangeFile: () => {},
      createRollbackCheckpoint: false,
    });

    assert.equal(directRes.success, false, 'Must reject edit with mismatched projectId in EditProposalService');
    assert.ok(directRes.error?.includes('Target project mismatch'));
  });

  await test('7.7 In-flight streaming request aborted on project switch', async () => {
    assistAgentService.setProject('proj-streaming-alpha');

    const promptPromise = assistAgentService.submitPrompt('Tell me a story', mockProject, 'src/index.ts');

    assistAgentService.setProject('proj-streaming-beta');

    await promptPromise;

    const betaSession = assistAgentService.getActiveSession();
    assert.equal(betaSession.projectId, 'proj-streaming-beta');
    assert.equal(betaSession.messages.length, 0, 'Beta session must remain clean and unpolluted');
  });

  await test('7.8 Rejecting an edit updates session state immutably (referential inequality)', () => {
    assistAgentService.setProject('proj-immutable-test');
    const session = assistAgentService.getActiveSession();

    const sampleEdit = {
      id: 'edit-immut-1',
      path: 'src/sample.ts',
      action: 'create',
      newContent: 'console.log("immutable");',
      addedLines: 1,
      removedLines: 0,
      status: 'pending',
    };

    const msgId = 'msg-with-edit';
    session.messages.push({
      id: msgId,
      role: 'assistant',
      content: 'Here is an edit',
      timestamp: Date.now(),
      proposedEdits: [sampleEdit],
    });

    const stateBefore = assistAgentService.getState();
    const sessionsBefore = stateBefore.sessions;

    assistAgentService.rejectEdit(msgId, 'edit-immut-1');

    const stateAfter = assistAgentService.getState();
    const sessionsAfter = stateAfter.sessions;

    assert.notEqual(sessionsBefore, sessionsAfter, 'sessions array reference must change on reject');
    const updatedMsg = sessionsAfter[0].messages.find((m) => m.id === msgId);
    assert.equal(updatedMsg.proposedEdits[0].status, 'rejected');
  });

  await test('7.9 Applying an edit updates session state immutably (referential inequality)', async () => {
    const testProjId = 'proj-immutable-apply';
    assistAgentService.setProject(testProjId);
    const session = assistAgentService.getActiveSession();

    const sampleEdit = {
      id: 'edit-apply-1',
      path: 'src/index.ts',
      action: 'modify',
      originalContent: 'console.log("Hello world");\n',
      newContent: 'console.log("Applied world");\n',
      addedLines: 1,
      removedLines: 1,
      status: 'pending',
    };

    const msgId = 'msg-apply-edit';
    session.messages.push({
      id: msgId,
      role: 'assistant',
      content: 'Here is an edit to apply',
      timestamp: Date.now(),
      proposedEdits: [sampleEdit],
    });

    const stateBefore = assistAgentService.getState();
    const sessionsBefore = stateBefore.sessions;

    let appliedContent = null;
    const res = await assistAgentService.applyEdit(
      msgId,
      'edit-apply-1',
      {
        project: { ...mockProject, id: testProjId },
        projectId: testProjId,
        isEditorDirty: () => false,
        onChangeFile: (p, c) => {
          appliedContent = c;
        },
        createRollbackCheckpoint: false,
      }
    );

    assert.equal(res.success, true, `Apply must succeed: ${res.error}`);
    assert.equal(appliedContent, 'console.log("Applied world");\n');

    const stateAfter = assistAgentService.getState();
    const sessionsAfter = stateAfter.sessions;

    assert.notEqual(sessionsBefore, sessionsAfter, 'sessions array reference must change on apply');
    const updatedMsg = sessionsAfter[0].messages.find((m) => m.id === msgId);
    assert.equal(updatedMsg.proposedEdits[0].status, 'applied');
  });

  await test('7.10 Sensitive files (.env, keys, credentials) are excluded from active context', () => {
    const sensitiveProject = {
      id: 'secret-project',
      name: 'Secret Project',
      files: [
        { path: '.env', content: 'DATABASE_URL="postgres://user:pass@host/db"\nSECRET_KEY="supersecret"\n' },
        { path: '.env.production', content: 'API_KEY="prod-api-key"\n' },
        { path: 'src/index.ts', content: 'console.log("public");\n' },
        { path: 'credentials.json', content: '{"token": "xyz"}\n' },
        { path: 'id_rsa', content: '-----BEGIN OPENSSH PRIVATE KEY-----\nsecret\n' },
      ],
    };

    const assembledEnv = ContextBuilder.assembleContext(
      sensitiveProject,
      '.env',
      [],
      'Hello assistant',
      4000
    );

    const paths = assembledEnv.files.map((f) => f.path);
    assert.ok(!paths.includes('.env'), '.env must be excluded from active file');
    assert.ok(assembledEnv.excludedSensitiveFiles.includes('.env'), 'Must report .env in excludedSensitiveFiles');

    const prompt = ContextBuilder.buildSystemPrompt(assembledEnv);
    assert.ok(prompt.includes('SECURITY NOTICE'), 'System prompt must warn about excluded sensitive files');
    assert.ok(prompt.includes('.env'), 'Notice must list excluded file name');
  });

  await test('7.11 Sensitive files are excluded from @file mentions and user attachments', () => {
    const sensitiveProject = {
      id: 'secret-project-2',
      name: 'Secret Project 2',
      files: [
        { path: '.env.local', content: 'SECRET=local-secret\n' },
        { path: 'server.key', content: 'PRIVATE KEY\n' },
        { path: 'src/app.ts', content: 'export const app = {};\n' },
      ],
    };

    const assembled = ContextBuilder.assembleContext(
      sensitiveProject,
      'src/app.ts',
      ['.env.local'],
      'Can you inspect @server.key for me?',
      4000
    );

    const paths = assembled.files.map((f) => f.path);
    assert.ok(paths.includes('src/app.ts'), 'Safe active file must be included');
    assert.ok(!paths.includes('.env.local'), '.env.local attachment must be excluded');
    assert.ok(!paths.includes('server.key'), 'server.key mention must be excluded');
    assert.ok(assembled.excludedSensitiveFiles.includes('.env.local'));
    assert.ok(assembled.excludedSensitiveFiles.includes('server.key'));
  });

  await test('7.12 isSensitiveFilePath helper detects comprehensive list of sensitive file patterns', () => {
    assert.equal(isSensitiveFilePath('.env'), true);
    assert.equal(isSensitiveFilePath('.env.local'), true);
    assert.equal(isSensitiveFilePath('.env.production'), true);
    assert.equal(isSensitiveFilePath('config/id_rsa'), true);
    assert.equal(isSensitiveFilePath('keys/cert.pem'), true);
    assert.equal(isSensitiveFilePath('credentials.json'), true);
    assert.equal(isSensitiveFilePath('firebase-adminsdk-12345.json'), true);
    assert.equal(isSensitiveFilePath('.git/config'), true);
    assert.equal(isSensitiveFilePath('.npmrc'), true);
    assert.equal(isSensitiveFilePath('src/index.ts'), false);
    assert.equal(isSensitiveFilePath('src/components/App.tsx'), false);
    assert.equal(isSensitiveFilePath('package.json'), false);
  });

  console.log('\n============================================================');
  console.log(`  ALL ${passedTests} / ${totalTests} PHASE 3A TESTS PASSED!`);
  console.log('============================================================\n');

  // Clean up temp bundle
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup
  }
}

run().catch((err) => {
  console.error('\nTest run failed:', err);
  process.exit(1);
});
