import { useEffect, useState, useCallback } from 'react';
import { Trophy, Crown, Users, AlertTriangle, RotateCw } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import RadarLoader from '../components/RadarLoader';

const RANK_STYLES = [
  { border: 'border-rankgold/60', text: 'text-rankgold', glow: 'shadow-[0_0_24px_-6px_rgba(255,200,87,0.5)]' },
  { border: 'border-slate-text/50', text: 'text-slate-bright', glow: '' },
  { border: 'border-signal/50', text: 'text-signal', glow: '' },
];

function normalizeSquad(entry, index) {
  return {
    rank: entry.rank ?? index + 1,
    name: entry.squad_name ?? entry.squadName ?? entry.name ?? 'Unnamed squad',
    score: entry.score ?? entry.total_score ?? 0,
    members: entry.member_count ?? entry.members ?? entry.roster?.length ?? null,
  };
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/leaderboard/');
      const list = Array.isArray(data) ? data : data.leaderboard ?? data.squads ?? [];
      setSquads(list.map(normalizeSquad));
    } catch {
      setError('Could not load the leaderboard. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="mx-auto max-w-[1600px] w-full px-4 py-8 sm:px-6 xl:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">global standings</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-bright">
            <Trophy size={22} className="text-rankgold" /> Leaderboard
          </h1>
        </div>
        <button
          onClick={loadLeaderboard}
          className="flex items-center gap-2 rounded-md border border-void-border px-3 py-2 text-sm text-slate-text transition-colors hover:border-terminal/50 hover:text-terminal"
        >
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-signal/40 bg-signal/5 p-3 text-sm text-signal-glow">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <RadarLoader label="Pulling squad rankings…" size={64} />
        </div>
      ) : squads.length === 0 ? (
        <div className="hud-panel p-6 text-center text-sm text-slate-text">
          No squads have logged a score yet. Be the first on the radar.
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {squads.map((squad) => {
            const style = RANK_STYLES[squad.rank - 1] ?? { border: 'border-void-border', text: 'text-slate-bright', glow: '' };
            const isMine = squad.name === user?.squadName;
            return (
              <li
                key={`${squad.rank}-${squad.name}`}
                className={`hud-panel flex items-center gap-4 p-4 ${style.glow} ${isMine ? 'ring-1 ring-terminal/50' : ''}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-semibold ${style.border} ${style.text}`}>
                  {squad.rank === 1 ? <Crown size={16} /> : squad.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-bright">
                    {squad.name}
                    {isMine && <span className="ml-2 text-xs font-mono text-terminal">(your squad)</span>}
                  </p>
                  {squad.members !== null && (
                    <p className="flex items-center gap-1 text-xs text-slate-text">
                      <Users size={11} /> {squad.members} members
                    </p>
                  )}
                </div>
                <div className="font-mono text-lg font-semibold text-terminal">{squad.score}</div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
