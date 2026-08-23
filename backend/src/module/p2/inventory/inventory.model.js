import pool from "../../../common/config/database.js";

class InventoryModel {
  static async getInventory({ sku }) {
    let query = `
      SELECT
        i.id,
        i.product_id,
        p.sku_code,
        p.name AS product_name,
        i.current_inventory_units,
        i.updated_at
      FROM p2.inventory i
      JOIN p2.products p
        ON p.id = i.product_id
    `;

    const conditions = [];
    const values = [];

    if (sku) {
      values.push(sku);
      conditions.push(`p.sku_code = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY p.sku_code`;

    const result = await pool.query(query, values);

    return result.rows;
  }

  static async getInventoryByProductId(productId) {
    const query = `
      SELECT
        i.id,
        i.product_id,
        p.sku_code,
        p.name AS product_name,
        i.current_inventory_units,
        i.updated_at
      FROM p2.inventory i
      JOIN p2.products p
        ON p.id = i.product_id
      WHERE i.product_id = $1
    `;

    const result = await pool.query(query, [productId]);

    return result.rows;
  }
  static async getInventorySummary() {
    const query = `
    SELECT
      COUNT(DISTINCT i.product_id) AS product_count,
      COALESCE(SUM(i.current_inventory_units), 0) AS total_inventory_units,
      COALESCE(AVG(i.current_inventory_units), 0) AS average_inventory_units
    FROM p2.inventory i
  `;

    const result = await pool.query(query);

    return result.rows[0];
  }

  static async getInventoryRisk() {
    const query = `
    SELECT
      i.product_id,
      p.sku_code,
      p.name AS product_name,
      i.current_inventory_units,
      COALESCE(SUM(df.forecast_demand_units), 0) AS total_forecast_demand
    FROM p2.inventory i
    JOIN p2.products p
      ON p.id = i.product_id
    LEFT JOIN p2.demand_forecasts df
      ON df.product_id = i.product_id
    GROUP BY
      i.product_id,
      p.sku_code,
      p.name,
      i.current_inventory_units
    ORDER BY p.sku_code
  `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default InventoryModel;
