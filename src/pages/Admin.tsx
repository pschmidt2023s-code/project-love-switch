import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import CustomerManagement from '@/components/admin/CustomerManagement';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
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
        return <AdminDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <AdminAnalytics />;
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
      case 'settings':
        return <SettingsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-[260px] border-r border-border">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
