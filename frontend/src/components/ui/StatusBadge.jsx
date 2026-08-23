const STYLES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IN_TRANSIT: "bg-amber-50 text-amber-700 border-amber-200",
  OCCUPIED: "bg-rose-50 text-rose-700 border-rose-200",
  DELAYED: "bg-rose-50 text-rose-700 border-rose-200",
  RESERVED: "bg-amber-50 text-amber-700 border-amber-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NOT_STARTED: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.NOT_STARTED;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${style}`}>
      {(status || "unknown").toLowerCase().replace("_", " ")}
    </span>
  );
}
