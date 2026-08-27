import pool from "../../../common/config/database.js";

class AlertModel {

  // ============================================================
  // 1. GET DELAYED TRUCK ALERTS
  // ============================================================

  static async getAlerts() {
    const query = `
      SELECT
        id,
        trailer_id,
        tracking_number,
        priority,
        status,
        current_location,
        current_eta
      FROM e2.trucks
      WHERE status = 'DELAYED'
      ORDER BY
        CASE priority
          WHEN 'HIGH' THEN 1
          WHEN 'MEDIUM' THEN 2
          WHEN 'LOW' THEN 3
          ELSE 4
        END,
        trailer_id;
    `;

    const result = await pool.query(query);

    return result.rows;
  }


  // ============================================================
  // 2. CHECK DOCK AVAILABILITY
  // ============================================================

  static async checkDockAvailability(yardName) {

    const query = `
      SELECT
        y.name AS yard_name,

        COUNT(d.id) AS total_docks,

        COUNT(d.id) FILTER (
          WHERE d.status = 'AVAILABLE'
        ) AS available_docks,

        COUNT(d.id) FILTER (
          WHERE d.status = 'OCCUPIED'
        ) AS occupied_docks,

        COUNT(d.id) FILTER (
          WHERE d.status = 'UNAVAILABLE'
        ) AS unavailable_docks

      FROM e2.yards y

      LEFT JOIN e2.docks d
        ON d.yard_name = y.name

      WHERE y.name = $1

      GROUP BY y.name;
    `;

    const result = await pool.query(query, [yardName]);

    if (result.rows.length === 0) {
      return null;
    }

    const yard = result.rows[0];

    const totalDocks = Number(yard.total_docks);
    const availableDocks = Number(yard.available_docks);
    const occupiedDocks = Number(yard.occupied_docks);
    const unavailableDocks = Number(yard.unavailable_docks);

    // ==========================================================
    // NO AVAILABLE DOCK
    // ==========================================================

    if (availableDocks === 0) {

      const message =
        `All dock doors in ${yard.yard_name} are occupied or unavailable.`;

      return {
        alert: true,
        alert_reason: "DOCK_UNAVAILABLE",
        yard_name: yard.yard_name,
        total_docks: totalDocks,
        available_docks: availableDocks,
        occupied_docks: occupiedDocks,
        unavailable_docks: unavailableDocks,
        message
      };
    }

    // ==========================================================
    // DOCKS AVAILABLE
    // ==========================================================

    return {
      alert: false,
      alert_reason: null,
      yard_name: yard.yard_name,
      total_docks: totalDocks,
      available_docks: availableDocks,
      occupied_docks: occupiedDocks,
      unavailable_docks: unavailableDocks,
      message: null
    };
  }


  // ============================================================
  // 3. CHECK YARD CAPACITY
  // ============================================================

  static async checkYardCapacity(yardName) {

    const query = `
      SELECT
        name AS yard_name,
        capacity,
        number_of_trucks
      FROM e2.yards
      WHERE name = $1;
    `;

    const result = await pool.query(query, [yardName]);

    if (result.rows.length === 0) {
      return null;
    }

    const yard = result.rows[0];

    const capacity = Number(yard.capacity);
    const numberOfTrucks = Number(yard.number_of_trucks);

    // ==========================================================
    // YARD FULL
    // ==========================================================

    if (numberOfTrucks >= capacity) {

      const message =
        `${yard.yard_name} is full. ` +
        `Current trucks: ${numberOfTrucks}/${capacity}.`;

      return {
        alert: true,
        alert_reason: "YARD_FULL",
        yard_name: yard.yard_name,
        capacity,
        number_of_trucks: numberOfTrucks,
        message
      };
    }

    // ==========================================================
    // YARD HAS SPACE
    // ==========================================================

    return {
      alert: false,
      alert_reason: null,
      yard_name: yard.yard_name,
      capacity,
      number_of_trucks: numberOfTrucks,
      message: null
    };
  }
}

export default AlertModel;
