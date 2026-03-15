import { Router } from "express";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
import authorizeRoles from "../middlerwares/authorizeRoles.js";
import { addToCart, getFullCart, removeFromCart } from "../controllers/cart.controller.js";

const cartRouter  = Router();

cartRouter.route("/add-to-cart/:productId").post(verifyJWT, addToCart);
cartRouter.route("/remove-from-cart/:productId").post(verifyJWT, removeFromCart);
cartRouter.route("/get-full-cart").get(verifyJWT, getFullCart);

export default cartRouter;