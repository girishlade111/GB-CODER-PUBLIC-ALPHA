All checks confirmed. Generating full PRD now — NVIDIA NIM free models noted throughout. 🚀````markdown

```markdown
# LadeStack Coder (code.ladestack.in) — Feature Sprint PRD

> AI-ready document. Paste directly into Claude Code, Cursor, or any AI coding tool.
> Author: Girish Lade | Brand: LadeStack | Date: May 2026

---

## 1. Product Overview

LadeStack Coder is an AI-first, browser-based HTML/CSS/JavaScript code playground
available at code.ladestack.in. It is built with React 18, TypeScript, Vite, Tailwind
CSS, and Monaco Editor. The app already has a working live preview, integrated terminal
(via WebSocket + node-pty), AI chat assistant (Google Gemini), and an NVIDIA NIM
serverless AI proxy at /api/ai. It is deployed on Vercel.

This PRD does NOT describe building the app from scratch. It describes a prioritized
feature sprint to add AI-first capabilities, language expansion, and sharing features
that transform the product from a capable but generic playground into the only
browser-based code editor with Cursor-style inline AI editing and build-from-prompt
functionality.

The target users are desktop developers, students, and casual coders globally who
currently use CodePen, JSFiddle, or StackBlitz. The positioning is: "The AI-native
CodePen alternative — write less, build more, in your browser."

---

## 2. Current State (What Already Exists)

Do NOT rebuild any of the following. They are already working:

- Three Monaco Editor panels: HTML, CSS, JavaScript with VS Dark theme
- Live preview in a sandboxed iframe with debounced 300ms updates
- Console with 4 modes: Console, Validator, Preview, Terminal
- AI Chat Assistant using Google Gemini (gemini-pro) via client-side API key
- NVIDIA NIM serverless proxy at /api/ai supporting: improve, explain, fix, optimize,
  enhance, suggest (non-streaming) and chat (streaming SSE)
- 70+ external CDN library manager
- Export as ZIP, single HTML, CodePen export, JSFiddle export
- Shareable URLs via base64 compression
- Project management via localStorage (UUID-based, Supabase-compatible)
- Screenshot capture (PNG/JPEG/SVG)
- Voice commands via Web Speech API
- Code validation (HTML/CSS/JS linting)
- Custom CSS/JS injection with 14 presets
- 7 lazy-loaded templates across 9 categories
- PWA support with service worker

Known broken/stub (MUST fix before new features):

- selectionOperationsService.ts: ALL AI selection operations return the string
  "AI features have been removed." This is a stub. The /api/ai endpoint exists
  and works — the stub just needs to be reconnected.

---

## 3. What This Sprint Builds (Scope)

### P0 — Fix First (Days 1–5)

These must be completed before any Sprint 1 work begins.

### Sprint 1 — Ship in Weeks 1–3

Core differentiating features that justify the "AI-first playground" positioning.

### Sprint 2 — Ship in Weeks 4–7

Features that increase retention, enable sharing, and deepen the AI experience.

### Out of Scope for This Sprint

- Supabase auth and cloud sync (planned for Sprint 3 — do not touch)
- Mobile responsive layout improvements
- Real-time multiplayer collaboration (Google Docs style)
- Payment integration or pro tier
- Backend WebSocket server changes

---

## 4. P0 — Fix Existing Broken Features

### P0-A: Restore selectionOperationsService.ts

**What it does:**
This service handles AI operations triggered when a user selects code in Monaco Editor.
Operations include: improve, explain, fix, optimize, enhance, suggest.

**Current broken state:**
The file at src/services/selectionOperationsService.ts returns a hardcoded stub string
"AI features have been removed." for every operation. The service is connected to
SelectionToolbar.tsx and SelectionSidebar.tsx components which are already rendered
in App.tsx.

**What needs to happen:**
Reconnect selectionOperationsService.ts to the existing /api/ai endpoint (api/ai.js).
The endpoint already handles POST requests with { feature, code, language, context }.
The service should call this endpoint for each operation type, handle the response,
and return the result to SelectionSidebar.tsx for display.

For the development phase, use only NVIDIA NIM free models. The model is configured
via the NVIDIA_MODEL environment variable in server/.env. Use a free model such as
meta/llama-3.1-8b-instruct or nvidia/llama-3.1-nemotron-nano-8b-v1 during development.
When the production build is ready, switch to a paid model like qwen/qwen3.5-397b-a17b.

**Each operation behavior:**

- improve: Takes selected code, returns an improved version with explanation of changes
- explain: Takes selected code, returns a plain English explanation of what it does
- fix: Takes selected code + any console errors, returns fixed code with diff
- optimize: Takes selected code, returns performance-optimized version
- enhance: Takes selected code, returns version with better readability and practices
- suggest: Takes selected code, returns 3 specific suggestions without rewriting

**User experience:**

1. User selects code in any Monaco Editor panel
2. SelectionToolbar appears (already implemented) with operation buttons
3. User clicks an operation button
4. SelectionSidebar opens (already implemented) showing loading state
5. /api/ai is called with the selected code and operation type
6. Result appears in SelectionSidebar with copy and apply buttons
7. If "Apply" is clicked, the selected code in the editor is replaced with AI output

**Error handling:**
If /api/ai returns an error, show a friendly message in SelectionSidebar:
"AI is temporarily unavailable. Please try again." Do not show raw error objects.

**Rate limit awareness:**
/api/ai already has 30 requests/minute per IP rate limiting built in. If the rate limit
is hit, show: "You're going too fast — wait a moment and try again."

---

### P0-B: TypeScript and JSX Language Support

**What it does:**
Adds TypeScript (.ts) and React JSX (.jsx/.tsx) as selectable languages in the
JavaScript editor panel. This is the most commonly requested feature by developers
and a known weakness of CodePen.

**TypeScript support:**
Monaco Editor already supports TypeScript as a language. Change the JavaScript panel
to allow switching between "javascript" and "typescript" via a language toggle button
in the EditorPanel header (next to the existing "JAVASCRIPT" badge).

When TypeScript is selected:

- Monaco language switches to "typescript"
- Before injecting into the preview iframe, transpile using the TypeScript compiler
  that Monaco Editor already bundles (monaco.languages.typescript)
- Transpiled JavaScript is what gets injected into the iframe, not the raw TypeScript
- Show TypeScript errors as red squiggles in Monaco (Monaco handles this natively)

**JSX support:**
When the user selects JSX mode:

- Monaco language switches to "javascript" with JSX dialect enabled
- Load @babel/standalone from CDN (already available via the external library manager
  pattern the app uses — add it as an auto-injected library when JSX mode is active)
- Before iframe injection, transpile JSX using Babel.transform() with the react preset
- Automatically inject React and ReactDOM from CDN into the preview iframe head when
  JSX mode is active, unless they are already in the user's external libraries

**Language selector UI:**
In the JavaScript EditorPanel header, add a small dropdown next to the "JAVASCRIPT"
badge. Options: JavaScript (default), TypeScript, JSX, TSX.
The badge label updates to match the selected language.

**Persistence:**
Save the selected language mode per project in the existing project settings object
stored in localStorage under gb-coder-projects.

---

## 5. Sprint 1 Features

### Feature 1: Build from Prompt

**What it does:**
A user types a natural language description of what they want to build — for example,
"make a glassmorphism login form with animated gradient background" — and the AI
generates complete, production-quality HTML, CSS, and JavaScript that instantly
populates all three editor panels and renders in the live preview.

**Why it exists:**
This is the primary differentiating feature of LadeStack Coder. No existing browser
playground (CodePen, JSFiddle, StackBlitz, CodeSandbox) has this capability. This
single feature justifies the "AI-first playground" positioning and is the #1 demo-able
moment for SEO content, YouTube videos, and ProductHunt launch.

**Entry point:**
Add a prominent "Build with AI" button to the NavigationBar, positioned between the
Run button and the AI Chat toggle button. Use a sparkle/wand icon (already available
via lucide-react). The button should be visually distinct — use a gradient or accent
color to make it stand out from other toolbar buttons.

**How it works — step by step:**

Step 1: User clicks "Build with AI" button.

Step 2: A modal opens. It contains:

- A large textarea with placeholder text: "Describe what you want to build...
  Example: A dark mode todo app with local storage and smooth animations"
- A "Generate" button
- Below the textarea, 6 quick-start prompt chips the user can click to auto-fill
  the textarea. Suggested chips: "Login form with glassmorphism", "Dark mode todo app",
  "CSS animation showcase", "Product landing page", "Interactive calculator",
  "Portfolio hero section"
- A small note at the bottom: "AI will replace your current code. Your project is
  auto-saved before generation."

Step 3: User types or selects a prompt and clicks Generate.

Step 4: Auto-save the current project state immediately (call the existing auto-save
logic) before making any changes.

Step 5: Call /api/ai with:

- feature: "generate"
- The user's prompt as the message content
- A system instruction that tells the AI to return ONLY a JSON object with three
  keys: html, css, javascript. Each value is a string containing the complete code
  for that panel. No markdown, no explanation, no backticks — only raw JSON.
- For development, use NVIDIA NIM free model (meta/llama-3.1-8b-instruct or similar).
  For production, switch to a more capable model.

Step 6: While waiting for the response, show a loading state inside the modal with
animated text cycling through messages like: "Thinking...", "Writing HTML...",
"Styling it up...", "Adding interactivity..."

Step 7: When the response arrives, parse the JSON. If parsing fails, show an error
in the modal: "Generation failed — try rephrasing your prompt." with a Retry button.

Step 8: Close the modal. Populate the three editor panels using the existing
setHtml, setCss, setJavascript state setters in App.tsx. Use the existing
useCodeWriter hook (typewriter animation) to animate the code appearing in each
panel sequentially: HTML first, then CSS, then JavaScript, each starting when the
previous one finishes.

Step 9: The live preview auto-updates because the existing debounced iframe injection
already watches for code changes.

Step 10: Show a toast notification: "Built from prompt! Edit freely or generate again."

**AI model configuration for this feature:**
During development: Use a free NVIDIA NIM model. The model name goes in server/.env
as NVIDIA_MODEL. Do not hardcode the model name — always read from environment variable.
During production: The NVIDIA_MODEL env variable will be updated to a paid model by
the developer. No code changes needed — only the env variable changes.

**Prompt engineering for quality output:**
The system prompt sent to /api/ai for this feature must instruct the model to:

- Generate complete, self-contained code (no external dependencies unless specified)
- Use modern CSS (custom properties, flexbox/grid, no floats)
- Write clean, readable JavaScript (const/let, arrow functions, no var)
- Include hover states, transitions, and at least basic responsiveness
- Return ONLY the JSON object — no preamble, no explanation, no markdown formatting

**Edge cases:**

- If the user's prompt is less than 10 characters, disable the Generate button and
  show: "Please describe what you want to build in more detail."
- If generation takes more than 30 seconds, show a timeout message with a retry option.
- If the generated JSON has empty values for any panel, fill that panel with a
  comment: /_ AI did not generate content for this panel _/

---

### Feature 2: Live Preview Share (Read-Only Link)

**What it does:**
Generates a unique shareable URL that displays only the live preview output of the
current pen — no editors, no toolbar, just the rendered result in full screen.
Anyone with the link can view it without logging in or having an account.

**Why it exists:**
This is the primary viral distribution mechanism for LadeStack Coder. When a developer
builds something cool (especially using Build from Prompt), they will share it. Every
shared link is a backlink opportunity and a new user acquisition path. This is how
CodePen grew its community. This feature also directly enables the SEO content strategy
— each shareable pen can be embedded on blog posts and landing pages.

**How it works:**

Method: URL-encoded (no backend needed for Sprint 1)
The current app already has base64 URL sharing in shareExportService.ts. Extend this
to generate a /preview?code=BASE64_STRING route.

Step 1: Add a "Share Preview" button to the ExportShareMenu component. Use a link/share
icon from lucide-react.

Step 2: When clicked, take the current html, css, and javascript values, combine them
into the existing base64 compression format already used by shareExportService.ts.

Step 3: Generate a URL: https://code.ladestack.in/preview?p=ENCODED_STRING

Step 4: Copy the URL to clipboard. Show a toast: "Preview link copied! Share it anywhere."

Step 5: Create a new route handler for /preview in the app. When this route is accessed:

- Parse the p query parameter
- Decode the base64 content
- Render a minimal full-screen iframe with the decoded HTML/CSS/JS combined
- No navigation bar, no editors, no branding except a small "Built with LadeStack Coder"
  watermark in the bottom-right corner that links back to code.ladestack.in
- The page title should be "Live Preview — LadeStack Coder"
- Add Open Graph meta tags so when shared on Twitter/X/LinkedIn it shows a meaningful
  preview card

**Route implementation:**
Since the app uses currentView string state (no React Router), add a special case:
If the URL contains /preview?p= on page load, detect it in App.tsx or AppWrapper.tsx
using window.location, decode the parameter, and render the preview-only view instead
of the normal editor view.

**URL length concern:**
Base64 encoded code can be very long. For Sprint 1, this is acceptable — most URLs
work fine up to 8000 characters. In Sprint 3 when Supabase is connected, replace
with short database-stored IDs (e.g., code.ladestack.in/p/abc123).

---

## 6. Sprint 2 Features

### Feature 3: Cursor-Style Inline AI Editing (Ctrl+K)

**What it does:**
When a user selects code in any Monaco Editor panel and presses Ctrl+K (or Cmd+K on
Mac), a floating AI prompt box appears anchored near the selection. The user types a
natural language instruction like "add hover animation" or "convert to dark mode" or
"refactor to use CSS variables". The AI rewrites only the selected code according to
the instruction. A diff overlay shows the before/after changes. The user can Accept
(replaces selection with new code) or Reject (keeps original).

**Why it exists:**
This is the feature that makes developers say "this is better than CodePen." It is
the exact UX that made Cursor the dominant AI code editor. No browser playground has
this today. This feature is the second most demo-able capability after Build from
Prompt and will be the primary retention driver for professional developers.

**How it works:**

Step 1: User selects code in a Monaco Editor panel. The existing SelectionToolbar
already appears for selected code. Add a new "Edit with AI" button to SelectionToolbar
that also responds to the Ctrl+K keyboard shortcut when an editor panel is focused.

Step 2: A floating input box appears near the selected code (anchored to the Monaco
editor position of the selection, not a modal). The box contains:

- A single-line text input with placeholder: "Tell AI what to change..."
- A small submit button (arrow icon)
- ESC to dismiss without changes

Step 3: User types the instruction and presses Enter or clicks submit.

Step 4: Call /api/ai with:

- feature: "inline-edit" (new feature type — add handler in api/ai.js)
- The selected code as context
- The user's instruction
- The language (html, css, or javascript)
- System instruction: Return ONLY the rewritten code. No explanation. No markdown.
  Replace the selection exactly — preserve indentation of the surrounding context.
- Use NVIDIA NIM free model in development. Production uses paid model via env variable.

Step 5: While waiting, show a subtle loading indicator inside the floating input box.
Dim the selected code in the editor slightly to indicate it is being processed.

Step 6: When response arrives, use Monaco's existing decoration/diff API to show:

- Original code in red (strike-through or red background highlight)
- New code in green (green background highlight)
- Two buttons appear below the diff: "Accept" (checkmark icon) and "Reject" (X icon)

Step 7: If Accept: replace the selected range with the new code using Monaco's
executeEdits API. Remove the diff decorations. Show toast: "Changes applied."
If Reject: remove decorations, restore original selection. No changes made.

Step 8: After accept/reject, the floating input box disappears.

**Keyboard shortcuts:**

- Ctrl+K (Cmd+K on Mac): Open inline AI input for current selection
- Enter: Submit instruction
- ESC: Dismiss without changes
- Tab: Accept suggestion (same as Accept button)

**Edge cases:**

- If nothing is selected when Ctrl+K is pressed, show a brief tooltip on the editor:
  "Select code first, then press Ctrl+K"
- If the AI returns code that is clearly malformed (fails basic syntax check using
  the existing codeValidationService), show a warning: "AI output may have issues —
  review before applying" but still allow the user to accept it.

---

### Feature 4: Fork and Share (Async Collaboration)

**What it does:**
When a user views a shared preview link (from Feature 2), they see an "Open in Editor"
button in the watermark area. Clicking this opens the full LadeStack Coder editor
pre-populated with the shared code. This is effectively a "fork" — the user gets their
own copy to edit without affecting the original. No accounts required.

**Why it exists:**
This completes the sharing loop. Share a preview → viewer forks it → edits it →
shares their version. This is how CodePen's community grew. Each fork is a new
session with new code — no real-time sync, no complex architecture. It leverages the
base64 URL system from Feature 2 with zero new infrastructure.

**How it works:**

Step 1: On the /preview route (built in Feature 2), add an "Open in Editor" button
inside the LadeStack Coder watermark in the bottom-right corner.

Step 2: When clicked, navigate to the main editor URL with the same encoded code
parameter: https://code.ladestack.in/?fork=ENCODED_STRING

Step 3: In App.tsx initialization logic, check if window.location contains a fork
parameter on load. If it does:

- Decode the parameter (same base64 format as share URLs)
- Pre-populate the html, css, javascript state with the decoded values
- Show a toast: "Forked! This is your own copy — edit freely."
- Do NOT auto-save this as a named project. The user can manually save it using the
  existing project save flow if they want to keep it.

Step 4: The user is now editing their own fork with no connection to the original.

---

## 7. AI Model Configuration (Critical)

This is a hard constraint that applies to ALL AI features in this sprint.

**Development phase (current):**
All calls to /api/ai must use a free NVIDIA NIM model. The model is read from the
NVIDIA_MODEL environment variable in server/.env. Set this to a free model such as:

- meta/llama-3.1-8b-instruct
- nvidia/llama-3.1-nemotron-nano-8b-v1
- mistralai/mistral-7b-instruct-v0.3

Never hardcode the model name anywhere in the codebase. Always read from
process.env.NVIDIA_MODEL in api/ai.js.

**Production phase (later):**
When the developer decides the app is ready for production, they will update the
NVIDIA_MODEL environment variable in Vercel dashboard to a paid, more capable model.
No code changes will be needed. This is the only switch that happens.

**Why this matters:**
Free models have lower quality output, especially for complex code generation. During
development and testing, this is acceptable. The Build from Prompt and Inline Edit
features may produce lower quality results in development — this is expected behavior,
not a bug.

**Rate limiting:**
The existing 30 requests/minute per IP rate limit in api/ai.js stays as-is. Do not
increase it during development. For Build from Prompt specifically, add a client-side
cooldown of 5 seconds between consecutive generations to avoid accidental spam.

---

## 8. SEO Implementation (Parallel to Sprint 1)

Do this in parallel with Sprint 1 — not after. These tasks do not conflict with
feature development and are critical for traffic.

**Problem:** LadeStack Coder is a Vite CSR (client-side rendered) React app. Google
has difficulty crawling and indexing CSR apps. Without static HTML, the app will not
rank for any keywords even if the features are excellent.

**Solution: Static landing pages**
Create 5 standalone static HTML pages that live at these URLs:

- /codepen-alternative
- /ai-code-playground
- /online-html-css-editor
- /build-website-from-prompt
- /online-javascript-editor

Each page must:

- Be actual static HTML (not React-rendered) so Google can crawl it immediately
- Include the target keyword in the H1, meta title, meta description, and first paragraph
- Embed a live LadeStack Coder iframe showing a relevant demo pen
- Have a prominent CTA button: "Try it free — no signup needed"
- Be linked from the main app footer and About page

**Meta tags for the main app (index.html):**
The existing index.html is already 967 lines and has SEO optimization. Verify and
update these specific tags:

- Title: "LadeStack Coder — AI Code Playground | CodePen Alternative"
- Meta description: "The only browser-based code playground with AI. Build from
  prompt, edit inline with AI, and share live previews. Free. No signup needed."
- Add structured data (JSON-LD) for SoftwareApplication schema
- Ensure Open Graph tags are correct for the preview share URLs from Feature 2

---

## 9. User Flows

### Flow 1: First-Time User (Build from Prompt)

1. User arrives at code.ladestack.in from Google search "AI code playground"
2. Sees the editor with empty panels and the prominent "Build with AI" button in navbar
3. Clicks "Build with AI"
4. Modal opens — user clicks the "Login form with glassmorphism" quick-start chip
5. Clicks Generate
6. Watches code appear in all three panels with typewriter animation (5–8 seconds)
7. Sees the live preview render the glassmorphism login form
8. Immediately understands the product value — no tutorial needed
9. Starts editing the code manually or generates something else

### Flow 2: Developer Uses Inline AI Edit

1. Developer has written CSS manually in the CSS panel
2. Selects a CSS block for a button
3. Presses Ctrl+K
4. Types: "add a glowing neon border on hover"
5. Sees the diff overlay — original in red, new in green
6. Presses Tab to accept
7. Live preview immediately shows the hover effect
8. Developer continues editing

### Flow 3: Share and Fork

1. Developer builds something with Build from Prompt
2. Opens ExportShareMenu, clicks "Share Preview"
3. URL is copied to clipboard
4. Developer shares URL on Twitter/X
5. Viewer opens the link — sees full-screen live preview
6. Viewer clicks "Open in Editor" in the watermark
7. Full editor opens with the code pre-loaded
8. Viewer modifies the code and creates their own version
9. Viewer shares their version — loop continues

---

## 10. Pages and Screens

| Page / Screen                 | Purpose                | Key Elements                                                            |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| Main Editor                   | Primary workspace      | 3 Monaco panels, Live Preview, Console, NavBar                          |
| Build from Prompt Modal       | AI code generation     | Prompt textarea, quick-start chips, Generate button, loading state      |
| Inline Edit Overlay           | Cursor-style AI edit   | Floating input anchored to Monaco selection, diff view, Accept/Reject   |
| Preview Share Page (/preview) | Viral sharing, SEO     | Full-screen iframe output, LadeStack watermark, "Open in Editor" button |
| SEO Landing Pages (5 pages)   | Organic search traffic | Keyword-optimized static HTML, live demo embed, CTA                     |

---

## 11. What This Sprint Does NOT Build

Explicitly out of scope. Do not build these, even if it seems easy:

- Supabase auth or cloud storage (planned Sprint 3)
- Real-time multiplayer editing with live cursors
- Mobile layout improvements
- Payment processing or pro tier
- User accounts, profiles, or dashboards
- Notification system
- Comments or social features
- Backend WebSocket server changes
- Multi-file project tabs with file tree

---

## 12. Success Metrics

- Build from Prompt generates usable code in under 10 seconds (with free model)
- Inline Edit (Ctrl+K) completes and shows diff in under 8 seconds (with free model)
- selectionOperationsService all 6 operations return real AI responses (not stub)
- TypeScript and JSX modes compile and render in the preview without errors
- Live Preview Share link works and renders correctly in a new incognito window
- Fork opens in the editor with code correctly pre-populated
- 5 SEO landing pages are indexed by Google within 2 weeks of deployment
- Zero console errors in production build related to the new features

---

## 13. AI Coding Brief (Paste Into Claude Code to Start Building)

> You are helping me add features to **LadeStack Coder** — an AI-first browser-based
> HTML/CSS/JavaScript code playground at code.ladestack.in.
>
> **Stack**: React 18, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4, Monaco Editor,
> Google Gemini AI (client-side), NVIDIA NIM API (serverless via api/ai.js on Vercel),
> Express + WebSocket server for terminal (server/index.js), Supabase schema exists
> but frontend uses localStorage only.
>
> **Current state**: App is fully built and deployed. Three Monaco Editor panels
> (HTML/CSS/JS), live preview iframe, AI chat (Gemini), 4-mode console with terminal,
> snippet manager, template browser, export/share, code validation — all working.
> ONE broken thing: selectionOperationsService.ts returns hardcoded stubs for all
> AI operations. The /api/ai serverless endpoint is working — the stub just needs
> reconnection.
>
> **AI model rule**: During development, ALL calls to /api/ai must use free NVIDIA NIM
> models only. The model is read from process.env.NVIDIA_MODEL in api/ai.js — never
> hardcoded. For development, set NVIDIA_MODEL=meta/llama-3.1-8b-instruct.
>
> **Build in this exact order**:
>
> 1. Fix selectionOperationsService.ts stub — reconnect to /api/ai endpoint
> 2. Add TypeScript and JSX language support to the JavaScript editor panel
> 3. Build "Build from Prompt" modal with AI code generation into all 3 panels
> 4. Build Live Preview Share at /preview?p=BASE64_CODE route
> 5. Build Cursor-style Ctrl+K inline AI editing with diff overlay in Monaco
> 6. Build Fork and Share — "Open in Editor" button on preview page
>
> **Key rules**:
>
> - One feature per prompt. Never build two features in the same conversation.
> - Always read the existing service/component before modifying it.
> - All new AI calls go through /api/ai — never call NVIDIA NIM directly from frontend.
> - NVIDIA_MODEL is always read from environment variable, never hardcoded.
> - Do not touch: Supabase schema, WebSocket server, Gemini chat assistant,
>   localStorage keys, or any existing working features.
> - After each feature: test in dev, then ask me to confirm before moving to the next.
>
> **Do NOT build** (out of scope):
>
> - Supabase auth or cloud sync
> - Real-time multiplayer editing
> - Payment or pro tier
> - Mobile layout
> - Multi-file tabs
>
> Start with Feature 1: Read src/services/selectionOperationsService.ts and
> api/ai.js first. Show me what you find. Then propose the fix before writing
> any code. Ask me before making any assumptions.
```

```

---

PRD complete. ✅

**Tumhi aata he directly Claude Code madhye paste karu shakta.** Last point neet read kara — *"Start with Feature 1: Read the files first, show me what you find, then propose before writing any code."* — he instruction critical ahe. Claude Code la straight away code lihu deu naka — first analysis karayla sanga, mag approve kara, mag build.

**Immediate next step (aajcha 48 tasyat):**
`selectionOperationsService.ts` aani `api/ai.js` — dono files Claude Code madhye open kara aani above PRD paste kara. Stub fix hel 1–2 days madhe aani tumchya existing AI operations live hoyil — visible progress, zero new architecture.
```
