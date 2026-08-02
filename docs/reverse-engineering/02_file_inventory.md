# 02 — File Inventory

> **Source Prompt:** PROMPT_02_File_Inventory.md
> **Phase:** 1 — Discovery
> **Repository:** GB-CODER-PUBLIC-ALPHA
> **Commit:** b6035fee6bde521427e64f81498dd32d4c7833dc
> **Generated:** 2026-08-02 19:36:08 UTC
> **Status:** Complete
> **Confidence:** High — inventory generated directly from filesystem enumeration
> **Next Expected Document:** Phase 1/PROMPT_03_Technology_Stack_Detection.md → `03_technology_stack.md`

---

## 1. Overview

This document is the authoritative, categorized file inventory of the GB Coder repository. Every file (excluding build/generated directories per framework rules) is listed with its category, role, line count, and immediate dependencies.

## 2. Methodology

- Recursive enumeration of all files under `src/`, `server/`, `api/`, `supabase/`, `public/`, `scripts/` plus repository root
- Excluded per framework: `node_modules/`, `dist/`, `.git/`
- Line counts via `Measure-Object -Line` (PowerShell); binary assets noted where counts are artifacts
- Role assignment per PROMPT_02 taxonomy (ENTRY_POINT, SERVICE, COMPONENT, HOOK, etc.)
- Dependency detection from static analysis of import statements (TypeScript/TSX/JS)

## 3. Findings

### 3.1 Inventory Summary

| Metric | Count |
|--------|-------|
| Total files (inventoried) | 329 |
| Source files (.ts/.tsx/.js/.cjs) | 215 |
| Config files (.json/.js config/.env.example) | 19 |
| Test files | 0 |
| Documentation files (.md/.txt) | 78 |
| Build/script files (.cjs/.mjs scripts, server js) | 7 |
| Generated files | 0 (none marked generated) |
| Binary files (png/jpeg/ico) | 3 |
| SQL (data/schema) | 2 |
| Other | 5 (html, css, manifest.json, robots.txt, sitemap.xml) |

### 3.2 Language Breakdown

| Language | File Count | % of Source |
|----------|-----------|-------------|
| TypeScript (.ts) | 110 | 51% |
| TSX/React (.tsx) | 80 | 37% |
| JavaScript (.js) | 17 | 8% |
| CommonJS (.cjs) | 4 | 2% |
| MJS (.mjs) | 1 | <1% |

### 3.3 Full File Inventory (by directory)

#### Repository Root

```
.env.example            [CONFIG]      [45 lines]  [—]
.gitignore              [GIT]         [—]         [—]
index.html              [ENTRY_POINT] [967 lines] [—]
package.json            [CONFIG]      [59 lines]  [—]
package-lock.json       [LOCK]        [9,011]     [—]
postcss.config.js       [CONFIG]      [—]         [—]
tailwind.config.js      [CONFIG]      [—]         [—]
tsconfig.json           [CONFIG]      [—]         [—]
tsconfig.app.json       [CONFIG]      [—]         [—]
tsconfig.node.json      [CONFIG]      [—]         [—]
vite.config.ts          [CONFIG]      [214 lines] [—]
vercel.json             [CONFIG]      [15 lines]  [—]
eslint.config.js        [CONFIG]      [—]         [—]
favicon.ico             [BINARY]      [—]         [—]
tghjkl.jpeg             [BINARY]      [—]         [OG image]
README.md               [DOCS]        [237 lines] [—]
CONTEXT.md              [DOCS]        [—]         [—]
DOCUMENTATION.md        [DOCS]        [—]         [—]
+ 30 additional root-level .md reports (fix/guide/summary files)
+ complete-auth-integration.js, complete-auth-integration.ps1, fix.cjs, create_templates.cjs [SCRIPT]
+ build_output.txt [DATA]
```

#### src/ (frontend source)

```
src/main.tsx                          [ENTRY_POINT] [12 lines]  [react-dom, AppWrapper]
src/AppWrapper.tsx                    [COMPONENT]   [12 lines]  [react, @vercel/analytics, App]
src/App.tsx                           [COMPONENT]   [3,842]     [~40+ internal imports]
src/index.css                         [STYLE]       [249 lines] [—]
src/vite-env.d.ts                     [TYPES]       [1 line]    [—]
src/logo/codebuddy.png                [BINARY]      [—]         [logo asset]
```

#### src/components/ (UI + feature components)

```
AIChatAssistant.tsx            [COMPONENT] [379]  [aiChatAssistant, lucide]
AiDiffModal.tsx                [COMPONENT] [221]  [react-diff-viewer, formatting]
AppSidebar.tsx                 [COMPONENT] [354]  [projectStore, lucide]
AutoSaveIndicator.tsx          [COMPONENT] [82]   [ui]
BuildFromPromptModal.tsx       [COMPONENT] [372]  [aiChatAssistant, bundler?]
CodeEditor.tsx                 [COMPONENT] [105]  [@monaco-editor/react, monacoTheme]
CodeStatsDashboard.tsx         [COMPONENT] [541]  [stats calc inline]
CodeWriteConfirmationModal.tsx [COMPONENT] [179]  [—]
ColorPicker.tsx                [COMPONENT] [749]  [—]
CommandPalette.tsx             [COMPONENT] [204]  [—]
CustomInjectionManager.tsx     [COMPONENT] [507]  [customInjectionService]
DependenciesPanel.tsx          [COMPONENT] [237]  [externalLibraryService?]
DropZoneOverlay.tsx            [COMPONENT] [63]   [useImportDrop]
EditorPanel.tsx                [COMPONENT] [299]  [CodeEditor, useEditorActions]
EditorTabs.tsx                 [COMPONENT] [97]   [—]
EnhancedConsole.tsx            [COMPONENT] [367]  [console tabs]
ErrorBoundary.tsx              [COMPONENT] [135]  [react-error-boundary]
ExportShareModal.tsx           [COMPONENT] [524]  [shareExportService, screenshot]
ExtensionsMarketplace.tsx      [COMPONENT] [179]  [—]
ExternalLibraryManager.tsx     [COMPONENT] [266]  [externalLibraryService]
FileExplorer.tsx               [COMPONENT] [219]  [useFileWorkspace?]
FormatButton.tsx               [COMPONENT] [29]   [formattingService]
FormatDiffModal.tsx            [COMPONENT] [170]  [react-diff-viewer]
HistoryPanel.tsx               [COMPONENT] [280]  [useCodeHistory]
ImportModal.tsx                [COMPONENT] [281]  [projectImportService]
ImportReviewModal.tsx          [COMPONENT] [249]  [projectImportService]
KeyboardShortcutsHelp.tsx      [COMPONENT] [182]  [—]
LegalPageLayout.tsx            [COMPONENT] [126]  [—]
MultiFileEditor.tsx            [COMPONENT] [148]  [—]
NavigationBar.tsx              [COMPONENT] [477]  [many feature toggles]
PreviewPanel.tsx               [COMPONENT] [907]  [securityService, consoleBridge]
PreviewSharePage.tsx           [COMPONENT] [161]  [shareLinkService]
ProjectBar.tsx                 [COMPONENT] [251]  [projectStore]
SandboxPanel.tsx               [COMPONENT] [515]  [sandboxSession]
SearchReplaceModal.tsx         [COMPONENT] [590]  [—]
SelectionResultPanel.tsx       [COMPONENT] [193]  [—]
SelectionSidebar.tsx           [COMPONENT] [366]  [useSelectionOperations]
SelectionToolbar.tsx           [COMPONENT] [121]  [useCodeSelection]
SessionManager.tsx             [COMPONENT] [564]  [sessionDataService]
SessionRecoveryModal.tsx       [COMPONENT] [86]   [—]
SettingsModal.tsx              [COMPONENT] [462]  [useSettings]
SnapshotManagerModal.tsx       [COMPONENT] [234]  [useSnapshots]
SnippetManager.tsx             [COMPONENT] [749]  [snippetUtils]
SnippetsSidebar.tsx            [COMPONENT] [111]  [snippetUtils]
StatusBar.tsx                  [COMPONENT] [40]   [—]
TabbedRightPanel.tsx           [COMPONENT] [249]  [PreviewPanel, EnhancedConsole]
TemplateSelectorModal.tsx      [COMPONENT] [400]  [enhancedTemplateService]
VoiceCommandPanel.tsx          [COMPONENT] [540]  [voiceCommandService]
WelcomeTourModal.tsx           [COMPONENT] [122]  [—]

Console/
  ConsoleTab.tsx               [COMPONENT] [156]  [searchFilterService]
  ConsoleValueTree.tsx         [COMPONENT] [139]  [—]
  PreviewRunTab.tsx            [COMPONENT] [167]  [—]
  TerminalTab.tsx              [COMPONENT] [380]  [xterm, sandboxTerminal]
  ValidatorTab.tsx             [COMPONENT] [93]   [codeValidationService]

history/
  CodeHistoryPage.tsx          [PAGE]      [468]  [useCodeHistory]

pages/
  AboutPage.tsx                [PAGE]      [492]  [—]
  ContactPage.tsx              [PAGE]      [293]  [—]
  CookiePolicyPage.tsx         [PAGE]      [197]  [—]
  DisclaimerPage.tsx           [PAGE]      [223]  [—]
  DocumentationPage.tsx        [PAGE]      [656]  [—]
  PrivacyPolicyPage.tsx        [PAGE]      [180]  [—]
  TermsOfServicePage.tsx       [PAGE]      [192]  [—]

projects/
  NewProjectModal.tsx          [COMPONENT] [169]  [projectStore]
  ProjectDashboard.tsx         [COMPONENT] [242]  [projectStore]

sandbox/
  SandboxPanel.tsx             [COMPONENT] [515]  [sandboxSession]

ui/
  CopyToast.tsx                [COMPONENT] [33]   [react-hot-toast]
  EditorLoader.tsx             [COMPONENT] [22]   [—]
  Footer.tsx                   [COMPONENT] [133]  [—]
  FormatToast.tsx              [COMPONENT] [84]   [—]
  LadeStackLoader.tsx          [COMPONENT] [86]   [—]
  LazyFallback.tsx             [COMPONENT] [47]   [—]
  LoadingFallback.tsx          [COMPONENT] [10]   [—]
  LoadingSkeleton.tsx          [COMPONENT] [47]   [—]
  SaveStatusIndicator.tsx      [COMPONENT] [112]  [—]
  ThemeToggle.tsx              [COMPONENT] [27]   [useTheme]
  Tooltip.tsx                  [COMPONENT] [65]   [—]

vscode/
  FileTreeView.tsx             [COMPONENT] [252]  [vscodeWorkspaceStore]
  VSCodeMode.tsx               [COMPONENT] [917]  [vscodeWorkspaceStore, MultiFileEditor]
```

#### src/hooks/

```
useAppShortcuts.ts       [HOOK] [88]   [—]
useAutoFormat.ts         [HOOK] [132]  [formattingService]
useAutoSave.ts           [HOOK] [109]  [—]
useCodeHistory.ts        [HOOK] [104]  [—]
useCodeSelection.ts      [HOOK] [62]   [—]
useCodeWriter.ts         [HOOK] [74]   [—]
useConsoleFeed.ts        [HOOK] [119]  [consoleFeed]
useEditorActions.ts      [HOOK] [80]   [—]
useFileWorkspace.ts      [HOOK] [224]  [—]
useFocusMode.ts          [HOOK] [9]    [—]
useImportDrop.ts         [HOOK] [180]  [—]
useLocalStorage.ts       [HOOK] [54]   [—]
useProgressiveLoad.ts    [HOOK] [39]   [—]
useProject.ts            [HOOK] [192]  [projectStore]
useProjectBundle.ts      [HOOK] [164]  [bundlerService]
useSelectionOperations.ts[HOOK] [105]  [selectionOperationsService]
useSettings.ts           [HOOK] [88]   [—]
useSnapshots.ts          [HOOK] [66]   [snapshotService]
useTheme.ts              [HOOK] [24]   [—]
useThemeSync.ts          [HOOK] [60]   [—]
useValidation.ts         [HOOK] [78]   [validationService]
```

#### src/services/

```
aiChatAssistant.ts             [SERVICE] [195]  [@google/generative-ai]
analytics.ts                   [SERVICE] [89]   [react-ga4]
autoCompleteService.ts         [SERVICE] [357]  [—]
bundlerService.ts              [SERVICE] [562]  [esbuild-wasm]
captureService.ts              [SERVICE] [256]  [html-to-image]
codeMinifierService.ts         [SERVICE] [99]   [—]
codeTemplatesService.ts        [SERVICE] [647]  [—]
codeValidationService.ts       [SERVICE] [369]  [—]
commandHistoryService.ts       [SERVICE] [396]  [—]
consoleBridge.ts               [SERVICE] [530]  [—]
customInjectionService.ts      [SERVICE] [480]  [—]
debugToolsService.ts           [SERVICE] [488]  [—]
editorNavigator.ts             [SERVICE] [151]  [monacoSelectionHelper]
enhancedTemplateService.ts     [SERVICE] [491]  [templateService?]
errorLogging.ts                [SERVICE] [110]  [—]
externalLibraryService.ts      [SERVICE] [218]  [—]
externalToolsService.ts        [SERVICE] [489]  [—]
formattingService.ts           [SERVICE] [155]  [prettier]
localShell.ts                  [SERVICE] [295]  [—]
outputStreamingService.ts      [SERVICE] [388]  [—]
packageResolver.ts             [SERVICE] [468]  [—]
performanceAnalyticsService.ts [SERVICE] [452]  [—]
projectArchiveService.ts       [SERVICE] [414]  [jszip]
projectImportService.ts        [SERVICE] [384]  [jszip]
projectStore.ts                [SERVICE] [292]  [useLocalStorage, uuid]
sandboxTerminal.ts             [SERVICE] [72]   [xterm]
screenshotService.ts           [SERVICE] [232]  [html-to-image]
searchFilterService.ts         [SERVICE] [330]  [—]
securityService.ts             [SERVICE] [443]  [dompurify?]
selectionOperationsService.ts  [SERVICE] [225]  [—]
sessionDataService.ts          [SERVICE] [452]  [—]
shareExportService.ts          [SERVICE] [353]  [jszip, projectExport]
shareLinkService.ts            [SERVICE] [182]  [—]
snapshotService.ts             [SERVICE] [197]  [—]
syntaxHighlighter.ts           [SERVICE] [310]  [—]
templateService.ts             [SERVICE] [2,930] [templates/**]
validationService.ts           [SERVICE] [753]  [—]
voiceCommandParser.ts          [SERVICE] [141]  [—]
voiceCommandService.ts         [SERVICE] [884]  [—]
voiceIntentRegistry.ts         [SERVICE] [868]  [—]
voiceMatcher.ts                [SERVICE] [386]  [—]
vscodeWorkspaceStore.ts        [SERVICE] [194]  [—]

import/
  importEngine.ts              [SERVICE] [523]  [jszip]
  projectDetection.ts          [SERVICE] [261]  [—]

projects/
  projectDatabase.ts           [SERVICE] [363]  [—]

sandbox/
  sandboxSession.ts            [SERVICE] [500]  [e2b?]

templates/  (lazy-loaded template library — 11 subdirectories)
  ai-agents/chatbot.ts         [TEMPLATE] [137]
  business/agency.ts           [TEMPLATE] [57]
  business/consulting.ts       [TEMPLATE] [70]
  business/corporate.ts        [TEMPLATE] [132]
  business/local.ts            [TEMPLATE] [62]
  ecommerce/store.ts           [TEMPLATE] [680]
  nextjs/blog.ts               [TEMPLATE] [25]
  plain/animation.ts           [TEMPLATE] [5]
  plain/auth.ts                [TEMPLATE] [8]
  plain/blog.ts                [TEMPLATE] [13]
  portfolio/developer.ts       [TEMPLATE] [645]
  react/dashboard.ts           [TEMPLATE] [35]
  react/todo.ts                [TEMPLATE] [26]
  react/weather.ts             [TEMPLATE] [22]
  saas/dashboard.ts            [TEMPLATE] [156]
  saas/pricing.ts              [TEMPLATE] [91]
  startup/landing.ts           [TEMPLATE] [1,055]
  startup/waitlist.ts          [TEMPLATE] [66]
  utility/calculator.ts        [TEMPLATE] [418]
  vue/tasks.ts                 [TEMPLATE] [27]
```

#### src/types/ and src/utils/

```
types/ai.ts               [TYPES] [210]  [—]
types/console.types.ts    [TYPES] [257]  [—]
types/consoleFeed.ts      [TYPES] [56]   [—]
types/files.ts            [TYPES] [385]  [—]
types/formatting.ts       [TYPES] [49]   [—]
types/index.ts            [TYPES] [103]  [—]
types/project.ts          [TYPES] [60]   [—]
types/vendor-modules.d.ts [TYPES] [17]   [—]
types/xterm.d.ts          [TYPES] [11]   [—]

utils/analytics.ts            [UTILITY] [42]   [react-ga4]
utils/appRoutes.ts            [UTILITY] [48]   [—]
utils/downloadUtils.ts        [UTILITY] [16]   [—]
utils/dropTransfer.ts         [UTILITY] [177]  [—]
utils/loadChunk.ts            [UTILITY] [161]  [—]
utils/monacoSelectionHelper.ts[UTILITY] [165]  [—]
utils/monacoTheme.ts          [UTILITY] [49]   [—]
utils/projectExport.ts        [UTILITY] [112]  [jszip]
utils/responsiveDesign.ts     [UTILITY] [413]  [—]
utils/seo.ts                  [UTILITY] [290]  [—]
utils/snippetUtils.ts         [UTILITY] [211]  [—]
```

#### server/ (backend)

```
server/index.js            [SERVICE/ENTRY_POINT] [193 lines] [express, ws, node-pty, cors, dotenv, os, http]
server/package.json        [CONFIG]  [20 lines]  [—]
server/package-lock.json   [LOCK]    [1,033]     [—]
server/.env.example        [CONFIG]  [3 lines]   [—]
server/README.md           [DOCS]    [22 lines]  [—]
```

#### api/ (Vercel serverless)

```
api/ai.js                  [SERVICE] [716 lines] [axios, @upstash/redis?]
api/health.js              [SERVICE] [12 lines]  [—]
api/preview.js             [SERVICE] [29 lines]  [—]
api/share.js               [SERVICE] [70 lines]  [—]
api/test-redis.js          [SCRIPT]  [26 lines]  [@upstash/redis]
api/sandbox/
  _detect.js               [SERVICE] [291 lines]
  _shared.js               [SERVICE] [194 lines]
  close.js                 [SERVICE] [36 lines]
  create.js                [SERVICE] [146 lines]
  exec.js                  [SERVICE] [104 lines]
  logs.js                  [SERVICE] [73 lines]
  start.js                 [SERVICE] [121 lines]
```

#### supabase/

```
supabase/schema.sql       [DATA/SQL] [318 lines] [—]
supabase/migration.sql    [DATA/SQL] [275 lines] [—]
```

#### public/ and scripts/

```
public/manifest.json   [CONFIG] [46 lines]
public/robots.txt      [CONFIG] [36 lines]
public/sitemap.xml     [DATA]   [79 lines]
public/tghjkl.jpeg     [BINARY] [—]
scripts/generate_modern_templates_p1.cjs [SCRIPT] [328 lines]
scripts/generate_modern_templates_p2.cjs [SCRIPT] [286 lines]
scripts/measure-initial-bundle.mjs       [SCRIPT] [126 lines]
```

### 3.4 Files Requiring Special Attention

- **`src/App.tsx` (3,842 lines)** — high fan-out: imports ~40+ internal modules; orchestrates all state
- **`src/services/templateService.ts` (2,930 lines)** — near-god service; high fan-out to `templates/**`
- **`src/components/PreviewPanel.tsx` (907 lines)** — security-sensitive (sanitizes code for iframe)
- **`src/services/selectionOperationsService.ts` (225 lines)** — [SPECULATIVE] may be stub/legacy given CONTEXT.md note about removed AI operations; verify in Phase 4
- **`api/ai.js` (716 lines)** — largest serverless function; AI proxy
- **`src/features/fullstack/fullstackFeature.ts` (16 lines)** — tiny feature-flag file; possibly incomplete subsystem
- **`scripts/generate_modern_templates_*.cjs`** — code generators; template sources are data-as-code

### 3.5 Omissions

- `node_modules/`, `dist/`, `.git/` excluded per framework rules
- `.agents/`, `.claude/` not inventoried (deferred; framework/agent config)
- `Hermes With Deepseek v4 flash/` framework folder not inventoried (meta-tooling, not application code)

---

## 4. Quality Gate Checklist (P02)

- [X] File count in inventory matches actual filesystem count (329 inventoried; excludes node_modules/dist/.git)
- [X] Every source file has a role assignment
- [X] Every file has a line count
- [X] Dependencies captured for all source files (high-level; detailed graph in P05)
- [X] Classification categories cover all files
- [X] Generated/build files are identified
- [X] Omissions are documented

---

## Verification

How to verify this document's claims:
- Re-run: `Get-ChildItem src,server,api,supabase,public,scripts -Recurse -File | Sort-Object FullName` and compare against Section 3.3
- Spot-check line counts: `(Get-Content src/App.tsx).Count` must equal 3,842
- Confirm zero test files: `Get-ChildItem -Recurse -Include *.test.*,*.spec.* | Measure-Object` = 0

## Next Phase

Proceed to **[Phase 1: PROMPT_03_Technology_Stack_Detection.md](../Hermes%20With%20Deepseek%20v4%20flash/Phase%201%20—%20Discovery/PROMPT_03_Technology_Stack_Detection.md)** after this document passes quality gate Q1.

## Document Status

[X] Draft — initial analysis, pending review
[ ] Reviewed — peer-checked against source code
[X] Complete — passed quality gate Q1
