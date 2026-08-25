import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class DemandQueryDto extends BaseDto {
    static schema = Joi.object({
        sku: Joi.string().trim().optional(),
        week: Joi.string().trim().pattern(/^W\d+$/).optional(),
    });
}

export default DemandQueryDto;

//We are allowing
/*
/api/demand
/api/demand?sku=SKU001
/api/demand?week=W3
/api/demand?sku=SKU001&week=W3

rejects  week=ABC
*/