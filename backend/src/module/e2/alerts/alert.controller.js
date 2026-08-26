import AlertService from "./alert.service.js";

class AlertController {
  static async getAlerts(req, res) {
    try {
      const alerts = await AlertService.getAlerts();

      return res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default AlertController;