import pool from "../../../common/config/database.js";

class DemandModel {
  static async getDemand({ sku, week }) {
    let query = `
      SELECT
        df.id,
        p.sku_code,
        p.name AS product_name,
        df.week,
        df.week_number,
        df.forecast_demand_units
      FROM p2.demand_forecasts df
      JOIN p2.products p
        ON p.id = df.product_id
    `;

    const conditions = [];
    const values = [];

    if (sku) {
      values.push(sku);
      conditions.push(`p.sku_code = $${values.length}`);
    }

    if (week) {
      values.push(week);
      conditions.push(`df.week = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += `
      ORDER BY df.week_number, p.sku_code
    `;

    const result = await pool.query(query, values);

    return result.rows;
  }
}

export default DemandModel;