import { useNavigate } from 'react-router';
import { useRef, useEffect } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '../ui/utils';
import { clearStoredAuth } from '../../../utils/auth';
import { navigationItems } from '../../config/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
}

const navGroups = [
  { label: 'Overview',    items: ['dashboard'] },
  { label: 'Management', items: ['users', 'types', 'categories', 'payment-methods', 'transactions'] },
  { label: 'System',     items: ['roles', 'audit-logs', 'ai-questions', 'reports'] },
  { label: 'Account',    items: ['profile', 'settings'] },
];

export function Sidebar({ collapsed, onToggle, activeItem, onNavigate }: SidebarProps) {
  const navigate  = useNavigate();
  const navRef    = useRef<HTMLElement>(null);
  const scrollKey = 'sidebar-scroll';

  useEffect(() => {
    const saved = sessionStorage.getItem(scrollKey);
    if (saved && navRef.current) navRef.current.scrollTop = Number(saved);
  }, []);

  const handleScroll = () => {
    if (navRef.current) sessionStorage.setItem(scrollKey, String(navRef.current.scrollTop));
  };

  const handleNavigation = (itemId: string) => {
    onNavigate(itemId);
    const target = navigationItems.find(i => i.id === itemId);
    navigate(target?.path ?? `/${itemId}`);
  };

  const handleLogout = () => { clearStoredAuth(); navigate('/'); };

  return (
    <aside
      className={cn('fixed left-0 top-0 h-screen flex flex-col border-r z-40 transition-all duration-300 ease-in-out', collapsed ? 'w-[68px]' : 'w-[240px]')}
      style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
        {!collapsed ? (
          <>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 select-none"
              style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 55%, #3B6AEA 100%)', boxShadow: '0 4px 14px rgba(30,58,138,0.45)' }}>
              P
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-black tracking-tight whitespace-nowrap" style={{ color: 'var(--sidebar-foreground)' }}>PaisaTrack</p>
              <p className="text-[10px] font-semibold whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>Admin Panel</p>
            </div>
            <button onClick={onToggle} className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-accent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="w-full flex items-center justify-center p-1.5 rounded-lg transition-colors" title="Expand sidebar"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-accent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 select-none"
              style={{ background: 'linear-gradient(140deg, #0D1E5C 0%, #2448AC 55%, #3B6AEA 100%)', boxShadow: '0 4px 14px rgba(30,58,138,0.45)' }}>
              P
            </div>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden py-3" style={{ scrollbarWidth: 'none' }}>
        {navGroups.map(group => {
          const groupItems = navigationItems.filter(n => group.items.includes(n.id));
          if (!groupItems.length) return null;
          return (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                  {group.label}
                </p>
              )}
              {collapsed && <div className="mx-3 my-2 h-px" style={{ background: 'var(--sidebar-border)' }} />}
              <div className="px-2 space-y-0.5">
                {groupItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <div key={item.id} className="relative group/item">
                      <button
                        onClick={() => handleNavigation(item.id)}
                        className={cn('w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative overflow-hidden',
                          collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                          !isActive && 'hover:bg-[var(--sidebar-accent)]')}
                        style={isActive ? { background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, #3B6AEA 100%)', boxShadow: '0 4px 14px rgba(30,58,138,0.35)', color: '#fff' } : { color: 'var(--muted-foreground)' }}
                      >
                        {isActive && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full" style={{ background: 'rgba(255,255,255,0.6)' }} />}
                        <Icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} style={isActive ? { color: '#fff' } : {}} />
                        {!collapsed && <span className="text-sm font-semibold truncate" style={isActive ? { color: '#fff' } : { color: 'var(--sidebar-foreground)' }}>{item.label}</span>}
                        {isActive && collapsed && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />}
                      </button>
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover/item:opacity-100 translate-x-1 group-hover/item:translate-x-0 transition-all duration-150"
                          style={{ background: 'var(--sidebar-foreground)', color: 'var(--sidebar)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                          {item.label}
                          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: 'var(--sidebar-foreground)' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="flex-shrink-0 border-t p-3" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className={cn('flex items-center gap-3 px-2 py-2 rounded-xl', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: 'linear-gradient(140deg, #0D1E5C, #3B6AEA)' }}>A</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--sidebar-foreground)' }}>Admin User</p>
              <p className="text-[10px] font-medium truncate" style={{ color: 'var(--muted-foreground)' }}>admin@humbingo.com</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout" className="p-1.5 rounded-lg transition-colors flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--destructive)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout} title="Logout" className="w-full flex justify-center p-2 mt-1 rounded-xl transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--destructive)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
