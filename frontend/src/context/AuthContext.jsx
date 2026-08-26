import { createContext, useContext } from "react";

// STUB — auth is not wired up yet (Neon Auth will replace this later).
// Always reports a logged-in placeholder user so the rest of the app
// can be built and tested now without waiting on real authentication.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = {
    user: { name: "Guest", email: "guest@example.com" },
    isAuthenticated: true, // hardcoded true until Neon Auth is wired in
    isLoading: false,
    login: () => {},
    logout: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}