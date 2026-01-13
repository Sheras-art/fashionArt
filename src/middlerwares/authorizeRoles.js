import { apiError } from "../utils/ApiError"

export const authorizeRoles = async(...allowedRoles)=>{
    return (req, res, next)=>{
        if (!allowedRoles.includes(req.user.role)) {
            throw new apiError(404, "Page Not Found")
        }
        next();
    }
}