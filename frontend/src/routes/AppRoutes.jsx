import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import LandingPage from "../pages/landing/LandingPage";
import Dashboard from "../pages/dashboard/Dashboard";
import TruckTracker from "../pages/e2/TruckTracker";
import Docks from "../pages/e2/Docks";
import E2Overview from "../pages/e2/E2Overview";
import Shipments from "../pages/e2/Shipments";
import ShipmentDetail from "../pages/e2/ShipmentDetail";
import Alerts from "../pages/alerts/Alerts";
import TrackPage from "../pages/track/TrackPage";

import P2Overview from "../pages/p2/P2Overview";
import InventoryPage from "../pages/p2/InventoryPage";
import SopCycles from "../pages/p2/SopCycles";
import ProcurementPlans from "../pages/p2/ProcurementPlans";
import ProcurementPlanDetail from "../pages/p2/ProcurementPlanDetail";
import RiskMonitor from "../pages/p2/RiskMonitor";
import Recommendations from "../pages/p2/Recommendations";
import DemandPlanning from "../pages/p2/DemandPlanning";
import ProductionScheduling from "../pages/p2/ProductionScheduling";
import MarkdownDecisionCenter from "../pages/p2/MarkdownDecisionCenter";

export default function AppRoutes({ ManagerGuard, AuthGate }) {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/track" element={<TrackPage />} />

      {/* Protected routes — must be signed in AND have manager role */}
      <Route element={<AuthGate><ManagerGuard><MainLayout /></ManagerGuard></AuthGate>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/e2/overview" element={<E2Overview />} />
        <Route path="/e2/trucks" element={<TruckTracker />} />
        <Route path="/e2/docks" element={<Docks />} />
        <Route path="/e2/shipments" element={<Shipments />} />
        <Route path="/e2/shipments/:reference" element={<ShipmentDetail />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/p2/overview" element={<P2Overview />} />
        <Route path="/p2/inventory" element={<InventoryPage />} />
        <Route path="/p2/sop" element={<SopCycles />} />
        <Route path="/p2/procurement" element={<ProcurementPlans />} />
        <Route path="/p2/procurement/:planId" element={<ProcurementPlanDetail />} />
        <Route path="/p2/risk" element={<RiskMonitor />} />
        <Route path="/p2/recommendations" element={<Recommendations />} />
        <Route path="/p2/demand" element={<DemandPlanning />} />
        <Route path="/p2/production" element={<ProductionScheduling />} />
        <Route path="/p2/markdown" element={<MarkdownDecisionCenter />} />
      </Route>
    </Routes>
  );
}
