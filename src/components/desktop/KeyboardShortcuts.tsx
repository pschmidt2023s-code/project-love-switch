import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const modKey = e.ctrlKey || e.metaKey;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        showShortcutsHelp();
        return;
      }

      if (!modKey) return;

      const shortcuts: Record<string, () => void> = {
        'k': () => {
          e.preventDefault();
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        },
        'b': () => {
          e.preventDefault();
          const cartButton = document.querySelector('[aria-label*="Warenkorb"]') as HTMLButtonElement;
          if (cartButton) cartButton.click();
        },
        'h': () => {
          e.preventDefault();
          navigate('/');
        },
        'p': () => {
          e.preventDefault();
          navigate('/profile');
        },
        'f': () => {
          e.preventDefault();
          navigate('/favorites');
        },
      };

      if (shortcuts[e.key.toLowerCase()]) {
        shortcuts[e.key.toLowerCase()]();
      }
    };

    const showShortcutsHelp = () => {
      toast({
        title: 'Tastenkürzel',
        description: `
          Ctrl/Cmd + K: Suche
          Ctrl/Cmd + B: Warenkorb
          Ctrl/Cmd + H: Home
          Ctrl/Cmd + P: Profil
          Ctrl/Cmd + F: Favoriten
          ?: Diese Hilfe
        `,
      });
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [navigate]);

  return null;
}
