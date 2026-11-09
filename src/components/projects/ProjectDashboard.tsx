import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Archive,
  Check,
  Code2,
  Copy,
  Download,
  Edit3,
  FolderDown,
  FolderPlus,
  Loader2,
  PanelsTopLeft,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
  Cloud,
  HardDrive,
  UploadCloud,
  Github,
  FolderGit2,
} from 'lucide-react';
import LadeStackLogo from '../LadeStackLogo';
import {
  EditorStyle,
  ProjectRecord,
  renameProject,
  duplicateProject,
  readProjectFiles,
  validateProjectName,
  getProject,
  restoreProject,
} from '../../services/projects/projectDatabase';
import {
  listCloudProjects,
  deleteCloudProject,
  loadCloudProjectFiles,
  uploadLocalProjectToCloud,
  saveProjectToCloud,
  getCloudProject,
  CloudProjectRecord,
} from '../../services/projects/cloudProjectService';
import { createZipBlob, downloadBlob, zipFilename } from '../../services/projectArchiveService';
import { MultiFileProject } from '../../types/files';
import toast from 'react-hot-toast';
import UserAccountMenu from '../auth/UserAccountMenu';
import { useAuth } from '../../features/auth/useAuth';
import GitHubRepoBrowserModal from '../github/GitHubRepoBrowserModal';
import GitHubCreateRepoModal from '../github/GitHubCreateRepoModal';

const BackupRestoreModal = React.lazy(() => import('./BackupRestoreModal'));

interface ProjectDashboardProps {
  projects: ProjectRecord[];
  /** Distinguishes "still reading the database" from "there is nothing there". */
  isLoading: boolean;
  onCreate: () => void;
  onOpen: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  /** Import straight from here, which also creates a project. */
  onImport: () => void;
  /** Notifies parent when projects are restored or updated */
  onProjectsChanged?: () => void;
}

const EDITOR_STYLE_LABEL: Record<EditorStyle, string> = {
  plain: 'Static Editor',
  vscode: 'Advanced IDE',
};

const FRAMEWORK_LABEL: Record<string, string> = {
  plain: 'Static HTML',
  react: 'React (Vite)',
  vue: 'Vue (Vite)',
};

const formatOpenedAt = (timestamp: number): string => {
  const elapsed = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < minute) return 'just now';
  if (elapsed < hour) {
    const minutes = Math.floor(elapsed / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (elapsed < day) {
    const hours = Math.floor(elapsed / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (elapsed < 3 * day) {
    const days = Math.floor(elapsed / day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

type SortOption = 'lastOpened' | 'name-asc' | 'name-desc' | 'created-desc' | 'created-asc';

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  isLoading,
  onCreate,
  onOpen,
  onDelete,
  onImport,
  onProjectsChanged,
}) => {
  const { user: authUser, signInWithGitHub } = useAuth();

  // Storage Tab: 'local' | 'cloud'
  const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');

  // Cloud projects state
  const [cloudProjects, setCloudProjects] = useState<CloudProjectRecord[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [savingToCloudId, setSavingToCloudId] = useState<string | null>(null);
  const [openingCloudId, setOpeningCloudId] = useState<string | null>(null);
  const [pendingDeleteCloudId, setPendingDeleteCloudId] = useState<string | null>(null);
  const [isDeletingCloud, setIsDeletingCloud] = useState(false);

  // GitHub integration modals
  const [showGitHubBrowser, setShowGitHubBrowser] = useState(false);
  const [showGitHubCreate, setShowGitHubCreate] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('lastOpened');
  const [editorFilter, setEditorFilter] = useState<'all' | EditorStyle>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'plain' | 'react' | 'vue'>('all');

  // Inline rename state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Inline delete state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplicating & Exporting state
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);

  // Backup/Restore state
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupTab, setBackupTab] = useState<'backup' | 'restore'>('backup');

  // Fetch cloud projects when signed in or when activeTab changes to 'cloud'
  const refreshCloudProjects = useCallback(async () => {
    if (!authUser) {
      setCloudProjects([]);
      return;
    }
    setIsLoadingCloud(true);
    try {
      const list = await listCloudProjects();
      setCloudProjects(list);
    } catch (err) {
      console.warn('[ProjectDashboard] Cloud projects fetch notice:', err);
    } finally {
      setIsLoadingCloud(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      void refreshCloudProjects();
    }
  }, [authUser, refreshCloudProjects]);

  useEffect(() => {
    const handleProjectsUpdated = () => {
      onProjectsChanged?.();
      void refreshCloudProjects();
    };
    window.addEventListener('gb-coder:projects-updated', handleProjectsUpdated);
    return () => window.removeEventListener('gb-coder:projects-updated', handleProjectsUpdated);
  }, [onProjectsChanged, refreshCloudProjects]);

  useEffect(() => {
    if (editingProjectId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingProjectId]);

  // Filtering and Sorting Local Projects
  const filteredLocalProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (editorFilter !== 'all') {
      result = result.filter((p) => p.editorStyle === editorFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((p) => (p.projectType || 'plain') === typeFilter);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'created-asc':
          return a.createdAt - b.createdAt;
        case 'lastOpened':
        default:
          return b.lastOpenedAt - a.lastOpenedAt;
      }
    });

    return result;
  }, [projects, searchQuery, editorFilter, typeFilter, sortOption]);

  // Filtering Cloud Projects
  const filteredCloudProjects = useMemo(() => {
    let result = [...cloudProjects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (editorFilter !== 'all') {
      result = result.filter((p) => p.editor_style === editorFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((p) => (p.project_type || 'plain') === typeFilter);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'lastOpened':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return result;
  }, [cloudProjects, searchQuery, editorFilter, typeFilter, sortOption]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || editorFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setEditorFilter('all');
    setTypeFilter('all');
  };

  // Handle Safe Rename
  const handleStartRename = (project: ProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditName(project.name);
  };

  const handleSaveRename = async (project: ProjectRecord) => {
    const validation = validateProjectName(editName, projects, project.id);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid project name');
      return;
    }

    const trimmed = editName.trim();
    if (trimmed === project.name) {
      setEditingProjectId(null);
      return;
    }

    setIsRenaming(true);
    try {
      const updated = await renameProject(project.id, trimmed);
      if (updated) {
        toast.success(`Renamed to "${trimmed}"`);
        setEditingProjectId(null);
        onProjectsChanged?.();
      } else {
        toast.error('Failed to update project name.');
      }
    } catch {
      toast.error('Could not rename project.');
    } finally {
      setIsRenaming(false);
    }
  };

  // Handle Duplicate Project
  const handleDuplicate = async (project: ProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusyProjectId(project.id);
    try {
      const copy = await duplicateProject(project.id);
      if (copy) {
        toast.success(`Duplicated "${copy.name}".`);
        onProjectsChanged?.();
      } else {
        toast.error('Failed to duplicate project.');
      }
    } catch {
      toast.error('Error duplicating project.');
    } finally {
      setBusyProjectId(null);
    }
  };

  // Handle Export Local as ZIP
  const handleExportZip = async (project: ProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusyProjectId(project.id);
    const toastId = toast.loading(`Exporting "${project.name}" as ZIP...`);
    try {
      const files = await readProjectFiles(project.id);
      const multiProject: MultiFileProject = {
        projectType: project.projectType || 'plain',
        entry: project.entry,
        files,
      };

      const blob = await createZipBlob(multiProject, { projectName: project.name });
      downloadBlob(blob, zipFilename(project.name));
      toast.success(`Exported "${project.name}.zip"`, { id: toastId });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to export project.', { id: toastId });
    } finally {
      setBusyProjectId(null);
    }
  };

  // Handle Save Local Project to Private Cloud
  const handleSaveToCloud = async (project: ProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) {
      toast.error('Sign in with GitHub to save projects to private cloud storage.');
      return;
    }

    setSavingToCloudId(project.id);
    const toastId = toast.loading(`Saving "${project.name}" to private Supabase cloud...`);
    try {
      const files = await readProjectFiles(project.id);
      const existingCloud =
        cloudProjects.find((cp) => cp.id === project.id) ||
        (await getCloudProject(project.id).catch(() => null));
      const attemptId = crypto.randomUUID().slice(0, 8);
      if (existingCloud) {
        const updated = await saveProjectToCloud(existingCloud.id, files, {
          expectedRevision: existingCloud.cloud_revision,
          name: project.name,
          attemptId,
        });
        toast.success(
          `Updated "${project.name}" in Private Cloud (Rev ${updated.cloud_revision}).`,
          { id: toastId },
        );
      } else {
        await uploadLocalProjectToCloud(project, files);
        toast.success(`Saved "${project.name}" to Private Cloud Projects.`, { id: toastId });
      }
      void refreshCloudProjects();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save project to cloud.';
      toast.error(msg, { id: toastId });
    } finally {
      setSavingToCloudId(null);
    }
  };

  // Handle Confirmed Local Delete
  const handleConfirmDelete = async (project: ProjectRecord) => {
    setIsDeleting(true);
    try {
      await onDelete(project);
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Open Cloud Project
  const handleOpenCloudProject = async (cloudProj: CloudProjectRecord) => {
    setOpeningCloudId(cloudProj.id);
    const toastId = toast.loading(`Downloading "${cloudProj.name}" from cloud storage...`);
    try {
      const { files, entry } = await loadCloudProjectFiles(cloudProj.storage_path);
      const existing = await getProject(cloudProj.id);
      let recordToOpen: ProjectRecord;

      if (!existing) {
        const restored = await restoreProject(
          {
            id: cloudProj.id,
            name: cloudProj.name,
            createdAt: new Date(cloudProj.created_at).getTime(),
            lastOpenedAt: Date.now(),
            editorStyle: cloudProj.editor_style,
            projectType: cloudProj.project_type,
            entry: entry || cloudProj.entry || 'index.html',
            fileCount: files.length,
          },
          files,
        );
        if (!restored) throw new Error('Could not initialize local project workspace.');
        recordToOpen = restored;
      } else {
        recordToOpen = existing;
      }

      toast.dismiss(toastId);
      onOpen(recordToOpen);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to download cloud project.';
      toast.error(msg, { id: toastId });
    } finally {
      setOpeningCloudId(null);
    }
  };

  // Handle Delete Cloud Project
  const handleConfirmDeleteCloud = async (cloudProj: CloudProjectRecord) => {
    setIsDeletingCloud(true);
    try {
      const ok = await deleteCloudProject(cloudProj.id, cloudProj.storage_path);
      if (ok) {
        toast.success(`Deleted "${cloudProj.name}" from Cloud.`);
        setPendingDeleteCloudId(null);
        void refreshCloudProjects();
      } else {
        toast.error('Failed to delete cloud project.');
      }
    } finally {
      setIsDeletingCloud(false);
    }
  };

  // Handle Export Cloud Project as ZIP
  const handleExportCloudZip = async (cloudProj: CloudProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading(`Exporting "${cloudProj.name}" as ZIP...`);
    try {
      const { files, entry } = await loadCloudProjectFiles(cloudProj.storage_path);
      const multiProject: MultiFileProject = {
        projectType: cloudProj.project_type || 'plain',
        entry: entry || cloudProj.entry || 'index.html',
        files,
      };
      const blob = await createZipBlob(multiProject, { projectName: cloudProj.name });
      downloadBlob(blob, zipFilename(cloudProj.name));
      toast.success(`Exported "${cloudProj.name}.zip"`, { id: toastId });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to export cloud project.', { id: toastId });
    }
  };

  return (
    <div
      className="min-h-screen bg-surface-canvas text-content-primary"
      data-testid="project-dashboard"
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:py-14">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <LadeStackLogo size={28} subtitle="GB Coder" />
          <UserAccountMenu />
        </div>

        {/* Dashboard Title & Actions Bar */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-content-primary">
              Your Projects
            </h1>
            <p className="mt-1 text-sm text-content-secondary">
              Pick up where you left off, create a project, or sync with GitHub and Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGitHubBrowser(true)}
              data-testid="dashboard-github-browser-btn"
              title="Import public or private repository from GitHub"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <FolderGit2 className="h-4 w-4 text-accent" />
              <span>Import GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGitHubCreate(true)}
              data-testid="dashboard-github-create-btn"
              title="Create new repository on GitHub"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <Github className="h-4 w-4" />
              <span>New Repo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBackupTab('backup');
                setShowBackupModal(true);
              }}
              data-testid="dashboard-backup"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <Archive className="h-4 w-4" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBackupTab('restore');
                setShowBackupModal(true);
              }}
              data-testid="dashboard-restore"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <FolderDown className="h-4 w-4" />
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={onImport}
              data-testid="dashboard-import"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <Upload className="h-4 w-4" />
              <span>Import Files</span>
            </button>
            <button
              type="button"
              onClick={onCreate}
              data-testid="dashboard-new-project"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent-hover shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation: Local vs Private Cloud */}
        <div className="mb-5 flex items-center gap-2 border-b border-stroke-subtle pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            data-testid="tab-local-projects"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'local'
                ? 'bg-surface-base border border-stroke-subtle text-accent shadow-sm'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Local Projects ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            data-testid="tab-cloud-projects"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'cloud'
                ? 'bg-surface-base border border-stroke-subtle text-accent shadow-sm'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <Cloud className="h-4 w-4" />
            <span>Private Cloud ({authUser ? cloudProjects.length : 'Sign-in required'})</span>
          </button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-stroke-subtle bg-surface-base p-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-content-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name..."
              aria-label="Search projects"
              data-testid="dashboard-search-input"
              className="w-full rounded-xl border border-stroke-subtle bg-surface-base pl-8 pr-7 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-content-muted hover:text-content-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Editor Filter */}
          <select
            value={editorFilter}
            onChange={(e) => setEditorFilter(e.target.value as 'all' | EditorStyle)}
            aria-label="Filter by editor style"
            data-testid="dashboard-editor-filter"
            className="rounded-xl border border-stroke-subtle bg-surface-base px-2.5 py-1.5 text-xs text-content-secondary outline-none focus:border-accent"
          >
            <option value="all">All Editors</option>
            <option value="plain">Static Editor</option>
            <option value="vscode">Advanced IDE</option>
          </select>

          {/* Framework Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'plain' | 'react' | 'vue')}
            aria-label="Filter by project framework"
            data-testid="dashboard-type-filter"
            className="rounded-xl border border-stroke-subtle bg-surface-base px-2.5 py-1.5 text-xs text-content-secondary outline-none focus:border-accent"
          >
            <option value="all">All Frameworks</option>
            <option value="plain">Static HTML</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="Sort projects"
            data-testid="dashboard-sort-select"
            className="rounded-xl border border-stroke-subtle bg-surface-base px-2.5 py-1.5 text-xs text-content-secondary outline-none focus:border-accent"
          >
            <option value="lastOpened">Recently Opened</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="created-desc">Created (Newest)</option>
            <option value="created-asc">Created (Oldest)</option>
          </select>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              data-testid="dashboard-clear-filters"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs text-accent hover:bg-accent-subtle transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* ─── TAB 1: LOCAL PROJECTS ────────────────────────────────────────── */}
        {activeTab === 'local' && (
          <>
            {isLoading ? (
              <div
                className="flex items-center justify-center gap-2 rounded-2xl border border-stroke-subtle bg-surface-base py-16 text-sm text-content-muted"
                data-testid="dashboard-loading"
              >
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Loading your local projects…
              </div>
            ) : projects.length === 0 ? (
              <div
                className="rounded-2xl border border-stroke-subtle bg-surface-base px-6 py-16 text-center"
                data-testid="dashboard-empty"
              >
                <FolderPlus className="mx-auto mb-3 h-10 w-10 text-content-muted" />
                <p className="text-base font-semibold text-content-primary">No local projects yet</p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs text-content-secondary leading-relaxed">
                  Create your first project, explore the template library, or import an existing
                  repository from GitHub.
                </p>
                <div className="mt-5 flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={onCreate}
                    data-testid="dashboard-empty-create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent-hover shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGitHubBrowser(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
                  >
                    <Github className="h-4 w-4" />
                    Import GitHub
                  </button>
                </div>
              </div>
            ) : filteredLocalProjects.length === 0 ? (
              <div
                className="rounded-2xl border border-stroke-subtle bg-surface-base px-6 py-14 text-center"
                data-testid="dashboard-no-search-results"
              >
                <Search className="mx-auto mb-3 h-8 w-8 text-content-muted" />
                <p className="text-sm font-semibold text-content-primary">No matching projects found</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="space-y-2.5" data-testid="dashboard-project-list">
                {filteredLocalProjects.map((project) => {
                  const isConfirming = pendingDeleteId === project.id;
                  const isEditing = editingProjectId === project.id;
                  const isBusy = busyProjectId === project.id;
                  const isSavingToCloud = savingToCloudId === project.id;

                  return (
                    <li
                      key={project.id}
                      data-testid="dashboard-project-item"
                      data-project-id={project.id}
                      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-stroke-subtle bg-surface-base px-4 py-3 transition-all hover:border-stroke-strong hover:shadow-sm"
                    >
                      {/* Left: Project icon & metadata */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                            project.editorStyle === 'vscode'
                              ? 'bg-accent-subtle text-accent'
                              : 'bg-surface-raised text-content-secondary'
                          }`}
                          aria-hidden
                        >
                          {project.editorStyle === 'vscode' ? (
                            <PanelsTopLeft className="h-5 w-5" />
                          ) : (
                            <Code2 className="h-5 w-5" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div
                              className="flex items-center gap-1.5 max-w-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                ref={renameInputRef}
                                type="text"
                                value={editName}
                                disabled={isRenaming}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') void handleSaveRename(project);
                                  if (e.key === 'Escape') setEditingProjectId(null);
                                }}
                                data-testid="dashboard-rename-input"
                                className="w-full rounded-lg border border-accent bg-surface-base px-2.5 py-1 text-xs text-content-primary outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSaveRename(project)}
                                disabled={isRenaming}
                                data-testid="dashboard-rename-save"
                                aria-label="Save project name"
                                className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProjectId(null)}
                                disabled={isRenaming}
                                data-testid="dashboard-rename-cancel"
                                aria-label="Cancel rename"
                                className="p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-hover"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpen(project)}
                              data-testid="dashboard-open-project"
                              className="text-left w-full truncate block group/link"
                            >
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-content-primary group-hover/link:text-accent transition-colors">
                                  {project.name}
                                </span>
                                <span
                                  className="shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-medium text-content-muted bg-surface-hover"
                                  data-testid="project-framework-badge"
                                >
                                  {FRAMEWORK_LABEL[project.projectType || 'plain'] || 'Static'}
                                </span>
                                <span
                                  className="shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wide text-content-muted"
                                  data-testid="project-style-badge"
                                >
                                  {EDITOR_STYLE_LABEL[project.editorStyle]}
                                </span>
                              </div>
                              <span className="mt-0.5 block truncate text-[11px] text-content-muted">
                                Opened {formatOpenedAt(project.lastOpenedAt)} ·{' '}
                                {project.fileCount} file{project.fileCount === 1 ? '' : 's'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {isConfirming ? (
                          <span className="flex items-center gap-1.5 animate-fadeIn">
                            <span className="hidden text-xs text-content-secondary sm:inline">
                              Delete permanently?
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleConfirmDelete(project)}
                              disabled={isDeleting}
                              data-testid="dashboard-confirm-delete"
                              className="rounded-lg bg-danger px-2.5 py-1 text-xs font-semibold text-content-on-dark hover:bg-danger transition-colors disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              disabled={isDeleting}
                              data-testid="dashboard-cancel-delete"
                              className="rounded-lg border border-stroke-subtle px-2.5 py-1 text-xs font-medium text-content-secondary hover:bg-surface-hover transition-colors"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <>
                            {/* Save to Cloud Action */}
                            <button
                              type="button"
                              onClick={(e) => void handleSaveToCloud(project, e)}
                              disabled={isBusy || isSavingToCloud}
                              aria-label={`Save ${project.name} to Cloud`}
                              data-testid={`dashboard-save-cloud-btn-${project.id}`}
                              title={
                                authUser
                                  ? 'Save to private Supabase Cloud Projects'
                                  : 'Sign in with GitHub to enable cloud backup'
                              }
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-accent group-hover:opacity-100 disabled:opacity-50"
                            >
                              {isSavingToCloud ? (
                                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                              ) : (
                                <UploadCloud className="h-4 w-4" />
                              )}
                            </button>

                            {/* Rename Action */}
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(project, e)}
                              aria-label={`Rename ${project.name}`}
                              data-testid={`dashboard-rename-btn-${project.id}`}
                              title="Rename project"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-content-primary group-hover:opacity-100"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            {/* Duplicate Action */}
                            <button
                              type="button"
                              onClick={(e) => void handleDuplicate(project, e)}
                              disabled={isBusy}
                              aria-label={`Duplicate ${project.name}`}
                              data-testid={`dashboard-duplicate-btn-${project.id}`}
                              title="Duplicate project"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-content-primary group-hover:opacity-100 disabled:opacity-50"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            {/* Export Action */}
                            <button
                              type="button"
                              onClick={(e) => void handleExportZip(project, e)}
                              disabled={isBusy}
                              aria-label={`Export ${project.name} as ZIP`}
                              data-testid={`dashboard-export-btn-${project.id}`}
                              title="Export as ZIP"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-content-primary group-hover:opacity-100 disabled:opacity-50"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(project.id)}
                              aria-label={`Delete ${project.name}`}
                              data-testid={`dashboard-delete-btn-${project.id}`}
                              title="Delete project"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-danger group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* ─── TAB 2: PRIVATE CLOUD PROJECTS ──────────────────────────────── */}
        {activeTab === 'cloud' && (
          <>
            {!authUser ? (
              <div
                className="rounded-2xl border border-stroke-subtle bg-surface-base px-6 py-12 text-center space-y-4"
                data-testid="cloud-auth-prompt"
              >
                <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-accent-subtle text-accent">
                  <Cloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-content-primary">
                    Private Cloud Project Storage
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-content-secondary leading-relaxed">
                    Sign in with your GitHub account to access private cloud projects stored in
                    Supabase PostgreSQL and private object storage across your devices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void signInWithGitHub('/app')}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors shadow-md"
                >
                  <Github className="h-4 w-4" />
                  <span>Sign in with GitHub</span>
                </button>
              </div>
            ) : isLoadingCloud ? (
              <div
                className="flex items-center justify-center gap-2 rounded-2xl border border-stroke-subtle bg-surface-base py-16 text-sm text-content-muted"
                data-testid="cloud-loading"
              >
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Loading your private cloud projects…
              </div>
            ) : cloudProjects.length === 0 ? (
              <div
                className="rounded-2xl border border-stroke-subtle bg-surface-base px-6 py-14 text-center"
                data-testid="cloud-empty"
              >
                <Cloud className="mx-auto mb-3 h-10 w-10 text-content-muted" />
                <p className="text-base font-semibold text-content-primary">No cloud projects yet</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-content-secondary leading-relaxed">
                  Save a local project to the cloud with the cloud icon, or import a repository
                  directly into your private cloud storage.
                </p>
                <div className="mt-5 flex justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('local')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>View Local Projects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGitHubBrowser(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors shadow-md"
                  >
                    <Github className="h-4 w-4" />
                    <span>Import from GitHub</span>
                  </button>
                </div>
              </div>
            ) : filteredCloudProjects.length === 0 ? (
              <div
                className="rounded-2xl border border-stroke-subtle bg-surface-base px-6 py-14 text-center"
                data-testid="cloud-no-search-results"
              >
                <Search className="mx-auto mb-3 h-8 w-8 text-content-muted" />
                <p className="text-sm font-semibold text-content-primary">No matching cloud projects</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="space-y-2.5" data-testid="dashboard-cloud-project-list">
                {filteredCloudProjects.map((cloudProj) => {
                  const isConfirmingDelete = pendingDeleteCloudId === cloudProj.id;
                  const isOpening = openingCloudId === cloudProj.id;

                  return (
                    <li
                      key={cloudProj.id}
                      data-testid="dashboard-cloud-project-item"
                      data-cloud-project-id={cloudProj.id}
                      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-stroke-subtle bg-surface-base px-4 py-3 transition-all hover:border-stroke-strong hover:shadow-sm"
                    >
                      {/* Left: Project icon & metadata */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                            cloudProj.editor_style === 'vscode'
                              ? 'bg-accent-subtle text-accent'
                              : 'bg-surface-raised text-content-secondary'
                          }`}
                          aria-hidden
                        >
                          <Cloud className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-content-primary">
                              {cloudProj.name}
                            </span>
                            <span
                              className="shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-medium text-accent bg-accent-subtle/30"
                              title="Optimistic Cloud Revision"
                            >
                              Rev {cloudProj.cloud_revision}
                            </span>
                            <span className="shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-medium text-content-muted bg-surface-hover">
                              {FRAMEWORK_LABEL[cloudProj.project_type || 'plain'] || 'Static'}
                            </span>
                            <span className="shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wide text-content-muted">
                              {EDITOR_STYLE_LABEL[cloudProj.editor_style]}
                            </span>
                            {cloudProj.source_repo_full_name && (
                              <span
                                className="inline-flex items-center gap-1 shrink-0 rounded border border-stroke-subtle px-1.5 py-0.2 text-[10px] font-mono text-content-secondary bg-surface-canvas"
                                title={`GitHub Repository: ${cloudProj.source_repo_full_name} (${cloudProj.source_branch || 'default'})`}
                              >
                                <Github className="h-2.5 w-2.5" />
                                <span className="truncate max-w-[120px]">
                                  {cloudProj.source_repo_full_name}
                                </span>
                              </span>
                            )}
                          </div>
                          <span className="mt-0.5 block truncate text-[11px] text-content-muted">
                            Updated {formatOpenedAt(new Date(cloudProj.updated_at).getTime())} ·{' '}
                            {cloudProj.file_count} file{cloudProj.file_count === 1 ? '' : 's'} ·
                            Private Supabase Storage
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        {isConfirmingDelete ? (
                          <span className="flex items-center gap-1.5 animate-fadeIn">
                            <span className="hidden text-xs text-content-secondary sm:inline">
                              Delete from cloud?
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleConfirmDeleteCloud(cloudProj)}
                              disabled={isDeletingCloud}
                              data-testid="dashboard-confirm-delete-cloud"
                              className="rounded-lg bg-danger px-2.5 py-1 text-xs font-semibold text-content-on-dark hover:bg-danger transition-colors disabled:opacity-50"
                            >
                              {isDeletingCloud ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteCloudId(null)}
                              disabled={isDeletingCloud}
                              className="rounded-lg border border-stroke-subtle px-2.5 py-1 text-xs font-medium text-content-secondary hover:bg-surface-hover transition-colors"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleOpenCloudProject(cloudProj)}
                              disabled={isOpening}
                              data-testid={`dashboard-open-cloud-btn-${cloudProj.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-sm"
                            >
                              {isOpening ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Opening...</span>
                                </>
                              ) : (
                                <>
                                  <PanelsTopLeft className="h-3.5 w-3.5" />
                                  <span>Open in IDE</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => void handleExportCloudZip(cloudProj, e)}
                              aria-label={`Export ${cloudProj.name} as ZIP`}
                              title="Export cloud project as ZIP"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-content-primary group-hover:opacity-100"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setPendingDeleteCloudId(cloudProj.id)}
                              aria-label={`Delete ${cloudProj.name} from Cloud`}
                              title="Delete from Supabase Cloud"
                              className="rounded-lg p-1.5 text-content-muted opacity-80 sm:opacity-0 transition-opacity hover:bg-surface-hover hover:text-danger group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* Local Storage Clarification Note */}
        <p className="mt-6 text-xs text-content-muted" data-testid="dashboard-storage-note">
          Local projects are stored in this browser&apos;s IndexedDB. Cloud projects are secured under
          Row Level Security in Supabase PostgreSQL and private storage.
        </p>
      </div>

      {/* Backup / Restore Modal */}
      {showBackupModal && (
        <React.Suspense fallback={null}>
          <BackupRestoreModal
            isOpen={showBackupModal}
            onClose={() => setShowBackupModal(false)}
            projects={projects}
            initialTab={backupTab}
            onRestored={onProjectsChanged}
          />
        </React.Suspense>
      )}

      {/* GitHub Repo Browser Modal */}
      {showGitHubBrowser && (
        <GitHubRepoBrowserModal
          isOpen={showGitHubBrowser}
          onClose={() => setShowGitHubBrowser(false)}
          onImportSuccess={(_newId) => {
            onProjectsChanged?.();
            void refreshCloudProjects();
          }}
        />
      )}

      {/* GitHub Create Repo Modal */}
      {showGitHubCreate && (
        <GitHubCreateRepoModal
          isOpen={showGitHubCreate}
          onClose={() => setShowGitHubCreate(false)}
          onSuccess={() => {
            onProjectsChanged?.();
            void refreshCloudProjects();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;
