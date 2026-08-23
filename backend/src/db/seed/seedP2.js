import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import pool from "../../config/database.js";

const filePath = path.join(
    process.cwd(),
    "src",
    "db",
    "seed",
    "P2_cleaned_validated_dataset.xlsx"
);

function readSheet(sheetName) {
    const workbook = xlsx.readFile(filePath);

    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
    }

    return xlsx.utils.sheet_to_json(sheet);
}

async function seedP2() {
    const client = await pool.connect();

    try {
        console.log("Starting P2 database seed...");

        await client.query("BEGIN");

        /*
         * WARNING:
         * This resets the P2 tables before inserting.
         * Use this only for development/seeding.
         */

        await client.query(`
            TRUNCATE TABLE
                p2.sop_recommendations,
                p2.procurement_plans,
                p2.sop_plan_lines,
                p2.sop_cycles,
                p2.markdown_history,
                p2.logistics_routes,
                p2.production_capacity,
                p2.inventory,
                p2.sell_through,
                p2.demand_forecasts,
                p2.products,
                p2.fabrics,
                p2.plants,
                p2.suppliers
            RESTART IDENTITY CASCADE
        `);

        // ==========================================
        // 1. SUPPLIERS
        // ==========================================

        const suppliers = readSheet("suppliers");

        const supplierMap = new Map();

        for (const supplier of suppliers) {
            const result = await client.query(
                `
                INSERT INTO p2.suppliers
                    (supplier_code, name)
                VALUES
                    ($1, $2)
                RETURNING id
                `,
                [
                    supplier.supplier_code,
                    supplier.name
                ]
            );

            supplierMap.set(
                supplier.supplier_code,
                result.rows[0].id
            );
        }

        console.log(`✓ Suppliers inserted: ${suppliers.length}`);

        // ==========================================
        // 2. PLANTS
        // ==========================================

        const plants = readSheet("plants");

        const plantMap = new Map();

        for (const plant of plants) {
            const result = await client.query(
                `
                INSERT INTO p2.plants
                    (
                        plant_code,
                        name,
                        location,
                        total_capacity_units,
                        status
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING id
                `,
                [
                    plant.plant_code,
                    plant.name,
                    plant.location || null,
                    plant.total_capacity_units || null,
                    plant.status || "ACTIVE"
                ]
            );

            plantMap.set(
                plant.plant_code,
                result.rows[0].id
            );
        }

        console.log(`✓ Plants inserted: ${plants.length}`);

        // ==========================================
        // 3. FABRICS
        // ==========================================

        const fabrics = readSheet("fabrics");

        const fabricMap = new Map();

        for (const fabric of fabrics) {
            const supplierId = supplierMap.get(
                fabric.supplier_id
            );

            if (!supplierId) {
                throw new Error(
                    `Supplier not found: ${fabric.supplier_id}`
                );
            }

            const result = await client.query(
                `
                INSERT INTO p2.fabrics
                    (
                        fabric_code,
                        name,
                        moq_meters,
                        lead_time_weeks,
                        cost_per_meter,
                        supplier_id
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6)
                RETURNING id
                `,
                [
                    fabric.fabric_code,
                    fabric.name,
                    fabric.moq_meters,
                    fabric.lead_time_weeks,
                    fabric.cost_per_meter,
                    supplierId
                ]
            );

            fabricMap.set(
                fabric.fabric_code,
                result.rows[0].id
            );
        }

        console.log(`✓ Fabrics inserted: ${fabrics.length}`);

        // ==========================================
        // 4. PRODUCTS
        // ==========================================

        const products = readSheet("products");

        const productMap = new Map();

        for (const product of products) {
            const fabricId = fabricMap.get(
                product.fabric_id
            );

            const plantId = plantMap.get(
                product.plant_id
            );

            if (!fabricId) {
                throw new Error(
                    `Fabric not found: ${product.fabric_id}`
                );
            }

            if (!plantId) {
                throw new Error(
                    `Plant not found: ${product.plant_id}`
                );
            }

            const result = await client.query(
                `
                INSERT INTO p2.products
                    (
                        sku_code,
                        name,
                        category,
                        fabric_id,
                        plant_id,
                        selling_price,
                        production_cost,
                        fabric_meters_per_unit
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
                `,
                [
                    product.sku_code,
                    product.name,
                    product.category,
                    fabricId,
                    plantId,
                    product.selling_price,
                    product.production_cost,
                    product.fabric_meters_per_unit
                ]
            );

            productMap.set(
                product.sku_code,
                result.rows[0].id
            );
        }

        console.log(`✓ Products inserted: ${products.length}`);

        // ==========================================
        // 5. DEMAND FORECASTS
        // ==========================================

        const forecasts = readSheet("demand_forecasts");

        for (const row of forecasts) {
            const productId = productMap.get(row.sku_id);

            await client.query(
                `
                INSERT INTO p2.demand_forecasts
                    (
                        product_id,
                        week,
                        week_number,
                        forecast_demand_units
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    productId,
                    row.week,
                    row.week_number,
                    row.forecast_demand_units
                ]
            );
        }

        console.log(`✓ Demand forecasts inserted: ${forecasts.length}`);

        // ==========================================
        // 6. SELL THROUGH
        // ==========================================

        const sellThrough = readSheet("sell_through");

        for (const row of sellThrough) {
            const productId = productMap.get(row.sku_id);

            await client.query(
                `
                INSERT INTO p2.sell_through
                    (
                        product_id,
                        week,
                        week_number,
                        units_sold,
                        sell_through_pct
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    productId,
                    row.week,
                    row.week_number,
                    row.units_sold,
                    row.sell_through_pct
                ]
            );
        }

        console.log(`✓ Sell-through records inserted: ${sellThrough.length}`);

        // ==========================================
        // 7. INVENTORY
        // ==========================================

        const inventory = readSheet("inventory");

        for (const row of inventory) {
            const productId = productMap.get(row.sku_id);

            await client.query(
                `
                INSERT INTO p2.inventory
                    (
                        product_id,
                        current_inventory_units
                    )
                VALUES
                    ($1, $2)
                `,
                [
                    productId,
                    row.current_inventory_units
                ]
            );
        }

        console.log(`✓ Inventory records inserted: ${inventory.length}`);

        // ==========================================
        // 8. PRODUCTION CAPACITY
        // ==========================================

        const capacities = readSheet("production_capacity");

        for (const row of capacities) {
            const productId = productMap.get(row.sku_id);
            const plantId = plantMap.get(row.plant_id);

            await client.query(
                `
                INSERT INTO p2.production_capacity
                    (
                        plant_id,
                        product_id,
                        week,
                        week_number,
                        capacity_units
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    plantId,
                    productId,
                    row.week,
                    row.week_number,
                    row.capacity_units
                ]
            );
        }

        console.log(`✓ Production capacity inserted: ${capacities.length}`);

        // ==========================================
        // 9. LOGISTICS ROUTES
        // ==========================================

        const routes = readSheet("logistics_routes");

        for (const row of routes) {
            await client.query(
                `
                INSERT INTO p2.logistics_routes
                    (
                        dc_id,
                        store_id,
                        lead_time_days,
                        transport_capacity_units
                    )
                VALUES
                    ($1, $2, $3, $4)
                `,
                [
                    row.dc_id,
                    row.store_id,
                    row.lead_time_days,
                    row.transport_capacity_units
                ]
            );
        }

        console.log(`✓ Logistics routes inserted: ${routes.length}`);

        // ==========================================
        // 10. MARKDOWN HISTORY
        // ==========================================

        const markdown = readSheet("markdown_history");

        for (const row of markdown) {
            const productId = productMap.get(row.sku_id);

            await client.query(
                `
                INSERT INTO p2.markdown_history
                    (
                        product_id,
                        week,
                        week_number,
                        markdown_pct,
                        reason
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    productId,
                    row.week,
                    row.week_number,
                    row.markdown_pct,
                    row.reason
                ]
            );
        }

        console.log(`✓ Markdown history inserted: ${markdown.length}`);

        // ==========================================
        // 11. CREATE S&OP CYCLE
        // ==========================================

        const cycleResult = await client.query(
            `
            INSERT INTO p2.sop_cycles
                (
                    cycle_name,
                    start_date,
                    end_date,
                    status
                )
            VALUES
                ($1, $2, $3, $4)
            RETURNING id
            `,
            [
                "SOP-2026-AUG",
                "2026-08-01",
                "2026-08-31",
                "DRAFT"
            ]
        );

        const sopCycleId = cycleResult.rows[0].id;

        console.log("✓ S&OP cycle created");

        // ==========================================
        // 12. S&OP PLAN LINES
        // ==========================================

        const sopData = readSheet("sop_calculated_reference");

        for (const row of sopData) {
            const productId = productMap.get(row.sku_id);

            await client.query(
                `
                INSERT INTO p2.sop_plan_lines
                    (
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
                VALUES
                    (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10
                    )
                `,
                [
                    sopCycleId,
                    productId,
                    row.forecast_demand_units,
                    row.opening_inventory_units,
                    row.capacity_units,
                    row.planned_production_units,
                    row.projected_ending_inventory,
                    row.supply_gap_units,
                    row.excess_inventory_units,
                    row.status
                ]
            );
        }

        console.log(`✓ S&OP plan lines inserted: ${sopData.length}`);

        // ==========================================
        // 13. PROCUREMENT PLANS
        // ==========================================

        const procurement = readSheet("procurement_plans");

        for (const row of procurement) {
            const productId = productMap.get(row.sku_id);
            const fabricId = fabricMap.get(row.fabric_id);

            await client.query(
                `
                INSERT INTO p2.procurement_plans
                    (
                        sop_cycle_id,
                        product_id,
                        fabric_id,
                        planning_week,
                        required_fabric_m,
                        moq_meters,
                        recommended_order_qty_m,
                        lead_time_weeks,
                        risk_level,
                        status
                    )
                VALUES
                    (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10
                    )
                `,
                [
                    sopCycleId,
                    productId,
                    fabricId,
                    row.planning_week,
                    row.required_fabric_m,
                    row.moq_meters,
                    row.recommended_order_qty_m,
                    row.lead_time_weeks,
                    row.risk_level,
                    "RECOMMENDED"
                ]
            );
        }

        console.log(`✓ Procurement plans inserted: ${procurement.length}`);

        // ==========================================
        // 14. S&OP RECOMMENDATIONS
        // ==========================================

        for (const row of sopData) {
            if (!row.recommendation) {
                continue;
            }

            const productId = productMap.get(row.sku_id);

            let recommendationType = "DEMAND_RISK";

            if (row.status === "Excess") {
                recommendationType = "EXCESS_INVENTORY";
            }

            if (row.status === "Shortage") {
                recommendationType = "CAPACITY_SHORTAGE";
            }

            await client.query(
                `
                INSERT INTO p2.sop_recommendations
                    (
                        sop_cycle_id,
                        product_id,
                        recommendation_type,
                        severity,
                        message,
                        recommended_action,
                        status
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                    sopCycleId,
                    productId,
                    recommendationType,
                    "MEDIUM",
                    row.recommendation,
                    row.recommendation,
                    "OPEN"
                ]
            );
        }

        await client.query("COMMIT");

        console.log("");
        console.log("====================================");
        console.log("P2 DATABASE SEED COMPLETED SUCCESSFULLY");
        console.log("====================================");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("");
        console.error("❌ P2 seed failed");
        console.error(error);

        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
}

seedP2();