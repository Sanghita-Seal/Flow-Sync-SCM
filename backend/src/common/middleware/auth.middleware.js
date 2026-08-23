const authMiddleware = async (req, res, next) => {
  try {
    // Temporary development middleware.
    // Real Neon Auth verification will be added
    // when the frontend authentication flow is connected.

    req.user = null;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;