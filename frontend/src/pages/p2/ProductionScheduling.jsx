import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, TrendingUp, Factory, AlertTriangle, ArrowUpDown, Search } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { getPlan, getPlanSummary } from "../../features/p2/sop/sop.service";

const STATUS_VARIANT = { BALANCED: "emerald", SHORTAGE: "rose", EXCESS: "amber" };

function computeLine(p) {
  const forecast = Number(p.forecast_demand_units || 0);
  const opening = Number(p.opening_inventory_units || 0);
  const capacity = Number(p.production_capacity_units || 0);
  const planned = Number(p.planned_production_units || 0);
  const gap = Number(p.supply_gap_units || 0);
  const required = Math.max(0, forecast - opening);
  const overCapacity = capacity > required ? capacity - required : 0;
  const displayGap = gap > 0 ? gap : -overCapacity;
  const utilization = capacity > 0 ? Math.round((planned / capacity) * 100) : 0;
  return { ...p, forecast, opening, capacity, planned, required, gap: displayGap, utilization, status: p.status || "BALANCED" };
}

function UtilizationBar({ pct, status }) {
  const color = status === "SHORTAGE" ? "bg-rose-500" : status === "EXCESS" ? "bg-amber-500" : "bg-emerald-500";
  const bgColor = status === "SHORTAGE" ? "bg-rose-100" : status === "EXCESS" ? "bg-amber-100" : "bg-emerald-100";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function ProductionScheduling() {
  const { selectedCycleId, cycles, setSelectedCycleId, loading: cycleLoading } = useCycle();
  const [planLines, setPlanLines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("required");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    Promise.all([
      getPlan(selectedCycleId).catch(() => []),
      getPlanSummary(selectedCycleId).catch(() => null),
    ]).then(([plan, sum]) => {
      setPlanLines(Array.isArray(plan) ? plan : []);
      setSummary(sum);
    }).finally(() => setLoading(false));
  }, [selectedCycleId]);

  const lines = planLines.map(computeLine);

  const filtered = lines.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.sku_code && p.sku_code.toLowerCase().includes(q)) || (p.product_name && p.product_name.toLowerCase().includes(q));
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = Number(a[sortKey] || 0);
    const bVal = Number(b[sortKey] || 0);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function toggleSort(key) {
    if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); } else { setSortKey(key); setSortDir("desc"); }
  }

  const totalRequired = summary ? lines.reduce((s, p) => s + p.required, 0) : 0;
  const totalPlanned = summary ? Number(summary.total_planned_production || 0) : 0;
  const totalCapacity = summary ? Number(summary.total_production_capacity || 0) : 0;
  const totalGap = summary ? Number(summary.total_supply_gap || 0) : 0;
  const totalUtilization = totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0;

  const shortageCount = summary?.shortage_products ?? lines.filter((p) => p.status === "SHORTAGE").length;
  const excessCount = summary?.excess_products ?? lines.filter((p) => p.status === "EXCESS").length;
  const balancedCount = summary?.balanced_products ?? lines.filter((p) => p.status === "BALANCED").length;

  return (
    <PageWrapper
      title="Production Scheduling"
      description="Planned production requirements, capacity and utilization for the selected S&OP cycle."
      actions={
        <Select value={selectedCycleId || ""} onChange={(e) => setSelectedCycleId(e.target.value)} className="w-48">
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>{c.cycle_name || c.name} ({c.status})</option>
          ))}
        </Select>
      }
    >
      {cycleLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : lines.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500 mb-2">No production plan data for this cycle.</p>
          <p className="text-xs text-slate-400">Generate an S&OP plan first from the S&OP Cycles page.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <AnimatedCard>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Package size={12} className="text-blue-500" /><span className="text-xs text-slate-500">Total Products</span></div>
                <div className="text-lg font-bold text-slate-900">{summary?.product_count ?? lines.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  <span className="text-emerald-600">{balancedCount} balanced</span>
                  {" · "}
                  <span className="text-rose-600">{shortageCount} shortage</span>
                  {" · "}
                  <span className="text-amber-600">{excessCount} excess</span>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><TrendingUp size={12} className="text-blue-500" /><span className="text-xs text-slate-500">Required Production</span></div>
                <div className="text-lg font-bold text-slate-900">{totalRequired.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">units needed</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Factory size={12} className="text-emerald-500" /><span className="text-xs text-slate-500">Planned Production</span></div>
                <div className="text-lg font-bold text-slate-900">{totalPlanned.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalCapacity.toLocaleString()} capacity</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} className={totalGap > 0 ? "text-rose-500" : "text-emerald-500"} />
                  <span className="text-xs text-slate-500">Production Gap</span>
                </div>
                <div className={`text-lg font-bold ${totalGap > 0 ? "text-rose-600" : "text-slate-900"}`}>
                  {totalGap > 0 ? `${totalGap.toLocaleString()} short` : totalGap < 0 ? `${Math.abs(totalGap).toLocaleString()} over` : "0"}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalUtilization}% utilization</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Main Section — Production Requirement vs Capacity */}
          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Production Requirement vs Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("required")}>Required {sortKey === "required" ? (sortDir === "asc" ? "↑" : "↓") : <ArrowUpDown size={10} className="inline" />}</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("planned")}>Planned {sortKey === "planned" ? (sortDir === "asc" ? "↑" : "↓") : <ArrowUpDown size={10} className="inline" />}</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("capacity")}>Capacity {sortKey === "capacity" ? (sortDir === "asc" ? "↑" : "↓") : <ArrowUpDown size={10} className="inline" />}</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("gap")}>Gap {sortKey === "gap" ? (sortDir === "asc" ? "↑" : "↓") : <ArrowUpDown size={10} className="inline" />}</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("utilization")}>Util% {sortKey === "utilization" ? (sortDir === "asc" ? "↑" : "↓") : <ArrowUpDown size={10} className="inline" />}</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {sorted.map((p, i) => (
                        <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-900">{p.sku_code}</td>
                          <td className="px-3 py-2 text-slate-600">{p.product_name}</td>
                          <td className="px-3 py-2 text-right text-slate-700 font-medium">{p.required.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-700 font-medium">{p.planned.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-700">{p.capacity.toLocaleString()}</td>
                          <td className={`px-3 py-2 text-right font-medium ${p.gap > 0 ? "text-rose-600" : p.gap < 0 ? "text-amber-600" : "text-slate-500"}`}>
                            {p.gap > 0 ? `+${p.gap.toLocaleString()}` : p.gap < 0 ? p.gap.toLocaleString() : "0"}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700">{p.utilization}%</td>
                          <td className="px-3 py-2 text-center"><Badge variant={STATUS_VARIANT[p.status] || "emerald"}>{p.status}</Badge></td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr className="font-semibold">
                        <td className="px-3 py-2 text-slate-900" colSpan={2}>Total</td>
                        <td className="px-3 py-2 text-right text-slate-900">{totalRequired.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{totalPlanned.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{totalCapacity.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-right ${totalGap > 0 ? "text-rose-600" : "text-slate-900"}`}>
                          {totalGap > 0 ? `+${totalGap.toLocaleString()}` : "0"}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-900">{totalUtilization}%</td>
                        <td className="px-3 py-2 text-center"><Badge variant={totalGap > 0 ? "rose" : "emerald"}>{totalGap > 0 ? "SHORTAGE" : "BALANCED"}</Badge></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Capacity Utilization */}
          <AnimatedCard delay={0.15}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Capacity Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sorted.map((p, i) => (
                    <div key={p.id || i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-700 w-24 shrink-0 truncate" title={p.sku_code}>{p.sku_code}</span>
                      <div className="flex-1"><UtilizationBar pct={p.utilization} status={p.status} /></div>
                      <Badge variant={STATUS_VARIANT[p.status] || "emerald"} className="shrink-0 text-[10px]">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Capacity by Product Cards */}
          <AnimatedCard delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Capacity by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sorted.map((p, i) => (
                    <div key={p.id || i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{p.sku_code}</span>
                        <Badge variant={STATUS_VARIANT[p.status] || "emerald"}>{p.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{p.product_name}</div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="text-slate-500">Required</div>
                        <div className="text-right font-semibold text-slate-900">{p.required.toLocaleString()}</div>
                        <div className="text-slate-500">Planned</div>
                        <div className="text-right font-medium text-slate-700">{p.planned.toLocaleString()}</div>
                        <div className="text-slate-500">Capacity</div>
                        <div className="text-right font-medium text-slate-700">{p.capacity.toLocaleString()}</div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className={`font-semibold ${p.gap > 0 ? "text-rose-600" : p.gap < 0 ? "text-amber-600" : "text-slate-500"}`}>
                          Gap: {p.gap > 0 ? `+${p.gap.toLocaleString()}` : p.gap < 0 ? p.gap.toLocaleString() : "0"}
                        </span>
                        <span className="text-slate-500">{p.utilization}% util</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Search + Detail Table */}
          <AnimatedCard delay={0.25}>
            <div className="flex gap-3 items-center mb-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by SKU or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="text-sm text-slate-500 py-8 text-center">No products match your search.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Forecast</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Opening Inv</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Required</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Planned</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Capacity</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Gap</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Util%</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sorted.map((p, i) => (
                      <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{p.sku_code}</td>
                        <td className="px-3 py-2 text-slate-600">{p.product_name}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{p.forecast.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{p.opening.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{p.required.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{p.planned.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{p.capacity.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-right font-medium ${p.gap > 0 ? "text-rose-600" : p.gap < 0 ? "text-amber-600" : "text-slate-500"}`}>
                          {p.gap > 0 ? `+${p.gap.toLocaleString()}` : p.gap < 0 ? p.gap.toLocaleString() : "0"}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">{p.utilization}%</td>
                        <td className="px-3 py-2 text-center"><Badge variant={STATUS_VARIANT[p.status] || "emerald"}>{p.status}</Badge></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatedCard>
        </>
      )}
    </PageWrapper>
  );
}
