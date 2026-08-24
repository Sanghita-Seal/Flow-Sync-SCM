import OverviewModel from "./overview.model.js";

class OverviewService {
  static async getOverview() {
    const overview = await OverviewModel.getOverview();

    if (!overview) {
      return {
        cycle: null,
        metrics: {
          totalForecastDemand: 0,
          availableInventory: 0,
          productionCapacity: 0,
          supplyDemandGap: 0,
          procurementRisks: 0,
          excessInventory: 0,
          markdownCandidates: 0,
          sopHealth: 0,
        },
        recommendations: {
          total: 0,
          critical: 0,
          high: 0,
          open: 0,
        },
        topRisks: [],
      };
    }

    const topRisks = await OverviewModel.getTopRisks();

    return {
      cycle: {
        id: overview.cycle_id,
        name: overview.cycle_name,
        startDate: overview.start_date,
        endDate: overview.end_date,
        status: overview.cycle_status,
      },

      metrics: {
        totalForecastDemand: Number(
          overview.total_forecast_demand
        ),

        availableInventory: Number(
          overview.total_opening_inventory
        ),

        productionCapacity: Number(
          overview.total_production_capacity
        ),

        supplyDemandGap: Number(
          overview.total_supply_gap
        ),

        procurementRisks: Number(
          overview.procurement_risks
        ),

        excessInventory: Number(
          overview.total_excess_inventory
        ),

        markdownCandidates: Number(
          overview.markdown_candidates
        ),

        sopHealth: Number(
          overview.sop_health
        ),
      },

      plan: {
        productCount: Number(
          overview.product_count
        ),

        plannedProduction: Number(
          overview.total_planned_production
        ),

        projectedInventory: Number(
          overview.total_projected_inventory
        ),

        shortageProducts: Number(
          overview.shortage_products
        ),

        excessProducts: Number(
          overview.excess_products
        ),

        balancedProducts: Number(
          overview.balanced_products
        ),
      },

      recommendations: {
        total: Number(
          overview.total_recommendations
        ),

        critical: Number(
          overview.critical_recommendations
        ),

        high: Number(
          overview.high_recommendations
        ),

        open: Number(
          overview.open_recommendations
        ),
      },

      topRisks,
    };
  }
}

export default OverviewService;