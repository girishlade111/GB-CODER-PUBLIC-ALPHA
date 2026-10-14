/**
 * GB Coder — Backup and Restore Types & Invariants
 *
 * Defines the versioned backup archive specification, manifest schema,
 * cryptographic integrity metadata, conflict resolution strategies,
 * and allowlisted preferences.
 */
import type { EditorStyle } from '../projects/projectDatabase';
import type { ProjectFile, ProjectType } from '../../types/files';
import type { StoredWorkspace } from '../vscodeWorkspaceStore';

/** Formal schema version for the backup archive format. */
export const BACKUP_FORMAT_NAME = 'gb-coder-backup' as const;
export const BACKUP_FORMAT_VERSION = 1 as const;
export const BACKUP_INTEGRITY_ALGORITHM = 'SHA-256' as const;

/** Safety caps to defend against decompression bombs and denial of service. */
export const BACKUP_MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024; // 100 MB max uncompressed archive size
export const BACKUP_MAX_FILES_COUNT = 2500; // 2,500 total files max
export const BACKUP_MAX_ENTRY_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max single file size

/**
 * Strict allowlist of safe LocalStorage preference keys.
 * API keys, authentication credentials, and runtime audit logs are strictly excluded.
 */
export const ALLOWLISTED_PREFERENCE_KEYS = [
  'gbcoder_theme',
  'theme',
  'gbcoder_settings',
  'gb-coder-settings',
  'gbcoder_custom_templates',
  'gb-coder-auto-format-settings',
  'gbcoder_device_preset',
  'gbcoder_vscode_right_panel_width',
  'gb-coder-vscode-view',
  'gbcoder_onboarded',
] as const;

export type AllowlistedPreferenceKey = typeof ALLOWLISTED_PREFERENCE_KEYS[number];

/** Project metadata stored within the archive. */
export interface BackupProjectMeta {
  id: string;
  name: string;
  createdAt: number;
  lastOpenedAt: number;
  editorStyle: EditorStyle;
  projectType: ProjectType;
  entry?: string;
  fileCount: number;
  [key: string]: unknown;
}

/** Complete manifest specification located at `manifest.json`. */
export interface BackupManifest {
  format: typeof BACKUP_FORMAT_NAME;
  formatVersion: typeof BACKUP_FORMAT_VERSION;
  application: 'GB Coder';
  applicationVersion?: string;
  createdAt: number; // epoch ms
  exportedAt: string; // ISO 8601 string
  sourceOrigin: string;
  exportedProjectCount: number;
  exportedFileCount: number;
  workspaceIncluded: boolean;
  preferencesIncluded: boolean;
  integrityAlgorithm: typeof BACKUP_INTEGRITY_ALGORITHM;
  projects: BackupProjectMeta[];
}

/** Map of relative file paths in the ZIP archive to their SHA-256 hex string. */
export type BackupChecksums = Record<string, string>;

/** Project payload bundled in the archive. */
export interface BackupProjectPayload {
  metadata: BackupProjectMeta;
  files: ProjectFile[];
}

/** Complete structured representation of a backup before compression or after parsing. */
export interface BackupData {
  manifest: BackupManifest;
  projects: BackupProjectPayload[];
  workspace?: StoredWorkspace | null;
  preferences?: Record<string, string>;
  checksums: BackupChecksums;
}

/** Action to be taken for an individual project during restore. */
export type RestoreProjectAction = 'create_new' | 'create_copy' | 'skip';

/** Individual project restoration plan item. */
export interface RestorePlanProject {
  originalId: string;
  targetId: string;
  name: string;
  targetName: string;
  fileCount: number;
  projectType: ProjectType;
  editorStyle: EditorStyle;
  action: RestoreProjectAction;
  conflict: boolean;
  files: ProjectFile[];
  metadata: BackupProjectMeta;
}

/** Full preview plan produced before executing restoration. */
export interface RestorePlan {
  manifest: BackupManifest;
  projects: RestorePlanProject[];
  hasWorkspace: boolean;
  restoreWorkspace: boolean;
  hasPreferences: boolean;
  restorePreferences: boolean;
  totalFilesToRestore: number;
  conflictsCount: number;
}

/** Result of archive validation and analysis. */
export interface RestoreAnalysis {
  valid: boolean;
  error?: string;
  warnings: string[];
  plan: RestorePlan;
  rawArchiveData: BackupData;
}

/** Final execution report after restoring projects to browser storage. */
export interface RestoreExecutionResult {
  success: boolean;
  restoredProjectCount: number;
  restoredFileCount: number;
  restoredProjects: Array<{ id: string; name: string }>;
  restoredWorkspace: boolean;
  restoredPreferences: boolean;
  errors?: string[];
}

/** Export progress notification callback. */
export type BackupProgressCallback = (stage: string, percent: number) => void;

/** Summary output of a backup export. */
export interface BackupExportResult {
  success: boolean;
  filename: string;
  sizeBytes: number;
  projectCount: number;
  fileCount: number;
  blob: Blob;
  manifest: BackupManifest;
}
