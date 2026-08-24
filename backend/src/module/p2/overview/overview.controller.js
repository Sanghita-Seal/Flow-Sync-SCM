import OverviewService from "./overview.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class OverviewController {
  static async getOverview(req, res, next) {
    try {
      const overview =
        await OverviewService.getOverview();

      return ApiResponse.ok(
        res,
        overview
      );
    } catch (error) {
      next(error);
    }
  }
}

export default OverviewController;