import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class ProcurementQueryDto extends BaseDto {
  static schema = Joi.object({
    sku: Joi.string()
      .trim()
      .optional(),

    week: Joi.string()
      .trim()
      .pattern(/^W\d+$/)
      .optional(),

    riskLevel: Joi.string()
      .trim()
      .optional(),

    status: Joi.string()
      .trim()
      .optional(),

    cycleId: Joi.string()
      .uuid()
      .optional(),
  });
}

export default ProcurementQueryDto;