import ProductionService from "./production.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class ProductionController {
  static async getProduction(req, res, next) {
    try {
      const production = await ProductionService.getProduction(
        req.validated.query
      );

      return ApiResponse.list(res, production, {
        count: production.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductionByProductId(req, res, next) {
    try {
      const production =
        await ProductionService.getProductionByProductId(
          req.params.productId
        );

      return ApiResponse.list(res, production, {
        count: production.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductionSummary(req, res, next) {
    try {
      const summary =
        await ProductionService.getProductionSummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async getProductionCapacity(req, res, next) {
    try {
      const capacity =
        await ProductionService.getProductionCapacity();

      return ApiResponse.list(res, capacity, {
        count: capacity.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductionController;