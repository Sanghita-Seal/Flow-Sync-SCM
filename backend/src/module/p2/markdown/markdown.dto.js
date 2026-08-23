import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class MarkdownQueryDto extends BaseDto {
  static schema = Joi.object({
    sku: Joi.string()
      .trim()
      .optional(),

    week: Joi.string()
      .trim()
      .pattern(/^W\d+$/)
      .optional(),
  });
}

export default MarkdownQueryDto;