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

  // Debug: log full user metadata
  useEffect(() => {
    if (isLoaded && user) {
      console.log("=== CLERK USER DEBUG ===");
      console.log("User ID:", user.id);
      console.log("Email:", user.primaryEmailAddress?.emailAddress);
      console.log("Full Name:", user.fullName);
      console.log("Public Metadata:", JSON.stringify(user.publicMetadata, null, 2));
      console.log("Private Metadata:", JSON.stringify(user.privateMetadata, null, 2));
      console.log("Unsafe Metadata:", JSON.stringify(user.unsafeMetadata, null, 2));
      console.log("Role from metadata:", user.publicMetadata?.role);
      console.log("========================");
    }
  }, [isLoaded, user?.id, user?.publicMetadata]);

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
