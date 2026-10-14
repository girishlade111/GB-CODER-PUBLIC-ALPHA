import React from 'react';
import { FolderSearch, LayoutDashboard, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ProjectNotAvailableProps {
  /** The route's project id (validated charset, but no local record). */
  projectId: string;
  onDashboard: () => void;
  onImport: () => void;
}

/**
 * Safe recovery for project URLs with no local record: a deleted project, a
 * never-existing id, or — most importantly — a URL opened in a browser profile
 * whose IndexedDB does not contain that project.
 *
 * Project URLs identify a route plus a local id, never cloud content. This
 * screen states that plainly, never shows another project in its place, and
 * never creates anything.
 */
const ProjectNotAvailable: React.FC<ProjectNotAvailableProps> = ({
  projectId,
  onDashboard,
  onImport,
}) => {
  const { isDark } = useTheme();
  const surface = isDark ? 'bg-surface-raised' : 'bg-white';

  return (
    <div
      className="grid min-h-screen place-items-center bg-surface-canvas p-4"
      data-testid="project-unavailable"
    >
      <div
        className={`w-full max-w-md rounded-2xl border border-stroke-subtle ${surface} p-6 text-center shadow-2xl`}
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent-subtle text-accent">
          <FolderSearch className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-sans text-lg font-semibold text-content-primary">
          Project not available on this device
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
          There is no project with this ID in this browser profile. Project links
          open local work — they do not carry project files across devices.
        </p>
        <p className="mt-2 truncate font-mono text-xs text-content-muted" title={projectId}>
          ID: {projectId}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onDashboard}
            data-testid="unavailable-dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={onImport}
            data-testid="unavailable-import"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-subtle px-3.5 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Import or restore a project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectNotAvailable;
