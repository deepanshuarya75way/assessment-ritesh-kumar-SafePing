import { useState } from 'react';
import { Home, Map, PlusCircle, Shield, History, Menu, X, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/locations/new', label: 'Add Location', icon: PlusCircle },
  { to: '/tracking', label: 'Map Tracking', icon: Map },
  { to: '/history', label: 'Arrival History', icon: History },
];

function Sidebar() {
  return (
    <aside className="glass-panel hidden h-full w-full flex-col rounded-3xl p-4 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-3 pt-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">SafePing</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Arrival automations</p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all hover:bg-white/10',
                isActive && 'bg-white/15 text-cyan-200',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(true)} aria-label="Open navigation menu">
        <Menu className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <aside
            className="absolute right-3 top-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.8rem] border border-white/10 bg-[hsl(var(--card))] p-4 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">SafePing</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Menu</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close navigation menu">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="space-y-2">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/10',
                      isActive && 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
              <ThemeToggle forceLabel />
              <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default Sidebar;
