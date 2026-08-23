import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// ------------------------------------------------------------------
// Connection: paste your Neon connection string into a .env file as
// DATABASE_URL, e.g.
// DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
// ------------------------------------------------------------------
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const filePath = path.join(
    process.cwd(),
    "src",
    "db",
    "seed",
    "e2_dummy_data.xlsx"
);

function readSheet(sheetName) {
    const workbook = xlsx.readFile(filePath, { cellDates: true });

    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
    }

    return xlsx.utils.sheet_to_json(sheet, { defval: null });
}

async function seedE2() {
    const client = await pool.connect();

    try {
        console.log("Starting E2 database seed...");

        await client.query("BEGIN");

        /*
         * WARNING:
         * This resets the E2 tables before inserting.
         * Use this only for development/seeding.
         */

        await client.query(`
            TRUNCATE TABLE
                e2.truck_alerts,
                e2.dock_assignments,
                e2.trucks,
                e2.shipments,
                e2.docks,
                e2.yards
            RESTART IDENTITY CASCADE
        `);

        // ==========================================
        // 1. YARDS
        // ==========================================

        const yards = readSheet("yards");

        for (const row of yards) {
            await client.query(
                `
                INSERT INTO e2.yards
                    (id, name, capacity, status)
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.id,
                    row.name,
                    row.capacity,
                    row.status || "ACTIVE"
                ]
            );
        }

        console.log(`✓ Yards inserted: ${yards.length}`);

        // ==========================================
        // 2. DOCKS
        // ==========================================

        const docks = readSheet("docks");

        for (const row of docks) {
            await client.query(
                `
                INSERT INTO e2.docks
                    (id, dock_code, status, supported_load_type)
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.id,
                    row.dock_code,
                    row.status || "AVAILABLE",
                    row.supported_load_type
                ]
            );
        }

        console.log(`✓ Docks inserted: ${docks.length}`);

        // ==========================================
        // 3. SHIPMENTS
        // ==========================================

        const shipments = readSheet("shipments");

        for (const row of shipments) {
            await client.query(
                `
                INSERT INTO e2.shipments
                    (id, shipment_reference, origin, destination, status)
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    row.id,
                    row.shipment_reference,
                    row.origin,
                    row.destination,
                    row.status || "PLANNED"
                ]
            );
        }

        console.log(`✓ Shipments inserted: ${shipments.length}`);

        // ==========================================
        // 4. TRUCKS
        // (shipment_id -> shipments.id, current_yard_id -> yards.id)
        // ==========================================

        const trucks = readSheet("trucks");

        for (const row of trucks) {
            await client.query(
                `
                INSERT INTO e2.trucks
                    (
                        id,
                        trailer_id,
                        tracking_number,
                        shipment_id,
                        load_type,
                        priority,
                        status,
                        scheduled_arrival,
                        current_eta,
                        current_yard_id,
                        current_location,
                        latitude,
                        longitude,
                        location_updated_at
                    )
                VALUES
                    (
                        $1, $2, $3, $4, $5, $6, $7,
                        $8, $9, $10, $11, $12, $13, $14
                    )
                `,
                [
                    row.id,
                    row.trailer_id,
                    row.tracking_number,
                    row.shipment_id || null,
                    row.load_type,
                    row.priority || "NORMAL",
                    row.status || "SCHEDULED",
                    row.scheduled_arrival || null,
                    row.current_eta || null,
                    row.current_yard_id || null,
                    row.current_location,
                    row.latitude,
                    row.longitude,
                    row.location_updated_at || null
                ]
            );
        }

        console.log(`✓ Trucks inserted: ${trucks.length}`);

        // ==========================================
        // 5. DOCK ASSIGNMENTS
        // (truck_id -> trucks.id, dock_id -> docks.id)
        // ==========================================

        const dockAssignments = readSheet("dock_assignments");

        for (const row of dockAssignments) {
            if (!row.truck_id) {
                throw new Error("dock_assignments row missing truck_id");
            }

            if (!row.dock_id) {
                throw new Error("dock_assignments row missing dock_id");
            }

            await client.query(
                `
                INSERT INTO e2.dock_assignments
                    (
                        id,
                        truck_id,
                        dock_id,
                        scheduled_time,
                        assigned_time,
                        status,
                        assignment_reason
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                    row.id,
                    row.truck_id,
                    row.dock_id,
                    row.scheduled_time || null,
                    row.assigned_time || null,
                    row.status || "ASSIGNED",
                    row.assignment_reason || null
                ]
            );
        }

        console.log(`✓ Dock assignments inserted: ${dockAssignments.length}`);

        // ==========================================
        // 6. TRUCK ALERTS
        // (truck_id -> trucks.id)
        // ==========================================

        const truckAlerts = readSheet("truck_alerts");

        for (const row of truckAlerts) {
            if (!row.truck_id) {
                throw new Error("truck_alerts row missing truck_id");
            }

            await client.query(
                `
                INSERT INTO e2.truck_alerts
                    (
                        id,
                        truck_id,
                        alert_type,
                        severity,
                        message,
                        is_resolved,
                        resolved_at
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                    row.id,
                    row.truck_id,
                    row.alert_type,
                    row.severity || "MEDIUM",
                    row.message,
                    row.is_resolved === true || row.is_resolved === "TRUE" || row.is_resolved === 1,
                    row.resolved_at || null
                ]
            );
        }

        console.log(`✓ Truck alerts inserted: ${truckAlerts.length}`);

        await client.query("COMMIT");

        console.log("");
        console.log("====================================");
        console.log("E2 DATABASE SEED COMPLETED SUCCESSFULLY");
        console.log("====================================");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("");
        console.error("❌ E2 seed failed");
        console.error(error);

        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
}

seedE2();