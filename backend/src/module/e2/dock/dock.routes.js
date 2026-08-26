import express from "express";

import DockController from "./dock.controller.js";

const router = express.Router();

// Get all docks
router.get("/", DockController.getDocks);

// Get docks by status
router.get("/status/:status", DockController.getDocksByStatus);

// Assign eligible arrived trucks to available docks
router.post("/assign", DockController.assignDocks);

// Get dock by dock code
router.get("/:dockCode", DockController.getDockByCode);

export default router;