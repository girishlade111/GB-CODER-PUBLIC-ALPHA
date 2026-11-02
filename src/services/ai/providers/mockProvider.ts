/**
 * Deterministic Mock AI Provider for testing and local offline exploration.
 *
 * Simulates chunked streaming, reasoning, structured edit proposals,
 * and cancellation without incurring API costs or requiring network access.
 */

import {
  AiModelInfo,
  ChatCompletionChunk,
  ConnectionDiagnosticResult,
} from '../types.ts';
import { IAiProvider, StreamChatOptions } from './baseProvider.ts';

export class MockProvider implements IAiProvider {
  public readonly id = 'mock' as const;
  public readonly name = 'Mock Test Provider';
  public readonly defaultBaseUrl = 'mock://local';

  private readonly defaultModels: AiModelInfo[] = [
    {
      id: 'mock-coder-fast',
      name: 'Mock Coder (Fast)',
      provider: 'mock',
      contextWindow: 128000,
      description: 'Local simulated AI model with zero latency for automated tests',
      recommended: true,
      supportsStreaming: true,
    },
    {
      id: 'mock-coder-reasoning',
      name: 'Mock Coder (Reasoning)',
      provider: 'mock',
      contextWindow: 128000,
      description: 'Simulates extended thinking/reasoning traces before generating code',
      recommended: false,
      supportsStreaming: true,
    },
  ];

  public getAvailableModels(): AiModelInfo[] {
    return this.defaultModels;
  }

  private static scenarioHandler: ((
    messages: Array<any>,
    options: StreamChatOptions
  ) => { fullContent: string; reasoning?: string; toolCalls?: import('../tools/types').ToolCallRecord[] } | null) | null = null;

  public static setScenarioHandler(handler: typeof MockProvider.scenarioHandler): void {
    this.scenarioHandler = handler;
  }

  public async streamChat(
    messages: Array<import('./baseProvider.ts').ProviderChatMessage | { role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{ fullContent: string; reasoning?: string; toolCalls?: import('../tools/types').ToolCallRecord[] }> {
    // Check if a custom test scenario handler is configured
    if (MockProvider.scenarioHandler) {
      const rawRes = await Promise.resolve(MockProvider.scenarioHandler(messages, options));
      if (rawRes) {
        const fullContent = rawRes.fullContent || (rawRes as any).text || '';
        const reasoning = rawRes.reasoning;
        const rawToolCalls = rawRes.toolCalls || [];
        const toolCalls = rawToolCalls.map((tc: any) => ({
          ...tc,
          args: tc.args || tc.params || {},
        }));

        if (reasoning) {
          onChunk({ reasoningDelta: reasoning });
        }
        if (fullContent) {
          onChunk({ contentDelta: fullContent });
        }
        for (const tc of toolCalls) {
          onChunk({
            toolCallDelta: {
              id: tc.id,
              name: tc.toolName,
              argumentsDelta: JSON.stringify(tc.args),
            },
          });
        }
        onChunk({ isComplete: true });
        return { fullContent, reasoning, toolCalls };
      }
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const lastToolMsg = [...messages].reverse().find((m) => m.role === 'tool');
    const lastMsg = messages[messages.length - 1];
    const isToolContinuation = lastMsg?.role === 'tool';

    // Simulated reasoning
    let reasoning = '';
    if (options.model === 'mock-coder-reasoning' || lastUserMsg.toLowerCase().includes('reason')) {
      const isLongRunning = lastUserMsg.toLowerCase().includes('long running');
      const delay = isLongRunning ? 80 : 15;
      const repeats = isLongRunning ? 3 : 1;
      const reasoningWords = [
        'Analyzing ', 'project ', 'workspace ', 'files...\n',
        'Examining ', 'dependencies ', 'and ', 'active ', 'buffer...\n',
        'Planning ', 'safe ', 'code ', 'modifications.\n',
      ];
      for (let r = 0; r < repeats; r++) {
        for (const word of reasoningWords) {
          if (options.signal?.aborted) {
            throw new Error('Mock generation aborted');
          }
          reasoning += word;
          onChunk({ reasoningDelta: word });
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    // Determine simulated response and tool calls based on conversation phase
    let responseText = '';
    const toolCalls: import('../tools/types').ToolCallRecord[] = [];
    const { ToolExecutor } = await import('../tools/toolExecutor.ts');

    const lower = lastUserMsg.toLowerCase();
    const isAgentTask = lower.includes('agent') || lower.includes('autonomous') || lower.includes('fix') || lower.includes('task');

    if (isToolContinuation && lastToolMsg) {
      // We are in a subsequent turn of a tool-calling loop!
      const toolContent = String(lastToolMsg.content || '');

      const toolName = 'name' in lastToolMsg ? (lastToolMsg as { name?: string }).name : undefined;

      if (toolName === 'read_file') {
        // Step 2: After reading file, propose an edit
        responseText = `I have analyzed the workspace file. I will now propose the required code modifications.`;
        if (options.tools?.some((t) => t.name === 'propose_file_edit')) {
          toolCalls.push(
            ToolExecutor.createToolCallRecord('propose_file_edit', {
              path: 'src/App.tsx',
              newContent:
                `import React, { useState } from 'react';\n\n` +
                `export function App() {\n` +
                `  const [count, setCount] = useState(0);\n` +
                `  return (\n` +
                `    <div className="p-6 bg-slate-900 text-white min-h-screen">\n` +
                `      <h1 className="text-2xl font-bold">Autonomous Fix Applied</h1>\n` +
                `      <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>\n` +
                `    </div>\n` +
                `  );\n` +
                `}\n`,
              explanation: 'Implement required interactive count feature.',
            })
          );
        }
      } else if (toolName === 'propose_file_edit' || toolContent.includes('proposal applied') || toolContent.includes('success')) {
        // Step 3: After edit, run verification test
        responseText = `The code edits have been applied. Running verification tests inside WebContainer.`;
        if (options.tools?.some((t) => t.name === 'run_terminal_command')) {
          toolCalls.push(
            ToolExecutor.createToolCallRecord('run_terminal_command', {
              command: 'npm test',
              explanation: 'Verify code modifications with test suite.',
            })
          );
        }
      } else if (toolName === 'run_terminal_command') {
        // Step 4: Analyze test output
        if (toolContent.includes('FAIL') || toolContent.includes('fail') || toolContent.includes('error') || toolContent.includes('exit code: 1')) {
          // Failure recovery turn!
          responseText = `The test run failed. Diagnosing the error and proposing a corrective patch to resolve the issue.`;
          if (options.tools?.some((t) => t.name === 'propose_file_edit')) {
            toolCalls.push(
              ToolExecutor.createToolCallRecord('propose_file_edit', {
                path: 'src/App.tsx',
                newContent:
                  `import React from 'react';\n\n` +
                  `export function App() {\n` +
                  `  return <div className="p-6 bg-slate-900 text-white">Corrected Passing App</div>;\n` +
                  `}\n`,
                explanation: 'Corrective patch fixing test failure.',
              })
            );
          }
        } else {
          // Success! Complete task with evidence
          responseText =
            `✅ **Task Completed Successfully**\n\n` +
            `Verification command passed with exit code 0:\n` +
            `\`\`\`\n${toolContent.slice(0, 500)}\n\`\`\`\n\n` +
            `All planned steps have been executed and verified in the workspace.`;
        }
      } else {
        responseText = `Received tool output. Verification complete.`;
      }
    } else {
      // First turn of the conversation
      if (lower.includes('hello') || lower.includes('hi')) {
        responseText = `Hello! I am GB Assist, your in-browser AI pair programmer. I can help analyze your code, plan features, and propose safe edits.`;
      } else if (isAgentTask && lower.includes('worker') && options.tools?.some((t) => t.name === 'run_terminal_command')) {
        responseText = `I will run the background worker process in the workspace.`;
        toolCalls.push(
          ToolExecutor.createToolCallRecord('run_terminal_command', {
            command: 'node worker.js',
            explanation: 'Run background worker process.',
          })
        );
      } else if (isAgentTask && options.tools?.some((t) => t.name === 'read_file')) {
        // Autonomous agent start: begin by inspecting workspace
        responseText = `I am initiating the autonomous coding task. First, I will inspect the workspace file.`;
        toolCalls.push(ToolExecutor.createToolCallRecord('read_file', { path: 'src/App.tsx' }));
      } else if (lower.includes('edit') || lower.includes('button') || lower.includes('change')) {
        responseText =
          `I have generated the requested changes for your project:\n\n` +
          `<proposed_edit path="src/App.tsx" action="modify">\n` +
          `import React, { useState } from 'react';\n\n` +
          `export function App() {\n` +
          `  const [count, setCount] = useState(0);\n` +
          `  return (\n` +
          `    <div className="p-6 bg-slate-900 text-white min-h-screen">\n` +
          `      <h1 className="text-2xl font-bold">Updated App by GB Assist</h1>\n` +
          `      <button\n` +
          `        onClick={() => setCount(c => c + 1)}\n` +
          `        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition"\n` +
          `      >\n` +
          `        Clicks: {count}\n` +
          `      </button>\n` +
          `    </div>\n` +
          `  );\n` +
          `}\n` +
          `</proposed_edit>\n\n` +
          `You can review the diff and apply or reject the proposed changes below.`;
      } else if (lower.includes('new file') || lower.includes('create file')) {
        responseText =
          `I have created a new utility file for your workspace:\n\n` +
          `<proposed_edit path="src/utils/math.ts" action="create">\n` +
          `export function add(a: number, b: number): number {\n` +
          `  return a + b;\n` +
          `}\n\n` +
          `export function multiply(a: number, b: number): number {\n` +
          `  return a * b;\n` +
          `}\n` +
          `</proposed_edit>\n\n` +
          `Ready to review and create in your workspace.`;
      } else {
        responseText = `I received your request: "${lastUserMsg}". Workspace context is mounted and verified.`;
      }

      // Single-turn tool calls if specifically requested in prompt
      if (toolCalls.length === 0 && options.tools && options.tools.length > 0) {
        if (lower.includes('read') && options.tools.some((t) => t.name === 'read_file')) {
          const filePath = lower.includes('.tsx') ? 'src/App.tsx' : 'package.json';
          toolCalls.push(ToolExecutor.createToolCallRecord('read_file', { path: filePath }));
        } else if (lower.includes('list') && options.tools.some((t) => t.name === 'list_directory')) {
          toolCalls.push(ToolExecutor.createToolCallRecord('list_directory', { path: 'src' }));
        } else if (lower.includes('search files') && options.tools.some((t) => t.name === 'search_files')) {
          toolCalls.push(ToolExecutor.createToolCallRecord('search_files', { query: '*.tsx' }));
        } else if (lower.includes('search code') && options.tools.some((t) => t.name === 'search_code')) {
          toolCalls.push(ToolExecutor.createToolCallRecord('search_code', { pattern: 'useState' }));
        } else if (lower.includes('structure') && options.tools.some((t) => t.name === 'get_project_structure')) {
          toolCalls.push(ToolExecutor.createToolCallRecord('get_project_structure', { maxDepth: 3 }));
        } else if (lower.includes('diagnostics') && options.tools.some((t) => t.name === 'get_diagnostics')) {
          toolCalls.push(ToolExecutor.createToolCallRecord('get_diagnostics', {}));
        } else if (
          !lower.includes('long running') &&
          (lower.includes('terminal') || lower.includes('command') || lower.includes('run test') || lower.includes('npm test')) &&
          options.tools.some((t) => t.name === 'run_terminal_command')
        ) {
          toolCalls.push(
            ToolExecutor.createToolCallRecord('run_terminal_command', {
              command: 'npm test',
              explanation: 'Running project unit tests inside WebContainer.',
            })
          );
        }
      }
    }

    if (toolCalls.length > 0 && responseText.startsWith('I received your request')) {
      responseText = `I will invoke tool "${toolCalls[0].toolName}" to perform this task in your project.`;
    }

    // Stream out words
    const words = responseText.split(/(?<=\s)/);
    let fullContent = '';

    for (const word of words) {
      if (options.signal?.aborted) {
        throw new Error('Mock generation aborted');
      }
      fullContent += word;
      onChunk({ contentDelta: word });
      await new Promise((r) => setTimeout(r, 10));
    }

    // Stream tool call delta if present
    for (const tc of toolCalls) {
      onChunk({
        toolCallDelta: {
          id: tc.id,
          name: tc.toolName,
          argumentsDelta: JSON.stringify(tc.args),
        },
      });
    }

    onChunk({ isComplete: true });
    return {
      fullContent,
      reasoning: reasoning || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  public async testConnection(
    _apiKey: string,
    _baseUrl?: string,
    _modelId?: string,
    _customHeaders?: Record<string, string>,
    _consentToInference?: boolean
  ): Promise<ConnectionDiagnosticResult> {
    return {
      success: true,
      latencyMs: 5,
      message: 'Mock test provider operational (offline verified).',
    };
  }
}
