import React, { useMemo } from 'react';
import { BarChart3, Code2, FileText, Clock, Zap, Layers } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface CodeStatsDashboardProps {
  html: string;
  css: string;
  javascript: string;
  isOpen: boolean;
  onClose: () => void;
}

const CodeStatsDashboard: React.FC<CodeStatsDashboardProps> = ({
  html,
  css,
  javascript,
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();

  const stats = useMemo(() => {
    const countLines = (code: string) => code.split('\n').filter(line => line.trim()).length;
    const countChars = (code: string) => code.length;
    const countWords = (code: string) => code.split(/\s+/).filter(word => word.length > 0).length;

    const htmlLines = countLines(html);
    const cssLines = countLines(css);
    const jsLines = countLines(javascript);

    const htmlChars = countChars(html);
    const cssChars = countChars(css);
    const jsChars = countChars(javascript);

    // Detect patterns
    const htmlTags = (html.match(/<[^>]+>/g) || []).length;
    const cssRules = (css.match(/[^{}]+\{[^{}]+\}/g) || []).length;
    const jsFunctions = (javascript.match(/\bfunction\s*\w*\s*\(|\bconst\s+\w+\s*=\s*\(|\basync\s+\bfunction/g) || []).length;
    const jsClasses = (javascript.match(/\bclass\s+\w+/g) || []).length;

    // Estimate complexity
    const complexity = {
      html: htmlLines > 100 ? 'High' : htmlLines > 50 ? 'Medium' : 'Low',
      css: cssLines > 200 ? 'High' : cssLines > 100 ? 'Medium' : 'Low',
      js: jsLines > 150 ? 'High' : jsLines > 75 ? 'Medium' : 'Low',
    };

    // Read time estimate (average reading speed: 200 words per minute)
    const totalWords = countWords(html) + countWords(css) + countWords(javascript);
    const readTimeMinutes = Math.ceil(totalWords / 200);

    return {
      lines: {
        html: htmlLines,
        css: cssLines,
        js: jsLines,
        total: htmlLines + cssLines + jsLines,
      },
      chars: {
        html: htmlChars,
        css: cssChars,
        js: jsChars,
        total: htmlChars + cssChars + jsChars,
      },
      patterns: {
        htmlTags,
        cssRules,
        jsFunctions,
        jsClasses,
      },
      complexity,
      readTimeMinutes,
      percentages: {
        html: ((htmlLines / (htmlLines + cssLines + jsLines || 1)) * 100).toFixed(1),
        css: ((cssLines / (htmlLines + cssLines + jsLines || 1)) * 100).toFixed(1),
        js: ((jsLines / (htmlLines + cssLines + jsLines || 1)) * 100).toFixed(1),
      },
    };
  }, [html, css, javascript]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Code Statistics
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time analytics of your code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto max-h-[70vh] ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Code2}
              label="Total Lines"
              value={stats.lines.total.toString()}
              color="from-purple-500 to-blue-500"
              isDark={isDark}
            />
            <StatCard
              icon={FileText}
              label="Total Characters"
              value={stats.chars.total.toLocaleString()}
              color="from-green-500 to-emerald-500"
              isDark={isDark}
            />
            <StatCard
              icon={Layers}
              label="HTML Tags"
              value={stats.patterns.htmlTags.toString()}
              color="from-orange-500 to-red-500"
              isDark={isDark}
            />
            <StatCard
              icon={Zap}
              label="JS Functions"
              value={stats.patterns.jsFunctions.toString()}
              color="from-yellow-500 to-amber-500"
              isDark={isDark}
            />
          </div>

          {/* Language Breakdown */}
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Language Breakdown
            </h3>
            
            <div className="space-y-4">
              <LanguageBar
                name="HTML"
                lines={stats.lines.html}
                percentage={parseFloat(stats.percentages.html)}
                color="bg-orange-500"
                isDark={isDark}
              />
              <LanguageBar
                name="CSS"
                lines={stats.lines.css}
                percentage={parseFloat(stats.percentages.css)}
                color="bg-blue-500"
                isDark={isDark}
              />
              <LanguageBar
                name="JavaScript"
                lines={stats.lines.js}
                percentage={parseFloat(stats.percentages.js)}
                color="bg-yellow-500"
                isDark={isDark}
              />
            </div>

            {/* Progress bar visualization */}
            <div className={`mt-4 h-3 rounded-full overflow-hidden flex ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="bg-orange-500 transition-all duration-500"
                style={{ width: `${stats.percentages.html}%` }}
              />
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${stats.percentages.css}%` }}
              />
              <div
                className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${stats.percentages.js}%` }}
              />
            </div>
          </div>

          {/* Code Patterns */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Code Patterns
              </h3>
              <div className="space-y-2">
                <PatternRow label="HTML Tags" value={stats.patterns.htmlTags} isDark={isDark} />
                <PatternRow label="CSS Rules" value={stats.patterns.cssRules} isDark={isDark} />
                <PatternRow label="JavaScript Functions" value={stats.patterns.jsFunctions} isDark={isDark} />
                <PatternRow label="JavaScript Classes" value={stats.patterns.jsClasses} isDark={isDark} />
              </div>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Complexity Analysis
              </h3>
              <div className="space-y-2">
                <ComplexityRow label="HTML" complexity={stats.complexity.html} isDark={isDark} />
                <ComplexityRow label="CSS" complexity={stats.complexity.css} isDark={isDark} />
                <ComplexityRow label="JavaScript" complexity={stats.complexity.js} isDark={isDark} />
              </div>
              
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Estimated read time: <strong>{stats.readTimeMinutes} min</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className={`p-4 rounded-xl ${
            isDark 
              ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700' 
              : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              💡 <strong>Tip:</strong> Keep your code organized. Aim for functions under 50 lines and CSS rules under 200 lines for better maintainability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  isDark: boolean;
}> = ({ icon: Icon, label, value, color, isDark }) => (
  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
    <p className={`text-xl font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>{value}</p>
  </div>
);

const LanguageBar: React.FC<{
  name: string;
  lines: number;
  percentage: number;
  color: string;
  isDark: boolean;
}> = ({ name, lines, percentage, color, isDark }) => (
  <div className="flex items-center gap-3">
    <div className={`w-16 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{name}</div>
    <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
    <div className={`w-16 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      {lines} lines
    </div>
  </div>
);

const PatternRow: React.FC<{ label: string; value: number; isDark: boolean }> = ({ label, value, isDark }) => (
  <div className="flex justify-between items-center">
    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
  </div>
);

const ComplexityRow: React.FC<{ label: string; complexity: string; isDark: boolean }> = ({ label, complexity, isDark }) => {
  const getColor = () => {
    switch (complexity) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm font-medium ${getColor()}`}>{complexity}</span>
    </div>
  );
};

export default CodeStatsDashboard;
