import { useIdleTimeout } from '@/hooks/useIdleTimeout';

/**
 * Component that activates security features globally.
 * Must be rendered inside AuthProvider.
 */
export function SecurityGuard() {
  useIdleTimeout();
  return null;
}
