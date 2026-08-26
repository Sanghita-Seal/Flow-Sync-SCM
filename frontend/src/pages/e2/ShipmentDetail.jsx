import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import StatusBadge from "../../components/ui/StatusBadge";
import { getShipmentByReference } from "../../features/e2/shipments/shipment.service";

const TIMELINE_STEPS = ["Created", "Dispatched", "In Transit", "Arrived", "Delivered"];

function getTimelineIndex(status) {
  switch (status) {
    case "IN_TRANSIT": return 2;
    case "ARRIVED": return 3;
    case "DELAYED": return 2;
    case "DELIVERED": return 4;
    default: return 0;
  }
}

export default function ShipmentDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reference) return;
    setLoading(true);
    getShipmentByReference(reference)
      .then(setShipment)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <PageWrapper title="Shipment" description="Loading...">
        <div className="text-sm text-slate-500 py-8 text-center">Loading shipment details...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Shipment" description="Error">
        <div className="text-sm text-rose-500 py-8 text-center">Error: {error}</div>
      </PageWrapper>
    );
  }

  if (!shipment) {
    return (
      <PageWrapper title="Shipment" description="Not found">
        <div className="text-sm text-slate-500 py-8 text-center">Shipment not found.</div>
      </PageWrapper>
    );
  }

  const timelineIdx = getTimelineIndex(shipment.status);
  const remaining = shipment.plannedQuantityM && shipment.receivedQuantityM
    ? shipment.plannedQuantityM - shipment.receivedQuantityM
    : null;

  return (
    <PageWrapper
      title={`Shipment ${shipment.reference}`}
      description={`From ${shipment.origin} to ${shipment.destination}`}
      actions={
        <button
          onClick={() => navigate("/e2/shipments")}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Shipments
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Info */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Shipment</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipment</dt>
              <dd className="text-slate-900 font-medium">{shipment.reference}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Origin</dt>
              <dd className="text-slate-900">{shipment.origin}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Destination</dt>
              <dd className="text-slate-900">{shipment.destination}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd><StatusBadge status={shipment.status} /></dd>
            </div>
          </dl>
        </div>

        {/* Execution */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Execution</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Planned Arrival</dt>
              <dd className="text-slate-900">{shipment.plannedArrival ? new Date(shipment.plannedArrival).toLocaleDateString() : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd className="text-slate-900 font-medium">{shipment.status}</dd>
            </div>
          </dl>
        </div>

        {/* Quantity */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Quantity</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Planned Quantity</dt>
              <dd className="text-slate-900 font-medium">{shipment.plannedQuantityM ? `${shipment.plannedQuantityM.toLocaleString()} m` : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Received Quantity</dt>
              <dd className="text-slate-900">{shipment.receivedQuantityM ? `${shipment.receivedQuantityM.toLocaleString()} m` : "—"}</dd>
            </div>
            {remaining !== null && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Remaining</dt>
                <dd className="text-slate-900 font-medium">{remaining.toLocaleString()} m</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Timeline */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Shipment Timeline</h3>
          <div className="space-y-3">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= timelineIdx;
              const isCurrent = idx === timelineIdx;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isCompleted ? "bg-blue-600" : "bg-slate-200"} ${isCurrent ? "ring-2 ring-blue-200" : ""}`}></div>
                  <span className={`text-sm ${isCompleted ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                    {step}
                    {isCurrent && <span className="ml-2 text-xs text-blue-600">(current)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linked P2 Procurement */}
      {shipment.procurementPlanId && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-900">Linked P2 Procurement</h3>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Procurement Plan ID</dt>
                <dd className="text-slate-900 font-mono text-xs">{shipment.procurementPlanId}</dd>
              </div>
            </dl>
            <button
              onClick={() => navigate(`/p2/procurement/${shipment.procurementPlanId}`)}
              className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View Procurement Plan
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
