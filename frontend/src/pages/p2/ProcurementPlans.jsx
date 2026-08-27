import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Activity } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { useCycle } from "../../context/CycleContext";
import { getProcurement } from "../../features/p2/procurement/procurement.service";

const RISK_VARIANT = {
  Critical: "rose",
  High: "amber",
  Medium: "amber",
  Low: "emerald",
};

export default function ProcurementPlans() {
  const navigate = useNavigate();
  const { selectedCycleId, cycles, setSelectedCycleId, loading: cycleLoading } = useCycle();
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
        <Select
          value={selectedCycleId || ""}
          onChange={(e) => setSelectedCycleId(e.target.value)}
          className="w-48"
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cycle_name || c.name} ({c.status})
            </option>
          ))}
        </Select>
      }
    >
      {cycleLoading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <input
              type="text"
              placeholder="Search SKU / Product / Fabric / Supplier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No procurement plans found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">Product</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">Fabric</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden lg:table-cell">Supplier</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Qty (m)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Risk</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <AnimatePresence>
                    {filtered.map((plan, i) => (
                      <motion.tr
                        key={plan.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => navigate(`/p2/procurement/${plan.id}`)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-900 font-medium">{plan.sku_code}</td>
                        <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{plan.product_name}</td>
                        <td className="px-4 py-2.5 text-slate-700 hidden md:table-cell">{plan.fabric_type}</td>
                        <td className="px-4 py-2.5 text-slate-700 hidden lg:table-cell">{plan.supplier_name}</td>
                        <td className="px-4 py-2.5 text-slate-700">{Number(plan.recommended_order_qty_m || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={RISK_VARIANT[plan.risk_level] || "emerald"}>{plan.risk_level}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{plan.status}</td>
                        <td className="px-4 py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/p2/procurement/${plan.id}/execution`);
                            }}
                          >
                            <Activity size={12} className="mr-1" />
                            Execution
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
