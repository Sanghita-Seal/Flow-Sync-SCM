import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, RedirectToSignIn } from "@clerk/clerk-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CycleProvider } from "./context/CycleContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppRoutes from "./routes/AppRoutes";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ManagerGuard({ children }) {
  const { isManager, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You need manager privileges to access the dashboard.</p>
          <a href="/" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}

function AuthGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CycleProvider>
              <SidebarProvider>
                <AppRoutes ManagerGuard={ManagerGuard} AuthGate={AuthGate} />
              </SidebarProvider>
            </CycleProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
}
