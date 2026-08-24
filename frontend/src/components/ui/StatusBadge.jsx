const STYLES = {
  // Truck / shipment statuses
  IN_TRANSIT: "bg-amber-50 text-amber-700 border-amber-200",
  ARRIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELAYED: "bg-rose-50 text-rose-700 border-rose-200",

  // Dock statuses
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OCCUPIED: "bg-rose-50 text-rose-700 border-rose-200",
  UNAVAILABLE: "bg-slate-100 text-slate-600 border-slate-200",

  // Yard statuses
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FULL: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${style}`}>
      {(status || "unknown").toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
