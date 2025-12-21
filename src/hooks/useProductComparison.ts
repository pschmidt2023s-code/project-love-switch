import { useState, useCallback, useEffect } from 'react';

interface ComparisonItem {
  id: string;
  name: string;
  image: string;
  price: number;
}

const MAX_COMPARISON_ITEMS = 4;
const STORAGE_KEY = 'product_comparison';

export function useProductComparison() {
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setComparisonItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveToStorage = useCallback((items: ComparisonItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addToComparison = useCallback((item: ComparisonItem) => {
    setComparisonItems(prev => {
      if (prev.length >= MAX_COMPARISON_ITEMS) return prev;
      if (prev.some(i => i.id === item.id)) return prev;
      const newItems = [...prev, item];
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const removeFromComparison = useCallback((id: string) => {
    setComparisonItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isInComparison = useCallback((id: string) => {
    return comparisonItems.some(i => i.id === id);
  }, [comparisonItems]);

  return {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    maxItems: MAX_COMPARISON_ITEMS,
  };
}
