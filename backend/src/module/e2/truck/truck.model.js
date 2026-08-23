import pool from "../../../common/config/database.js";

class TruckModel {
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
        scheduled_arrival,
        current_eta,
        current_yard_id,
        current_location,
        latitude,
        longitude,
        location_updated_at
      FROM e2.trucks
      ORDER BY scheduled_arrival;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

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
        scheduled_arrival,
        current_eta,
        current_yard_id,
        current_location,
        latitude,
        longitude,
        location_updated_at
      FROM e2.trucks
      WHERE trailer_id = $1;
    `;

    const result = await pool.query(query, [trailerId]);

    return result.rows[0];
  }

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
        scheduled_arrival,
        current_eta,
        current_yard_id,
        current_location,
        latitude,
        longitude,
        location_updated_at
      FROM e2.trucks
      WHERE status = $1
      ORDER BY scheduled_arrival;
    `;

    const result = await pool.query(query, [status]);

    return result.rows;
  }

  static async getTruckLocations() {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        status,
        priority,
        current_yard_id,
        current_location,
        latitude,
        longitude,
        location_updated_at
      FROM e2.trucks
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
      ORDER BY location_updated_at DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default TruckModel;