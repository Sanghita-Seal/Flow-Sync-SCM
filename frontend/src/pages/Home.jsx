import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function Home() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">SCM Control Tower</h1>
        <p className="text-slate-600 mb-8">Supply chain visibility &amp; planning</p>
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Sign in
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
