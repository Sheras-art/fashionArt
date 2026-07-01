import { ca } from "zod/locales";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createOrder = asyncHandler(async (req, res) => {
    // get order shipping address & payment method & checkout Method from req.body
    // validate inputs and make sure all required data is in req.body
    // check which checkout method is used ( cart or buyNow)
    // if buy now fetch the cart and create an order
    // if from buyNow then take the product id and search for product in db and create order
    // send response to fornt end with important details like created order deatils to frontend

    const { type, paymentMethod, shippingAddress, productId, quantity } = req.body;

    if (!type || !paymentMethod || !shippingAddress) {
        throw new apiError(400, "Missing required fields");
    }
    if (type !== "cart" && type !== "buyNow") {
        throw new apiError(400, "Invalid type value");
    }

    if (type === "buyNow") {
        const product = await Product.findById(productId);

        if (!product) {
            throw new apiError(404, "Product not found");
        }

        if (product.stock < quantity) {
            throw new apiError(400, "Insufficient product stock");
        }

        if (product.isActive === false) {
            throw new apiError(400, "Product is not active");
        }

        const order = await Order.create({
            user: req.user._id,
            items: [{
                product: productId,
                quantity: Number(quantity),
                price: Number(product.price),
                title: product.title,
                coverImage: product.coverImage,
                category: product.category,
            }],
            shippingAddress: shippingAddress._id,
            paymentMethod: paymentMethod,
            totalAmount: Number(product.price * quantity),
        });

        if (!order) {
            throw new apiError(500, "Failed to create order");
        }

        return res.status(201).json(new apiResponse(201, order, "Order created successfully"));
    }
});

export {
    createOrder
}