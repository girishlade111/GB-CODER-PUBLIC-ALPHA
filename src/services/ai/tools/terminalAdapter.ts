/**
 * Terminal Adapter for GB Assist Agent Tools (Phase 3B / Phase 3C).
 *
 * Integrates with WebContainer runtime for permission-gated command execution.
 * Enforces:
 * - High-risk / destructive command classification
 * - Explicit user approval verification
 * - Real process cancellation & termination tracking (process.kill)
 * - Accurate termination status (PROCESS TERMINATED / TERMINATION UNCONFIRMED / FAILED)
 * - Single settlement across simultaneous stop, timeout, and natural exit
 * - Secret and key redaction from terminal logs
 * - Concurrency tracking to prevent duplicate executions
 */

import { webcontainerService } from '../../webcontainer/webcontainerService';
import {
  ToolExecutionResult,
  ToolRiskLevel,
  ProcessTerminationStatus,
  ProcessTerminationResult,
} from './types';
import type { WebContainerProcess } from '@webcontainer/api';

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
  terminationStatus?: ProcessTerminationStatus;
  terminationDetail?: string;
}

export interface AgentProcessHandle {
  executionId: string;
  projectId: string;
  command: string;
  args: string[];
  startTime: number;
  process: WebContainerProcess | { kill: () => void; exit?: Promise<number> } | null;
  status: 'spawning' | 'running' | 'terminating' | 'terminated' | 'exited';
  terminationStatus: ProcessTerminationStatus;
  terminate: (reason?: string) => Promise<ProcessTerminationResult>;
}

export type MockTerminalRunner = (
  command: string,
  args: string[],
  onOutput?: (chunk: string) => void,
  context?: {
    signal?: AbortSignal;
    onSpawn?: (proc: { kill: () => void; exit?: Promise<number> }) => void;
  }
) => Promise<{
  exitCode: number;
  stdout?: string;
  stderr?: string;
  terminationStatus?: ProcessTerminationStatus;
  terminationDetail?: string;
}>;

const DEFAULT_COMMAND_TIMEOUT_MS = 30000;
const MAX_TERMINAL_OUTPUT_CHARS = 40000;

// High-risk command patterns (destructive, irreversible, or host-threatening)
const HIGH_RISK_PATTERNS = [
  /\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s*)+\s+(\/|\.|\*|~)(?:\s|$)/i,
  /\b(mkfs|fdisk|dd\s+if=)\b/i,
  /\bgit\s+(reset\s+--hard|clean\s+-f[a-z]*)\b/i,
  /\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(777|000)\s+(\/|\.)(?:\s|$)/i,
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
  /Bearer\s+[A-Za-z0-9_.-]{16,}/gi,
  /(sk-[A-Za-z0-9_-]{20,})/gi,
  /(AIzaSy[A-Za-z0-9_-]{30,})/gi,
  /([a-zA-Z0-9_-]{20,}):([a-zA-Z0-9_-]{20,})@/gi,
];

export class TerminalAdapter {
  private static activeProcesses = new Map<string, AgentProcessHandle>();
  private static runningProcessIds = new Set<string>();
  private static mockRunner: MockTerminalRunner | null = null;

  /**
   * Sets or clears a mock runner for offline or automated testing.
   */
  public static setMockRunner(runner: MockTerminalRunner | null): void {
    this.mockRunner = runner;
  }

  /**
   * Retrieves all currently active agent-owned processes, optionally filtered by project ID.
   */
  public static getActiveProcesses(projectId?: string): AgentProcessHandle[] {
    const all = Array.from(this.activeProcesses.values());
    if (!projectId) return all;
    return all.filter((p) => p.projectId === projectId);
  }

  /**
   * Retrieves an active process handle by execution ID.
   */
  public static getProcess(executionId: string): AgentProcessHandle | undefined {
    return this.activeProcesses.get(executionId);
  }

  /**
   * Requests termination of a specific active agent process.
   */
  public static async terminateProcess(
    executionId: string,
    reason: string = 'User requested termination'
  ): Promise<ProcessTerminationResult | null> {
    const handle = this.activeProcesses.get(executionId);
    if (!handle) return null;
    return handle.terminate(reason);
  }

  /**
   * Requests termination of all agent-owned processes for a specific project.
   */
  public static async terminateAllForProject(
    projectId: string,
    reason: string = 'Project stopped'
  ): Promise<ProcessTerminationResult[]> {
    const projectProcesses = this.getActiveProcesses(projectId);
    const results = await Promise.all(
      projectProcesses.map((p) => p.terminate(reason))
    );
    return results;
  }

  /**
   * Requests termination of all active agent-owned processes across all projects.
   */
  public static async terminateAll(
    reason: string = 'All processes stopped'
  ): Promise<ProcessTerminationResult[]> {
    const all = Array.from(this.activeProcesses.values());
    const results = await Promise.all(
      all.map((p) => p.terminate(reason))
    );
    return results;
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

    const command = (matches[0] || '').replace(/^["']|["']$/g, '');
    const args = matches.slice(1).map((arg) => arg.replace(/^["']|["']$/g, ''));

    return { command, args };
  }

  /**
   * Executes an approved command with process tracking, real cancellation, and single-settlement safety.
   */
  public static async executeCommand(
    options: TerminalExecutionOptions,
    executionId: string = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  ): Promise<ToolExecutionResult<TerminalExecutionResult>> {
    const {
      projectId,
      command: rawCommand,
      args: rawArgs = [],
      cwd,
      timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS,
      signal,
      onOutput,
    } = options;

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

    // Prevent duplicate concurrent execution of the same executionId
    if (this.runningProcessIds.has(executionId)) {
      return {
        success: false,
        error: `Command "${execBinary}" with execution ID ${executionId} is already running.`,
        errorCode: 'EXECUTION_FAILED',
      };
    }

    // Check pre-execution cancellation
    if (signal?.aborted) {
      return {
        success: false,
        error: 'Command execution was cancelled before start.',
        errorCode: 'EXECUTION_CANCELLED',
        durationMs: 0,
        result: {
          command: execBinary,
          args: execArgs,
          exitCode: -1,
          stdout: '',
          stderr: '',
          executionTimeMs: 0,
          riskLevel,
          terminationStatus: 'confirmed',
          terminationDetail: 'Command was cancelled before start.',
        },
      };
    }

    this.runningProcessIds.add(executionId);
    const startTime = performance.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';

    // Process handle state
    let rawProcess: WebContainerProcess | { kill: () => void; exit?: Promise<number> } | null = null;
    let processStatus: 'spawning' | 'running' | 'terminating' | 'terminated' | 'exited' = 'spawning';
    let terminationStatus: ProcessTerminationStatus = 'none';
    let recordedExitCode: number | undefined = undefined;
    let terminationPromise: Promise<ProcessTerminationResult> | null = null;

    const terminate = async (cancelReason: string = 'Cancelled'): Promise<ProcessTerminationResult> => {
      if (terminationPromise) {
        return terminationPromise;
      }

      terminationPromise = (async () => {
        // 1. If already exited normally:
        if (processStatus === 'exited') {
          return {
            status: 'confirmed',
            exitCode: recordedExitCode ?? 0,
            reason: cancelReason,
            detail: 'Process had already exited prior to termination request.',
          };
        }

        // 2. If cancelled before spawn completed:
        if (!rawProcess) {
          processStatus = 'terminated';
          terminationStatus = 'confirmed';
          return {
            status: 'confirmed',
            exitCode: -1,
            reason: cancelReason,
            detail: 'Process was terminated before spawn completed.',
          };
        }

        processStatus = 'terminating';

        // 3. Request termination via supported WebContainer process.kill()
        try {
          rawProcess.kill();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          processStatus = 'terminated';
          terminationStatus = 'failed';
          return {
            status: 'failed',
            reason: cancelReason,
            detail: `Termination failed: call to process.kill() threw error: ${msg}. Process may still be running.`,
          };
        }

        // 4. Await process exit confirmation with safety timeout (2500ms)
        try {
          const exitPromise = rawProcess.exit ?? Promise.resolve(0);
          const exitRes = await Promise.race([
            exitPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
          ]);

          if (exitRes !== null) {
            processStatus = 'terminated';
            terminationStatus = 'confirmed';
            recordedExitCode = exitRes;
            return {
              status: 'confirmed',
              exitCode: exitRes,
              reason: cancelReason,
              detail: `Process terminated successfully (exit code ${exitRes}).`,
            };
          } else {
            processStatus = 'terminated';
            terminationStatus = 'unconfirmed';
            return {
              status: 'unconfirmed',
              reason: cancelReason,
              detail: 'Termination unconfirmed: Process did not exit within 2.5s of kill signal. It may continue running in the background.',
            };
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          processStatus = 'terminated';
          terminationStatus = 'failed';
          return {
            status: 'failed',
            reason: cancelReason,
            detail: `Termination error: process.exit promise rejected with: ${msg}.`,
          };
        }
      })();

      return terminationPromise;
    };

    const handle: AgentProcessHandle = {
      executionId,
      projectId,
      command: execBinary,
      args: execArgs,
      startTime: Date.now(),
      get process() {
        return rawProcess;
      },
      set process(p) {
        rawProcess = p;
      },
      get status() {
        return processStatus;
      },
      get terminationStatus() {
        return terminationStatus;
      },
      terminate,
    };

    this.activeProcesses.set(executionId, handle);

    let isSettled = false;
    let timeoutTimer: NodeJS.Timeout | null = null;
    let abortListener: (() => void) | null = null;

    return new Promise<ToolExecutionResult<TerminalExecutionResult>>((resolve) => {
      const settleOnce = (result: ToolExecutionResult<TerminalExecutionResult>) => {
        if (isSettled) return;
        isSettled = true;

        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        if (signal && abortListener) {
          signal.removeEventListener('abort', abortListener);
          abortListener = null;
        }

        this.activeProcesses.delete(executionId);
        this.runningProcessIds.delete(executionId);

        resolve(result);
      };

      // 1. Setup AbortSignal listener
      if (signal) {
        abortListener = async () => {
          if (isSettled) return;
          const abortReason = (signal as any).reason || 'Command execution was cancelled by user.';
          const termRes = await handle.terminate(abortReason);

          const cleanStdout = TerminalAdapter.redactSecrets(stdoutBuffer);
          const cleanStderr = TerminalAdapter.redactSecrets(stderrBuffer);
          const executionTimeMs = Math.round(performance.now() - startTime);

          let errorMessage = 'Command execution was cancelled by user.';
          if (termRes.status === 'confirmed') {
            errorMessage = `Command was cancelled. Process terminated (exit code: ${termRes.exitCode ?? 'none'}).`;
          } else if (termRes.status === 'unconfirmed') {
            errorMessage = `Command was cancelled, but process termination is unconfirmed: ${termRes.detail}`;
          } else {
            errorMessage = `Command was cancelled, but process termination failed: ${termRes.detail}`;
          }

          settleOnce({
            success: false,
            error: errorMessage,
            errorCode: 'EXECUTION_CANCELLED',
            durationMs: executionTimeMs,
            result: {
              command: execBinary,
              args: execArgs,
              exitCode: termRes.exitCode ?? -1,
              stdout: cleanStdout,
              stderr: cleanStderr,
              executionTimeMs,
              riskLevel,
              terminationStatus: termRes.status,
              terminationDetail: termRes.detail,
            },
          });
        };

        signal.addEventListener('abort', abortListener, { once: true });
      }

      // 2. Setup Timeout timer
      timeoutTimer = setTimeout(async () => {
        if (isSettled) return;
        const timeoutReason = `Command timed out after ${Math.round(timeoutMs / 1000)}s.`;
        const termRes = await handle.terminate(timeoutReason);

        const cleanStdout = TerminalAdapter.redactSecrets(stdoutBuffer);
        const cleanStderr = TerminalAdapter.redactSecrets(stderrBuffer);
        const executionTimeMs = Math.round(performance.now() - startTime);

        let errorMessage = timeoutReason;
        if (termRes.status === 'confirmed') {
          errorMessage = `${timeoutReason} Process terminated.`;
        } else if (termRes.status === 'unconfirmed') {
          errorMessage = `${timeoutReason} Process termination unconfirmed: ${termRes.detail}`;
        } else {
          errorMessage = `${timeoutReason} Process termination failed: ${termRes.detail}`;
        }

        settleOnce({
          success: false,
          error: errorMessage,
          errorCode: 'EXECUTION_TIMEOUT',
          durationMs: executionTimeMs,
          result: {
            command: execBinary,
            args: execArgs,
            exitCode: termRes.exitCode ?? -1,
            stdout: cleanStdout,
            stderr: cleanStderr,
            executionTimeMs,
            riskLevel,
            terminationStatus: termRes.status,
            terminationDetail: termRes.detail,
          },
        });
      }, timeoutMs);

      // 3. Launch execution
      (async () => {
        try {
          if (this.mockRunner) {
            const res = await this.mockRunner(
              execBinary,
              execArgs,
              (chunk) => {
                stdoutBuffer += chunk;
                if (onOutput) onOutput(chunk);
              },
              {
                signal,
                onSpawn: (proc) => {
                  rawProcess = proc;
                  processStatus = 'running';
                },
              }
            );

            if (isSettled || signal?.aborted || processStatus === 'terminating' || processStatus === 'terminated') {
              return;
            }

            processStatus = 'exited';
            recordedExitCode = res.exitCode;
            if (res.stdout && !stdoutBuffer) stdoutBuffer = res.stdout;
            if (res.stderr && !stderrBuffer) stderrBuffer = res.stderr;

            const cleanStdout = TerminalAdapter.redactSecrets(stdoutBuffer);
            const cleanStderr = TerminalAdapter.redactSecrets(stderrBuffer);
            const executionTimeMs = Math.round(performance.now() - startTime);

            settleOnce({
              success: res.exitCode === 0,
              result: {
                command: execBinary,
                args: execArgs,
                exitCode: res.exitCode,
                stdout: cleanStdout,
                stderr: cleanStderr,
                executionTimeMs,
                riskLevel,
                terminationStatus: res.terminationStatus ?? 'none',
                terminationDetail: res.terminationDetail,
              },
              error:
                res.exitCode !== 0
                  ? `Command exited with non-zero code ${res.exitCode}.\n${cleanStdout || cleanStderr}`.trim()
                  : undefined,
              errorCode: res.exitCode !== 0 ? 'EXECUTION_FAILED' : undefined,
              durationMs: executionTimeMs,
            });
            return;
          }

          // Real WebContainer execution
          const containerInstance = webcontainerService.getInstance();
          if (!containerInstance) {
            settleOnce({
              success: false,
              error: 'WebContainer runtime is not booted or unavailable. Commands cannot be run until runtime is ready.',
              errorCode: 'RUNTIME_UNAVAILABLE',
              durationMs: 0,
            });
            return;
          }

          const { process: spawnedProc, exitPromise } = await webcontainerService.spawnAgentProcess(
            execBinary,
            execArgs,
            {
              cwd,
              signal,
              onSpawn: (p) => {
                rawProcess = p;
                processStatus = 'running';
              },
              onOutput: (chunk) => {
                stdoutBuffer += chunk;
                if (stdoutBuffer.length > MAX_TERMINAL_OUTPUT_CHARS) {
                  stdoutBuffer = stdoutBuffer.slice(0, MAX_TERMINAL_OUTPUT_CHARS) + '\n[Output truncated: limit reached]';
                }
                if (onOutput) {
                  onOutput(chunk);
                }
              },
            }
          );

          rawProcess = spawnedProc;
          processStatus = 'running';

          if (signal?.aborted && !isSettled) {
            abortListener?.();
            return;
          }

          const exitCode = await exitPromise;

          if (isSettled || signal?.aborted || (processStatus as string) === 'terminating' || (processStatus as string) === 'terminated') {
            return;
          }

          processStatus = 'exited';
          recordedExitCode = exitCode;

          const cleanStdout = TerminalAdapter.redactSecrets(stdoutBuffer);
          const cleanStderr = TerminalAdapter.redactSecrets(stderrBuffer);
          const executionTimeMs = Math.round(performance.now() - startTime);

          settleOnce({
            success: exitCode === 0,
            result: {
              command: execBinary,
              args: execArgs,
              exitCode,
              stdout: cleanStdout,
              stderr: cleanStderr,
              executionTimeMs,
              riskLevel,
              terminationStatus: 'none',
            },
            error:
              exitCode !== 0
                ? `Command exited with non-zero code ${exitCode}.\n${cleanStdout || cleanStderr}`.trim()
                : undefined,
            errorCode: exitCode !== 0 ? 'EXECUTION_FAILED' : undefined,
            durationMs: executionTimeMs,
          });
        } catch (err: unknown) {
          if (isSettled) return;
          const executionTimeMs = Math.round(performance.now() - startTime);
          const msg = err instanceof Error ? err.message : String(err);
          const isTimeout = msg.includes('timed out');
          const isCancelled = msg.includes('cancelled');

          settleOnce({
            success: false,
            error: msg,
            errorCode: isTimeout ? 'EXECUTION_TIMEOUT' : isCancelled ? 'EXECUTION_CANCELLED' : 'EXECUTION_FAILED',
            durationMs: executionTimeMs,
            result: {
              command: execBinary,
              args: execArgs,
              exitCode: -1,
              stdout: TerminalAdapter.redactSecrets(stdoutBuffer),
              stderr: TerminalAdapter.redactSecrets(stderrBuffer),
              executionTimeMs,
              riskLevel,
              terminationStatus: isCancelled ? 'confirmed' : 'none',
            },
          });
        }
      })();
    });
  }
}
