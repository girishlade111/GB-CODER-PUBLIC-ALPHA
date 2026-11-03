import type { ProjectFile } from '../../types/files';
import {
  detectFramework,
  type FrameworkDetectionResult,
  type ManifestEntry,
} from '../import/projectDetection';

export type PackageManagerType = 'npm' | 'pnpm' | 'yarn';
export type PackageManagerSource = 'packageManager-field' | 'lockfile' | 'default';
export type RuntimeAvailability = 'native' | 'experimental' | 'fallback_required' | 'unavailable';
export type CompatibilityStatus =
  | 'fully_supported'
  | 'partially_supported'
  | 'conflict_detected'
  | 'unsupported_version';

export interface ProjectCommandInfo {
  packageManager: PackageManagerType;
  packageManagerSource: PackageManagerSource;
  packageManagerVersion?: string | null;
  runtimeAvailability: RuntimeAvailability;
  compatibilityStatus: CompatibilityStatus;
  runtimeWarning?: string | null;
  hasManifest: boolean;
  packageJson: Record<string, unknown> | null;
  scripts: Record<string, string>;
  devCommand: string | null;
  buildCommand: string | null;
  installCommand: string;
  isStaticProject: boolean;
  hasLockfile: boolean;
  detectedLockfile: string | null;
  hasConflictingLockfiles: boolean;
  conflicts: string[];
  lockfiles: string[];
  scriptCommand: (scriptName: string) => string;
  supportedActions: Array<'install' | 'dev' | 'build' | 'test'>;
  frameworkInfo?: FrameworkDetectionResult;
}

/**
 * Analyzes project files to determine package manager, available scripts,
 * and appropriate dev/build/install commands without assuming npm or dev script defaults.
 */
export function detectProjectCommands(files: ProjectFile[]): ProjectCommandInfo {
  const filePaths = files.map((f) => (f.path || '').replace(/^\/+/, '').toLowerCase());

  // 1. Detect lockfiles
  const lockfiles: string[] = [];
  if (filePaths.includes('pnpm-lock.yaml') || filePaths.includes('pnpm-lock.yml')) {
    lockfiles.push('pnpm-lock.yaml');
  }
  if (filePaths.includes('yarn.lock')) {
    lockfiles.push('yarn.lock');
  }
  if (filePaths.includes('package-lock.json') || filePaths.includes('npm-shrinkwrap.json')) {
    lockfiles.push('package-lock.json');
  }

  const hasConflictingLockfiles = lockfiles.length > 1;
  const conflicts: string[] = [];
  if (hasConflictingLockfiles) {
    conflicts.push(`Multiple conflicting lockfiles detected: ${lockfiles.join(', ')}`);
  }

  let packageManager: PackageManagerType = 'npm';
  let packageManagerSource: PackageManagerSource = 'default';
  let packageManagerVersion: string | null = null;
  let detectedLockfile: string | null = null;

  // Determine lockfile preference
  if (lockfiles.includes('pnpm-lock.yaml')) {
    packageManager = 'pnpm';
    packageManagerSource = 'lockfile';
    detectedLockfile = 'pnpm-lock.yaml';
  } else if (lockfiles.includes('yarn.lock')) {
    packageManager = 'yarn';
    packageManagerSource = 'lockfile';
    detectedLockfile = 'yarn.lock';
  } else if (lockfiles.includes('package-lock.json')) {
    packageManager = 'npm';
    packageManagerSource = 'lockfile';
    detectedLockfile = 'package-lock.json';
  }

  // 2. Parse package.json
  const manifestFile = files.find((f) => (f.path || '').replace(/^\/+/, '').toLowerCase() === 'package.json');
  let packageJson: Record<string, unknown> | null = null;
  const scripts: Record<string, string> = {};

  if (manifestFile?.content) {
    try {
      packageJson = JSON.parse(manifestFile.content);
      if (packageJson && typeof packageJson === 'object') {
        if ('scripts' in packageJson) {
          const rawScripts = packageJson.scripts as Record<string, unknown>;
          for (const [key, value] of Object.entries(rawScripts || {})) {
            if (typeof value === 'string') {
              scripts[key] = value;
            }
          }
        }

        // Check packageManager field (e.g. "pnpm@8.6.0", "yarn@1.22.19", "npm@10.2.0")
        if (typeof packageJson.packageManager === 'string') {
          const match = packageJson.packageManager.trim().match(/^(npm|pnpm|yarn)(?:@(.*))?$/i);
          if (match) {
            packageManager = match[1].toLowerCase() as PackageManagerType;
            packageManagerSource = 'packageManager-field';
            packageManagerVersion = match[2] || null;

            // Check for conflict between packageManager field and existing lockfiles
            if (packageManager === 'pnpm' && lockfiles.includes('package-lock.json')) {
              conflicts.push('packageManager field specifies pnpm, but project contains package-lock.json');
            } else if (packageManager === 'pnpm' && lockfiles.includes('yarn.lock')) {
              conflicts.push('packageManager field specifies pnpm, but project contains yarn.lock');
            } else if (packageManager === 'yarn' && lockfiles.includes('pnpm-lock.yaml')) {
              conflicts.push('packageManager field specifies yarn, but project contains pnpm-lock.yaml');
            } else if (packageManager === 'yarn' && lockfiles.includes('package-lock.json')) {
              conflicts.push('packageManager field specifies yarn, but project contains package-lock.json');
            } else if (packageManager === 'npm' && lockfiles.includes('pnpm-lock.yaml')) {
              conflicts.push('packageManager field specifies npm, but project contains pnpm-lock.yaml');
            } else if (packageManager === 'npm' && lockfiles.includes('yarn.lock')) {
              conflicts.push('packageManager field specifies npm, but project contains yarn.lock');
            }
          }
        }
      }
    } catch {
      // Invalid JSON — safe fallback
    }
  }

  const hasManifest = manifestFile !== undefined;
  const isStaticProject = !hasManifest && files.some((f) => /\.(html|css|js)$/i.test(f.path));

  // Determine runtime availability and compatibility
  let runtimeAvailability: RuntimeAvailability = 'native';
  let compatibilityStatus: CompatibilityStatus = conflicts.length > 0 ? 'conflict_detected' : 'fully_supported';
  let runtimeWarning: string | null = null;

  if (packageManager === 'yarn') {
    const isYarnBerry = Boolean(packageManagerVersion && /^[2-9]/.test(packageManagerVersion));
    if (isYarnBerry) {
      runtimeAvailability = 'fallback_required';
      compatibilityStatus = 'unsupported_version';
      runtimeWarning =
        'Yarn Berry (v2+) detected. WebContainers require the node-modules linker; Plug\'n\'Play (PnP) virtual file systems are not supported natively without a .yarnrc.yml configuration.';
    } else {
      runtimeAvailability = 'native';
      if (conflicts.length > 0) {
        compatibilityStatus = 'conflict_detected';
        runtimeWarning = conflicts.join('; ');
      }
    }
  } else if (packageManager === 'pnpm') {
    runtimeAvailability = 'experimental';
    compatibilityStatus = conflicts.length > 0 ? 'conflict_detected' : 'partially_supported';
    runtimeWarning =
      'pnpm project detected. Running pnpm in WebContainers requires @pnpm/wasm, Node.js >= 22.13, and shared WebAssembly memory. npm may be used as a non-destructive fallback without altering pnpm-lock.yaml.';
  } else {
    // npm
    runtimeAvailability = 'native';
    if (conflicts.length > 0) {
      compatibilityStatus = 'conflict_detected';
      runtimeWarning = conflicts.join('; ');
    }
  }

  // 3. Resolve dev command
  let devCommand: string | null = null;
  if (scripts['dev']) {
    devCommand = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  } else if (scripts['start']) {
    devCommand = packageManager === 'npm' ? 'npm start' : `${packageManager} start`;
  } else if (scripts['serve']) {
    devCommand = packageManager === 'npm' ? 'npm run serve' : `${packageManager} serve`;
  } else if (scripts['preview']) {
    devCommand = packageManager === 'npm' ? 'npm run preview' : `${packageManager} preview`;
  }

  // 4. Resolve build command
  let buildCommand: string | null = null;
  if (scripts['build']) {
    buildCommand = packageManager === 'npm' ? 'npm run build' : `${packageManager} build`;
  }

  // 5. Resolve install command
  let installCommand = 'npm install --prefer-offline';
  if (packageManager === 'pnpm') {
    installCommand = 'pnpm install';
  } else if (packageManager === 'yarn') {
    installCommand = 'yarn install';
  }

  // 6. Detect Framework Metadata
  const manifestEntries: ManifestEntry[] = files.map((f) => ({
    path: (f.path || '').replace(/^\/+/, ''),
    content: f.content,
  }));
  const frameworkInfo = detectFramework(manifestEntries);

  if (frameworkInfo.conflicts.length > 0) {
    for (const conflict of frameworkInfo.conflicts) {
      if (!conflicts.includes(conflict)) {
        conflicts.push(conflict);
      }
    }
  }

  if (frameworkInfo.runtimeSupport === 'not_implemented') {
    const plannedWarning = `Framework runtime for ${frameworkInfo.displayName} is planned for a future milestone (${frameworkInfo.runtimeSupport}).`;
    runtimeWarning = runtimeWarning ? `${runtimeWarning}; ${plannedWarning}` : plannedWarning;
  }

  if (frameworkInfo.primaryFramework === 'nextjs') {
    const devScript = scripts['dev'] || '';
    if (devScript.includes('--turbo')) {
      const turboWarning =
        'Next.js Turbopack (--turbo) is not supported in WebContainers. Use standard "next dev" with Webpack and @next/swc-wasm-nodejs.';
      if (!conflicts.includes(turboWarning)) {
        conflicts.push(turboWarning);
      }
      runtimeWarning = runtimeWarning ? `${runtimeWarning}; ${turboWarning}` : turboWarning;
    }
  } else if (frameworkInfo.primaryFramework === 'astro') {
    // Astro dev server uses Vite and default port 4321
    if (!devCommand && scripts['start']) {
      devCommand = packageManager === 'npm' ? 'npm start' : `${packageManager} start`;
    }
  } else if (frameworkInfo.primaryFramework === 'angular') {
    // Angular CLI uses "npm start" (ng serve) by convention
    if (!devCommand && scripts['start']) {
      devCommand = packageManager === 'npm' ? 'npm start' : `${packageManager} start`;
    }
  }

  // 7. Helper for arbitrary script command
  const scriptCommand = (scriptName: string): string => {
    if (packageManager === 'npm') {
      return ['start', 'test', 'stop', 'restart'].includes(scriptName)
        ? `npm ${scriptName}`
        : `npm run ${scriptName}`;
    }
    return `${packageManager} ${scriptName}`;
  };

  // 8. Supported actions
  const supportedActions: Array<'install' | 'dev' | 'build' | 'test'> = ['install'];
  if (devCommand) supportedActions.push('dev');
  if (buildCommand) supportedActions.push('build');
  if (scripts['test']) supportedActions.push('test');

  return {
    packageManager,
    packageManagerSource,
    packageManagerVersion,
    runtimeAvailability,
    compatibilityStatus,
    runtimeWarning,
    hasManifest,
    packageJson,
    scripts,
    devCommand,
    buildCommand,
    installCommand,
    isStaticProject,
    hasLockfile: lockfiles.length > 0,
    detectedLockfile,
    hasConflictingLockfiles,
    conflicts,
    lockfiles,
    scriptCommand,
    supportedActions,
    frameworkInfo,
  };
}
