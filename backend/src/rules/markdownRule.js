export function evaluateMarkdownOpportunity({
  projectedEndingInventory,
  forecastDemand,
  openingInventory,
}) {
  if (forecastDemand <= 0) return null;

  const weeksOfSupply = projectedEndingInventory / (forecastDemand / 4);

  if (weeksOfSupply > 4) {
    return {
      type: "MARKDOWN_OPPORTUNITY",
      severity: "HIGH",
      message: `Excess stock covers ${Math.round(weeksOfSupply)} weeks of demand — aggressive markdown recommended.`,
      recommendedAction:
        "Apply 30–50% markdown to clear slow-moving inventory before new season.",
    };
  }

  if (weeksOfSupply > 2 && projectedEndingInventory > openingInventory * 0.3) {
    return {
      type: "MARKDOWN_OPPORTUNITY",
      severity: "MEDIUM",
      message: `Inventory buildup detected (${Math.round(weeksOfSupply)} weeks coverage). Consider promotional pricing.`,
      recommendedAction:
        "Run targeted promotions or bundle deals to accelerate sell-through.",
    };
  }

  return null;
}