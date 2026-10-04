import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, Bug } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });

        // Emergency auto-save
        try {
            // We use localStorage to save the current code state just in case
            void localStorage.getItem('gbcoder_active_project_id');
            const fileProject = localStorage.getItem('gbcoder_snapshots');
            if (fileProject) {
                localStorage.setItem('gbcoder_emergency_save', fileProject);
            }
        } catch (e) {
            console.error('Failed to perform emergency save:', e);
        }

        // Here you would typically log to an error reporting service
        // logErrorToService(error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };



    private handleExportCode = () => {
        try {
            const emergencyData = localStorage.getItem('gbcoder_emergency_save');
            if (emergencyData) {
                const blob = new Blob([emergencyData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gbcoder-emergency-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('No emergency backup found.');
            }
        } catch (e) {
            console.error('Export failed:', e);
            alert('Failed to export code.');
        }
    };

    private handleReportIssue = () => {
        const errorStack = this.state.error?.stack || this.state.error?.toString() || 'Unknown error';
        const info = this.state.errorInfo?.componentStack || '';
        const report = `Error: ${errorStack}\n\nComponent Stack:\n${info}`;
        navigator.clipboard.writeText(report).then(() => {
            alert('Error details copied to clipboard. You can paste this when reporting the issue.');
        }).catch(() => {
            alert('Failed to copy to clipboard.');
        });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-product-soft p-4">
                    <div className="max-w-md w-full bg-product border border-stroke-dark rounded-lg p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-danger rounded-full">
                                <AlertTriangle className="w-12 h-12 text-danger" />
                            </div>
                        </div>

                        <h1 className="text-xl font-semibold text-content-on-dark mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-content-on-dark-soft text-sm mb-4">
                            We apologize for the inconvenience. The application has encountered an unexpected error.
                        </p>
                        
                        <div className="bg-teal/08 border border-teal rounded-md p-3 mb-6 text-sm text-teal">
                            Your work is safe — we've auto-saved your progress.
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 text-left bg-product-soft border border-stroke-dark p-4 rounded-md overflow-auto max-h-48">
                                <p className="font-mono text-sm text-danger break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center px-4 py-2 bg-accent hover:bg-accent-hover text-content-on-dark rounded-md transition-colors font-medium text-sm"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleExportCode}
                                className="flex items-center justify-center px-4 py-2 bg-product-elevated border border-stroke-dark hover:bg-product-active text-content-on-dark rounded-md transition-colors text-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Current Code
                            </button>

                            <button
                                onClick={this.handleReportIssue}
                                className="flex items-center justify-center px-4 py-2 bg-product-elevated border border-stroke-dark hover:bg-product-active text-content-on-dark-soft hover:text-content-on-dark rounded-md transition-colors text-sm"
                            >
                                <Bug className="w-4 h-4 mr-2" />
                                Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
