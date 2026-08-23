import pool from "../../../common/config/database.js";

class MarkdownModel {
  static async getMarkdown({ sku, week }) {
    let query = `
      SELECT
        mh.id,
        mh.product_id,
        p.sku_code,
        p.name AS product_name,
        mh.week,
        mh.week_number,
        mh.markdown_pct,
        mh.reason,
        mh.created_at,
        mh.updated_at
      FROM p2.markdown_history mh
      JOIN p2.products p
        ON p.id = mh.product_id
    `;

    const conditions = [];
    const values = [];

    if (sku) {
      values.push(sku);
      conditions.push(`p.sku_code = $${values.length}`);
    }

    if (week) {
      values.push(week);
      conditions.push(`mh.week = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += `
      ORDER BY mh.week_number, p.sku_code
    `;

    const result = await pool.query(query, values);

    return result.rows;
  }

  static async getMarkdownByProductId(productId) {
    const query = `
      SELECT
        mh.id,
        mh.product_id,
        p.sku_code,
        p.name AS product_name,
        mh.week,
        mh.week_number,
        mh.markdown_pct,
        mh.reason,
        mh.created_at,
        mh.updated_at
      FROM p2.markdown_history mh
      JOIN p2.products p
        ON p.id = mh.product_id
      WHERE mh.product_id = $1
      ORDER BY mh.week_number
    `;

    const result = await pool.query(query, [productId]);

    return result.rows;
  }

  static async getMarkdownSummary() {
    const query = `
      SELECT
        COUNT(*) AS record_count,
        COUNT(DISTINCT product_id) AS product_count,
        COUNT(DISTINCT week) AS week_count,
        COALESCE(AVG(markdown_pct), 0) AS average_markdown_pct,
        COALESCE(MAX(markdown_pct), 0) AS maximum_markdown_pct
      FROM p2.markdown_history
    `;

    const result = await pool.query(query);

    return result.rows[0];
  }
}

export default MarkdownModel;