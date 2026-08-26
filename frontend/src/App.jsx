import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
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
    return <Navigate to="/" replace />;
  }

  return children;
}

function AuthGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
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
