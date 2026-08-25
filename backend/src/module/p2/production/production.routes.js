import express from "express";

import ProductionController from "./production.controller.js";
import ProductionQueryDto from "./production.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/summary",
  ProductionController.getProductionSummary
);

router.get(
  "/capacity",
  ProductionController.getProductionCapacity
);

router.get(
  "/:productId",
  ProductionController.getProductionByProductId
);

router.get(
  "/",
  validate(ProductionQueryDto, "query"),
  ProductionController.getProduction
);

export default router;