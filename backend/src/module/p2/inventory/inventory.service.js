import InventoryModel from "./inventory.model.js";

class InventoryService {
  static async getInventory(filters) {
    return await InventoryModel.getInventory(filters);
  }

  static async getInventoryByProductId(productId) {
    return await InventoryModel.getInventoryByProductId(productId);
  }
  static async getInventorySummary() {
    return await InventoryModel.getInventorySummary();
  }

  static async getInventoryRisk() {
    const inventory = await InventoryModel.getInventoryRisk();

    return inventory.map((item) => {
      const inventoryUnits = Number(item.current_inventory_units);
      const forecastDemand = Number(item.total_forecast_demand);

      let risk = "HEALTHY";

      if (inventoryUnits < forecastDemand) {
        risk = "SHORTAGE";
      } else if (inventoryUnits > forecastDemand * 1.5) {
        risk = "EXCESS";
      }

      return {
        ...item,
        inventory_units: inventoryUnits,
        total_forecast_demand: forecastDemand,
        risk,
      };
    });
  }
}

export default InventoryService;
