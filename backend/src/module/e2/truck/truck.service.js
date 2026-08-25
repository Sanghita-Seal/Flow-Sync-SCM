import TruckModel from "./truck.model.js";

class TruckService {
  static async getTrucks() {
    return await TruckModel.getTrucks();
  }

  static async getTruckByTrailerId(trailerId) {
    const truck = await TruckModel.getTruckByTrailerId(trailerId);

    if (!truck) {
      const error = new Error("Truck not found");
      error.statusCode = 404;
      throw error;
    }

    return truck;
  }

  static async getTrucksByStatus(status) {
    return await TruckModel.getTrucksByStatus(status);
  }

  static async getTruckLocations() {
    return await TruckModel.getTruckLocations();
  }

  // Get truck by tracking number
static async getTruckByTrackingNumber(trackingNumber) {
  return await TruckModel.getTruckByTrackingNumber(trackingNumber);
}
}

export default TruckService;