import MarkdownService from "./markdown.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class MarkdownController {
  static async getMarkdown(req, res, next) {
    try {
      const markdown = await MarkdownService.getMarkdown(
        req.validated.query
      );

      return ApiResponse.list(res, markdown, {
        count: markdown.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMarkdownByProductId(req, res, next) {
    try {
      const markdown =
        await MarkdownService.getMarkdownByProductId(
          req.params.productId
        );

      return ApiResponse.list(res, markdown, {
        count: markdown.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMarkdownSummary(req, res, next) {
    try {
      const summary =
        await MarkdownService.getMarkdownSummary();

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export default MarkdownController;