# GB Coder — Backup and Restore Architecture Specification
**Document Version:** 1.0.0  
**Phase:** 0.5 — Pre-Migration Data Protection and Recovery  
**Target Application:** GB Coder (LadeStack — https://code.ladestack.in/)  
**Status:** Approved & Implemented  

---

## 1. Executive Overview & Mission
GB Coder operates primarily as an in-browser development environment. Projects, source files, WebContainer configurations, and user preferences reside entirely inside browser-local storage mechanisms:
1. **IndexedDB `gb-coder-projects-db`**: Multi-file project records (`projects`) and project source code entries (`projectFiles`).
2. **IndexedDB `gb-coder-workspace`**: Active VS Code full-stack workspace snapshot (`vscode`).
3. **`localStorage`**: Key-value runtime preferences and dashboard UI pointers.

As the application prepares for a major architecture transition in Phase 1 (introducing Astro marketing pages, relocated app mount point `/app`, unified routing, and an upgraded IDE shell), **Phase 0.5** introduces an industrial-grade, client-side, zero-cloud backup export and safe restore subsystem. This architecture ensures that 100% of user data can be exported to standard ZIP archives, cryptographically verified, and reliably restored with non-destructive conflict handling.

---

## 2. Core Architectural Principles
1. **Zero Cloud Dependencies:** 100% browser-local execution. No telemetry, third-party relays, or external backend services receive archive contents or keys.
2. **Non-Destructive Restoration:** Restoration never blindly overwrites existing user projects. If an ID collision is detected, the imported project is safely cloned with a fresh cryptographic UUID (`crypto.randomUUID()`) and marked with ` (Restored)` in its display title.
3. **Cryptographic Integrity & Tamper Proofing:** Every backup archive contains an `integrity/checksums.json` digest map computing standard SHA-256 hashes across all entries. Archives with modified, corrupt, or missing files are rejected before touching storage.
4. **Resilience & Safe Parser Security:** Protection against Path Traversal (ZIP Slip), prototype pollution, memory exhaustion (ZIP bombs), and malformed payloads.
5. **Zero First-Paint Impact:** Heavy dependencies (such as `jszip` and modal dialog assets) are strictly dynamically loaded via asynchronous `import()` chunks. Initial bundle metrics remain completely unaffected.

---

## 3. Storage Layer Architecture & Inventory

### 3.1 IndexedDB Databases

#### Database A: `gb-coder-projects-db` (Version 1)
- **Object Store `projects`**:
  - Key path: `id` (string UUID)
  - Index: `lastOpenedAt`
  - Record Shape:
    ```typescript
    interface ProjectRecord {
      id: string;
      name: string;
      createdAt: number;
      lastOpenedAt: number;
      editorStyle: 'plain' | 'vscode';
      projectType: ProjectType;
      entry?: string;
      fileCount: number;
      [key: string]: unknown; // Preserves future/unrecognized metadata
    }
    ```
- **Object Store `projectFiles`**:
  - Compound Key: `[projectId, path]`
  - Index: `projectId`
  - Record Shape:
    ```typescript
    interface ProjectFileRecord {
      projectId: string;
      path: string;
      content: string;
      language?: string;
      isEntry?: boolean;
    }
    ```

#### Database B: `gb-coder-workspace` (Version 1)
- **Object Store `vscode`**:
  - Key path: none (out-of-line keys)
  - Primary Key: `'current'`
  - Value: Workspace snapshot (`project` state, active files, tabs, terminal histories).

### 3.2 LocalStorage Preferences Allowlist
To prevent leaking sensitive security tokens (such as Netlify/Vercel/GitHub personal access tokens) or session credentials into exportable backups, the backup engine enforces a strict security allowlist:
- `gbcoder_theme`: Theme setting (`dark`, `light`, `system`)
- `gbcoder_settings`: General editor font size, tab sizes, autosave intervals
- `gbcoder_custom_templates`: Custom templates created by the user
- `gb-coder-auto-format-settings`: Prettier / formatting preferences
- `gbcoder_onboarded`: Welcome onboarding tutorial status flag

All credential keys (e.g., `gbcoder_github_token`, `gbcoder_netlify_token`, `gbcoder_vercel_token`) are strictly prohibited from archive inclusion.

---

## 4. Archive Format Specification (`gb-coder-backup` v1)

Exported archives are standard PKZIP (.zip) files structured deterministically:

```
gb-coder-backup-YYYY-MM-DD-HHMMSS.zip
├── manifest.json                        # Root backup descriptor and metadata
├── integrity/
│   └── checksums.json                  # SHA-256 hash map of all archive files
├── projects/
│   ├── index.json                      # Array of all exported ProjectRecord items
│   ├── <project-id-1>/
│   │   ├── metadata.json               # Full project metadata record
│   │   └── files/
│   │       ├── index.html              # Raw project file
│   │       ├── src/
│   │       │   └── App.tsx
│   │       └── package.json
│   └── <project-id-2>/
│       ├── metadata.json
│       └── files/...
├── workspace/
│   └── vscode-workspace.json           # Optional full-stack workspace snapshot
└── preferences/
    └── localstorage-preferences.json   # Allowlisted user preferences
```

### 4.1 Manifest Format (`manifest.json`)
```json
{
  "format": "gb-coder-backup",
  "formatVersion": 1,
  "appVersion": "0.0.0",
  "exportedAt": "2026-10-12T02:35:08.000Z",
  "clientTimestamp": 1791772508000,
  "exportedProjectCount": 2,
  "totalFileCount": 4,
  "uncompressedSizeBytes": 3884,
  "schemaVersions": {
    "projectsDb": 1,
    "workspaceDb": 1
  },
  "containsWorkspace": true,
  "containsPreferences": true,
  "generator": "GB Coder Phase 0.5 Backup Engine"
}
```

### 4.2 Checksum Digest (`integrity/checksums.json`)
Maps normalized POSIX entry paths to standard 64-character lowercase hexadecimal SHA-256 hashes:
```json
{
  "manifest.json": "8f48...d3",
  "projects/index.json": "01b2...e4",
  "projects/e2e-project-alpha/metadata.json": "4a71...9f",
  "projects/e2e-project-alpha/files/index.html": "e3b0...c4"
}
```

---

## 5. Security & Defensive Invariants

### 5.1 ZIP Slip & Path Traversal Guard
Every entry path is normalized and validated before extraction:
- Rejects paths containing null bytes (`\0`) or carriage returns.
- Rejects Windows drive letters (e.g., `C:`) and colon characters.
- Converts backslashes (`\`) to forward slashes (`/`).
- Resolves dot segments (`.` and `..`); if any segment attempts to escape the root directory, validation throws a fatal `SecurityError: Malicious archive path detected`.

### 5.2 Decompression & Resource Limits
To defend against ZIP bombs and memory exhaustion:
- Maximum uncompressed archive payload: **100 MB** (`104,857,600` bytes).
- Maximum total file count: **2,500** files.
- Maximum single file uncompressed size: **25 MB** (`26,214,400` bytes).

### 5.3 Prototype Pollution & Malicious JSON Guard
JSON parsing employs a hardened reviver function that disallows keys matching:
- `__proto__`
- `constructor`
- `prototype`

---

## 6. Safe Restore & Non-Destructive Conflict Resolution

Restoration executes in two atomic stages: **Dry-Run Analysis** and **Transactional Execution**.

### 6.1 Phase A: Dry-Run Analysis & Preview Generation
When a user provides a ZIP archive:
1. Manifest and ZIP directory structure are verified.
2. All checksums are validated against `integrity/checksums.json`.
3. Existing projects in `gb-coder-projects-db` are read into an in-memory collision index.
4. A `RestorePlan` is computed:
   - If `project.id` does NOT exist locally:
     - `action`: `'create_new'`
     - `targetId`: `project.id`
   - If `project.id` DOES exist locally:
     - `action`: `'create_copy'`
     - `targetId`: `crypto.randomUUID()` (Fresh UUID)
     - `name`: `${originalName} (Restored)`
5. A modal UI presents the preview plan showing incoming projects, resolved names, and conflict warnings to the user.

### 6.2 Phase B: Transactional Restoration
Upon explicit user confirmation:
1. Project records and files are written to IndexedDB through the sequential queue via `restoreProject(record, files)`.
2. Post-write verification verifies that the newly written records exist and their file counts match.
3. If workspace restoration is enabled and supported, `gb-coder-workspace` is staged.
4. If preferences restoration is enabled, allowlisted items are safely merged without touching credentials.
5. Custom event `gb-coder:projects-updated` is dispatched across window scopes to refresh UI dashboards without requiring a hard page reload.

---

## 7. Automated Test Verification Matrix

| Suite | Description | Tests | Result |
| :--- | :--- | :---: | :---: |
| **Unit & Security Matrix (T01 - T40)** | `scripts/backup-restore-tests.mjs` | 40 | **40 / 40 PASSED (100%)** |
| **Playwright Real Browser E2E** | `scripts/e2e-backup-restore.mjs` | Multi-step roundtrip | **PASSED (100%)** |
| **Codebase Unit Tests** | `scripts/audit-run-tests.mjs` | 77 | **77 / 77 PASSED (100%)** |
| **WebContainer Regression Tests** | `scripts/webcontainer-regression-tests.mjs` | 26 | **26 / 26 PASSED (100%)** |
| **Dev Server Lifecycle Tests** | `scripts/dev-server-lifecycle-tests.mjs` | 15 | **15 / 15 PASSED (100%)** |
| **NPM Install Performance Tests** | `scripts/npm-install-performance-tests.mjs` | 12 | **12 / 12 PASSED (100%)** |
| **Preview Refresh Tests** | `scripts/preview-refresh-tests.mjs` | 12 | **12 / 12 PASSED (100%)** |
| **Open in New Tab Tests** | `scripts/open-in-new-tab-tests.mjs` | 12 | **12 / 12 PASSED (100%)** |
| **Reload Recovery Tests** | `scripts/reload-recovery-tests.mjs` | 20 | **20 / 20 PASSED (100%)** |
| **Runtime Status Tests** | `scripts/runtime-status-tests.mjs` | 17 | **17 / 17 PASSED (100%)** |
| **Monaco Worker Tests** | `scripts/monaco-worker-tests.mjs` | 15 | **15 / 15 PASSED (100%)** |
| **COEP Resource Tests** | `scripts/coep-resource-tests.mjs` | 15 | **15 / 15 PASSED (100%)** |
| **Deployment Configuration** | `scripts/verify-deploy-config.mjs` | Strict Vercel JSON | **PASSED (100%)** |
| **Bundle Critical Path** | `scripts/measure-initial-bundle.mjs` | 580.9 kB JS (No JSZip) | **PASSED (100%)** |

---

## 8. Rollback & Disaster Recovery Procedures
In the event of an issue during subsequent Phase 1 migrations:
1. **Repository Rollback:** Reset codebase to clean baseline commit (`ca9f620ea9e982b2d87db8cedbe978307f6961e8`).
2. **Browser Data Recovery:** Users upload their pre-migration `.zip` backup archive via `BackupRestoreModal`.
3. **Data Guarantee:** All project files, hierarchical directories, packages, and custom code are fully recovered without data loss.
