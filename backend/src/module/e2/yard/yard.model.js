import pool from "../../../common/config/database.js";

class YardModel {
  static async getYards() {
    const query = `
      SELECT
        id,
        name,
        capacity,
        status
      FROM e2.yards
      ORDER BY name;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  static async getYardByName(name) {
    const query = `
      SELECT
        id,
        name,
        capacity,
        status
      FROM e2.yards
      WHERE name = $1;
    `;

    const result = await pool.query(query, [name]);

    return result.rows[0];
  }

  static async getYardsByStatus(status) {
    const query = `
      SELECT
        id,
        name,
        capacity,
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