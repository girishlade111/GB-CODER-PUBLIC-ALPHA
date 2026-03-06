import React, { useState } from 'react';
import { Book, Code2, Brain, Zap, FileText, Settings, Package, History, Keyboard, Search, ChevronRight, Terminal, Eye, Wrench, Star, Lightbulb, Layout, Sparkles, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const DocumentationPage: React.FC = () => {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: <Zap className="w-5 h-5" /> },
        { id: 'editor', title: 'Editor Features', icon: <Code2 className="w-5 h-5" /> },
        { id: 'ai', title: 'AI Features', icon: <Brain className="w-5 h-5" /> },
        { id: 'preview', title: 'Preview & Console', icon: <Eye className="w-5 h-5" /> },
        { id: 'projects', title: 'Project Management', icon: <FileText className="w-5 h-5" /> },
        { id: 'files', title: 'File Management', icon: <Upload className="w-5 h-5" /> },
        { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5" /> },
        { id: 'snippets', title: 'Snippets', icon: <Package className="w-5 h-5" /> },
        { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: <Keyboard className="w-5 h-5" /> },
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
            {/* SEO Meta */}
            <div style={{ display: 'none' }}>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TechArticle",
                        "headline": "GB Coder Documentation - Complete Feature Guide",
                        "description": "Comprehensive documentation for GB Coder AI-powered code editor covering all features, tools, and functionality",
                        "keywords": "code editor documentation, online IDE guide, AI code assistant, web development tools",
                        "author": { "@type": "Person", "name": "Girish Lade" }
                    })}
                </script>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        GB Coder Documentation
                    </h1>
                    <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                        Complete guide to all features, tools, and capabilities of the AI-powered code playground
                    </p>
                </div>

                {/* Search */}
                <div className={`max-w-2xl mx-auto mb-12 relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                    />
                </div>

                <div className="flex gap-8">
                    {/* Sidebar TOC */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className={`sticky top-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
                            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Book className="w-5 h-5" />
                                Table of Contents
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${activeSection === section.id
                                            ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                                            : isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {section.icon}
                                        <span className="text-sm">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-12">
                        {/* Getting Started */}
                        <section id="getting-started" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Zap className="w-8 h-8 text-gray-400" />
                                Getting Started
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Start</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>GB Coder is a browser-based code playground that requires no installation. Simply open the app and start coding!</p>
                                    <ol className={`list-decimal list-inside space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <li>Choose a language panel (HTML, CSS, or JavaScript)</li>
                                        <li>Write your code in the Monaco editor</li>
                                        <li>See live preview update automatically</li>
                                        <li>Use AI features to enhance your code</li>
                                        <li>Save your work - it auto-saves to local storage</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Setup AI Features</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>To use AI-powered features, you need a Google Gemini API key:</p>
                                    <ol className={`list-decimal list-inside space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <li>Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">Google AI Studio</a></li>
                                        <li>Open Settings (gear icon) in the navigation bar</li>
                                        <li>Enter your API key in the AI settings section</li>
                                        <li>Start using AI suggestions, chat, and enhancements</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* Editor Features */}
                        <section id="editor" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Code2 className="w-8 h-8 text-gray-400" />
                                Editor Features
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Star className="w-5 h-5 text-gray-400" />
                                        Monaco Editor
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Powered by the same engine as VS Code, featuring:</p>
                                    <ul className="grid md:grid-cols-2 gap-2">
                                        {['Syntax highlighting for HTML, CSS, JS', 'IntelliSense auto-completion', 'Error detection and highlighting', 'Code minimap for navigation', 'Bracket matching and auto-closing', 'Multi-cursor editing'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Wrench className="w-5 h-5 text-gray-400" />
                                        Code Formatting
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Each editor panel has a Format button that beautifies your code:</p>
                                    <ul className="space-y-2">
                                        {['Automatic indentation and spacing', 'Consistent code style', 'Line wrapping and organization', 'Keyboard shortcut: Shift + Alt + F'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <History className="w-5 h-5 text-gray-400" />
                                        Undo/Redo & History
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Comprehensive history tracking:</p>
                                    <ul className="space-y-2">
                                        {['Ctrl+Z: Undo last change', 'Ctrl+Y: Redo change', 'History Panel: View all snapshots', 'Jump to any previous state', 'Create manual snapshots'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Editor Actions</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Each editor panel header includes:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Format', desc: 'Auto-format code with proper indentation' },
                                            { label: 'Copy', desc: 'Copy code to clipboard' },
                                            { label: 'Lock/Unlock', desc: 'Make editor read-only' },
                                            { label: 'AI Suggest', desc: 'Get AI-powered improvements' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* AI Features */}
                        <section id="ai" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Brain className="w-8 h-8 text-gray-400" />
                                AI Features
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Sparkles className="w-5 h-5 text-gray-400" />
                                        AI Chat Assistant
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Interactive coding companion accessible from the sidebar:</p>
                                    <ul className="space-y-2">
                                        {['Ask coding questions in natural language', 'Request code snippets and examples', 'Get debugging help', 'Learn best practices and patterns', 'Context-aware responses based on your code', 'Chat history saved for reference'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Lightbulb className="w-5 h-5 text-gray-400" />
                                        Smart Suggestions
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Real-time AI suggestions panel shows:</p>
                                    <ul className="space-y-2">
                                        {['Performance optimizations', 'Accessibility improvements', 'Best practice recommendations', 'Security enhancements', 'Modern syntax updates'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Code Enhancement</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Click "AI Suggest" on any editor to:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Analyze', desc: 'AI reviews your entire code' },
                                            { label: 'Improve', desc: 'Suggests optimized version' },
                                            { label: 'Compare', desc: 'Side-by-side diff view' },
                                            { label: 'Apply', desc: 'One-click to accept changes' },
                                            { label: 'Partial Apply', desc: 'Select specific improvements' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Code Explanation</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Understand any code block:</p>
                                    <ol className={`list-decimal list-inside space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <li>Select code in any editor</li>
                                        <li>Click "Explain Code" button</li>
                                        <li>Get detailed step-by-step explanation</li>
                                        <li>View simplified version for beginners</li>
                                        <li>Add AI-generated comments to code</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Selection Operations</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Advanced AI operations on selected code:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Refactor', desc: 'Improve code structure' },
                                            { label: 'Optimize', desc: 'Performance improvements' },
                                            { label: 'Document', desc: 'Generate comments' },
                                            { label: 'Debug', desc: 'Find and fix issues' },
                                            { label: 'Convert', desc: 'Transform syntax styles' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Error Fixing</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Automatic error resolution:</p>
                                    <ul className="space-y-2">
                                        {['Detects runtime errors in console', '"Fix with AI" button on each error', 'AI analyzes error context and code', 'Provides fix with explanation', 'Apply fix or insert as comment'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Preview & Console */}
                        <section id="preview" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Eye className="w-8 h-8 text-gray-400" />
                                Preview & Console
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Layout className="w-5 h-5 text-gray-400" />
                                        Live Preview
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Real-time rendering with responsive controls:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Desktop Mode', desc: 'Full-width view (default)' },
                                            { label: 'Tablet Mode', desc: '768px viewport simulation' },
                                            { label: 'Mobile Mode', desc: '375px viewport simulation' },
                                            { label: 'Fullscreen', desc: 'Expand to full window' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Auto-refresh on code changes
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Iframe sandboxing for security
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Terminal className="w-5 h-5 text-gray-400" />
                                        Enhanced Console
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Professional-grade developer console:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Console Tab', desc: 'Standard logging output' },
                                            { label: 'Advanced Tab', desc: 'Command terminal interface' },
                                            { label: 'Validator Tab', desc: 'HTML/CSS/JS validation' },
                                            { label: 'Preview Tab', desc: 'Iframe console output' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Filter by INFO, WARN, ERROR
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Clear, copy, export logs
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Console Commands</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Available terminal commands:</p>
                                    <ul className="space-y-2">
                                        {['clear - Clear console output', 'run - Refresh preview', 'download - Export project as ZIP', 'theme [dark|light] - Change theme', 'history - View code history', 'ai assistant - Open AI chat'].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <code className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded mr-2`}>{item.split(' - ')[0]}</code>
                                                {item.split(' - ')[1]}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Code Validation</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Real-time validation in Validator tab:</p>
                                    <ul className="space-y-2">
                                        {['HTML validation (unclosed tags, attributes)', 'CSS syntax checking', 'JavaScript error detection', 'Auto-validate toggle', 'Click to jump to error location'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Project Management */}
                        <section id="projects" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <FileText className="w-8 h-8 text-gray-400" />
                                Project Management
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Project System</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Organize your work into projects:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Create Project', desc: 'Start new project with custom name' },
                                            { label: 'Switch Projects', desc: 'Quick project selector' },
                                            { label: 'Rename', desc: 'Update project name anytime' },
                                            { label: 'Duplicate', desc: 'Clone existing project' },
                                            { label: 'Delete', desc: 'Remove unwanted projects' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Projects stored in local storage
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Includes code, libraries, settings
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Auto-Save</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Your work is automatically saved:</p>
                                    <ul className="space-y-2">
                                        {['Saves every 30 seconds', 'Manual save with Ctrl+S', 'Toggle auto-save in settings', 'Save indicator shows status', 'Per-project auto-save'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Export Options</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Download your project:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Export as ZIP', desc: 'Complete project bundle' },
                                            { label: 'Download HTML', desc: 'Single HTML file' },
                                            { label: 'Download CSS', desc: 'Stylesheet file' },
                                            { label: 'Download JS', desc: 'JavaScript file' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Includes external libraries
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Ready for deployment
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* File Management */}
                        <section id="files" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Upload className="w-8 h-8 text-gray-400" />
                                File Management
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>File Upload</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Import existing code:</p>
                                    <ul className="space-y-2">
                                        {['Drag and drop files onto editor', 'Click "Upload" button to browse', 'Supports .html, .css, .js files', 'Upload multiple files at once', 'Auto-detects file type'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Package className="w-5 h-5 text-gray-400" />
                                        External Libraries
                                    </h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Add third-party libraries via CDN:</p>
                                    <ul className="space-y-2">
                                        <li className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>Popular Libraries:</strong> Bootstrap, Tailwind, jQuery, React, Vue, Alpine.js, HTMX, anime.js, Chart.js, Three.js
                                        </li>
                                        <li className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>Custom CDN:</strong> Add any library URL
                                        </li>
                                        <li className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>Auto-Inject:</strong> CSS in head, JS before your code
                                        </li>
                                        <li className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>Manage:</strong> Reorder, enable/disable, remove
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Search and filter library list
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Version selection support
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Settings */}
                        <section id="settings" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Settings className="w-8 h-8 text-gray-400" />
                                Settings & Customization
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme Options</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Customize the appearance:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Dark Themes', desc: 'Dark, Dark Blue, Dark Purple' },
                                            { label: 'Light Themes', desc: 'Light, Light Blue, Light Purple' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Matte black & white design
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Applies to entire UI
                                        </li>
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Persists between sessions
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Editor Settings</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Configure Monaco editor:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Font Family', desc: 'Multiple monospace fonts' },
                                            { label: 'Font Size', desc: '12px - 24px range' },
                                            { label: 'Auto-run JS', desc: 'Toggle automatic execution' },
                                            { label: 'Preview Delay', desc: '0-1500ms update delay' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Settings synced across all editors
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Other Settings</h3>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Auto-Save', desc: 'Enable/disable automatic saving' },
                                            { label: 'AI Suggestions', desc: 'Toggle AI features globally' },
                                            { label: 'Console Filters', desc: 'Show/hide log types' },
                                            { label: 'Layout', desc: 'Resize panels to preference' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Snippets */}
                        <section id="snippets" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Package className="w-8 h-8 text-gray-400" />
                                Code Snippets
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Snippet System</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Save and reuse code patterns:</p>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Create', desc: 'Save current code as snippet' },
                                            { label: 'Load', desc: 'Replace editors with snippet code' },
                                            { label: 'Insert', desc: 'Append snippet to existing code' },
                                            { label: 'Edit', desc: 'Update snippet details' },
                                            { label: 'Delete', desc: 'Remove unwanted snippets' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                        <li className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />Organize with categories and tags
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Snippet Types</h3>
                                    <ul className="space-y-2">
                                        {[
                                            { label: 'Full', desc: 'Complete HTML/CSS/JS project' },
                                            { label: 'HTML Only', desc: 'HTML snippets' },
                                            { label: 'CSS Only', desc: 'Stylesheet snippets' },
                                            { label: 'JavaScript Only', desc: 'Script snippets' }
                                        ].map((item, i) => (
                                            <li key={i} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                <strong className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}:</strong> {item.desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Snippet Metadata</h3>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Each snippet includes:</p>
                                    <ul className="space-y-2">
                                        {['Name and description', 'Category for organization', 'Tags for searchability', 'Creation and update timestamps', 'Scope (private/public - future feature)'].map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Keyboard Shortcuts */}
                        <section id="shortcuts" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Keyboard className="w-8 h-8 text-gray-400" />
                                Keyboard Shortcuts
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Global Shortcuts</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { keys: 'Ctrl + S', desc: 'Manual Save' },
                                            { keys: 'Ctrl + Z', desc: 'Undo' },
                                            { keys: 'Ctrl + Y', desc: 'Redo' },
                                            { keys: 'Shift + Alt + F', desc: 'Format Code' }
                                        ].map((item, i) => (
                                            <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.keys}</span>
                                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Editor Shortcuts</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { keys: 'Ctrl + A', desc: 'Select All' },
                                            { keys: 'Ctrl + C', desc: 'Copy' },
                                            { keys: 'Ctrl + V', desc: 'Paste' },
                                            { keys: 'Ctrl + /', desc: 'Toggle Comment' },
                                            { keys: 'Ctrl + D', desc: 'Find Next Occurrence' },
                                            { keys: 'Ctrl + F', desc: 'Find' },
                                            { keys: 'Ctrl + H', desc: 'Replace' },
                                            { keys: 'Alt + Up/Down', desc: 'Move Line' }
                                        ].map((item, i) => (
                                            <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.keys}</span>
                                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
