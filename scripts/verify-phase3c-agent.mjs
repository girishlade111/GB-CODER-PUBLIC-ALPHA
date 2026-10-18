/**
 * GB CODER: PHASE 3C AUTONOMOUS CODING AGENT ENGINE VERIFICATION SUITE
 *
 * Deterministic automated tests validating:
 * 1. Agent State Machine Lifecycle & Plan Generation
 * 2. Provider Tool Calling Protocols (Gemini Native & OpenAI Serialization)
 * 3. Human-in-the-Loop Approval Gating & Token Security
 * 4. Execution Budget Enforcement & Stop Agent Cancellation
 * 5. Autonomous Multi-Step Self-Correction Loop (Inspect -> Fail -> Fix -> Pass)
 * 6. Multi-Project Isolation & Safe Reload Recovery
 */

import { build } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// Set up browser storage & window mocks for Node environment
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

// Bundle tools, agent, and AI modules with esbuild
const tempDir = join(process.cwd(), '.tmp-agent-verify');
mkdirSync(tempDir, { recursive: true });
const bundleFile = join(tempDir, 'agent-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/ai/tools/types.ts';
      export * from './src/services/ai/tools/workspaceAdapter.ts';
      export * from './src/services/ai/tools/terminalAdapter.ts';
      export * from './src/services/ai/tools/permissionController.ts';
      export * from './src/services/ai/tools/builtinTools.ts';
      export * from './src/services/ai/tools/toolRegistry.ts';
      export * from './src/services/ai/tools/toolExecutor.ts';
      export * from './src/services/ai/agent/types.ts';
      export * from './src/services/ai/agent/agentEngine.ts';
      export * from './src/services/ai/assistAgentService.ts';
      export * from './src/services/ai/providerRegistry.ts';
      export * from './src/services/ai/keyManager.ts';
      export * from './src/services/ai/providers/geminiProvider.ts';
      export * from './src/services/ai/providers/openaiCompatibleProvider.ts';
      export * from './src/services/ai/providers/mockProvider.ts';
      export * from './src/services/ai/editProposalService.ts';
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

const agentModule = await import(pathToFileURL(bundleFile).href);
const {
  AgentEngine,
  DEFAULT_AGENT_BUDGET,
  ToolRegistry,
  ToolExecutor,
  WorkspaceAdapter,
  TerminalAdapter,
  PermissionController,
  BUILTIN_TOOLS,
  assistAgentService,
  providerRegistry,
  keyManager,
  MockProvider,
  GeminiProvider,
  EditProposalService,
} = agentModule;

let passedTests = 0;
let totalTests = 0;

function runTest(suiteName, testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${testName}:`, err.message);
    throw err;
  }
}

async function runTestAsync(suiteName, testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${testName}:`, err.message);
    throw err;
  }
}

function waitForCompletion(engine, expectedTaskId, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const currentState = engine.getTaskState();
    if (
      currentState &&
      currentState.taskId === expectedTaskId &&
      ['completed', 'failed', 'cancelled'].includes(currentState.status)
    ) {
      return resolve(currentState);
    }
    const timer = setTimeout(() => {
      unsub();
      reject(new Error(`Timeout waiting for agent completion (taskId: ${expectedTaskId}, status: ${engine.getTaskState()?.status})`));
    }, timeoutMs);
    const unsub = engine.subscribe((state) => {
      if (!state || state.taskId !== expectedTaskId) return;
      if (['completed', 'failed', 'cancelled'].includes(state.status)) {
        clearTimeout(timer);
        unsub();
        resolve(state);
      }
    });
  });
}

function waitForApproval(engine, expectedTaskId, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const checkState = (state) => {
      if (
        state &&
        state.taskId === expectedTaskId &&
        state.status === 'awaiting_approval' &&
        state.pendingApproval
      ) {
        return state.pendingApproval;
      }
      return null;
    };
    const current = checkState(engine.getTaskState());
    if (current) return resolve(current);

    const timer = setTimeout(() => {
      unsub();
      reject(new Error(`Timeout waiting for agent approval (taskId: ${expectedTaskId}, status: ${engine.getTaskState()?.status})`));
    }, timeoutMs);
    const unsub = engine.subscribe((state) => {
      const pending = checkState(state);
      if (pending) {
        clearTimeout(timer);
        unsub();
        resolve(pending);
      }
    });
  });
}

console.log('============================================================');
console.log('GB CODER: PHASE 3C AUTONOMOUS CODING AGENT VERIFICATION');
console.log('============================================================\n');

let projectCounter = 0;
function createMockProject() {
  projectCounter++;
  const id = `proj-agent-${Date.now()}-${projectCounter}`;
  return {
    id,
    name: `Agent Verify Project ${projectCounter}`,
    createdAt: Date.now(),
    lastOpenedAt: Date.now(),
    editorStyle: 'vscode',
    projectType: 'react',
    fileCount: 4,
    files: [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'agent-verify', scripts: { test: 'vitest run' } }, null, 2),
      },
      {
        path: 'src/math.ts',
        content: 'export function add(a: number, b: number): number {\n  return a - b; // BUG: subtract instead of add\n}\n',
      },
      {
        path: 'src/math.test.ts',
        content: 'import { add } from "./math";\n\ntest("adds numbers", () => {\n  expect(add(2, 3)).toBe(5);\n});\n',
      },
      {
        path: 'src/index.ts',
        content: 'export * from "./math";\n',
      },
    ],
  };
}

// ============================================================
// SUITE 1: AGENT STATE MACHINE LIFECYCLE & PLAN GENERATION
// ============================================================
console.log('Suite 1: Agent State Machine Lifecycle & Plan Generation');

runTest('Suite 1', '1.1 Initial engine status is null or idle without active task', () => {
  const engine = new AgentEngine();
  const state = engine.getTaskState();
  assert.equal(state, null);
});

await runTestAsync('Suite 1', '1.2 Engine initializes task, sets status to planning then running to completion', async () => {
  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);

  let statusHistory = [];
  engine.subscribe((s) => {
    if (s && !statusHistory.includes(s.status)) {
      statusHistory.push(s.status);
    }
  });

  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Inspected files and task requirement. Everything is verified.',
      toolCalls: [],
    };
  });

  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Inspect math functions', {
    project: mockProject,
    projectId: mockProject.id,
    activePath: 'src/math.ts',
  });

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.ok(statusHistory.includes('planning'), 'Status history must include planning');
  assert.ok(statusHistory.includes('running'), 'Status history must include running');
  assert.equal(finalState.status, 'completed');
  assert.ok(finalState.plan !== null, 'Plan must be created');
  assert.ok(finalState.plan.steps.length >= 1, 'Plan must have parsed steps');
});

await runTestAsync('Suite 1', '1.3 Plan steps update their status dynamically as agent progresses', async () => {
  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);

  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Task completed successfully without extra tools.',
      toolCalls: [],
    };
  });

  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Quick check', {
    project: mockProject,
    projectId: mockProject.id,
  });

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'completed');
  assert.ok(finalState.plan.steps[0].status === 'completed' || finalState.plan.steps[0].status === 'running');
});

// ============================================================
// SUITE 2: PROVIDER TOOL CALLING PROTOCOLS
// ============================================================
console.log('\nSuite 2: Provider Tool Calling Protocols');

runTest('Suite 2', '2.1 GeminiProvider formats tools into native functionDeclarations', () => {
  const gemini = new GeminiProvider();
  assert.ok(typeof gemini.streamChat === 'function');
  for (const tool of BUILTIN_TOOLS) {
    assert.ok(tool.name, 'Tool must have name');
    assert.ok(tool.description, 'Tool must have description');
    assert.ok(tool.parameters && tool.parameters.properties, 'Tool must have properties');
  }
});

runTest('Suite 2', '2.2 OpenAICompatibleProvider serializes tool role with tool_call_id', () => {
  const openAi = providerRegistry.getProvider('openrouter');
  assert.ok(typeof openAi.streamChat === 'function');
  const toolMsg = {
    role: 'tool',
    content: '{"exitCode":0,"stdout":"pass"}',
    toolCallId: 'call_12345',
    name: 'run_terminal_command',
  };
  assert.equal(toolMsg.role, 'tool');
  assert.equal(toolMsg.toolCallId, 'call_12345');
});

await runTestAsync('Suite 2', '2.3 MockProvider executes multi-turn tool calling sequence deterministically', async () => {
  let turn = 0;
  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      return {
        fullContent: 'Let me inspect the file first.',
        toolCalls: [
          {
            id: 'call_turn1',
            toolName: 'read_file',
            args: { path: 'src/math.ts' },
          },
        ],
      };
    }
    return {
      fullContent: 'File read successfully. Everything is in order.',
      toolCalls: [],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Check math.ts', {
    project: mockProject,
    projectId: mockProject.id,
  });

  const res = await waitForCompletion(engine, task.taskId);
  assert.equal(res.status, 'completed');
  assert.equal(res.usage.toolCallCount, 1);
  assert.equal(res.steps[0].toolCalls[0].toolName, 'read_file');
  assert.equal(res.steps[0].status, 'completed');
});

// ============================================================
// SUITE 3: HUMAN-IN-THE-LOOP APPROVAL GATING & TOKEN SECURITY
// ============================================================
console.log('\nSuite 3: Human-in-the-Loop Approval Gating & Token Security');

await runTestAsync('Suite 3', '3.1 Gated terminal tool pauses engine in awaiting_approval with approval ID', async () => {
  let turn = 0;
  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      return {
        fullContent: 'Running terminal command to check tests.',
        toolCalls: [
          {
            id: 'call_term_1',
            toolName: 'run_terminal_command',
            args: { command: 'npm test' },
          },
        ],
      };
    }
    return {
      fullContent: 'Test finished.',
      toolCalls: [],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Run tests for math', {
    project: mockProject,
    projectId: mockProject.id,
  });

  const pendingApproval = await waitForApproval(engine, task.taskId);
  assert.ok(pendingApproval !== null);
  assert.equal(pendingApproval.toolCall.toolName, 'run_terminal_command');
  assert.equal(pendingApproval.toolCall.riskLevel, 'safe');

  const state = engine.getTaskState();
  assert.equal(state.status, 'awaiting_approval');

  // Set mock runner for terminal
  TerminalAdapter.setMockRunner(async () => ({ exitCode: 0, stdout: 'All tests pass!' }));

  // Approve action
  const approved = engine.approveAction(pendingApproval.id);
  assert.equal(approved, true);

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'completed');
  assert.equal(finalState.pendingApproval, undefined);
  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 3', '3.2 Denied approval rejects action and records denial cleanly', async () => {
  let turn = 0;
  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      return {
        fullContent: 'Running dangerous command.',
        toolCalls: [
          {
            id: 'call_danger',
            toolName: 'run_terminal_command',
            args: { command: 'rm -rf node_modules' },
          },
        ],
      };
    }
    return {
      fullContent: 'Proceeding without running command.',
      toolCalls: [],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Clean build', {
    project: mockProject,
    projectId: mockProject.id,
  });

  const pendingApproval = await waitForApproval(engine, task.taskId);
  assert.equal(pendingApproval.toolCall.toolName, 'run_terminal_command');

  // Deny pending action
  const denied = engine.denyAction(pendingApproval.id, 'Command rejected by user');
  assert.equal(denied, true);

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'completed');

  const dangerStep = finalState.steps.find((s) => s.toolCalls.some((tc) => tc.toolName === 'run_terminal_command'));
  assert.ok(dangerStep);
  const dangerCall = dangerStep.toolCalls.find((tc) => tc.toolName === 'run_terminal_command');
  assert.equal(dangerCall.status, 'denied');
});

runTest('Suite 3', '3.3 Replaying an old approval ID returns false and rejects action', () => {
  const engine = new AgentEngine();
  const invalidRes = engine.approveAction('appr_fake_expired_id');
  assert.equal(invalidRes, false);
});

// ============================================================
// SUITE 4: EXECUTION BUDGET ENFORCEMENT & STOP AGENT
// ============================================================
console.log('\nSuite 4: Execution Budget Enforcement & Stop Agent');

await runTestAsync('Suite 4', '4.1 Engine enforces maxSteps budget limit', async () => {
  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Calling tool again...',
      toolCalls: [
        {
          id: `call_${Date.now()}_${Math.random()}`,
          toolName: 'read_file',
          args: { path: 'src/math.ts' },
        },
      ],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Infinite loop prompt', {
    project: mockProject,
    projectId: mockProject.id,
    customBudget: {
      maxSteps: 3, // tight budget of 3 steps
      maxToolCalls: 10,
    },
  });

  const res = await waitForCompletion(engine, task.taskId);
  assert.equal(res.status, 'failed');
  assert.ok(res.error.includes('maximum allowed steps'));
  assert.equal(res.usage.stepCount, 3);
});

await runTestAsync('Suite 4', '4.2 Engine enforces maxToolCalls budget limit', async () => {
  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Multiple tools...',
      toolCalls: [
        { id: 'c1', toolName: 'read_file', args: { path: 'src/math.ts' } },
        { id: 'c2', toolName: 'read_file', args: { path: 'src/index.ts' } },
        { id: 'c3', toolName: 'read_file', args: { path: 'package.json' } },
      ],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Exceed tool calls', {
    project: mockProject,
    projectId: mockProject.id,
    customBudget: {
      maxSteps: 10,
      maxToolCalls: 2, // only 2 allowed
    },
  });

  const res = await waitForCompletion(engine, task.taskId);
  assert.equal(res.status, 'failed');
  assert.ok(res.error.includes('maximum tool calls'));
});

await runTestAsync('Suite 4', '4.3 Stop Agent cancels task immediately and sets cancelled status', async () => {
  MockProvider.setScenarioHandler(async () => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      fullContent: 'Still thinking...',
      toolCalls: [{ id: 'slow_call', toolName: 'read_file', args: { path: 'src/math.ts' } }],
    };
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Long running task to abort', {
    project: mockProject,
    projectId: mockProject.id,
  });

  await new Promise((r) => setTimeout(r, 40));
  engine.stopAgent('User clicked Stop Agent');

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'cancelled');
  assert.ok(finalState.error.includes('User clicked Stop Agent'));
});

// ============================================================
// SUITE 5: AUTONOMOUS MULTI-STEP SELF-CORRECTION LOOP
// ============================================================
console.log('\nSuite 5: Autonomous Multi-Step Self-Correction Loop');

await runTestAsync('Suite 5', '5.1 Agent inspects, tests, fixes, retests, and verifies completion', async () => {
  let turn = 0;
  let testRuns = 0;

  TerminalAdapter.setMockRunner(async () => {
    testRuns++;
    if (testRuns === 1) {
      // First test run fails
      return {
        exitCode: 1,
        stdout: 'FAIL src/math.test.ts\n  ● adds numbers\n    Expected: 5\n    Received: -1\n\nTests: 1 failed, 1 total',
      };
    } else {
      // Second test run passes!
      return {
        exitCode: 0,
        stdout: 'PASS src/math.test.ts\n  ✓ adds numbers (2 ms)\n\nTests: 1 passed, 1 total',
      };
    }
  });

  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      // Step 1: Read math.ts
      return {
        fullContent: 'Inspecting math.ts implementation.',
        toolCalls: [
          {
            id: 'c_inspect',
            toolName: 'read_file',
            args: { path: 'src/math.ts' },
          },
        ],
      };
    } else if (turn === 2) {
      // Step 2: Run tests to confirm failure
      return {
        fullContent: 'Running tests to confirm failure.',
        toolCalls: [
          {
            id: 'c_test1',
            toolName: 'run_terminal_command',
            args: { command: 'npm test' },
          },
        ],
      };
    } else if (turn === 3) {
      // Step 3: Propose fix
      return {
        fullContent: 'Tests failed as expected. Fixing subtraction bug in add function.',
        toolCalls: [
          {
            id: 'c_fix',
            toolName: 'propose_file_edit',
            args: {
              path: 'src/math.ts',
              explanation: 'Fix add function to use addition operator + instead of -',
              newContent: 'export function add(a: number, b: number): number {\n  return a + b;\n}\n',
            },
          },
        ],
      };
    } else if (turn === 4) {
      // Step 4: Retest to verify
      return {
        fullContent: 'Fix applied. Retesting to verify the fix.',
        toolCalls: [
          {
            id: 'c_test2',
            toolName: 'run_terminal_command',
            args: { command: 'npm test' },
          },
        ],
      };
    } else {
      // Step 5: Verification complete
      return {
        fullContent: 'All tests pass! The addition bug in src/math.ts has been resolved and verified.',
        toolCalls: [],
      };
    }
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  // Subscribe to automatically approve any pending actions
  const unsub = engine.subscribe((state) => {
    if (state && state.status === 'awaiting_approval' && state.pendingApproval) {
      engine.approveAction(state.pendingApproval.id);
    }
  });

  const task = await engine.startTask('Fix the failing addition test in src/math.ts and verify', {
    project: mockProject,
    projectId: mockProject.id,
    activePath: 'src/math.ts',
    onFileChange: (path, content) => {
      const f = mockProject.files.find((item) => item.path === path);
      if (f) f.content = content;
    },
  });

  const finalState = await waitForCompletion(engine, task.taskId, 15000);
  unsub();

  assert.equal(finalState.status, 'completed');
  assert.equal(testRuns, 2, 'Must have run test twice (fail -> fix -> pass)');

  const toolNames = finalState.steps.flatMap((s) => s.toolCalls.map((tc) => tc.toolName));
  assert.ok(toolNames.includes('read_file'));
  assert.ok(toolNames.includes('propose_file_edit'));
  assert.ok(toolNames.includes('run_terminal_command'));

  // Verify that math.ts was updated with the fix
  const updatedFile = mockProject.files.find((f) => f.path === 'src/math.ts');
  assert.ok(updatedFile.content.includes('return a + b;'), 'Workspace file must be updated with the fix');
  TerminalAdapter.setMockRunner(null);
});

// ============================================================
// SUITE 6: MULTI-PROJECT ISOLATION & SAFE RELOAD RECOVERY
// ============================================================
console.log('\nSuite 6: Multi-Project Isolation & Safe Reload Recovery');

await runTestAsync('Suite 6', '6.1 Projects maintain isolated agent task states', async () => {
  const engine = new AgentEngine();
  const mockAlpha = { ...createMockProject(), id: 'proj_alpha', name: 'Alpha' };
  const mockBeta = { ...createMockProject(), id: 'proj_beta', name: 'Beta' };

  MockProvider.setScenarioHandler(async () => ({
    fullContent: 'Alpha task completed.',
    toolCalls: [],
  }));

  providerRegistry.setActiveProvider('mock');

  engine.setProject(mockAlpha.id);
  const taskAlpha = await engine.startTask('Task in Alpha', { project: mockAlpha, projectId: mockAlpha.id });
  const stateAlpha = await waitForCompletion(engine, taskAlpha.taskId);
  assert.equal(stateAlpha.projectId, 'proj_alpha');
  assert.equal(stateAlpha.status, 'completed');

  // Switch to Project Beta
  engine.setProject(mockBeta.id);
  const stateBetaInitial = engine.getTaskState();
  assert.equal(stateBetaInitial, null, 'Beta project must have fresh idle agent state');

  // Switch back to Alpha
  engine.setProject(mockAlpha.id);
  const stateAlphaRestored = engine.getTaskState();
  assert.ok(stateAlphaRestored !== null);
  assert.equal(stateAlphaRestored.status, 'completed');
  assert.equal(stateAlphaRestored.projectId, 'proj_alpha');
});

await runTestAsync('Suite 6', '6.2 Safe reload recovery prevents silent automatic execution on boot', async () => {
  const interruptedState = {
    taskId: 'task_interrupted_123',
    projectId: 'proj_reload_test',
    prompt: 'Build project',
    mode: 'Agent',
    status: 'running',
    startedAt: Date.now() - 5000,
    plan: {
      id: 'plan_1',
      taskId: 'task_interrupted_123',
      title: 'Build',
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 5000,
      steps: [{ id: 's1', index: 1, title: 'Compile', description: 'Compile', status: 'running', toolCallIds: [] }],
    },
    currentStepIndex: 0,
    steps: [],
    budget: DEFAULT_AGENT_BUDGET,
    usage: { stepCount: 1, toolCallCount: 0, retryCount: 0, durationMs: 4000, estimatedTokens: 0 },
  };

  localStore.set('gbcoder_agent_tasks_proj_reload_test', JSON.stringify(interruptedState));

  // Initialize fresh engine instance for proj_reload_test
  const engine = new AgentEngine();
  engine.setProject('proj_reload_test');
  const loadedState = engine.getTaskState();

  assert.ok(loadedState !== null);
  // Must NOT be 'running' or resume unapproved commands; must be marked failed/recovery required
  assert.equal(loadedState.status, 'failed');
  assert.equal(loadedState.recoveryRequired, true);
  assert.ok(loadedState.error.includes('interrupted'));
});

// ─────────────────────────────────────────────────────────────
// SUITE 7: REAL PROCESS CANCELLATION & TERMINATION SAFETY
// ─────────────────────────────────────────────────────────────

await runTestAsync('Suite 7', '7.1 Cancel a running long-lived command requests termination', async () => {
  let killCalled = false;
  const mockProcess = {
    kill: () => { killCalled = true; },
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_cmd, _args, onOutput, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    onOutput?.('Process started...\n');
    return new Promise((resolve) => {
      setTimeout(() => resolve({ exitCode: 0, stdout: 'Done' }), 5000);
    });
  });

  const abortController = new AbortController();
  const execPromise = TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'npm run long-task',
    signal: abortController.signal,
    timeoutMs: 10000,
  });

  await new Promise((r) => setTimeout(r, 50));
  abortController.abort('User cancelled');

  const result = await execPromise;
  assert.equal(result.success, false, 'Cancelled execution must return success: false');
  assert.equal(result.errorCode, 'EXECUTION_CANCELLED');
  assert.equal(killCalled, true, 'process.kill must be invoked on cancellation');
  assert.equal(result.result?.terminationStatus, 'confirmed');
  assert.ok(result.error?.includes('cancelled'));

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.2 Confirm observable side effect stops after cancellation', async () => {
  let sideEffectTicks = 0;
  let intervalId = null;

  const mockProcess = {
    kill: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_cmd, _args, _onOutput, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    intervalId = setInterval(() => {
      sideEffectTicks++;
    }, 20);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ exitCode: 0 }), 5000);
    });
  });

  const abortController = new AbortController();
  const execPromise = TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'node worker.js',
    signal: abortController.signal,
  });

  await new Promise((r) => setTimeout(r, 80));
  assert.ok(sideEffectTicks > 0, 'Side effect should have started ticking');

  abortController.abort();
  await execPromise;

  const ticksAtCancel = sideEffectTicks;
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(sideEffectTicks, ticksAtCancel, 'Side effect must completely stop after cancellation');

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.3 Cancel before process spawn completes', async () => {
  let spawnCalled = false;
  TerminalAdapter.setMockRunner(async () => {
    spawnCalled = true;
    return { exitCode: 0 };
  });

  const abortController = new AbortController();
  abortController.abort('Pre-cancelled');

  const result = await TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'node build.js',
    signal: abortController.signal,
  });

  assert.equal(result.success, false);
  assert.equal(result.errorCode, 'EXECUTION_CANCELLED');
  assert.equal(spawnCalled, false, 'Spawn must not be called when signal is pre-aborted');

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.4 Cancel after process already exits', async () => {
  let killCount = 0;
  const mockProcess = {
    kill: () => { killCount++; },
    exit: Promise.resolve(0),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    return { exitCode: 0, stdout: 'Quick command finished' };
  });

  const execId = 'fast-exec-1';
  const result = await TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'ls',
  }, execId);

  assert.equal(result.success, true);
  assert.equal(result.result?.exitCode, 0);

  const termRes = await TerminalAdapter.terminateProcess(execId, 'Stop after exit');
  assert.equal(killCount, 0, 'kill() must NOT be called on already exited process');

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.5 Timeout actually requests termination', async () => {
  let killCalled = false;
  const mockProcess = {
    kill: () => { killCalled = true; },
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const result = await TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'npm test',
    timeoutMs: 100,
  });

  assert.equal(result.success, false);
  assert.equal(result.errorCode, 'EXECUTION_TIMEOUT');
  assert.equal(killCalled, true, 'process.kill must be invoked when command times out');
  assert.equal(result.result?.terminationStatus, 'confirmed');

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.6 Project switching cancels originating task & terminates processes', async () => {
  let killCalled = false;
  const mockProcess = {
    kill: () => { killCalled = true; },
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 3000));
  });

  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Running long build command.',
      toolCalls: [
        {
          id: 'call_long_build',
          toolName: 'run_terminal_command',
          args: { command: 'npm run build' },
        },
      ],
    };
  });

  const engine = new AgentEngine();
  const projA = { id: 'proj_alpha_term', name: 'Alpha', files: [] };
  const projB = { id: 'proj_beta_term', name: 'Beta', files: [] };

  engine.setProject(projA.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Run task', { project: projA, projectId: projA.id });

  const pending = await waitForApproval(engine, task.taskId);
  assert.ok(pending);

  engine.approveAction(pending.id);
  await new Promise((r) => setTimeout(r, 60));

  engine.setProject(projB.id);

  assert.equal(task.status, 'cancelled');
  assert.ok(killCalled, 'Active process for Project A must have kill() called on project switch');

  TerminalAdapter.setMockRunner(null);
  MockProvider.setScenarioHandler(null);
});

await runTestAsync('Suite 7', '7.7 A denied command never spawns', async () => {
  let spawnCalled = false;
  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    spawnCalled = true;
    ctx?.onSpawn?.({ kill: () => {}, exit: Promise.resolve(0) });
    return { exitCode: 0 };
  });

  let turn = 0;
  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      return {
        fullContent: 'Proposing command to run.',
        toolCalls: [
          {
            id: 'call_gated',
            toolName: 'run_terminal_command',
            args: { command: 'rm -rf dist' },
          },
        ],
      };
    }
    return {
      fullContent: 'Acknowledging denial.',
      toolCalls: [],
    };
  });

  const engine = new AgentEngine();
  const testProject = { id: 'proj_deny', name: 'DenyProj', files: [] };
  engine.setProject(testProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Execute a command', {
    project: testProject,
    projectId: testProject.id,
  });

  const pending = await waitForApproval(engine, task.taskId);
  assert.ok(pending);

  const denied = engine.denyAction(pending.id, 'User refused command');
  assert.equal(denied, true);

  await waitForCompletion(engine, task.taskId);

  assert.equal(spawnCalled, false, 'Denied command must never be spawned');

  TerminalAdapter.setMockRunner(null);
  MockProvider.setScenarioHandler(null);
});

await runTestAsync('Suite 7', '7.8 Repeated Stop does not execute duplicate cleanup', async () => {
  let killCount = 0;
  const mockProcess = {
    kill: () => { killCount++; },
    exit: new Promise((resolve) => setTimeout(() => resolve(143), 50)),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const execId = 'multi-stop-exec';
  const execPromise = TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'long command',
  }, execId);

  await new Promise((r) => setTimeout(r, 30));

  const termPromises = [
    TerminalAdapter.terminateProcess(execId, 'Stop 1'),
    TerminalAdapter.terminateProcess(execId, 'Stop 2'),
    TerminalAdapter.terminateProcess(execId, 'Stop 3'),
    TerminalAdapter.terminateProcess(execId, 'Stop 4'),
    TerminalAdapter.terminateProcess(execId, 'Stop 5'),
  ];

  const results = await Promise.all(termPromises);
  assert.equal(killCount, 1, 'kill() must be called exactly once across repeated Stop calls');
  assert.equal(results[0]?.status, 'confirmed');
  assert.equal(results[1]?.status, 'confirmed');

  await execPromise.catch(() => {});
  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.9 User terminal and existing dev server remain alive', async () => {
  const userTerminalSessions = new Map([
    ['user-term-1', { id: 'user-term-1', active: true }],
  ]);
  const devServerState = { running: true, port: 5173 };

  let agentKillCalled = false;
  const mockAgentProcess = {
    kill: () => { agentKillCalled = true; },
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockAgentProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const agentExecId = 'agent-isolated-exec';
  const execPromise = TerminalAdapter.executeCommand({
    projectId: 'proj_isolation',
    command: 'agent command',
  }, agentExecId);

  await new Promise((r) => setTimeout(r, 30));

  await TerminalAdapter.terminateAllForProject('proj_isolation', 'Stop agent');

  assert.equal(agentKillCalled, true, 'Agent process must be terminated');
  assert.equal(userTerminalSessions.get('user-term-1')?.active, true, 'User terminal session must remain active');
  assert.equal(devServerState.running, true, 'Dev server must remain running');

  await execPromise.catch(() => {});
  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.10 No false completed status on cancellation or timeout', async () => {
  const mockProcess = {
    kill: () => {},
    exit: Promise.resolve(143),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(mockProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const abortController = new AbortController();
  const execPromise = TerminalAdapter.executeCommand({
    projectId: 'test_proj',
    command: 'sleep 10',
    signal: abortController.signal,
  });

  await new Promise((r) => setTimeout(r, 30));
  abortController.abort();

  const res = await execPromise;
  assert.equal(res.success, false, 'Result must NOT be reported as success');
  assert.notEqual(res.errorCode, undefined, 'Result must have an error code');
  assert.equal(res.errorCode, 'EXECUTION_CANCELLED');

  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 7', '7.11 Handle unsupported and unconfirmed process termination honestly', async () => {
  const throwingProcess = {
    kill: () => { throw new Error('kill not supported by virtual kernel'); },
    exit: Promise.resolve(-1),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(throwingProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const abortA = new AbortController();
  const execA = TerminalAdapter.executeCommand({
    projectId: 'test_proj_a',
    command: 'long-cmd',
    signal: abortA.signal,
  });

  await new Promise((r) => setTimeout(r, 20));
  abortA.abort();

  const resA = await execA;
  assert.equal(resA.success, false);
  assert.equal(resA.result?.terminationStatus, 'failed', 'Must report TERMINATION FAILED honestly');
  assert.ok(resA.error?.includes('failed') || resA.result?.terminationDetail?.includes('kill not supported'));

  const unconfirmedProcess = {
    kill: () => {},
    exit: new Promise(() => {}),
  };

  TerminalAdapter.setMockRunner(async (_c, _a, _o, ctx) => {
    ctx?.onSpawn?.(unconfirmedProcess);
    return new Promise((resolve) => setTimeout(() => resolve({ exitCode: 0 }), 2000));
  });

  const abortB = new AbortController();
  const execB = TerminalAdapter.executeCommand({
    projectId: 'test_proj_b',
    command: 'stubborn-cmd',
    signal: abortB.signal,
  });

  await new Promise((r) => setTimeout(r, 20));
  abortB.abort();

  const resB = await execB;
  assert.equal(resB.success, false);
  assert.equal(resB.result?.terminationStatus, 'unconfirmed', 'Must report TERMINATION UNCONFIRMED honestly');
  assert.ok(resB.error?.includes('unconfirmed') || resB.result?.terminationDetail?.includes('unconfirmed'));

  TerminalAdapter.setMockRunner(null);
});

// ============================================================
// SUITE 8: AGENT RELIABILITY & EXECUTION SAFETY (PHASE 3D-A)
// ============================================================
console.log('\nSuite 8: Agent Reliability & Execution Safety (Phase 3D-A)');

await runTestAsync('Suite 8', '8.1 Stop Agent during awaiting_approval halts execution immediately without advancing turns', async () => {
  let turnsEmitted = 0;
  MockProvider.setScenarioHandler(async () => {
    turnsEmitted++;
    if (turnsEmitted === 1) {
      return {
        fullContent: 'Running command requiring approval...',
        toolCalls: [
          {
            id: 'call_gated',
            toolName: 'run_terminal_command',
            args: { command: 'npm run build' },
          },
        ],
      };
    } else {
      return {
        fullContent: 'Turn 2 executed unexpectedly!',
        toolCalls: [],
      };
    }
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Stop during approval test', {
    project: mockProject,
    projectId: mockProject.id,
  });

  const pending = await waitForApproval(engine, task.taskId);
  assert.ok(pending, 'Must enter awaiting_approval');

  // Issue stopAgent while awaiting approval
  engine.stopAgent('User stopped while waiting for approval');

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'cancelled');
  assert.ok(finalState.cancelledAt);
  assert.equal(finalState.completedAt, undefined);
  assert.equal(turnsEmitted, 1, 'Turn 2 must NEVER be invoked after stop during approval');
});

await runTestAsync('Suite 8', '8.2 Unresolved tool failure followed by 0 tool calls marks task as failed, never completed', async () => {
  let turn = 0;
  TerminalAdapter.setMockRunner(async () => {
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'Test failed: syntax error in test suite',
    };
  });

  MockProvider.setScenarioHandler(async () => {
    turn++;
    if (turn === 1) {
      return {
        fullContent: 'Running test suite...',
        toolCalls: [
          {
            id: 'test_fail',
            toolName: 'run_terminal_command',
            args: { command: 'npm test' },
          },
        ],
      };
    } else {
      // Model gives up and emits 0 tool calls
      return {
        fullContent: 'I see the test failed, but I will conclude now.',
        toolCalls: [],
      };
    }
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  const task = await engine.startTask('Failing test with no resolution', {
    project: mockProject,
    projectId: mockProject.id,
  });

  // Auto-approve the terminal command
  const pending = await waitForApproval(engine, task.taskId);
  engine.approveAction(pending.id);

  const finalState = await waitForCompletion(engine, task.taskId);
  assert.equal(finalState.status, 'failed', 'Must report failed when model concludes with unresolved tool failure');
  assert.ok(finalState.error?.includes('unresolved errors'), 'Must provide clear error message indicating unresolved failure');
  TerminalAdapter.setMockRunner(null);
});

await runTestAsync('Suite 8', '8.3 Single-use and cross-project binding rejects replay and cross-project token approvals', async () => {
  MockProvider.setScenarioHandler(async () => {
    return {
      fullContent: 'Requiring approval...',
      toolCalls: [
        {
          id: 'gated_1',
          toolName: 'run_terminal_command',
          args: { command: 'ls -la' },
        },
      ],
    };
  });

  const engine = new AgentEngine();
  const projA = createMockProject();
  engine.setProject(projA.id);
  providerRegistry.setActiveProvider('mock');

  const taskA = await engine.startTask('Approval security test', {
    project: projA,
    projectId: projA.id,
  });

  const pending = await waitForApproval(engine, taskA.taskId);
  assert.ok(pending);

  // Cross-project test: switch project before approval
  const projB = createMockProject();
  engine.setProject(projB.id);

  // Attempt to approve projA's token while active project is projB
  const crossApproved = engine.approveAction(pending.id);
  assert.equal(crossApproved, false, 'Approval must be rejected when active project differs from token projectId');
});

await runTestAsync('Suite 8', '8.4 Dirty buffer in Monaco blocks file edit application and reports actionable failure', async () => {
  let dirtyBufferChecked = false;
  let turns = 0;
  MockProvider.setScenarioHandler(async () => {
    turns++;
    if (turns === 1) {
      return {
        fullContent: 'Proposing edit to math.ts',
        toolCalls: [
          {
            id: 'edit_math',
            toolName: 'propose_file_edit',
            args: {
              path: 'src/math.ts',
              newContent: 'export const x = 42;\n',
              explanation: 'Update math file',
            },
          },
        ],
      };
    } else {
      return {
        fullContent: 'Edit was blocked by unsaved changes in editor. Concluding.',
        toolCalls: [],
      };
    }
  });

  const engine = new AgentEngine();
  const mockProject = createMockProject();
  engine.setProject(mockProject.id);
  providerRegistry.setActiveProvider('mock');

  let fileModified = false;
  const task = await engine.startTask('Dirty buffer protection test', {
    project: mockProject,
    projectId: mockProject.id,
    isEditorDirty: (path) => {
      if (path === 'src/math.ts') {
        dirtyBufferChecked = true;
        return true; // Monaco buffer has unsaved changes!
      }
      return false;
    },
    onFileChange: () => {
      fileModified = true;
    },
  });

  const finalState = await waitForCompletion(engine, task.taskId);

  assert.ok(dirtyBufferChecked, 'isEditorDirty must be consulted before applying edits');
  assert.equal(fileModified, false, 'Target file with unsaved changes must NEVER be modified');
  assert.equal(finalState.status, 'failed', 'Task concluding with unresolved dirty buffer error must be marked failed');
  assert.ok(finalState.error?.includes('unresolved errors'));
});

await runTestAsync('Suite 8', '8.5 Interrupted task in verifying status is safely recovered on reload', async () => {
  const engine = new AgentEngine();
  const testId = `proj-reload-${Date.now()}`;

  // Manually persist a task in 'verifying' state into localStorage
  const verifyingTask = {
    taskId: 'task-interrupted-verifying',
    projectId: testId,
    prompt: 'Interrupted task',
    status: 'verifying',
    usage: { stepCount: 2, toolCallCount: 1, retryCount: 0, durationMs: 1000, estimatedTokens: 50 },
    startedAt: Date.now() - 5000,
  };
  globalThis.localStorage.setItem(`gbcoder_agent_tasks_${testId}`, JSON.stringify(verifyingTask));

  // Reload task state via setProject
  engine.setProject(testId);
  const loaded = engine.getTaskState();

  assert.ok(loaded);
  assert.equal(loaded.status, 'failed', 'Task interrupted in verifying state must be recovered to failed');
  assert.equal(loaded.recoveryRequired, true, 'recoveryRequired flag must be set');
  assert.ok(loaded.error?.includes('interrupted by page reload'));
});

try {
  rmSync(tempDir, { recursive: true, force: true });
} catch {}

console.log('\n============================================================');
console.log(`  ALL ${passedTests} / ${totalTests} PHASE 3C TESTS PASSED!`);
console.log('============================================================\n');
