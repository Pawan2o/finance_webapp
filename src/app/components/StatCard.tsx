// StatCard component - displays statistics with icon, value, and growth indicator
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../components/ui/utils';

// Props interface for StatCard component
interface StatCardProps {
  icon: LucideIcon; // Icon component to display
  label: string; // Label text for the statistic
  value: string | number; // The main value to display
  growth?: number; // Optional growth percentage (positive or negative)
  iconColor?: string; // Custom icon color
  iconBgColor?: string; // Custom icon background color
}

// Displays a statistic card with icon, value, and optional growth indicator
export function StatCard({ icon: Icon, label, value, growth, iconColor = '#374151', iconBgColor = '#F3F4F6' }: StatCardProps) {
  // Determine if growth is positive or negative
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,247,252,0.92)_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1 md:p-6">
      <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(66,104,224,0.45),transparent)]" />
      <div className="flex items-start justify-between">
        {/* Left side - Label, Value, and Growth */}
        <div className="flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 md:text-sm">{label}</p>
          <p className="mb-1 text-2xl font-semibold text-slate-950 md:text-3xl">{value}</p>
          {/* Growth indicator with trending icon */}
          {growth !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium md:text-sm',
              isPositive ? 'text-emerald-600' : 'text-rose-500'
            )}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span className="font-medium">
                {Math.abs(growth)}%
              </span>
            </div>
          )}
        </div>
        {/* Right side - Icon */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/80 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:h-14 md:w-14"
          style={{ background: `linear-gradient(180deg, ${iconBgColor}, rgba(255,255,255,0.96))` }}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
