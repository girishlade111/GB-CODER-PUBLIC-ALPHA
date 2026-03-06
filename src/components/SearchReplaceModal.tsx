import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  X,
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  CaseSensitive,
  WholeWord,
  Regex,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface SearchReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  javascript: string;
  onReplace: (language: "html" | "css" | "javascript", newCode: string) => void;
}

interface Match {
  language: "html" | "css" | "javascript";
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
  fullMatch: string;
}

type SearchScope = "all" | "html" | "css" | "javascript";

const SearchReplaceModal: React.FC<SearchReplaceModalProps> = ({
  isOpen,
  onClose,
  html,
  css,
  javascript,
  onReplace,
}) => {
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [
    searchQuery,
    caseSensitive,
    wholeWord,
    useRegex,
    searchScope,
    html,
    css,
    javascript,
  ]);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: Match[] = [];
    const languages: Array<{
      code: string;
      lang: "html" | "css" | "javascript";
    }> = [];

    if (searchScope === "all" || searchScope === "html") {
      languages.push({ code: html, lang: "html" });
    }
    if (searchScope === "all" || searchScope === "css") {
      languages.push({ code: css, lang: "css" });
    }
    if (searchScope === "all" || searchScope === "javascript") {
      languages.push({ code: javascript, lang: "javascript" });
    }

    let pattern: RegExp;
    try {
      let patternStr = searchQuery;
      if (!useRegex) {
        patternStr = patternStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (wholeWord) {
        patternStr = `\\b${patternStr}\\b`;
      }
      const flags = caseSensitive ? "g" : "gi";
      pattern = new RegExp(patternStr, flags);
    } catch {
      return [];
    }

    languages.forEach(({ code, lang }) => {
      const lines = code.split("\n");
      lines.forEach((line, lineIndex) => {
        let match;
        const linePattern = new RegExp(pattern.source, pattern.flags);
        while ((match = linePattern.exec(line)) !== null) {
          results.push({
            language: lang,
            lineNumber: lineIndex + 1,
            lineContent: line,
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
            fullMatch: match[0],
          });
          if (!pattern.global) break;
        }
      });
    });

    return results;
  }, [
    searchQuery,
    html,
    css,
    javascript,
    caseSensitive,
    wholeWord,
    useRegex,
    searchScope,
  ]);

  const handlePreviousMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev === 0 ? matches.length - 1 : prev - 1,
    );
  }, [matches.length]);

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev === matches.length - 1 ? 0 : prev + 1,
    );
  }, [matches.length]);

  const handleReplaceSingle = useCallback(() => {
    if (matches.length === 0 || !replaceQuery.trim()) return;

    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch) return;

    const { language, lineContent, matchStart, matchEnd } = currentMatch;

    const newLineContent =
      lineContent.substring(0, matchStart) +
      replaceQuery +
      lineContent.substring(matchEnd);
    const lines =
      language === "html"
        ? html.split("\n")
        : language === "css"
          ? css.split("\n")
          : javascript.split("\n");
    lines[currentMatch.lineNumber - 1] = newLineContent;
    const newCode = lines.join("\n");

    onReplace(language, newCode);
  }, [
    matches,
    currentMatchIndex,
    replaceQuery,
    html,
    css,
    javascript,
    onReplace,
  ]);

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery.trim() || !replaceQuery.trim()) return;

    let newHtml = html;
    let newCss = css;
    let newJavascript = javascript;

    try {
      let patternStr = searchQuery;
      if (!useRegex) {
        patternStr = patternStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (wholeWord) {
        patternStr = `\\b${patternStr}\\b`;
      }
      const flags = caseSensitive ? "g" : "gi";
      const pattern = new RegExp(patternStr, flags);

      if (searchScope === "all" || searchScope === "html") {
        newHtml = html.replace(pattern, replaceQuery);
      }
      if (searchScope === "all" || searchScope === "css") {
        newCss = css.replace(pattern, replaceQuery);
      }
      if (searchScope === "all" || searchScope === "javascript") {
        newJavascript = javascript.replace(pattern, replaceQuery);
      }

      if (searchScope === "all" || searchScope === "html") {
        if (newHtml !== html) onReplace("html", newHtml);
      }
      if (searchScope === "all" || searchScope === "css") {
        if (newCss !== css) onReplace("css", newCss);
      }
      if (searchScope === "all" || searchScope === "javascript") {
        if (newJavascript !== javascript)
          onReplace("javascript", newJavascript);
      }
    } catch {
      return;
    }
  }, [
    searchQuery,
    replaceQuery,
    html,
    css,
    javascript,
    caseSensitive,
    wholeWord,
    useRegex,
    searchScope,
    onReplace,
  ]);

  const highlightMatch = (
    text: string,
    matchStart: number,
    matchEnd: number,
  ) => {
    const before = text.substring(0, matchStart);
    const match = text.substring(matchStart, matchEnd);
    const after = text.substring(matchEnd);

    return (
      <>
        {before}
        <span className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">
          {match}
        </span>
        {after}
      </>
    );
  };

  if (!isOpen) return null;

  const scopeOptions: { value: SearchScope; label: string }[] = [
    { value: "all", label: "All Files" },
    { value: "html", label: "HTML Only" },
    { value: "css", label: "CSS Only" },
    { value: "javascript", label: "JavaScript Only" },
  ];

  const languageLabels = {
    html: "HTML",
    css: "CSS",
    javascript: "JavaScript",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl mx-4 rounded-xl shadow-vscode-modal animate-scale-in border ${
          isDark ? "bg-dark-gray border-gray-700" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <Search
              className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
            />
            <h2
              className={`text-xl font-bold ${isDark ? "text-bright-white" : "text-gray-900"}`}
            >
              Search & Replace
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Search and Replace Inputs */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-matte-black border-gray-700 text-bright-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Replace with..."
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-matte-black border-gray-700 text-bright-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggles */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCaseSensitive(!caseSensitive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  caseSensitive
                    ? isDark
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-blue-500 bg-blue-50 text-blue-600"
                    : isDark
                      ? "border-gray-700 text-gray-400 hover:border-gray-600"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
                title="Case Sensitive"
              >
                <CaseSensitive className="w-4 h-4" />
                <span>Aa</span>
              </button>
              <button
                onClick={() => setWholeWord(!wholeWord)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  wholeWord
                    ? isDark
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-blue-500 bg-blue-50 text-blue-600"
                    : isDark
                      ? "border-gray-700 text-gray-400 hover:border-gray-600"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
                title="Whole Word"
              >
                <WholeWord className="w-4 h-4" />
                <span>Ab</span>
              </button>
              <button
                onClick={() => setUseRegex(!useRegex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  useRegex
                    ? isDark
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-blue-500 bg-blue-50 text-blue-600"
                    : isDark
                      ? "border-gray-700 text-gray-400 hover:border-gray-600"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
                title="Use Regex"
              >
                <Regex className="w-4 h-4" />
                <span>.*</span>
              </button>
            </div>

            {/* Scope Selector */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Scope:
              </span>
              <div className="flex gap-1">
                {scopeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSearchScope(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      searchScope === option.value
                        ? isDark
                          ? "bg-blue-600 text-white"
                          : "bg-blue-600 text-white"
                        : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Match Count and Navigation */}
          <div className="flex items-center justify-between">
            <div
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {searchQuery.trim() ? (
                <span>
                  {matches.length} {matches.length === 1 ? "match" : "matches"}{" "}
                  found
                  {matches.length > 0 && (
                    <span className="ml-2">
                      ({currentMatchIndex + 1} of {matches.length})
                    </span>
                  )}
                </span>
              ) : (
                <span>Enter a search term to find matches</span>
              )}
            </div>
            {matches.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMatch}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Previous Match"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMatch}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Next Match"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div
            className={`rounded-lg border ${
              isDark
                ? "border-gray-700 bg-matte-black"
                : "border-gray-300 bg-gray-50"
            } max-h-64 overflow-y-auto`}
          >
            {matches.length === 0 && searchQuery.trim() ? (
              <div
                className={`p-4 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                No matches found
              </div>
            ) : matches.length === 0 ? (
              <div
                className={`p-4 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                No matches to display
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {matches.map((match, index) => (
                  <div
                    key={`${match.language}-${match.lineNumber}-${index}`}
                    onClick={() => {
                      setCurrentMatchIndex(index);
                    }}
                    className={`p-3 cursor-pointer transition-colors ${
                      index === currentMatchIndex
                        ? isDark
                          ? "bg-blue-500/20"
                          : "bg-blue-50"
                        : isDark
                          ? "hover:bg-gray-800"
                          : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          match.language === "html"
                            ? isDark
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-orange-100 text-orange-600"
                            : match.language === "css"
                              ? isDark
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-blue-100 text-blue-600"
                              : isDark
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {languageLabels[match.language]}
                      </span>
                      <span
                        className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                      >
                        Line {match.lineNumber}
                      </span>
                      {index === currentMatchIndex && (
                        <span
                          className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-sm font-mono ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {highlightMatch(
                        match.lineContent,
                        match.matchStart,
                        match.matchEnd,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Replace Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReplaceSingle}
              disabled={matches.length === 0 || !replaceQuery.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                matches.length === 0 || !replaceQuery.trim()
                  ? isDark
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Replace className="w-4 h-4" />
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={matches.length === 0 || !replaceQuery.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                matches.length === 0 || !replaceQuery.trim()
                  ? isDark
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isDark
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <ArrowDown className="w-4 h-4" />
              Replace All
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mr-auto">
            <span
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
            >
              Keyboard: Enter = Next, Shift+Enter = Previous
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchReplaceModal;
