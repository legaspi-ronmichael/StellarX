import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Trophy, Calendar, Copy, ExternalLink, Crown, Plus, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { leagueAPI, teamAPI, paymentAPI, payoutAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, truncateKey, sportEmoji, statusColor, copyToClipboard, stellarExpertUrl } from '../utils/format.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function LeagueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [payingTeam, setPayingTeam] = useState(null);
  const [winners, setWinners] = useState({ first: '', second: '', third: '' });
  const [declaring, setDeclaring] = useState(false);

  useEffect(() => { load(); loadPayouts(); }, [id]);

  async function load() {
    setLoading(true);
    try { setData((await leagueAPI.get(id)).data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  async function loadPayouts() {
    try { setPayouts((await payoutAPI.list({ league: id })).data.payouts || []); } catch {}
  }

  async function registerTeam() {
    if (!newTeamName.trim()) return toast.error('Team name required');
    setRegistering(true);
    try {
      const { data: t } = await teamAPI.create({ name: newTeamName, league: id });
      toast.success(`Team created! ${truncateKey(t.team.walletPublicKey)}`);
      if (t.teamSecretKey) console.log('Team secret:', t.teamSecretKey);
      setNewTeamName('');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setRegistering(false); }
  }

  async function payDues(team) {
    setPayingTeam(team._id);
    try {
      const { data } = await paymentAPI.payDues(team._id);
      toast.success(`Dues paid! ${truncateKey(data.txHash)}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Payment failed'); }
    finally { setPayingTeam(null); }
  }

  async function executePayout(p) {
    try {
      await payoutAPI.execute(p._id);
      toast.success('Payout sent!');
      loadPayouts(); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  }

  async function declareWinners() {
    if (!winners.first) return toast.error('1st place required');
    setDeclaring(true);
    try {
      const { data } = await leagueAPI.declareWinners(id, winners);
      toast.success(`Winners declared! Pool: ${formatXLM(data.prizePool)} XLM`);
      setWinners({ first: '', second: '', third: '' });
      loadPayouts(); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setDeclaring(false); }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Loading…</div>;
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">Not found</div>;

  const { league, teams, payments, stats } = data;
  const isAdmin = user?.role === 'admin' && league.createdBy?._id === user?._id;
  const myTeam = teams.find((t) => t.captain?._id === user?._id);
  const paidTeams = teams.filter((t) => t.paymentStatus === 'paid');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className={`rounded-2xl bg-gradient-to-br ${league.bannerColor} p-8 mb-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="text-5xl">{sportEmoji(league.sport)}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{league.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`badge ${statusColor(league.status)}`}>{league.status.replace('_', ' ')}</span>
                <span className="text-white/80 text-sm">Season {league.season}</span>
              </div>
            </div>
          </div>
          {league.description && <p className="text-white/90 max-w-2xl mt-3">{league.description}</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/90">
            {league.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{league.location}</div>}
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{teams.length}/{league.maxTeams} teams</div>
            {league.startsAt && <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(league.startsAt).toLocaleDateString()}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Dues" value={`${formatXLM(stats.totalCollected)} XLM`} />
        <StatTile label="Prize Pool" value={`${formatXLM(stats.prizePool)} XLM`} />
        <StatTile label="Paid Teams" value={`${stats.teamsPaid}/${teams.length}`} />
        <StatTile label="Treasury" value={truncateKey(league.treasuryPublicKey, 5, 5)} small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-3">Registered Teams</h2>
            {teams.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">No teams yet.</p> : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team._id} className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center font-bold">{team.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/teams/${team._id}`} className="font-medium hover:text-stellar-300">{team.name}</Link>
                      <div className="text-xs text-slate-400">Captain: {team.captain?.name}</div>
                    </div>
                    <span className={`badge ${statusColor(team.paymentStatus)}`}>{team.paymentStatus}</span>
                    {team.paymentStatus !== 'paid' && myTeam?._id === team._id && (
                      <button onClick={() => payDues(team)} disabled={payingTeam === team._id} className="btn-success text-sm">
                        {payingTeam === team._id ? 'Paying…' : `Pay ${formatXLM(league.registrationFee)} XLM`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {user && !myTeam && league.status === 'registration_open' && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <input type="text" className="input" placeholder="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                <button onClick={registerTeam} disabled={registering} className="btn-primary whitespace-nowrap">
                  <Plus className="w-4 h-4" /> {registering ? 'Creating…' : 'Register'}
                </button>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-3">Prize Distribution</h2>
            <div className="space-y-2">
              {[
                { place: '1st', pct: league.prizeDistribution.first, color: 'from-amber-400 to-yellow-500' },
                { place: '2nd', pct: league.prizeDistribution.second, color: 'from-slate-300 to-slate-400' },
                { place: '3rd', pct: league.prizeDistribution.third, color: 'from-orange-400 to-amber-600' },
              ].map((p) => (
                <div key={p.place} className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{p.place} Place</span>
                      <span className="font-mono">{p.pct}% · {formatXLM((stats.prizePool * p.pct) / 100)} XLM</span>
                    </div>
                    <div className="h-2 rounded bg-slate-800 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${p.color}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-3">Recent Transactions</h2>
            {payments.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">No payments yet.</p> : (
              <div className="space-y-2">
                {payments.slice(0, 5).map((p) => (
                  <TransactionRow key={p._id} entry={{ kind: 'dues', from: p.payerPublicKey, to: p.recipientPublicKey, amount: p.amount, txHash: p.txHash, ledger: p.ledger, timestamp: p.blockchainTimestamp, memo: p.memo, status: p.status }} showLeague={false} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-3">Treasury</h2>
            <p className="text-xs text-slate-400 mb-2">Multi-sig (2-of-3 signers required)</p>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Treasury Address</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-stellar-300 break-all flex-1">{league.treasuryPublicKey}</code>
                <button onClick={() => { copyToClipboard(league.treasuryPublicKey); toast.success('Copied'); }} className="text-slate-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                <a href={stellarExpertUrl(league.treasuryPublicKey).replace('/tx/', '/account/')} target="_blank" rel="noopener noreferrer" className="text-stellar-400"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </div>
          </div>

          {isAdmin && league.status !== 'completed' && paidTeams.length >= 3 && (
            <div className="card p-5 border-amber-700/50">
              <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-400" /> Declare Winners</h2>
              <p className="text-xs text-slate-400 mb-3">Triggers automated prize payouts from the treasury.</p>
              <div className="space-y-2">
                <select className="input" value={winners.first} onChange={(e) => setWinners({ ...winners, first: e.target.value })}>
                  <option value="">🥇 1st place…</option>
                  {paidTeams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <select className="input" value={winners.second} onChange={(e) => setWinners({ ...winners, second: e.target.value })}>
                  <option value="">🥈 2nd place (optional)…</option>
                  {paidTeams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <select className="input" value={winners.third} onChange={(e) => setWinners({ ...winners, third: e.target.value })}>
                  <option value="">🥉 3rd place (optional)…</option>
                  {paidTeams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <button onClick={declareWinners} disabled={declaring} className="btn-primary w-full">
                  <Trophy className="w-4 h-4" /> {declaring ? 'Declaring…' : 'Declare & Queue Payouts'}
                </button>
              </div>
            </div>
          )}

          {isAdmin && payouts.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-lg mb-3">Prize Payouts</h2>
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div key={p._id} className="p-3 rounded-lg bg-slate-800/50 flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.place.toUpperCase()} · {p.recipientName}</div>
                      <div className="text-xs text-slate-400">{formatXLM(p.amount)} XLM · {p.status}</div>
                    </div>
                    {p.status === 'pending' && <button onClick={() => executePayout(p)} className="btn-success text-xs"><Send className="w-3 h-3" /> Execute</button>}
                    {p.status === 'confirmed' && p.txHash && <a href={stellarExpertUrl(p.txHash)} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline">✓ Sent</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, small }) {
  return (
    <div className="card p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-semibold ${small ? 'text-xs' : 'text-lg'} text-white truncate`}>{value}</div>
    </div>
  );
}
