import SopService from "./sop.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

class SopController {
  static async getCycles(req, res, next) {
    try {
      const cycles = await SopService.getCycles();

      return ApiResponse.list(res, cycles, {
        count: cycles.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCycleById(req, res, next) {
    try {
      const cycle = await SopService.getCycleById(req.params.cycleId);

      if (!cycle) {
        const error = new Error("S&OP cycle not found");
        error.statusCode = 404;
        throw error;
      }

      return ApiResponse.ok(res, cycle);
    } catch (error) {
      next(error);
    }
  }

  static async createCycle(req, res, next) {
    try {
      const cycle = await SopService.createCycle(req.validated.body);

      return ApiResponse.created(res, cycle);
    } catch (error) {
      next(error);
    }
  }

  static async updateCycleStatus(req, res, next) {
    try {
      const cycle = await SopService.updateCycleStatus(
        req.params.cycleId,
        req.validated.body.status,
      );

      return ApiResponse.ok(res, cycle);
    } catch (error) {
      next(error);
    }
  }
  static async getPlan(req, res, next) {
    try {
      const plan = await SopService.getPlanByCycleId(req.params.cycleId);

      return ApiResponse.list(res, plan, {
        count: plan.length,
      });
    } catch (error) {
      next(error);
    }
  }
  static async generatePlan(req, res, next) {
    try {
      const plan = await SopService.generatePlan(req.params.cycleId);

      return ApiResponse.created(res, plan);
    } catch (error) {
      next(error);
    }
  }
  static async getPlanSummary(req, res, next) {
    try {
      const summary = await SopService.getPlanSummary(req.params.cycleId);

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }

  ///recomendation
  static async generateRecommendations(req, res, next) {
    try {
      const recommendations = await SopService.generateRecommendations(
        req.params.cycleId,
      );

      return ApiResponse.created(res, recommendations);
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req, res, next) {
    try {
      const recommendations = await SopService.getRecommendations(
        req.params.cycleId,
      );

      return ApiResponse.list(res, recommendations, {
        count: recommendations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendationSummary(req, res, next) {
    try {
      const summary = await SopService.getRecommendationSummary(
        req.params.cycleId,
      );

      return ApiResponse.ok(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export default SopController;
