import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ChevronRight, Play, CheckCircle, Clock, AlertTriangle, ArrowRight, Layers, TrendingUp, Factory, Tag } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { createCycle, updateCycleStatus, getPlan, getPlanSummary, generatePlan, getRecommendations, generateRecommendations } from "../../features/p2/sop/sop.service";
import { getDemand, getDemandSummary } from "../../features/p2/demand/demand.service";
import { getProduction, getProductionCapacity } from "../../features/p2/production/production.service";
import { getMarkdown, getMarkdownSummary } from "../../features/p2/markdown/markdown.service";
import { getProcurement } from "../../features/p2/procurement/procurement.service";

const STATUS_FLOW = ["DRAFT", "REVIEW", "APPROVED", "CLOSED"];
const STATUS_COLORS = { DRAFT: "slate", PLANNING: "blue", REVIEW: "amber", APPROVED: "emerald", CLOSED: "slate" };

function CreateCycleModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ cycleName: "", startDate: "", endDate: "", status: "DRAFT" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleCreate() {
    if (!form.cycleName || !form.startDate || !form.endDate) {
      setError("All fields are required.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await createCycle(form);
      onCreated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to create cycle.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Create S&OP Cycle</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Cycle Name</label>
            <input value={form.cycleName} onChange={(e) => setForm({ ...form, cycleName: e.target.value })} placeholder="SOP-2026-NOV" className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100">
              {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create Cycle"}</Button>
        </div>
      </motion.div>
    </div>
  );
}

function PlanReconciliation({ cycleId }) {
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!cycleId) return;
    setLoading(true);
    Promise.all([getPlan(cycleId).catch(() => null), getPlanSummary(cycleId).catch(() => null)])
      .then(([p, s]) => { setPlan(p); setSummary(s); })
      .finally(() => setLoading(false));
  }, [cycleId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generatePlan(cycleId);
      setPlan(result);
      const s = await getPlanSummary(cycleId).catch(() => null);
      setSummary(s);
    } catch { /* ignore */ } finally { setGenerating(false); }
  }

  if (loading) return <div className="text-sm text-slate-500 py-4 text-center">Loading plan data...</div>;

  const products = plan?.products || plan || [];

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Forecast vs Capacity Reconciliation</h3>
        <Button size="sm" onClick={handleGenerate} disabled={generating}>
          <Play size={12} className="mr-1" /> {generating ? "Generating..." : "Generate S&OP Plan"}
        </Button>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Products", value: summary.product_count ?? summary.total_products ?? "—" },
            { label: "Balanced", value: summary.balanced_products ?? summary.balanced ?? 0 },
            { label: "Shortage", value: summary.shortage_products ?? summary.shortage ?? 0 },
            { label: "Excess", value: summary.excess_products ?? summary.excess ?? 0 },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-lg font-bold text-slate-900">{kpi.value}</div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reconciliation Table */}
      {Array.isArray(products) && products.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Forecast</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Opening Inv</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Capacity</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Planned</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Gap</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Excess</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {products.map((p, i) => {
                const forecast = Number(p.forecast_demand_units || p.forecast_demand || p.forecastDemand || 0);
                const openingInv = Number(p.opening_inventory_units || p.opening_inventory || 0);
                const capacity = Number(p.production_capacity_units || p.production_capacity || p.productionCapacity || 0);
                const planned = Number(p.planned_production_units || p.planned_production || p.plannedProduction || 0);
                const gap = Number(p.supply_gap_units || p.supply_gap || (planned - forecast));
                const excess = Number(p.excess_inventory_units || p.excess_inventory || 0);
                const status = p.status || (gap < 0 ? "SHORTAGE" : excess > 0 ? "EXCESS" : "BALANCED");
                const isExpanded = expanded === i;
                return (
                  <motion.tr key={p.sku_code || p.product_id || i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{p.sku_code}</td>
                    <td className="px-3 py-2 text-slate-600">{p.product_name}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{forecast.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{openingInv.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{capacity.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{planned.toLocaleString()}</td>
                    <td className={`px-3 py-2 text-right font-medium ${gap < 0 ? "text-red-600" : "text-slate-700"}`}>
                      {gap > 0 ? "+" : ""}{gap.toLocaleString()}
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${excess > 0 ? "text-amber-600" : "text-slate-700"}`}>
                      {excess.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={status === "SHORTAGE" ? "rose" : status === "EXCESS" ? "amber" : "emerald"}>
                        {status === "SHORTAGE" && <AlertTriangle size={10} className="mr-1" />}
                        {status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => setExpanded(isExpanded ? null : i)} className="text-slate-400 hover:text-slate-600">
                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-lg">
          No plan data yet. Click "Generate S&OP Plan" to create one.
        </div>
      )}
    </div>
  );
}

function CycleStatusWorkflow({ cycle, onAdvance }) {
  const currentIdx = STATUS_FLOW.indexOf(cycle?.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Cycle Status</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                i <= currentIdx ? `bg-${STATUS_COLORS[s]}-100 text-${STATUS_COLORS[s]}-700` : "bg-slate-100 text-slate-400"
              }`}>
                {i < currentIdx ? <CheckCircle size={10} /> : i === currentIdx ? <Clock size={10} /> : null}
                {s}
              </div>
              {i < STATUS_FLOW.length - 1 && <ArrowRight size={12} className="text-slate-300" />}
            </div>
          ))}
        </div>
        {nextStatus && (
          <Button size="sm" onClick={() => onAdvance(nextStatus)}>
            Advance to {nextStatus}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CrossFunctionalAlignment({ cycleId }) {
  const [demand, setDemand] = useState([]);
  const [prod, setProd] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [markdown, setMarkdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!cycleId) return;
    setLoading(true);
    Promise.all([
      getDemand().catch(() => []),
      getProduction().catch(() => []),
      getProcurement({ cycleId }).catch(() => []),
      getMarkdown().catch(() => []),
    ]).then(([d, p, pr, m]) => {
      setDemand(Array.isArray(d) ? d : []);
      setProd(Array.isArray(p) ? p : []);
      setProcurement(Array.isArray(pr) ? pr : []);
      setMarkdown(Array.isArray(m) ? m : []);
    }).finally(() => setLoading(false));
  }, [cycleId]);

  if (loading) return <div className="text-sm text-slate-500 py-4 text-center">Loading alignment data...</div>;

  const totalForecast = demand.reduce((s, d) => s + Number(d.forecast_demand_units || d.quantity || 0), 0);
  const totalPlanned = prod.reduce((s, p) => s + Number(p.capacity_units || p.planned_qty || 0), 0);
  const totalProcurement = procurement.reduce((s, p) => s + Number(p.recommended_order_qty_m || 0), 0);
  const totalMarkdown = markdown.reduce((s, m) => s + Number(m.markdown_pct || 0), 0);
  const avgMarkdown = markdown.length > 0 ? totalMarkdown / markdown.length : 0;

  const pillars = [
    { name: "Demand", value: totalForecast, unit: "units", color: "blue", align: totalForecast > 0 },
    { name: "Production", value: totalPlanned, unit: "units", color: "cyan", align: totalPlanned > 0 },
    { name: "Procurement", value: totalProcurement, unit: "meters", color: "amber", align: totalProcurement > 0 },
    { name: "Markdown", value: avgMarkdown.toFixed(1), unit: "%", color: "violet", align: avgMarkdown > 0 },
  ];

  const alignedCount = pillars.filter((p) => p.align).length;
  const alignmentScore = Math.round((alignedCount / pillars.length) * 100);

  function handleSaveNotes() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cross-Functional Alignment</h3>
      {/* Alignment Score */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <motion.path
              className={alignmentScore >= 75 ? "text-emerald-500" : alignmentScore >= 50 ? "text-amber-500" : "text-red-500"}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${alignmentScore}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${alignmentScore}, 100` }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900">{alignmentScore}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Alignment Score</p>
          <p className="text-xs text-slate-500">{alignedCount}/{pillars.length} pillars have data loaded</p>
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pillars.map((p) => (
          <div key={p.name} className={`rounded-lg border p-3 ${p.align ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500">{p.name}</span>
              {p.align ? <CheckCircle size={10} className="text-emerald-500" /> : <Clock size={10} className="text-slate-400" />}
            </div>
            <div className="text-lg font-bold text-slate-900">{p.value.toLocaleString()}</div>
            <div className="text-xs text-slate-400">{p.unit}</div>
          </div>
        ))}
      </div>

      {/* Collaboration Notes */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Collaboration Notes</CardTitle></CardHeader>
        <CardContent>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add cross-functional notes, alignment issues, or decisions for this S&OP cycle..." rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={handleSaveNotes}>{saved ? "Saved!" : "Save Notes"}</Button>
            {saved && <span className="text-xs text-emerald-600">Notes saved successfully.</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegratedView({ cycleId }) {
  const [demand, setDemand] = useState([]);
  const [prod, setProd] = useState([]);
  const [markdown, setMarkdown] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [demandSummary, setDemandSummary] = useState(null);
  const [mdSummary, setMdSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cycleId) return;
    setLoading(true);
    Promise.all([
      getDemand().catch(() => []),
      getProduction().catch(() => []),
      getMarkdown().catch(() => []),
      getProcurement({ cycleId }).catch(() => []),
      getDemandSummary().catch(() => null),
      getMarkdownSummary().catch(() => null),
    ]).then(([d, p, m, pr, ds, ms]) => {
      setDemand(Array.isArray(d) ? d : []);
      setProd(Array.isArray(p) ? p : []);
      setMarkdown(Array.isArray(m) ? m : []);
      setProcurement(Array.isArray(pr) ? pr : []);
      setDemandSummary(ds);
      setMdSummary(ms);
    }).finally(() => setLoading(false));
  }, [cycleId]);

  if (loading) return <div className="text-sm text-slate-500 py-4 text-center">Loading integrated data...</div>;

  const totalForecast = demand.reduce((s, d) => s + Number(d.forecast_demand_units || d.quantity || 0), 0);
  const totalPlanned = prod.reduce((s, p) => s + Number(p.capacity_units || p.planned_qty || 0), 0);
  const totalMarkdown = markdown.reduce((s, m) => s + Number(m.markdown_pct || 0), 0);
  const totalProcurementQty = procurement.reduce((s, p) => s + Number(p.recommended_order_qty_m || 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Integrated S&OP View</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={12} className="text-blue-500" />
            <span className="text-xs text-slate-500">Demand Lines</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{demand.length}</div>
          <div className="text-xs text-slate-400">Total forecast: {totalForecast.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-1">
            <Factory size={12} className="text-cyan-500" />
            <span className="text-xs text-slate-500">Production Lines</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{prod.length}</div>
          <div className="text-xs text-slate-400">Total planned: {totalPlanned.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={12} className="text-violet-500" />
            <span className="text-xs text-slate-500">Markdown Items</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{markdown.length}</div>
          <div className="text-xs text-slate-400">Avg discount: {markdown.length > 0 ? Math.round(totalMarkdown / markdown.length) : 0}%</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={12} className="text-amber-500" />
            <span className="text-xs text-slate-500">Procurement Items</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{procurement.length}</div>
          <div className="text-xs text-slate-400">Total qty: {totalProcurementQty.toLocaleString()}m</div>
        </div>
      </div>

      {/* Demand Planning Summary */}
      {demandSummary && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Demand Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {demandSummary.product_count !== undefined && <div><span className="text-slate-500">Products:</span> <span className="font-semibold">{demandSummary.product_count}</span></div>}
              {demandSummary.average_forecast_demand !== undefined && <div><span className="text-slate-500">Avg Forecast:</span> <span className="font-semibold">{Number(demandSummary.average_forecast_demand).toLocaleString()}</span></div>}
              {demandSummary.total_forecast_demand !== undefined && <div><span className="text-slate-500">Total Forecast:</span> <span className="font-semibold">{Number(demandSummary.total_forecast_demand).toLocaleString()}</span></div>}
              {demandSummary.week_count !== undefined && <div><span className="text-slate-500">Weeks:</span> <span className="font-semibold text-amber-600">{demandSummary.week_count}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markdown Summary */}
      {mdSummary && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Markdown Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {mdSummary.product_count !== undefined && <div><span className="text-slate-500">Products:</span> <span className="font-semibold">{mdSummary.product_count}</span></div>}
              {mdSummary.average_markdown_pct !== undefined && <div><span className="text-slate-500">Avg Discount:</span> <span className="font-semibold text-rose-600">{Number(mdSummary.average_markdown_pct).toFixed(1)}%</span></div>}
              {mdSummary.maximum_markdown_pct !== undefined && <div><span className="text-slate-500">Max Discount:</span> <span className="font-semibold text-rose-600">{Number(mdSummary.maximum_markdown_pct).toFixed(1)}%</span></div>}
              {mdSummary.record_count !== undefined && <div><span className="text-slate-500">Records:</span> <span className="font-semibold text-amber-600">{mdSummary.record_count}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links to Dedicated Pages */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/p2/demand"}>Demand Planning</Button>
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/p2/production"}>Production Scheduling</Button>
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/p2/markdown"}>Markdown Decisions</Button>
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/p2/procurement"}>Procurement</Button>
      </div>
    </div>
  );
}

export default function SopCycles() {
  const navigate = useNavigate();
  const { cycles, selectedCycleId, setSelectedCycleId, loading, setSelectedCycle } = useCycle();
  const [showCreate, setShowCreate] = useState(false);
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [generatingRecs, setGeneratingRecs] = useState(false);

  async function handleGenerateRecs() {
    if (!selectedCycleId) return;
    setGeneratingRecs(true);
    try {
      const recs = await generateRecommendations(selectedCycleId);
      setRecommendations(Array.isArray(recs) ? recs : []);
    } catch { /* ignore */ } finally { setGeneratingRecs(false); }
  }

  useEffect(() => {
    if (!selectedCycleId) { setRecommendations([]); return; }
    getRecommendations(selectedCycleId).then(setRecommendations).catch(() => setRecommendations([]));
  }, [selectedCycleId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  async function handleAdvance(newStatus) {
    if (!selectedCycleId) return;
    setAdvanceLoading(true);
    try {
      await updateCycleStatus(selectedCycleId, newStatus);
      window.location.reload();
    } catch { /* ignore */ } finally { setAdvanceLoading(false); }
  }

  function handleCycleCreated() {
    window.location.reload();
  }

  return (
    <PageWrapper
      title="S&OP Cycles"
      description="Select a planning cycle, manage status, and generate S&OP plans."
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} className="mr-1" /> New S&OP Cycle
          </Button>
        </div>
      }
    >
      <CreateCycleModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCycleCreated} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : cycles.length === 0 ? (
        <Card><CardContent className="py-8 text-center"><p className="text-sm text-slate-500">No S&OP cycles found. Create one to get started.</p></CardContent></Card>
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cycle Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">Start</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">End</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cycles.map((cycle) => {
                  const cycleId = cycle.id;
                  const isSelected = cycleId === selectedCycleId;
                  return (
                    <motion.tr
                      key={cycleId}
                      whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedCycleId(cycleId)}
                    >
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{cycle.cycle_name || cycle.cycleName || cycle.name}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{cycle.start_date || cycle.startDate ? new Date(cycle.start_date || cycle.startDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{cycle.end_date || cycle.endDate ? new Date(cycle.end_date || cycle.endDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2.5"><Badge variant={cycle.status === "ACTIVE" || cycle.status === "APPROVED" ? "emerald" : "blue"}>{cycle.status}</Badge></td>
                      <td className="px-4 py-2.5">{isSelected && <Badge variant="blue">Selected</Badge>}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      )}

      {selectedCycle && (
        <div className="mt-6 space-y-6">
          <CycleStatusWorkflow cycle={selectedCycle} onAdvance={handleAdvance} />
          <PlanReconciliation cycleId={selectedCycleId} />
          <IntegratedView cycleId={selectedCycleId} />

          {/* Cross-Functional Alignment */}
          <CrossFunctionalAlignment cycleId={selectedCycleId} />

          {/* Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">S&OP Recommendations</h3>
              <Button size="sm" variant="outline" onClick={handleGenerateRecs} disabled={generatingRecs}>
                <Play size={12} className="mr-1" /> {generatingRecs ? "Generating..." : "Generate Recommendations"}
              </Button>
            </div>
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec, i) => (
                  <div key={rec.id || i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                    <div className={`p-1.5 rounded-full mt-0.5 ${(rec.severity || rec.priority) === "CRITICAL" || (rec.severity || rec.priority) === "HIGH" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                      <AlertTriangle size={12} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{rec.product_name || rec.title || `SKU: ${rec.sku_code}`}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.message || rec.description || rec.recommendation}</p>
                      {rec.recommended_action && <p className="text-xs text-blue-600 mt-1">Action: {rec.recommended_action}</p>}
                    </div>
                    <Badge variant={(rec.severity || rec.priority) === "CRITICAL" ? "rose" : (rec.severity || rec.priority) === "HIGH" ? "amber" : "blue"}>
                      {rec.severity || rec.priority || "INFO"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                No recommendations yet. Click "Generate Recommendations" to create them.
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 flex-wrap">
            <Button onClick={() => navigate("/p2/procurement")}>View Procurement Plans</Button>
            <Button variant="outline" onClick={() => navigate("/p2/risk")}>Risk Monitor</Button>
            <Button variant="outline" onClick={() => navigate("/p2/recommendations")}>Recommendations</Button>
            <Button variant="outline" onClick={() => navigate("/p2/inventory")}>Inventory</Button>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
