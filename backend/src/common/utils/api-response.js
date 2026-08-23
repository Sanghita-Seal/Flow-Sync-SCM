class ApiResponse {
  static ok(res, data = null, message = null) {
    return res.status(200).json({
      success: true,
      ...(message && { message }),
      data,
    });
  }

  static created(res, data = null, message = "Created successfully") {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static list(res, data = [], meta = {}) {
    return res.status(200).json({
      success: true,
      data,
      meta,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;