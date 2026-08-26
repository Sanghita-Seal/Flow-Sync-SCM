import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useCycle } from "../../context/CycleContext";

export default function SopCycles() {
  const navigate = useNavigate();
  const { cycles, selectedCycleId, setSelectedCycleId, loading } = useCycle();

  return (
    <PageWrapper title="S&OP Cycles" description="Select a planning cycle to view procurement, risk, and recommendations.">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : cycles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-slate-500">No S&OP cycles found.</p>
          </CardContent>
        </Card>
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
                      <td className="px-4 py-2.5 text-slate-900 font-medium">{cycle.cycle_name || cycle.name}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-2.5"><Badge variant={cycle.status === "ACTIVE" ? "emerald" : "blue"}>{cycle.status}</Badge></td>
                      <td className="px-4 py-2.5">
                        {isSelected && <Badge variant="blue">Selected</Badge>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      )}

      {selectedCycleId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/p2/procurement")}>View Procurement Plans</Button>
          <Button variant="outline" onClick={() => navigate("/p2/risk")}>Risk Monitor</Button>
          <Button variant="outline" onClick={() => navigate("/p2/recommendations")}>Recommendations</Button>
        </motion.div>
      )}
    </PageWrapper>
  );
}
