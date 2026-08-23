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