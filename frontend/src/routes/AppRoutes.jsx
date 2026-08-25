import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import TruckTracker from "../pages/e2/TruckTracker";
import YardDocks from "../pages/e2/YardDocks";
import Shipments from "../pages/e2/Shipments";
import Alerts from "../pages/alerts/Alerts";
import TrackPage from "../pages/track/TrackPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/track" element={<TrackPage />} />

      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/e2/trucks" element={<MainLayout><TruckTracker /></MainLayout>} />
      <Route path="/e2/yard" element={<MainLayout><YardDocks /></MainLayout>} />
      <Route path="/e2/shipments" element={<MainLayout><Shipments /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><Alerts /></MainLayout>} />
    </Routes>
  );
}
