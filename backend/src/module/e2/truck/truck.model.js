import pool from "../../../common/config/database.js";

class TruckModel {
  // Get all trucks
  static async getTrucks() {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        shipment_id,
        load_type,
        priority,
        status,
        current_yard_name,
        current_location,
        latitude,
        longitude,
        current_eta
      FROM e2.trucks
      ORDER BY trailer_id;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  // Get truck by trailer ID
  static async getTruckByTrailerId(trailerId) {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        shipment_id,
        load_type,
        priority,
        status,
        current_yard_name,
        current_location,
        latitude,
        longitude
      FROM e2.trucks
      WHERE trailer_id = $1;
    `;

    const result = await pool.query(query, [trailerId]);

    return result.rows[0];
  }

  // Get trucks by status
  static async getTrucksByStatus(status) {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        shipment_id,
        load_type,
        priority,
        status,
        current_yard_name,
        current_location,
        latitude,
        longitude,
        current_eta
      FROM e2.trucks
      WHERE status = $1
      ORDER BY trailer_id;
    `;

    const result = await pool.query(query, [status]);

    return result.rows;
  }

  // Get trucks by priority
  static async getTrucksByPriority(priority) {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        shipment_id,
        load_type,
        priority,
        status,
        current_yard_name,
        current_location,
        latitude,
        longitude,
        current_eta
      FROM e2.trucks
      WHERE priority = $1
      ORDER BY trailer_id;
    `;

    const result = await pool.query(query, [priority]);

    return result.rows;
  }

  // Get trucks currently in a particular yard
  static async getTrucksByYard(yardName) {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        shipment_id,
        load_type,
        priority,
        status,
        current_yard_name,
        current_location,
        latitude,
        longitude,
        current_eta
      FROM e2.trucks
      WHERE current_yard_name = $1
      ORDER BY trailer_id;
    `;

    const result = await pool.query(query, [yardName]);

    return result.rows;
  }

  static async getTruckLocations() {
  const query = `
    SELECT
      id,
      trailer_id,
      tracking_number,
      shipment_id,
      status
      current_yard_name,
      current_location,
      latitude,
      longitude,
      current_eta
    FROM e2.trucks
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
    ORDER BY trailer_id;
  `;

  const result = await pool.query(query);

  return result.rows;
}

// Get truck by tracking number
static async getTruckByTrackingNumber(trackingNumber) {
  const query = `
    SELECT
      id,
      trailer_id,
      tracking_number,
      shipment_id,
      load_type,
      priority,
      status,
      current_yard_name,
      current_location,
      latitude,
      longitude,
      current_eta
    FROM e2.trucks
    WHERE tracking_number = $1;
  `;

  const result = await pool.query(query, [trackingNumber]);

  return result.rows[0];
}
}

export default TruckModel;