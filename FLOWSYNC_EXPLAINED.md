# FlowSync — Complete Project Explained

> **The one-stop document to understand the entire FlowSync project — from problem statement to deployed solution. Written so that anyone, regardless of their role in the team, can understand every decision, every line of logic, and every integration point.**

---

## Executive Summary (For the Skimmer)

**FlowSync** is a Supply Chain Management platform built for the Cognizant SCM Hackathon. It solves one fundamental problem: **Planning and Execution in supply chains don't talk to each other.**

In real companies, the planning team (P2) creates procurement plans on spreadsheets, and the execution team (E2) tracks shipments on separate systems. When a shipment is delayed, nobody in planning knows — until it's too late.

**What FlowSync does:**
- **P2 (Planning):** Demand forecasting → Production scheduling → Inventory checks → S&OP reconciliation → Procurement plans
- **E2 (Execution):** Shipment tracking → Live truck GPS → Yard & dock management → Automated alerts
- **The Link:** Every procurement plan creates a shipment. Every shipment feeds back status to the plan.
- **The Loop:** Delays trigger risk alerts → AI generates recommendations → Planner adjusts next cycle

**Tech:** React 19 + Vite (frontend), Express 5 + PostgreSQL (backend), Clerk (auth), OpenAI GPT-4.1-nano (AI copilot), deployed on Vercel + Neon.

**Key numbers:** 16 database tables, 50+ API endpoints, 6 business rule engines, 25+ pages, 100+ git commits across 21 development phases.

---

# PART 1: THE PROBLEM

## 1.1 Industry Pain Points

Supply chain management in the real world suffers from a fundamental disconnect. Here's what happens in most companies:

### The Planning Team (P2)

The planning team works with:
- **Demand forecasts** — "How many units will we sell next month?"
- **Production schedules** — "Which plant makes what, and when?"
- **Inventory levels** — "What do we already have in stock?"
- **Procurement plans** — "How much raw material (fabric, steel, components) do we need to order from suppliers?"

They sit in meetings called **S&OP (Sales & Operations Planning)** cycles. They make decisions based on data, spreadsheets, and gut feeling. Their output: **procurement plans** — orders placed with suppliers for raw materials.

### The Execution Team (E2)

The execution team works with:
- **Shipments** — "Is the material on its way?"
- **Trucks** — "Where is the truck right now?"
- **Yards** — "Is the truck at our facility yet?"
- **Docks** — "Which loading dock should it go to?"

They track physical goods moving through the supply chain. Their output: **delivered materials** that production can use.

### The Problem

These two teams use **completely separate systems**. They don't share data. When a shipment is delayed by 3 days:

1. The execution team knows (they see the truck is late)
2. The planning team **does NOT know** (they're still planning as if the material will arrive on time)
3. Production gets surprised — raw material doesn't show up
4. The production schedule breaks
5. Customers don't get their products
6. Revenue is lost

**The core issue:** There is no feedback loop from execution back to planning.

## 1.2 The Disconnect: Planning vs Execution

```
TRADITIONAL SUPPLY CHAIN (Broken):

  PLANNING (P2)                          EXECUTION (E2)
  ┌──────────────┐                      ┌──────────────┐
  │ Demand       │                      │ Shipment     │
  │ Forecast     │                      │ Tracking     │
  │      ↓       │                      │      ↓       │
  │ Production   │     ✗ NO LINK ✗     │ Truck        │
  │ Schedule     │ ←──────────────────→ │ Tracking     │
  │      ↓       │                      │      ↓       │
  │ Procurement  │                      │ Yard/Dock    │
  │ Plan         │                      │ Assignment   │
  └──────────────┘                      └──────────────┘
        │                                     │
        │         Planning doesn't            │
        │         know about delays           │
        │                                     │
        └─────────→ STOCKOUTS ←──────────────┘
                   EXCESS INVENTORY
                   MISSED DELIVERIES
```

## 1.3 Real-World Consequences

When planning and execution are disconnected:

| Problem | Cause | Cost |
|---------|-------|------|
| **Stockouts** | Planning didn't know shipment was delayed | Lost sales, unhappy customers |
| **Excess Inventory** | Planning ordered too much (no visibility into what's actually arriving) | Warehousing costs, waste |
| **Late Deliveries** | Production couldn't start because raw material arrived late | Penalties, reputation damage |
| **Rush Orders** | Emergency orders placed at premium prices | Higher costs |
| **Poor Utilization** | Plants sit idle waiting for material | Wasted capacity |

## 1.4 What a Solution Looks Like

A modern SCM platform needs to:

1. **Connect planning and execution** — One system, not two
2. **Create a feedback loop** — Execution status flows back to planning automatically
3. **Detect risks early** — Flag delays before they become crises
4. **Recommend actions** — Don't just show data, suggest what to do
5. **Close the loop** — Feed risks back into the next planning cycle

This is exactly what FlowSync does.

---

# PART 2: THE SOLUTION

## 2.1 FlowSync Concept

FlowSync is named after the idea of **continuous flow and synchronization** between planning and execution.

The core principle: **Every plan becomes a shipment, and every shipment reshapes the plan.**

```
FLOWSYNC (The Fix):

  P2 (PLANNING)                              E2 (EXECUTION)
  ┌──────────────┐                          ┌──────────────┐
  │ S&OP Cycle   │                          │ Shipments    │
  │      ↓       │                          │      ↓       │
  │ Demand +     │    procurement_plan_id   │ Truck        │
  │ Production + │ ──────────────────────→  │ Tracking     │
  │ Inventory    │    (creates shipment)    │      ↓       │
  │      ↓       │                          │ Yard/Dock    │
  │ Procurement  │                          │ Assignment   │
  │ Plan         │                          │      ↓       │
  │      ↑       │    E2 STATUS / ETA       │ Alert        │
  │ Risk Monitor │ ←──────────────────────  │ Center       │
  │      ↓       │    (feeds back to P2)    └──────────────┘
  │ Recommend-   │
  │ ations       │
  │      ↓       │
  │ Next Cycle   │
  │ (Replan)     │
  └──────────────┘

        THE LOOP NEVER ENDS — each replan is informed by execution reality
```

## 2.2 The Continuous Loop

The loop has 7 steps:

1. **S&OP Cycle** — Planning team selects a planning period
2. **Gap Analysis** — System calculates: what do we need vs. what do we have?
3. **Procurement Plans** — Orders placed with suppliers
4. **Execution** — Shipments created, trucks tracked, docks assigned
5. **Risk Detection** — System monitors execution for delays and issues
6. **Recommendations** — AI + rules suggest corrective actions
7. **Replan** — Next S&OP cycle incorporates execution feedback

## 2.3 Tech Stack Choices (and Why)

We made deliberate choices for each layer:

| Decision | Choice | Why |
|----------|--------|-----|
| Frontend Framework | React 19 | Latest features, component-based UI |
| Build Tool | Vite 8 | Fastest build tool, excellent DX |
| Styling | Tailwind CSS v4 | Utility-first, rapid prototyping |
| Routing | React Router 7 | Industry standard, nested routes |
| Charts | Recharts | Declarative, composable, React-native |
| Maps | Leaflet + react-leaflet | Free, open-source, no API key needed |
| Animations | Framer Motion | Smooth, declarative animations |
| UI Components | shadcn/ui | Copy-paste components, fully customizable |
| Backend Framework | Express 5 | Async error handling, mature ecosystem |
| Database | PostgreSQL (Neon) | Relational data, ACID, serverless option |
| Database Driver | pg (node-postgres) | Raw SQL for full control, no ORM overhead |
| Validation | Joi | Schema-based validation, readable |
| Auth | Clerk | Managed auth, role-based access, easy setup |
| AI | OpenAI GPT-4.1-nano | Fast, cheap, structured output |

## 2.4 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOWSYNC                                  │
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Frontend   │     │   Backend    │     │   Database   │    │
│  │   React 19   │────→│   Express 5  │────→│  PostgreSQL  │    │
│  │   Vite 8     │ API │   Node.js    │ SQL │  (Neon)      │    │
│  │   Tailwind   │     │   Joi        │     │  16 tables   │    │
│  └──────┬───────┘     └──────┬───────┘     └──────────────┘    │
│         │                    │                                   │
│         │ Clerk              │ OpenAI                            │
│         ↓                    ↓                                   │
│  ┌──────────────┐     ┌──────────────┐                          │
│  │   Clerk      │     │   OpenAI     │                          │
│  │   (Auth)     │     │   GPT-4.1    │                          │
│  └──────────────┘     │   nano       │                          │
│                       └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 3: THE DATA FOUNDATION

## 3.1 Getting Synthetic Data

We needed realistic supply chain data to build and demo the system. We created two Excel datasets:

### P2 Dataset (`P2_cleaned_validated_dataset.xlsx`)

This file contains 13 sheets of planning data:

| Sheet | Rows | What It Contains |
|-------|------|-----------------|
| suppliers | ~10 | Fabric suppliers with codes and names |
| plants | ~5 | Manufacturing plants with capacity and location |
| fabrics | ~20 | Raw materials with MOQ, lead time, cost per meter |
| products | ~50 | Finished goods with SKU, category, selling/production price |
| demand_forecasts | ~500 | Weekly demand forecasts per product |
| sell_through | ~500 | Weekly sell-through data per product |
| inventory | ~50 | Current stock levels per product |
| production_capacity | ~500 | Weekly production capacity per plant per product |
| logistics_routes | ~30 | DC-to-store routes with lead times |
| markdown_history | ~200 | Historical markdown decisions per product |
| sop_cycles | ~5 | S&OP planning cycles with status |
| sop_plan_lines | ~200 | Generated S&OP plan lines per cycle |
| procurement_plans | ~100 | Procurement orders with fabric, supplier, risk |

### E2 Dataset (`E2_Prototype_Final_Dataset_v2.xlsx`)

This file contains 6 sheets of execution data:

| Sheet | Rows | What It Contains |
|-------|------|-----------------|
| Yards | ~5 | Distribution yards with capacity |
| Docks | ~20 | Loading docks with status (available/occupied/unavailable) |
| Shipments | ~50 | Shipment records with origin, destination, status |
| Trucks | ~50 | Truck fleet with tracking numbers, GPS coordinates, ETA |
| Dock Assignments | ~30 | Current truck-to-dock assignments |
| Truck Alerts | ~20 | Operational alerts (delays, yard full, dock unavailable) |

## 3.2 Database Schema Design (16 Tables, 2 Schemas)

We designed the database with **two schemas** to mirror the P2/E2 separation:

### P2 Schema (Planning) — 12 Tables

```
p2.suppliers ─────────────────────────────────────────┐
    │                                                   │
    ▼                                                   │
p2.fabrics ──────────────────────────────────────────┐ │
    │                                                 │ │
    │    p2.plants ──────────────────────────────┐    │ │
    │        │                                   │    │ │
    │        ▼                                   ▼    │ │
    │    p2.products ◄───────────────────────────┘    │ │
    │        │                                        │ │
    │        ├──→ p2.demand_forecasts                 │ │
    │        ├──→ p2.sell_through                     │ │
    │        ├──→ p2.inventory                        │ │
    │        ├──→ p2.production_capacity              │ │
    │        ├──→ p2.markdown_history                 │ │
    │        │                                        │ │
    │        ▼                                        │ │
    │    p2.sop_plan_lines                            │ │
    │        │                                        │ │
    │        ▼                                        │ │
    │    p2.sop_cycles                                │ │
    │        │                                        │ │
    │        ▼                                        │ │
    │    p2.procurement_plans ────────────────────────┘ │
    │        │                                          │
    │        ▼                                          │
    │    p2.sop_recommendations                         │
    │                                                   │
    └──→ p2.logistics_routes                           │
```

**Key tables explained:**

- **`p2.sop_cycles`** — A planning period (e.g., "SOP-2026-NOV"). Has a status: DRAFT → REVIEW → APPROVED → CLOSED
- **`p2.sop_plan_lines`** — For each product in a cycle: what's the demand, inventory, capacity, and the gap analysis
- **`p2.procurement_plans`** — The output of planning: "Order X meters of fabric Y from supplier Z"
- **`p2.sop_recommendations`** — AI/rule-generated suggestions: "This product is at risk, do this..."

### E2 Schema (Execution) — 4 Tables

```
e2.yards
    │
    ▼
e2.docks ◄── e2.dock_assignments
                  │
                  ▼
              e2.trucks ──→ e2.shipments
                                │
                                │ procurement_plan_id (FK)
                                │
                                ▼
                          p2.procurement_plans (P2 schema)
```

**Key tables explained:**

- **`e2.shipments`** — A physical shipment. Has a `procurement_plan_id` that links it back to the P2 plan that created it
- **`e2.trucks`** — A truck carrying goods. Has GPS coordinates (latitude, longitude), current ETA, status
- **`e2.docks`** — A loading dock at a yard. Can be AVAILABLE, OCCUPIED, or UNAVAILABLE
- **`e2.dock_assignments`** — Which truck is assigned to which dock

## 3.3 Seed Scripts

We built two seed scripts to load data from Excel into PostgreSQL:

### P2 Seed Script (`seedP2.js`)

```javascript
// Reads P2_cleaned_validated_dataset.xlsx
// Seeds 13 tables in order (respecting foreign keys):
// 1. suppliers → 2. plants → 3. fabrics → 4. products
// → 5. demand_forecasts → 6. sell_through → 7. inventory
// → 8. production_capacity → 9. logistics_routes
// → 10. markdown_history → 11. sop_cycles
// → 12. sop_plan_lines → 13. procurement_plans

// Usage: npm run seed:p2
```

The script:
1. Reads each sheet from the Excel file using the `xlsx` library
2. For each row, constructs an INSERT query
3. Executes against the Neon PostgreSQL database
4. Logs progress: "Seeded X rows into table_name"

### E2 Seed Script (`seedE2.js`)

```javascript
// Reads E2_Prototype_Final_Dataset_v2.xlsx
// Seeds 6 tables in order:
// 1. yards → 2. docks → 3. shipments
// → 4. trucks → 5. dock_assignments → 6. truck_alerts

// Usage: npm run seed:e2
```

## 3.4 The Critical Link: procurement_plan_id

This is the **single most important design decision** in the entire project.

In `e2.shipments`, there's a column called `procurement_plan_id`. This is a **foreign key** that references `p2.procurement_plans.id`.

```
p2.procurement_plans                    e2.shipments
┌──────────────────────┐               ┌──────────────────────┐
│ id: 42               │◄──────────────│ procurement_plan_id: 42│
│ product_id: 7        │               │ shipment_reference:    │
│ fabric_id: 3         │               │   "SHP-001"           │
│ required_fabric_m:   │               │ status: IN_TRANSIT    │
│   5000               │               │ planned_arrival:      │
│ risk_level: HIGH     │               │   "2026-11-15"        │
└──────────────────────┘               └──────────────────────┘

One procurement plan → Many shipments (one-to-many relationship)
```

**Why this matters:**
- From a procurement plan, you can see ALL its shipments (P2 → E2)
- From a shipment, you can see which plan created it (E2 → P2)
- When a shipment is delayed, P2 knows which plan is affected
- When generating recommendations, the system can check execution status

---

# PART 4: BUILDING THE BACKEND (Deep Dive)

## 4.1 Initial Setup

### Step 1: Project Scaffold

The first commit (`2a36791 Initial project setup`) created the basic structure:

```
backend/
├── package.json          # Express 5, pg, Joi, dotenv
├── server.js             # Entry point: imports app.js, listens on PORT
└── src/
    ├── app.js            # Express app: CORS, middleware, routes
    └── ...               # (modules added later)
```

### Step 2: Database Connection

Commit `00c2e66 DB connection completed` established the PostgreSQL connection:

```javascript
// src/common/config/database.js
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Neon
});
export default pool;
```

**Challenge:** Neon requires SSL. Without `ssl: { rejectUnauthorized: false }`, connections fail with "self-signed certificate" errors.

### Step 3: Modular Folder Structure

Commit `49c910b` created the 4-layer architecture:

```
src/
├── common/
│   ├── config/         # database.js, env.js
│   ├── dto/            # base.dto.js (Joi validation base class)
│   ├── middleware/      # auth, error, not-found, validate
│   └── utils/          # api-error.js, api-response.js
├── module/
│   ├── p2/             # Planning modules (added later)
│   ├── e2/             # Execution modules (added later)
│   └── ai/             # AI copilot (added later)
└── rules/              # Business rule engines (added later)
```

### Step 4: Separating app.js and server.js

Commit `18c37b2` separated concerns:

- **`app.js`** — Express app configuration (CORS, middleware, routes). Exported for testing.
- **`server.js`** — Entry point. Imports app.js, starts listening on PORT.

This is important because it allows testing the app without starting the server.

## 4.2 Common Layer (middleware, utils, DTOs)

### Middleware Stack

```
Request → CORS → JSON Parser → Route Handler
                                      ↓
                              Validation (Joi)
                                      ↓
                              Service (Business Logic)
                                      ↓
                              Response (ApiResponse)
                                      ↓
                              Error Handler (if anything throws)
```

**Error Middleware** (`error.middleware.js`):
```javascript
// Catches ALL errors thrown in route handlers
// Returns consistent JSON: { success: false, message: "...", error: "..." }
// Logs error to console for debugging
```

**Not Found Middleware** (`not-found.middleware.js`):
```javascript
// Catches requests to undefined routes
// Returns 404: { success: false, message: "Route not found" }
```

**Validation Middleware** (`validate.middleware.js`):
```javascript
// Takes a Joi schema
// Validates req.body, req.params, or req.query against the schema
// Returns 400 with validation errors if invalid
// Calls next() if valid
```

**Auth Middleware** (`auth.middleware.js`):
```javascript
// TEMPORARY STUB — sets req.user = null
// Real Clerk verification planned for future
// Comment in source: "Real Neon Auth verification will be added
// when the frontend authentication flow is connected"
```

### API Response Utility

```javascript
// api-response.js — Consistent response format
ApiResponse.ok(data)           // 200: { success: true, data: [...] }
ApiResponse.created(data)      // 201: { success: true, data: {...} }
ApiResponse.list(data)         // 200: { success: true, data: [...], count: N }
ApiResponse.noContent()        // 204: no body
ApiResponse.error(message)     // Uses ApiError class
```

### ApiError Utility

```javascript
// api-error.js — Custom error class with HTTP status codes
ApiError.badRequest(msg)       // 400
ApiError.unauthorized(msg)     // 401
ApiError.forbidden(msg)        // 403
ApiError.notFound(msg)         // 404
ApiError.conflict(msg)         // 409
ApiError.internal(msg)         // 500
```

## 4.3 P2 Module — Every API & Query

### Demand API

**Route:** `GET /api/demand`

**Service** (`demand.service.js`):
```javascript
// 1. Build SQL query dynamically based on filters
//    - If sku param provided: WHERE p.sku_code ILIKE $1
//    - If week param provided: WHERE df.week_number = $2
// 2. JOIN p2.demand_forecasts → p2.products
// 3. SELECT: product_id, sku_code, name, week_number, forecast_demand_units
// 4. ORDER BY week_number, sku_code
```

**Summary** (`GET /api/demand/summary`):
```sql
SELECT COUNT(DISTINCT product_id) AS product_count,
       SUM(forecast_demand_units) AS total_forecast,
       AVG(forecast_demand_units) AS average_forecast
FROM p2.demand_forecasts
```

**Trend** (`GET /api/demand/trend`):
```sql
SELECT week_number,
       SUM(forecast_demand_units) AS total_demand
FROM p2.demand_forecasts
GROUP BY week_number
ORDER BY week_number
```

### Inventory API

**Route:** `GET /api/inventory`

**Query:**
```sql
SELECT i.product_id, p.sku_code, p.name,
       i.current_inventory_units, i.updated_at
FROM p2.inventory i
JOIN p2.products p ON p.id = i.product_id
WHERE p.sku_code ILIKE $1  -- optional filter
ORDER BY p.sku_code
```

**Risk** (`GET /api/inventory/risk`):
```sql
SELECT i.product_id, p.sku_code, p.name,
       i.current_inventory_units,
       SUM(df.forecast_demand_units) AS total_forecast_demand
FROM p2.inventory i
JOIN p2.products p ON p.id = i.product_id
JOIN p2.demand_forecasts df ON df.product_id = i.product_id
GROUP BY i.product_id, p.sku_code, p.name, i.current_inventory_units
```

**Frontend classification:**
```
if current_inventory < total_forecast × 0.5 → SHORTAGE (red)
if current_inventory > total_forecast × 1.5 → EXCESS (yellow)
else → HEALTHY (green)
```

### Production API

**Route:** `GET /api/production`

**Query:**
```sql
SELECT pc.product_id, p.sku_code, p.name,
       pl.plant_code, pl.name AS plant_name,
       pc.week_number, pc.capacity_units
FROM p2.production_capacity pc
JOIN p2.products p ON p.id = pc.product_id
JOIN p2.plants pl ON pl.id = pc.plant_id
WHERE pl.plant_code ILIKE $1  -- optional filter
ORDER BY pc.week_number, p.sku_code
```

**Capacity** (`GET /api/production/capacity`):
```sql
SELECT pc.product_id, p.sku_code, p.name,
       pl.plant_code, pl.name AS plant_name,
       pc.week_number, pc.capacity_units,
       pl.total_capacity_units AS plant_total_capacity
FROM p2.production_capacity pc
JOIN p2.products p ON p.id = pc.product_id
JOIN p2.plants pl ON pl.id = pc.plant_id
ORDER BY pc.week_number, p.sku_code
```

### Procurement API

**Route:** `GET /api/procurement`

**Query (with multiple filters):**
```sql
SELECT pp.id, pp.product_id, p.sku_code, p.name,
       f.fabric_code, f.name AS fabric_name,
       s.supplier_code, s.name AS supplier_name,
       pp.planning_week, pp.required_fabric_m,
       pp.moq_meters, pp.recommended_order_qty_m,
       pp.lead_time_weeks, pp.risk_level, pp.status,
       pp.required_by_date, pp.sop_cycle_id
FROM p2.procurement_plans pp
JOIN p2.products p ON p.id = pp.product_id
JOIN p2.fabrics f ON f.id = pp.fabric_id
JOIN p2.suppliers s ON s.id = f.supplier_id
WHERE p.sku_code ILIKE $1           -- optional
  AND pp.planning_week = $2         -- optional
  AND UPPER(pp.risk_level) = $3     -- optional
  AND UPPER(pp.status) = $4         -- optional
  AND pp.sop_cycle_id = $5          -- optional
ORDER BY pp.planning_week, p.sku_code
```

**Plan Shipments** (`GET /api/procurement/plans/:planId/shipments`):
```sql
-- This is the KEY integration query
-- Returns procurement plan + all linked E2 shipments + truck data

SELECT pp.*, p.sku_code, p.name, f.name AS fabric_name,
       s.name AS supplier_name,
       json_agg(json_build_object(
         'id', sh.id,
         'shipment_reference', sh.shipment_reference,
         'status', sh.status,
         'planned_arrival', sh.planned_arrival,
         'planned_quantity_m', sh.planned_quantity_m,
         'received_quantity_m', sh.received_quantity_m
       )) AS shipments
FROM p2.procurement_plans pp
JOIN p2.products p ON p.id = pp.product_id
JOIN p2.fabrics f ON f.id = pp.fabric_id
JOIN p2.suppliers s ON s.id = f.supplier_id
LEFT JOIN e2.shipments sh ON sh.procurement_plan_id = pp.id
WHERE pp.id = $1
GROUP BY pp.id, p.sku_code, p.name, f.name, s.name
```

### Markdown API

**Route:** `GET /api/markdown`

**Query:**
```sql
SELECT mh.product_id, p.sku_code, p.name,
       mh.week_number, mh.markdown_pct, mh.reason
FROM p2.markdown_history mh
JOIN p2.products p ON p.id = mh.product_id
WHERE p.sku_code ILIKE $1  -- optional
ORDER BY mh.week_number, p.sku_code
```

### S&OP API

**Get Cycles** (`GET /api/sop/cycles`):
```sql
SELECT * FROM p2.sop_cycles ORDER BY start_date DESC
```

**Create Cycle** (`POST /api/sop/cycles`):
```sql
INSERT INTO p2.sop_cycles (cycle_name, start_date, end_date, status)
VALUES ($1, $2, $3, 'DRAFT')
RETURNING *
```

**Update Status** (`PATCH /api/sop/cycles/:cycleId/status`):
```sql
UPDATE p2.sop_cycles SET status = $1, updated_at = NOW()
WHERE id = $2 RETURNING *
```

**Generate Plan** (`POST /api/sop/cycles/:cycleId/plan/generate`):

This is where the **business rule engine** runs. For each product:

```javascript
// sopRules.js → calculateSopPlan()
const requiredProduction = Math.max(0, forecastDemand - openingInventory);
const plannedProduction = Math.min(requiredProduction, productionCapacity);
const projectedEndingInventory = openingInventory + plannedProduction - forecastDemand;
const supplyGap = Math.max(0, -projectedEndingInventory);
const excessInventory = Math.max(0, projectedEndingInventory);

let status = 'BALANCED';
if (supplyGap > 0) status = 'SHORTAGE';
else if (excessInventory > 0) status = 'EXCESS';

// INSERT into p2.sop_plan_lines
```

### Overview API

**P2 Overview** (`GET /api/p2/overview`):

Returns aggregated metrics for the dashboard:
```sql
-- Product count
SELECT COUNT(*) AS product_count FROM p2.products

-- Total demand
SELECT SUM(forecast_demand_units) AS total_demand
FROM p2.demand_forecasts

-- S&OP health (percentage of balanced products)
SELECT CASE
  WHEN product_count = 0 THEN 0
  ELSE ROUND((balanced_products::numeric / product_count) * 100, 2)
END AS sop_health
FROM (
  SELECT COUNT(*) AS product_count,
         COUNT(*) FILTER (WHERE status = 'BALANCED') AS balanced_products
  FROM p2.sop_plan_lines
) sub
```

## 4.4 E2 Module — Every API & Query

### Truck API

**Get All Trucks** (`GET /api/e2/truck`):
```sql
SELECT t.*, sh.shipment_reference
FROM e2.trucks t
LEFT JOIN e2.shipments sh ON sh.id = t.shipment_id
ORDER BY t.trailer_id
```

**Get Truck Locations** (`GET /api/e2/truck/locations`):
```sql
SELECT t.trailer_id, t.current_location, t.latitude, t.longitude,
       t.status, t.priority, t.current_eta,
       sh.shipment_reference
FROM e2.trucks t
LEFT JOIN e2.shipments sh ON sh.id = t.shipment_id
WHERE t.latitude IS NOT NULL AND t.longitude IS NOT NULL
```

**Get Trucks by Status** (`GET /api/e2/truck/status/:status`):
```sql
SELECT t.*, sh.shipment_reference
FROM e2.trucks t
LEFT JOIN e2.shipments sh ON sh.id = t.shipment_id
WHERE UPPER(t.status) = UPPER($1)
ORDER BY t.trailer_id
```

### Shipment API

**Get All Shipments** (`GET /api/e2/shipment`):
```sql
SELECT sh.*, pp.product_id, p.sku_code
FROM e2.shipments sh
LEFT JOIN p2.procurement_plans pp ON pp.id = sh.procurement_plan_id
LEFT JOIN p2.products p ON p.id = pp.product_id
ORDER BY sh.shipment_reference
```

**Get Shipments by Procurement Plan** (`GET /api/e2/shipment/procurement/:procurementPlanId`):
```sql
SELECT sh.*, pp.product_id, p.sku_code
FROM e2.shipments sh
JOIN p2.procurement_plans pp ON pp.id = sh.procurement_plan_id
LEFT JOIN p2.products p ON p.id = pp.product_id
WHERE sh.procurement_plan_id = $1
ORDER BY sh.shipment_reference
```

### Dock API

**Get All Docks** (`GET /api/e2/dock`):
```sql
SELECT d.*, y.name AS yard_name, y.capacity AS yard_capacity
FROM e2.docks d
JOIN e2.yards y ON y.name = d.yard_name
ORDER BY d.dock_code
```

**Auto-Assign Docks** (`POST /api/e2/dock/assign`):

This is a **transactional operation** with row-level locking:

```sql
BEGIN;

-- Step 1: Find eligible trucks (ARRIVED, no existing assignment)
-- Lock rows to prevent concurrent assignment
SELECT t.trailer_id, t.current_yard_name, t.priority
FROM e2.trucks t
WHERE t.status = 'ARRIVED'
  AND t.current_yard_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM e2.dock_assignments da WHERE da.trailer_id = t.trailer_id
  )
ORDER BY CASE t.priority
  WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END
FOR UPDATE OF t;

-- Step 2: For each truck, find AVAILABLE dock in its yard
-- Lock the dock row
SELECT d.dock_code, d.yard_name
FROM e2.docks d
WHERE d.yard_name = $1 AND d.status = 'AVAILABLE'
ORDER BY d.dock_code
LIMIT 1
FOR UPDATE;

-- Step 3: If dock found, create assignment and update dock status
INSERT INTO e2.dock_assignments (trailer_id, dock_code, yard_name)
VALUES ($1, $2, $3);

UPDATE e2.docks SET status = 'OCCUPIED' WHERE dock_code = $2;

COMMIT;
-- On error: ROLLBACK (no partial assignments)
```

**Why transactions matter:** Without them, two simultaneous requests could assign the same dock to two different trucks. The `FOR UPDATE` lock prevents this.

### Yard API

**Get All Yards** (`GET /api/e2/yard`):
```sql
SELECT y.*,
       COUNT(d.id) AS total_docks,
       COUNT(d.id) FILTER (WHERE d.status = 'AVAILABLE') AS available_docks
FROM e2.yards y
LEFT JOIN e2.docks d ON d.yard_name = y.name
GROUP BY y.id
ORDER BY y.name
```

### Alerts API

**Get Delayed Trucks** (`GET /api/e2/alerts`):
```sql
SELECT t.trailer_id, t.tracking_number, t.priority,
       t.current_location, t.current_eta,
       sh.shipment_reference, sh.planned_arrival
FROM e2.trucks t
LEFT JOIN e2.shipments sh ON sh.id = t.shipment_id
WHERE t.status = 'DELAYED'
ORDER BY CASE t.priority
  WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END
```

**Check Dock Availability** (`GET /api/e2/alerts/dock/:yard_name`):
```sql
SELECT y.name AS yard_name,
       COUNT(d.id) AS total_docks,
       COUNT(d.id) FILTER (WHERE d.status = 'AVAILABLE') AS available_docks,
       COUNT(d.id) FILTER (WHERE d.status = 'OCCUPIED') AS occupied_docks,
       COUNT(d.id) FILTER (WHERE d.status = 'UNAVAILABLE') AS unavailable_docks
FROM e2.yards y
LEFT JOIN e2.docks d ON d.yard_name = y.name
WHERE y.name = $1
GROUP BY y.name
```

**Check Yard Capacity** (`GET /api/e2/alerts/yard/:yard_name`):
```sql
SELECT name, capacity, number_of_trucks,
       CASE WHEN number_of_trucks >= capacity THEN true ELSE false END AS is_full
FROM e2.yards
WHERE name = $1
```

## 4.5 Business Rule Engines (6 Files)

All rule engines live in `backend/src/rules/`:

### 1. S&OP Calculation (`sopRules.js`)

**Function:** `calculateSopPlan(products, cycleId)`

```javascript
// For EACH product in the cycle:
const requiredProduction = Math.max(0, forecastDemand - openingInventory);
const plannedProduction = Math.min(requiredProduction, productionCapacity);
const projectedEndingInventory = openingInventory + plannedProduction - forecastDemand;
const supplyGap = Math.max(0, -projectedEndingInventory);
const excessInventory = Math.max(0, projectedEndingInventory);

let status = 'BALANCED';
if (supplyGap > 0) status = 'SHORTAGE';
else if (excessInventory > 0) status = 'EXCESS';

// INSERT into p2.sop_plan_lines
```

**Function:** `generateSopRecommendations(planLines, cycleId)`

Calls all 5 risk engines below and aggregates results into `p2.sop_recommendations`.

### 2. Inventory Risk (`inventoryRisk.js`)

```javascript
function evaluateInventoryRisk(openingInventory, forecastDemand, projectedEndingInventory) {
  if (projectedEndingInventory < 0) {
    return { type: 'INVENTORY_SHORTAGE', severity: 'HIGH',
             message: `Stock will run out. Shortage of ${Math.abs(projectedEndingInventory)} units.` };
  }
  if (projectedEndingInventory > forecastDemand * 0.5) {
    return { type: 'EXCESS_INVENTORY', severity: 'MEDIUM',
             message: `Excess stock of ${projectedEndingInventory} units. Consider markdown.` };
  }
  return null; // Healthy
}
```

### 3. Production Risk (`productionRisk.js`)

```javascript
function evaluateProductionRisk(requiredProduction, productionCapacity, plannedProduction) {
  if (requiredProduction > productionCapacity) {
    return { type: 'CAPACITY_SHORTAGE', severity: 'HIGH',
             message: `Need ${requiredProduction} units but capacity is only ${productionCapacity}.` };
  }
  const utilization = (plannedProduction / productionCapacity) * 100;
  if (utilization >= 90) {
    return { type: 'HIGH_CAPACITY_UTILIZATION', severity: 'MEDIUM',
             message: `Plant at ${utilization.toFixed(1)}% utilization. Risk of bottleneck.` };
  }
  return null;
}
```

### 4. Procurement Risk (`procurementRisk.js`)

```javascript
function evaluateProcurementRisk(requiredFabric, recommendedOrderQty, leadTimeWeeks) {
  if (recommendedOrderQty < requiredFabric) {
    return { type: 'PROCUREMENT_SHORTAGE', severity: 'HIGH',
             message: `Ordering ${recommendedOrderQty}m but need ${requiredFabric}m.` };
  }
  if (leadTimeWeeks >= 4) {
    return { type: 'LONG_LEAD_TIME', severity: 'MEDIUM',
             message: `Lead time is ${leadTimeWeeks} weeks. Order early.` };
  }
  return null;
}
```

### 5. Markdown Rule (`markdownRule.js`)

```javascript
function evaluateMarkdownOpportunity(projectedEndingInventory, forecastDemand) {
  if (projectedEndingInventory > forecastDemand * 0.5) {
    return { type: 'MARKDOWN_OPPORTUNITY', severity: 'MEDIUM',
             message: `Excess of ${projectedEndingInventory} units. Recommend ${markdownPct}% discount.` };
  }
  return null;
}
```

### 6. Shipment Delay Rule (`shipmentDelayRule.js`)

```javascript
function evaluateShipmentDelayRisk(plannedArrival, currentEta, shipmentStatus, truckStatus,
                                    plannedQuantity, receivedQuantity) {
  // Skip if already arrived or fully received
  if (shipmentStatus === 'ARRIVED' || truckStatus === 'ARRIVED') return null;
  if (receivedQuantity >= plannedQuantity) return null;
  if (!plannedArrival || !currentEta) return null;

  const plannedDate = new Date(plannedArrival);
  const etaDate = new Date(currentEta);
  if (etaDate <= plannedDate) return null; // On time

  const delayDays = Math.ceil((etaDate - plannedDate) / (1000 * 60 * 60 * 24));
  const severity = delayDays >= 3 ? 'HIGH' : 'MEDIUM';

  return { type: 'SHIPMENT_DELAY', severity,
           message: `Shipment arriving ${delayDays} day(s) late. May affect production.` };
}
```

## 4.6 AI Copilot Module

**Location:** `backend/src/module/ai/`

**Architecture:**
```
ai.routes.js → ai.controller.js → ai.service.js → OpenAI API
```

**Endpoint:** `POST /api/ai/insight`

**Request body:**
```json
{
  "type": "risk_analysis | plan_analysis | cycle_summary",
  "data": { ... }  // Context data specific to the type
}
```

**Service** (`ai.service.js`):
```javascript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateInsight(type, data) {
  const prompt = buildPrompt(type, data);  // Type-specific prompt

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: 'You are a supply chain analyst...' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });

  return formatInsight(response.choices[0].message.content);
}
```

**Output format** (structured by prompt engineering):
```
SITUATION: [What's happening]
BUSINESS IMPACT: [What it means for the business]
RECOMMENDED ACTIONS: [What to do about it]
PRIORITY: [HIGH/MEDIUM/LOW]
```

## 4.7 User Management (Clerk API)

**File:** `backend/src/module/e2/users/users.service.js`

The backend calls Clerk's API directly (not through the SDK) using `https` module:

```javascript
// List users
GET https://api.clerk.com/v1/users
Headers: { Authorization: `Bearer ${CLERK_SECRET}` }

// Update user role
PATCH https://api.clerk.com/v1/users/:userId/metadata
Body: { public_metadata: { role: "manager" | "user" } }
```

**Challenge:** Initially used `fetch` which failed on Render (Node.js 18 without native fetch). Switched to built-in `https` module.

## 4.8 API Response Format & Error Handling

Every API response follows this format:

```json
// Success
{
  "success": true,
  "data": [...],
  "count": 42
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "error": "sku is required"
}
```

---

# PART 5: BUILDING THE FRONTEND (Deep Dive)

## 5.1 Scaffold & Config

### Vite Setup

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Tailwind CSS v4 Configuration

Tailwind v4 uses a CSS-first configuration approach:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  /* ... custom design tokens */
}
```

### shadcn/ui Components

We installed these shadcn/ui components:
- **Button** — Variants: default, destructive, outline, secondary, ghost, link
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Badge** — Variants: default, secondary, destructive, outline
- **Select** — Radix-based dropdown (Select, SelectTrigger, SelectValue, SelectContent, SelectItem)

### Axios Client

```javascript
// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## 5.2 Core Layer (Contexts, Routing)

### Four React Contexts

**1. AuthContext** (`AuthContext.jsx`):
```javascript
// Wraps Clerk's useUser() hook
// Provides: user, isManager, role, logout
// isManager = user?.publicMetadata?.role === "manager"
```

**2. CycleContext** (`CycleContext.jsx`):
```javascript
// Manages S&OP cycle selection across all P2 pages
// Fetches cycles on mount: GET /api/sop/cycles
// Provides: cycles, selectedCycleId, selectedCycle, setSelectedCycleId, loading
// Selected cycle is used by ALL P2 pages to filter data
```

**3. SidebarContext** (`SidebarContext.jsx`):
```javascript
// Manages sidebar open/close state for mobile
// Provides: open, toggle, close
```

**4. ToastContext** (`ToastContext.jsx`):
```javascript
// Placeholder for toast notifications
// Currently unused, reserved for future
```

### App Hierarchy

```jsx
// App.jsx
<ClerkProvider>
  <AuthProvider>
    <ToastProvider>
      <CycleProvider>
        <SidebarProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SidebarProvider>
      </CycleProvider>
    </ToastProvider>
  </AuthProvider>
</ClerkProvider>
```

### Route Structure

```jsx
// AppRoutes.jsx
<SignedIn>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/track" element={<TrackPage />} />

  {/* Protected routes (Manager only) */}
  <Route element={<AuthGate><ManagerGuard><MainLayout /></ManagerGuard></AuthGate>}>
    <Route path="/dashboard" element={<Dashboard />} />

    {/* P2 Routes */}
    <Route path="/p2/overview" element={<P2Overview />} />
    <Route path="/p2/sop" element={<SopCycles />} />
    <Route path="/p2/demand" element={<DemandPlanning />} />
    <Route path="/p2/production" element={<ProductionScheduling />} />
    <Route path="/p2/inventory" element={<InventoryPage />} />
    <Route path="/p2/procurement" element={<ProcurementPlans />} />
    <Route path="/p2/procurement/:planId" element={<ProcurementPlanDetail />} />
    <Route path="/p2/procurement/:planId/execution" element={<ProcurementExecution />} />
    <Route path="/p2/markdown" element={<MarkdownDecisionCenter />} />
    <Route path="/p2/risk" element={<RiskMonitor />} />
    <Route path="/p2/recommendations" element={<Recommendations />} />

    {/* E2 Routes */}
    <Route path="/e2/overview" element={<E2Overview />} />
    <Route path="/e2/shipments" element={<Shipments />} />
    <Route path="/e2/shipments/:reference" element={<ShipmentDetail />} />
    <Route path="/e2/trucks" element={<TruckTracker />} />
    <Route path="/e2/docks" element={<Docks />} />

    {/* Other */}
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/users" element={<Users />} />
  </Route>
</SignedIn>
```

## 5.3 Component Library

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| MainLayout | `MainLayout.jsx` | Navbar + Sidebar + scrollable content area |
| Navbar | `Navbar.jsx` | Top bar with logo, search, user avatar |
| Sidebar | `Sidebar.jsx` | Collapsible nav with P2/E2 sections, hamburger on mobile |
| PageWrapper | `PageWrapper.jsx` | Consistent page layout (title, subtitle, content) |

### UI Components

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| Badge | Status labels | Color variants: default, secondary, destructive, outline |
| Button | Actions | Variants: default, destructive, outline, ghost, link |
| Card | Content containers | Card, CardHeader, CardTitle, CardContent, CardFooter |
| Select | Dropdowns | Radix-based, keyboard accessible |
| StatusBadge | Color-coded statuses | Maps status strings to colors (green/red/yellow) |
| KPICard | Key metric display | Icon + value + label + trend |
| DataTable | Tabular data | Sortable columns, loading state |
| EmptyState | No-data placeholder | Icon + message + action button |
| LoadingSpinner | Loading indicator | Centered spinner |
| SpotlightCard | Aceternity-style hover | Spotlight follows cursor |
| AnimatedCard | Framer Motion card | Fade-in + slide-up animation |
| FloatingCard | Floating effect | Subtle shadow + hover lift |
| GradientCard | Gradient background | Dynamic gradient based on props |
| AIInsightCard | AI output display | Structured SITUATION/IMPACT/ACTIONS/PRIORITY |

### Chart Components

| Component | Library | Use Case |
|-----------|---------|----------|
| DonutChart | Recharts | Proportional data (status distribution) |
| GroupedBarChart | Recharts | Comparison data (demand vs capacity) |
| MultiLineChart | Recharts | Trend data (demand over weeks) |
| RadialGaugeChart | Recharts | Progress/metrics (utilization %) |

## 5.4 E2 Features (Trucks, Shipments, Docks, Yard, Alerts)

### Truck Tracker

**Page:** `pages/e2/TruckTracker.jsx`

**Features:**
- Leaflet map showing all truck positions
- Truck table with status, priority, load type, ETA
- Click a truck → map zooms to it (level 14)
- IN_TRANSIT trucks have **simulated GPS movement**

**Truck Simulation** (`hooks/useTruckSimulation.js`):
```javascript
// Moves IN_TRANSIT trucks toward warehouse (22.5726, 88.3639)
// Every 300ms:
//   dLat = warehouse.lat - current.lat
//   dLng = warehouse.lng - current.lng
//   dist = sqrt(dLat² + dLng²)
//   step = 0.00008
//   new_lat = current.lat + (dLat / dist) * step
//   new_lng = current.lng + (dLng / dist) * step
// If distance < 0.0005 → snap to warehouse
```

**Why client-side simulation?** We don't have real GPS data from trucks. The simulation makes the demo feel real — trucks visibly move across the map.

### Shipments

**Page:** `pages/e2/Shipments.jsx`

**Features:**
- Table showing all shipments
- Columns: Reference, Origin, Destination, Status, Procurement Plan (clickable link)
- Click a row → goes to `ShipmentDetail.jsx`

**Normalizer** (`normalizeShipment.js`):
```javascript
// Converts snake_case DB fields to camelCase for React:
{
  id: row.id,
  reference: row.shipment_reference,
  origin: row.origin,
  destination: row.destination,
  status: row.status,
  procurementPlanId: row.procurement_plan_id,  // KEY FIELD
  plannedQuantity: row.planned_quantity_m,
  receivedQuantity: row.received_quantity_m,
  plannedArrival: row.planned_arrival
}
```

### Docks

**Page:** `pages/e2/Docks.jsx`

**Features:**
- Yard + Dock grid showing occupancy status
- Unassigned trailers list
- Dock recommendation (best match based on yard and priority)
- **"Auto-Assign Docks" button** → triggers `POST /api/e2/dock/assign`
- Dock assignments table showing truck-to-dock allocation
- CSV export of assignments

### Alerts

**Page:** `pages/alerts/Alerts.jsx`

**Features:**
- Tries backend API first (`GET /api/e2/alerts`)
- Falls back to client-side computation if API unavailable
- Displays three alert types: TRUCK_DELAYED, DOCK_UNAVAILABLE, YARD_FULL
- Color-coded by severity (red for HIGH, yellow for MEDIUM)

## 5.5 P2 Features

### S&OP Cycles

**Page:** `pages/p2/SopCycles.jsx`

**Features:**
- List of all S&OP cycles with status badges
- Create new cycle (name, start date, end date)
- Update cycle status (DRAFT → REVIEW → APPROVED → CLOSED)
- **"Generate S&OP Plan" button** → triggers plan calculation
- **"Generate Recommendations" button** → triggers risk analysis
- Shows plan summary and recommendations for selected cycle

### Demand Planning

**Page:** `pages/p2/DemandPlanning.jsx`

**Features:**
- Table of demand forecasts per SKU per week
- KPI cards: Total forecast, Average forecast, Product count
- Trend chart (MultiLineChart showing demand over weeks)
- Filter by SKU and week

### Production Scheduling

**Page:** `pages/p2/ProductionScheduling.jsx`

**Features:**
- Table of production capacity per plant per product
- KPI cards: Total capacity, Product count, Average capacity
- Capacity utilization chart
- Shows planned production vs capacity from S&OP plan data

### Procurement Plans

**Page:** `pages/p2/ProcurementPlans.jsx`

**Features:**
- Table of all procurement plans for selected cycle
- Columns: SKU, Fabric, Supplier, Required, MOQ, Recommended, Lead Time, Risk
- Search by SKU
- Filter by cycle
- Risk level badges (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=green)
- Click a row → goes to `ProcurementPlanDetail.jsx`

### Procurement Plan Detail (Key Integration Page)

**Page:** `pages/p2/ProcurementPlanDetail.jsx`

**This is the most important page for understanding P2-E2 integration.**

**Features:**
- Product Information card (SKU, Product, Fabric, Supplier)
- Procurement Plan card (Required, MOQ, Recommended, Lead Time, Risk, Status)
- **Linked E2 Shipments** — table showing all shipments tied to this plan
- Each shipment shows: Reference, Status, Planned Arrival, Quantities
- Click a shipment → goes to `/e2/shipments/:reference` (E2 side)

### Risk Monitor

**Page:** `pages/p2/RiskMonitor.jsx`

**Features:**
- Shows procurement plans at risk due to E2 execution delays
- Reads shipment data (ETA, status, quantities)
- Flags plans where: shipment is delayed, material not fully received, lead time too long
- Each risk card links back to procurement plan detail

### Recommendations

**Page:** `pages/p2/Recommendations.jsx`

**Features:**
- Shows S&OP recommendations generated by the 5 rule engines
- Each recommendation has: Type, Severity, Message, Recommended Action
- Links to related shipment and/or procurement plan
- Filter by severity

## 5.6 Premium UI (Motion, shadcn, Recharts)

Commit `ab79e64` upgraded the entire UI:

### Framer Motion Animations

Every page component now wraps content in `<motion.div>`:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* Page content */}
</motion.div>
```

### Recharts Integration

Dashboard uses 4 chart types:
- **GroupedBarChart** — Demand vs Production capacity by week
- **MultiLineChart** — Demand trend over weeks
- **DonutChart** — Status distribution (Balanced/Shortage/Excess)
- **RadialGaugeChart** — S&OP health score

### SpotlightCard

Aceternity-style hover effect where a spotlight follows the cursor:
```jsx
<SpotlightCard className="...">
  <h3>Title</h3>
  <p>Content</p>
</SpotlightCard>
```

## 5.7 Auth & Access (Clerk)

### Frontend Flow

```
User visits /dashboard
  → AppRoutes checks SignedIn (Clerk)
  → If not signed in → redirect to /
  → If signed in → AuthGate renders children
  → ManagerGuard checks user.publicMetadata.role === "manager"
  → If not manager → "Access Denied" page
  → If manager → render page
```

### Role Management

- **Manager** — Full access to all routes
- **User** — Can only see landing page and track page
- **Admin** — Can manage users (`/users` page)

## 5.8 Public Pages

### Landing Page

**File:** `pages/landing/LandingPage.jsx`

**Features:**
- Hero section with FlowSync branding
- "Go to Dashboard" button (if signed in as manager)
- "Track Order" button (public)
- "Sign In" / "Sign Up" buttons (if not signed in)

### Track Page

**File:** `pages/track/TrackPage.jsx`

**Features:**
- Public page — no auth required
- Search by tracking number, trailer ID, or shipment reference
- Shows truck on Leaflet map with simulated GPS movement
- Truck details panel (status, priority, ETA, location)

---

# PART 6: P2 ↔ E2 INTEGRATION (The Core Innovation — Deep Dive)

## 6.1 The Foreign Key: procurement_plan_id

This is the thread that ties everything together.

```
p2.procurement_plans                    e2.shipments
┌──────────────────────┐               ┌──────────────────────┐
│ id: 42               │◄──────────────│ procurement_plan_id: 42│
│ product_id: 7        │               │ shipment_reference:    │
│ fabric_id: 3         │               │   "SHP-001"           │
│ required_fabric_m:   │               │ status: IN_TRANSIT    │
│   5000               │               │ planned_arrival:      │
│ risk_level: HIGH     │               │   "2026-11-15"        │
└──────────────────────┘               └──────────────────────┘
```

**Database constraint:**
```sql
ALTER TABLE e2.shipments
ADD CONSTRAINT fk_shipment_procurement
FOREIGN KEY (procurement_plan_id)
REFERENCES p2.procurement_plans(id);
```

## 6.2 How P2 Feeds E2 (Procurement Plan → Shipment)

### Step-by-Step Flow

```
1. Planner creates S&OP cycle (POST /api/sop/cycles)
2. Planner clicks "Generate S&OP Plan" (POST /api/sop/cycles/:id/plan/generate)
   → Backend runs sopRules.js for each product
   → Inserts into p2.sop_plan_lines (with status: BALANCED/SHORTAGE/EXCESS)
3. Planner clicks "Generate Recommendations" (POST /api/sop/cycles/:id/recommendations/generate)
   → Backend runs all 5 risk engines
   → Inserts into p2.sop_recommendations
4. Procurement plans are created (from sop_plan_lines)
   → Each plan has: product, fabric, supplier, quantity, risk level
   → Each plan gets a unique ID (e.g., 42)
5. E2 system creates shipments linked to procurement plans
   → INSERT INTO e2.shipments (procurement_plan_id, ...) VALUES (42, ...)
   → The shipment now has a foreign key back to plan #42
```

### In the UI

From `ProcurementPlanDetail.jsx`:

```
User clicks on procurement plan #42
  → Page fetches GET /api/procurement/plans/42/shipments
  → Backend joins p2.procurement_plans with e2.shipments
  → Returns plan details + all linked shipments
  → User sees: "This plan has 3 shipments: SHP-001 (IN_TRANSIT), SHP-002 (ARRIVED), SHP-003 (DELAYED)"
```

## 6.3 How E2 Feeds Back to P2 (Status/ETA → Risk)

### The Feedback Mechanism

```
E2: Shipment SHP-001 is DELAYED
  → truck.current_eta = "2026-11-18" (3 days late)
  → shipment.status = "DELAYED"

P2: Risk Monitor reads this data
  → GET /api/procurement/risk
  → Backend checks: is shipment delayed?
  → shipmentDelayRule.js calculates: 3 days late → HIGH severity
  → Flags procurement plan #42 as AT RISK

P2: Recommendations generated
  → "Shipment SHP-001 is 3 days late. Consider expediting or finding alternative supplier."
  → Linked to plan #42
```

### In the UI

From `RiskMonitor.jsx`:

```
User navigates to /p2/risk
  → Page fetches GET /api/procurement/risk
  → Shows cards for each at-risk plan
  → Each card shows: Plan #, Product, Risk Type, Severity, Message
  → User clicks a card → goes to ProcurementPlanDetail
  → User sees the delayed shipment and can take action
```

## 6.4 Bidirectional Navigation

### P2 → E2

```
ProcurementPlanDetail.jsx
  → Shows linked shipments table
  → Each row has a "View" button
  → Click → navigates to /e2/shipments/:reference
```

### E2 → P2

```
ShipmentDetail.jsx
  → Shows shipment info
  → If shipment has procurementPlanId:
    → Shows "View Procurement Plan" button
    → Click → navigates to /p2/procurement/:planId
```

This bidirectional navigation is what makes FlowSync unique — you can follow the data from plan to execution and back.

## 6.5 Risk Detection (5 Engines Working Together)

When `POST /api/sop/cycles/:id/recommendations/generate` is called:

```javascript
// sopRules.js → generateSopRecommendations()
const recommendations = [];

for (const planLine of planLines) {
  // 1. Inventory Risk
  const inventoryRisk = evaluateInventoryRisk(
    planLine.opening_inventory_units,
    planLine.forecast_demand_units,
    planLine.projected_ending_inventory
  );
  if (inventoryRisk) recommendations.push(inventoryRisk);

  // 2. Production Risk
  const productionRisk = evaluateProductionRisk(
    planLine.required_production,
    planLine.production_capacity,
    planLine.planned_production
  );
  if (productionRisk) recommendations.push(productionRisk);

  // 3. Procurement Risk
  const procurementRisk = evaluateProcurementRisk(
    planLine.required_fabric,
    planLine.recommended_order_qty,
    planLine.lead_time_weeks
  );
  if (procurementRisk) recommendations.push(procurementRisk);

  // 4. Markdown Opportunity
  const markdownRisk = evaluateMarkdownOpportunity(
    planLine.projected_ending_inventory,
    planLine.forecast_demand_units
  );
  if (markdownRisk) recommendations.push(markdownRisk);

  // 5. Shipment Delay Risk (from E2 data)
  const shipmentRisk = evaluateShipmentDelayRisk(
    planLine.shipment_planned_arrival,
    planLine.shipment_current_eta,
    planLine.shipment_status,
    planLine.truck_status,
    planLine.planned_quantity,
    planLine.received_quantity
  );
  if (shipmentRisk) recommendations.push(shipmentRisk);
}

// INSERT all recommendations into p2.sop_recommendations
```

## 6.6 Recommendations Generation

Each recommendation stored in `p2.sop_recommendations`:

```sql
INSERT INTO p2.sop_recommendations (
  sop_cycle_id, product_id, recommendation_type,
  severity, message, recommended_action, status
) VALUES ($1, $2, $3, $4, $5, $6, 'OPEN');
```

**Example recommendations:**

| Type | Severity | Message | Action |
|------|----------|---------|--------|
| INVENTORY_SHORTAGE | HIGH | "Stock will run out. Shortage of 500 units." | "Increase production or expedite shipment" |
| CAPACITY_SHORTAGE | HIGH | "Need 1000 units but capacity is only 800." | "Shift production to secondary plant" |
| SHIPMENT_DELAY | HIGH | "Shipment arriving 3 days late." | "Contact supplier for expedited delivery" |
| EXCESS_INVENTORY | MEDIUM | "Excess of 300 units. Consider markdown." | "Apply 15% discount to clear stock" |
| LONG_LEAD_TIME | MEDIUM | "Lead time is 6 weeks." | "Place order earlier next cycle" |

## 6.7 The Complete Loop (End-to-End Walkthrough)

Let's trace one complete cycle:

```
DAY 1: PLANNING
━━━━━━━━━━━━━━
1. Planner creates "SOP-2026-NOV" cycle
2. System shows demand forecasts: Product A needs 1000 units
3. System shows production capacity: Plant can make 800 units
4. System shows inventory: 200 units in stock
5. Planner clicks "Generate S&OP Plan"
   → Required: 1000 - 200 = 800 units
   → Planned: min(800, 800) = 800 units
   → Ending: 200 + 800 - 1000 = 0 units
   → Status: BALANCED
6. System creates procurement plan: "Order 5000m of Fabric X from Supplier Y"
7. Planner clicks "Generate Recommendations"
   → No risks detected (all balanced)

DAY 5: EXECUTION BEGINS
━━━━━━━━━━━━━━━━━━━━━━
8. Shipment SHP-001 created from procurement plan #42
9. Truck TRK-101 assigned to shipment
10. Truck departs from supplier warehouse

DAY 8: PROBLEM DETECTED
━━━━━━━━━━━━━━━━━━━━━━
11. Truck TRK-101 is DELAYED (traffic, weather)
12. Truck GPS shows it's 200km away
13. Current ETA: 3 days later than planned
14. Alert center shows: "TRUCK_DELAYED — TRK-101 is running late"

DAY 8: RISK DETECTED IN P2
━━━━━━━━━━━━━━━━━━━━━━━━━
15. Planner goes to Risk Monitor (/p2/risk)
16. System shows: "Procurement Plan #42 is AT RISK"
    → Reason: Shipment SHP-001 is 3 days late
    → Severity: HIGH
    → Impact: Production may be delayed

DAY 8: RECOMMENDATION GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17. Planner goes to Recommendations (/p2/recommendations)
18. System shows: "SHIPMENT_DELAY — Consider expediting or finding alternative supplier"
19. Planner contacts supplier, arranges expedited delivery

DAY 10: REPLAN
━━━━━━━━━━━━━━
20. Planner starts next S&OP cycle (SOP-2026-DEC)
21. System incorporates execution data:
    → "Last cycle had a 3-day delay on Fabric X"
    → "Recommend ordering 1 week earlier this cycle"
22. Planner adjusts procurement timing
23. Loop continues...
```

## 6.8 Data Flow Diagrams

### P2 → E2 Flow

```
S&OP Cycle
    │
    ▼
Demand Planning ──→ Production Scheduling ──→ Inventory Check
    │                                              │
    ▼                                              ▼
Gap Analysis (SHORTAGE/EXCESS/BALANCED) ◄──────────┘
    │
    ▼
Procurement Plans ──→ [procurement_plan_id] ──→ E2 Shipments Created
                                                     │
                                                     ▼
                                              Truck Tracking
                                                     │
                                                     ▼
                                              Yard & Dock Assignment
```

### E2 → P2 Feedback Flow

```
E2 Shipments (status, ETA)
    │
    ▼
Risk Monitor (reads E2 data)
    │
    ▼
Risk Detection (5 rule engines)
    │
    ▼
Recommendations Generated
    │
    ▼
Next S&OP Cycle (informed by execution reality)
```

---

# PART 7: AI SUPPLY CHAIN COPILOT (Deep Dive)

## 7.1 Why AI in SCM?

Supply chain data is complex. A human planner has to look at:
- 50+ products
- Multiple suppliers with different lead times
- Production capacity across plants
- Inventory levels
- Shipment statuses and ETAs
- Risk levels

**AI helps by:**
- Synthesizing large amounts of data into actionable insights
- Identifying patterns humans might miss
- Generating structured recommendations
- Providing natural language explanations of complex situations

## 7.2 Architecture

```
┌──────────────┐     POST /api/ai/insight     ┌──────────────┐
│   Frontend   │ ──────────────────────────→   │   Backend    │
│              │                               │              │
│ AIInsight    │     { type, data }            │ ai.service   │
│ Card.jsx     │                               │     ↓        │
│              │     Structured insight        │ OpenAI API   │
│              │ ←──────────────────────────   │ gpt-4.1-nano │
└──────────────┘                               └──────────────┘
```

**Frontend service** (`features/ai/ai.service.js`):
```javascript
import apiClient from '../../api/apiClient';

export async function getInsight(type, data) {
  const response = await apiClient.post('/api/ai/insight', { type, data });
  return response.data;  // { success, data: { insight: "..." } }
}
```

**Backend service** (`module/ai/ai.service.js`):
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateInsight(type, data) {
  const systemPrompt = `You are a supply chain analyst for FlowSync.
Analyze the provided data and return a structured insight in this EXACT format:

SITUATION: [What is happening]
BUSINESS IMPACT: [What it means for the business]
RECOMMENDED ACTIONS: [Specific actions to take]
PRIORITY: [HIGH/MEDIUM/LOW]

Be specific, use numbers from the data, and focus on actionable insights.`;

  const userPrompt = buildPrompt(type, data);

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}
```

## 7.3 Three Insight Types

### 1. Risk Analysis

**Trigger:** User clicks "AI Analysis" on Risk Monitor page

**Data sent:**
```json
{
  "type": "risk_analysis",
  "data": {
    "atRiskPlans": [
      { "product": "SKU-A001", "risk": "SHIPMENT_DELAY", "severity": "HIGH",
        "message": "Shipment arriving 3 days late" }
    ],
    "totalPlans": 45,
    "highRiskCount": 3
  }
}
```

**AI prompt:**
```
Analyze the following supply chain risk data:
- Total procurement plans: 45
- High risk plans: 3
- At-risk plans: [list of plans with risk details]

Provide a risk analysis covering the situation, business impact,
recommended actions, and priority level.
```

### 2. Plan Analysis

**Trigger:** User clicks "AI Analysis" on Procurement Plan Detail page

**Data sent:**
```json
{
  "type": "plan_analysis",
  "data": {
    "plan": { "product": "SKU-A001", "fabric": "Cotton", "supplier": "Supplier A",
              "required": 5000, "recommended": 5500, "leadTime": 4 },
    "shipments": [ { "reference": "SHP-001", "status": "IN_TRANSIT", "eta": "2026-11-15" } ]
  }
}
```

### 3. Cycle Summary

**Trigger:** User clicks "AI Summary" on S&OP Cycles page

**Data sent:**
```json
{
  "type": "cycle_summary",
  "data": {
    "cycleName": "SOP-2026-NOV",
    "totalProducts": 50,
    "balanced": 35,
    "shortage": 10,
    "excess": 5,
    "healthScore": 70,
    "recommendations": 12
  }
}
```

## 7.4 Prompt Engineering

The key to getting good AI output is the **system prompt**:

```
You are a supply chain analyst for FlowSync, a platform connecting
planning (P2) and execution (E2) in supply chain management.

Analyze the provided data and return a structured insight in this
EXACT format:

SITUATION: [What is happening — describe the current state using data]
BUSINESS IMPACT: [What it means — consequences for the business]
RECOMMENDED ACTIONS: [Specific, actionable steps to take]
PRIORITY: [HIGH if immediate action needed, MEDIUM if within days, LOW if informational]

Rules:
- Use specific numbers from the data
- Focus on actionable insights, not generic advice
- Be concise — each section should be 1-2 sentences
- If multiple issues exist, focus on the most critical one
```

## 7.5 Frontend Integration (AIInsightCard)

```jsx
// components/ui/AIInsightCard.jsx
import { useState } from 'react';
import { getInsight } from '../../features/ai/ai.service';

function AIInsightCard({ type, data }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await getInsight(type, data);
    setInsight(result.insight);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insight</CardTitle>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Insight'}
        </Button>
      </CardHeader>
      <CardContent>
        {insight && (
          <div className="space-y-2">
            {/* Parse and render SITUATION/IMPACT/ACTIONS/PRIORITY */}
            {insight.split('\n').map((line, i) => (
              <p key={i} className="text-sm">{line}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 7.6 Demo: AI in Action

**Demo flow:**
1. Navigate to Risk Monitor (`/p2/risk`)
2. See 3 at-risk procurement plans
3. Click "AI Analysis" button
4. Wait 2-3 seconds
5. AI returns:

```
SITUATION: 3 procurement plans are at risk due to shipment delays.
2 shipments are 3+ days late (HIGH severity), 1 is 1 day late (MEDIUM).

BUSINESS IMPACT: Production for SKU-A001 and SKU-B002 may be delayed
by 3 days, affecting 1500 units of output. Revenue impact estimated
at $45,000 if not addressed.

RECOMMENDED ACTIONS: 1) Contact Supplier A for expedited delivery on
SHP-001. 2) Activate backup supplier for Fabric Y. 3) Shift production
of SKU-A001 to Plant B which has spare capacity.

PRIORITY: HIGH
```

---

# PART 8: CHALLENGES & SOLUTIONS

## 8.1 Data Integration Challenges

**Challenge:** Making P2 and E2 data work together when they have different structures.

**Solution:** The `procurement_plan_id` foreign key. This single column in `e2.shipments` references `p2.procurement_plans.id`, creating a clean bridge between the two schemas.

**Challenge:** Snake_case database fields vs camelCase React props.

**Solution:** Normalizer layer. Every feature has a `normalize<Entity>.js` file that converts:
```javascript
{ shipment_reference: "SHP-001", procurement_plan_id: 42 }
→
{ reference: "SHP-001", procurementPlanId: 42 }
```

## 8.2 CORS & Deployment Issues

**Challenge:** Frontend on Vercel, backend on separate server — CORS errors.

**Solution:** Backend CORS locked to production domain:
```javascript
app.use(cors({
  origin: 'https://flowsyncs.site',
  credentials: true
}));
```

**Challenge:** Vercel serves SPA but backend API routes need to work.

**Solution:** `vercel.json` with SPA rewrites:
```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

## 8.3 Real-Time Simulation

**Challenge:** No real GPS data from trucks — how to demo live tracking?

**Solution:** Client-side GPS simulation in `useTruckSimulation.js`. Moves IN_TRANSIT trucks toward the warehouse (Kolkata) by 0.00008 degrees every 300ms. This creates a convincing demo without real hardware.

**Challenge:** Simulation needs to be direction-aware (inbound vs outbound).

**Solution:** Calculate distance to warehouse. If moving toward warehouse, increment coordinates. If moving away, decrement. If very close (< 0.0005), snap to warehouse position.

## 8.4 Auth & Role Management

**Challenge:** Need role-based access (manager vs user) but Clerk's default setup doesn't support this.

**Solution:** Used Clerk's `publicMetadata` field:
```javascript
// Store role in user metadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: "manager" }
});

// Check role in frontend
const isManager = user?.publicMetadata?.role === "manager";
```

**Challenge:** Backend Clerk API calls failed on Render (no native `fetch`).

**Solution:** Replaced `fetch` with Node.js built-in `https` module:
```javascript
import https from 'https';

function clerkRequest(path, options) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.clerk.com',
      path: `/v1/${path}`,
      method: options.method,
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}
```

## 8.5 P2-E2 Relationship Design

**Challenge:** One-to-one vs one-to-many relationship between procurement plans and shipments.

**Solution:** One-to-many. A single procurement plan can have multiple shipments (e.g., fabric split across multiple deliveries). This is more realistic.

**Challenge:** How to show P2 data on E2 pages and vice versa.

**Solution:** Bidirectional navigation with context passing:
- P2 → E2: `ProcurementPlanDetail` shows linked shipments with "View" buttons
- E2 → P2: `ShipmentDetail` shows "View Procurement Plan" button (only if `procurementPlanId` exists)

---

# PART 9: DEMO GUIDE (How to Present)

## 9.1 Opening Pitch (30 Seconds)

> "FlowSync is a supply chain management platform that connects Planning and Execution in one continuous loop. In most companies, the planning team creates procurement plans on spreadsheets, and the execution team tracks shipments on separate systems. When a shipment is delayed, nobody in planning knows until it's too late. FlowSync fixes this by linking every procurement plan to its shipments through a shared database key, so execution status flows back to planning automatically. This creates a continuous feedback loop: Plan → Execute → Monitor → Respond → Replan."

## 9.2 Demo Flow (5 Minutes)

### Minute 1: The Problem (Dashboard)

1. Open Dashboard (`/dashboard`)
2. Show the combined P2 + E2 view
3. Point out the KPIs: "This shows planning health and execution status in one place"
4. Show the charts: "Demand vs Production capacity, status distribution"

### Minute 2: Planning (P2)

1. Navigate to S&OP Cycles (`/p2/sop`)
2. Show the cycle list: "This is our planning period"
3. Click "Generate S&OP Plan" — show the calculation running
4. Show the plan results: "For each product, the system calculates the gap"
5. Navigate to Procurement Plans (`/p2/procurement`)
6. Show the plans with risk levels: "These are the orders we need to place"

### Minute 3: Execution (E2)

1. Navigate to Shipments (`/e2/shipments`)
2. Show the shipment list: "These are the physical shipments"
3. Click on a shipment → show the detail page
4. Point out the P2 link: "This shipment is linked to procurement plan #42"
5. Navigate to Truck Tracker (`/e2/trucks`)
6. Show the live map: "Trucks are moving in real-time" (point to simulated GPS)

### Minute 4: Integration

1. Navigate to Risk Monitor (`/p2/risk`)
2. Show the at-risk plans: "These plans are at risk because shipments are delayed"
3. Navigate to Recommendations (`/p2/recommendations`)
4. Show the AI-generated recommendations: "The system suggests specific actions"
5. Click "AI Analysis" on a recommendation → show the AI insight

### Minute 5: The Loop

1. Navigate to S&OP Cycles again
2. Show that the next cycle incorporates execution data
3. Explain: "This closes the loop — execution feedback informs the next planning cycle"
4. End with: "Plan → Execute → Monitor → Respond → Replan. The loop never ends."

## 9.3 Technical Deep Dive (If Asked)

### "How does the P2-E2 integration work?"

> "Every shipment in the E2 database has a `procurement_plan_id` column that references the P2 procurement plan that created it. This is a PostgreSQL foreign key. When you view a procurement plan, the backend joins the two tables to show all linked shipments. When you view a shipment, it links back to the plan. This bidirectional link is what enables the feedback loop."

### "How does the risk detection work?"

> "We have 5 business rule engines that run when you click 'Generate Recommendations'. They check inventory risk, production risk, procurement risk, markdown opportunity, and shipment delay. Each engine has specific thresholds — for example, shipment delay is HIGH severity if the delay is 3+ days, MEDIUM if less. The engines also check E2 execution data — if a shipment is delayed, it flags the linked procurement plan as at risk."

### "How does the AI copilot work?"

> "We use OpenAI's GPT-4.1-nano model. When you click 'AI Analysis', the frontend sends the current context (risk data, plan data, or cycle data) to the backend. The backend constructs a prompt with a system message that tells the AI to respond in a structured format: SITUATION, BUSINESS IMPACT, RECOMMENDED ACTIONS, PRIORITY. The AI generates a response, which is displayed in the AIInsightCard component."

## 9.4 Common Evaluator Questions & Answers

| Question | Answer |
|----------|--------|
| "What's the difference between P2 and E2?" | P2 is Planning — demand, production, inventory, procurement. E2 is Execution — shipments, trucks, yards, docks. P2 decides what to order, E2 tracks what's physically moving. |
| "Why PostgreSQL and not MongoDB?" | Supply chain data is highly relational (products → fabrics → suppliers, plans → shipments → trucks). PostgreSQL's JOINs and foreign keys make the P2-E2 integration clean. |
| "Why no ORM?" | Raw SQL gives us full control over complex queries, especially the JOIN-heavy integration queries. It also keeps the bundle smaller. |
| "How realistic is the demo data?" | We created synthetic datasets that mirror real supply chain patterns — 50 products, 5 plants, 10 suppliers, 50 shipments. The data relationships are realistic (products use fabrics from specific suppliers). |
| "What happens if the backend goes down?" | The alerts page has a client-side fallback that computes alerts from local data. Other pages show error states. The app degrades gracefully. |
| "How does the dock assignment algorithm work?" | It's a transactional operation with row-level locking. Trucks are matched to docks by priority (HIGH first), and the PostgreSQL transaction ensures no double-assignment. |
| "Is this production-ready?" | This is a hackathon prototype. For production, we'd need: real auth verification (currently stubbed), error monitoring, rate limiting, database migrations, and CI/CD. |

---

# PART 10: FUTURE ROADMAP

## 10.1 What We'd Build Next

| Feature | Description | Priority |
|---------|-------------|----------|
| **Real Auth** | Replace auth stub with actual Clerk JWT verification | HIGH |
| **WebSocket Real-Time** | Push alerts to frontend instead of polling | HIGH |
| **Database Migrations** | Version-controlled schema changes (currently manual) | HIGH |
| **Testing** | Unit tests for rule engines, API tests for endpoints | HIGH |
| **CI/CD** | GitHub Actions for automated deployment | MEDIUM |
| **Mobile App** | React Native version for warehouse workers | MEDIUM |
| **Email Alerts** | Send email notifications for critical risks | MEDIUM |
| **Excel Export** | Export procurement plans and shipments to Excel | LOW |
| **Multi-Tenant** | Support multiple companies on one instance | LOW |
| **Real GPS Integration** | Connect to actual truck GPS devices | LOW |

## 10.2 Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| Auth is stubbed | Backend doesn't verify JWT tokens | Use frontend role checks only |
| No automated tests | Regressions possible on changes | Manual testing checklist |
| Client-side GPS simulation | Demo only, not real tracking | Would need GPS hardware integration |
| Single database schema | All data in one Neon instance | Fine for hackathon, would need separation for production |
| No offline support | App requires internet | Would need service worker + IndexedDB |
| CORS locked to one domain | Can't test from other origins | Add localhost for development |

---

# APPENDIX: Quick Reference

## All Routes

| Path | Page | Module | Access |
|------|------|--------|--------|
| `/` | LandingPage | Public | Public |
| `/track` | TrackPage | Public | Public |
| `/dashboard` | Dashboard | Both | Manager |
| `/p2/overview` | P2Overview | P2 | Manager |
| `/p2/sop` | SopCycles | P2 | Manager |
| `/p2/demand` | DemandPlanning | P2 | Manager |
| `/p2/production` | ProductionScheduling | P2 | Manager |
| `/p2/inventory` | InventoryPage | P2 | Manager |
| `/p2/procurement` | ProcurementPlans | P2 | Manager |
| `/p2/procurement/:planId` | ProcurementPlanDetail | P2+E2 | Manager |
| `/p2/procurement/:planId/execution` | ProcurementExecution | P2+E2 | Manager |
| `/p2/markdown` | MarkdownDecisionCenter | P2 | Manager |
| `/p2/risk` | RiskMonitor | P2+E2 | Manager |
| `/p2/recommendations` | Recommendations | P2+E2 | Manager |
| `/e2/overview` | E2Overview | E2 | Manager |
| `/e2/shipments` | Shipments | E2 | Manager |
| `/e2/shipments/:reference` | ShipmentDetail | E2+P2 | Manager |
| `/e2/trucks` | TruckTracker | E2 | Manager |
| `/e2/docks` | Docks | E2 | Manager |
| `/alerts` | Alerts | E2 | Manager |
| `/users` | Users | Admin | Manager |

## All API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demand` | Demand forecasts |
| GET | `/api/demand/summary` | Demand summary |
| GET | `/api/demand/trend` | Demand trend |
| GET | `/api/inventory` | Inventory |
| GET | `/api/inventory/summary` | Inventory summary |
| GET | `/api/inventory/risk` | Inventory risk |
| GET | `/api/production` | Production capacity |
| GET | `/api/production/summary` | Production summary |
| GET | `/api/production/capacity` | Full capacity breakdown |
| GET | `/api/procurement` | Procurement plans |
| GET | `/api/procurement/summary` | Procurement summary |
| GET | `/api/procurement/risk` | At-risk plans |
| GET | `/api/procurement/plans/:id/shipments` | Plan + linked shipments |
| GET | `/api/markdown` | Markdown history |
| GET | `/api/markdown/summary` | Markdown summary |
| GET | `/api/sop/cycles` | S&OP cycles |
| POST | `/api/sop/cycles` | Create cycle |
| PATCH | `/api/sop/cycles/:id/status` | Update cycle status |
| GET | `/api/sop/cycles/:id/plan` | Get S&OP plan |
| POST | `/api/sop/cycles/:id/plan/generate` | Generate plan |
| GET | `/api/sop/cycles/:id/recommendations` | Get recommendations |
| POST | `/api/sop/cycles/:id/recommendations/generate` | Generate recommendations |
| GET | `/api/p2/overview` | P2 overview |
| GET | `/api/e2/truck` | All trucks |
| GET | `/api/e2/truck/locations` | Truck GPS locations |
| GET | `/api/e2/truck/status/:status` | Trucks by status |
| GET | `/api/e2/shipment` | All shipments |
| GET | `/api/e2/shipment/procurement/:id` | Shipments by plan |
| GET | `/api/e2/dock` | All docks |
| GET | `/api/e2/dock/assignments` | Dock assignments |
| POST | `/api/e2/dock/assign` | Auto-assign docks |
| GET | `/api/e2/yard` | All yards |
| GET | `/api/e2/alerts` | Delayed truck alerts |
| GET | `/api/e2/alerts/dock/:yard` | Dock availability |
| GET | `/api/e2/alerts/yard/:yard` | Yard capacity |
| GET | `/api/e2/overview` | E2 overview |
| POST | `/api/ai/insight` | AI copilot |
| GET | `/api/users` | List users |
| PATCH | `/api/users/:id/role` | Update user role |

## Business Rules Quick Reference

| # | Rule | Formula | Severity |
|---|------|---------|----------|
| 1 | Required Production | `max(0, demand - inventory)` | -- |
| 2 | Planned Production | `min(required, capacity)` | -- |
| 3 | Ending Inventory | `inventory + production - demand` | -- |
| 4 | Supply Gap | `max(0, -ending)` | -- |
| 5 | Plan Status | gap > 0 → SHORTAGE, else EXCESS/BALANCED | -- |
| 6 | Inventory Shortage | `ending < 0` | HIGH |
| 7 | Excess Inventory | `ending > demand × 0.5` | MEDIUM |
| 8 | Capacity Shortage | `required > capacity` | HIGH |
| 9 | High Utilization | `utilization ≥ 90%` | MEDIUM |
| 10 | Procurement Shortage | `order < required` | HIGH |
| 11 | Long Lead Time | `lead ≥ 4 weeks` | MEDIUM |
| 12 | Markdown Opportunity | `ending > demand × 0.5` | MEDIUM |
| 13 | Shipment Delay | `ETA > planned, delay ≥ 3 days` | HIGH |
| 14 | Dock Assignment | Priority-based, transactional | -- |
| 15 | Dock Unavailable | `available docks = 0` | HIGH |
| 16 | Yard Full | `trucks ≥ capacity` | HIGH |

---

*This document covers the entire FlowSync project from problem statement to deployed solution. For the actual source code, refer to the repository. For deployment instructions, see ARCHITECTURE.md.*
