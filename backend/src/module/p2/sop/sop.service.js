import SopModel from "./sop.model.js";
import { calculateSopPlan } from "../../../rules/sopRules.js";
import { generateSopRecommendations } from "../../../rules/sopRules.js";

class SopService {
  static async getCycles() {
    return await SopModel.getCycles();
  }

  static async getCycleById(cycleId) {
    return await SopModel.getCycleById(cycleId);
  }

  static async createCycle(data) {
    return await SopModel.createCycle(data);
  }

  static async updateCycleStatus(cycleId, status) {
    const cycle = await SopModel.getCycleById(cycleId);

    if (!cycle) {
      const error = new Error("S&OP cycle not found");
      error.statusCode = 404;
      throw error;
    }

    return await SopModel.updateCycleStatus(cycleId, status);
  }

  static async getPlanByCycleId(cycleId) {
    return await SopModel.getPlanByCycleId(cycleId);
  }
  static async getPlanByCycleId(cycleId) {
    return await SopModel.getPlanByCycleId(cycleId);
  }
  static async generatePlan(cycleId) {
    const cycle = await SopModel.getCycleById(cycleId);

    if (!cycle) {
      const error = new Error("S&OP cycle not found");
      error.statusCode = 404;
      throw error;
    }

    if (cycle.status === "CLOSED") {
      const error = new Error("Cannot generate a plan for a closed S&OP cycle");
      error.statusCode = 400;
      throw error;
    }

    const inputs = await SopModel.getPlanningInputs();

    await SopModel.deletePlanByCycleId(cycleId);

    const plan = [];

    for (const item of inputs) {
      const forecastDemand = Number(item.forecast_demand_units);

      const openingInventory = Number(item.opening_inventory_units);

      const productionCapacity = Number(item.production_capacity_units);

      const calculatedPlan = calculateSopPlan({
        forecastDemand,
        openingInventory,
        productionCapacity,
      });

      const line = await SopModel.createPlanLine(cycleId, {
        productId: item.product_id,

        forecastDemandUnits: forecastDemand,

        openingInventoryUnits: openingInventory,

        productionCapacityUnits: productionCapacity,

        plannedProductionUnits: calculatedPlan.plannedProduction,

        projectedEndingInventory: calculatedPlan.projectedEndingInventory,

        supplyGapUnits: calculatedPlan.supplyGap,

        excessInventoryUnits: calculatedPlan.excessInventory,

        status: calculatedPlan.status,
      });

      plan.push(line);
    }

    return plan;
  }
  static async getPlanSummary(cycleId) {
    return await SopModel.getPlanSummary(cycleId);
  }

  //recomendation
  static async generateRecommendations(cycleId) {
    const cycle = await SopModel.getCycleById(cycleId);

    if (!cycle) {
      const error = new Error("S&OP cycle not found");
      error.statusCode = 404;
      throw error;
    }

    const plan = await SopModel.getPlanByCycleId(cycleId);

    if (plan.length === 0) {
      const error = new Error("S&OP plan not found. Generate the plan first.");
      error.statusCode = 400;
      throw error;
    }

    const procurementInputs = await SopModel.getProcurementInputs();

    const shipmentInputs = await SopModel.getShipmentExecutionInputs();

    await SopModel.deleteRecommendationsByCycleId(cycleId);

    const recommendations = [];

    for (const item of plan) {
      const procurement = procurementInputs.find(
        (p) => p.product_id === item.product_id,
      );
      const shipment = procurement
        ? shipmentInputs.find(
            (s) => s.procurement_plan_id === procurement.procurement_plan_id,
          )
        : null;

      const generated = generateSopRecommendations({
        forecastDemand: Number(item.forecast_demand_units),
        openingInventory: Number(item.opening_inventory_units),
        productionCapacity: Number(item.production_capacity_units),
        plannedProduction: Number(item.planned_production_units),
        projectedEndingInventory: Number(item.projected_ending_inventory),

        requiredFabric: procurement ? Number(procurement.required_fabric_m) : 0,

        recommendedOrderQty: procurement
          ? Number(procurement.recommended_order_qty_m)
          : 0,

        leadTimeWeeks: procurement ? Number(procurement.lead_time_weeks) : 0,

        planningWeekNumber: procurement
          ? Number(procurement.planning_week.replace("W", ""))
          : 0,

        // E2 shipment information
        plannedArrival: shipment?.planned_arrival ?? null,
        currentEta: shipment?.current_eta ?? null,
        shipmentStatus: shipment?.shipment_status ?? null,
        truckStatus: shipment?.truck_status ?? null,
        plannedQuantity: shipment?.planned_quantity_m ?? null,
        receivedQuantity: shipment?.received_quantity_m ?? null,
      });

      for (const recommendation of generated) {
        const saved = await SopModel.createRecommendation({
          cycleId,
          productId: item.product_id,
          recommendationType: recommendation.type,
          severity: recommendation.severity,
          message: recommendation.message,
          recommendedAction: recommendation.recommendedAction,
        });

        recommendations.push(saved);
      }
    }

    return recommendations;
  }

  static async getRecommendations(cycleId) {
    return await SopModel.getRecommendationsByCycleId(cycleId);
  }

  static async getRecommendationSummary(cycleId) {
    return await SopModel.getRecommendationSummary(cycleId);
  }
}

export default SopService;
