/**
 * Supabase Cloud Project Service for GB Coder.
 *
 * Coordinates private cloud project metadata (PostgreSQL public.cloud_projects)
 * and encrypted/isolated project file snapshots (Supabase Storage 'gb-coder-projects').
 *
 * Security & Boundary Contracts:
 * - Operates strictly through the authenticated user's session (auth.uid()).
 * - Row Level Security (RLS) on public.cloud_projects enforces owner_id = auth.uid().
 * - Storage RLS restricts bucket operations strictly to the user's folder:
 *   `<owner_id>/<project_id>/snapshot.json`.
 * - Employs optimistic revision counters (cloud_revision) to detect and prevent
 *   silent multi-device or multi-tab overwrites.
 * - Never includes or exposes service-role keys or secrets.
 */
import type { ProjectFile, ProjectType } from '../../types/files';
import type { EditorStyle, ProjectRecord } from './projectDatabase';
import { getSupabaseClient } from '../auth/supabaseClient';

export const CLOUD_STORAGE_BUCKET = 'gb-coder-projects';

export interface CloudProjectRecord {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  project_type: ProjectType;
  editor_style: EditorStyle;
  source_provider: 'local' | 'github';
  source_repo_full_name: string | null;
  source_repo_id: number | null;
  source_branch: string | null;
  cloud_revision: number;
  storage_path: string;
  file_count: number;
  entry: string | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
}

export interface CloudProjectSnapshot {
  version: 1;
  projectId: string;
  name: string;
  projectType: ProjectType;
  editorStyle: EditorStyle;
  entry?: string;
  files: ProjectFile[];
  exportedAt: string;
}

export interface CreateCloudProjectInput {
  name: string;
  description?: string;
  project_type: ProjectType;
  editor_style: EditorStyle;
  source_provider?: 'local' | 'github';
  source_repo_full_name?: string | null;
  source_repo_id?: number | null;
  source_branch?: string | null;
  entry?: string;
  files: ProjectFile[];
}

export interface SaveCloudProjectOptions {
  name?: string;
  description?: string;
  entry?: string;
  expectedRevision?: number;
  forceOverwrite?: boolean;
}

export class CloudSyncConflictError extends Error {
  readonly currentRevision: number;
  readonly expectedRevision: number;

  constructor(currentRevision: number, expectedRevision: number) {
    super(
      `Cloud conflict detected: project has revision ${currentRevision}, but local was at ${expectedRevision}. Please choose whether to overwrite cloud or save as a new copy.`,
    );
    this.name = 'CloudSyncConflictError';
    this.currentRevision = currentRevision;
    this.expectedRevision = expectedRevision;
  }
}

/**
 * Returns all cloud projects owned by the currently authenticated user.
 */
export const listCloudProjects = async (): Promise<CloudProjectRecord[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('cloud_projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[CloudProjectService] listCloudProjects notice:', error.message);
    return [];
  }

  return (data as CloudProjectRecord[]) || [];
};

/**
 * Fetches a single cloud project by ID.
 */
export const getCloudProject = async (id: string): Promise<CloudProjectRecord | null> => {
  const client = getSupabaseClient();
  if (!client || !id) return null;

  const { data, error } = await client
    .from('cloud_projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('[CloudProjectService] getCloudProject notice:', error.message);
    return null;
  }

  return (data as CloudProjectRecord) || null;
};

/**
 * Uploads project files snapshot to private Supabase Storage and creates
 * the corresponding public.cloud_projects record under the user's owner_id.
 */
export const createCloudProject = async (
  input: CreateCloudProjectInput,
): Promise<CloudProjectRecord> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Must be authenticated to create a cloud project.');
  }

  const ownerId = session.user.id;
  const projectId = crypto.randomUUID();
  const storagePath = `${ownerId}/${projectId}/snapshot.json`;

  const snapshot: CloudProjectSnapshot = {
    version: 1,
    projectId,
    name: input.name.trim(),
    projectType: input.project_type,
    editorStyle: input.editor_style,
    entry: input.entry || 'index.html',
    files: input.files,
    exportedAt: new Date().toISOString(),
  };

  const payload = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });

  // 1. Upload snapshot to storage
  const { error: uploadError } = await client.storage
    .from(CLOUD_STORAGE_BUCKET)
    .upload(storagePath, blob, {
      contentType: 'application/json',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload project files to storage: ${uploadError.message}`);
  }

  // 2. Insert metadata record in PostgreSQL
  const newRecord = {
    id: projectId,
    owner_id: ownerId,
    name: input.name.trim(),
    description: (input.description || '').trim(),
    project_type: input.project_type,
    editor_style: input.editor_style,
    source_provider: input.source_provider || 'local',
    source_repo_full_name: input.source_repo_full_name || null,
    source_repo_id: input.source_repo_id || null,
    source_branch: input.source_branch || null,
    cloud_revision: 1,
    storage_path: storagePath,
    file_count: input.files.length,
    entry: input.entry || 'index.html',
  };

  const { data, error: insertError } = await client
    .from('cloud_projects')
    .insert(newRecord)
    .select('*')
    .single();

  if (insertError) {
    // Attempt storage cleanup if row insert failed
    void client.storage.from(CLOUD_STORAGE_BUCKET).remove([storagePath]);
    throw new Error(`Failed to save cloud project metadata: ${insertError.message}`);
  }

  return data as CloudProjectRecord;
};

/**
 * Saves updated project files to an existing cloud project with revision conflict detection.
 */
export const saveProjectToCloud = async (
  cloudProjectId: string,
  files: ProjectFile[],
  options?: SaveCloudProjectOptions,
): Promise<CloudProjectRecord> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const existing = await getCloudProject(cloudProjectId);
  if (!existing) {
    throw new Error(`Cloud project not found: ${cloudProjectId}`);
  }

  // Revision conflict check
  if (
    options?.expectedRevision !== undefined &&
    !options.forceOverwrite &&
    existing.cloud_revision !== options.expectedRevision
  ) {
    throw new CloudSyncConflictError(existing.cloud_revision, options.expectedRevision);
  }

  const nextRevision = existing.cloud_revision + 1;
  const snapshot: CloudProjectSnapshot = {
    version: 1,
    projectId: cloudProjectId,
    name: options?.name?.trim() || existing.name,
    projectType: existing.project_type,
    editorStyle: existing.editor_style,
    entry: options?.entry || existing.entry || 'index.html',
    files,
    exportedAt: new Date().toISOString(),
  };

  const payload = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });

  // Upload updated snapshot
  const { error: uploadError } = await client.storage
    .from(CLOUD_STORAGE_BUCKET)
    .upload(existing.storage_path, blob, {
      contentType: 'application/json',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload updated snapshot: ${uploadError.message}`);
  }

  // Update DB record
  const updatePayload: Record<string, unknown> = {
    cloud_revision: nextRevision,
    file_count: files.length,
    last_synced_at: new Date().toISOString(),
  };

  if (options?.name) updatePayload.name = options.name.trim();
  if (options?.description !== undefined) updatePayload.description = options.description.trim();
  if (options?.entry) updatePayload.entry = options.entry;

  const { data, error: updateError } = await client
    .from('cloud_projects')
    .update(updatePayload)
    .eq('id', cloudProjectId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update cloud project metadata: ${updateError.message}`);
  }

  return data as CloudProjectRecord;
};

/**
 * Downloads and parses project files from private Supabase Storage.
 */
export const loadCloudProjectFiles = async (
  storagePath: string,
): Promise<{ files: ProjectFile[]; entry: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await client.storage.from(CLOUD_STORAGE_BUCKET).download(storagePath);
  if (error || !data) {
    throw new Error(`Failed to download project files from storage: ${error?.message || 'Empty file'}`);
  }

  const text = await data.text();
  const parsed = JSON.parse(text) as CloudProjectSnapshot;

  if (!parsed.files || !Array.isArray(parsed.files)) {
    throw new Error('Downloaded snapshot contains invalid or missing file data.');
  }

  return {
    files: parsed.files,
    entry: parsed.entry || 'index.html',
  };
};

/**
 * Deletes both the cloud storage snapshot and PostgreSQL metadata row.
 */
export const deleteCloudProject = async (
  cloudProjectId: string,
  storagePath?: string,
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  let resolvedPath = storagePath;
  if (!resolvedPath) {
    const proj = await getCloudProject(cloudProjectId);
    resolvedPath = proj?.storage_path;
  }

  // 1. Delete storage object if path known
  if (resolvedPath) {
    try {
      await client.storage.from(CLOUD_STORAGE_BUCKET).remove([resolvedPath]);
    } catch {
      // Continue to DB deletion even if storage remove failed
    }
  }

  // 2. Delete database row
  const { error } = await client.from('cloud_projects').delete().eq('id', cloudProjectId);
  if (error) {
    console.warn('[CloudProjectService] deleteCloudProject error:', error.message);
    return false;
  }

  return true;
};

/**
 * Converts a local ProjectRecord and its files into a new Private Cloud Project.
 */
export const uploadLocalProjectToCloud = async (
  localProject: ProjectRecord,
  files: ProjectFile[],
  description = '',
): Promise<CloudProjectRecord> => {
  return await createCloudProject({
    name: localProject.name,
    description,
    project_type: localProject.projectType || 'plain',
    editor_style: localProject.editorStyle,
    entry: localProject.entry || 'index.html',
    files,
    source_provider: 'local',
  });
};

