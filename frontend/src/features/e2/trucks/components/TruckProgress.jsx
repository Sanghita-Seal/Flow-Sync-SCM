export default function TruckProgress({ progress = 0, eta }) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{pct}%</span>
        {eta && <span>ETA {eta}</span>}
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
