export function evaluateInventoryRisk({
  openingInventory,
  forecastDemand,
  projectedEndingInventory,
}) {
  if (projectedEndingInventory < 0) {
    return {
      type: "INVENTORY_SHORTAGE",
      severity: "HIGH",
      message: "Projected inventory is insufficient to meet demand.",
      recommendedAction:
        "Increase production or arrange additional supply.",
    };
  }

  if (projectedEndingInventory > forecastDemand * 0.5) {
    return {
      type: "EXCESS_INVENTORY",
      severity: "MEDIUM",
      message: "Projected ending inventory is significantly above demand.",
      recommendedAction:
        "Consider reducing production or applying markdown.",
    };
  }

  return null;
}