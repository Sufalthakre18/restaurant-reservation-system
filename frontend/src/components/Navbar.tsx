import { NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-wine' : 'text-muted hover:text-ink'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-wine" />
          <span className="font-display text-lg font-semibold text-ink">Osteria Booking</span>
        </NavLink>

        {user && (
          <nav className="flex items-center gap-6">
            {user.role === 'customer' ? (
              <>
                <NavLink to="/book" className={linkClass}>
                  Reserve a table
                </NavLink>
                <NavLink to="/my-reservations" className={linkClass}>
                  My reservations
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin" className={linkClass}>
                  Reservations
                </NavLink>
                <NavLink to="/admin/tables" className={linkClass}>
                  Tables
                </NavLink>
              </>
            )}

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
        )}
      </div>
    </header>
  );
}
