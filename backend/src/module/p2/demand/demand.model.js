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
  static async getDemandByProductId(productId) {
    const query = `
    SELECT
      df.id,
      p.id AS product_id,
      p.sku_code,
      p.name AS product_name,
      df.week,
      df.week_number,
      df.forecast_demand_units
    FROM p2.demand_forecasts df
    JOIN p2.products p
      ON p.id = df.product_id
    WHERE p.id = $1
    ORDER BY df.week_number
  `;

    const result = await pool.query(query, [productId]);

    return result.rows;
  }
  static async getDemandSummary() {
    const query = `
    SELECT
      COUNT(DISTINCT p.id) AS product_count,
      COUNT(DISTINCT df.week) AS week_count,
      COALESCE(SUM(df.forecast_demand_units), 0) AS total_forecast_demand,
      COALESCE(
        AVG(df.forecast_demand_units),
        0
      ) AS average_forecast_demand
    FROM p2.demand_forecasts df
    JOIN p2.products p
      ON p.id = df.product_id
  `;

    const result = await pool.query(query);

    return result.rows[0];
  }
  static async getDemandTrend() {
    const query = `
    SELECT
      df.week,
      df.week_number,
      SUM(df.forecast_demand_units) AS total_forecast_demand
    FROM p2.demand_forecasts df
    GROUP BY df.week, df.week_number
    ORDER BY df.week_number
  `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default DemandModel;
