import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    normalizedCollectionName: {
        type: String,
        required: true,
        unique: true
    },
    coverImage: {
        type: String,
        required: true
    }
}, {timestamps: true});

export const Collections = mongoose.model("Collection", collectionSchema);