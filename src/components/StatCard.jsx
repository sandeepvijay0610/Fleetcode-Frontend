export default function StatCard({ label, value, icon: Icon, accent = 'signal' }) {
  const accentClasses = {
    signal: 'text-signal border-signal/30',
    terminal: 'text-terminal border-terminal/30',
    gold: 'text-rankgold border-rankgold/30',
  };

  return (
    <div className="hud-panel flex items-center gap-4 p-4">
      {Icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${accentClasses[accent]} bg-void`}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="eyebrow truncate">{label}</p>
        <p className="font-mono text-2xl font-semibold text-slate-bright">{value}</p>
      </div>
    </div>
  );
}
