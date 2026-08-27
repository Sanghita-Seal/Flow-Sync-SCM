import { useEffect, useState } from "react";
import { Clock, MapPin, Navigation, Truck, Warehouse } from "lucide-react";
import Reveal from "./Reveal";

const ROUTE = [
  [46, 236], [112, 202], [168, 218], [236, 162],
  [298, 180], [360, 124], [424, 102], [472, 66],
];

function pointAt(progress) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < ROUTE.length; i += 1) {
    const dx = ROUTE[i][0] - ROUTE[i - 1][0];
    const dy = ROUTE[i][1] - ROUTE[i - 1][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segs.push(len);
    total += len;
  }
  let target = Math.max(0, Math.min(1, progress)) * total;
  for (let i = 0; i < segs.length; i += 1) {
    if (target <= segs[i]) {
      const t = segs[i] === 0 ? 0 : target / segs[i];
      return [
        ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * t,
        ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * t,
      ];
    }
    target -= segs[i];
  }
  return ROUTE[ROUTE.length - 1];
}

const POLY = ROUTE.map((p) => p.join(",")).join(" ");

const FIELDS = [
  { label: "Shipment", value: "SHP-003", mono: true },
  { label: "Tracking", value: "TRK-003", mono: true },
  { label: "Truck / trailer", value: "TRAILER-003", mono: true },
  { label: "Current location", value: "New Town, Kolkata", mono: false },
];

const EXEC_NOTES = [
  { icon: Navigation, label: "Live location", note: "Position refreshed against the planned route" },
  { icon: Clock, label: "ETA visibility", note: "Arrival window recalculated as the trip progresses" },
  { icon: Warehouse, label: "Yard & dock", note: "Gate-in, dock assignment and unload confirmation" },
];

export default function ExecuteSection() {
  const [progress, setProgress] = useState(0.62);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => (prev >= 0.94 ? 0.18 : prev + 0.0022));
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  const [tx, ty] = pointAt(progress);
  const pct = Math.round(progress * 100);

  return (
    <section id="execution" className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-cyan-deep">E2 &middot; EXECUTION</span>
              <h2 className="max-w-[16ch] text-[32px] leading-[1.14] font-semibold tracking-tight text-ink sm:text-[40px]">
                Know where every shipment stands
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-[1.62] text-muted">
              Once a procurement plan turns into a shipment, execution takes over &mdash; truck, trailer,
              location, ETA and delivery status, all against the plan that created it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="overflow-hidden rounded-card border border-border bg-page shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <span className="font-mono text-[11px] tracking-[0.12em] text-muted">ROUTE &middot; SHP-003</span>
                <span className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-surface px-2 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-faint" />
                  <span className="font-mono text-[10.5px] font-medium tracking-wide text-muted">GPS SIMULATION</span>
                </span>
              </div>

              <div className="bg-surface-2 p-2">
                <svg viewBox="0 0 520 290" className="h-full w-full" role="img" aria-label="Simulated shipment route">
                  <rect x="0" y="0" width="520" height="290" fill="#f1f5f9" />
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <line key={"h" + r} x1="0" y1={r * 52} x2="520" y2={r * 52} stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                    <line key={"v" + c} x1={c * 58} y1="0" x2={c * 58} y2="290" stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  <polyline points={POLY} fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 7" />
                  <polyline points={POLY} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={String(progress * 700) + " 700"} />
                  <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="7" fill="#ffffff" stroke="#0d9488" strokeWidth="3" />
                  <text x={ROUTE[0][0] + 14} y={ROUTE[0][1] + 5} fill="#0b2545" fontSize="12" fontWeight="500" fontFamily="Instrument Sans, sans-serif">Ludhiana</text>
                  <circle cx={ROUTE[ROUTE.length - 1][0]} cy={ROUTE[ROUTE.length - 1][1]} r="7" fill="#ffffff" stroke="#1d4ed8" strokeWidth="3" />
                  <text x={ROUTE[ROUTE.length - 1][0] - 8} y={ROUTE[ROUTE.length - 1][1] - 14} fill="#0b2545" fontSize="12" fontWeight="500" textAnchor="end" fontFamily="Instrument Sans, sans-serif">Kolkata</text>
                  <circle cx={tx} cy={ty} r="14" fill="#1d4ed8" opacity="0.14" />
                  <circle cx={tx} cy={ty} r="6.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
                <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                  <MapPin size={14} strokeWidth={1.5} className="text-primary" />
                  {pct}% of planned route completed
                </span>
                <span className="font-mono text-[11.5px] text-faint">DEMO SHIPMENT</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-card border border-border bg-page p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-node bg-primary-soft">
                  <Truck size={18} strokeWidth={1.5} className="text-primary" />
                </span>
                <span className="rounded-chip bg-primary-soft px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide text-primary">IN TRANSIT</span>
              </div>

              <div className="flex flex-col divide-y divide-border-soft">
                {FIELDS.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-[13px] text-faint">{f.label}</span>
                    <span className={f.mono ? "font-mono text-[13px] font-medium text-ink" : "text-[13.5px] font-medium text-ink"}>{f.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-node border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-muted">Estimated arrival</span>
                  <span className="text-[15px] font-semibold tracking-tight text-ink">27 Aug, 14:20 IST</span>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary-tint" style={{ width: pct + "%" }} />
                </div>
                <p className="mt-3 text-[12.5px] leading-snug text-faint">
                  Movement shown here is simulated on the front end from the last known coordinates. It is not
                  live GPS telemetry.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {EXEC_NOTES.map((n, i) => {
            const Icon = n.icon;
            return (
              <Reveal key={n.label} delay={80 * i}>
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <Icon size={17} strokeWidth={1.5} className="text-cyan-deep" />
                  <span className="text-[14.5px] font-medium text-ink">{n.label}</span>
                  <span className="text-[13.5px] leading-relaxed text-muted">{n.note}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
