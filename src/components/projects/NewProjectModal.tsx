import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Code2,
  FilePlus2,
  FlaskConical,
  Layers,
  Loader2,
  PanelsTopLeft,
  Shapes,
  Sparkles,
  X,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import {
  EditorStyle,
  ProjectRecord,
  validateProjectName,
} from '../../services/projects/projectDatabase';
import { CodeTemplate, TemplatePayload } from '../../services/enhancedTemplateService';

/**
 * Explicit starting point for a new project.
 *
 * - `starter`: responsive HTML/CSS/JS starter scaffold (static editor).
 * - `blank`: genuinely empty HTML/CSS/JS buffers (static editor).
 * - `empty`: zero files — an empty Advanced IDE workspace.
 * - `react` / `vue`: Vite-ready React/Vue scaffold.
 * - `template`: custom template selected from the template library.
 */
export type NewProjectTemplate = 'starter' | 'blank' | 'empty' | 'react' | 'vue' | 'template';

export interface NewProjectSubmitPayload {
  name: string;
  editorStyle: EditorStyle;
  template: NewProjectTemplate;
  selectedTemplate?: {
    meta: CodeTemplate;
    payload?: TemplatePayload;
  };
}

interface NewProjectModalProps {
  /** Pre-filled default, e.g. `Untitled Project 2`. */
  suggestedName: string;
  existingProjects?: ProjectRecord[];
  onCancel: () => void;
  onCreate: (input: NewProjectSubmitPayload) => Promise<boolean | void> | boolean | void;
  /** Opens the full Template Gallery modal */
  onOpenTemplates?: () => void;
  /** Optional pre-selected template from the gallery */
  initialTemplate?: {
    meta: CodeTemplate;
    payload?: TemplatePayload;
  } | null;
}

const STYLE_OPTIONS: {
  value: EditorStyle;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'plain',
    title: 'Static Editor',
    description: 'Three panels and live preview. Best for pure HTML, CSS, and vanilla JS.',
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    value: 'vscode',
    title: 'Advanced IDE',
    description: 'Multi-file tree, tabs, terminal, and bundler. For React, Vue, and modern apps.',
    icon: <PanelsTopLeft className="h-5 w-5" />,
  },
];

const BUILTIN_STARTERS: {
  value: NewProjectTemplate;
  styles: EditorStyle[];
  title: string;
  framework: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'starter',
    styles: ['plain', 'vscode'],
    title: 'Starter HTML/CSS/JS',
    framework: 'Static HTML',
    description: 'A responsive starter scaffold to build on.',
    icon: <Shapes className="h-5 w-5" />,
  },
  {
    value: 'blank',
    styles: ['plain', 'vscode'],
    title: 'Blank Canvas',
    framework: 'Static HTML',
    description: 'Genuinely empty HTML, CSS, and JavaScript buffers.',
    icon: <FilePlus2 className="h-5 w-5" />,
  },
  {
    value: 'empty',
    styles: ['vscode'],
    title: 'Empty Workspace',
    framework: 'Custom / Multi-file',
    description: 'Zero files. Create, import, or scaffold only what you need.',
    icon: <FilePlus2 className="h-5 w-5" />,
  },
  {
    value: 'react',
    styles: ['vscode'],
    title: 'React (Vite)',
    framework: 'React 18',
    description: 'Vite-ready React scaffold, generated once at creation.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    value: 'vue',
    styles: ['vscode'],
    title: 'Vue (Vite)',
    framework: 'Vue 3',
    description: 'Vite-ready Vue scaffold, generated once at creation.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  suggestedName,
  existingProjects = [],
  onCancel,
  onCreate,
  onOpenTemplates,
  initialTemplate = null,
}) => {
  const { isDark } = useTheme();
  const [name, setName] = useState(suggestedName);
  const [nameTouched, setNameTouched] = useState(false);
  const [editorStyle, setEditorStyle] = useState<EditorStyle>(
    initialTemplate && initialTemplate.meta.projectType !== 'plain' ? 'vscode' : 'plain',
  );
  const [template, setTemplate] = useState<NewProjectTemplate>(
    initialTemplate ? 'template' : 'starter',
  );
  const [selectedGalleryTemplate, setSelectedGalleryTemplate] = useState<{
    meta: CodeTemplate;
    payload?: TemplatePayload;
  } | null>(initialTemplate);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation
  const nameValidation = useMemo(
    () => validateProjectName(name, existingProjects),
    [name, existingProjects],
  );

  const isTemplateMultiFile =
    template === 'react' ||
    template === 'vue' ||
    (template === 'template' &&
      selectedGalleryTemplate &&
      selectedGalleryTemplate.meta.projectType !== 'plain');

  // Enforce editor compatibility: framework/multi-file templates must open in Advanced IDE
  useEffect(() => {
    if (isTemplateMultiFile && editorStyle !== 'vscode') {
      setEditorStyle('vscode');
    }
  }, [isTemplateMultiFile, editorStyle]);

  const selectStyle = (style: EditorStyle) => {
    if (isTemplateMultiFile && style === 'plain') {
      return; // Framework/multi-file templates cannot run in plain 3-buffer editor
    }
    setEditorStyle(style);
    if (style === 'plain' && (template === 'empty' || template === 'react' || template === 'vue')) {
      setTemplate('starter');
    }
  };

  const selectStarter = (optionValue: NewProjectTemplate) => {
    setTemplate(optionValue);
    setSelectedGalleryTemplate(null);
    setSubmitError(null);
    if (optionValue === 'react' || optionValue === 'vue' || optionValue === 'empty') {
      setEditorStyle('vscode');
    }
  };

  /*
   * Focus and select suggested name initially so user can type over immediately
   */
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isSubmitting]);

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    setNameTouched(true);
    if (!nameValidation.valid) {
      return;
    }

    const trimmed = name.trim();
    const finalName = trimmed.length > 0 ? trimmed : suggestedName;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onCreate({
        name: finalName,
        editorStyle: isTemplateMultiFile ? 'vscode' : editorStyle,
        template,
        selectedTemplate: template === 'template' && selectedGalleryTemplate ? selectedGalleryTemplate : undefined,
      });

      // If the caller returned explicit false, creation failed in storage
      if (result === false) {
        setSubmitError('Could not save project to local storage. Your browser may be blocking IndexedDB.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to create project in local storage.');
      setIsSubmitting(false);
    }
  };

  const surface = isDark ? 'bg-surface-raised' : 'bg-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-title"
      data-testid="new-project-modal"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border border-stroke-subtle ${surface} shadow-2xl overflow-hidden my-6 transition-all`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-accent-subtle p-2 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 id="new-project-title" className="font-sans text-base font-semibold text-content-primary">
                Create New Project
              </h2>
              <p className="text-xs text-content-muted">
                Choose a starter and editor for your new project
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
            data-testid="new-project-cancel"
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form className="px-5 py-4 space-y-4" onSubmit={handleSubmit}>
          {submitError && (
            <div
              className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-red-300"
              data-testid="new-project-error"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Project Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="new-project-name"
                className="text-xs font-medium text-content-secondary"
              >
                Project name
              </label>
              {nameTouched && nameValidation.isDuplicate && (
                <span className="text-[11px] text-amber-400">Name already in use</span>
              )}
            </div>
            <input
              ref={inputRef}
              id="new-project-name"
              value={name}
              disabled={isSubmitting}
              onChange={(event) => {
                setName(event.target.value);
                setNameTouched(true);
                setSubmitError(null);
              }}
              data-testid="new-project-name"
              autoComplete="off"
              aria-invalid={nameTouched && !nameValidation.valid}
              className={`w-full rounded-xl border px-3 py-2 text-sm text-content-primary outline-none transition-colors ${
                nameTouched && !nameValidation.valid
                  ? 'border-danger bg-danger/5'
                  : 'border-stroke-subtle bg-surface-base focus:border-accent'
              }`}
              placeholder="e.g. My Next Project"
            />
            {nameTouched && !nameValidation.valid && nameValidation.error && (
              <p className="mt-1 text-xs text-red-400">{nameValidation.error}</p>
            )}
          </div>

          {/* Editor Style Selector */}
          <div>
            <p className="mb-2 text-xs font-medium text-content-secondary">Editor style</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Editor style">
              {STYLE_OPTIONS.map((option) => {
                const isSelected = editorStyle === option.value;
                const isDisabled = isTemplateMultiFile && option.value === 'plain';

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isDisabled || isSubmitting}
                    onClick={() => selectStyle(option.value)}
                    data-testid={`new-project-style-${option.value}`}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-accent bg-accent-subtle/30 ring-1 ring-accent'
                        : isDisabled
                          ? 'border-stroke-subtle opacity-40 cursor-not-allowed bg-surface-base'
                          : 'border-stroke-subtle hover:bg-surface-hover bg-surface-base'
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
                      <span className="block text-xs font-semibold text-content-primary">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-content-muted">
                        {option.description}
                      </span>
                      {isDisabled && (
                        <span className="mt-1 block text-[10px] text-amber-400">
                          Not supported for multi-file templates
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting Point / Scaffolds */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-content-secondary">Starting point</p>
              {onOpenTemplates && (
                <button
                  type="button"
                  onClick={onOpenTemplates}
                  disabled={isSubmitting}
                  data-testid="new-project-browse-templates"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Browse Template Gallery
                </button>
              )}
            </div>

            {/* If a template from gallery was chosen */}
            {selectedGalleryTemplate && template === 'template' ? (
              <div className="rounded-xl border border-accent bg-accent-subtle/20 p-3.5 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-surface-hover grid place-items-center text-lg shrink-0">
                      {selectedGalleryTemplate.meta.projectType === 'react'
                        ? '⚛️'
                        : selectedGalleryTemplate.meta.projectType === 'vue'
                          ? '💚'
                          : selectedGalleryTemplate.meta.projectType === 'nextjs'
                            ? '▲'
                            : '🌐'}
                    </div>
                    <div>
                      <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-accent text-accent-fg font-semibold mb-1">
                        Gallery Template
                      </span>
                      <h4 className="text-xs font-bold text-content-primary">
                        {selectedGalleryTemplate.meta.name}
                      </h4>
                      <p className="text-[11px] text-content-secondary mt-0.5 leading-relaxed line-clamp-2">
                        {selectedGalleryTemplate.meta.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGalleryTemplate(null);
                      setTemplate('starter');
                      setEditorStyle('plain');
                    }}
                    className="p-1 rounded text-content-muted hover:text-content-primary"
                    title="Change starting point"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {selectedGalleryTemplate.meta.projectType === 'nextjs' && (
                  <div className="mt-2.5 pt-2 border-t border-accent/20 flex items-start gap-1.5 text-[11px] text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>Next.js simulation: client components preview in browser; server routes require sandbox.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5" role="radiogroup" aria-label="Starting point">
                {BUILTIN_STARTERS.filter((opt) =>
                  editorStyle === 'plain' ? opt.styles.includes('plain') : true,
                ).map((option) => {
                  const isSelected = template === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isSubmitting}
                      onClick={() => selectStarter(option.value)}
                      data-testid={`new-project-template-${option.value}`}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent-subtle/30 ring-1 ring-accent'
                          : 'border-stroke-subtle hover:bg-surface-hover bg-surface-base'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`shrink-0 ${
                            isSelected ? 'text-accent' : 'text-content-muted'
                          }`}
                          aria-hidden
                        >
                          {option.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-content-primary truncate">
                              {option.title}
                            </span>
                            <span className="text-[10px] rounded px-1.5 py-0.2 bg-surface-hover text-content-muted border border-stroke-subtle">
                              {option.framework}
                            </span>
                          </div>
                          <span className="text-[11px] text-content-muted truncate block">
                            {option.description}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-accent shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stroke-subtle">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-stroke-subtle px-3.5 py-2 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (nameTouched && !nameValidation.valid)}
              data-testid="new-project-create"
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating Project…
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
