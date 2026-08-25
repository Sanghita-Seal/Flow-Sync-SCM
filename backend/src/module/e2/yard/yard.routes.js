import express from "express";
import YardController from "./yard.controller.js";

const router = express.Router();

router.get("/", YardController.getYards);

router.get("/status/:status", YardController.getYardsByStatus);

router.get("/:name", YardController.getYardByName);

export default router;