import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProductComparison } from '@/components/ProductComparison';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { GlobalGestures } from '@/components/GlobalGestures';
import { TouchOptimizations } from '@/components/mobile/TouchOptimizations';
import { CookieConsent } from '@/components/CookieConsent';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { LiveIndicators } from '@/components/live/LiveIndicators';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';

const ProductDetail = React.lazy(() => import('@/pages/ProductDetail'));
const Products = React.lazy(() => import('@/pages/Products'));
const Favorites = React.lazy(() => import('@/pages/Favorites'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Returns = React.lazy(() => import('@/pages/Returns'));
const FAQ = React.lazy(() => import('@/pages/FAQ'));
const Newsletter = React.lazy(() => import('@/pages/Newsletter'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Imprint = React.lazy(() => import('@/pages/Imprint'));
const Partner = React.lazy(() => import('@/pages/Partner'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const CheckoutSuccess = React.lazy(() => import('@/pages/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('@/pages/CheckoutCancel'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const About = React.lazy(() => import('@/pages/About'));
const Shipping = React.lazy(() => import('@/pages/Shipping'));
const Sparkits = React.lazy(() => import('@/pages/Sparkits'));
const ScentFinder = React.lazy(() => import('@/pages/ScentFinder'));
const Account = React.lazy(() => import('@/pages/Account'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const OrdersList = React.lazy(() => import('@/pages/OrdersList'));
const MyReturns = React.lazy(() => import('@/pages/MyReturns'));
const ExpressCheckout = React.lazy(() => import('@/pages/ExpressCheckout'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AuthProvider>
              <CartProvider>
                <ErrorBoundary>
                  <BrowserRouter>
                    <GlobalGestures />
                    <TouchOptimizations />
                    <ProductComparison />
                    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/about" element={<Suspense fallback={<LoadingSpinner />}><About /></Suspense>} />
                        <Route path="/products" element={<Suspense fallback={<LoadingSpinner />}><Products /></Suspense>} />
                        <Route path="/products/:slug" element={<Suspense fallback={<LoadingSpinner />}><ProductDetail /></Suspense>} />
                        <Route path="/favorites" element={<Suspense fallback={<LoadingSpinner />}><Favorites /></Suspense>} />
                        <Route path="/profile" element={<Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>} />
                        <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact /></Suspense>} />
                        <Route path="/returns" element={<Suspense fallback={<LoadingSpinner />}><Returns /></Suspense>} />
                        <Route path="/faq" element={<Suspense fallback={<LoadingSpinner />}><FAQ /></Suspense>} />
                        <Route path="/newsletter" element={<Suspense fallback={<LoadingSpinner />}><Newsletter /></Suspense>} />
                        <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><Privacy /></Suspense>} />
                        <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><Terms /></Suspense>} />
                        <Route path="/imprint" element={<Suspense fallback={<LoadingSpinner />}><Imprint /></Suspense>} />
                        <Route path="/shipping" element={<Suspense fallback={<LoadingSpinner />}><Shipping /></Suspense>} />
                        <Route path="/partner" element={<Suspense fallback={<LoadingSpinner />}><Partner /></Suspense>} />
                        <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><Admin /></Suspense>} />
                        <Route path="/auth" element={<Suspense fallback={<LoadingSpinner />}><Auth /></Suspense>} />
                        <Route path="/cart" element={<Suspense fallback={<LoadingSpinner />}><Cart /></Suspense>} />
                        <Route path="/checkout" element={<Suspense fallback={<LoadingSpinner />}><Checkout /></Suspense>} />
                        <Route path="/express-checkout" element={<Suspense fallback={<LoadingSpinner />}><ExpressCheckout /></Suspense>} />
                        <Route path="/checkout/success" element={<Suspense fallback={<LoadingSpinner />}><CheckoutSuccess /></Suspense>} />
                        <Route path="/checkout/cancel" element={<Suspense fallback={<LoadingSpinner />}><CheckoutCancel /></Suspense>} />
                        <Route path="/sparkits" element={<Suspense fallback={<LoadingSpinner />}><Sparkits /></Suspense>} />
                        <Route path="/scent-finder" element={<Suspense fallback={<LoadingSpinner />}><ScentFinder /></Suspense>} />
                        <Route path="/account" element={<Suspense fallback={<LoadingSpinner />}><Account /></Suspense>} />
                        <Route path="/orders" element={<Suspense fallback={<LoadingSpinner />}><OrdersList /></Suspense>} />
                        <Route path="/orders/:id" element={<Suspense fallback={<LoadingSpinner />}><Orders /></Suspense>} />
                        <Route path="/my-returns" element={<Suspense fallback={<LoadingSpinner />}><MyReturns /></Suspense>} />
                        <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                      </Routes>
                    </div>
                    <MobileBottomNav />
                    <CookieConsent />
                    <InstallPrompt />
                    <OfflineIndicator />
                    <LiveIndicators />
                    <PushNotificationPrompt />
                    <Toaster />
                    <Sonner />
                  </BrowserRouter>
                </ErrorBoundary>
              </CartProvider>
            </AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
