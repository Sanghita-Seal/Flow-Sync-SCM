import express from "express";

import TruckController from "./truck.controller.js";

const router = express.Router();

router.get("/", TruckController.getTrucks);

router.get("/locations", TruckController.getTruckLocations);

router.get("/status/:status", TruckController.getTrucksByStatus);

router.get("/tracking/:tracking_number", TruckController.getTruckByTrackingNumber);

router.get("/:trailerId", TruckController.getTruckByTrailerId);

export default router;