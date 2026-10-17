/**
 * Project-Aware Context Builder for GB Assist.
 *
 * Responsibilities:
 * - Scans and attaches active editor file.
 * - Extracts `@` file mentions from user prompt.
 * - Enforces strict project isolation (no cross-project leakage).
 * - Manages token/character budget to prevent context overflow.
 * - Formats system instructions and context blocks clearly for LLMs.
 */

import { MultiFileProject } from '../../types/files.ts';
import { AssembledProjectContext, ContextFileReference } from './types.ts';

// Rough token estimation: 1 token ~= 4 chars of English/code
export const estimateTokens = (input: string | number): number => {
  const chars = typeof input === 'string' ? input.length : (typeof input === 'number' && !isNaN(input) ? input : 0);
  return Math.max(0, Math.ceil(chars / 4));
};

// Default context budget: ~16,000 tokens (approx 64,000 characters)
export const DEFAULT_CONTEXT_BUDGET_TOKENS = 16000;
const MAX_SINGLE_FILE_CHARS = 24000; // max ~6000 tokens per file before truncation

export class ContextBuilder {
  /**
   * Extracts `@path/to/file` mentions from the user prompt text.
   */
  public static extractAtMentions(prompt: string, projectFiles: Array<{ path: string }>): string[] {
    const mentions: string[] = [];
    const regex = /@([a-zA-Z0-9_\-./]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(prompt)) !== null) {
      const candidate = match[1];
      // Check if it matches an actual file path in the project
      const found = projectFiles.find(
        (f) =>
          f.path.toLowerCase() === candidate.toLowerCase() ||
          f.path.toLowerCase().endsWith(`/${candidate.toLowerCase()}`)
      );
      if (found && !mentions.includes(found.path)) {
        mentions.push(found.path);
      }
    }

    return mentions;
  }

  /**
   * Assembles the full project context based on active file, user attached files, and prompt mentions.
   */
  public static assembleContext(
    project: MultiFileProject,
    activePath?: string | null,
    attachedPaths: string[] = [],
    prompt = '',
    budgetTokens = DEFAULT_CONTEXT_BUDGET_TOKENS
  ): AssembledProjectContext {
    const includedMap = new Map<string, ContextFileReference>();
    const atMentions = this.extractAtMentions(prompt, project.files);

    // Helper to add a file with budget tracking
    const addFile = (filePath: string, reason: 'active_file' | 'user_attached' | 'at_mention') => {
      const file = project.files.find((f) => f.path === filePath);
      if (!file || includedMap.has(filePath)) return;

      const rawContent = file.content ?? '';
      let content = rawContent;
      let isTruncated = false;

      if (rawContent.length > MAX_SINGLE_FILE_CHARS) {
        content = `${rawContent.slice(0, MAX_SINGLE_FILE_CHARS)}\n\n// ... [File content truncated to respect context budget] ...`;
        isTruncated = true;
      }

      const lines = content.split('\n').length;
      const charCount = content.length;

      includedMap.set(filePath, {
        path: file.path,
        content,
        language: file.language || 'plaintext',
        linesCount: lines,
        charCount,
        isTruncated,
        reason,
      });
    };

    // 1. Add active file first (highest priority)
    if (activePath) {
      addFile(activePath, 'active_file');
    }

    // 2. Add files explicitly mentioned via `@`
    for (const mention of atMentions) {
      addFile(mention, 'at_mention');
    }

    // 3. Add user attached files
    for (const attached of attachedPaths) {
      addFile(attached, 'user_attached');
    }

    // Calculate total tokens
    const files = Array.from(includedMap.values());
    const totalChars = files.reduce((acc, f) => acc + f.charCount, 0);
    const totalEstimatedTokens = estimateTokens(totalChars);
    const isOverBudget = totalEstimatedTokens > budgetTokens;

    const summary = files.length > 0
      ? `${files.length} file(s) in context (~${totalEstimatedTokens.toLocaleString()} tokens)`
      : 'No files in context';

    return {
      activeFilePath: activePath || undefined,
      files,
      totalEstimatedTokens,
      budgetTokens,
      isOverBudget,
      summary,
    };
  }

  /**
   * Builds the system prompt string that instructs the model on its role,
   * project architecture, and structured edit proposal format.
   */
  public static buildSystemPrompt(context: AssembledProjectContext, projectType = 'react'): string {
    let contextBlock = '';

    if (context.files.length > 0) {
      contextBlock = '\n\n=== RELEVANT PROJECT CONTEXT FILES ===\n';
      for (const file of context.files) {
        contextBlock += `\n--- File: ${file.path} (${file.language}, ${file.linesCount} lines) ---\n`;
        contextBlock += file.content;
        contextBlock += '\n--- End File ---\n';
      }
    }

    return `You are GB Assist, an expert AI pair programmer built directly into the GB Coder browser IDE (LadeStack).
You are working on a ${projectType} project running in an interactive WebContainer environment.

GUIDELINES:
1. Provide accurate, production-ready, clean TypeScript/JavaScript/CSS/HTML code.
2. Explain key rationale concisely before providing code.
3. Keep project security, accessibility, and modern conventions in mind.

STRUCTURED CODE EDITS:
When you propose creating or modifying a file in the project, you MUST wrap the full updated file content in a structured block so the IDE can parse it and render a visual Monaco Diff review for the user:

<proposed_edit path="exact/file/path.ext" action="modify">
// Full code of the file here
</proposed_edit>

Or for new files:
<proposed_edit path="exact/file/path.ext" action="create">
// Full code of the new file here
</proposed_edit>

The user will review your proposed changes with side-by-side diffs and click "Apply" to save them to their workspace.
${contextBlock}`;
  }
}
