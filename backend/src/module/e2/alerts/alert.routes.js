import express from "express";

import AlertController from "./alert.controller.js";

const router = express.Router();

// GET /api/e2/alerts
// Get delayed truck alerts
router.get("/", AlertController.getAlerts);

// GET /api/e2/alerts/dock/:yard_name
// Check if all docks in a yard are occupied/unavailable
router.get(
  "/dock/:yard_name",
  AlertController.checkDockAvailability
);

// GET /api/e2/alerts/yard/:yard_name
// Check if yard capacity is full
router.get(
  "/yard/:yard_name",
  AlertController.checkYardCapacity
);

export default router;
