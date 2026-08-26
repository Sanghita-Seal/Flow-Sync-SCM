import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Reveal from "./Reveal";

const METRICS = [
  { value: 10, label: "Procurement plans" },
  { value: 10, label: "Active shipments" },
  { value: 6, label: "In-transit trucks" },
  { value: 2, label: "Delayed shipments" },
  { value: 10, label: "Tracked SKUs" },
];

function useCountUp(target, run) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const steps = 32;
    const id = window.setInterval(() => {
      frame += 1;
      setN(Math.round((target * frame) / steps));
      if (frame >= steps) window.clearInterval(id);
    }, 26);
    return () => window.clearInterval(id);
  }, [target, run]);
  return n;
}

function Metric({ value, label, run }) {
  const n = useCountUp(value, run);
  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-5">
      <span className="text-[36px] leading-none font-semibold tracking-tight text-ink tabular-nums">{n}</span>
      <span className="text-[13.5px] text-muted">{label}</span>
    </div>
  );
}

export default function ClosingCTA() {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  const { isSignedIn, isManager } = useAuth();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-24">
        <div ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10">
          {METRICS.map((m) => (
            <Metric key={m.label} value={m.value} label={m.label} run={run} />
          ))}
        </div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.1em] text-faint">
          DEMO ENVIRONMENT FIGURES
        </p>

        <Reveal delay={100}>
          <div className="mt-16 flex flex-col items-start gap-8 rounded-card border border-primary-line bg-primary-soft px-8 py-12 sm:px-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="flex max-w-[34ch] flex-col gap-4">
              <h2 className="text-[32px] leading-[1.1] font-semibold tracking-tight text-ink sm:text-[42px]">
                Bring planning and execution together
              </h2>
              <p className="text-[16px] leading-[1.6] text-muted">
                Make faster supply chain decisions with connected planning, procurement and execution
                visibility &mdash; on one continuous loop.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isSignedIn && isManager ? (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-node bg-primary px-5 py-3 text-[15px] font-medium text-page transition-colors hover:bg-primary-strong"
                >
                  Open SCM Dashboard
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              ) : (
                <Link
                  to="/track"
                  className="flex items-center justify-center gap-2 rounded-node bg-primary px-5 py-3 text-[15px] font-medium text-page transition-colors hover:bg-primary-strong"
                >
                  Track Your Order
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              )}
              <a
                href="#loop"
                className="rounded-node border border-border bg-page px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-surface"
              >
                Explore planning
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
