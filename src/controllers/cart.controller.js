import mongoose from "mongoose";
import { apiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/cart.model.js";


const addToCart = asyncHandler(async (req, res) => {
    // addToCart todo's
    // take product from user
    // Validate authentication
    //  Validate productId format
    //  Validate quantity (number, ≥1)
    //  Fetch product
    //  Ensure product exists & active
    //  Validate stock availability
    //  Find or create user cart
    //  Check if item already exists in cart
    //  Increment or push item
    //  Recalculate total from DB
    //  Save atomically
    //  Return updated cart


    const { productId, quantity } = req.params;
    const requestedQuantity = Number(quantity) || 1;

    if (!productId) {
        throw new apiError(400, "Product required")
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new apiError(400, "Invalid productId");
    }
    if (isNaN(requestedQuantity) || requestedQuantity < 1) {
        throw new apiError(400, "Quantity must be a number ≥ 1")
    }

    const fetchingProduct = await Product.findOne({ _id: productId, isActive: true });

    if (!fetchingProduct) {
        throw new apiError(400, "Product not exist or not active")
    }
    if (requestedQuantity > fetchingProduct.stock) {
        throw new apiError(400, "Insufficient stock")
    }

    const existingUserCart = await Cart.findOne({ user: req.user._id });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (existingUserCart) {
            // checking if product already exist
            const itmIndex = existingUserCart.products.findIndex((item) => item.product.toString() === fetchingProduct._id.toString());

            // appling increment updating quantity here
            let updatedItm;
            if (itmIndex > -1) {
                const newQuantity = existingUserCart.products[itmIndex].quantity += requestedQuantity;
                if (newQuantity > fetchingProduct.stock) {
                    throw new apiError(400, "Insufficient stock")
                }
                existingUserCart.products[itmIndex].quantity = newQuantity
                updatedItm = existingUserCart.products[itmIndex]
            } else {
                // push new product into existing cart
                updatedItm = {
                    product: fetchingProduct._id,
                    quantity: requestedQuantity,
                    price: fetchingProduct.price
                }
                existingUserCart.products.push(updatedItm);
            }
            existingUserCart.totalAmount = existingUserCart.products.reduce((total, item) => total + item.price * item.quantity, 0);

            await existingUserCart.save({ session });
            await session.commitTransaction();
            return res.status(200)
                .json(new apiResponse(200, { 
                    CartItemUpdated: updatedItm, 
                    Cart: existingUserCart 
                }, "Product Added to cart successfully"));
        }
        const creatingCart = await Cart.create([{
            user: req.user._id,
            products: [
                {
                    product: fetchingProduct._id,
                    quantity: requestedQuantity,
                    price: fetchingProduct.price

                }
            ],
            totalAmount: requestedQuantity * fetchingProduct.price
        }], { session });

        await session.commitTransaction();

        return res.status(200)
            .json(new apiResponse(200, { Cart: creatingCart[0] }, "Product Added to cart successfully"));
    } catch (err) {
        await session.abortTransaction();
        throw err
    } finally {
        session.endSession();
    }
});

const getFullCart = asyncHandler(async(req, res)=>{
    const user = req.user._id;

    const cart = await Cart.find();    

    if (cart[0].user.toString() !== user.toString()) {
        throw new apiError(400, "Inavlid request")
    }

    res.status(200)
    .json(new apiResponse(200, {Cart: cart[0]}, "Cart fetched successfully"))

});

export {
    addToCart,
    getFullCart
}