import { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Lazy load all admin components for better performance
const AdminDashboardContent = lazy(() => import('@/components/admin/AdminDashboardContent').then(m => ({ default: m.AdminDashboardContent })));
const AdminOrdersContent = lazy(() => import('@/components/admin/AdminOrdersContent').then(m => ({ default: m.AdminOrdersContent })));
const AdminProductsContent = lazy(() => import('@/components/admin/AdminProductsContent').then(m => ({ default: m.AdminProductsContent })));
const AdminCustomersContent = lazy(() => import('@/components/admin/AdminCustomersContent').then(m => ({ default: m.AdminCustomersContent })));
const AdminAnalyticsContent = lazy(() => import('@/components/admin/AdminAnalyticsContent').then(m => ({ default: m.AdminAnalyticsContent })));
const InventoryManagement = lazy(() => import('@/components/admin/InventoryManagement').then(m => ({ default: m.InventoryManagement })));
const TicketingSystem = lazy(() => import('@/components/admin/TicketingSystem').then(m => ({ default: m.TicketingSystem })));
const ReturnsManagement = lazy(() => import('@/components/admin/ReturnsManagement').then(m => ({ default: m.ReturnsManagement })));
const AuditLogs = lazy(() => import('@/components/admin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const EmailLogsManagement = lazy(() => import('@/components/admin/EmailLogsManagement').then(m => ({ default: m.EmailLogsManagement })));
const CouponManagement = lazy(() => import('@/components/admin/CouponManagement'));
const NewsletterManagement = lazy(() => import('@/components/admin/NewsletterManagement'));
const ContestManagement = lazy(() => import('@/components/admin/ContestManagement'));
const PartnerManagement = lazy(() => import('@/components/admin/PartnerManagement'));
const PaybackManagement = lazy(() => import('@/components/admin/PaybackManagement'));
const LiveChatManagement = lazy(() => import('@/components/admin/LiveChatManagement'));
const SettingsManagement = lazy(() => import('@/components/admin/SettingsManagement'));
const PerformanceDashboard = lazy(() => import('@/components/admin/PerformanceDashboard'));

function AdminContentLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Laden...</p>
      </div>
    </div>
  );
}

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
    const content = (() => {
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
        case 'returns':
          return <ReturnsManagement />;
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
        case 'emails':
          return <EmailLogsManagement />;
        case 'audit':
          return <AuditLogs />;
        case 'settings':
          return <SettingsManagement />;
        case 'performance':
          return <PerformanceDashboard />;
        default:
          return <AdminDashboardContent />;
      }
    })();

    return (
      <Suspense fallback={<AdminContentLoader />}>
        {content}
      </Suspense>
    );
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
