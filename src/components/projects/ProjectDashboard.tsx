import React, { useState } from 'react';
import { Code2, FolderPlus, Loader2, PanelsTopLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { EditorStyle, ProjectRecord } from '../../services/projects/projectDatabase';

/**
 * The landing screen.
 *
 * Shown whenever no project is active, which makes it the first thing a new user
 * sees instead of an editor full of starter code they did not ask for. It doubles
 * as the project history: the list *is* the history, ordered by when each project
 * was last opened.
 */

interface ProjectDashboardProps {
  projects: ProjectRecord[];
  /** Distinguishes "still reading the database" from "there is nothing there". */
  isLoading: boolean;
  onCreate: () => void;
  onOpen: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  /** Import straight from here, which also creates a project. */
  onImport: () => void;
}

const EDITOR_STYLE_LABEL: Record<EditorStyle, string> = {
  plain: 'Plain',
  vscode: 'VS Code',
};

/**
 * Relative for anything recent, absolute once "5 days ago" stops being useful.
 * The point of the timestamp is to help someone recognise which project they
 * want, and a precise date does that better than a large day count.
 */
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

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  isLoading,
  onCreate,
  onOpen,
  onDelete,
  onImport,
}) => {
  const { isDark } = useTheme();
  /*
   * Confirmation is inline per row rather than a modal.
   *
   * Deletion is permanent and unrecoverable — there is no backend copy — so it
   * must be confirmed, but a modal for a row action is heavy and detaches the
   * question from the thing being deleted.
   */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}
      data-testid="project-dashboard"
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-16">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-content-primary">Your projects</h1>
            <p className="mt-1 text-sm text-content-secondary">
              Pick up where you left off, or start something new.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onImport}
              data-testid="dashboard-import"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stroke-subtle px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              type="button"
              onClick={onCreate}
              data-testid="dashboard-new-project"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </header>

        {isLoading ? (
          <div
            className="flex items-center justify-center gap-2 rounded-xl border border-stroke-subtle bg-surface-base py-16 text-sm text-content-muted"
            data-testid="dashboard-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your projects…
          </div>
        ) : projects.length === 0 ? (
          <div
            className="rounded-xl border border-stroke-subtle bg-surface-base px-6 py-16 text-center"
            data-testid="dashboard-empty"
          >
            <FolderPlus className="mx-auto mb-3 h-8 w-8 text-content-muted" />
            <p className="text-base font-semibold text-content-primary">No projects yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-content-secondary">
              Create your first one to get started, or import a folder you already have.
            </p>
            <button
              type="button"
              onClick={onCreate}
              data-testid="dashboard-empty-create"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        ) : (
          <ul className="space-y-2" data-testid="dashboard-project-list">
            {projects.map((project) => {
              const isConfirming = pendingDeleteId === project.id;

              return (
                <li
                  key={project.id}
                  data-testid="dashboard-project-item"
                  data-project-id={project.id}
                  className="group flex items-center gap-3 rounded-xl border border-stroke-subtle bg-surface-base px-4 py-3 transition-colors hover:border-stroke-strong"
                >
                  {/*
                    The row itself opens the project. A button rather than a click
                    handler on the <li> so it is reachable by keyboard and
                    announced as an action.
                  */}
                  <button
                    type="button"
                    onClick={() => onOpen(project)}
                    data-testid="dashboard-open-project"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        project.editorStyle === 'vscode'
                          ? 'bg-accent-subtle text-accent'
                          : 'bg-surface-raised text-content-secondary'
                      }`}
                      aria-hidden
                    >
                      {project.editorStyle === 'vscode' ? (
                        <PanelsTopLeft className="h-4 w-4" />
                      ) : (
                        <Code2 className="h-4 w-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-content-primary">
                          {project.name}
                        </span>
                        <span
                          className="shrink-0 rounded border border-stroke-subtle px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-content-muted"
                          data-testid="project-style-badge"
                        >
                          {EDITOR_STYLE_LABEL[project.editorStyle]}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-content-muted">
                        Opened {formatOpenedAt(project.lastOpenedAt)} ·{' '}
                        {project.fileCount} file{project.fileCount === 1 ? '' : 's'}
                      </span>
                    </span>
                  </button>

                  {isConfirming ? (
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden text-xs text-content-secondary sm:inline">
                        Delete permanently?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDeleteId(null);
                          onDelete(project);
                        }}
                        data-testid="dashboard-confirm-delete"
                        className="rounded-md bg-red-500/90 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        data-testid="dashboard-cancel-delete"
                        className="rounded-md border border-stroke-subtle px-2 py-1 text-xs font-medium text-content-secondary hover:bg-surface-hover"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(project.id)}
                      aria-label={`Delete ${project.name}`}
                      data-testid="dashboard-delete-project"
                      className="shrink-0 rounded-md p-1.5 text-content-muted opacity-0 transition-opacity hover:bg-surface-hover hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/*
          Sets expectations honestly: there is no backend yet, so the browser is
          the only copy. Worth saying plainly rather than letting someone discover
          it by clearing their site data.
        */}
        <p className="mt-5 text-xs text-content-muted" data-testid="dashboard-storage-note">
          Projects are stored locally in this browser. Clearing browser data will delete them.
        </p>
      </div>
    </div>
  );
};

export default ProjectDashboard;
