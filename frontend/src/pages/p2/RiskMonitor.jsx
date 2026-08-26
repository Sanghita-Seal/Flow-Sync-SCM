import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useCycle } from "../../context/CycleContext";
import { getProcurementRisk } from "../../features/p2/procurement/procurement.service";
import StatusBadge from "../../components/ui/StatusBadge";

const RISK_STYLES = {
  Critical: "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function RiskMonitor() {
  const navigate = useNavigate();
  const { selectedCycleId, loading: cycleLoading } = useCycle();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProcurementRisk()
      .then(setRisks)
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  return (
    <PageWrapper title="Risk Monitor" description="Procurement plans at risk due to E2 execution delays.">
      {cycleLoading || loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading risk data...</div>
      ) : risks.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">No procurement risks found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Procurement Risk</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Required (m)</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended (m)</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lead Time</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{risk.sku_code}</td>
                  <td className="px-4 py-2.5 text-slate-700">{risk.product_name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_STYLES[risk.risk_level] || RISK_STYLES.Low}`}>
                      {risk.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{Number(risk.required_fabric_m || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-700">{Number(risk.recommended_order_qty_m || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-700">{risk.lead_time_weeks || "—"} weeks</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => navigate(`/p2/procurement/${risk.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
