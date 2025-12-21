import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantSize: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // Load from localStorage for guests
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          variant_id,
          product_variants (
            id,
            size,
            price,
            product_id,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        variantId: item.variant_id,
        productId: item.product_variants?.product_id,
        productName: item.product_variants?.products?.name || '',
        variantSize: item.product_variants?.size || '',
        price: Number(item.product_variants?.price) || 0,
        quantity: item.quantity,
        image: item.product_variants?.products?.image_url || '',
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<CartItem, 'id'>) => {
    const existingItem = items.find(item => item.variantId === newItem.variantId);

    if (user) {
      try {
        if (existingItem) {
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + newItem.quantity })
            .eq('user_id', user.id)
            .eq('variant_id', newItem.variantId);
        } else {
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              variant_id: newItem.variantId,
              quantity: newItem.quantity
            });
        }
        await loadCart();
        toast.success('Zum Warenkorb hinzugefügt');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Fehler beim Hinzufügen');
      }
    } else {
      // Guest cart
      if (existingItem) {
        setItems(items.map(item =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        ));
      } else {
        setItems([...items, { ...newItem, id: crypto.randomUUID() }]);
      }
      toast.success('Zum Warenkorb hinzugefügt');
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(variantId);
      return;
    }

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('variant_id', variantId);
        await loadCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      setItems(items.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = async (variantId: string) => {
    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('variant_id', variantId);
        await loadCart();
        toast.success('Artikel entfernt');
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      setItems(items.filter(item => item.variantId !== variantId));
      toast.success('Artikel entfernt');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setItems([]);
      localStorage.removeItem('cart');
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
