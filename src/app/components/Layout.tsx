// Layout component - provides consistent page structure with sidebar and header
import { useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { cn } from '../components/ui/utils';

// Props interface for Layout component
interface LayoutProps {
  children: ReactNode; // Page content to render
  pageTitle: string; // Title to display in header
  onSearch?: (query: string) => void; // Optional search callback
  searchPlaceholder?: string; // Optional search placeholder text
}

// Main layout wrapper component with sidebar and header
export function Layout({ children, pageTitle, onSearch, searchPlaceholder }: LayoutProps) {
  const location = useLocation();
  // State for sidebar collapse on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // State for mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get active menu item from current URL path
  const getActiveItem = () => {
    const path = location.pathname.replace('/', '');
    return path || 'dashboard';
  };
  
  const [activeMenuItem, setActiveMenuItem] = useState(getActiveItem());

  // Update active menu item when route changes
  useEffect(() => {
    setActiveMenuItem(getActiveItem());
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(45,85,204,0.24),_transparent_68%)] blur-2xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.18),_transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(36,72,172,0.12),_transparent_70%)] blur-3xl" />
      </div>

      {/* Sidebar - Desktop (hidden on mobile) */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeMenuItem}
          onNavigate={setActiveMenuItem}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Sidebar for mobile */}
          <div className="relative max-w-[86vw]">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              activeItem={activeMenuItem}
              onNavigate={(item) => {
                setActiveMenuItem(item);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60')}>
        {/* Header with page title and search */}
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
        />
        {/* Page content */}
        <main className="px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-5">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
