// Derived client-side from truck/dock data — no dedicated backend
// alerts endpoint exists yet.

export function getAlerts(trucks, docks) {
  const alerts = [];

  trucks.forEach((t) => {
    if (t.status === "DELAYED") {
      alerts.push({
        id: `delay-${t.id}`,
        severity: "high",
        message: `${t.trailerId} is delayed`,
      });
    }
  });

  const availableCount = docks.filter((d) => d.status === "AVAILABLE").length;
  if (availableCount === 0) {
    alerts.push({
      id: "no-docks",
      severity: "high",
      message: "No docks currently available across any yard",
    });
  }

  const arrivedWithoutOpenDock = trucks.filter((t) => {
    if (t.status !== "ARRIVED" || !t.yardName) return false;
    const yardHasOpenDock = docks.some(
      (d) => d.yardName === t.yardName && d.status === "AVAILABLE"
    );
    return !yardHasOpenDock;
  });

  arrivedWithoutOpenDock.forEach((t) => {
    alerts.push({
      id: `reassign-${t.id}`,
      severity: "medium",
      message: `${t.trailerId} needs dock reassignment — no dock free in ${t.yardName}`,
    });
  });

  return alerts;
}