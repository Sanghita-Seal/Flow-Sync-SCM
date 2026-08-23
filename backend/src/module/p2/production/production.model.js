import pool from "../../../common/config/database.js";

class ProductionModel {
  static async getProduction({ sku, week }) {
    let query = `
      SELECT
        pc.id,
        pc.plant_id,
        pc.product_id,
        p.sku_code,
        p.name AS product_name,
        pc.week,
        pc.week_number,
        pc.capacity_units,
        pc.created_at,
        pc.updated_at
      FROM p2.production_capacity pc
      JOIN p2.products p
        ON p.id = pc.product_id
    `;

    const conditions = [];
    const values = [];

    if (sku) {
      values.push(sku);
      conditions.push(`p.sku_code = $${values.length}`);
    }

    if (week) {
      values.push(week);
      conditions.push(`pc.week = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += `
      ORDER BY pc.week_number, p.sku_code
    `;

    const result = await pool.query(query, values);

    return result.rows;
  }

  static async getProductionByProductId(productId) {
    const query = `
      SELECT
        pc.id,
        pc.plant_id,
        pc.product_id,
        p.sku_code,
        p.name AS product_name,
        pc.week,
        pc.week_number,
        pc.capacity_units,
        pc.created_at,
        pc.updated_at
      FROM p2.production_capacity pc
      JOIN p2.products p
        ON p.id = pc.product_id
      WHERE pc.product_id = $1
      ORDER BY pc.week_number
    `;

    const result = await pool.query(query, [productId]);

    return result.rows;
  }

  static async getProductionSummary() {
    const query = `
      SELECT
        COUNT(DISTINCT pc.product_id) AS product_count,
        COUNT(DISTINCT pc.plant_id) AS plant_count,
        COUNT(DISTINCT pc.week) AS week_count,
        COALESCE(SUM(pc.capacity_units), 0) AS total_capacity_units,
        COALESCE(AVG(pc.capacity_units), 0) AS average_capacity_units
      FROM p2.production_capacity pc
    `;

    const result = await pool.query(query);

    return result.rows[0];
  }

  static async getProductionCapacity() {
    const query = `
      SELECT
        pc.plant_id,
        pc.product_id,
        p.sku_code,
        p.name AS product_name,
        pc.week,
        pc.week_number,
        pc.capacity_units
      FROM p2.production_capacity pc
      JOIN p2.products p
        ON p.id = pc.product_id
      ORDER BY pc.week_number, p.sku_code
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default ProductionModel;