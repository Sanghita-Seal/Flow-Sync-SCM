import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Factory,
  Tag,
  Shield,
  Lightbulb,
  ShoppingCart,
  Warehouse,
  Activity,
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  PackageCheck,
  PackageX,
  Truck,
  ClipboardList,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import SpotlightCard from "../../components/ui/SpotlightCard";
import AnimatedCard from "../../components/ui/AnimatedCard";
import DonutChart from "../../components/charts/DonutChart";
import { getP2Overview } from "../../features/p2/overview/overview.service";
import { getPlanSummary } from "../../features/p2/sop/sop.service";
import { getInventoryRisk } from "../../features/p2/inventory/inventory.service";
import { getProcurement, getProcurementSummary, getProcurementRisk } from "../../features/p2/procurement/procurement.service";
import { getMarkdown, getMarkdownSummary } from "../../features/p2/markdown/markdown.service";
import { getInventory } from "../../features/p2/inventory/inventory.service";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  cyan: "bg-cyan-100 text-cyan-600",
  violet: "bg-violet-100 text-violet-600",
};

const SEVERITY_COLORS = {
  CRITICAL: "bg-rose-100 text-rose-700",
  HIGH: "bg-amber-100 text-amber-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  LOW: "bg-slate-100 text-slate-600",
};

const RISK_VARIANT = {
  Critical: "rose",
  High: "amber",
  Medium: "amber",
  Low: "emerald",
  CRITICAL: "rose",
  HIGH: "amber",
  MEDIUM: "amber",
  LOW: "emerald",
};

export default function P2Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [planSummary, setPlanSummary] = useState(null);
  const [inventoryRisk, setInventoryRisk] = useState([]);
  const [procurement, setProcurement] = useState([]);
  const [procurementSummary, setProcurementSummary] = useState(null);
  const [markdown, setMarkdown] = useState([]);
  const [markdownSummary, setMarkdownSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getP2Overview(),
      getInventoryRisk().catch(() => []),
      getMarkdown().catch(() => []),
      getMarkdownSummary().catch(() => null),
      getInventory().catch(() => []),
    ])
      .then(([ov, ir, md, ms, inv]) => {
        setOverview(ov);
        setInventoryRisk(Array.isArray(ir) ? ir : []);
        setMarkdown(Array.isArray(md) ? md : []);
        setMarkdownSummary(ms);
        setInventory(Array.isArray(inv) ? inv : []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!overview?.cycle?.id) return;
    Promise.all([
      getPlanSummary(overview.cycle.id).catch(() => null),
      getProcurement({ cycleId: overview.cycle.id }).catch(() => []),
      getProcurementSummary().catch(() => null),
    ])
      .then(([ps, proc, psu]) => {
        setPlanSummary(ps);
        setProcurement(Array.isArray(proc) ? proc : []);
        setProcurementSummary(psu);
      })
      .catch(() => null);
  }, [overview?.cycle?.id]);

  const shortageProducts = useMemo(
    () => inventoryRisk.filter((r) => r.risk === "SHORTAGE"),
    [inventoryRisk]
  );
  const excessProducts = useMemo(
    () => inventoryRisk.filter((r) => r.risk === "EXCESS"),
    [inventoryRisk]
  );
  const healthyProducts = useMemo(
    () => inventoryRisk.filter((r) => r.risk === "HEALTHY"),
    [inventoryRisk]
  );

  const shortageUnits = useMemo(
    () => shortageProducts.reduce((sum, r) => sum + Math.max(0, r.total_forecast_demand - r.inventory_units), 0),
    [shortageProducts]
  );
  const excessUnits = useMemo(
    () => excessProducts.reduce((sum, r) => sum + r.inventory_units, 0),
    [excessProducts]
  );

  const procurementRiskPlans = useMemo(
    () => procurement.filter((p) => ["HIGH", "CRITICAL"].includes((p.risk_level || "").toUpperCase())),
    [procurement]
  );
  const procurementLow = useMemo(
    () => procurement.filter((p) => (p.risk_level || "").toUpperCase() === "LOW"),
    [procurement]
  );
  const procurementMedium = useMemo(
    () => procurement.filter((p) => (p.risk_level || "").toUpperCase() === "MEDIUM"),
    [procurement]
  );

  const highestRiskProcurement = useMemo(() => {
    if (procurementRiskPlans.length > 0) return procurementRiskPlans[0];
    if (procurement.length > 0) {
      const sorted = [...procurement].sort((a, b) => {
        const order = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        return (order[(a.risk_level || "").toUpperCase()] || 5) - (order[(b.risk_level || "").toUpperCase()] || 5);
      });
      return sorted[0];
    }
    return null;
  }, [procurement, procurementRiskPlans]);

  const markdownUnitsAtRisk = useMemo(() => {
    const inventoryByProduct = new Map();
    for (const item of inventory) {
      inventoryByProduct.set(item.product_id, item);
    }
    return markdown.reduce((sum, m) => {
      const inv = inventoryByProduct.get(m.product_id);
      return sum + (inv ? Number(inv.current_inventory_units) : 0);
    }, 0);
  }, [markdown, inventory]);

  const topMarkdownProducts = useMemo(() => {
    const inventoryByProduct = new Map();
    for (const item of inventory) {
      inventoryByProduct.set(item.product_id, item);
    }
    return [...markdown]
      .sort((a, b) => Number(b.markdown_pct || 0) - Number(a.markdown_pct || 0))
      .slice(0, 3)
      .map((m) => {
        const inv = inventoryByProduct.get(m.product_id);
        return {
          ...m,
          units: inv ? Number(inv.current_inventory_units) : null,
        };
      });
  }, [markdown, inventory]);

  const attentionItems = useMemo(() => {
    const items = [];
    shortageProducts.slice(0, 2).forEach((r) => {
      items.push({
        severity: "critical",
        title: `Inventory Shortage — ${r.sku_code}`,
        detail: `${r.product_name} · ${Math.max(0, r.total_forecast_demand - r.inventory_units).toLocaleString()} units short`,
        link: "/p2/inventory",
        icon: PackageX,
      });
    });
    excessProducts.slice(0, 1).forEach((r) => {
      items.push({
        severity: "warning",
        title: `Excess Inventory — ${r.sku_code}`,
        detail: `${r.product_name} · ${r.inventory_units.toLocaleString()} units (excess)`,
        link: "/p2/inventory",
        icon: Package,
      });
    });
    procurementRiskPlans.slice(0, 2).forEach((p) => {
      items.push({
        severity: "critical",
        title: `High Procurement Risk — ${p.sku_code}`,
        detail: `${p.product_name} · ${Number(p.required_fabric_m || 0).toLocaleString()} m · ${p.risk_level}`,
        link: `/p2/procurement/${p.id}`,
        icon: ShoppingCart,
      });
    });
    if (planSummary && planSummary.shortage_products > 0) {
      items.push({
        severity: "critical",
        title: "Production Shortage Detected",
        detail: `${planSummary.shortage_products} product(s) with supply gap`,
        link: "/p2/production",
        icon: Factory,
      });
    }
    if (topMarkdownProducts.length > 0) {
      const top = topMarkdownProducts[0];
      items.push({
        severity: "warning",
        title: `Markdown Opportunity — ${top.sku_code}`,
        detail: `${top.product_name} · ${top.units != null ? top.units.toLocaleString() + " units" : "N/A"} · ${Number(top.markdown_pct || 0).toFixed(0)}% markdown`,
        link: "/p2/markdown",
        icon: Tag,
      });
    }
    return items;
  }, [shortageProducts, excessProducts, procurementRiskPlans, planSummary, topMarkdownProducts]);

  const totalForecast = overview?.metrics?.totalForecastDemand ?? 0;
  const openingInventory = overview?.metrics?.availableInventory ?? 0;
  const plannedProduction = overview?.plan?.plannedProduction ?? 0;
  const productionCapacity = overview?.metrics?.productionCapacity ?? 0;
  const supplyGap = overview?.metrics?.supplyDemandGap ?? 0;
  const excessInventory = overview?.metrics?.excessInventory ?? 0;
  const requiredProduction = Math.max(0, totalForecast - openingInventory);
  const capacityUtilization = productionCapacity > 0 ? Math.round((plannedProduction / productionCapacity) * 100) : 0;

  const planningStatus = useMemo(() => {
    if (!overview) return "UNKNOWN";
    const shortage = overview.plan?.shortageProducts ?? 0;
    const excess = overview.plan?.excessProducts ?? 0;
    if (shortage > 0) return "SHORTAGE";
    if (excess > 0) return "EXCESS";
    return "BALANCED";
  }, [overview]);

  const planStatusDonut = overview
    ? [
        { name: "Balanced", value: overview.plan.balancedProducts, color: "#10b981" },
        { name: "Shortage", value: overview.plan.shortageProducts, color: "#ef4444" },
        { name: "Excess", value: overview.plan.excessProducts, color: "#f59e0b" },
      ]
    : [];

  const inventoryRiskDonut = inventoryRisk.length > 0
    ? [
        { name: "Healthy", value: healthyProducts.length, color: "#10b981" },
        { name: "Shortage", value: shortageProducts.length, color: "#ef4444" },
        { name: "Excess", value: excessProducts.length, color: "#f59e0b" },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <PageWrapper
        title="P2 — Planning Control Tower"
        description="S&OP, demand, inventory, production and procurement overview."
      >
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </PageWrapper>
    );
  }

  if (!overview) {
    return (
      <PageWrapper
        title="P2 — Planning Control Tower"
        description="S&OP, demand, inventory, production and procurement overview."
      >
        <div className="text-sm text-slate-500 py-8 text-center">
          Failed to load P2 overview data. Check your connection and try again.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="P2 — Planning Control Tower"
      description="S&OP, demand, inventory, production and procurement overview."
    >
      {/* ─── Cycle Info ─── */}
      {overview.cycle && (
        <AnimatedCard>
          <SpotlightCard>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-slate-500">Active S&OP Cycle</p>
                <p className="text-lg font-bold text-slate-900">{overview.cycle.name}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                  {new Date(overview.cycle.startDate).toLocaleDateString()} — {new Date(overview.cycle.endDate).toLocaleDateString()}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    overview.cycle.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {overview.cycle.status}
                </span>
              </div>
            </div>
          </SpotlightCard>
        </AnimatedCard>
      )}

      {/* ─── Section 2: Executive KPIs ─── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Forecast Demand", value: totalForecast, icon: TrendingUp, color: "blue" },
            { label: "Opening Inventory", value: openingInventory, icon: Package, color: "emerald" },
            { label: "Planned Production", value: plannedProduction, icon: Factory, color: "cyan" },
            { label: "Shortage Units", value: shortageUnits, icon: AlertTriangle, color: "rose" },
          ].map((kpi, i) => (
            <AnimatedCard key={kpi.label} delay={i * 0.1}>
              <SpotlightCard>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                    <kpi.icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Risks & Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Excess Units", value: excessInventory, icon: TrendingDown, color: "amber" },
            { label: "High-Risk Procurement", value: procurementRiskPlans.length, icon: ShoppingCart, color: "rose" },
            { label: "Markdown Units at Risk", value: markdownUnitsAtRisk, icon: Tag, color: "violet" },
            { label: "Products", value: overview.plan.productCount, icon: Package, color: "blue" },
          ].map((kpi, i) => (
            <AnimatedCard key={kpi.label} delay={0.4 + i * 0.1}>
              <SpotlightCard>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${ICON_COLORS[kpi.color]}`}>
                    <kpi.icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* ─── Section 3: Attention Required ─── */}
      {attentionItems.length > 0 && (
        <AnimatedCard delay={0.8}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CircleAlert size={18} className="text-amber-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attentionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border ${
                      item.severity === "critical"
                        ? "bg-rose-50 border-rose-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.severity === "critical"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(item.link)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      View &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* ─── Section 4: S&OP Health ─── */}
      <AnimatedCard delay={0.9}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">S&OP Health</CardTitle>
              <button
                onClick={() => navigate("/p2/sop")}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View S&OP Plan &rarr;
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: "Forecast Demand", value: totalForecast, color: "text-blue-600" },
                  { label: "Opening Inventory", value: openingInventory, color: "text-emerald-600" },
                  { label: "Planned Production", value: plannedProduction, color: "text-cyan-600" },
                  { label: "Production Gap", value: supplyGap, color: supplyGap > 0 ? "text-rose-600" : "text-emerald-600" },
                  { label: "Excess Inventory", value: excessInventory, color: "text-amber-600" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className={`text-lg font-bold ${row.color}`}>{row.value.toLocaleString()} units</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">STATUS</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        planningStatus === "BALANCED"
                          ? "bg-emerald-100 text-emerald-700"
                          : planningStatus === "SHORTAGE"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {planningStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {overview.plan.balancedProducts} balanced · {overview.plan.shortageProducts} shortage · {overview.plan.excessProducts} excess
                  </p>
                </div>
              </div>
              <div>
                {planStatusDonut.some((d) => d.value > 0) ? (
                  <DonutChart data={planStatusDonut} />
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No plan data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* ─── Section 5: Demand → Inventory → Production Flow ─── */}
      <AnimatedCard delay={1.0}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planning Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[
                { label: "Forecast Demand", value: totalForecast, icon: TrendingUp, color: "bg-blue-500" },
                { label: "Inventory", value: openingInventory, icon: Package, color: "bg-emerald-500" },
                { label: "Required Production", value: requiredProduction, icon: ClipboardList, color: "bg-cyan-500" },
                { label: "Planned Production", value: plannedProduction, icon: Factory, color: "bg-violet-500" },
                { label: "Production Gap", value: supplyGap, icon: AlertTriangle, color: supplyGap > 0 ? "bg-rose-500" : "bg-emerald-500" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center`}>
                    <step.icon size={16} className="text-white" />
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="text-lg font-bold text-slate-900">{step.value.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{step.label}</p>
                  </div>
                  {i < 4 && (
                    <div className="text-slate-300 mx-1 hidden sm:block">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* ─── Section 6 & 7: Production Summary + Inventory Risk ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={1.1}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Production Summary</CardTitle>
                <button
                  onClick={() => navigate("/p2/production")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Production &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Required", value: requiredProduction },
                    { label: "Planned", value: plannedProduction },
                    { label: "Capacity", value: productionCapacity },
                    { label: "Utilization", value: null, display: `${capacityUtilization}%` },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-slate-900">
                        {item.display ?? item.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Balanced</span>
                    <span className="font-semibold text-emerald-600">{overview.plan.balancedProducts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Shortage</span>
                    <span className="font-semibold text-rose-600">{overview.plan.shortageProducts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Excess</span>
                    <span className="font-semibold text-amber-600">{overview.plan.excessProducts}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={1.2}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Inventory Risk</CardTitle>
                <button
                  onClick={() => navigate("/p2/inventory")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Inventory &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Shortage", count: shortageProducts.length, units: shortageUnits, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Excess", count: excessProducts.length, units: excessUnits, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Healthy", count: healthyProducts.length, units: null, color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map((item) => (
                    <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                      <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      {item.units != null && (
                        <p className={`text-xs font-medium ${item.color} mt-0.5`}>{item.units.toLocaleString()} units</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Attention</p>
                  {[...shortageProducts.slice(0, 2), ...excessProducts.slice(0, 1)].map((r) => (
                    <div
                      key={r.product_id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        r.risk === "SHORTAGE" ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium text-slate-900">{r.sku_code}</span>
                        <span className="text-xs text-slate-500 ml-2">{r.product_name}</span>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          r.risk === "SHORTAGE" ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {r.risk === "SHORTAGE"
                          ? `-${Math.max(0, r.total_forecast_demand - r.inventory_units).toLocaleString()}`
                          : `+${r.inventory_units.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* ─── Section 8 & 9: Procurement Summary + Markdown Summary ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={1.3}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Procurement Summary</CardTitle>
                <button
                  onClick={() => navigate("/p2/procurement")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Procurement &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{procurement.length}</p>
                  <p className="text-xs text-slate-500">Total Plans</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Low", count: procurementLow.length, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Medium", count: procurementMedium.length, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "High", count: procurementRiskPlans.length, color: "text-rose-600", bg: "bg-rose-50" },
                  ].map((item) => (
                    <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                      <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                {highestRiskProcurement && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Highest Risk</p>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-100">
                      <div>
                        <span className="text-sm font-medium text-slate-900">{highestRiskProcurement.sku_code}</span>
                        <span className="text-xs text-slate-500 ml-2">{highestRiskProcurement.product_name}</span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Number(highestRiskProcurement.required_fabric_m || 0).toLocaleString()} m
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          RISK_VARIANT[highestRiskProcurement.risk_level] === "rose"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {highestRiskProcurement.risk_level}
                      </span>
                    </div>
                  </div>
                )}
                {procurementSummary && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Required Fabric</span>
                      <p className="font-semibold text-slate-900">{Number(procurementSummary.total_required_fabric_m || 0).toLocaleString()} m</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Recommended Order</span>
                      <p className="font-semibold text-slate-900">{Number(procurementSummary.total_recommended_order_qty_m || 0).toLocaleString()} m</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={1.4}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Markdown Summary</CardTitle>
                <button
                  onClick={() => navigate("/p2/markdown")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Markdown &rarr;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-violet-50 border border-violet-100">
                    <p className="text-2xl font-bold text-violet-600">{markdownSummary?.product_count ?? markdown.length}</p>
                    <p className="text-xs text-slate-500">Products</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-rose-50 border border-rose-100">
                    <p className="text-2xl font-bold text-rose-600">{markdownUnitsAtRisk.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Units at Risk</p>
                  </div>
                </div>
                {markdownSummary && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Avg Discount</span>
                      <p className="font-semibold text-slate-900">{Number(markdownSummary.average_markdown_pct || 0).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Max Discount</span>
                      <p className="font-semibold text-slate-900">{Number(markdownSummary.maximum_markdown_pct || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
                {topMarkdownProducts.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Opportunities</p>
                    {topMarkdownProducts.map((m) => (
                      <div
                        key={m.product_id || m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-violet-50 border border-violet-100"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-900">{m.sku_code}</span>
                          <span className="text-xs text-slate-500 ml-2">{m.product_name}</span>
                        </div>
                        <div className="text-right">
                          {m.units != null && (
                            <span className="text-xs font-medium text-rose-600">{m.units.toLocaleString()} units</span>
                          )}
                          <span className="text-xs text-slate-500 ml-2">{Number(m.markdown_pct || 0).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* ─── Section 10: P2 → E2 Connection ─── */}
      <AnimatedCard delay={1.5}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">P2 → E2 Execution Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[
                { label: "Planning", icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
                { label: "Procurement", icon: ShoppingCart, color: "bg-emerald-100 text-emerald-600" },
                { label: "Shipment", icon: Truck, color: "bg-amber-100 text-amber-600" },
                { label: "Yard", icon: Warehouse, color: "bg-cyan-100 text-cyan-600" },
                { label: "Dock", icon: Activity, color: "bg-violet-100 text-violet-600" },
                { label: "Delivered", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center`}>
                    <step.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{step.label}</span>
                  {i < 5 && (
                    <div className="text-slate-300 mx-1 hidden sm:block">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Shipments carry <code className="bg-slate-100 px-1 rounded">procurement_plan_id</code> for full P2→E2 traceability.
              </p>
              <button
                onClick={() => navigate("/p2/procurement")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Procurement &rarr;
              </button>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* ─── Quick Navigation ─── */}
      <AnimatedCard delay={1.6}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "S&OP Cycles", description: "Select planning cycles.", icon: Shield, to: "/p2/sop", color: "blue" },
                { name: "Demand Planning", description: "Forecast by SKU.", icon: TrendingUp, to: "/p2/demand", color: "blue" },
                { name: "Production", description: "Planned production.", icon: Factory, to: "/p2/production", color: "cyan" },
                { name: "Procurement", description: "Supplier orders.", icon: ShoppingCart, to: "/p2/procurement", color: "emerald" },
                { name: "Inventory", description: "Stock levels.", icon: Package, to: "/p2/inventory", color: "emerald" },
                { name: "Markdown", description: "Excess stock.", icon: Tag, to: "/p2/markdown", color: "violet" },
                { name: "Risk Monitor", description: "E2 delays.", icon: AlertTriangle, to: "/p2/risk", color: "amber" },
                { name: "Recommendations", description: "S&OP replanning.", icon: Lightbulb, to: "/p2/recommendations", color: "rose" },
              ].map((m) => (
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
    </PageWrapper>
  );
}
