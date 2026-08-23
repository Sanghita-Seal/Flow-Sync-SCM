import express from "express";

import DemandController from "./demand.controller.js";
import DemandQueryDto from "./demand.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/",
  validate(DemandQueryDto, "query"),
  DemandController.getDemand
);

export default router;