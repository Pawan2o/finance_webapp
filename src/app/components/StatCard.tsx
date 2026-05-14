import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  growth?: number;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatCard({ icon: Icon, label, value, growth, iconColor = '#fff', iconBgColor }: StatCardProps) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div
      className="rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 md:p-6"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</p>
          <p className="mb-1.5 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">{value}</p>
          {growth !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-bold', isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]')}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{Math.abs(growth)}%</span>
            </div>
          )}
        </div>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12"
          style={{
            background: iconBgColor ?? 'linear-gradient(135deg, var(--primary), #3B6AEA)',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
