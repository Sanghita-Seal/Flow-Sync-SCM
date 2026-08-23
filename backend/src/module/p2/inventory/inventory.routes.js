import express from "express";

import InventoryController from "./inventory.controller.js";
import InventoryQueryDto from "./inventory.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

// Static routes MUST come before /:productId
router.get(
  "/summary",
  InventoryController.getInventorySummary
);

router.get(
  "/risk",
  InventoryController.getInventoryRisk
);

router.get(
  "/:productId",
  InventoryController.getInventoryByProductId
);

router.get(
  "/",
  validate(InventoryQueryDto, "query"),
  InventoryController.getInventory
);

export default router;