import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, ShoppingCart, Shield, Lightbulb, TrendingUp, TrendingDown, Package, AlertTriangle, Factory, Tag, Layers } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getP2Overview } from "../../features/p2/overview/overview.service";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
  violet: "bg-violet-100 text-violet-600",
};

const QUICK_LINKS = [
  { name: "S&OP Cycles", description: "Select planning cycles and manage S&OP.", icon: Calendar, to: "/p2/sop", color: "blue" },
  { name: "Demand Planning", description: "Forecast demand by SKU for the cycle.", icon: TrendingUp, to: "/p2/demand", color: "blue" },
  { name: "Production Scheduling", description: "Planned production and line capacity.", icon: Factory, to: "/p2/production", color: "cyan" },
  { name: "Markdown Decisions", description: "Markdown recommendations for excess stock.", icon: Tag, to: "/p2/markdown", color: "violet" },
  { name: "Procurement", description: "Supplier orders and E2 shipment links.", icon: ShoppingCart, to: "/p2/procurement", color: "emerald" },
  { name: "Risk Monitor", description: "Plans at risk due to E2 delays.", icon: Shield, to: "/p2/risk", color: "amber" },
  { name: "Recommendations", description: "S&OP recommendations for replanning.", icon: Lightbulb, to: "/p2/recommendations", color: "rose" },
  { name: "Inventory", description: "Current stock and risk levels.", icon: Package, to: "/p2/inventory", color: "emerald" },
];

const SEVERITY_COLORS = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

export default function P2Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getP2Overview()
      .then(setOverview)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const planStatusData = overview ? [
    { name: "Balanced", value: overview.plan.balancedProducts },
    { name: "Shortage", value: overview.plan.shortageProducts },
    { name: "Excess", value: overview.plan.excessProducts },
  ] : [];

  const recommendationData = overview ? [
    { name: "Critical", value: overview.recommendations.critical },
    { name: "High", value: overview.recommendations.high },
    { name: "Open", value: overview.recommendations.total - overview.recommendations.critical - overview.recommendations.high },
  ] : [];

  const gapPercent = overview && overview.metrics.totalForecastDemand > 0
    ? Math.round(((overview.metrics.productionCapacity + overview.metrics.availableInventory) / overview.metrics.totalForecastDemand) * 100)
    : 0;

  return (
    <PageWrapper
      title="P2 — Planning Overview"
      description="Supply-demand balance, procurement risks and S&OP health."
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : overview ? (
        <>
          {/* Cycle Info */}
          {overview.cycle && (
            <AnimatedCard>
              <SpotlightCard>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Active Cycle</p>
                    <p className="text-lg font-bold text-slate-900">{overview.cycle.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">{new Date(overview.cycle.startDate).toLocaleDateString()} — {new Date(overview.cycle.endDate).toLocaleDateString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${overview.cycle.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {overview.cycle.status}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedCard>
          )}

          {/* KPI Cards — Metrics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Forecast Demand", value: overview.metrics.totalForecastDemand.toLocaleString(), icon: TrendingUp, color: "blue" },
                { label: "Available Inventory", value: overview.metrics.availableInventory.toLocaleString(), icon: Package, color: "emerald" },
                { label: "Production Capacity", value: overview.metrics.productionCapacity.toLocaleString(), icon: TrendingUp, color: "cyan" },
                { label: "SOP Health", value: `${overview.metrics.sopHealth}%`, icon: Shield, color: "emerald" },
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

          {/* KPI Cards — Risks & Actions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Risks & Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Procurement Risks", value: overview.metrics.procurementRisks, icon: AlertTriangle, color: "rose" },
                { label: "Total Recommendations", value: overview.recommendations.total, icon: Lightbulb, color: "amber" },
                { label: "Markdown Candidates", value: overview.metrics.markdownCandidates, icon: TrendingDown, color: "violet" },
                { label: "Products", value: overview.plan.productCount, icon: Package, color: "blue" },
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard delay={0.8}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={planStatusData} />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.9}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={recommendationData} />
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Supply-Demand Bar */}
          <AnimatedCard delay={1.0}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supply vs Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Forecast Demand", value: overview.metrics.totalForecastDemand, fill: "#3b82f6" },
                    { label: "Capacity + Inventory", value: overview.metrics.productionCapacity + overview.metrics.availableInventory, fill: gapPercent < 100 ? "#ef4444" : "#10b981" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-slate-600 w-40">{item.label}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overview.metrics.totalForecastDemand > 0 ? (item.value / overview.metrics.totalForecastDemand) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-24 text-right">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500 pt-2">
                    Coverage: <span className={`font-semibold ${gapPercent < 100 ? "text-red-600" : "text-emerald-600"}`}>{gapPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Top Risks */}
          {overview.topRisks && overview.topRisks.length > 0 && (
            <AnimatedCard delay={1.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overview.topRisks.slice(0, 5).map((risk) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div>
                          <span className="text-sm font-medium text-slate-900">{risk.sku_code} — {risk.product_name}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{risk.message}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[risk.severity] || SEVERITY_COLORS.LOW}`}>
                          {risk.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          {/* Quick Nav */}
          <AnimatedCard delay={1.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUICK_LINKS.map((m) => (
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
        </>
      ) : (
        <div className="text-sm text-slate-500 py-8 text-center">Failed to load P2 overview data.</div>
      )}
    </PageWrapper>
  );
}
