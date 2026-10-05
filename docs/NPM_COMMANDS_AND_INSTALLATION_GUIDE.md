# Complete NPM Commands & Package Installation Guide

## Overview

GB Coder features an integrated **WebContainer runtime**—a full Node.js environment executing entirely within your browser via WebAssembly and Cross-Origin Isolation (`COEP`/`COOP`). 

This guide provides a complete reference for all essential **NPM commands**, installation workflows, best practices, and troubleshooting tips.

---

## 1. Quick Terminal Cheat Sheet

You can view these commands at any time in the IDE terminal by typing `help` or clicking the **`help`** button in the terminal toolbar:

| Command | Description | Example |
| :--- | :--- | :--- |
| `help` | Display supported commands cheat sheet | `help` |
| `npm install` (or `npm i`) | Install all dependencies listed in `package.json` | `npm i` |
| `npm i <pkg>` | Install a new production dependency | `npm i axios` |
| `npm i -D <pkg>` | Install a package as development dependency | `npm i -D tailwindcss` |
| `npm uninstall <pkg>` | Remove a package from project | `npm uninstall lodash` |
| `npm ls --depth=0` | List all top-level installed packages | `npm ls --depth=0` |
| `npm run dev` | Launch Vite / Next.js live development server | `npm run dev` |
| `npm run build` | Compile and bundle production assets | `npm run build` |
| `npm run preview` | Locally preview the production build output | `npm run preview` |
| `node <file.js>` | Execute a JavaScript script using Node.js | `node server.js` |
| `npx <cmd>` | Execute an npm package binary directly | `npx vite` |
| `ls` (or `ls -la`) | List files and directories in virtual filesystem | `ls -la` |
| `cat <file>` | Display the content of a file in the terminal | `cat package.json` |
| `rm -rf <path>` | Force remove a file or directory | `rm -rf node_modules` |
| `clear` (or `Ctrl + L`) | Clear the terminal screen | `clear` |

---

## 2. Two Ways to Install Packages in GB Coder

### Approach A: The Visual Package Manager GUI (Recommended)
1. In **VS Code Mode**, click the **Package** icon in the top header.
2. Go to the **Search & Install** tab.
3. Browse curated categories (*Trending*, *UI & Styling*, *State*, *Utilities*, *Backend*) or type any package name from the npm registry (e.g. `zod`, `lucide-react`, `zustand`).
4. Click the blue **`+ Install`** button.
5. **What happens automatically**:
   - The package is added to `package.json`.
   - Automatic Type Acquisition (ATA) downloads `.d.ts` definitions from CDN so Monaco Editor provides IntelliSense and auto-completion immediately!

### Approach B: Using the Interactive Terminal
1. Open the terminal (click **Terminal** in the status bar or press **`Ctrl + \``**).
2. Ensure the terminal mode is set to **`⚡ WebContainer`**.
3. Type the installation command:
   ```bash
   npm i <package-name>
   ```
   *Examples:*
   ```bash
   # Install React state management:
   npm i zustand

   # Install HTTP client:
   npm i axios

   # Install UI animation library:
   npm i framer-motion

   # Install development tool:
   npm i -D @types/canvas-confetti
   ```

---

## 3. Recommended Packages for Web Projects

Here are popular packages that run smoothly in GB Coder:

### UI & Icons
```bash
npm i lucide-react clsx tailwind-merge canvas-confetti
```

### Data & State Management
```bash
npm i zustand @tanstack/react-query axios
```

### Schema Validation & Utilities
```bash
npm i zod date-fns lodash-es
```

### Routing & Frameworks
```bash
npm i react-router-dom
```

---

## 4. Troubleshooting & Best Practices

### 1. Peer Dependency Conflict (`code ERESOLVE`)
If an older library has strict peer dependency requirements, npm might abort with an `ERESOLVE` error.
- **Solution**: GB Coder includes an automatic `.npmrc` file with `legacy-peer-deps=true`. If needed, append `--legacy-peer-deps`:
  ```bash
  npm i <pkg> --legacy-peer-deps
  ```

### 2. Live Preview Development Server
To start the live preview after installing packages:
```bash
npm run dev
```
- As soon as the Vite dev server starts, GB Coder detects the port (`server-ready`) and auto-connects the **Live Preview** panel!
- Click the **Maximize** button (`Maximize2`) for full-screen mode, or click **Open in New Tab** (`ExternalLink`) for a detached popout with real-time live synchronization.

### 3. Hiding the Terminal Without Stopping Processes
- You can hide the terminal panel anytime by pressing **`Ctrl + \``** or clicking the **`X`** button.
- Your dev server and ongoing commands will **continue running in the background** without interruption!
- Press **`Ctrl + \``** again to bring back the terminal with all logs preserved.

### 4. Stopping a Running Process
To stop a running development server (like `npm run dev`):
- Click inside the terminal and press **`Ctrl + C`**.
