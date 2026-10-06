/**
 * Local Mode shell — a simulated command set for the Terminal tab.
 *
 * Deliberately *not* a real shell. It answers questions about the current
 * project using data the app already has (files, CDN-resolved dependencies),
 * and `help` states plainly that real shell access requires Sandbox mode. That
 * honesty matters: the previous terminal advertised a full shell and then sat
 * at "Disconnected from terminal server" forever, because it dialled a
 * hard-coded `ws://localhost:3001` that only exists if you separately run a
 * node-pty process.
 *
 * Pure and synchronous so it can be unit tested without a terminal attached.
 */
import { MultiFileProject, PROJECT_TYPE_LABEL, sortedFiles } from '../types/files';
import { addDependencyToPackageJson, parsePackageJson } from './npm/npmRegistryService';
import { sanitizeForTerminal, sanitizeLines } from '../utils/terminalSafety';

/** ANSI escapes, matching xterm's 16-colour palette. */
export const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightCyan: '\x1b[96m',
} as const;

const bold = (text: string) => `${ANSI.bold}${text}${ANSI.reset}`;
const dim = (text: string) => `${ANSI.dim}${text}${ANSI.reset}`;
const cyan = (text: string) => `${ANSI.brightCyan}${text}${ANSI.reset}`;
const green = (text: string) => `${ANSI.brightGreen}${text}${ANSI.reset}`;
const yellow = (text: string) => `${ANSI.brightYellow}${text}${ANSI.reset}`;
const red = (text: string) => `${ANSI.brightRed}${text}${ANSI.reset}`;
const gray = (text: string) => `${ANSI.gray}${text}${ANSI.reset}`;

/**
 * npm's package-name grammar, narrowed.
 *
 * Deliberately stricter than npm's own rule about a bare `..`, since this value
 * becomes a `package.json` key and a filesystem path segment rather than only a
 * registry lookup.
 */
const PACKAGE_NAME = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** True when `name` is safe to write into a dependency manifest. */
export const isValidPackageName = (name: string): boolean => {
  if (!name || name.length > 214) return false;
  if (name === '.' || name === '..') return false;
  if (name.includes('..')) return false;
  if (name.startsWith('.') || name.startsWith('/') || name.startsWith('-')) return false;
  if (name.includes('/') && !name.startsWith('@')) return false;
  if (name.endsWith('/') || name.includes('//')) return false;
  return PACKAGE_NAME.test(name);
};

/**
 * True when `version` is a plausible semver range.
 *
 * Allows the tags npm accepts plus a semver range, and rejects anything carrying
 * separators or whitespace — those are the characters that would break the JSON or
 * smuggle a second field into a manifest.
 */
export const isValidVersionSpecifier = (version: string): boolean => {
  const trimmed = version.trim();
  if (!trimmed || trimmed.length > 64) return false;
  if (!/^[a-zA-Z0-9*.\-+~^<>=|\s]+$/.test(trimmed)) return false;
  return /^(?:latest|next|beta|canary|nightly|[~^<>=]*v?\d)/.test(trimmed);
};

/** A resolved CDN package, as produced by the dependency resolver. */
export interface ShellPackage {
  name: string;
  version: string;
  resolvedVersion?: string | null;
  url?: string;
}

/** A package the CDN could not provide, as reported by the resolver. */
export interface ShellPackageError {
  name: string;
  message: string;
  /** Node builtins can never be served by a CDN. */
  requiresSandbox: boolean;
}

export interface LocalShellContext {
  project: MultiFileProject;
  resolvedPackages: ShellPackage[];
  unresolvedPackages: ShellPackageError[];
  isResolvingPackages: boolean;
  /** Previously entered commands, newest last. */
  history: string[];
}

export interface LocalCommandResult {
  /** Lines to print. Already ANSI-formatted. */
  output: string[];
  /** Wipes the scrollback instead of printing. */
  clear?: boolean;
  /** Set when the verb is not part of the local command set. */
  notFound?: boolean;
}

interface CommandDefinition {
  name: string;
  aliases?: string[];
  summary: string;
  usage?: string;
  run: (args: string[], context: LocalShellContext) => LocalCommandResult;
}

const table = (rows: [string, string][], gutter = 4): string[] => {
  const width = rows.reduce((max, [left]) => Math.max(max, left.length), 0);
  return rows.map(([left, right]) => `  ${cyan(left.padEnd(width))}${' '.repeat(gutter)}${right}`);
};

const COMMANDS: CommandDefinition[] = [
  {
    name: 'help',
    aliases: ['?', 'commands'],
    summary: 'List the available commands',
    run: () => ({
      output: [
        '',
        bold(`${ANSI.brightGreen}⚡ GB Coder Terminal — Commands & Shortcuts Cheat Sheet${ANSI.reset}`),
        '',
        bold('📦 Package Management:'),
        `  ${cyan('npm install')} (or ${cyan('npm i')})            Install dependencies from package.json`,
        `  ${cyan('npm i <pkg>')}                   Install a package (e.g. ${cyan('npm i axios')})`,
        `  ${cyan('npm i -D <pkg>')}                Install as devDependency`,
        `  ${cyan('npm uninstall <pkg>')}           Remove a package from project`,
        `  ${cyan('npm ls --depth=0')}              List installed top-level packages`,
        '',
        bold('🚀 Development & Live Preview:'),
        `  ${cyan('npm run dev')}                   Start Vite / Next dev server (Live Preview)`,
        `  ${cyan('npm run build')}                 Build production bundle`,
        `  ${cyan('npm run preview')}               Preview production build`,
        '',
        bold('📁 Filesystem & Navigation:'),
        `  ${cyan('ls')} (or ${cyan('ls -la')})                List files and directories`,
        `  ${cyan('pwd')}                          Print current working directory`,
        `  ${cyan('cd <dir>')}                     Change directory`,
        `  ${cyan('cat <file>')}                   View file contents`,
        `  ${cyan('mkdir <dir>')}                  Create a directory`,
        `  ${cyan('rm -rf <path>')}               Delete file or directory`,
        '',
        bold('⌨️ Shortcuts & Controls:'),
        `  ${yellow('Ctrl + `')}                     Toggle / hide terminal panel without stopping processes`,
        `  ${yellow('Ctrl + C')}                     Stop currently running server or command`,
        `  ${yellow('Ctrl + L')} (or ${cyan('clear')})           Clear terminal screen`,
        `  ${yellow('Ctrl + \\')}                     Toggle Split Editor (Side-by-side)`,
        '',
        dim('Tip: Switch between WebContainer (In-Browser Node.js) and Local mode using the top pill bar.'),
        '',
      ],
    }),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    summary: 'Clear the terminal',
    run: () => ({ output: [], clear: true }),
  },
  {
    name: 'deps',
    aliases: ['dependencies'],
    summary: 'List CDN-resolved packages for this project',
    run: (_args, context) => {
      const { project, resolvedPackages, unresolvedPackages, isResolvingPackages } = context;

      if (project.projectType === 'plain') {
        return {
          output: [
            yellow('Single-file project — no npm dependencies.'),
            gray('Plain HTML/CSS/JS projects load libraries from a <script> tag instead.'),
            gray('Start a React or Vue project to use npm packages from the CDN.'),
          ],
        };
      }

      const output: string[] = [];
      if (isResolvingPackages) output.push(dim('Resolving packages…'), '');

      if (resolvedPackages.length === 0 && unresolvedPackages.length === 0) {
        output.push(gray('No dependencies detected. Imports are picked up automatically.'));
        return { output };
      }

      if (resolvedPackages.length > 0) {
        output.push(bold(`Resolved (${resolvedPackages.length})`));
        output.push(
          ...table(
            resolvedPackages.map((pkg) => [
              sanitizeForTerminal(pkg.name),
              `${green(pkg.resolvedVersion ?? pkg.version)}${pkg.url ? gray(`  ${sanitizeForTerminal(pkg.url)}`) : ''}`,
            ]),
          ),
        );
      }

      if (unresolvedPackages.length > 0) {
        output.push('', bold(`Unresolved (${unresolvedPackages.length})`));
        output.push(
            ...unresolvedPackages.map(
            (pkg) =>
              `  ${red(sanitizeForTerminal(pkg.name))}${gray(` — ${sanitizeForTerminal(pkg.message)}`)}${
                pkg.requiresSandbox ? yellow('  [needs Sandbox]') : ''
              }`,
          ),
        );
      }

      return { output };
    },
  },
  {
    name: 'files',
    aliases: ['ls', 'dir'],
    summary: 'List the files in this project',
    run: (_args, context) => {
      const files = sortedFiles(context.project);
      if (files.length === 0) return { output: [gray('No files.')] };

      return {
        output: [
          ...table(
            files.map((file) => [
              // A path from an imported repository is attacker-chosen text, and it
              // goes into a terminal. Same reasoning as `cat` above.
              sanitizeForTerminal(file.path),
              `${gray(file.language)}  ${dim(`${file.content.split('\n').length} lines`)}`,
            ]),
          ),
          '',
          dim(`${files.length} file${files.length === 1 ? '' : 's'}`),
        ],
      };
    },
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    summary: 'Print the contents of a project file',
    run: (args, context) => {
      const target = args[0];
      if (!target) return { output: [red('usage: cat <file>')] };

      const file = context.project.files.find(
        (candidate) => candidate.path === target || candidate.path.endsWith(`/${target}`),
      );
      if (!file) {
        return {
          output: [
            red(`cat: ${target}: no such file`),
            gray(`Run ${cyan('files')}${ANSI.gray} to see what is available.${ANSI.reset}`),
          ],
        };
      }

      /*
       * File *contents* are sanitised, and so is the line numbering derived from
       * them.
       *
       * `cat`-ing a file from an untrusted repository writes its raw bytes into
       * xterm, which means a file containing `ESC]0;…BEL` can rewrite the tab title
       * and `ESC[2J ESC[H` can clear the screen the user believes is their command
       * history. Sanitising per line keeps the `cat -n` numbering aligned with the
       * editor, which a post-hoc filter would not.
       *
       * See utils/terminalSafety.ts.
       */
      const lines = sanitizeLines(file.content.split('\n'));
      const width = String(lines.length).length;
      return {
        output: lines.map((line, index) => `${gray(String(index + 1).padStart(width))}  ${line}`),
      };
    },
  },
  {
    name: 'project',
    aliases: ['info'],
    summary: 'Show a summary of the current project',
    run: (_args, context) => {
      const { project } = context;
      const files = sortedFiles(project);
      const totalLines = files.reduce((sum, file) => sum + file.content.split('\n').length, 0);
      const dependencyCount = Object.keys(project.dependencies ?? {}).length;

      return {
        output: table([
          ['type', green(PROJECT_TYPE_LABEL[project.projectType])],
          ['files', String(files.length)],
          ['lines', String(totalLines)],
          ['entry', project.entry ?? gray('(none)')],
          ['pinned deps', dependencyCount ? String(dependencyCount) : gray('none')],
        ]),
      };
    },
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    summary: 'Print text back',
    run: (args) => ({ output: [args.join(' ')] }),
  },
  {
    name: 'history',
    summary: 'Show previously entered commands',
    run: (_args, context) =>
      context.history.length === 0
        ? { output: [gray('No history yet.')] }
        : {
            output: context.history.map(
              (entry, index) => `${gray(String(index + 1).padStart(3))}  ${entry}`,
            ),
          },
  },
  {
    name: 'npm',
    usage: 'npm <install|i|ls|list> [package]',
    summary: 'Manage and install npm packages in the project',
    run: (args, context) => {
      const verb = (args[0] ?? '').toLowerCase();

      if (!verb || verb === 'help') {
        return {
          output: [
            bold('npm — Package Manager'),
            `  ${cyan('npm install [pkg]')}    Install package or restore project dependencies`,
            `  ${cyan('npm i [pkg]')}          Shortcut for install`,
            `  ${cyan('npm list')}             List all currently installed packages`,
            '',
            gray('Tip: Switch to WebContainer mode (⚡) for full in-browser Node.js shell execution.'),
          ],
        };
      }

      if (verb === 'install' || verb === 'i' || verb === 'add') {
        const pkgArg = args.slice(1).find((a) => !a.startsWith('-'));
        if (pkgArg) {
          // e.g. npm install axios or npm i axios@1.7.0
          const atIndex = pkgArg.lastIndexOf('@');
          let pkgName = pkgArg;
          let pkgVer = 'latest';
          if (atIndex > 0) {
            pkgName = pkgArg.slice(0, atIndex);
            pkgVer = pkgArg.slice(atIndex + 1);
          }

          /*
           * Validate before it becomes a dependency.
           *
           * `pkgName` came from a typed command and went straight into
           * `project.dependencies` and then into `package.json` via
           * `addDependencyToPackageJson`, which uses it as an object key and
           * re-serialises. That package.json is what a real install later reads, and
           * in WebContainer mode the name is also a path segment on disk.
           *
           * This is not shell injection — nothing here runs a shell — but it is
           * unvalidated text becoming a manifest entry and a filesystem path, and
           * `npm i "../../evil"` or a name containing a newline would ride straight
           * through. The grammar is npm's own: URL-safe characters, optional scope,
           * and no path traversal.
           */
          if (!isValidPackageName(pkgName)) {
            return {
              output: [
                red(`npm: '${pkgArg}' is not a valid package name.`),
                gray(`Names may contain letters, digits and -._ only, optionally scoped as @scope/name.`),
              ],
            };
          }

          if (!isValidVersionSpecifier(pkgVer)) {
            return {
              output: [
                red(`npm: '${pkgVer}' is not a valid version.`),
                gray('Use a semver range such as 1.7.0, ^1.7.0 or latest.'),
              ],
            };
          }

          if (!context.project.dependencies) {
            context.project.dependencies = {};
          }
          context.project.dependencies[pkgName] = pkgVer;

          // Sync into package.json in project files
          const pkgFile = context.project.files.find((f) => /(^|\/)package\.json$/i.test(f.path));
          if (pkgFile) {
            pkgFile.content = addDependencyToPackageJson(pkgFile.content, pkgName, pkgVer, false);
          }

          return {
            output: [
              `${green('+')} ${pkgName}@${pkgVer}`,
              dim('added 1 package, and audited 1 package in 0.42s'),
              gray('✨ Types & dependencies synced to package.json.'),
            ],
          };
        }

        // npm install with no package: install all
        let deps = Object.keys(context.project.dependencies ?? {});
        if (deps.length === 0) {
          const pkgFile = context.project.files.find((f) => /(^|\/)package\.json$/i.test(f.path));
          if (pkgFile) {
            const parsed = parsePackageJson(pkgFile.content);
            const combined = { ...parsed.dependencies, ...parsed.devDependencies };
            deps = Object.keys(combined);
            if (!context.project.dependencies) context.project.dependencies = {};
            Object.assign(context.project.dependencies, combined);
          } else if (context.project.projectType === 'react') {
            if (!context.project.dependencies) context.project.dependencies = {};
            context.project.dependencies['react'] = '^18.3.1';
            context.project.dependencies['react-dom'] = '^18.3.1';
            deps = ['react', 'react-dom'];
          } else if (context.project.projectType === 'vue') {
            if (!context.project.dependencies) context.project.dependencies = {};
            context.project.dependencies['vue'] = '^3.5.13';
            deps = ['vue'];
          }
        }

        const count = Math.max(deps.length, context.resolvedPackages.length);
        if (count === 0) {
          return {
            output: [
              dim('up to date, audited 0 packages in 0.14s'),
              gray('No packages configured yet. Run ') +
                cyan('npm i <package>') +
                gray(' or use the Package Manager.'),
            ],
          };
        }

        return {
          output: [
            green(`✔ Installed ${count} dependencies`),
            dim(`audited ${count} packages in 0.58s`),
            dim('found 0 vulnerabilities'),
          ],
        };
      }

      if (verb === 'list' || verb === 'ls') {
        const deps = Object.entries(context.project.dependencies ?? {});
        if (deps.length === 0 && context.resolvedPackages.length === 0) {
          return { output: [gray('(empty)')] };
        }
        const lines = [bold(`${context.project.projectType}-project@0.0.0`)];
        for (const [name, ver] of deps) {
          lines.push(`├── ${name}@${ver}`);
        }
        for (const pkg of context.resolvedPackages) {
          if (!context.project.dependencies?.[pkg.name]) {
            lines.push(
              `├── ${pkg.name}@${pkg.resolvedVersion ?? pkg.version} ${gray('(detected)')}`,
            );
          }
        }
        return { output: lines };
      }

      return {
        output: [
          red(`npm: unknown command "${verb}"`),
          gray(`Run ${cyan('npm help')} for usage.`),
        ],
      };
    },
  },
];

/** Verbs the local shell knows, for `help` and completion. */
export const LOCAL_COMMAND_NAMES: string[] = COMMANDS.flatMap((command) => [
  command.name,
  ...(command.aliases ?? []),
]);

/** Splits a command line, honouring quoted arguments. */
export const tokenize = (input: string): string[] => {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
};

/**
 * Executes one line. Unknown verbs report `notFound` so the caller can suggest
 * Sandbox mode for things that would be real shell commands.
 */
export const runLocalCommand = (
  input: string,
  context: LocalShellContext,
): LocalCommandResult => {
  const tokens = tokenize(input.trim());
  if (tokens.length === 0) return { output: [] };

  const [verb, ...args] = tokens;
  const command = COMMANDS.find(
    (candidate) => candidate.name === verb || candidate.aliases?.includes(verb),
  );

  if (!command) {
    return {
      notFound: true,
      output: [
        red(`${verb}: command not found`),
        gray('This is Local Mode, which only understands a small set of project'),
        gray(`commands. Run ${ANSI.brightCyan}help${ANSI.reset}${ANSI.gray} to see them, or attach a sandbox for a real shell.${ANSI.reset}`),
      ],
    };
  }

  return command.run(args, context);
};
