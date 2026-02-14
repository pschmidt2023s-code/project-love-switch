import { useState, useCallback } from 'react';

/**
 * Honeypot anti-bot hook.
 * Renders a hidden field that bots fill in but humans don't.
 * If the field has a value on submit, it's likely a bot.
 */
export function useHoneypot() {
  const [honeypotValue, setHoneypotValue] = useState('');
  const [formLoadedAt] = useState(Date.now());

  const isBot = useCallback(() => {
    // Bot detection: honeypot filled OR form submitted too fast (<2s)
    if (honeypotValue.length > 0) return true;
    if (Date.now() - formLoadedAt < 2000) return true;
    return false;
  }, [honeypotValue, formLoadedAt]);

  const honeypotProps = {
    value: honeypotValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypotValue(e.target.value),
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true as const,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden' as const,
    },
  };

  return { isBot, honeypotProps };
}
