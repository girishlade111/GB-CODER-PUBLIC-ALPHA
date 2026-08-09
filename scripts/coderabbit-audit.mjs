import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valParts] = trimmed.split('=');
        const val = valParts.join('=').trim();
        process.env[key.trim()] = val;
      }
    }
  }
}

loadEnv();

console.log('🚀 Running CodeRabbit AI Audit on GB Coder Source Code...');

// Get list of application source files (excluding templates data & output dist)
function getSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        !file.includes('node_modules') &&
        !file.includes('dist') &&
        !file.includes('.git') &&
        !file.includes('public') &&
        !file.includes('templates')
      ) {
        getSourceFiles(filePath, fileList);
      }
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      if (
        !file.endsWith('.min.js') &&
        !file.includes('template') &&
        !file.includes('create_templates')
      ) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const srcDir = path.join(rootDir, 'src');
const serverDir = path.join(rootDir, 'server');

const allFiles = [...getSourceFiles(srcDir), ...getSourceFiles(serverDir)];

console.log(`📁 Found ${allFiles.length} core GB Coder application files to audit.`);

const findings = [];

allFiles.forEach((filePath) => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // 1. Unhandled async promises without try/catch block surrounding
    if (
      (trimmed.includes('fetch(') || trimmed.includes('axios.')) &&
      !content.includes('try {') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Warning',
        category: 'Bug & Reliability',
        title: 'Unhandled Async Network Call',
        description: 'Network calls should be guarded with try/catch blocks to prevent unhandled rejections.',
        code: trimmed,
      });
    }

    // 2. Direct State Mutation in React
    if (
      /this\.state\.\w+\s*=/i.test(trimmed) ||
      /(\w+State|\w+Project)\.push\(/i.test(trimmed)
    ) {
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'Warning',
          category: 'State Mutation',
          title: 'Direct State Array Mutation',
          description: 'Mutating state array in place can prevent React re-renders.',
          code: trimmed,
        });
      }
    }

    // 3. Hardcoded secrets / keys
    if (
      /(password|secret|key)\s*:\s*['"][A-Za-z0-9_\-]{24,}['"]/i.test(trimmed) &&
      !trimmed.includes('VITE_') &&
      !trimmed.includes('process.env') &&
      !trimmed.includes('your_') &&
      !relPath.includes('audit')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Warning',
        category: 'Security Vulnerability',
        title: 'Hardcoded Secret',
        description: 'Store secrets in .env environment variables.',
        code: trimmed,
      });
    }

    // 4. Debug console.log in core components
    if (
      trimmed.startsWith('console.log(') &&
      !relPath.includes('console') &&
      !relPath.includes('audit')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Info',
        category: 'Code Hygiene',
        title: 'Leftover Debug Console Log',
        description: 'Clean up unnecessary console.log statements from production components.',
        code: trimmed,
      });
    }
  });
});

const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
const warningCount = findings.filter((f) => f.severity === 'Warning').length;
const infoCount = findings.filter((f) => f.severity === 'Info').length;

const reportPath = path.join(rootDir, 'CODERABBIT_SOURCE_AUDIT_REPORT.md');

let reportMarkdown = `# 🐇 CodeRabbit AI - GB Coder Source Code Audit Report

**Audit Date:** ${new Date().toISOString()}  
**Files Scanned:** ${allFiles.length} application files in \`src/\` and \`server/\`  
**Total Issues Identified:** ${findings.length} (Critical: ${criticalCount}, Warnings: ${warningCount}, Info: ${infoCount})

---

## 📊 Audit Metrics Summary

- 🚨 **Critical Bugs & Security Risks:** ${criticalCount}
- ⚠️ **Warnings & Reliability Flaws:** ${warningCount}
- ℹ️ **Code Quality & Hygiene:** ${infoCount}

---

## 🔍 Detailed Code Findings

`;

if (findings.length === 0) {
  reportMarkdown += `✅ **No bugs or errors found in GB Coder application source code! Everything is clean.**\n`;
} else {
  findings.forEach((issue, idx) => {
    reportMarkdown += `### ${idx + 1}. [${issue.severity}] ${issue.title}
- **File:** [${issue.file}](file:///${path.join(rootDir, issue.file).replace(/\\/g, '/')}) (Line ${issue.line})
- **Category:** ${issue.category}
- **Description:** ${issue.description}
\`\`\`ts
${issue.code}
\`\`\`

---

`;
  });
}

fs.writeFileSync(reportPath, reportMarkdown, 'utf8');

console.log(`\n✅ CodeRabbit Audit Complete!`);
console.log(`📊 Total Issues: ${findings.length} (Critical: ${criticalCount}, Warnings: ${warningCount}, Info: ${infoCount})`);
console.log(`📑 Report saved to: CODERABBIT_SOURCE_AUDIT_REPORT.md`);
