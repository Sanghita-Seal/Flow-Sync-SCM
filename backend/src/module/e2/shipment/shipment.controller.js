import ShipmentService from "./shipment.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class ShipmentController {

  // GET /api/e2/shipment
  static async getShipments(req, res, next) {
    try {
      const shipments = await ShipmentService.getShipments();

      return ApiResponse.list(res, shipments, {
        count: shipments.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/e2/shipment/:shipmentReference
  static async getShipmentByReference(req, res, next) {
    try {
      const { shipmentReference } = req.params;

      const shipment =
        await ShipmentService.getShipmentByReference(shipmentReference);

      return ApiResponse.ok(res, shipment);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/e2/shipment/status/:status
  static async getShipmentsByStatus(req, res, next) {
    try {
      const { status } = req.params;

      const shipments =
        await ShipmentService.getShipmentsByStatus(status);

      return ApiResponse.list(res, shipments, {
        count: shipments.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/e2/shipment/procurement/:procurementPlanId
  static async getShipmentsByProcurementPlan(req, res, next) {
    try {
      const { procurementPlanId } = req.params;

      const shipments =
        await ShipmentService.getShipmentsByProcurementPlan(
          procurementPlanId
        );

      return ApiResponse.list(res, shipments, {
        count: shipments.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ShipmentController;