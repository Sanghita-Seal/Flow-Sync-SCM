import { Link } from "react-router-dom";
import Brand from "../pages/landing/components/Brand";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-page font-sans antialiased">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b border-border bg-page">
        <Link to="/" className="flex items-center gap-3">
          <Brand />
          <span className="text-[15px] font-semibold tracking-tight text-ink">FlowSync</span>
        </Link>
        <Link to="/" className="text-[13px] font-medium text-muted hover:text-ink transition-colors">
          Back to home
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
