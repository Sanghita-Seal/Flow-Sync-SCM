import pool from "../../../common/config/database.js";

class ShipmentModel {

  // Get all shipments
  static async getShipments() {
    const query = `
      SELECT
        id,
        shipment_reference,
        origin,
        destination,
        status,
        procurement_plan_id,
        planned_arrival,
        actual_arrival,
        planned_quantity_m,
        received_quantity_m
      FROM e2.shipments
      ORDER BY shipment_reference;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get shipment by shipment reference
  static async getShipmentByReference(shipmentReference) {
    const query = `
      SELECT
        id,
        shipment_reference,
        origin,
        destination,
        status,
        procurement_plan_id,
        planned_arrival,
        actual_arrival,
        planned_quantity_m,
        received_quantity_m
      FROM e2.shipments
      WHERE shipment_reference = $1;
    `;

    const result = await pool.query(query, [shipmentReference]);
    return result.rows[0];
  }

  // Get shipments by status
  static async getShipmentsByStatus(status) {
    const query = `
      SELECT
        id,
        shipment_reference,
        origin,
        destination,
        status,
        procurement_plan_id,
        planned_arrival,
        actual_arrival,
        planned_quantity_m,
        received_quantity_m
      FROM e2.shipments
      WHERE status = $1
      ORDER BY shipment_reference;
    `;

    const result = await pool.query(query, [status]);
    return result.rows;
  }

  // Get shipments by P2 procurement plan ID
  static async getShipmentsByProcurementPlan(procurementPlanId) {
    const query = `
      SELECT
        id,
        shipment_reference,
        origin,
        destination,
        status,
        procurement_plan_id,
        planned_arrival,
        actual_arrival,
        planned_quantity_m,
        received_quantity_m
      FROM e2.shipments
      WHERE procurement_plan_id = $1
      ORDER BY shipment_reference;
    `;

    const result = await pool.query(query, [procurementPlanId]);
    return result.rows;
  }

}

export default ShipmentModel;