import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Clipboard,
  Copy,
  GitCompare,
  ImagePlus,
  Loader2,
  Scan,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  VISION_MAX_IMAGE_BYTES,
  VisionRequestError,
  extractImageFromClipboard,
  fileToBase64,
  firstImageIn,
  generateCodeFromImage,
  type VisionFramework,
  type VisionImageData,
} from '../services/visionCodeService';

interface ScreenshotToCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Replaces the editor contents with the generated code. */
  onInsert: (code: string, framework: VisionFramework) => void;
  /** Opens the review-and-apply diff instead of writing straight to the editor. */
  onCompare: (code: string, framework: VisionFramework) => void;
}

interface FrameworkOption {
  id: VisionFramework;
  label: string;
  detail: string;
  fence: string;
}

const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  {
    id: 'html-tailwind',
    label: 'HTML + Tailwind',
    detail: 'Single document, Tailwind via Play CDN',
    fence: 'html',
  },
  {
    id: 'react-tailwind',
    label: 'React + Tailwind',
    detail: 'One self-contained React component',
    fence: 'jsx',
  },
  {
    id: 'html-vanilla',
    label: 'HTML + CSS',
    detail: 'Hand-written CSS, no framework',
    fence: 'html',
  },
];

const EXAMPLE_PROMPTS = [
  'Add a dark mode toggle in the header',
  'Make every button rounded-xl and add hover states',
  'Turn the top row of cards into a carousel',
];

/** Progress copy shown while the request is in flight. */
const PROGRESS_STEPS = [
  'Uploading image…',
  'Analyzing UI layout…',
  'Generating code…',
  'Finalizing…',
];

const PROGRESS_INTERVAL_MS = 4000;
const MAX_PROMPT_LENGTH = 300;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ScreenshotToCodeModal: React.FC<ScreenshotToCodeModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  onCompare,
}) => {
  const [image, setImage] = useState<VisionImageData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [framework, setFramework] = useState<VisionFramework>('html-tailwind');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; framework: VisionFramework } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  /*
   * dragenter/dragleave fire for every child the cursor crosses, so a plain
   * boolean flickers. Counting crossings is what keeps the highlight steady.
   */
  const dragDepth = useRef(0);

  const resetState = useCallback(() => {
    setImage(null);
    setPreviewUrl(null);
    setFileSize(0);
    setErrorMessage(null);
    setResult(null);
    setProgressIndex(0);
    setIsDragging(false);
    dragDepth.current = 0;
  }, []);

  // Clear a stale result whenever the image behind it changes.
  const applyImage = useCallback(
    (next: VisionImageData, size: number, url: string) => {
      setImage(next);
      setPreviewUrl(url);
      setFileSize(size);
      setResult(null);
      setErrorMessage(null);
    },
    [],
  );

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const converted = await fileToBase64(file);
        // Object URLs are revoked on the next image, and on unmount.
        const url = URL.createObjectURL(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        applyImage(converted, file.size, url);
      } catch (error) {
        setErrorMessage(
          error instanceof VisionRequestError
            ? error.message
            : 'That image could not be read.',
        );
      }
    },
    [applyImage, previewUrl],
  );

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    resetState();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl, resetState]);

  // ── Global paste: the whole point of "screenshot with Snipping Tool, then
  //    Ctrl+V here". Only active while the modal is open. ──
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (event: ClipboardEvent) => {
      // A paste into the refinement box is text, not an image.
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const file = extractImageFromClipboard(event);
      if (!file) return;

      event.preventDefault();
      void handleFile(file);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleFile]);

  // ── Escape to close, Enter to generate when an image is staged ──
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = window.setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, PROGRESS_STEPS.length - 1));
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  // Drop the staged image when the modal closes so reopening starts clean.
  useEffect(() => {
    if (isOpen) return;
    handleRemoveImage();
  }, [isOpen, handleRemoveImage]);

  // Object URLs outlive React state, so release the last one on unmount.
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const handleGenerate = async () => {
    if (!image || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setProgressIndex(0);

    try {
      const generated = await generateCodeFromImage({
        base64: image.base64,
        mimeType: image.mimeType,
        framework,
        userPrompt: extraPrompt.trim() || undefined,
      });

      setResult({ code: generated.code, framework: generated.framework });
    } catch (error) {
      setErrorMessage(
        error instanceof VisionRequestError
          ? error.message
          : 'Screenshot conversion failed — please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.code);
      toast.success('Generated code copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) onClose();
  };

  if (!isOpen) return null;

  const isGenerateDisabled = !image || isLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[640px] rounded-xl border border-stroke-dark bg-product p-6 shadow-2xl text-content-on-dark animate-scale-in">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/15 p-2 text-accent">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold text-content-on-dark">
                Screenshot to Code
              </h2>
              <p className="mt-0.5 text-sm text-content-on-dark-soft">
                Turn any UI screenshot into responsive, ready-to-run code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-content-on-dark-soft transition-colors hover:bg-product-elevated hover:text-content-on-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close Screenshot to Code modal"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Image input ── */}
        {!image ? (
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepth.current += 1;
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepth.current = Math.max(0, dragDepth.current - 1);
              if (dragDepth.current === 0) setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              dragDepth.current = 0;
              setIsDragging(false);
              const file = firstImageIn(event.dataTransfer?.files ?? null);
              if (file) void handleFile(file);
              else setErrorMessage('That does not look like an image. Drop a PNG, JPEG, or WebP.');
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-stroke-dark bg-product-elevated hover:border-stroke-subtle'
            }`}
          >
            <div className="mb-3 rounded-full bg-accent/15 p-3 text-accent">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-content-on-dark">
              {isDragging ? 'Drop it here' : 'Drag a screenshot here'}
            </p>
            <p className="mt-1 text-[12.5px] text-content-on-dark-soft">
              PNG, JPEG, or WebP up to {formatBytes(VISION_MAX_IMAGE_BYTES)}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="quiet-btn-accent h-9 text-[13px]"
              >
                <Upload className="h-4 w-4" />
                Choose Image
              </button>
              <span className="flex items-center gap-1.5 text-[12px] text-content-on-dark-soft">
                <Clipboard className="h-3.5 w-3.5" />
                or press
              </span>
              <kbd className="rounded border border-stroke-dark bg-product-elevated px-1.5 py-0.5 font-mono text-[11px] text-content-on-dark-soft">
                Ctrl + V
              </kbd>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = firstImageIn(event.target.files);
                if (file) void handleFile(file);
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-stroke-dark bg-product-elevated p-3">
            <div className="flex items-start gap-3">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Uploaded screenshot preview"
                  className="h-20 w-28 shrink-0 rounded-lg border border-stroke-dark object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-content-on-dark">
                  Screenshot ready
                </p>
                <p className="mt-0.5 text-[12px] text-content-on-dark-soft">
                  {image.mimeType} · {formatBytes(fileSize)}
                </p>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-content-on-dark-soft transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Framework selector ── */}
        <div className="mt-5">
          <span className="quiet-section-label mb-2 block">Output format</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FRAMEWORK_OPTIONS.map((option) => {
              const isSelected = option.id === framework;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFramework(option.id)}
                  disabled={isLoading}
                  aria-pressed={isSelected}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                      : 'border-stroke-dark bg-product-elevated hover:border-stroke-subtle'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-content-on-dark">
                    {option.label}
                    <span className="font-mono text-[10px] text-content-on-dark-soft">
                      {option.fence}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-content-on-dark-soft">
                    {option.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Extra instructions ── */}
        <div className="relative mt-4">
          <label htmlFor="vision-extra-prompt" className="quiet-section-label mb-2 block">
            Refinements (optional)
          </label>
          <textarea
            id="vision-extra-prompt"
            value={extraPrompt}
            onChange={(event) => {
              setExtraPrompt(event.target.value.slice(0, MAX_PROMPT_LENGTH));
              if (errorMessage) setErrorMessage(null);
            }}
            rows={2}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={isLoading}
            placeholder="Example: add a dark mode toggle in the header"
            className="w-full resize-y rounded-lg border border-stroke-dark bg-product-elevated px-3.5 py-2.5 text-[13px] text-content-on-dark outline-none transition-colors placeholder-content-on-dark-soft/50 focus:border-accent focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="absolute bottom-2 right-3 text-[11px] text-content-on-dark-soft">
            {extraPrompt.length} / {MAX_PROMPT_LENGTH}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setExtraPrompt(prompt)}
              disabled={isLoading}
              className="rounded-full border border-stroke-dark bg-product-elevated px-3 py-1 text-[11.5px] text-content-on-dark-soft transition-colors hover:border-accent hover:text-content-on-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-[13px] text-red-300">
            {errorMessage}
          </div>
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="mt-5 rounded-xl border border-stroke-dark bg-product-elevated p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-content-on-dark">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span>{PROGRESS_STEPS[progressIndex]}</span>
            </div>
            <div className="space-y-2">
              {PROGRESS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`h-1 flex-1 overflow-hidden rounded-full ${
                      index <= progressIndex ? 'bg-accent/30' : 'bg-stroke-soft'
                    }`}
                  >
                    <span
                      className={`block h-full rounded-full bg-accent transition-all duration-500 ${
                        index < progressIndex ? 'w-full' : index === progressIndex ? 'w-1/2' : 'w-0'
                      }`}
                    />
                  </span>
                  <span
                    className={`w-32 text-right text-[11px] ${
                      index <= progressIndex
                        ? 'text-content-on-dark-soft'
                        : 'text-content-on-dark-soft/50'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Result actions ── */}
        {result && !isLoading && (
          <div className="mt-5 rounded-xl border border-success/40 bg-success-subtle px-4 py-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-content-on-dark">
              <Sparkles className="h-4 w-4 text-success" />
              Code generated · {result.code.split('\n').length} lines
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onInsert(result.code, result.framework)}
                className="quiet-btn-accent h-9 flex-1 text-[13px]"
              >
                <Sparkles className="h-4 w-4" />
                Insert into Editor
              </button>
              <button
                type="button"
                onClick={() => onCompare(result.code, result.framework)}
                className="quiet-btn-dark h-9 flex-1 text-[13px]"
              >
                <GitCompare className="h-4 w-4" />
                Compare First
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="quiet-btn-dark h-9 px-3 text-[13px]"
                aria-label="Copy generated code to clipboard"
                title="Copy to Clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isGenerateDisabled}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13.5px] font-semibold transition-all shadow-sm ${
            isGenerateDisabled
              ? 'cursor-not-allowed border border-stroke-dark bg-product-elevated text-content-on-dark-soft/60'
              : 'cursor-pointer bg-accent text-white hover:bg-accent-hover active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Converting…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Code</span>
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-content-on-dark-soft/75">
          Images are sent to Google Gemini for analysis and are not stored.
        </p>
      </div>
    </div>
  );
};

export default ScreenshotToCodeModal;