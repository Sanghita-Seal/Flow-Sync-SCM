import TruckService from "./truck.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class TruckController {
  static async getTrucks(req, res, next) {
    try {
      const trucks = await TruckService.getTrucks();

      return ApiResponse.list(res, trucks, {
        count: trucks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTruckByTrailerId(req, res, next) {
    try {
      const truck = await TruckService.getTruckByTrailerId(
        req.params.trailerId
      );

      return ApiResponse.ok(res, truck);
    } catch (error) {
      next(error);
    }
  }

  static async getTrucksByStatus(req, res, next) {
    try {
      const trucks = await TruckService.getTrucksByStatus(
        req.params.status
      );

      return ApiResponse.list(res, trucks, {
        count: trucks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTruckLocations(req, res, next) {
    try {
      const trucks = await TruckService.getTruckLocations();

      return ApiResponse.list(res, trucks, {
        count: trucks.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TruckController;