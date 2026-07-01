import { apiError } from "../utils/ApiError.js";
import orderValidationSchema from "../validations/orderValidation.js";

export const validateOrder = (req, res, next) => {    

    const result = orderValidationSchema.safeParse(req.body);
    
    if (!result.success) {
        return res.status(400).json(new apiError(400, "Validation failed", result.error.issues)
        );
    }
    
    next();
}

