import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Truck, Package, Dock, AlertTriangle, Container, Warehouse, MapPin, Clock } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getOverview } from "../../features/e2/overview/overview.service";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

const QUICK_LINKS = [
  { name: "Shipments", description: "Track all shipments from dispatch to arrival.", icon: Container, to: "/e2/shipments", color: "blue" },
  { name: "Trucks", description: "Live location and status of every truck.", icon: Truck, to: "/e2/trucks", color: "emerald" },
  { name: "Yard & Docks", description: "Yard occupancy and dock status.", icon: Warehouse, to: "/e2/yard", color: "amber" },
  { name: "Alerts", description: "Operational exceptions and delays.", icon: AlertTriangle, to: "/alerts", color: "rose" },
];

export default function E2Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then(setOverview)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const truckStatusData = overview ? [
    { name: "In Transit", value: overview.trucksInTransit },
    { name: "Arrived", value: overview.trucksArrived },
    { name: "In Yard", value: overview.trucksInYard },
    { name: "Delayed", value: overview.delayedTrucks },
  ] : [];

  const shipmentStatusData = overview ? [
    { name: "In Transit", value: overview.shipmentsInTransit },
    { name: "Arrived", value: overview.shipmentsArrived },
    { name: "Delayed", value: overview.delayedShipments },
  ] : [];

  const dockStatusData = overview ? [
    { name: "Available", value: overview.availableDocks },
    { name: "Occupied", value: overview.occupiedDocks },
    { name: "Unavailable", value: overview.unavailableDocks },
  ] : [];

  const yardUtilization = overview ? Math.round((overview.activeYards / overview.totalYards) * 100) : 0;
  const dockUtilization = overview ? Math.round((overview.occupiedDocks / overview.totalDocks) * 100) : 0;
  const transitSuccess = overview && overview.totalShipments > 0
    ? Math.round((overview.shipmentsArrived / overview.totalShipments) * 100)
    : 0;

  return (
    <PageWrapper
      title="E2 — Execution Overview"
      description="Real-time visibility into shipments, trucks, yards and docks."
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : overview ? (
        <>
          {/* KPI Cards — Trucks */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Trucks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Trucks", value: overview.totalTrucks, icon: Truck, color: "blue" },
                { label: "In Transit", value: overview.trucksInTransit, icon: MapPin, color: "emerald" },
                { label: "Arrived", value: overview.trucksArrived, icon: Package, color: "cyan" },
                { label: "Delayed", value: overview.delayedTrucks, icon: AlertTriangle, color: "rose" },
              ].map((kpi, i) => (
                <AnimatedCard key={kpi.label} delay={i * 0.1}>
                  <SpotlightCard>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                        <kpi.icon size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* KPI Cards — Shipments */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Shipments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Shipments", value: overview.totalShipments, icon: Container, color: "blue" },
                { label: "In Transit", value: overview.shipmentsInTransit, icon: Truck, color: "emerald" },
                { label: "Arrived", value: overview.shipmentsArrived, icon: Package, color: "cyan" },
                { label: "Delayed", value: overview.delayedShipments, icon: Clock, color: "rose" },
              ].map((kpi, i) => (
                <AnimatedCard key={kpi.label} delay={0.4 + i * 0.1}>
                  <SpotlightCard>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                        <kpi.icon size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* KPI Cards — Yards & Docks */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Yards & Docks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Yards", value: overview.totalYards, icon: Warehouse, color: "blue" },
                { label: "Active Yards", value: overview.activeYards, icon: MapPin, color: "emerald" },
                { label: "Total Docks", value: overview.totalDocks, icon: Dock, color: "amber" },
                { label: "Available Docks", value: overview.availableDocks, icon: Dock, color: "cyan" },
              ].map((kpi, i) => (
                <AnimatedCard key={kpi.label} delay={0.8 + i * 0.1}>
                  <SpotlightCard>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                        <kpi.icon size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedCard delay={1.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Truck Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={truckStatusData} />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={1.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={shipmentStatusData} />
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={1.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dock Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={dockStatusData} />
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Utilization Bars */}
          <AnimatedCard delay={1.5}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Yard Utilization", value: yardUtilization, fill: "#3b82f6" },
                    { label: "Dock Utilization", value: dockUtilization, fill: "#10b981" },
                    { label: "Transit Success Rate", value: transitSuccess, fill: "#06b6d4" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-slate-600 w-40">{item.label}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-12 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Quick Nav */}
          <AnimatedCard delay={1.6}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_LINKS.map((m) => (
                    <motion.button
                      key={m.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(m.to)}
                      className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-300 hover:bg-white transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${ICON_COLORS[m.color]}`}>
                        <m.icon size={14} />
                      </div>
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </>
      ) : (
        <div className="text-sm text-slate-500 py-8 text-center">Failed to load E2 overview data.</div>
      )}
    </PageWrapper>
  );
}
