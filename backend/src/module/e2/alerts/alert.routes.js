import express from "express";
import AlertController from "./alert.controller.js";

const router = express.Router();

router.get("/", AlertController.getAlerts);

export default router;