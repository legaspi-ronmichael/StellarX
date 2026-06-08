import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy, ShieldCheck, Zap, Globe, ArrowRight, Users, Receipt, Lock } from 'lucide-react';
import { publicAPI } from '../services/api.js';
import { formatXLM, sportEmoji, timeAgo, truncateKey, stellarExpertUrl } from '../utils/format.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicAPI.overview(), publicAPI.recentTransactions()])
      .then(([o, r]) => {
        setStats(o.data);
        setRecent(r.data.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stellar-500/20 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,98,245,0.15),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-sm text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live on Stellar Testnet
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transparent league dues,{' '}
              <span className="gradient-text">automated payouts</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8">
              The community sports league treasury, run on the Stellar blockchain.
              Every payment visible, every prize distributed fairly and on-chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary text-lg px-6 py-3">
                Start a League <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/leagues" className="btn-secondary text-lg px-6 py-3">
                Browse Leagues
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Trophy />}
              label="Active Leagues"
              value={stats?.leaguesCount ?? '—'}
            />
            <StatCard
              icon={<Users />}
              label="Teams Registered"
              value={stats?.teamsCount ?? '—'}
            />
            <StatCard
              icon={<Receipt />}
              label="Dues Collected"
              value={`${formatXLM(stats?.totalCollected ?? 0)} XLM`}
            />
            <StatCard
              icon={<Trophy />}
              label="Prizes Paid"
              value={`${formatXLM(stats?.totalPaidOut ?? 0)} XLM`}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Why Stellar League?</h2>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          Stop tracking cash in envelopes. Move your community league finances on-chain for full
          transparency and trust.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Transparent Dues"
            description="Every team registration fee is recorded on the Stellar public ledger. Anyone can verify contributions in real-time."
          />
          <Feature
            icon={<Zap className="w-6 h-6" />}
            title="Automated Payouts"
            description="Prize pool is held in a multi-signature treasury. Winners are paid automatically once the admin declares the results."
          />
          <Feature
            icon={<Lock className="w-6 h-6" />}
            title="Multi-Sig Security"
            description="2-of-3 multi-signature treasury means no single person can run off with the prize pool. Trust by design."
          />
          <Feature
            icon={<Globe className="w-6 h-6" />}
            title="Public Audit Trail"
            description="Complete on-chain history. Every transaction is verifiable through Stellar Expert or Stellar Laboratory."
          />
          <Feature
            icon={<Receipt className="w-6 h-6" />}
            title="No More Mismanagement"
            description="Smart contracts (via multi-sig transactions) ensure the prize pool is distributed exactly as agreed, when agreed."
          />
          <Feature
            icon={<Trophy className="w-6 h-6" />}
            title="Built for Communities"
            description="Designed for basketball and volleyball leagues. Easy team registration, invite codes, and player management."
          />
        </div>
      </section>

      {/* Recent transactions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Live On-Chain Activity</h2>
          <Link to="/explorer" className="text-stellar-400 hover:text-stellar-300 text-sm">
            View full ledger →
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-slate-500 py-8">Loading live transactions…</div>
        ) : recent.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">
            No transactions yet. Run <code className="text-stellar-400">npm run seed</code> in the
            backend to generate demo data.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.slice(0, 5).map((t, i) => (
              <TransactionRow key={t.txHash || i} entry={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-5 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-stellar-500/20 text-stellar-300 mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="card-hover p-6">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stellar-500/30 to-purple-500/30 flex items-center justify-center text-stellar-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
