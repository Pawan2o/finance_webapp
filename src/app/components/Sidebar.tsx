// Sidebar component - navigation menu with collapsible functionality
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { navigationItems } from '../navigation';
import { clearStoredAuth } from '../../utils/auth';

const SIDEBAR_SCROLL_STORAGE_KEY = 'sidebar-navigation-scroll-top';

// Props interface for Sidebar component
interface SidebarProps {
  collapsed: boolean; // Whether sidebar is collapsed
  onToggle: () => void; // Callback to toggle sidebar
  activeItem: string; // Currently active menu item
  onNavigate: (item: string) => void; // Callback when navigating to a menu item
}

// Sidebar navigation component with collapsible menu
export function Sidebar({ collapsed, onToggle, activeItem, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const savedScrollTop = window.sessionStorage.getItem(SIDEBAR_SCROLL_STORAGE_KEY);
    if (!navRef.current || !savedScrollTop) {
      return;
    }

    navRef.current.scrollTop = Number(savedScrollTop);
  }, []);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const handleScroll = () => {
      window.sessionStorage.setItem(
        SIDEBAR_SCROLL_STORAGE_KEY,
        String(navElement.scrollTop)
      );
    };

    navElement.addEventListener('scroll', handleScroll);

    return () => {
      handleScroll();
      navElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle navigation to a menu item
  const handleNavigation = (itemId: string) => {
    onNavigate(itemId);
    const target = navigationItems.find((item) => item.id === itemId);
    navigate(target?.path ?? `/${itemId}`);
  };

  // Handle logout - clear tokens and redirect to login
  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login');
  };
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#061226_0%,#0A1830_34%,#102448_100%)] text-white shadow-[28px_0_80px_rgba(2,6,23,0.34)] transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(102,144,247,0.28),_transparent_70%)] blur-2xl" />
        <div className="absolute bottom-16 right-[-24px] h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.20),_transparent_72%)] blur-3xl" />
      </div>

      {/* Logo Section */}
      <div
        className={cn(
          'relative flex h-20 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {/* Logo text - hidden when collapsed */}
        {!collapsed && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200/70">Finance OS</p>
            <span className="text-lg font-semibold text-white">PaisaTrack</span>
          </div>
        )}
        {/* Toggle button to collapse/expand sidebar */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={cn(
            'rounded-2xl border border-white/10 bg-white/8 p-2 text-blue-100 transition-colors hover:bg-white/14',
            collapsed && 'shadow-[0_12px_24px_rgba(66,104,224,0.22)]'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation Items */}
      <nav ref={navRef} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                'group flex w-full items-center rounded-2xl transition-all',
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-3',
                isActive
                  ? 'bg-[linear-gradient(135deg,rgba(66,104,224,0.95)_0%,rgba(102,144,247,0.95)_100%)] text-white shadow-[0_14px_30px_rgba(66,104,224,0.35)]'
                  : 'text-blue-50/90 hover:bg-white/10 hover:text-white'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-colors',
                  isActive ? 'bg-white/14' : 'bg-white/6 group-hover:bg-white/10'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
              </div>
              {/* Label - hidden when collapsed */}
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Section */}
      <div className={cn('relative border-t border-white/10', collapsed ? 'p-2.5' : 'p-3')}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 transition-colors hover:bg-white/12',
            collapsed && 'justify-center px-0 py-2.5'
          )}
          title={collapsed ? 'Admin profile' : undefined}
        >
          {/* Admin avatar */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1E3A8A_0%,#2D55CC_100%)] shadow-[0_10px_22px_rgba(30,58,138,0.35)]">
            <span className="text-sm font-semibold text-white">A</span>
          </div>
          {/* Admin info - hidden when collapsed */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">Admin User</p>
              <p className="truncate text-xs text-blue-100/60">admin@humbingo.com</p>
            </div>
          )}
        </div>
        {/* Logout button - hidden when collapsed */}
        {!collapsed && (
          <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-blue-100/72 transition-colors hover:bg-red-500/12 hover:text-red-200">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
