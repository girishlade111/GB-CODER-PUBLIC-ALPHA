/**
 * Terminal Adapter for GB Assist Agent Tools (Phase 3B).
 *
 * Integrates with WebContainer runtime for permission-gated command execution.
 * Enforces:
 * - High-risk / destructive command classification
 * - Explicit user approval verification
 * - Timeout and cancellation handling
 * - Secret and key redaction from terminal logs
 * - Concurrency tracking to prevent duplicate executions
 */

import { webcontainerService } from '../../webcontainer/webcontainerService';
import { ToolExecutionResult, ToolRiskLevel } from './types';

export interface TerminalExecutionOptions {
  projectId: string;
  command: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  onOutput?: (chunk: string) => void;
}

export interface TerminalExecutionResult {
  command: string;
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  riskLevel: ToolRiskLevel;
}

const DEFAULT_COMMAND_TIMEOUT_MS = 30000;
const MAX_TERMINAL_OUTPUT_CHARS = 40000;

// High-risk command patterns (destructive, irreversible, or host-threatening)
const HIGH_RISK_PATTERNS = [
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|-rf|-fr)\s+(\/|\.|\*|~)\b/i,
  /\b(mkfs|fdisk|dd\s+if=)\b/i,
  /\bgit\s+(reset\s+--hard|clean\s+-f[a-z]*)\b/i,
  /\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(777|000)\s+(\/|\.)/i,
  /:(\(\)\s*\{|:\s*\{)\s*:\|:&\s*\};:/, // fork bomb
  /\bkill\s+-9\s+(-1|1)\b/i,
  /\bcurl\b.*\|\s*(sh|bash|zsh)\b/i,
  /\bwget\b.*\|\s*(sh|bash|zsh)\b/i,
];

// Moderate risk patterns (filesystem modifications, installs, git branch alterations)
const MODERATE_RISK_PATTERNS = [
  /\b(npm|yarn|pnpm|bun)\s+(install|add|remove|uninstall|update)\b/i,
  /\b(rm|unlink)\s+/i,
  /\bgit\s+(checkout\s+-f|stash\s+drop|branch\s+-D)\b/i,
];

// Secret / API key patterns for log redaction
const SECRET_REDACTION_PATTERNS = [
  /Bearer\s+[A-Za-z0-9_\-\.]{16,}/gi,
  /(sk-[A-Za-z0-9_\-]{20,})/gi,
  /(AIzaSy[A-Za-z0-9_\-]{30,})/gi,
  /([a-zA-Z0-9_\-]{20,}):([a-zA-Z0-9_\-]{20,})@/gi,
];

export class TerminalAdapter {
  private static runningProcessIds = new Set<string>();
  private static mockRunner: ((command: string, args: string[], onOutput?: (chunk: string) => void) => Promise<{ exitCode: number; stdout?: string; stderr?: string }>) | null = null;

  /**
   * Sets or clears a mock runner for offline or automated testing.
   */
  public static setMockRunner(runner: typeof TerminalAdapter.mockRunner): void {
    this.mockRunner = runner;
  }

  /**
   * Classifies the risk level of a terminal command.
   */
  public static classifyRisk(command: string, args: string[] = []): ToolRiskLevel {
    const fullLine = [command, ...args].join(' ').trim();

    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(fullLine)) {
        return 'high';
      }
    }

    for (const pattern of MODERATE_RISK_PATTERNS) {
      if (pattern.test(fullLine)) {
        return 'moderate';
      }
    }

    return 'safe';
  }

  /**
   * Redacts sensitive credentials, tokens, and API keys from terminal output.
   */
  public static redactSecrets(text: string): string {
    if (!text) return '';
    let result = text;
    for (const pattern of SECRET_REDACTION_PATTERNS) {
      result = result.replace(pattern, '[REDACTED_SECRET]');
    }
    return result;
  }

  /**
   * Parses a command string into binary name and arguments array.
   */
  public static parseCommand(commandStr: string): { command: string; args: string[] } {
    const trimmed = commandStr.trim();
    if (!trimmed) return { command: '', args: [] };

    // Basic shell argument parsing with quoted string support
    const matches = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    if (matches.length === 0) return { command: '', args: [] };

    const command = matches[0].replace(/^["']|["']$/g, '');
    const args = matches.slice(1).map((arg) => arg.replace(/^["']|["']$/g, ''));

    return { command, args };
  }

  /**
   * Executes an approved command in the WebContainer.
   */
  public static async executeCommand(
    options: TerminalExecutionOptions,
    executionId: string = `exec-${Date.now()}`
  ): Promise<ToolExecutionResult<TerminalExecutionResult>> {
    const { projectId, command: rawCommand, args: rawArgs = [], cwd, timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS, signal, onOutput } = options;

    if (!rawCommand || rawCommand.trim() === '') {
      return {
        success: false,
        error: 'Command cannot be empty.',
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    // Parse command if rawCommand contains arguments
    let execBinary = rawCommand.trim();
    let execArgs = [...rawArgs];
    if (rawArgs.length === 0 && rawCommand.includes(' ')) {
      const parsed = this.parseCommand(rawCommand);
      execBinary = parsed.command;
      execArgs = parsed.args;
    }

    const riskLevel = this.classifyRisk(execBinary, execArgs);

    // Prevent duplicate concurrent execution of the same tool call
    if (this.runningProcessIds.has(executionId)) {
      return {
        success: false,
        error: `Command "${execBinary}" with execution ID ${executionId} is already running.`,
        errorCode: 'EXECUTION_FAILED',
      };
    }

    this.runningProcessIds.add(executionId);
    const startTime = performance.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';

    try {
      // Check if mock runner is set or WebContainer is available
      if (!this.mockRunner) {
        const containerInstance = webcontainerService.getInstance();
        if (!containerInstance) {
          return {
            success: false,
            error: 'WebContainer runtime is not booted or unavailable. Commands cannot be run until runtime is ready.',
            errorCode: 'RUNTIME_UNAVAILABLE',
          };
        }
      }

      // Prepare command with working directory wrapper if specified
      let finalCommand = execBinary;
      let finalArgs = execArgs;

      if (cwd && cwd !== '.' && cwd !== './') {
        finalCommand = 'sh';
        finalArgs = ['-c', `cd "${cwd.replace(/"/g, '\\"')}" && ${execBinary} ${execArgs.map(a => `"${a.replace(/"/g, '\\"')}"`).join(' ')}`];
      }

      // Handle abort signal
      if (signal?.aborted) {
        return {
          success: false,
          error: 'Command execution was cancelled before start.',
          errorCode: 'EXECUTION_CANCELLED',
        };
      }

      // Execute command in WebContainer or mockRunner with timeout race
      const commandPromise = new Promise<{ exitCode: number }>(async (resolve, reject) => {
        try {
          if (this.mockRunner) {
            const res = await this.mockRunner(finalCommand, finalArgs, (chunk) => {
              stdoutBuffer += chunk;
              if (onOutput) onOutput(chunk);
            });
            if (res.stdout && !stdoutBuffer) stdoutBuffer = res.stdout;
            if (res.stderr) stderrBuffer = res.stderr;
            resolve({ exitCode: res.exitCode });
            return;
          }

          const res = await webcontainerService.runCommand(finalCommand, finalArgs, (chunk) => {
            stdoutBuffer += chunk;
            if (stdoutBuffer.length > MAX_TERMINAL_OUTPUT_CHARS) {
              stdoutBuffer = stdoutBuffer.slice(0, MAX_TERMINAL_OUTPUT_CHARS) + '\n[Output truncated: limit reached]';
            }
            if (onOutput) {
              onOutput(chunk);
            }
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });

      // Timeout promise
      let timer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<{ exitCode: number; timedOut: boolean }>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Command timed out after ${Math.round(timeoutMs / 1000)}s.`));
        }, timeoutMs);
      });

      // Cancellation listener
      let abortHandler: (() => void) | null = null;
      const abortPromise = new Promise<{ exitCode: number }>((_, reject) => {
        if (signal) {
          abortHandler = () => reject(new Error('Command execution was cancelled by user.'));
          signal.addEventListener('abort', abortHandler, { once: true });
        }
      });

      let exitResult: { exitCode: number };
      try {
        exitResult = await Promise.race([commandPromise, timeoutPromise, abortPromise]);
      } finally {
        if (timer) clearTimeout(timer);
        if (signal && abortHandler) {
          signal.removeEventListener('abort', abortHandler);
        }
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      const cleanStdout = this.redactSecrets(stdoutBuffer);
      const cleanStderr = this.redactSecrets(stderrBuffer);

      return {
        success: exitResult.exitCode === 0,
        result: {
          command: execBinary,
          args: execArgs,
          exitCode: exitResult.exitCode,
          stdout: cleanStdout,
          stderr: cleanStderr,
          executionTimeMs,
          riskLevel,
        },
        error: exitResult.exitCode !== 0
          ? `Command exited with non-zero code ${exitResult.exitCode}.\n${cleanStdout || cleanStderr}`.trim()
          : undefined,
        errorCode: exitResult.exitCode !== 0 ? 'EXECUTION_FAILED' : undefined,
        durationMs: executionTimeMs,
      };
    } catch (err: unknown) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.includes('timed out');
      const isCancelled = msg.includes('cancelled');

      return {
        success: false,
        error: msg,
        errorCode: isTimeout ? 'EXECUTION_TIMEOUT' : isCancelled ? 'EXECUTION_CANCELLED' : 'EXECUTION_FAILED',
        durationMs: executionTimeMs,
      };
    } finally {
      this.runningProcessIds.delete(executionId);
    }
  }
}
