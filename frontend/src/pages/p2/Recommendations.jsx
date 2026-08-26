import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";
import { getRecommendations } from "../../features/p2/sop/sop.service";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    getRecommendations(selectedCycleId)
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  return (
    <PageWrapper title="Recommendations" description="S&OP recommendations based on P2 planning and E2 execution.">
      {cycleLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : recommendations.length === 0 ? (
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
                  key={rec.id || index}
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
    </PageWrapper>
  );
}
