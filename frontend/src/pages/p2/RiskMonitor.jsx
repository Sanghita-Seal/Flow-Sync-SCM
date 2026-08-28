import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import AIInsightCard from "../../components/ui/AIInsightCard";
import { useCycle } from "../../context/CycleContext";
import { getProcurementRisk } from "../../features/p2/procurement/procurement.service";

const RISK_VARIANT = {
  Critical: "rose",
  High: "amber",
  Medium: "amber",
  Low: "emerald",
};

export default function RiskMonitor() {
  const navigate = useNavigate();
  const { loading: cycleLoading } = useCycle();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProcurementRisk()
      .then(setRisks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="Risk Monitor" description="Procurement plans at risk due to E2 execution delays.">
      {cycleLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : risks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-slate-500">No procurement risks found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {risks.map((risk, i) => (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={RISK_VARIANT[risk.risk_level] || "emerald"}>{risk.risk_level}</Badge>
                        <span className="text-sm font-medium text-slate-900">{risk.sku_code} — {risk.product_name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/p2/procurement/${risk.id}`)}>
                        View Plan
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 flex gap-4">
                      <span>Required: {Number(risk.required_fabric_m || 0).toLocaleString()} m</span>
                      <span>Lead Time: {risk.lead_time_weeks || "—"} weeks</span>
                    </div>
                    <div className="mt-3">
                      <AIInsightCard
                        type="risk_analysis"
                        data={{
                          sku: risk.sku_code,
                          product_name: risk.product_name,
                          risk_level: risk.risk_level,
                          required_fabric_m: risk.required_fabric_m,
                          recommended_order_qty_m: risk.recommended_order_qty_m,
                          lead_time_weeks: risk.lead_time_weeks,
                          supplier: risk.supplier_name,
                          planning_week: risk.planning_week,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
