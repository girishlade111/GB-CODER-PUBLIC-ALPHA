/**
 * Angular Runtime Diagnostics for WebContainer
 *
 * Phase 1F: Genuine Astro & Angular Development Workflows
 *
 * Provides actionable diagnostics for WebContainer-specific Angular failure modes:
 * - Angular CLI esbuild native builder failure
 * - Missing or invalid angular.json workspace configuration
 * - Missing main bootstrap entry (src/main.ts)
 * - Port binding conflicts (EADDRINUSE on 4200)
 * - Zone.js polyfill / reactive zone issues
 */

export interface AngularDiagnosticResult {
  isAngularIssue: boolean;
  category:
    | 'esbuild_native_failure'
    | 'workspace_config_missing'
    | 'missing_main_entry'
    | 'zone_js_failure'
    | 'port_conflict'
    | 'general';
  title: string;
  message: string;
  recoveryAction: string;
  suggestedCommand?: string;
}

/**
 * Analyzes terminal or server output chunks for known Angular runtime issues in WebContainers.
 */
export function diagnoseAngularOutput(log: string): AngularDiagnosticResult | null {
  if (!log || typeof log !== 'string') return null;

  const lower = log.toLowerCase();

  // 1. esbuild native binary execution failure
  if (
    lower.includes('cannot find module \'esbuild\'') ||
    lower.includes('failed to start esbuild') ||
    lower.includes('the esbuild JavaScript API cannot be used directly') ||
    (lower.includes('esbuild') && lower.includes('platform binary')) ||
    (lower.includes('esbuild') && lower.includes('spawn') && lower.includes('enoent'))
  ) {
    return {
      isAngularIssue: true,
      category: 'esbuild_native_failure',
      title: 'Angular esbuild Native Binary Incompatible',
      message:
        'Angular CLI application builder defaults to esbuild native binaries that cannot execute in the browser WebAssembly runtime.',
      recoveryAction:
        'Configure the Webpack-based browser builder in angular.json: "@angular-devkit/build-angular:browser", or use esbuild-wasm.',
    };
  }

  // 2. Missing or invalid angular.json workspace config
  if (
    log.includes('Cannot find "angular.json"') ||
    log.includes('Invalid workspace configuration') ||
    lower.includes('angular.json was not found') ||
    lower.includes('schema validation failed with the following errors')
  ) {
    return {
      isAngularIssue: true,
      category: 'workspace_config_missing',
      title: 'Missing or Invalid Angular Workspace Configuration',
      message:
        'Angular CLI commands (ng serve, ng build) require an angular.json workspace file in the project root.',
      recoveryAction:
        'Ensure angular.json is present and defines a project matching your application name with architect targets.',
    };
  }

  // 3. Missing bootstrap main entry
  if (
    log.includes('Could not resolve "src/main.ts"') ||
    log.includes('Missing bootstrap entry') ||
    lower.includes('cannot find entry file src/main.ts')
  ) {
    return {
      isAngularIssue: true,
      category: 'missing_main_entry',
      title: 'Missing Main Bootstrap Entry',
      message:
        'Angular application requires src/main.ts to bootstrap the root standalone component using bootstrapApplication().',
      recoveryAction:
        'Create src/main.ts importing bootstrapApplication and your root AppComponent.',
    };
  }

  // 4. Zone.js polyfill failure
  if (
    lower.includes('zone.js') &&
    (lower.includes('unhandled promise rejection') || lower.includes('zone is not defined'))
  ) {
    return {
      isAngularIssue: true,
      category: 'zone_js_failure',
      title: 'Zone.js Initialization Failure',
      message:
        'Angular change detection requires zone.js polyfill unless configured as a zoneless application.',
      recoveryAction:
        'Ensure zone.js is imported in src/main.ts or provideExperimentalZonelessChangeDetection() is enabled in app.config.ts.',
    };
  }

  // 5. Port conflict (EADDRINUSE on 4200)
  if (
    log.includes('EADDRINUSE') ||
    log.includes('port 4200 is in use') ||
    log.includes('Port 4200 is already in use') ||
    lower.includes('address already in use :::4200')
  ) {
    return {
      isAngularIssue: true,
      category: 'port_conflict',
      title: 'Port 4200 Already in Use',
      message: 'Another Angular development server process is currently listening on port 4200.',
      recoveryAction:
        'Stop the active dev server session, or run Angular CLI with the --port flag.',
      suggestedCommand: 'ng serve --port 4201',
    };
  }

  return null;
}
