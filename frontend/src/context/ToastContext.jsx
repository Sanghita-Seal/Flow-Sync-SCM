import { createContext, useContext } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  return <ToastContext.Provider value={{ showToast: () => {} }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
}