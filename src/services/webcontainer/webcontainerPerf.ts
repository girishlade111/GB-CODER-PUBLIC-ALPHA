/**
 * WebContainer Diagnostic Performance Instrumentation
 *
 * Provides minimal, measurable timing metrics for WebContainer filesystem
 * operations, dependency checks, installation, and server startup.
 *
 * Strict constraint: Record only measurable events exposed by the runtime;
 * avoid excessive production logging.
 */

export interface WebContainerTimingEvent {
  stage: string;
  durationMs: number;
  timestamp: number;
  details?: Record<string, unknown>;
}

class WebContainerPerfTracker {
  private timings: WebContainerTimingEvent[] = [];
  private activeTimers = new Map<string, number>();

  /**
   * Starts timing a measurable stage. Returns an end function that records duration.
   */
  public startTimer(stage: string): (details?: Record<string, unknown>) => number {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return (details?: Record<string, unknown>) => {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.round((endTime - startTime) * 100) / 100;
      this.recordTiming(stage, durationMs, details);
      return durationMs;
    };
  }

  /**
   * Records a completed timing event.
   */
  public recordTiming(stage: string, durationMs: number, details?: Record<string, unknown>): void {
    const event: WebContainerTimingEvent = {
      stage,
      durationMs,
      timestamp: Date.now(),
      details,
    };
    this.timings.push(event);

    // Keep log in memory (ring buffer of last 100 events)
    if (this.timings.length > 100) {
      this.timings.shift();
    }
  }

  /**
   * Retrieves all recorded timing events.
   */
  public getTimings(): WebContainerTimingEvent[] {
    return [...this.timings];
  }

  /**
   * Retrieves the most recent timing for a specific stage.
   */
  public getLatestTiming(stage: string): WebContainerTimingEvent | undefined {
    for (let i = this.timings.length - 1; i >= 0; i--) {
      if (this.timings[i].stage === stage) {
        return this.timings[i];
      }
    }
    return undefined;
  }

  /**
   * Clears recorded timings.
   */
  public clear(): void {
    this.timings = [];
    this.activeTimers.clear();
  }
}

export const webcontainerPerf = new WebContainerPerfTracker();
