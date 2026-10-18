/**
 * Built-in Agent Tools for GB Assist (Phase 3B).
 *
 * Implements the 9 initial tools required by Phase 3B:
 * 1. read_file
 * 2. list_directory
 * 3. search_files
 * 4. search_code
 * 5. get_project_structure
 * 6. get_diagnostics
 * 7. propose_file_edit
 * 8. create_file
 * 9. run_terminal_command
 */

import { AgentToolDefinition, ToolExecutionResult } from './types';
import { WorkspaceAdapter } from './workspaceAdapter';
import { TerminalAdapter } from './terminalAdapter';
import { EditProposalService } from '../editProposalService';
import { ProposedFileEdit } from '../types';

export const readFileTool: AgentToolDefinition<{ path: string }> = {
  name: 'read_file',
  description: 'Reads the text content of a file in the project workspace with bounds and security checks.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path of the workspace file to read (e.g. "src/App.tsx").',
      },
    },
    required: ['path'],
  },
  async execute(args, context) {
    return WorkspaceAdapter.readFile(args.path, context);
  },
};

export const listDirectoryTool: AgentToolDefinition<{ path?: string; includeIgnored?: boolean }> = {
  name: 'list_directory',
  description: 'Lists direct files and subdirectories within a given workspace directory path.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative directory path to inspect (defaults to root ".").',
      },
      includeIgnored: {
        type: 'boolean',
        description: 'Whether to include node_modules and build directories.',
      },
    },
  },
  async execute(args, context) {
    return WorkspaceAdapter.listDirectory(args.path || '', context, !!args.includeIgnored);
  },
};

export const searchFilesTool: AgentToolDefinition<{ query: string }> = {
  name: 'search_files',
  description: 'Searches for files by filename or wildcard pattern across the project.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Filename or wildcard pattern to search (e.g. "*.tsx", "math", "test").',
      },
    },
    required: ['query'],
  },
  async execute(args, context) {
    return WorkspaceAdapter.searchFiles(args.query, context);
  },
};

export const searchCodeTool: AgentToolDefinition<{ pattern: string; isRegex?: boolean }> = {
  name: 'search_code',
  description: 'Searches for text occurrences or regex patterns across all text files in the project.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Text string or regex pattern to search for across project files.',
      },
      isRegex: {
        type: 'boolean',
        description: 'Whether the pattern should be evaluated as a regular expression.',
      },
    },
    required: ['pattern'],
  },
  async execute(args, context) {
    return WorkspaceAdapter.searchCode(args.pattern, context, !!args.isRegex);
  },
};

export const getProjectStructureTool: AgentToolDefinition<{ maxDepth?: number }> = {
  name: 'get_project_structure',
  description: 'Generates a concise ASCII directory tree of the project workspace.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      maxDepth: {
        type: 'number',
        description: 'Maximum directory depth to include in the visual tree (default: 3).',
      },
    },
  },
  async execute(args, context) {
    return WorkspaceAdapter.getProjectStructure(context, args.maxDepth ?? 3);
  },
};

export const getDiagnosticsTool: AgentToolDefinition<{ path?: string }> = {
  name: 'get_diagnostics',
  description: 'Retrieves active compilation, syntax, and runtime diagnostic errors and warnings.',
  permission: 'read',
  riskLevel: 'safe',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Optional file path to filter diagnostics for a specific file.',
      },
    },
  },
  async execute(args, context) {
    return WorkspaceAdapter.getDiagnostics(context, args.path);
  },
};

export const proposeFileEditTool: AgentToolDefinition<{ path: string; newContent: string; explanation?: string }> = {
  name: 'propose_file_edit',
  description: 'Proposes modifying an existing workspace file. Generates a side-by-side Monaco Diff for user inspection and approval.',
  permission: 'edit',
  riskLevel: 'moderate',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path of the existing file to modify.',
      },
      newContent: {
        type: 'string',
        description: 'The complete updated source code of the file.',
      },
      explanation: {
        type: 'string',
        description: 'Brief explanation of why these edits are proposed.',
      },
    },
    required: ['path', 'newContent'],
  },
  async execute(args, context): Promise<ToolExecutionResult<{ proposal: ProposedFileEdit }>> {
    const cleanPath = WorkspaceAdapter.normalizePath(args.path);
    if (!cleanPath) {
      return {
        success: false,
        error: `Invalid path: "${args.path}". Paths must be relative to project root.`,
        errorCode: 'PATH_TRAVERSAL',
      };
    }

    const existingFile = context.project.files.find((f) => f.path === cleanPath);
    if (!existingFile) {
      return {
        success: false,
        error: `File "${cleanPath}" does not exist in workspace. Use create_file to propose a new file.`,
        errorCode: 'FILE_NOT_FOUND',
      };
    }

    const { added, removed } = EditProposalService.calculateDiff(existingFile.content, args.newContent);

    const proposal: ProposedFileEdit = {
      id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      path: cleanPath,
      action: 'modify',
      originalContent: existingFile.content,
      newContent: args.newContent,
      addedLines: added,
      removedLines: removed,
      explanation: args.explanation,
      status: 'pending',
    };

    return {
      success: true,
      result: { proposal },
      metadata: { proposalId: proposal.id },
    };
  },
};

export const createFileTool: AgentToolDefinition<{ path: string; content: string; explanation?: string }> = {
  name: 'create_file',
  description: 'Proposes creating a new file in the workspace with initial content.',
  permission: 'edit',
  riskLevel: 'moderate',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path of the new file to create.',
      },
      content: {
        type: 'string',
        description: 'Initial text content for the new file.',
      },
      explanation: {
        type: 'string',
        description: 'Brief explanation of why this new file is needed.',
      },
    },
    required: ['path', 'content'],
  },
  async execute(args, context): Promise<ToolExecutionResult<{ proposal: ProposedFileEdit }>> {
    const cleanPath = WorkspaceAdapter.normalizePath(args.path);
    if (!cleanPath) {
      return {
        success: false,
        error: `Invalid path: "${args.path}". Paths must be relative to project root.`,
        errorCode: 'PATH_TRAVERSAL',
      };
    }

    const existingFile = context.project.files.find((f) => f.path === cleanPath);
    if (existingFile) {
      return {
        success: false,
        error: `Cannot create file: "${cleanPath}" already exists in workspace. Use propose_file_edit to modify existing files.`,
        errorCode: 'FILE_ALREADY_EXISTS',
      };
    }

    const addedLines = args.content ? args.content.split('\n').length : 0;

    const proposal: ProposedFileEdit = {
      id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      path: cleanPath,
      action: 'create',
      originalContent: '',
      newContent: args.content || '',
      addedLines,
      removedLines: 0,
      explanation: args.explanation,
      status: 'pending',
    };

    return {
      success: true,
      result: { proposal },
      metadata: { proposalId: proposal.id },
    };
  },
};

export const runTerminalCommandTool: AgentToolDefinition<{ command: string; args?: string[]; cwd?: string; explanation?: string }> = {
  name: 'run_terminal_command',
  description: 'Executes a command inside the WebContainer terminal. STRICTLY requires explicit user approval before execution.',
  permission: 'terminal',
  riskLevel: 'moderate',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to execute (e.g. "npm test", "ls -la", "node scripts/build.js").',
      },
      args: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional arguments array for the command.',
      },
      cwd: {
        type: 'string',
        description: 'Optional working directory relative to project root.',
      },
      explanation: {
        type: 'string',
        description: 'Explanation for the user why this command is being run.',
      },
    },
    required: ['command'],
  },
  async execute(args, context) {
    const { command, args: cmdArgs = [], cwd } = args;

    return TerminalAdapter.executeCommand({
      projectId: context.projectId,
      command,
      args: cmdArgs,
      cwd,
      timeoutMs: context.timeoutMs,
      signal: context.signal,
      onOutput: context.onOutput,
    });
  },
};

export const BUILTIN_TOOLS: AgentToolDefinition[] = [
  readFileTool,
  listDirectoryTool,
  searchFilesTool,
  searchCodeTool,
  getProjectStructureTool,
  getDiagnosticsTool,
  proposeFileEditTool,
  createFileTool,
  runTerminalCommandTool,
];
