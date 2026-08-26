import { UserButton, useAuth } from "@clerk/clerk-react";
import { useSidebar } from "../../context/SidebarContext";
import { Bell, Menu } from "../ui/Icons";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu width={20} height={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900">SCM Control Tower</h1>
          <p className="text-xs text-slate-600 hidden sm:block">Supply chain visibility &amp; planning</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System operational
        </div>

        <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
          <Bell width={18} height={18} />
        </button>

        {isSignedIn && (
          <div className="border-l border-slate-200 pl-2 sm:pl-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
