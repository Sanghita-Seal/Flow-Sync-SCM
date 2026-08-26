import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import StatusBadge from "../../components/ui/StatusBadge";
import { getProcurementPlanShipments } from "../../features/p2/procurement/procurement.service";

const RISK_STYLES = {
  Critical: "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function ProcurementPlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    getProcurementPlanShipments(planId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) {
    return (
      <PageWrapper title="Procurement Plan" description="Loading...">
        <div className="text-sm text-slate-500 py-8 text-center">Loading plan details...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Procurement Plan" description="Error loading plan">
        <div className="text-sm text-rose-500 py-8 text-center">Error: {error}</div>
      </PageWrapper>
    );
  }

  const plan = data?.procurement_plan || data;
  const shipments = data?.shipments || [];

  return (
    <PageWrapper
      title={`Procurement Plan — ${plan?.sku_code || ""}`}
      description={plan?.product_name || ""}
      actions={
        <button
          onClick={() => navigate("/p2/procurement")}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Procurement Plans
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Product Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">SKU</dt>
              <dd className="text-slate-900 font-medium">{plan?.sku_code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Product</dt>
              <dd className="text-slate-900">{plan?.product_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fabric</dt>
              <dd className="text-slate-900">{plan?.fabric_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Supplier</dt>
              <dd className="text-slate-900">{plan?.supplier_name}</dd>
            </div>
          </dl>
        </div>

        {/* Procurement Plan */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Procurement Plan</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Required Fabric</dt>
              <dd className="text-slate-900 font-medium">{Number(plan?.required_fabric_m || 0).toLocaleString()} m</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">MOQ</dt>
              <dd className="text-slate-900">{Number(plan?.moq_m || 0).toLocaleString()} m</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Recommended Order</dt>
              <dd className="text-slate-900 font-medium">{Number(plan?.recommended_order_qty_m || 0).toLocaleString()} m</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Lead Time</dt>
              <dd className="text-slate-900">{plan?.lead_time_weeks || "—"} weeks</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">Risk</dt>
              <dd>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_STYLES[plan?.risk_level] || RISK_STYLES.Low}`}>
                  {plan?.risk_level}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd className="text-slate-900">{plan?.status}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Linked E2 Shipments */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-900">Linked E2 Shipments</h3>
        </div>

        {shipments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">No shipments linked to this procurement plan yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Shipment</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Planned</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Received</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Truck</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ETA</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {shipments.map((s) => (
                  <tr key={s.id || s.shipment_reference} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-900 font-medium">{s.shipment_reference}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-2.5 text-slate-700">{s.planned_quantity_m ? `${Number(s.planned_quantity_m).toLocaleString()} m` : "—"}</td>
                    <td className="px-4 py-2.5 text-slate-700">{s.received_quantity_m ? `${Number(s.received_quantity_m).toLocaleString()} m` : "—"}</td>
                    <td className="px-4 py-2.5 text-slate-700">{s.truck?.trailer_id || s.trailer_id || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-700">{s.truck?.current_eta ? new Date(s.truck.current_eta).toLocaleDateString() : s.current_eta ? new Date(s.current_eta).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => navigate(`/e2/shipments/${s.shipment_reference}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View Shipment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
