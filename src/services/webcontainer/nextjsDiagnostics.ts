/**
 * Next.js Runtime Diagnostics for WebContainer
 *
 * Phase 1E: Genuine Next.js Runtime, SSR, API Routes & Live Preview
 *
 * Provides actionable diagnostics for WebContainer-specific Next.js failure modes:
 * - Turbopack native binary incompatibility
 * - Native SWC binary failure and WASM fallback guidance
 * - Unsupported Node.js engine versions
 * - Missing root layout in App Router
 * - Port binding conflicts (EADDRINUSE)
 */

export interface NextJsDiagnosticResult {
  isNextJsIssue: boolean;
  category:
    | 'turbopack_unsupported'
    | 'swc_native_failure'
    | 'unsupported_node'
    | 'missing_layout'
    | 'port_conflict'
    | 'general';
  title: string;
  message: string;
  recoveryAction: string;
  suggestedCommand?: string;
}

/**
 * Analyzes terminal or server output chunks for known Next.js runtime issues in WebContainers.
 */
export function diagnoseNextJsOutput(log: string): NextJsDiagnosticResult | null {
  if (!log || typeof log !== 'string') return null;

  // 1. Turbopack native binary failure
  if (
    log.includes('turbo.createProject') ||
    log.includes('Turbopack is currently not supported') ||
    log.includes('failed to load turbopack') ||
    (log.toLowerCase().includes('turbopack') && log.toLowerCase().includes('not supported')) ||
    (log.toLowerCase().includes('turbo') && log.toLowerCase().includes('wasm bindings'))
  ) {
    return {
      isNextJsIssue: true,
      category: 'turbopack_unsupported',
      title: 'Turbopack Not Supported in WebContainers',
      message:
        'Next.js Turbopack relies on native Rust bindings that cannot execute in the browser WebAssembly sandbox.',
      recoveryAction: 'Run Next.js with Webpack by removing the --turbo flag from your dev script.',
      suggestedCommand: 'next dev',
    };
  }

  // 2. SWC native binary load failure
  if (
    log.toLowerCase().includes('failed to load swc binary') ||
    log.toLowerCase().includes('cannot find module \'@next/swc-') ||
    log.toLowerCase().includes('failed to load @next/swc') ||
    (log.toLowerCase().includes('swc') && log.toLowerCase().includes('binary'))
  ) {
    return {
      isNextJsIssue: true,
      category: 'swc_native_failure',
      title: 'Native SWC Binary Incompatible',
      message:
        'Native platform SWC binaries cannot run in WebContainers. WebAssembly-compiled SWC bindings are required.',
      recoveryAction: 'Install @next/swc-wasm-nodejs matching your Next.js version as a project dependency.',
      suggestedCommand: 'npm install --save-exact @next/swc-wasm-nodejs@16.4.4',
    };
  }

  // 3. Unsupported Node.js version
  if (
    log.includes('You are using Node.js') &&
    (log.includes('Next.js requires at least Node.js') || log.includes('unsupported Node.js version'))
  ) {
    return {
      isNextJsIssue: true,
      category: 'unsupported_node',
      title: 'Unsupported Node.js Version',
      message:
        'Installed Next.js version requires a different Node.js runtime version than provided by the current WebContainer instance.',
      recoveryAction: 'Use Next.js 16.4.x (Active LTS) which is supported on WebContainer Node.js 20/22.',
      suggestedCommand: 'npm install next@16.4.4 react@^19.0.0 react-dom@^19.0.0',
    };
  }

  // 4. Missing root layout in App Router
  if (
    log.includes('Your page.tsx does not have a root layout') ||
    log.includes('Expected app/layout.tsx to be present') ||
    log.includes('Missing required root layout')
  ) {
    return {
      isNextJsIssue: true,
      category: 'missing_layout',
      title: 'Missing App Router Root Layout',
      message: 'Next.js App Router requires a root layout file at app/layout.tsx wrapping all child pages.',
      recoveryAction: 'Create app/layout.tsx with <html> and <body> tags.',
    };
  }

  // 5. Port conflict (EADDRINUSE)
  if (
    log.includes('EADDRINUSE') ||
    log.includes('port 3000 is in use') ||
    log.includes('Port 3000 is already in use')
  ) {
    return {
      isNextJsIssue: true,
      category: 'port_conflict',
      title: 'Port 3000 Already in Use',
      message: 'Another process is currently listening on port 3000.',
      recoveryAction: 'Stop the active dev server session, or allow Next.js to select port 3001 automatically.',
      suggestedCommand: 'next dev -p 3001',
    };
  }

  return null;
}
