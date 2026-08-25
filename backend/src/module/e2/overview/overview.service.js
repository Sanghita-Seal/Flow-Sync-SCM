import OverviewModel from "./overview.model.js";

class OverviewService {
  static async getOverview() {
    return await OverviewModel.getOverview();
  }
}

export default OverviewService;
