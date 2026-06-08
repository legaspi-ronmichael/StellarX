import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Users, Trophy, Calendar } from 'lucide-react';
import { leagueAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatXLM, sportEmoji, statusColor } from '../utils/format.js';

export default function Leagues() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ sport: '', status: '' });

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await leagueAPI.list(filter);
      setLeagues(data.leagues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Leagues</h1>
          <p className="text-slate-400 mt-1">Browse and join community sports leagues</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/leagues/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Create League
          </Link>
        )}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search leagues…"
              className="input pl-10"
              disabled
            />
          </div>
          <select
            className="input md:w-48"
            value={filter.sport}
            onChange={(e) => setFilter({ ...filter, sport: e.target.value })}
          >
            <option value="">All Sports</option>
            <option value="basketball">🏀 Basketball</option>
            <option value="volleyball">🏐 Volleyball</option>
          </select>
          <select
            className="input md:w-48"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="registration_open">Open for Registration</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-8">Loading leagues…</div>
      ) : leagues.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No leagues found.</p>
          {user?.role === 'admin' && (
            <Link to="/leagues/new" className="btn-primary inline-flex mt-4">
              Create the first league
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leagues.map((league) => (
            <Link
              key={league._id}
              to={`/leagues/${league._id}`}
              className="card-hover overflow-hidden group"
            >
              <div className={`h-24 bg-gradient-to-br ${league.bannerColor} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-4 text-4xl">
                  {sportEmoji(league.sport)}
                </div>
                <span
                  className={`absolute top-3 right-3 badge ${statusColor(league.status)}`}
                >
                  {league.status.replace('_', ' ')}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{league.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3 min-h-[40px]">
                  {league.description || 'A community sports league.'}
                </p>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {league.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{league.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    <span>
                      {league.teamsCount || 0} / {league.maxTeams} teams registered
                    </span>
                  </div>
                  {league.startsAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>Starts {new Date(league.startsAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Entry fee</div>
                    <div className="font-semibold text-stellar-300">
                      {formatXLM(league.registrationFee)} XLM
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-stellar-300">
                    View →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
