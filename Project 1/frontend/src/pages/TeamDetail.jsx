import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Copy, Wallet, Trophy, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, truncateKey, statusColor, copyToClipboard, stellarExpertUrl } from '../utils/format.js';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    try { setTeam((await teamAPI.get(id)).data.team); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="text-center text-slate-500 py-12">Loading…</div>;
  if (!team) return <div className="text-center text-slate-500 py-12">Not found</div>;

  const isCaptain = team.captain?._id === user?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
            {team.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <Link to={`/leagues/${team.league?._id}`} className="text-sm text-stellar-400 hover:text-stellar-300">
              {team.league?.name}
            </Link>
          </div>
          <span className={`badge ${statusColor(team.paymentStatus)}`}>{team.paymentStatus}</span>
        </div>

        {team.paymentStatus === 'paid' && (
          <div className="card p-3 bg-emerald-900/10 border-emerald-700/50 mb-4">
            <div className="text-xs text-slate-400">Dues paid</div>
            <div className="font-mono text-emerald-300">{formatXLM(team.paidAmount)} XLM</div>
            {team.paymentTxHash && (
              <a href={stellarExpertUrl(team.paymentTxHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-stellar-400 hover:underline block mt-1">
                View transaction →
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 bg-slate-800/30">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Invite Code</div>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono">{team.inviteCode}</code>
              <button onClick={() => { copyToClipboard(team.inviteCode); toast.success('Copied!'); }} className="text-slate-400 hover:text-white">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Share this with players to join</p>
          </div>

          <div className="card p-4 bg-slate-800/30">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Team Wallet</div>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-stellar-300 break-all flex-1">{team.walletPublicKey}</code>
              <a href={stellarExpertUrl(team.walletPublicKey).replace('/tx/', '/account/')} target="_blank" rel="noopener noreferrer" className="text-stellar-400 hover:text-stellar-300 text-xs">
                View
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-1">Receives prize payouts if you win</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Roster ({team.players.length})</h2>
          <div className="space-y-2">
            {team.players.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                  {p.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{p.name}</div>
                  {p.position && <div className="text-xs text-slate-400">{p.position}</div>}
                </div>
                {i === 0 && <span className="badge bg-amber-700 text-amber-100 text-xs">👑 Captain</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
