import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>{title}</h2>
        {subtitle && (
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
