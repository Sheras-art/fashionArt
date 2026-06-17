import { apiError } from "../utils/ApiError.js";
import { contactValidationSchema } from "../validations/contact.validation.js"


export const validateContact = (req, res, next)=>{

    const result = contactValidationSchema.safeParse(req.body);

    if (!result.success) {
        throw new apiError(
            400,
            "Invalid contact information",
            result.error.issues
        )
    }

    next();
}