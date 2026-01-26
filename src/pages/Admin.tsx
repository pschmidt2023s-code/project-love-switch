import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent';
import { AdminOrdersContent } from '@/components/admin/AdminOrdersContent';
import { AdminProductsContent } from '@/components/admin/AdminProductsContent';
import { AdminCustomersContent } from '@/components/admin/AdminCustomersContent';
import { AdminAnalyticsContent } from '@/components/admin/AdminAnalyticsContent';
import { InventoryManagement } from '@/components/admin/InventoryManagement';
import { TicketingSystem } from '@/components/admin/TicketingSystem';
import { AuditLogs } from '@/components/admin/AuditLogs';
import CouponManagement from '@/components/admin/CouponManagement';
import NewsletterManagement from '@/components/admin/NewsletterManagement';
import ContestManagement from '@/components/admin/ContestManagement';
import PartnerManagement from '@/components/admin/PartnerManagement';
import PaybackManagement from '@/components/admin/PaybackManagement';
import LiveChatManagement from '@/components/admin/LiveChatManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (authLoading) return;

    async function checkAdminRole() {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('[Admin] Error querying roles:', error);
          navigate('/');
          return;
        }

        if (!roleData) {
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('[Admin] Error checking admin role:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [user, authLoading, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardContent />;
      case 'orders':
        return <AdminOrdersContent />;
      case 'products':
        return <AdminProductsContent />;
      case 'customers':
        return <AdminCustomersContent />;
      case 'inventory':
        return <InventoryManagement />;
      case 'analytics':
        return <AdminAnalyticsContent />;
      case 'tickets':
        return <TicketingSystem />;
      case 'coupons':
        return <CouponManagement />;
      case 'newsletter':
        return <NewsletterManagement />;
      case 'contest':
        return <ContestManagement />;
      case 'partners':
        return <PartnerManagement />;
      case 'payback':
        return <PaybackManagement />;
      case 'chat':
        return <LiveChatManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <AdminDashboardContent />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}
