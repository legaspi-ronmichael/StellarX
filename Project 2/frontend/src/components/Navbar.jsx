import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut, User as UserIcon, Wallet, LayoutDashboard, Trophy, Receipt, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { truncateKey, roleColor } from '../utils/format.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center font-bold text-white">
              S
            </div>
            <div>
              <div className="font-bold text-lg gradient-text">Stellar League</div>
              <div className="text-[10px] text-slate-400 -mt-1">Community Sports Ledger</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/leagues" className="text-slate-300 hover:text-white transition">
              Leagues
            </Link>
            <Link to="/explorer" className="text-slate-300 hover:text-white transition">
              Public Ledger
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link to="/teams" className="text-slate-300 hover:text-white transition">
                  My Teams
                </Link>
                <Link to="/ledger" className="text-slate-300 hover:text-white transition">
                  My Ledger
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className={`badge text-[10px] ${roleColor(user.role)}`}>{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-300"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/leagues" className="block py-2 text-slate-300">
              Leagues
            </Link>
            <Link to="/explorer" className="block py-2 text-slate-300">
              Public Ledger
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="block py-2 text-slate-300">
                  Dashboard
                </Link>
                <Link to="/teams" className="block py-2 text-slate-300">
                  My Teams
                </Link>
                <Link to="/ledger" className="block py-2 text-slate-300">
                  My Ledger
                </Link>
                <Link to="/profile" className="block py-2 text-slate-300">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-red-400"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
