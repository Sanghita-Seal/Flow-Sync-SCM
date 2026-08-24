import StatusBadge from "../../../../components/ui/StatusBadge";

const CARD_STYLES = {
  AVAILABLE: "bg-emerald-50 border-emerald-200",
  OCCUPIED: "bg-rose-50 border-rose-200",
  UNAVAILABLE: "bg-slate-50 border-slate-200",
};

export default function DockStatusBoard({ docks }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {docks.map((d) => (
        <div key={d.id} className={`rounded-xl border p-4 shadow-sm ${CARD_STYLES[d.status] || CARD_STYLES.UNAVAILABLE}`}>
          <div className="text-sm font-semibold text-slate-900">{d.dockCode}</div>
          <div className="text-xs text-slate-600 mt-1">{d.yardName}</div>
          <div className="mt-2"><StatusBadge status={d.status} /></div>
        </div>
      ))}
    </div>
  );
}
