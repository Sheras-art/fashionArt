import { Router } from "express";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
import { upload } from "../middlerwares/multer.js";
import { 
    createProduct, 
    deleteProduct, 
    getProductById, 
    getProductsByPagination, 
    getProductsByCategory, 
    updateProduct, 
    searchProducts, 
    getNewArrivals, 
    getProductsByFilters,
    getLowStockProducts,
    getBestSellers,
    getProductStats,
    toggleProductVisibility,
    getRelatedProducts} from "../controllers/product.controller.js";
import authorizeRoles from "../middlerwares/authorizeRoles.js";

const productRouter = Router();

// Products routes can be defined here

productRouter.route("/search-products").get(searchProducts);
productRouter.route("/get-products-by-filters").get(getProductsByFilters);
productRouter.route("/get-products-by-pagination").get(getProductsByPagination);
productRouter.route("/get-single-product/:productId").get(getProductById);
productRouter.route("/get-products-by-category/:category").get(getProductsByCategory);
productRouter.route("/get-new-arrivals").get(getNewArrivals);
productRouter.route("/get-best-sellers").get(getBestSellers);
productRouter.route("/get-related-products/:id").get(getRelatedProducts);

// secured routes for products can be added here

productRouter.route("/add-product").post(verifyJWT, authorizeRoles("owner", "admin"), upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]), createProduct);

productRouter.route("/update-product/:id").post(verifyJWT, authorizeRoles("owner", "admin"), upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]), updateProduct);

productRouter.route("/delete-product/:productId").delete(verifyJWT, authorizeRoles("owner", "admin"), deleteProduct);
productRouter.route("/get-lower-stock-products").get(verifyJWT, authorizeRoles("owner", "admin"), getLowStockProducts);
productRouter.route("/get-product-stats/:id").get(verifyJWT, authorizeRoles("owner", "admin"), getProductStats);
productRouter.route("/toggle-product-visibility/:id").post(verifyJWT, authorizeRoles("owner", "admin"), toggleProductVisibility);

export default productRouter;