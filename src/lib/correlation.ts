/**
 * Structured Logging with Correlation IDs
 * Provides request tracing across frontend operations
 */

let currentCorrelationId: string | null = null;

export function generateCorrelationId(): string {
  return `cid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCorrelationId(): string {
  if (!currentCorrelationId) {
    currentCorrelationId = generateCorrelationId();
  }
  return currentCorrelationId;
}

export function setCorrelationId(id: string): void {
  currentCorrelationId = id;
}

export function resetCorrelationId(): void {
  currentCorrelationId = generateCorrelationId();
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId: string;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  duration?: number;
  userId?: string;
}

class StructuredLogger {
  private buffer: StructuredLogEntry[] = [];
  private maxBuffer = 100;

  private createEntry(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): StructuredLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      correlationId: getCorrelationId(),
      message,
      context,
      data,
    };
  }

  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, context, data);
    this.buffer.push(entry);
    this.pruneBuffer();
    if (import.meta.env.DEV) {
      console.debug(`[${entry.correlationId}] ${context ? `[${context}] ` : ''}${message}`, data || '');
    }
  }

  info(message: string, context?: string, data?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, context, data);
    this.buffer.push(entry);
    this.pruneBuffer();
    if (import.meta.env.DEV) {
      console.info(`[${entry.correlationId}] ${context ? `[${context}] ` : ''}${message}`, data || '');
    }
  }

  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, context, data);
    this.buffer.push(entry);
    this.pruneBuffer();
    console.warn(`[${entry.correlationId}] ${context ? `[${context}] ` : ''}${message}`, data || '');
  }

  error(message: string, context?: string, data?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, context, data);
    this.buffer.push(entry);
    this.pruneBuffer();
    console.error(`[${entry.correlationId}] ${context ? `[${context}] ` : ''}${message}`, data || '');
  }

  /**
   * Measure and log duration of an async operation
   */
  async measure<T>(operation: string, context: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      this.info(`${operation} completed`, context, { duration_ms: duration });
      return result;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      this.error(`${operation} failed`, context, { 
        duration_ms: duration, 
        error: err instanceof Error ? err.message : String(err) 
      });
      throw err;
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count = 50): StructuredLogEntry[] {
    return this.buffer.slice(-count);
  }

  /**
   * Export logs as JSON for support/debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }

  private pruneBuffer(): void {
    if (this.buffer.length > this.maxBuffer) {
      this.buffer = this.buffer.slice(-this.maxBuffer);
    }
  }
}

export const logger = new StructuredLogger();
