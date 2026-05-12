import { useState, ReactNode, useEffect } from 'react';
import { useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../ui/utils';

interface LayoutProps {
  children: ReactNode;
  pageTitle: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function Layout({ children, pageTitle, onSearch, searchPlaceholder }: LayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  const getActiveItem = () => location.pathname.replace('/', '') || 'dashboard';
  const [activeMenuItem, setActiveMenuItem] = useState(getActiveItem());

  useEffect(() => { setActiveMenuItem(getActiveItem()); }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeMenuItem} onNavigate={setActiveMenuItem} />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative">
            <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)}
              activeItem={activeMenuItem}
              onNavigate={item => { setActiveMenuItem(item); setMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      <ScrollRestoration getKey={() => 'fixed'} />

      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]')}>
        <Header pageTitle={pageTitle} onMenuClick={() => setMobileMenuOpen(true)} onSearch={onSearch} searchPlaceholder={searchPlaceholder} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
