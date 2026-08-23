import DemandService from "./demand.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class DemandController {
  static async getDemand(req, res, next) {
    try {
      const demand = await DemandService.getDemand(req.validated.query);

      return ApiResponse.list(res, demand, {
        count: demand.length,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getDemandByProductId(req, res, next) {
    try {
      const demand = await DemandService.getDemandByProductId(
        req.params.productId,
      );

      return ApiResponse.list(res, demand, {
        count: demand.length,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getDemandSummary(req, res, next) {
    try {
      const summary = await DemandService.getDemandSummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }
  static async getDemandTrend(req, res, next) {
    try {
      const trend = await DemandService.getDemandTrend();

      return ApiResponse.list(res, trend, {
        count: trend.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DemandController;
