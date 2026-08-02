import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Download, Bug } from 'lucide-react';

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
            const currentProject = localStorage.getItem('gbcoder_active_project_id');
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

    private handleGoHome = () => {
        window.location.href = '/';
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
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                            We apologize for the inconvenience. The application has encountered an unexpected error.
                        </p>
                        
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6 text-sm text-green-700 dark:text-green-400">
                            Your work is safe — we've auto-saved your progress.
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 text-left bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-48">
                                <p className="font-mono text-sm text-red-600 dark:text-red-400 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleExportCode}
                                className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Current Code
                            </button>

                            <button
                                onClick={this.handleReportIssue}
                                className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
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
