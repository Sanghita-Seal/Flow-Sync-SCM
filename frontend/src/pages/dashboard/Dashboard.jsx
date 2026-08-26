import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Truck, Package, Dock, AlertTriangle, Calendar, ShoppingCart, Shield, Lightbulb, Container, Warehouse } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import GroupedBarChart from "../../components/charts/GroupedBarChart";
import MultiLineChart from "../../components/charts/MultiLineChart";
import DonutChart from "../../components/charts/DonutChart";
import { getOverview } from "../../features/e2/overview/overview.service";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { useCycle } from "../../context/CycleContext";

const E2_MODULES = [
  { name: "Shipments", description: "Track shipments from dispatch through to arrival.", icon: Container, to: "/e2/shipments", color: "blue" },
  { name: "Trucks", description: "Live location and status of every truck in transit.", icon: Truck, to: "/e2/trucks", color: "emerald" },
  { name: "Yard & Docks", description: "Yard occupancy and dock-level status.", icon: Warehouse, to: "/e2/yard", color: "amber" },
  { name: "AlertTriangles", description: "Operational exceptions across execution.", icon: AlertTriangle, to: "/alerts", color: "rose" },
];

const P2_MODULES = [
  { name: "S&OP Cycles", description: "Select planning cycles and manage S&OP.", icon: Calendar, to: "/p2/sop", color: "blue" },
  { name: "Procurement", description: "Supplier orders and E2 shipment links.", icon: ShoppingCart, to: "/p2/procurement", color: "emerald" },
  { name: "Risk Monitor", description: "Plans at risk due to E2 delays.", icon: Shield, to: "/p2/risk", color: "amber" },
  { name: "Recommendations", description: "S&OP recommendations for replanning.", icon: Lightbulb, to: "/p2/recommendations", color: "rose" },
];

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
};

const STATUS_BADGE = {
  ARRIVED: "emerald",
  IN_TRANSIT: "blue",
  DELAYED: "rose",
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

  const forecastVsPlanData = [
    { name: "SKU001", Forecast: 5000, Plan: 5200 },
    { name: "SKU002", Forecast: 8000, Plan: 7500 },
    { name: "SKU003", Forecast: 6000, Plan: 6200 },
    { name: "SKU004", Forecast: 4000, Plan: 4500 },
    { name: "SKU005", Forecast: 7000, Plan: 6800 },
  ];

  const demandVsActualData = [
    { name: "W1", Demand: 4000, Actual: 3800 },
    { name: "W2", Demand: 4200, Actual: 4100 },
    { name: "W3", Demand: 3800, Actual: 3500 },
    { name: "W4", Demand: 4500, Actual: 4300 },
    { name: "W5", Demand: 4100, Actual: 3900 },
  ];

  const forecastAccuracyData = [
    { name: "Accurate", value: 72 },
    { name: "Over", value: 15 },
    { name: "Under", value: 13 },
  ];

  const capacityData = [
    { name: "Plant A", value: 85, fill: "#3b82f6" },
    { name: "Plant B", value: 72, fill: "#10b981" },
    { name: "Plant C", value: 91, fill: "#f59e0b" },
  ];

  return (
    <PageWrapper
      title="Welcome to SCM Control Tower"
      description="Visibility across supply-chain planning and warehouse execution, in one place."
      actions={
        <div className="flex items-center gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Trucks in transit", value: overview?.trucksInTransit || 0, icon: Truck, color: "blue" },
              { label: "Trucks arrived", value: overview?.trucksArrived || 0, icon: Package, color: "emerald" },
              { label: "Available docks", value: overview?.availableDocks || 0, icon: Dock, color: "amber" },
              { label: "Delayed trucks", value: overview?.delayedTrucks || 0, icon: AlertTriangle, color: "rose" },
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

          {/* P2 KPIs */}
          {p2Overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Procurement plans", value: p2Overview.totalProcurementPlans || p2Overview.procurementPlans || 0, icon: ShoppingCart, color: "blue" },
                { label: "High risk", value: p2Overview.highRisk || p2Overview.atRisk || 0, icon: Shield, color: "rose" },
                { label: "Shipments", value: p2Overview.totalShipments || p2Overview.shipments || 0, icon: Package, color: "emerald" },
                { label: "Delayed", value: p2Overview.delayedShipments || p2Overview.delayed || 0, icon: AlertTriangle, color: "amber" },
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
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={0.8}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Forecast vs Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <GroupedBarChart data={forecastVsPlanData} categories={["Forecast", "Plan"]} xAxisKey="name" />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.9}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Demand Forecast vs Actual Sell-through</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiLineChart data={demandVsActualData} lines={["Demand", "Actual"]} xAxisKey="name" />
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={1.0}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Forecast Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={forecastAccuracyData} />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={1.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capacity Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {capacityData.map((plant) => (
                      <div key={plant.name} className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 w-20">{plant.name}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${plant.value}%` }}
                            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: plant.fill }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12 text-right">{plant.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Module Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={1.2}>
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
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={1.3}>
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
