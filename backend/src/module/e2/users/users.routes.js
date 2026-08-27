import { Router } from "express";
import { getUsers, updateUserRole } from "./users.controller.js";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/role", updateUserRole);

export default router;
