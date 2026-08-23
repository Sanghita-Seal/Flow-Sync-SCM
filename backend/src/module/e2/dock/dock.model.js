import pool from "../../../common/config/database.js";

class DockModel {
  // Get all docks
  static async getDocks() {
    const query = `
      SELECT
        id,
        dock_code,
        status,
        supported_load_type
      FROM e2.docks
      ORDER BY dock_code;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  // Get dock by dock code
  static async getDockByCode(dockCode) {
    const query = `
      SELECT
        id,
        dock_code,
        status,
        supported_load_type
      FROM e2.docks
      WHERE dock_code = $1;
    `;

    const result = await pool.query(query, [dockCode]);

    return result.rows[0];
  }

  // Get docks by status
  static async getDocksByStatus(status) {
    const query = `
      SELECT
        id,
        dock_code,
        status,
        supported_load_type
      FROM e2.docks
      WHERE status = $1
      ORDER BY dock_code;
    `;

    const result = await pool.query(query, [status]);

    return result.rows;
  }
}

export default DockModel;
