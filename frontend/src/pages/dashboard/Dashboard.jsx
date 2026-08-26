import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import KPICard from "../../components/ui/KPICard";
import {
  Truck, Package, Dock, Yard, Alert,
  Demand, Inventory, Procurement, Production, SOP, Markdown, Bell,
} from "../../components/ui/Icons";
import { getOverview } from "../../features/e2/overview/overview.service";

const E2_MODULES = [
  { name: "Trucks", description: "Live location and status of every truck in transit.", icon: Truck, to: "/e2/trucks" },
  { name: "Shipments", description: "Track shipments from dispatch through to arrival.", icon: Package, to: "/e2/shipments" },
  { name: "Yard & Docks", description: "Yard occupancy and dock-level status, grouped by facility.", icon: Dock, to: "/e2/yard" },
  { name: "Alerts", description: "Operational exceptions across warehouse execution.", icon: Alert, to: "/alerts" },
];

const P2_MODULES = [
  { name: "Demand", description: "Forecast trends and demand-supply comparison.", icon: Demand, to: null },
  { name: "Inventory", description: "Stock position, safety levels and shortage risk.", icon: Inventory, to: null },
  { name: "Procurement", description: "Supplier orders, MOQ and lead-time risk.", icon: Procurement, to: null },
  { name: "Production", description: "Capacity utilization and production gaps.", icon: Production, to: null },
  { name: "S&OP", description: "Cross-functional demand-supply reconciliation.", icon: SOP, to: null },
  { name: "Markdown", description: "Sell-through and markdown timing recommendations.", icon: Markdown, to: null },
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
        {disabled && <p className="mt-1 text-[11px] text-slate-400">Coming soon</p>}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview().then(setOverview).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      title="Welcome to SCM Control Tower"
      description="Visibility across warehouse execution and supply-chain planning, in one place."
      actions={
        <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300">
          <Bell width={13} height={13} />
          {loading ? "..." : overview?.delayedTrucks} delayed trucks
        </button>
      }
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading overview...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard label="Trucks in transit" value={overview.trucksInTransit} icon={Truck} tone="blue" />
          <KPICard label="Trucks arrived" value={overview.trucksArrived} icon={Package} tone="emerald" />
          <KPICard label="Available docks" value={overview.availableDocks} icon={Dock} tone="amber" />
          <KPICard label="Delayed trucks" value={overview.delayedTrucks} icon={Alert} tone="rose" />
        </div>
      )}

      <SectionCard
        title="E2 – Warehouse Management"
        description="Monitor and optimize warehouse execution, yard operations, trucks, shipments and dock activities."
        tone="blue"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {E2_MODULES.map((m) => (
            <ModuleCard key={m.name} {...m} tone="blue" />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="P2 – S&OP / Integrated Business Planning"
        description="Support demand, inventory, procurement, production and S&OP planning decisions."
        tone="emerald"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {P2_MODULES.map((m) => (
            <ModuleCard key={m.name} {...m} tone="emerald" />
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
