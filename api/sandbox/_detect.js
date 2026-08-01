/**
 * Sandbox provisioning detection — pure helpers, no E2B and no I/O.
 *
 * Kept free of side effects so the interesting decisions (which package manager,
 * which install commands, what to run) are unit-testable without a sandbox or an
 * API key.
 *
 * This deliberately duplicates the junk-directory list from the client's import
 * engine rather than sharing it: the client is TypeScript bundled by Vite, this
 * runs as a CommonJS serverless function, and there is no shared build step
 * between them. The lists must be kept in step by hand.
 */

'use strict';

/**
 * Directories never uploaded to a sandbox. `npm install` regenerates
 * node_modules, and dist/build are derived output — copying them would waste the
 * upload and can shadow a fresh install.
 */
const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.cache',
  'coverage',
  '.turbo',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  '__MACOSX',
];

const EXCLUDED_PATTERN = new RegExp(
  `(^|/)(${EXCLUDED_DIRECTORIES.map((name) => name.replace('.', '\\.')).join('|')})(/|$)`,
  'i',
);

/** True when a path must not be written into the sandbox. */
function isExcludedPath(path) {
  return EXCLUDED_PATTERN.test(String(path || ''));
}

/** Drops excluded entries from a file list. */
function filterUploadableFiles(files) {
  if (!Array.isArray(files)) return [];
  return files.filter(
    (file) =>
      file &&
      typeof file.path === 'string' &&
      typeof file.content === 'string' &&
      !isExcludedPath(file.path),
  );
}

/** Parses package.json without throwing on malformed input. */
function parsePackageJson(files) {
  const entry = files.find((file) => /(^|\/)package\.json$/i.test(file.path));
  if (!entry) return null;
  try {
    const parsed = JSON.parse(entry.content);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

const hasFile = (files, pattern) => files.some((file) => pattern.test(file.path));

/**
 * Picks the package manager from the lockfile that is present.
 *
 * Lockfile beats any `packageManager` field, because the lockfile is what the
 * install has to be reproducible against. npm is the default when there is no
 * lockfile at all.
 */
function detectPackageManager(files) {
  if (hasFile(files, /(^|\/)pnpm-lock\.ya?ml$/i)) return 'pnpm';
  if (hasFile(files, /(^|\/)yarn\.lock$/i)) return 'yarn';
  if (hasFile(files, /(^|\/)package-lock\.json$/i)) return 'npm';
  if (hasFile(files, /(^|\/)bun\.lockb?$/i)) return 'bun';
  return 'npm';
}

/** Node install command for a package manager. */
function nodeInstallCommand(packageManager) {
  switch (packageManager) {
    case 'pnpm':
      return 'npx --yes pnpm install';
    case 'yarn':
      return 'npx --yes yarn install';
    case 'bun':
      return 'npm install';
    default:
      return 'npm install';
  }
}

/**
 * Detects Python tooling. Poetry wins over pip when pyproject declares it,
 * since a poetry project's dependencies are not in requirements.txt.
 */
function detectPythonTooling(files) {
  const pyproject = files.find((file) => /(^|\/)pyproject\.toml$/i.test(file.path));
  if (pyproject && /\[tool\.poetry\]/i.test(pyproject.content)) return 'poetry';
  if (hasFile(files, /(^|\/)requirements\.txt$/i)) return 'pip';
  if (hasFile(files, /(^|\/)Pipfile$/i)) return 'pipenv';
  if (pyproject) return 'pip';
  return null;
}

function pythonInstallCommand(tooling) {
  switch (tooling) {
    case 'poetry':
      return 'pip install poetry && poetry install --no-interaction';
    case 'pipenv':
      return 'pip install pipenv && pipenv install --deploy';
    case 'pip':
      return 'pip install -r requirements.txt';
    default:
      return null;
  }
}

/**
 * Install steps for the detected stack.
 *
 * A mixed stack returns both, in order: Node first because a Python service that
 * serves a built frontend needs the frontend's dependencies present.
 */
function buildInstallPlan(files) {
  const uploadable = filterUploadableFiles(files);
  const pkg = parsePackageJson(uploadable);
  const steps = [];

  if (pkg) {
    const packageManager = detectPackageManager(uploadable);
    steps.push({
      id: 'node-install',
      label: `Install Node dependencies (${packageManager})`,
      command: nodeInstallCommand(packageManager),
    });
  }

  const pythonTooling = detectPythonTooling(uploadable);
  if (pythonTooling) {
    steps.push({
      id: 'python-install',
      label: `Install Python dependencies (${pythonTooling})`,
      command: pythonInstallCommand(pythonTooling),
    });
  }

  return {
    steps,
    packageManager: pkg ? detectPackageManager(uploadable) : null,
    pythonTooling,
    isMixedStack: Boolean(pkg && pythonTooling),
  };
}

/** Default port a framework's dev server listens on, for preview URLs. */
const PORT_HINTS = [
  { pattern: /\bvite\b/i, port: 5173 },
  { pattern: /\bnext\b/i, port: 3000 },
  { pattern: /react-scripts/i, port: 3000 },
  { pattern: /\bnuxt\b/i, port: 3000 },
  { pattern: /\bastro\b/i, port: 4321 },
  { pattern: /\bsvelte-kit|vite-node\b/i, port: 5173 },
  { pattern: /\bng serve\b/i, port: 4200 },
  { pattern: /\bnodemon|node\b/i, port: 3000 },
];

function inferPort(command, fallback) {
  const explicit = /(?:--port[= ]|-p[= ]|:)(\d{2,5})\b/.exec(command || '');
  if (explicit) return Number(explicit[1]);
  for (const hint of PORT_HINTS) {
    if (hint.pattern.test(command || '')) return hint.port;
  }
  return fallback;
}

/** Script names worth offering, most-likely-first. */
const SCRIPT_PRIORITY = ['dev', 'start', 'serve', 'develop', 'dev:server', 'start:dev'];

const PYTHON_ENTRY_CANDIDATES = [
  {
    file: 'manage.py',
    label: 'Django development server',
    command: 'python manage.py runserver 0.0.0.0:8000',
    port: 8000,
  },
  { file: 'app.py', label: 'Run app.py', command: 'python app.py', port: 8000 },
  { file: 'main.py', label: 'Run main.py', command: 'python main.py', port: 8000 },
  { file: 'server.py', label: 'Run server.py', command: 'python server.py', port: 8000 },
  { file: 'wsgi.py', label: 'Run wsgi.py', command: 'python wsgi.py', port: 8000 },
];

/**
 * Collects every plausible start command.
 *
 * Returns candidates rather than choosing, so a project with both a frontend dev
 * server and a backend entry point is handed to the user to pick from. Guessing
 * would start the wrong half and look broken.
 */
function detectStartCandidates(files) {
  const uploadable = filterUploadableFiles(files);
  const pkg = parsePackageJson(uploadable);
  const candidates = [];

  if (pkg && pkg.scripts && typeof pkg.scripts === 'object') {
    const packageManager = detectPackageManager(uploadable);
    const runner =
      packageManager === 'pnpm'
        ? 'npx --yes pnpm run'
        : packageManager === 'yarn'
          ? 'npx --yes yarn'
          : 'npm run';

    const seen = new Set();
    const ordered = [
      ...SCRIPT_PRIORITY.filter((name) => typeof pkg.scripts[name] === 'string'),
      // Any other script that looks like it serves something.
      ...Object.keys(pkg.scripts).filter(
        (name) => !SCRIPT_PRIORITY.includes(name) && /^(dev|start|serve)/i.test(name),
      ),
    ];

    for (const name of ordered) {
      if (seen.has(name)) continue;
      seen.add(name);
      const script = pkg.scripts[name];
      candidates.push({
        id: `script:${name}`,
        kind: 'node',
        label: `${runner} ${name}`,
        command: `${runner} ${name}`,
        script: name,
        rawScript: script,
        port: inferPort(script, 3000),
      });
    }
  }

  for (const candidate of PYTHON_ENTRY_CANDIDATES) {
    const match = uploadable.find((file) => {
      const base = file.path.split('/').pop();
      return base && base.toLowerCase() === candidate.file;
    });
    if (!match) continue;

    // Uvicorn/gunicorn need an explicit bind to be reachable from outside.
    const usesUvicorn = /uvicorn/i.test(match.content) || hasRequirement(uploadable, 'uvicorn');
    const command =
      candidate.file === 'main.py' && usesUvicorn
        ? 'python -m uvicorn main:app --host 0.0.0.0 --port 8000'
        : candidate.command;

    candidates.push({
      id: `python:${match.path}`,
      kind: 'python',
      label: usesUvicorn && candidate.file === 'main.py' ? 'Uvicorn (FastAPI)' : candidate.label,
      command,
      path: match.path,
      port: candidate.port,
    });
  }

  return candidates;
}

/** True when a requirements file mentions a package. */
function hasRequirement(files, name) {
  const requirements = files.find((file) => /(^|\/)requirements\.txt$/i.test(file.path));
  if (!requirements) return false;
  return new RegExp(`^\\s*${name}\\b`, 'im').test(requirements.content);
}

/**
 * Ports worth probing for a preview URL once something is running.
 *
 * Union of the candidates' ports plus the common dev-server ports, because a
 * script may bind a port that is only decided at runtime.
 */
function candidatePorts(candidates) {
  const ports = new Set();
  for (const candidate of candidates || []) {
    if (candidate && Number.isFinite(candidate.port)) ports.add(candidate.port);
  }
  for (const common of [3000, 5173, 8000, 8080, 4200, 4321, 5000]) ports.add(common);
  return [...ports];
}

/** Human label for a port, so the port selector is not just numbers. */
function labelForPort(port, candidates) {
  const owner = (candidates || []).find((candidate) => candidate.port === port);
  if (owner) return `${owner.label} (:${port})`;
  if (port === 5173) return `Vite dev server (:${port})`;
  if (port === 3000) return `Node server (:${port})`;
  if (port === 8000) return `Python server (:${port})`;
  return `Port ${port}`;
}

module.exports = {
  EXCLUDED_DIRECTORIES,
  isExcludedPath,
  filterUploadableFiles,
  parsePackageJson,
  detectPackageManager,
  nodeInstallCommand,
  detectPythonTooling,
  pythonInstallCommand,
  buildInstallPlan,
  detectStartCandidates,
  candidatePorts,
  labelForPort,
  inferPort,
};
