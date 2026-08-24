import pool from "../../../common/config/database.js";

class OverviewModel {
  static async getOverview() {
    const query = `
      WITH truck_summary AS (
        SELECT
          COUNT(*) AS total_trucks,

          COUNT(*) FILTER (
            WHERE status IN ('SCHEDULED', 'IN_TRANSIT')
          ) AS arriving_trucks,

          COUNT(*) FILTER (
            WHERE status = 'IN_YARD'
          ) AS trucks_in_yard,

          COUNT(*) FILTER (
            WHERE status = 'DELAYED'
          ) AS delayed_trucks,

          COUNT(*) FILTER (
            WHERE status = 'AT_DOCK'
          ) AS trucks_at_dock

        FROM e2.trucks
      ),

      dock_summary AS (
        SELECT
          COUNT(*) AS total_docks,

          COUNT(*) FILTER (
            WHERE status = 'AVAILABLE'
          ) AS available_docks,

          COUNT(*) FILTER (
            WHERE status = 'OCCUPIED'
          ) AS occupied_docks,

          COUNT(*) FILTER (
            WHERE status = 'RESERVED'
          ) AS reserved_docks,

          COUNT(*) FILTER (
            WHERE status = 'MAINTENANCE'
          ) AS maintenance_docks

        FROM e2.docks
      ),

      yard_summary AS (
        SELECT
          COUNT(*) AS total_yards,

          COUNT(*) FILTER (
            WHERE status = 'ACTIVE'
          ) AS active_yards,

          COUNT(*) FILTER (
            WHERE status = 'FULL'
          ) AS full_yards,

          COALESCE(SUM(capacity), 0) AS total_capacity

        FROM e2.yards
      ),

      shipment_summary AS (
        SELECT
          COUNT(*) AS total_shipments,

          COUNT(*) FILTER (
            WHERE status = 'IN_TRANSIT'
          ) AS shipments_in_transit,

          COUNT(*) FILTER (
            WHERE status = 'ARRIVED'
          ) AS shipments_arrived,

          COUNT(*) FILTER (
            WHERE status = 'DELAYED'
          ) AS delayed_shipments,

          COUNT(*) FILTER (
            WHERE status = 'COMPLETED'
          ) AS completed_shipments

        FROM e2.shipments
      )

      SELECT
        ts.total_trucks,
        ts.arriving_trucks,
        ts.trucks_in_yard,
        ts.delayed_trucks,
        ts.trucks_at_dock,

        ds.total_docks,
        ds.available_docks,
        ds.occupied_docks,
        ds.reserved_docks,
        ds.maintenance_docks,

        ys.total_yards,
        ys.active_yards,
        ys.full_yards,
        ys.total_capacity,

        ss.total_shipments,
        ss.shipments_in_transit,
        ss.shipments_arrived,
        ss.delayed_shipments,
        ss.completed_shipments

      FROM truck_summary ts
      CROSS JOIN dock_summary ds
      CROSS JOIN yard_summary ys
      CROSS JOIN shipment_summary ss
    `;

    const result = await pool.query(query);

    return result.rows[0] || null;
  }
}

export default OverviewModel;
