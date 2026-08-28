import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Badge } from "./Badge";
import { getInsight } from "../../features/ai/ai.service";

const PRIORITY_STYLE = {
  HIGH: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  MEDIUM: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  LOW: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
};

function InsightSection({ title, children }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{children}</div>
    </div>
  );
}

export default function AIInsightCard({ type, data, children, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insight, setInsight] = useState(null);
  const [show, setShow] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setShow(true);
    try {
      const result = await getInsight(type, data);
      setInsight(result);
    } catch (err) {
      setError("AI insight unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setShow(false);
    setInsight(null);
    setError(null);
  }

  const priorityStyle = insight ? PRIORITY_STYLE[insight.priority] || PRIORITY_STYLE.MEDIUM : null;

  return (
    <div className={className}>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
          bg-gradient-to-r from-violet-500 to-purple-600 text-white
          hover:from-violet-600 hover:to-purple-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles size={12} className="text-white" />
                    </span>
                    AI Supply Chain Insight
                  </CardTitle>
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Analyzing supply chain data...</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-rose-50 border border-rose-200">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <span className="text-xs text-rose-700">{error}</span>
                  </div>
                )}

                {insight && !loading && (
                  <div>
                    <InsightSection title="Situation">{insight.situation}</InsightSection>
                    <InsightSection title="Business Impact">{insight.impact}</InsightSection>
                    <InsightSection title="Recommended Actions">
                      {insight.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1">
                          <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </InsightSection>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">Priority:</span>
                      <Badge variant={insight.priority === "HIGH" ? "rose" : insight.priority === "LOW" ? "blue" : "amber"}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
