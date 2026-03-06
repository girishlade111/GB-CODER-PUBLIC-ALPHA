import React, { useState, Suspense, forwardRef, useImperativeHandle, useRef } from 'react';
import { Eye, Terminal } from 'lucide-react';
import PreviewPanel from './PreviewPanel';
import { ConsoleLog } from '../types';

// Lazy load heavy components
const EnhancedConsole = React.lazy(() => import('./EnhancedConsole'));

type TabType = 'preview' | 'console';

interface TabbedRightPanelProps {
    // Error count for badge
    errorCount: number;

    // Preview Panel props
    html: string;
    css: string;
    javascript: string;
    onConsoleLog: (log: ConsoleLog) => void;
    autoRunJS?: boolean;
    previewDelay?: number;

    // Console props
    consoleLogs: ConsoleLog[];
    onClearConsole: () => void;
}

const TabbedRightPanel = forwardRef<HTMLElement, TabbedRightPanelProps>(({
    errorCount,
    // Preview props
    html,
    css,
    javascript,
    onConsoleLog,
    autoRunJS = true,
    previewDelay = 300,
    // Console props
    consoleLogs,
    onClearConsole,
}, ref) => {
    const [activeTab, setActiveTab] = useState<TabType>('preview');
    const internalRef = useRef<HTMLElement>(null);
    
    // Use the passed ref or internal ref
    const previewRef = ref || internalRef;

    const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
        {
            id: 'preview',
            label: 'Live Preview',
            icon: <Eye className="w-4 h-4" />,
        },
        {
            id: 'console',
            label: 'Console',
            icon: <Terminal className="w-4 h-4" />,
            badge: errorCount > 0 ? errorCount : undefined,
            badgeColor: 'bg-red-500',
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'preview':
                return (
                    <PreviewPanel
                        ref={previewRef}
                        html={html}
                        css={css}
                        javascript={javascript}
                        onConsoleLog={onConsoleLog}
                        autoRunJS={autoRunJS}
                        previewDelay={previewDelay}
                    />
                );
            case 'console':
                return (
                    <Suspense fallback={
                        <div className="bg-matte-black border border-gray-700 rounded-lg p-4 text-center">
                            <div className="w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Loading Console...</p>
                        </div>
                    }>
                        <div className="h-full min-h-0 flex flex-col">
                            <EnhancedConsole
                                logs={consoleLogs}
                                onClear={onClearConsole}
                                html={html}
                                css={css}
                                javascript={javascript}
                                className="flex-1"
                            />
                        </div>
                    </Suspense>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-matte-black border border-gray-700 rounded-lg overflow-hidden shadow-sm">
            {/* Tab Navigation */}
            <div className="flex items-center bg-dark-gray border-b border-gray-700 px-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200
              border-b-2 -mb-[1px]
              ${activeTab === tab.id
                                ? 'text-white border-vscode-statusbar bg-matte-black'
                                : 'text-gray-500 border-transparent hover:text-gray-200 hover:bg-[#2a2d2e]'
                            }
            `}
                        aria-selected={activeTab === tab.id}
                        role="tab"
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span
                                className={`
                  ${tab.badgeColor} text-white text-xs font-bold
                  px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  flex items-center justify-center
                `}
                            >
                                {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {renderTabContent()}
            </div>
        </div>
    );
});

export default React.memo(TabbedRightPanel);
