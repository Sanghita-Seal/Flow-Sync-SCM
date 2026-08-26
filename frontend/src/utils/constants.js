export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const AUTH_TOKEN_KEY = "scm_auth_token";
export const AUTH_USER_KEY = "scm_auth_user";

export const STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  DELAYED: "DELAYED",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  HEALTHY: "HEALTHY",
  SHORTAGE: "SHORTAGE",
  EXCESS: "EXCESS",
};

export const STATUS_TONE = {
  AVAILABLE: "emerald",
  OCCUPIED: "slate",
  DELAYED: "rose",
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "slate",
  HEALTHY: "emerald",
  SHORTAGE: "rose",
  EXCESS: "amber",
};

export const TONE_STYLES = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
};
