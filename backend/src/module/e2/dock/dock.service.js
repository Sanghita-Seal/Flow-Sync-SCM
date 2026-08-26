import DockModel from "./dock.model.js";

class DockService {

  static async getDocks() {
    return await DockModel.getDocks();
  }

  static async getDockByCode(dockCode) {
    const dock = await DockModel.getDockByCode(dockCode);

    if (!dock) {
      const error = new Error("Dock not found");
      error.statusCode = 404;
      throw error;
    }

    return dock;
  }

  static async getDocksByStatus(status) {
    return await DockModel.getDocksByStatus(status);
  }

  static async getDockAssignments() {
    return await DockModel.getDockAssignments();
  }

  static async assignDocks() {
    return await DockModel.assignDocks();
  }
}

export default DockService;