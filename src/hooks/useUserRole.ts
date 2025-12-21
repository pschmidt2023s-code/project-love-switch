import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserRoleData {
  tier: string;
  tierLabel: string;
  discount: number;
  cashbackBalance: number;
  isLoading: boolean;
}

const tierConfig: Record<string, { label: string; discount: number }> = {
  bronze: { label: 'Bronze', discount: 0 },
  silver: { label: 'Silber', discount: 5 },
  gold: { label: 'Gold', discount: 10 },
  platinum: { label: 'Platin', discount: 15 },
};

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [tier, setTier] = useState('bronze');
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier('bronze');
      setCashbackBalance(0);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, payback_balance')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setTier(data.tier || 'bronze');
          setCashbackBalance(Number(data.payback_balance) || 0);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const config = tierConfig[tier] || tierConfig.bronze;

  return {
    tier,
    tierLabel: config.label,
    discount: config.discount,
    cashbackBalance,
    isLoading,
  };
}
