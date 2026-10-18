/**
 * Core Type Definitions for Phase 3C Autonomous Coding Agent Engine.
 *
 * Implements an explicit typed execution state machine:
 * idle -> planning -> running -> awaiting_approval -> verifying -> completed | failed | cancelled
 */

import { ToolCallRecord } from '../tools/types';

export type AgentStatus =
  | 'idle'
  | 'planning'
  | 'running'
  | 'awaiting_approval'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentPlanStep {
  id: string;
  index: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  toolCallIds: string[];
  resultSummary?: string;
  error?: string;
}

export interface AgentPlan {
  id: string;
  taskId: string;
  title: string;
  steps: AgentPlanStep[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentBudgetConfig {
  /** Maximum iterations in the agent execution loop */
  maxSteps: number;
  /** Maximum total tool calls permitted across the entire task */
  maxToolCalls: number;
  /** Maximum attempts to recover a failed tool action before giving up */
  maxRetriesPerStep: number;
  /** Maximum consecutive tool or step failures before aborting task */
  maxConsecutiveFailures: number;
  /** Maximum wall-clock execution time in milliseconds (default: 5 min) */
  maxDurationMs: number;
  /** Maximum approximate cumulative token usage */
  maxTokenUsage: number;
}

export const DEFAULT_AGENT_BUDGET: AgentBudgetConfig = {
  maxSteps: 15,
  maxToolCalls: 25,
  maxRetriesPerStep: 3,
  maxConsecutiveFailures: 3,
  maxDurationMs: 300000, // 5 minutes
  maxTokenUsage: 128000,
};

export interface AgentUsage {
  stepCount: number;
  toolCallCount: number;
  retryCount: number;
  durationMs: number;
  estimatedTokens: number;
}

export interface AgentPendingApproval {
  id: string;
  taskId: string;
  stepIndex: number;
  toolCall: ToolCallRecord;
  messageId: string;
  requestedAt: number;
  expiresAt: number;
  projectId: string;
  isExpired?: boolean;
  isResolved?: boolean;
  decision?: 'approved' | 'denied';
  decisionAt?: number;
}

export interface AgentStepRecord {
  id: string;
  stepIndex: number;
  phase: 'planning' | 'execution' | 'verification' | 'summary';
  status: 'running' | 'completed' | 'failed' | 'skipped';
  description: string;
  modelResponse?: string;
  reasoning?: string;
  toolCalls: ToolCallRecord[];
  error?: string;
  startedAt: number;
  completedAt?: number;
}

export interface AgentTaskState {
  taskId: string;
  projectId: string;
  prompt: string;
  mode: 'Agent';
  status: AgentStatus;
  plan?: AgentPlan;
  currentStepIndex: number;
  steps: AgentStepRecord[];
  pendingApproval?: AgentPendingApproval;
  finalSummary?: string;
  error?: string;
  budget: AgentBudgetConfig;
  usage: AgentUsage;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  recoveryRequired?: boolean;
}

export interface AgentExecutionCallbacks {
  onStateChange: (state: AgentTaskState) => void;
  onStreamContent?: (chunk: string) => void;
  onStreamReasoning?: (chunk: string) => void;
  onToolOutput?: (toolCallId: string, chunk: string) => void;
}
