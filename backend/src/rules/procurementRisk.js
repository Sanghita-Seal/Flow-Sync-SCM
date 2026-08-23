export function evaluateProcurementRisk({
  requiredFabric,
  recommendedOrderQty,
  leadTimeWeeks,
  planningWeekNumber,
}) {
  if (
    recommendedOrderQty < requiredFabric
  ) {
    return {
      type: "PROCUREMENT_SHORTAGE",
      severity: "HIGH",
      message:
        "Recommended procurement quantity is below required fabric.",
      recommendedAction:
        "Increase the procurement order quantity.",
    };
  }

  if (leadTimeWeeks >= 4) {
    return {
      type: "LONG_LEAD_TIME",
      severity: "MEDIUM",
      message:
        "Supplier lead time may affect production planning.",
      recommendedAction:
        "Place the order early or consider an alternate supplier.",
    };
  }

  return null;
}