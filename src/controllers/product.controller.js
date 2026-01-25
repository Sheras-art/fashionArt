import { asyncHandler } from "../utils/AsyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createProduct = asyncHandler(async (req, res) => {

    // product create todo's

    // get product details from req.body
    // validate product details
    // check if product already exists
    // check product images
    // upload images to cloudinary
    // save product to database
    // send response


    const { title, category, price, description, stock } = req.body;

    const ownerInDB = User.findOne({
        _id: req.user._id,
        role: { $in: ["owner", "admin"] }
    });

    if (!ownerInDB) {
        throw new apiError(400, "Only Owner and Admin can create Product")
    }

    if (!title || !category || !description) {
        throw new apiError(400, "All fields are required");
    }

    if (price === undefined || stock === undefined || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        throw new apiError(400, "Price and Stock must be valid non-negative numbers");
    }

    const existingProduct = await Product.findOne({ title, category });
    if (existingProduct) {
        throw new apiError(409, "Product already exists");
    }

    // check product images

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    const imagesLocalPath = req.files?.images?.map((file) => file?.path);

    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image is required");
    }

    if (!imagesLocalPath || imagesLocalPath.length === 0) {
        throw new apiError(400, "At least one product image is required");
    }

    // upload images to cloudinary

    const coverImageOnCloudinary = await uploadOnCloudinary(coverImageLocalPath);

    const imagesOnCloudinary = await Promise.all(
        imagesLocalPath?.map(async (imagePath) => {
            return await uploadOnCloudinary(imagePath);
        })
    );

    const imagesURLs = imagesOnCloudinary.map((img) => img?.url);

    // check the req sender is owner in db or not

    const product = await Product.create({
        title,
        category,
        price,
        description,
        stock,
        images: imagesURLs,
        coverImage: coverImageOnCloudinary?.url,
        owner: req.user._id
    });

    res.status(201).json(new apiResponse(201, { product }, "Product created successfully"));
    console.log(product, "Product Created Successfully");


});

const updateProduct = asyncHandler(async (req, res) => {
    // product update todo's

    // get product id from req.params
    // get product details from req.body
    // validate product details
    // check if product exists
    // update product in database
    // send response

    const { id } = req.params;
    const { title, category, description, stock, price } = req.body;

    if (!["admin", "owner"].includes(req.user.role)) {
        throw new apiError(403, "Only admin and owner can update products");
    }

    if ([title, category, description, stock, price].some((field) => field?.toString() === "" || field === undefined)) {
        throw new apiError(400, "Every fields cannot be empty");
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
        throw new apiError(404, "Product not found");
    }

    const coverImageLocalPath = req.files?.coverImage?.[0].path;
    const imagesLocalPath = req.files?.images?.map((file) => file?.path);

    // upload new images to cloudinary if provided
    if (coverImageLocalPath) {
        var coverImageOnCloudinary = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (imagesLocalPath) {
        const imagesOnCloudinary = await Promise.all(
            imagesLocalPath?.map(async (imagePath) => {
                return await uploadOnCloudinary(imagePath)
            })
        )
        var imagesURLs = imagesOnCloudinary.map((img) => img?.url);
    }

    const updateProduct = await Product.findByIdAndUpdate(existingProduct._id, {
        title: title || existingProduct.title,
        category: category || existingProduct.category,
        description: description || existingProduct.description,
        stock: stock !== undefined ? stock : existingProduct.stock,
        price: price !== undefined ? price : existingProduct.price,
        coverImage: coverImageOnCloudinary ? coverImageOnCloudinary.url : existingProduct.coverImage,
        images: imagesURLs || existingProduct.images
    }, { new: true });

    await updateProduct.save({
        validateBeforeSave: true
    });

    res.status(200).json(new apiResponse(200, { product: updateProduct }, "Product updated successfully"));

    console.log(updateProduct, "Product Updated Successfully");

});

const deleteProduct = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!productId) {
        throw new apiError(400, "Product Id Required");
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new apiError(400, "InValid Product Id")
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
        throw new apiError(400, "Product not exist or already deleted")
    }

    res.status(200)
        .json(new apiResponse(200, { product }, "Product Deleted Successfully"))

    console.log(product, "Product Deleted Successfully");

});

const getProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments();

    res.status(200)
        .json(new apiResponse(200, {
            products,
            totalProducts,
            currentPage: page
        }, "Products Fetched Successfully"))
});


export { createProduct, updateProduct, deleteProduct, getProducts };