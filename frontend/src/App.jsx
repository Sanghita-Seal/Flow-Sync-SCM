import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CycleProvider } from "./context/CycleContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CycleProvider>
            <AppRoutes />
          </CycleProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
