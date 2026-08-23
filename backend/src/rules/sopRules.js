import { evaluateInventoryRisk } from "./inventoryRisk.js";
import { evaluateProductionRisk } from "./productionRisk.js";
import { evaluateProcurementRisk } from "./procurementRisk.js";
import { evaluateMarkdownOpportunity } from "./markdownRule.js";

export function calculateSopPlan({
  forecastDemand,
  openingInventory,
  productionCapacity,
}) {
  const requiredProduction = Math.max(
    0,
    forecastDemand - openingInventory
  );

  const plannedProduction = Math.min(
    requiredProduction,
    productionCapacity
  );

  const projectedEndingInventory =
    openingInventory +
    plannedProduction -
    forecastDemand;

  const supplyGap = Math.max(
    0,
    -projectedEndingInventory
  );

  const excessInventory = Math.max(
    0,
    projectedEndingInventory
  );

  let status = "BALANCED";

  if (supplyGap > 0) {
    status = "SHORTAGE";
  } else if (excessInventory > 0) {
    status = "EXCESS";
  }

  return {
    plannedProduction,
    projectedEndingInventory,
    supplyGap,
    excessInventory,
    status,
  };
}

export function generateSopRecommendations({
  forecastDemand,
  openingInventory,
  productionCapacity,
  plannedProduction,
  projectedEndingInventory,
  requiredFabric,
  recommendedOrderQty,
  leadTimeWeeks,
  planningWeekNumber,
}) {
  const recommendations = [];

  const inventoryRisk = evaluateInventoryRisk({
    openingInventory,
    forecastDemand,
    projectedEndingInventory,
  });

  if (inventoryRisk) {
    recommendations.push(inventoryRisk);
  }

  const productionRisk = evaluateProductionRisk({
    forecastDemand,
    openingInventory,
    productionCapacity,
    plannedProduction,
  });

  if (productionRisk) {
    recommendations.push(productionRisk);
  }

  const procurementRisk = evaluateProcurementRisk({
    requiredFabric,
    recommendedOrderQty,
    leadTimeWeeks,
    planningWeekNumber,
  });

  if (procurementRisk) {
    recommendations.push(procurementRisk);
  }

  const markdownOpportunity =
    evaluateMarkdownOpportunity({
      projectedEndingInventory,
      forecastDemand,
    });

  if (markdownOpportunity) {
    recommendations.push(markdownOpportunity);
  }

  return recommendations;
}