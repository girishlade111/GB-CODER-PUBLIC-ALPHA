import React, { useMemo, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Filter } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { codeValidationService, ValidationError } from '../services/codeValidationService';

interface ValidationPanelProps {
  html: string;
  css: string;
  javascript: string;
  isOpen: boolean;
  onClose: () => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  html,
  css,
  javascript,
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const validationResults = useMemo(() => {
    return codeValidationService.validateAll(html, css, javascript);
  }, [html, css, javascript]);

  const filteredErrors = useMemo(() => {
    const allErrors = [
      ...validationResults.html,
      ...validationResults.css,
      ...validationResults.javascript,
    ];

    return allErrors.filter(error => {
      if (filterSeverity !== 'all' && error.severity !== filterSeverity) return false;
      if (filterSource !== 'all' && error.source !== filterSource) return false;
      return true;
    });
  }, [validationResults, filterSeverity, filterSource]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              validationResults.stats.score >= 70
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : validationResults.stats.score >= 50
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-red-500 to-rose-500'
            }`}>
              {validationResults.stats.score >= 70 ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : validationResults.stats.score >= 50 ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : (
                <X className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Code Validation
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Score: <strong>{validationResults.stats.score}/100</strong>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  validationResults.stats.score >= 70
                    ? 'bg-green-500/20 text-green-500'
                    : validationResults.stats.score >= 50
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {codeValidationService.getValidationStatus(validationResults.stats.score).label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-4 p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
            <p className="text-2xl font-bold text-red-500">{validationResults.stats.errors}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Errors</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
            <p className="text-2xl font-bold text-yellow-500">{validationResults.stats.warnings}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Warnings</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
            <p className="text-2xl font-bold text-blue-500">{validationResults.stats.info}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Info</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`flex gap-2 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Filter:</span>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
            }`}
          >
            <option value="all">All Severities</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
            }`}
          >
            <option value="all">All Sources</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {/* Errors List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {filteredErrors.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`p-6 rounded-full mb-4 ${
                validationResults.stats.errors === 0
                  ? 'bg-green-500/20'
                  : 'bg-gray-500/20'
              }`}>
                <CheckCircle className={`w-12 h-12 ${
                  validationResults.stats.errors === 0
                    ? 'text-green-500'
                    : 'text-gray-500'
                }`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {validationResults.stats.errors === 0
                  ? 'No Errors Found!'
                  : 'No matching issues'}
              </h3>
              <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                {validationResults.stats.errors === 0
                  ? 'Your code looks clean!'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredErrors.map((error, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${getSeverityColor(error.severity)} ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {error.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Line {error.line}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {error.source.toUpperCase()}
                        </span>
                        {error.rule && (
                          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {error.rule}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredErrors.length} of {
              validationResults.html.length +
              validationResults.css.length +
              validationResults.javascript.length
            } issues
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
