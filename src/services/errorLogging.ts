// Error Logging Service
// This is a simple abstraction for error logging and monitoring
// You can integrate with Sentry, LogRocket, or any other error monitoring service

type ErrorContext = {
    userId?: string;
    sessionId?: string;
    route?: string;
    component?: string;
    [key: string]: any;
};

type ErrorLog = {
    timestamp: string;
    error: Error;
    context?: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
};

class ErrorLoggingService {
    private errorLogs: ErrorLog[] = [];
    private maxLogs = 100; // Keep last 100 errors in memory

    // Log error to the service
    logError(error: Error, context?: ErrorContext, severity: ErrorLog['severity'] = 'medium') {
        const errorLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            error,
            context,
            severity,
        };

        // Add to in-memory logs
        this.errorLogs.push(errorLog);
        if (this.errorLogs.length > this.maxLogs) {
            this.errorLogs.shift();
        }

        // Log to console
        console.error('[Error Logging Service]', {
            message: error.message,
            stack: error.stack,
            context,
            severity,
            timestamp: errorLog.timestamp,
        });

        // Send to external service (e.g., Sentry)
        this.sendToExternalService(errorLog);
    }

    // Send error to external monitoring service
    private sendToExternalService(errorLog: ErrorLog) {
        // Example: Send to Sentry
        // if (window.Sentry) {
        //   window.Sentry.captureException(errorLog.error, {
        //     contexts: {
        //       custom: errorLog.context,
        //     },
        //     level: this.mapSeverityToLevel(errorLog.severity),
        //   });
        // }

        // For now, just use local storage as fallback
        try {
            const storedErrors = JSON.parse(localStorage.getItem('gb-coder-error-logs') || '[]');
            storedErrors.push({
                timestamp: errorLog.timestamp,
                message: errorLog.error.message,
                stack: errorLog.error.stack,
                context: errorLog.context,
                severity: errorLog.severity,
            });

            // Keep only last 50 errors in localStorage
            if (storedErrors.length > 50) {
                storedErrors.shift();
            }

            localStorage.setItem('gb-coder-error-logs', JSON.stringify(storedErrors));
        } catch (e) {
            console.error('Failed to store error log:', e);
        }
    }

    // Get recent errors
    getRecentErrors(count = 10): ErrorLog[] {
        return this.errorLogs.slice(-count);
    }

    // Clear error logs
    clearLogs() {
        this.errorLogs = [];
        localStorage.removeItem('gb-coder-error-logs');
    }

    // Log unhandled promise rejection
    logPromiseRejection(reason: any) {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.logError(error, { type: 'unhandledRejection' }, 'high');
    }

    // Log global error
    logGlobalError(message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) {
        const err = error || new Error(typeof message === 'string' ? message : 'Global error');
        this.logError(err, { source, lineno, colno, type: 'global' }, 'high');
    }
}

export const errorLoggingService = new ErrorLoggingService();

// Set up global error handlers
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorLoggingService.logGlobalError(
            event.message,
            event.filename,
            event.lineno,
            event.colno,
            event.error
        );
    });

    window.addEventListener('unhandledrejection', (event) => {
        errorLoggingService.logPromiseRejection(event.reason, event.promise);
        event.preventDefault(); // Prevent console spam
    });
}
