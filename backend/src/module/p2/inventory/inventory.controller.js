import InventoryService from "./inventory.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class InventoryController {
  static async getInventory(req, res, next) {
    try {
      const inventory = await InventoryService.getInventory(
        req.validated.query,
      );

      return ApiResponse.list(res, inventory, {
        count: inventory.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryByProductId(req, res, next) {
    try {
      const inventory = await InventoryService.getInventoryByProductId(
        req.params.productId,
      );

      return ApiResponse.list(res, inventory, {
        count: inventory.length,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInventorySummary(req, res, next) {
    try {
      const summary = await InventoryService.getInventorySummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryRisk(req, res, next) {
    try {
      const risk = await InventoryService.getInventoryRisk();

      return ApiResponse.list(res, risk, {
        count: risk.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InventoryController;
