import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useCycle } from "../../context/CycleContext";
import { getRecommendations, getRecommendationSummary } from "../../features/p2/sop/sop.service";
import StatusBadge from "../../components/ui/StatusBadge";

const SEVERITY_STYLES = {
  HIGH: "bg-rose-50 border-rose-200",
  MEDIUM: "bg-amber-50 border-amber-200",
  LOW: "bg-emerald-50 border-emerald-200",
  CRITICAL: "bg-rose-50 border-rose-200",
};

const SEVERITY_TEXT = {
  HIGH: "text-rose-700",
  MEDIUM: "text-amber-700",
  LOW: "text-emerald-700",
  CRITICAL: "text-rose-700",
};

export default function Recommendations() {
  const navigate = useNavigate();
  const { selectedCycleId, loading: cycleLoading } = useCycle();
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    Promise.all([
      getRecommendations(selectedCycleId).catch(() => []),
      getRecommendationSummary(selectedCycleId).catch(() => null),
    ])
      .then(([recs, summ]) => {
        setRecommendations(recs);
        setSummary(summ);
      })
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  return (
    <PageWrapper title="Recommendations" description="S&OP recommendations based on P2 planning and E2 execution.">
      {cycleLoading || loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading recommendations...</div>
      ) : recommendations.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">No recommendations found. Generate recommendations from the S&OP cycle.</div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const severity = (rec.severity || "MEDIUM").toUpperCase();
            return (
              <div
                key={rec.id || index}
                className={`rounded-lg border px-5 py-4 ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.MEDIUM}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase ${SEVERITY_TEXT[severity] || SEVERITY_TEXT.MEDIUM}`}>
                        {severity}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">{rec.recommendation_type}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{rec.message}</h4>
                    {rec.recommended_action && (
                      <p className="text-sm text-slate-600 mt-1">{rec.recommended_action}</p>
                    )}
                    {rec.sku_code && (
                      <p className="text-xs text-slate-500 mt-2">SKU: {rec.sku_code}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {rec.shipment_reference && (
                      <button
                        onClick={() => navigate(`/e2/shipments/${rec.shipment_reference}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        View Shipment
                      </button>
                    )}
                    {rec.procurement_plan_id && (
                      <button
                        onClick={() => navigate(`/p2/procurement/${rec.procurement_plan_id}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        View Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
