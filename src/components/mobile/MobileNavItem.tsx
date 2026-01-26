import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function MobileNavItem({
  icon: Icon,
  label,
  href,
  isActive = false,
  badge,
  onClick,
}: MobileNavItemProps) {
  const content = (
    <>
      <div className="relative">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[9px] font-semibold flex items-center justify-center bg-accent text-accent-foreground rounded-full">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
      )}
    </>
  );

  const baseClasses = cn(
    'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors relative gap-1',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={href || '/'} className={baseClasses}>
      {content}
    </Link>
  );
}
