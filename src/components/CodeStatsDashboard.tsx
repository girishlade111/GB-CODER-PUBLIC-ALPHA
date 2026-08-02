import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart3, Code2, FileText, Clock, Zap, Layers, X, 
  RefreshCw, Download, AlertTriangle, CheckCircle2,
  FileCode2, ChevronDown, ChevronRight, Info
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { MultiFileProject, ProjectFile } from '../types/files';

interface CodeStatsDashboardProps {
  project: MultiFileProject;
  aiSuggestionsUsed: number;
  isOpen: boolean;
  onClose: () => void;
}

// Helper types
type Severity = 'good' | 'warning' | 'critical';

// Complexity parser functions
const countLines = (code: string) => code.split('\n').filter(line => line.trim()).length;
const countChars = (code: string) => code.length;

const getCyclomaticComplexity = (code: string): number => {
  const keywords = ['if', 'else', 'for', 'while', 'case', 'catch'];
  let score = 1; // Base complexity
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    score += (code.match(regex) || []).length;
  });
  // Add operators
  score += (code.match(/&&|\|\||\?/g) || []).length;
  return score;
};

const getMaxNestingDepth = (code: string): number => {
  let maxDepth = 0;
  let currentDepth = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (code[i] === '}') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  return maxDepth;
};

const getDuplicateLines = (files: ProjectFile[]): number => {
  // Simple check: looking for chunks of 4+ identical lines across the codebase
  let duplicateCount = 0;
  const lineHashes = new Set<string>();
  
  files.forEach(file => {
    if (file.language === 'json') return; // Skip JSON
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length - 3; i++) {
      const chunk = lines.slice(i, i + 4).map(l => l.trim()).filter(Boolean).join('');
      if (chunk.length > 30) { // Only care about substantial lines
        if (lineHashes.has(chunk)) {
          duplicateCount += 4;
          i += 3; // Skip next few lines to avoid overlapping matches
        } else {
          lineHashes.add(chunk);
        }
      }
    }
  });
  return duplicateCount;
};

const CodeStatsDashboard: React.FC<CodeStatsDashboardProps> = ({
  project,
  aiSuggestionsUsed,
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  
  // Real-time debounced updates
  const [debouncedProject, setDebouncedProject] = useState(project);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Expanded Accordion state
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  
  const toggleFile = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setDebouncedProject(project);
      setLastUpdated(new Date());
      setIsCalculating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [project]);

  const handleRefresh = () => {
    setDebouncedProject(project);
    setLastUpdated(new Date());
  };

  const stats = useMemo(() => {
    const isPlain = debouncedProject.projectType === 'plain';
    
    let htmlLines = 0, cssLines = 0, jsLines = 0, tsLines = 0, otherLines = 0;
    let htmlChars = 0, cssChars = 0, jsChars = 0, tsChars = 0, otherChars = 0;
    
    let htmlTags = 0;
    let cssRules = 0;
    let jsFunctions = 0;
    let componentCount = 0;
    let maxNesting = 0;
    let totalCyclomatic = 0;
    
    // Accessibility & Performance
    let accessibilityIssues = 0;
    let performanceIssues = 0;
    
    // Unused CSS (plain only)
    let unusedCssRules = 0;
    const htmlClasses = new Set<string>();
    const htmlIds = new Set<string>();
    
    // Gather all HTML classes and IDs first if plain
    if (isPlain) {
      const htmlFile = debouncedProject.files.find(f => f.language === 'html');
      if (htmlFile) {
        const classMatches = htmlFile.content.match(/class=["']([^"']+)["']/g) || [];
        classMatches.forEach(m => {
          const classes = m.replace(/class=["']/g, '').replace(/["']/g, '').split(' ');
          classes.forEach(c => htmlClasses.add(c));
        });
        
        const idMatches = htmlFile.content.match(/id=["']([^"']+)["']/g) || [];
        idMatches.forEach(m => {
          const id = m.replace(/id=["']/g, '').replace(/["']/g, '');
          htmlIds.add(id);
        });
      }
    }

    const fileStats = debouncedProject.files.map(file => {
      const lines = countLines(file.content);
      const chars = countChars(file.content);
      let fTags = 0, fRules = 0, fFuncs = 0, fComps = 0, fDepth = 0, fCyclomatic = 0;
      
      fDepth = getMaxNestingDepth(file.content);
      if (fDepth > maxNesting) maxNesting = fDepth;
      
      if (file.language === 'html') {
        htmlLines += lines; htmlChars += chars;
        fTags = (file.content.match(/<[a-zA-Z][^>]*>/g) || []).length;
        htmlTags += fTags;
        
        // A11y checks
        const imgs = file.content.match(/<img[^>]*>/g) || [];
        imgs.forEach(img => {
          if (!img.includes('alt=')) accessibilityIssues++;
          if (!img.includes('loading="lazy"')) performanceIssues++;
        });
        const buttons = file.content.match(/<button[^>]*>/g) || [];
        buttons.forEach(btn => {
          if (!btn.includes('aria-label') && !/>.*?<\/button>/.test(btn)) accessibilityIssues++;
        });
        
      } else if (file.language === 'css') {
        cssLines += lines; cssChars += chars;
        fRules = (file.content.match(/[^{}]+\{[^{}]+\}/g) || []).length;
        cssRules += fRules;
        
        // Check unused CSS in plain projects
        if (isPlain) {
          const selectors = file.content.match(/([.#][a-zA-Z0-9_-]+)(?=\s*\{|\s*,)/g) || [];
          selectors.forEach(sel => {
            if (sel.startsWith('.')) {
              if (!htmlClasses.has(sel.substring(1))) unusedCssRules++;
            } else if (sel.startsWith('#')) {
              if (!htmlIds.has(sel.substring(1))) unusedCssRules++;
            }
          });
        }
        
      } else if (['javascript', 'jsx'].includes(file.language)) {
        jsLines += lines; jsChars += chars;
        fFuncs = (file.content.match(/\bfunction\s*\w*\s*\(|\bconst\s+\w+\s*=\s*(\([^)]*\)|[^=]*)\s*=>|\basync\s+\bfunction/g) || []).length;
        jsFunctions += fFuncs;
        fCyclomatic = getCyclomaticComplexity(file.content);
        totalCyclomatic += fCyclomatic;
        
        if (file.language === 'jsx') {
          fComps = (file.content.match(/\bexport\s+(default\s+)?function\s+[A-Z]\w*/g) || []).length;
          componentCount += fComps;
        }
      } else if (['typescript', 'tsx'].includes(file.language)) {
        tsLines += lines; tsChars += chars;
        fFuncs = (file.content.match(/\bfunction\s*\w*\s*\(|\bconst\s+\w+\s*=\s*(\([^)]*\)|[^=]*)\s*=>|\basync\s+\bfunction/g) || []).length;
        jsFunctions += fFuncs;
        fCyclomatic = getCyclomaticComplexity(file.content);
        totalCyclomatic += fCyclomatic;
        
        if (file.language === 'tsx') {
          fComps = (file.content.match(/\bexport\s+(default\s+)?function\s+[A-Z]\w*/g) || []).length;
          componentCount += fComps;
        }
      } else if (file.language === 'vue') {
        jsLines += lines; jsChars += chars;
        componentCount++;
        fCyclomatic = getCyclomaticComplexity(file.content);
        totalCyclomatic += fCyclomatic;
      } else {
        otherLines += lines; otherChars += chars;
      }

      return {
        path: file.path,
        language: file.language,
        lines,
        chars,
        metrics: { tags: fTags, rules: fRules, funcs: fFuncs, comps: fComps, depth: fDepth, cyclomatic: fCyclomatic }
      };
    });

    const totalLines = htmlLines + cssLines + jsLines + tsLines + otherLines;
    const totalChars = htmlChars + cssChars + jsChars + tsChars + otherChars;
    const totalWords = debouncedProject.files.reduce((acc, f) => acc + f.content.split(/\s+/).length, 0);
    const readTimeMinutes = Math.ceil(totalWords / 200);

    // Duplicate code
    const duplicateLines = getDuplicateLines(debouncedProject.files);

    // Quality Scores (0-100)
    const accScore = Math.max(0, 100 - (accessibilityIssues * 5));
    const perfScore = Math.max(0, 100 - (performanceIssues * 5) - (duplicateLines > 20 ? 10 : 0));

    return {
      isPlain,
      lines: { html: htmlLines, css: cssLines, js: jsLines, ts: tsLines, other: otherLines, total: totalLines },
      chars: { total: totalChars },
      patterns: { htmlTags, cssRules, jsFunctions, componentCount },
      quality: { maxNesting, totalCyclomatic, duplicateLines, unusedCssRules, accScore, perfScore },
      readTimeMinutes,
      fileStats
    };
  }, [debouncedProject]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      projectType: debouncedProject.projectType,
      summary: {
        totalLines: stats.lines.total,
        totalFiles: debouncedProject.files.length,
        sizeKB: (stats.chars.total / 1024).toFixed(2),
      },
      quality: stats.quality,
      patterns: stats.patterns,
      files: stats.fileStats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-stats-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [debouncedProject, stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-surface-raised border border-stroke-subtle' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b shrink-0 ${
          isDark ? 'border-stroke-subtle bg-surface-overlay' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-accent-subtle text-accent-hover rounded-xl shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Code Analytics
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isCalculating ? 'Calculating...' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </span>
                {isCalculating && <RefreshCw className="w-3 h-3 animate-spin text-accent" />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-accent/20 hover:bg-accent/30 text-accent-hover' : 'bg-accent/10 hover:bg-accent/20 text-accent'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            <div className={`w-px h-6 mx-2 ${isDark ? 'bg-stroke-subtle' : 'bg-gray-300'}`} />
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-surface-base' : 'bg-white'}`}>
          
          {/* Top Level Metrics (General Metrics) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <MetricCard icon={Code2} label="Total Lines" value={stats.lines.total} isDark={isDark} color="blue" />
            <MetricCard icon={FileText} label="Size (KB)" value={(stats.chars.total / 1024).toFixed(1)} isDark={isDark} color="green" />
            <MetricCard 
              icon={FileCode2} 
              label={stats.isPlain ? "HTML Elements" : "Components"} 
              value={stats.isPlain ? stats.patterns.htmlTags : stats.patterns.componentCount} 
              isDark={isDark} color="orange" 
            />
            <MetricCard icon={Layers} label="CSS Rules" value={stats.patterns.cssRules} isDark={isDark} color="pink" />
            <MetricCard icon={Zap} label="JS Functions" value={stats.patterns.jsFunctions} isDark={isDark} color="yellow" />
            <MetricCard icon={Zap} label="AI Helps" value={aiSuggestionsUsed} isDark={isDark} color="purple" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Language Breakdown Section (2/3 width) */}
            <div className={`lg:col-span-2 p-5 rounded-xl border ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Language Breakdown
              </h3>
              
              {/* Interactive Bar */}
              <div className={`h-4 rounded-full overflow-hidden flex mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                {stats.lines.html > 0 && <BarSegment color="bg-orange-500" value={stats.lines.html} total={stats.lines.total} name="HTML" />}
                {stats.lines.css > 0 && <BarSegment color="bg-blue-500" value={stats.lines.css} total={stats.lines.total} name="CSS" />}
                {stats.lines.js > 0 && <BarSegment color="bg-yellow-500" value={stats.lines.js} total={stats.lines.total} name="JS" />}
                {stats.lines.ts > 0 && <BarSegment color="bg-blue-400" value={stats.lines.ts} total={stats.lines.total} name="TS" />}
                {stats.lines.other > 0 && <BarSegment color="bg-gray-500" value={stats.lines.other} total={stats.lines.total} name="Other" />}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                {stats.lines.html > 0 && <LegendItem color="bg-orange-500" name="HTML" value={stats.lines.html} total={stats.lines.total} isDark={isDark} />}
                {stats.lines.css > 0 && <LegendItem color="bg-blue-500" name="CSS" value={stats.lines.css} total={stats.lines.total} isDark={isDark} />}
                {stats.lines.js > 0 && <LegendItem color="bg-yellow-500" name="JavaScript" value={stats.lines.js} total={stats.lines.total} isDark={isDark} />}
                {stats.lines.ts > 0 && <LegendItem color="bg-blue-400" name="TypeScript" value={stats.lines.ts} total={stats.lines.total} isDark={isDark} />}
                {stats.lines.other > 0 && <LegendItem color="bg-gray-500" name="Other" value={stats.lines.other} total={stats.lines.total} isDark={isDark} />}
              </div>

              {/* Multi-file drill-down */}
              {!stats.isPlain && (
                <div className="mt-6 pt-6 border-t border-stroke-subtle">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Files ({debouncedProject.files.length})
                  </h4>
                  <div className="space-y-2">
                    {stats.fileStats.map(file => (
                      <div key={file.path} className={`rounded-md border ${isDark ? 'border-gray-800 bg-black/20' : 'border-gray-200 bg-white'}`}>
                        <button 
                          onClick={() => toggleFile(file.path)}
                          className={`w-full flex items-center justify-between p-3 text-sm hover:bg-black/10 transition-colors ${file.path === debouncedProject.entry ? 'font-bold' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            {expandedFiles.has(file.path) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{file.path}</span>
                            {file.path === debouncedProject.entry && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent-hover uppercase">Entry</span>
                            )}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {file.lines} lines
                          </div>
                        </button>
                        {expandedFiles.has(file.path) && (
                          <div className={`p-3 pt-0 text-xs grid grid-cols-2 gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div>Complexity: <strong className="text-content-primary">{file.metrics.cyclomatic}</strong></div>
                            <div>Max Nesting: <strong className="text-content-primary">{file.metrics.depth}</strong></div>
                            <div>Functions: <strong className="text-content-primary">{file.metrics.funcs}</strong></div>
                            <div>Size: <strong className="text-content-primary">{(file.chars / 1024).toFixed(1)} KB</strong></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quality & Complexity (1/3 width) */}
            <div className={`p-5 rounded-xl border flex flex-col ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Quality Scores
              </h3>
              
              <div className="space-y-4 flex-1">
                <ScoreRow label="Accessibility" score={stats.quality.accScore} isDark={isDark} />
                <ScoreRow label="Performance" score={stats.quality.perfScore} isDark={isDark} />
                
                <div className={`my-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                
                <InsightRow 
                  label="Cyclomatic Complexity" 
                  value={stats.quality.totalCyclomatic} 
                  severity={stats.quality.totalCyclomatic > 20 ? 'warning' : 'good'} 
                  isDark={isDark} 
                />
                <InsightRow 
                  label="Max Nesting Depth" 
                  value={stats.quality.maxNesting} 
                  severity={stats.quality.maxNesting > 4 ? 'critical' : stats.quality.maxNesting > 3 ? 'warning' : 'good'} 
                  isDark={isDark} 
                />
                <InsightRow 
                  label="Duplicate Lines" 
                  value={stats.quality.duplicateLines} 
                  severity={stats.quality.duplicateLines > 10 ? 'warning' : 'good'} 
                  isDark={isDark} 
                />
                {stats.isPlain && (
                  <InsightRow 
                    label="Unused CSS Rules" 
                    value={stats.quality.unusedCssRules} 
                    severity={stats.quality.unusedCssRules > 5 ? 'warning' : 'good'} 
                    isDark={isDark} 
                  />
                )}
              </div>
              
              <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-accent-subtle/50 text-accent-hover' : 'bg-purple-50 text-purple-700'}`}>
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Estimated read time for this codebase is <strong>{stats.readTimeMinutes} minutes</strong>. 
                  {stats.quality.maxNesting > 4 && " Consider refactoring nested loops/conditionals."}
                  {stats.quality.unusedCssRules > 0 && " Cleaning up unused CSS can improve load times."}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const MetricCard = ({ icon: Icon, label, value, isDark, color }: any) => {
  const colorMap: any = {
    blue: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200',
    green: isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-200',
    orange: isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200',
    pink: isDark ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-600 border-pink-200',
    yellow: isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-surface-overlay border-stroke-subtle' : 'bg-white border-gray-200'} shadow-sm transition-transform hover:-translate-y-1`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className={`text-2xl font-bold tabular-nums mb-1 ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

const BarSegment = ({ color, value, total, name }: any) => {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <div 
      className={`${color} transition-all duration-700 ease-out group relative cursor-crosshair`} 
      style={{ width: `${pct}%` }}
    >
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
        {name}: {value} lines ({pct}%)
      </div>
    </div>
  );
};

const LegendItem = ({ color, name, value, total, isDark }: any) => {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{name}</span>
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>({pct}%)</span>
    </div>
  );
};

const ScoreRow = ({ label, score, isDark }: any) => {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <span className={`text-sm font-bold ${getColor(score)}`}>{score}/100</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div 
          className={`h-full transition-all duration-1000 ${score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
};

const InsightRow = ({ label, value, severity, isDark }: any) => {
  const getIcon = () => {
    if (severity === 'good') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
};

export default CodeStatsDashboard;
