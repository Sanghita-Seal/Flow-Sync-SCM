import { SignInButton, UserButton, SignOutButton } from "@clerk/clerk-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { isSignedIn, isManager, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Flow Sync</h1>
        <p className="text-slate-600 mb-8">Supply chain visibility &amp; planning</p>

        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Sign in
            </button>
          </SignInButton>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-slate-400">Role: {role}</div>
            {isManager && (
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
              >
                Go to Dashboard
              </button>
            )}
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <SignOutButton>
                <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
