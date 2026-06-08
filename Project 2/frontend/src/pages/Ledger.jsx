import { useEffect, useState } from 'react';
import { Receipt, Filter } from 'lucide-react';
import { ledgerAPI } from '../services/api.js';
import { formatXLM } from '../utils/format.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState({ type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        ledgerAPI.list({ ...filter, limit: 200 }),
        ledgerAPI.summary(),
      ]);
      setEntries(l.data.entries || []);
      setSummary(s.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Receipt className="w-7 h-7 text-stellar-400" />
        <h1 className="text-3xl font-bold">My Ledger</h1>
      </div>
      <p className="text-slate-400 mb-6">Your complete on-chain transaction history</p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Tile label="Total Paid" value={`${formatXLM(summary.totalCollected)} XLM`} color="emerald" />
          <Tile label="Total Received" value={`${formatXLM(summary.totalPaidOut)} XLM`} color="amber" />
          <Tile label="Net" value={`${formatXLM(summary.netBalance)} XLM`} color="stellar" />
          <Tile label="Transactions" value={summary.paymentCount + summary.payoutCount} color="slate" />
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filter:</span>
          {[
            { value: '', label: 'All' },
            { value: 'dues', label: '💸 Dues' },
            { value: 'payouts', label: '🏆 Payouts' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter({ type: opt.value })}
              className={`px-3 py-1 rounded text-sm ${filter.type === opt.value ? 'bg-stellar-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-8">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => <TransactionRow key={e.id || e.txHash || i} entry={e} />)}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, color }) {
  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-300',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-300',
    stellar: 'from-stellar-500/20 to-purple-500/10 text-stellar-300',
    slate: 'from-slate-500/20 to-slate-600/10 text-slate-300',
  };
  return (
    <div className={`card p-4 bg-gradient-to-br ${colors[color]}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
