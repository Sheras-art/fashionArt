import { Router } from "express";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
import { upload } from "../middlerwares/multer.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import authorizeRoles from "../middlerwares/authorizeRoles.js";

const productRouter = Router();

// Product routes can be defined here

// secured routes for product can be added here

productRouter.route("/").get(verifyJWT, authorizeRoles("owner", "admin"), getProducts);

productRouter.route("/create-product").post(verifyJWT, authorizeRoles("admin", "owner"), upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]), createProduct);

productRouter.route("/update-product/:id").post(verifyJWT, authorizeRoles("admin", "owner"), upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]), updateProduct);

productRouter.route("/delete-product/:productId").delete(verifyJWT, authorizeRoles("admin", "owner"), deleteProduct);

export { productRouter };