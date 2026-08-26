import { useState, useEffect, useRef } from "react";
import { checkDockAvailability, checkYardCapacity } from "../features/e2/alerts/alert.service";

/**
 * Watches trucks and checks dock availability + yard capacity
 * when a truck arrives or is delayed. Returns any operational warnings.
 */
export default function useYardAlerts(trucks) {
  const [warnings, setWarnings] = useState([]);
  const checkedRef = useRef(new Set());

  useEffect(() => {
    if (!trucks || trucks.length === 0) return;

    async function check() {
      const newWarnings = [];

      for (const t of trucks) {
        if (t.status !== "ARRIVED" && t.status !== "DELAYED") continue;
        if (!t.yardName) continue;

        const key = `${t.trailerId}-${t.yardName}`;
        if (checkedRef.current.has(key)) continue;
        checkedRef.current.add(key);

        try {
          const [dockResult, yardResult] = await Promise.all([
            checkDockAvailability(t.yardName).catch(() => null),
            checkYardCapacity(t.yardName).catch(() => null),
          ]);

          if (dockResult && !dockResult.available) {
            newWarnings.push({
              type: "DOCK_UNAVAILABLE",
              trailerId: t.trailerId,
              yardName: t.yardName,
              message: `No dock available in ${t.yardName} for ${t.trailerId}`,
            });
          }

          if (yardResult && yardResult.full) {
            newWarnings.push({
              type: "YARD_FULL",
              trailerId: t.trailerId,
              yardName: t.yardName,
              message: `Yard ${t.yardName} is at full capacity`,
            });
          }
        } catch {
          // Silently ignore check failures
        }
      }

      if (newWarnings.length > 0) {
        setWarnings((prev) => [...prev, ...newWarnings]);
      }
    }

    check();
  }, [trucks]);

  return warnings;
}
