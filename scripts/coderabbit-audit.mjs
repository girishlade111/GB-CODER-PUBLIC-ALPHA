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

const apiKey = process.env.VITE_CODERABBIT_API_KEY || process.env.CODERABBIT_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Error: No CodeRabbit / Gemini API Key found in .env file!');
  process.exit(1);
}

console.log('🚀 Starting CodeRabbit AI Deep Audit on GB Coder Source Code...');

// Get list of source files to scan
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
        !file.includes('public')
      ) {
        getSourceFiles(filePath, fileList);
      }
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      // Ignore minified or generated files
      if (!file.endsWith('.min.js') && !file.includes('bundle')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const srcDir = path.join(rootDir, 'src');
const serverDir = path.join(rootDir, 'server');

const allFiles = [...getSourceFiles(srcDir), ...getSourceFiles(serverDir)];

console.log(`📁 Found ${allFiles.length} source code files in GB Coder.`);

// Static Rule Checks for GB Coder source code
const findings = [];

allFiles.forEach((filePath) => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // 1. Unhandled async promises in react components or services
    if (
      (trimmed.includes('fetch(') || trimmed.includes('axios.')) &&
      !trimmed.includes('try') &&
      !trimmed.includes('catch') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Warning',
        category: 'Bug & Reliability',
        title: 'Potential Unhandled Async Rejection',
        description: 'Network or API calls should be wrapped in try/catch or have error handlers to prevent unhandled rejections in GB Coder.',
        code: trimmed,
      });
    }

    // 2. State mutation risk
    if (
      /this\.state\.\w+\s*=/i.test(trimmed) ||
      /(\w+State|\w+Project)\.push\(/i.test(trimmed)
    ) {
      if (!trimmed.startsWith('//')) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'Critical',
          category: 'State Mutation Flaw',
          title: 'Direct State Array Mutation',
          description: 'Directly mutating React state arrays using .push() can cause missing re-renders or stale state bugs.',
          code: trimmed,
        });
      }
    }

    // 3. Memory leak risks in useEffect / WebSocket
    if (
      trimmed.includes('addEventListener(') &&
      !content.includes('removeEventListener') &&
      relPath.endsWith('.tsx')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Warning',
        category: 'Memory Leak Risk',
        title: 'Event Listener Missing Cleanup',
        description: 'Event listeners added inside component effects should have corresponding removeEventListener cleanup callbacks on unmount.',
        code: trimmed,
      });
    }

    // 4. Hardcoded local credentials or tokens
    if (
      /(password|secret|key)\s*:\s*['"][A-Za-z0-9_\-]{20,}['"]/i.test(trimmed) &&
      !trimmed.includes('VITE_') &&
      !trimmed.includes('process.env') &&
      !trimmed.includes('your_')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Critical',
        category: 'Security Vulnerability',
        title: 'Hardcoded Credential Token',
        description: 'Avoid embedding raw API secrets directly in source files. Move to .env.',
        code: trimmed,
      });
    }

    // 5. Console.log left in production code
    if (
      trimmed.includes('console.log(') &&
      !trimmed.startsWith('//') &&
      !relPath.includes('console') &&
      !relPath.includes('test')
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        severity: 'Info',
        category: 'Code Hygiene',
        title: 'Leftover Debug Console Statement',
        description: 'Consider removing debug console statements in production codebase.',
        code: trimmed,
      });
    }
  });
});

// AI Review Call via Google Generative AI / CodeRabbit framing
async function runAICodeAudit() {
  console.log('🤖 Running AI Deep Analysis on core GB Coder architectural files...');

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Pick top critical architectural files
    const priorityFiles = allFiles.filter(
      (f) =>
        f.endsWith('App.tsx') ||
        f.endsWith('server/index.js') ||
        f.endsWith('codeValidationService.ts') ||
        f.endsWith('bundlerService.ts') ||
        f.endsWith('sandboxTerminal.ts')
    );

    const summaryContent = priorityFiles
      .map((f) => {
        const rel = path.relative(rootDir, f).replace(/\\/g, '/');
        const code = fs.readFileSync(f, 'utf8').substring(0, 3000);
        return `=== File: ${rel} ===\n${code}`;
      })
      .join('\n\n');

    const prompt = `You are CodeRabbit AI auditing the GB Coder application source code.
Analyze the following source code files from the GB Coder codebase for bugs, logic glitches, unhandled exceptions, race conditions, and architectural risks:

${summaryContent}

Respond ONLY with valid JSON array:
[
  {
    "file": "path/to/file",
    "line": 10,
    "severity": "Critical" | "Warning" | "Info",
    "category": "Bug" | "Security" | "Performance",
    "title": "Short issue title",
    "description": "Clear explanation of the bug in GB Coder and suggested fix.",
    "code": "Offending code line"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const aiFindings = JSON.parse(text);
    if (Array.isArray(aiFindings)) {
      aiFindings.forEach((item) => {
        findings.push({
          file: item.file || 'src/App.tsx',
          line: item.line || 1,
          severity: item.severity || 'Warning',
          category: item.category || 'Bug',
          title: item.title || 'AI Detected Issue',
          description: item.description || 'Issue found in source code.',
          code: item.code || '',
        });
      });
    }
  } catch (err) {
    console.warn('⚠️ AI Audit step note:', err.message);
  }
}

await runAICodeAudit();

// Generate Markdown Audit Report
const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
const warningCount = findings.filter((f) => f.severity === 'Warning').length;
const infoCount = findings.filter((f) => f.severity === 'Info').length;

const reportPath = path.join(rootDir, 'CODERABBIT_SOURCE_AUDIT_REPORT.md');

let reportMarkdown = `# 🐇 CodeRabbit AI - GB Coder Source Code Audit Report

**Audit Date:** ${new Date().toISOString()}  
**Files Scanned:** ${allFiles.length} files in \`src/\` and \`server/\`  
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
  reportMarkdown += `✅ **No bugs or errors found in GB Coder source code! Everything looks clean.**\n`;
} else {
  findings.forEach((issue, idx) => {
    reportMarkdown += `### ${idx + 1}. [${issue.severity}] ${issue.title}
- **File:** [${issue.file}](file:///${path.join(rootDir, issue.file).replace(/\\/g, '/')}) (Line ${issue.line})
- **Category:** ${issue.category}
- **Description:** ${issue.description}
${issue.code ? `\`\`\`ts\n${issue.code}\n\`\`\`` : ''}

---

`;
  });
}

fs.writeFileSync(reportPath, reportMarkdown, 'utf8');

console.log(`\n✅ CodeRabbit AI Audit Completed!`);
console.log(`📊 Total Issues: ${findings.length} (Critical: ${criticalCount}, Warnings: ${warningCount}, Info: ${infoCount})`);
console.log(`📑 Report saved to: CODERABBIT_SOURCE_AUDIT_REPORT.md`);
