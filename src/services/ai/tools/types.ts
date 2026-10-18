/**
 * Type definitions for GB Assist Agent Tools Foundation (Phase 3B).
 *
 * Defines tool definitions, JSON schemas, permission classifications,
 * execution contexts, runtime results, and tool call records.
 */

import { MultiFileProject } from '../../../types/files';
import { ProposedFileEdit } from '../types';

export type ToolPermissionLevel = 'read' | 'edit' | 'terminal';

export type ToolRiskLevel = 'safe' | 'moderate' | 'high';

export type ToolCallStatus =
  | 'pending_approval'
  | 'approved'
  | 'denied'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * JSON Schema property definition for tool inputs.
 */
export interface ToolPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[];
  items?: ToolPropertySchema;
  properties?: Record<string, ToolPropertySchema>;
  required?: string[];
  default?: unknown;
}

/**
 * JSON Schema object for a tool's parameters.
 */
export interface ToolParametersSchema {
  type: 'object';
  properties: Record<string, ToolPropertySchema>;
  required?: string[];
}

/**
 * Specification for an Agent Tool, compatible with OpenAI & Gemini function calling.
 */
export interface AgentToolDefinition<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  parameters: ToolParametersSchema;
  permission: ToolPermissionLevel;
  riskLevel: ToolRiskLevel;
  execute: (args: TArgs, context: ToolExecutionContext) => Promise<ToolExecutionResult<TResult>>;
}

/**
 * Context provided to every tool execution.
 */
export interface ToolExecutionContext {
  projectId: string;
  project: MultiFileProject;
  activePath?: string | null;
  signal?: AbortSignal;
  timeoutMs?: number;
  isEditorDirty?: (path: string) => boolean;
  onChangeFile?: (path: string, content: string) => void;
  onCreateFile?: (path: string, content: string) => void;
  onOutput?: (chunk: string) => void;
}

/**
 * Structured result returned from tool execution.
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  errorCode?: ToolErrorCode;
  metadata?: Record<string, unknown>;
  durationMs?: number;
}

/**
 * Standard tool error codes.
 */
export type ToolErrorCode =
  | 'TOOL_NOT_FOUND'
  | 'INVALID_ARGUMENTS'
  | 'PERMISSION_DENIED'
  | 'PATH_TRAVERSAL'
  | 'SENSITIVE_FILE'
  | 'FILE_NOT_FOUND'
  | 'FILE_ALREADY_EXISTS'
  | 'DIRTY_BUFFER'
  | 'STALE_BASE'
  | 'PROJECT_MISMATCH'
  | 'RUNTIME_UNAVAILABLE'
  | 'EXECUTION_TIMEOUT'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_CANCELLED';

/**
 * Record of a tool invocation in a conversation message.
 */
export interface ToolCallRecord {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  rawArgs?: string;
  status: ToolCallStatus;
  permission: ToolPermissionLevel;
  riskLevel: ToolRiskLevel;
  explanation?: string;
  command?: string;
  cwd?: string;
  result?: unknown;
  error?: string;
  errorCode?: ToolErrorCode;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  proposedEdit?: ProposedFileEdit;
}
