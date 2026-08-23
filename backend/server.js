import express from "express";
import pool from "./src/config/database.js";
const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" });
});

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ message: "Database connection successful!", time: result.rows[0].now });
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).json({ message: "Database connection failed.", error: err.message });
    }   
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});