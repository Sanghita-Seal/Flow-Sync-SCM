import Joi from "joi";

class BaseDto {
  static schema = Joi.object({});

  static validate(data) {
    return this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  }
}

export default BaseDto;