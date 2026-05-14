import type { ReactNode } from 'react';
import { cn } from './ui/utils';

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export function PageCard({ children, className }: PageCardProps) {
  return (
    <section
      className={cn('rounded-2xl border p-4 md:p-6', className)}
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {children}
    </section>
  );
}
