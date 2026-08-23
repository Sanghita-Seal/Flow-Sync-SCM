import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class InventoryQueryDto extends BaseDto {
  static schema = Joi.object({
    sku: Joi.string()
      .trim()
      .optional(),
  });
}

export default InventoryQueryDto;