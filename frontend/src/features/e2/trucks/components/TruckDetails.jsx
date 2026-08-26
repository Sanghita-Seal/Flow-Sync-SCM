import StatusBadge from "../../../../components/ui/StatusBadge";

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{children}</span>
    </div>
  );
}

function EtaIndicator({ status }) {
  if (status === "ARRIVED") return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Delivered</span>;
  if (status === "DELAYED") return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Delayed</span>;
  return <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">On Time</span>;
}

function ProgressBar({ status }) {
  const pct = status === "ARRIVED" ? 100 : status === "DELAYED" ? 65 : status === "IN_TRANSIT" ? 50 : 0;
  const color = status === "ARRIVED" ? "bg-emerald-500" : status === "DELAYED" ? "bg-red-500" : "bg-blue-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Delivery Progress</span>
        <span className="font-semibold text-slate-700">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TruckDetails({ truck }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 w-72 shrink-0 min-h-[220px] shadow-sm">
      <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Truck Detail</div>

      {truck ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-900">{truck.truckId || truck.id}</div>
            <EtaIndicator status={truck.status} />
          </div>

          <ProgressBar status={truck.status} />

          <div className="flex flex-col gap-2 pt-1">
            <Row label="Trailer">{truck.trailerId || "—"}</Row>
            <Row label="Shipment">{truck.shipmentRef || truck.shipmentId || "—"}</Row>
            <Row label="Status"><StatusBadge status={truck.status} /></Row>
            <Row label="Load Type">{truck.loadType || "—"}</Row>
            <Row label="Priority"><span className="uppercase">{truck.priority || "normal"}</span></Row>
            <Row label="Location">{truck.locationLabel || truck.yardName || "—"}</Row>
            <Row label="ETA">{truck.eta || "—"}</Row>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500 py-4">
          Select a truck on the map or in search results to see details.
        </div>
      )}
    </div>
  );
}
