import { apiError } from "../utils/ApiError.js";
import { registerUserValidation } from "../validations/registerUserValidation.js"

const validateRegisterUser = (req, res, next) => {
    const result = registerUserValidation.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json(new apiError(400, "Validation failed", result.error.issues));
    }

    next();
}

export default validateRegisterUser;