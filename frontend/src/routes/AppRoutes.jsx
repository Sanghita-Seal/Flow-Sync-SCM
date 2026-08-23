import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import TruckTracker from "../pages/e2/TruckTracker";

// Auth routes and ProtectedRoute intentionally skipped for now —
// see AuthContext for the stub that keeps everything logged in.

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/e2/trucks"
        element={
          <MainLayout>
            <TruckTracker />
          </MainLayout>
        }
      />

      {/* Add as each page is built:
      <Route path="/e2/yard" element={<MainLayout><Yard /></MainLayout>} />
      <Route path="/e2/docks" element={<MainLayout><Docks /></MainLayout>} />
      <Route path="/e2/deliveries" element={<MainLayout><Deliveries /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><Alerts /></MainLayout>} />
      */}
    </Routes>
  );
}
