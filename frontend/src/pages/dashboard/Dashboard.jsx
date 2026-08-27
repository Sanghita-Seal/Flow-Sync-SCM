import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Truck, Package, Dock, AlertTriangle, Calendar, ShoppingCart, Shield,
  Container, Warehouse, BarChart3, TrendingUp, Wifi, ExternalLink,
  ArrowRight, FileText, AlertCircle,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getOverview } from "../../features/e2/overview/overview.service";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { getPlanSummary } from "../../features/p2/sop/sop.service";
import { getInventoryRisk } from "../../features/p2/inventory/inventory.service";
import { getProcurement } from "../../features/p2/procurement/procurement.service";
import { getMarkdownSummary, getMarkdown } from "../../features/p2/markdown/markdown.service";
import { getShipments } from "../../features/e2/shipments/shipment.service";
import { getYards } from "../../features/e2/yard/yard.service";
import { useCycle } from "../../context/CycleContext";

const SEVERITY_STYLE = {
  high: { bg: "bg-rose-50 border-rose-200", dot: "bg-rose-500", text: "text-rose-700", label: "HIGH" },
  medium: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-700", label: "MEDIUM" },
  low: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500", text: "text-blue-700", label: "LOW" },
};

const STATUS_VARIANT = { BALANCED: "emerald", SHORTAGE: "rose", EXCESS: "amber" };

function SectionTitle({ children }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{children}</h3>;
}

function KpiCard({ icon: Icon, label, value, color, delay = 0, sub }) {
  const COLORS = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    cyan: "bg-cyan-100 text-cyan-600",
  };
  return (
    <AnimatedCard delay={delay}>
      <SpotlightCard>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${COLORS[color] || COLORS.blue}`}><Icon size={20} /></div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      </SpotlightCard>
    </AnimatedCard>
  );
}

function ProgressBar({ label, value, fill, delay = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} transition={{ duration: 0.8, delay, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: fill }} />
      </div>
      <span className="text-xs font-semibold text-slate-900 w-10 text-right">{value}%</span>
    </div>
  );
}

function AttentionItem({ severity, message, action, onClick }) {
  const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.low;
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${s.bg}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span className={`text-[10px] font-bold uppercase ${s.text} shrink-0`}>{s.label}</span>
        <span className="text-xs text-slate-700 truncate">{message}</span>
      </div>
      {action && (
        <button onClick={onClick} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap">
          {action} <ArrowRight size={10} className="inline" />
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedCycleId, selectedCycle } = useCycle();

  const [overview, setOverview] = useState(null);
  const [p2Overview, setP2Overview] = useState(null);
  const [planSummary, setPlanSummary] = useState(null);
  const [inventoryRisk, setInventoryRisk] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [markdownSummary, setMarkdownSummary] = useState(null);
  const [markdownLines, setMarkdownLines] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [yards, setYards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getP2Overview().catch(() => null),
    ]).then(([e2, p2]) => {
      setOverview(e2);
      setP2Overview(p2);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCycleId) return;
    Promise.all([
      getPlanSummary(selectedCycleId).catch(() => null),
      getProcurement({ cycleId: selectedCycleId }).catch(() => []),
    ]).then(([ps, proc]) => {
      setPlanSummary(ps);
      setProcurement(Array.isArray(proc) ? proc : []);
    });
  }, [selectedCycleId]);

  useEffect(() => {
    Promise.all([
      getInventoryRisk().catch(() => []),
      getMarkdownSummary().catch(() => null),
      getMarkdown().catch(() => []),
      getShipments().catch(() => []),
      getYards().catch(() => []),
    ]).then(([ir, ms, ml, sh, yd]) => {
      setInventoryRisk(Array.isArray(ir) ? ir : []);
      setMarkdownSummary(ms);
      setMarkdownLines(Array.isArray(ml) ? ml : []);
      setShipments(Array.isArray(sh) ? sh : []);
      setYards(Array.isArray(yd) ? yd : []);
    });
  }, []);

  const p2m = p2Overview?.metrics || {};
  const p2p = p2Overview?.plan || {};

  const demand = Number(p2m.totalForecastDemand || 0);
  const inventoryUnits = Number(p2m.availableInventory || 0);
  const capacity = Number(p2m.productionCapacity || 0);
  const gap = Number(p2m.supplyDemandGap || 0);
  const planned = planSummary ? Number(planSummary.total_planned_production || 0) : capacity;
  const utilization = capacity > 0 ? Math.round((planned / capacity) * 100) : 0;

  const totalShipments = overview?.totalShipments ?? shipments.length;
  const inTransit = overview?.shipmentsInTransit ?? 0;
  const delayedShipmentsCount = overview?.delayedShipments ?? 0;
  const totalTrucks = overview?.totalTrucks ?? 0;
  const trucksInTransit = overview?.trucksInTransit ?? 0;
  const trucksArrived = overview?.trucksArrived ?? 0;
  const delayedTrucks = overview?.delayedTrucks ?? 0;

  const shortageProducts = planSummary?.shortage_products ?? p2p.shortageProducts ?? 0;
  const excessProducts = planSummary?.excess_products ?? p2p.excessProducts ?? 0;
  const balancedProducts = planSummary?.balanced_products ?? p2p.balancedProducts ?? 0;
  const totalProducts = planSummary?.product_count ?? p2p.productCount ?? 0;

  const overallStatus = shortageProducts > 0 ? "SHORTAGE" : excessProducts > 0 ? "EXCESS" : "BALANCED";

  const invRiskShortage = inventoryRisk.filter((r) => Number(r.current_inventory_units || 0) < Number(r.total_forecast_demand || 0) * 0.5);
  const invRiskExcess = inventoryRisk.filter((r) => Number(r.current_inventory_units || 0) > Number(r.total_forecast_demand || 0) * 1.5);
  const invRiskHealthy = inventoryRisk.length - invRiskShortage.length - invRiskExcess.length;

  const procurementRiskHigh = procurement.filter((p) => (p.risk_level || "").toUpperCase() === "HIGH" || (p.risk_level || "").toUpperCase() === "CRITICAL");
  const procurementRiskMedium = procurement.filter((p) => (p.risk_level || "").toUpperCase() === "MEDIUM");
  const procurementRiskLow = procurement.filter((p) => (p.risk_level || "").toUpperCase() === "LOW");

  const delayedShipmentList = shipments.filter((s) => s.status === "DELAYED").slice(0, 3);

  const mdProductCount = markdownSummary?.product_count ?? 0;
  const mdAvgDiscount = Math.round(Number(markdownSummary?.average_markdown_pct || 0));

  const mdByProduct = Object.values(
    markdownLines.reduce((acc, md) => {
      if (!acc[md.product_id]) acc[md.product_id] = { ...md, totalPct: 0, count: 0 };
      acc[md.product_id].totalPct += Number(md.markdown_pct || 0);
      acc[md.product_id].count += 1;
      return acc;
    }, {})
  ).map((m) => ({ ...m, avgPct: m.count > 0 ? Math.round(m.totalPct / m.count) : 0 }));

  const attentionItems = [];
  delayedShipmentList.forEach((s) => {
    attentionItems.push({ severity: "high", message: `Shipment ${s.reference} is delayed`, action: "Shipments", route: "/e2/shipments" });
  });
  procurementRiskHigh.slice(0, 2).forEach((p) => {
    attentionItems.push({ severity: "medium", message: `${p.sku_code} has high procurement risk`, action: "Procurement", route: "/p2/procurement" });
  });
  if (shortageProducts > 0) {
    attentionItems.push({ severity: "medium", message: `${shortageProducts} product${shortageProducts > 1 ? "s" : ""} in production shortage`, action: "S&OP", route: "/p2/sop" });
  }
  if (mdProductCount > 0) {
    attentionItems.push({ severity: "low", message: `Markdown opportunity: ${mdProductCount} product${mdProductCount > 1 ? "s" : ""}`, action: "Markdown", route: "/p2/markdown" });
  }

  const truckStatusData = overview ? [
    { name: "In Transit", value: trucksInTransit },
    { name: "Arrived", value: trucksArrived },
    { name: "In Yard", value: overview.trucksInYard },
    { name: "Delayed", value: delayedTrucks },
  ] : [];

  const shipmentStatusData = overview ? [
    { name: "In Transit", value: inTransit },
    { name: "Arrived", value: overview.shipmentsArrived },
    { name: "Delayed", value: delayedShipmentsCount },
  ] : [];

  const planStatusData = totalProducts > 0 ? [
    { name: "Balanced", value: balancedProducts },
    { name: "Shortage", value: shortageProducts },
    { name: "Excess", value: excessProducts },
  ] : [];

  return (
    <PageWrapper
      title="Dashboard"
      description="Supply chain control tower — planning, inventory, procurement and execution."
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Wifi size={12} />
            <span className="font-medium">WMS Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {selectedCycle && <Badge variant="blue">{selectedCycle.cycle_name || selectedCycle.name}</Badge>}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <SectionTitle>P2 — Planning</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon={TrendingUp} label="Total Demand" value={demand.toLocaleString()} color="blue" delay={0} sub="forecast units" />
            <KpiCard icon={Package} label="Total Inventory" value={inventoryUnits.toLocaleString()} color="emerald" delay={0.05} sub="opening units" />
            <KpiCard icon={Container} label="Production Capacity" value={capacity.toLocaleString()} color="cyan" delay={0.1} sub={`${utilization}% utilized`} />
            <KpiCard icon={gap > 0 ? AlertTriangle : BarChart3} label="Production Gap" value={gap > 0 ? gap.toLocaleString() : "0"} color={gap > 0 ? "rose" : "emerald"} delay={0.15} sub={gap > 0 ? "units short" : "no gap"} />
          </div>

          <SectionTitle>E2 — Execution</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon={Container} label="Total Shipments" value={totalShipments} color="blue" delay={0.2} />
            <KpiCard icon={Truck} label="In Transit" value={inTransit} color="emerald" delay={0.25} sub={`${trucksInTransit} trucks`} />
            <KpiCard icon={AlertTriangle} label="Delayed" value={delayedShipmentsCount} color="rose" delay={0.3} sub={`${delayedTrucks} trucks`} />
            <KpiCard icon={Truck} label="Trucks" value={totalTrucks} color="amber" delay={0.35} sub={`${trucksArrived} arrived`} />
          </div>

          {attentionItems.length > 0 && (
            <AnimatedCard delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500" />
                    Attention Required
                    <Badge variant="rose" className="ml-1">{attentionItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attentionItems.map((item, i) => (
                      <AttentionItem key={i} severity={item.severity} message={item.message} action={item.action} onClick={() => navigate(item.route)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatedCard delay={0.45}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">P2 Planning Health</CardTitle>
                    <Badge variant={STATUS_VARIANT[overallStatus]}>{overallStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Demand</span><span className="font-semibold text-slate-900">{demand.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Planned Production</span><span className="font-semibold text-slate-900">{planned.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-medium text-slate-700">{capacity.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Gap</span><span className={`font-semibold ${gap > 0 ? "text-rose-600" : "text-slate-900"}`}>{gap > 0 ? `+${gap.toLocaleString()}` : "0"} units</span></div>
                    <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between"><span className="text-slate-500">Shortage</span><span className="font-medium text-rose-600">{shortageProducts}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Excess</span><span className="font-medium text-amber-600">{excessProducts}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Balanced</span><span className="font-medium text-emerald-600">{balancedProducts}</span></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <ProgressBar label="S&OP Health" value={p2m.sopHealth ?? 0} fill="#10b981" delay={0.6} />
                  </div>
                  <div className="mt-3">
                    <button onClick={() => navigate("/p2/sop")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View S&OP Cycles <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.5}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-sm">Inventory Risk</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-100"><div className="text-lg font-bold text-rose-600">{invRiskShortage.length}</div><div className="text-[10px] text-rose-500 uppercase font-medium">Shortage</div></div>
                    <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100"><div className="text-lg font-bold text-amber-600">{invRiskExcess.length}</div><div className="text-[10px] text-amber-500 uppercase font-medium">Excess</div></div>
                    <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-lg font-bold text-emerald-600">{invRiskHealthy}</div><div className="text-[10px] text-emerald-500 uppercase font-medium">Healthy</div></div>
                  </div>
                  {invRiskShortage.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Top shortage</p>
                      <div className="space-y-1">
                        {invRiskShortage.slice(0, 3).map((r) => (
                          <div key={r.product_id} className="flex justify-between text-xs">
                            <span className="text-slate-700 truncate">{r.sku_code} <span className="text-slate-400">{r.product_name}</span></span>
                            <span className="text-rose-600 font-medium shrink-0 ml-2">{Number(r.current_inventory_units || 0).toLocaleString()} / {Number(r.total_forecast_demand || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <button onClick={() => navigate("/p2/inventory")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View Inventory <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatedCard delay={0.55}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-sm">Production Overview</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Required Production</span><span className="font-semibold text-slate-900">{demand.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Planned Production</span><span className="font-semibold text-slate-900">{planned.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Available Capacity</span><span className="font-medium text-slate-700">{capacity.toLocaleString()} units</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Production Gap</span><span className={`font-semibold ${gap > 0 ? "text-rose-600" : "text-slate-900"}`}>{gap > 0 ? `+${gap.toLocaleString()}` : "0"} units</span></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <ProgressBar label="Utilization" value={utilization} fill={utilization > 90 ? "#ef4444" : "#3b82f6"} delay={0.7} />
                  </div>
                  <div className="mt-3">
                    <button onClick={() => navigate("/p2/production")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View Production Scheduling <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.6}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-sm">Procurement Snapshot</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-xs mb-3"><span className="font-semibold text-slate-900">{procurement.length}</span> <span className="text-slate-500">Procurement Plans</span></div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-lg font-bold text-emerald-600">{procurementRiskLow.length}</div><div className="text-[10px] text-emerald-500 uppercase font-medium">Low</div></div>
                    <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100"><div className="text-lg font-bold text-amber-600">{procurementRiskMedium.length}</div><div className="text-[10px] text-amber-500 uppercase font-medium">Medium</div></div>
                    <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-100"><div className="text-lg font-bold text-rose-600">{procurementRiskHigh.length}</div><div className="text-[10px] text-rose-500 uppercase font-medium">High</div></div>
                  </div>
                  {procurementRiskHigh.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Highest risk</p>
                      {procurementRiskHigh.slice(0, 2).map((p) => (
                        <div key={p.id} className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700">{p.sku_code} <span className="text-slate-400">{p.product_name}</span></span>
                          <Badge variant="rose">{p.risk_level}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <button onClick={() => navigate("/p2/procurement")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View Procurement <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatedCard delay={0.65}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-sm">E2 Shipment Execution</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-xs mb-3"><span className="font-semibold text-slate-900">{totalShipments}</span> <span className="text-slate-500">Shipments</span></div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-lg font-bold text-emerald-600">{overview?.shipmentsArrived ?? 0}</div><div className="text-[10px] text-emerald-500 uppercase font-medium">Arrived</div></div>
                    <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-100"><div className="text-lg font-bold text-blue-600">{inTransit}</div><div className="text-[10px] text-blue-500 uppercase font-medium">In Transit</div></div>
                    <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-100"><div className="text-lg font-bold text-rose-600">{delayedShipmentsCount}</div><div className="text-[10px] text-rose-500 uppercase font-medium">Delayed</div></div>
                  </div>
                  {delayedShipmentList.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Delayed shipments</p>
                      <div className="space-y-1">
                        {delayedShipmentList.map((s) => (
                          <div key={s.id} className="flex justify-between text-xs">
                            <span className="text-slate-700">{s.reference}</span>
                            <Badge variant="rose">{s.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <button onClick={() => navigate("/e2/shipments")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View All Shipments <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.7}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-sm">Truck & Yard Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Trucks</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold text-slate-900">{totalTrucks}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">In Transit</span><span className="text-blue-600">{trucksInTransit}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Arrived</span><span className="text-emerald-600">{trucksArrived}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Delayed</span><span className="text-rose-600">{delayedTrucks}</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Yards</p>
                      <div className="space-y-1 text-xs">
                        {yards.slice(0, 4).map((y) => (
                          <div key={y.id} className="flex justify-between">
                            <span className="text-slate-700 truncate">{y.name}</span>
                            <span className="text-slate-500 shrink-0 ml-2">{y.trucksInYard}/{y.capacity}</span>
                          </div>
                        ))}
                        {yards.length === 0 && <div className="text-slate-400">No yard data</div>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Docks</p>
                    <ProgressBar label="Available" value={overview ? Math.round((overview.availableDocks / Math.max(overview.totalDocks, 1)) * 100) : 0} fill="#10b981" delay={0.8} />
                    <ProgressBar label="Occupied" value={overview ? Math.round((overview.occupiedDocks / Math.max(overview.totalDocks, 1)) * 100) : 0} fill="#f59e0b" delay={0.85} />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => navigate("/e2/trucks")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">Track Trucks <ArrowRight size={10} className="inline" /></button>
                    <button onClick={() => navigate("/e2/docks")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">Yards & Docks <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {mdProductCount > 0 && (
            <AnimatedCard delay={0.75}>
              <Card>
                <CardHeader><CardTitle className="text-sm">Markdown Opportunities</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs mb-3">
                    <span><span className="font-semibold text-slate-900">{mdProductCount}</span> <span className="text-slate-500">Products</span></span>
                    <span className="text-slate-300">|</span>
                    <span><span className="font-semibold text-slate-900">{mdAvgDiscount}%</span> <span className="text-slate-500">Avg Discount</span></span>
                  </div>
                  {mdByProduct.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {mdByProduct.slice(0, 6).map((m) => (
                        <div key={m.product_id} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                          <span className="font-medium text-slate-900">{m.sku_code}</span>
                          <span className="text-slate-500">{m.product_name}</span>
                          <Badge variant="amber">{m.avgPct}%</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <button onClick={() => navigate("/p2/markdown")} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">View Markdown Decisions <ArrowRight size={10} className="inline" /></button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          <SectionTitle>Overview Charts</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AnimatedCard delay={0.8}>
              <Card><CardHeader><CardTitle className="text-base">Truck Status</CardTitle></CardHeader><CardContent>{truckStatusData.length > 0 ? <DonutChart data={truckStatusData} /> : <div className="text-xs text-slate-400 py-8 text-center">No data</div>}</CardContent></Card>
            </AnimatedCard>
            <AnimatedCard delay={0.85}>
              <Card><CardHeader><CardTitle className="text-base">Shipment Status</CardTitle></CardHeader><CardContent>{shipmentStatusData.length > 0 ? <DonutChart data={shipmentStatusData} /> : <div className="text-xs text-slate-400 py-8 text-center">No data</div>}</CardContent></Card>
            </AnimatedCard>
            <AnimatedCard delay={0.9}>
              <Card><CardHeader><CardTitle className="text-base">Plan Status</CardTitle></CardHeader><CardContent>{planStatusData.length > 0 ? <DonutChart data={planStatusData} /> : <div className="text-xs text-slate-400 py-8 text-center">No data</div>}</CardContent></Card>
            </AnimatedCard>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
