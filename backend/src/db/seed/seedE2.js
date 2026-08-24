import path from "path";
import xlsx from "xlsx";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// ============================================================
// DATABASE CONNECTION
// ============================================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ============================================================
// EXCEL FILE
// ============================================================

const filePath = path.join(
    process.cwd(),
    "src",
    "db",
    "seed",
    "E2_Prototype_Final_Dataset_v2.xlsx"
);

// ============================================================
// READ EXCEL SHEET
// ============================================================

function readSheet(sheetName) {
    const workbook = xlsx.readFile(filePath, {
        cellDates: true
    });

    const actualSheetName = workbook.SheetNames.find(
        (name) =>
            name.toLowerCase().trim() === sheetName.toLowerCase().trim()
    );

    if (!actualSheetName) {
        throw new Error(
            `Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`
        );
    }

    const sheet = workbook.Sheets[actualSheetName];

    return xlsx.utils.sheet_to_json(sheet, {
        defval: null
    });
}

// ============================================================
// SEED DATABASE
// ============================================================

async function seedE2() {
    const client = await pool.connect();

    try {
        console.log("Starting E2 database seed...");
        console.log(`Excel file: ${filePath}`);

        await client.query("BEGIN");

        // =====================================================
        // RESET TABLES
        // =====================================================

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

        console.log("✓ Existing E2 data cleared");

        // =====================================================
        // 1. YARDS
        // =====================================================

        const yards = readSheet("Yards");

        for (const row of yards) {

            await client.query(
                `
                INSERT INTO e2.yards
                (
                    name,
                    capacity,
                    number_of_trucks,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    row.name,
                    row.capacity,
                    row.number_of_trucks ?? 0,
                    row.status || "ACTIVE"
                ]
            );
        }

        console.log(`✓ Yards inserted: ${yards.length}`);

        // =====================================================
        // 2. DOCKS
        // =====================================================

        const docks = readSheet("Docks");

        for (const row of docks) {

            // Validate yard exists
            const yardResult = await client.query(
                `
                SELECT name
                FROM e2.yards
                WHERE name = $1
                `,
                [row.yard_name]
            );

            if (yardResult.rows.length === 0) {
                throw new Error(
                    `Dock ${row.dock_code} refers to unknown yard: ${row.yard_name}`
                );
            }

            await client.query(
                `
                INSERT INTO e2.docks
                (
                    dock_code,
                    yard_name,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,
                [
                    row.dock_code,
                    row.yard_name,
                    row.status || "AVAILABLE"
                ]
            );
        }

        console.log(`✓ Docks inserted: ${docks.length}`);

        // =====================================================
        // 3. SHIPMENTS
        // =====================================================

        const shipments = readSheet("Shipments");

        for (const row of shipments) {

            await client.query(
                `
                INSERT INTO e2.shipments
                (
                    shipment_reference,
                    origin,
                    destination,
                    status
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    row.shipment_reference,
                    row.origin,
                    row.destination,
                    row.status || "IN_TRANSIT"
                ]
            );
        }

        console.log(`✓ Shipments inserted: ${shipments.length}`);

        // =====================================================
        // 4. TRUCKS
        // =====================================================

        const trucks = readSheet("Trucks");

        for (const row of trucks) {

            // -------------------------------------------------
            // Find shipment UUID using shipment_reference
            // -------------------------------------------------

            let shipmentId = null;

            if (row.shipment_reference) {

                const shipmentResult = await client.query(
                    `
                    SELECT id
                    FROM e2.shipments
                    WHERE shipment_reference = $1
                    `,
                    [row.shipment_reference]
                );

                if (shipmentResult.rows.length === 0) {
                    throw new Error(
                        `Truck ${row.trailer_id} refers to unknown shipment: ${row.shipment_reference}`
                    );
                }

                shipmentId = shipmentResult.rows[0].id;
            }

            // -------------------------------------------------
            // Insert truck
            // -------------------------------------------------

            await client.query(
                `
                INSERT INTO e2.trucks
                (
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
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11
                )
                `,
                [
                    row.trailer_id,
                    row.tracking_number,
                    shipmentId,
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

        // =====================================================
        // 5. DOCK ASSIGNMENTS
        // =====================================================

        const dockAssignments = readSheet("Dock Assignments");

        for (const row of dockAssignments) {

            // -------------------------------------------------
            // Validate trailer
            // -------------------------------------------------

            const truckResult = await client.query(
                `
                SELECT trailer_id
                FROM e2.trucks
                WHERE trailer_id = $1
                `,
                [row.trailer_id]
            );

            if (truckResult.rows.length === 0) {
                throw new Error(
                    `Dock assignment refers to unknown trailer: ${row.trailer_id}`
                );
            }

            // -------------------------------------------------
            // Validate dock
            // -------------------------------------------------

            const dockResult = await client.query(
                `
                SELECT dock_code
                FROM e2.docks
                WHERE dock_code = $1
                `,
                [row.dock_code]
            );

            if (dockResult.rows.length === 0) {
                throw new Error(
                    `Dock assignment refers to unknown dock: ${row.dock_code}`
                );
            }

            // -------------------------------------------------
            // Insert assignment
            // -------------------------------------------------

            await client.query(
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
                `,
                [
                    row.trailer_id,
                    row.dock_code,
                    row.yard_name
                ]
            );
        }

        console.log(
            `✓ Dock assignments inserted: ${dockAssignments.length}`
        );

        // =====================================================
        // 6. TRUCK ALERTS
        // =====================================================

        const truckAlerts = readSheet("Truck Alerts");

        for (const row of truckAlerts) {

            // -------------------------------------------------
            // Validate trailer
            // -------------------------------------------------

            const truckResult = await client.query(
                `
                SELECT trailer_id
                FROM e2.trucks
                WHERE trailer_id = $1
                `,
                [row.trailer_id]
            );

            if (truckResult.rows.length === 0) {
                throw new Error(
                    `Truck alert refers to unknown trailer: ${row.trailer_id}`
                );
            }

            // -------------------------------------------------
            // Insert alert
            // -------------------------------------------------

            await client.query(
                `
                INSERT INTO e2.truck_alerts
                (
                    trailer_id,
                    alert_reason,
                    message
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,
                [
                    row.trailer_id,
                    row.alert_reason,
                    row.message
                ]
            );
        }

        console.log(
            `✓ Truck alerts inserted: ${truckAlerts.length}`
        );

        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");

        console.log("");
        console.log("============================================");
        console.log("E2 DATABASE SEED COMPLETED SUCCESSFULLY");
        console.log("============================================");

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

// ============================================================
// RUN
// ============================================================

seedE2();