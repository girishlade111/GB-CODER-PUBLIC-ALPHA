/**
 * Phase 2.1C race-coordination helpers for workspace transitions.
 *
 * Pure functions (no React, no storage) so the coordination semantics are
 * unit-testable in node: the browser suites then only prove the wiring.
 */

import { normalizePath, validateFilePath, type ProjectType } from '../types/files';

/** Monotonic generation tokens that invalidate stale async completions. */
export interface TransitionCoordinator {
  /** Starts a transition and returns its generation id. */
  begin: () => number;
  /** True only when `id` is still the latest begun transition. */
  isCurrent: (id: number) => boolean;
}

export const createTransitionCoordinator = (): TransitionCoordinator => {
  let generation = 0;
  return {
    begin: () => {
      generation += 1;
      return generation;
    },
    isCurrent: (id: number) => id === generation,
  };
};

/**
 * Remaps one path across a file-or-folder rename.
 *
 * Exact matches move; anything under `oldPath/` keeps its suffix. Unrelated
 * paths pass through untouched. Used for tab focus, dirty sets and split
 * panes so a folder rename never strands the editor on a folder path.
 */
export const remapPath = (path: string, oldPath: string, newPath: string): string => {
  if (path === oldPath) return newPath;
  if (path.startsWith(`${oldPath}/`)) return newPath + path.slice(oldPath.length);
  return path;
};

export const remapPaths = (paths: string[], oldPath: string, newPath: string): string[] =>
  paths.map((p) => remapPath(p, oldPath, newPath));

/**
 * Chooses which open tab to evict when `openPaths` is already at capacity.
 *
 * Never evicts the focused tab; prefers the oldest clean tab so unsaved work
 * keeps its marker. Tab content itself always lives in project state and the
 * persist pipeline, so eviction only drops tab context — never file content.
 * Returns null when nothing needs evicting or when there is nothing to drop.
 */
export const chooseEvictionTab = (
  openPaths: string[],
  activePath: string | null,
  dirtyPaths: ReadonlySet<string>,
  maxTabs: number,
): string | null => {
  if (openPaths.length < maxTabs) return null;
  const candidates = openPaths.filter((p) => p !== activePath);
  if (candidates.length === 0) return openPaths.length > 0 ? openPaths[0] : null;
  return candidates.find((p) => !dirtyPaths.has(p)) ?? candidates[0];
};

/** True for the `.gitkeep` sentinels that materialize empty folders. */
export const isGitkeepPath = (path: string): boolean => /(^|\/)\.gitkeep$/.test(path);

const checkCollision = (
  path: string,
  existingPaths: string[],
  ignorePath?: string,
  ignorePrefix?: string,
): string | null => {
  const lower = path.toLowerCase();
  const clash = existingPaths.some((p) => {
    if (p === ignorePath) return false;
    if (ignorePrefix && (p === ignorePrefix || p.startsWith(`${ignorePrefix}/`))) return false;
    const ep = p.toLowerCase();
    return (
      ep === lower ||
      // New path is an ancestor of (or equal to, case-shifted) an existing path.
      ep.startsWith(`${lower}/`) ||
      // New path nests under an existing file path.
      lower.startsWith(`${ep}/`)
    );
  });
  return clash ? `"${path}" already exists.` : null;
};

/**
 * Single choke-point validator for IDE file operations.
 *
 * Normalizes, then enforces the same contract as the static explorer
 * (traversal rejection, per-type extensions, case-insensitive collisions),
 * except that `.gitkeep` folder sentinels bypass the extension allowlist.
 * Additionally rejects nesting a file under an existing file's path.
 * Pure — callers show the returned error; data layers additionally no-op.
 */
export const validateWorkspacePath = (
  rawPath: string,
  projectType: ProjectType,
  existingPaths: string[],
  ignorePath?: string,
): { valid: boolean; path: string; error?: string } => {
  const path = normalizePath(rawPath);
  if (isGitkeepPath(path)) {
    if (!path || path.endsWith('/')) return { valid: false, path, error: 'Enter a file name.' };
    if (path.includes('..')) return { valid: false, path, error: 'File name cannot contain "..".' };
    if (!/^[a-zA-Z0-9._\-/]+$/.test(path)) {
      return { valid: false, path, error: 'Use only letters, numbers, dots, dashes, underscores and "/".' };
    }
    const clash = checkCollision(path, existingPaths, ignorePath);
    if (clash) return { valid: false, path, error: clash };
    return { valid: true, path };
  }
  const result = validateFilePath(path, projectType, existingPaths, ignorePath);
  if (!result.valid) return { ...result, path };
  const clash = checkCollision(path, existingPaths, ignorePath);
  if (clash) return { valid: false, path, error: clash };
  return { valid: true, path };
};

/**
 * Validator for folder creates/renames (folders carry no extension, so the
 * file allowlist cannot apply). Rejects traversal, illegal characters,
 * collisions with existing files/subtrees, and moving a folder into itself.
 */
export const validateWorkspaceFolder = (
  rawPath: string,
  existingPaths: string[],
  oldPath?: string,
): { valid: boolean; path: string; error?: string } => {
  const path = normalizePath(rawPath).replace(/\/+$/, '');
  if (!path) return { valid: false, path, error: 'Enter a folder name.' };
  if (path.includes('..')) return { valid: false, path, error: 'Folder name cannot contain "..".' };
  if (!/^[a-zA-Z0-9._\-/]+$/.test(path)) {
    return { valid: false, path, error: 'Use only letters, numbers, dots, dashes, underscores and "/".' };
  }
  if (oldPath) {
    if (path === oldPath) return { valid: true, path };
    if (path.startsWith(`${oldPath}/`)) {
      return { valid: false, path, error: 'Cannot move a folder into itself.' };
    }
  }
  const clash = checkCollision(path, existingPaths, undefined, oldPath);
  if (clash) return { valid: false, path, error: clash };
  return { valid: true, path };
};
