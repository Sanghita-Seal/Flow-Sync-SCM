import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import KPICard from "../../components/ui/KPICard";
import {
  Truck, Package, Dock, Yard, Alert,
  Demand, Inventory, Procurement, Production, SOP, Markdown, Bell,
} from "../../components/ui/Icons";
import { getOverview } from "../../features/e2/overview/overview.service";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { useCycle } from "../../context/CycleContext";

const E2_MODULES = [
  { name: "Trucks", description: "Live location and status of every truck in transit.", icon: Truck, to: "/e2/trucks" },
  { name: "Shipments", description: "Track shipments from dispatch through to arrival.", icon: Package, to: "/e2/shipments" },
  { name: "Yard & Docks", description: "Yard occupancy and dock-level status, grouped by facility.", icon: Dock, to: "/e2/yard" },
  { name: "Alerts", description: "Operational exceptions across warehouse execution.", icon: Alert, to: "/alerts" },
];

const P2_MODULES = [
  { name: "S&OP Cycles", description: "Select planning cycles and manage S&OP process.", icon: SOP, to: "/p2/sop" },
  { name: "Procurement", description: "Supplier orders, MOQ, lead-time risk and E2 shipment links.", icon: Procurement, to: "/p2/procurement" },
  { name: "Risk Monitor", description: "Procurement plans at risk due to E2 execution delays.", icon: Alert, to: "/p2/risk" },
  { name: "Recommendations", description: "S&OP recommendations based on P2 planning and E2 execution.", icon: Demand, to: "/p2/recommendations" },
];

const TONE_BG = { blue: "bg-blue-50", emerald: "bg-emerald-50", amber: "bg-amber-50", rose: "bg-rose-50" };
const TONE_TEXT = { blue: "text-blue-700", emerald: "text-emerald-700", amber: "text-amber-700", rose: "text-rose-700" };
const TONE_DOT = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };

function ModuleCard({ name, description, icon: IconComp, tone, to }) {
  const navigate = useNavigate();
  const disabled = !to;
  return (
    <button
      onClick={() => to && navigate(to)}
      disabled={disabled}
      className={`flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONE_BG[tone]} ${TONE_TEXT[tone]}`}>
        <IconComp width={18} height={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{description}</p>
      </div>
    </button>
  );
}

function SectionCard({ title, description, tone, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${TONE_DOT[tone]}`} />
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [p2Overview, setP2Overview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedCycle } = useCycle();

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getP2Overview().catch(() => null),
    ])
      .then(([e2, p2]) => {
        setOverview(e2);
        setP2Overview(p2);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      title="Welcome to SCM Control Tower"
      description="Visibility across supply-chain planning and warehouse execution, in one place."
      actions={
        <div className="flex items-center gap-3">
          {selectedCycle && (
            <span className="text-xs text-slate-500">Cycle: {selectedCycle.cycle_name || selectedCycle.name}</span>
          )}
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300">
            <Bell width={13} height={13} />
            {loading ? "..." : overview?.delayedTrucks || 0} delayed trucks
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading overview...</div>
      ) : (
        <>
          {/* E2 KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard label="Trucks in transit" value={overview?.trucksInTransit || 0} icon={Truck} tone="blue" />
            <KPICard label="Trucks arrived" value={overview?.trucksArrived || 0} icon={Package} tone="emerald" />
            <KPICard label="Available docks" value={overview?.availableDocks || 0} icon={Dock} tone="amber" />
            <KPICard label="Delayed trucks" value={overview?.delayedTrucks || 0} icon={Alert} tone="rose" />
          </div>

          {/* P2 KPIs */}
          {p2Overview && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard label="Procurement plans" value={p2Overview.totalProcurementPlans || p2Overview.procurementPlans || 0} icon={Procurement} tone="blue" />
              <KPICard label="High risk" value={p2Overview.highRisk || p2Overview.atRisk || 0} icon={Alert} tone="rose" />
              <KPICard label="Shipments" value={p2Overview.totalShipments || p2Overview.shipments || 0} icon={Package} tone="emerald" />
              <KPICard label="Delayed" value={p2Overview.delayedShipments || p2Overview.delayed || 0} icon={Alert} tone="amber" />
            </div>
          )}
        </>
      )}

      <SectionCard
        title="E2 — Warehouse Execution"
        description="Monitor and optimize warehouse execution, yard operations, trucks, shipments and dock activities."
        tone="blue"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {E2_MODULES.map((m) => (
            <ModuleCard key={m.name} {...m} tone="blue" />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="P2 — Supply Chain Planning"
        description="Planning decisions, procurement risk, and S&OP recommendations linked to E2 execution."
        tone="emerald"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {P2_MODULES.map((m) => (
            <ModuleCard key={m.name} {...m} tone="emerald" />
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
