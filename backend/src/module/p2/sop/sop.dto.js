import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class CreateSopCycleDto extends BaseDto {
  static schema = Joi.object({
    cycleName: Joi.string()
      .trim()
      .min(1)
      .required(),

    startDate: Joi.date()
      .required(),

    endDate: Joi.date()
      .greater(Joi.ref("startDate"))
      .required(),

    status: Joi.string()
      .valid("DRAFT", "REVIEW", "APPROVED", "CLOSED")
      .default("DRAFT"),
  });
}

class UpdateSopStatusDto extends BaseDto {
  static schema = Joi.object({
    status: Joi.string()
      .valid("DRAFT", "REVIEW", "APPROVED", "CLOSED")
      .required(),
  });
}

export {
  CreateSopCycleDto,
  UpdateSopStatusDto,
};