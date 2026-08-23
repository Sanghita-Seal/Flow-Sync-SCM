import DemandService from "./demand.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class DemandController {
  static async getDemand(req, res, next) {
    try {
      const demand = await DemandService.getDemand(req.validated.query);

      return ApiResponse.list(res, demand, {
        count: demand.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DemandController;