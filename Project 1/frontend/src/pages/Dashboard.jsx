import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Wallet as WalletIcon,
  Plus,
  Receipt,
  ArrowUpRight,
  Calendar,
  Target,
} from 'lucide-react';
import { leagueAPI, teamAPI, ledgerAPI, payoutAPI, paymentAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, timeAgo, sportEmoji, statusColor, truncateKey } from '../utils/format.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [myLeagues, setMyLeagues] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const promises = [
        leagueAPI.list(),
        teamAPI.list({ captain: user._id }),
        ledgerAPI.summary(),
        ledgerAPI.list({ limit: 5 }),
      ];
      if (user.role === 'admin') {
        promises.push(payoutAPI.list({ status: 'pending' }));
      }
      const [l, t, s, r, p] = await Promise.all(promises);
      setMyLeagues(l.data.leagues || []);
      setMyTeams(t.data.teams || []);
      setSummary(s.data);
      setRecent(r.data.entries || []);
      if (p) setPendingPayouts(p.data.payouts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 mt-1">
          Here's what's happening with your leagues and teams.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={<Trophy className="w-5 h-5" />}
          label="My Leagues"
          value={myLeagues.length}
          color="from-orange-500 to-red-500"
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="My Teams"
          value={myTeams.length}
          color="from-blue-500 to-cyan-500"
        />
        <SummaryCard
          icon={<Receipt className="w-5 h-5" />}
          label={user.role === 'admin' ? 'Collected' : 'Paid'}
          value={`${formatXLM(summary?.totalCollected || 0)} XLM`}
          color="from-emerald-500 to-green-500"
        />
        <SummaryCard
          icon={<Trophy className="w-5 h-5" />}
          label="Received"
          value={`${formatXLM(summary?.totalPaidOut || 0)} XLM`}
          color="from-amber-500 to-yellow-500"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {user.role === 'admin' && (
          <Link to="/leagues/new" className="card-hover p-5 flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-lg bg-stellar-500/20 flex items-center justify-center text-stellar-300 group-hover:bg-stellar-500/30">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">Create League</div>
              <div className="text-sm text-slate-400">Start a new basketball/volleyball league</div>
            </div>
            <ArrowUpRight className="ml-auto text-slate-500 group-hover:text-stellar-300" />
          </Link>
        )}
        <Link to="/leagues" className="card-hover p-5 flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/30">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold">Browse Leagues</div>
            <div className="text-sm text-slate-400">Register your team in active leagues</div>
          </div>
          <ArrowUpRight className="ml-auto text-slate-500 group-hover:text-emerald-300" />
        </Link>
        <Link to="/ledger" className="card-hover p-5 flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/30">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold">My Ledger</div>
            <div className="text-sm text-slate-400">View all transactions</div>
          </div>
          <ArrowUpRight className="ml-auto text-slate-500 group-hover:text-purple-300" />
        </Link>
      </div>

      {/* Pending payouts (admin only) */}
      {user.role === 'admin' && pendingPayouts.length > 0 && (
        <div className="mb-8 card p-5 border-amber-700/50 bg-amber-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold">Pending Prize Payouts</h2>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            {pendingPayouts.length} payout{pendingPayouts.length > 1 ? 's' : ''} waiting to be executed.
          </p>
          <Link to="/dashboard" className="btn-primary text-sm">
            Review & Execute
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Leagues */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">My Leagues</h2>
            <Link to="/leagues" className="text-sm text-stellar-400 hover:text-stellar-300">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : myLeagues.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              No leagues yet. {user.role === 'admin' && <Link to="/leagues/new" className="text-stellar-400">Create one</Link>}
            </div>
          ) : (
            <div className="space-y-2">
              {myLeagues.slice(0, 5).map((league) => (
                <Link
                  key={league._id}
                  to={`/leagues/${league._id}`}
                  className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{sportEmoji(league.sport)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{league.name}</div>
                      <div className="text-xs text-slate-400">
                        {league.teamsCount || 0} teams · {formatXLM(league.registrationFee)} XLM/team
                      </div>
                    </div>
                    <span className={`badge ${statusColor(league.status)}`}>
                      {league.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Teams */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">My Teams</h2>
            <Link to="/teams" className="text-sm text-stellar-400 hover:text-stellar-300">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : myTeams.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              You haven't registered any teams yet.
            </div>
          ) : (
            <div className="space-y-2">
              {myTeams.slice(0, 5).map((team) => (
                <Link
                  key={team._id}
                  to={`/teams/${team._id}`}
                  className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center font-bold">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{team.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {team.league?.name}
                      </div>
                    </div>
                    <span className={`badge ${statusColor(team.paymentStatus)}`}>
                      {team.paymentStatus}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Activity</h2>
            <Link to="/ledger" className="text-sm text-stellar-400 hover:text-stellar-300">
              Full ledger →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No transactions yet.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((entry, i) => (
                <TransactionRow key={entry.id || entry.txHash || i} entry={entry} showLeague />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
