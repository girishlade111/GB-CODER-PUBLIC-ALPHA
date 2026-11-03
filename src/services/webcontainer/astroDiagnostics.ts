/**
 * Astro Runtime Diagnostics for WebContainer
 *
 * Phase 1F: Genuine Astro & Angular Development Workflows
 *
 * Provides actionable diagnostics for WebContainer-specific Astro failure modes:
 * - Node.js version incompatibility (e.g. Astro 7+ requiring >=22.23.4 while WebContainer runs v22.22.3)
 * - Missing or invalid astro.config.mjs
 * - Unsupported Sharp native binary image services
 * - Missing root page component (src/pages/index.astro)
 * - Port binding conflicts (EADDRINUSE on 4321)
 * - Vite native binding failures in browser WASM
 */

export interface AstroDiagnosticResult {
  isAstroIssue: boolean;
  category:
    | 'node_version_incompatible'
    | 'missing_config'
    | 'image_service_unsupported'
    | 'missing_entry_page'
    | 'port_conflict'
    | 'vite_native_failure'
    | 'general';
  title: string;
  message: string;
  recoveryAction: string;
  suggestedCommand?: string;
}

/**
 * Analyzes terminal or server output chunks for known Astro runtime issues in WebContainers.
 */
export function diagnoseAstroOutput(log: string): AstroDiagnosticResult | null {
  if (!log || typeof log !== 'string') return null;

  const lower = log.toLowerCase();

  // 1. Node.js engine incompatibility (Astro 7+ requires Node.js >=22.23.4)
  if (
    (log.includes('Unsupported engine') || log.includes('Not compatible with your version of node')) &&
    (lower.includes('astro') || lower.includes('22.23.4') || lower.includes('requires at least node'))
  ) {
    return {
      isAstroIssue: true,
      category: 'node_version_incompatible',
      title: 'Astro Node.js Engine Incompatibility',
      message:
        'Astro 7+ requires Node.js >=22.23.4. The current browser WebContainer runtime environment provides Node.js v22.22.3.',
      recoveryAction:
        'Pin Astro to version 5.x (e.g. astro@^5.4.2) which supports Node.js >=22.0.0, or run npm install with --ignore-engines.',
      suggestedCommand: 'npm install astro@5.4.2 --prefer-offline --no-audit --ignore-engines',
    };
  }

  // 2. Sharp / Native image service failure
  if (
    lower.includes('could not load the "sharp" module') ||
    lower.includes('sharp is required for image processing') ||
    lower.includes('failed to load sharp') ||
    (lower.includes('sharp') && lower.includes('native addon'))
  ) {
    return {
      isAstroIssue: true,
      category: 'image_service_unsupported',
      title: 'Sharp Native Image Service Incompatible',
      message:
        'Sharp requires native C++ binary bindings that cannot execute in the browser WebAssembly runtime.',
      recoveryAction:
        'Configure the passthrough/noop image service in astro.config.mjs: image: { service: { entrypoint: "astro/assets/services/noop" } }.',
    };
  }

  // 3. Missing root page component
  if (
    log.includes('No pages found') ||
    log.includes('src/pages/index.astro not found') ||
    log.includes('Missing index route') ||
    (lower.includes('no routes found') && lower.includes('pages'))
  ) {
    return {
      isAstroIssue: true,
      category: 'missing_entry_page',
      title: 'Missing Astro Page Route',
      message: 'Astro requires at least one route component inside the src/pages/ directory.',
      recoveryAction: 'Create src/pages/index.astro with frontmatter and HTML template structure.',
    };
  }

  // 4. Missing or invalid Astro configuration
  if (
    log.includes('Failed to load Astro config') ||
    log.includes('Invalid astro.config') ||
    (lower.includes('astro.config') && lower.includes('cannot find module'))
  ) {
    return {
      isAstroIssue: true,
      category: 'missing_config',
      title: 'Invalid or Missing Astro Config',
      message: 'Astro could not resolve or parse astro.config.mjs.',
      recoveryAction:
        'Ensure astro.config.mjs exists and exports a valid defineConfig({...}) object.',
    };
  }

  // 5. Port conflict (EADDRINUSE on port 4321)
  if (
    log.includes('EADDRINUSE') ||
    log.includes('port 4321 is in use') ||
    log.includes('Port 4321 is already in use') ||
    lower.includes('address already in use :::4321')
  ) {
    return {
      isAstroIssue: true,
      category: 'port_conflict',
      title: 'Port 4321 Already in Use',
      message: 'Another Astro server process is currently listening on port 4321.',
      recoveryAction:
        'Stop the active dev server session, or run Astro on an alternate port with the --port flag.',
      suggestedCommand: 'npx astro dev --port 4322',
    };
  }

  // 6. Vite native binding failure
  if (
    lower.includes('failed to load rollup native') ||
    lower.includes('@rollup/rollup-') ||
    (lower.includes('rollup') && lower.includes('native module'))
  ) {
    return {
      isAstroIssue: true,
      category: 'vite_native_failure',
      title: 'Vite Native Rollup Dependency Missing',
      message:
        'Astro internal Vite bundler attempted to load a native platform Rollup binary not compiled for WASM.',
      recoveryAction:
        'Ensure @rollup/wasm-node is installed or configure Vite to use WASM Rollup bindings in astro.config.mjs.',
    };
  }

  return null;
}
