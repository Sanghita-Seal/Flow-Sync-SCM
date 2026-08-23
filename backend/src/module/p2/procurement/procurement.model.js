import pool from "../../../common/config/database.js";

class ProcurementModel {
  static async getProcurement({
    sku,
    week,
    riskLevel,
    status,
  }) {
    let query = `
      SELECT
        pp.id,
        pp.sop_cycle_id,
        pp.product_id,
        pp.fabric_id,
        p.sku_code,
        p.name AS product_name,
        f.fabric_code,
        f.name AS fabric_name,
        s.supplier_code,
        s.name AS supplier_name,
        pp.planning_week,
        pp.required_fabric_m,
        pp.moq_meters,
        pp.recommended_order_qty_m,
        pp.lead_time_weeks,
        pp.risk_level,
        pp.status,
        pp.created_at,
        pp.updated_at
      FROM p2.procurement_plans pp
      JOIN p2.products p
        ON p.id = pp.product_id
      JOIN p2.fabrics f
        ON f.id = pp.fabric_id
      LEFT JOIN p2.suppliers s
        ON s.id = f.supplier_id
    `;

    const conditions = [];
    const values = [];

    if (sku) {
      values.push(sku);
      conditions.push(`p.sku_code = $${values.length}`);
    }

    if (week) {
      values.push(week);
      conditions.push(`pp.planning_week = $${values.length}`);
    }

    if (riskLevel) {
      values.push(riskLevel);
      conditions.push(`pp.risk_level = $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`pp.status = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += `
      ORDER BY pp.planning_week, p.sku_code
    `;

    const result = await pool.query(query, values);

    return result.rows;
  }

  static async getProcurementByProductId(productId) {
    const query = `
      SELECT
        pp.id,
        pp.sop_cycle_id,
        pp.product_id,
        pp.fabric_id,
        p.sku_code,
        p.name AS product_name,
        f.fabric_code,
        f.name AS fabric_name,
        s.supplier_code,
        s.name AS supplier_name,
        pp.planning_week,
        pp.required_fabric_m,
        pp.moq_meters,
        pp.recommended_order_qty_m,
        pp.lead_time_weeks,
        pp.risk_level,
        pp.status,
        pp.created_at,
        pp.updated_at
      FROM p2.procurement_plans pp
      JOIN p2.products p
        ON p.id = pp.product_id
      JOIN p2.fabrics f
        ON f.id = pp.fabric_id
      LEFT JOIN p2.suppliers s
        ON s.id = f.supplier_id
      WHERE pp.product_id = $1
      ORDER BY pp.planning_week
    `;

    const result = await pool.query(query, [productId]);

    return result.rows;
  }

  static async getProcurementSummary() {
    const query = `
      SELECT
        COUNT(*) AS procurement_plan_count,
        COUNT(DISTINCT pp.product_id) AS product_count,
        COUNT(DISTINCT pp.fabric_id) AS fabric_count,
        COALESCE(SUM(pp.required_fabric_m), 0)
          AS total_required_fabric_m,
        COALESCE(SUM(pp.recommended_order_qty_m), 0)
          AS total_recommended_order_qty_m
      FROM p2.procurement_plans pp
    `;

    const result = await pool.query(query);

    return result.rows[0];
  }

  static async getProcurementRisk() {
    const query = `
      SELECT
        pp.id,
        pp.product_id,
        pp.fabric_id,
        p.sku_code,
        p.name AS product_name,
        f.fabric_code,
        f.name AS fabric_name,
        s.supplier_code,
        s.name AS supplier_name,
        pp.planning_week,
        pp.required_fabric_m,
        pp.moq_meters,
        pp.recommended_order_qty_m,
        pp.lead_time_weeks,
        pp.risk_level,
        pp.status
      FROM p2.procurement_plans pp
      JOIN p2.products p
        ON p.id = pp.product_id
      JOIN p2.fabrics f
        ON f.id = pp.fabric_id
      LEFT JOIN p2.suppliers s
        ON s.id = f.supplier_id
      WHERE
        UPPER(pp.risk_level) IN (
          'HIGH',
          'CRITICAL',
          'MEDIUM'
        )
      ORDER BY
        CASE UPPER(pp.risk_level)
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          ELSE 4
        END,
        pp.planning_week
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default ProcurementModel;