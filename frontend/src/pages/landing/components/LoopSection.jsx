import { Fragment } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import Reveal from "./Reveal";

const PLAN = [
  { title: "Demand & Inventory", note: "Forecast demand, read stock on hand" },
  { title: "Production Plan", note: "Set what gets made, and when" },
  { title: "Procurement Plan", note: "Order fabric from suppliers" },
];

const EXECUTE = [
  { title: "Truck & Trailer", note: "Load assigned, shipment dispatched" },
  { title: "Location & ETA", note: "Where it is, when it lands" },
  { title: "Delivery Status", note: "Arrived at yard, dock, or late" },
];

const RESPOND = [
  { title: "Supply Risk", note: "A late truck puts production at risk", tone: "warn" },
  { title: "S&OP Recommendation", note: "A suggested action, with reasoning" },
  { title: "Replan", note: "The cycle restarts, better informed", tone: "primary" },
];

function NodeCard({ node }) {
  const tone =
    node.tone === "warn"
      ? "border-warn-line bg-warn-soft"
      : node.tone === "primary"
        ? "border-primary-line bg-primary-soft"
        : "border-border bg-surface";
  const title = node.tone === "primary" ? "text-primary" : "text-body";
  const note = node.tone === "primary" ? "text-primary-tint" : "text-muted";

  return (
    <div className={"flex flex-1 flex-col gap-1 rounded-node border px-4 py-3.5 " + tone}>
      <span className={"text-[14.5px] font-medium leading-tight " + title}>{node.title}</span>
      <span className={"text-[12.5px] leading-snug " + note}>{node.note}</span>
    </div>
  );
}

function Rail({ code, name, gloss, accent, nodes, reverse = false }) {
  const arrow = reverse ? "\u2190" : "\u2192";
  const dir = reverse ? "md:flex-row-reverse" : "md:flex-row";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-7">
      <div className={"flex shrink-0 flex-col justify-center gap-1 md:w-[132px] md:border-r-2 md:pr-5 " + accent}>
        <span className="font-mono text-[11px] font-semibold tracking-[0.1em] text-primary">{code}</span>
        <span className="text-[14px] font-medium text-ink">{name}</span>
        <span className="text-[12px] leading-snug text-faint">{gloss}</span>
      </div>
      <div className={"flex flex-1 flex-col items-stretch gap-3 md:items-center md:gap-3.5 " + dir}>
        {nodes.map((n, i) => (
          <Fragment key={n.title}>
            {i > 0 ? <span className="hidden text-[17px] text-faint md:inline">{arrow}</span> : null}
            <NodeCard node={n} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function LoopSection() {
  return (
    <section id="loop" className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-28">
        <Reveal>
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 rounded-chip border border-primary-line bg-primary-soft px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-mid" />
              <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-primary">
                ONE CONNECTED PLATFORM
              </span>
            </div>
            <h2 className="text-[34px] leading-[1.12] font-semibold tracking-tight text-ink sm:text-[42px]">
              Every plan becomes a shipment.
              <br className="hidden sm:block" /> Every shipment reshapes the plan.
            </h2>
            <p className="text-[16px] leading-[1.62] text-muted">
              Planning and execution are usually two disconnected systems. Here they run as one continuous
              cycle &mdash; what you decide on Monday shows up on a truck, and what happens to that truck
              changes what you decide next.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 rounded-card border border-border bg-page px-6 py-8 shadow-card sm:px-10 sm:py-10">
            <Rail code="P2" name="Planning" gloss="Deciding what is needed" accent="md:border-primary-line" nodes={PLAN} />

            <div className="flex items-center gap-2.5 py-4 md:justify-end">
              <span className="inline-flex items-center gap-2 rounded-chip border border-teal-line bg-teal-soft px-3 py-1.5">
                <span className="font-mono text-[11px] font-medium tracking-wide text-teal-strong">SHIPMENT CREATED</span>
                <ArrowDown size={13} strokeWidth={2} className="text-teal" />
              </span>
              <span className="h-6 w-0.5 bg-teal-line" />
            </div>

            <Rail code="E2" name="Execution" gloss="What actually moves" accent="md:border-cyan-line" nodes={EXECUTE} reverse />

            <div className="flex items-center gap-2.5 py-4 md:pl-[160px]">
              <span className="h-6 w-0.5 bg-amber-line" />
              <span className="inline-flex items-center gap-2 rounded-chip border border-amber-line bg-amber-soft px-3 py-1.5">
                <ArrowDown size={13} strokeWidth={2} className="text-amber-mid" />
                <span className="font-mono text-[11px] font-medium tracking-wide text-amber">EXECUTION STATUS RETURNS</span>
              </span>
            </div>

            <Rail code="P2" name="Response" gloss="Deciding what to change" accent="md:border-primary-line" nodes={RESPOND} />

            <div className="mt-8 flex items-center gap-3 border-t border-dashed border-border pt-6">
              <RefreshCw size={15} strokeWidth={1.5} className="shrink-0 text-primary-mid" />
              <span className="text-[13.5px] font-medium leading-snug text-muted">
                The replan feeds straight back into demand and inventory &mdash; the loop has no end point.
              </span>
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-center text-[12.5px] leading-relaxed text-faint">
          <span className="font-medium text-muted">S&OP</span> &mdash; Sales & Operations Planning, the
          recurring review where demand, supply and production plans are agreed.
        </p>
      </div>
    </section>
  );
}
