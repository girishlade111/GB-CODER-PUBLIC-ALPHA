# 🐇 CodeRabbit AI - GB Coder Source Code Audit Report

**Audit Date:** 2026-08-09T18:33:25.280Z  
**Files Scanned:** 191 files in `src/` and `server/`  
**Total Issues Identified:** 76 (Critical: 6, Warnings: 14, Info: 56)

---

## 📊 Audit Metrics Summary

- 🚨 **Critical Bugs & Security Risks:** 6
- ⚠️ **Warnings & Reliability Flaws:** 14
- ℹ️ **Code Quality & Hygiene:** 56

---

## 🔍 Detailed Code Findings

### 1. [Info] Leftover Debug Console Statement
- **File:** [src/App.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/App.tsx) (Line 494)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(\`User \${name} clicked start\`);
```

---

### 2. [Warning] Potential Unhandled Async Rejection
- **File:** [src/components/BuildFromPromptModal.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/BuildFromPromptModal.tsx) (Line 224)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch('/api/ai', {
```

---

### 3. [Info] Leftover Debug Console Statement
- **File:** [src/components/CustomInjectionManager.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/CustomInjectionManager.tsx) (Line 407)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
newInjection.type === 'js' ? 'console.log("Custom injection active");' :
```

---

### 4. [Info] Leftover Debug Console Statement
- **File:** [src/components/pages/ContactPage.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/pages/ContactPage.tsx) (Line 52)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Form submitted:', formData);
```

---

### 5. [Info] Leftover Debug Console Statement
- **File:** [src/components/PreviewPanel.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewPanel.tsx) (Line 370)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Loading ${externalLibraries.length} external libraries...');
```

---

### 6. [Info] Leftover Debug Console Statement
- **File:** [src/components/PreviewPanel.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewPanel.tsx) (Line 412)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('External libraries loaded successfully');
```

---

### 7. [Warning] Event Listener Missing Cleanup
- **File:** [src/components/PreviewSharePage.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewSharePage.tsx) (Line 63)
- **Category:** Memory Leak Risk
- **Description:** Event listeners added inside component effects should have corresponding removeEventListener cleanup callbacks on unmount.
```ts
window.addEventListener('error', (e) => {
```

---

### 8. [Warning] Event Listener Missing Cleanup
- **File:** [src/components/PreviewSharePage.tsx](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/PreviewSharePage.tsx) (Line 72)
- **Category:** Memory Leak Risk
- **Description:** Event listeners added inside component effects should have corresponding removeEventListener cleanup callbacks on unmount.
```ts
document.addEventListener('DOMContentLoaded', resolve, { once: true });
```

---

### 9. [Info] Leftover Debug Console Statement
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 36)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Analytics initialized with ID:', trackingId);
```

---

### 10. [Info] Leftover Debug Console Statement
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 44)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Analytics: Page view', { path, title });
```

---

### 11. [Info] Leftover Debug Console Statement
- **File:** [src/services/analytics.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/analytics.ts) (Line 58)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Analytics: Event', { category, action, label, value });
```

---

### 12. [Info] Leftover Debug Console Statement
- **File:** [src/services/codeRabbitService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/codeRabbitService.ts) (Line 156)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
if (lineText.includes('console.log(') && !lineText.trim().startsWith('//')) {
```

---

### 13. [Info] Leftover Debug Console Statement
- **File:** [src/services/codeRabbitService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/codeRabbitService.ts) (Line 166)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
suggestedFix: lineText.replace('console.log(', '// console.log('),
```

---

### 14. [Info] Leftover Debug Console Statement
- **File:** [src/services/codeTemplatesService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/codeTemplatesService.ts) (Line 548)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Form submitted:', data);
```

---

### 15. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/customInjectionService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/customInjectionService.ts) (Line 158)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
code: '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>'
```

---

### 16. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/externalLibraryService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/externalLibraryService.ts) (Line 190)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
{ name: 'Axios', url: 'https://cdn.jsdelivr.net/npm/axios@1.6.5/dist/axios.min.js', type: 'js' as const, description: 'Promise-based HTTP Client' },
```

---

### 17. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/externalToolsService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/externalToolsService.ts) (Line 281)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(url, {
```

---

### 18. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/externalToolsService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/externalToolsService.ts) (Line 326)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(config.url, {
```

---

### 19. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/outputStreamingService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/outputStreamingService.ts) (Line 205)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(url, {
```

---

### 20. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/packageResolver.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/packageResolver.ts) (Line 258)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(url, {
```

---

### 21. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/projectImportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectImportService.ts) (Line 293)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
response = await fetch(url, { redirect: 'follow' });
```

---

### 22. [Info] Leftover Debug Console Statement
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 79)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Created new project: ${name} (${id})`);
```

---

### 23. [Info] Leftover Debug Console Statement
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 102)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Saved project: ${project.name} (${project.id})`);
```

---

### 24. [Info] Leftover Debug Console Statement
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 170)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Duplicated project: ${original.name} → ${duplicated.name}`);
```

---

### 25. [Info] Leftover Debug Console Statement
- **File:** [src/services/projectStore.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projectStore.ts) (Line 198)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Deleted project: ${projectName} (${id})`);
```

---

### 26. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/sandbox/sandboxSession.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/sandbox/sandboxSession.ts) (Line 167)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(`/api/sandbox/${endpoint}`, {
```

---

### 27. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 34)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Starting screenshot capture...', { format, quality });
```

---

### 28. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 53)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Capturing as JPEG...');
```

---

### 29. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 60)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Capturing as SVG...');
```

---

### 30. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 65)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Capturing as PNG...');
```

---

### 31. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 70)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Screenshot captured successfully');
```

---

### 32. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 167)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Screenshot downloaded:', filename);
```

---

### 33. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 176)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Copying screenshot to clipboard...');
```

---

### 34. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 191)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Writing to clipboard...');
```

---

### 35. [Info] Leftover Debug Console Statement
- **File:** [src/services/screenshotService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/screenshotService.ts) (Line 196)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Screenshot copied to clipboard successfully');
```

---

### 36. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/selectionOperationsService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/selectionOperationsService.ts) (Line 55)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch('/api/ai', {
```

---

### 37. [Info] Leftover Debug Console Statement
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 155)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Text copied to clipboard');
```

---

### 38. [Info] Leftover Debug Console Statement
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 171)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Text copied to clipboard (fallback method)');
```

---

### 39. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 337)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch('/api/share', {
```

---

### 40. [Warning] Potential Unhandled Async Rejection
- **File:** [src/services/shareExportService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/shareExportService.ts) (Line 367)
- **Category:** Bug & Reliability
- **Description:** Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.
```ts
const response = await fetch(`/api/preview?id=${encodeURIComponent(shortId)}`);
```

---

### 41. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/ai-agents/chatbot.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/ai-agents/chatbot.ts) (Line 151)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('AI Chatbot template loaded');`
```

---

### 42. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/business/agency.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/business/agency.ts) (Line 62)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('Agency loaded');`
```

---

### 43. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/business/consulting.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/business/consulting.ts) (Line 75)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('Consulting loaded');`
```

---

### 44. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/business/corporate.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/business/corporate.ts) (Line 146)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('Corporate template loaded with animations!');`
```

---

### 45. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/ecommerce/store.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/ecommerce/store.ts) (Line 697)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Added to cart:', productName);
```

---

### 46. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/ecommerce/store.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/ecommerce/store.ts) (Line 726)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Filtering by category:', category);
```

---

### 47. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/ecommerce/store.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/ecommerce/store.ts) (Line 741)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Sorting by:', sortValue);
```

---

### 48. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/ecommerce/store.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/ecommerce/store.ts) (Line 762)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('E-commerce Store Template loaded successfully!');
```

---

### 49. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/plain/blog.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/plain/blog.ts) (Line 13)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('Blog loaded');`
```

---

### 50. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/portfolio/developer.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/portfolio/developer.ts) (Line 726)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Portfolio Developer Template loaded successfully!');
```

---

### 51. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/saas/dashboard.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/saas/dashboard.ts) (Line 172)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: `console.log('Dashboard initialized');`
```

---

### 52. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/startup/landing.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/startup/landing.ts) (Line 1097)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Email submitted:', email);
```

---

### 53. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/startup/landing.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/startup/landing.ts) (Line 1181)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Startup Landing Template loaded successfully!');
```

---

### 54. [Info] Leftover Debug Console Statement
- **File:** [src/services/templates/utility/calculator.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templates/utility/calculator.ts) (Line 474)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Utility Calculator Template loaded successfully!');
```

---

### 55. [Info] Leftover Debug Console Statement
- **File:** [src/services/templateService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templateService.ts) (Line 43)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Hello, World!');`,
```

---

### 56. [Info] Leftover Debug Console Statement
- **File:** [src/services/templateService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templateService.ts) (Line 88)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(\`Hello, \${name}!\`);`,
```

---

### 57. [Info] Leftover Debug Console Statement
- **File:** [src/services/templateService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templateService.ts) (Line 1543)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Login:', { email: email.value });
```

---

### 58. [Info] Leftover Debug Console Statement
- **File:** [src/services/templateService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/templateService.ts) (Line 1582)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Signup:', { name: name.value, email: email.value });
```

---

### 59. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 493)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
this.state.status === 'error' ||
```

---

### 60. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 494)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
this.state.status === 'done' ||
```

---

### 61. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 495)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
this.state.status === 'confirming'
```

---

### 62. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 851)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
if (this.state.continuous === continuous) return;
```

---

### 63. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 866)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
if (!language || this.state.language === language) return;
```

---

### 64. [Critical] Direct State Array Mutation
- **File:** [src/services/voiceCommandService.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/voiceCommandService.ts) (Line 909)
- **Category:** State Mutation Flaw
- **Description:** Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.
```ts
if (this.state.voiceFeedback === enabled) return;
```

---

### 65. [Info] Leftover Debug Console Statement
- **File:** [src/utils/projectExport.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/projectExport.ts) (Line 70)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Exported project "${project.name}" as ZIP`);
```

---

### 66. [Info] Leftover Debug Console Statement
- **File:** [src/utils/snippetUtils.ts](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/snippetUtils.ts) (Line 207)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
javascript: 'document.addEventListener("DOMContentLoaded", function() {\n  console.log("DOM is ready!");\n  // Your code here\n});',
```

---

### 67. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 53)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('New terminal connection established');
```

---

### 68. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 58)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Spawning shell: ${shell}`);
```

---

### 69. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 85)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`PTY process exited with code ${exitCode}, signal ${signal}`);
```

---

### 70. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 129)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Terminal connection closed');
```

---

### 71. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 157)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Received SIGTERM, closing all sessions...');
```

---

### 72. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 167)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Server closed');
```

---

### 73. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 173)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Received SIGINT, closing all sessions...');
```

---

### 74. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 183)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log('Server closed');
```

---

### 75. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 191)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`Terminal server running on port ${PORT}`);
```

---

### 76. [Info] Leftover Debug Console Statement
- **File:** [server/index.js](file:///C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/server/index.js) (Line 192)
- **Category:** Code Hygiene
- **Description:** Consider removing debug console statements in production codebase.
```ts
console.log(`WebSocket endpoint: ws://localhost:${PORT}/terminal`);
```

---

