# GB Coder — Complete Application Context

## 1. PROJECT OVERVIEW

GB Coder is an AI-powered, browser-based HTML/CSS/JavaScript code playground (similar to CodePen/JSFiddle) built with React + TypeScript + Vite. It features a live preview, an integrated terminal (via WebSocket + node-pty), AI chat assistant (Google Gemini / NVIDIA NIM), and extensive developer tooling.

- **Domain:** gbcoder.com / gb-coder.vercel.app
- **Author:** Girish Lade
- **License:** MIT
- **Stack:** React 18, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4, Monaco Editor, Google Gemini AI, NVIDIA NIM API

---

## 2. TECH STACK

### Frontend (src/)
| Technology | Purpose |
|---|---|
| React 18.3 | UI framework |
| TypeScript 5.5 | Type safety |
| Vite 5.4 | Build tool & dev server |
| Tailwind CSS 3.4 | Utility-first styling (VS Code Dark theme inspired) |
| Monaco Editor (@monaco-editor/react) | Code editing (3 panels: HTML/CSS/JS) |
| lucide-react | Icon library |
| react-hot-toast | Toast notifications |
| Google Generative AI (@google/generative-ai) | AI Chat Assistant (gemini-pro) |
| Prettier (standalone) | Code formatting |
| diff (npm) | Line-by-line diff generation |
| jszip | ZIP export |
| html-to-image | Screenshot capture |
| xterm.js + xterm-addon-fit | Browser terminal emulator |
| @vercel/analytics + react-ga4 | Analytics (Vercel + Google Analytics 4) |
| DOMPurify | XSS sanitization |

### Backend (server/)
| Technology | Purpose |
|---|---|
| Node.js + Express 4.18 | HTTP server |
| ws (WebSocket) 8.14 | Real-time terminal proxy |
| node-pty 1.0 | Pseudo-terminal (spawns shell) |
| cors | Cross-origin requests |
| dotenv | Environment configuration |

### Serverless (api/)
| Technology | Purpose |
|---|---|
| Vercel Serverless Functions | AI proxy (NVIDIA NIM API) |
| axios | HTTP client for NVIDIA API |

### Database (supabase/)
| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | User auth, project/snippet/conversation persistence |
| Row Level Security (RLS) | Per-user data isolation |
| UUID primary keys | Compatible with frontend crypto.randomUUID() |

---

## 3. PROJECT STRUCTURE

```
GB-CODER-PUBLIC-ALPHA/
├── index.html                  # Main entry HTML (SEO-optimized, 967 lines)
├── vite.config.ts              # Vite build config (PWA, chunk splitting, proxy)
├── tsconfig.json               # TypeScript root references
├── tsconfig.app.json           # TS config for src/
├── tsconfig.node.json          # TS config for vite.config.ts
├── tailwind.config.js          # VS Code Dark Theme color palette
├── postcss.config.js           # Tailwind + Autoprefixer
├── eslint.config.js            # Flat ESLint config
├── vercel.json                 # Vercel deployment config
├── .env.example                # Environment variable template
├── package.json                # Frontend deps + scripts
│
├── src/                        # ─── FRONTEND ───
│   ├── main.tsx                # Entry point (StrictMode, ErrorBoundary)
│   ├── AppWrapper.tsx          # Vercel Analytics wrapper
│   ├── App.tsx                 # Main orchestrator (all state + render tree)
│   ├── index.css               # Tailwind directives + global styles
│   │
│   ├── components/
│   │   ├── NavigationBar.tsx          # Top navbar (menus, save, run, import/export)
│   │   ├── EditorPanel.tsx            # Collapsible editor wrapper (drag-drop, lock, copy)
│   │   ├── CodeEditor.tsx             # Monaco Editor wrapper (selection, font, theme)
│   │   ├── PreviewPanel.tsx           # Live preview iframe (sandboxed, responsive modes)
│   │   ├── TabbedRightPanel.tsx       # Tabs: Preview | Console
│   │   ├── AIChatAssistant.tsx        # Gemini AI chat modal
│   │   ├── VoiceCommandPanel.tsx      # Web Speech API voice commands
│   │   ├── TemplateSelectorModal.tsx  # Template browser (9 categories)
│   │   ├── ExportShareMenu.tsx        # ZIP/HTML export + CodePen/JSFiddle
│   │   ├── CodeStatsDashboard.tsx     # Code statistics (lines, chars, etc.)
│   │   ├── ValidationPanel.tsx        # HTML/CSS/JS validation results
│   │   ├── CustomInjectionManager.tsx # Custom CSS/JS injection management
│   │   ├── SettingsModal.tsx          # Editor settings (font, theme, behavior)
│   │   ├── SnippetsSidebar.tsx        # Code snippet browser/manager
│   │   ├── ExternalLibraryManager.tsx # CDN library manager (70+ libraries)
│   │   ├── ExtensionsMarketplace.tsx  # Extensions browser
│   │   ├── SelectionToolbar.tsx       # Floating toolbar for selected code
│   │   ├── SelectionSidebar.tsx       # AI operation results sidebar
│   │   ├── KeyboardShortcutsHelp.tsx  # Keyboard shortcuts modal
│   │   ├── HistoryPanel.tsx           # Undo/redo snapshot browser
│   │   ├── EnhancedConsole.tsx        # 4-mode console (Console, Validator, Preview, Terminal)
│   │   ├── ErrorBoundary.tsx          # React error boundary
│   │   ├── Console/
│   │   │   ├── ConsolePanel.tsx       # Basic console log display
│   │   │   ├── TerminalConsolePanel.tsx # Terminal tab manager
│   │   │   └── TerminalView.tsx       # xterm.js WebSocket terminal
│   │   ├── ui/
│   │   │   ├── Footer.tsx             # App footer
│   │   │   ├── SaveStatusIndicator.tsx # Auto-save indicator
│   │   │   └── CopyToast.tsx          # Copy confirmation toast
│   │   ├── pages/
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── DocumentationPage.tsx
│   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   ├── TermsOfServicePage.tsx
│   │   │   ├── CookiePolicyPage.tsx
│   │   │   └── DisclaimerPage.tsx
│   │   └── history/
│   │       └── CodeHistoryPage.tsx    # History view page
│   │
│   ├── hooks/                   # ─── CUSTOM HOOKS (15 total) ───
│   │   ├── useLocalStorage.ts          # Generic localStorage with cross-tab sync
│   │   ├── useTheme.ts                 # Light/dark toggle
│   │   ├── useThemeSync.ts             # System preference sync (light/dark/system)
│   │   ├── useSettings.ts              # Font, theme variant, auto-run, preview delay
│   │   ├── useFocusMode.ts             # Focus mode (hides footer)
│   │   ├── useAutoSave.ts              # 30-second interval auto-save
│   │   ├── useAutoFormat.ts            # Prettier code formatting
│   │   ├── useCodeHistory.ts           # Undo/redo with snapshots + diff preview
│   │   ├── useCodeSelection.ts         # Monaco editor selection tracker
│   │   ├── useCodeWriter.ts            # Typewriter animation for streaming code
│   │   ├── useEditorActions.ts         # Per-editor: lock, copy, format
│   │   ├── useFileUpload.ts            # Drag-and-drop file processing
│   │   ├── useProgressiveLoad.ts       # 3-phase loading (Phase1/2/3)
│   │   ├── useProject.ts               # Project CRUD via projectStore
│   │   └── useSelectionOperations.ts   # AI-powered selection operations
│   │
│   ├── services/                # ─── SERVICES (26 total) ───
│   │   ├── aiChatAssistant.ts          # Gemini AI chat (sendMessage, explain, debug, refactor, generate)
│   │   ├── analytics.ts                # Google Analytics 4 wrapper
│   │   ├── autoCompleteService.ts      # Terminal auto-complete (fuzzy matching)
│   │   ├── codeMinifierService.ts      # HTML/CSS/JS minification (regex-based)
│   │   ├── codeTemplatesService.ts     # 6 basic code templates
│   │   ├── codeValidationService.ts    # Real-time linting (HTML/CSS/JS)
│   │   ├── commandHistoryService.ts    # Persistent command history (localStorage)
│   │   ├── customInjectionService.ts   # Custom CSS/JS injection manager (14 presets)
│   │   ├── debugToolsService.ts        # Debug session manager (breakpoints, call stack)
│   │   ├── enhancedTemplateService.ts  # 7 templates across 9 categories (lazy-loaded)
│   │   ├── errorLogging.ts             # Global error handler (window.error + unhandledrejection)
│   │   ├── externalLibraryService.ts   # CDN library manager (70+ libraries, 10 categories)
│   │   ├── externalToolsService.ts     # CLI/API/webhook integration
│   │   ├── formattingService.ts        # Prettier-based format with diff/changelog
│   │   ├── outputStreamingService.ts   # WebSocket/SSE/Polling streaming
│   │   ├── performanceAnalyticsService.ts # Session metrics (command count, error rate, etc.)
│   │   ├── projectStore.ts             # Project CRUD (localStorage, UUID, Supabase-compatible)
│   │   ├── screenshotService.ts        # PNG/JPEG/SVG screenshot (html-to-image)
│   │   ├── searchFilterService.ts      # Console log search/filter
│   │   ├── securityService.ts          # XSS sanitization, command validation, RBAC
│   │   ├── selectionOperationsService.ts # **STUB** — AI operations removed
│   │   ├── sessionDataService.ts       # Console session CRUD
│   │   ├── shareExportService.ts       # Share URLs, ZIP export, CodePen/JSFiddle
│   │   ├── syntaxHighlighter.ts        # Multi-language syntax highlighting (16 langs)
│   │   ├── voiceCommandService.ts      # Web Speech API (8 default commands)
│   │   └── templateService.ts          # 9 project templates (~3240 lines)
│   │
│   ├── services/templates/     # ─── LAZY TEMPLATES ───
│   │   ├── business/corporate.ts
│   │   ├── ai-agents/chatbot.ts
│   │   ├── startup/landing.ts
│   │   ├── saas/dashboard.ts
│   │   ├── ecommerce/store.ts
│   │   ├── portfolio/developer.ts
│   │   └── utility/calculator.ts
│   │
│   ├── types/                   # ─── TYPE DEFINITIONS ───
│   │   ├── index.ts                   # Core types (CodeSnippet, ConsoleLog, EditorLanguage, etc.)
│   │   ├── console.types.ts           # Console-specific types (LogLevel, SessionConfig, etc.)
│   │   ├── formatting.ts              # FormatResult, DiffResult, FormatSettings
│   │   ├── project.ts                 # Project, ProjectSettings, ProjectMetadata
│   │   └── xterm.d.ts                 # Minimal xterm Terminal types
│   │
│   ├── utils/                   # ─── UTILITIES ───
│   │   ├── analytics.ts               # GA4 gtag integration
│   │   ├── downloadUtils.ts           # ZIP/single file download
│   │   ├── monacoSelectionHelper.ts   # Monaco editor operations
│   │   ├── projectExport.ts           # Project ZIP export
│   │   ├── responsiveDesign.ts        # Responsive breakpoint service
│   │   ├── seo.ts                     # SEO config + JSON-LD structured data
│   │   └── snippetUtils.ts            # Snippet CRUD utilities
│   │
│   └── ... (components, hooks, services, types, utils)
│
├── server/                      # ─── BACKEND (Express + WebSocket) ───
│   ├── index.js                 # Single-file Express + WebSocket server (193 lines)
│   ├── package.json             # Server dependencies
│   ├── .env.example             # NVIDIA_API_KEY, MODEL, PORT
│   └── README.md                # Server documentation
│
├── api/                         # ─── VERCEL SERVERLESS ───
│   ├── ai.js                    # POST /api/ai — NVIDIA NIM proxy (314 lines)
│   └── health.js                # GET /api/health — health check
│
├── supabase/                    # ─── DATABASE ───
│   ├── migration.sql            # Full migration (310 lines, 7 tables, RLS, triggers)
│   └── schema.sql               # Complete schema (379 lines)
│
├── docs/                        # ─── DOCUMENTATION ───
│   ├── AI_FEATURES.md           # AI features (1390 lines)
│   ├── DEVELOPER_GUIDE.md       # Developer setup guide (232 lines)
│   ├── EDITOR_FEATURES.md       # Editor features (1138 lines)
│   ├── FILE_AND_LIBRARY_MANAGEMENT.md # File & library mgmt (261 lines)
│   ├── PREVIEW_AND_CONSOLE.md   # Preview & console (1377 lines)
│   ├── SNIPPET_GUIDE.md         # Snippet system (1017 lines)
│   ├── SUPABASE_DATABASE.md     # Supabase integration (810 lines)
│   ├── TERMINAL_GUIDE.md        # Terminal tech guide (1412 lines)
│   ├── VEO_VIDEO_PROMPTS.md     # Promotional video prompts (151 lines)
│   └── VERCEL_WEB_ANALYTICS.md  # Vercel Analytics guide (501 lines)
│
└── public/                      # ─── STATIC ASSETS ───
    ├── manifest.json            # PWA manifest
    ├── robots.txt               # Search engine crawling rules
    ├── sitemap.xml              # XML sitemap (10 URLs)
    └── tghjkl.jpeg              # OG image / screenshot
```

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Component Hierarchy

```
<App> (main orchestrator — 1343 lines)
├── <NavigationBar>
│     Fixed top bar with: Run, Save, Import/Export, Undo/Redo, Settings,
│     AI Chat toggle, Voice Commands, Templates, Stats, Validation,
│     Custom Injection, Export/Share menu, Theme toggle, Hamburger menu
│
├── [Main Editor View]
│   ├── Left Panel (grid-cols-1 on mobile, grid-cols-2 on desktop)
│   │   ├── <EditorPanel language="html">
│   │   │     └── <CodeEditor />  (Monaco, vs-dark, no minimap)
│   │   ├── <EditorPanel language="css">
│   │   │     └── <CodeEditor />
│   │   └── <EditorPanel language="javascript">
│   │         └── <CodeEditor />
│   │
│   └── Right Panel
│       └── <TabbedRightPanel>
│             ├── Tab: "Live Preview" → <PreviewPanel> (sandboxed iframe)
│             └── Tab: "Console" → <EnhancedConsole>
│                   ├── Console mode (log viewer)
│                   ├── Validator mode (HTML/CSS/JS lint)
│                   ├── Preview mode (execution sandbox)
│                   └── Terminal mode (<TerminalConsolePanel> → <TerminalView>)
│
├── <Footer /> (hides in focus mode)
│
├── Modals & Sidebars:
│   ├── <AIChatAssistant />         — Gemini chat modal
│   ├── <ExportShareMenu />          — Export/share dropdown
│   ├── <VoiceCommandPanel />        — Voice commands modal
│   ├── <TemplateSelectorModal />    — Template browser (9 categories)
│   ├── <CodeStatsDashboard />       — Code statistics modal
│   ├── <ValidationPanel />          — Validation results modal
│   ├── <CustomInjectionManager />   — CSS/JS injection manager
│   ├── <SnippetsSidebar />          — Code snippet manager
│   ├── <ExternalLibraryManager />   — CDN library manager
│   ├── <ExtensionsMarketplace />    — Extensions browser
│   ├── <SettingsModal />            — Editor settings
│   ├── <KeyboardShortcutsHelp />    — Keyboard shortcuts
│   ├── <HistoryPanel />             — Undo/redo history
│   ├── <SelectionToolbar />         — Floating AI operation toolbar
│   └── <SelectionSidebar />         — AI operation results
│
├── Legal Pages (conditional on currentView):
│   ├── <AboutPage />
│   ├── <DocumentationPage />
│   ├── <CodeHistoryPage />
│   ├── <PrivacyPolicyPage />
│   ├── <TermsOfServicePage />
│   ├── <CookiePolicyPage />
│   ├── <DisclaimerPage />
│   └── <ContactPage />
│
└── <Toaster /> (react-hot-toast notifications)
```

### 4.2 State Management Approach

**Zero external state management libraries.** All state is managed through:

1. **React useState** — UI state (modals open/closed, current view, code values)
2. **Custom hooks backed by useLocalStorage** — Persistent state (settings, theme, projects, snippets)
3. **Singleton Services** — Business logic (CRUD operations, API calls, AI interactions)
4. **CustomEvent dispatching on window** — Cross-component communication:
   - `navigate-to-about`, `navigate-to-documentation`, etc. — navigation
   - `voice-command` — voice command execution
   - `autosave` — auto-save completion
   - `code-formatted` — format completion
   - `local-storage-change` — cross-tab sync
   - `external-libraries-updated` — library update notification

### 4.3 App.tsx State (Key Variables)

| Variable | Type | Purpose |
|---|---|---|
| `html`, `css`, `javascript` | string | Current code in editors |
| `currentView` | 'editor'\|'history'\|'about'\|'documentation'\|... | Page navigation |
| `consoleLogs` | ConsoleLog[] | Console log entries |
| `snippets` | CodeSnippet[] | Saved code snippets |
| `externalLibraries` | ExternalLibrary[] | Active CDN libraries |
| `showAIChat`, `showVoiceCommands`, etc. | boolean | Modal visibility flags |
| `customInjectionCode` | { css, js } | Custom CSS/JS injections |
| `formatLoadingStates` | Record<EditorLanguage, boolean> | Format button loading states |

### 4.4 Progressive Loading (3 Phases)

```
Phase 1 (immediate):   NavigationBar, EditorPanel (×3), TabbedRightPanel, Footer
Phase 2 (100ms):       EnhancedConsole (lazy)
Phase 3 (500ms):       SnippetsSidebar, SettingsModal, ExternalLibraryManager,
                       HistoryPanel, ExtensionsMarketplace, KeyboardShortcutsHelp,
                       ALL legal pages, project/library/snippet initialization
```

### 4.5 Navigation System

No React Router. Navigation via `currentView` string state:
- `'editor'` — Main editor interface (default)
- `'history'` — Code history page
- `'about'`, `'documentation'`, `'privacy'`, `'terms'`, `'cookies'`, `'disclaimer'`, `'contact'` — Legal/info pages
- Navigation via dispatch of CustomEvents on window object

### 4.6 Key Data Flow

```
User types code → Monaco Editor → onChange → setHtml/setCss/setJavascript
                                    ↓
                            useEffect (syncs to project)
                                    ↓
                            PreviewPanel (debounced 300ms)
                                    ↓
                            iframe srcdoc update
                                    ↓
                            Console interception (postMessage)
                                    ↓
                            EnhancedConsole display
```

---

## 5. SERVICES DEEP DIVE

### 5.1 Pattern
All services are **singletons** exported at module level. Some use explicit `getInstance()` (lazy init), most use `new Class()` at module level (eager init). Services are stateful, persist across app lifecycle, and back their state to localStorage.

### 5.2 AI Integration

**Two AI pathways:**

| Pathway | Provider | Model | Location | Features |
|---|---|---|---|---|
| Frontend (client-side) | Google Gemini | gemini-pro | aiChatAssistant.ts | Chat, explainCode, debugCode, refactorCode, generateCode |
| Backend (serverless) | NVIDIA NIM | qwen/qwen3.5-397b-a17b | api/ai.js | improve, explain, fix, optimize, enhance, suggest, chat (streaming) |

**selectionOperationsService.ts** is currently a **stub** — all operations return "AI features have been removed."

### 5.3 Key Services

| Service | Storage | Purpose |
|---|---|---|
| aiChatAssistant | In-memory (messageHistory) | Gemini AI chat, code explanation/debugging/refactoring/generation |
| projectStore | localStorage ('gb-coder-projects', 'gb-coder-active-project') | Full project CRUD with UUID (Supabase-compatible) |
| externalLibraryService | localStorage ('gb-coder-external-libraries') | Manages 70+ CDN libraries across 10 categories |
| formattingService | In-memory (settings) | Prettier formatting for HTML/CSS/JS with diff generation |
| shareExportService | In-memory | Shareable URLs (base64), ZIP export, CodePen/JSFiddle export |
| customInjectionService | localStorage ('gb-coder-custom-injections') | Custom CSS/JS with 14 preset injections |
| enhancedTemplateService | Static imports (lazy) | 7 templates across 9 categories with metadata-first loading |
| codeValidationService | In-memory | Real-time HTML/CSS/JS linting with quality scoring |
| commandHistoryService | localStorage + sessionStorage | Persistent command history (max 1000 entries) |
| debugToolsService | In-memory (session) | Breakpoints, call stack, variables, error suggestions |
| voiceCommandService | Web Speech API (in-memory) | 8 default voice commands with custom registration |
| securityService | localStorage ('console-security-config') | XSS sanitization, command validation, RBAC |

### 5.4 localStorage Keys

```
gb-coder-autosave                    — Auto-saved code state
gb-coder-project-autosave-{id}       — Project-specific auto-save
gb-coder-settings                    — Editor settings
gb-coder-theme                       — Theme preference
gb-coder-theme-mode                  — Theme variant (dark/dark-blue/dark-purple/light)
gb-coder-focus-mode                  — Focus mode boolean
gb-coder-snippets                    — Saved code snippets
gb-coder-projects                    — All projects
gb-coder-active-project              — Current project ID
gb-coder-custom-injections           — Custom CSS/JS injections
gb-coder-external-libraries          — Active CDN libraries
gb-coder-format-settings             — Formatting preferences
gb-coder-format-history              — Format history
gb-coder-error-logs                  — Error log entries (max 50)
console-current-session              — Current console session
console-saved-sessions               — Saved console sessions
console-command-history              — Terminal command history
console-session-history              — Session history
console-security-config              — Security configuration
console-audit-log                    — Audit log entries
console-analytics-events             — Analytics events
```

---

## 6. BACKEND ARCHITECTURE

### 6.1 Express + WebSocket Server (server/index.js)

A single-file server providing terminal proxy functionality.

**HTTP Endpoints:**
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Root health check |
| GET | `/api/health` | Health check endpoint |

**WebSocket Endpoint:**
| Path | Protocol | Purpose |
|---|---|---|
| `/terminal` | JSON messages | PTY proxy for xterm.js |

**WebSocket Protocol:**
```
Client → Server:
  { type: "input", data: "string" }    — keystrokes to PTY
  { type: "resize", cols: 80, rows: 24 } — terminal resize

Server → Client:
  { type: "data", data: "string" }     — PTY output
  { type: "exit", exitCode: 0, signal: null } — process exited
```

**Architecture:**
```
[xterm.js (browser)] ←→ [WebSocket ws://localhost:3001/terminal]
        ↓                              ↑
  [TerminalView.tsx]          [server/index.js]
                                    ↓
                              [node-pty PTY]
                                    ↓
                            [Shell (powershell/cmd/bash)]
```

**Security Note:** No authentication. Designed for local development only. README explicitly warns against exposing publicly.

### 6.2 Vercel Serverless Functions

**api/ai.js** — POST /api/ai
- NVIDIA NIM API proxy
- Supports 7 features: improve, explain, fix, optimize, enhance, suggest (non-streaming), chat (streaming SSE)
- Rate limiting: 30 req/min per IP (in-memory)
- Model: qwen/qwen3.5-397b-a17b (configurable)
- System prompt: "Code Buddy" AI assistant, strict rules about not generating unsolicited code

**api/health.js** — GET /api/health
- Returns `{ status: 'ok', ai: boolean, model: string }`

### 6.3 Vite Proxy Configuration

```
Development:
  /api/*  →  http://localhost:3001  (Vite proxy)

Production (Vercel):
  /api/ai    →  api/ai.js (serverless)
  /api/health →  api/health.js (serverless)
```

---

## 7. DATABASE SCHEMA (Supabase)

7 tables with Row Level Security, UUID primary keys, and soft deletion:

| Table | Key Columns | Purpose |
|---|---|---|
| profiles | id (FK auth.users), username, full_name, avatar_url, bio | User profiles |
| projects | id, user_id, name, html, css, javascript, external_libraries (JSONB), settings (JSONB), deleted_at | User projects |
| project_snapshots | id, project_id (FK), html, css, javascript, label, snapshot_type | Version history |
| snippets | id, user_id, name, html, css, javascript, category, tags (TEXT[]), snippet_type, scope, deleted_at | Code snippets |
| ai_conversations | id, user_id, project_id (FK), title, summary, deleted_at | AI chat sessions |
| ai_messages | id, conversation_id (FK CASCADE), role, content, code_blocks (JSONB), attachments (JSONB), model, tokens_used | AI chat messages |
| user_settings | user_id (PK), editor_font_family, editor_font_size, theme, auto_run_js, preview_delay, ai_model | User preferences |

Triggers: `update_updated_at_column()` on all tables, `handle_new_user()` to auto-create profile + settings.

---

## 8. KEY FEATURES

### 8.1 Code Editor
- 3 Monaco Editor panels (HTML/CSS/JS) with drag-and-drop file import
- VS Dark theme, customizable font/font size, minimap disabled
- Lock/unlock, copy, format per panel
- Collapsible panels
- Auto-save every 30 seconds (project-aware)
- Undo/redo with snapshot history and diff preview

### 8.2 Live Preview
- Sandboxed iframe (`allow-scripts allow-same-origin`)
- Responsive view modes: desktop, tablet (768px), mobile (375px), fullscreen
- XSS sanitization (script removal, event handler stripping, CSS expression blocking)
- Console interception via postMessage
- Runtime error capture with 5-second execution timeout
- External library injection (CSS links + JS scripts)
- Custom injection support (user-defined CSS/JS)
- Debounced updates (configurable 300ms default)

### 8.3 Enhanced Console (4 modes)
- **Console Mode:** Real-time log viewer with type filtering (log/error/warn/info), timestamps, copy
- **Validator Mode:** Static analysis for HTML (tag matching, accessibility, deprecated tags), CSS (brace matching, vendor prefixes), JS (syntax checking, var detection, == vs ===)
- **Preview Mode:** Hidden iframe execution with console interception, performance metrics (load time, memory, DOM nodes), network monitoring (fetch wrapping)
- **Terminal Mode:** xterm.js with WebSocket connection to backend PTY, auto-reconnect (3s), resize handling, tab management

### 8.4 AI Chat Assistant
- Google Gemini AI (gemini-pro) via client-side API key
- Code-aware context (current HTML/CSS/JS) toggleable
- Features: sendMessage, explainCode, debugCode, refactorCode, generateCode
- Markdown-ish rendering (bold, inline code, fenced code blocks with copy)
- Suggestion buttons for quick prompts
- Session-based chat history

### 8.5 AI Operations (via serverless)
- POST /api/ai with NVIDIA NIM
- Features: improve, explain, fix, optimize, enhance, suggest, chat (streaming)
- Rate limited: 30 req/min per IP
- **selectionOperationsService is currently a stub**

### 8.6 Project Management
- Full CRUD via localStorage (UUID-based, Supabase-compatible)
- Create, save, duplicate, switch, rename, delete projects
- Auto-save per project
- Project metadata: name, code (html/css/js), external libraries, settings, timestamps

### 8.7 External Library Manager
- 70+ popular CDN libraries across 10 categories
- Categories: CSS Frameworks, JS Frameworks, Animation, UI Components, Icons, Charts, Utility, Forms, State Management, Miscellaneous
- Auto-injection into preview iframe
- Import/export for backup

### 8.8 Code Templates
- 7 lazy-loaded templates: Corporate Business, AI Chatbot, Startup Landing, SaaS Dashboard, E-commerce Store, Portfolio Developer, Utility Calculator
- 9 categories: business, ai-agents, startup, saas, ecommerce, portfolio, landing, dashboard, utility
- Filterable by category, difficulty (beginner/intermediate/advanced), search
- Metadata-first loading (only IDs/descriptions on mount, code loads on demand)

### 8.9 Export & Share
- Shareable URLs (base64-compressed code)
- ZIP export (index.html + style.css + script.js + README.md)
- Single HTML export
- Clipboard copy
- CodePen export (form POST)
- JSFiddle export (form POST)
- Screenshot capture (PNG/JPEG/SVG)

### 8.10 Voice Commands
- Web Speech API integration
- 8 default commands: run, clear, format, toggle-theme, copy, download, help, stop
- Custom command registration
- Dispatches CustomEvent('voice-command')

### 8.11 Validation
- Real-time HTML linting (tag matching, accessibility attributes, deprecated tags)
- CSS validation (brace matching, vendor prefixes, !important detection)
- JS validation (syntax checking, var/==/debugger/eval detection)
- Quality scoring

### 8.12 Custom Injection
- 14 preset injections: CSS Reset, Smooth Scroll, Debug Layout, Bounce/Fade animations, Console Timer, Error Handler, Click Ripple, Keyboard Shortcuts, Lazy Images, Skip Links
- User-defined custom injections
- Combined injection generation

### 8.13 Code Statistics
- Line counts (html/css/js)
- Character counts
- Total lines and characters

### 8.14 PWA Support
- Service worker with workbox (vite-plugin-pwa)
- Caching: Google Fonts (CacheFirst, 1yr), CDN libraries (StaleWhileRevalidate, 7d), images (CacheFirst, 30d)
- Manifest with standalone display, shortcuts

---

## 9. CONFIGURATION

### 9.1 Environment Variables (.env)

**Required:**
```
VITE_GEMINI_API_KEY=       # Google Gemini API key (for AI Chat Assistant)
```

**Optional Feature Flags:**
```
VITE_ENABLE_AI_SUGGESTIONS=true    # Enable AI suggestions
VITE_ENABLE_EXTERNAL_LIBRARIES=true # Enable external libraries
```

**Optional Development:**
```
VITE_DEV_PORT=5173
```

**Optional Analytics:**
```
VITE_GA4_MEASUREMENT_ID=           # Google Analytics 4
VITE_VERCEL_ANALYTICS_ID=          # Vercel Analytics
```

**Server (.env in server/):**
```
NVIDIA_API_KEY=                    # NVIDIA NIM API key (for serverless AI)
NVIDIA_MODEL=qwen/qwen3.5-397b-a17b
PORT=3001
```

### 9.2 Vite Build Configuration
- Manual chunk splitting: monaco-editor, react-core, ui-icons, analytics, http-client, compression, diff-tools, terminal, formatter, critical-ui, deferred-components
- esbuild: drops console + debugger in production
- PWA with auto-update registration
- Proxy /api to localhost:3001 in development

---

## 10. DEPLOYMENT

**Platform:** Vercel
**Framework preset:** Vite
**Build command:** `npm run build`
**Output directory:** `dist`
**Serverless functions:** `api/ai.js` (maxDuration: 120s), `api/health.js`
**Rewrites:** `/api/ai` → `/api/ai`, `/api/health` → `/api/health`

The server/ directory is **not** deployed to Vercel (it requires a persistent Node.js process for WebSocket + PTY). It runs separately for terminal functionality.

---

## 11. KNOWN ISSUES & STUBS

1. **selectionOperationsService.ts** — All AI operations return "AI features have been removed." Need reconnection to actual AI backend.
2. **express-rate-limit** — Listed as dependency but never imported/used in server/index.js
3. **axios** — Listed as server dependency but used only in api/ai.js (serverless), not in server/index.js
4. **Session IDs** in server are timestamps (predictable, could collide)
5. **No authentication** on WebSocket terminal
6. **Supabase integration** — Schema and migration exist but frontend still uses localStorage only (migration to Supabase not yet implemented)

---

## 12. SCRIPTS

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run dev:server` | Start backend server only |
| `npm run dev:all` | Start both Vite + server (concurrently) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Vite preview server |
| `npm run vercel-build` | Vercel build command |
