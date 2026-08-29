import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Tag, TrendingDown } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { getRecommendations } from "../../features/p2/sop/sop.service";
import { getMarkdown, getMarkdownSummary } from "../../features/p2/markdown/markdown.service";

const SEVERITY_VARIANT = {
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "emerald",
  CRITICAL: "rose",
};

export default function Recommendations() {
  const navigate = useNavigate();
  const { selectedCycleId, loading: cycleLoading } = useCycle();
  const [recommendations, setRecommendations] = useState([]);
  const [markdown, setMarkdown] = useState([]);
  const [markdownSummary, setMarkdownSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    Promise.all([
      getRecommendations(selectedCycleId).catch(() => []),
      getMarkdown().catch(() => []),
      getMarkdownSummary().catch(() => null),
    ]).then(([recs, md, mdSummary]) => {
      const seen = new Set();
      const deduped = [];
      for (const r of Array.isArray(recs) ? recs : []) {
        const key = `${r.product_id}-${r.recommendation_type}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(r);
        }
      }
      setRecommendations(deduped);
      setMarkdown(Array.isArray(md) ? md : []);
      setMarkdownSummary(mdSummary);
    }).finally(() => setLoading(false));
  }, [selectedCycleId]);

  const highMarkdown = markdown.filter((m) => Number(m.markdown_pct || 0) >= 30);

  return (
    <PageWrapper title="Recommendations" description="S&OP recommendations based on P2 planning and E2 execution, plus markdown decisions.">
      {cycleLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* S&OP Recommendations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">S&OP Recommendations</h3>
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-slate-500">No recommendations found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {recommendations.map((rec, index) => {
                    const severity = (rec.severity || "MEDIUM").toUpperCase();
                    return (
                      <motion.div
                        key={rec.id || `${rec.product_id}-${rec.recommendation_type}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge variant={SEVERITY_VARIANT[severity] || "amber"}>{severity}</Badge>
                                  <span className="text-xs text-slate-500">•</span>
                                  <span className="text-xs text-slate-500">{rec.recommendation_type}</span>
                                  {rec.product_name && (
                                    <>
                                      <span className="text-xs text-slate-500">•</span>
                                      <span className="text-xs text-slate-500">{rec.sku_code} — {rec.product_name}</span>
                                    </>
                                  )}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-900">{rec.message}</h4>
                                {rec.recommended_action && (
                                  <p className="text-sm text-slate-600 mt-1">{rec.recommended_action}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {rec.shipment_reference && (
                                  <Button variant="ghost" size="sm" onClick={() => navigate(`/e2/shipments/${rec.shipment_reference}`)}>
                                    Shipment
                                  </Button>
                                )}
                                {rec.procurement_plan_id && (
                                  <Button variant="ghost" size="sm" onClick={() => navigate(`/p2/procurement/${rec.procurement_plan_id}`)}>
                                    Plan
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Markdown Decisions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Markdown Decisions</h3>
            {markdown.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-slate-500">No markdown data found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {highMarkdown.length > 0 && (
                  <AnimatedCard>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={14} className="text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">{highMarkdown.length} products need urgent markdown (≥30%)</span>
                      </div>
                    </div>
                  </AnimatedCard>
                )}
                <AnimatedCard delay={0.05}>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Markdown %</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Week</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Reason</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-slate-500">Urgency</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {markdown.map((m, i) => {
                          const pct = Number(m.markdown_pct || 0);
                          return (
                            <motion.tr key={m.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-medium text-slate-900">{m.sku_code}</td>
                              <td className="px-3 py-2 text-slate-600">{m.product_name}</td>
                              <td className="px-3 py-2 text-right">
                                <span className={`font-semibold ${pct >= 30 ? "text-rose-600" : pct >= 15 ? "text-amber-600" : "text-slate-700"}`}>
                                  {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-500">{m.week || "—"}</td>
                              <td className="px-3 py-2 text-slate-500 text-xs max-w-xs truncate">{m.reason || "—"}</td>
                              <td className="px-3 py-2 text-center">
                                <Badge variant={pct >= 50 ? "rose" : pct >= 30 ? "amber" : pct >= 15 ? "blue" : "emerald"}>
                                  {pct >= 50 ? "URGENT" : pct >= 30 ? "HIGH" : pct >= 15 ? "MEDIUM" : "LOW"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <Button variant="ghost" size="sm" onClick={() => navigate("/p2/markdown")}>View</Button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </AnimatedCard>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
