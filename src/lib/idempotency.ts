/**
 * Idempotency Key Manager
 * Prevents duplicate payment requests by tracking request IDs
 */

const IDEMPOTENCY_PREFIX = 'idem_';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateIdempotencyKey(action: string): string {
  const key = `${IDEMPOTENCY_PREFIX}${action}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  return key;
}

interface StoredKey {
  key: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  response?: unknown;
}

export class IdempotencyManager {
  private storageKey = 'idempotency_keys';

  private getKeys(): StoredKey[] {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return [];
      const keys: StoredKey[] = JSON.parse(raw);
      // Prune expired keys
      const now = Date.now();
      return keys.filter(k => now - k.createdAt < EXPIRY_MS);
    } catch {
      return [];
    }
  }

  private saveKeys(keys: StoredKey[]): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(keys));
    } catch {
      // Storage full - clear old keys
      sessionStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Check if a request with this key has already been processed
   */
  isDuplicate(key: string): boolean {
    return this.getKeys().some(k => k.key === key && k.status === 'completed');
  }

  /**
   * Register a new idempotency key as pending
   */
  register(key: string): boolean {
    const keys = this.getKeys();
    if (keys.some(k => k.key === key)) return false;
    keys.push({ key, createdAt: Date.now(), status: 'pending' });
    this.saveKeys(keys);
    return true;
  }

  /**
   * Mark a key as completed with optional response
   */
  complete(key: string, response?: unknown): void {
    const keys = this.getKeys();
    const entry = keys.find(k => k.key === key);
    if (entry) {
      entry.status = 'completed';
      entry.response = response;
      this.saveKeys(keys);
    }
  }

  /**
   * Mark a key as failed (allows retry)
   */
  fail(key: string): void {
    const keys = this.getKeys();
    const idx = keys.findIndex(k => k.key === key);
    if (idx !== -1) {
      keys.splice(idx, 1);
      this.saveKeys(keys);
    }
  }

  /**
   * Get cached response for a completed key
   */
  getCachedResponse(key: string): unknown | undefined {
    const entry = this.getKeys().find(k => k.key === key && k.status === 'completed');
    return entry?.response;
  }
}

export const idempotencyManager = new IdempotencyManager();
