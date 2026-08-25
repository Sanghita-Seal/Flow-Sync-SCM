import express from "express";

import MarkdownController from "./markdown.controller.js";
import MarkdownQueryDto from "./markdown.dto.js";
import validate from "../../../common/middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/summary",
  MarkdownController.getMarkdownSummary
);

router.get(
  "/:productId",
  MarkdownController.getMarkdownByProductId
);

router.get(
  "/",
  validate(MarkdownQueryDto, "query"),
  MarkdownController.getMarkdown
);

export default router;