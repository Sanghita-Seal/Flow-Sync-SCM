import express from "express";

import DemandController from "./demand.controller.js";
import DemandQueryDto from "./demand.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

// Static routes FIRST
router.get(
  "/summary",
  DemandController.getDemandSummary
);

router.get(
  "/trend",
  DemandController.getDemandTrend
);



// Dynamic route AFTER static routes
router.get(
  "/:productId",
  DemandController.getDemandByProductId
);

// Base demand endpoint
router.get(
  "/",
  validate(DemandQueryDto, "query"),
  DemandController.getDemand
);

export default router;