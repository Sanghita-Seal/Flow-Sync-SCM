import { createContext, useContext, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded } = useUser();
  const { isSignedIn, signOut } = useClerkAuth();

  // Force reload user to get fresh metadata after dashboard edits
  useEffect(() => {
    if (user) {
      user.reload();
    }
  }, [user?.id]);

  const role = user?.publicMetadata?.role || "user";

  const value = {
    user: user ? { name: user.fullName || user.firstName || "User", email: user.primaryEmailAddress?.emailAddress || "" } : null,
    isLoaded,
    isSignedIn,
    isAuthenticated: isSignedIn,
    isManager: role === "manager",
    role,
    logout: () => signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
