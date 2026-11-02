import { ProjectFile } from '../../types/files';

export type PackageManagerType = 'npm' | 'pnpm' | 'yarn';

export interface ProjectCommandInfo {
  packageManager: PackageManagerType;
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
  lockfiles: string[];
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
  let packageManager: PackageManagerType = 'npm';
  let detectedLockfile: string | null = null;

  if (lockfiles.includes('pnpm-lock.yaml')) {
    packageManager = 'pnpm';
    detectedLockfile = 'pnpm-lock.yaml';
  } else if (lockfiles.includes('yarn.lock')) {
    packageManager = 'yarn';
    detectedLockfile = 'yarn.lock';
  } else if (lockfiles.includes('package-lock.json')) {
    packageManager = 'npm';
    detectedLockfile = 'package-lock.json';
  }

  // 2. Parse package.json
  const manifestFile = files.find((f) => (f.path || '').replace(/^\/+/, '').toLowerCase() === 'package.json');
  let packageJson: Record<string, unknown> | null = null;
  const scripts: Record<string, string> = {};

  if (manifestFile?.content) {
    try {
      packageJson = JSON.parse(manifestFile.content);
      if (packageJson && typeof packageJson === 'object' && 'scripts' in packageJson) {
        const rawScripts = packageJson.scripts as Record<string, unknown>;
        for (const [key, value] of Object.entries(rawScripts || {})) {
          if (typeof value === 'string') {
            scripts[key] = value;
          }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  const hasManifest = manifestFile !== undefined;
  const isStaticProject = !hasManifest && files.some((f) => /\.(html|css|js)$/i.test(f.path));

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

  return {
    packageManager,
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
    lockfiles,
  };
}
