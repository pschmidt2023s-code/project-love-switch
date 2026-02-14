import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  product_id: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melde dich an, um Favoriten zu speichern.',
        variant: 'destructive',
      });
      return false;
    }

    // Optimistic update
    const optimisticItem: FavoriteItem = {
      id: crypto.randomUUID(),
      product_id: productId,
      created_at: new Date().toISOString(),
    };
    const previousFavorites = [...favorites];
    setFavorites([...favorites, optimisticItem]);

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      // Sync with server
      await loadFavorites();
      toast({
        title: 'Favorit hinzugefügt',
        description: 'Das Produkt wurde zu deinen Favoriten hinzugefügt.',
      });
      return true;
    } catch (error) {
      // Rollback
      setFavorites(previousFavorites);
      console.error('Error adding favorite:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, favorites, loadFavorites, toast]);

  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) return false;

    // Optimistic update
    const previousFavorites = [...favorites];
    setFavorites(favorites.filter(f => f.product_id !== productId));

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: 'Favorit entfernt',
        description: 'Das Produkt wurde aus deinen Favoriten entfernt.',
      });
      return true;
    } catch (error) {
      // Rollback
      setFavorites(previousFavorites);
      console.error('Error removing favorite:', error);
      return false;
    }
  }, [user, favorites, loadFavorites, toast]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(f => f.product_id === productId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      return removeFromFavorites(productId);
    }
    return addToFavorites(productId);
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites,
    count: favorites.length,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refresh: loadFavorites,
  };
}
