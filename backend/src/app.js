import express from "express";
import pool from "./common/config/database.js";

import authMiddleware from "./common/middleware/auth.middleware.js";
import notFoundMiddleware from "./common/middleware/not-found.middleware.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

import demandRoutes from "./module/p2/demand/demand.routes.js";
import truckRoutes from "./module/e2/truck/truck.routes.js";
import dockRoutes from "./module/e2/dock/dock.routes.js";
import yardRoutes from "./module/e2/yard/yard.routes.js";
import shipmentRoutes from "./module/e2/shipment/shipment.routes.js";

const app = express();

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!",
  });
});

// Database connection test
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connection successful!",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("Database connection error:", err);

    res.status(500).json({
      message: "Database connection failed.",
      error: err.message,
    });
  }
});

// Authentication middleware
app.use(authMiddleware);

// Routes
app.use("/api/demand", demandRoutes);
app.use("/api/e2/truck", truckRoutes);
app.use("/api/e2/dock", dockRoutes);
app.use("/api/e2/yard", yardRoutes);
app.use("/api/e2/shipment", shipmentRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Error handler
app.use(errorMiddleware);

export default app;