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
import productRouter  from "./routes/product.route.js";
import collectionsRoutes  from "./routes/collections.route.js";
import cartRouter from "./routes/cart.route.js";
import notificationsRouter from "./routes/notifications.route.js";

// Routes Declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/collections", collectionsRoutes);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/notifications", notificationsRouter);

export { app };