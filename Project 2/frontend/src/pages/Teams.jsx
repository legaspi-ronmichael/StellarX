import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Hash, Copy, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, truncateKey, statusColor, copyToClipboard } from '../utils/format.js';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await teamAPI.list({ captain: user._id });
      setTeams(data.teams || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function joinTeam() {
    if (!inviteCode.trim()) return toast.error('Enter an invite code');
    setJoining(true);
    try {
      await teamAPI.join(inviteCode.toUpperCase());
      toast.success('Joined team!');
      setInviteCode('');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setJoining(false); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-1">My Teams</h1>
      <p className="text-slate-400 mb-6">Teams where you are captain or player</p>

      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><Hash className="w-4 h-4" /> Join a team</h2>
        <p className="text-xs text-slate-400 mb-3">Got an invite code from a captain? Enter it here.</p>
        <div className="flex gap-2">
          <input type="text" className="input font-mono uppercase" placeholder="ABC123" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} maxLength={8} />
          <button onClick={joinTeam} disabled={joining} className="btn-primary whitespace-nowrap">
            {joining ? 'Joining…' : 'Join Team'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-8">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">You don't captain any teams yet.</p>
          <Link to="/leagues" className="btn-primary inline-flex mt-4">Browse Leagues</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => (
            <Link key={team._id} to={`/teams/${team._id}`} className="card-hover p-5 block">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {team.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{team.name}</div>
                  <div className="text-xs text-slate-400 truncate">{team.league?.name}</div>
                </div>
                <span className={`badge ${statusColor(team.paymentStatus)}`}>{team.paymentStatus}</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5"><Users className="w-3 h-3" />{team.players.length} players</div>
                <div className="flex items-center gap-1.5"><Hash className="w-3 h-3" /><code>{team.inviteCode}</code>
                  <button onClick={(e) => { e.preventDefault(); copyToClipboard(team.inviteCode); toast.success('Copied!'); }} className="text-slate-500 hover:text-white">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
