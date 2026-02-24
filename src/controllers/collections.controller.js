import mongoose from "mongoose";
import { Collections } from "../models/collections.model.js";
import { Product } from "../models/product.model.js";
import { apiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import normalizeString from "../utils/normalizeString.js";
import StringIntoTitleCase from "../utils/StringIntoTitleCase.js";

const createCollection = asyncHandler(async (req, res) => {
    let { name } = req.body;
    const coverImage = req.file?.path;

    if (!coverImage) {
        throw new apiError(400, "Collection coverImage required")
    }

    name = StringIntoTitleCase(name);

    // uploading images on cloudinary

    const uploadCoverImageOnCloudinary = await uploadOnCloudinary(coverImage);

    if (!uploadCoverImageOnCloudinary) {
        throw new apiError(400, "Image not uploaded on cloudinary")
    }

    const collection = await Collections.create({
        name: name,
        normalizedCollectionName: normalizeString(name),
        coverImage: uploadCoverImageOnCloudinary.url
    }
    );

    if (!collection) {
        throw new apiError(400, "Collection not created")
    }

    res.status(200)
        .json(new apiResponse(200, { collection }, "Collection created successfully"))

});

const getAllCollections = asyncHandler(async (req, res) => {
    const collections = await Collections.find();

    const collectionProductCount = await Promise.all(
        collections.map(async (collection) => {
            const count = await Product.countDocuments({
                normalizedCategory: { $in: [collection.normalizedCollectionName] }
            });
            return {
                ...collection._doc,
                count
            }
        })
    )
    console.log(collectionProductCount);
    res.status(200)
        .json(new apiResponse(200, {
            collections,
            totalCollections: collections.length,
            collectionsData: collectionProductCount
        },
            "Collections fetched successfully"
        ));
});

const deleteCollection = asyncHandler(async(req, res)=>{
    const collectionId = req.params.id;

    if (!collectionId) {
        throw new apiError(400, "Collection id required")
    }

    if (!mongoose.Types.ObjectId.isValid(collectionId) ) {
        throw new apiError(400, "Collection id not correct")
    }

    const deletedCollection = await Collections.findByIdAndDelete({_id: collectionId});

    if (!deletedCollection) {
        throw new apiError(400, "Collection already deleted")
    }

    res.status(200)
    .json(new apiResponse(200, {deletedCollection}, "Collection successfully deleted"))
});

export {
    createCollection,
    getAllCollections,
    deleteCollection
}