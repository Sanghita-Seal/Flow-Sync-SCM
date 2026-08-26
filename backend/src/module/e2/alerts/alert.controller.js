import AlertService from "./alert.service.js";

class AlertController {

  // ============================================================
  // GET /api/e2/alerts
  // Get delayed truck alerts
  // ============================================================

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


  // ============================================================
  // GET /api/e2/alerts/dock/:yard_name
  // Check whether all docks in a yard are unavailable
  // ============================================================

  static async checkDockAvailability(req, res) {
    try {
      const { yard_name } = req.params;

      const result =
        await AlertService.checkDockAvailability(yard_name);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error("Error checking dock availability:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }


  // ============================================================
  // GET /api/e2/alerts/yard/:yard_name
  // Check whether yard capacity has been reached
  // ============================================================

  static async checkYardCapacity(req, res) {
    try {
      const { yard_name } = req.params;

      const result =
        await AlertService.checkYardCapacity(yard_name);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error("Error checking yard capacity:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default AlertController;