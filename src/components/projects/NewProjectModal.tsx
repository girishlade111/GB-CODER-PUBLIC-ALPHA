import React, { useEffect, useRef, useState } from 'react';
import { Code2, PanelsTopLeft, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { EditorStyle } from '../../services/projects/projectDatabase';

/**
 * Names a new project and picks which editor it opens in.
 *
 * The editor style is asked for up front, and stored on the project, because it
 * is how the project will be reopened later — not a transient view toggle.
 */

interface NewProjectModalProps {
  /** Pre-filled default, e.g. `Untitled Project 2`. */
  suggestedName: string;
  onCancel: () => void;
  onCreate: (input: { name: string; editorStyle: EditorStyle }) => void;
}

const STYLE_OPTIONS: {
  value: EditorStyle;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'plain',
    title: 'Plain HTML/CSS/JS',
    description: 'Three panels and a live preview. Nothing to configure.',
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    value: 'vscode',
    title: 'VS Code Style',
    description: 'File tree, tabs and a terminal. For projects with a server side.',
    icon: <PanelsTopLeft className="h-5 w-5" />,
  },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  suggestedName,
  onCancel,
  onCreate,
}) => {
  const { isDark } = useTheme();
  const [name, setName] = useState(suggestedName);
  const [editorStyle, setEditorStyle] = useState<EditorStyle>('plain');
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * Focus and select the suggested name, so it can be typed over immediately —
   * the name is the only thing most people will want to change.
   */
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Matches the Escape-to-close convention the app's other modals use.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const submit = () => {
    // Fall back to the suggestion rather than refusing to proceed: an empty name
    // is a slip, and blocking on it would be pedantic.
    const trimmed = name.trim();
    onCreate({ name: trimmed.length > 0 ? trimmed : suggestedName, editorStyle });
  };

  const surface = isDark ? 'bg-surface-raised' : 'bg-white';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New project"
        data-testid="new-project-modal"
        className={`w-full max-w-md rounded-2xl border border-stroke-subtle ${surface} shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-stroke-subtle px-5 py-3.5">
          <h2 className="text-sm font-semibold text-content-primary">New project</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            data-testid="new-project-cancel"
            className="rounded p-1 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label
            htmlFor="new-project-name"
            className="mb-1.5 block text-xs font-medium text-content-secondary"
          >
            Project name
          </label>
          <input
            ref={inputRef}
            id="new-project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-testid="new-project-name"
            autoComplete="off"
            className="w-full rounded-lg border border-stroke-subtle bg-surface-base px-3 py-2 text-sm text-content-primary outline-none transition-colors focus:border-accent"
          />

          <p className="mb-2 mt-4 text-xs font-medium text-content-secondary">Editor style</p>
          <div className="space-y-2" role="radiogroup" aria-label="Editor style">
            {STYLE_OPTIONS.map((option) => {
              const isSelected = editorStyle === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setEditorStyle(option.value)}
                  data-testid={`new-project-style-${option.value}`}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent-subtle'
                      : 'border-stroke-subtle hover:bg-surface-hover'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 ${
                      isSelected ? 'text-accent' : 'text-content-muted'
                    }`}
                    aria-hidden
                  >
                    {option.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-content-primary">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-content-secondary">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-stroke-subtle px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="new-project-create"
              className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
