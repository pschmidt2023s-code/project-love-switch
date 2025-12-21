interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private blockDurationMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000, blockDurationMs: number = 300000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(clientId);

    // No previous attempts
    if (!entry) {
      this.limits.set(clientId, {
        attempts: 1,
        firstAttempt: now,
        blockedUntil: null,
      });
      return true;
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // Block expired, reset
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      this.limits.set(clientId, {
        attempts: 1,
        firstAttempt: now,
        blockedUntil: null,
      });
      return true;
    }

    // Window expired, reset
    if (now - entry.firstAttempt > this.windowMs) {
      this.limits.set(clientId, {
        attempts: 1,
        firstAttempt: now,
        blockedUntil: null,
      });
      return true;
    }

    // Within window, check attempts
    if (entry.attempts >= this.maxAttempts) {
      // Block the client
      this.limits.set(clientId, {
        ...entry,
        blockedUntil: now + this.blockDurationMs,
      });
      return false;
    }

    // Increment attempts
    this.limits.set(clientId, {
      ...entry,
      attempts: entry.attempts + 1,
    });
    return true;
  }

  getBlockTimeRemaining(clientId: string): number {
    const entry = this.limits.get(clientId);
    if (!entry || !entry.blockedUntil) {
      return 0;
    }
    const remaining = entry.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  reset(clientId: string): void {
    this.limits.delete(clientId);
  }
}

// Auth-specific rate limiter: 5 attempts per minute, 5 minute block
export const authRateLimiter = new RateLimiter(5, 60000, 300000);

// General API rate limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter(100, 60000, 60000);

export default RateLimiter;
