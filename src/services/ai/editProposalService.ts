/**
 * AI Edit Proposal & Safe Workspace Modification Service.
 *
 * Responsibilities:
 * - Parses structured edit proposals from AI streaming output.
 * - Computes accurate line diff statistics using `diffLines`.
 * - Validates file paths to prevent directory traversal or invalid paths.
 * - Protects unsaved dirty buffers in Monaco.
 * - Integrates with SnapshotService for pre-apply automatic rollback checkpoints.
 * - Executes writes through the official project & WebContainer sync pipeline.
 */

import { diffLines, Change } from 'diff';
import { MultiFileProject } from '../../types/files.ts';
import { ProposedFileEdit } from './types.ts';
import { snapshotService } from '../snapshotService.ts';
import { webcontainerService } from '../webcontainer/webcontainerService.ts';

export interface ApplyEditOptions {
  project: MultiFileProject;
  edit: ProposedFileEdit;
  projectId?: string;
  isEditorDirty?: (path: string) => boolean;
  onChangeFile: (path: string, content: string) => void;
  onCreateFile?: (path: string, content: string) => void;
  createRollbackCheckpoint?: boolean;
}

export class EditProposalService {
  /**
   * Parses structured edit proposals from AI markdown/text output.
   * Matches both `<proposed_edit path="..." action="...">` XML tags
   * and markdown code blocks annotated with file paths (e.g. ```typescript:src/App.tsx).
   */
  public static parseProposals(text: string, currentFiles: Array<{ path: string; content: string }>): ProposedFileEdit[] {
    const proposals: ProposedFileEdit[] = [];
    const seenPaths = new Set<string>();

    // 1. Primary Pattern: XML-style <proposed_edit path="src/..." action="...">...</proposed_edit>
    const xmlRegex = /<proposed_edit\s+path=["']([^"']+)["'](?:\s+action=["']([^"']+)["'])?>([\s\S]*?)<\/proposed_edit>/gi;
    let match: RegExpExecArray | null;

    while ((match = xmlRegex.exec(text)) !== null) {
      const rawPath = match[1].trim();
      const rawAction = (match[2] || '').trim().toLowerCase();
      const newContent = match[3].replace(/^\r?\n/, ''); // trim leading newline from opening tag

      const normalizedPath = this.normalizePath(rawPath);
      if (!normalizedPath || seenPaths.has(normalizedPath)) continue;
      seenPaths.add(normalizedPath);

      const existing = currentFiles.find((f) => f.path === normalizedPath);
      const originalContent = existing?.content || '';
      const action = rawAction === 'create' || !existing ? 'create' : 'modify';

      const { added, removed } = this.calculateDiffStats(originalContent, newContent);

      proposals.push({
        id: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        path: normalizedPath,
        action,
        originalContent,
        newContent,
        addedLines: added,
        removedLines: removed,
        status: 'pending',
      });
    }

    // 2. Fallback Pattern: ```lang:path/to/file.ext or ```path/to/file.ext
    if (proposals.length === 0) {
      const fenceRegex = /```(?:[a-zA-Z0-9_-]+:)?([a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+)\r?\n([\s\S]*?)```/gi;
      while ((match = fenceRegex.exec(text)) !== null) {
        const rawPath = match[1].trim();
        const newContent = match[2];

        // Ensure it looks like a valid file path (has extension, not just a label)
        if (!rawPath.includes('.')) continue;

        const normalizedPath = this.normalizePath(rawPath);
        if (!normalizedPath || seenPaths.has(normalizedPath)) continue;
        seenPaths.add(normalizedPath);

        const existing = currentFiles.find((f) => f.path === normalizedPath);
        const originalContent = existing?.content || '';
        const action = !existing ? 'create' : 'modify';

        const { added, removed } = this.calculateDiffStats(originalContent, newContent);

        proposals.push({
          id: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          path: normalizedPath,
          action,
          originalContent,
          newContent,
          addedLines: added,
          removedLines: removed,
          status: 'pending',
        });
      }
    }

    return proposals;
  }

  /**
   * Computes added and removed line counts using diffLines.
   */
  public static calculateDiffStats(original: string, updated: string): { added: number; removed: number } {
    if (!original && updated) {
      return { added: updated.split('\n').length, removed: 0 };
    }
    if (original && !updated) {
      return { added: 0, removed: original.split('\n').length };
    }

    const changes: Change[] = diffLines(original, updated);
    let added = 0;
    let removed = 0;

    for (const change of changes) {
      if (change.added) {
        added += change.count ?? 1;
      } else if (change.removed) {
        removed += change.count ?? 1;
      }
    }

    return { added, removed };
  }

  /**
   * Normalizes and validates file paths, preventing traversal attacks.
   */
  public static normalizePath(filePath: string): string | null {
    if (!filePath) return null;
    const trimmed = filePath.trim();
    // Reject absolute paths, root paths, drive letters, and null bytes
    if (
      trimmed.startsWith('/') ||
      trimmed.startsWith('\\') ||
      /^[a-zA-Z]:/.test(trimmed) ||
      trimmed.includes('\0')
    ) {
      return null;
    }
    const clean = trimmed.replace(/\\/g, '/');
    // Disallow directory traversal segments
    const segments = clean.split('/');
    if (segments.some((seg) => seg === '..' || seg === '.')) {
      return null;
    }
    return clean;
  }

  /**
   * Safely applies an edit proposal to the project and WebContainer.
   * Enforces dirty buffer blocking, stale proposal rejection, and auto-rollback checkpoints.
   */
  public static async applyEdit(options: ApplyEditOptions): Promise<{ success: boolean; error?: string; checkpointId?: string }> {
    const { project, edit, isEditorDirty, onChangeFile, onCreateFile, createRollbackCheckpoint = true, projectId } = options;

    // Safety check 0: Prevent cross-project file writes
    if (projectId && project.id && projectId !== project.id) {
      return {
        success: false,
        error: `Cannot apply edit: Target project mismatch. Proposal was generated for "${projectId}" but active project is "${project.id}".`,
      };
    }

    // Safety check 1: Block write if target file has unsaved dirty buffer in Monaco
    if (isEditorDirty && isEditorDirty(edit.path)) {
      return {
        success: false,
        error: `Cannot apply edit: "${edit.path}" has unsaved changes in the editor. Please save your file before applying this proposal.`,
      };
    }

    // Safety check 2: Stale proposal validation & existence checks
    const existingFile = project.files.find((f) => f.path === edit.path);

    if (edit.action === 'create') {
      if (existingFile) {
        return {
          success: false,
          error: `Cannot create file: "${edit.path}" already exists in the workspace. Please review the existing file before modifying.`,
        };
      }
    } else {
      // edit.action === 'modify'
      if (!existingFile) {
        return {
          success: false,
          error: `Cannot modify file: "${edit.path}" does not exist in the workspace.`,
        };
      }

      const normalizeContent = (text: string) => text.replace(/\r\n/g, '\n');
      if (normalizeContent(existingFile.content) !== normalizeContent(edit.originalContent)) {
        return {
          success: false,
          error: `Stale proposal: "${edit.path}" has been modified since this proposal was generated. Please regenerate or review the updated diff.`,
        };
      }
    }

    // Safety check 3: Create automatic rollback checkpoint before mutation
    let checkpointId: string | undefined;
    if (createRollbackCheckpoint) {
      try {
        const snap = snapshotService.createSnapshot(
          `Before AI Edit: ${edit.action} ${edit.path}`,
          {
            project: {
              projectType: project.projectType,
              files: project.files,
              dependencies: project.dependencies,
              entry: project.entry,
            },
            openPaths: [edit.path],
            activePath: edit.path,
            externalLibraries: [],
          },
          true
        );
        checkpointId = snap.id;
      } catch (snapErr) {
        console.warn('[EditProposalService] Could not create auto-snapshot checkpoint:', snapErr);
      }
    }

    try {
      if (edit.action === 'create' && onCreateFile) {
        onCreateFile(edit.path, edit.newContent);
      } else {
        onChangeFile(edit.path, edit.newContent);
      }

      // Sync to in-browser WebContainer filesystem
      void webcontainerService.syncFile(edit.path, edit.newContent);

      edit.status = 'applied';
      edit.appliedAt = Date.now();

      return { success: true, checkpointId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }
}
