import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Tag, TrendingDown, Percent, Package } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { getMarkdown, getMarkdownSummary } from "../../features/p2/markdown/markdown.service";
import { getInventory } from "../../features/p2/inventory/inventory.service";

export default function MarkdownDecisionCenter() {
  const [markdown, setMarkdown] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("excess_inventory_units");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMarkdown().catch(() => []),
      getMarkdownSummary().catch(() => null),
      getInventory().catch(() => []),
    ]).then(([m, s, inventoryData]) => {
      const markdownData = Array.isArray(m) ? m : [];
      const inventoryList = Array.isArray(inventoryData) ? inventoryData : [];

      const inventoryByProduct = new Map();
      for (const item of inventoryList) {
        inventoryByProduct.set(item.product_id, item);
      }

      const enriched = markdownData.map((item) => {
        const inv = inventoryByProduct.get(item.product_id);
        const units = inv ? Number(inv.current_inventory_units) : null;
        return {
          ...item,
          excess_inventory_units: units,
        };
      });

      setMarkdown(enriched);
      setSummary(s);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = markdown.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.sku_code && m.sku_code.toLowerCase().includes(q)) ||
      (m.product_name && m.product_name.toLowerCase().includes(q)) ||
      (m.reason && m.reason.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey] == null ? -Infinity : Number(a[sortKey] || 0);
    const bVal = b[sortKey] == null ? -Infinity : Number(b[sortKey] || 0);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function toggleSort(key) {
    if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); } else { setSortKey(key); setSortDir("desc"); }
  }

  const productCount = summary?.product_count ?? 0;
  const avgDiscount = summary?.average_markdown_pct ?? 0;
  const maxDiscount = summary?.maximum_markdown_pct ?? 0;
  const totalUnitsAtRisk = markdown.reduce(
    (sum, m) => sum + (m.excess_inventory_units ?? 0),
    0
  );

  return (
    <PageWrapper
      title="Markdown Decision Center"
      description="Markdown recommendations for slow-moving and excess inventory."
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <AnimatedCard>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Tag size={12} className="text-blue-500" /><span className="text-xs text-slate-500">Products</span></div>
                <div className="text-lg font-bold text-slate-900">{productCount}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Package size={12} className="text-rose-500" /><span className="text-xs text-slate-500">Total Units at Risk</span></div>
                <div className="text-lg font-bold text-rose-600">{totalUnitsAtRisk > 0 ? totalUnitsAtRisk.toLocaleString() : "—"}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><Percent size={12} className="text-emerald-500" /><span className="text-xs text-slate-500">Avg Discount</span></div>
                <div className="text-lg font-bold text-emerald-600">{Number(avgDiscount).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1"><TrendingDown size={12} className="text-rose-500" /><span className="text-xs text-slate-500">Max Discount</span></div>
                <div className="text-lg font-bold text-rose-600">{Number(maxDiscount).toFixed(1)}%</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Discount Distribution */}
          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="text-sm">Markdown Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "0–10%", min: 0, max: 10, color: "bg-emerald-400" },
                    { label: "10–20%", min: 10, max: 20, color: "bg-blue-400" },
                    { label: "20–30%", min: 20, max: 30, color: "bg-amber-400" },
                    { label: "30–50%", min: 30, max: 50, color: "bg-orange-400" },
                    { label: "50%+", min: 50, max: 101, color: "bg-red-400" },
                  ].map((band) => {
                    const count = markdown.filter((m) => {
                      const pct = Number(m.markdown_pct || 0);
                      return pct >= band.min && pct < band.max;
                    }).length;
                    const maxCount = Math.max(...[0, 1, 2, 3, 4].map((bi) => {
                      const b = [{ min: 0, max: 10 }, { min: 10, max: 20 }, { min: 20, max: 30 }, { min: 30, max: 50 }, { min: 50, max: 101 }][bi];
                      return markdown.filter((m) => { const pct = Number(m.markdown_pct || 0); return pct >= b.min && pct < b.max; }).length;
                    }), 1);
                    const pctWidth = (count / maxCount) * 100;
                    return (
                      <div key={band.label} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-12 shrink-0">{band.label}</span>
                        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${band.color} rounded-full`} style={{ width: `${pctWidth}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Search */}
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Search by SKU, product, or reason..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Markdown Table */}
          {sorted.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No markdown data found.</div>
          ) : (
            <AnimatedCard delay={0.2}>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("excess_inventory_units")}>Units at Risk {sortKey === "excess_inventory_units" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-blue-600" onClick={() => toggleSort("markdown_pct")}>Markdown % {sortKey === "markdown_pct" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Week</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Reason</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sorted.map((m, i) => {
                      const pct = Number(m.markdown_pct || 0);
                      const units = m.excess_inventory_units;
                      return (
                        <motion.tr key={m.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-900">{m.sku_code}</td>
                          <td className="px-3 py-2 text-slate-600">{m.product_name}</td>
                          <td className="px-3 py-2 text-right">
                            {units != null ? (
                              <span className="inline-flex flex-col items-end leading-tight">
                                <span className="text-base font-bold text-rose-600">{units.toLocaleString()}</span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase">units</span>
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-slate-600">{pct > 0 ? `${pct.toFixed(1)}%` : "—"}</td>
                          <td className="px-3 py-2 text-slate-500">{m.week || "—"}</td>
                          <td className="px-3 py-2 text-slate-500 text-xs">{m.reason || "—"}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant={pct >= 50 ? "rose" : pct >= 30 ? "amber" : pct >= 15 ? "blue" : "emerald"}>
                              {pct >= 50 ? "URGENT" : pct >= 30 ? "HIGH" : pct >= 15 ? "MEDIUM" : "LOW"}
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
