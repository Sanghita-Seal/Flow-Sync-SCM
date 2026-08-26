import Reveal from "./Reveal";

const ROWS = [
  { sku: "SKU001", item: "Summer Dress", fabric: "Cotton Blend", supplier: "SUP-001", required: "4,200 m", recommended: "5,000 m", lead: "12 days", risk: "Low" },
  { sku: "SKU002", item: "Denim Jacket", fabric: "Denim", supplier: "SUP-002", required: "8,600 m", recommended: "10,000 m", lead: "21 days", risk: "High" },
  { sku: "SKU003", item: "Linen Shirt", fabric: "Linen", supplier: "SUP-004", required: "3,100 m", recommended: "3,400 m", lead: "16 days", risk: "Medium" },
  { sku: "SKU004", item: "Knit Cardigan", fabric: "Merino Wool", supplier: "SUP-003", required: "2,050 m", recommended: "2,200 m", lead: "9 days", risk: "Low" },
];

const RISK_TONE = {
  Low: "border-teal-line bg-teal-soft text-teal-strong",
  Medium: "border-warn-line bg-warn-soft text-warn",
  High: "border-danger-line bg-danger-soft text-danger",
};

const CAPTIONS = [
  { title: "Demand planning", body: "Forecasts and open orders set the quantity every downstream plan is built against." },
  { title: "Inventory & production", body: "Stock on hand and line capacity decide what gets made in-house versus bought in." },
  { title: "Supplier risk", body: "Lead time history and supplier reliability raise the risk flag before an order is placed." },
];

export default function PlanSection() {
  return (
    <section id="planning" className="border-b border-border bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-primary">P2 &middot; PLANNING</span>
              <h2 className="max-w-[16ch] text-[32px] leading-[1.14] font-semibold tracking-tight text-ink sm:text-[40px]">
                Plan your supply chain before it moves
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-[1.62] text-muted">
              Demand, inventory, production and procurement decisions come together in one planning layer &mdash;
              so a recommended order quantity carries the reasoning that produced it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-card border border-border shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3.5">
              <span className="font-mono text-[11px] tracking-[0.12em] text-muted">
                PROCUREMENT PLAN &middot; PLANNING WEEK 34
              </span>
              <span className="font-mono text-[11px] text-faint">DEMO DATA</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-page">
                    {["SKU", "Item", "Fabric", "Supplier", "Required", "Recommended", "Lead time", "Risk", "Status"].map(
                      (h) => (
                        <th key={h} className="px-5 py-3 text-[11.5px] font-medium tracking-wide text-faint uppercase">{h}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={r.sku} className={"border-b border-border-soft transition-colors hover:bg-surface " + (i % 2 === 1 ? "bg-surface" : "bg-page")}>
                      <td className="px-5 py-4 font-mono text-[12.5px] text-muted">{r.sku}</td>
                      <td className="px-5 py-4 text-[14px] font-medium text-ink">{r.item}</td>
                      <td className="px-5 py-4 text-[13.5px] text-muted">{r.fabric}</td>
                      <td className="px-5 py-4 font-mono text-[12.5px] text-muted">{r.supplier}</td>
                      <td className="px-5 py-4 text-[13.5px] text-muted">{r.required}</td>
                      <td className="px-5 py-4 text-[14px] font-medium text-ink">{r.recommended}</td>
                      <td className="px-5 py-4 text-[13.5px] text-muted">{r.lead}</td>
                      <td className="px-5 py-4">
                        <span className={"rounded-chip border px-2 py-0.5 font-mono text-[10.5px] font-medium " + RISK_TONE[r.risk]}>{r.risk.toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                          <span className={"h-1.5 w-1.5 rounded-full " + (r.risk === "High" ? "bg-amber-mid" : "bg-teal")} />
                          {r.risk === "High" ? "Awaiting approval" : "Planned"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {CAPTIONS.map((c, i) => (
            <Reveal key={c.title} delay={80 * i}>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="text-[14.5px] font-medium text-ink">{c.title}</span>
                <span className="text-[13.5px] leading-relaxed text-muted">{c.body}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
