import { apiError } from "../utils/ApiError.js";
import { changePasswordSchema } from "../validations/changePasswordValidation.js";


export const validateChangePassword = (req, res, next) => {
    const result = changePasswordSchema.safeParse(req.body);

    if (!result.success) {
        throw new apiError(400, "Inavild change password details", result.error.issues)
    }
}