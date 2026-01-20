import { apiError } from "../utils/ApiError.js"

const authorizeRoles = (...allowedRoles)=>{
    return async(req, res, next)=>{
        if (!allowedRoles.includes(req.user.role)) {
            throw new apiError(404, "Page Not Found")
        }
        next();
    }
}

export default authorizeRoles;