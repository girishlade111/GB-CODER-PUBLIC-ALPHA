export type SnippetType = 'full' | 'html' | 'css' | 'javascript';
export type SnippetScope = 'private' | 'public';

export interface CodeSnippet {
  id: string;
  name: string;
  description?: string;
  html: string;
  css: string;
  javascript: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;

  // Enhanced fields
  type?: SnippetType;  // Optional for backward compatibility
  scope?: SnippetScope; // Optional for backward compatibility, defaults to 'private'
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
}

export interface AutoSaveState {
  html: string;
  css: string;
  javascript: string;
  timestamp: string;
}

// Terminal-specific types
export interface TerminalCommand {
  command: string;
  args: string[];
  timestamp: string;
  output?: TerminalOutput[];
}

export interface TerminalOutput {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'system';
  message: string;
  timestamp: string;
}

export interface VirtualFile {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  created: string;
  modified: string;
  parent?: string;
}

export interface NPMPackage {
  name: string;
  version: string;
  description?: string;
  installed: string;
  size?: number;
}

export interface TerminalState {
  currentDirectory: string;
  commandHistory: string[];
  fileSystem: Record<string, VirtualFile>;
  npmPackages: Record<string, NPMPackage>;
  environment: Record<string, string>;
}

export type Theme = 'dark' | 'light';

export type EditorLanguage = 'html' | 'css' | 'javascript';

// Selection Operation Types
export type SelectionOperationType = 'explain' | 'debug' | 'optimize' | 'improveUI';

export interface SelectionOperationResult {
  operation: SelectionOperationType;
  hasCodeChanges: boolean;
  explanation: string;
  suggestedCode?: string;
  issues?: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  improvements?: string[];
  confidence?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  operation: SelectionOperationType;
  language: EditorLanguage;
  codePreview: string;
  result: SelectionOperationResult;
}
// Project Management Types
export * from './project';
