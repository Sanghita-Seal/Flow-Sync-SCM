import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Bell, User } from "../ui/Icons";
//import { Bell } from "../ui/Icons";
//import { User } from "../ui/User"; // merge into Icons.jsx if you keep icons in one file

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">SCM Control Tower</h1>
        <p className="text-xs text-slate-600">Supply chain visibility &amp; planning</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System operational
        </div>

        <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
          <Bell width={18} height={18} />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User width={16} height={16} />
          </div>
          <span className="text-sm font-medium text-slate-800">{user?.name || "Guest"}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
