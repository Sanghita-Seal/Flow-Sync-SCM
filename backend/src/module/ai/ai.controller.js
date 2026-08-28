import { generateInsight } from "./ai.service.js";
import ApiResponse from "../../common/utils/api-response.js";

class AiController {
  static async generateInsight(req, res, next) {
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: type and data",
        });
      }

      const validTypes = ["risk_analysis", "plan_analysis", "cycle_summary"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      const insight = await generateInsight(type, data);
      return ApiResponse.ok(res, insight);
    } catch (error) {
      console.error("AI Insight error:", error.message);
      return res.status(503).json({
        success: false,
        error: "AI insight unavailable. Please try again later.",
      });
    }
  }
}

export default AiController;
