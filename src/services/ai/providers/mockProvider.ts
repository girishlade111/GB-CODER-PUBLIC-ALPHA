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

  public async streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{ fullContent: string; reasoning?: string }> {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';

    // Simulated reasoning
    let reasoning = '';
    if (options.model === 'mock-coder-reasoning' || lastUserMsg.toLowerCase().includes('reason')) {
      const reasoningWords = [
        'Analyzing ', 'project ', 'workspace ', 'files...\n',
        'Examining ', 'dependencies ', 'and ', 'active ', 'buffer...\n',
        'Planning ', 'safe ', 'code ', 'modifications.\n',
      ];
      for (const word of reasoningWords) {
        if (options.signal?.aborted) {
          throw new Error('Mock generation aborted');
        }
        reasoning += word;
        onChunk({ reasoningDelta: word });
        await new Promise((r) => setTimeout(r, 15));
      }
    }

    // Determine simulated response based on prompt
    let responseText = '';
    if (lastUserMsg.toLowerCase().includes('hello') || lastUserMsg.toLowerCase().includes('hi')) {
      responseText = `Hello! I am GB Assist, your in-browser AI pair programmer. I can help analyze your code, plan features, and propose safe edits.`;
    } else if (lastUserMsg.toLowerCase().includes('edit') || lastUserMsg.toLowerCase().includes('button') || lastUserMsg.toLowerCase().includes('change')) {
      responseText = `I have generated the requested changes for your project:\n\n` +
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
    } else if (lastUserMsg.toLowerCase().includes('new file') || lastUserMsg.toLowerCase().includes('create file')) {
      responseText = `I have created a new utility file for your workspace:\n\n` +
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

    onChunk({ isComplete: true });
    return { fullContent, reasoning: reasoning || undefined };
  }

  public async testConnection(_apiKey: string): Promise<ConnectionDiagnosticResult> {
    return {
      success: true,
      latencyMs: 5,
      message: 'Mock test provider operational (offline verified).',
    };
  }
}
