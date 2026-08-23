import YardService from "./yard.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class YardController {
  static async getYards(req, res, next) {
    try {
      const yards = await YardService.getYards();

      return ApiResponse.list(res, yards, {
        count: yards.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getYardByName(req, res, next) {
    try {
      const { name } = req.params;

      const yard = await YardService.getYardByName(name);

      return ApiResponse.ok(res, yard);
    } catch (error) {
      next(error);
    }
  }

  static async getYardsByStatus(req, res, next) {
    try {
      const { status } = req.params;

      const yards = await YardService.getYardsByStatus(status);

      return ApiResponse.list(res, yards, {
        count: yards.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default YardController;