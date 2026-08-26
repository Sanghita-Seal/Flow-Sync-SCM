import express from "express";
import ShipmentController from "./shipment.controller.js";

const router = express.Router();

router.get(
  "/",
  ShipmentController.getShipments
);

router.get(
  "/status/:status",
  ShipmentController.getShipmentsByStatus
);

// Get shipments linked to a P2 procurement plan
// IMPORTANT: This must come before /:shipmentReference
router.get(
  "/procurement/:procurementPlanId",
  ShipmentController.getShipmentsByProcurementPlan
);

router.get(
  "/:shipmentReference",
  ShipmentController.getShipmentByReference
);

export default router;