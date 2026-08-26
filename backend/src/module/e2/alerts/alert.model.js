import pool from "../../../common/config/database.js";

class AlertModel {
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
      ORDER BY priority DESC, trailer_id;
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default AlertModel;