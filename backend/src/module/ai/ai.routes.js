import express from "express";
import AiController from "./ai.controller.js";

const router = express.Router();

router.post("/insight", AiController.generateInsight);

export default router;
