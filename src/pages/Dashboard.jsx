import { useEffect, useState, useCallback } from 'react';
import { Trophy, Users, Zap, RefreshCcw, DoorOpen, AlertTriangle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import SquadRoster from '../components/SquadRoster';
import ActivityFeed from '../components/ActivityFeed';
import SquadOnboarding from '../components/SquadOnboarding';
import RadarLoader from '../components/RadarLoader';
import TopicPieChart from '../components/TopicPieChart';

// The dashboard payload shape isn't pinned down by the spec, so this reads
// from whichever key the backend used rather than assuming one exact shape.
function normalizeDashboard(raw) {
  if (!raw) return null;
  const stats = raw.stats ?? raw.squad_stats ?? raw;
  return {
    squadName: raw.squadName ?? raw.squad_name ?? stats.squad_name ?? null,
    score: stats.total_score ?? stats.score ?? stats.squad_score ?? 0,
    rank: stats.rank ?? raw.rank ?? '—',
    memberCount: raw.roster?.length ?? raw.members?.length ?? stats.member_count ?? 0,
    problemsSolved: stats.total_solved ?? stats.problems_solved ?? 0,
    roster: raw.roster ?? raw.members ?? [],
    activities: raw.recent_activities ?? raw.activities ?? raw.recentActivity ?? [],
  };
}

export default function Dashboard() {
  const { user, setSquadName } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const loadDashboard = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError('');
    try {
      const { data: raw } = await axiosClient.get(`/dashboard/${encodeURIComponent(user.username)}`);
      const normalized = normalizeDashboard(raw);
      setData(normalized);
      if (normalized?.squadName) setSquadName(normalized.squadName);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load your squad dashboard.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user.username, setSquadName]);

  useEffect(() => {
    loadDashboard(false);
    
    // Auto-sync every 8 seconds to match backend poller frequency
    const intervalId = setInterval(() => {
      loadDashboard(true);
    }, 8000);

    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await axiosClient.get('/squad/force-sync');
      await loadDashboard(true);
    } catch {
      setError('Force sync failed — the LeetCode poll may be rate-limited. Try again shortly.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!window.confirm('Leave your current squad? You can rejoin or create a new one anytime.')) return;
    setLeaving(true);
    try {
      await axiosClient.post('/squad/leave', { username: user.username });
      setSquadName(null);
      setData((prev) => (prev ? { ...prev, squadName: null, roster: [], activities: [] } : prev));
    } catch {
      setError('Could not leave the squad. Try again.');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RadarLoader label="Pulling squad telemetry…" size={64} />
      </div>
    );
  }

  const hasSquad = Boolean(data?.squadName ?? user?.squadName);
  const currentUserRoster = data?.roster?.find(m => m.username === user.username || m.fleetCodeId === user.username);

  return (
    <div className="mx-auto max-w-[1600px] w-full px-4 py-8 sm:px-6 xl:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">mission control</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-bright">
            Welcome back, <span className="text-signal">{user.username}</span>
          </h1>
        </div>

        {hasSquad && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-md border border-void-border px-3 py-2 text-sm text-slate-text transition-colors hover:border-terminal/50 hover:text-terminal disabled:opacity-60"
            >
              <RefreshCcw size={15} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Force sync'}
            </button>
            <button
              onClick={handleLeaveSquad}
              disabled={leaving}
              className="flex items-center gap-2 rounded-md border border-void-border px-3 py-2 text-sm text-slate-text transition-colors hover:border-signal/50 hover:text-signal disabled:opacity-60"
            >
              <DoorOpen size={15} />
              {leaving ? 'Leaving…' : 'Leave squad'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-signal/40 bg-signal/5 p-3 text-sm text-signal-glow">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!hasSquad ? (
        <SquadOnboarding onSquadJoined={loadDashboard} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Squad" value={data.squadName} icon={Users} accent="signal" />
            <StatCard label="Squad score" value={data.score} icon={Zap} accent="terminal" />
            <StatCard label="Global rank" value={`#${data.rank}`} icon={Trophy} accent="gold" />
            <StatCard label="Problems solved" value={data.problemsSolved} icon={Zap} accent="terminal" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 flex flex-col gap-6">
              <SquadRoster members={data.roster} />
              <TopicPieChart roster={data.roster} />
            </div>
            <div className="lg:col-span-2">
              <ActivityFeed activities={data.activities} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
