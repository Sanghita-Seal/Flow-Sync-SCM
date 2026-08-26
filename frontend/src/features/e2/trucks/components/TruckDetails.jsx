import StatusBadge from "../../../../components/ui/StatusBadge";

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium">{children}</span>
    </div>
  );
}

export default function TruckDetails({ truck }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 w-64 shrink-0 min-h-[220px] shadow-sm">
      <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Truck Detail</div>

      {truck ? (
        <div className="flex flex-col gap-2.5">
          <div className="text-lg font-semibold text-slate-900">{truck.truckId || truck.id}</div>
          <Row label="Trailer">{truck.trailerId || "—"}</Row>
          <Row label="Shipment">{truck.shipmentId || truck.shipmentReference || "—"}</Row>
          <Row label="Status"><StatusBadge status={truck.status} /></Row>
          <Row label="Load Type">{truck.loadType || "—"}</Row>
          <Row label="Priority">{truck.priority || "normal"}</Row>
          <Row label="ETA">{truck.eta || truck.currentEta || "—"}</Row>
          <Row label="Progress">{truck.progress != null ? `${truck.progress}%` : "—"}</Row>
          <Row label="Destination">{truck.destination?.label || truck.destinationName || "—"}</Row>
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          Select a truck on the map or in search results to see details.
        </div>
      )}
    </div>
  );
}
