import { Contact } from "../models/contactUs.model.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const submitUserFeedback = asyncHandler(async (req, res)=>{

    const {name, email, message, subject} = req.body;

    if (!name || !email || !message || !subject) {
        throw new apiError(400, "All fields are required")
    }

    const feedback = await Contact.create({
        name: name,
        email: email,
        message: message,
        subject: subject,
        ipAddress: req.headers["x-forward-by"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"]
    });

    res.status(200).json( new apiResponse(200, feedback, "User feedback Submitted"));
});

export {
    submitUserFeedback
}