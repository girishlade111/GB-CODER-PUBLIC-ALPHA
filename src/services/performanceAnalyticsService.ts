// Performance Monitoring and Analytics Service
import { PerformanceMetrics, AnalyticsEvent } from '../types/console.types';

export class PerformanceAnalyticsService {
  private metrics: PerformanceMetrics;
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000;
  private sessionId: string;
  private startTime: number;
  private metricsUpdateInterval: number | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.startMonitoring();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      commandCount: 0,
      errorCount: 0,
      averageExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    // Update metrics every 5 seconds
    this.metricsUpdateInterval = window.setInterval(() => {
      this.updateSystemMetrics();
    }, 5000);

    // Initial update
    this.updateSystemMetrics();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
  }

  /**
   * Update system metrics
   */
  private updateSystemMetrics(): void {
    // Update uptime
    this.metrics.uptime = Date.now() - this.startTime;

    // Update memory usage (if available)
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    // Estimate CPU usage from performance entries
    this.metrics.cpuUsage = this.estimateCPUUsage();

    this.metrics.lastUpdated = Date.now();
  }

  /**
   * Estimate CPU usage from performance data
   */
  private estimateCPUUsage(): number {
    try {
      const entries = performance.getEntriesByType('measure');
      if (entries.length === 0) return 0;

      const recentEntries = entries.slice(-10);
      const totalDuration = recentEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const avgDuration = totalDuration / recentEntries.length;

      // Normalize to 0-1 range (assuming 100ms is high CPU usage)
      return Math.min(avgDuration / 100, 1);
    } catch {
      return 0;
    }
  }

  /**
   * Track command execution
   */
  trackCommand(command: string, executionTime: number, success: boolean): void {
    this.metrics.commandCount++;
    
    if (!success) {
      this.metrics.errorCount++;
    }

    // Update average execution time
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.commandCount - 1);
    this.metrics.averageExecutionTime = (totalTime + executionTime) / this.metrics.commandCount;

    // Log analytics event
    this.logEvent({
      id: this.generateEventId(),
      type: 'command',
      timestamp: Date.now(),
      data: {
        command,
        executionTime,
        success,
      },
      sessionId: this.sessionId,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.metrics.errorCount++;

    this.logEvent({
      id: this.generateEventId(),
      type: 'error',
      timestamp: Date.now(),
      data: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      sessionId: this.sessionId,
    });
  }

  /**
   * Track warning
   */
  trackWarning(message: string, context?: Record<string, any>): void {
    this.logEvent({
      id: this.generateEventId(),
      type: 'warning',
      timestamp: Date.now(),
      data: {
        message,
        ...context,
      },
      sessionId: this.sessionId,
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    this.logEvent({
      id: this.generateEventId(),
      type: 'user_action',
      timestamp: Date.now(),
      data: {
        action,
        ...data,
      },
      sessionId: this.sessionId,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.logEvent({
      id: this.generateEventId(),
      type: 'performance',
      timestamp: Date.now(),
      data: {
        metric,
        value,
        ...context,
      },
      sessionId: this.sessionId,
    });
  }

  /**
   * Log analytics event
   */
  private logEvent(event: AnalyticsEvent): void {
    this.events.push(event);

    // Trim events if exceeds max
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Save to storage
    this.saveEvents();
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AnalyticsEvent['type']): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events by date range
   */
  getEventsByDateRange(start: number, end: number): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= start && event.timestamp <= end
    );
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    errorRate: number;
    averageCommandTime: number;
    topCommands: Array<{ command: string; count: number }>;
    recentErrors: AnalyticsEvent[];
    performanceTrends: Array<{ timestamp: number; cpu: number; memory: number }>;
  } {
    const totalEvents = this.events.length;
    
    // Count events by type
    const eventsByType: Record<string, number> = {};
    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    // Calculate error rate
    const errorRate = this.metrics.commandCount > 0
      ? (this.metrics.errorCount / this.metrics.commandCount) * 100
      : 0;

    // Get top commands
    const commandCounts = new Map<string, number>();
    for (const event of this.events) {
      if (event.type === 'command' && event.data.command) {
        const count = commandCounts.get(event.data.command) || 0;
        commandCounts.set(event.data.command, count + 1);
      }
    }

    const topCommands = Array.from(commandCounts.entries())
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get recent errors
    const recentErrors = this.events
      .filter(event => event.type === 'error')
      .slice(-10)
      .reverse();

    // Get performance trends (last hour)
    const hourAgo = Date.now() - (60 * 60 * 1000);
    const performanceEvents = this.events.filter(event => 
      event.type === 'performance' && event.timestamp >= hourAgo
    );

    const performanceTrends = performanceEvents.map(event => ({
      timestamp: event.timestamp,
      cpu: event.data.metric === 'cpu' ? event.data.value : 0,
      memory: event.data.metric === 'memory' ? event.data.value : 0,
    }));

    return {
      totalEvents,
      eventsByType,
      errorRate,
      averageCommandTime: this.metrics.averageExecutionTime,
      topCommands,
      recentErrors,
      performanceTrends,
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    uptime: string;
    commandCount: number;
    errorCount: number;
    errorRate: string;
    averageExecutionTime: string;
    memoryUsage: string;
    cpuUsage: string;
    eventsPerMinute: number;
  } {
    const uptimeMs = this.metrics.uptime;
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const uptimeSeconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);

    const errorRate = this.metrics.commandCount > 0
      ? ((this.metrics.errorCount / this.metrics.commandCount) * 100).toFixed(2)
      : '0.00';

    const eventsPerMinute = uptimeMs > 0
      ? (this.events.length / (uptimeMs / (1000 * 60)))
      : 0;

    return {
      uptime: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
      commandCount: this.metrics.commandCount,
      errorCount: this.metrics.errorCount,
      errorRate: `${errorRate}%`,
      averageExecutionTime: `${this.metrics.averageExecutionTime.toFixed(2)}ms`,
      memoryUsage: `${(this.metrics.memoryUsage * 100).toFixed(2)}%`,
      cpuUsage: `${(this.metrics.cpuUsage * 100).toFixed(2)}%`,
      eventsPerMinute: Math.round(eventsPerMinute),
    };
  }

  /**
   * Save events to storage
   */
  private saveEvents(): void {
    try {
      const toSave = this.events.slice(-this.maxEvents);
      sessionStorage.setItem('console-analytics-events', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  /**
   * Load events from storage
   */
  private loadEvents(): void {
    try {
      const saved = sessionStorage.getItem('console-analytics-events');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load analytics events:', error);
    }
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
  }

  /**
   * Export analytics data
   */
  exportAnalytics(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        sessionId: this.sessionId,
        metrics: this.metrics,
        events: this.events,
        summary: this.getAnalyticsSummary(),
      }, null, 2);
    } else {
      // CSV format
      const headers = ['Timestamp', 'Type', 'Data'];
      const rows = this.events.map(event => [
        new Date(event.timestamp).toISOString(),
        event.type,
        JSON.stringify(event.data),
      ].join(','));

      return [headers.join(','), ...rows].join('\n');
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.trackPerformance(name, duration, { success: true });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.trackPerformance(name, duration, { success: false });
      this.trackError(error as Error, { function: name });
      
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.trackPerformance(name, duration, { success: true });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.trackPerformance(name, duration, { success: false });
      this.trackError(error as Error, { function: name });
      
      throw error;
    }
  }

  /**
   * Create performance mark
   */
  mark(name: string): void {
    performance.mark(name);
  }

  /**
   * Measure between two marks
   */
  measureBetween(name: string, startMark: string, endMark: string): number {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (measure) {
        this.trackPerformance(name, measure.duration);
        return measure.duration;
      }
    } catch (error) {
      console.error('Failed to measure performance:', error);
    }
    
    return 0;
  }
}

// Export singleton instance
export const performanceAnalyticsService = new PerformanceAnalyticsService();
