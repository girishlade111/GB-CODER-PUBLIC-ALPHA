import React, { useState, Suspense, forwardRef, useRef } from 'react';
import { Eye, Terminal } from 'lucide-react';
import PreviewPanel from './PreviewPanel';
import { ConsoleLog, JSEditorMode } from '../types';
import { ProjectType } from '../types/files';

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
    jsEditorMode?: JSEditorMode;
    onConsoleLog: (log: ConsoleLog) => void;
    autoRunJS?: boolean;
    previewDelay?: number;

    // Console props
    consoleLogs: ConsoleLog[];
    onClearConsole: () => void;

    // Multi-file project props (plain mode leaves these at their defaults)
    projectType?: ProjectType;
    bundledCode?: string;
    bundledCss?: string;
    importMap?: Record<string, string>;
    isResolvingPackages?: boolean;
}

const TabbedRightPanel = forwardRef<HTMLElement, TabbedRightPanelProps>(({
    errorCount,
    // Preview props
    html,
    css,
    javascript,
    jsEditorMode = 'javascript',
    onConsoleLog,
    autoRunJS = true,
    previewDelay = 300,
    // Console props
    consoleLogs,
    onClearConsole,
    // Multi-file project props
    projectType = 'plain',
    bundledCode = '',
    bundledCss = '',
    importMap = {},
    isResolvingPackages = false,
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
                        jsEditorMode={jsEditorMode}
                        onConsoleLog={onConsoleLog}
                        autoRunJS={autoRunJS}
                        previewDelay={previewDelay}
                        projectType={projectType}
                        bundledCode={bundledCode}
                        bundledCss={bundledCss}
                        importMap={importMap}
                        isResolvingPackages={isResolvingPackages}
                    />
                );
            case 'console':
                return (
                    <Suspense fallback={
                        <div className="bg-surface-base border border-stroke-subtle rounded-lg p-4 text-center">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-content-secondary text-sm">Loading Console...</p>
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
        <div className="flex flex-col h-full bg-surface-base border border-stroke-subtle rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center bg-surface-raised border-b border-stroke-subtle px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors
              border-b-2 -mb-[1px]
              ${activeTab === tab.id
                                ? 'text-content-primary border-accent'
                                : 'text-content-muted border-transparent hover:text-content-primary'
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
