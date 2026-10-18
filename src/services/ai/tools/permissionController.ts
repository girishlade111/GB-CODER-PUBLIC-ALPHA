/**
 * Permission Controller for GB Assist Agent Tools (Phase 3B).
 *
 * Implements user-supervised permission gates:
 * - Read tools: Safe project-local reads permitted within target project.
 * - Edit tools: Generate proposals requiring Monaco Diff inspection.
 * - Terminal tools: Mandatory user approval (Approve / Deny) before running.
 * - High-risk command tagging and blocking of automatic destructive executions.
 */

import { ToolPermissionLevel, ToolRiskLevel, ToolCallRecord } from './types';

export type PermissionDecision = 'approved' | 'denied' | 'pending';

export class PermissionController {
  private static pendingApprovals = new Map<string, {
    toolCall: ToolCallRecord;
    resolve: (decision: boolean) => void;
  }>();

  private static listeners = new Set<() => void>();

  /**
   * Evaluates whether a tool execution requires user approval before starting.
   */
  public static requiresApproval(
    permission: ToolPermissionLevel,
    riskLevel: ToolRiskLevel
  ): boolean {
    if (permission === 'terminal') return true;
    if (riskLevel === 'high') return true;
    return false;
  }

  /**
   * Requests user approval for a tool invocation.
   * Returns a promise resolving to true (approved) or false (denied).
   */
  public static requestApproval(toolCall: ToolCallRecord): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pendingApprovals.set(toolCall.id, {
        toolCall,
        resolve,
      });
      this.notify();
    });
  }

  /**
   * Approves a pending tool execution by ID.
   */
  public static approve(toolCallId: string): boolean {
    const pending = this.pendingApprovals.get(toolCallId);
    if (!pending) return false;

    this.pendingApprovals.delete(toolCallId);
    pending.toolCall.status = 'approved';
    pending.resolve(true);
    this.notify();
    return true;
  }

  /**
   * Denies a pending tool execution by ID.
   */
  public static deny(toolCallId: string): boolean {
    const pending = this.pendingApprovals.get(toolCallId);
    if (!pending) return false;

    this.pendingApprovals.delete(toolCallId);
    pending.toolCall.status = 'denied';
    pending.resolve(false);
    this.notify();
    return true;
  }

  /**
   * Checks if a tool call is currently waiting for approval.
   */
  public static isPending(toolCallId: string): boolean {
    return this.pendingApprovals.has(toolCallId);
  }

  /**
   * Lists all currently pending approvals.
   */
  public static getPendingApprovals(): ToolCallRecord[] {
    return Array.from(this.pendingApprovals.values()).map((p) => p.toolCall);
  }

  /**
   * Subscribes to changes in pending approvals.
   */
  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[PermissionController] Listener error:', err);
      }
    }
  }
}
