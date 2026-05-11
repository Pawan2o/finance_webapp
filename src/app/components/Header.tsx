// Header component - displays page title, search bar, notifications, and user profile
import { useState } from 'react';
import { Search, ChevronDown, User, Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import { clearStoredAuth } from '../../utils/auth';

// Props interface for Header component
interface HeaderProps {
  pageTitle: string; // Title to display in the header
  onMenuClick?: () => void; // Callback for mobile menu button click
  onSearch?: (query: string) => void; // Callback for search input changes
  searchPlaceholder?: string; // Placeholder text for search input
}

// Header component with search, notifications, and user profile dropdown
export function Header({ pageTitle, onMenuClick, onSearch, searchPlaceholder }: HeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6 md:pt-5">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between rounded-[26px] border border-white/65 bg-white/82 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl md:px-6">
      {/* Left Side - Mobile Menu Button and Page Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - only visible on small screens */}
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden rounded-2xl border border-slate-200/80 bg-slate-50/90 p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">PaisaTrack Admin</p>
          <h1 className="text-xl font-semibold text-slate-950 md:text-2xl">{pageTitle}</h1>
        </div>
      </div>

      {/* Right Side - Search and Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar - visible on md+ screens */}
        <div className="hidden md:flex w-72 items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-3">
          <Search className="h-4 w-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search"
            placeholder={searchPlaceholder || "Search..."}
            onChange={(e) => onSearch?.(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none min-w-0"
          />
        </div>

        {/* Admin Avatar & Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="Admin menu"
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-2.5 py-2 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1E3A8A_0%,#2D55CC_100%)] shadow-[0_10px_24px_rgba(30,58,138,0.35)]">
              <span className="text-sm font-semibold text-white">A</span>
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</p>
              <p className="text-sm font-semibold text-slate-900">Admin</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" aria-hidden="true" />
          </button>

          {/* Dropdown Menu - keyboard & click accessible */}
          {dropdownOpen && (
            <>
              {/* Click-outside overlay */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
              <div
                role="menu"
                className="absolute right-0 z-20 mt-3 w-56 rounded-2xl border border-white/70 bg-white/96 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90"
              >
                <div className="p-2">
                  {/* Profile option */}
                  <button
                    role="menuitem"
                    onClick={() => { handleProfileClick(); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:bg-slate-50"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Profile</span>
                  </button>
                  {/* Account Settings option */}
                  <button
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:bg-slate-50"
                  >
                    <SettingsIcon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Account Settings</span>
                  </button>
                  {/* Divider */}
                  <div className="my-2 border-t border-slate-200" role="separator"></div>
                  {/* Logout option */}
                  <button
                    role="menuitem"
                    onClick={() => { handleLogout(); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
