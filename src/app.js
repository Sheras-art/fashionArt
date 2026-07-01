import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes

import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import collectionsRoutes from "./routes/collections.route.js";
import cartRouter from "./routes/cart.route.js";
import notificationsRouter from "./routes/notifications.route.js";
import contactRouter from "./routes/contactUs.route.js";
import orderRouter from "./routes/order.route.js";

// Routes Declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/collections", collectionsRoutes);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/contactus", contactRouter);
app.use("/api/v1/order", orderRouter);

// Gloabal Error MiddleWare

app.use((err, req, res, next) => {

    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors,
        data: null
    })
    console.log(err.message, err.errors);
    next();
})
export { app };