import express from "express";

import SopController from "./sop.controller.js";

import { CreateSopCycleDto, UpdateSopStatusDto } from "./sop.dto.js";

import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

router.get("/cycles", SopController.getCycles);
router.get("/cycles/:cycleId/plan", SopController.getPlan);

router.get("/cycles/:cycleId/plan/summary", SopController.getPlanSummary);

router.post("/cycles/:cycleId/plan/generate", SopController.generatePlan);

router.get("/cycles/:cycleId", SopController.getCycleById);

router.post(
  "/cycles",
  validate(CreateSopCycleDto, "body"),
  SopController.createCycle,
);

router.patch(
  "/cycles/:cycleId/status",
  validate(UpdateSopStatusDto, "body"),
  SopController.updateCycleStatus,
);

//recomendation
router.post(
  "/cycles/:cycleId/recommendations/generate",
  SopController.generateRecommendations,
);

router.get(
  "/cycles/:cycleId/recommendations/summary",
  SopController.getRecommendationSummary,
);

router.get(
  "/cycles/:cycleId/recommendations",
  SopController.getRecommendations,
);

export default router;
