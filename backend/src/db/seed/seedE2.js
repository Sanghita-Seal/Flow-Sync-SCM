import path from "path";
import xlsx from "xlsx";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const filePath = path.join(
    process.cwd(),
    "src",
    "db",
    "seed",
    "E2_Prototype_Final_Dataset_v2.xlsx"
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

        // ==========================================
        // RESET TABLES
        // ==========================================

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
                    (
                        id,
                        name,
                        capacity,
                        number_of_trucks,
                        status
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    row.id,
                    row.name,
                    row.capacity,
                    row.number_of_trucks || 0,
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
                    (
                        id,
                        dock_code,
                        yard_name,
                        status
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.id,
                    row.dock_code,
                    row.yard_name,
                    row.status || "AVAILABLE"
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
                    (
                        id,
                        shipment_reference,
                        origin,
                        destination,
                        status
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    row.id,
                    row.shipment_reference,
                    row.origin,
                    row.destination,
                    row.status || "IN_TRANSIT"
                ]
            );
        }

        console.log(`✓ Shipments inserted: ${shipments.length}`);

        // ==========================================
        // 4. TRUCKS
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
                        current_yard_name,
                        current_location,
                        latitude,
                        longitude,
                        current_eta
                    )
                VALUES
                    (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10, $11, $12
                    )
                `,
                [
                    row.id,
                    row.trailer_id,
                    row.tracking_number,
                    row.shipment_id || null,
                    row.load_type,
                    row.priority || "MEDIUM",
                    row.status || "IN_TRANSIT",
                    row.current_yard_name || null,
                    row.current_location,
                    row.latitude,
                    row.longitude,
                    row.current_eta || null
                ]
            );
        }

        console.log(`✓ Trucks inserted: ${trucks.length}`);

        // ==========================================
        // 5. DOCK ASSIGNMENTS
        // ==========================================

        const dockAssignments = readSheet("dock_assignments");

        for (const row of dockAssignments) {
            await client.query(
                `
                INSERT INTO e2.dock_assignments
                    (
                        id,
                        trailer_id,
                        dock_code,
                        yard_name
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.id,
                    row.trailer_id,
                    row.dock_code,
                    row.yard_name
                ]
            );
        }

        console.log(
            `✓ Dock assignments inserted: ${dockAssignments.length}`
        );

        // ==========================================
        // 6. TRUCK ALERTS
        // ==========================================

        const truckAlerts = readSheet("truck_alerts");

        for (const row of truckAlerts) {
            await client.query(
                `
                INSERT INTO e2.truck_alerts
                    (
                        id,
                        trailer_id,
                        alert_reason,
                        message
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.id,
                    row.trailer_id,
                    row.alert_reason,
                    row.message
                ]
            );
        }

        console.log(
            `✓ Truck alerts inserted: ${truckAlerts.length}`
        );

        // ==========================================
        // COMMIT
        // ==========================================

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