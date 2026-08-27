import StatusBadge from "../../../../components/ui/StatusBadge";

const DOT_STYLES = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-rose-500",
  UNAVAILABLE: "bg-slate-400",
};
const BOX_STYLES = {
  AVAILABLE: "bg-emerald-50 border-emerald-200",
  OCCUPIED: "bg-rose-50 border-rose-200",
  UNAVAILABLE: "bg-slate-50 border-slate-200",
};
const LABEL_STYLES = {
  AVAILABLE: "text-emerald-600",
  OCCUPIED: "text-rose-600",
  UNAVAILABLE: "text-slate-500",
};

function DockBox({ dock }) {
  return (
    <div className={`rounded-lg border p-3 flex flex-col items-center justify-center gap-1.5 ${BOX_STYLES[dock.status] || BOX_STYLES.UNAVAILABLE}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${DOT_STYLES[dock.status] || DOT_STYLES.UNAVAILABLE}`} />
      <span className="text-xs font-bold text-slate-900">{dock.dockCode}</span>
      <span className={`text-[10px] font-medium ${LABEL_STYLES[dock.status] || LABEL_STYLES.UNAVAILABLE}`}>
        {(dock.status || "unavailable").toLowerCase().replace(/_/g, " ")}
      </span>
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
