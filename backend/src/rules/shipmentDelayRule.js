export function evaluateShipmentDelayRisk({
  plannedArrival,
  currentEta,
  shipmentStatus,
  truckStatus,
  plannedQuantity,
  receivedQuantity,
}) {
  // No shipment data
  if (!plannedArrival || !currentEta) {
    return null;
  }

  // Shipment has already arrived/completed
  const completedStatuses = [
    "ARRIVED",
    "COMPLETED",
  ];

  if (
    completedStatuses.includes(String(shipmentStatus).toUpperCase()) ||
    completedStatuses.includes(String(truckStatus).toUpperCase())
  ) {
    return null;
  }

  // Material is already fully received
  if (
    plannedQuantity != null &&
    receivedQuantity != null &&
    Number(receivedQuantity) >= Number(plannedQuantity)
  ) {
    return null;
  }

  const plannedDate = new Date(plannedArrival);
  const etaDate = new Date(currentEta);

  if (
    Number.isNaN(plannedDate.getTime()) ||
    Number.isNaN(etaDate.getTime())
  ) {
    return null;
  }

  // ETA is not later than planned arrival
  if (etaDate <= plannedDate) {
    return null;
  }

  const delayDays = Math.ceil(
    (etaDate.getTime() - plannedDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    type: "SHIPMENT_DELAY",
    severity: delayDays >= 3 ? "HIGH" : "MEDIUM",
    message: `Shipment is expected to arrive ${delayDays} day${
      delayDays === 1 ? "" : "s"
    } late and may affect production.`,
    recommendedAction:
      "Monitor the delayed shipment and consider an alternate supply or production plan.",
  };
}