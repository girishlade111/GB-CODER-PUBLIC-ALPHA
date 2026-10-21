import { Component, type ErrorInfo, type ReactNode } from 'react';
import StatusPage from './status/StatusPage';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }

class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false, error: null, errorInfo: null };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
        try {
            const snapshots = localStorage.getItem('gbcoder_snapshots');
            if (snapshots) localStorage.setItem('gbcoder_emergency_save', snapshots);
        } catch (error) { console.error('Failed to perform emergency save:', error); }
    }

    private handleExportCode = () => {
        try {
            const backup = localStorage.getItem('gbcoder_emergency_save');
            if (!backup) { window.alert('No emergency backup is available.'); return; }
            const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `gbcoder-emergency-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch { window.alert('The backup could not be exported.'); }
    };

    public render() {
        if (!this.state.hasError) return this.props.children;
        if (this.props.fallback) return this.props.fallback;
        // Client rendering cannot change a document's already-sent HTTP status.
        // Production details never enter the DOM or clipboard.
        return <StatusPage code={500}
            devDetails={import.meta.env.DEV ? `${this.state.error?.stack || this.state.error?.message || ''}\n${this.state.errorInfo?.componentStack || ''}` : undefined}
            recoveryActions={<button className="status-button status-button-outline" type="button" onClick={this.handleExportCode}>Export emergency backup</button>}
        />;
    }
}

export default ErrorBoundary;
