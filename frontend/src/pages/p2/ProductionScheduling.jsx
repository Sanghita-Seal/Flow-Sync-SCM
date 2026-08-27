import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Factory, BarChart3, AlertTriangle, Wrench } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { getProduction, getProductionCapacity, getProductionSummary } from "../../features/p2/production/production.service";

export default function ProductionScheduling() {
  const { selectedCycleId, cycles, setSelectedCycleId, loading: cycleLoading } = useCycle();
  const [production, setProduction] = useState([]);
  const [capacity, setCapacity] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("capacity_units");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProduction().catch(() => []),
      getProductionCapacity().catch(() => []),
      getProductionSummary().catch(() => null),
    ]).then(([p, c, s]) => {
      setProduction(Array.isArray(p) ? p : []);
      setCapacity(Array.isArray(c) ? c : []);
      setSummary(s);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = production.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.sku_code && p.sku_code.toLowerCase().includes(q)) ||
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.plant_id && String(p.plant_id).toLowerCase().includes(q))
    );
  });

  const aggregated = Object.values(
    filtered.reduce((acc, p) => {
      const key = p.sku_code || p.id;
      if (!acc[key]) {
        acc[key] = { ...p, capacity_units: 0, plant_ids: [], weeks: [] };
      }
      acc[key].capacity_units += Number(p.capacity_units || 0);
      if (p.plant_id && !acc[key].plant_ids.includes(p.plant_id)) acc[key].plant_ids.push(p.plant_id);
      if (p.week && !acc[key].weeks.includes(p.week)) acc[key].weeks.push(p.week);
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

  const totalPlanned = production.reduce((s, p) => s + Number(p.capacity_units || 0), 0);
  const totalCapacity = capacity.reduce((s, c) => s + Number(c.capacity_units || 0), 0);
  const utilization = totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0;

  return (
    <PageWrapper
      title="Production Scheduling"
      description="Planned production capacities and utilization."
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
                <div className="flex items-center gap-2 mb-1"><Factory size={12} className="text-blue-500" /><span className="text-xs text-slate-500">Products</span></div>
                <div className="text-lg font-bold text-slate-900">{summary?.product_count ?? production.length}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><BarChart3 size={12} className="text-emerald-500" /><span className="text-xs text-slate-500">Total Capacity</span></div>
                <div className="text-lg font-bold text-slate-900">{(summary?.total_capacity_units ?? totalPlanned).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Wrench size={12} className="text-cyan-500" /><span className="text-xs text-slate-500">Plants</span></div>
                <div className="text-lg font-bold text-slate-900">{summary?.plant_count ?? 0}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle size={12} className={utilization > 90 ? "text-red-500" : "text-emerald-500"} /><span className="text-xs text-slate-500">Avg Capacity/Week</span></div>
                <div className={`text-lg font-bold ${utilization > 90 ? "text-red-600" : "text-slate-900"}`}>{Number(summary?.average_capacity_units ?? 0).toLocaleString()}</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Capacity by Product */}
          {capacity.length > 0 && (() => {
            const aggCapacity = Object.values(
              capacity.reduce((acc, c) => {
                const key = c.sku_code || c.product_id;
                if (!acc[key]) {
                  acc[key] = { ...c, capacity_units: 0, plant_ids: [], weeks: [] };
                }
                acc[key].capacity_units += Number(c.capacity_units || 0);
                if (c.plant_id && !acc[key].plant_ids.includes(c.plant_id)) acc[key].plant_ids.push(c.plant_id);
                if (c.week && !acc[key].weeks.includes(c.week)) acc[key].weeks.push(c.week);
                return acc;
              }, {})
            );
            return (
              <AnimatedCard delay={0.15}>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Capacity by Product</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {aggCapacity.map((c, i) => (
                        <div key={c.sku_code || i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{c.sku_code}</span>
                            <Badge variant="blue">{c.weeks?.length || 1} wk{c.weeks?.length > 1 ? "s" : ""}</Badge>
                          </div>
                          <div className="text-xs text-slate-500">{c.product_name}</div>
                          <div className="text-xs text-slate-400">Plants: {c.plant_ids?.join(", ") || "—"}</div>
                          <div className="mt-1 text-lg font-bold text-slate-900">{Number(c.capacity_units || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">units</span></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            );
          })()}

          {/* Search */}
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Search by SKU, product, or plant..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Production Table */}
          {sorted.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No production data found.</div>
          ) : (
            <AnimatedCard delay={0.2}>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Plants</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("capacity_units")}>Capacity {sortKey === "capacity_units" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Weeks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sorted.map((p, i) => (
                      <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{p.sku_code}</td>
                        <td className="px-3 py-2 text-slate-600">{p.product_name}</td>
                        <td className="px-3 py-2 text-slate-700">{p.plant_ids?.join(", ") || p.plant_id || "—"}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{Number(p.capacity_units || 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-center text-slate-500">{p.weeks?.length || 1}</td>
                      </motion.tr>
                    ))}
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
