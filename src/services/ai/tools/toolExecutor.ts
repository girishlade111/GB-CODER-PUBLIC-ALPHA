/**
 * Tool Executor for GB Assist (Phase 3B).
 *
 * Coordinates tool execution lifecycle:
 * - Permission checking and user approval gating
 * - Execution dispatch via ToolRegistry
 * - ToolCallRecord state transitions (pending_approval -> running -> completed/failed)
 * - Timing and error capture
 */

import { ToolCallRecord, ToolExecutionContext, ToolExecutionResult } from './types';
import { ToolRegistry } from './toolRegistry';
import { PermissionController } from './permissionController';
import { TerminalAdapter } from './terminalAdapter';

export class ToolExecutor {
  /**
   * Creates a new ToolCallRecord from model tool-call arguments.
   */
  public static createToolCallRecord(
    toolName: string,
    rawArgs: unknown,
    id?: string
  ): ToolCallRecord {
    const callId = id || `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tool = ToolRegistry.getTool(toolName);

    let parsedArgs: Record<string, unknown> = {};
    if (typeof rawArgs === 'string') {
      try {
        parsedArgs = JSON.parse(rawArgs);
      } catch {
        parsedArgs = { _raw: rawArgs };
      }
    } else if (typeof rawArgs === 'object' && rawArgs !== null) {
      parsedArgs = rawArgs as Record<string, unknown>;
    }

    const permission = tool ? tool.permission : 'read';
    let riskLevel = tool ? tool.riskLevel : 'safe';

    // If it's a terminal command, perform dynamic risk analysis
    if (toolName === 'run_terminal_command' && typeof parsedArgs.command === 'string') {
      const argsArray = Array.isArray(parsedArgs.args) ? parsedArgs.args.map(String) : [];
      riskLevel = TerminalAdapter.classifyRisk(parsedArgs.command, argsArray);
    }

    const requiresApproval = PermissionController.requiresApproval(permission, riskLevel);

    return {
      id: callId,
      toolName,
      args: parsedArgs,
      rawArgs: typeof rawArgs === 'string' ? rawArgs : JSON.stringify(rawArgs),
      status: requiresApproval ? 'pending_approval' : 'running',
      permission,
      riskLevel,
      explanation: typeof parsedArgs.explanation === 'string' ? parsedArgs.explanation : undefined,
      command: typeof parsedArgs.command === 'string' ? parsedArgs.command : undefined,
      cwd: typeof parsedArgs.cwd === 'string' ? parsedArgs.cwd : undefined,
    };
  }

  /**
   * Executes a tool call record with permission enforcement and error handling.
   */
  public static async executeToolCall(
    toolCall: ToolCallRecord,
    context: ToolExecutionContext,
    skipApprovalCheck: boolean = false
  ): Promise<ToolExecutionResult> {
    const tool = ToolRegistry.getTool(toolCall.toolName);
    if (!tool) {
      toolCall.status = 'failed';
      toolCall.error = `Tool "${toolCall.toolName}" not found.`;
      toolCall.errorCode = 'TOOL_NOT_FOUND';
      return {
        success: false,
        error: toolCall.error,
        errorCode: 'TOOL_NOT_FOUND',
      };
    }

    // Permission enforcement: if requires approval and not pre-approved
    if (!skipApprovalCheck && PermissionController.requiresApproval(tool.permission, toolCall.riskLevel)) {
      toolCall.status = 'pending_approval';
      const approved = await PermissionController.requestApproval(toolCall);
      if (!approved) {
        toolCall.status = 'denied';
        toolCall.error = 'Tool execution denied by user.';
        toolCall.errorCode = 'PERMISSION_DENIED';
        return {
          success: false,
          error: toolCall.error,
          errorCode: 'PERMISSION_DENIED',
        };
      }
    }

    toolCall.status = 'running';
    toolCall.startedAt = Date.now();

    const start = performance.now();
    try {
      const result = await ToolRegistry.executeTool(toolCall.toolName, toolCall.args, context);
      const durationMs = Math.round(performance.now() - start);

      toolCall.completedAt = Date.now();
      toolCall.durationMs = durationMs;

      if (result.success) {
        toolCall.status = 'completed';
        toolCall.result = result.result;

        // If tool returned a proposed edit, attach it
        if (result.result && typeof result.result === 'object' && 'proposal' in result.result) {
          toolCall.proposedEdit = (result.result as { proposal: unknown }).proposal as any;
        }

        // If tool returned terminal stdout/stderr
        if (result.result && typeof result.result === 'object' && 'stdout' in result.result) {
          const tRes = result.result as { stdout?: string; stderr?: string; exitCode?: number };
          toolCall.stdout = tRes.stdout;
          toolCall.stderr = tRes.stderr;
          toolCall.exitCode = tRes.exitCode;
        }
      } else {
        toolCall.status = 'failed';
        toolCall.error = result.error;
        toolCall.errorCode = result.errorCode;
      }

      return result;
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      toolCall.completedAt = Date.now();
      toolCall.durationMs = durationMs;
      toolCall.status = 'failed';
      toolCall.error = msg;
      toolCall.errorCode = 'EXECUTION_FAILED';

      return {
        success: false,
        error: msg,
        errorCode: 'EXECUTION_FAILED',
        durationMs,
      };
    }
  }
}
