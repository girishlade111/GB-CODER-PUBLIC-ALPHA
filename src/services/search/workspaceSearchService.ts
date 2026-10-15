import { ProjectFile } from '../../types/files';

export interface SearchMatch {
  id: string;
  path: string;
  lineNumber: number;
  column: number;
  matchLength: number;
  lineText: string;
  prefixText: string;
  matchText: string;
  suffixText: string;
  fileLength: number;
}

export interface FileSearchResult {
  path: string;
  matches: SearchMatch[];
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  maxResults?: number;
}

export interface PatternCompilationResult {
  regex: RegExp | null;
  error: string | null;
}

/** Directory segments to ignore when scanning workspace files */
export const IGNORED_DIRECTORY_NAMES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.cache',
  '.turbo',
  'coverage',
  '.output',
  'vendor',
]);

/** Binary or non-text file extensions to skip */
export const BINARY_OR_UNSUPPORTED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'tiff', 'avif',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp3', 'wav', 'ogg', 'flac', 'aac',
  'mp4', 'webm', 'mov', 'avi', 'mkv',
  'zip', 'tar', 'gz', 'bz2', '7z', 'rar',
  'pdf', 'bin', 'exe', 'dll', 'so', 'dylib', 'wasm',
  'iso', 'dmg', 'pkg', 'apk',
]);

/**
 * Checks if a file path is in an ignored directory.
 */
export function isIgnoredPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const segments = normalized.split('/');
  return segments.some((segment) => IGNORED_DIRECTORY_NAMES.has(segment.toLowerCase()));
}

/**
 * Checks if a file is binary or unsupported for text search based on its extension.
 */
export function isBinaryOrUnsupportedFile(filePath: string): boolean {
  const dotIndex = filePath.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = filePath.slice(dotIndex + 1).toLowerCase();
  return BINARY_OR_UNSUPPORTED_EXTENSIONS.has(ext);
}

/**
 * Escapes plain text for literal regex matching.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiles a search pattern into a RegExp with error reporting.
 */
export function compileSearchPattern(
  query: string,
  options: SearchOptions,
): PatternCompilationResult {
  if (!query) {
    return { regex: null, error: null };
  }

  let patternStr = query;
  if (!options.useRegex) {
    patternStr = escapeRegex(query);
  }

  if (options.wholeWord) {
    // If the pattern starts/ends with word chars, apply \b boundaries
    patternStr = `\\b(?:${patternStr})\\b`;
  }

  const flags = options.caseSensitive ? 'g' : 'gi';

  try {
    const regex = new RegExp(patternStr, flags);
    return { regex, error: null };
  } catch (err) {
    return {
      regex: null,
      error: err instanceof Error ? err.message : 'Invalid regular expression',
    };
  }
}

/**
 * Searches across the authoritative collection of project files.
 * Includes both filename matching and source content matching.
 */
export function searchWorkspaceFiles(
  files: ProjectFile[],
  query: string,
  options: SearchOptions,
): { results: FileSearchResult[]; totalMatches: number; error: string | null } {
  if (!query || query.trim() === '') {
    return { results: [], totalMatches: 0, error: null };
  }

  const { regex, error } = compileSearchPattern(query, options);
  if (error || !regex) {
    return { results: [], totalMatches: 0, error };
  }

  const maxResults = options.maxResults ?? 2000;
  const fileResults: FileSearchResult[] = [];
  let totalMatches = 0;

  for (const file of files) {
    if (totalMatches >= maxResults) break;
    if (isIgnoredPath(file.path) || isBinaryOrUnsupportedFile(file.path)) {
      continue;
    }

    const content = file.content ?? '';
    const fileLength = content.length;
    const lines = content.split('\n');
    const fileMatches: SearchMatch[] = [];

    // 1. Content search line by line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (totalMatches >= maxResults) break;
      const lineText = lines[lineIndex];

      // Reset regex state for each line
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchLength = match[0].length;
        if (matchLength === 0) {
          // Prevent infinite loop on zero-width matches
          regex.lastIndex = matchStart + 1;
          continue;
        }

        const matchEnd = matchStart + matchLength;
        const prefixText = lineText.slice(Math.max(0, matchStart - 40), matchStart);
        const matchText = match[0];
        const suffixText = lineText.slice(matchEnd, Math.min(lineText.length, matchEnd + 40));

        fileMatches.push({
          id: `${file.path}:${lineIndex + 1}:${matchStart + 1}`,
          path: file.path,
          lineNumber: lineIndex + 1,
          column: matchStart + 1,
          matchLength,
          lineText,
          prefixText,
          matchText,
          suffixText,
          fileLength,
        });

        totalMatches++;
        if (totalMatches >= maxResults) break;
        if (!regex.global) break;
      }
    }

    // 2. Also check if filename itself matches when content had no matches
    if (fileMatches.length === 0) {
      regex.lastIndex = 0;
      if (regex.test(file.path)) {
        fileMatches.push({
          id: `${file.path}:1:1`,
          path: file.path,
          lineNumber: 1,
          column: 1,
          matchLength: 0,
          lineText: `(File name match: ${file.path})`,
          prefixText: '',
          matchText: file.path,
          suffixText: '',
          fileLength,
        });
        totalMatches++;
      }
    }

    if (fileMatches.length > 0) {
      fileResults.push({
        path: file.path,
        matches: fileMatches,
      });
    }
  }

  return { results: fileResults, totalMatches, error: null };
}

/**
 * Replaces regex capture placeholders ($1, $2, etc.) or returns literal text.
 */
function computeReplacement(
  matchedText: string,
  replacementTemplate: string,
  regex: RegExp | null,
): string {
  if (!regex) return replacementTemplate;
  // If regex was used, apply string replace logic to expand $1, $2
  return matchedText.replace(regex, replacementTemplate);
}

export interface ReplaceValidationResult {
  valid: boolean;
  reason?: string;
  newContent?: string;
}

/**
 * Safely replaces a single match within a file's content.
 * Validates that the line and file still match the expected revision before replacing.
 */
export function safeReplaceSingleMatch(
  currentFileContent: string,
  match: SearchMatch,
  replacementText: string,
  options: SearchOptions,
): ReplaceValidationResult {
  const lines = currentFileContent.split('\n');
  const targetLineIdx = match.lineNumber - 1;

  if (targetLineIdx < 0 || targetLineIdx >= lines.length) {
    return {
      valid: false,
      reason: `Line ${match.lineNumber} no longer exists in ${match.path}. Source was modified.`,
    };
  }

  const currentLine = lines[targetLineIdx];
  const colIdx = match.column - 1;

  // Verify the text at that position matches the expected matchText
  const candidate = currentLine.slice(colIdx, colIdx + match.matchLength);
  const isMatchValid = options.caseSensitive
    ? candidate === match.matchText
    : candidate.toLowerCase() === match.matchText.toLowerCase();

  if (!isMatchValid) {
    return {
      valid: false,
      reason: `Content at line ${match.lineNumber} has changed since search was executed.`,
    };
  }

  const { regex } = compileSearchPattern(match.matchText, options);
  const expandedReplacement = computeReplacement(candidate, replacementText, regex);

  const newLine =
    currentLine.slice(0, colIdx) +
    expandedReplacement +
    currentLine.slice(colIdx + match.matchLength);

  lines[targetLineIdx] = newLine;
  return {
    valid: true,
    newContent: lines.join('\n'),
  };
}

/**
 * Safely replaces all occurrences within one file.
 */
export function safeReplaceInFile(
  currentFileContent: string,
  searchQuery: string,
  replacementText: string,
  options: SearchOptions,
): ReplaceValidationResult {
  const { regex, error } = compileSearchPattern(searchQuery, options);
  if (error || !regex) {
    return { valid: false, reason: error || 'Invalid pattern' };
  }

  if (!regex.test(currentFileContent)) {
    return {
      valid: false,
      reason: 'No matches found in file for the specified pattern.',
    };
  }

  // Reset regex
  regex.lastIndex = 0;
  const newContent = currentFileContent.replace(regex, replacementText);
  return {
    valid: true,
    newContent,
  };
}

/**
 * Recent search queries storage helper.
 */
const RECENT_SEARCHES_KEY = 'gbcoder_recent_searches_v1';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  if (!query || query.trim() === '') return getRecentSearches();
  try {
    const current = getRecentSearches().filter((q) => q !== query);
    const updated = [query.trim(), ...current].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore storage errors
  }
}
