import DockModel from "./dock.model.js";

class DockService {
  // Get all docks
  static async getDocks() {
    return await DockModel.getDocks();
  }

  // Get dock by dock code
  static async getDockByCode(dockCode) {
    const dock = await DockModel.getDockByCode(dockCode);

    if (!dock) {
      const error = new Error("Dock not found");
      error.statusCode = 404;
      throw error;
    }

    return dock;
  }

  // Get docks by status
  static async getDocksByStatus(status) {
    return await DockModel.getDocksByStatus(status);
  }

  // Assign docks to eligible arrived trucks
  static async assignDocks() {
    return await DockModel.assignDocks();
  }
}

export default DockService;