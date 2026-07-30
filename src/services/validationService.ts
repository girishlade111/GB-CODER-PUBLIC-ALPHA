/**
 * Code validation — real diagnostics for HTML, CSS and JS/JSX.
 *
 * Engine choice: this uses the language services Monaco already ships, which
 * are the same ones VS Code's Problems panel is built on --
 * `vscode-html-languageservice`, `vscode-css-languageservice` and the
 * TypeScript language service. They run in web workers, report exact
 * line/column ranges and real rule identifiers, and cost nothing extra in the
 * bundle because the editor is already loaded.
 *
 * On top of those, a small hand-written pass covers required-attribute and
 * accessibility rules (`img` without `alt` and friends) that the HTML language
 * service does not check.
 *
 * This replaces a set of regex heuristics that, among other problems, computed
 * line numbers by passing an *array index* to `String.prototype.substring`,
 * reported "invalid CSS property" only for three hard-coded fake names, and
 * emitted an `info` result for every single occurrence of `===`.
 */
import {
  FileLanguage,
  MultiFileProject,
  PLAIN_CSS_PATH,
  PLAIN_HTML_PATH,
  PLAIN_JS_PATH,
} from '../types/files';

export type IssueSeverity = 'error' | 'warning' | 'info';

/** Which validator produced an issue, used for grouping and the source badge. */
export type IssueSource = 'html' | 'css' | 'js';

export interface ValidationIssue {
  /** Stable within a run; used as a React key. */
  id: string;
  /** Editor key to navigate to: `html` | `css` | `javascript`, or a file path. */
  file: string;
  /** Display name, e.g. `index.html` or `src/App.jsx`. */
  fileLabel: string;
  line: number;
  column: number;
  severity: IssueSeverity;
  /** Rule identifier, VS Code style: `css(unknown-properties)`, `ts(2304)`. */
  rule: string;
  message: string;
  source: IssueSource;
}

export interface ValidationSummary {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
  infos: number;
}

export const EMPTY_SUMMARY: ValidationSummary = { issues: [], errors: 0, warnings: 0, infos: 0 };

/* ────────────────────────────────────────────────────────────────────────── */
/* Minimal structural Monaco types                                           */
/* ────────────────────────────────────────────────────────────────────────── */

interface MonacoMarker {
  severity: number;
  message: string;
  startLineNumber: number;
  startColumn: number;
  code?: string | number | { value: string | number };
  source?: string;
  owner?: string;
}

interface MonacoModel {
  uri: { toString: () => string; path?: string };
  getLanguageId: () => string;
  getValue: () => string;
  setValue: (value: string) => void;
  isDisposed?: () => boolean;
  dispose: () => void;
}

interface MonacoUri {
  parse: (value: string) => { toString: () => string };
}

export interface MonacoApi {
  editor: {
    getModels: () => MonacoModel[];
    getModel: (uri: unknown) => MonacoModel | null;
    createModel: (value: string, language?: string, uri?: unknown) => MonacoModel;
    getModelMarkers: (filter: { resource?: unknown; owner?: string }) => MonacoMarker[];
    onDidChangeMarkers?: (listener: (resources: unknown[]) => void) => { dispose: () => void };
  };
  Uri: MonacoUri;
  MarkerSeverity: { Error: number; Warning: number; Info: number; Hint: number };
  languages: {
    typescript?: {
      javascriptDefaults: TypeScriptDefaults;
      typescriptDefaults: TypeScriptDefaults;
      JsxEmit: Record<string, number>;
      ScriptTarget: Record<string, number>;
    };
    css?: { cssDefaults: { setOptions: (options: unknown) => void } };
    html?: { htmlDefaults: { setOptions: (options: unknown) => void } };
  };
}

interface TypeScriptDefaults {
  setDiagnosticsOptions: (options: unknown) => void;
  setCompilerOptions: (options: unknown) => void;
  getCompilerOptions?: () => Record<string, unknown>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Required-attribute / accessibility rules                                  */
/* ────────────────────────────────────────────────────────────────────────── */

interface ScannedTag {
  name: string;
  attributes: Map<string, string | null>;
  /** Character offset of the `<`. */
  offset: number;
}

/** Converts a character offset into a 1-based line/column pair. */
const offsetToPosition = (text: string, offset: number): { line: number; column: number } => {
  let line = 1;
  let lastBreak = -1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
      lastBreak = i;
    }
  }
  return { line, column: offset - lastBreak };
};

/**
 * Scans opening tags and their attributes, keeping byte offsets so issues get
 * real positions. Deliberately not a full parser: the HTML language service
 * already handles structure (unclosed tags, invalid nesting), so this only
 * needs enough fidelity to inspect attributes.
 */
export const scanHtmlTags = (html: string): ScannedTag[] => {
  const tags: ScannedTag[] = [];
  // Skip comments so commented-out markup is not reported.
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, (match) => ' '.repeat(match.length));
  const tagPattern = /<([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(withoutComments)) !== null) {
    const attributes = new Map<string, string | null>();
    const attrPattern = /([a-zA-Z_:@#][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrPattern.exec(match[2])) !== null) {
      const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? null;
      attributes.set(attrMatch[1].toLowerCase(), value);
    }
    tags.push({ name: match[1].toLowerCase(), attributes, offset: match.index });
  }

  return tags;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* HTML structure: unclosed tags and invalid nesting                         */
/* ────────────────────────────────────────────────────────────────────────── */

/** Elements that never have a closing tag. */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

/**
 * Elements whose end tag is optional per the HTML spec. An unclosed `<p>` or
 * `<li>` is valid markup, so reporting it would be wrong -- the previous
 * validator flagged exactly this kind of false positive.
 */
const OPTIONAL_END_TAG = new Set([
  'p', 'li', 'dt', 'dd', 'option', 'optgroup', 'thead', 'tbody', 'tfoot',
  'tr', 'td', 'th', 'rt', 'rp', 'colgroup', 'caption', 'html', 'head', 'body',
]);

/** Raw-text elements whose contents must not be scanned for tags. */
const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea', 'title']);

/**
 * Validates HTML structure with a tag stack.
 *
 * This is hand-written on purpose: `vscode-css-languageservice` covers CSS, but
 * there is no HTML *validation* service -- VS Code itself does not report
 * unclosed tags in its Problems panel. Since the requirement explicitly asks for
 * unclosed tags and invalid nesting, that pass has to exist here.
 */
export const validateHtmlStructure = (
  html: string,
  file: string,
  fileLabel: string,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Blank out comments and raw-text bodies, preserving offsets and newlines.
  const blank = (match: string) => match.replace(/[^\n]/g, ' ');
  let source = html.replace(/<!--[\s\S]*?-->/g, blank);
  for (const element of RAW_TEXT_ELEMENTS) {
    source = source.replace(
      new RegExp(`(<${element}\\b[^>]*>)([\\s\\S]*?)(</${element}\\s*>)`, 'gi'),
      (_full, open: string, body: string, close: string) => open + blank(body) + close,
    );
  }

  const stack: { name: string; offset: number }[] = [];
  const tagPattern = /<(\/)?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/)?>/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = tagPattern.exec(source)) !== null) {
    const isClosing = Boolean(match[1]);
    const name = match[2].toLowerCase();
    const isSelfClosing = Boolean(match[4]);
    const offset = match.index;
    index += 1;

    if (VOID_ELEMENTS.has(name) || isSelfClosing) continue;

    if (!isClosing) {
      stack.push({ name, offset });
      continue;
    }

    // Closing tag: find its partner, allowing optional-end-tag elements between.
    const openIndex = stack.map((entry) => entry.name).lastIndexOf(name);

    if (openIndex === -1) {
      const { line, column } = offsetToPosition(html, offset);
      issues.push({
        id: `html-stray-${file}-${index}`,
        file,
        fileLabel,
        line,
        column,
        severity: 'error',
        rule: 'html(unexpected-closing-tag)',
        message: `Unexpected closing tag </${name}> — no matching opening tag.`,
        source: 'html',
      });
      continue;
    }

    // Anything still open above the match is genuinely unclosed, unless its end
    // tag is optional.
    for (let depth = stack.length - 1; depth > openIndex; depth -= 1) {
      const orphan = stack[depth];
      if (OPTIONAL_END_TAG.has(orphan.name)) continue;
      const { line, column } = offsetToPosition(html, orphan.offset);
      issues.push({
        id: `html-nesting-${file}-${orphan.offset}`,
        file,
        fileLabel,
        line,
        column,
        severity: 'error',
        rule: 'html(invalid-nesting)',
        message: `<${orphan.name}> is not closed before </${name}>.`,
        source: 'html',
      });
    }

    stack.length = openIndex;
  }

  // Whatever is left open at the end of the document.
  for (const orphan of stack) {
    if (OPTIONAL_END_TAG.has(orphan.name)) continue;
    const { line, column } = offsetToPosition(html, orphan.offset);
    issues.push({
      id: `html-unclosed-${file}-${orphan.offset}`,
      file,
      fileLabel,
      line,
      column,
      severity: 'error',
      rule: 'html(unclosed-tag)',
      message: `Unclosed tag <${orphan.name}>.`,
      source: 'html',
    });
  }

  return issues;
};

interface AttributeRule {
  rule: string;
  severity: IssueSeverity;
  tag: string;
  message: string;
  /** Returns true when the tag violates the rule. */
  test: (tag: ScannedTag) => boolean;
}

const ATTRIBUTE_RULES: AttributeRule[] = [
  {
    rule: 'a11y(img-alt)',
    severity: 'warning',
    tag: 'img',
    message: '`<img>` is missing an `alt` attribute. Use alt="" for decorative images.',
    test: (tag) => !tag.attributes.has('alt'),
  },
  {
    rule: 'html(required-attribute)',
    severity: 'warning',
    tag: 'a',
    message: '`<a>` is missing an `href` attribute, so it is not a link.',
    test: (tag) => !tag.attributes.has('href') && !tag.attributes.has('name'),
  },
  {
    rule: 'a11y(iframe-title)',
    severity: 'warning',
    tag: 'iframe',
    message: '`<iframe>` is missing a `title` attribute describing its content.',
    test: (tag) => !tag.attributes.has('title'),
  },
  {
    rule: 'a11y(html-lang)',
    severity: 'warning',
    tag: 'html',
    message: '`<html>` is missing a `lang` attribute.',
    test: (tag) => !tag.attributes.has('lang'),
  },
  {
    rule: 'a11y(label-for)',
    severity: 'info',
    tag: 'label',
    message: '`<label>` has no `for` attribute; associate it with a form control.',
    test: (tag) => !tag.attributes.has('for'),
  },
];

/** Attribute and accessibility rules, plus duplicate `id` detection. */
export const validateHtmlAttributes = (
  html: string,
  file: string,
  fileLabel: string,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const tags = scanHtmlTags(html);
  const seenIds = new Map<string, number>();

  tags.forEach((tag, index) => {
    for (const rule of ATTRIBUTE_RULES) {
      if (rule.tag !== tag.name || !rule.test(tag)) continue;
      const { line, column } = offsetToPosition(html, tag.offset);
      issues.push({
        id: `attr-${file}-${index}-${rule.rule}`,
        file,
        fileLabel,
        line,
        column,
        severity: rule.severity,
        rule: rule.rule,
        message: rule.message,
        source: 'html',
      });
    }

    // Duplicate ids break `getElementById`, label association and CSS targeting.
    const id = tag.attributes.get('id');
    if (id) {
      const previous = seenIds.get(id);
      if (previous !== undefined) {
        const { line, column } = offsetToPosition(html, tag.offset);
        issues.push({
          id: `dupe-id-${file}-${index}`,
          file,
          fileLabel,
          line,
          column,
          severity: 'error',
          rule: 'html(duplicate-id)',
          message: `Duplicate id "${id}" — already used on line ${previous}.`,
          source: 'html',
        });
      } else {
        seenIds.set(id, offsetToPosition(html, tag.offset).line);
      }
    }
  });

  return issues;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Service                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/** Dedicated URI scheme so validation models never collide with editor models. */
const VALIDATION_SCHEME = 'gbvalidate';

const SCRIPT_LANGUAGES = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact']);

const sourceForLanguage = (language: string): IssueSource => {
  if (language === 'html') return 'html';
  if (language === 'css' || language === 'scss' || language === 'less') return 'css';
  return 'js';
};

/** Formats a marker code the way VS Code labels rules. */
const formatRule = (marker: MonacoMarker, language: string): string => {
  const rawCode =
    typeof marker.code === 'object' && marker.code !== null ? marker.code.value : marker.code;
  const owner = marker.source || (language === 'html' ? 'html' : language === 'css' ? 'css' : 'ts');
  return rawCode !== undefined && rawCode !== null && rawCode !== ''
    ? `${owner}(${rawCode})`
    : owner;
};

class ValidationService {
  private monaco: MonacoApi | null = null;
  /** Validation-only models, keyed by editor key. */
  private readonly models = new Map<string, MonacoModel>();
  private configured = false;

  /**
   * Supplied from an editor's `onMount`. Validation is unavailable until an
   * editor has mounted, which in this app is immediately.
   */
  public setMonaco(monaco: MonacoApi): void {
    if (this.monaco === monaco) return;
    this.monaco = monaco;
    this.configure();
  }

  public isReady(): boolean {
    return this.monaco !== null;
  }

  /**
   * Turns on the diagnostics the brief asks for. Monaco defaults to syntax-only
   * checking for JavaScript, which is why undefined and unused variables were
   * never reported.
   */
  private configure(): void {
    const monaco = this.monaco;
    if (!monaco || this.configured) return;

    const typescript = monaco.languages.typescript;
    if (typescript) {
      const compilerOptions = {
        allowJs: true,
        checkJs: true,
        allowNonTsExtensions: true,
        /*
         * JSX support for .jsx/.tsx files. `ReactJSX` (the automatic runtime)
         * rather than `React` (the classic one): with the classic runtime, TS
         * requires `React` to be in scope for every JSX file and reports
         * "Cannot find name 'React'" on the starter templates, which do not
         * import it. The automatic runtime is also what the bundler compiles to,
         * so the diagnostics match how the code actually runs.
         */
        jsx: typescript.JsxEmit?.ReactJSX ?? 4,
        target: typescript.ScriptTarget?.ES2020 ?? 7,
        moduleResolution: 2,
        noUnusedLocals: true,
        noUnusedParameters: true,
        // User snippets are rarely modules; without this every file that
        // declares a top-level name collides with every other file.
        moduleDetection: 3,
      };

      for (const defaults of [typescript.javascriptDefaults, typescript.typescriptDefaults]) {
        defaults.setCompilerOptions(compilerOptions);
        defaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          // Bare CDN specifiers cannot be resolved in the browser; reporting
          // every import as unresolved would bury the real problems.
          diagnosticCodesToIgnore: [2307, 2792, 6142, 7016],
        });
      }
    }

    monaco.languages.css?.cssDefaults.setOptions({
      validate: true,
      lint: {
        // Mirrors the requested ruleset: duplicates, unknown properties and
        // invalid values are all part of the CSS language service's linter.
        duplicateProperties: 'warning',
        unknownProperties: 'warning',
        unknownVendorSpecificProperties: 'ignore',
        emptyRules: 'warning',
        importStatement: 'ignore',
        zeroUnits: 'ignore',
      },
    });

    monaco.languages.html?.htmlDefaults.setOptions({
      format: { wrapLineLength: 120 },
      suggest: {},
    });

    this.configured = true;
  }

  /**
   * Ensures a validation model exists for a source and holds current content.
   *
   * HTML and CSS get dedicated models so every file is checked regardless of
   * which editor tab is open. Scripts deliberately do *not*: a second model
   * declaring the same top-level names would make the TypeScript worker report
   * spurious duplicate-identifier errors against the editor's own model.
   */
  private syncModel(key: string, content: string, language: string): MonacoModel | null {
    const monaco = this.monaco;
    if (!monaco) return null;

    const existing = this.models.get(key);
    if (existing && !existing.isDisposed?.()) {
      if (existing.getValue() !== content) existing.setValue(content);
      return existing;
    }

    const uri = monaco.Uri.parse(`${VALIDATION_SCHEME}://validate/${key}`);
    const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(content, language, uri);
    if (model.getValue() !== content) model.setValue(content);
    this.models.set(key, model);
    return model;
  }

  private markersToIssues(
    model: MonacoModel,
    file: string,
    fileLabel: string,
    language: string,
  ): ValidationIssue[] {
    const monaco = this.monaco;
    if (!monaco) return [];

    const severityMap = monaco.MarkerSeverity;
    const markers = monaco.editor.getModelMarkers({ resource: model.uri });

    return markers.map((marker, index) => {
      const severity: IssueSeverity =
        marker.severity === severityMap.Error
          ? 'error'
          : marker.severity === severityMap.Warning
            ? 'warning'
            : 'info';

      return {
        id: `marker-${file}-${index}-${marker.startLineNumber}-${marker.startColumn}`,
        file,
        fileLabel,
        line: marker.startLineNumber,
        column: marker.startColumn,
        severity,
        rule: formatRule(marker, language),
        message: marker.message,
        source: sourceForLanguage(language),
      };
    });
  }

  /** Metadata for each model currently under validation. */
  private targets: { model: MonacoModel; key: string; label: string; language: string }[] = [];
  /** Latest computed summary, republished whenever markers change. */
  private summary: ValidationSummary = EMPTY_SUMMARY;
  private readonly subscribers = new Set<(summary: ValidationSummary) => void>();
  private markerListenerAttached = false;
  /** Non-marker issues (structure, attributes) keyed by editor key. */
  private textIssues: ValidationIssue[] = [];

  /**
   * Subscribes to validation results.
   *
   * Validation is push-based, mirroring how VS Code works: the language services
   * publish markers whenever their workers finish, and we recompute then.
   *
   * The alternative -- syncing content and then polling for markers -- was
   * genuinely broken. Monaco offers no "validation complete" signal, and on the
   * first run the workers have not even been instantiated yet, so an empty
   * marker set is indistinguishable from a settled one. That made the first
   * validation of every session silently return no CSS diagnostics at all.
   */
  public subscribe(listener: (summary: ValidationSummary) => void): () => void {
    this.subscribers.add(listener);
    listener(this.summary);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private publish(): void {
    const markerIssues: ValidationIssue[] = [];
    for (const target of this.targets) {
      markerIssues.push(
        ...this.markersToIssues(target.model, target.key, target.label, target.language),
      );
    }

    this.summary = summarize([...markerIssues, ...this.textIssues]);
    this.subscribers.forEach((listener) => listener(this.summary));
  }

  /** Attaches the marker listener once Monaco is available. */
  private attachMarkerListener(): void {
    const monaco = this.monaco;
    if (!monaco || this.markerListenerAttached) return;
    if (!monaco.editor.onDidChangeMarkers) return;

    monaco.editor.onDidChangeMarkers(() => this.publish());
    this.markerListenerAttached = true;
  }

  /**
   * Points the validators at the current project. Cheap and synchronous: it
   * syncs model content and runs the text-based passes, then publishes. Marker
   * based results arrive later via the listener above.
   */
  public syncProject(project: MultiFileProject): void {
    const monaco = this.monaco;
    if (!monaco) return;

    this.attachMarkerListener();

    const isPlain = project.projectType === 'plain';

    /** Editor navigation key for a project file. */
    const editorKeyFor = (path: string): string => {
      if (!isPlain) return path;
      if (path === PLAIN_HTML_PATH) return 'html';
      if (path === PLAIN_CSS_PATH) return 'css';
      if (path === PLAIN_JS_PATH) return 'javascript';
      return path;
    };

    const targets: typeof this.targets = [];
    const textIssues: ValidationIssue[] = [];

    // HTML + CSS via dedicated validation models, so every file is covered
    // regardless of which editor tab happens to be open.
    for (const projectFile of project.files) {
      const language = monacoLanguageForValidation(projectFile.language);

      if (language === 'html') {
        const key = editorKeyFor(projectFile.path);
        const model = this.syncModel(key, projectFile.content, 'html');
        if (model) targets.push({ model, key, label: projectFile.path, language });

        // Structure and attribute rules are pure text passes.
        textIssues.push(...validateHtmlStructure(projectFile.content, key, projectFile.path));
        textIssues.push(...validateHtmlAttributes(projectFile.content, key, projectFile.path));
        continue;
      }

      if (language === 'css') {
        const key = editorKeyFor(projectFile.path);
        const model = this.syncModel(key, projectFile.content, 'css');
        if (model) targets.push({ model, key, label: projectFile.path, language });
      }
    }

    // Scripts: markers come from the editors' own models, because a duplicate
    // model would make the TypeScript worker report phantom redeclarations.
    for (const model of monaco.editor.getModels()) {
      const language = model.getLanguageId();
      if (!SCRIPT_LANGUAGES.has(language)) continue;
      if (model.uri.toString().startsWith(`${VALIDATION_SCHEME}://`)) continue;

      const path = decodeURIComponent(model.uri.path ?? '').replace(/^\//, '');
      const projectFile = project.files.find((file) => file.path === path);

      /*
       * Plain projects give Monaco an auto-generated URI, so the model cannot be
       * matched back to a path; there is only ever one script model, which is
       * the JS editor.
       */
      const key = projectFile ? editorKeyFor(projectFile.path) : isPlain ? 'javascript' : path;
      const label = projectFile?.path ?? (isPlain ? PLAIN_JS_PATH : path || 'script');
      targets.push({ model, key, label, language });
    }

    this.targets = targets;
    this.textIssues = textIssues;
    this.publish();
  }

  /** Releases validation-only models. */
  public dispose(): void {
    for (const model of this.models.values()) {
      if (!model.isDisposed?.()) model.dispose();
    }
    this.models.clear();
    this.targets = [];
  }
}

/** Maps the project's language union onto a Monaco language id. */
const monacoLanguageForValidation = (language: FileLanguage): string => {
  switch (language) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'javascript':
      return 'javascript';
    case 'jsx':
      return 'javascriptreact';
    case 'typescript':
      return 'typescript';
    case 'tsx':
      return 'typescriptreact';
    default:
      return 'plaintext';
  }
};

/** Sorts by file then position, drops duplicates, and counts by severity. */
export const summarize = (issues: ValidationIssue[]): ValidationSummary => {
  const seen = new Set<string>();
  const unique: ValidationIssue[] = [];

  for (const issue of issues) {
    const key = `${issue.file}:${issue.line}:${issue.column}:${issue.rule}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(issue);
  }

  const severityRank: Record<IssueSeverity, number> = { error: 0, warning: 1, info: 2 };
  unique.sort(
    (a, b) =>
      a.fileLabel.localeCompare(b.fileLabel) ||
      severityRank[a.severity] - severityRank[b.severity] ||
      a.line - b.line ||
      a.column - b.column,
  );

  return {
    issues: unique,
    errors: unique.filter((issue) => issue.severity === 'error').length,
    warnings: unique.filter((issue) => issue.severity === 'warning').length,
    infos: unique.filter((issue) => issue.severity === 'info').length,
  };
};

export const validationService = new ValidationService();
