import StatusBadge from "../../../../components/ui/StatusBadge";

// Small square inside the yard box, one per dock.
const DOT_STYLES = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-orange-500",
  UNAVAILABLE: "bg-slate-400",
};
const BOX_STYLES = {
  AVAILABLE: "bg-emerald-50 border-emerald-200",
  OCCUPIED: "bg-orange-50 border-orange-200",
  UNAVAILABLE: "bg-slate-100 border-slate-200",
};

function DockBox({ dock }) {
  return (
    <div className={`rounded-lg border p-2.5 flex flex-col items-center justify-center gap-1 ${BOX_STYLES[dock.status] || BOX_STYLES.UNAVAILABLE}`}>
      <span className={`w-2 h-2 rounded-full ${DOT_STYLES[dock.status] || DOT_STYLES.UNAVAILABLE}`} />
      <span className="text-xs font-semibold text-slate-900">{dock.dockCode}</span>
    </div>
  );
}

/**
 * One big card per yard, showing its stats up top and a small grid of
 * its own docks inside — instead of two separate sparse pages.
 */
export default function YardDockPanel({ yard, docks }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-base font-semibold text-slate-900">{yard.name}</div>
          <div className="text-xs text-slate-600 mt-0.5">{yard.trucksInYard} / {yard.capacity} trucks in yard</div>
        </div>
        <StatusBadge status={yard.status} />
      </div>

      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Docks ({docks.length})</div>
      <div className="grid grid-cols-4 gap-2">
        {docks.map((d) => (
          <DockBox key={d.id} dock={d} />
        ))}
        {docks.length === 0 && (
          <div className="col-span-4 text-xs text-slate-400 text-center py-3">No docks assigned to this yard.</div>
        )}
      </div>
    </div>
  );
}
