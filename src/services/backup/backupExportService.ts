/**
 * GB Coder — Complete Browser-Local Project Export Service
 *
 * Exports all local projects, files, metadata, optional workspace state,
 * and allowlisted preferences into a single, portable, versioned ZIP archive
 * with SHA-256 cryptographic integrity checksums.
 *
 * Purely client-side: requires zero cloud servers, zero backend APIs, zero auth.
 */

import { listProjects, readProjectFiles } from '../projects/projectDatabase';
import { loadWorkspace } from '../vscodeWorkspaceStore';
import {
  ALLOWLISTED_PREFERENCE_KEYS,
  BACKUP_FORMAT_NAME,
  BACKUP_FORMAT_VERSION,
  BACKUP_INTEGRITY_ALGORITHM,
  type BackupChecksums,
  type BackupExportResult,
  type BackupManifest,
  type BackupProgressCallback,
  type BackupProjectMeta,
} from './backupTypes';
import { computeSha256, validateAndNormalizeArchivePath } from './backupCrypto';

/**
 * Generates a timestamped, safe filename for the backup archive.
 * Format: `gb-coder-backup-YYYY-MM-DD-HHMMSS.zip`
 */
export function generateBackupFilename(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `gb-coder-backup-${year}-${month}-${day}-${hours}${minutes}${seconds}.zip`;
}

/**
 * Gathers allowlisted preferences from LocalStorage safely.
 * API keys and sensitive tokens are strictly ignored.
 */
export function exportPreferences(): Record<string, string> {
  const preferences: Record<string, string> = {};
  if (typeof window === 'undefined' || !window.localStorage) {
    return preferences;
  }

  for (const key of ALLOWLISTED_PREFERENCE_KEYS) {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null && val !== undefined) {
        preferences[key] = val;
      }
    } catch {
      // Storage unavailable or blocked; ignore
    }
  }

  return preferences;
}

/**
 * Triggers a native browser file download for a given Blob.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof document === 'undefined' || !document.createElement) {
    return;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ExportOptions {
  onProgress?: BackupProgressCallback;
  download?: boolean;
  includeWorkspace?: boolean;
  includePreferences?: boolean;
}

/**
 * Executes a complete, reliable export of all local projects and associated data.
 */
export async function exportAllProjects(options: ExportOptions = {}): Promise<BackupExportResult> {
  const { onProgress, download = true, includeWorkspace = true, includePreferences = false } = options;

  onProgress?.('Reading local projects…', 5);
  const projects = await listProjects();

  onProgress?.('Collecting files and workspace…', 15);
  let totalFilesCount = 0;
  const projectEntries: Array<{
    meta: BackupProjectMeta;
    files: Array<{ path: string; content: string; language?: string }>;
  }> = [];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const files = await readProjectFiles(p.id);
    totalFilesCount += files.length;
    projectEntries.push({
      meta: {
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        lastOpenedAt: p.lastOpenedAt,
        editorStyle: p.editorStyle,
        projectType: p.projectType,
        entry: p.entry,
        fileCount: files.length,
      },
      files,
    });
    const pct = 15 + Math.round(((i + 1) / (projects.length || 1)) * 25);
    onProgress?.(`Reading project ${i + 1} of ${projects.length}…`, pct);
  }

  // Load VS Code workspace state (if requested and present)
  let workspaceState = null;
  let hasWorkspace = false;
  if (includeWorkspace) {
    const rawWs = await loadWorkspace();
    if (rawWs && rawWs.files && rawWs.files.length > 0) {
      workspaceState = rawWs;
      hasWorkspace = true;
    }
  }

  // Read safe preferences (if requested)
  let preferences: Record<string, unknown> = {};
  let hasPreferences = false;
  if (includePreferences) {
    preferences = exportPreferences();
    hasPreferences = Object.keys(preferences).length > 0;
  }

  // Build manifest
  const now = Date.now();
  const exportedAtIso = new Date(now).toISOString();
  const sourceOrigin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'local';

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT_NAME,
    formatVersion: BACKUP_FORMAT_VERSION,
    application: 'GB Coder',
    applicationVersion: '1.0.0',
    createdAt: now,
    exportedAt: exportedAtIso,
    sourceOrigin,
    exportedProjectCount: projects.length,
    exportedFileCount: totalFilesCount,
    workspaceIncluded: hasWorkspace,
    preferencesIncluded: hasPreferences,
    integrityAlgorithm: BACKUP_INTEGRITY_ALGORITHM,
    projects: projectEntries.map((pe) => pe.meta),
  };

  onProgress?.('Calculating cryptographic checksums…', 45);
  const checksums: BackupChecksums = {};

  // Dynamically load JSZip to prevent leaking it into critical initial bundle
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  // 1. Projects index & individual projects
  const projectsIndexJson = JSON.stringify(projects, null, 2);
  const projectsIndexPath = 'projects/index.json';
  zip.file(projectsIndexPath, projectsIndexJson);
  checksums[projectsIndexPath] = await computeSha256(projectsIndexJson);

  for (const entry of projectEntries) {
    const projDir = `projects/${entry.meta.id}`;
    const metaJson = JSON.stringify(entry.meta, null, 2);
    const metaPath = `${projDir}/metadata.json`;
    zip.file(metaPath, metaJson);
    checksums[metaPath] = await computeSha256(metaJson);

    for (const f of entry.files) {
      const cleanPath = validateAndNormalizeArchivePath(f.path);
      const archiveFilePath = `${projDir}/files/${cleanPath}`;
      zip.file(archiveFilePath, f.content);
      checksums[archiveFilePath] = await computeSha256(f.content);
    }
  }

  // 2. Workspace state (if present)
  if (hasWorkspace && workspaceState) {
    const wsJson = JSON.stringify(workspaceState, null, 2);
    const wsPath = 'workspace/state.json';
    zip.file(wsPath, wsJson);
    checksums[wsPath] = await computeSha256(wsJson);
  }

  // 3. Preferences (if present)
  if (hasPreferences) {
    const prefJson = JSON.stringify(preferences, null, 2);
    const prefPath = 'preferences/settings.json';
    zip.file(prefPath, prefJson);
    checksums[prefPath] = await computeSha256(prefJson);
  }

  // 4. Checksums manifest
  const checksumsJson = JSON.stringify(checksums, null, 2);
  const checksumsPath = 'integrity/checksums.json';
  zip.file(checksumsPath, checksumsJson);

  // 5. Root manifest.json
  const manifestJson = JSON.stringify(manifest, null, 2);
  zip.file('manifest.json', manifestJson);

  onProgress?.('Compressing backup archive…', 60);
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const pct = 60 + Math.round((metadata.percent / 100) * 35);
      onProgress?.(`Compressing archive (${Math.round(metadata.percent)}%)…`, pct);
    },
  );

  const filename = generateBackupFilename(new Date(now));

  if (download && typeof window !== 'undefined') {
    onProgress?.('Starting download…', 98);
    triggerBlobDownload(blob, filename);
  }

  onProgress?.('Export complete.', 100);

  return {
    success: true,
    filename,
    sizeBytes: blob.size,
    projectCount: projects.length,
    fileCount: totalFilesCount,
    blob,
    manifest,
  };
}
