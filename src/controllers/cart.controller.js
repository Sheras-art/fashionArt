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
    
    const { productId } = req.params;
    const delta = Number(req.body?.delta) || 1; // +1 or -1

    // --- Basic validations ---
    if (!productId) throw new apiError(400, "Product required");
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new apiError(400, "Invalid productId");
    if (isNaN(delta) || delta === 0) throw new apiError(400, "Delta must be non-zero");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- Fetch product inside transaction ---
        const product = await Product.findOne({ _id: productId, isActive: true }).session(session);
        if (!product) throw new apiError(400, "Product not exist or not active");

        // --- Fetch user's cart ---
        let cart = await Cart.findOne({ user: req.user._id }).populate('products.product').session(session);

        // --- If cart exists ---
        if (cart) {
            const itemIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            let updatedItem;

            if (itemIndex > -1) {
                // --- Existing item: calculate new quantity ---
                const currentQty = cart.products[itemIndex].quantity;
                const newQty = currentQty + delta;

                if (newQty < 1) throw new apiError(400, "Quantity cannot be less than 1");
                if (newQty > product.stock) throw new apiError(400, "Insufficient stock");

                cart.products[itemIndex].quantity = newQty;
                updatedItem = cart.products[itemIndex];
            } else {
                // --- New item: push into cart ---
                if (delta < 1) throw new apiError(400, "Cannot add negative quantity for new item");
                updatedItem = {
                    product: product._id,
                    quantity: delta,
                    price: product.price
                };
                cart.products.push(updatedItem);
            }

            // --- Recalculate total amount ---
            cart.totalAmount = cart.products.reduce((total, i) => total + i.price * i.quantity, 0);

            // --- Save cart atomically ---
            await cart.save({ session });
            await session.commitTransaction();

            return res.status(200).json(new apiResponse(200, {
                CartItemUpdated: updatedItem,
                cart: cart
            }, "Cart updated successfully"));
        }
        
        // --- No cart exists: create new cart ---
        if (delta < 1) throw new apiError(400, "Cannot add negative quantity for new cart");

        const newCart = await Cart.create([{
            user: req.user._id,
            products: [{
                product: product._id,
                quantity: delta,
                price: product.price
            }],
            totalAmount: delta * product.price
        }], { session });

        await session.commitTransaction();

        return res.status(200).json(new apiResponse(200, {
            cart: newCart[0]
        }, "Product added to new cart successfully"));

    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
});

const removeFromCart = asyncHandler(async(req, res)=>{
    const {productId} = req.params;

    if (!productId) {
        throw new apiError(400, "Product id required")
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new apiError(400, "Product id not valid")
    }

    const product = await Cart.findOneAndUpdate(
        {user: req.user._id},
        {
            $pull: {products: { product: productId}}
        },
        {new: true}
    );

    if (!product) {
        throw new apiError(400, "Cart not exist")
    }

    const cart = await Cart.findOne({user: req.user._id});

    const updatedTotalAmount = cart.products.reduce((prev, item)=>{
        return prev + item.price * item.quantity
    }, 0)

    cart.totalAmount = updatedTotalAmount

    await cart.save()

    res.status(200)
    .json(new apiResponse(200, {product}, "Product Deleted Successfully"))

    console.log(product);
})

const getFullCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'products.product',
            // select: 'title coverImage price category stock'
        });

    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    res.status(200)
        .json(new apiResponse(200, { cart }, "Cart fetched successfully"))

});

export {
    addToCart,
    getFullCart,
    removeFromCart
}