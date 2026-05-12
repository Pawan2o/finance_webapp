import { Search, ChevronDown, User, Settings as SettingsIcon, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { clearStoredAuth } from '../../../utils/auth';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  pageTitle: string;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function Header({ pageTitle, onMenuClick, onSearch, searchPlaceholder }: HeaderProps) {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleLogout      = () => { clearStoredAuth(); navigate('/'); };
  const handleProfileClick = () => navigate('/profile');

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 border-b"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(20px)' }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl transition-colors" style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-60 border transition-colors focus-within:border-[var(--primary)]"
          style={{ background: 'var(--input-background)', borderColor: 'var(--input)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder={searchPlaceholder || 'Search...'} onChange={e => onSearch?.(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none flex-1" style={{ color: 'var(--foreground)' }} />
        </div>

        {/* Theme toggle */}
        <button onClick={toggle} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0"
          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-accent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(140deg, #0D1E5C, #3B6AEA)' }}>A</div>
            <ChevronDown className="w-4 h-4 hidden sm:block" style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <div className="absolute right-0 mt-2 w-48 rounded-2xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="p-2">
              <button onClick={handleProfileClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors" style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-foreground)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
                <User className="w-4 h-4" /><span className="text-sm font-semibold">Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors" style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-foreground)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
                <SettingsIcon className="w-4 h-4" /><span className="text-sm font-semibold">Account Settings</span>
              </button>
              <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors" style={{ color: 'var(--destructive)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <LogOut className="w-4 h-4" /><span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
