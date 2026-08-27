import DockService from "./dock.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class DockController {
  // GET /api/e2/docks
  static async getDocks(req, res, next) {
    try {
      const docks = await DockService.getDocks();

      return ApiResponse.list(res, docks, {
        count: docks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/e2/docks/:dockCode
  static async getDockByCode(req, res, next) {
    try {
      const { dockCode } = req.params;

      const dock = await DockService.getDockByCode(dockCode);

      return ApiResponse.ok(res, dock);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/e2/docks/status/:status
  static async getDocksByStatus(req, res, next) {
    try {
      const { status } = req.params;

      const docks = await DockService.getDocksByStatus(status);

      return ApiResponse.list(res, docks, {
        count: docks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/e2/docks/assign
  static async assignDocks(req, res, next) {
    try {
      const result = await DockService.assignDocks();

      return ApiResponse.ok(
        res,
        result,
        "Dock assignment process completed"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getDockAssignments(req, res, next) {
    try {
      const assignments = await DockService.getDockAssignments();

      return ApiResponse.list(res, assignments, {
        count: assignments.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DockController;