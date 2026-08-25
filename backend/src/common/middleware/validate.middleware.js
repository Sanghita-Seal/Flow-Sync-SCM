import ApiError from "../utils/api-error.js";

const validate = (DtoClass, source = "body") => {
  return (req, res, next) => {
    const { error, value } = DtoClass.validate(req[source]);

    if (error) {
      const message = error.details
        .map((item) => item.message)
        .join(", ");

      return next(ApiError.badRequest(message));
    }

    // Do not overwrite req.query / req.params.
    // Store validated data separately.
    req.validated = req.validated || {};
    req.validated[source] = value;

    next();
  };
};

export default validate;