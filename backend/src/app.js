import express from "express";
import cors from "cors";
import pool from "./common/config/database.js";

import authMiddleware from "./common/middleware/auth.middleware.js";
import notFoundMiddleware from "./common/middleware/not-found.middleware.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

import demandRoutes from "./module/p2/demand/demand.routes.js";
import inventoryRoutes from "./module/p2/inventory/inventory.routes.js";  
import productionRoutes from "./module/p2/production/production.routes.js";
import procurementRoutes from "./module/p2/procurement/procurement.routes.js";
import markdownRoutes from "./module/p2/markdown/markdown.routes.js";
import sopRoutes from "./module/p2/sop/sop.routes.js";
import overviewRoutes from "./module/p2/overview/overview.routes.js";
import E2overviewRoutes from "./module/e2/overview/overview.routes.js";

import truckRoutes from "./module/e2/truck/truck.routes.js";
import dockRoutes from "./module/e2/dock/dock.routes.js";
import yardRoutes from "./module/e2/yard/yard.routes.js";
import shipmentRoutes from "./module/e2/shipment/shipment.routes.js";
import alertRouter from "./module/e2/alerts/alert.routes.js";
import userRoutes from "./module/e2/users/users.routes.js";
import aiRoutes from "./module/ai/ai.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
    origin: "https://flowsyncs.site"
}));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!",
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "healthy",
  });
});

// Database connection test
app.get("/db-test", async (_, res) => {
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
app.use("/api/inventory", inventoryRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/markdown", markdownRoutes);
app.use("/api/sop", sopRoutes);

app.use("/api/e2/truck", truckRoutes);
app.use("/api/e2/dock", dockRoutes);
app.use("/api/e2/yard", yardRoutes);
app.use("/api/e2/shipment", shipmentRoutes);
app.use("/api/p2/overview", overviewRoutes);
app.use("/api/e2/overview", E2overviewRoutes);
app.use("/api/e2/alerts", alertRouter);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Error handler
app.use(errorMiddleware);

export default app;