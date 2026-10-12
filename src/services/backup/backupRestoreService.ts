/**
 * GB Coder — Safe Project Backup Restore & Verification Service
 *
 * Implements safe, non-destructive restoration of projects from GB Coder
 * backup archives with SHA-256 cryptographic integrity verification,
 * ZIP-slip and ZIP-bomb defenses, conflict resolution, and staged verification.
 */

import { getProject, listProjects, readProjectFiles, restoreProject, type ProjectRecord } from '../projects/projectDatabase';
import { saveWorkspace, type StoredWorkspace } from '../vscodeWorkspaceStore';
import {
  ALLOWLISTED_PREFERENCE_KEYS,
  BACKUP_FORMAT_NAME,
  BACKUP_FORMAT_VERSION,
  BACKUP_MAX_ENTRY_SIZE_BYTES,
  BACKUP_MAX_FILES_COUNT,
  BACKUP_MAX_UNCOMPRESSED_BYTES,
  type BackupChecksums,
  type BackupData,
  type BackupManifest,
  type BackupProjectMeta,
  type BackupProjectPayload,
  type RestoreAnalysis,
  type RestoreExecutionResult,
  type RestorePlan,
  type RestorePlanProject,
} from './backupTypes';
import { computeSha256, safeJsonParse, validateAndNormalizeArchivePath } from './backupCrypto';
import type { ProjectFile } from '../../types/files';

/** Custom event dispatched when projects have been restored to trigger UI refreshes. */
export const PROJECTS_RESTORED_EVENT = 'gb-coder:projects-updated';

/**
 * Generates a unique project identifier.
 */
function createNewId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // fallback
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Analyzes and validates an uploaded backup archive file or buffer.
 * Performs deep security checks, manifest schema validation, cryptographic checksum
 * verification, and creates a non-destructive restoration plan with conflict detection.
 */
export async function analyzeBackupArchive(
  fileOrBuffer: Blob | File | ArrayBuffer | Uint8Array,
): Promise<RestoreAnalysis> {
  const warnings: string[] = [];

  // Dynamically load JSZip
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  let loadedZip: InstanceType<typeof JSZip>;
  try {
    loadedZip = await zip.loadAsync(fileOrBuffer);
  } catch (err) {
    throw new Error(`Corrupted or unreadable ZIP archive: ${(err as Error).message}`);
  }

  // 1. Security Check: File count and path traversal (ZIP Slip)
  const entries = Object.keys(loadedZip.files);
  if (entries.length === 0) {
    throw new Error('Archive is empty: no files found.');
  }

  if (entries.length > BACKUP_MAX_FILES_COUNT) {
    throw new Error(`Archive exceeds maximum allowed entries limit (${entries.length} > ${BACKUP_MAX_FILES_COUNT}).`);
  }

  let totalUncompressedEstimate = 0;
  for (const entryName of entries) {
    const zipEntry = loadedZip.files[entryName];
    if (zipEntry.dir) continue;

    // Validate path against ZIP-slip and dangerous characters
    validateAndNormalizeArchivePath(entryName);

    // Approximate size check
    const entryData = (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data;
    if (entryData?.uncompressedSize) {
      if (entryData.uncompressedSize > BACKUP_MAX_ENTRY_SIZE_BYTES) {
        throw new Error(`Archive entry "${entryName}" exceeds maximum file size limit.`);
      }
      totalUncompressedEstimate += entryData.uncompressedSize;
    }
  }

  if (totalUncompressedEstimate > BACKUP_MAX_UNCOMPRESSED_BYTES) {
    throw new Error('Decompressed archive size exceeds safety threshold (100 MB).');
  }

  // 2. Read and validate manifest.json
  const manifestEntry = loadedZip.file('manifest.json');
  if (!manifestEntry) {
    throw new Error('Missing "manifest.json": This file is not a valid GB Coder backup archive.');
  }

  const manifestRaw = await manifestEntry.async('string');
  let manifest: BackupManifest;
  try {
    manifest = safeJsonParse<BackupManifest>(manifestRaw);
  } catch (err) {
    throw new Error(`Invalid manifest.json: ${(err as Error).message}`);
  }

  if (manifest.format !== BACKUP_FORMAT_NAME) {
    throw new Error(`Unsupported archive format "${manifest.format}". Expected "${BACKUP_FORMAT_NAME}".`);
  }

  if (manifest.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error(`Unsupported backup format version ${manifest.formatVersion}. Expected version ${BACKUP_FORMAT_VERSION}.`);
  }

  if (!Array.isArray(manifest.projects)) {
    throw new Error('Malformed manifest: projects list is missing or invalid.');
  }

  // 3. Read and verify integrity/checksums.json
  const checksumsEntry = loadedZip.file('integrity/checksums.json');
  let checksums: BackupChecksums = {};
  if (checksumsEntry) {
    try {
      const checksumsRaw = await checksumsEntry.async('string');
      checksums = safeJsonParse<BackupChecksums>(checksumsRaw);
    } catch {
      warnings.push('Integrity checksums file could not be parsed; continuing with entry validation.');
    }
  } else {
    warnings.push('Archive does not contain integrity/checksums.json; cryptographic verification skipped.');
  }

  // Cryptographic checksum verification for recorded entries
  for (const [relPath, expectedHash] of Object.entries(checksums)) {
    const fileInZip = loadedZip.file(relPath);
    if (!fileInZip) {
      throw new Error(`Archive verification failed: missing file listed in checksums: "${relPath}"`);
    }
    const content = await fileInZip.async('string');
    const computedHash = await computeSha256(content);
    if (computedHash.toLowerCase() !== expectedHash.toLowerCase()) {
      throw new Error(`Cryptographic integrity failure: file "${relPath}" checksum mismatch.`);
    }
  }

  // 4. Extract Project Payloads
  const projectPayloads: BackupProjectPayload[] = [];
  for (const projMeta of manifest.projects) {
    const projDir = `projects/${projMeta.id}`;
    const filesDir = `${projDir}/files/`;
    const files: ProjectFile[] = [];

    for (const [entryPath, entry] of Object.entries(loadedZip.files)) {
      if (entry.dir || !entryPath.startsWith(filesDir)) continue;

      const relFilePath = entryPath.slice(filesDir.length);
      const cleanFilePath = validateAndNormalizeArchivePath(relFilePath);
      const content = await entry.async('string');

      files.push({
        path: cleanFilePath,
        content,
      });
    }

    projectPayloads.push({
      metadata: projMeta,
      files,
    });
  }

  // 5. Extract optional workspace
  let workspace: StoredWorkspace | null = null;
  const wsEntry = loadedZip.file('workspace/state.json');
  if (wsEntry) {
    try {
      const wsRaw = await wsEntry.async('string');
      workspace = safeJsonParse<StoredWorkspace>(wsRaw);
    } catch {
      warnings.push('Optional workspace state was present but invalid; skipped.');
    }
  }

  // 6. Extract optional preferences
  let preferences: Record<string, string> | undefined;
  const prefEntry = loadedZip.file('preferences/settings.json');
  if (prefEntry) {
    try {
      const prefRaw = await prefEntry.async('string');
      const parsedPrefs = safeJsonParse<Record<string, unknown>>(prefRaw);
      preferences = {};
      for (const key of ALLOWLISTED_PREFERENCE_KEYS) {
        if (typeof parsedPrefs[key] === 'string') {
          preferences[key] = parsedPrefs[key] as string;
        }
      }
    } catch {
      warnings.push('Optional preferences file was invalid; skipped.');
    }
  }

  const rawArchiveData: BackupData = {
    manifest,
    projects: projectPayloads,
    workspace,
    preferences,
    checksums,
  };

  // 7. Check for conflicts against existing projects in IndexedDB
  const existingProjects = await listProjects();
  const existingIdSet = new Set(existingProjects.map((p) => p.id));
  const existingNameSet = new Set(existingProjects.map((p) => p.name.trim().toLowerCase()));

  const planProjects: RestorePlanProject[] = [];
  let conflictsCount = 0;
  let totalFilesToRestore = 0;

  for (const payload of projectPayloads) {
    const originalId = payload.metadata.id;
    const isConflict = existingIdSet.has(originalId);

    let targetId = originalId;
    let targetName = payload.metadata.name;
    let action: RestorePlanProject['action'] = 'create_new';

    if (isConflict) {
      conflictsCount++;
      // Non-destructive conflict resolution: allocate fresh UUID and append (Restored)
      targetId = createNewId();
      let candidateName = `${payload.metadata.name} (Restored)`;
      let counter = 2;
      while (existingNameSet.has(candidateName.toLowerCase())) {
        candidateName = `${payload.metadata.name} (Restored ${counter})`;
        counter++;
      }
      targetName = candidateName;
      action = 'create_copy';
    }

    totalFilesToRestore += payload.files.length;

    planProjects.push({
      originalId,
      targetId,
      name: payload.metadata.name,
      targetName,
      fileCount: payload.files.length,
      projectType: payload.metadata.projectType || 'plain',
      editorStyle: payload.metadata.editorStyle || 'plain',
      action,
      conflict: isConflict,
      files: payload.files,
      metadata: payload.metadata,
    });
  }

  const plan: RestorePlan = {
    manifest,
    projects: planProjects,
    hasWorkspace: Boolean(workspace && workspace.files && workspace.files.length > 0),
    restoreWorkspace: false, // Default: keep existing workspace untouched
    hasPreferences: Boolean(preferences && Object.keys(preferences).length > 0),
    restorePreferences: false, // Default: keep existing preferences untouched
    totalFilesToRestore,
    conflictsCount,
  };

  return {
    valid: true,
    warnings,
    plan,
    rawArchiveData,
  };
}

export interface RestoreOptions {
  restoreWorkspace?: boolean;
  restorePreferences?: boolean;
}

/**
 * Executes a planned restore operation using transactional writes and post-restore verification.
 */
export async function executeRestorePlan(
  analysis: RestoreAnalysis,
  options: RestoreOptions = {},
): Promise<RestoreExecutionResult> {
  const { plan, rawArchiveData } = analysis;
  const errors: string[] = [];
  const restoredProjects: Array<{ id: string; name: string }> = [];
  let totalFilesRestored = 0;

  // 1. Restore projects to IndexedDB in isolated transactions
  for (const planProj of plan.projects) {
    if (planProj.action === 'skip') {
      continue;
    }

    const now = Date.now();
    const recordToInsert: ProjectRecord = {
      ...planProj.metadata,
      id: planProj.targetId,
      name: planProj.targetName,
      createdAt: planProj.metadata.createdAt || now,
      lastOpenedAt: now,
      editorStyle: planProj.editorStyle,
      projectType: planProj.projectType,
      entry: planProj.metadata.entry,
      fileCount: planProj.files.length,
    };

    const saved = await restoreProject(recordToInsert, planProj.files);
    if (!saved) {
      errors.push(`Failed to save project "${planProj.targetName}" to local database.`);
      continue;
    }

    // Staged post-restore verification: read back from IndexedDB
    const verifiedRecord = await getProject(planProj.targetId);
    const verifiedFiles = await readProjectFiles(planProj.targetId);

    if (!verifiedRecord || verifiedFiles.length !== planProj.files.length) {
      errors.push(`Verification mismatch for restored project "${planProj.targetName}".`);
      continue;
    }

    restoredProjects.push({ id: verifiedRecord.id, name: verifiedRecord.name });
    totalFilesRestored += verifiedFiles.length;
  }

  // 2. Optional: Restore VS Code workspace
  let restoredWorkspace = false;
  if (options.restoreWorkspace && plan.hasWorkspace && rawArchiveData.workspace) {
    try {
      const ws = rawArchiveData.workspace;
      const wsProject = {
        projectType: ws.projectType,
        files: ws.files,
        entry: ws.entry,
      };
      await saveWorkspace(wsProject, ws.returnTo);
      restoredWorkspace = true;
    } catch (err) {
      errors.push(`Failed to restore workspace: ${(err as Error).message}`);
    }
  }

  // 3. Optional: Restore allowlisted preferences
  let restoredPreferences = false;
  if (options.restorePreferences && plan.hasPreferences && rawArchiveData.preferences && typeof window !== 'undefined') {
    try {
      for (const [key, val] of Object.entries(rawArchiveData.preferences)) {
        if (ALLOWLISTED_PREFERENCE_KEYS.includes(key as typeof ALLOWLISTED_PREFERENCE_KEYS[number])) {
          window.localStorage.setItem(key, val);
        }
      }
      restoredPreferences = true;
    } catch (err) {
      errors.push(`Failed to restore preferences: ${(err as Error).message}`);
    }
  }

  // 4. Dispatch event to notify dashboard of project updates
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PROJECTS_RESTORED_EVENT, { detail: { count: restoredProjects.length } }));
    } catch {
      // Ignored in non-window environments
    }
  }

  return {
    success: errors.length === 0,
    restoredProjectCount: restoredProjects.length,
    restoredFileCount: totalFilesRestored,
    restoredProjects,
    restoredWorkspace,
    restoredPreferences,
    errors: errors.length > 0 ? errors : undefined,
  };
}
