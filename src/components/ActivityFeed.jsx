import { useState } from 'react';
import { Activity, CheckCircle2, Code } from 'lucide-react';

const difficultyColor = {
  easy: 'text-terminal border-terminal/30',
  medium: 'text-rankgold border-rankgold/30',
  hard: 'text-signal border-signal/30',
};

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ActivityFeed({ activities = [] }) {
  const [expandedCode, setExpandedCode] = useState(null);

  const toggleCode = (id) => {
    setExpandedCode((prev) => (prev === id ? null : id));
  };

  return (
    <div className="hud-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-bright">Recent activity</h3>
        <Activity size={16} className="text-slate-text" />
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-text">No submissions logged yet — go solve something.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <ul className="flex flex-col gap-4">
            {activities.map((activity, index) => {
              const difficulty = (activity.difficulty ?? '').toLowerCase();
              const activityId = activity.id ?? index;
              const isExpanded = expandedCode === activityId;

            return (
               <li key={activityId} className="flex flex-col gap-2 border-b border-void-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-terminal" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-bright">
                      <span className="font-medium">{activity.username ?? activity.member ?? 'someone'}</span>{' '}
                      solved{' '}
                      <span className="font-mono text-signal">
                        {activity.problemName ?? activity.problem ?? activity.problem_title ?? activity.title ?? 'a problem'}
                      </span>
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-text">
                        {difficulty && (
                          <span className={`rounded border px-1.5 py-0.5 font-mono uppercase ${difficultyColor[difficulty] ?? 'border-void-border'}`}>
                            {difficulty}
                          </span>
                        )}
                        <span>{formatTime(activity.solvedAt ?? activity.timestamp ?? activity.solved_at ?? activity.date)}</span>
                      </div>
                      
                      {activity.code_snippet && (
                        <button
                          onClick={() => toggleCode(activityId)}
                          className="flex items-center gap-1 text-xs text-signal transition-colors hover:text-signal-glow"
                        >
                          <Code size={12} />
                          {isExpanded ? 'Hide code' : 'View code'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && activity.code_snippet && (
                  <div className="mt-2 max-h-64 overflow-y-auto overflow-x-auto rounded-md border border-void-border bg-[#0d1117] p-3 text-xs shadow-inner">
                    <pre className="font-mono text-slate-300">
                      <code>{activity.code_snippet}</code>
                    </pre>
                  </div>
                )}
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </div>
  );
}
