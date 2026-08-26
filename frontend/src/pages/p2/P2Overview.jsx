import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, ShoppingCart, Shield, Lightbulb, Package, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import GroupedBarChart from "../../components/charts/GroupedBarChart";
import DonutChart from "../../components/charts/DonutChart";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { useCycle } from "../../context/CycleContext";

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

const SEVERITY_COLORS = {
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "emerald",
};

export default function P2Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedCycle } = useCycle();

  useEffect(() => {
    getP2Overview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const metrics = overview?.metrics || {};
  const plan = overview?.plan || {};
  const recs = overview?.recommendations || {};
  const risks = overview?.topRisks || [];
  const cycle = overview?.cycle || {};

  // Chart data: Forecast vs Inventory
  const forecastVsInventoryData = [
    { name: "Forecast", value: metrics.totalForecastDemand || 0 },
    { name: "Inventory", value: metrics.availableInventory || 0 },
    { name: "Capacity", value: metrics.productionCapacity || 0 },
  ];

  // Chart data: Plan breakdown
  const planBreakdownData = [
    { name: "Balanced", value: plan.balancedProducts || 0 },
    { name: "Shortage", value: plan.shortageProducts || 0 },
    { name: "Excess", value: plan.excessProducts || 0 },
  ];

  // Chart data: Recommendations
  const recsChartData = [
    { name: "Critical", value: recs.critical || 0 },
    { name: "High", value: recs.high || 0 },
    { name: "Open", value: recs.open || 0 },
  ];

  return (
    <PageWrapper
      title="P2 — Planning Overview"
      description="Supply chain planning metrics, risk summary, and cycle health."
      actions={
        <div className="flex items-center gap-3">
          {(selectedCycle || cycle.name) && (
            <Badge variant="blue">{cycle.name || selectedCycle?.cycle_name}</Badge>
          )}
          {cycle.status && (
            <Badge variant={cycle.status === "APPROVED" ? "emerald" : "blue"}>{cycle.status}</Badge>
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
      ) : !overview ? (
        <div className="text-center py-16 text-slate-500">Failed to load P2 overview data.</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Forecast demand", value: metrics.totalForecastDemand?.toLocaleString() || 0, icon: TrendingUp, color: "blue" },
              { label: "Available inventory", value: metrics.availableInventory?.toLocaleString() || 0, icon: Package, color: "emerald" },
              { label: "Production capacity", value: metrics.productionCapacity?.toLocaleString() || 0, icon: BarChart3, color: "amber" },
              { label: "Procurement risks", value: metrics.procurementRisks || 0, icon: AlertTriangle, color: "rose" },
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

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Demand, Inventory & Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <GroupedBarChart
                    data={forecastVsInventoryData.map((d) => ({ name: d.name, Value: d.value }))}
                    categories={["Value"]}
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.6}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {planBreakdownData.some((d) => d.value > 0) ? (
                    <DonutChart data={planBreakdownData} />
                  ) : (
                    <div className="text-center py-8 text-sm text-slate-400">No plan data available</div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={0.7}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Total", value: recs.total || 0, color: "#3b82f6" },
                      { label: "Critical", value: recs.critical || 0, color: "#dc2626" },
                      { label: "High", value: recs.high || 0, color: "#f59e0b" },
                      { label: "Open", value: recs.open || 0, color: "#64748b" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 w-20">{item.label}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: recs.total ? `${(item.value / recs.total) * 100}%` : "0%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.8}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Planning Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "S&OP Health", value: metrics.sopHealth || 0, suffix: "%" },
                      { label: "Products planned", value: plan.productCount || 0 },
                      { label: "Planned production", value: plan.plannedProduction?.toLocaleString() || 0 },
                      { label: "Supply-demand gap", value: metrics.supplyDemandGap || 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <span className="text-sm font-semibold text-slate-900">{item.value}{item.suffix || ""}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Top Risks */}
          {risks.length > 0 && (
            <AnimatedCard delay={0.9}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Top Risks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risks.map((risk) => (
                      <div key={risk.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                        <Badge variant={SEVERITY_COLORS[risk.severity] || "blue"}>{risk.severity}</Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{risk.sku_code}</span>
                            <span className="text-xs text-slate-500">{risk.product_name}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{risk.message}</p>
                          <p className="text-xs text-slate-500 mt-1 italic">{risk.recommended_action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          {/* Module Cards */}
          <AnimatedCard delay={1.0}>
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
        </>
      )}
    </PageWrapper>
  );
}
