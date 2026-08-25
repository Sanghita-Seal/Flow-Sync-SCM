import YardModel from "./yard.model.js";

class YardService {
  static async getYards() {
    return await YardModel.getYards();
  }

  static async getYardByName(name) {
    const yard = await YardModel.getYardByName(name);

    if (!yard) {
      const error = new Error("Yard not found");
      error.statusCode = 404;
      throw error;
    }

    return yard;
  }

  static async getYardsByStatus(status) {
    return await YardModel.getYardsByStatus(status);
  }
}

export default YardService;