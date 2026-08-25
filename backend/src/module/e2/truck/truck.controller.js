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

  // Get truck by tracking number
static async getTruckByTrackingNumber(req, res) {
  try {
    const { tracking_number } = req.params;

    const truck = await TruckService.getTruckByTrackingNumber(
      tracking_number
    );

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error("Error fetching truck by tracking number:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
}

export default TruckController;