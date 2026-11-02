/**
 * Context Budget and Conversation Token Management for GB Assist (Phase 3D-B).
 *
 * Enforces model context windows, reserves tokens for output/tools/safety,
 * and prunes conversation history while preserving Atomic Tool Blocks
 * (never splitting assistant tool calls from their matching tool responses).
 */

import { ProviderChatMessage } from './providers/baseProvider.ts';

// Deterministic token estimation: 1 token ~= 4 chars of English/code
export const estimateTokens = (input: string | number | undefined | null): number => {
  if (input === null || input === undefined) return 0;
  const chars = typeof input === 'string' ? input.length : (typeof input === 'number' && !isNaN(input) ? input : 0);
  return Math.max(0, Math.ceil(chars / 4));
};

export interface ContextBudgetBreakdown {
  modelContextWindow: number;
  outputReserve: number;
  toolReserve: number;
  systemReserve: number;
  effectiveInputBudget: number;
}

export interface PruneHistoryOptions {
  preserveSystemPrompt?: boolean;
  preserveInitialUserPrompt?: boolean;
}

export class ContextBudget {
  public static readonly DEFAULT_OUTPUT_RESERVE = 4096;
  public static readonly DEFAULT_TOOL_RESERVE = 1500;
  public static readonly DEFAULT_SYSTEM_RESERVE = 2000;

  /**
   * Calculates the effective input token budget available for conversation history
   * and project context files after deducting necessary generation and safety reserves.
   */
  public static calculateBudget(
    modelContextWindow = 128000,
    options?: {
      maxOutputTokens?: number;
      hasTools?: boolean;
      systemReserve?: number;
    }
  ): ContextBudgetBreakdown {
    const outputReserve = options?.maxOutputTokens ?? this.DEFAULT_OUTPUT_RESERVE;
    const toolReserve = options?.hasTools !== false ? this.DEFAULT_TOOL_RESERVE : 0;
    const systemReserve = options?.systemReserve ?? this.DEFAULT_SYSTEM_RESERVE;

    const totalReserves = outputReserve + toolReserve + systemReserve;
    const effectiveInputBudget = Math.max(2000, modelContextWindow - totalReserves);

    return {
      modelContextWindow,
      outputReserve,
      toolReserve,
      systemReserve,
      effectiveInputBudget,
    };
  }

  /**
   * Estimates tokens for a single provider message.
   */
  public static estimateMessageTokens(msg: any): number {
    let chars = 0;
    if (typeof msg.content === 'string') {
      chars += msg.content.length;
    } else if (msg.content) {
      chars += JSON.stringify(msg.content).length;
    }

    if (msg.name) chars += msg.name.length;
    if (msg.toolCallId) chars += msg.toolCallId.length;

    if (Array.isArray(msg.toolCalls)) {
      for (const tc of msg.toolCalls) {
        chars += (tc.toolName || tc.name || '').length;
        chars += (tc.id || '').length;
        chars += (tc.rawArgs || JSON.stringify(tc.args || '')).length;
      }
    }

    // Baseline metadata overhead per message (~10 tokens)
    return estimateTokens(chars) + 10;
  }

  /**
   * Groups messages into Atomic Blocks.
   * An assistant message with toolCalls AND all immediately following tool responses
   * form ONE indivisible Atomic Tool Block. Pruning must never split this block.
   */
  public static groupIntoAtomicBlocks(
    messages: Array<ProviderChatMessage | { role: string; content: string; [key: string]: any }>
  ): Array<{ messages: any[]; totalTokens: number; isToolBlock: boolean }> {
    const blocks: Array<{ messages: any[]; totalTokens: number; isToolBlock: boolean }> = [];
    let i = 0;

    while (i < messages.length) {
      const msg = messages[i];

      // Check if this is an assistant message initiating tool calls
      const hasToolCalls =
        msg.role === 'assistant' &&
        Array.isArray((msg as any).toolCalls) &&
        (msg as any).toolCalls.length > 0;

      if (hasToolCalls) {
        // Collect assistant message and all subsequent tool messages
        const blockMessages: any[] = [msg];
        let j = i + 1;
        while (j < messages.length && messages[j].role === 'tool') {
          blockMessages.push(messages[j]);
          j++;
        }

        const totalTokens = blockMessages.reduce(
          (acc, m) => acc + this.estimateMessageTokens(m),
          0
        );

        blocks.push({
          messages: blockMessages,
          totalTokens,
          isToolBlock: true,
        });

        i = j;
      } else {
        // Single message block (user, system, or plain assistant)
        const totalTokens = this.estimateMessageTokens(msg);
        blocks.push({
          messages: [msg],
          totalTokens,
          isToolBlock: false,
        });
        i++;
      }
    }

    return blocks;
  }

  /**
   * Prunes conversation history to fit within a target token budget.
   * Guarantees that Atomic Tool Blocks are never severed, preventing
   * OpenAI 400 Bad Request and Gemini role-alternation errors.
   */
  public static pruneConversationHistory<T extends ProviderChatMessage | { role: string; content: string; [key: string]: any }>(
    messages: T[],
    targetBudgetTokens: number,
    options?: PruneHistoryOptions
  ): T[] {
    if (!messages || messages.length === 0) return [];

    const preserveSystem = options?.preserveSystemPrompt !== false;
    const preserveInitialUser = options?.preserveInitialUserPrompt !== false;

    const blocks = this.groupIntoAtomicBlocks(messages);
    const totalTokens = blocks.reduce((acc, b) => acc + b.totalTokens, 0);

    // If already within budget, return intact
    if (totalTokens <= targetBudgetTokens) {
      return messages;
    }

    // Separate protected header blocks from prunable conversation blocks
    let systemBlock: { messages: any[]; totalTokens: number; isToolBlock: boolean } | undefined = undefined;
    let initialUserBlock: { messages: any[]; totalTokens: number; isToolBlock: boolean } | undefined = undefined;
    const prunableBlocks: Array<{ messages: any[]; totalTokens: number; isToolBlock: boolean }> = [];

    let startIndex = 0;
    if (preserveSystem && blocks[0] && blocks[0].messages[0]?.role === 'system') {
      systemBlock = blocks[0];
      startIndex = 1;
    }

    if (preserveInitialUser && blocks[startIndex] && blocks[startIndex].messages[0]?.role === 'user') {
      initialUserBlock = blocks[startIndex];
      startIndex++;
    }

    for (let k = startIndex; k < blocks.length; k++) {
      prunableBlocks.push(blocks[k]);
    }

    // Calculate budget remaining for prunable history
    const protectedTokens =
      (systemBlock ? systemBlock.totalTokens : 0) +
      (initialUserBlock ? initialUserBlock.totalTokens : 0);

    const availableForPrunable = Math.max(1000, targetBudgetTokens - protectedTokens);

    // Prune oldest blocks from prunableBlocks until total tokens fit
    let currentPrunableTokens = prunableBlocks.reduce((acc, b) => acc + b.totalTokens, 0);
    while (prunableBlocks.length > 1 && currentPrunableTokens > availableForPrunable) {
      const removed = prunableBlocks.shift();
      if (removed) {
        currentPrunableTokens -= removed.totalTokens;
      }
    }

    // Reassemble surviving blocks in chronological order
    const survivingBlocks: Array<{ messages: any[] }> = [];
    if (systemBlock) survivingBlocks.push(systemBlock);
    if (initialUserBlock) survivingBlocks.push(initialUserBlock);
    survivingBlocks.push(...prunableBlocks);

    const result: T[] = [];
    for (const block of survivingBlocks) {
      for (const m of block.messages) {
        result.push(m);
      }
    }

    return result;
  }

  /**
   * Validates whether a prompt or context payload fits within the given budget.
   */
  public static validatePromptFitsContext(
    promptTokens: number,
    budgetTokens: number
  ): { fits: boolean; overflowTokens: number; message?: string } {
    if (promptTokens <= budgetTokens) {
      return { fits: true, overflowTokens: 0 };
    }
    const overflow = promptTokens - budgetTokens;
    return {
      fits: false,
      overflowTokens: overflow,
      message: `Context Overflow: Payload (~${promptTokens.toLocaleString()} tokens) exceeds budget (~${budgetTokens.toLocaleString()} tokens) by ~${overflow.toLocaleString()} tokens.`,
    };
  }
}
