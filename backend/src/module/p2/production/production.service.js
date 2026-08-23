import ProductionModel from "./production.model.js";

class ProductionService {
  static async getProduction(filters) {
    return await ProductionModel.getProduction(filters);
  }

  static async getProductionByProductId(productId) {
    return await ProductionModel.getProductionByProductId(productId);
  }

  static async getProductionSummary() {
    return await ProductionModel.getProductionSummary();
  }

  static async getProductionCapacity() {
    return await ProductionModel.getProductionCapacity();
  }
}

export default ProductionService;