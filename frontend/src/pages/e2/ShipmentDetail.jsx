import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
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
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !shipment) {
    return (
      <PageWrapper title="Shipment" description="Not found">
        <div className="text-sm text-slate-500 py-8 text-center">{error || "Shipment not found."}</div>
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
      description={`${shipment.origin} → ${shipment.destination}`}
      actions={
        <Button variant="ghost" onClick={() => navigate("/e2/shipments")}>← Back</Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader><CardTitle className="text-base">Shipment</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {[
                  ["Shipment", shipment.reference],
                  ["Origin", shipment.origin],
                  ["Destination", shipment.destination],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-900 font-medium">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Status</dt>
                  <dd><Badge variant={shipment.status === "DELAYED" ? "rose" : shipment.status === "ARRIVED" ? "emerald" : "blue"}>{shipment.status}</Badge></dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader><CardTitle className="text-base">Quantity</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {[
                  ["Planned", shipment.plannedQuantityM ? `${shipment.plannedQuantityM.toLocaleString()} m` : "—"],
                  ["Received", shipment.receivedQuantityM ? `${shipment.receivedQuantityM.toLocaleString()} m` : "—"],
                  ["Remaining", remaining !== null ? `${remaining.toLocaleString()} m` : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-900 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card>
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= timelineIdx;
                  const isCurrent = idx === timelineIdx;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isCompleted ? "bg-blue-600" : "bg-slate-200"} ${isCurrent ? "ring-2 ring-blue-200" : ""}`} />
                      <span className={`text-sm ${isCompleted ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                        {step} {isCurrent && <span className="text-xs text-blue-600">(current)</span>}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {shipment.procurementPlanId && (
        <AnimatedCard delay={0.4}>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Linked P2 Procurement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3 font-mono">{shipment.procurementPlanId}</p>
                <Button onClick={() => navigate(`/p2/procurement/${shipment.procurementPlanId}`)}>
                  View Procurement Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </AnimatedCard>
      )}
    </PageWrapper>
  );
}
