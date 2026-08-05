/**
 * A small radar-sweep loader used anywhere the app is waiting on the backend —
 * ties visually to the "/auth/verify" radar handshake concept used across FleetCode.
 */
export default function RadarLoader({ label = 'Scanning…', size = 56 }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className="relative overflow-hidden rounded-full border border-signal/30"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-void-raised" />
        <div className="absolute inset-0 animate-sweep bg-radar-sweep" />
        <div className="absolute inset-[3px] rounded-full border border-void-border" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terminal animate-blip" />
      </div>
      <p className="eyebrow">{label}</p>
    </div>
  );
}
