import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Monitor,
  AlertCircle,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Moon,
  CalendarClock,
  Sun,
  User,
  Target,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Switch } from './ui/switch';
import logo from '../../assets/logo1.png';         // full logo  (e.g. 200×50px)
import logoIcon from '../../assets/logo-.png';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/machines', label: 'Machines', icon: Monitor },
  { path: '/downtime', label: 'Downtime', icon: AlertCircle },
  { path: '/shifts', label: 'Shifts', icon: CalendarClock },
  { path: '/configuration', label: 'Configuration', icon: Settings },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/targets', label: 'Targets', icon: Target },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    const current = navItems.find(item => isActive(item.path));
    if (location.pathname.startsWith('/machines/')) return 'Machine Detail';
    return current?.label || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
          }`}
      >
        {/* Logo Area */}
        {collapsed ? (
          /* ── COLLAPSED: logo icon on top, arrow below — no overlap ── */
          <div className="flex flex-col items-center border-b border-[var(--border-color)] py-2 gap-1">
            <img
              src={logoIcon}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          /* ── EXPANDED: full logo centered, arrow on right ── */
          <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-center relative px-2">
            <img
              src={logo}
              alt="TechnoViz"
              className="h-9 w-auto max-w-[150px] object-contain"
            />
            <button
              onClick={() => setCollapsed(true)}
              className="absolute right-2 p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                  }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {getPageTitle()}
          </h1>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-[var(--text-secondary)]" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Moon size={18} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] cursor-pointer">
              <User size={20} className="text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)]">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--bg-secondary)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}