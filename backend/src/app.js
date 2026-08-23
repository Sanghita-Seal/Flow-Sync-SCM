import express from "express";
import pool from "./common/config/database.js";

import authMiddleware from "./common/middleware/auth.middleware.js";
import notFoundMiddleware from "./common/middleware/not-found.middleware.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

import demandRoutes from "./module/p2/demand/demand.routes.js";
import inventoryRoutes from "./module/p2/inventory/inventory.routes.js";  
import productionRoutes from "./module/p2/production/production.routes.js";
import procurementRoutes from "./module/p2/procurement/procurement.routes.js";
import markdownRoutes from "./module/p2/markdown/markdown.routes.js";

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


//Authentication middleware
//temporary development version for now
app.use(authMiddleware);



app.use("/api/demand", demandRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/markdown", markdownRoutes);

//404 handler
app.use(notFoundMiddleware);

//Error handler
app.use(errorMiddleware);

export default app;