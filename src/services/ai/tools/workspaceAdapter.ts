/**
 * Workspace Adapter for GB Assist Agent Tools (Phase 3B).
 *
 * Implements real project-local inspection tools with:
 * - Strict path traversal rejection
 * - Sensitive file / secret protection
 * - Binary file safety guards
 * - Output truncation and budget limits
 * - Ignore patterns (node_modules, .git, dist, build)
 * - Diagnostics integration
 */

import { isSensitiveFilePath } from '../contextBuilder';
import { diagnosticsService, DiagnosticItem } from '../../diagnostics/diagnosticsService';
import { ToolExecutionContext, ToolExecutionResult } from './types';

const MAX_FILE_READ_CHARS = 24000;
const MAX_SEARCH_RESULTS = 50;

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'zip', 'tar', 'gz', '7z', 'rar',
  'pdf', 'wasm', 'bin', 'exe', 'dll', 'so', 'dylib',
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.cache',
  'coverage',
]);

export class WorkspaceAdapter {
  /**
   * Sanitizes and normalizes a workspace relative path.
   * Returns null if path attempts directory traversal or references root/drive.
   */
  public static normalizePath(filePath: string): string | null {
    if (!filePath || typeof filePath !== 'string') return null;
    const trimmed = filePath.trim();
    if (
      trimmed.startsWith('/') ||
      trimmed.startsWith('\\') ||
      /^[a-zA-Z]:/.test(trimmed) ||
      trimmed.includes('\0')
    ) {
      return null;
    }
    const clean = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
    const segments = clean.split('/');
    if (segments.some((seg) => seg === '..' || seg === '.')) {
      return null;
    }
    return clean;
  }

  /**
   * Determines if a path belongs to an ignored directory (e.g. node_modules, .git).
   */
  public static isIgnoredPath(filePath: string): boolean {
    const clean = filePath.replace(/\\/g, '/');
    const segments = clean.split('/');
    return segments.some((seg) => IGNORED_DIRECTORIES.has(seg));
  }

  /**
   * Checks if a file path is a binary file based on extension.
   */
  public static isBinaryFile(filePath: string): boolean {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return !!ext && BINARY_EXTENSIONS.has(ext);
  }

  /**
   * Reads a file from the current workspace with security bounds.
   */
  public static async readFile(
    rawPath: string,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult<{ path: string; content: string; linesCount: number; isTruncated: boolean }>> {
    const cleanPath = this.normalizePath(rawPath);
    if (!cleanPath) {
      return {
        success: false,
        error: `Path traversal or invalid path rejected: "${rawPath}". Paths must be relative to project root.`,
        errorCode: 'PATH_TRAVERSAL',
      };
    }

    if (isSensitiveFilePath(cleanPath)) {
      return {
        success: false,
        error: `Access to sensitive credential/environment file "${cleanPath}" is blocked by security policy.`,
        errorCode: 'SENSITIVE_FILE',
      };
    }

    if (this.isBinaryFile(cleanPath)) {
      return {
        success: false,
        error: `File "${cleanPath}" is a binary asset and cannot be read as UTF-8 text.`,
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    const file = context.project.files.find((f) => f.path === cleanPath);
    if (!file) {
      return {
        success: false,
        error: `File not found in project: "${cleanPath}".`,
        errorCode: 'FILE_NOT_FOUND',
      };
    }

    let content = file.content;
    let isTruncated = false;
    const lines = content.split('\n');

    if (content.length > MAX_FILE_READ_CHARS) {
      content = content.slice(0, MAX_FILE_READ_CHARS) +
        `\n\n[... Truncated: File exceeds ${MAX_FILE_READ_CHARS} character read limit. Total lines: ${lines.length} ...]`;
      isTruncated = true;
    }

    return {
      success: true,
      result: {
        path: cleanPath,
        content,
        linesCount: lines.length,
        isTruncated,
      },
    };
  }

  /**
   * Lists entries in a workspace directory.
   */
  public static async listDirectory(
    rawPath: string = '',
    context: ToolExecutionContext,
    includeIgnored: boolean = false
  ): Promise<ToolExecutionResult<{ path: string; entries: Array<{ name: string; path: string; type: 'file' | 'directory'; isSensitive?: boolean }> }>> {
    let cleanDir = '';
    if (rawPath && rawPath !== '.' && rawPath !== './') {
      const normalized = this.normalizePath(rawPath);
      if (normalized === null) {
        return {
          success: false,
          error: `Path traversal or invalid directory path rejected: "${rawPath}".`,
          errorCode: 'PATH_TRAVERSAL',
        };
      }
      cleanDir = normalized;
    }

    const prefix = cleanDir ? cleanDir + '/' : '';
    const entriesMap = new Map<string, { name: string; path: string; type: 'file' | 'directory'; isSensitive?: boolean }>();

    for (const file of context.project.files) {
      if (!includeIgnored && this.isIgnoredPath(file.path)) {
        continue;
      }

      if (cleanDir && !file.path.startsWith(prefix)) {
        continue;
      }

      const relative = cleanDir ? file.path.slice(prefix.length) : file.path;
      const parts = relative.split('/');

      if (parts.length === 1) {
        // Direct child file
        const name = parts[0];
        const sensitive = isSensitiveFilePath(file.path);
        entriesMap.set(name, {
          name,
          path: file.path,
          type: 'file',
          isSensitive: sensitive || undefined,
        });
      } else if (parts.length > 1) {
        // Direct child directory
        const dirName = parts[0];
        const dirFullPath = cleanDir ? `${cleanDir}/${dirName}` : dirName;
        if (!entriesMap.has(dirName)) {
          entriesMap.set(dirName, {
            name: dirName,
            path: dirFullPath,
            type: 'directory',
          });
        }
      }
    }

    const entries = Array.from(entriesMap.values()).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return {
      success: true,
      result: {
        path: cleanDir || '.',
        entries,
      },
    };
  }

  /**
   * Searches for files by path or pattern across the workspace.
   */
  public static async searchFiles(
    query: string,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult<{ query: string; matches: string[]; totalMatches: number; isTruncated: boolean }>> {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) {
      return {
        success: false,
        error: 'Search query cannot be empty.',
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    const allMatches: string[] = [];

    for (const file of context.project.files) {
      if (this.isIgnoredPath(file.path)) continue;
      if (isSensitiveFilePath(file.path)) continue;

      const pathLower = file.path.toLowerCase();
      if (cleanQuery.includes('*')) {
        // Simple wildcard pattern matching
        const regexStr = '^' + cleanQuery.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        try {
          if (new RegExp(regexStr, 'i').test(file.path)) {
            allMatches.push(file.path);
          }
        } catch {
          if (pathLower.includes(cleanQuery.replace(/\*/g, ''))) {
            allMatches.push(file.path);
          }
        }
      } else if (pathLower.includes(cleanQuery)) {
        allMatches.push(file.path);
      }
    }

    const isTruncated = allMatches.length > MAX_SEARCH_RESULTS;
    const matches = allMatches.slice(0, MAX_SEARCH_RESULTS);

    return {
      success: true,
      result: {
        query,
        matches,
        totalMatches: allMatches.length,
        isTruncated,
      },
    };
  }

  /**
   * Searches for code/text patterns across project files.
   */
  public static async searchCode(
    pattern: string,
    context: ToolExecutionContext,
    isRegex: boolean = false
  ): Promise<ToolExecutionResult<{ pattern: string; matches: Array<{ path: string; line: number; preview: string }>; totalMatches: number; isTruncated: boolean }>> {
    const trimmed = (pattern || '').trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Search pattern cannot be empty.',
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    let searchRegex: RegExp;
    try {
      searchRegex = isRegex ? new RegExp(trimmed, 'i') : new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    } catch (err) {
      return {
        success: false,
        error: `Invalid regular expression pattern: ${err instanceof Error ? err.message : String(err)}`,
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    const matches: Array<{ path: string; line: number; preview: string }> = [];
    let totalCount = 0;

    for (const file of context.project.files) {
      if (this.isIgnoredPath(file.path)) continue;
      if (isSensitiveFilePath(file.path)) continue;
      if (this.isBinaryFile(file.path)) continue;

      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (searchRegex.test(line)) {
          totalCount++;
          if (matches.length < MAX_SEARCH_RESULTS) {
            matches.push({
              path: file.path,
              line: i + 1,
              preview: line.trim().slice(0, 160),
            });
          }
        }
      }
    }

    return {
      success: true,
      result: {
        pattern,
        matches,
        totalMatches: totalCount,
        isTruncated: totalCount > MAX_SEARCH_RESULTS,
      },
    };
  }

  /**
   * Generates a concise ASCII project structure tree.
   */
  public static async getProjectStructure(
    context: ToolExecutionContext,
    maxDepth: number = 3
  ): Promise<ToolExecutionResult<{ tree: string; totalFiles: number }>> {
    const validFiles = context.project.files.filter(
      (f) => !this.isIgnoredPath(f.path)
    );

    // Build directory tree
    interface TreeNode {
      name: string;
      children: Map<string, TreeNode>;
      isFile: boolean;
      isSensitive?: boolean;
    }

    const root: TreeNode = { name: '', children: new Map(), isFile: false };

    for (const file of validFiles) {
      const parts = file.path.split('/');
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            children: new Map(),
            isFile,
            isSensitive: isFile && isSensitiveFilePath(file.path) ? true : undefined,
          });
        }
        current = current.children.get(part)!;
      }
    }

    const renderTree = (node: TreeNode, depth: number, prefix: string): string[] => {
      if (depth > maxDepth) return [`${prefix}...`];
      const lines: string[] = [];
      const entries = Array.from(node.children.values()).sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const isLast = i === entries.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';
        const label = entry.isFile
          ? entry.name + (entry.isSensitive ? ' [protected secret]' : '')
          : entry.name + '/';
        lines.push(`${prefix}${branch}${label}`);
        if (!entry.isFile && entry.children.size > 0) {
          lines.push(...renderTree(entry, depth + 1, prefix + childPrefix));
        }
      }
      return lines;
    };

    const treeLines = ['.', ...renderTree(root, 1, '')];
    const tree = treeLines.join('\n');

    return {
      success: true,
      result: {
        tree,
        totalFiles: validFiles.length,
      },
    };
  }

  /**
   * Retrieves active workspace and editor diagnostics.
   */
  public static async getDiagnostics(
    context: ToolExecutionContext,
    filePath?: string
  ): Promise<ToolExecutionResult<{ items: DiagnosticItem[]; errorCount: number; warningCount: number; totalCount: number }>> {
    diagnosticsService.setProjectId(context.projectId);
    const state = diagnosticsService.getState();

    let items = state.items;
    if (filePath) {
      const cleanPath = this.normalizePath(filePath);
      if (cleanPath) {
        items = items.filter((d) => d.path === cleanPath);
      }
    }

    const errorCount = items.filter((d) => d.severity === 'error').length;
    const warningCount = items.filter((d) => d.severity === 'warning').length;

    return {
      success: true,
      result: {
        items,
        errorCount,
        warningCount,
        totalCount: items.length,
      },
    };
  }
}
