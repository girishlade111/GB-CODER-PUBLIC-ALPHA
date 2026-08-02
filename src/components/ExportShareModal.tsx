import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Camera, Check, Copy, Download, ExternalLink, FileArchive, FileCode, Globe,
  Image as ImageIcon, Info, Link2, Loader2, RefreshCw, Share2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CaptureFormat, CaptureResult, DEFAULT_JPEG_QUALITY, capturePreview, captureFilename,
  clampQuality, copyCaptureToClipboard, downloadCapture,
} from '../services/captureService';
import {
  buildStandaloneHtml, createZipBlob, downloadBlob, estimateExportSize, formatBytes,
  htmlFilename, zipFilename,
} from '../services/projectArchiveService';
import {
  buildShareLink, openInCodePen, openInJsFiddle, prepareExternalExport,
} from '../services/shareLinkService';
import { generatePreviewShareURL } from '../services/shareExportService';
import { MultiFileProject, projectToTriple } from '../types/files';
import { ExternalLibrary } from '../services/externalLibraryService';

type TabId = 'screenshot' | 'export' | 'share';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MultiFileProject;
  previewRef: React.RefObject<HTMLElement>;
  externalLibraries?: ExternalLibrary[];
  resolvedVersions?: Record<string, string>;
  projectName?: string;
  /** Tab to open on. Lets a shortcut jump straight to Screenshot. */
  initialTab?: TabId;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'screenshot', label: 'Screenshot', icon: <Camera className="h-4 w-4" /> },
  { id: 'export', label: 'Export', icon: <Download className="h-4 w-4" /> },
  { id: 'share', label: 'Share', icon: <Share2 className="h-4 w-4" /> },
];

const rowClass =
  'flex w-full items-center gap-3 rounded-md border border-stroke-subtle bg-surface-overlay px-3 py-2.5 text-left text-sm text-content-secondary transition-colors hover:border-accent/50 hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50';

const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  project,
  previewRef,
  externalLibraries = [],
  resolvedVersions = {},
  projectName = 'gb-coder-project',
  initialTab = 'screenshot',
}) => {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Screenshot state
  const [format, setFormat] = useState<CaptureFormat>('png');
  const [quality, setQuality] = useState(DEFAULT_JPEG_QUALITY);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // ZIP progress
  const [zipPercent, setZipPercent] = useState<number | null>(null);

  const [includeInjections, setIncludeInjections] = useState(true);

  const isFrameworkProject = project.projectType !== 'plain';
  const triple = useMemo(() => projectToTriple(project), [project]);
  const isEmpty =
    !isFrameworkProject &&
    !triple.html.trim() &&
    !triple.css.trim() &&
    !triple.javascript.trim();

  const archiveOptions = useMemo(
    () => ({ projectName, externalLibraries, resolvedVersions, includeInjections, projectId: project.id }),
    [projectName, externalLibraries, resolvedVersions, includeInjections, project.id],
  );

  const sizes = useMemo(
    () => (isOpen ? estimateExportSize(project, archiveOptions) : null),
    [isOpen, project, archiveOptions],
  );

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  // Discard a stale capture when the modal closes so reopening starts fresh.
  useEffect(() => {
    if (!isOpen) {
      setCapture(null);
      setCaptureError(null);
      setZipPercent(null);
      setBusy(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const flashCopied = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied((current) => (current === key ? null : current)), 2000);
  };

  // ─── Screenshot ─────────────────────────────────────────────────────────────

  const runCapture = useCallback(
    async (nextFormat: CaptureFormat = format, nextQuality: number = quality) => {
      setBusy('capture');
      setCaptureError(null);
      try {
        const result = await capturePreview(previewRef.current, {
          format: nextFormat,
          quality: nextQuality,
        });
        setCapture(result);
      } catch (error) {
        setCapture(null);
        setCaptureError(error instanceof Error ? error.message : 'Capture failed.');
      } finally {
        setBusy(null);
      }
    },
    [format, quality, previewRef],
  );

  const handleSaveCapture = () => {
    if (!capture) return;
    downloadCapture(capture, captureFilename(capture.format, projectName));
    toast.success(`Saved as ${capture.format.toUpperCase()}.`);
  };

  const handleCopyCapture = async () => {
    if (!capture) return;
    setBusy('copy-image');
    try {
      await copyCaptureToClipboard(capture);
      flashCopied('image');
      toast.success('Image copied to clipboard.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Copy failed.');
    } finally {
      setBusy(null);
    }
  };

  // ─── Export ─────────────────────────────────────────────────────────────────

  const handleExportHtml = () => {
    const html = buildStandaloneHtml(project, archiveOptions);
    downloadBlob(html, htmlFilename(projectName), 'text/html');
    toast.success('Standalone HTML downloaded.');
  };

  const handleExportZip = async () => {
    setBusy('zip');
    setZipPercent(0);
    try {
      const blob = await createZipBlob(project, archiveOptions, (progress) =>
        setZipPercent(progress.percent),
      );
      downloadBlob(blob, zipFilename(projectName));
      toast.success(`ZIP downloaded (${formatBytes(blob.size)}).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the archive.');
    } finally {
      setBusy(null);
      setZipPercent(null);
    }
  };

  // ─── Share ──────────────────────────────────────────────────────────────────

  const handleCopyShareLink = async () => {
    const result = buildShareLink(project);
    if (!result.ok) {
      toast.error(result.message, { duration: 6000 });
      return;
    }
    await navigator.clipboard.writeText(result.url);
    flashCopied('link');
    toast.success(`Share link copied (${formatBytes(result.length)}).`);
  };

  const handleSharePreview = async () => {
    if (isFrameworkProject) {
      toast.error(
        'Share URL requires project storage. Export as ZIP or use Sandbox mode for live sharing.',
        { duration: 6000 },
      );
      return;
    }
    setBusy('preview-share');
    try {
      const { url } = await generatePreviewShareURL(triple.html, triple.css, triple.javascript);
      await navigator.clipboard.writeText(url);
      flashCopied('preview');
      toast.success('Live preview link copied.');
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      toast.error(
        code === 'TOO_MANY_SHARES'
          ? 'Too many shares this hour. Try again later.'
          : code === 'EMPTY_PROJECT'
            ? 'Nothing to share yet — write some code first.'
            : 'Could not create a hosted link. Copy a self-contained link instead.',
        { duration: 6000 },
      );
    } finally {
      setBusy(null);
    }
  };

  const handleExternal = (target: 'codepen' | 'jsfiddle') => {
    const prepared = prepareExternalExport(project, projectName);
    if (!prepared.ok) {
      toast.error(prepared.message, { duration: 6000 });
      return;
    }
    if (target === 'codepen') openInCodePen(prepared.payload);
    else openInJsFiddle(prepared.payload);
  };

  if (!isOpen) return null;

  // ─── Empty state ────────────────────────────────────────────────────────────

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="rounded-lg border border-stroke-subtle bg-surface-overlay p-3">
        <FileCode className="h-6 w-6 text-content-muted" />
      </div>
      <p className="text-sm font-medium text-content-secondary">Nothing to export yet</p>
      <p className="max-w-sm text-xs text-content-muted">
        Write some HTML, CSS or JavaScript — or use Build with AI to generate a starting point —
        and your export options will appear here.
      </p>
    </div>
  );

  // ─── Tabs ───────────────────────────────────────────────────────────────────

  const renderScreenshot = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-content-muted">Format</span>
        {(['png', 'jpeg', 'svg'] as CaptureFormat[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setFormat(option);
              setCapture(null);
            }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              format === option
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-overlay text-content-secondary hover:text-content-primary'
            }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>

      {format === 'jpeg' && (
        <div>
          <label
            htmlFor="jpeg-quality"
            className="flex items-center justify-between text-xs text-content-secondary"
          >
            <span>JPEG quality</span>
            <span className="font-mono text-content-primary">{quality.toFixed(2)}</span>
          </label>
          <input
            id="jpeg-quality"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(event) => {
              setQuality(clampQuality(Number(event.target.value)));
              setCapture(null);
            }}
            className="mt-2 w-full accent-accent"
          />
        </div>
      )}

      {/* Capture preview — confirm or retake before saving. */}
      <div className="overflow-hidden rounded-md border border-stroke-subtle bg-surface-canvas">
        {capture ? (
          // Neutral letterbox: `object-contain` leaves bars around a portrait
          // capture, and a white backing made a correct dark capture look like
          // it had blank side panels.
          <img
            src={capture.dataUrl}
            alt="Captured preview"
            className="max-h-64 w-full bg-surface-canvas object-contain"
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            {busy === 'capture' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <p className="text-xs text-content-muted">Capturing the preview…</p>
              </>
            ) : captureError ? (
              <>
                <ImageIcon className="h-5 w-5 text-red-300" />
                <p className="max-w-xs text-xs text-red-300">{captureError}</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5 text-content-muted" />
                <p className="text-xs text-content-muted">
                  Capture the Live Preview to see it here first.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {capture && (
        <p className="text-xs text-content-muted">
          {capture.width} × {capture.height} px · ~{formatBytes(capture.bytes)} ·{' '}
          {capture.format.toUpperCase()}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => runCapture()}
          disabled={busy === 'capture'}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {busy === 'capture' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : capture ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {capture ? 'Retake' : 'Capture'}
        </button>

        <button type="button" onClick={handleSaveCapture} disabled={!capture} className={rowClass + ' w-auto'}>
          <Download className="h-4 w-4" />
          Save as {format.toUpperCase()}
        </button>

        <button
          type="button"
          onClick={handleCopyCapture}
          disabled={!capture || busy === 'copy-image'}
          className={rowClass + ' w-auto'}
        >
          {copied === 'image' ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          Copy to Clipboard
        </button>
      </div>
    </div>
  );

  const renderExport = () => (
    <div className="space-y-3">
      <button type="button" onClick={handleExportHtml} className={rowClass}>
        <FileCode className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-content-primary">Export as HTML</span>
          <span className="block text-xs text-content-muted">
            {isFrameworkProject
              ? 'Framework projects export their markup shell — use ZIP for the full project.'
              : 'One standalone file with inline styles and script.'}
          </span>
        </span>
        {sizes && <span className="shrink-0 text-xs text-content-muted">{formatBytes(sizes.htmlBytes)}</span>}
      </button>

      <button type="button" onClick={handleExportZip} disabled={busy === 'zip'} className={rowClass}>
        {busy === 'zip' ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <FileArchive className="h-4 w-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-content-primary">Export as ZIP</span>
          <span className="block text-xs text-content-muted">
            {isFrameworkProject
              ? `Full project tree with package.json and Vite config (${sizes?.fileCount ?? 0} files).`
              : `index.html, style.css and script.js (${sizes?.fileCount ?? 0} files).`}
          </span>
        </span>
        {sizes && (
          <span className="shrink-0 text-xs text-content-muted">≈{formatBytes(sizes.zipBytes)}</span>
        )}
      </button>

      {zipPercent !== null && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${zipPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-content-muted">Compressing… {zipPercent}%</p>
        </div>
      )}

      {isFrameworkProject && (
        <p className="flex gap-2 rounded-md border border-stroke-subtle bg-surface-overlay p-3 text-xs text-content-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Your CDN imports are written into package.json as real npm dependencies, pinned to the
          versions the preview used. Run <code className="font-mono text-content-secondary">npm install</code> after
          unzipping.
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-md border border-stroke-subtle bg-surface-overlay px-3 py-2.5">
        <input
          type="checkbox"
          id="include-injections-export"
          checked={includeInjections}
          onChange={(e) => setIncludeInjections(e.target.checked)}
          className="h-4 w-4 rounded border-stroke-subtle bg-surface-base text-accent focus:ring-accent"
        />
        <label htmlFor="include-injections-export" className="flex flex-col cursor-pointer">
          <span className="text-sm font-medium text-content-primary">Include custom injections</span>
          <span className="text-xs text-content-muted">Embeds your active injections (like analytics or fonts) into the exported files</span>
        </label>
      </div>
    </div>
  );

  const renderShare = () => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSharePreview}
        disabled={busy === 'preview-share'}
        className={rowClass}
      >
        {busy === 'preview-share' ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : copied === 'preview' ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <Globe className="h-4 w-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-content-primary">Share Live Preview</span>
          <span className="block text-xs text-content-muted">
            {isFrameworkProject
              ? 'Requires project storage — export as ZIP or use Sandbox mode.'
              : 'Hosted short link, best for sending to others.'}
          </span>
        </span>
      </button>

      <button type="button" onClick={handleCopyShareLink} className={rowClass}>
        {copied === 'link' ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <Link2 className="h-4 w-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-content-primary">Copy self-contained link</span>
          <span className="block text-xs text-content-muted">
            The whole project encoded in the URL — no server needed.
          </span>
        </span>
      </button>

      <div className="pt-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-content-muted">
          Open in a playground
        </p>
        <div className="space-y-3">
          <button type="button" onClick={() => handleExternal('codepen')} className={rowClass}>
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 font-medium text-content-primary">Export to CodePen</span>
          </button>
          <button type="button" onClick={() => handleExternal('jsfiddle')} className={rowClass}>
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 font-medium text-content-primary">Export to JSFiddle</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-raised shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-stroke-subtle p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-accent-subtle p-2 text-accent-hover">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Export &amp; Share</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                {isFrameworkProject
                  ? `${project.projectType === 'react' ? 'React' : 'Vue'} project · ${project.files.length} files`
                  : 'Plain HTML/CSS/JS project'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
            aria-label="Close export and share"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" aria-label="Export and share" className="flex items-center border-b border-stroke-subtle px-2">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              role="tab"
              aria-selected={tab === entry.id}
              onClick={() => setTab(entry.id)}
              className={`-mb-[1px] flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === entry.id
                  ? 'border-accent text-content-primary'
                  : 'border-transparent text-content-muted hover:text-content-primary'
              }`}
            >
              {entry.icon}
              {entry.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isEmpty
            ? renderEmptyState()
            : tab === 'screenshot'
              ? renderScreenshot()
              : tab === 'export'
                ? renderExport()
                : renderShare()}
        </div>
      </div>
    </div>
  );
};

export default ExportShareModal;
