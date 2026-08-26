import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import TruckTracker from "../pages/e2/TruckTracker";
import YardDocks from "../pages/e2/YardDocks";
import Shipments from "../pages/e2/Shipments";
import ShipmentDetail from "../pages/e2/ShipmentDetail";
import Alerts from "../pages/alerts/Alerts";
import TrackPage from "../pages/track/TrackPage";

import SopCycles from "../pages/p2/SopCycles";
import ProcurementPlans from "../pages/p2/ProcurementPlans";
import ProcurementPlanDetail from "../pages/p2/ProcurementPlanDetail";
import RiskMonitor from "../pages/p2/RiskMonitor";
import Recommendations from "../pages/p2/Recommendations";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/track" element={<TrackPage />} />

      {/* Main Dashboard */}
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />

      {/* E2 — Execution */}
      <Route path="/e2/trucks" element={<MainLayout><TruckTracker /></MainLayout>} />
      <Route path="/e2/yard" element={<MainLayout><YardDocks /></MainLayout>} />
      <Route path="/e2/shipments" element={<MainLayout><Shipments /></MainLayout>} />
      <Route path="/e2/shipments/:reference" element={<MainLayout><ShipmentDetail /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><Alerts /></MainLayout>} />

      {/* P2 — Planning */}
      <Route path="/p2/sop" element={<MainLayout><SopCycles /></MainLayout>} />
      <Route path="/p2/procurement" element={<MainLayout><ProcurementPlans /></MainLayout>} />
      <Route path="/p2/procurement/:planId" element={<MainLayout><ProcurementPlanDetail /></MainLayout>} />
      <Route path="/p2/risk" element={<MainLayout><RiskMonitor /></MainLayout>} />
      <Route path="/p2/recommendations" element={<MainLayout><Recommendations /></MainLayout>} />
    </Routes>
  );
}
