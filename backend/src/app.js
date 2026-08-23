import express from "express";
import pool from "./common/config/database.js";

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

export default app;