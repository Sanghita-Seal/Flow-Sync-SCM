import Brand from "./Brand";

const COLUMNS = [
  { title: "Planning", links: ["Demand planning", "Inventory planning", "Production planning", "Procurement"] },
  { title: "Execution", links: ["Shipments", "Truck & trailer", "Yard & dock", "Delivery status"] },
  { title: "Platform", links: ["Insights", "S&OP recommendations", "Dashboard", "About"] },
];

export default function Footer() {
  return (
    <footer id="about" className="bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Brand size={28} />
              <span className="text-[15px] font-semibold tracking-tight text-ink">FlowSync</span>
            </div>
            <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-muted">
              Integrated supply chain planning and execution &mdash; one loop from forecast to delivery and back
              again.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((c) => (
              <div key={c.title} className="flex flex-col gap-3">
                <span className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-faint">
                  {c.title.toUpperCase()}
                </span>
                <div className="flex flex-col gap-2.5">
                  {c.links.map((l) => (
                    <a
                      key={l}
                      href="#top"
                      className="text-[13.5px] text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <span className="text-[13px] text-faint">&copy; 2026 FlowSync. Demo environment.</span>
          <div className="flex items-center gap-6">
            <a href="#top" className="text-[13px] text-faint transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#top" className="text-[13px] text-faint transition-colors hover:text-ink">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
