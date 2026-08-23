import ProcurementService from "./procurement.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class ProcurementController {
  static async getProcurement(req, res, next) {
    try {
      const procurement =
        await ProcurementService.getProcurement(
          req.validated.query
        );

      return ApiResponse.list(res, procurement, {
        count: procurement.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProcurementByProductId(req, res, next) {
    try {
      const procurement =
        await ProcurementService.getProcurementByProductId(
          req.params.productId
        );

      return ApiResponse.list(res, procurement, {
        count: procurement.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProcurementSummary(req, res, next) {
    try {
      const summary =
        await ProcurementService.getProcurementSummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async getProcurementRisk(req, res, next) {
    try {
      const risk =
        await ProcurementService.getProcurementRisk();

      return ApiResponse.list(res, risk, {
        count: risk.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProcurementController;