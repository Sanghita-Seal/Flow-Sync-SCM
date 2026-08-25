import express from "express";
import DockController from "./dock.controller.js";

const router = express.Router();

router.get("/", DockController.getDocks);

router.get("/status/:status", DockController.getDocksByStatus);

router.get("/:dockCode", DockController.getDockByCode);

export default router;
