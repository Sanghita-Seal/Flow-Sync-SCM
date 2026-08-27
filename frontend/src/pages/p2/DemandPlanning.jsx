import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { getDemand, getDemandSummary, getDemandTrend } from "../../features/p2/demand/demand.service";

export default function DemandPlanning() {
  const { selectedCycleId, cycles, setSelectedCycleId, loading: cycleLoading } = useCycle();
  const [demand, setDemand] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("forecast_demand_units");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDemand().catch(() => []),
      getDemandSummary().catch(() => null),
      getDemandTrend().catch(() => []),
    ]).then(([d, s, t]) => {
      setDemand(Array.isArray(d) ? d : []);
      setSummary(s);
      setTrend(Array.isArray(t) ? t : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = demand.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.sku_code && d.sku_code.toLowerCase().includes(q)) ||
      (d.product_name && d.product_name.toLowerCase().includes(q))
    );
  });

  const aggregated = Object.values(
    filtered.reduce((acc, d) => {
      const key = d.sku_code || d.id;
      if (!acc[key]) {
        acc[key] = { ...d, forecast_demand_units: 0, weeks: [] };
      }
      acc[key].forecast_demand_units += Number(d.forecast_demand_units || 0);
      if (d.week && !acc[key].weeks.includes(d.week)) acc[key].weeks.push(d.week);
      return acc;
    }, {})
  );

  const sorted = [...aggregated].sort((a, b) => {
    const aVal = Number(a[sortKey] || 0);
    const bVal = Number(b[sortKey] || 0);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function toggleSort(key) {
    if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); } else { setSortKey(key); setSortDir("desc"); }
  }

  const totalForecast = summary?.total_forecast_demand ?? demand.reduce((s, d) => s + Number(d.forecast_demand_units || 0), 0);
  const avgForecast = summary?.average_forecast_demand ?? 0;
  const productCount = summary?.product_count ?? 0;
  const weekCount = summary?.week_count ?? 0;

  return (
    <PageWrapper
      title="Demand Planning"
      description="Forecast demand by SKU for the selected S&OP cycle."
      actions={
        <select value={selectedCycleId || ""} onChange={(e) => setSelectedCycleId(e.target.value)} className="w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          {cycles.map((c) => <option key={c.id} value={c.id}>{c.cycle_name || c.name} ({c.status})</option>)}
        </select>
      }
    >
      {cycleLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <AnimatedCard>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><TrendingUp size={12} className="text-blue-500" /><span className="text-xs text-slate-500">Products</span></div>
                <div className="text-lg font-bold text-slate-900">{productCount}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><TrendingUp size={12} className="text-emerald-500" /><span className="text-xs text-slate-500">Total Forecast</span></div>
                <div className="text-lg font-bold text-slate-900">{Number(totalForecast).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><BarChart3 size={12} className="text-cyan-500" /><span className="text-xs text-slate-500">Avg Forecast</span></div>
                <div className="text-lg font-bold text-slate-900">{Number(avgForecast).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle size={12} className="text-amber-500" /><span className="text-xs text-slate-500">Weeks</span></div>
                <div className="text-lg font-bold text-slate-900">{weekCount}</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Demand by Week Summary */}
          {trend.length > 0 && (
            <AnimatedCard delay={0.1}>
              <Card>
                <CardHeader><CardTitle className="text-sm">Demand by Week</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trend.slice(0, 8).map((t, i) => {
                      const maxVal = Math.max(...trend.map((x) => Number(x.total_forecast_demand || 0)), 1);
                      const val = Number(t.total_forecast_demand || 0);
                      const pct = (val / maxVal) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-10 shrink-0">{t.week}</span>
                          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-16 text-right">{val.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          {/* Search */}
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Search by SKU or product name..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Demand Table */}
          {sorted.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No demand data found.</div>
          ) : (
            <AnimatedCard delay={0.2}>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("forecast_demand_units")}>Forecast {sortKey === "forecast_demand_units" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Weeks</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sorted.map((d, i) => {
                      const qty = Number(d.forecast_demand_units || 0);
                      return (
                        <motion.tr key={d.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-900">{d.sku_code}</td>
                          <td className="px-3 py-2 text-slate-600">{d.product_name}</td>
                          <td className="px-3 py-2 text-right text-slate-700 font-medium">{qty.toLocaleString()}</td>
                          <td className="px-3 py-2 text-center text-slate-500">{d.weeks?.length || 1}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant={qty > 1000 ? "rose" : qty > 500 ? "amber" : "emerald"}>
                              {qty > 1000 ? "HIGH" : qty > 500 ? "MED" : "LOW"}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AnimatedCard>
          )}
        </>
      )}
    </PageWrapper>
  );
}
