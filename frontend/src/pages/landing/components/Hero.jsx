import { ArrowRight, Boxes, Eye, Route, TrendingUp, Truck, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { useAuth } from "../../../context/AuthContext";
import Reveal from "./Reveal";

const VALUES = [
  { icon: Eye, label: "End-to-end visibility", note: "Plan to pallet, one timeline" },
  { icon: Route, label: "Planning + execution", note: "Two systems, one cycle" },
  { icon: TrendingUp, label: "Actionable insights", note: "Signals, not dashboards" },
  { icon: Boxes, label: "Data-driven decisions", note: "Every replan is evidenced" },
];

export default function Hero() {
  const { isSignedIn, isManager } = useAuth();

  return (
    <section id="top" className="border-b border-border bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-2 rounded-chip border border-primary-line bg-primary-soft px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-mid" />
                <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-primary">
                  PLAN &rarr; EXECUTE &rarr; REPLAN
                </span>
              </div>

              <h1 className="max-w-[15ch] text-[42px] leading-[1.06] font-semibold tracking-tight text-ink sm:text-[54px] lg:text-[58px]">
                Plan smarter. Execute faster. Optimize your supply chain.
              </h1>

              <p className="max-w-[54ch] text-[17px] leading-[1.6] text-muted">
                Connect supply chain planning and execution in one intelligent platform. Turn demand,
                procurement and production plans into real-time shipment visibility and actionable S&OP
                decisions.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {isSignedIn && isManager ? (
                  <Link
                    to="/dashboard"
                    className="group flex items-center justify-center gap-2 rounded-node bg-primary px-5 py-3 text-[15px] font-medium text-page transition-colors hover:bg-primary-strong"
                  >
                    Open Dashboard
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                ) : (
                  <Link
                    to="/track"
                    className="group flex items-center justify-center gap-2 rounded-node bg-primary px-5 py-3 text-[15px] font-medium text-page transition-colors hover:bg-primary-strong"
                  >
                    Track Your Order
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                )}
                <a
                  href="#loop"
                  className="rounded-node border border-border bg-page px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-surface"
                >
                  Explore Platform
                </a>
              </div>

              <div className="mt-4 grid w-full grid-cols-2 gap-x-6 gap-y-5 border-t border-border-soft pt-7 lg:grid-cols-4 lg:gap-x-4">
                {VALUES.map((v) => {
                  const Icon = v.icon;
                  return (
                    <div key={v.label} className="flex flex-col gap-1.5">
                      <Icon size={17} strokeWidth={1.5} className="text-primary-mid" />
                      <span className="text-[13.5px] font-medium leading-tight text-ink">{v.label}</span>
                      <span className="text-[12.5px] leading-snug text-faint">{v.note}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="flex flex-col">
              <div className="rounded-card border border-border bg-page p-4 shadow-lift">
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className="font-mono text-[10.5px] tracking-[0.14em] text-faint">
                    PROCUREMENT PLAN &middot; WK 34
                  </span>
                  <span className="rounded-chip bg-danger-soft px-2 py-0.5 font-mono text-[10.5px] font-medium text-danger">
                    HIGH RISK
                  </span>
                </div>
                <div className="rounded-node border border-border bg-surface p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[12px] text-muted">SKU002</span>
                      <span className="text-[16px] font-medium text-ink">Denim Jacket</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[19px] font-semibold tracking-tight text-ink">10,000 m</span>
                      <span className="text-[12px] text-faint">recommended order</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11.5px] text-faint">Fabric</span>
                      <span className="text-[13px] font-medium text-body">Denim</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11.5px] text-faint">Supplier</span>
                      <span className="font-mono text-[12.5px] text-body">SUP-002</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11.5px] text-faint">Lead time</span>
                      <span className="text-[13px] font-medium text-body">21 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 pl-7">
                <span className="h-8 w-px bg-teal-line" />
                <span className="rounded-chip border border-teal-line bg-teal-soft px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide text-teal-strong">
                  SHIPMENT CREATED
                </span>
              </div>

              <div className="rounded-card border border-border bg-page p-4 shadow-card lg:ml-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-node bg-primary-soft">
                      <Truck size={17} strokeWidth={1.5} className="text-primary" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[13px] font-medium text-ink">SHP-003</span>
                      <span className="text-[12.5px] text-faint">New Town, Kolkata</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-chip bg-primary-soft px-2 py-0.5 font-mono text-[10.5px] font-medium text-primary">
                      IN TRANSIT
                    </span>
                    <span className="text-[12px] text-faint">ETA 14:20, 27 Aug</span>
                  </div>
                </div>
                <div className="mt-3.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full w-[68%] rounded-full bg-primary-tint" />
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 pl-7">
                <span className="h-8 w-px bg-amber-line" />
                <span className="rounded-chip border border-amber-line bg-amber-soft px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide text-amber">
                  STATUS RETURNS TO PLANNING
                </span>
              </div>

              <div className="flex items-start gap-3 rounded-card border border-warn-line bg-warn-soft p-4 lg:ml-16">
                <ShieldAlert size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warn" />
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium text-ink">
                    Late arrival puts Wk 35 production at risk
                  </span>
                  <span className="text-[12.5px] leading-snug text-muted">
                    S&OP recommends an alternate supply plan &mdash; review before Thursday's cycle.
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
