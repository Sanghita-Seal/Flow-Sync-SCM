import express from "express";
import ShipmentController from "./shipment.controller.js";

const router = express.Router();

router.get("/", ShipmentController.getShipments);

router.get(
  "/status/:status",
  ShipmentController.getShipmentsByStatus
);

router.get(
  "/:shipmentReference",
  ShipmentController.getShipmentByReference
);

export default router;
