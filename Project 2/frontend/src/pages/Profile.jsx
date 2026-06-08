import { useState } from 'react';
import { User, Copy, RefreshCw, Wallet, Trophy, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, truncateKey, roleColor, copyToClipboard, stellarExpertUrl, formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  async function refreshWallet() {
    setRefreshing(true);
    try {
      const { data } = await authAPI.refreshWallet();
      updateUser({ ...user, stellarPublicKey: data.stellarPublicKey, stellarSecretKey: data.stellarSecretKey });
      toast.success('New wallet generated! Friendbot funded.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center text-3xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="text-sm text-slate-400">{user.email}</div>
            <span className={`badge ${roleColor(user.role)} mt-1 inline-block`}>{user.role}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Stellar Public Key (your address)</label>
            <div className="flex gap-2">
              <code className="input flex-1 text-xs font-mono break-all">{user.stellarPublicKey}</code>
              <button onClick={() => { copyToClipboard(user.stellarPublicKey); toast.success('Copied'); }} className="btn-secondary"><Copy className="w-4 h-4" /></button>
              <a href={stellarExpertUrl(user.stellarPublicKey).replace('/tx/', '/account/')} target="_blank" rel="noopener noreferrer" className="btn-secondary">View</a>
            </div>
          </div>

          {user.stellarSecretKey && (
            <div>
              <label className="label text-amber-400">Secret Key (save this — for demo only)</label>
              <div className="flex gap-2">
                <code className="input flex-1 text-xs font-mono break-all bg-amber-900/10 border-amber-700/50">{user.stellarSecretKey}</code>
                <button onClick={() => { copyToClipboard(user.stellarSecretKey); toast.success('Copied'); }} className="btn-secondary"><Copy className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-amber-300 mt-1">⚠️ In production, use Freighter wallet instead. Never share this with anyone.</p>
            </div>
          )}

          <button onClick={refreshWallet} disabled={refreshing} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Generating…' : 'Generate New Wallet'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Wallet className="w-5 h-5" /> Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Member since</span><span>{formatDate(user.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="capitalize">{user.role}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">User ID</span><code className="text-xs">{truncateKey(user._id, 8, 8)}</code></div>
        </div>
      </div>
    </div>
  );
}
