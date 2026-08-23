import DemandModel from "./demand.model.js";

class DemandService {
  static async getDemand(filters) {
    const demand = await DemandModel.getDemand(filters);

    return demand;
  }
}

export default DemandService;