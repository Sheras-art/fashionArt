import rateLimit from "express-rate-limit";

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many requests. Try again later."
    }
})

export default contactLimiter;