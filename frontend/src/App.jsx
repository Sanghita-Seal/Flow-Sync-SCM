import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CycleProvider } from "./context/CycleContext";
import { SidebarProvider } from "./context/SidebarContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CycleProvider>
            <SidebarProvider>
              <AppRoutes />
            </SidebarProvider>
          </CycleProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
