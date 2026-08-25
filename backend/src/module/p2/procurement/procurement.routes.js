import express from "express";
import ProcurementController from "./procurement.controller.js";
import ProcurementQueryDto from "./procurement.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/summary",
  ProcurementController.getProcurementSummary
);

router.get(
  "/risk",
  ProcurementController.getProcurementRisk
);

// P2 procurement plan + E2 shipments + E2 truck details
// IMPORTANT: Must come before /:productId
router.get(
  "/plans/:procurementPlanId/shipments",
  ProcurementController.getProcurementPlanShipments
);

router.get(
  "/:productId",
  ProcurementController.getProcurementByProductId
);

router.get(
  "/",
  validate(ProcurementQueryDto, "query"),
  ProcurementController.getProcurement
);

export default router;