import { NavLink, useNavigate } from 'react-router-dom';
import { Radar, Trophy, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-signal/10 text-signal border border-signal/40'
            : 'text-slate-text border border-transparent hover:text-slate-bright hover:bg-void-raised',
        ].join(' ')
      }
    >
      <Icon size={16} strokeWidth={2} />
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-void-border bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] w-full items-center justify-between px-4 py-3 sm:px-6 xl:px-10">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-signal/50 bg-void-panel">
            <Radar size={18} className="text-signal" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-terminal animate-blip" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-slate-bright">
            Fleet<span className="text-signal">Code</span>
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavItem to="/" icon={Users} label="Squad" />
          <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-mono text-sm text-slate-bright">{user?.username}</p>
            <p className="eyebrow text-terminal">{user?.squadName ?? 'no squad'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md border border-void-border px-3 py-2 text-sm text-slate-text transition-colors hover:border-signal/50 hover:text-signal"
            aria-label="Log out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
