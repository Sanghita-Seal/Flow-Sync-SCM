import pool from "../../../common/config/database.js";

class YardModel {
  // Get all yards
  static async getYards() {
    const query = `
      SELECT
        id,
        name,
        capacity,
        number_of_trucks,
        status
      FROM e2.yards
      ORDER BY name;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  // Get yard by name
  static async getYardByName(yardName) {
    const query = `
      SELECT
        id,
        name,
        capacity,
        number_of_trucks,
        status
      FROM e2.yards
      WHERE name = $1;
    `;

    const result = await pool.query(query, [yardName]);

    return result.rows[0];
  }

  // Get yards by status
  static async getYardsByStatus(status) {
    const query = `
      SELECT
        id,
        name,
        capacity,
        number_of_trucks,
        status
      FROM e2.yards
      WHERE status = $1
      ORDER BY name;
    `;

    const result = await pool.query(query, [status]);

    return result.rows;
  }
}

export default YardModel;