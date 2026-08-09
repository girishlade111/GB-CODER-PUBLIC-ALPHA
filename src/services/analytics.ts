// Analytics Service
// This is a simple abstraction for analytics tracking
// You can integrate with Google Analytics, Mixpanel, or any other analytics service

type AnalyticsEvent = {
    category: string;
    action: string;
    label?: string;
    value?: number;
};

class AnalyticsService {
    private isInitialized = false;

    // Initialize analytics (e.g., Google Analytics)
    initialize(trackingId?: string) {
        if (this.isInitialized) return;

        // Example: Initialize GA4
        if (trackingId && typeof window !== 'undefined') {
            // Load gtag script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
            document.head.appendChild(script);

            // Initialize gtag
            (window as any).dataLayer = (window as any).dataLayer || [];
            function gtag(...args: any[]) {
                (window as any).dataLayer.push(args);
            }
            gtag('js', new Date());
            gtag('config', trackingId);

            this.isInitialized = true;
        }
    }

    // Track page view
    trackPageView(path: string, title?: string) {
        if (typeof window === 'undefined') return;

        if ((window as any).gtag) {
            (window as any).gtag('event', 'page_view', {
                page_path: path,
                page_title: title,
            });
        }
    }

    // Track custom event
    trackEvent({ category, action, label, value }: AnalyticsEvent) {
        if (typeof window === 'undefined') return;

        if ((window as any).gtag) {
            (window as any).gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value,
            });
        }
    }

    // Track code execution
    trackCodeExecution(language: string) {
        this.trackEvent({
            category: 'Code',
            action: 'execute',
            label: language,
        });
    }

    // Track code save
    trackCodeSave(method: 'auto' | 'manual') {
        this.trackEvent({
            category: 'Code',
            action: 'save',
            label: method,
        });
    }

    // Track feature usage
    trackFeatureUsage(feature: string) {
        this.trackEvent({
            category: 'Feature',
            action: 'use',
            label: feature,
        });
    }

    // Track errors
    trackError(error: Error, context?: string) {
        this.trackEvent({
            category: 'Error',
            action: 'exception',
            label: context || error.message,
        });
    }
}

export const analyticsService = new AnalyticsService();
