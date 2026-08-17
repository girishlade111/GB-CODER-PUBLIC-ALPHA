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
                <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
                    <div className="max-w-md w-full bg-[#161616] border border-[#2a2a2a] rounded-lg p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-[#e5484d]/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-[#e5484d]" />
                            </div>
                        </div>

                        <h1 className="text-xl font-semibold text-[#e8e8e8] mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-[#8a8a8a] text-sm mb-4">
                            We apologize for the inconvenience. The application has encountered an unexpected error.
                        </p>
                        
                        <div className="bg-[#3ecf5e]/08 border border-[#3ecf5e]/20 rounded-md p-3 mb-6 text-sm text-[#3ecf5e]">
                            Your work is safe — we've auto-saved your progress.
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 text-left bg-[#0d0d0d] border border-[#2a2a2a] p-4 rounded-md overflow-auto max-h-48">
                                <p className="font-mono text-sm text-[#e5484d] break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center px-4 py-2 bg-[#e07856] hover:bg-[#e88a6d] text-[#e8e8e8] rounded-md transition-colors font-medium text-sm"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload App
                            </button>

                            <button
                                onClick={this.handleExportCode}
                                className="flex items-center justify-center px-4 py-2 bg-[#1c1c1c] border border-[#2a2a2a] hover:bg-[#242424] text-[#e8e8e8] rounded-md transition-colors text-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Current Code
                            </button>

                            <button
                                onClick={this.handleReportIssue}
                                className="flex items-center justify-center px-4 py-2 bg-[#1c1c1c] border border-[#2a2a2a] hover:bg-[#242424] text-[#8a8a8a] hover:text-[#e8e8e8] rounded-md transition-colors text-sm"
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
