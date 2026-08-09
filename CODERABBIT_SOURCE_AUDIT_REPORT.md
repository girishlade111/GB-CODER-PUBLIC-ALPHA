# 🐇 CodeRabbit AI - GB Coder Source Code Audit Report

**Audit Date:** 2026-08-09T18:34:00.745Z  
**Files Scanned:** 171 application files in `src/` and `server/`  
**Total Issues Identified:** 34 (Critical: 0, Warnings: 0, Info: 34)

---

## 📊 Audit Metrics Summary

- 🚨 **Critical Bugs & Security Risks:** 0
- ⚠️ **Warnings & Reliability Flaws:** 0
- ℹ️ **Code Quality & Hygiene:** 34

---

## 🔍 Detailed Code Findings

### 1. [Info] Leftover Debug Console Log
- **File:** [src/App.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/App.tsx) (Line 494)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(\`User \${name} clicked start\`);
```

---

### 2. [Info] Leftover Debug Console Log
- **File:** [src/components/pages/ContactPage.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/pages/ContactPage.tsx) (Line 52)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Form submitted:', formData);
```

---

### 3. [Info] Leftover Debug Console Log
- **File:** [src/components/PreviewPanel.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewPanel.tsx) (Line 370)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Loading ${externalLibraries.length} external libraries...');
```

---

### 4. [Info] Leftover Debug Console Log
- **File:** [src/components/PreviewPanel.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewPanel.tsx) (Line 412)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('External libraries loaded successfully');
```

---

### 5. [Info] Leftover Debug Console Log
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 36)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Analytics initialized with ID:', trackingId);
```

---

### 6. [Info] Leftover Debug Console Log
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 44)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Analytics: Page view', { path, title });
```

---

### 7. [Info] Leftover Debug Console Log
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 58)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Analytics: Event', { category, action, label, value });
```

---

### 8. [Info] Leftover Debug Console Log
- **File:** [src/services/codeTemplatesService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/codeTemplatesService.ts) (Line 548)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Form submitted:', data);
```

---

### 9. [Info] Leftover Debug Console Log
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 79)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Created new project: ${name} (${id})`);
```

---

### 10. [Info] Leftover Debug Console Log
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 102)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Saved project: ${project.name} (${project.id})`);
```

---

### 11. [Info] Leftover Debug Console Log
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 170)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Duplicated project: ${original.name} → ${duplicated.name}`);
```

---

### 12. [Info] Leftover Debug Console Log
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 198)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Deleted project: ${projectName} (${id})`);
```

---

### 13. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 34)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Starting screenshot capture...', { format, quality });
```

---

### 14. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 53)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Capturing as JPEG...');
```

---

### 15. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 60)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Capturing as SVG...');
```

---

### 16. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 65)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Capturing as PNG...');
```

---

### 17. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 70)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Screenshot captured successfully');
```

---

### 18. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 167)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Screenshot downloaded:', filename);
```

---

### 19. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 176)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Copying screenshot to clipboard...');
```

---

### 20. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 191)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Writing to clipboard...');
```

---

### 21. [Info] Leftover Debug Console Log
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 196)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Screenshot copied to clipboard successfully');
```

---

### 22. [Info] Leftover Debug Console Log
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 155)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Text copied to clipboard');
```

---

### 23. [Info] Leftover Debug Console Log
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 171)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Text copied to clipboard (fallback method)');
```

---

### 24. [Info] Leftover Debug Console Log
- **File:** [src/utils/projectExport.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/projectExport.ts) (Line 70)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Exported project "${project.name}" as ZIP`);
```

---

### 25. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 53)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('New terminal connection established');
```

---

### 26. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 58)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Spawning shell: ${shell}`);
```

---

### 27. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 85)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`PTY process exited with code ${exitCode}, signal ${signal}`);
```

---

### 28. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 129)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Terminal connection closed');
```

---

### 29. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 157)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Received SIGTERM, closing all sessions...');
```

---

### 30. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 167)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Server closed');
```

---

### 31. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 173)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Received SIGINT, closing all sessions...');
```

---

### 32. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 183)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log('Server closed');
```

---

### 33. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 191)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`Terminal server running on port ${PORT}`);
```

---

### 34. [Info] Leftover Debug Console Log
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 192)
- **Category:** Code Hygiene
- **Description:** Clean up unnecessary console.log statements from production components.
```ts
console.log(`WebSocket endpoint: ws://localhost:${PORT}/terminal`);
```

---

