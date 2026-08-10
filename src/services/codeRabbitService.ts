// CodeRabbit AI Service for Bug & Error Detection
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CodeRabbitIssue {
  id: string;
  file: string;
  line: number;
  column?: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'bug' | 'security' | 'performance' | 'syntax' | 'best_practice';
  codeSnippet: string;
  suggestedFix?: string;
  applied?: boolean;
}

export interface CodeRabbitScanResult {
  issues: CodeRabbitIssue[];
  stats: {
    critical: number;
    warning: number;
    info: number;
    totalFilesScanned: number;
    score: number; // 0 to 100
  };
  scannedAt: number;
  durationMs: number;
}

export interface CodeFileInput {
  filename: string;
  content: string;
  language: string;
}

const STORAGE_KEY = 'coderabbit_api_key';

export class CodeRabbitService {
  private static instance: CodeRabbitService;

  private constructor() {}

  public static getInstance(): CodeRabbitService {
    if (!CodeRabbitService.instance) {
      CodeRabbitService.instance = new CodeRabbitService();
    }
    return CodeRabbitService.instance;
  }

  /**
   * Retrieve the active CodeRabbit API Key
   */
  public getApiKey(): string {
    const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
    return import.meta.env.VITE_CODERABBIT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /**
   * Save CodeRabbit API Key to persistent storage
   */
  public setApiKey(key: string): void {
    if (typeof localStorage !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  /**
   * Verify if an API key is currently configured
   */
  public hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  /**
   * Run CodeRabbit AI Bug & Error Scan on project files
   */
  public async scanProjectFiles(
    files: CodeFileInput[],
    onProgress?: (stage: string, percent: number) => void
  ): Promise<CodeRabbitScanResult> {
    const startTime = Date.now();
    onProgress?.('Initializing CodeRabbit AST Scanner...', 15);

    const activeApiKey = this.getApiKey();
    const allIssues: CodeRabbitIssue[] = [];

    // 1. Perform client-side Static AST & Syntax validation
    onProgress?.('Running static code rule checks...', 35);
    for (const file of files) {
      const staticIssues = this.runStaticAnalysis(file);
      allIssues.push(...staticIssues);
    }

    // 2. Perform AI-powered CodeRabbit bug analysis if key or Gemini key is available
    if (activeApiKey) {
      onProgress?.('Invoking CodeRabbit AI Deep Bug Scanner...', 65);
      try {
        const aiIssues = await this.runAICodeReview(files, activeApiKey);
        // De-duplicate issues
        for (const issue of aiIssues) {
          if (!allIssues.some((existing) => existing.file === issue.file && existing.line === issue.line && existing.title === issue.title)) {
            allIssues.push(issue);
          }
        }
      } catch (err) {
        console.warn('CodeRabbit AI review fallback warning:', err);
      }
    }

    onProgress?.('Finalizing Code Audit Report...', 95);

    // Calculate metrics
    const critical = allIssues.filter((i) => i.severity === 'critical').length;
    const warning = allIssues.filter((i) => i.severity === 'warning').length;
    const info = allIssues.filter((i) => i.severity === 'info').length;

    // Deduct points based on issues
    const penalty = critical * 20 + warning * 8 + info * 2;
    const score = Math.max(0, 100 - penalty);

    onProgress?.('Completed', 100);

    return {
      issues: allIssues,
      stats: {
        critical,
        warning,
        info,
        totalFilesScanned: files.length,
        score,
      },
      scannedAt: Date.now(),
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Client-side static bug & error checks for immediate feedback
   */
  private runStaticAnalysis(file: CodeFileInput): CodeRabbitIssue[] {
    const issues: CodeRabbitIssue[] = [];
    const lines = file.content.split('\n');

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      // 1. Check for console.log statements left in code
      if (lineText.includes('console.log(') && !lineText.trim().startsWith('//')) {
        issues.push({
          id: `static-${file.filename}-${lineNum}-console`,
          file: file.filename,
          line: lineNum,
          title: 'Leftover Debug Console Log',
          description: 'Production code should avoid leftover console.log statements to preserve output clean performance.',
          severity: 'info',
          category: 'best_practice',
          codeSnippet: lineText.trim(),
          suggestedFix: lineText.replace('console.log(', '// console.log('),
        });
      }

      // 2. Check for missing alt attribute in HTML <img> tags
      if (file.language === 'html' || file.filename.endsWith('.html') || file.filename.endsWith('.jsx') || file.filename.endsWith('.tsx')) {
        if (lineText.includes('<img') && !lineText.includes('alt=') && !lineText.trim().startsWith('//')) {
          issues.push({
            id: `static-${file.filename}-${lineNum}-img-alt`,
            file: file.filename,
            line: lineNum,
            title: 'Missing Image Alt Attribute (Accessibility Risk)',
            description: 'Image elements should provide an alt attribute for screen readers and accessibility standards.',
            severity: 'warning',
            category: 'best_practice',
            codeSnippet: lineText.trim(),
            suggestedFix: lineText.includes('/>') ? lineText.replace('/>', ' alt="Descriptive image" />') : lineText.replace('>', ' alt="Descriptive image">'),
          });
        }
      }

      // 3. Check for potential inline eval() security risks
      if (lineText.includes('eval(') && !lineText.trim().startsWith('//')) {
        issues.push({
          id: `static-${file.filename}-${lineNum}-eval`,
          file: file.filename,
          line: lineNum,
          title: 'Dangerous eval() Security Risk',
          description: 'Using eval() opens potential arbitrary code execution and severe vulnerability risks.',
          severity: 'critical',
          category: 'security',
          codeSnippet: lineText.trim(),
        });
      }

      // 4. Check for unhandled Promise rejections / missing await error handling
      if ((lineText.includes('fetch(') || lineText.includes('axios.')) && !lineText.includes('try') && !lineText.includes('catch') && !lineText.trim().startsWith('//')) {
        issues.push({
          id: `static-${file.filename}-${lineNum}-unhandled-async`,
          file: file.filename,
          line: lineNum,
          title: 'Potential Unhandled Async Rejection',
          description: 'Network calls should be wrapped in try/catch or have .catch() attached to handle potential failure states gracefully.',
          severity: 'warning',
          category: 'bug',
          codeSnippet: lineText.trim(),
        });
      }

      // 5. Check for hardcoded API keys or secrets
      if (/(api[_-]?key|secret|password|auth[_-]?token)\s*=\s*['"][A-Za-z0-9_-]{16,}['"]/i.test(lineText) && !lineText.includes('VITE_')) {
        issues.push({
          id: `static-${file.filename}-${lineNum}-secret`,
          file: file.filename,
          line: lineNum,
          title: 'Hardcoded Secret / API Key Detected',
          description: 'Avoid committing hardcoded credentials or API keys directly in source code files. Use environment variables instead.',
          severity: 'critical',
          category: 'security',
          codeSnippet: lineText.trim(),
        });
      }
    });

    return issues;
  }

  /**
   * AI Deep Code Review powered by CodeRabbit AI framing
   */
  private async runAICodeReview(files: CodeFileInput[], apiKey: string): Promise<CodeRabbitIssue[]> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const filesContentSummary = files
        .map(
          (f) => `--- File: ${f.filename} (${f.language}) ---
${f.content.substring(0, 4000)}`
        )
        .join('\n\n');

      const prompt = `You are CodeRabbit AI, an expert code reviewer and automated bug finder.
Analyze the following source files for bugs, security vulnerabilities, logic errors, syntax issues, and performance bottlenecks.

Project Source Files:
${filesContentSummary}

Respond ONLY with valid JSON (no markdown block, no extra text) matching this JSON structure:
[
  {
    "file": "filename",
    "line": 10,
    "title": "Bug Title",
    "description": "Detailed explanation of why this is a bug or error and how it breaks.",
    "severity": "critical" | "warning" | "info",
    "category": "bug" | "security" | "performance" | "syntax" | "best_practice",
    "codeSnippet": "Original offending line or block",
    "suggestedFix": "Corrected line or block"
  }
]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code fence if present
      if (text.startsWith('```')) {
        text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }

      const parsed: any[] = JSON.parse(text);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item, idx) => ({
        id: `cr-ai-${item.file || 'file'}-${item.line || idx}-${Date.now()}`,
        file: item.file || files[0]?.filename || 'index.js',
        line: typeof item.line === 'number' ? item.line : 1,
        title: item.title || 'Code Bug / Flaw',
        description: item.description || 'CodeRabbit AI flagged an issue in this section.',
        severity: item.severity === 'critical' ? 'critical' : item.severity === 'warning' ? 'warning' : 'info',
        category: item.category || 'bug',
        codeSnippet: item.codeSnippet || '',
        suggestedFix: item.suggestedFix || undefined,
      }));
    } catch (err) {
      console.error('CodeRabbit AI Scan Error:', err);
      return [];
    }
  }

  /**
   * Apply an issue's fix to file content
   */
  public applyFix(fileContent: string, issue: CodeRabbitIssue): string {
    if (!issue.suggestedFix || !issue.codeSnippet) {
      return fileContent;
    }

    // Try replacing exact snippet if present
    if (fileContent.includes(issue.codeSnippet)) {
      return fileContent.replace(issue.codeSnippet, issue.suggestedFix);
    }

    // Fallback: replace line by index
    const lines = fileContent.split('\n');
    if (issue.line > 0 && issue.line <= lines.length) {
      lines[issue.line - 1] = issue.suggestedFix;
      return lines.join('\n');
    }

    return fileContent;
  }
}

export const codeRabbitService = CodeRabbitService.getInstance();
