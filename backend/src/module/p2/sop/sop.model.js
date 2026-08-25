import pool from "../../../common/config/database.js";

class SopModel {
  static async getCycles() {
    const query = `
      SELECT
        id,
        cycle_name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      FROM p2.sop_cycles
      ORDER BY start_date DESC
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  static async getCycleById(cycleId) {
    const query = `
      SELECT
        id,
        cycle_name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      FROM p2.sop_cycles
      WHERE id = $1
    `;

    const result = await pool.query(query, [cycleId]);

    return result.rows[0] || null;
  }

  static async createCycle({ cycleName, startDate, endDate, status }) {
    const query = `
      INSERT INTO p2.sop_cycles (
        cycle_name,
        start_date,
        end_date,
        status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        cycle_name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [
      cycleName,
      startDate,
      endDate,
      status,
    ]);

    return result.rows[0];
  }

  static async updateCycleStatus(cycleId, status) {
    const query = `
      UPDATE p2.sop_cycles
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        cycle_name,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
    `;

    const result = await pool.query(query, [status, cycleId]);

    return result.rows[0] || null;
  }

  static async getPlanByCycleId(cycleId) {
    const query = `
    SELECT
      spl.id,
      spl.sop_cycle_id,
      spl.product_id,
      p.sku_code,
      p.name AS product_name,
      spl.forecast_demand_units,
      spl.opening_inventory_units,
      spl.production_capacity_units,
      spl.planned_production_units,
      spl.projected_ending_inventory,
      spl.supply_gap_units,
      spl.excess_inventory_units,
      spl.status,
      spl.created_at,
      spl.updated_at
    FROM p2.sop_plan_lines spl
    JOIN p2.products p
      ON p.id = spl.product_id
    WHERE spl.sop_cycle_id = $1
    ORDER BY p.sku_code
  `;

    const result = await pool.query(query, [cycleId]);

    return result.rows;
  }
  static async getPlanningInputs() {
    const query = `
    SELECT
      p.id AS product_id,
      p.sku_code,
      p.name AS product_name,

      COALESCE(
        (
          SELECT SUM(df.forecast_demand_units)
          FROM p2.demand_forecasts df
          WHERE df.product_id = p.id
        ),
        0
      ) AS forecast_demand_units,

      COALESCE(
        (
          SELECT i.current_inventory_units
          FROM p2.inventory i
          WHERE i.product_id = p.id
          LIMIT 1
        ),
        0
      ) AS opening_inventory_units,

      COALESCE(
        (
          SELECT SUM(pc.capacity_units)
          FROM p2.production_capacity pc
          WHERE pc.product_id = p.id
        ),
        0
      ) AS production_capacity_units

    FROM p2.products p
    ORDER BY p.sku_code
  `;

    const result = await pool.query(query);

    return result.rows;
  }
  static async createPlanLine(
    cycleId,
    {
      productId,
      forecastDemandUnits,
      openingInventoryUnits,
      productionCapacityUnits,
      plannedProductionUnits,
      projectedEndingInventory,
      supplyGapUnits,
      excessInventoryUnits,
      status,
    },
  ) {
    const query = `
    INSERT INTO p2.sop_plan_lines (
      sop_cycle_id,
      product_id,
      forecast_demand_units,
      opening_inventory_units,
      production_capacity_units,
      planned_production_units,
      projected_ending_inventory,
      supply_gap_units,
      excess_inventory_units,
      status
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )
    RETURNING *
  `;

    const result = await pool.query(query, [
      cycleId,
      productId,
      forecastDemandUnits,
      openingInventoryUnits,
      productionCapacityUnits,
      plannedProductionUnits,
      projectedEndingInventory,
      supplyGapUnits,
      excessInventoryUnits,
      status,
    ]);

    return result.rows[0];
  }
  static async deletePlanByCycleId(cycleId) {
    await pool.query(
      `
      DELETE FROM p2.sop_plan_lines
      WHERE sop_cycle_id = $1
    `,
      [cycleId],
    );
  }
  static async getPlanSummary(cycleId) {
    const query = `
    SELECT
      COUNT(*) AS product_count,

      COALESCE(
        SUM(forecast_demand_units),
        0
      ) AS total_forecast_demand,

      COALESCE(
        SUM(opening_inventory_units),
        0
      ) AS total_opening_inventory,

      COALESCE(
        SUM(production_capacity_units),
        0
      ) AS total_production_capacity,

      COALESCE(
        SUM(planned_production_units),
        0
      ) AS total_planned_production,

      COALESCE(
        SUM(projected_ending_inventory),
        0
      ) AS total_projected_inventory,

      COALESCE(
        SUM(supply_gap_units),
        0
      ) AS total_supply_gap,

      COALESCE(
        SUM(excess_inventory_units),
        0
      ) AS total_excess_inventory,

      COUNT(*) FILTER (
        WHERE status = 'SHORTAGE'
      ) AS shortage_products,

      COUNT(*) FILTER (
        WHERE status = 'EXCESS'
      ) AS excess_products,

      COUNT(*) FILTER (
        WHERE status = 'BALANCED'
      ) AS balanced_products

    FROM p2.sop_plan_lines
    WHERE sop_cycle_id = $1
  `;

    const result = await pool.query(query, [cycleId]);

    return result.rows[0];
  }

  //recommendation
  static async createRecommendation({
    cycleId,
    productId,
    recommendationType,
    severity,
    message,
    recommendedAction,
  }) {
    const query = `
    INSERT INTO p2.sop_recommendations (
      sop_cycle_id,
      product_id,
      recommendation_type,
      severity,
      message,
      recommended_action,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
    RETURNING *
  `;

    const result = await pool.query(query, [
      cycleId,
      productId,
      recommendationType,
      severity,
      message,
      recommendedAction,
    ]);

    return result.rows[0];
  }

  static async getRecommendationsByCycleId(cycleId) {
    const query = `
    SELECT
      sr.id,
      sr.sop_cycle_id,
      sr.product_id,
      p.sku_code,
      p.name AS product_name,
      sr.recommendation_type,
      sr.severity,
      sr.message,
      sr.recommended_action,
      sr.status,
      sr.created_at,
      sr.updated_at
    FROM p2.sop_recommendations sr
    JOIN p2.products p
      ON p.id = sr.product_id
    WHERE sr.sop_cycle_id = $1
    ORDER BY
      CASE UPPER(sr.severity)
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
        ELSE 5
      END,
      sr.created_at DESC
  `;

    const result = await pool.query(query, [cycleId]);

    return result.rows;
  }

  static async deleteRecommendationsByCycleId(cycleId) {
    await pool.query(
      `
      DELETE FROM p2.sop_recommendations
      WHERE sop_cycle_id = $1
    `,
      [cycleId],
    );
  }

  static async getRecommendationSummary(cycleId) {
    const query = `
    SELECT
      COUNT(*) AS total_recommendations,

      COUNT(*) FILTER (
        WHERE UPPER(severity) = 'CRITICAL'
      ) AS critical_count,

      COUNT(*) FILTER (
        WHERE UPPER(severity) = 'HIGH'
      ) AS high_count,

      COUNT(*) FILTER (
        WHERE UPPER(severity) = 'MEDIUM'
      ) AS medium_count,

      COUNT(*) FILTER (
        WHERE UPPER(severity) = 'LOW'
      ) AS low_count,

      COUNT(*) FILTER (
        WHERE UPPER(status) = 'OPEN'
      ) AS open_count,

      COUNT(*) FILTER (
        WHERE UPPER(status) = 'RESOLVED'
      ) AS resolved_count

    FROM p2.sop_recommendations
    WHERE sop_cycle_id = $1
  `;

    const result = await pool.query(query, [cycleId]);

    return result.rows[0];
  }

  // E2 shipment + truck execution data
  static async getShipmentExecutionInputs() {
    const query = `
    SELECT
      s.procurement_plan_id,
      s.shipment_reference,
      s.status AS shipment_status,
      s.planned_arrival,
      s.planned_quantity_m,
      s.received_quantity_m,

      t.id AS truck_id,
      t.trailer_id,
      t.tracking_number,
      t.status AS truck_status,
      t.current_yard_name,
      t.current_location,
      t.latitude,
      t.longitude,
      t.current_eta

    FROM e2.shipments s

    LEFT JOIN e2.trucks t
      ON t.shipment_id = s.id

    WHERE s.procurement_plan_id IS NOT NULL

    ORDER BY
      s.procurement_plan_id,
      s.shipment_reference
  `;

    const result = await pool.query(query);

    return result.rows;
  }

  //procurement
  static async getProcurementInputs() {
    const query = `
    SELECT
      pp.id AS procurement_plan_id,
      pp.product_id,
      pp.planning_week,
      pp.required_fabric_m,
      pp.recommended_order_qty_m,
      pp.lead_time_weeks,
      pp.moq_meters,
      pp.risk_level
    FROM p2.procurement_plans pp
    ORDER BY pp.product_id, pp.planning_week
  `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default SopModel;
