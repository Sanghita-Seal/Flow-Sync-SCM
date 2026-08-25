import ProcurementService from "./procurement.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class ProcurementController {

  // GET /api/procurement
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

  // GET /api/procurement/:productId
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

  // GET /api/procurement/summary
  static async getProcurementSummary(req, res, next) {
    try {
      const summary =
        await ProcurementService.getProcurementSummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/procurement/risk
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

  // GET /api/procurement/plans/:procurementPlanId/shipments
  static async getProcurementPlanShipments(req, res, next) {
    try {
      const { procurementPlanId } = req.params;

      const data =
        await ProcurementService.getProcurementPlanShipments(
          procurementPlanId
        );

      // Procurement plan does not exist
      if (!data) {
        const error = new Error(
          "Procurement plan not found"
        );

        error.statusCode = 404;

        throw error;
      }

      return ApiResponse.ok(res, data);

    } catch (error) {
      next(error);
    }
  }
}

export default ProcurementController;