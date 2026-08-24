import pool from "../../../common/config/database.js";

class OverviewModel {
  static async getOverview() {
    const query = `
      WITH latest_cycle AS (
        SELECT
          id,
          cycle_name,
          start_date,
          end_date,
          status
        FROM p2.sop_cycles
        ORDER BY start_date DESC
        LIMIT 1
      ),

      plan_summary AS (
        SELECT
          COUNT(*) AS product_count,
          COALESCE(SUM(forecast_demand_units), 0)
            AS total_forecast_demand,
          COALESCE(SUM(opening_inventory_units), 0)
            AS total_opening_inventory,
          COALESCE(SUM(production_capacity_units), 0)
            AS total_production_capacity,
          COALESCE(SUM(planned_production_units), 0)
            AS total_planned_production,
          COALESCE(SUM(projected_ending_inventory), 0)
            AS total_projected_inventory,
          COALESCE(SUM(supply_gap_units), 0)
            AS total_supply_gap,
          COALESCE(SUM(excess_inventory_units), 0)
            AS total_excess_inventory,

          COUNT(*) FILTER (
            WHERE UPPER(status) = 'BALANCED'
          ) AS balanced_products,

          COUNT(*) FILTER (
            WHERE UPPER(status) = 'SHORTAGE'
          ) AS shortage_products,

          COUNT(*) FILTER (
            WHERE UPPER(status) = 'EXCESS'
          ) AS excess_products

        FROM p2.sop_plan_lines
        WHERE sop_cycle_id = (
          SELECT id FROM latest_cycle
        )
      ),

      procurement_summary AS (
        SELECT
          COUNT(*) FILTER (
            WHERE UPPER(COALESCE(risk_level, '')) IN
              ('HIGH', 'CRITICAL')
          ) AS procurement_risks
        FROM p2.procurement_plans
      ),

      markdown_summary AS (
        SELECT
          COUNT(*) AS markdown_candidates
        FROM p2.markdown_history
      ),

      recommendation_summary AS (
        SELECT
          COUNT(*) AS total_recommendations,

          COUNT(*) FILTER (
            WHERE UPPER(severity) = 'CRITICAL'
          ) AS critical_recommendations,

          COUNT(*) FILTER (
            WHERE UPPER(severity) = 'HIGH'
          ) AS high_recommendations,

          COUNT(*) FILTER (
            WHERE UPPER(status) = 'OPEN'
          ) AS open_recommendations

        FROM p2.sop_recommendations
        WHERE sop_cycle_id = (
          SELECT id FROM latest_cycle
        )
      )

      SELECT
        lc.id AS cycle_id,
        lc.cycle_name,
        lc.start_date,
        lc.end_date,
        lc.status AS cycle_status,

        ps.product_count,
        ps.total_forecast_demand,
        ps.total_opening_inventory,
        ps.total_production_capacity,
        ps.total_planned_production,
        ps.total_projected_inventory,
        ps.total_supply_gap,
        ps.total_excess_inventory,

        ps.balanced_products,
        ps.shortage_products,
        ps.excess_products,

        CASE
          WHEN ps.product_count = 0 THEN 0
          ELSE ROUND(
            (
              ps.balanced_products::numeric
              / ps.product_count
            ) * 100,
            2
          )
        END AS sop_health,

        proc.procurement_risks,

        md.markdown_candidates,

        rs.total_recommendations,
        rs.critical_recommendations,
        rs.high_recommendations,
        rs.open_recommendations

      FROM latest_cycle lc
      CROSS JOIN plan_summary ps
      CROSS JOIN procurement_summary proc
      CROSS JOIN markdown_summary md
      CROSS JOIN recommendation_summary rs
    `;

    const result = await pool.query(query);

    return result.rows[0] || null;
  }

  static async getTopRisks() {
    const query = `
      SELECT
        sr.id,
        sr.product_id,
        p.sku_code,
        p.name AS product_name,
        sr.recommendation_type,
        sr.severity,
        sr.message,
        sr.recommended_action
      FROM p2.sop_recommendations sr
      JOIN p2.products p
        ON p.id = sr.product_id
      WHERE sr.sop_cycle_id = (
        SELECT id
        FROM p2.sop_cycles
        ORDER BY start_date DESC
        LIMIT 1
      )
      AND UPPER(sr.status) = 'OPEN'
      ORDER BY
        CASE UPPER(sr.severity)
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
          ELSE 5
        END,
        sr.created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}

export default OverviewModel;