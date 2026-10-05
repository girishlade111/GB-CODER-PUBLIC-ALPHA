# 3 Easy Ways to Delete Packages & Dependencies in GB Coder IDE

## Overview

In GB Coder IDE, dependencies and packages are executed in an **in-browser Node.js runtime (WebContainer)** with zero cloud costs. Packages are isolated inside a virtual, memory-backed environment rather than directly modifying your host computer's filesystem.

When working on projects, you may want to remove unused libraries, free up browser memory, or reset corrupted `node_modules`. This guide details **3 easy ways** to delete and clean packages in GB Coder.

---

## Where Are Installed Packages Stored?

1. **Virtual Filesystem (In-Memory VFS)**:
   - When you execute `npm i <package>`, packages are extracted into `/home/webcontainer/node_modules` inside browser WebAssembly memory.
   - They do **not** clutter your physical drive (e.g., `C:\Users\...`).
2. **Browser HTTP Cache & IndexedDB**:
   - Downloaded npm tarballs are cached in your browser's disk cache/IndexedDB.
   - This ensures subsequent installations of the same package take only milliseconds rather than re-downloading from the internet every time.
3. **Project Manifest (`package.json`)**:
   - Package names and version ranges (`^1.7.9`) are recorded in your project's `package.json`, which persists in GB Coder's workspace storage (`localStorage`).

---

## Method 1: Visual Package Manager GUI (1-Click 🗑️) — Recommended

The fastest and most beginner-friendly way to remove dependencies:

1. Open **VS Code Mode** or the standard editor in GB Coder.
2. Click the **Package Manager icon** (`Package`) in the top action toolbar.
3. In the panel that opens on the right, switch to the **"Installed Packages"** tab.
4. Locate the package you wish to remove (e.g., `axios`, `lodash`, `canvas-confetti`).
5. Click the **Trash Can icon (🗑️)** next to the package name.
6. **Result**:
   - The package is removed from `package.json`.
   - Monaco Editor's Automatic Type Acquisition (ATA) detaches the types.
   - A confirmation toast notifies you that the package was uninstalled.

---

## Method 2: Terminal Commands (`npm uninstall` & `rm -rf`)

If you are working inside the interactive PTY terminal:

### A. Uninstalling a Specific Package
Run `npm uninstall` followed by the package name:
```bash
npm uninstall <package-name>
```
*Example:*
```bash
npm uninstall axios
```
This updates `package.json` and removes the package from the virtual `node_modules` directory.

### B. Uninstalling a Dev Dependency
```bash
npm uninstall -D <package-name>
# Example:
npm uninstall -D @types/node
```

### C. Completely Deleting `node_modules`
If dependencies become corrupted or you want a fresh install:
```bash
rm -rf node_modules package-lock.json
```
After deleting, reinstall cleanly:
```bash
npm install --legacy-peer-deps
```

---

## Method 3: Clearing Browser Cache & Storage (Complete Wipe)

If you wish to purge all cached npm packages, virtual files, and workspace data from your browser:

1. Press **`F12`** (or `Ctrl + Shift + I`) to open **Developer Tools** in your browser (Chrome / Edge / Brave / Firefox).
2. Go to the **Application** tab (in Firefox, the **Storage** tab).
3. In the left sidebar, click on **Storage**.
4. Click the **"Clear site data"** button.
   - Alternatively, expand **Cache storage** and **IndexedDB** to delete specific npm caches individually.
5. Refresh the page (`Ctrl + R` or `F5`).
6. **Result**:
   - All browser-cached npm tarballs, WebContainer virtual states, and temporary data are completely erased.

---

## Frequently Asked Questions (FAQ)

### Q1: Do I have to re-download packages every time I open the IDE?
**No.** GB Coder leverages browser HTTP caching. Once a package is downloaded, future installations pull directly from the browser's disk cache in milliseconds with near-zero network bandwidth usage.

### Q2: What happens if I hide or close the terminal panel?
In GB Coder, hiding the terminal panel (via `X`, `Ctrl + \``, or the status bar button) **does not kill** your running processes. Your dev server (`npm run dev`) and terminal state continue running safely in the background.

### Q3: Why is `--legacy-peer-deps` used?
GB Coder automatically adds `legacy-peer-deps=true` in `.npmrc` to prevent npm peer dependency conflicts (such as `code ERESOLVE`) between modern tooling and legacy packages.
