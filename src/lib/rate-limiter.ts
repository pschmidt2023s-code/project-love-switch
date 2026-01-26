/**
 * Advanced Rate Limiter with sliding window and exponential backoff
 */

interface RateLimitEntry {
  attempts: number[];
  blockedUntil: number | null;
  consecutiveBlocks: number;
}

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  enableExponentialBackoff?: boolean;
  maxBlockDurationMs?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: Required<RateLimiterConfig>;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 5,
      windowMs: config.windowMs ?? 60000,
      blockDurationMs: config.blockDurationMs ?? 300000,
      enableExponentialBackoff: config.enableExponentialBackoff ?? true,
      maxBlockDurationMs: config.maxBlockDurationMs ?? 3600000, // 1 hour max
    };

    // Cleanup old entries periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Check if a request is allowed using sliding window algorithm
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    let entry = this.limits.get(clientId);

    // No previous attempts
    if (!entry) {
      this.limits.set(clientId, {
        attempts: [now],
        blockedUntil: null,
        consecutiveBlocks: 0,
      });
      return true;
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // Block expired, reset block state but keep consecutive count
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      entry = {
        attempts: [now],
        blockedUntil: null,
        consecutiveBlocks: entry.consecutiveBlocks,
      };
      this.limits.set(clientId, entry);
      return true;
    }

    // Remove attempts outside the window (sliding window)
    const windowStart = now - this.config.windowMs;
    entry.attempts = entry.attempts.filter(time => time > windowStart);

    // Check if max attempts exceeded
    if (entry.attempts.length >= this.config.maxAttempts) {
      // Calculate block duration with exponential backoff
      let blockDuration = this.config.blockDurationMs;
      
      if (this.config.enableExponentialBackoff) {
        blockDuration = Math.min(
          this.config.blockDurationMs * Math.pow(2, entry.consecutiveBlocks),
          this.config.maxBlockDurationMs
        );
      }

      this.limits.set(clientId, {
        ...entry,
        blockedUntil: now + blockDuration,
        consecutiveBlocks: entry.consecutiveBlocks + 1,
      });
      
      return false;
    }

    // Add new attempt
    entry.attempts.push(now);
    this.limits.set(clientId, entry);
    return true;
  }

  /**
   * Get remaining block time in milliseconds
   */
  getBlockTimeRemaining(clientId: string): number {
    const entry = this.limits.get(clientId);
    if (!entry?.blockedUntil) return 0;
    return Math.max(0, entry.blockedUntil - Date.now());
  }

  /**
   * Get remaining attempts in current window
   */
  getRemainingAttempts(clientId: string): number {
    const entry = this.limits.get(clientId);
    if (!entry) return this.config.maxAttempts;
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentAttempts = entry.attempts.filter(time => time > windowStart).length;
    
    return Math.max(0, this.config.maxAttempts - recentAttempts);
  }

  /**
   * Reset rate limit for a client
   */
  reset(clientId: string): void {
    this.limits.delete(clientId);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [clientId, entry] of this.limits.entries()) {
      // Remove if no recent attempts and not blocked
      const hasRecentAttempts = entry.attempts.some(time => time > windowStart);
      const isBlocked = entry.blockedUntil && entry.blockedUntil > now;
      
      if (!hasRecentAttempts && !isBlocked) {
        this.limits.delete(clientId);
      }
    }
  }
}

// Auth-specific rate limiter: 5 attempts per minute, exponential backoff
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 60000,
  blockDurationMs: 300000,
  enableExponentialBackoff: true,
  maxBlockDurationMs: 3600000,
});

// Password reset rate limiter: 3 attempts per 10 minutes
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 600000,
  blockDurationMs: 900000,
  enableExponentialBackoff: true,
  maxBlockDurationMs: 7200000,
});

// Newsletter subscription rate limiter: 3 per minute
export const newsletterRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60000,
  blockDurationMs: 300000,
  enableExponentialBackoff: false,
});

// Contact form rate limiter: 5 per hour
export const contactFormRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 3600000,
  blockDurationMs: 3600000,
  enableExponentialBackoff: true,
  maxBlockDurationMs: 86400000,
});

// General API rate limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60000,
  blockDurationMs: 60000,
  enableExponentialBackoff: false,
});

// Checkout rate limiter: 10 per hour
export const checkoutRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 3600000,
  blockDurationMs: 1800000,
  enableExponentialBackoff: true,
  maxBlockDurationMs: 86400000,
});

// Helper to get client identifier
export function getClientId(): string {
  if (typeof window === 'undefined') return 'server';
  
  // Use a combination of fingerprinting techniques
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let fingerprint = 'client';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    fingerprint = canvas.toDataURL().slice(-50);
  }
  
  // Add timezone and screen info
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screen = `${window.screen.width}x${window.screen.height}`;
  
  return btoa(`${fingerprint}-${timezone}-${screen}`).slice(0, 32);
}

export default RateLimiter;
