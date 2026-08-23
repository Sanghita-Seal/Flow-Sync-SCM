export function evaluateMarkdownOpportunity({
  projectedEndingInventory,
  forecastDemand,
}) {
  if (
    projectedEndingInventory > forecastDemand * 0.5
  ) {
    return {
      type: "MARKDOWN_OPPORTUNITY",
      severity: "MEDIUM",
      message:
        "High projected inventory indicates a possible markdown opportunity.",
      recommendedAction:
        "Evaluate markdown pricing to reduce excess inventory.",
    };
  }

  return null;
}