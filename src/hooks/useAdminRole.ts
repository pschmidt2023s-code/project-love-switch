import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'admin' | 'manager' | 'support' | null;

interface UseAdminRoleResult {
  role: AdminRole;
  isAdmin: boolean;
  isManager: boolean;
  isSupport: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  permissions: {
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageCustomers: boolean;
    canViewAnalytics: boolean;
    canManageInventory: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
  };
}

export function useAdminRole(): UseAdminRoleResult {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'manager', 'support'])
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setRole(data.role as AdminRole);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching admin role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isSupport = role === 'support';
  const hasAdminAccess = isAdmin || isManager || isSupport;

  // Role-based permissions
  const permissions = {
    // Admin: Full access
    // Manager: Products, Orders, Customers, Inventory, Analytics
    // Support: Orders, Customers, Tickets only
    canManageProducts: isAdmin || isManager,
    canManageOrders: hasAdminAccess,
    canManageCustomers: hasAdminAccess,
    canViewAnalytics: isAdmin || isManager,
    canManageInventory: isAdmin || isManager,
    canManageSettings: isAdmin,
    canManageUsers: isAdmin,
    canViewAuditLogs: isAdmin,
  };

  return {
    role,
    isAdmin,
    isManager,
    isSupport,
    hasAdminAccess,
    isLoading,
    permissions,
  };
}
