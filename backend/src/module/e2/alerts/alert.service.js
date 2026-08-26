import AlertModel from "./alert.model.js";

class AlertService {
  static async getAlerts() {
    const trucks = await AlertModel.getAlerts();

    return trucks.map((truck) => ({
      trailer_id: truck.trailer_id,
      tracking_number: truck.tracking_number,
      alert_type: "TRUCK_DELAYED",
      priority: truck.priority,
      message: `Trailer ${truck.trailer_id} is delayed.`,
      status: truck.status,
      current_location: truck.current_location,
      current_eta: truck.current_eta
    }));
  }
}

export default AlertService;