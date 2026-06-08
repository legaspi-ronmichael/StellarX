import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Wallet, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'demo1234' });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center mb-3">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your league</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-stellar-400 hover:underline">
            Create one
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Demo accounts (password: demo1234)
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo('admin@league.test')}
              className="text-xs text-left px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700"
            >
              👑 admin@league.test <span className="text-slate-500">(admin)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('captain1@league.test')}
              className="text-xs text-left px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700"
            >
              🏀 captain1@league.test <span className="text-slate-500">(captain)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('player1@league.test')}
              className="text-xs text-left px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700"
            >
              🏃 player1@league.test <span className="text-slate-500">(player)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
