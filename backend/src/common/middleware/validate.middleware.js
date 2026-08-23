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

    req[source] = value;

    next();
  };
};

export default validate;