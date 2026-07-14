import { Cart } from "../models/cart.model.js";
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


    if (!req.user) {
        throw new apiError(401, "User not authenticated");
    }

    const userId = req.user._id;
    const { items, type, paymentMethod, shippingAddress } = req.body;
    console.log(type);

    if (!type || !paymentMethod || !shippingAddress) {
        throw new apiError(400, "Missing required fields");
    }
    if (type !== "cart" && type !== "buyNow") {
        throw new apiError(400, "Invalid type value");
    }
    if (type === "buyNow" && (!items || items.length === 0)) {
        throw new apiError(400, "Order items are required");
    }

    console.log(type);

    if (type === "buyNow") {
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);

                if (!product) {
                    throw new apiError(404, "Product not found!")
                }
                if (product.stock < item.quantity) {
                    throw new apiError(400, "Insufficient product stock");
                }

                if (product.isActive === false) {
                    throw new apiError(400, "Product is not active");
                }

                return {
                    product: product,
                    quantity: item.quantity
                }
            })
        )

        const order = await Order.create({
            user: userId,
            items: orderItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
                title: item.product.title,
                coverImage: item.product.coverImage,
                category: item.product.category,
            })),

            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,

            totalAmount: orderItems.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            )
        });

        if (!order) {
            throw new apiError(500, "Failed to create order");
        }

        await Promise.all(
            orderItems.map((item) => (
                Product.findByIdAndUpdate(
                    item.product._id,
                    {
                        $inc: { stock: -item.quantity }
                    }
                ))
            )
        )

        return res.status(201).json(new apiResponse(201, order, "Order created successfully"));

    } else if (type === "cart") {
        // Handle cart checkout logic here
        // get order details from req.body
        // validate inputs and make sure all required data is in req.body
        // get user cart from db by user id
        // get all essential details from cart and create order


        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            throw new apiError(404, "Cart not found");
        }
        if (cart.products.length === 0) {
            throw new apiError(400, "Cart is empty")
        }

        for (const item of cart.products) {

            if (!item.product) {
                throw new apiError(
                    404,
                    "Some products in your cart no longer exist"
                );
            }

            if (item.product.stock < item.quantity) {
                throw new apiError(400, `${item.product.title} has insufficient stock`);
            }

            if (item.product.isActive === false) {
                throw new apiError(
                    400,
                    `${item.product.title} is not available`
                );
            }
        }

        const order = await Order.create({
            user: userId,
            items: cart.products.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
                title: item.product.title,
                coverImage: item.product.coverImage,
                category: item.product.category
            })),
            totalAmount: cart.products.reduce((acc, item) => (
                acc + item.product.price * item.quantity
            ), 0),
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
        });

        if (!order) {
            throw new apiError(500, "Failed to create order");
        }

        // revising the stock after successfull order creation
        await Promise.all(
            cart.products.map((item) => (
                Product.findByIdAndUpdate(
                    item.product._id,
                    {
                        $inc: { stock: -item.quantity }
                    }
                )
            ))
        )

        // removing the specific products(which comes from frontend) from cart

        await Cart.findOneAndUpdate({ user: userId },
            {
                $pull: {
                    products: { product: { $in: cart.products.map(item => item.product._id) } }
                }
            }
        )

        res.status(201).json(new apiResponse(201, order, "Order created successfully✅"));

    } else {
        throw new apiError(400, "invalid checkout type!")
    }
});

export {
    createOrder
}