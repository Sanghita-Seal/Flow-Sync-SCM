import DemandModel from "./demand.model.js";

class DemandService {
  static async getDemand(filters) {
    const demand = await DemandModel.getDemand(filters);

    return demand;
  }
  static async getDemandByProductId(productId) {
    const demand = await DemandModel.getDemandByProductId(productId);

    return demand;
  }
  static async getDemandSummary() {
    return await DemandModel.getDemandSummary();
  }
  static async getDemandTrend() {
    return await DemandModel.getDemandTrend();
  }
}

export default DemandService;
