import { useState } from 'react';
import { ShieldPlus, Users, AlertTriangle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function SquadOnboarding({ onSquadJoined }) {
  const { user, setSquadName } = useAuth();
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [squadInput, setSquadInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!squadInput.trim()) return;

    setLoading(true);
    setError('');
    try {
      if (mode === 'create') {
        await axiosClient.post('/squad/create', {
          username: user.username,
          squad_name: squadInput.trim(),
        });
      } else {
        await axiosClient.post('/squad/join', {
          username: user.username,
          squad_id: squadInput.trim(),
        });
      }
      setSquadName(squadInput.trim());
      onSquadJoined?.(squadInput.trim());
    } catch (err) {
      setError(err.response?.data?.detail || `Could not ${mode} that squad. Try a different name.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-panel mx-auto max-w-md p-6 text-center animate-rise">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-signal/40 bg-void">
        <Users size={22} className="text-signal" />
      </div>
      <h2 className="text-lg font-semibold text-slate-bright">No squad on your radar yet</h2>
      <p className="mt-1 text-sm text-slate-text">
        Create a new squad or join one your friends already started.
      </p>

      <div className="mx-auto mt-5 flex w-fit rounded-md border border-void-border p-1">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`rounded px-3 py-1.5 text-sm transition-colors ${
            mode === 'create' ? 'bg-signal text-void font-semibold' : 'text-slate-text hover:text-slate-bright'
          }`}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`rounded px-3 py-1.5 text-sm transition-colors ${
            mode === 'join' ? 'bg-signal text-void font-semibold' : 'text-slate-text hover:text-slate-bright'
          }`}
        >
          Join
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 text-left">
        <label className="eyebrow" htmlFor="squad-input">
          {mode === 'create' ? 'Squad name' : 'Squad ID (name)'}
        </label>
        <input
          id="squad-input"
          type="text"
          required
          value={squadInput}
          onChange={(e) => setSquadInput(e.target.value)}
          placeholder={mode === 'create' ? 'e.g. Byte Battalion' : 'exact squad name'}
          className="rounded-md border border-void-border bg-void px-3 py-2 font-mono text-sm text-slate-bright focus:border-signal/60"
        />

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-signal/40 bg-signal/5 p-2.5 text-xs text-signal-glow">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-signal-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldPlus size={16} />
          {loading ? 'Working…' : mode === 'create' ? 'Create squad' : 'Join squad'}
        </button>
      </form>
    </div>
  );
}
