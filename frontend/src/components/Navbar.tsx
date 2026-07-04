import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-wine' : 'text-muted hover:text-ink'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links =
    user?.role === 'customer'
      ? [
          { to: '/book', label: 'Reserve a table' },
          { to: '/my-reservations', label: 'My reservations' }
        ]
      : [
          { to: '/admin', label: 'Reservations' },
          { to: '/admin/tables', label: 'Tables' }
        ];

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-wine" />
          <span className="font-display text-lg font-semibold text-ink">Osteria Booking</span>
        </NavLink>

        {user && (
          <>
            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              <div className="flex items-center gap-3 border-l border-line pl-6">
                <span className="text-sm text-muted">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-rust"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </nav>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="rounded-lg p-2 text-ink md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && open && (
        <nav className="flex flex-col gap-1 border-t border-line px-6 py-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-wine-light text-wine' : 'text-muted hover:bg-black/5'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-line px-3 pt-3">
            <span className="text-sm text-muted">{user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-rust"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}