import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Package, FileText, Send, Truck, CalendarCheck, MapPin, CheckCircle2 } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { getProcurementPlanShipments } from "../../features/p2/procurement/procurement.service";
import { getDockAssignments } from "../../features/e2/docks/dock.service";

const STAGE_ICONS = {
  plan: Package,
  po: FileText,
  asn: Send,
  shipment: Send,
  truck: Truck,
  appointment: CalendarCheck,
  yard: MapPin,
  delivery: CheckCircle2,
};

function StageIndicator({ status }) {
  if (status === "complete") {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0">
        <CheckCircle2 size={16} />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white ring-4 ring-blue-100">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-300 bg-white shrink-0">
      <div className="w-2 h-2 rounded-full bg-slate-300" />
    </div>
  );
}

function DetailRow({ label, value, bold }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs ${bold ? "font-semibold text-slate-900" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function deriveStages(plan, shipments, dockAssignments) {
  const stages = [];
  const firstShipment = shipments[0] || null;
  const truck = firstShipment?.truck || null;

  let dockAssignment = null;
  if (truck) {
    dockAssignment = dockAssignments.find((a) => a.trailer_id === truck.trailer_id) || null;
  }

  const completedStatuses = ["IN_TRANSIT", "ARRIVED", "DELAYED", "DELIVERED"];

  // --- Stage 1: Plan ---
  stages.push({
    key: "plan",
    label: "Plan",
    status: "complete",
    description: "Procurement plan created",
    details: [
      { label: "Status", value: plan.status, bold: true },
      { label: "Planning Week", value: plan.planning_week },
      { label: "Risk Level", value: plan.risk_level },
    ],
  });

  // --- Stage 2: Purchase Order (derived label) ---
  const poNumber = `PO-${plan.sku_code}-${plan.planning_week}`;
  stages.push({
    key: "po",
    label: "Purchase Order",
    status: "complete",
    description: "Derived from procurement plan",
    derived: true,
    details: [
      { label: "PO Number", value: poNumber, bold: true },
      { label: "Derived From", value: `Procurement Plan #${plan.id}` },
      { label: "Supplier", value: plan.supplier_name },
      { label: "Order Quantity", value: plan.recommended_order_qty_m ? `${Number(plan.recommended_order_qty_m).toLocaleString()} m` : null },
      { label: "Required Fabric", value: plan.required_fabric_m ? `${Number(plan.required_fabric_m).toLocaleString()} m` : null },
      { label: "Lead Time", value: plan.lead_time_weeks ? `${plan.lead_time_weeks} weeks` : null },
    ],
  });

  // --- Stage 3: ASN (derived label from shipment_reference) ---
  if (firstShipment) {
    const asnNumber = `ASN-${firstShipment.shipment_reference}`;
    stages.push({
      key: "asn",
      label: "Advance Shipping Notice",
      status: firstShipment.status ? "complete" : "pending",
      description: firstShipment.status ? "Shipping notice confirmed" : "Awaiting dispatch",
      derived: true,
      details: [
        { label: "ASN Number", value: asnNumber, bold: true },
        { label: "Derived From", value: `Shipment ${firstShipment.shipment_reference}` },
        { label: "Origin", value: firstShipment.origin },
        { label: "Destination", value: firstShipment.destination },
        { label: "Planned Arrival", value: firstShipment.planned_arrival ? new Date(firstShipment.planned_arrival).toLocaleDateString() : null },
      ],
    });
  }

  // --- Stages 4+: One stage per shipment ---
  if (shipments.length === 0) {
    stages.push({
      key: "shipment",
      label: "Shipment",
      status: "pending",
      description: "No shipments linked to this plan yet",
      details: [],
    });
  }

  for (let i = 0; i < shipments.length; i++) {
    const s = shipments[i];
    const sTruck = s.truck || null;

    let sDock = null;
    if (sTruck) {
      sDock = dockAssignments.find((a) => a.trailer_id === sTruck.trailer_id) || null;
    }

    const shipmentLabel = shipments.length > 1 ? `Shipment ${i + 1}` : "Shipment";
    const isLatest = i === shipments.length - 1;
    const sStatus = completedStatuses.includes(s.status) ? "active" : "pending";

    // Shipment stage
    stages.push({
      key: `shipment-${i}`,
      label: shipmentLabel,
      status: sStatus,
      description: s.status || "Unknown status",
      badge: s.status,
      details: [
        { label: "Reference", value: s.shipment_reference, bold: true },
        { label: "Status", value: s.status },
        { label: "Origin", value: s.origin },
        { label: "Destination", value: s.destination },
        { label: "Planned Qty", value: s.planned_quantity_m ? `${Number(s.planned_quantity_m).toLocaleString()} m` : null },
        { label: "Received Qty", value: s.received_quantity_m != null ? `${Number(s.received_quantity_m).toLocaleString()} m` : null },
        { label: "Planned Arrival", value: s.planned_arrival ? new Date(s.planned_arrival).toLocaleDateString() : null },
      ],
      links: [
        { label: "View Shipment", to: `/e2/shipments/${s.shipment_reference}` },
      ],
    });

    // Truck stage (only for latest or if truck exists)
    if (sTruck && isLatest) {
      const truckStatus = completedStatuses.includes(sTruck.status) ? "active" : "pending";
      stages.push({
        key: "truck",
        label: "Truck",
        status: truckStatus,
        description: sTruck.status || "Unknown",
        badge: sTruck.status,
        details: [
          { label: "Trailer", value: sTruck.trailer_id, bold: true },
          { label: "Tracking #", value: sTruck.tracking_number },
          { label: "Status", value: sTruck.status },
          { label: "ETA", value: sTruck.current_eta ? new Date(sTruck.current_eta).toLocaleString() : null },
          { label: "Location", value: sTruck.current_location },
        ],
        links: [
          { label: "Track Truck", to: "/e2/trucks" },
        ],
      });

      // Appointment stage
      if (sDock) {
        stages.push({
          key: "appointment",
          label: "Truck Appointment",
          status: "complete",
          description: "Dock assigned",
          details: [
            { label: "Dock", value: sDock.dock_code, bold: true },
            { label: "Yard", value: sDock.yard_name },
          ],
          links: [
            { label: "View Yard & Dock", to: "/e2/docks" },
          ],
        });

        // Yard/Dock stage
        stages.push({
          key: "yard",
          label: "Yard / Dock",
          status: "complete",
          description: "Truck at dock",
          details: [
            { label: "Yard", value: sDock.yard_name, bold: true },
            { label: "Dock", value: sDock.dock_code },
            { label: "Priority", value: sDock.priority },
          ],
          links: [
            { label: "View Yard & Dock", to: "/e2/docks" },
          ],
        });
      } else if (sTruck.status === "ARRIVED") {
        stages.push({
          key: "appointment",
          label: "Truck Appointment",
          status: "active",
          description: "Awaiting dock assignment",
          details: [
            { label: "Status", value: "Arrived — no dock assigned yet" },
          ],
          links: [
            { label: "View Yard & Dock", to: "/e2/docks" },
          ],
        });
        stages.push({
          key: "yard",
          label: "Yard / Dock",
          status: "pending",
          description: "Awaiting assignment",
          details: [],
          links: [
            { label: "View Yard & Dock", to: "/e2/docks" },
          ],
        });
      } else {
        stages.push({
          key: "appointment",
          label: "Truck Appointment",
          status: "pending",
          description: "Expected upon arrival",
          details: [],
        });
        stages.push({
          key: "yard",
          label: "Yard / Dock",
          status: "pending",
          description: "Expected upon arrival",
          details: [],
        });
      }
    } else if (sTruck && !isLatest) {
      // Earlier shipments — show compact truck info
      stages.push({
        key: `truck-${i}`,
        label: `Truck (${shipmentLabel})`,
        status: sTruck.status === "ARRIVED" ? "complete" : "active",
        description: `${sTruck.trailer_id} — ${sTruck.status || "Unknown"}`,
        badge: sTruck.status,
        details: [
          { label: "Trailer", value: sTruck.trailer_id },
          { label: "Status", value: sTruck.status },
        ],
      });
    }
  }

  // --- Delivery stage ---
  if (firstShipment) {
    const planned = Number(firstShipment.planned_quantity_m || 0);
    const received = Number(firstShipment.received_quantity_m ?? 0);
    const pct = planned > 0 ? Math.round((received / planned) * 100) : 0;
    const deliveryStatus = pct >= 100 ? "complete" : firstShipment.status === "ARRIVED" ? "active" : "pending";
    const deliveryLabel = pct >= 100 ? "Delivered" : pct > 0 ? "Partial Delivery" : firstShipment.status === "ARRIVED" ? "Unloading" : "Pending";

    stages.push({
      key: "delivery",
      label: "Delivery",
      status: deliveryStatus,
      description: deliveryLabel,
      details: [
        { label: "Planned", value: planned > 0 ? `${planned.toLocaleString()} m` : null },
        { label: "Received", value: firstShipment.received_quantity_m != null ? `${received.toLocaleString()} m` : null },
        { label: "Progress", value: `${pct}%` },
        { label: "Status", value: deliveryLabel, bold: true },
      ],
    });
  }

  return stages;
}

export default function ProcurementExecution() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [dockAssignments, setDockAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);

    Promise.all([
      getProcurementPlanShipments(planId).catch(() => null),
      getDockAssignments().catch(() => []),
    ])
      .then(([data, assignments]) => {
        if (!data) {
          setError("Procurement plan not found.");
          return;
        }
        setPlan(data.procurement_plan || data);
        setShipments(Array.isArray(data.shipments) ? data.shipments : []);
        setDockAssignments(Array.isArray(assignments) ? assignments : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) {
    return (
      <PageWrapper title="Procurement Execution" description="Loading...">
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Procurement Execution" description="Error">
        <div className="text-sm text-rose-500 py-8 text-center">{error}</div>
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/p2/procurement")}>
            <ArrowLeft size={14} className="mr-1" /> Back to Plans
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const stages = deriveStages(plan, shipments, dockAssignments);

  const poNumber = `PO-${plan.sku_code}-${plan.planning_week}`;

  return (
    <PageWrapper
      title="Procurement Execution"
      description={`${plan.sku_code} • ${plan.product_name} • ${plan.supplier_name || ""}`}
      actions={
        <Button variant="ghost" onClick={() => navigate("/p2/procurement")}>
          <ArrowLeft size={14} className="mr-1" /> Back to Plans
        </Button>
      }
    >
      {/* Header Card */}
      <AnimatedCard>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">PO: </span>
                <span className="font-semibold text-slate-900">{poNumber}</span>
                <span className="ml-1 text-[10px] font-medium text-slate-400 uppercase">(derived)</span>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="text-slate-500">Week: </span>
                <span className="font-medium text-slate-900">{plan.planning_week}</span>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="text-slate-500">Risk: </span>
                <Badge variant={plan.risk_level === "CRITICAL" || plan.risk_level === "HIGH" ? "rose" : plan.risk_level === "MEDIUM" ? "amber" : "emerald"}>
                  {plan.risk_level}
                </Badge>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="text-slate-500">Order: </span>
                <span className="font-medium text-slate-900">{plan.recommended_order_qty_m ? `${Number(plan.recommended_order_qty_m).toLocaleString()} m` : "—"}</span>
              </div>
              {shipments.length > 1 && (
                <>
                  <div className="text-slate-300">|</div>
                  <div>
                    <Badge variant="blue">{shipments.length} shipments</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Derived Data Note */}
      <AnimatedCard delay={0.05}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          <strong>Note:</strong> PO and ASN numbers shown below are derived from existing procurement plan and shipment data for display purposes. They are not persisted as separate entities.
        </div>
      </AnimatedCard>

      {/* Workflow Timeline */}
      <AnimatedCard delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execution Lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {stages.map((stage, i) => {
                const Icon = STAGE_ICONS[stage.key.replace(/-\d+$/, "")] || Package;
                const isLast = i === stages.length - 1;

                return (
                  <div key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200" />
                    )}

                    {/* Stage indicator */}
                    <StageIndicator status={stage.status} />

                    {/* Stage content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{stage.label}</span>
                        {stage.derived && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">(derived)</span>
                        )}
                        {stage.badge && (
                          <Badge variant={stage.badge === "DELAYED" ? "rose" : stage.badge === "ARRIVED" ? "emerald" : "blue"} className="text-[10px]">
                            {stage.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>

                      {/* Details */}
                      {stage.details.length > 0 && (
                        <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          {stage.details.filter((d) => d.value != null && d.value !== "").map((d) => (
                            <DetailRow key={d.label} label={d.label} value={d.value} bold={d.bold} />
                          ))}
                          {stage.details.filter((d) => d.value != null && d.value !== "").length === 0 && (
                            <span className="text-xs text-slate-400">No data available</span>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      {stage.links && stage.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {stage.links.map((link) => (
                            <button
                              key={link.to}
                              onClick={() => navigate(link.to)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {link.label} <ExternalLink size={10} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Quick Links */}
      <AnimatedCard delay={0.2}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/p2/procurement")}>
            <ArrowLeft size={12} className="mr-1" /> All Procurement Plans
          </Button>
          {shipments[0] && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/e2/shipments/${shipments[0].shipment_reference}`)}>
              View Shipment <ExternalLink size={10} className="ml-1" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/e2/trucks", { state: { search: shipments[0]?.truck?.trailer_id || "" } })}>
            Track Truck <ExternalLink size={10} className="ml-1" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/e2/docks")}>
            Yard & Dock <ExternalLink size={10} className="ml-1" />
          </Button>
        </div>
      </AnimatedCard>
    </PageWrapper>
  );
}
