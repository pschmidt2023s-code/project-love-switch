import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function GlobalGestures() {
  const location = useLocation();
  const { toast } = useToast();

  const isDisabledPage = location.pathname.startsWith('/admin') ||
                         location.pathname.startsWith('/checkout') ||
                         location.pathname.startsWith('/product') ||
                         location.pathname.startsWith('/cart');

  const { isPulling, pullDistance } = useAdvancedGestures({
    onSwipeLeft: undefined,
    onSwipeRight: undefined,
    onPullToRefresh: isDisabledPage ? undefined : async () => {
      console.log('Pull to refresh triggered');
      toast({
        title: "Aktualisiert",
        description: "Seite wurde erfolgreich aktualisiert",
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    },
    onLongPress: undefined,
    enableHaptic: !isDisabledPage,
    swipeThreshold: 150,
  });

  if (isDisabledPage) {
    return null;
  }

  return (
    <>
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center items-center bg-primary/10 backdrop-blur-sm transition-all pointer-events-none"
          style={{
            height: Math.min(pullDistance, 100),
            opacity: Math.min(pullDistance / 80, 1),
          }}
        >
          <div
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
            style={{
              transform: `scale(${Math.min(pullDistance / 80, 1)})`,
            }}
          />
        </div>
      )}
    </>
  );
}
