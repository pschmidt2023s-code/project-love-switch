import { ReactNode } from 'react';
import { PremiumNavigation } from '@/components/premium/PremiumNavigation';
import { PremiumFooter } from '@/components/premium/PremiumFooter';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface PremiumPageLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
}

export function PremiumPageLayout({
  children,
  showNav = true,
  showFooter = true,
  showMobileNav = true,
}: PremiumPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && <PremiumNavigation />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <PremiumFooter />}
      {showMobileNav && <MobileBottomNav />}
    </div>
  );
}
