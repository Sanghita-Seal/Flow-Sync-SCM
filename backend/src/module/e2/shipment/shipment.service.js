import ShipmentModel from "./shipment.model.js";

class ShipmentService {
  // Get all shipments
  static async getShipments() {
    return await ShipmentModel.getShipments();
  }

  // Get shipment by shipment reference
  static async getShipmentByReference(shipmentReference) {
    const shipment = await ShipmentModel.getShipmentByReference(
      shipmentReference
    );

    if (!shipment) {
      const error = new Error("Shipment not found");
      error.statusCode = 404;
      throw error;
    }

    return shipment;
  }

  // Get shipments by status
  static async getShipmentsByStatus(status) {
    return await ShipmentModel.getShipmentsByStatus(status);
  }
}

export default ShipmentService;