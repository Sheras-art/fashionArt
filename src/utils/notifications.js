import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "./AsyncHandler.js";

const sendNotifications = asyncHandler(async ({
    userId,
    title,
    message,
    type,
    priority,
    relatedOrder,
    relatedProduct,
    expiresAt
}) => {
    if (!userId) return null;

    const notification = await Notification.create({
        user: userId,
        title: title,
        message: message,
        type: type,
        priority: priority,
        relatedOrder: relatedOrder ? relatedOrder : null,
        relatedProduct: relatedProduct ? relatedProduct : null,
        expiresAt: expiresAt
    });

    return notification;
});

const getAllNotifications = asyncHandler(async ({ req, res }) => {
    const { title, message, type, priority, relatedOrder, relatedProduct, expiresAt } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
});

export {
    sendNotifications,
    getAllNotifications
}