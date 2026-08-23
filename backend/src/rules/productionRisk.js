export function evaluateProductionRisk({
  forecastDemand,
  openingInventory,
  productionCapacity,
  plannedProduction,
}) {
  const requiredProduction = Math.max(
    0,
    forecastDemand - openingInventory
  );

  if (
    requiredProduction > productionCapacity
  ) {
    return {
      type: "CAPACITY_SHORTAGE",
      severity: "HIGH",
      message:
        "Production capacity is insufficient to meet forecast demand.",
      recommendedAction:
        "Increase production capacity or use an alternate plant.",
    };
  }

  if (
    productionCapacity > 0 &&
    plannedProduction / productionCapacity >= 0.9
  ) {
    return {
      type: "HIGH_CAPACITY_UTILIZATION",
      severity: "MEDIUM",
      message:
        "Production capacity utilization is very high.",
      recommendedAction:
        "Monitor capacity closely and evaluate backup capacity.",
    };
  }

  return null;
}