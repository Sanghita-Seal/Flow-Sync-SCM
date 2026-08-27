import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Truck,
  Package,
  Dock,
  AlertTriangle,
  Container,
  Warehouse,
  MapPin,
  Clock,
  Eye,
  ArrowRight,
  CircleAlert,
  TruckIcon,
  PackageCheck,
  PackageX,
  CheckCircle2,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import TruckMap from "../../features/e2/trucks/components/TruckMap";
import { getOverview } from "../../features/e2/overview/overview.service";
import { getShipments } from "../../features/e2/shipments/shipment.service";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getYards } from "../../features/e2/yard/yard.service";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

const STATUS_STYLES = {
  ARRIVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "ARRIVED" },
  IN_TRANSIT: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "IN TRANSIT" },
  DELAYED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "DELAYED" },
  UNKNOWN: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "UNKNOWN" },
};

const TRUCK_STATUS_STYLES = {
  IN_TRANSIT: { bg: "bg-blue-50", text: "text-blue-700", label: "IN TRANSIT" },
  ARRIVED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "ARRIVED" },
  DELAYED: { bg: "bg-rose-50", text: "text-rose-700", label: "DELAYED" },
  AT_YARD: { bg: "bg-amber-50", text: "text-amber-700", label: "AT YARD" },
  IN_YARD: { bg: "bg-amber-50", text: "text-amber-700", label: "IN YARD" },
  UNKNOWN: { bg: "bg-slate-50", text: "text-slate-700", label: "UNKNOWN" },
};

function getDeliveryProgress(shipment) {
  if (!shipment.plannedQuantityM || shipment.plannedQuantityM === 0) return null;
  return Math.round((shipment.receivedQuantityM / shipment.plannedQuantityM) * 100);
}

function getETA(shipment) {
  if (!shipment.plannedArrival) return null;
  const d = new Date(shipment.plannedArrival);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function getShipmentStyles(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
}

function getTruckStyles(status) {
  return TRUCK_STATUS_STYLES[status] || TRUCK_STATUS_STYLES.UNKNOWN;
}

export default function E2Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [yards, setYards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipmentFilter, setShipmentFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOverview(),
      getShipments(),
      getTrucks(),
      getYards(),
    ])
      .then(([ov, sh, tr, ya]) => {
        setOverview(ov);
        setShipments(sh);
        setTrucks(tr);
        setYards(ya);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const delayedShipments = useMemo(
    () => shipments.filter((s) => s.status === "DELAYED"),
    [shipments]
  );
  const delayedTrucks = useMemo(
    () => trucks.filter((t) => t.status === "DELAYED"),
    [trucks]
  );
  const fullYards = useMemo(
    () => yards.filter((y) => y.capacity > 0 && y.trucksInYard >= y.capacity),
    [yards]
  );
  const noAvailableDocks = overview && overview.availableDocks === 0;

  const attentionItems = useMemo(() => {
    const items = [];
    delayedShipments.forEach((s) => {
      items.push({
        type: "delayed-shipment",
        severity: "critical",
        title: `Shipment ${s.reference} delayed`,
        detail: `${s.origin} → ${s.destination}`,
        link: "/e2/shipments",
        icon: PackageX,
      });
    });
    delayedTrucks.forEach((t) => {
      items.push({
        type: "delayed-truck",
        severity: "critical",
        title: `Truck ${t.truckId || t.trailerId} delayed`,
        detail: `${t.priority} priority • ${t.locationLabel || t.yardName || "En route"}`,
        link: "/e2/trucks",
        icon: TruckIcon,
      });
    });
    fullYards.forEach((y) => {
      items.push({
        type: "full-yard",
        severity: "warning",
        title: `Yard ${y.name} at capacity`,
        detail: `${y.trucksInYard}/${y.capacity} trucks`,
        link: "/e2/yard",
        icon: Warehouse,
      });
    });
    if (noAvailableDocks) {
      items.push({
        type: "no-docks",
        severity: "warning",
        title: "No docks available",
        detail: `All ${overview.occupiedDocks} docks occupied`,
        link: "/e2/yard",
        icon: Dock,
      });
    }
    return items;
  }, [delayedShipments, delayedTrucks, fullYards, noAvailableDocks, overview]);

  const filteredShipments = useMemo(() => {
    let list = shipments;
    if (shipmentFilter !== "ALL") {
      list = list.filter((s) => s.status === shipmentFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          (s.reference && s.reference.toLowerCase().includes(term)) ||
          (s.origin && s.origin.toLowerCase().includes(term)) ||
          (s.destination && s.destination.toLowerCase().includes(term))
      );
    }
    return list;
  }, [shipments, shipmentFilter, searchTerm]);

  const truckStatusData = overview
    ? [
        { name: "In Transit", value: overview.trucksInTransit, color: "#3b82f6" },
        { name: "Arrived", value: overview.trucksArrived, color: "#10b981" },
        { name: "In Yard", value: overview.trucksInYard, color: "#f59e0b" },
        { name: "Delayed", value: overview.delayedTrucks, color: "#ef4444" },
      ]
    : [];

  const dockStatusData = overview
    ? [
        { name: "Available", value: overview.availableDocks, color: "#10b981" },
        { name: "Occupied", value: overview.occupiedDocks, color: "#f59e0b" },
        { name: "Unavailable", value: overview.unavailableDocks, color: "#ef4444" },
      ]
    : [];

  const deliveryProgressData = useMemo(
    () =>
      shipments
        .filter((s) => s.status !== "DELAYED" && getDeliveryProgress(s) !== null)
        .slice(0, 5),
    [shipments]
  );

  const pipelineStages = useMemo(() => {
    const shipmentCounts = {
      pending: shipments.filter((s) => s.status === "PENDING" || s.status === "UNKNOWN").length,
      inTransit: shipments.filter((s) => s.status === "IN_TRANSIT").length,
      delayed: shipments.filter((s) => s.status === "DELAYED").length,
      arrived: shipments.filter((s) => s.status === "ARRIVED").length,
    };
    const truckCounts = {
      inTransit: overview ? overview.trucksInTransit : 0,
      delayed: overview ? overview.delayedTrucks : 0,
      arrived: overview ? overview.trucksArrived : 0,
    };
    return {
      shipments: shipmentCounts,
      trucks: truckCounts,
      docks: overview ? { available: overview.availableDocks, occupied: overview.occupiedDocks } : { available: 0, occupied: 0 },
    };
  }, [shipments, overview]);

  if (loading) {
    return (
      <PageWrapper
        title="E2 — Execution Control Tower"
        description="Inbound logistics monitoring and execution intelligence."
      >
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </PageWrapper>
    );
  }

  if (!overview) {
    return (
      <PageWrapper
        title="E2 — Execution Control Tower"
        description="Inbound logistics monitoring and execution intelligence."
      >
        <div className="text-sm text-slate-500 py-8 text-center">
          Failed to load E2 overview data. Check your connection and try again.
        </div>
      </PageWrapper>
    );
  }

  const totalShipments = overview.totalShipments;
  const inTransitShipments = overview.shipmentsInTransit;
  const delayedShip = overview.delayedShipments;
  const deliveredShipments = shipments.filter((s) => s.status === "ARRIVED").length;
  const pendingShipments = shipments.filter((s) => s.status === "PENDING" || s.status === "UNKNOWN").length;

  return (
    <PageWrapper
      title="E2 — Execution Control Tower"
      description="Inbound logistics monitoring and execution intelligence."
    >
      {/* ─── Section 1: Execution KPIs ─── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Shipments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Shipments", value: totalShipments, icon: Container, color: "blue" },
            { label: "In Transit", value: inTransitShipments, icon: Truck, color: "emerald" },
            { label: "Delayed", value: delayedShip, icon: AlertTriangle, color: "rose" },
            { label: "Delivered", value: deliveredShipments, icon: PackageCheck, color: "cyan" },
          ].map((kpi, i) => (
            <AnimatedCard key={kpi.label} delay={i * 0.1}>
              <SpotlightCard>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                    <kpi.icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Trucks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Trucks", value: overview.totalTrucks, icon: Truck, color: "blue" },
            { label: "In Transit", value: overview.trucksInTransit, icon: MapPin, color: "emerald" },
            { label: "Arrived", value: overview.trucksArrived, icon: Package, color: "cyan" },
            { label: "Delayed", value: overview.delayedTrucks, icon: AlertTriangle, color: "rose" },
          ].map((kpi, i) => (
            <AnimatedCard key={kpi.label} delay={0.4 + i * 0.1}>
              <SpotlightCard>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                    <kpi.icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* ─── Section 2: Attention Required ─── */}
      {attentionItems.length > 0 && (
        <AnimatedCard delay={0.8}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CircleAlert size={18} className="text-amber-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attentionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border ${
                      item.severity === "critical"
                        ? "bg-rose-50 border-rose-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.severity === "critical"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(item.link)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      View &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* ─── Section 3: Execution Pipeline ─── */}
      <AnimatedCard delay={0.9}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execution Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[
                {
                  label: "Planned",
                  count: pendingShipments + pipelineStages.shipments.inTransit + deliveredShipments,
                  icon: Package,
                  color: "bg-blue-500",
                },
                {
                  label: "In Transit",
                  count: pipelineStages.shipments.inTransit,
                  icon: Truck,
                  color: "bg-emerald-500",
                },
                {
                  label: "At Yard",
                  count: pipelineStages.trucks.arrived,
                  icon: Warehouse,
                  color: "bg-amber-500",
                },
                {
                  label: "Docked",
                  count: pipelineStages.docks.occupied,
                  icon: Dock,
                  color: "bg-cyan-500",
                },
                {
                  label: "Delivered",
                  count: deliveredShipments,
                  icon: PackageCheck,
                  color: "bg-emerald-600",
                },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center`}>
                    <stage.icon size={14} className="text-white" />
                  </div>
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-slate-900">{stage.count}</p>
                    <p className="text-xs text-slate-500">{stage.label}</p>
                  </div>
                  {i < 4 && (
                    <div className="text-slate-300 mx-1 hidden sm:block">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* ─── Section 4: Shipment Table ─── */}
      <AnimatedCard delay={1.0}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base">Shipment Table</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-44 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {["ALL", "IN_TRANSIT", "DELAYED", "ARRIVED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setShipmentFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      shipmentFilter === f
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f === "ALL" ? "All" : f === "IN_TRANSIT" ? "In Transit" : f === "DELAYED" ? "Delayed" : "Delivered"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredShipments.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No shipments match this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">Reference</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">Origin</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">Destination</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">Status</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-slate-500">Progress</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.slice(0, 10).map((s) => {
                      const progress = getDeliveryProgress(s);
                      const styles = getShipmentStyles(s.status);
                      return (
                        <tr key={s.id || s.reference} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-2 font-medium text-slate-900">{s.reference || "-"}</td>
                          <td className="py-2 px-2 text-slate-600">{s.origin || "-"}</td>
                          <td className="py-2 px-2 text-slate-600">{s.destination || "-"}</td>
                          <td className="py-2 px-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                              {styles.label}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            {progress !== null ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-blue-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-600 w-10 text-right">{progress}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-slate-600">{getETA(s) || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {filteredShipments.length > 10 && (
              <button
                onClick={() => navigate("/e2/shipments")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3"
              >
                View all {filteredShipments.length} shipments &rarr;
              </button>
            )}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* ─── Section 5: Live Truck Map + Yard & Dock Status ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={1.1}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live Truck Map</CardTitle>
                <button
                  onClick={() => navigate("/e2/trucks")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Open Tracker &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-slate-200 h-[260px]">
                <TruckMap trucks={trucks} />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={1.2}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Yard & Dock Status</CardTitle>
                <button
                  onClick={() => navigate("/e2/yard")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Yards &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Yards</h4>
                  <div className="space-y-2">
                    {yards.slice(0, 4).map((yard) => {
                      const pct = yard.capacity > 0 ? Math.round((yard.trucksInYard / yard.capacity) * 100) : 0;
                      const barColor = pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
                      return (
                        <div key={yard.id || yard.name} className="flex items-center gap-3">
                          <span className="text-sm text-slate-700 w-20 truncate">{yard.name}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 w-16 text-right">{yard.trucksInYard}/{yard.capacity}</span>
                        </div>
                      );
                    })}
                    {yards.length === 0 && (
                      <p className="text-xs text-slate-400">No yard data available</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Docks</h4>
                  {overview ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Available", value: overview.availableDocks, color: "text-emerald-600" },
                        { label: "Occupied", value: overview.occupiedDocks, color: "text-amber-600" },
                        { label: "Unavailable", value: overview.unavailableDocks, color: "text-rose-600" },
                      ].map((d) => (
                        <div key={d.label} className="text-center">
                          <p className={`text-xl font-bold ${d.color}`}>{d.value}</p>
                          <p className="text-xs text-slate-500">{d.label}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No dock data</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* ─── Section 6: Truck Status + Delivery Progress ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={1.3}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Truck Status</CardTitle>
                <button
                  onClick={() => navigate("/e2/trucks")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Track Trucks &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {truckStatusData.some((d) => d.value > 0) ? (
                <DonutChart data={truckStatusData} />
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">No truck data available</p>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={1.4}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Delivery Progress</CardTitle>
                <button
                  onClick={() => navigate("/e2/shipments")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Shipments &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {deliveryProgressData.length > 0 ? (
                <div className="space-y-4">
                  {deliveryProgressData.map((s) => {
                    const progress = getDeliveryProgress(s);
                    return (
                      <div key={s.id || s.reference} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{s.reference}</span>
                          <span className="text-xs text-slate-500">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-blue-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {s.origin} → {s.destination}
                          </span>
                          <span className="text-xs text-slate-500">
                            {s.receivedQuantityM || 0}m / {s.plannedQuantityM || 0}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">No delivery data available</p>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* ─── Section 7: P2 → E2 Connection ─── */}
      <AnimatedCard delay={1.5}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">P2 → E2 Execution Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[
                { label: "Planning", icon: Package, color: "bg-blue-100 text-blue-600" },
                { label: "Procurement", icon: Truck, color: "bg-emerald-100 text-emerald-600" },
                { label: "Shipment", icon: Container, color: "bg-amber-100 text-amber-600" },
                { label: "Yard", icon: Warehouse, color: "bg-cyan-100 text-cyan-600" },
                { label: "Dock", icon: Dock, color: "bg-violet-100 text-violet-600" },
                { label: "Delivered", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center`}>
                    <step.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{step.label}</span>
                  {i < 5 && (
                    <div className="text-slate-300 mx-1 hidden sm:block">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Shipments with linked procurement plans carry a <code className="bg-slate-100 px-1 rounded">procurementPlanId</code> for full traceability.
              </p>
              <button
                onClick={() => navigate("/p2/plans")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Procurement &rarr;
              </button>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </PageWrapper>
  );
}
