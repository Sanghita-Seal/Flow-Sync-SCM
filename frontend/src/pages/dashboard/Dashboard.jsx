import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Truck, Package, Dock, AlertTriangle, Calendar, ShoppingCart, Shield, Lightbulb, Container, Warehouse, BarChart3, TrendingUp, Wifi } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getOverview } from "../../features/e2/overview/overview.service";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { useCycle } from "../../context/CycleContext";

const E2_MODULES = [
  { name: "Overview", description: "E2 execution metrics at a glance.", icon: BarChart3, to: "/e2/overview", color: "blue" },
  { name: "Shipments", description: "Track shipments from dispatch through to arrival.", icon: Container, to: "/e2/shipments", color: "emerald" },
  { name: "Trucks", description: "Live location and status of every truck in transit.", icon: Truck, to: "/e2/trucks", color: "amber" },
  { name: "Yard & Docks", description: "Yard occupancy and dock-level status.", icon: Warehouse, to: "/e2/yard", color: "rose" },
];

const P2_MODULES = [
  { name: "Overview", description: "P2 planning metrics at a glance.", icon: BarChart3, to: "/p2/overview", color: "blue" },
  { name: "S&OP Cycles", description: "Select planning cycles and manage S&OP.", icon: Calendar, to: "/p2/sop", color: "emerald" },
  { name: "Procurement", description: "Supplier orders and E2 shipment links.", icon: ShoppingCart, to: "/p2/procurement", color: "amber" },
  { name: "Risk Monitor", description: "Plans at risk due to E2 delays.", icon: Shield, to: "/p2/risk", color: "rose" },
];

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [p2Overview, setP2Overview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedCycle } = useCycle();

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getP2Overview().catch(() => null),
    ])
      .then(([e2, p2]) => {
        setOverview(e2);
        setP2Overview(p2);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Charts data from real API ---
  const truckStatusData = overview ? [
    { name: "In Transit", value: overview.trucksInTransit },
    { name: "Arrived", value: overview.trucksArrived },
    { name: "In Yard", value: overview.trucksInYard },
    { name: "Delayed", value: overview.delayedTrucks },
  ] : [];

  const shipmentStatusData = overview ? [
    { name: "In Transit", value: overview.shipmentsInTransit },
    { name: "Arrived", value: overview.shipmentsArrived },
    { name: "Delayed", value: overview.delayedShipments },
  ] : [];

  const dockStatusData = overview ? [
    { name: "Available", value: overview.availableDocks },
    { name: "Occupied", value: overview.occupiedDocks },
    { name: "Unavailable", value: overview.unavailableDocks },
  ] : [];

  const planStatusData = p2Overview?.plan ? [
    { name: "Balanced", value: p2Overview.plan.balancedProducts },
    { name: "Shortage", value: p2Overview.plan.shortageProducts },
    { name: "Excess", value: p2Overview.plan.excessProducts },
  ] : [];

  const recommendationData = p2Overview?.recommendations ? [
    { name: "Critical", value: p2Overview.recommendations.critical },
    { name: "High", value: p2Overview.recommendations.high },
    { name: "Open", value: p2Overview.recommendations.total - p2Overview.recommendations.critical - p2Overview.recommendations.high },
  ] : [];

  const yardUtilization = overview ? Math.round((overview.activeYards / Math.max(overview.totalYards, 1)) * 100) : 0;
  const dockUtilization = overview ? Math.round((overview.occupiedDocks / Math.max(overview.totalDocks, 1)) * 100) : 0;
  const sopHealth = p2Overview?.metrics?.sopHealth ?? 0;

  return (
    <PageWrapper
      title="Welcome to SCM Control Tower"
      description="Visibility across supply-chain planning and warehouse execution, in one place."
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Wifi size={12} />
            <span className="font-medium">WMS Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {selectedCycle && (
            <Badge variant="blue">{selectedCycle.cycle_name || selectedCycle.name}</Badge>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* E2 KPIs */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">E2 — Execution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Trucks in transit", value: overview?.trucksInTransit ?? 0, icon: Truck, color: "blue" },
                { label: "Trucks arrived", value: overview?.trucksArrived ?? 0, icon: Package, color: "emerald" },
                { label: "Available docks", value: overview?.availableDocks ?? 0, icon: Dock, color: "amber" },
                { label: "Delayed trucks", value: overview?.delayedTrucks ?? 0, icon: AlertTriangle, color: "rose" },
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

          {/* P2 KPIs */}
          {p2Overview && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">P2 — Planning</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Forecast demand", value: (p2Overview.metrics?.totalForecastDemand ?? 0).toLocaleString(), icon: TrendingUp, color: "blue" },
                  { label: "Available inventory", value: (p2Overview.metrics?.availableInventory ?? 0).toLocaleString(), icon: Package, color: "emerald" },
                  { label: "Production capacity", value: (p2Overview.metrics?.productionCapacity ?? 0).toLocaleString(), icon: Container, color: "cyan" },
                  { label: "Procurement risks", value: p2Overview.metrics?.procurementRisks ?? 0, icon: AlertTriangle, color: "rose" },
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
          )}

          {/* Charts Row 1 — E2 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Execution Charts</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatedCard delay={0.8}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Truck Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart data={truckStatusData} />
                  </CardContent>
                </Card>
              </AnimatedCard>
              <AnimatedCard delay={0.9}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Shipment Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart data={shipmentStatusData} />
                  </CardContent>
                </Card>
              </AnimatedCard>
              <AnimatedCard delay={1.0}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dock Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart data={dockStatusData} />
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          </div>

          {/* Charts Row 2 — E2 Utilization */}
          <AnimatedCard delay={1.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">E2 — Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Yard Utilization", value: yardUtilization, fill: "#3b82f6" },
                    { label: "Dock Utilization", value: dockUtilization, fill: "#10b981" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-slate-600 w-40">{item.label}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-12 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Charts Row 3 — P2 */}
          {p2Overview && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Planning Charts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnimatedCard delay={1.2}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Plan Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart data={planStatusData} />
                    </CardContent>
                  </Card>
                </AnimatedCard>
                <AnimatedCard delay={1.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart data={recommendationData} />
                    </CardContent>
                  </Card>
                </AnimatedCard>
                <AnimatedCard delay={1.4}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">P2 — Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: "S&OP Health", value: sopHealth, fill: "#10b981" },
                          { label: "Products balanced", value: p2Overview.plan?.productCount ? Math.round((p2Overview.plan.balancedProducts / p2Overview.plan.productCount) * 100) : 0, fill: "#3b82f6" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 w-40">{item.label}</span>
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.fill }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-12 text-right">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </div>
            </div>
          )}

          {/* Module Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={1.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" />
                    E2 — Warehouse Execution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {E2_MODULES.map((m) => (
                      <motion.button
                        key={m.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(m.to)}
                        className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-300 hover:bg-white transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${ICON_COLORS[m.color]}`}>
                          <m.icon size={14} />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={1.6}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-600" />
                    P2 — Supply Chain Planning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {P2_MODULES.map((m) => (
                      <motion.button
                        key={m.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(m.to)}
                        className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-300 hover:bg-white transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${ICON_COLORS[m.color]}`}>
                          <m.icon size={14} />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
