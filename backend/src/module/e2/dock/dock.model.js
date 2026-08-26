import pool from "../../../common/config/database.js";

class DockModel {
  // Get all docks
  static async getDocks() {
    const query = `
      SELECT
        id,
        dock_code,
        yard_name,
        status
      FROM e2.docks
      ORDER BY dock_code;
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  // Get dock by dock code
  static async getDockByCode(dockCode) {
    const query = `
      SELECT
        id,
        dock_code,
        yard_name,
        status
      FROM e2.docks
      WHERE dock_code = $1;
    `;

    const result = await pool.query(query, [dockCode]);

    return result.rows[0];
  }

  // Get docks by status
  static async getDocksByStatus(status) {
    const query = `
      SELECT
        id,
        dock_code,
        yard_name,
        status
      FROM e2.docks
      WHERE status = $1
      ORDER BY dock_code;
    `;

    const result = await pool.query(query, [status]);

    return result.rows;
  }
  
// Assign available docks to eligible arrived trucks
  static async assignDocks() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // =========================================================
      // 1. FIND ELIGIBLE TRUCKS
      // =========================================================
      //
      // Conditions:
      // - Truck must be ARRIVED
      // - Truck must have a current yard
      // - Truck must NOT already have a dock assignment
      //
      // Priority:
      // HIGH → MEDIUM → LOW
      //

      const trucksResult = await client.query(`
        SELECT
          t.id,
          t.trailer_id,
          t.current_yard_name,
          t.priority
        FROM e2.trucks t

        LEFT JOIN e2.dock_assignments da
          ON da.trailer_id = t.trailer_id

        WHERE t.status = 'ARRIVED'
          AND t.current_yard_name IS NOT NULL
          AND da.trailer_id IS NULL

        ORDER BY
          CASE t.priority
            WHEN 'HIGH' THEN 1
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW' THEN 3
            ELSE 4
          END,
          t.trailer_id

        FOR UPDATE OF t
      `);

      const assigned = [];
      const waiting = [];

      // =========================================================
      // 2. PROCESS EACH ELIGIBLE TRUCK
      // =========================================================

      for (const truck of trucksResult.rows) {

        // -------------------------------------------------------
        // Find an AVAILABLE dock in the truck's current yard
        // -------------------------------------------------------

        const dockResult = await client.query(
          `
          SELECT
            id,
            dock_code,
            yard_name
          FROM e2.docks

          WHERE status = 'AVAILABLE'
            AND yard_name = $1

          ORDER BY dock_code

          LIMIT 1

          FOR UPDATE
          `,
          [truck.current_yard_name]
        );

        // -------------------------------------------------------
        // No available dock
        // -------------------------------------------------------

        if (dockResult.rows.length === 0) {

          waiting.push({
            trailer_id: truck.trailer_id,
            priority: truck.priority,
            yard_name: truck.current_yard_name,
            reason: "No available dock in the truck's yard"
          });

          continue;
        }

        const dock = dockResult.rows[0];

        // -------------------------------------------------------
        // Insert new dock assignment
        // -------------------------------------------------------

        const assignmentResult = await client.query(
          `
          INSERT INTO e2.dock_assignments
          (
            trailer_id,
            dock_code,
            yard_name
          )
          VALUES
          (
            $1,
            $2,
            $3
          )
          RETURNING
            id,
            trailer_id,
            dock_code,
            yard_name
          `,
          [
            truck.trailer_id,
            dock.dock_code,
            dock.yard_name
          ]
        );

        // -------------------------------------------------------
        // Change dock status
        // AVAILABLE → OCCUPIED
        // -------------------------------------------------------

        await client.query(
          `
          UPDATE e2.docks
          SET status = 'OCCUPIED'
          WHERE dock_code = $1
          `,
          [dock.dock_code]
        );

        // -------------------------------------------------------
        // Add to newly assigned list
        // -------------------------------------------------------

        assigned.push({
          trailer_id: truck.trailer_id,
          priority: truck.priority,
          yard_name: truck.current_yard_name,
          dock_code: dock.dock_code
        });
      }

      // =========================================================
      // 3. GET ALL CURRENT DOCK ASSIGNMENTS
      // =========================================================
      //
      // This includes:
      // - Existing assignments
      // - Newly created assignments
      //

      const currentAssignmentsResult = await client.query(`
        SELECT
          da.id,
          da.trailer_id,
          da.dock_code,
          da.yard_name,
          t.priority,
          t.status AS truck_status
        FROM e2.dock_assignments da

        LEFT JOIN e2.trucks t
          ON t.trailer_id = da.trailer_id

        ORDER BY
          da.yard_name,
          da.dock_code
      `);

      // =========================================================
      // 4. COMMIT
      // =========================================================

      await client.query("COMMIT");

      // =========================================================
      // 5. RETURN COMPLETE RESULT
      // =========================================================

      return {
        assigned,
        waiting,
        current_assignments: currentAssignmentsResult.rows
      };

    } catch (error) {

      await client.query("ROLLBACK");

      throw error;

    } finally {

      client.release();
    }
  }
}

export default DockModel;