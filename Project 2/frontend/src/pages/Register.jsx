import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Copy, Wallet, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { copyToClipboard } from '../utils/format.js';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'captain',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secretShown, setSecretShown] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await register(form);
      setSecretShown({
        publicKey: result.user.stellarPublicKey,
        secretKey: result.user.stellarSecretKey,
      });
      toast.success('Account created! Save your wallet secret.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (secretShown) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Account Created!</h1>
            <p className="text-slate-400 text-sm mt-1">
              Save your Stellar wallet secret — you'll need it to sign transactions.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Public Key (your address)</label>
              <div className="flex gap-2">
                <code className="input flex-1 text-xs font-mono break-all">
                  {secretShown.publicKey}
                </code>
                <button
                  onClick={() => {
                    copyToClipboard(secretShown.publicKey);
                    toast.success('Copied!');
                  }}
                  className="btn-secondary"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="label text-amber-400">Secret Key (save this!)</label>
              <div className="flex gap-2">
                <code className="input flex-1 text-xs font-mono break-all bg-amber-900/10 border-amber-700/50">
                  {secretShown.secretKey}
                </code>
                <button
                  onClick={() => {
                    copyToClipboard(secretShown.secretKey);
                    toast.success('Secret copied!');
                  }}
                  className="btn-secondary"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-amber-300 mt-1">
                ⚠️ This is shown only once. For the demo, you can also find it in the seed output
                if you used the demo seed.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full mt-6"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center mb-3">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">
            We'll automatically create a Stellar wallet for you (testnet)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Juan Dela Cruz"
            />
          </div>
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
                minLength={6}
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
          <div>
            <label className="label">I am a…</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'player', label: '🏃 Player', desc: 'Join teams' },
                { value: 'captain', label: '👕 Captain', desc: 'Lead a team' },
                { value: 'admin', label: '👑 Admin', desc: 'Run a league' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`p-3 rounded-lg border text-left transition ${
                    form.role === opt.value
                      ? 'bg-stellar-500/20 border-stellar-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-stellar-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
