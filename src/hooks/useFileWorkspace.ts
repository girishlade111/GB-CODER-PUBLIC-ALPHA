import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MultiFileProject,
  ProjectFile,
  addFile as addFileToProject,
  deleteFile as deleteFileFromProject,
  isFixedPath,
  languageForPath,
  normalizePath,
  renameFile as renameFileInProject,
  setFileContent,
  sortedFiles,
  validateFilePath,
} from '../types/files';

export interface FileWorkspace {
  files: ProjectFile[];
  /** Paths with an open tab, in tab order. */
  openPaths: string[];
  activePath: string | null;
  activeFile: ProjectFile | null;
  /** Paths edited since the last save. */
  dirtyPaths: Set<string>;

  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActivePath: (path: string) => void;
  updateActiveContent: (content: string) => void;
  updateFileContent: (path: string, content: string) => void;

  createFile: (path: string) => { ok: boolean; error?: string };
  renameFile: (fromPath: string, toPath: string) => { ok: boolean; error?: string };
  removeFile: (path: string) => { ok: boolean; error?: string };
  canModify: (path: string) => boolean;

  markAllSaved: () => void;
}

/** Content snapshot used to decide which tabs show an unsaved dot. */
type Snapshot = Record<string, string>;

const snapshotOf = (project: MultiFileProject): Snapshot =>
  project.files.reduce<Snapshot>((acc, file) => {
    acc[file.path] = file.content;
    return acc;
  }, {});

const DEFAULT_OPEN_LIMIT = 1;

/**
 * Owns the editor-facing view of a multi-file project: which files have tabs,
 * which one is focused, per-file dirty state, and the file CRUD operations that
 * the tree and tab strip drive.
 *
 * The project itself stays in App state — this hook only derives from it and
 * hands back updaters, so there is a single source of truth.
 */
export const useFileWorkspace = (
  project: MultiFileProject,
  setProject: React.Dispatch<React.SetStateAction<MultiFileProject>>,
  /** Bumping this (e.g. autosave time) clears every dirty marker. */
  savedSignal?: number | null,
): FileWorkspace => {
  const files = useMemo(() => sortedFiles(project), [project]);

  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [activePath, setActivePathState] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<Snapshot>(() => snapshotOf(project));

  const projectTypeRef = useRef(project.projectType);

  // On a project-type switch the whole file set is replaced, so reset tabs to
  // the new entry file and treat everything as freshly saved.
  useEffect(() => {
    if (projectTypeRef.current === project.projectType) return;
    projectTypeRef.current = project.projectType;

    const initial = project.entry ?? sortedFiles(project)[0]?.path ?? null;
    setOpenPaths(initial ? [initial] : []);
    setActivePathState(initial);
    setSavedSnapshot(snapshotOf(project));
  }, [project]);

  // First mount: open the entry (or first) file.
  useEffect(() => {
    if (activePath !== null || project.files.length === 0) return;
    const initial = project.entry ?? sortedFiles(project)[0]?.path ?? null;
    if (!initial) return;
    setOpenPaths([initial].slice(0, DEFAULT_OPEN_LIMIT));
    setActivePathState(initial);
  }, [activePath, project]);

  // Drop tabs for files that no longer exist (deleted or renamed away).
  useEffect(() => {
    const existing = new Set(project.files.map((f) => f.path));
    setOpenPaths((current) => {
      const filtered = current.filter((p) => existing.has(p));
      return filtered.length === current.length ? current : filtered;
    });
    setActivePathState((current) => (current && existing.has(current) ? current : null));
  }, [project.files]);

  // Keep a valid focused tab whenever one is available.
  useEffect(() => {
    if (activePath && openPaths.includes(activePath)) return;
    if (openPaths.length > 0) setActivePathState(openPaths[openPaths.length - 1]);
  }, [activePath, openPaths]);

  const markAllSaved = useCallback(() => {
    setSavedSnapshot(snapshotOf(project));
  }, [project]);

  useEffect(() => {
    if (savedSignal === undefined || savedSignal === null) return;
    setSavedSnapshot(snapshotOf(project));
    // Only react to the save signal, not to every project edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSignal]);

  const dirtyPaths = useMemo(() => {
    const dirty = new Set<string>();
    for (const file of project.files) {
      const saved = savedSnapshot[file.path];
      // A brand-new file counts as unsaved until the next save.
      if (saved === undefined || saved !== file.content) dirty.add(file.path);
    }
    return dirty;
  }, [project.files, savedSnapshot]);

  const openFile = useCallback((path: string) => {
    setOpenPaths((current) => (current.includes(path) ? current : [...current, path]));
    setActivePathState(path);
  }, []);

  const closeFile = useCallback((path: string) => {
    setOpenPaths((current) => {
      const index = current.indexOf(path);
      if (index === -1) return current;
      const next = current.filter((p) => p !== path);

      // Focus the neighbouring tab, matching editor conventions.
      setActivePathState((active) => {
        if (active !== path) return active;
        if (next.length === 0) return null;
        return next[Math.min(index, next.length - 1)];
      });

      return next;
    });
  }, []);

  const setActivePath = useCallback((path: string) => setActivePathState(path), []);

  const updateFileContent = useCallback(
    (path: string, content: string) => {
      setProject((current) => setFileContent(current, path, content));
    },
    [setProject],
  );

  const updateActiveContent = useCallback(
    (content: string) => {
      if (!activePath) return;
      updateFileContent(activePath, content);
    },
    [activePath, updateFileContent],
  );

  const createFile = useCallback(
    (rawPath: string) => {
      const path = normalizePath(rawPath);
      const validation = validateFilePath(
        path,
        project.projectType,
        project.files.map((f) => f.path),
      );
      if (!validation.valid) return { ok: false, error: validation.error };

      setProject((current) => addFileToProject(current, path, ''));
      openFile(path);
      return { ok: true };
    },
    [openFile, project.files, project.projectType, setProject],
  );

  const renameFile = useCallback(
    (fromPath: string, rawToPath: string) => {
      if (isFixedPath(project.projectType, fromPath)) {
        return { ok: false, error: 'This file is part of the plain project structure.' };
      }

      const toPath = normalizePath(rawToPath);
      if (toPath === fromPath) return { ok: true };

      const validation = validateFilePath(
        toPath,
        project.projectType,
        project.files.map((f) => f.path),
        fromPath,
      );
      if (!validation.valid) return { ok: false, error: validation.error };

      setProject((current) => renameFileInProject(current, fromPath, toPath));

      // Carry the tab across so the user does not lose their place.
      setOpenPaths((current) => current.map((p) => (p === fromPath ? toPath : p)));
      setActivePathState((current) => (current === fromPath ? toPath : current));
      setSavedSnapshot((current) => {
        const { [fromPath]: previous, ...rest } = current;
        return previous === undefined ? rest : { ...rest, [toPath]: previous };
      });

      return { ok: true };
    },
    [project.files, project.projectType, setProject],
  );

  const removeFile = useCallback(
    (path: string) => {
      if (isFixedPath(project.projectType, path)) {
        return { ok: false, error: 'This file is part of the plain project structure.' };
      }
      if (project.files.length <= 1) {
        return { ok: false, error: 'A project needs at least one file.' };
      }

      setProject((current) => deleteFileFromProject(current, path));
      closeFile(path);
      return { ok: true };
    },
    [closeFile, project.files.length, project.projectType, setProject],
  );

  const canModify = useCallback(
    (path: string) => !isFixedPath(project.projectType, path),
    [project.projectType],
  );

  const activeFile = useMemo(
    () => (activePath ? project.files.find((f) => f.path === activePath) ?? null : null),
    [activePath, project.files],
  );

  return {
    files,
    openPaths,
    activePath,
    activeFile,
    dirtyPaths,
    openFile,
    closeFile,
    setActivePath,
    updateActiveContent,
    updateFileContent,
    createFile,
    renameFile,
    removeFile,
    canModify,
    markAllSaved,
  };
};

export { languageForPath };
