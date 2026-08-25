import pool from "../../../common/config/database.js";

class ProcurementModel {

  // ============================================================
  // Get procurement plans
  // ============================================================

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

  // ============================================================
  // Get procurement plans by product ID
  // ============================================================

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

  // ============================================================
  // Procurement summary
  // ============================================================

  static async getProcurementSummary() {

    const query = `
      SELECT
        COUNT(*) AS procurement_plan_count,
        COUNT(DISTINCT pp.product_id) AS product_count,
        COUNT(DISTINCT pp.fabric_id) AS fabric_count,
        COALESCE(
          SUM(pp.required_fabric_m),
          0
        ) AS total_required_fabric_m,
        COALESCE(
          SUM(pp.recommended_order_qty_m),
          0
        ) AS total_recommended_order_qty_m
      FROM p2.procurement_plans pp
    `;

    const result = await pool.query(query);

    return result.rows[0];
  }

  // ============================================================
  // Procurement risk
  // ============================================================

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

  // ============================================================
  // Get P2 procurement plan + linked E2 shipments + truck data
  // ============================================================

  static async getProcurementPlanShipments(procurementPlanId) {

    // ------------------------------------------------------------
    // 1. Get the procurement plan
    // ------------------------------------------------------------

    const procurementQuery = `
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
        pp.status
      FROM p2.procurement_plans pp
      JOIN p2.products p
        ON p.id = pp.product_id
      JOIN p2.fabrics f
        ON f.id = pp.fabric_id
      LEFT JOIN p2.suppliers s
        ON s.id = f.supplier_id
      WHERE pp.id = $1
    `;

    const procurementResult = await pool.query(
      procurementQuery,
      [procurementPlanId]
    );

    // ------------------------------------------------------------
    // Invalid procurement plan ID
    // ------------------------------------------------------------

    if (procurementResult.rows.length === 0) {
      return null;
    }

    const procurementPlan = procurementResult.rows[0];

    // ------------------------------------------------------------
    // 2. Get all E2 shipments linked to this procurement plan
    // ------------------------------------------------------------

    const shipmentQuery = `
      SELECT
        sh.id,
        sh.shipment_reference,
        sh.origin,
        sh.destination,
        sh.status,
        sh.procurement_plan_id,
        sh.planned_arrival,
        sh.planned_quantity_m,
        sh.received_quantity_m,

        t.id AS truck_id,
        t.trailer_id,
        t.tracking_number,
        t.status AS truck_status,
        t.current_eta,
        t.current_location,
        t.latitude,
        t.longitude

      FROM e2.shipments sh

      LEFT JOIN e2.trucks t
        ON t.shipment_id = sh.id

      WHERE sh.procurement_plan_id = $1

      ORDER BY sh.shipment_reference
    `;

    const shipmentResult = await pool.query(
      shipmentQuery,
      [procurementPlanId]
    );

    // ------------------------------------------------------------
    // 3. Convert flat shipment rows into nested objects
    // ------------------------------------------------------------

    const shipments = shipmentResult.rows.map((row) => {

      const shipment = {
        id: row.id,
        shipment_reference: row.shipment_reference,
        origin: row.origin,
        destination: row.destination,
        status: row.status,
        procurement_plan_id: row.procurement_plan_id,
        planned_arrival: row.planned_arrival,
        planned_quantity_m: row.planned_quantity_m,
        received_quantity_m: row.received_quantity_m,
      };

      // Only add truck when a truck exists
      if (row.truck_id) {
        shipment.truck = {
          id: row.truck_id,
          trailer_id: row.trailer_id,
          tracking_number: row.tracking_number,
          status: row.truck_status,
          current_eta: row.current_eta,
          current_location: row.current_location,
          latitude: row.latitude,
          longitude: row.longitude,
        };
      } else {
        shipment.truck = null;
      }

      return shipment;
    });

    // ------------------------------------------------------------
    // 4. Return clean nested response
    // ------------------------------------------------------------

    return {
      procurement_plan: procurementPlan,
      shipments,
    };
  }
}

export default ProcurementModel;