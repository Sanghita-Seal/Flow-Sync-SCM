import ProcurementModel from "./procurement.model.js";

class ProcurementService {
  static async getProcurement(filters) {
    return await ProcurementModel.getProcurement(filters);
  }

  static async getProcurementByProductId(productId) {
    return await ProcurementModel.getProcurementByProductId(
      productId
    );
  }

  static async getProcurementSummary() {
    return await ProcurementModel.getProcurementSummary();
  }

  static async getProcurementRisk() {
    return await ProcurementModel.getProcurementRisk();
  }
}

export default ProcurementService;