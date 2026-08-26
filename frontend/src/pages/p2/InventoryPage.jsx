import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, AlertTriangle, Shield, Search, RefreshCw } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getInventory, getInventorySummary, getInventoryRisk } from "../../features/p2/inventory/inventory.service";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

const RISK_STYLES = {
  HEALTHY: { label: "Healthy", badge: "emerald", icon: Shield },
  SHORTAGE: { label: "Shortage", badge: "rose", icon: AlertTriangle },
  EXCESS: { label: "Excess", badge: "amber", icon: Package },
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    Promise.all([
      getInventory().catch(() => []),
      getInventorySummary().catch(() => null),
      getInventoryRisk().catch(() => []),
    ])
      .then(([inv, sum, risk]) => {
        setInventory(inv);
        setSummary(sum);
        setRisks(risk);
        setFiltered(inv);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(inventory);
    } else {
      const q = search.trim().toLowerCase();
      setFiltered(
        inventory.filter(
          (item) =>
            item.sku_code?.toLowerCase().includes(q) ||
            item.product_name?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, inventory]);

  const riskDonutData = risks.length > 0
    ? ["HEALTHY", "SHORTAGE", "EXCESS"].map((r) => ({
        name: RISK_STYLES[r].label,
        value: risks.filter((x) => x.risk === r).length,
      })).filter((d) => d.value > 0)
    : [];

  const shortageCount = risks.filter((r) => r.risk === "SHORTAGE").length;
  const excessCount = risks.filter((r) => r.risk === "EXCESS").length;
  const healthyCount = risks.filter((r) => r.risk === "HEALTHY").length;

  return (
    <PageWrapper
      title="Inventory"
      description="Current stock levels, coverage analysis and risk status across all products."
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
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total products", value: parseInt(summary.product_count, 10), icon: Package, color: "blue" },
                { label: "Total units", value: parseInt(summary.total_inventory_units, 10).toLocaleString(), icon: Package, color: "emerald" },
                { label: "Avg units / product", value: Math.round(parseFloat(summary.average_inventory_units)).toLocaleString(), icon: Package, color: "cyan" },
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
          )}

          {/* Risk Summary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedCard delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {riskDonutData.length > 0 ? (
                    <DonutChart data={riskDonutData} />
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No risk data</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Counts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Shortage", count: shortageCount, color: "bg-red-500" },
                      { label: "Excess", count: excessCount, color: "bg-amber-500" },
                      { label: "Healthy", count: healthyCount, color: "bg-emerald-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shortage Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {risks.filter((r) => r.risk === "SHORTAGE").length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No shortages</p>
                    ) : (
                      risks
                        .filter((r) => r.risk === "SHORTAGE")
                        .map((r) => (
                          <div key={r.product_id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                            <div>
                              <span className="text-sm font-medium text-slate-900">{r.sku_code}</span>
                              <span className="text-xs text-slate-500 ml-2">{r.product_name}</span>
                            </div>
                            <span className="text-xs text-red-600 font-medium">
                              {r.inventory_units.toLocaleString()} / {r.total_forecast_demand.toLocaleString()}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Search + Table */}
          <AnimatedCard delay={0.6}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Inventory</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by SKU or name..."
                        className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-56"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Forecast Demand</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Coverage</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Risk</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            No inventory found.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => {
                          const riskInfo = risks.find((r) => r.product_id === item.product_id);
                          const risk = riskInfo?.risk || "HEALTHY";
                          const style = RISK_STYLES[risk];
                          const RiskIcon = style.icon;
                          const coverage = riskInfo
                            ? Math.round((riskInfo.inventory_units / Math.max(riskInfo.total_forecast_demand, 1)) * 100)
                            : null;

                          return (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-slate-900">{item.sku_code}</td>
                              <td className="py-2.5 px-3 text-slate-600">{item.product_name}</td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                {parseInt(item.current_inventory_units, 10).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {riskInfo ? riskInfo.total_forecast_demand.toLocaleString() : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {coverage !== null ? (
                                  <span className={`text-xs font-medium ${coverage < 50 ? "text-red-600" : coverage > 150 ? "text-amber-600" : "text-emerald-600"}`}>
                                    {coverage}%
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  risk === "HEALTHY" ? "bg-emerald-50 text-emerald-700" :
                                  risk === "SHORTAGE" ? "bg-red-50 text-red-700" :
                                  "bg-amber-50 text-amber-700"
                                }`}>
                                  <RiskIcon size={10} />
                                  {style.label}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-500 text-xs">
                                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </>
      )}
    </PageWrapper>
  );
}
