/**
 * Screenshot capture for the Live Preview.
 *
 * The important detail: the preview is an `<iframe>`. `html-to-image` clones a
 * DOM node and inlines its computed styles, and it cannot see inside an iframe
 * from the parent document — pointed at the preview container it produced a
 * blank rectangle. Because the iframe is same-origin (`srcdoc` +
 * `allow-same-origin`), its `contentDocument` is reachable, so we capture the
 * iframe's own `<body>` instead.
 */

import { toJpeg, toPng, toSvg } from 'html-to-image';

export type CaptureFormat = 'png' | 'jpeg' | 'svg';

export interface CaptureOptions {
  format: CaptureFormat;
  /** JPEG quality, 0.1-1.0. Ignored for PNG/SVG. */
  quality?: number;
  /** Background painted under the capture. */
  backgroundColor?: string;
  /** Device pixel ratio multiplier for crisper raster output. */
  pixelRatio?: number;
}

export interface CaptureResult {
  dataUrl: string;
  format: CaptureFormat;
  width: number;
  height: number;
  /** Approximate decoded byte size of the image. */
  bytes: number;
}

export const DEFAULT_JPEG_QUALITY = 0.9;

export const MIME_BY_FORMAT: Record<CaptureFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

export const EXTENSION_BY_FORMAT: Record<CaptureFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  svg: 'svg',
};

/** Raised when there is nothing capturable on screen. */
export class CaptureUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaptureUnavailableError';
  }
}

export interface CaptureTarget {
  element: HTMLElement;
  width: number;
  height: number;
}

/**
 * Finds the node to capture and the box to capture it at.
 *
 * Resolves the preview container (or the iframe itself) down to the iframe's
 * `documentElement`, sized to the iframe's *visible* box. Using scrollWidth /
 * scrollHeight instead produced a canvas larger than the laid-out document, so
 * the content ended up small and surrounded by blank padding — the capture has
 * to match what the user actually sees.
 */
export const resolveCaptureTarget = (root: HTMLElement | null): CaptureTarget => {
  if (!root) {
    throw new CaptureUnavailableError(
      'Preview not found. Open the Live Preview tab and try again.',
    );
  }

  const iframe =
    root instanceof HTMLIFrameElement ? root : root.querySelector('iframe');

  if (iframe instanceof HTMLIFrameElement) {
    let documentElement: HTMLElement | null = null;
    let body: HTMLElement | null = null;
    try {
      documentElement = iframe.contentDocument?.documentElement ?? null;
      body = iframe.contentDocument?.body ?? null;
    } catch {
      // Cross-origin iframe: unreachable by design.
      throw new CaptureUnavailableError(
        'The preview could not be read for capture. Try refreshing the preview.',
      );
    }

    if (!documentElement || !body) {
      throw new CaptureUnavailableError(
        'The preview is still loading. Wait a moment and try again.',
      );
    }
    if (!body.firstElementChild && !body.textContent?.trim()) {
      throw new CaptureUnavailableError('The preview is empty — nothing to capture yet.');
    }

    return {
      element: documentElement,
      width: iframe.clientWidth || documentElement.clientWidth || 1,
      height: iframe.clientHeight || documentElement.clientHeight || 1,
    };
  }

  return {
    element: root,
    width: root.clientWidth || root.offsetWidth || 1,
    height: root.clientHeight || root.offsetHeight || 1,
  };
};

/** Waits for images and webfonts inside the captured document to settle. */
const waitForAssets = async (element: HTMLElement): Promise<void> => {
  const ownerDocument = element.ownerDocument;

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) return resolve();
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
          setTimeout(resolve, 2000);
        }),
    ),
  );

  try {
    await ownerDocument.fonts?.ready;
  } catch {
    // Font loading is best-effort.
  }

  // One frame so any final layout/paint lands before serialising.
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
};

/** Rough decoded size of a data URL, for the size hint in the UI. */
export const dataUrlBytes = (dataUrl: string): number => {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return 0;
  const payload = dataUrl.slice(commaIndex + 1);

  if (dataUrl.slice(0, commaIndex).includes(';base64')) {
    const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
  }
  return new TextEncoder().encode(decodeURIComponent(payload)).length;
};

/**
 * Captures the preview.
 *
 * SVG output is a standalone document: html-to-image emits a `<foreignObject>`
 * containing the cloned DOM with every computed style inlined, which is exactly
 * the "DOM structure + inline styles" SVG the brief calls for.
 */
export const capturePreview = async (
  root: HTMLElement | null,
  options: CaptureOptions,
): Promise<CaptureResult> => {
  const { element: target, width, height } = resolveCaptureTarget(root);
  await waitForAssets(target);

  /*
   * Background: <html> is usually transparent, so read <body> too and fall back
   * to white. Without this a dark preview captured as PNG comes out transparent
   * and looks white-on-white in most image viewers.
   */
  const view = target.ownerDocument.defaultView;
  const readBackground = (node: Element | null): string | undefined => {
    if (!node || !view) return undefined;
    const value = view.getComputedStyle(node).backgroundColor.replace(/\s/g, '');
    return value && value !== 'rgba(0,0,0,0)' && value !== 'transparent' ? value : undefined;
  };

  const backgroundColor =
    options.backgroundColor ??
    readBackground(target) ??
    readBackground(target.ownerDocument.body) ??
    '#ffffff';

  const shared = {
    width,
    height,
    pixelRatio: options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor,
    // Pin the clone to the same box so it lays out exactly as displayed.
    style: { width: `${width}px`, height: `${height}px`, margin: '0' },
    cacheBust: true,
  };

  let dataUrl: string;
  try {
    if (options.format === 'jpeg') {
      dataUrl = await toJpeg(target, {
        ...shared,
        quality: clampQuality(options.quality ?? DEFAULT_JPEG_QUALITY),
      });
    } else if (options.format === 'svg') {
      // pixelRatio is meaningless for vector output.
      dataUrl = await toSvg(target, { ...shared, pixelRatio: 1 });
    } else {
      dataUrl = await toPng(target, shared);
    }
  } catch (error) {
    throw new Error(
      `Capture failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return { dataUrl, format: options.format, width, height, bytes: dataUrlBytes(dataUrl) };
};

export const clampQuality = (value: number): number =>
  Math.min(1, Math.max(0.1, Number.isFinite(value) ? value : DEFAULT_JPEG_QUALITY));

/** Converts a data URL to a Blob without a fetch (avoids CSP/CORS surprises). */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, payload] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';

  if (header.includes(';base64')) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  return new Blob([decodeURIComponent(payload)], { type: mime });
};

export const captureFilename = (format: CaptureFormat, projectName = 'gb-coder'): string => {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `${projectName}-${stamp}.${EXTENSION_BY_FORMAT[format]}`;
};

/** Downloads a captured image. */
export const downloadCapture = (result: CaptureResult, filename: string): void => {
  const blob = dataUrlToBlob(result.dataUrl);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Copies a captured image to the system clipboard.
 *
 * Browsers only accept PNG for image clipboard writes, so a JPEG/SVG capture is
 * re-encoded to PNG via a canvas first rather than failing.
 */
export const copyCaptureToClipboard = async (result: CaptureResult): Promise<void> => {
  if (!navigator.clipboard || !('write' in navigator.clipboard) || typeof ClipboardItem === 'undefined') {
    throw new Error('Your browser does not support copying images. Try Chrome or Edge.');
  }

  const pngDataUrl =
    result.format === 'png' ? result.dataUrl : await reencodeToPng(result.dataUrl);

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': dataUrlToBlob(pngDataUrl) }),
  ]);
};

const reencodeToPng = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Could not create a canvas for conversion.'));
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('Could not convert the image for the clipboard.'));
    image.src = dataUrl;
  });
