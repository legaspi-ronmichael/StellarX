import { ExternalLink, Copy, ArrowDownToLine, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  formatXLM,
  truncateKey,
  timeAgo,
  statusColor,
  stellarExpertUrl,
  copyToClipboard,
} from '../utils/format.js';

export default function TransactionRow({ entry, showLeague = true }) {
  const isDues = entry.kind === 'dues';
  const isPayout = entry.kind === 'payout';

  const handleCopy = () => {
    copyToClipboard(entry.txHash);
    toast.success('Transaction hash copied');
  };

  return (
    <div className="card p-4 hover:border-slate-700 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDues
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isDues ? <ArrowDownToLine className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {isDues ? 'Team Dues' : `${entry.place?.toUpperCase()} Place Prize`}
              </span>
              <span className={`badge ${statusColor(entry.status || 'confirmed')}`}>
                {entry.status}
              </span>
              {showLeague && entry.league && (
                <span className="text-xs text-slate-400">· {entry.league.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400 flex-wrap">
              {isDues ? (
                <>
                  <span>From</span>
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                    {truncateKey(entry.from)}
                  </code>
                  <span>→</span>
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                    {truncateKey(entry.to)}
                  </code>
                </>
              ) : (
                <>
                  <span>To</span>
                  <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                    {truncateKey(entry.to)}
                  </code>
                  {entry.toName && <span>· {entry.toName}</span>}
                </>
              )}
            </div>
            {entry.memo && (
              <div className="text-xs text-slate-500 mt-1 italic">memo: {entry.memo}</div>
            )}
            {entry.txHash && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <code className="text-slate-500 font-mono">
                  {truncateKey(entry.txHash, 10, 10)}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-slate-300"
                  title="Copy hash"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a
                  href={stellarExpertUrl(entry.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stellar-400 hover:text-stellar-300 inline-flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className={`text-lg font-bold ${
              isPayout ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isPayout ? '-' : '+'}
            {formatXLM(entry.amount)} XLM
          </div>
          <div className="text-xs text-slate-500">{timeAgo(entry.timestamp)}</div>
          {entry.ledger && (
            <div className="text-[10px] text-slate-600 mt-0.5">
              ledger #{entry.ledger}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
