import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useAuth } from "../../../context/AuthContext";
import Brand from "./Brand";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "Tracking Your Order", to: "/track" },
  { label: "About", href: "#about" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isSignedIn, isManager } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shell = scrolled ? "border-border bg-page/95 backdrop-blur-sm" : "border-transparent bg-page";

  return (
    <header className={"sticky top-0 z-50 w-full border-b " + shell}>
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-6">
        <a href="#top" className="flex items-center gap-3">
          <Brand />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink">FlowSync</span>
            <span className="mt-1 hidden font-mono text-[10px] tracking-[0.14em] text-faint sm:block">
              SUPPLY CHAIN MANAGEMENT
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) =>
            l.to ? (
              <Link
                key={l.label}
                to={l.to}
                className="text-[14px] font-medium text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] font-medium text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-chip px-3 py-2 text-[14px] font-medium text-muted transition-colors hover:text-ink">
                Sign in
              </button>
            </SignInButton>
          )}
          {isSignedIn && isManager && (
            <Link
              to="/dashboard"
              className="rounded-node bg-primary px-4 py-2.5 text-[14px] font-medium text-page transition-colors hover:bg-primary-strong"
            >
              Open Dashboard
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-node border border-border text-ink lg:hidden"
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-page px-6 py-5 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) =>
              l.to ? (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-node px-2 py-2.5 text-[15px] font-medium text-body hover:bg-surface"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-node px-2 py-2.5 text-[15px] font-medium text-body hover:bg-surface"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {isSignedIn && isManager && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-node bg-primary px-4 py-2.5 text-[14px] font-medium text-page"
              >
                Open Dashboard
              </Link>
            )}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-node border border-border px-4 py-2.5 text-[14px] font-medium text-ink">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
