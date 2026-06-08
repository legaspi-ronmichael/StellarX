import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trophy, ArrowLeft } from 'lucide-react';
import { leagueAPI } from '../services/api.js';

export default function LeagueCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sport: 'basketball',
    description: '',
    location: '',
    registrationFee: 50,
    maxTeams: 8,
    minPlayersPerTeam: 5,
    maxPlayersPerTeam: 12,
    prizeFirst: 60,
    prizeSecond: 30,
    prizeThird: 10,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        sport: form.sport,
        description: form.description,
        location: form.location,
        registrationFee: parseFloat(form.registrationFee),
        maxTeams: parseInt(form.maxTeams),
        minPlayersPerTeam: parseInt(form.minPlayersPerTeam),
        maxPlayersPerTeam: parseInt(form.maxPlayersPerTeam),
        prizeDistribution: {
          first: parseFloat(form.prizeFirst),
          second: parseFloat(form.prizeSecond),
          third: parseFloat(form.prizeThird),
        },
        status: 'registration_open',
      };
      const { data } = await leagueAPI.create(payload);
      toast.success('League created! Multi-sig treasury deployed.');
      navigate(`/leagues/${data.league._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create league');
    } finally {
      setSubmitting(false);
    }
  };

  const prizeTotal = parseFloat(form.prizeFirst || 0) + parseFloat(form.prizeSecond || 0) + parseFloat(form.prizeThird || 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create a League</h1>
            <p className="text-slate-400 text-sm">A multi-sig treasury will be deployed automatically</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="label">League Name *</label>
            <input type="text" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Manila Community Basketball 2026" />
          </div>

          <div>
            <label className="label">Sport *</label>
            <div className="grid grid-cols-2 gap-2">
              {['basketball', 'volleyball'].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, sport: s })} className={`p-3 rounded-lg border capitalize ${form.sport === s ? 'bg-stellar-500/20 border-stellar-500' : 'bg-slate-800 border-slate-700'}`}>
                  {s === 'basketball' ? '🏀' : '🏐'} {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's this league about?" />
          </div>

          <div>
            <label className="label">Location</label>
            <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Rizal Memorial Sports Complex" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Entry Fee (XLM) *</label>
              <input type="number" min="0" step="0.1" required className="input" value={form.registrationFee} onChange={(e) => setForm({ ...form, registrationFee: e.target.value })} />
            </div>
            <div>
              <label className="label">Max Teams</label>
              <input type="number" min="2" max="64" className="input" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: e.target.value })} />
            </div>
            <div>
              <label className="label">Min Players/Team</label>
              <input type="number" min="1" className="input" value={form.minPlayersPerTeam} onChange={(e) => setForm({ ...form, minPlayersPerTeam: e.target.value })} />
            </div>
            <div>
              <label className="label">Max Players/Team</label>
              <input type="number" min="1" className="input" value={form.maxPlayersPerTeam} onChange={(e) => setForm({ ...form, maxPlayersPerTeam: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Prize Distribution (%) {prizeTotal !== 100 && <span className="text-amber-400">· Must sum to 100</span>}</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-slate-500 mb-1">🥇 1st</div>
                <input type="number" min="0" max="100" className="input" value={form.prizeFirst} onChange={(e) => setForm({ ...form, prizeFirst: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">🥈 2nd</div>
                <input type="number" min="0" max="100" className="input" value={form.prizeSecond} onChange={(e) => setForm({ ...form, prizeSecond: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">🥉 3rd</div>
                <input type="number" min="0" max="100" className="input" value={form.prizeThird} onChange={(e) => setForm({ ...form, prizeThird: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-3 bg-amber-900/10 border-amber-700/50 text-xs text-amber-200">
            ⚠️ A new Stellar multi-sig account (2-of-3 signers) will be created and funded via Friendbot.
            The treasury keys will be saved to your <code>backend/.env</code> file.
          </div>

          <button type="submit" disabled={submitting || prizeTotal !== 100} className="btn-primary w-full">
            {submitting ? 'Creating League…' : 'Create League & Deploy Treasury'}
          </button>
        </form>
      </div>
    </div>
  );
}
