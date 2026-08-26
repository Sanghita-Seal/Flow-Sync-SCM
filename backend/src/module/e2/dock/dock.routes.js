import express from "express";
import DockController from "./dock.controller.js";

const router = express.Router();

router.get("/", DockController.getDocks);

router.get("/status/:status", DockController.getDocksByStatus);

router.get("/assignments", DockController.getDockAssignments);

router.post("/assign", DockController.assignDocks);

router.get("/:dockCode", DockController.getDockByCode);

export default router;