// StatCard component - displays statistics with icon, value, and growth indicator
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
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
      className="rounded-2xl p-5 md:p-6 border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">{label}</p>
          <p className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-1.5">{value}</p>
          {growth !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-bold', isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]')}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(growth)}%</span>
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: iconBgColor ?? 'linear-gradient(135deg, var(--primary), #3B6AEA)',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
