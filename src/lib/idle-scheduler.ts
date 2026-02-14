/**
 * requestIdleCallback scheduler for non-critical work
 * Defers analytics, prefetching, and cleanup to idle periods
 */

type IdleTask = {
  name: string;
  fn: () => void | Promise<void>;
  priority: 'low' | 'normal';
};

class IdleScheduler {
  private queue: IdleTask[] = [];
  private isProcessing = false;
  private supportsIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window;

  /**
   * Schedule a task to run during browser idle time
   */
  schedule(name: string, fn: () => void | Promise<void>, priority: 'low' | 'normal' = 'normal'): void {
    this.queue.push({ name, fn, priority });

    // Sort: normal priority first
    this.queue.sort((a, b) => (a.priority === 'normal' ? -1 : 1) - (b.priority === 'normal' ? -1 : 1));

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    if (this.supportsIdleCallback) {
      (window as any).requestIdleCallback((deadline: IdleDeadline) => {
        this.runTasks(deadline);
      }, { timeout: 2000 });
    } else {
      // Fallback: use setTimeout with small delay
      setTimeout(() => {
        const task = this.queue.shift();
        if (task) {
          try { task.fn(); } catch (e) { 
            if (import.meta.env.DEV) console.warn(`Idle task "${task.name}" failed:`, e);
          }
        }
        this.processQueue();
      }, 50);
    }
  }

  private runTasks(deadline: IdleDeadline): void {
    while (this.queue.length > 0 && deadline.timeRemaining() > 5) {
      const task = this.queue.shift();
      if (task) {
        try { task.fn(); } catch (e) {
          if (import.meta.env.DEV) console.warn(`Idle task "${task.name}" failed:`, e);
        }
      }
    }

    // Continue processing remaining tasks
    if (this.queue.length > 0) {
      this.processQueue();
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Cancel all pending tasks
   */
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Get pending task count
   */
  get pendingCount(): number {
    return this.queue.length;
  }
}

export const idleScheduler = new IdleScheduler();

/**
 * Schedule analytics/tracking work during idle time
 */
export function scheduleAnalytics(name: string, fn: () => void): void {
  idleScheduler.schedule(`analytics:${name}`, fn, 'low');
}

/**
 * Schedule prefetch work during idle time
 */
export function schedulePrefetch(name: string, fn: () => void): void {
  idleScheduler.schedule(`prefetch:${name}`, fn, 'normal');
}

/**
 * Schedule cleanup work during idle time
 */
export function scheduleCleanup(name: string, fn: () => void): void {
  idleScheduler.schedule(`cleanup:${name}`, fn, 'low');
}
