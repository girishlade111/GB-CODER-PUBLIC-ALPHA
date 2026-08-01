import React, { useEffect, useState, Suspense, forwardRef, useRef } from 'react';
import { Eye, Terminal } from 'lucide-react';
import PreviewPanel from './PreviewPanel';
import { JSEditorMode } from '../types';
import { MultiFileProject, ProjectType } from '../types/files';
import { ValidationSummary } from '../services/validationService';
import { ShellPackage, ShellPackageError } from '../services/localShell';
import type { ConsoleMessage } from '../types/consoleFeed';
import type { ConsoleCounts } from '../hooks/useConsoleFeed';

// Lazy load heavy components
const EnhancedConsole = React.lazy(() => import('./EnhancedConsole'));

type TabType = 'preview' | 'console';

interface TabbedRightPanelProps {
    /** Console errors, shown on the Console tab badge. */
    errorCount: number;
    /** Validation errors, added to the same badge so problems are visible
     *  without opening the panel. */
    problemCount: number;

    // Preview Panel props
    html: string;
    css: string;
    javascript: string;
    jsEditorMode?: JSEditorMode;
    onConsoleMessage: (message: Omit<ConsoleMessage, 'id' | 'count'>) => void;
    onPreviewReset?: () => void;
    autoRunJS?: boolean;
    previewDelay?: number;

    // Console props
    consoleMessages: ConsoleMessage[];
    consoleCounts: ConsoleCounts;
    onClearConsole: () => void;

    // Validator props
    project: MultiFileProject;
    validation: ValidationSummary;
    isValidating: boolean;
    isValidationReady: boolean;
    onRevalidate: () => void;

    // Terminal props
    resolvedPackages: ShellPackage[];
    unresolvedPackages: ShellPackageError[];

    /** Voice-driven focus request: outer tab plus console sub-tab. */
    panelRequest?: { tab: 'console' | 'validator' | 'terminal' | 'preview'; nonce: number } | null;

    // Multi-file project props (plain mode leaves these at their defaults)
    projectType?: ProjectType;
    bundledCode?: string;
    bundledCss?: string;
    importMap?: Record<string, string>;
    isResolvingPackages?: boolean;
}

const TabbedRightPanel = forwardRef<HTMLElement, TabbedRightPanelProps>(({
    errorCount,
    problemCount,
    // Preview props
    html,
    css,
    javascript,
    jsEditorMode = 'javascript',
    onConsoleMessage,
    onPreviewReset,
    autoRunJS = true,
    previewDelay = 300,
    // Console props
    consoleMessages,
    consoleCounts,
    onClearConsole,
    // Validator props
    project,
    validation,
    isValidating,
    isValidationReady,
    onRevalidate,
    // Terminal props
    resolvedPackages,
    unresolvedPackages,
    panelRequest,
    // Multi-file project props
    projectType = 'plain',
    bundledCode = '',
    bundledCss = '',
    importMap = {},
    isResolvingPackages = false,
}, ref) => {
    const [activeTab, setActiveTab] = useState<TabType>('preview');

    /*
     * A voice command can ask for a specific panel. `preview` maps to the outer
     * Live Preview tab; the other three live inside the console panel, so the
     * outer tab switches and the request is forwarded to the sub-tab strip.
     */
    /*
     * One-shot: consumed once applied. Holding it indefinitely re-applied the
     * last request whenever the console panel remounted (which happens on every
     * outer tab switch), silently dragging the user back to a sub-tab they had
     * since navigated away from.
     */
    const [subTabRequest, setSubTabRequest] = useState<
        { tab: 'console' | 'validator' | 'terminal' | 'preview'; nonce: number } | null
    >(null);

    useEffect(() => {
        if (!panelRequest) return;
        setActiveTab(panelRequest.tab === 'preview' ? 'preview' : 'console');
        if (panelRequest.tab !== 'preview') setSubTabRequest(panelRequest);
    }, [panelRequest]);
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
            /* Real-time: console errors plus outstanding validation errors. */
            badge: errorCount + problemCount > 0 ? errorCount + problemCount : undefined,
            badgeColor: 'bg-red-500',
        },
    ];

    /*
     * The preview stays mounted regardless of which tab is showing.
     *
     * Previously these two tabs were mutually exclusive, which meant selecting
     * Console destroyed the preview iframe -- so the console could never
     * receive output while the user was actually looking at it, and returning to
     * Preview re-ran the document and wiped the feed. The console panel is
     * opaque and simply covers the preview when active, so the iframe keeps
     * running and keeps its real dimensions (screenshot capture depends on
     * those).
     */
    const renderPreview = () => (
        <PreviewPanel
                        ref={previewRef}
                        html={html}
                        css={css}
                        javascript={javascript}
                        jsEditorMode={jsEditorMode}
                        onConsoleMessage={onConsoleMessage}
                        onPreviewReset={onPreviewReset}
                        autoRunJS={autoRunJS}
                        previewDelay={previewDelay}
                        projectType={projectType}
                        bundledCode={bundledCode}
                        bundledCss={bundledCss}
                        importMap={importMap}
                        isResolvingPackages={isResolvingPackages}
        />
    );

    const renderConsole = () => (
                    <Suspense fallback={
                        <div className="bg-surface-base border border-stroke-subtle rounded-lg p-4 text-center">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-content-secondary text-sm">Loading Console...</p>
                        </div>
                    }>
                        <div className="h-full min-h-0 flex flex-col">
                            <EnhancedConsole
                                messages={consoleMessages}
                                counts={consoleCounts}
                                onClear={onClearConsole}
                                html={html}
                                css={css}
                                javascript={javascript}
                                project={project}
                                validation={validation}
                                isValidating={isValidating}
                                isValidationReady={isValidationReady}
                                onRevalidate={onRevalidate}
                                resolvedPackages={resolvedPackages}
                                unresolvedPackages={unresolvedPackages}
                                isResolvingPackages={isResolvingPackages}
                                subTabRequest={subTabRequest}
                                onSubTabRequestHandled={() => setSubTabRequest(null)}
                                className="flex-1"
                            />
                        </div>
                    </Suspense>
    );

    return (
        <div className="flex flex-col h-full bg-surface-base border border-stroke-subtle rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center bg-surface-raised border-b border-stroke-subtle px-2 compact:shrink-0 compact:overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        data-testid={`right-tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors
              border-b-2 -mb-[1px]
              compact:min-h-[44px] compact:shrink-0 compact:whitespace-nowrap
              ${activeTab === tab.id
                                ? 'text-content-primary border-accent'
                                : 'text-content-muted border-transparent hover:text-content-primary'
                            }
            `}
                        aria-selected={activeTab === tab.id}
                        role="tab"
                    >
                        {tab.icon}
                        {/* Only two outer tabs, so the labels fit even at 375px.
                            The strip scrolls rather than clipping if they don't. */}
                        <span>{tab.label}</span>
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

            {/* Tab content: both panes are mounted; the console overlays the preview. */}
            <div className="relative flex-1 min-h-0 overflow-hidden">
                <div className="absolute inset-0" aria-hidden={activeTab !== 'preview'}>
                    {renderPreview()}
                </div>
                {activeTab === 'console' && (
                    <div className="absolute inset-0 z-10 bg-surface-base">{renderConsole()}</div>
                )}
            </div>
        </div>
    );
});

export default React.memo(TabbedRightPanel);
