import { ArrowRight, Clock, Factory, ShieldAlert } from "lucide-react";
import Reveal from "./Reveal";

const ALERTS = [
  { icon: Clock, severity: "Critical", title: "Shipment delay", body: "SHP-005 is running 2 days late against plan and may hold up Wk 35 production.", ring: "border-danger-line bg-danger-soft", dot: "bg-danger", tone: "text-danger" },
  { icon: Factory, severity: "High", title: "Capacity risk", body: "Production capacity utilisation is at 91% and approaching the critical threshold.", ring: "border-amber-line bg-amber-soft", dot: "bg-amber-mid", tone: "text-amber" },
  { icon: ShieldAlert, severity: "Watch", title: "Supplier risk", body: "SUP-002 lead time has drifted 4 days over three cycles and affects the next plan.", ring: "border-warn-line bg-warn-soft", dot: "bg-warn", tone: "text-warn" },
];

export default function RespondSection() {
  return (
    <section id="insights" className="border-b border-border bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-amber">P2 &middot; RESPONSE</span>
              <h2 className="max-w-[18ch] text-[32px] leading-[1.14] font-semibold tracking-tight text-ink sm:text-[40px]">
                Turn execution signals into supply chain decisions
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-[1.62] text-muted">
              This is where the loop closes. What execution reports becomes a risk, the risk becomes an S&OP
              recommendation, and the recommendation becomes the next plan.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.05fr]">
          <Reveal delay={80}>
            <div className="flex h-full flex-col overflow-hidden rounded-card border border-border shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3.5">
                <span className="font-mono text-[11px] tracking-[0.12em] text-muted">ALERT CENTRE</span>
                <span className="font-mono text-[11px] text-faint">3 OPEN</span>
              </div>
              <div className="flex flex-1 flex-col divide-y divide-border-soft bg-page">
                {ALERTS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <div key={a.title} className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-surface">
                      <span className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-node border " + a.ring}>
                        <Icon size={15} strokeWidth={1.5} className={a.tone} />
                      </span>
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[14.5px] font-medium text-ink">{a.title}</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className={"h-1.5 w-1.5 rounded-full " + a.dot} />
                            <span className={"font-mono text-[10.5px] font-medium tracking-wide " + a.tone}>{a.severity.toUpperCase()}</span>
                          </span>
                        </div>
                        <span className="text-[13.5px] leading-relaxed text-muted">{a.body}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-border bg-surface px-5 py-3.5 text-[13px] text-muted">
                <span className="font-medium text-ink">Action</span>
                <ArrowRight size={13} strokeWidth={1.5} className="text-faint" />
                <span>Monitor shipment &middot; consider alternate supply &middot; replan</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="flex h-full flex-col gap-5 rounded-card border border-primary-line bg-primary-soft p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-primary">S&OP RECOMMENDATION</span>
                <span className="rounded-chip border border-danger-line bg-page px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide text-danger">HIGH PRIORITY</span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-[24px] leading-tight font-semibold tracking-tight text-ink sm:text-[27px]">
                  Shipment delay may affect production
                </h3>
                <p className="text-[15px] leading-[1.6] text-muted">
                  SHP-003 is expected to arrive after the Wk 35 cut-off. Denim inbound for SKU002 would land
                  two days into the production window.
                </p>
              </div>

              <div className="rounded-node border border-primary-line bg-page p-5">
                <span className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-faint">RECOMMENDED ACTION</span>
                <p className="mt-2.5 text-[15px] leading-[1.6] font-medium text-ink">
                  Monitor the delayed shipment and consider an alternate supply or production plan for SKU002.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border-soft pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-faint">Linked plan</span>
                    <span className="font-mono text-[12.5px] font-medium text-body">PLAN-WK34-002</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-faint">Linked shipment</span>
                    <span className="font-mono text-[12.5px] font-medium text-body">SHP-003</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-faint">Impact window</span>
                    <span className="text-[12.5px] font-medium text-body">Wk 35</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-node bg-primary px-4 py-2.5 text-[14px] font-medium text-page transition-colors hover:bg-primary-strong">Review risk</button>
                <button className="rounded-node border border-border bg-page px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface">View shipment</button>
                <button className="rounded-node border border-border bg-page px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface">Replan</button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
