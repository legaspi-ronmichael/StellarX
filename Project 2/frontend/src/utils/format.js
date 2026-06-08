// Utility helpers

export function formatXLM(amount, decimals = 4) {
  if (amount === null || amount === undefined) return '0';
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

export function truncateKey(key, start = 6, end = 6) {
  if (!key) return '';
  if (key.length <= start + end) return key;
  return `${key.slice(0, start)}…${key.slice(-end)}`;
}

export function timeAgo(date) {
  if (!date) return '';
  const d = new Date(date);
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function stellarExpertUrl(txHash, network = 'testnet') {
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

export function stellarLaboratoryUrl(txHash) {
  return `https://laboratory.stellar.org/#/tx?$=network$id=testnet&endpoint=tx&txHash=${txHash}`;
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function sportEmoji(sport) {
  if (sport === 'basketball') return '🏀';
  if (sport === 'volleyball') return '🏐';
  return '🏆';
}

export function statusColor(status) {
  const map = {
    draft: 'bg-slate-700 text-slate-200',
    registration_open: 'bg-emerald-700 text-emerald-100',
    in_progress: 'bg-blue-700 text-blue-100',
    completed: 'bg-purple-700 text-purple-100',
    cancelled: 'bg-red-700 text-red-100',
    paid: 'bg-emerald-700 text-emerald-100',
    unpaid: 'bg-yellow-700 text-yellow-100',
    pending: 'bg-yellow-700 text-yellow-100',
    confirmed: 'bg-emerald-700 text-emerald-100',
    failed: 'bg-red-700 text-red-100',
    processing: 'bg-blue-700 text-blue-100',
    refunded: 'bg-slate-700 text-slate-200',
    scheduled: 'bg-blue-700 text-blue-100',
  };
  return map[status] || 'bg-slate-700 text-slate-200';
}

export function roleColor(role) {
  const map = {
    admin: 'bg-purple-700 text-purple-100',
    captain: 'bg-blue-700 text-blue-100',
    player: 'bg-slate-700 text-slate-100',
  };
  return map[role] || 'bg-slate-700 text-slate-100';
}
