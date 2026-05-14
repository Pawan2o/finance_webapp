import type { ReactNode } from 'react';
import { Clock3 } from 'lucide-react';
import { Layout } from './Layout';

interface ComingSoonPageProps {
  pageTitle: string;
  heading?: string;
  message?: string;
  children?: ReactNode;
}

export function ComingSoonPage({
  pageTitle,
  heading,
  message = 'This section is still being prepared.',
  children,
}: ComingSoonPageProps) {
  return (
    <Layout pageTitle={pageTitle}>
      <div
        className="rounded-2xl border p-10 text-center md:p-16"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg, var(--primary), #3B6AEA)', boxShadow: '0 8px 24px rgba(30,58,138,0.35)' }}
        >
          <Clock3 className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {heading ?? pageTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
        {children}
      </div>
    </Layout>
  );
}
