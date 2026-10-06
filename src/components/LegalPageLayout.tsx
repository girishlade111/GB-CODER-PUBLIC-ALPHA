import React from 'react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/ui/Footer';
import ExternalLibraryManager from '../components/ExternalLibraryManager';
import PrivacyPolicyPage from '../components/pages/PrivacyPolicyPage';
import TermsOfServicePage from '../components/pages/TermsOfServicePage';
import ContactPage from '../components/pages/ContactPage';
import CookiePolicyPage from '../components/pages/CookiePolicyPage';
import DisclaimerPage from '../components/pages/DisclaimerPage';
import { ExternalLibrary } from '../services/externalLibraryService';
import { useTheme } from '../hooks/useTheme';

interface LegalPageLayoutProps {
    onAutoSaveToggle: () => void;
    onRun: () => void;
    onOpenBuildFromPrompt: () => void;
    onExternalLibraryManagerToggle: () => void;
    autoSaveEnabled: boolean;
    setCurrentView: (view: string) => void;
    showExternalLibraryManager: boolean;
    externalLibraries: ExternalLibrary[];
    onLibrariesChange: (libraries: ExternalLibrary[]) => void;
    pageComponent: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
    onAutoSaveToggle,
    onRun,
    onOpenBuildFromPrompt,
    onExternalLibraryManagerToggle,
    autoSaveEnabled,
    setCurrentView,
    showExternalLibraryManager,
    externalLibraries,
    onLibrariesChange,
    pageComponent
}) => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
            <NavigationBar
                onAutoSaveToggle={onAutoSaveToggle}
                onRun={onRun}
                onOpenBuildFromPrompt={onOpenBuildFromPrompt}
                onExternalLibraryManagerToggle={onExternalLibraryManagerToggle}
                autoSaveEnabled={autoSaveEnabled}
                customActions={
                    <button
                        onClick={() => setCurrentView('editor')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Back to Editor
                    </button>
                }
            />
            <div className="flex-1">
                {pageComponent}
            </div>
            <Footer />
            <ExternalLibraryManager
                isOpen={showExternalLibraryManager}
                onClose={() => setCurrentView('editor')}
                libraries={externalLibraries}
                onLibrariesChange={onLibrariesChange}
            />
        </div>
    );
};

export const renderLegalPage = (
    view: string,
    props: Omit<LegalPageLayoutProps, 'pageComponent'>
): React.ReactElement | null => {
    let pageComponent: React.ReactNode = null;

    switch (view) {
        case 'privacy':
            pageComponent = <PrivacyPolicyPage />;
            break;
        case 'terms':
            pageComponent = <TermsOfServicePage />;
            break;
        case 'contact':
            pageComponent = <ContactPage />;
            break;
        case 'cookies':
            pageComponent = <CookiePolicyPage />;
            break;
        case 'disclaimer':
            pageComponent = <DisclaimerPage />;
            break;
        default:
            return null;
    }

    return <LegalPageLayout {...props} pageComponent={pageComponent} />;
};
