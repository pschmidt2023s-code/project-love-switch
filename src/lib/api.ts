import { supabase } from '@/integrations/supabase/client';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  favorites: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);
      
      return { 
        data: data?.map(item => ({
          id: item.id,
          perfume_id: item.product_id,
          variant_id: '',
          created_at: item.created_at
        })) || [], 
        error: error?.message 
      };
    },
    add: async (perfumeId: string, variantId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: perfumeId });
      
      return { error: error?.message };
    },
    remove: async (favoriteId: string) => {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', favoriteId);
      
      return { error: error?.message };
    },
  },
  profile: {
    get: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { data, error: error?.message };
    },
    update: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      return { error: error?.message };
    },
  },
  addresses: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);
      
      return { data: data || [], error: error?.message };
    },
    create: async (address: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...address, user_id: user.id })
        .select()
        .single();
      
      return { data, error: error?.message };
    },
    update: async (id: string, updates: any) => {
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id);
      
      return { error: error?.message };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);
      
      return { error: error?.message };
    },
  },
  orders: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return { data: data || [], error: error?.message };
    },
  },
  loyalty: {
    get: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, total_spent, payback_balance')
        .eq('id', user.id)
        .single();
      
      return { 
        data: {
          tier: profile?.tier || 'bronze',
          totalSpent: profile?.total_spent || 0,
          cashbackBalance: profile?.payback_balance || 0,
        }, 
        error: null 
      };
    },
  },
};
