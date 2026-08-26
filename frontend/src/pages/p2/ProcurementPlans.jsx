import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useCycle } from "../../context/CycleContext";
import { getProcurement } from "../../features/p2/procurement/procurement.service";

const RISK_STYLES = {
  Critical: "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function ProcurementPlans() {
  const navigate = useNavigate();
  const { selectedCycleId, selectedCycle, cycles, setSelectedCycleId, loading: cycleLoading } = useCycle();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    getProcurement({ cycleId: selectedCycleId })
      .then(setPlans)
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  const filtered = plans.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.sku_code && p.sku_code.toLowerCase().includes(q)) ||
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.fabric_type && p.fabric_type.toLowerCase().includes(q)) ||
      (p.supplier_name && p.supplier_name.toLowerCase().includes(q))
    );
  });

  return (
    <PageWrapper
      title="Procurement Plans"
      description="P2 planning decisions for required supply."
      actions={
        <select
          value={selectedCycleId || ""}
          onChange={(e) => setSelectedCycleId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cycle_name || c.name} ({c.status})
            </option>
          ))}
        </select>
      }
    >
      {cycleLoading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading cycles...</div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search SKU / Product / Fabric / Supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-200 text-sm mb-4"
          />

          {loading ? (
            <div className="text-sm text-slate-500 py-8 text-center">Loading procurement plans...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No procurement plans found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fabric</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Qty (m)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Risk</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((plan) => (
                    <tr
                      key={plan.id}
                      onClick={() => navigate(`/p2/procurement/${plan.id}`)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{plan.sku_code}</td>
                      <td className="px-4 py-2.5 text-slate-700">{plan.product_name}</td>
                      <td className="px-4 py-2.5 text-slate-700">{plan.fabric_type}</td>
                      <td className="px-4 py-2.5 text-slate-700">{plan.supplier_name}</td>
                      <td className="px-4 py-2.5 text-slate-700">{Number(plan.recommended_order_qty_m || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_STYLES[plan.risk_level] || RISK_STYLES.Low}`}>
                          {plan.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">{plan.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
