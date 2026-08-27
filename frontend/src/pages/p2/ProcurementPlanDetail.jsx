import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { getProcurementPlanShipments } from "../../features/p2/procurement/procurement.service";

const RISK_VARIANT = {
  Critical: "rose",
  High: "amber",
  Medium: "amber",
  Low: "emerald",
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
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
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
        <Button variant="ghost" onClick={() => navigate("/p2/procurement")}>
          ← Back to Plans
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {[
                  ["SKU", plan?.sku_code],
                  ["Product", plan?.product_name],
                  ["Fabric", plan?.fabric_type],
                  ["Supplier", plan?.supplier_name],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-900 font-medium">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Procurement Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {[
                  ["Required Fabric", plan?.required_fabric_m ? `${Number(plan.required_fabric_m).toLocaleString()} m` : "—"],
                  ["MOQ", plan?.moq_m ? `${Number(plan.moq_m).toLocaleString()} m` : "—"],
                  ["Recommended Order", plan?.recommended_order_qty_m ? `${Number(plan.recommended_order_qty_m).toLocaleString()} m` : "—"],
                  ["Lead Time", plan?.lead_time_weeks ? `${plan.lead_time_weeks} weeks` : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-900 font-medium">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Risk</dt>
                  <dd><Badge variant={RISK_VARIANT[plan?.risk_level] || "emerald"}>{plan?.risk_level}</Badge></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-slate-900">{plan?.status}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2}>
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-900">Linked E2 Shipments</h3>
          </div>

          {shipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-slate-500">No shipments linked to this procurement plan yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Shipment</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">Planned</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">Received</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">Truck</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ETA</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {shipments.map((s, i) => (
                    <motion.tr
                      key={s.id || s.shipment_reference}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{s.shipment_reference}</td>
                      <td className="px-4 py-2.5"><Badge variant={s.status === "DELAYED" ? "rose" : s.status === "ARRIVED" ? "emerald" : "blue"}>{s.status}</Badge></td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{s.planned_quantity_m ? `${Number(s.planned_quantity_m).toLocaleString()} m` : "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{s.received_quantity_m ? `${Number(s.received_quantity_m).toLocaleString()} m` : "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden md:table-cell">{s.truck?.trailer_id || s.trailer_id || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700">{s.truck?.current_eta ? new Date(s.truck.current_eta).toLocaleDateString() : s.current_eta ? new Date(s.current_eta).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/e2/shipments/${s.shipment_reference}`)}>
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AnimatedCard>
    </PageWrapper>
  );
}
