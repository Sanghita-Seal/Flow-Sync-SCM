import { createContext, useContext, useState, useEffect } from "react";
import { getCycles } from "../features/p2/sop/sop.service";

const CycleContext = createContext(null);

export function CycleProvider({ children }) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCycles()
      .then((data) => {
        setCycles(data);
        const active = data.find((c) => c.status === "ACTIVE");
        if (active) {
          setSelectedCycleId(active.id);
        } else if (data.length > 0) {
          setSelectedCycleId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load cycles:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  return (
    <CycleContext.Provider
      value={{ cycles, selectedCycleId, setSelectedCycleId, selectedCycle, loading }}
    >
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error("useCycle must be used within a CycleProvider");
  }
  return context;
}
