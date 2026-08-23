import PageWrapper from "../../components/layout/PageWrapper";
import KPICard from "../../components/ui/KPICard";
import {
  Truck, Package, Dock, Yard, Alert,
  Demand, Inventory, Procurement, Production, SOP, Markdown, Bell,
} from "../../components/ui/Icons";

/* ------------------------------------------------------------------ */
/* MOCK DATA — replace with a real API call once the backend endpoint  */
/* is ready:                                                            */
/*   const [overview, setOverview] = useState(null);                   */
/*   useEffect(() => { dashboardApi.getOverview().then(setOverview) }); */
/* ------------------------------------------------------------------ */

const KPIS = [
  { key: "activeTrucks", label: "Active trucks", value: 24, icon: Truck, tone: "blue" },
  { key: "deliveriesToday", label: "Deliveries today", value: 18, icon: Package, tone: "emerald" },
  { key: "availableDocks", label: "Available docks", value: 6, icon: Dock, tone: "amber" },
  { key: "activeAlerts", label: "Active alerts", value: 3, icon: Alert, tone: "rose" },
];

const E2_MODULES = [
  { name: "Trucks", description: "Live location and status of every truck in transit.", icon: Truck },
  { name: "Deliveries", description: "Track shipments from dispatch through to arrival.", icon: Package },
  { name: "Docks", description: "Dock availability and assignment recommendations.", icon: Dock },
  { name: "Yard", description: "Yard zone occupancy and staging status.", icon: Yard },
  { name: "Alerts", description: "Operational exceptions across warehouse execution.", icon: Alert },
];

const P2_MODULES = [
  { name: "Demand", description: "Forecast trends and demand-supply comparison.", icon: Demand },
  { name: "Inventory", description: "Stock position, safety levels and shortage risk.", icon: Inventory },
  { name: "Procurement", description: "Supplier orders, MOQ and lead-time risk.", icon: Procurement },
  { name: "Production", description: "Capacity utilization and production gaps.", icon: Production },
  { name: "S&OP", description: "Cross-functional demand-supply reconciliation.", icon: SOP },
  { name: "Markdown", description: "Sell-through and markdown timing recommendations.", icon: Markdown },
];

const RECENT_ACTIVITY = [
  { id: 1, text: "Truck TRK-102 arrived at Gate 2", time: "2 min ago" },
  { id: 2, text: "Dock D-04 assigned to delivery DEL-204", time: "14 min ago" },
  { id: 3, text: "Delivery DEL-118 delayed by 25 minutes", time: "31 min ago" },
  { id: 4, text: "Inventory planning cycle completed", time: "1 hr ago" },
];

const ALERT_SUMMARY = [
  { label: "Critical", count: 1, tone: "rose" },
  { label: "Warning", count: 1, tone: "amber" },
  { label: "Informational", count: 1, tone: "blue" },
];

const TONE_BG = { blue: "bg-blue-50", emerald: "bg-emerald-50", amber: "bg-amber-50", rose: "bg-rose-50" };
const TONE_TEXT = { blue: "text-blue-700", emerald: "text-emerald-700", amber: "text-amber-700", rose: "text-rose-700" };
const TONE_DOT = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };

function ModuleCard({ name, description, icon: IconComp, tone }) {
  return (
    <button className="flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
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

function RecentActivity() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent activity</h2>
      <ul className="space-y-3">
        {RECENT_ACTIVITY.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              <span className="text-slate-800">{a.text}</span>
            </div>
            <span className="flex-shrink-0 text-xs text-slate-500">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertSummary() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Alert summary</h2>
      <div className="space-y-2">
        {ALERT_SUMMARY.map((a) => (
          <div key={a.label} className={`flex items-center justify-between rounded-md ${TONE_BG[a.tone]} px-3 py-2`}>
            <span className={`text-sm font-medium ${TONE_TEXT[a.tone]}`}>{a.label}</span>
            <span className={`text-sm font-semibold ${TONE_TEXT[a.tone]}`}>{a.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageWrapper
      title="Welcome to SCM Control Tower"
      description="Visibility across warehouse execution and supply-chain planning, in one place."
      actions={
        <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300">
          <Bell width={13} height={13} />
          {KPIS.find((k) => k.key === "activeAlerts")?.value} active alerts
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <KPICard key={kpi.key} label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} />
        ))}
      </div>

      <SectionCard
        title="E2 – Warehouse Management"
        description="Monitor and optimize warehouse execution, yard operations, trucks, deliveries and dock activities."
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivity />
        <AlertSummary />
      </div>
    </PageWrapper>
  );
}
