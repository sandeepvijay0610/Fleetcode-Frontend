import { Flame, Crown } from 'lucide-react';

export default function SquadRoster({ members = [] }) {
  if (members.length === 0) {
    return (
      <div className="hud-panel p-5 text-sm text-slate-text">
        No members on the roster yet.
      </div>
    );
  }

  const sorted = [...members].sort((a, b) => (b.score ?? b.points ?? 0) - (a.score ?? a.points ?? 0));

  return (
    <div className="hud-panel overflow-hidden p-0">
      <div className="border-b border-void-border p-4">
        <h3 className="text-base font-semibold text-slate-bright">Squad roster</h3>
        <p className="eyebrow mt-0.5">{members.length} operatives</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="eyebrow border-b border-void-border">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Callsign</th>
              <th className="px-4 py-2 font-medium">LeetCode</th>
              <th className="px-4 py-2 font-medium">Solved</th>
              <th className="px-4 py-2 font-medium">Streak</th>
              <th className="px-4 py-2 font-medium text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((member, index) => (
              <tr
                key={member.username ?? member.leetcode_username ?? index}
                className="border-b border-void-border/60 last:border-0 hover:bg-void-raised/60"
              >
                <td className="px-4 py-2.5 font-mono text-slate-text">
                  {index === 0 ? <Crown size={14} className="text-rankgold" /> : `${index + 1}`}
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-bright">{member.username ?? '—'}</td>
                <td className="px-4 py-2.5 font-mono text-slate-text">{member.leetcode_username ?? '—'}</td>
                <td className="px-4 py-2.5 font-mono">{member.solved ?? member.total_solved ?? 0}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1 font-mono text-signal">
                    <Flame size={13} />
                    {member.streak ?? 0}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-terminal">
                  {member.score ?? member.points ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
