/**
 * WebContainer availability reasoning — pure, dependency-free helpers.
 *
 * `webcontainerService.isSupported()` answers *whether* the runtime can run
 * (`Boolean(window.crossOriginIsolated)`). These helpers answer *why not*,
 * so the UI can show a disabled-but-visible WebContainer option with a
 * specific explanation instead of silently hiding it.
 *
 * Kept in a module with zero imports so it can be unit-tested in plain Node
 * (via the esbuild harness) without pulling in `@webcontainer/api` or React.
 * The `status` field is typed as `string` rather than `WebContainerStatus`
 * deliberately, to avoid an import cycle with `webcontainerService.ts`.
 */

export type WebContainerUnavailableReason =
  | 'cross-origin-isolation-missing'
  | 'insecure-context'
  | 'unsupported-browser'
  | 'initialization-failed'
  | 'unknown';

export interface WebContainerAvailabilityInput {
  crossOriginIsolated: boolean;
  isSecureContext: boolean;
  sharedArrayBufferAvailable: boolean;
  /** Current `WebContainerStatus` value from `webcontainerService.getState()`. */
  status: string;
}

/**
 * Returns `null` when WebContainer is available, otherwise the specific
 * reason it is not. Precedence is deliberate:
 *
 * 1. A failed boot is the proximate cause (a boot is only ever attempted
 *    when isolation was present, so it outranks the environment checks).
 * 2. An insecure context implies isolation can never hold.
 * 3. Missing isolation is the production failure mode (COOP/COEP headers
 *    absent on the deployed document).
 * 4. Missing `SharedArrayBuffer` means the browser itself is too old.
 */
export function getWebContainerUnavailableReason(
  input: WebContainerAvailabilityInput,
): WebContainerUnavailableReason | null {
  if (input.status === 'error') {
    return 'initialization-failed';
  }
  if (!input.isSecureContext) {
    return 'insecure-context';
  }
  if (!input.crossOriginIsolated) {
    return 'cross-origin-isolation-missing';
  }
  if (!input.sharedArrayBufferAvailable) {
    return 'unsupported-browser';
  }
  if (input.status === 'unsupported') {
    return 'unknown';
  }
  return null;
}

/**
 * Concise, user-facing explanation for an unavailability reason.
 * Used as the disabled control's tooltip; never includes sensitive data.
 */
export function describeWebContainerUnavailableReason(
  reason: WebContainerUnavailableReason,
): string {
  switch (reason) {
    case 'cross-origin-isolation-missing':
      return 'WebContainer unavailable: this page requires cross-origin isolation (COOP/COEP headers).';
    case 'insecure-context':
      return 'WebContainer unavailable: this page must be served over HTTPS (secure context).';
    case 'unsupported-browser':
      return 'WebContainer unavailable: this browser does not support SharedArrayBuffer.';
    case 'initialization-failed':
      return 'WebContainer failed to initialize. See the terminal output for details.';
    case 'unknown':
      return 'WebContainer unavailable for an unknown reason.';
  }
}
