/**
 * Full-stack feature barrel — the single lazy chunk boundary.
 *
 * App imports this module with one dynamic `import()`, which is what keeps the
 * VS Code editor mode, the sandbox provider panel, the sandbox client and the
 * E2B vocabulary out of both the initial bundle *and* the import/detection chunk
 * from the drag-and-drop work.
 *
 * It is fetched only on the full-stack branch: after detection says full-stack
 * and the user proceeds. Someone who only ever opens plain, React or Vue projects
 * never downloads any of it.
 */
export { default as VSCodeMode } from '../../components/vscode/VSCodeMode';
export { default as SandboxPanel } from '../../components/sandbox/SandboxPanel';
export { sandboxSession, readStoredKey, storeKey, E2B_KEY_STORAGE } from '../../services/sandbox/sandboxSession';
export type { SandboxState, SandboxFile, SandboxPreview, StartCandidate } from '../../services/sandbox/sandboxSession';
