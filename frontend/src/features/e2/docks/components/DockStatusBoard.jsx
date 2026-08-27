const DOT_STYLES = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-rose-500",
  UNAVAILABLE: "bg-slate-400",
};
const CARD_STYLES = {
  AVAILABLE: "bg-emerald-50 border-emerald-200",
  OCCUPIED: "bg-rose-50 border-rose-200",
  UNAVAILABLE: "bg-slate-50 border-slate-200",
};
const LABEL_STYLES = {
  AVAILABLE: "text-emerald-600",
  OCCUPIED: "text-rose-600",
  UNAVAILABLE: "text-slate-500",
};

export default function DockStatusBoard({ docks }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {docks.map((d) => (
        <div key={d.id} className={`rounded-xl border p-4 shadow-sm flex flex-col items-center justify-center gap-1.5 ${CARD_STYLES[d.status] || CARD_STYLES.UNAVAILABLE}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${DOT_STYLES[d.status] || DOT_STYLES.UNAVAILABLE}`} />
          <div className="text-sm font-bold text-slate-900">{d.dockCode}</div>
          <span className={`text-[10px] font-medium ${LABEL_STYLES[d.status] || LABEL_STYLES.UNAVAILABLE}`}>
            {(d.status || "unavailable").toLowerCase().replace(/_/g, " ")}
          </span>
          <div className="text-xs text-slate-500 mt-1">{d.yardName}</div>
        </div>
      ))}
    </div>
  );
}
