import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-10 h-10 text-stellar-400 animate-spin" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
