import { useEffect, useState } from 'react';
import { Globe, Trophy, Users, Receipt, Search } from 'lucide-react';
import { publicAPI } from '../services/api.js';
import { formatXLM } from '../utils/format.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function PublicExplorer() {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicAPI.overview(), publicAPI.recentTransactions(), publicAPI.leagues()])
      .then(([o, r, l]) => {
        setOverview(o.data);
        setRecent(r.data.transactions || []);
        setLeagues(l.data.leagues || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-7 h-7 text-stellar-400" />
        <h1 className="text-3xl font-bold">Public Ledger Explorer</h1>
      </div>
      <p className="text-slate-400 mb-6">Transparent, real-time view of all league activity on Stellar</p>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Tile icon={<Trophy />} label="Active Leagues" value={overview.leaguesCount} />
          <Tile icon={<Users />} label="Teams" value={overview.teamsCount} />
          <Tile icon={<Receipt />} label="Dues Collected" value={`${formatXLM(overview.totalCollected)} XLM`} />
          <Tile icon={<Trophy />} label="Prizes Paid" value={`${formatXLM(overview.totalPaidOut)} XLM`} />
          <Tile icon={<Search />} label="Transactions" value={overview.paymentsCount + overview.payoutsCount} />
          <Tile icon={<Globe />} label="Net Pool" value={`${formatXLM(overview.netBalance)} XLM`} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-lg mb-3">Active Leagues</h2>
          {loading ? <div className="text-slate-500 text-sm">Loading…</div> : leagues.length === 0 ? (
            <div className="card p-6 text-center text-slate-400 text-sm">No active leagues</div>
          ) : (
            <div className="space-y-2">
              {leagues.slice(0, 6).map((l) => (
                <a key={l._id} href={`/leagues/${l._id}`} className="card-hover p-3 flex items-center gap-3 block">
                  <div className="text-2xl">{l.sport === 'basketball' ? '🏀' : '🏐'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.teamsCount || 0} teams · {formatXLM(l.registrationFee)} XLM</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-3">Latest On-Chain Activity</h2>
          {loading ? <div className="text-slate-500 text-sm">Loading…</div> : recent.length === 0 ? (
            <div className="card p-6 text-center text-slate-400 text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 10).map((t, i) => <TransactionRow key={t.txHash || i} entry={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ icon, label, value }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">{icon}<span>{label}</span></div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
