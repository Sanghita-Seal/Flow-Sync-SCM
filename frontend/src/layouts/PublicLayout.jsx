/**
 * Minimal layout for public-facing pages (no login, no Sidebar/Navbar
 * with internal navigation). Used for the customer delivery/truck
 * tracker at /track.
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-14 flex items-center px-6 border-b border-slate-200 bg-white">
        <span className="text-sm font-semibold text-slate-900">TrendWear Apparel — Shipment Tracking</span>
      </header>
      <main className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
