import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";
import { validateOrder } from "../middlerwares/validateOrder.js";
import orderValidationSchema from "../validations/orderValidation.js";
import { verifyJWT } from "../middlerwares/auth.middleware.js";

const orderRouter = Router();

orderRouter.route("/create-order").post(verifyJWT, validateOrder, createOrder);

export default orderRouter;