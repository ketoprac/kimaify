import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label: string;
  subtitle?: string;
  badge?: string;
  color?: string;
  active?: boolean;
  onClick: () => void;
  testId?: string;
}

export function SidebarItem({ label, subtitle, badge, color, active, onClick, testId }: SidebarItemProps) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        active && 'bg-accent text-accent-foreground font-medium'
      )}
    >
      {color ? (
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : (
        <span className="h-2.5 w-2.5 flex-shrink-0" aria-hidden />
      )}
      <span className="flex-1 min-w-0">
        <span className="block truncate leading-tight">{label}</span>
        {subtitle && (
          <span className="block truncate text-xs text-muted-foreground font-normal">{subtitle}</span>
        )}
      </span>
      {badge && (
        <span className="ml-auto flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
