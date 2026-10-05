/**
 * Screenshot → Code (vision-to-code) client service.
 *
 * Owns everything that happens before the request leaves the browser: turning a
 * File into base64, pulling an image out of a paste event, validating type and
 * size, and calling `POST /api/vision-to-code`.
 *
 * Errors are surfaced as typed failures rather than raw fetch rejections, so
 * the modal can show an actionable message without string-matching.
 */

/** Code targets the vision endpoint can produce. */
export type VisionFramework = 'html-tailwind' | 'react-tailwind' | 'html-vanilla';

/** Gemini model to call. `flash` is the default; `pro` is for dense layouts. */
export type VisionModel = 'gemini-1.5-flash' | 'gemini-1.5-pro';

/** Mirrors the backend's accepted image formats. */
export const VISION_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Matches the backend's 5 MB cap. Checked before any base64 work is done. */
export const VISION_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Vision calls are slower and more expensive than text calls, so the ceiling is generous. */
const REQUEST_TIMEOUT_MS = 120_000;

export interface VisionImageData {
  /** Raw base64 payload with no `data:` prefix. */
  base64: string;
  mimeType: string;
}

export interface VisionRequest extends VisionImageData {
  framework: VisionFramework;
  model?: VisionModel;
  /** Free-text refinement, e.g. "add a dark mode toggle". */
  userPrompt?: string;
  /**
   * Gemini key to use instead of the server's GEMINI_API_KEY.
   *
   * The server prefers a body-supplied key over its own, so this is a fallback
   * for deployments that have no server-side key configured. It is the same
   * `VITE_GEMINI_API_KEY` the AI chat assistant already uses, so no new secret
   * is introduced.
   */
  apiKey?: string;
}

export interface VisionResult {
  code: string;
  framework: VisionFramework;
  model: string;
}

/** A rejected image or request. `retryable` mirrors AiRequestError's contract. */
export class VisionRequestError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status = 0, retryable = true) {
    super(message);
    this.name = 'VisionRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

/**
 * Converts a File to base64 plus its MIME type.
 *
 * Throws VisionRequestError for anything the backend would reject anyway, so
 * the user finds out about a 9 MB screenshot before a 9 MB upload happens.
 */
export const fileToBase64 = (file: File): Promise<VisionImageData> =>
  new Promise((resolve, reject) => {
    const mimeType = (file.type || '').toLowerCase();

    if (!VISION_MIME_TYPES.includes(mimeType as (typeof VISION_MIME_TYPES)[number])) {
      reject(
        new VisionRequestError(
          'That image type is not supported. Use a PNG, JPEG, or WebP screenshot.',
          0,
          false,
        ),
      );
      return;
    }

    if (file.size > VISION_MAX_IMAGE_BYTES) {
      reject(
        new VisionRequestError(
          'That image is larger than 5 MB. Crop it or compress it before uploading.',
          0,
          false,
        ),
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      // `data:<mime>;base64,<payload>` — keep only the payload for the API field.
      const base64 = result.slice(result.indexOf(',') + 1);

      if (!base64) {
        reject(new VisionRequestError('That image could not be read.', 0, true));
        return;
      }

      resolve({ base64, mimeType });
    };

    reader.onerror = () =>
      reject(new VisionRequestError('That image could not be read.', 0, true));

    reader.readAsDataURL(file);
  });

/**
 * Pulls an image out of a paste event.
 *
 * Snipping Tool and browser screenshots both arrive as an image on the
 * clipboard, so this is what makes Ctrl+V inside the modal work. Text-only
 * pastes return null rather than throwing — the caller decides whether that is
 * an error worth surfacing.
 */
export const extractImageFromClipboard = (event: ClipboardEvent): File | null => {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.kind !== 'file') continue;

    const type = (item.type || '').toLowerCase();
    if (!VISION_MIME_TYPES.includes(type as (typeof VISION_MIME_TYPES)[number])) continue;

    const file = item.getAsFile();
    if (file) return file;
  }

  return null;
};

/** Picks the first usable image out of a drop or file-picker list. */
export const firstImageIn = (files: FileList | File[] | null): File | null => {
  if (!files) return null;

  for (const file of Array.from(files)) {
    const type = (file.type || '').toLowerCase();
    if (VISION_MIME_TYPES.includes(type as (typeof VISION_MIME_TYPES)[number])) return file;
  }

  return null;
};

/** Post-processes model output that may still carry a markdown fence. */
const stripFences = (text: string): string => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:[a-zA-Z0-9+#-]*)\s*\n?([\s\S]*?)```/);
  return (fenced ? fenced[1] : trimmed).trim();
};

/**
 * Calls `POST /api/vision-to-code` with an abort-backed timeout and returns the
 * generated code. Transport failures, HTTP errors, and timeouts all surface as
 * VisionRequestError with a message the modal can show verbatim.
 */
export const generateCodeFromImage = async (request: VisionRequest): Promise<VisionResult> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/vision-to-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        /*
         * A local install often has only the public VITE_ key, so fall back to
         * it rather than failing on a missing server-side GEMINI_API_KEY. An
         * empty string is sent as absent and the server then requires its own.
         */
        apiKey: request.apiKey || import.meta.env.VITE_GEMINI_API_KEY || undefined,
      }),
      signal: controller.signal,
    });

    let data: (Partial<VisionResult> & { error?: string }) | null = null;
    try {
      data = (await response.json()) as Partial<VisionResult> & { error?: string };
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new VisionRequestError(
          "You're sending requests too fast. Wait a moment and try again.",
          429,
          true,
        );
      }
      if (response.status === 413) {
        throw new VisionRequestError(
          'That image is too large. Use a smaller screenshot (under 5 MB).',
          413,
          false,
        );
      }
      if (response.status === 400 || response.status === 422) {
        throw new VisionRequestError(
          data?.error || 'That screenshot could not be processed.',
          response.status,
          false,
        );
      }
      if (response.status === 500) {
        throw new VisionRequestError(
          data?.error || 'Vision-to-Code is not configured on this deployment.',
          500,
          false,
        );
      }
      throw new VisionRequestError(
        data?.error || 'Screenshot generation failed. Please try again.',
        response.status,
        true,
      );
    }

    const code = typeof data?.code === 'string' ? stripFences(data.code) : '';
    if (!code) {
      throw new VisionRequestError('Gemini returned no code for that screenshot.', 200, true);
    }

    return {
      code,
      framework: (data?.framework as VisionFramework) || request.framework,
      model: data?.model || request.model || 'gemini-1.5-flash',
    };
  } catch (error) {
    if (error instanceof VisionRequestError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new VisionRequestError('Screenshot conversion timed out. Please try again.', 0, true);
    }
    throw new VisionRequestError(
      'Connection failed. Check your internet and try again.',
      0,
      true,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
};